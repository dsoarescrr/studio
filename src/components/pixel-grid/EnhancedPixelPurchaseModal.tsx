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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin, Coins, Gift, Sparkles, Paintbrush, TextCursorInput, Upload,
  DollarSign, CreditCard, Shield, Eye, Heart, Star, ShoppingCart, Loader2,
  Trophy, BookOpen, Tag, Calendar, BarChart3, Clock, Lock, Unlock, Users,
  Globe, ExternalLink, Brush, TrendingUp, TrendingDown, Zap, MessageSquare,
  Share2, Bookmark, AlertTriangle, Info, ChevronRight, LineChart, PieChart,
  Target, Flame, Crown, Gem, Activity, Image as ImageIcon, Link as LinkIcon,
  Plus, Minus, RotateCcw, Maximize2, Settings, Bell, Flag, ThumbsUp,
  Calculator, Wallet, History, Camera, Palette as PaletteIcon
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
  common: { text: 'text-gray-400', border: 'border-gray-400/50', bg: 'bg-gray-400/10', gradient: 'from-gray-400/20 to-gray-400/5' },
  uncommon: { text: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10', gradient: 'from-green-400/20 to-green-400/5' },
  rare: { text: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', gradient: 'from-blue-400/20 to-blue-400/5' },
  epic: { text: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10', gradient: 'from-purple-400/20 to-purple-400/5' },
  legendary: { text: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10', gradient: 'from-amber-400/20 to-amber-400/5' },
};

// Mock data for enhanced features
const mockNeighborPixels = [
  { x: 244, y: 156, owner: 'ArtCollector', price: 120, rarity: 'rare' },
  { x: 246, y: 156, owner: 'PixelMaster', price: 95, rarity: 'uncommon' },
  { x: 245, y: 155, owner: 'ColorWizard', price: 180, rarity: 'epic' },
  { x: 245, y: 157, owner: 'Available', price: 75, rarity: 'common' },
];

const mockMarketAnalysis = {
  regionAvgPrice: 142,
  priceChange24h: 8.5,
  totalTransactions: 1247,
  lastTransaction: new Date(Date.now() - 2 * 60 * 60 * 1000),
  priceHistory: [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 120 },
    { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 135 },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 150 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 142 },
  ]
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
  const [pixelDescription, setPixelDescription] = useState('');
  const [pixelTags, setPixelTags] = useState('');
  const [pixelUrl, setPixelUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [offerAmount, setOfferAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [makePublic, setMakePublic] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomColor(pixelData.color || '#D4A757');
      setPixelTitle(pixelData.title || `Pixel em ${pixelData.region}`);
      setPixelDescription(pixelData.description || '');
      setActiveTab(pixelData.isOwnedByCurrentUser ? 'details' : 'purchase');
    }
  }, [pixelData]);

  const handlePurchaseClick = async () => {
    if (!pixelData) return;

    setIsProcessing(true);
    const success = await onPurchase(pixelData, paymentMethod, {
      color: customColor,
      title: pixelTitle,
      description: pixelDescription,
      tags: pixelTags.split(',').map(tag => tag.trim()).filter(Boolean),
      url: pixelUrl,
      notifications: enableNotifications,
      public: makePublic,
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

  const handleMakeOffer = () => {
    toast({
      title: 'Oferta Enviada',
      description: `Oferta de ${offerAmount} créditos enviada ao proprietário.`,
    });
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
    return true;
  }, [pixelData, paymentMethod, userCredits, userSpecialCredits]);

  if (!pixelData) return null;

  const {
    x, y, owner, price, rarity, region, description, title, tags, loreSnippet, features,
    isOwnedByCurrentUser, isForSaleBySystem, history, views, likes, gpsCoords
  } = pixelData;
  const currentPrice = pixelData.salePrice || price;
  const rarityStyle = rarityStyles[rarity];

  const renderInfoRow = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between text-sm py-2 border-b border-border/50 hover:bg-muted/20 transition-colors rounded px-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <DialogTitle className="flex items-center gap-3 font-headline text-2xl text-gradient-gold">
              <div className={cn("p-2 rounded-xl", rarityStyle.bg, rarityStyle.text)}>
                <MapPin className="h-6 w-6" />
              </div>
              {title || `Pixel (${x}, ${y})`}
              {rarity === 'legendary' && <Crown className="h-6 w-6 text-amber-400 animate-pulse" />}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 flex items-center gap-4">
              <span>{description || `Pixel único em ${region} com coordenadas (${x}, ${y})`}</span>
              <Badge className={cn("text-xs", rarityStyle.text, rarityStyle.border, rarityStyle.bg)}>
                {rarity.toUpperCase()}
              </Badge>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left Panel: Pixel Preview & Info */}
          <div className="lg:col-span-2 border-r border-border">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Pixel Preview */}
                <Card className={cn("border-2 transition-all duration-500", rarityStyle.border)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Preview do Pixel</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Partilhar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="relative aspect-square max-w-xs mx-auto mb-4">
                      <div 
                        className={cn("w-full h-full rounded-lg border-4 transition-all duration-300 shadow-lg", 
                          rarityStyle.border, `bg-gradient-to-br ${rarityStyle.gradient}`)}
                        style={{ backgroundColor: customColor }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white drop-shadow-lg">
                            <div className="text-2xl font-bold">({x}, {y})</div>
                            <div className="text-sm opacity-80">{region}</div>
                          </div>
                        </div>
                        {rarity === 'legendary' && (
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <div className="font-bold">{views.toLocaleString('pt-PT')}</div>
                        <div className="text-xs text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                        <div className="font-bold">{likes.toLocaleString('pt-PT')}</div>
                        <div className="text-xs text-muted-foreground">Gostos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Análise de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-lg font-bold text-primary">{mockMarketAnalysis.regionAvgPrice}€</div>
                        <div className="text-xs text-muted-foreground">Preço Médio Região</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          +{mockMarketAnalysis.priceChange24h}%
                        </div>
                        <div className="text-xs text-muted-foreground">Variação 24h</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-lg font-bold text-blue-500">{mockMarketAnalysis.totalTransactions}</div>
                        <div className="text-xs text-muted-foreground">Transações</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                        <div className="text-lg font-bold text-purple-500">Alta</div>
                        <div className="text-xs text-muted-foreground">Procura</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <LineChart className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">Gráfico de Preços (30 dias)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Neighborhood Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Píxeis Vizinhos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockNeighborPixels.map((neighbor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded border" />
                            <div>
                              <div className="text-sm font-medium">({neighbor.x}, {neighbor.y})</div>
                              <div className="text-xs text-muted-foreground">{neighbor.owner}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{neighbor.price}€</div>
                            <Badge variant="outline" className="text-xs">
                              {neighbor.rarity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Informações Detalhadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {renderInfoRow(<Users className="h-4 w-4" />, "Proprietário", owner || 'Sistema')}
                    {renderInfoRow(<Globe className="h-4 w-4" />, "Região", region)}
                    {renderInfoRow(<MapPin className="h-4 w-4" />, "Coordenadas GPS", 
                      gpsCoords ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lon.toFixed(4)}` : "N/A")}
                    {renderInfoRow(<Calendar className="h-4 w-4" />, "Última Venda", 
                      pixelData.lastSold ? pixelData.lastSold.toLocaleDateString('pt-PT') : 'Nunca vendido')}
                    {renderInfoRow(<Activity className="h-4 w-4" />, "Atividade", `${views} visualizações, ${likes} gostos`)}
                    {features && renderInfoRow(<Star className="h-4 w-4" />, "Características Especiais", features.length)}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel: Actions */}
          <div className="lg:col-span-1">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="purchase" disabled={isOwnedByCurrentUser}>
                      {isOwnedByCurrentUser ? 'Comprado' : 'Comprar'}
                    </TabsTrigger>
                    <TabsTrigger value="details">Personalizar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="purchase" className="space-y-4 pt-4">
                    {/* Price Display */}
                    <Card className="text-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <CardContent className="p-6">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Preço Atual</p>
                          <p className="text-4xl font-bold text-gradient-gold">{currentPrice}€</p>
                          <p className="text-xs text-muted-foreground">créditos</p>
                          {mockMarketAnalysis.priceChange24h > 0 && (
                            <Badge className="bg-green-500 text-white">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{mockMarketAnalysis.priceChange24h}% (24h)
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Método de Pagamento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant={paymentMethod === 'credits' ? 'default' : 'outline'}
                          className="w-full justify-between"
                          onClick={() => setPaymentMethod('credits')}
                        >
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 mr-2" />
                            Créditos
                          </div>
                          <span className="text-xs">({userCredits.toLocaleString('pt-PT')})</span>
                        </Button>
                        
                        <Button
                          variant={paymentMethod === 'special_credits' ? 'default' : 'outline'}
                          className="w-full justify-between"
                          onClick={() => setPaymentMethod('special_credits')}
                        >
                          <div className="flex items-center">
                            <Gift className="h-4 w-4 mr-2" />
                            Créditos Especiais
                          </div>
                          <span className="text-xs">({userSpecialCredits})</span>
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Dinheiro Real (Em breve)
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Make Offer */}
                    {!isOwnedByCurrentUser && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Fazer Oferta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Valor da oferta"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                            />
                            <Button variant="outline" onClick={handleMakeOffer}>
                              Oferecer
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            O proprietário será notificado da sua oferta
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Purchase Button */}
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                      onClick={handlePurchaseClick} 
                      disabled={!canAfford || isProcessing || isOwnedByCurrentUser}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      ) : (
                        <ShoppingCart className="mr-2 h-5 w-5" />
                      )}
                      {isOwnedByCurrentUser ? 'Já é Seu' : 
                       canAfford ? 'Confirmar Compra' : 'Créditos Insuficientes'}
                    </Button>

                    {/* Advanced Options */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Opções Avançadas
                        <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", 
                          showAdvancedOptions && "rotate-90")} />
                      </Button>
                      
                      {showAdvancedOptions && (
                        <div className="mt-3 space-y-3 p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Notificações</Label>
                            <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Tornar Público</Label>
                            <Switch checked={makePublic} onCheckedChange={setMakePublic} />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pixelTitle" className="text-sm font-medium">Título do Pixel</Label>
                        <Input 
                          id="pixelTitle" 
                          value={pixelTitle} 
                          onChange={(e) => setPixelTitle(e.target.value)} 
                          placeholder="Dê um nome ao seu pixel"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="pixelDescription" className="text-sm font-medium">Descrição</Label>
                        <Textarea
                          id="pixelDescription"
                          value={pixelDescription}
                          onChange={(e) => setPixelDescription(e.target.value)}
                          placeholder="Descreva o seu pixel..."
                          className="mt-1 resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customColor" className="text-sm font-medium">Cor Personalizada</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input 
                            type="color" 
                            id="customColor" 
                            value={customColor} 
                            onChange={(e) => setCustomColor(e.target.value)} 
                            className="w-16 h-10 p-1 rounded"
                          />
                          <Input 
                            value={customColor} 
                            onChange={(e) => setCustomColor(e.target.value)} 
                            placeholder="#000000"
                            className="flex-1"
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setCustomColor('#D4A757')}>
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restaurar cor padrão</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="pixelTags" className="text-sm font-medium">Tags</Label>
                        <Input
                          id="pixelTags"
                          value={pixelTags}
                          onChange={(e) => setPixelTags(e.target.value)}
                          placeholder="arte, paisagem, histórico (separadas por vírgulas)"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pixelUrl" className="text-sm font-medium">Link Personalizado</Label>
                        <Input
                          id="pixelUrl"
                          value={pixelUrl}
                          onChange={(e) => setPixelUrl(e.target.value)}
                          placeholder="https://exemplo.com"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pixelImage" className="text-sm font-medium">Imagem (1x1)</Label>
                        <Input 
                          id="pixelImage" 
                          type="file" 
                          accept="image/png, image/jpeg, image/gif" 
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Máximo 1MB. A imagem será redimensionada para 1x1 pixel.
                        </p>
                      </div>

                      <Separator />

                      {isOwnedByCurrentUser && (
                        <Button className="w-full bg-gradient-to-r from-green-600 to-green-500">
                          <Star className="h-4 w-4 mr-2"/>
                          Guardar Alterações
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}