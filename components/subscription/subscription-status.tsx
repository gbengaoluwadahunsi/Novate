"use client"

import { useSubscription } from "@/hooks/use-subscription"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Crown, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  TrendingUp,
  Zap
} from "lucide-react"
import { format } from "date-fns"

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean
  compact?: boolean
  className?: string
}

export default function SubscriptionStatus({ 
  showUpgradeButton = true, 
  compact = false,
  className = ""
}: SubscriptionStatusProps) {
  const router = useRouter()
  const { 
    subscription, 
    status, 
    isPaidSubscriber, 
    transcriptionCount, 
    needsUpgrade,
    isLoading 
  } = useSubscription()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  const remainingTranscriptions = Math.max(0, 1 - transcriptionCount)
  const transcriptionProgress = (transcriptionCount / 1) * 100

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isPaidSubscriber ? (
          <>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            {subscription?.plan && (
              <span className="text-sm text-muted-foreground">
                {subscription.plan.name}
              </span>
            )}
          </>
        ) : (
          <>
            <Badge variant="outline" className="border-amber-200 text-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              Free
            </Badge>
            <span className="text-sm text-muted-foreground">
              {remainingTranscriptions} remaining
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isPaidSubscriber ? (
              <>
                <Crown className="w-5 h-5 text-green-600" />
                Premium Subscription
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-amber-600" />
                Free Plan
              </>
            )}
          </CardTitle>
          <Badge 
            variant={isPaidSubscriber ? "secondary" : "outline"}
            className={isPaidSubscriber ? "bg-green-100 text-green-800" : "border-amber-200 text-amber-800"}
          >
            {isPaidSubscriber ? "Active" : "Limited"}
          </Badge>
        </div>
        <CardDescription>
          {isPaidSubscriber 
            ? "Unlimited access to all features"
            : "Limited transcription allowance"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPaidSubscriber ? (
          // Premium user content
          <div className="space-y-4">
            {subscription && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{subscription.plan?.name || 'Premium'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium">
                    {subscription.billingInterval === 'MONTHLY' ? 'Monthly' :
                     subscription.billingInterval === 'SIX_MONTHS' ? '6 Months' :
                     subscription.billingInterval === 'YEARLY' ? 'Yearly' : 
                     subscription.billingInterval}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing</span>
                  <span className="font-medium">
                    {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-1">
                  <div className="font-medium">Unlimited Transcriptions</div>
                  <div className="text-sm">Access to all premium features</div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/organization/billing')}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>
        ) : (
          // Free user content
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transcriptions Used</span>
                <span className="font-medium">{transcriptionCount}/1</span>
              </div>
              <Progress 
                value={transcriptionProgress} 
                className="h-2"
              />
            </div>

            {needsUpgrade ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-1">
                    <div className="font-medium">Limit Reached</div>
                    <div className="text-sm">Upgrade to continue transcribing</div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-1">
                    <div className="font-medium">{remainingTranscriptions} Transcription{remainingTranscriptions !== 1 ? 's' : ''} Remaining</div>
                    <div className="text-sm">Upgrade for unlimited access</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {showUpgradeButton && (
              <Button 
                onClick={() => router.push('/pricing')}
                className="w-full"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
