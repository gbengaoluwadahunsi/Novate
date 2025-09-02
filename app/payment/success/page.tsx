"use client";

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccess() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-xl">
        <CardHeader className="pb-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Thank you for subscribing to NovateScribe
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">
              🎉 Welcome to NovateScribe Premium!
            </p>
            <p className="text-green-700 text-sm">
              Your subscription will be activated within the next few minutes. 
              You'll receive a confirmation email shortly.
            </p>
          </div>

          <div className="text-left space-y-3 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Check your email for the invoice and receipt
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Access your dashboard to start using premium features
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Contact support if you need any assistance
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
                              <Link href="/contact">
                  Contact Support
                </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            If you don't see your subscription active within 10 minutes, 
            please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
