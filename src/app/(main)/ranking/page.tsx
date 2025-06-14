
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChartHorizontalBig, 
  RefreshCw, 
  Globe, 
  MapPin, 
  Target, 
  Users, 
  Eye, 
  Heart, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Map,
  Clock,
  Trophy,
  Medal,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
}

const globalStatsData: StatCardData[] = [
  { title: 'Total de Pixels no Mapa', value: '10,3M', icon: <MapPin className="h-6 w-6" />, tooltip: "Número total de pixels disponíveis no mapa de Portugal." },
  { title: 'Pixels Adquiridos', value: '2,573', icon: <Target className="h-6 w-6" />, trend: { direction: 'up', value: '+12.3%', colorClass: 'text-green-500 border-green-500/50' }, tooltip: "Pixels que já foram comprados por utilizadores." },
  { title: 'Utilizadores Ativos (24h)', value: '1,247', icon: <Users className="h-6 w-6" />, trend: { direction: 'up', value: '+8.7%', colorClass: 'text-green-500 border-green-500/50' }, tooltip: "Utilizadores que estiveram ativos nas últimas 24 horas." },
  { title: 'Visualizações de Perfil (Hoje)', value: '5,892', icon: <Eye className="h-6 w-6" />, trend: { direction: 'up', value: '+15.2%', colorClass: 'text-green-500 border-green-500/50' }, tooltip: "Número de vezes que perfis de utilizador foram visualizados hoje."},
  { title: 'Interações Totais', value: '127K', icon: <Heart className="h-6 w-6" />, trend: { direction: 'up', value: '+23.8%', colorClass: 'text-green-500 border-green-500/50' }, tooltip: "Soma de todas as interações (gostos, comentários, etc.)." },
  { title: 'Valor Médio do Pixel', value: '42,35 Kz', icon: <TrendingUp className="h-6 w-6" />, trend: { direction: 'up', value: '+5.4%', colorClass: 'text-green-500 border-green-500/50' }, tooltip: "Preço médio atual de um pixel no mercado." },
];

const regionalDistributionData = [
  { name: 'Norte', percentage: 35, color: 'var(--chart-1)' },
  { name: 'Centro', percentage: 28, color: 'var(--chart-2)' },
  { name: 'Lisboa e Vale do Tejo', percentage: 22, color: 'var(--chart-3)' },
  { name: 'Alentejo', percentage: 8, color: 'var(--chart-4)' },
  { name: 'Algarve', percentage: 5, color: 'var(--chart-5)' },
  { name: 'Açores', percentage: 1, color: 'hsl(var(--muted))' },
  { name: 'Madeira', percentage: 1, color: 'hsl(var(--muted))' },
];

const userRankingData = [
  { rank: 1, user: "PixelGod", pixels: 5032, score: 125000, avatar: "https://placehold.co/40x40.png?text=PG", dataAiHint: "avatar user" },
  { rank: 2, user: "ArtMaster", pixels: 4500, score: 110000, avatar: "https://placehold.co/40x40.png?text=AM", dataAiHint: "avatar user" },
  { rank: 3, user: "ColorQueen", pixels: 3800, score: 95000, avatar: "https://placehold.co/40x40.png?text=CQ", dataAiHint: "avatar user" },
  { rank: 4, user: "PixelPioneer", pixels: 3200, score: 80000, avatar: "https://placehold.co/40x40.png?text=PP", dataAiHint: "avatar user" },
  { rank: 5, user: "GridGuardian", pixels: 2800, score: 70000, avatar: "https://placehold.co/40x40.png?text=GG", dataAiHint: "avatar user" },
];

const StatDisplayCard: React.FC<StatCardData> = ({ title, value, icon, trend, footer, tooltip }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card-foreground/5 relative group">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="p-2 bg-muted rounded-md text-primary">
            {icon}
        </div>
        {trend && (
          <Badge variant="outline" className={`text-xs ${trend.colorClass} border-current`}>
            {trend.direction === 'up' && <ArrowUp className="h-3 w-3 mr-0.5" />}
            {trend.direction === 'down' && <ArrowDown className="h-3 w-3 mr-0.5" />}
            {trend.value}
          </Badge>
        )}
      </div>
      <p className="text-3xl font-bold font-headline mt-2 text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
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


export default function StatisticsPage() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTimeRange, setActiveTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime(); 
    const intervalId = setInterval(updateTime, 60000); 

    return () => clearInterval(intervalId); 
  }, []);

  const timeRanges: { id: 'day' | 'week' | 'month' | 'year'; label: string }[] = [
    { id: 'day', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'year', label: 'Ano' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 mb-20"> {/* Increased mb for bottom nav space */}
      <Card className="bg-card/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <BarChartHorizontalBig className="h-7 w-7 text-primary" />
            <CardTitle className="font-headline text-2xl">Estatísticas do Universo</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground font-code">Atualizado: {lastUpdated || '--:--'}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 sm:space-x-2 flex-wrap gap-y-2">
            {timeRanges.map(range => (
              <Button 
                key={range.id} 
                variant={activeTimeRange === range.id ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTimeRange(range.id)}
                className="font-code text-xs sm:text-sm px-2 sm:px-3"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Métricas Globais</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalStatsData.map(stat => <StatDisplayCard key={stat.title} {...stat} />)}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-headline">Distribuição Regional de Pixels</CardTitle>
            </div>
             <CardDescription>Percentagem de pixels adquiridos por região.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionalDistributionData.map(region => (
               <div key={region.name}>
                 <div className="flex justify-between text-sm mb-1 font-code">
                   <span className="text-foreground">{region.name}</span>
                   <span className="font-semibold text-primary">{region.percentage}%</span>
                 </div>
                 <Progress value={region.percentage} className="h-2 [&>div]:bg-[var(--progress-color)]" style={{ '--progress-color': region.color } as React.CSSProperties} />
               </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-headline">Atividade por Hora</CardTitle>
            </div>
            <CardDescription>Picos de atividade dos utilizadores ao longo do dia.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground text-sm">Gráfico de atividade por hora (Em Breve).</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Ranking de Usuários</CardTitle>
          </div>
          <CardDescription>Os mestres do Pixel Universe com mais pixels e pontuação.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] font-code">Rank</TableHead>
                <TableHead className="font-code">Usuário</TableHead>
                <TableHead className="text-right font-code">Pixels</TableHead>
                <TableHead className="text-right font-code">Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRankingData.map((entry) => (
                <TableRow key={entry.rank} className="hover:bg-muted/50">
                  <TableCell className="font-semibold">
                    {entry.rank === 1 && <Medal className="inline h-5 w-5 mr-1.5 text-yellow-400" />}
                    {entry.rank === 2 && <Medal className="inline h-5 w-5 mr-1.5 text-gray-400" />}
                    {entry.rank === 3 && <Medal className="inline h-5 w-5 mr-1.5 text-orange-400" />}
                    #{entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3 border-2 border-border">
                        <AvatarImage src={entry.avatar} alt={entry.user} data-ai-hint={entry.dataAiHint} />
                        <AvatarFallback>{entry.user.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{entry.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-code">{entry.pixels.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-code">{entry.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
