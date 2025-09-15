"use client";

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SubscriptionPlan, isStripeResponse, isCurlecResponse, PaymentGatewayInfo } from '@/types/payment';
import { createCurlecPayment } from '@/lib/razorpay-loader';

interface PaymentState {
  plans: SubscriptionPlan[];
  paymentInfo: PaymentGatewayInfo | null;
  loading: boolean;
  error: string | null;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email: string;
}

export function usePayment() {
  const [state, setState] = useState<PaymentState>({
    plans: [],
    paymentInfo: null,
    loading: false,
    error: null,
  });

  // Preload Razorpay script if Curlec is detected
  useEffect(() => {
    if (state.paymentInfo?.paymentGateway === 'CURLEC') {
      import('@/lib/razorpay-loader').then(({ loadRazorpayScript }) => {
        loadRazorpayScript().catch(() => {});
      });
    }
  }, [state.paymentInfo]);

  // Fetch subscription plans
  const fetchPlans = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use the new dynamic payment endpoint
      const response = await apiClient.request('/api/payment/plans', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          plans: response.data!,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to fetch plans',
          loading: false,
        }));
        toast({
          title: "Error",
          description: response.error || 'Failed to fetch plans',
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plans';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Fetch payment gateway info
  const fetchPaymentInfo = async () => {
    try {
      const response = await apiClient.request('/api/payment/info', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          paymentInfo: response.data!,
        }));
      }
    } catch (error) {
      // Payment info not available - this is optional
    }
  };

  // Handle Curlec/Razorpay payment using the new utility
  const handleCurlecPayment = async (orderData: { orderId: string; amount: number; currency: string; keyId: string }, userInfo: UserInfo) => {
    return new Promise<void>((resolve, reject) => {
      createCurlecPayment(
        orderData,
        userInfo,
        () => {
          // Success handler
          toast({
            title: "Payment Successful",
            description: "Your subscription will be activated shortly.",
          });
          // Redirect to success page
          window.location.href = '/payment/success';
          resolve();
        },
        (error) => {
          // Error handler
          reject(error);
        }
      );
    });
  };

  // Subscribe to a plan using dynamic payment gateway
  const subscribe = async (planId: string, userInfo: UserInfo) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use the new dynamic payment endpoint that auto-routes to correct gateway
      const response = await apiClient.request('/api/payment/subscribe', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      
      if (response.success && response.data) {
        const paymentData = response.data;
        
        // Check if this is a Stripe response (international users)
        if (isStripeResponse(paymentData)) {
          // Redirect to Stripe checkout
          if (paymentData.url) {
            window.location.href = paymentData.url;
            return;
          } else {
            throw new Error('Stripe checkout URL is missing');
          }
        }
        
        // Check if this is a Curlec/Razorpay response (Malaysian users)
        if (isCurlecResponse(paymentData)) {
          // Handle Curlec payment modal
          await handleCurlecPayment(paymentData, userInfo);
          return;
        }
        
        // Unexpected response format
        throw new Error('Unexpected payment response format');
      } else {
        throw new Error(response.error || 'Failed to initiate subscription');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process subscription';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    plans: state.plans,
    paymentInfo: state.paymentInfo,
    loading: state.loading,
    error: state.error,
    fetchPlans,
    fetchPaymentInfo,
    subscribe,
  };
}
