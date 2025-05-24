import Link from "next/link"
import { FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  // Mock data - in a real app, this would come from a database or API
  const notesCount = 24
  const timeSaved = "8h 45m"
  const recentNotes = [
    { id: 1, title: "Patient Consultation - John Doe", date: "Today, 2:30 PM", type: "Consultation" },
    { id: 2, title: "Follow-up - Sarah Smith", date: "Yesterday, 10:15 AM", type: "Follow-up" },
    { id: 3, title: "Initial Assessment - Mike Johnson", date: "May 15, 2025", type: "Assessment" },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Novate</h2>
        <Link href="/dashboard/transcribe">
          <Button className="bg-sky-500 hover:bg-sky-600">New Transcription</Button>
        </Link>
      </div>
      <p className="text-muted-foreground">Your AI-powered medical documentation assistant</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
            <FileText className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeSaved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>Your recently created medical notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{note.title}</p>
                    <p className="text-sm text-muted-foreground">{note.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">{note.type}</span>
                    <Link href={`/dashboard/notes/${note.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
