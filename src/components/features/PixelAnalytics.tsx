'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BarChart3, TrendingUp, TrendingDown, LineChart, PieChart, ArrowUp, ArrowDown,
  Calendar, Clock, Filter, Search, Download, Share2, RefreshCw, Zap, MapPin,
  DollarSign, Users, Eye, Heart, Star, Activity, Coins, Wallet, ShoppingCart,
  Layers, Target, Flame, Crown, Gem, Award, Sparkles, Lightbulb, Info, HelpCircle,
  AlertTriangle, ChevronRight, ChevronDown, ChevronUp, Plus, Minus, Maximize2,
  Minimize2, BarChart, BarChart2, BarChart4, PieChart as PieChartIcon, Percent,
  CreditCard, ArrowUpRight, ArrowDownRight, History, Package, PackageOpen, Globe,
  Map, Compass, Landmark, Building, Home, FileText, FileBarChart, FileBarChart2,
  Presentation, PresentationChart
} from 'lucide-react';

interface MarketTrend {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  period: '24h' | '7d' | '30d';
  icon: React.ReactNode;
  color: string;
}

interface RegionData {
  id: string;
  name: string;
  totalPixels: number;
  soldPixels: number;
  avgPrice: number;
  change24h: number;
  transactions24h: number;
  popularity: number; // 0-100
  color: string;
}

interface PriceHistoryPoint {
  date: Date;
  price: number;
  volume?: number;
}

interface TransactionData {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  coordinates: { x: number; y: number };
  region: string;
  buyer?: string;
  seller?: string;
  timestamp: Date;
}

interface PopularityData {
  id: string;
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

// Mock data
const marketTrends: MarketTrend[] = [
  { 
    id: '1', 
    name: 'Preço Médio', 
    value: 45.75, 
    change: 2.3, 
    changePercent: 5.3, 
    period: '24h',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-primary'
  },
  { 
    id: '2', 
    name: 'Volume de Transações', 
    value: 12450, 
    change: 1250, 
    changePercent: 11.2, 
    period: '24h',
    icon: <Activity className="h-4 w-4" />,
    color: 'text-blue-500'
  },
  { 
    id: '3', 
    name: 'Pixels Vendidos', 
    value: 342, 
    change: -28, 
    changePercent: -7.6, 
    period: '24h',
    icon: <Package className="h-4 w-4" />,
    color: 'text-purple-500'
  },
  { 
    id: '4', 
    name: 'Usuários Ativos', 
    value: 1247, 
    change: 89, 
    changePercent: 7.7, 
    period: '24h',
    icon: <Users className="h-4 w-4" />,
    color: 'text-green-500'
  }
];

const regionData: RegionData[] = [
  { 
    id: '1', 
    name: 'Lisboa', 
    totalPixels: 25000, 
    soldPixels: 8750, 
    avgPrice: 52.30, 
    change24h: 3.2, 
    transactions24h: 87,
    popularity: 85,
    color: '#4CAF50'
  },
  { 
    id: '2', 
    name: 'Porto', 
    totalPixels: 18000, 
    soldPixels: 5400, 
    avgPrice: 48.75, 
    change24h: 2.1, 
    transactions24h: 65,
    popularity: 75,
    color: '#2196F3'
  },
  { 
    id: '3', 
    name: 'Coimbra', 
    totalPixels: 12000, 
    soldPixels: 3000, 
    avgPrice: 42.50, 
    change24h: -1.2, 
    transactions24h: 32,
    popularity: 60,
    color: '#9C27B0'
  },
  { 
    id: '4', 
    name: 'Algarve', 
    totalPixels: 15000, 
    soldPixels: 6000, 
    avgPrice: 55.80, 
    change24h: 5.7, 
    transactions24h: 78,
    popularity: 90,
    color: '#FF9800'
  },
  { 
    id: '5', 
    name: 'Braga', 
    totalPixels: 10000, 
    soldPixels: 2500, 
    avgPrice: 38.25, 
    change24h: 0.8, 
    transactions24h: 28,
    popularity: 55,
    color: '#F44336'
  }
];

const priceHistory: PriceHistoryPoint[] = [
  { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 35.20, volume: 8500 },
  { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), price: 36.50, volume: 9200 },
  { date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000), price: 38.75, volume: 10500 },
  { date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), price: 37.80, volume: 9800 },
  { date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), price: 39.20, volume: 11200 },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 40.50, volume: 12500 },
  { date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), price: 41.75, volume: 13800 },
  { date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), price: 42.30, volume: 14200 },
  { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), price: 43.80, volume: 15500 },
  { date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), price: 42.90, volume: 14800 },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 44.25, volume: 16200 },
  { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), price: 45.50, volume: 17500 },
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), price: 44.80, volume: 16800 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), price: 46.20, volume: 18200 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), price: 47.50, volume: 19500 },
  { date: new Date(), price: 45.75, volume: 18800 }
];

