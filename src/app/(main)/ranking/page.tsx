
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
  Medal
} from "lucide-react";

interface StatCardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    colorClass: string; 
  };
  footer?: string;
}

const globalStatsData: StatCardData[] = [
  { title: 'Total de Pixels', value: '15,420', icon: <MapPin className="h-6 w-6" />, trend: { direction: 'up', value: '+2.5%', colorClass: 'text-green-500 border-green-500/50' } },
  { title: 'Pixels Comprados', value: '2,573', icon: <Target className="h-6 w-6" />, trend: { direction: 'up', value: '+12.3%', colorClass: 'text-green-500 border-green-500/50' } },
  { title: 'Utilizadores Ativos', value: '1,247', icon: <Users className="h-6 w-6" />, trend: { direction: 'up', value: '+8.7%', colorClass: 'text-green-500 border-green-500/50' } },
  { title: 'Visualizações Hoje', value: '45,892', icon: <Eye className="h-6 w-6" />, trend: { direction: 'up', value: '+15.2%', colorClass: 'text-green-500 border-green-500/50' } },
  { title: 'Gostos Totais', value: '127,456', icon: <Heart className="h-6 w-6" />, trend: { direction: 'up', value: '+23.8%', colorClass: 'text-green-500 border-green-500/50' } },
  { title: 'Valor do Mercado', value: '42,350Kz', icon: <TrendingUp className="h-6 w-6" />, trend: { direction: 'up', value: '+5.4%', colorClass: 'text-green-500 border-green-500/50' } },
];

const regionalDistributionData = [
  { name: 'Norte', percentage: 75, color: 'var(--chart-1)' },
  { name: 'Centro', percentage: 50, color: 'var(--chart-2)' },
  { name: 'Sul', percentage: 30, color: 'var(--chart-3)' },
  { name: 'Ilhas', percentage: 45, color: 'var(--chart-4)' },
];

const userRankingData = [
  { rank: 1, user: "PixelGod", pixels: 5032, score: 125000, avatar: "https://placehold.co/40x40.png?text=PG" },
  { rank: 2, user: "ArtMaster", pixels: 4500, score: 110000, avatar: "https://placehold.co/40x40.png?text=AM" },
  { rank: 3, user: "ColorQueen", pixels: 3800, score: 95000, avatar: "https://placehold.co/40x40.png?text=CQ" },
  { rank: 4, user: "PixelPioneer", pixels: 3200, score: 80000, avatar: "https://placehold.co/40x40.png?text=PP" },
  { rank: 5, user: "GridGuardian", pixels: 2800, score: 70000, avatar: "https://placehold.co/40x40.png?text=GG" },
];

const StatDisplayCard: React.FC<StatCardData> = ({ title, value, icon, trend, footer }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card-foreground/5">
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
    <div className="container mx-auto py-8 px-4 space-y-6 mb-16"> {/* Added mb-16 for bottom nav space */}
      {/* Header Card */}
      <Card className="bg-card-foreground/5">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-3">
            <BarChartHorizontalBig className="h-7 w-7 text-primary" />
            <CardTitle className="font-headline text-2xl">Estatísticas</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-xs text-muted-foreground font-code">Atualizado: {lastUpdated || '--:--'}</p>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            {timeRanges.map(range => (
              <Button 
                key={range.id} 
                variant={activeTimeRange === range.id ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTimeRange(range.id)}
                className="font-code"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Stats Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Estatísticas Globais</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalStatsData.map(stat => <StatDisplayCard key={stat.title} {...stat} />)}
          </div>
        </CardContent>
      </Card>
      
      {/* Regional Distribution Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Distribuição Regional de Pixels</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {regionalDistributionData.map(region => (
             <div key={region.name}>
               <div className="flex justify-between text-sm mb-1 font-code">
                 <span>{region.name}</span>
                 <span className="font-semibold">{region.percentage}%</span>
               </div>
               <Progress value={region.percentage} className="h-2" style={{ '--tw-progress-bar-color': region.color } as React.CSSProperties} />
             </div>
          ))}
        </CardContent>
      </Card>

      {/* Hourly Activity Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Atividade por Hora</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Gráfico de atividade por hora (Em breve).</p>
        </CardContent>
      </Card>

      {/* User Ranking Section */}
      <Card>
        <CardHeader>
           <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-headline">Ranking de Usuários</CardTitle>
          </div>
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
                <TableRow key={entry.rank}>
                  <TableCell className="font-semibold">
                    {entry.rank === 1 && <Medal className="inline h-5 w-5 mr-1 text-yellow-400" />}
                    {entry.rank === 2 && <Medal className="inline h-5 w-5 mr-1 text-gray-400" />} {/* Using gray as silver isn't in lucide */}
                    {entry.rank === 3 && <Medal className="inline h-5 w-5 mr-1 text-orange-400" />} {/* Using orange as bronze */}
                    #{entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={entry.avatar} alt={entry.user} data-ai-hint="avatar user" />
                        <AvatarFallback>{entry.user.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {entry.user}
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

