// src/components/pixel-grid/PixelGrid.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Expand, Search, Sparkles, Info, User, CalendarDays,
  History as HistoryIcon, DollarSign, ShoppingCart, Edit3, Palette as PaletteIcon, FileText, Upload, Save,
  Image as ImageIcon, XCircle, TagsIcon, Link as LinkIconLucide, Pencil,
  Eraser, PaintBucket, Trash2, Heart, Flag, BadgePercent, Star, MapPin as MapPinIconLucide, ScrollText, Gem, Globe, AlertTriangle,
} from 'lucide-react';
import PortugalMapSvg, { type MapData } from './PortugalMapSvg';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generatePixelDescription, type GeneratePixelDescriptionInput } from '@/ai/flows/generate-pixel-description';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionElement,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle as CardTitleElement, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '../ui/separator';
import { mapPixelToApproxGps, cn } from '@/lib/utils';

// Configuration constants
const SVG_VIEWBOX_WIDTH = 12969;
const SVG_VIEWBOX_HEIGHT = 26674;
const LOGICAL_GRID_COLS_CONFIG = 2250; // ~10.4M pixels
const RENDERED_PIXEL_SIZE_CONFIG = 0.6; // ~10.4M pixels

// Derived constants (order is important)
const canvasDrawWidth = LOGICAL_GRID_COLS_CONFIG * RENDERED_PIXEL_SIZE_CONFIG;
const canvasDrawHeight = Math.floor(canvasDrawWidth * (SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH));
const logicalGridRows = Math.floor(canvasDrawHeight / RENDERED_PIXEL_SIZE_CONFIG);
const totalLogicalPixels = LOGICAL_GRID_COLS_CONFIG * logicalGridRows;

const PLACEHOLDER_IMAGE_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const UNSOLD_PIXEL_COLOR = 'hsl(var(--secondary))';
const UNSOLD_PIXEL_STROKE_COLOR = 'hsl(var(--border))';
const USER_BOUGHT_PIXEL_COLOR = 'hsl(var(--primary))';

const MOCK_CURRENT_USER_ID = 'currentUserPixelMaster';

interface SoldPixel {
  x: number; // Logical col
  y: number; // Logical row
  color: string;
  ownerId?: string;
  title?: string;
}

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
  dataAiHint?: string;
  title?: string;
  tags?: string[];
  linkUrl?: string;
  isForSaleByOwner?: boolean;
  salePrice?: number;
  isFavorited?: boolean;
  rarity?: 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Marco Histórico';
  loreSnippet?: string;
  gpsCoords?: { lat: number; lon: number; } | null;
}

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 10;
const ZOOM_SENSITIVITY_FACTOR = 1.1;
const HEADER_HEIGHT_PX = 64;
const BOTTOM_NAV_HEIGHT_PX = 64;

const mockRarities: SelectedPixelDetails['rarity'][] = ['Comum', 'Raro', 'Épico', 'Lendário', 'Marco Histórico'];
const mockLoreSnippets: string[] = [
  "Dizem que este pixel brilha sob a lua cheia.",
  "Um antigo mapa sugere um tesouro escondido perto daqui.",
  "Sente-se uma energia estranha emanando deste local.",
];


