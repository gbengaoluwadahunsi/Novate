import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { logger } from './logger'
import { ExaminationTemplate } from "../types/examination"

export interface PracticeInfo {
  organizationName: string;
  organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  practiceLabel: string;
}

export interface MedicalNote {
  id: string;
  patientName: string;
  patientAge: number | null | string;
  patientGender: string;
  noteType: string | null;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  comprehensiveExamination?: ExaminationTemplate;
  diagnosis?: string;
  treatmentPlan?: string;
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string;
  doctorStamp?: string;
  letterhead?: string;
  createdAt: string;
  updatedAt: string;
}

interface PDFContext {
  doc: jsPDF;
  currentY: number;
  pageWidth: number;
  margin: number;
  contentWidth: number;
}

// Constants
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  margin: 20,
  letterheadHeight: 40,
  signatureHeight: 40
} as const

const createPDFContext = (): PDFContext => ({
  doc: new jsPDF('p', 'mm', 'a4'),
  currentY: 20,
  pageWidth: PDF_CONFIG.pageWidth,
  margin: PDF_CONFIG.margin,
  contentWidth: PDF_CONFIG.pageWidth - (PDF_CONFIG.margin * 2)
})

// Main PDF generation function
const generatePDF = (note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): jsPDF => {
  const ctx = createPDFContext()
  
  // Pipeline approach - each function returns updated context
  const pipeline = [
    (ctx: PDFContext) => addHeader(ctx, note, practiceInfo, patientName),
    (ctx: PDFContext) => addPatientInfo(ctx, note, patientName),
    (ctx: PDFContext) => addMedicalContent(ctx, note),
    (ctx: PDFContext) => addSignature(ctx, note)
  ]
  
  // Execute pipeline
  pipeline.reduce((context, fn) => fn(context), ctx)
  
  return ctx.doc
}

// Header functions
const addLetterheadHeader = (ctx: PDFContext, letterheadBase64: string): PDFContext => {
  try {
    ctx.doc.addImage(letterheadBase64, 'JPEG', ctx.margin, ctx.currentY, ctx.contentWidth, PDF_CONFIG.letterheadHeight)
    return { ...ctx, currentY: ctx.currentY + PDF_CONFIG.letterheadHeight + 10 }
  } catch (error) {
    logger.error('Failed to add letterhead to PDF:', error)
    return addStandardHeader(ctx, 'MEDICAL CONSULTATION NOTE')
  }
}

const addStandardHeader = (ctx: PDFContext, title: string, organizationName?: string): PDFContext => {
  ctx.doc.setFontSize(16)
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setTextColor(0, 0, 255)
  ctx.doc.text(title, ctx.pageWidth / 2, ctx.currentY, { align: 'center' })
  
  let newY = ctx.currentY + 8
  
  if (organizationName) {
    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    ctx.doc.setTextColor(0, 0, 0)
    ctx.doc.text(organizationName, ctx.pageWidth / 2, newY, { align: 'center' })
    newY += 12
  }
  
  return { ...ctx, currentY: newY }
}

const addHeader = (ctx: PDFContext, note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): PDFContext => {
  if (note.letterhead) {
    return addLetterheadHeader(ctx, note.letterhead)
  }
  return addStandardHeader(ctx, 'MEDICAL CONSULTATION NOTE', practiceInfo.organizationName)
}

