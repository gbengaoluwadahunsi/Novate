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
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([])
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
      // Load note, versions, and audit trail in parallel
      const [noteResponse, versionsResponse, auditResponse] = await Promise.all([
        apiClient.getMedicalNote(noteId),
        apiClient.getNoteVersions(noteId),
        apiClient.getNoteAuditTrail(noteId)
      ])

      if (noteResponse.success && noteResponse.data) {
        console.log('🔍 Backend Note Response:', noteResponse.data)
        console.log('🔍 Note Patient Name:', noteResponse.data.patientName)
        console.log('🔍 Note Patient Age:', noteResponse.data.patientAge)
        console.log('🔍 Note Patient Gender:', noteResponse.data.patientGender)
        console.log('🔍 Note Chief Complaint:', noteResponse.data.chiefComplaint)
        console.log('🔍 Note History:', noteResponse.data.historyOfPresentIllness)
        console.log('🔍 Full Note Structure:', {
          id: noteResponse.data.id,
          patientName: noteResponse.data.patientName,
          patientAge: noteResponse.data.patientAge,
          patientGender: noteResponse.data.patientGender,
          chiefComplaint: noteResponse.data.chiefComplaint,
          historyOfPresentIllness: noteResponse.data.historyOfPresentIllness,
          physicalExamination: noteResponse.data.physicalExamination,
          diagnosis: noteResponse.data.diagnosis,
          treatmentPlan: noteResponse.data.treatmentPlan,
          noteType: noteResponse.data.noteType,
          createdAt: noteResponse.data.createdAt
        })
        
        setNote(noteResponse.data)
        setEditedNote(noteResponse.data)
      }

      if (versionsResponse.success && versionsResponse.data) {
        setVersions(versionsResponse.data.versions)
      }

      if (auditResponse.success && auditResponse.data) {
        setAuditTrail(auditResponse.data.auditTrail)
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
        : await apiClient.exportNotePDF(noteId, {
            format: 'A4',
            includeHeader: true,
            includeFooter: true
          })

      if (response.success && response.data) {
        const blob = response.data as Blob
        
        // Check if the PDF content looks malformed (contains raw JSON)
        const text = await blob.text()
        const hasRawJSON = text.includes('{"investigations"') || text.includes('"treatmentAdministered"')
        
        if (hasRawJSON) {
          console.log('🔧 Backend PDF has formatting issues, generating client-side PDF...')
          await generateClientSidePDF(preview)
        } else {
          const url = URL.createObjectURL(blob)

          if (preview) {
            window.open(url, '_blank')
          } else {
            const link = document.createElement('a')
            link.href = url
            link.download = `medical-note-${note.patientName.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }

          URL.revokeObjectURL(url)

          toast({
            title: preview ? 'PDF Preview' : 'PDF Downloaded',
            description: preview ? 'PDF opened in new tab' : 'Medical note exported successfully',
          })
        }

        performanceMonitor.endTiming('export-pdf')
      } else {
        console.log('🔧 Backend PDF failed, generating client-side PDF...')
        await generateClientSidePDF(preview)
      }
    } catch (error) {
      console.log('🔧 PDF export error, falling back to client-side generation...', error)
      await generateClientSidePDF(preview)
    } finally {
      setIsExporting(false)
    }
  }

  const generateClientSidePDF = async (preview: boolean = false) => {
    try {
      // Create a clean HTML version for PDF generation
      const htmlContent = generatePDFHTML()
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Could not open print window')
      }

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500))

      if (preview) {
        // For preview, just show the print dialog
        printWindow.print()
      } else {
        // For download, trigger print which can be saved as PDF
        printWindow.print()
        
        toast({
          title: 'PDF Generation',
          description: 'Use your browser\'s print dialog to save as PDF',
        })
      }

      // Close the window after a delay
      setTimeout(() => printWindow.close(), 1000)

    } catch (error) {
      console.error('Client-side PDF generation failed:', error)
      toast({
        title: 'PDF Generation Failed',
        description: 'Unable to generate PDF. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const generatePDFHTML = () => {
    // Parse management plan if it's JSON
    let managementPlan = note?.managementPlan || 'To be determined'
    if (managementPlan.startsWith('{')) {
      try {
        const parsed = JSON.parse(managementPlan)
        managementPlan = Object.entries(parsed)
          .filter(([key, value]) => value && value !== 'N/A')
          .map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            return `${label}: ${value}`
          })
          .join('\n\n')
      } catch (e) {
        // Keep original if parsing fails
      }
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Medical Note - ${note?.patientName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #007bff;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .patient-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 25px;
        }
        .patient-info div {
          margin-bottom: 10px;
        }
        .patient-info strong {
          color: #007bff;
        }
        .clinical-content {
          background: white;
          padding: 15px;
          border-left: 4px solid #007bff;
          margin-bottom: 15px;
        }
        .clinical-content h3 {
          color: #007bff;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .clinical-content p {
          margin: 0;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MEDICAL NOTE</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>NovateScribe Medical Documentation System</p>
      </div>

      <div class="patient-info">
        <div>
          <strong>Patient Name:</strong><br>
          ${note?.patientName || 'Not specified'}
        </div>
        <div>
          <strong>Age:</strong><br>
          ${note?.patientAge ? `${note.patientAge} years` : 'Not specified'}
        </div>
        <div>
          <strong>Gender:</strong><br>
          ${note?.patientGender || 'Not specified'}
        </div>
        <div>
          <strong>Visit Date:</strong><br>
          ${note?.visitDate || new Date().toLocaleDateString()}
        </div>
        <div>
          <strong>Visit Time:</strong><br>
          ${note?.visitTime || 'Not specified'}
        </div>
        <div>
          <strong>Note Type:</strong><br>
          ${note?.noteType || 'Consultation'}
        </div>
      </div>

      <div class="section">
        <h2>CLINICAL INFORMATION</h2>
        
        <div class="clinical-content">
          <h3>Chief Complaint</h3>
          <p>${note?.chiefComplaint || 'Not documented'}</p>
        </div>

        <div class="clinical-content">
          <h3>History of Present Illness</h3>
          <p>${note?.historyOfPresentIllness || 'Not documented'}</p>
        </div>

        <div class="clinical-content">
          <h3>Physical Examination</h3>
          <p>${typeof note?.physicalExamination === 'string' ? note.physicalExamination : 'Physical examination findings to be documented'}</p>
        </div>

        <div class="clinical-content">
          <h3>Diagnosis</h3>
          <p>${note?.diagnosis || 'To be determined based on examination'}</p>
        </div>

        <div class="clinical-content">
          <h3>Management Plan</h3>
          <p>${managementPlan}</p>
        </div>
      </div>

      <div class="footer">
        <p>This document was generated by NovateScribe AI Medical Documentation System</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
    `
  }

  const handleCompareVersions = async () => {
    if (selectedVersions.from === selectedVersions.to) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select different versions to compare',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await apiClient.compareNoteVersions(noteId, selectedVersions.from, selectedVersions.to)

      if (response.success && response.data) {
        setVersionComparison(response.data)
      } else {
        throw new Error(response.error || 'Failed to compare versions')
      }
    } catch (error) {
      logger.error('Error comparing versions:', error)
      toast({
        title: 'Comparison Error',
        description: 'Failed to compare versions',
        variant: 'destructive'
      })
    }
  }

  const handleRestoreVersion = async () => {
    if (!restoreReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for restoring this version',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await apiClient.restoreNoteVersion(noteId, showRestoreDialog.version, restoreReason)

      if (response.success) {
        toast({
          title: 'Version Restored',
          description: `Note restored to version ${showRestoreDialog.version}`,
        })

        // Reload note data
        await loadNoteData()
        setShowRestoreDialog({ version: 0, open: false })
        setRestoreReason('')
      } else {
        throw new Error(response.error || 'Failed to restore version')
      }
    } catch (error) {
      logger.error('Error restoring version:', error)
      toast({
        title: 'Restore Error',
        description: 'Failed to restore version',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'RESTORE': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading note...</span>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Note Not Found</h2>
        <p className="text-gray-600 mt-2">The requested medical note could not be found.</p>
        <Button onClick={() => router.push('/dashboard/notes')} className="mt-4">
          Back to Notes
        </Button>
      </div>
    )
  }

  // Debug what's being rendered
  console.log('🔍 Rendering note:', note)
  console.log('🔍 Display values:', {
    patientName: note.patientName,
    patientAge: note.patientAge,
    patientGender: note.patientGender,
    chiefComplaint: note.chiefComplaint,
    historyOfPresentIllness: note.historyOfPresentIllness
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Note</h1>
          <p className="text-gray-600">Patient: {note.patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportPDF(true)}
            disabled={isExporting}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button
            onClick={() => handleExportPDF(false)}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button
            variant={isEditing ? "destructive" : "default"}
            onClick={() => {
              if (isEditing) {
                setIsEditing(false)
                setEditedNote(note)
              } else {
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="note" className="space-y-4">
        <TabsList>
          <TabsTrigger value="note">Medical Note</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Medical Note Tab */}
        <TabsContent value="note" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedNote.patientName || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, patientName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{note.patientName}</p>
                  )}
                </div>
                <div>
                  <Label>Age</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editedNote.patientAge || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, patientAge: parseInt(e.target.value) })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {note.patientAge ? `${note.patientAge} years` : 'Age not specified'}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Gender</Label>
                  {isEditing ? (
                    <Select
                      value={editedNote.patientGender || ''}
                      onValueChange={(value) => setEditedNote({ ...editedNote, patientGender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium capitalize">{note.patientGender}</p>
                  )}
                </div>
                <div>
                  <Label>Note Type</Label>
                  {isEditing ? (
                    <Select
                      value={editedNote.noteType || ''}
                      onValueChange={(value) => setEditedNote({ ...editedNote, noteType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="capitalize">{note.noteType}</Badge>
                  )}
                </div>
                <div>
                  <Label>Visit Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedNote.visitDate || new Date(note.createdAt).toISOString().split('T')[0]}
                      onChange={(e) => setEditedNote({ ...editedNote, visitDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Visit Time</Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedNote.visitTime || new Date(note.createdAt).toTimeString().slice(0, 5)}
                      onChange={(e) => setEditedNote({ ...editedNote, visitTime: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Clinical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Chief Complaint</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.chiefComplaint || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, chiefComplaint: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1">{note.chiefComplaint || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <Label>History of Present Illness</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.historyOfPresentIllness || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, historyOfPresentIllness: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1">{note.historyOfPresentIllness || 'Not documented'}</p>
                  )}
                </div>

                <div>
                  <Label>Physical Examination</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.physicalExamination || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, physicalExamination: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1">{note.physicalExamination || 'Not documented'}</p>
                  )}
                </div>

                <div>
                  <Label>Diagnosis</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.diagnosis || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, diagnosis: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1">{note.diagnosis || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <Label>Treatment Plan</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.treatmentPlan || ''}
                      onChange={(e) => setEditedNote({ ...editedNote, treatmentPlan: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1">{note.treatmentPlan || 'Not specified'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Note Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Created</Label>
                  <p className="text-sm font-medium">{formatDate(note.createdAt)}</p>
                </div>
                <div>
                  <Label>Last Modified</Label>
                  <p className="text-sm font-medium">{formatDate(note.updatedAt)}</p>
                </div>
                <div>
                  <Label>Time Saved</Label>
                  <p className="text-sm font-medium">{note.timeSaved ? `${Math.round(note.timeSaved / 60)} minutes` : 'N/A'}</p>
                </div>
                <div>
                  <Label>Note ID</Label>
                  <p className="text-sm font-medium font-mono">{note.id.slice(0, 8)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <div className="space-y-4">
                  {/* Version Comparison */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label>Compare:</Label>
                      <Select
                        value={selectedVersions.from.toString()}
                        onValueChange={(value) => setSelectedVersions({ ...selectedVersions, from: parseInt(value) })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {versions.map((v) => (
                            <SelectItem key={v.version} value={v.version.toString()}>
                              v{v.version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>with</span>
                      <Select
                        value={selectedVersions.to.toString()}
                        onValueChange={(value) => setSelectedVersions({ ...selectedVersions, to: parseInt(value) })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {versions.map((v) => (
                            <SelectItem key={v.version} value={v.version.toString()}>
                              v{v.version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleCompareVersions} size="sm">
                        <GitCompare className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                    </div>
                  </div>

                  {/* Version Comparison Results */}
                  {versionComparison && (
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <h4 className="font-semibold">
                            Comparison: Version {versionComparison.fromVersion.version} → Version {versionComparison.toVersion.version}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {versionComparison.totalChanges} changes found
                          </p>
                          <div className="space-y-1">
                            {versionComparison.differences.map((diff, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{diff.field}:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                  diff.changeType === 'added' ? 'bg-green-100 text-green-800' :
                                  diff.changeType === 'removed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {diff.changeType}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Version List */}
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getChangeTypeColor(version.changeType)}>
                              Version {version.version}
                            </Badge>
                            <span className="text-sm font-medium">{version.changeDescription}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {version.changedByUser.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(version.changedAt)}
                              </div>
                            </div>
                            {version.version !== versions[0]?.version && (
                              <Dialog
                                open={showRestoreDialog.open && showRestoreDialog.version === version.version}
                                onOpenChange={(open) => setShowRestoreDialog({ version: version.version, open })}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restore
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Restore Version {version.version}</DialogTitle>
                                    <DialogDescription>
                                      This will restore the note to version {version.version}. Please provide a reason for this action.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Reason for Restoration</Label>
                                      <Textarea
                                        value={restoreReason}
                                        onChange={(e) => setRestoreReason(e.target.value)}
                                        placeholder="Explain why you're restoring this version..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setShowRestoreDialog({ version: 0, open: false })}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={handleRestoreVersion}>
                                        Restore Version
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No version history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
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
      </Tabs>
    </div>
  )
}
