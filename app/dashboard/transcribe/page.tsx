"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, FileText, Play, Trash2, Clock, CheckCircle, AlertCircle, Mic, User, Check, Wand2, TrendingUp, Zap, Loader2 } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import AudioUpload from "@/components/audio-upload"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createMedicalNote, getMedicalNotes } from "@/store/features/notesSlice"
import { apiClient } from "@/lib/api-client"
import EnhancedMedicalNoteViewer from "@/components/medical-note/enhanced-medical-note-viewer"
import { debounce } from "lodash"

// IndexedDB helper functions for persistent queue items
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudioQueueDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('audioFiles')) {
        db.createObjectStore('audioFiles', { keyPath: 'id' });
      }
    };
  });
};

const saveFileToIndexedDB = async (id: string, file: File): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(['audioFiles'], 'readwrite');
  const store = transaction.objectStore('audioFiles');
  
  await new Promise<void>((resolve, reject) => {
    const request = store.put({ id, file, savedAt: Date.now() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const loadFileFromIndexedDB = async (id: string): Promise<File | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['audioFiles'], 'readonly');
    const store = transaction.objectStore('audioFiles');
    
    return new Promise<File | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.file : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to load file from IndexedDB:', error);
    return null;
  }
};

const deleteFileFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['audioFiles'], 'readwrite');
    const store = transaction.objectStore('audioFiles');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete file from IndexedDB:', error);
  }
};


