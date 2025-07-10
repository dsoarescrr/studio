'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ZoomIn, ZoomOut, RotateCcw, MapPin, Eye, Heart, Star, Crown, 
  Loader2, Grid3X3, Navigation, Home, Maximize2, Info, Sparkles,
  TrendingUp, Users, Clock, Award, Gem, Shield, Zap, Target,
  Crosshair, Move, MousePointer, Hand, Search, Filter, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { mapPixelToApproxGps } from '@/lib/utils';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
import EnhancedPixelPurchaseModal from './EnhancedPixelPurchaseModal';

// Types
type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type PaymentMethod = 'credits' | 'special_credits' | 'real_money';
type ViewMode = 'map' | 'grid' | 'hybrid';
type InteractionMode = 'select' | 'pan' | 'zoom' | 'measure';

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

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

interface GridMetrics {
  totalPixels: number;
  ownedPixels: number;
  availablePixels: number;
  averagePrice: number;
  hotspots: Array<{ x: number; y: number; activity: number }>;
}

// Constants
const GRID_SIZE = { width: 1000, height: 800 };
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;
const PIXEL_SIZE = 4;

// Mock data generator
const generateMockPixelData = (x: number, y: number, mapData: MapData | null): PixelData | null => {
  if (mapData?.svgElement) {
    // Check if the point is inside the SVG map paths
    const point = mapData.svgElement.createSVGPoint();
    point.x = x * PIXEL_SIZE;
    point.y = y * PIXEL_SIZE;
    let isInside = false;
    const paths = mapData.svgElement.querySelectorAll('path');
    for (const path of paths) {
      if (path.isPointInFill(point)) {
        isInside = true;
        break;
      }
    }
    if (!isInside) return null; // Don't generate pixel if outside map boundaries
  }

  const rarities: PixelRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const regions = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira'];
  
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  const basePrice = 10 + Math.random() * 100;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2,
    legendary: 3
  }[rarity];

  return {
    x,
    y,
    color: `hsl(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${40 + Math.random() * 40}%)`,
    owner: Math.random() > 0.7 ? `User${Math.floor(Math.random() * 1000)}` : undefined,
    price: Math.round(basePrice * rarityMultiplier),
    lastSold: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    rarity,
    region,
    isProtected: Math.random() > 0.9,
    history: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      owner: `User${Math.floor(Math.random() * 1000)}`,
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
      price: Math.round(basePrice * (0.8 + Math.random() * 0.4)),
      action: ['purchase', 'sale', 'transfer'][Math.floor(Math.random() * 3)] as any,
    })),
    features: Math.random() > 0.8 ? ['Vista panorâmica', 'Zona histórica', 'Transporte público'] : undefined,
    description: Math.random() > 0.6 ? `Pixel único na região de ${region}` : undefined,
    tags: Math.random() > 0.7 ? ['arte', 'portugal', region.toLowerCase()] : undefined,
  };
};

