"use client";

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { SubscriptionPlan, isStripeResponse, isCurlecResponse, PaymentGatewayInfo } from '@/types/payment';

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

  // Fetch subscription plans
  const fetchPlans = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.getSubscriptionPlans();
      
      if (response.success && response.data) {
        console.log('🔍 Fetched plans:', response.data);
        console.log('🌍 First plan currency:', response.data[0]?.currency);
        setState(prev => ({
          ...prev,
          plans: response.data!,
          loading: false,
        }));
      } else {
        console.error('❌ Failed to fetch plans:', response.error);
        throw new Error(response.error || 'Failed to fetch subscription plans');
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
      // For now, we'll skip this since the API client doesn't have a direct method
      // In production, you would add this method to the API client
      console.log('Payment info fetch not implemented yet');
    } catch (error) {
      console.log('Payment info not available (user may not be authenticated)');
    }
  };

  // Handle Curlec/Razorpay payment
  const handleCurlecPayment = (orderData: { orderId: string; amount: number; currency: string }, userInfo: UserInfo) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay checkout script not loaded'));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_CURLEC_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NovateScribe",
        description: "Subscription Payment",
        order_id: orderData.orderId,
        handler: function (response: any) {
          console.log('Payment successful:', response.razorpay_payment_id);
          toast({
            title: "Payment Successful",
            description: "Your subscription will be activated shortly.",
          });
          // Redirect to success page
          window.location.href = '/payment/success';
          resolve();
        },
        prefill: {
          name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
          email: userInfo.email,
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function() {
            reject(new Error('Payment was cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Subscribe to a plan
  const subscribe = async (planId: string, userInfo: UserInfo) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.subscribe(planId);
      
      if (response.success && response.data) {
        const subscriptionData = response.data;
        
        // Check if this is a Stripe response (international users)
        if (isStripeResponse(subscriptionData)) {
          console.log('🔄 Redirecting to Stripe checkout:', subscriptionData.url);
          // Redirect to Stripe checkout
          if (subscriptionData.url) {
            window.location.href = subscriptionData.url;
            return;
          } else {
            throw new Error('Stripe checkout URL is missing');
          }
        }
        
        // Check if this is a Curlec/Razorpay response (Malaysian users)
        if (isCurlecResponse(subscriptionData)) {
          console.log('🔄 Initializing Curlec payment:', subscriptionData);
          // Handle Curlec payment modal
          await handleCurlecPayment(subscriptionData, userInfo);
          return;
        }
        
        // Unexpected response format
        console.error('❌ Unexpected response format:', subscriptionData);
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
