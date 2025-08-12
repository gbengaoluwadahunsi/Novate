// Enhanced Professional Medical Note PDF Generator - Exact Template Match
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface ProfessionalMedicalNote {
  // Patient Information
  patientName: string
  patientAge: string
  patientGender: string
  patientId: string
  chaperone?: string
  
  // Vital Signs
  temperature?: string
  pulseRate?: string
  respiratoryRate?: string
  bloodPressure?: string
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
        console.warn('Failed to apply letterhead background:', error)
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
    // Don't show "Not recorded" - skip empty sections entirely
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
  private addPage1_PatientInfoAndHistory(note: ProfessionalMedicalNote): void {
    this.addProfessionalHeader()
    
    // Title
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Medical Notes', 20, this.currentY)
    this.currentY += 15
    
    // Skip Patient Information section - removed per user feedback
    
    // Chief Complaint
    this.addSectionHeader('Chief Complaint')
    this.addContent(note.chiefComplaint)
    
    // History of Presenting Illness
    this.addSectionHeader('History of Presenting Illness')
    this.addContent(note.historyOfPresentingIllness)
    
    this.checkPageBreak()
    
    // Past Medical History - only show if there's data
    const hasPastHistory = this.hasContent(note.medicalConditions) || 
                          this.hasContent(note.surgeries) || 
                          this.hasContent(note.hospitalizations)
    
    if (hasPastHistory) {
      this.addSectionHeader('Past Medical History')
      this.addLabeledContent('Medical Conditions', note.medicalConditions || '')
      this.addLabeledContent('Surgeries', note.surgeries || '')
      this.addLabeledContent('Hospitalizations', note.hospitalizations || '')
      this.checkPageBreak()
    }
    
    // Drug History and Allergies - only show if there's data
    const hasDrugHistory = this.hasContent(note.medications) || this.hasContent(note.allergies)
    if (hasDrugHistory) {
      this.addSectionHeader('Drug History and Allergies')
      this.addLabeledContent('Current Medications', note.medications || '')
      this.addLabeledContent('Known Allergies', note.allergies || '')
    }
    
    // Social History - only show if there's data
    const hasSocialHistory = this.hasContent(note.smoking) || 
                            this.hasContent(note.alcohol) || 
                            this.hasContent(note.occupationLivingSituation)
    
    if (hasSocialHistory) {
      this.addSectionHeader('Social History')
      this.addLabeledContent('Smoking', note.smoking || '', true)
      this.addLabeledContent('Alcohol', note.alcohol || '', true)
      this.addLabeledContent('Occupation/Living', note.occupationLivingSituation || '')
    }
    
    // Family History - only show if there's data
    if (this.hasContent(note.familyHistory)) {
      this.addSectionHeader('Family History')
      this.addContent(note.familyHistory!)
    }
  }

  // PAGE 2: Review of Systems (Structured) - only show if there's data
  private addPage2_ReviewOfSystems(note: ProfessionalMedicalNote): void {
    // Only create this page if there's systems review data
    if (!this.hasContent(note.systemsReview)) return
    
    this.doc.addPage()
    this.addProfessionalHeader()
    
    this.addSectionHeader('Review of Systems', 16)
    
    // Show structured systems review content
    this.addContent(note.systemsReview!)
    
    // You can optionally add checkboxes if you want a structured format
    // For now, we'll just show the actual review content since that's what we have data for
  }

  // PAGE 3: Physical Examination with Body Diagrams
  private addPage3_PhysicalExaminationDiagrams(note: ProfessionalMedicalNote): void {
    this.doc.addPage()
    this.addProfessionalHeader()
    
    this.addSectionHeader('Physical Examination', 16)
    
    // Vital Signs - only show if there's data
    const hasVitals = this.hasContent(note.temperature) || this.hasContent(note.pulseRate) || 
                     this.hasContent(note.respiratoryRate) || this.hasContent(note.bloodPressure) ||
                     this.hasContent(note.spo2) || this.hasContent(note.weight) || 
                     this.hasContent(note.height) || this.hasContent(note.bmi)
    
    if (hasVitals) {
      this.addSectionHeader('Vital Signs', 12)
      
      // Create a dynamic table-like structure for vital signs
      const vitalY = this.currentY
      let currentVitalY = vitalY
      
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(9)
      
      // Left column vitals
      if (this.hasContent(note.temperature)) {
        this.doc.text('Temperature:', 20, currentVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.temperature!, 75, currentVitalY)
        this.doc.setFont('helvetica', 'bold')
        currentVitalY += 10
      }
      
      if (this.hasContent(note.pulseRate)) {
        this.doc.text('Pulse Rate:', 20, currentVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.pulseRate!, 75, currentVitalY)
        this.doc.setFont('helvetica', 'bold')
        currentVitalY += 10
      }
      
      if (this.hasContent(note.respiratoryRate)) {
        this.doc.text('Respiratory Rate:', 20, currentVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.respiratoryRate!, 75, currentVitalY)
        this.doc.setFont('helvetica', 'bold')
        currentVitalY += 10
      }
      
      if (this.hasContent(note.bloodPressure)) {
        this.doc.text('Blood Pressure:', 20, currentVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.bloodPressure!, 75, currentVitalY)
        this.doc.setFont('helvetica', 'bold')
        currentVitalY += 10
      }
      
      // Right column vitals
      let rightVitalY = vitalY
      
      if (this.hasContent(note.spo2)) {
        this.doc.text('SpO2:', 110, rightVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.spo2!, 140, rightVitalY)
        this.doc.setFont('helvetica', 'bold')
        rightVitalY += 10
      }
      
      if (this.hasContent(note.weight)) {
        this.doc.text('Weight:', 110, rightVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.weight!, 140, rightVitalY)
        this.doc.setFont('helvetica', 'bold')
        rightVitalY += 10
      }
      
      if (this.hasContent(note.height)) {
        this.doc.text('Height:', 110, rightVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.height!, 140, rightVitalY)
        this.doc.setFont('helvetica', 'bold')
        rightVitalY += 10
      }
      
      if (this.hasContent(note.bmi)) {
        this.doc.text('BMI:', 110, rightVitalY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.bmi!, 140, rightVitalY)
        this.doc.setFont('helvetica', 'bold')
        rightVitalY += 10
      }
      
      this.currentY = Math.max(currentVitalY, rightVitalY) + 10
    }
    
    // General Examination - only show if there's data
    if (this.hasContent(note.generalExamination)) {
      this.addSectionHeader('General Examination', 12)
      this.addContent(note.generalExamination!)
      
              // Body Diagrams Section - only if there are general examination findings
        const findings = this.extractAnatomicalFindings(note)
        if (findings.general.length > 0) {
          this.checkPageBreak(80)
          this.addSectionHeader('Medical Body Diagrams', 12)
          
          // Enhanced diagram section with Novate MedViz integration
          const diagramY = this.currentY + 10
          const diagramSize = 25
          const spacing = 45
          
          // Add note about diagram integration
          this.doc.setFontSize(8)
          this.doc.setFont('helvetica', 'italic')
          this.doc.text('Generated using Novate MedViz - Advanced Medical Visualization', 30, diagramY)
          
          // Front view with enhanced labeling
          this.addEnhancedBodyDiagram(30, diagramY + 10, diagramSize, 'Front View', findings.general)
          
          // Back view with enhanced labeling
          this.addEnhancedBodyDiagram(30 + spacing, diagramY + 10, diagramSize, 'Back View', findings.general)
          
          // Side view with enhanced labeling
          this.addEnhancedBodyDiagram(30 + spacing * 2, diagramY + 10, diagramSize, 'Side View', findings.general)
          
          // Add detailed findings summary below diagrams
          let labelY = diagramY + diagramSize + 25
          this.doc.setFontSize(8)
          this.doc.setFont('helvetica', 'bold')
          this.doc.text('Anatomical Findings Summary:', 30, labelY)
          labelY += 8
          
          this.doc.setFont('helvetica', 'normal')
          this.doc.setFontSize(7)
          
          findings.general.forEach((finding: any, index: number) => {
            const severity = this.determineFindingSeverity(finding.value)
            const severityColor = severity === 'severe' ? [255, 0, 0] : severity === 'moderate' ? [255, 165, 0] : [0, 128, 0]
            
            // Add colored indicator for severity
            this.doc.setFillColor(severityColor[0], severityColor[1], severityColor[2])
            this.doc.circle(28, labelY - 1, 1, 'F')
            
            this.doc.setTextColor(0, 0, 0)
            this.doc.text(`${finding.label}: ${finding.value}`, 30, labelY)
            labelY += 6
          })
          
          this.currentY = labelY + 10
        }
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
  private addPage6_AssessmentAndPlan(note: ProfessionalMedicalNote): void {
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
    this.doc.text(`Doctor: ${note.doctorName}`, 20, this.currentY + 15)
    
    if (this.hasContent(note.doctorRegistrationNo)) {
      this.doc.text(`Registration No: ${note.doctorRegistrationNo!}`, 20, this.currentY + 22)
    }
    
    this.doc.text(`Generated on: ${note.generatedOn}`, 20, this.currentY + 29)
    
    // Signature section in right column
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Doctor Signature:', 110, this.currentY + 12)
    
    // Signature border box
    this.doc.setLineWidth(0.3)
    this.doc.rect(110, this.currentY + 15, 40, 20)
    
    // Add signature image if available
    if (this.hasContent(note.signature)) {
      try {
        this.doc.addImage(note.signature!, 'PNG', 112, this.currentY + 17, 36, 16)
      } catch (error) {
        console.warn('Failed to add signature:', error)
      }
    } else {
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(6)
      this.doc.text('No signature', 125, this.currentY + 25)
    }
    
    // Stamp section
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(8)
    this.doc.text('Official Stamp:', 155, this.currentY + 12)
    
    // Stamp border box
    this.doc.rect(155, this.currentY + 15, 25, 20)
    
    // Add stamp if available
    if (this.hasContent(note.stamp)) {
      try {
        this.doc.addImage(note.stamp!, 'PNG', 157, this.currentY + 17, 21, 16)
      } catch (error) {
        console.warn('Failed to add stamp:', error)
      }
    } else {
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(6)
      this.doc.text('No stamp', 163, this.currentY + 25)
    }
    

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

  generatePDF(note: ProfessionalMedicalNote): jsPDF {
    // Generate all 6 pages in professional template order
    this.addPage1_PatientInfoAndHistory(note)
    this.addPage2_ReviewOfSystems(note)
    this.addPage3_PhysicalExaminationDiagrams(note)
    this.addPage4_CardiovascularRespiratory(note)
    this.addPage5_AbdominalExamination(note)
    this.addPage6_AssessmentAndPlan(note)
    
    return this.doc
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
  private determineFindingSeverity(findingValue: string): 'mild' | 'moderate' | 'severe' {
    const value = findingValue.toLowerCase()
    
    if (value.includes('severe') || value.includes('acute') || value.includes('critical') || value.includes('significant')) {
      return 'severe'
    }
    
    if (value.includes('moderate') || value.includes('notable') || value.includes('marked') || value.includes('prominent')) {
      return 'moderate'
    }
    
    return 'mild'
  }
}

export function generateEnhancedProfessionalMedicalNotePDF(note: ProfessionalMedicalNote): void {
  const generator = new EnhancedTemplatePDFGenerator(note.letterhead)
  const pdf = generator.generatePDF(note)
  
  // Safely handle patient name for filename
  const patientName = typeof note.patientName === 'string' ? note.patientName : 'Unknown_Patient'
  const safePatientName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  const dateStr = new Date().toISOString().split('T')[0]
  
  pdf.save(`Medical_Note_${safePatientName}_${dateStr}.pdf`)
}

export { EnhancedTemplatePDFGenerator }