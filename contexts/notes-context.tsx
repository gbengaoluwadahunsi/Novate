"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Note {
  id: string
  patientName: string
  patientId: string
  noteType: string
  date: string
  doctor: string
  department: string
  status: string
  tags: string[]
  content?: string
  createdAt: number
}

interface NotesContextType {
  notes: Note[]
  addNote: (note: Omit<Note, "id" | "createdAt">) => void
  deleteNote: (id: string) => void
  getNoteById: (id: string) => Note | undefined
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

// Sample initial notes
const initialNotes: Note[] = [
  {
    id: "MN001",
    patientName: "Ahmed bin Ali",
    patientId: "P001",
    noteType: "Consultation Note",
    date: "17 May 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Completed",
    tags: ["Acute pharyngitis", "Sore throat"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
  },
  {
    id: "MN002",
    patientName: "Fatima Al Mansouri",
    patientId: "P002",
    noteType: "Lab Results",
    date: "12 May 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Completed",
    tags: ["Hypertension", "Blood work"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
  },
  {
    id: "MN003",
    patientName: "Mohammed Al Hashimi",
    patientId: "P003",
    noteType: "Treatment Plan",
    date: "5 May 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Completed",
    tags: ["Type 2 Diabetes", "Medication adjustment"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13, // 13 days ago
  },
  {
    id: "MN004",
    patientName: "Aisha Abdullah",
    patientId: "P004",
    noteType: "Prescription",
    date: "30 April 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Completed",
    tags: ["Allergic rhinitis", "Antihistamines"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18, // 18 days ago
  },
  {
    id: "MN005",
    patientName: "Khalid Al Mazrouei",
    patientId: "P005",
    noteType: "Consultation Note",
    date: "25 April 2025",
    doctor: "Dr. Sarah Johnson",
    department: "General Medicine",
    status: "Draft",
    tags: ["Osteoarthritis", "Joint pain"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 23, // 23 days ago
  },
]

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [mounted, setMounted] = useState(false)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load notes from localStorage on mount
  useEffect(() => {
    if (!mounted) return
    
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem("novate-notes")
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes))
        } catch (error) {
          // Error parsing saved notes
          // Use initial notes if parsing fails
          setNotes(initialNotes)
          localStorage.setItem("novate-notes", JSON.stringify(initialNotes))
        }
      } else {
        // Use initial notes if no saved notes exist
        setNotes(initialNotes)
        localStorage.setItem("novate-notes", JSON.stringify(initialNotes))
      }
    }
  }, [mounted])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (!mounted) return
    
    if (notes.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem("novate-notes", JSON.stringify(notes))
    }
  }, [notes, mounted])

  const addNote = (note: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...note,
      id: `MN${String(notes.length + 1).padStart(3, "0")}`,
      createdAt: Date.now(),
    }

    setNotes((prevNotes) => [newNote, ...prevNotes])
  }

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
  }

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id)
  }

  return <NotesContext.Provider value={{ notes, addNote, deleteNote, getNoteById }}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
