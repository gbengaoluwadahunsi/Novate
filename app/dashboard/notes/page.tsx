"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ChevronRight,
  Brain
} from 'lucide-react'
import NextImage from 'next/image'
import { apiClient, type MedicalNote } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { PerformanceMonitor } from '@/lib/performance'
import { debounce } from '@/lib/performance'
import { useAppSelector } from '@/store/hooks'

import { MedicalNoteComprehensive } from '@/types/medical-note-comprehensive'

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showPracticeSelector, setShowPracticeSelector] = useState<{open: boolean, noteId: string, patientName: string} | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{open: boolean, noteId: string} | null>(null)
  const [lastDeleteClick, setLastDeleteClick] = useState<number>(0)
  
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
        const displayName = generateCaseNumber(note, notes).toLowerCase()
        const matchesSearch = (
          displayName.includes(searchLower) ||
          (note.patientName || '').toLowerCase().includes(searchLower) ||
          (note.chiefComplaint || '').toLowerCase().includes(searchLower) ||
          ((note as any).assessmentAndDiagnosis || note.diagnosis || '').toLowerCase().includes(searchLower) ||
          (note.historyOfPresentingIllness || (note as any).historyOfPresentIllness || '').toLowerCase().includes(searchLower)
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
        const noteAge = typeof note.patientAge === 'number' ? note.patientAge : parseInt(String(note.patientAge) || '0')
        const minAge = parseInt(filters.ageRange.min || '0')
        const maxAge = parseInt(filters.ageRange.max || '150')
        
        if (filters.ageRange.min && noteAge < minAge) return false
        if (filters.ageRange.max && noteAge > maxAge) return false
      }

      // Gender filter
      if (filters.gender !== 'all') {
        const noteGender = (note.patientGender || '').toLowerCase()
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
        const diagnosis = (note.assessmentAndDiagnosis || note.diagnosis || '').toLowerCase()
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
      .map(note => note.patientGender || '')
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
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotes, currentPage, itemsPerPage])

  const totalFilteredPages = Math.ceil(filteredNotes.length / itemsPerPage)

  // Memoized loadNotes function
  const loadNotes = useCallback(async (page: number = currentPage, search: string = searchTerm, filter: string = noteTypeFilter) => {
    performanceMonitor.startTiming('load-notes')
    setIsLoading(true)

    try {
      // Check authentication status first
      const token = localStorage.getItem('token')
      logger.info('🔍 Authentication Status:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
        currentUser: user ? {
          id: user.id,
          email: user.email,
          name: user.firstName + ' ' + user.lastName
        } : 'No user data'
      })

      // 🚨 CRITICAL SECURITY CHECK: Verify user is authenticated
      if (!user || !token) {
        logger.error('🚨 SECURITY: User not authenticated, redirecting to login')
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view your notes',
          variant: 'destructive'
        })
        router.push('/login')
        return
      }

      const params: any = {
        page,
        limit: itemsPerPage,
      }

      if (search.trim()) {
        params.search = search.trim()
      }

      logger.info('🔍 Making API call with params:', params)

      const response = await apiClient.getMedicalNotes(params)

      // Debug API response only if there's an error
      if (!response.success) {
        logger.error('❌ Notes API failed:', response.error)
      }

      if (response.success && response.data) {
        const data = response.data
        

        
        logger.info('🔍 API Response:', {
          hasNotes: 'notes' in data,
          notesLength: data.notes ? data.notes.length : 'No notes array',
          hasPagination: 'pagination' in data,
          paginationData: data.pagination
        })
        
        let filteredNotes = data.notes || []

        // Apply client-side note type filter since backend might not support it
        if (filter !== 'all') {
          filteredNotes = filteredNotes.filter(note => note.noteType === filter)
        }

        // Sort notes by creation date - newest first
        filteredNotes.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
        });

        // 🩺 DEBUG: Check vital signs in loaded notes
        console.log('🩺 CHECKING VITAL SIGNS IN FETCHED NOTES:');
        filteredNotes.slice(0, 3).forEach((note, index) => {
          console.log(`Note ${index + 1} (${note.id}):`, {
            temperature: note.temperature || 'MISSING',
            pulseRate: note.pulseRate || 'MISSING', 
            respiratoryRate: note.respiratoryRate || 'MISSING',
            bloodPressure: note.bloodPressure || 'MISSING',
            glucose: note.glucose || note.glucoseLevels || 'MISSING',
            rawNote: note
          });
        });

        // 🚨 ENHANCED DEDUPLICATION: Remove duplicates by ID AND content similarity
        const uniqueNotes = filteredNotes.filter((note, index, array) => {
          // First check: Remove exact ID duplicates
          const firstIndexById = array.findIndex(n => n.id === note.id);
          if (firstIndexById !== index) {
            logger.warn('🚨 DUPLICATE NOTE BY ID DETECTED AND REMOVED:', {
              noteId: note.id,
              patientName: note.patientName,
              createdAt: note.createdAt,
              duplicateIndex: index,
              firstIndex: firstIndexById
            });
            return false;
          }
          
          // Second check: Remove content-based duplicates (same patient, same time period)
          const similarNotes = array.filter((n, idx) => {
            if (idx >= index) return false; // Only check previous notes
            
            const timeDiff = Math.abs(
              new Date(note.createdAt || 0).getTime() - 
              new Date(n.createdAt || 0).getTime()
            );
            const isWithin5Minutes = timeDiff < 5 * 60 * 1000; // 5 minutes
            
            return n.patientName === note.patientName && 
                   n.patientAge === note.patientAge &&
                   n.patientGender === note.patientGender &&
                   isWithin5Minutes;
          });
          
          if (similarNotes.length > 0) {
            logger.warn('🚨 DUPLICATE NOTE BY CONTENT DETECTED AND REMOVED:', {
              noteId: note.id,
              patientName: note.patientName,
              createdAt: note.createdAt,
              similarNote: similarNotes[0].id,
              timeDifference: Math.abs(
                new Date(note.createdAt || 0).getTime() - 
                new Date(similarNotes[0].createdAt || 0).getTime()
              ) / 1000 + ' seconds'
            });
            return false;
          }
          
          return true;
        });

        if (uniqueNotes.length !== filteredNotes.length) {
          logger.warn('🚨 DEDUPLICATION SUMMARY:', {
            originalCount: filteredNotes.length,
            uniqueCount: uniqueNotes.length,
            duplicatesRemoved: filteredNotes.length - uniqueNotes.length
          });
        }

        setNotes(uniqueNotes)
        // 🚨 FIX: Use deduplicated count instead of original API count
        setCurrentPage(data.pagination?.page || 1)
        setTotalPages(Math.ceil(uniqueNotes.length / itemsPerPage) || 1)
        setTotalNotes(uniqueNotes.length) // Use actual deduplicated count, not API count

        performanceMonitor.endTiming('load-notes')
      } else {
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
  }, [currentPage, searchTerm, noteTypeFilter, performanceMonitor, toast, user, router])

  // Memoized debounced search function
  const debouncedSearch = useMemo(() => 
    debounce((term: string) => {
      setCurrentPage(1)
      loadNotes(1, term, noteTypeFilter)
    }, 300), 
    [loadNotes, noteTypeFilter]
  )

  // Handle refresh parameter from transcription page
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    if (refreshParam === 'true') {
      toast({
        title: "📝 Loading Latest Notes",
        description: "Checking for your newly created note...",
      })
      loadNotes(1, '', noteTypeFilter)
      // Remove the refresh parameter from URL
      router.replace('/dashboard/notes', { scroll: false })
    }
  }, [searchParams, loadNotes, noteTypeFilter, router, toast])

  // 🩺 DEBUG: Log vital signs in fetched notes\n  const debugVitalSigns = (notes: any[]) => {\n    console.log('🩺 CHECKING VITAL SIGNS IN FETCHED NOTES:');\n    notes.forEach((note, index) => {\n      console.log(`Note ${index + 1} (${note.id}):`, {\n        temperature: note.temperature || 'MISSING',\n        pulseRate: note.pulseRate || 'MISSING',\n        respiratoryRate: note.respiratoryRate || 'MISSING',\n        bloodPressure: note.bloodPressure || 'MISSING',\n        glucose: note.glucose || note.glucoseLevels || 'MISSING'\n      });\n    });\n  };\n\n  // 🚨 CONSOLIDATED EFFECT: Single useEffect to handle all note loading scenarios
  useEffect(() => {
    // Handle initial load and filter changes
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm)
    } else {
      setCurrentPage(1)
      loadNotes(1, '', noteTypeFilter)
    }
  }, [noteTypeFilter, debouncedSearch, loadNotes]) // Removed searchTerm from dependencies to prevent duplicate calls

  // Handle search term changes separately with debouncing
  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm)
    } else if (searchTerm === '') {
      setCurrentPage(1)
      loadNotes(1, '', noteTypeFilter)
    }
  }, [searchTerm, debouncedSearch, noteTypeFilter, loadNotes])

  // Reset page when filtered results change
  useEffect(() => {
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalFilteredPages])

  const handleDeleteNote = (noteId: string) => {
    // Prevent multiple clicks by checking if already deleting
    if (isDeleting === noteId) return
    
    // Debounce mechanism - prevent rapid clicks
    const now = Date.now()
    if (now - lastDeleteClick < 500) return // 500ms debounce
    setLastDeleteClick(now)
    
    setShowDeleteConfirm({ open: true, noteId })
  }

  const confirmDelete = async (noteId: string) => {
    // Prevent multiple executions
    if (isDeleting) return
    
    setIsDeleting(noteId)
    setShowDeleteConfirm(null)
    
    try {
      logger.info('🗑️ Attempting to delete note:', noteId)
      const response = await apiClient.deleteMedicalNote(noteId)
      logger.info('🗑️ Delete response:', response)

      if (response.success) {
        // Remove from UI immediately
        setNotes(prevNotes => {
          const filteredNotes = prevNotes.filter(note => note.id !== noteId)
          logger.info('UI updated - removed note from list', { 
            notesBefore: prevNotes.length, 
            notesAfter: filteredNotes.length 
          })
          return filteredNotes
        })
        setTotalNotes(prev => Math.max(0, prev - 1))
        
        logger.info('✅ Note deleted successfully')
        toast({
          title: 'Note Deleted',
          description: 'Medical note has been successfully deleted',
        })
      } else {
        // Check if it's a 404 error (note already deleted)
        if (response.error?.includes('404') || response.error?.includes('Not Found')) {
          logger.warn('🗑️ Note not found on server (already deleted), removing from UI')
          // Remove from UI since it doesn't exist on server anyway
          setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
          setTotalNotes(prev => Math.max(0, prev - 1))
          
          toast({
            title: 'Note Removed',
            description: 'Note was already deleted from the server',
          })
        } else {
          logger.error('🗑️ Delete API error:', response.error)
          toast({
            title: 'Delete Failed',
            description: response.error || 'Failed to delete the note. Please try again.',
            variant: 'destructive'
          })
        }
      }
    } catch (error: any) {
      logger.error('🗑️ Delete request failed:', error)
      
      // Check if it's a 404 error (note doesn't exist)
      if (error.message?.includes('404') || error.status === 404) {
        logger.warn('🗑️ Note not found on server (404), removing from UI')
        // Remove from UI since it doesn't exist on server
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
        setTotalNotes(prev => Math.max(0, prev - 1))
        
        toast({
          title: 'Note Removed',
          description: 'Note was already deleted from the server',
        })
      } else {
        toast({
          title: 'Delete Failed',
          description: error instanceof Error ? error.message : 'Failed to delete the note. Please try again.',
          variant: 'destructive'
        })
      }
    } finally {
      setIsDeleting(null)
      
      // Refresh the notes list to sync with backend
      setTimeout(() => {
        logger.info('🔄 Refreshing notes list after delete operation')
        loadNotes(currentPage, searchTerm, noteTypeFilter).catch(err => {
          logger.error('Failed to refresh notes after delete:', err)
        })
      }, 1000)
    }
  }

  // Show practice selector dialog
  const handleExportPDF = async (noteId: string, patientName: string) => {
    setShowPracticeSelector({ open: true, noteId, patientName })
  }

  // PDF export with selected practice info
  const exportPDFWithPractice = async (noteId: string, patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      // Use the professional PDF generator
      await generateFrontendPDF(noteId, patientName, practiceInfo)
    } catch (error) {
      logger.error('📄 PDF export error:', error)
      toast({
        title: 'Export Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setShowPracticeSelector(null)
    }
  }

  // Frontend PDF generation using professional PDF library
  const generateFrontendPDF = async (noteId: string, patientName: string, practiceInfo: {
    organizationName: string;
    organizationType: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
    practiceLabel: string;
  }) => {
    try {
      // Fetch the note data for PDF generation
      const noteResponse = await apiClient.getMedicalNote(noteId)
      if (!noteResponse.success || !noteResponse.data) {
        throw new Error('Could not fetch note data for PDF generation')
      }
      
      const note = noteResponse.data

      // Convert to ComprehensiveMedicalNote format for the new PDF generator
      const comprehensiveNote: MedicalNoteComprehensive = {
        id: note.id,
        patientInformation: {
          name: note.patientName || '',
          age: parseInt(note.patientAge?.toString() || '0'),
          gender: (note.patientGender || 'Male').toLowerCase() as 'male' | 'female'
        },
        chiefComplaint: note.chiefComplaint || '',
        historyOfPresentingIllness: note.historyOfPresentingIllness || '',
        pastMedicalHistory: note.pastMedicalHistory || '',
        medication: '',
        allergies: '',
        socialHistory: '',
        familyHistory: '',
        reviewOfSystems: note.systemReview || '',
        examinationData: {
          generalExamination: note.physicalExamination || '',
          cardiovascularExamination: '',
          respiratoryExamination: '',
          abdominalExamination: '',
          otherSystemsExamination: ''
        },
        investigations: note.managementPlan || '',
        assessment: note.diagnosis || '',
        plan: note.treatmentPlan || ''
      };

      // Use the unified PDF generator for consistent, well-organized PDFs
      // Use the new styled PDF generator that matches the note page design
      const { generateStyledNotePDF } = await import('@/lib/styled-note-pdf-generator');
      
      // Convert comprehensive note back to CleanMedicalNote format for styled generator
      const cleanNote = {
        id: note.id,
        patientName: note.patientName,
        patientAge: note.patientAge,
        patientGender: note.patientGender,
        visitDate: note.visitDate,
        visitTime: note.visitTime,
        chiefComplaint: note.chiefComplaint,
        historyOfPresentingIllness: note.historyOfPresentingIllness,
        pastMedicalHistory: note.pastMedicalHistory,
        systemReview: note.systemReview,
        physicalExamination: note.physicalExamination,
        assessmentAndDiagnosis: note.assessmentAndDiagnosis,
        managementPlan: note.managementPlan,
        doctorName: note.doctorName,
        doctorRegistrationNo: note.doctorRegistrationNo,
        createdAt: note.createdAt,
        noteType: note.noteType || 'consultation',
        updatedAt: note.updatedAt || note.createdAt
      };
      
      generateStyledNotePDF(cleanNote, {
        organizationName: practiceInfo.organizationName,
        doctorName: note.doctorName,
        registrationNo: note.doctorRegistrationNo
      });

      toast({
        title: 'PDF Downloaded',
        description: `Medical note exported for ${practiceInfo.organizationName}`,
      })
    } catch (error) {
      logger.error('📄 PDF generation error:', error)
      toast({
        title: 'Export Error',
        description: 'Failed to generate PDF. Please try again.',
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
      case 'consultation': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'follow-up': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'assessment': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    loadNotes(newPage, searchTerm, noteTypeFilter)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const hasActiveFilters = searchTerm.trim() || noteTypeFilter !== 'all' || 
    filters.patientName || filters.gender !== 'all' || 
    filters.ageRange.min || filters.ageRange.max || 
    filters.dateRange.from || filters.dateRange.to || 
    filters.diagnosis.trim()

  return (
    <div className="container mx-auto py-3 md:py-6 space-y-4 md:space-y-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">Medical Notes</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
            {filteredNotes.length > 0 ? (
              filteredNotes.length === notes.length 
                ? `${totalNotes} notes found` 
                : `${filteredNotes.length} of ${totalNotes} notes found`
            ) : hasActiveFilters ? 'No notes match your filters' : 'No medical notes yet'}
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/transcribe')} 
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                            value={filters.dateRange.from}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: e.target.value }
                      }))}
                      className="text-sm"
                    />
                    <Input
                      type="date"
                                            value={filters.dateRange.to}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: e.target.value }
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
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Age {String(note.patientAge) !== 'N/A' && note.patientAge ? note.patientAge : 'N/A'} • {note.patientGender}
                      </p>
                      {/* Show a brief summary instead of full chief complaint */}
                      {note.chiefComplaint && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
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
                        <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200">Diagnosis:</p>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {note.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
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
                    <div className="grid grid-cols-4 gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/notes/${note.id}`)
                        }}
                        className="text-xs h-9 flex items-center justify-center"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Navigate to NovateGPT with note context
                          const noteContext = `Patient: ${generateCaseNumber(note, notes)}\nAge: ${note.patientAge || 'N/A'}\nGender: ${note.patientGender || 'N/A'}\nChief Complaint: ${note.chiefComplaint || 'N/A'}\nDiagnosis: ${note.diagnosis || 'N/A'}\n\nWhat would you like to ask about this medical note? You can:\n- Summarize the note\n- Ask about the diagnosis or treatment\n- Analyze the patient's condition\n- Get clinical insights\n- Generate follow-up recommendations`
                          router.push(`/dashboard/novategpt?note=${encodeURIComponent(noteContext)}`)
                        }}
                        className="text-xs h-9 flex items-center justify-center"
                      >
                        <NextImage 
                          src="/NovateGPT.png" 
                          alt="NovateGPT" 
                          width={16} 
                          height={16} 
                          className="mr-1"
                        />
                        <span className="hidden sm:inline">GPT</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        disabled={isDeleting === note.id}
                        className="text-xs h-9 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex items-center justify-center"
                      >
                        {isDeleting === note.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span className="hidden sm:inline ml-1">Del</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {(filteredNotes.length > 0 || totalFilteredPages > 1) && (
            <div className="border-t pt-6 space-y-4">
              {/* Results summary and items per page selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {paginatedNotes.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredNotes.length)} of {filteredNotes.length} notes
                </div>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="items-per-page" className="text-sm text-gray-600 dark:text-gray-300">
                    Show:
                  </label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                  >
                    <SelectTrigger id="items-per-page" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600 dark:text-gray-300">per page</span>
                </div>
              </div>

              {/* Pagination controls */}
              {totalFilteredPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300 order-2 sm:order-1">
                    Page {currentPage} of {totalFilteredPages}
                  </div>
                  
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    {/* First page button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage <= 1}
                      className="text-sm"
                      title="First page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-2" />
                    </Button>
                    
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
                    
                    {/* Last page button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalFilteredPages)}
                      disabled={currentPage >= totalFilteredPages}
                      className="text-sm"
                      title="Last page"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No notes match your filters' : 'No medical notes yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or clearing the filters to see more results.'
                : 'Create your first medical note by uploading an audio file or using the voice recorder. Your notes will appear here once created.'
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
                onClick={() => showPracticeSelector && user?.organization && exportPDFWithPractice(
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm?.open || false} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && !isDeleting && confirmDelete(showDeleteConfirm.noteId)}
              disabled={!!isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
