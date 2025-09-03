// Enhanced Professional Medical Note PDF Generator - Exact Template Match
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

export interface ProfessionalMedicalNote {
  // Patient Information
  patientName: string
  patientAge: string
  patientGender: string
  chaperone?: string
  
  // Vital Signs
  temperature?: string
  pulseRate?: string
  respiratoryRate?: string
  bloodPressure?: string
  glucose?: string
  spo2?: string
  weight?: string
  height?: string
  bmi?: string
  bmiStatus?: string
  takenOn?: string
  takenBy?: string
  
  // Medical Content
  chiefComplaint: string
  historyOfPresentingIllness: string
  medicalConditions?: string
  surgeries?: string
  hospitalizations?: string
  medications?: string
  allergies?: string
  smoking?: string
  alcohol?: string
  recreationalDrugs?: string
  occupationLivingSituation?: string
  travel?: string
  sexual?: string
  eatingOut?: string
  familyHistory?: string
  systemsReview?: string
  
  // Physical Examination
  generalExamination?: string
  cardiovascularExamination?: string
  respiratoryExamination?: string
  abdominalExamination?: string
  otherSystemsExamination?: string
  physicalExaminationFindings?: { [key: string]: string }
  
  // Assessment & Plan
  investigations?: string
  assessment: string
  plan: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo?: string
  generatedOn: string
  signature?: string
  stamp?: string
  letterhead?: string
  
  // ICD-11 Codes
  selectedICD11Codes?: any
}

class EnhancedTemplatePDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private letterheadTemplate?: string
  private currentY: number = 0

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
        // Failed to apply letterhead background
      }
    }
  }

  private addProfessionalHeader() {
    // Only add letterhead if one is provided
    if (this.letterheadTemplate) {
      this.applyLetterheadBackground()
      // Set content to start below letterhead area
      this.currentY = 100
    } else {
      // No letterhead - start content from top with minimal margin
      this.currentY = 20
    }
  }

  private addSectionHeader(title: string, fontSize: number = 14): void {
    this.currentY += 10
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, 20, this.currentY)
    
    // Underline for main sections
    if (fontSize >= 14) {
      this.doc.setLineWidth(0.3)
      this.doc.line(20, this.currentY + 2, 20 + this.doc.getTextWidth(title), this.currentY + 2)
    }
    
    this.currentY += 8
  }

  private addContent(content: any, maxWidth: number = 170): void {
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    // Convert content to string safely
    let textContent = ''
    if (content === undefined || content === null) {
      return // Skip empty content
    }
    
    if (typeof content === 'string') {
      textContent = content.trim()
    } else if (Array.isArray(content)) {
      textContent = content.filter(item => item != null).join(', ').trim()
    } else if (typeof content === 'object') {
      textContent = JSON.stringify(content).trim()
    } else {
      textContent = String(content).trim()
    }
    
    if (textContent) {
      const lines = this.doc.splitTextToSize(textContent, maxWidth)
      this.doc.text(lines, 20, this.currentY)
      this.currentY += lines.length * 5 + 5
    }
          // Don't show "Not mentioned" - skip empty sections entirely
  }

  private hasContent(content?: any): boolean {
    if (content === undefined || content === null) return false
    
    // Handle string content
    if (typeof content === 'string') {
      return content.trim() !== ''
    }
    
    // Handle array content
    if (Array.isArray(content)) {
      return content.length > 0 && content.some(item => 
        item !== null && item !== undefined && (typeof item === 'string' ? item.trim() !== '' : true)
      )
    }
    
    // Handle object content
    if (typeof content === 'object') {
      return Object.keys(content).length > 0 && Object.values(content).some(value => 
        value !== null && value !== undefined && (typeof value === 'string' ? value.trim() !== '' : true)
      )
    }
    
    // Handle other types (numbers, booleans, etc.)
    return true
  }

  private addLabeledContent(label: string, content: string, inline: boolean = false): void {
    // Only add content if it exists
    if (!this.hasContent(content)) return
    
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(10)
    
    if (inline) {
      this.doc.text(`${label}:`, 20, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(content, 20 + this.doc.getTextWidth(`${label}: `), this.currentY)
      this.currentY += 6
    } else {
      this.doc.text(`${label}:`, 20, this.currentY)
      this.currentY += 6
      this.addContent(content)
    }
  }

  // Extract anatomical findings from medical text
  private extractAnatomicalFindings(note: ProfessionalMedicalNote): any {
    const findings = {
      cardiovascular: [] as Array<{label: string, value: string, x: number, y: number}>,
      respiratory: [] as Array<{label: string, value: string, x: number, y: number}>,
      abdominal: [] as Array<{label: string, value: string, x: number, y: number}>,
      general: [] as Array<{label: string, value: string, x: number, y: number}>
    }

    // Cardiovascular findings
    if (this.hasContent(note.cardiovascularExamination)) {
      const cvText = note.cardiovascularExamination!.toLowerCase()
      if (cvText.includes('heart') || cvText.includes('s1') || cvText.includes('s2')) {
        findings.cardiovascular.push({label: 'Heart Sounds', value: 'S1, S2 heard', x: 100, y: 50})
      }
      if (cvText.includes('murmur')) {
        findings.cardiovascular.push({label: 'Murmur', value: 'Present', x: 110, y: 60})
      }
      if (cvText.includes('jvp') || cvText.includes('jugular')) {
        findings.cardiovascular.push({label: 'JVP', value: 'Assessed', x: 90, y: 40})
      }
    }

    // Respiratory findings
    if (this.hasContent(note.respiratoryExamination)) {
      const respText = note.respiratoryExamination!.toLowerCase()
      if (respText.includes('lung') || respText.includes('chest')) {
        findings.respiratory.push({label: 'Lung Fields', value: 'Clear', x: 120, y: 70})
      }
      if (respText.includes('wheeze') || respText.includes('crackles')) {
        findings.respiratory.push({label: 'Adventitious Sounds', value: 'Present', x: 130, y: 80})
      }
    }

    // Abdominal findings
    if (this.hasContent(note.abdominalExamination)) {
      const abdText = note.abdominalExamination!.toLowerCase()
      if (abdText.includes('tender') || abdText.includes('soft')) {
        findings.abdominal.push({label: 'Abdomen', value: 'Soft, non-tender', x: 100, y: 100})
      }
      if (abdText.includes('liver')) {
        findings.abdominal.push({label: 'Liver', value: 'Not enlarged', x: 80, y: 90})
      }
      if (abdText.includes('spleen')) {
        findings.abdominal.push({label: 'Spleen', value: 'Not palpable', x: 120, y: 90})
      }
    }

    // General examination findings
    if (this.hasContent(note.generalExamination)) {
      const genText = note.generalExamination!.toLowerCase()
      if (genText.includes('alert') || genText.includes('conscious')) {
        findings.general.push({label: 'Consciousness', value: 'Alert and oriented', x: 100, y: 30})
      }
      if (genText.includes('pallor') || genText.includes('cyanosis')) {
        findings.general.push({label: 'Color', value: 'No pallor/cyanosis', x: 90, y: 40})
      }
    }

    return findings
  }

  private checkPageBreak(requiredSpace: number = 30): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage()
      this.addProfessionalHeader()
    }
  }

  // PAGE 1: Patient Information & Medical History
  private addPage1_PatientInfoAndHistory(note: any): void {
    this.addProfessionalHeader();
    
    // Title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Medical Notes', 20, this.currentY);
    this.currentY += 15;
    
    // Patient Information
    if (note.patientInformation) {
        this.addSectionHeader('Patient Information');
        this.addLabeledContent('Name', note.patientInformation.name, true);
        this.addLabeledContent('Age', note.patientInformation.age.toString(), true);
        this.addLabeledContent('Gender', note.patientInformation.gender, true);
        this.currentY += 5;
    }
    
    // Chief Complaint
    this.addSectionHeader('Chief Complaint');
    this.addContent(note.chiefComplaint);
    
    // History of Presenting Illness
    this.addSectionHeader('History of Presenting Illness');
    this.addContent(note.historyOfPresentingIllness);
    
    this.checkPageBreak();
    
    // Past Medical History
    this.addSectionHeader('Past Medical History');
    if (note.pastMedicalHistory) {
      this.addLabeledContent('Medical Conditions', note.pastMedicalHistory);
    }
    
    // Drug History and Allergies
    this.addSectionHeader('Drug History and Allergies');
    if (note.medication) {
      this.addLabeledContent('Current Medications', note.medication);
    }
    if (note.allergies) {
      this.addLabeledContent('Known Allergies', note.allergies);
    }
    
    // Social History
    this.addSectionHeader('Social History');
    this.addContent(note.socialHistory);
    
    // Family History
    this.addSectionHeader('Family History');
    this.addContent(note.familyHistory);
  }

  // PAGE 2: Review of Systems (Structured) - only show if there's data
  private addPage2_ReviewOfSystems(note: any): void {
    // Only create this page if there's systems review data
    if (!this.hasContent(note.reviewOfSystems)) return;
    
    this.doc.addPage();
    this.addProfessionalHeader();
    
    this.addSectionHeader('Review of Systems', 16);
    
    // Show structured systems review content
    this.addContent(note.reviewOfSystems);
  }

  // PAGE 3: Physical Examination with Body Diagrams
  private addPage3_PhysicalExaminationDiagrams(note: any): void {
    this.doc.addPage();
    this.addProfessionalHeader();
    
    this.addSectionHeader('Physical Examination', 16);
    
    // Check if there's examination data
    const hasExaminationData = this.hasContent(note.examinationData);
    
    if (hasExaminationData) {
      // Show structured examination content
      this.addContent(note.examinationData);
    } else {
      // Show explicit message that no examination was conducted
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.text('No physical examination was performed during this consultation.', 20, this.currentY + 10);
      this.doc.text('Physical examination findings would be documented here if performed.', 20, this.currentY + 20);
    }
  }

  // PAGE 4: Cardiovascular & Respiratory Examination
  private addPage4_CardiovascularRespiratory(note: ProfessionalMedicalNote): void {
    const hasCardioResp = this.hasContent(note.cardiovascularExamination) || this.hasContent(note.respiratoryExamination)
    
    // Only create this page if there's relevant data
    if (!hasCardioResp) return
    
    this.doc.addPage()
    this.addProfessionalHeader()
    
    this.addSectionHeader('Cardiovascular and Respiratory Examination', 16)
    
    // Extract anatomical findings for dynamic labeling
    const findings = this.extractAnatomicalFindings(note)
    
    // Cardiovascular Section - only show if there's data
    if (this.hasContent(note.cardiovascularExamination)) {
      this.addSectionHeader('Cardiovascular System', 12)
      this.addContent(note.cardiovascularExamination!)
    }
    
    // Respiratory Section - only show if there's data
    if (this.hasContent(note.respiratoryExamination)) {
      this.addSectionHeader('Respiratory System', 12)
      this.addContent(note.respiratoryExamination!)
    }
    
    // Chest diagram with dynamic labeling - only if there are findings
    const hasChestFindings = findings.cardiovascular.length > 0 || findings.respiratory.length > 0
    if (hasChestFindings) {
      this.checkPageBreak(100)
      this.addSectionHeader('Chest Examination Diagram', 12)
      
      const chestY = this.currentY + 10
      this.addDynamicChestDiagram(70, chestY, 60, 40, findings)
      this.currentY = chestY + 80 // Extra space for labels
    }
  }

  // PAGE 5: Abdominal & Other Systems Examination
  private addPage5_AbdominalExamination(note: ProfessionalMedicalNote): void {
    const hasAbdominal = this.hasContent(note.abdominalExamination) || this.hasContent(note.otherSystemsExamination)
    
    // Only create this page if there's relevant data
    if (!hasAbdominal) return
    
    this.doc.addPage()
    this.addProfessionalHeader()
    
    this.addSectionHeader('Abdominal and Inguinal Examination', 16)
    
    // Extract anatomical findings for dynamic labeling
    const findings = this.extractAnatomicalFindings(note)
    
    // Abdominal Examination - only show if there's data
    if (this.hasContent(note.abdominalExamination)) {
      this.addSectionHeader('Abdominal System', 12)
      this.addContent(note.abdominalExamination!)
    }
    
    // Abdominal diagram with dynamic labeling - only if there are findings
    if (findings.abdominal.length > 0) {
      this.checkPageBreak(100)
      this.addSectionHeader('Abdominal Examination Diagram', 12)
      
      const abdomenY = this.currentY + 10
      this.addDynamicAbdominalDiagram(70, abdomenY, 60, 50, findings)
      this.currentY = abdomenY + 80 // Extra space for labels
    }
    
    // Other Systems - only show if there's data
    if (this.hasContent(note.otherSystemsExamination)) {
      this.checkPageBreak()
      this.addSectionHeader('Other Systems Examination', 12)
      this.addContent(note.otherSystemsExamination!)
    }
  }

  // PAGE 6: Investigation, Assessment, Plan & Signature
  private addPage6_AssessmentAndPlan(note: any): void {
    this.doc.addPage()
    this.addProfessionalHeader()
    
    // Investigation & Results - only show if there's data
    if (this.hasContent(note.investigations)) {
      this.addSectionHeader('Investigation & Results', 14)
      this.addContent(note.investigations!)
      this.checkPageBreak()
    }
    
    // Assessment + Impression - only show if there's data
    if (this.hasContent(note.assessment)) {
      this.addSectionHeader('Assessment + Impression', 14)
      this.addContent(note.assessment)
      this.checkPageBreak()
    }
    
    // Plan - only show if there's data
    if (this.hasContent(note.plan)) {
      this.addSectionHeader('Plan', 14)
      this.addContent(note.plan)
      this.checkPageBreak(60)
    }
    
    // Doctor Information and Signature (always show)
    this.currentY += 25
    
    // Professional signature section with border
    this.doc.setLineWidth(0.5)
    this.doc.rect(15, this.currentY - 5, 180, 60) // Signature box border
    
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(12)
    this.doc.text('Doctor Information & Authorization', 20, this.currentY + 5)
    
    // Doctor details in left column
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    this.doc.text(`Doctor: Dr. [Name]`, 20, this.currentY + 15)
    this.doc.text(`Registration No: [Registration Number]`, 20, this.currentY + 22)
    this.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, this.currentY + 29)
    
    // Signature section in right column
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Doctor Signature:', 110, this.currentY + 12)
    
    // Signature border box
    this.doc.setLineWidth(0.3)
    this.doc.rect(110, this.currentY + 15, 40, 20)
    
    // Add placeholder for signature
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(6)
    this.doc.text('Signature', 125, this.currentY + 25)
    
    // Stamp section
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Official Stamp:', 155, this.currentY + 12)
    
    // Stamp border box
    this.doc.rect(155, this.currentY + 15, 25, 20)
    
    // Add placeholder for stamp
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(6)
    this.doc.text('Stamp', 163, this.currentY + 25)
  }

  // Helper methods for diagrams
  private addBodyDiagramPlaceholder(x: number, y: number, size: number, label: string): void {
    // Simple body outline
    this.doc.setLineWidth(0.5)
    this.doc.ellipse(x + size/2, y + size/4, size/4, size/3) // Head
    this.doc.line(x + size/2, y + size/3, x + size/2, y + size*0.8) // Body
    this.doc.line(x + size/4, y + size/2, x + size*0.75, y + size/2) // Arms
    this.doc.line(x + size/2, y + size*0.8, x + size/3, y + size) // Left leg
    this.doc.line(x + size/2, y + size*0.8, x + size*0.67, y + size) // Right leg
    
    this.doc.setFontSize(8)
    this.doc.text(label, x + size/2 - this.doc.getTextWidth(label)/2, y + size + 10)
  }

  private addChestDiagramPlaceholder(x: number, y: number, width: number, height: number): void {
    // Chest outline
    this.doc.setLineWidth(0.5)
    this.doc.ellipse(x + width/2, y + height/2, width/2, height/2)
    
    // Heart area
    this.doc.ellipse(x + width*0.3, y + height*0.4, width*0.15, height*0.2)
    
    // Lung areas
    this.doc.ellipse(x + width*0.2, y + height*0.3, width*0.15, height*0.25)
    this.doc.ellipse(x + width*0.8, y + height*0.3, width*0.15, height*0.25)
    
    this.doc.setFontSize(8)
    this.doc.text('Chest Examination', x + width/2 - this.doc.getTextWidth('Chest Examination')/2, y + height + 10)
  }

  private addAbdominalDiagramPlaceholder(x: number, y: number, width: number, height: number): void {
    // Abdominal outline
    this.doc.setLineWidth(0.5)
    this.doc.rect(x, y, width, height)
    
    // Quadrant divisions
    this.doc.line(x + width/2, y, x + width/2, y + height)
    this.doc.line(x, y + height/2, x + width, y + height/2)
    
    // Organ representations
    this.doc.setFontSize(6)
    this.doc.text('RUQ', x + width*0.25 - 5, y + height*0.25)
    this.doc.text('LUQ', x + width*0.75 - 5, y + height*0.25)
    this.doc.text('RLQ', x + width*0.25 - 5, y + height*0.75)
    this.doc.text('LLQ', x + width*0.75 - 5, y + height*0.75)
    
    this.doc.setFontSize(8)
    this.doc.text('Abdominal Examination', x + width/2 - this.doc.getTextWidth('Abdominal Examination')/2, y + height + 10)
  }

  // Dynamic chest diagram with anatomical findings
  private addDynamicChestDiagram(x: number, y: number, width: number, height: number, findings: any): void {
    // Base chest outline
    this.doc.setLineWidth(0.5)
    this.doc.ellipse(x + width/2, y + height/2, width/2, height/2)
    
    // Heart area
    this.doc.ellipse(x + width*0.3, y + height*0.4, width*0.15, height*0.2)
    
    // Lung areas
    this.doc.ellipse(x + width*0.2, y + height*0.3, width*0.15, height*0.25)
    this.doc.ellipse(x + width*0.8, y + height*0.3, width*0.15, height*0.25)
    
    // Add dynamic labels based on findings
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'normal')
    
    let labelY = y + height + 15
    
    // Cardiovascular findings
    findings.cardiovascular.forEach((finding: any) => {
      this.doc.text(`${finding.label}: ${finding.value}`, x, labelY)
      labelY += 8
    })
    
    // Respiratory findings
    findings.respiratory.forEach((finding: any) => {
      this.doc.text(`${finding.label}: ${finding.value}`, x, labelY)
      labelY += 8
    })
    
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Cardiovascular and Respiratory Examination', x + width/2 - this.doc.getTextWidth('Cardiovascular and Respiratory Examination')/2, y + height + 10)
  }

  // Dynamic abdominal diagram with anatomical findings
  private addDynamicAbdominalDiagram(x: number, y: number, width: number, height: number, findings: any): void {
    // Base abdominal outline
    this.doc.setLineWidth(0.5)
    this.doc.rect(x, y, width, height)
    
    // Quadrant divisions
    this.doc.line(x + width/2, y, x + width/2, y + height)
    this.doc.line(x, y + height/2, x + width, y + height/2)
    
    // Basic organ outlines
    // Liver (RUQ)
    this.doc.ellipse(x + width*0.25, y + height*0.25, width*0.15, height*0.15)
    // Spleen (LUQ)
    this.doc.ellipse(x + width*0.75, y + height*0.25, width*0.1, height*0.1)
    // Stomach (LUQ)
    this.doc.ellipse(x + width*0.6, y + height*0.3, width*0.12, height*0.08)
    
    // Add dynamic labels based on findings
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'normal')
    
    let labelY = y + height + 15
    
    // Abdominal findings
    findings.abdominal.forEach((finding: any) => {
      this.doc.text(`${finding.label}: ${finding.value}`, x, labelY)
      labelY += 8
    })
    
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Abdominal Examination', x + width/2 - this.doc.getTextWidth('Abdominal Examination')/2, y + height + 10)
  }

  public generateEnhancedProfessionalMedicalNotePDF(note: any): jsPDF {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    
    // Generate all pages
    this.addPage1_PatientInfoAndHistory(note)
    this.addPage2_ReviewOfSystems(note)
    this.addPage3_PhysicalExaminationDiagrams(note)
    this.addPage6_AssessmentAndPlan(note)
    
    return this.doc
  }

  public generatePDF(note: any): jsPDF {
    return this.generateEnhancedProfessionalMedicalNotePDF(note)
  }

  // Helper method to add enhanced body diagrams with Novate MedViz integration
  private addEnhancedBodyDiagram(x: number, y: number, size: number, viewLabel: string, findings: any[]): void {
    // Draw enhanced diagram placeholder with border
    this.doc.setDrawColor(100, 100, 100)
    this.doc.setLineWidth(0.5)
    this.doc.rect(x, y, size, size)
    
    // Add gradient background effect
    this.doc.setFillColor(245, 245, 250)
    this.doc.rect(x + 1, y + 1, size - 2, size - 2, 'F')
    
    // Add view label
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(viewLabel, x + size/2, y + size + 5, { align: 'center' })
    
    // Add finding indicators on diagram
    findings.slice(0, 3).forEach((finding, index) => {
      const indicatorX = x + 5 + (index * 6)
      const indicatorY = y + 5
      
      // Color code based on severity
      const severity = this.determineFindingSeverity(finding.value)
      const color = severity === 'severe' ? [255, 0, 0] : severity === 'moderate' ? [255, 165, 0] : [0, 128, 0]
      
      this.doc.setFillColor(color[0], color[1], color[2])
      this.doc.circle(indicatorX, indicatorY, 2, 'F')
    })
    
    // Add "Powered by Novate MedViz" watermark
    this.doc.setFontSize(6)
    this.doc.setFont('helvetica', 'italic')
    this.doc.setTextColor(150, 150, 150)
    this.doc.text('Novate MedViz', x + size/2, y + size - 2, { align: 'center' })
    this.doc.setTextColor(0, 0, 0)
  }

  // Helper method to determine finding severity
  private determineFindingSeverity(findingValue: string): string {
    return 'finding'
  }
}

