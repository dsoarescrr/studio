
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ZoomIn, ZoomOut, Move, MousePointer, Maximize, Palette, Star, Users, MapPin as MapPinIcon,
  Ruler, Info, Download, Upload, Bot, Sparkles
} from 'lucide-react';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
import EnhancedPixelPurchaseModal from './EnhancedPixelPurchaseModal';
import { generatePixelDescription } from '@/ai/flows/generate-pixel-description';
import { useToast } from '@/hooks/use-toast';
import { mapPixelToApproxGps } from '@/lib/utils';
import { cn } from '@/lib/utils';

type InteractionMode = 'select' | 'pan';
type ViewMode = 'grid' | 'map' | 'hybrid';

const PIXEL_SIZE = 10;
const GRID_COLOR = 'rgba(128, 128, 128, 0.2)';

interface Pixel {
  x: number;
  y: number;
  logicalX: number;
  logicalY: number;
  color: string;
  owner?: string;
  price: number;
  lastSold: Date;
  views: number;
  likes: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  region: string;
  isProtected: boolean;
  history: Array<{ owner: string; date: Date; price: number; action: 'purchase' | 'sale' | 'transfer' }>;
  features: string[];
  description: string;
  tags: string[];
  title?: string;
  loreSnippet?: string;
  isOwnedByCurrentUser?: boolean;
  isForSaleByOwner?: boolean;
  salePrice?: number;
  isForSaleBySystem?: boolean;
  gpsCoords?: { lat: number; lon: number } | null;
}

interface SelectedPixelDetails extends Pixel {
  // Can be extended if more details are needed
}

