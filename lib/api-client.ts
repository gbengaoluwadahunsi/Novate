"use client"

// API Client for NovateScribe Backend Integration
// Updated to match comprehensive backend API documentation

const getBackendUrl = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use environment variable if set, otherwise fallback based on environment
  return process.env.NEXT_PUBLIC_BACKEND_URL || 
    (isDevelopment ? 'http://localhost:5000' : 'https://novatescribebackend.onrender.com');
};

const API_BASE_URL = getBackendUrl();

// Log the backend URL only in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔌 API Client initialized with backend URL:', API_BASE_URL);
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Enhanced User interface matching backend AppUser
interface User {
  id: string;
  userId: string; // Backward compatibility
  email: string;
  name?: string; // Optional for backward compatibility
  firstName?: string; // New field from backend
  lastName?: string; // New field from backend
  specialization?: string;
  registrationNo?: string;
  licenseNumber?: string;
  preferredLanguage?: string; // Computed from preferredLanguages[0] for compatibility
  preferredLanguages?: string[]; // Actual backend field
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  role: string; // Resolved from database (DOCTOR, ADMIN)
  roleId: string;
  organization?: {
    name: string;
    id: string;
    type: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  };
  createdAt: string;
  updatedAt: string;
}

interface MedicalNote {
  id: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string;
  visitDate?: string;
  visitTime?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  historyOfPresentingIllness?: string; // Backend field name
  pastMedicalHistory?: string;
  systemReview?: string;
  physicalExamination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  managementPlan?: string;
  followUpInstructions?: string;
  additionalNotes?: string;
  prescriptions?: Prescription[];
  noteType: 'consultation' | 'follow-up' | 'assessment' | null;
  audioJobId?: string;
  timeSaved?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

interface Organization {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  createdAt: string;
  updatedAt: string;
  users?: User[];
}

interface AudioJob {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  audioUrl: string;
  transcription?: string;
  language?: string;
  timeSaved?: number;
  createdAt: string;
  updatedAt: string;
}

interface TranscriptionResult {
  status: 'IN_PROGRESS' | 'QUEUED' | 'COMPLETED' | 'FAILED';
  transcript?: string;
  completedAt?: string;
  doctorAudioExpiresAt?: string;
  message?: string;
}

interface FastTranscriptionResponse {
  transcript?: string;
  medicalNote?: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    diagnosis: string;
    treatmentPlan: string;
  };
  patientInfo?: {
    name: string;
    age: string;
    gender: string;
  };
  language: string;
  processingTime: string;
  jobId?: string; // Only returned if processing takes >1 minute
}

// Version History & Audit Interfaces
interface NoteVersion {
  id: string;
  version: number;
  content?: any;
  changeType: 'CREATE' | 'UPDATE' | 'RESTORE';
  changeDescription: string;
  changedBy: string;
  changedByUser: {
    name: string;
    email: string;
  };
  changedAt: string;
}

interface VersionComparison {
  noteId: string;
  fromVersion: {
    version: number;
    changedAt: string;
    changedBy: string;
  };
  toVersion: {
    version: number;
    changedAt: string;
    changedBy: string;
  };
  differences: VersionDifference[];
  totalChanges: number;
}

interface VersionDifference {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'modified' | 'added' | 'removed';
}

interface AuditTrailEntry {
  version: number;
  action: 'CREATE' | 'UPDATE' | 'RESTORE' | 'DELETE';
  timestamp: string;
  user: string;
  description: string;
  changes: VersionDifference[];
}

interface UserStatistics {
  totalTimeSaved: number;
  averageTimeSaved: number;
  totalNotes: number;
  breakdown: {
    [key: string]: {
      count: number;
      timeSaved: number;
    };
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

// Health & Performance Interfaces
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: string;
    memory: string;
    disk: string;
  };
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  responseTime: number;
}

interface PerformanceMetrics {
  timestamp: string;
  performance: {
    totalRequests: number;
    averageResponseTime: number;
    slowRequestCount: number;
    slowRequestThreshold: number;
    requestsPerMinute: number;
  };
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpu: {
      user: number;
      system: number;
    };
    platform: string;
    nodeVersion: string;
    pid: number;
  };
  environment: string;
}

interface SystemStats {
  users: {
    total: number;
    verified: number;
  };
  notes: {
    total: number;
    timeSaved: {
      total: number;
      formatted: string;
    };
  };
  organizations: {
    total: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    author: string;
    createdAt: string;
  }>;
}

