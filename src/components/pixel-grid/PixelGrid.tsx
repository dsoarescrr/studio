
// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand, Search, Sparkles, MousePointer2, Palette } from 'lucide-react';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
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

const LOGICAL_GRID_COLS_CONFIG = 2250;
const RENDERED_PIXEL_SIZE_CONFIG = 0.6;

const canvasDrawWidth = LOGICAL_GRID_COLS_CONFIG * RENDERED_PIXEL_SIZE_CONFIG; // 1350
const canvasDrawHeight = Math.floor(canvasDrawWidth * (SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH)); // 2772 (aprox)

const logicalGridRows = Math.floor(canvasDrawHeight / RENDERED_PIXEL_SIZE_CONFIG); // 4620 (aprox)
const totalLogicalPixels = LOGICAL_GRID_COLS_CONFIG * logicalGridRows; // ~10,395,000

const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const ROWS_PER_DRAW_CHUNK = 100;

// Define types for worker messages
type WorkerProgressMessage = { type: 'progress'; progress: number };
type WorkerDoneMessage = { type: 'done'; bitmap: ArrayBuffer };
type WorkerErrorMessage = { type: 'error'; error: string };
type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;

// Define type for data sent to worker
interface WorkerInput {
  pathStrings: string[];
  canvasWidth: number;
  canvasHeight: number;
  svgViewBoxWidth: number;
  svgViewBoxHeight: number;
  logicalCols: number;
  logicalRows: number;
  pixelSize: number;
}


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
  const { toast } = useToast();

  const [mapData, setMapData] = useState<MapData | null>(null);
  const [pixelBitmap, setPixelBitmap] = useState<Uint8Array | null>(null);
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'processing-worker' | 'drawing-canvas' | 'done' | 'error'>('idle');
  const [overallProgress, setOverallProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("A carregar dados do mapa...");
  const [workerErrorMessage, setWorkerErrorMessage] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  const handleMapDataLoaded = useCallback((data: MapData) => {
    if (data && data.pathStrings && data.pathStrings.length > 0 && data.path2D) {
      setMapData(data);
      setProgressMessage("Mapa carregado. A preparar grelha de pixels...");
      setWorkerStatus('idle'); 
      setWorkerErrorMessage(null);
    } else {
      setWorkerStatus('error');
      const errorMsg = "Erro: Dados do mapa (pathStrings ou path2D) estão vazios ou inválidos.";
      setWorkerErrorMessage(errorMsg);
      setProgressMessage(errorMsg);
      toast({ title: "Erro ao Carregar Mapa", description: errorMsg, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    if (mapData && !workerRef.current) {
      setProgressMessage("A iniciar worker...");
      setOverallProgress(0);
      setWorkerErrorMessage(null);
      let workerInstance: Worker | null = null;
      try {
        workerInstance = new Worker(new URL('../../workers/pixel-map-worker.ts', import.meta.url));
        workerRef.current = workerInstance;
        
        workerRef.current.postMessage({
          pathStrings: mapData.pathStrings,
          canvasWidth: canvasDrawWidth,
          canvasHeight: canvasDrawHeight,
          svgViewBoxWidth: SVG_VIEWBOX_WIDTH,
          svgViewBoxHeight: SVG_VIEWBOX_HEIGHT,
          logicalCols: LOGICAL_GRID_COLS_CONFIG,
          logicalRows: logicalGridRows,
          pixelSize: RENDERED_PIXEL_SIZE_CONFIG,
        } as WorkerInput);
        
        setWorkerStatus('processing-worker'); 

        workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
          if (!event.data || typeof event.data.type === 'undefined') {
            console.error('Received invalid message from worker:', event.data);
            setWorkerStatus('error');
            setWorkerErrorMessage('Comunicação inválida do worker.');
            setOverallProgress(0);
            return;
          }
          
          const { type } = event.data;
          
          if (type === 'progress') {
            const workerProgress = Math.max(0, Math.min(100, Number((event.data as WorkerProgressMessage).progress) || 0));
            setOverallProgress(workerProgress * 0.5); 
            setProgressMessage(`A gerar mapa de pixels... ${(workerProgress * 0.5).toFixed(1)}%`);
          } else if (type === 'done') {
            setPixelBitmap(new Uint8Array((event.data as WorkerDoneMessage).bitmap));
            setWorkerStatus('drawing-canvas'); 
            setProgressMessage("Mapa de pixels gerado. A desenhar no canvas...");
            setOverallProgress(50); 
          } else if (type === 'error') {
            const errorMessage = (event.data as WorkerErrorMessage).error || 'Erro desconhecido no worker.';
            setWorkerStatus('error');
            setWorkerErrorMessage(errorMessage);
            setProgressMessage(`Erro do Worker: ${errorMessage}`);
            setOverallProgress(0); 
          }
        };
        
        workerRef.current.onerror = (err: ErrorEvent) => {
          const errorMessage = `WORKER SCRIPT ERROR: ${err.message || "Ocorreu um erro crítico e inesperado no worker."}`;
          setWorkerStatus('error');
          setWorkerErrorMessage(errorMessage);
          setProgressMessage(errorMessage);
          setOverallProgress(0);
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
        };
      } catch (e: any) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setWorkerStatus('error');
        setWorkerErrorMessage(`Falha ao criar Worker: ${errorMsg}`);
        setProgressMessage(`Falha ao criar Worker: ${errorMsg}`);
        setOverallProgress(0);
        if (workerRef.current) { 
            workerRef.current.terminate();
            workerRef.current = null;
        }
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [mapData]);


  const drawPixelsOnCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !pixelBitmap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setProgressMessage(`A desenhar pixels no canvas... ${overallProgress.toFixed(1)}%`);
    canvas.width = canvasDrawWidth;
    canvas.height = canvasDrawHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
    
    if (RENDERED_PIXEL_SIZE_CONFIG > 1) { 
        ctx.strokeStyle = 'rgba(30, 30, 30, 0.75)';
        ctx.lineWidth = 0.2;
    }

    let rowsDrawn = 0;

    function drawChunk(startRow: number) {
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          const endRow = Math.min(startRow + ROWS_PER_DRAW_CHUNK, logicalGridRows);
          for (let r = startRow; r < endRow; r++) {
            for (let c = 0; c < LOGICAL_GRID_COLS_CONFIG; c++) {
              if (pixelBitmap[r * LOGICAL_GRID_COLS_CONFIG + c] === 1) {
                const x = c * RENDERED_PIXEL_SIZE_CONFIG;
                const y = r * RENDERED_PIXEL_SIZE_CONFIG;
                ctx.fillRect(x, y, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
                if (RENDERED_PIXEL_SIZE_CONFIG > 1) {
                  ctx.strokeRect(x, y, RENDERED_PIXEL_SIZE_CONFIG, RENDERED_PIXEL_SIZE_CONFIG);
                }
              }
            }
          }
          rowsDrawn += (endRow - startRow);
          const drawingProgress = (rowsDrawn / logicalGridRows) * 50; 
          setOverallProgress(50 + drawingProgress); 
          setProgressMessage(`A desenhar pixels no canvas... ${(50 + drawingProgress).toFixed(1)}%`);
          resolve();
        });
      });
    }

    for (let r = 0; r < logicalGridRows; r += ROWS_PER_DRAW_CHUNK) {
      await drawChunk(r);
    }
    
    setProgressMessage("Universo pixel pronto!");
    setOverallProgress(100); 
    setWorkerStatus('done');
  }, [pixelBitmap, overallProgress]);


  const handleResetView = useCallback(() => {
    const currentZoom = 1;
    setZoom(currentZoom);
     if (containerRef.current && canvasRef.current) {
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        const canvasContentWidth = canvasDrawWidth * currentZoom; 
        const canvasContentHeight = canvasDrawHeight * currentZoom;
        setPosition({
            x: (containerWidth - canvasContentWidth) / 2,
            y: (containerHeight - canvasContentHeight) / 2
        });
    }
  }, []);

  useEffect(() => {
    if (mapData?.path2D && canvasRef.current && containerRef.current) {
        requestAnimationFrame(() => {
            handleResetView();
        });
    }
  }, [mapData, handleResetView]);

  useEffect(() => {
    if (workerStatus === 'drawing-canvas' && pixelBitmap) {
      drawPixelsOnCanvas();
    }
  }, [workerStatus, pixelBitmap, drawPixelsOnCanvas]);


 useEffect(() => {
    let animationFrameId: number | undefined;
    let timeoutId: NodeJS.Timeout | undefined;

    if (isGeneratingDesc && showAiModal) {
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
        if (!isGeneratingDesc && showAiModal) {
             if (pixelDescription) {
                setAiModalProgressValue(100); 
                timeoutId = setTimeout(() => {
                    if (showAiModal) setShowAiModal(false);
                    setAiModalProgressValue(0); 
                }, 1000); 
             }
        } else if (!showAiModal) {
            setAiModalProgressValue(0);
        }
    }
    return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isGeneratingDesc, showAiModal, pixelDescription, initialAiProgressTrigger]); 

  useEffect(() => {
    if (workerStatus === 'error') {
      // Message is already set by the error handlers
    } else if (workerStatus === 'processing-worker' && overallProgress < 50) {
      setProgressMessage(`A gerar mapa de pixels... ${overallProgress.toFixed(1)}%`);
    } else if (workerStatus === 'drawing-canvas' && overallProgress < 100) {
      setProgressMessage(`A desenhar pixels no canvas... ${overallProgress.toFixed(1)}%`);
    } else if (workerStatus === 'done' && overallProgress >= 99.9) {
      setProgressMessage("Universo pixel pronto!");
    } else if (workerStatus === 'idle' && !mapData) {
      setProgressMessage("A carregar dados do mapa...");
    } else if (workerStatus === 'idle' && mapData && overallProgress === 0 && !workerErrorMessage) {
        setProgressMessage("A aguardar início do worker...");
    }
  }, [workerStatus, overallProgress, mapData, workerErrorMessage]);


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
    if (!canvasRef.current || !mapData?.path2D || workerStatus !== 'done') return;
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

    if (logicalCol >= 0 && logicalCol < LOGICAL_GRID_COLS_CONFIG && logicalRow >= 0 && logicalRow < logicalGridRows) {
      const pixelCenterXCanvasBuffer = (logicalCol + 0.5) * RENDERED_PIXEL_SIZE_CONFIG;
      const pixelCenterYCanvasBuffer = (logicalRow + 0.5) * RENDERED_PIXEL_SIZE_CONFIG;

      const scaleXToSvg = SVG_VIEWBOX_WIDTH / canvas.width; 
      const scaleYToSvg = SVG_VIEWBOX_HEIGHT / canvas.height;
      const svgCoordX = pixelCenterXCanvasBuffer * scaleXToSvg;
      const svgCoordY = pixelCenterYCanvasBuffer * scaleYToSvg;
      
      const tempCtx = document.createElement('canvas').getContext('2d');
      if (tempCtx && mapData.path2D && tempCtx.isPointInPath(mapData.path2D, svgCoordX, svgCoordY)) {
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

  const progressText = 
    workerStatus === 'error' ? "Erro" : 
    (overallProgress === 0 && workerStatus !== 'processing-worker' && workerStatus !== 'drawing-canvas' && workerStatus !== 'idle' && workerStatus !== 'error') ? "0.0" : 
    (overallProgress >= 99.9 && workerStatus === 'done') ? "100" : 
    overallProgress.toFixed(1);

  const showLoadingOverlay = workerStatus !== 'done' || overallProgress < 100;
  

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
          {(isGeneratingDesc || (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription && showAiModal)) && (
            <div className="flex flex-col items-center justify-center my-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse mb-2" />
              <p className="text-sm font-headline">A IA está a gerar a descrição...</p>
              <Progress value={aiModalProgressValue} className="w-full mt-2" />
            </div>
          )}
          {pixelDescription && (aiModalProgressValue === 0 || aiModalProgressValue === 100) && showAiModal && ( 
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
            onMapDataLoaded={handleMapDataLoaded}
          />
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute top-0 left-0 w-full h-full z-10"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {showLoadingOverlay && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
            {workerStatus !== 'error' && <Sparkles className="h-12 w-12 text-primary animate-pulse mb-4" />}
            {workerStatus === 'error' && <div className="h-12 w-12 text-destructive flex items-center justify-center mb-4"><ZoomOut className="h-10 w-10"/></div>}
            <p className={`text-lg font-headline mb-2 ${workerStatus === 'error' ? 'text-destructive' : 'text-foreground'}`}>{progressMessage}</p>
            {workerStatus !== 'error' && <Progress value={overallProgress} className="w-1/2 max-w-md" />}
            {workerStatus !== 'error' && <p className="text-sm text-muted-foreground mt-1">{progressText}%</p>}
            {workerErrorMessage && workerStatus === 'error' && <p className="text-xs text-destructive mt-1 max-w-md text-center">{workerErrorMessage}</p>}
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
