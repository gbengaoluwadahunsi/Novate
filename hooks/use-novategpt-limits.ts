"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSubscription } from './use-subscription'
import { apiClient } from '@/lib/api-client'

export interface NovateGPTQueryLimitInfo {
  queriesUsed: number
  queriesLimit: number
  remainingQueries: number
  resetDate?: Date
  subscriptionType: 'PAID' | 'FREE_TRIAL' | 'ADMIN_UNLIMITED' | 'NONE'
  canMakeQuery: boolean
  needsUpgrade: boolean
}

export function useNovateGPTLimits() {
  const { status, isLoading } = useSubscription()
  const [queryLimitInfo, setQueryLimitInfo] = useState<NovateGPTQueryLimitInfo | null>(null)
  const [isCheckingLimits, setIsCheckingLimits] = useState(false)

  // Get query limits based on subscription status
  const getQueryLimits = useCallback((subscriptionStatus: any): { limit: number; subscriptionType: string } => {
    if (subscriptionStatus?.isAdminUnlimitedSubscriber) {
      return { limit: Infinity, subscriptionType: 'ADMIN_UNLIMITED' }
    }
    
    if (subscriptionStatus?.isPaidSubscriber) {
      return { limit: 1000, subscriptionType: 'PAID' } // 1000 queries per month for paid users
    }
    
    if (subscriptionStatus?.isFreeSubscriber) {
      return { limit: 5, subscriptionType: 'FREE_TRIAL' } // 5 queries for free trial users
    }
    
    return { limit: 3, subscriptionType: 'NONE' } // 3 queries for non-subscribers
  }, [])

  // Check current query limits
  const checkQueryLimits = useCallback(async () => {
    if (!status || isLoading) return

    setIsCheckingLimits(true)
    try {
      // For now, we'll use the subscription status to determine limits
      // In the future, this could make an API call to get real-time usage
      const { limit, subscriptionType } = getQueryLimits(status)
      
      // For unlimited users, always allow
      if (limit === Infinity) {
        setQueryLimitInfo({
          queriesUsed: 0,
          queriesLimit: Infinity,
          remainingQueries: Infinity,
          subscriptionType: subscriptionType as any,
          canMakeQuery: true,
          needsUpgrade: false
        })
        return
      }

      // Calculate reset date (first day of next month)
      const resetDate = new Date()
      resetDate.setMonth(resetDate.getMonth() + 1)
      resetDate.setDate(1)
      resetDate.setHours(0, 0, 0, 0)

      // For now, we'll use a placeholder for queries used
      // This should be replaced with actual API call to get current usage
      const queriesUsed = status.novateGPTQueriesUsed || 0
      const remainingQueries = Math.max(0, limit - queriesUsed)
      const canMakeQuery = remainingQueries > 0
      const needsUpgrade = !canMakeQuery && subscriptionType !== 'PAID'

      setQueryLimitInfo({
        queriesUsed,
        queriesLimit: limit,
        remainingQueries,
        resetDate,
        subscriptionType: subscriptionType as any,
        canMakeQuery,
        needsUpgrade
      })

    } catch (error) {
      console.error('Error checking NovateGPT query limits:', error)
    } finally {
      setIsCheckingLimits(false)
    }
  }, [status, isLoading, getQueryLimits])

  // Update query limit info after a successful query
  const updateAfterQuery = useCallback((newLimitInfo: any) => {
    if (newLimitInfo) {
      setQueryLimitInfo({
        queriesUsed: newLimitInfo.queriesUsed,
        queriesLimit: newLimitInfo.queriesLimit,
        remainingQueries: newLimitInfo.remainingQueries,
        resetDate: newLimitInfo.resetDate ? new Date(newLimitInfo.resetDate) : undefined,
        subscriptionType: newLimitInfo.subscriptionType,
        canMakeQuery: newLimitInfo.remainingQueries > 0,
        needsUpgrade: newLimitInfo.remainingQueries === 0 && newLimitInfo.subscriptionType !== 'PAID'
      })
    }
  }, [])

  // Check limits when subscription status changes
  useEffect(() => {
    if (status && !isLoading) {
      checkQueryLimits()
    }
  }, [status, isLoading, checkQueryLimits])

  return {
    queryLimitInfo,
    isCheckingLimits,
    checkQueryLimits,
    updateAfterQuery,
    isLoading: isLoading || isCheckingLimits
  }
}

