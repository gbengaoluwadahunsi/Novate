// Comprehensive Medical Note Types - Following new.pdf template structure
// Based on existing lib/api-client.ts interface

import { ExaminationTemplate } from './examination'

export interface PatientInformation {
  name: string;
  age: number;
  gender: 'male' | 'female';
  [key: string]: any;
}

export interface ExaminationData {
  generalExamination?: string;
  cardiovascularExamination?: string;
  respiratoryExamination?: string;
  abdominalExamination?: string;
  otherSystemsExamination?: string;
  [key: string]: any;
}

export interface ICD11MedicalCodes {
  primary: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  secondary: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  suggestions: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  extractedTerms: string[];
  processingTime: number;
  lastUpdated: string;
}

export interface MedicalNoteComprehensive {
  id: string;
  patientInformation: PatientInformation;
  chiefComplaint: string;
  historyOfPresentingIllness: string;
  pastMedicalHistory?: string;
  medication?: string;
  allergies?: string;
  socialHistory?: string;
  familyHistory?: string;
  reviewOfSystems?: string;
  examinationData: ExaminationData;
  investigations?: string;
  assessment: string;
  plan: string;
  icd11Codes?: ICD11MedicalCodes;
  [key: string]: any;
}

// Alias for backward compatibility with PDF generator
export type ComprehensiveMedicalNote = MedicalNoteComprehensive;

// Helper function to create empty medical note following template
export const createEmptyComprehensiveMedicalNote = (): ComprehensiveMedicalNote => ({
  id: '',
  patientInformation: {
    name: '',
    age: 0,
    gender: 'male'
  },
  chiefComplaint: '',
  historyOfPresentingIllness: '',
  pastMedicalHistory: '',
  medication: '',
  allergies: '',
  socialHistory: '',
  familyHistory: '',
  reviewOfSystems: '',
  examinationData: {},
  investigations: '',
  assessment: '',
  plan: ''
})

// Template sections for modular rendering
export interface MedicalNoteTemplate {
  sections: {
    chiefComplaint: boolean
    historyOfPresentingIllness: boolean
    pastMedicalHistory: boolean
    systemReview: boolean
    physicalExamination: boolean
    diagnosis: boolean
    treatmentPlan: boolean
    managementPlan: boolean
    followUpInstructions: boolean
    additionalNotes: boolean
    prescriptions: boolean
  }
}

// For backward compatibility with existing components
export interface MedicalNoteEditable {
  patientInfo: {
    name: string
    age: string
    gender: string
    visitDate?: string
    visitTime?: string
  }
  chiefComplaint: string
  historyOfPresentingIllness: string
  pastMedicalHistory: string
  systemReview: string
  physicalExamination: {
    general: string
    vitals: string
    specific: string
  }
  comprehensiveExamination?: ExaminationTemplate
  diagnosis: string
  managementPlan: string
  medicationCertificate: string
  letterhead?: string
  doctorDetails?: {
    name: string
    signature: string
    timestamp: string
    registrationNumber?: string
  }
} 