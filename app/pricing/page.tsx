"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { usePayment } from '@/hooks/use-payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, CreditCard, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { plans, paymentInfo, loading, error, fetchPlans, fetchPaymentInfo, subscribe } = usePayment();
  const [subscribingToPlan, setSubscribingToPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    // Fetch payment gateway info if user is authenticated
    if (isAuthenticated) {
      fetchPaymentInfo();
    }
  }, [isAuthenticated]);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    setSubscribingToPlan(planId);
    
    try {
      await subscribe(planId, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribingToPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPopularPlan = () => {
    // Find yearly plans first, then the one with best value
    const yearlyPlans = plans.filter(plan => plan.interval === 'year' || plan.interval === 'YEARLY');
    if (yearlyPlans.length > 0) {
      return yearlyPlans[0].id; // Return first yearly plan as popular
    }
    return plans.length > 0 ? plans[0].id : null;
  };

  const planFeatures = [
    "Unlimited medical note transcription",
    "AI-powered diagnosis suggestions",
    "ICD-11 automatic coding",
    "Professional PDF export",
    "Voice recognition in multiple languages",
    "Secure patient data encryption",
    "24/7 customer support",
    "Integration with EMR systems",
  ];

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Plans</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchPlans} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your NovateScribe Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your medical documentation workflow with AI-powered transcription
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <Check className="w-4 h-4" />
            <span className="font-medium">Secure, HIPAA-compliant, and trusted by healthcare professionals</span>
          </div>
        </div>

        {/* Payment Gateway Info */}
        {paymentInfo && (
          <div className="mb-8 text-center">
            <Card className="inline-block">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 justify-center mb-2">
                  {paymentInfo.paymentGateway === 'STRIPE' ? (
                    <Globe className="w-5 h-5 text-blue-600" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-green-600" />
                  )}
                  <span className="font-medium text-gray-700">
                    Payment via {paymentInfo.gatewayName}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Currency: {paymentInfo.currency} • {paymentInfo.message}
                </p>
                {paymentInfo.supportedMethods.length > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: {paymentInfo.supportedMethods.join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const isPopular = plan.id === getPopularPlan();
            const isSubscribing = subscribingToPlan === plan.id;
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : 'shadow-lg'}`}>
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1 flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-500 ml-2">
                      / {(plan.interval === 'YEARLY' ? 'year' : plan.interval === 'MONTHLY' ? 'month' : plan.interval).toLowerCase()}
                    </span>
                  </div>
                  {(plan.interval === 'year' || plan.interval === 'YEARLY') && (
                    <Badge variant="secondary" className="mt-2">
                      Save 20% vs Monthly
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isSubscribing || loading}
                    className={`w-full mt-6 ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {isSubscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    No setup fees • Cancel anytime • Secure payment
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">How does the payment process work?</h3>
              <p className="text-gray-600 text-sm">
                We use secure payment gateways - Stripe for international payments and Curlec/Razorpay for Malaysian users. 
                Your payment information is encrypted and never stored on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time from your dashboard. 
                You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. We use enterprise-grade encryption and are fully HIPAA compliant. 
                Your medical data is encrypted both in transit and at rest.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee for new subscribers. 
                Contact our support team if you're not satisfied with the service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan?
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">
              Contact Our Sales Team
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
