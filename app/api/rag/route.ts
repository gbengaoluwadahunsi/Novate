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

    const { query, context, userId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get relevant documents from vector database
    const index = pinecone.index('medical-knowledge');
    
    const embedding = await openai.embeddings.create({
      input: query,
      model: "text-embedding-3-large",
    });
    
    const results = await index.query({
      vector: embedding.data[0].embedding,
      topK: 5,
      includeMetadata: true,
    });

    // Extract relevant context from retrieved documents
    const relevantDocs = results.matches
      .map(match => String(match.metadata?.content || ''))
      .filter(content => content.length > 0)
      .join('\n\n');

    // Generate response using RAG
    const prompt = `Based on the following medical knowledge and the user's query, provide a comprehensive and accurate response:

Medical Knowledge:
${relevantDocs}

User Query: ${query}

Context: ${context || 'No additional context provided'}

Please provide a detailed, professional response that incorporates the relevant medical knowledge while addressing the user's specific query.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Provide accurate, helpful, and professional responses based on the provided medical knowledge. Always prioritize patient safety and recommend consulting healthcare professionals when appropriate."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const answer = response.choices[0].message.content;

    // Log the interaction for monitoring
    logger.info('RAG query processed', {
      query: query.substring(0, 100) + '...',
      userId,
      responseLength: answer?.length || 0,
      sourcesCount: results.matches.length,
    });

    return NextResponse.json({
      answer,
      sources: results.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      })),
    });

  } catch (error) {
    logger.error('RAG processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process RAG query' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RAG API is running',
    status: 'healthy',
    services: {
      openai: !!openai,
      pinecone: !!pinecone,
    },
  });
}
