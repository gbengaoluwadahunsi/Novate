"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Square, 
  Play, 
  Loader2,
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FieldVoiceEditorProps {
  noteId: string;
  fieldName: string;
  fieldLabel: string;
  onEditComplete?: (result: { 
    success: boolean;
    message: string;
    editedField: string; 
    editedText: string;
    action: 'replace' | 'append' | 'delete';
  }) => void;
  onClose?: () => void;
  className?: string;
}

export default function FieldVoiceEditor({ 
  noteId, 
  fieldName, 
  fieldLabel, 
  onEditComplete, 
  onClose,
  className = "" 
}: FieldVoiceEditorProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Store timer reference
      (recorder as any).timer = timer;
      
    } catch (error) {
      // Error starting recording
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      // Clear timer
      if ((mediaRecorder as any).timer) {
        clearInterval((mediaRecorder as any).timer);
      }
    }
  };

  const submitVoiceEdit = async () => {
    if (!recordedAudio) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('noteId', noteId);
      formData.append('audio', recordedAudio, 'voice_edit.webm');
      formData.append('fieldToEdit', fieldName);

      const { apiClient } = await import('@/lib/api-client');
      const response = await apiClient.submitVoiceEdit(formData);
      
      if (response.success && response.data) {
        const { editedField, editedText, action } = response.data;
        
        const actionText = action === 'replace' ? 'Updated' : action === 'append' ? 'Added to' : 'Cleared';
        toast({
          title: `${actionText} ${fieldLabel}`,
          description: `${actionText}: "${editedText.substring(0, 50)}${editedText.length > 50 ? '...' : ''}"`,
        });
        
        if (onEditComplete) {
          onEditComplete(response.data);
        }
        
        // Close the editor
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.error || 'Voice edit failed');
      }
    } catch (error) {
      // Error submitting voice edit
      
      let errorMessage = 'Failed to process voice command.';
      
      if (error instanceof Error) {
        if (error.message.includes('Unexpected token')) {
          errorMessage = 'Voice editing service is not available. Please try again later.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Voice Edit Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Mic className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Voice Edit: {fieldLabel}</span>
          <Badge variant="outline" className="text-xs">AI-Powered</Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-3">
          {!isRecording && !recordedAudio && (
            <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
              </div>
              <Button onClick={stopRecording} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          )}
          
          {recordedAudio && !isProcessing && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Recording ready</span>
              <Button onClick={submitVoiceEdit} className="bg-blue-600 hover:bg-blue-700">
                Apply Edit
              </Button>
              <Button 
                onClick={() => setRecordedAudio(null)} 
                variant="outline"
                size="sm"
              >
                Re-record
              </Button>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing voice command...</span>
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Quick Examples for {fieldLabel}:</h5>
          <div className="text-xs text-gray-600 space-y-1">
            {fieldName === 'chiefComplaint' && (
              <>
                <div>• "Change to severe chest pain for 2 hours"</div>
                <div>• "Add shortness of breath to the complaint"</div>
              </>
            )}
            {fieldName === 'temperature' && (
              <>
                <div>• "Set temperature to 38.5 degrees"</div>
                <div>• "Update to 101.3 Fahrenheit"</div>
              </>
            )}
            {fieldName === 'bloodPressure' && (
              <>
                <div>• "Blood pressure is 140 over 90"</div>
                <div>• "Update BP to 120/80"</div>
              </>
            )}
            {fieldName === 'physicalExamination' && (
              <>
                <div>• "Add lungs clear to auscultation"</div>
                <div>• "Include heart sounds normal"</div>
              </>
            )}
            {!['chiefComplaint', 'temperature', 'bloodPressure', 'physicalExamination'].includes(fieldName) && (
              <>
                <div>• "Change to [your content]"</div>
                <div>• "Add [additional information]"</div>
                <div>• "Remove this field"</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
