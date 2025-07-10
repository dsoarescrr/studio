'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin, CreditCard, Gift, Palette, ImageIcon, Link as LinkIcon, 
  ShoppingCart, Zap, Star, Crown, Shield, AlertTriangle, CheckCircle2,
  Eye, Heart, Share2, Clock, TrendingUp, Users, Sparkles, Gem,
  DollarSign, Coins, Package, Tag, Globe, Lock, Unlock, Info,
  Bookmark, MessageSquare, Flag, Copy, ExternalLink, History, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type PaymentMethod = 'credits' | 'special_credits' | 'real_money';

interface PixelData {
  x: number;
  y: number;
  color: string;
  owner?: string;
  price: number;
  lastSold?: Date;
  views: number;
  likes: number;
  rarity: PixelRarity;
  region: string;
  isProtected: boolean;
  history: Array<{
    owner: string;
    date: Date | string;
    price: number;
    action?: 'purchase' | 'sale' | 'transfer';
  }>;
  features?: string[];
  description?: string;
  tags?: string[];
}

interface PurchaseCustomizations {
  color: string;
  description: string;
  imageFile?: File;
  title: string;
  tags: string[];
  linkUrl: string;
  isPublic: boolean;
  allowComments: boolean;
}

interface PixelPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: PixelData | null;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: PixelData, paymentMethod: PaymentMethod, customizations: PurchaseCustomizations) => Promise<boolean>;
}

const rarityConfig: Record<PixelRarity, {
  label: string;
  color: string;
  bgColor: string;
  multiplier: number;
  icon: React.ReactNode;
}> = {
  common: {
    label: 'Comum',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    multiplier: 1,
    icon: <Package className="h-4 w-4" />
  },
  uncommon: {
    label: 'Incomum',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    multiplier: 1.2,
    icon: <Star className="h-4 w-4" />
  },
  rare: {
    label: 'Raro',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    multiplier: 1.5,
    icon: <Gem className="h-4 w-4" />
  },
  epic: {
    label: 'Épico',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    multiplier: 2,
    icon: <Crown className="h-4 w-4" />
  },
  legendary: {
    label: 'Lendário',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    multiplier: 3,
    icon: <Sparkles className="h-4 w-4" />
  }
};