// Patient info section
const addPatientInfo = (ctx: PDFContext, note: MedicalNote, patientName: string): PDFContext => {
  const addSectionTitle = (ctx: PDFContext, title: string): PDFContext => {
    ctx.doc.setFontSize(12)
    ctx.doc.setFont('helvetica', 'bold')
    ctx.doc.setTextColor(0, 0, 0)
    ctx.doc.text(title, ctx.margin, ctx.currentY)
    return { ...ctx, currentY: ctx.currentY + 6 }
  }

  const addPatientDetails = (ctx: PDFContext, details: Array<[string, string]>): PDFContext => {
    ctx.doc.setFontSize(10)
    ctx.doc.setFont('helvetica', 'normal')
    
    return details.reduce((acc, [label, value]) => {
      ctx.doc.text(label, ctx.margin, acc.currentY)
      ctx.doc.text(value, ctx.margin + 30, acc.currentY)
      return { ...acc, currentY: acc.currentY + 5 }
    }, ctx)
  }

  const patientDetails: Array<[string, string]> = [
    ['Patient Name:', patientName],
    ['Age:', String(note.patientAge) !== 'N/A' && note.patientAge ? String(note.patientAge) : 'N/A'],
    ['Gender:', note.patientGender || 'N/A'],
    ['Date:', new Date().toLocaleDateString()]
  ]

  const withTitle = addSectionTitle(ctx, 'PATIENT INFORMATION')
  const withDetails = addPatientDetails(withTitle, patientDetails)
  
  return { ...withDetails, currentY: withDetails.currentY + 5 }
}

// Medical content sections
const addMedicalContent = (ctx: PDFContext, note: MedicalNote): PDFContext => {
  const basicSections = [
    { title: 'CHIEF COMPLAINT', content: note.chiefComplaint },
    { title: 'HISTORY OF PRESENT ILLNESS', content: note.historyOfPresentIllness }
  ]

  const remainingSections = [
    { title: 'DIAGNOSIS', content: note.diagnosis },
    { title: 'TREATMENT PLAN', content: note.treatmentPlan }
  ]

  // Add basic sections
  const withBasicSections = basicSections
    .filter(section => section.content?.trim())
    .reduce((acc, section) => addSection(acc, section.title, section.content!), ctx)

  // Add examination section
  const withExamination = note.comprehensiveExamination 
    ? addComprehensiveExamination(withBasicSections, note.comprehensiveExamination)
    : note.physicalExamination?.trim() 
      ? addSection(withBasicSections, 'PHYSICAL EXAMINATION', note.physicalExamination)
      : withBasicSections

  // Add remaining sections
  return remainingSections
    .filter(section => section.content?.trim())
    .reduce((acc, section) => addSection(acc, section.title, section.content!), withExamination)
}

// Utility functions
const checkAndAddPage = (ctx: PDFContext, requiredSpace: number = 30): PDFContext => {
  if (ctx.currentY > 280 - requiredSpace) {
    ctx.doc.addPage()
    return { ...ctx, currentY: 20 }
  }
  return ctx
}

const addSection = (ctx: PDFContext, title: string, content: string): PDFContext => {
  const withPageCheck = checkAndAddPage(ctx, 50)
  
  // Section title
  withPageCheck.doc.setFontSize(11)
  withPageCheck.doc.setFont('helvetica', 'bold')
  withPageCheck.doc.setTextColor(0, 0, 0)
  withPageCheck.doc.text(title, withPageCheck.margin, withPageCheck.currentY)
  
  let currentY = withPageCheck.currentY + 6
  
  // Section content
  withPageCheck.doc.setFontSize(10)
  withPageCheck.doc.setFont('helvetica', 'normal')
  
  const lines = withPageCheck.doc.splitTextToSize(content, withPageCheck.contentWidth)
  
  const finalY = lines.reduce((y: number, line: string) => {
    if (y > 280) {
      withPageCheck.doc.addPage()
      y = 20
    }
    withPageCheck.doc.text(line, withPageCheck.margin, y)
    return y + 4
  }, currentY)
  
  return { ...withPageCheck, currentY: finalY + 3 }
}

// Comprehensive examination functions
const hasValidData = (obj: any): boolean => {
  if (typeof obj === 'string') return obj.trim() !== ''
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(v => hasValidData(v))
  }
  return false
}

