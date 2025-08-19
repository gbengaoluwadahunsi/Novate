// Comprehensive PDF Generator - Following new.pdf template structure
// Functional approach with context threading

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { ComprehensiveMedicalNote } from '@/types/medical-note-comprehensive'
import { ExaminationTemplate } from '@/types/examination'

interface PDFContext {
  doc: jsPDF
  currentY: number
  pageWidth: number
  pageHeight: number
  margins: { left: number; right: number; top: number; bottom: number }
}

// Initialize PDF context
const createPDFContext = (): PDFContext => {
  const doc = new jsPDF()
  return {
    doc,
    currentY: 20,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margins: { left: 14, right: 14, top: 20, bottom: 20 }
  }
}

// Utility function to check if we need a new page
const checkAndAddPage = (ctx: PDFContext, requiredSpace: number = 30): PDFContext => {
  if (ctx.currentY + requiredSpace > ctx.pageHeight - ctx.margins.bottom) {
    ctx.doc.addPage()
    return { ...ctx, currentY: ctx.margins.top }
  }
  return ctx
}

// Add letterhead or header
const addHeader = (ctx: PDFContext, note: ComprehensiveMedicalNote, organizationName?: string): PDFContext => {
  let yPos = ctx.currentY

  // Add letterhead if available
  if (note.letterhead) {
    try {
      ctx.doc.addImage(note.letterhead, 'JPEG', ctx.margins.left, yPos, 182, 30)
      yPos += 40
    } catch (error) {
      // Failed to add letterhead to PDF
      // Fallback to standard header
      ctx.doc.setFontSize(18)
      ctx.doc.text("Medical Consultation Note", ctx.pageWidth / 2, yPos, { align: "center" })
      ctx.doc.setFontSize(12)
      ctx.doc.text(organizationName || "Medical Center", ctx.pageWidth / 2, yPos + 7, { align: "center" })
      yPos += 25
    }
  } else {
    // Standard header
    ctx.doc.setFontSize(18)
    ctx.doc.text("Medical Consultation Note", ctx.pageWidth / 2, yPos, { align: "center" })
    ctx.doc.setFontSize(12)
    ctx.doc.text(organizationName || "Medical Center", ctx.pageWidth / 2, yPos + 7, { align: "center" })
    yPos += 25
  }

  return { ...ctx, currentY: yPos }
}

// Add patient information section
const addPatientInfo = (ctx: PDFContext, note: ComprehensiveMedicalNote): PDFContext => {
  let yPos = ctx.currentY

  // Patient Information Section
  ctx.doc.setFontSize(14)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text("PATIENT INFORMATION", ctx.margins.left, yPos)
  yPos += 8

  ctx.doc.setFontSize(10)
  ctx.doc.setFont('helvetica', 'normal')
  
  // Patient details
  ctx.doc.text(`Name: ${note.patientName || 'Not specified'}`, ctx.margins.left, yPos)
  yPos += 6
  
  const ageGender = `${note.patientAge || 'N/A'} / ${note.patientGender || 'Not specified'}`
  ctx.doc.text(`Age/Gender: ${ageGender}`, ctx.margins.left, yPos)
  yPos += 6

  if (note.visitDate) {
    ctx.doc.text(`Visit Date: ${note.visitDate}`, ctx.margins.left, yPos)
    yPos += 6
  }

  if (note.visitTime) {
    ctx.doc.text(`Visit Time: ${note.visitTime}`, ctx.margins.left, yPos)
    yPos += 6
  }

  if (note.noteType) {
    ctx.doc.text(`Note Type: ${note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)}`, ctx.margins.left, yPos)
    yPos += 6
  }

  yPos += 8

  return { ...ctx, currentY: yPos }
}

