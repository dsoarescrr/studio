
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  Award,
  Calculator,
  User,
  MessageSquare,
  Upload,
  Download,
  Brush,
  Eraser,
  Undo,
  Redo,
  Save,
  Image as ImageIcon,
  Layers,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Square,
  Circle,
  Triangle,
  Type,
  Pipette,
  Minus,
  Maximize2,
  Minimize2,
  Copy,
  Scissors,
  FileImage,
  Trash2,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Enhanced Types
interface PixelOwner {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  level: number;
  joinDate: Date;
  totalPixels: number;
  reputation: number;
  isVerified: boolean;
  lastSeen: Date;
  bio?: string;
}

interface PixelComment {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  text: string;
  timestamp: Date;
  likes: number;
  replies: PixelComment[];
}

interface PixelData {
  x: number;
  y: number;
  color: string;
  owner?: PixelOwner;
  price: number;
  lastSold?: Date;
  views: number;
  likes: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  region: string;
  isProtected: boolean;
  history: PixelTransaction[];
  comments: PixelComment[];
  tags: string[];
  description?: string;
  createdAt: Date;
  lastModified: Date;
  coordinates: {
    gps: { lat: number; lng: number };
    grid: { row: number; col: number };
  };
  neighbors: {
    north?: PixelData;
    south?: PixelData;
    east?: PixelData;
    west?: PixelData;
  };
  metadata: {
    totalEdits: number;
    uniqueOwners: number;
    averageHoldTime: number; // in days
    peakPrice: number;
    isLandmark: boolean;
    culturalSignificance?: string;
  };
}

interface PixelTransaction {
  id: string;
  date: Date;
  price: number;
  buyer: string;
  seller?: string;
  type: 'purchase' | 'sale' | 'color_change' | 'transfer' | 'auction';
  transactionHash?: string;
  fees: number;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  fee: number;
  processingTime: string;
  available: boolean;
  limits?: {
    min: number;
    max: number;
  };
}

interface PriceHistory {
  date: Date;
  price: number;
  volume: number;
  marketCap?: number;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  cursor: string;
}

interface PixelPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: PixelData | null;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: PixelData, paymentMethod: string, customizations: any) => Promise<boolean>;
}

// Enhanced Mock Data Generators
const generatePixelOwner = (): PixelOwner => ({
  id: `owner_${Math.random().toString(36).substr(2, 9)}`,
  name: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Ferreira', 'Carlos Oliveira'][Math.floor(Math.random() * 5)],
  username: `@user${Math.floor(Math.random() * 1000)}`,
  avatarUrl: 'https://placehold.co/64x64.png',
  level: Math.floor(Math.random() * 50) + 1,
  joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  totalPixels: Math.floor(Math.random() * 500) + 1,
  reputation: Math.floor(Math.random() * 1000),
  isVerified: Math.random() > 0.7,
  lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  bio: 'Artista digital apaixonado por pixel art e criação de mundos virtuais.'
});

const generateComments = (): PixelComment[] => {
  const comments: PixelComment[] = [];
  const commentTexts = [
    'Que pixel incrível! Adorei a escolha de cor.',
    'Este local tem muito potencial para arte colaborativa.',
    'Interessante ver a evolução deste pixel ao longo do tempo.',
    'Alguém quer colaborar numa obra de arte aqui?',
    'A vista daqui deve ser espetacular!'
  ];
  
  for (let i = 0; i < Math.floor(Math.random() * 8) + 2; i++) {
    comments.push({
      id: `comment_${i}`,
      user: {
        id: `user_${i}`,
        name: `Utilizador ${i + 1}`,
        avatarUrl: 'https://placehold.co/32x32.png'
      },
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      likes: Math.floor(Math.random() * 20),
      replies: []
    });
  }
  
  return comments;
};

const generatePriceHistory = (basePrice: number): PriceHistory[] => {
  const history: PriceHistory[] = [];
  let currentPrice = basePrice * 0.7;
  
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * 0.3;
    currentPrice = Math.max(1, currentPrice * (1 + change));
    
    history.push({
      date,
      price: Math.round(currentPrice),
      volume: Math.floor(Math.random() * 100) + 1,
      marketCap: Math.round(currentPrice * (Math.random() * 1000 + 500))
    });
  }
  
  return history;
};

