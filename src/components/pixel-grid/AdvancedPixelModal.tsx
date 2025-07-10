'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin, Coins, Gift, Sparkles, Paintbrush, Upload, DollarSign, CreditCard,
  Shield, Eye, Heart, Star, ShoppingCart, Loader2, Trophy, BookOpen, Tag,
  Calendar, BarChart3, Clock, Lock, Unlock, Users, Globe, ExternalLink,
  Brush, Palette, Image as ImageIcon, Wand2, Layers, RotateCcw, Save,
  Download, Share2, MessageSquare, Send, Gavel, TrendingUp, Zap, Crown,
  Settings, Filter, Blend, Contrast, Brightness, Saturation, Hue, Volume2,
  Play, Pause, SkipForward, SkipBack, Mic, Camera, Video, Music, Headphones,
  Radio, Tv, Monitor, Smartphone, Tablet, Laptop, Mouse, Keyboard, Gamepad2,
  Joystick, Target, Crosshair, Move, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Copy, Paste, Scissors, Undo2, Redo2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  history: Array<{ owner: string; date: string | Date; price: number; action?: 'purchase' | 'sale' | 'transfer' }>;
  features?: string[];
  description?: string;
  tags?: string[];
  isOwnedByCurrentUser?: boolean;
  isForSaleBySystem?: boolean;
  title?: string;
  isForSaleByOwner?: boolean;
  salePrice?: number;
  gpsCoords?: { lat: number; lon: number; } | null;
}

interface AdvancedPixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: PixelData | null;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: PixelData, paymentMethod: string, customizations: any) => Promise<boolean>;
  onSendOffer?: (pixelData: PixelData, offer: any) => Promise<boolean>;
}

