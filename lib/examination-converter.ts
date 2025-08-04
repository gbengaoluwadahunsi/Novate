import { ComprehensiveExaminationData } from '@/types/comprehensive-examination'
import { SimpleMedicalNote } from '@/components/medical-note/simple-medical-note-editor'

// Convert SimpleMedicalNote to ComprehensiveExaminationData
export function convertToComprehensiveExamination(simpleNote: SimpleMedicalNote): ComprehensiveExaminationData {
  return {
    PatientInfo: {
      Name: simpleNote.patientName,
      Age: simpleNote.patientAge,
      Sex: simpleNote.patientGender,
      ID: simpleNote.patientId,
      Chaperone: simpleNote.chaperone
    },
    VitalSigns: {
      Temperature: simpleNote.temperature,
      PulseRate: simpleNote.pulseRate,
      RespiratoryRate: simpleNote.respiratoryRate,
      BloodPressure: simpleNote.bloodPressure,
      SpO2: simpleNote.spo2 || '',
      Weight: simpleNote.weight || '',
      Height: simpleNote.height || '',
      BMI: {
        Value: simpleNote.bmi || '',
        Status: simpleNote.bmiStatus || ''
      },
      TakenOn: simpleNote.takenOn,
      RecordedBy: simpleNote.takenBy
    },
    GEI: {
      Head: { Head1: '', Head3: '' },
      Face: { Face1: '' },
      Eyes: { Eye1: '', Eye2: '' },
      Mouth: { Mouth1: '' },
      Neck: { Neck1: '', Neck3: '' },
      Shoulders: {
        Shoulder1: { 1: '', 2: '' },
        Upperback: ''
      },
      Arms: {
        Arm1: { 1: '', 2: '' },
        Elbow1: { 1: '', 2: '' },
        Forearm1: { 1: '', 2: '' },
        Hand1: { 1: '', 2: '' }
      },
      Back: { Lowerback: '' },
      Legs: {
        Hip1: { 1: '', 2: '' },
        Hip3: { 1: '', 2: '' },
        Thigh1: { 1: '', 2: '' },
        Thigh3: { 1: '', 2: '' },
        Knee1: { 1: '', 2: '' },
        Knee3: { 1: '', 2: '' },
        Leg1: { 1: '', 2: '' },
        Calf3: { 1: '', 2: '' },
        Feet1: { 1: '', 2: '' },
        Ankle3: { 1: '', 2: '' },
        Buttock3: { 1: '', 2: '' }
      },
      Observations: {
        ConsciousnessLevel: simpleNote.generalExamination,
        WellnessPain: '',
        HydrationStatus: '',
        GaitAndPosture: ''
      }
    },
    CVSRespExamination: {
      Chest: {
        JVP: '', G: '', A: '', P: '', G2: '', T: '', M: '', G3_1: '', G3_2: '',
        Percussion: {
          '1_1': '', '1_2': '', '2_1': '', '2_2': '', '3_1': '', '3_2': '',
          '4_1': '', '4_2': '', '5_1': '', '5_2': '', '6_1': '', '6_2': '',
          '7_1': '', '7_2': ''
        },
        Auscultation: {
          '2_1_1': '', '2_2_1': '', '2_1_2': '', '2_2_2': '', '2_1_3': '', '2_2_3': ''
        }
      }
    },
    AbdominalInguinalExamination: {
      Stomach: simpleNote.abdominalExamination,
      Liver: '', Spleen: '', RF: '', LF: '', Umbilicus: '',
      Appendix_RIF: '', LIF: '', Bladder: '', Scrotum: '',
      Inguinal: { '1_1': '', '1_2': '' }
    },
    GeneratedOn: simpleNote.generatedOn
  }
}

// Convert ComprehensiveExaminationData back to SimpleMedicalNote
export function convertToSimpleMedicalNote(comprehensiveData: ComprehensiveExaminationData): SimpleMedicalNote {
  return {
    // Patient Information
    patientName: comprehensiveData.PatientInfo.Name,
    patientAge: comprehensiveData.PatientInfo.Age,
    patientGender: comprehensiveData.PatientInfo.Sex,
    patientId: comprehensiveData.PatientInfo.ID,
    chaperone: comprehensiveData.PatientInfo.Chaperone,
    
    // Vital Signs (including new fields)
    temperature: comprehensiveData.VitalSigns.Temperature,
    pulseRate: comprehensiveData.VitalSigns.PulseRate,
    respiratoryRate: comprehensiveData.VitalSigns.RespiratoryRate,
    bloodPressure: comprehensiveData.VitalSigns.BloodPressure,
    spo2: comprehensiveData.VitalSigns.SpO2,
    weight: comprehensiveData.VitalSigns.Weight,
    height: comprehensiveData.VitalSigns.Height,
    bmi: comprehensiveData.VitalSigns.BMI.Value,
    bmiStatus: comprehensiveData.VitalSigns.BMI.Status,
    takenOn: comprehensiveData.VitalSigns.TakenOn,
    takenBy: comprehensiveData.VitalSigns.RecordedBy,
    
    // Medical Content (simplified from comprehensive data)
    chiefComplaint: '',
    historyOfPresentingIllness: '',
    medicalConditions: '',
    surgeries: '',
    hospitalizations: '',
    medications: '',
    allergies: '',
    smoking: '',
    alcohol: '',
    recreationalDrugs: '',
    occupationLivingSituation: '',
    travel: '',
    sexual: '',
    eatingOut: '',
    familyHistory: '',
    
    // Review of Systems
    systemsReview: '',
    
    // Physical Examination
    generalExamination: comprehensiveData.GEI.Observations.ConsciousnessLevel,
    vitalSignsFindings: '',
    cardiovascularExamination: comprehensiveData.CVSRespExamination.Chest.G,
    respiratoryExamination: comprehensiveData.CVSRespExamination.Chest.P,
    abdominalExamination: comprehensiveData.AbdominalInguinalExamination.Stomach,
    otherSystemsExamination: '',
    physicalExaminationFindings: {},
    
    // Assessment & Plan
    investigations: '',
    assessment: '',
    plan: '',
    
    // Doctor Information
    doctorName: '',
    doctorRegistrationNo: '',
    generatedOn: comprehensiveData.GeneratedOn,
    signature: '',
    stamp: ''
  }
}

