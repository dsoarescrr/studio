'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface StripeContextType {
  isLoading: boolean;
  createPaymentIntent: (amount: number, currency: string, metadata?: Record<string, string>) => Promise<{ clientSecret: string }>;
  processPayment: (paymentMethodId: string, paymentIntentId: string) => Promise<boolean>;
  createSubscription: (priceId: string) => Promise<{ subscriptionId: string; clientSecret: string } | null>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  updateSubscription: (subscriptionId: string, newPriceId: string) => Promise<boolean>;
  getCustomerPortalLink: () => Promise<string | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
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

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          metadata: {
            userId: user.uid,
            ...metadata,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
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

  const processPayment = async (paymentMethodId: string, paymentIntentId: string) => {
    if (!user) {
      throw new Error('User must be logged in to process a payment');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          paymentIntentId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      const data = await response.json();
      return data.success;
    } catch (error: any) {
      toast({
        title: 'Erro no Pagamento',
        description: error.message || 'Ocorreu um erro ao processar o pagamento.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscription = async (priceId: string) => {
    if (!user) {
      throw new Error('User must be logged in to create a subscription');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
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

  const cancelSubscription = async (subscriptionId: string) => {
    if (!user) {
      throw new Error('User must be logged in to cancel a subscription');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      const data = await response.json();
      return data.success;
    } catch (error: any) {
      toast({
        title: 'Erro ao Cancelar Subscrição',
        description: error.message || 'Ocorreu um erro ao cancelar a subscrição.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
    if (!user) {
      throw new Error('User must be logged in to update a subscription');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription');
      }

      const data = await response.json();
      return data.success;
    } catch (error: any) {
      toast({
        title: 'Erro ao Atualizar Subscrição',
        description: error.message || 'Ocorreu um erro ao atualizar a subscrição.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomerPortalLink = async () => {
    if (!user) {
      throw new Error('User must be logged in to access customer portal');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get customer portal link');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      toast({
        title: 'Erro ao Aceder ao Portal',
        description: error.message || 'Ocorreu um erro ao aceder ao portal do cliente.',
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
        processPayment,
        createSubscription,
        cancelSubscription,
        updateSubscription,
        getCustomerPortalLink,
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