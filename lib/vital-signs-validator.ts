export interface VitalSigns {
  temperature?: string;
  bloodPressure?: string;
  pulseRate?: string;
  respiratoryRate?: string;
  glucose?: string;
  oxygenSaturation?: string;
  painScore?: string;
  age?: number; // Age in years for determining appropriate ranges
}

export interface VitalSignResult {
  value: string;
  isNormal: boolean;
  color: string;
  message: string;
  isNotMentioned?: boolean;
  severity?: 'normal' | 'mild' | 'moderate' | 'severe';
}

// Age groups for vital sign ranges
type AgeGroup = 'adult' | 'newborn' | 'infant' | 'toddler' | 'preschool' | 'school' | 'adolescent';

// Comprehensive age-specific vital sign ranges based on medical guidelines
const VITAL_SIGNS_RANGES = {
  temperature: {
    // All ages use same temperature ranges
    normal: { min: 36.1, max: 37.2 },
    fever: { min: 37.3, max: 38.0 },
    highFever: { min: 38.1, max: 40.0 },
    hyperthermia: { min: 40.1, max: 50.0 },
    hypothermia: { min: 20.0, max: 35.0 }
  },
  
  heartRate: {
    adult: { min: 60, max: 100, bradycardia: 60, tachycardia: 100 },
    newborn: { min: 100, max: 160, bradycardia: 100, tachycardia: 160 },
    infant: { min: 100, max: 160, bradycardia: 100, tachycardia: 160 },
    toddler: { min: 100, max: 140, bradycardia: 90, tachycardia: 160 },
    preschool: { min: 80, max: 120, bradycardia: 80, tachycardia: 130 },
    school: { min: 75, max: 120, bradycardia: 70, tachycardia: 140 },
    adolescent: { min: 60, max: 100, bradycardia: 60, tachycardia: 120 }
  },
  
  respiratoryRate: {
    adult: { min: 12, max: 20, bradypnea: 12, tachypnea: 20 },
    newborn: { min: 40, max: 60, bradypnea: 30, tachypnea: 60 },
    infant: { min: 30, max: 60, bradypnea: 30, tachypnea: 60 },
    toddler: { min: 25, max: 35, bradypnea: 20, tachypnea: 40 },
    preschool: { min: 20, max: 30, bradypnea: 15, tachypnea: 35 },
    school: { min: 18, max: 25, bradypnea: 15, tachypnea: 30 },
    adolescent: { min: 12, max: 20, bradypnea: 10, tachypnea: 25 }
  },
  
  bloodPressure: {
    adult: { 
      systolic: { min: 90, max: 120 }, 
      diastolic: { min: 60, max: 80 },
      hypertension: { systolic: 140, diastolic: 90 },
      hypotension: { systolic: 90, diastolic: 60 }
    },
    newborn: { 
      systolic: { min: 60, max: 90 }, 
      diastolic: { min: 30, max: 60 }
    },
    infant: { 
      systolic: { min: 70, max: 105 }, 
      diastolic: { min: 35, max: 70 }
    },
    child1to5: { 
      systolic: { min: 80, max: 110 }, 
      diastolic: { min: 50, max: 70 }
    },
    child6to12: { 
      systolic: { min: 90, max: 120 }, 
      diastolic: { min: 60, max: 80 }
    },
    adolescent: { 
      systolic: { min: 90, max: 120 }, 
      diastolic: { min: 60, max: 80 }
    }
  },
  
  glucose: {
    adult: {
      fasting: { min: 70, max: 99 },
      random: { min: 70, max: 140 },
      diabetes: { fasting: 126, random: 200 },
      hypoglycemia: 70
    },
    newborn: { min: 2.6, max: 4.4 }, // mmol/L
    infant: { min: 3.3, max: 6.0 }
  },
  
  oxygenSaturation: {
    normal: { min: 95, max: 100 },
    mild: { min: 91, max: 94 },
    severe: { min: 0, max: 90 }
  },
  
  painScore: {
    none: { min: 0, max: 0 },
    mild: { min: 1, max: 3 },
    moderate: { min: 4, max: 6 },
    severe: { min: 7, max: 10 }
  }
};

// Determine age group based on age in years
function getAgeGroup(age?: number): AgeGroup {
  if (!age || age >= 18) return 'adult';
  if (age < 1/12) return 'newborn'; // Less than 1 month
  if (age < 1) return 'infant'; // 1 month to 1 year
  if (age < 3) return 'toddler'; // 1-2 years
  if (age < 6) return 'preschool'; // 3-5 years
  if (age < 13) return 'school'; // 6-12 years
  return 'adolescent'; // 13-17 years
}

