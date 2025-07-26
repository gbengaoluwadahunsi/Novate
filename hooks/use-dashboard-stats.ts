import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type { DashboardStats } from '@/lib/api-client'

interface UseDashboardStatsReturn {
  stats: DashboardStats
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UserDashboardStats {
  notesCreated: number;
  timeSavedSeconds: number;
}

interface UseUserDashboardStatsReturn {
  stats: UserDashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FALLBACK_STATS: DashboardStats = {
  timeSavedPercentage: 85,
  accuracy: 99,
  doctorsUsing: 5000,
  notesProcessed: 1000000,
  additionalMetrics: {
    totalTimeSavedHours: 2841,
    totalUsers: 1350,
    averageTimeSavedPerNote: 22
  }
}

const FALLBACK_USER_STATS: UserDashboardStats = {
  notesCreated: 0,
  timeSavedSeconds: 0
}

export function useUserDashboardStats(): UseUserDashboardStatsReturn {
  const [stats, setStats] = useState<UserDashboardStats>(FALLBACK_USER_STATS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchStats = async () => {
    // Only fetch if we're on the client side
    if (!mounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getUserDashboardStats()

      if (response.success && response.data) {
        setStats(response.data)
      } else {
        throw new Error('Invalid response format from user dashboard stats API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user dashboard statistics')
      setStats(FALLBACK_USER_STATS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    fetchStats()

    // Auto-refresh every minute to get updated stats
    const interval = setInterval(fetchStats, 60 * 1000)

    return () => clearInterval(interval)
  }, [mounted])

  return {
    stats,
    loading: loading && mounted,
    error,
    refetch: fetchStats
  }
}

// Public dashboard stats hook for homepage/landing page (no auth required)
export function usePublicDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchStats = async () => {
    // Only fetch if we're on the client side
    if (!mounted) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getPublicDashboardStats()

      if (response.success && response.data) {
        // Validate and sanitize the data to prevent negative or unreasonable values
        const sanitizedData: DashboardStats = {
          ...response.data,
          timeSavedPercentage: Math.max(0, Math.min(100, response.data.timeSavedPercentage || FALLBACK_STATS.timeSavedPercentage)),
          accuracy: Math.max(0, Math.min(100, response.data.accuracy || FALLBACK_STATS.accuracy)),
          doctorsUsing: Math.max(0, response.data.doctorsUsing || FALLBACK_STATS.doctorsUsing),
          notesProcessed: Math.max(0, response.data.notesProcessed || FALLBACK_STATS.notesProcessed),
        }

        // Log warning if we had to sanitize negative values
        if (response.data.timeSavedPercentage < 0) {
          console.warn('⚠️ API returned negative timeSavedPercentage:', response.data.timeSavedPercentage, 'Using fallback:', sanitizedData.timeSavedPercentage)
        }
        if (response.data.accuracy < 0) {
          console.warn('⚠️ API returned negative accuracy:', response.data.accuracy, 'Using fallback:', sanitizedData.accuracy)
        }

        setStats(sanitizedData)
      } else {
        throw new Error('Invalid response format from public dashboard stats API')
      }
    } catch (err) {
      console.error('❌ Failed to fetch public dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch public dashboard statistics')
      setStats(FALLBACK_STATS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    fetchStats()

    // Auto-refresh every 5 minutes to get updated stats (as per backend caching)
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [mounted])

  return {
    stats,
    loading: loading && mounted,
    error,
    refetch: fetchStats
  }
} 