"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Upload, FileAudio, Mic, Play, Pause, Sparkles, Languages, Wand2, AlertCircle, Check, Zap, CheckCircle, Clock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import type { FastTranscriptionResponse, TranscriptionResult } from "@/lib/api-client"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { createMedicalNote } from "@/store/features/notesSlice"
import { fetchSupportedLanguages, type Language } from "@/app/config/languages"
import { logger } from '@/lib/logger'
import { parseTranscript, calculateOverallConfidence, testTranscripts } from '@/lib/intelligentTranscriptParser'
import { useRouter } from "next/navigation"

// Types
interface MedicalNote {
  id?: string
  patientName: string
  patientAge: number
  patientGender: string
  noteType: string
  chiefComplaint?: string
  historyOfPresentIllness?: string
  diagnosis?: string
  treatmentPlan?: string
  audioJobId?: string
  createdAt?: string
  updatedAt?: string
}

// ICD-11 Codes Interface
interface ICD11Codes {
  primary: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  secondary: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  suggestions: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  extractedTerms: string[]
  processingTime: number
  lastUpdated: string
}

interface AudioUploadProps {
  onTranscriptionComplete: (transcription: any) => void
  onRecordingComplete?: (file: File, duration: number) => void
  onAddToQueue?: () => void
  disabled?: boolean
  patientInfo?: {
    firstName: string
    lastName: string
    age: string
    gender: string
  }
  createdNoteId?: string | null // Add note ID from parent
}

/**
 * 🚨 WhatsApp File Detection Utility
 * 
 * Detects audio files that may have been processed through WhatsApp, which applies
 * heavy compression that degrades transcription quality. This helps users understand
 * why their transcription might be poor and guides them to use original files.
 * 
 * Detection methods:
 * - Filename patterns (aud-YYYYMMDD-waXXXX.mp4, ptt-YYYYMMDD-waXXXX.mp4)
 * - File characteristics (MP4 video with audio prefix)
 * - File size analysis (unusually small files indicating compression)
 * 
 * @param file - The uploaded audio file
 * @returns Object with isWhatsApp flag and reason for detection
 */
const detectWhatsAppFile = (file: File): { isWhatsApp: boolean; reason: string } => {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  // Common WhatsApp audio file patterns
  const whatsappPatterns = [
    // WhatsApp voice message patterns
    /aud-\d{8}-wa\d{4}/,     // aud-20240101-wa0001.mp4
    /ptt-\d{8}-wa\d{4}/,     // ptt-20240101-wa0001.mp4
    /whatsapp.*audio/,        // whatsapp audio
    /wa\d{4}\.mp4$/,         // wa0001.mp4
    /voice.*\d{8}/,          // voice-20240101
    // Generic suspicious patterns
    /\d{8}-\d{6}/,           // 20240101-123456 (timestamp pattern common in WhatsApp)
  ]
  
  // Check filename patterns
  for (const pattern of whatsappPatterns) {
    if (pattern.test(fileName)) {
      return { 
        isWhatsApp: true, 
        reason: `Filename pattern suggests WhatsApp origin: "${fileName}"` 
      }
    }
  }
  
  // Check for suspicious file characteristics
  if (fileType === 'video/mp4' && fileName.includes('aud')) {
    return { 
      isWhatsApp: true, 
      reason: 'MP4 video file with audio prefix suggests WhatsApp conversion' 
    }
  }
  
  // Check for very small file sizes (WhatsApp heavily compresses)
  if (file.size < 50000 && file.size > 1000) { // Between 1KB and 50KB
    return { 
      isWhatsApp: true, 
      reason: 'File size suggests heavy compression typical of WhatsApp' 
    }
  }
  
  return { isWhatsApp: false, reason: '' }
}

// Extract functions for parsing medical transcriptions
const extractChiefComplaint = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for common chief complaint indicators in English
  const indicators = [
    'chief complaint', 'presenting with', 'complains of', 'patient reports',
    'main problem', 'primary concern', 'came in for', 'here for'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      // Extract text after the indicator
      const afterIndicator = fullText.substring(index + indicator.length).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 5) {
        return sentences[0].trim();
      }
    }
  }
  
  // Look for Malay/Indonesian medical indicators
  const malayIndicators = [
    'keluhan utama', 'sakit', 'masalah', 'datang dengan', 'mengalami',
    'rasa sakit', 'demam', 'batuk', 'pusing', 'mual'
  ];
  
  for (const indicator of malayIndicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  // Fallback: look for symptom keywords
  const symptoms = ['pain', 'ache', 'fever', 'cough', 'sore', 'headache', 'nausea', 'dizzy', 'weakness'];
  for (const symptom of symptoms) {
    if (fullText.includes(symptom)) {
      const sentences = fullText.split(/[.!?]/);
      for (const sentence of sentences) {
        if (sentence.includes(symptom) && sentence.length > 10) {
          return sentence.trim();
        }
      }
    }
  }
  
  // Skip doctor introduction sentences
  const sentences = fullText.split(/[.!?]/);
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    // Skip sentences that are clearly doctor introductions
    if (cleanSentence.length > 10 && 
        !cleanSentence.includes('hai') && 
        !cleanSentence.includes('saya doktor') && 
        !cleanSentence.includes('doctor') && 
        !cleanSentence.includes('my name is') &&
        !cleanSentence.includes('i am')) {
      return cleanSentence;
    }
  }
  
  // If no good content found, return a generic placeholder
  return 'Chief complaint to be documented';
};

const extractHistory = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Enhanced history indicators in English
  const indicators = [
    'history', 'started', 'began', 'first noticed', 'for the past', 'since', 'duration',
    'complaining of', 'experiencing', 'feeling', 'suffering from', 'having',
    'developed', 'occurred', 'appeared', 'manifested', 'presented with',
    'chief complaint', 'main problem', 'primary concern', 'reason for visit'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  // Enhanced Malay/Indonesian history indicators
  const malayIndicators = [
    'riwayat', 'mulai', 'bermula', 'sejak', 'sudah', 'pernah',
    'sejarah penyakit', 'bila mula', 'kapan mulai', 'mengalami',
    'merasa', 'menderita', 'keluhan', 'masalah', 'gejala',
    'keluhan utama', 'masalah utama', 'alasan kunjungan'
  ];
  
  for (const indicator of malayIndicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 8) {
        return sentences[0].trim();
      }
    }
  }
  
  // Fallback: try to extract any sentence that seems like history
  const sentences = fullText.split(/[.!?]/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && (
      trimmed.includes('patient') || 
      trimmed.includes('has been') || 
      trimmed.includes('for') ||
      trimmed.includes('since') ||
      trimmed.includes('mengalami') ||
      trimmed.includes('sudah')
    )) {
      return trimmed;
    }
  }
  
  return 'History of presenting illness to be documented';
};

const extractPhysicalExam = (segments: any[]): any => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Extract vital signs if mentioned
  const vitals = {
    bloodPressure: "--",
    heartRate: "--", 
    temperature: "--",
    respiratoryRate: "--",
  };
  
  // Look for vital signs patterns
  const bpMatch = fullText.match(/(\d{2,3}\/\d{2,3}|\d{2,3}\s*over\s*\d{2,3})/);
  if (bpMatch) vitals.bloodPressure = bpMatch[0];
  
  const hrMatch = fullText.match(/(\d{2,3})\s*(bpm|beats|heart rate)/);
  if (hrMatch) vitals.heartRate = `${hrMatch[1]} bpm`;
  
  const tempMatch = fullText.match(/(\d{2,3}\.?\d*)\s*(degrees|celsius|fahrenheit|°c|°f)/);
  if (tempMatch) vitals.temperature = `${tempMatch[1]}°C`;
  
  // Extract examination findings
  let throatExam = "To be examined";
  if (fullText.includes('throat') || fullText.includes('pharynx')) {
    const sentences = fullText.split(/[.!?]/);
    for (const sentence of sentences) {
      if ((sentence.includes('throat') || sentence.includes('pharynx')) && sentence.length > 10) {
        throatExam = sentence.trim();
        break;
      }
    }
  }
  
  return {
    vitals,
    throat: throatExam,
  };
};

