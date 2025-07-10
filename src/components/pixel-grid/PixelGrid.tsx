
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWindowSize } from 'react-use';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { usePixelStore, useSettingsStore, useUserStore } from '@/lib/store';
import EnhancedPixelPurchaseModal from './EnhancedPixelPurchaseModal';
import { useToast } from '@/hooks/use-toast';
import { cn, mapPixelToApproxGps } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full bg-destructive/10">
      <Card className="bg-background/80 border-destructive/50">
        <CardContent className="p-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-destructive-foreground">{t('error.grid')}</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={resetErrorBoundary} variant="destructive">
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('error.retry')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const logicalWidth = 12969;
const logicalHeight = 26674;

export default function PixelGrid() {
  const { width, height } = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(0.1); // Initial zoom to see the whole map
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPixelData, setModalPixelData] = useState<any>(null);
  const [mapPaths, setMapPaths] = useState<Path2D[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { highQualityRendering } = useSettingsStore();

  const { soldPixels, addSoldPixel } = usePixelStore();
  const { removeCredits, addXp, addPixel } = useUserStore();
  const { toast } = useToast();

  const GRID_SIZE = highQualityRendering ? 20 : 40;
  const GRID_COLOR = 'rgba(212, 167, 87, 0.1)';

  const handleMapDataLoaded = useCallback((data: MapData) => {
    if (data.pathStrings.length > 0) {
      const paths = data.pathStrings.map(pathString => new Path2D(pathString));
      setMapPaths(paths);
      setIsLoading(false);
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
  
    // Draw Portugal Map
    if (mapPaths.length > 0) {
      const gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight);
      gradient.addColorStop(0, "hsl(var(--accent))");
      gradient.addColorStop(1, "hsl(var(--primary))");
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 20 / zoom; // Keep border consistent on zoom
      
      mapPaths.forEach(path => {
        ctx.fill(path);
        ctx.stroke(path);
      });
    }
    
    // Draw Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1 / zoom;
    if (zoom > 0.5) {
      for (let x = 0; x <= logicalWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, logicalHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= logicalHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(logicalWidth, y);
        ctx.stroke();
      }
    }
    
    // Draw Sold Pixels
    soldPixels.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
  
    ctx.restore();
  }, [zoom, offset, mapPaths, soldPixels, highQualityRendering, width, height]);
  

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    // Center map on initial load
    if (width > 0 && height > 0 && !isLoading) {
      const initialZoom = Math.min(width / logicalWidth, height / logicalHeight) * 0.9;
      setZoom(initialZoom);
      setOffset({
        x: (width - logicalWidth * initialZoom) / 2,
        y: (height - logicalHeight * initialZoom) / 2,
      });
    }
  }, [width, height, isLoading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta, e.clientX, e.clientY);
      };
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [zoom, offset]);

  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    const newZoom = Math.max(0.01, Math.min(50, zoom + delta * zoom));
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX || rect.width / 2) - rect.left;
    const mouseY = (clientY || rect.height / 2) - rect.top;
  
    const mousePoint = { x: (mouseX - offset.x) / zoom, y: (mouseY - offset.y) / zoom };
    
    const newOffsetX = mouseX - mousePoint.x * newZoom;
    const newOffsetY = mouseY - mousePoint.y * newZoom;
  
    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = Math.abs(e.clientX - (startDrag.x + offset.x));
      const dy = Math.abs(e.clientY - (startDrag.y + offset.y));

      if (dx < 5 && dy < 5) { // It's a click, not a drag
        handlePixelClick(e);
      }
    }
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - startDrag.x,
        y: e.clientY - startDrag.y,
      });
    }
  };

  const handlePixelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    const gridX = Math.floor(((x - offset.x) / zoom) / GRID_SIZE);
    const gridY = Math.floor(((y - offset.y) / zoom) / GRID_SIZE);

    setSelectedPixel({ x: gridX, y: gridY });
    
    const existingPixel = soldPixels.find(p => p.x === gridX && p.y === gridY);
    
    const gpsCoords = mapPixelToApproxGps(gridX, gridY, Math.floor(logicalWidth / GRID_SIZE), Math.floor(logicalHeight / GRID_SIZE));
    
    const pixelDetails = {
      x: gridX,
      y: gridY,
      color: existingPixel?.color || '#333333',
      owner: existingPixel?.ownerId || 'Sistema',
      price: 75,
      lastSold: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 5)] as any,
      region: 'Lisboa',
      isProtected: Math.random() > 0.8,
      history: [],
      isOwnedByCurrentUser: existingPixel?.ownerId === 'currentUserPixelMaster',
      isForSaleBySystem: !existingPixel,
      gpsCoords: gpsCoords
    };
    
    setModalPixelData(pixelDetails);
    setIsModalOpen(true);
  };
  
  const handlePurchase = async (pixelData: any, paymentMethod: string, customizations: any): Promise<boolean> => {
    try {
      addSoldPixel({
        x: pixelData.x,
        y: pixelData.y,
        color: customizations.color || '#D4A757',
        ownerId: 'currentUserPixelMaster',
        title: customizations.title,
      });
      removeCredits(pixelData.price);
      addXp(100);
      addPixel();
      return true;
    } catch(e) {
      return false;
    }
  };
  
  const resetView = () => {
    if (width > 0 && height > 0) {
      const initialZoom = Math.min(width / logicalWidth, height / logicalHeight) * 0.9;
      setZoom(initialZoom);
      setOffset({
        x: (width - logicalWidth * initialZoom) / 2,
        y: (height - logicalHeight * initialZoom) / 2,
      });
    }
  };
  
  return (
    <div className="relative w-full h-full bg-background overflow-hidden cursor-grab active:cursor-grabbing">
        <div style={{ display: 'none' }}>
            <PortugalMapSvg onMapDataLoaded={handleMapDataLoaded} />
        </div>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-background">
            <Card className="text-center p-6 bg-card/80 backdrop-blur-sm">
              <CardContent className="space-y-3">
                <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
                <h2 className="text-lg font-semibold">{t('map.loading')}</h2>
                <p className="text-sm text-muted-foreground">A renderizar mapa de Portugal...</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
            />

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => handleZoom(0.2)} aria-label="Zoom In">
                      <ZoomIn />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>Zoom In</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => handleZoom(-0.2)} aria-label="Zoom Out">
                      <ZoomOut />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>Zoom Out</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={resetView} aria-label="Reset View">
                      <RotateCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left"><p>Resetar Vista</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <PerformanceMonitor />

            <EnhancedPixelPurchaseModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              pixelData={modalPixelData}
              userCredits={12500}
              userSpecialCredits={120}
              onPurchase={handlePurchase}
            />
          </motion.div>
        )}
      </ErrorBoundary>
    </div>
  );
}
