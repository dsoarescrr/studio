'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MapPin, Palette, Sparkles, Crown, Star, Gem, Heart, Eye, Clock, 
  CreditCard, Coins, Gift, Zap, Brush, Image as ImageIcon, Type, 
  Link as LinkIcon, Save, Download, Upload, Undo, Redo, RotateCcw,
  Layers, Grid, Pipette, PaintBucket, Eraser, Move, ZoomIn, ZoomOut,
  Play, Pause, Settings, Info, ShoppingCart, Loader2, CheckCircle,
  AlertTriangle, X, Plus, Minus, Copy, Share2, Wand2, Dice6, Lock,
  Unlock, Shield, Timer, Target, Award, Flame, Lightning, Rainbow,
  Fingerprint, Scissors, Maximize, Minimize, MoreHorizontal, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
type PaymentMethod = 'credits' | 'special_credits' | 'real_money';
type DrawingTool = 'brush' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rectangle' | 'circle';

interface PixelData {
  x: number;
  y: number;
  color?: string;
  owner?: string;
  price?: number;
  rarity?: PixelRarity;
  region?: string;
  isOwnedByCurrentUser?: boolean;
  isForSaleBySystem?: boolean;
  isForSaleByOwner?: boolean;
  salePrice?: number;
  title?: string;
  description?: string;
  tags?: string[];
  linkUrl?: string;
  pixelImageUrl?: string;
  dataAiHint?: string;
  gpsCoords?: { lat: number; lon: number; } | null;
  loreSnippet?: string;
  features?: string[];
  history?: Array<{ owner: string; date: string | Date; price: number; action?: string }>;
}

interface Customizations {
  color: string;
  title: string;
  description: string;
  tags: string[];
  linkUrl: string;
  drawingData?: string;
  imageFile?: File;
  isPublic: boolean;
  allowComments: boolean;
  enableAnimations: boolean;
  glowEffect: boolean;
  borderStyle: 'none' | 'solid' | 'dashed' | 'glow' | 'rainbow';
  opacity: number;
  rotation: number;
  scale: number;
  zIndex: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  };
  animation: {
    type: 'none' | 'pulse' | 'glow' | 'rotate' | 'bounce' | 'shake' | 'rainbow';
    speed: number;
    intensity: number;
  };
  sound: {
    enabled: boolean;
    type: 'none' | 'click' | 'chime' | 'pop' | 'whoosh' | 'custom';
    volume: number;
  };
}

interface EnhancedPixelPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixelData: PixelData;
  userCredits: number;
  userSpecialCredits: number;
  onPurchase: (pixelData: PixelData, paymentMethod: PaymentMethod, customizations: Customizations) => Promise<boolean>;
}

const rarityConfig: Record<PixelRarity, {
  label: string;
  multiplier: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
}> = {
  common: {
    label: 'Comum',
    multiplier: 1,
    color: 'text-gray-500',
    icon: <Star className="h-4 w-4" />,
    description: 'Pixel básico com funcionalidades padrão',
    features: ['Cor personalizada', 'Título e descrição', 'Tags básicas']
  },
  uncommon: {
    label: 'Incomum',
    multiplier: 2,
    color: 'text-green-500',
    icon: <Gem className="h-4 w-4" />,
    description: 'Pixel com características especiais',
    features: ['Efeitos visuais', 'Animações básicas', 'Link personalizado']
  },
  rare: {
    label: 'Raro',
    multiplier: 5,
    color: 'text-blue-500',
    icon: <Crown className="h-4 w-4" />,
    description: 'Pixel com poderes únicos',
    features: ['Efeitos avançados', 'Animações complexas', 'Sons personalizados']
  },
  epic: {
    label: 'Épico',
    multiplier: 10,
    color: 'text-purple-500',
    icon: <Lightning className="h-4 w-4" />,
    description: 'Pixel com características extraordinárias',
    features: ['Efeitos 3D', 'Interatividade avançada', 'NFT opcional']
  },
  legendary: {
    label: 'Lendário',
    multiplier: 25,
    color: 'text-orange-500',
    icon: <Flame className="h-4 w-4" />,
    description: 'Pixel de poder supremo',
    features: ['Todos os efeitos', 'IA integrada', 'Royalties de revenda']
  },
  unique: {
    label: 'Único',
    multiplier: 100,
    color: 'text-pink-500',
    icon: <Rainbow className="h-4 w-4" />,
    description: 'Pixel único no universo',
    features: ['Características únicas', 'Poderes especiais', 'Lore personalizada']
  }
};

