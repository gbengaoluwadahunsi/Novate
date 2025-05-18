"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Mic,
  Pause,
  X,
  Settings,
  Volume2,
  VolumeX,
  AudioWaveformIcon as Waveform,
  FileText,
  Check,
  AlertCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function ConversationListenerPage() {
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [noiseReduction, setNoiseReduction] = useState(true)
  const [voiceEnhancement, setVoiceEnhancement] = useState(true)
  const [autoRedaction, setAutoRedaction] = useState(true)
  const [sensitivityLevel, setSensitivityLevel] = useState(75)
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([])
  const [transcriptLines, setTranscriptLines] = useState<{ role: string; text: string; timestamp: string }[]>([])
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start recording
  const startListening = () => {
    setIsListening(true)
    setIsPaused(false)
    setRecordingTime(0)
    setDetectedKeywords([])
    setTranscriptLines([])
    setIsCompleted(false)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Simulate audio level changes
    audioLevelRef.current = setInterval(() => {
      setAudioLevel(Math.random() * 100)
    }, 100)

    toast({
      title: "Recording Started",
      description: "The AI agent is now listening to your conversation.",
    })

    // Simulate transcript generation
    simulateTranscript()
  }

  // Pause recording
  const pauseListening = () => {
    setIsPaused(true)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current)
      setAudioLevel(0)
    }

    toast({
      title: "Recording Paused",
      description: "You can resume recording at any time.",
    })
  }

  // Resume recording
  const resumeListening = () => {
    setIsPaused(false)

    // Restart timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Restart audio level simulation
    audioLevelRef.current = setInterval(() => {
      setAudioLevel(Math.random() * 100)
    }, 100)

    toast({
      title: "Recording Resumed",
      description: "The AI agent is listening again.",
    })

    // Continue transcript simulation
    simulateTranscript()
  }

  // Stop recording
  const stopListening = () => {
    setIsListening(false)
    setIsPaused(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (audioLevelRef.current) {
      clearInterval(audioLevelRef.current)
      setAudioLevel(0)
    }

    // Start processing
    processRecording()

    toast({
      title: "Recording Stopped",
      description: `${formatTime(recordingTime)} of audio recorded. Processing will begin shortly.`,
    })
  }

  // Process the recording
  const processRecording = () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setIsCompleted(true)

          toast({
            title: "Processing Complete",
            description: "Your conversation has been processed and is ready for review.",
          })

          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  // Simulate transcript generation
  const simulateTranscript = () => {
    // Sample doctor-patient conversation about a respiratory condition
    const conversation = [
      { role: "Doctor", text: "Good morning, how are you feeling today?", delay: 2000 },
      { role: "Patient", text: "Not very well, doctor. I've had this cough for over a week now.", delay: 4000 },
      { role: "Doctor", text: "I'm sorry to hear that. Can you tell me more about your symptoms?", delay: 3000 },
      { role: "Patient", text: "I have a dry cough, especially at night. And I've been feeling tired.", delay: 4000 },
      { role: "Doctor", text: "Any fever or shortness of breath?", delay: 2000 },
      {
        role: "Patient",
        text: "I had a slight fever two days ago, but not anymore. Sometimes I feel short of breath after climbing stairs.",
        delay: 5000,
      },
      { role: "Doctor", text: "Let me listen to your lungs. Take a deep breath, please.", delay: 3000 },
      { role: "Doctor", text: "And again... Good. Now from the back.", delay: 4000 },
      {
        role: "Doctor",
        text: "I can hear some wheezing in your lungs. Have you had any history of asthma or respiratory conditions?",
        delay: 4000,
      },
      { role: "Patient", text: "No, never. This is the first time I've had something like this.", delay: 3000 },
      {
        role: "Doctor",
        text: "Based on your symptoms and examination, this could be acute bronchitis. It's usually caused by a viral infection.",
        delay: 5000,
      },
      {
        role: "Doctor",
        text: "I'll prescribe you an inhaler to help with the wheezing and cough. And make sure to rest and drink plenty of fluids.",
        delay: 5000,
      },
      { role: "Patient", text: "How long will it take to get better?", delay: 2000 },
      {
        role: "Doctor",
        text: "Most cases improve within 1-2 weeks. If you don't see improvement in a week, or if symptoms worsen, please come back.",
        delay: 5000,
      },
      { role: "Patient", text: "Thank you, doctor.", delay: 2000 },
      { role: "Doctor", text: "You're welcome. Take care and rest well.", delay: 2000 },
    ]

    // Add lines with delays
    let currentDelay = 0

    conversation.forEach((line, index) => {
      currentDelay += line.delay

      setTimeout(() => {
        if (isListening && !isPaused) {
          const timestamp = formatTime(recordingTime + Math.floor(currentDelay / 1000))

          setTranscriptLines((prev) => [
            ...prev,
            {
              role: line.role,
              text: line.text,
              timestamp,
            },
          ])

          // Add keywords at specific points
          if (index === 2) {
            setDetectedKeywords((prev) => [...prev, "cough", "fatigue"])
          } else if (index === 5) {
            setDetectedKeywords((prev) => [...prev, "fever", "shortness of breath"])
          } else if (index === 8) {
            setDetectedKeywords((prev) => [...prev, "wheezing", "lungs"])
          } else if (index === 11) {
            setDetectedKeywords((prev) => [...prev, "acute bronchitis", "viral infection"])
          } else if (index === 13) {
            setDetectedKeywords((prev) => [...prev, "inhaler", "rest", "fluids"])
          }
        }
      }, currentDelay)
    })
  }

  // Scroll to bottom of transcript when new lines are added
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [transcriptLines])

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current)
      }
    }
  }, [])

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
          <Mic className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Conversation Listener</h1>
          <p className="text-muted-foreground">Automatically record and transcribe doctor-patient conversations</p>
        </div>
      </motion.div>

      <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>Demo Mode</AlertTitle>
        <AlertDescription>
          This is a demonstration of the AI Conversation Listener. In a real environment, it would record and transcribe
          actual conversations.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Recording Controls</CardTitle>
              <CardDescription>Start, pause, or stop recording your conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                {!isListening && !isProcessing && !isCompleted ? (
                  <>
                    <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <Mic className="h-12 w-12 text-emerald-600" />
                    </div>
                    <Button onClick={startListening} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                      Start Listening
                    </Button>
                  </>
                ) : isListening && !isPaused ? (
                  <>
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Mic className="h-12 w-12 text-red-600" />
                    </div>
                    <div className="text-2xl font-mono mb-4">{formatTime(recordingTime)}</div>
                    <div className="w-full max-w-md mb-6">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-100"
                          style={{ width: `${audioLevel}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={pauseListening} variant="outline" size="lg">
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </Button>
                      <Button onClick={stopListening} variant="destructive" size="lg">
                        <X className="mr-2 h-4 w-4" /> Stop
                      </Button>
                    </div>
                  </>
                ) : isListening && isPaused ? (
                  <>
                    <div className="h-24 w-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                      <Pause className="h-12 w-12 text-amber-600" />
                    </div>
                    <div className="text-2xl font-mono mb-4">{formatTime(recordingTime)}</div>
                    <p className="text-amber-600 mb-6">Recording paused</p>
                    <div className="flex gap-4">
                      <Button onClick={resumeListening} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                        <Mic className="mr-2 h-4 w-4" /> Resume
                      </Button>
                      <Button onClick={stopListening} variant="destructive" size="lg">
                        <X className="mr-2 h-4 w-4" /> Stop
                      </Button>
                    </div>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <Waveform className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Processing Conversation</h3>
                    <p className="text-muted-foreground mb-4">Please wait while we analyze your conversation</p>
                    <div className="w-full max-w-md mb-2">
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {processingProgress < 30 && "Enhancing audio quality..."}
                      {processingProgress >= 30 && processingProgress < 60 && "Transcribing conversation..."}
                      {processingProgress >= 60 && processingProgress < 90 && "Identifying medical terms..."}
                      {processingProgress >= 90 && "Finalizing transcript..."}
                    </p>
                  </>
                ) : isCompleted ? (
                  <>
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <Check className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Processing Complete</h3>
                    <p className="text-muted-foreground mb-6">Your conversation has been processed successfully</p>
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setIsCompleted(false)
                          setDetectedKeywords([])
                          setTranscriptLines([])
                        }}
                      >
                        <Mic className="mr-2 h-4 w-4" /> New Recording
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700" size="lg">
                        <FileText className="mr-2 h-4 w-4" /> View Medical Note
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transcript">
            <TabsList className="mb-4">
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="keywords">
                Detected Keywords {detectedKeywords.length > 0 && `(${detectedKeywords.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Conversation Transcript</CardTitle>
                  <CardDescription>Real-time transcription of the conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
                    {transcriptLines.length > 0 ? (
                      transcriptLines.map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${line.role === "Doctor" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`flex gap-3 max-w-[80%] ${
                              line.role === "Doctor" ? "flex-row" : "flex-row-reverse"
                            }`}
                          >
                            <div
                              className={`rounded-lg p-3 ${
                                line.role === "Doctor" ? "bg-emerald-100 text-emerald-900" : "bg-blue-100 text-blue-900"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="font-medium text-sm">{line.role}</div>
                                <div className="text-xs opacity-70">{line.timestamp}</div>
                              </div>
                              <div className="mt-1 text-sm">{line.text}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Waveform className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No transcript yet</h3>
                        <p className="text-muted-foreground max-w-md">
                          Start recording to see the conversation transcript appear here in real-time
                        </p>
                      </div>
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Detected Medical Keywords</CardTitle>
                  <CardDescription>Important medical terms identified in the conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  {detectedKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detectedKeywords.map((keyword, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                            {keyword}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No keywords detected</h3>
                      <p className="text-muted-foreground max-w-md">
                        Start recording to see medical keywords detected from your conversation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listener Settings</CardTitle>
              <CardDescription>Configure how the conversation listener works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Microphone Sensitivity</h4>
                    <p className="text-sm text-muted-foreground">Adjust how sensitive the microphone is</p>
                  </div>
                  <span className="text-sm font-medium">{sensitivityLevel}%</span>
                </div>
                <Slider
                  value={[sensitivityLevel]}
                  onValueChange={(value) => setSensitivityLevel(value[0])}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Less sensitive</span>
                  <span>More sensitive</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Noise Reduction</h4>
                    <p className="text-sm text-muted-foreground">Filter out background noise</p>
                  </div>
                </div>
                <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Voice Enhancement</h4>
                    <p className="text-sm text-muted-foreground">Enhance voice clarity and volume</p>
                  </div>
                </div>
                <Switch checked={voiceEnhancement} onCheckedChange={setVoiceEnhancement} />
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Auto-Redaction</h4>
                    <p className="text-sm text-muted-foreground">Automatically redact patient identifiers</p>
                  </div>
                </div>
                <Switch checked={autoRedaction} onCheckedChange={setAutoRedaction} />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Settings className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Best Results</CardTitle>
              <CardDescription>How to get the most accurate transcriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Speak Clearly</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Speak at a normal pace and volume, avoiding mumbling or speaking too quickly.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Reduce Background Noise</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Close windows and doors, and turn off noisy equipment when possible.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Position the Microphone</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Place the device with the microphone between you and the patient, about 2-3 feet away.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">4</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Review and Edit</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Always review the generated medical note for accuracy before finalizing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
