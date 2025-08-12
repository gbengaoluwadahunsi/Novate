"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Edit3, 
  Save, 
  X, 
  Mic, 
  MicOff, 
  Download, 
  FileText, 
  Clock, 
  User,
  MessageSquare,
  Volume2,
  Activity
} from 'lucide-react'
import { SimpleMedicalNote } from './simple-medical-note-editor'
import { voiceInputService, EditInstruction } from '@/lib/voice-input-service'
import NovateMedicalDiagram, { SymptomData } from '@/components/medical-diagram/novate-medical-diagram'
import IntelligentMedicalDiagrams from '@/components/medical-diagram/intelligent-medical-diagrams'



interface DocumentStyleNoteViewerProps {
  note: SimpleMedicalNote
  onSave: (updatedNote: SimpleMedicalNote, changeDescription: string) => void
  onVersionHistory?: () => void
  onExportPDF?: () => void
  versions?: Array<{
    version: number
    timestamp: string
    changes: string
    author: string
  }>
  isLoading?: boolean
}

interface EditRequest {
  field: string
  section: string
  instruction: string
  type: 'text' | 'voice'
}

export default function DocumentStyleNoteViewer({
  note,
  onSave,
  onVersionHistory,
  onExportPDF,
  versions = [],
  isLoading = false
}: DocumentStyleNoteViewerProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editInstruction, setEditInstruction] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [processingEdit, setProcessingEdit] = useState(false)
  const [pendingInstructions, setPendingInstructions] = useState<EditInstruction[]>([])
  
  const currentStreamRef = useRef<MediaStream | null>(null)

  // Enhanced voice recording functionality
  const startRecording = async () => {
    try {
      setProcessingEdit(true)
      const stream = await voiceInputService.startRecording()
      currentStreamRef.current = stream
      setIsRecording(true)
      setProcessingEdit(false)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
      setProcessingEdit(false)
    }
  }

  const stopRecording = async () => {
    if (!isRecording) return
    
    try {
      setIsRecording(false)
      setProcessingEdit(true)
      
      const audioBlob = await voiceInputService.stopRecording()
      
      // Stop all tracks
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop())
        currentStreamRef.current = null
      }
      
      await processVoiceInput(audioBlob)
    } catch (error) {
      console.error('Error stopping recording:', error)
      setProcessingEdit(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // Transcribe audio to text
      const transcription = await voiceInputService.transcribeAudio(audioBlob)
      setEditInstruction(transcription)
      
      // Process the transcription into edit instructions
      const instructions = await voiceInputService.processEditInstruction(transcription)
      setPendingInstructions(instructions)
      
      setProcessingEdit(false)
    } catch (error) {
      console.error('Error processing voice input:', error)
      setProcessingEdit(false)
    }
  }

  const handleApplyEdit = async () => {
    if (!editInstruction.trim()) return

    console.log('🔄 Starting edit application...', { editInstruction })
    setProcessingEdit(true)

    try {
      let instructions = pendingInstructions

      // If no pending instructions from voice, process the text instruction
      if (instructions.length === 0) {
        console.log('📝 Processing text instruction:', editInstruction)
        instructions = await voiceInputService.processEditInstruction(editInstruction)
        console.log('📋 Generated instructions:', instructions)
      }

      if (instructions.length === 0) {
        console.warn('⚠️ No instructions generated from input:', editInstruction)
        // Still continue - the fallback should have created instructions
        instructions = [{
          field: 'historyOfPresentingIllness',
          section: 'History',
          newValue: editInstruction,
          action: 'append',
          confidence: 0.5
        }]
      }

      // Apply the instructions to create updated note
      console.log('🔧 Applying instructions to note...', { originalNote: note, instructions })
      const updatedNote = voiceInputService.applyInstructions(note, instructions)
      console.log('✅ Updated note created:', updatedNote)
      
      // Generate change summary for version history
      const changeSummary = voiceInputService.generateChangeSummary(instructions)
      console.log('📄 Change summary:', changeSummary)
      
      // Save with change description
      console.log('💾 Saving updated note...')
      onSave(updatedNote, changeSummary || editInstruction)
      
      // Reset state
      setIsEditMode(false)
      setEditInstruction('')
      setSelectedSection('')
      setPendingInstructions([])
      setProcessingEdit(false)
      
      console.log('✅ Edit application completed successfully')
    } catch (error) {
      console.error('❌ Error applying edit:', error)
      alert('Error applying changes: ' + (error as Error).message)
      setProcessingEdit(false)
    }
  }

  const formatFieldValue = (value: any): string => {
    if (!value) return 'Not recorded'
    
    // If it's already a string, return it
    if (typeof value === 'string') return value
    
    // If it's an object, handle it appropriately
    if (typeof value === 'object') {
      // If it's an array, join with newlines
      if (Array.isArray(value)) {
        return value.join('\n')
      }
      
      // If it's an object with medical fields, format them nicely
      if (value.investigations || value.treatmentAdministered || value.medicationsPrescribed) {
        const parts: string[] = []
        if (value.investigations) parts.push(`Investigations: ${value.investigations}`)
        if (value.treatmentAdministered) parts.push(`Treatment: ${value.treatmentAdministered}`)
        if (value.medicationsPrescribed) parts.push(`Medications: ${value.medicationsPrescribed}`)
        if (value.patientEducation) parts.push(`Education: ${value.patientEducation}`)
        if (value.followUp) parts.push(`Follow-up: ${value.followUp}`)
        return parts.join('\n')
      }
      
      // For other objects, try to format them nicely
      try {
        const formatted = Object.entries(value)
          .filter(([_, v]) => v !== null && v !== undefined && v !== '')
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n')
        return formatted || 'Not recorded'
      } catch (e) {
        // If it's a JSON string that was parsed, try to extract the content
        if (typeof value === 'object' && value !== null) {
          try {
            return Object.entries(value)
              .filter(([_, v]) => v !== null && v !== undefined && v !== '')
              .map(([key, val]) => `${key}: ${val}`)
              .join('\n')
          } catch {
            return 'Not recorded'
          }
        }
        return 'Not recorded'
      }
    }
    
    // For other types, convert to string
    return String(value)
  }

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg">
      {/* Document Header */}
      <div className="border-b bg-gray-50 px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Medical Consultation Note</h1>
            <p className="text-sm text-gray-600">Generated on {note.generatedOn}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
            {versions.length > 0 && (
              <Button variant="outline" size="sm" onClick={onVersionHistory} className="w-full sm:w-auto">
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Version History ({versions.length})</span>
                <span className="sm:hidden">History ({versions.length})</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExportPDF} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => setIsEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content - Medical Note */}
      <div className="p-8 space-y-8 bg-white" style={{ fontFamily: 'Georgia, serif' }}>

        {/* Patient Information */}
        <section className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">Patient Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Name:</strong> {formatFieldValue(note.patientName)}</div>
            <div><strong>Age:</strong> {formatFieldValue(note.patientAge)}</div>
            <div><strong>Gender:</strong> {formatFieldValue(note.patientGender)}</div>
            <div><strong>Patient ID:</strong> {formatFieldValue(note.patientId)}</div>
          </div>
        </section>

        {/* Vital Signs */}
        <section className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">Vital Signs</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Temperature:</strong> {formatFieldValue(note.temperature)}</div>
            <div><strong>Pulse Rate:</strong> {formatFieldValue(note.pulseRate)}</div>
            <div><strong>Respiratory Rate:</strong> {formatFieldValue(note.respiratoryRate)}</div>
            <div><strong>Blood Pressure:</strong> {formatFieldValue(note.bloodPressure)}</div>
            <div><strong>SpO2:</strong> {formatFieldValue(note.spo2)}</div>
            <div><strong>Weight:</strong> {formatFieldValue(note.weight)}</div>
            <div><strong>Height:</strong> {formatFieldValue(note.height)}</div>
            <div><strong>BMI:</strong> {
              (() => {
                const bmiValue = formatFieldValue(note.bmi)
                const bmiStatus = formatFieldValue(note.bmiStatus)
                
                // If both are "Not recorded", show single "Not recorded"
                if (bmiValue === 'Not recorded' && bmiStatus === 'Not recorded') {
                  return 'Not recorded'
                }
                
                // If BMI value exists but status doesn't
                if (bmiValue !== 'Not recorded' && bmiStatus === 'Not recorded') {
                  return bmiValue
                }
                
                // If status exists but BMI value doesn't
                if (bmiValue === 'Not recorded' && bmiStatus !== 'Not recorded') {
                  return `Status: ${bmiStatus}`
                }
                
                // If both exist, show both
                return `${bmiValue} (${bmiStatus})`
              })()
            }</div>
          </div>
          {(note.takenOn || note.takenBy) && (
            <div className="mt-2 text-xs text-gray-600">
              Taken on: {note.takenOn} | By: {note.takenBy}
            </div>
          )}
        </section>

        {/* Chief Complaint */}
        {note.chiefComplaint && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Chief Complaint</h2>
            <p className="text-sm leading-relaxed">{formatFieldValue(note.chiefComplaint)}</p>
          </section>
        )}

        {/* History of Presenting Illness */}
        {note.historyOfPresentingIllness && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">History of Presenting Illness</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.historyOfPresentingIllness)}</p>
          </section>
        )}

        {/* Past Medical History */}
        {(note.medicalConditions || note.surgeries || note.hospitalizations || note.medications || note.allergies) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Past Medical History</h2>
            <div className="space-y-2 text-sm">
              {note.medicalConditions && <div><strong>Medical Conditions:</strong> {formatFieldValue(note.medicalConditions)}</div>}
              {note.surgeries && <div><strong>Surgeries:</strong> {formatFieldValue(note.surgeries)}</div>}
              {note.hospitalizations && <div><strong>Hospitalizations:</strong> {formatFieldValue(note.hospitalizations)}</div>}
              {note.medications && <div><strong>Current Medications:</strong> {formatFieldValue(note.medications)}</div>}
              {note.allergies && <div><strong>Allergies:</strong> {formatFieldValue(note.allergies)}</div>}
            </div>
          </section>
        )}

        {/* Social History */}
        {(note.smoking || note.alcohol || note.recreationalDrugs || note.occupationLivingSituation) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Social History</h2>
            <div className="space-y-2 text-sm">
              {note.smoking && <div><strong>Smoking:</strong> {formatFieldValue(note.smoking)}</div>}
              {note.alcohol && <div><strong>Alcohol:</strong> {formatFieldValue(note.alcohol)}</div>}
              {note.recreationalDrugs && <div><strong>Recreation Drugs:</strong> {formatFieldValue(note.recreationalDrugs)}</div>}
              {note.occupationLivingSituation && <div><strong>Occupation/Living:</strong> {formatFieldValue(note.occupationLivingSituation)}</div>}
              {note.travel && <div><strong>Travel History:</strong> {formatFieldValue(note.travel)}</div>}
              {note.eatingOut && <div><strong>Eating Habits:</strong> {formatFieldValue(note.eatingOut)}</div>}
            </div>
          </section>
        )}

        {/* Family History */}
        {note.familyHistory && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Family History</h2>
            <p className="text-sm leading-relaxed">{formatFieldValue(note.familyHistory)}</p>
          </section>
        )}

        {/* Review of Systems */}
        {note.systemsReview && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Review of Systems</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.systemsReview)}</p>
          </section>
        )}

                {/* Physical Examination with Intelligent Visual Diagrams */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900">Physical Examination</h2>
          
          {/* Intelligent Medical Diagrams - Auto-selects relevant views */}
          <div className="space-y-6">
            <IntelligentMedicalDiagrams
              examinationData={{
                generalExamination: note.generalExamination,
                cardiovascularExamination: note.cardiovascularExamination,
                respiratoryExamination: note.respiratoryExamination,
                abdominalExamination: note.abdominalExamination,
                otherSystemsExamination: note.otherSystemsExamination,
                chiefComplaint: note.chiefComplaint,
                historyOfPresentingIllness: note.historyOfPresentingIllness
              }}
              patientGender={determinePatientGender(note.patientGender)}
              className="max-w-6xl mx-auto"
            />
            
            {/* Text summary below diagrams for reference */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3 text-gray-700">Examination Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {note.generalExamination && (
                  <div>
                    <strong className="text-blue-600">General:</strong>
                    <p className="mt-1 text-gray-600">{formatFieldValue(note.generalExamination)}</p>
                  </div>
                )}
                {note.cardiovascularExamination && (
                  <div>
                    <strong className="text-red-600">Cardiovascular:</strong>
                    <p className="mt-1 text-gray-600">{formatFieldValue(note.cardiovascularExamination)}</p>
                  </div>
                )}
                {note.respiratoryExamination && (
                  <div>
                    <strong className="text-green-600">Respiratory:</strong>
                    <p className="mt-1 text-gray-600">{formatFieldValue(note.respiratoryExamination)}</p>
                  </div>
                )}
                {note.abdominalExamination && (
                  <div>
                    <strong className="text-orange-600">Abdominal:</strong>
                    <p className="mt-1 text-gray-600">{formatFieldValue(note.abdominalExamination)}</p>
                  </div>
                )}
                {note.otherSystemsExamination && (
                  <div>
                    <strong className="text-purple-600">Other Systems:</strong>
                    <p className="mt-1 text-gray-600">{formatFieldValue(note.otherSystemsExamination)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Investigations */}
        {(note.investigations || (typeof note.investigations === 'object' && note.investigations)) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Investigations</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.investigations)}</p>
          </section>
        )}

        {/* Assessment */}
        {(note.assessment || (typeof note.assessment === 'object' && note.assessment)) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Assessment</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.assessment)}</p>
          </section>
        )}

        {/* Plan */}
        {(note.plan || (typeof note.plan === 'object' && note.plan)) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-900">Plan</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.plan)}</p>
          </section>
        )}

        {/* Doctor Information & Signature */}
        <section className="pt-8 mt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Doctor Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Doctor Information</h3>
              {note.doctorName && (
                <div className="text-sm">
                  <span className="font-medium text-gray-600">Doctor:</span>
                  <span className="ml-2 text-gray-900">{note.doctorName}</span>
                  {note.doctorRegistrationNo && (
                    <div className="mt-1">
                      <span className="font-medium text-gray-600">Registration No:</span>
                      <span className="ml-2 text-gray-900">{note.doctorRegistrationNo}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium text-gray-600">Generated on:</span>
                <span className="ml-2 text-gray-900">{note.generatedOn}</span>
              </div>
            </div>

            {/* Signature & Stamp */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Authorization</h3>
              
              {/* Signature Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm font-medium text-gray-600 mb-3">Doctor Signature:</div>
                <div className="min-h-[60px] bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                  {note.signature ? (
                    <img 
                      src={note.signature} 
                      alt="Doctor Signature" 
                      className="max-h-14 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No signature uploaded</span>
                  )}
                </div>
              </div>

              {/* Stamp Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm font-medium text-gray-600 mb-3">Official Stamp:</div>
                <div className="min-h-[60px] bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                  {note.stamp ? (
                    <img 
                      src={note.stamp} 
                      alt="Doctor Stamp" 
                      className="max-h-14 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No stamp uploaded</span>
                  )}
                </div>
              </div>

              
            </div>
          </div>
        </section>

        {/* Original Transcript Section - For Validation & Transparency */}
        {(note.originalTranscript || note.transcript) && (
          <section className="border-t pt-6 mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Original Audio Transcript</h3>
                <Badge variant="outline" className="text-xs">
                  For Validation
                </Badge>
              </div>
              <div className="text-xs text-gray-600 mb-3">
                This is the original transcript from the audio recording to ensure accuracy and prevent hallucination.
              </div>
              <div className="bg-white border rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {note.originalTranscript || note.transcript || 'No transcript available'}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Medical Note
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">What changes would you like to make?</Label>
              <p className="text-xs text-gray-600 mb-2">
                Describe the changes you want in natural language, or use voice input
              </p>
              <Textarea
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                placeholder="e.g., 'Change the blood pressure to 120/80', 'Add that patient seems comfortable', 'Update temperature to 37.2°C'"
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={processingEdit}
                className={isRecording ? "text-red-600 border-red-300" : ""}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>
              
              {processingEdit && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Processing...
                </div>
              )}
            </div>

            {/* Preview of Detected Changes */}
            {pendingInstructions.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Detected Changes:</h4>
                <div className="space-y-1">
                  {pendingInstructions.map((instruction, index) => (
                    <div key={index} className="text-xs text-blue-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>
                        <strong>{instruction.section}</strong>: {instruction.action} "{instruction.field}" 
                        {instruction.action === 'replace' && ` to "${instruction.newValue}"`}
                        {instruction.action === 'append' && ` with "${instruction.newValue}"`}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {Math.round(instruction.confidence * 100)}% confident
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditMode(false)
                  setEditInstruction('')
                  setSelectedSection('')
                }}
                disabled={processingEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleApplyEdit}
                disabled={!editInstruction.trim() || processingEdit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {processingEdit ? 'Applying Changes...' : 'Apply Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to extract symptoms from medical note for diagram visualization
function extractSymptomsFromNote(note: SimpleMedicalNote): SymptomData[] {
  const symptoms: SymptomData[] = []
  
  // Extract from general examination
  if (note.generalExamination) {
    const findings = extractFindingsFromText(note.generalExamination, 'general')
    symptoms.push(...findings)
  }
  
  // Extract from cardiovascular examination
  if (note.cardiovascularExamination) {
    const findings = extractFindingsFromText(note.cardiovascularExamination, 'cardiovascular')
    symptoms.push(...findings)
  }
  
  // Extract from respiratory examination
  if (note.respiratoryExamination) {
    const findings = extractFindingsFromText(note.respiratoryExamination, 'respiratory')
    symptoms.push(...findings)
  }
  
  // Extract from abdominal examination
  if (note.abdominalExamination) {
    const findings = extractFindingsFromText(note.abdominalExamination, 'abdominal')
    symptoms.push(...findings)
  }
  
  // Extract from chief complaint and history
  if (note.chiefComplaint) {
    const findings = extractFindingsFromText(note.chiefComplaint, 'chief_complaint')
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
    // Cardiovascular findings
    'murmur': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    'heart sounds': { bodyPart: 'chest', coordinates: { x: 0.48, y: 0.35 } },
    'irregular rhythm': { bodyPart: 'chest', coordinates: { x: 0.52, y: 0.35 } },
    'chest pain': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    'palpitations': { bodyPart: 'chest', coordinates: { x: 0.5, y: 0.35 } },
    
    // Respiratory findings
    'breath sounds': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'wheezing': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'crackles': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'shortness of breath': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    'cough': { bodyPart: 'chest', coordinates: { x: 0.45, y: 0.32 } },
    
    // Abdominal findings
    'abdominal pain': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'tenderness': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'distension': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'bowel sounds': { bodyPart: 'abdomen', coordinates: { x: 0.5, y: 0.55 } },
    'hepatomegaly': { bodyPart: 'abdomen', coordinates: { x: 0.52, y: 0.52 } },
    'splenomegaly': { bodyPart: 'abdomen', coordinates: { x: 0.48, y: 0.52 } },
    
    // General findings
    'swelling': { bodyPart: 'lower_extremity', coordinates: { x: 0.5, y: 0.8 } },
    'edema': { bodyPart: 'lower_extremity', coordinates: { x: 0.5, y: 0.8 } },
    'headache': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.15 } },
    'neck pain': { bodyPart: 'head', coordinates: { x: 0.5, y: 0.25 } },
    'back pain': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } },
    'fatigue': { bodyPart: 'general', coordinates: { x: 0.5, y: 0.5 } }
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
        description: `${systemType} examination finding`,
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