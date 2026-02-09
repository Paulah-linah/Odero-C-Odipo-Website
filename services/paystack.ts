type PaystackInlineResponse = {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  transaction?: string;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, any>) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-paystack="inline"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.dataset.paystack = 'inline';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

export const startPaystackCheckout = async (params: {
  email: string;
  amountKes: number;
  reference: string;
  channels: Array<'card' | 'mobile_money'>;
  metadata?: Record<string, any>;
}): Promise<PaystackInlineResponse> => {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error('Missing VITE_PAYSTACK_PUBLIC_KEY');
  }

  await loadPaystackScript();

  if (!window.PaystackPop) {
    throw new Error('Paystack script not available');
  }

  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop!.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: params.email,
      amount: Math.round(params.amountKes * 100),
      reference: params.reference,
      channels: params.channels,
      currency: 'KES',
      metadata: params.metadata || {},
      callback: (response: PaystackInlineResponse) => resolve(response),
      onClose: () => reject(new Error('Payment cancelled')),
    });

    handler.openIframe();
  });
};
