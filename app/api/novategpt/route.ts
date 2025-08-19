import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { logger } from '@/lib/logger';

// Initialize OpenAI
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

export async function POST(request: Request) {
  try {
    // Check if OpenAI is available
    if (!openai) {
      return NextResponse.json(
        { 
          error: 'OpenAI service not available',
          details: 'OpenAI API key not configured. Please contact administrator.',
          response: 'I apologize, but the AI service is currently not available. Please ensure the OpenAI API key is properly configured.'
        },
        { status: 503 }
      );
    }

    const { message, conversationHistory, medicalContext } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    logger.info('NovateGPT request received:', {
      messageLength: message.length,
      hasConversationHistory: !!conversationHistory?.length,
      hasMedicalContext: !!medicalContext
    });

    // Build system prompt for medical context
    const systemPrompt = `You are NovateGPT, an advanced AI medical assistant designed specifically for healthcare professionals. Your purpose is to provide accurate, evidence-based medical information, clinical decision support, and educational content.

Key Guidelines:
1. ALWAYS provide medically accurate, evidence-based information
2. Reference current medical guidelines and best practices when applicable
3. Be precise with medical terminology while remaining clear
4. If medical context is provided, tailor responses to that specific case
5. Always emphasize that your responses are for informational purposes and should not replace professional medical judgment
6. For diagnostic questions, provide differential diagnosis considerations
7. For treatment questions, mention guidelines from relevant medical organizations
8. Be concise but comprehensive in your responses
9. If uncertain about any medical information, clearly state limitations
10. Always recommend consulting with specialists when appropriate

Remember: You are assisting licensed medical professionals in their clinical decision-making process.`;

    // Build conversation messages
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add medical context if provided
    if (medicalContext?.trim()) {
      messages.push({
        role: 'system',
        content: `Medical Context for this consultation:\n${medicalContext}\n\nPlease use this context to provide relevant, case-specific responses.`
      });
    }

    // Add conversation history (limit to last 10 messages to stay within token limits)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Use GPT-4 for better medical responses
      messages: messages,
      max_tokens: 1500,
      temperature: 0.3, // Lower temperature for more consistent medical responses
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response generated from OpenAI');
    }

    logger.info('NovateGPT response generated:', {
      responseLength: aiResponse.length,
      tokensUsed: completion.usage?.total_tokens || 0,
      model: completion.model
    });

    // Add medical disclaimer if response seems to contain medical advice
    const containsMedicalAdvice = /\b(diagnose|treatment|medication|therapy|prescription|clinical|patient)\b/i.test(aiResponse);
    const responseWithDisclaimer = containsMedicalAdvice 
      ? aiResponse + '\n\n⚕️ *Medical Disclaimer: This information is for healthcare professionals and should be used in conjunction with clinical judgment and established medical protocols.*'
      : aiResponse;

    return NextResponse.json({
      success: true,
      response: responseWithDisclaimer,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens || 0,
        hasMedicalContext: !!medicalContext,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('NovateGPT API error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            response: 'I apologize, but I\'m currently experiencing high demand. Please try again in a few moments.',
            details: 'OpenAI rate limit reached'
          },
          { status: 429 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          {
            error: 'Service temporarily unavailable',
            response: 'I apologize, but the AI service is temporarily unavailable. Please try again later.',
            details: 'OpenAI quota exceeded'
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        response: 'I apologize, but I encountered an error while processing your request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Please try again later'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check NovateGPT service status
export async function GET() {
  try {
    const status = {
      service: 'NovateGPT',
      available: !!openai,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      timestamp: new Date().toISOString()
    };

    if (!openai) {
      return NextResponse.json(
        {
          ...status,
          error: 'OpenAI API key not configured'
        },
        { status: 503 }
      );
    }

    // Test OpenAI connection with a simple request
    try {
      await openai.models.list();
      return NextResponse.json({
        ...status,
        authenticated: true,
        message: 'NovateGPT service is operational'
      });
    } catch (apiError) {
      return NextResponse.json(
        {
          ...status,
          authenticated: false,
          error: 'OpenAI authentication failed'
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    logger.error('NovateGPT status check error:', error);
    
    return NextResponse.json(
      {
        service: 'NovateGPT',
        available: false,
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}