export function generateEnhancedProfessionalMedicalNotePDF(note: any): void {
  const generator = new EnhancedTemplatePDFGenerator(note.letterhead)
  const pdf = generator.generatePDF(note)
  
  // Safely handle patient name for filename
  const patientName = typeof note.patientInformation.name === 'string' ? note.patientInformation.name : 'Unknown_Patient'
  const safePatientName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  
  pdf.save(`Medical_Note_${safePatientName}_${dateStr}.pdf`)
}

// New function to handle ProfessionalMedicalNote interface with multi-page support
export function generateProfessionalMedicalNotePDF(note: ProfessionalMedicalNote, letterhead?: string): void {
  const generator = new EnhancedTemplatePDFGenerator(letterhead)
  
  // Convert ProfessionalMedicalNote to MedicalNoteComprehensive
  const comprehensiveNote: any = {
    id: '',
    patientInformation: {
      name: note.patientName || '',
      age: parseInt(note.patientAge) || 0,
      gender: (note.patientGender as 'male' | 'female') || 'male',
      contactNumber: '',
      email: '',
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        contactNumber: ''
      }
    },
    chiefComplaint: note.chiefComplaint || '',
    historyOfPresentingIllness: note.historyOfPresentingIllness || '',
    pastMedicalHistory: note.medicalConditions || '',
    medication: note.medications || '',
    allergies: note.allergies || '',
    socialHistory: [
      note.smoking,
      note.alcohol,
      note.recreationalDrugs,
      note.occupationLivingSituation,
      note.travel,
      note.sexual,
      note.eatingOut
    ].filter(Boolean).join(', '),
    familyHistory: note.familyHistory || '',
    reviewOfSystems: note.systemsReview || '',
    examinationData: {
      generalExamination: '',
      cardiovascularExamination: '',
      respiratoryExamination: '',
      abdominalExamination: '',
      otherSystemsExamination: ''
    },
    investigations: note.investigations || '',
    assessment: note.assessment || '',
    plan: note.plan || '',
    icd11Codes: note.selectedICD11Codes || { primary: [], secondary: [] },
    doctorInformation: {
      name: note.doctorName || '',
      registrationNumber: note.doctorRegistrationNo || '',
      signature: note.signature || '',
      stamp: note.stamp || ''
    },
    generatedOn: note.generatedOn || new Date().toISOString(),
    letterhead: letterhead
  }
  
  const pdf = generator.generatePDF(comprehensiveNote)
  
  // Safely handle patient name for filename
  const patientName = note.patientName || 'Unknown_Patient'
  const safePatientName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  
  pdf.save(`Medical_Note_${safePatientName}_${dateStr}.pdf`)
}

export { EnhancedTemplatePDFGenerator }