import { NextResponse } from 'next/server'
import { llmConditionGenerator } from '@/lib/llm-condition-generator'
import { whoICD11Service } from '@/lib/who-icd11-service'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { diagnosis, symptoms, chiefComplaint, assessment } = await request.json()

    // Validate input
    if (!diagnosis && !symptoms && !chiefComplaint && !assessment) {
      return NextResponse.json(
        { 
          error: 'At least one medical text field (diagnosis, symptoms, chiefComplaint, or assessment) is required' 
        },
        { status: 400 }
      )
    }

    logger.info('LLM + WHO ICD-11 coding request received:', {
      hasDiagnosis: !!diagnosis,
      hasSymptoms: !!symptoms,
      hasChiefComplaint: !!chiefComplaint,
      hasAssessment: !!assessment,
      isLLMConfigured: llmConditionGenerator.isConfigured(),
      isWHOConfigured: whoICD11Service.isConfigured()
    })

    // Check if services are properly configured
    if (!llmConditionGenerator.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API not configured. Please set OPENAI_API_KEY environment variable.',
        codes: {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: 0,
          lastUpdated: new Date().toISOString()
        }
      })
    }

    if (!whoICD11Service.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'WHO ICD-11 API not configured. Please set WHO_ICD11_CLIENT_ID and WHO_ICD11_CLIENT_SECRET environment variables.',
        codes: {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: 0,
          lastUpdated: new Date().toISOString()
        }
      })
    }

    const totalStartTime = Date.now()

    // Step 1: Generate possible conditions using LLM
    logger.info('Step 1: Generating conditions with LLM...')
    const llmResponse = await llmConditionGenerator.generateConditions(
      symptoms,
      chiefComplaint,
      assessment
    )

    if (!llmResponse.conditions || llmResponse.conditions.length === 0) {
      return NextResponse.json({
        success: true,
        codes: {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: Date.now() - totalStartTime,
          lastUpdated: new Date().toISOString()
        },
        llmConditions: [],
        message: 'No conditions could be generated from the provided symptoms'
      })
    }

    // Step 2: Get ICD-11 codes for the LLM-generated conditions
    logger.info('Step 2: Getting WHO ICD-11 codes for generated conditions...')
    const conditionNames = llmResponse.conditions.map(c => c.condition)
    const icd11Response = await whoICD11Service.generateICD11CodesFromConditions(conditionNames)

    // Step 3: Combine results with LLM reasoning
    const enhancedCodes = {
      ...icd11Response,
      processingTime: Date.now() - totalStartTime
    }

    // Add LLM reasoning to each ICD code
    const addReasoningToCodes = (codes: any[]) => {
      return codes.map((code) => {
        // Find corresponding LLM condition
        const llmCondition = llmResponse.conditions.find(c => 
          c.condition.toLowerCase().includes(code.title.toLowerCase()) ||
          code.title.toLowerCase().includes(c.condition.toLowerCase())
        )
        
        return {
          ...code,
          llmReasoning: llmCondition?.reasoning || 'Generated from symptom analysis',
          llmLikelihood: llmCondition?.likelihood || 'Unknown'
        }
      })
    }

    enhancedCodes.primary = addReasoningToCodes(enhancedCodes.primary)
    enhancedCodes.secondary = addReasoningToCodes(enhancedCodes.secondary)
    enhancedCodes.suggestions = addReasoningToCodes(enhancedCodes.suggestions)

    logger.info('LLM + WHO ICD-11 coding completed successfully:', {
      llmConditionsCount: llmResponse.conditions.length,
      primaryCount: enhancedCodes.primary.length,
      secondaryCount: enhancedCodes.secondary.length,
      suggestionsCount: enhancedCodes.suggestions.length,
      totalProcessingTime: enhancedCodes.processingTime
    })

    return NextResponse.json({
      success: true,
      codes: enhancedCodes,
      llmConditions: llmResponse.conditions,
      method: 'LLM + WHO ICD-11 API'
    })

  } catch (error) {
    logger.error('LLM + WHO ICD-11 API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate ICD-11 codes using LLM',
        codes: {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const llmConfigured = llmConditionGenerator.isConfigured()
    const whoConfigured = whoICD11Service.isConfigured()
    const whoConnected = whoConfigured ? await whoICD11Service.testConnection() : false
    
    return NextResponse.json({
      success: true,
      service: 'LLM + WHO ICD-11 API Service',
      status: {
        llmConfigured: llmConfigured,
        whoConfigured: whoConfigured,
        whoConnected: whoConnected,
        ready: llmConfigured && whoConfigured && whoConnected
      },
      features: [
        'AI-powered condition generation from symptoms',
        'Official WHO ICD-11 API integration',
        'Differential diagnosis suggestions',
        'Clinical reasoning for each condition',
        'Confidence scoring and likelihood assessment',
        'User-selectable ICD codes for final notes'
      ],
      configuration: {
        openaiKeySet: !!process.env.OPENAI_API_KEY,
        whoClientIdSet: !!process.env.WHO_ICD11_CLIENT_ID,
        whoClientSecretSet: !!process.env.WHO_ICD11_CLIENT_SECRET
      }
    })
  } catch (error) {
    logger.error('LLM + WHO ICD-11 status check error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check service status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}