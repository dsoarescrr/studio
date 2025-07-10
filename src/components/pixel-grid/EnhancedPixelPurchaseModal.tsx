
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Calculator, Wallet, History, Camera, Palette as PaletteIcon, Eraser, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';

interface SelectedPixelDetails {
  x: number;
  y: number;
  color: string;
  owner?: string;
  price: number;
  lastSold?: Date;
  views: number;
  likes: number;
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Marco Histórico';
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
  'Marco Histórico': { text: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-400/10', gradient: 'from-amber-400/20 to-amber-400/5' },
};

const rarityTranslation: { [key: string]: keyof typeof rarityStyles } = {
  'Comum': 'common',
  'Raro': 'rare',
  'Épico': 'epic',
  'Lendário': 'legendary',
  'Marco Histórico': 'legendary',
  'common': 'common',
  'uncommon': 'uncommon',
  'rare': 'rare',
  'epic': 'epic',
  'legendary': 'legendary'
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
  const [drawingMode, setDrawingMode] = useState<'simple' | 'advanced'>('simple');
  const [drawingColor, setDrawingColor] = useState('#D4A757');
  const [brushSize, setBrushSize] = useState<number[]>([5]);
  const [drawingCanvas, setDrawingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();

  // Initialize canvas when component mounts
  useEffect(() => {
    if (canvasRef.current && drawingMode === 'advanced') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setDrawingCanvas(canvas);
        
        // Save initial state to history
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawingHistory([initialState]);
        setHistoryIndex(0);
      }
    }
  }, [drawingMode]);

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
      
      const baseValue = pixelData.price || 50;
      const rarityKey = rarityTranslation[pixelData.rarity] || 'common';
      const rarityMultiplier = 
        rarityKey === 'legendary' ? 2.0 :
        rarityKey === 'epic' ? 1.5 :
        rarityKey === 'rare' ? 1.2 :
        rarityKey === 'uncommon' ? 1.1 : 1.0;
      
