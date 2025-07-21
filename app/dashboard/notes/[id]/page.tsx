"use client"

import { useState, useEffect, useRef, forwardRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Printer, Share2, Trash2, Edit2, Save, Eye, History, X, Clock, User, FileDown, GitCompare, RotateCcw, Shield, Loader2, Upload, FileText } from "lucide-react"
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

// Extended interface for editable medical note with doctor information
interface EditableMedicalNote extends MedicalNote {
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string | null;
  dateOfIssue?: string;
}

export default function NotePage() {
  const { user } = useAppSelector((state) => state.auth)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedNote, setEditedNote] = useState<Partial<EditableMedicalNote>>({})
  const [selectedVersions, setSelectedVersions] = useState<{ from: number; to: number }>({ from: 1, to: 1 })
  const [versionComparison, setVersionComparison] = useState<VersionComparison | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState<{ version: number; open: boolean }>({ version: 0, open: false })
  const [restoreReason, setRestoreReason] = useState('')
  const [signatureFile, setSignatureFile] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        setEditedNote({
          ...noteResponse.data,
          doctorName: (noteResponse.data as any).doctorName || user?.name || 
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                     "Dr. [Name]",
          doctorRegistrationNo: (noteResponse.data as any).doctorRegistrationNo || user?.registrationNo || "",
          doctorDepartment: (noteResponse.data as any).doctorDepartment || user?.specialization || "General Medicine",
          dateOfIssue: (noteResponse.data as any).dateOfIssue || new Date().toISOString().split('T')[0],
          doctorSignature: (noteResponse.data as any).doctorSignature || null
        })
        
        if ((noteResponse.data as any).doctorSignature) {
          setSignatureFile((noteResponse.data as any).doctorSignature)
        }

        // Set display name (patient name or case number)
        const name = await generateCaseNumber(noteResponse.data)
        setDisplayName(name)
      }

      if (versionsResponse.success && versionsResponse.data) {
        // Handle both array and object response format
        const versionData = Array.isArray(versionsResponse.data) 
          ? versionsResponse.data 
          : (versionsResponse.data as any).versions || []
        setVersions(versionData)
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
    setEditedNote({
      ...note,
      doctorName: (note as any)?.doctorName || user?.name || 
                 (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                 "Dr. [Name]",
      doctorRegistrationNo: (note as any)?.doctorRegistrationNo || user?.registrationNo || "",
      doctorDepartment: (note as any)?.doctorDepartment || user?.specialization || "General Medicine",
      dateOfIssue: (note as any)?.dateOfIssue || new Date().toISOString().split('T')[0],
      doctorSignature: (note as any)?.doctorSignature || null
    })
    
    if ((note as any)?.doctorSignature) {
      setSignatureFile((note as any).doctorSignature)
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!note || !editedNote || isSaving) return

    setIsSaving(true)
    try {
      const response = await apiClient.updateMedicalNote(note.id, editedNote)
      if (response.success) {
        setNote({ ...note, ...editedNote })
        setIsEditing(false)
        toast({
          title: 'Success',
          description: 'Medical note updated successfully',
        })
      } else {
        throw new Error(response.error || 'Failed to update note')
      }
    } catch (error) {
      logger.error('Error saving note:', error)
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (field: keyof EditableMedicalNote, value: any) => {
    setEditedNote(prev => ({ ...prev, [field]: value }))
  }

  const handleSignatureUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (PNG, JPG, GIF, etc.)',
          variant: 'destructive'
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        setSignatureFile(base64String)
        handleFieldChange('doctorSignature', base64String)
        toast({
          title: 'Signature Uploaded',
          description: 'Digital signature has been uploaded successfully',
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSignature = () => {
    setSignatureFile(null)
    handleFieldChange('doctorSignature', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast({
      title: 'Signature Removed',
      description: 'Digital signature has been removed',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadWord = async () => {
    if (!note) return

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Medical Note", bold: true, size: 28 })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Patient: ${note.patientName}`, size: 24 })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Date: ${new Date(note.createdAt).toLocaleDateString()}`, size: 24 })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Chief Complaint: ${note.chiefComplaint || 'N/A'}`, size: 24 })]
          })
        ]
      }]
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medical-note-${note.patientName}-${new Date().toISOString().split('T')[0]}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Show practice selector dialog for PDF export
  const [showPracticeSelector, setShowPracticeSelector] = useState<{open: boolean, patientName: string} | null>(null)

  const handleExportPDF = () => {
    setShowPracticeSelector({ open: true, patientName: note.patientName || 'Patient' })
  }

  // PDF export with selected practice info
  const exportPDFWithPractice = async (patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      console.log('📄 Generating PDF for note:', note.id, 'Patient:', patientName, 'Practice:', practiceInfo)
      
      // Use frontend PDF generation (no backend endpoint available)
      generateFrontendPDF(patientName, practiceInfo)
    } catch (error) {
      console.error('📄 PDF export error:', error)
      toast({
        title: 'Export Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setShowPracticeSelector(null)
    }
  }

  // Frontend PDF generation using professional PDF library
  const generateFrontendPDF = (patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      // Create note with doctor information
      const noteWithDoctorInfo = {
        ...note,
        doctorName: editedNote.doctorName || user?.name || 
                   (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                   "Dr. [Name]",
        doctorRegistrationNo: editedNote.doctorRegistrationNo || user?.registrationNo || "",
        doctorDepartment: editedNote.doctorDepartment || user?.specialization || "General Medicine"
      };

      // Use the professional PDF generator
      MedicalNotePDFGenerator.generateAndDownload(noteWithDoctorInfo, practiceInfo, patientName);

      toast({
        title: 'PDF Downloaded',
        description: `Medical note exported for ${practiceInfo.organizationName}`,
      })
    } catch (error) {
      console.error('📄 PDF generation error:', error)
      toast({
        title: 'Export Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Generate consistent case number for notes without patient names
  const generateCaseNumber = async (note: MedicalNote) => {
    if (note.patientName && note.patientName.trim() && note.patientName !== 'N/A') {
      return note.patientName
    }
    
    try {
      // Fetch all notes to ensure consistent numbering
      const response = await apiClient.getMedicalNotes()
      if (response.success && response.data) {
        const allNotes = response.data.data || response.data
        
        // Get only notes WITHOUT patient names, sorted chronologically
        const unnamedNotes = allNotes
          .filter((n: any) => !n.patientName || n.patientName.trim() === '' || n.patientName === 'N/A')
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        
        // Find position of current note among unnamed notes only
        const position = unnamedNotes.findIndex((n: any) => n.id === note.id) + 1
        
        if (position > 0) {
          return `Medical Case ${String(position).padStart(3, '0')}`
        }
      }
    } catch (error) {
      console.error('Error fetching notes for case numbering:', error)
    }
    
    // Fallback
    return 'Medical Case 001'
  }

  // Function to format management plan JSON data into readable text
  const formatManagementPlan = (managementPlanData?: string | null): string => {
    if (!managementPlanData) return ''
    
    try {
      // Try to parse if it's a JSON string
      const parsed = typeof managementPlanData === 'string' 
        ? JSON.parse(managementPlanData) 
        : managementPlanData
      
      let formatted = ''
      
      // Format each section with proper labels
      if (parsed.investigations) {
        formatted += `**Investigations:**\n${parsed.investigations}\n\n`
      }
      
      if (parsed.treatmentAdministered && parsed.treatmentAdministered !== 'N/A') {
        formatted += `**Treatment Administered:**\n${parsed.treatmentAdministered}\n\n`
      }
      
      if (parsed.medicationsPrescribed && parsed.medicationsPrescribed !== 'N/A') {
        formatted += `**Medications Prescribed:**\n${parsed.medicationsPrescribed}\n\n`
      }
      
      if (parsed.patientEducation && parsed.patientEducation !== 'N/A') {
        formatted += `**Patient Education:**\n${parsed.patientEducation}\n\n`
      }
      
      if (parsed.followUp && parsed.followUp !== 'N/A') {
        formatted += `**Follow-up:**\n${parsed.followUp}\n\n`
      }
      
      return formatted.trim()
    } catch (error) {
      // If parsing fails, return the original string
      return managementPlanData || ''
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center mb-6 no-print">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <span className="ml-2 text-sm text-gray-600">Back to Notes</span>
      </div>

      {/* Document Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Medical Note</h1>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <strong>Patient Name:</strong> {displayName || note.patientName || 'Medical Case 001'}
          </div>
          <div>
            <strong>Date:</strong> {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
          <div>
            <strong>Age:</strong> {note.patientAge || 'N/A'}
          </div>
          <div>
            <strong>Gender:</strong> {note.patientGender}
          </div>
          <div>
            <strong>Note Type:</strong> {note.noteType}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-6 no-print">
        {isEditing ? (
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleEdit} size="sm">
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </>
        )}
      </div>

      {/* Medical Note Content */}
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm border space-y-8">
        <NoteSection title="Chief Complaint" content={note.chiefComplaint} isEditing={isEditing} onChange={e => handleFieldChange('chiefComplaint', e.target.value)} />
        <NoteSection title="History of Presenting Illness" content={note.historyOfPresentingIllness || note.historyOfPresentIllness} isEditing={isEditing} onChange={e => handleFieldChange('historyOfPresentingIllness', e.target.value)} />
        <NoteSection title="Past Medical History" content={note.pastMedicalHistory} isEditing={isEditing} onChange={e => handleFieldChange('pastMedicalHistory', e.target.value)} />
        <NoteSection title="System Review" content={note.systemReview} isEditing={isEditing} onChange={e => handleFieldChange('systemReview', e.target.value)} />
        <NoteSection title="Physical Examination" content={note.physicalExamination} isEditing={isEditing} onChange={e => handleFieldChange('physicalExamination', e.target.value)} />
        <NoteSection title="Diagnosis" content={note.diagnosis} isEditing={isEditing} onChange={e => handleFieldChange('diagnosis', e.target.value)} />
        <NoteSection title="Treatment Plan" content={note.treatmentPlan} isEditing={isEditing} onChange={e => handleFieldChange('treatmentPlan', e.target.value)} />
        <NoteSection 
          title="Management Plan" 
          content={formatManagementPlan(note.managementPlan)} 
          isEditing={isEditing} 
          onChange={e => handleFieldChange('managementPlan', e.target.value)} 
          rawContent={note.managementPlan}
        />
        <NoteSection title="Follow-up Instructions" content={note.followUpInstructions} isEditing={isEditing} onChange={e => handleFieldChange('followUpInstructions', e.target.value)} />
        
        <Separator className="my-6 no-print" />
        
        {/* Doctor Information and Signature Section */}
        <div className="pt-6 space-y-4 doctor-info">
          <h3 className="text-lg font-semibold mb-4 doctor-section">Medical Professional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 doctor-section">
            {/* Doctor Details */}
            <div className="space-y-3 doctor-section">
              <div>
                <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                {isEditing ? (
                  <Input
                    value={editedNote.doctorName || user?.name || 
                           (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                           "Dr. [Name]"}
                    onChange={(e) => handleFieldChange('doctorName', e.target.value)}
                    className="mt-1"
                    placeholder="Enter doctor name"
                  />
                ) : (
                  <p className="text-base font-medium">
                    {editedNote.doctorName || user?.name || 
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                     "Dr. [Name]"}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                {isEditing ? (
                  <Input
                    value={editedNote.doctorRegistrationNo || user?.registrationNo || "MMC-[Registration]"}
                    onChange={(e) => handleFieldChange('doctorRegistrationNo', e.target.value)}
                    className="mt-1"
                    placeholder="Enter registration number"
                  />
                ) : (
                  <p className="text-base">
                    {editedNote.doctorRegistrationNo || user?.registrationNo || "MMC-[Registration]"}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Department/Specialization</label>
                {isEditing ? (
                  <Input
                    value={editedNote.doctorDepartment || user?.specialization || "General Medicine"}
                    onChange={(e) => handleFieldChange('doctorDepartment', e.target.value)}
                    className="mt-1"
                    placeholder="Enter department"
                  />
                ) : (
                  <p className="text-base">
                    {editedNote.doctorDepartment || user?.specialization || "General Medicine"}
                  </p>
                )}
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="space-y-3 doctor-section">
              <label className="text-sm font-medium text-gray-600">Doctor's Signature</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px] flex flex-col items-center justify-center bg-gray-50 signature-space">
                {signatureFile || editedNote.doctorSignature ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={signatureFile || editedNote.doctorSignature || ''} 
                      alt="Doctor's Signature" 
                      className="max-w-full max-h-full object-contain signature-image"
                      style={{ maxHeight: '100px' }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-4xl text-gray-400">✍️</div>
                    <p className="text-sm text-gray-500">Digital signature space</p>
                    <p className="text-xs text-gray-400">
                      Print to sign manually or upload e-signature
                    </p>
                  </div>
                )}
              </div>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Signature Options */}
              <div className="flex gap-2 no-print">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handlePrint}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Print & Sign
                </Button>
                {signatureFile || editedNote.doctorSignature ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSignatureUpload}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Change Signature
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={removeSignature}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleSignatureUpload}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Signature
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Date and Stamp Section */}
          <div className="flex justify-between items-end pt-4 border-t border-gray-200 doctor-section">
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Issue</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedNote.dateOfIssue || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFieldChange('dateOfIssue', e.target.value)}
                  className="mt-1 w-48"
                />
              ) : (
                <p className="text-base font-medium">
                  {editedNote.dateOfIssue ? 
                    new Date(editedNote.dateOfIssue).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) :
                    new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  }
                </p>
              )}
            </div>
            
            <div className="text-right doctor-section">
              <div className="border-2 border-gray-300 rounded p-3 w-24 h-16 flex items-center justify-center bg-gray-50 stamp-area">
                <span className="text-xs text-gray-500 text-center">Official<br/>Stamp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Practice Selector Dialog for PDF Export */}
      <Dialog open={showPracticeSelector?.open || false} onOpenChange={(open) => !open && setShowPracticeSelector(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Practice for PDF Export</DialogTitle>
            <DialogDescription>
              Choose which practice to label this PDF export (affects filename). The PDF content will use your profile settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Current Organization (if available and not generic) */}
            {user?.organization && user.organization.name !== "Independent Practice" && user.organization.name !== "General Hospital" && user.organization.name !== "Medical Clinic" && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => showPracticeSelector && exportPDFWithPractice(
                  showPracticeSelector.patientName,
                  {
                    organizationName: user.organization.name,
                    organizationType: user.organization.type,
                    practiceLabel: user.organization.type === 'HOSPITAL' ? 'HOSPITAL' : 
                                  user.organization.type === 'CLINIC' ? 'CLINIC' : 'PRIVATE PRACTICE'
                  }
                )}
              >
                <div className="text-left">
                  <div className="font-medium">{user.organization.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.organization.type === 'HOSPITAL' ? 'Hospital' : 
                     user.organization.type === 'CLINIC' ? 'Clinic' : 'Private Practice'} (Your Organization)
                  </div>
                </div>
              </Button>
            )}

            {/* Common Practice Options */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.patientName,
                {
                  organizationName: "General Hospital",
                  organizationType: "HOSPITAL",
                  practiceLabel: "HOSPITAL"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">General Hospital</div>
                <div className="text-sm text-muted-foreground">Hospital Setting</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.patientName,
                {
                  organizationName: "Medical Clinic",
                  organizationType: "CLINIC",
                  practiceLabel: "CLINIC"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">Medical Clinic</div>
                <div className="text-sm text-muted-foreground">Clinic Setting</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.patientName,
                {
                  organizationName: "Private Practice",
                  organizationType: "PRIVATE_PRACTICE",
                  practiceLabel: "PRIVATE PRACTICE"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">Private Practice</div>
                <div className="text-sm text-muted-foreground">Independent Practice</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPracticeSelector(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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

const NoteSection = ({ title, content, isEditing, onChange, rawContent }: { 
  title: string; 
  content?: string | null, 
  isEditing?: boolean, 
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  rawContent?: string | null
}) => {
  if (!content && !isEditing) return null

  return (
    <div className="border-b border-gray-300 pb-4 mb-6">
      <h3 className="font-bold text-lg text-black mb-3 border-b border-gray-400 pb-1">{title}</h3>
      {isEditing ? (
        <Textarea 
          value={rawContent || content || ''} 
          onChange={onChange} 
          rows={6} 
          className="bg-blue-50 border-2" 
          placeholder={title === "Management Plan" ? "Enter management plan as JSON or plain text" : `Enter ${title.toLowerCase()}`}
        />
      ) : (
        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {content ? (
            // For Management Plan, render formatted text with bold headers
            title === "Management Plan" ? (
              <div dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>')
                  .replace(/\n/g, '<br/>')
              }} />
            ) : (
              content
            )
          ) : (
            <span className="text-gray-500 italic">N/A</span>
          )}
        </div>
      )}
    </div>
  )
}
