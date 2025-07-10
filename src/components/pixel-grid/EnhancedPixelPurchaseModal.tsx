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
import { useUserStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  Globe, ExternalLink, Brush, TrendingUp, TrendingDown, Zap, MessageSquare, Compass,
  Share2, Bookmark, AlertTriangle, Info, ChevronRight, LineChart, PieChart,
  Target, Flame, Crown, Gem, Activity, Image as ImageIcon, Link as LinkIcon,
  Plus, Minus, RotateCcw, Maximize2, Settings, Bell, Flag, ThumbsUp, Layers, Palette,
  Calculator, Wallet, History, Camera, Palette as PaletteIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { Pixel3D } from '@/components/ui/3d-pixel';

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
  userCredits: propUserCredits,
  userSpecialCredits: propUserSpecialCredits,
  onPurchase,
}: EnhancedPixelPurchaseModalProps) {
  const { credits: storeCredits, specialCredits: storeSpecialCredits, removeCredits, removeSpecialCredits } = useUserStore();
  const userCredits = propUserCredits || storeCredits;
  const userSpecialCredits = propUserSpecialCredits || storeSpecialCredits;
  
  const [activeTab, setActiveTab] = useState('purchase');
  const [customColor, setCustomColor] = useState('#D4A757');
  const [pixelTitle, setPixelTitle] = useState('');
  const [pixelDescription, setPixelDescription] = useState('');
  const [pixelTags, setPixelTags] = useState('');
  const [pixelTagsArray, setPixelTagsArray] = useState<string[]>([]);
  const [pixelUrl, setPixelUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [offerAmount, setOfferAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playPurchaseSound, setPlayPurchaseSound] = useState(false);
  const [playErrorSound, setPlayErrorSound] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [showPixelHistory, setShowPixelHistory] = useState(false);
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false);
  const [makePublic, setMakePublic] = useState(true);
  const [pixelProtection, setPixelProtection] = useState(false);
  const [customEffects, setCustomEffects] = useState<string[]>([]);
  const [pixelRarity, setPixelRarity] = useState<string>('');
  const [pixelValue, setPixelValue] = useState<number[]>([50]);
  const [pixelImage, setPixelImage] = useState<File | null>(null);
  const [pixelImagePreview, setPixelImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomColor(pixelData.color || '#D4A757');
      setPixelTitle(pixelData.title || `Pixel em ${pixelData.region}`);
      setPixelDescription(pixelData.description || '');
      setPixelTagsArray(pixelData.tags || []);
      setPixelTags((pixelData.tags || []).join(', '));
      setActiveTab(pixelData.isOwnedByCurrentUser ? 'details' : 'purchase');
      setPixelRarity(pixelData.rarity || 'common');
      setPixelProtection(pixelData.isProtected || false);
      
      // Set initial pixel value based on rarity and region
      const baseValue = pixelData.price || 50;
      const rarityMultiplier = 
        pixelData.rarity === 'legendary' ? 2.0 :
        pixelData.rarity === 'epic' ? 1.5 :
        pixelData.rarity === 'rare' ? 1.2 :
        pixelData.rarity === 'uncommon' ? 1.1 : 1.0;
      
      setPixelValue([baseValue * rarityMultiplier]);
    }
  }, [pixelData]);

  // Handle image upload preview
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPixelImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPixelImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Imagem Carregada",
        description: "A imagem será redimensionada para 1x1 pixel.",
      });
    }
  };
  
  // Handle tag input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPixelTags(e.target.value);
    setPixelTagsArray(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean));
  };
  
  // Toggle custom effects
  const toggleEffect = (effect: string) => {
    setCustomEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect) 
        : [...prev, effect]
    );
  };
  
  const handlePurchaseClick = async () => {
    if (!pixelData) return;

    // Deduct credits from store
    if (paymentMethod === 'credits') {
      removeCredits(pixelData.price);
    } else if (paymentMethod === 'special_credits') {
      removeSpecialCredits(pixelData.price);
    }
    
    setIsProcessing(true);
    const success = await onPurchase(pixelData, paymentMethod, {
      color: customColor,
      title: pixelTitle,
      description: pixelDescription,
      tags: pixelTagsArray,
      url: pixelUrl,
      notifications: enableNotifications,
      public: makePublic,
      protection: pixelProtection,
      effects: customEffects,
      rarity: pixelRarity,
      value: pixelValue[0],
      image: pixelImage,
    });
    setIsProcessing(false);

    if (success) {
      setShowConfetti(true);
      setPlayPurchaseSound(true);
      toast({
        title: 'Compra Bem-Sucedida!',
        description: `Parabéns! O pixel (${pixelData.x}, ${pixelData.y}) é seu.`,
      });
    } else {
      setPlayErrorSound(true);
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
      <SoundEffect src={SOUND_EFFECTS.PURCHASE} play={playPurchaseSound} onEnd={() => setPlayPurchaseSound(false)} />
      <SoundEffect src={SOUND_EFFECTS.ERROR} play={playErrorSound} onEnd={() => setPlayErrorSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
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
                          rarityStyle.border, `bg-gradient-to-br ${rarityStyle.gradient}`, 
                          show3DPreview ? 'opacity-0' : 'opacity-100')}
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
                      
                      {/* 3D Pixel Preview */}
                      <div className={cn(
                        "absolute inset-0 transition-opacity duration-300",
                        show3DPreview ? 'opacity-100' : 'opacity-0'
                      )}>
                        <Pixel3D 
                          color={customColor} 
                          autoRotate={true}
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShow3DPreview(!show3DPreview)}
                      >
                        {show3DPreview ? '2D' : '3D'} Visualização
                      </Button>
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
                        <div className="text-lg font-bold text-primary animate-pulse">{mockMarketAnalysis.regionAvgPrice}€</div>
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
                        <div className="text-lg font-bold text-purple-500 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 mr-1" />Alta
                        </div>
                        <div className="text-xs text-muted-foreground">Procura</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Simulated price chart */}
                      <div className="absolute inset-0 flex items-end px-4 pb-4">
                        {mockMarketAnalysis.priceHistory.map((point, index) => {
                          const height = (point.price / 200) * 100; // Scale to percentage
                          return (
                            <div 
                              key={index} 
                              className="flex-1 mx