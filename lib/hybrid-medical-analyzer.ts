// Hybrid Medical Text Analysis System
// Combines rule-based reliability with optional LLM intelligence

import { AdvancedMedicalTextAnalyzer, type DiagramMatch, type MedicalAnalysis } from './advanced-medical-diagram-logic'

export interface LLMConfig {
  enabled: boolean
  apiKey?: string
  model?: 'gpt-4' | 'claude' | 'local-llm'
  endpoint?: string
  maxTokens?: number
  temperature?: number
  fallbackToRules?: boolean
}

export interface HybridAnalysisResult {
  recommendations: DiagramMatch[]
  method: 'rules' | 'llm' | 'hybrid'
  confidence: number
  reasoning?: string
  processingTime: number
}

export class HybridMedicalAnalyzer {
  private static llmConfig: LLMConfig = {
    enabled: false,
    fallbackToRules: true
  }

  static configure(config: LLMConfig) {
    this.llmConfig = { ...this.llmConfig, ...config }
  }

  /**
   * Main analysis method - uses hybrid approach
   */
  static async analyzeMedicalText(
    medicalText: string, 
    patientGender: 'male' | 'female'
  ): Promise<HybridAnalysisResult> {
    const startTime = Date.now()
    
    try {
      // Always get rule-based analysis as baseline
      const ruleBasedAnalysis = this.getRuleBasedAnalysis(medicalText, patientGender)
      
      // If LLM is not enabled, return rule-based results
      if (!this.llmConfig.enabled) {
        return {
          recommendations: ruleBasedAnalysis,
          method: 'rules',
          confidence: this.calculateRuleBasedConfidence(ruleBasedAnalysis),
          processingTime: Date.now() - startTime
        }
      }

      // For complex cases, use LLM analysis
      const complexity = this.assessTextComplexity(medicalText)
      
      if (complexity.isComplex || complexity.hasAmbiguity) {
        try {
          const llmResult = await this.getLLMAnalysis(medicalText, patientGender)
          
          // Validate LLM results against medical knowledge
          const validatedResult = this.validateAndMergeLLMResults(
            ruleBasedAnalysis, 
            llmResult,
            patientGender
          )
          
          return {
            recommendations: validatedResult.recommendations,
            method: validatedResult.method,
            confidence: validatedResult.confidence,
            reasoning: llmResult.reasoning,
            processingTime: Date.now() - startTime
          }
          
        } catch (llmError) {
          // LLM analysis failed, falling back to rules
          return {
            recommendations: ruleBasedAnalysis,
            method: 'rules',
            confidence: this.calculateRuleBasedConfidence(ruleBasedAnalysis),
            processingTime: Date.now() - startTime
          }
        }
      }

      // For simple cases, use rule-based analysis
      return {
        recommendations: ruleBasedAnalysis,
        method: 'rules', 
        confidence: this.calculateRuleBasedConfidence(ruleBasedAnalysis),
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      // Ultimate fallback
      return {
        recommendations: [{
          type: 'front',
          priority: 1,
          findings: ['general examination'],
          reason: 'Fallback view due to analysis error'
        }],
        method: 'rules',
        confidence: 0.5,
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Rule-based analysis using existing system
   */
  private static getRuleBasedAnalysis(
    medicalText: string, 
    patientGender: 'male' | 'female'
  ): DiagramMatch[] {
    const analysis = AdvancedMedicalTextAnalyzer.analyzeMedicalText(medicalText)
    return AdvancedMedicalTextAnalyzer.generateDiagramRecommendations(analysis, patientGender)
  }

  /**
   * LLM-based analysis with medical prompt engineering
   */
  private static async getLLMAnalysis(
    medicalText: string, 
    patientGender: 'male' | 'female'
  ): Promise<{
    recommendations: DiagramMatch[]
    reasoning: string
    confidence: number
  }> {
    const availableViews = [
      'front', 'back', 'leftside', 'rightside', 
      'cardiorespi', 'abdominallinguinal'
    ]

    const medicalPrompt = `
As a medical expert analyzing clinical notes, recommend anatomical diagram views for documentation.

PATIENT GENDER: ${patientGender}
AVAILABLE VIEWS: ${availableViews.join(', ')}

MEDICAL TEXT:
"${medicalText}"

ANALYSIS REQUIREMENTS:
1. Identify primary anatomical regions involved
2. Consider severity and clinical significance  
3. Account for laterality (left/right/bilateral)
4. Prioritize most relevant views (max 3)
5. Provide clear medical reasoning

RESPONSE FORMAT (JSON):
{
  "analysis": {
    "primaryRegions": ["region1", "region2"],
    "severity": "mild|moderate|high|critical",
    "laterality": "left|right|bilateral|central",
    "complexity": "simple|moderate|complex"
  },
  "recommendations": [
    {
      "type": "view_name",
      "priority": 1,
      "findings": ["finding1", "finding2"],
      "reason": "medical justification"
    }
  ],
  "reasoning": "detailed explanation of why these views were selected",
  "confidence": 0.85
}

Ensure recommendations use only available views and are medically appropriate.
`

    // Make LLM API call (implementation depends on chosen service)
    const response = await this.callLLMAPI(medicalPrompt)
    
    try {
      const parsed = JSON.parse(response)
      return {
        recommendations: this.sanitizeLLMRecommendations(parsed.recommendations, availableViews),
        reasoning: parsed.reasoning || 'LLM analysis completed',
        confidence: parsed.confidence || 0.8
      }
    } catch (parseError) {
      throw new Error(`LLM response parsing failed: ${parseError}`)
    }
  }

  /**
   * Assess text complexity to determine if LLM analysis is needed
   */
  private static assessTextComplexity(medicalText: string): {
    isComplex: boolean
    hasAmbiguity: boolean
    score: number
  } {
    const text = medicalText.toLowerCase()
    let complexityScore = 0

    // Complex indicators
    const complexityIndicators = [
      // Multi-system involvement
      { pattern: /(cardiac|heart).*(respiratory|lung|breath)/, weight: 2 },
      { pattern: /(neuro|weakness).*(pain|ache)/, weight: 2 },
      
      // Severity indicators
      { pattern: /severe|critical|emergency|acute/, weight: 1.5 },
      
      // Multiple laterality
      { pattern: /left.*right|right.*left|bilateral/, weight: 1.5 },
      
      // Multiple anatomical regions
      { pattern: /(head|face).*(chest|abdomen)/, weight: 1 },
      { pattern: /(back|spine).*(leg|arm)/, weight: 1 },
      
      // Ambiguous terms
      { pattern: /possibly|maybe|uncertain|unclear/, weight: 1 },
      
      // Long text (likely complex)
      { pattern: /.{200,}/, weight: 1 }
    ]

    complexityIndicators.forEach(indicator => {
      if (indicator.pattern.test(text)) {
        complexityScore += indicator.weight
      }
    })

    return {
      isComplex: complexityScore >= 3,
      hasAmbiguity: /possibly|maybe|uncertain|unclear/.test(text),
      score: complexityScore
    }
  }

  /**
   * Validate and merge LLM results with rule-based baseline
   */
  private static validateAndMergeLLMResults(
    ruleBasedResults: DiagramMatch[],
    llmResults: { recommendations: DiagramMatch[], confidence: number },
    patientGender: string
  ): {
    recommendations: DiagramMatch[]
    method: 'hybrid' | 'llm' | 'rules'
    confidence: number
  } {
    // If LLM confidence is very low, prefer rules
    if (llmResults.confidence < 0.6) {
      return {
        recommendations: ruleBasedResults,
        method: 'rules',
        confidence: this.calculateRuleBasedConfidence(ruleBasedResults)
      }
    }

    // Validate LLM recommendations against available views
    const validLLMResults = llmResults.recommendations.filter(rec => {
      const validViews = ['front', 'back', 'leftside', 'rightside', 'cardiorespi', 'abdominallinguinal']
      return validViews.includes(rec.type)
    })

    // If LLM results are invalid, use rules
    if (validLLMResults.length === 0) {
      return {
        recommendations: ruleBasedResults,
        method: 'rules', 
        confidence: this.calculateRuleBasedConfidence(ruleBasedResults)
      }
    }

    // High confidence LLM results with validation
    if (llmResults.confidence >= 0.8) {
      return {
        recommendations: validLLMResults,
        method: 'llm',
        confidence: llmResults.confidence
      }
    }

    // Hybrid approach: merge both results
    const hybridResults = this.mergeRecommendations(ruleBasedResults, validLLMResults)
    
    return {
      recommendations: hybridResults,
      method: 'hybrid',
      confidence: (this.calculateRuleBasedConfidence(ruleBasedResults) + llmResults.confidence) / 2
    }
  }

  /**
   * Merge rule-based and LLM recommendations intelligently
   */
  private static mergeRecommendations(
    ruleResults: DiagramMatch[],
    llmResults: DiagramMatch[]
  ): DiagramMatch[] {
    const merged = new Map<string, DiagramMatch>()

    // Add rule-based results with adjusted priority
    ruleResults.forEach(result => {
      merged.set(result.type, {
        ...result,
        priority: result.priority + 0.1 // Slight rule-based preference
      })
    })

    // Add LLM results, potentially overriding if higher confidence
    llmResults.forEach(result => {
      const existing = merged.get(result.type)
      if (!existing || result.priority < existing.priority) {
        merged.set(result.type, result)
      }
    })

    return Array.from(merged.values())
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)
  }

  /**
   * Calculate confidence for rule-based results
   */
  private static calculateRuleBasedConfidence(results: DiagramMatch[]): number {
    if (results.length === 0) return 0.3
    if (results.length === 1) return 0.7
    if (results.length === 2) return 0.8
    return 0.85 // Multiple relevant findings = high confidence
  }

  /**
   * Sanitize LLM recommendations to ensure validity
   */
  private static sanitizeLLMRecommendations(
    recommendations: any[], 
    validViews: string[]
  ): DiagramMatch[] {
    if (!Array.isArray(recommendations)) return []

    return recommendations
      .filter(rec => 
        rec && 
        typeof rec.type === 'string' && 
        validViews.includes(rec.type) &&
        typeof rec.priority === 'number' &&
        Array.isArray(rec.findings)
      )
      .map(rec => ({
        type: rec.type,
        priority: Math.max(1, Math.min(10, rec.priority)), // Clamp priority
        findings: Array.isArray(rec.findings) ? rec.findings.filter((f: unknown): f is string => typeof f === 'string').slice(0, 5) : [], // Max 5 findings
        reason: typeof rec.reason === 'string' ? rec.reason : 'LLM recommendation'
      }))
      .slice(0, 3) // Max 3 recommendations
  }

  /**
   * Call LLM API (implementation depends on chosen service)
   */
  private static async callLLMAPI(prompt: string): Promise<string> {
    // This would be implemented based on your chosen LLM service
    
    if (!this.llmConfig.apiKey) {
      throw new Error('LLM API key not configured')
    }

    // Example for OpenAI GPT-4
    if (this.llmConfig.model === 'gpt-4') {
      return this.callOpenAIAPI(prompt)
    }

    // Example for Anthropic Claude
    if (this.llmConfig.model === 'claude') {
      return this.callClaudeAPI(prompt)
    }

    // Local LLM endpoint
    if (this.llmConfig.model === 'local-llm') {
      return this.callLocalLLMAPI(prompt)
    }

    throw new Error(`Unsupported LLM model: ${this.llmConfig.model}`)
  }

  private static async callOpenAIAPI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.llmConfig.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.llmConfig.maxTokens || 1000,
        temperature: this.llmConfig.temperature || 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private static async callClaudeAPI(prompt: string): Promise<string> {
    // Implementation for Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.llmConfig.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: this.llmConfig.maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  private static async callLocalLLMAPI(prompt: string): Promise<string> {
    // Implementation for local LLM (e.g., Ollama, LM Studio)
    const response = await fetch(this.llmConfig.endpoint || 'http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2', // or your preferred local model
        prompt: prompt,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  }
}

// Example configuration
export const MEDICAL_LLM_CONFIGS = {
  // Privacy-first: No external APIs
  privacyFirst: {
    enabled: false,
    fallbackToRules: true
  },

  // Local LLM: Privacy + Intelligence
  localLLM: {
    enabled: true,
    model: 'local-llm' as const,
    endpoint: 'http://localhost:11434/api/generate',
    fallbackToRules: true
  },

  // Cloud LLM: Maximum intelligence
  cloudLLM: {
    enabled: true,
    model: 'gpt-4' as const,
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 1000,
    temperature: 0.3,
    fallbackToRules: true
  }
}
