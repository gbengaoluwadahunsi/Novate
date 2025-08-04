"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Heart, 
  Stethoscope, 
  User, 
  Eye, 
  HeartHandshake,
  Save,
  Clock
} from "lucide-react"
import { ExaminationTemplate, createEmptyExaminationTemplate } from "@/types/examination"
import AnatomicalDiagram from "./anatomical-diagram"
import CVSRespiratoryDiagram from "./cvs-respiratory-diagram"
import AbdominalDiagram from "./abdominal-diagram"

interface ComprehensiveExaminationFormProps {
  initialData?: ExaminationTemplate
  onSave: (data: ExaminationTemplate) => void
  patientInfo?: {
    name: string
    age: string
    sex: string
    id: string
  }
}

export default function ComprehensiveExaminationForm({
  initialData,
  onSave,
  patientInfo
}: ComprehensiveExaminationFormProps) {
  const [examinationData, setExaminationData] = useState<ExaminationTemplate>(
    initialData || createEmptyExaminationTemplate()
  )

  // Auto-populate patient info if provided
  useState(() => {
    if (patientInfo) {
      setExaminationData(prev => ({
        ...prev,
        GeneralExamination: {
          ...prev.GeneralExamination,
          PatientInfo: {
            ...prev.GeneralExamination.PatientInfo,
            Name: patientInfo.name,
            Age: patientInfo.age,
            Sex: patientInfo.sex,
            ID: patientInfo.id
          }
        },
        CVSRespExamination: {
          ...prev.CVSRespExamination,
          PatientInfo: {
            ...prev.CVSRespExamination.PatientInfo,
            Name: patientInfo.name,
            Age: patientInfo.age,
            Sex: patientInfo.sex,
            ID: patientInfo.id
          }
        }
      }))
    }
  })

  const updateVitalSigns = (field: keyof typeof examinationData.VitalSigns, value: string | object) => {
    setExaminationData(prev => ({
      ...prev,
      VitalSigns: {
        ...prev.VitalSigns,
        [field]: value
      }
    }))
  }

  const updateGeneralExamination = (section: keyof typeof examinationData.GeneralExamination, field: string, value: string) => {
    setExaminationData(prev => ({
      ...prev,
      GeneralExamination: {
        ...prev.GeneralExamination,
        [section]: {
          ...prev.GeneralExamination[section],
          [field]: value
        }
      }
    }))
  }

  const updateGEI = (bodyPart: keyof typeof examinationData.GEI, field: string, value: string) => {
    setExaminationData(prev => ({
      ...prev,
      GEI: {
        ...prev.GEI,
        [bodyPart]: {
          ...prev.GEI[bodyPart],
          [field]: value
        }
      }
    }))
  }

  const updateCVSResp = (section: string, field: string, value: string) => {
    if (section === 'PatientInfo') {
      setExaminationData(prev => ({
        ...prev,
        CVSRespExamination: {
          ...prev.CVSRespExamination,
          PatientInfo: {
            ...prev.CVSRespExamination.PatientInfo,
            [field]: value
          }
        }
      }))
    } else if (section === 'Chest') {
      setExaminationData(prev => ({
        ...prev,
        CVSRespExamination: {
          ...prev.CVSRespExamination,
          Chest: {
            ...prev.CVSRespExamination.Chest,
            [field]: value
          }
        }
      }))
    } else if (section === 'Percussion' || section === 'Auscultation') {
      setExaminationData(prev => {
        const currentSection = prev.CVSRespExamination.Chest[section as keyof typeof prev.CVSRespExamination.Chest]
        const sectionData = typeof currentSection === 'object' && currentSection !== null ? currentSection : {}
        
        return {
          ...prev,
          CVSRespExamination: {
            ...prev.CVSRespExamination,
            Chest: {
              ...prev.CVSRespExamination.Chest,
              [section]: {
                ...sectionData,
                [field]: value
              }
            }
          }
        }
      })
    }
  }

  const updateAbdominalExamination = (field: keyof typeof examinationData.AbdominalInguinalExamination, value: string | object) => {
    setExaminationData(prev => ({
      ...prev,
      AbdominalInguinalExamination: {
        ...prev.AbdominalInguinalExamination,
        [field]: value
      }
    }))
  }

  // Helper function for CVS/Respiratory examination updates
  const updateCVSField = (fieldPath: string, value: string) => {
    const pathParts = fieldPath.split('.')
    
    if (pathParts.length === 2) {
      const [section, field] = pathParts
      setExaminationData(prev => {
        const currentSection = prev.CVSRespExamination[section as keyof typeof prev.CVSRespExamination]
        const sectionData = typeof currentSection === 'object' && currentSection !== null ? currentSection : {}
        
        return {
          ...prev,
          CVSRespExamination: {
            ...prev.CVSRespExamination,
            [section]: {
              ...sectionData,
              [field]: value
            }
          }
        }
      })
    }
  }

  // Helper function for Abdominal examination updates
  const updateAbdominalField = (field: string, value: string) => {
    setExaminationData(prev => ({
      ...prev,
      AbdominalInguinalExamination: {
        ...prev.AbdominalInguinalExamination,
        [field]: value
      }
    }))
  }

  // Helper functions for anatomical diagram
  const getGEIFindings = (): Record<string, string> => {
    const findings: Record<string, string> = {}
    
    // Flatten all GEI sections into a single object
    Object.entries(examinationData.GEI).forEach(([section, fields]) => {
      if (typeof fields === 'object' && fields !== null) {
        Object.entries(fields).forEach(([key, value]) => {
          findings[key] = value as string
        })
      }
    })
    
    return findings
  }

  const updateGEIFinding = (regionId: string, finding: string) => {
    // Find which section this region belongs to
    let targetSection: string | null = null
    
    Object.entries(examinationData.GEI).forEach(([section, fields]) => {
      if (typeof fields === 'object' && fields !== null) {
        if (regionId in fields) {
          targetSection = section
        }
      }
    })
    
    if (targetSection) {
      setExaminationData(prev => {
        const sectionKey = targetSection as keyof typeof prev.GEI
        const currentSection = prev.GEI[sectionKey]
        const sectionData = typeof currentSection === 'object' && currentSection !== null ? currentSection : {}
        
        return {
          ...prev,
          GEI: {
            ...prev.GEI,
            [sectionKey]: {
              ...sectionData,
              [regionId]: finding
            }
          }
        }
      })
    }
  }

  const handleSave = () => {
    onSave({
      ...examinationData,
      GeneratedOn: new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/,/g, '/').replace(/ /g, '/')
    })
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <CardTitle>Comprehensive Physical Examination</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleDateString()}
            </Badge>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Examination
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Vital Signs
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="inspection" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Inspection
            </TabsTrigger>
            <TabsTrigger value="cvs-resp" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              CVS/Resp
            </TabsTrigger>
            <TabsTrigger value="abdominal" className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Abdominal
            </TabsTrigger>
          </TabsList>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="takenOn">Taken On</Label>
                    <Input
                      id="takenOn"
                      value={examinationData.VitalSigns.TakenOn}
                      onChange={(e) => updateVitalSigns('TakenOn', e.target.value)}
                      placeholder="Date and time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recordedBy">Recorded By</Label>
                    <Input
                      id="recordedBy"
                      value={examinationData.VitalSigns.RecordedBy}
                      onChange={(e) => updateVitalSigns('RecordedBy', e.target.value)}
                      placeholder="Staff member name"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="temp">Temperature</Label>
                    <Input
                      id="temp"
                      value={examinationData.VitalSigns.Temp}
                      onChange={(e) => updateVitalSigns('Temp', e.target.value)}
                      placeholder="37.5°C"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pr">Pulse Rate</Label>
                    <Input
                      id="pr"
                      value={examinationData.VitalSigns.PR}
                      onChange={(e) => updateVitalSigns('PR', e.target.value)}
                      placeholder="102"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rr">Respiratory Rate</Label>
                    <Input
                      id="rr"
                      value={examinationData.VitalSigns.RR}
                      onChange={(e) => updateVitalSigns('RR', e.target.value)}
                      placeholder="22"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bp">Blood Pressure</Label>
                    <Input
                      id="bp"
                      value={examinationData.VitalSigns.BP}
                      onChange={(e) => updateVitalSigns('BP', e.target.value)}
                      placeholder="130/90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="spo2">Oxygen Saturation</Label>
                    <Input
                      id="spo2"
                      value={examinationData.VitalSigns.OxygenSaturationSpO2}
                      onChange={(e) => updateVitalSigns('OxygenSaturationSpO2', e.target.value)}
                      placeholder="95% on RA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Body Weight</Label>
                    <Input
                      id="weight"
                      value={examinationData.VitalSigns.BodyWeight}
                      onChange={(e) => updateVitalSigns('BodyWeight', e.target.value)}
                      placeholder="Weight: 75 kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={examinationData.VitalSigns.Height}
                      onChange={(e) => updateVitalSigns('Height', e.target.value)}
                      placeholder="Height: 170 cm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bmi">BMI Value</Label>
                    <Input
                      id="bmi"
                      value={examinationData.VitalSigns.BMI.Value}
                      onChange={(e) => updateVitalSigns('BMI', { 
                        ...examinationData.VitalSigns.BMI, 
                        Value: e.target.value 
                      })}
                      placeholder="BMI: 26"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bmiStatus">BMI Status</Label>
                    <Input
                      id="bmiStatus"
                      value={examinationData.VitalSigns.BMI.Status}
                      onChange={(e) => updateVitalSigns('BMI', { 
                        ...examinationData.VitalSigns.BMI, 
                        Status: e.target.value 
                      })}
                      placeholder="BMI status: Overweight"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Examination Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Examination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chaperone">Chaperone</Label>
                    <Input
                      id="chaperone"
                      value={examinationData.GeneralExamination.PatientInfo.Chaperone}
                      onChange={(e) => updateGeneralExamination('PatientInfo', 'Chaperone', e.target.value)}
                      placeholder="Staff member name"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Clinical Observations</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="consciousness">Consciousness Level</Label>
                      <Input
                        id="consciousness"
                        value={examinationData.GeneralExamination.Observations.ConsciousnessLevel}
                        onChange={(e) => updateGeneralExamination('Observations', 'ConsciousnessLevel', e.target.value)}
                        placeholder="Conscious - Awake, alert, orientated"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pain">Wellness/Pain</Label>
                      <Input
                        id="pain"
                        value={examinationData.GeneralExamination.Observations.WellnessPain}
                        onChange={(e) => updateGeneralExamination('Observations', 'WellnessPain', e.target.value)}
                        placeholder="In Pain, Pain Scale: 7"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hydration">Hydration Status</Label>
                      <Input
                        id="hydration"
                        value={examinationData.GeneralExamination.Observations.HydrationStatus}
                        onChange={(e) => updateGeneralExamination('Observations', 'HydrationStatus', e.target.value)}
                        placeholder="Well hydrated, active"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gait">Gait and Posture</Label>
                      <Input
                        id="gait"
                        value={examinationData.GeneralExamination.Observations.GaitAndPosture}
                        onChange={(e) => updateGeneralExamination('Observations', 'GaitAndPosture', e.target.value)}
                        placeholder="Normal gait"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Inspection Tab - Gender-Specific Anatomical Diagram */}
          <TabsContent value="inspection" className="space-y-6">
            <AnatomicalDiagram
              gender={patientInfo?.sex || 'Male'}
              examinationFindings={getGEIFindings()}
              onFindingChange={updateGEIFinding}
              patientInfo={patientInfo ? {
                name: patientInfo.name,
                age: patientInfo.age,
                id: patientInfo.id
              } : undefined}
            />
          </TabsContent>

          {/* CVS/Respiratory Tab - Interactive Chest Diagram */}
          <TabsContent value="cvs-resp" className="space-y-6">
            <CVSRespiratoryDiagram
              examinationData={examinationData.CVSRespExamination}
              onFieldChange={updateCVSField}
              patientInfo={patientInfo ? {
                name: patientInfo.name,
                age: patientInfo.age,
                id: patientInfo.id
              } : undefined}
            />
          </TabsContent>

          {/* Abdominal Examination Tab - Interactive Abdominal Diagram */}
          <TabsContent value="abdominal" className="space-y-6">
            <AbdominalDiagram
              examinationData={examinationData.AbdominalInguinalExamination}
              onFieldChange={updateAbdominalField}
              patientInfo={patientInfo ? {
                name: patientInfo.name,
                age: patientInfo.age,
                id: patientInfo.id
              } : undefined}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 