const recentTransactions: TransactionData[] = [
  { 
    id: 't1', 
    type: 'buy', 
    price: 65.50, 
    coordinates: { x: 245, y: 156 }, 
    region: 'Lisboa', 
    buyer: 'PixelMasterPT', 
    seller: 'Sistema', 
    timestamp: new Date(Date.now() - 35 * 60 * 1000) 
  },
  { 
    id: 't2', 
    type: 'sell', 
    price: 48.25, 
    coordinates: { x: 123, y: 89 }, 
    region: 'Porto', 
    buyer: 'ArtCollector', 
    seller: 'ColorWizard', 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
  },
  { 
    id: 't3', 
    type: 'buy', 
    price: 72.00, 
    coordinates: { x: 345, y: 123 }, 
    region: 'Algarve', 
    buyer: 'BeachLover', 
    seller: 'Sistema', 
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) 
  },
  { 
    id: 't4', 
    type: 'buy', 
    price: 42.75, 
    coordinates: { x: 567, y: 234 }, 
    region: 'Coimbra', 
    buyer: 'StudentPixel', 
    seller: 'Sistema', 
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) 
  },
  { 
    id: 't5', 
    type: 'sell', 
    price: 55.30, 
    coordinates: { x: 789, y: 345 }, 
    region: 'Braga', 
    buyer: 'HistoryBuff', 
    seller: 'ArtistaPT', 
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) 
  }
];

const popularityData: PopularityData[] = [
  { 
    id: 'p1', 
    name: 'Visualizações', 
    value: 12450, 
    change: 15.3, 
    icon: <Eye className="h-4 w-4" />,
    color: 'text-blue-500'
  },
  { 
    id: 'p2', 
    name: 'Curtidas', 
    value: 3275, 
    change: 8.7, 
    icon: <Heart className="h-4 w-4" />,
    color: 'text-red-500'
  },
  { 
    id: 'p3', 
    name: 'Favoritos', 
    value: 1850, 
    change: 12.4, 
    icon: <Star className="h-4 w-4" />,
    color: 'text-yellow-500'
  },
  { 
    id: 'p4', 
    name: 'Compartilhamentos', 
    value: 945, 
    change: 5.2, 
    icon: <Share2 className="h-4 w-4" />,
    color: 'text-green-500'
  }
];

interface PixelAnalyticsProps {
  children: React.ReactNode;
}

