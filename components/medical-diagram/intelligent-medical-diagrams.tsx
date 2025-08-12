"use client"

import React, { useMemo } from 'react'
import CustomMedicalDiagram from './custom-medical-diagram'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Activity } from "lucide-react"
import { getBestViewForBodyPart } from '@/data/medical-coordinates'

interface IntelligentMedicalDiagramsProps {
  examinationData: {
    generalExamination?: string
    cardiovascularExamination?: string
    respiratoryExamination?: string
    abdominalExamination?: string
    otherSystemsExamination?: string
    chiefComplaint?: string
    historyOfPresentingIllness?: string
  }
  patientGender: 'male' | 'female'
  className?: string
}

// Body part mapping for different anatomical regions
const BODY_PART_MAPPINGS = {
  // Head and Neck (Front view)
  head: ['head', 'face', 'forehead', 'temple', 'scalp', 'skull', 'cranium'],
  neck: ['neck', 'throat', 'cervical', 'thyroid', 'lymph nodes'],
  eyes: ['eye', 'eyes', 'vision', 'pupil', 'eyelid', 'conjunctiva'],
  ears: ['ear', 'ears', 'hearing', 'tympanic', 'auditory'],
  nose: ['nose', 'nasal', 'nostril', 'sinus', 'smell'],
  mouth: ['mouth', 'oral', 'tongue', 'teeth', 'gums', 'lips', 'jaw'],
  
  // Chest and Arms (Front view)
  chest: ['chest', 'breast', 'pectoral', 'sternum', 'ribs'],
  heart: ['heart', 'cardiac', 'cardiovascular', 'pulse', 'murmur', 'rhythm', 'mitral', 'aortic', 'tricuspid', 'pulmonary', 'valve', 'heave', 'thrill'],
  lungs: ['lung', 'lungs', 'respiratory', 'breathing', 'wheeze', 'cough', 'dyspnea', 'fremitus', 'percussion', 'auscultation', 'expansion'],
  arms: ['arm', 'arms', 'shoulder', 'elbow', 'wrist', 'hand', 'fingers'],
  carotid: ['carotid', 'jugular', 'JVP', 'neck vessels', 'pulse'],
  trachea: ['trachea', 'windpipe', 'suprasternal', 'notch'],
  
  // Abdomen (Front view or Abdominal specialized view)
  abdomen: ['abdomen', 'abdominal', 'stomach', 'belly', 'navel', 'umbilical'],
  liver: ['liver', 'hepatic', 'hepatomegaly'],
  kidney: ['kidney', 'renal', 'flank'],
  bowel: ['bowel', 'intestine', 'colon', 'rectum'],
  
  // Back and Spine (Back view)
  back: ['back', 'spine', 'spinal', 'vertebra', 'lumbar', 'thoracic', 'cervical'],
  buttocks: ['buttock', 'buttocks', 'gluteal', 'sacrum', 'coccyx'],
  
  // Legs (Front/Back view)
  legs: ['leg', 'legs', 'thigh', 'knee', 'calf', 'ankle', 'foot', 'feet', 'toes'],
  
  // Right side specific
  right_arm: ['right arm', 'right shoulder', 'right elbow', 'right wrist', 'right hand'],
  right_leg: ['right leg', 'right thigh', 'right knee', 'right calf', 'right ankle', 'right foot'],
  
  // Left side specific  
  left_arm: ['left arm', 'left shoulder', 'left elbow', 'left wrist', 'left hand'],
  left_leg: ['left leg', 'left thigh', 'left knee', 'left calf', 'left ankle', 'left foot'],
  
  // Genitourinary (Front view)
  genitalia: ['genital', 'genitalia', 'penis', 'testicle', 'scrotum', 'vagina', 'vulva'],
  groin: ['groin', 'inguinal', 'hernia'],
  
  // Skin (can be any view)
  skin: ['skin', 'rash', 'lesion', 'bruise', 'cut', 'wound', 'scar', 'mole']
}

// View priority mapping - which views to show for different body parts
const VIEW_PRIORITIES = {
  front: ['head', 'neck', 'eyes', 'ears', 'nose', 'mouth', 'chest', 'arms', 'abdomen', 'legs', 'genitalia', 'groin'],
  back: ['back', 'buttocks', 'spine'],
  rightside: ['right_arm', 'right_leg', 'spine'],
  leftside: ['left_arm', 'left_leg'],
  cardiorespiratory: ['heart', 'lungs', 'chest', 'carotid', 'trachea'],
  abdominal: ['abdomen', 'liver', 'kidney', 'bowel']
}

