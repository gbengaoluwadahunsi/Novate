"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Upload, FileAudio, Mic, Play, Pause, Sparkles, Languages, Wand2, AlertCircle, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import type { FastTranscriptionResponse, TranscriptionResult } from "@/lib/api-client"
import { useAppSelector } from "@/store/hooks"
import { fetchSupportedLanguages, type Language } from "@/app/config/languages"

// Types
interface MedicalNote {
  id?: string
  patientName: string
  patientAge: number
  patientGender: string
  noteType: string
  chiefComplaint?: string
  historyOfPresentIllness?: string
  diagnosis?: string
  treatmentPlan?: string
  audioJobId?: string
  createdAt?: string
  updatedAt?: string
}

interface AudioUploadProps {
  onTranscriptionComplete: (transcription: any) => void
  onRecordingComplete?: (file: File, duration: number) => void
}

// Extract functions for parsing medical transcriptions
const extractChiefComplaint = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for common chief complaint indicators in English
  const indicators = [
    'chief complaint', 'presenting with', 'complains of', 'patient reports',
    'main problem', 'primary concern', 'came in for', 'here for'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      // Extract text after the indicator
      const afterIndicator = fullText.substring(index + indicator.length).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 5) {
        return sentences[0].trim();
      }
    }
  }
  
  // Look for Malay/Indonesian medical indicators
  const malayIndicators = [
    'keluhan utama', 'sakit', 'masalah', 'datang dengan', 'mengalami',
    'rasa sakit', 'demam', 'batuk', 'pusing', 'mual'
  ];
  
  for (const indicator of malayIndicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  // Fallback: look for symptom keywords
  const symptoms = ['pain', 'ache', 'fever', 'cough', 'sore', 'headache', 'nausea', 'dizzy', 'weakness'];
  for (const symptom of symptoms) {
    if (fullText.includes(symptom)) {
      const sentences = fullText.split(/[.!?]/);
      for (const sentence of sentences) {
        if (sentence.includes(symptom) && sentence.length > 10) {
          return sentence.trim();
        }
      }
    }
  }
  
  // Skip doctor introduction sentences
  const sentences = fullText.split(/[.!?]/);
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    // Skip sentences that are clearly doctor introductions
    if (cleanSentence.length > 10 && 
        !cleanSentence.includes('hai') && 
        !cleanSentence.includes('saya doktor') && 
        !cleanSentence.includes('doctor') && 
        !cleanSentence.includes('my name is') &&
        !cleanSentence.includes('i am')) {
      return cleanSentence;
    }
  }
  
  // If no good content found, return a generic placeholder
  return 'Chief complaint to be documented';
};

const extractHistory = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for history indicators in English
  const indicators = [
    'history', 'started', 'began', 'first noticed', 'for the past', 'since', 'duration'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 15) {
        return sentences[0].trim();
      }
    }
  }
  
  // Look for Malay/Indonesian history indicators
  const malayIndicators = [
    'riwayat', 'mulai', 'bermula', 'sejak', 'sudah', 'pernah',
    'sejarah penyakit', 'bila mula', 'kapan mulai'
  ];
  
  for (const indicator of malayIndicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  return 'History of presenting illness to be documented';
};

const extractPhysicalExam = (segments: any[]): any => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Extract vital signs if mentioned
  const vitals = {
    bloodPressure: "--",
    heartRate: "--", 
    temperature: "--",
    respiratoryRate: "--",
  };
  
  // Look for vital signs patterns
  const bpMatch = fullText.match(/(\d{2,3}\/\d{2,3}|\d{2,3}\s*over\s*\d{2,3})/);
  if (bpMatch) vitals.bloodPressure = bpMatch[0];
  
  const hrMatch = fullText.match(/(\d{2,3})\s*(bpm|beats|heart rate)/);
  if (hrMatch) vitals.heartRate = `${hrMatch[1]} bpm`;
  
  const tempMatch = fullText.match(/(\d{2,3}\.?\d*)\s*(degrees|celsius|fahrenheit|°c|°f)/);
  if (tempMatch) vitals.temperature = `${tempMatch[1]}°C`;
  
  // Extract examination findings
  let throatExam = "To be examined";
  if (fullText.includes('throat') || fullText.includes('pharynx')) {
    const sentences = fullText.split(/[.!?]/);
    for (const sentence of sentences) {
      if ((sentence.includes('throat') || sentence.includes('pharynx')) && sentence.length > 10) {
        throatExam = sentence.trim();
        break;
      }
    }
  }
  
  return {
    vitals,
    throat: throatExam,
  };
};

