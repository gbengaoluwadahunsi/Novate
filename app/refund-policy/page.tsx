"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Refund Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600">
              Last Updated: September 2025
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  NovateScribe Refund Policy
                </h2>
                <p className="text-gray-700 mb-4">
                  Last Updated: September 2025
                </p>
                <p className="text-gray-700">
                  This Refund Policy explains how subscription payments, cancellations, and refunds are handled for NovateScribe. By purchasing a subscription, you agree to the terms outlined below.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Subscription Plans and Billing
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Available Plans:</strong> Monthly, semi-annual (6-month), and annual subscriptions. This section aligns with the Terms and Conditions (Section 4) for consistency.</li>
                  <li><strong>Billing:</strong> All subscriptions are billed in advance for the full term selected.</li>
                  <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew at the end of each billing cycle unless canceled in advance.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Cancellation
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>How to Cancel:</strong> You may cancel your subscription at any time through your account settings or by contacting support.</li>
                  <li><strong>Effect of Cancellation:</strong> Cancellation stops future billing but does not trigger a refund for the current billing cycle.</li>
                  <li><strong>Access After Cancellation:</strong> You will retain access until the end of your paid period.</li>
                  <li><strong>No Prorated Refunds:</strong> We do not issue partial or prorated refunds for unused time.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Refunds
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>All Sales Final:</strong> Subscription fees are non-refundable once charged, except as required by law.</li>
                  <li><strong>Nothing in this Refund Policy limits your rights under applicable mandatory consumer protection laws in your jurisdiction.</strong></li>
                  <li><strong>Legal Requirements:</strong> If applicable consumer protection laws grant you a right to cancel or receive a refund, we will honor those rights.</li>
                  <li><strong>Service Availability:</strong> In the unlikely event of a prolonged, system-wide service failure that prevents access, we may, at our discretion, offer credits or an extension of your subscription. Cash refunds will not be provided unless legally required.</li>
                  <li><strong>Exclusions:</strong> Refunds are not provided for:</li>
                </ul>
                <ul className="list-disc pl-12 text-gray-700 space-y-1 mt-2">
                  <li>Change of mind or mistaken purchase,</li>
                  <li>Dissatisfaction with AI outputs,</li>
                  <li>User error, such as failing to cancel before renewal.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Uniform Policy
                </h3>
                <p className="text-gray-700">
                  This Refund Policy applies equally to all subscribers — including patients, medical students, doctors, clinics, and hospitals. No exceptions are made based on user type.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Contact
                </h3>
                <p className="text-gray-700 mb-3">
                  If you believe you are eligible for a refund under the limited conditions described above, please contact:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900">NovateScribe Support</p>
                  <p className="text-gray-700">Email: novatescribe@mynovateai.com</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Changes to This Policy
                </h3>
                <p className="text-gray-700">
                  This Refund Policy, together with the Terms and Conditions and Privacy Policy, forms part of the Agreement. Updates will be posted on our website, and continued use constitutes acceptance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Link href="/terms-of-service">
            <Button variant="outline">Terms of Service</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact Us</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
