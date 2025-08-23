import { logger } from './logger'

interface GeneratedCondition {
  condition: string
  reasoning: string
  likelihood: 'High' | 'Medium' | 'Low'
}

interface LLMConditionResponse {
  conditions: GeneratedCondition[]
  processingTime: number
}

/**
 * LLM-powered medical condition generator
 * Uses AI to analyze symptoms and suggest possible medical conditions
 * These conditions are then passed to WHO ICD-11 API for official coding
 */
class LLMConditionGenerator {
  private apiKey: string
  private apiUrl = 'https://api.openai.com/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    
    if (!this.apiKey) {
      logger.warn('OpenAI API key not found. LLM condition generation will not work.')
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async generateConditions(
    symptoms?: string, 
    chiefComplaint?: string, 
    assessment?: string
  ): Promise<LLMConditionResponse> {
    const startTime = Date.now()

    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured')
    }

    // Combine all medical information
    const medicalInfo = [symptoms, chiefComplaint, assessment]
      .filter(info => info && info.trim().length > 0)
      .join('. ')

    if (!medicalInfo.trim()) {
      return {
        conditions: [],
        processingTime: Date.now() - startTime
      }
    }

    const prompt = `As a medical AI assistant, analyze the following patient symptoms and suggest exactly 3 possible medical conditions that could explain these symptoms.

Patient Information:
${medicalInfo}

Please provide your response in this exact JSON format:
{
  "conditions": [
    {
      "condition": "Most likely condition name",
      "reasoning": "Brief clinical reasoning",
      "likelihood": "High"
    },
    {
      "condition": "Second possible condition", 
      "reasoning": "Brief clinical reasoning",
      "likelihood": "Medium"
    },
    {
      "condition": "Third possible condition",
      "reasoning": "Brief clinical reasoning", 
      "likelihood": "Low"
    }
  ]
}

Requirements:
- Use standard medical terminology for condition names
- Keep condition names concise (2-4 words max)
- Order from most likely to least likely
- Provide brief but clear clinical reasoning
- Consider differential diagnosis principles
- Focus on conditions that match the symptom pattern

Return ONLY the JSON object, no other text.`

    try {
      logger.info('Generating medical conditions with LLM:', {
        medicalInfoLength: medicalInfo.length,
        hasSymptoms: !!symptoms,
        hasChiefComplaint: !!chiefComplaint,
        hasAssessment: !!assessment
      })

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant specializing in differential diagnosis. Provide accurate, evidence-based medical condition suggestions in the exact JSON format requested.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent medical responses
          max_tokens: 800
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const llmResponse = data.choices[0]?.message?.content

      if (!llmResponse) {
        throw new Error('No response from LLM')
      }

      // Parse the JSON response
      let parsedResponse
      try {
        parsedResponse = JSON.parse(llmResponse)
      } catch (error) {
        logger.error('Failed to parse LLM response as JSON:', { response: llmResponse })
        throw new Error('Invalid JSON response from LLM')
      }

      const processingTime = Date.now() - startTime

      logger.info('LLM condition generation successful:', {
        conditionCount: parsedResponse.conditions?.length || 0,
        processingTime,
        conditions: parsedResponse.conditions?.map((c: any) => c.condition) || []
      })

      return {
        conditions: parsedResponse.conditions || [],
        processingTime
      }

    } catch (error) {
      logger.error('LLM condition generation failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const llmConditionGenerator = new LLMConditionGenerator()