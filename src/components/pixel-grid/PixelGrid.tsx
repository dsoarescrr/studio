
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
const MAP_ASPECT_RATIO = 12969 / 26674; // From SVG viewBox
const GRID_HEIGHT = 150;
const GRID_WIDTH = Math.round(GRID_HEIGHT * MAP_ASPECT_RATIO); // ~73
const PIXEL_SIZE = 10; // A bit larger for clarity
const MIN_SCALE = 0.1;
const MAX_SCALE = 20;


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

// Generate enhanced pixel data based on new grid dimensions
const generatePixelData = (width: number, height: number, mapData: ImageData): Pixel[] => {
  const pixels: Pixel[] = [];
  const regions = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira'];
  const landmassCoords = new Set<string>();

  // Determine which pixels are part of the landmass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Index for the alpha value in the ImageData array
      const alphaIndex = (y * width + x) * 4 + 3;
      if (mapData.data[alphaIndex] > 0) { // Check if pixel is not transparent
        landmassCoords.add(`${x},${y}`);
      }
    }
  }

  // Generate pixel details only for landmass coordinates
  landmassCoords.forEach(coord => {
    const [xStr, yStr] = coord.split(',');
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    const rand = Math.random();
    let rarity: Pixel['rarity'] = 'common';
    
    if (rand < RARITY_CONFIG.legendary.probability) rarity = 'legendary';
    else if (rand < RARITY_CONFIG.epic.probability + RARITY_CONFIG.legendary.probability) rarity = 'epic';
    else if (rand < RARITY_CONFIG.rare.probability + RARITY_CONFIG.epic.probability + RARITY_CONFIG.legendary.probability) rarity = 'rare';
    
    const config = RARITY_CONFIG[rarity];
    const coordinates = mapPixelToApproxGps(x, y, width, height);
    
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
  });
  
  return pixels;
};

