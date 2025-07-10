
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin, Coins, Gift, Sparkles, Paintbrush, TextCursorInput, Upload,
  DollarSign, CreditCard, Shield, Eye, Heart, Star, ShoppingCart, Loader2,
  Trophy, BookOpen, Tag, Calendar, BarChart3, Clock, Lock, Unlock, Users,
  Globe, ExternalLink, Brush
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SelectedPixelDetails {
  x: number;
  y: number;
  color: string;
  owner?: string;
  price: number;
  lastSold?: Date;
  views: number;
  likes: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  region: string;
  isProtected: boolean;
  history: Array<{ owner: string; date: string | Date; price: number, action?: 'purchase' | 'sale' | 'transfer' }>;
  features?: string[];
  description?: string;
  tags?: string[];
  linkUrl?: string;
  acquisitionDate?: string;
  lastModifiedDate?: string;
  isOwnedByCurrentUser?: boolean;
  isForSaleBySystem?: boolean;
  manualDescription?: string;
  pixelImageUrl?: string;
  dataAiHint?: string;
  title?: string;
  isForSaleByOwner?: boolean;
  salePrice?: number;
  isFavorited?: boolean;
  loreSnippet?: string;
  gpsCoords?: { lat: number; lon: number; } | null;
}

interface EnhancedPixelPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: SelectedPixelDetails | null;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: SelectedPixelDetails, paymentMethod: string, customizations: any) => Promise<boolean>;
}

