"use client"

import { useEffect } from "react"
import { useSubscription } from "@/hooks/use-subscription"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Crown, 
  CheckCircle, 
  Clock, 
  Calendar,
  CreditCard,
  TrendingUp,
  Zap,
  AlertTriangle,
  Settings,
  Download,
  Mail
} from "lucide-react"
import { format } from "date-fns"
import SubscriptionStatus from "./subscription-status"

export default function SubscriptionDashboard() {
  const router = useRouter()
  const { 
    subscription, 
    status, 
    stats,
    isPaidSubscriber, 
    transcriptionCount, 
    needsUpgrade,
    isLoading,
    fetchSubscription,
    fetchSubscriptionStats
  } = useSubscription()

  // Determine subscription type
  const isFreeSubscriber = status?.isFreeSubscriber || false
  const isAdminUnlimited = status?.isAdminUnlimitedSubscriber || false
  const hasActiveSubscription = status?.hasActiveSubscription || false

  useEffect(() => {
    fetchSubscription()
    // Only fetch stats if user might be admin (you can add role check here)
    // fetchSubscriptionStats()
  }, [fetchSubscription])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <SubscriptionStatus />

      {/* Subscription Details */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Subscription Details
            </CardTitle>
            <CardDescription>
              Your current subscription information and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge 
                    variant={subscription.status === 'ACTIVE' ? 'secondary' : 'outline'}
                    className={subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium">
                    {subscription.plan?.name || 'Premium Plan'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Billing Cycle</span>
                  <span className="text-sm font-medium">
                    {subscription.billingInterval === 'MONTHLY' ? 'Monthly' :
                     subscription.billingInterval === 'SIX_MONTHS' ? '6 Months' :
                     subscription.billingInterval === 'YEARLY' ? 'Yearly' : 
                     subscription.billingInterval}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <span className="text-sm font-medium">
                    {subscription.startDate ? (() => {
                      try {
                        const date = new Date(subscription.startDate);
                        return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
                      } catch {
                        return 'N/A';
                      }
                    })() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Billing</span>
                  <span className="text-sm font-medium">
                    {subscription.endDate ? (() => {
                      try {
                        const date = new Date(subscription.endDate);
                        return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
                      } catch {
                        return 'N/A';
                      }
                    })() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-sm font-medium">
                    {subscription.plan?.currency} {
                      subscription.billingInterval === 'MONTHLY' ? subscription.plan?.price :
                      subscription.billingInterval === 'SIX_MONTHS' ? 30 : // RM30/month for 6-month (Malaysian users)
                      subscription.billingInterval === 'YEARLY' ? 25 : // RM25/month for annual (Malaysian users)
                      subscription.plan?.price
                    }/{
                      subscription.billingInterval === 'MONTHLY' ? 'month' :
                      subscription.billingInterval === 'SIX_MONTHS' ? '6months' :
                      subscription.billingInterval === 'YEARLY' ? '12months' : 'period'
                    }
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/organization/billing')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/contact')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Statistics
          </CardTitle>
          <CardDescription>
            Your transcription usage and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {isPaidSubscriber ? '∞' : transcriptionCount}
              </div>
              <div className="text-sm text-muted-foreground">Transcriptions</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isPaidSubscriber ? 'Unlimited' : 'This month'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {isPaidSubscriber ? '∞' : Math.max(0, 1 - transcriptionCount)}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isPaidSubscriber ? 'Unlimited' : 'Free allowance'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {subscription ? 'Active' : 'Free'}
              </div>
              <div className="text-sm text-muted-foreground">Plan Status</div>
              <div className="text-xs text-muted-foreground mt-1">
                {subscription?.status || 'Trial'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