// Extract numeric value from string
function extractNumericValue(value: string): number | null {
  if (!value || value === 'Not mentioned') return null;
  
  // Remove common units and extract numbers
  const numericMatch = value.match(/(\d+(?:\.\d+)?)/);
  return numericMatch ? parseFloat(numericMatch[1]) : null;
}

// Extract systolic and diastolic from blood pressure
function extractBloodPressureValues(value: string): { systolic: number | null; diastolic: number | null } {
  if (!value || value === 'Not mentioned') return { systolic: null, diastolic: null };
  
  const bpMatch = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (bpMatch) {
    return {
      systolic: parseInt(bpMatch[1]),
      diastolic: parseInt(bpMatch[2])
    };
  }
  
  return { systolic: null, diastolic: null };
}

// Validate temperature (age-independent)
export function validateTemperature(temp: string, age?: number): VitalSignResult {
  const value = extractNumericValue(temp);
  
  if (value === null) {
    return {
      value: temp,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ranges = VITAL_SIGNS_RANGES.temperature;
  
  // Determine temperature status
  if (value >= ranges.normal.min && value <= ranges.normal.max) {
    return {
      value: temp,
      isNormal: true,
      color: 'text-green-600',
      message: 'Normal',
      severity: 'normal'
    };
  } else if (value >= ranges.fever.min && value <= ranges.fever.max) {
    return {
      value: temp,
      isNormal: false,
      color: 'text-yellow-600',
      message: 'Fever',
      severity: 'mild'
    };
  } else if (value >= ranges.highFever.min && value <= ranges.highFever.max) {
    return {
      value: temp,
      isNormal: false,
      color: 'text-orange-600',
      message: 'High Fever',
      severity: 'moderate'
    };
  } else if (value >= ranges.hyperthermia.min) {
    return {
      value: temp,
      isNormal: false,
      color: 'text-red-600',
      message: 'Hyperthermia',
      severity: 'severe'
    };
  } else {
  return {
    value: temp,
      isNormal: false,
      color: 'text-blue-600',
      message: 'Hypothermia',
      severity: 'severe'
    };
  }
}

// Validate blood pressure with age-specific ranges
export function validateBloodPressure(bp: string, age?: number): VitalSignResult {
  const { systolic, diastolic } = extractBloodPressureValues(bp);
  
  if (systolic === null || diastolic === null) {
    return {
      value: bp,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ageGroup = getAgeGroup(age);
  let ranges;
  
  // Select appropriate ranges based on age
  switch (ageGroup) {
    case 'newborn':
      ranges = VITAL_SIGNS_RANGES.bloodPressure.newborn;
      break;
    case 'infant':
      ranges = VITAL_SIGNS_RANGES.bloodPressure.infant;
      break;
    case 'toddler':
    case 'preschool':
      ranges = VITAL_SIGNS_RANGES.bloodPressure.child1to5;
      break;
    case 'school':
      ranges = VITAL_SIGNS_RANGES.bloodPressure.child6to12;
      break;
    case 'adolescent':
      ranges = VITAL_SIGNS_RANGES.bloodPressure.adolescent;
      break;
    default:
      ranges = VITAL_SIGNS_RANGES.bloodPressure.adult;
  }
  
  const isNormal = systolic >= ranges.systolic.min &&
                   systolic <= ranges.systolic.max &&
                   diastolic >= ranges.diastolic.min &&
                   diastolic <= ranges.diastolic.max;
  
  // Check for hypertension/hypotension in adults
  if (ageGroup === 'adult') {
    const adultRanges = VITAL_SIGNS_RANGES.bloodPressure.adult;
    if (systolic >= adultRanges.hypertension.systolic || diastolic >= adultRanges.hypertension.diastolic) {
      return {
        value: bp,
        isNormal: false,
        color: 'text-red-600',
        message: 'Hypertension',
        severity: 'moderate'
      };
    } else if (systolic <= adultRanges.hypotension.systolic || diastolic <= adultRanges.hypotension.diastolic) {
      return {
        value: bp,
        isNormal: false,
        color: 'text-blue-600',
        message: 'Hypotension',
        severity: 'moderate'
      };
    }
  }
  
  return {
    value: bp,
    isNormal,
    color: isNormal ? 'text-green-600' : 'text-red-600',
    message: isNormal ? 'Normal' : 'Abnormal',
    severity: isNormal ? 'normal' : 'mild'
  };
}

// Validate pulse rate with age-specific ranges
export function validatePulseRate(pulse: string, age?: number): VitalSignResult {
  const value = extractNumericValue(pulse);
  
  if (value === null) {
    return {
      value: pulse,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ageGroup = getAgeGroup(age);
  const ranges = VITAL_SIGNS_RANGES.heartRate[ageGroup];
  
  const isNormal = value >= ranges.min && value <= ranges.max;
  
  // Check for bradycardia or tachycardia
  if (value < ranges.bradycardia) {
    return {
      value: pulse,
      isNormal: false,
      color: 'text-blue-600',
      message: 'Bradycardia',
      severity: 'moderate'
    };
  } else if (value > ranges.tachycardia) {
    return {
      value: pulse,
      isNormal: false,
      color: 'text-red-600',
      message: 'Tachycardia',
      severity: 'moderate'
    };
  }
  
  return {
    value: pulse,
    isNormal,
    color: isNormal ? 'text-green-600' : 'text-yellow-600',
    message: isNormal ? 'Normal' : 'Borderline',
    severity: isNormal ? 'normal' : 'mild'
  };
}

// Validate respiratory rate with age-specific ranges
export function validateRespiratoryRate(rr: string, age?: number): VitalSignResult {
  const value = extractNumericValue(rr);
  
  if (value === null) {
    return {
      value: rr,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ageGroup = getAgeGroup(age);
  const ranges = VITAL_SIGNS_RANGES.respiratoryRate[ageGroup];
  
  const isNormal = value >= ranges.min && value <= ranges.max;
  
  // Check for bradypnea or tachypnea
  if (value < ranges.bradypnea) {
    return {
      value: rr,
      isNormal: false,
      color: 'text-blue-600',
      message: 'Bradypnea',
      severity: 'moderate'
    };
  } else if (value > ranges.tachypnea) {
    return {
      value: rr,
      isNormal: false,
      color: 'text-red-600',
      message: 'Tachypnea',
      severity: 'moderate'
    };
  }
  
  return {
    value: rr,
    isNormal,
    color: isNormal ? 'text-green-600' : 'text-yellow-600',
    message: isNormal ? 'Normal' : 'Borderline',
    severity: isNormal ? 'normal' : 'mild'
  };
}

// Validate glucose with age-specific ranges
export function validateGlucose(glucose: string, age?: number, testType: 'fasting' | 'random' = 'random'): VitalSignResult {
  const value = extractNumericValue(glucose);
  
  if (value === null) {
    return {
      value: glucose,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ageGroup = getAgeGroup(age);
  
  // Handle pediatric glucose ranges (different units - mmol/L)
  if (ageGroup === 'newborn') {
    const ranges = VITAL_SIGNS_RANGES.glucose.newborn;
    const isNormal = value >= ranges.min && value <= ranges.max;
    
    if (value < ranges.min) {
      return {
        value: glucose,
        isNormal: false,
        color: 'text-red-600',
        message: 'Hypoglycemia',
        severity: 'severe'
      };
    }
    
    return {
      value: glucose,
      isNormal,
      color: isNormal ? 'text-green-600' : 'text-yellow-600',
      message: isNormal ? 'Normal' : 'Elevated',
      severity: isNormal ? 'normal' : 'mild'
    };
  } else if (ageGroup === 'infant') {
    const ranges = VITAL_SIGNS_RANGES.glucose.infant;
    const isNormal = value >= ranges.min && value <= ranges.max;
  
  return {
    value: glucose,
    isNormal,
      color: isNormal ? 'text-green-600' : 'text-yellow-600',
      message: isNormal ? 'Normal' : 'Abnormal',
      severity: isNormal ? 'normal' : 'mild'
    };
  }
  
  // Adult glucose ranges
  const adultRanges = VITAL_SIGNS_RANGES.glucose.adult;
  const ranges = testType === 'fasting' ? adultRanges.fasting : adultRanges.random;
  const diabetesThreshold = testType === 'fasting' ? adultRanges.diabetes.fasting : adultRanges.diabetes.random;
  
  if (value < adultRanges.hypoglycemia) {
    return {
      value: glucose,
      isNormal: false,
      color: 'text-red-600',
      message: 'Hypoglycemia',
      severity: 'severe'
    };
  } else if (value >= diabetesThreshold) {
    return {
      value: glucose,
      isNormal: false,
      color: 'text-red-600',
      message: 'Diabetes Range',
      severity: 'severe'
    };
  } else if (value >= ranges.min && value <= ranges.max) {
    return {
      value: glucose,
      isNormal: true,
      color: 'text-green-600',
      message: 'Normal',
      severity: 'normal'
    };
  } else {
    return {
      value: glucose,
      isNormal: false,
      color: 'text-yellow-600',
      message: 'Pre-diabetic Range',
      severity: 'moderate'
    };
  }
}

// Validate oxygen saturation
export function validateOxygenSaturation(o2Sat: string): VitalSignResult {
  const value = extractNumericValue(o2Sat);
  
  if (value === null) {
    return {
      value: o2Sat,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ranges = VITAL_SIGNS_RANGES.oxygenSaturation;
  
  if (value >= ranges.normal.min && value <= ranges.normal.max) {
    return {
      value: o2Sat,
      isNormal: true,
      color: 'text-green-600',
      message: 'Normal',
      severity: 'normal'
    };
  } else if (value >= ranges.mild.min && value <= ranges.mild.max) {
    return {
      value: o2Sat,
      isNormal: false,
      color: 'text-yellow-600',
      message: 'Mild Hypoxemia',
      severity: 'mild'
    };
  } else {
    return {
      value: o2Sat,
      isNormal: false,
      color: 'text-red-600',
      message: 'Severe Hypoxemia',
      severity: 'severe'
    };
  }
}

// Validate pain score
export function validatePainScore(pain: string, ageGroup?: 'adult' | 'pediatric'): VitalSignResult {
  const value = extractNumericValue(pain);
  
  if (value === null) {
    return {
      value: pain,
      isNormal: false,
      color: 'text-gray-500',
      message: '',
      isNotMentioned: true
    };
  }
  
  const ranges = VITAL_SIGNS_RANGES.painScore;
  
  if (value >= ranges.none.min && value <= ranges.none.max) {
    return {
      value: pain,
      isNormal: true,
      color: 'text-green-600',
      message: 'No Pain',
      severity: 'normal'
    };
  } else if (value >= ranges.mild.min && value <= ranges.mild.max) {
    return {
      value: pain,
      isNormal: false,
      color: 'text-yellow-600',
      message: 'Mild Pain',
      severity: 'mild'
    };
  } else if (value >= ranges.moderate.min && value <= ranges.moderate.max) {
    return {
      value: pain,
      isNormal: false,
      color: 'text-orange-600',
      message: 'Moderate Pain',
      severity: 'moderate'
    };
  } else {
    return {
      value: pain,
      isNormal: false,
      color: 'text-red-600',
      message: 'Severe Pain',
      severity: 'severe'
    };
  }
}

// Validate all vital signs with age-specific ranges
export function validateAllVitalSigns(vitalSigns: VitalSigns) {
  const age = vitalSigns.age;
  
  return {
    temperature: validateTemperature(vitalSigns.temperature || '', age),
    bloodPressure: validateBloodPressure(vitalSigns.bloodPressure || '', age),
    pulseRate: validatePulseRate(vitalSigns.pulseRate || '', age),
    respiratoryRate: validateRespiratoryRate(vitalSigns.respiratoryRate || '', age),
    glucose: validateGlucose(vitalSigns.glucose || '', age),
    oxygenSaturation: vitalSigns.oxygenSaturation ? validateOxygenSaturation(vitalSigns.oxygenSaturation) : undefined,
    painScore: vitalSigns.painScore ? validatePainScore(vitalSigns.painScore, age && age < 18 ? 'pediatric' : 'adult') : undefined
  };
}

// Helper function to get age group description (for internal use only)
export function getAgeGroupDescription(age?: number): string {
  const ageGroup = getAgeGroup(age);
  switch (ageGroup) {
    case 'newborn': return 'Newborn (< 1 month)';
    case 'infant': return 'Infant (1 month - 1 year)';
    case 'toddler': return 'Toddler (1-2 years)';
    case 'preschool': return 'Preschool (3-5 years)';
    case 'school': return 'School Age (6-12 years)';
    case 'adolescent': return 'Adolescent (13-17 years)';
    default: return 'Adult (18+ years)';
  }
}

// Get normal range for display (kept for backward compatibility but should not be used)
export function getNormalRange(vitalSign: string): string {
  // Return generic message since ranges are now age-specific and hidden
  switch (vitalSign) {
    case 'temperature':
      return 'Age-appropriate range';
    case 'pulseRate':
    case 'heartRate':
      return 'Age-appropriate range';
    case 'respiratoryRate':
      return 'Age-appropriate range';
    case 'bloodPressure':
      return 'Age-appropriate range';
    case 'glucose':
      return 'Age-appropriate range';
    case 'oxygenSaturation':
      return 'Age-appropriate range';
    case 'painScore':
      return '0-10 scale';
    default:
      return 'Consult medical guidelines';
  }
}
