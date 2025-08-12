// Voice Input and AI Processing Service for Medical Note Editing

export interface VoiceInputResult {
  transcription: string
  confidence: number
  detectedChanges: EditInstruction[]
}

export interface EditInstruction {
  field: string
  section: string
  oldValue?: string
  newValue: string
  action: 'replace' | 'append' | 'insert' | 'delete'
  confidence: number
}

// Simulated AI processing - In production, this would integrate with OpenAI/Google Speech API
export class VoiceInputService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  async startRecording(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start(1000) // Collect data every second
      return stream
    } catch (error) {
      throw new Error('Failed to access microphone: ' + (error as Error).message)
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        })
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  // Simulate voice-to-text transcription
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // In production, this would call a real speech-to-text API
    // For demo purposes, we'll simulate with various medical phrases
    
    const simulatedTranscriptions = [
      "Change the blood pressure to 120 over 80",
      "Update temperature to 37.2 degrees celsius",
      "Add that patient appears comfortable and well",
      "Change pulse rate to 75 beats per minute",
      "Note that patient has mild chest discomfort",
      "Update respiratory rate to 18 per minute",
      "Add weight as 70 kilograms",
      "Patient height is 175 centimeters",
      "Blood pressure reading should be 130 over 85",
      "Patient complains of headache for 2 days"
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // Return a random transcription for demo
    return simulatedTranscriptions[Math.floor(Math.random() * simulatedTranscriptions.length)]
  }

  // AI-powered natural language processing for medical edits
  async processEditInstruction(transcription: string): Promise<EditInstruction[]> {
    const instructions: EditInstruction[] = []
    const text = transcription.toLowerCase()
    const lowerText = text

    // Patient Information Processing (should be at top level)
    if (lowerText.includes('gender') || lowerText.includes('sex')) {
      // Handle gender changes
      const genderMatch = text.match(/(?:change|update|set)\s+(?:gender|sex)\s+to\s+(male|female)/i)
      if (genderMatch) {
        instructions.push({
          field: 'patientGender',
          section: 'Patient Information',
          newValue: genderMatch[1].toLowerCase() === 'male' ? 'Male' : 'Female',
          action: 'replace',
          confidence: 0.9
        })
      }
    } else if (lowerText.includes('age') || lowerText.includes('years old')) {
      // Handle age changes
      const ageMatch = text.match(/(?:change|update|set|the age of the patient is)\s+(?:age\s+)?(?:to\s+)?(\d+)/i)
      if (ageMatch) {
        instructions.push({
          field: 'patientAge',
          section: 'Patient Information',
          newValue: ageMatch[1],
          action: 'replace',
          confidence: 0.9
        })
      }
    } else if (lowerText.includes('patient id') || lowerText.includes('id')) {
      // Handle patient ID changes
      const idMatch = text.match(/(?:change|update|set)\s+(?:patient\s+)?id\s+(?:to\s+)?(\w+)/i)
      if (idMatch) {
        instructions.push({
          field: 'patientId',
          section: 'Patient Information',
          newValue: idMatch[1],
          action: 'replace',
          confidence: 0.9
        })
      }
    } else if (lowerText.includes('name')) {
      // Handle name changes
      const nameMatch = text.match(/(?:change|update|set)\s+name\s+(?:to\s+)?([a-zA-Z\s]+)/i)
      if (nameMatch) {
        instructions.push({
          field: 'patientName',
          section: 'Patient Information',
          newValue: nameMatch[1].trim(),
          action: 'replace',
          confidence: 0.9
        })
      }
    }

    // Vital Signs Processing
    if (text.includes('blood pressure') || text.includes('bp')) {
      const bpMatch = text.match(/(\d+)\s*(?:over|\/)\s*(\d+)/)
      if (bpMatch) {
        instructions.push({
          field: 'bloodPressure',
          section: 'Vital Signs',
          newValue: `${bpMatch[1]}/${bpMatch[2]}`,
          action: 'replace',
          confidence: 0.9
        })
      }
    }

    if (text.includes('temperature') || text.includes('temp')) {
      const tempMatch = text.match(/(\d+\.?\d*)\s*(?:degrees?|°)?\s*(?:celsius|c)?/)
      if (tempMatch) {
        instructions.push({
          field: 'temperature',
          section: 'Vital Signs',
          newValue: `${tempMatch[1]}°C`,
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('pulse') || text.includes('heart rate')) {
      const pulseMatch = text.match(/(\d+)\s*(?:beats?|bpm)?/)
      if (pulseMatch) {
        instructions.push({
          field: 'pulseRate',
          section: 'Vital Signs',
          newValue: `${pulseMatch[1]} bpm`,
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('respiratory rate') || text.includes('breathing rate')) {
      const respMatch = text.match(/(\d+)\s*(?:per minute|\/min)?/)
      if (respMatch) {
        instructions.push({
          field: 'respiratoryRate',
          section: 'Vital Signs',
          newValue: `${respMatch[1]}/min`,
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('weight')) {
      const weightMatch = text.match(/(\d+\.?\d*)\s*(?:kg|kilograms?)?/)
      if (weightMatch) {
        instructions.push({
          field: 'weight',
          section: 'Vital Signs',
          newValue: `${weightMatch[1]} kg`,
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('height')) {
      const heightMatch = text.match(/(\d+\.?\d*)\s*(?:cm|centimeters?)?/)
      if (heightMatch) {
        instructions.push({
          field: 'height',
          section: 'Vital Signs',
          newValue: `${heightMatch[1]} cm`,
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    // Clinical Observations
    if (text.includes('comfortable') || text.includes('well')) {
      instructions.push({
        field: 'generalExamination',
        section: 'Physical Examination',
        newValue: 'Patient appears comfortable and well.',
        action: 'append',
        confidence: 0.8
      })
    }

    if (text.includes('chest pain') || text.includes('chest discomfort')) {
      instructions.push({
        field: 'chiefComplaint',
        section: 'History',
        newValue: 'Chest discomfort',
        action: 'append',
        confidence: 0.85
      })
    }

    if (text.includes('headache')) {
      const durationMatch = text.match(/(\d+)\s*(?:days?|hours?)/)
      const complaint = durationMatch 
        ? `Headache for ${durationMatch[1]} ${durationMatch[0].includes('day') ? 'days' : 'hours'}`
        : 'Headache'
      
      instructions.push({
        field: 'chiefComplaint',
        section: 'History',
        newValue: complaint,
        action: 'append',
        confidence: 0.8
      })
    }

    // Assessment and Plan
    if (text.includes('diagnosis') || text.includes('assess')) {
      const diagnosisMatch = text.match(/(?:diagnosis|assess(?:ment)?)\s+(?:is\s+)?(.+?)(?:\.|$)/)
      if (diagnosisMatch) {
        instructions.push({
          field: 'assessment',
          section: 'Assessment',
          newValue: diagnosisMatch[1].trim(),
          action: 'replace',
          confidence: 0.75
        })
      }
    }

    // Physical Examination specific patterns
    if (text.includes('head') && (text.includes('normal') || text.includes('abnormal'))) {
      instructions.push({
        field: 'generalExamination',
        section: 'General Examination',
        newValue: text.includes('normal') ? 'Normal head examination' : text,
        action: 'append',
        confidence: 0.8
      })
    }

    if (text.includes('face') && (text.includes('normal') || text.includes('abnormal'))) {
      instructions.push({
        field: 'generalExamination',
        section: 'General Examination',
        newValue: text.includes('normal') ? 'Normal facial examination' : text,
        action: 'append',
        confidence: 0.8
      })
    }

    if (text.includes('eyes') || text.includes('eye')) {
      const eyeText = text.includes('normal') ? 'Normal eye examination' : text
      instructions.push({
        field: 'generalExamination',
        section: 'General Examination',
        newValue: eyeText,
        action: 'append',
        confidence: 0.8
      })
    }

    if (text.includes('neck') && (text.includes('normal') || text.includes('abnormal') || text.includes('palpable'))) {
      instructions.push({
        field: 'generalExamination',
        section: 'General Examination',
        newValue: text.includes('normal') ? 'Normal neck examination' : text,
        action: 'append',
        confidence: 0.8
      })
    }

    if (text.includes('heart') || text.includes('cardiac')) {
      const heartMatch = text.match(/(?:heart|cardiac)\s+(.+?)(?:\.|$|,)/)
      if (heartMatch) {
        instructions.push({
          field: 'cardiovascularExamination',
          section: 'Cardiovascular Examination',
          newValue: heartMatch[1].trim(),
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('lungs') || text.includes('lung') || text.includes('respiratory')) {
      const lungMatch = text.match(/(?:lungs?|respiratory)\s+(.+?)(?:\.|$|,)/)
      if (lungMatch) {
        instructions.push({
          field: 'respiratoryExamination',
          section: 'Respiratory Examination',
          newValue: lungMatch[1].trim(),
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    if (text.includes('abdomen') || text.includes('abdominal')) {
      const abdomenMatch = text.match(/(?:abdomen|abdominal)\s+(.+?)(?:\.|$|,)/)
      if (abdomenMatch) {
        instructions.push({
          field: 'abdominalExamination',
          section: 'Abdominal Examination',
          newValue: abdomenMatch[1].trim(),
          action: 'replace',
          confidence: 0.85
        })
      }
    }

    // Fallback: If no specific medical patterns matched, treat as general note addition
    if (instructions.length === 0 && transcription.trim()) {
      // Try to detect if user is trying to update a specific field
      const lowerText = transcription.toLowerCase()
      
      // Common field updates
      if (lowerText.includes('chief complaint') || lowerText.includes('complaint')) {
        const match = transcription.match(/(?:chief complaint|complaint)\s*(?:is|:)?\s*(.+)/i)
        instructions.push({
          field: 'chiefComplaint',
          section: 'History',
          newValue: match ? match[1].trim() : transcription,
          action: 'replace',
          confidence: 0.7
        })
      } else if (lowerText.includes('history') || lowerText.includes('illness')) {
        instructions.push({
          field: 'historyOfPresentingIllness',
          section: 'History',
          newValue: transcription,
          action: 'append',
          confidence: 0.7
        })
              } else if (lowerText.includes('examination') || lowerText.includes('exam')) {
          // Try to determine which examination section
          if (lowerText.includes('head') || lowerText.includes('face') || lowerText.includes('eye') || lowerText.includes('neck')) {
            instructions.push({
              field: 'generalExamination',
              section: 'General Examination',
              newValue: transcription,
              action: 'append',
              confidence: 0.7
            })
          } else if (lowerText.includes('heart') || lowerText.includes('cardiac') || lowerText.includes('chest')) {
            instructions.push({
              field: 'cardiovascularExamination',
              section: 'Cardiovascular Examination',
              newValue: transcription,
              action: 'append',
              confidence: 0.7
            })
          } else if (lowerText.includes('lung') || lowerText.includes('respiratory') || lowerText.includes('breath')) {
            instructions.push({
              field: 'respiratoryExamination',
              section: 'Respiratory Examination',
              newValue: transcription,
              action: 'append',
              confidence: 0.7
            })
          } else if (lowerText.includes('abdomen') || lowerText.includes('stomach') || lowerText.includes('belly')) {
            instructions.push({
              field: 'abdominalExamination',
              section: 'Abdominal Examination',
              newValue: transcription,
              action: 'append',
              confidence: 0.7
            })
          } else {
            // General examination fallback
            instructions.push({
              field: 'generalExamination',
              section: 'General Examination',
              newValue: transcription,
              action: 'append',
              confidence: 0.6
            })
          }
      } else if (lowerText.includes('plan') || lowerText.includes('treatment')) {
        instructions.push({
          field: 'plan',
          section: 'Assessment & Plan',
          newValue: transcription,
          action: 'append',
          confidence: 0.7
        })
      } else if (lowerText.includes('assessment') || lowerText.includes('diagnosis')) {
        instructions.push({
          field: 'assessment',
          section: 'Assessment',
          newValue: transcription,
          action: 'append',
          confidence: 0.7
        })
      } else {
        // Default: Add to history of presenting illness as a general note
        instructions.push({
          field: 'historyOfPresentingIllness',
          section: 'History',
          newValue: transcription,
          action: 'append',
          confidence: 0.6
        })
      }
    }

    return instructions
  }

  // Apply edit instructions to medical note
  applyInstructions(note: any, instructions: EditInstruction[]): any {
    const updatedNote = { ...note }

    instructions.forEach(instruction => {
      const { field, newValue, action } = instruction

      switch (action) {
        case 'replace':
          updatedNote[field] = newValue
          break
          
        case 'append':
          const currentValue = updatedNote[field] || ''
          updatedNote[field] = currentValue 
            ? `${currentValue}\n${newValue}` 
            : newValue
          break
          
        case 'insert':
          updatedNote[field] = newValue
          break
          
        case 'delete':
          updatedNote[field] = ''
          break
      }
    })

    return updatedNote
  }

  // Generate summary of changes for version history
  generateChangeSummary(instructions: EditInstruction[]): string {
    if (instructions.length === 0) return 'No changes detected'

    const changes = instructions.map(inst => {
      const section = inst.section
      const action = inst.action === 'replace' ? 'Updated' : 
                    inst.action === 'append' ? 'Added to' : 
                    inst.action === 'insert' ? 'Added' : 'Removed from'
      
      return `${action} ${section}: ${inst.field}`
    })

    return changes.join('; ')
  }
}

// Export singleton instance
export const voiceInputService = new VoiceInputService()