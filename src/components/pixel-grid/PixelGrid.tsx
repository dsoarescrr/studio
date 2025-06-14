
// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Expand, Search, Sparkles, MousePointer2, Palette, Info, User, CalendarDays, History as HistoryIcon, DollarSign, ShoppingCart, Edit3, Paintbrush, FileText, Upload, Save, Image as ImageIcon, XCircle, Type as TypeIcon, Tags as TagsIcon, Link as LinkIcon, Pencil, Eraser, PaintBucket, Trash2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionElement } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


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

type WorkerProgressMessage = { type: 'progress'; progress: number };
type WorkerDoneMessage = { type: 'done'; bitmap: ArrayBuffer };
type WorkerErrorMessage = { type: 'error'; error: string };
type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;

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

const MOCK_CURRENT_USER_ID = 'currentUserPixelMaster';

interface SelectedPixelDetails {
  x: number;
  y: number;
  owner?: string;
  price?: number; 
  acquisitionDate?: string;
  lastModifiedDate?: string;
  color?: string;
  history?: Array<{ owner: string; date: string; price?: number }>;
  isOwnedByCurrentUser?: boolean;
  isForSaleBySystem?: boolean; 
  manualDescription?: string;
  pixelImageUrl?: string;
  title?: string;
  tags?: string[];
  linkUrl?: string;
  isForSaleByOwner?: boolean; 
  salePrice?: number; 
}

