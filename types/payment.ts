export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'MONTHLY' | 'YEARLY';
  features: string[];
  stripePriceId?: string;
  curlecPlanId?: string;
  isPopular?: boolean;
  maxUsers?: number;
  maxStorage?: number;
  maxApiCalls?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionResponse {
  id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  planId: string;
  userId: string;
  organizationId?: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeRequest {
  planId: string;
  paymentMethod: 'stripe' | 'curlec' | 'razorpay';
  userId: string;
  organizationId?: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

// Updated to match backend guide format
export interface StripeResponse {
  sessionId: string;
  url: string;
}

export interface CurlecResponse {
  orderId: string;
  currency: string;
  amount: number;
  keyId: string; // Razorpay key ID provided by backend
}

// Payment gateway info from backend
export interface PaymentGatewayInfo {
  country: string;
  paymentGateway: 'STRIPE' | 'CURLEC';
  gatewayName: string;
  supportedMethods: string[];
  currency: string;
  message: string;
}

export function isStripeResponse(response: any): response is StripeResponse {
  return response && typeof response.sessionId === 'string' && typeof response.url === 'string';
}

export function isCurlecResponse(response: any): response is CurlecResponse {
  return response && typeof response.orderId === 'string' && typeof response.amount === 'number';
}
