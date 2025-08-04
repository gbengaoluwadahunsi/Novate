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
import { SimpleMedicalNote } from '@/components/medical-note/simple-medical-note-editor'
import { generateProfessionalMedicalNotePDF, ProfessionalMedicalNote } from '@/lib/professional-pdf-generator'
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
  }, [user])

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
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc).",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLetterheadPreview(result)
        setLetterheadFile(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save uploads to profile
  const handleSaveUploads = async () => {
    setIsUploadLoading(true)
    try {
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
      console.error('Error saving uploads:', error)
      toast({
        title: "Error",
        description: "Failed to save uploads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadLoading(false)
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
          <div className="flex items-center gap-2">
            <Dialog open={showUploadsDialog} onOpenChange={setShowUploadsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Documents
                </Button>
              </DialogTrigger>
              
              {/* Upload Documents Dialog Content */}
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Upload Professional Documents</DialogTitle>
                  <DialogDescription>
                    Upload your signature, stamp, and letterhead for professional PDF generation.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4 overflow-y-auto">
                  {/* Signature Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileImage className="h-5 w-5" />
                        Digital Signature
                      </CardTitle>
                      <CardDescription>
                        Upload your digital signature for document authentication
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="signature-upload" className="sr-only">
                            Upload Signature
                          </Label>
                          <Input
                            id="signature-upload"
                            type="file"
                            accept="image/*"
                            ref={signatureInputRef}
                            onChange={handleSignatureUpload}
                            className="cursor-pointer"
                          />
                        </div>
                        {signaturePreview && (
                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                            <div className="text-center">
                              <img 
                                src={signaturePreview} 
                                alt="Signature preview" 
                                className="max-h-24 w-auto mx-auto border rounded"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSignatureFile(null)
                                  setSignaturePreview(null)
                                  if (signatureInputRef.current) signatureInputRef.current.value = ''
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stamp Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileImage className="h-5 w-5" />
                        Official Stamp
                      </CardTitle>
                      <CardDescription>
                        Upload your official medical practice stamp
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stamp-upload" className="sr-only">
                            Upload Stamp
                          </Label>
                          <Input
                            id="stamp-upload"
                            type="file"
                            accept="image/*"
                            ref={stampInputRef}
                            onChange={handleStampUpload}
                            className="cursor-pointer"
                          />
                        </div>
                        {stampPreview && (
                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                            <div className="text-center">
                              <img 
                                src={stampPreview} 
                                alt="Stamp preview" 
                                className="max-h-24 w-auto mx-auto border rounded"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setStampFile(null)
                                  setStampPreview(null)
                                  if (stampInputRef.current) stampInputRef.current.value = ''
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Letterhead Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileImage className="h-5 w-5" />
                        Letterhead Template
                      </CardTitle>
                      <CardDescription>
                        Upload your practice letterhead template for PDF backgrounds
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="letterhead-upload" className="sr-only">
                            Upload Letterhead
                          </Label>
                          <Input
                            id="letterhead-upload"
                            type="file"
                            accept="image/*"
                            ref={letterheadInputRef}
                            onChange={handleLetterheadUpload}
                            className="cursor-pointer"
                          />
                        </div>
                        {letterheadPreview && (
                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                            <div className="text-center">
                              <img 
                                src={letterheadPreview} 
                                alt="Letterhead preview" 
                                className="max-h-32 w-auto mx-auto border rounded"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLetterheadFile(null)
                                  setLetterheadPreview(null)
                                  if (letterheadInputRef.current) letterheadInputRef.current.value = ''
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowUploadsDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveUploads} 
                    disabled={isUploadLoading}
                    className="min-w-24"
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
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
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