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

/**
 * WHO ICD-11 Service - ICD-11 code generation removed
 * This service no longer generates ICD-11 codes
 */
class WHOICD11Service {
  constructor() {
    logger.info('WHO ICD-11 Service initialized - ICD-11 code generation disabled')
  }

  async generateICD11Codes(
    diagnosis?: string,
    symptoms?: string,
    chiefComplaint?: string,
    assessment?: string
  ): Promise<ICD11MedicalCodes> {
    logger.info('ICD-11 code generation requested but disabled')
    
    return {
      primary: [],
      secondary: [],
      suggestions: [],
      extractedTerms: [],
      processingTime: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  async generateICD11CodesFromConditions(conditions: string[]): Promise<ICD11MedicalCodes> {
    logger.info('ICD-11 code generation from conditions requested but disabled')
    
    return {
      primary: [],
      secondary: [],
      suggestions: [],
      extractedTerms: conditions || [],
      processingTime: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return false // ICD-11 generation is disabled
  }

  /**
   * Test the connection to WHO ICD-11 API
   */
  async testConnection(): Promise<boolean> {
    logger.info('WHO ICD-11 connection test requested but service is disabled')
    return false
  }
}

// Export singleton instance
export const whoICD11Service = new WHOICD11Service()

// Export for backward compatibility with existing interface
export const simpleICD11Service = whoICD11Service