"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FileText, Stethoscope, Zap, Brain } from 'lucide-react'
import SimpleMedicalNoteEditor, { SimpleMedicalNote } from './simple-medical-note-editor'
import ComprehensiveMedicalNoteEditor, { ComprehensiveExaminationData } from './comprehensive-medical-note-editor'
import { convertToComprehensiveExamination, convertToSimpleMedicalNote } from '@/lib/examination-converter'

type MedicalNoteMode = 'simple' | 'comprehensive'

interface MedicalNoteModeProps {
  initialSimpleNote?: Partial<SimpleMedicalNote>
  initialComprehensiveData?: Partial<ComprehensiveExaminationData>
  onSaveSimple: (note: SimpleMedicalNote) => void
  onSaveComprehensive?: (data: ComprehensiveExaminationData) => void
  isEditing?: boolean
  isSaving?: boolean
  defaultMode?: MedicalNoteMode
}

export default function MedicalNoteModeSelector({
  initialSimpleNote,
  initialComprehensiveData,
  onSaveSimple,
  onSaveComprehensive,
  isEditing = false,
  isSaving = false,
  defaultMode = 'simple'
}: MedicalNoteModeProps) {
  const [selectedMode, setSelectedMode] = useState<MedicalNoteMode>(defaultMode)
  const [showModeSelector, setShowModeSelector] = useState(!initialSimpleNote && !initialComprehensiveData)

  const handleModeChange = (mode: MedicalNoteMode) => {
    setSelectedMode(mode)
    setShowModeSelector(false)
  }

  const handleSaveSimple = (note: SimpleMedicalNote) => {
    onSaveSimple(note)
  }

  const handleSaveComprehensive = (data: ComprehensiveExaminationData) => {
    if (onSaveComprehensive) {
      onSaveComprehensive(data)
    } else {
      // Convert comprehensive data to simple format if no comprehensive handler
      const simpleNote = convertToSimpleMedicalNote(data)
      onSaveSimple(simpleNote)
    }
  }

  // Mode selection interface
  if (showModeSelector && isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Choose Documentation Mode</h2>
          <p className="text-gray-600">Select the most appropriate examination template for your needs</p>
        </div>

        <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as MedicalNoteMode)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simple Mode */}
            <Card className={`cursor-pointer transition-all ${selectedMode === 'simple' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="simple" />
                    <FileText className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Simple Mode</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary">
                      <Zap className="h-3 w-3 mr-1" />
                      Fast
                    </Badge>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Label htmlFor="simple" className="cursor-pointer">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Streamlined medical documentation with essential vital signs and examination findings.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <span>✅ Enhanced vital signs (SpO2, Weight, Height, BMI)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>✅ Quick physical examination sections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>✅ AI-powered diagram integration</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>✅ PDF export ready</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-blue-600">
                      ⏱️ Best for routine consultations and follow-ups
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>

            {/* Comprehensive Mode */}
            <Card className={`cursor-pointer transition-all ${selectedMode === 'comprehensive' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comprehensive" id="comprehensive" />
                    <Stethoscope className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Comprehensive Mode</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary">
                      <Brain className="h-3 w-3 mr-1" />
                      Advanced
                    </Badge>
                    <Badge variant="outline">Professional</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Label htmlFor="comprehensive" className="cursor-pointer">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Detailed systematic examination following professional medical templates with anatomical precision.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <span>🎯 Systematic body region mapping</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🫀 CVS & Respiratory protocol</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🫃 Detailed abdominal examination</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📋 Google Colab template compatible</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-green-600">
                      🏥 Best for complex cases and comprehensive assessments
                    </p>
                  </div>
                </Label>
              </CardContent>
            </Card>
          </div>
        </RadioGroup>

        <div className="flex justify-center mt-8">
          <Button onClick={() => handleModeChange(selectedMode)} size="lg">
            Continue with {selectedMode === 'simple' ? 'Simple' : 'Comprehensive'} Mode
          </Button>
        </div>
      </div>
    )
  }

  // Render the selected editor
  if (selectedMode === 'comprehensive') {
    return (
      <div>
        {isEditing && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModeSelector(true)}
            >
              Switch to Simple Mode
            </Button>
          </div>
        )}
        <ComprehensiveMedicalNoteEditor
          initialData={initialComprehensiveData || (initialSimpleNote ? convertToComprehensiveExamination(initialSimpleNote as SimpleMedicalNote) : undefined)}
          onSave={handleSaveComprehensive}
          isEditing={isEditing}
          isSaving={isSaving}
        />
      </div>
    )
  }

  return (
    <div>
      {isEditing && (
        <div className="mb-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModeSelector(true)}
          >
            Switch to Comprehensive Mode
          </Button>
        </div>
      )}
      <SimpleMedicalNoteEditor
        initialNote={initialSimpleNote || (initialComprehensiveData ? convertToSimpleMedicalNote(initialComprehensiveData as ComprehensiveExaminationData) : undefined)}
        onSave={handleSaveSimple}
        isEditing={isEditing}
        isSaving={isSaving}
      />
    </div>
  )
}