"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Printer, Share2, Trash2, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useNotes } from "@/contexts/notes-context"

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { notes, deleteNote } = useNotes()
  const [note, setNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  useEffect(() => {
    if (params.id && notes.length > 0) {
      const foundNote = notes.find((n) => n.id === params.id)
      if (foundNote) {
        setNote(foundNote)
        setEditedContent(foundNote.content || "")
      }
    }
  }, [params.id, notes])

  const handleBack = () => {
    router.push("/dashboard/notes")
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // In a real app, you would update the note in your state management
    // For now, we'll just show a toast
    setIsEditing(false)
    toast({
      title: "Note Updated",
      description: "Your changes have been saved.",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!note) return

    // Create a simple text representation of the note
    const noteText = `
Medical Note: ${note.id}
Patient: ${note.patientName} (ID: ${note.patientId})
Date: ${note.date}
Type: ${note.noteType}
Status: ${note.status}
Tags: ${note.tags?.join(", ")}

${note.content || editedContent || "No content available."}
    `.trim()

    // Create a blob and download it
    const blob = new Blob([noteText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-note-${note.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note Downloaded",
      description: `Note has been downloaded.`,
    })
  }

  const handleShare = () => {
    toast({
      title: "Share Feature",
      description: "Sharing functionality would be implemented here.",
    })
  }

  const handleDelete = () => {
    if (!note) return

    deleteNote(note.id)
    toast({
      title: "Note Deleted",
      description: `Note has been deleted.`,
    })
    router.push("/dashboard/notes")
  }

  if (!note) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Note Not Found</h2>
            <p className="text-muted-foreground mb-4">The note you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={handleBack}>Return to Notes</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medical Note</CardTitle>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600">
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                )}
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Note Content</h3>
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[300px]"
                  />
                ) : (
                  <div className="p-4 border rounded-md min-h-[300px] whitespace-pre-wrap">
                    {note.content || editedContent || "No content available."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Note Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Note ID</h3>
                  <p>{note.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                  <p>{note.patientName}</p>
                  <p className="text-sm text-muted-foreground">ID: {note.patientId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{note.date}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p>{note.noteType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant="outline"
                    className={
                      note.status === "Completed"
                        ? "bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                    }
                  >
                    {note.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                  <p>{note.doctor}</p>
                  <p className="text-sm text-muted-foreground">{note.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
