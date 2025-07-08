
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Palette, ShoppingCart, Eye, Sparkles, Target, Coins, Gift, Info, Wand2, MousePointer2, Crosshair, Move, Search, Filter, Zap, Star, Crown, Gem, Heart, TrendingUp, Activity, Layers, Grid3X3, Maximize2, Minimize2, RotateCw, Paintbrush, Pipette, Save, Share2, Download, Upload, Timer, Flame, CloudLightning as Lightning, Rocket, Diamond, Trophy } from 'lucide-react';
import PortugalMapSvg from './PortugalMapSvg';
import { mapPixelToApproxGps } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Enhanced types and interfaces
interface Pixel {
  id: string;
  x: number;
  y: number;
  color: string;
  owner?: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  lastModified: Date;
  views: number;
  likes: number;
  description?: string;
  tags?: string[];
  region?: string;
  coordinates?: { lat: number; lon: number };
  specialEffects?: string[];
  isHot?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ToolState {
  mode: 'view' | 'buy' | 'paint' | 'inspect' | 'measure';
  brush: {
    size: number;
    opacity: number;
    pattern: 'solid' | 'gradient' | 'texture';
  };
  filter: {
    rarity: string[];
    priceRange: [number, number];
    owner: string;
    region: string;
    showOwned: boolean;
    showAvailable: boolean;
  };
}

// Enhanced constants
const GRID_SIZE = 100;
const PIXEL_SIZE = 8;
const MIN_SCALE = 0.1;
const MAX_SCALE = 20;
const ANIMATION_DURATION = 300;
const PULSE_INTERVAL = 2000;
const SPARKLE_INTERVAL = 3000;

// Rarity configurations
const RARITY_CONFIG = {
  common: { 
    color: '#94a3b8', 
    glow: 'rgba(148, 163, 184, 0.3)', 
    price: 10,
    probability: 0.7,
    effects: []
  },
  rare: { 
    color: '#3b82f6', 
    glow: 'rgba(59, 130, 246, 0.5)', 
    price: 50,
    probability: 0.2,
    effects: ['pulse']
  },
  epic: { 
    color: '#8b5cf6', 
    glow: 'rgba(139, 92, 246, 0.7)', 
    price: 200,
    probability: 0.08,
    effects: ['pulse', 'sparkle']
  },
  legendary: { 
    color: '#f59e0b', 
    glow: 'rgba(245, 158, 11, 0.9)', 
    price: 1000,
    probability: 0.02,
    effects: ['pulse', 'sparkle', 'rainbow']
  }
};

// Generate enhanced pixel data
const generatePixelData = (): Pixel[] => {
  const pixels: Pixel[] = [];
  const regions = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira'];
  
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      const rand = Math.random();
      let rarity: Pixel['rarity'] = 'common';
      
      if (rand < RARITY_CONFIG.legendary.probability) rarity = 'legendary';
      else if (rand < RARITY_CONFIG.epic.probability + RARITY_CONFIG.legendary.probability) rarity = 'epic';
      else if (rand < RARITY_CONFIG.rare.probability + RARITY_CONFIG.epic.probability + RARITY_CONFIG.legendary.probability) rarity = 'rare';
      
      const config = RARITY_CONFIG[rarity];
      const coordinates = mapPixelToApproxGps(x, y, GRID_SIZE, GRID_SIZE);
      
      pixels.push({
        id: `pixel-${x}-${y}`,
        x,
        y,
        color: config.color,
        price: config.price + Math.floor(Math.random() * config.price * 0.5),
        rarity,
        isOwned: Math.random() < 0.15,
        owner: Math.random() < 0.15 ? `User${Math.floor(Math.random() * 1000)}` : undefined,
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        description: Math.random() < 0.3 ? `Pixel especial em ${regions[Math.floor(Math.random() * regions.length)]}` : undefined,
        tags: Math.random() < 0.4 ? ['arte', 'paisagem', 'cidade'].slice(0, Math.floor(Math.random() * 3) + 1) : undefined,
        region: regions[Math.floor(Math.random() * regions.length)],
        coordinates,
        specialEffects: config.effects,
        isHot: Math.random() < 0.05,
        isTrending: Math.random() < 0.03,
        isNew: Math.random() < 0.08
      });
    }
  }
  
  return pixels;
};

