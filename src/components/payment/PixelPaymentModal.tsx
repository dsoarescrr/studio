
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStripePayment, StripePaymentElements } from './StripePaymentProvider';
import CheckoutForm from './CheckoutForm';
import { useAuth } from '@/lib/auth-context';
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import {
  CreditCard, Coins, Gift, Euro, Wallet, ShoppingCart, CheckCircle, 
  Loader2, AlertTriangle, Info, ArrowRight, CreditCard as CreditCardIcon
} from 'lucide-react';

interface PixelPaymentModalProps {
  children: React.ReactNode;
  pixelData: {
    x: number;
    y: number;
    price: number;
    specialCreditsPrice?: number;
    rarity: string;
    region: string;
  };
  onPurchaseComplete: (paymentMethod: string) => void;
}

export default function PixelPaymentModal({
  children,
  pixelData,
  onPurchaseComplete,
}: PixelPaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'credits' | 'card' | 'special'>('credits');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'mbway'>('credit_card');
  
  const { createPaymentIntent } = useStripePayment();
  const { toast } = useToast();
  const { user } = useAuth();
  const { credits, specialCredits, removeCredits, removeSpecialCredits } = useUserStore();

  const handleCreditsPayment = async () => {
    if (!user) {
      toast({
        title: 'Autenticação Necessária',
        description: 'Por favor, inicie sessão para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (credits < pixelData.price) {
      toast({
        title: 'Créditos Insuficientes',
        description: 'Não tem créditos suficientes para esta compra.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove credits from user
      removeCredits(pixelData.price);
      
      // Show success feedback
      setShowConfetti(true);
      setPlaySuccessSound(true);
      
      toast({
        title: 'Compra Bem-Sucedida',
        description: `Comprou o pixel (${pixelData.x}, ${pixelData.y}) com sucesso!`,
      });
      
      // Close modal and notify parent
      setTimeout(() => {
        setIsOpen(false);
        onPurchaseComplete('credits');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erro na Compra',
        description: 'Ocorreu um erro ao processar a sua compra. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpecialCreditsPayment = async () => {
    if (!user) {
      toast({
        title: 'Autenticação Necessária',
        description: 'Por favor, inicie sessão para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (!pixelData.specialCreditsPrice) {
      toast({
        title: 'Preço Não Disponível',
        description: 'Este pixel não pode ser comprado com créditos especiais.',
        variant: 'destructive',
      });
      return;
    }

    if (specialCredits < pixelData.specialCreditsPrice) {
      toast({
        title: 'Créditos Especiais Insuficientes',
        description: 'Não tem créditos especiais suficientes para esta compra.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove special credits from user
      removeSpecialCredits(pixelData.specialCreditsPrice);
      
      // Show success feedback
      setShowConfetti(true);
      setPlaySuccessSound(true);
      
      toast({
        title: 'Compra Bem-Sucedida',
        description: `Comprou o pixel (${pixelData.x}, ${pixelData.y}) com créditos especiais!`,
      });
      
      // Close modal and notify parent
      setTimeout(() => {
        setIsOpen(false);
        onPurchaseComplete('special_credits');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Erro na Compra',
        description: 'Ocorreu um erro ao processar a sua compra. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!user) {
      toast({
        title: 'Autenticação Necessária',
        description: 'Por favor, inicie sessão para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create payment intent with Stripe
      const { clientSecret: secret } = await createPaymentIntent(
        pixelData.price * 100, // Convert to cents
        'eur',
        {
          pixelX: pixelData.x.toString(),
          pixelY: pixelData.y.toString(),
          pixelRegion: pixelData.region,
          pixelRarity: pixelData.rarity,
          paymentType: 'pixel_purchase',
        }
      );
      
      setClientSecret(secret);
    } catch (error) {
      toast({
        title: 'Erro na Preparação do Pagamento',
        description: 'Ocorreu um erro ao preparar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Show success feedback
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Close modal and notify parent
    setTimeout(() => {
      setIsOpen(false);
      onPurchaseComplete('card');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
            Comprar Pixel
          </DialogTitle>
        </DialogHeader>
        
        {clientSecret ? (
          <StripePaymentElements clientSecret={clientSecret}>
            <CheckoutForm
              amount={pixelData.price * 100}
              description={`Compra de Pixel (${pixelData.x}, ${pixelData.y}) - ${pixelData.rarity}`}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setClientSecret(null)}
            />
          </StripePaymentElements>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credits" disabled={isProcessing}>
                <Coins className="h-4 w-4 mr-2" />
                Créditos
              </TabsTrigger>
              <TabsTrigger value="special" disabled={isProcessing || !pixelData.specialCreditsPrice}>
                <Gift className="h-4 w-4 mr-2" />
                Especiais
              </TabsTrigger>
              <TabsTrigger value="card" disabled={isProcessing}>
                <CreditCard className="h-4 w-4 mr-2" />
                Cartão
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="credits" className="space-y-4 py-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pagar com Créditos</CardTitle>
                  <CardDescription>
                    Use os seus créditos para comprar este pixel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Pixel ({pixelData.x}, {pixelData.y})</p>
                        <p className="text-sm text-muted-foreground">{pixelData.rarity} • {pixelData.region}</p>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        {pixelData.price} créditos
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Saldo Disponível</p>
                      <p className="font-mono">{credits.toLocaleString('pt-PT')} créditos</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Saldo Após Compra</p>
                      <p className="font-mono">{(credits - pixelData.price).toLocaleString('pt-PT')} créditos</p>
                    </div>
                    
                    {credits < pixelData.price && (
                      <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Créditos Insuficientes</p>
                          <p className="text-xs text-destructive/80">
                            Precisa de mais {(pixelData.price - credits).toLocaleString('pt-PT')} créditos para esta compra.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t">
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreditsPayment} 
                    disabled={isProcessing || credits < pixelData.price}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <Coins className="h-4 w-4 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="special" className="space-y-4 py-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pagar com Créditos Especiais</CardTitle>
                  <CardDescription>
                    Use os seus créditos especiais para comprar este pixel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Pixel ({pixelData.x}, {pixelData.y})</p>
                        <p className="text-sm text-muted-foreground">{pixelData.rarity} • {pixelData.region}</p>
                      </div>
                      <Badge variant="outline" className="text-accent">
                        {pixelData.specialCreditsPrice} especiais
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Saldo Disponível</p>
                      <p className="font-mono">{specialCredits.toLocaleString('pt-PT')} especiais</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Saldo Após Compra</p>
                      <p className="font-mono">
                        {pixelData.specialCreditsPrice 
                          ? (specialCredits - pixelData.specialCreditsPrice).toLocaleString('pt-PT') 
                          : specialCredits.toLocaleString('pt-PT')} especiais
                      </p>
                    </div>
                    
                    {(pixelData.specialCreditsPrice && specialCredits < pixelData.specialCreditsPrice) && (
                      <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Créditos Especiais Insuficientes</p>
                          <p className="text-xs text-destructive/80">
                            Precisa de mais {(pixelData.specialCreditsPrice - specialCredits).toLocaleString('pt-PT')} créditos especiais para esta compra.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t">
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSpecialCreditsPayment} 
                    disabled={isProcessing || !pixelData.specialCreditsPrice || specialCredits < (pixelData.specialCreditsPrice || 0)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Comprar Agora
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="card" className="space-y-4 py-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pagar com Cartão</CardTitle>
                  <CardDescription>
                    Compre este pixel com cartão de crédito ou débito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Pixel ({pixelData.x}, {pixelData.y})</p>
                        <p className="text-sm text-muted-foreground">{pixelData.rarity} • {pixelData.region}</p>
                      </div>
                      <Badge variant="outline" className="text-green-500">
                        {pixelData.price.toFixed(2)}€
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <RadioGroup defaultValue="credit_card" onValueChange={(value) => setPaymentMethod(value as any)}>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                          <CreditCardIcon className="h-4 w-4 text-blue-500" />
                          <span>Cartão de Crédito/Débito</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer opacity-50">
                        <RadioGroupItem value="paypal" id="paypal" disabled />
                        <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                          <Wallet className="h-4 w-4 text-blue-700" />
                          <span>PayPal (Em breve)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer opacity-50">
                        <RadioGroupItem value="mbway" id="mbway" disabled />
                        <Label htmlFor="mbway" className="flex items-center gap-2 cursor-pointer">
                          <Euro className="h-4 w-4 text-green-600" />
                          <span>MB WAY (Em breve)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="bg-muted/30 p-3 rounded-md flex items-start gap-2">
                      <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Ao prosseguir, será redirecionado para o nosso processador de pagamentos seguro.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t">
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCardPayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A preparar...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
