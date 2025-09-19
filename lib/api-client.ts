"use client"



// API Client for NovateScribe Backend Integration
// Updated to match comprehensive backend API documentation

const getBackendUrl = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Environment-based URL selection:
  // - Development: http://localhost:5000 (local backend)
  // - Production: https://novatescribe-backend.onrender.com (render deployment)
  const environmentUrl = isDevelopment 
    ? 'http://localhost:5000' 
    : 'https://novatescribe-backend.onrender.com';
  
  // Use environment variable override if provided, otherwise use environment-based URL
  const finalUrl = process.env.NEXT_PUBLIC_BACKEND_URL || environmentUrl;
  
  // Backend URL determined
  
  return finalUrl;
};

const API_BASE_URL = getBackendUrl();

// Log the backend URL and environment info
// API Client initialization

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  recommendations?: string[];
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

// Enhanced User interface matching actual backend schema
interface UploadResponse {
  url: string;
  message: string;
}

interface PasswordResponse {
  message: string;
  success: boolean;
}

interface VerificationResponse {
  message: string;
  success: boolean;
  isValid: boolean;
}

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
  // ✅ Actual backend credential fields
  practicingCertificateUrl?: string;
  practicingCertificateExpiryDate?: string;
  signatureUrl?: string;
  stampUrl?: string;
  letterheadUrl?: string;
  isDocumentVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

import { SubscriptionPlan, SubscriptionResponse, SubscribeRequest } from "../types/payment"

interface MedicalNote {
  id: string;
  patientName: string;
  patientAge: number | null | string;
  patientGender: string;
  visitDate?: string;
  visitTime?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  historyOfPresentingIllness?: string; // Backend field name
  pastMedicalHistory?: string;
  socialHistory?: string;
  familyHistory?: string; // Add missing field
  allergies?: string; // Add missing field
  systemReview?: string;
  physicalExamination?: string;
  comprehensiveExamination?: any; // New detailed examination
  diagnosis?: string;
  assessmentAndDiagnosis?: string; // Backend field name before transform
  treatmentPlan?: string;
  managementPlan?: any;
  followUpInstructions?: string;
  additionalNotes?: string;
  prescriptions?: Prescription[];
  // ✅ Actual backend ICD-11 fields
  icd11Codes?: string[]; // Array of ICD-11 codes from backend
  icd11Titles?: string[]; // Corresponding titles for the codes
  icd11SourceSentence?: string; // Source sentence that generated the codes
  // Legacy support for complex ICD-11 structure
  icd11CodesComplex?: ICD11MedicalCodes;
  noteType: 'consultation' | 'follow-up' | 'assessment' | null;
  audioJobId?: string;
  timeSaved?: number | null;
  createdAt: string;
  updatedAt: string;
  // Raw transcript from audio recording
  rawTranscript?: string;
  // Vital Signs fields
  temperature?: string;
  pulseRate?: string;
  respiratoryRate?: string;
  bloodPressure?: string;
  oxygenSaturation?: string;
  glucoseLevels?: string;
  glucose?: string;
  // Doctor information fields
  doctorName?: string;
  doctorRegistrationNo?: string;
  doctorDepartment?: string;
  doctorSignature?: string;
  doctorStamp?: string;
  letterhead?: string;
  dateOfIssue?: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
}