const generateMockPixelData = (
  width: number,
  height: number,
  mapPaths: MapData | null,
  totalCols: number,
  totalRows: number
): Pixel[] => {
  if (!mapPaths || !mapPaths.svgElement) return [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  canvas.width = totalCols;
  canvas.height = totalRows;

  const svgPath = new Path2D(mapPaths.pathStrings.join(' '));

  // We need to scale the path to fit the logical canvas
  const svgBBox = mapPaths.svgElement.getBBox();
  const scaleX = totalCols / svgBBox.width;
  const scaleY = totalRows / svgBBox.height;
  const matrix = new DOMMatrix();
  matrix.scaleSelf(scaleX, scaleY);
  matrix.translateSelf(-svgBBox.x, -svgBBox.y);

  const transformedPath = new Path2D();
  transformedPath.addPath(svgPath, matrix);
  ctx.fillStyle = 'black'; // Use a solid color to check for points
  ctx.fill(transformedPath);

  const rarities: Pixel['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const regions = ['Norte', 'Centro', 'Lisboa', 'Alentejo', 'Algarve', 'Açores', 'Madeira'];
  const owners = ['PixelMaster', 'ArtisanHex', 'ColorQueen', 'GridGuardian', 'System'];
  const pixels: Pixel[] = [];

  for (let i = 0; i < 2000; i++) {
    const logicalX = Math.floor(Math.random() * totalCols);
    const logicalY = Math.floor(Math.random() * totalRows);
    
    // Check if the pixel is inside the map shape
    const pixelData = ctx.getImageData(logicalX, logicalY, 1, 1).data;
    if (pixelData[3] === 0) { // Alpha channel is 0, so it's outside
      continue;
    }

    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    pixels.push({
      x: logicalX * PIXEL_SIZE,
      y: logicalY * PIXEL_SIZE,
      logicalX,
      logicalY,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      owner: owners[Math.floor(Math.random() * owners.length)],
      price: Math.floor(Math.random() * 200) + 10,
      lastSold: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 200),
      rarity: rarity,
      region: regions[Math.floor(Math.random() * regions.length)],
      isProtected: Math.random() > 0.8,
      history: [],
      features: ['Animado', 'Brilhante'],
      description: 'Um belo pixel à espera de um novo dono.',
      tags: ['paisagem', 'arte'],
      gpsCoords: mapPixelToApproxGps(logicalX, logicalY, totalCols, totalRows),
    });
  }
  return pixels;
};

export default function PixelGrid() {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('pan');
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
  const [selectedPixel, setSelectedPixel] = useState<SelectedPixelDetails | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (mapData) {
      const { svgElement } = mapData;
      if (svgElement) {
        const bbox = svgElement.getBBox();
        const width = bbox.width;
        const height = bbox.height;
        const totalCols = Math.floor(width / PIXEL_SIZE);
        const totalRows = Math.floor(height / PIXEL_SIZE);
        setGridDimensions({ width, height });
        const mockData = generateMockPixelData(width, height, mapData, totalCols, totalRows);
        setPixels(mockData);
      }
    }
  }, [mapData]);
  
  const handleMapDataLoaded = useCallback((data: MapData) => {
    setMapData(data);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || interactionMode !== 'pan') return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const newK = e.deltaY < 0 ? transform.k * scaleFactor : transform.k / scaleFactor;
    const k = Math.max(0.1, Math.min(newK, 10)); // Clamp zoom level

    const svgPoint = svgRef.current?.createSVGPoint();
    if (!svgPoint || !svgRef.current) return;
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const pointInSVG = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const x = pointInSVG.x - (pointInSVG.x - transform.x) * (k / transform.k);
    const y = pointInSVG.y - (pointInSVG.y - transform.y) * (k / transform.k);

    setTransform({ x, y, k });
  };
  
  const handlePixelClick = (pixel: Pixel) => {
    if (interactionMode === 'select') {
      setSelectedPixel(pixel);
      setShowPurchaseModal(true);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedPixel) return;
    setIsGeneratingDescription(true);
    try {
      const result = await generatePixelDescription({
        x: selectedPixel.logicalX,
        y: selectedPixel.logicalY,
        surroundingAreaImageDataUri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Placeholder
      });
      setSelectedPixel(prev => prev ? { ...prev, description: result.description } : null);
      toast({ title: "Descrição Gerada", description: "A descrição do pixel foi atualizada com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível gerar a descrição.", variant: "destructive" });
      console.error(error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handlePurchase = async (pixelData: SelectedPixelDetails, paymentMethod: string, customizations: any) => {
    console.log("Comprando pixel:", pixelData, "com", paymentMethod, "e customizações:", customizations);
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1; // 90% success rate
    setIsProcessing(false);
    return success;
  };
  const [isProcessing, setIsProcessing] = useState(false);
  
  const zoom = (factor: number) => {
    setTransform(prev => ({ ...prev, k: Math.max(0.1, Math.min(prev.k * factor, 10)) }));
  };

  const mapOpacity = useMemo(() => {
    if (viewMode === 'map') return 1;
    if (viewMode === 'hybrid') return Math.min(1, Math.max(0, 1 - (transform.k - 0.5) * 0.8));
    return 0;
  }, [viewMode, transform.k]);
  
  const gridOpacity = useMemo(() => {
    if (viewMode === 'grid') return 1;
    if (viewMode === 'hybrid') return Math.min(1, Math.max(0, (transform.k - 0.2) * 1.5));
    return 0;
  }, [viewMode, transform.k]);


  return (
    <div className="relative h-full w-full overflow-hidden bg-background font-code cursor-grab"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: interactionMode === 'pan' ? 'grab' : 'crosshair' }}
    >
      <svg ref={svgRef} className="absolute inset-0 h-full w-full">
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          <PortugalMapSvg
            onMapDataLoaded={handleMapDataLoaded}
            className="transition-opacity duration-300"
            style={{ opacity: mapOpacity }}
          />

          {transform.k > 0.5 && gridOpacity > 0 && (
            <>
              {/* Draw pixel colors */}
              <g style={{ opacity: gridOpacity }}>
                {pixels.map(p => (
                  <rect
                    key={`${p.logicalX}-${p.logicalY}`}
                    x={p.logicalX * PIXEL_SIZE}
                    y={p.logicalY * PIXEL_SIZE}
                    width={PIXEL_SIZE}
                    height={PIXEL_SIZE}
                    fill={p.color}
                    onClick={() => handlePixelClick(p)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </g>

              {/* Draw grid lines */}
              {transform.k > 2 && (
                <g stroke={GRID_COLOR} strokeWidth={0.5 / transform.k} style={{ pointerEvents: 'none' }}>
                  {Array.from({ length: Math.floor(gridDimensions.width / PIXEL_SIZE) + 1 }).map((_, i) => (
                    <line key={`v-${i}`} x1={i * PIXEL_SIZE} y1={0} x2={i * PIXEL_SIZE} y2={gridDimensions.height} />
                  ))}
                  {Array.from({ length: Math.floor(gridDimensions.height / PIXEL_SIZE) + 1 }).map((_, i) => (
                    <line key={`h-${i}`} x1={0} y1={i * PIXEL_SIZE} x2={gridDimensions.width} y2={i * PIXEL_SIZE} />
                  ))}
                </g>
              )}
            </>
          )}
        </g>
      </svg>
      
      {/* UI Overlays */}
      <div className="absolute top-4 left-4 z-10 space-y-2 animate-fade-in">
        <Card className="bg-card/80 backdrop-blur-sm p-2">
          <p className="text-xs text-muted-foreground">Zoom</p>
          <p className="font-semibold text-primary">{transform.k.toFixed(2)}x</p>
        </Card>
      </div>

      <div className="absolute top-4 right-4 z-10 space-y-2 animate-fade-in">
        <Card className="bg-card/80 backdrop-blur-sm p-2">
          <div className="flex flex-col items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => zoom(1.5)}><ZoomIn /></Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Aproximar</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => zoom(1/1.5)}><ZoomOut /></Button>
                </TooltipTrigger>
                <TooltipContent side="left"><p>Afastar</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant={interactionMode === 'select' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setInteractionMode('select')}
                          >
                            <MousePointer />
                          </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Modo de Seleção</p></TooltipContent>
                </Tooltip>
             </TooltipProvider>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant={interactionMode === 'pan' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setInteractionMode('pan')}
                          >
                            <Move />
                          </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Modo de Navegação</p></TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 z-10 animate-fade-in">
        <Card className="bg-card/80 backdrop-blur-sm p-2 flex gap-2">
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
                </TooltipTrigger>
                <TooltipContent><p>Apenas Grelha</p></TooltipContent>
              </Tooltip>
           </TooltipProvider>
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={viewMode === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('map')}>Mapa</Button>
                </TooltipTrigger>
                <TooltipContent><p>Apenas Mapa</p></TooltipContent>
              </Tooltip>
           </TooltipProvider>
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={viewMode === 'hybrid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('hybrid')}>Híbrido</Button>
                </TooltipTrigger>
                <TooltipContent><p>Combinação de Mapa e Grelha</p></TooltipContent>
              </Tooltip>
           </TooltipProvider>
        </Card>
      </div>

       <EnhancedPixelPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          pixelData={selectedPixel}
          userCredits={12500}
          userSpecialCredits={120}
          onPurchase={handlePurchase}
       />
    </div>
  );
}
