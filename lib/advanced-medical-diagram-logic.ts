// Advanced Medical Text Analysis System for Diagram Selection
export interface DiagramMatch {
  type: string
  priority: number
  findings: string[]
  reason: string
}

export interface MedicalAnalysis {
  regions: Map<string, { 
    score: number
    terms: string[]
    severity: string
    laterality: string
    examTypes: string[]
  }>
  overallSeverity: string
  primaryRegions: string[]
}

// Comprehensive Medical Terminology Database
export const MEDICAL_TERMINOLOGY = {
  anatomicalRegions: {
    head_neck: {
      terms: [
        // Head/Brain/Skull
        'head', 'skull', 'cranium', 'brain', 'cerebral', 'intracranial', 'scalp',
        // Face/Facial structures
        'face', 'facial', 'forehead', 'cheek', 'cheeks', 'chin', 'jaw', 'mandible', 'maxilla',
        // Eyes/Vision
        'eye', 'eyes', 'ocular', 'visual', 'pupil', 'pupils', 'iris', 'sclera', 'conjunctiva', 'eyelid', 'eyelids',
        'vision', 'sight', 'blind', 'diplopia', 'nystagmus', 'ptosis', 'strabismus',
        // Ears/Hearing  
        'ear', 'ears', 'auditory', 'hearing', 'tympanic', 'eardrum', 'otitis', 'tinnitus',
        // Nose/Nasal
        'nose', 'nasal', 'nostril', 'nostrils', 'sinus', 'sinuses', 'rhinitis', 'epistaxis', 'nosebleed',
        // Mouth/Oral/Throat
        'mouth', 'oral', 'tongue', 'lips', 'teeth', 'tooth', 'gums', 'throat', 'pharynx', 'larynx',
        'swallowing', 'dysphagia', 'hoarse', 'hoarseness',
        // Neck
        'neck', 'cervical', 'thyroid', 'lymph node', 'lymph nodes', 'carotid', 'jugular', 'trachea',
        'cervical spine', 'c-spine'
      ],
      priority: 1,
      views: ['front'],
      keywords: ['head', 'face', 'eye', 'ear', 'nose', 'mouth', 'neck', 'throat']
    },

    cardiovascular: {
      terms: [
        // Heart examination
        'heart', 'cardiac', 'cardio', 'cardiovascular', 'murmur', 'murmurs', 'gallop', 'rub', 
        'valve', 'valves', 'mitral', 'aortic', 'tricuspid', 'pulmonary valve',
        'heart sounds', 'heart sound', 's1', 's2', 's3', 's4', 'systolic', 'diastolic', 
        'apex beat', 'pmi', 'point of maximal impulse',
        // Vascular examination
        'pulse', 'pulses', 'pulsation', 'blood pressure', 'bp', 'hypertension', 'hypotension', 
        'arrhythmia', 'irregular', 'tachycardia', 'bradycardia',
        'carotid pulse', 'jugular', 'jvp', 'jugular venous pressure', 'edema', 'swelling',
        'cyanosis', 'perfusion', 'circulation',
        // Chest cardiac examination
        'precordium', 'precordial', 'parasternal', 'suprasternal', 'substernal', 'heave', 'lift'
      ],
      priority: 2,
      views: ['cardiorespi', 'front'],
      keywords: ['heart', 'cardiac', 'murmur', 'pulse', 'blood pressure']
    },

    respiratory: {
      terms: [
        // Lungs/Breathing
        'lung', 'lungs', 'pulmonary', 'respiratory', 'breathing', 'breath', 'breathe',
        'dyspnea', 'shortness of breath', 'sob', 'tachypnea', 'bradypnea', 'apnea',
        'wheeze', 'wheezing', 'rhonchi', 'rales', 'crackles', 'stridor', 'pleural', 
        'pneumonia', 'asthma', 'copd', 'emphysema',
        // Chest examination
        'chest', 'thorax', 'thoracic', 'intercostal', 'diaphragm', 'expansion', 'excursion',
        'percussion', 'percuss', 'dull', 'dullness', 'resonant', 'hyperresonant', 'tympanic',
        'auscultation', 'auscultate', 'breath sounds', 'vesicular', 'bronchial', 'diminished',
        'absent breath sounds', 'decreased breath sounds'
      ],
      priority: 2,
      views: ['cardiorespi', 'front', 'back'],
      keywords: ['lung', 'breath', 'chest', 'wheeze', 'cough']
    },

    abdominal: {
      terms: [
        // General abdomen
        'abdomen', 'abdominal', 'stomach', 'belly', 'epigastric', 'hypogastric', 'umbilical',
        'periumbilical', 'suprapubic',
        'right upper quadrant', 'left upper quadrant', 'right lower quadrant', 'left lower quadrant',
        'ruq', 'luq', 'rlq', 'llq', 'quadrant', 'quadrants',
        // Organs
        'liver', 'hepatic', 'hepatomegaly', 'spleen', 'splenic', 'splenomegaly', 
        'pancreas', 'pancreatic', 'gallbladder', 'appendix', 'appendicitis',
        'bowel', 'bowels', 'intestine', 'intestines', 'colon', 'rectum', 'rectal',
        // Findings
        'tender', 'tenderness', 'pain', 'painful', 'guarding', 'rigidity', 'rebound',
        'distended', 'distention', 'bloated', 'mass', 'masses', 'hernia',
        'ascites', 'fluid', 'bruit', 'bruits', 'unremarkable'
      ],
      priority: 3,
      views: ['abdominallinguinal', 'front'],
      keywords: ['abdomen', 'stomach', 'liver', 'spleen', 'bowel']
    },

    genitourinary: {
      terms: [
        // Urinary system
        'kidney', 'kidneys', 'renal', 'bladder', 'urethra', 'ureter', 'ureters',
        'urinary', 'urine', 'dysuria', 'hematuria', 'proteinuria', 'frequency', 'urgency',
        'costovertebral angle', 'cva', 'cva tenderness', 'flank', 'flank pain', 'suprapubic',
        // Reproductive system
        'pelvis', 'pelvic', 'pelvic exam', 'perineum', 'perineal', 'genital', 'genitals',
        'inguinal', 'groin', 'hernia', 'lymph nodes'
      ],
      priority: 3,
      views: ['abdominallinguinal', 'front'],
      keywords: ['kidney', 'bladder', 'urine', 'pelvis', 'groin']
    },

    musculoskeletal: {
      terms: [
        // General MSK
        'joint', 'joints', 'muscle', 'muscles', 'muscular', 'bone', 'bones', 'skeletal',
        'range of motion', 'rom', 'mobility', 'movement', 'strength', 'weakness', 'weak',
        'atrophy', 'spasm', 'spasms', 'contracture', 'deformity', 'swelling', 'inflammation',
        // Spine/Back
        'spine', 'spinal', 'vertebra', 'vertebrae', 'vertebral', 'back', 'back pain',
        'lumbar', 'thoracic', 'cervical', 'sacral', 'coccyx',
        'scoliosis', 'kyphosis', 'lordosis', 'sciatica', 'radiculopathy',
        // Extremities
        'extremity', 'extremities', 'limb', 'limbs', 'upper extremity', 'lower extremity',
        'arm', 'arms', 'leg', 'legs', 'hand', 'hands', 'foot', 'feet'
      ],
      priority: 4,
      views: ['front', 'back', 'leftside', 'rightside'],
      keywords: ['joint', 'muscle', 'bone', 'spine', 'back', 'arm', 'leg']
    },

    neurological: {
      terms: [
        // General neuro
        'neurological', 'neurologic', 'neuro', 'nervous system', 'cns', 'pns',
        'mental status', 'consciousness', 'alert', 'oriented', 'confused', 'lethargic', 'stupor',
        // Motor/Sensory
        'motor', 'sensory', 'sensation', 'reflex', 'reflexes', 'dtr', 'deep tendon reflexes',
        'strength', 'weakness', 'paralysis', 'paresis', 'hemiparesis', 'hemiplegia',
        'numbness', 'tingling', 'paresthesia', 'hyperesthesia', 'anesthesia',
        // Coordination/Movement
        'coordination', 'ataxia', 'tremor', 'tremors', 'gait', 'balance', 'romberg',
        'dysmetria', 'dysdiadochokinesia', 'intention tremor',
        // Cranial nerves
        'cranial nerve', 'cranial nerves', 'facial nerve', 'trigeminal', 'optic nerve',
        'facial droop', 'facial weakness', 'bell palsy'
      ],
      priority: 4,
      views: ['front', 'leftside', 'rightside'],
      keywords: ['neuro', 'weakness', 'reflex', 'sensation', 'tremor']
    }
  },

  // Laterality detection patterns
  laterality: {
    left: [
      'left', 'left-sided', 'left side', 'sinister',
      'left hand', 'left arm', 'left leg', 'left foot', 'left knee', 'left shoulder',
      'left eye', 'left ear', 'left breast', 'left lung', 'left kidney',
      'left upper', 'left lower', 'left facial', 'left hemiparesis'
    ],
    right: [
      'right', 'right-sided', 'right side', 'dexter', 
      'right hand', 'right arm', 'right leg', 'right foot', 'right knee', 'right shoulder',
      'right eye', 'right ear', 'right breast', 'right lung', 'right kidney',
      'right upper', 'right lower', 'right facial', 'right hemiparesis'
    ],
    bilateral: [
      'bilateral', 'both sides', 'bilaterally', 'both', 'symmetrical', 'symmetric',
      'both arms', 'both legs', 'both hands', 'both feet', 'both eyes', 'both ears'
    ]
  },

  // Clinical severity indicators
  severity: {
    critical: ['emergency', 'critical', 'life-threatening', 'severe acute', 'urgent'],
    high: ['severe', 'significant', 'marked', 'pronounced', 'obvious', 'striking', 'dramatic'],
    moderate: ['moderate', 'noticeable', 'evident', 'present', 'visible', 'palpable', 'appreciable'],
    mild: ['mild', 'slight', 'minimal', 'subtle', 'trace', 'questionable', 'possible'],
    normal: ['normal', 'unremarkable', 'within normal limits', 'wnl', 'negative', 'clear', 'intact']
  },

  // Medical examination methods
  examMethods: {
    inspection: ['inspection', 'inspect', 'visual', 'appearance', 'looks', 'appears', 'visible', 'observed'],
    palpation: ['palpation', 'palpate', 'palpable', 'feels', 'touch', 'pressure', 'mass', 'tender', 'palpated'],
    percussion: ['percussion', 'percuss', 'dull', 'resonant', 'hyperresonant', 'tympanic', 'percussed'],
    auscultation: ['auscultation', 'auscultate', 'listen', 'listened', 'sounds', 'murmur', 'bruit', 'rub']
  }
}

