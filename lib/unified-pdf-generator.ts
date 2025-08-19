import jsPDF from 'jspdf'
import { MedicalNoteComprehensive } from '@/types/medical-note-comprehensive'

// PDF Context interface for managing state
interface PDFContext {
  doc: jsPDF
  currentY: number
  pageHeight: number
  margin: number
  maxContentWidth: number
  letterheadHeight: number
  hasLetterhead: boolean
}

// Utility function to convert PDF/Word to image for letterhead
async function convertDocumentToImage(base64Data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // For now, we'll use a placeholder approach
      // In a production environment, you'd want to use a proper PDF/Word to image conversion library
      // like pdf2pic, docx-preview, or a server-side conversion service
      
      if (base64Data.startsWith('data:application/pdf')) {
        // Create a placeholder image for PDF
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = 800
          canvas.height = 200
          
          // Create a professional letterhead placeholder
          ctx.fillStyle = '#f8f9fa'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.fillStyle = '#1e40af'
          ctx.fillRect(0, 0, canvas.width, 60)
          
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 24px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('ORGANIZATION LETTERHEAD', canvas.width / 2, 35)
          
          ctx.fillStyle = '#6b7280'
          ctx.font = '14px Arial'
          ctx.fillText('PDF Document - First Page', canvas.width / 2, 120)
          
          resolve(canvas.toDataURL('image/png'))
        } else {
          reject(new Error('Could not create canvas context'))
        }
      } else if (base64Data.startsWith('data:application/')) {
        // Create a placeholder image for Word documents
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = 800
          canvas.height = 200
          
          // Create a professional letterhead placeholder
          ctx.fillStyle = '#f8f9fa'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          ctx.fillStyle = '#059669'
          ctx.fillRect(0, 0, canvas.width, 60)
          
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 24px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('ORGANIZATION LETTERHEAD', canvas.width / 2, 35)
          
          ctx.fillStyle = '#6b7280'
          ctx.font = '14px Arial'
          ctx.fillText('Word Document - First Page', canvas.width / 2, 120)
          
          resolve(canvas.toDataURL('image/png'))
        } else {
          reject(new Error('Could not create canvas context'))
        }
      } else {
        // For image files, return as is
        resolve(base64Data)
      }
    } catch (error) {
      reject(error)
    }
  })
}

// Initialize PDF context
function initializePDFContext(): PDFContext {
  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxContentWidth = doc.internal.pageSize.getWidth() - (margin * 2)
  
  return {
    doc,
    currentY: margin,
    pageHeight,
    margin,
    maxContentWidth,
    letterheadHeight: 0,
    hasLetterhead: false
  }
}

// Calculate letterhead height from image
async function calculateLetterheadHeight(letterheadImage: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Calculate height based on image dimensions and PDF width
      const pdfWidth = 210 // A4 width in mm
      const aspectRatio = img.width / img.height
      const letterheadHeight = pdfWidth / aspectRatio
      resolve(Math.min(letterheadHeight, 80)) // Cap at 80mm max height
    }
    img.onerror = () => resolve(40) // Default height if image fails to load
    img.src = letterheadImage
  })
}

// Add letterhead to PDF (first page only)
async function addLetterhead(ctx: PDFContext, letterheadImage: string): Promise<PDFContext> {
  try {
    // Convert document to image if needed
    const processedImage = await convertDocumentToImage(letterheadImage)
    
    // Determine image format
    let imageFormat = 'JPEG'
    if (processedImage.startsWith('data:image/png')) {
      imageFormat = 'PNG'
    }
    
    // Calculate letterhead height
    let letterheadHeight = 50 // Default height for documents
    
    if (processedImage.startsWith('data:image/')) {
      // For actual images, calculate based on aspect ratio
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        letterheadHeight = Math.min(ctx.maxContentWidth / aspectRatio, 80) // Cap at 80mm
      }
      img.src = processedImage
    }
    
    // Add letterhead image only on first page
    ctx.doc.addImage(processedImage, imageFormat, ctx.margin, ctx.currentY, ctx.maxContentWidth, letterheadHeight)
    
    // Update context
    ctx.currentY += letterheadHeight + 10
    ctx.letterheadHeight = letterheadHeight
    ctx.hasLetterhead = true
    
    return ctx
  } catch (error) {
    // If letterhead fails, continue without it
    console.error('Error adding letterhead:', error)
    return ctx
  }
}

