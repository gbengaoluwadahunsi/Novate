"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Edit3, 
  Save, 
  X, 
  Mic, 
  MicOff, 
  Download, 
  User,
  Activity,
  Heart,
  Volume2
} from 'lucide-react'
import { ComprehensiveExaminationData } from '@/types/comprehensive-examination'
import { voiceInputService, EditInstruction } from '@/lib/voice-input-service'
import { 
  ProfessionalMaleBodyFront, 
  ProfessionalFemaleBodyFront, 
  ProfessionalBodyBack, 
  ProfessionalBodySide,
  ProfessionalChestDiagram, 
  ProfessionalAbdominalDiagram 
} from './professional-anatomical-diagrams'

interface ComprehensiveExaminationDiagramViewerProps {
  examinationData: ComprehensiveExaminationData
  onSave: (updatedData: ComprehensiveExaminationData, changeDescription: string) => void
  onExportPDF?: () => void
  isLoading?: boolean
}

interface ExaminationPoint {
  id: string
  x: number
  y: number
  label: string
  value: string
  section: string
  field: string
}

export default function ComprehensiveExaminationDiagramViewer({
  examinationData,
  onSave,
  onExportPDF,
  isLoading = false
}: ComprehensiveExaminationDiagramViewerProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editInstruction, setEditInstruction] = useState('')
  const [isRecording, setIsRecording] = useState(false)
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

    console.log('🔄 Starting examination edit application...', { editInstruction })
    setProcessingEdit(true)

    try {
      let instructions = pendingInstructions

      // If no pending instructions from voice, process the text instruction
      if (instructions.length === 0) {
        console.log('📝 Processing examination text instruction:', editInstruction)
        instructions = await voiceInputService.processEditInstruction(editInstruction)
        console.log('📋 Generated examination instructions:', instructions)
      }

      if (instructions.length === 0) {
        console.warn('⚠️ No examination instructions generated from input:', editInstruction)
        // Fallback for examination data
        instructions = [{
          field: 'GEI.Head.Head1',
          section: 'General Examination',
          newValue: editInstruction,
          action: 'append',
          confidence: 0.5
        }]
      }

      // Apply the instructions to create updated examination data
      console.log('🔧 Applying instructions to examination data...', { originalData: examinationData, instructions })
      const updatedData = applyInstructionsToExaminationData(examinationData, instructions)
      console.log('✅ Updated examination data created:', updatedData)
      
      // Generate change summary for version history
      const changeSummary = voiceInputService.generateChangeSummary(instructions)
      console.log('📄 Examination change summary:', changeSummary)
      
      // Save with change description
      console.log('💾 Saving updated examination data...')
      onSave(updatedData, changeSummary || editInstruction)
      
      // Reset state
      setIsEditMode(false)
      setEditInstruction('')
      setPendingInstructions([])
      setProcessingEdit(false)
      
      console.log('✅ Examination edit application completed successfully')
    } catch (error) {
      console.error('❌ Error applying examination edit:', error)
      alert('Error applying changes: ' + (error as Error).message)
      setProcessingEdit(false)
    }
  }

  // Apply instructions to comprehensive examination data
  const applyInstructionsToExaminationData = (data: ComprehensiveExaminationData, instructions: EditInstruction[]): ComprehensiveExaminationData => {
    const updatedData = JSON.parse(JSON.stringify(data)) // Deep clone

    instructions.forEach(instruction => {
      const { field, newValue, action } = instruction
      
      // Handle nested field paths like 'GEI.Head.Head1'
      const fieldPath = field.split('.')
      let current: any = updatedData
      
      // Navigate to the parent object
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {}
        }
        current = current[fieldPath[i]]
      }
      
      const finalField = fieldPath[fieldPath.length - 1]
      
      switch (action) {
        case 'replace':
          current[finalField] = newValue
          break
          
        case 'append':
          const currentValue = current[finalField] || ''
          current[finalField] = currentValue 
            ? `${currentValue}; ${newValue}` 
            : newValue
          break
          
        case 'insert':
          current[finalField] = newValue
          break
          
        case 'delete':
          current[finalField] = ''
          break
      }
    })

    return updatedData
  }

  // Generate examination points for different diagrams
  const generateBodyExaminationPoints = (): ExaminationPoint[] => {
    const points: ExaminationPoint[] = []
    
    // Head examination points (positioned on body diagram) - adjusted for 300x600 viewBox
    if (examinationData.GEI.Head.Head1) {
      points.push({
        id: 'head1',
        x: 150, y: 55, // SVG coordinates - adjusted for professional diagram
        label: 'Head',
        value: examinationData.GEI.Head.Head1,
        section: 'General Examination',
        field: 'GEI.Head.Head1'
      })
    }
    
    if (examinationData.GEI.Face.Face1) {
      points.push({
        id: 'face1',
        x: 150, y: 45, // Adjusted for professional diagram
        label: 'Face',
        value: examinationData.GEI.Face.Face1,
        section: 'General Examination',
        field: 'GEI.Face.Face1'
      })
    }
    
    // Eye examinations - adjusted for professional diagram
    if (examinationData.GEI.Eyes.Eye1) {
      points.push({
        id: 'eye1',
        x: 138, y: 42, // Right eye position
        label: 'Right Eye',
        value: examinationData.GEI.Eyes.Eye1,
        section: 'General Examination',
        field: 'GEI.Eyes.Eye1'
      })
    }
    
    if (examinationData.GEI.Eyes.Eye2) {
      points.push({
        id: 'eye2',
        x: 162, y: 42, // Left eye position
        label: 'Left Eye', 
        value: examinationData.GEI.Eyes.Eye2,
        section: 'General Examination',
        field: 'GEI.Eyes.Eye2'
      })
    }
    
    // Neck examination
    if (examinationData.GEI.Neck.Neck1) {
      points.push({
        id: 'neck1',
        x: 150, y: 90, // Neck area in professional diagram
        label: 'Neck',
        value: examinationData.GEI.Neck.Neck1,
        section: 'General Examination',
        field: 'GEI.Neck.Neck1'
      })
    }
    
    // Shoulder examinations
    if (examinationData.GEI.Shoulders?.Shoulder1?.[1]) {
      points.push({
        id: 'shoulder1',
        x: 142, y: 130,
        label: 'Right Shoulder',
        value: examinationData.GEI.Shoulders.Shoulder1[1],
        section: 'General Examination',
        field: 'GEI.Shoulders.Shoulder1.1'
      })
    }
    
    if (examinationData.GEI.Shoulders?.Shoulder1?.[2]) {
      points.push({
        id: 'shoulder2',
        x: 258, y: 130,
        label: 'Left Shoulder',
        value: examinationData.GEI.Shoulders.Shoulder1[2],
        section: 'General Examination',
        field: 'GEI.Shoulders.Shoulder1.2'
      })
    }
    
    // Arm examinations
    if (examinationData.GEI.Arms?.Arm1?.[1]) {
      points.push({
        id: 'arm1',
        x: 142, y: 170,
        label: 'Right Arm',
        value: examinationData.GEI.Arms.Arm1[1],
        section: 'General Examination',
        field: 'GEI.Arms.Arm1.1'
      })
    }
    
    if (examinationData.GEI.Arms?.Arm1?.[2]) {
      points.push({
        id: 'arm2',
        x: 258, y: 170,
        label: 'Left Arm',
        value: examinationData.GEI.Arms.Arm1[2],
        section: 'General Examination',
        field: 'GEI.Arms.Arm1.2'
      })
    }
    
    // Hand examinations
    if (examinationData.GEI.Arms?.Hand1?.[1]) {
      points.push({
        id: 'hand1',
        x: 142, y: 320,
        label: 'Right Hand',
        value: examinationData.GEI.Arms.Hand1[1],
        section: 'General Examination',
        field: 'GEI.Arms.Hand1.1'
      })
    }
    
    if (examinationData.GEI.Arms?.Hand1?.[2]) {
      points.push({
        id: 'hand2',
        x: 258, y: 320,
        label: 'Left Hand',
        value: examinationData.GEI.Arms.Hand1[2],
        section: 'General Examination',
        field: 'GEI.Arms.Hand1.2'
      })
    }
    
    // Leg examinations
    if (examinationData.GEI.Legs?.Thigh1?.[1]) {
      points.push({
        id: 'thigh1',
        x: 185, y: 405,
        label: 'Right Thigh',
        value: examinationData.GEI.Legs.Thigh1[1],
        section: 'General Examination',
        field: 'GEI.Legs.Thigh1.1'
      })
    }
    
    if (examinationData.GEI.Legs?.Thigh1?.[2]) {
      points.push({
        id: 'thigh2',
        x: 215, y: 405,
        label: 'Left Thigh',
        value: examinationData.GEI.Legs.Thigh1[2],
        section: 'General Examination',
        field: 'GEI.Legs.Thigh1.2'
      })
    }
    
    // Knee examinations
    if (examinationData.GEI.Legs?.Knee1?.[1]) {
      points.push({
        id: 'knee1',
        x: 185, y: 460,
        label: 'Right Knee',
        value: examinationData.GEI.Legs.Knee1[1],  
        section: 'General Examination',
        field: 'GEI.Legs.Knee1.1'
      })
    }
    
    if (examinationData.GEI.Legs?.Knee1?.[2]) {
      points.push({
        id: 'knee2',
        x: 215, y: 460,
        label: 'Left Knee',
        value: examinationData.GEI.Legs.Knee1[2],
        section: 'General Examination',
        field: 'GEI.Legs.Knee1.2'
      })
    }
    
    // Feet examinations
    if (examinationData.GEI.Legs?.Feet1?.[1]) {
      points.push({
        id: 'feet1',
        x: 185, y: 570,
        label: 'Right Foot',
        value: examinationData.GEI.Legs.Feet1[1],
        section: 'General Examination',
        field: 'GEI.Legs.Feet1.1'
      })
    }
    
    if (examinationData.GEI.Legs?.Feet1?.[2]) {
      points.push({
        id: 'feet2',
        x: 215, y: 570,
        label: 'Left Foot',
        value: examinationData.GEI.Legs.Feet1[2],
        section: 'General Examination',
        field: 'GEI.Legs.Feet1.2'
      })
    }
    
    return points
  }

  const generateChestExaminationPoints = (): ExaminationPoint[] => {
    const points: ExaminationPoint[] = []
    
    // CVS & Respiratory examination points (positioned on chest diagram)
    if (examinationData.CVSRespExamination?.Chest?.A) {
      points.push({
        id: 'chest_a',
        x: 200, y: 120,
        label: 'Aortic Area',
        value: examinationData.CVSRespExamination.Chest.A,
        section: 'Cardiovascular Examination',
        field: 'CVSRespExamination.Chest.A'
      })
    }
    
    if (examinationData.CVSRespExamination?.Chest?.P) {
      points.push({
        id: 'chest_p',
        x: 300, y: 120,
        label: 'Pulmonary Area',
        value: examinationData.CVSRespExamination.Chest.P,
        section: 'Cardiovascular Examination',
        field: 'CVSRespExamination.Chest.P'
      })
    }
    
    if (examinationData.CVSRespExamination?.Chest?.T) {
      points.push({
        id: 'chest_t',
        x: 220, y: 160,
        label: 'Tricuspid Area',
        value: examinationData.CVSRespExamination.Chest.T,
        section: 'Cardiovascular Examination',
        field: 'CVSRespExamination.Chest.T'
      })
    }
    
    if (examinationData.CVSRespExamination?.Chest?.M) {
      points.push({
        id: 'chest_m',
        x: 280, y: 160,
        label: 'Mitral Area',
        value: examinationData.CVSRespExamination.Chest.M,
        section: 'Cardiovascular Examination',
        field: 'CVSRespExamination.Chest.M'
      })
    }
    
    return points
  }

  const generateAbdominalExaminationPoints = (): ExaminationPoint[] => {
    const points: ExaminationPoint[] = []
    
    // Abdominal examination points
    if (examinationData.AbdominalInguinalExamination?.Stomach) {
      points.push({
        id: 'stomach',
        x: 180, y: 110,
        label: 'Stomach',
        value: examinationData.AbdominalInguinalExamination.Stomach,
        section: 'Abdominal Examination',
        field: 'AbdominalInguinalExamination.Stomach'
      })
    }
    
    if (examinationData.AbdominalInguinalExamination?.Liver) {
      points.push({
        id: 'liver',
        x: 170, y: 95,
        label: 'Liver',
        value: examinationData.AbdominalInguinalExamination.Liver,
        section: 'Abdominal Examination',
        field: 'AbdominalInguinalExamination.Liver'
      })
    }
    
    if (examinationData.AbdominalInguinalExamination?.Spleen) {
      points.push({
        id: 'spleen',
        x: 270, y: 110,
        label: 'Spleen',
        value: examinationData.AbdominalInguinalExamination.Spleen,
        section: 'Abdominal Examination',
        field: 'AbdominalInguinalExamination.Spleen'
      })
    }
    
    if (examinationData.AbdominalInguinalExamination?.Umbilicus) {
      points.push({
        id: 'umbilicus',
        x: 200, y: 175,
        label: 'Umbilicus',
        value: examinationData.AbdominalInguinalExamination.Umbilicus,
        section: 'Abdominal Examination',
        field: 'AbdominalInguinalExamination.Umbilicus'
      })
    }
    
    if (examinationData.AbdominalInguinalExamination?.Bladder) {
      points.push({
        id: 'bladder',
        x: 200, y: 270,
        label: 'Bladder',
        value: examinationData.AbdominalInguinalExamination.Bladder,
        section: 'Abdominal Examination',
        field: 'AbdominalInguinalExamination.Bladder'
      })
    }
    
    return points
  }

  const bodyExaminationPoints = generateBodyExaminationPoints()
  const chestExaminationPoints = generateChestExaminationPoints()
  const abdominalExaminationPoints = generateAbdominalExaminationPoints()

  const formatFieldValue = (value: any): string => {
    if (!value) return 'Not recorded'
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      try {
        return Object.entries(value)
          .filter(([_, v]) => v !== null && v !== undefined && v !== '')
          .map(([key, val]) => `${key}: ${val}`)
          .join('; ') || 'Not recorded'
      } catch (e) {
        return JSON.stringify(value)
      }
    }
    return String(value)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Physical Examination
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  AI-Enhanced Medical Documentation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
              <Button 
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Examination
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="text-sm">{examinationData.PatientInfo.Name || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Age</div>
            <div className="text-sm">{examinationData.PatientInfo.Age || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Gender</div>
            <div className="text-sm">{examinationData.PatientInfo.Sex || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Patient ID</div>
            <div className="text-sm">{examinationData.PatientInfo.ID || 'Not recorded'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Temperature</div>
            <div className="text-sm">{examinationData.VitalSigns.Temperature || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Pulse Rate</div>
            <div className="text-sm">{examinationData.VitalSigns.PulseRate || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Blood Pressure</div>
            <div className="text-sm">{examinationData.VitalSigns.BloodPressure || 'Not recorded'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">SpO2</div>
            <div className="text-sm">{examinationData.VitalSigns.SpO2 || 'Not recorded'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Anatomical Diagrams */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Examination Diagrams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Examination Diagram */}
          <div className="relative">
            <h3 className="text-lg font-medium mb-4">General Examination</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Front View */}
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <h4 className="text-sm font-medium mb-2 text-center">Front View</h4>
                <div className="relative">
                  {examinationData.PatientInfo.Sex === 'Female' ? (
                    <ProfessionalFemaleBodyFront className="w-full h-auto max-h-96" />
                  ) : (
                    <ProfessionalMaleBodyFront className="w-full h-auto max-h-96" />
                  )}
                  
                  {/* Examination point overlays */}
                  {bodyExaminationPoints.map((point) => (
                    <div
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ 
                        left: `${(point.x / 300) * 100}%`, 
                        top: `${(point.y / 600) * 100}%` 
                      }}
                    >
                      <div className="relative group">
                        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg hover:bg-red-600 transition-colors animate-pulse"></div>
                        <div className="absolute left-4 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <div className="font-medium">{point.label}</div>
                          <div className="text-gray-300 max-w-48 truncate">{point.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side View */}
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <h4 className="text-sm font-medium mb-2 text-center">Side View</h4>
                <div className="relative">
                  <ProfessionalBodySide className="w-full h-auto max-h-96" />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                    <div className="bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
                      Side examination view
                    </div>
                  </div>
                </div>
              </div>

              {/* Back View */}
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 border">
                <h4 className="text-sm font-medium mb-2 text-center">Back View</h4>
                <div className="relative">
                  <ProfessionalBodyBack className="w-full h-auto max-h-96" />
                  
                  {/* Back examination points can be added here */}
                  {bodyExaminationPoints
                    .filter(point => point.field.includes('Hip3') || point.field.includes('Knee3') || point.field.includes('Back'))
                    .map((point) => (
                    <div
                      key={point.id + '_back'}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ 
                        left: `${(point.x / 300) * 100}%`, 
                        top: `${(point.y / 600) * 100}%` 
                      }}
                    >
                      <div className="relative group">
                        <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transition-colors animate-pulse"></div>
                        <div className="absolute left-4 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <div className="font-medium">{point.label}</div>
                          <div className="text-gray-300 max-w-48 truncate">{point.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CVS & Respiratory Examination */}
          {chestExaminationPoints.length > 0 && (
            <div className="relative">
              <h3 className="text-lg font-medium mb-4">Cardiovascular & Respiratory Examination</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                <div className="relative max-w-lg mx-auto">
                  <ProfessionalChestDiagram className="w-full h-auto" />
                  
                  {/* Chest examination point overlays */}
                  {chestExaminationPoints.map((point) => (
                    <div
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ 
                        left: `${(point.x / 400) * 100}%`, 
                        top: `${(point.y / 350) * 100}%` 
                      }}
                    >
                      <div className="relative group">
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg hover:bg-red-600 transition-colors animate-pulse"></div>
                        <div className="absolute left-5 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <div className="font-medium">{point.label}</div>
                          <div className="text-gray-300 max-w-56 break-words">{point.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Abdominal Examination */}
          {abdominalExaminationPoints.length > 0 && (
            <div className="relative">
              <h3 className="text-lg font-medium mb-4">Abdominal & Inguinal Examination</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                <div className="relative max-w-md mx-auto">
                  <ProfessionalAbdominalDiagram className="w-full h-auto" />
                  
                  {/* Abdominal examination point overlays */}
                  {abdominalExaminationPoints.map((point) => (
                    <div
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ 
                        left: `${(point.x / 300) * 100}%`, 
                        top: `${(point.y / 400) * 100}%` 
                      }}
                    >
                      <div className="relative group">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg hover:bg-green-600 transition-colors animate-pulse"></div>
                        <div className="absolute left-5 top-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <div className="font-medium">{point.label}</div>
                          <div className="text-gray-300 max-w-56 break-words">{point.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display message when no examination data */}
          {bodyExaminationPoints.length === 0 && chestExaminationPoints.length === 0 && abdominalExaminationPoints.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Examination Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Physical examination findings will appear as interactive points on the anatomical diagrams once data is recorded.
              </p>
              <Button 
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Add Examination Findings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Examination Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Examination Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Activity className="h-4 w-4" />
            AI-powered examination template ready for professional medical documentation
          </div>
          <div className="text-sm text-gray-500">
            Generated on: {examinationData.GeneratedOn || new Date().toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Edit Examination Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Physical Examination
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              What changes would you like to make to the examination?
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Describe the changes you want in natural language, or use voice input
            </div>
            
            <Textarea
              value={editInstruction}
              onChange={(e) => setEditInstruction(e.target.value)}
              placeholder="e.g., 'Add normal heart sounds to cardiovascular examination' or 'Update head examination with no abnormalities found'"
              className="min-h-[120px]"
              disabled={processingEdit}
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={processingEdit}
                className={isRecording ? 'bg-red-50 border-red-200 text-red-700' : ''}
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
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  {isRecording ? 'Listening...' : 'Processing...'}
                </div>
              )}
              
              {pendingInstructions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingInstructions.length} change{pendingInstructions.length > 1 ? 's' : ''} detected
                </Badge>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditMode(false)
                  setEditInstruction('')
                  setPendingInstructions([])
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