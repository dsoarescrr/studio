
// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand, Search, Sparkles, MousePointer2, Palette } from 'lucide-react';
import PortugalMapSvg from './PortugalMapSvg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const LOGICAL_GRID_COLS = 200;
const LOGICAL_GRID_ROWS = 200;
const RENDERED_PIXEL_SIZE = 10; // The drawn size of each logical pixel on the canvas at 1x zoom
const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function PixelGrid() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [pixelDescription, setPixelDescription] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0); // For hydration-safe progress
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Calculate the total width and height of the canvas content based on logical grid and rendered size
  const canvasDrawWidth = LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE;
  const canvasDrawHeight = LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE;

  const drawPixelsOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution (drawing buffer size)
    canvas.width = canvasDrawWidth;
    canvas.height = canvasDrawHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Example: Draw a simple grid of gray pixels
    // In a real app, you'd fetch pixel data and draw accordingly
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)'; // Semi-transparent gray for unowned pixels

    for (let r = 0; r < LOGICAL_GRID_ROWS; r++) {
      for (let c = 0; c < LOGICAL_GRID_COLS; c++) {
        ctx.fillRect(
          c * RENDERED_PIXEL_SIZE,
          r * RENDERED_PIXEL_SIZE,
          RENDERED_PIXEL_SIZE,
          RENDERED_PIXEL_SIZE
        );
        // Optional: draw a lighter border for each pixel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Very light border
        ctx.strokeRect(
            c * RENDERED_PIXEL_SIZE,
            r * RENDERED_PIXEL_SIZE,
            RENDERED_PIXEL_SIZE,
            RENDERED_PIXEL_SIZE
        );
      }
    }
  }, [canvasDrawWidth, canvasDrawHeight]);

  useEffect(() => {
    // Initial draw and centering
    drawPixelsOnCanvas();
    
    if (containerRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        // Calculate the scaled dimensions of the canvas content
        const canvasContentWidth = canvasDrawWidth * zoom;
        const canvasContentHeight = canvasDrawHeight * zoom;

        // Center the canvas content
        setPosition({ 
            x: (containerWidth - canvasContentWidth) / 2, 
            y: (containerHeight - canvasContentHeight) / 2 
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawPixelsOnCanvas]); // Zoom is intentionally omitted to prevent re-centering on zoom

  useEffect(() => {
    // Client-side only effect for progress bar to avoid hydration mismatch
    if (isGeneratingDesc) {
      setProgressValue(Math.floor(Math.random() * 50) + 25); 
    }
  }, [isGeneratingDesc]);

  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom * 1.2, 10));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.05));
  const handleResetView = () => {
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
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('button, input, [role="slider"], canvas')) {
      // If click is on canvas, let handleCanvasClick take over
      // Otherwise, if it's another UI element, prevent drag
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
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); // Gets the *rendered* size and position of the canvas

    // Calculate click coordinates relative to the canvas element
    const clickXInCanvasElement = event.clientX - rect.left;
    const clickYInCanvasElement = event.clientY - rect.top;
    
    // Convert click coordinates from canvas element space to canvas drawing buffer space
    // This accounts for the CSS scaling of the canvas element if its width/height attributes
    // differ from its style.width/style.height.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = clickXInCanvasElement * scaleX;
    const canvasY = clickXInCanvasElement * scaleY;

    // Determine which logical pixel was clicked
    const logicalCol = Math.floor(canvasX / RENDERED_PIXEL_SIZE);
    const logicalRow = Math.floor(canvasY / RENDERED_PIXEL_SIZE);

    if (logicalCol >= 0 && logicalCol < LOGICAL_GRID_COLS && logicalRow >= 0 && logicalRow < LOGICAL_GRID_ROWS) {
      setSelectedPixel({ x: logicalCol, y: logicalRow });
      console.log(`Clicked logical pixel: (${logicalCol}, ${logicalRow})`);
      setShowAiModal(true); // Open the AI description modal
    } else {
      setSelectedPixel(null);
    }
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!selectedPixel) return;
    setIsGeneratingDesc(true);
    setPixelDescription(null); 

    try {
        // For AI, we need a data URI of the surrounding area.
        // For now, using a placeholder. In a real app, you might capture a portion of the canvas.
        const input: GeneratePixelDescriptionInput = {
            x: selectedPixel.x,
            y: selectedPixel.y,
            surroundingAreaImageDataUri: PLACEHOLDER_IMAGE_DATA_URI, // Placeholder
        };
        const result = await generatePixelDescription(input);
        setPixelDescription(result.description);
        toast({ title: "Descrição Gerada", description: "A IA gerou uma descrição para o pixel." });
    } catch (error) {
        console.error("Error generating pixel description:", error);
        setPixelDescription("Falha ao gerar descrição.");
        toast({ title: "Erro na IA", description: "Não foi possível gerar a descrição.", variant: "destructive" });
    } finally {
        setIsGeneratingDesc(false);
    }
  }, [selectedPixel, toast]);

  const ActionButtonDialogTrigger = (
    <Button size="icon" className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
      <MousePointer2 className="h-7 w-7" />
    </Button>
  );

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-card/80 p-2 rounded-md shadow-lg">
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
        </div>
      </div>

      {isGeneratingDesc && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
              <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              <p className="mt-4 text-lg font-headline">A IA está a gerar a descrição...</p>
              <Progress value={progressValue} className="w-1/2 mt-4" /> 
          </div>
      )}
      
      <Dialog open={showAiModal} onOpenChange={(isOpen) => {
          setShowAiModal(isOpen);
          if (!isOpen) { // Reset when modal closes
              setPixelDescription(null);
              // setSelectedPixel(null); // Keep selected pixel to show coords if modal is reopened
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Gerar Descrição com IA
            </DialogTitle>
            <DialogDescription>
              Analisar a área ao redor do pixel lógico ({selectedPixel?.x}, {selectedPixel?.y}) para gerar uma descrição?
            </DialogDescription>
          </DialogHeader>
          {pixelDescription && (
            <div className="my-4 p-3 bg-background/50 rounded-md">
                <p className="text-sm text-foreground">{pixelDescription}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAiModal(false); setPixelDescription(null); setSelectedPixel(null);}}>Cancelar</Button>
            <Button onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
              {isGeneratingDesc ? "A gerar..." : (pixelDescription ? "Gerar Novamente" : "Gerar Descrição")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Container for pan and zoom */}
      <div
        ref={containerRef}
        className="flex-grow w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-background relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {/* This div is transformed for pan and zoom */}
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
            width: `${canvasDrawWidth}px`, // Intrinsic content width
            height: `${canvasDrawHeight}px`, // Intrinsic content height
            transformOrigin: 'top left', // Ensures scaling originates correctly
            position: 'relative', // For absolute positioning of children if needed
          }}
        >
          {/* SVG map as background, scaled to fit the transformed div */}
          <PortugalMapSvg 
            className="absolute top-0 left-0 w-full h-full text-foreground/10 pointer-events-none z-0"
          />
          {/* Canvas for pixels, also scaled to fit the transformed div */}
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute top-0 left-0 z-10" // Positioned over the SVG
            style={{ 
              width: '100%', 
              height: '100%',
              clipPath: 'url(#portugal-clip-path)' // Apply clipping
            }} 
          />
        </div>
      </div>
      
      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <Dialog>
          <DialogTrigger asChild>
            {ActionButtonDialogTrigger}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card">
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
              <Button variant="ghost" onClick={() => { /* Logic to close dialog can be handled by Dialog's onOpenChange */ }}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

    
