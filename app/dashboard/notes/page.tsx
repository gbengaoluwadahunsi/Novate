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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { useAppSelector } from '@/store/hooks'

export default function NotesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)

  // State
  const [notes, setNotes] = useState<MedicalNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [noteTypeFilter, setNoteTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotes, setTotalNotes] = useState(0)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showPracticeSelector, setShowPracticeSelector] = useState<{open: boolean, noteId: string, patientName: string} | null>(null)
  
  // Enhanced filter state
  const [filters, setFilters] = useState({
    patientName: '',
    ageRange: { min: '', max: '' },
    gender: 'all',
    dateRange: { from: '', to: '' },
    noteType: 'all',
    diagnosis: ''
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const performanceMonitor = PerformanceMonitor.getInstance()
  const ITEMS_PER_PAGE = 12

  // Generate consistent case number for notes without patient names
  const generateCaseNumber = (note: MedicalNote, allNotes?: MedicalNote[]) => {
    if (note.patientName && note.patientName.trim() && note.patientName !== 'N/A') {
      return note.patientName
    }
    
    // Use all available notes or fallback to current notes list
    const notesList = allNotes || notes
    
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

  // Filter functions
  const applyFilters = useCallback((notesToFilter: MedicalNote[]) => {
    return notesToFilter.filter(note => {
      // Search term filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = (
          (note.patientInformation?.name || '').toLowerCase().includes(searchLower) ||
          (note.chiefComplaint || '').toLowerCase().includes(searchLower) ||
          (note.assessmentAndDiagnosis || '').toLowerCase().includes(searchLower) ||
          (note.historyOfPresentingIllness || '').toLowerCase().includes(searchLower)
        )
        if (!matchesSearch) return false
      }

      // Patient name filter
      if (filters.patientName.trim()) {
        const displayName = generateCaseNumber(note, notes).toLowerCase()
        if (!displayName.includes(filters.patientName.toLowerCase())) return false
      }

      // Age range filter
      if (filters.ageRange.min || filters.ageRange.max) {
        const noteAge = parseInt(note.patientInformation?.age || '0')
        const minAge = parseInt(filters.ageRange.min || '0')
        const maxAge = parseInt(filters.ageRange.max || '150')
        
        if (filters.ageRange.min && noteAge < minAge) return false
        if (filters.ageRange.max && noteAge > maxAge) return false
      }

      // Gender filter
      if (filters.gender !== 'all') {
        const noteGender = (note.patientInformation?.gender || '').toLowerCase()
        if (!noteGender.includes(filters.gender.toLowerCase())) return false
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const noteDate = new Date(note.createdAt || '')
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : new Date('1900-01-01')
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date()
        
        if (noteDate < fromDate || noteDate > toDate) return false
      }

      // Note type filter
      if (filters.noteType !== 'all') {
        if (note.noteType !== filters.noteType) return false
      }

      // Diagnosis filter
      if (filters.diagnosis.trim()) {
        const diagnosis = (note.assessmentAndDiagnosis || '').toLowerCase()
        if (!diagnosis.includes(filters.diagnosis.toLowerCase())) return false
      }

      return true
    })
  }, [searchTerm, filters])

  // Get unique values for filter dropdowns
  const uniquePatientNames = useMemo(() => {
    const names = notes
      .map(note => generateCaseNumber(note, notes))
      .filter(name => name.trim() !== '')
      .filter((name, index, array) => array.indexOf(name) === index)
      .sort()
    return names
  }, [notes])

  const uniqueGenders = useMemo(() => {
    const genders = notes
      .map(note => note.patientInformation?.gender || '')
      .filter(gender => gender.trim() !== '' && gender.toLowerCase() !== 'not specified')
      .filter((gender, index, array) => array.indexOf(gender) === index)
      .sort()
    return genders
  }, [notes])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setFilters({
      patientName: '',
      ageRange: { min: '', max: '' },
      gender: 'all',
      dateRange: { from: '', to: '' },
      noteType: 'all',
      diagnosis: ''
    })
    setNoteTypeFilter('all')
  }

  // Apply filters to get filtered notes
  const filteredNotes = useMemo(() => {
    return applyFilters(notes)
  }, [notes, applyFilters])

  // Update pagination based on filtered results
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredNotes.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredNotes, currentPage, ITEMS_PER_PAGE])

  const totalFilteredPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)

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
    setCurrentPage(1) // Reset to page 1 when filters change
    loadNotes(1, searchTerm, noteTypeFilter)
  }, [noteTypeFilter, searchTerm, filters, loadNotes])

  // Reset page when filters change significantly
  useEffect(() => {
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalFilteredPages])

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

  // Show practice selector dialog
  const handleExportPDF = async (noteId: string, patientName: string) => {
    setShowPracticeSelector({ open: true, noteId, patientName })
  }

  // Actual PDF export with selected practice info
  const exportPDFWithPractice = async (noteId: string, patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      console.log('📄 Attempting to export PDF for note:', noteId, 'Patient:', patientName, 'Practice:', practiceInfo)
      
      // Use basic PDF export without custom organization parameters (backend doesn't support them yet)
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
        link.download = `medical-note-${practiceInfo.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}-${(patientName || 'patient').replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: 'PDF Downloaded',
          description: `Medical note exported for ${practiceInfo.organizationName}`,
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
    } finally {
      setShowPracticeSelector(null)
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

  const hasActiveFilters = searchTerm.trim() || noteTypeFilter !== 'all' || 
    filters.patientName || filters.gender !== 'all' || 
    filters.ageRange.min || filters.ageRange.max || 
    filters.dateRange.from || filters.dateRange.to || 
    filters.diagnosis.trim()

  return (
    <div className="container mx-auto py-3 md:py-6 space-y-4 md:space-y-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">Medical Notes</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredNotes.length > 0 ? (
              filteredNotes.length === notes.length 
                ? `${totalNotes} notes found` 
                : `${filteredNotes.length} of ${totalNotes} notes found`
            ) : 'No notes match your filters'}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/transcribe')}
          className="w-full md:w-auto justify-center shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create New Note</span>
          <span className="sm:hidden">New Note</span>
        </Button>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          {/* Basic Search and Quick Filters */}
          <div className="space-y-4">
            {/* Search Bar - Full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes by patient name, diagnosis, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm md:text-base"
                />
              </div>
            </div>
            
            {/* Filter Controls - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex-1 sm:flex-none whitespace-nowrap text-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{showAdvancedFilters ? 'Hide' : 'Show'} Filters</span>
                  <span className="sm:hidden">Filters</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1 sm:flex-none whitespace-nowrap text-sm"
                >
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Patient Name Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Patient Name</label>
                  <Select value={filters.patientName} onValueChange={(value) => setFilters(prev => ({ ...prev, patientName: value }))}>
                    <SelectTrigger className="text-sm">
                      <User className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Any Patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Patient</SelectItem>
                      {uniquePatientNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Any Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      {uniqueGenders.map(gender => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Age Range</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.ageRange.min}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: { ...prev.ageRange, min: e.target.value }
                      }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.ageRange.max}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: { ...prev.ageRange, max: e.target.value }
                      }))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="text-sm"
                    />
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Filter - Full width */}
              <div>
                <label className="text-sm font-medium mb-2 block">Diagnosis</label>
                <Input
                  placeholder="Search by diagnosis..."
                  value={filters.diagnosis}
                  onChange={(e) => setFilters(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 md:h-6 w-3/4" />
                <Skeleton className="h-3 md:h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-3 md:h-4 w-full" />
                  <Skeleton className="h-3 md:h-4 w-2/3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 md:h-6 w-20" />
                    <Skeleton className="h-3 md:h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (filteredNotes && filteredNotes.length > 0) ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {paginatedNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader 
                  className="pb-3"
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl font-bold line-clamp-1 text-cyan-500">
                        {generateCaseNumber(note, notes)}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Age {note.patientAge !== 'N/A' && note.patientAge ? note.patientAge : 'N/A'} • {note.patientGender}
                      </p>
                      {/* Show a brief summary instead of full chief complaint */}
                      {note.chiefComplaint && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {note.chiefComplaint.length > 40 
                            ? note.chiefComplaint.substring(0, 40) + '...' 
                            : note.chiefComplaint}
                        </p>
                      )}
                    </div>
                    <Badge className={`${getNoteTypeColor(note.noteType)} text-xs px-2 py-1 shrink-0`}>
                      {note.noteType || 'Note'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Diagnosis - Keep this as it's useful medical info */}
                    {note.diagnosis && (
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-700">Diagnosis:</p>
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {note.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      {note.timeSaved && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {Math.round(note.timeSaved / 60)}min saved
                        </div>
                      )}
                    </div>

                    {/* Actions - Better mobile layout */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/notes/${note.id}`)
                        }}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                                                      handleExportPDF(note.id, generateCaseNumber(note, notes))
                        }}
                        className="flex-1 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        disabled={isDeleting === note.id}
                        className="flex-1 text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        {isDeleting === note.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile-friendly Pagination */}
          {totalFilteredPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Page {currentPage} of {totalFilteredPages}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
                
                {/* Show page numbers on larger screens only */}
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalFilteredPages - 4, currentPage - 2)) + i
                    if (pageNum > totalFilteredPages) return null
                    
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
                  disabled={currentPage >= totalFilteredPages}
                  className="text-sm"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No notes match your filters' : 'No medical notes yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or clearing the filters to see more results.'
                : 'Create your first medical note by uploading an audio file or using the voice recorder.'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Button onClick={() => router.push('/dashboard/transcribe')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Note
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Practice Selector Dialog */}
      <Dialog open={showPracticeSelector?.open || false} onOpenChange={(open) => !open && setShowPracticeSelector(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Practice for PDF Export</DialogTitle>
            <DialogDescription>
              Choose which practice to label this PDF export (affects filename). The PDF content will use your profile settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Current Organization (if available and not generic) */}
            {user?.organization && user.organization.name !== "Independent Practice" && user.organization.name !== "General Hospital" && user.organization.name !== "Medical Clinic" && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => showPracticeSelector && exportPDFWithPractice(
                  showPracticeSelector.noteId,
                  showPracticeSelector.patientName,
                  {
                    organizationName: user.organization.name,
                    organizationType: user.organization.type,
                    practiceLabel: user.organization.type === 'HOSPITAL' ? 'HOSPITAL' : 
                                  user.organization.type === 'CLINIC' ? 'CLINIC' : 'PRIVATE PRACTICE'
                  }
                )}
              >
                <div className="text-left">
                  <div className="font-medium">{user.organization.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.organization.type === 'HOSPITAL' ? 'Hospital' : 
                     user.organization.type === 'CLINIC' ? 'Clinic' : 'Private Practice'} (Your Organization)
                  </div>
                </div>
              </Button>
            )}

            {/* Common Practice Options */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.noteId,
                showPracticeSelector.patientName,
                {
                  organizationName: "General Hospital",
                  organizationType: "HOSPITAL",
                  practiceLabel: "HOSPITAL"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">General Hospital</div>
                <div className="text-sm text-muted-foreground">Hospital Setting</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.noteId,
                showPracticeSelector.patientName,
                {
                  organizationName: "Medical Clinic",
                  organizationType: "CLINIC",
                  practiceLabel: "CLINIC"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">Medical Clinic</div>
                <div className="text-sm text-muted-foreground">Clinic Setting</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => showPracticeSelector && exportPDFWithPractice(
                showPracticeSelector.noteId,
                showPracticeSelector.patientName,
                {
                  organizationName: "Private Practice",
                  organizationType: "PRIVATE_PRACTICE",
                  practiceLabel: "PRIVATE PRACTICE"
                }
              )}
            >
              <div className="text-left">
                <div className="font-medium">Private Practice</div>
                <div className="text-sm text-muted-foreground">Independent Practice</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPracticeSelector(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
