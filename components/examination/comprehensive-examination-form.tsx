"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Heart, 
  Activity, 
  Save, 
  RotateCw, 
  Download, 
  Stethoscope,
  Eye,
  Brain,
  Wind
} from 'lucide-react'
import { ExaminationTemplate, createEmptyExaminationTemplate } from '@/types/examination'
import NovateMedicalDiagram, { MedicalDiagramData, SymptomData } from '@/components/medical-diagram/novate-medical-diagram'

interface PatientInfo {
  name: string
  age: string
  sex: string
  id: string
}

interface ComprehensiveExaminationFormProps {
  initialData?: ExaminationTemplate
  onSave: (examination: ExaminationTemplate) => void
  patientInfo: PatientInfo
}

export default function ComprehensiveExaminationForm({
  initialData,
  onSave,
  patientInfo
}: ComprehensiveExaminationFormProps) {
  
  const [examinationData, setExaminationData] = useState<ExaminationTemplate>(
    initialData || createEmptyExaminationTemplate()
  )
  
  const [activeTab, setActiveTab] = useState("general")
  const [medicalDiagramData, setMedicalDiagramData] = useState<MedicalDiagramData | null>(null)
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomData | null>(null)

  // Convert examination findings to medical diagram data
  const convertToMedicalDiagramData = (): MedicalDiagramData => {
    const symptoms: SymptomData[] = []
    
    // Extract symptoms from different examination sections
    const extractSymptoms = (section: any, sectionName: string) => {
      if (typeof section === 'object' && section !== null) {
        Object.entries(section).forEach(([key, value]) => {
          if (typeof value === 'string' && value.trim() && value !== 'Normal' && value !== 'No abnormality detected') {
            // Simple heuristic to map findings to body parts
            const bodyPart = mapFindingToBodyPart(key, sectionName)
            const severity = determineSeverity(value)
            const coordinates = getBodyPartCoordinates(bodyPart)
            
            symptoms.push({
              name: `${key}: ${value}`,
              bodyPart,
              severity,
              coordinates,
              description: `${sectionName} - ${key}`,
              duration: 'Current examination'
            })
          }
        })
      }
    }

    // Extract from different examination sections
    if (examinationData.GeneralExamination) {
      extractSymptoms(examinationData.GeneralExamination, 'General Examination')
    }
    if (examinationData.CVSRespExamination) {
      extractSymptoms(examinationData.CVSRespExamination, 'Cardiovascular & Respiratory')
    }

    if (examinationData.AbdominalInguinalExamination) {
      extractSymptoms(examinationData.AbdominalInguinalExamination, 'Abdominal & Inguinal')
    }
    if (examinationData.GEI) {
      extractSymptoms(examinationData.GEI, 'General Examination Inspection')
    }

    return {
      symptoms,
      patientInfo: {
        age: parseInt(patientInfo.age) || 0,
        gender: patientInfo.sex.toLowerCase() === 'female' ? 'female' : 'male',
        conditions: []
      }
    }
  }

  // Helper function to map findings to body parts
  const mapFindingToBodyPart = (finding: string, section: string): string => {
    const findingLower = finding.toLowerCase()
    
    // Cardiovascular mappings
    if (section.includes('Cardiovascular') || findingLower.includes('heart') || findingLower.includes('cardiac')) {
      return 'chest'
    }
    
    // Respiratory mappings
    if (section.includes('Respiratory') || findingLower.includes('lung') || findingLower.includes('breath')) {
      return 'chest'
    }
    
    // Abdominal mappings
    if (section.includes('Abdominal') || findingLower.includes('abdomen') || findingLower.includes('stomach')) {
      return 'abdomen'
    }
    
    // Neurological mappings
    if (section.includes('Neurological') || findingLower.includes('neuro') || findingLower.includes('reflex')) {
      return 'head'
    }
    
    // Head and neck
    if (findingLower.includes('head') || findingLower.includes('neck') || findingLower.includes('throat')) {
      return 'head'
    }
    
    // Extremities
    if (findingLower.includes('arm') || findingLower.includes('hand') || findingLower.includes('finger')) {
      return 'upper_extremity'
    }
    
    if (findingLower.includes('leg') || findingLower.includes('foot') || findingLower.includes('toe')) {
      return 'lower_extremity'
    }
    
    return 'general'
  }

  // Helper function to determine severity
  const determineSeverity = (finding: string): 'mild' | 'moderate' | 'severe' => {
    const findingLower = finding.toLowerCase()
    
    if (findingLower.includes('severe') || findingLower.includes('acute') || findingLower.includes('significant')) {
      return 'severe'
    }
    
    if (findingLower.includes('moderate') || findingLower.includes('notable') || findingLower.includes('marked')) {
      return 'moderate'
    }
    
    return 'mild'
  }

  // Helper function to get coordinates for body parts
  const getBodyPartCoordinates = (bodyPart: string): { x: number; y: number } => {
    const coordinates: Record<string, { x: number; y: number }> = {
      head: { x: 0.5, y: 0.15 },
      neck: { x: 0.5, y: 0.25 },
      chest: { x: 0.5, y: 0.35 },
      abdomen: { x: 0.5, y: 0.55 },
      upper_extremity: { x: 0.25, y: 0.4 },
      lower_extremity: { x: 0.5, y: 0.75 },
      general: { x: 0.5, y: 0.5 }
    }
    
    return coordinates[bodyPart] || coordinates.general
  }

  // Update medical diagram data when examination data changes
  useEffect(() => {
    const diagramData = convertToMedicalDiagramData()
    setMedicalDiagramData(diagramData)
  }, [examinationData, patientInfo])

  // Helper function to update nested examination data
  const updateExaminationField = (section: keyof ExaminationTemplate, field: string, value: string) => {
    setExaminationData(prev => {
      const currentSection = prev[section] as Record<string, any> || {}
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      }
    })
  }

  const handleSave = () => {
    onSave(examinationData)
  }

  const handleSymptomClick = (symptom: SymptomData) => {
    setSelectedSymptom(symptom)
    // You could also navigate to the relevant examination section here
  }

  const renderExaminationSection = (
    title: string,
    sectionKey: keyof ExaminationTemplate,
    fields: Array<{ key: string; label: string; type?: 'input' | 'textarea' | 'select'; options?: string[] }>
  ) => {
    const sectionData = examinationData[sectionKey] as any
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <Label htmlFor={`${sectionKey}-${field.key}`}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={`${sectionKey}-${field.key}`}
                  value={sectionData?.[field.key] || ''}
                  onChange={(e) => updateExaminationField(sectionKey, field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={sectionData?.[field.key] || ''}
                  onValueChange={(value) => updateExaminationField(sectionKey, field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`${sectionKey}-${field.key}`}
                  value={sectionData?.[field.key] || ''}
                  onChange={(e) => updateExaminationField(sectionKey, field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Patient Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Name</Label>
              <p className="font-medium">{patientInfo.name}</p>
            </div>
            <div>
              <Label>Age</Label>
              <p className="font-medium">{patientInfo.age}</p>
            </div>
            <div>
              <Label>Sex</Label>
              <p className="font-medium">{patientInfo.sex}</p>
            </div>
            <div>
              <Label>Patient ID</Label>
              <p className="font-medium">{patientInfo.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical Diagram Visualization */}
        <div className="lg:col-span-1">
          <NovateMedicalDiagram
            data={medicalDiagramData || { symptoms: [], patientInfo: { age: 0, gender: 'male' } }}
            gender={patientInfo.sex.toLowerCase() === 'female' ? 'female' : 'male'}
            onSymptomClick={handleSymptomClick}
            showControls={true}
          />
          
          {selectedSymptom && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Selected Finding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Finding:</strong> {selectedSymptom.name}</p>
                  <p><strong>Location:</strong> {selectedSymptom.bodyPart}</p>
                  <p><strong>Severity:</strong> 
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        selectedSymptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                        selectedSymptom.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedSymptom.severity}
                    </Badge>
                  </p>
                  {selectedSymptom.description && (
                    <p><strong>Description:</strong> {selectedSymptom.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Examination Form */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="cardio">Cardio/Resp</TabsTrigger>
              <TabsTrigger value="abdomen">Abdomen</TabsTrigger>
              <TabsTrigger value="neuro">Inspection</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              {renderExaminationSection(
                "General Examination",
                "GeneralExamination",
                [
                  { key: "appearance", label: "General Appearance", type: "textarea" },
                  { key: "consciousness", label: "Consciousness Level", type: "select", options: ["Alert", "Drowsy", "Confused", "Unconscious"] },
                  { key: "orientation", label: "Orientation", type: "input" },
                  { key: "distress", label: "Signs of Distress", type: "textarea" },
                  { key: "hygiene", label: "Hygiene", type: "select", options: ["Good", "Fair", "Poor"] },
                  { key: "nutrition", label: "Nutritional Status", type: "select", options: ["Well-nourished", "Malnourished", "Obese"] }
                ]
              )}
            </TabsContent>

            <TabsContent value="cardio" className="space-y-4">
              {renderExaminationSection(
                "Cardiovascular & Respiratory System",
                "CVSRespExamination",
                [
                  { key: "inspection", label: "Inspection", type: "textarea" },
                  { key: "palpation", label: "Palpation", type: "textarea" },
                  { key: "auscultation", label: "Auscultation", type: "textarea" },
                  { key: "heartSounds", label: "Heart Sounds", type: "input" },
                  { key: "murmurs", label: "Murmurs", type: "input" },
                  { key: "peripheralPulses", label: "Peripheral Pulses", type: "textarea" }
                ]
              )}
            </TabsContent>



            <TabsContent value="abdomen" className="space-y-4">
              {renderExaminationSection(
                "Abdominal & Inguinal Examination",
                "AbdominalInguinalExamination",
                [
                  { key: "inspection", label: "Inspection", type: "textarea" },
                  { key: "auscultation", label: "Auscultation", type: "textarea" },
                  { key: "palpation", label: "Palpation", type: "textarea" },
                  { key: "percussion", label: "Percussion", type: "textarea" },
                  { key: "organomegaly", label: "Organomegaly", type: "input" },
                  { key: "bowelSounds", label: "Bowel Sounds", type: "input" }
                ]
              )}
            </TabsContent>

            <TabsContent value="neuro" className="space-y-4">
              {renderExaminationSection(
                "General Examination Inspection",
                "GEI",
                [
                  { key: "mentalStatus", label: "Mental Status", type: "textarea" },
                  { key: "cranialNerves", label: "Cranial Nerves", type: "textarea" },
                  { key: "motorSystem", label: "Motor System", type: "textarea" },
                  { key: "sensorySystem", label: "Sensory System", type: "textarea" },
                  { key: "reflexes", label: "Reflexes", type: "textarea" },
                  { key: "coordination", label: "Coordination", type: "input" }
                ]
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Examination
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}