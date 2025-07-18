'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore, useSettingsStore } from '@/lib/store';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { 
  BarChartHorizontalBig, RefreshCw, Globe, MapPin, Target, Users, Eye, Heart, 
  TrendingUp, ArrowUp, ArrowDown, Map, Clock, Trophy, Medal, Info, Crown,
  Star, Flame, Zap, Activity, Calendar, Filter, Search, SortAsc, Download,
  Share2, Award, Gem, Sparkles, LineChart, PieChart, BarChart3, TrendingDown,
  ChevronUp, ChevronDown, ExternalLink, Bell, Settings, Gift, Coins, MapPinIcon,
  Lightbulb
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface StatCardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  tooltip?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    colorClass: string; 
  };
  footer?: string;
  change24h?: number;
}

interface LeaderboardEntry {
  rank: number;
  user: string;
  avatar: string;
  dataAiHint?: string;
  pixels: number;
  score: number;
  level: number;
  region: string;
  streak: number;
  change: number;
  badges: string[];
  isVerified: boolean;
  isPremium: boolean;
}

interface RegionData {
  name: string;
  percentage: number;
  color: string;
  pixels: number;
  activeUsers: number;
  avgPrice: number;
  trend: 'up' | 'down' | 'neutral';
}

const globalStatsData: StatCardData[] = [
  { 
    title: 'Total de Pixels no Mapa', 
    value: '10,3M', 
    icon: <MapPin className="h-6 w-6" />, 
    tooltip: "Número total de pixels disponíveis no mapa de Portugal.",
    change24h: 0
  },
  { 
    title: 'Pixels Adquiridos', 
    value: '2.573K', 
    icon: <Target className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+12.3%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Pixels que já foram comprados por utilizadores.",
    change24h: 156
  },
  { 
    title: 'Utilizadores Ativos (24h)', 
    value: '1.247', 
    icon: <Users className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+8.7%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Utilizadores que estiveram ativos nas últimas 24 horas.",
    change24h: 98
  },
  { 
    title: 'Visualizações de Perfil (Hoje)', 
    value: '5.892', 
    icon: <Eye className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+15.2%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Número de vezes que perfis de utilizador foram visualizados hoje.",
    change24h: 782
  },
  { 
    title: 'Interações Totais', 
    value: '127K', 
    icon: <Heart className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+23.8%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Soma de todas as interações (gostos, comentários, etc.).",
    change24h: 2456
  },
  { 
    title: 'Valor Médio do Pixel', 
    value: '42,35€', 
    icon: <TrendingUp className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+5.4%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Preço médio atual de um pixel no mercado.",
    change24h: 2.18
  },
  { 
    title: 'Volume de Transações (24h)', 
    value: '89.2K€', 
    icon: <Activity className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+18.9%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Volume total de transações nas últimas 24 horas.",
    change24h: 14200
  },
  { 
    title: 'Novos Registos (Hoje)', 
    value: '234', 
    icon: <Star className="h-6 w-6" />, 
    trend: { direction: 'up', value: '+7.2%', colorClass: 'text-green-500 border-green-500/50' }, 
    tooltip: "Novos utilizadores registados hoje.",
    change24h: 16
  },
];

const regionalDistributionData: RegionData[] = [
  { name: 'Norte', percentage: 35, color: 'hsl(var(--chart-1))', pixels: 3589, activeUsers: 456, avgPrice: 38.50, trend: 'up' },
  { name: 'Centro', percentage: 28, color: 'hsl(var(--chart-2))', pixels: 2867, activeUsers: 342, avgPrice: 41.20, trend: 'up' },
  { name: 'Lisboa e Vale do Tejo', percentage: 22, color: 'hsl(var(--chart-3))', pixels: 2256, activeUsers: 523, avgPrice: 52.80, trend: 'up' },
  { name: 'Alentejo', percentage: 8, color: 'hsl(var(--chart-4))', pixels: 820, activeUsers: 89, avgPrice: 35.90, trend: 'neutral' },
  { name: 'Algarve', percentage: 5, color: 'hsl(var(--chart-5))', pixels: 513, activeUsers: 167, avgPrice: 48.30, trend: 'up' },
  { name: 'Açores', percentage: 1, color: 'hsl(var(--muted))', pixels: 102, activeUsers: 23, avgPrice: 29.40, trend: 'down' },
  { name: 'Madeira', percentage: 1, color: 'hsl(var(--muted))', pixels: 98, activeUsers: 31, avgPrice: 33.70, trend: 'neutral' },
];