const addComprehensiveExamination = (ctx: PDFContext, examination: ExaminationTemplate): PDFContext => {
  const withPageCheck = checkAndAddPage(ctx, 60)
  
  // Main title
  withPageCheck.doc.setFontSize(12)
  withPageCheck.doc.setFont('helvetica', 'bold')
  withPageCheck.doc.text('COMPREHENSIVE PHYSICAL EXAMINATION', withPageCheck.margin, withPageCheck.currentY)
  
  let currentCtx = { ...withPageCheck, currentY: withPageCheck.currentY + 8 }

  // Vital Signs
  if (hasValidData(examination.VitalSigns)) {
    const vitalSignsData = [
      `Temperature: ${examination.VitalSigns.Temp || 'N/A'}`,
      `Pulse Rate: ${examination.VitalSigns.PR || 'N/A'}`,
      `Respiratory Rate: ${examination.VitalSigns.RR || 'N/A'}`,
      `Blood Pressure: ${examination.VitalSigns.BP || 'N/A'}`,
      `Oxygen Saturation: ${examination.VitalSigns.OxygenSaturationSpO2 || 'N/A'}`,
      `Weight: ${examination.VitalSigns.BodyWeight || 'N/A'}`,
      `Height: ${examination.VitalSigns.Height || 'N/A'}`,
      `BMI: ${examination.VitalSigns.BMI?.Value || 'N/A'} (${examination.VitalSigns.BMI?.Status || 'N/A'})`,
      examination.VitalSigns.RecordedBy ? `Recorded by: ${examination.VitalSigns.RecordedBy}` : ''
    ].filter(Boolean)
    
    currentCtx = addExaminationSubsection(currentCtx, 'Vital Signs', vitalSignsData)
  }

  // General Examination
  if (examination.GeneralExamination?.Observations && hasValidData(examination.GeneralExamination.Observations)) {
    const obs = examination.GeneralExamination.Observations
    const generalData = [
      obs.ConsciousnessLevel ? `Consciousness Level: ${obs.ConsciousnessLevel}` : '',
      obs.WellnessPain ? `Pain Assessment: ${obs.WellnessPain}` : '',
      obs.HydrationStatus ? `Hydration Status: ${obs.HydrationStatus}` : '',
      obs.GaitAndPosture ? `Gait and Posture: ${obs.GaitAndPosture}` : '',
      examination.GeneralExamination.PatientInfo?.Chaperone ? 
        `Chaperone: ${examination.GeneralExamination.PatientInfo.Chaperone}` : ''
    ].filter(Boolean)
    
    currentCtx = addExaminationSubsection(currentCtx, 'General Examination', generalData)
  }

  // Physical Inspection
  if (examination.GEI && hasValidData(examination.GEI)) {
    const findings = Object.entries(examination.GEI)
      .map(([bodyPart, areas]) => {
        const relevantFindings = Object.entries(areas)
          .filter(([_, value]) => typeof value === 'string' && value.trim())
          .map(([area, finding]) => `${area}: ${finding}`)
        
        return relevantFindings.length > 0 ? `${bodyPart}: ${relevantFindings.join(', ')}` : null
      })
      .filter(Boolean) as string[]
    
    if (findings.length > 0) {
      currentCtx = addExaminationSubsection(currentCtx, 'Physical Inspection Findings', findings)
    }
  }

  // CVS/Respiratory
  if (examination.CVSRespExamination?.Chest && hasValidData(examination.CVSRespExamination.Chest)) {
    const chest = examination.CVSRespExamination.Chest
    const findings: string[] = []

    if (chest.JVP) findings.push(`JVP: ${chest.JVP}`)
    if (chest.G) findings.push(`General: ${chest.G}`)
    if (chest.G2) findings.push(`Precordium: ${chest.G2}`)
    if (chest.M) findings.push(`Heart Sounds: ${chest.M}`)
    if (chest.G3_1) findings.push(`Respiratory: ${chest.G3_1}`)

    const percussionFindings = Object.entries(chest.Percussion || {})
      .filter(([_, value]) => typeof value === 'string' && value.trim())
      .map(([zone, finding]) => `Zone ${zone}: ${finding}`)
    
    if (percussionFindings.length > 0) {
      findings.push(`Percussion - ${percussionFindings.join(', ')}`)
    }

    const auscultationFindings = Object.entries(chest.Auscultation || {})
      .filter(([_, value]) => typeof value === 'string' && value.trim())
      .map(([zone, finding]) => `Zone ${zone}: ${finding}`)
    
    if (auscultationFindings.length > 0) {
      findings.push(`Auscultation - ${auscultationFindings.join(', ')}`)
    }

    if (findings.length > 0) {
      currentCtx = addExaminationSubsection(currentCtx, 'Cardiovascular & Respiratory Examination', findings)
    }
  }

  // Abdominal Examination
  if (examination.AbdominalInguinalExamination && hasValidData(examination.AbdominalInguinalExamination)) {
    const abd = examination.AbdominalInguinalExamination
    const findings: string[] = []

    Object.entries(abd).forEach(([organ, finding]) => {
      if (typeof finding === 'string' && finding.trim()) {
        findings.push(`${organ}: ${finding}`)
      } else if (typeof finding === 'object' && finding) {
        Object.entries(finding).forEach(([subOrgan, subFinding]) => {
          if (typeof subFinding === 'string' && subFinding.trim()) {
            findings.push(`${organ} ${subOrgan}: ${subFinding}`)
          }
        })
      }
    })

    if (findings.length > 0) {
      currentCtx = addExaminationSubsection(currentCtx, 'Abdominal & Inguinal Examination', findings)
    }
  }

  return { ...currentCtx, currentY: currentCtx.currentY + 5 }
}

