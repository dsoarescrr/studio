
// src/components/panels/StatisticsPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, Minimize2, Maximize2, TrendingUp, TrendingDown, Minus, Package, PackageOpen, Users2, MapPin, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


type StatItem = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tooltip?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

const initialStats: StatItem[] = [
  { label: 'Pixels Comprados', value: 12543, icon: <Package className="h-5 w-5 text-primary" />, trend: 'up', trendValue: '+5%', tooltip: "Total de pixels que já foram adquiridos por utilizadores." },
  { label: 'Pixels Livres', value: 8745723, icon: <PackageOpen className="h-5 w-5 text-green-400" />, trend: 'down', trendValue: '-0.2%', tooltip: "Total de pixels ainda disponíveis para compra no mapa."},
  { label: 'Usuários Ativos (24h)', value: 342, icon: <Users2 className="h-5 w-5 text-accent" />, trend: 'neutral', tooltip: "Utilizadores que interagiram com a plataforma nas últimas 24 horas." },
  { label: 'Pixels Especiais (Total)', value: 150, icon: <MapPin className="h-5 w-5 text-purple-400" />, trend: 'up', trendValue: '+10', tooltip: "Pixels com características ou localizações únicas." },
];

const FormattedStatValue: React.FC<{ value: number | string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState<string | number | null>(null); 

  useEffect(() => {
    if (typeof value === 'number') {
      setDisplayValue(value.toLocaleString('pt-PT'));
    } else {
      setDisplayValue(value); 
    }
  }, [value]);

  if (displayValue === null) {
    return <span className="text-lg font-semibold font-code">...</span>;
  }

  return <>{displayValue}</>;
};


export default function StatisticsPanel() {
  const [isMinimized, setIsMinimized] = useState(true); 
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 10000, y: 680 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
     if (typeof window !== 'undefined') {
        setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 280 }); // Adjusted Y for bottom right
     }
  }, []);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('[data-drag-handle="true"]')) return;
    setIsDragging(true);
    if (panelRef.current) {
      const panelRect = panelRef.current.getBoundingClientRect();
      setDragStart({ x: e.clientX - panelRect.left, y: e.clientY - panelRect.top });
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

  const handleMouseUp = () => setIsDragging(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: typeof stat.value === 'number' ? stat.value + Math.floor(Math.random() * (stat.label === 'Pixels Livres' ? 100 : 10)) - (stat.label === 'Pixels Livres' ? 40 : 4) : stat.value
      })));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card 
      ref={panelRef} 
      className="fixed z-30 w-80 shadow-xl bg-card/80 backdrop-blur-md transition-all duration-300 ease-in-out"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxHeight: isMinimized ? '60px' : 'auto', 
        minHeight: isMinimized ? '60px' : '200px',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader 
        className="py-3 px-4 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing" 
        data-drag-handle="true"
      >
        <div className="flex items-center">
          <BarChart2 className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-lg font-headline">Mini Stats</CardTitle>
        </div>
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-muted-foreground hover:text-foreground h-7 w-7">
                {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isMinimized ? 'Maximizar' : 'Minimizar'} Painel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4">
          <div className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2.5 bg-background/70 rounded-md shadow-sm relative group">
                <div className="flex items-center">
                  <div className="p-1.5 bg-muted rounded-md mr-2">{stat.icon}</div>
                  <span className="ml-1 text-sm text-foreground">{stat.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-md font-semibold font-code text-primary">
                    <FormattedStatValue value={stat.value} />
                  </p>
                  {stat.trend && (
                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      {getTrendIcon(stat.trend)}
                      <span className="ml-1">{stat.trendValue || ''}</span>
                    </div>
                  )}
                </div>
                 {stat.tooltip && (
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" align="end">
                        <p className="max-w-[200px] text-xs">{stat.tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <CardDescription className="text-xs mb-1 font-code">Densidade de Pixels (Exemplo):</CardDescription>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-xs mb-0.5 font-code"><span>Norte</span><span className="text-primary">75%</span></div>
                <Progress value={75} className="h-1.5 [&>div]:bg-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5 font-code"><span>Centro</span><span className="text-accent">50%</span></div>
                <Progress value={50} className="h-1.5 [&>div]:bg-accent" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5 font-code"><span>Sul</span><span className="text-yellow-400">30%</span></div>
                <Progress value={30} className="h-1.5 [&>div]:bg-yellow-400" />
              </div>
            </div>
          </div>
           <Button variant="link" size="sm" className="w-full text-xs mt-3 text-primary hover:text-primary/80">
              Ver Estatísticas Completas
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
