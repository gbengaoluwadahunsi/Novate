import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(request: Request) {
  const { agent, input, session } = await request.json();

  try {
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
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function handleAgentA(audioInput: string) {
  // Use Whisper API for speech-to-text
  const transcription = await openai.audio.transcriptions.create({
    file: audioInput,
    model: "whisper-1",
  });
  return transcription.text;
}

async function handleAgentB(textInput: string) {
  // Organize medical notes
  const prompt = `Organize this medical conversation into structured notes:\n\n${textInput}\n\nReturn in JSON format with sections: history, examination, assessment, plan.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  return JSON.parse(response.choices[0].message.content!);
}

async function handleAgentC(medicalNotes: any, country: string) {
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

async function handleAgentD(textInput: string) {
  // Differential Diagnosis using OpenAI
  const prompt = `Given the following patient information, provide a differential diagnosis list:\n\n${textInput}\n\nReturn the list as a JSON array.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  return JSON.parse(response.choices[0].message.content!);
}

async function handleAgentE(textInput: string) {
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