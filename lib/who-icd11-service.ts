import { logger } from './logger'

// Types matching the existing interface
interface ICD11Code {
  code: string
  title: string
  definition?: string
  uri: string
  confidence?: number
  matchType: 'exact' | 'partial' | 'synonym' | 'related'
}

interface ICD11MedicalCodes {
  primary: ICD11Code[]
  secondary: ICD11Code[]
  suggestions: ICD11Code[]
  extractedTerms: string[]
  processingTime: number
  lastUpdated: string
}

interface SearchResult {
  code: string
  title: string
  definition: string
  uri: string
  match_score: number
}

interface CodingResults {
  extracted_conditions: string[]
  coded_conditions: Array<{
    original_text: string
    icd11_code: string
    icd11_title: string
    match_score: number
    system: string
    alternatives: SearchResult[]
  }>
  system_classification: Record<string, string>
  processing_notes: string[]
}

/**
 * WHO ICD-11 API Client for official medical coding
 * Replaces the LLM-based approach to prevent hallucination
 */
class ICD11Coder {
  private client_id: string
  private client_secret: string
  private access_token: string | null = null
  private token_expires: number | null = null
  private base_url = "https://id.who.int/icd"
  
  private linearizations = {
    'mms': 'http://id.who.int/icd/release/11/mms',  // Mortality & Morbidity Statistics
    'foundation': 'http://id.who.int/icd/release/11/foundation'
  }

  constructor() {
    this.client_id = process.env.WHO_ICD11_CLIENT_ID || ''
    this.client_secret = process.env.WHO_ICD11_CLIENT_SECRET || ''
    
    if (!this.client_id || !this.client_secret) {
      logger.warn('WHO ICD-11 API credentials not found in environment variables')
    }
  }

  async authenticate(): Promise<boolean> {
    if (!this.client_id || !this.client_secret) {
      throw new Error('WHO ICD-11 API credentials not configured')
    }

    const auth_url = "https://icdaccessmanagement.who.int/connect/token"
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    const body = new URLSearchParams({
      'client_id': this.client_id,
      'client_secret': this.client_secret,
      'scope': 'icdapi_access',
      'grant_type': 'client_credentials'
    })

    try {
      const response = await fetch(auth_url, {
        method: 'POST',
        headers: headers,
        body: body
      })

      if (!response.ok) {
        logger.error('WHO ICD-11 authentication failed:', {
          status: response.status,
          statusText: response.statusText
        })
        return false
      }
      
      const token_data = await response.json()
      this.access_token = token_data.access_token
      this.token_expires = Date.now() + (token_data.expires_in * 1000) - 60000  // Refresh 1 min early
      
      logger.info('WHO ICD-11 authentication successful')
      return true
      
    } catch (error) {
      logger.error('WHO ICD-11 authentication error:', error)
      return false
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.access_token || !this.token_expires || Date.now() >= this.token_expires) {
      const success = await this.authenticate()
      if (!success) {
        throw new Error('Failed to authenticate with WHO ICD-11 API')
      }
    }
  }

