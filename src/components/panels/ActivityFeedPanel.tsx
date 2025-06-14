
// src/components/panels/ActivityFeedPanel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Activity, Minimize2, Maximize2, LogIn, LogOut, ShoppingCart, Palette, Eye, Users, Filter, ArrowRightCircle, Trophy } from 'lucide-react'; // Added Trophy
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


type ActivityItem = {
  id: string;
  type: 'login' | 'logout' | 'purchase' | 'color_change' | 'view' | 'custom' | 'achievement';
  user: { name: string; avatarUrl?: string; dataAiHint?: string };
  timestamp: Date;
  details?: string;
  region?: string;
};

const initialActivities: ActivityItem[] = [
  { id: '1', type: 'login', user: { name: 'PixelAdventurer', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', type: 'purchase', user: { name: 'ArtCollector7', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 12), details: 'Pixel (12,34) em Lisboa', region: 'Lisboa' },
  { id: '3', type: 'color_change', user: { name: 'ColorMaster', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 25), details: 'Pixel (5,8) para #FF0000', region: 'Porto' },
  { id: '4', type: 'view', user: { name: 'ExplorerPro', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 33), details: 'Região Norte' },
  { id: '5', type: 'achievement', user: { name: 'PixelAdventurer', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 40), details: 'Conquista: Primeiro Pixel!' },
  { id: '6', type: 'logout', user: { name: 'PixelAdventurer', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '7', type: 'custom', user: { name: 'ServerBot', dataAiHint: "bot avatar" }, timestamp: new Date(Date.now() - 1000 * 60 * 50), details: 'Evento especial de Verão iniciado!' },
];

const activityIcons = {
  login: <LogIn className="h-4 w-4 text-green-400" />,
  logout: <LogOut className="h-4 w-4 text-red-400" />,
  purchase: <ShoppingCart className="h-4 w-4 text-primary" />,
  color_change: <Palette className="h-4 w-4 text-accent" />,
  view: <Eye className="h-4 w-4 text-blue-400" />,
  custom: <Activity className="h-4 w-4 text-purple-400" />,
  achievement: <Trophy className="h-4 w-4 text-yellow-400" />
};

const activityLabels = {
  login: 'Login',
  logout: 'Logout',
  purchase: 'Compra de Pixel',
  color_change: 'Mudança de Cor',
  view: 'Visualização',
  custom: 'Evento do Sistema',
  achievement: 'Conquista Desbloqueada'
};

const FormattedTimestamp: React.FC<{ timestamp: Date }> = ({ timestamp }) => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    setTimeString(timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    setDateString(timestamp.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  }, [timestamp]);

  if (!timeString || !dateString) {
    return <span className="text-xs text-muted-foreground/70 font-code">Carregando data...</span>;
  }

  return (
    <p className="text-xs text-muted-foreground/80 font-code" title={`${dateString} ${timeString}`}>
      {timeString}
    </p>
  );
};

export default function ActivityFeedPanel() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [filter, setFilter] = useState<'all' | ActivityItem['type']>('all');
  const [onlineUsers, setOnlineUsers] = useState(137); 
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 10000, y: 20 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 340, y: 20 });
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


  const filteredActivities = activities.filter(act => filter === 'all' || act.type === filter);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => Math.max(50, prev + Math.floor(Math.random() * 21) - 10)); 
      const randomActivityTypes: ActivityItem['type'][] = ['login', 'purchase', 'color_change', 'view', 'achievement'];
      const newActivity: ActivityItem = {
        id: String(Date.now()),
        type: randomActivityTypes[Math.floor(Math.random() * randomActivityTypes.length)],
        user: { name: `User${Math.floor(Math.random() * 1000)}`, dataAiHint: "avatar user" },
        timestamp: new Date(),
        details: Math.random() > 0.3 ? `Detalhe aleatório ${Math.floor(Math.random() * 100)}` : undefined,
        region: Math.random() > 0.5 ? ['Norte', 'Centro', 'Sul'][Math.floor(Math.random()*3)] : undefined
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 29)]); 
    }, 8000); // Increased interval for less frequent updates
    return () => clearInterval(interval);
  }, []);


  return (
    <Card
      ref={panelRef}
      className="fixed z-30 w-80 shadow-xl bg-card/80 backdrop-blur-md transition-all duration-300 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: isMinimized ? '60px' : 'calc(100vh - 40px)', // Allow more height
        overflow: 'hidden'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader 
        className="py-3 px-4 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing" 
        data-drag-handle="true" 
      >
        <div className="flex items-center">
          <Activity className="h-6 w-6 mr-2 text-primary" />
          <CardTitle className="text-lg font-headline">Atividade Global</CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-muted-foreground hover:text-foreground">
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
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium font-code">Filtros Rápidos:</h4>
              <Badge variant={filter === 'all' ? "default" : "secondary"} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setFilter('all')}>Todos</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(activityIcons) as ActivityItem['type'][]).map(type => (
                <Button
                  key={type}
                  variant={filter === type ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 py-1 text-xs"
                  onClick={() => setFilter(type)}
                >
                  {React.cloneElement(activityIcons[type], { className: `h-3 w-3 mr-1 ${filter === type ? 'text-secondary-foreground' : 'text-muted-foreground'}` })}
                  {activityLabels[type].split(' ')[0]} {/* Show only first word for brevity */}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)] min-h-[200px] max-h-[450px] p-4"> 
            <div className="space-y-1">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors duration-150 cursor-default"
                >
                  <Avatar className="h-8 w-8 mt-0.5 border-2 border-border">
                    <AvatarImage src={activity.user.avatarUrl || `https://placehold.co/40x40.png?text=${activity.user.name.substring(0,1)}`} alt={activity.user.name} data-ai-hint={activity.user.dataAiHint || "avatar user"}/>
                    <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-primary hover:underline cursor-pointer">{activity.user.name}</span>
                      <span className="text-muted-foreground ml-1">{activityLabels[activity.type].toLowerCase()}</span>
                      {activity.details && <span className="text-muted-foreground text-xs ml-1 font-code">({activity.details})</span>}
                    </p>
                    <FormattedTimestamp timestamp={activity.timestamp} />
                    {activity.region && <Badge variant="outline" className="text-xs mt-1 font-code">Região: {activity.region}</Badge>}
                  </div>
                  <div className="mt-1 text-muted-foreground">{activityIcons[activity.type]}</div>
                </div>
              ))}
              {filteredActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade encontrada para este filtro.</p>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <CardFooter className="p-3 flex justify-between items-center">
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-2 text-green-400" />
              <span className="font-semibold mr-1">{onlineUsers}</span>
              <span className="text-muted-foreground">online</span>
            </div>
            <Button variant="link" size="sm" className="text-xs text-primary hover:text-primary/80">
                Ver Histórico Completo <ArrowRightCircle className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}