const addExaminationSubsection = (ctx: PDFContext, title: string, findings: string[]): PDFContext => {
  const withPageCheck = checkAndAddPage(ctx, 30)
  
  // Subsection title
  withPageCheck.doc.setFontSize(10)
  withPageCheck.doc.setFont('helvetica', 'bold')
  withPageCheck.doc.text(title, withPageCheck.margin, withPageCheck.currentY)
  
  let currentY = withPageCheck.currentY + 5
  
  // Findings
  withPageCheck.doc.setFont('helvetica', 'normal')
  withPageCheck.doc.setFontSize(9)

  const finalY = findings.reduce((y, finding) => {
    if (y > 275) {
      withPageCheck.doc.addPage()
      y = 20
    }
    
    const lines = withPageCheck.doc.splitTextToSize(finding, withPageCheck.contentWidth)
    return lines.reduce((lineY: number, line: string) => {
      withPageCheck.doc.text(line, withPageCheck.margin, lineY)
      return lineY + 3.5
    }, y)
  }, currentY)

  return { ...withPageCheck, currentY: finalY + 3 }
}

// Signature section
const addSignature = (ctx: PDFContext, note: MedicalNote): PDFContext => {
  const withPageCheck = checkAndAddPage(ctx, 80)
  let currentY = withPageCheck.currentY + 10

  // Signature section
  withPageCheck.doc.setFontSize(11)
  withPageCheck.doc.setFont('helvetica', 'bold')
  const signatureY = currentY

  // Left side - Doctor's Signature
  const leftX = withPageCheck.margin
  withPageCheck.doc.setTextColor(0, 0, 0)
  withPageCheck.doc.setFont('helvetica', 'normal')
  withPageCheck.doc.text('Doctor\'s Signature', leftX, signatureY)

  // Add signature image if available
  if (note.doctorSignature) {
    try {
      logger.info('📄 Adding signature to PDF:', !!note.doctorSignature)
      
      const signatureWidth = 40
      const signatureHeight = 20
      const signatureImageY = signatureY + 8

      withPageCheck.doc.addImage(
        note.doctorSignature,
        'PNG',
        leftX,
        signatureImageY,
        signatureWidth,
        signatureHeight
      )

      currentY = signatureImageY + signatureHeight + 5
    } catch (error) {
      logger.error('📄 Error adding signature to PDF:', error)
      withPageCheck.doc.text('Digital signature uploaded', leftX, signatureY + 8)
      currentY = signatureY + 15
    }
  } else {
    withPageCheck.doc.setDrawColor(200, 200, 200)
    withPageCheck.doc.setFillColor(250, 250, 250)
    withPageCheck.doc.rect(leftX, signatureY + 8, 40, 20)
    withPageCheck.doc.setTextColor(150, 150, 150)
    withPageCheck.doc.setFontSize(8)
    withPageCheck.doc.text('Signature space', leftX + 2, signatureY + 20)
    currentY = signatureY + 30
  }

  // Doctor name and registration
  withPageCheck.doc.setTextColor(0, 0, 0)
  withPageCheck.doc.setFontSize(10)
  withPageCheck.doc.setFont('helvetica', 'bold')
  const doctorName = note.doctorName || 'Dr. [Name]'
  const displayName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`
  withPageCheck.doc.text(displayName, leftX, currentY)
  currentY += 4

  withPageCheck.doc.setFontSize(8)
  withPageCheck.doc.setFont('helvetica', 'normal')
  const regNumber = note.doctorRegistrationNo ? 
    `Reg. No: ${note.doctorRegistrationNo}` : 
    'Reg. No: [Registration Number]'
  withPageCheck.doc.text(regNumber, leftX, currentY)

  // Right side - Date and Stamp
  const rightX = withPageCheck.margin + 110
  withPageCheck.doc.text('Date', rightX, signatureY)
  withPageCheck.doc.setFontSize(10)
  withPageCheck.doc.text(new Date().toLocaleDateString(), rightX, signatureY + 5)

  withPageCheck.doc.setFontSize(8)
  withPageCheck.doc.setFont('helvetica', 'bold')
  withPageCheck.doc.text('Official Stamp', rightX, signatureY + 15)

  // Add stamp image if available
  if (note.doctorStamp) {
    try {
      logger.info('📄 Adding stamp to PDF:', !!note.doctorStamp)
      
      const stampWidth = 30
      const stampHeight = 20
      const stampImageY = signatureY + 20

      withPageCheck.doc.addImage(
        note.doctorStamp,
        'PNG',
        rightX,
        stampImageY,
        stampWidth,
        stampHeight
      )
      
      logger.info('📄 Stamp added successfully to PDF')
    } catch (error) {
      logger.error('📄 Error adding stamp to PDF:', error)
      withPageCheck.doc.setDrawColor(200, 200, 200)
      withPageCheck.doc.setFillColor(250, 250, 250)
      withPageCheck.doc.rect(rightX, signatureY + 20, 30, 20)
      withPageCheck.doc.setTextColor(150, 150, 150)
      withPageCheck.doc.setFontSize(8)
      withPageCheck.doc.text('Stamp space', rightX + 2, signatureY + 32)
    }
  } else {
    withPageCheck.doc.setDrawColor(200, 200, 200)
    withPageCheck.doc.setFillColor(250, 250, 250)
    withPageCheck.doc.rect(rightX, signatureY + 20, 30, 20)
    withPageCheck.doc.setTextColor(150, 150, 150)
    withPageCheck.doc.setFontSize(8)
    withPageCheck.doc.text('Stamp space', rightX + 2, signatureY + 32)
  }

  return { ...withPageCheck, currentY: Math.max(currentY, signatureY + 40) }
}

// Main export functions
export const generateAndDownloadPDF = (note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): void => {
  const pdf = generatePDF(note, practiceInfo, patientName)
  const filename = `medical-note-${patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
}

// For backward compatibility
export class MedicalNotePDFGenerator {
  static generateAndDownload(note: MedicalNote, practiceInfo: PracticeInfo, patientName: string): void {
    generateAndDownloadPDF(note, practiceInfo, patientName)
  }
} 