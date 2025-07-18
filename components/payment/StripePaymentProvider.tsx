
'use client';

import React, { createContext, useContext, useState } from 'react';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface StripeContextType {
  isLoading: boolean;
  createPaymentIntent: (amount: number, currency: string, metadata?: Record<string, string>) => Promise<{ clientSecret: string }>;
  createSubscription: (priceId: string) => Promise<{ subscriptionId: string; clientSecret: string } | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripePayment = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripePayment must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPaymentIntent = async (amount: number, currency: string = 'eur', metadata?: Record<string, string>) => {
    if (!user) {
      throw new Error('User must be logged in to create a payment intent');
    }
    const token = await user.getIdToken();

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro no Pagamento',
        description: error.message || 'Ocorreu um erro ao processar o pagamento.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (priceId: string) => {
    if (!user) {
      throw new Error('User must be logged in to create a subscription');
    }
    const token = await user.getIdToken();
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro na Subscrição',
        description: error.message || 'Ocorreu um erro ao criar a subscrição.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StripeContext.Provider
      value={{
        isLoading,
        createPaymentIntent,
        createSubscription,
      }}
    >
      {children}
    </StripeContext.Provider>
  );
}

interface StripePaymentElementsProps {
  clientSecret: string;
  children: React.ReactNode;
}

export function StripePaymentElements({ clientSecret, children }: StripePaymentElementsProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#D4A757',
        colorBackground: '#1c1c1c',
        colorText: '#ffffff',
        colorDanger: '#ff4444',
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