// Add a section with title and content
const addSection = (ctx: PDFContext, title: string, content: string): PDFContext => {
  const updatedCtx = checkAndAddPage(ctx, 40)
  let yPos = updatedCtx.currentY

  // Section title
  updatedCtx.doc.setFontSize(14)
  updatedCtx.doc.setFont('helvetica', 'bold')
  updatedCtx.doc.text(title.toUpperCase(), updatedCtx.margins.left, yPos)
  yPos += 8

  // Section content
  updatedCtx.doc.setFontSize(10)
  updatedCtx.doc.setFont('helvetica', 'normal')
  
  const maxWidth = updatedCtx.pageWidth - updatedCtx.margins.left - updatedCtx.margins.right
  const splitContent = updatedCtx.doc.splitTextToSize(content, maxWidth)
  
  // Check if content fits on current page
  const contentHeight = splitContent.length * 6
  if (yPos + contentHeight > updatedCtx.pageHeight - updatedCtx.margins.bottom) {
    updatedCtx.doc.addPage()
    yPos = updatedCtx.margins.top
    
    // Repeat section title on new page
    updatedCtx.doc.setFontSize(14)
    updatedCtx.doc.setFont('helvetica', 'bold')
    updatedCtx.doc.text(title.toUpperCase(), updatedCtx.margins.left, yPos)
    yPos += 8
    
    updatedCtx.doc.setFontSize(10)
    updatedCtx.doc.setFont('helvetica', 'normal')
  }
  
  updatedCtx.doc.text(splitContent, updatedCtx.margins.left, yPos)
  yPos += contentHeight + 10

  return { ...updatedCtx, currentY: yPos }
}

// Add prescriptions section
const addPrescriptions = (ctx: PDFContext, prescriptions: Array<{medication: string, dosage: string, instructions?: string}>): PDFContext => {
  if (!prescriptions || prescriptions.length === 0) return ctx

  const updatedCtx = checkAndAddPage(ctx, 40)
  let yPos = updatedCtx.currentY

  // Section title
  updatedCtx.doc.setFontSize(14)
  updatedCtx.doc.setFont('helvetica', 'bold')
  updatedCtx.doc.text("PRESCRIPTIONS", updatedCtx.margins.left, yPos)
  yPos += 10

  updatedCtx.doc.setFontSize(10)
  updatedCtx.doc.setFont('helvetica', 'normal')

  prescriptions.forEach((prescription, index) => {
    const prescriptionHeight = 18
    
    // Check if prescription fits on current page
    if (yPos + prescriptionHeight > updatedCtx.pageHeight - updatedCtx.margins.bottom) {
      updatedCtx.doc.addPage()
      yPos = updatedCtx.margins.top
    }

    updatedCtx.doc.text(`${index + 1}. ${prescription.medication}`, updatedCtx.margins.left, yPos)
    yPos += 6
    updatedCtx.doc.text(`   Dosage: ${prescription.dosage}`, updatedCtx.margins.left, yPos)
    yPos += 6
    if (prescription.instructions) {
      updatedCtx.doc.text(`   Instructions: ${prescription.instructions}`, updatedCtx.margins.left, yPos)
      yPos += 6
    }
    yPos += 6
  })

  return { ...updatedCtx, currentY: yPos }
}

