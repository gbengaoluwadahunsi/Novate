"use client"

import React from 'react'
import CustomMedicalDiagram from './custom-medical-diagram'

// Types for medical diagram data
export interface SymptomData {
  name: string
  bodyPart: string
  severity: 'mild' | 'moderate' | 'severe'
  coordinates: {
    x: number
    y: number
  }
  description?: string
  duration?: string
}

export interface MedicalDiagramData {
  symptoms: SymptomData[]
  patientInfo?: {
    age?: number
    gender?: 'male' | 'female'
    conditions?: string[]
  }
}

interface NovateMedicalDiagramProps {
  data: MedicalDiagramData
  gender: 'male' | 'female'
  view?: 'front' | 'back' | 'leftside' | 'rightside' | 'cardiorespiratory' | 'abdominal'
  showControls?: boolean
  className?: string
  onSymptomClick?: (symptom: any) => void
  onAnalysisComplete?: (analysis: any) => void
  medicalText?: string
}

const NovateMedicalDiagram: React.FC<NovateMedicalDiagramProps> = ({
  data,
  gender,
  view = 'front',
  showControls = true,
  className = '',
  onSymptomClick,
  onAnalysisComplete,
  medicalText
}) => {
  // Convert our data format to match CustomMedicalDiagram expectations
  const convertedData = React.useMemo(() => {
    if (!data || !data.symptoms) return { symptoms: [], patientInfo: { age: 0, gender } }
    
    return {
      symptoms: data.symptoms.map(symptom => ({
        name: symptom.name,
        bodyPart: symptom.bodyPart,
        severity: symptom.severity,
        description: symptom.description,
        duration: symptom.duration
      })),
      patientInfo: {
        age: data.patientInfo?.age || 0,
        gender: data.patientInfo?.gender || gender,
        conditions: data.patientInfo?.conditions || []
      }
    }
  }, [data, gender])

  return (
    <CustomMedicalDiagram
      data={convertedData}
      gender={gender}
      view={view}
      showControls={showControls}
      className={className}
      onSymptomClick={onSymptomClick}
    />
  )
}

export default NovateMedicalDiagram