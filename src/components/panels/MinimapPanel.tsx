// src/components/panels/MinimapPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Map, Minimize2, Search, Maximize2, Pin, LocateFixed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PortugalMapSvg, { type MapData } from '@/components/pixel-grid/PortugalMapSvg';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MinimapPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [coords, setCoords] = useState({ x: '', y: '' });
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('[data-drag-handle="true"]')) return;

    setIsDragging(true);
    if (panelRef.current) {
      const panelRect = panelRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - panelRect.left,
        y: e.clientY - panelRect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = panelRef.current.offsetWidth;
    const panelHeight = panelRef.current.offsetHeight;

    newX = Math.max(0, Math.min(newX, viewportWidth - panelWidth));
    newY = Math.max(0, Math.min(newY, viewportHeight - panelHeight));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);


  const handleNavigate = () => {
    console.log(`Navegar para X: ${coords.x}, Y: ${coords.y}`);
  };

  const handleRegionClick = (regionId: string) => {
    console.log(`Região clicada: ${regionId}`);
  }

  // Dummy function to satisfy the prop requirement for PortugalMapSvg
  const handleMinimapDataLoaded = (data: MapData) => {
    // The minimap might not need to do anything complex with this data,
    // but the prop is required.
    // console.log("Minimap Svg data loaded (no-op)", data);
  };

  return (
    <Card
      ref={panelRef}
      className="fixed z-30 w-60 shadow-xl bg-card/80 backdrop-blur-md transition-all duration-300 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: isMinimized ? '56px' : '420px',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader
        className="py-2 px-3 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing"
        data-drag-handle="true"
      >
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center">
                        <LocateFixed className="h-5 w-5 text-primary" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Minimapa</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-muted-foreground hover:text-foreground h-7 w-7">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isMinimized ? 'Maximizar' : 'Minimizar'} Painel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-3 pt-0">
          <div className="aspect-[5/8] w-full bg-background/70 rounded-md overflow-hidden border border-border mb-3 shadow-inner relative">
            <PortugalMapSvg
              className="w-full h-full text-foreground/20"
              onMapDataLoaded={handleMinimapDataLoaded}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-[70%] left-[55%] w-3 h-3 bg-accent rounded-full cursor-pointer ring-2 ring-accent/50 hover:ring-accent transition-all animate-pulse"
                    onClick={() => handleRegionClick("D18-Faro")}
                    data-ai-hint="region marker"
                  ></div>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Faro</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-[20%] left-[25%] w-3 h-3 bg-primary rounded-full cursor-pointer ring-2 ring-primary/50 hover:ring-primary transition-all animate-pulse"
                    onClick={() => handleRegionClick("D01-Viana_do_Castelo")}
                    data-ai-hint="region marker"
                  ></div>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Viana do Castelo</p></TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute top-[45%] left-[40%] w-3 h-3 bg-green-500 rounded-full cursor-pointer ring-2 ring-green-500/50 hover:ring-green-500 transition-all animate-pulse"
                    onClick={() => handleRegionClick("D11-Leiria")}
                    data-ai-hint="region marker"
                  ></div>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Leiria</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2 mb-2">
            <Input
              type="number"
              placeholder="X"
              value={coords.x}
              onChange={(e) => setCoords({ ...coords, x: e.target.value })}
              className="h-8 text-xs font-code"
            />
            <Input
              type="number"
              placeholder="Y"
              value={coords.y}
              onChange={(e) => setCoords({ ...coords, y: e.target.value })}
              className="h-8 text-xs font-code"
            />
          </div>
          <Button onClick={handleNavigate} className="w-full h-8" variant="outline">
            <Pin className="mr-2 h-3 w-3" />
            Ir para Coordenadas
          </Button>
           <Button variant="link" size="sm" className="w-full text-xs mt-1 text-muted-foreground hover:text-primary">
              Procurar por Nome (Em Breve)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
