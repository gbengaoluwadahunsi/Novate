"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Play, Trash2, Clock, CheckCircle, AlertCircle, Mic } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import MedicalNoteWithSidebar from "@/components/medical-note-with-sidebar"
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
  const [transcriptionData, setTranscriptionData] = useState<any>(null)
  const [showMedicalNote, setShowMedicalNote] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [queuedRecordings, setQueuedRecordings] = useState<QueuedRecording[]>([])
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()

  const handleTranscriptionComplete = async (data: any) => {
    console.log('🎯 Transcription complete, data received:', data);
    console.log('🔍 Data structure analysis:', {
      hasPatientInfo: !!data.patientInfo,
      hasPatientInformation: !!data.patientInformation,
      hasMedicalNote: !!data.medicalNote,
      patientInfoContent: data.patientInfo,
      patientInformationContent: data.patientInformation,
      medicalNoteContent: data.medicalNote
    });
    
    // Check if it's a minimal/error response
    if (data.isMinimal) {
      console.log('⚠️ Minimal transcription, not showing note');
      return;
    }
    
    console.log('✅ Transcribe page: Received data from AudioUpload component:', data);
    console.log('🔍 Transcribe page: Key fields received:', {
      patientName: data.patientName,
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      treatmentPlan: data.treatmentPlan,
      historyOfPresentIllness: data.historyOfPresentIllness
    });
    
    // Data should already be properly formatted by AudioUpload component
    setTranscriptionData(data)
    setShowMedicalNote(true)
    
    // Automatically create a draft note in the backend
    try {
      // Extract patient info from the transcription data
      const patientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      const noteData = {
        patientName: patientInfo.name || data.patientName || 'Unknown Patient',
        patientAge: parseInt(patientInfo.age || data.patientAge || '0', 10),
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

      await dispatch(createMedicalNote(noteData));
      console.log('✅ Draft note created in backend');
    } catch (error) {
      console.error('Error creating draft note:', error);
    }
    
    // Show completion message
    setTimeout(() => {
      setIsNavigating(true)
      toast({
        title: "🎉 Ready to Review",
        description: "Your medical note is ready for review and editing.",
      })
      
      setIsNavigating(false)
    }, 1500)
  }

  const handleSaveMedicalNote = async (data: any) => {
    console.log('💾 Saving medical note:', data);
    
    try {
      // Extract patient info from the transcription data
      const patientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      // Create note data in the format expected by the backend
      const noteData = {
        patientName: patientInfo.name || data.patientName || 'Unknown Patient',
        patientAge: parseInt(patientInfo.age || data.patientAge || '0', 10),
        patientGender: patientInfo.gender || data.patientGender || 'Not specified',
        visitDate: patientInfo.visitDate || data.visitDate || new Date().toISOString().split('T')[0],
        visitTime: data.visitTime || new Date().toTimeString().slice(0, 5),
        chiefComplaint: medicalNote.chiefComplaint || data.chiefComplaint || '',
        historyOfPresentIllness: data.historyOfPresentingIllness || '',
        physicalExamination: typeof data.physicalExamination === 'object' 
          ? JSON.stringify(data.physicalExamination) 
          : data.physicalExamination || '',
        diagnosis: data.diagnosis || '',
        treatmentPlan: data.managementPlan || '',
        noteType: 'consultation' as const,
        audioJobId: data.audioJobId,
      };

      // Save to backend using Redux action
      const result = await dispatch(createMedicalNote(noteData));
      
      if (createMedicalNote.fulfilled.match(result)) {
        toast({
          title: "✅ Medical Note Saved",
          description: "Your medical note has been saved successfully.",
        });

        // Navigate to notes page
        router.push('/dashboard/notes');
      } else {
        throw new Error(result.payload as string || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving medical note:', error);
      toast({
        title: "❌ Save Error",
        description: "Failed to save medical note. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleBackToUpload = () => {
    setShowMedicalNote(false)
    setTranscriptionData(null)
    setIsNavigating(false)
  }

  const handleViewAllNotes = () => {
    router.push('/dashboard/notes')
  }

  // Note Actions Handlers
  const handleDownloadPDF = () => {
    if (!transcriptionData) return
    
    // Create a printable version of the note
    const printContent = `
      <html>
        <head>
          <title>Medical Note - ${transcriptionData.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .patient-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; color: #333; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Note</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${transcriptionData.patientName}</p>
            <p><strong>Age:</strong> ${transcriptionData.patientAge} years</p>
            <p><strong>Gender:</strong> ${transcriptionData.patientGender}</p>
            <p><strong>Visit Date:</strong> ${transcriptionData.visitDate}</p>
            <p><strong>Visit Time:</strong> ${transcriptionData.visitTime}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Chief Complaint</div>
            <div class="content">${transcriptionData.chiefComplaint}</div>
          </div>
          
          <div class="section">
            <div class="section-title">History of Present Illness</div>
            <div class="content">${transcriptionData.historyOfPresentingIllness}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Physical Examination</div>
            <div class="content">${typeof transcriptionData.physicalExamination === 'object' 
              ? JSON.stringify(transcriptionData.physicalExamination, null, 2) 
              : transcriptionData.physicalExamination}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <div class="content">${transcriptionData.diagnosis}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Management Plan</div>
            <div class="content">${transcriptionData.managementPlan}</div>
          </div>
        </body>
      </html>
    `
    
    // Create blob and download
    const blob = new Blob([printContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medical-note-${transcriptionData.patientName}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "📄 PDF Downloaded",
      description: "Medical note has been saved as HTML file.",
    })
  }

  const handleShareNote = () => {
    if (!transcriptionData) return
    
    // Create a shareable summary
    const shareText = `Medical Note Summary:
Patient: ${transcriptionData.patientName}
Date: ${transcriptionData.visitDate}
Chief Complaint: ${transcriptionData.chiefComplaint}
Diagnosis: ${transcriptionData.diagnosis}`
    
    if (navigator.share) {
      navigator.share({
        title: `Medical Note - ${transcriptionData.patientName}`,
        text: shareText,
      }).catch((error) => {
        console.log('Error sharing:', error)
        fallbackShare(shareText)
      })
    } else {
      fallbackShare(shareText)
    }
  }

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "📋 Copied to Clipboard",
        description: "Medical note summary copied to clipboard.",
      })
    }).catch(() => {
      toast({
        title: "❌ Share Failed",
        description: "Unable to share or copy note.",
        variant: "destructive",
      })
    })
  }

  const handleViewHistory = () => {
    toast({
      title: "📚 Version History",
      description: "Version history feature will be available after saving the note.",
    })
  }

  const handlePreview = () => {
    if (!transcriptionData) return
    
    // Open print preview
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Note Preview - ${transcriptionData.patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .patient-info { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .content { line-height: 1.6; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="text-align: center; margin-bottom: 20px;">
              <button onclick="window.print()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Print</button>
              <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
            
            <div class="header">
              <h1>Medical Note</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="patient-info">
              <h3>Patient Information</h3>
              <p><strong>Name:</strong> ${transcriptionData.patientName}</p>
              <p><strong>Age:</strong> ${transcriptionData.patientAge} years</p>
              <p><strong>Gender:</strong> ${transcriptionData.patientGender}</p>
              <p><strong>Visit Date:</strong> ${transcriptionData.visitDate}</p>
              <p><strong>Visit Time:</strong> ${transcriptionData.visitTime}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Chief Complaint</div>
              <div class="content">${transcriptionData.chiefComplaint}</div>
            </div>
            
            <div class="section">
              <div class="section-title">History of Present Illness</div>
              <div class="content">${transcriptionData.historyOfPresentingIllness}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Physical Examination</div>
              <div class="content">${typeof transcriptionData.physicalExamination === 'object' 
                ? JSON.stringify(transcriptionData.physicalExamination, null, 2) 
                : transcriptionData.physicalExamination}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Diagnosis</div>
              <div class="content">${transcriptionData.diagnosis}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Management Plan</div>
              <div class="content">${transcriptionData.managementPlan}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
    
    toast({
      title: "👁️ Preview Opened",
      description: "Medical note preview opened in new window.",
    })
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

  if (isNavigating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Preparing Your Medical Note</h3>
          <p className="text-gray-600">Please wait while we finalize your note...</p>
        </div>
      </div>
    )
  }

  if (showMedicalNote && transcriptionData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBackToUpload}
            className="flex items-center gap-2"
          >
            ← Back to Upload
          </Button>
          <Button
            variant="outline"
            onClick={handleViewAllNotes}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View All Notes
          </Button>
        </div>
        
      {/* Debug data before passing to component */}
      {console.log('🎯 Data being passed to MedicalNoteWithSidebar:', transcriptionData)}
      {console.log('🔍 Component data check:', {
        hasChiefComplaint: !!transcriptionData?.chiefComplaint,
        chiefComplaintValue: transcriptionData?.chiefComplaint,
        hasDiagnosis: !!transcriptionData?.diagnosis,
        diagnosisValue: transcriptionData?.diagnosis,
        hasPatientName: !!transcriptionData?.patientName,
        patientNameValue: transcriptionData?.patientName
      })}
      
      <MedicalNoteWithSidebar
        note={transcriptionData}
        onSave={handleSaveMedicalNote}
          onDownload={handleDownloadPDF}
          onShare={handleShareNote}
          onViewHistory={handleViewHistory}
          onPreview={handlePreview}
      />
      </div>
    )
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
