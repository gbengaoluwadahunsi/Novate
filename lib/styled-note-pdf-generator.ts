import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import type { MedicalNote } from '@/lib/api-client'

export interface StyledPDFOptions {
  useLetterhead?: boolean
  letterheadImage?: string
  selectedICD11Codes?: any
  organizationName?: string
  doctorName?: string
  registrationNo?: string
}

export class StyledNotePDFGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private readonly pageWidth: number
  private readonly pageHeight: number
  private readonly margins = { left: 20, right: 20, top: 20, bottom: 20 }

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
  }

  // Add professional header with blue background (similar to your styled note)
  private addStyledHeader(note: MedicalNote): void {
    // Blue header background
    this.doc.setFillColor(59, 130, 246) // Blue-600
    this.doc.rect(0, 0, this.pageWidth, 40, 'F')
    
    // White text for header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(18)
    this.doc.text('Medical Consultation Note', this.pageWidth / 2, 20, { align: 'center' })
    
    this.doc.setFontSize(12)
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.doc.text(`Generated: ${currentDate}`, this.pageWidth / 2, 30, { align: 'center' })
    
    this.currentY = 50
    
    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)
  }

  // Add section with blue header styling
  private addSection(title: string, content: string, isBlueHeader: boolean = true): void {
    // Allow ICD-11 Code sections even if they have empty content (content is added separately)
    const isICD11Section = title.toUpperCase().includes('ICD-11')
    
    // Skip only truly empty sections (except for ICD-11 sections)
    if (!isICD11Section && (!content || content.trim() === '')) {
      return
    }

    // Only skip sections that are exactly "Not mentioned" or "Not available" without any other content
    if (!isICD11Section) {
      const trimmedContent = content.trim()
      if (trimmedContent === 'Not mentioned' || trimmedContent === 'Not available') {
        return
      }
    }
    
    // If content has multiple lines or contains structured information, include it even if it contains "Not mentioned"
    const hasMultipleLines = content.includes('\n') || content.includes('\r')
    const hasStructuredContent = content.includes(':') || content.includes('•') || content.includes('-') || content.includes('*')
    
    // Skip only if it's a single line that's just "Not mentioned" or "Not available"
    if (!hasMultipleLines && !hasStructuredContent && (trimmedContent === 'Not mentioned' || trimmedContent === 'Not available')) {
      return
    }
    
    this.checkPageBreak(30)
    
    if (isBlueHeader) {
      // Blue section header background
      this.doc.setFillColor(30, 64, 175) // Blue-800
      this.doc.rect(this.margins.left - 5, this.currentY - 3, this.pageWidth - 30, 14, 'F')
      
      // White text for section header
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.text(title.toUpperCase(), this.margins.left, this.currentY + 4)
      
      this.currentY += 18
      
      // Reset text color to black
      this.doc.setTextColor(0, 0, 0)
    } else {
      // Regular header
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(10)
      this.doc.setTextColor(30, 64, 175) // Blue-800
      this.doc.text(title, this.margins.left, this.currentY)
      this.currentY += 8
      this.doc.setTextColor(0, 0, 0)
    }

    // Add a subtle border line
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY)
    this.currentY += 8

    // Content
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    // Special handling for physical examination
    if (title.toLowerCase().includes('physical examination')) {
      const finalContent = this.formatPhysicalExaminationValue(content)
      this.addWrappedText(finalContent)
    } else {
      this.addWrappedText(content)
    }
    
    this.currentY += 15
  }

  // Format physical examination value (same logic as in the component)
  private formatPhysicalExaminationValue(value: string | undefined | null): string {
    // Handle null, undefined, or empty
    if (!value || value === '' || value === 'N/A' || value === 'n/a' || value === 'N/a') {
      return 'No physical examination was performed during this consultation.'
    }
    
    // Handle default/placeholder text
    if (value === 'Physical examination performed as clinically indicated' || 
        value === 'Not mentioned' ||
        value.toLowerCase().includes('clinically indicated')) {
      return 'No physical examination was performed during this consultation.'
    }
    
    // Clean and return actual examination findings
    const cleanedValue = String(value).replace(/\}\}/g, '').trim()
    return cleanedValue || 'No physical examination was performed during this consultation.'
  }

  // Add wrapped text that handles long content
  private addWrappedText(text: string): void {
    const maxWidth = this.pageWidth - this.margins.left - this.margins.right
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    for (const line of lines) {
      this.checkPageBreak(12)
      this.doc.text(line, this.margins.left, this.currentY)
      this.currentY += 6
    }
  }

  // Check if we need a page break
  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margins.bottom) {
      this.doc.addPage()
      this.currentY = this.margins.top
    }
  }

  // Add patient information in a styled table format
  private addPatientInfo(note: MedicalNote): void {
    this.addSection('Patient Information', '')
    
    // Create a simple table-like layout
    const patientData = [
          ['Name:', note.patientName || 'Not mentioned'],
    ['Age:', String(note.patientAge) || 'Not mentioned'],
    ['Gender:', note.patientGender || 'Not mentioned'],
      ['Date:', note.visitDate || new Date().toLocaleDateString()]
    ]

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)

    patientData.forEach(([label, value]) => {
      this.checkPageBreak(15)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(value, this.margins.left + 40, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
  }

  // Generate the complete styled PDF
  public generateStyledPDF(note: MedicalNote, options: StyledPDFOptions = {}): void {
    // Add letterhead if provided
    if (options.useLetterhead && options.letterheadImage) {
      try {
        this.doc.addImage(options.letterheadImage, 'PNG', 0, 0, this.pageWidth, 60)
        this.currentY = 70
      } catch (error) {
        // Failed to add letterhead image
      }
    } else {
      this.addStyledHeader(note)
    }

    // Add doctor information first
    this.addFooter(note, options)

    // Add patient information
    this.addPatientInfo(note)

    // Vital Signs section removed - not available in MedicalNote type

    // Add all sections in order (matching your styled note page)
    if (note.chiefComplaint) {
      this.addSection('Chief Complaint', note.chiefComplaint)
    }

    if (note.historyOfPresentingIllness) {
      this.addSection('History of Present Illness', note.historyOfPresentingIllness)
    }

    if (note.pastMedicalHistory) {
      this.addSection('Past Medical History', note.pastMedicalHistory)
    }

    if (note.allergies) {
      this.addSection('Drug History and Allergies', note.allergies)
    }

    if (note.familyHistory) {
      this.addSection('Family History', note.familyHistory)
    }

    if (note.socialHistory) {
      this.addSection('Social History', note.socialHistory)
    }

    if (note.systemReview) {
      this.addSection('Review of Systems', note.systemReview)
    }

    // Physical examination with special formatting
    this.addSection('Physical Examination', note.physicalExamination || '')

    // Investigations - check multiple possible fields
    const investigationsContent = note.managementPlan?.investigations || 
                                 (typeof note.managementPlan === 'string' ? note.managementPlan : '') ||
                                 note.managementPlan
    if (investigationsContent && investigationsContent.trim() !== '') {
      this.addSection('Investigations', typeof investigationsContent === 'string' ? investigationsContent : JSON.stringify(investigationsContent))
    }

    // Assessment and Diagnosis - check multiple possible fields
    const diagnosisContent = note.assessmentAndDiagnosis || note.diagnosis || ''
    if (diagnosisContent && diagnosisContent.trim() !== '') {
      this.addSection('Impression and Diagnosis', diagnosisContent)
    }

    // Plan - check multiple possible fields including nested managementPlan
    const planContent = note.treatmentPlan || 
                       note.managementPlan?.medicationsPrescribed || 
                       note.managementPlan?.treatmentAdministered ||
                       (typeof note.managementPlan === 'string' ? note.managementPlan : '')
    if (planContent && planContent.trim() !== '') {
      this.addSection('Plan', typeof planContent === 'string' ? planContent : JSON.stringify(planContent))
    }

    // Add ICD-11 code if selected (only the selected/ticked code)
    if (options.selectedICD11Codes && Object.keys(options.selectedICD11Codes).length > 0) {
      this.addSection('ICD-11 Code', '')
      
      let hasSelectedCode = false
      
      // Show only the first (selected/ticked) code from primary array
      if (options.selectedICD11Codes.primary && Array.isArray(options.selectedICD11Codes.primary)) {
        const selectedCode = options.selectedICD11Codes.primary[0] // First code is the selected one
        if (selectedCode) {
          hasSelectedCode = true
          this.doc.setFont('helvetica', 'normal')
          this.addWrappedText(`${selectedCode.code || selectedCode.id || 'Unknown'} - ${selectedCode.title || selectedCode.name || 'Unknown'}`)
          this.currentY += 5
        }
      }
      
      // If no selected code was found, add a note
      if (!hasSelectedCode) {
        this.doc.setFont('helvetica', 'normal')
        this.doc.text('No ICD-11 code selected', this.margins.left, this.currentY)
        this.currentY += 8
      }
    }


    // Save the PDF
    const fileName = `Medical_Note_${note.patientName?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`
    this.doc.save(fileName)
  }

  // Add footer with doctor information and signature
  private addFooter(note: MedicalNote, options: StyledPDFOptions): void {
    // Move to bottom of page for footer
    this.currentY = this.pageHeight - 60

    // Add a line separator
    this.doc.setDrawColor(59, 130, 246)
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY)
    this.currentY += 10

    // Doctor information
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(10)
    this.doc.text('Doctor Information & Authorization', this.margins.left, this.currentY)
    this.currentY += 15

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    const doctorName = options.doctorName || note.doctorName || 'Dr. [Name]'
    const registrationNo = options.registrationNo || note.doctorRegistrationNo || '[Registration Number]'
    
    this.doc.text(`Doctor: ${doctorName}`, this.margins.left, this.currentY)
    this.doc.text(`Registration No: ${registrationNo}`, this.margins.left, this.currentY + 8)
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, this.margins.left, this.currentY + 16)

    // Signature placeholder
    this.doc.text('Doctor Signature: _____________________', this.pageWidth - 120, this.currentY + 8)
  }
}

// Export function to generate styled PDF
export function generateStyledNotePDF(note: MedicalNote, options: StyledPDFOptions = {}): void {
  const generator = new StyledNotePDFGenerator()
  generator.generateStyledPDF(note, options)
}