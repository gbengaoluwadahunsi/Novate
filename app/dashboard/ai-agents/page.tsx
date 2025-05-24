"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bot,
  Mic,
  FileText,
  Brain,
  Info,
  Play,
  Sparkles,
  AlertCircle,
  Check,
  ChevronRight,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Agent types and interfaces
type AgentStatus = "inactive" | "listening" | "processing" | "active" | "paused"

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: AgentStatus
  enabled: boolean
  accuracy?: number
  lastActive?: string
  insights?: number
}

interface AgentInsight {
  id: string
  agentId: string
  title: string
  description: string
  date: string
  type: "tip" | "pattern" | "alert"
  read: boolean
}

export default function AIAgentsPage() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "listener",
      name: "Conversation Listener",
      description: "Automatically listens to and records doctor-patient conversations",
      icon: Mic,
      status: "inactive",
      enabled: false,
      accuracy: 98,
      lastActive: "Never",
    },
    {
      id: "note-generator",
      name: "Medical Note Generator",
      description: "Converts recorded conversations into structured medical notes",
      icon: FileText,
      status: "inactive",
      enabled: false,
      accuracy: 94,
      lastActive: "Never",
    },
    {
      id: "pattern-analyzer",
      name: "Pattern Analyzer",
      description: "Studies patterns in medical notes and doctor behaviors",
      icon: Brain,
      status: "inactive",
      enabled: false,
      accuracy: 89,
      lastActive: "Never",
      insights: 0,
    },
    {
      id: "advisor",
      name: "Doctor Advisor",
      description: "Provides tips and suggestions based on patterns and best practices",
      icon: Lightbulb,
      status: "inactive",
      enabled: false,
      accuracy: 92,
      lastActive: "Never",
      insights: 0,
    },
  ])

  const [insights, setInsights] = useState<AgentInsight[]>([])
  const [isListening, setIsListening] = useState(false)
  const [listeningTime, setListeningTime] = useState(0)
  const [sensitivityLevel, setSensitivityLevel] = useState(75)
  const [privacyMode, setPrivacyMode] = useState(true)
  const [activeDemo, setActiveDemo] = useState(false)

  // Toggle agent enabled status
  const toggleAgent = (agentId: string) => {
    setAgents(
      agents.map((agent) => {
        if (agent.id === agentId) {
          const newEnabled = !agent.enabled

          // Show toast notification
          toast({
            title: `${agent.name} ${newEnabled ? "Enabled" : "Disabled"}`,
            description: newEnabled
              ? `${agent.name} is now active and ready to assist you.`
              : `${agent.name} has been turned off.`,
          })

          return {
            ...agent,
            enabled: newEnabled,
            status: newEnabled ? "active" : "inactive",
          }
        }
        return agent
      }),
    )
  }

  // Start demo mode
  const startDemo = () => {
    if (activeDemo) return

    setActiveDemo(true)
    setIsListening(true)

    // Update agents to show them as active
    setAgents(
      agents.map((agent) => ({
        ...agent,
        enabled: true,
        status: agent.id === "listener" ? "listening" : "active",
        lastActive: "Just now",
      })),
    )

    // Generate demo insights after a delay
    setTimeout(() => {
      const demoInsights: AgentInsight[] = [
        {
          id: "insight-1",
          agentId: "pattern-analyzer",
          title: "Documentation Pattern Detected",
          description:
            "You tend to document respiratory symptoms more thoroughly than cardiovascular ones. Consider using the structured template for cardiovascular exams.",
          date: "Just now",
          type: "pattern",
          read: false,
        },
        {
          id: "insight-2",
          agentId: "advisor",
          title: "Time Optimization Tip",
          description:
            "Recording notes immediately after patient visits saves you an average of 12 minutes per patient compared to end-of-day documentation.",
          date: "Just now",
          type: "tip",
          read: false,
        },
        {
          id: "insight-3",
          agentId: "note-generator",
          title: "Medical Terminology Alert",
          description:
            "The term 'dyspnea' was used inconsistently in recent notes. Consider standardizing terminology for better tracking of patient symptoms over time.",
          date: "Just now",
          type: "alert",
          read: false,
        },
      ]

      setInsights(demoInsights)

      // Update agent insights count
      setAgents(
        agents.map((agent) => {
          if (agent.id === "pattern-analyzer" || agent.id === "advisor") {
            return {
              ...agent,
              insights: agent.id === "pattern-analyzer" ? 2 : 1,
            }
          }
          return agent
        }),
      )

      toast({
        title: "New Insights Available",
        description: "Your AI agents have generated 3 new insights based on your patterns.",
      })
    }, 5000)
  }

  // Stop demo mode
  const stopDemo = () => {
    setActiveDemo(false)
    setIsListening(false)

    // Reset agents to inactive
    setAgents(
      agents.map((agent) => ({
        ...agent,
        status: agent.enabled ? "active" : "inactive",
      })),
    )

    toast({
      title: "Demo Mode Stopped",
      description: "AI agents have stopped the demonstration.",
    })
  }

  // Mark insight as read
  const markInsightAsRead = (insightId: string) => {
    setInsights(
      insights.map((insight) => {
        if (insight.id === insightId) {
          return {
            ...insight,
            read: true,
          }
        }
        return insight
      }),
    )
  }

  // Clear all insights
  const clearAllInsights = () => {
    setInsights([])

    // Reset insight counts
    setAgents(
      agents.map((agent) => ({
        ...agent,
        insights: 0,
      })),
    )

    toast({
      title: "Insights Cleared",
      description: "All insights have been cleared from your dashboard.",
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Intelligent assistants that enhance your medical practice</p>
        </div>
      </motion.div>

      <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>AI Agents are in Beta</AlertTitle>
        <AlertDescription>
          These intelligent agents are currently in beta testing. Your feedback helps us improve their accuracy and
          usefulness.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="agents">
            <TabsList className="mb-4">
              <TabsTrigger value="agents">My Agents</TabsTrigger>
              <TabsTrigger value="insights">Insights {insights.length > 0 && `(${insights.length})`}</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden ${agent.enabled ? "border-emerald-500/50" : ""}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-full ${agent.enabled ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                            >
                              <agent.icon className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                          </div>
                          <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.id)} />
                        </div>
                        <CardDescription>{agent.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Status:</span>
                            <Badge
                              variant="outline"
                              className={`
                                ${agent.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
                                ${agent.status === "listening" ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse" : ""}
                                ${agent.status === "processing" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}
                                ${agent.status === "inactive" ? "bg-gray-100 text-gray-700 border-gray-200" : ""}
                                ${agent.status === "paused" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                              `}
                            >
                              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                            </Badge>
                          </div>
                          {agent.accuracy && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Accuracy:</span>
                              <span
                                className={`${agent.accuracy > 95 ? "text-emerald-600" : agent.accuracy > 90 ? "text-blue-600" : "text-amber-600"}`}
                              >
                                {agent.accuracy}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Last active:</span>
                            <span>{agent.lastActive}</span>
                          </div>
                          {agent.insights !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Insights:</span>
                              <span>{agent.insights}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Demo Mode</CardTitle>
                  <CardDescription>Try out the AI agents with a simulated conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  {!activeDemo ? (
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <Play className="h-8 w-8 text-emerald-600" />
                      </div>
                      <p className="text-center mb-4 text-muted-foreground">
                        Start a demo to see how AI agents can assist with your medical documentation
                      </p>
                      <Button onClick={startDemo} className="bg-emerald-600 hover:bg-emerald-700">
                        Start Demo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                          <Mic className="h-8 w-8 text-red-600" />
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-medium">AI Agents are listening...</p>
                        <p className="text-muted-foreground">Simulating a doctor-patient conversation</p>
                      </div>

                      <div className="flex justify-center">
                        <Button variant="destructive" onClick={stopDemo} className="mt-2">
                          Stop Demo
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              {insights.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Recent Insights</h3>
                    <Button variant="outline" size="sm" onClick={clearAllInsights}>
                      Clear All
                    </Button>
                  </div>

                  {insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`${!insight.read ? "border-l-4 border-l-emerald-500" : ""}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-2 rounded-full 
                                ${insight.type === "tip" ? "bg-emerald-100 text-emerald-600" : ""}
                                ${insight.type === "pattern" ? "bg-blue-100 text-blue-600" : ""}
                                ${insight.type === "alert" ? "bg-amber-100 text-amber-600" : ""}
                              `}
                              >
                                {insight.type === "tip" && <Lightbulb className="h-4 w-4" />}
                                {insight.type === "pattern" && <Brain className="h-4 w-4" />}
                                {insight.type === "alert" && <AlertCircle className="h-4 w-4" />}
                              </div>
                              <CardTitle className="text-base">{insight.title}</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {insight.date}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between">
                          <div className="text-xs text-muted-foreground">
                            From: {agents.find((a) => a.id === insight.agentId)?.name}
                          </div>
                          <div className="flex gap-2">
                            {!insight.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => markInsightAsRead(insight.id)}
                              >
                                <Check className="h-3 w-3 mr-1" /> Mark as read
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No insights yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Enable AI agents and start using the app to receive personalized insights and recommendations.
                    </p>
                    <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={startDemo}>
                      Try Demo Mode
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Settings</CardTitle>
                  <CardDescription>Configure how your AI agents work and interact with your practice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Listening Sensitivity</h4>
                        <p className="text-sm text-muted-foreground">
                          Adjust how sensitive the conversation listener is to speech
                        </p>
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
                    <div>
                      <h4 className="font-medium">Privacy Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically redact patient identifiable information
                      </p>
                    </div>
                    <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t">
                    <div>
                      <h4 className="font-medium">Auto-Start Recording</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically start recording when a patient visit begins
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t">
                    <div>
                      <h4 className="font-medium">Real-time Transcription</h4>
                      <p className="text-sm text-muted-foreground">
                        Show transcription in real-time during conversations
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t">
                    <div>
                      <h4 className="font-medium">Insight Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when new insights are available
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Activity</CardTitle>
              <CardDescription>Recent activity from your AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDemo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-emerald-200">
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        <Mic className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Conversation Listener</p>
                        <span className="text-xs text-muted-foreground">Now</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Recording conversation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-emerald-200">
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        <FileText className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Medical Note Generator</p>
                        <span className="text-xs text-muted-foreground">Now</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Preparing to generate note</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-emerald-200">
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Pattern Analyzer</p>
                        <span className="text-xs text-muted-foreground">Now</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Analyzing conversation patterns</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium mb-1">No recent activity</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Enable AI agents and start using the app to see activity here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>How to get the most from your AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Enable the Conversation Listener</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Toggle on the Conversation Listener agent to automatically record doctor-patient conversations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Configure Privacy Settings</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ensure Privacy Mode is enabled to automatically redact patient identifiable information.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Enable Pattern Analysis</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Turn on the Pattern Analyzer to start receiving insights about your documentation habits.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-emerald-600">4</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Review AI-Generated Notes</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    After each conversation, review and edit the AI-generated medical notes before finalizing.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Full Documentation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
