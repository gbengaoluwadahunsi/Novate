"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Crown, 
  Zap, 
  CheckCircle, 
  X,
  ArrowRight,
  Calendar,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface QueryLimitExceededModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  queryLimitInfo: {
    queriesUsed: number
    queriesLimit: number
    remainingQueries: number
    resetDate?: Date
    subscriptionType: 'PAID' | 'FREE_TRIAL' | 'ADMIN_UNLIMITED' | 'NONE'
    needsUpgrade: boolean
  }
}

export default function QueryLimitExceededModal({
  isOpen,
  onClose,
  onUpgrade,
  queryLimitInfo
}: QueryLimitExceededModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      onUpgrade()
    } finally {
      setIsUpgrading(false)
    }
  }

  const getSubscriptionBenefits = () => {
    return [
      {
        icon: <Brain className="h-5 w-5 text-blue-600" />,
        title: "Unlimited NovateGPT Queries",
        description: "Ask unlimited medical questions without restrictions"
      },
      {
        icon: <Zap className="h-5 w-5 text-yellow-600" />,
        title: "Priority Processing",
        description: "Faster response times for all AI features"
      },
      {
        icon: <Crown className="h-5 w-5 text-purple-600" />,
        title: "Advanced Features",
        description: "Access to premium medical analysis tools"
      },
      {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        title: "24/7 Support",
        description: "Priority customer support for healthcare professionals"
      }
    ]
  }

  const formatResetDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="h-6 w-6 text-orange-500" />
                      <CardTitle className="text-xl text-orange-600">
                        Query Limit Reached
                      </CardTitle>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      You've used all {queryLimitInfo.queriesLimit} queries for this month
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Current Usage */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Usage
                    </span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {queryLimitInfo.queriesUsed}/{queryLimitInfo.queriesLimit} queries used
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '100%' }}
                    />
                  </div>
                  {queryLimitInfo.resetDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Resets on {formatResetDate(queryLimitInfo.resetDate)}
                    </p>
                  )}
                </div>

                {/* Upgrade Benefits */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Upgrade to Continue Using NovateGPT
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getSubscriptionBenefits().map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex-shrink-0 mt-0.5">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {benefit.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Upgrading...
                      </>
                    ) : (
                      <>
                        Upgrade Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your queries will reset on {queryLimitInfo.resetDate ? formatResetDate(queryLimitInfo.resetDate) : 'the first day of next month'}.
                    <br />
                    Upgrade now for unlimited access and premium features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

