"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Printer, Share2, Trash2, Edit2, Save, Eye, History, X, Clock, User, FileDown, GitCompare, RotateCcw, Shield, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiClient, type MedicalNote, type NoteVersion, type AuditTrailEntry, type VersionComparison } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { PerformanceMonitor } from '@/lib/performance'
import { useAppSelector } from '@/store/hooks'
import { MedicalNotePDFGenerator } from '@/lib/pdf-generator'
import ComprehensiveMedicalNoteEditor from '@/components/medical-note/comprehensive-medical-note-editor'
import { generateAndDownloadComprehensivePDF } from '@/lib/comprehensive-pdf-generator'
import { ComprehensiveMedicalNote } from '@/types/medical-note-comprehensive'

export default function NotePage() {
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [useComprehensiveEditor, setUseComprehensiveEditor] = useState(false)

  const handleBack = () => {
    router.push('/dashboard/notes')
  }

  useEffect(() => {
    if (noteId) {
      // Load note data
      setIsLoading(false)
      setNote({
        id: noteId,
        patientName: "Test Patient",
        patientAge: 25,
        patientGender: "Male",
        chiefComplaint: "Test complaint",
        noteType: "consultation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any)
    }
  }, [noteId])

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Note not found</h2>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to notes
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-6 no-print">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Back to Notes</span>
      </div>

      <div className="flex justify-between gap-2 mb-6 no-print">
        <div className="flex items-center gap-2">
          <Label htmlFor="comprehensive-toggle" className="text-sm font-medium">
            Comprehensive Editor
          </Label>
          <input
            id="comprehensive-toggle"
            type="checkbox"
            checked={useComprehensiveEditor}
            onChange={(e) => setUseComprehensiveEditor(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
      </div>

      {useComprehensiveEditor ? (
        <div className="max-w-6xl mx-auto">
          <ComprehensiveMedicalNoteEditor
            initialData={{
              PatientInfo: {
                Name: note.patientName || '',
                Age: note.patientAge?.toString() || '',
                Sex: note.patientGender || 'Male',
                ID: '',
                Chaperone: ''
              }
            }}
            onSave={(updatedNote) => {
              console.log('Saving note:', updatedNote)
            }}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm border border-gray-200 space-y-8">
          <h1 className="text-2xl font-bold">Medical Note - Old Editor</h1>
          <p>Patient: {note.patientName}</p>
          <p>Chief Complaint: {note.chiefComplaint}</p>
        </div>
      )}
    </div>
  )
}