export class AdvancedMedicalTextAnalyzer {
  
  static analyzeMedicalText(text: string): MedicalAnalysis {
    const lowerText = text.toLowerCase()
    const analysis: MedicalAnalysis = {
      regions: new Map(),
      overallSeverity: 'mild',
      primaryRegions: []
    }

    // Analyze each anatomical region
    Object.entries(MEDICAL_TERMINOLOGY.anatomicalRegions).forEach(([regionName, regionConfig]) => {
      let score = 0
      const foundTerms: string[] = []
      let maxSeverity = 'mild'
      let laterality = 'central'
      const examTypes: string[] = []

      // Check for region-specific terms
      regionConfig.terms.forEach(term => {
        if (lowerText.includes(term)) {
          score += 1
          foundTerms.push(term)

          // Analyze context around the term (±100 characters)
          const termIndex = lowerText.indexOf(term)
          const contextStart = Math.max(0, termIndex - 100)
          const contextEnd = Math.min(lowerText.length, termIndex + term.length + 100)
          const context = lowerText.substring(contextStart, contextEnd)

          // Severity analysis in context
          Object.entries(MEDICAL_TERMINOLOGY.severity).forEach(([sevLevel, sevTerms]) => {
            if (sevTerms.some(sevTerm => context.includes(sevTerm))) {
              if (this.getSeverityWeight(sevLevel) > this.getSeverityWeight(maxSeverity)) {
                maxSeverity = sevLevel
              }
            }
          })

          // Laterality analysis
          if (MEDICAL_TERMINOLOGY.laterality.left.some(lat => context.includes(lat))) {
            laterality = 'left'
          } else if (MEDICAL_TERMINOLOGY.laterality.right.some(lat => context.includes(lat))) {
            laterality = 'right'
          } else if (MEDICAL_TERMINOLOGY.laterality.bilateral.some(lat => context.includes(lat))) {
            laterality = 'bilateral'
          }

          // Examination method detection
          Object.entries(MEDICAL_TERMINOLOGY.examMethods).forEach(([method, methodTerms]) => {
            if (methodTerms.some(methodTerm => context.includes(methodTerm))) {
              if (!examTypes.includes(method)) {
                examTypes.push(method)
              }
            }
          })
        }
      })

      if (score > 0) {
        analysis.regions.set(regionName, { 
          score, 
          terms: foundTerms, 
          severity: maxSeverity, 
          laterality, 
          examTypes 
        })
      }
    })

    // Determine primary regions (top 3 by score)
    const sortedRegions = Array.from(analysis.regions.entries())
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, 3)
    