export default function PixelGrid() {
  // State
  const [viewport, setViewport] = useState<ViewportState>({
    x: GRID_SIZE.width / 2,
    y: GRID_SIZE.height / 2,
    zoom: 1,
    rotation: 0,
  });
  
  const [selectedPixel, setSelectedPixel] = useState<PixelData | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('select');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mapData, setMapData] = useState<MapData | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Hooks
  const { toast } = useToast();

  const handleMapDataLoaded = useCallback((data: MapData) => {
    setMapData(data);
  }, []);

  // Memoized calculations
  const visiblePixels = useMemo(() => {
    if (!mapData) return [];
    const margin = 100;
    const startX = Math.max(0, Math.floor(viewport.x - margin / viewport.zoom));
    const endX = Math.min(GRID_SIZE.width, Math.ceil(viewport.x + margin / viewport.zoom));
    const startY = Math.max(0, Math.floor(viewport.y - margin / viewport.zoom));
    const endY = Math.min(GRID_SIZE.height, Math.ceil(viewport.y + margin / viewport.zoom));
    
    const pixels: PixelData[] = [];
    for (let x = startX; x < endX; x += 2) {
      for (let y = startY; y < endY; y += 2) {
        const pixel = generateMockPixelData(x, y, mapData);
        if (pixel) {
            pixels.push(pixel);
        }
      }
    }
    return pixels;
  }, [viewport, mapData]);

  const gridMetrics = useMemo((): GridMetrics => {
    const totalPixels = GRID_SIZE.width * GRID_SIZE.height;
    const ownedPixels = Math.floor(totalPixels * 0.15);
    const availablePixels = totalPixels - ownedPixels;
    const averagePrice = 45.50;
    
    const hotspots = Array.from({ length: 10 }, () => ({
      x: Math.random() * GRID_SIZE.width,
      y: Math.random() * GRID_SIZE.height,
      activity: Math.random() * 100,
    }));

    return {
      totalPixels,
      ownedPixels,
      availablePixels,
      averagePrice,
      hotspots,
    };
  }, []);

  // Loading simulation
  useEffect(() => {
    const loadingTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingTimer);
          setIsLoading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(loadingTimer);
  }, []);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (interactionMode === 'pan') {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, [interactionMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current && interactionMode === 'pan') {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      
      setViewport(prev => ({
        ...prev,
        x: prev.x - deltaX / viewport.zoom,
        y: prev.y - deltaY / viewport.zoom,
      }));
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [interactionMode, viewport.zoom]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom * zoomFactor));
    
    setViewport(prev => ({
      ...prev,
      zoom: newZoom,
    }));
  }, [viewport.zoom]);

  const handlePixelClick = useCallback((pixel: PixelData) => {
    if (interactionMode === 'select') {
      setSelectedPixel(pixel);
      setShowPurchaseModal(true);
      
      // Update GPS coordinates
      const gps = mapPixelToApproxGps(pixel.x, pixel.y, GRID_SIZE.width, GRID_SIZE.height);
      if (gps) {
        console.log(`Pixel (${pixel.x}, ${pixel.y}) ≈ GPS (${gps.lat}, ${gps.lon})`);
      }
    }
  }, [interactionMode]);

  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom * (1 + ZOOM_STEP)),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom * (1 - ZOOM_STEP)),
    }));
  }, []);

  const handleResetView = useCallback(() => {
    setViewport({
      x: GRID_SIZE.width / 2,
      y: GRID_SIZE.height / 2,
      zoom: 1,
      rotation: 0,
    });
  }, []);

  const handlePurchase = async (pixelData: PixelData, paymentMethod: PaymentMethod, customizations: any) => {
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Compra Realizada!",
      description: `Pixel (${pixelData.x}, ${pixelData.y}) adquirido com sucesso!`,
    });
    
    return Math.random() > 0.1; // 90% success rate
  };

  const getRarityColor = (rarity: PixelRarity) => {
    const colors = {
      common: '#6B7280',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
    };
    return colors[rarity];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <Grid3X3 className="h-16 w-16 text-primary mx-auto animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Grid3X3 className="h-16 w-16 text-primary/50 mx-auto" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-headline text-primary text-gradient-gold">
                Carregando Pixel Universe
              </h2>
              <p className="text-sm text-muted-foreground">
                Preparando o mapa interativo de Portugal...
              </p>
              <div className="space-y-2">
                <Progress value={loadingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(loadingProgress)}% completo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-background via-background/98 to-primary/5">
        {/* Main Grid Container */}
        <div
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{
            cursor: interactionMode === 'pan' ? (isDragging.current ? 'grabbing' : 'grab') : 
                   interactionMode === 'zoom' ? 'zoom-in' : 'crosshair'
          }}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox={`${viewport.x - window.innerWidth / (2 * viewport.zoom)} ${viewport.y - window.innerHeight / (2 * viewport.zoom)} ${window.innerWidth / viewport.zoom} ${window.innerHeight / viewport.zoom}`}
          >
            {/* Background Grid */}
            <defs>
              <pattern
                id="grid"
                width={PIXEL_SIZE}
                height={PIXEL_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${PIXEL_SIZE} 0 L 0 0 0 ${PIXEL_SIZE}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.1"
                  className="text-border/20"
                />
              </pattern>
            </defs>
            
            {viewMode !== 'map' && (
              <rect
                width={GRID_SIZE.width * PIXEL_SIZE}
                height={GRID_SIZE.height * PIXEL_SIZE}
                fill="url(#grid)"
                className="opacity-30"
              />
            )}

            {/* Portugal Map Overlay */}
            {(viewMode === 'map' || viewMode === 'hybrid') && (
              <g transform={`scale(${PIXEL_SIZE})`}>
                <PortugalMapSvg 
                  className="opacity-20 fill-primary/10 stroke-primary/30"
                  onMapDataLoaded={handleMapDataLoaded}
                />
              </g>
            )}

            {/* Pixels */}
            {visiblePixels.map((pixel) => (
              <g key={`${pixel.x}-${pixel.y}`}>
                <rect
                  x={pixel.x * PIXEL_SIZE}
                  y={pixel.y * PIXEL_SIZE}
                  width={PIXEL_SIZE}
                  height={PIXEL_SIZE}
                  fill={pixel.color}
                  stroke={pixel.owner ? getRarityColor(pixel.rarity) : 'transparent'}
                  strokeWidth={pixel.owner ? 0.2 : 0}
                  className={cn(
                    "transition-all duration-200 cursor-pointer",
                    hoveredPixel?.x === pixel.x && hoveredPixel?.y === pixel.y && "brightness-110 scale-110",
                    pixel.isProtected && "drop-shadow-sm"
                  )}
                  onClick={() => handlePixelClick(pixel)}
                  onMouseEnter={() => setHoveredPixel({ x: pixel.x, y: pixel.y })}
                  onMouseLeave={() => setHoveredPixel(null)}
                />
                
                {/* Rarity indicators */}
                {pixel.owner && (pixel.rarity === 'epic' || pixel.rarity === 'legendary') && (
                  <circle
                    cx={pixel.x * PIXEL_SIZE + PIXEL_SIZE / 2}
                    cy={pixel.y * PIXEL_SIZE + PIXEL_SIZE / 2}
                    r={PIXEL_SIZE / 4}
                    fill={getRarityColor(pixel.rarity)}
                    className="animate-pulse"
                  />
                )}
              </g>
            ))}

            {/* Hotspots */}
            {gridMetrics.hotspots.map((hotspot, index) => (
              <circle
                key={index}
                cx={hotspot.x * PIXEL_SIZE}
                cy={hotspot.y * PIXEL_SIZE}
                r={Math.max(2, hotspot.activity / 10)}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="0.5"
                className="animate-pulse opacity-60"
              />
            ))}
          </svg>
        </div>

        {/* Controls Panel */}
        <div className="absolute top-4 left-4 space-y-2">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={interactionMode === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInteractionMode('select')}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  variant={interactionMode === 'pan' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInteractionMode('pan')}
                >
                  <Hand className="h-4 w-4" />
                </Button>
                <Button
                  variant={interactionMode === 'zoom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInteractionMode('zoom')}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'hybrid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('hybrid')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="absolute top-4 right-4 space-y-2">
          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="p-3">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zoom:</span>
                  <span className="font-mono">{(viewport.zoom * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posição:</span>
                  <span className="font-mono">
                    {Math.round(viewport.x)}, {Math.round(viewport.y)}
                  </span>
                </div>
                {hoveredPixel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pixel:</span>
                    <span className="font-mono text-primary">
                      ({hoveredPixel.x}, {hoveredPixel.y})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardContent className="p-3">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-mono">{gridMetrics.totalPixels.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocupados:</span>
                  <span className="font-mono text-green-500">{gridMetrics.ownedPixels.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livres:</span>
                  <span className="font-mono text-blue-500">{gridMetrics.availablePixels.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço médio:</span>
                  <span className="font-mono text-primary">{gridMetrics.averagePrice}€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pixel Tooltip */}
        {hoveredPixel && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <Card className="bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
              <CardContent className="p-3">
                {(() => {
                  const pixel = visiblePixels.find(p => p.x === hoveredPixel.x && p.y === hoveredPixel.y);
                  if (!pixel) return null;
                  
                  return (
                    <div className="text-center space-y-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: pixel.color }}
                        />
                        <span className="font-mono text-sm">
                          ({pixel.x}, {pixel.y})
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {pixel.region}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {pixel.price}€
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {pixel.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {pixel.likes}
                        </span>
                      </div>
                      
                      {pixel.owner && (
                        <div className="flex items-center justify-center gap-1">
                          <Crown className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">{pixel.owner}</span>
                        </div>
                      )}
                      
                      {pixel.isProtected && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Protegido
                        </Badge>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Purchase Modal */}
        <EnhancedPixelPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          pixelData={selectedPixel}
          userCredits={12500}
          userSpecialCredits={120}
          onPurchase={handlePurchase}
        />
      </div>
    </TooltipProvider>
  );
}
