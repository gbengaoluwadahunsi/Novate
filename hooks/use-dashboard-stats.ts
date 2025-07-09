import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type { DashboardStats } from '@/lib/api-client'

interface UseDashboardStatsReturn {
  stats: DashboardStats
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
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

export function useDashboardStats(): UseDashboardStatsReturn {
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
      
      const response = await apiClient.getDashboardStats()

      if (response.success && response.data) {
        // Ensure all values are numbers, not objects
        const normalizedStats: DashboardStats = {
          timeSavedPercentage: typeof response.data.timeSavedPercentage === 'number' ? response.data.timeSavedPercentage : FALLBACK_STATS.timeSavedPercentage,
          accuracy: typeof response.data.accuracy === 'number' ? response.data.accuracy : FALLBACK_STATS.accuracy,
          doctorsUsing: typeof response.data.doctorsUsing === 'number' ? response.data.doctorsUsing : FALLBACK_STATS.doctorsUsing,
          notesProcessed: typeof response.data.notesProcessed === 'number' ? response.data.notesProcessed : FALLBACK_STATS.notesProcessed,
          additionalMetrics: response.data.additionalMetrics || FALLBACK_STATS.additionalMetrics
        }
        setStats(normalizedStats)
      } else {
        throw new Error('Invalid response format from dashboard stats API')
      }
    } catch (err) {
      // Error fetching dashboard stats - using fallback values
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics')
      // Keep fallback stats on error
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

    // Auto-refresh every 5 minutes (300,000 ms) to get updated stats
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