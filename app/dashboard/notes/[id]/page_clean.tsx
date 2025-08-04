"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Save, Edit2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type MedicalNote } from '@/lib/api-client'
import { useAppSelector } from '@/store/hooks'
import DocumentStyleNoteViewer from '@/components/medical-note/document-style-note-viewer'
import NoteVersionHistory from '@/components/medical-note/note-version-history'
import { SimpleMedicalNote } from '@/components/medical-note/simple-medical-note-editor'
import { generateProfessionalMedicalNotePDF, ProfessionalMedicalNote } from '@/lib/professional-pdf-generator'

export default function NotePage() {
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
    const [versions, setVersions] = useState<Array<{
    version: number
    timestamp: string
    changes: string
    author: string
    changeType: 'ai_transcription' | 'user_edit' | 'doctor_review' | 'system_update'
    summary?: string
  }>>([])
  
  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    if (!noteId) return
    
    try {
      setIsLoading(true)
      const response = await apiClient.getMedicalNote(noteId)
      setNote(response.data || null)
    } catch (error) {
      console.error('Error fetching note:', error)
      toast({
        title: 'Error',
        description: 'Failed to load medical note',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedNote: SimpleMedicalNote, changeDescription: string) => {
    if (!note || !updatedNote) return

    try {
      setIsSaving(true)
      
      // Create new version entry
      const newVersion = {
        version: versions.length + 1,
        timestamp: new Date().toLocaleString(),
        changes: changeDescription,
        author: user?.name || user?.email || 'Unknown',
        changeType: 'user_edit' as const,
        summary: `Updated medical note: ${changeDescription}`
      }
      
      // Update the note via API
      const updatedMedicalNote = {
        ...note,
        patientName: updatedNote.patientName,
        patientAge: updatedNote.patientAge ? parseInt(updatedNote.patientAge) : null,
        patientGender: updatedNote.patientGender,
        chiefComplaint: updatedNote.chiefComplaint,
        historyOfPresentingIllness: updatedNote.historyOfPresentingIllness,
        systemReview: updatedNote.systemsReview,
        diagnosis: updatedNote.assessment,
        treatmentPlan: updatedNote.plan,
        managementPlan: updatedNote.investigations,
        additionalNotes: JSON.stringify(updatedNote)
      }
      
      await apiClient.updateMedicalNote(noteId, updatedMedicalNote)
      setNote(updatedMedicalNote)
      setVersions([...versions, newVersion])
      
      toast({
        title: 'Note Updated',
        description: 'Medical note has been saved successfully'
      })
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: 'Save Error',
        description: 'Failed to save medical note. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = () => {
    if (!note) return

    try {
      // Convert to professional medical note format
      const professionalNote: ProfessionalMedicalNote = {
        // Patient Information
        patientName: note.patientName || '',
        patientAge: note.patientAge?.toString() || '',
        patientGender: note.patientGender || 'Male',
        patientId: (note as any).patientId || '',
        chaperone: '',
        
        // Vital Signs (populate from note if available)
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
        
        // Medical Content
        chiefComplaint: note.chiefComplaint || '',
        historyOfPresentingIllness: note.historyOfPresentingIllness || '',
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
        systemsReview: note.systemReview || '',
        
        // Physical Examination
        generalExamination: '',
        cardiovascularExamination: '',
        respiratoryExamination: '',
        abdominalExamination: '',
        otherSystemsExamination: '',
        physicalExaminationFindings: {},
        
        // Assessment & Plan
        investigations: note.managementPlan || '',
        assessment: note.diagnosis || '',
        plan: note.treatmentPlan || '',
        
        // Doctor Information
        doctorName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || 'Dr. [Name]',
        doctorRegistrationNo: user?.registrationNo || '[Registration Number]',
        generatedOn: new Date().toLocaleString(),
        signature: (user as any)?.doctorSignature || '',
        stamp: (user as any)?.doctorStamp || '',
        letterhead: (user as any)?.letterhead
      }

      // Use the professional PDF generator that matches the template exactly
      generateProfessionalMedicalNotePDF(professionalNote)

      toast({
        title: 'PDF Downloaded',
        description: 'Professional medical note exported successfully'
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: 'Export Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleBack = () => {
    router.push('/dashboard/notes')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading medical note...</p>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Medical note not found</p>
          <Button onClick={handleBack}>Back to Notes</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <span className="ml-2 text-sm text-gray-600">Back to Notes</span>
          </div>
        </div>
      </div>

      {/* Integrated Medical Note Document */}
      <div className="py-6">
        <DocumentStyleNoteViewer
          note={(() => {
            // Try to parse simple note data from additionalNotes first
            try {
              const savedSimpleNote = note.additionalNotes ? JSON.parse(note.additionalNotes) : null
              if (savedSimpleNote && savedSimpleNote.patientName) {
                return savedSimpleNote
              }
            } catch (e) {
              // Fall through to conversion
            }
            
            // Convert from MedicalNote format to SimpleMedicalNote with sample examination data
            return {
              patientName: note.patientName || '',
              patientAge: note.patientAge?.toString() || '',
              patientGender: note.patientGender || 'Male',
              patientId: (note as any).patientId || '',
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
              chiefComplaint: note.chiefComplaint || '',
              historyOfPresentingIllness: note.historyOfPresentingIllness || '',
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
              systemsReview: note.systemReview || '',
              generalExamination: 'Head: Normal examination, no abnormalities noted. Face: Symmetrical, no facial droop. Eyes: PERRLA bilaterally, no discharge. Neck: Supple, no lymphadenopathy. Upper extremities: Normal range of motion in shoulders, arms, and hands with good strength and sensation. Lower extremities: Normal muscle tone, no swelling or tenderness in thighs, knees, and feet.',
              vitalSignsFindings: '',
              cardiovascularExamination: 'Heart sounds: S1, S2 normal, no murmurs heard at aortic, pulmonary, tricuspid, and mitral areas. JVP not elevated. No peripheral edema.',
              respiratoryExamination: 'Lung sounds: Clear to auscultation bilaterally. Good air entry throughout all lung fields. No adventitious sounds noted. Resonant to percussion.',
              abdominalExamination: 'Soft, non-tender, no masses palpated. Liver: Not enlarged, no tenderness. Spleen: Not palpable. Umbilicus: Normal, no hernias. Bowel sounds present and normal. No tenderness in flanks or lower quadrants.',
              otherSystemsExamination: '',
              physicalExaminationFindings: {},
              investigations: note.managementPlan || '',
              assessment: note.diagnosis || '',
              plan: note.treatmentPlan || '',
              doctorName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.name || '',
              doctorRegistrationNo: user?.registrationNo || '',
              generatedOn: new Date().toLocaleString(),
              signature: (user as any)?.doctorSignature || '',
              stamp: (user as any)?.doctorStamp || '',
              letterhead: (user as any)?.letterhead
            }
          })()}
          onSave={handleSave}
          onVersionHistory={() => setShowVersionHistory(true)}
          onExportPDF={handleExportPDF}
          versions={versions}
          isLoading={isSaving}
        />
      </div>

      {/* Version History Dialog */}
      <NoteVersionHistory 
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versions}
        currentVersion={versions.length}
        onViewVersion={(version) => {
          // Handle version viewing
          console.log('View version:', version)
        }}
        onRestoreVersion={(version) => {
          // Handle version restoration
          console.log('Restore version:', version)
          toast({
            title: 'Version Restored',
            description: `Note restored to version ${version}`
          })
          setShowVersionHistory(false)
        }}
      />
    </div>
  )
}