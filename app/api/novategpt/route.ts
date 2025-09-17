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

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Authorization required',
          details: 'Please log in to use NovateGPT',
          response: 'I apologize, but you need to be logged in to use this service.'
        },
        { status: 401 }
      );
    }

    const { message, conversationHistory, medicalContext } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user subscription status
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    let subscriptionStatus;
    let userId;

    try {
      const subscriptionResponse = await fetch(`${BACKEND_URL}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        subscriptionStatus = subscriptionData.data;
        userId = subscriptionData.data?.userId;
      } else {
        logger.warn('Failed to fetch subscription status:', subscriptionResponse.status);
      }
    } catch (error) {
      logger.error('Error fetching subscription status:', error);
    }

    // Check query limits (optional - only if service is available)
    let queryLimitInfo = null;
    if (userId) {
      try {
        const { NovateGPTQueryService } = await import('@/lib/services/NovateGPTQueryService');
        queryLimitInfo = await NovateGPTQueryService.checkQueryLimit(userId, subscriptionStatus);
        
        if (!queryLimitInfo.canMakeQuery) {
          const upgradeMessage = queryLimitInfo.needsUpgrade 
            ? 'You have reached your query limit for this month. Please upgrade your subscription to continue using NovateGPT.'
            : 'You have reached your query limit for this month. Your limit will reset on the first day of next month.';

          return NextResponse.json(
            {
              error: 'Query limit exceeded',
              details: upgradeMessage,
              response: `I apologize, but ${upgradeMessage}`,
              needsUpgrade: queryLimitInfo.needsUpgrade,
              upgradeUrl: '/pricing',
              queryLimitInfo: {
                queriesUsed: queryLimitInfo.queriesUsed,
                queriesLimit: queryLimitInfo.queriesLimit,
                remainingQueries: queryLimitInfo.remainingQueries,
                resetDate: queryLimitInfo.resetDate,
                subscriptionType: queryLimitInfo.subscriptionType
              }
            },
            { status: 402 } // Payment Required
          );
        }
      } catch (error) {
        logger.warn('Query limit service not available, proceeding without limits:', error);
        // Continue without query limits if service is not available
      }
    }

    const startTime = Date.now();

    logger.info('NovateGPT request received:', {
      messageLength: message.length,
      hasConversationHistory: !!conversationHistory?.length,
      hasMedicalContext: !!medicalContext,
      userId: userId || 'unknown',
      subscriptionType: subscriptionStatus?.subscriptionType || 'unknown'
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

    const tokensUsed = completion.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    logger.info('NovateGPT response generated:', {
      responseLength: aiResponse.length,
      tokensUsed,
      model: completion.model
    });

    // Save query to database if we have userId (optional)
    if (userId) {
      try {
        const { NovateGPTQueryService } = await import('@/lib/services/NovateGPTQueryService');
        await NovateGPTQueryService.createQuery({
          userId,
          organizationId: subscriptionStatus?.organizationId,
          query: message,
          response: aiResponse,
          tokensUsed,
          model: completion.model || 'gpt-4o-mini',
          processingTime,
          hasMedicalContext: !!medicalContext,
          conversationHistory,
          medicalContext
        });
      } catch (error) {
        logger.warn('Failed to save NovateGPT query (service not available):', error);
        // Don't fail the request if we can't save the query
      }
    }

    // Add medical disclaimer if response seems to contain medical advice
    const containsMedicalAdvice = /\b(diagnose|treatment|medication|therapy|prescription|clinical|patient)\b/i.test(aiResponse);
    const responseWithDisclaimer = containsMedicalAdvice 
      ? aiResponse + '\n\n⚕️ *Medical Disclaimer: This information is for healthcare professionals and should be used in conjunction with clinical judgment and established medical protocols.*'
      : aiResponse;

    // Get updated query limit info for response (optional)
    let updatedQueryLimitInfo = null;
    if (userId) {
      try {
        const { NovateGPTQueryService } = await import('@/lib/services/NovateGPTQueryService');
        updatedQueryLimitInfo = await NovateGPTQueryService.checkQueryLimit(userId, subscriptionStatus);
      } catch (error) {
        logger.warn('Failed to get updated query limit info (service not available):', error);
      }
    }

    return NextResponse.json({
      success: true,
      response: responseWithDisclaimer,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens || 0,
        hasMedicalContext: !!medicalContext,
        timestamp: new Date().toISOString(),
        processingTime
      },
      queryLimitInfo: updatedQueryLimitInfo ? {
        queriesUsed: updatedQueryLimitInfo.queriesUsed,
        queriesLimit: updatedQueryLimitInfo.queriesLimit,
        remainingQueries: updatedQueryLimitInfo.remainingQueries,
        resetDate: updatedQueryLimitInfo.resetDate,
        subscriptionType: updatedQueryLimitInfo.subscriptionType
      } : null
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