export default function PixelGrid() {
  // console.log("PixelGrid: Component rendering START");
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [defaultView, setDefaultView] = useState<{ zoom: number; position: { x: number; y: number } } | null>(null);

  const didDragRef = useRef(false);
  const dragThreshold = 5;

  const [selectedPixelCoordsForDisplay, setSelectedPixelCoordsForDisplay] = useState<{ x: number; y: number } | null>(null);
  const [selectedPixelDetails, setSelectedPixelDetails] = useState<SelectedPixelDetails | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

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
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'processing-map' | 'processing-worker' | 'done' | 'error'>('idle');
  const [overallProgress, setOverallProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Aguardando cliente...");
  const [workerErrorMessage, setWorkerErrorMessage] = useState<string | null>(null);
  
  const [soldPixels, setSoldPixels] = useState<SoldPixel[]>([
      { x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.451), y: Math.floor(logicalGridRows * 0.302), color: 'hsl(var(--accent))', title: 'Pixel especial LIS', ownerId: 'user123' },
      { x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.503), y: Math.floor(logicalGridRows * 0.204), color: 'magenta', title: 'Pixel especial POR', ownerId: MOCK_CURRENT_USER_ID },
      { x: Math.floor(LOGICAL_GRID_COLS_CONFIG * 0.555), y: Math.floor(logicalGridRows * 0.756), color: 'cyan', title: 'Pixel especial FAR', ownerId: 'user456' },
  ]); 

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

  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoResetTimeout = useCallback(() => {
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // console.log("PixelGrid: First useEffect - setting isClient to true. Component has mounted.");
    setIsClient(true);
  }, []);

  const handleMapDataLoaded = useCallback((data: MapData) => {
    // console.log("PixelGrid: handleMapDataLoaded CALLED.", data);
    if (data && data.path2D && data.pathStrings?.length > 0) {
      setMapData(data);
      setWorkerStatus('processing-map'); // Indicate that map contour is loaded, worker will start
      // console.log(`PixelGrid: Map data set. Path strings count: ${data.pathStrings.length} Has Path2D: ${!!data.path2D}`);
    } else {
      toast({ title: "Erro no Mapa", description: "Não foi possível carregar os dados do mapa.", variant: "destructive" });
      setWorkerErrorMessage("Dados do mapa inválidos ou ausentes.");
      setWorkerStatus("error");
    }
  }, [toast]);


  useEffect(() => { 
    // console.log(`PixelGrid: Worker initialization useEffect. Conditions - isClient: ${isClient} , mapData: ${!!mapData} , workerRef.current: ${!!workerRef.current} , workerStatus: ${workerStatus} , workerErrorMessage: ${workerErrorMessage}`);
    
    if (!isClient || !mapData || workerRef.current || workerStatus === 'done' || workerStatus === 'processing-worker' || workerErrorMessage) {
        // if (!isClient) console.log("PixelGrid: Worker init skipped - not client yet.");
        // if (!mapData) console.log("PixelGrid: Worker init skipped - mapData not available yet (or useEffect ran before mapData set).");
        // if (workerRef.current) console.log("PixelGrid: Worker init skipped - workerRef.current already exists.");
        // if (workerStatus === 'done') console.log("PixelGrid: Worker init skipped - workerStatus is 'done'.");
        // if (workerStatus === 'processing-worker') console.log("PixelGrid: Worker init skipped - workerStatus is 'processing-worker'.");
        // if (workerErrorMessage) console.log("PixelGrid: Worker init skipped - workerErrorMessage is set.");
      return;
    }
    
    // console.log("PixelGrid: Attempting to start worker.");
    setWorkerStatus('processing-worker'); 
    setOverallProgress(0); 
    // Initial progress message set by the other useEffect

    try {
      const workerInstance = new Worker(new URL('../../workers/pixel-map-worker.ts', import.meta.url));
      workerRef.current = workerInstance;
      // console.log("PixelGrid: Worker instance created.");

      const workerInputData = {
        pathStrings: mapData.pathStrings,
        canvasWidth: canvasDrawWidth,
        canvasHeight: canvasDrawHeight,
        svgViewBoxWidth: SVG_VIEWBOX_WIDTH,
        svgViewBoxHeight: SVG_VIEWBOX_HEIGHT,
        logicalCols: LOGICAL_GRID_COLS_CONFIG,
        logicalRows: logicalGridRows,
        pixelSize: RENDERED_PIXEL_SIZE_CONFIG,
      };
      // console.log("PixelGrid: Data being sent to worker:", workerInputData);
      workerRef.current.postMessage(workerInputData);
      // console.log("PixelGrid: Message posted to worker.");

      workerRef.current.onmessage = (event: MessageEvent<any>) => {
        if (!event.data || typeof event.data.type === 'undefined') {
          // console.error('PixelGrid: Invalid message structure from worker:', event.data);
          setWorkerStatus('error');
          setWorkerErrorMessage('Comunicação inválida do worker.');
          setOverallProgress(0);
          return;
        }
        const { type, progress, bitmap, activePixelsInBitmap, error: workerErrorMsg } = event.data;
        
        if (type === 'progress') {
          // console.log(`PixelGrid: Worker progress: ${progress?.toFixed(1)}%`);
          setOverallProgress(Math.max(0, Math.min(100, Number(progress) || 0)));
        } else if (type === 'done') {
          // console.log(`PixelGrid: Worker DONE. Active pixels in bitmap: ${activePixelsInBitmap}`);
          setPixelBitmap(new Uint8Array(bitmap));
          setWorkerStatus('done');
          setOverallProgress(100); 
        } else if (type === 'error') {
          // console.error(`PixelGrid: Worker error: ${workerErrorMsg}`);
          setWorkerStatus('error');
          setWorkerErrorMessage(workerErrorMsg || 'Erro desconhecido no worker.');
          setOverallProgress(0);
        }
      };

      workerRef.current.onerror = (err: ErrorEvent) => {
        const errorMessage = `Erro no script do Worker: ${err.message || "Ocorreu um erro crítico."}`;
        // console.error("PixelGrid: Worker onerror:", errorMessage);
        setWorkerStatus('error');
        setWorkerErrorMessage(errorMessage);
        setOverallProgress(0);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      };
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // console.error(`PixelGrid: Failed to create worker: ${errorMsg}`, e);
      setWorkerStatus('error');
      setWorkerErrorMessage(`Falha ao criar Worker: ${errorMsg}`);
      setOverallProgress(0);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    }
    
    return () => {
      // console.log("PixelGrid: Terminating worker due to component unmount or re-run of worker useEffect.");
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isClient, mapData, workerStatus, workerErrorMessage]);


  const drawMap = useCallback(() => {
    // console.log("PixelGrid: drawMap CALLED. Canvas:", !!canvasRef.current, "MapData:", !!mapData);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!ctx || !canvas) {
      // console.log("PixelGrid: drawMap skipped - no canvas or context.");
      return;
    }
    
    if (canvas.width !== canvasDrawWidth || canvas.height !== canvasDrawHeight) {
        canvas.width = canvasDrawWidth;
        canvas.height = canvasDrawHeight;
    }
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (mapData && mapData.path2D) {
      ctx.fillStyle = UNSOLD_PIXEL_COLOR;
      ctx.strokeStyle = UNSOLD_PIXEL_STROKE_COLOR; 
      ctx.lineWidth = Math.max(0.2, 0.5 / zoom); 
      ctx.fill(mapData.path2D);
      ctx.stroke(mapData.path2D);
      // console.log("PixelGrid: Base map (SVG outline) drawn with fillStyle:", ctx.fillStyle, "and strokeStyle:", ctx.strokeStyle);
    } else {
      // console.log("PixelGrid: mapData or path2D not available for drawing base map.");
    }

    if (soldPixels.length > 0) {
      // console.log(`PixelGrid: Drawing ${soldPixels.length} sold pixels.`);
      soldPixels.forEach(pixel => {
        ctx.fillStyle = pixel.color;
        const renderX = pixel.x * RENDERED_PIXEL_SIZE_CONFIG;
        const renderY = pixel.y * RENDERED_PIXEL_SIZE_CONFIG;
        const displayPixelSize = Math.max(1 / zoom, RENDERED_PIXEL_SIZE_CONFIG); 
        // console.log(`PixelGrid: Drawing sold pixel: color=${pixel.color}, x=${renderX}, y=${renderY}, size=${displayPixelSize}`);
        ctx.fillRect(renderX, renderY, displayPixelSize, displayPixelSize);
      });
    }
  }, [mapData, soldPixels, zoom]);

  useEffect(() => {
    // console.log(`PixelGrid: useEffect for drawing triggered. Dependencies - mapData: ${!!mapData} soldPixels length: ${soldPixels.length}`);
    drawMap();
  }, [drawMap, position, zoom]); 


  useEffect(() => { 
    // console.log('PixelGrid: Default view useEffect triggered. isClient:', isClient, 'mapData:', !!mapData?.path2D, 'defaultView:', !!defaultView, 'canvasDrawWidth:', canvasDrawWidth, 'canvasDrawHeight:', canvasDrawHeight);
    // console.log('PixelGrid: Window inner dimensions - Width:', window.innerWidth, 'Height:', window.innerHeight);
    // console.log('PixelGrid: Container ref current offsetWidth:', containerRef.current?.offsetWidth);

    if (isClient && containerRef.current && mapData?.path2D && !defaultView && canvasDrawWidth > 0 && canvasDrawHeight > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const effectiveContainerHeight = window.innerHeight - HEADER_HEIGHT_PX - BOTTOM_NAV_HEIGHT_PX;
      
      // console.log(`PixelGrid: DefaultView calc. container: ${containerWidth}x${effectiveContainerHeight}, canvasDraw: ${canvasDrawWidth}x${canvasDrawHeight}`);

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
        
        // console.log(`PixelGrid: DefaultView calculated. zoomToFit: ${zoomToFit.toFixed(3)}, calculatedZoom: ${calculatedZoom.toFixed(3)}, calculatedPosition: X=${calculatedPosition.x.toFixed(1)}, Y=${calculatedPosition.y.toFixed(1)}`);
        
        setDefaultView({ zoom: calculatedZoom, position: calculatedPosition });
        setZoom(calculatedZoom);
        setPosition(calculatedPosition);
        // console.log("PixelGrid: Default view set.", { zoom: calculatedZoom, position: calculatedPosition });
      } else {
        // console.log("PixelGrid: DefaultView calc skipped - container dimensions not positive.");
      }
    }
  }, [isClient, mapData, defaultView, canvasDrawWidth, canvasDrawHeight]);


 const handleResetView = useCallback(() => {
    // console.log("PixelGrid: handleResetView called.");
    clearAutoResetTimeout();
    if (defaultView) {
      setZoom(defaultView.zoom);
      setPosition(defaultView.position);
    } else if (isClient && containerRef.current && mapData?.path2D && canvasDrawWidth > 0 && canvasDrawHeight > 0) { 
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
            // console.log("PixelGrid: Fallback default view set in handleResetView.", { zoom: fallbackZoom, position: fallbackPosition });
        }
    }
  }, [defaultView, mapData, clearAutoResetTimeout, canvasDrawWidth, canvasDrawHeight, isClient]); 


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
    // console.log(`PixelGrid: progressMessage useEffect. isClient: ${isClient}, mapData: ${!!mapData}, workerStatus: ${workerStatus}, overallProgress: ${overallProgress.toFixed(1)}%, workerErrorMessage: ${workerErrorMessage}`);
    if (workerStatus === 'error') {
      setProgressMessage(workerErrorMessage || "Erro no processamento do mapa.");
    } else if (workerStatus === 'done') {
      setProgressMessage("Mapa interativo pronto!");
      const timeoutId = setTimeout(() => setProgressMessage(""), 3000); // Clear message after 3s
      return () => clearTimeout(timeoutId);
    } else if (workerStatus === 'processing-worker') {
      setProgressMessage(`A calcular grelha interativa de alta precisão: ${overallProgress.toFixed(0)}%`);
    } else if (workerStatus === 'processing-map' && mapData) {
      setProgressMessage("A iniciar processamento da grelha interativa...");
    } else if (!mapData && !workerErrorMessage && isClient) {
      setProgressMessage("A carregar contorno do mapa...");
    } else if (!isClient && !workerErrorMessage) {
      setProgressMessage("Aguardando cliente...");
    }
  }, [isClient, mapData, workerStatus, overallProgress, workerErrorMessage]);


  const handleZoomIn = () => { clearAutoResetTimeout(); setZoom((prevZoom) => Math.min(prevZoom * 1.2, MAX_ZOOM)); };
  const handleZoomOut = () => { clearAutoResetTimeout(); setZoom((prevZoom) => Math.max(prevZoom / 1.2, MIN_ZOOM)); };


  const handleMouseDown = (e: React.MouseEvent) => {
    clearAutoResetTimeout();
    const targetElement = e.target as HTMLElement;
     if (targetElement.closest('button, [data-dialog-content], [data-tooltip-content], [data-popover-content], label, a, [role="menuitem"], [role="tab"], input, textarea') && targetElement !== canvasRef.current) {
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

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    clearAutoResetTimeout();
    if (didDragRef.current) {
        didDragRef.current = false;
        return;
    }
    if (!canvasRef.current) return;

    if (workerStatus !== 'done' || !pixelBitmap) {
      toast({
        title: "Mapa Interativo a Carregar",
        description: `A grelha de píxeis interativa ainda está a ser processada (${overallProgress.toFixed(0)}%). Por favor, aguarde.`,
        variant: "default",
      });
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect(); 
    
    const clickXInCanvasElement = event.clientX - rect.left;
    const clickYInCanvasElement = event.clientY - rect.top;

    const xOnContent = (clickXInCanvasElement / zoom) - (position.x / zoom);
    const yOnContent = (clickYInCanvasElement / zoom) - (position.y / zoom);
    
    const logicalCol = Math.floor(xOnContent / RENDERED_PIXEL_SIZE_CONFIG);
    const logicalRow = Math.floor(yOnContent / RENDERED_PIXEL_SIZE_CONFIG);
    
    // console.log(`PixelGrid Click: Screen(${event.clientX},${event.clientY}), CanvasEl(${clickXInCanvasElement.toFixed(1)},${clickYInCanvasElement.toFixed(1)}), Zoom:${zoom.toFixed(2)}, Pos(${position.x.toFixed(1)},${position.y.toFixed(1)}), Content(${xOnContent.toFixed(1)},${yOnContent.toFixed(1)}), Logical(${logicalCol},${logicalRow})`);

    if (logicalCol >= 0 && logicalCol < LOGICAL_GRID_COLS_CONFIG && logicalRow >= 0 && logicalRow < logicalGridRows) {
      const bitmapIdx = logicalRow * LOGICAL_GRID_COLS_CONFIG + logicalCol;
      
      // console.log(`PixelGrid Click: Bitmap index: ${bitmapIdx}, Bitmap value: ${pixelBitmap ? pixelBitmap[bitmapIdx] : 'N/A'}`);

      if (pixelBitmap && pixelBitmap[bitmapIdx] === 1) { 
        setSelectedPixelCoordsForDisplay({ x: logicalCol, y: logicalRow });

        const existingSoldPixel = soldPixels.find(p => p.x === logicalCol && p.y === logicalRow);
        let mockDetails: SelectedPixelDetails;
        const randomRarity = mockRarities[Math.floor(Math.random() * mockRarities.length)];
        const randomLore = mockLoreSnippets[Math.floor(Math.random() * mockLoreSnippets.length)];
        const approxGps = mapPixelToApproxGps(logicalCol, logicalRow, LOGICAL_GRID_COLS_CONFIG, logicalGridRows);

        if (existingSoldPixel) {
             mockDetails = {
                x: logicalCol,
                y: logicalRow,
                owner: existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID,
                acquisitionDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT'),
                lastModifiedDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toLocaleDateString('pt-PT'),
                color: existingSoldPixel.color,
                history: [{ owner: existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID, date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString('pt-PT'), price: Math.floor(Math.random() * 40) + 5 }],
                isOwnedByCurrentUser: (existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID) === MOCK_CURRENT_USER_ID,
                isForSaleBySystem: false,
                manualDescription: 'Este é o meu pixel especial!',
                pixelImageUrl: Math.random() > 0.6 ? `https://placehold.co/150x150.png?text=${logicalCol}x${logicalRow}` : undefined,
                dataAiHint: 'pixel image',
                title: existingSoldPixel.title || `Pixel de ${existingSoldPixel.ownerId || MOCK_CURRENT_USER_ID}`,
                tags: ['meu', 'favorito'],
                linkUrl: Math.random() > 0.5 ? 'https://dourado.com' : undefined,
                isForSaleByOwner: Math.random() > 0.5,
                salePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 20 : undefined,
                isFavorited: Math.random() > 0.5,
                rarity: randomRarity,
                loreSnippet: randomLore,
                gpsCoords: approxGps,
            };
        } else { 
             mockDetails = {
                x: logicalCol,
                y: logicalRow,
                owner: 'Disponível (Sistema)',
                price: Math.floor(Math.random() * 50) + 10, 
                color: UNSOLD_PIXEL_COLOR,
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
        setIsFavorite(mockDetails.isFavorited || false);
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
        toast({ title: "Fora da Área Interativa", description: `Clicou fora da área interativa de Portugal. Coords Lógicas: (${logicalCol}, ${logicalRow}).`, variant: "default" });
      }
    } else { 
      setSelectedPixelCoordsForDisplay(null);
      setSelectedPixelDetails(null);
      toast({ title: "Fora dos Limites do Mapa", description: `Clicou fora dos limites do mapa. Coords Lógicas: (${logicalCol}, ${logicalRow}).`, variant: "default" });
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
        // console.error("Erro ao gerar descrição por IA:", error);
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

  const handleRemovePixelImage = () => {
    setEditablePixelImageFile(null);
    setEditablePixelImagePreview(null);
    const fileInput = document.getElementById('pixelImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleSaveChanges = () => {
    if (!selectedPixelDetails) return;

    const updatedTags = editableTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const salePriceNum = parseFloat(String(editableSalePrice));

    const updatedDetails: SelectedPixelDetails = {
      ...selectedPixelDetails,
      color: editableColor,
      manualDescription: editableManualDescription,
      pixelImageUrl: editablePixelImagePreview || undefined,
      dataAiHint: editablePixelImagePreview ? 'pixel custom image' : undefined,
      title: editableTitle,
      tags: updatedTags,
      linkUrl: editableLinkUrl,
      isForSaleByOwner: editableIsForSaleByOwner,
      salePrice: editableIsForSaleByOwner && !isNaN(salePriceNum) ? salePriceNum : undefined,
      lastModifiedDate: new Date().toLocaleDateString('pt-PT'),
    };
    setSelectedPixelDetails(updatedDetails);

    setSoldPixels(prevSold => prevSold.map(p =>
      p.x === selectedPixelDetails.x && p.y === selectedPixelDetails.y
        ? { ...p, color: editableColor, title: editableTitle }
        : p
    ));

    toast({ title: "Alterações Guardadas", description: "As alterações ao seu pixel foram (simuladamente) guardadas." });
    setEditMode(false);
  };

  const handleToggleFavorite = () => {
    if (!selectedPixelDetails) return;
    const newFavStatus = !isFavorite;
    setIsFavorite(newFavStatus);
    setSelectedPixelDetails(prev => prev ? ({ ...prev, isFavorited: newFavStatus }) : null);
    toast({
      title: newFavStatus ? "Adicionado aos Favoritos" : "Removido dos Favoritos",
      description: `O pixel (${selectedPixelDetails.x}, ${selectedPixelDetails.y}) foi ${newFavStatus ? 'adicionado aos' : 'removido dos'} seus favoritos.`,
    });
  };

  const handleReportPixel = () => {
    if (!selectedPixelDetails) return;
    toast({
      title: "Pixel Reportado",
      description: `O pixel (${selectedPixelDetails.x}, ${selectedPixelDetails.y}) foi reportado para revisão (simulado).`,
      variant: "default",
    });
  };

  const handleBuyPixelFromSystem = () => {
    if (!selectedPixelDetails || !selectedPixelDetails.isForSaleBySystem || !selectedPixelDetails.price) return;

    const newSoldPixel: SoldPixel = {
      x: selectedPixelDetails.x,
      y: selectedPixelDetails.y,
      color: USER_BOUGHT_PIXEL_COLOR, // Default color for newly bought pixel
      ownerId: MOCK_CURRENT_USER_ID, // Mock current user ID
      title: `Meu Pixel (${selectedPixelDetails.x},${selectedPixelDetails.y})`
    };
    setSoldPixels(prev => [...prev, newSoldPixel]);

    setSelectedPixelDetails(prev => ({
        ...(prev as SelectedPixelDetails), // Cast to ensure all fields are present
        owner: MOCK_CURRENT_USER_ID,
        isOwnedByCurrentUser: true,
        isForSaleBySystem: false, // No longer for sale by system
        price: undefined, // Price removed after purchase
        acquisitionDate: new Date().toLocaleDateString('pt-PT'),
        lastModifiedDate: new Date().toLocaleDateString('pt-PT'),
        color: newSoldPixel.color, // Update color to the bought color
        history: [{ owner: MOCK_CURRENT_USER_ID, date: new Date().toLocaleDateString('pt-PT'), price: selectedPixelDetails.price }],
        manualDescription: 'Acabei de adquirir este pixel!', // Default description
        title: newSoldPixel.title,
        isForSaleByOwner: false, // Not for sale by owner initially
        salePrice: undefined,
    }));
    toast({ title: "Pixel Comprado!", description: `Parabéns, o pixel (${selectedPixelDetails.x}, ${selectedPixelDetails.y}) é seu!`});
    setShowPixelModal(false); // Close modal after purchase
  };

  const handleToggleForSaleByOwner = () => {
    if (!selectedPixelDetails || !selectedPixelDetails.isOwnedByCurrentUser) return;

    const currentlyForSale = selectedPixelDetails.isForSaleByOwner;
    const newSaleStatus = !currentlyForSale;
    const newSalePrice = newSaleStatus ? (selectedPixelDetails.salePrice || parseFloat(String(editableSalePrice)) || 50) : undefined;

    const updatedDetails: SelectedPixelDetails = {
        ...(selectedPixelDetails),
        isForSaleByOwner: newSaleStatus,
        salePrice: newSalePrice,
        lastModifiedDate: new Date().toLocaleDateString('pt-PT'),
    };
    setSelectedPixelDetails(updatedDetails);

    if (editMode) { 
        setEditableIsForSaleByOwner(newSaleStatus);
        setEditableSalePrice(newSalePrice || '');
    }

    toast({
        title: newSaleStatus ? "Pixel Colocado à Venda" : "Pixel Retirado da Venda",
        description: `O seu pixel (${selectedPixelDetails.x}, ${selectedPixelDetails.y}) foi ${newSaleStatus ? `colocado à venda por ${newSalePrice} créditos.` : 'retirado da venda.'}`,
    });
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
  
  const showProgressText = (workerStatus !== 'done' || (workerStatus === 'done' && progressMessage !== "" && overallProgress < 100)) && workerStatus !== 'error';
  
  // console.log("PixelGrid: Rendering. Type of handleMapDataLoaded:", typeof handleMapDataLoaded);
  // console.log("PixelGrid: Current workerStatus:", workerStatus, "mapData available:", !!mapData, "pixelBitmap available:", !!pixelBitmap);
  // console.log("PixelGrid: current progressMessage", progressMessage);


  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative animate-fade-in">
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-lg pointer-events-auto animate-slide-in-up animation-delay-200">
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
        <div className="mt-2 p-2 bg-background/50 rounded-md text-xs font-code">
          <p>Zoom: {zoom.toFixed(2)}x</p>
          <p>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          {selectedPixelCoordsForDisplay && <p>Pixel Lógico: ({selectedPixelCoordsForDisplay.x}, {selectedPixelCoordsForDisplay.y})</p>}
          <p>Grelha: {(totalLogicalPixels / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      
      {showProgressText && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-card/80 backdrop-blur-sm p-3 rounded-lg shadow-lg text-center pointer-events-none">
            <div className="flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary animate-pulse mr-2" />
                <p className="text-sm font-headline text-foreground">{progressMessage}</p>
            </div>
            {workerStatus === 'processing-worker' && overallProgress < 100 && <Progress value={overallProgress} className="w-48 mx-auto h-1 mt-1" />}
          </div>
        )}

      {workerStatus === 'error' && !workerErrorMessage && (
         <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/90 pointer-events-none">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-xl font-headline text-destructive-foreground mb-2">Erro ao Carregar o Mapa Interativo</p>
            <p className="text-sm text-muted-foreground max-w-sm text-center mb-1">Ocorreu um problema ao processar os dados do mapa.</p>
            <p className="text-sm text-muted-foreground">Por favor, tente recarregar a página.</p>
          </div>
      )}
      
      <Dialog open={showPixelModal} onOpenChange={(isOpen) => {
          setShowPixelModal(isOpen);
          if (!isOpen) {
              setSelectedPixelDetails(null);
              setPixelDescription(null);
              setIsGeneratingDesc(false);
              setAiModalProgressValue(0);
              setEditMode(false);
          } else {
            clearAutoResetTimeout(); 
          }
      }}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm text-card-foreground border-primary/30 shadow-xl" data-dialog-content pointerEvents="auto">
          {!editMode && selectedPixelDetails && (
            <>
              <DialogHeader className={cn(`dialog-header-gold-accent rounded-t-lg`, selectedPixelDetails?.rarity === 'Lendário' ? 'legendary-glow-strong' : selectedPixelDetails?.rarity === 'Épico' ? 'epic-shadow' : '')}>
                <div className="flex items-start justify-between">
                    <div>
                        <DialogTitle className="font-headline flex items-center text-xl text-shadow-gold-sm">
                            Pixel ({selectedPixelDetails.x}, {selectedPixelDetails.y})
                        </DialogTitle>
                        {selectedPixelDetails.title && <CardDescription className="text-base text-primary/90 -mt-1 text-shadow-gold-xs">&quot;{selectedPixelDetails.title}&quot;</CardDescription>}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="text-muted-foreground hover:text-destructive-foreground h-8 w-8">
                                    <Heart className={`h-5 w-5 transition-all duration-200 ${isFavorite ? 'fill-red-500 text-red-500 animate-scale-in' : 'hover:text-red-400'}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <DialogDescriptionElement className="pt-1 text-muted-foreground">
                  Informações detalhadas e ações disponíveis para este pixel.
                </DialogDescriptionElement>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(100vh-280px)] pr-4 -mr-2">
              <div className="space-y-3 py-2 px-1">
                <Card className="card-inset-shadow animate-fade-in animation-delay-100">
                  <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                      <CardTitleElement className="text-md font-headline flex items-center text-primary">
                          <Info className="h-4 w-4 mr-2" /> Informações do Pixel
                      </CardTitleElement>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1.5 px-4 pb-3">
                    <div className="flex justify-between"><span>Proprietário:</span> <Badge variant={selectedPixelDetails.owner === 'Disponível (Sistema)' ? "secondary" : "outline"} className="font-code">{selectedPixelDetails.owner}</Badge></div>

                    {selectedPixelDetails.isForSaleBySystem && selectedPixelDetails.price && (
                      <div className="flex justify-between items-center"><span>Preço (Sistema):</span> <span className="font-code flex items-center">{selectedPixelDetails.price} Créditos <DollarSign className="inline h-3.5 w-3.5 ml-1 text-primary" /></span></div>
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
                    {selectedPixelDetails.gpsCoords && (
                      <div className="flex justify-between items-center">
                        <span>GPS (Aprox.):</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-code flex items-center cursor-help">
                                {selectedPixelDetails.gpsCoords.lat.toFixed(4)}, {selectedPixelDetails.gpsCoords.lon.toFixed(4)}
                                <Globe className="inline h-3.5 w-3.5 ml-1.5 text-primary/80" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent align="end"><p>Coordenadas GPS aproximadas. Não para navegação precisa.</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
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
                                <LinkIconLucide className="h-3 w-3 ml-1" />
                            </a>
                        </div>
                    )}
                    {selectedPixelDetails.pixelImageUrl && (
                      <div className="pt-1">
                        <span className="font-semibold">Imagem do Pixel:</span>
                        <div className="mt-1 relative w-24 h-24 rounded border border-border overflow-hidden shadow-sm animate-scale-in">
                          <Image src={selectedPixelDetails.pixelImageUrl} alt="Imagem do Pixel" layout="fill" objectFit="cover" data-ai-hint={selectedPixelDetails.dataAiHint || 'pixel image'}/>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedPixelDetails.rarity && (
                  <Card className="card-inset-shadow animate-fade-in animation-delay-200">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                        <CardTitleElement className="text-md font-headline flex items-center text-primary">
                            <Gem className="h-4 w-4 mr-2" /> Raridade e História
                        </CardTitleElement>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-1.5">
                       <div className="flex justify-between items-center text-sm">
                          <span>Raridade:</span>
                           <Badge
                              variant={
                                  selectedPixelDetails.rarity === 'Lendário' ? "destructive" : 
                                  selectedPixelDetails.rarity === 'Épico' ? "default" :    
                                  selectedPixelDetails.rarity === 'Raro' ? "secondary" :
                                  "outline" 
                              }
                              className={`font-code text-xs ${selectedPixelDetails.rarity === 'Marco Histórico' ? 'border-amber-500 text-amber-500' : ''}`}
                            >
                            {selectedPixelDetails.rarity}
                          </Badge>
                       </div>
                       {selectedPixelDetails.loreSnippet && (
                         <div className="pt-1">
                            <span className="font-semibold text-sm">Fragmento de História (IA):</span>
                            <p className="text-xs text-muted-foreground italic">&quot;{selectedPixelDetails.loreSnippet}&quot;</p>
                         </div>
                       )}
                    </CardContent>
                  </Card>
                )}


                {(!pixelDescription && !isGeneratingDesc && (aiModalProgressValue === 0 || aiModalProgressValue === 100) && showPixelModal) && (
                  <Card className="card-inset-shadow animate-fade-in animation-delay-300">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                        <CardTitleElement className="text-md font-headline flex items-center text-primary">
                            <Sparkles className="h-4 w-4 mr-2" /> Descrição por IA
                        </CardTitleElement>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={!selectedPixelDetails} className="w-full mt-1 button-gold-glow">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5"/>
                            Gerar Descrição Detalhada com IA
                        </Button>
                    </CardContent>
                  </Card>
                )}
                {(isGeneratingDesc || pixelDescription || (aiModalProgressValue > 0 && aiModalProgressValue < 100 && !pixelDescription && showPixelModal)) && (
                  <Card className="card-inset-shadow animate-fade-in animation-delay-300">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                      <CardTitleElement className="text-md font-headline flex items-center text-primary">
                          <Sparkles className="h-4 w-4 mr-2" /> Descrição por IA
                      </CardTitleElement>
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
                    </CardContent>
                  </Card>
                )}

                {selectedPixelDetails.history && selectedPixelDetails.history.length > 0 && (
                  <Card className="card-inset-shadow animate-fade-in animation-delay-400">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                      <CardTitleElement className="text-md font-headline flex items-center text-primary">
                          <HistoryIcon className="h-4 w-4 mr-2" /> Histórico de Proprietários
                      </CardTitleElement>
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
              <DialogFooter className="gap-2 sm:gap-1.5 flex-wrap justify-center pt-3 sm:justify-between dialog-footer-gold-accent rounded-b-lg">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleReportPixel} className="text-muted-foreground hover:text-destructive h-8 w-8">
                                <Flag className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Reportar Pixel</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="flex gap-2 sm:gap-1.5 flex-wrap justify-center sm:justify-end">
                    {selectedPixelDetails.isForSaleBySystem && !selectedPixelDetails.isOwnedByCurrentUser && selectedPixelDetails.price && (
                      <Button size="sm" onClick={handleBuyPixelFromSystem} className="button-gradient-orange button-3d-effect">
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Comprar ({selectedPixelDetails.price} Créditos)
                      </Button>
                    )}
                    {selectedPixelDetails.isOwnedByCurrentUser && (
                      <>
                        {selectedPixelDetails.isForSaleByOwner ? (
                          <Button size="sm" variant="outline" onClick={handleToggleForSaleByOwner} className="border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-500 button-3d-effect-outline">
                             <BadgePercent className="mr-1.5 h-3.5 w-3.5" /> Retirar da Venda
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={handleToggleForSaleByOwner} className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-500 button-3d-effect-outline">
                             <BadgePercent className="mr-1.5 h-3.5 w-3.5" /> Colocar à Venda
                          </Button>
                        )}
                        <Button size="sm" onClick={() => setEditMode(true)} className="button-gradient-gold button-3d-effect">
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editar Pixel
                        </Button>
                      </>
                    )}
                    {!selectedPixelDetails.isForSaleBySystem && !selectedPixelDetails.isOwnedByCurrentUser && (
                        <Button variant="secondary" size="sm" disabled className="button-3d-effect">Fazer Oferta</Button>
                    )}
                </div>
              </DialogFooter>
            </>
          )}
          {editMode && selectedPixelDetails && (
            <>
              <DialogHeader className="dialog-header-gold-accent rounded-t-lg">
                <DialogTitle className="font-headline flex items-center text-xl text-shadow-gold-sm">
                    <Edit3 className="h-5 w-5 mr-2 text-accent" /> Editando Pixel ({selectedPixelDetails.x}, {selectedPixelDetails.y})
                </DialogTitle>
                <DialogDescriptionElement className="text-muted-foreground">
                  Modifique as propriedades do seu pixel.
                </DialogDescriptionElement>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(100vh-280px)] pr-4 -mr-2">
                <div className="space-y-4 py-2 px-1">

                  <Card className="card-inset-shadow">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                      <CardTitleElement className="text-md font-headline flex items-center text-primary">
                        <PaletteIcon className="h-4 w-4 mr-2" /> Aparência
                      </CardTitleElement>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-3">
                        <div>
                            <Label htmlFor="pixelColorEdit" className="text-xs text-muted-foreground">Cor</Label>
                            <div className="flex items-center gap-2 mt-1">
                            <Input
                                id="pixelColorEdit"
                                type="color"
                                value={editableColor}
                                onChange={(e) => setEditableColor(e.target.value)}
                                className="w-12 h-10 p-1 input-shadow"
                            />
                            <Input
                                type="text"
                                placeholder="#RRGGBB"
                                value={editableColor}
                                onChange={(e) => setEditableColor(e.target.value)}
                                className="font-code flex-1 h-10 text-sm input-shadow"
                                aria-label="Código Hex da Cor"
                            />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="pixelTitleEdit" className="text-xs text-muted-foreground">Título do Pixel</Label>
                            <Input
                                id="pixelTitleEdit"
                                type="text"
                                placeholder="Ex: Meu Pôr do Sol Pixelizado"
                                value={editableTitle}
                                onChange={(e) => setEditableTitle(e.target.value)}
                                className="mt-1 h-10 text-sm input-shadow"
                            />
                        </div>
                         <div>
                            <Label htmlFor="pixelDescEdit" className="text-xs text-muted-foreground">Descrição Manual</Label>
                            <Textarea
                                id="pixelDescEdit"
                                placeholder="Descreva o seu pixel..."
                                value={editableManualDescription}
                                onChange={(e) => setEditableManualDescription(e.target.value)}
                                rows={3}
                                className="mt-1 text-sm input-shadow"
                            />
                        </div>
                         <div>
                            <Label htmlFor="pixelImageUpload" className="text-xs text-muted-foreground">Imagem do Pixel (Upload)</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    id="pixelImageUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePixelImageUpload}
                                    className="text-xs flex-1 file:text-primary file:font-semibold file:mr-2 file:px-2 file:py-1 file:rounded-sm file:border-0 file:bg-primary/10 hover:file:bg-primary/20"
                                />
                                {editablePixelImagePreview && (
                                    <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={handleRemovePixelImage}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Remover Imagem</p></TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            {editablePixelImagePreview && (
                                <div className="mt-2 relative w-24 h-24 rounded border border-border overflow-hidden group shadow-sm animate-scale-in">
                                <Image src={editablePixelImagePreview} alt="Pré-visualização da Imagem" layout="fill" objectFit="cover" data-ai-hint="pixel image preview"/>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Envie uma imagem para associar a este pixel.</p>
                        </div>
                    </CardContent>
                  </Card>

                  <Card className="card-inset-shadow">
                     <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                        <CardTitleElement className="text-md font-headline flex items-center text-primary">
                           <PaintBucket className="h-4 w-4 mr-2" /> Desenhar Imagem <Badge variant="outline" className="ml-2 text-xs">Experimental</Badge>
                        </CardTitleElement>
                     </CardHeader>
                     <CardContent className="px-4 pb-3 space-y-2">
                        <div className="w-full h-32 bg-muted/30 border border-dashed border-border rounded-md flex items-center justify-center">
                           <p className="text-xs text-muted-foreground">Área de desenho (em breve)</p>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                           <TooltipProvider>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled className="h-8 w-8"><Pencil className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Lápis (Em breve)</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled className="h-8 w-8"><Eraser className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Borracha (Em breve)</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled className="h-8 w-8"><PaintBucket className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Preencher (Em breve)</p></TooltipContent>
                              </Tooltip>
                               <Tooltip>
                                 <TooltipTrigger asChild><Button variant="outline" size="icon" disabled className="h-8 w-8"><Trash2 className="h-4 w-4"/></Button></TooltipTrigger>
                                 <TooltipContent><p>Limpar (Em breve)</p></TooltipContent>
                              </Tooltip>
                           </TooltipProvider>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="card-inset-shadow">
                    <CardHeader className="card-header-accent pb-2 pt-3 px-4">
                      <CardTitleElement className="text-md font-headline flex items-center text-primary">
                        <TagsIcon className="h-4 w-4 mr-2" /> Detalhes Adicionais & Venda
                      </CardTitleElement>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 space-y-3">
                        <div>
                            <Label htmlFor="pixelTagsEdit" className="text-xs text-muted-foreground">Tags</Label>
                            <Input
                                id="pixelTagsEdit"
                                type="text"
                                placeholder="Ex: paisagem, lisboa, arte"
                                value={editableTags}
                                onChange={(e) => setEditableTags(e.target.value)}
                                className="mt-1 h-10 text-sm input-shadow"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Separadas por vírgula.</p>
                        </div>
                        <div>
                            <Label htmlFor="pixelLinkEdit" className="text-xs text-muted-foreground">Link Associado</Label>
                            <Input
                                id="pixelLinkEdit"
                                type="url"
                                placeholder="https://exemplo.com"
                                value={editableLinkUrl}
                                onChange={(e) => setEditableLinkUrl(e.target.value)}
                                className="mt-1 h-10 text-sm input-shadow"
                            />
                        </div>
                        <Separator className="bg-border/50"/>
                        <div className="flex items-center space-x-2 pt-1">
                            <Switch
                            id="for-sale-switch"
                            checked={editableIsForSaleByOwner}
                            onCheckedChange={setEditableIsForSaleByOwner}
                            className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted"
                            />
                            <Label htmlFor="for-sale-switch" className="text-sm cursor-pointer">Colocar pixel à venda</Label>
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
                                className="mt-1 h-10 text-sm input-shadow"
                                min="0"
                            />
                            </div>
                        )}
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
              <DialogFooter className="gap-2 pt-3 dialog-footer-gold-accent rounded-b-lg">
                 <Button variant="outline" onClick={() => setEditMode(false)} className="button-3d-effect-outline">Cancelar</Button>
                 <Button onClick={handleSaveChanges} className="button-gradient-green button-3d-effect">
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
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="absolute top-0 left-0 w-full h-full z-10" 
            style={{ imageRendering: 'pixelated' }} 
          />
          
          {(!mapData && isClient) && <PortugalMapSvg onMapDataLoaded={handleMapDataLoaded} className="invisible absolute" />}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 animate-scale-in animation-delay-500" pointerEvents="auto">
        <Dialog>
          <DialogTrigger asChild>
             <Button pointerEvents="auto" size="icon" className="rounded-full w-14 h-14 shadow-lg button-gradient-gold button-3d-effect hover:button-gold-glow active:scale-95">
                <Star className="h-7 w-7" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/30 shadow-xl" data-dialog-content pointerEvents="auto">
            <DialogHeader className="dialog-header-gold-accent rounded-t-lg">
              <DialogTitle className="font-headline text-shadow-gold-sm">Ações Rápidas do Universo</DialogTitle>
              <DialogDescriptionElement className="text-muted-foreground">
                Explore, filtre e interaja com o mapa de pixels.
              </DialogDescriptionElement>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button pointerEvents="auto" variant="outline" className="button-3d-effect-outline"><Search className="mr-2 h-4 w-4" />Explorar Pixel por Coordenadas</Button>
              <Button pointerEvents="auto" variant="outline" className="button-3d-effect-outline"><PaletteIcon className="mr-2 h-4 w-4" />Filtros de Visualização</Button>
              <Button pointerEvents="auto" variant="outline" className="button-3d-effect-outline"><Sparkles className="mr-2 h-4 w-4" />Ver Eventos Atuais</Button>
               <Button pointerEvents="auto" variant="outline" className="button-3d-effect-outline"><MapPinIconLucide className="mr-2 h-4 w-4" />Ir para Minha Localização</Button>
            </div>
            <DialogFooter className="dialog-footer-gold-accent rounded-b-lg">
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

    