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

const SVG_VIEWBOX_WIDTH = 12969;
const SVG_VIEWBOX_HEIGHT = 26674;

// Target ~10.4M pixels
// RENDERED_PIXEL_SIZE_CONFIG = sqrt((canvasDrawWidth * canvasDrawHeight) / N)
// Given canvasDrawWidth = 1350, canvasDrawHeight = 2772, N = 10,400,000
// RENDERED_PIXEL_SIZE_CONFIG = sqrt((1350 * 2772) / 10400000) = ~0.6
const RENDERED_PIXEL_SIZE_CONFIG = 0.6;
// LOGICAL_GRID_COLS_CONFIG = canvasDrawWidth / RENDERED_PIXEL_SIZE_CONFIG
// LOGICAL_GRID_COLS_CONFIG = 1350 / 0.6 = 2250
const LOGICAL_GRID_COLS_CONFIG = 2250;


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
  const [aiModalProgressValue, setAiModalProgressValue] = useState(0);
  const [initialAiProgressTrigger, setInitialAiProgressTrigger] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapPath2D, setMapPath2D] = useState<Path2D | null>(null);
  const { toast } = useToast();

  const [drawingProgress, setDrawingProgress] = useState(0);
  const [initialDrawingComplete, setInitialDrawingComplete] = useState(false);

  // Calculate canvas buffer dimensions based on a manageable width
  const canvasDrawWidth = 1350; // Manageable width for the canvas buffer
  const canvasDrawHeight = Math.floor(canvasDrawWidth * (SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH)); // Maintain SVG aspect ratio
  
  // Calculate logical grid dimensions based on canvas buffer and RENDERED_PIXEL_SIZE_CONFIG
  const logicalGridCols = LOGICAL_GRID_COLS_CONFIG;
  const logicalGridRows = Math.floor(canvasDrawHeight / RENDERED_PIXEL_SIZE_CONFIG);
  const totalLogicalPixels = logicalGridCols * logicalGridRows;


  const handleMapPathLoaded = useCallback((path: Path2D) => {
    setMapPath2D(path);
  }, []);

  const drawPixelsOnCanvas = useCallback(async (
    currentCanvasWidth: number,
    currentCanvasHeight: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas || !mapPath2D) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setInitialDrawingComplete(false);
    setDrawingProgress(0);
    console.log('Starting initial pixel drawing...');

    canvas.width = currentCanvasWidth;
    canvas.height = currentCanvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
    ctx.strokeStyle = 'rgba(30, 30, 30, 0.75)';
    ctx.lineWidth = RENDERED_PIXEL_SIZE_CONFIG > 1 ? 0.2 : 0.1; 
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';

    const scaleXToSvg = SVG_VIEWBOX_WIDTH / currentCanvasWidth;
    const scaleYToSvg = SVG_VIEWBOX_HEIGHT / currentCanvasHeight;

    const numLogicalColsToProcess = logicalGridCols;
    const numLogicalRowsToProcess = logicalGridRows;
    const ROWS_PER_CHUNK = 50; // Increased chunk size

    let rowsProcessed = 0;

    function drawChunk(startRow: number) {
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const endRow = Math.min(startRow + ROWS_PER_CHUNK, numLogicalRowsToProcess);
          for (let r = startRow; r < endRow; r++) {
            for (let c = 0; c < numLogicalColsToProcess; c++) {
              const pixelCanvasX = c * RENDERED_PIXEL_SIZE_CONFIG;
              const pixelCanvasY = r * RENDERED_PIXEL_SIZE_CONFIG;

              const pixelCenterXCanvas = pixelCanvasX + RENDERED_PIXEL_SIZE_CONFIG / 2;
              const pixelCenterYCanvas = pixelCanvasY + RENDERED_PIXEL_SIZE_CONFIG / 2;
              
              const svgCoordX = pixelCenterXCanvas * scaleXToSvg;
              const svgCoordY = pixelCenterYCanvas * scaleYToSvg;

              if (ctx.isPointInPath(mapPath2D, svgCoordX, svgCoordY)) {
                ctx.fillRect(
                  pixelCanvasX,
                  pixelCanvasY,
                  RENDERED_PIXEL_SIZE_CONFIG,
                  RENDERED_PIXEL_SIZE_CONFIG
                );
                if (RENDERED_PIXEL_SIZE_CONFIG > 1) { // Stroke only for larger "pixels"
                  ctx.strokeRect(
                    pixelCanvasX,
                    pixelCanvasY,
                    RENDERED_PIXEL_SIZE_CONFIG,
                    RENDERED_PIXEL_SIZE_CONFIG
                  );
                }
              }
            }
          }
          rowsProcessed += (endRow - startRow);
          setDrawingProgress(Math.min(100, (rowsProcessed / numLogicalRowsToProcess) * 100));
          resolve();
        });
      });
    }

    for (let r = 0; r < numLogicalRowsToProcess; r += ROWS_PER_CHUNK) {
      await drawChunk(r);
    }

    setInitialDrawingComplete(true);
    setDrawingProgress(100);
    console.log(`Initial drawing complete. Canvas buffer: ${currentCanvasWidth}x${currentCanvasHeight}. Logical grid: ${numLogicalColsToProcess}x${numLogicalRowsToProcess}. Total logical pixels: ${totalLogicalPixels.toLocaleString()}`);

  }, [mapPath2D, logicalGridCols, logicalGridRows, totalLogicalPixels]);


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
    if (mapPath2D && canvasRef.current && containerRef.current) {
      requestAnimationFrame(() => {
        handleResetView(); 
        drawPixelsOnCanvas(canvasDrawWidth, canvasDrawHeight); 
      });
    }
  }, [mapPath2D, canvasDrawWidth, canvasDrawHeight, drawPixelsOnCanvas, handleResetView]);


 useEffect(() => {
    let animationFrameId: number | undefined;
    let timeoutId: NodeJS.Timeout | undefined;

    if (isGeneratingDesc) {
        setAiModalProgressValue(0); 
        let currentProgress = 0;
        const animate = () => {
            currentProgress += 2; 
            if (currentProgress <= 75) {
                setAiModalProgressValue(currentProgress);
                animationFrameId = requestAnimationFrame(animate);
            } else if (currentProgress < 90) { 
                setAiModalProgressValue(75 + Math.floor(Math.random() * 15)); 
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        animationFrameId = requestAnimationFrame(animate);
    } else {
        if (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription) {
            setAiModalProgressValue(90 + Math.floor(Math.random() * 9));
             timeoutId = setTimeout(() => {
                if (!pixelDescription) setShowAiModal(false); 
                setAiModalProgressValue(0); 
            }, 500);

        } else if (pixelDescription || aiModalProgressValue === 100) { 
             setAiModalProgressValue(100); 
             timeoutId = setTimeout(() => {
                setShowAiModal(false); 
                setAiModalProgressValue(0);
            }, 1000); 
        }
    }
    return () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };
}, [isGeneratingDesc, initialAiProgressTrigger, pixelDescription]);


  const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom * 1.2, 10));
  const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.05));


 const handleMouseDown = (e: React.MouseEvent) => {
    const targetElement = e.target as HTMLElement;
    if (
      targetElement.closest('button, input, [role="slider"], [data-dialog-content], [role="dialog"]')
    ) {
      return;
    }
    if (targetElement !== canvasRef.current && containerRef.current?.contains(targetElement)) {
      const transformedDiv = canvasRef.current?.parentElement;
      if (targetElement === containerRef.current || targetElement === transformedDiv) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    }
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
    if (!canvasRef.current || !mapPath2D || !initialDrawingComplete) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); 

    const clickXInCanvasElement = event.clientX - rect.left;
    const clickYInCanvasElement = event.clientY - rect.top;

    const scaleXFromElementToBuffer = canvas.width / rect.width;
    const scaleYFromElementToBuffer = canvas.height / rect.height;

    const canvasBufferX = clickXInCanvasElement * scaleXFromElementToBuffer;
    const canvasBufferY = clickYInCanvasElement * scaleYFromElementToBuffer;

    const logicalCol = Math.floor(canvasBufferX / RENDERED_PIXEL_SIZE_CONFIG);
    const logicalRow = Math.floor(canvasBufferY / RENDERED_PIXEL_SIZE_CONFIG);

    if (logicalCol >= 0 && logicalCol < logicalGridCols && logicalRow >= 0 && logicalRow < logicalGridRows) {
      const pixelCenterXCanvasBuffer = (logicalCol + 0.5) * RENDERED_PIXEL_SIZE_CONFIG;
      const pixelCenterYCanvasBuffer = (logicalRow + 0.5) * RENDERED_PIXEL_SIZE_CONFIG;

      const scaleXToSvg = SVG_VIEWBOX_WIDTH / canvas.width; 
      const scaleYToSvg = SVG_VIEWBOX_HEIGHT / canvas.height; 
      const svgCoordX = pixelCenterXCanvasBuffer * scaleXToSvg;
      const svgCoordY = pixelCenterYCanvasBuffer * scaleYToSvg;
      
      const ctx = canvas.getContext('2d');
      if (ctx && ctx.isPointInPath(mapPath2D, svgCoordX, svgCoordY)) {
        setSelectedPixel({ x: logicalCol, y: logicalRow });
        setShowAiModal(true);
        setPixelDescription(null); 
        setInitialAiProgressTrigger(prev => prev + 1); 
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
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-card/80 p-2 rounded-md shadow-lg backdrop-blur-sm pointer-events-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zoom In">
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Aumentar Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zoom Out">
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Diminuir Zoom</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button pointerEvents="auto" variant="outline" size="icon" onClick={handleResetView} aria-label="Reset View">
                <Expand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Resetar Vista</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Slider
          pointerEvents="auto"
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
          <p>Pixels: {(totalLogicalPixels / 1000000).toFixed(2)}M (Pop. PT aprox.)</p>
        </div>
      </div>

      <Dialog open={showAiModal} onOpenChange={(isOpen) => {
          setShowAiModal(isOpen);
          if (!isOpen) { 
              setPixelDescription(null); 
              setIsGeneratingDesc(false); 
              setAiModalProgressValue(0); 
          }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-card" data-dialog-content pointerEvents="auto">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Interagir com Pixel ({selectedPixel?.x}, {selectedPixel?.y})
            </DialogTitle>
            <DialogDescription>
              O que gostaria de fazer com este pixel?
            </DialogDescription>
          </DialogHeader>
          {(isGeneratingDesc || (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription)) && (
            <div className="flex flex-col items-center justify-center my-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse mb-2" />
              <p className="text-sm font-headline">A IA está a gerar a descrição...</p>
              <Progress value={aiModalProgressValue} className="w-full mt-2" />
            </div>
          )}
          {pixelDescription && (aiModalProgressValue === 0 || aiModalProgressValue === 100) && ( 
            <div className="my-4 p-3 bg-background/50 rounded-md">
                <p className="text-sm font-semibold mb-1 text-primary">Descrição da IA:</p>
                <p className="text-sm text-foreground">{pixelDescription}</p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button pointerEvents="auto" variant="outline" onClick={handleGenerateDescription} disabled={isGeneratingDesc || !selectedPixel}>
              {isGeneratingDesc ? "A gerar..." : (pixelDescription ? "Gerar Nova Descrição" : "Gerar Descrição com IA")}
            </Button>
            <Button pointerEvents="auto" disabled={!selectedPixel}>Comprar Pixel (Em Breve)</Button>
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
            className="absolute top-0 left-0 w-full h-full z-10"
          />
        </div>

        {(!initialDrawingComplete && mapPath2D && drawingProgress < 100) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
            <Sparkles className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-lg font-headline text-foreground mb-2">A preparar o universo pixel...</p>
            <Progress value={drawingProgress} className="w-1/2 max-w-md" />
            <p className="text-sm text-muted-foreground mt-1">{Math.round(drawingProgress)}%</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-20" pointerEvents="auto">
        <Dialog>
          <DialogTrigger asChild>
             <Button pointerEvents="auto" size="icon" className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <MousePointer2 className="h-7 w-7" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card" data-dialog-content pointerEvents="auto">
            <DialogHeader>
              <DialogTitle className="font-headline">Ações Rápidas</DialogTitle>
              <DialogDescription>
                Selecione uma ação para interagir com o universo pixel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button pointerEvents="auto" variant="outline"><Search className="mr-2 h-4 w-4" />Explorar Pixel</Button>
              <Button pointerEvents="auto" variant="outline"><Palette className="mr-2 h-4 w-4" />Paleta de Cores</Button>
              <Button pointerEvents="auto" variant="outline"><Sparkles className="mr-2 h-4 w-4" />Eventos Especiais</Button>
            </div>
            <DialogFooter>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
