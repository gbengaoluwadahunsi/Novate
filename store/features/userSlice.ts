import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient, type Organization as ApiOrganization, type UserStatistics } from '@/lib/api-client'

// Types
export interface Organization extends ApiOrganization {}

export interface UserState {
  currentOrganization: Organization | null
  userStatistics: UserStatistics | null
  isLoading: boolean
  error: string | null
  user: any
}

const initialState: UserState = {
  currentOrganization: null,
  userStatistics: null,
  isLoading: false,
  error: null,
  user: null,
}

// Async thunks
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getUserProfile()
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to get user profile')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfile(profileData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to update user profile')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user profile')
    }
  }
)

export const getUserStatistics = createAsyncThunk(
  'user/getUserStatistics',
  async (params: { startDate?: string; endDate?: string; noteType?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.getTimeSavedStatistics(params)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to get user statistics')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user statistics')
    }
  }
)

export const getOrganization = createAsyncThunk(
  'user/getOrganization',
  async (orgId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.getOrganization(orgId)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to get organization')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get organization')
    }
  }
)

export const updateOrganization = createAsyncThunk(
  'user/updateOrganization',
  async ({ orgId, orgData }: { orgId: string; orgData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateOrganization(orgId, orgData)
      if (response.success) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to update organization')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update organization')
    }
  }
)

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentOrganization: (state, action: PayloadAction<Organization | null>) => {
      state.currentOrganization = action.payload
    },
    setUserStatistics: (state, action: PayloadAction<UserStatistics | null>) => {
      state.userStatistics = action.payload
    },
    clearUserData: (state) => {
      state.currentOrganization = null
      state.userStatistics = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Get User Profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        // Handle partial organization data from user profile
        if (action.payload?.organization) {
          state.currentOrganization = {
            ...action.payload.organization,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        } else {
          state.currentOrganization = null
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        // Update relevant user data if needed
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get User Statistics
    builder
      .addCase(getUserStatistics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.userStatistics = action.payload || null
      })
      .addCase(getUserStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Organization
    builder
      .addCase(getOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrganization = action.payload || null
      })
      .addCase(getOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Organization
    builder
      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrganization = action.payload || null
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  setCurrentOrganization, 
  setUserStatistics, 
  clearUserData 
} = userSlice.actions

export default userSlice.reducer 