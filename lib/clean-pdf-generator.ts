// Simple PDF Generator - Exactly matching new.pdf template structure (6 pages)
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface SimpleMedicalNote {
  // Patient Information (appears on all pages)
  patientName: string
  patientAge: string
  patientGender: string
  patientId: string
  chaperone: string
  
  // Vital Signs (Page 1)
  temperature: string
  pulseRate: string
  respiratoryRate: string
  bloodPressure: string
  spo2: string
  weight: string
  height: string
  bmi: string
  bmiStatus: string
  takenOn: string
  takenBy: string
  
  // Main Medical Content (Page 5)
  chiefComplaint: string
  historyOfPresentingIllness: string
  medicalConditions: string
  surgeries: string
  hospitalizations: string
  medications: string
  allergies: string
  smoking: string
  alcohol: string
  recreationalDrugs: string
  occupationLivingSituation: string
  travel: string
  sexual: string
  eatingOut: string
  familyHistory: string
  
  // Review of Systems (Page 6)
  systemsReview: string
  
  // Physical Examination (Pages 1-3)
  generalExamination: string
  vitalSignsFindings: string
  cardiovascularExamination: string
  respiratoryExamination: string
  abdominalExamination: string
  otherSystemsExamination: string
  physicalExaminationFindings: { [key: string]: string } // For body diagram findings
  
  // Assessment & Plan (Page 4)
  investigations: string
  assessment: string
  plan: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo: string
  generatedOn: string
  signature: string // Base64 string
  stamp: string // Base64 string
  letterhead?: string // Base64 string - optional letterhead template
}

// Helper function to safely convert any value to string for PDF text
function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

class SimplePDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margins: { left: number; right: number; top: number; bottom: number }
  private letterheadTemplate?: string

  constructor(letterhead?: string) {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margins = { left: 15, right: 15, top: 20, bottom: 20 }
    this.letterheadTemplate = letterhead
  }

  // Apply letterhead as background to current page
  private applyLetterheadBackground() {
    if (this.letterheadTemplate) {
      try {
        // Add letterhead as background image covering the entire page
        this.doc.addImage(
          this.letterheadTemplate,
          'PNG',
          0,
          0,
          this.pageWidth,
          this.pageHeight,
          undefined,
          'NONE', // No compression
          0 // Put it at the bottom layer
        )
      } catch (error) {
        console.warn('Failed to apply letterhead background:', error)
      }
    }
  }

  // Page 1: General Examination + Body Diagrams
  private addGeneralExaminationPage(note: SimpleMedicalNote) {
    // Apply letterhead background first
    this.applyLetterheadBackground()
    
    let yPos = this.margins.top

    // Header
    this.doc.setFontSize(12)
    this.doc.text("Generated on:", this.pageWidth / 2, yPos, { align: "center" })
    yPos += 20

    // Two column layout for General Examination and Vital Signs
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("General Examination", this.margins.left, yPos)
    this.doc.text("Vital Signs", this.pageWidth / 2 + 30, yPos)
    yPos += 10

    // Left column - Patient info
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Patient's Name    : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text("Taken on:", this.pageWidth / 2 + 30, yPos)
    yPos += 6
    this.doc.text(`Patient's Age     : ${note.patientAge}`, this.margins.left, yPos)
    this.doc.text("By:", this.pageWidth / 2 + 30, yPos)
    yPos += 6
    this.doc.text(`Patient's Sex     : ${note.patientGender}`, this.margins.left, yPos)
    yPos += 6
    this.doc.text(`Patient's ID      : ${note.patientId}`, this.margins.left, yPos)
    yPos += 6
    this.doc.text(`Chaperone         : ${note.chaperone}`, this.margins.left, yPos)
    yPos += 20

    // Right column - Vital signs
    const vitalSignsY = yPos - 30
    this.doc.text(`Temperature       : ${note.temperature}`, this.pageWidth / 2 + 30, vitalSignsY + 6)
    this.doc.text(`Pulse Rate        : ${note.pulseRate}`, this.pageWidth / 2 + 30, vitalSignsY + 12)
    this.doc.text(`Respiratory Rate  : ${note.respiratoryRate}`, this.pageWidth / 2 + 30, vitalSignsY + 18)
    this.doc.text(`Blood Pressure    : ${note.bloodPressure}`, this.pageWidth / 2 + 30, vitalSignsY + 24)
    this.doc.text(`SpO2              : ${note.spo2}`, this.pageWidth / 2 + 30, vitalSignsY + 30)
    this.doc.text(`Weight            : ${note.weight}`, this.pageWidth / 2 + 30, vitalSignsY + 36)
    this.doc.text(`Height            : ${note.height}`, this.pageWidth / 2 + 30, vitalSignsY + 42)
    this.doc.text(`BMI               : ${note.bmi}`, this.pageWidth / 2 + 30, vitalSignsY + 48)
    this.doc.text(`BMI Status        : ${note.bmiStatus}`, this.pageWidth / 2 + 30, vitalSignsY + 54)

    // Horizontal line
    this.doc.line(this.margins.left, yPos, this.pageWidth - this.margins.right, yPos)
    yPos += 20

    // Physical Examination Findings
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Physical Examination Findings:", this.margins.left, yPos)
    yPos += 8
    
    this.doc.setFont('helvetica', 'normal')
    
    // General Examination
    if (note.generalExamination) {
      this.doc.text(`General: ${note.generalExamination}`, this.margins.left, yPos)
      yPos += 6
    }
    
    // Vital Signs Findings
    if (note.vitalSignsFindings) {
      this.doc.text(`Vital Signs: ${note.vitalSignsFindings}`, this.margins.left, yPos)
      yPos += 6
    }
    
    // Body Diagram Findings
    if (Object.keys(note.physicalExaminationFindings).length > 0) {
      this.doc.text("Body Region Findings:", this.margins.left, yPos)
      yPos += 6
      Object.entries(note.physicalExaminationFindings).forEach(([region, finding]) => {
        if (finding.trim()) {
          const regionCapitalized = region.charAt(0).toUpperCase() + region.slice(1)
          this.doc.text(`• ${regionCapitalized}: ${finding}`, this.margins.left + 5, yPos)
          yPos += 6
        }
      })
    }
    
    yPos += 10
    
    // Body diagrams placeholders (matching template layout)
    this.doc.setFontSize(10)
    const diagramY = yPos + 20
    this.doc.text("[Body Diagram - Left Side View]", this.margins.left + 25, diagramY + 60, { align: "center" })
    this.doc.text("[Body Diagram - Front View]", this.pageWidth / 2, diagramY + 60, { align: "center" })
    this.doc.text("[Body Diagram - Right Side View]", this.pageWidth - this.margins.right - 25, diagramY + 60, { align: "center" })
    
    yPos += 100
    this.doc.text("[Body Diagram - Back View]", this.pageWidth / 2, yPos + 60, { align: "center" })
  }

  // Page 2: Other Systems Examination: Gravid Uterus
  private addOtherSystemsPage(note: SimpleMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    let yPos = this.margins.top

    // Header
    this.doc.setFontSize(12)
    this.doc.text("Generated on:", this.pageWidth / 2, yPos, { align: "center" })
    yPos += 20

    // Patient info header
    this.doc.setFontSize(10)
    this.doc.text(`Patient's Name : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text(`Patient's Age : ${note.patientAge}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, this.margins.left, yPos)
    this.doc.text(`Patient's ID  : ${note.patientId}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Chaperone       : ${note.chaperone}`, this.margins.left, yPos)
    yPos += 20

    // Other Systems Examination: Gravid Uterus
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Other Systems Examination: Gravid Uterus", this.margins.left, yPos)
    yPos += 15

    // Gravid uterus diagram placeholder (with week markings as shown in template)
    this.doc.setFontSize(10)
    this.doc.text("[Gravid Uterus Diagram with week markers: 38, 40, 36, 22, 28, 22, 5, 16, 12]", this.pageWidth / 2, yPos + 50, { align: "center" })
  }

  // Page 3: Cardiovascular/Respiratory + Abdominal Examinations
  private addExaminationDiagramsPage(note: SimpleMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    let yPos = this.margins.top

    // Header
    this.doc.setFontSize(12)
    this.doc.text("Generated on:", this.pageWidth / 2, yPos, { align: "center" })
    yPos += 20

    // Patient info header
    this.doc.setFontSize(10)
    this.doc.text(`Patient's Name : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text(`Patient's Age : ${note.patientAge}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, this.margins.left, yPos)
    this.doc.text(`Patient's ID  : ${note.patientId}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Chaperone       : ${note.chaperone}`, this.margins.left, yPos)
    yPos += 20

    // Cardiovascular and Respiratory Examination
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Cardiovascular and Respiratory Examination", this.margins.left, yPos)
    yPos += 15

    // Cardiovascular Examination Findings
    if (note.cardiovascularExamination) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`CVS Findings: ${note.cardiovascularExamination}`, this.margins.left, yPos)
      yPos += 8
    }
    
    // Respiratory Examination Findings
    if (note.respiratoryExamination) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Respiratory Findings: ${note.respiratoryExamination}`, this.margins.left, yPos)
      yPos += 8
    }
    
    // CVS diagram placeholder (with anatomical markings as shown in template)
    this.doc.setFontSize(10)
    this.doc.text("[CVS/Respiratory Diagram with markings: MCL, A, P, T, M]", this.pageWidth / 2, yPos + 30, { align: "center" })
    yPos += 90

    // Abdominal and Inguinal Examination
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Abdominal and Inguinal Examination", this.margins.left, yPos)
    yPos += 15

    // Abdominal Examination Findings
    if (note.abdominalExamination) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Abdominal Findings: ${note.abdominalExamination}`, this.margins.left, yPos)
      yPos += 8
    }
    
    // Other Systems Examination Findings
    if (note.otherSystemsExamination) {
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Other Systems: ${note.otherSystemsExamination}`, this.margins.left, yPos)
      yPos += 8
    }

    // Abdominal diagram placeholder (with region markings as shown in template)
    this.doc.setFontSize(10)
    this.doc.text("[Abdominal Diagram with regions: RH, E, LH, RF, UR, LF, RIF, H, LIF]", this.pageWidth / 2, yPos + 30, { align: "center" })
  }

  // Page 4: Assessment & Plan
  private addAssessmentPlanPage(note: SimpleMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    let yPos = this.margins.top

    // Header
    this.doc.setFontSize(12)
    this.doc.text("Generated on:", this.pageWidth / 2, yPos, { align: "center" })
    yPos += 20

    // Patient info header
    this.doc.setFontSize(10)
    this.doc.text(`Patient's Name : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text(`Patient's Age : ${note.patientAge}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, this.margins.left, yPos)
    this.doc.text(`Patient's ID  : ${note.patientId}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Chaperone       : ${note.chaperone}`, this.margins.left, yPos)
    yPos += 20

    // Investigations & Results
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Investigations & Results", this.margins.left, yPos)
    yPos += 15
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.investigations) || "{{investigations}}", this.margins.left, yPos)
    yPos += 25

    // Assessment / Impression
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Assessment / Impression", this.margins.left, yPos)
    yPos += 15
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.assessment) || "{{assessment}}", this.margins.left, yPos)
    yPos += 25

    // Plan
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Plan", this.margins.left, yPos)
    yPos += 15
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.plan) || "{{plan}}", this.margins.left, yPos)
    yPos += 40

    // Signature and stamp section
    this.doc.line(this.margins.left, yPos, this.pageWidth - this.margins.right, yPos)
    yPos += 15
    
    // Add signature and stamp if available
    if (note.signature || note.stamp) {
      const signatureSpace = (this.pageWidth - this.margins.left - this.margins.right) / 2
      
      // Add signature
      if (note.signature) {
        try {
          this.doc.addImage(note.signature, 'PNG', this.margins.left, yPos, signatureSpace - 10, 25)
        } catch (error) {
          console.error('Error adding signature to PDF:', error)
        }
      }
      
      // Add stamp
      if (note.stamp) {
        try {
          this.doc.addImage(note.stamp, 'PNG', this.margins.left + signatureSpace, yPos, signatureSpace - 10, 25)
        } catch (error) {
          console.error('Error adding stamp to PDF:', error)
        }
      }
      
      yPos += 30
    } else {
      yPos += 5
    }
    
    this.doc.setFontSize(10)
    this.doc.text(`Clinician Signature: ${note.signature ? '(Digital)' : '______________________'} Date / Time: ${note.generatedOn}`, this.margins.left, yPos)
  }

  // Page 5: Main Medical Note with Novate AI Branding
  private addMainMedicalNotePage(note: SimpleMedicalNote) {
    this.doc.addPage()
    let yPos = this.margins.top

    // Novate AI Header (following the template exactly)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("NOVATE AI GROUP (M) SDN. BHD.", this.margins.left, yPos)
    yPos += 8
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text("REGISTRATION NO.: 202501033228 (1634638-V)", this.margins.left, yPos)
    yPos += 6
    this.doc.text("WISMA JS, NO. 26-1, JALAN SEROJA 7, TAMAN SEROJA", this.margins.left, yPos)
    yPos += 6
    this.doc.text("BANDAR BARU SALAK TINGGI", this.margins.left, yPos)
    yPos += 6
    this.doc.text("43900 SEPANG, SELANGOR DARUL EHSAN", this.margins.left, yPos)
    yPos += 6
    this.doc.text("MALAYSIA", this.margins.left, yPos)
    yPos += 15

    // Horizontal line
    this.doc.line(this.margins.left, yPos, this.pageWidth - this.margins.right, yPos)
    yPos += 15

    // Medical Notes Header
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Medical Notes", this.margins.left, yPos)
    
    this.doc.setFontSize(10)
    this.doc.text("Generated on:", this.margins.left + 80, yPos)
    yPos += 10

    // Patient information
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Patient's Name    : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text(`Patient's Age : ${note.patientAge}`, this.pageWidth / 2 + 10, yPos)
    yPos += 8
    this.doc.text(`Patient's Sex     : ${note.patientGender}`, this.margins.left, yPos)
    this.doc.text(`Patient's ID  : ${note.patientId}`, this.pageWidth / 2 + 10, yPos)
    yPos += 8
    this.doc.text(`By               : {user_stamp}`, this.margins.left, yPos)
    yPos += 15

    // Chief complaint
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Chief complaint", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.chiefComplaint) || "{{chief_complaint}}", this.margins.left, yPos)
    yPos += 15

    // History of presenting illness
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("History of presenting illness", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.historyOfPresentingIllness) || "{{hopi}}", this.margins.left, yPos)
    yPos += 15

    // Past medical history
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Past medical history", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    // Structured format as in template
    this.doc.text("• Medical Conditions: " + (safeToString(note.medicalConditions) || "{{pmh_conditions}}"), this.margins.left + 5, yPos)
    yPos += 8
    this.doc.text("• Surgeries: " + (safeToString(note.surgeries) || "{{pmh_surgeries}}"), this.margins.left + 5, yPos)
    yPos += 8
    this.doc.text("• Hospitalizations: " + (safeToString(note.hospitalizations) || "{{pmh_hospitalizations}}"), this.margins.left + 5, yPos)
    yPos += 15

    // Drugs history
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Drugs history", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text("Medications: " + (safeToString(note.medications) || "{{medications}}"), this.margins.left, yPos)
    yPos += 8
    this.doc.text("Allergies: " + (safeToString(note.allergies) || "{{allergies}}"), this.margins.left, yPos)
    yPos += 15

    // Social history and lifestyle
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Social history and lifestyle", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    const socialItems = [
      `• Smoking: ${note.smoking || "{{social_smoking}}"}`,
      `• Alcohol: ${note.alcohol || "{{social_alcohol}}"}`,
      `• Recreational Drugs: ${note.recreationalDrugs || "{{social_drugs}}"}`,
      `• Occupation / Living Situation: ${note.occupationLivingSituation || "{{social_occupation_living}}"}`,
      `• Travel: ${note.travel || "{{social_travel}}"}`,
      `• Sexual: ${note.sexual || "{{social_sexual}}"}`,
      `• Eating out: ${note.eatingOut || "{{social_eatout}}"}"`
    ]
    
    socialItems.forEach(item => {
      this.doc.text(item, this.margins.left + 5, yPos)
      yPos += 6
    })
    yPos += 10

    // Family history
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Family history", this.margins.left, yPos)
    yPos += 10
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.familyHistory) || "{{family_history}}", this.margins.left, yPos)
    yPos += 8
    this.doc.setFontSize(8)
    this.doc.text("#May need to draw family tree diagram", this.margins.left, yPos)
    yPos += 6
    this.doc.text("• especially in genetic diseases.", this.margins.left + 5, yPos)
  }

  // Page 6: Review of Systems
  private addReviewOfSystemsPage(note: SimpleMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    let yPos = this.margins.top

    // Header
    this.doc.setFontSize(12)
    this.doc.text("Generated on:", this.pageWidth / 2, yPos, { align: "center" })
    yPos += 20

    // Patient info header
    this.doc.setFontSize(10)
    this.doc.text(`Patient's Name : ${note.patientName}`, this.margins.left, yPos)
    this.doc.text(`Patient's Age : ${note.patientAge}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, this.margins.left, yPos)
    this.doc.text(`Patient's ID  : ${note.patientId}`, this.pageWidth / 2 + 20, yPos)
    yPos += 8
    this.doc.text(`Chaperone       : ${note.chaperone}`, this.margins.left, yPos)
    yPos += 20

    // Review of Systems
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text("Review of Systems", this.margins.left, yPos)
    yPos += 15

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(safeToString(note.systemsReview) || "{{systems_review}}", this.margins.left, yPos)
  }

  public generateAndDownload(note: SimpleMedicalNote, filename?: string) {
    try {
      // Generate all 6 pages following new.pdf template exactly in correct order
      this.addGeneralExaminationPage(note)      // Page 1: General Examination + Body Diagrams
      this.addOtherSystemsPage(note)            // Page 2: Other Systems Examination: Gravid Uterus
      this.addExaminationDiagramsPage(note)     // Page 3: CVS/Respiratory + Abdominal Examinations  
      this.addAssessmentPlanPage(note)          // Page 4: Assessment & Plan
      this.addMainMedicalNotePage(note)         // Page 5: Main Medical Note (Novate AI branded)
      this.addReviewOfSystemsPage(note)         // Page 6: Review of Systems

      // Download the PDF
      const fileName = filename || `medical-note-${note.patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`
      this.doc.save(fileName)
      
      console.log('✅ Simple PDF generated successfully following new.pdf template (6 pages)')
    } catch (error) {
      console.error('❌ Error generating simple PDF:', error)
      throw error
    }
  }
}

export function generateSimpleMedicalNotePDF(note: SimpleMedicalNote, filename?: string) {
  const generator = new SimplePDFGenerator(note.letterhead)
  generator.generateAndDownload(note, filename)
}

export type { SimpleMedicalNote }