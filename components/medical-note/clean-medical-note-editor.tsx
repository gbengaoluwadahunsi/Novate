"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, FileText, Upload, X, User, Brain, Stethoscope, Activity, Heart, Pill, Users, FileSearch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SimpleMedicalDiagram from '@/components/medical-diagram/simple-medical-diagram'

// ICD-11 Codes Interface
interface ICD11Codes {
  primary: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  secondary: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  suggestions: Array<{
    code: string
    title: string
    definition?: string
    uri: string
    confidence?: number
    matchType: 'exact' | 'partial' | 'synonym' | 'related'
  }>
  extractedTerms: string[]
  processingTime: number
  lastUpdated: string
}

// Complete medical note interface matching the PDF structure
interface CleanMedicalNote {
  // Note identification
  id: string
  
  // Patient Information
  patientName: string
  patientAge: string
  patientGender: string
  visitDate: string
  
  // Main Sections (exactly as in PDF)
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
  
  // Complete Social History from backend
  socialHistory: string
  
  // Review of Systems
  systemsReview: string
  
  // Physical Examination
  physicalExamination: string
  
  // Investigations & Results
  investigations: string
  
  // Assessment/Impression
  assessment: string
  
  // Plan
  plan: string
  
  // ICD-11 Codes Section
  icd11Codes?: ICD11Codes
  
  // General Examination & Vital Signs
  temperature: string
  pulseRate: string
  respiratoryRate: string
  bloodPressure: string
  glucose: string
  
  // Doctor Information
  doctorName: string
  doctorRegistrationNo: string
  dateTime: string
  signature?: string
  stamp?: string
  
  // Transcript for validation (not displayed)
  originalTranscript?: string
  transcript?: string
}

