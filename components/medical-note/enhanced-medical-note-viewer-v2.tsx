"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Mic, 
  Download, 
  Share2,
  Edit,
  Save,
  Eye,
  Calendar,
  User,
  Stethoscope,
  Activity,
  Pill,
  FileSignature
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import new components
import VoiceEditor from "@/components/voice/voice-editor";
import FieldVoiceEditor from "@/components/voice/field-voice-editor";
import ICD11CodesDisplay from "@/components/medical-note/icd11-codes-display";
import SignatureVerificationModal from "@/components/signature/signature-verification-modal";
import { formatMedicalField, formatMedications, formatVitalSigns, getMedicalFieldProps } from "@/lib/medical-terminology-formatter";

interface EnhancedMedicalNoteViewerProps {
  note: {
    id: string;
    patientName: string;
    patientAge: number | string;
    patientGender: string;
    visitDate?: string;
    visitTime?: string;
    chiefComplaint?: string;
    historyOfPresentingIllness?: string;
    pastMedicalHistory?: string;
    physicalExamination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    followUpInstructions?: string;
    temperature?: string;
    pulseRate?: string;
    bloodPressure?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    glucose?: string;
    // ✅ Actual backend ICD-11 fields
    icd11Codes?: string[];
    icd11Titles?: string[];
    icd11SourceSentence?: string;
    // Doctor info
    doctorName?: string;
    doctorRegistrationNo?: string;
    createdAt: string;
    updatedAt: string;
  };
  doctorVerificationStatus?: {
    isVerified: boolean;
    certificateStatus: 'none' | 'pending' | 'verified' | 'rejected' | 'expired';
    certificateExpiryDate?: string;
    rejectionReason?: string;
  };
  onSave?: (updatedNote: any) => void;
  onVoiceEditComplete?: (result: {
    success: boolean;
    message: string;
    editedField: string;
    editedText: string;
    action: 'replace' | 'append' | 'delete';
  }) => void;
  onExportPDF?: () => void;
  className?: string;
}

