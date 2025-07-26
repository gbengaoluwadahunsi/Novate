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

// Extended interface for editable medical note with doctor information
interface EditableMedicalNote extends Omit<MedicalNote, 'patientAge' | 'patientGender'> {
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string;
  doctorStamp?: string;
  dateOfIssue?: string;
  patientAge?: string | number | null;
  patientGender?: string;
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
  const [lastSaveTime, setLastSaveTime] = useState(0)
  const [editedNote, setEditedNote] = useState<Partial<EditableMedicalNote>>({})
  const [selectedVersions, setSelectedVersions] = useState<{ from: number; to: number }>({ from: 1, to: 1 })
  const [versionComparison, setVersionComparison] = useState<VersionComparison | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState<{ version: number; open: boolean }>({ version: 0, open: false })
  const [restoreReason, setRestoreReason] = useState('')
  const [signatureFile, setSignatureFile] = useState<string | null>(null)
  const [stampFile, setStampFile] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)

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
      // 🚨 CRITICAL SECURITY CHECK: Verify user is authenticated
      const token = localStorage.getItem('token')
      if (!user || !token) {
        logger.error('🚨 SECURITY: User not authenticated, redirecting to login')
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view this note',
          variant: 'destructive'
        })
        router.push('/login')
        return
      }

      const [noteResponse, versionsResponse] = await Promise.all([
        apiClient.getMedicalNote(noteId),
        apiClient.getNoteVersions(noteId)
      ])
      
      if (noteResponse.success && noteResponse.data) {
        const noteData = noteResponse.data

        setNote(noteData)
        setEditedNote({
          ...noteData,
          doctorName: (noteData as any).doctorName || user?.name || 
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                     "Dr. [Name]",
          doctorRegistrationNo: (noteData as any).doctorRegistrationNo || user?.registrationNo || "",
          doctorDepartment: (noteData as any).doctorDepartment || user?.specialization || "General Medicine",
          dateOfIssue: (noteData as any).dateOfIssue || new Date().toISOString().split('T')[0],
          doctorSignature: (noteData as any).doctorSignature || null,
          doctorStamp: (noteData as any).doctorStamp || null
        })
        
        if ((noteData as any).doctorSignature) {
          setSignatureFile((noteData as any).doctorSignature)
        }
        
        if ((noteData as any).doctorStamp) {
          setStampFile((noteData as any).doctorStamp)
        }

        // Set display name (patient name or case number)
        const name = await generateCaseNumber(noteData)
        setDisplayName(name)
      } else {
        logger.error('Failed to load note:', noteResponse.error)
        toast({
          title: 'Error',
          description: 'Failed to load note. You may not have permission to view this note.',
          variant: 'destructive'
        })
        router.push('/dashboard/notes')
        return
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
      router.push('/dashboard/notes')
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
    const now = Date.now()
    if (!note || !editedNote || isSaving || (now - lastSaveTime < 2000)) {
      console.log('🚫 Save blocked:', { 
        hasNote: !!note, 
        hasEditedNote: !!editedNote, 
        isSaving, 
        timeSinceLastSave: now - lastSaveTime 
      })
      return
    }
    
    setLastSaveTime(now)

        // Prepare data in the exact format the backend expects
    const saveData: any = {
      // Patient information - nested structure as expected by backend
      patientInformation: {
        name: editedNote.patientName || note.patientName || '',
        age: String(editedNote.patientAge || note.patientAge || 'N/A'),
        gender: editedNote.patientGender || note.patientGender || 'Male'
      }
    }

    // Medical content - use original data if edited data is missing or corrupted
    if (editedNote.chiefComplaint !== undefined && editedNote.chiefComplaint.trim()) {
      saveData.chiefComplaint = editedNote.chiefComplaint
    } else if (note.chiefComplaint) {
      saveData.chiefComplaint = note.chiefComplaint
    }
    
    if (editedNote.historyOfPresentingIllness !== undefined && editedNote.historyOfPresentingIllness.trim()) {
      saveData.historyOfPresentingIllness = editedNote.historyOfPresentingIllness
    } else if (note.historyOfPresentingIllness || note.historyOfPresentIllness) {
      saveData.historyOfPresentingIllness = note.historyOfPresentingIllness || note.historyOfPresentIllness
    }
    
    if (editedNote.pastMedicalHistory !== undefined && editedNote.pastMedicalHistory.trim()) {
      saveData.pastMedicalHistory = editedNote.pastMedicalHistory
    } else if (note.pastMedicalHistory) {
      saveData.pastMedicalHistory = note.pastMedicalHistory
    }
    
    if (editedNote.systemReview !== undefined && editedNote.systemReview.trim()) {
      saveData.systemReview = editedNote.systemReview
    } else if (note.systemReview) {
      saveData.systemReview = note.systemReview
    }
    
    if (editedNote.physicalExamination !== undefined && editedNote.physicalExamination.trim()) {
      saveData.physicalExamination = editedNote.physicalExamination
    } else if (note.physicalExamination) {
      saveData.physicalExamination = note.physicalExamination
    }
    
    // Map diagnosis to assessmentAndDiagnosis as expected by backend
    if (editedNote.diagnosis !== undefined && editedNote.diagnosis.trim()) {
      saveData.assessmentAndDiagnosis = editedNote.diagnosis
    } else if (note.diagnosis) {
      saveData.assessmentAndDiagnosis = note.diagnosis
    }
    
    if (editedNote.treatmentPlan !== undefined && editedNote.treatmentPlan.trim()) {
      saveData.treatmentPlan = editedNote.treatmentPlan
    } else if (note.treatmentPlan) {
      saveData.treatmentPlan = note.treatmentPlan
    }
    
    // Management plan - ensure it's in the correct format
    if (editedNote.managementPlan !== undefined) {
      // If it's already an object, use it as is
      if (typeof editedNote.managementPlan === 'object') {
        saveData.managementPlan = editedNote.managementPlan
      } else {
        // If it's a string, try to parse it or create default structure
        try {
          saveData.managementPlan = JSON.parse(editedNote.managementPlan)
        } catch {
          saveData.managementPlan = {
            investigations: editedNote.managementPlan || 'N/A',
            treatmentAdministered: 'N/A',
            medicationsPrescribed: 'N/A',
            patientEducation: 'N/A',
            followUp: 'N/A'
          }
        }
      }
    } else if (note.managementPlan) {
      // Handle original note management plan
      if (typeof note.managementPlan === 'object') {
        saveData.managementPlan = note.managementPlan
      } else {
        saveData.managementPlan = {
          investigations: 'N/A',
          treatmentAdministered: 'N/A',
          medicationsPrescribed: 'N/A',
          patientEducation: 'N/A',
          followUp: 'N/A'
        }
      }
    }
    
    if (editedNote.followUpInstructions !== undefined && editedNote.followUpInstructions.trim()) {
      saveData.followUpInstructions = editedNote.followUpInstructions
    } else if (note.followUpInstructions) {
      saveData.followUpInstructions = note.followUpInstructions
    }

    // Doctor information - only if they exist and are not empty
    if (editedNote.doctorName && editedNote.doctorName.trim()) {
      saveData.doctorName = editedNote.doctorName
    } else if ((note as any).doctorName) {
      saveData.doctorName = (note as any).doctorName
    }
    
    if (editedNote.doctorRegistrationNo && editedNote.doctorRegistrationNo.trim()) {
      saveData.doctorRegistrationNo = editedNote.doctorRegistrationNo
    } else if ((note as any).doctorRegistrationNo) {
      saveData.doctorRegistrationNo = (note as any).doctorRegistrationNo
    }
    
    if (editedNote.doctorDepartment && editedNote.doctorDepartment.trim()) {
      saveData.doctorDepartment = editedNote.doctorDepartment
    } else if ((note as any).doctorDepartment) {
      saveData.doctorDepartment = (note as any).doctorDepartment
    }
    
    // NOTE: doctorSignature is NOT included in backend schema - removing from save data
    // Signatures are handled separately or stored locally for PDF generation only
    
    if (editedNote.dateOfIssue) {
      saveData.dateOfIssue = editedNote.dateOfIssue
    } else if ((note as any).dateOfIssue) {
      saveData.dateOfIssue = (note as any).dateOfIssue
    }

    console.log('💾 Saving note with BACKEND-COMPATIBLE data:', saveData)
    console.log('📋 Data structure check:', {
      hasPatientInfo: !!saveData.patientInformation,
      patientName: saveData.patientInformation?.name,
      patientAge: saveData.patientInformation?.age,
      patientGender: saveData.patientInformation?.gender,
      hasDiagnosis: !!saveData.assessmentAndDiagnosis,
      hasManagementPlan: !!saveData.managementPlan,
      managementPlanType: typeof saveData.managementPlan,
      excludedFields: ['doctorSignature', 'doctorStamp'] // These are kept locally only
    })
    setIsSaving(true)
    try {
      const response = await apiClient.updateMedicalNote(note.id, saveData)
      console.log('📡 API Response:', response)
      
      if (response.success) {
        console.log('✅ Save successful:', response)
        // Convert editedNote to be compatible with MedicalNote type
        const updatedNote = {
          ...note,
          ...editedNote,
          patientAge: typeof editedNote.patientAge === 'string' 
            ? (editedNote.patientAge === '' ? null : parseInt(editedNote.patientAge) || null)
            : editedNote.patientAge,
          patientGender: editedNote.patientGender || note?.patientGender || ''
        } as MedicalNote
        setNote(updatedNote)
        setIsEditing(false)
        
        // Show success message with signature/stamp info if applicable
        const hasSignature = editedNote.doctorSignature || signatureFile
        const hasStamp = editedNote.doctorStamp || stampFile
        const attachments = []
        if (hasSignature) attachments.push('signature')
        if (hasStamp) attachments.push('stamp')
        
        toast({
          title: 'Success',
          description: attachments.length > 0 
            ? `Medical note updated successfully with ${attachments.join(' and ')}` 
            : 'Medical note updated successfully',
        })
      } else {
        console.error('❌ Save failed:', response)
        console.error('❌ Error details:', response.details)
        throw new Error(response.error || response.details || 'Failed to update note')
      }
    } catch (error) {
      console.error('💥 Save error:', error)
      logger.error('Error saving note:', error)
      toast({
        title: 'Error',
        description: `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (field: keyof EditableMedicalNote, value: any) => {
    console.log('📝 Field change:', field, '=', value)
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

  const handleStampUpload = () => {
    stampInputRef.current?.click()
  }

  const handleStampFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setStampFile(base64String)
        handleFieldChange('doctorStamp', base64String)
        toast({
          title: 'Stamp Uploaded',
          description: 'Official stamp has been uploaded successfully',
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeStamp = () => {
    setStampFile(null)
    handleFieldChange('doctorStamp', null)
    if (stampInputRef.current) {
      stampInputRef.current.value = ''
    }
    toast({
      title: 'Stamp Removed',
      description: 'Official stamp has been removed',
    })
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
    setShowPracticeSelector({ open: true, patientName: note?.patientName || 'Patient' })
  }

  // PDF export with selected practice info
  const exportPDFWithPractice = async (patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      console.log('📄 Generating PDF for note:', note?.id, 'Patient:', patientName, 'Practice:', practiceInfo)
      
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
      // Create note with doctor information, signature from local state, and any edited content
      const noteWithDoctorInfo: any = {
        // Base note properties (ensuring no null values)
        id: note?.id || '',
        patientName: editedNote.patientName || note?.patientName || 'Unknown Patient',
        patientAge: typeof editedNote.patientAge === 'string' 
          ? (editedNote.patientAge === '' ? null : parseInt(editedNote.patientAge) || null)
          : (editedNote.patientAge || note?.patientAge || null),
        patientGender: editedNote.patientGender || note?.patientGender || 'Not specified',
        noteType: (note?.noteType || 'consultation') as string,
        visitDate: note?.visitDate || '',
        visitTime: note?.visitTime || '',
        chiefComplaint: editedNote.chiefComplaint || note?.chiefComplaint || '',
        historyOfPresentIllness: note?.historyOfPresentIllness || '',
        historyOfPresentingIllness: editedNote.historyOfPresentingIllness || note?.historyOfPresentingIllness || '',
        pastMedicalHistory: editedNote.pastMedicalHistory || note?.pastMedicalHistory || '',
        systemReview: editedNote.systemReview || note?.systemReview || '',
        physicalExamination: editedNote.physicalExamination || note?.physicalExamination || '',
        diagnosis: editedNote.diagnosis || note?.diagnosis || '',
        treatmentPlan: editedNote.treatmentPlan || note?.treatmentPlan || '',
        managementPlan: editedNote.managementPlan || note?.managementPlan || '',
        followUpInstructions: editedNote.followUpInstructions || note?.followUpInstructions || '',
        additionalNotes: note?.additionalNotes || '',
        prescriptions: note?.prescriptions || [],
        audioJobId: note?.audioJobId || '',
        timeSaved: note?.timeSaved || null,
        createdAt: note?.createdAt || new Date().toISOString(),
        updatedAt: note?.updatedAt || new Date().toISOString(),
        // Doctor information
        doctorName: editedNote.doctorName || user?.name || 
                   (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                   "Dr. [Name]",
        doctorRegistrationNo: editedNote.doctorRegistrationNo || user?.registrationNo || "",
        doctorDepartment: editedNote.doctorDepartment || user?.specialization || "General Medicine",
        dateOfIssue: editedNote.dateOfIssue || (note as any)?.dateOfIssue || new Date().toISOString().split('T')[0],
        // Always string for PDF generator
        doctorSignature: (user as any)?.doctorSignature || signatureFile || editedNote.doctorSignature || (note as any)?.doctorSignature || '',
        doctorStamp: (user as any)?.doctorStamp || stampFile || editedNote.doctorStamp || (note as any)?.doctorStamp || ''
      };
      
      console.log('📄 PDF generation - Including signature and stamp:', {
        hasSignatureFile: !!signatureFile,
        hasEditedSignature: !!editedNote.doctorSignature,
        hasNoteSignature: !!(note as any)?.doctorSignature,
        finalSignature: !!(noteWithDoctorInfo as any).doctorSignature,
        signatureLength: (noteWithDoctorInfo as any).doctorSignature?.length || 0,
        hasStampFile: !!stampFile,
        hasEditedStamp: !!editedNote.doctorStamp,
        hasNoteStamp: !!(note as any)?.doctorStamp,
        finalStamp: !!(noteWithDoctorInfo as any).doctorStamp,
        stampLength: (noteWithDoctorInfo as any).doctorStamp?.length || 0
      });

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
        const allNotes = response.data.notes || response.data
        
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
  const formatManagementPlan = (managementPlanData?: string | object | null): string => {
    console.log('🔧 formatManagementPlan input:', { managementPlanData, type: typeof managementPlanData })
    
    if (!managementPlanData) return 'N/A'
    
    try {
      // Handle different data types
      let parsed
      if (typeof managementPlanData === 'string') {
        // Try to parse JSON string
        try {
          parsed = JSON.parse(managementPlanData)
        } catch {
          // If it's not JSON, return as is
          return managementPlanData
        }
      } else if (typeof managementPlanData === 'object') {
        parsed = managementPlanData
      } else {
        // If it's already a string or other type, return as is
        return String(managementPlanData)
      }
      
      // If parsed is not an object, return as string
      if (typeof parsed !== 'object' || parsed === null) {
        console.log('🔧 Parsed is not an object, returning as string:', String(managementPlanData))
        return String(managementPlanData)
      }
      
      console.log('🔧 Parsed object:', parsed)
      
      let formatted = ''
      
      // Format each section with proper labels
      if (parsed.investigations && parsed.investigations !== 'N/A') {
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
      
      // If no sections were formatted, return appropriate message
      if (!formatted.trim()) {
        console.log('🔧 FIXED: No sections formatted, returning default message')
        return 'No management plan details available'
      }
      
      console.log('🔧 Formatted management plan:', formatted.trim())
      return formatted.trim()
    } catch (error) {
      console.error('Error formatting management plan:', error)
      // If all parsing fails, return the original data as string
      const fallback = String(managementPlanData || 'N/A')
      console.log('🔧 Error fallback:', fallback)
      return fallback
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
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Back to Notes</span>
      </div>

      {/* Document Header */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-medium mb-2 dark:text-white">Medical Clinic</h2>
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">MEDICAL CONSULTATION NOTE</h1>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <div>
            <strong>Patient Name:</strong> {displayName || note.patientName || 'Medical Case 001'}
          </div>
          <div>
            <strong>Date:</strong> {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 dark:text-gray-300 mt-2 gap-4">
          <div className="flex items-center">
            <strong className="text-gray-700 dark:text-gray-200">Age:</strong> 
            {isEditing ? (
              <Input
                type="text"
                key={`age-${note.id}`}
                defaultValue={String(note.patientAge || 'N/A')}
                onChange={(e) => handleFieldChange('patientAge', e.target.value)}
                className="inline-block w-20 ml-2 text-sm h-8 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white rounded-md shadow-sm"
                placeholder="Age"
              />
            ) : (
              <span className="ml-2 px-3 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">{note.patientAge || 'N/A'}</span>
            )}
          </div>
          <div className="flex items-center">
            <strong className="text-gray-700">Gender:</strong> 
            {isEditing ? (
              <Select 
                value={editedNote.patientGender || note.patientGender || ''} 
                onValueChange={(value) => handleFieldChange('patientGender', value)}
              >
                <SelectTrigger className="inline-flex items-center justify-between w-32 ml-2 text-sm h-8 px-3 py-1 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white rounded-md shadow-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
                  <SelectItem value="Male" className="hover:bg-blue-50">Male</SelectItem>
                  <SelectItem value="Female" className="hover:bg-blue-50">Female</SelectItem>
                  <SelectItem value="Other" className="hover:bg-blue-50">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="ml-2 px-3 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">{note.patientGender}</span>
            )}
          </div>
          <div className="flex items-center">
            <strong className="text-gray-700">Note Type:</strong> 
            <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-700">{note.noteType}</span>
          </div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-6 no-print">
              {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </>
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
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-8">
                <NoteSection title="Chief Complaint" content={note.chiefComplaint} isEditing={isEditing} onChange={e => handleFieldChange('chiefComplaint', e.target.value)} />
                <NoteSection title="History of Presenting Illness" content={note.historyOfPresentingIllness || note.historyOfPresentIllness} isEditing={isEditing} onChange={e => handleFieldChange('historyOfPresentingIllness', e.target.value)} />
                <NoteSection title="Past Medical History" content={note.pastMedicalHistory} isEditing={isEditing} onChange={e => handleFieldChange('pastMedicalHistory', e.target.value)} />
                <NoteSection title="System Review" content={note.systemReview} isEditing={isEditing} onChange={e => handleFieldChange('systemReview', e.target.value)} />
                <NoteSection title="Physical Examination" content={note.physicalExamination} isEditing={isEditing} onChange={e => handleFieldChange('physicalExamination', e.target.value)} />
                <NoteSection title="Diagnosis" content={note.diagnosis} isEditing={isEditing} onChange={e => handleFieldChange('diagnosis', e.target.value)} />
                <NoteSection title="Treatment Plan" content={note.treatmentPlan} isEditing={isEditing} onChange={e => handleFieldChange('treatmentPlan', e.target.value)} />
        <NoteSection 
          title="Management Plan" 
          content={(() => {
            console.log('🔧 Raw note.managementPlan:', note.managementPlan);
            console.log('🔧 Type:', typeof note.managementPlan);
            console.log('🔧 Is Array:', Array.isArray(note.managementPlan));
            console.log('🔧 JSON stringify test:', JSON.stringify(note.managementPlan));
            
            // Force string conversion as fallback
            if (typeof note.managementPlan === 'object' && note.managementPlan !== null) {
              console.log('🔧 Object detected, keys:', Object.keys(note.managementPlan));
              const formatted = formatManagementPlan(note.managementPlan);
              console.log('🔧 Formatted result:', formatted);
              
              // If formatting failed, create manual format
              if (formatted === '[object Object]' || !formatted || formatted.trim() === '') {
                console.log('🔧 Formatting failed, creating manual format');
                const obj = note.managementPlan as any;
                let manual = '';
                
                if (obj.investigations && obj.investigations !== 'N/A') {
                  manual += `**Investigations:**\n${obj.investigations}\n\n`;
                }
                if (obj.treatmentAdministered && obj.treatmentAdministered !== 'N/A') {
                  manual += `**Treatment Administered:**\n${obj.treatmentAdministered}\n\n`;
                }
                if (obj.medicationsPrescribed && obj.medicationsPrescribed !== 'N/A') {
                  manual += `**Medications Prescribed:**\n${obj.medicationsPrescribed}\n\n`;
                }
                if (obj.patientEducation && obj.patientEducation !== 'N/A') {
                  manual += `**Patient Education:**\n${obj.patientEducation}\n\n`;
                }
                if (obj.followUp && obj.followUp !== 'N/A') {
                  manual += `**Follow-up:**\n${obj.followUp}\n\n`;
                }
                
                const result = manual.trim() || 'No management plan details available';
                console.log('🔧 Manual format result:', result);
                return result;
              }
              
              return formatted;
            } else {
              const formatted = formatManagementPlan(note.managementPlan);
              console.log('🔧 Non-object formatted result:', formatted);
              return formatted;
            }
          })()} 
          isEditing={isEditing} 
          onChange={e => handleFieldChange('managementPlan', e.target.value)} 
          rawContent={typeof note.managementPlan === 'object' ? JSON.stringify(note.managementPlan, null, 2) : note.managementPlan}
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
              
              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={stampInputRef}
                type="file"
                accept="image/*"
                onChange={handleStampFileChange}
                className="hidden"
              />
              
              {/* Signature Options */}
              <div className="flex gap-2 no-print">
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
              <div className="border-2 border-gray-300 rounded p-3 w-24 h-16 flex items-center justify-center bg-gray-50 stamp-area relative">
                {stampFile || editedNote.doctorStamp ? (
                  <img 
                    src={stampFile || editedNote.doctorStamp || ''} 
                    alt="Official Stamp"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-500 text-center">Official<br/>Stamp</span>
                )}
              </div>
              
              {/* Stamp Upload Options */}
              <div className="flex gap-1 mt-2 no-print">
                {stampFile || editedNote.doctorStamp ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleStampUpload}
                      className="text-xs px-2 py-1"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Change
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={removeStamp}
                      className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleStampUpload}
                    className="text-xs px-2 py-1 w-full"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Stamp
                  </Button>
                )}
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
                    organizationName: user?.organization?.name || 'Medical Practice',
                    organizationType: (user?.organization?.type as 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE') || 'PRIVATE_PRACTICE',
                    practiceLabel: user?.organization?.type === 'HOSPITAL' ? 'HOSPITAL' : 
                                  user?.organization?.type === 'CLINIC' ? 'CLINIC' : 'PRIVATE PRACTICE'
                  }
                )}
              >
                <div className="text-left">
                  <div className="font-medium">{user?.organization?.name || 'Medical Practice'}</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.organization?.type === 'HOSPITAL' ? 'Hospital' : 
                     user?.organization?.type === 'CLINIC' ? 'Clinic' : 'Private Practice'} (Your Organization)
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
    <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-6">
      <h3 className="font-bold text-lg text-black dark:text-white mb-3 border-b border-gray-400 dark:border-gray-500 pb-1">
        {title}
        {isEditing && (
          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-normal">(Editing)</span>
        )}
      </h3>
      {isEditing ? (
        <Textarea 
          defaultValue={rawContent || content || ''} 
          onChange={onChange} 
          rows={6} 
          className="bg-blue-50 dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white" 
          placeholder={title === "Management Plan" ? "Enter management plan as JSON or plain text" : `Enter ${title.toLowerCase()}`}
        />
      ) : (
        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
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
            <span className="text-gray-500 dark:text-gray-400 italic">N/A</span>
          )}
        </div>
      )}
    </div>
  )
}