interface QueuedRecording {
  id: string
  filename: string
  file: File
  recordedAt: string
  duration: number
  status: 'recorded' | 'processing' | 'completed' | 'failed' | 'timeout'
  progress?: number
  progressMessage?: string
  patientInfo?: {
    name?: string
    age?: number
    gender?: string
  }
  noteId?: string
  isPersistent?: boolean // User chose to save this item for later
  blobUrl?: string // For persistent items, store as blob URL
  // Quality metrics from enhanced backend
  qualityMetrics?: {
    confidence?: number
    processingTime?: number
    hasComprehensiveNote?: boolean
    hasICDCodes?: boolean
    hasManagementPlan?: boolean
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
  const [isProcessingAny, setIsProcessingAny] = useState(false)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    firstName: '',
    lastName: '',
    age: '',
    gender: ''
  })
  const [isCreatingNote, setIsCreatingNote] = useState(false) // Add loading state for note creation
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null) // Track created note ID
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({}).current

  useEffect(() => {
    const loadQueueState = async () => {
      try {
        // Clean up old storage format
        localStorage.removeItem('queuedRecordings');
        
        const storedMetadata = localStorage.getItem('queueMetadata');
        if (storedMetadata) {
          const parsedMetadata = JSON.parse(storedMetadata);
          console.log('📋 Found queue metadata for', parsedMetadata.length, 'items');
          
          const restoredItems: QueuedRecording[] = [];
          
          for (const metadata of parsedMetadata) {
            if (metadata.isPersistent && metadata.status !== 'completed') {
              // Try to restore persistent files from IndexedDB
              const file = await loadFileFromIndexedDB(metadata.id);
              if (file) {
                restoredItems.push({
                  ...metadata,
                  file,
                } as QueuedRecording);
                console.log('✅ Restored persistent file:', metadata.filename);
              } else {
                console.log('❌ Could not restore file:', metadata.filename);
                // Keep metadata but mark as needing re-upload
                restoredItems.push({
                  ...metadata,
                  file: new File([], metadata.filename, { type: metadata.fileType }),
                  status: 'failed' as const,
                  progressMessage: 'File needs to be re-uploaded'
                } as QueuedRecording);
              }
            }
            // Skip temporary items - they're lost on page refresh (expected)
          }
          
          if (restoredItems.length > 0) {
            setQueuedRecordings(restoredItems);
            const persistentCount = restoredItems.filter(r => r.file.size > 0).length;
            const failedCount = restoredItems.length - persistentCount;
            
            toast({
              title: "📋 Queue Restored",
              description: `Restored ${persistentCount} saved items${failedCount > 0 ? `, ${failedCount} need re-upload` : ''}.`,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load queue state:', error);
        localStorage.removeItem('queueMetadata');
      }
    };
    loadQueueState();

    // Listen for patient info updates from audio upload component
    const handlePatientInfoUpdate = (event: CustomEvent) => {
      const tempPatientInfo = event.detail;
      setPatientInfo(tempPatientInfo);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('updatePatientInfo', handlePatientInfoUpdate as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('updatePatientInfo', handlePatientInfoUpdate as EventListener);
      }
    };
  }, []);

  // Hybrid persistence: IndexedDB for persistent items, memory for temporary
  useEffect(() => {
    const saveQueueState = async () => {
      try {
        // Separate persistent and temporary items
        const persistentItems = queuedRecordings.filter(r => r.isPersistent);
        const temporaryItems = queuedRecordings.filter(r => !r.isPersistent);
        
        // Save persistent files to IndexedDB
        for (const item of persistentItems) {
          if (item.file && item.status !== 'completed') {
            await saveFileToIndexedDB(item.id, item.file);
          }
        }
        
        // Save metadata for all items to localStorage
        const queueMetadata = queuedRecordings.map(recording => ({
          id: recording.id,
          filename: recording.filename,
          recordedAt: recording.recordedAt,
          duration: recording.duration,
          status: recording.status,
          patientInfo: recording.patientInfo,
          fileType: recording.file?.type,
          fileSize: recording.file?.size,
          isPersistent: recording.isPersistent,
          noteId: recording.noteId,
        }));
        
        if (queueMetadata.length > 0) {
          localStorage.setItem('queueMetadata', JSON.stringify(queueMetadata));

        } else {
          localStorage.removeItem('queueMetadata');
        }
      } catch (error) {
        console.error('Failed to save queue state:', error);
        // Fallback to metadata only
        try {
          const basicMetadata = queuedRecordings.map(r => ({
            id: r.id,
            filename: r.filename,
            status: r.status,
            isPersistent: r.isPersistent
          }));
          localStorage.setItem('queueMetadata', JSON.stringify(basicMetadata));
        } catch {
          localStorage.removeItem('queueMetadata');
        }
      }
    };
    
    saveQueueState();
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
          r.id === recordingId ? { ...r, status: 'completed' as const, noteId } : r
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
    setCreatedNoteId(null) // Clear note ID for next transcription
  }

  const isPatientInfoValid = () => {
    return patientInfo.firstName.trim() !== '' && 
           patientInfo.lastName.trim() !== '' && 
           patientInfo.age.trim() !== '' && 
           patientInfo.gender !== ''
  }

  const handleTranscriptionComplete = async (data: any, recordingId?: string) => {
  
    
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

      // 🧠 ICD-11 codes will be generated by the backend during medical note processing
      
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
        // Check multiple possible ID fields in the response
        if (savedNote && savedNote.id) {
          const noteId = savedNote.id;
          
          if (recordingId) {
            // For queue items, show success and route after delay
            setQueuedRecordings(prev =>
              prev.map(r =>
                r.id === recordingId ? { ...r, status: 'completed' as const, noteId, progressMessage: '🎉 Medical Note Created!' } : r
              )
            )
            toast({
              title: "🎉 Medical Note Created!",
              description: "Your medical note has been created successfully. Opening it now...",
      
            });
            
            // Wait before routing and then cleanup
            setTimeout(() => {
              router.replace(`/dashboard/notes/${noteId}`);
              
              // Remove from queue after routing
              setTimeout(() => {
                setQueuedRecordings(prev => prev.filter(r => r.id !== recordingId));
              }, 1000);
            }, 3000);
          } else {
            // Show success message
            toast({
              title: "🎉 Medical Note Created!",
              description: "Your medical note has been created successfully. Opening it now...",
      
            });
            
            // Set the created note ID for the audio upload component
            setCreatedNoteId(noteId);
            
            // Wait a moment before navigating to let user see completion message
  
            
            setTimeout(() => {
              router.replace(`/dashboard/notes/${noteId}`);
              
              // Clear the form and reset audio upload component after routing
              setTimeout(() => {
                clearPatientForm();
                // Trigger cleanup of audio upload component
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('clearAudioUpload'));
                }
              }, 1000); // Clear after routing
            }, 3000); // Wait 3 seconds before routing
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
                  // For queue items, show success and route after delay
                  setQueuedRecordings(prev =>
                    prev.map(r =>
                      r.id === recordingId ? { ...r, status: 'completed' as const, noteId: latest.id, progressMessage: '🎉 Medical Note Created!' } : r
                    )
                  )
                  
                  // Wait before routing and then cleanup
                  setTimeout(() => {
                    router.replace(`/dashboard/notes/${latest.id}`);
                    
                    // Remove from queue after routing
                    setTimeout(() => {
                      setQueuedRecordings(prev => prev.filter(r => r.id !== recordingId));
                    }, 1000);
                  }, 3000);
                } else {
                  setCreatedNoteId(latest.id);
                  
                  // Wait a moment before navigating to let user see completion message
                  setTimeout(() => {
                    router.replace(`/dashboard/notes/${latest.id}`);
                    
                    // Clear the form and reset audio upload component after routing
                    setTimeout(() => {
                      clearPatientForm();
                      // Trigger cleanup of audio upload component
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('clearAudioUpload'));
                      }
                    }, 1000); // Clear after routing
                  }, 3000); // Wait 3 seconds before routing
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
                r.id === recordingId ? { ...r, status: 'completed' as const } : r
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
   // Longer duration for important error
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




  // Function to check for completed note after timeout
  const checkForCompletedNote = async (recordingId: string, jobId?: string) => {
    try {

      
      // Try to get the latest notes using Redux
      const notesResult = await dispatch(getMedicalNotes({ page: 1, limit: 10 }));
      
      if (getMedicalNotes.fulfilled.match(notesResult)) {
        const recentNotes = notesResult.payload?.notes || [];
        const recording = queuedRecordings.find(r => r.id === recordingId);
        
        if (recording && recentNotes.length > 0) {
          // Look for a recently created note (within last 5 minutes)
          const matchingNote = recentNotes.find((note: any) => {
            const noteTime = new Date(note.createdAt).getTime();
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const recordingTime = new Date(recording.recordedAt).getTime();
            
            // Check if note was created after recording and within last 5 minutes
            return noteTime > recordingTime && noteTime > fiveMinutesAgo;
          });
          
          if (matchingNote) {
            console.log('✅ Found recently created note:', matchingNote.id);
            
            // Clear polling interval if provided
            if (jobId && pollingIntervals[jobId]) {
              clearInterval(pollingIntervals[jobId]);
              delete pollingIntervals[jobId];
            }
            
            setQueuedRecordings(prev =>
              prev.map(r => (r.id === recordingId ? { ...r, status: 'completed' as const, noteId: matchingNote.id } : r))
            )
            
            toast({
              title: "✅ Note Found!",
              description: "Your medical note was created successfully.",
            });
            
            // Route to the note after a delay
            setTimeout(() => {
              router.replace(`/dashboard/notes/${matchingNote.id}`);
              setTimeout(() => {
                setQueuedRecordings(prev => prev.filter(r => r.id !== recordingId));
              }, 1000);
            }, 3000);
            
            return true;
          }
        }
      }
      
      // No note found, mark as failed
      setQueuedRecordings(prev =>
        prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' as const, progressMessage: 'No note was created' } : r))
      )
      
      return false;
      
    } catch (error) {
      console.error('Error checking for completed note:', error);
      setQueuedRecordings(prev =>
        prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' as const, progressMessage: 'Failed to verify completion' } : r))
      )
      return false;
    }
  };

  // Debounced version of processQueuedRecording to prevent rapid clicks
  const debouncedProcessQueuedRecording = useCallback(
    debounce((recordingId: string) => {
      processQueuedRecording(recordingId);
    }, 300), // 300ms delay
    []
  );

  // Function to add a recording to the queue
  const addToQueue = (file: File, duration: number, isPersistent: boolean = false) => {
    setQueuedRecordings(prev => {
      const newRecording: QueuedRecording = {
        id: Date.now().toString(),
        filename: file.name,
        file: file,
        recordedAt: new Date().toISOString(),
        duration: duration,
        status: 'recorded' as const,
        isPersistent: isPersistent,
        patientInfo: {
          name: `${patientInfo.firstName} ${patientInfo.lastName}`.trim() || `Medical Case ${String(prev.length + 1).padStart(3, '0')}`,
          age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
          gender: patientInfo.gender || undefined
        }
      };
      return [newRecording, ...prev];
    });

    // Show feedback
    toast({
      title: "💾 Audio Saved",
      description: `${file.name} saved for later processing.`,
    });

    // Reset the patient form after adding to queue
    clearPatientForm();
  };

  // Function to process a recording from the queue
  const processQueuedRecording = async (recordingId: string) => {
    console.log(`🚀 Starting transcription for recording: ${recordingId}`);
    
    const recording = queuedRecordings.find(r => r.id === recordingId)
    if (!recording) {
      console.error(`🚨 Recording ${recordingId} not found in queue!`);
      return;
    }

    // 🚨 DUPLICATE PREVENTION: Check if already processing
    if (recording.status === 'processing') {
      console.log(`🚨 Already processing recording ${recordingId}, ignoring duplicate request`);
      return;
    }

    // 🚨 GLOBAL DUPLICATE PREVENTION: Check if any transcription is running
    if (isProcessingAny) {
      console.log(`🚨 Another transcription is already running, please wait`);
      toast({
        title: "⏳ Please Wait",
        description: "Another transcription is already running. Please wait for it to complete.",
      });
      return;
    }

    console.log(`✅ Proceeding with transcription for recording: ${recordingId}`);
    // Set global processing state
    setIsProcessingAny(true);

    // 🚨 SAFETY TIMEOUT: Reset global state after 5 minutes to prevent stuck state
    const safetyTimeout = setTimeout(() => {
      setIsProcessingAny(false);
      console.log(`🚨 Safety timeout: Reset global processing state for recording ${recordingId}`);
    }, 300000); // 5 minutes

    // Update status to processing with initial progress
    setQueuedRecordings(prev => {
      const updated = prev.map(r => r.id === recordingId ? { 
        ...r, 
        status: 'processing' as const,
        progress: 5,
        progressMessage: 'Starting transcription...'
      } : r);
      return updated;
    });

    try {
      toast({
        title: "🔄 Processing Started",
        description: `Processing ${recording.filename}. This will take 30-90 seconds.`,
      })

      // Always use patient info stored with the recording (captured when added to queue)
      const patientData = {
        patientName: recording.patientInfo?.name || '',
        patientAge: recording.patientInfo?.age?.toString() || '',
        patientGender: recording.patientInfo?.gender || ''
      };
      

      
      const response = await apiClient.fastTranscription(
        recording.file,
        patientData
      )



      if (response.success && response.data?.savedNoteId) {
        // Direct transcription completed successfully
        const noteId = response.data.savedNoteId;
        const { confidence, duration, medicalNote } = response.data;
        
        console.log(`🎉 Transcription completed successfully for recording ${recordingId}, note ID: ${noteId}`);
        
        setQueuedRecordings(prev =>
          prev.map(r =>
            r.id === recordingId ? { 
              ...r, 
              status: 'completed' as const, 
              noteId, 
              progressMessage: '🎉 Medical Note Created!',
              qualityMetrics: {
                confidence,
                processingTime: duration,
                hasComprehensiveNote: !!medicalNote?.assessmentAndDiagnosis,
                hasICDCodes: !!medicalNote?.icd11Codes?.length,
                hasManagementPlan: !!medicalNote?.managementPlan
              }
            } : r
          )
        )
        
        // Enhanced success message with quality indicators
        const qualityMessage = duration 
          ? `Processing completed in ${duration}s`
          : "Medical note completed successfully!";
        
        toast({
          title: "🎉 Medical Note Created!",
          description: qualityMessage,
        });
        
        // Log quality metrics for monitoring
        if (confidence && duration) {
          console.log(`✅ Transcription Quality Metrics:`, {
            confidence: `${confidence}%`,
            duration: `${duration}s`,
            hasComprehensiveNote: !!medicalNote?.assessmentAndDiagnosis,
            hasICDCodes: !!medicalNote?.icd11Codes?.length,
            hasManagementPlan: !!medicalNote?.managementPlan
          });
        }
        
        // Wait before routing and then cleanup
        setTimeout(() => {
          router.replace(`/dashboard/notes/${noteId}`);
          setTimeout(() => {
            setQueuedRecordings(prev => prev.filter(r => r.id !== recordingId));
          }, 1000);
        }, 3000);
      } else if (response.error?.includes('TIMEOUT') || response.details === 'TIMEOUT') {
        // Handle timeout - transcription might still complete in background
        console.log(`⏰ Transcription timeout for recording ${recordingId}, but note might still be created`);
        
        setQueuedRecordings(prev =>
          prev.map(r =>
            r.id === recordingId ? { 
              ...r, 
              status: 'timeout' as const, 
              progressMessage: '⏰ Processing timeout - check notes later',
              progress: 100
            } : r
          )
        )
        
        toast({
          title: "⏰ Processing Timeout",
          description: "Transcription is taking longer than expected. Check your notes in a few minutes.",
        });
      } else {
        // Handle other errors
        console.error(`❌ Transcription failed for recording ${recordingId}:`, response.error);
        
        setQueuedRecordings(prev =>
          prev.map(r =>
            r.id === recordingId ? { 
              ...r, 
              status: 'failed' as const, 
              progressMessage: '❌ Transcription failed',
              progress: 0
            } : r
          )
        )
        
        toast({
          title: "❌ Transcription Failed",
          description: response.error || "Failed to transcribe audio. Please try again.",
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error(`💥 Unexpected error during transcription for recording ${recordingId}:`, error);
      
      setQueuedRecordings(prev =>
        prev.map(r =>
          r.id === recordingId ? { 
            ...r, 
            status: 'failed' as const, 
            progressMessage: '💥 Unexpected error occurred',
            progress: 0
          } : r
        )
      )
      
      toast({
        title: "💥 Processing Error",
        description: "An unexpected error occurred. Please try again.",
        variant: 'destructive'
      })
    } finally {
      console.log(`🏁 Transcription process finished for recording ${recordingId}`);
      setIsProcessingAny(false); // Reset global processing state
      clearTimeout(safetyTimeout); // Clear safety timeout
    }
  }

  const startPolling = (jobId: string, recordingId: string) => {
    pollingIntervals[jobId] = setInterval(() => {
      pollTranscriptionStatus(jobId, recordingId)
    }, 5000)
    
    // Add a timeout to prevent infinite polling (10 minutes)
    setTimeout(async () => {
      if (pollingIntervals[jobId]) {
        console.log(`Polling timeout for job ${jobId}, checking if note was created...`);
        clearInterval(pollingIntervals[jobId])
        delete pollingIntervals[jobId]
        
        // Check if a note was actually created despite the timeout
        const noteFound = await checkForCompletedNote(recordingId, jobId)
        
        if (!noteFound) {
          setQueuedRecordings(prev =>
            prev.map(r => (r.id === recordingId ? { ...r, status: 'failed' as const } : r))
          )
          toast({
            title: "⏰ Processing Timeout",
            description: "Transcription took longer than expected. Please check your notes page.",
            variant: "destructive"
          });
        }
      }
    }, 600000) // 10 minutes
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
          
          // Update status to completed with 100% progress
          setQueuedRecordings(prev =>
            prev.map(r => (r.id === recordingId ? { 
              ...r, 
              status: 'completed' as const,
              progress: 100,
              progressMessage: 'Transcription completed!'
            } : r))
          )
          
          await handleTranscriptionComplete(response.data, recordingId)
        } else if (response.data.status === 'FAILED') {
          console.log(`Transcription status is FAILED for recording ${recordingId}`);
          
          // Before marking as failed, check if a note was actually created
          const noteFound = await checkForCompletedNote(recordingId, jobId)
          
          if (!noteFound) {
            clearInterval(pollingIntervals[jobId])
            delete pollingIntervals[jobId]
            
            setQueuedRecordings(prev =>
              prev.map(r => (r.id === recordingId ? { 
                ...r, 
                status: 'failed' as const,
                progress: 0,
                progressMessage: 'Processing failed'
              } : r))
            )
            toast({
              title: 'Transcription Failed',
              description: 'The audio processing failed.',
              variant: 'destructive'
            })
          }
        } else if (response.data.status === 'IN_PROGRESS' || response.data.status === 'QUEUED') {
          // Continue polling for these statuses and update progress
          console.log(`Transcription still in progress for recording ${recordingId}: ${response.data.status}`);
          
          // Update progress to show it's still working
          setQueuedRecordings(prev =>
            prev.map(r => (r.id === recordingId ? { 
              ...r, 
              progress: 75, // Fixed progress for in-progress
              progressMessage: (response.data as any).status === 'IN_PROGRESS' ? 'Transcribing audio...' : 'Job queued, waiting...'
            } : r))
          )
          
          // Also check if a note was created even while in progress (sometimes backend completes but doesn't update status)
          await checkForCompletedNote(recordingId, jobId)
        } else {
          // Unknown status - check if note was created and continue polling
          console.log(`Unknown transcription status for recording ${recordingId}: ${response.data.status}`);
          await checkForCompletedNote(recordingId, jobId)
        }
      } else {
        // If we get a successful response but no data, check if a note was created
        if (response.success) {
          console.log('Transcription response received but status unclear, checking for completed note...')
          await checkForCompletedNote(recordingId, jobId)
          return
        }
        
        clearInterval(pollingIntervals[jobId])
        delete pollingIntervals[jobId]
        console.log(`Polling failed for recording ${recordingId}`);
        
        // Before marking as failed, do a final check for completed note
        await checkForCompletedNote(recordingId, jobId)
      }
    } catch (error) {
      console.error('Error polling transcription status:', error)
      
      // Before marking as failed due to polling error, check if note was created
      await checkForCompletedNote(recordingId, jobId)
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
            createdNoteId={createdNoteId}
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
                  <Clock className="h-4 w-4" />
                  Transcription Queue
                  {isProcessingAny && (
                    <Badge variant="default" className="ml-2 bg-orange-100 text-orange-800">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Processing...
                    </Badge>
                  )}
                </CardTitle>
                {queuedRecordings.length > 0 && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{queuedRecordings.length} item{queuedRecordings.length !== 1 ? 's' : ''} in queue</span>
                    {queuedRecordings.some(r => r.status === 'completed' && r.qualityMetrics) && (
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          Enhanced quality tracking enabled
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                          {recording.patientInfo?.name && (
                            <div>Patient: {recording.patientInfo.name}</div>
                          )}
                          
                          {/* Quality indicators for completed transcriptions */}
                          {recording.status === 'completed' && recording.qualityMetrics && (
                            <div className="mt-2 space-y-1">
                              {recording.qualityMetrics.processingTime && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Zap className="h-3 w-3" />
                                  <span>Processed in {recording.qualityMetrics.processingTime}s</span>
                                </div>
                              )}
                              {recording.qualityMetrics.hasComprehensiveNote && (
                                <div className="flex items-center gap-1 text-purple-600">
                                  <Check className="h-3 w-3" />
                                  <span>Comprehensive note generated</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Progress bar for processing recordings */}
                        {recording.status === 'processing' && recording.progress !== undefined && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>{recording.progressMessage || 'Processing...'}</span>
                              <span>{recording.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${recording.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {recording.status === 'recorded' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => debouncedProcessQueuedRecording(recording.id)}
                              disabled={false}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Wand2 className="h-3 w-3" />
                              Transcribe Audio
                            </Button>
                          )}
                          
                          {recording.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="default"
                              disabled={true}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing...
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

        {/* Enhanced Medical Note Preview Section */}
        {queuedRecordings.some(r => r.status === 'completed' && r.qualityMetrics) && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Enhanced Medical Note Preview
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your transcription has been processed with enhanced AI analysis. Here's what was generated:
                </p>
              </CardHeader>
              <CardContent>
                {queuedRecordings
                  .filter(r => r.status === 'completed' && r.qualityMetrics)
                  .map((recording) => (
                    <div key={recording.id} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {recording.filename}
                        </h4>
                        <div className="flex items-center gap-2">
                          {recording.qualityMetrics?.processingTime && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Zap className="h-3 w-3 mr-1" />
                              {recording.qualityMetrics.processingTime}s
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Show enhanced medical note preview if available */}
                      {recording.qualityMetrics?.hasComprehensiveNote && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">✓ Comprehensive Note</span>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Full medical assessment generated</p>
                            </div>
                            {recording.qualityMetrics.hasICDCodes && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">✓ ICD-11 Codes</span>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">Diagnostic codes extracted</p>
                              </div>
                            )}
                            {recording.qualityMetrics.hasManagementPlan && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">✓ Management Plan</span>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">Treatment plan included</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => router.push(`/dashboard/notes/${recording.noteId}`)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Complete Medical Note
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg">🎤</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Record Audio</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Record directly in your browser with high-quality audio capture
            </p>
          </Card>

          <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-lg">📄</span>
          </div>
            <h3 className="font-semibold text-base mb-2">Upload Files</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Support for MP3, WAV, M4A and other popular audio formats
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              ❌ Avoid: WhatsApp files, compressed audio, poor quality recordings
            </p>
      </Card>
      
          <Card className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Batch Processing</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Record multiple patients during busy hours, then process them all during quieter times
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
