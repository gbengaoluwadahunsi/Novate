import jsPDF from 'jspdf'
import { CleanMedicalNote } from '@/components/medical-note/clean-medical-note-editor'

interface ExactNotePDFOptions {
  useLetterhead?: boolean
  letterheadImage?: string
}

export class ExactNotePDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private currentY: number
  private margins = { left: 20, right: 20, top: 20, bottom: 20 }

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margins.top
  }

  public generatePDF(note: CleanMedicalNote, options: ExactNotePDFOptions = {}): jsPDF {
    // Add letterhead if provided
    if (options.useLetterhead && options.letterheadImage) {
      this.addLetterhead(options.letterheadImage)
    } else {
      // Add the blue header bar exactly like in the single note page
      this.addBlueHeaderBar()
    }

    // Add content sections exactly as they appear in the single note page
    this.addPatientInformation(note)
    this.addVitalSigns(note)
    this.addChiefComplaint(note)
    this.addHistoryOfPresentIllness(note)
    this.addPastMedicalHistory(note)
    this.addDrugHistoryAndAllergies(note)
    this.addSocialHistory(note)
    this.addFamilyHistory(note)
    this.addReviewOfSystems(note)
    this.addPhysicalExamination(note)
    this.addInvestigations(note)
    this.addAssessment(note)
    this.addPlan(note)
    this.addICD11Codes(note)
    this.addDoctorInformationAndAuthorization(note)

    return this.doc
  }

  private addLetterhead(letterheadImage: string): void {
    try {
      // Determine image format
      let imageFormat = 'JPEG'
      if (letterheadImage.startsWith('data:image/')) {
        const formatMatch = letterheadImage.match(/data:image\/([^;]+)/)
        if (formatMatch) {
          const format = formatMatch[1].toUpperCase()
          if (format === 'PNG') imageFormat = 'PNG'
          else if (format === 'JPEG' || format === 'JPG') imageFormat = 'JPEG'
        }
      }

      // Add letterhead at the top
      const letterheadHeight = 35
      this.doc.addImage(letterheadImage, imageFormat, 0, 0, this.pageWidth, letterheadHeight)
      this.currentY = letterheadHeight + 15
    } catch (error) {
      // Error adding letterhead
      // Fallback to blue header
      this.addBlueHeaderBar()
    }
  }

  private addBlueHeaderBar(): void {
    // Dark blue background bar
    this.doc.setFillColor(30, 58, 138) // Blue-900 equivalent
    this.doc.rect(0, 0, this.pageWidth, 25, 'F')

    // "MEDICAL CENTER" on the left (white, bold, uppercase)
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('MEDICAL CENTER', this.margins.left, 15)

    // "Medical Consultation Note" on the right (white, bold)
    this.doc.setFontSize(12)
    this.doc.text('Medical Consultation Note', this.pageWidth - this.margins.right - 80, 12)

    // Generation timestamp on the right (white, smaller)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const timestamp = `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
    this.doc.text(timestamp, this.pageWidth - this.margins.right - 80, 18)

    this.currentY = 35
  }

  private addSectionHeader(title: string): void {
    this.currentY += 10
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(30, 58, 138) // Blue-800
    this.doc.text(title.toUpperCase(), this.margins.left, this.currentY)
    
    // Add gray line separator
    this.doc.setDrawColor(209, 213, 219) // Gray-300
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margins.left, this.currentY + 2, this.pageWidth - this.margins.right, this.currentY + 2)
    
    this.currentY += 8
  }

  private addPatientInformation(note: CleanMedicalNote): void {
    this.addSectionHeader('Patient Information')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const patientData = [
      { label: 'Name', value: note.patientName || 'Not recorded' },
      { label: 'Age', value: note.patientAge || 'Not recorded' },
      { label: 'Gender', value: note.patientGender || 'Not recorded' }
    ]

    // Display in grid format like the single note page
    const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / 2
    patientData.forEach((item, index) => {
      const x = this.margins.left + (index % 2) * colWidth
      const y = this.currentY + (Math.floor(index / 2) * 6)
      this.doc.text(`${item.label}: ${item.value}`, x, y)
    })

    this.currentY += 20
  }

  private addVitalSigns(note: CleanMedicalNote): void {
    this.addSectionHeader('Vital Signs')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const vitalSigns = [
      { label: 'Temperature', value: note.temperature || 'Not recorded' },
      { label: 'Pulse Rate', value: note.pulseRate || 'Not recorded' },
      { label: 'Respiratory Rate', value: note.respiratoryRate || 'Not recorded' },
      { label: 'Blood Pressure', value: note.bloodPressure || 'Not recorded' },
      { label: 'Glucose', value: note.glucose || 'Not recorded' }
    ]

    // Display in grid format
    const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / 3
    vitalSigns.forEach((item, index) => {
      const x = this.margins.left + (index % 3) * colWidth
      const y = this.currentY + (Math.floor(index / 3) * 6)
      this.doc.text(`${item.label}: ${item.value}`, x, y)
    })

    this.currentY += 20
  }

  private addChiefComplaint(note: CleanMedicalNote): void {
    this.addSectionHeader('Chief Complaint')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const complaint = note.chiefComplaint || 'Not recorded'
    const lines = this.doc.splitTextToSize(complaint, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addHistoryOfPresentIllness(note: CleanMedicalNote): void {
    this.addSectionHeader('History of Present Illness')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const history = note.historyOfPresentingIllness || 'Not recorded'
    const lines = this.doc.splitTextToSize(history, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addPastMedicalHistory(note: CleanMedicalNote): void {
    if (note.medicalConditions || note.surgeries || note.hospitalizations) {
      this.addSectionHeader('Past Medical History')
      
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)

      const historyItems = []
      if (note.medicalConditions) historyItems.push(`Medical Conditions: ${note.medicalConditions}`)
      if (note.surgeries) historyItems.push(`Surgeries: ${note.surgeries}`)
      if (note.hospitalizations) historyItems.push(`Hospitalizations: ${note.hospitalizations}`)

      historyItems.forEach(item => {
        const lines = this.doc.splitTextToSize(item, this.pageWidth - this.margins.left - this.margins.right)
        this.doc.text(lines, this.margins.left, this.currentY)
        this.currentY += lines.length * 5 + 5
      })

      this.currentY += 10
    }
  }

  private addDrugHistoryAndAllergies(note: CleanMedicalNote): void {
    if (note.medications || note.allergies) {
      this.addSectionHeader('Drug History and Allergies')
      
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)

      const drugItems = []
      if (note.medications) drugItems.push(`Current Medications: ${note.medications}`)
      if (note.allergies) drugItems.push(`Allergies: ${note.allergies}`)

      drugItems.forEach(item => {
        const lines = this.doc.splitTextToSize(item, this.pageWidth - this.margins.left - this.margins.right)
        this.doc.text(lines, this.margins.left, this.currentY)
        this.currentY += lines.length * 5 + 5
      })

      this.currentY += 10
    }
  }

  private addSocialHistory(note: CleanMedicalNote): void {
    const socialFields = [
      note.smoking, note.alcohol, note.recreationalDrugs, note.occupationLivingSituation,
      note.travel, note.sexual, note.eatingOut
    ].filter(Boolean)

    if (socialFields.length > 0) {
      this.addSectionHeader('Social History')
      
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)

      const socialItems = []
      if (note.smoking) socialItems.push(`Smoking: ${note.smoking}`)
      if (note.alcohol) socialItems.push(`Alcohol: ${note.alcohol}`)
      if (note.recreationalDrugs) socialItems.push(`Recreational Drugs: ${note.recreationalDrugs}`)
      if (note.occupationLivingSituation) socialItems.push(`Occupation/Living: ${note.occupationLivingSituation}`)
      if (note.travel) socialItems.push(`Travel: ${note.travel}`)
      if (note.sexual) socialItems.push(`Sexual History: ${note.sexual}`)
      if (note.eatingOut) socialItems.push(`Eating Habits: ${note.eatingOut}`)

      // Display in grid format
      const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / 2
      socialItems.forEach((item, index) => {
        const x = this.margins.left + (index % 2) * colWidth
        const y = this.currentY + (Math.floor(index / 2) * 6)
        this.doc.text(item, x, y)
      })

      this.currentY += Math.ceil(socialItems.length / 2) * 6 + 10
    }
  }

  private addFamilyHistory(note: CleanMedicalNote): void {
    if (note.familyHistory) {
      this.addSectionHeader('Family History')
      
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)

      const lines = this.doc.splitTextToSize(note.familyHistory, this.pageWidth - this.margins.left - this.margins.right)
      this.doc.text(lines, this.margins.left, this.currentY)
      this.currentY += lines.length * 5 + 10
    }
  }

  private addReviewOfSystems(note: CleanMedicalNote): void {
    this.addSectionHeader('Review of Systems')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const review = note.systemsReview || 'Not recorded'
    const lines = this.doc.splitTextToSize(review, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addPhysicalExamination(note: CleanMedicalNote): void {
    this.addSectionHeader('Physical Examination')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const examination = note.physicalExamination || 'Not recorded'
    const lines = this.doc.splitTextToSize(examination, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addInvestigations(note: CleanMedicalNote): void {
    this.addSectionHeader('Investigations')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const investigations = note.investigations || 'Not recorded'
    const lines = this.doc.splitTextToSize(investigations, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addAssessment(note: CleanMedicalNote): void {
    this.addSectionHeader('Assessment')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const assessment = note.assessment || 'Not recorded'
    const lines = this.doc.splitTextToSize(assessment, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addPlan(note: CleanMedicalNote): void {
    this.addSectionHeader('Plan')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    const plan = note.plan || 'Not recorded'
    const lines = this.doc.splitTextToSize(plan, this.pageWidth - this.margins.left - this.margins.right)
    this.doc.text(lines, this.margins.left, this.currentY)
    this.currentY += lines.length * 5 + 10
  }

  private addICD11Codes(note: CleanMedicalNote): void {
    this.addSectionHeader('ICD-11 Codes')
    
    if (note.icd11Codes && note.icd11Codes.primary && note.icd11Codes.primary.length > 0) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 0, 0)

      // Primary diagnoses
      if (note.icd11Codes.primary.length > 0) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Primary Diagnosis:', this.margins.left, this.currentY)
        this.currentY += 6

        this.doc.setFont('helvetica', 'normal')
        note.icd11Codes.primary.forEach((code, index) => {
          this.doc.text(`${code.code} - ${code.title}`, this.margins.left + 5, this.currentY)
          this.currentY += 6
          if (code.definition) {
            const lines = this.doc.splitTextToSize(code.definition, this.pageWidth - this.margins.left - this.margins.right - 10)
            this.doc.text(lines, this.margins.left + 10, this.currentY)
            this.currentY += lines.length * 5 + 5
          }
        })
      }

      // Secondary diagnoses
      if (note.icd11Codes.secondary && note.icd11Codes.secondary.length > 0) {
        this.currentY += 5
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('Secondary Diagnoses:', this.margins.left, this.currentY)
        this.currentY += 6

        this.doc.setFont('helvetica', 'normal')
        note.icd11Codes.secondary.forEach((code, index) => {
          this.doc.text(`${code.code} - ${code.title}`, this.margins.left + 5, this.currentY)
          this.currentY += 6
          if (code.definition) {
            const lines = this.doc.splitTextToSize(code.definition, this.pageWidth - this.margins.left - this.margins.right - 10)
            this.doc.text(lines, this.margins.left + 10, this.currentY)
            this.currentY += lines.length * 5 + 5
          }
        })
      }
    } else {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(128, 128, 128)
      this.doc.text('No ICD-11 codes assigned', this.margins.left, this.currentY)
      this.currentY += 6
      this.doc.setFontSize(8)
      this.doc.text('ICD-11 codes will appear here when assigned to the diagnosis.', this.margins.left, this.currentY)
      this.currentY += 10
    }
  }

  private addDoctorInformationAndAuthorization(note: CleanMedicalNote): void {
    this.addSectionHeader('Doctor Information & Authorization')
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 0, 0)

    // Doctor information
    const doctorInfo = [
      `Doctor: ${note.doctorName ? `Dr. ${note.doctorName}` : 'Dr. [Name]'}`,
      `Registration No: ${note.doctorRegistrationNo || '[Registration Number]'}`,
      `Generated on: ${note.dateTime || new Date().toLocaleDateString()}`
    ]

    doctorInfo.forEach(info => {
      this.doc.text(info, this.margins.left, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10

    // Signature and stamp placeholders
    this.doc.setDrawColor(209, 213, 219)
    this.doc.setLineWidth(1)
    
    // Signature box
    this.doc.rect(this.margins.left, this.currentY, 80, 30)
    this.doc.setFontSize(8)
    this.doc.text('Doctor Signature:', this.margins.left, this.currentY - 2)
    
    // Stamp box
    this.doc.rect(this.pageWidth - this.margins.right - 80, this.currentY, 80, 30)
    this.doc.text('Official Stamp:', this.pageWidth - this.margins.right - 80, this.currentY - 2)
  }
}

export function generateExactNotePDF(note: CleanMedicalNote, options: ExactNotePDFOptions = {}): jsPDF {
  const generator = new ExactNotePDFGenerator()
  return generator.generatePDF(note, options)
}

export function generateAndDownloadExactNotePDF(note: CleanMedicalNote, options: ExactNotePDFOptions = {}): void {
  const pdf = generateExactNotePDF(note, options)
  
  // Generate filename
  const patientName = note.patientName || 'Unknown_Patient'
  const safePatientName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  
  pdf.save(`Medical_Note_${safePatientName}_${dateStr}.pdf`)
} 