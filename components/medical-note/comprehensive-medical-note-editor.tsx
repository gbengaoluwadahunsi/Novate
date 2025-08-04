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
import { User, Heart, Activity, Save, RotateCw, Download, Stethoscope } from 'lucide-react'
import { ComprehensiveExaminationData, createEmptyExaminationData, calculateBMI } from '@/types/comprehensive-examination'

interface ComprehensiveMedicalNoteEditorProps {
  initialData?: Partial<ComprehensiveExaminationData>
  onSave: (data: ComprehensiveExaminationData) => void
  isEditing?: boolean
  isSaving?: boolean
}

export default function ComprehensiveMedicalNoteEditor({
  initialData,
  onSave,
  isEditing = false,
  isSaving = false
}: ComprehensiveMedicalNoteEditorProps) {
  const [examinationData, setExaminationData] = useState<ComprehensiveExaminationData>(() => ({
    ...createEmptyExaminationData(),
    ...initialData
  }))
  
  const [activeTab, setActiveTab] = useState("patient-info")
  
  // Helper function to update nested data
  const updateField = (path: string, value: string) => {
    const keys = path.split('.')
    const newData = { ...examinationData }
    
    let current: any = newData
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
    setExaminationData(newData)
  }
  
  // Auto-calculate BMI when weight or height changes
  useEffect(() => {
    const bmiResult = calculateBMI(examinationData.VitalSigns.Weight, examinationData.VitalSigns.Height)
    if (bmiResult.value) {
      setExaminationData(prev => ({
        ...prev,
        VitalSigns: {
          ...prev.VitalSigns,
          BMI: {
            Value: bmiResult.value,
            Status: bmiResult.status
          }
        }
      }))
    }
  }, [examinationData.VitalSigns.Weight, examinationData.VitalSigns.Height])
  
  const handleSave = () => {
    onSave(examinationData)
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">
          Comprehensive Physical Examination
        </h1>
        <Badge variant="outline">
          🤖 AI-Enhanced Medical Documentation
        </Badge>
        
        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Examination'}
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patient-info">
            <User className="h-4 w-4 mr-2" />
            Patient Info
          </TabsTrigger>
          <TabsTrigger value="vital-signs">
            <Activity className="h-4 w-4 mr-2" />
            Vital Signs
          </TabsTrigger>
          <TabsTrigger value="general-exam">
            <User className="h-4 w-4 mr-2" />
            General Exam
          </TabsTrigger>
          <TabsTrigger value="cvs-resp">
            <Heart className="h-4 w-4 mr-2" />
            CVS & Resp
          </TabsTrigger>
          <TabsTrigger value="abdominal">
            <Stethoscope className="h-4 w-4 mr-2" />
            Abdominal
          </TabsTrigger>
        </TabsList>
        
        {/* Patient Information Tab */}
        <TabsContent value="patient-info">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    value={examinationData.PatientInfo.Name}
                    onChange={(e) => updateField('PatientInfo.Name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    value={examinationData.PatientInfo.Age}
                    onChange={(e) => updateField('PatientInfo.Age', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={examinationData.PatientInfo.Sex}
                    onValueChange={(value) => updateField('PatientInfo.Sex', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient ID</Label>
                  <Input
                    value={examinationData.PatientInfo.ID}
                    onChange={(e) => updateField('PatientInfo.ID', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Patient ID"
                  />
                </div>
              </div>
              <div>
                <Label>Chaperone</Label>
                <Input
                  value={examinationData.PatientInfo.Chaperone}
                  onChange={(e) => updateField('PatientInfo.Chaperone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Chaperone name (if applicable)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vital Signs Tab */}
        <TabsContent value="vital-signs">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Taken On</Label>
                  <Input
                    value={examinationData.VitalSigns.TakenOn}
                    onChange={(e) => updateField('VitalSigns.TakenOn', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Date/Time"
                  />
                </div>
                <div>
                  <Label>Recorded By</Label>
                  <Input
                    value={examinationData.VitalSigns.RecordedBy}
                    onChange={(e) => updateField('VitalSigns.RecordedBy', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Staff name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Temperature</Label>
                  <Input
                    value={examinationData.VitalSigns.Temperature}
                    onChange={(e) => updateField('VitalSigns.Temperature', e.target.value)}
                    disabled={!isEditing}
                    placeholder="°C"
                  />
                </div>
                <div>
                  <Label>Pulse Rate</Label>
                  <Input
                    value={examinationData.VitalSigns.PulseRate}
                    onChange={(e) => updateField('VitalSigns.PulseRate', e.target.value)}
                    disabled={!isEditing}
                    placeholder="bpm"
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    value={examinationData.VitalSigns.RespiratoryRate}
                    onChange={(e) => updateField('VitalSigns.RespiratoryRate', e.target.value)}
                    disabled={!isEditing}
                    placeholder="/min"
                  />
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    value={examinationData.VitalSigns.BloodPressure}
                    onChange={(e) => updateField('VitalSigns.BloodPressure', e.target.value)}
                    disabled={!isEditing}
                    placeholder="mmHg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>SpO2</Label>
                  <Input
                    value={examinationData.VitalSigns.SpO2}
                    onChange={(e) => updateField('VitalSigns.SpO2', e.target.value)}
                    disabled={!isEditing}
                    placeholder="%"
                  />
                </div>
                <div>
                  <Label>Weight</Label>
                  <Input
                    value={examinationData.VitalSigns.Weight}
                    onChange={(e) => updateField('VitalSigns.Weight', e.target.value)}
                    disabled={!isEditing}
                    placeholder="kg"
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    value={examinationData.VitalSigns.Height}
                    onChange={(e) => updateField('VitalSigns.Height', e.target.value)}
                    disabled={!isEditing}
                    placeholder="cm"
                  />
                </div>
                <div>
                  <Label>BMI</Label>
                  <Input
                    value={examinationData.VitalSigns.BMI.Value}
                    disabled={true}
                    placeholder="Auto-calculated"
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>BMI Status</Label>
                  <Input
                    value={examinationData.VitalSigns.BMI.Status}
                    disabled={true}
                    placeholder="Auto-determined"
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* General Examination Tab */}
        <TabsContent value="general-exam">
          <Card>
            <CardHeader>
              <CardTitle>General Examination Inspection (GEI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant={examinationData.PatientInfo.Sex.toLowerCase() === 'male' ? "default" : "secondary"}>
                  {examinationData.PatientInfo.Sex} Anatomy
                </Badge>
              </div>
              
              {/* Head and Neck Section */}
              <div>
                <h4 className="font-medium mb-3">Head, Face & Neck</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Head</Label>
                    <Input
                      value={examinationData.GEI.Head.Head1}
                      onChange={(e) => updateField('GEI.Head.Head1', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Head findings"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label>Face</Label>
                    <Input
                      value={examinationData.GEI.Face.Face1}
                      onChange={(e) => updateField('GEI.Face.Face1', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Facial features"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label>Right Eye</Label>
                    <Input
                      value={examinationData.GEI.Eyes.Eye1}
                      onChange={(e) => updateField('GEI.Eyes.Eye1', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Right eye"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label>Left Eye</Label>
                    <Input
                      value={examinationData.GEI.Eyes.Eye2}
                      onChange={(e) => updateField('GEI.Eyes.Eye2', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Left eye"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Upper Extremities */}
              <div>
                <h4 className="font-medium mb-3">Upper Extremities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Right Side</h5>
                    <div className="space-y-2">
                      {['Shoulder', 'Arm', 'Elbow', 'Forearm', 'Hand'].map((part) => (
                        <Input
                          key={`right-${part}`}
                          value={examinationData.GEI.Arms?.[`${part}1` as keyof typeof examinationData.GEI.Arms]?.[1] || 
                                 examinationData.GEI.Shoulders?.[`${part}1` as keyof typeof examinationData.GEI.Shoulders]?.[1] || ''}
                          onChange={(e) => updateField(`GEI.${part === 'Shoulder' ? 'Shoulders' : 'Arms'}.${part}1.1`, e.target.value)}
                          disabled={!isEditing}
                          placeholder={`Right ${part.toLowerCase()}`}
                          className="text-sm h-8"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Left Side</h5>
                    <div className="space-y-2">
                      {['Shoulder', 'Arm', 'Elbow', 'Forearm', 'Hand'].map((part) => (
                        <Input
                          key={`left-${part}`}
                          value={examinationData.GEI.Arms?.[`${part}1` as keyof typeof examinationData.GEI.Arms]?.[2] || 
                                 examinationData.GEI.Shoulders?.[`${part}1` as keyof typeof examinationData.GEI.Shoulders]?.[2] || ''}
                          onChange={(e) => updateField(`GEI.${part === 'Shoulder' ? 'Shoulders' : 'Arms'}.${part}1.2`, e.target.value)}
                          disabled={!isEditing}
                          placeholder={`Left ${part.toLowerCase()}`}
                          className="text-sm h-8"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lower Extremities */}
              <div>
                <h4 className="font-medium mb-3">Lower Extremities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Right Side</h5>
                    <div className="space-y-2">
                      {['Hip', 'Thigh', 'Knee', 'Leg', 'Feet'].map((part) => (
                        <Input
                          key={`right-${part}`}
                          value={examinationData.GEI.Legs?.[`${part}1` as keyof typeof examinationData.GEI.Legs]?.[1] || ''}
                          onChange={(e) => updateField(`GEI.Legs.${part}1.1`, e.target.value)}
                          disabled={!isEditing}
                          placeholder={`Right ${part.toLowerCase()}`}
                          className="text-sm h-8"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Left Side</h5>
                    <div className="space-y-2">
                      {['Hip', 'Thigh', 'Knee', 'Leg', 'Feet'].map((part) => (
                        <Input
                          key={`left-${part}`}
                          value={examinationData.GEI.Legs?.[`${part}1` as keyof typeof examinationData.GEI.Legs]?.[2] || ''}
                          onChange={(e) => updateField(`GEI.Legs.${part}1.2`, e.target.value)}
                          disabled={!isEditing}
                          placeholder={`Left ${part.toLowerCase()}`}
                          className="text-sm h-8"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* General Observations */}
              <div>
                <h4 className="font-medium mb-3">General Observations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Consciousness Level</Label>
                    <Input
                      value={examinationData.GEI.Observations.ConsciousnessLevel}
                      onChange={(e) => updateField('GEI.Observations.ConsciousnessLevel', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Alert, drowsy, etc."
                    />
                  </div>
                  <div>
                    <Label>Wellness/Pain</Label>
                    <Input
                      value={examinationData.GEI.Observations.WellnessPain}
                      onChange={(e) => updateField('GEI.Observations.WellnessPain', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Comfortable, in distress, etc."
                    />
                  </div>
                  <div>
                    <Label>Hydration Status</Label>
                    <Input
                      value={examinationData.GEI.Observations.HydrationStatus}
                      onChange={(e) => updateField('GEI.Observations.HydrationStatus', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Well hydrated, dehydrated, etc."
                    />
                  </div>
                  <div>
                    <Label>Gait and Posture</Label>
                    <Input
                      value={examinationData.GEI.Observations.GaitAndPosture}
                      onChange={(e) => updateField('GEI.Observations.GaitAndPosture', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Normal gait, limping, etc."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* CVS & Respiratory Tab */}
        <TabsContent value="cvs-resp">
          <Card>
            <CardHeader>
              <CardTitle>Cardiovascular & Respiratory Examination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>🫀 Systematic chest examination following standardized protocol</p>
              </div>
              
              {/* Basic CVS/Resp findings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>JVP</Label>
                  <Input
                    value={examinationData.CVSRespExamination.Chest.JVP}
                    onChange={(e) => updateField('CVSRespExamination.Chest.JVP', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Jugular venous pressure"
                  />
                </div>
                <div>
                  <Label>Heart Sounds</Label>
                  <Input
                    value={examinationData.CVSRespExamination.Chest.G}
                    onChange={(e) => updateField('CVSRespExamination.Chest.G', e.target.value)}
                    disabled={!isEditing}
                    placeholder="S1, S2, murmurs"
                  />
                </div>
                <div>
                  <Label>Apex Beat</Label>
                  <Input
                    value={examinationData.CVSRespExamination.Chest.A}
                    onChange={(e) => updateField('CVSRespExamination.Chest.A', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Location, character"
                  />
                </div>
                <div>
                  <Label>Pulmonary</Label>
                  <Input
                    value={examinationData.CVSRespExamination.Chest.P}
                    onChange={(e) => updateField('CVSRespExamination.Chest.P', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Lung sounds"
                  />
                </div>
              </div>
              
              {/* Percussion findings */}
              <div>
                <h4 className="font-medium mb-2">Percussion Findings</h4>
                <div className="text-sm text-gray-600 mb-3">
                  <p>Enter findings for each percussion zone (1-7, Left/Right)</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {[1, 2, 3, 4, 5, 6, 7].map(level => (
                    <div key={level} className="flex gap-1">
                      <Input
                        placeholder={`Right ${level}`}
                        value={examinationData.CVSRespExamination.Chest.Percussion[`${level}_1` as keyof typeof examinationData.CVSRespExamination.Chest.Percussion]}
                        onChange={(e) => updateField(`CVSRespExamination.Chest.Percussion.${level}_1`, e.target.value)}
                        disabled={!isEditing}
                        className="h-8"
                      />
                      <Input
                        placeholder={`Left ${level}`}
                        value={examinationData.CVSRespExamination.Chest.Percussion[`${level}_2` as keyof typeof examinationData.CVSRespExamination.Chest.Percussion]}
                        onChange={(e) => updateField(`CVSRespExamination.Chest.Percussion.${level}_2`, e.target.value)}
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Auscultation findings */}
              <div>
                <h4 className="font-medium mb-2">Auscultation Findings</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.keys(examinationData.CVSRespExamination.Chest.Auscultation).map(key => (
                    <div key={key}>
                      <Input
                        placeholder={`Auscultation ${key.replace('_', '-')}`}
                        value={examinationData.CVSRespExamination.Chest.Auscultation[key as keyof typeof examinationData.CVSRespExamination.Chest.Auscultation]}
                        onChange={(e) => updateField(`CVSRespExamination.Chest.Auscultation.${key}`, e.target.value)}
                        disabled={!isEditing}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Abdominal Examination Tab */}
        <TabsContent value="abdominal">
          <Card>
            <CardHeader>
              <CardTitle>Abdominal & Inguinal Examination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>🫃 Systematic abdominal examination by regions</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Stomach</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.Stomach}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Stomach', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Epigastric region findings"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Liver</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.Liver}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Liver', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Right upper quadrant"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Spleen</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.Spleen}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Spleen', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Left upper quadrant"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Right Flank</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.RF}
                    onChange={(e) => updateField('AbdominalInguinalExamination.RF', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Right flank findings"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Left Flank</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.LF}
                    onChange={(e) => updateField('AbdominalInguinalExamination.LF', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Left flank findings"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Appendix (RIF)</Label>
                  <Textarea
                    value={examinationData.AbdominalInguinalExamination.Appendix_RIF}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Appendix_RIF', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Right iliac fossa"
                    rows={2}
                  />
                </div>
              </div>
              
              {/* Additional abdominal regions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Umbilicus</Label>
                  <Input
                    value={examinationData.AbdominalInguinalExamination.Umbilicus}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Umbilicus', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Umbilical findings"
                  />
                </div>
                <div>
                  <Label>LIF</Label>
                  <Input
                    value={examinationData.AbdominalInguinalExamination.LIF}
                    onChange={(e) => updateField('AbdominalInguinalExamination.LIF', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Left iliac fossa"
                  />
                </div>
                <div>
                  <Label>Bladder</Label>
                  <Input
                    value={examinationData.AbdominalInguinalExamination.Bladder}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Bladder', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Suprapubic region"
                  />
                </div>
                <div>
                  <Label>Scrotum</Label>
                  <Input
                    value={examinationData.AbdominalInguinalExamination.Scrotum}
                    onChange={(e) => updateField('AbdominalInguinalExamination.Scrotum', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Scrotal examination"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Summary Panel */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Examination Summary</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!isEditing}>
                <RotateCw className="h-4 w-4 mr-2" />
                Generate AI Summary
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Template
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>🤖 AI-powered examination template ready for professional medical documentation</p>
            <p className="mt-2">Generated on: {examinationData.GeneratedOn}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export type { ComprehensiveExaminationData }