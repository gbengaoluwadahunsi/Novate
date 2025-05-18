"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  HelpCircle,
  Search,
  MessageSquare,
  FileQuestion,
  BookOpen,
  Mail,
  Phone,
  Video,
  Mic,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Sample FAQ data
const faqs = [
  {
    question: "How do I record a new patient consultation?",
    answer:
      "To record a new patient consultation, navigate to the Transcribe page from the dashboard. Click on 'Start Recording' and speak clearly into your microphone. The AI will automatically transcribe your voice into a structured medical note.",
    category: "Recording",
  },
  {
    question: "Can I edit the transcribed medical notes?",
    answer:
      "Yes, after transcription is complete, you can edit any section of the medical note. Click on the edit icon next to each section to make changes. Once you're satisfied, click 'Save' to finalize the note.",
    category: "Editing",
  },
  {
    question: "How accurate is the voice recognition?",
    answer:
      "Our AI-powered voice recognition is trained on medical terminology and achieves over 95% accuracy for most users. The accuracy improves over time as the system learns your voice patterns and vocabulary.",
    category: "Accuracy",
  },
  {
    question: "Can I use Mad Katip AI in multiple languages?",
    answer:
      "Yes, Mad Katip AI supports multiple languages including English, Arabic, Spanish, French, and Chinese. You can select your preferred language from the dropdown menu before starting a recording.",
    category: "Languages",
  },
  {
    question: "How do I export or print my medical notes?",
    answer:
      "After creating a medical note, you can export it as a PDF or Word document by clicking the 'Export' button. To print, simply click the 'Print' button and select your printer from the dialog that appears.",
    category: "Export",
  },
  {
    question: "Is my patient data secure?",
    answer:
      "Yes, we take data security very seriously. All patient data is encrypted both in transit and at rest. We comply with healthcare data protection regulations and implement strict access controls.",
    category: "Security",
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactSubject, setContactSubject] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const { toast } = useToast()

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Support Request Submitted",
      description: "We've received your message and will respond shortly.",
    })
    // Reset form
    setContactName("")
    setContactEmail("")
    setContactSubject("")
    setContactMessage("")
  }

  const handleScheduleDemo = () => {
    toast({
      title: "Demo Scheduling",
      description: "This feature is not available in the demo version.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">Get help and learn how to use Mad Katip AI</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for help topics..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" /> Frequently Asked Questions
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Contact Support
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about Mad Katip AI</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <div className="space-y-6">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or browse all FAQs</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Contact our support team
                </a>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Send us a message and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="What is your question about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail"
                      rows={6}
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto">
                      Submit Support Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Reach out to us directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-muted-foreground">support@madkatip.ai</p>
                      <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-5PM EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Demo</CardTitle>
                  <CardDescription>Get a personalized walkthrough</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Live Demo</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule a 30-minute session with our product specialists to see Mad Katip AI in action.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleScheduleDemo} variant="outline" className="w-full">
                    Schedule Demo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Guides, tutorials, and documentation to help you get the most out of Mad Katip AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Getting Started Guide",
                    description: "Learn the basics of Mad Katip AI and how to set up your account",
                    icon: BookOpen,
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    title: "Video Tutorials",
                    description: "Step-by-step video guides for all features",
                    icon: Video,
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    title: "API Documentation",
                    description: "Technical documentation for developers",
                    icon: FileQuestion,
                    color: "bg-purple-100 text-purple-700",
                  },
                  {
                    title: "Best Practices",
                    description: "Tips and tricks for optimal use of voice transcription",
                    icon: Mic,
                    color: "bg-orange-100 text-orange-700",
                  },
                  {
                    title: "Release Notes",
                    description: "Latest updates and feature releases",
                    icon: FileText,
                    color: "bg-red-100 text-red-700",
                  },
                  {
                    title: "Community Forum",
                    description: "Connect with other users and share experiences",
                    icon: MessageSquare,
                    color: "bg-yellow-100 text-yellow-700",
                  },
                ].map((resource, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <div
                      className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 ${resource.color}`}
                    >
                      <resource.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    <Button variant="link" className="p-0 h-auto text-blue-500">
                      View Resource
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