// Add header (blue bar like in notes page)
function addHeader(ctx: PDFContext, note: MedicalNoteComprehensive, organizationName?: string): PDFContext {
  // Add blue header bar (similar to notes page)
  ctx.doc.setFillColor(30, 58, 138) // Blue color
  ctx.doc.rect(0, 0, ctx.doc.internal.pageSize.getWidth(), 30, 'F')
  
  // Add organization name on the left
  ctx.doc.setTextColor(255, 255, 255)
  ctx.doc.setFontSize(14)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text(organizationName || 'MEDICAL CENTER', ctx.margin, 20)
  
  // Add title and timestamp on the right
  const pageWidth = ctx.doc.internal.pageSize.getWidth()
  const rightMargin = ctx.margin
  const timestamp = new Date().toLocaleString()
  
  ctx.doc.setFontSize(12)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text('Medical Consultation Note', pageWidth - rightMargin - 80, 15)
  ctx.doc.setFontSize(10)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.text(`Generated: ${timestamp}`, pageWidth - rightMargin - 80, 25)
  
  ctx.currentY = 45
  return ctx
}

// Add patient information section
function addPatientInfo(ctx: PDFContext, note: MedicalNoteComprehensive): PDFContext {
  ctx.doc.setTextColor(30, 58, 138) // Blue color for section headers
  ctx.doc.setFontSize(14)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text('PATIENT INFORMATION', ctx.margin, ctx.currentY)
  ctx.currentY += 8
  
  ctx.doc.setTextColor(0, 0, 0)
  ctx.doc.setFontSize(11)
  ctx.doc.setFont('helvetica', 'normal')
  
  if (note.patientInformation) {
    // Format like in the image: Name, Gender, Age on same line
    const name = note.patientInformation.name || 'Not recorded'
    const gender = note.patientInformation.gender || 'Not recorded'
    const age = note.patientInformation.age || 'Not recorded'
    
    ctx.doc.text(`Name: ${name}`, ctx.margin, ctx.currentY)
    ctx.currentY += 6
    ctx.doc.text(`Gender: ${gender}`, ctx.margin, ctx.currentY)
    ctx.doc.text(`Age: ${age}`, ctx.margin + 80, ctx.currentY) // Align age to the right
    ctx.currentY += 6
  }
  
  // Add separator line
  ctx.doc.setDrawColor(200, 200, 200)
  ctx.doc.line(ctx.margin, ctx.currentY, ctx.doc.internal.pageSize.getWidth() - ctx.margin, ctx.currentY)
  ctx.currentY += 10
  
  return ctx
}

// Add section with proper formatting
function addSection(ctx: PDFContext, title: string, content: string, isImportant: boolean = false): PDFContext {
  // Check if we need a new page
  if (ctx.currentY > ctx.pageHeight - 60) {
    ctx.doc.addPage()
    ctx.currentY = ctx.margin
    
    // Don't add letterhead to new pages - only first page should have letterhead
  }
  
  // Section header
  ctx.doc.setFontSize(14)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(30, 58, 138) // Blue color for section headers
  ctx.doc.text(title.toUpperCase(), ctx.margin, ctx.currentY)
  ctx.currentY += 8
  
  // Content
  ctx.doc.setFontSize(11)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(0, 0, 0)
  
  if (content && content.trim() !== '') {
    const lines = ctx.doc.splitTextToSize(content, ctx.maxContentWidth)
    ctx.doc.text(lines, ctx.margin, ctx.currentY)
    ctx.currentY += lines.length * 6 + 10
  } else {
    ctx.doc.text('Not recorded', ctx.margin, ctx.currentY)
    ctx.currentY += 15
  }
  
  // Add separator line
  ctx.doc.setDrawColor(200, 200, 200)
  ctx.doc.line(ctx.margin, ctx.currentY, ctx.doc.internal.pageSize.getWidth() - ctx.margin, ctx.currentY)
  ctx.currentY += 10
  
  return ctx
}

// Add vital signs section
function addVitalSigns(ctx: PDFContext, note: MedicalNoteComprehensive): PDFContext {
  ctx.doc.setTextColor(30, 58, 138) // Blue color for section headers
  ctx.doc.setFontSize(14)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text('VITAL SIGNS', ctx.margin, ctx.currentY)
  ctx.currentY += 8
  
  ctx.doc.setTextColor(0, 0, 0)
  ctx.doc.setFontSize(11)
  ctx.doc.setFont('helvetica', 'normal')
  
  // Two-column layout like in the image
  const leftColumn = [
    `Temperature: ${(note as any).temperature || 'Not recorded'}`,
    `Respiratory Rate: ${(note as any).respiratoryRate || 'Not recorded'}`,
    `Glucose: ${(note as any).glucose || 'Not recorded'}`
  ]
  
  const rightColumn = [
    `Pulse Rate: ${(note as any).pulseRate || 'Not recorded'}`,
    `Blood Pressure: ${(note as any).bloodPressure || 'Not recorded'}`
  ]
  
  const pageWidth = ctx.doc.internal.pageSize.getWidth()
  const centerX = pageWidth / 2
  
  // Left column
  leftColumn.forEach((vital, index) => {
    ctx.doc.text(vital, ctx.margin, ctx.currentY)
    ctx.currentY += 6
  })
  
  // Right column
  ctx.currentY -= (leftColumn.length * 6) // Reset to top
  rightColumn.forEach((vital, index) => {
    ctx.doc.text(vital, centerX + 20, ctx.currentY)
    ctx.currentY += 6
  })
  
  ctx.currentY += 6 // Add some space after the columns
  
  // Add separator line
  ctx.doc.setDrawColor(200, 200, 200)
  ctx.doc.line(ctx.margin, ctx.currentY, ctx.doc.internal.pageSize.getWidth() - ctx.margin, ctx.currentY)
  ctx.currentY += 10
  
  return ctx
}