  private async makeRequest(url: string, params: Record<string, string> = {}): Promise<any> {
    await this.ensureAuthenticated()
    
    const headers = {
      'Authorization': `Bearer ${this.access_token}`,
      'Accept': 'application/json',
      'Accept-Language': 'en',
      'API-Version': 'v2'
    }

    const searchParams = new URLSearchParams(params)
    const full_url = `${url}?${searchParams}`

    try {
      const response = await fetch(full_url, { headers })
      
      if (!response.ok) {
        logger.error('WHO ICD-11 API request failed:', {
          url: full_url,
          status: response.status,
          statusText: response.statusText
        })
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      logger.error('WHO ICD-11 API request error:', error)
      throw error
    }
  }

  async searchConditions(query: string, linearization: string = 'mms'): Promise<SearchResult[]> {
    // Use the correct WHO ICD-11 Linearization API endpoint as per documentation
    // "For most users that require accessing the ICD-11 statistical classification with codes, 
    // you need to use the Linearization endpoints with the linearizationId set to mms"
    
    const releaseId = '2025-01' // Use the latest release
    const search_url = `${this.base_url}/release/11/${releaseId}/${linearization}/search`
    
    const params: Record<string, string> = {
      'q': query,
      'includeKeywordResult': 'true',
      'useFlexisearch': 'true',
      'flatResults': 'true',
      'highlightingEnabled': 'false'
    }

    try {
      logger.info(`Searching WHO ICD-11 MMS Linearization for condition: '${query}'`, { 
        searchUrl: search_url,
        params,
        releaseId: releaseId,
        linearization: linearization
      })
      
      const results = await this.makeRequest(search_url, params)
      
      logger.info('WHO MMS Linearization API response:', {
        responseKeys: Object.keys(results || {}),
        hasDestinationEntities: !!results?.destinationEntities,
        hasEntities: !!results?.entities,
        entityCount: results?.destinationEntities?.length || results?.entities?.length || 0,
        sampleEntity: results?.destinationEntities?.[0] || results?.entities?.[0],
        fullResponse: JSON.stringify(results, null, 2).substring(0, 1000) // First 1000 chars for debugging
      })
      
      const parsed_results = await this.parseSearchResults(results)
      logger.info(`WHO MMS Linearization search results for '${query}':`, {
        resultCount: parsed_results.length,
        topResults: parsed_results.slice(0, 3).map(r => ({ code: r.code, title: r.title, score: r.match_score }))
      })
      return parsed_results
    } catch (error) {
      logger.error(`MMS Linearization search failed for '${query}':`, error)
      return []
    }
  }

  private async parseSearchResults(results: any): Promise<SearchResult[]> {
    const parsed_results: SearchResult[] = []
    
    logger.info('WHO API raw response structure:', { 
      hasDestinationEntities: !!results.destinationEntities,
      hasEntities: !!results.entities,
      keys: Object.keys(results || {}),
      sampleEntity: results.destinationEntities?.[0] || results.entities?.[0]
    })
    
    // Try different possible response structures
    const entities = results.destinationEntities || results.entities || []
    
    if (entities && entities.length > 0) {
      for (const entity of entities) {
        // Extract the actual ICD-11 code from WHO API response
        let code = null
        
        // Extract ICD-11 code from MMS linearization response
        // The linearization endpoint should return proper display codes like "8A81.Z"
        const possibleCodeFields = [
          'theCode',           // Most common field for MMS codes
          'code',              // Standard code field
          'blockId',           // Block identifier in linearization
          'classificationId'   // Classification ID
        ]
        
        // Check each possible field for ICD-11 display codes
        for (const field of possibleCodeFields) {
          const fieldValue = entity[field]
          if (fieldValue && typeof fieldValue === 'string') {
            // MMS linearization codes: 8A81.Z, MB4D, 8A8Z, BA00, 5A10, etc.
            // They should be short (2-8 chars) and alphanumeric
            if (fieldValue.length >= 2 && fieldValue.length <= 8 && 
                fieldValue.match(/^[0-9A-Z]{2,6}\.?[0-9A-Z]*$/i)) {
              code = fieldValue.toUpperCase()
              logger.info(`Found MMS linearization code: ${code} in field: ${field}`)
              break
            }
          }
        }
        
        // If no code found in the MMS linearization response, log for debugging
        if (!code) {
          logger.warn('No ICD-11 code found in MMS linearization response', {
            entityId: entity['@id'] || entity.id,
            availableFields: Object.keys(entity),
            entitySample: entity
          })
          code = 'UNK' // Fallback
        }
        
        // Extract title - try different possible fields
        const title = entity.title?.['@value'] || 
                      entity.title || 
                      entity.name?.['@value'] ||
                      entity.name ||
                      entity.label?.['@value'] ||
                      entity.label ||
                      'Unknown condition'
        
        // Extract definition
        const definition = entity.definition?.['@value'] || 
                          entity.definition || 
                          entity.description?.['@value'] ||
                          entity.description ||
                          ''
        
        // Extract URI
        const uri = entity['@id'] || 
                    entity.uri || 
                    entity.url ||
                    ''
        
        // Simple score extraction - confidence not displayed in UI
        const score = entity.score || 
                      entity.matchScore || 
                      entity.confidence ||
                      0.8
        
        const parsed_result: SearchResult = {
          code: code,
          title: title,
          definition: definition,
          uri: uri,
          match_score: score
        }
        
        logger.info('Parsed WHO result:', parsed_result)
        logger.info('Raw entity data for debugging:', {
          theCode: entity.theCode,
          code: entity.code,
          atId: entity['@id'],
          uri: entity.uri,
          allKeys: Object.keys(entity)
        })
        parsed_results.push(parsed_result)
      }
    } else {
      logger.warn('No entities found in WHO API response')
    }
    
    // Sort by match score (higher is better)
    parsed_results.sort((a, b) => b.match_score - a.match_score)
    return parsed_results
  }
}

/**
 * Medical Note Processor for extracting conditions and classifying them
 */
class MedicalNoteProcessor {
  private icd_coder: ICD11Coder
  
