// intelligentTranscriptParser.js
// Advanced medical transcript parsing with pattern recognition and contextual analysis

class MedicalTranscriptParser {
  constructor() {
    // Medical vocabulary and patterns
    this.patterns = {
      // Patient Information Patterns
      patientName: [
        /(?:patient(?:'s)?\s+name\s+is\s+)([A-Za-z\s]+?)(?:\s*[,.]|$)/gi,
        /(?:this\s+is\s+)([A-Za-z\s]+?)(?:\s*[,.]|\s+who|\s+a\s+\d+)/gi,
        /(?:mr\.?\s+|mrs\.?\s+|ms\.?\s+|dr\.?\s+)([A-Za-z\s]+?)(?:\s*[,.]|$)/gi,
        /^([A-Za-z\s]+?)(?:\s+is\s+a\s+\d+|\s*,\s*\d+|\s+age\s+\d+)/gmi
      ],
      
      age: [
        /(?:age(?:d)?\s+)(\d+)(?:\s*years?)?/gi,
        /(\d+)(?:\s*-?\s*)?(?:years?\s*old|y\.?o\.?|yr\.?)/gi,
        /(?:patient\s+is\s+)(\d+)(?:\s*years?)?/gi,
        /(?:a\s+)(\d+)(?:\s*year\s*old)/gi
      ],
      
      gender: [
        /(?:gender|sex)(?:\s*:|\s+is)?\s*(male|female|m|f)(?:\s|$|,)/gi,
        /(?:he\s+is|she\s+is|patient\s+is\s+a\s+)(?:\d+\s*year\s*old\s+)?(male|female|man|woman)(?:\s|$|,)/gi,
        /(male|female|man|woman|boy|girl|gentleman|lady)(?:\s+patient|\s+who|\s*,)/gi
      ],

      // Vital Signs Patterns
      temperature: [
        /(?:temperature|temp|t)(?:\s*:|\s+is|\s+was|\s+reads?)?\s*(\d+\.?\d*)\s*(?:degrees?|°)?\s*(?:f|fahrenheit|c|celsius)?/gi,
        /(?:temp\s+)(\d+\.?\d*)/gi,
        /(?:febrile\s+at\s+|fever\s+of\s+)(\d+\.?\d*)/gi,
        // Enhanced patterns for descriptive vital signs
        /(?:temperature|temp)[\s.:]*([^.!?]*(?:normal|reading|afebrile|degrees?))/gi
      ],
      
      pulse: [
        /(?:pulse|heart\s*rate|hr)(?:\s*:|\s+is|\s+was|\s+at)?\s*(\d+)\s*(?:bpm|beats?\s*(?:per\s*)?minute?)?/gi,
        /(?:pulse\s+)(\d+)/gi,
        /(?:heart\s+beating\s+at\s+)(\d+)/gi,
        // Enhanced patterns for equipment issues and descriptive findings
        /(?:pulse\s+rate|heart\s+rate)[\s.:]*([^.!?]*(?:clear|reading|monitor|malfunction|try\s+again))/gi
      ],
      
      bloodPressure: [
        /(?:blood\s*pressure|bp|b\.p\.?)(?:\s*:|\s+is|\s+was|\s+reads?)?\s*(\d+\/\d+)\s*(?:mmhg)?/gi,
        /(?:bp\s+)(\d+\/\d+)/gi,
        /(?:pressure\s+)(\d+\s*over\s*\d+|\d+\/\d+)/gi,
        // Enhanced patterns for equipment malfunction
        /(?:blood\s+pressure|bp)[\s.:]*([^.!?]*(?:cuff|malfunction|different|need))/gi
      ],
      
      respiratory: [
        /(?:respiratory\s*rate|breathing\s*rate|respiration|rr)(?:\s*:|\s+is|\s+was)?\s*(\d+)\s*(?:per\s*minute|\/min|breaths)?/gi,
        /(?:breathing\s+at\s+)(\d+)/gi,
        /(?:resp\s+)(\d+)/gi,
        // Enhanced patterns for descriptive breathing assessment
        /(?:respiratory\s+rate|breathing)[\s.:]*([^.!?]*(?:normally|count|exact|rate))/gi
      ],

      // New glucose pattern
      glucose: [
        /(?:glucose|blood\s+sugar|bs)(?:\s*:|\s+is|\s+was|\s+level)?\s*(\d+)\s*(?:mg\/dl|mmol\/l)?/gi,
        /(?:glucose|blood\s+sugar)[\s.:]*([^.!?]*(?:level|check|needed|later))/gi
      ],

      // Chief Complaint Patterns
      chiefComplaint: [
        /(?:chief\s+complaint|cc|presenting\s+complaint)(?:\s*:|\s+is)?\s*([^.!?]+)/gi,
        /(?:patient\s+(?:is\s+)?complain(?:s|ing)\s+(?:of|about)\s+)([^.!?]+)/gi,
        /(?:presents?\s+(?:with|today\s+with)\s+)([^.!?]+)/gi,
        /(?:came\s+in\s+(?:with|for|because\s+of)\s+)([^.!?]+)/gi,
        /(?:here\s+(?:for|with|because\s+of)\s+)([^.!?]+)/gi,
        /(?:main\s+(?:problem|concern|issue)\s+(?:is|was)\s+)([^.!?]+)/gi
      ],

      // History Patterns
      historyOfPresentIllness: [
        /(?:history\s+of\s+present\s+illness|hpi)(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:patient\s+(?:reports?|states?|says?)\s+(?:that\s+)?)([^.]+(?:\s+(?:started|began|occurred))[^.]*)/gi,
        /(?:symptoms?\s+(?:started|began|occurred)\s+)([^.]+)/gi,
        /(?:this\s+(?:started|began)\s+)([^.]+)/gi
      ],
      
      pastMedicalHistory: [
        /(?:past\s+medical\s+history|pmh|medical\s+history)(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:previous\s+(?:medical\s+)?(?:conditions?|problems?|illnesses?))(?:\s*:)?\s*([^.]+)/gi,
        /(?:history\s+of\s+)([a-zA-Z\s,]+?)(?:\s*[,.]|$)/gi,
        /(?:patient\s+has\s+(?:a\s+)?(?:history\s+of\s+)?)([^.]+)/gi
      ],

      // Medication Patterns
      medications: [
        /(?:current\s+medications?|meds?|taking|prescribed)(?:\s*:|\s+include)?\s*([^.]+)/gi,
        /(?:patient\s+(?:is\s+)?(?:taking|on)\s+)([^.]+)/gi,
        /(?:medications?\s+include\s+)([^.]+)/gi,
        /(?:prescribed\s+)([^.]+)/gi
      ],
      
      // Common medication names and dosages
      medicationNames: [
        /\b([a-zA-Z]+(?:cillin|mycin|pril|sartan|olol|pine|statin|zole|ide))\b\s*\d*\.?\d*\s*(?:mg|mcg|g|ml)?/gi,
        /\b(aspirin|ibuprofen|acetaminophen|tylenol|advil|metformin|insulin|warfarin|prednisone)\b\s*\d*\.?\d*\s*(?:mg|mcg|g|ml)?/gi,
        /\b([A-Z][a-z]+)\s+\d+\.?\d*\s*(?:mg|mcg|g|ml|units?)\b/gi
      ],

      // Physical Examination Patterns - Enhanced
      physicalExam: [
        /(?:physical\s+(?:exam(?:ination)?|assessment)|on\s+(?:exam(?:ination)?|physical))(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:examination\s+reveals?\s+)([^.]+)/gi,
        /(?:on\s+inspection\s+)([^.]+)/gi,
        /(?:patient\s+(?:appears?|looks?)\s+)([^.]+)/gi,
        // Enhanced neurological and detailed examination patterns
        /(?:i\s+can\s+see|i\s+notice|there'?s?)[\s]+(?:some\s+)?(?:slight\s+)?([^.!?]*(?:asymmetry|weakness|droop|closure|strength))/gi,
        /(?:facial|face)[\s]+([^.!?]*(?:asymmetry|droop|weakness))/gi,
        /(?:left|right)\s+(?:arm|leg|side)[\s]+([^.!?]*(?:strength|weakness|decreased|has))/gi,
        /(?:mouth|eyelid|eye)[\s]+([^.!?]*(?:droop|weakness|closure))/gi,
        /(?:heart\s+sounds?|lung\s+sounds?)[\s]+([^.!?]*(?:regular|clear|normal|abnormal))/gi,
        /(?:muscle\s+strength|reflexes|coordination)[\s:]+([^.!?]+)/gi,
        // Vital signs with equipment issues
        /(?:temperature|temp)[\s:]+([^.!?]*(?:normal|reading|degrees?))/gi,
        /(?:pulse|heart\s+rate)[\s:]+([^.!?]*(?:clear|reading|monitor|malfunction))/gi,
        /(?:blood\s+pressure|bp)[\s:]+([^.!?]*(?:cuff|malfunction|different))/gi,
        /(?:respiratory\s+rate|breathing)[\s:]+([^.!?]*(?:normally|count|exact))/gi
      ],

      // Assessment/Diagnosis Patterns
      assessment: [
        /(?:assessment|diagnosis|impression|clinical\s+impression)(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:diagnosed\s+with\s+)([^.]+)/gi,
        /(?:appears?\s+to\s+(?:have|be)\s+)([^.]+)/gi,
        /(?:consistent\s+with\s+)([^.]+)/gi,
        /(?:likely\s+)([a-zA-Z\s]+?)(?:\s*[,.]|$)/gi
      ],

      // Treatment Plan Patterns - Enhanced
      plan: [
        /(?:plan|treatment\s+plan|management|recommendations?)(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:will\s+(?:start|begin|prescribe|recommend)\s+)([^.]+)/gi,
        /(?:patient\s+(?:should|will|to)\s+)([^.]+)/gi,
        /(?:follow\s*up\s+)([^.]+)/gi,
        /(?:discharge\s+(?:home\s+)?(?:with|on)\s+)([^.]+)/gi,
        // Enhanced specific order and consultation patterns
        /(?:i'?m\s+going\s+to\s+order)[\s]+([^.!?]*(?:ct|scan|blood|test|mri|x-ray))/gi,
        /(?:we\s+need\s+to\s+do|here'?s\s+what\s+we\s+need\s+to\s+do)[\s]+([^.!?]+)/gi,
        /(?:admit\s+you\s+to\s+the\s+hospital)[\s:]*([^.!?]*)/gi,
        /(?:get\s+neurology\s+involved|neurology\s+consult)[\s:]*([^.!?]*)/gi,
        /(?:they'?ll\s+(?:probably\s+)?want\s+to\s+see\s+you)[\s]+([^.!?]*)/gi,
        /(?:ct\s+scan|blood\s+work|mri)[\s]*([^.!?]*(?:depending|results|brain|head))/gi
      ],

      // Review of Systems Patterns - Enhanced
      reviewOfSystems: [
        /(?:review\s+of\s+systems?|ros)(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:systems?\s+review\s+)([^.]+)/gi,
        /(?:patient\s+(?:denies|reports?)\s+)([^.]+)/gi,
        // Enhanced negative findings patterns
        /(?:any\s+(?:headaches?|vision\s+changes?|speech\s+difficulties?))[\s:]*([^.!?]*(?:no|negative|denies))/gi,
        /(?:any\s+(?:nausea|vomiting|dizziness))[\s:]*([^.!?]*(?:no|negative|nothing))/gi,
        /(?:any\s+(?:chest\s+pain|shortness\s+of\s+breath|heart\s+palpitations))[\s:]*([^.!?]*(?:no|negative|nothing))/gi,
        /(?:any\s+(?:urinary\s+problems?|bowel\s+changes?))[\s:]*([^.!?]*(?:no|normal|everything))/gi,
        /(?:any\s+recent\s+weight\s+(?:loss|gain))[\s:]*([^.!?]*(?:no|negative|significant))/gi,
        /(?:any\s+(?:skin\s+changes?|joint\s+pain|other\s+symptoms?))[\s:]*([^.!?]*(?:no|negative|just))/gi,
        /(?:no\s+(?:headaches?|vision|nausea|chest\s+pain|weight\s+changes?))/gi
      ],

      // Provider Information Patterns - New
      providerInfo: [
        /(?:this\s+is\s+dr\.?\s+|doctor\s+)([A-Za-z\s]+?)(?:\s+examining|\s*[,.]|$)/gi,
        /(?:for\s+the\s+record,?\s+this\s+is\s+)([A-Za-z\s]+?)(?:\s+examining)/gi,
        /(?:today'?s\s+date\s+is\s+)([^.!?]*(?:august|january|february|march|april|may|june|july|september|october|november|december))/gi,
        /(?:the\s+time\s+is\s+approximately\s+)([^.!?]*(?:am|pm))/gi
      ],

      // Investigations/Lab Results Patterns
      investigations: [
        /(?:investigations?|lab\s*(?:results?|work)?|laboratory\s*(?:results?|findings)?|tests?\s*(?:ordered|performed|results?))(?:\s*:)?\s*([^.]+(?:\.[^.]*)*)/gi,
        /(?:blood\s*work|blood\s*tests?)\s*(?:shows?|reveals?|indicates?)?\s*([^.]+)/gi,
        /(?:x-?ray|ct\s*scan|mri|ultrasound|ecg|ekg)\s*(?:shows?|reveals?|indicates?)?\s*([^.]+)/gi,
        /(?:lab\s*values?|laboratory\s*values?)\s*(?:show|indicate)?\s*([^.]+)/gi,
        /(?:cbc|bmp|cmp|lipid\s*panel|liver\s*function|kidney\s*function)\s*([^.]+)/gi
      ],

      // Drug Allergies and Sensitivities
      allergies: [
        /(?:allergies?|allergic\s+to|drug\s+allergies?)(?:\s*:)?\s*([^.]+)/gi,
        /(?:patient\s+(?:is\s+)?allergic\s+to\s+)([^.]+)/gi,
        /(?:known\s+(?:drug\s+)?allergies?\s+)([^.]+)/gi,
        /(?:adverse\s+reactions?\s+to\s+)([^.]+)/gi,
        /(?:cannot\s+take\s+|should\s+not\s+take\s+)([^.]+)/gi,
        /(?:nkda|no\s+known\s+(?:drug\s+)?allergies?)/gi
      ]
    };

    // Medical terms and their variations
    this.medicalTerms = {
      symptoms: ['pain', 'ache', 'fever', 'nausea', 'vomiting', 'dizziness', 'fatigue', 'shortness of breath', 'cough', 'headache'],
      conditions: ['hypertension', 'diabetes', 'asthma', 'copd', 'arthritis', 'depression', 'anxiety', 'pneumonia'],
      body_parts: ['chest', 'abdomen', 'head', 'back', 'neck', 'arm', 'leg', 'heart', 'lungs', 'stomach']
    };
  }

  // Main parsing function
  parseTranscript(transcript) {
    const cleanText = this.preprocessText(transcript);
    
    return {
      patientInfo: this.extractPatientInfo(cleanText),
      vitalSigns: this.extractVitalSigns(cleanText),
      chiefComplaint: this.extractChiefComplaint(cleanText),
      historyOfPresentIllness: this.extractHistoryOfPresentIllness(cleanText),
      pastMedicalHistory: this.extractPastMedicalHistory(cleanText),
      medications: this.extractMedications(cleanText),
      allergies: this.extractAllergies(cleanText),
      reviewOfSystems: this.extractReviewOfSystems(cleanText),
      physicalExamination: this.extractPhysicalExamination(cleanText),
      investigations: this.extractInvestigations(cleanText),
      assessment: this.extractAssessment(cleanText),
      plan: this.extractPlan(cleanText),
      providerInfo: this.extractProviderInfo(cleanText)
    };
  }

  // Text preprocessing
  preprocessText(text) {
    return text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
  }

  // Extract patient information
  extractPatientInfo(text) {
    const patientInfo = {
      name: 'Not extracted',
          age: 'Not mentioned',
    gender: 'Not mentioned'
    };

    // Extract name
    for (const pattern of this.patterns.patientName) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        patientInfo.name = this.cleanExtractedText(match[1]);
        break;
      }
    }

    // Extract age
    for (const pattern of this.patterns.age) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        patientInfo.age = match[1];
        break;
      }
    }

    // Extract gender
    for (const pattern of this.patterns.gender) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const gender = match[1].toLowerCase();
        if (gender.startsWith('m') || gender === 'man' || gender === 'boy' || gender === 'gentleman') {
          patientInfo.gender = 'Male';
        } else if (gender.startsWith('f') || gender === 'woman' || gender === 'girl' || gender === 'lady') {
          patientInfo.gender = 'Female';
        }
        break;
      }
    }

    return patientInfo;
  }

  // Extract vital signs
  extractVitalSigns(text) {
    const vitalSigns = {
          temperature: 'Not mentioned',
    pulse: 'Not mentioned',
    bloodPressure: 'Not mentioned',
    respiratoryRate: 'Not mentioned',
    glucose: 'Not mentioned'
    };

    // Temperature - handle both numerical and descriptive
    for (const pattern of this.patterns.temperature) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const value = match[1].trim();
        const temp = parseFloat(value);
        
        // Check if it's a number
        if (!isNaN(temp)) {
          // Standardize temperature format
          if (temp > 90 && temp < 110) { // Fahrenheit range
            vitalSigns.temperature = `${temp}°F`;
          } else if (temp > 30 && temp < 45) { // Celsius range
            vitalSigns.temperature = `${temp}°C`;
          } else {
            vitalSigns.temperature = `${temp}°F`; // Default to Fahrenheit
          }
        } else {
          // Handle descriptive findings
          if (value.toLowerCase().includes('normal') || value.toLowerCase().includes('afebrile')) {
            vitalSigns.temperature = 'Normal (afebrile)';
          } else {
            vitalSigns.temperature = this.cleanExtractedText(value);
          }
        }
        break;
      }
    }