export default function PixelGrid() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [selectedPixelCoordsForDisplay, setSelectedPixelCoordsForDisplay] = useState<{ x: number; y: number } | null>(null);
  const [selectedPixelDetails, setSelectedPixelDetails] = useState<SelectedPixelDetails | null>(null);

  const [pixelDescription, setPixelDescription] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [showPixelModal, setShowPixelModal] = useState(false);
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

  const [editMode, setEditMode] = useState(false);
  const [editableColor, setEditableColor] = useState('#FFFFFF');
  const [editableManualDescription, setEditableManualDescription] = useState('');
  const [editablePixelImageFile, setEditablePixelImageFile] = useState<File | null>(null);
  const [editablePixelImagePreview, setEditablePixelImagePreview] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableTags, setEditableTags] = useState('');
  const [editableLinkUrl, setEditableLinkUrl] = useState('');
  const [editableIsForSaleByOwner, setEditableIsForSaleByOwner] = useState(false);
  const [editableSalePrice, setEditableSalePrice] = useState<number | string>('');


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

    if (isGeneratingDesc && showPixelModal && !editMode) {
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
        if (!isGeneratingDesc && showPixelModal && !editMode) {
             if (pixelDescription) {
                setAiModalProgressValue(100); 
                timeoutId = setTimeout(() => {
                    setAiModalProgressValue(0); 
                }, 1000); 
             }
        } else if (!showPixelModal || editMode) {
            setAiModalProgressValue(0);
        }
    }
    return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isGeneratingDesc, showPixelModal, pixelDescription, initialAiProgressTrigger, editMode]); 

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
      targetElement.closest('button, input, [role="slider"], [data-dialog-content], [role="dialog"], label') 
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
        setSelectedPixelCoordsForDisplay({ x: logicalCol, y: logicalRow });

        const MOCK_OWNERS = ['User123', 'ArtistaPT', 'PixelFan', 'MatrixLord', MOCK_CURRENT_USER_ID, null, null];
        const randomOwnerIndex = Math.floor(Math.random() * MOCK_OWNERS.length);
        const randomOwner = MOCK_OWNERS[randomOwnerIndex];
        const isOwned = randomOwner !== null;
        const isOwnedByMe = isOwned && randomOwner === MOCK_CURRENT_USER_ID;
        const isForSaleSystem = !isOwned;
        const defaultColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const mockIsForSaleByOwner = isOwnedByMe && Math.random() > 0.3;

        const mockDetails: SelectedPixelDetails = {
          x: logicalCol,
          y: logicalRow,
          owner: isOwned ? randomOwner : 'Disponível (Sistema)',
          price: isForSaleSystem ? Math.floor(Math.random() * 50) + 10 : undefined,
          acquisitionDate: isOwned ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT') : undefined,
          lastModifiedDate: isOwned ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString('pt-PT') : undefined,
          color: defaultColor,
          history: isOwned ? [
            { owner: randomOwner as string, date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT'), price: Math.floor(Math.random() * 40) + 5 },
            { owner: 'DonoAnterior', date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60).toLocaleDateString('pt-PT'), price: Math.floor(Math.random() * 30) + 5 }
          ] : [],
          isOwnedByCurrentUser: isOwnedByMe,
          isForSaleBySystem: isForSaleSystem,
          manualDescription: isOwnedByMe ? 'Este é uma descrição de exemplo do meu pixel.' : '',
          pixelImageUrl: isOwnedByMe && Math.random() > 0.5 ? 'https://placehold.co/150x150.png' : undefined,
          title: isOwnedByMe ? `Pixel de ${randomOwner}` : undefined,
          tags: isOwnedByMe ? ['arte', 'exemplo'] : [],
          linkUrl: isOwnedByMe && Math.random() > 0.2 ? 'https://example.com' : undefined,
          isForSaleByOwner: mockIsForSaleByOwner,
          salePrice: mockIsForSaleByOwner ? Math.floor(Math.random() * 100) + 20 : undefined,
        };
        setSelectedPixelDetails(mockDetails);
        
        setEditableColor(mockDetails.color || '#FFFFFF');
        setEditableManualDescription(mockDetails.manualDescription || '');
        setEditablePixelImagePreview(mockDetails.pixelImageUrl || null);
        setEditablePixelImageFile(null);
        setEditableTitle(mockDetails.title || '');
        setEditableTags(mockDetails.tags ? mockDetails.tags.join(', ') : '');
        setEditableLinkUrl(mockDetails.linkUrl || '');
        setEditableIsForSaleByOwner(mockDetails.isForSaleByOwner || false);
        setEditableSalePrice(mockDetails.salePrice || '');


        setShowPixelModal(true);
        setPixelDescription(null); 
        setEditMode(false); 
        setInitialAiProgressTrigger(prev => prev + 1);
      } else {
        setSelectedPixelCoordsForDisplay(null);
        setSelectedPixelDetails(null);
      }
    } else {
      setSelectedPixelCoordsForDisplay(null);
      setSelectedPixelDetails(null);
    }
  };

  const handleGenerateDescription = useCallback(async () => {
    if (!selectedPixelDetails) return;
    setIsGeneratingDesc(true);
    setPixelDescription(null);
    
    try {
        const input: GeneratePixelDescriptionInput = {
            x: selectedPixelDetails.x,
            y: selectedPixelDetails.y,
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
  }, [selectedPixelDetails, toast]);

  const handlePixelImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setEditablePixelImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditablePixelImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedPixelDetails) return;
    
    const updatedTags = editableTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const salePriceNum = parseFloat(String(editableSalePrice));

    setSelectedPixelDetails(prev => prev ? ({
      ...prev,
      color: editableColor,
      manualDescription: editableManualDescription,
      pixelImageUrl: editablePixelImagePreview || prev.pixelImageUrl,
      title: editableTitle,
      tags: updatedTags,
      linkUrl: editableLinkUrl,
      isForSaleByOwner: editableIsForSaleByOwner,
      salePrice: editableIsForSaleByOwner && !isNaN(salePriceNum) ? salePriceNum : undefined,
    }) : null);

    toast({ title: "Alterações Guardadas", description: "As alterações ao seu pixel foram (simuladamente) guardadas." });
    setEditMode(false);
  };

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
          {selectedPixelCoordsForDisplay && <p>Pixel Lógico: ({selectedPixelCoordsForDisplay.x}, {selectedPixelCoordsForDisplay.y})</p>}
          <p>Pixels: {(totalLogicalPixels / 1000000).toFixed(2)}M (Pop. PT aprox.)</p>
        </div>
      </div>

      <Dialog open={showPixelModal} onOpenChange={(isOpen) => {
          setShowPixelModal(isOpen);
          if (!isOpen) { 
              setSelectedPixelDetails(null);
              setPixelDescription(null); 
              setIsGeneratingDesc(false); 
              setAiModalProgressValue(0);
              setEditMode(false); 
          }
      }}>
        <DialogContent className="sm:max-w-md bg-card text-card-foreground" data-dialog-content pointerEvents="auto">
          {!editMode && selectedPixelDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center text-xl">
                    Pixel ({selectedPixelDetails.x}, {selectedPixelDetails.y})
                    {selectedPixelDetails.title && <span className="text-base text-muted-foreground ml-2"> - &quot;{selectedPixelDetails.title}&quot;</span>}
                </DialogTitle>
                <CardDescriptionElement>
                  Informações detalhadas e ações disponíveis para este pixel.
                </CardDescriptionElement>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(100vh-250px)] pr-3">
              <div className="space-y-3 py-2">
                <Card className="bg-background/50">
                  <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                          <Info className="h-4 w-4 mr-2" /> Informações do Pixel
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1.5 px-4 pb-3">
                    <div className="flex justify-between"><span>Proprietário:</span> <Badge variant={selectedPixelDetails.owner === 'Disponível (Sistema)' ? "secondary" : "outline"} className="font-code">{selectedPixelDetails.owner}</Badge></div>
                    
                    {selectedPixelDetails.isForSaleBySystem && selectedPixelDetails.price && (
                      <div className="flex justify-between items-center"><span>Preço (Sistema):</span> <span className="font-code flex items-center">{selectedPixelDetails.price} Créditos <DollarSign className="inline h-3.5 w-3.5 ml-1" /></span></div>
                    )}
                     {selectedPixelDetails.isOwnedByCurrentUser && selectedPixelDetails.isForSaleByOwner && selectedPixelDetails.salePrice && (
                      <div className="flex justify-between items-center"><span>À Venda por:</span> <Badge variant="destructive" className="font-code">{selectedPixelDetails.salePrice} Créditos</Badge></div>
                    )}

                    {selectedPixelDetails.acquisitionDate && <div className="flex justify-between"><span>Adquirido em:</span> <span className="font-code">{selectedPixelDetails.acquisitionDate}</span></div>}
                    {selectedPixelDetails.lastModifiedDate && <div className="flex justify-between"><span>Modificado em:</span> <span className="font-code">{selectedPixelDetails.lastModifiedDate}</span></div>}
                    <div className="flex justify-between items-center">
                      <span>Cor Atual:</span>
                      <div className="flex items-center">
                        <div style={{ backgroundColor: selectedPixelDetails.color }} className="w-4 h-4 rounded-sm mr-1.5 border border-border"></div>
                        <span className="font-code">{selectedPixelDetails.color}</span>
                      </div>
                    </div>
                    {selectedPixelDetails.manualDescription && (
                       <div className="pt-1">
                          <span className="font-semibold">Descrição:</span>
                          <p className="text-xs text-muted-foreground italic">&quot;{selectedPixelDetails.manualDescription}&quot;</p>
                       </div>
                    )}
                    {selectedPixelDetails.tags && selectedPixelDetails.tags.length > 0 && (
                        <div className="pt-1">
                            <span className="font-semibold">Tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedPixelDetails.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs font-code">{tag}</Badge>)}
                            </div>
                        </div>
                    )}
                    {selectedPixelDetails.linkUrl && (
                        <div className="pt-1">
                            <span className="font-semibold">Link:</span>
                            <a href={selectedPixelDetails.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline ml-1 flex items-center font-code">
                                {selectedPixelDetails.linkUrl.length > 30 ? `${selectedPixelDetails.linkUrl.substring(0,30)}...` : selectedPixelDetails.linkUrl}
                                <LinkIcon className="h-3 w-3 ml-1" />
                            </a>
                        </div>
                    )}
                    {selectedPixelDetails.pixelImageUrl && (
                      <div className="pt-1">
                        <span className="font-semibold">Imagem do Pixel:</span>
                        <div className="mt-1 relative w-24 h-24 rounded border border-border overflow-hidden">
                          <Image src={selectedPixelDetails.pixelImageUrl} alt="Imagem do Pixel" layout="fill" objectFit="cover" data-ai-hint="pixel custom image"/>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(isGeneratingDesc || pixelDescription || (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription && showPixelModal)) && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                          <Sparkles className="h-4 w-4 mr-2" /> Descrição por IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      {(isGeneratingDesc || (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription && showPixelModal)) && (
                        <div className="flex flex-col items-center justify-center my-2">
                          <Sparkles className="h-6 w-6 text-primary animate-pulse mb-1" />
                          <p className="text-xs font-headline">A IA está a gerar a descrição...</p>
                          <Progress value={aiModalProgressValue} className="w-full mt-1 h-1.5" />
                        </div>
                      )}
                      {pixelDescription && (aiModalProgressValue === 0 || aiModalProgressValue === 100) && showPixelModal && (
                        <p className="text-xs text-foreground italic">&quot;{pixelDescription}&quot;</p>
                      )}
                      {!pixelDescription && !isGeneratingDesc && (aiModalProgressValue === 0 || aiModalProgressValue === 100) && showPixelModal && (
                         <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={!selectedPixelDetails} className="w-full mt-2">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5"/>
                            Gerar Descrição com IA
                         </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedPixelDetails.history && selectedPixelDetails.history.length > 0 && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                          <HistoryIcon className="h-4 w-4 mr-2" /> Histórico de Proprietários
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <ScrollArea className="h-20">
                        <ul className="text-xs space-y-1 font-code">
                          {selectedPixelDetails.history.map((entry, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{entry.owner} ({entry.date})</span>
                              <span>{entry.price ? `${entry.price}c` : ''}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
              </ScrollArea>
              <DialogFooter className="gap-2 sm:gap-1.5 flex-wrap justify-center pt-3 sm:justify-end">
                {selectedPixelDetails.isForSaleBySystem && !selectedPixelDetails.isOwnedByCurrentUser && (
                  <Button size="sm" disabled={!selectedPixelDetails.price} className="bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Comprar ({selectedPixelDetails.price} Créditos)
                  </Button>
                )}
                 {selectedPixelDetails.isOwnedByCurrentUser && selectedPixelDetails.isForSaleByOwner && selectedPixelDetails.salePrice && (
                  <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                     À Venda por {selectedPixelDetails.salePrice} Créditos
                  </Button>
                )}
                {selectedPixelDetails.isOwnedByCurrentUser && (
                  <Button size="sm" onClick={() => setEditMode(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editar Pixel
                  </Button>
                )}
                {!selectedPixelDetails.isForSaleBySystem && !selectedPixelDetails.isOwnedByCurrentUser && selectedPixelDetails.owner !== 'Disponível (Sistema)' && !selectedPixelDetails.isForSaleByOwner && (
                     <Button variant="secondary" size="sm" disabled={!selectedPixelDetails}>Fazer Oferta</Button>
                )}
              </DialogFooter>
            </>
          )}
          {editMode && selectedPixelDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center text-xl">
                    <Edit3 className="h-5 w-5 mr-2 text-accent" /> Editando Pixel ({selectedPixelDetails.x}, {selectedPixelDetails.y})
                </DialogTitle>
                <CardDescriptionElement>
                  Modifique as propriedades do seu pixel.
                </CardDescriptionElement>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(100vh-250px)] pr-3">
                <div className="space-y-4 py-2">
                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <Paintbrush className="h-4 w-4 mr-2" /> Nova Cor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 flex items-center gap-2">
                      <Input
                        id="pixelColorEdit"
                        type="color"
                        value={editableColor}
                        onChange={(e) => setEditableColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        placeholder="#RRGGBB"
                        value={editableColor}
                        onChange={(e) => setEditableColor(e.target.value)}
                        className="font-code flex-1 h-10"
                        aria-label="Código Hex da Cor"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <TypeIcon className="h-4 w-4 mr-2" /> Título do Pixel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <Input
                        type="text"
                        placeholder="Ex: Meu Pôr do Sol Pixelizado"
                        value={editableTitle}
                        onChange={(e) => setEditableTitle(e.target.value)}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <FileText className="h-4 w-4 mr-2" /> Descrição Manual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <Textarea
                        placeholder="Descreva o seu pixel..."
                        value={editableManualDescription}
                        onChange={(e) => setEditableManualDescription(e.target.value)}
                        rows={3}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <TagsIcon className="h-4 w-4 mr-2" /> Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <Input
                        type="text"
                        placeholder="Ex: paisagem, lisboa, arte"
                        value={editableTags}
                        onChange={(e) => setEditableTags(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separadas por vírgula.</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <LinkIcon className="h-4 w-4 mr-2" /> Link Associado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <Input
                        type="url"
                        placeholder="https://exemplo.com"
                        value={editableLinkUrl}
                        onChange={(e) => setEditableLinkUrl(e.target.value)}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <ImageIcon className="h-4 w-4 mr-2" /> Imagem do Pixel (Upload)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePixelImageUpload}
                        className="text-xs"
                      />
                      {editablePixelImagePreview && (
                        <div className="mt-2 relative w-24 h-24 rounded border border-border overflow-hidden group">
                          <Image src={editablePixelImagePreview} alt="Pré-visualização da Imagem" layout="fill" objectFit="cover" data-ai-hint="pixel image preview"/>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setEditablePixelImageFile(null);
                              setEditablePixelImagePreview(null);
                              if (canvasRef.current) { 
                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                       <p className="text-xs text-muted-foreground">Envie uma imagem para associar a este pixel (simulado).</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50">
                     <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-md font-headline flex items-center text-primary">
                           <Paintbrush className="h-4 w-4 mr-2" /> Desenhar Imagem (Experimental)
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="px-4 pb-3 space-y-2">
                        <div className="w-full h-40 bg-muted/30 border border-dashed border-border rounded-md flex items-center justify-center">
                           <p className="text-xs text-muted-foreground">Área de desenho (em breve)</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                           <TooltipProvider>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled><Pencil className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Lápis (Em breve)</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled><Eraser className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Borracha (Em breve)</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled><PaintBucket className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Preencher (Em breve)</p></TooltipContent>
                              </Tooltip>
                               <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled><Trash2 className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Limpar (Em breve)</p></TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Esta funcionalidade de desenho é experimental e será implementada futuramente.</p>
                     </CardContent>
                  </Card>


                  <Card className="bg-background/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-md font-headline flex items-center text-primary">
                        <DollarSign className="h-4 w-4 mr-2" /> Vender Pixel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="for-sale-switch"
                          checked={editableIsForSaleByOwner}
                          onCheckedChange={setEditableIsForSaleByOwner}
                        />
                        <Label htmlFor="for-sale-switch" className="text-sm">Colocar à venda</Label>
                      </div>
                      {editableIsForSaleByOwner && (
                        <div>
                          <Label htmlFor="sale-price" className="text-xs text-muted-foreground">Preço de Venda (Créditos)</Label>
                          <Input
                            id="sale-price"
                            type="number"
                            placeholder="Ex: 100"
                            value={editableSalePrice}
                            onChange={(e) => setEditableSalePrice(e.target.value)}
                            className="mt-1"
                            min="0"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
              <DialogFooter className="gap-2 pt-3">
                 <Button variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
                 <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Guardar Alterações
                  </Button>
              </DialogFooter>
            </>
          )}
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
              <CardDescriptionElement>
                Selecione uma ação para interagir com o universo pixel.
              </CardDescriptionElement>
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

