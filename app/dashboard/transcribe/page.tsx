"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, FileText, Play, Trash2, Clock, CheckCircle, AlertCircle, Mic, User, Check } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import AudioUpload from "@/components/audio-upload"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createMedicalNote, getMedicalNotes } from "@/store/features/notesSlice"
import { apiClient } from "@/lib/api-client"

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const dataUrlToFile = (dataUrl: string, filename: string, fileType: string): File => {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : fileType;
  const bstr = atob(arr[1].trim());
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};


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
    gender?: string
  }
  noteId?: string
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
  const [isCreatingNote, setIsCreatingNote] = useState(false) // Add loading state for note creation
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({}).current

  useEffect(() => {
    const loadQueueFromStorage = async () => {
      const storedQueueJSON = localStorage.getItem('queuedRecordings');
      if (storedQueueJSON) {
        try {
          const storableQueue: any[] = JSON.parse(storedQueueJSON);
          const reconstructedQueue: QueuedRecording[] = storableQueue.map(item => {
            const { fileDataUrl, fileType, ...rest } = item;
            return {
              ...rest,
              file: dataUrlToFile(fileDataUrl, item.filename, fileType),
            };
          });
          setQueuedRecordings(reconstructedQueue);
        } catch (error) {
          console.error("Failed to load queue from local storage", error);
          localStorage.removeItem('queuedRecordings');
        }
      }
    };
    loadQueueFromStorage();
  }, []);

  useEffect(() => {
    const saveQueueToStorage = async () => {
      if (queuedRecordings.some(r => r.status === 'processing')) {
        return; 
      }
      if (queuedRecordings.length > 0) {
        try {
          const storableQueuePromises = queuedRecordings.map(async (recording) => {
            const fileDataUrl = await fileToBase64(recording.file);
            const { file, ...rest } = recording;
            return {
              ...rest,
              fileDataUrl,
              fileType: file.type,
            };
          });
          const storableQueue = await Promise.all(storableQueuePromises);
          localStorage.setItem('queuedRecordings', JSON.stringify(storableQueue));
        } catch (error) {
          console.error("Failed to save queue to local storage", error);
        }
      } else {
        localStorage.removeItem('queuedRecordings');
      }
    };
    saveQueueToStorage();
  }, [queuedRecordings]);

  useEffect(() => {
    return () => {
      Object.values(pollingIntervals).forEach(clearInterval)
    }
  }, [pollingIntervals])
  
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

  const handleRecordingComplete = (noteId: string, recordingId?: string) => {
    if (recordingId) {
      setQueuedRecordings(prev =>
        prev.map(r =>
          r.id === recordingId ? { ...r, status: 'completed', noteId } : r
        )
      )
    }
    toast({
      title: '🎉 Medical Note Created!',
      description: 'Your medical note has been created successfully. Opening it now...',
      duration: 5000
    })

    router.push(`/dashboard/notes/${noteId}`)
  }

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

  const handleTranscriptionComplete = async (data: any, recordingId?: string) => {
    console.log('🎯 handleTranscriptionComplete called with data:', data);
    
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
      description: "Medical note completed successfully! Creating note and redirecting...",
    });
    
    console.log('📝 Starting note creation process...');
    
    // Show loading state for note creation
    toast({
      title: "🔄 Creating Medical Note",
      description: "Saving your medical note to the database...",
      duration: 3000,
    });
    
    // Set loading state
    setIsCreatingNote(true);
    
    // Automatically create a draft note in the backend and navigate to it
    try {
      // Extract patient info from the transcription data, but prioritize manual input
      const transcribedPatientInfo = data.patientInfo || data.patientInformation || {};
      const medicalNote = data.medicalNote || {};
      
      
      
      // Prepare note data for backend
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
        diagnosis: medicalNote.assessmentAndDiagnosis || medicalNote.diagnosis || data.diagnosis || data.medicalNote?.diagnosis || 'Clinical assessment pending based on examination findings',
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
        }
      };

      console.log('📝 Prepared note data for backend:', noteData);
      
      // 🧠 ICD-11 codes will be generated by the backend during medical note processing
      console.log('✅ Note data prepared for backend processing (ICD-11 codes will be generated server-side)');
      
      // Show progress notification
      toast({
        title: "📝 Creating Medical Note",
        description: "Saving your medical note to the database...",
      });
      
      const result = await dispatch(createMedicalNote(noteData));
      
      
      
      // BACKEND SAVE RESPONSE
      
      // CRITICAL: Update local state with transformed response
      if (createMedicalNote.fulfilled.match(result)) {
        const savedNote = result.payload;
        console.log('🎉 Note creation successful, savedNote:', savedNote);
        
        // Check multiple possible ID fields in the response
        if (savedNote && savedNote.id) {
          const noteId = savedNote.id;
          console.log('✅ Note created successfully with ID:', noteId);
          
          if (recordingId) {
            setQueuedRecordings(prev =>
              prev.map(r =>
                r.id === recordingId ? { ...r, status: 'completed', noteId } : r
              )
            )
            toast({
              title: "🎉 Medical Note Created!",
              description: "Your medical note has been created successfully.",
              duration: 5000,
            });
          } else {
            // Show success message
            toast({
              title: "🎉 Medical Note Created!",
              description: "Your medical note has been created successfully. Opening it now...",
              duration: 5000,
            });
            
            // Navigate immediately to the proper note page with proper ID
            console.log('🧭 Navigating to note page:', `/dashboard/notes/${noteId}`);
            
            // Use router.replace for immediate navigation without back button
            router.replace(`/dashboard/notes/${noteId}`);
          }
          
          // Always clear the patient form after successful note creation
          clearPatientForm();
          return;
        } else {
          // Note was created but ID structure is different - try to locate the most recent note
          console.warn('⚠️ Note created but no ID found in response:', savedNote);
          toast({
            title: "🎉 Note Created",
            description: "Locating your new note...",
          });

          try {
            const notesResult = await dispatch(getMedicalNotes({ page: 1, limit: 1 }));
            if (getMedicalNotes.fulfilled.match(notesResult)) {
              const latest = notesResult.payload?.notes?.[0];
              if (latest?.id) {
                if (recordingId) {
                  setQueuedRecordings(prev =>
                    prev.map(r =>
                      r.id === recordingId ? { ...r, status: 'completed', noteId: latest.id } : r
                    )
                  )
                } else {
                  router.replace(`/dashboard/notes/${latest.id}`);
                }
                
                // Always clear the patient form after successful note creation
                clearPatientForm();
                return;
              }
            }
          } catch (_) {
            // Ignore and fall back to notes list
          }

          if (recordingId) {
            setQueuedRecordings(prev =>
              prev.map(r =>
                r.id === recordingId ? { ...r, status: 'completed' } : r
              )
            )
          } else {
            router.replace('/dashboard/notes?refresh=true');
          }
          
          // Always clear the patient form after successful note creation
          clearPatientForm();
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
    } finally {
      setIsCreatingNote(false);
    }
  }




  // Function to add a recording to the queue
  const addToQueue = (file: File, duration: number) => {
    setQueuedRecordings(prev => {
      const newRecording: QueuedRecording = {
        id: Date.now().toString(),
        filename: file.name,
        file: file,
        recordedAt: new Date().toISOString(),
        duration: duration,
        status: 'recorded',
        patientInfo: {
          name: `${patientInfo.firstName} ${patientInfo.lastName}`.trim() || `Medical Case ${String(prev.length + 1).padStart(3, '0')}`,
          age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
          gender: patientInfo.gender || undefined
        }
      };
      return [newRecording, ...prev];
    });

    // Reset the patient form after adding to queue
    clearPatientForm();

    toast({
      title: "📝 Recording Saved",
      description: `${file.name} has been added to your processing queue with patient information.`,
    });
  };

  // Function to process a recording from the queue
  const processQueuedRecording = async (recordingId: string) => {
    const recording = queuedRecordings.find(r => r.id === recordingId)
    if (!recording) return

    // Update status to processing
    setQueuedRecordings(prev => 
      prev.map(r => r.id === recordingId ? { ...r, status: 'processing' } : r)
    )

    try {
      toast({
        title: "🔄 Processing Started",
        description: `Processing ${recording.filename}. This will take 30-90 seconds.`,
      })

      // Use patient info stored with the recording, or fall back to current form if available
      const patientData = recording.patientInfo?.name ? {
        patientName: recording.patientInfo.name,
        patientAge: recording.patientInfo.age?.toString() || '',
        patientGender: recording.patientInfo.gender || ''
      } : {
        patientName: `${patientInfo.firstName} ${patientInfo.lastName}`.trim(),
        patientAge: patientInfo.age,
        patientGender: patientInfo.gender
      };

      const response = await apiClient.startTranscription(
        recording.file,
        patientData
      )

      if (response.success && response.data?.jobId) {
        startPolling(response.data.jobId, recording.id)
      } else {
        throw new Error(response.error || 'Failed to start transcription job.')
      }
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

  const startPolling = (jobId: string, recordingId: string) => {
    pollingIntervals[jobId] = setInterval(() => {
      pollTranscriptionStatus(jobId, recordingId)
    }, 5000)
    
    // Add a timeout to prevent infinite polling (10 minutes)
    setTimeout(() => {
      if (pollingIntervals[jobId]) {
        console.log(`Polling timeout for job ${jobId}, checking if note was created...`);
        clearInterval(pollingIntervals[jobId])
        delete pollingIntervals[jobId]
        
        // Check if a note was actually created despite the timeout
        checkForCompletedNote(recordingId, jobId)
      }
    }, 600000) // 10 minutes
  }

  const checkForCompletedNote = async (recordingId: string, jobId: string) => {
    try {
      // Try to get the latest notes to see if one was created
      const notesResult = await dispatch(getMedicalNotes({ page: 1, limit: 5 }));
      if (getMedicalNotes.fulfilled.match(notesResult)) {
        const recentNotes = notesResult.payload?.notes || [];
        const recording = queuedRecordings.find(r => r.id === recordingId);
        
        if (recording && recentNotes.length > 0) {
          // Check if any recent note matches the patient info from the recording
          const matchingNote = recentNotes.find(note => {
            const notePatientName = note.patientName || '';
            const recordingPatientName = recording.patientInfo?.name || '';
            return notePatientName.includes(recordingPatientName) || 
                   recordingPatientName.includes(notePatientName) ||
                   note.createdAt > recording.recordedAt;
          });
          
          if (matchingNote) {
            console.log(`Found matching note for recording ${recordingId}:`, matchingNote.id);
            setQueuedRecordings(prev =>
              prev.map(r => (r.id === recordingId ? { ...r, status: 'completed', noteId: matchingNote.id } : r))
            )
            toast({
              title: "✅ Note Found!",
              description: "Your medical note was created successfully.",
              duration: 5000,
            });
            return;
          }
        }
      }
      
      // If no matching note found, mark as failed
      setQueuedRecordings(prev =>
        prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' } : r))
      )
      toast({
        title: "⏰ Processing Timeout",
        description: "Transcription took longer than expected. Please check your notes page.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error checking for completed note:', error);
      setQueuedRecordings(prev =>
        prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' } : r))
      )
    }
  }

  const pollTranscriptionStatus = async (jobId: string, recordingId: string) => {
    try {
      const response = await apiClient.getTranscriptionResult(jobId)

      if (response.success && response.data) {
        console.log(`Polling job ${jobId} for recording ${recordingId}:`, response.data.status);
        
        if (response.data.status === 'COMPLETED') {
          clearInterval(pollingIntervals[jobId])
          delete pollingIntervals[jobId]
          
          console.log(`Transcription completed for recording ${recordingId}`);
          
          // Update status to completed immediately
          setQueuedRecordings(prev =>
            prev.map(r => (r.id === recordingId ? { ...r, status: 'completed' } : r))
          )
          
          await handleTranscriptionComplete(response.data, recordingId)
        } else if (response.data.status === 'FAILED') {
          clearInterval(pollingIntervals[jobId])
          delete pollingIntervals[jobId]
          console.log(`Transcription failed for recording ${recordingId}`);
          
          setQueuedRecordings(prev =>
            prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' } : r))
          )
          toast({
            title: 'Transcription Failed',
            description: 'The audio processing failed.',
            variant: 'destructive'
          })
        } else if (response.data.status === 'IN_PROGRESS' || response.data.status === 'QUEUED') {
          // Continue polling for these statuses
          console.log(`Transcription still in progress for recording ${recordingId}: ${response.data.status}`);
        } else {
          // Unknown status - continue polling but log it
          console.log(`Unknown transcription status for recording ${recordingId}: ${response.data.status}`);
        }
      } else {
        // If we get a successful response but no data, or if the response indicates success
        // but the status is unclear, we should check if a note was actually created
        if (response.success) {
          // Give it a bit more time before marking as failed
          console.log('Transcription response received but status unclear, continuing to poll...')
          return
        }
        
        clearInterval(pollingIntervals[jobId])
        delete pollingIntervals[jobId]
        console.log(`Polling failed for recording ${recordingId}`);
        
        setQueuedRecordings(prev =>
          prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' } : r))
        )
        toast({
          title: 'Transcription Status Unclear',
          description: 'Could not determine transcription status.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error polling transcription status:', error)
      clearInterval(pollingIntervals[jobId])
      delete pollingIntervals[jobId]
      setQueuedRecordings(prev =>
        prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' } : r))
      )
      toast({
        title: 'Polling Error',
        description: 'Error checking transcription status.',
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
                  <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-950/20">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200">
                      🎓 Student Mode: Privacy Protected
                    </AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <p className="text-sm">
                        Patient names automatically anonymized in final notes • Medical data preserved
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
                      placeholder={isStudentUser ? "Patient A, Mr. B, etc." : "Enter patient's first name"}
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
                      placeholder={isStudentUser ? "Case-001, Anonymous, etc." : "Enter patient's last name"}
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
                          Privacy Protection
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Ensures HIPAA compliance and safe learning.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



          {/* Audio Upload Component */}
          <AudioUpload
            onTranscriptionComplete={handleTranscriptionComplete}
            onRecordingComplete={addToQueue}
            onAddToQueue={clearPatientForm}
            disabled={isCreatingNote}
            patientInfo={patientInfo}
          />

          {/* Note Creation Loading State */}
          {isCreatingNote && (
            <div className="bg-blue-50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  📝 Creating Medical Note
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Saving your medical note and preparing to redirect...
                </div>
              </div>
            </div>
          )}
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
                                router.push(`/dashboard/notes/${recording.noteId}`)
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
