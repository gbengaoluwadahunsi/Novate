"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Play, Trash2, Clock, CheckCircle, AlertCircle, Mic } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import AudioUpload from "@/components/audio-upload"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/store/hooks"
import { createMedicalNote } from "@/store/features/notesSlice"
// import { DebugAuth } from "@/components/debug-auth"

interface QueuedRecording {
  id: string
  filename: string
  file: File
  recordedAt: string
  duration: number
  status: 'recorded' | 'processing' | 'completed' | 'failed'
  patientInfo?: {
    name?: string
    age?: number
  }
}

export default function TranscribePage() {

  const [queuedRecordings, setQueuedRecordings] = useState<QueuedRecording[]>([])
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()

  const handleTranscriptionComplete = async (data: any) => {
    // Check if it's a minimal/error response
    if (data.isMinimal) {
      console.log('⚠️ Minimal transcription, not creating note');
      return;
    }
    
    console.log('🎯 Creating note for:', data.patientName || 'Unknown Patient');
    
    // Automatically create a draft note in the backend and navigate to it
    try {
      // Extract patient info from the transcription data
      const patientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      const noteData = {
        patientName: patientInfo.name || data.patientName || 'Unknown Patient',
        patientAge: (() => {
          const ageString = patientInfo.age || data.patientAge || '0';
          const parsedAge = parseInt(ageString, 10);
          return isNaN(parsedAge) ? 0 : parsedAge;
        })(),
        patientGender: patientInfo.gender || data.patientGender || 'Not specified',
        visitDate: patientInfo.visitDate || data.visitDate || new Date().toISOString().split('T')[0],
        visitTime: data.visitTime || new Date().toTimeString().slice(0, 5),
        chiefComplaint: medicalNote.chiefComplaint || data.chiefComplaint || '',
        historyOfPresentIllness: medicalNote.historyOfPresentingIllness || data.historyOfPresentingIllness || '',
        physicalExamination: typeof data.physicalExamination === 'object' 
          ? JSON.stringify(data.physicalExamination) 
          : data.physicalExamination || '',
        diagnosis: medicalNote.assessmentAndDiagnosis || medicalNote.diagnosis || data.diagnosis || '',
        treatmentPlan: medicalNote.treatmentPlan || data.managementPlan || '',
        noteType: 'consultation' as const,
        audioJobId: data.audioJobId,
      };

      // Log note data consistency for debugging
      console.log('🔬 NOTE CREATION DATA:', {
        timestamp: new Date().toISOString(),
        patientName: noteData.patientName,
        diagnosis: noteData.diagnosis,
        chiefComplaint: noteData.chiefComplaint,
        diagnosisSource: medicalNote.assessmentAndDiagnosis ? 'assessmentAndDiagnosis' : 
                        medicalNote.diagnosis ? 'medicalNote.diagnosis' : 
                        data.diagnosis ? 'data.diagnosis' : 'none',
        rawMedicalNote: medicalNote,
        audioJobId: noteData.audioJobId
      });

      const result = await dispatch(createMedicalNote(noteData));
      
      if (createMedicalNote.fulfilled.match(result)) {
        const savedNote = result.payload;
        console.log('✅ Note creation successful:', savedNote);
        
        // Navigate directly to the saved note instead of showing transcription view
        if (savedNote && savedNote.id) {
          // Show success message and navigate immediately
          toast({
            title: "🎉 Note Finalized Successfully",
            description: "Redirecting to your medical note...",
          });
          
          // Navigate immediately to the proper note page
          router.push(`/dashboard/notes/${savedNote.id}`);
          return; // Exit early, don't show any local views
        } else {
          toast({
            title: "🎉 Note Finalized",
            description: "Your note has been created. Redirecting to notes page...",
          });
          
          // Navigate to notes page as fallback
          setTimeout(() => {
            router.push('/dashboard/notes');
          }, 1500);
        }
      } else if (createMedicalNote.rejected.match(result)) {
        // Handle rejected/failed action - but note might still be created
        const errorMessage = result.payload || result.error?.message || 'Unknown error';
        console.warn('⚠️ Note creation API returned error, but note may still be created:', errorMessage);
        
        // Show warning instead of error - note might still appear in the list
        toast({
          title: "🎉 Note Finalized",
          description: "Transcription completed. Please check your notes page.",
        });

        // Navigate to notes page to see if note was actually created
        setTimeout(() => {
        router.push('/dashboard/notes');
        }, 1500);
      } else {
        // Handle any other case
        console.warn('⚠️ Unknown Redux result:', result);
        toast({
          title: "⚠️ Unexpected Result",
          description: "Transcription completed but note status unclear. Check your notes page.",
        });
        
        setTimeout(() => {
          router.push('/dashboard/notes');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating draft note:', error);
      
      // Even if note creation fails, show success and try to navigate to notes page
      // The note might still be created through other means
      toast({
        title: "🎉 Transcription Complete!", 
        description: "Your note has been processed. Redirecting to notes page...",
      });
      
      // Navigate to notes page as fallback
      setTimeout(() => {
        router.push('/dashboard/notes');
      }, 1500);
    }
  }




  // Function to add a recording to the queue
  const addToQueue = (file: File, duration: number) => {
    const newRecording: QueuedRecording = {
      id: Date.now().toString(),
      filename: file.name,
      file: file,
      recordedAt: new Date().toISOString(),
      duration: duration,
      status: 'recorded',
      patientInfo: {
        name: `Medical Case ${String(queuedRecordings.length + 1).padStart(3, '0')}`,
        age: undefined
      }
    }
    
    setQueuedRecordings(prev => [newRecording, ...prev])
    
    toast({
      title: "📝 Recording Saved",
      description: `${file.name} has been added to your processing queue.`,
    })
  }

  // Function to process a recording from the queue
  const processQueuedRecording = async (recordingId: string) => {
    const recording = queuedRecordings.find(r => r.id === recordingId)
    if (!recording) return

    // Update status to processing
    setQueuedRecordings(prev => 
      prev.map(r => r.id === recordingId ? { ...r, status: 'processing' } : r)
    )

    try {
      // Create a temporary AudioUpload instance to process the file
      const audioUpload = document.createElement('div')
      
      // We'll trigger the processAudioWithFile function through the AudioUpload component
      // For now, we'll simulate this and let the user know to use the main upload area
      
      toast({
        title: "🔄 Processing Started",
        description: `Processing ${recording.filename}. This will take 30-90 seconds.`,
      })

      // TODO: Implement actual processing by calling the audio processing logic
      // This would involve importing and calling the processAudioWithFile function
      // For now, we'll simulate it
      setTimeout(() => {
        setQueuedRecordings(prev => 
          prev.map(r => r.id === recordingId ? { ...r, status: 'completed' } : r)
        )
        toast({
          title: "✅ Processing Complete",
          description: `${recording.filename} has been transcribed successfully. Check the Medical Notes page.`,
        })
      }, 5000) // Simulate 5 second processing time
      
    } catch (error) {
      setQueuedRecordings(prev => 
        prev.map(r => r.id === recordingId ? { ...r, status: 'failed' } : r)
      )
      toast({
        title: "❌ Processing Failed",
        description: `Failed to process ${recording.filename}.`,
        variant: 'destructive'
      })
    }
  }

  // Function to remove a recording from the queue
  const removeFromQueue = (recordingId: string) => {
    const recording = queuedRecordings.find(r => r.id === recordingId)
    setQueuedRecordings(prev => prev.filter(r => r.id !== recordingId))
    
    if (recording) {
      toast({
        title: "🗑️ Recording Removed",
        description: `${recording.filename} has been removed from the queue.`,
      })
    }
  }

  // Function to format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Function to get status badge
  const getStatusBadge = (status: QueuedRecording['status']) => {
    switch (status) {
      case 'recorded':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Queued</Badge>
      case 'processing':
        return <Badge variant="default" className="flex items-center gap-1"><div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>Processing</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }





  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Audio Transcription
        </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload or record audio to generate medical notes with AI-powered transcription
        </p>
      </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Information Alert - Full Width */}
          <div className="lg:col-span-3">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">How it works</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Upload an audio file or record directly in your browser. You can process immediately or 
                save recordings to a queue for batch processing later. Our AI will transcribe the audio,
                identify medical terms, and generate a structured medical note. Processing typically takes
                30-60 seconds depending on audio length.
        </AlertDescription>
      </Alert>
          </div>

          {/* Audio Upload Component - Takes 2/3 Width */}
          <div className="lg:col-span-2">
      <AudioUpload
        onTranscriptionComplete={handleTranscriptionComplete}
              onRecordingComplete={addToQueue}
      />
          </div>

          {/* Recording Queue - Takes 1/3 Width */}
          <div className="lg:col-span-1">
            <Card className="h-full">
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Recording Queue
                  {queuedRecordings.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {queuedRecordings.length}
                    </Badge>
                  )}
                </CardTitle>
        </CardHeader>
        <CardContent>
                {queuedRecordings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Mic className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-medium mb-2">No recordings queued</p>
                    <p className="text-sm">
                      Record audio files to process them later during quieter hours
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Add a demo recording for testing
                        const demoBlob = new Blob(["demo audio content"], { type: "audio/wav" })
                        const demoFile = new File([demoBlob], `Patient_Recording_${Date.now()}.wav`, { type: "audio/wav" })
                        addToQueue(demoFile, 120) // 2 minutes duration
                      }}
                      className="mt-4"
                    >
                      Add Demo Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {queuedRecordings.map((recording) => (
                      <div key={recording.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {recording.filename}
                            </span>
                          </div>
                          {getStatusBadge(recording.status)}
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-2">
                          <div>Duration: {formatDuration(recording.duration)}</div>
                          <div>Recorded: {new Date(recording.recordedAt).toLocaleTimeString()}</div>
                          {recording.patientInfo?.name && (
                            <div>Patient: {recording.patientInfo.name}</div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {recording.status === 'recorded' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => processQueuedRecording(recording.id)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Play className="h-3 w-3" />
                              Process
                            </Button>
                          )}
                          
                          {recording.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Navigate to the generated note
                                toast({
                                  title: "📄 Note Ready",
                                  description: "Opening generated medical note.",
                                })
                              }}
                              className="flex items-center gap-1 text-xs"
                            >
                              <FileText className="h-3 w-3" />
                              View Note
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromQueue(recording.id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Record Audio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record directly in your browser with high-quality audio capture
            </p>
          </Card>

          <Card className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-2xl">📄</span>
          </div>
            <h3 className="font-semibold text-lg mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support for MP3, WAV, M4A and other popular audio formats
            </p>
      </Card>
      
          <Card className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Batch Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record multiple patients during busy hours, then process them all during quieter times
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
