export interface ClinicalFinding {
  id: string
  text: string
  bodyRegion: string
  findingType: 'symptom' | 'examination' | 'investigation' | 'assessment'
  clinicalSignificance: 'normal' | 'abnormal' | 'equivocal'
  severity?: 'mild' | 'moderate' | 'severe'
  laterality?: 'left' | 'right' | 'bilateral' | 'unilateral'
  anatomicalLocation: string
  description: string
  priority: number // 1-5, higher = more important
}

export interface MedicalContext {
  patientGender: 'male' | 'female'
  age?: number
  chiefComplaint?: string
  examinationType: 'general' | 'systemic' | 'focused' | 'comprehensive'
  bodySystems: string[]
}

export interface IntelligentAnalysis {
  findings: ClinicalFinding[]
  bodyRegions: string[]
  recommendedDiagrams: string[]
  clinicalSummary: string
  abnormalFindings: ClinicalFinding[]
  normalFindings: ClinicalFinding[]
  priorityFindings: ClinicalFinding[]
}

export class IntelligentMedicalAnalyzer {
  private static instance: IntelligentMedicalAnalyzer
  
  // Enhanced medical terminology and patterns for better detection
  private readonly CLINICAL_INDICATORS = {
    examination: [
      'examination', 'exam', 'inspection', 'palpation', 'percussion', 'auscultation',
      'observed', 'noted', 'found', 'revealed', 'demonstrated', 'showed',
      'appears', 'looks', 'seems', 'presents', 'displays', 'shows'
    ],
    symptoms: [
      'complains', 'reports', 'experiences', 'feels', 'suffers', 'presents with',
      'pain', 'discomfort', 'tenderness', 'swelling', 'redness', 'warmth',
      'ache', 'soreness', 'burning', 'tingling', 'numbness', 'weakness'
    ],
    normal: [
      'normal', 'unremarkable', 'clear', 'healthy', 'intact', 'symmetrical',
      'no tenderness', 'no swelling', 'no abnormality', 'within normal limits',
      'good', 'adequate', 'satisfactory', 'appropriate', 'physiological'
    ],
    abnormal: [
      'abnormal', 'tender', 'swollen', 'red', 'warm', 'asymmetrical',
      'decreased', 'increased', 'diminished', 'absent', 'irregular',
      'enlarged', 'distended', 'rigid', 'spastic', 'flaccid', 'edematous'
    ],
    severity: {
      mild: ['mild', 'slight', 'minimal', 'subtle', 'minor', 'trivial'],
      moderate: ['moderate', 'modest', 'noticeable', 'moderate', 'intermediate'],
      severe: ['severe', 'marked', 'significant', 'prominent', 'obvious', 'extreme']
    }
  }

