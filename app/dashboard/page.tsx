"use client"

import Link from "next/link"
import { FileText, Clock, Mic } from "lucide-react"
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
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0) // 🚨 ADD: Deduplicated total count

  // Generate consistent case number for notes without patient names
  const generateCaseNumber = (note: any, allNotes?: any[]) => {
    if (note.patientName && note.patientName.trim() && note.patientName !== 'N/A') {
      return note.patientName
    }
    
    // Use all available notes or fallback to current notes list
    const notesList = allNotes || recentNotes
    
    // Get only notes WITHOUT patient names, sorted chronologically
    const unnamedNotes = notesList
      .filter(n => !n.patientName || n.patientName.trim() === '' || n.patientName === 'N/A')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    // Find position of current note among unnamed notes only
    const position = unnamedNotes.findIndex(n => n.id === note.id) + 1
    
    // Fallback if note not found
    if (position === 0) {
      return 'Medical Case 001'
    }
    
    return `Medical Case ${String(position).padStart(3, '0')}`
  }

  useEffect(() => {
    async function fetchNotesAndCount() {
      setLoading(true)
      setError(null)
      try {
        // Fetch ALL notes to get accurate deduplicated count
        const allNotesRes = await apiClient.getMedicalNotes({ page: 1, limit: 1000 }); // Get all notes
        let allNotes = [];
        let totalDeduplicatedCount = 0;
        
        if (allNotesRes.success && allNotesRes.data && Array.isArray(allNotesRes.data.notes)) {
          allNotes = allNotesRes.data.notes || [];
          
          // 🚨 DEDUPLICATION: Apply same logic as notes page
          const uniqueAllNotes = allNotes.filter((note, index, array) => {
            const firstIndexById = array.findIndex(n => n.id === note.id);
            if (firstIndexById !== index) return false;
            
            const similarNotes = array.filter((n, idx) => {
              if (idx >= index) return false;
              const timeDiff = Math.abs(
                new Date(note.createdAt || 0).getTime() - 
                new Date(n.createdAt || 0).getTime()
              );
              const isWithin5Minutes = timeDiff < 5 * 60 * 1000;
              
              return n.patientName === note.patientName && 
                     n.patientAge === note.patientAge &&
                     n.patientGender === note.patientGender &&
                     isWithin5Minutes;
            });
            
            return similarNotes.length === 0;
          });
          
          totalDeduplicatedCount = uniqueAllNotes.length;
          
          // Set recent notes (first 5 from deduplicated list)
          const sortedRecentNotes = uniqueAllNotes
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || a.updatedAt || 0);
              const dateB = new Date(b.createdAt || b.updatedAt || 0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5);
            
          setRecentNotes(sortedRecentNotes);
          
          console.log('🚨 DASHBOARD TOTAL COUNT DEDUPLICATION:', {
            originalCount: allNotes.length,
            deduplicatedCount: totalDeduplicatedCount,
            duplicatesRemoved: allNotes.length - totalDeduplicatedCount
          });
        }
        
        setTotalNotesCount(totalDeduplicatedCount);
        
      } catch (e) {
        console.error('Error fetching notes:', e);
        setError('Failed to load notes');
        setRecentNotes([]);
        setTotalNotesCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchNotesAndCount();
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
      <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome {user?.name ? user.name.split(' ')[0] : user?.firstName || 'NovateScribe'}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Your AI-powered medical documentation assistant</p>
          </div>
          <Link href="/dashboard/transcribe" className="w-full md:w-auto">
            <Button className="bg-sky-500 hover:bg-sky-600 w-full md:w-auto">
              <span className="hidden sm:inline">New Transcription</span>
              <span className="sm:hidden">New Recording</span>
            </Button>
          </Link>
        </div>

        {(statsError || error) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
            {statsError || error}
          </div>
        )}

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
              <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-sky-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {loading ? "-" : totalNotesCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Medical notes generated
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{statsLoading ? "-" : formatTimeSaved(userStats?.timeSavedSeconds ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Through AI automation
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Notes</CardTitle>
            <CardDescription className="text-sm">Your recently created medical notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-pulse space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !Array.isArray(recentNotes) || recentNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-base font-medium mb-2">No recent notes</p>
                  <p className="text-sm mb-4">Your latest medical notes will appear here</p>
                  <Link href="/dashboard/transcribe">
                    <Button size="sm">
                      <Mic className="h-4 w-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </Link>
                </div>
              ) : (
                recentNotes.map((note, index) => (
                  <div key={note?.id || Math.random()} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/notes/${note?.id || ''}`} className="block">
                        <p className="font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors text-sm md:text-base truncate">
                          {generateCaseNumber(note, recentNotes)}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          {note?.createdAt ? (
                            <>
                              <span className="hidden sm:inline">
                                {new Date(note.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="sm:hidden">
                                {new Date(note.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </span>
                            </>
                          ) : "-"}
                        </p>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 px-2 py-1 rounded-full whitespace-nowrap">
                        {note?.noteType || "Note"}
                      </span>
                      <Link href={`/dashboard/notes/${note?.id || ''}`}>
                        <Button variant="ghost" size="sm" className="text-xs px-2">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  )
}