const extractDiagnosis = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for diagnosis indicators
  const indicators = [
    'diagnosis', 'diagnosed with', 'likely', 'probably', 'appears to be', 'consistent with'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index + indicator.length).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 5) {
        return sentences[0].trim();
      }
    }
  }
  
  return 'Diagnosis extracted from transcription';
};

const extractTreatmentPlan = (segments: any[]): string => {
  const fullText = segments.map(s => s.text).join(' ').toLowerCase();
  
  // Look for treatment indicators
  const indicators = [
    'treatment', 'recommend', 'prescribe', 'medication', 'take', 'follow up', 'plan'
  ];
  
  for (const indicator of indicators) {
    const index = fullText.indexOf(indicator);
    if (index !== -1) {
      const afterIndicator = fullText.substring(index).trim();
      const sentences = afterIndicator.split(/[.!?]/);
      if (sentences[0] && sentences[0].length > 10) {
        return sentences[0].trim();
      }
    }
  }
  
  return 'Treatment plan extracted from transcription';
};

const formatManagementPlan = (managementPlan: any): string => {
  if (!managementPlan || typeof managementPlan !== 'object') {
    return 'Treatment plan to be determined';
  }
  
  const sections = [];
  
  // Handle investigations
  if (managementPlan.investigations && managementPlan.investigations !== 'N/A') {
    sections.push(`Investigations: ${managementPlan.investigations}`);
  }
  
  // Handle treatment administered
  if (managementPlan.treatmentAdministered && managementPlan.treatmentAdministered !== 'N/A') {
    sections.push(`Treatment Administered: ${managementPlan.treatmentAdministered}`);
  }
  
  // Handle medications prescribed
  if (managementPlan.medicationsPrescribed && managementPlan.medicationsPrescribed !== 'N/A') {
    sections.push(`Medications Prescribed: ${managementPlan.medicationsPrescribed}`);
  }
  
  // Handle patient education
  if (managementPlan.patientEducation && managementPlan.patientEducation !== 'N/A') {
    sections.push(`Patient Education: ${managementPlan.patientEducation}`);
  }
  
  // Handle follow-up
  if (managementPlan.followUp && managementPlan.followUp !== 'N/A') {
    sections.push(`Follow-up: ${managementPlan.followUp}`);
  }
  
  // Handle any other fields that might be present
  Object.keys(managementPlan).forEach(key => {
    if (!['investigations', 'treatmentAdministered', 'medicationsPrescribed', 'patientEducation', 'followUp'].includes(key)) {
      const value = managementPlan[key];
      if (value && value !== 'N/A') {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sections.push(`${formattedKey}: ${value}`);
      }
    }
  });
  
  return sections.length > 0 
    ? sections.join('\n\n') 
    : 'Treatment plan to be determined';
};