// Add footer with doctor information
function addFooter(ctx: PDFContext, doctorName?: string, registrationNo?: string): PDFContext {
  // Check if we need a new page
  if (ctx.currentY > ctx.pageHeight - 80) {
    ctx.doc.addPage()
    ctx.currentY = ctx.margin
    
    // Don't add letterhead to new pages - only first page should have letterhead
  }
  
  ctx.currentY += 20
  
  // Doctor information
  if (doctorName || registrationNo) {
    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.setTextColor(30, 58, 138)
    
    if (doctorName) {
      ctx.doc.text(`Dr. ${doctorName}`, ctx.margin, ctx.currentY)
      ctx.currentY += 6
    }
    
    if (registrationNo) {
      ctx.doc.text(`Registration No: ${registrationNo}`, ctx.margin, ctx.currentY)
      ctx.currentY += 6
    }
  }
  
  // Date
  ctx.doc.setFontSize(10)
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setTextColor(100, 100, 100)
  ctx.doc.text(`Generated on: ${new Date().toLocaleDateString()}`, ctx.margin, ctx.currentY)
  
  return ctx
}

// Merge PDF letterhead with medical note PDF
async function mergePDFLetterhead(letterheadDataUrl: string, medicalNotePDF: jsPDF): Promise<jsPDF> {
  try {
    // For PDF letterheads, we need to handle them differently
    // This is a simplified approach - in production you might want to use a more robust PDF merging library
    
    // Create a new PDF with the letterhead
    const doc = new jsPDF()
    
    // Add the letterhead as an image (converted from PDF)
    // This is a simplified approach - in production you'd want proper PDF merging
    doc.addImage(letterheadDataUrl, 'PDF', 0, 0, doc.internal.pageSize.getWidth(), 80)
    
    return doc
  } catch (error) {
    throw new Error('Failed to merge PDF letterhead')
  }
}

/**
 * Main unified PDF generation function following notes page format
 */
