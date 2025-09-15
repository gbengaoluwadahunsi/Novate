"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/hooks/use-subscription"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Mic,
  Upload,
  FileAudio,
  Zap
} from "lucide-react"
import AudioUpload from "@/components/audio-upload"

interface SubscriptionAudioUploadProps {
  onTranscriptionComplete?: (noteId: string, recordingId?: string) => void
  onRecordingComplete?: (noteId: string, recordingId?: string) => void
  onAddToQueue?: (recording: any) => void
  disabled?: boolean
  patientInfo?: any
  createdNoteId?: string
}

export default function SubscriptionAudioUpload({
  onTranscriptionComplete,
  onRecordingComplete,
  onAddToQueue,
  disabled = false,
  patientInfo,
  createdNoteId
}: SubscriptionAudioUploadProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    isPaidSubscriber, 
    transcriptionCount, 
    needsUpgrade, 
    canTranscribe,
    handlePaymentRequired,
    incrementTranscriptionCount
  } = useSubscription()

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)

  // Enhanced transcription handler with subscription checks
  const handleTranscriptionComplete = useCallback(async (noteId: string, recordingId?: string) => {
    try {
      // Increment transcription count for free users
      if (!isPaidSubscriber) {
        incrementTranscriptionCount()
      }

      // Call the original handler
      if (onTranscriptionComplete) {
        onTranscriptionComplete(noteId, recordingId)
      }

      // Show success message
      toast({
        title: "🎉 Transcription Complete!",
        description: isPaidSubscriber 
          ? "Your audio has been transcribed successfully."
          : `Transcription complete! ${Math.max(0, 1 - transcriptionCount - 1)} free transcription${Math.max(0, 1 - transcriptionCount - 1) !== 1 ? 's' : ''} remaining.`,
        duration: 5000,
      })
    } catch (error) {
      console.error('Error in transcription completion handler:', error)
    }
  }, [isPaidSubscriber, transcriptionCount, onTranscriptionComplete, incrementTranscriptionCount, toast])

  // Enhanced recording handler
  const handleRecordingComplete = useCallback(async (noteId: string, recordingId?: string) => {
    try {
      // Increment transcription count for free users
      if (!isPaidSubscriber) {
        incrementTranscriptionCount()
      }

      // Call the original handler
      if (onRecordingComplete) {
        onRecordingComplete(noteId, recordingId)
      }
    } catch (error) {
      console.error('Error in recording completion handler:', error)
    }
  }, [isPaidSubscriber, onRecordingComplete, incrementTranscriptionCount])

  // Enhanced queue handler
  const handleAddToQueue = useCallback(async (recording: any) => {
    try {
      // Check subscription limits before adding to queue
      if (!canTranscribe) {
        toast({
          title: "Subscription Required",
          description: "You have reached the limit for free transcriptions. Please upgrade to continue.",
          variant: "destructive",
          action: {
            label: "Upgrade Now",
            onClick: () => router.push('/pricing')
          }
        })
        return
      }

      // Call the original handler
      if (onAddToQueue) {
        onAddToQueue(recording)
      }
    } catch (error) {
      console.error('Error in queue handler:', error)
    }
  }, [canTranscribe, onAddToQueue, toast, router])

  // Handle API errors with subscription checks
  const handleApiError = useCallback((error: any, response?: any) => {
    // Check for 402 Payment Required
    if (response?.status === 402 || error?.code === 'PAYMENT_REQUIRED') {
      handlePaymentRequired(response?.data || error)
      return true
    }
    return false
  }, [handlePaymentRequired])

  // Show upgrade prompt for free users who have reached their limit
  if (needsUpgrade) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-amber-800">Transcription Limit Reached</CardTitle>
          <CardDescription className="text-amber-700">
            You have used your free transcription allowance. Upgrade to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <div className="font-medium">Free Plan Usage</div>
                <div className="text-sm">
                  You have completed <strong>{transcriptionCount}</strong> transcription{transcriptionCount !== 1 ? 's' : ''}.
                </div>
                <Progress value={100} className="h-2" />
                <div className="text-xs text-amber-600">Limit reached</div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show subscription status for free users
  const remainingTranscriptions = Math.max(0, 1 - transcriptionCount)
  const transcriptionProgress = (transcriptionCount / 1) * 100

  return (
    <div className="space-y-4">
      {/* Subscription Status Banner */}
      {!isPaidSubscriber && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Free Plan</div>
                <div className="text-sm">
                  {remainingTranscriptions} transcription{remainingTranscriptions !== 1 ? 's' : ''} remaining
                </div>
                <Progress value={transcriptionProgress} className="h-1 w-32" />
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/pricing')}
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Premium Status Banner */}
      {isPaidSubscriber && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Premium Plan</div>
                <div className="text-sm">Unlimited transcriptions</div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Audio Upload Component */}
      <AudioUpload
        onTranscriptionComplete={handleTranscriptionComplete}
        onRecordingComplete={handleRecordingComplete}
        onAddToQueue={handleAddToQueue}
        disabled={disabled || !canTranscribe}
        patientInfo={patientInfo}
        createdNoteId={createdNoteId}
      />

      {/* Upgrade Prompt for Free Users */}
      {!isPaidSubscriber && remainingTranscriptions > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Unlock Premium Features</span>
              </div>
              <Button 
                onClick={() => router.push('/pricing')}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