    analysis.primaryRegions = sortedRegions.map(([region]) => region)

    // Determine overall severity
    const severityLevels = Array.from(analysis.regions.values()).map(r => r.severity)
    analysis.overallSeverity = this.getHighestSeverity(severityLevels)

    return analysis
  }

  static generateDiagramRecommendations(analysis: MedicalAnalysis, patientGender: 'male' | 'female'): DiagramMatch[] {
    const recommendations: DiagramMatch[] = []
    const usedViews = new Set<string>()

    // Process each detected region
    analysis.regions.forEach((regionData, regionName) => {
      const regionConfig = MEDICAL_TERMINOLOGY.anatomicalRegions[regionName as keyof typeof MEDICAL_TERMINOLOGY.anatomicalRegions]
      
      // Calculate adjusted priority based on severity and score
      let basePriority = regionConfig.priority
      
      // Severity adjustments
      switch (regionData.severity) {
        case 'critical': basePriority -= 2; break
        case 'high': basePriority -= 1; break
        case 'moderate': basePriority += 0; break
        case 'mild': basePriority += 1; break
        case 'normal': basePriority += 2; break
      }

      // Score-based priority adjustment
      if (regionData.score >= 5) basePriority -= 0.5
      else if (regionData.score >= 3) basePriority -= 0.2

      // Determine views based on region and laterality
      let viewsToRecommend = [...regionConfig.views]
      
      // Laterality-specific view additions
      if (regionData.laterality === 'left') {
        if (!viewsToRecommend.includes('leftside')) {
          viewsToRecommend.push('leftside')
        }
      } else if (regionData.laterality === 'right') {
        if (!viewsToRecommend.includes('rightside')) {
          viewsToRecommend.push('rightside')
        }
      } else if (regionData.laterality === 'bilateral') {
        if (!viewsToRecommend.includes('leftside')) viewsToRecommend.push('leftside')
        if (!viewsToRecommend.includes('rightside')) viewsToRecommend.push('rightside')
      }

      // Add recommendations for each view
      viewsToRecommend.forEach((view, index) => {
        const viewPriority = basePriority + (index * 0.1)
        
        if (!usedViews.has(view)) {
          const finding = `${regionName.replace(/_/g, ' ')} examination`
          const severityNote = regionData.severity !== 'mild' ? ` (${regionData.severity})` : ''
          const lateralityNote = regionData.laterality !== 'central' ? ` - ${regionData.laterality} sided` : ''
          
          recommendations.push({
            type: view,
            priority: viewPriority,
            findings: [`${finding}${severityNote}${lateralityNote}`],
            reason: `${regionData.score} medical terms detected: ${regionData.terms.slice(0, 3).join(', ')}`
          })
          
          usedViews.add(view)
        }
      })
    })

    // Sort by priority and return top 3
    const sortedRecommendations = recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)

    // Ensure we always have at least one view
    if (sortedRecommendations.length === 0) {
      return [{
        type: 'front',
        priority: 10,
        findings: ['general physical examination'],
        reason: 'Default view - comprehensive medical examination'
      }]
    }

    return sortedRecommendations
  }

  private static getSeverityWeight(severity: string): number {
    const weights = { critical: 5, high: 4, moderate: 3, mild: 2, normal: 1 }
    return weights[severity as keyof typeof weights] || 1
  }

  private static getHighestSeverity(severityLevels: string[]): string {
    if (severityLevels.includes('critical')) return 'critical'
    if (severityLevels.includes('high')) return 'high'
    if (severityLevels.includes('moderate')) return 'moderate'
    if (severityLevels.includes('mild')) return 'mild'
    return 'normal'
  }
}
