import { NextResponse } from 'next/server'
import { simpleICD11Service } from '@/lib/simple-icd11-service'
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

    logger.info('Simple ICD-11 coding request received:', {
      hasDiagnosis: !!diagnosis,
      hasSymptoms: !!symptoms,
      hasChiefComplaint: !!chiefComplaint,
      hasAssessment: !!assessment
    })

    // Get ICD-11 codes using the simple service
    const codingResult = await simpleICD11Service.generateICD11Codes(
      diagnosis,
      symptoms,
      chiefComplaint,
      assessment
    )

    logger.info('Simple ICD-11 codes generated successfully:', {
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
    logger.error('Simple ICD-11 API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate ICD-11 codes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const serviceStatus = await simpleICD11Service.getServiceStatus()
    
    return NextResponse.json({
      success: true,
      service: 'Simple ICD-11 Service (ChatGPT-based)',
      status: serviceStatus,
      features: [
        'ChatGPT-powered ICD-11 code generation',
        'Fallback keyword-based codes',
        'No complex WHO API integration required',
        'Fast and reliable processing'
      ]
    })
  } catch (error) {
    logger.error('Simple ICD-11 status check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check service status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 