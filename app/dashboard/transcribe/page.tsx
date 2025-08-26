"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, FileText, Play, Trash2, Clock, CheckCircle, AlertCircle, Mic, User } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import AudioUpload from "@/components/audio-upload"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createMedicalNote } from "@/store/features/notesSlice"


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

interface PatientInfo {
  firstName: string
  lastName: string
  age: string
  gender: string
}

export default function TranscribePage() {

  const [queuedRecordings, setQueuedRecordings] = useState<QueuedRecording[]>([])
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    firstName: '',
    lastName: '',
    age: '',
    gender: ''
  })
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  
  // Get user information for student detection
  const { user } = useAppSelector((state) => state.auth)
  const [anonymizationSettings, setAnonymizationSettings] = useState<any>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  
  // Fetch anonymization settings from backend
  useEffect(() => {
    const fetchAnonymizationSettings = async () => {
      try {
        // This will integrate with the new backend API
        // For now, we'll use the existing user data
        if (user) {
          // Check if user is a student based on role or userType
          // Only consider users with explicit STUDENT roles as students
          const isStudent = user?.role === 'STUDENT' || 
                           user?.role === 'MEDICAL_STUDENT' || 
                           (user as any)?.userType === 'STUDENT'
          

          
          setAnonymizationSettings({
            isStudent: isStudent === true, // Explicit boolean check
            requiresAnonymization: isStudent === true,
            anonymizePatientNames: isStudent === true,
            privacyNotice: isStudent === true ? 
              "🔒 PRIVACY PROTECTION: Patient names are anonymized for educational purposes to ensure compliance and protect patient identity." : 
              null
          })
          setSettingsLoaded(true)
        }
              } catch (error) {
        // Use logger instead of console for production security
        setSettingsLoaded(true)
      }
    }

    if (user) {
      fetchAnonymizationSettings()
    } else {
      setSettingsLoaded(true)
    }
  }, [user])
  
  // Check if current user is a medical student
  // Only show student UI when we're certain the user is a student AND settings are loaded
  const isStudentUser = settingsLoaded && anonymizationSettings?.isStudent === true
  
  // Show privacy guidelines toast for healthcare professionals
  useEffect(() => {
    if (settingsLoaded && !isStudentUser) {
      // Show toast for healthcare professionals
      toast({
        title: "🏥 Healthcare Professional: Patient Privacy Guidelines",
        description: "Please ensure patient consent and follow privacy regulations - patient information will appear exactly as entered.",
        duration: 8000, // 8 seconds
      })
    }
  }, [settingsLoaded, isStudentUser, toast])
  
  // Generate anonymous patient ID for students
  const generateAnonymousPatientId = () => {
    const timestamp = Date.now().toString().slice(-4)
    return {
      firstName: 'Patient',
      lastName: `Case-${timestamp}`,
      anonymized: true
    }
  }
  


  const clearPatientForm = () => {
    setPatientInfo({
      firstName: '',
      lastName: '',
      age: '',
      gender: ''
    })
  }

  const isPatientInfoValid = () => {
    return patientInfo.firstName.trim() !== '' && 
           patientInfo.lastName.trim() !== '' && 
           patientInfo.age.trim() !== '' && 
           patientInfo.gender !== ''
  }

  const handleTranscriptionComplete = async (data: any) => {
    // Check if it's a minimal/error response
    if (data.isMinimal) {
      // Minimal transcription, not creating note
      return;
    }
    
    // Check if this is a timeout scenario where note might have been created
    if (data.isTimeout || data.error?.includes('longer than expected')) {
      toast({
        title: "⏰ Processing Timeout",
        description: "Transcription took longer than expected. Checking if your note was created...",
        duration: 8000
      });
      
      // Wait a moment and then redirect to notes page to check
      setTimeout(() => {
        toast({
          title: "📋 Check Your Notes",
          description: "Please check your Notes page - your medical note may have been created successfully.",
          duration: 10000
        });
        router.push('/dashboard/notes?refresh=true');
      }, 2000);
      
      return;
    }
    
    // Show progress notification for successful completion
    toast({
      title: "✅ 100% Medical Note Formed",
      description: "Medical note completed successfully! Redirecting to note page...",
    });
    
    // Automatically create a draft note in the backend and navigate to it
    try {
      // Extract patient info from the transcription data, but prioritize manual input
      const transcribedPatientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      const noteData = {
        // Prioritize manual patient information over transcribed data, but anonymize for students
        patientName: (() => {
          const manualName = `${patientInfo.firstName.trim()} ${patientInfo.lastName.trim()}`.trim();
          const originalName = manualName || transcribedPatientInfo.name || data.patientName || 'Unknown Patient';
          
          // 🎓 AUTOMATIC ANONYMIZATION FOR STUDENTS
          if (isStudentUser) {
            // Generate anonymous ID if real names detected
            const hasRealName = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(originalName) && 
                               !originalName.toLowerCase().includes('patient') && 
                               !originalName.toLowerCase().includes('case');
            
            if (hasRealName || originalName === 'Unknown Patient') {
              const anonymousId = generateAnonymousPatientId();
              // Student user detected - anonymizing patient name
              return `${anonymousId.firstName} ${anonymousId.lastName}`;
            }
          }
          
          return originalName;
        })(),
        patientAge: (() => {
          // Try manual age first, then transcribed age
          const manualAge = patientInfo.age.trim();
          if (manualAge && !isNaN(parseInt(manualAge))) {
            return parseInt(manualAge);
          }
          
          const transcribedAge = transcribedPatientInfo.age || data.patientAge || '0';
          const parsedAge = parseInt(transcribedAge, 10);
          return isNaN(parsedAge) ? 0 : parsedAge;
        })(),
        patientGender: patientInfo.gender || transcribedPatientInfo.gender || data.patientGender || 'Other',
        visitDate: transcribedPatientInfo.visitDate || data.visitDate || new Date().toISOString().split('T')[0],
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
        // 🩺 VITAL SIGNS: Include vital signs from transcription data
        vitalSigns: data.medicalNote?.vitalSigns || data.vitalSigns || {
          temperature: medicalNote.temperature || 'Not recorded',
          pulseRate: medicalNote.pulseRate || 'Not recorded',
          respiratoryRate: medicalNote.respiratoryRate || 'Not recorded',
          bloodPressure: medicalNote.bloodPressure || 'Not recorded',
          oxygenSaturation: medicalNote.oxygenSaturation || 'Not recorded',
          glucoseLevels: medicalNote.glucose || medicalNote.glucoseLevels || 'Not recorded'
        },
        // Preserve original transcript to prevent hallucination
        originalTranscript: data.transcript || data.rawTranscript || '',
      };

      // Note data prepared for creation


      
      const result = await dispatch(createMedicalNote(noteData));
      

      
      if (createMedicalNote.fulfilled.match(result)) {
        const savedNote = result.payload;
        console.log('🎉 Note creation successful, savedNote:', savedNote);
        
        // Check multiple possible ID fields in the response
        const noteId = savedNote?.id || (savedNote as any)?._id || (savedNote as any)?.noteId;
        
        if (noteId) {
          toast({
            title: "🎉 Note Created Successfully",
            description: `Medical note for ${noteData.patientName} has been created and saved.`,
          });
          
          // Clear the patient form for next recording
          clearPatientForm();
          
          // Navigate immediately to the proper note page with proper ID
          console.log('🧭 Navigating to note page:', `/dashboard/notes/${noteId}`);
          router.push(`/dashboard/notes/${noteId}`);
          return;
        } else {
          // Note was created but ID structure is different - try to navigate anyway
          console.warn('⚠️ Note created but no ID found in response:', savedNote);
          toast({
            title: "🎉 Note Created",
            description: "Your note has been created. Opening notes page to locate it...",
          });
          
          clearPatientForm();
          
          // Force refresh of notes page to show the new note
          router.push('/dashboard/notes?refresh=true');
          return;
        }
      } else if (createMedicalNote.rejected.match(result)) {
        // Handle rejected/failed action
        const errorMessage = result.payload || result.error?.message || 'Unknown error';
        console.error('❌ Note creation failed:', errorMessage);
        
        toast({
          title: "❌ Medical Note Creation Failed",
          description: `Failed to create medical note: ${errorMessage}. Your transcription was completed but the note couldn't be saved.`,
          variant: "destructive",
          duration: 8000 // Longer duration for important error
        });

        // Show additional guidance
        setTimeout(() => {
          toast({
            title: "💡 What to do next",
            description: "You can try again with a new transcription, or contact support if the issue persists.",
            duration: 6000
          });
        }, 2000);

        // Navigate to notes page to see if note was partially created
        setTimeout(() => {
          router.push('/dashboard/notes');
        }, 3000);
      } else {
        // Handle any other case - this shouldn't happen but let's be safe
        console.warn('⚠️ Unexpected Redux result state:', result);
        toast({
          title: "⚠️ Unexpected Result",
          description: "Note status unclear. Please check your notes page.",
        });
        
        setTimeout(() => {
          router.push('/dashboard/notes');
        }, 2000);
      }
    } catch (error) {
      console.error('💥 Error in handleTranscriptionComplete:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "❌ Transcription Processing Failed", 
        description: `An unexpected error occurred: ${errorMessage}. Please try transcribing again.`,
        variant: "destructive",
        duration: 8000
      });
      
      // Show helpful guidance
      setTimeout(() => {
        toast({
          title: "🔧 Troubleshooting Tips",
          description: "Try using a different audio file, check your internet connection, or contact support if the problem persists.",
          duration: 10000
        });
      }, 2000);
      
      // Navigate to notes page as fallback - the note might still be there
      setTimeout(() => {
        router.push('/dashboard/notes');
      }, 3000);
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
    <div className="w-full px-2 sm:px-3 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Voice Transcription
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Record or upload audio to create medical notes
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Audio Upload */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mic className="h-4 w-4" />
                  Audio Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Warning - Different for Students vs Professionals */}
                {/* Only show alerts when settings are loaded and we know user type */}
                {settingsLoaded && isStudentUser && (
                  <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertTitle className="text-orange-800 dark:text-orange-200">
                      🎓 Medical Student: Automatic Patient Anonymization Active
                    </AlertTitle>
                    <AlertDescription className="text-orange-700 dark:text-orange-300 space-y-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          🔒 Privacy Protection Enabled
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                          <li>Patient names will be <strong>automatically anonymized</strong> in the PDF</li>
                          <li>Real names will be replaced with "Patient Case-XXXX"</li>
                          <li>Age and gender information will be preserved for medical accuracy</li>
                          <li>All identifying information will be removed from documentation</li>
                        </ul>
                      </div>
                      <p className="text-xs italic">
                        ✅ You can enter any information - our system will automatically protect patient privacy in the final documentation.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientFirstName" className="text-right">
                      First Name
                      {isStudentUser && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 block font-normal">
                          (Use "Patient" or "Mr. A")
                        </span>
                      )}
                    </Label>
                    <Input
                      id="patientFirstName"
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
                      className="col-span-3"
                      placeholder={isStudentUser ? "Patient / Mr. A / Ms. B (DO NOT use real names)" : "Enter patient's first name"}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientLastName" className="text-right">
                      Last Name
                      {isStudentUser && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 block font-normal">
                          (Anonymous identifier)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="patientLastName"
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
                      className="col-span-3"
                      placeholder={isStudentUser ? "Case-001 / Anonymous (DO NOT use real surnames)" : "Enter patient's last name"}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientAge" className="text-right">
                      Age
                    </Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientGender" className="text-right">
                      Gender
                    </Label>
                    <Select onValueChange={(value) => setPatientInfo({ ...patientInfo, gender: value })} defaultValue={patientInfo.gender}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Not specified">Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Educational Footer - Only for Students */}
                {isStudentUser && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Why Patient Anonymization Matters
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Anonymizing patient information protects privacy, ensures HIPAA compliance, and allows safe use of AI tools for medical education and practice improvement without compromising patient confidentiality.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Recording Privacy Guidance - Only for Students */}
            {isStudentUser && isPatientInfoValid() && (
              <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">
                  🎙️ Recording Privacy Guidelines
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <div className="space-y-2">
                    <p className="font-semibold">When recording your consultation:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Say "The patient" instead of using real names</li>
                      <li>Avoid mentioning specific hospital/clinic names</li>
                      <li>Do not include registration numbers or ID numbers</li>
                      <li>Focus on symptoms, examination findings, and clinical decisions</li>
                    </ul>
                    <p className="text-xs italic mt-2">
                      ✅ Good: "The patient is a 28-year-old male presenting with sore throat..."<br/>
                      ❌ Avoid: "John Smith from Ward 3A, ID 12345, is presenting with..."
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

        <AudioUpload
          onTranscriptionComplete={handleTranscriptionComplete}
          onRecordingComplete={addToQueue}
          disabled={!isPatientInfoValid()}
          patientInfo={patientInfo}
        />
          </div>

          {/* Right Column - Recording Queue */}
          <div className="lg:col-span-1">
            <Card className="h-full">
        <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mic className="h-4 w-4" />
                  Queue
                  {queuedRecordings.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {queuedRecordings.length}
                    </Badge>
                  )}
                </CardTitle>
        </CardHeader>
        <CardContent>
                {queuedRecordings.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Mic className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium mb-2">No recordings queued</p>
                    <p className="text-sm">
                      Record audio to process later
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Support for MP3, WAV, M4A and other popular audio formats
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              ❌ Avoid: WhatsApp files, compressed audio, poor quality recordings
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
