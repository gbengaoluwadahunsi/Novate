"use client"

import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  getMySubscription, 
  getSubscriptionStatus, 
  getSubscriptionStats,
  clearSubscription,
  updateTranscriptionCount,
  setSubscriptionStatus
} from '@/store/features/subscriptionSlice'
import { toast } from '@/hooks/use-toast'

export function useSubscription() {
  const dispatch = useAppDispatch()
  const { 
    subscription, 
    status, 
    stats, 
    isLoading, 
    error, 
    lastChecked 
  } = useAppSelector((state) => state.subscription)

  // Check if subscription data is stale (older than 5 minutes)
  const isStale = lastChecked ? Date.now() - lastChecked > 5 * 60 * 1000 : true

  // Fetch subscription status (lightweight check)
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      await dispatch(getSubscriptionStatus()).unwrap()
    } catch (error) {
      console.error('Failed to fetch subscription status:', error)
    }
  }, [dispatch])

  // Fetch full subscription details
  const fetchSubscription = useCallback(async () => {
    try {
      await dispatch(getMySubscription()).unwrap()
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }, [dispatch])

  // Fetch subscription stats (admin only)
  const fetchSubscriptionStats = useCallback(async () => {
    try {
      await dispatch(getSubscriptionStats()).unwrap()
    } catch (error) {
      console.error('Failed to fetch subscription stats:', error)
    }
  }, [dispatch])

  // Clear subscription data
  const clearSubscriptionData = useCallback(() => {
    dispatch(clearSubscription())
  }, [dispatch])

  // Update transcription count locally
  const incrementTranscriptionCount = useCallback(() => {
    if (status) {
      dispatch(updateTranscriptionCount(status.transcriptionCount + 1))
    }
  }, [dispatch, status])

  // Check if user needs upgrade
  const needsUpgrade = useCallback(() => {
    if (!status) return false
    return !status.isPaidSubscriber && status.transcriptionCount >= 1
  }, [status])

  // Check if user can transcribe
  const canTranscribe = useCallback(() => {
    if (!status) return false
    return status.isPaidSubscriber || status.transcriptionCount < 1
  }, [status])

  // Get upgrade URL
  const getUpgradeUrl = useCallback(() => {
    return status?.upgradeUrl || '/pricing'
  }, [status])

  // Handle subscription limit reached
  const handleLimitReached = useCallback(() => {
    if (needsUpgrade()) {
      toast({
        title: "Subscription Required",
        description: "You have reached the limit for free transcriptions. Please upgrade to continue.",
        variant: "destructive",
        action: {
          label: "Upgrade Now",
          onClick: () => {
            window.location.href = getUpgradeUrl()
          }
        }
      })
    }
  }, [needsUpgrade, getUpgradeUrl])

  // Auto-fetch subscription status on mount and when stale
  useEffect(() => {
    if (isStale) {
      fetchSubscriptionStatus()
    }
  }, [isStale, fetchSubscriptionStatus])

  // Handle 402 Payment Required responses
  const handlePaymentRequired = useCallback((response: any) => {
    if (response?.data?.needsUpgrade) {
      dispatch(setSubscriptionStatus({
        isPaidSubscriber: false,
        transcriptionCount: response.data.transcriptionCount || 0,
        needsUpgrade: true,
        upgradeUrl: response.data.upgradeUrl || '/pricing',
        message: response.data.message
      }))
      
      toast({
        title: "Subscription Required",
        description: response.data.message || "Please upgrade to continue using this feature.",
        variant: "destructive",
        action: {
          label: "Upgrade Now",
          onClick: () => {
            window.location.href = response.data.upgradeUrl || '/pricing'
          }
        }
      })
    }
  }, [dispatch])

  return {
    // State
    subscription,
    status,
    stats,
    isLoading,
    error,
    lastChecked,
    isStale,

    // Computed values
    isPaidSubscriber: status?.isPaidSubscriber || false,
    transcriptionCount: status?.transcriptionCount || 0,
    needsUpgrade: needsUpgrade(),
    canTranscribe: canTranscribe(),
    upgradeUrl: getUpgradeUrl(),

    // Actions
    fetchSubscriptionStatus,
    fetchSubscription,
    fetchSubscriptionStats,
    clearSubscriptionData,
    incrementTranscriptionCount,
    handleLimitReached,
    handlePaymentRequired,
  }
}
