import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '@/lib/logger';

// Initialize OpenAI and Pinecone only if API keys are available
let openai: OpenAI | null = null;
let pinecone: Pinecone | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (process.env.PINECONE_API_KEY) {
  pinecone = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter'
  });
}

export async function POST(request: Request) {
  const { agent, input, session } = await request.json();

  try {
    // Check if required services are available
    if (!openai || !pinecone) {
      const missingServices = [];
      if (!openai) missingServices.push('OpenAI');
      if (!pinecone) missingServices.push('Pinecone');
      
      return NextResponse.json(
        { 
          error: `Service unavailable: ${missingServices.join(', ')} not configured`,
          details: 'Please configure the required API keys in environment variables'
        },
        { status: 503 }
      );
    }

    let result;
    
    switch (agent) {
      case 'A': // Voice to Text
        result = await handleAgentA(input);
        break;
      case 'B': // Text Organization
        result = await handleAgentB(input);
        break;
      case 'C': // RAG System
        result = await handleAgentC(input, session.user.country);
        break;
      case 'D': // Differential Diagnosis
        result = await handleAgentD(input);
        break;
      case 'E': // Missing Data Detection
        result = await handleAgentE(input);
        break;
      default:
        return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    logger.error('Agent processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function handleAgentA(audioInput: any) {
  if (!openai) throw new Error('OpenAI not configured');
  
  // Voice to Text using OpenAI
  const response = await openai.audio.transcriptions.create({
    file: audioInput,
    model: "whisper-1",
  });

  return response.text;
}

async function handleAgentB(textInput: string) {
  if (!openai) throw new Error('OpenAI not configured');
  
  // Text Organization using OpenAI
  const prompt = `Organize the following medical notes into a structured format:\n\n${textInput}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

async function handleAgentC(medicalNotes: any, country: string) {
  if (!openai || !pinecone) throw new Error('OpenAI or Pinecone not configured');
  
  // RAG system with country-specific guidelines
  const index = pinecone.index('medical-guidelines');
  
  // Get relevant guidelines based on country and medical notes
  const embedding = await openai.embeddings.create({
    input: JSON.stringify(medicalNotes),
    model: "text-embedding-3-large",
  });
  
  const results = await index.query({
    vector: embedding.data[0].embedding,
    filter: { country: { $eq: country } },
    topK: 5,
    includeMetadata: true,
  });
  
  return results.matches.map((match) => match.metadata ?? {});
}

async function handleAgentD(medicalNotes: string) {
  if (!openai) throw new Error('OpenAI not configured');
  
  // Differential Diagnosis using OpenAI
  const prompt = `Based on the following medical notes, provide a differential diagnosis:\n\n${medicalNotes}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

async function handleAgentE(textInput: string) {
  if (!openai) throw new Error('OpenAI not configured');
  
  // Missing Data Detection using OpenAI
  const prompt = `Review the following medical notes and identify any missing or incomplete data. Return a JSON array of missing data points:\n\n${textInput}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

// Implement other agents similarly...