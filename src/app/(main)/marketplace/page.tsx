
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { ShoppingCart, TrendingUp, Star, MapPin, Clock, Filter, Search, Eye, Heart, Share2, Zap, Crown, Gem, Award, AlertTriangle, DollarSign, Calendar, Users, BarChart3, ArrowUpDown, SortAsc, Flame, Package, Sparkles, ChevronDown, ChevronUp, ExternalLink, Bookmark, MessageSquare, Flag, Gift, Coins, Timer, Target, Bell, Shield, LineChart, PieChart, TrendingDown, GitCompare as Compare, Lightbulb, Calculator, Grid3X3, List, Settings, RefreshCw, Download, Upload, Plus, Minus, Activity, Globe, Map, Camera, Palette, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
type SortOption = 'trending' | 'recent' | 'views' | 'likes' | 'comments' | 'rarity' | 'price' | 'featured';
type FilterCategory = 'all' | 'featured' | 'trending' | 'new' | 'rare' | 'animated' | 'interactive';

interface PixelShowcase {
  id: string;
  coordinates: { x: number; y: number };
  title: string;
  description: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    level: number;
    verified: boolean;
  };
  rarity: PixelRarity;
  price: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  createdAt: Date;
  lastModified: Date;
  imageUrl?: string;
  dataAiHint?: string;
  tags: string[];
  region: string;
  isFeatured: boolean;
  isTrending: boolean;
  isAnimated: boolean;
  isInteractive: boolean;
  hasSound: boolean;
  effects: string[];
  boostLevel: number;
  engagement: {
    viewsToday: number;
    likesThisWeek: number;
    commentsThisMonth: number;
    shareRate: number;
  };
  analytics: {
    impressions: number;
    clickRate: number;
    conversionRate: number;
    avgViewTime: number;
  };
  priceHistory: { date: Date; price: number }[];
  marketScore: number;
  isHot: boolean;
  discount?: number;
  originalPrice?: number;
}

const mockPixels: PixelShowcase[] = [
  {
    id: '1',
    coordinates: { x: 245, y: 156 },
    title: 'Torre de Belém Digital',
    description: 'Uma representação artística única da icónica Torre de Belém em Lisboa, com efeitos de brilho dourado e animações exclusivas.',
    owner: {
      id: 'user1',
      name: 'ArtistaPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 25,
      verified: true
    },
    rarity: 'epic',
    price: 150,
    views: 15420,
    likes: 892,
    comments: 156,
    shares: 89,
    bookmarks: 234,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art tower',
    tags: ['lisboa', 'património', 'dourado', 'histórico', 'arquitetura'],
    region: 'Lisboa',
    isFeatured: true,
    isTrending: true,
    isAnimated: true,
    isInteractive: false,
    hasSound: true,
    effects: ['glow', 'sparkle', 'rotation'],
    boostLevel: 5,
    engagement: {
      viewsToday: 1240,
      likesThisWeek: 456,
      commentsThisMonth: 89,
      shareRate: 5.8
    },
    analytics: {
      impressions: 25000,
      clickRate: 12.5,
      conversionRate: 3.2,
      avgViewTime: 45
    },
    priceHistory: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 120 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 135 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 145 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 150 },
    ],
    marketScore: 9.2,
    isHot: true,
    discount: 10,
    originalPrice: 167
  },
  {
    id: '2',
    coordinates: { x: 123, y: 89 },
    title: 'Galo de Barcelos Interativo',
    description: 'O símbolo nacional português com animação de batimento de asas, cores vibrantes e interatividade única.',
    owner: {
      id: 'user2',
      name: 'PixelMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 18,
      verified: false
    },
    rarity: 'rare',
    price: 75,
    views: 8930,
    likes: 567,
    comments: 89,
    shares: 45,
    bookmarks: 123,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art rooster',
    tags: ['galo', 'barcelos', 'tradição', 'animado', 'interativo'],
    region: 'Braga',
    isFeatured: false,
    isTrending: true,
    isAnimated: true,
    isInteractive: true,
    hasSound: false,
    effects: ['animation', 'color-shift'],
    boostLevel: 2,
    engagement: {
      viewsToday: 890,
      likesThisWeek: 234,
      commentsThisMonth: 45,
      shareRate: 4.2
    },
    analytics: {
      impressions: 12000,
      clickRate: 8.9,
      conversionRate: 2.1,
      avgViewTime: 32
    },
    priceHistory: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 60 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 68 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 72 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 75 },
    ],
    marketScore: 7.8,
    isHot: true
  },
  {
    id: '3',
    coordinates: { x: 67, y: 234 },
    title: 'Pastéis de Nata Aromáticos',
    description: 'Uma homenagem deliciosa ao doce mais famoso de Portugal, com efeito de vapor quente e aroma virtual.',
    owner: {
      id: 'user3',
      name: 'DocePortugal',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 12,
      verified: true
    },
    rarity: 'uncommon',
    price: 25,
    views: 5670,
    likes: 345,
    comments: 67,
    shares: 23,
    bookmarks: 89,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art pastries',
    tags: ['pastéis', 'nata', 'doce', 'tradição', 'gastronomia'],
    region: 'Lisboa',
    isFeatured: false,
    isTrending: false,
    isAnimated: true,
    isInteractive: false,
    hasSound: false,
    effects: ['steam', 'warm-glow'],
    boostLevel: 1,
    engagement: {
      viewsToday: 456,
      likesThisWeek: 123,
      commentsThisMonth: 34,
      shareRate: 3.1
    },
    analytics: {
      impressions: 8500,
      clickRate: 6.7,
      conversionRate: 1.8,
      avgViewTime: 28
    },
    priceHistory: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 20 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 22 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 24 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 25 },
    ],
    marketScore: 6.5,
    isHot: false
  },
  {
    id: '4',
    coordinates: { x: 345, y: 123 },
    title: 'Fado Eterno Sonoro',
    description: 'Uma guitarra portuguesa que toca melodias autênticas quando clicada, representando a alma eterna do fado português.',
    owner: {
      id: 'user4',
      name: 'FadoSoul',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 30,
      verified: true
    },
    rarity: 'legendary',
    price: 500,
    views: 23450,
    likes: 1234,
    comments: 289,
    shares: 156,
    bookmarks: 445,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art guitar',
    tags: ['fado', 'música', 'guitarra', 'interativo', 'cultura'],
    region: 'Lisboa',
    isFeatured: true,
    isTrending: true,
    isAnimated: true,
    isInteractive: true,
    hasSound: true,
    effects: ['music-notes', 'golden-glow', 'sound-waves'],
    boostLevel: 4,
    engagement: {
      viewsToday: 2340,
      likesThisWeek: 678,
      commentsThisMonth: 145,
      shareRate: 8.9
    },
    analytics: {
      impressions: 45000,
      clickRate: 15.2,
      conversionRate: 4.5,
      avgViewTime: 67
    },
    priceHistory: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 450 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 470 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 485 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 500 },
    ],
    marketScore: 9.8,
    isHot: true
  }
];

