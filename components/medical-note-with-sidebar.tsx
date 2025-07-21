"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector } from "@/store/hooks"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Edit, 
  Save, 
  Download,
  Share,
  History,
  Eye,
  Upload,
  X
} from "lucide-react"

interface MedicalNoteWithSidebarProps {
  note?: any
  onSave?: (note: any) => void
  onDownload?: () => void
  onShare?: () => void
  onViewHistory?: () => void
  onPreview?: () => void
}

export default function MedicalNoteWithSidebar({
  note,
  onSave,
  onDownload,
  onShare,
  onViewHistory,
  onPreview
}: MedicalNoteWithSidebarProps) {
  const { user } = useAppSelector((state) => state.auth)
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [signatureFile, setSignatureFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editedNote, setEditedNote] = useState({
    id: "",
    patientName: "",
    patientAge: 0,
    patientGender: "",
    visitDate: "",
    visitTime: "",
    chiefComplaint: "",
    historyOfPresentingIllness: "",
    pastMedicalHistory: "",
    systemReview: "",
    physicalExamination: {
      vitals: {
        bloodPressure: "--",
        heartRate: "--",
        temperature: "--",
        respiratoryRate: "--",
      },
      throat: "To be examined",
    },
    diagnosis: "",
    managementPlan: "",
    medicationCertificate: "",
    doctorName: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    version: 1
  })

  const defaultNote = {
    id: "note-001",
    patientName: "Ahmed bin Ali",
    patientAge: 28,
    patientGender: "Male",
    visitDate: "2024-01-15",
    visitTime: "14:30",
    chiefComplaint: "Sore throat for three days",
    historyOfPresentingIllness: "Patient reports worsening of sore throat over the past three days, associated with difficulty swallowing and mild fever. No cough or runny nose.",
    pastMedicalHistory: "No significant past medical history. No known drug allergies.",
    systemReview: "No other symptoms reported. No respiratory, cardiovascular, or gastrointestinal complaints.",
    physicalExamination: {
      vitals: {
        bloodPressure: "120/80 mmHg",
        heartRate: "78 bpm",
        temperature: "37.8°C",
        respiratoryRate: "16/min",
      },
      throat: "Erythematous pharynx with tonsillar enlargement. No exudates observed.",
    },
    diagnosis: "Acute pharyngitis, likely viral in origin",
    managementPlan: "Symptomatic treatment with paracetamol 1g QID PRN for fever and pain. Increase fluid intake. Salt water gargles. Return if symptoms worsen or persist beyond 5 days.",
    medicationCertificate: "2 days of medical leave provided",
    doctorName: "Dr. Sarah Johnson",
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    status: "completed",
    version: 1,
  }

  // Only use defaults for truly missing values, prioritize actual extracted content
  const currentNote = {
    // Use actual note data first, only fallback to defaults if completely missing
    id: note?.id || defaultNote.id,
    patientName: note?.patientName || defaultNote.patientName,
    patientAge: note?.patientAge || defaultNote.patientAge,
    patientGender: note?.patientGender || defaultNote.patientGender,
    visitDate: note?.visitDate || defaultNote.visitDate,
    visitTime: note?.visitTime || defaultNote.visitTime,
    
    // Medical content - prefer extracted content, only use defaults if empty/missing
    chiefComplaint: note?.chiefComplaint || "To be documented",
    historyOfPresentingIllness: note?.historyOfPresentingIllness || "To be documented", 
    pastMedicalHistory: note?.pastMedicalHistory || "To be documented",
    systemReview: note?.systemReview || "To be documented",
    
    // Physical examination - only use actual extracted data or empty placeholders
    physicalExamination: note?.physicalExamination ? (
      typeof note.physicalExamination === 'object' ? note.physicalExamination : {
        vitals: {
          bloodPressure: "--",
          heartRate: "--",
          temperature: "--", 
          respiratoryRate: "--",
        },
        throat: "To be examined",
      }
    ) : {
      vitals: {
        bloodPressure: "--",
        heartRate: "--", 
        temperature: "--",
        respiratoryRate: "--",
      },
      throat: "To be examined",
    },
    
    // Diagnosis and treatment - prefer extracted content
    diagnosis: note?.diagnosis || "To be determined",
    managementPlan: note?.managementPlan || "To be determined",
    medicationCertificate: note?.medicationCertificate || "To be completed if needed",
    
    // Metadata
    doctorName: note?.doctorName || defaultNote.doctorName,
    createdAt: note?.createdAt || defaultNote.createdAt,
    updatedAt: note?.updatedAt || defaultNote.updatedAt,
    status: note?.status || "draft",
    version: note?.version || 1,
  }

  // Use useEffect to set editedNote to avoid state update during render
  useEffect(() => {
    setEditedNote({
      ...currentNote,
      doctorName: currentNote.doctorName || user?.name || 
                 (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                 "Dr. [Name]",
      doctorRegistrationNo: currentNote.doctorRegistrationNo || user?.registrationNo || user?.registrationNumber || "MMC-[Registration]",
      doctorDepartment: currentNote.doctorDepartment || user?.department || user?.specialization || "General Medicine",
      dateOfIssue: currentNote.dateOfIssue || new Date().toISOString().split('T')[0],
      doctorSignature: currentNote.doctorSignature || null
    })
    
    // Set signature file state
    if (currentNote.doctorSignature) {
      setSignatureFile(currentNote.doctorSignature)
    }
  }, [note, user])

  const handleSave = () => {
    if (onSave) {
      onSave(editedNote)
    }
    setIsEditing(false)
  }

  // Safe accessors for nested properties
  const getVitalValue = (vitalType: string) => {
    return currentNote.physicalExamination?.vitals?.[vitalType] || "--"
  }

  const getPhysicalExamValue = (examType: string) => {
    return currentNote.physicalExamination?.[examType] || "Not examined"
  }

  // Handle input changes for editing
  const handleInputChange = (field: string, value: string) => {
    setEditedNote(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVitalChange = (vitalType: string, value: string) => {
    setEditedNote(prev => ({
      ...prev,
      physicalExamination: {
        ...prev.physicalExamination,
        vitals: {
          ...prev.physicalExamination?.vitals,
          [vitalType]: value
        }
      }
    }))
  }

  const handlePhysicalExamChange = (examType: string, value: string) => {
    setEditedNote(prev => ({
      ...prev,
      physicalExamination: {
        ...prev.physicalExamination,
        [examType]: value
      }
    }))
  }

  const handleSignatureUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (PNG, JPG, GIF, etc.)',
          variant: 'destructive'
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive'
        })
        return
      }

      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        setSignatureFile(base64String)
        handleInputChange('doctorSignature', base64String)
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
    handleInputChange('doctorSignature', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast({
      title: 'Signature Removed',
      description: 'Digital signature has been removed',
    })
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card { box-shadow: none !important; border: none !important; }
          .signature-space { 
            border: 1px solid #000 !important; 
            min-height: 80px !important;
          }
          .stamp-area {
            border: 2px solid #000 !important;
          }
          .signature-image {
            max-height: 80px !important;
            width: auto !important;
          }
        }
        .print-only { display: none; }
      `}</style>
      
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Medical Consultation Note</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentNote.patientName} - {currentNote.visitDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-right">
                    <p className="font-medium">Date: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="text-muted-foreground">Time: {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                  </div>
                  <Badge variant={currentNote.status === "completed" ? "default" : "secondary"} className="no-print">
                    {currentNote.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="no-print"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                  {isEditing && (
                    <Button size="sm" onClick={handleSave} className="no-print">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{currentNote.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{currentNote.visitDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{currentNote.visitTime}</span>
                </div>
              </div>

              {/* Medical Note Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Chief Complaint</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.chiefComplaint || ''}
                      onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter chief complaint..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.chiefComplaint}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">History of Presenting Illness</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.historyOfPresentingIllness || ''}
                      onChange={(e) => handleInputChange('historyOfPresentingIllness', e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Enter history of presenting illness..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.historyOfPresentingIllness}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Past Medical History</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.pastMedicalHistory || ''}
                      onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter past medical history..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.pastMedicalHistory}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">System Review</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.systemReview || ''}
                      onChange={(e) => handleInputChange('systemReview', e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter system review..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.systemReview}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Physical Examination</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Vitals</h4>
                      {isEditing ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">BP</label>
                            <Input
                              value={editedNote.physicalExamination?.vitals?.bloodPressure || ''}
                              onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                              placeholder="120/80 mmHg"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">HR</label>
                            <Input
                              value={editedNote.physicalExamination?.vitals?.heartRate || ''}
                              onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                              placeholder="78 bpm"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Temp</label>
                            <Input
                              value={editedNote.physicalExamination?.vitals?.temperature || ''}
                              onChange={(e) => handleVitalChange('temperature', e.target.value)}
                              placeholder="36.5°C"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">RR</label>
                            <Input
                              value={editedNote.physicalExamination?.vitals?.respiratoryRate || ''}
                              onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                              placeholder="16/min"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>BP: {getVitalValue('bloodPressure')}</div>
                          <div>HR: {getVitalValue('heartRate')}</div>
                          <div>Temp: {getVitalValue('temperature')}</div>
                          <div>RR: {getVitalValue('respiratoryRate')}</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Throat</h4>
                      {isEditing ? (
                        <Textarea
                          value={editedNote.physicalExamination?.throat || ''}
                          onChange={(e) => handlePhysicalExamChange('throat', e.target.value)}
                          className="min-h-[60px]"
                          placeholder="Enter throat examination findings..."
                        />
                      ) : (
                        <p className="text-gray-700">{getPhysicalExamValue('throat')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Diagnosis</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.diagnosis || ''}
                      onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter diagnosis..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.diagnosis}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Management Plan</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.managementPlan || ''}
                      onChange={(e) => handleInputChange('managementPlan', e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Enter management plan..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.managementPlan}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-2">Medication Certificate</h3>
                  {isEditing ? (
                    <Textarea
                      value={editedNote.medicationCertificate || ''}
                      onChange={(e) => handleInputChange('medicationCertificate', e.target.value)}
                      className="min-h-[60px]"
                      placeholder="Enter medication certificate details..."
                    />
                  ) : (
                    <p className="text-gray-700">{currentNote.medicationCertificate}</p>
                  )}
                </div>
              </div>

              {/* Doctor Information and Signature Section */}
              <Separator />
              
              <div className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Medical Professional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Doctor Details */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                      {isEditing ? (
                        <Input
                          value={editedNote.doctorName || user?.name || 
                                 (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                                 currentNote.doctorName || 
                                 "Dr. [Name]"}
                          onChange={(e) => handleInputChange('doctorName', e.target.value)}
                          className="mt-1"
                          placeholder="Enter doctor name"
                        />
                      ) : (
                        <p className="text-base font-medium">
                          {editedNote.doctorName || user?.name || 
                           (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                           currentNote.doctorName || 
                           "Dr. [Name]"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Medical Registration No.</label>
                      {isEditing ? (
                        <Input
                          value={editedNote.doctorRegistrationNo || user?.registrationNo || user?.registrationNumber || "MMC-[Registration]"}
                          onChange={(e) => handleInputChange('doctorRegistrationNo', e.target.value)}
                          className="mt-1"
                          placeholder="Enter registration number"
                        />
                      ) : (
                        <p className="text-base">
                          {editedNote.doctorRegistrationNo || user?.registrationNo || user?.registrationNumber || "MMC-[Registration]"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      {isEditing ? (
                        <Input
                          value={editedNote.doctorDepartment || user?.department || user?.specialization || "General Medicine"}
                          onChange={(e) => handleInputChange('doctorDepartment', e.target.value)}
                          className="mt-1"
                          placeholder="Enter department/specialization"
                        />
                      ) : (
                        <p className="text-base">
                          {editedNote.doctorDepartment || user?.department || user?.specialization || "General Medicine"}
                        </p>
                      )}
                    </div>
                  </div>
                  
                                    {/* Signature Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-600">Doctor's Signature</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px] flex flex-col items-center justify-center bg-gray-50 signature-space">
                      {signatureFile || editedNote.doctorSignature ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={signatureFile || editedNote.doctorSignature} 
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
                        onClick={() => window.print()}
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
                  <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Issue</label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editedNote.dateOfIssue || new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
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
                  
                                     <div className="text-right">
                     <div className="border-2 border-gray-300 rounded p-3 w-24 h-16 flex items-center justify-center bg-gray-50 stamp-area">
                       <span className="text-xs text-gray-500 text-center">Official<br/>Stamp</span>
                     </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l overflow-auto">
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-lg">Note Actions</h3>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onShare}>
              <Share className="h-4 w-4 mr-2" />
              Share Note
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onViewHistory}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Note Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="text-xs">
                  {currentNote.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(currentNote.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(currentNote.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Patient Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span>{currentNote.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span>{currentNote.patientAge} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span>{currentNote.patientGender}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
