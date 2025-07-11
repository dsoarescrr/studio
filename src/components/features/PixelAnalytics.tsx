
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, 
  ArrowUp, ArrowDown, Calendar, Clock, Filter, Search, 
  Download, Share2, Printer, RefreshCw, MapPin, Users, 
  Eye, Heart, DollarSign, Zap, Activity, Target, Flame, 
  Crown, Gem, Star, Info, HelpCircle, Lightbulb, Coins,
  Sparkles, ChevronRight, ChevronDown, ChevronUp, Maximize2,
  Minimize2, Settings, AlertTriangle, CheckCircle, XCircle,
  Layers, Map, Globe, Compass, Package, PackageOpen, ShoppingCart, Bell, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';
type ChartType = 'line' | 'bar' | 'pie' | 'area';
type MetricType = 'views' | 'purchases' | 'sales' | 'revenue' | 'engagement' | 'users';
type RegionData = {
  name: string;
  pixels: number;
  sales: number;
  views: number;
  avgPrice: number;
  trend: 'up' | 'down' | 'neutral';
};

// Mock Data
const mockRegionalData: RegionData[] = [
  { name: 'Lisboa', pixels: 3589, sales: 245, views: 12500, avgPrice: 52.80, trend: 'up' },
  { name: 'Porto', pixels: 2867, sales: 198, views: 9800, avgPrice: 48.30, trend: 'up' },
  { name: 'Coimbra', pixels: 1245, sales: 87, views: 5400, avgPrice: 42.50, trend: 'neutral' },
  { name: 'Braga', pixels: 980, sales: 65, views: 4200, avgPrice: 39.90, trend: 'up' },
  { name: 'Faro', pixels: 820, sales: 72, views: 3800, avgPrice: 45.20, trend: 'up' },
  { name: 'Setúbal', pixels: 650, sales: 43, views: 2900, avgPrice: 38.60, trend: 'down' },
  { name: 'Aveiro', pixels: 520, sales: 38, views: 2300, avgPrice: 36.40, trend: 'neutral' },
];

const mockTimeSeriesData = {
  views: [
    { date: '2025-01-01', value: 1200 },
    { date: '2025-01-02', value: 1350 },
    { date: '2025-01-03', value: 1100 },
    { date: '2025-01-04', value: 1450 },
    { date: '2025-01-05', value: 1600 },
    { date: '2025-01-06', value: 1800 },
    { date: '2025-01-07', value: 2000 },
    { date: '2025-01-08', value: 1900 },
    { date: '2025-01-09', value: 2100 },
    { date: '2025-01-10', value: 2300 },
    { date: '2025-01-11', value: 2500 },
    { date: '2025-01-12', value: 2400 },
    { date: '2025-01-13', value: 2600 },
    { date: '2025-01-14', value: 2800 },
  ],
  purchases: [
    { date: '2025-01-01', value: 45 },
    { date: '2025-01-02', value: 52 },
    { date: '2025-01-03', value: 38 },
    { date: '2025-01-04', value: 65 },
    { date: '2025-01-05', value: 72 },
    { date: '2025-01-06', value: 58 },
    { date: '2025-01-07', value: 80 },
    { date: '2025-01-08', value: 75 },
    { date: '2025-01-09', value: 90 },
    { date: '2025-01-10', value: 85 },
    { date: '2025-01-11', value: 95 },
    { date: '2025-01-12', value: 88 },
    { date: '2025-01-13', value: 102 },
    { date: '2025-01-14', value: 110 },
  ],
  sales: [
    { date: '2025-01-01', value: 12 },
    { date: '2025-01-02', value: 15 },
    { date: '2025-01-03', value: 10 },
    { date: '2025-01-04', value: 18 },
    { date: '2025-01-05', value: 22 },
    { date: '2025-01-06', value: 16 },
    { date: '2025-01-07', value: 25 },
    { date: '2025-01-08', value: 20 },
    { date: '2025-01-09', value: 28 },
    { date: '2025-01-10', value: 24 },
    { date: '2025-01-11', value: 30 },
    { date: '2025-01-12', value: 26 },
    { date: '2025-01-13', value: 32 },
    { date: '2025-01-14', value: 35 },
  ],
  revenue: [
    { date: '2025-01-01', value: 580 },
    { date: '2025-01-02', value: 720 },
    { date: '2025-01-03', value: 490 },
    { date: '2025-01-04', value: 850 },
    { date: '2025-01-05', value: 1050 },
    { date: '2025-01-06', value: 780 },
    { date: '2025-01-07', value: 1200 },
    { date: '2025-01-08', value: 950 },
    { date: '2025-01-09', value: 1350 },
    { date: '2025-01-10', value: 1150 },
    { date: '2025-01-11', value: 1450 },
    { date: '2025-01-12', value: 1250 },
    { date: '2025-01-13', value: 1550 },
    { date: '2025-01-14', value: 1680 },
  ],
};

const mockPopularityData = [
  { region: 'Lisboa', popularity: 85 },
  { region: 'Porto', popularity: 78 },
  { region: 'Algarve', popularity: 72 },
  { region: 'Coimbra', popularity: 65 },
  { region: 'Braga', popularity: 60 },
  { region: 'Madeira', popularity: 58 },
  { region: 'Açores', popularity: 55 },
  { region: 'Setúbal', popularity: 52 },
  { region: 'Aveiro', popularity: 48 },
  { region: 'Évora', popularity: 45 },
];

