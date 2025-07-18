'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { Loader2, CheckCircle, AlertTriangle, CreditCard, Lock } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  metadata?: Record<string, string>;
}

export default function CheckoutForm({
  amount,
  currency = 'EUR',
  description,
  onSuccess,
  onCancel,
  metadata,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirmation`,
        payment_method_data: {
          billing_details: {
            name: 'Pixel Universe User',
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Ocorreu um erro ao processar o pagamento.');
      toast({
        title: 'Erro no Pagamento',
        description: error.message || 'Ocorreu um erro ao processar o pagamento.',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsPaymentSuccessful(true);
      setShowConfetti(true);
      setPlaySuccessSound(true);
      toast({
        title: 'Pagamento Bem-Sucedido',
        description: 'O seu pagamento foi processado com sucesso!',
      });
      onSuccess?.();
    } else {
      setMessage('Ocorreu um erro inesperado.');
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-sm border-primary/30">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <CardHeader className="space-y-1 bg-gradient-to-r from-card to-primary/5 border-b border-primary/20">
        <CardTitle className="text-xl font-headline flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          Finalizar Pagamento
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{description}</p>
          <Badge variant="outline" className="font-mono">
            {(amount / 100).toFixed(2)} {currency}
          </Badge>
        </div>
      </CardHeader>
      
      {isPaymentSuccessful ? (
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pagamento Concluído</h3>
          <p className="text-muted-foreground mb-4">
            O seu pagamento foi processado com sucesso. Obrigado pela sua compra!
          </p>
          <Button onClick={onSuccess} className="w-full">
            Continuar
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <PaymentElement />
              <Separator />
              <AddressElement options={{ mode: 'shipping' }} />
            </div>
            
            {message && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{message}</p>
              </div>
            )}
            
            <div className="flex items-center justify-center text-xs text-muted-foreground gap-1">
              <Lock className="h-3 w-3" />
              <span>Pagamento seguro processado pela Stripe</span>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t border-primary/20 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !stripe || !elements}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  Pagar {(amount / 100).toFixed(2)} {currency}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}