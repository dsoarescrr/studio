'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Palette,
  CreditCard,
  Gift,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Eye,
  Heart,
  Star,
  Zap,
  Shield,
  Info,
  ChevronRight,
  Coins,
  Sparkles,
  Timer,
  Target,
  Crown,
  Gem,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  Paintbrush,
  Lock,
  Unlock,
  Globe,
  Camera,
  Share2,
  Bookmark,
  History,
  Lightbulb,
  Flame,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types
interface PixelData {
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
  history: PixelTransaction[];
}

interface PixelTransaction {
  id: string;
  date: Date;
  price: number;
  buyer: string;
  seller?: string;
  type: 'purchase' | 'sale' | 'color_change';
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  fee: number;
  processingTime: string;
  available: boolean;
}

interface PriceHistory {
  date: Date;
  price: number;
  volume: number;
}

interface PixelPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: PixelData | null;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: PixelData, paymentMethod: string, customizations: any) => Promise<boolean>;
}

// Mock data generators
const generatePriceHistory = (basePrice: number): PriceHistory[] => {
  const history: PriceHistory[] = [];
  let currentPrice = basePrice * 0.7;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate price fluctuation
    const change = (Math.random() - 0.5) * 0.2;
    currentPrice = Math.max(1, currentPrice * (1 + change));
    
    history.push({
      date,
      price: Math.round(currentPrice),
      volume: Math.floor(Math.random() * 50) + 1
    });
  }
  
  return history;
};

const generateSimilarPixels = (region: string, rarity: string): PixelData[] => {
  return Array.from({ length: 6 }, (_, i) => ({
    x: Math.floor(Math.random() * 1000),
    y: Math.floor(Math.random() * 1000),
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    price: Math.floor(Math.random() * 500) + 50,
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    rarity: rarity as any,
    region,
    isProtected: Math.random() > 0.8,
    history: []
  }));
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credits',
    name: 'Créditos Normais',
    icon: <Coins className="h-4 w-4" />,
    fee: 0,
    processingTime: 'Instantâneo',
    available: true
  },
  {
    id: 'special_credits',
    name: 'Créditos Especiais',
    icon: <Sparkles className="h-4 w-4" />,
    fee: 0,
    processingTime: 'Instantâneo',
    available: true
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    icon: <CreditCard className="h-4 w-4" />,
    fee: 2.9,
    processingTime: '1-2 minutos',
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Shield className="h-4 w-4" />,
    fee: 3.5,
    processingTime: '2-5 minutos',
    available: true
  }
];

const rarityConfig = {
  common: { color: 'text-gray-400', bg: 'bg-gray-100', label: 'Comum', multiplier: 1 },
  uncommon: { color: 'text-green-400', bg: 'bg-green-100', label: 'Incomum', multiplier: 1.2 },
  rare: { color: 'text-blue-400', bg: 'bg-blue-100', label: 'Raro', multiplier: 1.5 },
  epic: { color: 'text-purple-400', bg: 'bg-purple-100', label: 'Épico', multiplier: 2 },
  legendary: { color: 'text-yellow-400', bg: 'bg-yellow-100', label: 'Lendário', multiplier: 3 }
};

