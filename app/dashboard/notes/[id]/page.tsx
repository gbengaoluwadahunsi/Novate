"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Printer, Share2, Trash2, Edit2, Save, Eye, History, X, Clock, User, FileDown, GitCompare, RotateCcw, Shield, Loader2 } from "lucide-react"
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

// Define the Note type for better type safety
type Note = {
  id: string
  patientName: string
  patientId: string
  date: string
  noteType: string
  status: string
  tags?: string[]
  content?: string
  doctor?: string
  department?: string
}

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [versions, setVersions] = useState<NoteVersion[]>([])
  // const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]) // Temporarily disabled
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [editedNote, setEditedNote] = useState<Partial<MedicalNote>>({})
  const [selectedVersions, setSelectedVersions] = useState<{ from: number; to: number }>({ from: 1, to: 1 })
  const [versionComparison, setVersionComparison] = useState<VersionComparison | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState<{ version: number; open: boolean }>({ version: 0, open: false })
  const [restoreReason, setRestoreReason] = useState('')

  const performanceMonitor = PerformanceMonitor.getInstance()

  useEffect(() => {
    if (noteId) {
      loadNoteData()
    }
  }, [noteId])

  const loadNoteData = async () => {
    if (!noteId) return
    
    performanceMonitor.startTiming('load-note-data')
    setIsLoading(true)

    try {
      // Load note and versions (audit trail temporarily disabled due to backend 404)
      const [noteResponse, versionsResponse] = await Promise.all([
        apiClient.getMedicalNote(noteId),
        apiClient.getNoteVersions(noteId)
      ])
      
      // TODO: Re-enable when backend implements audit trail endpoint
      // const auditResponse = await apiClient.getNoteAuditTrail(noteId)

      if (noteResponse.success && noteResponse.data) {
        console.log('🔍 COMPLETE Backend Note Response:', JSON.stringify(noteResponse.data, null, 2))
        console.log('🔍 API Endpoint Called:', `/medical-notes/${noteId}`)
        console.log('🔍 Note Patient Name:', noteResponse.data.patientName)
        console.log('🔍 Note Patient Age:', noteResponse.data.patientAge)
        console.log('🔍 Note Patient Gender:', noteResponse.data.patientGender)
        console.log('🔍 Note Chief Complaint:', noteResponse.data.chiefComplaint)
        console.log('🔍 Note History (historyOfPresentIllness):', noteResponse.data.historyOfPresentIllness)
        console.log('🔍 Note History (historyOfPresentingIllness):', noteResponse.data.historyOfPresentingIllness)
        console.log('🔍 Note Past Medical History:', noteResponse.data.pastMedicalHistory)
        console.log('🔍 Note System Review:', noteResponse.data.systemReview)
        console.log('🔍 Note Physical Examination:', noteResponse.data.physicalExamination)
        console.log('🔍 Note Diagnosis:', noteResponse.data.diagnosis)
        console.log('🔍 Note Treatment Plan:', noteResponse.data.treatmentPlan)
        console.log('🔍 Note Follow-up Instructions:', noteResponse.data.followUpInstructions)
        console.log('🔍 Note Additional Notes:', noteResponse.data.additionalNotes)
        console.log('🔍 Full Note Structure:', {
          id: noteResponse.data.id,
          patientName: noteResponse.data.patientName,
          patientAge: noteResponse.data.patientAge,
          patientGender: noteResponse.data.patientGender,
          chiefComplaint: noteResponse.data.chiefComplaint,
          historyOfPresentIllness: noteResponse.data.historyOfPresentIllness,
          historyOfPresentingIllness: noteResponse.data.historyOfPresentingIllness,
          pastMedicalHistory: noteResponse.data.pastMedicalHistory,
          systemReview: noteResponse.data.systemReview,
          physicalExamination: noteResponse.data.physicalExamination,
          diagnosis: noteResponse.data.diagnosis,
          treatmentPlan: noteResponse.data.treatmentPlan,
          followUpInstructions: noteResponse.data.followUpInstructions,
          additionalNotes: noteResponse.data.additionalNotes,
          noteType: noteResponse.data.noteType,
          createdAt: noteResponse.data.createdAt
        })
        
        setNote(noteResponse.data)
        setEditedNote(noteResponse.data)
      }

      if (versionsResponse.success && versionsResponse.data) {
        setVersions(versionsResponse.data.versions)
      }

      // TODO: Re-enable audit trail when backend implements the endpoint
      // if (auditResponse.success && auditResponse.data) {
      //   setAuditTrail(auditResponse.data.auditTrail)
      // }

      performanceMonitor.endTiming('load-note-data')
    } catch (error) {
      logger.error('Error loading note data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load note data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/notes")
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!note) return

    setIsSaving(true)
    performanceMonitor.startTiming('save-note')

    try {
      console.log('🔍 Saving note with data:', editedNote)
      console.log('🔍 Original note data:', note)
      
      const response = await apiClient.updateMedicalNote(noteId, editedNote)
      
      console.log('🔍 Save response:', response)

      if (response.success && response.data) {
        setNote(response.data)
        setIsEditing(false)
        
        // Reload versions and audit trail
        await loadNoteData()

        toast({
          title: 'Note Updated',
          description: 'Medical note has been successfully updated',
        })

        performanceMonitor.endTiming('save-note')
      } else {
        console.log('🔍 Save failed:', response.error)
        throw new Error(response.error || 'Failed to update note')
      }
    } catch (error) {
      logger.error('Error saving note:', error)
      console.log('🔍 Save error details:', error)
      toast({
        title: 'Save Error',
        description: `Failed to save note changes: ${error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!note) return

    // Create a Word document using docx
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Medical Note: ${note.id}`, bold: true, size: 28 }),
              ],
            }),
            new Paragraph(""),
            new Paragraph(`Patient: ${note.patientName}`),
            new Paragraph(`Age: ${note.patientAge} • Gender: ${note.patientGender}`),
            new Paragraph(`Date: ${new Date(note.createdAt).toLocaleDateString()}`),
            new Paragraph(`Type: ${note.noteType}`),
            new Paragraph(""),
                          new Paragraph({
                children: [
                  new TextRun({ text: note.chiefComplaint || "No content available.", break: 1 }),
                ],
              }),
          ],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-note-${note.id}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note Downloaded",
      description: `Note has been downloaded as a Word document.`,
    })
  }

  const handleExportPDF = async (preview: boolean = false) => {
    if (!note) return

    setIsExporting(true)
    performanceMonitor.startTiming('export-pdf')

    try {
      // Try backend PDF generation first
      const response = preview 
        ? await apiClient.previewNotePDF(noteId)
        : await apiClient.exportNotePDF(noteId)

      if (response.success && response.data) {
        const file = new Blob([response.data], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(file)
        
        if (preview) {
          window.open(fileURL)
        } else {
          const link = document.createElement('a')
          link.href = fileURL
          link.download = `medical-note-${note.patientName.replace(/\s+/g, '_')}-${note.id}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        
        toast({
          title: preview ? 'Preview Generated' : 'PDF Exported',
          description: `The note has been successfully ${preview ? 'opened for preview' : 'exported as a PDF'}.`
        })
      } else {
        // Fallback to client-side generation
        toast({
          title: 'Backend PDF Failed',
          description: 'Could not generate PDF from backend. Trying client-side generation.',
          variant: 'destructive'
        })
        await generateClientSidePDF(preview)
      }
    } catch (error) {
      logger.error('Error exporting PDF:', error)
      toast({
        title: 'Export Error',
        description: 'An unexpected error occurred while exporting PDF. Trying client-side generation.',
        variant: 'destructive'
      })
      await generateClientSidePDF(preview)
    } finally {
      setIsExporting(false)
      performanceMonitor.endTiming('export-pdf')
    }
  }

  const generateClientSidePDF = async (preview: boolean = false) => {
    if (!note) return
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    
    const content = generatePDFHTML()
    const container = document.createElement('div')
    container.innerHTML = content
    container.style.width = '210mm'
    container.style.padding = '20mm'
    container.style.position = 'absolute'
    container.style.left = '-9999px' // Render off-screen
    document.body.appendChild(container)

    const canvas = await html2canvas(container, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = imgWidth / imgHeight
    const height = pdfWidth / ratio

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height)
    
    if (preview) {
      pdf.output('dataurlnewwindow')
    } else {
      pdf.save(`medical-note-${note.patientName.replace(/\s+/g, '_')}.pdf`)
    }

    document.body.removeChild(container)
  }

  const generatePDFHTML = () => {
    if (!note) return ""

    const noteHistory = note.historyOfPresentIllness || note.historyOfPresentingIllness || "Not documented"
    
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <header style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0;">Medical Note</h1>
          <p style="font-size: 12px; color: #666;">Note ID: ${note.id}</p>
        </header>
        
        <main>
          <section style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Patient Information</h2>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="width: 33%;"><strong>Name:</strong> ${note.patientName}</td>
                <td style="width: 33%;"><strong>Age:</strong> ${note.patientAge}</td>
                <td style="width: 33%;"><strong>Gender:</strong> ${note.patientGender}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong> ${new Date(note.createdAt).toLocaleDateString()}</td>
                <td colspan="2"><strong>Note Type:</strong> ${note.noteType}</td>
              </tr>
            </table>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Chief Complaint</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.chiefComplaint || 'Not specified'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">History of Presenting Illness</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${noteHistory}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Past Medical History</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.pastMedicalHistory || 'Not documented'}</p>
          </section>

           <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">System Review</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.systemReview || 'Not documented'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Physical Examination</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.physicalExamination || 'Not documented'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Diagnosis</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.diagnosis || 'Not specified'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Treatment Plan</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.treatmentPlan || 'Not specified'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Follow-up Instructions</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.followUpInstructions || 'Not documented'}</p>
          </section>

          <section style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Additional Notes</h3>
            <p style="font-size: 14px; white-space: pre-wrap;">${note.additionalNotes || 'Not documented'}</p>
          </section>

        </main>
        
        <footer style="border-top: 2px solid #eee; padding-top: 10px; margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>This is an electronically generated document from NovateScribe.</p>
        </footer>
      </div>
    `
  }

  const handleCompareVersions = async () => {
    if (selectedVersions.from >= selectedVersions.to) {
      toast({ title: 'Invalid Selection', description: '"From" version must be less than "To" version.', variant: 'destructive' })
      return
    }
    try {
      const response = await apiClient.compareNoteVersions(noteId, selectedVersions.from, selectedVersions.to)
      if (response.success && response.data) {
        setVersionComparison(response.data)
      } else {
        toast({ title: 'Comparison Failed', description: response.error, variant: 'destructive' })
      }
    } catch (error) {
      logger.error('Error comparing versions:', error)
      toast({ title: 'Error', description: 'Failed to compare versions', variant: 'destructive' })
    }
  }

  const handleRestoreVersion = async () => {
    if (!showRestoreDialog.open || !restoreReason) return
    try {
      const response = await apiClient.restoreNoteVersion(noteId, showRestoreDialog.version, restoreReason)
      if (response.success) {
        toast({ title: 'Version Restored', description: `Note restored to version ${showRestoreDialog.version}` })
        await loadNoteData() // Reload all data
        setShowRestoreDialog({ version: 0, open: false })
        setRestoreReason('')
      } else {
        toast({ title: 'Restore Failed', description: response.error, variant: 'destructive' })
      }
    } catch (error) {
      logger.error('Error restoring version:', error)
      toast({ title: 'Error', description: 'Failed to restore version', variant: 'destructive' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType.toLowerCase()) {
      case 'create':
      case 'added':
        return 'bg-green-100 text-green-800'
      case 'update':
      case 'modified':
        return 'bg-yellow-100 text-yellow-800'
      case 'restore':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
      case 'removed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Note not found</h2>
        <p className="text-gray-600 mb-8">The requested medical note could not be found.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to notes
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Note
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Note</DialogTitle>
                <DialogDescription>
                  Choose a format to export the medical note.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-around p-4">
                <Button onClick={() => handleExportPDF(false)} disabled={isExporting}>
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  PDF
                </Button>
                <Button onClick={() => handleExportPDF(true)} disabled={isExporting}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview PDF
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Word
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="note" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="note">Medical Note</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        {/* Medical Note Tab */}
        <TabsContent value="note" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Note Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" value={editedNote.patientName || ''} onChange={e => setEditedNote({...editedNote, patientName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientAge">Patient Age</Label>
                      <Input id="patientAge" type="number" value={editedNote.patientAge || ''} onChange={e => setEditedNote({...editedNote, patientAge: parseInt(e.target.value, 10)})} />
                    </div>
                    <div>
                      <Label htmlFor="patientGender">Patient Gender</Label>
                      <Input id="patientGender" value={editedNote.patientGender || ''} onChange={e => setEditedNote({...editedNote, patientGender: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Textarea id="chiefComplaint" value={editedNote.chiefComplaint || ''} onChange={e => setEditedNote({...editedNote, chiefComplaint: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="historyOfPresentingIllness">History of Presenting Illness</Label>
                    <Textarea id="historyOfPresentingIllness" value={editedNote.historyOfPresentingIllness || editedNote.historyOfPresentIllness || ''} onChange={e => setEditedNote({...editedNote, historyOfPresentingIllness: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                    <Textarea id="pastMedicalHistory" value={editedNote.pastMedicalHistory || ''} onChange={e => setEditedNote({...editedNote, pastMedicalHistory: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="systemReview">System Review</Label>
                    <Textarea id="systemReview" value={editedNote.systemReview || ''} onChange={e => setEditedNote({...editedNote, systemReview: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="physicalExamination">Physical Examination</Label>
                    <Textarea id="physicalExamination" value={editedNote.physicalExamination || ''} onChange={e => setEditedNote({...editedNote, physicalExamination: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea id="diagnosis" value={editedNote.diagnosis || ''} onChange={e => setEditedNote({...editedNote, diagnosis: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="treatmentPlan">Treatment Plan</Label>
                    <Textarea id="treatmentPlan" value={editedNote.treatmentPlan || ''} onChange={e => setEditedNote({...editedNote, treatmentPlan: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
                    <Textarea id="followUpInstructions" value={editedNote.followUpInstructions || ''} onChange={e => setEditedNote({...editedNote, followUpInstructions: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea id="additionalNotes" value={editedNote.additionalNotes || ''} onChange={e => setEditedNote({...editedNote, additionalNotes: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Patient Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-600">Patient Name</h3>
                      <p>{note?.patientName}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600">Age</h3>
                      <p>{note?.patientAge}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600">Gender</h3>
                      <p>{note?.patientGender}</p>
                    </div>
                  </div>
                  <Separator />
                  
                  {/* Medical Details */}
                  <div className="space-y-4">
                    <NoteSection title="Chief Complaint" content={note?.chiefComplaint} />
                    <NoteSection title="History of Presenting Illness" content={note?.historyOfPresentingIllness || note?.historyOfPresentIllness} />
                    <NoteSection title="Past Medical History" content={note?.pastMedicalHistory} />
                    <NoteSection title="System Review" content={note?.systemReview} />
                    <NoteSection title="Physical Examination" content={note?.physicalExamination} />
                    <NoteSection title="Diagnosis" content={note?.diagnosis} />
                    <NoteSection title="Treatment Plan" content={note?.treatmentPlan} />
                    <NoteSection title="Follow-up Instructions" content={note?.followUpInstructions} />
                    <NoteSection title="Additional Notes" content={note?.additionalNotes} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={String(selectedVersions.from)} onValueChange={v => setSelectedVersions({...selectedVersions, from: Number(v)})}>
                      <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                      <SelectContent>
                        {versions.map(v => <SelectItem key={v.version} value={String(v.version)}>Version {v.version}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={String(selectedVersions.to)} onValueChange={v => setSelectedVersions({...selectedVersions, to: Number(v)})}>
                      <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                      <SelectContent>
                        {versions.map(v => <SelectItem key={v.version} value={String(v.version)}>Version {v.version}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCompareVersions}>
                      <GitCompare className="mr-2 h-4 w-4" />
                      Compare
                    </Button>
                  </div>

                  {versionComparison && (
                    <Card className="my-4">
                      <CardHeader>
                        <CardTitle>Comparison between Version {versionComparison.fromVersion.version} and {versionComparison.toVersion.version}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {versionComparison.differences.map((diff, index) => (
                            <div key={index} className="p-2 rounded-md bg-gray-50">
                              <p className="font-semibold">{diff.field}</p>
                              <p className="text-sm text-red-600">
                                <span className="font-medium">From:</span> {String(diff.oldValue)}
                              </p>
                              <p className="text-sm text-green-600">
                                <span className="font-medium">To:</span> {String(diff.newValue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    {versions.map((version) => (
                      <div key={version.version} className="border-l-4 border-gray-300 pl-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getChangeTypeColor(version.changeType)}>
                              {version.changeType}
                            </Badge>
                            <span className="font-medium">Version {version.version}</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setShowRestoreDialog({ version: version.version, open: true })}>
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restore to Version {version.version}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Alert variant="destructive">
                                  <AlertDescription>
                                    Are you sure you want to restore to this version? This will create a new version with the content of version {version.version}.
                                  </AlertDescription>
                                </Alert>
                                <Textarea
                                  placeholder="Reason for restoring (optional)"
                                  value={restoreReason}
                                  onChange={(e) => setRestoreReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" onClick={() => setShowRestoreDialog({ version: 0, open: false })}>Cancel</Button>
                                  <Button onClick={handleRestoreVersion}>Restore</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{version.changeDescription}</p>
                        <div className="text-xs text-gray-500">
                          Changed by: {version.changedByUser.name} on {formatDate(version.changedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No version history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab - Temporarily disabled due to backend 404 */}
        {/*
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditTrail.length > 0 ? (
                <div className="space-y-4">
                  {auditTrail.map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getChangeTypeColor(entry.action)}>
                            {entry.action}
                          </Badge>
                          <span className="font-medium">Version {entry.version}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{entry.description}</p>
                      {entry.changes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-600">Changes:</p>
                          {entry.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="text-xs bg-gray-50 p-2 rounded">
                              <span className="font-medium">{change.field}:</span>
                              <span className={`ml-2 px-1 rounded ${
                                change.changeType === 'added' ? 'bg-green-100 text-green-800' :
                                change.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {change.changeType}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No audit trail available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        */}
      </Tabs>
    </div>
  )
}

// Helper component to render sections and handle empty content
const NoteSection = ({ title, content }: { title: string; content?: string | null }) => {
  if (!content) return null

  return (
    <div>
      <h3 className="font-semibold text-gray-700 text-lg mb-2 border-b pb-1">{title}</h3>
      <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
    </div>
  )
}