// Flatten comprehensive examination data to match Google Colab format
export function flattenToGoogleColabFormat(data: ComprehensiveExaminationData): Record<string, string> {
  const flattened: Record<string, string> = {}
  
  // Flatten nested objects recursively
  function flatten(obj: any, prefix = ''): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value, newKey)
        } else {
          flattened[newKey] = String(value || '')
        }
      }
    }
  }
  
  // Add specific mappings that match Google Colab coordinates
  flatten(data)
  
  // Map some fields to match exact Google Colab keys
  flattened['GeneralExamination.PatientInfo.Name'] = data.PatientInfo.Name
  flattened['GeneralExamination.PatientInfo.Age'] = data.PatientInfo.Age
  flattened['GeneralExamination.PatientInfo.Sex'] = data.PatientInfo.Sex
  flattened['GeneralExamination.PatientInfo.ID'] = data.PatientInfo.ID
  flattened['GeneralExamination.PatientInfo.Chaperone'] = data.PatientInfo.Chaperone
  
  flattened['VitalSigns.Temp'] = data.VitalSigns.Temperature
  flattened['VitalSigns.PR'] = data.VitalSigns.PulseRate
  flattened['VitalSigns.RR'] = data.VitalSigns.RespiratoryRate
  flattened['VitalSigns.BP'] = data.VitalSigns.BloodPressure
  flattened['VitalSigns.OxygenSaturationSpO2'] = data.VitalSigns.SpO2
  flattened['VitalSigns.BodyWeight'] = data.VitalSigns.Weight
  flattened['VitalSigns.Height'] = data.VitalSigns.Height
  flattened['VitalSigns.BMI.Value'] = data.VitalSigns.BMI.Value
  flattened['VitalSigns.BMI.Status'] = data.VitalSigns.BMI.Status
  flattened['VitalSigns.TakenOn'] = data.VitalSigns.TakenOn
  flattened['VitalSigns.RecordedBy'] = data.VitalSigns.RecordedBy
  
  return flattened
}

// Generate JSON for Google Colab template
export function generateGoogleColabJSON(data: ComprehensiveExaminationData): string {
  const flattened = flattenToGoogleColabFormat(data)
  return JSON.stringify(flattened, null, 2)
}

// Extract examination findings for AI processing
export function extractExaminationFindings(data: ComprehensiveExaminationData): {
  vitalSigns: string[]
  generalFindings: string[]
  cvsRespFindings: string[]
  abdominalFindings: string[]
} {
  const vitalSigns = [
    `Temperature: ${data.VitalSigns.Temperature}`,
    `Pulse: ${data.VitalSigns.PulseRate}`,
    `RR: ${data.VitalSigns.RespiratoryRate}`,
    `BP: ${data.VitalSigns.BloodPressure}`,
    `SpO2: ${data.VitalSigns.SpO2}`,
    `Weight: ${data.VitalSigns.Weight}`,
    `Height: ${data.VitalSigns.Height}`,
    `BMI: ${data.VitalSigns.BMI.Value} (${data.VitalSigns.BMI.Status})`
  ].filter(item => !item.includes(': '))
  
  const generalFindings = Object.entries(data.GEI).flatMap(([category, items]) => {
    if (typeof items === 'object') {
      return Object.entries(items).map(([key, value]) => {
        if (typeof value === 'object') {
          return Object.entries(value).map(([subKey, subValue]) => 
            subValue ? `${category} ${key} ${subKey}: ${subValue}` : null
          ).filter(Boolean)
        }
        return value ? `${category} ${key}: ${value}` : null
      }).flat().filter(Boolean)
    }
    return []
  }).filter(Boolean) as string[]
  
  const cvsRespFindings = Object.entries(data.CVSRespExamination.Chest)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value).map(([subKey, subValue]) => 
          subValue ? `${key} ${subKey}: ${subValue}` : null
        ).filter(Boolean)
      }
      return value ? `${key}: ${value}` : null
    }).flat().filter(Boolean) as string[]
  
  const abdominalFindings = Object.entries(data.AbdominalInguinalExamination)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value).map(([subKey, subValue]) => 
          subValue ? `${key} ${subKey}: ${subValue}` : null
        ).filter(Boolean)
      }
      return value ? `${key}: ${value}` : null
    }).flat().filter(Boolean) as string[]
  
  return {
    vitalSigns,
    generalFindings,
    cvsRespFindings,
    abdominalFindings
  }
}