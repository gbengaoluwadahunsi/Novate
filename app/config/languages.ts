import { apiClient } from '@/lib/api-client'
import type { SupportedLanguage } from '@/lib/api-client'

export interface Language {
  code: string;
  name: string;
}

// Minimal fallback languages in case backend is unavailable
const FALLBACK_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (ES)' },
  { code: 'fr-FR', name: 'French (FR)' },
  { code: 'de-DE', name: 'German (DE)' },
  { code: 'it-IT', name: 'Italian (IT)' },
  { code: 'pt-PT', name: 'Portuguese (PT)' },
  { code: 'ru-RU', name: 'Russian (RU)' },
  { code: 'ja-JP', name: 'Japanese (JP)' },
  { code: 'ko-KR', name: 'Korean (KR)' },
  { code: 'zh-CN', name: 'Chinese (CN)' },
  { code: 'ar-SA', name: 'Arabic (SA)' },
  { code: 'hi-IN', name: 'Hindi (IN)' },
  { code: 'ms-MY', name: 'Malay (Malaysia)' },
  { code: 'nl-NL', name: 'Dutch (NL)' },
  { code: 'sv-SE', name: 'Swedish (SE)' },
  { code: 'no-NO', name: 'Norwegian (NO)' },
  { code: 'da-DK', name: 'Danish (DK)' },
]

// Function to get languages from backend API using the new API client
export async function fetchSupportedLanguages(): Promise<Language[]> {
  try {
    const response = await apiClient.getSupportedLanguages()
    if (response.success && response.data && Array.isArray(response.data)) {
      // Languages loaded successfully from backend
      return response.data
    }
    // Backend response invalid, using fallback languages
  } catch (error) {
    // Failed to load languages from backend, using fallback list
    console.warn('Failed to fetch supported languages from API, using fallback:', error)
  }
  
  // Return fallback languages if API call fails
  return FALLBACK_LANGUAGES
}

// Export fallback for initial state
export const INITIAL_LANGUAGES = FALLBACK_LANGUAGES 