export default function PixelPurchaseModal({
  isOpen,
  onClose,
  pixelData,
  userCredits,
  userSpecialCredits,
  onPurchase
}: PixelPurchaseModalProps) {
  const { toast } = useToast();
  
  // State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credits');
  const [customColor, setCustomColor] = useState('#FF0000');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [setAsProfilePicture, setSetAsProfilePicture] = useState(false);
  const [shareOnSocial, setShareOnSocial] = useState(false);
  const [protectionLevel, setProtectionLevel] = useState([0]);
  const [isProcessing, setPurchaseProcessing] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [similarPixels, setSimilarPixels] = useState<PixelData[]>([]);
  const [activeTab, setActiveTab] = useState('purchase');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [demandLevel, setDemandLevel] = useState(0);

  // Effects
  useEffect(() => {
    if (pixelData && isOpen) {
      setPriceHistory(generatePriceHistory(pixelData.price));
      setSimilarPixels(generateSimilarPixels(pixelData.region, pixelData.rarity));
      setCustomColor(pixelData.color);
      
      // Calculate estimated value and demand
      const baseValue = pixelData.price;
      const rarityMultiplier = rarityConfig[pixelData.rarity].multiplier;
      const viewsMultiplier = Math.min(pixelData.views / 1000, 2);
      const likesMultiplier = Math.min(pixelData.likes / 100, 1.5);
      
      setEstimatedValue(Math.round(baseValue * rarityMultiplier * (1 + viewsMultiplier + likesMultiplier)));
      setDemandLevel(Math.min((pixelData.views + pixelData.likes * 10) / 100, 100));
    }
  }, [pixelData, isOpen]);

  // Calculations
  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
  const basePrice = pixelData?.price || 0;
  const rarityMultiplier = pixelData ? rarityConfig[pixelData.rarity].multiplier : 1;
  const protectionCost = protectionLevel[0] * 10;
  const customColorCost = useCustomColor ? 25 : 0;
  const totalCost = Math.round((basePrice * rarityMultiplier) + protectionCost + customColorCost);
  const fee = selectedMethod ? Math.round(totalCost * (selectedMethod.fee / 100)) : 0;
  const finalCost = totalCost + fee;

  const canAfford = selectedPaymentMethod === 'credits' 
    ? userCredits >= finalCost
    : selectedPaymentMethod === 'special_credits'
    ? userSpecialCredits >= finalCost
    : true;

  // Handlers
  const handlePurchase = async () => {
    if (!pixelData || !canAfford) return;

    setPurchaseProcessing(true);
    
    try {
      const customizations = {
        color: useCustomColor ? customColor : pixelData.color,
        protection: protectionLevel[0],
        addToFavorites,
        setAsProfilePicture,
        shareOnSocial
      };

      const success = await onPurchase(pixelData, selectedPaymentMethod, customizations);
      
      if (success) {
        toast({
          title: "Pixel Adquirido com Sucesso! 🎉",
          description: `Pixel (${pixelData.x}, ${pixelData.y}) agora é seu!`,
        });
        onClose();
      } else {
        throw new Error('Falha na compra');
      }
    } catch (error) {
      toast({
        title: "Erro na Compra",
        description: "Não foi possível completar a compra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setPurchaseProcessing(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('pt-PT');
  const formatDate = (date: Date) => date.toLocaleDateString('pt-PT');

  if (!pixelData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Pixel ({pixelData.x}, {pixelData.y})
                <Badge className={cn("text-xs", rarityConfig[pixelData.rarity].color, rarityConfig[pixelData.rarity].bg)}>
                  {rarityConfig[pixelData.rarity].label}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {pixelData.region}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatPrice(pixelData.views)} visualizações
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {pixelData.likes} gostos
                </span>
                {pixelData.isProtected && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Protegido
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{formatPrice(finalCost)} Kz</div>
              <div className="text-sm text-muted-foreground">
                {estimatedValue > totalCost ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Bom negócio!
                  </span>
                ) : (
                  <span className="text-orange-500 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Preço elevado
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 grid w-auto grid-cols-4">
              <TabsTrigger value="purchase" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Comprar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análise
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="similar" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Similares
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 pt-4">
                  <TabsContent value="purchase" className="mt-0 space-y-6">
                    {/* Pixel Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Paintbrush className="h-5 w-5" />
                          Preview do Pixel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="space-y-2">
                            <Label>Cor Atual</Label>
                            <div 
                              className="w-16 h-16 rounded-lg border-2 border-border shadow-inner"
                              style={{ backgroundColor: pixelData.color }}
                            />
                          </div>
                          {useCustomColor && (
                            <ChevronRight className="h-6 w-6 text-muted-foreground" />
                          )}
                          {useCustomColor && (
                            <div className="space-y-2">
                              <Label>Nova Cor</Label>
                              <div 
                                className="w-16 h-16 rounded-lg border-2 border-primary shadow-inner animate-pulse"
                                style={{ backgroundColor: customColor }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="custom-color"
                            checked={useCustomColor}
                            onCheckedChange={setUseCustomColor}
                          />
                          <Label htmlFor="custom-color" className="flex items-center gap-2">
                            Personalizar cor
                            <Badge variant="outline" className="text-xs">+{customColorCost} Kz</Badge>
                          </Label>
                        </div>

                        {useCustomColor && (
                          <div className="space-y-2">
                            <Label htmlFor="color-picker">Escolher Cor</Label>
                            <div className="flex gap-2">
                              <Input
                                id="color-picker"
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-20 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                placeholder="#FF0000"
                                className="font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Método de Pagamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className={cn(
                                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                selectedPaymentMethod === method.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50",
                                !method.available && "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                            >
                              <div className="flex items-center gap-3">
                                {method.icon}
                                <div className="flex-1">
                                  <div className="font-medium">{method.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {method.fee > 0 ? `Taxa: ${method.fee}%` : 'Sem taxa'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {method.processingTime}
                                  </div>
                                </div>
                                {selectedPaymentMethod === method.id && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Balance Check */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Saldo Disponível:</span>
                            <span className="font-medium">
                              {selectedPaymentMethod === 'credits' && `${formatPrice(userCredits)} Créditos`}
                              {selectedPaymentMethod === 'special_credits' && `${formatPrice(userSpecialCredits)} Especiais`}
                              {!['credits', 'special_credits'].includes(selectedPaymentMethod) && 'Verificar no checkout'}
                            </span>
                          </div>
                          {!canAfford && ['credits', 'special_credits'].includes(selectedPaymentMethod) && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Saldo insuficiente. Precisa de mais {formatPrice(finalCost - (selectedPaymentMethod === 'credits' ? userCredits : userSpecialCredits))} {selectedPaymentMethod === 'credits' ? 'créditos' : 'créditos especiais'}.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Protection & Extras */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Proteção e Extras
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Nível de Proteção</Label>
                            <Badge variant="outline">{protectionLevel[0]} dias (+{protectionLevel[0] * 10} Kz)</Badge>
                          </div>
                          <Slider
                            value={protectionLevel}
                            onValueChange={setProtectionLevel}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground">
                            Protege o pixel contra alterações por outros utilizadores
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="favorites"
                              checked={addToFavorites}
                              onCheckedChange={setAddToFavorites}
                            />
                            <Label htmlFor="favorites" className="flex items-center gap-2">
                              <Bookmark className="h-4 w-4" />
                              Adicionar aos favoritos
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="profile-pic"
                              checked={setAsProfilePicture}
                              onCheckedChange={setSetAsProfilePicture}
                            />
                            <Label htmlFor="profile-pic" className="flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              Definir como foto de perfil
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="social-share"
                              checked={shareOnSocial}
                              onCheckedChange={setShareOnSocial}
                            />
                            <Label htmlFor="social-share" className="flex items-center gap-2">
                              <Share2 className="h-4 w-4" />
                              Partilhar nas redes sociais
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Price Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Resumo do Preço
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Preço base</span>
                            <span>{formatPrice(basePrice)} Kz</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Multiplicador de raridade ({rarityConfig[pixelData.rarity].label})</span>
                            <span>×{rarityMultiplier}</span>
                          </div>
                          {protectionLevel[0] > 0 && (
                            <div className="flex justify-between">
                              <span>Proteção ({protectionLevel[0]} dias)</span>
                              <span>+{protectionCost} Kz</span>
                            </div>
                          )}
                          {useCustomColor && (
                            <div className="flex justify-between">
                              <span>Cor personalizada</span>
                              <span>+{customColorCost} Kz</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatPrice(totalCost)} Kz</span>
                          </div>
                          {fee > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Taxa de processamento ({selectedMethod?.fee}%)</span>
                              <span>+{formatPrice(fee)} Kz</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">{formatPrice(finalCost)} Kz</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 space-y-6">
                    {/* Market Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Análise de Mercado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Valor Estimado</Label>
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(estimatedValue)} Kz
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {estimatedValue > totalCost ? (
                                <span className="text-green-500">Abaixo do valor estimado</span>
                              ) : (
                                <span className="text-red-500">Acima do valor estimado</span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Nível de Procura</Label>
                            <div className="space-y-1">
                              <Progress value={demandLevel} className="h-2" />
                              <div className="text-sm text-muted-foreground">
                                {demandLevel > 70 ? 'Alta procura' : demandLevel > 30 ? 'Procura moderada' : 'Baixa procura'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div className="text-center">
                            <div className="text-lg font-bold">{formatPrice(pixelData.views)}</div>
                            <div className="text-xs text-muted-foreground">Visualizações</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{pixelData.likes}</div>
                            <div className="text-xs text-muted-foreground">Gostos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{pixelData.history.length}</div>
                            <div className="text-xs text-muted-foreground">Transações</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Price Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Histórico de Preços (30 dias)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 flex items-end justify-between gap-1">
                          {priceHistory.map((point, index) => (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="bg-primary/20 hover:bg-primary/40 transition-colors cursor-pointer rounded-t"
                                    style={{
                                      height: `${(point.price / Math.max(...priceHistory.map(p => p.price))) * 100}%`,
                                      minHeight: '4px'
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <div className="font-bold">{formatPrice(point.price)} Kz</div>
                                    <div className="text-xs">{formatDate(point.date)}</div>
                                    <div className="text-xs">Volume: {point.volume}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Histórico de Transações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pixelData.history.length > 0 ? (
                          <div className="space-y-3">
                            {pixelData.history.map((transaction) => (
                              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-primary/10">
                                    {transaction.type === 'purchase' && <CreditCard className="h-4 w-4" />}
                                    {transaction.type === 'sale' && <TrendingUp className="h-4 w-4" />}
                                    {transaction.type === 'color_change' && <Palette className="h-4 w-4" />}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {transaction.type === 'purchase' && 'Compra'}
                                      {transaction.type === 'sale' && 'Venda'}
                                      {transaction.type === 'color_change' && 'Alteração de Cor'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDate(transaction.date)} • {transaction.buyer}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{formatPrice(transaction.price)} Kz</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <div>Nenhuma transação registada</div>
                            <div className="text-sm">Este pixel ainda não foi transacionado</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="similar" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Pixels Similares na Região
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {similarPixels.map((pixel, index) => (
                            <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                <div 
                                  className="w-8 h-8 rounded border"
                                  style={{ backgroundColor: pixel.color }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">({pixel.x}, {pixel.y})</div>
                                  <div className="text-sm text-muted-foreground">{pixel.region}</div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <Badge className={cn("text-xs", rarityConfig[pixel.rarity].color)}>
                                  {rarityConfig[pixel.rarity].label}
                                </Badge>
                                <div className="font-bold text-primary">{formatPrice(pixel.price)} Kz</div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>{pixel.views} views</span>
                                <span>{pixel.likes} likes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Processamento: {selectedMethod?.processingTime}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={!canAfford || isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Comprar Agora
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}