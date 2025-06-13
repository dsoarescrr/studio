
// src/components/panels/StatisticsPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, Minimize2, Maximize2, TrendingUp, TrendingDown, Minus, Package, PackageOpen, Users2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type StatItem = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

const initialStats: StatItem[] = [
  { label: 'Pixels Comprados', value: 12543, icon: <Package className="h-5 w-5 text-primary" />, trend: 'up', trendValue: '+5%' },
  { label: 'Pixels Livres', value: 87457, icon: <PackageOpen className="h-5 w-5 text-green-400" />, trend: 'down', trendValue: '-2%' },
  { label: 'Usuários Ativos', value: 342, icon: <Users2 className="h-5 w-5 text-accent" />, trend: 'neutral' },
  { label: 'Pixels Especiais', value: 150, icon: <MapPin className="h-5 w-5 text-purple-400" />, trend: 'up', trendValue: '+10' },
];

const FormattedStatValue: React.FC<{ value: number | string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState<string | number>(
    typeof value === 'number' ? '...' : value 
  );

  useEffect(() => {
    if (typeof value === 'number') {
      setDisplayValue(value.toLocaleString());
    } else {
      setDisplayValue(value); 
    }
  }, [value]);

  if (typeof value === 'number' && displayValue === '...') {
    return <span className="text-lg font-semibold font-code">...</span>;
  }

  return <>{displayValue}</>;
};


export default function StatisticsPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const panelRef = useRef<HTMLDivElement>(null);
  // Default position, will be updated on client if needed by drag
  const [position, setPosition] = useState({ x: 10000, y: 680 }); // Consistent server-renderable value
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position based on window size only on client
     if (typeof window !== 'undefined') {
        setPosition({ x: window.innerWidth - 340, y: 20 + 600 + 20 }); // Assuming ActivityFeedPanel height is 600px and there's a 20px gap
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    // Simulate stats updates
    const interval = setInterval(() => {
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: typeof stat.value === 'number' ? stat.value + Math.floor(Math.random() * 10) - 4 : stat.value
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
        maxHeight: isMinimized ? '60px' : '500px',
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between" data-drag-handle="true" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <div className="flex items-center">
          <BarChart2 className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-lg font-headline">Estatísticas Globais</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-muted-foreground hover:text-foreground">
          {isMinimized ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
        </Button>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4">
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-2 bg-background/50 rounded-md">
                <div className="flex items-center">
                  {stat.icon}
                  <span className="ml-2 text-sm">{stat.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold font-code">
                    <FormattedStatValue value={stat.value} />
                  </p>
                  {stat.trend && (
                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      {getTrendIcon(stat.trend)}
                      <span className="ml-1">{stat.trendValue || ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <CardDescription className="text-xs mb-1 font-code">Densidade de Pixels por Região (Exemplo):</CardDescription>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-0.5"><span>Norte</span><span>75%</span></div>
                <Progress value={75} className="h-2 [&>div]:bg-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5"><span>Centro</span><span>50%</span></div>
                <Progress value={50} className="h-2 [&>div]:bg-accent" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5"><span>Sul</span><span>30%</span></div>
                <Progress value={30} className="h-2 [&>div]:bg-yellow-400" />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
