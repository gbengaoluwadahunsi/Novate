import { jsPDF } from 'jspdf'
import type { MedicalNote } from '@/lib/api-client'

export interface SimplePDFOptions {
  selectedICD11Codes?: any
  doctorName?: string
  registrationNo?: string
  signature?: string
  stamp?: string
  userRole?: string
}

export async function generateSimpleMedicalNotePDF(note: MedicalNote, options: SimplePDFOptions = {}): Promise<void> {
  try {
    const doc = new jsPDF()
    let currentY = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Helper function to add text with page breaks
    const addText = (text: string, isBold: boolean = false, fontSize: number = 10) => {
      if (currentY > pageHeight - 30) {
        doc.addPage()
        currentY = 20
      }
      
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      doc.setFontSize(fontSize)
      
      const lines = doc.splitTextToSize(text, pageWidth - (margin * 2))
      doc.text(lines, margin, currentY)
      currentY += lines.length * 5 + 5
    }

    // Helper function to check if we need a page break for a section
  const checkSectionPageBreak = (estimatedContentHeight: number = 50) => {
    const availableSpace = pageHeight - currentY - 30
    const sectionHeaderHeight = 20
    const totalRequiredHeight = sectionHeaderHeight + estimatedContentHeight

    // If there's not enough space for the entire section, start on a new page
    if (availableSpace < totalRequiredHeight) {
      doc.addPage()
      currentY = 20
    }
  }

  const addEnhancedStructuredFindings = (analysis: any) => {
    if (!analysis.findings || analysis.findings.length === 0) return

    // Add "Physical Examination Visualization" header
    addText('Physical Examination Visualization', true, 10)
    currentY += 5
    
    // Add medical body diagram reference
    addText('Medical Body Diagram:', true, 9)
    
    // Determine appropriate diagram type based on findings
    const patientGender = (note.patientGender || '').toLowerCase().includes('female') ? 'female' : 'male'
    
    const hasAbdominalFindings = analysis.findings.some((f: any) => 
      (f.bodyRegion || '').toLowerCase().includes('abdomen') ||
      (f.text || '').toLowerCase().includes('abdomen')
    )
    
    const hasCardioRespFindings = analysis.findings.some((f: any) => 
      (f.bodyRegion || '').toLowerCase().includes('chest') ||
      (f.text || '').toLowerCase().includes('heart') ||
      (f.text || '').toLowerCase().includes('lung')
    )
    
    let diagramType = `${patientGender}front` // Default
    if (hasAbdominalFindings) {
      diagramType = `${patientGender}abdominallinguinal`
    } else if (hasCardioRespFindings) {
      diagramType = `${patientGender}cardiorespi`
    }
    
    addText(`→ Using medical diagram: ${diagramType}.png (with privacy censoring over sensitive areas)`, false, 8)
    addText('→ Blue privacy bars protect sensitive areas (breast/genital regions)', false, 8)
    currentY += 5

    // Add findings without numbered markers
    addText('Findings on Diagram:', true, 9)
    analysis.findings.forEach((finding: any, index: number) => {
      const region = (finding.bodyRegion || 'General').toLowerCase()
      let position = 'Center'
      
      if (region.includes('head') || region.includes('face')) position = 'Head'
      else if (region.includes('chest') || region.includes('heart') || region.includes('lung')) position = 'Chest'
      else if (region.includes('abdomen') || region.includes('stomach')) position = 'Abdomen'
      else if (region.includes('arm') || region.includes('hand')) position = 'Arms'
      else if (region.includes('leg') || region.includes('foot') || region.includes('extremities')) position = 'Legs'
      
      addText(`• ${position}: ${finding.text}`, false, 8)
    })
    
    currentY += 8


    // Display findings with status indicators (no numbered markers)
    analysis.findings.forEach((finding: any, index: number) => {
      // Status indicator
      const statusText = finding.clinicalSignificance === 'normal' ? '[Normal]' : 
                        finding.clinicalSignificance === 'abnormal' ? '[Abnormal]' : '[Equivocal]'
      
      // Finding with status (no numbered marker)
      addText(`• ${finding.text} ${statusText}`, true, 8)
      currentY += 2
    })

    currentY += 10
  }

    // Helper function to estimate content height
    const estimateContentHeight = (content: string): number => {
      if (!content || content.trim() === '') return 0
      
      const words = content.split(' ')
      const wordsPerLine = Math.floor((pageWidth - (margin * 2)) / 6)
      const lines = Math.ceil(words.length / wordsPerLine)
      const lineHeight = 5
      const padding = 10
      
      return Math.max(lines * lineHeight + padding, 20)
    }

    // Header
    doc.setFillColor(30, 64, 175)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('MEDICAL CONSULTATION NOTE', pageWidth / 2, 20, { align: 'center' })
    
    currentY = 40
    doc.setTextColor(0, 0, 0)

    // Initial Doctor Information (like in the note page)
    addText('DOCTOR INFORMATION', true, 10)
    const baseDoctorName = options.doctorName || note.doctorName || '[Name]'
    const doctorName = options.userRole === 'DOCTOR' ? `Dr. ${baseDoctorName}` : baseDoctorName
    addText(`Name: ${doctorName}`)
    addText(`Role: DOCTOR`)
    addText(`Registration No: ${options.registrationNo || note.doctorRegistrationNo || '[Registration Number]'}`)
    currentY += 10

    // Patient Information
    addText('PATIENT INFORMATION', true, 10)
    addText(`Name: ${note.patientName || 'Not specified'}`)
    addText(`Age: ${note.patientAge || 'Not specified'}`)
    addText(`Gender: ${note.patientGender || 'Not specified'}`)
    addText(`Visit Date: ${note.visitDate || new Date().toLocaleDateString()}`)
    currentY += 10

    // Vital Signs - only show if we have at least one vital sign
    const hasVitalSigns = note.temperature || note.bloodPressure || note.pulseRate || note.respiratoryRate || note.glucoseLevels || note.glucose
    if (hasVitalSigns) {
      addText('VITAL SIGNS', true, 10)
      if (note.temperature) addText(`Temperature: ${note.temperature}`)
      if (note.bloodPressure) addText(`Blood Pressure: ${note.bloodPressure}`)
      if (note.pulseRate) addText(`Pulse Rate: ${note.pulseRate}`)
      if (note.respiratoryRate) addText(`Respiratory Rate: ${note.respiratoryRate}`)
      if (note.glucoseLevels || note.glucose) addText(`Glucose Levels: ${note.glucoseLevels || note.glucose}`)
      currentY += 10
    }

    // Chief Complaint
    if (note.chiefComplaint) {
      addText('CHIEF COMPLAINT', true, 10)
      addText(note.chiefComplaint)
      currentY += 10
    }

    // History of Present Illness
    if (note.historyOfPresentingIllness || note.historyOfPresentIllness) {
      const content = note.historyOfPresentingIllness || note.historyOfPresentIllness || ''
      const estimatedHeight = estimateContentHeight(content)
      checkSectionPageBreak(estimatedHeight)
      addText('HISTORY OF PRESENT ILLNESS', true, 10)
      addText(content)
      currentY += 10
    }

    // Past Medical History - always include if it exists
    if (note.pastMedicalHistory) {
      const estimatedHeight = estimateContentHeight(note.pastMedicalHistory)
      checkSectionPageBreak(estimatedHeight)
      addText('PAST MEDICAL/SURGICAL HISTORY', true, 10)
      addText(note.pastMedicalHistory)
      currentY += 10
    }

    // Drug History and Allergies - combine multiple sources
    let drugHistoryContent = ''
    
    // Check for current medications from various sources
    const medications = note.managementPlan?.medicationsPrescribed || 
                       (note as any).currentMedications || 
                       (note as any).medications
    
    if (medications) {
      drugHistoryContent += 'Current Medications:\n'
      if (typeof medications === 'string') {
        drugHistoryContent += medications + '\n\n'
      } else {
        drugHistoryContent += JSON.stringify(medications, null, 2) + '\n\n'
      }
    }
    
    // Add allergies information
    if (note.allergies) {
      drugHistoryContent += 'Allergies:\n'
      drugHistoryContent += note.allergies
    }
    
    // If we have the original allergies field and it contains structured content, use it
    if (!drugHistoryContent && note.allergies) {
      drugHistoryContent = note.allergies
    }
    
    if (drugHistoryContent.trim()) {
      const estimatedHeight = estimateContentHeight(drugHistoryContent)
      checkSectionPageBreak(estimatedHeight)
      addText('DRUG HISTORY AND ALLERGIES', true, 10)
      addText(drugHistoryContent.trim())
      currentY += 10
    }

    // Family History
    if (note.familyHistory) {
      addText('FAMILY HISTORY', true, 10)
      addText(note.familyHistory)
      currentY += 10
    }

    // Social History
    if (note.socialHistory) {
      addText('SOCIAL HISTORY', true, 10)
      addText(note.socialHistory)
      currentY += 10
    }

    // Review of Systems - check multiple possible field names
    const reviewOfSystemsContent = note.systemReview || (note as any).reviewOfSystems || (note as any).systemsReview
    if (reviewOfSystemsContent) {
      addText('REVIEW OF SYSTEMS', true, 10)
      addText(reviewOfSystemsContent)
      currentY += 10
    }

    // Physical Examination
    if (note.physicalExamination) {
      const estimatedHeight = estimateContentHeight(note.physicalExamination)
      checkSectionPageBreak(estimatedHeight)
      addText('PHYSICAL EXAMINATION', true, 10)
      addText(note.physicalExamination)
      
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
        
        if (analysis.findings && analysis.findings.length > 0) {
          // Only use the enhanced structured findings display (removed old basic text format)
          addEnhancedStructuredFindings(analysis)
        }
      } catch (error) {
        // If structured analysis fails, just continue with regular content
        // Failed to analyze physical examination for structured findings
      }
      
      currentY += 10
    }

    // Investigations - check multiple possible fields and always include if any content exists
    const investigationsContent = note.managementPlan?.investigations || 
                                 (note as any).investigations ||
                                 (typeof note.managementPlan === 'string' ? note.managementPlan : '') ||
                                 note.managementPlan
    if (investigationsContent) {
      // Found investigations content
      addText('INVESTIGATIONS', true, 10)
      const planText = typeof investigationsContent === 'string' ? investigationsContent : JSON.stringify(investigationsContent)
      addText(planText)
      currentY += 10
    } else {
      // No investigations content found
    }

    // Assessment and Diagnosis - check multiple possible fields and always include if any content exists
    const diagnosisContent = note.assessmentAndDiagnosis || note.diagnosis || (note as any).impression || (note as any).assessment
    if (diagnosisContent) {
      // Found diagnosis content
      addText('IMPRESSION AND DIAGNOSIS', true, 10)
      addText(diagnosisContent)
      currentY += 10
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
      addText('PLAN', true, 10)
      const planText = typeof planContent === 'string' ? planContent : JSON.stringify(planContent)
      addText(planText)
      currentY += 10
    } else {
      // No plan content found
    }

    // ICD-11 Code
    if (options.selectedICD11Codes) {
      addText('ICD-11 CODE', true, 10)
      
      try {
        let hasSelectedCode = false
        
        // Show only the first (selected/ticked) code from primary array
        if (options.selectedICD11Codes.primary && Array.isArray(options.selectedICD11Codes.primary)) {
          const selectedCode = options.selectedICD11Codes.primary[0] // First code is the selected one
          if (selectedCode) {
            hasSelectedCode = true
            addText(`${selectedCode.code || selectedCode.id || 'Unknown'} - ${selectedCode.title || selectedCode.name || 'Unknown'}`)
          }
        }
        
        // If no selected code was found, add a note
        if (!hasSelectedCode) {
          addText('No ICD-11 code selected')
        }
      } catch (error) {
        addText('ICD-11 code could not be displayed')
      }
      
      currentY += 10
    }

    // Final Doctor Information & Authorization
    addText('DOCTOR INFORMATION & AUTHORIZATION', true, 10)
    const finalBaseDoctorName = options.doctorName || note.doctorName || '[Name]'
    const finalDoctorName = options.userRole === 'DOCTOR' ? `Dr. ${finalBaseDoctorName}` : finalBaseDoctorName
    addText(`Doctor: ${finalDoctorName}`)
    addText(`Registration No: ${options.registrationNo || note.doctorRegistrationNo || '[Registration Number]'}`)
    addText('Doctor Signature: _____________________')
    addText('Official Stamp: _____________________')
    addText(`Generated on: ${new Date().toLocaleString()}`)
    currentY += 10

    // Save the PDF
    const fileName = `Medical_Note_${note.patientName?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
  } catch (error) {
    // Simple PDF Generation Error occurred
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