interface DashboardStats {
  timeSavedPercentage: number;
  accuracy: number;
  doctorsUsing: number;
  notesProcessed: number;
  additionalMetrics: {
    totalTimeSavedHours: number;
    totalUsers: number;
    averageTimeSavedPerNote: number;
  };
}

interface SupportedLanguage {
  code: string;
  name: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private maxRetries: number = Number(process.env.NEXT_PUBLIC_MAX_RETRIES) || 3;
  private timeout: number = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      this.token = token;
    }
  }

  private removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      this.token = null;
    }
  }



  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      
      // Use longer timeout for transcription endpoints
      const isTranscriptionEndpoint = endpoint.includes('/transcribe');
      const timeoutMs = isTranscriptionEndpoint ? 180000 : this.timeout; // 3 minutes for transcription, 30 seconds for others
      
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Don't set Content-Type for FormData - let browser handle it
      const headers = new Headers();
      
      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      
      // Add any custom headers
      if (options.headers) {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }

      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token expiration
      if (response.status === 401) {
        this.removeToken();
        // Redirect to login if token is invalid/expired
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return {
          success: false,
          error: 'Authentication failed. Please log in again.',
        };
      }

      const data = await response.json();

      // Handle successful response
      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      }

      // Handle error response
      const error = {
        success: false,
        error: data.error || data.message || 'An unexpected error occurred',
        details: data.details,
      };

      // Retry on specific error conditions
      if (
        retryCount < this.maxRetries &&
        (response.status >= 500 || response.status === 429)
      ) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, options, retryCount + 1);
      }

      return error;
    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error) {
        const isTimeout = error.name === 'AbortError';
        const isTranscriptionEndpoint = endpoint.includes('/transcribe');
        
        let errorMessage = error.message;
        if (isTimeout) {
          errorMessage = isTranscriptionEndpoint
            ? 'Transcription took longer than expected. For very long audio files, please try using the regular transcription option instead.'
            : 'Request timed out. Please try again.';
        }

        // Retry on network errors (but not timeouts)
        if (retryCount < this.maxRetries && !isTimeout) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(endpoint, options, retryCount + 1);
        }

        return {
          success: false,
          error: errorMessage,
          details: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred',
        details: 'UNKNOWN_ERROR',
      };
    }
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    registrationNo?: string;
    licenseNumber?: string;
    preferredLanguage?: string;
    bio?: string;
    avatarUrl?: string;
    organizationId?: string;
  }): Promise<ApiResponse<{ id: string; email: string; name: string; specialization?: string; registrationNo?: string; isVerified: boolean }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
      
      // Transform user data to match frontend interface
      if (response.data.user) {
        const transformedUser: User = {
          id: response.data.user.id,
          userId: response.data.user.id, // Backward compatibility
          email: response.data.user.email,
          name: response.data.user.name,
          specialization: response.data.user.specialization || '',
          registrationNo: response.data.user.registrationNo || '',
          licenseNumber: response.data.user.licenseNumber || '',
          preferredLanguage: response.data.user.preferredLanguages?.[0] || 'en',
          preferredLanguages: response.data.user.preferredLanguages || ['en'],
          bio: response.data.user.bio || '',
          avatarUrl: response.data.user.avatarUrl || '',
          isVerified: response.data.user.isVerified || false,
          role: response.data.user.role?.name || response.data.user.role || 'DOCTOR',
          roleId: response.data.user.roleId || response.data.user.role?.id || '',
          organization: response.data.user.organization ? {
            name: response.data.user.organization.name,
            id: response.data.user.organization.id,
            type: response.data.user.organization.type
          } : undefined,
          createdAt: response.data.user.createdAt,
          updatedAt: response.data.user.updatedAt
        };
        
        return {
          success: true,
          data: {
            token: response.data.token,
            user: transformedUser
          },
          message: response.message
        };
      }
    }

    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const body = JSON.stringify({ token, password });
    // Debug logging removed for production
    
    return this.request('/auth/reset-password', {
      method: 'POST',
      body,
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.request<any>('/auth/me');
    
    if (response.success && response.data) {
      // Transform user data to match frontend interface
      const transformedUser: User = {
        id: response.data.id,
        userId: response.data.id, // Backward compatibility
        email: response.data.email,
        name: response.data.name,
        specialization: response.data.specialization || '',
        registrationNo: response.data.registrationNo || '',
        licenseNumber: response.data.licenseNumber || '',
        preferredLanguage: response.data.preferredLanguages?.[0] || 'en',
        preferredLanguages: response.data.preferredLanguages || ['en'],
        bio: response.data.bio || '',
        avatarUrl: response.data.avatarUrl || '',
        isVerified: response.data.isVerified || false,
        role: response.data.role?.name || response.data.role || 'DOCTOR',
        roleId: response.data.roleId || response.data.role?.id || '',
        organization: response.data.organization ? {
          name: response.data.organization.name,
          id: response.data.organization.id,
          type: response.data.organization.type
        } : undefined,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      };
      
      return {
        success: true,
        data: transformedUser,
        message: response.message
      };
    }
    
    return response;
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request('/profile');
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/auth/verify-email?token=${token}`);
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async logout(): Promise<ApiResponse> {
    try {
      // Since backend doesn't have a logout endpoint, we handle logout client-side
      // Clear local storage and remove token
      this.removeToken();
      
      // Clear any other stored data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }

  // ==========================================
  // TRANSCRIPTION METHODS (Updated - No Diarization)
  // ==========================================

  async fastTranscription(
    file: File, 
    patientData?: {
      patientName?: string;
      patientAge?: string;
      patientGender?: string;
    },
    language?: string
  ): Promise<ApiResponse<FastTranscriptionResponse>> {
    if (!file) {
      return {
        success: false,
        error: 'No audio file provided'
      };
    }

    const formData = new FormData();
    formData.append('audioFile', file);

    if (language) {
      formData.append('language', language);
    }
    if (patientData?.patientName) {
      formData.append('patientName', patientData.patientName);
    }
    if (patientData?.patientAge) {
      formData.append('patientAge', patientData.patientAge);
    }
    if (patientData?.patientGender) {
      formData.append('patientGender', patientData.patientGender);
    }

    return this.request('/transcribe/fast', {
      method: 'POST',
      body: formData,
      // Let browser set Content-Type for FormData
    });
  }

  async startTranscription(
    file: File, 
    patientData?: {
      patientName?: string;
      patientAge?: string;
      patientGender?: string;
    },
    language?: string
  ): Promise<ApiResponse<{ message: string; jobId: string; patientInfo: any; language: string }>> {
    if (!file) {
      return {
        success: false,
        error: 'No audio file provided'
      };
    }

    const formData = new FormData();
    formData.append('audioFile', file);

    if (language) {
      formData.append('language', language);
    }
    if (patientData?.patientName) {
      formData.append('patientName', patientData.patientName);
    }
    if (patientData?.patientAge) {
      formData.append('patientAge', patientData.patientAge);
    }
    if (patientData?.patientGender) {
      formData.append('patientGender', patientData.patientGender);
    }

    return this.request('/transcribe/start', {
      method: 'POST',
      body: formData,
      // Let browser set Content-Type for FormData
    });
  }

  async getTranscriptionResult(jobId: string): Promise<ApiResponse<TranscriptionResult>> {
    return this.request(`/transcribe/result/${jobId}`);
  }

  // Note: Backend doesn't have a separate status endpoint
  // Use getTranscriptionResult instead for status checking

  // ==========================================
  // MEDICAL NOTES METHODS
  // ==========================================

  async createMedicalNote(noteData: {
    patientName: string;
    patientAge: number;
    patientGender: string;
    visitDate?: string;
    visitTime?: string;
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    physicalExamination?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    managementPlan?: string;
    prescriptions?: Prescription[];
    noteType: 'consultation' | 'follow-up' | 'assessment';
    audioJobId?: string;
  }): Promise<ApiResponse<MedicalNote>> {
    return this.request('/medical-notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getMedicalNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ notes: MedicalNote[]; pagination: PaginationMeta }>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);

      const queryString = searchParams.toString();
      const response = await this.request<{ notes: MedicalNote[]; pagination: PaginationMeta }>(`/medical-notes${queryString ? `?${queryString}` : ''}`);
      let transformedResponse = response;

      // Handle legacy response format
      if (response.data && Array.isArray(response.data)) {
        transformedResponse = {
          ...response,
          data: {
            notes: response.data,
            pagination: {
              page: 1,
              limit: response.data.length,
              total: response.data.length,
              pages: 1
            }
          }
        };
      }
      // Check if backend returns notes in expected structure
      else if (response.data && 'notes' in response.data) {
        transformedResponse = response;
      }

      return transformedResponse;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch medical notes',
        data: {
          notes: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        }
      };
    }
  }

  async getMedicalNote(noteId: string): Promise<ApiResponse<MedicalNote>> {
    try {
      console.log('🚀 API Client: Calling getMedicalNote with noteId:', noteId);
      console.log('🚀 API Client: Base URL:', this.baseUrl);
      console.log('🚀 API Client: Full endpoint:', `${this.baseUrl}/medical-notes/${noteId}`);
      
      // Use the new medical-notes endpoint as per backend API documentation
      const response = await this.request<MedicalNote>(`/medical-notes/${noteId}`);
      
      console.log('✅ API Client: getMedicalNote response:', response);
      if (response.success && response.data) {
        console.log('✅ API Client: Note data received:', {
          patientName: response.data.patientName,
          patientAge: response.data.patientAge,
          chiefComplaint: response.data.chiefComplaint,
          historyOfPresentingIllness: response.data.historyOfPresentingIllness,
          diagnosis: response.data.diagnosis
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ API Client: getMedicalNote error:', error);
      return {
        success: false,
        error: 'Failed to fetch medical note',
        data: undefined
      };
    }
  }

  async updateMedicalNote(noteId: string, noteData: Partial<MedicalNote>): Promise<ApiResponse<MedicalNote>> {
    return this.request(`/medical-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteMedicalNote(noteId: string): Promise<ApiResponse> {
    return this.request(`/medical-notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // PDF EXPORT METHODS
  // ==========================================

  // Special method for PDF exports that returns binary data
  private async requestPDF(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<Blob>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers = new Headers();
      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle token expiration
      if (response.status === 401) {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return {
          success: false,
          error: 'Authentication failed. Please log in again.',
        };
      }

      if (response.ok) {
        // For PDF responses, return the blob directly
        const blob = await response.blob();
        return {
          success: true,
          data: blob,
        };
      }

      // If there's an error, try to parse it as JSON
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || errorData.message || 'Failed to export PDF',
        };
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred while exporting PDF',
      };
    }
  }

  async exportNotePDF(noteId: string, options?: {
    format?: 'A4' | 'Letter';
    includeHeader?: boolean;
    includeFooter?: boolean;
  }): Promise<ApiResponse<Blob>> {
    const searchParams = new URLSearchParams();
    if (options?.format) searchParams.append('format', options.format);
    if (options?.includeHeader !== undefined) searchParams.append('includeHeader', options.includeHeader.toString());
    if (options?.includeFooter !== undefined) searchParams.append('includeFooter', options.includeFooter.toString());

    const queryString = searchParams.toString();
    return this.requestPDF(`/medical-notes/${noteId}/export/pdf${queryString ? `?${queryString}` : ''}`);
  }

  async previewNotePDF(noteId: string): Promise<ApiResponse<Blob>> {
    return this.requestPDF(`/medical-notes/${noteId}/preview/pdf`);
  }

  // ==========================================
  // VERSION HISTORY & AUDIT METHODS
  // ==========================================

  async getNoteVersions(noteId: string): Promise<ApiResponse<{ noteId: string; versions: NoteVersion[]; total: number }>> {
    return this.request(`/medical-notes/${noteId}/versions`);
  }

  async getNoteVersion(noteId: string, version: number): Promise<ApiResponse<NoteVersion>> {
    return this.request(`/medical-notes/${noteId}/versions/${version}`);
  }

  async compareNoteVersions(noteId: string, fromVersion: number, toVersion: number): Promise<ApiResponse<VersionComparison>> {
    return this.request(`/medical-notes/${noteId}/versions/compare?from=${fromVersion}&to=${toVersion}`);
  }

  async restoreNoteVersion(noteId: string, version: number, reason: string): Promise<ApiResponse<{
    noteId: string;
    restoredToVersion: number;
    restoredContent: any;
    restoredBy: string;
    reason: string;
    restoredAt: string;
  }>> {
    return this.request(`/medical-notes/${noteId}/versions/${version}/restore`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getNoteAuditTrail(noteId: string): Promise<ApiResponse<{ noteId: string; auditTrail: AuditTrailEntry[]; totalEntries: number }>> {
    const endpoint = `/medical-notes/${noteId}/audit-trail`;
    console.log('🔍 Audit Trail API Call:', {
      endpoint,
      fullUrl: `${this.baseUrl}${endpoint}`,
      noteId,
      baseUrl: this.baseUrl
    });
    return this.request(endpoint);
  }

  async getNoteVersionHistory(noteId: string): Promise<ApiResponse<{ noteId: string; versions: NoteVersion[]; total: number }>> {
    return this.request(`/medical-notes/${noteId}/versions/history`);
  }

  // ==========================================
  // ORGANIZATION MANAGEMENT METHODS
  // ==========================================

  async createOrganization(orgData: {
    name: string;
    type: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  }): Promise<ApiResponse<Organization>> {
    return this.request('/organization', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  async addDoctorToOrganization(orgId: string, doctorData: {
    email: string;
    name: string;
    specialization: string;
    registrationNo: string;
  }): Promise<ApiResponse<User>> {
    return this.request(`/organization/${orgId}/doctors`, {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async getOrganization(orgId: string): Promise<ApiResponse<Organization>> {
    return this.request(`/organization/${orgId}`);
  }

  async updateOrganization(orgId: string, orgData: {
    name?: string;
    type?: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  }): Promise<ApiResponse<Organization>> {
    return this.request(`/organization/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    });
  }

  async deleteOrganization(orgId: string): Promise<ApiResponse> {
    return this.request(`/organization/${orgId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // USER PROFILE METHODS
  // ==========================================

  // Note: Backend doesn't have separate profile endpoints
  // Use getCurrentUser instead for getting profile
  async getProfile(): Promise<ApiResponse<User>> {
    return this.getCurrentUser();
  }

  // Note: Backend doesn't have a separate update profile endpoint
  // This method is kept for compatibility but may need backend implementation
  async updateProfile(profileData: {
    name?: string;
    specialization?: string;
    bio?: string;
    preferredLanguage?: string;
    preferredLanguages?: string[];
  }): Promise<ApiResponse<User>> {
    // TODO: Backend needs to implement user profile update endpoint
    // For now, return an error indicating this feature is not available
    return {
      success: false,
      error: 'Profile update not yet implemented on backend'
    };
  }

  // ==========================================
  // USER STATISTICS METHODS
  // ==========================================

  async getTimeSavedStatistics(params?: {
    startDate?: string;
    endDate?: string;
    noteType?: string;
  }): Promise<ApiResponse<UserStatistics>> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.noteType) searchParams.append('noteType', params.noteType);

    const queryString = searchParams.toString();
    return this.request(`/user-stats/time-saved${queryString ? `?${queryString}` : ''}`);
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  async getAllNotes(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ notes: (MedicalNote & { author: { name: string; email: string } })[]; pagination: PaginationMeta }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    return this.request(`/admin/notes${queryString ? `?${queryString}` : ''}`);
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: PaginationMeta }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async testEmailService(email: string): Promise<ApiResponse> {
    return this.request('/admin/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request('/admin/stats');
  }

  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/admin/cache/clear', {
      method: 'POST',
    });
  }

  // ==========================================
  // HEALTH CHECK & MONITORING METHODS
  // ==========================================

  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request('/health');
  }

  // Note: Backend doesn't have separate liveness endpoint
  // Use healthCheck instead
  async livenessCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
  }>> {
    const healthResponse = await this.healthCheck();
    if (healthResponse.success && healthResponse.data) {
      return {
        success: true,
        data: {
          status: healthResponse.data.status,
          timestamp: healthResponse.data.timestamp
        }
      };
    }
    return {
      success: false,
      error: 'Health check failed'
    };
  }

  // Note: Backend doesn't have separate readiness endpoint
  // Use healthCheck instead
  async readinessCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
  }>> {
    const healthResponse = await this.healthCheck();
    if (healthResponse.success && healthResponse.data) {
      return {
        success: true,
        data: {
          status: healthResponse.data.status,
          timestamp: healthResponse.data.timestamp
        }
      };
    }
    return {
      success: false,
      error: 'Health check failed'
    };
  }

  async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
    return this.request('/health/metrics');
  }

  // ==========================================
  // PUBLIC HEALTH ENDPOINTS (No Authentication Required)
  // ==========================================

  async getSupportedLanguages(): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
    return this.request('/health/languages');
  }

  // Public dashboard stats for homepage/landing page (no auth required)
  async getPublicDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/health/dashboard-stats');
  }

  async getUserDashboardStats(): Promise<ApiResponse<{
    notesCreated: number;
    timeSavedSeconds: number;
  }>> {
    return this.request('/user-stats/dashboard', { 
      method: 'GET', 
      credentials: 'include' 
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  User,
  MedicalNote,
  Organization,
  AudioJob,
  NoteVersion,
  VersionComparison,
  VersionDifference,
  AuditTrailEntry,
  UserStatistics,
  HealthCheckResponse,
  PerformanceMetrics,
  SystemStats,
  DashboardStats,
  SupportedLanguage,
  Prescription,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
  TranscriptionResult,
  FastTranscriptionResponse,
};

export default apiClient;
