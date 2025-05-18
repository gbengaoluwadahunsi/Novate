"use client"

import { useState } from "react"
import { Search, Filter, Plus, MoreHorizontal, Download, Eye, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useNotes } from "@/contexts/notes-context"

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [noteTypeFilter, setNoteTypeFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()
  const { notes, deleteNote } = useNotes()

  const filteredNotes = notes.filter(
    (note) =>
      (note.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (noteTypeFilter === "all" || note.noteType === noteTypeFilter),
  )

  const handleCreateNote = () => {
    router.push("/dashboard/transcribe")
  }

  const handleViewNote = (noteId) => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleDownloadNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    // Create a simple text representation of the note
    const noteText = `
Medical Note: ${note.id}
Patient: ${note.patientName} (ID: ${note.patientId})
Date: ${note.date}
Type: ${note.noteType}
Status: ${note.status}
Tags: ${note.tags?.join(", ")}

${note.content || "No content available."}
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
      description: `Note for ${note.patientName} has been downloaded.`,
    })
  }

  const handleDeleteNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    deleteNote(noteId)
    toast({
      title: "Note Deleted",
      description: `Note for ${note.patientName} has been deleted.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Notes</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Consultation Note">Consultation Notes</SelectItem>
              <SelectItem value="Lab Results">Lab Results</SelectItem>
              <SelectItem value="Treatment Plan">Treatment Plans</SelectItem>
              <SelectItem value="Prescription">Prescriptions</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreateNote} className="bg-sky-500 hover:bg-sky-600">
            <Plus className="h-4 w-4 mr-2" /> New Note
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left font-medium">Type</th>
              <th className="h-12 px-4 text-left font-medium">Date</th>
              <th className="h-12 px-4 text-left font-medium">Status</th>
              <th className="h-12 px-4 text-left font-medium">Tags</th>
              <th className="h-12 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <tr key={note.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 align-middle font-medium">{note.noteType}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span>{note.date}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
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
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewNote(note.id)}>
                          <Eye className="h-4 w-4 mr-2" /> View Note
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadNote(note.id)}>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  No notes found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
