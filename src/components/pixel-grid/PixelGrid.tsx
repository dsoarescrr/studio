
// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand, Search, Sparkles, MousePointer2, Palette } from 'lucide-react';
import PortugalMapSvg from './PortugalMapSvg';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const LOGICAL_GRID_COLS = 200; // Number of columns in the logical pixel grid
const LOGICAL_GRID_ROWS = 200; // Number of rows in the logical pixel grid
const RENDERED_PIXEL_SIZE = 10; // The base size of each_logical_pixel when drawn on canvas at 1x zoom

// Placeholder for AI description image - a 1x1 transparent PNG
const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';


export default function PixelGrid() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null); // Logical grid coords
  const [pixelDescription, setPixelDescription] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null); // For the main draggable area
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const drawPixelsOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas physical dimensions once
    if (containerRef.current) {
        // Match canvas drawing buffer size to its CSS-scaled size for clarity at 1x zoom
        canvas.width = LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE;
        canvas.height = LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)'; // Default pixel color (semi-transparent gray)

    for (let r = 0; r < LOGICAL_GRID_ROWS; r++) {
      for (let c = 0; c < LOGICAL_GRID_COLS; c++) {
        // TODO: Later, get color/state from pixelData[r][c]
        ctx.fillRect(
          c * RENDERED_PIXEL_SIZE,
          r * RENDERED_PIXEL_SIZE,
          RENDERED_PIXEL_SIZE,
          RENDERED_PIXEL_SIZE
        );
        // Add a light border to distinguish pixels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(
            c * RENDERED_PIXEL_SIZE,
            r * RENDERED_PIXEL_SIZE,
            RENDERED_PIXEL_SIZE,
            RENDERED_PIXEL_SIZE
        );
      }
    }
  }, []);

  useEffect(() => {
    drawPixelsOnCanvas();
    
    // Center the initial view if possible
    if (containerRef.current && canvasRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        // Calculate the center based on the canvas content size (not its element size, which might be 100%)
        // and the initial zoom level.
        const canvasContentWidth = LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE * zoom;
        const canvasContentHeight = LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE * zoom;

        setPosition({ 
            x: (containerWidth - canvasContentWidth) / 2, 
            y: (containerHeight - canvasContentHeight) / 2 
        });
    }

  }, [drawPixelsOnCanvas]);


  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom * 1.2, 10)); // Increased max zoom
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.05)); // Decreased min zoom
  const handleResetView = () => {
    setZoom(1);
     if (containerRef.current && canvasRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        const canvasContentWidth = LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE; // at 1x zoom
        const canvasContentHeight = LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE; // at 1x zoom
        setPosition({ 
            x: (containerWidth - canvasContentWidth) / 2, 
            y: (containerHeight - canvasContentHeight) / 2 
        });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if click is on UI elements like buttons inside the containerRef
    if ((e.target as HTMLElement).closest('button, input, [role="slider"]')) {
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
    const rect = canvas.getBoundingClientRect(); // Gets actual size and position on screen

    // Calculate click relative to canvas element's visual top-left
    const scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    const logicalCol = Math.floor(canvasX / RENDERED_PIXEL_SIZE);
    const logicalRow = Math.floor(canvasY / RENDERED_PIXEL_SIZE);

    if (logicalCol >= 0 && logicalCol < LOGICAL_GRID_COLS && logicalRow >= 0 && logicalRow < LOGICAL_GRID_ROWS) {
      console.log(`Canvas pixel clicked: Col ${logicalCol}, Row ${logicalRow}`);
      setSelectedPixel({ x: logicalCol, y: logicalRow });
      setShowAiModal(true);
    } else {
      setSelectedPixel(null);
    }
  };


  const handleGenerateDescription = useCallback(async () => {
    if (!selectedPixel) return;
    setIsGeneratingDesc(true);
    setPixelDescription(null); 

    try {
        // For canvas, surroundingAreaImageDataUri needs to be generated differently.
        // For now, using a placeholder.
        const input: GeneratePixelDescriptionInput = {
            x: selectedPixel.x, // Logical column
            y: selectedPixel.y, // Logical row
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
              <Progress value={50} className="w-1/2 mt-4" /> 
          </div>
      )}
      
      <Dialog open={showAiModal} onOpenChange={(isOpen) => {
          setShowAiModal(isOpen);
          if (!isOpen) {
              setPixelDescription(null); // Clear description when modal closes
              // setSelectedPixel(null); // Keep selected pixel for context if re-opened, or clear if desired
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
        {/* The transformed container for SVG (background) and Canvas (pixels) */}
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out', // Faster transition
            width: `${LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE}px`, // Set intrinsic size for content
            height: `${LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE}px`,
            transformOrigin: 'top left', // Ensures scaling happens from the origin
            position: 'relative', // Needed for z-indexing children
          }}
        >
          <PortugalMapSvg 
            className="absolute top-0 left-0 w-full h-full text-foreground/10 pointer-events-none z-0" 
            // SVG dimensions should match canvas logical dimensions for alignment
            // style={{ width: `${LOGICAL_GRID_COLS * RENDERED_PIXEL_SIZE}px`, height: `${LOGICAL_GRID_ROWS * RENDERED_PIXEL_SIZE}px`}}
          />
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute top-0 left-0 z-10" // Canvas on top of SVG
            // CSS dimensions make it fill the parent div, bitmap dimensions set in drawPixelsOnCanvas
            style={{ width: '100%', height: '100%' }} 
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
              <Button variant="ghost" onClick={() => { /* Close dialog */ }}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