  // Enhanced anatomical mapping with comprehensive medical terminology
  private readonly ANATOMICAL_MAPPING = {
    head: {
      regions: ['head', 'skull', 'scalp', 'cranium', 'cephalic'],
      systems: ['neurological', 'dermatological'],
      clinicalRelevance: 'high'
    },
    face: {
      regions: ['face', 'facial', 'cheek', 'chin', 'forehead', 'temple', 'zygoma', 'maxilla', 'mandible'],
      systems: ['dermatological', 'neurological', 'ophthalmological'],
      clinicalRelevance: 'high'
    },
    eyes: {
      regions: ['eye', 'eyes', 'ocular', 'visual', 'conjunctiva', 'sclera', 'cornea', 'pupil', 'iris', 'eyelid'],
      systems: ['ophthalmological', 'neurological'],
      clinicalRelevance: 'high'
    },
    ears: {
      regions: ['ear', 'ears', 'aural', 'hearing', 'auricle', 'tympanic', 'membrane', 'canal'],
      systems: ['otological', 'neurological'],
      clinicalRelevance: 'medium'
    },
    nose: {
      regions: ['nose', 'nasal', 'nostril', 'septum', 'turbinate', 'sinus'],
      systems: ['otolaryngological', 'respiratory'],
      clinicalRelevance: 'medium'
    },
    mouth: {
      regions: ['mouth', 'oral', 'dental', 'gums', 'teeth', 'tongue', 'palate', 'pharynx', 'uvula'],
      systems: ['dental', 'gastrointestinal'],
      clinicalRelevance: 'medium'
    },
    neck: {
      regions: ['neck', 'cervical', 'throat', 'larynx', 'trachea', 'thyroid', 'lymph', 'carotid'],
      systems: ['cardiovascular', 'respiratory', 'neurological'],
      clinicalRelevance: 'high'
    },
    chest: {
      regions: ['chest', 'thorax', 'thoracic', 'sternum', 'rib', 'costal', 'intercostal'],
      systems: ['cardiovascular', 'respiratory'],
      clinicalRelevance: 'high'
    },
    heart: {
      regions: ['heart', 'cardiac', 'cardiovascular', 'myocardium', 'pericardium', 'atrium', 'ventricle'],
      systems: ['cardiovascular'],
      clinicalRelevance: 'critical'
    },
    lungs: {
      regions: ['lung', 'lungs', 'pulmonary', 'respiratory', 'bronchi', 'alveoli', 'pleura'],
      systems: ['respiratory'],
      clinicalRelevance: 'critical'
    },
    abdomen: {
      regions: ['abdomen', 'abdominal', 'belly', 'epigastric', 'umbilical', 'hypogastric', 'quadrant'],
      systems: ['gastrointestinal', 'genitourinary'],
      clinicalRelevance: 'high'
    },
    pelvis: {
      regions: ['pelvis', 'pelvic', 'genital', 'inguinal', 'pubic', 'sacrum', 'coccyx'],
      systems: ['genitourinary', 'reproductive'],
      clinicalRelevance: 'high'
    },
    back: {
      regions: ['back', 'spine', 'spinal', 'vertebral', 'lumbar', 'thoracic', 'cervical', 'sacrum'],
      systems: ['musculoskeletal', 'neurological'],
      clinicalRelevance: 'high'
    },
    upperExtremities: {
      regions: ['arm', 'arms', 'shoulder', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'humerus', 'radius', 'ulna'],
      systems: ['musculoskeletal', 'neurological', 'vascular'],
      clinicalRelevance: 'medium'
    },
    lowerExtremities: {
      regions: ['leg', 'legs', 'thigh', 'knee', 'ankle', 'foot', 'toe', 'femur', 'tibia', 'fibula'],
      systems: ['musculoskeletal', 'neurological', 'vascular'],
      clinicalRelevance: 'medium'
    }
  }

  public static getInstance(): IntelligentMedicalAnalyzer {
    if (!IntelligentMedicalAnalyzer.instance) {
      IntelligentMedicalAnalyzer.instance = new IntelligentMedicalAnalyzer()
    }
    return IntelligentMedicalAnalyzer.instance
  }

  public analyzeMedicalText(text: string, context: MedicalContext): IntelligentAnalysis {
    if (!text || text.trim().length === 0) {
      return this.getDefaultAnalysis(context)
    }

    // Step 1: Extract ONLY the Physical Examination section
    const physicalExaminationText = this.extractPhysicalExaminationSection(text)
    
    if (!physicalExaminationText) {
      return this.getDefaultAnalysis(context)
    }

    // Step 2: Extract and classify clinical findings from Physical Examination only
    const findings = this.extractClinicalFindings(physicalExaminationText, context)
    
    // Step 2: Identify body regions and systems
    const bodyRegions = this.identifyBodyRegions(findings)
    
    // Step 3: Generate diagram recommendations
    const recommendedDiagrams = this.generateDiagramRecommendations(bodyRegions, context)
    
    // Step 4: Create clinical summary
    const clinicalSummary = this.generateClinicalSummary(findings)
    
    // Step 5: Categorize findings
    const abnormalFindings = findings.filter(f => f.clinicalSignificance === 'abnormal')
    const normalFindings = findings.filter(f => f.clinicalSignificance === 'normal')
    const priorityFindings = findings.filter(f => f.priority >= 4).sort((a, b) => b.priority - a.priority)

    return {
      findings,
      bodyRegions,
      recommendedDiagrams,
      clinicalSummary,
      abnormalFindings,
      normalFindings,
      priorityFindings
    }
  }

