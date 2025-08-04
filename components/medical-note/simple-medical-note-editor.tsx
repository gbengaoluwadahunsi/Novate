"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, FileText, Upload, X } from 'lucide-react'
import ComprehensiveMedicalNoteEditor from '@/components/medical-note/comprehensive-medical-note-editor'
import { ComprehensiveExaminationData } from '@/types/comprehensive-examination'
import { convertToComprehensiveExamination, convertToSimpleMedicalNote } from '@/lib/examination-converter'

// Ultra-simple interface matching the exact template
interface SimpleMedicalNote {
  // Patient Information (appears on all pages)
  patientName: string
  patientAge: string
  patientGender: string
  patientId: string
  chaperone: string
  
  // Vital Signs (Page 1)
  temperature: string
  pulseRate: string
  respiratoryRate: string
  bloodPressure: string
  spo2: string
  weight: string
  height: string
  bmi: string
  bmiStatus: string
  takenOn: string
  takenBy: string
  
  // Main Medical Content (Page 5 - Main Note)
  chiefComplaint: string
  historyOfPresentingIllness: string
  medicalConditions: string
  surgeries: string
  hospitalizations: string
  medications: string
  allergies: string
  smoking: string
  alcohol: string
  recreationalDrugs: string
  occupationLivingSituation: string
  travel: string
  sexual: string
  eatingOut: string
  familyHistory: string
  
  // Review of Systems (Page 6)
  systemsReview: string
  
  // Physical Examination (Pages 1-3)
  generalExamination: string
  vitalSignsFindings: string
  cardiovascularExamination: string
  respiratoryExamination: string
  abdominalExamination: string
  otherSystemsExamination: string
  physicalExaminationFindings: { [key: string]: string } // For body diagram findings
  
  // Assessment & Plan (Page 4)
  investigations: string
  assessment: string
  plan: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo: string
  generatedOn: string
  signature: string // Base64 string
  stamp: string // Base64 string
  letterhead?: string // Base64 string - optional letterhead template
}

const createEmptyNote = (): SimpleMedicalNote => ({
  patientName: '',
  patientAge: '',
  patientGender: 'Male',
  patientId: '',
  chaperone: '',
  temperature: '',
  pulseRate: '',
  respiratoryRate: '',
  bloodPressure: '',
  spo2: '',
  weight: '',
  height: '',
  bmi: '',
  bmiStatus: '',
  takenOn: '',
  takenBy: '',
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
  generalExamination: '',
  vitalSignsFindings: '',
  cardiovascularExamination: '',
  respiratoryExamination: '',
  abdominalExamination: '',
  otherSystemsExamination: '',
  physicalExaminationFindings: {},
  investigations: '',
  assessment: '',
  plan: '',
  doctorName: '',
  doctorRegistrationNo: '',
  generatedOn: new Date().toLocaleString(),
  signature: '',
  stamp: '',
  letterhead: undefined
})

interface SimpleMedicalNoteEditorProps {
  initialNote?: Partial<SimpleMedicalNote>
  onSave: (note: SimpleMedicalNote) => void
  isEditing?: boolean
  isSaving?: boolean
}

