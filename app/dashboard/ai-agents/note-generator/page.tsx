"use client"

import { useState } from "react"
import { FilePlus, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

// Note types and interfaces
interface MedicalNote {
  id: string
  patientName: string
  patientAge: number
  patientGender: string
  date: string
  chiefComplaint: string
  status: "draft" | "complete" | "in-progress"
  completionPercentage: number
  sections: {
    [key: string]: {
      title: string
      content: string
      complete: boolean
    }
  }
}

export default function NoteGeneratorPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("recent")
  const [templateType, setTemplateType] = useState("general")
  const [autoSuggest, setAutoSuggest] = useState(true)
  const [autoFormat, setAutoFormat] = useState(true)
  const [medicalTerminology, setMedicalTerminology] = useState(true)
  const [includeICD, setIncludeICD] = useState(true)

  // Sample medical notes
  const [notes, setNotes] = useState<MedicalNote[]>([
    {
      id: "note-1",
      patientName: "Ahmed bin Ali",
      patientAge: 28,
      patientGender: "Male",
      date: "May 17, 2025",
      chiefComplaint: "Acute bronchitis",
      status: "complete",
      completionPercentage: 100,
      sections: {
        history: {
          title: "History of Present Illness",
          content:
            "Patient presents with a dry cough for over a week, fatigue, and had a slight fever two days ago. Reports shortness of breath after climbing stairs. No history of asthma or respiratory conditions.",
          complete: true,
        },
        examination: {
          title: "Physical Examination",
          content:
            "Vital signs stable. Wheezing noted in lungs upon auscultation. No signs of respiratory distress at rest.",
          complete: true,
        },
        diagnosis: {
          title: "Assessment & Diagnosis",
          content: "Acute bronchitis, likely viral in origin.",
          complete: true,
        },
        plan: {
          title: "Treatment Plan",
          content:
            "Prescribed inhaler for wheezing and cough. Recommended rest and increased fluid intake. Follow up in one week if symptoms persist or worsen.",
          complete: true,
        },
      },
    },
    {
      id: "note-2",
      patientName: "Layla bint Ali",
      patientAge: 34,
      patientGender: "Female",
      date: "May 18, 2025",
      chiefComplaint: "Chronic back pain",
      status: "draft",
      completionPercentage: 50,
      sections: {
        history: {
          title: "History of Present Illness",
          content:
            "Patient reports chronic back pain for the past six months, worsened by lifting heavy objects. No significant trauma history.",
          complete: true,
        },
        examination: {
          title: "Physical Examination",
          content:
            "Range of motion limited in lower back. Tenderness noted on palpation. No neurological deficits observed.",
          complete: false,
        },
        diagnosis: {
          title: "Assessment & Diagnosis",
          content: "Suspected lumbar strain.",
          complete: false,
        },
        plan: {
          title: "Treatment Plan",
          content: "Prescribed muscle relaxant and NSAIDs. Recommended physical therapy sessions twice a week.",
          complete: false,
        },
      },
    },
  ])

  // Function to create a new note
  const createNewNote = () => {
    const newNote: MedicalNote = {
      id: `note-${notes.length + 1}`,
      patientName: "",
      patientAge: 0,
      patientGender: "",
      date: new Date().toLocaleDateString(),
      chiefComplaint: "",
      status: "draft",
      completionPercentage: 0,
      sections: {
        history: {
          title: "History of Present Illness",
          content: "",
          complete: false,
        },
        examination: {
          title: "Physical Examination",
          content: "",
          complete: false,
        },
        diagnosis: {
          title: "Assessment & Diagnosis",
          content: "",
          complete: false,
        },
        plan: {
          title: "Treatment Plan",
          content: "",
          complete: false,
        },
      },
    }
    setNotes([...notes, newNote])
  }

  // Function to update note status
  const updateNoteStatus = (noteId: string, newStatus: "draft" | "complete" | "in-progress") => {
    setNotes(
      notes.map((note) => {
        if (note.id === noteId) {
          return { ...note, status: newStatus }
        }
        return note
      }),
    )
  }

  // Function to update note completion percentage
  const updateNoteCompletionPercentage = (noteId: string, newPercentage: number) => {
    setNotes(
      notes.map((note) => {
        if (note.id === noteId) {
          return { ...note, completionPercentage: newPercentage }
        }
        return note
      }),
    )
  }

  // Function to update note sections
  const updateNoteSection = (noteId: string, sectionKey: string, newContent: string, isComplete: boolean) => {
    setNotes(
      notes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            sections: {
              ...note.sections,
              [sectionKey]: {
                ...note.sections[sectionKey],
                content: newContent,
                complete: isComplete,
              },
            },
          }
        }
        return note
      }),
    )
  }

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recent">Recent Notes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle>{note.patientName}</CardTitle>
                  <CardDescription>{note.chiefComplaint}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge>{note.status}</Badge>
                    <Progress value={note.completionPercentage} />
                  </div>
                  {Object.values(note.sections).map((section) => (
                    <div key={section.title} className="mt-4">
                      <h3 className="font-semibold">{section.title}</h3>
                      <p>{section.content}</p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => updateNoteStatus(note.id, "in-progress")}>
                    <ChevronRight className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({ title: "Note saved", description: "Your note has been saved successfully." })
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Save
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <Button className="mt-4" onClick={createNewNote}>
            <FilePlus className="mr-2 h-4 w-4" /> Create New Note
          </Button>
        </TabsContent>
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Templates will be listed here */}</div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto Suggest</span>
              <Switch checked={autoSuggest} onCheckedChange={setAutoSuggest} />
            </div>
            <div className="flex items-center justify-between">
              <span>Auto Format</span>
              <Switch checked={autoFormat} onCheckedChange={setAutoFormat} />
            </div>
            <div className="flex items-center justify-between">
              <span>Medical Terminology</span>
              <Switch checked={medicalTerminology} onCheckedChange={setMedicalTerminology} />
            </div>
            <div className="flex items-center justify-between">
              <span>Include ICD Codes</span>
              <Switch checked={includeICD} onCheckedChange={setIncludeICD} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
