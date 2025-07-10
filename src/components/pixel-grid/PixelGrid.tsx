// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Expand, Search, Sparkles, MapPin as MapPinIcon,
  Map as MapIcon,
  Star,
} from 'lucide-react';
import NextImage from 'next/image';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generatePixelDescription, type GeneratePixelDescriptionInput } from '@/ai/flows/generate-pixel-description';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { mapPixelToApproxGps } from '@/lib/utils';
import EnhancedPixelPurchaseModal from './EnhancedPixelPurchaseModal';

// Configuration constants
const SVG_VIEWBOX_WIDTH = 12969;
const SVG_VIEWBOX_HEIGHT = 26674;
const LOGICAL_GRID_COLS_CONFIG = 1273;
const RENDERED_PIXEL_SIZE_CONFIG = 1;

// Derived constants
const canvasDrawWidth = LOGICAL_GRID_COLS_CONFIG * RENDERED_PIXEL_SIZE_CONFIG;
const canvasDrawHeight = Math.floor(canvasDrawWidth * (SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH));
const logicalGridRows = Math.floor(canvasDrawHeight / RENDERED_PIXEL_SIZE_CONFIG);
const totalLogicalPixels = LOGICAL_GRID_COLS_CONFIG * logicalGridRows;

const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const USER_BOUGHT_PIXEL_COLOR = 'hsl(var(--primary))';

const MOCK_CURRENT_USER_ID = 'currentUserPixelMaster';

interface SoldPixel {
  x: number;
  y: number;
  color: string;
  ownerId?: string;
  title?: string;
  pixelImageUrl?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isAnimated?: boolean;
  lastActivity?: Date;
}

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

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 50;
const ZOOM_SENSITIVITY_FACTOR = 1.1;
const HEADER_HEIGHT_PX = 64;
const BOTTOM_NAV_HEIGHT_PX = 64;

const mockRarities: SelectedPixelDetails['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const mockLoreSnippets: string[] = [
  "Dizem que este pixel brilha sob a lua cheia.",
  "Um antigo mapa sugere um tesouro escondido perto daqui.",
  "Sente-se uma energia estranha emanando deste local.",
];

// Simplified visual effects class
class VisualEffects {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Create a glowing effect around special pixels
  drawGlowingPixel(x: number, y: number, size: number, color: string, intensity: number = 1) {
    const ctx = this.ctx;
    ctx.save();
    
    // Create multiple glow layers for depth
    const glowLayers = [
      { radius: size * 2, alpha: 0.1 * intensity },
      { radius: size * 1.5, alpha: 0.2 * intensity },
      { radius: size * 1.2, alpha: 0.3 * intensity }
    ];
    
    glowLayers.forEach(layer => {
      ctx.shadowColor = color;
      ctx.shadowBlur = layer.radius;
      ctx.globalAlpha = layer.alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
    });
    
    ctx.restore();
  }

  // Draw animated border around pixels
  drawAnimatedBorder(x: number, y: number, size: number, time: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    
    const dashOffset = (time * 0.002) % 10;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = dashOffset;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);
    
