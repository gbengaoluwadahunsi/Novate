"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save, FileText, User, Stethoscope, ClipboardList, Brain, Volume2 } from 'lucide-react'
import NovateMedicalDiagram, { SymptomData } from '@/components/medical-diagram/novate-medical-diagram'
import IntelligentMedicalDiagrams from '@/components/medical-diagram/intelligent-medical-diagrams'

// Simple interface matching the new.pdf template exactly
interface CleanMedicalNote {
  // Patient Information
  patientName: string
  patientAge: string
  patientGender: string
  patientId: string
  visitDate: string
  
  // Main Sections (exactly as in new.pdf)
  chiefComplaint: string
  historyOfPresentingIllness: string
  
  // Past Medical History (structured)
  medicalConditions: string
  surgeries: string
  hospitalizations: string
  
  // Drugs History
  medications: string
  allergies: string
  
  // Social History and Lifestyle
  smoking: string
  alcohol: string
  recreationalDrugs: string
  occupationLivingSituation: string
  travel: string
  sexual: string
  eatingOut: string
  
  // Family History
  familyHistory: string
  
  // Review of Systems
  systemsReview: string
  
  // Investigations & Results
  investigations: string
  
  // Assessment/Impression
  assessment: string
  
  // Plan
  plan: string
  
  // General Examination & Vital Signs
  temperature: string
  pulseRate: string
  respiratoryRate: string
  bloodPressure: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo: string
  dateTime: string
  signature?: string
  stamp?: string
  
  // Transcript for validation
  originalTranscript?: string
  transcript?: string
}

const createEmptyNote = (): CleanMedicalNote => ({
  patientName: '',
  patientAge: '',
  patientGender: 'Male',
  patientId: '',
  visitDate: new Date().toISOString().split('T')[0],
  chiefComplaint: '',
  historyOfPresentingIllness: '',
  medicalConditions: '',
  surgeries: '',
  hospitalizations: '',
  medications: '',
  allergies: '',
  smoking: '',
  alcohol: '',
  recreationalDrugs: '',
  occupationLivingSituation: '',
  travel: '',
  sexual: '',
  eatingOut: '',
  familyHistory: '',
  systemsReview: '',
  investigations: '',
  assessment: '',
  plan: '',
  temperature: '',
  pulseRate: '',
  respiratoryRate: '',
  bloodPressure: '',
  doctorName: '',
  doctorRegistrationNo: '',
  dateTime: new Date().toLocaleString(),
  signature: '',
  stamp: '',
  originalTranscript: '',
  transcript: ''
})

interface CleanMedicalNoteEditorProps {
  initialNote?: Partial<CleanMedicalNote>
  onSave: (note: CleanMedicalNote) => void
  isEditing?: boolean
  isSaving?: boolean
}