const mockPriceRanges = [
  { range: '0-25€', count: 3450 },
  { range: '26-50€', count: 5230 },
  { range: '51-100€', count: 2780 },
  { range: '101-200€', count: 1250 },
  { range: '201-500€', count: 580 },
  { range: '501+€', count: 210 },
];

const mockRarityDistribution = [
  { rarity: 'Comum', percentage: 65 },
  { rarity: 'Incomum', percentage: 20 },
  { rarity: 'Raro', percentage: 10 },
  { rarity: 'Épico', percentage: 4 },
  { rarity: 'Lendário', percentage: 1 },
];

const mockMarketInsights = [
  {
    title: 'Pixels em Alta',
    description: 'A região de Lisboa está mostrando um aumento de 23% no valor dos pixels nas últimas semanas.',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    action: 'Explorar Região',
  },
  {
    title: 'Oportunidade de Investimento',
    description: 'Pixels na região do Algarve estão subvalorizados em comparação com regiões similares.',
    icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    action: 'Analisar Oportunidade',
  },
  {
    title: 'Tendência de Mercado',
    description: 'Pixels raros tiveram um aumento médio de 15% no valor nas últimas 4 semanas.',
    icon: <Activity className="h-5 w-5 text-blue-500" />,
    action: 'Ver Detalhes',
  },
];

// Helper Components
const TrendIndicator = ({ trend, value }: { trend: 'up' | 'down' | 'neutral'; value?: string }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center text-green-500">
        <ArrowUp className="h-4 w-4 mr-1" />
        {value && <span>{value}</span>}
      </div>
    );
  } else if (trend === 'down') {
    return (
      <div className="flex items-center text-red-500">
        <ArrowDown className="h-4 w-4 mr-1" />
        {value && <span>{value}</span>}
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-muted-foreground">
        <span>—</span>
        {value && <span className="ml-1">{value}</span>}
      </div>
    );
  }
};

interface PixelAnalyticsProps {
  children: React.ReactNode;
}

// Component for the Calculator icon since it's not in lucide-react by default
const Calculator = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="8" y1="12" x2="8" y2="12"></line>
    <line x1="12" y1="12" x2="12" y2="12"></line>
    <line x1="16" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="12" y1="16" x2="12" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);


