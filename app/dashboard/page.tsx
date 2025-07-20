"use client"

import Link from "next/link"
import { FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import ClientOnly from "@/components/client-only"
import { useUserDashboardStats } from "@/hooks/use-dashboard-stats"
import { useAppSelector } from "@/store/hooks"

export default function Dashboard() {
  const { stats: userStats, loading: statsLoading, error: statsError } = useUserDashboardStats()
  const { user } = useAppSelector((state) => state.auth)
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true)
      setError(null)
      try {
        // Fetch recent notes (for the authenticated user) - limit to 5
        const notesRes = await apiClient.getMedicalNotes({ page: 1, limit: 5 });
        if (notesRes.success && notesRes.data && Array.isArray(notesRes.data.notes)) {
          setRecentNotes(notesRes.data.notes || []);
        } else {
          setRecentNotes([]);
        }
      } catch (e) {
        console.error('Error fetching notes:', e);
        setError('Failed to load recent notes');
        setRecentNotes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  // Format time saved
  const formatTimeSaved = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return "0h 0m";
    }
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <ClientOnly fallback={<div className="flex-1 p-8">Loading dashboard...</div>}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome {user?.name ? user.name.split(' ')[0] : user?.firstName || 'NovateScribe'}
          </h2>
          <Link href="/dashboard/transcribe">
            <Button className="bg-sky-500 hover:bg-sky-600">New Transcription</Button>
          </Link>
        </div>
        <p className="text-muted-foreground">Your AI-powered medical documentation assistant</p>

        {(statsError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {statsError || error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
              <FileText className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? "-" : (userStats?.notesCreated ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? "-" : formatTimeSaved(userStats?.timeSavedSeconds ?? 0)}</div>
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
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading recent notes...</div>
                ) : !Array.isArray(recentNotes) || recentNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No recent notes</p>
                    <p className="text-sm">Your latest medical notes will appear here</p>
                  </div>
                ) : recentNotes.map((note, index) => (
                  <div key={note?.id || Math.random()} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-cyan-600">
                        {note?.patientName || `Medical Case ${String(index + 1).padStart(3, '0')}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {note?.createdAt ? new Date(note.createdAt).toLocaleDateString() + ' at ' + new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                        {note?.noteType || "Note"}
                      </span>
                      <Link href={`/dashboard/notes/${note?.id || ''}`}>
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
    </ClientOnly>
  )
}
