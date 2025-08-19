// Simple ICD-11 Service using ChatGPT
// This provides a much simpler alternative to the complex WHO API integration

import { logger } from './logger'

export interface SimpleICD11Code {
  code: string
  title: string
  description?: string
  confidence: 'high' | 'medium' | 'low'
}

export interface SimpleICD11Result {
  primary: SimpleICD11Code[]
  secondary: SimpleICD11Code[]
  suggestions: SimpleICD11Code[]
  processingTime: number
  lastUpdated: string
}

class SimpleICD11Service {
  private openaiApiKey: string | undefined

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
  }

  /**
   * Generate ICD-11 codes using ChatGPT
   */
  async generateICD11Codes(
    diagnosis?: string,
    symptoms?: string,
    chiefComplaint?: string,
    assessment?: string
  ): Promise<SimpleICD11Result> {
    const startTime = Date.now()

    try {
      // Check if OpenAI API is available
      if (!this.openaiApiKey) {
        // OpenAI API key not configured. Using fallback ICD-11 codes.
        return this.getFallbackCodes(diagnosis, symptoms, chiefComplaint, assessment)
      }

      // Combine all medical text
      const medicalText = [diagnosis, symptoms, chiefComplaint, assessment]
        .filter(Boolean)
        .join('. ')

      if (!medicalText.trim()) {
        return {
          primary: [],
          secondary: [],
          suggestions: [],
          processingTime: Date.now() - startTime,
          lastUpdated: new Date().toISOString()
        }
      }

      // Create prompt for ChatGPT
      const prompt = `Based on the following medical information, provide the most relevant ICD-11 codes:

Medical Information:
${medicalText}

Please provide ICD-11 codes in the following JSON format:
{
  "primary": [
    {
      "code": "ICD-11 code",
      "title": "Official condition title",
      "description": "Brief description",
      "confidence": "high"
    }
  ],
  "secondary": [
    {
      "code": "ICD-11 code", 
      "title": "Official condition title",
      "description": "Brief description", 
      "confidence": "medium"
    }
  ],
  "suggestions": [
    {
      "code": "ICD-11 code",
      "title": "Official condition title", 
      "description": "Brief description",
      "confidence": "low"
    }
  ]
}

Provide 1-3 primary codes (most relevant), 2-4 secondary codes (related conditions), and 2-3 suggestions (potential codes). Use actual ICD-11 codes and official condition titles.`

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a medical coding expert. Provide accurate ICD-11 codes based on medical descriptions. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response content from OpenAI')
      }

      // Parse the JSON response
      let parsedCodes
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedCodes = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        // Failed to parse OpenAI response
        return this.getFallbackCodes(diagnosis, symptoms, chiefComplaint, assessment)
      }

      // Validate and structure the response
      const result: SimpleICD11Result = {
        primary: this.validateCodes(parsedCodes.primary || []),
        secondary: this.validateCodes(parsedCodes.secondary || []),
        suggestions: this.validateCodes(parsedCodes.suggestions || []),
        processingTime: Date.now() - startTime,
        lastUpdated: new Date().toISOString()
      }

      // Simple ICD-11 codes generated successfully

      return result

    } catch (error) {
      // Error generating simple ICD-11 codes
      return this.getFallbackCodes(diagnosis, symptoms, chiefComplaint, assessment)
    }
  }

  /**
   * Validate and clean ICD-11 codes
   */
  private validateCodes(codes: any[]): SimpleICD11Code[] {
    return codes
      .filter(code => code && typeof code === 'object')
      .map(code => ({
        code: code.code || 'Unknown',
        title: code.title || 'Unknown condition',
        description: code.description || '',
        confidence: ['high', 'medium', 'low'].includes(code.confidence) 
          ? code.confidence as 'high' | 'medium' | 'low' 
          : 'medium'
      }))
      .slice(0, 5) // Limit to 5 codes per category
  }

  /**
   * Fallback codes when API is not available
   */
  private getFallbackCodes(
    diagnosis?: string,
    symptoms?: string,
    chiefComplaint?: string,
    assessment?: string
  ): SimpleICD11Result {
    const medicalText = [diagnosis, symptoms, chiefComplaint, assessment]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    // Simple keyword-based fallback codes
    const fallbackCodes: SimpleICD11Code[] = []

    if (medicalText.includes('fever') || medicalText.includes('temperature')) {
      fallbackCodes.push({
        code: 'MG26',
        title: 'Fever',
        description: 'Elevated body temperature',
        confidence: 'medium'
      })
    }

    if (medicalText.includes('headache') || medicalText.includes('head pain')) {
      fallbackCodes.push({
        code: '8A80',
        title: 'Headache',
        description: 'Pain in the head',
        confidence: 'medium'
      })
    }

    if (medicalText.includes('cough') || medicalText.includes('respiratory')) {
      fallbackCodes.push({
        code: 'MD11',
        title: 'Cough',
        description: 'Sudden expulsion of air from the lungs',
        confidence: 'medium'
      })
    }

    if (medicalText.includes('diarrhea') || medicalText.includes('diarrhoea')) {
      fallbackCodes.push({
        code: 'ME05.0',
        title: 'Diarrhea',
        description: 'Frequent loose or liquid bowel movements',
        confidence: 'medium'
      })
    }

    if (medicalText.includes('hypertension') || medicalText.includes('high blood pressure')) {
      fallbackCodes.push({
        code: 'BA00',
        title: 'Hypertension',
        description: 'Persistently high arterial blood pressure',
        confidence: 'medium'
      })
    }

    if (medicalText.includes('diabetes')) {
      fallbackCodes.push({
        code: '5A10',
        title: 'Diabetes mellitus',
        description: 'Chronic metabolic disorder',
        confidence: 'medium'
      })
    }

    return {
      primary: fallbackCodes.slice(0, 2),
      secondary: fallbackCodes.slice(2, 4),
      suggestions: fallbackCodes.slice(4),
      processingTime: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Check if the service is available
   */
  async getServiceStatus(): Promise<{
    available: boolean
    authenticated: boolean
    error?: string
  }> {
    try {
      if (!this.openaiApiKey) {
        return {
          available: false,
          authenticated: false,
          error: 'OpenAI API key not configured'
        }
      }

      // Test the API with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      })

      return {
        available: response.ok,
        authenticated: response.ok,
        error: response.ok ? undefined : `API test failed: ${response.status}`
      }
    } catch (error) {
      return {
        available: false,
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const simpleICD11Service = new SimpleICD11Service() 