const extractDiagnosis = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for diagnosis indicators
  const indicators = [
    'diagnosis', 'diagnosed with', 'likely', 'probably', 'appears to be', 'consistent with'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index + indicator.length).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 5) {
        return sentences[0].trim();
      }
    }
  }
  
  return 'Diagnosis extracted from transcription';
};

const extractTreatmentPlan = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for treatment indicators
  const indicators = [
    'treatment', 'recommend', 'prescribe', 'medication', 'take', 'follow up', 'plan'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  return 'Treatment plan extracted from transcription';
};

// Enhanced transcript extraction functions for better medical information extraction
const extractChiefComplaintFromTranscript = (transcriptionData: any): string => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return '[To be extracted from transcript]';
  
  const text = transcript.toLowerCase();
  
  // Look for chief complaint patterns
  const patterns = [
    /(?:chief complaint|complains? of|presenting with|came in (?:for|with)|here for|main (?:problem|concern)|patient reports?|suffering from)[\s:]*([^.!?]+)/i,
    /(?:pain|ache|hurt|sore|fever|cough|headache|nausea|dizzy|weakness|tired|fatigue)[\s\w]*(?:in|on|at)?[\s\w]*(?:for|since)?[^.!?]*/i,
    /(?:sakit|demam|batuk|pusing|mual|lemah|letih)[\s\w]*(?:di|pada|sejak)?[^.!?]*/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[0] && match[0].length > 10) {
      return match[0].trim().replace(/^(chief complaint|complains? of|presenting with|came in (?:for|with)|here for|main (?:problem|concern)|patient reports?|suffering from)[\s:]*/i, '');
    }
  }
  
  // Fallback: look for symptom keywords in first few sentences
  const sentences = transcript.split(/[.!?]/);
  const symptoms = ['pain', 'ache', 'fever', 'cough', 'sore', 'headache', 'nausea', 'dizzy', 'weakness', 'sakit', 'demam', 'batuk', 'pusing'];
  
  for (const sentence of sentences.slice(0, 5)) {
    for (const symptom of symptoms) {
      if (sentence.toLowerCase().includes(symptom) && sentence.length > 15) {
        return sentence.trim();
      }
    }
  }
  
  return transcript.split(/[.!?]/)[0]?.trim() || '[To be extracted from transcript]';
};

const extractHistoryFromTranscript = (transcriptionData: any): string => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return 'Not mentioned';
  
  const text = transcript.toLowerCase();
  
  // Look for history patterns
  const patterns = [
    /(?:history|started|began|since|for the past|duration|onset|when did)[\s\w]*[^.!?]*/i,
    /(?:riwayat|mulai|sejak|selama|durasi)[\s\w]*[^.!?]*/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[0] && match[0].length > 20) {
      return match[0].trim();
    }
  }
  
  // Extract time-related information
  const timePatterns = [
    /(?:\d+)\s*(?:days?|weeks?|months?|years?|hours?)\s*(?:ago|back)/i,
    /(?:yesterday|today|this morning|last night|few days)/i
  ];
  
  const sentences = transcript.split(/[.!?]/);
  for (const sentence of sentences) {
    for (const pattern of timePatterns) {
      if (pattern.test(sentence) && sentence.length > 15) {
        return sentence.trim();
      }
    }
  }
  
  return 'History of presenting illness to be documented';
};

const extractDiagnosisFromTranscript = (transcriptionData: any): string => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return '[To be determined based on transcript analysis]';
  
  const text = transcript.toLowerCase();
  
  // Look for diagnosis patterns
  const patterns = [
    /(?:diagnosis|diagnosed with|condition|appears to be|likely|probably|suspect)[\s:]*([^.!?]+)/i,
    /(?:diagnosa|kondisi|kemungkinan|sepertinya)[\s:]*([^.!?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1] && match[1].length > 5) {
      return match[1].trim();
    }
  }
  
  // Look for common medical conditions
  const conditions = [
    'upper respiratory tract infection', 'urinary tract infection', 'gastritis', 'hypertension',
    'diabetes', 'asthma', 'bronchitis', 'pneumonia', 'migraine', 'sinusitis', 'pharyngitis',
    'flu', 'cold', 'fever', 'infection', 'inflammation'
  ];
  
  for (const condition of conditions) {
    if (text.includes(condition)) {
      return condition.charAt(0).toUpperCase() + condition.slice(1);
    }
  }
  
  return 'Clinical assessment pending based on examination findings';
};

const extractTreatmentFromTranscript = (transcriptionData: any): string => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return '[To be determined based on transcript analysis]';
  
  const text = transcript.toLowerCase();
  
  // Look for treatment patterns
  const patterns = [
    /(?:treatment|prescribe|medication|take|give|recommend|plan)[\s:]*([^.!?]+)/i,
    /(?:pengobatan|obat|minum|berikan|anjuran|rencana)[\s:]*([^.!?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[0] && match[0].length > 15) {
      return match[0].trim();
    }
  }
  
  // Look for medication names or dosages
  const medicationPatterns = [
    /(?:paracetamol|ibuprofen|amoxicillin|azithromycin|omeprazole|metformin)[\s\w\d]*/i,
    /\d+\s*mg|\d+\s*ml|\d+\s*tablets?|\d+\s*times?/i
  ];
  
  const sentences = transcript.split(/[.!?]/);
  for (const sentence of sentences) {
    for (const pattern of medicationPatterns) {
      if (pattern.test(sentence) && sentence.length > 10) {
        return sentence.trim();
      }
    }
  }
  
  return 'Treatment plan to be determined based on clinical assessment';
};

const extractPatientInfoFromTranscript = (transcriptionData: any): {name: string, age: string, gender: string} => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return { name: '', age: '', gender: '' };
  
  const text = transcript.toLowerCase();
  let extractedName = '';
  let extractedAge = '';
  let extractedGender = '';
  
  // Extract patient name
  const namePatterns = [
    /(?:patient|name|called|mr|mrs|ms|miss)[\s:]*([\w\s]+?)(?:\s|,|\.|\n)/i,
    /(?:nama|pasien)[\s:]*([\w\s]+?)(?:\s|,|\.|\n)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      extractedName = match[1].trim();
      break;
    }
  }
  
  // Extract age
  const agePatterns = [
    /(?:age|aged|years? old|\d+\s*years?)[\s:]*(\d+)/i,
    /(?:umur|berumur)[\s:]*(\d+)/i,
    /(\d+)[\s-]*(?:year|yr|tahun)/i
  ];
  
  for (const pattern of agePatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const age = parseInt(match[1]);
      if (age > 0 && age < 150) {
        extractedAge = age.toString();
        break;
      }
    }
  }
  
  // Extract gender
  const malePatterns = /(?:male|man|boy|laki|pria|cowok)/i;
  const femalePatterns = /(?:female|woman|girl|lady|perempuan|wanita|cewek)/i;
  
  if (malePatterns.test(transcript)) {
    extractedGender = 'Male';
  } else if (femalePatterns.test(transcript)) {
    extractedGender = 'Female';
  }
  
  return {
    name: extractedName,
    age: extractedAge,
    gender: extractedGender
  };
};

const extractVitalSignsFromTranscript = (transcriptionData: any): any => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return null;
  
  const text = transcript.toLowerCase();
  const vitals: any = {};
  
  // Blood pressure patterns
  const bpPatterns = [
    /(?:blood pressure|bp)[\s:]*(\d{2,3}\/\d{2,3})/i,
    /(\d{2,3})\s*over\s*(\d{2,3})/i,
    /(\d{2,3})\/(\d{2,3})\s*mmhg/i
  ];
  
  for (const pattern of bpPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      if (match[1] && match[1].includes('/')) {
        vitals.bloodPressure = match[1];
      } else if (match[1] && match[2]) {
        vitals.bloodPressure = `${match[1]}/${match[2]}`;
      }
      break;
    }
  }
  
  // Heart rate patterns
  const hrPatterns = [
    /(?:heart rate|pulse|hr)[\s:]*(\d{2,3})\s*(?:bpm|beats)/i,
    /(\d{2,3})\s*(?:bpm|beats per minute)/i
  ];
  
  for (const pattern of hrPatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const hr = parseInt(match[1]);
      if (hr > 30 && hr < 200) {
        vitals.heartRate = `${hr} bpm`;
        break;
      }
    }
  }
  
  // Temperature patterns
  const tempPatterns = [
    /(?:temperature|temp)[\s:]*(\d{2,3}\.?\d*)\s*(?:degrees?|°|celsius|fahrenheit|c|f)/i,
    /(\d{2,3}\.?\d*)\s*(?:°c|°f|celsius|fahrenheit)/i
  ];
  
  for (const pattern of tempPatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const temp = parseFloat(match[1]);
      if (temp > 30 && temp < 50) {
        vitals.temperature = `${temp}°C`;
        break;
      }
    }
  }
  
  // Respiratory rate patterns
  const rrPatterns = [
    /(?:respiratory rate|breathing rate|rr)[\s:]*(\d{1,2})/i,
    /(\d{1,2})\s*(?:breaths? per minute|rpm)/i
  ];
  
  for (const pattern of rrPatterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      const rr = parseInt(match[1]);
      if (rr > 5 && rr < 60) {
        vitals.respiratoryRate = `${rr}/min`;
        break;
      }
    }
  }
  
  return Object.keys(vitals).length > 0 ? vitals : null;
};

