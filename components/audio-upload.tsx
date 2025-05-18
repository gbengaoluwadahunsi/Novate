"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, FileAudio, Mic, Play, Pause, Sparkles, Languages, Wand2, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AudioUploadProps {
  onTranscriptionComplete: (transcription: any) => void
}

export default function AudioUpload({ onTranscriptionComplete }: AudioUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [language, setLanguage] = useState("en")
  const [enhancementLevel, setEnhancementLevel] = useState("standard")
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [demoMode, setDemoMode] = useState(true)
  const [showDemoAlert, setShowDemoAlert] = useState(true)
  const [transcriptionComplete, setTranscriptionComplete] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Simulate keyword detection during recording
  useEffect(() => {
    if (isRecording && recordingTime > 0) {
      // First set of keywords at 5 seconds
      if (recordingTime === 5) {
        setDetectedKeywords(["patient", "Ahmed bin Ali", "28 years old", "male"])
      }
      // Second set at 10 seconds
      else if (recordingTime === 10) {
        setDetectedKeywords((prev) => [...prev, "sore throat", "three days"])
      }
      // Third set at 15 seconds
      else if (recordingTime === 15) {
        setDetectedKeywords((prev) => [...prev, "fever", "difficulty swallowing"])
      }
    }
  }, [isRecording, recordingTime])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(e.target.files[0])
      }
      // Reset keywords for new file
      setDetectedKeywords([])
      setTranscriptionComplete(false)
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        chunksRef.current.push(e.data)
      })

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" })
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" })
        setFile(audioFile)
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob)
        }
        chunksRef.current = []
      })

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      setDetectedKeywords([])
      setTranscriptionComplete(false)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast({
        title: "Recording Started",
        description: "Speak clearly to record your medical notes.",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
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
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Recording Stopped",
        description: `Recording completed (${formatTime(recordingTime)})`,
      })

      // In demo mode, if recording was longer than 10 seconds, automatically process
      if (demoMode && recordingTime > 10) {
        setTimeout(() => {
          processPartialTranscription()
        }, 1000)
      }
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
      historyOfPresentingIllness: "",
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

  const processAudio = async () => {
    if (!file) return

    setIsProcessing(true)
    setTranscriptionComplete(false)

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    try {
      // In a real implementation, you would upload the file to your server here
      // and get back the transcription

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Mock transcription result - complete version
      const mockTranscription = {
        patientInfo: {
          name: "Ahmed bin Ali",
          age: 28,
          gender: "Male",
          visitDate: "17 May 2025",
        },
        chiefComplaint: "Sore throat for three days",
        historyOfPresentingIllness:
          "Patient reports worsening of sore throat over the past three days, associated with difficulty swallowing and mild fever. No cough or runny nose.",
        pastMedicalHistory: "No significant past medical history. No known drug allergies.",
        systemReview: "No other symptoms reported. No respiratory, cardiovascular, or gastrointestinal complaints.",
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

      clearInterval(interval)
      setProgress(100)
      setTranscriptionComplete(true)

      // Wait a bit before completing to show 100% progress
      setTimeout(() => {
        onTranscriptionComplete(mockTranscription)
        setIsProcessing(false)
        toast({
          title: "Transcription Complete",
          description: "Your audio has been successfully transcribed with all medical details.",
        })
      }, 500)
    } catch (error) {
      console.error("Error processing audio:", error)
      clearInterval(interval)
      setIsProcessing(false)
      toast({
        title: "Processing Error",
        description: "There was an error processing your audio file.",
        variant: "destructive",
      })
    }
  }

  // Demo audio file for the pre-recorded example
  const loadDemoFile = () => {
    // Create a mock file object
    const mockFile = new File(
      [new ArrayBuffer(1000)], // dummy content
      "Patient Consultation - Ahmed bin Ali.mp3",
      { type: "audio/mp3" },
    )
    setFile(mockFile)
    setTranscriptionComplete(false)
    setDetectedKeywords([
      "patient",
      "Ahmed bin Ali",
      "28 years old",
      "male",
      "sore throat",
      "fever",
      "difficulty swallowing",
    ])
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
                This is a demonstration of Mad Katip AI. You can either record a short sample or upload the pre-recorded
                demo file.
                <Button variant="link" className="p-0 h-auto text-blue-500" onClick={() => setShowDemoAlert(false)}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center text-blue-500">Mad Katip AI</h2>
            <p className="text-muted-foreground text-center">Advanced Medical Voice Recognition</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="ms">Malay</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Enhancement Level</label>
              <Select value={enhancementLevel} onValueChange={setEnhancementLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select enhancement level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="enhanced">Enhanced</SelectItem>
                  <SelectItem value="premium">Premium (AI-Powered)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
              size="lg"
              disabled={isProcessing}
            >
              {isRecording ? (
                <>
                  <span className="animate-pulse">●</span> Stop Recording ({formatTime(recordingTime)})
                </>
              ) : (
                <>
                  <Mic size={18} /> Start Recording
                </>
              )}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2 relative w-full sm:w-auto"
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

            {demoMode && (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2 relative w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={loadDemoFile}
                disabled={isRecording || isProcessing}
              >
                <FileAudio size={18} /> Load Demo File
              </Button>
            )}
          </div>

          {isRecording && detectedKeywords.length > 0 && (
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
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Transcribing in:{" "}
                      <span className="font-medium">
                        {language === "en"
                          ? "English"
                          : language === "ar"
                            ? "Arabic"
                            : language === "ms"
                              ? "Malay"
                              : language === "zh"
                                ? "Chinese"
                                : language === "hi"
                                  ? "Hindi"
                                  : "Spanish"}
                      </span>
                    </span>
                  </div>
                </div>

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
                        <Wand2 size={18} /> Transcribe Audio
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
                              historyOfPresentingIllness:
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
                              historyOfPresentingIllness: "",
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
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {progress < 50
                        ? "Analyzing audio..."
                        : progress < 80
                          ? "Extracting medical information..."
                          : progress < 100
                            ? "Structuring medical note..."
                            : "Finalizing transcription..."}
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
