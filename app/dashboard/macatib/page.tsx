"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AudioUpload from "@/components/audio-upload"
import MedicalNoteWithSidebar from "@/components/medical-note-with-sidebar"
import { useToast } from "@/hooks/use-toast"

export default function NovatePage() {
  const [transcriptionData, setTranscriptionData] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const handleTranscriptionComplete = (data: any) => {
    setTranscriptionData(data)
    setIsSaved(false)
  }

  const handleSaveMedicalNote = (data: any) => {
    // In a real app, this would save to a database
    // Saving medical note
    setIsSaved(true)

    toast({
      title: "Medical Note Saved",
      description: "The medical note has been saved to the database.",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-500">Novate</h1>
          <p className="text-muted-foreground mt-2">Medical Voice Assistant for Automated Transcription</p>
        </div>
      </motion.div>

      {!transcriptionData ? (
        <AudioUpload onTranscriptionComplete={handleTranscriptionComplete} />
      ) : (
        <MedicalNoteWithSidebar 
          note={transcriptionData} 
          onSave={handleSaveMedicalNote}
          onDownload={() => {
            // TODO: Add download functionality
            console.log('Download clicked')
          }}
          onShare={() => {
            // TODO: Add share functionality
            console.log('Share clicked')
          }}
          onViewHistory={() => {
            // TODO: Add view history functionality
            console.log('View history clicked')
          }}
          onPreview={() => {
            // TODO: Add preview functionality
            console.log('Preview clicked')
          }}
        />
      )}
    </div>
  )
}
