import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient, type User as ApiUser } from '@/lib/api-client'

// Use the User type from the api-client and extend it if necessary
export interface User extends ApiUser {}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  authCheckCompleted: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  authCheckCompleted: false,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(credentials)
      if (response.success && response.data?.token) {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.data.token)
        }
        return response.data
      } else {
        return rejectWithValue(response.error || 'Login failed')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; firstName: string; lastName: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.register(userData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Registration failed')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.logout()
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
      return null
    } catch (error) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed')
    }
  }
)

export const getUser = createAsyncThunk(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to get user')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user')
    }
  }
)

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const token = state.auth.token
      
      if (!token) {
        return rejectWithValue('No token found')
      }

      const response = await apiClient.getCurrentUser()
      if (response.success) {
        return response.data
      } else {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('token')
        }
        return rejectWithValue('Invalid token')
      }
    } catch (error) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
      return rejectWithValue(error instanceof Error ? error.message : 'Token verification failed')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.forgotPassword(email)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to send reset email')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send reset email')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.resetPassword(data.token, data.password)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to reset password')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reset password')
    }
  }
)

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.resendVerificationEmail(email)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to resend verification email')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to resend verification email')
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    clearError: (state) => {
      state.error = null
    },
    authCheckCompleted: (state) => {
      state.authCheckCompleted = true
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('token', action.payload)
      }
    },
    loadTokenFromStorage: (state) => {
      // Only access localStorage on the client side
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const token = localStorage.getItem('token')
          if (token) {
            state.token = token
          }
        } catch (error) {
  
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    // Get User
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.isAuthenticated = true
          state.user = action.payload
        } else {
          state.isAuthenticated = false
          state.user = null
        }
        state.error = null
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Verify Token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.isAuthenticated = true
          state.user = action.payload
        } else {
          state.isAuthenticated = false
          state.user = null
        }
        state.authCheckCompleted = true
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
        state.authCheckCompleted = true
      })

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Resend Verification Email
    builder
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearAuth, clearError, authCheckCompleted, setToken, loadTokenFromStorage } = authSlice.actions
export default authSlice.reducer 