  private diagnosis_patterns = [
    /(?:diagnosis|dx):\s*([^.]+)/gi,
    /(?:diagnosed with|diagnosed as)\s*([^.]+)/gi,
    /(?:impression|assessment):\s*([^.]+)/gi,
    /(?:primary diagnosis|principal diagnosis):\s*([^.]+)/gi,
    /(?:secondary diagnosis):\s*([^.]+)/gi,
    /(?:condition|conditions):\s*([^.]+)/gi
  ]
  
  private system_patterns = {
    'cardiovascular': [/heart|cardiac|cardio|blood pressure|hypertension|arrhythmia|myocardial|coronary/i],
    'respiratory': [/lung|pulmonary|respiratory|breathing|cough|asthma|pneumonia|dyspnea/i],
    'neurological': [/neuro|brain|headache|seizure|stroke|migraine|epilepsy|neuropathy/i],
    'gastrointestinal': [/stomach|gastro|intestinal|digestive|nausea|vomiting|diarrhea|constipation/i],
    'musculoskeletal': [/bone|joint|muscle|arthritis|fracture|pain|back|spine|orthopedic/i],
    'endocrine': [/diabetes|thyroid|hormone|endocrine|insulin|glucose|metabolic/i],
    'infectious': [/infection|bacterial|viral|sepsis|pneumonia|uti|abscess/i],
    'dermatological': [/skin|rash|dermatitis|eczema|psoriasis|lesion/i]
  }

  constructor(icd_coder: ICD11Coder) {
    this.icd_coder = icd_coder
  }

  extractConditions(note_text: string): string[] {
    const conditions: string[] = []
    
    // Extract from diagnosis patterns (structured text)
    for (const pattern of this.diagnosis_patterns) {
      const matches = [...note_text.matchAll(pattern)]
      for (const match of matches) {
        if (match[1]) {
          conditions.push(match[1].trim())
        }
      }
    }
    
    // If no structured patterns matched, extract medical terms from the text
    if (conditions.length === 0 && note_text.trim().length > 0) {
      // Extract specific medical terms and symptoms
      const medical_terms = this.extractMedicalTerms(note_text)
      conditions.push(...medical_terms)
    }
    
    // Clean and filter conditions
    const cleaned_conditions: string[] = []
    for (let condition of conditions) {
      // Remove common non-diagnostic text
      condition = condition.replace(/\b(and|or|with|without|history of|h\/o|patient has|presents with|including|on the|of the|side of)\b/gi, '')
      condition = condition.replace(/[.,;]+$/, '') // Remove trailing punctuation
      condition = condition.trim()
      
      // Filter out very short or non-medical text
      if (condition.length > 2 && !this.isNonMedicalText(condition)) {
        cleaned_conditions.push(condition)
      }
    }
    
    // Remove duplicates and return
    return [...new Set(cleaned_conditions)]
  }