// Add comprehensive examination section
const addComprehensiveExaminationToPDF = (ctx: PDFContext, examination: ExaminationTemplate): PDFContext => {
  // Start physical examination on new page as requested
  ctx.doc.addPage()
  let yPos = ctx.margins.top

  ctx.doc.setFontSize(16)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.text("PHYSICAL EXAMINATION", ctx.pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // Vital Signs
  if (examination.generalExamination) {
    ctx.doc.setFontSize(14)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text("VITAL SIGNS", ctx.margins.left, yPos)
    yPos += 8

    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    // Handle general examination as string
    ctx.doc.text(examination.generalExamination, ctx.margins.left, yPos)
    yPos += 10
  }

  // General Examination
  if (examination.generalExamination) {
    yPos = checkAndAddPage({ ...ctx, currentY: yPos }, 30).currentY
    
    ctx.doc.setFontSize(14)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text("GENERAL EXAMINATION", ctx.margins.left, yPos)
    yPos += 8

    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    // Handle general examination as string
    ctx.doc.text(examination.generalExamination, ctx.margins.left, yPos)
    yPos += 10
  }

  // GEI (General Examination Inspection)
  if (examination.cardiovascularExamination) {
    yPos = checkAndAddPage({ ...ctx, currentY: yPos }, 30).currentY
    
    ctx.doc.setFontSize(14)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text("GENERAL EXAMINATION - INSPECTION", ctx.margins.left, yPos)
    yPos += 8

    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    // Handle cardiovascular examination as string
    ctx.doc.text(examination.cardiovascularExamination, ctx.margins.left, yPos)
    yPos += 10
  }

  // CVS/Respiratory Examination
  if (examination.respiratoryExamination) {
    yPos = checkAndAddPage({ ...ctx, currentY: yPos }, 30).currentY
    
    ctx.doc.setFontSize(14)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text("CARDIOVASCULAR & RESPIRATORY EXAMINATION", ctx.margins.left, yPos)
    yPos += 8

    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    // Handle respiratory examination as string
    ctx.doc.text(examination.respiratoryExamination, ctx.margins.left, yPos)
    yPos += 10
  }

  // Abdominal Examination
  if (examination.abdominalExamination) {
    yPos = checkAndAddPage({ ...ctx, currentY: yPos }, 30).currentY
    
    ctx.doc.setFontSize(14)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.text("ABDOMINAL & INGUINAL EXAMINATION", ctx.margins.left, yPos)
    yPos += 8

    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    // Handle abdominal examination as string
    ctx.doc.text(examination.abdominalExamination, ctx.margins.left, yPos)
    yPos += 10
  }

  return { ...ctx, currentY: yPos }
}

// Add doctor information and signature
const addSignature = (ctx: PDFContext, note: ComprehensiveMedicalNote): PDFContext => {
  const updatedCtx = checkAndAddPage(ctx, 80)
  let yPos = updatedCtx.currentY + 20

  // Doctor Information
  updatedCtx.doc.setFontSize(14)
  updatedCtx.doc.setFont('helvetica', 'bold')
  updatedCtx.doc.text("DOCTOR INFORMATION", updatedCtx.margins.left, yPos)
  yPos += 10

  updatedCtx.doc.setFontSize(10)
  updatedCtx.doc.setFont('helvetica', 'normal')
  
  const doctorName = note.doctorName || "Dr. _______________"
  const regNumber = note.doctorRegistrationNo || "_______________"
  const department = note.doctorDepartment || "General Medicine"
  
  updatedCtx.doc.text(`Name: ${doctorName}`, updatedCtx.margins.left, yPos)
  yPos += 6
  updatedCtx.doc.text(`Registration No: ${regNumber}`, updatedCtx.margins.left, yPos)
  yPos += 6
  updatedCtx.doc.text(`Department: ${department}`, updatedCtx.margins.left, yPos)
  yPos += 6

  if (note.dateOfIssue) {
    updatedCtx.doc.text(`Date of Issue: ${note.dateOfIssue}`, updatedCtx.margins.left, yPos)
    yPos += 6
  }

  yPos += 15

  // Signature section
  const signatureY = yPos
  
  // Add doctor signature if available
  if (note.doctorSignature) {
    try {
      updatedCtx.doc.addImage(note.doctorSignature, 'PNG', updatedCtx.margins.left, signatureY, 60, 20)
    } catch (error) {
      // Failed to add signature
      updatedCtx.doc.line(updatedCtx.margins.left, signatureY + 15, updatedCtx.margins.left + 60, signatureY + 15)
    }
  } else {
    updatedCtx.doc.line(updatedCtx.margins.left, signatureY + 15, updatedCtx.margins.left + 60, signatureY + 15)
  }
  
  updatedCtx.doc.text("Doctor's Signature", updatedCtx.margins.left + 15, signatureY + 25)

  // Add doctor stamp if available
  const stampX = updatedCtx.pageWidth - updatedCtx.margins.right - 70
  if (note.doctorStamp) {
    try {
      updatedCtx.doc.addImage(note.doctorStamp, 'PNG', stampX, signatureY, 60, 30)
    } catch (error) {
      // Failed to add stamp
      updatedCtx.doc.rect(stampX, signatureY, 60, 30)
      updatedCtx.doc.text("Official Stamp", stampX + 15, signatureY + 18)
    }
  } else {
    updatedCtx.doc.rect(stampX, signatureY, 60, 30)
    updatedCtx.doc.text("Official Stamp", stampX + 15, signatureY + 18)
  }

  return { ...updatedCtx, currentY: signatureY + 40 }
}

// Main PDF generation pipeline following new.pdf template
const generateComprehensivePDF = (
  note: ComprehensiveMedicalNote, 
  organizationName?: string
): jsPDF => {
  const pipeline = [
    (ctx: PDFContext) => addHeader(ctx, note, organizationName),
    (ctx: PDFContext) => addPatientInfo(ctx, note),
    
    // Medical content sections (following template order)
    ...(note.chiefComplaint ? [(ctx: PDFContext) => addSection(ctx, "Chief Complaint", note.chiefComplaint!)] : []),
    ...(note.historyOfPresentingIllness || note.historyOfPresentIllness ? 
      [(ctx: PDFContext) => addSection(ctx, "History of Presenting Illness", note.historyOfPresentingIllness || note.historyOfPresentIllness!)] : []),
    ...(note.pastMedicalHistory ? [(ctx: PDFContext) => addSection(ctx, "Past Medical History", note.pastMedicalHistory!)] : []),
    ...(note.systemReview ? [(ctx: PDFContext) => addSection(ctx, "Review of Systems", note.systemReview!)] : []),
    
    // Physical examination (basic or comprehensive)
    ...(note.comprehensiveExamination ? 
      [(ctx: PDFContext) => addComprehensiveExaminationToPDF(ctx, note.comprehensiveExamination!)] : 
      note.physicalExamination ? [(ctx: PDFContext) => addSection(ctx, "Physical Examination", note.physicalExamination!)] : []),
    
    // Assessment and management
    ...(note.diagnosis || note.assessmentAndDiagnosis ? 
      [(ctx: PDFContext) => addSection(ctx, "Diagnosis", note.diagnosis || note.assessmentAndDiagnosis!)] : []),
    ...(note.treatmentPlan ? [(ctx: PDFContext) => addSection(ctx, "Treatment Plan", note.treatmentPlan!)] : []),
    ...(typeof note.managementPlan === 'string' ? [(ctx: PDFContext) => addSection(ctx, "Management Plan", note.managementPlan as string)] : []),
    
    // Additional sections
    ...(note.followUpInstructions ? [(ctx: PDFContext) => addSection(ctx, "Follow-up Instructions", note.followUpInstructions!)] : []),
    ...(note.additionalNotes ? [(ctx: PDFContext) => addSection(ctx, "Additional Notes", note.additionalNotes!)] : []),
    
    // Prescriptions
    ...(note.prescriptions && note.prescriptions.length > 0 ? [(ctx: PDFContext) => addPrescriptions(ctx, note.prescriptions!)] : []),
    
    // Signature
    (ctx: PDFContext) => addSignature(ctx, note)
  ]

  const finalContext = pipeline.reduce(
    (ctx, operation) => operation(ctx),
    createPDFContext()
  )

  return finalContext.doc
}

// Export function for generating and downloading PDF
const generateAndDownloadComprehensivePDF = (
  note: ComprehensiveMedicalNote,
  organizationName?: string,
  filename?: string
): void => {
  try {
    const doc = generateComprehensivePDF(note, organizationName)
    
    const defaultFilename = `Medical_Note_${note.patientName?.replace(/\s+/g, "_") || "Patient"}_${
      note.visitDate?.replace(/\//g, "-") || new Date().toISOString().split('T')[0]
    }.pdf`
    
    doc.save(filename || defaultFilename)
  } catch (error) {
          // Error generating comprehensive PDF
    throw new Error('Failed to generate PDF. Please check the note data.')
  }
}

// Export the main functions
export { generateComprehensivePDF, generateAndDownloadComprehensivePDF } 