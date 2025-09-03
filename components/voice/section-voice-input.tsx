'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface SectionVoiceInputProps {
  noteId: string
  sectionName: string
  sectionField: string
  currentValue: string
  onUpdate: (newValue: string) => void
  onSave?: (changeDescription: string) => void  // Add save function
  className?: string
}

export default function SectionVoiceInput({
  noteId,
  sectionName,
  sectionField,
  currentValue,
  onUpdate,
  onSave,
  className = ''
}: SectionVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Helper function to determine expected data type for each field
  const getExpectedDataType = (field: string): string => {
    const dataTypes: { [key: string]: string } = {
      'age': 'number',
      'patientAge': 'number',
      'temperature': 'number',
      'pulseRate': 'number',
      'bloodPressure': 'text',
      'respiratoryRate': 'number',
      'glucose': 'number',
      'patientName': 'text',
      'patientGender': 'text',
      'chiefComplaint': 'text',
      'historyOfPresentingIllness': 'text',
      'physicalExamination': 'text',
      'diagnosis': 'text',
      'plan': 'text'
    };
    return dataTypes[field] || 'text';
  };

  // Helper function to map frontend field names to backend nested structure
  const mapFieldForBackend = (frontendField: string): string => {
    const fieldMapping: { [key: string]: string } = {
      // Patient Information - nested structure
      'patientAge': 'patientInformation.age',
      'patientGender': 'patientInformation.gender',
      'patientName': 'patientInformation.name',
      
      // Vital Signs - nested structure  
      'temperature': 'vitalSigns.temperature',
      'pulseRate': 'vitalSigns.pulseRate',
      'bloodPressure': 'vitalSigns.bloodPressure',
      'respiratoryRate': 'vitalSigns.respiratoryRate',
      'oxygenSaturation': 'vitalSigns.oxygenSaturation',
      'glucose': 'vitalSigns.glucose',
      
      // Medical Content - direct fields
      'chiefComplaint': 'chiefComplaint',
      'historyOfPresentingIllness': 'historyOfPresentingIllness',
      'pastMedicalHistory': 'pastMedicalHistory',
      'physicalExamination': 'physicalExamination',
      'diagnosis': 'diagnosis',
      'plan': 'plan',
      
      // Other fields
      'age': 'patientInformation.age', // Map 'age' to nested structure
      'name': 'patientInformation.name',
      'gender': 'patientInformation.gender'
    };
    
    return fieldMapping[frontendField] || frontendField;
  };

  // Helper function to get the exact database field name for the AI prompt
  const getExactFieldName = (sectionName: string): string => {
    const exactFieldMapping: { [key: string]: string } = {
      'Patient Name': 'patientName',
      'Patient Age': 'patientAge',
      'Patient Gender': 'patientGender',
      'Chief Complaint': 'chiefComplaint',
      'History of Present Illness': 'historyOfPresentingIllness',
      'Past Medical History': 'pastMedicalHistory',
      'Physical Examination': 'physicalExamination',
      'Assessment/Diagnosis': 'diagnosis',
      'Management Plan': 'plan',
      'Temperature': 'temperature',
      'Pulse Rate': 'pulseRate',
      'Blood Pressure': 'bloodPressure',
      'Respiratory Rate': 'respiratoryRate',
      'Oxygen Saturation': 'oxygenSaturation',
      'Glucose': 'glucose'
    };
    
    return exactFieldMapping[sectionName] || sectionName;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudio(audioBlob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success(`Recording ${sectionName}... Speak clearly and specify the field you want to edit.`, {
        duration: 4000
      })
    } catch (error) {
      // Error starting recording
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Validate noteId before proceeding
      if (!noteId || noteId.trim() === '') {
        toast.error('Note ID is missing. Cannot proceed with voice editing.');
        return;
      }
      
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      
      const formData = new FormData();
      formData.append('noteId', noteId);
      formData.append('audio', audioFile);
      formData.append('fieldToEdit', getExactFieldName(sectionName)); // Send exact database field name
      formData.append('fieldContext', `EDITING: ${sectionName} (field: ${getExactFieldName(sectionName)}) - Current value: ${currentValue}`); // More specific context
      formData.append('expectedDataType', getExpectedDataType(sectionField)); // Add expected data type
      formData.append('instruction', `Please update ONLY the ${sectionName} field. Do not modify any other fields.`); // Clear instruction

      const response = await apiClient.submitVoiceEdit(formData);

      if (response.success && response.data) {
        // Validate that the backend updated the correct field
        const expectedField = getExactFieldName(sectionName);
        if (response.data.fieldEdited !== expectedField) {
          // Show detailed error message with retry option
          const errorMessage = `Backend updated ${response.data.fieldEdited} instead of ${sectionName}. This suggests the AI misunderstood your voice command.`;
          
          // Ask user if they want to retry
          toast.error(`${errorMessage} Please try again with a clearer voice command.`, {
            duration: 5000,
            action: {
              label: 'Retry',
              onClick: () => {
                toast.info('Click the microphone again and speak clearly');
              }
            }
          });
          
          return;
        }
        
        // Validate data type for numeric fields
        if (getExpectedDataType(sectionField) === 'number') {
          const numericValue = parseFloat(response.data.editedText);
          if (isNaN(numericValue)) {
            toast.error(`${sectionName} should be a number. Got: "${response.data.editedText}"`);
            return;
          }
        }
        
        // Check if the edited text is actually different
        if (response.data.editedText === currentValue) {
          toast.warning(`${sectionName} value unchanged. Voice command may not have been processed correctly.`);
          return;
        }
        
        onUpdate(response.data.editedText);
        toast.success(`${sectionName} updated successfully!`);
        
        // Voice input now works like manual typing - no auto-save
        // Changes are stored in editedNote state and saved when user clicks "Save Changes"
      } else {
        // Show the actual backend error message
        let errorMessage = `Failed to update ${sectionName}. Please try again.`;
        
        if (response.error) {
          errorMessage = response.error;
        } else if (response.message) {
          errorMessage = response.message;
        } else if (response.details) {
          errorMessage = response.details;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(`An error occurred while updating ${sectionName}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else if (!isProcessing) {
      startRecording()
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 hover:bg-blue-50 ${className}`}
      title={isRecording ? `Stop recording ${sectionName}` : `Record ${sectionName}`}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4 text-red-600" />
      ) : (
        <Mic className="h-4 w-4 text-blue-600" />
      )}
    </Button>
  )
}