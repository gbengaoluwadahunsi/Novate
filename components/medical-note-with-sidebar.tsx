"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Eye
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
  const [isEditing, setIsEditing] = useState(false)
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
    setEditedNote(currentNote)
  }, [note])

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Medical Note</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentNote.patientName} - {currentNote.visitDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={currentNote.status === "completed" ? "default" : "secondary"}>
                    {currentNote.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                  {isEditing && (
                    <Button size="sm" onClick={handleSave}>
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

              {/* Footer */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>{currentNote.doctorName}</div>
                  <div>{new Date(currentNote.createdAt).toLocaleDateString()}</div>
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
  )
}