    ctx.restore();
  }

  // Pulsing effect for rare pixels
  drawPulsingPixel(x: number, y: number, size: number, color: string, time: number, frequency: number = 0.003) {
    const pulse = (Math.sin(time * frequency) + 1) * 0.5;
    const currentSize = size * (0.8 + pulse * 0.4);
    const offset = (size - currentSize) / 2;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.7 + pulse * 0.3;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + offset, y + offset, currentSize, currentSize);
    this.ctx.restore();
  }

  // Create shimmer effect for legendary pixels
  drawShimmerEffect(x: number, y: number, size: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    
    const shimmerOffset = (time * 0.001) % (size * 2);
    const gradient = ctx.createLinearGradient(x - size, y, x + size * 2, y + size);
    
    const pos = shimmerOffset / (size * 2);
    gradient.addColorStop(Math.max(0, pos - 0.1), 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(pos, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(Math.min(1, pos + 0.1), 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size, size);
    
    ctx.restore();
  }
}

export default function PixelGrid() {
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [defaultView, setDefaultView] = useState<{ zoom: number; position: { x: number; y: number } } | null>(null);

  const didDragRef = useRef(false);
  const dragThreshold = 5;

  const [highlightedPixel, setHighlightedPixel] = useState<{ x: number; y: number } | null>(null);
  const [selectedPixelDetails, setSelectedPixelDetails] = useState<SelectedPixelDetails | null>(null);

  const [showPixelModal, setShowPixelModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelCanvasRef = useRef<HTMLCanvasElement>(null);
  const outlineCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [mapData, setMapData] = useState<MapData | null>(null);
  const [pixelBitmap, setPixelBitmap] = useState<Uint8Array | null>(null);
  const [activePixelsInMap, setActivePixelsInMap] = useState(0);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [progressMessage, setProgressMessage] = useState("Aguardando cliente...");
  
  const [soldPixels, setSoldPixels] = useState<SoldPixel[]>([
      { 
        x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.451), 
        y: Math.floor(logicalGridRows * 0.302), 
        color: 'hsl(var(--accent))', 
        title: 'Pixel especial LIS', 
        ownerId: 'user123',
        rarity: 'epic',
        isAnimated: true,
        lastActivity: new Date()
      },
      { 
        x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.503), 
        y: Math.floor(logicalGridRows * 0.204), 
        color: 'magenta', 
        title: 'Pixel especial POR', 
        ownerId: MOCK_CURRENT_USER_ID, 
        pixelImageUrl: 'https://placehold.co/1x1.png',
        rarity: 'legendary',
        isAnimated: true,
        lastActivity: new Date()
      },
      { 
        x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.555), 
        y: Math.floor(logicalGridRows * 0.756), 
        color: 'cyan', 
        title: 'Pixel especial FAR', 
        ownerId: 'user456',
        rarity: 'rare',
        lastActivity: new Date(Date.now() - 60000)
      },
  ]);

  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);
  const visualEffectsRef = useRef<VisualEffects | null>(null);

  const [unsoldColor, setUnsoldColor] = useState('');
  const [strokeColor, setStrokeColor] = useState('');

  const [loadedPixelImages, setLoadedPixelImages] = useState<Record<string, HTMLImageElement>>({});

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const clearAutoResetTimeout = useCallback(() => {
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    setIsClient(true);
     if (typeof window !== 'undefined') {
      const computedStyle = getComputedStyle(document.documentElement);
      setUnsoldColor(computedStyle.getPropertyValue('--secondary').trim());
      setStrokeColor(computedStyle.getPropertyValue('--muted-foreground').trim());
    }
  }, []);

  const handleMapDataLoaded = useCallback((data: MapData) => {
    setMapData(data);
  }, []);

  useEffect(() => {
    if (!isClient || !mapData || !mapData.svgElement) return;
  
    setProgressMessage("A renderizar mapa melhorado...");
    setIsLoadingMap(true);
    
    const { svgElement } = mapData;
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasDrawWidth;
    offscreenCanvas.height = canvasDrawHeight;
    const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        setIsLoadingMap(false);
        URL.revokeObjectURL(url);
        return;
    }
    
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasDrawWidth, canvasDrawHeight);
        URL.revokeObjectURL(url);

        try {
          const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          const data = imageData.data;
          const newBitmap = new Uint8Array(LOGICAL_GRID_COLS_CONFIG * logicalGridRows);
          let activePixels = 0;
      
          for (let row = 0; row < logicalGridRows; row++) {
            for (let col = 0; col < LOGICAL_GRID_COLS_CONFIG; col++) {
              const canvasX = Math.floor((col + 0.5) * RENDERED_PIXEL_SIZE_CONFIG);
              const canvasY = Math.floor((row + 0.5) * RENDERED_PIXEL_SIZE_CONFIG);
              const index = (canvasY * offscreenCanvas.width + canvasX) * 4;
              
              if (data[index + 3] > 0) {
                newBitmap[row * LOGICAL_GRID_COLS_CONFIG + col] = 1;
                activePixels++;
              }
            }
          }
          setPixelBitmap(newBitmap);
          setActivePixelsInMap(activePixels);
        } catch(e) {
          console.error("Error generating pixel bitmap:", e);
          toast({ title: "Erro na Grelha", description: "Não foi possível gerar a grelha interativa.", variant: "destructive" });
        } finally {
          setIsLoadingMap(false);
          setProgressMessage("");
        }
    };
    img.onerror = () => {
        console.error("Failed to load SVG as image.");
        toast({ title: "Erro no Mapa", description: "Não foi possível carregar o SVG melhorado.", variant: "destructive" });
        setIsLoadingMap(false);
        URL.revokeObjectURL(url);
    };
    img.src = url;
  
  }, [isClient, mapData, toast]);

  // Enhanced pixel rendering with visual effects (single canvas)
  const renderPixelsWithEffects = useCallback((currentTime: number) => {
    const canvas = pixelCanvasRef.current;
    
    if (!canvas || !pixelBitmap || !unsoldColor) return;
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Initialize visual effects if needed
    if (!visualEffectsRef.current) {
      visualEffectsRef.current = new VisualEffects(ctx);
    }
    
    const deltaTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enable pixelated rendering for base pixels
    ctx.imageSmoothingEnabled = false;
    
    // Create base gradient for unsold pixels
    const baseGradient = ctx.createLinearGradient(0, 0, canvasDrawWidth, canvasDrawHeight);
    baseGradient.addColorStop(0, `hsl(${unsoldColor})`);
    baseGradient.addColorStop(0.5, `hsl(${unsoldColor})`);
    baseGradient.addColorStop(1, `hsl(${unsoldColor})`);
    
    // Render base unsold pixels with subtle gradient
    for (let row = 0; row < logicalGridRows; row++) {
      for (let col = 0; col < LOGICAL_GRID_COLS_CONFIG; col++) {
        if (pixelBitmap[row * LOGICAL_GRID_COLS_CONFIG + col] === 1) {
          const x = col * RENDERED_PIXEL_SIZE_CONFIG;
          const y = row * RENDERED_PIXEL_SIZE_CONFIG;
          
          // Add subtle shimmer to base pixels
          const shimmer = Math.sin((x + y + currentTime * 0.001) * 0.01) * 0.1;
          ctx.globalAlpha = 0.8 + shimmer;
          ctx.fillStyle = baseGradient;
          ctx.fillRect(x, y, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
        }
      }
    }
    
    ctx.globalAlpha = 1;
    
    // Render sold pixels with enhanced effects
    soldPixels.forEach(pixel => {
      const renderX = pixel.x * RENDERED_PIXEL_SIZE_CONFIG;
      const renderY = pixel.y * RENDERED_PIXEL_SIZE_CONFIG;
      
      // Enhanced rendering based on rarity
      if (pixel.rarity === 'legendary') {
        // Legendary pixels get shimmer effect
        ctx.imageSmoothingEnabled = true;
        visualEffectsRef.current?.drawShimmerEffect(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, currentTime);
        visualEffectsRef.current?.drawGlowingPixel(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, pixel.color, 1.5);
        ctx.imageSmoothingEnabled = false;
      } else if (pixel.rarity === 'epic') {
        // Epic pixels get pulsing effect
        visualEffectsRef.current?.drawPulsingPixel(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, pixel.color, currentTime);
        ctx.imageSmoothingEnabled = true;
        visualEffectsRef.current?.drawGlowingPixel(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, pixel.color, 1);
        ctx.imageSmoothingEnabled = false;
      } else if (pixel.rarity === 'rare') {
        // Rare pixels get subtle glow
        ctx.imageSmoothingEnabled = true;
        visualEffectsRef.current?.drawGlowingPixel(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, pixel.color, 0.7);
        ctx.imageSmoothingEnabled = false;
      }
      
      // Render the actual pixel with enhanced colors
      if (pixel.pixelImageUrl && loadedPixelImages[pixel.pixelImageUrl]) {
        const img = loadedPixelImages[pixel.pixelImageUrl];
        ctx.drawImage(img, renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
      } else {
        // Enhanced color rendering
        ctx.save();
        
        // Add subtle gradient to sold pixels
        const pixelGradient = ctx.createRadialGradient(
          renderX + RENDERED_PIXEL_SIZE_CONFIG / 2, 
          renderY + RENDERED_PIXEL_SIZE_CONFIG / 2, 
          0,
          renderX + RENDERED_PIXEL_SIZE_CONFIG / 2, 
          renderY + RENDERED_PIXEL_SIZE_CONFIG / 2, 
          RENDERED_PIXEL_SIZE_CONFIG / 2
        );
        
        pixelGradient.addColorStop(0, pixel.color);
        pixelGradient.addColorStop(1, pixel.color.replace(/hsl\(([^,]+),([^,]+),/, 'hsl($1,$2,'));
        
        ctx.fillStyle = pixelGradient;
        ctx.fillRect(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
        ctx.restore();
      }
      
      // Animated border for active pixels
      if (pixel.isAnimated) {
        ctx.imageSmoothingEnabled = true;
        visualEffectsRef.current?.drawAnimatedBorder(renderX, renderY, RENDERED_PIXEL_SIZE_CONFIG, currentTime, pixel.color);
        ctx.imageSmoothingEnabled = false;
      }
    });
    
  }, [pixelBitmap, unsoldColor, soldPixels, loadedPixelImages]);

  // Animation loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      renderPixelsWithEffects(currentTime);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (pixelBitmap && !isLoadingMap) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pixelBitmap, isLoadingMap, renderPixelsWithEffects]);

  useEffect(() => {
    soldPixels.forEach(pixel => {
        if (pixel.pixelImageUrl && !loadedPixelImages[pixel.pixelImageUrl]) {
            const img = new window.Image();
            img.src = pixel.pixelImageUrl;
            img.onload = () => {
                setLoadedPixelImages(prevImages => ({
                    ...prevImages,
                    [pixel.pixelImageUrl!]: img,
                }));
            };
            img.onerror = () => {
                console.error(`Failed to load pixel image: ${pixel.pixelImageUrl}`);
            };
        }
    });
  }, [soldPixels, loadedPixelImages]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = outlineCanvasRef.current;
    if (canvas) {
      canvas.width = containerSize.width;
      canvas.height = containerSize.height;
    }
  }, [containerSize]);

  useEffect(() => {
    if (!mapData || !strokeColor || !outlineCanvasRef.current || containerSize.width === 0) return;
    const canvas = outlineCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const logicalToSvgScale = canvasDrawWidth / SVG_VIEWBOX_WIDTH;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced district outlines with glow effect
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(zoom * logicalToSvgScale, zoom * logicalToSvgScale);
    
    // Add subtle glow to district borders
    ctx.shadowColor = `hsl(${strokeColor})`;
    ctx.shadowBlur = 1 / (zoom * logicalToSvgScale);
    
    ctx.strokeStyle = `hsl(${strokeColor})`;
    ctx.lineWidth = 0.5 / (zoom * logicalToSvgScale);
    ctx.imageSmoothingEnabled = true;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  
    mapData.pathStrings.forEach(pathString => {
        try {
            const path = new Path2D(pathString);
            ctx.stroke(path);
        } catch(e) {
        }
    });
    ctx.restore();
  
    // Enhanced highlighted pixel border with animated glow
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);
    if (highlightedPixel) {
        const time = Date.now();
        const glow = Math.sin(time * 0.005) * 0.5 + 0.5;
        
        ctx.shadowColor = 'hsl(var(--foreground))';
        ctx.shadowBlur = (2 + glow * 3) / zoom;
        ctx.strokeStyle = 'hsl(var(--foreground))';
        ctx.lineWidth = (0.5 / zoom) * RENDERED_PIXEL_SIZE_CONFIG;
        
        const x = highlightedPixel.x * RENDERED_PIXEL_SIZE_CONFIG;
        const y = highlightedPixel.y * RENDERED_PIXEL_SIZE_CONFIG;
        
        // Animated dashed border
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.lineDashOffset = (time * 0.01) % (8 / zoom);
        
        ctx.strokeRect(x, y, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
    }
    ctx.restore();

  }, [mapData, zoom, position, strokeColor, containerSize, highlightedPixel]);
  

  useEffect(() => { 
    if (isClient && containerRef.current && mapData?.pathStrings && !defaultView && canvasDrawWidth > 0 && canvasDrawHeight > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const effectiveContainerHeight = window.innerHeight - HEADER_HEIGHT_PX - BOTTOM_NAV_HEIGHT_PX;
      
      if (containerWidth > 0 && effectiveContainerHeight > 0) {
        const fitZoomX = containerWidth / canvasDrawWidth;
        const fitZoomY = effectiveContainerHeight / canvasDrawHeight;
        const zoomToFit = Math.min(fitZoomX, fitZoomY);
        
        const calculatedZoom = Math.max(MIN_ZOOM, zoomToFit * 0.95); 
        const canvasContentWidth = canvasDrawWidth * calculatedZoom;
        const canvasContentHeight = canvasDrawHeight * calculatedZoom;
        
        const calculatedPosition = {
          x: (containerWidth - canvasContentWidth) / 2,
          y: (effectiveContainerHeight - canvasContentHeight) / 2,
        };
        
        setDefaultView({ zoom: calculatedZoom, position: calculatedPosition });
        setZoom(calculatedZoom);
        setPosition(calculatedPosition);
      }
    }
  }, [isClient, mapData, defaultView, canvasDrawWidth, canvasDrawHeight]);


 const handleResetView = useCallback(() => {
    clearAutoResetTimeout();
    if (defaultView) {
      setZoom(defaultView.zoom);
      setPosition(defaultView.position);
    } else if (isClient && containerRef.current && mapData?.pathStrings && canvasDrawWidth > 0 && canvasDrawHeight > 0) { 
        const containerWidth = containerRef.current.offsetWidth;
        const effectiveContainerHeight = window.innerHeight - HEADER_HEIGHT_PX - BOTTOM_NAV_HEIGHT_PX;
        if (containerWidth > 0 && effectiveContainerHeight > 0) {
            const fitZoomX = containerWidth / canvasDrawWidth;
            const fitZoomY = effectiveContainerHeight / canvasDrawHeight;
            const zoomToFit = Math.min(fitZoomX, fitZoomY);
            const fallbackZoom = Math.max(MIN_ZOOM, zoomToFit * 0.95);

            const canvasContentWidth = canvasDrawWidth * fallbackZoom;
            const canvasContentHeight = canvasDrawHeight * fallbackZoom;
            const fallbackPosition = {
                x: (containerWidth - canvasContentWidth) / 2,
                y: (effectiveContainerHeight - canvasContentHeight) / 2,
            };
            setZoom(fallbackZoom);
            setPosition(fallbackPosition);
            setDefaultView({ zoom: fallbackZoom, position: fallbackPosition }); 
        }
    }
  }, [defaultView, mapData, clearAutoResetTimeout, canvasDrawWidth, canvasDrawHeight, isClient]); 


  const handleZoomIn = () => { clearAutoResetTimeout(); setZoom((prevZoom) => Math.min(prevZoom * 1.2, MAX_ZOOM)); };
  const handleZoomOut = () => { clearAutoResetTimeout(); setZoom((prevZoom) => Math.max(prevZoom / 1.2, MIN_ZOOM)); };


  const handleMouseDown = (e: React.MouseEvent) => {
    clearAutoResetTimeout();
    const targetElement = e.target as HTMLElement;
     if (targetElement.closest('button, [data-dialog-content], [data-tooltip-content], [data-popover-content], label, a, [role="menuitem"], [role="tab"], input, textarea')) {
        return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    didDragRef.current = false;
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const currentX = e.clientX - dragStart.x;
    const currentY = e.clientY - dragStart.y;

    if (!didDragRef.current) {
        const dx = Math.abs(currentX - position.x);
        const dy = Math.abs(currentY - position.y);
        if (dx > dragThreshold || dy > dragThreshold) {
            didDragRef.current = true;
        }
    }
    setPosition({ x: currentX, y: currentY });
  };
  
  const handleCanvasClick = (event: React.MouseEvent) => {
    clearAutoResetTimeout();

    if (isLoadingMap || !pixelBitmap || !containerRef.current) {
      toast({
        title: "Mapa a Carregar",
        description: "A grelha interativa está a ser processada. Por favor, aguarde.",
        variant: "default",
      });
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clickXInContainer = event.clientX - rect.left;
    const clickYInContainer = event.clientY - rect.top;

    const xOnContent = (clickXInContainer - position.x) / zoom;
    const yOnContent = (clickYInContainer - position.y) / zoom;

    const logicalCol = Math.floor(xOnContent / RENDERED_PIXEL_SIZE_CONFIG);
    const logicalRow = Math.floor(yOnContent / RENDERED_PIXEL_SIZE_CONFIG);

    if (logicalCol >= 0 && logicalCol < LOGICAL_GRID_COLS_CONFIG && logicalRow >= 0 && logicalRow < logicalGridRows) {
      const bitmapIdx = logicalRow * LOGICAL_GRID_COLS_CONFIG + logicalCol;

      if (pixelBitmap[bitmapIdx] === 1) {
        setHighlightedPixel({ x: logicalCol, y: logicalRow });

        const existingSoldPixel = soldPixels.find(p => p.x === logicalCol && p.y === logicalRow);
        const randomRarity = mockRarities[Math.floor(Math.random() * mockRarities.length)];
        const randomLore = mockLoreSnippets[Math.floor(Math.random() * mockLoreSnippets.length)];
        const approxGps = mapPixelToApproxGps(logicalCol, logicalRow, LOGICAL_GRID_COLS_CONFIG, logicalGridRows);
        
        let mockDetails: SelectedPixelDetails;

        if (existingSoldPixel) {
             mockDetails = {
                x: logicalCol,
                y: logicalRow,
                owner: existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID,
                price: Math.floor(Math.random() * 50) + 10,
                lastSold: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
                views: Math.floor(Math.random() * 1000),
                likes: Math.floor(Math.random() * 200),
                region: "Lisboa",
                isProtected: false,
                acquisitionDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT'),
                lastModifiedDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString('pt-PT'),
                color: existingSoldPixel.color,
                history: [{ owner: existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID, date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT'), price: Math.floor(Math.random() * 40) + 5 }],
                isOwnedByCurrentUser: (existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID) === MOCK_CURRENT_USER_ID,
                isForSaleBySystem: false,
                manualDescription: 'Este é o meu pixel especial!',
                pixelImageUrl: existingSoldPixel.pixelImageUrl,
                dataAiHint: 'pixel image',
                title: existingSoldPixel.title || `Pixel de ${existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID}`,
                tags: ['meu', 'favorito'],
                linkUrl: Math.random() > 0.5 ? 'https://dourado.com' : undefined,
                isForSaleByOwner: Math.random() > 0.5,
                salePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 20 : undefined,
                isFavorited: Math.random() > 0.5,
                rarity: existingSoldPixel.rarity || randomRarity,
                loreSnippet: randomLore,
                gpsCoords: approxGps,
            };
        } else { 
             mockDetails = {
                x: logicalCol,
                y: logicalRow,
                owner: 'Disponível (Sistema)',
                price: Math.floor(Math.random() * 50) + 10,
                views: Math.floor(Math.random() * 100),
                likes: Math.floor(Math.random() * 20),
                region: "Alentejo",
                isProtected: true,
                color: `hsl(${unsoldColor})`,
                isOwnedByCurrentUser: false,
                isForSaleBySystem: true,
                history: [],
                isFavorited: Math.random() > 0.8,
                rarity: randomRarity,
                loreSnippet: randomLore,
                gpsCoords: approxGps,
            };
        }

        setSelectedPixelDetails(mockDetails);
        setShowPixelModal(true);
      } else { 
        setHighlightedPixel(null);
        setSelectedPixelDetails(null);
        toast({ title: "Fora da Área Interativa", description: `Clicou fora da área interativa de Portugal. Coords Lógicas: (${logicalCol}, ${logicalRow}).`, variant: "default" });
      }
    } else { 
      setHighlightedPixel(null);
      setSelectedPixelDetails(null);
      toast({ title: "Fora dos Limites do Mapa", description: `Clicou fora dos limites do mapa. Coords Lógicas: (${logicalCol}, ${logicalRow}).`, variant: "default" });
    }
  };

  const handleMouseUpOrLeave = (event: React.MouseEvent) => {
    if (isDragging) {
      if (!didDragRef.current) {
        handleCanvasClick(event);
      }
      setIsDragging(false);
    }
  };

  const handleGoToMyLocation = () => {
    if (!containerRef.current || !pixelBitmap) return;

    // Simulate finding a location in Lisbon
    const myLocationPixel = { x: 579, y: 1358 };

    // Check if the pixel is valid and on the map
    const bitmapIdx = myLocationPixel.y * LOGICAL_GRID_COLS_CONFIG + myLocationPixel.x;
    if (pixelBitmap[bitmapIdx] !== 1) {
        toast({ title: "Localização não encontrada", description: "Não foi possível encontrar um pixel ativo na sua localização simulada."});
        return;
    }

    setHighlightedPixel(myLocationPixel);

    const targetZoom = 15;
    const containerWidth = containerRef.current.offsetWidth;
    const effectiveContainerHeight = window.innerHeight - HEADER_HEIGHT_PX - BOTTOM_NAV_HEIGHT_PX;

    const targetX = -myLocationPixel.x * RENDERED_PIXEL_SIZE_CONFIG * targetZoom + containerWidth / 2;
    const targetY = -myLocationPixel.y * RENDERED_PIXEL_SIZE_CONFIG * targetZoom + effectiveContainerHeight / 2;
    
    setPosition({ x: targetX, y: targetY });
    setZoom(targetZoom);
    toast({ title: "Localização Encontrada!", description: "Centrado no pixel mais próximo da sua localização." });
  };

  const handleWheelZoom = useCallback((event: WheelEvent) => {
    clearAutoResetTimeout();
    if (!containerRef.current) return;
    event.preventDefault();

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseXInContainer = event.clientX - containerRect.left;
    const mouseYInContainer = event.clientY - containerRect.top;

    let newZoom;
    if (event.deltaY < 0) { 
      newZoom = Math.min(zoom * ZOOM_SENSITIVITY_FACTOR, MAX_ZOOM);
    } else { 
      newZoom = Math.max(zoom / ZOOM_SENSITIVITY_FACTOR, MIN_ZOOM);
    }

    if (newZoom === zoom) return; 

    const currentCanvasX = (mouseXInContainer - position.x) / zoom;
    const currentCanvasY = (mouseYInContainer - position.y) / zoom;

    const newPosX = mouseXInContainer - currentCanvasX * newZoom;
    const newPosY = mouseYInContainer - currentCanvasY * newZoom;

    setZoom(newZoom);
    setPosition({ x: newPosX, y: newPosY });

  }, [zoom, position, clearAutoResetTimeout]); 

  useEffect(() => { 
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => {
        currentContainer.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [handleWheelZoom]); 


 useEffect(() => { 
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
    }
    if (!defaultView || showPixelModal || isDragging) { 
      return;
    } 

    const isDefaultZoom = Math.abs(zoom - defaultView.zoom) < 0.001;
    const isDefaultPosition =
      defaultView.position &&
      Math.abs(position.x - defaultView.position.x) < 0.5 &&
      Math.abs(position.y - defaultView.position.y) < 0.5;

    if (!isDefaultZoom || !isDefaultPosition) {
      autoResetTimeoutRef.current = setTimeout(() => {
        handleResetView();
      }, 15000); 
    }

    return () => {
      if (autoResetTimeoutRef.current) {
        clearTimeout(autoResetTimeoutRef.current);
      }
    };
  }, [zoom, position, handleResetView, defaultView, showPixelModal, isDragging]);
  
  const showProgressIndicator = isLoadingMap || (progressMessage !== "");

  const handlePurchase = async (pixelData: any, paymentMethod: any, customizations: any) => {
    // Simulate API call
    console.log("Purchasing pixel:", pixelData, "with", paymentMethod, "and customizations:", customizations);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newSoldPixel: SoldPixel = {
      x: pixelData.x,
      y: pixelData.y,
      color: customizations.color || USER_BOUGHT_PIXEL_COLOR, 
      ownerId: MOCK_CURRENT_USER_ID, 
      title: customizations.title || `Meu Pixel (${pixelData.x},${pixelData.y})`,
      pixelImageUrl: customizations.drawingData, // or from imageFile
      rarity: 'common',
      isAnimated: true,
      lastActivity: new Date()
    };
    setSoldPixels(prev => [...prev.filter(p => p.x !== pixelData.x || p.y !== pixelData.y), newSoldPixel]);

    return true; // Simulate success
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative animate-fade-in">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-lg pointer-events-auto animate-slide-in-up animation-delay-200 border border-primary/20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zoom In" className="button-hover-lift">
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Aumentar Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zoom Out" className="button-hover-lift">
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Diminuir Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleResetView} aria-label="Reset View" className="button-hover-lift">
                <Expand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Resetar Vista</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="mt-2 p-2 bg-background/50 rounded-md text-xs font-code border border-border/30">
          <p>Zoom: {zoom.toFixed(2)}x</p>
          <p>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          {highlightedPixel && <p className="text-primary font-bold">Pixel: ({highlightedPixel.x}, {highlightedPixel.y})</p>}
          <p>Píxeis no Mapa: {activePixelsInMap > 0 ? activePixelsInMap.toLocaleString('pt-PT') : '...'}</p>
        </div>
      </div>
      
      {showProgressIndicator && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-card/90 backdrop-blur-sm p-4 rounded-lg shadow-xl text-center pointer-events-none border border-primary/30">
            <div className="flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse mr-3" />
                <p className="text-sm font-headline text-foreground">{progressMessage}</p>
            </div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        )}
      
      {selectedPixelDetails && (
        <EnhancedPixelPurchaseModal
          isOpen={showPixelModal}
          onClose={() => setShowPixelModal(false)}
          pixelData={selectedPixelDetails}
          userCredits={12500}
          userSpecialCredits={120}
          onPurchase={handlePurchase}
        />
      )}

      <div className="flex-grow w-full h-full p-4 md:p-8 flex items-center justify-center relative z-10">
        <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative rounded-xl shadow-2xl border border-primary/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
        >
            <div
            style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                width: `${canvasDrawWidth}px`,
                height: `${canvasDrawHeight}px`,
                transformOrigin: 'top left',
                position: 'relative', 
            }}
            >
            <canvas
                ref={pixelCanvasRef}
                className="absolute top-0 left-0 w-full h-full z-10" 
                style={{ imageRendering: 'pixelated' }} 
            />
            {(!mapData && isClient) && <PortugalMapSvg onMapDataLoaded={handleMapDataLoaded} className="invisible absolute" />}
            </div>
            <canvas
                ref={outlineCanvasRef}
                className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none"
                style={{ imageRendering: 'auto' }}
            />
        </div>
      </div>


      <div className="absolute bottom-6 right-6 z-20 animate-scale-in animation-delay-500" pointerEvents="auto">
        <Dialog>
          <DialogTrigger asChild>
             <Button pointerEvents="auto" size="icon" className="rounded-full w-14 h-14 shadow-2xl button-gradient-gold button-3d-effect hover:button-gold-glow active:scale-95 border-2 border-background">
                <Star className="h-7 w-7 animate-glow" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/30 shadow-xl" data-dialog-content pointerEvents="auto">
            <DialogHeader className="dialog-header-gold-accent rounded-t-lg">
              <DialogTitle className="font-headline text-shadow-gold-sm">Ações Rápidas do Universo</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Explore, filtre e interaja com o mapa de pixels.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button pointerEvents="auto" variant="outline" className="button-3d-effect-outline button-hover-lift"><Search className="mr-2 h-4 w-4" />Explorar Pixel por Coordenadas</Button>
              <Button pointerEvents="auto" variant="outline" onClick={handleGoToMyLocation} className="button-3d-effect-outline button-hover-lift"><MapPinIcon className="mr-2 h-4 w-4" />Ir para Minha Localização</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}