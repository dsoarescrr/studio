
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  LogIn,
  LogOut,
  ShoppingCart,
  Palette,
  Eye,
  Trophy,
  Package,
  PackageOpen,
  Users2,
  Grid3X3,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Types and data from ActivityFeedPanel
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
  { id: '4', type: 'achievement', user: { name: 'PixelAdventurer', dataAiHint: "avatar user" }, timestamp: new Date(Date.now() - 1000 * 60 * 40), details: 'Conquista: Primeiro Pixel!' },
];

const activityIcons = {
  login: <LogIn className="h-3.5 w-3.5 text-green-400" />,
  logout: <LogOut className="h-3.5 w-3.5 text-red-400" />,
  purchase: <ShoppingCart className="h-3.5 w-3.5 text-primary" />,
  color_change: <Palette className="h-3.5 w-3.5 text-accent" />,
  view: <Eye className="h-3.5 w-3.5 text-blue-400" />,
  custom: <Activity className="h-3.5 w-3.5 text-purple-400" />,
  achievement: <Trophy className="h-3.5 w-3.5 text-yellow-400" />
};

const activityLabels = {
  login: 'Iniciou sessão',
  logout: 'Terminou sessão',
  purchase: 'Comprou um pixel',
  color_change: 'Editou uma cor',
  view: 'Visualizou uma área',
  custom: 'Evento na comunidade',
  achievement: 'Desbloqueou uma conquista'
};


// Types and data from StatisticsPanel
type StatItem = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tooltip?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

const initialStats: StatItem[] = [
  { label: 'Utilizadores Online', value: 137, icon: <Users2 className="h-4 w-4 text-green-400" />, trend: 'neutral', tooltip: "Utilizadores atualmente na plataforma." },
  { label: 'Pixels Comprados', value: 12543, icon: <Package className="h-4 w-4 text-primary" />, trend: 'up', trendValue: '+5%', tooltip: "Total de pixels que já foram adquiridos." },
  { label: 'Pixels Livres', value: 8745723, icon: <PackageOpen className="h-4 w-4 text-accent" />, trend: 'down', trendValue: '-0.2%', tooltip: "Total de pixels ainda disponíveis para compra."},
];


// Helper Components
const FormattedTimestamp: React.FC<{ timestamp: Date }> = ({ timestamp }) => {
  const [timeString, setTimeString] = useState<string>('');
  useEffect(() => {
    setTimeString(timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
  }, [timestamp]);

  if (!timeString) return null;
  return <p className="text-xs text-muted-foreground/80 font-code">{timeString}</p>;
};

const FormattedStatValue: React.FC<{ value: number | string }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState<string | number | null>(null);
  useEffect(() => {
    setDisplayValue(typeof value === 'number' ? value.toLocaleString('pt-PT') : value);
  }, [value]);
  if (displayValue === null) return <span className="font-mono text-sm font-semibold">...</span>;
  return <>{displayValue}</>;
};