export default function AudioUpload({ onTranscriptionComplete, onRecordingComplete }: AudioUploadProps) {
  // Get user's preferred language from auth state
  const { user } = useAppSelector((state) => state.auth)
  
  const [file, setFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [language, setLanguage] = useState(user?.preferredLanguage || "en-US")
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([])
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [demoMode, setDemoMode] = useState(false)
  const [showDemoAlert, setShowDemoAlert] = useState(false)
  const [transcriptionComplete, setTranscriptionComplete] = useState(false)
  const [processingStages, setProcessingStages] = useState<{ name: string; status: string; description: string; progress: number }[]>([])
  const [useFastTranscription, setUseFastTranscription] = useState(true) // Default to fast mode
  const [overallProgress, setOverallProgress] = useState(0)
  
  // Add patient information state
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const performanceMonitor = useRef<{ startTiming: (key: string) => void }>({ startTiming: () => {} })
  const processingJobId = useRef<string | null | undefined>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const generatedNote = useRef<MedicalNote | null>(null)
  const recordingTimeRef = useRef<number>(0)

  // Update language when user data changes
  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage)
    }
  }, [user?.preferredLanguage])

  useEffect(() => {
    fetchSupportedLanguages().then(setAvailableLanguages)
  }, [])

  // Function to animate progress for a specific stage
  const animateStageProgress = (stageName: string, targetProgress: number, duration: number = 2000) => {
    const startTime = Date.now()
    const startProgress = 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(startProgress + (targetProgress - startProgress) * (elapsed / duration), targetProgress)
      
      updateProcessingStage(stageName, 'processing', '', Math.floor(progress))
      
      // Update overall progress based on all stages
      setProcessingStages(prev => {
        const totalStages = prev.length
        const completedProgress = prev.reduce((sum, stage) => sum + stage.progress, 0)
        const overallProg = Math.floor(completedProgress / totalStages)
        setOverallProgress(overallProg)
        return prev
      })
      
      if (progress < targetProgress) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }

  // Function to complete a stage with 100% progress
  const completeStage = (stageName: string) => {
    updateProcessingStage(stageName, 'completed', '', 100)
    
    // Update overall progress
    setProcessingStages(prev => {
      const totalStages = prev.length
      const completedProgress = prev.reduce((sum, stage) => 
        stage.name === stageName ? sum + 100 : sum + stage.progress, 0)
      const overallProg = Math.floor(completedProgress / totalStages)
      setOverallProgress(overallProg)
      return prev
    })
  }

  const clearPatientForm = () => {
    setPatientName('')
    setPatientAge('')
    setPatientGender('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0]
      setFile(uploadedFile)
      
      // Disable demo mode when real file is uploaded
      setDemoMode(false)
      setShowDemoAlert(false)
      
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(uploadedFile)
      }
      // Reset keywords for new file
      setDetectedKeywords([])
      setTranscriptionComplete(false)
      
      // Optionally clear patient form for new file
      // clearPatientForm()
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const startRecording = async () => {
    try {
      // Disable demo mode when starting a real recording
      setDemoMode(false)
      setShowDemoAlert(false)
      
      // Force clear keywords immediately
      setDetectedKeywords([])
      
      // Request high-quality audio for better transcription
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono for speech
          sampleRate: 44100, // High quality sample rate
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      // Clear any existing chunks
      chunksRef.current = []
      
      // Create MediaRecorder with optimized configuration for transcription
      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 
                  MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm',
        audioBitsPerSecond: 128000 // 128 kbps for better quality
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      })

      mediaRecorderRef.current.addEventListener("stop", () => {
        
        if (chunksRef.current.length === 0) {
          toast({
            title: "Recording Error",
            description: "No audio data was recorded. Please try again.",
            variant: "destructive",
          })
          return
        }
        
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        })
        
        if (audioBlob.size === 0) {
          toast({
            title: "Recording Error",
            description: "No audio data was captured. Please check your microphone.",
            variant: "destructive",
          })
          return
        }
        
        // Create file with proper extension based on mime type
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
        const extension = mimeType.includes('webm') ? '.webm' : 
                         mimeType.includes('mp4') ? '.mp4' : '.webm'
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const audioFile = new File([audioBlob], `recording_${timestamp}${extension}`, { 
          type: mimeType 
        })
        
        if (audioFile.size < 5000) { // Less than 5KB is likely too small
          toast({
            title: "⚠️ Poor Audio Quality",
            description: "Recording seems too small. Please speak louder and record for longer.",
            variant: "destructive",
          })
        }
        
        setFile(audioFile)
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob)
        }
        chunksRef.current = []
        
        // Check if recording is long enough
        if (recordingTimeRef.current > 10) { // Increased minimum to 10 seconds for medical content
          // If onRecordingComplete callback is provided, add to queue instead of auto-processing
          if (onRecordingComplete) {
            onRecordingComplete(audioFile, recordingTimeRef.current)
          } else {
            // Fallback: auto-process if no callback provided (backwards compatibility)
          setTimeout(() => {
              processAudioWithFile(audioFile)
            }, 500)
          }
        } else {
          toast({
            title: "Recording Too Short",
            description: "Please record for at least 10 seconds. Include patient symptoms, history, and examination details for better results.",
            variant: "destructive",
          })
        }
      })

      // Start recording with timeslice to ensure data is captured
      mediaRecorderRef.current.start(1000) // Capture data every 1 second
      setIsRecording(true)
      setRecordingTime(0)
      setTranscriptionComplete(false)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          recordingTimeRef.current = newTime
          return newTime
        })
      }, 1000)

      toast({
        title: "🎙️ Recording Started",
        description: "For best AI transcription: Speak clearly, include patient name, symptoms, examination findings, and diagnosis. Avoid just saying 'hello doctor'.",
      })
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Recording Stopped",
        description: `Recording completed (${formatTime(recordingTime)})`,
      })

      // Processing is now handled in the MediaRecorder stop event
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      toast({
        title: "Recording Paused",
        description: "Recording has been paused. Click Resume to continue.",
      })
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Restart the timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          recordingTimeRef.current = newTime
          return newTime
        })
      }, 1000)

      toast({
        title: "Recording Resumed",
        description: "Recording has been resumed.",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // For demo purposes - process a partial transcription with limited data
  const processPartialTranscription = async () => {
    setIsProcessing(true)

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Partial transcription with only basic info
    const partialTranscription = {
      patientInfo: {
        name: "Ahmed bin Ali",
        age: 28,
        gender: "Male",
        visitDate: "17 May 2025",
      },
      chiefComplaint: "Sore throat for three days",
      historyOfPresentIllness: "",
      pastMedicalHistory: "",
      systemReview: "",
      physicalExamination: {
        vitals: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
        },
        throat: "",
      },
      diagnosis: "",
      managementPlan: "",
      medicationCertificate: "",
    }

    clearInterval(interval)
    setProgress(100)
    setTranscriptionComplete(true)

    // Wait a bit before completing
    setTimeout(() => {
      onTranscriptionComplete(partialTranscription)
      setIsProcessing(false)
      toast({
        title: "Partial Transcription Complete",
        description: "Basic patient information and chief complaint transcribed. Other sections need more information.",
      })
    }, 500)
  }

  const initializeProcessingStages = useCallback(() => {
    if (useFastTranscription) {
      setProcessingStages([
        {
          name: 'Fast Transcription',
          status: 'pending',
          description: 'Processing audio with ultra-fast transcription (30-60 seconds)',
          progress: 0
        },
        {
          name: 'Medical Note Generation',
          status: 'pending',
          description: 'Generating structured medical note from transcript',
          progress: 0
        }
      ]);
    } else {
      setProcessingStages([
        {
          name: 'Transcribing',
          status: 'pending',
          description: 'Converting audio to text',
          progress: 0
        },
        {
          name: 'Medical Note Generation',
          status: 'pending',
          description: 'Generating structured medical note',
          progress: 0
        }
      ]);
    }
  }, [useFastTranscription]);

  const updateProcessingStage = (name: string, status: string, description?: string, progress: number = 0) => {
    setProcessingStages(prev => {
      const updatedStages = [...prev]
      const existingIndex = updatedStages.findIndex(stage => stage.name === name)
      
      const stageDescriptions = {
        'Audio Processing': 'Preparing audio file for transcription...',
        'Audio Transcription': 'Converting speech to text using AI...',
        'Medical Note Generation': 'Extracting medical information and creating structured note...',
        'Content Validation': 'Validating medical content quality...',
        'Final Review': 'Preparing note for review...'
      }
      
      if (existingIndex !== -1) {
        updatedStages[existingIndex] = {
          name,
          status,
          description: description || stageDescriptions[name as keyof typeof stageDescriptions] || '',
          progress
        }
      } else {
        updatedStages.push({
          name,
          status,
          description: description || stageDescriptions[name as keyof typeof stageDescriptions] || '',
          progress
        })
      }
      
      return updatedStages
    })
  }

  const processAudio = async () => {
    const currentFile = file;
    if (!currentFile || currentFile.size === 0) {
      toast({
        title: "No valid audio",
        description: "Please record or upload a valid audio file.",
        variant: "destructive",
      });
      return;
    }

    await processAudioWithFile(currentFile);
  };

  const processAudioWithFile = async (audioFile: File) => {
    
    if (!audioFile) {
      toast({
        title: "No Audio File",
        description: "Please record or upload a valid audio file.",
        variant: "destructive",
      });
      return;
    }
    
    if (audioFile.size === 0) {
      toast({
        title: "Empty Audio File",
        description: "The audio file is empty. Please record again or upload a different file.",
        variant: "destructive",
      });
      return;
    }
    
    if (audioFile.size < 1000) { // Less than 1KB is likely too small
      toast({
        title: "Audio File Too Small",
        description: "The audio file seems too small. Please record for a longer duration.",
        variant: "destructive",
      });
      return;
    }

    performanceMonitor.current.startTiming('audio-processing');
    initializeProcessingStages();
    setIsProcessing(true);

    try {
      
      // Add guidance toast for recorded audio
      if (audioFile.name.includes('recording')) {
        toast({
          title: "🎤 Processing Recording",
          description: "For best results, ensure your recording includes detailed patient information, symptoms, and examination findings.",
        });
      }
      
      if (useFastTranscription) {
        // Use the new ultra-fast transcription endpoint
        updateProcessingStage('Fast Transcription', 'processing', '', 0);
        
        // Animate progress for fast transcription
        animateStageProgress('Fast Transcription', 85, 3000); // Animate to 85% over 3 seconds
        
        // Prepare patient information for API call
        const patientData = {
          patientName: patientName.trim() || undefined,
          patientAge: patientAge.trim() || undefined,
          patientGender: patientGender || undefined,
        };
        
        const response = await apiClient.fastTranscription(audioFile, patientData, language);
        
        if (!response.success) {
          toast({
            title: "Transcription Failed",
            description: response.error || "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          updateProcessingStage('Fast Transcription', 'failed', '', 0);
          return;
        }
        
        const { data } = response;
        
        if (data && 'jobId' in data) {
          // Processing took >1 minute, need to poll
          processingJobId.current = data.jobId;
          completeStage('Fast Transcription'); // Complete at 100%
          updateProcessingStage('Medical Note Generation', 'processing', '', 0);
          animateStageProgress('Medical Note Generation', 90, 2000); // Animate note generation
          
          toast({
            title: "Processing Started",
            description: "Your audio is being transcribed. This may take a minute.",
          });
          
          if (data.jobId) {
            startPolling(data.jobId);
          } else {
            toast({
              title: "Processing Error",
              description: "Failed to start transcription. Please try again.",
              variant: "destructive",
            });
            setIsProcessing(false);
            updateProcessingStage('Fast Transcription', 'failed', '', 0);
          }
        } else {
          // Immediate result (under 1 minute)
          completeStage('Fast Transcription'); // Complete at 100%
          updateProcessingStage('Medical Note Generation', 'processing', '', 0);
          animateStageProgress('Medical Note Generation', 95, 1500); // Animate note generation
          
          // Handle immediate result
          setTimeout(() => {
            completeStage('Medical Note Generation'); // Complete at 100%
            if (data) {
              handleTranscriptionComplete(data);
            } else {
              toast({
                title: "Processing Error",
                description: "Failed to process transcription. Please try again.",
                variant: "destructive",
              });
              setIsProcessing(false);
              updateProcessingStage('Medical Note Generation', 'failed', '', 0);
            }
          }, 1500);
        }
      } else {
        // Use standard transcription endpoint
        updateProcessingStage('Transcribing', 'processing', '', 0);
        
        // Animate progress for standard transcription
        animateStageProgress('Transcribing', 80, 4000); // Animate to 80% over 4 seconds
        
        // Prepare patient information for API call
        const patientData = {
          patientName: patientName.trim() || undefined,
          patientAge: patientAge.trim() || undefined,
          patientGender: patientGender || undefined,
        };
        
        const response = await apiClient.startTranscription(audioFile, patientData, language);
        
        if (!response.success) {
          toast({
            title: "Transcription Failed",
            description: response.error || "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          updateProcessingStage('Transcribing', 'failed', '', 0);
          return;
        }
        
        const { data } = response;
        
        if (!data || !data.jobId) {
          toast({
            title: "Processing Error",
            description: "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          updateProcessingStage('Transcribing', 'failed', '', 0);
          return;
        }

        processingJobId.current = data.jobId;
        
        completeStage('Transcribing'); // Complete at 100%
        updateProcessingStage('Medical Note Generation', 'processing', '', 0);
        animateStageProgress('Medical Note Generation', 85, 3000); // Animate note generation
        
        toast({
          title: "Transcription Started",
          description: "Your audio is being transcribed. Please wait.",
        });

        if (data.jobId) {
          startPolling(data.jobId);
        } else {
          toast({
            title: "Processing Error",
            description: "Failed to start transcription. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
          updateProcessingStage('Transcribing', 'failed', '', 0);
        }
      }
      
    } catch (error) {
      setIsProcessing(false);
      updateProcessingStage(useFastTranscription ? 'Fast Transcription' : 'Transcribing', 'failed', '', 0);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startPolling = (jobId: string) => {
    const interval = setInterval(() => {
      pollTranscriptionStatus(jobId);
    }, 5000);
    pollingInterval.current = interval;
    pollTranscriptionStatus(jobId);
  };

  const pollTranscriptionStatus = async (jobId: string) => {
    try {
      const response = await apiClient.getTranscriptionResult(jobId);
      
      if (!response.success || !response.data) {
        toast({
          title: "Processing Error",
          description: response.error || "No data returned from server.",
          variant: "destructive",
        });
        setIsProcessing(false);
        updateProcessingStage(useFastTranscription ? 'Fast Transcription' : 'Transcribing', 'failed', '', 0);
        return;
      }
      const result = response.data;
      
      if (result.status === 'COMPLETED') {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        updateProcessingStage(useFastTranscription ? 'Fast Transcription' : 'Transcribing', 'completed', '', 100);
        updateProcessingStage('Medical Note Generation', 'processing', '', 0);
        
        // Handle completed transcription
        await handleTranscriptionComplete({
          transcript: result.transcript,
          language: language,
          processingTime: 'Completed'
        });
        
      } else if (result.status === 'FAILED') {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        
        updateProcessingStage(useFastTranscription ? 'Fast Transcription' : 'Transcribing', 'failed', '', 0);
        setIsProcessing(false);
        toast({
          title: "Processing Failed",
          description: "The transcription job failed. Please try again.",
          variant: "destructive",
        });
      }
      // If status is 'IN_PROGRESS' or 'QUEUED', continue polling
    } catch (error) {
      console.error('Error polling transcription status:', error);
      
      // Only stop polling for critical errors
      if (error instanceof Error && error.message.includes('404')) {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        
        updateProcessingStage(useFastTranscription ? 'Fast Transcription' : 'Transcribing', 'failed', '', 0);
        setIsProcessing(false);
        
        toast({
          title: "Job Not Found",
          description: "The transcription job was not found. Please try uploading again.",
          variant: "destructive",
        });
      } else {
        // For other errors, continue polling
        console.warn(`Non-critical polling error for job ${jobId}:`, error);
      }
    }
  };

  const handleTranscriptionComplete = async (transcriptionData: FastTranscriptionResponse | { transcript?: string; language: string; processingTime: string }) => {
    try {
      // Extract patient info and medical note data from API response
      const apiPatientInfo = 'patientInfo' in transcriptionData ? transcriptionData.patientInfo : undefined;
      const medicalNote = 'medicalNote' in transcriptionData ? transcriptionData.medicalNote : undefined;
      const jobId = 'jobId' in transcriptionData ? transcriptionData.jobId : undefined;
      
      // Use form patient information if provided, otherwise fall back to API data or defaults
      const finalPatientName = patientName.trim() || apiPatientInfo?.name || 'Patient Name';
      const finalPatientAge = parseInt(patientAge || apiPatientInfo?.age || '0', 10);
      const finalPatientGender = patientGender || apiPatientInfo?.gender || 'Not Specified';
      
      // Create note data with available information
      const noteData: MedicalNote = {
        patientName: finalPatientName,
        patientAge: finalPatientAge,
        patientGender: finalPatientGender,
        noteType: 'consultation',
        chiefComplaint: medicalNote?.chiefComplaint || 'To be documented',
        historyOfPresentIllness: medicalNote?.historyOfPresentIllness || 'To be documented',
        diagnosis: medicalNote?.diagnosis || 'To be documented',
        treatmentPlan: medicalNote?.treatmentPlan || 'To be documented',
        audioJobId: jobId
      };

      // Call the completion handler with the note data
      onTranscriptionComplete(noteData);
      
      // Clear patient information form after successful transcription (optional)
      // setPatientName('');
      // setPatientAge('');
      // setPatientGender('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transcription data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Demo audio file for the pre-recorded example
  const loadDemoFile = () => {
    // Enable demo mode when demo file is loaded
    setDemoMode(true)
    setShowDemoAlert(true)
    
    // Create a mock demo file
    const demoBlob = new Blob(["demo audio content"], { type: "audio/wav" })
    const demoFile = new File([demoBlob], "Ahmed_consultation_demo.wav", { type: "audio/wav" })
    setFile(demoFile)
    
    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(demoBlob)
    }
    
    // Reset states
    setDetectedKeywords([])
    setTranscriptionComplete(false)
    setProgress(0)
    
    toast({
      title: "Demo File Loaded",
      description: "Demo audio file loaded. You can now process it to see sample results.",
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-blue-500">
      <CardContent className="p-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showDemoAlert && demoMode && (
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Demo Mode Active</AlertTitle>
              <AlertDescription>
                This is a demonstration of NovateScribe AI. You can either record a short sample or upload the pre-recorded
                demo file.
                <Button variant="link" className="p-0 h-auto text-blue-500" onClick={() => setShowDemoAlert(false)}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-lg bg-white flex items-center justify-center shadow-lg border border-gray-100">
              <img 
                src="/novateLogo-removebg-preview.png" 
                alt="NovateScribe Logo" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  // Fallback to microphone icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Mic className="h-8 w-8 text-blue-500 hidden" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                NovateScribe AI
              </h2>
              <p className="text-muted-foreground text-center">Advanced Medical Voice Recognition</p>
            </div>
          </div>

          {/* Language Selector - Full Width */}
          <div className="w-full">
              <label className="text-sm font-medium mb-2 block">Common Language of Patients</label>
              <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select the common language of your patients" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>



          {/* Action Buttons - Equal Width Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 h-12"
                size="lg"
                disabled={isProcessing}
              >
                <Mic size={18} /> Start Recording
              </Button>
            ) : (
              <div className="col-span-1 md:col-span-2 flex gap-2">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className={`flex items-center justify-center gap-2 flex-1 h-12 ${
                    isPaused ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                  size="lg"
                  disabled={isProcessing}
                >
                  {isPaused ? (
                    <>
                      <Play size={18} /> Resume ({formatTime(recordingTime)})
                    </>
                  ) : (
                    <>
                      <Pause size={18} /> Pause ({formatTime(recordingTime)})
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 h-12 flex-1"
                  size="lg"
                  disabled={isProcessing}
                >
                  <span className="animate-pulse">●</span> Stop
                </Button>
              </div>
            )}

            <div className="relative">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 w-full h-12"
                onClick={() => document.getElementById("audio-upload")?.click()}
                disabled={isRecording || isProcessing}
              >
                <Upload size={18} /> Upload Audio File
              </Button>
              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isRecording || isProcessing}
              />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2 w-full h-12 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={loadDemoFile}
              disabled={isRecording || isProcessing}
            >
              <FileAudio size={18} /> Load Demo File
            </Button>
          </div>

          {/* Keywords section - disabled during recording to prevent fake keywords */}
          {!isRecording && detectedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 p-4 rounded-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium">Detected Medical Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedKeywords.map((keyword, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {file && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <FileAudio size={24} className="text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size > 1000 ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "Demo File"}
                    </p>
                  </div>
                  {file.size > 1000 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={togglePlayback}
                      disabled={isProcessing}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                  )}
                </div>

                <audio ref={audioRef} className="hidden" onEnded={() => setIsPlaying(false)} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="noise-reduction"
                      checked={noiseReduction}
                      onChange={(e) => setNoiseReduction(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    <label htmlFor="noise-reduction" className="text-sm">
                      Apply Noise Reduction
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fast-transcription"
                      checked={useFastTranscription}
                      onChange={(e) => setUseFastTranscription(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    <label htmlFor="fast-transcription" className="text-sm flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      Ultra-Fast Mode (30-60s)
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Patient language:{" "}
                      <span className="font-medium">
                        {language === "en-US"
                          ? "English (US)"
                          : language === "en-GB"
                            ? "English (UK)"
                            : language === "es-ES"
                              ? "Spanish"
                              : language === "fr-FR"
                                ? "French"
                                : language === "de-DE"
                                  ? "German"
                                  : language === "it-IT"
                                    ? "Italian"
                                    : language === "pt-PT"
                                      ? "Portuguese"
                                      : language === "ru-RU"
                                        ? "Russian"
                                        : language === "ja-JP"
                                          ? "Japanese"
                                          : language === "ko-KR"
                                            ? "Korean"
                                            : language === "zh-CN"
                                              ? "Chinese"
                                              : language === "ar-SA"
                                                ? "Arabic"
                                                : language === "hi-IN"
                                                  ? "Hindi"
                                                  : language === "ms-MY"
                                                    ? "Malay"
                                                    : language === "nl-NL"
                                                      ? "Dutch"
                                                      : language === "sv-SE"
                                                        ? "Swedish"
                                                        : language === "no-NO"
                                                          ? "Norwegian"
                                                          : language === "da-DK"
                                                            ? "Danish"
                                                            : language}
                      </span>
                    </span>
                  </div>
                  {useFastTranscription && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        <Zap className="h-3 w-3" />
                        <span>Fast Mode Active</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Patient Name Validation Warning */}
                {!patientName.trim() && (
                  <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-900 dark:text-yellow-100">Patient Name Recommended</AlertTitle>
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      For better AI accuracy, consider adding the patient's name above. This helps generate more personalized medical notes.
                    </AlertDescription>
                  </Alert>
                )}

                {!transcriptionComplete ? (
                  <Button
                    className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={processAudio}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        {useFastTranscription ? (
                          <>
                            <Zap size={18} /> Fast Transcribe (30-60s)
                          </>
                        ) : (
                          <>
                            <Wand2 size={18} /> Transcribe Audio
                          </>
                        )}
                      </>
                    )}
                  </Button>
                ) : transcriptionComplete ? (
                  <Button
                    className="w-full flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() =>
                      onTranscriptionComplete(
                        file.name.includes("Ahmed")
                          ? {
                              patientInfo: {
                                name: "Ahmed bin Ali",
                                age: 28,
                                gender: "Male",
                                visitDate: "17 May 2025",
                              },
                              chiefComplaint: "Sore throat for three days",
                              historyOfPresentIllness:
                                "Patient reports worsening of sore throat over the past three days, associated with difficulty swallowing and mild fever. No cough or runny nose.",
                              pastMedicalHistory: "No significant past medical history. No known drug allergies.",
                              systemReview:
                                "No other symptoms reported. No respiratory, cardiovascular, or gastrointestinal complaints.",
                              physicalExamination: {
                                vitals: {
                                  bloodPressure: "120/80 mmHg",
                                  heartRate: "78 bpm",
                                  temperature: "37.8°C",
                                  respiratoryRate: "16/min",
                                },
                                throat: "Erythematous pharynx with tonsillar enlargement. No exudates observed.",
                              },
                              diagnosis: "Acute pharyngitis, likely viral in origin",
                              managementPlan:
                                "Symptomatic treatment with paracetamol 1g QID PRN for fever and pain. Increase fluid intake. Salt water gargles. Return if symptoms worsen or persist beyond 5 days.",
                              medicationCertificate: "2 days of medical leave provided",
                            }
                          : {
                              patientInfo: {
                                name: "Ahmed bin Ali",
                                age: 28,
                                gender: "Male",
                                visitDate: "17 May 2025",
                              },
                              chiefComplaint: "Sore throat for three days",
                              historyOfPresentIllness: "",
                              pastMedicalHistory: "",
                              systemReview: "",
                              physicalExamination: {
                                vitals: {
                                  bloodPressure: "",
                                  heartRate: "",
                                  temperature: "",
                                  respiratoryRate: "",
                                },
                                throat: "",
                              },
                              diagnosis: "",
                              managementPlan: "",
                              medicationCertificate: "",
                            },
                      )
                    }
                  >
                    <Check size={18} /> View Medical Note
                  </Button>
                ) : null}

                {isProcessing && (
                  <div className="space-y-4">
                    <Progress value={overallProgress} className="h-2" />
                    
                    {/* Processing Stages */}
                    <div className="space-y-3">
                      {processingStages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            stage.status === 'completed' 
                              ? 'bg-green-500 text-white' 
                              : stage.status === 'processing' 
                                ? 'bg-blue-500 text-white' 
                                : stage.status === 'failed' || stage.status === 'error'
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-200 text-gray-500'
                          }`}>
                            {stage.status === 'completed' ? (
                              '100%'
                            ) : stage.status === 'processing' ? (
                              <div className="text-xs font-bold">
                                {stage.progress}%
                              </div>
                            ) : stage.status === 'failed' || stage.status === 'error' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              '0%'
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              stage.status === 'completed' 
                                ? 'text-green-600' 
                                : stage.status === 'processing' 
                                  ? 'text-blue-600' 
                                    : stage.status === 'failed' || stage.status === 'error'
                                    ? 'text-red-600' 
                                    : 'text-gray-500'
                            }`}>
                              {stage.name}
                            </p>
                              <span className={`text-xs font-medium ${
                                stage.status === 'completed' 
                                  ? 'text-green-600' 
                                  : stage.status === 'processing' 
                                    ? 'text-blue-600' 
                                    : stage.status === 'failed' || stage.status === 'error'
                                      ? 'text-red-600' 
                                      : 'text-gray-500'
                              }`}>
                                {stage.status === 'completed' ? 'Complete' : 
                                 stage.status === 'processing' ? `${stage.progress}%` :
                                 stage.status === 'failed' || stage.status === 'error' ? 'Failed' :
                                 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {stage.description}
                            </p>
                            
                            {/* Individual progress bar for each stage */}
                            {stage.status === 'processing' && (
                              <div className="mt-2">
                                <Progress value={stage.progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      {overallProgress < 25
                        ? "📤 Uploading and preparing audio file..."
                        : overallProgress < 50
                          ? "🎧 Transcribing audio to text..."
                          : overallProgress < 75
                            ? "🏥 Extracting medical information..."
                            : overallProgress < 100
                              ? "📝 Structuring medical note..."
                              : "✅ Finalizing transcription..."}
                    </p>
                  </div>
                )}
                {transcriptionComplete && (
                  <div className="space-y-2">
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-center text-green-600 font-medium">Transcription complete! (100%)</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  )
}
