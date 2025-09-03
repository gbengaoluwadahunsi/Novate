"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText, User, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type MedicalNote } from '@/lib/api-client'

export default function RawTranscriptPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const noteId = params.id as string
  
  const [note, setNote] = useState<MedicalNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchNote()
  }, [noteId])

  const fetchNote = async () => {
    if (!noteId) return
    
    try {
      setIsLoading(true)
      const response = await apiClient.getMedicalNote(noteId)
      
      if (response.success && response.data) {
        setNote(response.data || null)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch medical note",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching note:', error)
      toast({
        title: "Error",
        description: "Failed to fetch medical note",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleDownloadTranscript = () => {
    if (!note?.rawTranscript) return
    
    // Format the transcript with proper paragraphs before downloading
    const transcript = note.rawTranscript;
    
    // Split by multiple possible delimiters and clean up
    let paragraphs = transcript
      .split(/(?:\r?\n\s*){2,}|(?<=\.)\s+(?=[A-Z])|(?<=\.)\s+(?=Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/gi)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // If no natural breaks found, try to create them based on sentence structure
    if (paragraphs.length <= 1) {
      paragraphs = transcript
        .split(/(?<=\.)\s+(?=[A-Z])|(?<=\.)\s+(?=Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/gi)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }
    
    // If still no breaks, create artificial breaks every few sentences
    if (paragraphs.length <= 1) {
      const sentences = transcript.split(/(?<=[.!?])\s+/);
      paragraphs = [];
      let currentParagraph = '';
      
      sentences.forEach((sentence, index) => {
        currentParagraph += sentence + ' ';
        
        // Create a new paragraph every 3-4 sentences or when speaker changes
        if ((index + 1) % 3 === 0 || 
            /^(Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/i.test(sentence.trim())) {
          if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
            currentParagraph = '';
          }
        }
      });
      
      // Add any remaining text
      if (currentParagraph.trim()) {
        paragraphs.push(currentParagraph.trim());
      }
    }
    
    // Format the transcript with proper paragraph breaks
    const formattedTranscript = paragraphs
      .map(paragraph => {
        // Check if this is a speaker identification or greeting
        const isSpeaker = /^(Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician|Dr\.|Dr\s)/i.test(paragraph.trim());
        
        if (isSpeaker) {
          return `\n[SPEAKER] ${paragraph.trim()}\n`;
        } else {
          return paragraph.trim();
        }
      })
      .join('\n\n');
    
    // Create a text file with the formatted transcript
    const blob = new Blob([formattedTranscript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript_${note.patientName || 'patient'}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Transcript Downloaded",
      description: "Formatted transcript saved as text file"
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading transcript...</p>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Medical note not found</p>
          <Button onClick={handleBack}>Back to Note</Button>
        </div>
      </div>
    )
  }

  if (!note.rawTranscript) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">No raw transcript available for this note</p>
          <Button onClick={handleBack}>Back to Note</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 py-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="ml-1 text-xs sm:text-sm text-gray-600 hidden sm:inline">Back to Note</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 max-w-5xl">
        {/* Note Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Raw Transcript Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Patient</span>
                  <p className="font-medium text-sm">{note.patientName || 'Not mentioned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Date</span>
                  <p className="font-medium text-sm">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Not mentioned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <Clock className="h-4 w-4 text-purple-600" />
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Time</span>
                  <p className="font-medium text-sm">{note.createdAt ? new Date(note.createdAt).toLocaleTimeString() : 'Not mentioned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <FileText className="h-4 w-4 text-orange-600" />
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Type</span>
                  <p className="font-medium text-sm">Audio Transcript</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raw Transcript Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Original Audio Transcription</CardTitle>
            <p className="text-sm text-gray-600">
              This is the complete, unprocessed transcript from the audio recording. 
              It shows the exact conversation between the patient and healthcare provider.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="space-y-6">
                {(() => {
                  // Better paragraph detection and formatting
                  const transcript = note.rawTranscript;
                  
                  // Split by multiple possible delimiters and clean up
                  let paragraphs = transcript
                    .split(/(?:\r?\n\s*){2,}|(?<=\.)\s+(?=[A-Z])|(?<=\.)\s+(?=Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/gi)
                    .map(p => p.trim())
                    .filter(p => p.length > 0);
                  
                  // If no natural breaks found, try to create them based on sentence structure
                  if (paragraphs.length <= 1) {
                    paragraphs = transcript
                      .split(/(?<=\.)\s+(?=[A-Z])|(?<=\.)\s+(?=Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/gi)
                      .map(p => p.trim())
                      .filter(p => p.length > 0);
                  }
                  
                  // If still no breaks, create artificial breaks every few sentences
                  if (paragraphs.length <= 1) {
                    const sentences = transcript.split(/(?<=[.!?])\s+/);
                    paragraphs = [];
                    let currentParagraph = '';
                    
                    sentences.forEach((sentence, index) => {
                      currentParagraph += sentence + ' ';
                      
                      // Create a new paragraph every 3-4 sentences or when speaker changes
                      if ((index + 1) % 3 === 0 || 
                          /^(Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician)/i.test(sentence.trim())) {
                        if (currentParagraph.trim()) {
                          paragraphs.push(currentParagraph.trim());
                          currentParagraph = '';
                        }
                      }
                    });
                    
                    // Add any remaining text
                    if (currentParagraph.trim()) {
                      paragraphs.push(currentParagraph.trim());
                    }
                  }
                  
                  return paragraphs.map((paragraph, index) => {
                    // Skip empty paragraphs
                    if (!paragraph.trim()) return null;
                    
                    // Check if this is a speaker identification or greeting
                    const isSpeaker = /^(Good morning|Good afternoon|Good evening|Hello|Hi|I'm|I am|Patient|Doctor|Nurse|Provider|Physician|Dr\.|Dr\s)/i.test(paragraph.trim());
                    
                    // Check if this is a question (ends with ?)
                    const isQuestion = paragraph.trim().endsWith('?');
                    
                    // Check if this contains medical terminology or assessment
                    const hasMedicalContent = /(symptoms|diagnosis|assessment|examination|treatment|medication|history|allergy|temperature|blood pressure|pulse|respiratory|abdomen|pain|nausea|vomiting|diarrhea|fever)/i.test(paragraph);
                    
                    return (
                      <div key={index} className="border-l-4 border-transparent pl-4">
                        {isSpeaker ? (
                          // Speaker paragraphs get special formatting with colored border
                          <div className="border-l-4 border-blue-400 pl-4 -ml-4">
                            <div className="mb-3">
                              <span className="font-bold text-blue-800 dark:text-blue-200 text-base">
                                {paragraph.trim()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Regular content paragraphs
                          <div className={`${isQuestion ? 'border-l-4 border-green-400 pl-4 -ml-4' : ''} ${hasMedicalContent ? 'bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg' : ''}`}>
                            <p className={`text-sm leading-relaxed ${
                              isQuestion ? 'text-green-800 dark:text-green-200 font-medium' : 
                              hasMedicalContent ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {paragraph.trim()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            
            {/* Download Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleDownloadTranscript}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Transcript
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
