

// Medical diagram types based on available mapped JSONs
export type DiagramType = 
  | 'front' 
  | 'back' 
  | 'leftside' 
  | 'rightside' 
  | 'cardiorespi' 
  | 'abdominallinguinal'
  | 'malefront'
  | 'femalefront'
  | 'maleback'
  | 'femaleback'
  | 'maleleftside'
  | 'femaleleftside'
  | 'malerightside'
  | 'femalerightside'
  | 'malecardiorespi'
  | 'femalecardiorespi'
  | 'maleabdominallinguinal'
  | 'femaleabdominallinguinal';

export interface DiagramConfig {
  type: DiagramType;
  imagePath: string;
  jsonKey: string;
  priority: number;
  mirrorImage?: boolean;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ExaminationAnalysis {
  primaryDiagram: DiagramConfig;
  secondaryDiagrams: DiagramConfig[];
  confidence: number;
  reasoningFactors: string[];
}

// Keywords that indicate specific examination types
const EXAMINATION_KEYWORDS = {
  cardiovascular: [
    'heart', 'cardiac', 'cardio', 'chest pain', 'palpitation', 'murmur', 
    'tachycardia', 'bradycardia', 'arrhythmia', 'pulse', 'blood pressure',
    's1', 's2', 's3', 's4', 'gallop', 'rub', 'apex', 'precordium'
  ],
  respiratory: [
    'lung', 'breath', 'cough', 'wheeze', 'stridor', 'rale', 'crackle',
    'dyspnea', 'shortness of breath', 'chest', 'thorax', 'respiratory',
    'pneumonia', 'asthma', 'copd', 'pleural', 'bronchi'
  ],
  abdominal: [
    'abdomen', 'stomach', 'belly', 'bowel', 'liver', 'spleen', 'kidney',
    'pain abdomen', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea',
    'constipation', 'hepatomegaly', 'splenomegaly', 'ascites', 'hernia',
    'inguinal', 'umbilical', 'epigastric', 'hypogastric'
  ],
  back: [
    'back pain', 'spine', 'vertebra', 'lumbar', 'thoracic', 'cervical',
    'sciatica', 'spinal', 'kyphosis', 'scoliosis', 'lordosis', 'disc'
  ],
  musculoskeletal: [
    'joint', 'muscle', 'bone', 'fracture', 'strain', 'sprain', 'arthritis',
    'swelling', 'tender', 'mobility', 'range of motion', 'stiffness'
  ],
  neurological: [
    'neuro', 'reflex', 'sensation', 'motor', 'coordination', 'gait',
    'tremor', 'weakness', 'numbness', 'tingling', 'paralysis'
  ],
  dermatological: [
    'skin', 'rash', 'lesion', 'mole', 'bruise', 'wound', 'ulcer',
    'erythema', 'pruritus', 'dermatitis', 'eczema'
  ]
};

/**
 * Generate diagram configurations for a gender
 */
function getDiagramConfigs(gender: 'male' | 'female'): Record<DiagramType, DiagramConfig> {
  const genderPrefix = gender || 'male'; // Default to 'male' if gender is undefined
  
  return {
    front: {
      type: 'front',
      imagePath: `/medical-images/${genderPrefix}front.png`,
      jsonKey: `${genderPrefix}front.png`,
      priority: 1,
      dimensions: { width: 750, height: 1140 }
    },
    back: {
      type: 'back',
      imagePath: `/medical-images/${genderPrefix}back.png`,
      jsonKey: `${genderPrefix}back.png`,
      priority: 2,
      dimensions: { width: 750, height: 1140 }
    },
    leftside: {
      type: 'leftside',
      imagePath: `/medical-images/${genderPrefix}leftside.png`,
      jsonKey: `${genderPrefix}leftside.png`,
      priority: 3,
      mirrorImage: true, // Use CSS transform for left side
      dimensions: { width: 750, height: 1140 }
    },
    rightside: {
      type: 'rightside',
      imagePath: `/medical-images/${genderPrefix}rightside.png`,
      jsonKey: `rightside.png`, // Note: Uses generic key
      priority: 3,
      dimensions: { width: 750, height: 1140 }
    },
    cardiorespi: {
      type: 'cardiorespi',
      imagePath: `/medical-images/${genderPrefix}cardiorespi.png`,
      jsonKey: `${genderPrefix}cardiorespi.png`,
      priority: 4,
      dimensions: { width: 800, height: 1200 }
    },
    abdominallinguinal: {
      type: 'abdominallinguinal',
      imagePath: `/medical-images/${genderPrefix}abdominallinguinal.png`,
      jsonKey: `${genderPrefix}abdominallinguinal.png`,
      priority: 5,
      dimensions: { width: 800, height: 1200 }
    },
    // Gender-specific configurations
    malefront: {
      type: 'malefront',
      imagePath: '/medical-images/malefront.png',
      jsonKey: 'malefront.png',
      priority: 1,
      dimensions: { width: 750, height: 1140 }
    },
    femalefront: {
      type: 'femalefront',
      imagePath: '/medical-images/femalefront.png',
      jsonKey: 'femalefront.png',
      priority: 1,
      dimensions: { width: 750, height: 1140 }
    },
    maleback: {
      type: 'maleback',
      imagePath: '/medical-images/maleback.png',
      jsonKey: 'maleback.png',
      priority: 2,
      dimensions: { width: 750, height: 1140 }
    },
    femaleback: {
      type: 'femaleback',
      imagePath: '/medical-images/femaleback.png',
      jsonKey: 'femaleback.png',
      priority: 2,
      dimensions: { width: 750, height: 1140 }
    },
    maleleftside: {
      type: 'maleleftside',
      imagePath: '/medical-images/maleleftside.png',
      jsonKey: 'maleleftside.png',
      priority: 3,
      mirrorImage: true,
      dimensions: { width: 750, height: 1140 }
    },
    femaleleftside: {
      type: 'femaleleftside',
      imagePath: '/medical-images/femaleleftside.png',
      jsonKey: 'femaleleftside.png',
      priority: 3,
      mirrorImage: true,
      dimensions: { width: 750, height: 1140 }
    },
    malerightside: {
      type: 'malerightside',
      imagePath: '/medical-images/malerightside.png',
      jsonKey: 'malerightside.png',
      priority: 3,
      dimensions: { width: 750, height: 1140 }
    },
    femalerightside: {
      type: 'femalerightside',
      imagePath: '/medical-images/femalerightside.png',
      jsonKey: 'femalerightside.png',
      priority: 3,
      dimensions: { width: 750, height: 1140 }
    },
    malecardiorespi: {
      type: 'malecardiorespi',
      imagePath: '/medical-images/malecardiorespi.png',
      jsonKey: 'malecardiorespi.png',
      priority: 4,
      dimensions: { width: 800, height: 1200 }
    },
    femalecardiorespi: {
      type: 'femalecardiorespi',
      imagePath: '/medical-images/femalecardiorespi.png',
      jsonKey: 'femalecardiorespi.png',
      priority: 4,
      dimensions: { width: 800, height: 1200 }
    },
    maleabdominallinguinal: {
      type: 'maleabdominallinguinal',
      imagePath: '/medical-images/maleabdominallinguinal.png',
      jsonKey: 'maleabdominallinguinal.png',
      priority: 5,
      dimensions: { width: 800, height: 1200 }
    },
    femaleabdominallinguinal: {
      type: 'femaleabdominallinguinal',
      imagePath: '/medical-images/femaleabdominallinguinal.png',
      jsonKey: 'femaleabdominallinguinal.png',
      priority: 5,
      dimensions: { width: 800, height: 1200 }
    }
  };
}

/**
 * Analyze examination text and count keyword matches
 */
function analyzeExaminationContent(
  examinationData: {
    generalExamination?: string;
    cardiovascularExamination?: string;
    respiratoryExamination?: string;
    abdominalExamination?: string;
    otherSystemsExamination?: string;
  }
): Record<DiagramType, { score: number; factors: string[] }> {
  
  // Combine all examination text
  const allText = [
    examinationData.generalExamination || '',
    examinationData.cardiovascularExamination || '',
    examinationData.respiratoryExamination || '',
    examinationData.abdominalExamination || '',
    examinationData.otherSystemsExamination || ''
  ].join(' ').toLowerCase();
  
  const scores: Record<DiagramType, { score: number; factors: string[] }> = {
    front: { score: 1, factors: ['Default view'] }, // Always has base score
    back: { score: 0, factors: [] },
    leftside: { score: 0, factors: [] },
    rightside: { score: 0, factors: [] },
    cardiorespi: { score: 0, factors: [] },
    abdominallinguinal: { score: 0, factors: [] }
  };
  
  // Score cardiovascular/respiratory
  const cardioRespMatches = [
    ...EXAMINATION_KEYWORDS.cardiovascular,
    ...EXAMINATION_KEYWORDS.respiratory
  ].filter(keyword => allText.includes(keyword));
  
  if (cardioRespMatches.length > 0) {
    scores.cardiorespi = {
      score: cardioRespMatches.length * 2, // Higher weight for specialized views
      factors: [`Cardiovascular/Respiratory keywords: ${cardioRespMatches.slice(0, 3).join(', ')}`]
    };
  }
  
  // Score abdominal
  const abdominalMatches = EXAMINATION_KEYWORDS.abdominal.filter(keyword => allText.includes(keyword));
  if (abdominalMatches.length > 0) {
    scores.abdominallinguinal = {
      score: abdominalMatches.length * 2,
      factors: [`Abdominal keywords: ${abdominalMatches.slice(0, 3).join(', ')}`]
    };
  }
  
  // Score back view
  const backMatches = EXAMINATION_KEYWORDS.back.filter(keyword => allText.includes(keyword));
  if (backMatches.length > 0) {
    scores.back = {
      score: backMatches.length * 1.5,
      factors: [`Back/Spine keywords: ${backMatches.slice(0, 3).join(', ')}`]
    };
  }
  
  // Score musculoskeletal (affects front view)
  const musculoskeletalMatches = EXAMINATION_KEYWORDS.musculoskeletal.filter(keyword => allText.includes(keyword));
  if (musculoskeletalMatches.length > 0) {
    scores.front.score += musculoskeletalMatches.length;
    scores.front.factors.push(`Musculoskeletal findings: ${musculoskeletalMatches.slice(0, 3).join(', ')}`);
  }
  
  // Side views get bonus if specific side mentioned
  if (allText.includes('left') || allText.includes('sinister')) {
    scores.leftside.score += 1;
    scores.leftside.factors.push('Left side mentioned');
  }
  
  if (allText.includes('right') || allText.includes('dexter')) {
    scores.rightside.score += 1;
    scores.rightside.factors.push('Right side mentioned');
  }
  
  // Boost front view if general examination has content
  if (examinationData.generalExamination?.trim()) {
    scores.front.score += 0.5;
    scores.front.factors.push('General examination documented');
  }
  
  return scores;
  
  return scores;
}

/**
 * Select the best diagram type based on examination content
 */
export function selectDynamicDiagram(
  gender: 'male' | 'female',
  examinationData: {
    generalExamination?: string;
    cardiovascularExamination?: string;
    respiratoryExamination?: string;
    abdominalExamination?: string;
    otherSystemsExamination?: string;
  }
): ExaminationAnalysis {
  
  const diagramConfigs = getDiagramConfigs(gender);
  const analysisScores = analyzeExaminationContent(examinationData);
  
  // Sort diagrams by score (descending)
  const sortedDiagrams = Object.entries(analysisScores)
    .map(([type, data]) => ({
      type: type as DiagramType,
      config: diagramConfigs[type as DiagramType],
      score: data.score,
      factors: data.factors
    }))
    .sort((a, b) => b.score - a.score);
  
  const primaryDiagram = sortedDiagrams[0];
  const secondaryDiagrams = sortedDiagrams
    .slice(1, 3) // Top 2 alternatives
    .filter(d => d.score > 0)
    .map(d => d.config);
  
  // Calculate confidence based on score difference
  const topScore = primaryDiagram.score;
  const secondScore = sortedDiagrams[1]?.score || 0;
  const confidence = topScore > secondScore ? 
    Math.min(0.9, 0.5 + (topScore - secondScore) / 10) : 0.5;
  
  const result: ExaminationAnalysis = {
    primaryDiagram: primaryDiagram.config,
    secondaryDiagrams,
    confidence,
    reasoningFactors: primaryDiagram.factors
  };
  
  return result;
}

/**
 * Get multiple diagram options for user selection
 */
export function getRecommendedDiagrams(
  gender: 'male' | 'female',
  examinationData: {
    generalExamination?: string;
    cardiovascularExamination?: string;
    respiratoryExamination?: string;
    abdominalExamination?: string;
    otherSystemsExamination?: string;
  },
  limit: number = 3
): DiagramConfig[] {
  
  const analysis = selectDynamicDiagram(gender, examinationData);
  const recommended = [analysis.primaryDiagram, ...analysis.secondaryDiagrams].slice(0, limit);
  
  return recommended;
}

/**
 * Get ALL relevant diagrams that should be displayed simultaneously
 * based on examination findings (not just top 1)
 */
export function getAllRelevantDiagrams(
  gender: 'male' | 'female',
  examinationData: {
    generalExamination?: string;
    cardiovascularExamination?: string;
    respiratoryExamination?: string;
    abdominalExamination?: string;
    otherSystemsExamination?: string;
  },
  minScore: number = 1
): DiagramConfig[] {
  
  const diagramConfigs = getDiagramConfigs(gender);
  const analysisScores = analyzeExaminationContent(examinationData);
  
  // Get all diagrams with scores above minimum threshold
  const relevantDiagrams = Object.entries(analysisScores)
    .filter(([_, data]) => data.score >= minScore)
    .map(([type, data]) => ({
      type: type as DiagramType,
      config: diagramConfigs[type as DiagramType],
      score: data.score,
      factors: data.factors
    }))
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .map(d => d.config);
  
  // Always include front view if no other diagrams qualify
  if (relevantDiagrams.length === 0) {
    return [diagramConfigs.front];
  }
  
  return relevantDiagrams;
}

/**
 * Load coordinate data for a specific diagram
 */
export async function loadDiagramCoordinates(config: DiagramConfig): Promise<any> {
  try {
    // Dynamic import based on diagram type and gender
    const jsonFileName = config.type === 'leftside' ? 
      config.jsonKey.replace('.png', '.json') :
      config.type === 'rightside' ?
      'malerightside.json' : // Default to male for generic right side
      config.jsonKey.replace('.png', '.json');
    
    const coordsModule = await import(`../scripts/mappedJsons/${jsonFileName}`);
    const coords = coordsModule.default || coordsModule;
    
    return coords;
    
  } catch (error) {
    // Error loading diagram coordinates
    
    // Fallback to front view coordinates
    try {
      const fallbackModule = await import('../scripts/mappedJsons/malefront.json');
      return fallbackModule.default || fallbackModule;
      } catch (fallbackError) {
    // Error loading fallback coordinates
      return { coordinates_by_image: {} };
    }
  }
}

// Export everything needed
export { 
  getDiagramConfigs,
  analyzeExaminationContent,
  EXAMINATION_KEYWORDS
};