const extractPhysicalExaminationFromTranscript = (transcriptionData: any): string => {
  const transcript = ('transcript' in transcriptionData ? transcriptionData.transcript : '') || '';
  if (!transcript) return 'No physical examination was performed during this consultation.';
  
  const text = transcript.toLowerCase();
  
  // Look for examination patterns
  const examPatterns = [
    /(?:examination|physical exam|on examination|inspect|palpat|auscultat)[\s:]*([^.!?]+)/i,
    /(?:pemeriksaan|fisik|inspeksi|palpasi|auskultasi)[\s:]*([^.!?]+)/i
  ];
  
  const examFindings = [];
  
  for (const pattern of examPatterns) {
    const match = transcript.match(pattern);
    if (match && match[1] && match[1].length > 10) {
      examFindings.push(match[1].trim());
    }
  }
  
  // Look for specific body system examinations
  const systemExams = [
    { system: 'Cardiovascular', patterns: [/heart|cardiac|murmur|rhythm|s1|s2/i] },
    { system: 'Respiratory', patterns: [/lung|chest|breath|wheeze|crackle|rhonchi/i] },
    { system: 'Abdominal', patterns: [/abdomen|stomach|bowel|liver|spleen/i] },
    { system: 'Neurological', patterns: [/neuro|reflex|motor|sensory|coordination/i] },
    { system: 'ENT', patterns: [/throat|ear|nose|pharynx|tonsil/i] }
  ];
  
  const sentences = transcript.split(/[.!?]/);
  for (const sentence of sentences) {
    for (const exam of systemExams) {
      for (const pattern of exam.patterns) {
        if (pattern.test(sentence) && sentence.length > 15) {
          examFindings.push(`${exam.system}: ${sentence.trim()}`);
          break;
        }
      }
    }
  }
  
  if (examFindings.length > 0) {
    return examFindings.join('. ');
  }
  
  // Look for any mention of normal/abnormal findings
  const findingPatterns = [
    /(?:normal|abnormal|clear|unremarkable|within normal limits|wnl)/i
  ];
  
  for (const sentence of sentences) {
    for (const pattern of findingPatterns) {
      if (pattern.test(sentence) && sentence.length > 10) {
        return sentence.trim();
      }
    }
  }
  
  return 'No physical examination was performed during this consultation.';
};

// Intelligent parser wrapper function
const parseTranscriptWithIntelligentParser = (transcript: string) => {
  if (!transcript || transcript.trim().length < 10) {
    logger.warn('⚠️ Transcript too short for intelligent parsing, using basic extraction');
    return {
      patientInfo: extractPatientInfoFromTranscript({ transcript }),
      vitalSigns: extractVitalSignsFromTranscript({ transcript }),
      chiefComplaint: extractChiefComplaintFromTranscript({ transcript }),
      historyOfPresentIllness: extractHistoryFromTranscript({ transcript }),
      pastMedicalHistory: 'Not mentioned',
      medications: ['[To be determined based on transcript analysis]'],
      allergies: 'Not mentioned',
      reviewOfSystems: 'Not mentioned',
      physicalExamination: extractPhysicalExaminationFromTranscript({ transcript }),
      investigations: 'Not mentioned',
      assessment: extractDiagnosisFromTranscript({ transcript }),
      plan: extractTreatmentFromTranscript({ transcript })
    };
  }

  try {
    logger.info('🧠 Using intelligent parser for transcript extraction');
    logger.debug('📝 Transcript preview:', transcript.substring(0, 200) + '...');
    
    // Use the already imported parseTranscript function
    const extracted = parseTranscript(transcript);
    
    if (!extracted) {
      throw new Error('Intelligent parser returned null/undefined result');
    }
    
    const confidence = calculateOverallConfidence(extracted);
    
    // ⚡ PERFORMANCE: Reduced logging for production speed
    if (process.env.NODE_ENV === 'development') {
      logger.info('✅ Intelligent extraction SUCCESS');
    }
    
    // Only use intelligent parser if confidence is reasonable  
    if (confidence < 5) {
      logger.warn('⚠️ Very low confidence intelligent extraction, falling back to basic');
      throw new Error(`Very low confidence extraction: ${confidence}%`);
    }
    
    return extracted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack?.substring(0, 500) : undefined;
    
    logger.error('❌ Intelligent parser failed, falling back to basic extraction:', {
      error: errorMessage,
      stack: errorStack
    });
    
    // Fallback to basic extraction if intelligent parser fails
    return {
      patientInfo: extractPatientInfoFromTranscript({ transcript }),
      vitalSigns: extractVitalSignsFromTranscript({ transcript }),
      chiefComplaint: extractChiefComplaintFromTranscript({ transcript }),
      historyOfPresentIllness: extractHistoryFromTranscript({ transcript }),
      pastMedicalHistory: 'Not mentioned',
      medications: ['[To be determined based on transcript analysis]'],
      allergies: 'Not mentioned',
      reviewOfSystems: 'Not mentioned',
      physicalExamination: extractPhysicalExaminationFromTranscript({ transcript }),
      investigations: 'Not mentioned',
      assessment: extractDiagnosisFromTranscript({ transcript }),
      plan: extractTreatmentFromTranscript({ transcript })
    };
  }
};

// Calculate extraction confidence
const calculateExtractionConfidence = (extraction: any): number => {
  try {
    return calculateOverallConfidence(extraction);
  } catch (error) {
    logger.error('Failed to calculate extraction confidence:', error);
    return 0;
  }
};

const formatManagementPlan = (managementPlan: any): string => {
  if (!managementPlan || typeof managementPlan !== 'object') {
    return 'Treatment plan to be determined';
  }
  
  const sections = [];
  
  // Handle investigations
  if (managementPlan.investigations && managementPlan.investigations !== 'N/A') {
    sections.push(`Investigations: ${managementPlan.investigations}`);
  }
  
  // Handle treatment administered
  if (managementPlan.treatmentAdministered && managementPlan.treatmentAdministered !== 'N/A') {
    sections.push(`Treatment Administered: ${managementPlan.treatmentAdministered}`);
  }
  
  // Handle medications prescribed
  if (managementPlan.medicationsPrescribed && managementPlan.medicationsPrescribed !== 'N/A') {
    sections.push(`Medications Prescribed: ${managementPlan.medicationsPrescribed}`);
  }
  
  // Handle patient education
  if (managementPlan.patientEducation && managementPlan.patientEducation !== 'N/A') {
    sections.push(`Patient Education: ${managementPlan.patientEducation}`);
  }
  
  // Handle follow-up
  if (managementPlan.followUp && managementPlan.followUp !== 'N/A') {
    sections.push(`Follow-up: ${managementPlan.followUp}`);
  }
  
  // Handle any other fields that might be present
  Object.keys(managementPlan).forEach(key => {
    if (!['investigations', 'treatmentAdministered', 'medicationsPrescribed', 'patientEducation', 'followUp'].includes(key)) {
      const value = managementPlan[key];
      if (value && value !== 'N/A') {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sections.push(`${formattedKey}: ${value}`);
      }
    }
  });
  
  return sections.length > 0 
    ? sections.join('\n\n') 
    : 'Treatment plan to be determined';
};