export default function EnhancedMedicalNoteViewerV2({ 
  note, 
  doctorVerificationStatus,
  onSave,
  onVoiceEditComplete,
  onExportPDF,
  className = "" 
}: EnhancedMedicalNoteViewerProps) {
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showVoiceEditor, setShowVoiceEditor] = useState(false);
  const [activeFieldEditor, setActiveFieldEditor] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedICD11Code, setSelectedICD11Code] = useState<{code: string; title: string; index: number} | null>(null);

  // Format all medical fields with consistent terminology
  const formattedFields = {
    chiefComplaint: formatMedicalField(note.chiefComplaint, { showBulletPoints: true }),
    historyOfPresentingIllness: formatMedicalField(note.historyOfPresentingIllness, { showBulletPoints: true }),
    pastMedicalHistory: formatMedicalField(note.pastMedicalHistory, { showBulletPoints: true }),
    physicalExamination: formatMedicalField(note.physicalExamination, { showBulletPoints: true }),
    diagnosis: formatMedicalField(note.diagnosis),
    treatmentPlan: formatMedicalField(note.treatmentPlan, { showBulletPoints: true }),
    followUpInstructions: formatMedicalField(note.followUpInstructions, { showBulletPoints: true })
  };

  const formattedVitalSigns = formatVitalSigns({
    temperature: note.temperature,
    pulseRate: note.pulseRate,
    bloodPressure: note.bloodPressure,
    respiratoryRate: note.respiratoryRate,
    oxygenSaturation: note.oxygenSaturation,
    glucose: note.glucose
  });

  const handleVoiceEditCompleteOld = (result: { editedText: string; fieldEdited: string }) => {
    toast({
      title: "Voice Edit Applied",
      description: `Updated ${result.fieldEdited}`,
    });
    
    // Update the note with the new content
    if (onSave) {
      onSave({
        ...note,
        [result.fieldEdited]: result.editedText
      });
    }
  };

  const handleICD11CodeSelect = (code: string, title: string, index: number) => {
    setSelectedICD11Code({ code, title, index });
    toast({
      title: "ICD-11 Code Selected",
      description: `${code} - ${title}`,
    });
  };

  const handleVoiceEditComplete = (result: {
    success: boolean;
    message: string;
    editedField: string;
    editedText: string;
    action: 'replace' | 'append' | 'delete';
  }) => {
    // Close the field editor
    setActiveFieldEditor(null);
    
    // Notify parent component if callback provided
    if (onVoiceEditComplete) {
      onVoiceEditComplete(result);
    }
    
    // Show success message
    toast({
      title: "Voice Edit Applied",
      description: `${result.action === 'replace' ? 'Updated' : result.action === 'append' ? 'Added to' : 'Cleared'} ${result.editedField}`,
    });
  };

  const handleSignatureVerified = (result: { type: 'uploaded' | 'manual'; signatureUrl?: string }) => {
    toast({
      title: "Document Signed",
      description: `Document signed using ${result.type} signature`,
    });
    
    // Here you would typically save the signature to the document
    if (onSave) {
      onSave({
        ...note,
        isSigned: true,
        signatureType: result.type,
        signatureUrl: result.signatureUrl,
        signedAt: new Date().toISOString()
      });
    }
  };

  const renderMedicalField = (
    label: string, 
    fieldName: string,
    value: string | undefined, 
    icon: React.ReactNode,
    showBulletPoints = false
  ) => {
    const fieldProps = getMedicalFieldProps(value, { showBulletPoints });
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h4 className="font-medium">{label}</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFieldEditor(fieldName)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Mic className="h-3 w-3 mr-1" />
            Voice Edit
          </Button>
        </div>
        
        {/* Field Voice Editor */}
        {activeFieldEditor === fieldName && (
          <FieldVoiceEditor
            noteId={note.id}
            fieldName={fieldName}
            fieldLabel={label}
            onEditComplete={handleVoiceEditComplete}
            onClose={() => setActiveFieldEditor(null)}
            className="mb-4"
          />
        )}
        
        <div className={fieldProps.className}>
          {fieldProps['data-bullet-points'] ? (
            <div className="space-y-1">
              {fieldProps.text.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          ) : (
            <p>{fieldProps.text}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Doctor Verification Status */}
      {doctorVerificationStatus && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                doctorVerificationStatus.certificateStatus === 'verified' ? 'bg-green-500' : 
                doctorVerificationStatus.certificateStatus === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              <span className="text-sm font-medium">
                Doctor Verification: {doctorVerificationStatus.certificateStatus}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Medical Note</span>
              {!doctorVerificationStatus?.isVerified && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Non-Verified Doctor
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVoiceEditor(!showVoiceEditor)}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignatureModal(true)}
              >
                <FileSignature className="h-4 w-4 mr-2" />
                Sign
              </Button>
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{note.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Age & Gender</p>
                <p className="font-medium">{note.patientAge} years, {note.patientGender}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Visit Date</p>
                <p className="font-medium">
                  {note.visitDate ? new Date(note.visitDate).toLocaleDateString() : 'Not specified'}
                  {note.visitTime && ` at ${note.visitTime}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Editor */}
      {showVoiceEditor && (
        <VoiceEditor
          noteId={note.id}
          onEditComplete={handleVoiceEditComplete}
        />
      )}

      {/* Medical History & Examination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Clinical Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderMedicalField(
            "Chief Complaint",
            "chiefComplaint", 
            note.chiefComplaint, 
            <FileText className="h-4 w-4 text-blue-600" />,
            true
          )}
          
          <Separator />
          
          {renderMedicalField(
            "History of Present Illness",
            "historyOfPresentingIllness", 
            note.historyOfPresentingIllness, 
            <FileText className="h-4 w-4 text-green-600" />,
            true
          )}
          
          <Separator />
          
          {renderMedicalField(
            "Past Medical History",
            "pastMedicalHistory", 
            note.pastMedicalHistory, 
            <FileText className="h-4 w-4 text-purple-600" />,
            true
          )}
          
          <Separator />
          
          {renderMedicalField(
            "Physical Examination",
            "physicalExamination", 
            note.physicalExamination, 
            <Stethoscope className="h-4 w-4 text-red-600" />,
            true
          )}
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Vital Signs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(formattedVitalSigns).map(([key, value]) => (
              <div key={key} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFieldEditor(key)}
                    className="text-blue-600 hover:text-blue-800 h-6 px-2"
                  >
                    <Mic className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Field Voice Editor */}
                {activeFieldEditor === key && (
                  <FieldVoiceEditor
                    noteId={note.id}
                    fieldName={key}
                    fieldLabel={key.replace(/([A-Z])/g, ' $1').trim()}
                    onEditComplete={handleVoiceEditComplete}
                    onClose={() => setActiveFieldEditor(null)}
                    className="col-span-full"
                  />
                )}
                
                <p className={value.isEmpty ? 'text-muted-foreground italic' : 'text-foreground'}>
                  {value.formatted}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment & Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Assessment & Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderMedicalField(
            "Diagnosis",
            "diagnosis", 
            note.diagnosis, 
            <FileText className="h-4 w-4 text-red-600" />
          )}
          
          <Separator />
          
          {renderMedicalField(
            "Treatment Plan",
            "treatmentPlan", 
            note.treatmentPlan, 
            <Pill className="h-4 w-4 text-green-600" />,
            true
          )}
          
          <Separator />
          
          {renderMedicalField(
            "Follow-up Instructions",
            "followUpInstructions", 
            note.followUpInstructions, 
            <Calendar className="h-4 w-4 text-blue-600" />,
            true
          )}
        </CardContent>
      </Card>

      {/* ICD-11 Codes */}
      <ICD11CodesDisplay
        medicalNote={{
          icd11Codes: note.icd11Codes,
          icd11Titles: note.icd11Titles,
          icd11SourceSentence: note.icd11SourceSentence
        }}
        onCodeSelect={(code, title, index) => {
          setSelectedICD11Code({ code, title, index });
          toast({
            title: "ICD-11 Code Selected",
            description: `${code} - ${title}`,
          });
        }}
      />

      {/* Selected ICD-11 Code Summary */}
      {selectedICD11Code && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Selected ICD-11 Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-mono font-bold text-blue-900">{selectedICD11Code.code}</p>
              <p className="text-blue-800">{selectedICD11Code.title}</p>
              <p className="text-sm text-blue-600 mt-2">
                Selected as {selectedICD11Code.index === 0 ? 'Primary' : 'Secondary'} diagnosis code
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Doctor</p>
              <p className="font-medium">{note.doctorName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Registration No.</p>
              <p className="font-medium">{note.doctorRegistrationNo || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(note.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date(note.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Verification Modal */}
      <SignatureVerificationModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSignatureVerified={handleSignatureVerified}
      />
    </div>
  );
}
