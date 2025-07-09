import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Simple types to avoid complex API integration issues
export interface AudioJob {
  id: string
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  result?: {
    transcription: string
    speakers: Array<{
      speaker: string
      text: string
      timestamp: string
    }>
  }
  error?: string
}

export interface MedicalNote {
  id: string
  title: string
  content: string
  patientName?: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'completed' | 'archived'
  audioJobId?: string
}

interface NotesState {
  audioJobs: AudioJob[]
  medicalNotes: MedicalNote[]
  currentNote: MedicalNote | null
  isLoading: boolean
  error: string | null
  uploadProgress: number
}

const initialState: NotesState = {
  audioJobs: [],
  medicalNotes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
}

// Simple slice without async thunks to avoid API issues
const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setCurrentNote: (state, action: PayloadAction<MedicalNote | null>) => {
      state.currentNote = action.payload
    },
    addAudioJob: (state, action: PayloadAction<AudioJob>) => {
      state.audioJobs.unshift(action.payload)
    },
    updateAudioJob: (state, action: PayloadAction<AudioJob>) => {
      const index = state.audioJobs.findIndex(job => job.id === action.payload.id)
      if (index >= 0) {
        state.audioJobs[index] = action.payload
      }
    },
    addMedicalNote: (state, action: PayloadAction<MedicalNote>) => {
      state.medicalNotes.unshift(action.payload)
    },
    updateMedicalNote: (state, action: PayloadAction<MedicalNote>) => {
      const index = state.medicalNotes.findIndex(note => note.id === action.payload.id)
      if (index >= 0) {
        state.medicalNotes[index] = action.payload
      }
      if (state.currentNote?.id === action.payload.id) {
        state.currentNote = action.payload
      }
    },
    deleteMedicalNote: (state, action: PayloadAction<string>) => {
      state.medicalNotes = state.medicalNotes.filter(note => note.id !== action.payload)
      if (state.currentNote?.id === action.payload) {
        state.currentNote = null
      }
    },
    setMedicalNotes: (state, action: PayloadAction<MedicalNote[]>) => {
      state.medicalNotes = action.payload
    },
  },
})

export const { 
  setUploadProgress, 
  clearError, 
  setError,
  setLoading,
  setCurrentNote, 
  addAudioJob,
  updateAudioJob,
  addMedicalNote,
  updateMedicalNote,
  deleteMedicalNote,
  setMedicalNotes
} = notesSlice.actions

export default notesSlice.reducer
