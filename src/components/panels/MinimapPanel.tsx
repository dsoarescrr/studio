
// src/components/panels/MinimapPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Map, Minimize2, Search, Maximize2, Pin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PortugalMapSvg from '@/components/pixel-grid/PortugalMapSvg'; // Re-use the SVG

export default function MinimapPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [coords, setCoords] = useState({ x: '', y: '' });
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 20, y: 150 }); // Initial default position
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Removed useEffect that sets initial position based on window.innerWidth
  // The default position is now set directly in useState.
  // Draggable panel position updates will handle viewport constraints.

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow dragging from the header
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
    
    // Calculate new position relative to viewport
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Constrain within viewport boundaries
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
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const handleNavigate = () => {
    console.log(`Navegar para X: ${coords.x}, Y: ${coords.y}`);
    // Add navigation logic here, potentially emitting an event or calling a context function
  };

  const handleRegionClick = (regionId: string) => {
    console.log(`Região clicada: ${regionId}`);
    // Logic to navigate to the center of the region
  }

  return (
    <Card 
      ref={panelRef} 
      className="fixed z-30 w-72 shadow-xl bg-card/80 backdrop-blur-md transition-all duration-300 ease-in-out" // Changed w-80 to w-72
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxHeight: isMinimized ? '60px' : '450px', // Adjusted max height slightly for smaller width
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between" data-drag-handle="true" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <div className="flex items-center">
          <Map className="h-5 w-5 mr-2 text-primary" /> {/* Icon size reduced slightly */}
          <CardTitle className="text-md font-headline">Minimapa</CardTitle> {/* Title size reduced slightly */}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-muted-foreground hover:text-foreground h-7 w-7"> {/* Button size reduced */}
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />} {/* Icon size reduced */}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-3"> {/* Padding reduced slightly */}
          <div className="aspect-square w-full bg-background rounded-md overflow-hidden border border-border mb-3"> {/* Margin bottom reduced */}
            {/* Placeholder for interactive minimap canvas */}
            {/* For now, using the same SVG, scaled down */}
            <PortugalMapSvg className="w-full h-full text-foreground/20" />
            {/* Example clickable regions (these would need actual coordinates and logic) */}
            <div 
              className="absolute top-[70%] left-[55%] w-5 h-5 bg-accent/50 rounded-full cursor-pointer hover:bg-accent"  // Size reduced
              onClick={() => handleRegionClick("D18-Faro")}
              title="Faro"
              data-ai-hint="region marker"
            ></div>
             <div 
              className="absolute top-[20%] left-[25%] w-5 h-5 bg-primary/50 rounded-full cursor-pointer hover:bg-primary" // Size reduced
              onClick={() => handleRegionClick("D01-Viana_do_Castelo")}
              title="Viana do Castelo"
              data-ai-hint="region marker"
            ></div>
          </div>
          <CardDescription className="text-xs mb-2 font-code">Navegação Rápida:</CardDescription>
          <div className="flex gap-2 mb-2"> {/* Margin bottom reduced */}
            <Input 
              type="number" 
              placeholder="X" 
              value={coords.x} 
              onChange={(e) => setCoords({ ...coords, x: e.target.value })}
              className="h-8 text-xs font-code" /* Text size reduced */
            />
            <Input 
              type="number" 
              placeholder="Y" 
              value={coords.y} 
              onChange={(e) => setCoords({ ...coords, y: e.target.value })}
              className="h-8 text-xs font-code" /* Text size reduced */
            />
          </div>
          <Button onClick={handleNavigate} className="w-full h-8" variant="outline"> {/* Height reduced */}
            <Pin className="mr-2 h-3 w-3" /> {/* Icon size reduced */}
            Ir para Coordenadas
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
