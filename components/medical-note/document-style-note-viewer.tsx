"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Edit3, 
  Save, 
  X, 
  Mic, 
  MicOff, 
  Download, 
  FileText, 
  Clock, 
  User,
  MessageSquare,
  Volume2,
  Activity,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react'
import { CleanMedicalNote } from './clean-medical-note-editor'
import SimpleMedicalDiagram from '@/components/medical-diagram/simple-medical-diagram'
import { useAppSelector } from '@/store/hooks'

import { toast } from 'sonner'

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
}

export default function DocumentStyleNoteViewer({
  note,
  onSave,
  onVersionHistory,
  onExportPDF,
  versions = [],
  isLoading = false
}: DocumentStyleNoteViewerProps) {
  
  // Get current user from Redux store
  const { user } = useAppSelector((state) => state.auth)
  
  // Inline editing states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedNote, setEditedNote] = useState<CleanMedicalNote>(note)
  const [editingSection, setEditingSection] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  
  // State for managing collapsible sections (only the ones shown in the image)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    investigations: false,
    assessment: false,
    plan: false
  })

  // State for signature and stamp uploads
  const [signatureImage, setSignatureImage] = useState<string>('')
  const [stampImage, setStampImage] = useState<string>('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const signatureFileRef = useRef<HTMLInputElement>(null)
  const stampFileRef = useRef<HTMLInputElement>(null)

  // State for letterhead functionality
  const [letterheadImage, setLetterheadImage] = useState<string>('')
  const [showLetterheadModal, setShowLetterheadModal] = useState(false)
  const [useLetterhead, setUseLetterhead] = useState(false)
  const letterheadFileRef = useRef<HTMLInputElement>(null)

  // State for automatic ICD-11 generation
  const [isGeneratingICD11, setIsGeneratingICD11] = useState(false)
  const [generatedICD11Codes, setGeneratedICD11Codes] = useState<any>(null)
  const [selectedICD11Codes, setSelectedICD11Codes] = useState<{
    primary: string[]
    secondary: string[]
    suggestions: string[]
  }>({
    primary: [],
    secondary: [],
    suggestions: []
  })



  // Update edited note when original note changes
  useEffect(() => {
    setEditedNote(note)
  }, [note])

  // Auto-generate ICD-11 codes when note loads and has no existing codes
  useEffect(() => {
    const shouldGenerateCodes = note && 
      (!note.icd11Codes || 
       !note.icd11Codes.primary || 
       note.icd11Codes.primary.length === 0) &&
      (note.chiefComplaint || note.assessment || note.physicalExamination)

    if (shouldGenerateCodes && !isGeneratingICD11 && !generatedICD11Codes) {
      generateICD11Codes()
    }
  }, [note, isGeneratingICD11, generatedICD11Codes])

  // Function to automatically generate ICD-11 codes
  const generateICD11Codes = async () => {
    if (!note) return

    const hasMedicalContent = note.chiefComplaint || note.assessment || note.physicalExamination
    if (!hasMedicalContent) return

    setIsGeneratingICD11(true)

    try {
      const response = await fetch('/api/simple-icd11', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosis: note.assessment || '',
          symptoms: note.chiefComplaint || '',
          chiefComplaint: note.chiefComplaint || '',
          assessment: note.assessment || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.codes) {
          setGeneratedICD11Codes(data.codes)
          // Reset selected codes when new codes are generated
          setSelectedICD11Codes({
            primary: [],
            secondary: [],
            suggestions: []
          })
          toast.success('ICD-11 codes generated automatically using AI')
        }
      }
    } catch (error) {
      // Error generating ICD-11 codes
      toast.error('Failed to generate ICD-11 codes')
    } finally {
      setIsGeneratingICD11(false)
    }
  }

  // Function to handle ICD-11 code selection
  const handleICD11CodeSelection = (codeId: string, category: 'primary' | 'secondary' | 'suggestions', isSelected: boolean) => {
    setSelectedICD11Codes(prev => ({
      ...prev,
      [category]: isSelected 
        ? [...prev[category], codeId]
        : prev[category].filter(id => id !== codeId)
    }))
  }

  // Function to get selected codes for display
  const getSelectedCodesForDisplay = () => {
    if (!generatedICD11Codes) return null

    const selectedCodes = {
      primary: generatedICD11Codes.primary?.filter((code: any, index: number) => 
        selectedICD11Codes.primary.includes(`primary-${index}`)
      ) || [],
      secondary: generatedICD11Codes.secondary?.filter((code: any, index: number) => 
        selectedICD11Codes.secondary.includes(`secondary-${index}`)
      ) || [],
      suggestions: generatedICD11Codes.suggestions?.filter((code: any, index: number) => 
        selectedICD11Codes.suggestions.includes(`suggestions-${index}`)
      ) || []
    }

    return selectedCodes
  }

  // Note prop updated

  // EditedNote state updated

  // Helper function to update a field in the edited note
  const updateField = (field: keyof CleanMedicalNote, value: string) => {
    setEditedNote(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Load signature, stamp, and letterhead from local storage on component mount
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
      setLetterheadImage(savedLetterhead)
    }
  }, [])

  // Handle signature upload
  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSignatureImage(result)
        localStorage.setItem('doctorSignature', result)
        toast.success('Signature uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle stamp upload
  const handleStampUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setStampImage(result)
        localStorage.setItem('doctorStamp', result)
        toast.success('Stamp uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove signature
  const removeSignature = () => {
    setSignatureImage('')
    localStorage.removeItem('doctorSignature')
    toast.success('Signature removed')
  }

  // Remove stamp
  const removeStamp = () => {
    setStampImage('')
    localStorage.removeItem('doctorStamp')
    toast.success('Stamp removed')
  }

  // Handle letterhead upload
  const handleLetterheadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      // Accept PDF and Word documents
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf')
      const isWord = fileType === 'application/msword' || 
                    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    fileName.endsWith('.doc') || fileName.endsWith('.docx')
      
      if (!isPDF && !isWord) {
        toast.error('Please upload a PDF or Word document (.pdf, .doc, .docx)')
        return
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLetterheadImage(result)
        localStorage.setItem('doctorLetterhead', result)
        localStorage.setItem('doctorLetterheadType', fileType)
        localStorage.setItem('doctorLetterheadName', fileName)
        toast.success(`Letterhead uploaded successfully (${fileName})`)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove letterhead
  const removeLetterhead = () => {
    setLetterheadImage('')
    localStorage.removeItem('doctorLetterhead')
    toast.success('Letterhead removed')
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
    return 'Dr. [Name]'
  }

  // Handle PDF export with letterhead option
  const handleExportPDF = () => {
    if (letterheadImage) {
      setShowLetterheadModal(true)
    } else {
      // No letterhead available, use current implementation
              onExportPDF?.(false, undefined, getSelectedCodesForDisplay())
    }
  }



  // Simple Web Speech API voice-to-text
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)

  const startVoiceInput = (fieldName: string) => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition
    setEditingSection(fieldName)
    setIsRecording(true)

    recognition.onstart = () => {
      toast.success(`🎤 Listening for ${fieldName}...`)
    }

    recognition.onresult = (event: any) => {
      const rawTranscript = event.results[0][0].transcript.trim()
      
      // Remove trailing punctuation (periods, commas, etc.) for cleaner field values
      const transcript = rawTranscript.replace(/[.,!?;:]$/g, '').trim()
      
      // Directly replace the field content with transcribed text
              updateField(fieldName as keyof CleanMedicalNote, transcript)
      toast.success(`✅ ${fieldName} updated: "${transcript}"`)
    }

    recognition.onerror = (event: any) => {
              // Speech recognition error
      let errorMessage = 'Voice recognition failed'
      
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try again.'
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Please check your connection.'
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions.'
      }
      
      toast.error(errorMessage)
    }

    recognition.onend = () => {
      setIsRecording(false)
      setEditingSection('')
    }

    recognition.start()
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
    setEditingSection('')
  }



  // Editable field component for inline editing
  const EditableField = ({ 
    fieldName, 
    value, 
    label, 
    isTextarea = false,
    placeholder = ""
  }: {
    fieldName: keyof CleanMedicalNote
    value: string
    label: string
    isTextarea?: boolean
    placeholder?: string
  }) => {
    if (!isEditMode) {
      return <div className="text-sm"><strong>{label}:</strong> {formatFieldValue(value)}</div>
    }

    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-semibold text-blue-900">{label}</Label>}
        <div className="flex gap-2">
          {isTextarea ? (
            <Textarea
              value={editedNote[fieldName] as string || ''}
              onChange={(e) => updateField(fieldName, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="flex-1"
            />
          ) : (
            <Input
              value={editedNote[fieldName] as string || ''}
              onChange={(e) => updateField(fieldName, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
          )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isRecording && editingSection === fieldName ? stopVoiceInput() : startVoiceInput(fieldName)}
                      disabled={isProcessing}
                      className={`transition-all duration-200 ${
                        isRecording && editingSection === fieldName 
                          ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
                          : "bg-sky-500 text-white border-sky-500 hover:bg-sky-600 hover:border-sky-600"
                      }`}
                      title={isRecording && editingSection === fieldName ? "Stop recording" : "Start voice input"}
                    >
            {isProcessing && editingSection === fieldName ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isRecording && editingSection === fieldName ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Helper function to toggle section expansion
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  // Helper function to check if physical examination data exists
  const hasPhysicalExaminationFindings = (note: CleanMedicalNote) => {
    // Only check physical examination data, not chief complaint
    const examinationText = note.physicalExamination || ''
    const trimmedText = examinationText.trim()
    
    // Check for meaningful data (not empty, not generic placeholders)
    const hasData = !!(trimmedText && 
                      trimmedText !== 'Not recorded' &&
                      trimmedText !== 'N/A' &&
                      trimmedText !== 'n/a' &&
                      trimmedText !== 'N/a' &&
                      trimmedText !== 'Physical examination performed as clinically indicated' &&
                      trimmedText !== 'No examination conducted' &&
                      trimmedText !== 'Examination findings will appear here when documented' &&
                      !trimmedText.toLowerCase().includes('no examination') &&
                      !trimmedText.toLowerCase().includes('clinically indicated'))
    
    // Physical Examination Check
    
    return hasData
  }

  // Helper function to determine patient gender for medical diagram
  const determinePatientGender = (gender: string | undefined): 'male' | 'female' => {
    if (!gender) return 'male'
    return gender.toLowerCase().includes('female') ? 'female' : 'male'
  }



  // Enhanced field value formatting function
  const formatFieldValue = (value: string | number | boolean | undefined | null | { [key: string]: string }) => {
    // Handle null or undefined
    if (value === null || value === undefined) {
      return 'Not recorded'
    }
    
    // Handle empty string
    if (value === '') {
      return 'Not recorded'
    }
    
    // Handle "N/A" values and convert to "Not recorded"
    if (typeof value === 'string' && (value === 'N/A' || value === 'n/a' || value === 'N/a')) {
      return 'Not recorded'
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    // Handle numbers
    if (typeof value === 'number') {
      return value.toString()
    }
    
    // Handle objects (like vital signs or examination findings)
    if (typeof value === 'object' && value !== null) {
      // Check if it's an object with key-value pairs
      if (Object.keys(value).length === 0) {
        return 'Not recorded'
      }
      
      // Format object as key-value pairs
      const formattedEntries = Object.entries(value)
        .filter(([_, val]) => val && val !== '' && val !== 'N/A' && val !== 'n/a' && val !== 'N/a')
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ')
      
      return formattedEntries || 'Not recorded'
    }
    
    // For other types, convert to string and clean any }} characters
    const stringValue = String(value)
    // Remove any }} characters that might be causing display issues
    const cleanedValue = stringValue.replace(/\}\}/g, '')
    return cleanedValue || 'Not recorded'
  }

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg">
      {/* Document Header */}
      <div className="border-b bg-gray-50 px-4 sm:px-6 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
            {versions.length > 0 && (
              <Button variant="outline" size="sm" onClick={onVersionHistory} className="w-full sm:w-auto">
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Version History ({versions.length})</span>
                <span className="sm:hidden">History ({versions.length})</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            {!isEditMode ? (
              <Button 
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                size="sm"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false)
                    setEditedNote(note) // Reset changes
                    setEditingSection('')
                  }}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                        try {
                          // Saving changes
                          await onSave(editedNote, "Manual editing changes")
                          toast.success("✅ Changes saved successfully!")
                          setIsEditMode(false)
                          setEditingSection('')
                        } catch (error) {
                          // Save error
                          toast.error("❌ Failed to save changes")
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      size="sm"
                      disabled={isLoading}
                    >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Signature Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Signature
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signatureFileRef.current?.click()}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Signature
                  </Button>
                  {signatureImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeSignature}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={signatureFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                {signatureImage && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <img src={signatureImage} alt="Signature" className="max-h-16 mx-auto" />
                  </div>
                )}
              </div>

              {/* Stamp Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Stamp
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stampFileRef.current?.click()}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Stamp
                  </Button>
                  {stampImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeStamp}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={stampFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleStampUpload}
                  className="hidden"
                />
                {stampImage && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <img src={stampImage} alt="Stamp" className="max-h-16 mx-auto" />
                  </div>
                )}
              </div>

              {/* Letterhead Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letterhead
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => letterheadFileRef.current?.click()}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Letterhead
                  </Button>
                  {letterheadImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLetterhead}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={letterheadFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleLetterheadUpload}
                  className="hidden"
                />
                {letterheadImage && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {localStorage.getItem('doctorLetterheadName') || 'Letterhead Document'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {localStorage.getItem('doctorLetterheadType')?.includes('pdf') ? 'PDF Document' : 'Word Document'}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowUploadModal(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Letterhead Choice Modal */}
      {showLetterheadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Export PDF with Letterhead</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLetterheadModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You have a letterhead uploaded. Would you like to use it for this PDF export?
              </p>
              
              {/* Letterhead Preview */}
              <div className="p-3 border rounded bg-gray-50">
                <p className="text-sm font-medium mb-2">Letterhead Preview:</p>
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {localStorage.getItem('doctorLetterheadName') || 'Letterhead Document'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {localStorage.getItem('doctorLetterheadType')?.includes('pdf') ? 'PDF Document' : 'Word Document'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Use Letterhead button clicked
                    setUseLetterhead(true)
                    setShowLetterheadModal(false)
                    // Call PDF export with letterhead
                            // Calling onExportPDF with letterhead
        onExportPDF?.(true, letterheadImage, getSelectedCodesForDisplay())
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Use Letterhead
                </Button>
                <Button
                  onClick={() => {
                    // No Letterhead button clicked
                    setUseLetterhead(false)
                    setShowLetterheadModal(false)
                    // Call PDF export without letterhead
                            // Calling onExportPDF without letterhead
        onExportPDF?.(false, undefined, getSelectedCodesForDisplay())
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  No Letterhead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Content - Medical Note */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 bg-white" style={{ fontFamily: 'Georgia, serif' }}>

        {/* Header Bar */}
        <div className="bg-blue-900 text-white p-4 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <div className="flex justify-end items-start">
            <div className="text-right">
              <h2 className="text-base font-bold">Medical Consultation Note</h2>
              <p className="text-sm opacity-90 mt-1">
                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Patient Information</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  fieldName="patientName"
                  value={note.patientName || ''}
                  label="Name"
                  placeholder="Patient full name..."
                />
                <EditableField
                  fieldName="patientAge"
                  value={note.patientAge || ''}
                  label="Age"
                  placeholder="Patient age..."
                />
                <EditableField
                  fieldName="patientGender"
                  value={note.patientGender || ''}
                  label="Gender"
                  placeholder="Male/Female/Other..."
                />

              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                <div><strong>Name:</strong> {formatFieldValue(note.patientName)}</div>
                <div><strong>Age:</strong> {formatFieldValue(note.patientAge)}</div>
                <div><strong>Gender:</strong> {formatFieldValue(note.patientGender)}</div>

              </div>
            )}
          </div>
        </section>

        {/* Vital Signs */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Vital Signs</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <EditableField
                  fieldName="temperature"
                  value={note.temperature || ''}
                  label="Temperature"
                  placeholder="e.g., 98.6°F"
                />
                <EditableField
                  fieldName="pulseRate"
                  value={note.pulseRate || ''}
                  label="Pulse Rate"
                  placeholder="e.g., 88 bpm"
                />
                <EditableField
                  fieldName="respiratoryRate"
                  value={note.respiratoryRate || ''}
                  label="Respiratory Rate"
                  placeholder="e.g., 18/min"
                />
                <EditableField
                  fieldName="bloodPressure"
                  value={note.bloodPressure || ''}
                  label="Blood Pressure"
                  placeholder="e.g., 145/90 mmHg"
                />
                <EditableField
                  fieldName="glucose"
                  value={note.glucose || ''}
                  label="Glucose Level"
                  placeholder="e.g., 5.5 mmol/L"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                <div><strong>Temperature:</strong> {formatFieldValue(note.temperature)}</div>
                <div><strong>Pulse Rate:</strong> {formatFieldValue(note.pulseRate)}</div>
                <div><strong>Respiratory Rate:</strong> {formatFieldValue(note.respiratoryRate)}</div>
                <div><strong>Blood Pressure:</strong> {formatFieldValue(note.bloodPressure)}</div>
                <div><strong>Glucose:</strong> {formatFieldValue(note.glucose)}</div>
              </div>
            )}
          </div>
        </section>

        {/* Chief Complaint */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Chief Complaint</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
              <EditableField
                fieldName="chiefComplaint"
                value={note.chiefComplaint || ''}
                label=""
                isTextarea={true}
                placeholder="Enter the patient's chief complaint..."
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.chiefComplaint)}</p>
            )}
          </div>
        </section>

        {/* History of Present Illness */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">History of Present Illness</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
              <EditableField
                fieldName="historyOfPresentingIllness"
                value={note.historyOfPresentingIllness || ''}
                label=""
                isTextarea={true}
                placeholder="Enter the history of present illness..."
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.historyOfPresentingIllness)}</p>
            )}
          </div>
        </section>

        {/* Past Medical History */}
        {(note.medicalConditions || note.surgeries || note.hospitalizations || isEditMode) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Past Medical History</h2>
            {isEditMode ? (
              <div className="space-y-4">
                <EditableField
                  fieldName="medicalConditions"
                  value={note.medicalConditions || ''}
                  label="Medical Conditions"
                  isTextarea={true}
                  placeholder="List any relevant medical conditions..."
                />
                <EditableField
                  fieldName="surgeries"
                  value={note.surgeries || ''}
                  label="Surgeries"
                  isTextarea={true}
                  placeholder="List any past surgeries..."
                />
                <EditableField
                  fieldName="hospitalizations"
                  value={note.hospitalizations || ''}
                  label="Hospitalizations"
                  isTextarea={true}
                  placeholder="List any past hospitalizations..."
                />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {note.medicalConditions && <div><strong>Medical Conditions:</strong> {formatFieldValue(note.medicalConditions)}</div>}
                {note.surgeries && <div><strong>Surgeries:</strong> {formatFieldValue(note.surgeries)}</div>}
                {note.hospitalizations && <div><strong>Hospitalizations:</strong> {formatFieldValue(note.hospitalizations)}</div>}
              </div>
            )}
          </section>
        )}

        {/* Drug History and Allergies */}
        {(note.medications || note.allergies || isEditMode) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Drug History and Allergies</h2>
            {isEditMode ? (
              <div className="space-y-4">
                <EditableField
                  fieldName="medications"
                  value={note.medications || ''}
                  label="Current Medications"
                  isTextarea={true}
                  placeholder="List current medications..."
                />
                <EditableField
                  fieldName="allergies"
                  value={note.allergies || ''}
                  label="Allergies"
                  isTextarea={true}
                  placeholder="List any known allergies..."
                />
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {note.medications && <div><strong>Current Medications:</strong> {formatFieldValue(note.medications)}</div>}
                {note.allergies && <div><strong>Allergies:</strong> {formatFieldValue(note.allergies)}</div>}
              </div>
            )}
          </section>
        )}

        {/* Social History */}
        {(note.smoking || note.alcohol || note.recreationalDrugs || note.occupationLivingSituation || note.travel || note.sexual || note.eatingOut || isEditMode) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Social History</h2>
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  fieldName="smoking"
                  value={note.smoking || ''}
                  label="Smoking"
                  placeholder="Smoking status..."
                />
                <EditableField
                  fieldName="alcohol"
                  value={note.alcohol || ''}
                  label="Alcohol"
                  placeholder="Alcohol consumption..."
                />
                <EditableField
                  fieldName="recreationalDrugs"
                  value={note.recreationalDrugs || ''}
                  label="Recreational Drugs"
                  placeholder="Drug use..."
                />
                <EditableField
                  fieldName="occupationLivingSituation"
                  value={note.occupationLivingSituation || ''}
                  label="Occupation/Living"
                  placeholder="Occupation and living situation..."
                />
                <EditableField
                  fieldName="travel"
                  value={note.travel || ''}
                  label="Travel"
                  placeholder="Recent travel history..."
                />
                <EditableField
                  fieldName="sexual"
                  value={note.sexual || ''}
                  label="Sexual History"
                  placeholder="Relevant sexual history..."
                />
                <EditableField
                  fieldName="eatingOut"
                  value={note.eatingOut || ''}
                  label="Eating Habits"
                  placeholder="Eating out habits..."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {note.smoking && <div><strong>Smoking:</strong> {formatFieldValue(note.smoking)}</div>}
                {note.alcohol && <div><strong>Alcohol:</strong> {formatFieldValue(note.alcohol)}</div>}
                {note.recreationalDrugs && <div><strong>Recreational Drugs:</strong> {formatFieldValue(note.recreationalDrugs)}</div>}
                {note.occupationLivingSituation && <div><strong>Occupation/Living:</strong> {formatFieldValue(note.occupationLivingSituation)}</div>}
                {note.travel && <div><strong>Travel:</strong> {formatFieldValue(note.travel)}</div>}
                {note.sexual && <div><strong>Sexual History:</strong> {formatFieldValue(note.sexual)}</div>}
                {note.eatingOut && <div><strong>Eating Habits:</strong> {formatFieldValue(note.eatingOut)}</div>}
              </div>
            )}
          </section>
        )}

        {/* Family History */}
        {(note.familyHistory || isEditMode) && (
          <section className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-blue-900">Family History</h2>
            {isEditMode ? (
              <EditableField
                fieldName="familyHistory"
                value={note.familyHistory || ''}
                label=""
                isTextarea={true}
                placeholder="Relevant family medical history..."
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.familyHistory)}</p>
            )}
          </section>
        )}

        {/* System Review */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Review of Systems</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
                              <EditableField
                  fieldName="systemsReview"
                  value={note.systemsReview || ''}
                  label=""
                  isTextarea={true}
                  placeholder="Enter the system review..."
                />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.systemsReview)}</p>
            )}
          </div>
        </section>

        {/* Physical Examination */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Physical Examination</h2>
          <div className="border-t border-gray-300 pt-4">
            {isEditMode ? (
              <EditableField
                fieldName="physicalExamination"
                value={note.physicalExamination || ''}
                label=""
                isTextarea={true}
                placeholder="Enter the physical examination findings..."
              />
            ) : (
              <div>
                {/* Medical Diagram - Only show when there's meaningful examination data */}
                {hasPhysicalExaminationFindings(note) && (
                  <div className="mb-6">
                    <SimpleMedicalDiagram
                      patientGender={determinePatientGender(note.patientGender)}
                      examinationData={{
                        generalExamination: (note.physicalExamination || '').replace(/\}\}/g, ''),
                        cardiovascularExamination: '', 
                        respiratoryExamination: '', 
                        abdominalExamination: '', 
                        otherSystemsExamination: ''
                      }}
                    />
                  </div>
                )}
                {/* Text findings */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatFieldValue(note.physicalExamination)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Investigations */}
        <section className="border-b pb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('investigations')}
          >
            <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Investigations</h2>
            {expandedSections.investigations ? (
              <ChevronDown className="h-5 w-5 text-blue-800" />
            ) : (
              <ChevronRight className="h-5 w-5 text-blue-800" />
            )}
          </div>
          {expandedSections.investigations && (
            <div className="border-t border-gray-300 pt-4">
              {isEditMode ? (
                <EditableField
                  fieldName="investigations"
                  value={note.investigations || ''}
                  label=""
                  isTextarea={true}
                  placeholder="Laboratory tests, imaging, and other investigations..."
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatFieldValue((note.investigations || '').replace(/\}\}/g, ''))}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Assessment */}
        <section className="border-b pb-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('assessment')}
          >
            <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Assessment</h2>
            {expandedSections.assessment ? (
              <ChevronDown className="h-5 w-5 text-blue-800" />
            ) : (
              <ChevronRight className="h-5 w-5 text-blue-800" />
            )}
          </div>
          {expandedSections.assessment && (
            <div className="border-t border-gray-300 pt-4">
              {isEditMode ? (
                <EditableField
                  fieldName="assessment"
                  value={note.assessment || ''}
                  label=""
                  isTextarea={true}
                  placeholder="Enter your clinical assessment and diagnosis..."
                />
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatFieldValue(note.assessment)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Plan */}
        <section className="border-b pb-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('plan')}
          >
            <h2 className="text-lg font-bold text-blue-800 uppercase mb-2">Plan</h2>
            {expandedSections.plan ? (
              <ChevronDown className="h-5 w-5 text-blue-800" />
            ) : (
              <ChevronRight className="h-5 w-5 text-blue-800" />
            )}
          </div>
          {expandedSections.plan && (
            <div className="border-t border-gray-300 pt-4">
              {isEditMode ? (
                <EditableField
                  fieldName="plan"
                  value={note.plan || ''}
                  label=""
                  isTextarea={true}
                  placeholder="Enter the treatment plan..."
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatFieldValue(note.plan)}</p>
              )}
            </div>
          )}
        </section>



        {/* ICD-11 Codes */}
        <section className="border-b pb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-blue-900">ICD-11 Codes</h2>
          </div>

          {/* Show existing ICD-11 codes */}
          {note.icd11Codes && note.icd11Codes.primary && note.icd11Codes.primary.length > 0 ? (
            <div className="space-y-4">
              {note.icd11Codes.primary && note.icd11Codes.primary.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2 text-blue-800">Primary Diagnosis</h3>
                  <div className="space-y-2">
                    {note.icd11Codes.primary.map((code, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        <div><strong>{code.code}</strong> - {code.title}</div>
                        {code.definition && <div className="text-gray-600 mt-1">{code.definition}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {note.icd11Codes.secondary && note.icd11Codes.secondary.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2 text-blue-800">Secondary Diagnoses</h3>
                  <div className="space-y-2">
                    {note.icd11Codes.secondary.map((code, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        <div><strong>{code.code}</strong> - {code.title}</div>
                        {code.definition && <div className="text-gray-600 mt-1">{code.definition}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : generatedICD11Codes ? (
            /* Show generated ICD-11 codes with checkboxes */
            <div className="space-y-4">
              {generatedICD11Codes.primary && generatedICD11Codes.primary.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2 text-blue-800">
                    Primary Diagnosis
                  </h3>
                  <div className="space-y-2">
                    {generatedICD11Codes.primary.map((code: any, index: number) => {
                      const codeId = `primary-${index}`
                      const isSelected = selectedICD11Codes.primary.includes(codeId)
                      return (
                        <div key={index} className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={codeId}
                              checked={isSelected}
                              onChange={(e) => handleICD11CodeSelection(codeId, 'primary', e.target.checked)}
                              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div><strong>{code.code}</strong> - {code.title}</div>
                                <Badge variant="outline" className="text-xs">
                                  {code.confidence} confidence
                                </Badge>
                              </div>
                              {code.description && <div className="text-gray-600 mt-1">{code.description}</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {generatedICD11Codes.secondary && generatedICD11Codes.secondary.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2 text-blue-800">
                    Secondary Diagnoses
                  </h3>
                  <div className="space-y-2">
                    {generatedICD11Codes.secondary.map((code: any, index: number) => {
                      const codeId = `secondary-${index}`
                      const isSelected = selectedICD11Codes.secondary.includes(codeId)
                      return (
                        <div key={index} className="text-sm p-2 bg-orange-50 rounded border border-orange-200">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={codeId}
                              checked={isSelected}
                              onChange={(e) => handleICD11CodeSelection(codeId, 'secondary', e.target.checked)}
                              className="mt-1 h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div><strong>{code.code}</strong> - {code.title}</div>
                                <Badge variant="outline" className="text-xs">
                                  {code.confidence} confidence
                                </Badge>
                              </div>
                              {code.description && <div className="text-gray-600 mt-1">{code.description}</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {generatedICD11Codes.suggestions && generatedICD11Codes.suggestions.length > 0 && (
                <div>
                  <h3 className="text-md font-medium mb-2 text-gray-700">
                    Suggestions
                  </h3>
                  <div className="space-y-2">
                    {generatedICD11Codes.suggestions.map((code: any, index: number) => {
                      const codeId = `suggestions-${index}`
                      const isSelected = selectedICD11Codes.suggestions.includes(codeId)
                      return (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={codeId}
                              checked={isSelected}
                              onChange={(e) => handleICD11CodeSelection(codeId, 'suggestions', e.target.checked)}
                              className="mt-1 h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div><strong>{code.code}</strong> - {code.title}</div>
                                <Badge variant="outline" className="text-xs">
                                  {code.confidence} confidence
                                </Badge>
                              </div>
                              {code.description && <div className="text-gray-600 mt-1">{code.description}</div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Show selected codes summary */}
              {getSelectedCodesForDisplay() && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Selected Codes for Medical Note ({selectedICD11Codes.primary.length + selectedICD11Codes.secondary.length + selectedICD11Codes.suggestions.length} codes)
                  </h4>
                  <div className="text-xs text-green-700">
                    These codes will appear in the PDF
                  </div>
                </div>
              )}


            </div>
          ) : (
            /* Show empty state */
            <div className="text-center py-4 text-gray-500">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-2xl text-gray-300">🏥</div>
                <p className="text-sm font-medium">No ICD-11 codes assigned</p>
                <p className="text-xs text-gray-400">
                  {isGeneratingICD11 
                    ? 'Generating ICD-11 codes using AI...' 
                    : 'Click "Generate with AI" to automatically generate codes from diagnosis and symptoms'
                  }
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Doctor Information & Authorization */}
        <section className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900">Doctor Information & Authorization</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section - Doctor Information */}
            <div className="space-y-3">
              {isEditMode ? (
                <div className="space-y-4">
                  <EditableField
                    fieldName="doctorName"
                    value={note.doctorName || getCurrentUserName()}
                    label="Doctor"
                    placeholder={getCurrentUserName()}
                  />
                  <EditableField
                    fieldName="doctorRegistrationNo"
                    value={note.doctorRegistrationNo || user?.registrationNo || ''}
                    label="Registration No"
                    placeholder={user?.registrationNo || '[Registration Number]'}
                  />
                  <div className="text-sm text-gray-600">
                    <strong>Generated on:</strong> {note.dateTime || new Date().toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div><strong>Doctor:</strong> {note.doctorName ? `Dr. ${formatFieldValue(note.doctorName)}` : `Dr. ${getCurrentUserName()}`}</div>
                  <div><strong>Registration No:</strong> {note.doctorRegistrationNo ? formatFieldValue(note.doctorRegistrationNo) : (user?.registrationNo || '[Registration Number]')}</div>
                  <div><strong>Generated on:</strong> {note.dateTime || new Date().toLocaleDateString()}</div>
                </div>
              )}
            </div>

            {/* Right Section - Authorization */}
            <div className="space-y-4">
              {/* Doctor Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Signature:</label>
                <div className="border-2 border-gray-300 rounded-lg h-24 flex items-center justify-center bg-gray-50">
                  {signatureImage ? (
                    <img src={signatureImage} alt="Doctor Signature" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-sm">Signature</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Stamp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Official Stamp:</label>
                <div className="border-2 border-gray-300 rounded-lg h-24 flex items-center justify-center bg-gray-50">
                  {stampImage ? (
                    <img src={stampImage} alt="Official Stamp" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-sm">Stamp</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}