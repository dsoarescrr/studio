
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '../ui/separator';
import { RequireAuth } from '@/components/auth/RequireAuth';
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
  Calculator, Wallet, History, Camera, Palette as PaletteIcon, Eraser, RefreshCw,
  BookImage, FileText, FolderPlus, Play, Volume2, X, Twitter, Instagram, UserPlus, LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import PixelPaymentModal from '@/components/payment/PixelPaymentModal';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { UserProfileSheet } from '@/components/user/UserProfileSheet';

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
  popularity?: number;
  forecast?: 'rising' | 'stable' | 'falling';
  neighbors?: Array<{x: number, y: number, owner: string, color: string}>;
  culturalSignificance?: string;
  historicalEvents?: Array<{year: string, event: string}>;
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
  specialCreditsPrice?: number;
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
  const { user } = useAuth();
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
  const [pixelVisibility, setPixelVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [pixelCategory, setPixelCategory] = useState<string>('');
  const [pixelStory, setPixelStory] = useState<string>('');
  const [pixelMood, setPixelMood] = useState<string>('');
  const [pixelAnimation, setPixelAnimation] = useState<boolean>(false);
  const [pixelSound, setPixelSound] = useState<boolean>(false);
  const [pixelInteractive, setPixelInteractive] = useState<boolean>(false);
  const [showAIOptions, setShowAIOptions] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false);
  const [installmentOption, setInstallmentOption] = useState<number>(1);
  const [showInsuranceOption, setShowInsuranceOption] = useState<boolean>(false);
  const [insuranceSelected, setInsuranceSelected] = useState<boolean>(false);
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

  // Mock data for cultural significance and historical events
  const mockCulturalSignificance = "Este pixel está localizado em uma área de grande importância cultural para Portugal, próximo a monumentos históricos e locais de interesse turístico.";
  const mockHistoricalEvents = [
    { year: "1385", event: "Batalha de Aljubarrota nas proximidades" },
    { year: "1755", event: "Grande Terremoto de Lisboa afetou esta região" },
    { year: "1910", event: "Proclamação da República Portuguesa" }
  ];

  // Mock user data for profile sheet
  const mockUserData = {
    id: "user123",
    name: "Pixel Master",
    username: "@pixelmaster",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "user avatar",
    level: 25,
    xp: 2450,
    xpMax: 3000,
    credits: 12500,
    specialCredits: 120,
    bio: "Colecionador apaixonado de pixels raros e criador de arte digital no Pixel Universe.",
    pixelsOwned: 156,
    achievementsUnlocked: 23,
    unlockedAchievementIds: ["pixel_initiate", "color_master", "community_star"],
    rank: 12,
    location: "Lisboa, Portugal",
    socials: [
      { platform: "Twitter", handle: "@pixelmaster", icon: <Twitter className="h-4 w-4 text-blue-400" />, url: "#" },
      { platform: "Instagram", handle: "pixelmaster_pt", icon: <Instagram className="h-4 w-4 text-pink-400" />, url: "#" }
    ],
    albums: [
      { id: "album1", name: "Lisboa Histórica", description: "Pixels da zona histórica de Lisboa", coverPixelUrl: "https://placehold.co/100x100.png", dataAiHint: "album cover", pixelCount: 12 },
      { id: "album2", name: "Cores de Portugal", description: "Uma viagem colorida pelo país", coverPixelUrl: "https://placehold.co/100x100.png", dataAiHint: "album cover", pixelCount: 24 }
    ]
  };

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
      setPixelStory(pixelData.loreSnippet || '');
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
    } else if (paymentMethod === 'special_credits' && pixelData.specialCreditsPrice) {
      removeSpecialCredits(pixelData.specialCreditsPrice);
    }
    
    setIsProcessing(true);
    const success = await onPurchase(pixelData, paymentMethod, {
      color: customColor,
      title: pixelTitle,
      description: pixelDescription,
      story: pixelStory,
      tags: pixelTagsArray,
      url: pixelUrl,
      notifications: enableNotifications,
      public: makePublic,
      protection: pixelProtection,
      effects: customEffects,
      rarity: pixelRarity,
      value: pixelValue[0],
      visibility: pixelVisibility,
      category: pixelCategory,
      animation: pixelAnimation,
      sound: pixelSound,
      interactive: pixelInteractive,
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
    setOfferAmount('');
  };

  const handleGenerateAIDescription = () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedDescription = "Este pixel representa uma parte fascinante de Portugal, com rica história e beleza natural. Localizado em uma região de importância cultural, oferece uma vista única do patrimônio português.";
      setPixelDescription(generatedDescription);
      
      setIsGeneratingAI(false);
      toast({
        title: "Descrição Gerada",
        description: "A IA criou uma descrição para o seu pixel com base na localização e contexto.",
      });
    }, 2000);
  };

  const canAfford = useMemo(() => {
    if (!pixelData) return false;
    const price = pixelData.salePrice || pixelData.price;
    if (paymentMethod === 'credits') {
      return userCredits >= price;
    }
    if (paymentMethod === 'special_credits' && pixelData.specialCreditsPrice) {
      return userSpecialCredits >= pixelData.specialCreditsPrice;
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
      <SoundEffect 
        src={SOUND_EFFECTS.PURCHASE} 
        play={playPurchaseSound} 
        onEnd={() => setPlayPurchaseSound(false)} 
        volume={0.6} 
      />
      <SoundEffect 
        src={SOUND_EFFECTS.ERROR} 
        play={playErrorSound} 
        onEnd={() => setPlayErrorSound(false)} 
        volume={0.5} 
      />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0">
        
        <RequireAuth fallback={
          <div className="p-8 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Autenticação Necessária</h3>
            <p className="text-muted-foreground mb-6">
              Precisa de iniciar sessão para comprar pixels.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AuthModal defaultTab="login">
                <Button>
                  Iniciar Sessão
                </Button>
              </AuthModal>
              <AuthModal defaultTab="register">
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Conta
                </Button>
              </AuthModal>
            </div>
          </div>
        }>
        </RequireAuth>
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            Capturar
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent>Capturar imagem do pixel</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Partilhar
                          </Button>
                            </TooltipTrigger>
                            <TooltipContent>Partilhar nas redes sociais</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
                        <motion.div 
                          initial={{ scale: 0.8 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring", stiffness: 400, damping: 10 }} 
                          className="font-bold"
                        >
                          {views.toLocaleString('pt-PT')}
                        </motion.div>
                        <div className="text-xs text-muted-foreground">Visualizações</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                        <motion.div 
                          initial={{ scale: 0.8 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }} 
                          className="font-bold"
                        >
                          {likes.toLocaleString('pt-PT')}
                        </motion.div>
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
                        <div className="text-lg font-bold text-primary animate-pulse">
                          {mockMarketAnalysis.regionAvgPrice}€
                        </div>
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

                {/* Cultural and Historical Significance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary animate-pulse" />
                      Significado Cultural e Histórico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-primary/20">
                      <p className="text-sm italic text-muted-foreground">
                        "{pixelData.culturalSignificance || mockCulturalSignificance}"
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center">
                        <History className="h-4 w-4 mr-2 text-amber-500" />
                        Eventos Históricos na Região
                      </h4>
                      <div className="space-y-2">
                        {(pixelData.historicalEvents || mockHistoricalEvents).map((event, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-muted/10 rounded-md hover:bg-muted/20 transition-colors">
                            <Badge variant="outline" className="shrink-0 text-amber-500 border-amber-500/50">
                              {event.year}
                            </Badge>
                            <p className="text-xs">{event.event}</p>
                          </div>
                        ))}
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
                          <div className="flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded border" />
                            <div>
                              <div className="text-sm font-medium">({neighbor.x}, {neighbor.y})</div>
                              <UserProfileSheet userData={mockUserData} achievementsData={[]}>
                                <div className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                  {neighbor.owner}
                                </div>
                              </UserProfileSheet>
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
                    {pixelData.popularity && renderInfoRow(<TrendingUp className="h-4 w-4" />, "Popularidade", 
                      <div className="flex items-center">
                        <Progress value={pixelData.popularity} className="w-24 h-2 mr-2" />
                        <span>{pixelData.popularity}%</span>
                      </div>
                    )}
                    {pixelData.forecast && renderInfoRow(<BarChart3 className="h-4 w-4" />, "Previsão de Valor", 
                      <Badge variant={
                        pixelData.forecast === 'rising' ? 'default' : 
                        pixelData.forecast === 'stable' ? 'secondary' : 
                        'outline'
                      }>
                        {pixelData.forecast === 'rising' ? 'Em Alta' : 
                         pixelData.forecast === 'stable' ? 'Estável' : 
                         'Em Queda'}
                      </Badge>
                    )}
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
                          {pixelData.forecast && (
                            <CardFooter className="pt-0 pb-4 flex justify-center">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">Previsão:</span>
                                {pixelData.forecast === 'rising' && (
                                  <Badge className="bg-green-500">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Em alta
                                  </Badge>
                                )}
                                {pixelData.forecast === 'stable' && (
                                  <Badge variant="secondary">
                                    <Minus className="h-3 w-3 mr-1" />
                                    Estável
                                  </Badge>
                                )}
                                {pixelData.forecast === 'falling' && (
                                  <Badge variant="destructive">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    Em queda
                                  </Badge>
                                )}
                              </div>
                            </CardFooter>
                          )}
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

                      {/* Payment Options */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-primary" />
                            Opções de Pagamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Parcelar em prestações</Label>
                            <Switch 
                              checked={showPaymentOptions} 
                              onCheckedChange={setShowPaymentOptions} 
                            />
                          </div>
                          
                          {showPaymentOptions && (
                            <div className="space-y-3 p-3 bg-muted/20 rounded-lg animate-fade-in">
                              <div className="space-y-2">
                                <Label className="text-xs">Número de prestações</Label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 6, 12].map(option => (
                                    <Button
                                      key={option}
                                      variant={installmentOption === option ? "default" : "outline"}
                                      size="sm"
                                      className="flex-1 text-xs h-8"
                                      onClick={() => setInstallmentOption(option)}
                                    >
                                      {option}x
                                    </Button>
                                  ))}
                                </div>
                                {installmentOption > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    {installmentOption}x de {Math.ceil(currentPrice / installmentOption)}€ sem juros
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between pt-2">
                                <Label className="text-xs flex items-center">
                                  <Shield className="h-3 w-3 mr-1 text-green-500" />
                                  Seguro de Pixel
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs text-xs">
                                          Protege seu pixel contra alterações não autorizadas e garante compensação em caso de problemas.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                                <Switch 
                                  checked={insuranceSelected} 
                                  onCheckedChange={setInsuranceSelected} 
                                />
                              </div>
                              
                              {insuranceSelected && (
                                <div className="text-xs text-muted-foreground bg-green-500/10 p-2 rounded-md border border-green-500/20">
                                  Seguro adicionado: +{Math.ceil(currentPrice * 0.05)}€ (5% do valor)
                                </div>
                              )}
                            </div>
                          )}
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
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        {user ? (
                          <PixelPaymentModal 
                            pixelData={{
                              x: pixelData.x,
                              y: pixelData.y,
                              price: pixelData.price,
                              specialCreditsPrice: pixelData.specialCreditsPrice,
                              rarity: pixelData.rarity,
                              region: pixelData.region
                            }}
                            onPurchaseComplete={(paymentMethod) => {
                              handlePurchaseClick();
                            }}
                          >
                            <Button 
                              disabled={isProcessing}
                              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:scale-[1.02] transition-transform"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Comprar por {pixelData.price}€
                            </Button>
                          </PixelPaymentModal>
                        ) : (
                          <AuthModal>
                            <Button
                              variant="default"
                              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 button-hover-lift-glow"
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Entrar para Comprar
                            </Button>
                          </AuthModal>
                        )}
                      </motion.div>

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
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Receba notificações sobre atividades relacionadas a este pixel</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              </div>
                              <div className="flex items-center justify-between">
                              <Label className="text-xs">Tornar Público</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Switch checked={makePublic} onCheckedChange={setMakePublic} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Permitir que outros usuários vejam este pixel na galeria</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Proteção de Pixel</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Switch checked={pixelProtection} onCheckedChange={setPixelProtection} />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Proteja seu pixel contra modificações não autorizadas</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                          </div>
                          )}
                      </div>
                  </TabsContent>
                  <TabsContent value="details" className="space-y-4 pt-4 mt-0">
                  <div className="space-y-4">
                      <div className="space-y-2">
                      <Label htmlFor="pixelTitle" className="text-sm font-medium flex items-center">
                        <BookImage className="h-4 w-4 mr-2 text-primary" />
                        Título do Pixel
                      </Label>
                      <Input 
                          id="pixelTitle" 
                          value={pixelTitle} 
                          onChange={(e) => setPixelTitle(e.target.value)} 
                          placeholder="Dê um nome ao seu pixel"
                          className="mt-1"
                      />
                      </div>
                      
                      <div className="space-y-2">
                      <Label htmlFor="pixelDescription" className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center"><FileText className="h-4 w-4 mr-2 text-primary" />Descrição</span>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenerateAIDescription} disabled={isGeneratingAI}>{isGeneratingAI ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />} Gerar com IA</Button>
                      </Label>
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
                      <Label htmlFor="customColor" className="text-sm font-medium flex items-center">
                        <Palette className="h-4 w-4 mr-2 text-primary" />
                        Cor Personalizada
                      </Label>
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
                      <Label htmlFor="pixelTags" className="text-sm font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        Tags
                      </Label>
                      <Input
                          id="pixelTags"
                          value={pixelTags}
                          onChange={(e) => setPixelTags(e.target.value)}
                          placeholder="arte, paisagem, histórico (separadas por vírgulas)"
                          className="mt-1"
                      />
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="pixelUrl" className="text-sm font-medium flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-primary" />
                        Link Personalizado
                      </Label>
                      <Input
                          id="pixelUrl"
                          value={pixelUrl}
                          onChange={(e) => setPixelUrl(e.target.value)}
                          placeholder="https://exemplo.com"
                          className="mt-1"
                      />
                      </div>

                      <div className="space-y-2">
                      <Label htmlFor="pixelImage" className="text-sm font-medium flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                        Imagem (1x1)
                      </Label>
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
                      
                      {/* Pixel Story */}
                      <div className="space-y-2">
                        <Label htmlFor="pixelStory" className="text-sm font-medium flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-primary" />
                          História do Pixel
                        </Label>
                        <Textarea
                          id="pixelStory"
                          value={pixelStory}
                          onChange={(e) => setPixelStory(e.target.value)}
                          placeholder="Conte uma história sobre este pixel..."
                          className="resize-none"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Adicione um contexto narrativo ao seu pixel para torná-lo mais interessante.
                        </p>
                      </div>
                      
                      {/* Visibility Settings */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <Eye className="h-4 w-4 mr-2 text-primary" />
                          Visibilidade
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={pixelVisibility === 'public' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPixelVisibility('public')}
                            className="flex items-center justify-center"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Público
                          </Button>
                          <Button
                            variant={pixelVisibility === 'friends' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPixelVisibility('friends')}
                            className="flex items-center justify-center"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Amigos
                          </Button>
                          <Button
                            variant={pixelVisibility === 'private' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPixelVisibility('private')}
                            className="flex items-center justify-center"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Privado
                          </Button>
                        </div>
                      </div>
                      
                      {/* Category Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="pixelCategory" className="text-sm font-medium flex items-center">
                          <FolderPlus className="h-4 w-4 mr-2 text-primary" />
                          Categoria
                        </Label>
                        <Select value={pixelCategory} onValueChange={setPixelCategory}>
                          <SelectTrigger id="pixelCategory">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="arte">Arte</SelectItem>
                            <SelectItem value="natureza">Natureza</SelectItem>
                            <SelectItem value="historico">Histórico</SelectItem>
                            <SelectItem value="urbano">Urbano</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Special Effects */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-primary" />
                          Efeitos Especiais
                        </Label>
                        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pixelAnimation" className="text-xs flex items-center">
                              <Play className="h-3 w-3 mr-1 text-blue-500" />
                              Animação
                            </Label>
                            <Switch id="pixelAnimation" checked={pixelAnimation} onCheckedChange={setPixelAnimation} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pixelSound" className="text-xs flex items-center">
                              <Volume2 className="h-3 w-3 mr-1 text-green-500" />
                              Som
                            </Label>
                            <Switch id="pixelSound" checked={pixelSound} onCheckedChange={setPixelSound} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pixelInteractive" className="text-xs flex items-center">
                              <Zap className="h-3 w-3 mr-1 text-purple-500" />
                              Interativo
                            </Label>
                            <Switch id="pixelInteractive" checked={pixelInteractive} onCheckedChange={setPixelInteractive} />
                          </div>
                        </div>
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
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-colors">
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
