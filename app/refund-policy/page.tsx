"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CreditCard, Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Refund Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last Updated: September 2025
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
              <RefreshCw className="w-6 h-6" />
              30-Day Money-Back Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              We stand behind the quality of NovateScribe. If you're not completely satisfied with our service within the first 30 days of your subscription, 
              we offer a full refund, no questions asked.
            </p>
          </CardContent>
        </Card>

        {/* Refund Eligibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">1. Refund Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">Eligible for Refund</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>New subscribers within their first 30 days</li>
              <li>First-time users who haven't used the service extensively</li>
              <li>Technical issues that prevent service usage</li>
              <li>Service not meeting advertised specifications</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Not Eligible for Refund</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions older than 30 days</li>
              <li>Extensive usage of the service (over 50 transcriptions)</li>
              <li>Violation of Terms of Service</li>
              <li>Fraudulent or abusive behavior</li>
              <li>Enterprise/Organization accounts (custom terms apply)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">2. How to Request a Refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">Step-by-Step Process</h3>
            <ol className="list-decimal pl-6 space-y-2">
                              <li><strong>Contact Support:</strong> Email us at <a href="mailto:novatescribe@mynovateai.com" className="text-blue-600 underline">novatescribe@mynovateai.com</a> or <a href="/contact" className="text-blue-600 underline">use our contact form</a></li>
              <li><strong>Provide Details:</strong> Include your account email and reason for refund</li>
              <li><strong>Review Process:</strong> Our team will review your request within 2 business days</li>
              <li><strong>Refund Processing:</strong> If approved, refund will be processed within 5-10 business days</li>
            </ol>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Required Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account email address</li>
              <li>Subscription plan details</li>
              <li>Date of subscription</li>
              <li>Reason for refund request</li>
              <li>Any relevant screenshots or error messages</li>
            </ul>
          </CardContent>
        </Card>

        {/* Refund Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              3. Refund Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2 Days</div>
                <div className="text-sm text-gray-600">Review Period</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">5-10 Days</div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1-3 Days</div>
                <div className="text-sm text-gray-600">Bank Processing</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> Actual refund time may vary depending on your bank or payment provider. 
              International payments may take longer to process.
            </p>
          </CardContent>
        </Card>

        {/* Payment Method Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              4. Refund Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">Stripe (International Users)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are processed back to the original payment method</li>
              <li>Credit card refunds appear within 5-10 business days</li>
              <li>You'll receive an email confirmation when refund is processed</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Curlec/Razorpay (Malaysian Users)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are processed back to the original payment method</li>
              <li>Bank transfer refunds may take 3-5 business days</li>
              <li>You'll receive SMS/email confirmation from Curlec</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Other Payment Methods</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>PayPal: Refunds processed within 24-48 hours</li>
              <li>Bank transfers: 3-7 business days</li>
              <li>Digital wallets: Varies by provider</li>
            </ul>
          </CardContent>
        </Card>

        {/* Partial Refunds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">5. Partial Refunds & Proration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">When Partial Refunds Apply</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service downgrades during billing cycle</li>
              <li>Technical issues affecting partial service</li>
              <li>Disputed charges or billing errors</li>
              <li>Enterprise account adjustments</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Proration Calculation</h3>
            <p>
              Partial refunds are calculated based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Unused portion of your subscription period</li>
              <li>Actual service usage during the period</li>
              <li>Any applicable fees or charges</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cancellation vs Refund */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">6. Cancellation vs. Refund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Cancellation</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Stop future billing</li>
                  <li>• Keep access until period ends</li>
                  <li>• No refund of current period</li>
                  <li>• Can reactivate anytime</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Refund</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Immediate service termination</li>
                  <li>• Full or partial money back</li>
                  <li>• Account deactivation</li>
                  <li>• Requires new subscription</li>
                </ul>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> You can cancel your subscription at any time without requesting a refund. 
              Cancellation stops future billing but doesn't provide a refund for the current period.
            </p>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">7. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">If You Disagree with Our Decision</h3>
            <p>
              If we deny your refund request and you believe it's unfair, you can:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Request Review:</strong> Ask for a second review by our management team</li>
              <li><strong>Provide Evidence:</strong> Submit additional documentation or screenshots</li>
              <li><strong>Escalate:</strong> Contact our customer success manager</li>
              <li><strong>External Options:</strong> Contact your payment provider or consumer protection agency</li>
            </ol>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Our Commitment</h3>
            <p>
              We're committed to fair and transparent refund practices. If you have a legitimate complaint, 
              we will work with you to find a satisfactory resolution.
            </p>
          </CardContent>
        </Card>

        {/* Exceptions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">8. Exceptions & Special Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">Enterprise Accounts</h3>
            <p>
              Enterprise and organization accounts are subject to custom terms and conditions. 
              Refund policies for these accounts are outlined in their specific service agreements.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Promotional Offers</h3>
            <p>
              Free trials and promotional subscriptions may have different refund terms. 
              Check the specific offer details for applicable policies.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6">Force Majeure</h3>
            <p>
              In cases of force majeure (natural disasters, government actions, etc.), 
              refund policies may be adjusted to ensure fair treatment for all parties.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Need Help with Refunds?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Our support team is here to help with any refund-related questions:
            </p>
            <div className="space-y-2 text-blue-700">
              <p><strong>Refund Requests:</strong> <a href="mailto:novatescribe@mynovateai.com" className="underline hover:text-blue-900">novatescribe@mynovateai.com</a></p>
              <p><strong>General Support:</strong> <a href="mailto:novatescribe@mynovateai.com" className="underline hover:text-blue-900">novatescribe@mynovateai.com</a></p>
              <p><strong>Website:</strong> <a href="https://www.novatescribe.com/" className="underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">https://www.novatescribe.com/</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          <Link href="/terms-of-service">
            <Button variant="outline">Terms of Service</Button>
          </Link>
          <Link href="/privacy-policy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