const createEmptyNote = (): CleanMedicalNote => ({
  id: '', // Added id
  patientName: '',
  patientAge: '',
  patientGender: 'Male',
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
  socialHistory: '',
  systemsReview: '',
  physicalExamination: '',
  investigations: '',
  assessment: '',
  plan: '',
  icd11Codes: undefined,
  temperature: '',
  pulseRate: '',
  respiratoryRate: '',
  bloodPressure: '',
  glucose: '',
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
  onSave?: (note: CleanMedicalNote) => void
  isEditing?: boolean
  isSaving?: boolean
}

export default function CleanMedicalNoteEditor({
  initialNote,
  onSave,
  isEditing = true,
  isSaving = false
}: CleanMedicalNoteEditorProps) {
  const [note, setNote] = useState<CleanMedicalNote>(() => ({
    ...createEmptyNote(),
    ...initialNote
  }))

  const updateField = (field: keyof CleanMedicalNote, value: string) => {
    setNote(prev => ({ ...prev, [field]: value }))
  }



  const handleSave = () => {
    if (onSave) {
      onSave(note)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Notes</h1>
        {isEditing && (
          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        )}
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                   <SelectItem value="Other">Other</SelectItem>
                 </SelectContent>
               </Select>
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
          <CardTitle>Drug History and Allergies</CardTitle>
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

      {/* Social History */}
      <Card>
        <CardHeader>
          <CardTitle>Social History</CardTitle>
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
              <Label>Sexual History</Label>
              <Input
                value={note.sexual}
                onChange={(e) => updateField('sexual', e.target.value)}
                disabled={!isEditing}
                placeholder="Sexual history"
              />
            </div>
          </div>
          <div>
            <Label>Eating Habits</Label>
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

      {/* Review of Systems */}
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
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Physical Examination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Physical Examination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vital Signs */}
          <div>
            <Label className="text-sm font-medium">Vital Signs</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              <div>
                <Label className="text-xs">Temperature</Label>
                <Input
                  value={(note as any).vitalSigns?.temperature || note.temperature || ''}
                  onChange={(e) => updateField('temperature', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 37.5°C"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Pulse Rate</Label>
                <Input
                  value={(note as any).vitalSigns?.pulseRate || note.pulseRate || ''}
                  onChange={(e) => updateField('pulseRate', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 80 bpm"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Respiratory Rate</Label>
                <Input
                  value={(note as any).vitalSigns?.respiratoryRate || note.respiratoryRate || ''}
                  onChange={(e) => updateField('respiratoryRate', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 18/min"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Blood Pressure</Label>
                <Input
                  value={(note as any).vitalSigns?.bloodPressure || note.bloodPressure || ''}
                  onChange={(e) => updateField('bloodPressure', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 120/80"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Glucose Levels</Label>
                <Input
                  value={(note as any).vitalSigns?.glucoseLevels || note.glucose || ''}
                  onChange={(e) => updateField('glucose', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., 5.5 mmol/L"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Physical Examination Findings */}
          <div>
            <Label>Examination Findings</Label>
            <Textarea
              value={note.physicalExamination}
              onChange={(e) => updateField('physicalExamination', e.target.value)}
              disabled={!isEditing}
              placeholder="Enter physical examination findings..."
              rows={4}
            />
          </div>
          
          {/* Medical Diagram - Only show if there are findings */}
          {hasPhysicalExaminationFindings(note) ? (
            <SimpleMedicalDiagram
              patientGender={determinePatientGender(note.patientGender)}
              medicalNoteText={`${note.chiefComplaint || ''} ${note.historyOfPresentingIllness || ''} ${note.physicalExamination || ''} ${note.assessment || ''}`}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm"></p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investigations & Results */}
      <Card>
        <CardHeader>
          <CardTitle>Investigations & Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formatInvestigationsData(note.investigations)}
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
            value={formatPlanData(note.plan)}
            onChange={(e) => updateField('plan', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter treatment plan..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* ICD-11 Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ICD-11 Diagnostic Codes
            <Badge variant="outline" className="text-xs">
              WHO Classification
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {note.icd11Codes ? (
            <div className="space-y-6">
              {/* Primary Codes */}
              {note.icd11Codes.primary && note.icd11Codes.primary.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    Primary Diagnoses
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {note.icd11Codes.primary.length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {note.icd11Codes.primary.map((code, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-blue-600">
                              {code.code}
                            </div>
                            <div className="font-medium text-gray-900 mt-1">
                              {code.title}
                            </div>
                            {code.definition && (
                              <div className="text-sm text-gray-600 mt-1">
                                {code.definition}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {Math.round((code.confidence || 0) * 100)}% match
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {code.matchType}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Codes */}
              {note.icd11Codes.secondary && note.icd11Codes.secondary.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    Secondary Diagnoses
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {note.icd11Codes.secondary.length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {note.icd11Codes.secondary.map((code, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-blue-600">
                              {code.code}
                            </div>
                            <div className="font-medium text-gray-900 mt-1">
                              {code.title}
                            </div>
                            {code.definition && (
                              <div className="text-sm text-gray-600 mt-1">
                                {code.definition}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {Math.round((code.confidence || 0) * 100)}% match
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {code.matchType}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {note.icd11Codes.suggestions && note.icd11Codes.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Suggested Diagnoses
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {note.icd11Codes.suggestions.length}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {note.icd11Codes.suggestions.map((code, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-gray-600">
                              {code.code}
                            </div>
                            <div className="font-medium text-gray-900 mt-1">
                              {code.title}
                            </div>
                            {code.definition && (
                              <div className="text-sm text-gray-600 mt-1">
                                {code.definition}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {Math.round((code.confidence || 0) * 100)}% match
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {code.matchType}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4 mt-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <strong>Extracted Terms:</strong> {note.icd11Codes.extractedTerms.join(', ')}
                  </div>
                  <div>
                    <strong>Processing Time:</strong> {note.icd11Codes.processingTime}ms
                  </div>
                  {note.icd11Codes.lastUpdated && (
                    <div>
                      <strong>Last Updated:</strong> <span className="font-mono text-sm">{new Date(note.icd11Codes.lastUpdated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No ICD-11 codes generated yet</p>
              <p className="text-sm text-gray-500">
                ICD-11 codes will be automatically generated when diagnosis or symptoms information is available
              </p>
            </div>
          )}
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
          <div>
            <Label>Date & Time</Label>
            <Input
              value={note.dateTime}
              onChange={(e) => updateField('dateTime', e.target.value)}
              disabled={!isEditing}
              placeholder="Date and time"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to format investigations data (handle JSON objects)
function formatInvestigationsData(investigations: string): string {
  if (!investigations) return '';
  
  // If it's a JSON string, try to parse and format it
  if (investigations.startsWith('{') && investigations.endsWith('}')) {
    try {
      const parsed = JSON.parse(investigations);
      
      // If it's a managementPlan object, extract the investigations field
      if (parsed.investigations) {
        return parsed.investigations;
      }
      
      // If it's a different structure, format it nicely
      const sections = [];
      if (parsed.investigations && parsed.investigations !== 'N/A') {
        sections.push(`Investigations: ${parsed.investigations}`);
      }
      if (parsed.treatmentAdministered && parsed.treatmentAdministered !== 'N/A') {
        sections.push(`Treatment Administered: ${parsed.treatmentAdministered}`);
      }
      if (parsed.medicationsPrescribed && parsed.medicationsPrescribed !== 'N/A') {
        sections.push(`Medications Prescribed: ${parsed.medicationsPrescribed}`);
      }
      if (parsed.patientEducation && parsed.patientEducation !== 'N/A') {
        sections.push(`Patient Education: ${parsed.patientEducation}`);
      }
      if (parsed.followUp && parsed.followUp !== 'N/A') {
        sections.push(`Follow-up: ${parsed.followUp}`);
      }
      
      return sections.join('\n\n');
    } catch (error) {
      // If parsing fails, return the original string
      return investigations;
    }
  }
  
  // If it's not JSON, return as is
  return investigations;
}

// Helper function to format plan data (handle JSON objects)
function formatPlanData(plan: string): string {
  if (!plan) return '';
  
  // If it's a JSON string, try to parse and format it
  if (plan.startsWith('{') && plan.endsWith('}')) {
    try {
      const parsed = JSON.parse(plan);
      
      // If it's a managementPlan object, extract the treatment plan fields
      const sections = [];
      if (parsed.treatmentAdministered && parsed.treatmentAdministered !== 'N/A') {
        sections.push(`Treatment Administered: ${parsed.treatmentAdministered}`);
      }
      if (parsed.medicationsPrescribed && parsed.medicationsPrescribed !== 'N/A') {
        sections.push(`Medications Prescribed: ${parsed.medicationsPrescribed}`);
      }
      if (parsed.patientEducation && parsed.patientEducation !== 'N/A') {
        sections.push(`Patient Education: ${parsed.patientEducation}`);
      }
      if (parsed.followUp && parsed.followUp !== 'N/A') {
        sections.push(`Follow-up: ${parsed.followUp}`);
      }
      
      return sections.join('\n\n');
    } catch (error) {
      // If parsing fails, return the original string
      return plan;
    }
  }
  
  // If it's not JSON, return as is
  return plan;
}

// Helper function to check if there are physical examination findings
function hasPhysicalExaminationFindings(note: CleanMedicalNote): boolean {
  // Only check physical examination data, not other fields
  const examinationText = note.physicalExamination || ''
  const trimmedText = examinationText.trim()
  
  // Check for meaningful data (not empty, not generic placeholders)
  const hasData = !!(trimmedText && 
                    trimmedText !== 'Not mentioned' &&
                    trimmedText !== 'N/A' &&
                    trimmedText !== 'n/a' &&
                    trimmedText !== 'N/a' &&
                    trimmedText !== 'Physical examination performed as clinically indicated' &&
                    trimmedText !== 'No examination conducted' &&
                    trimmedText !== 'Examination findings will appear here when documented' &&
                    !trimmedText.toLowerCase().includes('no examination') &&
                    !trimmedText.toLowerCase().includes('clinically indicated'))
  
  return hasData
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