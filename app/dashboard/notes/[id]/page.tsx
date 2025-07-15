"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
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

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
      const [noteResponse, versionsResponse] = await Promise.all([
        apiClient.getMedicalNote(noteId),
        apiClient.getNoteVersions(noteId)
      ])
      
      if (noteResponse.success && noteResponse.data) {
        setNote(noteResponse.data)
        setEditedNote(noteResponse.data)
      }

      if (versionsResponse.success && versionsResponse.data) {
        setVersions(versionsResponse.data.versions)
      }

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
      const response = await apiClient.updateMedicalNote(noteId, editedNote)
      
      if (response.success && response.data) {
        setNote(response.data)
        setIsEditing(false)
        await loadNoteData()
        toast({
          title: 'Note Updated',
          description: 'Medical note has been successfully updated',
        })
        performanceMonitor.endTiming('save-note')
      } else {
        throw new Error(response.error || 'Failed to update note')
      }
    } catch (error) {
      logger.error('Error saving note:', error)
      toast({
        title: 'Save Error',
        description: `Failed to save note changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadWord = async () => {
    if (!note) return

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun({ text: `Medical Note: ${note.id}`, bold: true, size: 28 })] }),
          new Paragraph(""),
          new Paragraph(`Patient: ${note.patientName}`),
          new Paragraph(`Age: ${note.patientAge} • Gender: ${note.patientGender}`),
          new Paragraph(`Date: ${new Date(note.createdAt).toLocaleDateString()}`),
          new Paragraph(`Type: ${note.noteType}`),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: note.chiefComplaint || "No content available.", break: 1 })] }),
        ],
      }],
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

  const handleExportPDF = () => {
    if (!note) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Note</title>
            <style>
              body { font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.5; }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 5px; }
              p { margin-bottom: 5px; }
              strong { font-weight: bold; }
              .print-section { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
            </style>
          </head>
          <body>
            <div class="print-section">
              <h1>Medical Note</h1>
              <p><strong>Patient Name:</strong> ${note?.patientName || 'N/A'}</p>
              <p><strong>Age:</strong> ${note?.patientAge || 'N/A'}</p>
              <p><strong>Gender:</strong> ${note?.patientGender || 'N/A'}</p>
              <p><strong>Date:</strong> ${new Date(note?.createdAt || '').toLocaleDateString()}</p>
              <p><strong>Note Type:</strong> ${note?.noteType || 'N/A'}</p>
            </div>
            <div class="print-section">
              <h2>Chief Complaint</h2>
              <p>${note?.chiefComplaint || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>History of Presenting Illness</h2>
              <p>${note?.historyOfPresentingIllness || note?.historyOfPresentIllness || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Past Medical History</h2>
              <p>${note?.pastMedicalHistory || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>System Review</h2>
              <p>${note?.systemReview || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Physical Examination</h2>
              <p>${note?.physicalExamination || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Diagnosis</h2>
              <p>${note?.diagnosis || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Treatment Plan</h2>
              <p>${note?.treatmentPlan || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Follow-up Instructions</h2>
              <p>${note?.followUpInstructions || 'No content available.'}</p>
            </div>
            <div class="print-section">
              <h2>Additional Notes</h2>
              <p>${note?.additionalNotes || 'No content available.'}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }

  const handleCompareVersions = async () => {
    if (!note || !selectedVersions.from || !selectedVersions.to) return

    try {
      const response = await apiClient.compareNoteVersions(noteId, selectedVersions.from, selectedVersions.to)
      if (response.success && response.data) {
        setVersionComparison(response.data)
      } else {
        toast({ title: 'Comparison Failed', description: response.error, variant: 'destructive' })
      }
    } catch (error) {
      logger.error('Error comparing versions:', error)
      toast({ title: 'Error', description: 'Failed to compare versions.', variant: 'destructive' })
    }
  }

  const handleRestoreVersion = async () => {
    if (!note || !showRestoreDialog.version) return

    try {
      const response = await apiClient.restoreNoteVersion(noteId, showRestoreDialog.version, restoreReason)
      if (response.success && response.data) {
        await loadNoteData()
        toast({ title: 'Version Restored', description: `Version ${showRestoreDialog.version} has been restored.` })
        setShowRestoreDialog({ version: 0, open: false })
        setRestoreReason('')
      } else {
        toast({ title: 'Restore Failed', description: response.error, variant: 'destructive' })
      }
    } catch (error) {
      logger.error('Error restoring version:', error)
      toast({ title: 'Error', description: 'Failed to restore version.', variant: 'destructive' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'added': return 'text-green-500'
      case 'removed': return 'text-red-500'
      case 'modified': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Note not found</h2>
        <p className="text-gray-500 mb-8">The requested medical note could not be loaded.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back to notes
        </Button>
      </div>
    )
  }

  const handleFieldChange = (field: keyof MedicalNote, value: any) => {
    setEditedNote(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Medical Note Details</h1>
        <div />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Patient Information</CardTitle>
              {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              ) : (
                <Button variant="outline" onClick={handleEdit}><Edit2 className="mr-2 h-4 w-4" /> Edit</Button>
              )}
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <InfoItem label="Patient Name" value={note.patientName} isEditing={isEditing} onChange={e => handleFieldChange('patientName', e.target.value)} />
              <InfoItem label="Patient Age" value={note.patientAge} isEditing={isEditing} onChange={e => handleFieldChange('patientAge', parseInt(e.target.value))} type="number" />
              <InfoItem label="Patient Gender" value={note.patientGender} isEditing={isEditing} onChange={e => handleFieldChange('patientGender', e.target.value)} />
              <InfoItem label="Date" value={new Date(note.createdAt).toLocaleDateString()} />
              <InfoItem label="Note Type" value={note.noteType} isEditing={isEditing} onChange={e => handleFieldChange('noteType', e.target.value)} />
              <InfoItem label="Note ID" value={note.id} />
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            <Button variant="outline" size="sm" onClick={handleDownloadWord}><FileDown className="mr-2 h-4 w-4" /> Download as Word</Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Download as PDF</Button>
            <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="note" className="w-full lg:col-span-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="note"><Eye className="mr-2 h-4 w-4" /> Medical Note</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Version History</TabsTrigger>
            <TabsTrigger value="comparison"><GitCompare className="mr-2 h-4 w-4" /> Compare Versions</TabsTrigger>
          </TabsList>

          <TabsContent value="note" className="mt-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <NoteSection title="Chief Complaint" content={note.chiefComplaint} isEditing={isEditing} onChange={e => handleFieldChange('chiefComplaint', e.target.value)} />
                <NoteSection title="History of Presenting Illness" content={note.historyOfPresentingIllness || note.historyOfPresentIllness} isEditing={isEditing} onChange={e => handleFieldChange('historyOfPresentingIllness', e.target.value)} />
                <NoteSection title="Past Medical History" content={note.pastMedicalHistory} isEditing={isEditing} onChange={e => handleFieldChange('pastMedicalHistory', e.target.value)} />
                <NoteSection title="System Review" content={note.systemReview} isEditing={isEditing} onChange={e => handleFieldChange('systemReview', e.target.value)} />
                <NoteSection title="Physical Examination" content={note.physicalExamination} isEditing={isEditing} onChange={e => handleFieldChange('physicalExamination', e.target.value)} />
                <NoteSection title="Diagnosis" content={note.diagnosis} isEditing={isEditing} onChange={e => handleFieldChange('diagnosis', e.target.value)} />
                <NoteSection title="Treatment Plan" content={note.treatmentPlan} isEditing={isEditing} onChange={e => handleFieldChange('treatmentPlan', e.target.value)} />
                <NoteSection title="Follow-up Instructions" content={note.followUpInstructions} isEditing={isEditing} onChange={e => handleFieldChange('followUpInstructions', e.target.value)} />
                <NoteSection title="Additional Notes" content={note.additionalNotes} isEditing={isEditing} onChange={e => handleFieldChange('additionalNotes', e.target.value)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Version History</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {versions.map((v) => (
                    <li key={v.version} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-semibold">Version {v.version}</span>
                        <span className="text-sm text-gray-500 ml-4">({formatDate(v.changedAt)})</span>
                        <p className="text-sm text-gray-600 mt-1">{v.changeDescription}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setShowRestoreDialog({ version: v.version, open: true })}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Restore
                          </Button>
                        </DialogTrigger>
                        {showRestoreDialog.version === v.version && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Restore to Version {v.version}?</DialogTitle>
                              <DialogDescription>Please provide a reason for restoring this version.</DialogDescription>
                            </DialogHeader>
                            <Input
                              placeholder="e.g., Reverting accidental deletion"
                              value={restoreReason}
                              onChange={(e) => setRestoreReason(e.target.value)}
                            />
                            <Button onClick={handleRestoreVersion} disabled={!restoreReason}>Confirm Restore</Button>
                          </DialogContent>
                        )}
                      </Dialog>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Compare Note Versions</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Select onValueChange={(v) => setSelectedVersions(p => ({ ...p, from: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="From Version" /></SelectTrigger>
                    <SelectContent>{versions.map(v => <SelectItem key={v.version} value={String(v.version)}>Version {v.version}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={(v) => setSelectedVersions(p => ({ ...p, to: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="To Version" /></SelectTrigger>
                    <SelectContent>{versions.map(v => <SelectItem key={v.version} value={String(v.version)}>Version {v.version}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button onClick={handleCompareVersions}>Compare</Button>
                </div>
                {versionComparison && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Comparison Results</h3>
                    <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(versionComparison, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

const InfoItem = ({ label, value, isEditing, onChange, type = 'text' }: { label: string, value: any, isEditing?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium text-gray-500">{label}</Label>
    {isEditing && onChange ? (
      <Input type={type} value={value} onChange={onChange} className="h-8" />
    ) : (
      <p className="text-gray-800">{value}</p>
    )}
  </div>
)

const NoteSection = ({ title, content, isEditing, onChange }: { title: string; content?: string | null, isEditing?: boolean, onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => {
  if (!content && !isEditing) return null

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      {isEditing ? (
        <Textarea value={content || ''} onChange={onChange} rows={4} className="bg-blue-50" />
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap">{content || <span className="text-gray-400">N/A</span>}</p>
      )}
    </div>
  )
}
