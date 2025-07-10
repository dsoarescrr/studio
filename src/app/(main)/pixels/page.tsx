'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Heart, MessageSquare, Star, TrendingUp, Clock, MapPin, Palette, Crown, Gem, Sparkles, Siren as Fire, Trophy, Users, Share2, Bookmark, Filter, Search, SortAsc, Grid3X3, List, BarChart3, Zap, Gift, Coins, Award, Calendar, Globe, Target, Flame, ThumbsUp, Download, ExternalLink, Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Settings, ChevronUp, ChevronDown, ArrowUp, ArrowDown, TrendingDown, Plus, RefreshCw, Bell, Flag, Info, HelpCircle, Lightbulb, Megaphone } from "lucide-react";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
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
  boostLevel: number; // 0-5, paid promotion level
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
  color?: string;
}

const mockPixels: PixelShowcase[] = [
  {
    id: '1',
    coordinates: { x: 245, y: 156 },
    title: 'Torre de Belém Pixelizada',
    description: 'Uma representação artística da icónica Torre de Belém em Lisboa, com efeitos de brilho dourado.',
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
    tags: ['lisboa', 'património', 'dourado', 'histórico'],
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
    }
  },
  {
    id: '2',
    coordinates: { x: 123, y: 89 },
    title: 'Galo de Barcelos Animado',
    description: 'O símbolo nacional português com animação de batimento de asas e cores vibrantes.',
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
    tags: ['galo', 'barcelos', 'tradição', 'animado'],
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
    }
  },
  {
    id: '3',
    coordinates: { x: 67, y: 234 },
    title: 'Pastéis de Nata Deliciosos',
    description: 'Uma homenagem ao doce mais famoso de Portugal, com efeito de vapor quente.',
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
    tags: ['pastéis', 'nata', 'doce', 'tradição'],
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
    }
  },
  {
    id: '4',
    coordinates: { x: 345, y: 123 },
    title: 'Fado Eterno',
    description: 'Uma guitarra portuguesa que toca melodias quando clicada, representando a alma do fado.',
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
    tags: ['fado', 'música', 'guitarra', 'interativo'],
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
    }
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