const generateSimilarPixels = (region: string, rarity: string): PixelData[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    x: Math.floor(Math.random() * 1000),
    y: Math.floor(Math.random() * 1000),
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    price: Math.floor(Math.random() * 500) + 50,
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    rarity: rarity as any,
    region,
    isProtected: Math.random() > 0.8,
    history: [],
    comments: [],
    tags: ['arte', 'paisagem', 'urbano'][Math.floor(Math.random() * 3)] ? [['arte', 'paisagem', 'urbano'][Math.floor(Math.random() * 3)]] : [],
    createdAt: new Date(),
    lastModified: new Date(),
    coordinates: {
      gps: { lat: 39.5 + Math.random() * 2, lng: -8 + Math.random() * 2 },
      grid: { row: i * 10, col: i * 15 }
    },
    neighbors: {},
    metadata: {
      totalEdits: Math.floor(Math.random() * 50),
      uniqueOwners: Math.floor(Math.random() * 10) + 1,
      averageHoldTime: Math.floor(Math.random() * 365),
      peakPrice: Math.floor(Math.random() * 1000) + 100,
      isLandmark: Math.random() > 0.9,
      culturalSignificance: Math.random() > 0.8 ? 'Local histórico importante' : undefined
    }
  }));
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credits',
    name: 'Créditos Normais',
    icon: <Coins className="h-4 w-4" />,
    fee: 0,
    processingTime: 'Instantâneo',
    available: true,
    limits: { min: 1, max: 100000 }
  },
  {
    id: 'special_credits',
    name: 'Créditos Especiais',
    icon: <Sparkles className="h-4 w-4" />,
    fee: 0,
    processingTime: 'Instantâneo',
    available: true,
    limits: { min: 1, max: 50000 }
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    icon: <CreditCard className="h-4 w-4" />,
    fee: 2.9,
    processingTime: '1-2 minutos',
    available: true,
    limits: { min: 10, max: 10000 }
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Shield className="h-4 w-4" />,
    fee: 3.5,
    processingTime: '2-5 minutos',
    available: true,
    limits: { min: 5, max: 5000 }
  },
  {
    id: 'crypto',
    name: 'Criptomoeda',
    icon: <Zap className="h-4 w-4" />,
    fee: 1.5,
    processingTime: '5-15 minutos',
    available: true,
    limits: { min: 20, max: 50000 }
  }
];