const predefinedColors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000',
  '#FFFFFF', '#FFD700', '#C0C0C0', '#8B4513', '#90EE90', '#87CEEB',
  '#DDA0DD', '#F0E68C', '#FF6347', '#40E0D0', '#EE82EE', '#F5DEB3'
];

const drawingTools: Array<{ id: DrawingTool; label: string; icon: React.ReactNode }> = [
  { id: 'brush', label: 'Pincel', icon: <Brush className="h-4 w-4" /> },
  { id: 'eraser', label: 'Borracha', icon: <Eraser className="h-4 w-4" /> },
  { id: 'fill', label: 'Balde', icon: <PaintBucket className="h-4 w-4" /> },
  { id: 'eyedropper', label: 'Conta-gotas', icon: <Pipette className="h-4 w-4" /> },
  { id: 'line', label: 'Linha', icon: <Minus className="h-4 w-4" /> },
  { id: 'rectangle', label: 'Retângulo', icon: <Grid className="h-4 w-4" /> },
  { id: 'circle', label: 'Círculo', icon: <Target className="h-4 w-4" /> },
];

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
  const [purchaseStep, setPurchaseStep] = useState<'customize' | 'payment' | 'processing' | 'success'>('customize');
  const [selectedTool, setSelectedTool] = useState<DrawingTool>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [customizations, setCustomizations] = useState<Customizations>({
    color: pixelData.color || '#FF0000',
    title: pixelData.title || '',
    description: pixelData.description || '',
    tags: pixelData.tags || [],
    linkUrl: pixelData.linkUrl || '',
    isPublic: true,
    allowComments: true,
    enableAnimations: false,
    glowEffect: false,
    borderStyle: 'none',
    opacity: 100,
    rotation: 0,
    scale: 100,
    zIndex: 1,
    blendMode: 'normal',
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
    },
    animation: {
      type: 'none',
      speed: 1,
      intensity: 50,
    },
    sound: {
      enabled: false,
      type: 'none',
      volume: 50,
    },
  });

  const currentRarity: PixelRarity = pixelData.rarity || 'common';
  const basePrice = 1; // 1€ base price
  const finalPrice = basePrice * rarityConfig[currentRarity].multiplier;
  const config = rarityConfig[currentRarity];

  // Canvas drawing functionality
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;
    
    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1;
      const gridSize = 20;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }, [showGrid]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-9), dataURL]); // Keep last 10 states
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    const previousState = undoStack[undoStack.length - 1];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    const nextState = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nextState;
  }, [redoStack]);

  const clearCanvas = useCallback(() => {
    saveCanvasState();
    initializeCanvas();
  }, [saveCanvasState, initializeCanvas]);

  // Drawing event handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    saveCanvasState();
    // Add drawing logic here based on selectedTool
  }, [saveCanvasState, selectedTool]);

  useEffect(() => {
    if (isOpen) {
      initializeCanvas();
    }
  }, [isOpen, initializeCanvas]);

  const updateCustomization = <K extends keyof Customizations>(
    key: K,
    value: Customizations[K]
  ) => {
    setCustomizations(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !customizations.tags.includes(tag.trim())) {
      updateCustomization('tags', [...customizations.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateCustomization('tags', customizations.tags.filter(tag => tag !== tagToRemove));
  };

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateCustomization('color', randomColor);
  };

  const canAfford = () => {
    switch (paymentMethod) {
      case 'credits':
        return userCredits >= finalPrice;
      case 'special_credits':
        return userSpecialCredits >= Math.ceil(finalPrice / 10);
      case 'real_money':
        return true; // Assume real money is always available
      default:
        return false;
    }
  };

  const getPaymentAmount = () => {
    switch (paymentMethod) {
      case 'credits':
        return `${finalPrice} Créditos`;
      case 'special_credits':
        return `${Math.ceil(finalPrice / 10)} Créditos Especiais`;
      case 'real_money':
        return `${finalPrice}€`;
      default:
        return '';
    }
  };

  const handlePurchase = async () => {
    if (!canAfford()) {
      toast({
        title: "Fundos Insuficientes",
        description: "Não tem créditos suficientes para esta compra.",
        variant: "destructive"
      });
      return;
    }

    setPurchaseProcessing(true);
    setPurchaseStep('processing');

    try {
      // Save canvas as drawing data
      const canvas = canvasRef.current;
      if (canvas) {
        const drawingData = canvas.toDataURL();
        updateCustomization('drawingData', drawingData);
      }

      const success = await onPurchase(pixelData, paymentMethod, {
        ...customizations,
        drawingData: canvas?.toDataURL()
      });

      if (success) {
        setPurchaseStep('success');
        toast({
          title: "Compra Realizada!",
          description: `Pixel (${pixelData.x}, ${pixelData.y}) adquirido com sucesso!`,
        });
        
        setTimeout(() => {
          onClose();
          setPurchaseStep('customize');
        }, 3000);
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      toast({
        title: "Erro na Compra",
        description: "Ocorreu um erro ao processar a compra. Tente novamente.",
        variant: "destructive"
      });
      setPurchaseStep('payment');
    } finally {
      setPurchaseProcessing(false);
    }
  };

  const exportPixelArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `pixel-${pixelData.x}-${pixelData.y}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (purchaseStep === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Compra Realizada!</h2>
            <p className="text-muted-foreground mb-4">
              O seu pixel ({pixelData.x}, {pixelData.y}) foi adquirido com sucesso!
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Pode agora visualizar e editar o seu pixel no mapa.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="h-6 w-6 text-primary" />
                Pixel ({pixelData.x}, {pixelData.y})
                <Badge className={cn("ml-2", config.color)}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {config.description} • {pixelData.region}
                {pixelData.gpsCoords && (
                  <span className="ml-2 text-xs">
                    GPS: {pixelData.gpsCoords.lat.toFixed(4)}, {pixelData.gpsCoords.lon.toFixed(4)}
                  </span>
                )}
              </DialogDescription>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {getPaymentAmount()}
              </div>
              <div className="text-sm text-muted-foreground">
                Preço base: {basePrice}€ × {config.multiplier}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Customization */}
          <div className="w-1/2 border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b px-4 py-2">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="effects">Efeitos</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <TabsContent value="overview" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Informações do Pixel</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={customizations.title}
                            onChange={(e) => updateCustomization('title', e.target.value)}
                            placeholder="Dê um nome ao seu pixel..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={customizations.description}
                            onChange={(e) => updateCustomization('description', e.target.value)}
                            placeholder="Descreva o seu pixel..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="linkUrl">Link (opcional)</Label>
                          <Input
                            id="linkUrl"
                            value={customizations.linkUrl}
                            onChange={(e) => updateCustomization('linkUrl', e.target.value)}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {customizations.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Adicionar tag..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addTag(e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Características da Raridade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {config.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Cor Principal
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={customizations.color}
                            onChange={(e) => updateCustomization('color', e.target.value)}
                            className="w-16 h-16 rounded-lg border border-border cursor-pointer"
                          />
                          <div className="flex-1">
                            <Input
                              value={customizations.color}
                              onChange={(e) => updateCustomization('color', e.target.value)}
                              placeholder="#FF0000"
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={generateRandomColor}>
                            <Dice6 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Cores Predefinidas</Label>
                          <div className="grid grid-cols-8 gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                className={cn(
                                  "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                                  customizations.color === color ? "border-primary" : "border-border"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => updateCustomization('color', color)}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Estilo Visual</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Opacidade: {customizations.opacity}%</Label>
                          <Slider
                            value={[customizations.opacity]}
                            onValueChange={([value]) => updateCustomization('opacity', value)}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Rotação: {customizations.rotation}°</Label>
                          <Slider
                            value={[customizations.rotation]}
                            onValueChange={([value]) => updateCustomization('rotation', value)}
                            min={-180}
                            max={180}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Escala: {customizations.scale}%</Label>
                          <Slider
                            value={[customizations.scale]}
                            onValueChange={([value]) => updateCustomization('scale', value)}
                            min={50}
                            max={200}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Estilo da Borda</Label>
                          <Select
                            value={customizations.borderStyle}
                            onValueChange={(value: any) => updateCustomization('borderStyle', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem borda</SelectItem>
                              <SelectItem value="solid">Sólida</SelectItem>
                              <SelectItem value="dashed">Tracejada</SelectItem>
                              <SelectItem value="glow">Brilho</SelectItem>
                              <SelectItem value="rainbow">Arco-íris</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Efeitos Visuais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Efeito de Brilho</Label>
                          <Switch
                            checked={customizations.glowEffect}
                            onCheckedChange={(checked) => updateCustomization('glowEffect', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Animações</Label>
                          <Switch
                            checked={customizations.enableAnimations}
                            onCheckedChange={(checked) => updateCustomization('enableAnimations', checked)}
                          />
                        </div>

                        {customizations.enableAnimations && (
                          <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                            <div>
                              <Label>Tipo de Animação</Label>
                              <Select
                                value={customizations.animation.type}
                                onValueChange={(value: any) => 
                                  updateCustomization('animation', { ...customizations.animation, type: value })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhuma</SelectItem>
                                  <SelectItem value="pulse">Pulso</SelectItem>
                                  <SelectItem value="glow">Brilho</SelectItem>
                                  <SelectItem value="rotate">Rotação</SelectItem>
                                  <SelectItem value="bounce">Salto</SelectItem>
                                  <SelectItem value="shake">Vibração</SelectItem>
                                  <SelectItem value="rainbow">Arco-íris</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Velocidade: {customizations.animation.speed}x</Label>
                              <Slider
                                value={[customizations.animation.speed]}
                                onValueChange={([value]) => 
                                  updateCustomization('animation', { ...customizations.animation, speed: value })
                                }
                                min={0.1}
                                max={3}
                                step={0.1}
                                className="mt-2"
                              />
                            </div>

                            <div>
                              <Label>Intensidade: {customizations.animation.intensity}%</Label>
                              <Slider
                                value={[customizations.animation.intensity]}
                                onValueChange={([value]) => 
                                  updateCustomization('animation', { ...customizations.animation, intensity: value })
                                }
                                max={100}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Filtros</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Brilho: {customizations.filters.brightness}%</Label>
                          <Slider
                            value={[customizations.filters.brightness]}
                            onValueChange={([value]) => 
                              updateCustomization('filters', { ...customizations.filters, brightness: value })
                            }
                            max={200}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Contraste: {customizations.filters.contrast}%</Label>
                          <Slider
                            value={[customizations.filters.contrast]}
                            onValueChange={([value]) => 
                              updateCustomization('filters', { ...customizations.filters, contrast: value })
                            }
                            max={200}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Saturação: {customizations.filters.saturation}%</Label>
                          <Slider
                            value={[customizations.filters.saturation]}
                            onValueChange={([value]) => 
                              updateCustomization('filters', { ...customizations.filters, saturation: value })
                            }
                            max={200}
                            step={1}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Matiz: {customizations.filters.hue}°</Label>
                          <Slider
                            value={[customizations.filters.hue]}
                            onValueChange={([value]) => 
                              updateCustomization('filters', { ...customizations.filters, hue: value })
                            }
                            min={-180}
                            max={180}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-0">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Público</Label>
                          <Switch
                            checked={customizations.isPublic}
                            onCheckedChange={(checked) => updateCustomization('isPublic', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Permitir Comentários</Label>
                          <Switch
                            checked={customizations.allowComments}
                            onCheckedChange={(checked) => updateCustomization('allowComments', checked)}
                          />
                        </div>

                        <div>
                          <Label>Modo de Mistura</Label>
                          <Select
                            value={customizations.blendMode}
                            onValueChange={(value: any) => updateCustomization('blendMode', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="multiply">Multiplicar</SelectItem>
                              <SelectItem value="screen">Tela</SelectItem>
                              <SelectItem value="overlay">Sobreposição</SelectItem>
                              <SelectItem value="soft-light">Luz Suave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Z-Index: {customizations.zIndex}</Label>
                          <Slider
                            value={[customizations.zIndex]}
                            onValueChange={([value]) => updateCustomization('zIndex', value)}
                            min={1}
                            max={10}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Efeitos Sonoros
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Ativar Sons</Label>
                          <Switch
                            checked={customizations.sound.enabled}
                            onCheckedChange={(checked) => 
                              updateCustomization('sound', { ...customizations.sound, enabled: checked })
                            }
                          />
                        </div>

                        {customizations.sound.enabled && (
                          <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                            <div>
                              <Label>Tipo de Som</Label>
                              <Select
                                value={customizations.sound.type}
                                onValueChange={(value: any) => 
                                  updateCustomization('sound', { ...customizations.sound, type: value })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  <SelectItem value="click">Click</SelectItem>
                                  <SelectItem value="chime">Sino</SelectItem>
                                  <SelectItem value="pop">Pop</SelectItem>
                                  <SelectItem value="whoosh">Whoosh</SelectItem>
                                  <SelectItem value="custom">Personalizado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Volume: {customizations.sound.volume}%</Label>
                              <Slider
                                value={[customizations.sound.volume]}
                                onValueChange={([value]) => 
                                  updateCustomization('sound', { ...customizations.sound, volume: value })
                                }
                                max={100}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right Panel - Preview & Drawing */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold mb-4">Editor Visual</h3>
              
              {/* Drawing Tools */}
              <div className="flex items-center gap-2 mb-4">
                {drawingTools.map((tool) => (
                  <TooltipProvider key={tool.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedTool === tool.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTool(tool.id)}
                        >
                          {tool.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{tool.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                
                <Separator orientation="vertical" className="h-6 mx-2" />
                
                <Button variant="outline" size="sm" onClick={undo} disabled={undoStack.length === 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={redoStack.length === 0}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Separator orientation="vertical" className="h-6 mx-2" />
                
                <Button variant="outline" size="sm" onClick={exportPixelArt}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              {/* Tool Options */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Tamanho:</Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([value]) => setBrushSize(value)}
                    min={1}
                    max={20}
                    step={1}
                    className="w-20"
                  />
                  <span className="text-sm w-6">{brushSize}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Zoom:</Label>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.25))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{Math.round(canvasZoom * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.min(3, canvasZoom + 0.25))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                  <Label className="text-sm">Grelha</Label>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-4 bg-gray-50">
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 h-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded cursor-crosshair"
                  style={{ transform: `scale(${canvasZoom})` }}
                  onMouseDown={handleCanvasMouseDown}
                />
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t p-4 bg-card">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Método de Pagamento</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credits" id="credits" />
                      <Label htmlFor="credits" className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary" />
                        Créditos ({userCredits.toLocaleString()})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="special_credits" id="special_credits" />
                      <Label htmlFor="special_credits" className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-accent" />
                        Créditos Especiais ({userSpecialCredits.toLocaleString()})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="real_money" id="real_money" />
                      <Label htmlFor="real_money" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-500" />
                        Dinheiro Real
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handlePurchase} 
                    disabled={!canAfford() || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Comprar por {getPaymentAmount()}
                      </>
                    )}
                  </Button>
                </div>

                {!canAfford() && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Fundos insuficientes para este método de pagamento
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}