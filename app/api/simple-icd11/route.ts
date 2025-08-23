import { NextResponse } from 'next/server'
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

    logger.info('WHO ICD-11 coding request received:', {
      hasDiagnosis: !!diagnosis,
      hasSymptoms: !!symptoms,
      hasChiefComplaint: !!chiefComplaint,
      hasAssessment: !!assessment,
      isConfigured: whoICD11Service.isConfigured()
    })

    // Check if WHO ICD-11 service is properly configured
    if (!whoICD11Service.isConfigured()) {
      logger.warn('WHO ICD-11 API not configured, returning empty results')
      return NextResponse.json({
        success: true,
        codes: {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: 0,
          lastUpdated: new Date().toISOString()
        },
        warning: 'WHO ICD-11 API credentials not configured. Please set WHO_ICD11_CLIENT_ID and WHO_ICD11_CLIENT_SECRET environment variables.'
      })
    }

    // Get ICD-11 codes using the WHO API service
    const codingResult = await whoICD11Service.generateICD11Codes(
      diagnosis,
      symptoms,
      chiefComplaint,
      assessment
    )

    logger.info('WHO ICD-11 codes generated successfully:', {
      primaryCount: codingResult.primary.length,
      secondaryCount: codingResult.secondary.length,
      suggestionsCount: codingResult.suggestions.length,
      processingTime: codingResult.processingTime
    })

    return NextResponse.json({
      success: true,
      codes: codingResult
    })

  } catch (error) {
    logger.error('WHO ICD-11 API error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate ICD-11 codes',
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
    const isConfigured = whoICD11Service.isConfigured()
    const canConnect = isConfigured ? await whoICD11Service.testConnection() : false
    
    return NextResponse.json({
      success: true,
      service: 'WHO ICD-11 API Service',
      status: {
        configured: isConfigured,
        connected: canConnect,
        ready: isConfigured && canConnect
      },
      features: [
        'Official WHO ICD-11 API integration',
        'Authoritative medical coding',
        'No hallucination - real ICD-11 codes only',
        'Confidence scoring and alternatives',
        'Automatic condition extraction'
      ],
      configuration: {
        clientIdSet: !!process.env.WHO_ICD11_CLIENT_ID,
        clientSecretSet: !!process.env.WHO_ICD11_CLIENT_SECRET
      }
    })
  } catch (error) {
    logger.error('WHO ICD-11 status check error:', error)
    
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