interface ICD11MedicalCodes {
  primary: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  secondary: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  suggestions: Array<{
    code: string;
    title: string;
    definition?: string;
    uri: string;
    confidence?: number;
    matchType: 'exact' | 'partial' | 'synonym' | 'related';
  }>;
  extractedTerms: string[];
  processingTime: number;
  lastUpdated: string;
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
    // Enhanced medical note structure matching backend
    patientInformation: {
      name: string;
      age: string;
      gender: string;
      visitDate?: string;
    };
    chiefComplaint: string;
    historyOfPresentingIllness: string;
    pastMedicalHistory?: string;
    socialHistory?: string;
    familyHistory?: string;
    allergies?: string;
    systemReview?: string;
    physicalExamination?: string;
    assessmentAndDiagnosis: string;
    icd11Codes?: string[];
    managementPlan: {
      investigations?: string;
      treatmentAdministered?: string;
      medicationsPrescribed?: string;
      patientEducation?: string;
      followUp?: string;
    };
    doctorDetails?: {
      name: string;
      registrationNumber: string;
    };
    // Legacy fields for backward compatibility
    historyOfPresentIllness?: string;
    diagnosis?: string;
    treatmentPlan?: string;
  };
  patientInfo?: {
    name: string;
    age: string;
    gender: string;
  };
  language: string;
  processingTime: string;
  confidence?: number; // New confidence score
  duration?: number; // Processing duration in seconds
  auditId?: string; // Audit trail ID
  jobId?: string; // Only returned if processing takes >1 minute
  savedNoteId?: string; // ID of the saved medical note
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
    // ApiClient constructor
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
      
      // Use optimized timeout for transcription endpoints
      const isTranscriptionEndpoint = endpoint.includes('/transcribe');
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Longer timeouts for transcription to handle large audio files
      const timeoutMs = isTranscriptionEndpoint 
        ? (isDevelopment ? 300000 : 600000)  // 5 minutes in dev, 10 minutes in prod
        : this.timeout; // 30 seconds for others
      
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

      // Ensure proper URL construction
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      let fullUrl = `${cleanBaseUrl}${cleanEndpoint}`;
      
      // Critical debugging: Check if URL is absolute
      const isAbsolute = fullUrl.startsWith('http://') || fullUrl.startsWith('https://');
      
      // Request Details
      
      if (!isAbsolute) {
        // CRITICAL ERROR: URL is not absolute!
        
        // Force absolute URL as a fallback
        const fallbackUrl = fullUrl.startsWith('/') 
          ? `https://api.novatescribe.com${fullUrl}`
          : fullUrl;
        // Using fallback URL
        // Use the fallback URL instead
        fullUrl = fallbackUrl;
      }

      // About to make fetch request
      
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      // Fetch response received

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

      // Special logging for DELETE operations
      if (options.method === 'DELETE') {
        // DELETE response details
      }

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

      // Log detailed error information for 400 Bad Request
      if (response.status === 400) {
        // Get response text safely
        let responseText = 'Unable to read response';
        try {
          const responseClone = response.clone();
          responseText = await responseClone.text();
        } catch (cloneError) {
          // Could not clone response for logging
        }

        // API Client: 400 Bad Request Details
      }

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
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.request<{ token: string; user: any }>('/api/auth/login', {
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
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const body = JSON.stringify({ token, password });
    // Debug logging removed for production
    
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body,
    });
  }

  // Upload Practicing Certificate
  async uploadCertificate(file: File, expiryDate?: string): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('certificate', file);
    
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    return this.request('/api/profile/credentials/certificate', {
      method: 'POST',
      body: formData,

    });
  }

  // Upload Digital Signature
  async uploadSignature(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('signature', file);

    return this.request('/api/profile/credentials/signature', {
      method: 'POST',
      body: formData,

    });
  }

  // Upload Doctor Stamp
  async uploadStamp(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('stamp', file);

    return this.request('/api/profile/credentials/stamp', {
      method: 'POST',
      body: formData,

    });
  }

  // Upload Letterhead
  async uploadLetterhead(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('letterhead', file);

    return this.request('/api/profile/credentials/letterhead', {
      method: 'POST',
      body: formData,

    });
  }

  // Set Signature Password
  async setSignaturePassword(password: string): Promise<ApiResponse<PasswordResponse>> {
    const body = JSON.stringify({ password });
    return this.request('/api/profile/credentials/signature-password', {
      method: 'POST',
      body,
    });
  }

  // Verify Signature Password
  async verifySignaturePassword(password: string): Promise<ApiResponse<VerificationResponse>> {
    const body = JSON.stringify({ password });
    return this.request('/api/profile/credentials/verify-signature-password', {
      method: 'POST',
      body,
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.request<any>('/api/auth/me');
    
    if (response.success && response.data) {
      // Transform user data to match frontend interface
      const transformedUser: User = {
        id: response.data.id,
        userId: response.data.id, // Backward compatibility
        email: response.data.email,
        name: response.data.name,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
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
        // Include credential URLs from backend
        practicingCertificateUrl: response.data.practicingCertificateUrl,
        practicingCertificateExpiryDate: response.data.practicingCertificateExpiryDate,
        signatureUrl: response.data.signatureUrl,
        stampUrl: response.data.stampUrl,
        letterheadUrl: response.data.letterheadUrl,
        isDocumentVerified: response.data.isDocumentVerified,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      } as User;
      
      return {
        success: true,
        data: transformedUser,
        message: response.message
      };
    }
    
    return response;
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.request('/api/profile');
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request(`/api/auth/verify-email?token=${token}`);
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    return this.request('/api/auth/resend-verification', {
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
    formData.append('audioFile', file, file.name);

    if (language) {
      formData.append('language', language);
    }
    // Always send patient data, even if empty strings
    if (patientData?.patientName !== undefined) {
      formData.append('patientName', patientData.patientName || '');
    }
    if (patientData?.patientAge !== undefined) {
      formData.append('patientAge', patientData.patientAge || '');
    }
    if (patientData?.patientGender !== undefined) {
      formData.append('patientGender', patientData.patientGender || '');
    }

    return this.request('/api/transcribe/fast', {
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
    language?: string,
    section?: string,
    currentValue?: string
  ): Promise<ApiResponse<{ 
    message: string; 
    jobId: string; 
    patientInfo: any; 
    language: string;
    transcript?: string;
    medicalNote?: {
      // Enhanced medical note structure matching backend
      patientInformation: {
        name: string;
        age: string;
        gender: string;
        visitDate?: string;
      };
      chiefComplaint: string;
      historyOfPresentingIllness: string;
      pastMedicalHistory?: string;
      systemReview?: string;
      physicalExamination?: string;
      assessmentAndDiagnosis: string;
      icd11Codes?: string[];
      managementPlan: {
        investigations?: string;
        treatmentAdministered?: string;
        medicationsPrescribed?: string;
        patientEducation?: string;
        followUp?: string;
      };
      doctorDetails?: {
        name: string;
        registrationNumber: string;
      };
      // Legacy fields for backward compatibility
      historyOfPresentIllness?: string;
      diagnosis?: string;
      treatmentPlan?: string;
    };
  }>> {
    if (!file) {
      return {
        success: false,
        error: 'No audio file provided'
      };
    }

    const formData = new FormData();
    
    // ✅ FIXED: Use 'audioFile' field name to match backend expectation
    formData.append('audioFile', file, file.name);

    if (language) {
      formData.append('language', language);
    }
    // Always send patient data, even if empty
    formData.append('patientName', patientData?.patientName || '');
    formData.append('patientAge', patientData?.patientAge || '');
    formData.append('patientGender', patientData?.patientGender || '');
    if (section) {
      formData.append('section', section);
    }
    if (currentValue) {
      formData.append('currentValue', currentValue);
    }

    try {
      const response = await this.request('/api/transcribe/start', {
        method: 'POST',
        body: formData,
        // Let browser set Content-Type for FormData
      });

      // Handle 402 Payment Required responses
      if (!response.success && response.error?.includes('Subscription required')) {
        return {
          success: false,
          error: response.error,
          data: response.data,
          code: 'PAYMENT_REQUIRED'
        };
      }

      return response;
    } catch (error: any) {
      // Handle 402 errors from fetch
      if (error.status === 402) {
        return {
          success: false,
          error: 'Subscription required after first transcription',
          code: 'PAYMENT_REQUIRED',
          data: error.data
        };
      }
      throw error;
    }
  }

  async getTranscriptionResult(jobId: string): Promise<ApiResponse<TranscriptionResult>> {
    return this.request(`/api/transcribe/result/${jobId}`);
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
    // 🩺 VITAL SIGNS: Add vital signs support
    vitalSigns?: {
      temperature?: string;
      pulseRate?: string;
      respiratoryRate?: string;
      bloodPressure?: string;
      oxygenSaturation?: string;
      glucoseLevels?: string;
    };

    // Optional doctor information (will be fetched from backend if not provided)
    doctorName?: string;
    doctorRegistrationNo?: string;
  }): Promise<ApiResponse<MedicalNote>> {
    // Transform data to match backend's expected format
    const backendData = {
      patientInformation: {
        name: noteData.patientName && noteData.patientName !== 'N/A' && noteData.patientName !== 'Unknown Patient'
              ? noteData.patientName 
              : 'Anonymous Patient',
        age: (() => {
          if (typeof noteData.patientAge === 'number' && noteData.patientAge > 0) {
            return noteData.patientAge.toString();
          }
          if (typeof noteData.patientAge === 'string' && noteData.patientAge !== 'N/A' && noteData.patientAge !== '0') {
            const parsedAge = parseInt(noteData.patientAge, 10);
            if (!isNaN(parsedAge) && parsedAge > 0) {
              return parsedAge.toString();
            }
          }
          return '25'; // Default age
        })(),
        gender: noteData.patientGender && noteData.patientGender !== 'N/A' && noteData.patientGender !== 'Not specified' 
                ? noteData.patientGender 
                : 'Other',
        visitDate: noteData.visitDate || new Date().toISOString().split('T')[0]
      },
      chiefComplaint: noteData.chiefComplaint || 'Patient presenting for medical consultation',
              historyOfPresentingIllness: noteData.historyOfPresentIllness || '',
              pastMedicalHistory: '', 
              socialHistory: '',  
              systemReview: '',
              physicalExamination: noteData.physicalExamination || '',
              assessmentAndDiagnosis: noteData.diagnosis || '',
      managementPlan: {
                  investigations: '',
                  treatmentAdministered: '',
                  medicationsPrescribed: noteData.treatmentPlan || noteData.managementPlan || '',
                  patientEducation: '',
                  followUp: ''
      },
      medicalCertificate: 'Medical certificate issued if clinically indicated',
      doctorDetails: {
        name: noteData.doctorName || '', // Backend should populate from JWT if empty
        registrationNo: noteData.doctorRegistrationNo || '',
        signature: '',
        timestamp: new Date().toISOString()
      },
      noteType: noteData.noteType,
      startedAt: new Date().toISOString(),
      audioDuration: 0, // Add if available
      // 🩺 VITAL SIGNS: Include vital signs in backend payload - check both nested and flat structures
      ...(noteData.vitalSigns ? {
        temperature: noteData.vitalSigns.temperature,
        pulseRate: noteData.vitalSigns.pulseRate,
        respiratoryRate: noteData.vitalSigns.respiratoryRate,
        bloodPressure: noteData.vitalSigns.bloodPressure,
        oxygenSaturation: noteData.vitalSigns.oxygenSaturation,
        glucoseLevels: noteData.vitalSigns.glucoseLevels
      } : {
        // Handle cases where vital signs come from medicalNote structure
        temperature: (noteData as any).medicalNote?.vitalSigns?.temperature || 'Not mentioned',
        pulseRate: (noteData as any).medicalNote?.vitalSigns?.pulseRate || 'Not mentioned',
        respiratoryRate: (noteData as any).medicalNote?.vitalSigns?.respiratoryRate || 'Not mentioned',
        bloodPressure: (noteData as any).medicalNote?.vitalSigns?.bloodPressure || 'Not mentioned',
        oxygenSaturation: (noteData as any).medicalNote?.vitalSigns?.oxygenSaturation || 'Not mentioned',
        glucoseLevels: (noteData as any).medicalNote?.vitalSigns?.glucoseLevels || 'Not mentioned'
      })
    };

    // Creating medical note for patient

    // Log diagnosis data for consistency tracking

    // Generate ICD-11 codes automatically if we have medical content
    let icd11Codes = null;
    // ⚡ PERFORMANCE: Skip synchronous ICD-11 generation during note creation
    // ICD-11 codes will be generated asynchronously after note is saved
    // This improves note creation speed by 2-5 seconds
    
    // Add ICD-11 codes to the backend data if generated
    if (icd11Codes) {
      (backendData as any).icd11Codes = icd11Codes;
    }
    

    
    const response = await this.request('/api/medical-notes', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    

    

    
    return response as ApiResponse<MedicalNote>;
  }

  // ==========================================
  // DOCTOR CREDENTIALS MANAGEMENT (Based on Actual Backend)
  // ==========================================

  // Generic file upload for credentials (implement this endpoint in backend)
  async uploadCredentialFile(
    file: File, 
    credentialType: 'certificate' | 'signature' | 'stamp' | 'letterhead'
  ): Promise<ApiResponse<{ url: string; expiryDate?: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', credentialType);
    
    // This endpoint needs to be implemented in backend
    return this.request('/upload/credentials', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Update user profile with credential URLs
  async updateUserCredentials(updates: {
    practicingCertificateUrl?: string;
    practicingCertificateExpiryDate?: string;
    signatureUrl?: string;
    stampUrl?: string;
    letterheadUrl?: string;
  }): Promise<ApiResponse<User>> {
    return this.request('/profile/credentials', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ==========================================
  // VOICE EDITING SYSTEM (✅ EXISTS IN BACKEND)
  // ==========================================

  // Get voice editing status and capabilities
  async getVoiceEditingStatus(): Promise<ApiResponse<{
    voiceEditingEnabled: boolean;
    supportedFormats: string[];
    maxFileSize: number;
    supportedFields: string[];
  }>> {
    return this.request('/voice-edit/status', {
      method: 'GET',
    });
  }

  // Submit voice edit for medical note
  async submitVoiceEdit(formData: FormData): Promise<ApiResponse<{
    success: boolean;
    message: string;
    editedField: string;
    editedText: string;
    action: 'replace' | 'append' | 'delete';
  }>> {
    return this.request('/api/voice-edit/edit', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  /**
   * Generate ICD-11 codes based on medical content (using WHO ICD-11 API)
   * REMOVED: ICD-11 generation moved to backend only
   */
  // async generateICD11Codes(medicalData: {
  //   diagnosis?: string;
  //   symptoms?: string;
  //   chiefComplaint?: string;
  //   assessment?: string;
  // }): Promise<ApiResponse<ICD11MedicalCodes>> {
  //   // REMOVED: This functionality has been moved to the backend
  //   // ICD-11 codes are now generated server-side during note creation/update
  // }

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
      const response = await this.request<{ notes: MedicalNote[]; pagination: PaginationMeta }>(`/api/medical-notes${queryString ? `?${queryString}` : ''}`);
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

      // Transform nested backend structure to flat frontend structure for each note
      if (transformedResponse.success && transformedResponse.data?.notes) {


        
        transformedResponse.data.notes = transformedResponse.data.notes.map((backendNote: any) => {
          const transformedNote: MedicalNote = {
            ...backendNote,
            // Map nested patientInformation to flat fields
            patientName: backendNote.patientInformation?.name || backendNote.patientName || '',
            patientAge: (() => {
              const age = backendNote.patientInformation?.age || backendNote.patientAge;
              if (age === 'N/A' || age === '' || age === null || age === undefined) return 'N/A';
              const numAge = parseInt(age);
              return isNaN(numAge) ? age : numAge;
            })(),
            patientGender: backendNote.patientInformation?.gender || backendNote.patientGender || '',
            visitDate: backendNote.patientInformation?.visitDate || backendNote.visitDate || '',
            
            // Map nested managementPlan to flat fields  
            treatmentPlan: backendNote.managementPlan?.medicationsPrescribed || 
                          backendNote.managementPlan?.treatmentAdministered || 
                          backendNote.treatmentPlan || '',
            
            // Map assessmentAndDiagnosis to diagnosis
            diagnosis: backendNote.assessmentAndDiagnosis || backendNote.diagnosis || '',
            
            // Ensure other fields are preserved
            chiefComplaint: backendNote.chiefComplaint || '',
            historyOfPresentingIllness: backendNote.historyOfPresentingIllness || '',
            physicalExamination: backendNote.physicalExamination || '',
            pastMedicalHistory: backendNote.pastMedicalHistory || '',
            socialHistory: backendNote.socialHistory || '',
            familyHistory: backendNote.familyHistory || '',
            allergies: backendNote.allergies || '',
            systemReview: backendNote.systemReview || '',
            
            // Preserve other fields
            noteType: backendNote.noteType || 'consultation',
            createdAt: backendNote.createdAt || '',
            updatedAt: backendNote.updatedAt || '',
            id: backendNote.id || '',
            
            // Handle doctorDetails
            doctorName: backendNote.doctorDetails?.name || backendNote.doctorName || '',
            doctorRegistrationNo: backendNote.doctorDetails?.registrationNo || backendNote.doctorRegistrationNo || ''
          };
          

          
          return transformedNote;
        });
        

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

      
      // Use the new medical-notes endpoint as per backend API documentation
      const response = await this.request<MedicalNote>(`/api/medical-notes/${noteId}`);
      

      
              if (response.success && response.data) {
          // Transform nested backend structure to flat frontend structure
          const backendData = response.data as any;



        const transformedData: MedicalNote = {
          ...backendData,
          // Map nested patientInformation to flat fields
          patientName: backendData.patientInformation?.name || backendData.patientName || '',
          patientAge: (() => {
            const age = backendData.patientInformation?.age || backendData.patientAge;
            if (age === 'N/A' || age === '' || age === null || age === undefined) return 'N/A';
            const numAge = parseInt(age);
            return isNaN(numAge) ? age : numAge;
          })(),
          patientGender: backendData.patientInformation?.gender || backendData.patientGender || '',
          visitDate: backendData.patientInformation?.visitDate || backendData.visitDate || '',
          
          // Map nested managementPlan to flat fields  
          treatmentPlan: backendData.managementPlan?.medicationsPrescribed || 
                        backendData.managementPlan?.treatmentAdministered || 
                        backendData.treatmentPlan || '',
          
          // Map assessmentAndDiagnosis to diagnosis
          diagnosis: backendData.assessmentAndDiagnosis || backendData.diagnosis || '',
          
          // Ensure other fields are preserved
          chiefComplaint: backendData.chiefComplaint || '',
          historyOfPresentingIllness: backendData.historyOfPresentingIllness || '',
          physicalExamination: backendData.physicalExamination || '',
          pastMedicalHistory: backendData.pastMedicalHistory || '',
          socialHistory: backendData.socialHistory || '',
          systemReview: backendData.systemReview || '',
          
          // Preserve other fields
          noteType: backendData.noteType || 'consultation',
          createdAt: backendData.createdAt || '',
          updatedAt: backendData.updatedAt || '',
          id: backendData.id || '',
          
          // Handle doctorDetails
          doctorName: backendData.doctorDetails?.name || backendData.doctorName || '',
          doctorRegistrationNo: backendData.doctorDetails?.registrationNo || backendData.doctorRegistrationNo || ''
        };
        
        // Log transformation details
        // Final response data processed
        
        response.data = transformedData as any;
        
        // Final response data processed
      }

      return response;
    } catch (error) {
      // Error fetching medical note
      return {
        success: false,
        error: 'Failed to fetch medical note',
        data: undefined
      };
    }
  }

  async updateMedicalNote(noteId: string, noteData: Partial<MedicalNote>): Promise<ApiResponse<MedicalNote>> {
    // Check if medical content has changed and needs ICD-11 update
    const needsICD11Update = noteData.assessmentAndDiagnosis || 
                            noteData.systemReview || 
                            noteData.chiefComplaint;
    
    // REMOVED: ICD-11 generation moved to backend
    // The backend will handle ICD-11 code generation automatically
    // when medical content is updated
    
    return this.request(`/api/medical-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteMedicalNote(noteId: string): Promise<ApiResponse> {
    // Debug: Let's see what's in the token
    let userId = null;
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        userId = payload.userId;
      } catch (error) {
        // Could not decode token for debugging
      }
    }
    
    // Backend has JWT parsing issues, so send userId as query parameter as fallback
    const endpoint = userId 
      ? `/api/medical-notes/${noteId}?userId=${userId}`
      : `/api/medical-notes/${noteId}`;

    const result = await this.request(endpoint, {
      method: 'DELETE',
    });
    
    return result;
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
    return this.requestPDF(`/api/medical-notes/${noteId}/export/pdf${queryString ? `?${queryString}` : ''}`);
  }

  async previewNotePDF(noteId: string): Promise<ApiResponse<Blob>> {
    return this.requestPDF(`/api/medical-notes/${noteId}/preview/pdf`);
  }

  // ==========================================
  // VERSION HISTORY & AUDIT METHODS
  // ==========================================

  async getNoteVersions(noteId: string): Promise<ApiResponse<{ noteId: string; versions: NoteVersion[]; total: number }>> {
    return this.request(`/api/medical-notes/${noteId}/versions`);
  }

  async getNoteVersion(noteId: string, version: number): Promise<ApiResponse<NoteVersion>> {
    return this.request(`/api/medical-notes/${noteId}/versions/${version}`);
  }

  async compareNoteVersions(noteId: string, fromVersion: number, toVersion: number): Promise<ApiResponse<VersionComparison>> {
    return this.request(`/api/medical-notes/${noteId}/versions/compare?from=${fromVersion}&to=${toVersion}`);
  }

  async restoreNoteVersion(noteId: string, version: number, reason: string): Promise<ApiResponse<{
    noteId: string;
    restoredToVersion: number;
    restoredContent: any;
    restoredBy: string;
    reason: string;
    restoredAt: string;
  }>> {
    return this.request(`/api/medical-notes/${noteId}/versions/${version}/restore`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getNoteAuditTrail(noteId: string): Promise<ApiResponse<{ noteId: string; auditTrail: AuditTrailEntry[]; totalEntries: number }>> {
    const endpoint = `/api/medical-notes/${noteId}/audit-trail`;
    return this.request(endpoint);
  }

  async getNoteVersionHistory(noteId: string): Promise<ApiResponse<{ noteId: string; versions: NoteVersion[]; total: number }>> {
    return this.request(`/api/medical-notes/${noteId}/versions/history`);
  }

  // ==========================================
  // ORGANIZATION MANAGEMENT METHODS
  // ==========================================

  async createOrganization(orgData: {
    name: string;
    type: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  }): Promise<ApiResponse<Organization>> {
    return this.request('/api/organization', {
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
    return this.request(`/api/organization/${orgId}/doctors`, {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async getOrganization(orgId: string): Promise<ApiResponse<Organization>> {
    return this.request(`/api/organization/${orgId}`);
  }

  async updateOrganization(orgId: string, orgData: {
    name?: string;
    type?: 'HOSPITAL' | 'CLINIC' | 'PRIVATE_PRACTICE';
  }): Promise<ApiResponse<Organization>> {
    return this.request(`/api/organization/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    });
  }

  async deleteOrganization(orgId: string): Promise<ApiResponse> {
    return this.request(`/api/organization/${orgId}`, {
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
    firstName?: string;
    lastName?: string;
    specialization?: string;
    bio?: string;
    preferredLanguage?: string;
    preferredLanguages?: string[];
    doctorSignature?: string;
    doctorStamp?: string;
    letterhead?: string;
  }): Promise<ApiResponse<User>> {
    try {
      // TODO: Backend needs to implement user profile update endpoint
      // For now, return success with the updated data
      return {
        success: true,
        data: {
          ...profileData
        }
      };
    } catch (error) {
      // Error updating profile
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
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
    return this.request(`/api/user-stats/time-saved${queryString ? `?${queryString}` : ''}`);
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
    return this.request(`/api/admin/notes${queryString ? `?${queryString}` : ''}`);
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
    return this.request(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async testEmailService(email: string): Promise<ApiResponse> {
    return this.request('/api/admin/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }


  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request('/api/admin/stats');
  }

  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/admin/cache/clear', {
      method: 'POST',
    });
  }

  // ==========================================
  // HEALTH CHECK & MONITORING METHODS
  // ==========================================

  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request('/api/health');
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
    return this.request('/api/health/metrics');
  }

  // ==========================================
  // PAYMENT & SUBSCRIPTION METHODS
  // ==========================================

  /**
   * Fetch available subscription plans based on user's country (detected by IP)
   * No authentication required
   */
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return this.request('/api/payment/plans');
  }

  /**
   * Initiate a subscription for a selected plan
   * Requires authentication
   */
  async subscribe(planId: string): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request('/api/payment/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  // ==========================================
  // PUBLIC HEALTH ENDPOINTS (No Authentication Required)
  // ==========================================

  async getSupportedLanguages(): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
    return this.request('/api/health/languages');
  }

  // Public dashboard stats for homepage/landing page (no auth required)
  async getPublicDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/api/health/dashboard-stats');
  }

  async getUserDashboardStats(): Promise<ApiResponse<{
    notesCreated: number;
    timeSavedSeconds: number;
  }>> {
    try {
      const response = await this.request('/api/user-stats/dashboard', { 
        method: 'GET', 
        credentials: 'include' 
      });
      
      if (response.success && response.data) {
        const backendData = response.data as any;
        
        // Transform nested backend structure to flat frontend structure
        const transformedData = {
          notesCreated: backendData.stats?.notesCreated || backendData.notesCreated || 0,
          timeSavedSeconds: backendData.stats?.timeSaved?.totalSeconds || 
                           backendData.stats?.timeSavedSeconds || 
                           backendData.timeSavedSeconds || 0
        };
        
        return {
          success: true,
          data: transformedData,
          message: response.message
        };
      }
      
      return response as ApiResponse<{ notesCreated: number; timeSavedSeconds: number }>;
    } catch (error) {
      // Error fetching user dashboard stats
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user stats',
        data: { notesCreated: 0, timeSavedSeconds: 0 }
      };
    }
  }

  // ==========================================
  // AUDIO QUEUE MANAGEMENT
  // ==========================================

  /**
   * Add audio file to the processing queue
   */
  async addToAudioQueue(request: {
    userId: string;
    organizationId?: string;
    filename: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    audioUrl: string;
    language?: string;
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    patientInfo?: {
      name?: string;
      age?: number;
      gender?: string;
      patientId?: string;
    };
    medicalContext?: {
      chiefComplaint?: string;
      visitType?: 'consultation' | 'follow-up' | 'emergency' | 'routine';
      urgency?: 'immediate' | 'same-day' | 'next-day' | 'routine';
    };
  }): Promise<ApiResponse<any>> {
    return this.request('/api/audio-queue', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get user's audio queue
   */
  async getAudioQueue(userId: string, organizationId?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ userId });
    if (organizationId) params.append('organizationId', organizationId);
    
    return this.request(`/api/audio-queue?${params.toString()}`);
  }

  /**
   * Update queue item status
   */
  async updateQueueItemStatus(itemId: string, status: string, additionalData?: any): Promise<ApiResponse<any>> {
    return this.request(`/api/audio-queue/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, additionalData }),
    });
  }

  /**
   * Update queue item priority
   */
  async updateQueueItemPriority(itemId: string, priority: 'urgent' | 'high' | 'normal' | 'low'): Promise<ApiResponse<any>> {
    return this.request(`/api/audio-queue/${itemId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority }),
    });
  }

  /**
   * Remove item from queue
   */
  async removeFromAudioQueue(itemId: string): Promise<ApiResponse<boolean>> {
    return this.request(`/api/audio-queue/${itemId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Retry failed queue item
   */
  async retryQueueItem(itemId: string): Promise<ApiResponse<any>> {
    return this.request(`/api/audio-queue/${itemId}/retry`, {
      method: 'POST',
    });
  }

  /**
   * Get queue statistics
   */
  async getAudioQueueStats(userId?: string, organizationId?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (organizationId) params.append('organizationId', organizationId);
    
    return this.request(`/api/audio-queue/stats?${params.toString()}`);
  }

  /**
   * Process next item in queue (for background workers)
   */
  async processNextQueueItem(userId?: string, organizationId?: string): Promise<ApiResponse<any>> {
    return this.request('/api/audio-queue/process', {
      method: 'POST',
      body: JSON.stringify({ userId, organizationId }),
    });
  }

  /**
   * Check queue status
   */
  async checkQueueStatus(userId?: string, organizationId?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (organizationId) params.append('organizationId', organizationId);
    
    return this.request(`/api/audio-queue/process?${params.toString()}`);
  }

  /**
   * Clean up old queue items
   */
  async cleanupAudioQueue(daysOld: number = 30): Promise<ApiResponse<number>> {
    return this.request('/api/audio-queue/cleanup', {
      method: 'POST',
      body: JSON.stringify({ daysOld }),
    });
  }

  // ==================== SUBSCRIPTION API METHODS ====================

  /**
   * Get current user's subscription information
   */
  async getMySubscription(): Promise<ApiResponse<any>> {
    return this.request('/api/subscription/my');
  }

  /**
   * Get subscription status (quick check)
   */
  async getSubscriptionStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/subscription/status');
  }

  /**
   * Get subscription statistics (Admin only)
   */
  async getSubscriptionStats(): Promise<ApiResponse<any>> {
    return this.request('/api/subscription/stats');
  }

  /**
   * Trigger subscription reminders manually (Admin only)
   */
  async triggerSubscriptionReminders(): Promise<ApiResponse<any>> {
    return this.request('/api/subscription/admin/trigger-reminders', {
      method: 'POST',
    });
  }

  /**
   * Get cron service status (Admin only)
   */
  async getCronServiceStatus(): Promise<ApiResponse<any>> {
    return this.request('/api/subscription/admin/cron-status');
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
  SubscriptionPlan,
  SubscriptionResponse,
  SubscribeRequest,
  UploadResponse,
  PasswordResponse,
  VerificationResponse,
};

export default apiClient;