export default function SimpleMedicalNoteEditor({
  initialNote,
  onSave,
  isEditing = false,
  isSaving = false
}: SimpleMedicalNoteEditorProps) {
  const [note, setNote] = useState<SimpleMedicalNote>({
    ...createEmptyNote(),
    ...initialNote
  })

  const signatureInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof SimpleMedicalNote, value: string) => {
    setNote(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onSave(note)
  }

  const handleSignatureUpload = () => {
    signatureInputRef.current?.click()
  }

  const handleStampUpload = () => {
    stampInputRef.current?.click()
  }

  const handleSignatureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateField('signature', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStampFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateField('stamp', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSignature = () => {
    updateField('signature', '')
  }

  const removeStamp = () => {
    updateField('stamp', '')
  }



  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Simple Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Medical Notes</h1>

        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Medical Note'}
          </Button>
        )}
      </div>

      {/* Patient Information (appears on all pages) */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Name</Label>
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
                  <SelectItem value="Others">Others</SelectItem>
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
        </CardContent>
      </Card>

      {/* Vital Signs (Page 1) */}
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Taken on</Label>
              <Input
                value={note.takenOn}
                onChange={(e) => updateField('takenOn', e.target.value)}
                disabled={!isEditing}
                placeholder="Date/Time taken"
              />
            </div>
            <div>
              <Label>By</Label>
              <Input
                value={note.takenBy}
                onChange={(e) => updateField('takenBy', e.target.value)}
                disabled={!isEditing}
                placeholder="Staff name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Temperature</Label>
              <Input
                value={note.temperature}
                onChange={(e) => updateField('temperature', e.target.value)}
                disabled={!isEditing}
                placeholder="°C"
              />
            </div>
            <div>
              <Label>Pulse Rate</Label>
              <Input
                value={note.pulseRate}
                onChange={(e) => updateField('pulseRate', e.target.value)}
                disabled={!isEditing}
                placeholder="bpm"
              />
            </div>
            <div>
              <Label>Respiratory Rate</Label>
              <Input
                value={note.respiratoryRate}
                onChange={(e) => updateField('respiratoryRate', e.target.value)}
                disabled={!isEditing}
                placeholder="/min"
              />
            </div>
            <div>
              <Label>Blood Pressure</Label>
              <Input
                value={note.bloodPressure}
                onChange={(e) => updateField('bloodPressure', e.target.value)}
                disabled={!isEditing}
                placeholder="mmHg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>SpO2</Label>
              <Input
                value={note.spo2}
                onChange={(e) => updateField('spo2', e.target.value)}
                disabled={!isEditing}
                placeholder="%"
              />
            </div>
            <div>
              <Label>Weight</Label>
              <Input
                value={note.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                disabled={!isEditing}
                placeholder="kg"
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                value={note.height}
                onChange={(e) => updateField('height', e.target.value)}
                disabled={!isEditing}
                placeholder="cm"
              />
            </div>
            <div>
              <Label>BMI</Label>
              <Input
                value={note.bmi}
                onChange={(e) => updateField('bmi', e.target.value)}
                disabled={!isEditing}
                placeholder="kg/m²"
              />
            </div>
            <div>
              <Label>BMI Status</Label>
              <Input
                value={note.bmiStatus}
                onChange={(e) => updateField('bmiStatus', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Normal"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Medical Content (Page 5) */}
      <Card>
        <CardHeader>
          <CardTitle>Medical History & Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Chief complaint</Label>
            <Textarea
              value={note.chiefComplaint}
              onChange={(e) => updateField('chiefComplaint', e.target.value)}
              disabled={!isEditing}
              placeholder="Usually one sentence (e.g., 'Presented with headache for 3 days'). Sometimes 2-3 complaints max."
              rows={2}
            />
          </div>
          
          <div>
            <Label>History of presenting illness</Label>
            <Textarea
              value={note.historyOfPresentingIllness}
              onChange={(e) => updateField('historyOfPresentingIllness', e.target.value)}
              disabled={!isEditing}
              placeholder="Most of the conversation/transcription will go here. Detailed description of the illness."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Medical Conditions</Label>
              <Textarea
                value={note.medicalConditions}
                onChange={(e) => updateField('medicalConditions', e.target.value)}
                disabled={!isEditing}
                placeholder="Past medical conditions..."
                rows={2}
              />
            </div>
            <div>
              <Label>Surgeries</Label>
              <Textarea
                value={note.surgeries}
                onChange={(e) => updateField('surgeries', e.target.value)}
                disabled={!isEditing}
                placeholder="Past surgeries..."
                rows={2}
              />
            </div>
            <div>
              <Label>Hospitalizations</Label>
              <Textarea
                value={note.hospitalizations}
                onChange={(e) => updateField('hospitalizations', e.target.value)}
                disabled={!isEditing}
                placeholder="Past hospitalizations..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Medications</Label>
              <Textarea
                value={note.medications}
                onChange={(e) => updateField('medications', e.target.value)}
                disabled={!isEditing}
                placeholder="Medications patient is taking (self-prescribed or given by other doctors)..."
                rows={2}
              />
            </div>
            <div>
              <Label>Allergies</Label>
              <Textarea
                value={note.allergies}
                onChange={(e) => updateField('allergies', e.target.value)}
                disabled={!isEditing}
                placeholder="Drug allergies and other known allergies..."
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                placeholder="Alcohol use"
              />
            </div>
            <div>
              <Label>Recreational Drugs</Label>
              <Input
                value={note.recreationalDrugs}
                onChange={(e) => updateField('recreationalDrugs', e.target.value)}
                disabled={!isEditing}
                placeholder="Drug use"
              />
            </div>
            <div>
              <Label>Occupation/Living</Label>
              <Input
                value={note.occupationLivingSituation}
                onChange={(e) => updateField('occupationLivingSituation', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Teacher, paycheck to paycheck, government help"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Travel</Label>
              <Input
                value={note.travel}
                onChange={(e) => updateField('travel', e.target.value)}
                disabled={!isEditing}
                placeholder="Recent travel history (important for diagnosis)"
              />
            </div>
            <div>
              <Label>Eating out</Label>
              <Input
                value={note.eatingOut}
                onChange={(e) => updateField('eatingOut', e.target.value)}
                disabled={!isEditing}
                placeholder="Eating out habits (important for health assessment)"
              />
            </div>
            <div>
              <Label>Others</Label>
              <Input
                value={note.sexual}
                onChange={(e) => updateField('sexual', e.target.value)}
                disabled={!isEditing}
                placeholder="Other relevant social history"
              />
            </div>
          </div>

          <div>
            <Label>Family history</Label>
            <Textarea
              value={note.familyHistory}
              onChange={(e) => updateField('familyHistory', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., 'Parents have diabetes'. For genetic diseases, family tree diagram will be generated. If nil, no need."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Review of Systems (Page 6) */}
      <Card>
        <CardHeader>
          <CardTitle>Review of Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={note.systemsReview}
            onChange={(e) => updateField('systemsReview', e.target.value)}
            disabled={!isEditing}
            placeholder="Can be very detailed or very simple (e.g., 'CVS normal, respiratory normal, etc.'). This is the last part of the history."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Comprehensive Physical Examination */}
      <div className="border rounded-lg p-1">
        <ComprehensiveMedicalNoteEditor
          initialData={convertToComprehensiveExamination(note)}
          onSave={(comprehensiveData: ComprehensiveExaminationData) => {
            const updatedNote = convertToSimpleMedicalNote(comprehensiveData)
            setNote(prev => ({
              ...prev,
              ...updatedNote,
              // Preserve original note fields that aren't in comprehensive data
              chiefComplaint: prev.chiefComplaint,
              historyOfPresentingIllness: prev.historyOfPresentingIllness,
              medicalConditions: prev.medicalConditions,
              surgeries: prev.surgeries,
              hospitalizations: prev.hospitalizations,
              medications: prev.medications,
              allergies: prev.allergies,
              smoking: prev.smoking,
              alcohol: prev.alcohol,
              recreationalDrugs: prev.recreationalDrugs,
              occupationLivingSituation: prev.occupationLivingSituation,
              travel: prev.travel,
              sexual: prev.sexual,
              eatingOut: prev.eatingOut,
              familyHistory: prev.familyHistory,
              systemsReview: prev.systemsReview,
              investigations: prev.investigations,
              assessment: prev.assessment,
              plan: prev.plan,
              doctorName: prev.doctorName,
              doctorRegistrationNo: prev.doctorRegistrationNo,
              signature: prev.signature,
              stamp: prev.stamp
            }))
          }}
          isEditing={isEditing}
          isSaving={false}
        />
      </div>

      {/* Assessment & Plan (Page 4) */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment & Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Investigations & Results</Label>
            <Textarea
              value={note.investigations}
              onChange={(e) => updateField('investigations', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter investigations and results..."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Assessment / Impression</Label>
            <Textarea
              value={note.assessment}
              onChange={(e) => updateField('assessment', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter assessment and impression..."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Plan</Label>
            <Textarea
              value={note.plan}
              onChange={(e) => updateField('plan', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter treatment plan..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
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

          {/* Signature and Stamp Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Upload */}
            <div className="space-y-2">
              <Label>Doctor Signature</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {note.signature ? (
                  <div className="space-y-2">
                    <img 
                      src={note.signature} 
                      alt="Doctor Signature" 
                      className="max-h-20 mx-auto"
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeSignature}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Signature
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      No signature uploaded
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSignatureUpload}
                        className="mt-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Signature
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stamp Upload */}
            <div className="space-y-2">
              <Label>Doctor Stamp</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {note.stamp ? (
                  <div className="space-y-2">
                    <img 
                      src={note.stamp} 
                      alt="Doctor Stamp" 
                      className="max-h-20 mx-auto"
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeStamp}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove Stamp
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      No stamp uploaded
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleStampUpload}
                        className="mt-2"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Stamp
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={signatureInputRef}
            onChange={handleSignatureFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={stampInputRef}
            onChange={handleStampFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export type { SimpleMedicalNote }