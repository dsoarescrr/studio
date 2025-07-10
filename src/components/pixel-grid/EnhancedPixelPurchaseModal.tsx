'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Slider } from '@/components/ui/slider';
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
  Bookmark, MessageSquare, Flag, Copy, ExternalLink, History, Award,
  Brush, Eraser, Undo, Redo, RotateCcw, Download, Upload, Layers,
  Move, ZoomIn, ZoomOut, Grid, Pipette, Crop, Filter, Wand2,
  Save, FileImage, Camera, Scissors, PaintBucket, Pencil, Square,
  Circle, Triangle, Type, Sticker, Sparkle, Rainbow, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type PaymentMethod = 'credits' | 'special_credits' | 'real_money';
type DrawingTool = 'brush' | 'eraser' | 'bucket' | 'eyedropper' | 'line' | 'rectangle' | 'circle' | 'text';
type FilterType = 'none' | 'blur' | 'sharpen' | 'vintage' | 'sepia' | 'grayscale' | 'invert' | 'brightness' | 'contrast';

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

interface DrawingState {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  opacity: number;
  layers: CanvasLayer[];
  activeLayer: number;
  history: ImageData[];
  historyIndex: number;
}

interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  canvas: HTMLCanvasElement;
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
  drawingData?: string;
  filters: FilterType[];
  animation?: {
    enabled: boolean;
    type: 'fade' | 'slide' | 'bounce' | 'pulse';
    duration: number;
  };
}

