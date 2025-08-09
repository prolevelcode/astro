declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
      resolve(!!window.Razorpay);
    };
    
    script.onerror = () => {
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

interface RazorpayPaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  description: string;
  customerName: string;
  customerEmail: string;
}

interface RazorpayPaymentResult {
  success: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const initiateRazorpayPayment = (options: RazorpayPaymentOptions): Promise<RazorpayPaymentResult> => {
  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
      },
      theme: {
        color: '#6366f1', // Purple theme color
      },
      handler: (response: any) => {
        resolve({
          success: true,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
  });
};
