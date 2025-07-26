import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient, type MedicalNote as ApiMedicalNote } from '@/lib/api-client'

// Types
export interface MedicalNote extends ApiMedicalNote {}

export interface NotesState {
  medicalNotes: MedicalNote[]
  currentNote: MedicalNote | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  transcriptionStatus: 'idle' | 'loading' | 'polling' | 'succeeded' | 'failed'
  transcriptionError: string | null
  currentJobId: string | null
}

const initialState: NotesState = {
  medicalNotes: [],
  currentNote: null,
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  transcriptionStatus: 'idle',
  transcriptionError: null,
  currentJobId: null,
}

// Async thunks
export const startTranscription = createAsyncThunk(
  'notes/startTranscription',
  async (
    { file, patientData, language }: { 
      file: File, 
      patientData?: { patientName?: string; patientAge?: string; patientGender?: string; },
      language?: string
    }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.startTranscription(file, patientData, language)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to start transcription')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

export const checkTranscriptionStatus = createAsyncThunk(
  'notes/checkTranscriptionStatus',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getTranscriptionResult(jobId)
      if (response.success && response.data) {
        if (response.data.status === 'COMPLETED') {
          return response.data
        } else if (response.data.status === 'IN_PROGRESS' || response.data.status === 'QUEUED') {
          return rejectWithValue('IN_PROGRESS') 
        } else {
          return rejectWithValue(response.data.message || 'Transcription failed')
        }
      } else {
        return rejectWithValue(response.error || 'Failed to get transcription result')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

export const createMedicalNote = createAsyncThunk(
  'notes/createMedicalNote',
  async (noteData: {
    patientName: string;
    patientAge: number;
    patientGender: string;
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    physicalExamination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    prescriptions?: Array<{
      medication: string;
      dosage: string;
      frequency: string;
    }>;
    noteType: 'consultation' | 'follow-up' | 'assessment';
    audioJobId?: string;
  }, { rejectWithValue, getState }) => {
    try {
      // Get current user from auth state
      const state = getState() as { auth: { user: any } }
      const currentUser = state.auth?.user
      
      // Add doctor information from current user
      // Safely construct doctor name, handling undefined values
      const getDoctorName = () => {
        if (currentUser?.name) return currentUser.name;
        if (currentUser?.firstName && currentUser?.lastName) {
          return `${currentUser.firstName} ${currentUser.lastName}`;
        }
        if (currentUser?.firstName) return currentUser.firstName;
        if (currentUser?.lastName) return currentUser.lastName;
        return 'Doctor'; // Fallback name instead of empty string
      };

      const noteDataWithDoctor = {
        ...noteData,
        doctorName: getDoctorName(),
        doctorRegistrationNo: currentUser?.registrationNo || currentUser?.registrationNumber || ''
      }
      
      console.log('👨‍⚕️ Creating medical note:', {
        patient: `${noteData.patientName} (${noteData.patientAge}y, ${noteData.patientGender})`,
        doctor: noteDataWithDoctor.doctorName,
        complaint: noteData.chiefComplaint?.slice(0, 40) + '...'
      });
      
      const response = await apiClient.createMedicalNote(noteDataWithDoctor)
      if (response.success) {
        console.log('✅ Redux: Medical note created successfully:', {
          noteId: response.data?.id,
          patientName: response.data?.patientName
        });
        
        // Log diagnosis consistency in response
        console.log('🔬 REDUX RESPONSE DIAGNOSIS:', {
          timestamp: new Date().toISOString(),
          responseHasDiagnosis: !!response.data?.diagnosis,
          responseDiagnosis: response.data?.diagnosis,
          responseAssessment: response.data?.assessmentAndDiagnosis,
          fullResponseKeys: response.data ? Object.keys(response.data) : []
        });
        
        return response.data
      } else {
        console.error('🔥 Redux: Note creation failed:', response.error);
        return rejectWithValue(response.error || 'Failed to create medical note')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create medical note')
    }
  }
)

export const getMedicalNotes = createAsyncThunk(
  'notes/getMedicalNotes',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMedicalNotes(params)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to fetch notes')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

export const getMedicalNote = createAsyncThunk(
  'notes/getMedicalNote',
  async (noteId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMedicalNote(noteId)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to fetch note')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

export const updateMedicalNote = createAsyncThunk(
  'notes/updateMedicalNote',
  async ({ noteId, noteData }: { noteId: string; noteData: Partial<MedicalNote> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateMedicalNote(noteId, noteData)
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to update note')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

export const deleteMedicalNote = createAsyncThunk(
  'notes/deleteMedicalNote',
  async (noteId: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteMedicalNote(noteId)
      return noteId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
)

// Slice
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNoteState: (state) => {
      state.currentNote = null
      state.status = 'idle'
      state.error = null
    },
    clearTranscriptionState: (state) => {
      state.transcriptionStatus = 'idle'
      state.transcriptionError = null
      state.currentJobId = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMedicalNotes.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getMedicalNotes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload) {
          state.medicalNotes = action.payload.notes || []
          state.pagination = action.payload.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1
          }
        }
      })
      .addCase(getMedicalNotes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
    
    builder
      .addCase(getMedicalNote.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(getMedicalNote.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.currentNote = action.payload
      })
      .addCase(getMedicalNote.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    builder
      .addCase(createMedicalNote.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createMedicalNote.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload) {
          // 🚨 PREVENT DUPLICATES: Check if note already exists before adding
          const existingNoteIndex = state.medicalNotes.findIndex(note => note.id === action.payload!.id);
          
          if (existingNoteIndex === -1) {
            // Note doesn't exist, add it to the beginning
            state.medicalNotes.unshift(action.payload)
            console.log('✅ New note added to Redux state:', action.payload.id);
          } else {
            // Note already exists, update it instead
            state.medicalNotes[existingNoteIndex] = action.payload
            console.log('⚠️ Note already existed in Redux state, updated instead:', action.payload.id);
          }
          
          state.currentNote = action.payload
        }
      })
      .addCase(createMedicalNote.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

    builder
      .addCase(updateMedicalNote.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.medicalNotes.findIndex(note => note.id === action.payload!.id)
          if (index !== -1) {
            state.medicalNotes[index] = action.payload
          }
          if (state.currentNote?.id === action.payload.id) {
            state.currentNote = action.payload
          }
        }
      })
      
    builder
      .addCase(deleteMedicalNote.fulfilled, (state, action) => {
        state.medicalNotes = state.medicalNotes.filter(note => note.id !== action.payload)
        if (state.currentNote?.id === action.payload) {
          state.currentNote = null
        }
      })

    builder
      .addCase(startTranscription.pending, (state) => {
        state.transcriptionStatus = 'loading'
        state.transcriptionError = null
      })
      .addCase(startTranscription.fulfilled, (state, action) => {
        state.transcriptionStatus = 'polling'
        if (action.payload) {
          state.currentJobId = action.payload.jobId
        }
      })
      .addCase(startTranscription.rejected, (state, action) => {
        state.transcriptionStatus = 'failed'
        state.transcriptionError = action.payload as string
      })
    
    builder
      .addCase(checkTranscriptionStatus.pending, (state) => {
        // No state change needed while polling
      })
      .addCase(checkTranscriptionStatus.fulfilled, (state, action) => {
        state.transcriptionStatus = 'succeeded'
        // Here you would typically update a note or create a new one
        // For now, we just mark as succeeded. 
        // A possible implementation is to store the transcript in a temporary state.
      })
      .addCase(checkTranscriptionStatus.rejected, (state, action) => {
        if (action.payload === 'IN_PROGRESS') {
          state.transcriptionStatus = 'polling' // continue polling
        } else {
          state.transcriptionStatus = 'failed'
          state.transcriptionError = action.payload as string
        }
      })
  },
})

export const { clearNoteState, clearTranscriptionState } = notesSlice.actions

export default notesSlice.reducer 