const drawingTools: DrawingTool[] = [
  { id: 'brush', name: 'Pincel', icon: <Brush className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'eraser', name: 'Borracha', icon: <Eraser className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'bucket', name: 'Balde', icon: <Paintbrush className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'pipette', name: 'Conta-gotas', icon: <Pipette className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'line', name: 'Linha', icon: <Minus className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'rectangle', name: 'Retângulo', icon: <Square className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'circle', name: 'Círculo', icon: <Circle className="h-4 w-4" />, cursor: 'crosshair' },
  { id: 'text', name: 'Texto', icon: <Type className="h-4 w-4" />, cursor: 'text' }
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
  
  // Enhanced State
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
  
  // Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushSize, setBrushSize] = useState([3]);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [layers, setLayers] = useState([{ id: 'base', name: 'Base', visible: true, opacity: 1 }]);
  const [activeLayer, setActiveLayer] = useState('base');
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comments State
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  // Animation State
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [animationFrames, setAnimationFrames] = useState<ImageData[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Effects
  useEffect(() => {
    if (pixelData && isOpen) {
      setPriceHistory(generatePriceHistory(pixelData.price));
      setSimilarPixels(generateSimilarPixels(pixelData.region, pixelData.rarity));
      setCustomColor(pixelData.color);
      
      // Enhanced calculations
      const baseValue = pixelData.price;
      const rarityMultiplier = rarityConfig[pixelData.rarity].multiplier;
      const viewsMultiplier = Math.min(pixelData.views / 1000, 2);
      const likesMultiplier = Math.min(pixelData.likes / 100, 1.5);
      const ownershipMultiplier = (pixelData.metadata?.uniqueOwners || 0) > 5 ? 1.2 : 1;
      const landmarkMultiplier = pixelData.metadata?.isLandmark ? 1.5 : 1;
      
      setEstimatedValue(Math.round(baseValue * rarityMultiplier * (1 + viewsMultiplier + likesMultiplier) * ownershipMultiplier * landmarkMultiplier));
      setDemandLevel(Math.min((pixelData.views + pixelData.likes * 10 + (pixelData.metadata?.totalEdits || 0) * 5) / 200, 100));
      
      // Initialize canvas
      initializeCanvas();
    }
  }, [pixelData, isOpen]);

  // Canvas initialization
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !pixelData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 400;
    
    // Fill with current pixel color
    ctx.fillStyle = pixelData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory([imageData]);
    setHistoryIndex(0);
  }, [pixelData]);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    draw(x, y);
  }, [isDrawingMode]);

  const draw = useCallback((x: number, y: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = selectedTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = customColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize[0], 0, 2 * Math.PI);
    ctx.fill();
  }, [selectedTool, customColor, brushSize]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !canvasRef.current) return;
    
    setIsDrawing(false);
    
    // Save to history
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = drawingHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setDrawingHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [isDrawing, drawingHistory, historyIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    draw(x, y);
  }, [isDrawing, draw]);

  const undo = useCallback(() => {
    if (historyIndex > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = historyIndex - 1;
      ctx.putImageData(drawingHistory[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, drawingHistory]);

  const redo = useCallback(() => {
    if (historyIndex < drawingHistory.length - 1 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = historyIndex + 1;
      ctx.putImageData(drawingHistory[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, drawingHistory]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Save to history
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = drawingHistory.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      setDrawingHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    };
    img.src = URL.createObjectURL(file);
  }, [drawingHistory, historyIndex]);

  const exportCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `pixel_${pixelData?.x}_${pixelData?.y}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [pixelData]);

  const addComment = useCallback(() => {
    if (!newComment.trim()) return;
    
    toast({
      title: "Comentário Adicionado!",
      description: "O seu comentário foi publicado com sucesso.",
    });
    
    setNewComment('');
  }, [newComment, toast]);

  // Calculations
  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
  const basePrice = pixelData?.price || 0;
  const rarityMultiplier = pixelData ? rarityConfig[pixelData.rarity].multiplier : 1;
  const protectionCost = protectionLevel[0] * 10;
  const customColorCost = useCustomColor ? 25 : 0;
  const drawingCost = isDrawingMode ? 50 : 0;
  const totalCost = Math.round((basePrice * rarityMultiplier) + protectionCost + customColorCost + drawingCost);
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
        shareOnSocial,
        hasCustomDrawing: isDrawingMode,
        canvasData: isDrawingMode && canvasRef.current ? canvasRef.current.toDataURL() : null
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
  const formatDate = (date: Date | undefined | null) => date ? date.toLocaleDateString('pt-PT') : 'N/A';
  const formatDateTime = (date: Date | undefined | null) => date ? date.toLocaleString('pt-PT') : 'N/A';

  if (!pixelData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-headline flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                Pixel ({pixelData.x}, {pixelData.y})
                <Badge className={cn("text-sm", rarityConfig[pixelData.rarity].color, rarityConfig[pixelData.rarity].bg)}>
                  {rarityConfig[pixelData.rarity].label}
                </Badge>
                {pixelData.metadata?.isLandmark && (
                  <Badge variant="secondary" className="text-sm">
                    <Crown className="h-4 w-4 mr-1" />
                    Marco
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-6 text-base">
                <span className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {pixelData.region}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {formatPrice(pixelData.views)} visualizações
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  {pixelData.likes} gostos
                </span>
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {pixelData.comments?.length || 0} comentários
                </span>
                {pixelData.isProtected && (
                  <Badge variant="secondary" className="text-sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Protegido
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{formatPrice(finalCost)} Kz</div>
              <div className="text-sm text-muted-foreground">
                {estimatedValue > totalCost ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Excelente negócio!
                  </span>
                ) : estimatedValue < totalCost * 0.8 ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    Preço elevado
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Preço justo
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 grid w-auto grid-cols-7">
              <TabsTrigger value="purchase" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Comprar
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Proprietário
              </TabsTrigger>
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                Desenhar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análise
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comunidade
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
                    {/* Enhanced Pixel Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Paintbrush className="h-5 w-5" />
                          Preview e Personalização do Pixel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Current State */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="space-y-2">
                                <Label>Cor Atual</Label>
                                <div 
                                  className="w-20 h-20 rounded-lg border-2 border-border shadow-inner"
                                  style={{ backgroundColor: pixelData.color }}
                                />
                                <p className="text-xs text-muted-foreground font-mono">{pixelData.color}</p>
                              </div>
                              {useCustomColor && (
                                <>
                                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                                  <div className="space-y-2">
                                    <Label>Nova Cor</Label>
                                    <div 
                                      className="w-20 h-20 rounded-lg border-2 border-primary shadow-inner animate-pulse"
                                      style={{ backgroundColor: customColor }}
                                    />
                                    <p className="text-xs text-muted-foreground font-mono">{customColor}</p>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="space-y-4">
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
                                <div className="space-y-3">
                                  <Label htmlFor="color-picker">Escolher Cor</Label>
                                  <div className="flex gap-3">
                                    <Input
                                      id="color-picker"
                                      type="color"
                                      value={customColor}
                                      onChange={(e) => setCustomColor(e.target.value)}
                                      className="w-16 h-12 p-1 cursor-pointer"
                                    />
                                    <Input
                                      value={customColor}
                                      onChange={(e) => setCustomColor(e.target.value)}
                                      placeholder="#FF0000"
                                      className="font-mono flex-1"
                                    />
                                  </div>
                                  
                                  {/* Color Presets */}
                                  <div className="space-y-2">
                                    <Label className="text-sm">Cores Populares</Label>
                                    <div className="grid grid-cols-8 gap-2">
                                      {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map(color => (
                                        <button
                                          key={color}
                                          className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                                          style={{ backgroundColor: color }}
                                          onClick={() => setCustomColor(color)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coordinates and Metadata */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="p-3">
                                <h4 className="text-sm font-semibold mb-2">Coordenadas GPS</h4>
                                <p className="text-xs font-mono">
                                  {pixelData.coordinates?.gps?.lat?.toFixed(6) || 'N/A'}, {pixelData.coordinates?.gps?.lng?.toFixed(6) || 'N/A'}
                                </p>
                              </Card>
                              <Card className="p-3">
                                <h4 className="text-sm font-semibold mb-2">Coordenadas Grid</h4>
                                <p className="text-xs font-mono">
                                  ({pixelData.coordinates?.grid?.row || 'N/A'}, {pixelData.coordinates?.grid?.col || 'N/A'})
                                </p>
                              </Card>
                            </div>
                            
                            <Card className="p-3">
                              <h4 className="text-sm font-semibold mb-2">Metadados</h4>
                              <div className="space-y-1 text-xs">
                                <p>Criado: {formatDateTime(pixelData.createdAt)}</p>
                                <p>Última modificação: {formatDateTime(pixelData.lastModified)}</p>
                                <p>Total de edições: {pixelData.metadata?.totalEdits || 0}</p>
                                <p>Proprietários únicos: {pixelData.metadata?.uniqueOwners || 0}</p>
                                <p>Tempo médio de posse: {pixelData.metadata?.averageHoldTime || 0} dias</p>
                              </div>
                            </Card>

                            {pixelData.tags && pixelData.tags.length > 0 && (
                              <div className="space-y-2">
                                <Label className="text-sm">Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                  {pixelData.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Payment Method */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Método de Pagamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                  {method.limits && (
                                    <div className="text-xs text-muted-foreground">
                                      Limite: {formatPrice(method.limits.min)} - {formatPrice(method.limits.max)} Kz
                                    </div>
                                  )}
                                </div>
                                {selectedPaymentMethod === method.id && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Enhanced Balance Check */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Saldo Disponível:</span>
                            <span className="font-medium">
                              {selectedPaymentMethod === 'credits' && `${formatPrice(userCredits)} Créditos`}
                              {selectedPaymentMethod === 'special_credits' && `${formatPrice(userSpecialCredits)} Especiais`}
                              {!['credits', 'special_credits'].includes(selectedPaymentMethod) && 'Verificar no checkout'}
                            </span>
                          </div>
                          
                          {selectedPaymentMethod === 'credits' && (
                            <Progress value={(userCredits / Math.max(userCredits, finalCost)) * 100} className="h-2" />
                          )}
                          
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

                    {/* Enhanced Protection & Extras */}
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
                            max={365}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-xs text-muted-foreground">
                            Protege o pixel contra alterações por outros utilizadores durante o período selecionado
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          </div>

                          <div className="space-y-4">
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

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="drawing-mode"
                                checked={isDrawingMode}
                                onCheckedChange={setIsDrawingMode}
                              />
                              <Label htmlFor="drawing-mode" className="flex items-center gap-2">
                                <Brush className="h-4 w-4" />
                                Modo desenho (+{drawingCost} Kz)
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Enhanced Price Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Resumo Detalhado do Preço
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
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
                          {isDrawingMode && (
                            <div className="flex justify-between">
                              <span>Modo desenho</span>
                              <span>+{drawingCost} Kz</span>
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
                          <div className="text-xs text-muted-foreground">
                            Valor estimado de mercado: {formatPrice(estimatedValue)} Kz
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="owner" className="mt-0 space-y-6">
                    {pixelData.owner ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informações do Proprietário
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary">
                              <AvatarImage src={pixelData.owner.avatarUrl} alt={pixelData.owner.name} />
                              <AvatarFallback>{pixelData.owner.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold">{pixelData.owner.name}</h3>
                                {pixelData.owner.isVerified && (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{pixelData.owner.username}</p>
                              <p className="text-sm">{pixelData.owner.bio}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-3 text-center">
                              <div className="text-2xl font-bold text-primary">{pixelData.owner.level}</div>
                              <div className="text-xs text-muted-foreground">Nível</div>
                            </Card>
                            <Card className="p-3 text-center">
                              <div className="text-2xl font-bold text-primary">{pixelData.owner.totalPixels}</div>
                              <div className="text-xs text-muted-foreground">Pixels</div>
                            </Card>
                            <Card className="p-3 text-center">
                              <div className="text-2xl font-bold text-primary">{pixelData.owner.reputation}</div>
                              <div className="text-xs text-muted-foreground">Reputação</div>
                            </Card>
                            <Card className="p-3 text-center">
                              <div className="text-2xl font-bold text-primary">{Math.floor((Date.now() - pixelData.owner.joinDate.getTime()) / (1000 * 60 * 60 * 24))}</div>
                              <div className="text-xs text-muted-foreground">Dias ativo</div>
                            </Card>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Membro desde:</span>
                              <span>{formatDate(pixelData.owner.joinDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Última atividade:</span>
                              <span>{formatDateTime(pixelData.owner.lastSeen)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Enviar Mensagem
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <User className="h-4 w-4 mr-2" />
                              Ver Perfil
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <div>Este pixel não tem proprietário</div>
                          <div className="text-sm text-muted-foreground">Seja o primeiro a adquiri-lo!</div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="draw" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Paintbrush className="h-5 w-5" />
                          Editor de Pixel Art
                        </CardTitle>
                        <CardDescription>
                          Desenhe diretamente no pixel ou faça upload de uma imagem
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Drawing Tools */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {drawingTools.map(tool => (
                              <Button
                                key={tool.id}
                                variant={selectedTool === tool.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTool(tool.id)}
                                className="flex items-center gap-2"
                              >
                                {tool.icon}
                                {tool.name}
                              </Button>
                            ))}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label>Tamanho do Pincel:</Label>
                              <Slider
                                value={brushSize}
                                onValueChange={setBrushSize}
                                min={1}
                                max={20}
                                step={1}
                                className="w-24"
                              />
                              <span className="text-sm font-mono w-8">{brushSize[0]}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                                <Undo className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= drawingHistory.length - 1}>
                                <Redo className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                              <Button variant="outline" size="sm" onClick={exportCanvas}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Canvas */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <canvas
                            ref={canvasRef}
                            className="border border-gray-300 cursor-crosshair max-w-full"
                            style={{ imageRendering: 'pixelated' }}
                            onMouseDown={startDrawing}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                          />
                        </div>

                        {/* Layers Panel */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              Camadas
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {layers.map(layer => (
                              <div key={layer.id} className="flex items-center gap-2 p-2 border rounded">
                                <Switch checked={layer.visible} />
                                <span className="flex-1 text-sm">{layer.name}</span>
                                <Slider
                                  value={[layer.opacity * 100]}
                                  max={100}
                                  step={1}
                                  className="w-16"
                                />
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Nova Camada
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Animation Controls */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Animação
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <SkipBack className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}>
                                {isAnimationPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="sm">
                                <SkipForward className="h-4 w-4" />
                              </Button>
                              <div className="flex items-center gap-2 flex-1">
                                <Label className="text-xs">Velocidade:</Label>
                                <Slider
                                  value={animationSpeed}
                                  onValueChange={setAnimationSpeed}
                                  min={0.1}
                                  max={3}
                                  step={0.1}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Frame {currentFrame + 1} de {animationFrames.length || 1}
                            </div>
                          </CardContent>
                        </Card>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0 space-y-6">
                    {/* Enhanced Market Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Análise Avançada de Mercado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="space-y-2">
                              <Label>Valor Estimado</Label>
                              <div className="text-3xl font-bold text-primary">
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
                          </Card>
                          
                          <Card className="p-4">
                            <div className="space-y-2">
                              <Label>Nível de Procura</Label>
                              <div className="space-y-1">
                                <Progress value={demandLevel} className="h-3" />
                                <div className="text-sm text-muted-foreground">
                                  {demandLevel > 70 ? 'Alta procura' : demandLevel > 30 ? 'Procura moderada' : 'Baixa procura'}
                                </div>
                              </div>
                            </div>
                          </Card>

                          <Card className="p-4">
                            <div className="space-y-2">
                              <Label>Preço Pico</Label>
                              <div className="text-3xl font-bold text-accent">
                                {formatPrice(pixelData.metadata?.peakPrice || 0)} Kz
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Máximo histórico
                              </div>
                            </div>
                          </Card>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{formatPrice(pixelData.views)}</div>
                            <div className="text-xs text-muted-foreground">Visualizações</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{pixelData.likes}</div>
                            <div className="text-xs text-muted-foreground">Gostos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{pixelData.history.length}</div>
                            <div className="text-xs text-muted-foreground">Transações</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{pixelData.metadata?.totalEdits || 0}</div>
                            <div className="text-xs text-muted-foreground">Edições</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{pixelData.metadata?.uniqueOwners || 0}</div>
                            <div className="text-xs text-muted-foreground">Proprietários</div>
                          </div>
                        </div>

                        {/* Neighborhood Analysis */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Análise da Vizinhança</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                              {[
                                { pos: 'nw', pixel: null },
                                { pos: 'n', pixel: pixelData.neighbors.north },
                                { pos: 'ne', pixel: null },
                                { pos: 'w', pixel: pixelData.neighbors.west },
                                { pos: 'center', pixel: pixelData },
                                { pos: 'e', pixel: pixelData.neighbors.east },
                                { pos: 'sw', pixel: null },
                                { pos: 's', pixel: pixelData.neighbors.south },
                                { pos: 'se', pixel: null }
                              ].map(({ pos, pixel }) => (
                                <div
                                  key={pos}
                                  className={cn(
                                    "aspect-square border-2 rounded",
                                    pos === 'center' ? "border-primary bg-primary/20" : "border-border",
                                    pixel ? "cursor-pointer hover:border-primary/50" : "bg-muted/30"
                                  )}
                                  style={{ backgroundColor: pixel?.color || undefined }}
                                  title={pixel ? `Pixel (${pixel.x}, ${pixel.y})` : 'Vazio'}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>

                    {/* Enhanced Price Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Histórico de Preços (90 dias)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1">
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
                                    {point.marketCap && (
                                      <div className="text-xs">Cap: {formatPrice(point.marketCap)} Kz</div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        {pixelData.metadata?.culturalSignificance && (
                          <div className="text-xs text-muted-foreground italic">
                            {pixelData.metadata.culturalSignificance}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Histórico Completo de Transações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pixelData.history.length > 0 ? (
                          <div className="space-y-4">
                            {pixelData.history.map((transaction) => (
                              <Card key={transaction.id} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                      {transaction.type === 'purchase' && <CreditCard className="h-5 w-5" />}
                                      {transaction.type === 'sale' && <TrendingUp className="h-5 w-5" />}
                                      {transaction.type === 'color_change' && <Palette className="h-5 w-5" />}
                                      {transaction.type === 'transfer' && <Share2 className="h-5 w-5" />}
                                      {transaction.type === 'auction' && <Gem className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {transaction.type === 'purchase' && 'Compra'}
                                        {transaction.type === 'sale' && 'Venda'}
                                        {transaction.type === 'color_change' && 'Alteração de Cor'}
                                        {transaction.type === 'transfer' && 'Transferência'}
                                        {transaction.type === 'auction' && 'Leilão'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDateTime(transaction.date)} • {transaction.buyer}
                                        {transaction.seller && ` ← ${transaction.seller}`}
                                      </div>
                                      {transaction.notes && (
                                        <div className="text-xs text-muted-foreground italic">
                                          {transaction.notes}
                                        </div>
                                      )}
                                      {transaction.transactionHash && (
                                        <div className="text-xs font-mono text-muted-foreground">
                                          Hash: {transaction.transactionHash.substring(0, 16)}...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">{formatPrice(transaction.price)} Kz</div>
                                    {transaction.fees > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        Taxa: {formatPrice(transaction.fees)} Kz
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <div className="text-lg">Nenhuma transação registada</div>
                            <div className="text-sm">Este pixel ainda não foi transacionado</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="community" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Comentários da Comunidade
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Add Comment */}
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Partilhe os seus pensamentos sobre este pixel..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex justify-end">
                            <Button onClick={addComment} disabled={!newComment.trim()}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comentar
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        {/* Comments List */}
                        <div className="space-y-4">
                          {pixelData?.comments?.length > 0 ? pixelData.comments.map((comment) => (
                            <Card key={comment.id} className="p-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                                  <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDateTime(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                      <Heart className="h-3 w-3 mr-1" />
                                      {comment.likes > 0 && comment.likes}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Responder
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )) : null}
                        </div>

                        {(!pixelData?.comments?.length) && (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <div>Ainda não há comentários</div>
                            <div className="text-sm">Seja o primeiro a comentar!</div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {similarPixels.map((pixel, index) => (
                            <Card key={index} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                <div 
                                  className="w-12 h-12 rounded border-2 border-border"
                                  style={{ backgroundColor: pixel.color }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">({pixel.x}, {pixel.y})</div>
                                  <div className="text-sm text-muted-foreground">{pixel.region}</div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Badge className={cn("text-xs", rarityConfig[pixel.rarity].color)}>
                                    {rarityConfig[pixel.rarity].label}
                                  </Badge>
                                  <div className="font-bold text-primary">{formatPrice(pixel.price)} Kz</div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{pixel.views} views</span>
                                  <span>{pixel.likes} likes</span>
                                </div>
                                {pixel.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {pixel.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Card>
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Processamento: {selectedMethod?.processingTime}</span>
              </div>
              {selectedMethod?.limits && (
                <div className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span>Limite: {formatPrice(selectedMethod.limits.min)} - {formatPrice(selectedMethod.limits.max)} Kz</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={!canAfford || isProcessing}
                className="min-w-[140px]"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Comprar por {formatPrice(finalCost)} Kz
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