export default function PixelsPage() {
  const [pixels, setPixels] = useState<PixelShowcase[]>(mockPixels);
  const { addCredits, removeCredits } = useUserStore();
  const [filteredPixels, setFilteredPixels] = useState<PixelShowcase[]>(mockPixels);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedPixel, setSelectedPixel] = useState<PixelShowcase | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [playPromoteSound, setPlayPromoteSound] = useState(false);
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

  const handleBookmarkPixel = (pixelId: string) => {
    setPixels(prev => prev.map(pixel => 
      pixel.id === pixelId 
        ? { ...pixel, bookmarks: pixel.bookmarks + 1 }
        : pixel
    ));
    
    toast({
      title: "Pixel Guardado!",
      description: "Adicionado aos seus favoritos.",
    });
  };

  const handlePromotePixel = (pixelId: string, boostLevel: number) => {
    const cost = boostLevel * 50; // 50 créditos por nível
    
    removeCredits(cost);
    setPlayPromoteSound(true);
    
    setPixels(prev => prev.map(pixel => 
      pixel.id === pixelId 
        ? { ...pixel, boostLevel, isFeatured: boostLevel >= 3 }
        : pixel
    ));
    
    toast({
      title: "Pixel Promovido!",
      description: `Pixel promovido para nível ${boostLevel} por ${cost} créditos.`,
    });
    
    setShowPromotionModal(false);
  };

  const getEngagementScore = (pixel: PixelShowcase) => {
    return (pixel.views * 0.1) + (pixel.likes * 2) + (pixel.comments * 5) + (pixel.shares * 10);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playPromoteSound} onEnd={() => setPlayPromoteSound(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <Palette className="h-8 w-8 mr-3 animate-glow" />
                  Galeria de Píxeis
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Descubra, explore e promova os píxeis mais incríveis do Pixel Universe
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setShowPromotionModal(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Promover Pixel
                </Button>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Submeter Pixel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar píxeis, criadores, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/70 focus:border-primary"
                />
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
                    <TrendingUp className="h-4 w-4 mr-1" />
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
                    <Play className="h-4 w-4 mr-1" />
                    Animados
                  </TabsTrigger>
                  <TabsTrigger value="interactive" className="text-xs">
                    <Target className="h-4 w-4 mr-1" />
                    Interativos
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Mais Populares</SelectItem>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="views">Mais Vistos</SelectItem>
                      <SelectItem value="likes">Mais Curtidos</SelectItem>
                      <SelectItem value="comments">Mais Comentados</SelectItem>
                      <SelectItem value="rarity">Por Raridade</SelectItem>
                      <SelectItem value="price">Por Preço</SelectItem>
                      <SelectItem value="featured">Em Destaque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredPixels.length} píxeis encontrados
                  </span>
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

        {/* Pixels Grid/List */}
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
        )}>
          {filteredPixels.map((pixel) => (
            <Card
              key={pixel.id}
              className={cn(
                "transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden",
                pixel.isFeatured && "border-primary/50 bg-primary/5 shadow-primary/20",
                pixel.boostLevel >= 3 && "ring-2 ring-accent/50",
                viewMode === 'list' && "flex flex-row"
              )}
              onClick={() => setSelectedPixel(pixel)}
            >
              {/* Boost Level Indicator */}
              {pixel.boostLevel > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className={cn(
                    "text-xs px-2 py-1",
                    pixel.boostLevel >= 4 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                    pixel.boostLevel >= 2 ? "bg-gradient-to-r from-blue-500 to-purple-500" :
                    "bg-gradient-to-r from-green-500 to-blue-500"
                  )}>
                    <Flame className="h-3 w-3 mr-1" />
                    Boost {pixel.boostLevel}
                  </Badge>
                </div>
              )}

              <div className={cn(
                viewMode === 'list' ? "flex w-full" : ""
              )}>
                {/* Image */}
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === 'grid' ? "aspect-square" : "w-32 h-32 flex-shrink-0"
                )} >
                  {pixel.imageUrl && (
                    <img 
                      src={pixel.imageUrl} 
                      alt={pixel.title}
                      data-ai-hint={pixel.dataAiHint}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Overlay with quick actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikePixel(pixel.id);
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Curtir</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmarkPixel(pixel.id);
                            }}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Guardar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Partilhar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {pixel.isTrending && (
                      <Badge className="text-xs bg-red-500 hover:bg-red-500">
                        <Fire className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                    {pixel.isAnimated && (
                      <Badge className="text-xs bg-blue-500 hover:bg-blue-500">
                        <Play className="h-3 w-3 mr-1" />
                        Animado
                      </Badge>
                    )}
                    {pixel.isInteractive && (
                      <Badge className="text-xs bg-purple-500 hover:bg-purple-500">
                        <Target className="h-3 w-3 mr-1" />
                        Interativo
                      </Badge>
                    )}
                    {pixel.hasSound && (
                      <Badge className="text-xs bg-green-500 hover:bg-green-500">
                        <Volume2 className="h-3 w-3 mr-1" />
                        Som
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={cn(
                  "p-4 flex-1",
                  viewMode === 'list' && "flex flex-col justify-between"
                )}>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{pixel.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            ({pixel.coordinates.x}, {pixel.coordinates.y}) • {pixel.region}
                          </span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", rarityColors[pixel.rarity])}
                      >
                        {rarityLabels[pixel.rarity]}
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pixel.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {pixel.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
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

                  {/* Owner */}
                  <div className="flex items-center gap-2 mt-3 mb-3">
                    <Avatar className="h-6 w-6">
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

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(pixel.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {formatNumber(pixel.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {formatNumber(pixel.comments)}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-bold text-primary">{pixel.price}€</span>
                    </div>
                  </div>
                  
                  {/* Engagement Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">{Math.round(getEngagementScore(pixel))}</span>
                    </div>
                    <Progress 
                      value={Math.min(getEngagementScore(pixel) / 100, 100)} 
                      className="h-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Promotion Modal */}
        <Dialog open={showPromotionModal} onOpenChange={setShowPromotionModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Promover Pixel
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aumente a visibilidade do seu pixel com diferentes níveis de promoção:
              </p>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Card key={level} className="p-3 cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Nível {level}</h4>
                        <p className="text-xs text-muted-foreground">
                          {level === 1 && "Destaque básico"}
                          {level === 2 && "Destaque melhorado"}
                          {level === 3 && "Destaque premium + Featured"}
                          {level === 4 && "Destaque máximo + Trending"}
                          {level === 5 && "Destaque lendário + Topo da página"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{level * 50} créditos</p>
                        <p className="text-xs text-muted-foreground">24h</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Button 
                className="w-full"
                onClick={() => handlePromotePixel('1', 3)}
              >
                Promover Agora
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {filteredPixels.length === 0 && (
          <Card className="p-12 text-center">
            <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pixel encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os seus filtros ou pesquisar por outros termos
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
              setSortBy('trending');
            }}>
              Limpar Filtros
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
