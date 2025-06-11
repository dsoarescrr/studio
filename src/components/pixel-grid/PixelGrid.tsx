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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const GRID_SIZE = 50; // Example grid size
const PIXEL_SIZE = 10; // Initial pixel size

export default function PixelGrid() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [pixelDescription, setPixelDescription] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom * 1.2, 5));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.1));
  const handleResetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    if (svgContainerRef.current) {
        const { offsetWidth, offsetHeight } = svgContainerRef.current;
        setPosition({ x: offsetWidth / 2, y: offsetHeight / 2 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If the click is on a map pixel, don't start dragging for pan.
    if ((e.target as HTMLElement).closest('.map-pixel')) {
      return; 
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gridRef.current) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    if (hoverTimeout) clearTimeout(hoverTimeout);
  };

  const handlePixelClick = (event: React.MouseEvent) => {
    const pixelElement = (event.target as HTMLElement).closest('.map-pixel');
    if (pixelElement) {
      if (hoverTimeout) clearTimeout(hoverTimeout); // Clear any pending hover timeout

      const pixelId = pixelElement.getAttribute('data-pixel-id') || 'unknown-pixel';
      const regionId = pixelElement.getAttribute('data-region-id') || 'unknown-region';
      const svgX = parseInt(pixelElement.getAttribute('x') || "0", 10);
      const svgY = parseInt(pixelElement.getAttribute('y') || "0", 10);

      console.log(`Pixel clicked: ${pixelId}, Region: ${regionId}, SVG Coords: (${svgX}, ${svgY})`);
      
      setSelectedPixel({ x: svgX, y: svgY });
      setShowAiModal(true); 
    }
  };

  const handlePixelHover = (x: number, y: number) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeoutId = setTimeout(() => {
        setSelectedPixel({ x, y });
        setShowAiModal(true);
    }, 1000);
    setHoverTimeout(timeoutId);
  };

  const handlePixelLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!selectedPixel || !svgContainerRef.current) return;
    setIsGeneratingDesc(true);
    setPixelDescription(null); 

    try {
        const svgElement = svgContainerRef.current.querySelector('svg');
        if (!svgElement) {
          toast({ title: "Erro", description: "Não foi possível encontrar o elemento SVG.", variant: "destructive" });
          setIsGeneratingDesc(false);
          setShowAiModal(false);
          return;
        }

        const tempSvg = svgElement.cloneNode(true) as SVGSVGElement;
        const viewBoxSize = 200; 
        // The selectedPixel.x and selectedPixel.y are now SVG coordinates
        const pixelSvgX = selectedPixel.x; 
        const pixelSvgY = selectedPixel.y; 
        
        tempSvg.setAttribute('viewBox', `${pixelSvgX - viewBoxSize/2 + PIXEL_SIZE / 2} ${pixelSvgY - viewBoxSize/2 + PIXEL_SIZE / 2} ${viewBoxSize} ${viewBoxSize}`);
        tempSvg.setAttribute('width', `${viewBoxSize}`);
        tempSvg.setAttribute('height', `${viewBoxSize}`);
        
        const svgString = new XMLSerializer().serializeToString(tempSvg);
        const surroundingAreaImageDataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;

        const input: GeneratePixelDescriptionInput = {
            x: selectedPixel.x, // SVG x coordinate
            y: selectedPixel.y, // SVG y coordinate
            surroundingAreaImageDataUri,
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
        // Keep AI modal open if description was generated or failed, user closes manually or via button
        // setShowAiModal(false); // Let's not close it automatically
    }
  }, [selectedPixel, toast]);


  useEffect(() => {
    if (svgContainerRef.current) {
      const { offsetWidth, offsetHeight } = svgContainerRef.current;
      setPosition({ x: offsetWidth / 2 - (GRID_SIZE * PIXEL_SIZE * zoom / 2) , y: offsetHeight / 2 - (GRID_SIZE * PIXEL_SIZE * zoom /2) });
    }
  }, []);

  // For demo purposes, render a simple grid if SVG is not available
  const renderFallbackGrid = () => {
    const pixels = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        pixels.push(
          <div
            key={`${x}-${y}`}
            className="border border-border/20 hover:bg-accent/30 transition-colors"
            style={{
              width: `${PIXEL_SIZE * zoom}px`,
              height: `${PIXEL_SIZE * zoom}px`,
            }}
            // onMouseEnter={() => handlePixelHover(x,y)} // Click is primary now for SVG
            // onMouseLeave={handlePixelLeave}
            // onClick={() => setSelectedPixel({x, y})} // Click is handled by svgContainerRef for SVG pixels
          />
        );
      }
    }
    return (
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${PIXEL_SIZE * zoom}px)`,
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {pixels}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative" ref={gridRef}>
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
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
          min={0.1}
          max={5}
          step={0.1}
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          className="w-32 mt-2"
          aria-label="Zoom Slider"
        />
        <div className="mt-2 p-2 bg-card rounded-md shadow-lg text-xs font-code">
          <p>Zoom: {zoom.toFixed(2)}x</p>
          <p>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          {selectedPixel && <p>Pixel: ({selectedPixel.x}, {selectedPixel.y})</p>}
        </div>
      </div>

      {isGeneratingDesc && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-50">
              <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              <p className="mt-4 text-lg font-headline">A IA está a gerar a descrição...</p>
              <Progress value={50} className="w-1/2 mt-4" /> 
          </div>
      )}
      
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Gerar Descrição com IA
            </DialogTitle>
            <DialogDescription>
              Analisar a área ao redor do pixel ({selectedPixel?.x}, {selectedPixel?.y}) para gerar uma descrição?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAiModal(false); setPixelDescription(null); setSelectedPixel(null); }}>Cancelar</Button>
            <Button onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
              {isGeneratingDesc ? "A gerar..." : "Gerar Descrição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pixelDescription && (
        <Card className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md shadow-2xl bg-popover">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-lg">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Descrição do Pixel ({selectedPixel?.x}, {selectedPixel?.y})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-popover-foreground">{pixelDescription}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => {setPixelDescription(null); setSelectedPixel(null); setShowAiModal(false);}}>Fechar</Button>
          </CardContent>
        </Card>
      )}

      <div
        ref={svgContainerRef}
        className="flex-grow w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-background"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handlePixelClick} 
      >
        <div 
          style={{
            width: '100%', 
            height: '100%', 
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="text-foreground/10" 
        >
          <PortugalMapSvg />
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