const userRankingData: LeaderboardEntry[] = [
  { 
    rank: 1, user: "PixelGod", pixels: 5032, score: 125000, avatar: "https://placehold.co/40x40.png", 
    dataAiHint: "avatar user", level: 25, region: "Lisboa", streak: 89, change: 2, 
    badges: ["legendary", "verified"], isVerified: true, isPremium: true 
  },
  { 
    rank: 2, user: "ArtMaster", pixels: 4500, score: 110000, avatar: "https://placehold.co/40x40.png", 
    dataAiHint: "avatar user", level: 23, region: "Porto", streak: 67, change: 0, 
    badges: ["epic", "premium"], isVerified: true, isPremium: true 
  },
  { 
    rank: 3, user: "ColorQueen", pixels: 3800, score: 95000, avatar: "https://placehold.co/40x40.png", 
    dataAiHint: "avatar user", level: 21, region: "Coimbra", streak: 45, change: -1, 
    badges: ["rare"], isVerified: false, isPremium: true 
  },
  { 
    rank: 4, user: "PixelPioneer", pixels: 3200, score: 80000, avatar: "https://placehold.co/40x40.png", 
    dataAiHint: "avatar user", level: 19, region: "Braga", streak: 34, change: 1, 
    badges: ["uncommon"], isVerified: true, isPremium: false 
  },
  { 
    rank: 5, user: "GridGuardian", pixels: 2800, score: 70000, avatar: "https://placehold.co/40x40.png", 
    dataAiHint: "avatar user", level: 18, region: "Faro", streak: 28, change: -2, 
    badges: ["common"], isVerified: false, isPremium: false 
  },
];

const StatDisplayCard: React.FC<StatCardData> = ({ title, value, icon, trend, footer, tooltip, change24h }) => (
  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/95 to-primary/5 relative group overflow-hidden card-hover-glow">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardContent className="p-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {trend && (
          <Badge variant="outline" className={`text-xs ${trend.colorClass} border-current animate-pulse`}>
            {trend.direction === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
            {trend.direction === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
            {trend.value}
          </Badge>
        )}
      </div>
      <p className="text-3xl font-bold font-headline mt-2 text-gradient-gold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {change24h !== undefined && (
        <p className="text-xs text-accent mt-2">+{change24h.toLocaleString('pt-PT')} hoje</p>
      )}
      {footer && <p className="text-xs text-muted-foreground/70 mt-1">{footer}</p>}
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="end">
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </CardContent>
  </Card>
);

const FormattedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [formattedValue, setFormattedValue] = useState<string | null>(null);
  useEffect(() => {
    setFormattedValue(value.toLocaleString('pt-PT'));
  }, [value]);

  if (formattedValue === null) {
    return <>...</>;
  }
  return <>{formattedValue}</>;
};