const rarityColors: Record<PixelRarity, string> = {
  common: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  uncommon: 'text-green-500 bg-green-500/10 border-green-500/30',
  rare: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  epic: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
  legendary: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  unique: 'text-pink-500 bg-pink-500/10 border-pink-500/30'
};

const rarityLabels: Record<PixelRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  unique: 'Único'
};

export default function MarketplacePage() {
  const [pixels, setPixels] = useState<PixelShowcase[]>(mockPixels);
  const { addCredits, removeCredits } = useUserStore();
  const [filteredPixels, setFilteredPixels] = useState<PixelShowcase[]>(mockPixels);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedPixels, setSelectedPixels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playPurchaseSound, setPlayPurchaseSound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let filtered = pixels.filter(pixel => {
      const matchesSearch = !searchQuery || 
        pixel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pixel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pixel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pixel.owner.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
        (filterCategory === 'featured' && pixel.isFeatured) ||
        (filterCategory === 'trending' && pixel.isTrending) ||
        (filterCategory === 'new' && pixel.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterCategory === 'rare' && ['epic', 'legendary', 'unique'].includes(pixel.rarity)) ||
        (filterCategory === 'animated' && pixel.isAnimated) ||
        (filterCategory === 'interactive' && pixel.isInteractive);
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return (b.engagement.viewsToday + b.engagement.likesThisWeek) - 
                 (a.engagement.viewsToday + a.engagement.likesThisWeek);
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, unique: 6 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'price':
          return b.price - a.price;
        case 'featured':
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.boostLevel - a.boostLevel;
        default:
          return 0;
      }
    });

    setFilteredPixels(filtered);
  }, [pixels, searchQuery, sortBy, filterCategory]);

  const handleLikePixel = (pixelId: string) => {
    setPixels(prev => prev.map(pixel => 
      pixel.id === pixelId 
        ? { ...pixel, likes: pixel.likes + 1 }
        : pixel
    ));
    
    toast({
      title: "Pixel Curtido!",
      description: "O seu gosto foi registado.",
    });
  };

  const handleFavoritePixel = (pixelId: string) => {
    setFavorites(prev => 
      prev.includes(pixelId) 
        ? prev.filter(id => id !== pixelId)
        : [...prev, pixelId]
    );
    
    const action = favorites.includes(pixelId) ? 'removido dos' : 'adicionado aos';
    toast({
      title: `Pixel ${action} favoritos!`,
      description: `O pixel foi ${action} seus favoritos.`,
    });
  };

  const handleComparePixels = () => {
    if (selectedPixels.length < 2) {
      toast({
        title: "Seleção Insuficiente",
        description: "Selecione pelo menos 2 píxeis para comparar.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Comparação Iniciada",
      description: `Comparando ${selectedPixels.length} píxeis selecionados.`,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPriceChange = (pixel: PixelShowcase) => {
    if (pixel.priceHistory.length < 2) return { change: 0, percentage: 0 };
    const current = pixel.price;
    const previous = pixel.priceHistory[pixel.priceHistory.length - 2].price;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-colors duration-300">
      <SoundEffect src={SOUND_EFFECTS.PURCHASE} play={playPurchaseSound} onEnd={() => setPlayPurchaseSound(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Enhanced Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <ShoppingCart className="h-8 w-8 mr-3 animate-glow" />
                  Marketplace Premium
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Descubra, compare e adquira os píxeis mais extraordinários do universo digital português
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Package className="h-4 w-4 mr-2" />
                  Vender Pixel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Market Analytics */}
        {showAnalytics && (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Análise de Mercado em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Volume 24h</p>
                      <p className="text-2xl font-bold text-green-500">€12.4K</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço Médio</p>
                      <p className="text-2xl font-bold text-blue-500">€187</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Píxeis Ativos</p>
                      <p className="text-2xl font-bold text-purple-500">2.7K</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </Card>
                <Card className="p-4 bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Crescimento</p>
                      <p className="text-2xl font-bold text-orange-500">+23%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filters and Search */}
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar píxeis, criadores, tags, regiões..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/70 focus:border-primary"
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* Filter Tabs */}
              <Tabs value={filterCategory} onValueChange={(value) => setFilterCategory(value as FilterCategory)}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-12 bg-background/50">
                  <TabsTrigger value="all" className="text-xs">
                    <Globe className="h-4 w-4 mr-1" />
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="text-xs">
                    <Star className="h-4 w-4 mr-1" />
                    Destaque
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs">
                    <Flame className="h-4 w-4 mr-1" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="new" className="text-xs">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Novos
                  </TabsTrigger>
                  <TabsTrigger value="rare" className="text-xs">
                    <Gem className="h-4 w-4 mr-1" />
                    Raros
                  </TabsTrigger>
                  <TabsTrigger value="animated" className="text-xs">
                    <Zap className="h-4 w-4 mr-1" />
                    Animados
                  </TabsTrigger>
                  <TabsTrigger value="interactive" className="text-xs">
                    <Target className="h-4 w-4 mr-1" />
                    Interativos
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Enhanced Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">🔥 Mais Populares</SelectItem>
                      <SelectItem value="recent">🆕 Mais Recentes</SelectItem>
                      <SelectItem value="views">👁️ Mais Vistos</SelectItem>
                      <SelectItem value="likes">❤️ Mais Curtidos</SelectItem>
                      <SelectItem value="comments">💬 Mais Comentados</SelectItem>
                      <SelectItem value="rarity">💎 Por Raridade</SelectItem>
                      <SelectItem value="price">💰 Por Preço</SelectItem>
                      <SelectItem value="featured">⭐ Em Destaque</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros Avançados
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredPixels.length} píxeis • {selectedPixels.length} selecionados
                  </span>
                  
                  {selectedPixels.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleComparePixels}>
                      <Compare className="h-4 w-4 mr-2" />
                      Comparar ({selectedPixels.length})
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Pixels Grid/List */}
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
        )}>
          {filteredPixels.map((pixel) => {
            const priceChange = getPriceChange(pixel);
            const isFavorite = favorites.includes(pixel.id);
            const isSelected = selectedPixels.includes(pixel.id);
            
            return (
              <Card
                key={pixel.id}
                className={cn(
                  "transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden relative",
                  pixel.isFeatured && "border-primary/50 bg-primary/5 shadow-primary/20",
                  pixel.boostLevel >= 3 && "ring-2 ring-accent/50",
                  isSelected && "ring-2 ring-blue-500 bg-blue-500/5",
                  viewMode === 'list' && "flex flex-row",
                  "hover:scale-[1.02] hover:-translate-y-1"
                )}
                onClick={() => {
                  if (selectedPixels.includes(pixel.id)) {
                    setSelectedPixels(prev => prev.filter(id => id !== pixel.id));
                  } else {
                    setSelectedPixels(prev => [...prev, pixel.id]);
                  }
                }}
              >
                {/* Enhanced Boost Level Indicator */}
                {pixel.boostLevel > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className={cn(
                      "text-xs px-2 py-1 shadow-lg",
                      pixel.boostLevel >= 4 ? "bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" :
                      pixel.boostLevel >= 2 ? "bg-gradient-to-r from-blue-500 to-purple-500" :
                      "bg-gradient-to-r from-green-500 to-blue-500"
                    )}>
                      <Flame className="h-3 w-3 mr-1" />
                      Boost {pixel.boostLevel}
                    </Badge>
                  </div>
                )}

                {/* Market Score */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-background/90 text-foreground text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {pixel.marketScore}
                  </Badge>
                </div>

                <div className={cn(viewMode === 'list' ? "flex w-full" : "")}>
                  {/* Enhanced Image Section */}
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === 'grid' ? "aspect-square" : "w-32 h-32 flex-shrink-0"
                  )}>
                    {pixel.imageUrl && (
                      <img 
                        src={pixel.imageUrl} 
                        alt={pixel.title}
                        data-ai-hint={pixel.dataAiHint}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Enhanced Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePixel(pixel.id);
                        }}
                        className="transform hover:scale-110 transition-transform"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoritePixel(pixel.id);
                        }}
                        className={cn(
                          "transform hover:scale-110 transition-transform",
                          isFavorite && "bg-red-500 text-white"
                        )}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="transform hover:scale-110 transition-transform"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="transform hover:scale-110 transition-transform"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Enhanced Status Badges */}
                    <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                      {pixel.isHot && (
                        <Badge className="text-xs bg-red-500 hover:bg-red-500 animate-pulse">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                      {pixel.isTrending && (
                        <Badge className="text-xs bg-orange-500 hover:bg-orange-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {pixel.isAnimated && (
                        <Badge className="text-xs bg-blue-500 hover:bg-blue-500">
                          <Zap className="h-3 w-3 mr-1" />
                          Animado
                        </Badge>
                      )}
                      {pixel.isInteractive && (
                        <Badge className="text-xs bg-purple-500 hover:bg-purple-500">
                          <Target className="h-3 w-3 mr-1" />
                          Interativo
                        </Badge>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {pixel.discount && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white animate-bounce">
                          -{pixel.discount}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content */}
                  <div className={cn(
                    "p-4 flex-1 space-y-3",
                    viewMode === 'list' && "flex flex-col justify-between"
                  )}>
                    {/* Header with Price Change */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {pixel.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              ({pixel.coordinates.x}, {pixel.coordinates.y}) • {pixel.region}
                            </span>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs ml-2", rarityColors[pixel.rarity])}
                        >
                          {rarityLabels[pixel.rarity]}
                        </Badge>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pixel.description}
                      </p>
                      
                      {/* Enhanced Tags */}
                      <div className="flex flex-wrap gap-1">
                        {pixel.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs hover:bg-primary/20 transition-colors cursor-pointer">
                            #{tag}
                          </Badge>
                        ))}
                        {pixel.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{pixel.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Owner Section */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-2 ring-border">
                        <AvatarImage 
                          src={pixel.owner.avatar} 
                          alt={pixel.owner.name}
                          data-ai-hint={pixel.owner.dataAiHint}
                        />
                        <AvatarFallback className="text-xs">
                          {pixel.owner.name.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium truncate">{pixel.owner.name}</span>
                          {pixel.owner.verified && (
                            <Star className="h-3 w-3 text-blue-500 fill-current" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            Nv.{pixel.owner.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <Eye className="h-3 w-3" />
                          {formatNumber(pixel.views)}
                        </span>
                        <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="h-3 w-3" />
                          {formatNumber(pixel.likes)}
                        </span>
                        <span className="flex items-center gap-1 hover:text-green-500 transition-colors">
                          <MessageSquare className="h-3 w-3" />
                          {formatNumber(pixel.comments)}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Enhanced Price Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {pixel.discount && pixel.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {pixel.originalPrice}€
                            </span>
                          )}
                          <span className="text-lg font-bold text-primary">
                            {pixel.price}€
                          </span>
                        </div>
                        
                        {priceChange.percentage !== 0 && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            priceChange.percentage > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {priceChange.percentage > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(priceChange.percentage).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setPlayPurchaseSound(true);
                            removeCredits(pixel.price);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            toast({
                              title: "Compra Bem-Sucedida!",
                              description: `Você comprou o pixel "${pixel.title}" por ${pixel.price} créditos.`,
                            });
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Comprar
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoritePixel(pixel.id);
                          }}
                        >
                          <Bookmark className={cn(
                            "h-4 w-4",
                            isFavorite && "fill-current text-red-500"
                          )} />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Empty State */}
        {filteredPixels.length === 0 && (
          <Card className="p-12 text-center bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                <div className="absolute inset-0 animate-ping">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Nenhum pixel encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os seus filtros ou pesquisar por outros termos
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setSortBy('trending');
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Button variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Sugestões
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
