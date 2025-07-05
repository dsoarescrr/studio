
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Activity,
  BarChart2,
  Users,
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
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

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
  purchase: 'Compra',
  color_change: 'Edição de Cor',
  view: 'Visualização',
  custom: 'Evento',
  achievement: 'Conquista'
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
  { label: 'Pixels Comprados', value: 12543, icon: <Package className="h-4 w-4 text-primary" />, trend: 'up', trendValue: '+5%', tooltip: "Total de pixels que já foram adquiridos por utilizadores." },
  { label: 'Pixels Livres', value: 8745723, icon: <PackageOpen className="h-4 w-4 text-green-400" />, trend: 'down', trendValue: '-0.2%', tooltip: "Total de pixels ainda disponíveis para compra no mapa."},
  { label: 'Utilizadores Ativos (24h)', value: 342, icon: <Users2 className="h-4 w-4 text-accent" />, trend: 'neutral', tooltip: "Utilizadores que interagiram com a plataforma nas últimas 24 horas." },
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
  if (displayValue === null) return <span className="text-md font-semibold font-code">...</span>;
  return <>{displayValue}</>;
};

export default function MapSidebar() {
  // State from ActivityFeedPanel
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [onlineUsers, setOnlineUsers] = useState(137);

  // State from StatisticsPanel
  const [stats, setStats] = useState<StatItem[]>(initialStats);

  // Effects from panels
  useEffect(() => {
    const activityInterval = setInterval(() => {
      setOnlineUsers(prev => Math.max(50, prev + Math.floor(Math.random() * 21) - 10));
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
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: typeof stat.value === 'number' ? stat.value + Math.floor(Math.random() * (stat.label === 'Pixels Livres' ? 100 : 10)) - (stat.label === 'Pixels Livres' ? 40 : 4) : stat.value
      })));
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
    <Sidebar>
      <SidebarHeader>
        <SidebarTrigger />
        <CardTitle className="font-headline text-lg group-data-[collapsible=icon]:hidden">
          Painel de Controlo
        </CardTitle>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full p-3">
          {/* Stats Section */}
          <div className="space-y-3 mb-6">
            <h3 className="text-md font-headline flex items-center text-primary px-1 group-data-[collapsible=icon]:hidden">
              <BarChart2 className="mr-2 h-4 w-4" /> Estatísticas
            </h3>
            <div className="flex justify-between items-center text-sm px-1 group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center text-green-400">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-semibold mr-1">{onlineUsers}</span>
                  <span className="text-muted-foreground group-data-[collapsible=icon]:hidden">online</span>
              </div>
              <Badge variant="outline" className="font-code text-xs group-data-[collapsible=icon]:hidden">Global</Badge>
            </div>
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card-foreground/5 relative group p-3">
                  <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
                      <div className="flex items-center group-data-[collapsible=icon]:flex-col">
                          <div className="p-1.5 bg-muted rounded-md mr-2 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:mb-1">{stat.icon}</div>
                          <span className="ml-1 text-sm text-foreground group-data-[collapsible=icon]:hidden">{stat.label}</span>
                      </div>
                      <div className="text-right group-data-[collapsible=icon]:text-center">
                          <p className="text-md font-semibold font-code text-primary">
                              <FormattedStatValue value={stat.value} />
                          </p>
                          {stat.trend && (
                              <div className="flex items-center justify-end text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                              {getTrendIcon(stat.trend)}
                              <span className="ml-1">{stat.trendValue || ''}</span>
                              </div>
                          )}
                      </div>
                  </div>
              </Card>
            ))}
             <Card className="bg-card-foreground/5 p-3 group-data-[collapsible=icon]:hidden">
                <CardDescription className="text-xs mb-1 font-code">Densidade de Pixels:</CardDescription>
                <div className="space-y-1.5">
                    <div>
                        <div className="flex justify-between text-xs mb-0.5 font-code"><span>Norte</span><span className="text-primary">75%</span></div>
                        <Progress value={75} className="h-1.5 [&>div]:bg-primary" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-0.5 font-code"><span>Centro</span><span className="text-accent">50%</span></div>
                        <Progress value={50} className="h-1.5 [&>div]:bg-accent" />
                    </div>
                </div>
            </Card>
          </div>
          
          {/* Activity Section */}
          <div className="space-y-1">
            <h3 className="text-md font-headline flex items-center text-primary px-1 mb-2 group-data-[collapsible=icon]:hidden">
              <Activity className="mr-2 h-4 w-4" /> Atividade Global
            </h3>
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/60">
                <Avatar className="h-8 w-8 mt-0.5 border-2 border-border">
                  <AvatarImage src={activity.user.avatarUrl || `https://placehold.co/40x40.png?text=${activity.user.name.substring(0,1)}`} alt={activity.user.name} data-ai-hint={activity.user.dataAiHint || "avatar user"}/>
                  <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm leading-tight">
                    <span className="font-semibold text-primary">{activity.user.name}</span>
                    <span className="text-muted-foreground ml-1 text-xs">{activityLabels[activity.type].toLowerCase()}</span>
                  </p>
                  {activity.details && <p className="text-xs text-muted-foreground font-code -mt-0.5">{activity.details}</p>}
                  <FormattedTimestamp timestamp={activity.timestamp} />
                </div>
                <div className="mt-1 text-muted-foreground group-data-[collapsible=icon]:hidden">{activityIcons[activity.type]}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