interface EnhancedPixelPurchaseModalProps {
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

const drawingTools = [
  { id: 'brush', label: 'Pincel', icon: <Brush className="h-4 w-4" /> },
  { id: 'eraser', label: 'Borracha', icon: <Eraser className="h-4 w-4" /> },
  { id: 'bucket', label: 'Balde', icon: <PaintBucket className="h-4 w-4" /> },
  { id: 'eyedropper', label: 'Conta-gotas', icon: <Pipette className="h-4 w-4" /> },
  { id: 'line', label: 'Linha', icon: <Pencil className="h-4 w-4" /> },
  { id: 'rectangle', label: 'Retângulo', icon: <Square className="h-4 w-4" /> },
  { id: 'circle', label: 'Círculo', icon: <Circle className="h-4 w-4" /> },
  { id: 'text', label: 'Texto', icon: <Type className="h-4 w-4" /> },
];

const colorPalettes = {
  basic: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'],
  warm: ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500', '#FF3838', '#FF9F43', '#FF6348'],
  cool: ['#3742FA', '#2F3542', '#40739E', '#487EB0', '#0ABDE3', '#006BA6', '#1B9CFC', '#3C6382'],
  nature: ['#2ECC71', '#27AE60', '#16A085', '#1ABC9C', '#F39C12', '#E67E22', '#D35400', '#8E44AD'],
  pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6E6FA', '#FFB6C1', '#F0E68C'],
};

const filterPresets: Record<FilterType, string> = {
  none: 'none',
  blur: 'blur(2px)',
  sharpen: 'contrast(150%) brightness(110%)',
  vintage: 'sepia(50%) contrast(120%) brightness(90%)',
  sepia: 'sepia(100%)',
  grayscale: 'grayscale(100%)',
  invert: 'invert(100%)',
  brightness: 'brightness(150%)',
  contrast: 'contrast(150%)',
};

export default function EnhancedPixelPurchaseModal({
  isOpen,
  onClose,
  pixelData,
  userCredits,
  userSpecialCredits,
  onPurchase
}: EnhancedPixelPurchaseModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credits');
  const [isProcessing, setPurchaseProcessing] = useState(false);
  const [purchaseProgress, setPurchaseProgress] = useState(0);
  
  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: 'brush',
    color: '#D4A757',
    brushSize: 5,
    opacity: 100,
    layers: [],
    activeLayer: 0,
    history: [],
    historyIndex: -1,
  });
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>('basic');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  
  const [customizations, setCustomizations] = useState<PurchaseCustomizations>({
    color: '#D4A757',
    description: '',
    title: pixelData ? `Meu Pixel (${pixelData.x}, ${pixelData.y})` : '',
    tags: [],
    linkUrl: '',
    isPublic: true,
    allowComments: true,
    filters: [],
    animation: {
      enabled: false,
      type: 'fade',
      duration: 1000,
    }
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FilterType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (pixelData) {
      setCustomizations(prev => ({
        ...prev,
        color: pixelData.color || '#D4A757',
        description: pixelData.description || `Pixel adquirido na região de ${pixelData.region}`,
        title: `Meu Pixel (${pixelData.x}, ${pixelData.y})`,
        tags: pixelData.tags || [],
      }));
    }
  }, [pixelData]);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && drawingState.layers.length === 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 400;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create initial layer
        const initialLayer: CanvasLayer = {
          id: 'layer-0',
          name: 'Background',
          visible: true,
          opacity: 100,
          blendMode: 'normal',
          canvas: canvas,
        };
        
        setDrawingState(prev => ({
          ...prev,
          layers: [initialLayer],
          activeLayer: 0,
        }));
        
        saveToHistory();
      }
    }
  }, [canvasRef.current]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    setDrawingState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(imageData);
      
      return {
        ...prev,
        history: newHistory.slice(-20), // Keep last 20 states
        historyIndex: Math.min(newHistory.length - 1, 19),
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (drawingState.historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = drawingState.historyIndex - 1;
      ctx.putImageData(drawingState.history[newIndex], 0, 0);
      
      setDrawingState(prev => ({
        ...prev,
        historyIndex: newIndex,
      }));
    }
  }, [drawingState.historyIndex, drawingState.history]);

  const redo = useCallback(() => {
    if (drawingState.historyIndex < drawingState.history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = drawingState.historyIndex + 1;
      ctx.putImageData(drawingState.history[newIndex], 0, 0);
      
      setDrawingState(prev => ({
        ...prev,
        historyIndex: newIndex,
      }));
    }
  }, [drawingState.historyIndex, drawingState.history]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLastPoint(pos);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalAlpha = drawingState.opacity / 100;
    ctx.strokeStyle = drawingState.color;
    ctx.fillStyle = drawingState.color;
    ctx.lineWidth = drawingState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (drawingState.tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, drawingState.brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, drawingState.brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [getMousePos, drawingState]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (drawingState.tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    
    setLastPoint(pos);
  }, [isDrawing, lastPoint, getMousePos, drawingState.tool]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomizations(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        
        // Load image onto canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              saveToHistory();
            };
            img.src = result;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilter = (filter: FilterType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Apply CSS filter to canvas
    ctx.filter = filterPresets[filter];
    
    // Redraw canvas with filter
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    setAppliedFilters(prev => [...prev, filter]);
    saveToHistory();
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `pixel-art-${pixelData?.x}-${pixelData?.y}.png`;
    link.href = dataURL;
    link.click();
    
    toast({
      title: "Arte Exportada",
      description: "A sua criação foi exportada com sucesso!",
    });
  };

  const handlePurchase = async () => {
    if (!pixelData) return;
    
    const finalPrice = Math.round(pixelData.price * rarityConfig[pixelData.rarity].multiplier);
    
    if (!((paymentMethod === 'credits' && userCredits >= finalPrice) ||
          (paymentMethod === 'special_credits' && userSpecialCredits >= Math.round(finalPrice * 0.1)))) {
      toast({
        title: "Fundos Insuficientes",
        description: "Não tem créditos suficientes para esta compra.",
        variant: "destructive"
      });
      return;
    }

    setPurchaseProcessing(true);
    setPurchaseProgress(0);

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
      // Save canvas data
      const canvas = canvasRef.current;
      const drawingData = canvas?.toDataURL('image/png');
      
      const finalCustomizations = {
        ...customizations,
        drawingData,
        filters: appliedFilters,
      };
      
      const success = await onPurchase(pixelData, paymentMethod, finalCustomizations);
      
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

  if (!pixelData) return null;

  const rarity = rarityConfig[pixelData.rarity];
  const finalPrice = Math.round(pixelData.price * rarity.multiplier);
  const canAffordCredits = userCredits >= finalPrice;
  const canAffordSpecialCredits = userSpecialCredits >= Math.round(finalPrice * 0.1);
  const realMoneyPrice = (finalPrice * 0.01).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
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
              <DialogDescription className="mt-2 flex items-center gap-6 text-base">
                <span>Região: {pixelData.region}</span>
                <span>•</span>
                <span>Views: {pixelData.views}</span>
                <span>•</span>
                <span>Likes: {pixelData.likes}</span>
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{finalPrice}</div>
              <div className="text-xs text-muted-foreground">créditos</div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Left Panel - Pixel Info & Drawing */}
          <div className="w-full lg:w-1/2 border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="border-b px-4 py-2">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="drawing">Desenho</TabsTrigger>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
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
                </TabsContent>

                <TabsContent value="drawing" className="space-y-4 mt-0">
                  {/* Drawing Canvas */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Editor de Arte Pixel</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={undo}
                            disabled={drawingState.historyIndex <= 0}
                          >
                            <Undo className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={redo}
                            disabled={drawingState.historyIndex >= drawingState.history.length - 1}
                          >
                            <Redo className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCanvas}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportCanvas}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Canvas */}
                        <div className="relative border rounded-lg overflow-hidden bg-white">
                          <canvas
                            ref={canvasRef}
                            className="w-full h-80 cursor-crosshair"
                            style={{
                              imageRendering: 'pixelated',
                              transform: `scale(${zoom / 100})`,
                              transformOrigin: 'top left',
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                          />
                          {showGrid && (
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                              <svg className="w-full h-full">
                                <defs>
                                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Drawing Tools */}
                        <div className="grid grid-cols-4 gap-2">
                          {drawingTools.map((tool) => (
                            <Button
                              key={tool.id}
                              variant={drawingState.tool === tool.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setDrawingState(prev => ({ ...prev, tool: tool.id as DrawingTool }))}
                              className="flex flex-col items-center gap-1 h-auto py-2"
                            >
                              {tool.icon}
                              <span className="text-xs">{tool.label}</span>
                            </Button>
                          ))}
                        </div>

                        {/* Tool Settings */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Tamanho do Pincel</Label>
                            <Slider
                              value={[drawingState.brushSize]}
                              onValueChange={([value]) => setDrawingState(prev => ({ ...prev, brushSize: value }))}
                              min={1}
                              max={50}
                              step={1}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {drawingState.brushSize}px
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">Opacidade</Label>
                            <Slider
                              value={[drawingState.opacity]}
                              onValueChange={([value]) => setDrawingState(prev => ({ ...prev, opacity: value }))}
                              min={1}
                              max={100}
                              step={1}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {drawingState.opacity}%
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">Zoom</Label>
                            <Slider
                              value={[zoom]}
                              onValueChange={([value]) => setZoom(value)}
                              min={25}
                              max={400}
                              step={25}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {zoom}%
                            </div>
                          </div>
                        </div>

                        {/* Color Palettes */}
                        <div className="space-y-2">
                          <Label className="text-sm">Paleta de Cores</Label>
                          <Select value={selectedPalette} onValueChange={(value: keyof typeof colorPalettes) => setSelectedPalette(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Básica</SelectItem>
                              <SelectItem value="warm">Quente</SelectItem>
                              <SelectItem value="cool">Fria</SelectItem>
                              <SelectItem value="nature">Natureza</SelectItem>
                              <SelectItem value="pastel">Pastel</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="grid grid-cols-8 gap-1">
                            {colorPalettes[selectedPalette].map((color) => (
                              <button
                                key={color}
                                className={cn(
                                  "w-8 h-8 rounded border-2 transition-all",
                                  drawingState.color === color ? "border-primary scale-110" : "border-border hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => setDrawingState(prev => ({ ...prev, color }))}
                              />
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={drawingState.color}
                              onChange={(e) => setDrawingState(prev => ({ ...prev, color: e.target.value }))}
                              className="w-12 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={drawingState.color}
                              onChange={(e) => setDrawingState(prev => ({ ...prev, color: e.target.value }))}
                              placeholder="#000000"
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <Label className="text-sm">Carregar Imagem</Label>
                          <div className="mt-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="canvas-image-upload"
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('canvas-image-upload')?.click()}
                              className="w-full"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Carregar Imagem
                            </Button>
                          </div>
                        </div>

                        {/* Canvas Options */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="show-grid"
                              checked={showGrid}
                              onCheckedChange={setShowGrid}
                            />
                            <Label htmlFor="show-grid" className="text-sm">Mostrar Grelha</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4 mt-0">
                  {/* Filters */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Filtros e Efeitos</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(filterPresets).map(([filter, _]) => (
                          <Button
                            key={filter}
                            variant={appliedFilters.includes(filter as FilterType) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => applyFilter(filter as FilterType)}
                            className="text-xs"
                          >
                            <Filter className="h-3 w-3 mr-1" />
                            {filter === 'none' ? 'Nenhum' :
                             filter === 'blur' ? 'Desfoque' :
                             filter === 'sharpen' ? 'Nitidez' :
                             filter === 'vintage' ? 'Vintage' :
                             filter === 'sepia' ? 'Sépia' :
                             filter === 'grayscale' ? 'P&B' :
                             filter === 'invert' ? 'Inverter' :
                             filter === 'brightness' ? 'Brilho' :
                             filter === 'contrast' ? 'Contraste' : filter}
                          </Button>
                        ))}
                      </div>
                      
                      {appliedFilters.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-sm">Filtros Aplicados</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {appliedFilters.map((filter, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {filter}
                                <button
                                  onClick={() => setAppliedFilters(prev => prev.filter((_, i) => i !== index))}
                                  className="ml-1 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Animation Settings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Animações</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enable-animation"
                          checked={customizations.animation?.enabled || false}
                          onCheckedChange={(checked) => 
                            setCustomizations(prev => ({
                              ...prev,
                              animation: { ...prev.animation!, enabled: checked }
                            }))
                          }
                        />
                        <Label htmlFor="enable-animation" className="text-sm">Ativar Animação</Label>
                      </div>
                      
                      {customizations.animation?.enabled && (
                        <>
                          <div>
                            <Label className="text-sm">Tipo de Animação</Label>
                            <Select
                              value={customizations.animation.type}
                              onValueChange={(value: 'fade' | 'slide' | 'bounce' | 'pulse') =>
                                setCustomizations(prev => ({
                                  ...prev,
                                  animation: { ...prev.animation!, type: value }
                                }))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fade">Fade</SelectItem>
                                <SelectItem value="slide">Deslizar</SelectItem>
                                <SelectItem value="bounce">Saltar</SelectItem>
                                <SelectItem value="pulse">Pulsar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Duração (ms)</Label>
                            <Slider
                              value={[customizations.animation.duration]}
                              onValueChange={([value]) =>
                                setCustomizations(prev => ({
                                  ...prev,
                                  animation: { ...prev.animation!, duration: value }
                                }))
                              }
                              min={100}
                              max={5000}
                              step={100}
                              className="mt-1"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {customizations.animation.duration}ms
                            </div>
                          </div>
                        </>
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

                    {/* Tags */}
                    <div>
                      <Label className="text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Tags (separadas por vírgula)
                      </Label>
                      <Input
                        value={customizations.tags.join(', ')}
                        onChange={(e) => setCustomizations(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        placeholder="arte, pixel, portugal..."
                        className="mt-1"
                      />
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