      setPixelValue([baseValue * rarityMultiplier]);
    }
  }, [pixelData]);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get position based on event type
    let clientX, clientY;
    if ('touches' in e) {
      // Touch event
      const rect = drawingCanvas.getBoundingClientRect();
      clientX = e.touches[0].clientX - rect.left;
      clientY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      const rect = drawingCanvas.getBoundingClientRect();
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }
    
    setLastPosition({ x: clientX, y: clientY });
    
    // Draw a dot at the starting position
    ctx.beginPath();
    ctx.fillStyle = drawingColor;
    ctx.arc(clientX, clientY, brushSize[0] / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;
    
    // Get position based on event type
    let clientX, clientY;
    if ('touches' in e) {
      // Touch event
      const rect = drawingCanvas.getBoundingClientRect();
      clientX = e.touches[0].clientX - rect.left;
      clientY = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      const rect = drawingCanvas.getBoundingClientRect();
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize[0];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(clientX, clientY);
    ctx.stroke();
    
    setLastPosition({ x: clientX, y: clientY });
  };

  const endDrawing = () => {
    if (isDrawing && drawingCanvas) {
      setIsDrawing(false);
      
      // Save current state to history
      const ctx = drawingCanvas.getContext('2d');
      if (ctx) {
        const currentState = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        
        // Remove any "future" history if we've gone back and then drawn something new
        const newHistory = drawingHistory.slice(0, historyIndex + 1);
        
        setDrawingHistory([...newHistory, currentState]);
        setHistoryIndex(newHistory.length);
      }
    }
  };

  const clearCanvas = () => {
    if (!drawingCanvas) return;
    
    const ctx = drawingCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      // Save cleared state to history
      const clearedState = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
      setDrawingHistory([...drawingHistory, clearedState]);
      setHistoryIndex(drawingHistory.length);
    }
  };

  const undoDrawing = () => {
    if (historyIndex > 0 && drawingCanvas) {
      const ctx = drawingCanvas.getContext('2d');
      if (ctx) {
        const newIndex = historyIndex - 1;
        ctx.putImageData(drawingHistory[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

  const redoDrawing = () => {
    if (historyIndex < drawingHistory.length - 1 && drawingCanvas) {
      const ctx = drawingCanvas.getContext('2d');
      if (ctx) {
        const newIndex = historyIndex + 1;
        ctx.putImageData(drawingHistory[newIndex], 0, 0);
        setHistoryIndex(newIndex);
      }
    }
  };

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
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPixelTags(e.target.value);
    setPixelTagsArray(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean));
  };
  
  const toggleEffect = (effect: string) => {
    setCustomEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect) 
        : [...prev, effect]
    );
  };
  
  const handlePurchaseClick = async () => {
    if (!pixelData) return;

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
  const rarityKey = rarityTranslation[rarity] || 'common';
  const rarityStyle = rarityStyles[rarityKey];

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
      <SoundEffect src={SOUND_EFFECTS.PURCHASE} play={playPurchaseSound} onEnd={() => setPlayPurchaseSound(false)} volume={0.6} />
      <SoundEffect src={SOUND_EFFECTS.ERROR} play={playErrorSound} onEnd={() => setPlayErrorSound(false)} volume={0.5} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <DialogTitle className="flex items-center gap-3 font-headline text-2xl text-gradient-gold animate-pulse">
              <div className={cn("p-2 rounded-xl", rarityStyle.bg, rarityStyle.text)}>
                <MapPin className="h-6 w-6" />
              </div>
              {title || `Pixel (${x}, ${y})`}
              {rarity === 'Lendário' && <Crown className="h-6 w-6 text-amber-400 animate-pulse" />}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 flex items-center gap-4">
              <span className="line-clamp-2">{description || `Pixel único em ${region} com coordenadas (${x}, ${y})`}</span>
              <Badge className={cn("text-xs", rarityStyle.text, rarityStyle.border, rarityStyle.bg)}>
                {rarity.toUpperCase()}
              </Badge>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left Panel: Pixel Preview & Info */}
          <ScrollArea className="lg:col-span-2 border-r border-border">
              <div className="p-6 space-y-6">
                {/* Pixel Preview */}
                <Card className={cn("border-2 transition-all duration-500", rarityStyle.border)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gradient-gold">Preview do Pixel</h3>
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
                          rarityStyle.border, `bg-gradient-to-br ${rarityStyle.gradient} hover:shadow-xl hover:scale-105 transition-all duration-300`)}
                        style={{ backgroundColor: customColor }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white drop-shadow-lg">
                            <div className="text-2xl font-bold">({x}, {y})</div>
                            <div className="text-sm opacity-80 animate-pulse">{region}</div>
                          </div>
                        </div>
                        {rarity === 'Lendário' && (
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" style={{ animationDuration: '3s' }} />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
                        <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }} className="font-bold">{views.toLocaleString('pt-PT')}</motion.div>
                        <div className="text-xs text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }} className="font-bold">{likes.toLocaleString('pt-PT')}</motion.div>
                        <div className="text-xs text-muted-foreground">Curtidas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
                      Análise de Mercado
                    </CardTitle> 
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-lg font-bold text-primary animate-pulse">{mockMarketAnalysis.regionAvgPrice}€</div>
                        <div className="text-xs text-muted-foreground">Preço Médio</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 animate-bounce" style={{ animationDuration: '2s' }} />
                          +{mockMarketAnalysis.priceChange24h}%
                        </div>
                        <div className="text-xs text-muted-foreground">Variação 24h</div>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-lg font-bold text-blue-500">{mockMarketAnalysis.totalTransactions}</div>
                        <div className="text-xs text-muted-foreground">Transações</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/15 transition-colors">
                        <div className="text-lg font-bold text-purple-500 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 mr-1 animate-pulse" />Alta
                        </div>
                        <div className="text-xs text-muted-foreground">Procura</div>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Simulated price chart with improved animation */}
                      <div className="absolute inset-0 flex items-end px-4 pb-4">
                        {mockMarketAnalysis.priceHistory.map((point, index) => {
                          const height = (point.price / 200) * 100; // Scale to percentage
                          return (
                            <motion.div 
                              key={index} 
                              className="flex-1 mx-px bg-primary/30 hover:bg-primary/60 transition-all rounded-t-sm"
                              style={{ height: `${height}%`, animationDelay: `${index * 0.1}s` }}
                              data-animate="true"
                            />
                          );
                        })}
                      </div>
                      <div className="text-center text-muted-foreground z-10">
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
                      <Users className="h-5 w-5 text-primary animate-pulse" />
                      Píxeis Vizinhos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockNeighborPixels.map((neighbor, index) => (
                        <motion.div whileHover={{ scale: 1.03 }} key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3 hover:scale-105 transition-transform">
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
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary animate-pulse" />
                      Informações Detalhadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {renderInfoRow(<Users className="h-4 w-4" />, "Proprietário", owner || 'Sistema')}
                    {renderInfoRow(<Globe className="h-4 w-4" />, "Região", region)}
                    {renderInfoRow(<MapPin className="h-4 w-4" />, "Coordenadas GPS", 
                      gpsCoords ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lon.toFixed(4)}` : "N/A")}
                    {renderInfoRow(<Calendar className="h-4 w-4" />, "Última Venda", 
                      pixelData.lastSold ? new Date(pixelData.lastSold).toLocaleDateString('pt-PT') : 'Nunca vendido')}
                    {renderInfoRow(<Activity className="h-4 w-4" />, "Atividade", `${views} visualizações, ${likes} gostos`)}
                    {features && renderInfoRow(<Star className="h-4 w-4" />, "Características Especiais", features.length)}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          
          {/* Right Panel: Actions */}
          <ScrollArea className="lg:col-span-1">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger value="purchase" disabled={isOwnedByCurrentUser}>
                      {isOwnedByCurrentUser ? 'Comprado' : 'Comprar'}
                      </TabsTrigger>
                      <TabsTrigger value="details">Personalizar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="purchase" className="space-y-4 pt-4 mt-0">
                      {/* Price Display */}
                      <Card className="text-center bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/15 hover:to-accent/15 transition-colors">
                          <CardContent className="p-6"> 
                          <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Preço Atual</p>
                              <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 10 }} className="text-4xl font-bold text-gradient-gold">{currentPrice}€</motion.p>
                              <p className="text-xs text-muted-foreground">créditos</p>
                              {mockMarketAnalysis.priceChange24h > 0 && (
                              <Badge className="bg-green-500 text-white animate-pulse">
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
                              className="w-full justify-between hover:scale-[1.02] transition-transform hover:bg-primary/10"
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
                              className="w-full justify-between hover:scale-[1.02] transition-transform hover:bg-accent/10"
                              onClick={() => setPaymentMethod('special_credits')}
                          >
                              <div className="flex items-center">
                              <Gift className="h-4 w-4 mr-2" />
                              Créditos Especiais
                              </div>
                              <span className="text-xs">({userSpecialCredits})</span>
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start opacity-70" disabled>
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
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-[1.02] transition-transform" 
                          onClick={handlePurchaseClick} 
                          disabled={!canAfford || isProcessing || isOwnedByCurrentUser}
                      >
                          {isProcessing ? (
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          ) : (
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          )}
                          {isOwnedByCurrentUser ? 'Já é Seu!' : 
                          canAfford ? 'Confirmar Compra' : 'Créditos Insuficientes'}
                      </Button></motion.div>

                      {/* Advanced Options */}
                      <div className="pt-4 border-t">
                          <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                          className="w-full hover:bg-muted/30 transition-colors"
                          >
                          <Settings className="h-4 w-4 mr-2" />
                          Opções Avançadas
                          <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", 
                              showAdvancedOptions && "rotate-90")} />
                          </Button>
                          
                          {showAdvancedOptions && (
                          <div className="mt-3 space-y-3 p-3 bg-muted/20 rounded-lg animate-fade-in">
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
                  <TabsContent value="details" className="space-y-4 pt-4 mt-0">
                  <div className="space-y-4">
                      <div className="space-y-2">
                      <Label htmlFor="pixelTitle" className="text-sm font-medium">Título do Pixel</Label>
                      <Input 
                          id="pixelTitle" 
                          value={pixelTitle} 
                          onChange={(e) => setPixelTitle(e.target.value)} 
                          placeholder="Dê um nome ao seu pixel"
                          className="mt-1"
                      />
                      </div>
                      
                      <div className="space-y-2">
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

                      <div className="space-y-2">
                      <Label htmlFor="customColor" className="text-sm font-medium">Cor Personalizada</Label>
                      <div className="flex items-center gap-2 mt-1">
                          <input 
                          type="color" 
                          id="customColor" 
                          value={customColor} 
                          onChange={(e) => setCustomColor(e.target.value)} 
                          className="w-16 h-10 p-1 rounded cursor-pointer"
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

                      <div className="space-y-2">
                      <Label htmlFor="pixelTags" className="text-sm font-medium">Tags</Label>
                      <Input
                          id="pixelTags"
                          value={pixelTags}
                          onChange={(e) => setPixelTags(e.target.value)}
                          placeholder="arte, paisagem, histórico (separadas por vírgulas)"
                          className="mt-1"
                      />
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="pixelUrl" className="text-sm font-medium">Link Personalizado</Label>
                      <Input
                          id="pixelUrl"
                          value={pixelUrl}
                          onChange={(e) => setPixelUrl(e.target.value)}
                          placeholder="https://exemplo.com"
                          className="mt-1"
                      />
                      </div>

                      <div className="space-y-2">
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

                      {/* Drawing Mode Selector */}
                      <div className="space-y-2 pt-4">
                        <Label className="text-sm font-medium">Modo de Desenho</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant={drawingMode === 'simple' ? 'default' : 'outline'} 
                            onClick={() => setDrawingMode('simple')}
                            className="flex flex-col items-center justify-center h-20 gap-2"
                          >
                            <Palette className="h-6 w-6" />
                            <span>Cor Simples</span>
                          </Button>
                          <Button 
                            variant={drawingMode === 'advanced' ? 'default' : 'outline'} 
                            onClick={() => setDrawingMode('advanced')}
                            className="flex flex-col items-center justify-center h-20 gap-2"
                          >
                            <Brush className="h-6 w-6" />
                            <span>Desenho Avançado</span>
                          </Button>
                        </div>
                      </div>

                      {/* Advanced Drawing Canvas */}
                      {drawingMode === 'advanced' && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Cor do Pincel</Label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={drawingColor} 
                                  onChange={(e) => setDrawingColor(e.target.value)} 
                                  className="w-8 h-8 p-1 rounded cursor-pointer"
                                />
                                <span className="text-xs font-code">{drawingColor}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Tamanho do Pincel</Label>
                              <span className="text-xs font-code">{brushSize[0]}px</span>
                            </div>
                            <Slider
                              value={brushSize}
                              onValueChange={setBrushSize}
                              min={1}
                              max={20}
                              step={1}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={undoDrawing}
                              disabled={historyIndex <= 0}
                              className="flex-1"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Desfazer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={redoDrawing}
                              disabled={historyIndex >= drawingHistory.length - 1}
                              className="flex-1"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refazer
                            </Button>
                            <Button variant="outline" size="sm" onClick={clearCanvas} className="flex-1">
                              <Eraser className="h-4 w-4 mr-2" />
                              Limpar
                            </Button>
                          </div>
                          
                          <div className="border-2 border-muted rounded-lg overflow-hidden">
                            <canvas 
                              ref={canvasRef} 
                              width={300} 
                              height={300} 
                              className="w-full touch-none"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={endDrawing}
                              onMouseLeave={endDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={endDrawing}
                            />
                          </div>
                        </div>
                      )}

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
      </DialogContent>
    </Dialog> 
  );
}