export default function CleanMedicalNoteEditor({
  initialNote,
  onSave,
  isEditing = false,
  isSaving = false
}: CleanMedicalNoteEditorProps) {
  const [note, setNote] = useState<CleanMedicalNote>({
    ...createEmptyNote(),
    ...initialNote
  })

  const updateField = (field: keyof CleanMedicalNote, value: string) => {
    setNote(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave(note)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Medical Notes</h1>
          <p className="text-sm text-gray-600">Following new.pdf template structure</p>
        </div>
        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="patient" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patient">Patient & History</TabsTrigger>
          <TabsTrigger value="systems">Systems Review</TabsTrigger>
          <TabsTrigger value="assessment">Assessment & Plan</TabsTrigger>
          <TabsTrigger value="examination">Physical Exam</TabsTrigger>
          <TabsTrigger value="transcript">Original Transcript</TabsTrigger>
        </TabsList>

        {/* Patient Information & History */}
        <TabsContent value="patient" className="space-y-4">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    value={note.patientName}
                    onChange={(e) => updateField('patientName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Patient Name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    value={note.patientAge}
                    onChange={(e) => updateField('patientAge', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={note.patientGender}
                    onValueChange={(value) => updateField('patientGender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient ID</Label>
                  <Input
                    value={note.patientId}
                    onChange={(e) => updateField('patientId', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Patient ID"
                  />
                </div>
              </div>
              <div>
                <Label>Visit Date</Label>
                <Input
                  type="date"
                  value={note.visitDate}
                  onChange={(e) => updateField('visitDate', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint */}
          <Card>
            <CardHeader>
              <CardTitle>Chief Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.chiefComplaint}
                onChange={(e) => updateField('chiefComplaint', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter chief complaint..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* History of Presenting Illness */}
          <Card>
            <CardHeader>
              <CardTitle>History of Presenting Illness</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.historyOfPresentingIllness}
                onChange={(e) => updateField('historyOfPresentingIllness', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter history of presenting illness..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Past Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Past Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Medical Conditions</Label>
                <Textarea
                  value={note.medicalConditions}
                  onChange={(e) => updateField('medicalConditions', e.target.value)}
                  disabled={!isEditing}
                  placeholder="List medical conditions..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Surgeries</Label>
                <Textarea
                  value={note.surgeries}
                  onChange={(e) => updateField('surgeries', e.target.value)}
                  disabled={!isEditing}
                  placeholder="List surgeries..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Hospitalizations</Label>
                <Textarea
                  value={note.hospitalizations}
                  onChange={(e) => updateField('hospitalizations', e.target.value)}
                  disabled={!isEditing}
                  placeholder="List hospitalizations..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Drugs History */}
          <Card>
            <CardHeader>
              <CardTitle>Drugs History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Medications</Label>
                <Textarea
                  value={note.medications}
                  onChange={(e) => updateField('medications', e.target.value)}
                  disabled={!isEditing}
                  placeholder="List current medications..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={note.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  disabled={!isEditing}
                  placeholder="List allergies..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social History and Lifestyle */}
          <Card>
            <CardHeader>
              <CardTitle>Social History and Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Smoking</Label>
                  <Input
                    value={note.smoking}
                    onChange={(e) => updateField('smoking', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Smoking status"
                  />
                </div>
                <div>
                  <Label>Alcohol</Label>
                  <Input
                    value={note.alcohol}
                    onChange={(e) => updateField('alcohol', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Alcohol consumption"
                  />
                </div>
                <div>
                  <Label>Recreational Drugs</Label>
                  <Input
                    value={note.recreationalDrugs}
                    onChange={(e) => updateField('recreationalDrugs', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Recreational drug use"
                  />
                </div>
                <div>
                  <Label>Occupation/Living Situation</Label>
                  <Input
                    value={note.occupationLivingSituation}
                    onChange={(e) => updateField('occupationLivingSituation', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Occupation and living situation"
                  />
                </div>
                <div>
                  <Label>Travel</Label>
                  <Input
                    value={note.travel}
                    onChange={(e) => updateField('travel', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Recent travel"
                  />
                </div>
                <div>
                  <Label>Sexual</Label>
                  <Input
                    value={note.sexual}
                    onChange={(e) => updateField('sexual', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Sexual history"
                  />
                </div>
              </div>
              <div>
                <Label>Eating Out</Label>
                <Input
                  value={note.eatingOut}
                  onChange={(e) => updateField('eatingOut', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Eating habits"
                />
              </div>
            </CardContent>
          </Card>

          {/* Family History */}
          <Card>
            <CardHeader>
              <CardTitle>Family History</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.familyHistory}
                onChange={(e) => updateField('familyHistory', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter family history... May need to draw family tree diagram especially in genetic diseases."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Systems Review */}
        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review of Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.systemsReview}
                onChange={(e) => updateField('systemsReview', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter review of systems..."
                rows={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment & Plan */}
        <TabsContent value="assessment" className="space-y-4">
          {/* Investigations & Results */}
          <Card>
            <CardHeader>
              <CardTitle>Investigations & Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.investigations}
                onChange={(e) => updateField('investigations', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter investigations and results..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Assessment/Impression */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment / Impression</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.assessment}
                onChange={(e) => updateField('assessment', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter assessment and impression..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note.plan}
                onChange={(e) => updateField('plan', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter treatment plan..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinician Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Doctor Name</Label>
                  <Input
                    value={note.doctorName}
                    onChange={(e) => updateField('doctorName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Doctor name"
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={note.doctorRegistrationNo}
                    onChange={(e) => updateField('doctorRegistrationNo', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Registration number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physical Examination */}
        <TabsContent value="examination" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                General Examination & Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Temperature</Label>
                  <Input
                    value={note.temperature}
                    onChange={(e) => updateField('temperature', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 37.5°C"
                  />
                </div>
                <div>
                  <Label>Pulse Rate</Label>
                  <Input
                    value={note.pulseRate}
                    onChange={(e) => updateField('pulseRate', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 80 bpm"
                  />
                </div>
                <div>
                  <Label>Respiratory Rate</Label>
                  <Input
                    value={note.respiratoryRate}
                    onChange={(e) => updateField('respiratoryRate', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 18/min"
                  />
                </div>
                <div>
                  <Label>Blood Pressure</Label>
                  <Input
                    value={note.bloodPressure}
                    onChange={(e) => updateField('bloodPressure', e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 120/80"
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Intelligent Visual Medical Diagrams */}
              <div className="p-4">
                <IntelligentMedicalDiagrams
                  examinationData={{
                    generalExamination: `Temperature: ${note.temperature}, Pulse: ${note.pulseRate}, RR: ${note.respiratoryRate}, BP: ${note.bloodPressure}`,
                    cardiovascularExamination: '', // Add if you have specific cardio fields
                    respiratoryExamination: '', // Add if you have specific respiratory fields  
                    abdominalExamination: '', // Add if you have specific abdominal fields
                    otherSystemsExamination: '', // Add if you have other systems
                    chiefComplaint: note.chiefComplaint,
                    historyOfPresentingIllness: note.historyOfPresentingIllness
                  }}
                  patientGender={determinePatientGender(note.patientGender)}
                  className="max-w-4xl mx-auto"
                />
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>• Intelligent anatomical visualization based on examination findings</p>
                  <p>• Automatically displays relevant views (front, back, specialized organs)</p>
                  <p>• Gender-specific medical diagrams with symptom mapping</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Original Transcript Tab - For Validation */}
        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Original Audio Transcript
                <Badge variant="outline" className="text-xs">
                  For Validation
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-4">
                This is the original transcript from the audio recording to ensure accuracy and prevent hallucination.
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {note.originalTranscript || note.transcript || 'No transcript available for this note.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to extract symptoms from medical note for diagram visualization
function extractSymptomsFromNote(note: CleanMedicalNote): SymptomData[] {
  const symptoms: SymptomData[] = []
  
  // Extract from chief complaint
  if (note.chiefComplaint) {
    const findings = extractFindingsFromText(note.chiefComplaint, 'chief_complaint')
    symptoms.push(...findings)
  }
  
  // Extract from history of present illness
  if (note.historyOfPresentingIllness) {
    const findings = extractFindingsFromText(note.historyOfPresentingIllness, 'history')
    symptoms.push(...findings)
  }
  
  // Extract from assessment (which may contain physical findings)
  if (note.assessment) {
    const findings = extractFindingsFromText(note.assessment, 'assessment')
    symptoms.push(...findings)
  }
  
  // Extract from investigations (which may contain examination results)
  if (note.investigations) {
    const findings = extractFindingsFromText(note.investigations, 'investigations')
    symptoms.push(...findings)
  }
  
  // Extract from assessment
  if (note.assessment) {
    const findings = extractFindingsFromText(note.assessment, 'diagnosis')
    symptoms.push(...findings)
  }
  
  return symptoms
}

// Helper function to extract findings from examination text
function extractFindingsFromText(text: string, systemType: string): SymptomData[] {
  const findings: SymptomData[] = []
  const lowerText = text.toLowerCase()
  
  // Common medical findings and their body part mappings
  const findingsMap: Record<string, { bodyPart: string; coordinates: { x: number; y: number } }> = {
    // Pain and discomfort
    'chest pain': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    'abdominal pain': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'headache': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.15 } },
    'back pain': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } },
    'neck pain': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.25 } },
    'sore throat': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.22 } },
    
    // Respiratory symptoms
    'cough': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'shortness of breath': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'wheezing': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'difficulty breathing': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    
    // Cardiovascular symptoms
    'palpitations': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    'heart murmur': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    'irregular heartbeat': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    
    // Gastrointestinal symptoms
    'nausea': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'vomiting': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'diarrhea': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'constipation': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    
    // General symptoms
    'fever': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } },
    'fatigue': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } },
    'weakness': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } },
    'dizziness': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.15 } },
    'swelling': { bodyPart: 'lower_extremity', coordinates: { x: 0.5, y: 0.8 } },
    'edema': { bodyPart: 'lower_extremity', coordinates: { x: 0.5, y: 0.8 } }
  }
  
  // Search for findings in the text
  Object.entries(findingsMap).forEach(([finding, mapping]) => {
    if (lowerText.includes(finding)) {
      const severity = determineSeverityFromText(text, finding)
      
      findings.push({
        name: finding.charAt(0).toUpperCase() + finding.slice(1),
        bodyPart: mapping.bodyPart,
        severity,
        coordinates: mapping.coordinates,
        description: `${systemType} finding`,
        duration: 'Current examination'
      })
    }
  })
  
  return findings
}

// Helper function to determine severity from text context
function determineSeverityFromText(text: string, finding: string): 'mild' | 'moderate' | 'severe' {
  const lowerText = text.toLowerCase()
  const findingContext = extractContextAroundFinding(lowerText, finding)
  
  if (findingContext.includes('severe') || findingContext.includes('acute') || findingContext.includes('significant')) {
    return 'severe'
  }
  
  if (findingContext.includes('moderate') || findingContext.includes('notable') || findingContext.includes('marked')) {
    return 'moderate'
  }
  
  return 'mild'
}

// Helper function to extract context around a finding
function extractContextAroundFinding(text: string, finding: string): string {
  const index = text.indexOf(finding)
  if (index === -1) return ''
  
  const start = Math.max(0, index - 50)
  const end = Math.min(text.length, index + finding.length + 50)
  return text.substring(start, end)
}

// Helper function to determine patient gender for diagram rendering
function determinePatientGender(gender?: string): 'male' | 'female' {
  if (!gender) return 'male'
  
  const lowerGender = gender.toLowerCase()
  if (lowerGender.includes('female') || lowerGender.includes('woman') || lowerGender === 'f') {
    return 'female'
  }
  
  return 'male' // Default to male
}

export type { CleanMedicalNote }