export default function PixelGrid() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [mapTexture, setMapTexture] = useState<CanvasPattern | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [tools, setTools] = useState<ToolState>({
    mode: 'view',
    brush: { size: 1, opacity: 1, pattern: 'solid' },
    filter: {
      rarity: [],
      priceRange: [0, 2000],
      owner: '',
      region: '',
      showOwned: true,
      showAvailable: true
    }
  });
  
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<Pixel | null>(null);
  const [showPixelDialog, setShowPixelDialog] = useState(false);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, intensity: number}>>([]);
  const [particleStyles, setParticleStyles] = useState<React.CSSProperties[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTouchDistance = useRef<number>(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  const { toast } = useToast();

  const handleImageReady = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        setMapTexture(pattern);
        setIsMapReady(true);
      }
      URL.revokeObjectURL(dataUrl); // Clean up
    };
    img.onerror = () => {
        console.error("Failed to load map image for texture.");
    }
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    const styles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));
    setParticleStyles(styles);
  }, []);

  useEffect(() => {
    setPixels(generatePixelData());
  }, []);

  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      setPulsePhase(prev => (prev + 0.05) % (Math.PI * 2));
      
      if (Math.random() < 0.1) {
        setSparklePositions(prev => [
          ...prev.slice(-20),
          {
            x: Math.random() * GRID_SIZE,
            y: Math.random() * GRID_SIZE,
            intensity: Math.random()
          }
        ]);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const filteredPixels = useMemo(() => {
    return pixels.filter(pixel => {
      if (tools.filter.rarity.length > 0 && !tools.filter.rarity.includes(pixel.rarity)) return false;
      if (pixel.price < tools.filter.priceRange[0] || pixel.price > tools.filter.priceRange[1]) return false;
      if (tools.filter.owner && pixel.owner !== tools.filter.owner) return false;
      if (tools.filter.region && pixel.region !== tools.filter.region) return false;
      if (!tools.filter.showOwned && pixel.isOwned) return false;
      if (!tools.filter.showAvailable && !pixel.isOwned) return false;
      return true;
    });
  }, [pixels, tools.filter]);

    const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapTexture) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    // Draw map background using the texture
    ctx.fillStyle = mapTexture;
    ctx.fillRect(0, 0, GRID_SIZE * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);

    // Draw owned pixels over the map
    pixels.forEach(pixel => {
      if (pixel.isOwned) {
        ctx.fillStyle = pixel.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(pixel.x * PIXEL_SIZE, pixel.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        ctx.globalAlpha = 1.0;
      }
    });

    ctx.restore();
  }, [viewport, pixels, mapTexture]);

  useEffect(() => {
    if (isMapReady) {
      drawGrid();
    }
  }, [drawGrid, isMapReady, viewport]);


  const handlePixelClick = useCallback((pixel: Pixel) => {
    setSelectedPixel(pixel);
    
    if (tools.mode === 'buy' && !pixel.isOwned) {
      setShowPixelDialog(true);
      toast({
        title: "Pixel Selecionado!",
        description: `Pixel ${pixel.rarity} por ${pixel.price} créditos`,
      });
    } else if (tools.mode === 'inspect') {
      setShowPixelDialog(true);
    }
    
    const clickEffect = document.createElement('div');
    clickEffect.className = 'absolute pointer-events-none animate-ping';
    clickEffect.style.cssText = `
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, ${RARITY_CONFIG[pixel.rarity].color}, transparent);
      border-radius: 50%;
      left: ${pixel.x * PIXEL_SIZE * viewport.scale + viewport.x}px;
      top: ${pixel.y * PIXEL_SIZE * viewport.scale + viewport.y}px;
      transform: translate(-50%, -50%);
      z-index: 1000;
    `;
    
    if (containerRef.current) {
      containerRef.current.appendChild(clickEffect);
      setTimeout(() => clickEffect.remove(), 1000);
    }
  }, [tools.mode, viewport.scale, viewport.x, viewport.y, toast]);

  const handlePixelHover = useCallback((pixel: Pixel | null) => {
    setHoveredPixel(pixel);
  }, []);

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setViewport(prev => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * (1 + delta)));
      const scaleRatio = newScale / prev.scale;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return prev;

      const clientX = centerX ?? rect.width / 2;
      const clientY = centerY ?? rect.height / 2;

      const newX = clientX - (clientX - prev.x) * scaleRatio;
      const newY = clientY - (clientY - prev.y) * scaleRatio;
      
      return { ...prev, scale: newScale, x: newX, y: newY };
    });
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewport(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1, rotation: 0 });
    toast({
      title: "Vista Reiniciada",
      description: "O mapa foi centrado e o zoom foi reiniciado",
    });
  }, [toast]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      handlePan(deltaX, deltaY);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - viewport.x) / viewport.scale;
        const y = (e.clientY - rect.top - viewport.y) / viewport.scale;

        const pixelX = Math.floor(x / PIXEL_SIZE);
        const pixelY = Math.floor(y / PIXEL_SIZE);

        if (pixelX >= 0 && pixelX < GRID_SIZE && pixelY >= 0 && pixelY < GRID_SIZE) {
            const pixel = pixels.find(p => p.x === pixelX && p.y === pixelY);
            handlePixelHover(pixel || null);
        } else {
            handlePixelHover(null);
        }
    }
  }, [handlePan, viewport, pixels, handlePixelHover]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      handleZoom(delta, centerX, centerY);
    }
  }, [handleZoom]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isDragging.current = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      isDragging.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      isDragging.current = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance.current > 0) {
        const delta = (distance - lastTouchDistance.current) * 0.01;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          handleZoom(delta, centerX - rect.left, centerY - rect.top);
        }
      }
      
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && isDragging.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastMousePos.current.x;
      const deltaY = touch.clientY - lastMousePos.current.y;
      handlePan(deltaX, deltaY);
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [handleZoom, handlePan]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isDragging.current = false;
    }
    if (e.touches.length < 2) {
      lastTouchDistance.current = 0;
    }
  }, []);


  const handlePurchasePixel = useCallback(async () => {
    if (!selectedPixel) return;
    
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "🎉 Pixel Adquirido!",
      description: `Parabéns! Agora possui o pixel ${selectedPixel.rarity} por ${selectedPixel.price} créditos!`,
    });
    
    // This is where you would update the pixel state, for example:
    // setPixels(prev => prev.map(p => p.id === selectedPixel.id ? {...p, isOwned: true, owner: 'CurrentUser'} : p));

    setIsLoading(false);
    setShowPixelDialog(false);
    setSelectedPixel(null);
  }, [selectedPixel, toast]);
  

  const stats = useMemo(() => {
    if (pixels.length === 0) return { total: 0, owned: 0, available: 0, totalValue: 0, avgPrice: 0, rarityStats: {}, ownershipPercentage: 0 };
    const total = pixels.length;
    const owned = pixels.filter(p => p.isOwned).length;
    const available = total - owned;
    const totalValue = pixels.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = totalValue / total;
    
    const rarityStats = Object.keys(RARITY_CONFIG).reduce((acc, rarity) => {
      acc[rarity] = pixels.filter(p => p.rarity === rarity).length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      owned,
      available,
      totalValue,
      avgPrice,
      rarityStats,
      ownershipPercentage: (owned / total) * 100
    };
  }, [pixels]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden">
      <PortugalMapSvg onImageReady={handleImageReady} />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={style}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/95 via-background/90 to-transparent backdrop-blur-sm border-b border-primary/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Grid3X3 className="h-6 w-6 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-lg font-headline font-bold text-primary">Pixel Universe</h1>
                <p className="text-xs text-muted-foreground">Mapa Interativo de Portugal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Activity className="h-3 w-3 mr-1" />
              {stats.available.toLocaleString()} disponíveis
            </Badge>
            <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.ownershipPercentage.toFixed(1)}% vendidos
            </Badge>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-4 z-20">
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-headline flex items-center">
              <Wand2 className="h-4 w-4 mr-2 text-primary" />
              Ferramentas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {[
                { mode: 'view', icon: Eye, label: 'Ver', color: 'text-blue-400' },
                { mode: 'buy', icon: ShoppingCart, label: 'Comprar', color: 'text-green-400' },
                { mode: 'paint', icon: Paintbrush, label: 'Pintar', color: 'text-purple-400' },
                { mode: 'inspect', icon: Search, label: 'Inspecionar', color: 'text-orange-400' }
              ].map(({ mode, icon: Icon, label, color }) => (
                <TooltipProvider key={mode}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={tools.mode === mode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTools(prev => ({ ...prev, mode: mode as any }))}
                        className={cn(
                          "h-8 transition-all duration-200",
                          tools.mode === mode && "shadow-lg scale-105"
                        )}
                      >
                        <Icon className={cn("h-3 w-3", tools.mode === mode ? 'text-primary-foreground' : color)} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            <Separator className="bg-primary/20" />
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="w-full justify-start"
              >
                <Filter className="h-3 w-3 mr-2" />
                Filtros
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="w-full justify-start"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Reiniciar Vista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute top-20 right-4 z-20">
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardContent className="p-3 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(0.2)}
              className="w-full"
            >
              <ZoomIn className="h-3 w-3 mr-2" />
              Zoom +
            </Button>
            
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                {Math.round(viewport.scale * 100)}%
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(-0.2)}
              className="w-full"
            >
              <ZoomOut className="h-3 w-3 mr-2" />
              Zoom -
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-headline flex items-center">
              <Target className="h-4 w-4 mr-2 text-primary" />
              Estatísticas Live
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{stats.total.toLocaleString()}</div>
                <div className="text-muted-foreground">Total Pixels</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{stats.available.toLocaleString()}</div>
                <div className="text-muted-foreground">Disponíveis</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Vendidos</span>
                <span className="text-primary">{stats.ownershipPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.ownershipPercentage} className="h-2" />
            </div>
            
            <div className="space-y-1">
              {Object.entries(stats.rarityStats).map(([rarity, count]) => (
                <div key={rarity} className="flex justify-between text-xs">
                  <span className="capitalize flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG].color }}
                    />
                    {rarity}
                  </span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {hoveredPixel && (
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl animate-in slide-in-from-bottom-2">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    hoveredPixel.rarity === 'legendary' && "border-amber-400 text-amber-400",
                    hoveredPixel.rarity === 'epic' && "border-purple-400 text-purple-400",
                    hoveredPixel.rarity === 'rare' && "border-blue-400 text-blue-400"
                  )}
                >
                  {hoveredPixel.rarity.toUpperCase()}
                </Badge>
                <div className="flex items-center space-x-1">
                  {hoveredPixel.isHot && <Flame className="h-3 w-3 text-red-400" />}
                  {hoveredPixel.isTrending && <TrendingUp className="h-3 w-3 text-green-400" />}
                  {hoveredPixel.isNew && <Sparkles className="h-3 w-3 text-blue-400" />}
                </div>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Posição:</span>
                  <span className="font-code">({hoveredPixel.x}, {hoveredPixel.y})</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span className="font-bold text-primary">{hoveredPixel.price} créditos</span>
                </div>
                {hoveredPixel.owner && (
                  <div className="flex justify-between">
                    <span>Proprietário:</span>
                    <span className="text-accent">{hoveredPixel.owner}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Região:</span>
                  <span>{hoveredPixel.region}</span>
                </div>
                {hoveredPixel.coordinates && (
                  <div className="font-code text-xs text-muted-foreground">
                    GPS: {hoveredPixel.coordinates.lat.toFixed(4)}, {hoveredPixel.coordinates.lon.toFixed(4)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div
        ref={containerRef}
        className="absolute inset-0 cursor-move overflow-hidden map-glow"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      <Dialog open={showPixelDialog} onOpenChange={setShowPixelDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
          <DialogHeader className="dialog-header-gold-accent">
            <DialogTitle className="flex items-center text-primary">
              <Gem className="h-5 w-5 mr-2" />
              Detalhes do Pixel
            </DialogTitle>
            <DialogDescription>
              {selectedPixel && `Pixel ${selectedPixel.rarity} na posição (${selectedPixel.x}, ${selectedPixel.y})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPixel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Raridade</Label>
                  <Badge 
                    variant="outline"
                    className={cn(
                      selectedPixel.rarity === 'legendary' && "border-amber-400 text-amber-400",
                      selectedPixel.rarity === 'epic' && "border-purple-400 text-purple-400",
                      selectedPixel.rarity === 'rare' && "border-blue-400 text-blue-400"
                    )}
                  >
                    {selectedPixel.rarity.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Preço</Label>
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-bold text-primary">{selectedPixel.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Localização</Label>
                <div className="text-sm">
                  <div>Região: {selectedPixel.region}</div>
                  <div className="font-code">Coordenadas: ({selectedPixel.x}, {selectedPixel.y})</div>
                  {selectedPixel.coordinates && (
                    <div className="font-code text-xs text-muted-foreground">
                      GPS: {selectedPixel.coordinates.lat.toFixed(4)}, {selectedPixel.coordinates.lon.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedPixel.description && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedPixel.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold">{selectedPixel.views}</div>
                  <div className="text-xs text-muted-foreground">Visualizações</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">{selectedPixel.likes}</div>
                  <div className="text-xs text-muted-foreground">Gostos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {Math.floor((Date.now() - selectedPixel.lastModified.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-xs text-muted-foreground">Dias</div>
                </div>
              </div>
              
              {selectedPixel.specialEffects && selectedPixel.specialEffects.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Efeitos Especiais</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedPixel.specialEffects.map(effect => (
                      <Badge key={effect} variant="secondary" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="dialog-footer-gold-accent">
            {selectedPixel && !selectedPixel.isOwned && tools.mode === 'buy' && (
              <Button
                onClick={handlePurchasePixel}
                disabled={isLoading}
                className="w-full button-gradient-gold button-3d-effect"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Comprar por {selectedPixel.price} créditos
                  </>
                )}
              </Button>
            )}
            
            {selectedPixel?.isOwned && (
              <div className="w-full text-center">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Crown className="h-3 w-3 mr-1" />
                  Propriedade de {selectedPixel.owner}
                </Badge>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
            <CardContent className="p-6 text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <div>
                <h3 className="font-headline text-lg text-primary">Processando Compra</h3>
                <p className="text-sm text-muted-foreground">Aguarde enquanto processamos a sua transação...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
