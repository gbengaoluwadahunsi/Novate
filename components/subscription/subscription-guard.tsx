"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useSubscription } from "@/hooks/use-subscription"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SubscriptionGuardProps {
  children: React.ReactNode
  requirePaidSubscription?: boolean
  allowFreeTranscriptions?: boolean
  showUpgradePrompt?: boolean
  redirectTo?: string
}

export default function SubscriptionGuard({ 
  children, 
  requirePaidSubscription = false,
  allowFreeTranscriptions = true,
  showUpgradePrompt = true,
  redirectTo = '/pricing'
}: SubscriptionGuardProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { 
    status, 
    isLoading, 
    isPaidSubscriber, 
    transcriptionCount, 
    needsUpgrade, 
    canTranscribe,
    fetchSubscriptionStatus 
  } = useSubscription()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated && !isLoading) {
      fetchSubscriptionStatus()
    }
  }, [mounted, isAuthenticated, isLoading, fetchSubscriptionStatus])

  // Show loading while checking subscription
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, let ProtectedRoute handle it
  if (!isAuthenticated || !user) {
    return <>{children}</>
  }

  // Check if user needs paid subscription
  if (requirePaidSubscription && !isPaidSubscriber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Premium Feature</CardTitle>
            <CardDescription>
              This feature requires a paid subscription to access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                <Lock className="w-3 h-3 mr-1" />
                Subscription Required
              </Badge>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock this premium feature and many more.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => router.push(redirectTo)} 
                className="w-full"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Pricing Plans
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check transcription limits for free users
  if (allowFreeTranscriptions && !isPaidSubscriber && needsUpgrade) {
    if (showUpgradePrompt) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Transcription Limit Reached</CardTitle>
              <CardDescription>
                You have used your free transcription allowance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have completed <strong>{transcriptionCount}</strong> transcription{transcriptionCount !== 1 ? 's' : ''}. 
                  Upgrade to continue with unlimited transcriptions.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push(redirectTo)} 
                  className="w-full"
                  size="lg"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    } else {
      // Just show a toast and redirect
      toast({
        title: "Subscription Required",
        description: "You have reached the limit for free transcriptions. Please upgrade to continue.",
        variant: "destructive",
        action: {
          label: "Upgrade Now",
          onClick: () => router.push(redirectTo)
        }
      })
      router.push(redirectTo)
      return null
    }
  }

  // Show subscription status banner for free users
  if (!isPaidSubscriber && allowFreeTranscriptions && status) {
    const remainingTranscriptions = Math.max(0, 1 - transcriptionCount)
    
    return (
      <div className="space-y-4">
        {/* Subscription Status Banner */}
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span>
                Free Plan: <strong>{remainingTranscriptions}</strong> transcription{remainingTranscriptions !== 1 ? 's' : ''} remaining
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push(redirectTo)}
                className="ml-4"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        
        {children}
      </div>
    )
  }

  // Show premium status banner for paid users
  if (isPaidSubscriber && status) {
    return (
      <div className="space-y-4">
        {/* Premium Status Banner */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>
                Premium Plan: Unlimited transcriptions
                {status.subscription?.plan && (
                  <span className="ml-2 text-sm">
                    ({status.subscription.plan.name})
                  </span>
                )}
              </span>
              <Badge variant="secondary" className="ml-4">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
        
        {children}
      </div>
    )
  }

  // Default: render children
  return <>{children}</>
}