function analyzeExaminationText(text: string): string[] {
  const foundBodyParts: string[] = []
  const lowerText = text.toLowerCase()
  
  // Check each body part category
  Object.entries(BODY_PART_MAPPINGS).forEach(([bodyPart, keywords]) => {
    const found = keywords.some(keyword => lowerText.includes(keyword))
    if (found) {
      foundBodyParts.push(bodyPart)
    }
  })
  
  return foundBodyParts
}

function determineRequiredViews(bodyParts: string[]): string[] {
  const requiredViews = new Set<string>()
  
  // Check which views are needed based on body parts found
  Object.entries(VIEW_PRIORITIES).forEach(([view, viewBodyParts]) => {
    const hasRelevantBodyParts = bodyParts.some(bodyPart => 
      viewBodyParts.includes(bodyPart)
    )
    if (hasRelevantBodyParts) {
      requiredViews.add(view)
    }
  })
  
  // If no specific views found, default to front view
  if (requiredViews.size === 0) {
    requiredViews.add('front')
  }
  
  return Array.from(requiredViews)
}

function extractSymptomsFromText(text: string, bodyParts: string[]): any[] {
  const symptoms: any[] = []
  
  bodyParts.forEach(bodyPart => {
    const keywords = BODY_PART_MAPPINGS[bodyPart as keyof typeof BODY_PART_MAPPINGS] || []
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        // Try to determine severity from context
        let severity: 'mild' | 'moderate' | 'severe' = 'mild'
        if (text.toLowerCase().includes('severe') || text.toLowerCase().includes('intense')) {
          severity = 'severe'
        } else if (text.toLowerCase().includes('moderate') || text.toLowerCase().includes('significant')) {
          severity = 'moderate'
        }
        
        symptoms.push({
          name: keyword,
          bodyPart: bodyPart,
          severity: severity,
          description: `Found in examination: ${keyword}`,
          duration: 'current',
          region: bodyPart,
          type: 'condition'
        })
      }
    })
  })
  
  return symptoms
}

export default function IntelligentMedicalDiagrams({
  examinationData,
  patientGender,
  className = ""
}: IntelligentMedicalDiagramsProps) {
  
  const analysisResults = useMemo(() => {
    // Combine all examination text
    const allExaminationText = [
      examinationData.generalExamination,
      examinationData.cardiovascularExamination,
      examinationData.respiratoryExamination,
      examinationData.abdominalExamination,
      examinationData.otherSystemsExamination,
      examinationData.chiefComplaint,
      examinationData.historyOfPresentingIllness
    ].filter(Boolean).join(' ')
    
    // Analyze the text to find body parts mentioned
    const foundBodyParts = analyzeExaminationText(allExaminationText)
    
    // Determine which anatomical views to show
    const requiredViews = determineRequiredViews(foundBodyParts)
    
    // Extract symptoms for each view
    const symptoms = extractSymptomsFromText(allExaminationText, foundBodyParts)
    
    return {
      foundBodyParts,
      requiredViews,
      symptoms,
      hasFindings: foundBodyParts.length > 0
    }
  }, [examinationData])
  
  if (!analysisResults.hasFindings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Physical Examination Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No specific examination findings detected.</p>
            <p className="text-sm mt-2">Add examination details to see relevant anatomical diagrams.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Physical Examination Visualization
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">
              {analysisResults.foundBodyParts.length} areas identified
            </Badge>
            <Badge variant="outline">
              {analysisResults.requiredViews.length} views required
            </Badge>
            {analysisResults.foundBodyParts.map(bodyPart => (
              <Badge key={bodyPart} variant="secondary" className="text-xs">
                {bodyPart}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {analysisResults.requiredViews.map((view) => (
              <div key={view} className="space-y-4">
                <h3 className="font-medium text-center capitalize text-lg">
                  {view === 'cardiorespiratory' ? 'Cardio/Respiratory System' : 
                   view === 'abdominal' ? 'Abdominal System' : 
                   `${view} View`}
                </h3>
                <CustomMedicalDiagram
                  data={{
                    symptoms: analysisResults.symptoms,
                    patientInfo: {
                      age: 0,
                      gender: patientGender,
                      conditions: []
                    }
                  }}
                  gender={patientGender}
                  view={view as any}
                  showControls={false}
                  className="w-full max-w-4xl mx-auto"
                />
              </div>
            ))}
          </div>
          
          {/* Summary of findings */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Examination Analysis</h4>
            <div className="text-sm text-blue-700">
              <p>• <strong>Body areas identified:</strong> {analysisResults.foundBodyParts.join(', ')}</p>
              <p>• <strong>Anatomical views shown:</strong> {analysisResults.requiredViews.join(', ')}</p>
              <p>• <strong>Patient gender:</strong> {patientGender}</p>
              <p>• <strong>Symptoms mapped:</strong> {analysisResults.symptoms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}