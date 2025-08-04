"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Stethoscope, 
  User, 
  ClipboardList, 
  Download,
  Save,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ComprehensiveExaminationForm from "./examination/comprehensive-examination-form"
import { ExaminationTemplate, createEmptyExaminationTemplate } from "@/types/examination"

interface MedicalNoteWithComprehensiveExam {
  id?: string
  patientName: string
  patientAge: number | string
  patientGender: string
  visitDate: string
  visitTime: string
  chiefComplaint: string
  historyOfPresentingIllness: string
  pastMedicalHistory: string
  systemReview: string
  comprehensiveExamination?: ExaminationTemplate
  diagnosis: string
  managementPlan: string
  medicationCertificate: string
  letterhead?: string
  doctorName?: string
  doctorRegistrationNo?: string
  doctorDepartment?: string
  dateOfIssue?: string
  createdAt?: string
  updatedAt?: string
}

interface MedicalNoteWithComprehensiveExamProps {
  initialNote?: MedicalNoteWithComprehensiveExam
  onSave: (note: MedicalNoteWithComprehensiveExam) => void
  onDownload?: (note: MedicalNoteWithComprehensiveExam) => void
  onPreview?: (note: MedicalNoteWithComprehensiveExam) => void
}

export default function MedicalNoteWithComprehensiveExam({
  initialNote,
  onSave,
  onDownload,
  onPreview
}: MedicalNoteWithComprehensiveExamProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  
  const [noteData, setNoteData] = useState<MedicalNoteWithComprehensiveExam>(
    initialNote || {
      patientName: "",
      patientAge: 0,
      patientGender: "",
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toTimeString().slice(0, 5),
      chiefComplaint: "",
      historyOfPresentingIllness: "",
      pastMedicalHistory: "",
      systemReview: "",
      comprehensiveExamination: createEmptyExaminationTemplate(),
      diagnosis: "",
      managementPlan: "",
      medicationCertificate: "",
      doctorName: "",
      doctorRegistrationNo: "",
      doctorDepartment: "",
      dateOfIssue: new Date().toISOString().split('T')[0]
    }
  )

  const updateBasicField = (field: keyof MedicalNoteWithComprehensiveExam, value: any) => {
    setNoteData(prev => ({ ...prev, [field]: value }))
  }

  const handleExaminationSave = (examination: ExaminationTemplate) => {
    setNoteData(prev => ({ ...prev, comprehensiveExamination: examination }))
    toast({
      title: "Examination Updated",
      description: "Comprehensive examination data has been saved successfully."
    })
  }

  const handleSaveNote = () => {
    const updatedNote = {
      ...noteData,
      updatedAt: new Date().toISOString()
    }
    onSave(updatedNote)
    toast({
      title: "Medical Note Saved",
      description: "The medical note with comprehensive examination has been saved."
    })
  }

  const handleDownloadPDF = () => {
    if (onDownload) {
      onDownload(noteData)
    }
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(noteData)
    }
  }

  // Check completion status
  const getCompletionStatus = () => {
    const basicFields = [
      noteData.patientName,
      noteData.chiefComplaint,
      noteData.diagnosis
    ].filter(field => field && field.toString().trim()).length

    const hasExamination = noteData.comprehensiveExamination && 
      noteData.comprehensiveExamination.VitalSigns &&
      Object.values(noteData.comprehensiveExamination.VitalSigns).some(v => 
        typeof v === 'string' ? v.trim() : (v && typeof v === 'object' && v !== null && Object.values(v).some(val => typeof val === 'string' && val.trim()))
      )

    const totalSections = 3 + (hasExamination ? 1 : 0)
    const completedSections = basicFields + (hasExamination ? 1 : 0)
    
    return {
      percentage: Math.round((completedSections / totalSections) * 100),
      status: completedSections === totalSections ? 'complete' : 
               completedSections > 0 ? 'in-progress' : 'draft'
    }
  }

  const completion = getCompletionStatus()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Medical Consultation Note</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {noteData.patientName || "New Patient"} - {noteData.visitDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={completion.status === 'complete' ? 'default' : 'secondary'}>
                {completion.percentage}% Complete
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleSaveNote}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Basic Information
              </TabsTrigger>
              <TabsTrigger value="examination" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Physical Examination
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Assessment & Plan
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        value={noteData.patientName}
                        onChange={(e) => updateBasicField('patientName', e.target.value)}
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientAge">Age</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        value={noteData.patientAge}
                        onChange={(e) => updateBasicField('patientAge', parseInt(e.target.value) || 0)}
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="patientGender">Gender</Label>
                      <Input
                        id="patientGender"
                        value={noteData.patientGender}
                        onChange={(e) => updateBasicField('patientGender', e.target.value)}
                        placeholder="Gender"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visitDate">Visit Date</Label>
                      <Input
                        id="visitDate"
                        type="date"
                        value={noteData.visitDate}
                        onChange={(e) => updateBasicField('visitDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="visitTime">Visit Time</Label>
                      <Input
                        id="visitTime"
                        type="time"
                        value={noteData.visitTime}
                        onChange={(e) => updateBasicField('visitTime', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clinical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Textarea
                      id="chiefComplaint"
                      value={noteData.chiefComplaint}
                      onChange={(e) => updateBasicField('chiefComplaint', e.target.value)}
                      placeholder="Patient's main concern or reason for visit"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="historyOfPresentingIllness">History of Presenting Illness</Label>
                    <Textarea
                      id="historyOfPresentingIllness"
                      value={noteData.historyOfPresentingIllness}
                      onChange={(e) => updateBasicField('historyOfPresentingIllness', e.target.value)}
                      placeholder="Detailed history of the current illness"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
                    <Textarea
                      id="pastMedicalHistory"
                      value={noteData.pastMedicalHistory}
                      onChange={(e) => updateBasicField('pastMedicalHistory', e.target.value)}
                      placeholder="Previous medical conditions, surgeries, medications"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="systemReview">System Review</Label>
                    <Textarea
                      id="systemReview"
                      value={noteData.systemReview}
                      onChange={(e) => updateBasicField('systemReview', e.target.value)}
                      placeholder="Review of systems"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Physical Examination Tab */}
            <TabsContent value="examination">
              <ComprehensiveExaminationForm
                initialData={noteData.comprehensiveExamination}
                onSave={handleExaminationSave}
                patientInfo={{
                  name: noteData.patientName,
                  age: noteData.patientAge.toString(),
                  sex: noteData.patientGender,
                  id: noteData.id || "New Patient"
                }}
              />
            </TabsContent>

            {/* Assessment & Plan Tab */}
            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clinical Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      value={noteData.diagnosis}
                      onChange={(e) => updateBasicField('diagnosis', e.target.value)}
                      placeholder="Primary and secondary diagnoses"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="managementPlan">Management Plan</Label>
                    <Textarea
                      id="managementPlan"
                      value={noteData.managementPlan}
                      onChange={(e) => updateBasicField('managementPlan', e.target.value)}
                      placeholder="Treatment plan, medications, follow-up instructions"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="medicationCertificate">Medical Certificate</Label>
                    <Textarea
                      id="medicationCertificate"
                      value={noteData.medicationCertificate}
                      onChange={(e) => updateBasicField('medicationCertificate', e.target.value)}
                      placeholder="Medical certificate or sick leave details"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doctor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorName">Doctor Name</Label>
                      <Input
                        id="doctorName"
                        value={noteData.doctorName || ""}
                        onChange={(e) => updateBasicField('doctorName', e.target.value)}
                        placeholder="Dr. [Name]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="doctorRegistrationNo">Registration Number</Label>
                      <Input
                        id="doctorRegistrationNo"
                        value={noteData.doctorRegistrationNo || ""}
                        onChange={(e) => updateBasicField('doctorRegistrationNo', e.target.value)}
                        placeholder="Registration number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorDepartment">Department/Specialization</Label>
                      <Input
                        id="doctorDepartment"
                        value={noteData.doctorDepartment || ""}
                        onChange={(e) => updateBasicField('doctorDepartment', e.target.value)}
                        placeholder="General Medicine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfIssue">Date of Issue</Label>
                      <Input
                        id="dateOfIssue"
                        type="date"
                        value={noteData.dateOfIssue || ""}
                        onChange={(e) => updateBasicField('dateOfIssue', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 