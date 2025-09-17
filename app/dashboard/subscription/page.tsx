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
  ArrowLeft,
  User
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

  // Determine subscription type
  const isFreeSubscriber = status?.isFreeSubscriber || false
  const isAdminUnlimited = status?.isAdminUnlimitedSubscriber || false
  const hasActiveSubscription = status?.hasActiveSubscription || false

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
          {!isPaidSubscriber && !isAdminUnlimited && (
            <Button 
              onClick={() => router.push('/pricing')}
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              {isFreeSubscriber ? 'Upgrade Trial' : 'Upgrade Now'}
            </Button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Status & Usage */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription Status */}
            <SubscriptionDashboard />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isPaidSubscriber && subscription ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard/organization/billing')}
                      className="w-full justify-start"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/contact')}
                      className="w-full justify-start"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/contact')}
                    className="w-full justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Sales
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    {user?.createdAt ? (() => {
                      try {
                        const date = new Date(user.createdAt);
                        return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM yyyy');
                      } catch {
                        return 'N/A';
                      }
                    })() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage This Month</span>
                  <span className="text-sm font-medium">
                    {isPaidSubscriber ? '∞' : `${transcriptionCount}/1`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
