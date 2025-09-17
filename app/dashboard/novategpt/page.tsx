"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import NextImage from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { 
  Send, 
  Mic, 
  User, 
  Bot, 
  Loader2, 
  Clipboard, 
  Check, 
  Download, 
  FileText,
  Brain,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  History,
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  ArrowLeft,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/logger"
import { useNovateGPTLimits } from "@/hooks/use-novategpt-limits"
import QueryLimitExceededModal from "@/components/novategpt/query-limit-exceeded-modal"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Conversation type
type Conversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

  // Enhanced medical analysis responses
  const analyzeMedicalNote = (noteContext: string): string => {
    logger.info('Analyzing note context:', noteContext)
    
    // Extract information from the note context
    const lines = noteContext.split('\n')
    logger.info('Split lines:', lines)
    
    const patientInfo = lines.find(line => line.startsWith('Patient:'))?.replace('Patient:', '').trim() || 'Unknown'
    const age = lines.find(line => line.startsWith('Age:'))?.replace('Age:', '').trim() || 'N/A'
    const gender = lines.find(line => line.startsWith('Gender:'))?.replace('Gender:', '').trim() || 'N/A'
    const chiefComplaint = lines.find(line => line.startsWith('Chief Complaint:'))?.replace('Chief Complaint:', '').trim() || 'N/A'
    const diagnosis = lines.find(line => line.startsWith('Diagnosis:'))?.replace('Diagnosis:', '').trim() || 'N/A'
    
    logger.info('Extracted info:', { patientInfo, age, gender, chiefComplaint, diagnosis })

    // Generate comprehensive analysis based on the note content
    let analysis = `## Medical Note Analysis for ${patientInfo}\n\n`

    // Chief Complaint Analysis
    if (chiefComplaint !== 'N/A') {
      analysis += `### Chief Complaint Analysis\n`
      analysis += `**Presenting Issue:** ${chiefComplaint}\n\n`
      
      // Add specific analysis based on common complaints
      if (chiefComplaint.toLowerCase().includes('chest pain')) {
        analysis += `**Clinical Assessment:**\n`
        analysis += `- Consider cardiac, pulmonary, gastrointestinal, and musculoskeletal causes\n`
        analysis += `- Red flags: radiation to arm/jaw, shortness of breath, diaphoresis\n`
        analysis += `- Immediate evaluation recommended for concerning features\n\n`
      } else if (chiefComplaint.toLowerCase().includes('fever')) {
        analysis += `**Clinical Assessment:**\n`
        analysis += `- Evaluate for infectious etiology\n`
        analysis += `- Consider viral vs bacterial causes\n`
        analysis += `- Assess for systemic symptoms and complications\n\n`
      } else if (chiefComplaint.toLowerCase().includes('diarrhea')) {
        analysis += `**Clinical Assessment:**\n`
        analysis += `- Acute vs chronic diarrhea evaluation\n`
        analysis += `- Assess for dehydration and electrolyte imbalance\n`
        analysis += `- Consider infectious vs inflammatory causes\n\n`
      } else if (chiefComplaint.toLowerCase().includes('weakness') || chiefComplaint.toLowerCase().includes('drooping')) {
        analysis += `**Clinical Assessment:**\n`
        analysis += `- Evaluate for neurological causes including stroke, Bell's palsy, or other cranial nerve issues\n`
        analysis += `- Assess for facial asymmetry, arm drift, speech changes\n`
        analysis += `- Consider immediate neuroimaging if stroke suspected\n`
        analysis += `- Check for other stroke symptoms: numbness, confusion, vision changes\n\n`
      }
    }

    // Diagnosis Analysis
    if (diagnosis !== 'N/A') {
      analysis += `### Diagnosis Review\n`
      analysis += `**Current Diagnosis:** ${diagnosis}\n\n`
      
      // Add evidence-based recommendations
      if (diagnosis.toLowerCase().includes('stroke')) {
        analysis += `**Evidence-Based Recommendations:**\n`
        analysis += `- Immediate neuroimaging (CT/MRI) if not already performed\n`
        analysis += `- Consider thrombolysis if within time window\n`
        analysis += `- Secondary prevention: antiplatelet therapy, statins, BP control\n`
        analysis += `- Rehabilitation planning and follow-up care\n\n`
      } else if (diagnosis.toLowerCase().includes('diabetes')) {
        analysis += `**Evidence-Based Recommendations:**\n`
        analysis += `- Blood glucose monitoring and HbA1c testing\n`
        analysis += `- Lifestyle modifications: diet, exercise, weight management\n`
        analysis += `- Medication optimization based on guidelines\n`
        analysis += `- Regular screening for complications\n\n`
      } else if (diagnosis.toLowerCase().includes('hypertension')) {
        analysis += `**Evidence-Based Recommendations:**\n`
        analysis += `- Lifestyle modifications: DASH diet, sodium restriction\n`
        analysis += `- Medication selection based on comorbidities\n`
        analysis += `- Regular BP monitoring and follow-up\n`
        analysis += `- Cardiovascular risk assessment\n\n`
      }
    }

    // Patient Demographics Analysis
    analysis += `### Patient Demographics\n`
    analysis += `- **Age:** ${age} - Consider age-specific risk factors and screening recommendations\n`
    analysis += `- **Gender:** ${gender} - Gender-specific health considerations apply\n\n`

    // Follow-up Recommendations
    analysis += `### Recommended Follow-up Actions\n`
    analysis += `1. **Immediate:** Schedule appropriate follow-up based on diagnosis severity\n`
    analysis += `2. **Short-term:** Monitor response to treatment and adjust as needed\n`
    analysis += `3. **Long-term:** Preventive care and chronic disease management\n`
    analysis += `4. **Documentation:** Ensure complete medical record documentation\n\n`

    analysis += `### Clinical Decision Support\n`
    analysis += `- Review current clinical guidelines for this condition\n`
    analysis += `- Consider referral to specialists if indicated\n`
    analysis += `- Assess for potential complications and preventive measures\n`
    analysis += `- Ensure patient education and shared decision-making\n\n`

    analysis += `*This analysis is based on the provided medical note information. Always verify with current clinical guidelines and consider individual patient factors.*`

    logger.info('Final analysis length:', analysis.length)
    logger.info('Final analysis preview:', analysis.substring(0, 200) + '...')
    
    // Ensure we always return something
    if (!analysis || analysis.trim().length < 50) {
      return `## Medical Note Analysis\n\nI've received your medical note for **${patientInfo}**.\n\n**Quick Summary:**\n- Age: ${age}\n- Gender: ${gender}\n- Chief Complaint: ${chiefComplaint}\n- Diagnosis: ${diagnosis}\n\nHow can I help you analyze this medical note further?`
    }
    
    return analysis
  }

  // Generate contextual response based on conversation history
  const generateContextualResponse = (userInput: string, conversationHistory: Message[]): string => {
    logger.info('generateContextualResponse called with:', { userInput, historyLength: conversationHistory.length })
    
    // Find the original note context from the conversation
    const noteContext = conversationHistory.find(msg => 
      msg.role === "user" && msg.content.includes("Patient:") && msg.content.includes("Chief Complaint:")
    )?.content || ""

    logger.info('Note context found:', !!noteContext)

    if (!noteContext) {
      // If no note context, provide general medical information
      return sampleMedicalResponses[userInput] || 
        `I can provide evidence-based medical information and clinical decision support. Here's what I can help you with:

**Clinical Analysis:**
- Differential diagnosis for symptoms
- Evidence-based treatment recommendations
- Risk assessment and complications
- Clinical guideline interpretation

**Medical Information:**
- Drug interactions and side effects
- Laboratory value interpretation
- Imaging study recommendations
- Preventive care guidelines

**Documentation Support:**
- Note completeness review
- ICD-10 coding suggestions
- Follow-up planning
- Patient education materials

What specific medical question or clinical scenario would you like me to help you with?`
    }

    // Extract information from the note context
    const lines = noteContext.split('\n')
    const patientInfo = lines.find(line => line.startsWith('Patient:'))?.replace('Patient:', '').trim() || 'Unknown'
    const age = lines.find(line => line.startsWith('Age:'))?.replace('Age:', '').trim() || 'N/A'
    const gender = lines.find(line => line.startsWith('Gender:'))?.replace('Gender:', '').trim() || 'N/A'
    const chiefComplaint = lines.find(line => line.startsWith('Chief Complaint:'))?.replace('Chief Complaint:', '').trim() || 'N/A'
    const diagnosis = lines.find(line => line.startsWith('Diagnosis:'))?.replace('Diagnosis:', '').trim() || 'N/A'

    // Generate specific response based on user's question
    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('preventive') || lowerInput.includes('prevention')) {
      return generatePreventiveCareResponse(patientInfo, age, gender, chiefComplaint, diagnosis)
    } else if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
      return generateSummaryResponse(patientInfo, age, gender, chiefComplaint, diagnosis)
    } else if (lowerInput.includes('diagnosis') || lowerInput.includes('diagnostic')) {
      return generateDiagnosticResponse(patientInfo, age, gender, chiefComplaint, diagnosis)
    } else if (lowerInput.includes('treatment') || lowerInput.includes('therapy')) {
      // Check if user requested specific length
      const pageMatch = userInput.match(/(\d+)\s*pages?/i)
      const requestedPages = pageMatch ? parseInt(pageMatch[1]) : 1
      logger.info('Treatment request detected:', { userInput, pageMatch, requestedPages })
      return generateTreatmentResponse(patientInfo, age, gender, chiefComplaint, diagnosis, requestedPages)
    } else if (lowerInput.includes('follow-up') || lowerInput.includes('follow up')) {
      return generateFollowUpResponse(patientInfo, age, gender, chiefComplaint, diagnosis)
    } else {
      return generateGeneralResponse(userInput, patientInfo, age, gender, chiefComplaint, diagnosis)
    }
  }

  // Generate preventive care response
  const generatePreventiveCareResponse = (patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string): string => {
    let response = `## Preventive Care Recommendations for ${patientInfo}\n\n`
    
    if (chiefComplaint.toLowerCase().includes('sore throat')) {
      response += `### For Sore Throat Prevention:\n`
      response += `**Immediate Prevention:**\n`
      response += `- Practice good hand hygiene and avoid close contact with sick individuals\n`
      response += `- Stay hydrated and maintain adequate rest\n`
      response += `- Avoid smoking and exposure to irritants\n`
      response += `- Consider throat lozenges for symptom relief\n\n`
      
      response += `**Long-term Prevention:**\n`
      response += `- Strengthen immune system through balanced nutrition\n`
      response += `- Regular exercise and stress management\n`
      response += `- Annual flu vaccination\n`
      response += `- Regular dental check-ups (oral health affects throat health)\n\n`
    } else if (chiefComplaint.toLowerCase().includes('weakness') || chiefComplaint.toLowerCase().includes('drooping')) {
      response += `### For Stroke Prevention:\n`
      response += `**Immediate Prevention:**\n`
      response += `- Control blood pressure (target <140/90 mmHg)\n`
      response += `- Manage diabetes and cholesterol levels\n`
      response += `- Quit smoking and limit alcohol consumption\n`
      response += `- Regular physical activity (150 minutes/week)\n\n`
      
      response += `**Long-term Prevention:**\n`
      response += `- Mediterranean diet rich in fruits, vegetables, and omega-3 fatty acids\n`
      response += `- Regular cardiovascular exercise\n`
      response += `- Stress management and adequate sleep\n`
      response += `- Regular health screenings for cardiovascular risk factors\n\n`
    }
    
    response += `### General Preventive Care:\n`
    response += `- Annual physical examination\n`
    response += `- Age-appropriate cancer screenings\n`
    response += `- Vaccination updates\n`
    response += `- Dental and vision check-ups\n\n`
    
    response += `*These recommendations are based on current clinical guidelines. Individual recommendations may vary based on specific risk factors and medical history.*`
    
    return response
  }

  // Generate summary response
  const generateSummaryResponse = (patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string): string => {
    return `## Medical Note Summary for ${patientInfo}\n\n`
      + `**Patient Demographics:**\n`
      + `- Age: ${age}\n`
      + `- Gender: ${gender}\n\n`
      + `**Presenting Issue:**\n`
      + `- Chief Complaint: ${chiefComplaint}\n`
      + `- Current Diagnosis: ${diagnosis}\n\n`
      + `**Key Points:**\n`
      + `- Patient presents with ${chiefComplaint.toLowerCase()}\n`
      + `- Requires appropriate diagnostic evaluation\n`
      + `- Treatment plan should be individualized\n`
      + `- Follow-up care essential for optimal outcomes\n\n`
      + `*This summary provides an overview of the patient's current presentation and care needs.*`
  }

  // Generate diagnostic response
  const generateDiagnosticResponse = (patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string): string => {
    let response = `## Diagnostic Recommendations for ${patientInfo}\n\n`
    
    if (chiefComplaint.toLowerCase().includes('sore throat')) {
      response += `### Sore Throat Diagnostic Workup:\n`
      response += `**Immediate Evaluation:**\n`
      response += `- Throat examination for erythema, exudate, or swelling\n`
      response += `- Rapid strep test if bacterial infection suspected\n`
      response += `- Complete blood count if systemic symptoms present\n\n`
      
      response += `**Additional Testing (if indicated):**\n`
      response += `- Throat culture for antibiotic sensitivity\n`
      response += `- Monospot test for infectious mononucleosis\n`
      response += `- Imaging if abscess or deep space infection suspected\n\n`
    } else if (chiefComplaint.toLowerCase().includes('weakness') || chiefComplaint.toLowerCase().includes('drooping')) {
      response += `### Stroke Diagnostic Workup:\n`
      response += `**Immediate Evaluation:**\n`
      response += `- Non-contrast CT head (rule out hemorrhage)\n`
      response += `- MRI brain with diffusion-weighted imaging\n`
      response += `- Carotid ultrasound for carotid artery stenosis\n`
      response += `- ECG and cardiac monitoring for atrial fibrillation\n\n`
      
      response += `**Additional Testing:**\n`
      response += `- Complete blood count and coagulation studies\n`
      response += `- Lipid panel and glucose testing\n`
      response += `- Echocardiogram for cardiac source of embolism\n\n`
    }
    
    response += `### General Diagnostic Principles:\n`
    response += `- History and physical examination remain paramount\n`
    response += `- Order tests based on clinical suspicion\n`
    response += `- Consider cost-effectiveness and patient preferences\n`
    response += `- Follow evidence-based guidelines\n\n`
    
    response += `*These recommendations should be tailored to individual patient circumstances and clinical judgment.*`
    
    return response
  }

  // Generate treatment response
  const generateTreatmentResponse = (patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string, requestedPages: number = 1): string => {
    let response = `## Comprehensive Treatment Guide for ${patientInfo}\n\n`
    
    if (requestedPages > 1) {
      response += `*This is a detailed ${requestedPages}-page treatment guide covering all aspects of care.*\n\n`
    }
    
    if (chiefComplaint.toLowerCase().includes('weakness') || chiefComplaint.toLowerCase().includes('drooping') || diagnosis.toLowerCase().includes('stroke')) {
      response += `# Stroke Treatment Comprehensive Guide\n\n`
      
      // Page 1: Acute Management
      response += `## Page 1: Acute Stroke Management\n\n`
      response += `### Emergency Assessment & Stabilization\n`
      response += `**Immediate Actions (First 15 minutes):**\n`
      response += `- Activate stroke code/team\n`
      response += `- Assess airway, breathing, circulation (ABCs)\n`
      response += `- Obtain vital signs and neurological assessment (NIHSS)\n`
      response += `- Establish IV access (2 large bore IVs)\n`
      response += `- Draw blood samples: CBC, CMP, PT/PTT, glucose, troponin\n`
      response += `- Obtain ECG and chest X-ray\n`
      response += `- Blood pressure monitoring (avoid aggressive reduction initially)\n\n`
      
      response += `**Neuroimaging (Within 25 minutes):**\n`
      response += `- Non-contrast CT head (rule out hemorrhage)\n`
      response += `- CT angiography if large vessel occlusion suspected\n`
      response += `- MRI with DWI if available and time permits\n`
      response += `- Consider CT perfusion for extended window cases\n\n`
      
      response += `**Thrombolytic Therapy (Within 4.5 hours):**\n`
      response += `- Alteplase (tPA): 0.9 mg/kg IV (max 90mg)\n`
      response += `- 10% as bolus over 1 minute\n`
      response += `- Remaining 90% as infusion over 60 minutes\n`
      response += `- Contraindications: Recent surgery, bleeding, anticoagulation\n`
      response += `- Monitor for bleeding complications\n\n`
      
      if (requestedPages >= 2) {
        response += `## Page 2: Mechanical Interventions\n\n`
        response += `### Endovascular Therapy\n`
        response += `**Mechanical Thrombectomy (Within 24 hours):**\n`
        response += `- Large vessel occlusion (ICA, M1, M2 segments)\n`
        response += `- ASPECTS score ≥6 on CT or core infarct <70mL\n`
        response += `- Good collateral circulation\n`
        response += `- Pre-stroke mRS ≤1\n\n`
        
        response += `**Thrombectomy Devices:**\n`
        response += `- Stent retrievers (Solitaire, Trevo)\n`
        response += `- Aspiration catheters (Penumbra, Sofia)\n`
        response += `- Combined approach for optimal recanalization\n`
        response += `- Target: TICI 2b-3 recanalization\n\n`
        
        response += `**Post-Procedure Care:**\n`
        response += `- Neurological checks every 15 minutes x 2 hours\n`
        response += `- Blood pressure management (<180/105 mmHg)\n`
        response += `- Antiplatelet therapy after 24 hours\n`
        response += `- Monitor for reperfusion injury\n\n`
      }
      
      if (requestedPages >= 3) {
        response += `## Page 3: Medical Management\n\n`
        response += `### Blood Pressure Management\n`
        response += `**Acute Phase (First 24 hours):**\n`
        response += `- If NOT candidate for thrombolysis: Allow permissive hypertension\n`
        response += `- Target: <220/120 mmHg for ischemic stroke\n`
        response += `- If thrombolysis given: <180/105 mmHg\n`
        response += `- Avoid aggressive reduction (risk of hypoperfusion)\n\n`
        
        response += `**Antihypertensive Medications:**\n`
        response += `- Labetalol 10-20mg IV every 10-20 minutes\n`
        response += `- Nicardipine 5mg/hr IV, titrate by 2.5mg/hr every 5-15 minutes\n`
        response += `- Clevidipine 1-2mg/hr IV, double every 2-5 minutes\n`
        response += `- Avoid sublingual nifedipine (unpredictable drop)\n\n`
        
        response += `### Temperature Management\n`
        response += `- Target normothermia (36.5-37.5°C)\n`
        response += `- Treat fever aggressively (acetaminophen, cooling blankets)\n`
        response += `- Avoid hyperthermia (worsens neurological outcome)\n\n`
        
        response += `### Glucose Management\n`
        response += `- Target: 140-180 mg/dL\n`
        response += `- Avoid hypoglycemia (<70 mg/dL)\n`
        response += `- Insulin sliding scale for hyperglycemia\n`
        response += `- Monitor closely in diabetic patients\n\n`
      }
      
      if (requestedPages >= 4) {
        response += `## Page 4: Secondary Prevention\n\n`
        response += `### Antiplatelet Therapy\n`
        response += `**Acute Phase (After 24 hours if no bleeding):**\n`
        response += `- Aspirin 325mg daily x 2-4 weeks, then 81mg daily\n`
        response += `- Clopidogrel 600mg loading dose, then 75mg daily\n`
        response += `- Dual antiplatelet therapy for 21-90 days\n`
        response += `- Consider ticagrelor for high-risk patients\n\n`
        
        response += `### Statin Therapy\n`
        response += `**High-Intensity Statins:**\n`
        response += `- Atorvastatin 80mg daily OR\n`
        response += `- Rosuvastatin 40mg daily\n`
        response += `- Target LDL <70 mg/dL (ideally <50 mg/dL)\n`
        response += `- Monitor liver enzymes and CK\n\n`
        
        response += `### Anticoagulation (If Indicated)\n`
        response += `**Atrial Fibrillation:**\n`
        response += `- Start after 4-14 days (depending on stroke size)\n`
        response += `- DOACs preferred: apixaban, rivaroxaban, dabigatran\n`
        response += `- Warfarin if DOAC contraindicated (target INR 2-3)\n`
        response += `- Consider left atrial appendage closure if anticoagulation contraindicated\n\n`
      }
      
      if (requestedPages >= 5) {
        response += `## Page 5: Complications Management\n\n`
        response += `### Cerebral Edema\n`
        response += `**Recognition:**\n`
        response += `- Neurological deterioration within 24-48 hours\n`
        response += `- Headache, nausea, vomiting\n`
        response += `- Decreased level of consciousness\n`
        response += `- Signs of herniation\n\n`
        
        response += `**Management:**\n`
        response += `- Elevate head of bed 30 degrees\n`
        response += `- Osmotic therapy: mannitol 0.25-1 g/kg IV\n`
        response += `- Hypertonic saline 3% (30-60 mL bolus)\n`
        response += `- Consider decompressive craniectomy for large MCA infarcts\n`
        response += `- ICP monitoring if indicated\n\n`
        
        response += `### Hemorrhagic Transformation\n`
        response += `**Risk Factors:**\n`
        response += `- Large infarct size\n`
        response += `- Cardioembolic stroke\n`
        response += `- Anticoagulation use\n`
        response += `- Hypertension\n\n`
        
        response += `**Management:**\n`
        response += `- Stop antiplatelet/anticoagulant therapy\n`
        response += `- Blood pressure control\n`
        response += `- Consider surgical evacuation if symptomatic\n`
        response += `- Neurosurgical consultation\n\n`
      }
      
      if (requestedPages >= 6) {
        response += `## Page 6: Rehabilitation & Recovery\n\n`
        response += `### Acute Rehabilitation\n`
        response += `**Early Mobilization (Within 24-48 hours):**\n`
        response += `- Physical therapy assessment\n`
        response += `- Occupational therapy evaluation\n`
        response += `- Speech-language pathology if dysarthria/aphasia\n`
        response += `- Progressive mobility as tolerated\n\n`
        
        response += `### Swallowing Assessment\n`
        response += `- Bedside swallow evaluation\n`
        response += `- Video fluoroscopic swallow study if indicated\n`
        response += `- NPO until cleared by speech therapy\n`
        response += `- Consider PEG tube if prolonged dysphagia\n\n`
        
        response += `### Discharge Planning\n`
        response += `**Disposition Options:**\n`
        response += `- Home with outpatient therapy\n`
        response += `- Inpatient rehabilitation facility\n`
        response += `- Skilled nursing facility\n`
        response += `- Long-term acute care hospital\n\n`
      }
      
      if (requestedPages >= 7) {
        response += `## Page 7: Long-term Management\n\n`
        response += `### Risk Factor Modification\n`
        response += `**Hypertension:**\n`
        response += `- Target <130/80 mmHg\n`
        response += `- ACE inhibitors or ARBs preferred\n`
        response += `- Thiazide diuretics as second-line\n`
        response += `- Lifestyle modifications: DASH diet, exercise\n\n`
        
        response += `**Diabetes Management:**\n`
        response += `- Target HbA1c <7% (individualized)\n`
        response += `- Metformin first-line therapy\n`
        response += `- SGLT2 inhibitors for cardiovascular benefits\n`
        response += `- Regular ophthalmologic and podiatric care\n\n`
        
        response += `**Smoking Cessation:**\n`
        response += `- Counseling and behavioral interventions\n`
        response += `- Nicotine replacement therapy\n`
        response += `- Bupropion or varenicline if appropriate\n`
        response += `- Follow-up and support programs\n\n`
      }
      
      if (requestedPages >= 8) {
        response += `## Page 8: Monitoring & Follow-up\n\n`
        response += `### Laboratory Monitoring\n`
        response += `**Routine Labs (3-6 months):**\n`
        response += `- Lipid panel (LDL goal <70 mg/dL)\n`
        response += `- HbA1c if diabetic\n`
        response += `- Liver enzymes if on statin\n`
        response += `- INR if on warfarin (target 2-3)\n\n`
        
        response += `### Imaging Follow-up\n`
        response += `- MRI brain at 3 months to assess final infarct size\n`
        response += `- Carotid ultrasound if stenosis suspected\n`
        response += `- Echocardiogram if cardioembolic source\n`
        response += `- Holter monitor for paroxysmal atrial fibrillation\n\n`
        
        response += `### Specialist Referrals\n`
        response += `- Neurology follow-up in 1-3 months\n`
        response += `- Cardiology if cardiac source identified\n`
        response += `- Endocrinology for diabetes management\n`
        response += `- Psychiatry/psychology for post-stroke depression\n\n`
      }
      
      if (requestedPages >= 9) {
        response += `## Page 9: Special Considerations\n\n`
        response += `### Young Stroke (Age <50)\n`
        response += `**Additional Workup:**\n`
        response += `- Hypercoagulable studies\n`
        response += `- Autoimmune markers (ANA, anti-cardiolipin)\n`
        response += `- Drug screen\n`
        response += `- Genetic testing if family history\n\n`
        
        response += `### Pregnancy-Related Stroke\n`
        response += `- Preeclampsia/eclampsia evaluation\n`
        response += `- HELLP syndrome assessment\n`
        response += `- Peripartum cardiomyopathy screening\n`
        response += `- Multidisciplinary care with obstetrics\n\n`
        
        response += `### Cryptogenic Stroke\n`
        response += `- Extended cardiac monitoring (30-day event monitor)\n`
        response += `- Bubble study for PFO\n`
        response += `- Consider PFO closure in selected patients\n`
        response += `- Cancer screening if indicated\n\n`
      }
      
      if (requestedPages >= 10) {
        response += `## Page 10: Quality Measures & Outcomes\n\n`
        response += `### Quality Indicators\n`
        response += `**Process Measures:**\n`
        response += `- Door-to-needle time <60 minutes\n`
        response += `- Door-to-groin puncture time <90 minutes\n`
        response += `- Antithrombotic therapy by discharge\n`
        response += `- Statin therapy for LDL >100 mg/dL\n\n`
        
        response += `### Outcome Measures\n`
        response += `- Modified Rankin Scale at 90 days\n`
        response += `- Mortality rates\n`
        response += `- Length of stay\n`
        response += `- Readmission rates\n\n`
        
        response += `### Patient Education\n`
        response += `**Key Teaching Points:**\n`
        response += `- FAST signs of stroke recognition\n`
        response += `- Medication compliance importance\n`
        response += `- Risk factor modification\n`
        response += `- When to seek emergency care\n`
        response += `- Rehabilitation goals and expectations\n\n`
        
        response += `### Prognosis\n`
        response += `- 30% of patients achieve excellent recovery\n`
        response += `- 40% have mild to moderate disability\n`
        response += `- 30% have severe disability or death\n`
        response += `- Factors: age, stroke severity, time to treatment\n\n`
      }
    } else {
      // Default treatment for other conditions
      response += `### Treatment Overview\n`
      response += `**Immediate Management:**\n`
      response += `- Symptomatic relief measures\n`
      response += `- Appropriate medication therapy\n`
      response += `- Monitoring and follow-up\n\n`
      
      if (requestedPages > 1) {
        for (let i = 2; i <= Math.min(requestedPages, 5); i++) {
          response += `## Page ${i}: Additional Treatment Considerations\n\n`
          response += `### Advanced Management Options\n`
          response += `- Specialist consultation if indicated\n`
          response += `- Alternative therapies\n`
          response += `- Complication prevention\n`
          response += `- Long-term management strategies\n\n`
        }
      }
    }
    
    response += `\n---\n\n`
    response += `*This comprehensive treatment guide should be used in conjunction with current clinical guidelines and individualized patient assessment. Always consult with appropriate specialists and consider patient-specific factors when implementing treatment plans.*`
    
    return response
  }

  // Generate follow-up response
  const generateFollowUpResponse = (patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string): string => {
    let response = `## Follow-up Care Plan for ${patientInfo}\n\n`
    
    if (chiefComplaint.toLowerCase().includes('sore throat')) {
      response += `### Sore Throat Follow-up:\n`
      response += `**Immediate (48-72 hours):**\n`
      response += `- Re-evaluate if symptoms persist or worsen\n`
      response += `- Assess for complications (abscess, rheumatic fever)\n`
      response += `- Complete antibiotic course if prescribed\n\n`
      
      response += `**Short-term (1-2 weeks):**\n`
      response += `- Resolution of symptoms\n`
      response += `- Return to normal activities\n`
      response += `- Preventive measures education\n\n`
    } else if (chiefComplaint.toLowerCase().includes('weakness') || chiefComplaint.toLowerCase().includes('drooping')) {
      response += `### Stroke Follow-up:\n`
      response += `**Immediate (24-48 hours):**\n`
      response += `- Neurological monitoring\n`
      response += `- Swallowing assessment\n`
      response += `- Mobilization and rehabilitation planning\n\n`
      
      response += `**Short-term (1-4 weeks):**\n`
      response += `- Outpatient rehabilitation\n`
      response += `- Medication management\n`
      response += `- Risk factor modification\n\n`
      
      response += `**Long-term (3-12 months):**\n`
      response += `- Regular neurology follow-up\n`
      response += `- Cardiovascular risk management\n`
      response += `- Lifestyle modification support\n\n`
    }
    
    response += `### General Follow-up Principles:\n`
    response += `- Schedule appropriate intervals based on condition severity\n`
    response += `- Monitor treatment response and side effects\n`
    response += `- Address preventive care needs\n`
    response += `- Ensure patient understanding and compliance\n\n`
    
    response += `*Follow-up schedules should be individualized based on clinical judgment and patient needs.*`
    
    return response
  }

  // Generate general response
  const generateGeneralResponse = (userInput: string, patientInfo: string, age: string, gender: string, chiefComplaint: string, diagnosis: string): string => {
    return `## Response for ${patientInfo}\n\n`
      + `Based on your question about "${userInput}" and the medical note for ${patientInfo}:\n\n`
      + `**Patient Context:**\n`
      + `- Age: ${age}, Gender: ${gender}\n`
      + `- Chief Complaint: ${chiefComplaint}\n`
      + `- Current Diagnosis: ${diagnosis}\n\n`
      + `**Recommendation:**\n`
      + `I'd be happy to provide more specific information about this patient's case. You can ask me about:\n`
      + `- Preventive care recommendations\n`
      + `- Diagnostic workup\n`
      + `- Treatment options\n`
      + `- Follow-up planning\n`
      + `- Risk assessment\n\n`
      + `*Please specify what aspect of care you'd like me to focus on for this patient.*`
  }

  // Sample medical responses for demo
  const sampleMedicalResponses: { [key: string]: string } = {
    "What are the symptoms of diabetes?": "Common symptoms of diabetes include increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, blurred vision, slow-healing sores, and frequent infections. Type 1 diabetes symptoms can develop quickly, while Type 2 diabetes symptoms may develop gradually. However, some people with Type 2 diabetes may not experience any symptoms initially. It's important to consult with a healthcare professional for proper diagnosis and management.",
    
    "How to treat hypertension?": "Hypertension treatment typically involves lifestyle modifications and medication when necessary. Lifestyle changes include reducing sodium intake, following the DASH diet, regular physical activity, maintaining a healthy weight, limiting alcohol consumption, and quitting smoking. Medications may include ACE inhibitors, ARBs, calcium channel blockers, or diuretics. Treatment plans should be personalized based on individual risk factors and comorbidities. Regular monitoring and follow-up with healthcare providers is essential.",
    
    "What are the side effects of statins?": "Common side effects of statins include muscle pain and weakness, liver enzyme abnormalities, digestive problems, and increased blood sugar levels. Rare but serious side effects can include rhabdomyolysis (severe muscle breakdown), liver damage, and cognitive issues. Risk factors for side effects include older age, female gender, small body frame, kidney disease, and taking multiple medications. Regular monitoring of liver function and muscle symptoms is recommended.",
    
    "Explain chest pain differential diagnosis": "Chest pain differential diagnosis includes cardiac causes (angina, myocardial infarction), pulmonary causes (pneumonia, pulmonary embolism, pleurisy), gastrointestinal causes (GERD, esophageal spasm, peptic ulcer), musculoskeletal causes (costochondritis, muscle strain), and psychological causes (anxiety, panic attacks). Red flag symptoms requiring immediate attention include pain radiating to arm/jaw, shortness of breath, diaphoresis, and nausea. A thorough history and physical examination are crucial for accurate diagnosis."
  }

