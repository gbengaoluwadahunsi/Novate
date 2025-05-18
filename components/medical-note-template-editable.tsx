"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, FileCheck, Printer, Download, Check, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SignatureSpace from "./signature-space"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface PatientInfo {
  name: string
  age: number
  gender: string
  visitDate: string
}

interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  respiratoryRate: string
}

interface PhysicalExamination {
  vitals: VitalSigns
  throat: string
  [key: string]: any
}

interface MedicalNote {
  patientInfo: PatientInfo
  chiefComplaint: string
  historyOfPresentingIllness: string
  pastMedicalHistory: string
  systemReview: string
  physicalExamination: PhysicalExamination
  diagnosis: string
  managementPlan: string
  medicationCertificate: string
  doctorDetails?: {
    name: string
    signature: string
    timestamp: string
    registrationNumber?: string
  }
}

interface MedicalNoteTemplateProps {
  initialData: MedicalNote
  onSave: (data: MedicalNote) => void
}

export default function MedicalNoteTemplateEditable({ initialData, onSave }: MedicalNoteTemplateProps) {
  const [data, setData] = useState<MedicalNote>(initialData)
  const [editSection, setEditSection] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [isFinalized, setIsFinalized] = useState(false)
  const [doctorName, setDoctorName] = useState("")
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const { toast } = useToast()
  const [registrationNumber, setRegistrationNumber] = useState("RCMP-12345")

  const handleEdit = (section: string, sectionData: any) => {
    setEditSection(section)
    setEditData(sectionData)
  }

  const handleSaveEdit = () => {
    if (!editSection || !editData) return

    const newData = { ...data }

    if (editSection === "patientInfo") {
      newData.patientInfo = editData
    } else if (editSection === "physicalExamination") {
      newData.physicalExamination = editData
    } else {
      // @ts-ignore
      newData[editSection] = editData
    }

    setData(newData)
    setEditSection(null)
    setEditData(null)

    toast({
      title: "Section Updated",
      description: "The medical note has been updated successfully.",
    })
  }

  const handleCancelEdit = () => {
    setEditSection(null)
    setEditData(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      [field]: value,
    })
  }

  const handleVitalsChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      vitals: {
        ...editData.vitals,
        [field]: value,
      },
    })
  }

  const handleFinalize = () => {
    const timestamp = new Date().toLocaleString()

    const finalData = {
      ...data,
      doctorDetails: {
        name: doctorName,
        signature: doctorName,
        timestamp,
        registrationNumber,
      },
    }

    setData(finalData)
    setIsFinalized(true)
    setShowFinalizeDialog(false)
    onSave(finalData)

    toast({
      title: "Medical Note Finalized",
      description: "The medical note has been finalized and saved.",
    })
  }

  const handlePrint = () => {
    // Create a printable version of the medical note
    const printContent = document.createElement("div")
    printContent.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { font-size: 24px; margin-bottom: 10px; }
        h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        p { margin: 5px 0; }
        .header { text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-line { border-top: 1px dashed #999; width: 200px; text-align: center; padding-top: 5px; }
        .stamp-box { border: 2px solid #999; width: 200px; height: 100px; display: flex; align-items: center; justify-content: center; }
        @media print {
          body { margin: 0; padding: 20px; }
        }
      </style>
      <div class="header">
        <h1>Medical Consultation Note</h1>
        <p>Novate Medical Center</p>
      </div>
      <div class="section">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${data.patientInfo.name}</p>
        <p><strong>Age/Gender:</strong> ${data.patientInfo.age} / ${data.patientInfo.gender}</p>
        <p><strong>Visit Date:</strong> ${data.patientInfo.visitDate}</p>
      </div>
      <div class="section">
        <h2>Chief Complaint</h2>
        <p>${data.chiefComplaint || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>History of Presenting Illness</h2>
        <p>${data.historyOfPresentingIllness || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>Past Medical History</h2>
        <p>${data.pastMedicalHistory || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>System Review</h2>
        <p>${data.systemReview || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>Physical Examination</h2>
        <p><strong>Vital Signs:</strong> BP ${data.physicalExamination.vitals.bloodPressure}, HR ${data.physicalExamination.vitals.heartRate}, Temp ${data.physicalExamination.vitals.temperature}, RR ${data.physicalExamination.vitals.respiratoryRate}</p>
        <p><strong>Throat:</strong> ${data.physicalExamination.throat}</p>
      </div>
      <div class="section">
        <h2>Diagnosis</h2>
        <p>${data.diagnosis || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>Management Plan</h2>
        <p>${data.managementPlan || "None recorded"}</p>
      </div>
      <div class="section">
        <h2>Medical Certificate</h2>
        <p>${data.medicationCertificate || "None issued"}</p>
      </div>
      <div class="section">
        <h2>Doctor Information</h2>
        <p><strong>Name:</strong> ${data.doctorDetails?.name || "Dr. _______________"}</p>
        <p><strong>Registration No:</strong> ${data.doctorDetails?.registrationNumber || "_______________"}</p>
      </div>
      <div class="footer">
        <div class="signature-line">Doctor's Signature</div>
        <div class="stamp-box">Official Stamp</div>
      </div>
    `

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    printWindow?.document.write(printContent.innerHTML)
    printWindow?.document.close()
    printWindow?.focus()

    // Print after images and resources are loaded
    setTimeout(() => {
      printWindow?.print()
      printWindow?.close()
    }, 500)
  }

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(18)
      doc.text("Medical Consultation Note", 105, 15, { align: "center" })
      doc.setFontSize(12)
      doc.text("Novate Medical Center", 105, 22, { align: "center" })

      // Add patient information
      doc.setFontSize(14)
      doc.text("Patient Information", 14, 35)
      doc.setFontSize(10)
      doc.text(`Name: ${data.patientInfo.name}`, 14, 42)
      doc.text(`Age/Gender: ${data.patientInfo.age} / ${data.patientInfo.gender}`, 14, 48)
      doc.text(`Visit Date: ${data.patientInfo.visitDate}`, 14, 54)

      // Add chief complaint
      doc.setFontSize(14)
      doc.text("Chief Complaint", 14, 65)
      doc.setFontSize(10)
      doc.text(data.chiefComplaint || "None recorded", 14, 72)

      // Add history of presenting illness
      doc.setFontSize(14)
      doc.text("History of Presenting Illness", 14, 83)
      doc.setFontSize(10)

      // Handle long text with wrapping
      const splitHPI = doc.splitTextToSize(data.historyOfPresentingIllness || "None recorded", 180)
      doc.text(splitHPI, 14, 90)

      // Add past medical history
      let yPos = 90 + splitHPI.length * 6
      doc.setFontSize(14)
      doc.text("Past Medical History", 14, yPos)
      doc.setFontSize(10)

      const splitPMH = doc.splitTextToSize(data.pastMedicalHistory || "None recorded", 180)
      yPos += 7
      doc.text(splitPMH, 14, yPos)

      // Add system review
      yPos += splitPMH.length * 6
      doc.setFontSize(14)
      doc.text("System Review", 14, yPos)
      doc.setFontSize(10)

      const splitSR = doc.splitTextToSize(data.systemReview || "None recorded", 180)
      yPos += 7
      doc.text(splitSR, 14, yPos)

      // Add physical examination
      yPos += splitSR.length * 6
      doc.setFontSize(14)
      doc.text("Physical Examination", 14, yPos)
      doc.setFontSize(10)

      yPos += 7
      doc.text(
        `Vital Signs: BP ${data.physicalExamination.vitals.bloodPressure}, HR ${data.physicalExamination.vitals.heartRate}, `,
        14,
        yPos,
      )
      yPos += 6
      doc.text(
        `Temp ${data.physicalExamination.vitals.temperature}, RR ${data.physicalExamination.vitals.respiratoryRate}`,
        14,
        yPos,
      )
      yPos += 6
      doc.text(`Throat: ${data.physicalExamination.throat}`, 14, yPos)

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Add diagnosis
      yPos += 11
      doc.setFontSize(14)
      doc.text("Diagnosis", 14, yPos)
      doc.setFontSize(10)

      const splitDiag = doc.splitTextToSize(data.diagnosis || "None recorded", 180)
      yPos += 7
      doc.text(splitDiag, 14, yPos)

      // Add management plan
      yPos += splitDiag.length * 6
      doc.setFontSize(14)
      doc.text("Management Plan", 14, yPos)
      doc.setFontSize(10)

      const splitMP = doc.splitTextToSize(data.managementPlan || "None recorded", 180)
      yPos += 7
      doc.text(splitMP, 14, yPos)

      // Add medical certificate
      yPos += splitMP.length * 6
      doc.setFontSize(14)
      doc.text("Medical Certificate", 14, yPos)
      doc.setFontSize(10)

      const splitMC = doc.splitTextToSize(data.medicationCertificate || "None issued", 180)
      yPos += 7
      doc.text(splitMC, 14, yPos)

      // Check if we need a new page for doctor information
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      } else {
        yPos += splitMC.length * 6 + 10
      }

      // Add doctor information
      doc.setFontSize(14)
      doc.text("Doctor Information", 14, yPos)
      doc.setFontSize(10)

      yPos += 7
      const doctorName = data.doctorDetails?.name || "Dr. _______________"
      const regNumber = data.doctorDetails?.registrationNumber || "_______________"
      doc.text(`Name: ${doctorName}`, 14, yPos)
      yPos += 6
      doc.text(`Registration No: ${regNumber}`, 14, yPos)

      // Add signature and stamp placeholders
      yPos += 15

      // Signature line
      doc.line(14, yPos, 80, yPos)
      yPos += 5
      doc.text("Doctor's Signature", 35, yPos)

      // Stamp box
      doc.rect(120, yPos - 25, 70, 30)
      doc.text("Official Stamp", 145, yPos - 10)

      // Add timestamp at the bottom
      // const timestamp = new Date().toLocaleString()
      // doc.setFontSize(8)
      // doc.text(`Generated on: ${timestamp}`, 14, 280)

      // Save the PDF
      doc.save(
        `Medical_Note_${data.patientInfo.name.replace(/\s+/g, "_")}_${data.patientInfo.visitDate.replace(/\s+/g, "_")}.pdf`,
      )

      toast({
        title: "PDF Downloaded",
        description: "The medical note has been exported as PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadWord = () => {
    try {
      // Create HTML content for Word document
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Medical Note</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1 { font-size: 24px; margin-bottom: 10px; text-align: center; }
            h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            p { margin: 5px 0; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; }
            .signature-line { border-top: 1px dashed #999; width: 200px; text-align: center; padding-top: 5px; }
            .stamp-box { border: 2px solid #999; width: 200px; height: 100px; display: flex; align-items: center; justify-content: center; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Consultation Note</h1>
            <p>Novate Medical Center</p>
          </div>
          <div class="section">
            <h2>Patient Information</h2>
            <p><strong>Name:</strong> ${data.patientInfo.name}</p>
            <p><strong>Age/Gender:</strong> ${data.patientInfo.age} / ${data.patientInfo.gender}</p>
            <p><strong>Visit Date:</strong> ${data.patientInfo.visitDate}</p>
          </div>
          <div class="section">
            <h2>Chief Complaint</h2>
            <p>${data.chiefComplaint || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>History of Presenting Illness</h2>
            <p>${data.historyOfPresentingIllness || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>Past Medical History</h2>
            <p>${data.pastMedicalHistory || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>System Review</h2>
            <p>${data.systemReview || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>Physical Examination</h2>
            <p><strong>Vital Signs:</strong> BP ${data.physicalExamination.vitals.bloodPressure}, HR ${data.physicalExamination.vitals.heartRate}, Temp ${data.physicalExamination.vitals.temperature}, RR ${data.physicalExamination.vitals.respiratoryRate}</p>
            <p><strong>Throat:</strong> ${data.physicalExamination.throat}</p>
          </div>
          <div class="section">
            <h2>Diagnosis</h2>
            <p>${data.diagnosis || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>Management Plan</h2>
            <p>${data.managementPlan || "None recorded"}</p>
          </div>
          <div class="section">
            <h2>Medical Certificate</h2>
            <p>${data.medicationCertificate || "None issued"}</p>
          </div>
          <div class="section">
            <h2>Doctor Information</h2>
            <p><strong>Name:</strong> ${data.doctorDetails?.name || "Dr. _______________"}</p>
            <p><strong>Registration No:</strong> ${data.doctorDetails?.registrationNumber || "_______________"}</p>
          </div>
          <table style="width:100%; margin-top:30px;">
            <tr>
              <td style="width:50%;">
                <div style="border-top:1px dashed #999; width:80%; text-align:center; padding-top:5px;">
                  Doctor's Signature
                </div>
              </td>
              <td style="width:50%;">
                <div style="border:2px solid #999; width:80%; height:80px; text-align:center; padding-top:30px;">
                  Official Stamp
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `

      // Convert HTML to Blob
      const blob = new Blob([htmlContent], { type: "application/msword" })
      const url = URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement("a")
      link.href = url
      link.download = `Medical_Note_${data.patientInfo.name.replace(/\s+/g, "_")}_${data.patientInfo.visitDate.replace(/\s+/g, "_")}.doc`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Word Document Downloaded",
        description: "The medical note has been exported as Word document.",
      })
    } catch (error) {
      console.error("Error generating Word document:", error)
      toast({
        title: "Error",
        description: "Failed to generate Word document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderEditDialog = () => {
    if (!editSection || !editData) return null

    switch (editSection) {
      case "patientInfo":
        return (
          <Dialog open={!!editSection} onOpenChange={() => handleCancelEdit()}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Patient Information</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="age" className="text-right text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    value={editData.age}
                    onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="gender" className="text-right text-sm font-medium">
                    Gender
                  </label>
                  <Input
                    id="gender"
                    value={editData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="visitDate" className="text-right text-sm font-medium">
                    Visit Date
                  </label>
                  <Input
                    id="visitDate"
                    value={editData.visitDate}
                    onChange={(e) => handleInputChange("visitDate", e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )

      case "physicalExamination":
        return (
          <Dialog open={!!editSection} onOpenChange={() => handleCancelEdit()}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Physical Examination</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <h3 className="font-medium">Vital Signs</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="bp" className="text-right text-sm font-medium">
                    Blood Pressure
                  </label>
                  <Input
                    id="bp"
                    value={editData.vitals.bloodPressure}
                    onChange={(e) => handleVitalsChange("bloodPressure", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="hr" className="text-right text-sm font-medium">
                    Heart Rate
                  </label>
                  <Input
                    id="hr"
                    value={editData.vitals.heartRate}
                    onChange={(e) => handleVitalsChange("heartRate", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="temp" className="text-right text-sm font-medium">
                    Temperature
                  </label>
                  <Input
                    id="temp"
                    value={editData.vitals.temperature}
                    onChange={(e) => handleVitalsChange("temperature", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="rr" className="text-right text-sm font-medium">
                    Respiratory Rate
                  </label>
                  <Input
                    id="rr"
                    value={editData.vitals.respiratoryRate}
                    onChange={(e) => handleVitalsChange("respiratoryRate", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="throat" className="text-right text-sm font-medium">
                    Throat
                  </label>
                  <Textarea
                    id="throat"
                    value={editData.throat}
                    onChange={(e) => handleInputChange("throat", e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )

      default:
        return (
          <Dialog open={!!editSection} onOpenChange={() => handleCancelEdit()}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit {editSection?.split(/(?=[A-Z])/).join(" ")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea value={editData} onChange={(e) => setEditData(e.target.value)} className="min-h-[150px]" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
    }
  }

  const [showExportOptions, setShowExportOptions] = useState(false)

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-blue-500">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="flex justify-between items-center">
            <span>Medical Note</span>
            {!isFinalized && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinalizeDialog(true)}
                className="flex items-center gap-2"
              >
                <FileCheck size={16} /> Finalize Note
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <Tabs defaultValue="note" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="note">Medical Note</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-6 pt-4">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Patient Information */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Patient Information</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("patientInfo", data.patientInfo)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{data.patientInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age / Gender</p>
                      <p className="font-medium">
                        {data.patientInfo.age} / {data.patientInfo.gender}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Visit Date</p>
                      <p className="font-medium">{data.patientInfo.visitDate}</p>
                    </div>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Chief Complaint</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("chiefComplaint", data.chiefComplaint)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.chiefComplaint || (
                      <span className="text-muted-foreground italic">No information provided</span>
                    )}
                  </p>
                </div>

                {/* History of Presenting Illness */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">History of Presenting Illness</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("historyOfPresentingIllness", data.historyOfPresentingIllness)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.historyOfPresentingIllness || (
                      <span className="text-muted-foreground italic">No information provided</span>
                    )}
                  </p>
                </div>

                {/* Past Medical History */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Past Medical History</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("pastMedicalHistory", data.pastMedicalHistory)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.pastMedicalHistory || (
                      <span className="text-muted-foreground italic">No information provided</span>
                    )}
                  </p>
                </div>

                {/* System Review */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">System Review</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("systemReview", data.systemReview)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.systemReview || <span className="text-muted-foreground italic">No information provided</span>}
                  </p>
                </div>

                {/* Physical Examination */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Physical Examination</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("physicalExamination", data.physicalExamination)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Vital Signs</h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <p className="text-sm">BP: {data.physicalExamination.vitals.bloodPressure}</p>
                        <p className="text-sm">HR: {data.physicalExamination.vitals.heartRate}</p>
                        <p className="text-sm">Temp: {data.physicalExamination.vitals.temperature}</p>
                        <p className="text-sm">RR: {data.physicalExamination.vitals.respiratoryRate}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Throat</h4>
                      <p className="text-sm mt-1">{data.physicalExamination.throat}</p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Diagnosis</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("diagnosis", data.diagnosis)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.diagnosis || <span className="text-muted-foreground italic">No information provided</span>}
                  </p>
                </div>

                {/* Management Plan */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Management Plan</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("managementPlan", data.managementPlan)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.managementPlan || (
                      <span className="text-muted-foreground italic">No information provided</span>
                    )}
                  </p>
                </div>

                {/* Medical Certificate */}
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Medical Certificate</h3>
                    {!isFinalized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit("medicationCertificate", data.medicationCertificate)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  <p>
                    {data.medicationCertificate || (
                      <span className="text-muted-foreground italic">No information provided</span>
                    )}
                  </p>
                </div>

                {/* Doctor Details */}
                {data.doctorDetails && (
                  <div className="bg-muted/50 p-4 rounded-md">
                    <h3 className="font-bold text-lg mb-2">Doctor Details</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span> {data.doctorDetails.name}
                      </p>
                      <div className="mt-4">
                        <SignatureSpace
                          doctorName={data.doctorDetails.name}
                          registrationNumber={data.doctorDetails.registrationNumber || "RCMP-12345"}
                          clinic="Novate Medical Center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <div className="border rounded-md p-6 space-y-6 min-h-[600px]">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Medical Consultation Note</h2>
                  <p className="text-muted-foreground">Novate Medical Center</p>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="font-bold">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <p>
                        <span className="font-medium">Name:</span> {data.patientInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">Age/Gender:</span> {data.patientInfo.age} /{" "}
                        {data.patientInfo.gender}
                      </p>
                      <p>
                        <span className="font-medium">Visit Date:</span> {data.patientInfo.visitDate}
                      </p>
                    </div>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Chief Complaint</h3>
                    <p className="mt-1">{data.chiefComplaint || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">History of Presenting Illness</h3>
                    <p className="mt-1">{data.historyOfPresentingIllness || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Past Medical History</h3>
                    <p className="mt-1">{data.pastMedicalHistory || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">System Review</h3>
                    <p className="mt-1">{data.systemReview || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Physical Examination</h3>
                    <div className="mt-1 space-y-2">
                      <p>
                        <span className="font-medium">Vital Signs:</span> BP{" "}
                        {data.physicalExamination.vitals.bloodPressure}, HR {data.physicalExamination.vitals.heartRate},
                        Temp {data.physicalExamination.vitals.temperature}, RR{" "}
                        {data.physicalExamination.vitals.respiratoryRate}
                      </p>
                      <p>
                        <span className="font-medium">Throat:</span> {data.physicalExamination.throat}
                      </p>
                    </div>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Diagnosis</h3>
                    <p className="mt-1">{data.diagnosis || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Management Plan</h3>
                    <p className="mt-1">{data.managementPlan || "None recorded"}</p>
                  </div>

                  <div className="border-b pb-2">
                    <h3 className="font-bold">Medical Certificate</h3>
                    <p className="mt-1">{data.medicationCertificate || "None issued"}</p>
                  </div>

                  {/* Doctor Information, Signature and Stamp */}
                  <div className="mt-8 border-t pt-4">
                    <h3 className="font-bold">Doctor Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p>
                        <span className="font-medium">Name:</span> {data.doctorDetails?.name || "Dr. _______________"}
                      </p>
                      <p>
                        <span className="font-medium">Registration No:</span>{" "}
                        {data.doctorDetails?.registrationNumber || "_______________"}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <div className="border-t border-dashed border-gray-400 pt-2 w-1/3 text-center">
                        <p className="text-sm text-gray-500">Doctor's Signature</p>
                      </div>
                      <div className="border-2 border-gray-300 rounded-md p-4 w-1/3 h-24 flex items-center justify-center">
                        <p className="text-sm text-gray-500 text-center">Official Stamp</p>
                      </div>
                    </div>
                  </div>

                  {data.doctorDetails && (
                    <div className="mt-8 pt-4">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <SignatureSpace
                            doctorName={data.doctorDetails.name}
                            registrationNumber={data.doctorDetails.registrationNumber || "RCMP-12345"}
                            clinic="Novate Medical Center"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handlePrint}>
              <Printer size={16} /> Print
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <Download size={16} /> Export
              </Button>
              {showExportOptions && (
                <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleDownloadPDF()
                        setShowExportOptions(false)
                      }}
                    >
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        PDF
                      </div>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleDownloadWord()
                        setShowExportOptions(false)
                      }}
                    >
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2" />
                        Word
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isFinalized ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check size={16} />
              <span>Finalized</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowFinalizeDialog(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save size={16} /> Save
            </Button>
          )}
        </CardFooter>
      </Card>

      {renderEditDialog()}

      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Finalize Medical Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please enter your details to finalize this medical note. Once finalized, the note cannot be edited.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="doctorName" className="text-sm font-medium">
                  Doctor's Name
                </label>
                <Input
                  id="doctorName"
                  placeholder="Doctor's Name"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="regNumber" className="text-sm font-medium">
                  Registration Number
                </label>
                <Input
                  id="regNumber"
                  placeholder="Registration Number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFinalize}
              disabled={!doctorName.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Finalize Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