export default function MapSidebar() {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const activityInterval = setInterval(() => {
      const randomActivityTypes: ActivityItem['type'][] = ['login', 'purchase', 'color_change', 'view', 'achievement'];
      const newActivity: ActivityItem = {
        id: String(Date.now()),
        type: randomActivityTypes[Math.floor(Math.random() * randomActivityTypes.length)],
        user: { name: `User${Math.floor(Math.random() * 1000)}`, dataAiHint: "avatar user" },
        timestamp: new Date(),
        details: Math.random() > 0.3 ? `Detalhe aleatório ${Math.floor(Math.random() * 100)}` : undefined,
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }, 8000);

    const statsInterval = setInterval(() => {
      setStats(prevStats => prevStats.map(stat => {
        if (typeof stat.value !== 'number') return stat;
        
        let change = 0;
        if (stat.label === 'Utilizadores Online') {
           change = Math.floor(Math.random() * 11) - 5; 
        } else if (stat.label === 'Pixels Livres') {
            change = (Math.floor(Math.random() * 100) - 40) * -1;
        } else {
            change = Math.floor(Math.random() * 10);
        }
        
        const newValue = stat.label === 'Utilizadores Online' 
          ? Math.max(50, stat.value + change) 
          : stat.value + change;
        
        return { ...stat, value: newValue };
      }));
    }, 7000);

    return () => {
      clearInterval(activityInterval);
      clearInterval(statsInterval);
    };
  }, []);
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Sidebar collapsible="icon" className="animate-slide-in-up">
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <SidebarTrigger className="button-hover-lift" />
          <div className="relative group-data-[collapsible=icon]:hidden">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>
        <p className="font-headline text-lg group-data-[collapsible=icon]:hidden text-gradient-gold">
          Painel de Controlo
        </p>
      </SidebarHeader>
      <SidebarContent className="animate-fade-in animation-delay-200">
        <ScrollArea className="h-full p-2 group-data-[collapsible=icon]:p-1">
          {/* Stats Section */}
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground px-2 mb-1 group-data-[collapsible=icon]:hidden flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-primary" />
              Estatísticas
            </h3>
            {stats.map((stat) => (
              <TooltipProvider key={stat.label} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-start h-9 rounded-md hover:bg-muted/60 cursor-default px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-200 hover:scale-105 card-hover-glow">
                      <div className="flex-shrink-0 animate-pulse-slow">{stat.icon}</div>
                      <div className="ml-2.5 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium truncate">{stat.label}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        <p className="font-mono text-sm font-semibold text-primary animate-glow">
                           <FormattedStatValue value={stat.value} />
                        </p>
                        <div className="animate-bounce-slow">
                          {getTrendIcon(stat.trend)}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <div className="flex flex-col gap-1 text-center card-glass">
                      <p className="font-semibold">{stat.label}</p>
                      <p className="text-lg font-bold text-primary text-glow"><FormattedStatValue value={stat.value} /></p>
                      {stat.tooltip && <p className="text-xs text-muted-foreground">{stat.tooltip}</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <div className="px-2 py-1 group-data-[collapsible=icon]:hidden animate-fade-in animation-delay-300">
            <div className="bg-card-foreground/5 p-3 rounded-lg mt-2 space-y-2 card-hover-glow">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center">
                <Grid3X3 className="h-3 w-3 mr-1 text-primary" />
                Densidade de Pixels
              </h4>
              <div>
                  <div className="flex justify-between text-xs mb-0.5 font-code"><span>Norte</span><span className="text-primary">75%</span></div>
                  <Progress value={75} className="h-1.5 [&>div]:bg-primary animate-glow" />
              </div>
              <div>
                  <div className="flex justify-between text-xs mb-0.5 font-code"><span>Centro</span><span className="text-accent">50%</span></div>
                  <Progress value={50} className="h-1.5 [&>div]:bg-accent animate-glow" />
              </div>
            </div>
          </div>

          <SidebarSeparator className="my-3 bg-primary/20" />

          {/* Activity Section */}
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground px-2 mb-2 group-data-[collapsible=icon]:hidden flex items-center">
              <Activity className="h-3 w-3 mr-1 text-primary animate-pulse" />
              Atividade Global
            </h3>
            {activities.map((activity) => (
              <TooltipProvider key={activity.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center h-10 rounded-md hover:bg-muted/60 cursor-default px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center transition-all duration-200 hover:scale-105 card-hover-glow animate-fade-in">
                        <div className="relative">
                          <Avatar className="h-8 w-8 border-2 border-border animate-glow">
                            <AvatarImage src={activity.user.avatarUrl || `https://placehold.co/40x40.png?text=${activity.user.name.substring(0,1)}`} alt={activity.user.name} data-ai-hint={activity.user.dataAiHint || "avatar user"}/>
                            <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-1 -right-1 p-0.5 bg-background rounded-full animate-bounce-slow">
                            {activityIcons[activity.type]}
                          </span>
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                          <p className="text-sm leading-tight truncate">
                            <span className="font-semibold text-primary text-glow">{activity.user.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground font-code truncate">
                            {activityLabels[activity.type]}
                          </p>
                        </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                      <div className="card-glass">
                        <p><span className="font-semibold text-primary">{activity.user.name}</span> {activityLabels[activity.type].toLowerCase()}.</p>
                      </div>
                      {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
