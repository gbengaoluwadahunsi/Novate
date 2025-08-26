"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Save, Edit2, Loader2, Upload, FileImage, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type MedicalNote } from '@/lib/api-client'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { getUser } from '@/store/features/authSlice'
import DocumentStyleNoteViewer from '@/components/medical-note/document-style-note-viewer'
import NoteVersionHistory from '@/components/medical-note/note-version-history'
import { CleanMedicalNote } from '@/components/medical-note/clean-medical-note-editor'
import { generateProfessionalMedicalNotePDF, ProfessionalMedicalNote } from '@/lib/enhanced-professional-pdf-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function NotePage() {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showUploadsDialog, setShowUploadsDialog] = useState(false)
  
  // File upload refs
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const letterheadInputRef = useRef<HTMLInputElement>(null)

  // Upload state
  const [signatureFile, setSignatureFile] = useState<string | null>(null)
  const [stampFile, setStampFile] = useState<string | null>(null)
  const [letterheadFile, setLetterheadFile] = useState<string | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [stampPreview, setStampPreview] = useState<string | null>(null)
  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null)
  const [isUploadLoading, setIsUploadLoading] = useState(false)
  
  // File input state for proper display
  const [signatureFileName, setSignatureFileName] = useState<string>('')
  const [stampFileName, setStampFileName] = useState<string>('')
  const [letterheadFileName, setLetterheadFileName] = useState<string>('')
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

  // Load existing uploads when user data is available
  useEffect(() => {
    if (user) {
      setSignatureFile((user as any)?.doctorSignature || null)
      setStampFile((user as any)?.doctorStamp || null)
      setLetterheadFile((user as any)?.letterhead || null)
      setSignaturePreview((user as any)?.doctorSignature || null)
      setStampPreview((user as any)?.doctorStamp || null)
      setLetterheadPreview((user as any)?.letterhead || null)
    }
    
    // Also load from localStorage for letterhead functionality
    const savedLetterhead = localStorage.getItem('doctorLetterhead')
    const savedLetterheadFileName = localStorage.getItem('doctorLetterheadFileName')
    if (savedLetterhead) {
      setLetterheadFile(savedLetterhead)
      setLetterheadPreview(savedLetterhead)
      if (savedLetterheadFileName) {
        setLetterheadFileName(savedLetterheadFileName)
      }
    }
  }, [user])

  const fetchNote = async () => {
    if (!noteId) return
    
    try {
      setIsLoading(true)
      const response = await apiClient.getMedicalNote(noteId)
      
      // 🚨 DEBUG: Show individual note data from backend
      console.log('📄 INDIVIDUAL NOTE API RESPONSE:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('🔍 INDIVIDUAL NOTE DATA STRUCTURE:', JSON.stringify(response.data, null, 2));
        console.log('👤 PATIENT INFO FROM BACKEND:', {
          name: response.data.patientName,
          age: response.data.patientAge,
          gender: response.data.patientGender
        });
        console.log('📋 MEDICAL CONTENT FROM BACKEND:', {
          chiefComplaint: response.data.chiefComplaint,
          diagnosis: response.data.diagnosis,
          assessment: response.data.assessmentAndDiagnosis,
          treatmentPlan: response.data.treatmentPlan,
          managementPlan: response.data.managementPlan
        });
        console.log('👨‍⚕️ DOCTOR INFO FROM BACKEND:', {
          name: response.data.doctorName,
          registration: response.data.doctorRegistrationNo,
          department: response.data.doctorDepartment
        });
      }
      
      setNote(response.data || null)
    } catch (error) {
      // Error fetching note
      toast({
        title: 'Error',
        description: 'Failed to load medical note',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle signature file upload
  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSignaturePreview(result)
        setSignatureFile(result)
        setSignatureFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle stamp file upload
  const handleStampUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setStampPreview(result)
        setStampFile(result)
        setStampFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle letterhead file upload
  const handleLetterheadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      // Accept PDF and Word documents
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'image/png',
        'image/jpeg',
        'image/jpg'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, Word document, or image file.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLetterheadPreview(result)
        setLetterheadFile(result)
        setLetterheadFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save uploads to profile
  const handleSaveUploads = async () => {
    setIsUploadLoading(true)
    try {
      // Save to localStorage for letterhead functionality
      if (letterheadFile) {
        localStorage.setItem('doctorLetterhead', letterheadFile)
        if (letterheadFileName) {
          localStorage.setItem('doctorLetterheadFileName', letterheadFileName)
        }
      }
      if (signatureFile) {
        localStorage.setItem('doctorSignature', signatureFile)
      }
      if (stampFile) {
        localStorage.setItem('doctorStamp', stampFile)
      }
      
      const profileData = {
        doctorSignature: signatureFile || undefined,
        doctorStamp: stampFile || undefined,
        letterhead: letterheadFile || undefined,
      }
      
      const response = await apiClient.updateProfile(profileData)
      
      if (response.success) {
        dispatch(getUser()) // Refresh user data
        toast({
          title: "Uploads Saved",
          description: "Your signature, stamp, and letterhead have been updated.",
        })
        setShowUploadsDialog(false)
      } else {
        throw new Error(response.error || 'Failed to save uploads')
      }
    } catch (error) {
      // Error saving uploads
      toast({
        title: "Error",
        description: "Failed to save uploads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadLoading(false)
    }
  }

  const handleSave = async (updatedNote: CleanMedicalNote, changeDescription: string) => {
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
      
      // 🔧 FIXED: Map to CORRECT Backend API Structure (as per API docs)
      const updatedMedicalNote = {
        // Patient Information (nested structure as per API)
        patientInformation: {
          name: updatedNote.patientName,
          age: updatedNote.patientAge,
          gender: updatedNote.patientGender
        },
        
        // Medical Content Fields (as per backend API)
        chiefComplaint: updatedNote.chiefComplaint,
        historyOfPresentingIllness: updatedNote.historyOfPresentingIllness,
        pastMedicalHistory: '',
        systemReview: updatedNote.systemsReview || '',
        physicalExamination: updatedNote.physicalExamination || '',
        assessmentAndDiagnosis: updatedNote.assessment,
        
        // Management Plan (nested structure as per API)
        managementPlan: {
          investigations: updatedNote.investigations || '',
          treatmentAdministered: updatedNote.plan || '',
          medicationsPrescribed: '',
          patientEducation: '',
          followUp: ''
        },
        
        // Additional required fields
        noteType: 'consultation' as const
      }
      
      // Save to backend
      
      const apiResponse = await apiClient.updateMedicalNote(noteId, updatedMedicalNote)
      
      // BACKEND SAVE RESPONSE
      
      // CRITICAL: Update local state with transformed response
      if (apiResponse.success && apiResponse.data) {
        setNote(apiResponse.data as MedicalNote)
      }
      setVersions([...versions, newVersion])
      
      // Force a small delay to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Note saved successfully
      
      toast({
        title: 'Note Updated',
        description: 'Medical note has been saved successfully'
      })
    } catch (error) {
      // Error saving note
      toast({
        title: 'Save Error',
        description: 'Failed to save medical note. Please try again.',
        variant: 'destructive'
      })
      throw error // Re-throw so component can handle error state
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async (useLetterhead?: boolean, letterheadImage?: string, selectedICD11Codes?: any) => {
    if (!note) return

    // PDF Export triggered

    try {
      // Use the new styled PDF generator that matches the note page design
      const { generateStyledNotePDF } = await import('@/lib/styled-note-pdf-generator');
      
      // Generate PDF with styled formatting that matches the note viewer
      generateStyledNotePDF(note, {
        useLetterhead: useLetterhead,
        letterheadImage: letterheadImage,
        selectedICD11Codes: selectedICD11Codes,
        organizationName: 'NovateScribe',
        doctorName: note.doctorName,
        registrationNo: note.doctorRegistrationNo
      });

      // PDF generation completed successfully with multi-page support

      toast({
        title: 'PDF Downloaded',
        description: 'Medical note exported successfully with multi-page support'
      });
      
    } catch (error) {
      // PDF generation failed
      
      // Fallback to simple PDF generation if enhanced generator fails
      try {
        // Attempting fallback PDF generation
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Simple fallback implementation with basic pagination
        let currentY = 20;
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxContentWidth = doc.internal.pageSize.getWidth() - (margin * 2);
        
        const addSectionWithPagination = (title: string, content: string) => {
          // Check if we need a new page
          if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = 20;
          }
          
          // Section header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text(title.toUpperCase(), margin, currentY);
          currentY += 10;
          
          // Content
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          const lines = doc.splitTextToSize(content, maxContentWidth);
          doc.text(lines, margin, currentY);
          currentY += lines.length * 5 + 15;
        };
        
        // Add all sections with pagination
        addSectionWithPagination('Patient Information', `Name: ${note.patientName || 'Not recorded'}, Age: ${note.patientAge || 'Not recorded'}, Gender: ${note.patientGender || 'Not recorded'}`);
        addSectionWithPagination('Chief Complaint', note.chiefComplaint || 'Not recorded');
        addSectionWithPagination('History of Present Illness', note.historyOfPresentingIllness || 'Not recorded');
        addSectionWithPagination('Review of Systems', note.systemReview || 'Not recorded');
        addSectionWithPagination('Physical Examination', 
          note.physicalExamination && 
          note.physicalExamination !== 'Physical examination performed as clinically indicated' && 
          note.physicalExamination !== 'Not recorded' &&
          !note.physicalExamination.toLowerCase().includes('clinically indicated')
            ? note.physicalExamination 
            : 'No physical examination was performed during this consultation.'
        );
        addSectionWithPagination('Assessment', note.assessmentAndDiagnosis || 'Not recorded');
        addSectionWithPagination('Plan', note.managementPlan || 'Not recorded');
        
        // Save fallback PDF
        const patientName = note.patientName || 'Unknown_Patient';
        const safePatientName = patientName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
        const dateStr = new Date().toISOString().split('T')[0];
        
        doc.save(`Medical_Note_${safePatientName}_${dateStr}.pdf`);
        
        // Fallback PDF generation completed
        
        toast({
          title: 'PDF Downloaded (Fallback)',
          description: 'Medical note exported with basic multi-page support'
        });
        
          } catch (fallbackError) {
      // Fallback PDF generation also failed
        toast({
          title: 'PDF Error',
          description: 'Failed to generate PDF. Please try again.',
          variant: 'destructive'
        });
      }
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
      <div className="bg-white border-b px-3 py-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="ml-1 text-xs sm:text-sm text-gray-600 hidden sm:inline">Back to Notes</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Export PDF Button - Icon only on mobile, text on larger screens */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Trigger the DocumentStyleNoteViewer's export function
                const exportEvent = new CustomEvent('exportPDF', { detail: note });
                window.dispatchEvent(exportEvent);
              }}
              className="flex items-center px-2 sm:px-3"
              title="Export PDF"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export PDF</span>
            </Button>
            
            {/* Edit Button - Icon only on mobile, text on larger screens */}
            <Button 
              size="sm" 
              variant="default"
              onClick={() => {
                // Trigger the DocumentStyleNoteViewer's edit mode
                const editEvent = new CustomEvent('toggleEdit');
                window.dispatchEvent(editEvent);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-2 sm:px-3"
              title="Edit Note"
            >
              <Edit2 className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Edit</span>
            </Button>
            
            <Dialog open={showUploadsDialog} onOpenChange={setShowUploadsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 sm:px-3" title="Upload Documents">
                  <Upload className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Upload</span>
                </Button>
              </DialogTrigger>
              
              {/* Upload Documents Dialog Content */}
              <DialogContent className="max-w-5xl max-h-[85vh]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Professional Documents</DialogTitle>
                  <DialogDescription className="text-base">
                    Upload your signature, stamp, and letterhead for professional medical note generation
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 overflow-y-auto">
                  {/* Signature Upload */}
                  <Card className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-blue-600" />
                        </div>
                        Digital Signature
                      </CardTitle>
                      <CardDescription>
                        Your professional signature for document authentication
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {signaturePreview ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <img 
                              src={signaturePreview} 
                              alt="Signature preview" 
                              className="w-full h-32 object-contain bg-white border rounded-lg shadow-sm"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSignatureFile(null)
                                setSignaturePreview(null)
                                setSignatureFileName('')
                                if (signatureInputRef.current) signatureInputRef.current.value = ''
                              }}
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 text-center">{signatureFileName}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                            onClick={() => signatureInputRef.current?.click()}
                          >
                            <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600">Click to upload signature</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        ref={signatureInputRef}
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>

                  {/* Stamp Upload */}
                  <Card className="border-2 hover:border-green-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-green-600" />
                        </div>
                        Official Stamp
                      </CardTitle>
                      <CardDescription>
                        Your medical practice official stamp
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stampPreview ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <img 
                              src={stampPreview} 
                              alt="Stamp preview" 
                              className="w-full h-32 object-contain bg-white border rounded-lg shadow-sm"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setStampFile(null)
                                setStampPreview(null)
                                setStampFileName('')
                                if (stampInputRef.current) stampInputRef.current.value = ''
                              }}
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 text-center">{stampFileName}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer bg-gray-50"
                            onClick={() => stampInputRef.current?.click()}
                          >
                            <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600">Click to upload stamp</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        ref={stampInputRef}
                        onChange={handleStampUpload}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>

                  {/* Letterhead Upload */}
                  <Card className="border-2 hover:border-purple-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileImage className="h-5 w-5 text-purple-600" />
                        </div>
                        Letterhead
                      </CardTitle>
                      <CardDescription>
                        Your organization's professional letterhead
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {letterheadPreview ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <img 
                              src={letterheadPreview} 
                              alt="Letterhead preview" 
                              className="w-full h-32 object-contain bg-white border rounded-lg shadow-sm"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setLetterheadFile(null)
                                setLetterheadPreview(null)
                                setLetterheadFileName('')
                                if (letterheadInputRef.current) letterheadInputRef.current.value = ''
                                // Also remove from localStorage
                                localStorage.removeItem('doctorLetterhead')
                                localStorage.removeItem('doctorLetterheadFileName')
                              }}
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 text-center">{letterheadFileName}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-50"
                            onClick={() => letterheadInputRef.current?.click()}
                          >
                            <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-600">Click to upload letterhead</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, Word documents (.pdf, .doc, .docx) up to 10MB</p>
                          </div>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        ref={letterheadInputRef}
                        onChange={handleLetterheadUpload}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter className="pt-6 border-t">
                  <Button variant="outline" onClick={() => setShowUploadsDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveUploads} 
                    disabled={isUploadLoading}
                    className="min-w-24 bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploadLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Documents
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/settings')}
              className="px-2 sm:px-3"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Integrated Medical Note Document */}
      <div className="py-6">
        <DocumentStyleNoteViewer
          note={(() => {
            // LOADING NOTE FROM BACKEND API (CORRECT FORMAT)
            
            // 🔧 FIXED: Convert from backend API format to CleanMedicalNote
            const convertedNote: CleanMedicalNote = {
              // Patient Information
              patientName: note.patientName || '',
              patientAge: note.patientAge?.toString() || '',
              patientGender: note.patientGender || '',
              visitDate: note.visitDate || new Date().toISOString().split('T')[0],
              
              // Vital Signs - Map from backend vitalSigns object
              temperature: (note as any).vitalSigns?.temperature || note.temperature || 'Not recorded',
              pulseRate: (note as any).vitalSigns?.pulseRate || note.pulseRate || 'Not recorded',
              respiratoryRate: (note as any).vitalSigns?.respiratoryRate || note.respiratoryRate || 'Not recorded',
              bloodPressure: (note as any).vitalSigns?.bloodPressure || note.bloodPressure || 'Not recorded',
              glucose: (note as any).vitalSigns?.glucoseLevels || note.glucoseLevels || note.glucose || 'Not recorded',
              
              // Main Medical Content
              chiefComplaint: note.chiefComplaint || '',
              historyOfPresentingIllness: note.historyOfPresentingIllness || note.historyOfPresentIllness || '',
              medicalConditions: note.pastMedicalHistory || '',
              surgeries: '', // Not provided in backend response
              hospitalizations: '', // Not provided in backend response
              medications: note.managementPlan?.medicationsPrescribed || '',
              allergies: '', // Not provided in backend response
              smoking: note.socialHistory || '', // Use socialHistory from backend
              alcohol: '', // Could be parsed from socialHistory if needed
              recreationalDrugs: '', // Could be parsed from socialHistory if needed
              occupationLivingSituation: '', // Could be parsed from socialHistory if needed
              travel: '', // Could be parsed from socialHistory if needed
              sexual: '', // Could be parsed from socialHistory if needed
              eatingOut: '', // Could be parsed from socialHistory if needed
              familyHistory: '', // Not provided in backend response
              
              // Review of Systems
              systemsReview: note.systemReview || '',
              
              // Physical Examination
              physicalExamination: note.physicalExamination || '',
              

              
              // Assessment & Plan
              investigations: note.managementPlan?.investigations || '',
              assessment: note.assessmentAndDiagnosis || note.diagnosis || '',
              plan: (() => {
                // Combine all management plan components
                const planParts = [];
                if (note.managementPlan?.followUp) planParts.push(`Follow-up: ${note.managementPlan.followUp}`);
                if (note.managementPlan?.investigations) planParts.push(`Investigations: ${note.managementPlan.investigations}`);
                if (note.managementPlan?.patientEducation) planParts.push(`Patient Education: ${note.managementPlan.patientEducation}`);
                if (note.managementPlan?.medicationsPrescribed) planParts.push(`Medications: ${note.managementPlan.medicationsPrescribed}`);
                if (note.managementPlan?.treatmentAdministered) planParts.push(`Treatment: ${note.managementPlan.treatmentAdministered}`);
                return planParts.length > 0 ? planParts.join('\n\n') : note.treatmentPlan || '';
              })(),
              
              // ICD-11 Codes (optional)
              icd11Codes: note.icd11Codes,
              
              // Doctor Information
              doctorName: note.doctorName || '',
              doctorRegistrationNo: note.doctorRegistrationNo || '',
              dateTime: note.createdAt || new Date().toLocaleString(),
              signature: note.doctorSignature || '',
              stamp: note.doctorStamp || '',
              
              // Transcript for validation
              originalTranscript: '',
              transcript: ''
            }
            
            // CONVERTED FROM BACKEND API
            
            return convertedNote
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
      
        }}
        onRestoreVersion={(version) => {
          // Handle version restoration
          
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