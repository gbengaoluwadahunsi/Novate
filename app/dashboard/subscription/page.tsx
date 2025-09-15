"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { useSubscription } from "@/hooks/use-subscription"
import ProtectedRoute from "@/components/auth/protected-route"
import SubscriptionDashboard from "@/components/subscription/subscription-dashboard"
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
  Mail,
  ArrowLeft
} from "lucide-react"
import { format } from "date-fns"

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription()
      // Only fetch stats if user might be admin (you can add role check here)
      // fetchSubscriptionStats()
    }
  }, [isAuthenticated, fetchSubscription])

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <p className="text-muted-foreground">
                Manage your NovateScribe subscription and billing
              </p>
            </div>
          </div>
          {!isPaidSubscriber && (
            <Button 
              onClick={() => router.push('/pricing')}
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </div>

        {/* Subscription Dashboard */}
        <SubscriptionDashboard />

        {/* Additional Subscription Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
              <CardDescription>
                Your billing details and payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPaidSubscriber && subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                    <span className="text-sm font-medium">{subscription.plan?.name || 'Premium'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">
                      {subscription.plan?.currency} {subscription.plan?.price}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Billing</span>
                    <span className="text-sm font-medium">
                      {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard/organization/billing')}
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/contact')}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">No Active Subscription</h3>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to a paid plan to access billing information
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/pricing')}
                    className="w-full"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    View Pricing Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan Status</span>
                  <Badge 
                    variant={isPaidSubscriber ? "secondary" : "outline"}
                    className={isPaidSubscriber ? "bg-green-100 text-green-800" : "border-amber-200 text-amber-800"}
                  >
                    {isPaidSubscriber ? "Premium" : "Free"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Get support for your subscription and billing questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help with your subscription
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/contact')}
                >
                  Contact Us
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account preferences
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Settings
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium">Download Data</h3>
                <p className="text-sm text-muted-foreground">
                  Export your medical notes
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/notes')}
                >
                  View Notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