export default function AudioUpload({ onTranscriptionComplete, onRecordingComplete, onAddToQueue, disabled = false, patientInfo, createdNoteId }: AudioUploadProps) {
  // Get user's preferred language from auth state
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  
  const [file, setFile] = useState<File | null>(null)
  const [filePatientInfo, setFilePatientInfo] = useState<{patientName: string, patientAge: string, patientGender: string} | null>(null)
  const [createdNoteIdLocal, setCreatedNoteIdLocal] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [language, setLanguage] = useState(user?.preferredLanguage || "en-US")
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([])
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [demoMode, setDemoMode] = useState(false)
  const [showDemoAlert, setShowDemoAlert] = useState(false)
  const [transcriptionComplete, setTranscriptionComplete] = useState(false)
  const [processingStages, setProcessingStages] = useState<{ name: string; status: string; description: string; progress: number }[]>([])
  const [useFastTranscription, setUseFastTranscription] = useState(true) // Use fast transcription by default
  const [overallProgress, setOverallProgress] = useState(0)
  const [processingFailed, setProcessingFailed] = useState(false)
  const [failureMessage, setFailureMessage] = useState<string>('')
  const [recordingCompleted, setRecordingCompleted] = useState(false)
  const [completedRecording, setCompletedRecording] = useState<{file: File, duration: number} | null>(null)
  
  // Add patient information state
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  
  // 🚨 REQUEST DEDUPLICATION: Prevent duplicate API calls
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [whatsappWarning, setWhatsappWarning] = useState<{show: boolean; reason: string} | null>(null)
  const lastRequestRef = useRef<string | null>(null)
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const performanceMonitor = useRef<{ startTiming: (key: string) => void }>({ startTiming: () => {} })
  const processingJobId = useRef<string | null | undefined>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const generatedNote = useRef<MedicalNote | null>(null)
  const recordingTimeRef = useRef<number>(0)

  // Update language when user data changes
  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage)
    }
  }, [user?.preferredLanguage])

  useEffect(() => {
    fetchSupportedLanguages().then(setAvailableLanguages)

    // Listen for cleanup event from parent
    const handleClearAudioUpload = () => {
  
      setFile(null);
      setFilePatientInfo(null);
      setCreatedNoteIdLocal(null);
      setIsProcessing(false);
      setTranscriptionComplete(false);
      setOverallProgress(0);
      setProgress(0);
      if (audioRef.current) {
        audioRef.current.src = '';
      }
      setDetectedKeywords([]);
      setWhatsappWarning(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('clearAudioUpload', handleClearAudioUpload);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('clearAudioUpload', handleClearAudioUpload);
      }
    };
  }, [])

  // 🚨 CLEANUP: Reset deduplication flags on component unmount
  useEffect(() => {
    return () => {
      setIsTranscribing(false);
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      lastRequestRef.current = null;
    };
  }, [])

  // Real-time progress tracking - based on actual backend progress
  const updateRealProgress = (stage: string, progress: number, message: string) => {
    updateProcessingStage(stage, 'processing', message, progress);
    setOverallProgress(progress);
    
    // Show toast for important progress updates
    if (progress === 25 || progress === 50 || progress === 75) {
      toast({
        title: `🔄 ${stage}`,
        description: message,
        duration: 3000,
      });
    }
  }

  // Function to complete a stage with 100% progress
  const completeStage = (stageName: string) => {
    updateProcessingStage(stageName, 'completed', '', 100)
    
    // Show completion toast
    toast({
      title: `✅ ${stageName} Complete`,
      description: `${stageName} has been completed successfully!`,
      duration: 3000,
    });
    
    // Update overall progress
    setProcessingStages(prev => {
      const totalStages = prev.length
      const completedProgress = prev.reduce((sum, stage) => 
        stage.name === stageName ? sum + 100 : sum + stage.progress, 0)
      const overallProg = Math.floor(completedProgress / totalStages)
      setOverallProgress(overallProg)
      return prev
    })
  }

  const clearPatientForm = () => {
    setPatientName('')
    setPatientAge('')
    setPatientGender('')
  }

  // Capture current patient information from form or props
  const captureCurrentPatientInfo = () => {

    
    // Always prioritize the patientInfo prop from the parent (transcribe page)
    const currentPatientInfo = {
      patientName: patientInfo ? `${patientInfo.firstName.trim()} ${patientInfo.lastName.trim()}`.trim() : '',
      patientAge: patientInfo?.age?.trim() || '',
      patientGender: patientInfo?.gender || '',
    };
    

    
    // If no patient info from parent, show a warning
    if (!currentPatientInfo.patientName && !currentPatientInfo.patientAge) {
      toast({
        title: "⚠️ Missing Patient Information",
        description: "Please fill out the Patient Information form on the left side (First Name, Last Name, Age, Gender) before transcribing.",
        variant: "destructive",
        duration: 8000,
      });
    }
    
    return currentPatientInfo;
  }

  // Create medical note using the working logic from transcribe page
  const createMedicalNoteFromTranscription = async (data: any) => {
    // Show loading state for note creation
    toast({
      title: "🔄 Creating Medical Note",
      description: "Saving your medical note to the database...",
      duration: 3000,
    });
    
    try {
      // Extract patient info from the transcription data, but prioritize captured info
      const transcribedPatientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      // Use captured patient info or fallback to transcribed data
      const patientData = filePatientInfo || {
        patientName: '',
        patientAge: '',
        patientGender: ''
      };
      
      // Prepare note data for backend (same logic as transcribe page)
      const noteData = {
        patientName: patientData.patientName || transcribedPatientInfo.name || data.patientName || 'Unknown Patient',
        patientAge: (() => {
          const age = patientData.patientAge || transcribedPatientInfo.age || data.patientAge || '0';
          const parsedAge = parseInt(age, 10);
          return isNaN(parsedAge) ? 0 : parsedAge;
        })(),
        patientGender: patientData.patientGender || transcribedPatientInfo.gender || data.patientGender || 'Other',
        visitDate: transcribedPatientInfo.visitDate || data.visitDate || new Date().toISOString().split('T')[0],
        visitTime: data.visitTime || new Date().toTimeString().slice(0, 5),
        chiefComplaint: medicalNote.chiefComplaint || data.chiefComplaint || '',
        historyOfPresentIllness: medicalNote.historyOfPresentingIllness || data.historyOfPresentingIllness || '',
        physicalExamination: typeof data.physicalExamination === 'object' 
          ? JSON.stringify(data.physicalExamination) 
          : data.physicalExamination || '',
        diagnosis: medicalNote.assessmentAndDiagnosis || medicalNote.diagnosis || data.diagnosis || data.medicalNote?.diagnosis || 'Clinical assessment pending based on examination findings',
        treatmentPlan: medicalNote.treatmentPlan || data.managementPlan || '',
        noteType: 'consultation' as const,
        audioJobId: data.audioJobId,
        vitalSigns: data.medicalNote?.vitalSigns || data.vitalSigns || {
          temperature: medicalNote.temperature || 'Not mentioned',
          pulseRate: medicalNote.pulseRate || 'Not mentioned',
          respiratoryRate: medicalNote.respiratoryRate || 'Not mentioned',
          bloodPressure: medicalNote.bloodPressure || 'Not mentioned',
          oxygenSaturation: medicalNote.oxygenSaturation || 'Not mentioned',
          glucoseLevels: medicalNote.glucose || medicalNote.glucoseLevels || 'Not mentioned'
        }
      };

      // Create the medical note using Redux
      const result = await dispatch(createMedicalNote(noteData));
      
      if (createMedicalNote.fulfilled.match(result)) {
        const savedNote = result.payload;
        
        if (savedNote && savedNote.id) {
          const noteId = savedNote.id;
          
          // Set the created note ID for the button
          setCreatedNoteIdLocal(noteId);
          
          // Show success message
          toast({
            title: "🎉 Medical Note Created!",
            description: "Your medical note has been created successfully. Opening it now...",
            duration: 5000,
          });
          
          // Wait a moment before navigating to let user see completion message
          
          setTimeout(() => {
            router.replace(`/dashboard/notes/${noteId}`);
          }, 3000); // Wait 3 seconds before routing
          
          return noteId;
        }
      } else {
        throw new Error('Failed to create medical note');
      }
    } catch (error) {
      toast({
        title: "❌ Error Creating Note",
        description: "Failed to create medical note. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0]
      
      // 🚨 WHATSAPP FILE DETECTION
      const whatsappCheck = detectWhatsAppFile(uploadedFile)
      if (whatsappCheck.isWhatsApp) {
        setWhatsappWarning({
          show: true,
          reason: whatsappCheck.reason
        })
        
        toast({
          title: "⚠️ WhatsApp Audio Detected",
          description: "WhatsApp compresses audio files which reduces transcription quality. For best results, use original audio files.",
          variant: "destructive",
        })
        
        logger.warn('🚨 WhatsApp file detected:', {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          reason: whatsappCheck.reason
        })
      } else {
        setWhatsappWarning(null)
      }
      
      setFile(uploadedFile)
      
      // Capture patient information with this file
      const capturedPatientInfo = captureCurrentPatientInfo();
      setFilePatientInfo(capturedPatientInfo);
      
      // Disable demo mode when real file is uploaded
      setDemoMode(false)
      setShowDemoAlert(false)
      
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(uploadedFile)
      }
      // Reset keywords for new file
      setDetectedKeywords([])
      setTranscriptionComplete(false)
      

      
      // Optionally clear patient form for new file
      // clearPatientForm()
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const startRecording = async () => {
    try {
      // Disable demo mode when starting a real recording
      setDemoMode(false)
      setShowDemoAlert(false)
      
      // Force clear keywords immediately
      setDetectedKeywords([])
      
      // Request high-quality audio for better transcription
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono for speech
          sampleRate: 44100, // High quality sample rate
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      // Clear any existing chunks
      chunksRef.current = []
      
      // Create MediaRecorder with optimized configuration for transcription
      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 
                  MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm',
        audioBitsPerSecond: 128000 // 128 kbps for better quality
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      })

      mediaRecorderRef.current.addEventListener("stop", () => {
        
        if (chunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No audio data was recorded. Please try again.",
            variant: "destructive",
          })
          return
        }
        
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        })
        
        if (audioBlob.size === 0) {
          toast({
            title: "Recording Error",
            description: "No audio data was captured. Please check your microphone.",
            variant: "destructive",
          })
          return
        }
        
        // Create file with proper extension based on mime type
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
        const extension = mimeType.includes('webm') ? '.webm' : 
                         mimeType.includes('mp4') ? '.mp4' : '.webm'
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const audioFile = new File([audioBlob], `recording_${timestamp}${extension}`, { 
          type: mimeType 
        })
        
        if (audioFile.size < 5000) { // Less than 5KB is likely too small
          toast({
            title: "⚠️ Poor Audio Quality",
            description: "Recording seems too small. Please speak louder and record for longer.",
            variant: "destructive",
          })
        }
        
        setFile(audioFile)
        
        // Capture patient information with this recording
        const capturedPatientInfo = captureCurrentPatientInfo();
        setFilePatientInfo(capturedPatientInfo);
        
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob)
        }
        chunksRef.current = []
        
        // Check if recording is long enough
        if (recordingTimeRef.current > 10) { // Increased minimum to 10 seconds for medical content
          // File is ready for processing - buttons will show automatically
          setCompletedRecording({ file: audioFile, duration: recordingTimeRef.current })
        } else {
          toast({
            title: "Recording Too Short",
            description: "Please record for at least 10 seconds. Include patient symptoms, history, and examination details for better results.",
            variant: "destructive",
          })
        }
      })

      // Start recording with timeslice to ensure data is captured
      mediaRecorderRef.current.start(1000) // Capture data every 1 second
      setIsRecording(true)
      setRecordingTime(0)
      setTranscriptionComplete(false)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          recordingTimeRef.current = newTime
          return newTime
        })
      }, 1000)

      toast({
        title: "🎙️ Recording Started",
        description: "For best AI transcription: Speak clearly, include patient name, symptoms, examination findings, and diagnosis. Avoid just saying 'hello doctor'.",
      })
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Recording Stopped",
        description: `Recording completed (${formatTime(recordingTime)})`,
      })

      // Processing is now handled in the MediaRecorder stop event
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      toast({
        title: "Recording Paused",
        description: "Recording has been paused. Click Resume to continue.",
      })
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Restart the timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          recordingTimeRef.current = newTime
          return newTime
        })
      }, 1000)

      toast({
        title: "Recording Resumed",
        description: "Recording has been resumed.",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // For demo purposes - process a partial transcription with limited data
  const processPartialTranscription = async () => {
    setIsProcessing(true)

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Partial transcription with only basic info
    const partialTranscription = {
      patientInfo: {
        name: "Ahmed bin Ali",
        age: 28,
        gender: "Male",
        visitDate: "17 May 2025",
      },
      chiefComplaint: "Sore throat for three days",
      historyOfPresentIllness: "",
      pastMedicalHistory: "",
      systemReview: "",
      physicalExamination: {
        vitals: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
        },
        throat: "",
      },
      diagnosis: "",
      managementPlan: "",
      medicationCertificate: "",
    }

    clearInterval(interval)
    setProgress(100)
    setTranscriptionComplete(true)

    // Wait a bit before completing
    setTimeout(() => {
      onTranscriptionComplete(partialTranscription)
      setIsProcessing(false)
      toast({
        title: "Partial Transcription Complete",
        description: "Basic patient information and chief complaint transcribed. Other sections need more information.",
      })
    }, 500)
  }

  const initializeProcessingStages = useCallback(() => {
    // Initialize with empty stages - only add stages when they actually start processing
    setProcessingStages([]);
  }, [useFastTranscription]);

  const updateProcessingStage = (name: string, status: string, description?: string, progress: number = 0) => {
    setProcessingStages(prev => {
      const updatedStages = [...prev]
      const existingIndex = updatedStages.findIndex(stage => stage.name === name)
      
      const stageDescriptions = {
        'Transcribing Audio': 'Converting speech to text using AI...',
        'Medical Note Generating': 'Creating structured medical note from transcription...',
        'Medical Note Formed': 'Medical note completed successfully!'
      }
      
      // Round progress to 1 decimal place for precision display
      const preciseProgress = Math.round(progress * 10) / 10;
      
      if (existingIndex !== -1) {
        updatedStages[existingIndex] = {
          name,
          status,
          description: description || stageDescriptions[name as keyof typeof stageDescriptions] || '',
          progress: preciseProgress
        }
      } else {
        updatedStages.push({
          name,
          status,
          description: description || stageDescriptions[name as keyof typeof stageDescriptions] || '',
          progress: preciseProgress
        })
      }
      
      return updatedStages
    })
  }

  // Function to reset error states and retry processing
  const resetFailedState = () => {
    setProcessingFailed(false);
    setFailureMessage('');
    setTranscriptionComplete(false);
    setOverallProgress(0);
    initializeProcessingStages();
  }

  const processAudio = async () => {
    const currentFile = file;
    if (!currentFile || currentFile.size === 0) {
      toast({
        title: "No valid audio",
        description: "Please record or upload a valid audio file.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset any previous failed states
    resetFailedState();
    
    // Show immediate progress feedback to user
    updateRealProgress('Starting', 0.2, 'Preparing audio for processing...');

    await processAudioWithFile(currentFile);
  };

  const processAudioWithFile = async (audioFile: File) => {
    

    
    // 🚨 Frontend file validation
    if (!audioFile.size || audioFile.size === 0) {
      toast({
        title: "Invalid File",
        description: "The selected file appears to be empty or corrupted. Please try a different file.",
        variant: "destructive",
      });
      return;
    }
    
    // 🚨 REQUEST DEDUPLICATION: Prevent duplicate calls
    const requestId = `${audioFile.name}-${audioFile.size}-${Date.now()}`;
    
    if (isTranscribing) {
  
      toast({
        title: "Processing in Progress",
        description: "Please wait for the current transcription to complete.",
        variant: "default",
      });
      return;
    }
    
    if (lastRequestRef.current === `${audioFile.name}-${audioFile.size}`) {
  
      return;
    }
    
    // Clear any existing timeout
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    // Set deduplication flags
    setIsTranscribing(true);
    lastRequestRef.current = `${audioFile.name}-${audioFile.size}`;
    
    // Reset deduplication after 30 seconds
    requestTimeoutRef.current = setTimeout(() => {
      setIsTranscribing(false);
      lastRequestRef.current = null;
    }, 30000);
    
    // Emit start event
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transcriptionStart'));
      }
    } catch (_) {
      // no-op
    }

    
    
    if (!audioFile) {
      setIsTranscribing(false);
      toast({
        title: "No Audio File",
        description: "Please record or upload a valid audio file.",
        variant: "destructive",
      });
      return;
    }
    
    if (audioFile.size === 0) {
      setIsTranscribing(false);
      toast({
        title: "Empty Audio File",
        description: "The audio file is empty. Please record again or upload a different file.",
        variant: "destructive",
      });
      return;
    }
    
    if (audioFile.size < 1000) { // Less than 1KB is likely too small
      setIsTranscribing(false);
      toast({
        title: "Audio File Too Small",
        description: "The audio file seems too small. Please record for a longer duration.",
        variant: "destructive",
      });
      return;
    }

    // 🚨 ENHANCED WHATSAPP DETECTION DURING PROCESSING
    const whatsappCheck = detectWhatsAppFile(audioFile);
    if (whatsappCheck.isWhatsApp) {
      logger.warn('🚨 Processing WhatsApp file - expect lower quality:', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        reason: whatsappCheck.reason
      });
      
      toast({
        title: "⚠️ Processing WhatsApp Audio",
        description: "This appears to be a WhatsApp file. Results may be less accurate due to compression. Consider using original audio files.",
        variant: "destructive",
      });
    }

    performanceMonitor.current.startTiming('audio-processing');
    initializeProcessingStages();
    setIsProcessing(true);

    try {
      
      // Add guidance toast for recorded audio
      if (audioFile.name.includes('recording')) {
        toast({
          title: "🎤 Processing Recording",
          description: "For best results, ensure your recording includes detailed patient information, symptoms, and examination findings.",
        });
      }
      
      if (useFastTranscription) {
        // Simple, working workflow - no complex progress tracking
        updateRealProgress('Transcribing Audio', 25, 'Starting transcription...');
        
        // Use captured patient information for this specific audio file, or capture it now if not already captured
        const currentPatientData = filePatientInfo || captureCurrentPatientInfo();
        const patientData = {
          patientName: currentPatientData?.patientName || '',
          patientAge: currentPatientData?.patientAge || '',
          patientGender: currentPatientData?.patientGender || '',
        };
        

        
        const response = await Promise.race([
          apiClient.fastTranscription(audioFile, patientData, language),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transcription timeout - please try again')), 300000) // 5 minute timeout
          )
        ]) as any;
        
        if (!response.success) {
          const errorMessage = response.error || "Failed to transcribe audio. Please try again.";
          
          toast({
            title: "Transcription Failed", 
            description: errorMessage,
            variant: "destructive",
          });
          
          setIsProcessing(false);
          setProcessingFailed(true);
          setFailureMessage(errorMessage);
          return;
        }
        
        const { data } = response;
        
        if (data && 'jobId' in data) {
          // Job-based processing - simple polling
          processingJobId.current = data.jobId;
          updateRealProgress('Transcribing Audio', 50, 'Transcription in progress...');
          
          toast({
            title: "Processing Started",
            description: "Your audio is being transcribed. This may take a minute.",
          });
          
          if (data.jobId) {
            startPolling(data.jobId);
          } else {
            toast({
              title: "Processing Error",
              description: "Failed to start transcription. Please try again.",
              variant: "destructive",
            });
            setIsProcessing(false);
            setProcessingFailed(true);
            setFailureMessage('Failed to start transcription. Please try again.');
          }
        } else {
          // Immediate result - show actual progress based on backend response
          updateRealProgress('Transcribing Audio', 45, 'Processing audio transcription...');
          
          // Move to note generation after transcription
          updateRealProgress('Transcribing Audio', 50, 'Audio transcription completed');
          updateRealProgress('Medical Note Generating', 80, 'Creating structured medical note...');
          
          setTimeout(() => {
            // Always treat API success as data success since backend creates the note
            if (response.success) {
              // If we have real data, use it; otherwise pass basic data that will create a note
              const fallbackData = {
                patientName: patientData.patientName || '',
                patientAge: patientData.patientAge || '',
                patientGender: patientData.patientGender || '',
                diagnosis: '',
                patientInfo: {
                  name: patientData.patientName || '',
                  age: patientData.patientAge || '',
                  gender: patientData.patientGender || ''
                },
                patientInformation: {
                  name: patientData.patientName || '',
                  age: patientData.patientAge || '',
                  gender: patientData.patientGender || ''
                },
                medicalNote: {
                  chiefComplaint: '',
                  historyOfPresentIllness: '',
                  diagnosis: '',
                  treatmentPlan: ''
                },
                transcript: 'Transcription completed',
                language: 'en',
                processingTime: '0s'
              };
              
              handleTranscriptionComplete(data || fallbackData);
            } else {
              // Backend creates notes successfully even when response.success is false
              // So we treat this as success since the note gets created
              logger.warn('⚠️ API response.success was false, but proceeding since backend creates notes');
              
              handleTranscriptionComplete({ 
                patientName: patientData.patientName || '',
                patientAge: patientData.patientAge || '',
                patientGender: patientData.patientGender || '',
                patientInfo: {
                  name: patientData.patientName || '',
                  age: patientData.patientAge || '',
                  gender: patientData.patientGender || ''
                },
                transcript: 'Transcription completed',
                language: 'en',
                processingTime: '0s'
              });
            }
          }, 1700); // Wait for note generation to complete (1.5s + buffer)
        }
      } else {
        // Use standard transcription endpoint with simple workflow
        updateRealProgress('Transcribing Audio', 25, 'Starting transcription...');
        
        // Use captured patient information for this specific audio file, or capture it now if not already captured
        const currentPatientData = filePatientInfo || captureCurrentPatientInfo();
        const patientData = {
          patientName: currentPatientData?.patientName || '',
          patientAge: currentPatientData?.patientAge || '',
          patientGender: currentPatientData?.patientGender || '',
        };
        

        
        const response = await Promise.race([
          apiClient.startTranscription(audioFile, patientData, language),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transcription timeout - please try again')), 300000) // 5 minute timeout
          )
        ]) as any;
        
        if (!response.success) {
          toast({
            title: "Transcription Failed",
            description: response.error || "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        const { data } = response;
        
        if (!data || !data.jobId) {
          toast({
            title: "Processing Error",
            description: "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        processingJobId.current = data.jobId;
        
        updateRealProgress('Transcribing Audio', 50, 'Transcription in progress...');
        
        toast({
          title: "Transcription Started",
          description: "Your audio is being transcribed. Please wait.",
        });

        if (data.jobId) {
          startPolling(data.jobId);
        } else {
          toast({
            title: "Processing Error",
            description: "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      
      setIsProcessing(false);
      setProcessingFailed(true);
      setFailureMessage(errorMessage);
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // 🚨 CLEANUP: Reset deduplication flags
      setIsTranscribing(false);
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      // Keep lastRequestRef for a short time to prevent immediate duplicates
      setTimeout(() => {
        lastRequestRef.current = null;
      }, 2000);
    }
  };

  const startPolling = (jobId: string) => {
    // Simple polling every 2 seconds
    const interval = setInterval(() => {
      pollTranscriptionStatus(jobId);
    }, 2000);
    
    pollingInterval.current = interval;
    pollTranscriptionStatus(jobId);
  };

  const pollTranscriptionStatus = async (jobId: string) => {
    try {
      const response = await apiClient.getTranscriptionResult(jobId);
      
      if (!response.success || !response.data) {
        toast({
          title: "Processing Error",
          description: response.error || "No data returned from server.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      const result = response.data;
      
      // Simple, working progress updates
      if (result.status === 'QUEUED') {
        updateRealProgress('Transcribing Audio', 50, 'Transcription queued, waiting...');
      } else if (result.status === 'IN_PROGRESS') {
        updateRealProgress('Transcribing Audio', 75, 'Transcribing audio to text...');
      } else if (result.status === 'COMPLETED') {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        
        // Complete transcription and move to note generation
        updateRealProgress('Medical Note Generating', 90, 'Creating medical note...');
        
        // Handle completed transcription
        setTimeout(async () => {
          await handleTranscriptionComplete({
            transcript: result.transcript,
            language: language,
            processingTime: 'Completed'
          });
        }, 1700); // Wait for note generation to complete (1.5s + buffer)
        
      } else if (result.status === 'FAILED') {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        
        // Reset processing state
        setIsProcessing(false);
        
        // Check if the failure was due to timeout (common for long audio files)
        const isTimeoutError = result.message?.includes('longer than expected') || 
                              result.message?.includes('timeout');
        
        if (isTimeoutError) {
          // For timeout errors, the transcription might still be processing
          setProcessingFailed(true);
          setFailureMessage('Transcription is taking longer than expected. Your note may still be processing in the background - please check your Notes page in a few moments.');
          
          toast({
            title: "⏰ Processing Timeout",
            description: "Transcription is taking longer than expected. Your note may still be processing in the background - please check the Notes page in a few moments.",
            variant: "destructive",
            duration: 10000
          });
          
          // Add a helpful follow-up message
          setTimeout(() => {
            toast({
              title: "💡 Next Steps",
              description: "Check your Notes page first. If no note was created, try using shorter audio files or the regular transcription option.",
              duration: 8000
            });
          }, 2000);
          
        } else {
          // Regular failure handling
          setProcessingFailed(true);
          setFailureMessage('The transcription job failed. Please try again.');
          toast({
            title: "Transcription Failed",
            description: "The transcription job failed. Please try again.",
            variant: "destructive",
          });
        }
      }
      // Continue polling for QUEUED and IN_PROGRESS statuses
    } catch (error) {
      logger.error('Error polling transcription status:', error);
      
      // Only stop polling for critical errors
      if (error instanceof Error && error.message.includes('404')) {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        
        setIsProcessing(false);
        
        toast({
          title: "Job Not Found",
          description: "The transcription job was not found. Please try uploading again.",
          variant: "destructive",
        });
      } else {
        // For other errors, continue polling
        logger.warn(`Non-critical polling error for job ${jobId}:`, error);
      }
    }
  };

  const handleTranscriptionComplete = (data: any) => {

    
    // Show completion toast
    toast({
      title: "🎉 Transcription Complete!",
      description: "Your audio has been transcribed successfully. Medical note created!",
      duration: 5000,
    });
    
    // Update UI state - show success first, keep processing visible
    setIsTranscribing(false);
    setOverallProgress(100);
    setTranscriptionComplete(true);
    
    // Keep processing UI visible to show success state
    // Don't hide it immediately - let the parent handle routing and cleanup
    
    // Clear any existing timeouts
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }
    
    // Reset deduplication flags
    lastRequestRef.current = null;
    
    // Notify parent/page that transcription is complete
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transcriptionCompleted'));
      }
    } catch (_) {
      // no-op
    }
    
    // Call the parent callback with the transcription data
    // The parent will handle note creation, routing, and cleanup
    if (onTranscriptionComplete) {
      onTranscriptionComplete(data);
    }
    
    // Don't clear the form immediately - let the parent handle the timing
    // The parent will call onAddToQueue after routing is complete
  }

  const handleAddToQueue = () => {
    if (!file) return;
    
    // Get the current patient info (captured or from form)
    const currentPatientData = filePatientInfo || captureCurrentPatientInfo();
    

    
    // Update parent form with captured patient info BEFORE adding to queue
    if (currentPatientData && (currentPatientData.patientName || currentPatientData.patientAge)) {
      const tempPatientInfo = {
        firstName: currentPatientData.patientName.split(' ')[0] || '',
        lastName: currentPatientData.patientName.split(' ').slice(1).join(' ') || '',
        age: currentPatientData.patientAge || '',
        gender: currentPatientData.patientGender || ''
      };
      

      
      // Send patient info to parent via event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('updatePatientInfo', { 
          detail: tempPatientInfo 
        }));
      }
      
      // Wait a moment for the event to be processed, then add to queue (always persistent)
      setTimeout(() => {
        if (onRecordingComplete) {
          (onRecordingComplete as any)(file, 0, true); // Always persistent
        }
      }, 100); // Small delay to ensure parent state is updated
    } else {
      // No patient info, add to queue anyway (always persistent)
      if (onRecordingComplete) {
        (onRecordingComplete as any)(file, 0, true); // Always persistent
      }
    }
    
    // Clear the current file and reset form for next recording
    setFile(null);
    setFilePatientInfo(null); // Clear captured patient info
    setCreatedNoteIdLocal(null); // Clear created note ID
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setDetectedKeywords([]);
    setTranscriptionComplete(false);
    setProgress(0);
    setWhatsappWarning(null);
    
    // Call the onAddToQueue callback to clear parent form
    if (onAddToQueue) {
      onAddToQueue();
    }
  };

  const handleRecordingChoice = (choice: 'queue' | 'process') => {
    if (!completedRecording) return;
    
    if (choice === 'queue') {
      // Add to queue
      if (onRecordingComplete) {
        onRecordingComplete(completedRecording.file, completedRecording.duration);
      }
      
      // Call the onAddToQueue callback to clear parent form
      if (onAddToQueue) {
        onAddToQueue();
      }
      
      toast({
        title: "📝 Recording Queued",
        description: `${completedRecording.file.name} has been added to your processing queue.`,
      });
      
      // Clear the current file and reset form for next recording
      setFile(null);
      setFilePatientInfo(null); // Clear captured patient info
      setCreatedNoteIdLocal(null); // Clear created note ID
      if (audioRef.current) {
        audioRef.current.src = '';
      }
      setDetectedKeywords([]);
      setTranscriptionComplete(false);
      setProgress(0);
      setWhatsappWarning(null);
    } else {
      // Process immediately
      processAudioWithFile(completedRecording.file);
      
      // Clear the current file and reset form after starting processing
      setFile(null);
      setFilePatientInfo(null); // Clear captured patient info
      setCreatedNoteIdLocal(null); // Clear created note ID
      if (audioRef.current) {
        audioRef.current.src = '';
      }
      setDetectedKeywords([]);
      setTranscriptionComplete(false);
      setProgress(0);
      setWhatsappWarning(null);
      
      // Call the onAddToQueue callback to clear parent form
      if (onAddToQueue) {
        onAddToQueue();
      }
    }
    
    // Reset the recording completion state
    setRecordingCompleted(false);
    setCompletedRecording(null);
  };

  const clearRecordingChoice = () => {
    setRecordingCompleted(false);
    setCompletedRecording(null);
  };

  // Demo audio file for the pre-recorded example
  const loadDemoFile = () => {
    // Enable demo mode when demo file is loaded
    setDemoMode(true)
    setShowDemoAlert(true)
    
    // Create a mock demo file
    const demoBlob = new Blob(["demo audio content"], { type: "audio/wav" })
    const demoFile = new File([demoBlob], "Ahmed_consultation_demo.wav", { type: "audio/wav" })
    setFile(demoFile)
    
    // Capture patient information with demo file
    const capturedPatientInfo = captureCurrentPatientInfo();
    setFilePatientInfo(capturedPatientInfo);
    
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(demoBlob)
    }
    
    // Reset states
    setDetectedKeywords([])
    setTranscriptionComplete(false)
    setProgress(0)
    setWhatsappWarning(null) // Clear any WhatsApp warnings for demo file
    
    toast({
      title: "Demo File Loaded",
      description: "Demo audio file loaded. You can now process it to see sample results.",
    })
  }

  return (
    <Card className={`w-full max-w-3xl mx-auto border-blue-500 transition-all duration-300 ${
      isProcessing ? 'ring-2 ring-blue-300 dark:ring-blue-600' : ''
    }`}>
      <CardContent className="p-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showDemoAlert && demoMode && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                This is a demonstration of NovateScribe. You can either record a short sample or upload the pre-recorded
                demo file.
                <Button variant="link" className="p-0 h-auto text-blue-500" onClick={() => setShowDemoAlert(false)}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}



          {/* Language Selector - Full Width */}
          <div className="w-full">
              <label className="text-sm font-medium mb-2 block">Language of Consultation</label>
              <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select the language of your consultation" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>



          {/* WhatsApp File Warning */}
          {whatsappWarning?.show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800 dark:text-orange-200">
                  ⚠️ WhatsApp Audio Detected
                </AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-300 space-y-2">
                  <p>This file appears to be from WhatsApp, which heavily compresses audio and may result in poor transcription quality.</p>
                  <div className="text-sm bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                    <strong>For best results:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Record audio directly on your device</li>
                      <li>Share via AirDrop, Google Drive, or email</li>
                      <li>Use original .m4a, .wav, or .mp3 files</li>
                      <li>Avoid sharing through WhatsApp first</li>
                    </ul>
                  </div>
                  <p className="text-xs italic">Reason: {whatsappWarning.reason}</p>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}



          {/* Action Buttons - Fixed Width Container */}
          <div className="w-full space-y-4">
            {!isRecording ? (
              /* Recording not started - Show all three options */
              <div className="flex flex-col gap-3">
                {/* Primary action - Start Recording */}
                <Button
                  onClick={startRecording}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 h-12 w-full"
                  size="lg"
                  disabled={isProcessing || disabled}
                >
                  <Mic size={18} className="shrink-0" />
                  <span className="truncate">Start Recording</span>
                </Button>
                
                {/* Secondary actions - Upload and Demo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex items-center justify-center gap-2 w-full h-12"
                      disabled={isProcessing || disabled}
                      onClick={() => document.getElementById("audio-upload")?.click()}
                      title="Upload original audio files (.m4a, .wav, .mp3) for best transcription quality. Avoid WhatsApp-shared files."
                    >
                      <Upload size={18} className="shrink-0" />
                      <span className="truncate">Upload Audio</span>
                    </Button>
                    <input
                      type="file"
                      id="audio-upload"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isRecording || isProcessing}
                      title="For best transcription quality, use original audio files. Avoid WhatsApp-compressed files."
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center justify-center gap-2 h-12 w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={loadDemoFile}
                    disabled={isRecording || isProcessing}
                  >
                    <FileAudio size={18} className="shrink-0" />
                    <span className="truncate">Load Demo</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Recording in progress - Show recording controls */
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className={`flex items-center justify-center gap-2 h-12 flex-1 min-w-0 ${
                    isPaused ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                  size="lg"
                  disabled={isProcessing || disabled}
                >
                  {isPaused ? (
                    <>
                      <Play size={18} className="shrink-0" />
                      <span className="truncate">Resume ({formatTime(recordingTime)})</span>
                    </>
                  ) : (
                    <>
                      <Pause size={18} className="shrink-0" />
                      <span className="truncate">Pause ({formatTime(recordingTime)})</span>
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 h-12 flex-1 min-w-0"
                  size="lg"
                  disabled={isProcessing || disabled}
                >
                  <span className="animate-pulse shrink-0">●</span>
                  <span className="truncate">Stop Recording</span>
                </Button>
              </div>
            )}
          </div>

          {/* Keywords section - disabled during recording to prevent fake keywords */}
          {!isRecording && detectedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 p-4 rounded-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium">Detected Medical Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedKeywords.map((keyword, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {file && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >

                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <FileAudio size={24} className="text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size > 1000 ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "Demo File"} • {file.type || 'Unknown format'}
                    </p>

                  </div>
                  <div className="flex items-center gap-2">

                    {whatsappWarning?.show && (
                      <Badge variant="destructive" className="text-xs">
                        WhatsApp
                      </Badge>
                    )}
                  </div>
                </div>

                <audio ref={audioRef} className="hidden" onEnded={() => setIsPlaying(false)} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="noise-reduction"
                      checked={noiseReduction}
                      onChange={(e) => setNoiseReduction(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    <label htmlFor="noise-reduction" className="text-sm">
                      Apply Noise Reduction
                    </label>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Language of Consultation:{" "}
                      <span className="font-medium">
                        {language === "en-US"
                          ? "English (US)"
                          : language === "en-GB"
                            ? "English (UK)"
                            : language === "es-ES"
                              ? "Spanish"
                              : language === "fr-FR"
                                ? "French"
                                : language === "de-DE"
                                  ? "German"
                                  : language === "it-IT"
                                    ? "Italian"
                                    : language === "pt-PT"
                                      ? "Portuguese"
                                      : language === "ru-RU"
                                        ? "Russian"
                                        : language === "ja-JP"
                                          ? "Japanese"
                                          : language === "ko-KR"
                                            ? "Korean"
                                            : language === "zh-CN"
                                              ? "Chinese"
                                              : language === "ar-SA"
                                                ? "Arabic"
                                                : language === "hi-IN"
                                                  ? "Hindi"
                                                  : language === "ms-MY"
                                                    ? "Malay"
                                                    : language === "nl-NL"
                                                      ? "Dutch"
                                                      : language === "sv-SE"
                                                        ? "Swedish"
                                                        : language === "no-NO"
                                                          ? "Norwegian"
                                                          : language === "da-DK"
                                                            ? "Danish"
                                                            : language}
                      </span>
                    </span>
                  </div>

                </div>



                {!transcriptionComplete && !isProcessing && file ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="flex items-center justify-center gap-2 text-white transition-all duration-300 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      onClick={processAudio}
                      disabled={isProcessing || disabled}
                    >
                      {disabled ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating Medical Note...
                        </>
                      ) : isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Transcribing Audio...
                        </>
                      ) : (
                        <>
                          <Wand2 size={18} /> Transcribe Audio
                        </>
                      )}
                    </Button>
                    <Button
                      className="w-full flex items-center justify-center gap-2 text-white transition-all duration-300 bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed"
                      onClick={() => handleAddToQueue()}
                      disabled={isProcessing || disabled}
                    >
                      <Save className="h-4 w-4" />
                      Save for Later
                    </Button>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {isProcessing && (
            <div className={`${overallProgress >= 100 ? 'bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800'} border rounded-lg p-6 text-center transition-all duration-500`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {overallProgress >= 100 ? (
                  <div className="w-5 h-5 text-green-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className={`text-lg font-medium ${overallProgress >= 100 ? 'text-green-900 dark:text-green-100' : 'text-blue-900 dark:text-blue-100'}`}>
                  {overallProgress < 50 ? '🎙️ Transcribing Audio' : 
                   overallProgress < 90 ? '📝 Medical Note Generating' : 
                   overallProgress >= 100 ? '🎉 Medical Note Created Successfully!' :
                   '✅ 100% Medical Note Formed'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className={`h-2 ${overallProgress >= 100 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${overallProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'} rounded-full transition-all duration-500`}
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                
                <div className={`text-sm ${overallProgress >= 100 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {overallProgress >= 100 ? '✅ Complete!' : `${overallProgress.toFixed(0)}% Complete`}
                </div>
                
                {overallProgress >= 100 && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (createdNoteIdLocal || createdNoteId) {
                          const noteId = createdNoteIdLocal || createdNoteId;
                          window.open(`/dashboard/notes/${noteId}`, '_blank');
                        } else {
                          window.open('/dashboard/notes', '_blank');
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      📋 View Medical Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {processingFailed && (
            <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-5 h-5 text-red-500">
                  {failureMessage?.includes('longer than expected') || failureMessage?.includes('timeout') ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <span className="text-lg font-medium text-red-900 dark:text-red-100">
                  {failureMessage?.includes('longer than expected') || failureMessage?.includes('timeout') ? 
                    '⏰ Processing Timeout' : '❌ Processing Failed'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="h-2 bg-red-100 dark:bg-red-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full w-full"></div>
                </div>
                
                <div className="text-sm text-red-700 dark:text-red-300">
                  {failureMessage || 'An error occurred during processing'}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {failureMessage?.includes('longer than expected') || failureMessage?.includes('timeout') ? (
                    <>
                      <Button
                        onClick={() => {
                          // Navigate to notes page to check if note was created
                          window.open('/dashboard/notes', '_blank');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        📋 Check Notes Page
                      </Button>
                      <Button
                        onClick={() => {
                          resetFailedState();
                          processAudio();
                        }}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={!file}
                      >
                        🔄 Retry Processing
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        resetFailedState();
                        processAudio();
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      disabled={!file}
                    >
                      🔄 Retry Processing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {transcriptionComplete && (
            <div className="space-y-3">
              <Progress value={100} className="h-3 bg-green-100 dark:bg-green-900/20" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-green-600 dark:text-green-400 animate-bounce">
                  🎉 Transcription Complete! (100.0%)
                </p>
                <p className="text-xs text-muted-foreground">
                  Your medical note is being created and will appear in your Notes page
                </p>

              </div>
            </div>
          )}




        </motion.div>
      </CardContent>
    </Card>
  )
}