  private extractClinicalFindings(text: string, context: MedicalContext): ClinicalFinding[] {
    const findings: ClinicalFinding[] = []
    const sentences = this.splitIntoSentences(text)
    
    sentences.forEach((sentence, index) => {
      const finding = this.analyzeSentence(sentence, context, index)
      if (finding) {
        findings.push(finding)
      }
    })

    // Sort by priority and clinical significance
    return findings.sort((a, b) => {
      // Abnormal findings first
      if (a.clinicalSignificance !== b.clinicalSignificance) {
        if (a.clinicalSignificance === 'abnormal') return -1
        if (b.clinicalSignificance === 'abnormal') return 1
      }
      // Then by priority
      return b.priority - a.priority
    })
  }

  private analyzeSentence(sentence: string, context: MedicalContext, index: number): ClinicalFinding | null {
    const lowerSentence = sentence.toLowerCase().trim()
    
    // Skip very short sentences
    if (lowerSentence.length < 10) return null
    
    // Determine finding type
    const findingType = this.determineFindingType(lowerSentence)
    
    // Extract body region
    const bodyRegion = this.extractBodyRegion(lowerSentence, context)
    if (!bodyRegion) return null
    
    // Determine clinical significance
    const clinicalSignificance = this.determineClinicalSignificance(lowerSentence)
    
    // Extract severity
    const severity = this.extractSeverity(lowerSentence)
    
    // Extract laterality
    const laterality = this.extractLaterality(lowerSentence)
    
    // Calculate priority
    const priority = this.calculatePriority(clinicalSignificance, severity, bodyRegion.primary, context)
    
    // Generate description
    const description = this.generateDescription(sentence, bodyRegion.primary, clinicalSignificance)
    
    return {
      id: `finding_${index}`,
      text: sentence.trim(),
      bodyRegion: bodyRegion.primary,
      findingType,
      clinicalSignificance,
      severity,
      laterality,
      anatomicalLocation: bodyRegion.detailed,
      description,
      priority
    }
  }

  private determineFindingType(sentence: string): 'symptom' | 'examination' | 'investigation' | 'assessment' {
    const lowerSentence = sentence.toLowerCase()
    
    if (this.CLINICAL_INDICATORS.examination.some(indicator => lowerSentence.includes(indicator))) {
      return 'examination'
    }
    
    if (this.CLINICAL_INDICATORS.symptoms.some(indicator => lowerSentence.includes(indicator))) {
      return 'symptom'
    }
    
    // Default to examination if unclear
    return 'examination'
  }

  private extractBodyRegion(sentence: string, context: MedicalContext): { primary: string; detailed: string } | null {
    const lowerSentence = sentence.toLowerCase()
    
    // Check each anatomical category with fuzzy matching
    for (const [category, info] of Object.entries(this.ANATOMICAL_MAPPING)) {
      // Exact match first
      const exactMatch = info.regions.find(region => lowerSentence.includes(region))
      if (exactMatch) {
        return {
          primary: category,
          detailed: exactMatch
        }
      }
      
      // Fuzzy match for similar terms
      const fuzzyMatch = this.findFuzzyMatch(lowerSentence, info.regions)
      if (fuzzyMatch) {
        return {
          primary: category,
          detailed: fuzzyMatch
        }
      }
    }
    
    return null
  }

  /**
   * Fuzzy matching for medical terms with common variations
   */
  private findFuzzyMatch(sentence: string, regions: string[]): string | null {
    // Common medical term variations and abbreviations
    const termVariations: { [key: string]: string[] } = {
      'heart': ['hr', 'cardiac', 'myocardium'],
      'lungs': ['lung', 'pulm', 'resp'],
      'abdomen': ['abdo', 'belly', 'stomach'],
      'chest': ['thorax', 'thoracic'],
      'head': ['skull', 'cranium'],
      'eyes': ['ocular', 'visual'],
      'ears': ['aural', 'otological'],
      'nose': ['nasal', 'rhinological'],
      'mouth': ['oral', 'buccal'],
      'neck': ['cervical', 'throat'],
      'back': ['spine', 'vertebral', 'dorsal'],
      'arms': ['upper extremities', 'upper limbs'],
      'legs': ['lower extremities', 'lower limbs']
    }
    
    for (const region of regions) {
      // Check exact match
      if (sentence.includes(region)) return region
      
      // Check variations
      const variations = termVariations[region] || []
      for (const variation of variations) {
        if (sentence.includes(variation)) return region
      }
    }
    
    return null
  }

