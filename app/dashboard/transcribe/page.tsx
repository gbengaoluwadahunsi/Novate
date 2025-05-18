"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Upload, FileAudio, Info, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import MedicalNoteWithSidebar from "@/components/medical-note-with-sidebar"
import { useToast } from "@/hooks/use-toast"
import { useNotes } from "@/contexts/notes-context"

export default function TranscribePage() {
  const [activeTab, setActiveTab] = useState("record")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [processingStage, setProcessingStage] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState("english")
  const [enhancementLevel, setEnhancementLevel] = useState("medium")
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [transcriptionData, setTranscriptionData] = useState<any>(null)
  const [isPartialTranscription, setIsPartialTranscription] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcriptionComplete, setTranscriptionComplete] = useState(false)
  const [showNewTranscriptionButton, setShowNewTranscriptionButton] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const { toast } = useToast()
  const { addNote } = useNotes()

  // Handle recording state
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Reset state
      setIsRecording(true)
      setRecordingTime(0)
      setDetectedKeywords([])
      audioChunksRef.current = []
      setTranscriptionComplete(false)
      setProcessingProgress(0)
      setProcessingStage("")
      setShowNewTranscriptionButton(false)

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start()

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Simulate keyword detection during recording
      setTimeout(() => {
        setDetectedKeywords(["Ahmed bin Ali", "28 years old", "male"])
      }, 5000)

      setTimeout(() => {
        setDetectedKeywords((prev) => [...prev, "sore throat", "three days"])
      }, 10000)

      toast({
        title: "Recording Started",
        description: "Speak clearly for best transcription results.",
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
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      toast({
        title: "Recording Stopped",
        description: `${formatTime(recordingTime)} of audio recorded.`,
      })

      // Begin processing the recording
      processRecording(true) // true = partial transcription (as in the demo)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setTranscriptionComplete(false)
      setProcessingProgress(0)
      setProcessingStage("")
      setShowNewTranscriptionButton(false)
      toast({
        title: "File Selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      })
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const processFile = () => {
    if (!selectedFile) return

    toast({
      title: "Processing Audio File",
      description: "Your file is being transcribed. This may take a moment.",
    })

    // Process the uploaded file (full transcription)
    processRecording(false) // false = full transcription
  }

  // Load demo file
  const loadDemoFile = () => {
    setSelectedFile(new File([new ArrayBuffer(1000)], "patient_consultation.mp3", { type: "audio/mp3" }))
    setTranscriptionComplete(false)
    setProcessingProgress(0)
    setProcessingStage("")
    setShowNewTranscriptionButton(false)
    toast({
      title: "Demo File Loaded",
      description: "Demo file ready for processing.",
    })
  }

  // Process the recording or uploaded file
  const processRecording = (isPartial: boolean) => {
    setProcessingStage("enhancing")
    setProcessingProgress(0)
    setIsPartialTranscription(isPartial)

    // Simulate processing stages
    const stages = [
      { name: "enhancing", label: "Enhancing audio quality", duration: 1000 },
      { name: "transcribing", label: "Transcribing audio", duration: 1500 },
      { name: "analyzing", label: "Analyzing medical terms", duration: 1000 },
      { name: "formatting", label: "Formatting medical note", duration: 1000 },
      { name: "complete", label: "Transcription complete", duration: 500 },
    ]

    let currentStage = 0
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0)

    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProcessingStage(stages[currentStage].name)

        // Calculate progress based on completed stages plus current stage progress
        const completedDuration = stages.slice(0, currentStage).reduce((sum, stage) => sum + stage.duration, 0)
        const stageProgress = (completedDuration / totalDuration) * 100

        setProcessingProgress(stageProgress)

        currentStage++
      } else {
        clearInterval(interval)
        setProcessingProgress(100)
        setTranscriptionComplete(true)
        setShowNewTranscriptionButton(true)

        // Generate transcription data
        setTimeout(() => {
          generateTranscriptionData(isPartial)
        }, 500)
      }
    }, stages[currentStage].duration)
  }

  // Generate sample transcription data
  const generateTranscriptionData = (isPartial: boolean) => {
    // Basic patient info that would be detected in both partial and full transcriptions
    const baseData = {
      patientInfo: {
        name: "Ahmed bin Ali",
        age: 28,
        gender: "Male",
        visitDate: "17 May 2025",
      },
      chiefComplaint: "Sore throat for three days",
    }

    // For partial transcription (from recording demo), leave most fields empty
    if (isPartial) {
      const partialData = {
        ...baseData,
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

      setTranscriptionData(partialData)
    }
    // For full transcription (from uploaded file demo), include all fields
    else {
      const fullData = {
        ...baseData,
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

      setTranscriptionData(fullData)
    }
  }

  // Handle saving the medical note
  const handleSaveMedicalNote = (data: any) => {
    console.log("Saving medical note:", data)

    // Add the note to our notes context
    addNote({
      patientName: data.patientInfo.name,
      patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
      noteType: "Consultation Note",
      date: data.patientInfo.visitDate,
      doctor: "Dr. Sarah Johnson",
      department: "General Medicine",
      status: "Completed",
      tags: ["Sore throat", "Fever"],
      content: data.historyOfPresentingIllness || data.chiefComplaint,
    })

    toast({
      title: "Medical Note Saved",
      description: "The medical note has been saved to the database.",
    })

    // Reset state but keep transcriptionComplete true
    setTranscriptionData(null)
    setSelectedFile(null)
    setRecordingTime(0)
    setProcessingProgress(0)
    setDetectedKeywords([])
    setActiveTab("record")
    setTranscriptionComplete(true)
    setShowNewTranscriptionButton(true)
  }

  // Handle new transcription button click
  const handleNewTranscription = () => {
    setTranscriptionComplete(false)
    setProcessingProgress(0)
    setProcessingStage("")
    setSelectedFile(null)
    setShowNewTranscriptionButton(false)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop any ongoing recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // If we have transcription data, show the medical note editor
  if (transcriptionData) {
    return <MedicalNoteWithSidebar initialData={transcriptionData} onSave={handleSaveMedicalNote} />
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>This is a demonstration. No actual audio is being processed.</AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="record">Record Audio</TabsTrigger>
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="space-y-6">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                {!isRecording && processingStage === "" && !transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <Mic className="h-12 w-12 text-sky-500" />
                    </div>
                    <Button onClick={startRecording} className="bg-sky-500 hover:bg-sky-600" size="lg">
                      Start Recording
                    </Button>
                  </>
                ) : isRecording ? (
                  <>
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Mic className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="text-xl font-mono mb-4">{formatTime(recordingTime)}</div>
                    <Button onClick={stopRecording} variant="destructive" size="lg">
                      Stop Recording
                    </Button>
                  </>
                ) : processingStage !== "" && !transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <Mic className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="w-full max-w-md mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {processingStage === "enhancing" && "Enhancing audio quality..."}
                          {processingStage === "transcribing" && "Transcribing audio..."}
                          {processingStage === "analyzing" && "Analyzing medical terms..."}
                          {processingStage === "formatting" && "Formatting medical note..."}
                          {processingStage === "complete" && "Transcription complete!"}
                        </span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  </>
                ) : transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <Mic className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium">Transcription complete!</h3>
                    </div>
                    <div className="w-full max-w-md mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transcription complete!</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    {showNewTranscriptionButton && (
                      <Button onClick={handleNewTranscription} className="bg-sky-500 hover:bg-sky-600" size="lg">
                        New Transcription
                      </Button>
                    )}
                  </>
                ) : null}
              </div>

              {isRecording && detectedKeywords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Detected Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {detectedKeywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                {!selectedFile && processingStage === "" && !transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <Upload className="h-12 w-12 text-sky-500" />
                    </div>
                    <p className="text-center mb-6 text-muted-foreground">Upload an audio file or use our demo file</p>
                    <div className="flex gap-4">
                      <Button onClick={handleUploadClick} className="bg-sky-500 hover:bg-sky-600">
                        Upload Audio
                      </Button>
                      <Button onClick={loadDemoFile} variant="outline">
                        Load Demo File
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="audio/*"
                        className="hidden"
                      />
                    </div>
                  </>
                ) : selectedFile && processingStage === "" && !transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <FileAudio className="h-12 w-12 text-sky-500" />
                    </div>
                    <p className="font-medium mb-1">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {selectedFile.size > 1000 ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Demo File"}
                    </p>
                    <div className="flex gap-4">
                      <Button onClick={processFile} className="bg-sky-500 hover:bg-sky-600">
                        Process File
                      </Button>
                      <Button onClick={() => setSelectedFile(null)} variant="outline">
                        Change File
                      </Button>
                    </div>
                  </>
                ) : processingStage !== "" && !transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <FileAudio className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="w-full max-w-md mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {processingStage === "enhancing" && "Enhancing audio quality..."}
                          {processingStage === "transcribing" && "Transcribing audio..."}
                          {processingStage === "analyzing" && "Analyzing medical terms..."}
                          {processingStage === "formatting" && "Formatting medical note..."}
                          {processingStage === "complete" && "Transcription complete!"}
                        </span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  </>
                ) : transcriptionComplete ? (
                  <>
                    <div className="h-24 w-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                      <Check className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium">Transcription complete!</h3>
                    </div>
                    <div className="w-full max-w-md mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transcription complete!</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    {showNewTranscriptionButton && (
                      <Button onClick={handleNewTranscription} className="bg-sky-500 hover:bg-sky-600" size="lg">
                        New Transcription
                      </Button>
                    )}
                  </>
                ) : null}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                  <SelectItem value="malay">Malay</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
