"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Download, Edit3, Save, X, Settings, Upload, ArrowLeft, FileDown, Clock, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SectionVoiceInput from '@/components/voice/section-voice-input'
import { CleanMedicalNote } from './clean-medical-note-editor'
import SimpleMedicalDiagram from '@/components/medical-diagram/simple-medical-diagram'

import { useAppSelector } from '@/store/hooks'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DocumentStyleNoteViewerProps {
  note: CleanMedicalNote
  onSave: (updatedNote: CleanMedicalNote, changeDescription: string) => void
  onVersionHistory?: () => void
  onExportPDF?: (useLetterhead?: boolean, letterheadImage?: string, selectedICD11Codes?: any) => void
  versions?: Array<{
    version: number
    timestamp: string
    changes: string
    author: string
  }>
  isLoading?: boolean
  isTranscribing?: boolean // New prop to track transcription state
}

export default function DocumentStyleNoteViewer({
  note,
  onSave,
  onVersionHistory,
  onExportPDF,
  versions = [],
  isLoading = false,
  isTranscribing = false
}: DocumentStyleNoteViewerProps) {
  
  const { user } = useAppSelector((state) => state.auth)
  
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedNote, setEditedNote] = useState<CleanMedicalNote>(note)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    investigations: false,
    assessment: false,
    plan: false
  })
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [stampImage, setStampImage] = useState<string | null>(null)
  const [letterheadFile, setLetterheadFile] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'signature' | 'stamp' | 'letterhead' | null>(null)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isDocumentSigned, setIsDocumentSigned] = useState(false)
  const [signatureTimestamp, setSignatureTimestamp] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isEditingAllowed, setIsEditingAllowed] = useState(true)

  // Load signature, stamp, and letterhead from localStorage on component mount
  useEffect(() => {
    const savedSignature = localStorage.getItem('doctorSignature')
    const savedStamp = localStorage.getItem('doctorStamp')
    const savedLetterhead = localStorage.getItem('doctorLetterhead')
    
    if (savedSignature) {
      setSignatureImage(savedSignature)
    }
    if (savedStamp) {
      setStampImage(savedStamp)
    }
    if (savedLetterhead) {
      setLetterheadFile(savedLetterhead)
    }
  }, [])

  // Check editing time limit every minute
  useEffect(() => {
    if (!signatureTimestamp) return;

    const checkTimeLimit = () => {
      const now = new Date();
      const timeDiff = now.getTime() - signatureTimestamp.getTime();
      const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
      const remainingTime = sixHoursInMs - timeDiff;

      if (remainingTime <= 0) {
        setIsEditingAllowed(false);
        setTimeRemaining("Editing period expired");
      } else {
        setIsEditingAllowed(true);
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        setTimeRemaining(`${hours}h ${minutes}m remaining`);

        // Show warning when 1 hour or less remaining
        if (remainingTime <= oneHourInMs && remainingTime > (oneHourInMs - 60000)) {
          toast.error("⚠️ Editing Time Warning: Less than 1 hour remaining to edit this medical note. After that, any additions must be made as an addendum.");
        }
      }
    };

    checkTimeLimit();
    const interval = setInterval(checkTimeLimit, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [signatureTimestamp]);

  // Update edited note when original note changes
  React.useEffect(() => {
    setEditedNote(note)
  }, [note])

  // Helper function to update a field in the edited note
  const updateField = (field: string, value: string) => {
    // Debug logging for gender field updates
    if (field === 'patientGender') {
      console.log("Updating patient gender from", editedNote.patientGender, "to", value)
    }
    
    setEditedNote(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Helper function to update nested fields
  const updateNestedField = (parentField: string, field: string, value: string) => {
    setEditedNote(prev => {
      const currentValue = (prev as any)[parentField] || {}
      return {
        ...prev,
        [parentField]: {
          ...currentValue,
          [field]: value
        }
      }
    })
  }

  // Save the edited note
  const handleSave = () => {
    if (!isEditingAllowed) {
      toast.error("Editing period has expired. Any additions must be made as an addendum.")
      return
    }

    onSave(editedNote, "Manual edit with voice input")
    setIsEditMode(false)
    toast.success("Medical note updated successfully!")
  }

  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    setEditedNote(note) // Revert changes
    setIsEditMode(false)
    toast.info("Edit cancelled. Changes reverted.")
  }

  // Listen for parent page events (Export PDF and Edit)
  React.useEffect(() => {
    const handleExportEvent = (event: CustomEvent) => {
      handleExportPDF()
    }

    const handleEditEvent = () => {
      if (isEditingAllowed) {
        setIsEditMode(!isEditMode)
      }
    }

    window.addEventListener('exportPDF', handleExportEvent as EventListener)
    window.addEventListener('toggleEdit', handleEditEvent)

    return () => {
      window.removeEventListener('exportPDF', handleExportEvent as EventListener)
      window.removeEventListener('toggleEdit', handleEditEvent)
    }
  }, [isEditingAllowed, isEditMode])

  // Helper function to toggle section expansion
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  // Helper function to format field values
  const formatFieldValue = (value: string | number | boolean | undefined | null) => {
    if (value === null || value === undefined || value === '') {
      return 'Not recorded'
    }
    if (typeof value === 'string' && (value === 'N/A' || value === 'n/a' || value === 'N/a')) {
      return 'Not recorded'
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  // Helper function to format multiple social history fields
  const formatSocialHistory = (smoking: any, alcohol: any, drugs: any) => {
    const fields = []
    
    if (smoking && smoking !== 'N/A' && smoking !== 'n/a' && smoking !== '' && smoking !== null && smoking !== undefined) {
      fields.push(`Smoking: ${smoking}`)
    }
    
    if (alcohol && alcohol !== 'N/A' && alcohol !== 'n/a' && alcohol !== '' && alcohol !== null && alcohol !== undefined) {
      fields.push(`Alcohol: ${alcohol}`)
    }
    
    if (drugs && drugs !== 'N/A' && drugs !== 'n/a' && drugs !== '' && drugs !== null && drugs !== undefined) {
      fields.push(`Recreational drugs: ${drugs}`)
    }
    
    if (fields.length === 0) {
      return 'Not recorded'
    }
    
    return fields.join('. ')
  }

  // 🌡️ Temperature conversion utility
  const convertTemperatureToCelsius = (tempValue: string | number | undefined | null): string => {
    if (!tempValue || tempValue === 'Not recorded' || tempValue === 'N/A') {
      return 'Not recorded';
    }

    // Clean the temperature string and extract numeric value
    const tempStr = String(tempValue).toLowerCase();
    const cleanTemp = tempStr.replace(/[^\d.-]/g, '');
    const numericTemp = parseFloat(cleanTemp);

    if (isNaN(numericTemp)) {
      return String(tempValue); // Return original if can't parse
    }

    // Check if it's likely Fahrenheit (> 50 suggests Fahrenheit)
    if (numericTemp > 50) {
      // Convert Fahrenheit to Celsius: (F - 32) × 5/9
      const celsius = ((numericTemp - 32) * 5) / 9;
      return `${celsius.toFixed(1)}°C`;
    }

    // If it's already in reasonable Celsius range (30-45), keep as is
    if (numericTemp >= 30 && numericTemp <= 45) {
      return `${numericTemp.toFixed(1)}°C`;
    }

    // For very low values (like normal body temp), assume Celsius
    if (numericTemp >= 20 && numericTemp < 30) {
      return `${numericTemp.toFixed(1)}°C`;
    }

    // For other cases, assume it needs °C unit added
    return `${numericTemp.toFixed(1)}°C`;
  }



  // Helper function to determine patient gender for medical diagram
  const determinePatientGender = (gender: string | undefined): 'male' | 'female' => {
    if (!gender) return 'male'
    return gender.toLowerCase().includes('female') ? 'female' : 'male'
  }

  // Helper function to get current user's name
  const getCurrentUserName = () => {
    if (user?.name) {
      return user.name
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    return 'Dr. John Doe'
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'stamp' | 'letterhead') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type based on upload type
    if (type === 'letterhead') {
      // Letterhead accepts PDF and Word documents
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PDF or Word document')
        return
      }
      
      // Validate file size (max 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
    } else {
      // Signature and stamp accept images only
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

      // Validate file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
      }
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      
      if (type === 'signature') {
        setSignatureImage(result)
        localStorage.setItem('doctorSignature', result)
        toast.success('E-Signature uploaded successfully')
      } else if (type === 'stamp') {
        setStampImage(result)
        localStorage.setItem('doctorStamp', result)
        toast.success('Medical stamp uploaded successfully')
      } else if (type === 'letterhead') {
        // For letterhead, store as base64 data URL
        setLetterheadFile(result)
        localStorage.setItem('doctorLetterhead', result)
        toast.success(`Letterhead template uploaded successfully (${file.name})`)
      }
      
      setShowUploadModal(false)
      setUploadType(null)
    }
    reader.readAsDataURL(file)
  }

  // Handle upload button click
  const handleUploadClick = () => {
    setUploadType(null) // Will show the type selection modal first
    setShowUploadModal(true)
  }

  const handleSignatureClick = () => {
    if (!isEditingAllowed) {
      toast.error("Editing Not Allowed: The 6-hour editing period has expired. Any additions must be made as an addendum, not part of the main note.");
      return;
    }
    setShowSignatureDialog(true);
  };

  const handleSignatureSaved = (signature: string) => {
    const now = new Date();
    setSignatureData(signature);
    setIsDocumentSigned(true);
    setSignatureTimestamp(now);
    
    toast.success("Document Signed Successfully - ⚠️ IMPORTANT: You have 6 hours from now to make any edits to this medical note. After 6 hours, any additions must be made as an addendum and not part of the main note.");
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Generating PDF... Please wait while we create your medical consultation note PDF.");

      // Get the medical document content element (excludes navigation/UI elements)
      const noteContent = document.querySelector('.medical-document-content') as HTMLElement;
      if (!noteContent) {
        throw new Error('Medical document content not found');
      }

      // Create canvas from the content
      const canvas = await html2canvas(noteContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: noteContent.scrollWidth,
        height: noteContent.scrollHeight,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `Medical_Consultation_Note_${note.patientName || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success(`PDF Generated Successfully: Medical consultation note has been downloaded as ${fileName}`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("PDF Generation Failed: There was an error generating the PDF. Please try again.");
    }
  };

  const renderICD11Codes = () => {
    // Display ICD-11 codes from backend
    if ((note as any).icd11CodesText) {
      return <div>{(note as any).icd11CodesText}</div>;
    }

    // Handle structured form { primary: [{ code, title, definition? }], ... }
    if (note.icd11Codes && note.icd11Codes.primary && note.icd11Codes.primary.length > 0) {
      return (
        <div className="space-y-2">
          {note.icd11Codes.primary.map((item, index) => (
            <div key={index}>
              <span className="font-medium">{item.code}</span>
              {item.title ? <span> - {item.title}</span> : null}
              {item.definition ? (
                <div className="text-xs text-gray-600 mt-1">{item.definition}</div>
              ) : null}
            </div>
          ))}
        </div>
      );
    }

    // Handle raw backend shape: icd11Codes: string[] + optional icd11Titles: string[] + icd11SourceSentence
    const rawCodes = (note as any).icd11Codes;
    if (Array.isArray(rawCodes) && rawCodes.length > 0) {
      const titles: string[] = (note as any).icd11Titles || [];
      const sourceSentence: string | null = (note as any).icd11SourceSentence || null;
      return (
        <div className="space-y-2">
          {rawCodes.map((code: string, idx: number) => (
            <div key={idx}>
              <span className="font-medium">{code}</span>
              {titles[idx] ? <span> - {titles[idx]}</span> : null}
            </div>
          ))}
          {sourceSentence ? (
            <div className="text-xs text-gray-600 mt-2">{sourceSentence}</div>
          ) : null}
        </div>
      );
    }

    return <div>No ICD-11 codes specified</div>;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Time Remaining Indicator - Only show if document is signed */}
      {isDocumentSigned && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className={`p-3 rounded-lg border ${
            isEditingAllowed 
              ? timeRemaining.includes('0h') && !timeRemaining.includes('Editing period expired')
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {isEditingAllowed ? (
                <>
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Editing Time Remaining: {timeRemaining}
                  </span>
                  {timeRemaining.includes('0h') && !timeRemaining.includes('Editing period expired') && (
                    <span className="text-yellow-700 ml-2">⚠️ Less than 1 hour left!</span>
                  )}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">
                    {timeRemaining} - Any additions must be made as an addendum
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medical Document Content - PDF Export Target */}
      <div className="medical-document-content">
        {/* Document Header Bar */}
        <div className="text-white p-4" style={{ backgroundColor: '#1E90FF' }}>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Medical Consultation Note</h1>
            <div className="text-right">
              <p className="text-sm">Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Edit Mode Active</span>
                <span className="text-sm text-blue-700">Use voice input buttons (🎤) to dictate changes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Document Content */}
        <div className="p-6 space-y-6">
        
        {/* Doctor Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>DOCTOR INFORMATION</h2>
            
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editable Doctor Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Name:</label>
                    <SectionVoiceInput
                      sectionName="Doctor Name"
                      sectionField="doctorName"
                      currentValue={editedNote.doctorName || ''}
                      onUpdate={(value) => updateField('doctorName', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.doctorName || ''}
                    onChange={(e) => updateField('doctorName', e.target.value)}
                    placeholder="Enter doctor name"
                    className="text-sm"
                  />
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="text-sm font-medium">Role:</label>
                  <p className="text-sm mt-2">DOCTOR</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {note.doctorName ? (note.doctorName.startsWith('Dr. ') ? note.doctorName : `Dr. ${note.doctorName}`) : `Dr. ${getCurrentUserName()}`}</div>
                <div><strong>Role:</strong> DOCTOR</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>PATIENT INFORMATION</h2>
            
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editable Patient Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Name:</label>
                    <SectionVoiceInput
                      sectionName="Patient Name"
                      sectionField="patientName"
                      currentValue={editedNote.patientName || ''}
                      onUpdate={(value) => updateField('patientName', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.patientName || ''}
                    onChange={(e) => updateField('patientName', e.target.value)}
                    placeholder="Enter patient name"
                    className="text-sm"
                  />
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="text-sm font-medium">Role:</label>
                  <p className="text-sm mt-2">PATIENT</p>
                </div>

                {/* Editable Patient Age */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Age:</label>
                    <SectionVoiceInput
                      sectionName="Patient Age"
                      sectionField="patientAge"
                      currentValue={editedNote.patientAge || ''}
                      onUpdate={(value) => updateField('patientAge', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.patientAge || ''}
                    onChange={(e) => updateField('patientAge', e.target.value)}
                    placeholder="Enter patient age"
                    className="text-sm"
                  />
                </div>

                {/* Editable Patient Gender */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender:</label>
                  <Select
                    value={editedNote.patientGender || ''}
                    onValueChange={(value) => updateField('patientGender', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {formatFieldValue(note.patientName)}</div>
                <div><strong>Role:</strong> PATIENT</div>
                <div><strong>Age:</strong> {formatFieldValue(note.patientAge)}</div>
                <div><strong>Gender:</strong> {formatFieldValue(note.patientGender)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>VITAL SIGNS</h2>

            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editable Temperature */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Temperature:</label>
                    <SectionVoiceInput
                      sectionName="Temperature"
                      sectionField="temperature"
                      currentValue={(editedNote as any).temperature || ''}
                      onUpdate={(value) => updateField('temperature', value)}
                    />
                  </div>
                  <Input
                    value={(editedNote as any).temperature || ''}
                    onChange={(e) => updateField('temperature', e.target.value)}
                    placeholder="Enter temperature (e.g., 36.5°C)"
                    className="text-sm"
                  />
                </div>

                {/* Editable Blood Pressure */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Blood Pressure:</label>
                    <SectionVoiceInput
                      sectionName="Blood Pressure"
                      sectionField="bloodPressure"
                      currentValue={(editedNote as any).bloodPressure || ''}
                      onUpdate={(value) => updateField('bloodPressure', value)}
                    />
                  </div>
                  <Input
                    value={(editedNote as any).bloodPressure || ''}
                    onChange={(e) => updateField('bloodPressure', e.target.value)}
                    placeholder="Enter blood pressure (e.g., 120/80 mmHg)"
                    className="text-sm"
                  />
                </div>

                {/* Editable Pulse Rate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Pulse Rate:</label>
                    <SectionVoiceInput
                      sectionName="Pulse Rate"
                      sectionField="pulseRate"
                      currentValue={(editedNote as any).pulseRate || ''}
                      onUpdate={(value) => updateField('pulseRate', value)}
                    />
                  </div>
                  <Input
                    value={(editedNote as any).pulseRate || ''}
                    onChange={(e) => updateField('pulseRate', e.target.value)}
                    placeholder="Enter pulse rate (e.g., 72 bpm)"
                    className="text-sm"
                  />
                </div>

                {/* Editable Respiratory Rate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Respiratory Rate:</label>
                    <SectionVoiceInput
                      sectionName="Respiratory Rate"
                      sectionField="respiratoryRate"
                      currentValue={(editedNote as any).respiratoryRate || ''}
                      onUpdate={(value) => updateField('respiratoryRate', value)}
                    />
                  </div>
                  <Input
                    value={(editedNote as any).respiratoryRate || ''}
                    onChange={(e) => updateField('respiratoryRate', e.target.value)}
                    placeholder="Enter respiratory rate (e.g., 16/min)"
                    className="text-sm"
                  />
                </div>

                {/* Editable Glucose Levels */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Glucose Levels:</label>
                    <SectionVoiceInput
                      sectionName="Glucose Levels"
                      sectionField="glucose"
                      currentValue={(editedNote as any).glucose || ''}
                      onUpdate={(value) => updateField('glucose', value)}
                    />
                  </div>
                  <Input
                    value={(editedNote as any).glucose || ''}
                    onChange={(e) => updateField('glucose', e.target.value)}
                    placeholder="Enter glucose levels (e.g., 95 mg/dL)"
                    className="text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Temperature:</strong> <span className="text-red-600">{convertTemperatureToCelsius((note as any).vitalSigns?.temperature || (note as any).temperature || 'Not recorded')}</span></div>
                <div><strong>Blood Pressure:</strong> {formatFieldValue((note as any).vitalSigns?.bloodPressure || (note as any).bloodPressure || 'Not recorded')}</div>
                <div><strong>Pulse Rate:</strong> <span className="text-red-600">{formatFieldValue((note as any).vitalSigns?.pulseRate || (note as any).pulseRate || 'Not recorded')}</span></div>
                <div><strong>Respiratory Rate:</strong> {formatFieldValue((note as any).vitalSigns?.respiratoryRate || (note as any).respiratoryRate || 'Not recorded')}</div>
                <div><strong>Glucose Levels:</strong> {formatFieldValue((note as any).vitalSigns?.glucoseLevels || (note as any).glucose || 'Not recorded')}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chief Complaint */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>CHIEF COMPLAINT</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="Chief Complaint"
                  sectionField="chiefComplaint"
                  currentValue={editedNote.chiefComplaint || ''}
                  onUpdate={(value) => updateField('chiefComplaint', value)}
                />
              )}
            </div>
            
            {isEditMode ? (
              <Textarea
                value={editedNote.chiefComplaint || ''}
                onChange={(e) => updateField('chiefComplaint', e.target.value)}
                placeholder="Describe the main reason for the patient's visit..."
                className="text-sm min-h-[80px]"
                rows={3}
              />
            ) : (
              <p className="text-sm">{formatFieldValue(note.chiefComplaint)}</p>
            )}
          </CardContent>
        </Card>

        {/* History of Present Illness */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>HISTORY OF PRESENT ILLNESS</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="History of Present Illness"
                  sectionField="historyOfPresentingIllness"
                  currentValue={editedNote.historyOfPresentingIllness || ''}
                  onUpdate={(value) => updateField('historyOfPresentingIllness', value)}
                />
              )}
            </div>
            
            {isEditMode ? (
              <Textarea
                value={editedNote.historyOfPresentingIllness || ''}
                onChange={(e) => updateField('historyOfPresentingIllness', e.target.value)}
                placeholder="Describe the history of the presenting illness in detail..."
                className="text-sm min-h-[120px]"
                rows={5}
              />
            ) : (
              <p className="text-sm leading-relaxed">{formatFieldValue(note.historyOfPresentingIllness)}</p>
            )}
          </CardContent>
        </Card>

        {/* Past Medical/Surgical History */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>PAST MEDICAL/SURGICAL HISTORY</h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                {/* Editable Medical Conditions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Medical Conditions:</label>
                    <SectionVoiceInput
                      sectionName="Medical Conditions"
                      sectionField="medicalConditions"
                      currentValue={editedNote.medicalConditions || ''}
                      onUpdate={(value) => updateField('medicalConditions', value)}
                    />
                  </div>
                  <Textarea
                    value={editedNote.medicalConditions || ''}
                    onChange={(e) => updateField('medicalConditions', e.target.value)}
                    placeholder="List past medical conditions, chronic diseases, etc..."
                    className="text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>

                {/* Editable Surgery */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Surgery:</label>
                    <SectionVoiceInput
                      sectionName="Surgery History"
                      sectionField="surgeries"
                      currentValue={editedNote.surgeries || ''}
                      onUpdate={(value) => updateField('surgeries', value)}
                    />
                  </div>
                  <Textarea
                    value={editedNote.surgeries || ''}
                    onChange={(e) => updateField('surgeries', e.target.value)}
                    placeholder="List past surgeries, procedures, dates if known..."
                    className="text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><strong>Medical Conditions:</strong> {formatFieldValue(note.medicalConditions)}</div>
                <div><strong>Surgery:</strong> {formatFieldValue(note.surgeries)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drug History and Allergies */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>DRUG HISTORY AND ALLERGIES</h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                {/* Editable Medications */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Current Medications:</label>
                    <SectionVoiceInput
                      sectionName="Current Medications"
                      sectionField="medications"
                      currentValue={editedNote.medications || ''}
                      onUpdate={(value) => updateField('medications', value)}
                    />
                  </div>
                  <Textarea
                    value={editedNote.medications || ''}
                    onChange={(e) => updateField('medications', e.target.value)}
                    placeholder="List current medications, dosages, frequency..."
                    className="text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>

                {/* Editable Allergies */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Allergies:</label>
                    <SectionVoiceInput
                      sectionName="Allergies"
                      sectionField="allergies"
                      currentValue={editedNote.allergies || ''}
                      onUpdate={(value) => updateField('allergies', value)}
                    />
                  </div>
                  <Textarea
                    value={editedNote.allergies || ''}
                    onChange={(e) => updateField('allergies', e.target.value)}
                    placeholder="List known allergies, drug reactions, food allergies..."
                    className="text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><strong>Current Medications:</strong> {formatFieldValue(note.medications)}</div>
                <div><strong>Allergies:</strong> {formatFieldValue(note.allergies)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family History */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>FAMILY HISTORY</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="Family History"
                  sectionField="familyHistory"
                  currentValue={editedNote.familyHistory || ''}
                  onUpdate={(value) => updateField('familyHistory', value)}
                />
              )}
            </div>
            
            {isEditMode ? (
              <Textarea
                value={editedNote.familyHistory || ''}
                onChange={(e) => updateField('familyHistory', e.target.value)}
                placeholder="Describe family medical history, genetic conditions, family diseases..."
                className="text-sm min-h-[80px]"
                rows={3}
              />
            ) : (
              <p className="text-sm">{formatFieldValue(note.familyHistory)}</p>
            )}
          </CardContent>
        </Card>

        {/* Social History */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>SOCIAL HISTORY</h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                {/* Editable Smoking */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Smoking:</label>
                    <SectionVoiceInput
                      sectionName="Smoking History"
                      sectionField="smoking"
                      currentValue={editedNote.smoking || ''}
                      onUpdate={(value) => updateField('smoking', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.smoking || ''}
                    onChange={(e) => updateField('smoking', e.target.value)}
                    placeholder="e.g., Non-smoker, 10 cigarettes/day, ex-smoker..."
                    className="text-sm"
                  />
                </div>

                {/* Editable Alcohol */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Alcohol:</label>
                    <SectionVoiceInput
                      sectionName="Alcohol History"
                      sectionField="alcohol"
                      currentValue={editedNote.alcohol || ''}
                      onUpdate={(value) => updateField('alcohol', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.alcohol || ''}
                    onChange={(e) => updateField('alcohol', e.target.value)}
                    placeholder="e.g., Social drinker, 2 units/week, non-drinker..."
                    className="text-sm"
                  />
                </div>

                {/* Editable Recreational Drugs */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-medium">Recreational Drugs:</label>
                    <SectionVoiceInput
                      sectionName="Recreational Drug History"
                      sectionField="recreationalDrugs"
                      currentValue={editedNote.recreationalDrugs || ''}
                      onUpdate={(value) => updateField('recreationalDrugs', value)}
                    />
                  </div>
                  <Input
                    value={editedNote.recreationalDrugs || ''}
                    onChange={(e) => updateField('recreationalDrugs', e.target.value)}
                    placeholder="e.g., None, occasionally, specify substances..."
                    className="text-sm"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm">{formatSocialHistory(note.smoking, note.alcohol, note.recreationalDrugs)}</p>
            )}
          </CardContent>
        </Card>

        {/* Review of Systems */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>REVIEW OF SYSTEMS</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="Review of Systems"
                  sectionField="systemsReview"
                  currentValue={editedNote.systemsReview || ''}
                  onUpdate={(value) => updateField('systemsReview', value)}
                />
              )}
            </div>
            
            {isEditMode ? (
              <Textarea
                value={editedNote.systemsReview || ''}
                onChange={(e) => updateField('systemsReview', e.target.value)}
                placeholder="Systematic review of body systems, symptoms, concerns..."
                className="text-sm min-h-[120px]"
                rows={5}
              />
            ) : (
              <p className="text-sm">{formatFieldValue(note.systemsReview)}</p>
            )}
          </CardContent>
        </Card>

        {/* Physical Examination */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>PHYSICAL EXAMINATION</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="Physical Examination"
                  sectionField="physicalExamination"
                  currentValue={editedNote.physicalExamination || ''}
                  onUpdate={(value) => updateField('physicalExamination', value)}
                />
              )}
            </div>
              
            {/* Physical Examination Text */}
            <div className="mb-6">
              {isEditMode ? (
                <Textarea
                  value={editedNote.physicalExamination || ''}
                  onChange={(e) => updateField('physicalExamination', e.target.value)}
                  placeholder="Describe the physical examination findings..."
                  className="text-sm min-h-[120px]"
                  rows={5}
                />
              ) : (
                <p className="text-sm mb-4">
                  {note.physicalExamination || 'No physical examination was performed during this consultation.'}
                </p>
              )}
            </div>
                
            {/* Physical Examination Visualization - Only show if there's examination data */}
            {note.physicalExamination && 
             note.physicalExamination.trim() !== '' && 
             note.physicalExamination !== 'No physical examination was performed during this consultation.' &&
             note.physicalExamination !== 'N/A' &&
             note.physicalExamination !== 'n/a' &&
             note.physicalExamination !== 'Not recorded' && (
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-4">Physical Examination Visualization</h3>
                
                {/* Simple Medical Body Diagram */}
                <SimpleMedicalDiagram
                  patientGender={determinePatientGender(editedNote.patientGender)}
                  medicalNoteText={editedNote.physicalExamination || ''}
                />
                </div>
            )}
          </CardContent>
        </Card>

        {/* Investigations - Collapsible */}
        <Card className="mb-6">
          <Collapsible open={expandedSections.investigations} onOpenChange={(open) => toggleSection('investigations')}>
            <CollapsibleTrigger asChild>
              <CardContent className="p-6 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>INVESTIGATIONS</h2>
                    {isEditMode && (
                      <SectionVoiceInput
                        sectionName="Investigations"
                        sectionField="investigations"
                        currentValue={editedNote.investigations || ''}
                        onUpdate={(value) => updateField('investigations', value)}
                      />
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.investigations ? 'transform rotate-180' : ''}`} style={{ color: '#1E90FF' }} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                {isEditMode ? (
                  <Textarea
                    value={editedNote.investigations || ''}
                    onChange={(e) => updateField('investigations', e.target.value)}
                    placeholder="List investigations, lab results, imaging studies, test results..."
                    className="text-sm min-h-[120px]"
                    rows={5}
                  />
                ) : (
                  <p className="text-sm">{formatFieldValue(note.investigations)}</p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Impression and Diagnosis - Collapsible */}
        <Card className="mb-6">
          <Collapsible open={expandedSections.assessment} onOpenChange={(open) => toggleSection('assessment')}>
            <CollapsibleTrigger asChild>
              <CardContent className="p-6 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>IMPRESSION AND DIAGNOSIS</h2>
                    {isEditMode && (
                      <SectionVoiceInput
                        sectionName="Assessment and Diagnosis"
                        sectionField="assessment"
                        currentValue={editedNote.assessment || ''}
                        onUpdate={(value) => updateField('assessment', value)}
                      />
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.assessment ? 'transform rotate-180' : ''}`} style={{ color: '#1E90FF' }} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                {isEditMode ? (
                  <Textarea
                    value={editedNote.assessment || ''}
                    onChange={(e) => updateField('assessment', e.target.value)}
                    placeholder="Provide clinical impression, diagnosis, differential diagnoses..."
                    className="text-sm min-h-[120px]"
                    rows={5}
                  />
                ) : (
                  <p className="text-sm">{formatFieldValue(note.assessment)}</p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Plan - Collapsible */}
        <Card className="mb-6">
          <Collapsible open={expandedSections.plan} onOpenChange={(open) => toggleSection('plan')}>
            <CollapsibleTrigger asChild>
              <CardContent className="p-6 cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>PLAN</h2>
                    {isEditMode && (
                      <SectionVoiceInput
                        sectionName="Treatment Plan"
                        sectionField="plan"
                        currentValue={editedNote.plan || ''}
                        onUpdate={(value) => updateField('plan', value)}
                      />
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.plan ? 'transform rotate-180' : ''}`} style={{ color: '#1E90FF' }} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                {isEditMode ? (
                  <Textarea
                    value={editedNote.plan || ''}
                    onChange={(e) => updateField('plan', e.target.value)}
                    placeholder="Describe treatment plan, follow-up instructions, medications, recommendations..."
                    className="text-sm min-h-[120px]"
                    rows={5}
                  />
                ) : (
                  <p className="text-sm">{formatFieldValue(note.plan)}</p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* ICD-11 Codes */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>ICD-11 Codes</h2>
              {isEditMode && (
                <SectionVoiceInput
                  sectionName="ICD-11 Codes"
                  sectionField="icd11Codes"
                  currentValue={(editedNote as any).icd11CodesText || ''}
                  onUpdate={(value) => updateField('icd11CodesText', value)}
                />
              )}
            </div>
            
            {isEditMode ? (
              <Textarea
                value={(editedNote as any).icd11CodesText || ''}
                onChange={(e) => updateField('icd11CodesText', e.target.value)}
                placeholder="Enter ICD-11 codes (e.g., 1D4Z - Arthropod-borne viral fever, unspecified)"
                className="text-sm min-h-[80px]"
                rows={3}
              />
            ) : (
              <div className="text-sm">
                {renderICD11Codes()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Information & Authorization */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1E90FF' }}>Doctor Information & Authorization</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Editable Doctor Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Doctor:</label>
                      <SectionVoiceInput
                        sectionName="Doctor Name"
                        sectionField="doctorName"
                        currentValue={editedNote.doctorName || ''}
                        onUpdate={(value) => updateField('doctorName', value)}
                      />
                    </div>
                    <Input
                      value={editedNote.doctorName || ''}
                      onChange={(e) => updateField('doctorName', e.target.value)}
                      placeholder="Enter doctor name"
                      className="text-sm"
                    />
                  </div>

                  {/* Editable Registration Number */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Registration No:</label>
                      <SectionVoiceInput
                        sectionName="Registration Number"
                        sectionField="doctorRegistrationNo"
                        currentValue={editedNote.doctorRegistrationNo || ''}
                        onUpdate={(value) => updateField('doctorRegistrationNo', value)}
                      />
                    </div>
                    <Input
                      value={editedNote.doctorRegistrationNo || ''}
                      onChange={(e) => updateField('doctorRegistrationNo', e.target.value)}
                      placeholder="Enter registration number"
                      className="text-sm"
                    />
                  </div>

                  {/* Editable Date/Time */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">Generated on:</label>
                      <SectionVoiceInput
                        sectionName="Date and Time"
                        sectionField="dateTime"
                        currentValue={editedNote.dateTime || ''}
                        onUpdate={(value) => updateField('dateTime', value)}
                      />
                    </div>
                    <Input
                      value={editedNote.dateTime || ''}
                      onChange={(e) => updateField('dateTime', e.target.value)}
                      placeholder="Enter date and time"
                      className="text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div><strong>Doctor:</strong> {note.doctorName ? `Dr. ${note.doctorName}` : `Dr. ${getCurrentUserName()}`}</div>
                  <div><strong>Registration No:</strong> {note.doctorRegistrationNo || user?.registrationNo || '[Registration Number]'}</div>
                  <div><strong>Generated on:</strong> {note.dateTime || new Date().toISOString()}</div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Signature:</label>
                  <div 
                    className="border-2 border-gray-300 rounded-lg h-24 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={handleSignatureClick}
                  >
                    {signatureImage || signatureData ? (
                      <img 
                        src={signatureImage || signatureData || ''} 
                        alt="Doctor Signature" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-sm">Click to sign</div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Official Stamp:</label>
                  <div className="border-2 border-gray-300 rounded-lg h-24 flex items-center justify-center bg-gray-50">
                    {stampImage ? (
                      <img 
                        src={stampImage || ''} 
                        alt="Official Stamp" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="text-sm">Official stamp area</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && !uploadType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Choose Upload Type</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                What would you like to upload?
              </p>
              
              <button
                onClick={() => setUploadType('signature')}
                className="w-full h-20 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  ✍️
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">E-Signature</div>
                  <div className="text-sm text-gray-600 line-clamp-2">Upload your digital signature (PNG, JPG)</div>
                </div>
              </button>
              
              <button
                onClick={() => setUploadType('stamp')}
                className="w-full h-20 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  🏥
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Medical Stamp</div>
                  <div className="text-sm text-gray-600 line-clamp-2">Upload your official medical stamp (PNG, JPG)</div>
                </div>
              </button>
              
              <button
                onClick={() => setUploadType('letterhead')}
                className="w-full h-20 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  📄
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Letterhead Template</div>
                  <div className="text-sm text-gray-600 line-clamp-2">Upload your letterhead template (PDF, DOC, DOCX)</div>
                </div>
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUploadModal && uploadType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Upload {uploadType === 'signature' ? 'E-Signature' : 
                       uploadType === 'stamp' ? 'Medical Stamp' : 
                       'Letterhead Template'}
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadType(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {uploadType === 'letterhead' 
                  ? 'Please select a PDF or Word document for your letterhead template. Maximum file size: 10MB'
                  : `Please select an image file for your ${uploadType}. Maximum file size: 5MB`
                }
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept={uploadType === 'letterhead' ? '.pdf,.doc,.docx' : 'image/*'}
                  onChange={(e) => handleFileUpload(e, uploadType!)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploadType === 'letterhead' 
                      ? 'Click to select PDF/Word file or drag and drop'
                      : 'Click to select image or drag and drop'
                    }
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadType(null)}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadType(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Dialog */}
      {showSignatureDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Digital Signature</h3>
              <button
                onClick={() => setShowSignatureDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please provide your digital signature to authorize this medical note.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        const result = e.target?.result as string
                        handleSignatureSaved(result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload signature image
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSignatureDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}