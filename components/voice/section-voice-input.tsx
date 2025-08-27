'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface SectionVoiceInputProps {
  sectionName: string
  sectionField: string
  currentValue: string
  onUpdate: (newValue: string) => void
  className?: string
}

export default function SectionVoiceInput({
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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

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

  const pollTranscriptionStatus = async (jobId: string) => {
    try {
      const response = await apiClient.getTranscriptionResult(jobId)
      if (response.success && response.data) {
        const result = response.data
        if (result.status === 'COMPLETED') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null

          if (result.transcript) {
            onUpdate(result.transcript)
            toast.success(`${sectionName} updated successfully`)
          } else {
            toast.error('No speech detected. Please try again.')
          }
          setIsProcessing(false)
        } else if (result.status === 'FAILED') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          toast.error('Failed to process audio. Please try again.')
          setIsProcessing(false)
        }
      } else {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        toast.error(
          'Failed to get transcription status. Please try again.'
        )
        setIsProcessing(false)
      }
    } catch (error) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      toast.error('Error polling transcription status. Please try again.')
      setIsProcessing(false)
    }
  }

  const startPolling = (jobId: string) => {
    pollingIntervalRef.current = setInterval(() => {
      pollTranscriptionStatus(jobId)
    }, 2000)
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const response = await apiClient.startTranscription(
        audioFile,
        undefined,
        undefined,
        sectionField,
        currentValue
      )

      if (response.success && response.data?.jobId) {
        startPolling(response.data.jobId)
      } else {
        toast.error('Failed to start transcription. Please try again.')
        setIsProcessing(false)
      }
    } catch (error) {
      toast.error('Failed to process audio. Please try again.')
      setIsProcessing(false)
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