// Comprehensive Medical Note Types - Following new.pdf template structure
// Based on existing lib/api-client.ts interface

import { ExaminationTemplate } from './examination'

export interface PatientInfo {
  name: string
  age: number | string
  gender: string
  visitDate?: string
  visitTime?: string
}

export interface DoctorDetails {
  name: string
  registrationNumber?: string
  department?: string
  signature?: string // Base64
  stamp?: string // Base64
  timestamp?: string
}

export interface Prescription {
  medication: string
  dosage: string
  instructions?: string
}

// Main medical note interface following new.pdf template structure
export interface ComprehensiveMedicalNote {
  id: string
  
  // Patient Information (following template)
  patientName: string
  patientAge: number | null | string
  patientGender: string
  visitDate?: string
  visitTime?: string
  
  // Medical Content Sections (as per template)
  chiefComplaint?: string
  historyOfPresentIllness?: string
  historyOfPresentingIllness?: string // Backend field name
  pastMedicalHistory?: string
  systemReview?: string
  physicalExamination?: string
  comprehensiveExamination?: ExaminationTemplate // Interactive examination
  diagnosis?: string
  assessmentAndDiagnosis?: string // Backend field name
  treatmentPlan?: string
  managementPlan?: any
  followUpInstructions?: string
  additionalNotes?: string
  
  // Prescriptions
  prescriptions?: Prescription[]
  
  // Note metadata
  noteType: 'consultation' | 'follow-up' | 'assessment' | null
  audioJobId?: string
  timeSaved?: number | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Doctor information
  doctorName?: string
  doctorRegistrationNo?: string
  doctorDepartment?: string
  doctorSignature?: string // Base64
  doctorStamp?: string // Base64
  letterhead?: string // Base64 letterhead from settings
  dateOfIssue?: string
  
  // System metadata
  version?: number
  lastModified?: string
}

// Helper function to create empty medical note following template
export const createEmptyComprehensiveMedicalNote = (): ComprehensiveMedicalNote => ({
  id: '',
  patientName: '',
  patientAge: '',
  patientGender: 'Male',
  visitDate: '',
  visitTime: '',
  noteType: 'consultation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  lastModified: new Date().toISOString()
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