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
import {
  ProfessionalMaleBodyFront,
  ProfessionalFemaleBodyFront,
  ProfessionalMaleBodyBack,
  ProfessionalFemaleBodyBack,
  ProfessionalMaleBodySide,
  ProfessionalFemaleBodySide,
  ProfessionalChestDiagram,
  ProfessionalAbdominalDiagram,
  DynamicBodyFront,
  DynamicBodyBack,
  DynamicBodySide
} from '@/components/examination/professional-anatomical-diagrams'
import DynamicMedicalDiagram, { convertExaminationDataToFindings } from '@/components/examination/dynamic-medical-diagram'

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
        return Object.entries(value)
          .filter(([_, v]) => v !== null && v !== undefined && v !== '')
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n') || 'Not recorded'
      } catch (e) {
        return JSON.stringify(value)
      }
    }
    
    // For other types, convert to string
    return String(value)
  }

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg">
      {/* Document Header */}
      <div className="border-b bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Consultation Note</h1>
            <p className="text-sm text-gray-600">Generated on {note.generatedOn}</p>
          </div>
          <div className="flex gap-2">
            {versions.length > 0 && (
              <Button variant="outline" size="sm" onClick={onVersionHistory}>
                <Clock className="h-4 w-4 mr-2" />
                Version History ({versions.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => setIsEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Note
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content - Medical Note */}
      <div className="p-8 space-y-8 bg-white" style={{ fontFamily: 'Georgia, serif' }}>

        {/* Patient Information */}
        <section className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">Patient Information</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><strong>Patient Name:</strong> {formatFieldValue(note.patientName)}</div>
            <div><strong>Age:</strong> {formatFieldValue(note.patientAge)}</div>
            <div><strong>Gender:</strong> {formatFieldValue(note.patientGender)}</div>
            <div><strong>Date of Visit:</strong> {formatFieldValue(note.generatedOn)}</div>
            <div><strong>Patient ID:</strong> {formatFieldValue(note.patientId) || 'Not specified'}</div>
            <div><strong>Doctor:</strong> {formatFieldValue(note.doctorName) || 'Not specified'}</div>
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

        {/* Physical Examination */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900">Physical Examination</h2>
          
          {/* Text-based examination findings */}
          <div className="space-y-3 text-sm mb-6">
            {note.generalExamination && (
              <div>
                <strong>General Examination:</strong>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.generalExamination)}</p>
              </div>
            )}
            {note.cardiovascularExamination && (
              <div>
                <strong>Cardiovascular:</strong>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.cardiovascularExamination)}</p>
              </div>
            )}
            {note.respiratoryExamination && (
              <div>
                <strong>Respiratory:</strong>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.respiratoryExamination)}</p>
              </div>
            )}
            {note.abdominalExamination && (
              <div>
                <strong>Abdominal:</strong>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.abdominalExamination)}</p>
              </div>
            )}
            {note.otherSystemsExamination && (
              <div>
                <strong>Other Systems:</strong>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.otherSystemsExamination)}</p>
              </div>
            )}
          </div>

          {/* Dynamic Anatomical Diagrams Section */}
          {(note.generalExamination || note.cardiovascularExamination || note.respiratoryExamination || note.abdominalExamination) && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-4 text-gray-800 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Physical Examination Diagrams
              </h3>
              
              {(() => {
                // Create mock examination data based on the text findings
                const mockExaminationData = {
                  GEI: {
                    Head: { Head1: note.generalExamination?.includes('head') || note.generalExamination?.includes('Head') ? 'Normal head examination, no abnormalities noted' : '' },
                    Face: { Face1: note.generalExamination?.includes('face') || note.generalExamination?.includes('Face') ? 'Symmetrical face, no facial droop' : '' },
                    Eyes: { 
                      Eye1: note.generalExamination?.includes('eye') || note.generalExamination?.includes('Eye') || note.generalExamination?.includes('PERRLA') ? 'Right eye: PERRLA, no discharge' : '',
                      Eye2: note.generalExamination?.includes('eye') || note.generalExamination?.includes('Eye') || note.generalExamination?.includes('PERRLA') ? 'Left eye: PERRLA, no discharge' : ''
                    },
                    Neck: { Neck1: note.generalExamination?.includes('neck') || note.generalExamination?.includes('Neck') ? 'Neck supple, no lymphadenopathy' : '' },
                    Shoulders: { 
                      Shoulder1: { 
                        1: note.generalExamination?.includes('shoulder') || note.generalExamination?.includes('range of motion') ? 'Right shoulder: Full range of motion' : '',
                        2: note.generalExamination?.includes('shoulder') || note.generalExamination?.includes('range of motion') ? 'Left shoulder: Full range of motion' : ''
                      }
                    },
                    Arms: { 
                      Arm1: { 
                        1: note.generalExamination?.includes('arm') || note.generalExamination?.includes('extremit') ? 'Right arm: Normal strength and sensation' : '',
                        2: note.generalExamination?.includes('arm') || note.generalExamination?.includes('extremit') ? 'Left arm: Normal strength and sensation' : ''
                      },
                      Hand1: { 
                        1: note.generalExamination?.includes('hand') || note.generalExamination?.includes('grip') ? 'Right hand: Normal grip strength' : '',
                        2: note.generalExamination?.includes('hand') || note.generalExamination?.includes('grip') ? 'Left hand: Normal grip strength' : ''
                      }
                    },
                    Legs: { 
                      Thigh1: { 
                        1: note.generalExamination?.includes('thigh') || note.generalExamination?.includes('leg') || note.generalExamination?.includes('lower extremit') ? 'Right thigh: Normal muscle tone' : '',
                        2: note.generalExamination?.includes('thigh') || note.generalExamination?.includes('leg') || note.generalExamination?.includes('lower extremit') ? 'Left thigh: Normal muscle tone' : ''
                      },
                      Knee1: { 
                        1: note.generalExamination?.includes('knee') || note.generalExamination?.includes('swelling') || note.generalExamination?.includes('tender') ? 'Right knee: No swelling or tenderness' : '',
                        2: note.generalExamination?.includes('knee') || note.generalExamination?.includes('swelling') || note.generalExamination?.includes('tender') ? 'Left knee: No swelling or tenderness' : ''
                      },
                      Feet1: { 
                        1: note.generalExamination?.includes('foot') || note.generalExamination?.includes('feet') || note.generalExamination?.includes('circulation') ? 'Right foot: Normal sensation, good circulation' : '',
                        2: note.generalExamination?.includes('foot') || note.generalExamination?.includes('feet') || note.generalExamination?.includes('circulation') ? 'Left foot: Normal sensation, good circulation' : ''
                      }
                    }
                  },
                  CVSRespExamination: {
                    Chest: {
                      A: note.cardiovascularExamination?.includes('heart') || note.cardiovascularExamination?.includes('S1') || note.cardiovascularExamination?.includes('aortic') ? 'Heart sounds: S1, S2 normal, no murmurs' : '',
                      P: note.respiratoryExamination?.includes('lung') || note.respiratoryExamination?.includes('pulmonary') || note.respiratoryExamination?.includes('clear') ? 'Lung sounds: Clear to auscultation bilaterally' : '',
                      T: note.cardiovascularExamination?.includes('tricuspid') || note.cardiovascularExamination?.includes('heart') ? 'Tricuspid area: Normal heart sounds' : '',
                      M: note.cardiovascularExamination?.includes('mitral') || note.cardiovascularExamination?.includes('heart') ? 'Mitral area: Normal heart sounds' : '',
                      JVP: note.cardiovascularExamination?.includes('JVP') || note.cardiovascularExamination?.includes('jugular') ? 'JVP not elevated' : '',
                      G: note.respiratoryExamination?.includes('air entry') || note.respiratoryExamination?.includes('breath') ? 'Good air entry' : '',
                      G2: note.respiratoryExamination?.includes('adventitious') || note.respiratoryExamination?.includes('clear') ? 'No adventitious sounds' : '',
                      G3_1: note.respiratoryExamination?.includes('left') || note.respiratoryExamination?.includes('lobe') ? 'Left lower lobe clear' : '',
                      G3_2: note.respiratoryExamination?.includes('right') || note.respiratoryExamination?.includes('lobe') ? 'Right lower lobe clear' : ''
                    }
                  },
                  AbdominalInguinalExamination: {
                    Stomach: note.abdominalExamination?.includes('soft') || note.abdominalExamination?.includes('tender') || note.abdominalExamination?.includes('stomach') ? 'Soft, non-tender, no masses palpated' : '',
                    Liver: note.abdominalExamination?.includes('liver') || note.abdominalExamination?.includes('hepat') || note.abdominalExamination?.includes('enlarged') ? 'Liver not enlarged, no tenderness' : '',
                    Spleen: note.abdominalExamination?.includes('spleen') || note.abdominalExamination?.includes('palpable') ? 'Spleen not palpable' : '',
                    Umbilicus: note.abdominalExamination?.includes('umbilicus') || note.abdominalExamination?.includes('hernia') ? 'Normal umbilicus, no hernias' : '',
                    Bladder: note.abdominalExamination?.includes('bladder') || note.abdominalExamination?.includes('palpable') ? 'Bladder not palpable when empty' : '',
                    RF: note.abdominalExamination?.includes('flank') || note.abdominalExamination?.includes('right') ? 'Right flank: No tenderness' : '',
                    LF: note.abdominalExamination?.includes('flank') || note.abdominalExamination?.includes('left') ? 'Left flank: No tenderness' : '',
                    Appendix_RIF: note.abdominalExamination?.includes('RIF') || note.abdominalExamination?.includes('appendix') || note.abdominalExamination?.includes('McBurney') ? 'RIF: No tenderness, negative McBurney\'s point' : '',
                    LIF: note.abdominalExamination?.includes('LIF') || note.abdominalExamination?.includes('left') ? 'LIF: Soft, non-tender' : '',
                    Scrotum: note.abdominalExamination?.includes('scrotum') || note.abdominalExamination?.includes('genital') ? 'Normal examination, no masses' : '',
                    Inguinal: {
                      '1_1': note.abdominalExamination?.includes('inguinal') || note.abdominalExamination?.includes('hernia') ? 'Right inguinal: No hernias palpated' : '',
                      '1_2': note.abdominalExamination?.includes('inguinal') || note.abdominalExamination?.includes('hernia') ? 'Left inguinal: No hernias palpated' : ''
                    }
                  }
                }

                // Convert to findings format
                const findings = convertExaminationDataToFindings(mockExaminationData)
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Examination - Front View */}
                    {note.generalExamination && findings.general.length > 0 && (
                      <DynamicMedicalDiagram
                        diagramComponent={() => <DynamicBodyFront gender={note.patientGender} />}
                        findings={findings.general}
                        title="General Examination - Front View"
                        maxWidth="max-w-lg"
                      />
                    )}

                    {/* Back View */}
                    {note.generalExamination && (
                      <DynamicMedicalDiagram
                        diagramComponent={() => <DynamicBodyBack gender={note.patientGender} />}
                        findings={[]} // Back view findings would go here
                        title="General Examination - Back View"
                        maxWidth="max-w-lg"
                      />
                    )}

                    {/* Side View */}
                    {note.generalExamination && (
                      <DynamicMedicalDiagram
                        diagramComponent={() => <DynamicBodySide gender={note.patientGender} />}
                        findings={[]} // Side view findings would go here
                        title="General Examination - Side View"
                        maxWidth="max-w-lg"
                      />
                    )}

                    {/* Cardiovascular & Respiratory */}
                    {(note.cardiovascularExamination || note.respiratoryExamination) && (findings.cardiovascular.length > 0 || findings.respiratory.length > 0) && (
                      <DynamicMedicalDiagram
                        diagramComponent={ProfessionalChestDiagram}
                        findings={[...findings.cardiovascular, ...findings.respiratory]}
                        title="Cardiovascular & Respiratory Examination"
                        maxWidth="max-w-lg"
                      />
                    )}

                    {/* Abdominal Examination */}
                    {note.abdominalExamination && findings.abdominal.length > 0 && (
                      <DynamicMedicalDiagram
                        diagramComponent={ProfessionalAbdominalDiagram}
                        findings={findings.abdominal}
                        title="Abdominal & Inguinal Examination"
                        maxWidth="max-w-lg"
                      />
                    )}
                  </div>
                )
              })()}
            </div>
          )}
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

              {/* Professional Footer */}
              <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                This medical note was generated electronically and is valid with digital authorization
              </div>
            </div>
          </div>
        </section>
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