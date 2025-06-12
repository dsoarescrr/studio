
// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand, Search, Sparkles, MousePointer2, Palette } from 'lucide-react';
import PortugalMapSvg from './PortugalMapSvg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generatePixelDescription, type GeneratePixelDescriptionInput } from '@/ai/flows/generate-pixel-description';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';

const LOGICAL_GRID_COLS_CONFIG = 700; // Base columns for ~1M pixels
const RENDERED_PIXEL_SIZE_CONFIG = 2; // Visual size of each logical pixel at 1x zoom

const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const SVG_VIEWBOX_WIDTH = 12969;
const SVG_VIEWBOX_HEIGHT = 26674;

export default function PixelGrid() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [pixelDescription, setPixelDescription] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapPath2D, setMapPath2D] = useState<Path2D | null>(null);
  const { toast } = useToast();

  const canvasDrawWidth = LOGICAL_GRID_COLS_CONFIG * RENDERED_PIXEL_SIZE_CONFIG;
  const canvasDrawHeight = Math.floor(canvasDrawWidth * (SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH));
  const logicalGridCols = LOGICAL_GRID_COLS_CONFIG;
  const logicalGridRows = Math.floor(canvasDrawHeight / RENDERED_PIXEL_SIZE_CONFIG);
  const renderedPixelSize = RENDERED_PIXEL_SIZE_CONFIG;


  const handleMapPathLoaded = useCallback((path: Path2D) => {
    setMapPath2D(path);
  }, []);

  const drawPixelsOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapPath2D) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasDrawWidth;
    canvas.height = canvasDrawHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(160, 160, 160, 0.7)'; 
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; 

    const scaleXToSvg = SVG_VIEWBOX_WIDTH / canvasDrawWidth;
    const scaleYToSvg = SVG_VIEWBOX_HEIGHT / canvasDrawHeight;

    for (let r = 0; r < logicalGridRows; r++) {
      for (let c = 0; c < logicalGridCols; c++) {
        const pixelCanvasX = c * renderedPixelSize;
        const pixelCanvasY = r * renderedPixelSize;
        const pixelCenterXCanvas = pixelCanvasX + renderedPixelSize / 2;
        const pixelCenterYCanvas = pixelCanvasY + renderedPixelSize / 2;

        const svgCoordX = pixelCenterXCanvas * scaleXToSvg;
        const svgCoordY = pixelCenterYCanvas * scaleYToSvg;
        
        if (ctx.isPointInPath(mapPath2D, svgCoordX, svgCoordY)) {
          ctx.fillRect(
            pixelCanvasX,
            pixelCanvasY,
            renderedPixelSize,
            renderedPixelSize
          );
          ctx.strokeRect(
            pixelCanvasX,
            pixelCanvasY,
            renderedPixelSize,
            renderedPixelSize
          );
        }
      }
    }
  }, [canvasDrawWidth, canvasDrawHeight, mapPath2D, logicalGridCols, logicalGridRows, renderedPixelSize]);

  useEffect(() => {
    if (mapPath2D) {
      drawPixelsOnCanvas();
    }
    if (containerRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        const initialZoom = 1; 
        const canvasContentWidth = canvasDrawWidth * initialZoom;
        const canvasContentHeight = canvasDrawHeight * initialZoom;
        setPosition({ 
            x: (containerWidth - canvasContentWidth) / 2, 
            y: (containerHeight - canvasContentHeight) / 2 
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawPixelsOnCanvas, mapPath2D]);

  useEffect(() => {
    let animationFrameId: number;
    if (isGeneratingDesc) {
      setProgressValue(0);
      let currentProgress = 0;
      const animateProgress = () => {
        currentProgress += 2; 
        if (currentProgress <= 75) {
          setProgressValue(currentProgress);
          animationFrameId = requestAnimationFrame(animateProgress);
        } else if (currentProgress < 90) { 
           setProgressValue(75 + Math.floor(Math.random() * 15));
           animationFrameId = requestAnimationFrame(animateProgress); 
        }
      };
      animationFrameId = requestAnimationFrame(animateProgress);
    } else {
      if (progressValue > 0 && progressValue < 100) {
        setProgressValue(100); 
        setTimeout(() => setProgressValue(0), 500); 
      } else if (progressValue === 100) {
        setTimeout(() => setProgressValue(0), 500);
      }
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGeneratingDesc]);


  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom * 1.2, 10));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.05));
  
  const handleResetView = useCallback(() => {
    const currentZoom = 1;
    setZoom(currentZoom);
     if (containerRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        const canvasContentWidth = canvasDrawWidth * currentZoom;
        const canvasContentHeight = canvasDrawHeight * currentZoom;
        setPosition({ 
            x: (containerWidth - canvasContentWidth) / 2, 
            y: (containerHeight - canvasContentHeight) / 2 
        });
    }
  }, [canvasDrawWidth, canvasDrawHeight]);

  useEffect(() => {
    handleResetView(); 
  }, [handleResetView]);


 const handleMouseDown = (e: React.MouseEvent) => {
    const targetElement = e.target as HTMLElement;
    if (targetElement === canvasRef.current) { 
      // If click is on canvas, let handleCanvasClick manage it
      return;
    }
    // Prevent dragging if the click is on UI controls
    if (targetElement.closest('button, input, [role="slider"], [data-dialog-content], [role="dialog"]')) {
      return; 
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mapPath2D) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); 

    const clickXInCanvasElement = event.clientX - rect.left;
    const clickYInCanvasElement = event.clientY - rect.top;
    
    const scaleXFromElementToBuffer = canvas.width / rect.width;
    const scaleYFromElementToBuffer = canvas.height / rect.height;

    const canvasBufferX = clickXInCanvasElement * scaleXFromElementToBuffer;
    const canvasBufferY = clickYInCanvasElement * scaleYFromElementToBuffer;

    const logicalCol = Math.floor(canvasBufferX / renderedPixelSize);
    const logicalRow = Math.floor(canvasBufferY / renderedPixelSize);

    if (logicalCol >= 0 && logicalCol < logicalGridCols && logicalRow >= 0 && logicalRow < logicalGridRows) {
      const pixelCenterXCanvas = (logicalCol + 0.5) * renderedPixelSize;
      const pixelCenterYCanvas = (logicalRow + 0.5) * renderedPixelSize;
      
      const scaleXToSvg = SVG_VIEWBOX_WIDTH / canvasDrawWidth;
      const scaleYToSvg = SVG_VIEWBOX_HEIGHT / canvasDrawHeight;
      const svgCoordX = pixelCenterXCanvas * scaleXToSvg;
      const svgCoordY = pixelCenterYCanvas * scaleYToSvg;

      const ctx = canvas.getContext('2d');
      if (ctx && ctx.isPointInPath(mapPath2D, svgCoordX, svgCoordY)) {
        setSelectedPixel({ x: logicalCol, y: logicalRow });
        setShowAiModal(true);
        setPixelDescription(null); 
      } else {
        setSelectedPixel(null);
      }
    } else {
      setSelectedPixel(null);
    }
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!selectedPixel) return;
    setIsGeneratingDesc(true);
    setPixelDescription(null); 

    try {
        const input: GeneratePixelDescriptionInput = {
            x: selectedPixel.x,
            y: selectedPixel.y,
            surroundingAreaImageDataUri: PLACEHOLDER_IMAGE_DATA_URI,
        };
        const result = await generatePixelDescription(input);
        setPixelDescription(result.description);
        setProgressValue(100); 
        toast({ title: "Descrição Gerada", description: "A IA gerou uma descrição para o pixel." });
    } catch (error) {
        console.error("Error generating pixel description:", error);
        setPixelDescription("Falha ao gerar descrição.");
        setProgressValue(100); 
        toast({ title: "Erro na IA", description: "Não foi possível gerar a descrição.", variant: "destructive" });
    } finally {
        setIsGeneratingDesc(false);
        setTimeout(() => setProgressValue(0), 1000);
    }
  }, [selectedPixel, toast]);


  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-card/80 p-2 rounded-md shadow-lg backdrop-blur-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zoom In">
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Aumentar Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zoom Out">
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Diminuir Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleResetView} aria-label="Reset View">
                <Expand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Resetar Vista</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Slider
          defaultValue={[1]}
          min={0.05}
          max={10}
          step={0.01}
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          className="w-32 mt-2"
          aria-label="Zoom Slider"
        />
        <div className="mt-2 p-2 bg-background/50 rounded-md text-xs font-code">
          <p>Zoom: {zoom.toFixed(2)}x</p>
          <p>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          {selectedPixel && <p>Pixel Lógico: ({selectedPixel.x}, {selectedPixel.y})</p>}
          <p>Total Pixels: ~{(logicalGridCols * logicalGridRows / 1000000).toFixed(2)}M</p>
        </div>
      </div>
      
      <Dialog open={showAiModal} onOpenChange={(isOpen) => {
          setShowAiModal(isOpen);
          if (!isOpen) { 
              setPixelDescription(null);
              setIsGeneratingDesc(false); 
              setProgressValue(0);
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card" data-dialog-content>
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Interagir com Pixel ({selectedPixel?.x}, {selectedPixel?.y})
            </DialogTitle>
            <DialogDescription>
              O que gostaria de fazer com este pixel?
            </DialogDescription>
          </DialogHeader>
          {(isGeneratingDesc || (progressValue > 0 && progressValue < 100)) && (
            <div className="flex flex-col items-center justify-center my-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse mb-2" />
              <p className="text-sm font-headline">A IA está a gerar a descrição...</p>
              <Progress value={progressValue} className="w-full mt-2" />
            </div>
          )}
          {pixelDescription && !isGeneratingDesc && progressValue === 0 && (
            <div className="my-4 p-3 bg-background/50 rounded-md">
                <p className="text-sm font-semibold mb-1 text-primary">Descrição da IA:</p>
                <p className="text-sm text-foreground">{pixelDescription}</p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleGenerateDescription} disabled={isGeneratingDesc || !selectedPixel}>
              {isGeneratingDesc ? "A gerar..." : (pixelDescription ? "Gerar Nova Descrição" : "Gerar Descrição com IA")}
            </Button>
            <Button disabled={!selectedPixel}>Comprar Pixel (Em Breve)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        ref={containerRef}
        className="flex-grow w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-background relative"
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
          <PortugalMapSvg 
            className="absolute top-0 left-0 w-full h-full text-foreground/10 pointer-events-none z-0"
            onMapPathLoaded={handleMapPathLoaded}
          />
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute top-0 left-0 z-10" 
            style={{ 
              width: '100%', 
              height: '100%',
            }} 
          />
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 z-20">
        <Dialog>
          <DialogTrigger asChild>
             <Button size="icon" className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <MousePointer2 className="h-7 w-7" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card" data-dialog-content>
            <DialogHeader>
              <DialogTitle className="font-headline">Ações Rápidas</DialogTitle>
              <DialogDescription>
                Selecione uma ação para interagir com o universo pixel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline"><Search className="mr-2 h-4 w-4" />Explorar Pixel</Button>
              <Button variant="outline"><Palette className="mr-2 h-4 w-4" />Paleta de Cores</Button>
              <Button variant="outline"><Sparkles className="mr-2 h-4 w-4" />Eventos Especiais</Button>
            </div>
            <DialogFooter>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