async function generateUnifiedMedicalNotePDF(
  note: MedicalNoteComprehensive,
  options: {
    organizationName?: string
    doctorName?: string
    registrationNo?: string
    includeICD11?: boolean
    useLetterhead?: boolean
    letterheadImage?: string
  } = {}
): Promise<jsPDF> {
  try {
    // Initialize PDF context
    let ctx = initializePDFContext()
    
    // Handle letterhead first (async operation)
    if (options.useLetterhead && options.letterheadImage) {
      ctx = await addLetterhead(ctx, options.letterheadImage)
    }
    
    // Build PDF pipeline following notes page format
    const pipeline = [
      
      // Header (blue bar)
      (ctx: PDFContext) => addHeader(ctx, note, options.organizationName),
      
      // Patient information
      (ctx: PDFContext) => addPatientInfo(ctx, note),
      
      // Vital signs (if available)
      (ctx: PDFContext) => addVitalSigns(ctx, note),
      
      // Medical content sections in notes page order
      ...(note.chiefComplaint ? [(ctx: PDFContext) => addSection(ctx, "Chief Complaint", note.chiefComplaint)] : []),
      ...(note.historyOfPresentingIllness ? [(ctx: PDFContext) => addSection(ctx, "History of Present Illness", note.historyOfPresentingIllness)] : []),
      ...(note.pastMedicalHistory ? [(ctx: PDFContext) => addSection(ctx, "Past Medical History", note.pastMedicalHistory!)] : []),
      ...(note.medication ? [(ctx: PDFContext) => addSection(ctx, "Current Medications", note.medication!)] : []),
      ...(note.allergies ? [(ctx: PDFContext) => addSection(ctx, "Allergies", note.allergies!)] : []),
      ...(note.socialHistory ? [(ctx: PDFContext) => addSection(ctx, "Social History", note.socialHistory!)] : []),
      ...(note.familyHistory ? [(ctx: PDFContext) => addSection(ctx, "Family History", note.familyHistory!)] : []),
      ...(note.reviewOfSystems ? [(ctx: PDFContext) => addSection(ctx, "Review of Systems", note.reviewOfSystems!)] : []),
      
      // Physical examination
      ...(note.examinationData?.generalExamination ? [(ctx: PDFContext) => addSection(ctx, "Physical Examination", note.examinationData.generalExamination!)] : []),
      ...(note.examinationData?.cardiovascularExamination ? [(ctx: PDFContext) => addSection(ctx, "Cardiovascular Examination", note.examinationData.cardiovascularExamination!)] : []),
      ...(note.examinationData?.respiratoryExamination ? [(ctx: PDFContext) => addSection(ctx, "Respiratory Examination", note.examinationData.respiratoryExamination!)] : []),
      ...(note.examinationData?.abdominalExamination ? [(ctx: PDFContext) => addSection(ctx, "Abdominal Examination", note.examinationData.abdominalExamination!)] : []),
      ...(note.examinationData?.otherSystemsExamination ? [(ctx: PDFContext) => addSection(ctx, "Other Systems", note.examinationData.otherSystemsExamination!)] : []),
      
      // Investigations and results
      ...(note.investigations ? [(ctx: PDFContext) => addSection(ctx, "Investigations", note.investigations!)] : []),
      
      // Assessment and plan
      ...(note.assessment || note.diagnosis ? [(ctx: PDFContext) => addSection(ctx, "Assessment/Diagnosis", note.assessment || note.diagnosis, true)] : []),
      ...(note.plan || note.treatmentPlan ? [(ctx: PDFContext) => addSection(ctx, "Management Plan", note.plan || note.treatmentPlan, true)] : []),
      
      // ICD-11 codes if available and requested
      ...(options.includeICD11 !== false && (note as any).icd11Codes ? [(ctx: PDFContext) => addICD11Codes(ctx, (note as any).icd11Codes)] : []),
      
      // Follow-up and additional notes
      ...(note.followUpInstructions ? [(ctx: PDFContext) => addSection(ctx, "Follow-up Instructions", note.followUpInstructions!)] : []),
      ...(note.additionalNotes ? [(ctx: PDFContext) => addSection(ctx, "Additional Notes", note.additionalNotes!)] : []),
      
      // Footer (must be last)
      (ctx: PDFContext) => addFooter(ctx, options.doctorName, options.registrationNo)
    ]

    // Execute pipeline
    ctx = pipeline.reduce((currentCtx, operation) => operation(currentCtx), ctx)
    
    return ctx.doc
  } catch (error) {
    throw new Error('Failed to generate medical note PDF')
  }
}

// Add ICD-11 codes section
function addICD11Codes(ctx: PDFContext, icd11Codes: any): PDFContext {
  if (!icd11Codes) return ctx
  
  let codesText = ''
  
  if (icd11Codes.primary && icd11Codes.primary.length > 0) {
    codesText += 'Primary Codes:\n'
    icd11Codes.primary.forEach((code: any) => {
      codesText += `- ${code.code}: ${code.title}\n`
    })
  }
  
  if (icd11Codes.secondary && icd11Codes.secondary.length > 0) {
    codesText += '\nSecondary Codes:\n'
    icd11Codes.secondary.forEach((code: any) => {
      codesText += `- ${code.code}: ${code.title}\n`
    })
  }
  
  if (codesText) {
    return addSection(ctx, 'ICD-11 Codes', codesText)
  }
  
  return ctx
}

/**
 * Generate and download PDF with proper filename
 */
async function generateAndDownloadUnifiedPDF(
  note: MedicalNoteComprehensive,
  options: {
    organizationName?: string
    doctorName?: string
    registrationNo?: string
    includeICD11?: boolean
    customFilename?: string
    useLetterhead?: boolean
    letterheadImage?: string
  } = {}
): Promise<void> {
  try {
    // Generate the medical note PDF first
    const doc = await generateUnifiedMedicalNotePDF(note, {
      ...options,
      useLetterhead: false // Don't add letterhead in the initial generation
    })
    
    // If PDF letterhead is requested, merge it
    let finalDoc = doc
    if (options.useLetterhead && options.letterheadImage?.startsWith('data:application/pdf')) {
      try {
        finalDoc = await mergePDFLetterhead(options.letterheadImage, doc)
      } catch (mergeError) {
        // Continue with original PDF if merge fails
      }
    }
    
    // Generate organized filename
    const patientName = note.patientInformation?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Patient'
    const date = (note.visitDate || new Date().toISOString().split('T')[0]).replace(/\//g, '-')
    const noteId = note.id?.substring(0, 8) || 'Note'
    
    const defaultFilename = `MedicalNote_${patientName}_${date}_${noteId}.pdf`
    const filename = options.customFilename || defaultFilename
    
    // Download the PDF
    finalDoc.save(filename)
    
  } catch (error) {
    throw error
  }
}

export {
  generateUnifiedMedicalNotePDF,
  generateAndDownloadUnifiedPDF,
  mergePDFLetterhead
}