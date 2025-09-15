"use client"

// Razorpay script loader utility
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.head.appendChild(script);
  });
};

// Declare Razorpay types for TypeScript
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    backdropclose?: boolean;
    escape?: boolean;
  };
  notes?: {
    [key: string]: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
}

// Enhanced Curlec payment handler
export const createCurlecPayment = async (
  orderData: { orderId: string; amount: number; currency: string; keyId: string },
  userInfo: { firstName?: string; lastName?: string; email: string },
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    // Load Razorpay script if not already loaded
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error('Razorpay not available');
    }

    const options: RazorpayOptions = {
      key: orderData.keyId, // Key ID provided by backend
      amount: orderData.amount,
      currency: orderData.currency,
      name: "NovateScribe",
      description: "Subscription Payment",
      order_id: orderData.orderId,
      handler: function (response: RazorpayResponse) {
        onSuccess?.();
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
          const error = new Error('Payment was cancelled by user');
          onError?.(error);
        },
        backdropclose: false,
        escape: false,
      },
      notes: {
        source: 'novatescribe_web',
        plan_id: orderData.orderId,
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Payment initialization failed'));
  }
};