export default function PixelAnalytics({ children }: PixelAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
  }, []);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
      toast({
        title: "Dados Atualizados",
        description: "As estatísticas foram atualizadas com sucesso.",
      });
    }, 1500);
  };

  const handleExportData = () => {
    toast({
      title: "Exportação Iniciada",
      description: "Os dados estão sendo exportados para CSV.",
    });
  };

  const handleRegionClick = (region: string) => {
    setSelectedRegion(region);
    toast({
      title: "Região Selecionada",
      description: `Analisando dados para a região de ${region}.`,
    });
  };

  // Calculate statistics
  const totalPixels = mockRegionalData.reduce((sum, region) => sum + region.pixels, 0);
  const totalSales = mockRegionalData.reduce((sum, region) => sum + region.sales, 0);
  const totalViews = mockRegionalData.reduce((sum, region) => sum + region.views, 0);
  const avgPrice = mockRegionalData.reduce((sum, region) => sum + (region.avgPrice * region.sales), 0) / totalSales;

  // Get current metric data
  const currentMetricData = mockTimeSeriesData[selectedMetric] || mockTimeSeriesData.views;
  
  // Calculate trend
  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return { trend: 'neutral', percentage: '0%' };
    
    const lastValue = data[data.length - 1].value;
    const previousValue = data[data.length - 2].value;
    const difference = lastValue - previousValue;
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
    
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: `${Math.abs(percentage).toFixed(1)}%`
    };
  };
  
  const metricTrend = calculateTrend(currentMetricData);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <DialogTitle className="font-headline text-2xl text-gradient-gold flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 animate-glow" />
                  Análise de Mercado
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  Estatísticas detalhadas e insights sobre o mercado de pixels
                </DialogDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-muted-foreground font-code">
                    Atualizado: {lastUpdated || '--:--'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'day', label: 'Hoje', icon: <Clock className="h-4 w-4" /> },
                { id: 'week', label: 'Semana', icon: <Calendar className="h-4 w-4" /> },
                { id: 'month', label: 'Mês', icon: <Calendar className="h-4 w-4" /> },
                { id: 'year', label: 'Ano', icon: <Calendar className="h-4 w-4" /> },
                { id: 'all', label: 'Todo o Período', icon: <Calendar className="h-4 w-4" /> }
              ].map((range) => (
                <Button 
                  key={range.id} 
                  variant={timeRange === range.id ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange(range.id as TimeRange)}
                  className="font-code text-xs sm:text-sm"
                >
                  {range.icon}
                  <span className="ml-2">{range.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(95vh-160px)]">
          <TabsList className="px-6 pt-4 bg-transparent justify-start border-b rounded-none gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="regions" className="data-[state=active]:bg-primary/10">
              <Map className="h-4 w-4 mr-2" />
              Regiões
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-primary/10">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary/10">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-primary/10">
              <Zap className="h-4 w-4 mr-2" />
              Análise Avançada
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Eye className="h-5 w-5 text-blue-500" />
                        </div>
                        <TrendIndicator trend="up" value="+12.3%" />
                      </div>
                      <p className="text-3xl font-bold">{totalViews.toLocaleString('pt-PT')}</p>
                      <p className="text-sm text-muted-foreground">Visualizações Totais</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <ShoppingCart className="h-5 w-5 text-green-500" />
                        </div>
                        <TrendIndicator trend="up" value="+8.7%" />
                      </div>
                      <p className="text-3xl font-bold">{totalSales.toLocaleString('pt-PT')}</p>
                      <p className="text-sm text-muted-foreground">Vendas Totais</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Package className="h-5 w-5 text-purple-500" />
                        </div>
                        <TrendIndicator trend="neutral" value="0%" />
                      </div>
                      <p className="text-3xl font-bold">{totalPixels.toLocaleString('pt-PT')}</p>
                      <p className="text-sm text-muted-foreground">Pixels Vendidos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <DollarSign className="h-5 w-5 text-amber-500" />
                        </div>
                        <TrendIndicator trend="up" value="+5.4%" />
                      </div>
                      <p className="text-3xl font-bold">{avgPrice.toFixed(2)}€</p>
                      <p className="text-sm text-muted-foreground">Preço Médio</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <LineChart className="h-5 w-5 mr-2 text-primary" />
                        Evolução de {selectedMetric === 'views' ? 'Visualizações' : 
                                    selectedMetric === 'purchases' ? 'Compras' : 
                                    selectedMetric === 'sales' ? 'Vendas' : 'Receita'}
                      </CardTitle>
                      <CardDescription>
                        Dados dos últimos {timeRange === 'day' ? 'dias' : 
                                          timeRange === 'week' ? '7 dias' : 
                                          timeRange === 'month' ? '30 dias' : 
                                          timeRange === 'year' ? '12 meses' : 'todos os tempos'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[
                          { id: 'views', label: 'Visualizações', icon: <Eye className="h-4 w-4" /> },
                          { id: 'purchases', label: 'Compras', icon: <ShoppingCart className="h-4 w-4" /> },
                          { id: 'sales', label: 'Vendas', icon: <TrendingUp className="h-4 w-4" /> },
                          { id: 'revenue', label: 'Receita', icon: <DollarSign className="h-4 w-4" /> }
                        ].map((metric) => (
                          <Button
                            key={metric.id}
                            variant={selectedMetric === metric.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedMetric(metric.id as MetricType)}
                            className="h-8"
                          >
                            {metric.icon}
                            <span className="ml-1 hidden md:inline">{metric.label}</span>
                          </Button>
                        ))}
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="flex">
                        {[
                          { id: 'line', icon: <LineChart className="h-4 w-4" /> },
                          { id: 'bar', icon: <BarChart3 className="h-4 w-4" /> },
                          { id: 'area', icon: <Activity className="h-4 w-4" /> }
                        ].map((chart) => (
                          <Button
                            key={chart.id}
                            variant={chartType === chart.id ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setChartType(chart.id as ChartType)}
                            className="h-8 w-8"
                          >
                            {chart.icon}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 relative">
                      {/* Simulated chart with animated lines/bars */}
                      <div className="absolute inset-0 flex items-end px-4 pb-4">
                        {currentMetricData.map((point, index) => {
                          const maxValue = Math.max(...currentMetricData.map(d => d.value));
                          const height = (point.value / maxValue) * 100;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              {chartType === 'bar' && (
                                <motion.div 
                                  className="w-full mx-0.5 bg-primary/60 hover:bg-primary transition-colors rounded-t-sm"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height * 0.8}%` }}
                                  transition={{ duration: 1, delay: index * 0.05 }}
                                />
                              )}
                              {chartType === 'line' && index > 0 && (
                                <div 
                                  className="absolute bottom-0 w-full h-full pointer-events-none"
                                  style={{ 
                                    left: `${(index / currentMetricData.length) * 100}%`,
                                    height: `${height * 0.8}%`
                                  }}
                                >
                                  <div className="absolute w-2 h-2 bg-primary rounded-full -ml-1 -mt-1" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Line connecting points */}
                        {chartType === 'line' && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                              d={`M ${currentMetricData.map((point, i) => {
                                const maxValue = Math.max(...currentMetricData.map(d => d.value));
                                const x = (i / (currentMetricData.length - 1)) * 100;
                                const y = 100 - ((point.value / maxValue) * 80);
                                return `${x} ${y}`;
                              }).join(' L ')}`}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, type: "spring" }}
                            />
                          </svg>
                        )}
                        
                        {/* Area under the line */}
                        {chartType === 'area' && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                              d={`M ${currentMetricData.map((point, i) => {
                                const maxValue = Math.max(...currentMetricData.map(d => d.value));
                                const x = (i / (currentMetricData.length - 1)) * 100;
                                const y = 100 - ((point.value / maxValue) * 80);
                                return `${x} ${y}`;
                              }).join(' L ')} L 100 100 L 0 100 Z`}
                              fill="url(#gradient)"
                              opacity="0.3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.3 }}
                              transition={{ duration: 1 }}
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            
                            <motion.path
                              d={`M ${currentMetricData.map((point, i) => {
                                const maxValue = Math.max(...currentMetricData.map(d => d.value));
                                const x = (i / (currentMetricData.length - 1)) * 100;
                                const y = 100 - ((point.value / maxValue) * 80);
                                return `${x} ${y}`;
                              }).join(' L ')}`}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, type: "spring" }}
                            />
                          </svg>
                        )}
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
                        {currentMetricData.filter((_, i) => i % 2 === 0).map((point, index) => (
                          <div key={index} className="text-center">
                            {new Date(point.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                          </div>
                        ))}
                      </div>
                      
                      {/* Y-axis labels */}
                      <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between py-4 text-xs text-muted-foreground">
                        {[0, 1, 2, 3, 4].map((_, index) => {
                          const maxValue = Math.max(...currentMetricData.map(d => d.value));
                          const value = maxValue - (index * (maxValue / 4));
                          return (
                            <div key={index} className="pl-2">
                              {selectedMetric === 'revenue' ? `${value.toFixed(0)}€` : value.toFixed(0)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-primary rounded-full mr-1" />
                          <span className="text-sm">{selectedMetric === 'views' ? 'Visualizações' : 
                                                    selectedMetric === 'purchases' ? 'Compras' : 
                                                    selectedMetric === 'sales' ? 'Vendas' : 'Receita'}</span>
                        </div>
                        <div className="flex items-center">
                          <TrendIndicator 
                            trend={metricTrend.trend} 
                            value={metricTrend.trend === 'up' ? `+${metricTrend.percentage}` : metricTrend.trend === 'down' ? `-${metricTrend.percentage}` : '0%'} 
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Última atualização: {lastUpdated}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Secondary Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Popularity by Region */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        Popularidade por Região
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockPopularityData.slice(0, 5).map((region) => (
                          <div key={region.region} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{region.region}</span>
                              <span className="font-medium">{region.popularity}%</span>
                            </div>
                            <Progress value={region.popularity} className="h-2" />
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('regions')}>
                        <Globe className="h-4 w-4 mr-2" />
                        Ver Todas as Regiões
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Price Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        Distribuição de Preços
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockPriceRanges.map((range) => (
                          <div key={range.range} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{range.range}</span>
                              <span className="font-medium">{range.count.toLocaleString('pt-PT')} pixels</span>
                            </div>
                            <Progress 
                              value={(range.count / mockPriceRanges.reduce((sum, r) => sum + r.count, 0)) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market Insights */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Insights de Mercado
                    </CardTitle>
                    <CardDescription>
                      Análises personalizadas baseadas nos dados do mercado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockMarketInsights.map((insight, index) => (
                        <div key={index} className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            {insight.icon}
                            <span className="ml-2">{insight.title}</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          <Button variant="outline" size="sm" className="mt-3 w-full">
                            <ChevronRight className="h-4 w-4 mr-2" />
                            {insight.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setActiveTab('insights')}>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Ver Todos os Insights
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Regions Tab */}
              <TabsContent value="regions" className="mt-0 space-y-6">
                {selectedRegion ? (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <Button variant="ghost" onClick={() => setSelectedRegion(null)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar para Todas as Regiões
                        </Button>
                        <CardTitle className="text-xl mt-2">
                          Análise da Região: {selectedRegion}
                        </CardTitle>
                      </div>
                      <Badge className="bg-primary">
                        {mockRegionalData.find(r => r.name === selectedRegion)?.trend === 'up' ? 'Em Alta' : 
                         mockRegionalData.find(r => r.name === selectedRegion)?.trend === 'down' ? 'Em Baixa' : 'Estável'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Region Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">
                              {mockRegionalData.find(r => r.name === selectedRegion)?.pixels.toLocaleString('pt-PT')}
                            </p>
                            <p className="text-xs text-muted-foreground">Pixels Vendidos</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-2xl font-bold">
                              {mockRegionalData.find(r => r.name === selectedRegion)?.sales.toLocaleString('pt-PT')}
                            </p>
                            <p className="text-xs text-muted-foreground">Transações</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-2xl font-bold">
                              {mockRegionalData.find(r => r.name === selectedRegion)?.views.toLocaleString('pt-PT')}
                            </p>
                            <p className="text-xs text-muted-foreground">Visualizações</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                            <p className="text-2xl font-bold">
                              {mockRegionalData.find(r => r.name === selectedRegion)?.avgPrice.toFixed(2)}€
                            </p>
                            <p className="text-xs text-muted-foreground">Preço Médio</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Region Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <LineChart className="h-5 w-5 mr-2 text-primary" />
                            Evolução de Preços em {selectedRegion}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-60 relative">
                            {/* Simulated chart with animated lines */}
                            <div className="absolute inset-0 flex items-end px-4 pb-4">
                              {Array.from({ length: 12 }).map((_, index) => {
                                const height = 20 + Math.random() * 60; // Random height between 20% and 80%
                                return (
                                  <motion.div 
                                    key={index} 
                                    className="flex-1 mx-px bg-primary/30 hover:bg-primary/60 transition-all rounded-t-sm"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Region Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                              Insights da Região
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Crescimento Constante</p>
                                <p className="text-sm text-muted-foreground">
                                  Esta região tem mostrado um crescimento constante nos últimos 3 meses, com um aumento médio de 15% no valor dos pixels.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Alta Demanda</p>
                                <p className="text-sm text-muted-foreground">
                                  Existe uma alta demanda por pixels nesta região, com uma taxa de conversão de visualizações para compras de 8.2%.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                              <div>
                                <p className="font-medium">Oportunidade de Investimento</p>
                                <p className="text-sm text-muted-foreground">
                                  Pixels na parte norte desta região estão subvalorizados em comparação com áreas similares.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <PieChart className="h-5 w-5 mr-2 text-primary" />
                              Distribuição de Raridade
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {mockRarityDistribution.map((rarity) => (
                                <div key={rarity.rarity} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{rarity.rarity}</span>
                                    <span className="font-medium">{rarity.percentage}%</span>
                                  </div>
                                  <Progress 
                                    value={rarity.percentage} 
                                    className={cn(
                                      "h-2",
                                      rarity.rarity === 'Comum' && "[&>div]:bg-gray-500",
                                      rarity.rarity === 'Incomum' && "[&>div]:bg-green-500",
                                      rarity.rarity === 'Raro' && "[&>div]:bg-blue-500",
                                      rarity.rarity === 'Épico' && "[&>div]:bg-purple-500",
                                      rarity.rarity === 'Lendário' && "[&>div]:bg-amber-500"
                                    )} 
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Recommendations */}
                      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-primary" />
                            Recomendações para {selectedRegion}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                              <div className="p-2 rounded-full bg-green-500/20">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium">Investir Agora</p>
                                <p className="text-sm text-muted-foreground">
                                  O momento é ideal para investir em pixels nesta região, especialmente nas áreas centrais.
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Explorar Áreas Recomendadas
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                              <div className="p-2 rounded-full bg-blue-500/20">
                                <Clock className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-medium">Aguardar Valorização</p>
                                <p className="text-sm text-muted-foreground">
                                  Se você já possui pixels nesta região, recomendamos aguardar a valorização prevista para os próximos 2-3 meses.
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Definir Alerta de Preço
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Region Map */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Map className="h-5 w-5 mr-2 text-primary" />
                          Mapa de Regiões
                        </CardTitle>
                        <CardDescription>
                          Clique em uma região para ver análises detalhadas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center relative">
                          {/* Placeholder for an interactive map */}
                          <div className="text-center text-muted-foreground">
                            <Map className="h-12 w-12 mx-auto mb-2" />
                            <p>Mapa Interativo de Portugal</p>
                            <p className="text-sm mt-2">Clique em uma região abaixo para analisar</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Region Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Globe className="h-5 w-5 mr-2 text-primary" />
                          Análise por Região
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockRegionalData.map((region) => (
                            <motion.div 
                              key={region.name} 
                              whileHover={{ scale: 1.02 }}
                              className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => handleRegionClick(region.name)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-primary/20">
                                    <MapPin className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{region.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{region.pixels.toLocaleString('pt-PT')} pixels</span>
                                      <span>•</span>
                                      <span>{region.sales.toLocaleString('pt-PT')} vendas</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold">{region.avgPrice.toFixed(2)}€</p>
                                    <TrendIndicator trend={region.trend} />
                                  </div>
                                  <p className="text-xs text-muted-foreground">Preço médio</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="space-y-1 flex-1 mr-4">
                                  <div className="flex justify-between text-xs">
                                    <span>Popularidade</span>
                                    <span>{mockPopularityData.find(r => r.region === region.name)?.popularity || 50}%</span>
                                  </div>
                                  <Progress 
                                    value={mockPopularityData.find(r => r.region === region.name)?.popularity || 50} 
                                    className="h-1.5" 
                                  />
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <ChevronRight className="h-4 w-4" />
                                  Detalhes
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Region Comparison */}
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-primary">
                          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                          Comparação de Regiões
                        </CardTitle>
                        <CardDescription>
                          Análise comparativa das principais regiões
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                            <h3 className="font-semibold flex items-center mb-2">
                              <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                              Região Mais Valiosa
                            </h3>
                            <p className="text-lg font-bold text-yellow-500">Lisboa</p>
                            <p className="text-sm text-muted-foreground">
                              Preço médio: 52.80€ por pixel
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleRegionClick('Lisboa')}>
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Analisar Lisboa
                            </Button>
                          </div>
                          <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                            <h3 className="font-semibold flex items-center mb-2">
                              <Flame className="h-4 w-4 mr-2 text-red-500" />
                              Região Mais Ativa
                            </h3>
                            <p className="text-lg font-bold text-red-500">Porto</p>
                            <p className="text-sm text-muted-foreground">
                              198 transações nos últimos 30 dias
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleRegionClick('Porto')}>
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Analisar Porto
                            </Button>
                          </div>
                          <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                            <h3 className="font-semibold flex items-center mb-2">
                              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                              Maior Crescimento
                            </h3>
                            <p className="text-lg font-bold text-green-500">Faro</p>
                            <p className="text-sm text-muted-foreground">
                              +23% de crescimento no último mês
                            </p>
                            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => handleRegionClick('Faro')}>
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Analisar Faro
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="mt-0 space-y-6">
                {/* Trend Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Tendências de Mercado
                    </CardTitle>
                    <CardDescription>
                      Análise das tendências atuais no mercado de pixels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <Badge className="bg-green-500">Em Alta</Badge>
                          </div>
                          <h3 className="font-medium">Pixels Turísticos</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pixels em zonas turísticas tiveram um aumento de 18% no valor.
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                            <TrendIndicator trend="up" value="+18%" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-red-500/20">
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                            <Badge className="bg-red-500">Em Baixa</Badge>
                          </div>
                          <h3 className="font-medium">Pixels Rurais</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pixels em zonas rurais tiveram uma queda de 7% no valor.
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                            <TrendIndicator trend="down" value="-7%" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Flame className="h-5 w-5 text-blue-500" />
                            </div>
                            <Badge className="bg-blue-500">Tendência</Badge>
                          </div>
                          <h3 className="font-medium">Pixels Históricos</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Crescente interesse em pixels em locais históricos.
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                            <TrendIndicator trend="up" value="+12%" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Tendências de Longo Prazo</h3>
                      <div className="h-60 relative">
                        {/* Simulated chart with multiple trend lines */}
                        <div className="absolute inset-0">
                          {/* Line 1 - Uptrend */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                              d={`M 0 80 C 20 75, 40 65, 60 55 C 80 45, 100 40, 100 30`}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, type: "spring" }}
                            />
                          </svg>
                          
                          {/* Line 2 - Stable */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                              d={`M 0 50 C 20 52, 40 48, 60 51 C 80 49, 100 52, 100 50`}
                              fill="none"
                              stroke="hsl(var(--accent))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, delay: 0.5, type: "spring" }}
                            />
                          </svg>
                          
                          {/* Line 3 - Downtrend */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <motion.path
                              d={`M 0 30 C 20 35, 40 45, 60 55 C 80 65, 100 70, 100 80`}
                              fill="none"
                              stroke="hsl(var(--destructive))"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 2, delay: 1, type: "spring" }}
                            />
                          </svg>
                        </div>
                        
                        {/* Legend */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-primary rounded-full mr-1" />
                            <span className="text-xs">Pixels Turísticos</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-accent rounded-full mr-1" />
                            <span className="text-xs">Pixels Urbanos</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-destructive rounded-full mr-1" />
                            <span className="text-xs">Pixels Rurais</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        Tendências de Preço
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Raros</p>
                              <p className="text-xs text-muted-foreground">Aumento constante de valor</p>
                            </div>
                          </div>
                          <TrendIndicator trend="up" value="+15.3%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/20">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Históricos</p>
                              <p className="text-xs text-muted-foreground">Valorização acelerada</p>
                            </div>
                          </div>
                          <TrendIndicator trend="up" value="+23.7%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-500/20">
                              <Activity className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Urbanos</p>
                              <p className="text-xs text-muted-foreground">Estabilidade de preço</p>
                            </div>
                          </div>
                          <TrendIndicator trend="neutral" value="0%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/20">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Rurais</p>
                              <p className="text-xs text-muted-foreground">Desvalorização lenta</p>
                            </div>
                          </div>
                          <TrendIndicator trend="down" value="-7.2%" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popularity Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-primary" />
                        Tendências de Popularidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Animados</p>
                              <p className="text-xs text-muted-foreground">Aumento significativo de interesse</p>
                            </div>
                          </div>
                          <TrendIndicator trend="up" value="+32.8%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Turísticos</p>
                              <p className="text-xs text-muted-foreground">Crescimento constante</p>
                            </div>
                          </div>
                          <TrendIndicator trend="up" value="+18.5%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/20">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Colaborativos</p>
                              <p className="text-xs text-muted-foreground">Tendência emergente</p>
                            </div>
                          </div>
                          <TrendIndicator trend="up" value="+12.3%" />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/20">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Monocromáticos</p>
                              <p className="text-xs text-muted-foreground">Queda de interesse</p>
                            </div>
                          </div>
                          <TrendIndicator trend="down" value="-9.7%" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Seasonal Trends */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Tendências Sazonais
                    </CardTitle>
                    <CardDescription>
                      Como o mercado de pixels varia ao longo do ano
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          Inverno
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Aumento de 15% nas vendas de pixels em regiões de montanha e estâncias de esqui.
                        </p>
                        <div className="mt-2 flex items-center">
                          <TrendIndicator trend="up" value="+15%" />
                        </div>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-green-500" />
                          Primavera
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Crescimento moderado em todas as regiões, com destaque para áreas de natureza.
                        </p>
                        <div className="mt-2 flex items-center">
                          <TrendIndicator trend="up" value="+8%" />
                        </div>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                          Verão
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Pico de vendas em regiões costeiras, com aumento de 30% no valor dos pixels.
                        </p>
                        <div className="mt-2 flex items-center">
                          <TrendIndicator trend="up" value="+30%" />
                        </div>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                          Outono
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Estabilização do mercado, com foco em regiões vinícolas e históricas.
                        </p>
                        <div className="mt-2 flex items-center">
                          <TrendIndicator trend="neutral" value="0%" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="mt-0 space-y-6">
                {/* Investment Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Oportunidades de Investimento
                    </CardTitle>
                    <CardDescription>
                      Regiões e pixels com potencial de valorização
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-green-500/20 mt-1">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Algarve - Oportunidade de Alta Valorização</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              A região do Algarve está mostrando sinais de forte valorização nos próximos meses, com um potencial de crescimento de 25-30% no valor dos pixels. Isso se deve a novos projetos de desenvolvimento turístico e aumento do interesse internacional.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">
                                Alto Potencial
                              </Badge>
                              <Badge variant="outline">
                                Retorno Estimado: 25-30%
                              </Badge>
                              <Badge variant="outline">
                                Horizonte: 3-6 meses
                              </Badge>
                            </div>
                            <Button className="mt-3 bg-green-500 hover:bg-green-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              Explorar Oportunidade
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-blue-500/20 mt-1">
                            <Lightbulb className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Coimbra - Pixels Universitários</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pixels na zona universitária de Coimbra estão atualmente subvalorizados em comparação com outras áreas acadêmicas. Com o início do novo ano letivo, espera-se um aumento significativo na demanda e, consequentemente, no valor destes pixels.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">
                                Oportunidade Emergente
                              </Badge>
                              <Badge variant="outline">
                                Retorno Estimado: 15-20%
                              </Badge>
                              <Badge variant="outline">
                                Horizonte: 1-3 meses
                              </Badge>
                            </div>
                            <Button className="mt-3 bg-blue-500 hover:bg-blue-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              Explorar Oportunidade
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-purple-500/20 mt-1">
                            <Target className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Porto - Zona Histórica</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              A recente designação de novos pontos turísticos na zona histórica do Porto deve impulsionar o valor dos pixels nesta área. Análises indicam que pixels adjacentes a estes pontos têm potencial de valorização acima da média.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-purple-500 border-purple-500/50 bg-purple-500/10">
                                Oportunidade Estratégica
                              </Badge>
                              <Badge variant="outline">
                                Retorno Estimado: 18-22%
                              </Badge>
                              <Badge variant="outline">
                                Horizonte: 2-4 meses
                              </Badge>
                            </div>
                            <Button className="mt-3 bg-purple-500 hover:bg-purple-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              Explorar Oportunidade
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Previsões de Mercado
                    </CardTitle>
                    <CardDescription>
                      Análise preditiva baseada em tendências históricas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-lg font-bold">Curto Prazo</p>
                            <p className="text-sm text-muted-foreground">1-3 meses</p>
                            <div className="mt-3 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium text-green-500">+8-12% crescimento</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-lg font-bold">Médio Prazo</p>
                            <p className="text-sm text-muted-foreground">3-6 meses</p>
                            <div className="mt-3 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium text-green-500">+15-20% crescimento</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <Calendar className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                            <p className="text-lg font-bold">Longo Prazo</p>
                            <p className="text-sm text-muted-foreground">6-12 meses</p>
                            <div className="mt-3 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium text-green-500">+25-35% crescimento</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="p-4 bg-muted/20 rounded-lg">
                        <h3 className="font-medium mb-3">Fatores de Influência</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-blue-500/20">
                              <Users className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">Crescimento da Base de Usuários</p>
                              <p className="text-sm text-muted-foreground">
                                Previsão de aumento de 30% na base de usuários nos próximos 6 meses, impulsionando a demanda por pixels.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-purple-500/20">
                              <Globe className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">Expansão Internacional</p>
                              <p className="text-sm text-muted-foreground">
                                Planos de expansão para mercados internacionais devem aumentar o interesse e valor dos pixels em Portugal.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <Sparkles className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Novas Funcionalidades</p>
                              <p className="text-sm text-muted-foreground">
                                O lançamento de novas funcionalidades, como pixels animados e interativos, deve impulsionar o mercado.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personalized Insights */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                      Insights Personalizados
                    </CardTitle>
                    <CardDescription>
                      Recomendações baseadas no seu portfólio de pixels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                          Oportunidade de Venda
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Seus pixels na região de Lisboa estão atualmente valorizados 25% acima do preço de compra. Considere vender alguns para maximizar lucros.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Analisar Portfólio
                        </Button>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Target className="h-4 w-4 mr-2 text-blue-500" />
                          Diversificação Recomendada
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Seu portfólio está concentrado em pixels urbanos. Considere diversificar adquirindo pixels em regiões costeiras para equilibrar riscos.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Compass className="h-4 w-4 mr-2" />
                          Explorar Regiões
                        </Button>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Gem className="h-4 w-4 mr-2 text-purple-500" />
                          Pixels Raros
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Há uma oportunidade de adquirir pixels raros na região do Douro, que têm potencial de valorização acima da média no longo prazo.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <MapPin className="h-4 w-4 mr-2" />
                          Ver Oportunidade
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Settings className="h-4 w-4 mr-2" />
                      Personalizar Insights
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Advanced Analysis Tab */}
              <TabsContent value="advanced" className="mt-0 space-y-6">
                {/* Advanced Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Filter className="h-5 w-5 mr-2 text-primary" />
                      Análise Avançada
                    </CardTitle>
                    <CardDescription>
                      Ferramentas de análise detalhada para investidores experientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label htmlFor="metric" className="text-sm">Métrica</Label>
                        <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                          <SelectTrigger id="metric">
                            <SelectValue placeholder="Selecione uma métrica" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="views">Visualizações</SelectItem>
                            <SelectItem value="purchases">Compras</SelectItem>
                            <SelectItem value="sales">Vendas</SelectItem>
                            <SelectItem value="revenue">Receita</SelectItem>
                            <SelectItem value="engagement">Engajamento</SelectItem>
                            <SelectItem value="users">Usuários</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="region" className="text-sm">Região</Label>
                        <Select>
                          <SelectTrigger id="region">
                            <SelectValue placeholder="Todas as Regiões" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as Regiões</SelectItem>
                            {mockRegionalData.map((region) => (
                              <SelectItem key={region.name} value={region.name}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="chart-type" className="text-sm">Tipo de Gráfico</Label>
                        <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                          <SelectTrigger id="chart-type">
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">Linha</SelectItem>
                            <SelectItem value="bar">Barras</SelectItem>
                            <SelectItem value="area">Área</SelectItem>
                            <SelectItem value="pie">Pizza</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center relative">
                      {/* Placeholder for advanced chart */}
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Gráfico Avançado Personalizado</p>
                        <p className="text-sm mt-2">Configure os parâmetros acima para visualizar dados específicos</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                      <Button>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Correlation Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Análise de Correlação
                      </CardTitle>
                      <CardDescription>
                        Relação entre diferentes métricas de mercado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Visualizações vs. Compras</p>
                              <p className="text-xs text-muted-foreground">Correlação forte positiva</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-500">0.87</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Raridade vs. Preço</p>
                              <p className="text-xs text-muted-foreground">Correlação forte positiva</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-500">0.92</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-500/20">
                              <Activity className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-medium">Localização vs. Visualizações</p>
                              <p className="text-xs text-muted-foreground">Correlação moderada positiva</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-yellow-500">0.65</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/20">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">Idade do Pixel vs. Valor</p>
                              <p className="text-xs text-muted-foreground">Correlação fraca negativa</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-red-500">-0.23</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Volatility Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Análise de Volatilidade
                      </CardTitle>
                      <CardDescription>
                        Estabilidade de preço por categoria de pixel
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Históricos</p>
                              <p className="text-xs text-muted-foreground">Baixa volatilidade, crescimento estável</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-500">Estável</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-500/20">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Turísticos</p>
                              <p className="text-xs text-muted-foreground">Volatilidade média, variação sazonal</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-yellow-500">Moderada</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/20">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Temáticos</p>
                              <p className="text-xs text-muted-foreground">Alta volatilidade, dependente de eventos</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-red-500">Volátil</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-500/20">
                              <Gem className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pixels Raros</p>
                              <p className="text-xs text-muted-foreground">Volatilidade baixa, alta valorização</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-purple-500">Premium</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ROI Calculator */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Calculator className="h-5 w-5 mr-2 text-primary" />
                      Calculadora de ROI
                    </CardTitle>
                    <CardDescription>
                      Estime o retorno sobre investimento para diferentes tipos de pixels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="investment-amount">Valor do Investimento (€)</Label>
                          <Input id="investment-amount" type="number" defaultValue="1000" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pixel-type">Tipo de Pixel</Label>
                          <Select defaultValue="rare">
                            <SelectTrigger id="pixel-type">
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="common">Comum</SelectItem>
                              <SelectItem value="uncommon">Incomum</SelectItem>
                              <SelectItem value="rare">Raro</SelectItem>
                              <SelectItem value="epic">Épico</SelectItem>
                              <SelectItem value="legendary">Lendário</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="investment-period">Período de Investimento</Label>
                          <Select defaultValue="6">
                            <SelectTrigger id="investment-period">
                              <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 mês</SelectItem>
                              <SelectItem value="3">3 meses</SelectItem>
                              <SelectItem value="6">6 meses</SelectItem>
                              <SelectItem value="12">12 meses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button className="w-full">
                          <Calculator className="h-4 w-4 mr-2" />
                          Calcular ROI
                        </Button>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="p-4 bg-card/50 rounded-lg h-full flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-lg mb-4">Resultados Estimados</h3>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">Investimento Inicial:</span>
                                <span className="font-bold">1.000,00 €</span>
                              </div>
                              
                              <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">Retorno Estimado:</span>
                                <span className="font-bold text-green-500">+180,00 €</span>
                              </div>
                              
                              <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">Valor Final Estimado:</span>
                                <span className="font-bold">1.180,00 €</span>
                              </div>
                              
                              <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">ROI Percentual:</span>
                                <span className="font-bold text-green-500">18%</span>
                              </div>
                              
                              <div className="flex justify-between p-2 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground">ROI Anualizado:</span>
                                <span className="font-bold text-green-500">36%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <p className="text-xs text-muted-foreground">
                                Esta é uma estimativa baseada em dados históricos e tendências de mercado. Os resultados reais podem variar. Considere diversificar seu portfólio para gerenciar riscos.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