const rarityStyles = {
  common: { text: 'text-gray-400', border: 'border-gray-400/50', bg: 'bg-gray-400/10' },
  uncommon: { text: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10' },
  rare: { text: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10' },
  epic: { text: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10' },
  legendary: { text: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10' },
};

export default function EnhancedPixelPurchaseModal({
  isOpen,
  onClose,
  pixelData,
  userCredits,
  userSpecialCredits,
  onPurchase,
}: EnhancedPixelPurchaseModalProps) {
  const [activeTab, setActiveTab] = useState('purchase');
  const [customColor, setCustomColor] = useState('#D4A757');
  const [pixelTitle, setPixelTitle] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomColor(pixelData.color || '#D4A757');
      setPixelTitle(pixelData.title || `Pixel em ${pixelData.region}`);
      setActiveTab(pixelData.isOwnedByCurrentUser ? 'details' : 'purchase');
    }
  }, [pixelData]);

  const handlePurchaseClick = async () => {
    if (!pixelData) return;

    setIsProcessing(true);
    const success = await onPurchase(pixelData, paymentMethod, {
      color: customColor,
      title: pixelTitle,
    });
    setIsProcessing(false);

    if (success) {
      toast({
        title: 'Compra Bem-Sucedida!',
        description: `Parabéns! O pixel (${pixelData.x}, ${pixelData.y}) é seu.`,
      });
      onClose();
    } else {
      toast({
        title: 'Falha na Compra',
        description: 'Não foi possível completar a compra. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const canAfford = useMemo(() => {
    if (!pixelData) return false;
    const price = pixelData.salePrice || pixelData.price;
    if (paymentMethod === 'credits') {
      return userCredits >= price;
    }
    if (paymentMethod === 'special_credits') {
      return userSpecialCredits >= price;
    }
    return true; // for real money
  }, [pixelData, paymentMethod, userCredits, userSpecialCredits]);

  if (!pixelData) return null;

  const {
    x, y, owner, price, rarity, region, description, title, tags, loreSnippet, features,
    isOwnedByCurrentUser, isForSaleBySystem, history, views, likes, gpsCoords
  } = pixelData;
  const currentPrice = pixelData.salePrice || price;
  const rarityStyle = rarityStyles[rarity];

  const renderInfoRow = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between text-sm py-2 border-b border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b dialog-header-gold-accent">
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl text-gradient-gold">
            <MapPin className="h-6 w-6" />
            {title || `Pixel (${x}, ${y})`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description || `Detalhes e opções para o pixel em ${region}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Panel: Details */}
          <ScrollArea className="md:col-span-2 h-full p-4 border-r border-border">
            <div className="space-y-6">
              <Card className={cn("border-2", rarityStyle.border, rarityStyle.bg)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <CardTitle className={cn("text-lg", rarityStyle.text)}>Raridade: {rarity}</CardTitle>
                    <CardDescription className={cn(rarityStyle.text, "opacity-80")}>
                      {loreSnippet || 'Cada pixel tem a sua própria história.'}
                    </CardDescription>
                  </div>
                  <Sparkles className={cn("h-8 w-8", rarityStyle.text)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> Informações do Pixel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {renderInfoRow(<Users className="h-4 w-4" />, "Proprietário", owner)}
                  {renderInfoRow(<Globe className="h-4 w-4" />, "Região", region)}
                  {renderInfoRow(<MapPin className="h-4 w-4" />, "Coordenadas GPS", gpsCoords ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lon.toFixed(4)}` : "N/A")}
                  {renderInfoRow(<Eye className="h-4 w-4" />, "Visualizações", views.toLocaleString())}
                  {renderInfoRow(<Heart className="h-4 w-4" />, "Gostos", likes.toLocaleString())}
                </CardContent>
              </Card>

              {features && features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" /> Atributos Especiais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {features.map((feature, i) => <Badge key={i} variant="secondary">{feature}</Badge>)}
                  </CardContent>
                </Card>
              )}

              {history && history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Histórico de Proprietários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {history.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                           <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{entry.owner.substring(0,1)}</AvatarFallback>
                              </Avatar>
                              <span>{entry.owner}</span>
                           </div>
                           <div className="text-right">
                              <p className="font-semibold">{entry.price} créditos</p>
                              <p className="text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Right Panel: Actions */}
          <ScrollArea className="md:col-span-1 h-full">
            <div className="p-4 space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="purchase" disabled={isOwnedByCurrentUser}>Comprar</TabsTrigger>
                  <TabsTrigger value="details">Personalizar</TabsTrigger>
                </TabsList>

                <TabsContent value="purchase" className="space-y-4 pt-4">
                   <Card className="text-center">
                     <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Preço</p>
                        <p className="text-4xl font-bold text-primary">{currentPrice}</p>
                        <p className="text-xs text-muted-foreground">créditos</p>
                     </CardContent>
                   </Card>

                   <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Método de Pagamento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                         <Button
                           variant={paymentMethod === 'credits' ? 'default' : 'outline'}
                           className="w-full justify-start"
                           onClick={() => setPaymentMethod('credits')}>
                           <Coins className="h-4 w-4 mr-2" /> Créditos ({userCredits.toLocaleString()})
                         </Button>
                         <Button
                           variant={paymentMethod === 'special_credits' ? 'default' : 'outline'}
                           className="w-full justify-start"
                           onClick={() => setPaymentMethod('special_credits')}>
                            <Gift className="h-4 w-4 mr-2" /> Créditos Especiais ({userSpecialCredits})
                         </Button>
                         <Button variant="outline" className="w-full justify-start" disabled>
                            <CreditCard className="h-4 w-4 mr-2" /> Dinheiro Real (Em breve)
                         </Button>
                      </CardContent>
                   </Card>
                   
                  <Button size="lg" className="w-full button-gradient-gold" onClick={handlePurchaseClick} disabled={!canAfford || isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                    {canAfford ? 'Confirmar Compra' : 'Créditos Insuficientes'}
                  </Button>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 pt-4">
                   <p className="text-sm text-muted-foreground text-center">
                    {isOwnedByCurrentUser ? "Personalize o seu pixel." : "Personalize o seu novo pixel antes de comprar."}
                   </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pixelTitle">Título do Pixel</Label>
                      <Input id="pixelTitle" value={pixelTitle} onChange={(e) => setPixelTitle(e.target.value)} placeholder="Dê um nome ao seu pixel" />
                    </div>
                    <div>
                      <Label htmlFor="customColor">Cor Personalizada</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" id="customColor" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-12 h-10 p-1"/>
                        <Input value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                      </div>
                    </div>
                     <div>
                      <Label htmlFor="pixelImage">Imagem (1x1)</Label>
                      <Input id="pixelImage" type="file" accept="image/png, image/jpeg, image/gif" />
                    </div>
                  </div>
                  {isOwnedByCurrentUser && (
                    <Button className="w-full">
                        <Star className="h-4 w-4 mr-2"/>
                        Guardar Alterações
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