  private extractMedicalTerms(text: string): string[] {
    const terms: string[] = []
    const text_lower = text.toLowerCase()
    
    // Common medical terms and symptoms to extract
    const medical_patterns = [
      // Neurological symptoms
      /\b(weakness|paralysis|hemiplegia|hemiparesis)\b/gi,
      /\b(facial\s+(?:drooping|droop|palsy))\b/gi,
      /\b(stroke|cerebral\s+infarction|brain\s+attack)\b/gi,
      /\b(headache|migraine|cephalalgia)\b/gi,
      /\b(seizure|epilepsy|convulsion)\b/gi,
      
      // Cardiovascular
      /\b(hypertension|high\s+blood\s+pressure)\b/gi,
      /\b(chest\s+pain|angina|myocardial\s+infarction)\b/gi,
      /\b(heart\s+attack|cardiac\s+arrest)\b/gi,
      /\b(arrhythmia|palpitation)\b/gi,
      
      // Respiratory
      /\b(shortness\s+of\s+breath|dyspnea|breathlessness)\b/gi,
      /\b(cough|coughing)\b/gi,
      /\b(pneumonia|lung\s+infection)\b/gi,
      /\b(asthma|bronchitis)\b/gi,
      
      // General symptoms
      /\b(fever|pyrexia|hyperthermia)\b/gi,
      /\b(nausea|vomiting|emesis)\b/gi,
      /\b(diarrhea|diarrhoea)\b/gi,
      /\b(fatigue|tiredness|exhaustion)\b/gi,
      /\b(pain|ache|discomfort)\b/gi,
      /\b(diabetes|hyperglycemia)\b/gi,
      /\b(infection|sepsis)\b/gi,
      /\b(fracture|broken\s+bone)\b/gi,
      /\b(depression|anxiety|panic)\b/gi
    ]
    
    // Extract matches from patterns
    for (const pattern of medical_patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[0]) {
          terms.push(match[0].trim())
        }
      }
    }
    
    // If no specific patterns matched, try to identify potential medical terms
    if (terms.length === 0) {
      // Split text and look for potential medical terms
      const words = text.split(/[\s,;.]+/)
      for (const word of words) {
        const clean_word = word.trim().toLowerCase()
        if (clean_word.length > 4 && this.isPotentialMedicalTerm(clean_word)) {
          terms.push(word.trim())
        }
      }
    }
    
    return terms
  }

  private isPotentialMedicalTerm(word: string): boolean {
    // Check if word looks like a medical term
    const medical_indicators = [
      /itis$/,     // inflammation (arthritis, hepatitis)
      /osis$/,     // condition (thrombosis, stenosis)  
      /emia$/,     // blood condition (anemia, leukemia)
      /ology$/,    // study of (cardiology, neurology)
      /pathy$/,    // disease (neuropathy, myopathy)
      /trophy$/,   // growth (atrophy, hypertrophy)
      /algia$/,    // pain (neuralgia, myalgia)
      /^hyper/,    // excessive (hypertension, hyperglycemia)
      /^hypo/,     // deficient (hypotension, hypoglycemia)
      /^dys/,      // abnormal (dyspnea, dysphagia)
      /^brady/,    // slow (bradycardia)
      /^tachy/     // fast (tachycardia)
    ]
    
    return medical_indicators.some(pattern => pattern.test(word))
  }

  private isNonMedicalText(text: string): boolean {
    const nonMedicalPatterns = [
      /^(the|a|an|in|on|at|to|for|of|from|by)$/i,
      /^(patient|doctor|visit|appointment|today|yesterday|tomorrow)$/i,
      /^\d+$/  // Just numbers
    ]
    
    return nonMedicalPatterns.some(pattern => pattern.test(text.trim()))
  }

  classifyBySystem(condition_text: string): string {
    const condition_lower = condition_text.toLowerCase()
    
    for (const [system, patterns] of Object.entries(this.system_patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(condition_lower)) {
          return system
        }
      }
    }
    
    return 'general'
  }

  async codeMedicalNote(note_text: string, confidence_threshold: number = 0.7): Promise<CodingResults> {
    const start_time = Date.now()
    
    // Extract conditions from text
    const conditions = this.extractConditions(note_text)
    
    const results: CodingResults = {
      extracted_conditions: conditions,
      coded_conditions: [],
      system_classification: {},
      processing_notes: []
    }
    
    for (const condition of conditions) {
      // Classify by system
      const system = this.classifyBySystem(condition)
      results.system_classification[condition] = system
      
      // Search for ICD-11 codes
      const search_results = await this.icd_coder.searchConditions(condition)
      
      if (search_results.length > 0) {
        // Filter by confidence threshold
        const high_confidence_results = search_results
          .slice(0, 3)  // Top 3 results
          .filter(result => result.match_score >= confidence_threshold)
        
        if (high_confidence_results.length > 0) {
          const best_match = high_confidence_results[0]
          const coded_condition = {
            original_text: condition,
            icd11_code: best_match.code,
            icd11_title: best_match.title,
            match_score: best_match.match_score,
            system: system,
            alternatives: high_confidence_results.slice(1)
          }
          results.coded_conditions.push(coded_condition)
        } else {
          results.processing_notes.push(`Low confidence matches for: ${condition}`)
        }
      } else {
        results.processing_notes.push(`No matches found for: ${condition}`)
      }
    }
    
    return results
  }
}