export default function StatisticsPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { addCredits, addXp } = useUserStore();
  const { soundEffects } = useSettingsStore();
  const [activeTimeRange, setActiveTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'pixels' | 'score' | 'level' | 'streak'>('rank');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const { toast } = useToast();
  const [playRewardSound, setPlayRewardSound] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime(); 
    const intervalId = setInterval(updateTime, 60000); 

    return () => clearInterval(intervalId); 
  }, []);

  const timeRanges: { id: 'day' | 'week' | 'month' | 'year'; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Hoje', icon: <Clock className="h-4 w-4" /> },
    { id: 'week', label: 'Semana', icon: <Calendar className="h-4 w-4" /> },
    { id: 'month', label: 'Mês', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'year', label: 'Ano', icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const handleExportData = () => {
    setPlayRewardSound(true);
    toast({
      title: "Dados Exportados",
      description: "Os dados estatísticos foram exportados com sucesso. Recebeu 25 créditos como recompensa!",
    });
    
    // Reward the user for exporting data
    addCredits(25);
    addXp(10);
  };

  const handleShareStats = () => {
    setPlayRewardSound(true);
    toast({
      title: "Estatísticas Partilhadas",
      description: "Link das estatísticas copiado para a área de transferência. Recebeu 50 créditos como recompensa!",
    });
    
    // Reward the user for sharing stats
    addCredits(50);
    addXp(25);
  };

  const filteredRanking = userRankingData
    .filter(user => {
      if (searchQuery && !user.user.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterRegion !== 'all' && user.region !== filterRegion) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'pixels': return b.pixels - a.pixels;
        case 'score': return b.score - a.score;
        case 'level': return b.level - a.level;
        case 'streak': return b.streak - a.streak;
        default: return a.rank - b.rank;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playRewardSound} onEnd={() => setPlayRewardSound(false)} />
      
      <div className="container mx-auto py-6 px-4 space-y-6 mb-20 max-w-7xl"> 
        {/* Enhanced Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold-animated flex items-center">
                  <BarChartHorizontalBig className="h-8 w-8 mr-3 animate-glow" />
                  Estatísticas do Universo
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Análise completa e em tempo real do ecossistema Pixel Universe
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-muted-foreground font-code">
                    Atualizado: {lastUpdated || '--:--'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} className="button-hover-lift">
                  <Download className="h-4 w-4 mr-2 text-green-500" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareStats} className="button-hover-lift">
                  <Share2 className="h-4 w-4 mr-2 text-blue-500" />
                  Partilhar
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors button-hover-lift">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex flex-wrap gap-2 mt-4 animate-fade-in animation-delay-200">
              {timeRanges.map(range => (
                <Button 
                  key={range.id} 
                  variant={activeTimeRange === range.id ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTimeRange(range.id)}
                  className={cn(
                    "font-code text-xs sm:text-sm px-3 py-2 transition-all duration-200 hover:shadow-md",
                    activeTimeRange === range.id ? "shadow-lg scale-105" : "hover:scale-105"
                  )}
                >
                  {range.icon}
                  <span className="ml-2">{range.label}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12 bg-card/50 backdrop-blur-sm shadow-md">
            <TabsTrigger value="overview" className="font-headline">
              <Globe className="h-4 w-4 mr-2"/>
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-headline">
              <Trophy className="h-4 w-4 mr-2"/>
              Classificação
            </TabsTrigger>
            <TabsTrigger value="regions" className="font-headline">
              <Map className="h-4 w-4 mr-2"/>
              Regiões
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-headline">
              <LineChart className="h-4 w-4 mr-2"/>
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Global Metrics Grid */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
              {globalStatsData.map(stat => <StatDisplayCard key={stat.title} {...stat} />)}
            </motion.div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Tendências de Crescimento
                    <Badge variant="outline" className="ml-2 text-xs">Últimos 7 dias</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                      <div className="flex items-center gap-3">
                        <ArrowUp className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Utilizadores Ativos</span>
                      </div>
                      <span className="text-green-500 font-bold">+23.4%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                      <div className="flex items-center gap-3">
                        <ArrowUp className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Volume de Transações</span>
                      </div>
                      <span className="text-blue-500 font-bold">+18.9%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                      <div className="flex items-center gap-3">
                        <ArrowUp className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Novos Registos</span>
                      </div>
                      <span className="text-purple-500 font-bold">+15.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade em Tempo Real
                    <Badge variant="outline" className="ml-2 text-xs">Ao vivo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Pixels comprados (última hora)</span>
                      <span className="font-bold text-primary">47</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Utilizadores online</span>
                      <span className="font-bold text-green-500">1,247</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Transações pendentes</span>
                      <span className="font-bold text-orange-500">23</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Região mais ativa</span>
                      <span className="font-bold text-accent">Lisboa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            {/* Filters */}
            <Card className="card-hover-glow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar utilizadores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortBy(sortBy === 'rank' ? 'pixels' : 'rank')}
                      className="font-code"
                    >
                      <SortAsc className="h-4 w-4 mr-2" />
                      {sortBy === 'rank' ? 'Rank' : 'Pixels'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterRegion(filterRegion === 'all' ? 'Lisboa' : 'all')}
                      className="font-code"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {filterRegion === 'all' ? 'Todas' : filterRegion}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Table */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Trophy className="h-5 w-5 mr-2" />
                  Classificação de Utilizadores
                </CardTitle>
                <CardDescription>Os mestres do Pixel Universe com mais pixels e pontuação.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] font-code">Rank</TableHead>
                        <TableHead className="font-code">Utilizador</TableHead>
                        <TableHead className="text-right font-code">Pixels</TableHead>
                        <TableHead className="text-right font-code">Pontuação</TableHead>
                        <TableHead className="text-right font-code">Nível</TableHead>
                        <TableHead className="text-right font-code">Sequência</TableHead>
                        <TableHead className="text-center font-code">Mudança</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRanking.map((entry) => (
                        <TableRow key={entry.rank} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {entry.rank === 1 && <Crown className="h-5 w-5 text-yellow-400 animate-pulse" />}
                              {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                              {entry.rank === 3 && <Medal className="h-5 w-5 text-orange-400" />}
                              #{entry.rank}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-border">
                                  <AvatarImage src={entry.avatar} alt={entry.user} data-ai-hint={entry.dataAiHint || 'avatar user'} />
                                  <AvatarFallback>{entry.user.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {entry.isPremium && (
                                  <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{entry.user}</span>
                                  {entry.isVerified && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      <Star className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{entry.region}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-code">
                            <FormattedNumber value={entry.pixels} />
                          </TableCell>
                          <TableCell className="text-right font-code">
                            <FormattedNumber value={entry.score} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-code">
                              {entry.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="font-code">{entry.streak}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {entry.change > 0 && (
                              <div className="flex items-center justify-center text-green-500">
                                <ChevronUp className="h-4 w-4" />
                                <span className="text-xs">{entry.change}</span>
                              </div>
                            )}
                            {entry.change < 0 && (
                              <div className="flex items-center justify-center text-red-500">
                                <ChevronDown className="h-4 w-4" />
                                <span className="text-xs">{Math.abs(entry.change)}</span>
                              </div>
                            )}
                            {entry.change === 0 && (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regional Distribution */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição Regional de Pixels
                    <Badge variant="outline" className="ml-2 text-xs">Mapa de Portugal</Badge>
                  </CardTitle>
                  <CardDescription>Percentagem de pixels adquiridos por região.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {regionalDistributionData.map(region => (
                    <div key={region.name} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">{region.name}</span>
                          {region.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
                          {region.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
                        </div>
                        <span className="font-semibold text-primary">{region.percentage}%</span>
                      </div>
                      <Progress 
                        value={region.percentage} 
                        className="h-3 [&>div]:transition-all [&>div]:duration-500" 
                        style={{ '--progress-color': region.color } as React.CSSProperties} 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{region.pixels.toLocaleString('pt-PT')} pixels</span>
                        <span>{region.activeUsers} utilizadores ativos</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Regional Performance */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Regional
                    <Badge variant="outline" className="ml-2 text-xs">Análise Detalhada</Badge>
                  </CardTitle>
                  <CardDescription>Métricas detalhadas por região.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {regionalDistributionData.map(region => (
                        <Card key={region.name} className="p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg">{region.name}</h4>
                            <Badge 
                              variant={region.trend === 'up' ? 'default' : region.trend === 'down' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {region.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                              {region.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                              {region.trend === 'neutral' && <Activity className="h-3 w-3 mr-1" />}
                              {region.trend}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Pixels</p>
                              <p className="font-bold text-primary">{region.pixels.toLocaleString('pt-PT')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Utilizadores</p>
                              <p className="font-bold text-accent">{region.activeUsers}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Preço Médio</p>
                              <p className="font-bold text-green-500">{region.avgPrice.toFixed(2)}€</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quota</p>
                              <p className="font-bold text-purple-500">{region.percentage}%</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Trends */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <LineChart className="h-5 w-5 mr-2" />
                    Tendências de Mercado
                    <Badge variant="outline" className="ml-2 text-xs">Análise de Preços</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráficos de tendências em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Engagement */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Activity className="h-5 w-5 mr-2" />
                    Engagement dos Utilizadores
                    <Badge variant="outline" className="ml-2 text-xs">Métricas de Uso</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10">
                    <span className="font-medium">Taxa de Retenção (7 dias)</span>
                    <span className="text-blue-500 font-bold">78.4%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                    <span className="font-medium">Sessões por Utilizador</span>
                    <span className="text-green-500 font-bold">4.2</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10">
                    <span className="font-medium">Tempo Médio de Sessão</span>
                    <span className="text-purple-500 font-bold">12m 34s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10">
                    <span className="font-medium">Taxa de Conversão</span>
                    <span className="text-orange-500 font-bold">23.7%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Análise Detalhada
                  <Badge variant="outline" className="ml-2 text-xs">Insights Avançados</Badge>
                </CardTitle>
                <CardDescription>
                  Métricas avançadas e insights do comportamento dos utilizadores.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Dashboard de análise avançada em desenvolvimento.
                  </p>
                  <Button variant="outline" disabled>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* New Section: Data Insights */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Insights e Recomendações
            </CardTitle>
            <CardDescription>
              Análises personalizadas baseadas nos dados do Pixel Universe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Oportunidades de Investimento
                </h3>
                <p className="text-sm text-muted-foreground">
                  A região do Algarve está mostrando um crescimento de 23% no valor dos pixels nas últimas semanas. Considere investir nesta área.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  Tendências de Comunidade
                </h3>
                <p className="text-sm text-muted-foreground">
                  Projetos colaborativos estão ganhando popularidade, com um aumento de 45% na participação. Considere iniciar ou juntar-se a um.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  Eventos Próximos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Um grande concurso de pixel art está programado para o próximo mês. Prepare-se para participar e aumentar sua visibilidade.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório Completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}