// Suggested medical prompts
const suggestedPrompts = [
  "What are the symptoms of diabetes?",
  "How to treat hypertension?",
  "What are the side effects of statins?",
  "Explain chest pain differential diagnosis",
  "What are the guidelines for managing type 2 diabetes?",
  "How should I document a patient with suspected COVID-19?",
  "What are the common drug interactions with Warfarin?",
  "Explain the latest hypertension treatment guidelines"
]

export default function NovateGPTPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [hasProcessedNote, setHasProcessedNote] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const processedContextRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { queryLimitInfo, updateAfterQuery, isLoading: limitsLoading } = useNovateGPTLimits()

  // Handle note context from URL parameter
  useEffect(() => {
    const noteContext = searchParams.get('note')
    logger.info('useEffect triggered - noteContext:', noteContext)
    
    if (noteContext) {
      const decodedContext = decodeURIComponent(noteContext)
      logger.info('Decoded context:', decodedContext)
      
      // Clear any existing messages and immediately process the note
      setMessages([])
      setHasProcessedNote(false)
      processedContextRef.current = null
      isProcessingRef.current = false
      
      // Process the note immediately
      const userMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "user",
        content: decodedContext,
        timestamp: new Date(),
      }
      
      logger.info('Adding user message immediately:', userMessage)
      setMessages([userMessage])
      setIsLoading(true)
      
      // Generate AI response
      setTimeout(() => {
        try {
          const analysis = analyzeMedicalNote(decodedContext)
          logger.info('Generated analysis:', analysis)
          
          const aiMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: "assistant",
            content: analysis || "I've received your medical note. How can I help you analyze it?",
            timestamp: new Date(),
          }
          
          logger.info('Adding AI response:', aiMessage)
          setMessages([userMessage, aiMessage])
          setIsLoading(false)
          setHasProcessedNote(true)
        } catch (error) {
          logger.error('Error processing note:', error)
          const errorMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: "assistant",
            content: "I received your medical note but encountered an error processing it. Please ask me any questions about the note.",
            timestamp: new Date(),
          }
          setMessages([userMessage, errorMessage])
          setIsLoading(false)
        }
      }, 1000)
    }
  }, [searchParams])



  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle upgrade to premium
  const handleUpgrade = () => {
    window.location.href = '/pricing'
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Check if user has reached query limit
    if (queryLimitInfo && !queryLimitInfo.canMakeQuery) {
      setShowLimitModal(true)
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      // Get authorization token
      const token = localStorage.getItem('token')
      
      // Call NovateGPT API with real OpenAI integration
      const response = await fetch('/api/novategpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages,
          medicalContext: processedContextRef.current
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle query limit exceeded
        if (response.status === 402 && data.needsUpgrade) {
          // Show the upgrade modal instead of just a toast
          setShowLimitModal(true)
          toast({
            title: "Query Limit Reached",
            description: data.details,
            variant: "destructive"
          })
        } else {
          throw new Error(data.details || data.error || 'Failed to get response')
        }
        return
      }

      // Update query limit info if provided
      if (data.queryLimitInfo) {
        updateAfterQuery(data.queryLimitInfo)
      }

      const aiMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: data.response || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiMessage])
      
    } catch (error) {
      logger.error('NovateGPT request error:', error)
      
      // Fallback to contextual response if API fails
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: generateContextualResponse(currentInput, messages),
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, fallbackMessage])
      
      toast({
        title: "Connection Issue",
        description: "Using offline mode. For full AI capabilities, please check your connection.",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  // Handle voice input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    setIsListening(true)

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast({
        title: "Speech Recognition Error",
        description: "There was an error processing your speech.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Handle copy to clipboard
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    })
  }

  // Handle new conversation
  const handleNewConversation = () => {
    logger.info('Starting new conversation - resetting all state')
    setMessages([])
    setCurrentConversationId(null)
    setHasProcessedNote(false)
    processedContextRef.current = null
    isProcessingRef.current = false
    inputRef.current?.focus()
  }

  // Handle download conversation
  const handleDownload = () => {
    if (messages.length === 0) return

    const text = messages.map((msg) => 
      `${msg.role === "user" ? "You" : "NovateGPT"}: ${msg.content}`
    ).join("\n\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `novategpt-conversation-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Conversation downloaded",
      description: "Your conversation has been downloaded as a text file.",
    })
  }

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                {/* NovateGPT Logo */}
                <NextImage 
                  src="/NovateGPT.png" 
                  alt="NovateGPT" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">NovateGPT</h1>
                  <p className="text-xs text-blue-500 dark:text-blue-300">Ask me anything!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Query Limit Display */}
              {queryLimitInfo && !limitsLoading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1">
                    <Brain className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      {queryLimitInfo.queriesLimit === Infinity 
                        ? 'Unlimited' 
                        : `${queryLimitInfo.remainingQueries}/${queryLimitInfo.queriesLimit}`
                      }
                    </span>
                  </div>
                  {queryLimitInfo.queriesLimit !== Infinity && (
                    <div className="w-12 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                        style={{ 
                          width: `${Math.max(0, (queryLimitInfo.remainingQueries / queryLimitInfo.queriesLimit) * 100)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNewConversation}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Query Limit Warning */}
        <AnimatePresence>
          {queryLimitInfo && !limitsLoading && queryLimitInfo.queriesLimit !== Infinity && queryLimitInfo.remainingQueries <= 1 && queryLimitInfo.remainingQueries > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-4"
            >
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 relative">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm pr-8">
                  <strong>Query Limit Warning:</strong> You have {queryLimitInfo.remainingQueries} query{queryLimitInfo.remainingQueries !== 1 ? 'ies' : ''} remaining this month.
                  {queryLimitInfo.needsUpgrade && (
                    <span> Consider upgrading your subscription for unlimited access.</span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer Alert */}
        <AnimatePresence>
          {showDisclaimer && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mt-4"
            >
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 relative">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm pr-8">
                  <strong>Medical Information Disclaimer:</strong> NovateGPT provides general medical information for healthcare professionals. 
                  This is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for patient care decisions.
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDisclaimer(false)}
                  className="absolute top-2 right-2 h-6 w-6 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              {/* NovateGPT Logo */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <NextImage 
                    src="/NovateGPT.png" 
                    alt="NovateGPT" 
                    width={80} 
                    height={80} 
                    className="rounded-lg"
                  />
                </div>
                                  <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">NovateGPT</h2>
                  <p className="text-blue-500 dark:text-blue-300 font-medium">Ask me anything!</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your AI-powered medical information assistant. Ask me anything about medical conditions, 
                treatments, guidelines, or clinical documentation.
              </p>
              
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl">
                {suggestedPrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm">{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className={message.role === "assistant" ? "border border-blue-300" : ""}>
                      {message.role === "user" ? (
                        <AvatarFallback className="bg-gradient-to-r from-coral-500 to-cyan-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                          <NextImage 
                            src="/NovateGPT.png" 
                            alt="NovateGPT" 
                            width={20} 
                            height={20} 
                            className="rounded-sm"
                          />
                        </div>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className={`font-bold text-sm ${message.role === "user" ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`}>
                          {message.role === "user" ? "You" : "NovateGPT"}
                        </div>
                        <div className={`text-xs font-medium ${message.role === "user" ? "text-gray-500 dark:text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      </div>
                                              <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                          {message.role === "assistant" ? (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h2: ({children}) => <h2 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200">{children}</h3>,
                                p: ({children}) => <p className="mb-2 text-gray-700 dark:text-gray-300">{children}</p>,
                                strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                li: ({children}) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-medium text-base leading-relaxed">{message.content}</div>
                          )}
                        </div>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 h-7 text-xs opacity-70 hover:opacity-100"
                          onClick={() => handleCopy(message.id, message.content)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Clipboard className="h-3 w-3 mr-1" />
                          )}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="border border-blue-300">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                        <NextImage 
                          src="/NovateGPT.png" 
                          alt="NovateGPT" 
                          width={20} 
                          height={20} 
                          className="rounded-sm"
                        />
                      </div>
                    </Avatar>
                    <div className="rounded-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">NovateGPT is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={
                  queryLimitInfo && !queryLimitInfo.canMakeQuery 
                    ? "Query limit reached. Please upgrade to continue."
                    : "Ask NovateGPT about medical information..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isListening || (queryLimitInfo && !queryLimitInfo.canMakeQuery)}
                className="pr-20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening || (queryLimitInfo && !queryLimitInfo.canMakeQuery)}
                  className="h-6 w-6"
                >
                  {isListening ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading || (queryLimitInfo && !queryLimitInfo.canMakeQuery)}
              className="bg-gradient-to-r from-coral-500 to-cyan-500 hover:from-coral-600 hover:to-cyan-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            NovateGPT can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>

      {/* Query Limit Exceeded Modal */}
      {queryLimitInfo && (
        <QueryLimitExceededModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onUpgrade={handleUpgrade}
          queryLimitInfo={queryLimitInfo}
        />
      )}
    </div>
  )
} 