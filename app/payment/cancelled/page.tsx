"use client";

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-xl">
        <CardHeader className="pb-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Your payment was not processed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 font-medium mb-2">
              No charges were made
            </p>
            <p className="text-orange-700 text-sm">
              You can try again anytime. Your cart and plan selection are still available.
            </p>
          </div>

          <div className="text-left space-y-3 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800">Why might this happen?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                You clicked the back button or closed the payment window
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Payment session timed out
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Technical issue with the payment processor
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/pricing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Payment Again
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                Continue with Free Plan
              </Link>
            </Button>
            
            <Button variant="ghost" asChild className="w-full">
              <Link href="/dashboard/support">
                Contact Support
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Need help? Our support team is available 24/7 to assist you with any payment issues.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
