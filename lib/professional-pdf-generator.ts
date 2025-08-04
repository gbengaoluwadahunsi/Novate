// Professional Medical Note PDF Generator - Exact Template Match (Pages 0001-0006)
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface ProfessionalMedicalNote {
  // Patient Information
  patientName: string
  patientAge: string
  patientGender: string
  patientId: string
  chaperone: string
  
  // Vital Signs
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
  
  // Medical Content
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
  systemsReview: string
  
  // Physical Examination
  generalExamination: string
  cardiovascularExamination: string
  respiratoryExamination: string
  abdominalExamination: string
  otherSystemsExamination: string
  physicalExaminationFindings: { [key: string]: string }
  
  // Assessment & Plan
  investigations: string
  assessment: string
  plan: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo: string
  generatedOn: string
  signature: string
  stamp: string
  letterhead?: string
}

class ExactTemplatePDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private letterheadTemplate?: string

  constructor(letterhead?: string) {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.letterheadTemplate = letterhead
  }

  private applyLetterheadBackground() {
    if (this.letterheadTemplate) {
      try {
        this.doc.addImage(
          this.letterheadTemplate,
          'PNG',
          0, 0, this.pageWidth, this.pageHeight,
          undefined, 'NONE', 0
        )
      } catch (error) {
        console.warn('Failed to apply letterhead background:', error)
      }
    }
  }

  private addNovateHeader() {
    // Company logo and details - matching the template exactly
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('NOVATE AI GROUP (M) SDN. BHD.', 20, 25)
    
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('REGISTRATION NO.: 202501033228 (1634638-V)', 20, 32)
    this.doc.text('WISMA JS, NO. 26-1, JALAN SEROJA 7, TAMAN SEROJA', 20, 37)
    this.doc.text('BANDAR BARU SALAK TINGGI', 20, 42)
    this.doc.text('43900 SEPANG, SELANGOR DARUL EHSAN', 20, 47)
    this.doc.text('MALAYSIA', 20, 52)
    
    // Line separator
    this.doc.line(20, 60, this.pageWidth - 20, 60)
  }

  // PAGE 1 (0006): Medical Notes Header + Chief Complaint + History + Past + Drugs + Social + Family
  private addPage1(note: ProfessionalMedicalNote) {
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    // Medical Notes Header
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Medical Notes', 20, 75)
    
    // Generated on + Patient basics
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Generated on:', 150, 75)
    this.doc.text(note.generatedOn, 200, 75)
    
    // Patient Information
    this.doc.text(`Patient's Name  : ${note.patientName}`, 20, 90)
    this.doc.text(`Patient's Age   : ${note.patientAge}`, 150, 90)
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, 20, 100)
    this.doc.text(`Patient's ID    : ${note.patientId}`, 150, 100)
    this.doc.text(`By              : {{user_stamp}}`, 150, 110)
    
    // Chief complaint
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Chief complaint', 20, 130)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`{{chief_complaint}}`, 20, 145)
    this.doc.text(note.chiefComplaint || 'Not recorded', 20, 145)
    
    // History of presenting illness
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('History of presenting illness', 20, 165)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`{{hopi}}`, 20, 180)
    const hopiLines = this.doc.splitTextToSize(note.historyOfPresentingIllness || 'Not recorded', 170)
    this.doc.text(hopiLines, 20, 180)
    
    // Past medical history
    let currentY = 180 + (hopiLines.length * 5) + 10
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Past medical history', 20, currentY)
    currentY += 15
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('• Medical Conditions: {{pmh_conditions}}', 25, currentY)
    this.doc.text(note.medicalConditions || 'None reported', 25, currentY)
    currentY += 10
    this.doc.text('• Surgeries: {{pmh_surgeries}}', 25, currentY)
    this.doc.text(note.surgeries || 'None reported', 25, currentY)
    currentY += 10
    this.doc.text('• Hospitalizations: {{pmh_hospitalizations}}', 25, currentY)
    this.doc.text(note.hospitalizations || 'None reported', 25, currentY)
    
    // Drugs history
    currentY += 20
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Drugs history', 20, currentY)
    currentY += 10
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Medications: {{medications}}`, 20, currentY)
    this.doc.text(note.medications || 'None', 80, currentY)
    currentY += 10
    this.doc.text(`Allergies: {{allergies}}`, 20, currentY)  
    this.doc.text(note.allergies || 'NKDA', 60, currentY)
    
    // Social history and lifestyle
    currentY += 20
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Social history and lifestyle', 20, currentY)
    currentY += 15
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('• Smoking: {{social_smoking}}', 25, currentY)
    this.doc.text(note.smoking || 'Non-smoker', 70, currentY)
    currentY += 10
    this.doc.text('• Alcohol: {{social_alcohol}}', 25, currentY)
    this.doc.text(note.alcohol || 'Social drinker', 70, currentY)
    currentY += 10
    this.doc.text('• Recreational Drugs: {{social_drugs}}', 25, currentY)
    this.doc.text(note.recreationalDrugs || 'Denied', 110, currentY)
    currentY += 10
    this.doc.text('• Occupation / Living Situation: {{social_occupation_living}}', 25, currentY)
    
    // Family history (bottom of page)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Family history', 20, 250)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('{{family_history}}', 20, 265)
    this.doc.text(note.familyHistory || 'No significant family history', 20, 265)
    
    // Family tree diagram placeholder (small box)
    this.doc.rect(120, 250, 70, 40)
    this.doc.setFontSize(8)
    this.doc.text('#May need to draw family tree diagram', 125, 265)
    this.doc.text('• especially in genetic diseases.', 130, 275)
  }

  // PAGE 2 (0005): Review of Systems
  private addPage2(note: ProfessionalMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Review of Systems', 20, 75)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('{{systems_review}}', 20, 95)
    
    // Large content area for systems review
    const reviewLines = this.doc.splitTextToSize(note.systemsReview || 'Review of systems not recorded', 170)
    this.doc.text(reviewLines, 20, 95)
  }

  // PAGE 3 (0004): General Examination + Body Diagrams + Vital Signs
  private addPage3(note: ProfessionalMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    // Page header
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Generated on:', 150, 75)
    
    // General Examination section (left side)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('General Examination', 20, 90)
    this.doc.text(`Patient's Name  :`, 20, 105)
    this.doc.text(`Patient's Age   :`, 20, 115)
    this.doc.text(`Patient's Sex   :`, 20, 125)
    this.doc.text(`Patient's ID    :`, 20, 135)
    this.doc.text(`Chaperone       :`, 20, 145)
    
    // Vital Signs section (right side)
    this.doc.text('Vital Signs', 110, 90)
    this.doc.text('Taken on:', 110, 105)
    this.doc.text('By:', 110, 115)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Temperature     :`, 110, 135)
    this.doc.text(`Pulse Rate      :`, 110, 145)
    this.doc.text(`Respiratory Rate:`, 110, 155)
    this.doc.text(`Blood Pressure  :`, 110, 165)
    
    // Line separator
    this.doc.line(20, 175, this.pageWidth - 20, 175)
    
    // Body diagrams section
    const diagramY = 185
    
    // Front view body diagram (simplified representation)
    this.addSimpleBodyDiagram(30, diagramY, 'front')
    this.doc.setFontSize(8)
    this.doc.text('Left', 20, diagramY + 80)
    
    // Front view body diagram
    this.addSimpleBodyDiagram(80, diagramY, 'front')
    this.doc.text('Front', 75, diagramY + 80)
    
    // Right side view
    this.addSimpleBodyDiagram(130, diagramY, 'side')
    this.doc.text('Right', 125, diagramY + 80)
    
    // Back view (bottom center)
    this.addSimpleBodyDiagram(80, diagramY + 100, 'back')
    this.doc.text('Back', 75, diagramY + 180)
  }

  // PAGE 4 (0003): Other Systems Examination - Gravid Uterus (for female patients)
  private addPage4(note: ProfessionalMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Other Systems Examination: Gravid Uterus', 20, 75)
    
    // Only show for female patients
    if (note.patientGender.toLowerCase() === 'female') {
      // Gravid uterus diagram (simplified representation)
      this.addGravidUterusDiagram(80, 120)
    } else {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('Not applicable for male patient', 20, 120)
    }
  }

  // PAGE 5 (0002): Cardiovascular & Respiratory + Abdominal Examinations
  private addPage5(note: ProfessionalMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    // Cardiovascular and Respiratory Examination
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Cardiovascular and Respiratory Examination', 20, 75)
    
    // Chest diagram
    this.addChestDiagram(50, 90, note)
    
    // Abdominal and Inguinal Examination (bottom half)
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Abdominal and Inguinal ExaminationExamination', 20, 200)
    
    // Abdominal diagram
    this.addAbdominalDiagram(70, 220, note)
  }

  // PAGE 6 (0001): Final page - Investigations + Assessment + Plan + Signature
  private addPage6(note: ProfessionalMedicalNote) {
    this.doc.addPage()
    this.applyLetterheadBackground()
    this.addNovateHeader()
    
    // Page header
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Generated on:', 150, 75)
    this.doc.text(`Patient's Name  : ${note.patientName}`, 20, 90)
    this.doc.text(`Patient's Age   : ${note.patientAge}`, 150, 90)
    this.doc.text(`Patient's Sex   : ${note.patientGender}`, 20, 100)
    this.doc.text(`Patient's ID    : ${note.patientId}`, 150, 100)
    this.doc.text(`Chaperone       :`, 20, 110)
    
    // Investigations & Results
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Investigations & Results', 20, 130)
    this.doc.line(20, 135, 180, 135)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('{{investigations}}', 20, 150)
    const invLines = this.doc.splitTextToSize(note.investigations || 'No investigations ordered', 170)
    this.doc.text(invLines, 20, 150)
    
    // Assessment / Impression
    let currentY = 150 + (invLines.length * 5) + 20
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Assessment / Impression', 20, currentY)
    this.doc.line(20, currentY + 5, 180, currentY + 5)
    
    currentY += 20
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('{{assessment}}', 20, currentY)
    const assessLines = this.doc.splitTextToSize(note.assessment || 'Assessment not recorded', 170)
    this.doc.text(assessLines, 20, currentY)
    
    // Plan
    currentY = currentY + (assessLines.length * 5) + 20
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Plan', 20, currentY)
    this.doc.line(20, currentY + 5, 180, currentY + 5)
    
    currentY += 20
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('{{plan}}', 20, currentY)
    const planLines = this.doc.splitTextToSize(note.plan || 'Treatment plan not recorded', 170)
    this.doc.text(planLines, 20, currentY)
    
    // Signature section (bottom of page)
    this.doc.line(20, 250, 180, 250)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(`Clinician Signature: ______________________ Date / Time: {{sign_datetime}}`, 20, 265)
    this.doc.text(`${note.doctorName} - ${note.doctorRegistrationNo}`, 20, 275)
    
    // Add signature and stamp if available
    if (note.signature) {
      try {
        this.doc.addImage(note.signature, 'PNG', 130, 255, 30, 15)
      } catch (error) {
        console.warn('Failed to add signature:', error)
      }
    }
    
    if (note.stamp) {
      try {
        this.doc.addImage(note.stamp, 'PNG', 165, 250, 25, 25)
      } catch (error) {
        console.warn('Failed to add stamp:', error)
      }
    }
  }

  // Helper methods for diagrams (simplified representations)
  private addSimpleBodyDiagram(x: number, y: number, view: 'front' | 'back' | 'side') {
    // Simple body outline
    this.doc.setLineWidth(1)
    
    // Head
    this.doc.circle(x + 15, y + 10, 8)
    
    // Body trunk
    this.doc.rect(x + 5, y + 18, 20, 35)
    
    // Arms
    this.doc.rect(x - 5, y + 20, 8, 25)
    this.doc.rect(x + 22, y + 20, 8, 25)
    
    // Legs
    this.doc.rect(x + 8, y + 53, 6, 25)
    this.doc.rect(x + 16, y + 53, 6, 25)
  }

  private addChestDiagram(x: number, y: number, note: ProfessionalMedicalNote) {
    // Chest outline
    this.doc.setLineWidth(1)
    this.doc.rect(x + 10, y + 20, 60, 40)
    
    // Heart area
    this.doc.rect(x + 30, y + 30, 15, 12)
    
    // Lung areas
    this.doc.rect(x + 15, y + 25, 12, 25) // Left lung
    this.doc.rect(x + 53, y + 25, 12, 25) // Right lung
    
    // Anatomical landmarks
    this.doc.setFontSize(8)
    this.doc.text('MCL', x + 37, y + 10)
    this.doc.text('A', x + 20, y + 15)
    this.doc.text('P', x + 55, y + 15)
    this.doc.text('T', x + 30, y + 25)
    this.doc.text('M', x + 50, y + 25)
    
    // Add examination findings as dots if present
    if (note.cardiovascularExamination || note.respiratoryExamination) {
      this.doc.setFillColor(255, 0, 0)
      this.doc.circle(x + 35, y + 35, 2, 'F')
      this.doc.circle(x + 20, y + 35, 2, 'F')
      this.doc.circle(x + 60, y + 35, 2, 'F')
    }
  }

  private addAbdominalDiagram(x: number, y: number, note: ProfessionalMedicalNote) {
    // Abdominal outline
    this.doc.setLineWidth(1)
    this.doc.rect(x, y, 60, 50)
    
    // 9-region grid
    this.doc.line(x + 20, y, x + 20, y + 50) // Left vertical
    this.doc.line(x + 40, y, x + 40, y + 50) // Right vertical
    this.doc.line(x, y + 17, x + 60, y + 17) // Top horizontal
    this.doc.line(x, y + 33, x + 60, y + 33) // Bottom horizontal
    
    // Region labels
    this.doc.setFontSize(8)
    this.doc.text('RH', x + 10, y + 10)
    this.doc.text('E', x + 30, y + 10)
    this.doc.text('LH', x + 50, y + 10)
    this.doc.text('RF', x + 10, y + 25)
    this.doc.text('U', x + 30, y + 25)
    this.doc.text('LF', x + 50, y + 25)
    this.doc.text('RIF', x + 8, y + 42)
    this.doc.text('H', x + 30, y + 42)
    this.doc.text('LIF', x + 50, y + 42)
    
    // Umbilicus
    this.doc.circle(x + 30, y + 25, 2)
  }

  private addGravidUterusDiagram(x: number, y: number) {
    // Simplified gravid uterus outline
    this.doc.setLineWidth(1)
    
    // Uterine outline with pregnancy size markers
    this.doc.ellipse(x, y, 30, 40)
    
    // Pregnancy week markers
    const weeks = [12, 16, 20, 28, 32, 36, 40]
    weeks.forEach((week, index) => {
      const markY = y - 35 + (index * 8)
      this.doc.text(`${week}`, x - 15, markY)
      this.doc.line(x - 10, markY, x + 30, markY)
    })
    
    this.doc.setFontSize(8)
    this.doc.text('weeks', x - 15, y - 45)
  }

  generatePDF(note: ProfessionalMedicalNote): void {
    // Generate all 6 pages in the exact template order
    this.addPage1(note)  // Page 0006: Medical Notes + Chief + History + Past + Drugs + Social + Family
    this.addPage2(note)  // Page 0005: Review of Systems
    this.addPage3(note)  // Page 0004: General Examination + Body Diagrams + Vital Signs
    this.addPage4(note)  // Page 0003: Other Systems - Gravid Uterus
    this.addPage5(note)  // Page 0002: CVS/Respiratory + Abdominal Examinations
    this.addPage6(note)  // Page 0001: Investigations + Assessment + Plan + Signature
    
    // Download the PDF
    this.doc.save(`Medical_Note_${note.patientName}_${new Date().toISOString().split('T')[0]}.pdf`)
  }
}

export function generateProfessionalMedicalNotePDF(note: ProfessionalMedicalNote): void {
  const generator = new ExactTemplatePDFGenerator(note.letterhead)
  generator.generatePDF(note)
}