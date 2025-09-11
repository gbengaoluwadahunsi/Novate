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
import ICD11CodesDisplay from './icd11-codes-display'

import { useAppSelector } from '@/store/hooks'
import { store } from '@/store/store'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { validateAllVitalSigns, getNormalRange } from "@/lib/vital-signs-validator"

const isEffectivelyEmpty = (value: string | null | undefined): boolean => {
  if (!value) {
    return true;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed === '' || trimmed === 'not mentioned' || trimmed === 'n/a';
};

interface DocumentStyleNoteViewerProps {
  note: CleanMedicalNote
  onSave: (updatedNote: CleanMedicalNote, changeDescription: string) => void
  onVersionHistory?: () => void
  onExportPDF?: (useLetterhead?: boolean, letterheadImage?: string, selectedICD11Codes?: any) => void
  onPrimaryCodeSelect?: (code: string, title: string) => void
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
  onPrimaryCodeSelect,
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
  const [showUnauthorizedWatermark, setShowUnauthorizedWatermark] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'signature' | 'stamp' | 'letterhead' | null>(null)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isDocumentSigned, setIsDocumentSigned] = useState(false)
  const [signatureTimestamp, setSignatureTimestamp] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [isEditingAllowed, setIsEditingAllowed] = useState(true)

  // Load signature, stamp, and letterhead from user profile
  useEffect(() => {
    const { user } = store?.getState()?.auth || {};
    if (user?.signatureUrl) {
      setSignatureImage(user.signatureUrl)
    }
    if (user?.stampUrl) {
      setStampImage(user.stampUrl)
    }
    if (user?.letterheadUrl) {
      setLetterheadFile(user.letterheadUrl)
    }
    
    // Check if watermark should be shown for doctors without certificate
    if (user?.role === 'DOCTOR' && !user?.practicingCertificateUrl) {
      setShowUnauthorizedWatermark(true)
    } else {
      setShowUnauthorizedWatermark(false)
    }
  }, [])

  // Listen for user state changes to update watermark when certificate is uploaded
  const currentUser = useAppSelector(state => state.auth.user);
  useEffect(() => {
    if (currentUser?.role === 'DOCTOR' && !currentUser?.practicingCertificateUrl) {
      setShowUnauthorizedWatermark(true)
    } else {
      setShowUnauthorizedWatermark(false)
    }
  }, [currentUser?.practicingCertificateUrl, currentUser?.role])

  // Helper function to format content with bullet points
  const formatWithBulletPoints = (content: string, title: string) => {
    // Sections that should use bullet points
    const bulletPointSections = [
      'History of Present Illness',
      'Past Medical History',
      'System Review',
      'Physical Examination',
      'Investigations',
      'Assessment',
      'Plan',
      'Drug History',
      'Allergies',
      'Family History',
      'Social History'
    ]
    
    if (!bulletPointSections.includes(title)) {
      return content
    }
    
    // Special formatting for System Review
    if (title === 'System Review') {
      return formatSystemReview(content)
    }
    
    // Special formatting for Plan
    if (title === 'Plan') {
      return formatPlan(content)
    }
    
    // Standardize "N/A" to "Not mentioned"
    const standardizedContent = (content || "").trim().toLowerCase() === 'n/a' ? 'Not mentioned' : content;

    if (standardizedContent === 'Not mentioned') {
        return <li className="mb-1 text-gray-500 italic">Not mentioned</li>;
    }
    
    // Split by sentences and create bullet points, ensuring not to split on decimals
    const sentences = standardizedContent.split(/(?<!\d)[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.map((sentence, index) => (
      <li key={index} className="mb-1">
        {sentence.trim()}
        {index < sentences.length - 1 ? '.' : ''}
      </li>
    ))
  }

  // Format Plan with sub-sections
  const formatPlan = (content: string) => {
    const planSections: { [key: string]: string } = {
      'Investigations': '',
      'Treatment': '',
      'Patient Education': '',
      'Follow-up': '',
      'Medications': ''
    };

    // Use a regex to split the content by the section titles
    const sections = content.split(/(Investigations:|Treatment:|Patient Education:|Follow-up:|Medications:)/i);
    
    let currentSection: string | null = null;

    for (const part of sections) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      const matchedSectionKey = Object.keys(planSections).find(key => 
        key.toLowerCase() === trimmedPart.toLowerCase().replace(':', '')
      );

      if (matchedSectionKey) {
        currentSection = matchedSectionKey;
      } else if (currentSection) {
        planSections[currentSection] += `${trimmedPart} `;
      }
    }

    const formattedElements = Object.entries(planSections).map(([title, text]) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return null;
      }

      // Handle Medications separately for nested details
      if (title === 'Medications') {
        const medicationDetails = trimmedText.split(';').map(s => s.trim()).filter(s => s);
        return (
          <li key={title} className="mb-2">
            <strong>{title}:</strong>
            <ul className="list-disc pl-5 mt-1">
              {medicationDetails.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
          </li>
        );
      }

      return (
        <li key={title} className="mb-1">
          <strong>{title}:</strong> {trimmedText}
        </li>
      );
    }).filter(Boolean);

    // If parsing fails, fall back to simple bullet points
    if (formattedElements.length === 0) {
      const sentences = content.split(/(?<!\d)[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        return sentences.map((sentence, index) => (
            <li key={index} className="mb-1">{sentence.trim()}</li>
        ));
      } else {
        return <li className="mb-1">{content}</li>;
      }
    }

    return formattedElements;
  };

  // Format System Review with specific categories - only show systems with findings
  const formatSystemReview = (content: string) => {
    const systemCategories = [
      'General',
      'Ear, Nose, Throat',
      'Cardiovascular',
      'Respiratory',
      'Gastrointestinal',
      'Genitourinary',
      'Neurological',
      'Musculoskeletal',
      'Skin',
      'Endocrine',
      'Hematology',
      'Psychiatry',
      'Ophthalmology'
    ]
    
    // Find systems that actually have documented findings
    const systemsWithFindings = systemCategories
      .map(category => {
        const relevantSentences = content.split(/[.!?]+/)
          .filter(sentence => 
            sentence.toLowerCase().includes(category.toLowerCase()) && 
            sentence.trim().length > 0 &&
            !sentence.toLowerCase().includes('no specific findings') &&
            !sentence.toLowerCase().includes('not mentioned') &&
            !sentence.toLowerCase().includes('unremarkable') &&
            !sentence.toLowerCase().includes('normal')
          )
        
        return {
          category,
          sentences: relevantSentences
        }
      })
      .filter(system => system.sentences.length > 0)
    
    // If no specific systems found, show the content as general bullet points
    if (systemsWithFindings.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
      return (
        <ul className="list-disc pl-5 space-y-1">
          {sentences.map((sentence, index) => (
            <li key={index} className="text-sm text-gray-700">
              {sentence.trim()}
            </li>
          ))}
        </ul>
      )
    }
    
    // Show only systems with actual findings
    return (
      <div className="space-y-3">
        {systemsWithFindings.map(({ category, sentences }) => (
          <div key={category} className="border-l-2 border-blue-200 pl-3">
            <h5 className="font-medium text-blue-800 mb-1">{category}:</h5>
            <ul className="list-disc pl-5 space-y-1">
              {sentences.map((sentence, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {sentence.trim()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

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

  // Field mapping for voice editing - maps frontend field names to backend field names
  const mapFieldForVoiceEdit = (frontendField: string): string => {
    const fieldMapping: { [key: string]: string } = {
      'patientAge': 'age',
      'patientGender': 'gender', 
      'patientName': 'name',
      'chiefComplaint': 'chiefComplaint',
      'historyOfPresentingIllness': 'historyOfPresentingIllness',
      'medicalConditions': 'pastMedicalHistory',
      'surgeries': 'surgeries',
      'medications': 'medications',
      'allergies': 'allergies',
      'smoking': 'smoking',
      'alcohol': 'alcohol',
      'recreationalDrugs': 'recreationalDrugs',
      'familyHistory': 'familyHistory',
      'systemsReview': 'systemReview',
      'physicalExamination': 'physicalExamination',
      'investigations': 'investigations',
      'assessment': 'diagnosis',
      'plan': 'plan',
      'temperature': 'temperature',
      'pulseRate': 'pulseRate',
      'bloodPressure': 'bloodPressure',
      'respiratoryRate': 'respiratoryRate',
      'glucose': 'glucose',
      'doctorName': 'doctorName',
      'doctorRegistrationNo': 'doctorRegistrationNo'
    };
    
    return fieldMapping[frontendField] || frontendField;
  };

  // Helper function to update a field in the edited note
  const updateField = (field: string, value: string) => {
    // Debug logging for gender field updates
    if (field === 'patientGender') {
      // Gender update logic (if needed)
    }
    
    setEditedNote(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      return updated;
    })
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
      return 'Not mentioned'
    }
    if (typeof value === 'string' && (value === 'N/A' || value === 'n/a' || value === 'N/a')) {
      return 'Not mentioned'
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  // Helper function to format multiple social history fields with bullet points
  const formatSocialHistory = (smoking: any, alcohol: any, drugs: any) => {
    const fields = []
    
    if (smoking && smoking !== 'N/A' && smoking !== 'n/a' && smoking !== '' && smoking !== null && smoking !== undefined) {
      fields.push(`• Smoking: ${smoking}`)
    }
    
    if (alcohol && alcohol !== 'N/A' && alcohol !== 'n/a' && alcohol !== '' && alcohol !== null && alcohol !== undefined) {
      fields.push(`• Alcohol: ${alcohol}`)
    }
    
    if (drugs && drugs !== 'N/A' && drugs !== 'n/a' && drugs !== '' && drugs !== null && drugs !== undefined) {
      fields.push(`• Recreational drugs: ${drugs}`)
    }
    
    if (fields.length === 0) {
      return 'Not mentioned'
    }
    
    return fields.join('\n')
  }

  // Helper function to format date for display (just date, month, year)
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // 🌡️ Temperature conversion utility
  const convertTemperatureToCelsius = (tempValue: string | number | undefined | null): string => {
    if (!tempValue || tempValue === 'Not mentioned' || tempValue === 'N/A') {
      return 'Not mentioned';
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
        // TODO: Upload to backend using apiClient.uploadSignature()
        toast.success('E-Signature uploaded successfully')
      } else if (type === 'stamp') {
        setStampImage(result)
        // TODO: Upload to backend using apiClient.uploadStamp()
        toast.success('Medical stamp uploaded successfully')
      } else if (type === 'letterhead') {
        // For letterhead, store as base64 data URL
        setLetterheadFile(result)
        // TODO: Upload to backend using apiClient.uploadLetterhead()
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
      // Check if doctor has certificate before allowing PDF export
      const { user } = store?.getState()?.auth || {};
      if (user?.role === 'DOCTOR' && !user?.practicingCertificateUrl) {
        toast.error("Certificate Required: Please upload your practicing certificate to download PDF notes.");
        return;
      }

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

      // Add watermark to PDF if unauthorized
      if (showUnauthorizedWatermark) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setTextColor(200, 200, 200); // Light gray
          pdf.setFontSize(40);
          pdf.text('UNAUTHORIZED NOTE FROM NOVATESCRIBE', 105, 150, {
            angle: -45,
            align: 'center'
          });
        }
      }

      // Save the PDF
      const fileName = `Medical_Consultation_Note_${note.patientName || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success(`PDF Generated Successfully: Medical consultation note has been downloaded as ${fileName}`);

    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.');
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
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 relative" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Unauthorized Watermark for Doctors without Certificate */}
      {showUnauthorizedWatermark && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div 
            className="text-gray-300 text-6xl font-bold transform -rotate-45 opacity-20 select-none"
            style={{ 
              fontSize: '4rem',
              lineHeight: '1',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            UNAUTHORIZED NOTE<br/>
            FROM NOVATESCRIBE
          </div>
        </div>
      )}
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
              {isTranscribing ? (
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-center">
                  <p className="font-semibold">Transcription in progress, please wait...</p>
                  <p className="text-sm">The note will be available shortly.</p>
                </div>
              ) : (
                <div className="bg-blue-500 text-white p-2 rounded-md text-center text-xs">
                  <p>
                    Generated: <span className="font-mono">{new Date().toLocaleString()}</span>
                  </p>
                </div>
              )}
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
                      sectionName="Patient Name"
                      sectionField={mapFieldForVoiceEdit('patientName')}
                      currentValue={editedNote.patientName || ''}
                      onUpdate={(value) => updateField('patientName', value)}
                      onSave={(changeDescription) => onSave(editedNote, changeDescription)}
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
                      noteId={note.id || ''}
                      sectionName="Patient Age"
                      sectionField={mapFieldForVoiceEdit('patientAge')}
                      currentValue={editedNote.patientAge || ''}
                      onUpdate={(value) => updateField('patientAge', value)}
                      onSave={(changeDescription) => onSave(editedNote, changeDescription)}
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
                <div><strong>Name:</strong> <span className={!editedNote.patientName ? 'text-gray-500 italic' : ''}>{formatFieldValue(editedNote.patientName)}</span></div>
                <div><strong>Role:</strong> PATIENT</div>
                <div><strong>Age:</strong> <span className={!editedNote.patientAge ? 'text-gray-500 italic' : ''}>{formatFieldValue(editedNote.patientAge)}</span></div>
                <div><strong>Gender:</strong> <span className={!editedNote.patientGender ? 'text-gray-500 italic' : ''}>{formatFieldValue(editedNote.patientGender)}</span></div>
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
                      noteId={note.id || ''}
                      sectionName="Temperature"
                      sectionField={mapFieldForVoiceEdit('temperature')}
                      currentValue={(editedNote as any).temperature || ''}
                      onUpdate={(value) => updateField('temperature', value)}
                      onSave={(changeDescription) => onSave(editedNote, changeDescription)}
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
                      noteId={note.id || ''}
                      sectionName="Blood Pressure"
                      sectionField={mapFieldForVoiceEdit('bloodPressure')}
                      currentValue={(editedNote as any).bloodPressure || ''}
                      onUpdate={(value) => updateField('bloodPressure', value)}
                      onSave={(changeDescription) => onSave(editedNote, changeDescription)}
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
                {/* Temperature */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong>Temperature:</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(() => {
                      const validation = validateAllVitalSigns({
                        temperature: (note as any).vitalSigns?.temperature || (note as any).temperature || ''
                      });
                      return `${validation.temperature.color} ${validation.temperature.isNotMentioned ? 'italic' : ''}`;
                    })()}>
                      {convertTemperatureToCelsius((note as any).vitalSigns?.temperature || (note as any).temperature)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const validation = validateAllVitalSigns({
                          temperature: (note as any).vitalSigns?.temperature || (note as any).temperature || ''
                        });
                        return validation.temperature.message;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong>Blood Pressure:</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(() => {
                      const validation = validateAllVitalSigns({
                        bloodPressure: (note as any).vitalSigns?.bloodPressure || (note as any).bloodPressure || ''
                      });
                      return `${validation.bloodPressure.color} ${validation.bloodPressure.isNotMentioned ? 'italic' : ''}`;
                    })()}>
                      {formatFieldValue((note as any).vitalSigns?.bloodPressure || (note as any).bloodPressure)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const validation = validateAllVitalSigns({
                          bloodPressure: (note as any).vitalSigns?.bloodPressure || (note as any).bloodPressure || ''
                        });
                        return validation.bloodPressure.message;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Pulse Rate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong>Pulse Rate:</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(() => {
                      const validation = validateAllVitalSigns({
                        pulseRate: (note as any).vitalSigns?.pulseRate || (note as any).pulseRate || ''
                      });
                      return `${validation.pulseRate.color} ${validation.pulseRate.isNotMentioned ? 'italic' : ''}`;
                    })()}>
                      {formatFieldValue((note as any).vitalSigns?.pulseRate || (note as any).pulseRate)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const validation = validateAllVitalSigns({
                          pulseRate: (note as any).vitalSigns?.pulseRate || (note as any).pulseRate || ''
                        });
                        return validation.pulseRate.message;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Respiratory Rate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong>Respiratory Rate:</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(() => {
                      const validation = validateAllVitalSigns({
                        respiratoryRate: (note as any).vitalSigns?.respiratoryRate || (note as any).respiratoryRate || ''
                      });
                      return `${validation.respiratoryRate.color} ${validation.respiratoryRate.isNotMentioned ? 'italic' : ''}`;
                    })()}>
                      {formatFieldValue((note as any).vitalSigns?.respiratoryRate || (note as any).respiratoryRate)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const validation = validateAllVitalSigns({
                          respiratoryRate: (note as any).vitalSigns?.respiratoryRate || (note as any).respiratoryRate || ''
                        });
                        return validation.respiratoryRate.message;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Glucose Levels */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <strong>Glucose Levels:</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={(() => {
                      const validation = validateAllVitalSigns({
                        glucose: (note as any).vitalSigns?.glucoseLevels || (note as any).glucose || ''
                      });
                      return `${validation.glucose.color} ${validation.glucose.isNotMentioned ? 'italic' : ''}`;
                    })()}>
                      {formatFieldValue((note as any).vitalSigns?.glucoseLevels || (note as any).glucose)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const validation = validateAllVitalSigns({
                          glucose: (note as any).vitalSigns?.glucoseLevels || (note as any).glucose || ''
                        });
                        return validation.glucose.message;
                      })()}
                    </span>
                  </div>
                </div>
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
                      noteId={note.id || ''}
                      sectionName="Chief Complaint"
                      sectionField={mapFieldForVoiceEdit('chiefComplaint')}
                      currentValue={editedNote.chiefComplaint || ''}
                      onUpdate={(value) => updateField('chiefComplaint', value)}
                      onSave={(changeDescription) => onSave(editedNote, changeDescription)}
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
              <div className="text-sm">
                {editedNote.chiefComplaint ? (
                  <p>{editedNote.chiefComplaint}</p>
                ) : (
                  <p className="text-gray-500 italic">Not mentioned</p>
                )}
              </div>
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
                  noteId={note.id || ''}
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
              <div className="text-sm">
                {editedNote.historyOfPresentingIllness ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {formatWithBulletPoints(editedNote.historyOfPresentingIllness, 'History of Present Illness')}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Not mentioned</p>
                )}
              </div>
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
                <div>
                  <strong>Medical Conditions:</strong>
                  {isEffectivelyEmpty(note.medicalConditions) ? (
                    <span className="text-gray-500 italic"> Not mentioned</span>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {formatWithBulletPoints(note.medicalConditions, 'Past Medical History')}
                    </ul>
                  )}
                </div>
                <div>
                  <strong>Surgery:</strong>
                  {isEffectivelyEmpty(note.surgeries) ? (
                    <span className="text-gray-500 italic"> Not mentioned</span>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {formatWithBulletPoints(note.surgeries, 'Past Medical History')}
                    </ul>
                  )}
                </div>
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
                              <div><strong>Current Medications:</strong> 
                {note.medications ? (
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    {formatWithBulletPoints(note.medications, 'Drug History')}
                  </ul>
                ) : (
                  <span className="text-gray-500 italic"> Not mentioned</span>
                )}
              </div>
              <div><strong>Allergies:</strong> 
                {note.allergies ? (
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    {formatWithBulletPoints(note.allergies, 'Allergies')}
                  </ul>
                ) : (
                  <span className="text-gray-500 italic"> Not mentioned</span>
                )}
              </div>
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
                  noteId={note.id || ''}
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
              <div className="text-sm">
                {note.familyHistory ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {formatWithBulletPoints(note.familyHistory, 'Family History')}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Not mentioned</p>
                )}
              </div>
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
                      noteId={note.id || ''}
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
              <div className="text-sm">
                {note.socialHistory && note.socialHistory.trim() !== '' ? (
                  <ul className="list-disc list-inside space-y-1">
                    {note.socialHistory.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500 italic">Not mentioned</span>
                )}
              </div>
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
                  noteId={note.id || ''}
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
              <div className="text-sm">
                {note.systemsReview ? (
                  <ul className="list-disc list-inside space-y-1">
                    {note.systemsReview.split(/[.!?]+/).filter(s => s.trim().length > 0).map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Not mentioned</p>
                )}
              </div>
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
                  noteId={note.id || ''}
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
                <div className="text-sm">
                  {note.physicalExamination ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {formatWithBulletPoints(note.physicalExamination, 'Physical Examination')}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Not mentioned</p>
                  )}
                </div>
              )}
            </div>
                
            {/* Physical Examination Visualization - Only show if there's examination data */}
            {note.physicalExamination && 
             note.physicalExamination.trim() !== '' && 
             note.physicalExamination !== 'No physical examination was performed during this consultation.' &&
             note.physicalExamination !== 'N/A' &&
             note.physicalExamination !== 'n/a' &&
             note.physicalExamination !== 'Not mentioned' && (
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
                        noteId={note.id || ''}
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
                  <div>
                    {note.investigations ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {formatWithBulletPoints(note.investigations, 'Investigations')}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Not mentioned</p>
                    )}
                  </div>
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
                        noteId={note.id || ''}
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
                  <div>
                    {note.assessment ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {formatWithBulletPoints(note.assessment, 'Assessment')}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Not mentioned</p>
                    )}
                  </div>
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
                        noteId={note.id || ''}
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
                  <div>
                    {note.plan ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {formatWithBulletPoints(note.plan, 'Plan')}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Not mentioned</p>
                    )}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* ICD-11 Codes */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-bold" style={{ color: '#1E90FF' }}>ICD-11 Code</h2>
              {isEditMode && (
                <SectionVoiceInput
                  noteId={note.id || ''}
                  sectionName="ICD-11 Code"
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
              <ICD11CodesDisplay
                medicalNote={{
                  icd11Codes: (() => {
                    let codes: string[] = [];
                    
                    // Try different data formats
                    if (Array.isArray((note as any).icd11Codes)) {
                      codes = (note as any).icd11Codes;
                    } else if (note.icd11Codes?.primary && Array.isArray(note.icd11Codes.primary)) {
                      codes = note.icd11Codes.primary.map((c: any) => c.code);
                    } else if ((note as any).icd11CodesComplex?.primary && Array.isArray((note as any).icd11CodesComplex.primary)) {
                      codes = (note as any).icd11CodesComplex.primary.map((c: any) => c.code);
                    }
                    

                    return codes;
                  })(),
                  icd11Titles: (() => {
                    let titles: string[] = [];
                    
                    // Try different data formats
                    if (Array.isArray((note as any).icd11Titles)) {
                      titles = (note as any).icd11Titles;
                    } else if (note.icd11Codes?.primary && Array.isArray(note.icd11Codes.primary)) {
                      titles = note.icd11Codes.primary.map((c: any) => c.title);
                    } else if ((note as any).icd11CodesComplex?.primary && Array.isArray((note as any).icd11CodesComplex.primary)) {
                      titles = (note as any).icd11CodesComplex.primary.map((c: any) => c.title);
                    }
                    

                    return titles;
                  })(),
                  icd11SourceSentence: (note as any).icd11SourceSentence || note.icd11Codes?.primary?.[0]?.definition,
                }}
                onCodeSelect={(code, title) => onPrimaryCodeSelect?.(code, title)}
              />
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
                        noteId={note.id || ''}
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
                        noteId={note.id || ''}
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
                        noteId={note.id || ''}
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
                  <div><strong>Generated on:</strong> <span className="font-mono text-sm">{formatDateForDisplay(note.dateTime || new Date().toISOString())}</span></div>
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