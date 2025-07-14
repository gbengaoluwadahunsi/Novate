"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { apiClient, type MedicalNote } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { PerformanceMonitor } from '@/lib/performance'
import { debounce } from '@/lib/performance'

export default function NotesPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [notes, setNotes] = useState<MedicalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [noteTypeFilter, setNoteTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotes, setTotalNotes] = useState(0)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const performanceMonitor = PerformanceMonitor.getInstance()
  const ITEMS_PER_PAGE = 12

  // Memoized loadNotes function
  const loadNotes = useCallback(async (page: number = currentPage, search: string = searchTerm, filter: string = noteTypeFilter) => {
    performanceMonitor.startTiming('load-notes')
    setIsLoading(true)

    try {
      // Check authentication status first
      const token = localStorage.getItem('token')
      console.log('🔍 Authentication Status:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      })

      const params: any = {
        page,
        limit: ITEMS_PER_PAGE,
      }

      if (search.trim()) {
        params.search = search.trim()
      }

      console.log('🔍 Making API call with params:', params)
      console.log('🔍 Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'https://novatescribebackend.onrender.com')

      // Quick backend connectivity test
      try {
        const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://novatescribebackend.onrender.com'}/health`)
        console.log('🔍 Backend Health Check:', {
          status: healthCheck.status,
          ok: healthCheck.ok,
          statusText: healthCheck.statusText
        })
      } catch (healthError) {
        console.log('🔍 Backend Health Check Failed:', healthError)
      }

      const response = await apiClient.getMedicalNotes(params)

      console.log('🔍 Full API Response:', response)
      console.log('🔍 Response Success:', response.success)
      console.log('🔍 Response Data:', response.data)
      console.log('🔍 Response Data Type:', typeof response.data)
      console.log('🔍 Response Data Keys:', response.data ? Object.keys(response.data) : 'No data')
      console.log('🔍 Response Error:', response.error)

      if (response.success && response.data) {
        const data = response.data
        console.log('🔍 Data Structure:', {
          hasNotes: 'notes' in data,
          notesArray: data.notes,
          notesLength: data.notes ? data.notes.length : 'No notes array',
          hasPagination: 'pagination' in data,
          paginationData: data.pagination
        })
        
        let filteredNotes = data.notes || []
        console.log('🔍 Filtered Notes:', filteredNotes)
        console.log('🔍 Filtered Notes Length:', filteredNotes.length)

        // Apply client-side note type filter since backend might not support it
        if (filter !== 'all') {
          filteredNotes = (data.notes || []).filter(note => note.noteType === filter)
        }

        setNotes(filteredNotes)
        // Add safe access to pagination data
        setCurrentPage(data.pagination?.page || 1)
        setTotalPages(data.pagination?.pages || 1)
        setTotalNotes(data.pagination?.total || 0)

        console.log('🔍 Final State:', {
          notesCount: filteredNotes.length,
          currentPage: data.pagination?.page || 1,
          totalPages: data.pagination?.pages || 1,
          totalNotes: data.pagination?.total || 0
        })

        performanceMonitor.endTiming('load-notes')
      } else {
        console.log('🔍 API Response Failed:', response.error)
        throw new Error(response.error || 'Failed to load notes')
      }
    } catch (error) {
      logger.error('Error loading notes:', error)
      // Set safe defaults on error
      setNotes([])
      setCurrentPage(1)
      setTotalPages(1)
      setTotalNotes(0)
      toast({
        title: 'Error',
        description: 'Failed to load medical notes',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, noteTypeFilter, performanceMonitor, toast])

  // Memoized debounced search function
  const debouncedSearch = useMemo(() => 
    debounce((term: string) => {
      setCurrentPage(1)
      loadNotes(1, term, noteTypeFilter)
    }, 300), 
    [loadNotes, noteTypeFilter]
  )

  // Load notes
  useEffect(() => {
    loadNotes()
    
    // Add a simple direct test
    const testDirectAPICall = async () => {
      try {
        const token = localStorage.getItem('token')
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://novatescribebackend.onrender.com'
        const directResponse = await fetch(`${backendUrl}/medical-notes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const directData = await directResponse.json()
        console.log('🔍 Direct API Call Result:', {
          status: directResponse.status,
          ok: directResponse.ok,
          data: directData,
          url: directResponse.url
        })
      } catch (directError) {
        console.log('🔍 Direct API Call Failed:', directError)
      }
    }
    
    testDirectAPICall()
  }, [loadNotes])

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm)
    } else if (searchTerm === '') {
      setCurrentPage(1)
      loadNotes(1, '', noteTypeFilter)
    }
  }, [searchTerm, debouncedSearch, noteTypeFilter, loadNotes])

  // Handle filter changes
  useEffect(() => {
    setCurrentPage(1)
    loadNotes(1, searchTerm, noteTypeFilter)
  }, [noteTypeFilter, searchTerm, loadNotes])

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    setIsDeleting(noteId)

    try {
      console.log('🗑️ Attempting to delete note:', noteId)
      const response = await apiClient.deleteMedicalNote(noteId)
      console.log('🗑️ Delete response:', response)

      if (response.success) {
        toast({
          title: 'Note Deleted',
          description: 'Medical note has been successfully deleted',
        })

        // Reload notes
        await loadNotes()
      } else {
        console.error('🗑️ Delete failed:', response.error)
        throw new Error(response.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('🗑️ Delete error:', error)
      logger.error('Error deleting note:', error)
      toast({
        title: 'Delete Error',
        description: `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleExportPDF = async (noteId: string, patientName: string) => {
    try {
      console.log('📄 Attempting to export PDF for note:', noteId, 'Patient:', patientName)
      const response = await apiClient.exportNotePDF(noteId, {
        format: 'A4',
        includeHeader: true,
        includeFooter: true
      })
      console.log('📄 Export response:', response)

      if (response.success && response.data) {
        const blob = response.data as Blob
        console.log('📄 PDF blob created:', blob.size, 'bytes')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `medical-note-${(patientName || 'patient').replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: 'PDF Downloaded',
          description: 'Medical note exported successfully',
        })
      } else {
        console.error('📄 Export failed:', response.error)
        throw new Error(response.error || 'Failed to export PDF')
      }
    } catch (error) {
      console.error('📄 Export error:', error)
      logger.error('Error exporting PDF:', error)
      toast({
        title: 'Export Error',
        description: `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNoteTypeColor = (noteType: string | null) => {
    switch (noteType) {
      case 'consultation': return 'bg-blue-100 text-blue-800'
      case 'follow-up': return 'bg-green-100 text-green-800'
      case 'assessment': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    loadNotes(newPage, searchTerm, noteTypeFilter)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Notes</h1>
          <p className="text-gray-600">
            {totalNotes > 0 ? `${totalNotes} notes found` : 'No notes available'}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/transcribe')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes by patient name, diagnosis, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (notes && notes.length > 0) ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader 
                  className="pb-3"
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold line-clamp-1 text-cyan-500">
                        {note.patientName || `Patient ${((currentPage - 1) * ITEMS_PER_PAGE) + notes.indexOf(note) + 1}`}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Age {note.patientAge} • {note.patientGender}
                      </p>
                      {/* Show a brief summary instead of full chief complaint */}
                      {note.chiefComplaint && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {note.chiefComplaint.length > 50 
                            ? note.chiefComplaint.substring(0, 50) + '...' 
                            : note.chiefComplaint}
                        </p>
                      )}
                    </div>
                    <Badge className={getNoteTypeColor(note.noteType)}>
                      {note.noteType || 'Note'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Diagnosis - Keep this as it's useful medical info */}
                    {note.diagnosis && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {note.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(note.createdAt)}
                      </div>
                      {note.timeSaved && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(note.timeSaved / 60)}min saved
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/notes/${note.id}`)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportPDF(note.id, note.patientName)
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        disabled={isDeleting === note.id}
                      >
                        {isDeleting === note.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || noteTypeFilter !== 'all' ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              {searchTerm || noteTypeFilter !== 'all' 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Start by creating your first medical note using our AI transcription service.'
              }
            </p>
            {!searchTerm && noteTypeFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/transcribe')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
