"use client"

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/lib/api-client'

// Types
export interface Subscription {
  id: string
  userId: string
  planId: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL'
  startDate: string
  endDate: string
  billingInterval: 'MONTHLY' | 'SIX_MONTHS' | 'YEARLY'
  createdAt: string
  updatedAt: string
  plan?: {
    id: string
    name: string
    price: number
    currency: string
    interval: string
    features: string[]
  }
  // New fields for free subscriptions
  paymentGateway?: 'STRIPE' | 'CURLEC' | 'FREE'
  isFreeSubscription?: boolean
  isAdminUnlimited?: boolean
}

export interface SubscriptionStatus {
  isPaidSubscriber: boolean
  transcriptionCount: number
  subscription?: Subscription
  needsUpgrade?: boolean
  upgradeUrl?: string
  message?: string
  // New fields for free subscriptions
  hasActiveSubscription?: boolean
  isFreeSubscriber?: boolean
  isAdminUnlimitedSubscriber?: boolean
  subscriptionType?: 'PAID' | 'FREE_TRIAL' | 'ADMIN_UNLIMITED' | 'NONE'
}

export interface SubscriptionStats {
  total: number
  active: number
  expired: number
  trial: number
  recent: number
  // New fields for free subscription stats
  freeTrial: number
  adminUnlimited: number
  paid: number
}

export interface SubscriptionState {
  subscription: Subscription | null
  status: SubscriptionStatus | null
  stats: SubscriptionStats | null
  isLoading: boolean
  error: string | null
  lastChecked: number | null
}

const initialState: SubscriptionState = {
  subscription: null,
  status: null,
  stats: null,
  isLoading: false,
  error: null,
  lastChecked: null,
}

// Async thunks
export const getMySubscription = createAsyncThunk(
  'subscription/getMySubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getMySubscription()
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to fetch subscription')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subscription')
    }
  }
)

export const getSubscriptionStatus = createAsyncThunk(
  'subscription/getSubscriptionStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getSubscriptionStatus()
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to fetch subscription status')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subscription status')
    }
  }
)

export const getSubscriptionStats = createAsyncThunk(
  'subscription/getSubscriptionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getSubscriptionStats()
      if (response.success && response.data) {
        return response.data
      } else {
        return rejectWithValue(response.error || 'Failed to fetch subscription stats')
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subscription stats')
    }
  }
)

// Slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscription: (state) => {
      state.subscription = null
      state.status = null
      state.stats = null
      state.error = null
      state.lastChecked = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateTranscriptionCount: (state, action: PayloadAction<number>) => {
      if (state.status) {
        state.status.transcriptionCount = action.payload
      }
    },
    setSubscriptionStatus: (state, action: PayloadAction<SubscriptionStatus>) => {
      state.status = action.payload
      state.lastChecked = Date.now()
    },
  },
  extraReducers: (builder) => {
    // Get My Subscription
    builder
      .addCase(getMySubscription.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getMySubscription.fulfilled, (state, action) => {
        state.isLoading = false
        state.subscription = action.payload
        state.error = null
        state.lastChecked = Date.now()
      })
      .addCase(getMySubscription.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Subscription Status
    builder
      .addCase(getSubscriptionStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.status = action.payload
        state.error = null
        state.lastChecked = Date.now()
      })
      .addCase(getSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Subscription Stats
    builder
      .addCase(getSubscriptionStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getSubscriptionStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(getSubscriptionStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearSubscription, clearError, updateTranscriptionCount, setSubscriptionStatus } = subscriptionSlice.actions
export default subscriptionSlice.reducer