  private determineClinicalSignificance(sentence: string): 'normal' | 'abnormal' | 'equivocal' {
    const lowerSentence = sentence.toLowerCase()
    
    // Enhanced context-aware detection
    const normalCount = this.CLINICAL_INDICATORS.normal.filter(indicator => 
      lowerSentence.includes(indicator)
    ).length
    
    const abnormalCount = this.CLINICAL_INDICATORS.abnormal.filter(indicator => 
      lowerSentence.includes(indicator)
    ).length
    
    // Context-aware rules for better accuracy
    if (this.hasNegativeContext(lowerSentence)) {
      // "No tenderness" = normal, "No abnormality" = normal
      return 'normal'
    }
    
    if (this.hasPositiveContext(lowerSentence)) {
      // "Tenderness present" = abnormal, "Swelling noted" = abnormal
      return 'abnormal'
    }
    
    // Count-based fallback
    if (normalCount > abnormalCount) return 'normal'
    if (abnormalCount > normalCount) return 'abnormal'
    return 'equivocal'
  }

  /**
   * Detects negative context (e.g., "no tenderness", "no abnormality")
   */
  private hasNegativeContext(sentence: string): boolean {
    const negativePatterns = [
      /no\s+\w+/,           // "no tenderness", "no swelling"
      /not\s+\w+/,          // "not tender", "not swollen"
      /without\s+\w+/,      // "without tenderness"
      /absence\s+of/,       // "absence of tenderness"
      /free\s+from/,        // "free from tenderness"
      /clear\s+of/,         // "clear of tenderness"
      /negative\s+for/,     // "negative for tenderness"
      /unremarkable/,       // "unremarkable"
      /within\s+normal\s+limits/, // "within normal limits"
      /normal\s+range/      // "normal range"
    ]
    
    return negativePatterns.some(pattern => pattern.test(sentence))
  }

  /**
   * Detects positive context (e.g., "tenderness present", "swelling noted")
   */
  private hasPositiveContext(sentence: string): boolean {
    const positivePatterns = [
      /tender/,             // "tender"
      /swollen/,            // "swollen"
      /red/,                // "red"
      /warm/,               // "warm"
      /painful/,            // "painful"
      /enlarged/,           // "enlarged"
      /distended/,          // "distended"
      /rigid/,              // "rigid"
      /spastic/,            // "spastic"
      /flaccid/,            // "flaccid"
      /edematous/,          // "edematous"
      /asymmetrical/,       // "asymmetrical"
      /irregular/,          // "irregular"
      /decreased/,          // "decreased"
      /increased/,          // "increased"
      /diminished/,         // "diminished"
      /absent/,             // "absent" (in context of expected findings)
      /present/,            // "present" (in context of abnormal findings)
      /noted/,              // "noted" (in context of findings)
      /observed/            // "observed" (in context of findings)
    ]
    
    return positivePatterns.some(pattern => pattern.test(sentence))
  }

  private extractSeverity(sentence: string): 'mild' | 'moderate' | 'severe' | undefined {
    const lowerSentence = sentence.toLowerCase()
    
    for (const [severity, indicators] of Object.entries(this.CLINICAL_INDICATORS.severity)) {
      if (indicators.some(indicator => lowerSentence.includes(indicator))) {
        return severity as 'mild' | 'moderate' | 'severe'
      }
    }
    
    return undefined
  }

  private extractLaterality(sentence: string): 'left' | 'right' | 'bilateral' | 'unilateral' | undefined {
    const lowerSentence = sentence.toLowerCase()
    
    if (lowerSentence.includes('left') && lowerSentence.includes('right')) return 'bilateral'
    if (lowerSentence.includes('left')) return 'left'
    if (lowerSentence.includes('right')) return 'right'
    if (lowerSentence.includes('bilateral')) return 'bilateral'
    if (lowerSentence.includes('unilateral')) return 'unilateral'
    
    return undefined
  }

