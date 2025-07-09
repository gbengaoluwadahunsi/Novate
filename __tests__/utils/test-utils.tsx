import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, type Store, type PreloadedState } from '@reduxjs/toolkit'
import { ThemeProvider } from 'next-themes'
import authReducer from '@/store/features/authSlice'
import notesReducer from '@/store/features/notesSlice'
import userReducer from '@/store/features/userSlice'
import { type User as AuthUser } from '@/store/features/authSlice'
import { type MedicalNote as NoteMedicalNote } from '@/lib/api-client'
import type { RootState } from '@/store/store'

// Types
export interface User extends AuthUser {}

export interface MedicalNote extends NoteMedicalNote {}

export interface Organization {
  id: string
  name: string
  type: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  createdAt: string
  updatedAt: string
}

export interface RootState {
  auth: {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    error: string | null
    authCheckCompleted: boolean
  }
  notes: {
    audioJobs: any[]
    medicalNotes: MedicalNote[]
    currentNote: MedicalNote | null
    currentNoteVersions: MedicalNote[]
    currentNoteAuditTrail: any[]
    versionComparison: any
    isLoading: boolean
    error: string | null
    uploadProgress: number
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  user: {
    currentOrganization: Organization | null
    userStatistics: any
    isLoading: boolean
    error: string | null
  }
}

// Mock data creators
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'doctor',
  organizationId: 'org-1',
  isEmailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockMedicalNote = (overrides?: Partial<MedicalNote>): MedicalNote => ({
  id: 'note-1',
  patientName: 'Ahmed bin Ali',
  patientAge: 28,
  patientGender: 'Male',
  noteType: 'Medical Note',
  chiefComplaint: 'Sore throat for three days',
  historyOfPresentingIllness: 'Patient reports worsening of sore throat over the past three days.',
  physicalExamination: {
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRate: '78 bpm',
      temperature: '37.8°C',
      respiratoryRate: '16/min',
    },
    throat: 'Erythematous pharynx with tonsillar enlargement.',
  },
  diagnosis: 'Acute pharyngitis, likely viral in origin',
  treatmentPlan: 'Symptomatic treatment with paracetamol 1g QID PRN for fever and pain.',
  audioJobId: 'job-1',
  createdAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
  status: 'completed',
  version: 1,
  ...overrides,
})

export const createMockOrganization = (overrides?: Partial<Organization>): Organization => ({
  id: 'org-1',
  name: 'Test Hospital',
  type: 'hospital',
  address: '123 Test Street, Test City',
  phone: '+1234567890',
  email: 'contact@testhospital.com',
  website: 'https://testhospital.com',
  logo: '/logo.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createInitialState = (overrides?: Partial<RootState>): RootState => ({
  auth: {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    authCheckCompleted: false,
  },
  notes: {
    audioJobs: [],
    medicalNotes: [],
    currentNote: null,
    currentNoteVersions: [],
    currentNoteAuditTrail: [],
    versionComparison: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
  },
  user: {
    currentOrganization: null,
    userStatistics: null,
    isLoading: false,
    error: null,
  },
  ...overrides,
})

// Create test store
export const createTestStore = (initialState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      user: userReducer,
    },
    preloadedState: createInitialState(initialState),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Custom render function with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<RootState>
  store?: ReturnType<typeof createTestStore>
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialState,
    store = createTestStore(initialState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock API responses
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : undefined,
  error: success ? undefined : 'Error occurred',
})

export const createMockApiError = (error = 'Network error') => ({
  success: false,
  error,
})

// Mock fetch responses
export const mockFetchSuccess = <T,>(data: T) => {
  const mockResponse = {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: jest.fn().mockResolvedValue(createMockApiResponse(data)),
  }
  ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
  return mockResponse
}

export const mockFetchError = (status = 500, error = 'Internal Server Error') => {
  const mockResponse = {
    ok: false,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: jest.fn().mockResolvedValue(createMockApiError(error)),
  }
  ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
  return mockResponse
}

export const mockFetchPDF = () => {
  const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' })
  const mockResponse = {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/pdf' }),
    blob: jest.fn().mockResolvedValue(mockBlob),
  }
  ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
  return mockResponse
}

// Helper to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

// Helper to create form data for file uploads
export const createMockFile = (name = 'test.mp3', type = 'audio/mp3', size = 1024) => {
  const file = new File(['test content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Helper to simulate user authentication
export const createAuthenticatedState = (user = createMockUser()): Partial<RootState> => ({
  auth: {
    user,
    token: 'mock-jwt-token',
    isLoading: false,
    isAuthenticated: true,
    error: null,
    authCheckCompleted: true,
  },
})

// Helper to simulate loading state
export const createLoadingState = (): Partial<RootState> => ({
  auth: {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    authCheckCompleted: false,
  },
})

// Helper to simulate error state
export const createErrorState = (error = 'Test error'): Partial<RootState> => ({
  auth: {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error,
    authCheckCompleted: true,
  },
})

// Helper to create notes state with data
export const createNotesState = (notes = [createMockMedicalNote()]): Partial<RootState> => ({
  notes: {
    audioJobs: [],
    medicalNotes: notes,
    currentNote: notes[0] || null,
    currentNoteVersions: [],
    currentNoteAuditTrail: [],
    versionComparison: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
    pagination: {
      page: 1,
      limit: 20,
      total: notes.length,
      pages: Math.ceil(notes.length / 20),
    },
  },
})

// Export everything for easy importing
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Mock data
export const mockUser = {
  id: '1',
  userId: '1',
  email: 'john@example.com',
  name: 'John Doe',
  specialization: 'General Practice',
  registrationNo: 'REG123',
  licenseNumber: 'LIC123',
  preferredLanguage: 'en-US',
  preferredLanguages: ['en-US'],
  bio: 'Experienced doctor',
  avatarUrl: '/avatar.jpg',
  isVerified: true,
  role: 'DOCTOR',
  roleId: 'role_1',
  organization: {
    name: 'Test Hospital',
    id: 'org_1',
    type: 'HOSPITAL'
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

export const mockMedicalNote = {
  id: '1',
  patientName: 'Jane Smith',
  patientAge: 35,
  patientGender: 'Female',
  chiefComplaint: 'Headache',
  historyOfPresentIllness: 'Patient reports severe headache for 3 days',
  physicalExamination: 'Normal vital signs, no neurological deficits',
  diagnosis: 'Tension headache',
  treatmentPlan: 'Rest, hydration, and pain medication',
  prescriptions: [
    {
      medication: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Every 6 hours'
    }
  ],
  noteType: 'consultation',
  audioJobId: 'job_1',
  timeSaved: 15,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        notes: notesReducer,
        user: userReducer
      },
      preloadedState: preloadedState as any
    }),
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>;
    store?: Store;
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
} 