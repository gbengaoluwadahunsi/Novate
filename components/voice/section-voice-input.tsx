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
  className?: string
}

export default function SectionVoiceInput({
  noteId,
  sectionName,
  sectionField,
  currentValue,
  onUpdate,
  className = ''
}: SectionVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
      toast.success(`Recording ${sectionName}...`)
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
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      
      const formData = new FormData();
      formData.append('noteId', noteId);
      formData.append('audio', audioFile);
      formData.append('fieldToEdit', sectionField);

      const response = await apiClient.submitVoiceEdit(formData);

      if (response.success && response.data) {
        onUpdate(response.data.editedText);
        toast.success(`${sectionName} updated successfully via voice edit.`);
      } else {
        toast.error(response.error || 'Failed to process voice edit. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during voice editing. Please try again.');
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