  private calculatePriority(
    significance: string, 
    severity: string | undefined, 
    bodyRegion: string, 
    context: MedicalContext
  ): number {
    let priority = 1
    
    // Clinical significance
    if (significance === 'abnormal') priority += 2
    if (significance === 'equivocal') priority += 1
    
    // Severity
    if (severity === 'severe') priority += 2
    if (severity === 'moderate') priority += 1
    
    // Body region importance
    const regionInfo = this.ANATOMICAL_MAPPING[bodyRegion as keyof typeof this.ANATOMICAL_MAPPING]
    if (regionInfo) {
      if (regionInfo.clinicalRelevance === 'critical') priority += 2
      if (regionInfo.clinicalRelevance === 'high') priority += 1
    }
    
    // Cap at 5
    return Math.min(priority, 5)
  }

  private generateDescription(
    sentence: string, 
    bodyRegion: string, 
    significance: string
  ): string {
    const regionName = bodyRegion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    if (significance === 'abnormal') {
      return `Abnormal finding in ${regionName}: ${sentence}`
    } else if (significance === 'normal') {
      return `${regionName}: ${sentence}`
    } else {
      return `${regionName} examination: ${sentence}`
    }
  }

  private identifyBodyRegions(findings: ClinicalFinding[]): string[] {
    const regions = new Set<string>()
    findings.forEach(finding => {
      regions.add(finding.bodyRegion)
    })
    return Array.from(regions)
  }

  private generateDiagramRecommendations(bodyRegions: string[], context: MedicalContext): string[] {
    const recommendations: string[] = []
    
    // Always include front view for comprehensive examination
    if (bodyRegions.length > 2) {
      recommendations.push(context.patientGender === 'male' ? 'malefront' : 'femalefront')
    }
    
    // Add specific views based on body regions with more precise mapping
    bodyRegions.forEach(region => {
      switch (region) {
        case 'heart':
        case 'lungs':
        case 'chest':
          recommendations.push(context.patientGender === 'male' ? 'malecardiorespi' : 'femalecardiorespi')
          break
        case 'abdomen':
        case 'pelvis':
          recommendations.push(context.patientGender === 'male' ? 'maleabdominallinguinal' : 'femaleabdominallinguinal')
          break
        case 'back':
        case 'spine':
          recommendations.push(context.patientGender === 'male' ? 'back' : 'femaleback')
          break
        case 'upperExtremities':
          recommendations.push(context.patientGender === 'male' ? 'malefront' : 'femalefront')
          break
        case 'lowerExtremities':
          recommendations.push(context.patientGender === 'male' ? 'malefront' : 'femalefront')
          break
        case 'head':
        case 'face':
        case 'eyes':
        case 'ears':
        case 'nose':
        case 'mouth':
          recommendations.push(context.patientGender === 'male' ? 'malefront' : 'femalefront')
          break
        case 'neck':
          recommendations.push(context.patientGender === 'male' ? 'malefront' : 'femalefront')
          break
      }
    })
    
    // Remove duplicates and return
    return [...new Set(recommendations)]
  }

  private generateClinicalSummary(findings: ClinicalFinding[]): string {
    if (findings.length === 0) return 'No Physical Examination findings documented.'
    
    const abnormalCount = findings.filter(f => f.clinicalSignificance === 'abnormal').length
    const normalCount = findings.filter(f => f.clinicalSignificance === 'normal').length
    
    if (abnormalCount === 0) {
      return `Physical Examination reveals ${normalCount} normal finding(s) with no abnormalities detected.`
    }
    
    const priorityFindings = findings.filter(f => f.priority >= 4)
    if (priorityFindings.length > 0) {
      const primaryFinding = priorityFindings[0]
      return `Key Physical Examination finding: ${primaryFinding.description}. Total: ${abnormalCount} abnormal, ${normalCount} normal findings.`
    }
    
    return `Physical Examination reveals ${abnormalCount} abnormal finding(s) and ${normalCount} normal finding(s).`
  }