export default function PixelGrid() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [mapBitmap, setMapBitmap] = useState<ImageBitmap | null>(null);
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
  const [isLoading, setIsLoading] = useState(false);
  const [particleStyles, setParticleStyles] = useState<React.CSSProperties[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const [isInitialViewApplied, setIsInitialViewApplied] = useState(false);
  
  const { toast } = useToast();

  const pixelMap = useMemo(() => new Map(pixels.map(p => [`${p.x},${p.y}`, p])), [pixels]);

  // Effect for generating particle styles, runs only on client
  useEffect(() => {
    const styles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));
    setParticleStyles(styles);
  }, []);

  const handleMapDataReady = useCallback(async (imageData: ImageData) => {
    // Create a bitmap for efficient drawing
    const bitmap = await createImageBitmap(imageData);
    setMapBitmap(bitmap);

    // Generate pixels only for landmass
    const generatedPixels = generatePixelData(GRID_WIDTH, GRID_HEIGHT, imageData);
    setPixels(generatedPixels);

    setIsMapReady(true);
  }, []);

  // Effect to set the initial centered and scaled viewport
  useEffect(() => {
    if (isMapReady && !isInitialViewApplied && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
            const mapLogicalWidth = GRID_WIDTH * PIXEL_SIZE;
            const mapLogicalHeight = GRID_HEIGHT * PIXEL_SIZE;

            const scaleX = width / mapLogicalWidth;
            const scaleY = height / mapLogicalHeight;
            const initialScale = Math.min(scaleX, scaleY) * 0.95; // Fit with 5% padding

            const initialX = (width - (mapLogicalWidth * initialScale)) / 2;
            const initialY = (height - (mapLogicalHeight * initialScale)) / 2;

            setViewport({ x: initialX, y: initialY, scale: initialScale, rotation: 0 });
            setIsInitialViewApplied(true);
        }
    }
  }, [isMapReady, isInitialViewApplied]);

  // Main drawing logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapBitmap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    ctx.imageSmoothingEnabled = false;

    // Draw map background
    ctx.drawImage(mapBitmap, 0, 0, GRID_WIDTH * PIXEL_SIZE, GRID_HEIGHT * PIXEL_SIZE);

    // Draw owned pixels
    pixels.forEach(pixel => {
      if (pixel.isOwned) {
        ctx.fillStyle = pixel.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(pixel.x * PIXEL_SIZE, pixel.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    });

    // Draw hover effect
    if (hoveredPixel) {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.5 / viewport.scale;
        ctx.strokeRect(hoveredPixel.x * PIXEL_SIZE + (ctx.lineWidth / 2), hoveredPixel.y * PIXEL_SIZE + (ctx.lineWidth / 2), PIXEL_SIZE - ctx.lineWidth, PIXEL_SIZE - ctx.lineWidth);
    }
    
    ctx.restore();
  }, [viewport, mapBitmap, pixels, hoveredPixel]);
  
  // Animation loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    if (isMapReady) {
      render();
    }
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, isMapReady]);


  const getPixelFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const gridX = (clientX - rect.left - viewport.x) / viewport.scale;
    const gridY = (clientY - rect.top - viewport.y) / viewport.scale;
    
    const pixelX = Math.floor(gridX / PIXEL_SIZE);
    const pixelY = Math.floor(gridY / PIXEL_SIZE);

    if (pixelX >= 0 && pixelX < GRID_WIDTH && pixelY >= 0 && pixelY < GRID_HEIGHT) {
      return pixelMap.get(`${pixelX},${pixelY}`) || null;
    }
    return null;
  }, [viewport, pixelMap]);


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
    setIsInitialViewApplied(false); // Trigger recentering
    toast({
      title: "Vista Reiniciada",
      description: "O mapa foi centrado e o zoom foi reiniciado",
    });
  }, [toast]);

  // MOUSE EVENT HANDLERS
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pixel = getPixelFromEvent(e);
    if (hoveredPixel?.id !== pixel?.id) {
        setHoveredPixel(pixel);
    }
    
    if (dragStartRef.current && !isDragging.current) {
        const distance = Math.sqrt(Math.pow(e.clientX - dragStartRef.current.x, 2) + Math.pow(e.clientY - dragStartRef.current.y, 2));
        if (distance > 5) { 
            isDragging.current = true;
            setIsPanning(true);
        }
    }

    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      handlePan(deltaX, deltaY);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [getPixelFromEvent, hoveredPixel, handlePan]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current && dragStartRef.current) {
        const pixel = getPixelFromEvent(e);
        if (pixel) {
            setSelectedPixel(pixel);
            if (tools.mode === 'buy' || tools.mode === 'inspect') {
                setShowPixelDialog(true);
            }
        }
    }
    
    isDragging.current = false;
    dragStartRef.current = null;
    setIsPanning(false);
  }, [getPixelFromEvent, tools.mode]);

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

  const handlePurchasePixel = useCallback(async () => {
    // ... (logic remains the same)
  }, [selectedPixel, toast]);

  const stats = useMemo(() => {
    if (pixels.length === 0) return { total: 0, owned: 0, available: 0, ownershipPercentage: 0 };
    const total = pixels.length;
    const owned = pixels.filter(p => p.isOwned).length;
    return {
      total,
      owned,
      available: total - owned,
      ownershipPercentage: total > 0 ? (owned / total) * 100 : 0
    };
  }, [pixels]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/5 overflow-hidden">
      <PortugalMapSvg 
        onDataReady={handleMapDataReady} 
        width={GRID_WIDTH * PIXEL_SIZE}
        height={GRID_HEIGHT * PIXEL_SIZE}
      />

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

      <div
        ref={containerRef}
        className={cn(
            "absolute inset-0 map-glow",
            isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { isDragging.current = false; setIsPanning(false); }}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background/95 via-background/90 to-transparent backdrop-blur-sm border-b border-primary/20 pointer-events-none">
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

      <div className="absolute top-20 left-4 z-20 pointer-events-auto">
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
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Filter className="h-3 w-3 mr-2" /> Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={resetView} className="w-full justify-start">
                <RotateCcw className="h-3 w-3 mr-2" /> Reiniciar Vista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="absolute top-20 right-4 z-20 pointer-events-auto">
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
          <CardContent className="p-2 space-y-1">
            <Button variant="outline" size="sm" onClick={() => handleZoom(0.2)} className="w-full h-8">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                {Math.round(viewport.scale * 100)}%
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleZoom(-0.2)} className="w-full h-8">
              <ZoomOut className="h-3 w-3" />
            </Button>
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

      {/* Other UI elements like Dialog, Loading Overlay, etc. */}
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
            <div className="space-y-4 p-6">
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
              
              {selectedPixel.owner && (
                <div className="w-full text-center py-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Propriedade de {selectedPixel.owner}
                    </Badge>
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
                {isLoading ? 'Processando...' : `Comprar por ${selectedPixel.price} créditos`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