    // Pulse - handle both numerical and descriptive
    for (const pattern of this.patterns.pulse) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const value = match[1].trim();
        const pulse = parseInt(value);
        
        // Check if it's a number
        if (!isNaN(pulse) && pulse > 30 && pulse < 200) { // Reasonable pulse range
          vitalSigns.pulse = `${pulse} bpm`;
        } else {
          // Handle descriptive findings
          if (value.toLowerCase().includes('clear reading') || value.toLowerCase().includes('malfunction') || 
              value.toLowerCase().includes('try again')) {
            vitalSigns.pulse = 'Equipment issue - ' + this.cleanExtractedText(value);
          } else {
            vitalSigns.pulse = this.cleanExtractedText(value);
          }
        }
        break;
      }
    }

    // Blood Pressure - handle both numerical and descriptive
    for (const pattern of this.patterns.bloodPressure) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        let value = match[1].trim();
        
        // Check if it contains numerical BP reading
        if (value.match(/\d+\/\d+/) || value.includes('over')) {
          // Standardize BP format
          if (!value.includes('/') && value.includes('over')) {
            value = value.replace(/\s*over\s*/gi, '/');
          }
          // Ensure mmHg unit
          if (value.match(/^\d+\/\d+$/)) {
            vitalSigns.bloodPressure = `${value} mmHg`;
          } else {
            vitalSigns.bloodPressure = value;
          }
        } else {
          // Handle descriptive findings
          if (value.toLowerCase().includes('malfunction') || value.toLowerCase().includes('cuff') || 
              value.toLowerCase().includes('different')) {
            vitalSigns.bloodPressure = 'Equipment issue - ' + this.cleanExtractedText(value);
          } else {
            vitalSigns.bloodPressure = this.cleanExtractedText(value);
          }
        }
        break;
      }
    }

    // Respiratory Rate - handle both numerical and descriptive
    for (const pattern of this.patterns.respiratory) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const value = match[1].trim();
        const rr = parseInt(value);
        
        // Check if it's a number
        if (!isNaN(rr) && rr > 5 && rr < 50) { // Reasonable respiratory rate range
          vitalSigns.respiratoryRate = `${rr}/min`;
        } else {
          // Handle descriptive findings
          if (value.toLowerCase().includes('normally') || value.toLowerCase().includes('normal')) {
            vitalSigns.respiratoryRate = 'Breathing normally';
          } else if (value.toLowerCase().includes('count') || value.toLowerCase().includes('exact')) {
            vitalSigns.respiratoryRate = 'Rate not counted - ' + this.cleanExtractedText(value);
          } else {
            vitalSigns.respiratoryRate = this.cleanExtractedText(value);
          }
        }
        break;
      }
    }

    // Glucose - handle both numerical and descriptive
    for (const pattern of this.patterns.glucose) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const value = match[1].trim();
        const glucose = parseFloat(value);
        
        // Check if it's a number
        if (!isNaN(glucose) && glucose > 20 && glucose < 800) { // Reasonable glucose range
          vitalSigns.glucose = `${glucose} mg/dL`;
        } else {
          // Handle descriptive findings
          if (value.toLowerCase().includes('check') || value.toLowerCase().includes('needed') || 
              value.toLowerCase().includes('later')) {
            vitalSigns.glucose = 'To be checked - ' + this.cleanExtractedText(value);
          } else {
            vitalSigns.glucose = this.cleanExtractedText(value);
          }
        }
        break;
      }
    }

    return vitalSigns;
  }

  // Extract chief complaint
  extractChiefComplaint(text) {
    for (const pattern of this.patterns.chiefComplaint) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        return this.cleanExtractedText(match[1]);
      }
    }
    return '[To be extracted from transcript]';
  }

  // Extract history of present illness
  extractHistoryOfPresentIllness(text) {
    for (const pattern of this.patterns.historyOfPresentIllness) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        return this.cleanExtractedText(match[1]);
      }
    }
    return 'Not mentioned';
  }

  // Extract past medical history
  extractPastMedicalHistory(text) {
    const histories = [];
    
    for (const pattern of this.patterns.pastMedicalHistory) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        histories.push(this.cleanExtractedText(match[1]));
      }
    }
    
    return histories.length > 0 ? histories.join('; ') : 'Not mentioned';
  }

  // Extract medications with intelligent parsing
  extractMedications(text) {
    const medications = new Set();
    
    // First, look for medication sections
    for (const pattern of this.patterns.medications) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const medText = match[1];
        // Parse individual medications from the section
        const parsedMeds = this.parseMedicationList(medText);
        parsedMeds.forEach(med => medications.add(med));
      }
    }
    
    // Then look for individual medication names
    for (const pattern of this.patterns.medicationNames) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        medications.add(this.cleanExtractedText(match[0]));
      }
    }
    
    return medications.size > 0 ? Array.from(medications) : ['[To be determined based on transcript analysis]'];
  }

  // Parse medication list from text
  parseMedicationList(medText) {
    const medications = [];
    const separators = /[,;]|\band\b/gi;
    const parts = medText.split(separators);
    
    for (let part of parts) {
      part = part.trim();
      if (part.length > 2 && !part.match(/^(the|and|or|with|for|a|an)$/i)) {
        medications.push(part);
      }
    }
    
    return medications;
  }

  // Extract review of systems
  extractReviewOfSystems(text) {
    for (const pattern of this.patterns.reviewOfSystems) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        return this.cleanExtractedText(match[1]);
      }
    }
    return 'Not mentioned';
  }

  // Extract physical examination
  extractPhysicalExamination(text) {
    const examFindings = [];
    
    for (const pattern of this.patterns.physicalExam) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        examFindings.push(this.cleanExtractedText(match[1]));
      }
    }
    
    return examFindings.length > 0 ? examFindings.join('. ') : 'No physical examination was performed during this consultation.';
  }

  // Extract assessment/diagnosis
  extractAssessment(text) {
    const assessments = [];
    
    for (const pattern of this.patterns.assessment) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        assessments.push(this.cleanExtractedText(match[1]));
      }
    }
    
    return assessments.length > 0 ? assessments.join('; ') : 'To be determined';
  }

  // Extract treatment plan
  extractPlan(text) {
    const plans = [];
    
    for (const pattern of this.patterns.plan) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        plans.push(this.cleanExtractedText(match[1]));
      }
    }
    
    return plans.length > 0 ? plans.join('; ') : 'To be determined';
  }

  // Extract provider information - New method
  extractProviderInfo(text) {
    const providerInfo = {
          doctorName: 'Not mentioned',
    date: 'Not mentioned',
    time: 'Not mentioned'
    };
    
    // Extract doctor name
    for (const pattern of this.patterns.providerInfo) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const content = match[1].toLowerCase();
        if (content.includes('dr') || content.includes('doctor') || content.includes('examining')) {
          providerInfo.doctorName = this.cleanExtractedText(match[1]);
          break;
        } else if (content.includes('august') || content.includes('january') || 
                  content.includes('february') || content.includes('march') || 
                  content.includes('april') || content.includes('may') || 
                  content.includes('june') || content.includes('july') || 
                  content.includes('september') || content.includes('october') || 
                  content.includes('november') || content.includes('december')) {
          providerInfo.date = this.cleanExtractedText(match[1]);
        } else if (content.includes('am') || content.includes('pm')) {
          providerInfo.time = this.cleanExtractedText(match[1]);
        }
      }
    }
    
    return providerInfo;
  }

  // Extract investigations/lab results
  extractInvestigations(text) {
    const investigations = [];
    
    for (const pattern of this.patterns.investigations) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        investigations.push(this.cleanExtractedText(match[1]));
      }
    }
    
    // Also look for specific lab values
    const labPatterns = [
      /(?:hemoglobin|hgb|hb)[\s:]*(\d+\.?\d*)/gi,
      /(?:hematocrit|hct)[\s:]*(\d+\.?\d*)/gi,
      /(?:white\s*(?:blood\s*)?cell\s*count|wbc)[\s:]*(\d+\.?\d*)/gi,
      /(?:platelet\s*count|plt)[\s:]*(\d+\.?\d*)/gi,
      /(?:creatinine)[\s:]*(\d+\.?\d*)/gi,
      /(?:bun|blood\s*urea\s*nitrogen)[\s:]*(\d+\.?\d*)/gi,
      /(?:sodium|na)[\s:]*(\d+\.?\d*)/gi,
      /(?:potassium|k)[\s:]*(\d+\.?\d*)/gi,
      /(?:chloride|cl)[\s:]*(\d+\.?\d*)/gi
    ];
    
    for (const pattern of labPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        investigations.push(`${match[0]}`);
      }
    }
    
    return investigations.length > 0 ? investigations.join('; ') : 'Not mentioned';
  }

  // Extract allergies
  extractAllergies(text) {
    const allergies = [];
    
    // Check for "no known allergies" first
    for (const pattern of this.patterns.allergies) {
      const match = pattern.exec(text);
      if (match) {
        // Check if it's a "no allergies" statement
        if (match[0].toLowerCase().includes('nkda') || 
            match[0].toLowerCase().includes('no known') ||
            match[0].toLowerCase().includes('no allergies')) {
          return 'No known drug allergies (NKDA)';
        }
        
        if (match[1]) {
          allergies.push(this.cleanExtractedText(match[1]));
        }
      }
    }
    
    return allergies.length > 0 ? allergies.join('; ') : 'Not mentioned';
  }

  // Clean extracted text
  cleanExtractedText(text) {
    return text
      .replace(/^\W+|\W+$/g, '')  // Remove leading/trailing non-word chars
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim()
      .replace(/^(and|or|the|a|an)\s+/i, '') // Remove leading articles
      .replace(/\s+(and|or)$/i, ''); // Remove trailing conjunctions
  }

  // Context-aware extraction for better accuracy
  extractWithContext(text, targetPatterns, contextKeywords) {
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      // Check if sentence contains context keywords
      const hasContext = contextKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasContext) {
        for (const pattern of targetPatterns) {
          const match = pattern.exec(sentence);
          if (match && match[1]) {
            return this.cleanExtractedText(match[1]);
          }
        }
      }
    }
    
    return null;
  }

  // Confidence scoring for extracted information
  calculateConfidence(extractedValue, patterns, text) {
    let confidence = 0;
    
    // Check if multiple patterns matched
    let matchCount = 0;
    for (const pattern of patterns) {
      if (pattern.exec(text)) {
        matchCount++;
      }
    }
    
    confidence += matchCount * 20;
    
    // Check for contextual indicators
    if (extractedValue !== 'Not mentioned' && extractedValue !== 'Not extracted') {
      confidence += 30;
    }
    
    // Cap at 100
    return Math.min(confidence, 100);
  }
}