  private splitIntoSentences(text: string): string[] {
    // Split by sentence endings, but be smart about medical abbreviations
    const sentences = text.split(/(?<=[.!?])\s+/)
    
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !this.isMedicalAbbreviation(s))
  }

  private isMedicalAbbreviation(text: string): boolean {
    // Common medical abbreviations that might be mistaken for sentence endings
    const abbreviations = [
      'dr.', 'mr.', 'mrs.', 'ms.', 'prof.', 'dr', 'mr', 'mrs.', 'ms', 'prof',
      'vs.', 'vs', 'etc.', 'etc', 'i.e.', 'i.e', 'e.g.', 'e.g'
    ]
    
    return abbreviations.some(abbr => text.toLowerCase().includes(abbr))
  }

  private getDefaultAnalysis(context: MedicalContext): IntelligentAnalysis {
    return {
      findings: [],
      bodyRegions: [],
      recommendedDiagrams: [context.patientGender === 'male' ? 'malefront' : 'femalefront'],
      clinicalSummary: 'No Physical Examination section found in the medical note.',
      abnormalFindings: [],
      normalFindings: [],
      priorityFindings: []
    }
  }

  /**
   * Extracts ONLY the Physical Examination section from the medical note
   * This ensures we only analyze clinically relevant examination findings
   */
  private extractPhysicalExaminationSection(fullText: string): string | null {
    if (!fullText || fullText.trim() === '') {
      return null
    }

    const lowerText = fullText.toLowerCase()
    
    // First, check if the text contains physical examination indicators
    const physicalExamIndicators = [
      'temperature', 'temp', 'pulse', 'heart rate', 'blood pressure', 'bp',
      'respiratory rate', 'respiration', 'breathing', 'lungs', 'chest',
      'heart sounds', 'murmur', 'abdomen', 'abdominal', 'tender', 'palpation',
      'inspection', 'auscultation', 'percussion', 'lymph nodes', 'skin',
      'extremities', 'neurological', 'reflexes', 'pupils', 'throat',
      'ears', 'nose', 'mouth', 'neck', 'thyroid', 'liver', 'spleen',
      'bowel sounds', 'edema', 'cyanosis', 'jaundice', 'rash', 'lesion'
    ]
    
    // Check if the text contains physical examination content
    const hasPhysicalExamContent = physicalExamIndicators.some(indicator => 
      lowerText.includes(indicator)
    )
    
    // If no physical exam content detected, return null
    if (!hasPhysicalExamContent) {
      return null
    }
    
    // Common variations of Physical Examination section headers
    const sectionHeaders = [
      'physical examination',
      'physical exam',
      'examination',
      'exam',
      'clinical examination',
      'clinical exam',
      'objective examination',
      'objective findings',
      'examination findings',
      'physical findings'
    ]
    
    // Find the start of the Physical Examination section
    let startIndex = -1
    let headerFound = ''
    
    for (const header of sectionHeaders) {
      const index = lowerText.indexOf(header)
      if (index !== -1 && (startIndex === -1 || index < startIndex)) {
        startIndex = index
        headerFound = header
      }
    }
    
    // If no formal header found but we have physical exam content, treat entire text as examination
    if (startIndex === -1) {
      // Return the entire text if it contains physical examination content
      return fullText.trim()
    }
    
    // Find the end of the Physical Examination section
    // Look for the next major section header
    const nextSectionHeaders = [
      'assessment',
      'diagnosis',
      'plan',
      'treatment',
      'medications',
      'prescriptions',
      'recommendations',
      'follow-up',
      'discharge',
      'summary'
    ]
    
    let endIndex = fullText.length
    
    for (const nextHeader of nextSectionHeaders) {
      const nextIndex = lowerText.indexOf(nextHeader, startIndex + headerFound.length)
      if (nextIndex !== -1 && nextIndex < endIndex) {
        endIndex = nextIndex
      }
    }
    
    // Extract the Physical Examination section
    const sectionText = fullText.substring(startIndex, endIndex).trim()
    
    // Clean up the text - remove the header and any leading/trailing whitespace
    const cleanText = sectionText
      .replace(new RegExp(headerFound, 'i'), '')
      .trim()
    
    return cleanText || null
  }
}