export default function PixelAnalytics({ children }: PixelAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { toast } = useToast();

  // Update time on open
  useEffect(() => {
    if (isOpen) {
      updateLastUpdated();
    }
  }, [isOpen]);

  const updateLastUpdated = () => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      updateLastUpdated();
      setPlaySuccessSound(true);
      
      toast({
        title: "Dados Atualizados",
        description: "As estatísticas de mercado foram atualizadas com sucesso.",
      });
    }, 1500);
  };

  const handleExportData = () => {
    toast({
      title: "Dados Exportados",
      description: "Os dados de análise foram exportados com sucesso.",
    });
  };

  const handleShareAnalytics = () => {
    toast({
      title: "Link Copiado",
      description: "O link para estas estatísticas foi copiado para a área de transferência.",
    });
  };

  const filteredRegionData = selectedRegion === 'all' 
    ? regionData 
    : regionData.filter(region => region.name === selectedRegion);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `${num.toFixed(2)}€`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffMinutes}m atrás`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Análise de Mercado
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Estatísticas detalhadas e tendências do mercado de pixels
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Atualizado: {lastUpdated || '--:--'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareAnalytics}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { value: '24h', label: 'Últimas 24h', icon: <Clock className="h-4 w-4" /> },
              { value: '7d', label: '7 Dias', icon: <Calendar className="h-4 w-4" /> },
              { value: '30d', label: '30 Dias', icon: <Calendar className="h-4 w-4" /> },
              { value: 'all', label: 'Todo Período', icon: <Maximize2 className="h-4 w-4" /> }
            ].map(range => (
              <Button 
                key={range.value} 
                variant={timeRange === range.value ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeRange(range.value as any)}
                className="text-xs"
              >
                {range.icon}
                <span className="ml-1">{range.label}</span>
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(95vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="regions">Regiões</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="trends">Tendências</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(95vh-200px)]">
              <div className="p-4">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Market Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketTrends.map(trend => (
                      <motion.div whileHover={{ scale: 1.03 }} key={trend.id}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className={cn("p-2 rounded-lg", `${trend.color}/10`)}>
                                {trend.icon}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  trend.change >= 0 
                                    ? "text-green-500 border-green-500/30" 
                                    : "text-red-500 border-red-500/30"
                                )}
                              >
                                {trend.change >= 0 ? (
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(trend.changePercent)}%
                              </Badge>
                            </div>
                            <div>
                              <h3 className="text-sm text-muted-foreground">{trend.name}</h3>
                              <p className={cn("text-2xl font-bold", trend.color)}>
                                {trend.name === 'Preço Médio' ? formatCurrency(trend.value) : formatNumber(trend.value)}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {trend.change >= 0 ? '+' : ''}{trend.change} nas últimas {trend.period}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Price History Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        Histórico de Preços
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-64 relative">
                        {/* Simulated chart */}
                        <div className="absolute inset-0 flex items-end px-4 pb-4">
                          {priceHistory.map((point, index) => {
                            const height = (point.price / 50) * 100; // Scale to percentage
                            return (
                              <motion.div 
                                key={index} 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="flex-1 mx-px bg-primary/30 hover:bg-primary/60 transition-all rounded-t-sm relative group"
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-popover p-2 rounded shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  <div className="font-bold">{formatCurrency(point.price)}</div>
                                  <div className="text-muted-foreground">{formatDate(point.date)}</div>
                                  {point.volume && <div>Vol: {formatNumber(point.volume)}</div>}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* X-axis labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                          <span>{formatDate(priceHistory[0].date)}</span>
                          <span>{formatDate(priceHistory[Math.floor(priceHistory.length / 2)].date)}</span>
                          <span>{formatDate(priceHistory[priceHistory.length - 1].date)}</span>
                        </div>
                        
                        {/* Y-axis labels */}
                        <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                          <span>{formatCurrency(50)}</span>
                          <span>{formatCurrency(40)}</span>
                          <span>{formatCurrency(30)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Insights de Mercado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Oportunidade de Investimento</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            A região do Algarve está mostrando um crescimento de 5.7% no valor dos pixels nas últimas 24 horas. Considere investir nesta área.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Tendência de Usuários</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            O número de usuários ativos aumentou 7.7% nas últimas 24 horas, indicando crescente interesse na plataforma.
                          </p>
                        </div>
                        
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">Alerta de Mercado</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            A venda de pixels em Coimbra diminuiu 1.2%. Monitore esta região para possíveis quedas adicionais de preço.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Atividade Recente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {recentTransactions.slice(0, 3).map(transaction => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              {transaction.type === 'buy' ? (
                                <div className="p-2 rounded-full bg-green-500/20">
                                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                                </div>
                              ) : (
                                <div className="p-2 rounded-full bg-blue-500/20">
                                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {transaction.type === 'buy' ? 'Compra' : 'Venda'} em {transaction.region}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ({transaction.coordinates.x}, {transaction.coordinates.y}) • {formatTimeAgo(transaction.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{formatCurrency(transaction.price)}</p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.type === 'buy' ? 'Comprador' : 'Vendedor'}: {transaction.type === 'buy' ? transaction.buyer : transaction.seller}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab('transactions')}>
                          <History className="h-4 w-4 mr-2" />
                          Ver Todas as Transações
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Popularity Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        Métricas de Popularidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {popularityData.map(item => (
                          <div key={item.id} className="p-4 bg-muted/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className={cn("p-2 rounded-lg", `${item.color}/10`)}>
                                {item.icon}
                              </div>
                              <Badge 
                                variant="outline" 
                                className="text-green-500 border-green-500/30"
                              >
                                <ArrowUp className="h-3 w-3 mr-1" />
                                {item.change}%
                              </Badge>
                            </div>
                            <h3 className="text-sm text-muted-foreground">{item.name}</h3>
                            <p className={cn("text-xl font-bold", item.color)}>
                              {formatNumber(item.value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="regions" className="mt-0 space-y-6">
                  {/* Region Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar regiões..."
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Região" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as Regiões</SelectItem>
                          {regionData.map(region => (
                            <SelectItem key={region.id} value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="price">
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Preço Médio</SelectItem>
                          <SelectItem value="popularity">Popularidade</SelectItem>
                          <SelectItem value="transactions">Transações</SelectItem>
                          <SelectItem value="change">Variação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Region Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRegionData.map(region => (
                      <motion.div whileHover={{ scale: 1.03 }} key={region.id}>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {region.name}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  region.change24h >= 0 
                                    ? "text-green-500 border-green-500/30" 
                                    : "text-red-500 border-red-500/30"
                                )}
                              >
                                {region.change24h >= 0 ? (
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(region.change24h)}%
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Preço Médio</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(region.avgPrice)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Transações (24h)</p>
                                <p className="text-xl font-bold text-blue-500">{region.transactions24h}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Ocupação</span>
                                <span className="font-medium">{Math.round((region.soldPixels / region.totalPixels) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(region.soldPixels / region.totalPixels) * 100} 
                                className="h-2"
                                style={{ '--progress-color': region.color } as React.CSSProperties}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatNumber(region.soldPixels)} vendidos</span>
                                <span>{formatNumber(region.totalPixels)} total</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Popularidade</span>
                                <span className="font-medium">{region.popularity}%</span>
                              </div>
                              <Progress 
                                value={region.popularity} 
                                className="h-2"
                                style={{ '--progress-color': region.color } as React.CSSProperties}
                              />
                            </div>
                            
                            <Button variant="outline" className="w-full">
                              <Maximize2 className="h-4 w-4 mr-2" />
                              Análise Detalhada
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Region Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Comparação de Regiões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Price Comparison */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Preço Médio por Região</h3>
                          <div className="space-y-3">
                            {regionData
                              .sort((a, b) => b.avgPrice - a.avgPrice)
                              .map(region => (
                                <div key={`price-${region.id}`} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{region.name}</span>
                                    <span className="font-medium">{formatCurrency(region.avgPrice)}</span>
                                  </div>
                                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(region.avgPrice / 60) * 100}%` }}
                                      transition={{ duration: 1 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: region.color }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        
                        {/* Transaction Comparison */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Transações (24h) por Região</h3>
                          <div className="space-y-3">
                            {regionData
                              .sort((a, b) => b.transactions24h - a.transactions24h)
                              .map(region => (
                                <div key={`transactions-${region.id}`} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{region.name}</span>
                                    <span className="font-medium">{region.transactions24h}</span>
                                  </div>
                                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(region.transactions24h / 100) * 100}%` }}
                                      transition={{ duration: 1 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: region.color }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-0 space-y-6">
                  {/* Transaction Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar transações..."
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="buy">Compras</SelectItem>
                          <SelectItem value="sell">Vendas</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Região" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {regionData.map(region => (
                            <SelectItem key={region.id} value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Resumo de Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-500/10 rounded-lg text-center">
                          <ShoppingCart className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-500">
                            {recentTransactions.filter(t => t.type === 'buy').length}
                          </p>
                          <p className="text-sm text-muted-foreground">Compras</p>
                        </div>
                        
                        <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                          <ArrowUpRight className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-500">
                            {recentTransactions.filter(t => t.type === 'sell').length}
                          </p>
                          <p className="text-sm text-muted-foreground">Vendas</p>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                          <Coins className="h-6 w-6 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(recentTransactions.reduce((sum, t) => sum + t.price, 0))}
                          </p>
                          <p className="text-sm text-muted-foreground">Volume Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transaction List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Histórico de Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentTransactions.map(transaction => (
                          <motion.div whileHover={{ scale: 1.01 }} key={transaction.id}>
                            <Card className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {transaction.type === 'buy' ? (
                                    <div className="p-2 rounded-full bg-green-500/20">
                                      <ArrowDownRight className="h-5 w-5 text-green-500" />
                                    </div>
                                  ) : (
                                    <div className="p-2 rounded-full bg-blue-500/20">
                                      <ArrowUpRight className="h-5 w-5 text-blue-500" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {transaction.type === 'buy' ? 'Compra' : 'Venda'} em {transaction.region}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Coordenadas: ({transaction.coordinates.x}, {transaction.coordinates.y})
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold text-primary">{formatCurrency(transaction.price)}</p>
                                  <p className="text-xs text-muted-foreground">{formatTimeAgo(transaction.timestamp)}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
                                <div>
                                  {transaction.type === 'buy' ? 'Comprador' : 'Vendedor'}: <span className="font-medium">{transaction.type === 'buy' ? transaction.buyer : transaction.seller}</span>
                                </div>
                                <div>
                                  {transaction.type === 'buy' ? 'Vendedor' : 'Comprador'}: <span className="font-medium">{transaction.type === 'buy' ? transaction.seller : transaction.buyer}</span>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
                  {/* Trend Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Análise de Tendências
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Tendências de Preço</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span>Preço Médio</span>
                              </div>
                              <div className="text-green-500 font-bold">+5.3%</div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span>Pixels Vendidos</span>
                              </div>
                              <div className="text-red-500 font-bold">-7.6%</div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                <span>Volume de Transações</span>
                              </div>
                              <div className="text-blue-500 font-bold">+11.2%</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Tendências de Popularidade</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-purple-500" />
                                <span>Visualizações</span>
                              </div>
                              <div className="text-purple-500 font-bold">+15.3%</div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-pink-500" />
                                <span>Curtidas</span>
                              </div>
                              <div className="text-pink-500 font-bold">+8.7%</div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-yellow-500" />
                                <span>Novos Usuários</span>
                              </div>
                              <div className="text-yellow-500 font-bold">+12.4%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popularity by Region */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                        Popularidade por Região
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 relative flex items-center justify-center">
                          {/* Simulated pie chart */}
                          <div className="w-48 h-48 rounded-full relative overflow-hidden">
                            {regionData.map((region, index) => {
                              const startAngle = index === 0 ? 0 : regionData.slice(0, index).reduce((sum, r) => sum + r.popularity, 0);
                              const angle = (region.popularity / regionData.reduce((sum, r) => sum + r.popularity, 0)) * 360;
                              
                              return (
                                <motion.div 
                                  key={region.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                  className="absolute inset-0 origin-center"
                                  style={{ 
                                    backgroundColor: region.color,
                                    clipPath: `conic-gradient(from ${startAngle}deg, ${region.color} 0deg, ${region.color} ${angle}deg, transparent ${angle}deg, transparent 360deg)`,
                                  }}
                                />
                              );
                            })}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-xs font-medium">
                                Regiões
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {regionData
                            .sort((a, b) => b.popularity - a.popularity)
                            .map(region => (
                              <div key={`pop-${region.id}`} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }}></div>
                                  <span>{region.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{region.popularity}%</span>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      region.change24h >= 0 
                                        ? "text-green-500 border-green-500/30" 
                                        : "text-red-500 border-red-500/30"
                                    )}
                                  >
                                    {region.change24h >= 0 ? (
                                      <ArrowUp className="h-3 w-3 mr-1" />
                                    ) : (
                                      <ArrowDown className="h-3 w-3 mr-1" />
                                    )}
                                    {Math.abs(region.change24h)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Forecast */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Presentation className="h-5 w-5 text-primary" />
                        Previsão de Mercado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/20 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Previsão de Preço (Próximos 7 dias)</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(48.25)}</p>
                            <p className="text-xs text-muted-foreground">Preço médio previsto</p>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            +5.5%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          Baseado nas tendências atuais, espera-se que o preço médio dos pixels continue subindo nos próximos 7 dias.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Regiões em Alta</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Algarve</span>
                              <Badge className="bg-green-500 text-white">+5.7%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Lisboa</span>
                              <Badge className="bg-green-500 text-white">+3.2%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Porto</span>
                              <Badge className="bg-green-500 text-white">+2.1%</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Regiões em Baixa</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span>Coimbra</span>
                              <Badge className="bg-red-500 text-white">-1.2%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-500/10 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium mb-1">Recomendação de Investimento</h3>
                            <p className="text-sm text-muted-foreground">
                              Considere investir em pixels na região do Algarve, que está mostrando o maior crescimento de preço. Para uma estratégia mais conservadora, Lisboa continua sendo uma opção estável com crescimento constante.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Dados atualizados em {lastUpdated || '--:--'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button size="sm" onClick={handleRefreshData} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar Dados
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}