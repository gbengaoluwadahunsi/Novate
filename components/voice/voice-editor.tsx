"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause,
  Upload,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceEditorProps {
  noteId: string;
  targetField?: string; // Optional: specify which field to edit
  onEditComplete?: (result: { 
    success: boolean;
    message: string;
    editedField: string; 
    editedText: string;
    action: 'replace' | 'append' | 'delete';
  }) => void;
  className?: string;
}

interface VoiceEditingStatus {
  voiceEditingEnabled: boolean;
  supportedFormats: string[];
  maxFileSize: number;
  supportedFields: string[];
}

export default function VoiceEditor({ noteId, targetField, onEditComplete, className = "" }: VoiceEditorProps) {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<VoiceEditingStatus | null>(null);

  // ✅ Actual backend supported fields
  const supportedFields = [
    // Patient Information
    { value: 'patientName', label: 'Patient Name', category: 'Patient Info' },
    { value: 'patientAge', label: 'Patient Age', category: 'Patient Info' },
    { value: 'patientGender', label: 'Patient Gender', category: 'Patient Info' },
    
    // Medical Content
    { value: 'chiefComplaint', label: 'Chief Complaint', category: 'Medical Content' },
    { value: 'historyOfPresentingIllness', label: 'History of Present Illness', category: 'Medical Content' },
    { value: 'pastMedicalHistory', label: 'Past Medical History', category: 'Medical Content' },
    { value: 'physicalExamination', label: 'Physical Examination', category: 'Medical Content' },
    { value: 'diagnosis', label: 'Diagnosis', category: 'Medical Content' },
    
    // Vital Signs
    { value: 'temperature', label: 'Temperature', category: 'Vital Signs' },
    { value: 'pulseRate', label: 'Pulse Rate', category: 'Vital Signs' },
    { value: 'bloodPressure', label: 'Blood Pressure', category: 'Vital Signs' },
    { value: 'respiratoryRate', label: 'Respiratory Rate', category: 'Vital Signs' },
    { value: 'oxygenSaturation', label: 'Oxygen Saturation', category: 'Vital Signs' }
  ];

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Get voice editing status on component mount
  useEffect(() => {
    const fetchVoiceStatus = async () => {
      try {
        const { apiClient } = await import('@/lib/api-client');
        const response = await apiClient.getVoiceEditingStatus();
        
        if (response.success && response.data) {
          setVoiceStatus(response.data);
        }
      } catch (error) {
        // Error fetching voice status
        toast.error('Failed to fetch voice editing status');
      }
    };

    fetchVoiceStatus();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        // Create audio URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone.",
      });
    } catch (error) {
      // Error starting recording
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "You can now play back or submit your voice command.",
      });
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const submitVoiceEdit = async () => {
    if (!recordedAudio) {
      toast({
        title: "No Recording",
        description: "Please record your voice command first.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit from backend)
    const maxFileSize = voiceStatus?.maxFileSize || 10 * 1024 * 1024; // 10MB default
    if (recordedAudio.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: `Recording must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('noteId', noteId);
      formData.append('audio', recordedAudio, 'voice_edit.webm');
      
      // Add target field if specified (either from prop or selection)
      const fieldToEdit = targetField || selectedField;
      if (fieldToEdit) {
        formData.append('fieldToEdit', fieldToEdit);
      }

      const { apiClient } = await import('@/lib/api-client');
      const response = await apiClient.submitVoiceEdit(formData);
      
      if (response.success && response.data) {
        const { editedField, editedText, action, message } = response.data;
        
        // Show success message with action type
        const actionText = action === 'replace' ? 'Updated' : action === 'append' ? 'Added to' : 'Cleared';
        toast({
          title: `Voice Edit Applied - ${actionText}`,
          description: `${actionText} ${editedField}: "${editedText.substring(0, 50)}${editedText.length > 50 ? '...' : ''}"`,
        });
        
        // Clear recording
        setRecordedAudio(null);
        setAudioUrl(null);
        if (!targetField) { // Only clear selection if not using prop-based targeting
          setSelectedField('');
        }
        
        // Notify parent component
        if (onEditComplete) {
          onEditComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'Voice edit failed');
      }
    } catch (error) {
      // Error submitting voice edit
      toast.error(error instanceof Error ? error.message : "Failed to process voice command. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRecording = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (!voiceStatus) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading voice editing capabilities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!voiceStatus.voiceEditingEnabled) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Voice editing is currently disabled</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5" />
          <span>Voice Edit Medical Note</span>
          {targetField && (
            <Badge className="bg-blue-100 text-blue-800">
              Editing: {supportedFields.find(f => f.value === targetField)?.label || targetField}
            </Badge>
          )}
          <Badge variant="outline">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Field Selector - Only show if not using targetField prop */}
        {!targetField && (
          <div className="space-y-2">
            <Label>Target Field (Optional)</Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect field from voice command" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-detect field</SelectItem>
                {/* Group fields by category */}
                {['Patient Info', 'Medical Content', 'Vital Signs'].map(category => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                      {category}
                    </div>
                    {supportedFields
                      .filter(field => field.category === category)
                      .map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))
                    }
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            {!isRecording && !recordedAudio && (
              <Button onClick={startRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                </div>
                <Button onClick={stopRecording} size="lg" variant="outline">
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                🎤 Recording... Speak your voice command clearly
              </p>
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {recordedAudio && audioUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={playRecording} variant="outline">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
              
              <Button onClick={clearRecording} variant="outline">
                Clear Recording
              </Button>
              
              <Button 
                onClick={submitVoiceEdit} 
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Apply Voice Edit
                  </>
                )}
              </Button>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing voice command...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This may take a few seconds while we transcribe and apply your changes
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Voice Command Examples:</h4>
          
          {/* Replace Commands */}
          <div className="mb-3">
            <h5 className="text-sm font-medium text-green-700 mb-1">Replace Content:</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• "Change the chief complaint to severe chest pain"</li>
              <li>• "Update blood pressure to 140 over 90"</li>
              <li>• "Replace diagnosis with viral upper respiratory infection"</li>
              <li>• "Set temperature to 38.5 degrees Celsius"</li>
            </ul>
          </div>
          
          {/* Append Commands */}
          <div className="mb-3">
            <h5 className="text-sm font-medium text-blue-700 mb-1">Add Content:</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• "Add to history: patient also reports nausea"</li>
              <li>• "Append to physical exam: lungs clear to auscultation"</li>
              <li>• "Include in past medical history: diabetes mellitus"</li>
            </ul>
          </div>
          
          {/* Delete Commands */}
          <div>
            <h5 className="text-sm font-medium text-red-700 mb-1">Clear Content:</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• "Remove the temperature reading"</li>
              <li>• "Clear the physical examination"</li>
              <li>• "Delete the past medical history"</li>
            </ul>
          </div>
        </div>

        {/* Technical Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats: {voiceStatus.supportedFormats.join(', ')}</p>
          <p>Max file size: {Math.round(voiceStatus.maxFileSize / 1024 / 1024)}MB</p>
          <p>Supported fields: {voiceStatus.supportedFields.length} fields</p>
        </div>
      </CardContent>
    </Card>
  );
}
