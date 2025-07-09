"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Send, Mic, User, Bot, Sparkles, Loader2, Clipboard, Check, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Suggested prompts
const suggestedPrompts = [
  "Summarize the latest research on hypertension treatment",
  "What are the common drug interactions with Warfarin?",
  "Explain the differential diagnosis for chest pain",
  "What are the guidelines for managing type 2 diabetes?",
  "How should I document a patient with suspected COVID-19?",
]

// Type for sample responses
type SampleResponses = {
  [key: string]: string;
};

// Sample responses for demo purposes
const sampleResponses: SampleResponses = {
  "Summarize the latest research on hypertension treatment":
    "Recent research on hypertension treatment emphasizes personalized approaches based on comorbidities. The 2023 guidelines recommend initiating treatment with ACE inhibitors, ARBs, or calcium channel blockers for most patients. Studies show combination therapy at lower doses may be more effective than monotherapy at higher doses. SGLT2 inhibitors have shown cardiovascular benefits beyond blood pressure control. Lifestyle modifications remain foundational, with emphasis on the DASH diet, sodium restriction, and regular physical activity.",
  "What are the common drug interactions with Warfarin?":
    "Warfarin has numerous significant drug interactions. NSAIDs increase bleeding risk by affecting platelet function. Antibiotics like ciprofloxacin and metronidazole inhibit warfarin metabolism, increasing anticoagulant effects. Antifungals (fluconazole) and amiodarone similarly increase INR. Conversely, rifampin, barbiturates, and carbamazepine induce metabolism, reducing effectiveness. Dietary supplements like St. John's Wort decrease efficacy, while ginkgo biloba increases bleeding risk. Regular INR monitoring is essential when starting or stopping any medication in patients on warfarin.",
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          sampleResponses[input] ||
          "I don't have specific information on that topic yet. Would you like me to search for recent medical literature on this subject?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  // Handle voice input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    setIsListening(true)

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast({
        title: "Speech Recognition Error",
        description: "There was an error processing your speech.",
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  // Handle copy to clipboard
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    })
  }

  // Handle download conversation
  const handleDownload = () => {
    if (messages.length === 0) return

    const text = messages.map((msg) => `${msg.role === "user" ? "You" : "AI Assistant"}: ${msg.content}`).join("\n\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `novate-conversation-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Conversation downloaded",
      description: "Your conversation has been downloaded as a text file.",
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Medical Assistant</h1>
            <p className="text-muted-foreground">Your intelligent medical knowledge companion</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="chat" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="border-gradient">
            <CardHeader className="pb-3">
              <CardTitle>Medical AI Assistant</CardTitle>
              <CardDescription>
                Ask medical questions, get summaries of research, or help with documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                      <Sparkles className="h-10 w-10 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-muted-foreground max-w-md">
                      Ask me about medical conditions, treatment guidelines, or help with documentation.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className={message.role === "assistant" ? "border border-purple-200" : ""}>
                          {message.role === "user" ? (
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="font-medium text-sm">
                              {message.role === "user" ? "You" : "AI Assistant"}
                            </div>
                            <div className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <div className="mt-1 text-sm whitespace-pre-wrap">{message.content}</div>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 text-xs opacity-70 hover:opacity-100"
                              onClick={() => handleCopy(message.id, message.content)}
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : (
                                <Clipboard className="h-3 w-3 mr-1" />
                              )}
                              {copiedId === message.id ? "Copied" : "Copy"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3 max-w-[80%]">
                      <Avatar className="border border-purple-200">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length > 0 && (
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" /> Save Conversation
                  </Button>
                </div>
              )}

              {messages.length === 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Suggested prompts:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors py-2"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Type your medical question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || isListening}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  className={isListening ? "bg-red-100 text-red-500" : ""}
                >
                  {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <p>
                Novate AI Assistant provides information based on medical literature but does not replace professional
                medical advice.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Medical Knowledge Base</CardTitle>
              <CardDescription>Access comprehensive medical information and guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Clinical Guidelines",
                    description: "Evidence-based recommendations for diagnosis and treatment",
                    icon: FileText,
                    color: "text-blue-500",
                  },
                  {
                    title: "Drug Database",
                    description: "Comprehensive information on medications and interactions",
                    icon: Clipboard,
                    color: "text-green-500",
                  },
                  {
                    title: "Medical Research",
                    description: "Latest studies and publications in medical science",
                    icon: Brain,
                    color: "text-purple-500",
                  },
                  {
                    title: "Documentation Templates",
                    description: "Standardized templates for medical documentation",
                    icon: FileText,
                    color: "text-orange-500",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>Access your previous conversations with the AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Actual conversation history would be implemented here */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Today's Conversation</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()} • {messages.length} messages
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {messages[0]?.content.substring(0, 100)}...
                      </p>
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm">
                          View Full Conversation
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground">
                      Start chatting with the AI assistant to see your conversation history.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