export default function PixelPurchaseModal({
  isOpen,
  onClose,
  pixelData,
  userCredits,
  userSpecialCredits,
  onPurchase
}: PixelPurchaseModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credits');
  const [isProcessing, setPurchaseProcessing] = useState(false);
  const [purchaseProgress, setPurchaseProgress] = useState(0);
  const [customizations, setCustomizations] = useState<PurchaseCustomizations>({
    color: '#D4A757',
    description: '',
    title: pixelData ? `Meu Pixel (${pixelData.x}, ${pixelData.y})` : '',
    tags: [],
    linkUrl: '',
    isPublic: true,
    allowComments: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomizations(prev => ({
        color: pixelData.color || '#D4A757',
        description: pixelData.description || `Pixel adquirido na região de ${pixelData.region}`,
        title: `Meu Pixel (${pixelData.x}, ${pixelData.y})`,
        tags: pixelData.tags || [],
        linkUrl: '',
        isPublic: true,
        allowComments: true
      }));
    }
  }, [pixelData]);

  if (!pixelData) return null;

  const rarity = rarityConfig[pixelData.rarity];
  const finalPrice = Math.round(pixelData.price * rarity.multiplier);
  const canAffordCredits = userCredits >= finalPrice;
  const canAffordSpecialCredits = userSpecialCredits >= Math.round(finalPrice * 0.1);
  const realMoneyPrice = (finalPrice * 0.01).toFixed(2); // 1 credit = 0.01€

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomizations(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePurchase = async () => {
    if (!canAffordCredits && paymentMethod === 'credits') {
      toast({
        title: "Créditos Insuficientes",
        description: `Precisa de ${finalPrice} créditos. Tem apenas ${userCredits}.`,
        variant: "destructive"
      });
      return;
    }

    if (!canAffordSpecialCredits && paymentMethod === 'special_credits') {
      toast({
        title: "Créditos Especiais Insuficientes",
        description: `Precisa de ${Math.round(finalPrice * 0.1)} créditos especiais.`,
        variant: "destructive"
      });
      return;
    }

    setPurchaseProcessing(true);
    setPurchaseProgress(0);

    // Simulate purchase process with progress
    const progressInterval = setInterval(() => {
      setPurchaseProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const success = await onPurchase(pixelData, paymentMethod, customizations);
      
      clearInterval(progressInterval);
      setPurchaseProgress(100);

      if (success) {
        setTimeout(() => {
          toast({
            title: "Compra Realizada com Sucesso!",
            description: `O pixel (${pixelData.x}, ${pixelData.y}) é agora seu!`,
          });
          onClose();
          setPurchaseProcessing(false);
          setPurchaseProgress(0);
        }, 1000);
      } else {
        throw new Error('Falha na compra');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setPurchaseProcessing(false);
      setPurchaseProgress(0);
      toast({
        title: "Erro na Compra",
        description: "Ocorreu um erro durante a compra. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'credits': return <Coins className="h-4 w-4" />;
      case 'special_credits': return <Gift className="h-4 w-4" />;
      case 'real_money': return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'credits': return 'Créditos';
      case 'special_credits': return 'Créditos Especiais';
      case 'real_money': return 'Dinheiro Real';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-card to-primary/5 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                Pixel ({pixelData.x}, {pixelData.y})
                <Badge variant="outline" className={cn("text-xs", rarity.color)}>
                  {rarity.icon}
                  <span className="ml-1">{rarity.label}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-2">
                Região: {pixelData.region} • {pixelData.views} visualizações • {pixelData.likes} gostos
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{finalPrice}€</div>
              <div className="text-xs text-muted-foreground">
                Preço base: {pixelData.price}€ × {rarity.multiplier}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Left Panel - Pixel Info */}
          <div className="w-full lg:w-1/2 border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="border-b px-4 py-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  {/* Pixel Preview */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-20 h-20 rounded-lg border-2 border-border shadow-inner"
                          style={{ backgroundColor: pixelData.color }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Pré-visualização do Pixel</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Cor: {pixelData.color}</span>
                            <span>•</span>
                            <span>Região: {pixelData.region}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{pixelData.views}</span>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{pixelData.likes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  {pixelData.features && pixelData.features.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Características Especiais</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {pixelData.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Market Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Informação de Mercado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço Base:</span>
                          <p className="font-semibold">{pixelData.price}€</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Multiplicador:</span>
                          <p className="font-semibold">×{rarity.multiplier}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última Venda:</span>
                          <p className="font-semibold">
                            {pixelData.lastSold ? pixelData.lastSold.toLocaleDateString('pt-PT') : 'Nunca'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Popularidade:</span>
                          <p className="font-semibold">{pixelData.views > 1000 ? 'Alta' : 'Média'}</p>
                        </div>
                      </div>
                      
                      {pixelData.isProtected && (
                        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-700 dark:text-orange-300">
                            Pixel protegido - Não pode ser modificado por 24h após compra
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Histórico de Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {pixelData.history.length > 0 ? (
                        <div className="space-y-4">
                          {pixelData.history.map((entry, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                              <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <History className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{entry.owner}</p>
                                  <p className="font-semibold text-sm">{entry.price}€</p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                  <p>
                                    {entry.action === 'purchase' ? 'Comprou' : 
                                     entry.action === 'sale' ? 'Vendeu' : 'Transação'}
                                  </p>
                                  <p>
                                    {typeof entry.date === 'string' ? entry.date : entry.date.toLocaleDateString('pt-PT')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma transação anterior registada
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Informações Técnicas</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Coordenadas:</span>
                          <p className="font-mono font-medium">({pixelData.x}, {pixelData.y})</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Região:</span>
                          <p className="font-medium">{pixelData.region}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Raridade:</span>
                          <p className={cn("font-medium flex items-center gap-1", rarity.color)}>
                            {rarity.icon}
                            {rarity.label}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estado:</span>
                          <p className="font-medium flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="h-3 w-3" />
                            Disponível
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {pixelData.description && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{pixelData.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Panel - Purchase & Customization */}
          <div className="w-full lg:w-1/2">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Método de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid gap-3">
                      {/* Credits */}
                      <div 
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          paymentMethod === 'credits' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                          !canAffordCredits && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => canAffordCredits && setPaymentMethod('credits')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-medium">Créditos</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{finalPrice}</p>
                            <p className="text-xs text-muted-foreground">
                              Saldo: {userCredits}
                            </p>
                          </div>
                        </div>
                        {!canAffordCredits && (
                          <p className="text-xs text-red-500 mt-1">Créditos insuficientes</p>
                        )}
                      </div>

                      {/* Special Credits */}
                      <div 
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          paymentMethod === 'special_credits' ? "border-accent bg-accent/5" : "border-border hover:border-accent/50",
                          !canAffordSpecialCredits && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => canAffordSpecialCredits && setPaymentMethod('special_credits')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-accent" />
                            <span className="font-medium">Créditos Especiais</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{Math.round(finalPrice * 0.1)}</p>
                            <p className="text-xs text-muted-foreground">
                              Saldo: {userSpecialCredits}
                            </p>
                          </div>
                        </div>
                        {!canAffordSpecialCredits && (
                          <p className="text-xs text-red-500 mt-1">Créditos especiais insuficientes</p>
                        )}
                      </div>

                      {/* Real Money */}
                      <div 
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          paymentMethod === 'real_money' ? "border-green-500 bg-green-500/5" : "border-border hover:border-green-500/50"
                        )}
                        onClick={() => setPaymentMethod('real_money')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Dinheiro Real</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">€{realMoneyPrice}</p>
                            <p className="text-xs text-muted-foreground">
                              Via PayPal/Stripe
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customization Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Personalização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Color Picker */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <Palette className="h-4 w-4 text-primary" />
                        Cor do Pixel
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={customizations.color}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          value={customizations.color}
                          onChange={(e) => setCustomizations(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#D4A757"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Título
                      </Label>
                      <Input
                        value={customizations.title}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título do seu pixel"
                        className="mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Descrição
                      </Label>
                      <Textarea
                        value={customizations.description}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o seu pixel..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        Imagem Personalizada
                      </Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="pixel-image-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('pixel-image-upload')?.click()}
                          className="w-full"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Carregar Imagem
                        </Button>
                        {imagePreview && (
                          <div className="mt-2">
                            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded border" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link URL */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-primary" />
                        Link (Opcional)
                      </Label>
                      <Input
                        value={customizations.linkUrl}
                        onChange={(e) => setCustomizations(prev => ({ ...prev, linkUrl: e.target.value }))}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-3">
                      <Label className="text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        Configurações de Privacidade
                      </Label>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          Pixel Público
                        </Label>
                        <Switch
                          checked={customizations.isPublic}
                          onCheckedChange={(checked) => setCustomizations(prev => ({ ...prev, isPublic: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Permitir Comentários
                        </Label>
                        <Switch
                          checked={customizations.allowComments}
                          onCheckedChange={(checked) => setCustomizations(prev => ({ ...prev, allowComments: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Resumo da Compra</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Preço base:</span>
                      <span>{pixelData.price}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Raridade ({rarity.label}):</span>
                      <span className={rarity.color}>×{rarity.multiplier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de serviço (5%):</span>
                      <span>{Math.round(finalPrice * 0.05)}€</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">{finalPrice}€</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Método:</span>
                      <span className="flex items-center gap-1">
                        <span className={cn(
                          paymentMethod === 'credits' ? "text-primary" : 
                          paymentMethod === 'special_credits' ? "text-accent" : "text-green-500"
                        )}>
                          {getPaymentMethodIcon(paymentMethod)}
                        </span>
                        {getPaymentMethodLabel(paymentMethod)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Button */}
                <div className="space-y-3">
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processando compra...</span>
                        <span>{purchaseProgress}%</span>
                      </div>
                      <Progress value={purchaseProgress} className="h-2" />
                    </div>
                  )}
                  
                  <Button
                    onClick={handlePurchase}
                    disabled={isProcessing || (!canAffordCredits && paymentMethod === 'credits') || (!canAffordSpecialCredits && paymentMethod === 'special_credits')}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 button-hover-lift"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="h-5 w-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Comprar Pixel por {finalPrice}€
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Ao comprar, concorda com os nossos termos de serviço
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