/**
 * WHO ICD-11 Service - Replaces the LLM-based implementation
 * Provides accurate, authoritative medical coding without hallucination
 */
class WHOICD11Service {
  private icd_coder: ICD11Coder
  private note_processor: MedicalNoteProcessor

  constructor() {
    this.icd_coder = new ICD11Coder()
    this.note_processor = new MedicalNoteProcessor(this.icd_coder)
  }

  async generateICD11Codes(
    diagnosis?: string,
    symptoms?: string,
    chiefComplaint?: string,
    assessment?: string
  ): Promise<ICD11MedicalCodes> {
    const start_time = Date.now()
    
    try {
      // Combine all medical text
      const medical_text = [diagnosis, symptoms, chiefComplaint, assessment]
        .filter(text => text && text.trim().length > 0)
        .join('. ')
      
      if (!medical_text.trim()) {
        return {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: Date.now() - start_time,
          lastUpdated: new Date().toISOString()
        }
      }

      logger.info('Processing medical text for ICD-11 coding:', {
        textLength: medical_text.length,
        hasDiagnosis: !!diagnosis,
        hasSymptoms: !!symptoms,
        hasChiefComplaint: !!chiefComplaint,
        hasAssessment: !!assessment,
        medicalText: medical_text
      })

      // Process the medical text
      const coding_results = await this.note_processor.codeMedicalNote(medical_text, 0.7)
      
      logger.info('Medical note processing results:', {
        extractedConditionsCount: coding_results.extracted_conditions.length,
        extractedConditions: coding_results.extracted_conditions,
        codedConditionsCount: coding_results.coded_conditions.length,
        processingNotes: coding_results.processing_notes
      })
      
      // Convert to the expected interface format
      const icd11_codes: ICD11MedicalCodes = {
        primary: [],
        secondary: [],
        suggestions: [],
        extractedTerms: coding_results.extracted_conditions,
        processingTime: Date.now() - start_time,
        lastUpdated: new Date().toISOString()
      }

      // Categorize coded conditions
      for (const coded of coding_results.coded_conditions) {
        const icd_code: ICD11Code = {
          code: coded.icd11_code,
          title: coded.icd11_title,
          definition: '', // Would need additional API call to get full definition
          uri: `https://id.who.int/icd/entity/${coded.icd11_code}`,
          confidence: coded.match_score,
          matchType: coded.match_score >= 0.9 ? 'exact' : 
                    coded.match_score >= 0.8 ? 'partial' : 'related'
        }

        // Categorize based on confidence and system classification
        if (coded.match_score >= 0.85) {
          icd11_codes.primary.push(icd_code)
        } else if (coded.match_score >= 0.7) {
          icd11_codes.secondary.push(icd_code)
        } else {
          icd11_codes.suggestions.push(icd_code)
        }

        // Add alternatives as suggestions
        for (const alt of coded.alternatives.slice(0, 2)) { // Max 2 alternatives per condition
          const alt_code: ICD11Code = {
            code: alt.code,
            title: alt.title,
            definition: alt.definition,
            uri: alt.uri,
            confidence: alt.match_score,
            matchType: 'related'
          }
          icd11_codes.suggestions.push(alt_code)
        }
      }

      logger.info('WHO ICD-11 coding completed successfully:', {
        primaryCount: icd11_codes.primary.length,
        secondaryCount: icd11_codes.secondary.length,
        suggestionsCount: icd11_codes.suggestions.length,
        extractedTerms: icd11_codes.extractedTerms.length,
        processingTime: icd11_codes.processingTime,
        processingNotes: coding_results.processing_notes
      })

      return icd11_codes

    } catch (error) {
      logger.error('WHO ICD-11 coding failed:', error)
      
      // Return empty structure on error
      return {
        primary: [],
        secondary: [],
        suggestions: [],
        extractedTerms: [],
        processingTime: Date.now() - start_time,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * Generate ICD-11 codes from LLM-suggested conditions
   * This method takes a list of conditions (from LLM) and gets official ICD codes for each
   */
  async generateICD11CodesFromConditions(conditions: string[]): Promise<ICD11MedicalCodes> {
    const start_time = Date.now()
    
    try {
      if (!conditions || conditions.length === 0) {
        return {
          primary: [],
          secondary: [],
          suggestions: [],
          extractedTerms: [],
          processingTime: Date.now() - start_time,
          lastUpdated: new Date().toISOString()
        }
      }

      logger.info('Processing LLM-generated conditions for ICD-11 coding:', {
        conditionCount: conditions.length,
        conditions: conditions
      })

      const icd11_codes: ICD11MedicalCodes = {
        primary: [],
        secondary: [],
        suggestions: [],
        extractedTerms: conditions,
        processingTime: 0,
        lastUpdated: new Date().toISOString()
      }

      // Process each condition individually
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i]
        
        try {
          // Search for ICD codes for this condition
          const search_results = await this.icd_coder.searchConditions(condition)
          
          if (search_results.length > 0) {
            const best_match = search_results[0] // Take the best match
            
            const icd_code: ICD11Code = {
              code: best_match.code,
              title: best_match.title,
              definition: best_match.definition,
              uri: best_match.uri,
              confidence: best_match.match_score,
              matchType: best_match.match_score >= 0.9 ? 'exact' : 
                        best_match.match_score >= 0.8 ? 'partial' : 'related'
            }

            // Categorize based on condition order (LLM provides most likely first)
            // and confidence score
            if (i === 0 && best_match.match_score >= 0.7) {
              // First condition (most likely) goes to primary if decent confidence
              icd11_codes.primary.push(icd_code)
            } else if (i === 1 && best_match.match_score >= 0.6) {
              // Second condition goes to secondary if reasonable confidence
              icd11_codes.secondary.push(icd_code)
            } else if (best_match.match_score >= 0.5) {
              // Third condition or lower confidence goes to suggestions
              icd11_codes.suggestions.push(icd_code)
            }

            logger.info(`ICD code found for condition "${condition}":`, {
              code: icd_code.code,
              title: icd_code.title,
              confidence: icd_code.confidence,
              category: i === 0 && best_match.match_score >= 0.7 ? 'primary' : 
                       i === 1 && best_match.match_score >= 0.6 ? 'secondary' : 'suggestions'
            })
          } else {
            logger.warn(`No ICD codes found for condition: "${condition}"`)
          }
        } catch (error) {
          logger.error(`Failed to get ICD code for condition "${condition}":`, error)
        }
      }

      icd11_codes.processingTime = Date.now() - start_time

      logger.info('LLM-based WHO ICD-11 coding completed:', {
        primaryCount: icd11_codes.primary.length,
        secondaryCount: icd11_codes.secondary.length,
        suggestionsCount: icd11_codes.suggestions.length,
        totalProcessingTime: icd11_codes.processingTime
      })

      return icd11_codes

    } catch (error) {
      logger.error('LLM-based WHO ICD-11 coding failed:', error)
      
      return {
        primary: [],
        secondary: [],
        suggestions: [],
        extractedTerms: conditions || [],
        processingTime: Date.now() - start_time,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(process.env.WHO_ICD11_CLIENT_ID && process.env.WHO_ICD11_CLIENT_SECRET)
  }

  /**
   * Test the connection to WHO ICD-11 API
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.icd_coder.authenticate()
    } catch (error) {
      logger.error('WHO ICD-11 connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const whoICD11Service = new WHOICD11Service()

// Export for backward compatibility with existing interface
export const simpleICD11Service = whoICD11Service