// Usage example - Export both named and default
export const parseTranscript = (transcriptText) => {
  const parser = new MedicalTranscriptParser();
  return parser.parseTranscript(transcriptText);
};

// Default export for compatibility
export default parseTranscript;

// Calculate overall confidence for extraction quality
export const calculateOverallConfidence = (data) => {
  let totalFields = 0;
  let extractedFields = 0;
  
  const checkField = (value) => {
    totalFields++;
    if (value && value !== 'Not mentioned' && value !== 'Not extracted' && value !== '[To be extracted from transcript]') {
      extractedFields++;
    }
  };
  
  // Check all fields
  checkField(data.patientInfo?.name);
  checkField(data.patientInfo?.age);
  checkField(data.patientInfo?.gender);
  checkField(data.vitalSigns?.temperature);
  checkField(data.vitalSigns?.pulse);
  checkField(data.vitalSigns?.bloodPressure);
  checkField(data.chiefComplaint);
  checkField(data.historyOfPresentIllness);
  checkField(data.assessment);
  checkField(data.plan);
  
  return Math.round((extractedFields / totalFields) * 100);
};

// Test transcripts for development
export const testTranscripts = {
  sample1: `
    Patient John Smith is a 45-year-old male presenting with chest pain. 
    Temperature is 98.6 degrees Fahrenheit, pulse rate 80 beats per minute, 
    blood pressure 120/80 mmHg, respiratory rate 18 per minute, glucose 95 mg/dL. 
    
    Chief complaint: Sharp chest pain for the past 2 hours.
    
    History of present illness: Patient reports sudden onset of sharp, 
    stabbing chest pain that started approximately 2 hours ago while 
    at rest. Pain is located in the center of the chest and radiates 
    to the left arm. No associated shortness of breath or nausea.
    
    Past medical history: Hypertension, controlled with medication.
    
    Current medications: Patient is taking Lisinopril 10mg daily and 
    aspirin 81mg daily.
    
    Review of systems: Patient denies fever, chills, nausea, vomiting, 
    or shortness of breath. No recent weight changes or leg swelling.
    
    Physical examination: Patient appears comfortable at rest. 
    Heart sounds are regular with no murmurs. Lungs are clear 
    bilaterally. No chest wall tenderness. Abdomen soft, non-tender.
    
    Assessment: Atypical chest pain, likely musculoskeletal in origin.
    
    Plan: Recommend rest, over-the-counter pain medication such as 
    ibuprofen 400mg twice daily, and follow-up with primary care 
    physician in 2-3 days if symptoms persist.
  `,
  
  sample2: `
    This is Mary Johnson, a 62-year-old female who came in today 
    complaining of shortness of breath and fatigue. Her vital signs 
    show temperature 99.2°F, heart rate 95 bpm, BP 140/90, 
    respiratory rate 22/min, glucose 180 mg/dL.
    
    Chief complaint: Shortness of breath and fatigue for 3 days.
    
    History of present illness: She presents with a 3-day history of 
    increasing shortness of breath, especially on exertion, along with 
    fatigue and mild chest discomfort. Symptoms have been progressively 
    worsening. No fever or cough.
    
    Past medical history: Type 2 diabetes mellitus, hypertension.
    
    Current medications: Patient takes metformin 500mg twice daily 
    and amlodipine 5mg once daily.
    
    Review of systems: Patient reports ankle swelling and difficulty 
    sleeping flat. Denies chest pain, palpitations, or syncope.

    Physical examination: Patient appears mildly distressed. 
    There are fine crackles heard at both lung bases. Heart sounds 
    show regular rhythm with no murmurs. Bilateral lower extremity 
    edema noted. JVD elevated at 45 degrees.
    
    Assessment: Acute exacerbation of congestive heart failure, 
    likely systolic dysfunction. Poorly controlled diabetes.
    
    Plan: Start furosemide 40mg daily, restrict fluid intake 
    to 2 liters per day, follow up in cardiology clinic within one week. 
    Adjust diabetes medications and dietary counseling.
  `
};