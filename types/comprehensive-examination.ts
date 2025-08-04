// Enhanced examination data structure matching Google Colab template format
export interface ComprehensiveExaminationData {
  // Patient Information
  PatientInfo: {
    Name: string
    Age: string
    Sex: string
    ID: string
    Chaperone: string
  }
  
  // Vital Signs (enhanced with new fields)
  VitalSigns: {
    Temperature: string
    PulseRate: string
    RespiratoryRate: string
    BloodPressure: string
    SpO2: string
    Weight: string
    Height: string
    BMI: {
      Value: string
      Status: string
    }
    TakenOn: string
    RecordedBy: string
  }
  
  // General Examination Inspection (GEI) - matches Google Colab template
  GEI: {
    Head: {
      Head1: string
      Head3: string
    }
    Face: {
      Face1: string
    }
    Eyes: {
      Eye1: string  // Right Eye
      Eye2: string  // Left Eye
    }
    Mouth: {
      Mouth1: string
    }
    Neck: {
      Neck1: string
      Neck3: string
    }
    Shoulders: {
      Shoulder1: {
        1: string  // Right Shoulder
        2: string  // Left Shoulder
      }
      Upperback: string
    }
    Arms: {
      Arm1: {
        1: string  // Right Arm
        2: string  // Left Arm
      }
      Elbow1: {
        1: string  // Right Elbow
        2: string  // Left Elbow
      }
      Forearm1: {
        1: string  // Right Forearm
        2: string  // Left Forearm
      }
      Hand1: {
        1: string  // Right Hand
        2: string  // Left Hand
      }
    }
    Back: {
      Lowerback: string
    }
    Legs: {
      Hip1: {
        1: string  // Right Hip
        2: string  // Left Hip
      }
      Hip3: {
        1: string  // Right Hip (posterior)
        2: string  // Left Hip (posterior)
      }
      Thigh1: {
        1: string  // Right Thigh
        2: string  // Left Thigh
      }
      Thigh3: {
        1: string  // Right Thigh (posterior)
        2: string  // Left Thigh (posterior)
      }
      Knee1: {
        1: string  // Right Knee
        2: string  // Left Knee
      }
      Knee3: {
        1: string  // Right Knee (posterior)
        2: string  // Left Knee (posterior)
      }
      Leg1: {
        1: string  // Right Leg
        2: string  // Left Leg
      }
      Calf3: {
        1: string  // Right Calf
        2: string  // Left Calf
      }
      Feet1: {
        1: string  // Right Foot
        2: string  // Left Foot
      }
      Ankle3: {
        1: string  // Right Ankle
        2: string  // Left Ankle
      }
      Buttock3: {
        1: string  // Right Buttock
        2: string  // Left Buttock
      }
    }
    Observations: {
      ConsciousnessLevel: string
      WellnessPain: string
      HydrationStatus: string
      GaitAndPosture: string
    }
  }
  
  // CVS & Respiratory Examination (matching Google Colab coordinates)
  CVSRespExamination: {
    Chest: {
      JVP: string
      G: string
      A: string
      P: string
      G2: string
      T: string
      M: string
      G3_1: string
      G3_2: string
      Percussion: {
        '1_1': string
        '1_2': string
        '2_1': string
        '2_2': string
        '3_1': string
        '3_2': string
        '4_1': string
        '4_2': string
        '5_1': string
        '5_2': string
        '6_1': string
        '6_2': string
        '7_1': string
        '7_2': string
      }
      Auscultation: {
        '2_1_1': string
        '2_2_1': string
        '2_1_2': string
        '2_2_2': string
        '2_1_3': string
        '2_2_3': string
      }
    }
  }
  
  // Abdominal Examination (matching Google Colab template)
  AbdominalInguinalExamination: {
    Stomach: string
    Liver: string
    Spleen: string
    RF: string  // Right Flank
    LF: string  // Left Flank
    Umbilicus: string
    Appendix_RIF: string
    LIF: string
    Bladder: string
    Scrotum: string
    Inguinal: {
      '1_1': string
      '1_2': string
    }
  }
  
  GeneratedOn: string
}

// Body diagram coordinates (matching Google Colab format)
export interface DiagramCoordinate {
  x: number
  y: number
  label: string
  textKey: string
  fromCoord?: [number, number]
  toCoord?: [number, number]
}

// Examination region mapping
export interface ExaminationRegion {
  id: string
  label: string
  category: 'head' | 'upper' | 'lower' | 'chest' | 'abdomen'
  side?: 'left' | 'right' | 'bilateral'
  coordinates?: DiagramCoordinate
}

// Create empty examination data factory
export const createEmptyExaminationData = (): ComprehensiveExaminationData => ({
  PatientInfo: {
    Name: '',
    Age: '',
    Sex: 'Male',
    ID: '',
    Chaperone: ''
  },
  VitalSigns: {
    Temperature: '',
    PulseRate: '',
    RespiratoryRate: '',
    BloodPressure: '',
    SpO2: '',
    Weight: '',
    Height: '',
    BMI: {
      Value: '',
      Status: ''
    },
    TakenOn: '',
    RecordedBy: ''
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
      ConsciousnessLevel: '',
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
    Stomach: '', Liver: '', Spleen: '', RF: '', LF: '', Umbilicus: '',
    Appendix_RIF: '', LIF: '', Bladder: '', Scrotum: '',
    Inguinal: { '1_1': '', '1_2': '' }
  },
  GeneratedOn: new Date().toLocaleString()
})

// BMI calculation helper
export const calculateBMI = (weight: string, height: string): { value: string; status: string } => {
  const weightNum = parseFloat(weight)
  const heightNum = parseFloat(height) / 100 // convert cm to m
  
  if (!weightNum || !heightNum) {
    return { value: '', status: '' }
  }
  
  const bmi = weightNum / (heightNum * heightNum)
  const bmiValue = bmi.toFixed(1)
  
  let bmiStatus = ''
  if (bmi < 18.5) bmiStatus = 'Underweight'
  else if (bmi < 25) bmiStatus = 'Normal'
  else if (bmi < 30) bmiStatus = 'Overweight'
  else bmiStatus = 'Obese'
  
  return { value: bmiValue, status: bmiStatus }
}