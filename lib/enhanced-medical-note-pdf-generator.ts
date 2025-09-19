import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import type { MedicalNote } from '@/lib/api-client'

export interface EnhancedPDFOptions {
  useLetterhead?: boolean
  letterheadImage?: string
  selectedICD11Codes?: {
    primary: Array<{code: string, title: string, checked: boolean}>
    secondary: Array<{code: string, title: string, checked: boolean}>
  }
  organizationName?: string
  doctorName?: string
  registrationNo?: string
  signature?: string
  stamp?: string
  userRole?: string
}

export class EnhancedMedicalNotePDFGenerator {
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

  // Add professional header with medical note styling
  private addProfessionalHeader(note: MedicalNote): void {
    // Blue header background
    this.doc.setFillColor(30, 64, 175) // Blue-800
    this.doc.rect(0, 0, this.pageWidth, 35, 'F')
    
    // White text for header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(16)
    this.doc.text('MEDICAL CONSULTATION NOTE', this.pageWidth / 2, 15, { align: 'center' })
    
    this.doc.setFontSize(10)
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.doc.text(`Generated: ${currentDate}`, this.pageWidth / 2, 25, { align: 'center' })
    
    this.currentY = 45
    
    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)
  }

  // Add section with professional medical styling
  private addMedicalSection(title: string, content: string, isSubsection: boolean = false): void {
    // For critical sections, always include them even if they contain "Not mentioned" or are empty
    const criticalSections = [
      'REVIEW OF SYSTEMS',
      'SOCIAL HISTORY', 
      'FAMILY HISTORY',
      'PAST MEDICAL/SURGICAL HISTORY',
      'DRUG HISTORY AND ALLERGIES',
      'PHYSICAL EXAMINATION',
      'INVESTIGATIONS',
      'IMPRESSION AND DIAGNOSIS',
      'PLAN',
      'ICD-11 CODE'
    ]
    
    const isCriticalSection = criticalSections.includes(title.toUpperCase())
    
    // Skip only truly empty sections for non-critical sections
    if (!isCriticalSection && (!content || content.trim() === '')) {
      return
    }
    
    // Only skip non-critical sections that are exactly "Not mentioned" or "Not available"
    if (!isCriticalSection) {
      const trimmedContent = content.trim()
      if (trimmedContent === 'Not mentioned' || trimmedContent === 'Not available') {
        return
      }
    }
    
    // Estimate content height for better page break decisions
    const estimatedContentHeight = this.estimateContentHeight(content)
    this.checkSectionPageBreak(estimatedContentHeight)
    
    if (!isSubsection) {
      // Blue section header background (minimal height)
      this.doc.setFillColor(30, 64, 175) // Blue-800
      this.doc.rect(this.margins.left - 5, this.currentY - 2, this.pageWidth - 30, 10, 'F')
      
      // White text for section header
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(9)
      this.doc.text(title.toUpperCase(), this.margins.left, this.currentY + 3)
      
      this.currentY += 12
      
      // Reset text color to black
      this.doc.setTextColor(0, 0, 0)
    } else {
      // Subsection styling
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
    this.doc.setFontSize(9)
    
    this.addWrappedText(content)
    this.currentY += 12
  }

  // Add wrapped text that handles long content
  private addWrappedText(text: string): void {
    const maxWidth = this.pageWidth - this.margins.left - this.margins.right
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    for (const line of lines) {
      this.checkPageBreak(8)
      this.doc.text(line, this.margins.left, this.currentY)
      this.currentY += 5
    }
  }

  // Check if we need a page break
  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margins.bottom) {
      this.doc.addPage()
      this.currentY = this.margins.top
    }
  }

  // Check if we need a page break for a section (more conservative)
  private checkSectionPageBreak(estimatedContentHeight: number = 50): void {
    const availableSpace = this.pageHeight - this.currentY - this.margins.bottom
    const sectionHeaderHeight = 25 // Height for section header
    const totalRequiredHeight = sectionHeaderHeight + estimatedContentHeight
    
    // If there's not enough space for the entire section, start on a new page
    if (availableSpace < totalRequiredHeight) {
      this.doc.addPage()
      this.currentY = this.margins.top
    }
  }

  // Estimate content height based on text length and wrapping
  private estimateContentHeight(content: string): number {
    if (!content || content.trim() === '') return 0
    
    const words = content.split(' ')
    const wordsPerLine = Math.floor((this.pageWidth - this.margins.left - this.margins.right) / 6) // Approximate chars per word
    const lines = Math.ceil(words.length / wordsPerLine)
    const lineHeight = 5
    const padding = 10
    
    return Math.max(lines * lineHeight + padding, 20) // Minimum 20 units
  }

  // Add patient information in a structured format
  private addPatientInfo(note: MedicalNote): void {
    this.checkPageBreak(40)

    // Blue section header background (reduced height)
    this.doc.setFillColor(30, 64, 175) // Blue-800
    this.doc.rect(this.margins.left - 5, this.currentY - 2, this.pageWidth - 30, 10, 'F')

    // White text for section header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('PATIENT INFORMATION', this.margins.left, this.currentY + 3)

    this.currentY += 12

    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)
    
    // Create structured patient data
    const patientData = [
      ['Name:', note.patientName || 'Not mentioned'],
      ['Age:', String(note.patientAge) || 'Not mentioned'],
      ['Gender:', note.patientGender || 'Not mentioned'],
      ['Visit Date:', note.visitDate || new Date().toLocaleDateString()]
    ]

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)

    patientData.forEach(([label, value]) => {
      this.checkPageBreak(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(value, this.margins.left + 30, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
  }

  // Add vital signs section
  private addVitalSigns(note: MedicalNote): void {
    const vitalSigns = [
      { label: 'Temperature:', value: note.temperature || 'Not mentioned' },
      { label: 'Blood Pressure:', value: note.bloodPressure || 'Not mentioned' },
      { label: 'Pulse Rate:', value: note.pulseRate || 'Not mentioned' },
      { label: 'Respiratory Rate:', value: note.respiratoryRate || 'Not mentioned' },
      { label: 'Glucose Levels:', value: note.glucoseLevels || note.glucose || 'Not mentioned' }
    ]

    this.checkPageBreak(40)

    // Blue section header background (reduced height)
    this.doc.setFillColor(30, 64, 175) // Blue-800
    this.doc.rect(this.margins.left - 5, this.currentY - 2, this.pageWidth - 30, 10, 'F')

    // White text for section header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('VITAL SIGNS', this.margins.left, this.currentY + 3)

    this.currentY += 12

    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)

    vitalSigns.forEach(({ label, value }) => {
      this.checkPageBreak(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margins.left, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      // Use consistent alignment - find the longest label width and align all values
      const labelWidth = Math.max(...vitalSigns.map(vs => this.doc.getTextWidth(vs.label + ':'))) + 5
      this.doc.text(value, this.margins.left + labelWidth, this.currentY)
      this.currentY += 7
    })

    this.currentY += 10
  }

  // Combine drug history and allergies content from multiple sources
  private combineDrugHistoryContent(note: MedicalNote): string {
    let content = ''
    
    // Check for current medications from various sources
    const medications = note.managementPlan?.medicationsPrescribed || 
                       (note as any).currentMedications || 
                       (note as any).medications
    
    if (medications) {
      content += 'Current Medications:\n'
      if (typeof medications === 'string') {
        content += medications + '\n\n'
      } else {
        content += JSON.stringify(medications, null, 2) + '\n\n'
      }
    }
    
    // Add allergies information
    if (note.allergies) {
      content += 'Allergies:\n'
      content += note.allergies
    }
    
    // If we have the original allergies field and it contains structured content, use it
    if (!content && note.allergies) {
      content = note.allergies
    }
    
    return content.trim()
  }

  // Add enhanced structured findings display with real medical body images (multiple diagrams like single note page)
  private async addEnhancedStructuredFindings(note: MedicalNote, analysis: any): Promise<void> {
    if (!analysis.findings || analysis.findings.length === 0) return

    this.currentY += 10
    
    // Add "Physical Examination Visualization" header
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(10)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Physical Examination Visualization', this.margins.left, this.currentY)
    this.currentY += 12
    
    // Use the same recommended diagrams logic as SimpleMedicalDiagram
    const recommendedDiagrams = analysis.recommendedDiagrams || []
    
    // If no recommended diagrams, use default
    if (recommendedDiagrams.length === 0) {
      const patientGender = this.determinePatientGender(note)
      recommendedDiagrams.push(patientGender === 'male' ? 'malefront' : 'femalefront')
    }
    
    // Process each recommended diagram (same as single note page)
    for (let diagramIndex = 0; diagramIndex < recommendedDiagrams.length; diagramIndex++) {
      const diagramType = recommendedDiagrams[diagramIndex]
      
      // Check if we need a new page for this diagram
      this.checkPageBreak(150)
      
      // Add some spacing between diagrams (except for the first one)
      if (diagramIndex > 0) {
        this.currentY += 15
      }
      
      // Create a layout similar to single note page: diagram on left, findings on right
      const diagramWidth = 90
      const diagramHeight = 135
      const diagramX = this.margins.left
      const diagramY = this.currentY
      
      try {
        // Try to load and embed the actual medical body image
        const imageBase64 = await this.loadMedicalImage(diagramType)
        
        if (imageBase64) {
          // Add the actual medical image
          this.doc.addImage(imageBase64, 'PNG', diagramX, diagramY, diagramWidth, diagramHeight)
          
          // Add privacy censoring bars over sensitive areas (breast and genital regions)
          this.addPrivacyCensoring(diagramType, diagramX, diagramY, diagramWidth, diagramHeight)
          
        } else {
          // Fallback: Draw a bordered rectangle as placeholder
          this.doc.setDrawColor(100, 100, 100)
          this.doc.setFillColor(245, 245, 245)
          this.doc.rect(diagramX, diagramY, diagramWidth, diagramHeight, 'FD')
          
          // Add image label
          this.doc.setFont('helvetica', 'normal')
          this.doc.setFontSize(8)
          this.doc.setTextColor(100, 100, 100)
          this.doc.text(`Medical Diagram: ${diagramType}`, diagramX + 5, diagramY + 10)
          this.doc.text('(Image loading failed)', diagramX + 5, diagramY + 18)
        }
        
      } catch (error) {
        // Fallback to simple diagram if image loading fails
        this.doc.setDrawColor(100, 100, 100)
        this.doc.setFillColor(245, 245, 245)
        this.doc.rect(diagramX, diagramY, diagramWidth, diagramHeight, 'FD')
        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(8)
        this.doc.setTextColor(100, 100, 100)
        this.doc.text('Medical Body Diagram', diagramX + 15, diagramY + diagramHeight/2)
      }
    
      // Add "Relevant Findings" section on the right side (same as single note page)
      const findingsX = diagramX + diagramWidth + 15
      const findingsWidth = this.pageWidth - findingsX - this.margins.right
    
    let findingsY = diagramY + 10
    this.doc.setTextColor(0, 0, 0)

    // Display findings with color-coded status (no numbered markers due to privacy censoring)
    analysis.findings.forEach((finding: any, index: number) => {
      // Determine colors based on clinical significance
      let borderColor = [100, 100, 100] // Default gray
      let bgColor = [245, 245, 245] // Light gray
      let statusBadgeColor = [100, 100, 100]
      let statusText = 'Equivocal'
      
      if (finding.clinicalSignificance === 'normal') {
        borderColor = [34, 197, 94] // Green
        bgColor = [240, 253, 244] // Light green
        statusBadgeColor = [34, 197, 94]
        statusText = 'Normal'
      } else if (finding.clinicalSignificance === 'abnormal') {
        borderColor = [239, 68, 68] // Red
        bgColor = [254, 242, 242] // Light red
        statusBadgeColor = [239, 68, 68]
        statusText = 'Abnormal'
      }
      
      // Draw finding card with colored border (same style as single note page)
      this.doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
      this.doc.setFillColor(bgColor[0], bgColor[1], bgColor[2])
      this.doc.rect(findingsX, findingsY - 2, findingsWidth, 20, 'FD')
      
      // Add finding text
      this.doc.setTextColor(0, 0, 0)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(7)
      this.doc.text(finding.text, findingsX + 8, findingsY + 2)
      
      // Add status badge
      this.doc.setFillColor(statusBadgeColor[0], statusBadgeColor[1], statusBadgeColor[2])
      this.doc.rect(findingsX + 8, findingsY + 5, 20, 6, 'F')
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(5)
      this.doc.text(statusText, findingsX + 10, findingsY + 9)
      
      
      findingsY += 24
    })
    
      // Update currentY to the bottom of this diagram section
      this.currentY = Math.max(diagramY + diagramHeight + 10, findingsY + 10)
    }
    
    this.doc.setTextColor(0, 0, 0)
  }

  // Helper method to determine patient gender from note
  private determinePatientGender(note: MedicalNote): 'male' | 'female' {
    const gender = (note.patientGender || '').toLowerCase()
    return gender.includes('female') || gender.includes('f') ? 'female' : 'male'
  }

  // Helper method to select best diagram type based on findings
  private selectBestDiagramType(findings: any[], patientGender: 'male' | 'female'): string {
    // Analyze findings to determine best view
    const hasAbdominalFindings = findings.some(f => 
      (f.bodyRegion || '').toLowerCase().includes('abdomen') ||
      (f.text || '').toLowerCase().includes('abdomen')
    )
    
    const hasCardioRespFindings = findings.some(f => 
      (f.bodyRegion || '').toLowerCase().includes('chest') ||
      (f.text || '').toLowerCase().includes('heart') ||
      (f.text || '').toLowerCase().includes('lung')
    )
    
    // Select appropriate diagram
    if (hasAbdominalFindings) {
      return `${patientGender}abdominallinguinal`
    } else if (hasCardioRespFindings) {
      return `${patientGender}cardiorespi`
    } else {
      return `${patientGender}front` // Default to front view
    }
  }

  // Helper method to get coordinate mappings for a diagram type
  private getCoordinateMappings(diagramType: string): Record<string, {x: number, y: number}> {
    // Simplified coordinate mappings based on the actual image coordinates
    // These would ideally be imported from the coordinate mapping files
    const baseMappings: Record<string, {x: number, y: number}> = {
      'head': { x: 256, y: 42 },
      'chest': { x: 256, y: 204 },
      'abdomen': { x: 258, y: 309 },
      'left_arm': { x: 354, y: 255 },
      'right_arm': { x: 162, y: 253 },
      'left_leg': { x: 297, y: 466 },
      'right_leg': { x: 213, y: 470 },
      'heart': { x: 299, y: 222 },
      'lungs': { x: 215, y: 204 },
      'stomach': { x: 279, y: 259 }
    }
    
    return baseMappings
  }

  // Helper method to map finding to body part
  private mapFindingToBodyPart(finding: any, diagramType: string): string {
    const text = (finding.text || '').toLowerCase()
    const region = (finding.bodyRegion || '').toLowerCase()
    
    if (text.includes('abdomen') || region.includes('abdomen')) return 'abdomen'
    if (text.includes('chest') || region.includes('chest')) return 'chest'
    if (text.includes('heart') || region.includes('heart')) return 'heart'
    if (text.includes('lung') || region.includes('lung')) return 'lungs'
    if (text.includes('head') || region.includes('head')) return 'head'
    if (text.includes('arm') || region.includes('arm')) return 'left_arm'
    if (text.includes('leg') || region.includes('leg')) return 'left_leg'
    
    return 'chest' // Default
  }

  // Helper method to load medical image and convert to base64
  private async loadMedicalImage(diagramType: string): Promise<string | null> {
    try {
      // In a browser environment, we can fetch the image
      if (typeof window !== 'undefined') {
        const response = await fetch(`/medical-images/${diagramType}.png`)
        if (!response.ok) {
          // Could not fetch medical image
          return null
        }
        
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result as string
            // Remove the data URL prefix to get just the base64 data
            const base64Data = base64.split(',')[1]
            resolve(base64Data)
          }
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(blob)
        })
      } else {
        // In Node.js environment (server-side), we'd need to use fs
        // For now, return null to use fallback
        // Server-side image loading not implemented
        return null
      }
    } catch (error) {
      // Error loading medical image
      return null
    }
  }

  // Add ICD-11 codes section (only the selected/ticked code)
  private addICD11Codes(options: EnhancedPDFOptions): void {
    if (!options.selectedICD11Codes) return

    this.addMedicalSection('ICD-11 CODE', '')
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)

    try {
      let hasSelectedCode = false

      // Show only the first (selected/ticked) code from primary array
      if (options.selectedICD11Codes.primary && Array.isArray(options.selectedICD11Codes.primary)) {
        const selectedCode = options.selectedICD11Codes.primary[0] // First code is the selected one
        if (selectedCode) {
          hasSelectedCode = true
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

    } catch (error) {
      // Fallback if there's an error with ICD-11 codes
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('ICD-11 code could not be displayed', this.margins.left, this.currentY)
      this.currentY += 8
    }

    this.currentY += 10
  }

  // Add initial doctor information section (like in the note page)
  private addInitialDoctorInfo(note: MedicalNote, options: EnhancedPDFOptions): void {
    this.checkPageBreak(40)

    // Add a line separator
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY)
    this.currentY += 8

    // Blue section header background (reduced height)
    this.doc.setFillColor(30, 64, 175) // Blue-800
    this.doc.rect(this.margins.left - 5, this.currentY - 2, this.pageWidth - 30, 10, 'F')

    // White text for section header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('DOCTOR INFORMATION', this.margins.left, this.currentY + 3)

    this.currentY += 12

    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)

    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)

    const baseDoctorName = options.doctorName || note.doctorName || '[Name]'
    // Add "Dr." prefix only for doctors, not for students
    const doctorName = options.userRole === 'DOCTOR' ? `Dr. ${baseDoctorName}` : baseDoctorName
    const registrationNo = options.registrationNo || note.doctorRegistrationNo || '[Registration Number]'

    this.doc.text(`Name: ${doctorName}`, this.margins.left, this.currentY)
    this.doc.text(`Role: DOCTOR`, this.margins.left + 60, this.currentY)
    this.currentY += 8

    this.doc.text(`Registration No: ${registrationNo}`, this.margins.left, this.currentY)
    this.currentY += 15
  }

  // Add doctor information and authorization with signature/stamp (at the end)
  private addDoctorInfo(note: MedicalNote, options: EnhancedPDFOptions): void {
    this.checkPageBreak(80)
    
    // Add a line separator
    this.doc.setDrawColor(30, 64, 175)
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY)
    this.currentY += 15

    // Doctor information section
    this.checkSectionPageBreak(60) // Reserve space for doctor info section
    
    // Blue section header background (reduced height)
    this.doc.setFillColor(30, 64, 175) // Blue-800
    this.doc.rect(this.margins.left - 5, this.currentY - 2, this.pageWidth - 30, 10, 'F')
    
    // White text for section header
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('DOCTOR INFORMATION & AUTHORIZATION', this.margins.left, this.currentY + 3)
    
    this.currentY += 12
    
    // Reset text color to black for content
    this.doc.setTextColor(0, 0, 0)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    
    const baseDoctorName = options.doctorName || note.doctorName || '[Name]'
    // Add "Dr." prefix only for doctors, not for students
    const doctorName = options.userRole === 'DOCTOR' ? `Dr. ${baseDoctorName}` : baseDoctorName
    const registrationNo = options.registrationNo || note.doctorRegistrationNo || '[Registration Number]'
    
    this.doc.text(`Doctor: ${doctorName}`, this.margins.left, this.currentY)
    this.doc.text(`Registration No: ${registrationNo}`, this.margins.left, this.currentY + 8)

    // Signature and stamp section
    this.currentY += 20
    
    // Signature area
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(9)
    this.doc.text('Doctor Signature:', this.margins.left, this.currentY)
    
    const signatureImg = options.signature || note.doctorSignature
    // Signature data validation (logs removed for security)
    
    if (signatureImg) {
      try {
        // Ensure the image data is in the correct format
        let imageData = signatureImg
        
        // If it's a data URL, extract the base64 part
        if (imageData.startsWith('data:')) {
          imageData = imageData.split(',')[1]
        }
        
        // Add signature image
        this.doc.addImage(imageData, 'PNG', this.margins.left, this.currentY + 5, 60, 20)
        this.currentY += 30
        // Signature added successfully
      } catch (error) {
        // Signature error occurred
        // Fallback to text signature
        this.doc.setFont('helvetica', 'normal')
        this.doc.text('_____________________', this.margins.left, this.currentY + 5)
        this.currentY += 15
      }
    } else {
      // No signature available
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('_____________________', this.margins.left, this.currentY + 5)
      this.currentY += 15
    }

    // Stamp area
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Official Stamp:', this.margins.left, this.currentY)
    
    const stampImg = options.stamp || note.doctorStamp
    // Stamp data validation (logs removed for security)
    
    if (stampImg) {
      try {
        // Ensure the image data is in the correct format
        let imageData = stampImg
        
        // If it's a data URL, extract the base64 part
        if (imageData.startsWith('data:')) {
          imageData = imageData.split(',')[1]
        }
        
        // Add stamp image
        this.doc.addImage(imageData, 'PNG', this.margins.left, this.currentY + 5, 60, 20)
        this.currentY += 30
        // Stamp added successfully
      } catch (error) {
        // Stamp error occurred
        // Fallback to text stamp
        this.doc.setFont('helvetica', 'normal')
        this.doc.text('_____________________', this.margins.left, this.currentY + 5)
        this.currentY += 15
      }
    } else {
      // No stamp available
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('_____________________', this.margins.left, this.currentY + 5)
      this.currentY += 15
    }

    // Add generated date AFTER signature and stamp
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, this.margins.left, this.currentY)
  }

  // Generate the complete enhanced PDF
  public async generateEnhancedPDF(note: MedicalNote, options: EnhancedPDFOptions = {}): Promise<void> {
    try {
      // Note structure validation (logs removed for security)
      // Add letterhead if provided
      if (options.useLetterhead && options.letterheadImage) {
        try {
          this.doc.addImage(options.letterheadImage, 'PNG', 0, 0, this.pageWidth, 60)
          this.currentY = 70
        } catch (error) {
          // Failed to add letterhead image, use default header
          this.addProfessionalHeader(note)
        }
      } else {
        this.addProfessionalHeader(note)
      }

      // Add initial doctor information section (like in the note page)
      this.addInitialDoctorInfo(note, options)

      // Add patient information
      this.addPatientInfo(note)

      // Add vital signs
      this.addVitalSigns(note)

      // Add all medical sections in proper order
      if (note.chiefComplaint) {
        this.addMedicalSection('CHIEF COMPLAINT', note.chiefComplaint)
      }

      if (note.historyOfPresentingIllness || note.historyOfPresentIllness) {
        this.addMedicalSection('HISTORY OF PRESENT ILLNESS', note.historyOfPresentingIllness || note.historyOfPresentIllness || '')
      }

      if (note.pastMedicalHistory) {
        // Always include PAST MEDICAL/SURGICAL HISTORY even if it contains "Not mentioned"
        // This section often contains structured content with bullet points
        this.addMedicalSection('PAST MEDICAL/SURGICAL HISTORY', note.pastMedicalHistory)
      }

      // Drug History and Allergies - combine multiple sources
      const drugHistoryContent = this.combineDrugHistoryContent(note)
      if (drugHistoryContent) {
        this.addMedicalSection('DRUG HISTORY AND ALLERGIES', drugHistoryContent)
      }

      if (note.familyHistory) {
        this.addMedicalSection('FAMILY HISTORY', note.familyHistory)
      }

      if (note.socialHistory) {
        this.addMedicalSection('SOCIAL HISTORY', note.socialHistory)
      }

      // Review of Systems - check multiple possible field names
      const reviewOfSystemsContent = note.systemReview || (note as any).reviewOfSystems || (note as any).systemsReview
      if (reviewOfSystemsContent) {
        // REVIEW OF SYSTEMS should always be included if it exists, even if it contains "Not mentioned"
        this.addMedicalSection('REVIEW OF SYSTEMS', reviewOfSystemsContent)
      }

      if (note.physicalExamination) {
        this.addMedicalSection('PHYSICAL EXAMINATION', note.physicalExamination)
        
      // Add structured findings if available
      try {
        const { IntelligentMedicalAnalyzer } = await import('@/lib/intelligent-medical-analyzer')
        const analyzer = IntelligentMedicalAnalyzer.getInstance()
        const context = {
          patientGender: note.patientGender === 'female' ? 'female' : 'male',
          examinationType: 'comprehensive' as const,
          bodySystems: ['cardiovascular', 'respiratory', 'gastrointestinal', 'neurological', 'musculoskeletal']
        }

        const analysis = analyzer.analyzeMedicalText(note.physicalExamination, context)

        // Only use the enhanced structured findings display (removed old basic text format)

        // Add enhanced structured findings display (instead of medical diagrams)
        await this.addEnhancedStructuredFindings(note, analysis)
      } catch (error) {
        // If structured analysis fails, just continue with regular content
        // Failed to analyze physical examination for structured findings
      }
      }

      // Investigations - check multiple possible fields and always include if any content exists
      const investigationsContent = note.managementPlan?.investigations || 
                                   (note as any).investigations ||
                                   (typeof note.managementPlan === 'string' ? note.managementPlan : '') ||
                                   note.managementPlan
      if (investigationsContent) {
        // Found investigations content
        this.addMedicalSection('INVESTIGATIONS', typeof investigationsContent === 'string' ? investigationsContent : JSON.stringify(investigationsContent))
      } else {
        // No investigations content found
      }

      // Assessment and Diagnosis - check multiple possible fields and always include if any content exists
      const diagnosisContent = note.assessmentAndDiagnosis || note.diagnosis || (note as any).impression || (note as any).assessment
      if (diagnosisContent) {
        // Found diagnosis content
        this.addMedicalSection('IMPRESSION AND DIAGNOSIS', diagnosisContent)
      } else {
        // No diagnosis content found
      }

      // Plan - check multiple possible fields including nested managementPlan and always include if any content exists
      const planContent = note.treatmentPlan || 
                         note.managementPlan?.medicationsPrescribed || 
                         note.managementPlan?.treatmentAdministered ||
                         (note as any).plan ||
                         (note as any).treatmentPlan ||
                         (typeof note.managementPlan === 'string' ? note.managementPlan : '')
      if (planContent) {
        // Found plan content
        this.addMedicalSection('PLAN', typeof planContent === 'string' ? planContent : JSON.stringify(planContent))
      } else {
        // No plan content found
      }

      // Add ICD-11 codes (only checked ones)
      this.addICD11Codes(options)

      // Add final doctor information and authorization
      this.addDoctorInfo(note, options)

      // Save the PDF
      const fileName = `Medical_Note_${note.patientName?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`
      this.doc.save(fileName)
      
    } catch (error) {
      // PDF Generation Error occurred
      // Fallback: create a simple PDF with basic information
      this.createFallbackPDF(note)
    }
  }

  // Fallback PDF generation if main generation fails
  private createFallbackPDF(note: MedicalNote): void {
    try {
      // Create a new PDF document
      this.doc = new jsPDF()
      this.currentY = 20
      
      // Add basic header
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(16)
      this.doc.text('MEDICAL CONSULTATION NOTE', 20, 20)
      
      this.currentY = 40
      
      // Add basic patient information
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(10)
      this.doc.text(`Patient: ${note.patientName || 'Not mentioned'}`, 20, this.currentY)
      this.currentY += 10
      this.doc.text(`Age: ${note.patientAge || 'Not mentioned'}`, 20, this.currentY)
      this.currentY += 10
      this.doc.text(`Gender: ${note.patientGender || 'Not mentioned'}`, 20, this.currentY)
      this.currentY += 20
      
      // Add chief complaint
      if (note.chiefComplaint) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('CHIEF COMPLAINT:', 20, this.currentY)
        this.currentY += 10
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.chiefComplaint, 20, this.currentY)
        this.currentY += 20
      }
      
      // Add history
      if (note.historyOfPresentingIllness || note.historyOfPresentIllness) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('HISTORY:', 20, this.currentY)
        this.currentY += 10
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.historyOfPresentingIllness || note.historyOfPresentIllness || '', 20, this.currentY)
        this.currentY += 20
      }
      
      // Add physical examination
      if (note.physicalExamination) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('PHYSICAL EXAMINATION:', 20, this.currentY)
        this.currentY += 10
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.physicalExamination, 20, this.currentY)
        this.currentY += 20
      }
      
      // Add diagnosis
      if (note.assessmentAndDiagnosis || note.diagnosis) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('DIAGNOSIS:', 20, this.currentY)
        this.currentY += 10
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.assessmentAndDiagnosis || note.diagnosis || '', 20, this.currentY)
        this.currentY += 20
      }
      
      // Add plan
      if (note.treatmentPlan) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('PLAN:', 20, this.currentY)
        this.currentY += 10
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(note.treatmentPlan, 20, this.currentY)
      }
      
      // Save the fallback PDF
      const fileName = `Medical_Note_Fallback_${note.patientName?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`
      this.doc.save(fileName)
      
    } catch (fallbackError) {
      // Fallback PDF Generation also failed
      throw new Error('PDF generation failed completely')
    }
  }

  // Helper method to get coordinate mappings for a specific diagram type (same as SimpleMedicalDiagram)
  private getCoordinateMappings(diagramType: string): Record<string, {x: number, y: number, width: number, height: number}> {
    const COORDINATE_MAPPINGS: Record<string, Record<string, {x: number, y: number, width: number, height: number}>> = {
      malefront: {
        "head": { "x": 256, "y": 42, "width": 30, "height": 30 },
        "face": { "x": 254, "y": 75, "width": 30, "height": 30 },
        "nose": { "x": 256, "y": 104, "width": 25, "height": 25 },
        "left_eye": { "x": 274, "y": 82, "width": 25, "height": 25 },
        "right_eye": { "x": 236, "y": 79, "width": 25, "height": 25 },
        "mouth": { "x": 258, "y": 118, "width": 25, "height": 25 },
        "left_ear": { "x": 299, "y": 92, "width": 25, "height": 25 },
        "right_ear": { "x": 213, "y": 98, "width": 25, "height": 25 },
        "neck": { "x": 254, "y": 154, "width": 30, "height": 30 },
        "chest": { "x": 256, "y": 204, "width": 40, "height": 40 },
        "abdomen": { "x": 258, "y": 309, "width": 40, "height": 40 },
        "left_shoulder": { "x": 327, "y": 164, "width": 30, "height": 30 },
        "right_shoulder": { "x": 187, "y": 166, "width": 30, "height": 30 },
        "left_arm": { "x": 354, "y": 255, "width": 30, "height": 30 },
        "right_arm": { "x": 162, "y": 253, "width": 30, "height": 30 },
        "left_elbow": { "x": 352, "y": 310, "width": 25, "height": 25 },
        "right_elbow": { "x": 160, "y": 310, "width": 25, "height": 25 },
        "left_forearm": { "x": 368, "y": 339, "width": 30, "height": 30 },
        "right_forearm": { "x": 144, "y": 341, "width": 30, "height": 30 },
        "left_wrist": { "x": 382, "y": 383, "width": 25, "height": 25 },
        "right_wrist": { "x": 136, "y": 385, "width": 25, "height": 25 },
        "left_hand": { "x": 396, "y": 408, "width": 25, "height": 25 },
        "right_hand": { "x": 118, "y": 410, "width": 25, "height": 25 },
        "left_thigh": { "x": 287, "y": 440, "width": 30, "height": 30 },
        "right_thigh": { "x": 225, "y": 442, "width": 30, "height": 30 },
        "left_knee": { "x": 285, "y": 530, "width": 30, "height": 30 },
        "right_knee": { "x": 227, "y": 532, "width": 30, "height": 30 },
        "left_calf": { "x": 287, "y": 616, "width": 30, "height": 30 },
        "right_calf": { "x": 225, "y": 618, "width": 30, "height": 30 },
        "left_ankle": { "x": 285, "y": 689, "width": 25, "height": 25 },
        "right_ankle": { "x": 227, "y": 691, "width": 25, "height": 25 },
        "left_foot": { "x": 295, "y": 722, "width": 25, "height": 25 },
        "right_foot": { "x": 217, "y": 724, "width": 25, "height": 25 }
      },
      femaleabdominallinguinal: {
        "abdomen": { "x": 256, "y": 309, "width": 40, "height": 40 },
        "left_inguinal": { "x": 287, "y": 380, "width": 30, "height": 30 },
        "right_inguinal": { "x": 225, "y": 380, "width": 30, "height": 30 },
        "umbilicus": { "x": 256, "y": 320, "width": 20, "height": 20 },
        "left_flank": { "x": 320, "y": 309, "width": 30, "height": 30 },
        "right_flank": { "x": 192, "y": 309, "width": 30, "height": 30 }
      },
      maleabdominallinguinal: {
        "abdomen": { "x": 256, "y": 309, "width": 40, "height": 40 },
        "left_inguinal": { "x": 287, "y": 380, "width": 30, "height": 30 },
        "right_inguinal": { "x": 225, "y": 380, "width": 30, "height": 30 },
        "umbilicus": { "x": 256, "y": 320, "width": 20, "height": 20 },
        "left_flank": { "x": 320, "y": 309, "width": 30, "height": 30 },
        "right_flank": { "x": 192, "y": 309, "width": 30, "height": 30 }
      }
    }
    
    return COORDINATE_MAPPINGS[diagramType] || {}
  }

  // Helper method to get relevant body parts from medical text (same logic as SimpleMedicalDiagram)
  private getRelevantBodyParts(text: string, diagramType: string): string[] {
    if (!text) return []
    
    const lowerText = text.toLowerCase()
    const relevantParts: string[] = []
    
    // Get available coordinates for this diagram type
    const coordinates = this.getCoordinateMappings(diagramType)
    const availableParts = Object.keys(coordinates)
    
    // Map medical terms to body parts (same as SimpleMedicalDiagram)
    const bodyPartMappings: Record<string, string[]> = {
      'head': ['head'],
      'face': ['face'],
      'eye': ['left_eye', 'right_eye'],
      'eyes': ['left_eye', 'right_eye'],
      'nose': ['nose'],
      'mouth': ['mouth'],
      'ear': ['left_ear', 'right_ear'],
      'neck': ['neck'],
      'chest': ['chest'],
      'abdomen': ['abdomen'],
      'shoulder': ['left_shoulder', 'right_shoulder'],
      'arm': ['left_arm', 'right_arm'],
      'elbow': ['left_elbow', 'right_elbow'],
      'hand': ['left_hand', 'right_hand'],
      'wrist': ['left_wrist', 'right_wrist'],
      'leg': ['left_thigh', 'right_thigh', 'left_calf', 'right_calf'],
      'thigh': ['left_thigh', 'right_thigh'],
      'knee': ['left_knee', 'right_knee'],
      'ankle': ['left_ankle', 'right_ankle'],
      'foot': ['left_foot', 'right_foot'],
      'inguinal': ['left_inguinal', 'right_inguinal'],
      'flank': ['left_flank', 'right_flank']
    }
    
    // Check for mentions of body parts in the text
    for (const [term, parts] of Object.entries(bodyPartMappings)) {
      if (lowerText.includes(term)) {
        for (const part of parts) {
          if (availableParts.includes(part) && !relevantParts.includes(part)) {
            relevantParts.push(part)
          }
        }
      }
    }
    
    // If no specific parts found, add some default parts based on diagram type
    if (relevantParts.length === 0) {
      if (diagramType.includes('abdominallinguinal')) {
        relevantParts.push('abdomen')
      } else {
        relevantParts.push('chest', 'abdomen')
      }
    }
    
    return relevantParts.filter(part => availableParts.includes(part))
  }

  // Helper method to add privacy censoring bars over sensitive areas
  private addPrivacyCensoring(diagramType: string, diagramX: number, diagramY: number, diagramWidth: number, diagramHeight: number): void {
    // Define sensitive areas that need censoring based on diagram type
    const sensitiveAreas = this.getSensitiveAreas(diagramType)
    
    // Add blue censoring bars over sensitive areas
    this.doc.setFillColor(59, 130, 246) // Blue-500 for privacy bars
    this.doc.setDrawColor(59, 130, 246)
    
    sensitiveAreas.forEach(area => {
      // Scale coordinates from original image size (512x768) to PDF diagram size
      const censorX = diagramX + (area.x / 512) * diagramWidth
      const censorY = diagramY + (area.y / 768) * diagramHeight
      const censorWidth = (area.width / 512) * diagramWidth
      const censorHeight = (area.height / 768) * diagramHeight
      
      // Draw privacy censoring bar
      this.doc.rect(censorX, censorY, censorWidth, censorHeight, 'F')
    })
  }

  // Helper method to get sensitive areas coordinates for different diagram types
  private getSensitiveAreas(diagramType: string): Array<{x: number, y: number, width: number, height: number}> {
    const sensitiveAreas: Array<{x: number, y: number, width: number, height: number}> = []
    
    // Define sensitive areas based on diagram type
    if (diagramType.includes('front')) {
      // Chest/breast area for front view
      sensitiveAreas.push({
        x: 200, y: 180, width: 112, height: 60 // Chest area
      })
      
      // Genital area for front view - better coverage for male penis area
      if (diagramType.includes('male')) {
        sensitiveAreas.push({
          x: 220, y: 370, width: 72, height: 60 // Better male genital coverage
        })
      } else {
        sensitiveAreas.push({
          x: 230, y: 380, width: 52, height: 40 // Female genital area
        })
      }
    }
    
    if (diagramType.includes('back')) {
      // No specific censoring needed for back view in most cases
      // Can add if needed for specific medical contexts
    }
    
    if (diagramType.includes('cardiorespi')) {
      // Chest/breast area for cardio-respiratory view
      sensitiveAreas.push({
        x: 200, y: 180, width: 112, height: 60 // Chest area
      })
    }
    
    if (diagramType.includes('abdominallinguinal')) {
      // Genital area for abdominal/inguinal view - better coverage for male penis area
      if (diagramType.includes('male')) {
        sensitiveAreas.push({
          x: 220, y: 370, width: 72, height: 60 // Better male genital coverage
        })
      } else {
        sensitiveAreas.push({
          x: 230, y: 380, width: 52, height: 40 // Female genital area
        })
      }
    }
    
    // Add female-specific areas
    if (diagramType.includes('female')) {
      // Additional breast area coverage for female diagrams
      sensitiveAreas.push({
        x: 190, y: 170, width: 132, height: 70 // Extended chest area for female
      })
    }
    
    return sensitiveAreas
  }
}

// Export function to generate enhanced PDF
export async function generateEnhancedMedicalNotePDF(note: MedicalNote, options: EnhancedPDFOptions = {}): Promise<void> {
  const generator = new EnhancedMedicalNotePDFGenerator()
  await generator.generateEnhancedPDF(note, options)
}