const rarityStyles = {
  common: { text: 'text-gray-400', border: 'border-gray-400/50', bg: 'bg-gray-400/10', price: 1 },
  uncommon: { text: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10', price: 2.5 },
  rare: { text: 'text-blue-400', border: 'border-blue-400/50', bg: 'bg-blue-400/10', price: 5 },
  epic: { text: 'text-purple-400', border: 'border-purple-400/50', bg: 'bg-purple-400/10', price: 10 },
  legendary: { text: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10', price: 25 },
};

const effectPresets = [
  { name: 'Nenhum', value: 'none', icon: <Sparkles className="h-4 w-4" /> },
  { name: 'Brilho', value: 'glow', icon: <Zap className="h-4 w-4" /> },
  { name: 'Pulsação', value: 'pulse', icon: <Heart className="h-4 w-4" /> },
  { name: 'Rotação', value: 'rotate', icon: <RotateCw className="h-4 w-4" /> },
  { name: 'Tremulação', value: 'shake', icon: <Move className="h-4 w-4" /> },
  { name: 'Zoom', value: 'zoom', icon: <ZoomIn className="h-4 w-4" /> },
  { name: 'Arco-íris', value: 'rainbow', icon: <Palette className="h-4 w-4" /> },
  { name: 'Partículas', value: 'particles', icon: <Sparkles className="h-4 w-4" /> },
];

const soundEffects = [
  { name: 'Silêncio', value: 'none', icon: <Volume2 className="h-4 w-4" /> },
  { name: 'Clique', value: 'click', icon: <Mouse className="h-4 w-4" /> },
  { name: 'Sino', value: 'bell', icon: <Music className="h-4 w-4" /> },
  { name: 'Whoosh', value: 'whoosh', icon: <Headphones className="h-4 w-4" /> },
  { name: 'Pop', value: 'pop', icon: <Radio className="h-4 w-4" /> },
  { name: 'Chime', value: 'chime', icon: <Tv className="h-4 w-4" /> },
];

export default function AdvancedPixelModal({
  isOpen,
  onClose,
  pixelData,
  userCredits,
  userSpecialCredits,
  onPurchase,
  onSendOffer,
}: AdvancedPixelModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [customColor, setCustomColor] = useState('#D4A757');
  const [pixelTitle, setPixelTitle] = useState('');
  const [pixelDescription, setPixelDescription] = useState('');
  const [pixelTags, setPixelTags] = useState('');
  const [pixelUrl, setPixelUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [selectedSound, setSelectedSound] = useState('none');
  const [effectIntensity, setEffectIntensity] = useState([50]);
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [hue, setHue] = useState([0]);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [enableInteraction, setEnableInteraction] = useState(false);
  const [enableSound, setEnableSound] = useState(false);
  const [boostLevel, setBoostLevel] = useState(0);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerExpiry, setOfferExpiry] = useState('24');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomColor(pixelData.color || '#D4A757');
      setPixelTitle(pixelData.title || `Pixel em ${pixelData.region}`);
      setPixelDescription(pixelData.description || '');
      setActiveTab(pixelData.isOwnedByCurrentUser ? 'edit' : 'overview');
    }
  }, [pixelData]);

  const calculateFinalPrice = useCallback(() => {
    if (!pixelData) return 0;
    const basePrice = 1; // 1€ base
    const rarityMultiplier = rarityStyles[pixelData.rarity].price;
    const boostCost = boostLevel * 50;
    const effectsCost = selectedEffect !== 'none' ? 25 : 0;
    const soundCost = selectedSound !== 'none' ? 15 : 0;
    const animationCost = enableAnimation ? 30 : 0;
    const interactionCost = enableInteraction ? 40 : 0;
    
    return basePrice * rarityMultiplier + boostCost + effectsCost + soundCost + animationCost + interactionCost;
  }, [pixelData, boostLevel, selectedEffect, selectedSound, enableAnimation, enableInteraction]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Ficheiro Muito Grande",
          description: "A imagem deve ter menos de 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawPixelPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = customColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%) hue-rotate(${hue[0]}deg)`;

    // Draw uploaded image if exists
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = uploadedImage;
    }

    // Apply effects (simplified representation)
    if (selectedEffect !== 'none') {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(255, 255, 255, ${effectIntensity[0] / 100 * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [customColor, uploadedImage, brightness, contrast, saturation, hue, selectedEffect, effectIntensity]);

  useEffect(() => {
    drawPixelPreview();
  }, [drawPixelPreview]);

  const handlePurchaseClick = async () => {
    if (!pixelData) return;

    setIsProcessing(true);
    const customizations = {
      color: customColor,
      title: pixelTitle,
      description: pixelDescription,
      tags: pixelTags.split(',').map(tag => tag.trim()).filter(Boolean),
      url: pixelUrl,
      image: uploadedImage,
      effect: selectedEffect,
      sound: selectedSound,
      effectIntensity: effectIntensity[0],
      brightness: brightness[0],
      contrast: contrast[0],
      saturation: saturation[0],
      hue: hue[0],
      enableAnimation,
      enableInteraction,
      enableSound,
      boostLevel,
    };

    const success = await onPurchase(pixelData, paymentMethod, customizations);
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

  const handleSendOffer = async () => {
    if (!pixelData || !onSendOffer) return;

    const offer = {
      amount: parseFloat(offerAmount),
      message: offerMessage,
      expiryHours: parseInt(offerExpiry),
      paymentMethod,
    };

    setIsProcessing(true);
    const success = await onSendOffer(pixelData, offer);
    setIsProcessing(false);

    if (success) {
      toast({
        title: 'Oferta Enviada!',
        description: `A sua oferta de ${offerAmount}€ foi enviada ao proprietário.`,
      });
      setOfferAmount('');
      setOfferMessage('');
    } else {
      toast({
        title: 'Erro ao Enviar Oferta',
        description: 'Não foi possível enviar a oferta. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const canAfford = () => {
    const finalPrice = calculateFinalPrice();
    if (paymentMethod === 'credits') {
      return userCredits >= finalPrice;
    }
    if (paymentMethod === 'special_credits') {
      return userSpecialCredits >= finalPrice;
    }
    return true;
  };

  if (!pixelData) return null;

  const finalPrice = calculateFinalPrice();
  const rarityStyle = rarityStyles[pixelData.rarity];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl text-gradient-gold">
            <MapPin className="h-6 w-6" />
            {pixelData.title || `Pixel (${pixelData.x}, ${pixelData.y})`}
            <Badge className={cn("text-xs", rarityStyle.text, rarityStyle.border)}>
              {pixelData.rarity}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {pixelData.description || `Pixel avançado em ${pixelData.region} com ferramentas profissionais de edição.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-6 h-12 bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="edit">Editor</TabsTrigger>
                <TabsTrigger value="effects">Efeitos</TabsTrigger>
                <TabsTrigger value="boost">Promoção</TabsTrigger>
                <TabsTrigger value="offer" disabled={pixelData.isOwnedByCurrentUser || !pixelData.owner}>Oferta</TabsTrigger>
                <TabsTrigger value="purchase" disabled={pixelData.isOwnedByCurrentUser}>Comprar</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pixel Preview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            Preview do Pixel
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                          <canvas
                            ref={canvasRef}
                            width={200}
                            height={200}
                            className="border border-border rounded-lg shadow-lg"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Coordenadas: ({pixelData.x}, {pixelData.y})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Região: {pixelData.region}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pixel Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Informações do Pixel
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Proprietário</Label>
                              <p className="font-medium">{pixelData.owner || 'Sistema'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Preço Base</Label>
                              <p className="font-medium text-primary">{finalPrice.toFixed(2)}€</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Visualizações</Label>
                              <p className="font-medium">{pixelData.views.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Curtidas</Label>
                              <p className="font-medium">{pixelData.likes.toLocaleString()}</p>
                            </div>
                          </div>

                          {pixelData.features && pixelData.features.length > 0 && (
                            <div>
                              <Label className="text-muted-foreground">Características</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {pixelData.features.map((feature, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {pixelData.gpsCoords && (
                            <div>
                              <Label className="text-muted-foreground">Coordenadas GPS</Label>
                              <p className="font-mono text-sm">
                                {pixelData.gpsCoords.lat.toFixed(4)}, {pixelData.gpsCoords.lon.toFixed(4)}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* History */}
                    {pixelData.history && pixelData.history.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Histórico de Transações
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {pixelData.history.map((entry, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{entry.owner.substring(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{entry.owner}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(entry.date).toLocaleDateString('pt-PT')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary">{entry.price}€</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {entry.action || 'compra'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="edit" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Basic Editing */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Paintbrush className="h-4 w-4 text-primary" />
                            Edição Básica
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="pixelTitle">Título do Pixel</Label>
                            <Input
                              id="pixelTitle"
                              value={pixelTitle}
                              onChange={(e) => setPixelTitle(e.target.value)}
                              placeholder="Dê um nome ao seu pixel"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="pixelDescription">Descrição</Label>
                            <Textarea
                              id="pixelDescription"
                              value={pixelDescription}
                              onChange={(e) => setPixelDescription(e.target.value)}
                              placeholder="Descreva o seu pixel..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="pixelTags">Tags (separadas por vírgula)</Label>
                            <Input
                              id="pixelTags"
                              value={pixelTags}
                              onChange={(e) => setPixelTags(e.target.value)}
                              placeholder="arte, paisagem, portugal"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="pixelUrl">URL (opcional)</Label>
                            <Input
                              id="pixelUrl"
                              value={pixelUrl}
                              onChange={(e) => setPixelUrl(e.target.value)}
                              placeholder="https://exemplo.com"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="customColor">Cor Principal</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                id="customColor"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-12 h-10 rounded border border-border cursor-pointer"
                              />
                              <Input
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Advanced Editing */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            Edição Avançada
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Imagem Personalizada</Label>
                            <div className="mt-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadedImage ? 'Alterar Imagem' : 'Carregar Imagem'}
                              </Button>
                            </div>
                            {uploadedImage && (
                              <div className="mt-2 text-center">
                                <img
                                  src={uploadedImage}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover rounded border mx-auto"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <Label>Brilho: {brightness[0]}%</Label>
                            <Slider
                              value={brightness}
                              onValueChange={setBrightness}
                              min={0}
                              max={200}
                              step={5}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Contraste: {contrast[0]}%</Label>
                            <Slider
                              value={contrast}
                              onValueChange={setContrast}
                              min={0}
                              max={200}
                              step={5}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Saturação: {saturation[0]}%</Label>
                            <Slider
                              value={saturation}
                              onValueChange={setSaturation}
                              min={0}
                              max={200}
                              step={5}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Matiz: {hue[0]}°</Label>
                            <Slider
                              value={hue}
                              onValueChange={setHue}
                              min={0}
                              max={360}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Visual Effects */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Efeitos Visuais
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Efeito Principal</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {effectPresets.map((effect) => (
                                <Button
                                  key={effect.value}
                                  variant={selectedEffect === effect.value ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setSelectedEffect(effect.value)}
                                  className="justify-start"
                                >
                                  {effect.icon}
                                  <span className="ml-2">{effect.name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {selectedEffect !== 'none' && (
                            <div>
                              <Label>Intensidade do Efeito: {effectIntensity[0]}%</Label>
                              <Slider
                                value={effectIntensity}
                                onValueChange={setEffectIntensity}
                                min={0}
                                max={100}
                                step={5}
                                className="mt-2"
                              />
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Animação</Label>
                              <Switch
                                checked={enableAnimation}
                                onCheckedChange={setEnableAnimation}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label>Interatividade</Label>
                              <Switch
                                checked={enableInteraction}
                                onCheckedChange={setEnableInteraction}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Audio Effects */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            Efeitos Sonoros
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Ativar Som</Label>
                            <Switch
                              checked={enableSound}
                              onCheckedChange={setEnableSound}
                            />
                          </div>

                          {enableSound && (
                            <div>
                              <Label>Som de Interação</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {soundEffects.map((sound) => (
                                  <Button
                                    key={sound.value}
                                    variant={selectedSound === sound.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedSound(sound.value)}
                                    className="justify-start"
                                  >
                                    {sound.icon}
                                    <span className="ml-2">{sound.name}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Custo dos Efeitos</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Efeito Visual:</span>
                                <span>{selectedEffect !== 'none' ? '+25€' : 'Grátis'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Som:</span>
                                <span>{enableSound && selectedSound !== 'none' ? '+15€' : 'Grátis'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Animação:</span>
                                <span>{enableAnimation ? '+30€' : 'Grátis'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Interatividade:</span>
                                <span>{enableInteraction ? '+40€' : 'Grátis'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="boost" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Sistema de Promoção
                        </CardTitle>
                        <CardDescription>
                          Aumente a visibilidade do seu pixel com diferentes níveis de promoção
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Nível de Promoção: {boostLevel}</Label>
                          <Slider
                            value={[boostLevel]}
                            onValueChange={(value) => setBoostLevel(value[0])}
                            min={0}
                            max={5}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div className="grid gap-3">
                          {[0, 1, 2, 3, 4, 5].map((level) => (
                            <Card
                              key={level}
                              className={cn(
                                "p-4 cursor-pointer transition-all",
                                boostLevel === level ? "border-primary bg-primary/5" : "hover:border-primary/50"
                              )}
                              onClick={() => setBoostLevel(level)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {level === 0 ? 'Sem Promoção' : `Nível ${level}`}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {level === 0 && "Visibilidade padrão"}
                                    {level === 1 && "Destaque básico"}
                                    {level === 2 && "Destaque melhorado"}
                                    {level === 3 && "Destaque premium + Featured"}
                                    {level === 4 && "Destaque máximo + Trending"}
                                    {level === 5 && "Destaque lendário + Topo da página"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary">
                                    {level === 0 ? 'Grátis' : `+${level * 50}€`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">24h</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="offer" className="space-y-6 mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-primary" />
                          Enviar Oferta ao Proprietário
                        </CardTitle>
                        <CardDescription>
                          Faça uma oferta para adquirir este pixel do proprietário atual
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="offerAmount">Valor da Oferta (€)</Label>
                            <Input
                              id="offerAmount"
                              type="number"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="offerExpiry">Validade (horas)</Label>
                            <Select value={offerExpiry} onValueChange={setOfferExpiry}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24">24 horas</SelectItem>
                                <SelectItem value="48">48 horas</SelectItem>
                                <SelectItem value="72">72 horas</SelectItem>
                                <SelectItem value="168">1 semana</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="offerMessage">Mensagem (opcional)</Label>
                          <Textarea
                            id="offerMessage"
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            placeholder="Explique porque quer este pixel..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Método de Pagamento</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              variant={paymentMethod === 'credits' ? 'default' : 'outline'}
                              onClick={() => setPaymentMethod('credits')}
                              className="justify-start"
                            >
                              <Coins className="h-4 w-4 mr-2" />
                              Créditos
                            </Button>
                            <Button
                              variant={paymentMethod === 'real_money' ? 'default' : 'outline'}
                              onClick={() => setPaymentMethod('real_money')}
                              className="justify-start"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Dinheiro Real
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={handleSendOffer}
                          disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Enviar Oferta
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="purchase" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Price Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Resumo do Preço
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Preço base:</span>
                              <span>1.00€</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Multiplicador de raridade ({pixelData.rarity}):</span>
                              <span>×{rarityStyle.price}</span>
                            </div>
                            {boostLevel > 0 && (
                              <div className="flex justify-between">
                                <span>Promoção (Nível {boostLevel}):</span>
                                <span>+{boostLevel * 50}€</span>
                              </div>
                            )}
                            {selectedEffect !== 'none' && (
                              <div className="flex justify-between">
                                <span>Efeito visual:</span>
                                <span>+25€</span>
                              </div>
                            )}
                            {enableSound && selectedSound !== 'none' && (
                              <div className="flex justify-between">
                                <span>Efeito sonoro:</span>
                                <span>+15€</span>
                              </div>
                            )}
                            {enableAnimation && (
                              <div className="flex justify-between">
                                <span>Animação:</span>
                                <span>+30€</span>
                              </div>
                            )}
                            {enableInteraction && (
                              <div className="flex justify-between">
                                <span>Interatividade:</span>
                                <span>+40€</span>
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-primary">{finalPrice.toFixed(2)}€</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Method */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Método de Pagamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <Button
                              variant={paymentMethod === 'credits' ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => setPaymentMethod('credits')}
                            >
                              <Coins className="h-4 w-4 mr-2" />
                              Créditos ({userCredits.toLocaleString()})
                            </Button>
                            <Button
                              variant={paymentMethod === 'special_credits' ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => setPaymentMethod('special_credits')}
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Créditos Especiais ({userSpecialCredits})
                            </Button>
                            <Button
                              variant={paymentMethod === 'real_money' ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => setPaymentMethod('real_money')}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Dinheiro Real
                            </Button>
                          </div>

                          <Button
                            size="lg"
                            className="w-full"
                            onClick={handlePurchaseClick}
                            disabled={!canAfford() || isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 mr-2" />
                            )}
                            {canAfford() ? 'Confirmar Compra' : 'Saldo Insuficiente'}
                          </Button>

                          {!canAfford() && (
                            <p className="text-sm text-destructive text-center">
                              Precisa de mais {(finalPrice - (paymentMethod === 'credits' ? userCredits : userSpecialCredits)).toFixed(2)}€ para esta compra.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}