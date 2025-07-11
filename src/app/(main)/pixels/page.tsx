'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Heart, MessageSquare, Star, TrendingUp, Clock, MapPin, Palette, Crown, Gem, Sparkles, Siren as Fire, Trophy, Users, Share2, Bookmark, Filter, Search, SortAsc, Grid3X3, List, BarChart3, Zap, Gift, Coins, Award, Calendar, Globe, Target, Flame, ThumbsUp, Download, ExternalLink, Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Settings, ChevronUp, ChevronDown, ArrowUp, ArrowDown, TrendingDown, Plus, RefreshCw, Bell, Flag, Info, HelpCircle, Lightbulb, Megaphone, Brush, Layers, Compass, Tag } from "lucide-react";
import { useUserStore, useSettingsStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { UserProfileSheet } from '@/components/user/UserProfileSheet';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique' | 'featured';
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
    followers?: number;
    verified: boolean;
  };
  rarity: PixelRarity;
  price: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  promoted?: boolean;
  createdAt: Date;
  lastModified: Date;
  imageUrl?: string;
  dataAiHint?: string;
  tags: string[];
  region: string;
  isFeatured: boolean;
  isSponsored?: boolean;
  isTrending: boolean;
  isAnimated: boolean;
  isInteractive: boolean;
  hasSound: boolean;
  effects: string[];
  boostLevel: number; // 0-5, paid promotion level
  engagement: {
    score?: number;
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
    growthRate?: number;
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
      followers: 342,
      verified: true
    },
    rarity: 'epic',
    price: 150,
    views: 15420,
    likes: 892,
    comments: 156,
    shares: 89,
    bookmarks: 234,
    promoted: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art tower',
    tags: ['lisboa', 'património', 'dourado', 'histórico'],
    region: 'Lisboa',
    isFeatured: true,
    isSponsored: true,
    isTrending: true,
    isAnimated: true,
    isInteractive: false,
    hasSound: true,
    color: '#FFD700',
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
      followers: 156,
      verified: false
    },
    rarity: 'rare',
    price: 75,
    views: 8930,
    likes: 567,
    comments: 89,
    shares: 45,
    bookmarks: 123,
    promoted: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art rooster',
    tags: ['galo', 'barcelos', 'tradição', 'animado'],
    region: 'Braga',
    isFeatured: false,
    isSponsored: false,
    isTrending: true,
    isAnimated: true,
    isInteractive: true,
    hasSound: false,
    color: '#FF5733',
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
      followers: 78,
      verified: true
    },
    rarity: 'uncommon',
    price: 25,
    views: 5670,
    likes: 345,
    comments: 67,
    shares: 23,
    bookmarks: 89,
    promoted: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art pastries',
    tags: ['pastéis', 'nata', 'doce', 'tradição'],
    region: 'Lisboa',
    isFeatured: false,
    isSponsored: false,
    isTrending: false,
    isAnimated: true,
    isInteractive: false,
    hasSound: false,
    color: '#F5DEB3',
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
      followers: 567,
      verified: true
    },
    rarity: 'legendary',
    price: 500,
    views: 23450,
    likes: 1234,
    comments: 289,
    shares: 156,
    bookmarks: 445,
    promoted: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000),
    imageUrl: 'https://placehold.co/200x200.png',
    dataAiHint: 'pixel art guitar',
    tags: ['fado', 'música', 'guitarra', 'interativo'],
    region: 'Lisboa',
    isFeatured: true,
    isSponsored: false,
    isTrending: true,
    isAnimated: true,
    isInteractive: true,
    hasSound: true,
    color: '#4682B4',
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
  featured: 'text-pink-500 bg-pink-500/10 border-pink-500/30',
  unique: 'text-pink-500 bg-pink-500/10 border-pink-500/30'
};

const rarityLabels: Record<PixelRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  featured: 'Destaque',
  unique: 'Único'
};

export default function PixelsPage() {
  const [pixels, setPixels] = useState<PixelShowcase[]>(mockPixels);
  const { addCredits, removeCredits } = useUserStore();
  const { soundEffects } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPixels, setFilteredPixels] = useState<PixelShowcase[]>(mockPixels);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedPixel, setSelectedPixel] = useState<PixelShowcase | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showPixelDetails, setShowPixelDetails] = useState(false);
  const [playPromoteSound, setPlayPromoteSound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    let filtered = pixels.filter(pixel => {
      const matchesSearch = !searchQuery || 
        pixel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pixel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pixel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pixel.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pixel.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'all' || pixel.region === selectedRegion;
      
      const matchesCategory = filterCategory === 'all' || 
        (filterCategory === 'featured' && pixel.isFeatured) ||
        (filterCategory === 'trending' && pixel.isTrending) ||
        (filterCategory === 'new' && pixel.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterCategory === 'rare' && ['epic', 'legendary', 'unique'].includes(pixel.rarity)) ||
        (filterCategory === 'animated' && pixel.isAnimated) ||
        (filterCategory === 'interactive' && pixel.isInteractive);
      
      return matchesSearch && matchesCategory && matchesRegion;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return (b.engagement.viewsToday + b.engagement.likesThisWeek) - 
                 (a.engagement.viewsToday + a.engagement.likesThisWeek);
        case 'recent':
          return b.lastModified.getTime() - a.lastModified.getTime();
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'rarity':
          if (b.isSponsored && !a.isSponsored) return 1;
          if (!b.isSponsored && a.isSponsored) return -1;
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
  }, [pixels, searchQuery, sortBy, filterCategory, selectedRegion]);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
    setShowConfetti(true);
    
    setPixels(prev => prev.map(pixel => 
      pixel.id === pixelId 
        ? { ...pixel, boostLevel, isFeatured: boostLevel >= 3, promoted: true }
        : pixel
    ));
    
    toast({
      title: "Pixel Promovido!",
      description: `Pixel promovido para nível ${boostLevel} por ${cost} créditos.`,
    });
    
    setShowPromotionModal(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setSortBy('trending');
    setSelectedRegion('all');
    setViewMode('grid');
  };

  const getEngagementScore = (pixel: PixelShowcase) => {
    return (pixel.views * 0.1) + (pixel.likes * 2) + (pixel.comments * 5) + (pixel.shares * 10);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  // Mock user data for profile sheet
  const mockUserData = {
    id: "user123", name: "Pixel Master", username: "@pixelmaster", avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "user avatar", level: 25, xp: 2450, xpMax: 3000, credits: 12500, specialCredits: 120,
    bio: "Colecionador apaixonado de pixels raros e criador de arte digital no Pixel Universe.",
    pixelsOwned: 156, achievementsUnlocked: 23, unlockedAchievementIds: ["pixel_initiate", "color_master", "community_star"],
    rank: 12, location: "Lisboa, Portugal", socials: [], albums: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect 
        src={SOUND_EFFECTS.SUCCESS} 
        play={playPromoteSound} 
        onEnd={() => setPlayPromoteSound(false)} 
        volume={0.7}
      /> 
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 z-10">
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
                <Button variant="outline" className="hover:bg-primary/10 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Submeter Pixel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/30 transition-colors">
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
              <Tabs value={filterCategory} onValueChange={(value) => setFilterCategory(value as FilterCategory)} className="animate-fade-in">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-12 bg-background/50 rounded-xl">
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
              
              {/* Region Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedRegion === 'all' ? 'default' : 'outline'} 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setSelectedRegion('all')}
                >
                  Todas as Regiões
                </Badge>
                {['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Évora', 'Madeira', 'Açores'].map(region => (
                  <Badge 
                    key={region} 
                    variant={selectedRegion === region ? 'default' : 'outline'} 
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setSelectedRegion(region)}
                  >
                    {region}
                  </Badge>
                ))}
              </div>

              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Ordenar por" />
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

                  {(searchQuery || filterCategory !== 'all' || selectedRegion !== 'all') && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
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
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Carregando Pixels</h3>
              <p className="text-muted-foreground">Aguarde enquanto carregamos os pixels mais incríveis...</p>
            </div>
          </Card>
        ) : (
          <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
        )}>
          {filteredPixels.map((pixel) => (
            <motion.div
              key={pixel.id}
              className={cn( 
                "transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden",
                pixel.isFeatured && "border-primary/50 bg-primary/5 shadow-primary/20",
                pixel.boostLevel >= 3 && "ring-2 ring-accent/50",
                viewMode === 'list' && "flex flex-row"
              )}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              onClick={() => { setSelectedPixel(pixel); setShowPixelDetails(true); }} 
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
              
              {/* Promoted Badge */}
              {pixel.promoted && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">Promovido</Badge>
                </div>
              )}

              <Card className={cn(
                "w-full",
                viewMode === 'list' ? "flex" : ""
              )}>
                {/* Image */}
                <div className={cn(
                  "relative overflow-hidden group",
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
                  
                  {/* Enhanced Overlay with quick actions */}
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
                        <TooltipContent>Curtir Pixel</TooltipContent>
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
                        <TooltipContent>Guardar Pixel</TooltipContent>
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
                    
                    <TooltipProvider>
                      <Tooltip> 
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => { e.stopPropagation(); setShowPromotionModal(true); }}
                          >
                            <Megaphone className="h-4 w-4" />
                          </Button> 
                        </TooltipTrigger>
                        <TooltipContent>Promover Pixel</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {pixel.isTrending && (
                      <Badge className="text-xs bg-red-500 hover:bg-red-500">
                        <Fire className="h-3 w-3 mr-1" />
                        Trending
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
                    {pixel.rarity === 'legendary' && (
                      <Badge className="text-xs bg-amber-500 hover:bg-amber-500">
                        <Crown className="h-3 w-3 mr-1" />
                        Lendário
                      </Badge>
                    )}
                  </div>

                  {/* Price Indicator */}
                  {pixel.price > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {pixel.price}€
                    </div>
                  )} 
                </div>

                {/* Enhanced Content */}
                <div className={cn(
                  "p-4 flex-1",
                  viewMode === 'list' && "flex flex-col justify-between"
                )}>
                  <div className="space-y-2"> 
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-1">{pixel.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            ({pixel.coordinates.x}, {pixel.coordinates.y}) • <span className="hover:text-primary cursor-pointer" onClick={(e) => {e.stopPropagation(); setSelectedRegion(pixel.region);}}>{pixel.region}</span>
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
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

                  {/* Enhanced Owner Section */}
                  <div className="flex items-center gap-2 mt-3 mb-3"> 
                    <UserProfileSheet 
                      userData={{
                        ...mockUserData,
                        name: pixel.owner.name,
                        avatarUrl: pixel.owner.avatar,
                        level: pixel.owner.level,
                        rank: Math.floor(Math.random() * 100) + 1
                      }} 
                      achievementsData={[]}
                    >
                      <div className="cursor-pointer hover:scale-110 transition-transform">
                        <Avatar className="h-6 w-6 border border-primary/30">
                          <AvatarImage src={pixel.owner.avatar} alt={pixel.owner.name} data-ai-hint={pixel.owner.dataAiHint} />
                          <AvatarFallback className="text-xs">{pixel.owner.name.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </UserProfileSheet>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <UserProfileSheet 
                          userData={{
                            ...mockUserData,
                            name: pixel.owner.name,
                            avatarUrl: pixel.owner.avatar,
                            level: pixel.owner.level,
                            rank: Math.floor(Math.random() * 100) + 1
                          }} 
                          achievementsData={[]}
                        >
                          <span className="text-xs font-medium truncate hover:text-primary transition-colors cursor-pointer">{pixel.owner.name}</span>
                        </UserProfileSheet>
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
                  
                  <Separator className="bg-border/50" /> 
                  
                  {/* Engagement Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">{Math.round(getEngagementScore(pixel))}</span>
                    </div>
                    <Progress  
                      value={Math.min(getEngagementScore(pixel) / 100, 100)}
                      className="h-2 rounded-full"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredPixels.length > 0 && (
            <Button variant="outline" className="w-full mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Carregar Mais Pixels
            </Button>
          )}
        </div>
        )}

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
        
        {/* Pixel Details Dialog */} 
        <Dialog open={showPixelDetails} onOpenChange={setShowPixelDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            {selectedPixel && (
              <>
                <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
                       style={{ backgroundSize: '200% 200%' }} />
                  <div className="relative"> 
                    <DialogTitle className="flex items-center gap-3 font-headline text-2xl text-gradient-gold">
                      <div className={cn(
                        "p-2 rounded-xl",
                        rarityColors[selectedPixel.rarity].replace('text-', 'bg-').replace('/10', '/20')
                      )}>
                        <MapPin className={cn("h-6 w-6", rarityColors[selectedPixel.rarity].split(' ')[0])} />
                      </div>
                      {selectedPixel.title} 
                    </DialogTitle>
                    <CardDescription className="mt-2">
                      {selectedPixel.description}
                    </CardDescription>
                  </div>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"> 
                  {/* Left Column - Image and Stats */}
                  <div className="space-y-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-primary/30">
                      {selectedPixel.imageUrl ? (
                        <img 
                          src={selectedPixel.imageUrl} 
                          alt={selectedPixel.title}
                          className="w-full h-full object-cover" 
                          data-ai-hint={selectedPixel.dataAiHint}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <div className="text-center text-white drop-shadow-lg">
                            <div className="text-2xl font-bold">({selectedPixel.coordinates.x}, {selectedPixel.coordinates.y})</div>
                            <div className="text-sm opacity-80">{selectedPixel.region}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badges */} 
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge className={cn(rarityColors[selectedPixel.rarity])}>
                          {rarityLabels[selectedPixel.rarity]}
                        </Badge>
                        {selectedPixel.isAnimated && (
                          <Badge className="bg-blue-500">Animado</Badge>
                        )}
                        {selectedPixel.isInteractive && (
                          <Badge className="bg-purple-500">Interativo</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-3 bg-muted/20 text-center">
                        <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="font-bold">{selectedPixel.views.toLocaleString('pt-PT')}</p>
                        <p className="text-xs text-muted-foreground">Visualizações</p>
                      </Card>
                      <Card className="p-3 bg-muted/20 text-center">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                        <p className="font-bold">{selectedPixel.likes.toLocaleString('pt-PT')}</p>
                        <p className="text-xs text-muted-foreground">Curtidas</p>
                      </Card>
                      <Card className="p-3 bg-muted/20 text-center">
                        <MessageSquare className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="font-bold">{selectedPixel.comments.toLocaleString('pt-PT')}</p>
                        <p className="text-xs text-muted-foreground">Comentários</p>
                      </Card>
                    </div>

                    <Card className="p-4 bg-muted/20">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Layers className="h-4 w-4 mr-2 text-primary" />
                        Características Especiais
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPixel.effects.map(effect => (
                          <Badge key={effect} variant="outline" className="text-primary border-primary/50">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Right Column - Details and Purchase */}
                  <div className="space-y-4">
                    <Card className="p-4 bg-muted/20">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Detalhes do Pixel
                      </h3>
                      <div className="space-y-2"> 
                        <div className="flex justify-between text-sm py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Coordenadas</span>
                          <span className="font-medium">({selectedPixel.coordinates.x}, {selectedPixel.coordinates.y})</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Região</span>
                          <span className="font-medium">{selectedPixel.region}</span>
                        </div> 
                        <div className="flex justify-between text-sm py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Proprietário</span>
                          <UserProfileSheet 
                            userData={{...mockUserData, name: selectedPixel.owner.name, avatarUrl: selectedPixel.owner.avatar}} 
                            achievementsData={[]}
                          >
                            <span className="font-medium flex items-center cursor-pointer hover:text-primary transition-colors">
                              {selectedPixel.owner.name}
                            {selectedPixel.owner.verified && (
                              <Star className="h-3 w-3 ml-1 text-blue-500 fill-current" />
                            )}
                            </span>
                          </UserProfileSheet>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Data de Criação</span>
                          <span className="font-medium">{selectedPixel.createdAt.toLocaleDateString('pt-PT')}</span> 
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-border/30">
                          <span className="text-muted-foreground">Última Modificação</span>
                          <span className="font-medium">{selectedPixel.lastModified.toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Brush className="h-4 w-4 mr-2 text-primary" />
                        Personalização
                      </h3>
                      <div className="space-y-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          onClick={() => {
                            setShowPixelDetails(false);
                            toast({
                              title: "Editor Aberto",
                              description: "O editor de pixel foi aberto.",
                            });
                          }}
                        >
                          <Brush className="h-4 w-4 mr-2" />
                          Editar Pixel
                        </Button> 
                        
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartilhar
                          </Button>
                          <Button  
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setShowPixelDetails(false);
                              setShowPromotionModal(true);
                            }}
                          >
                            <Megaphone className="h-4 w-4 mr-2" />
                            Promover
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-muted/20">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-purple-500" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPixel.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="hover:bg-primary/10 cursor-pointer transition-colors"> 
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="p-4 border-t">
                  <Button variant="outline" onClick={() => setShowPixelDetails(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog> 
        
        {/* Tips and Tricks Section */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Dicas para Criadores de Pixel Art
            </CardTitle> 
            <CardDescription>
              Estratégias para criar pixels impressionantes e aumentar seu engajamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2"> 
                  <Palette className="h-4 w-4 mr-2 text-blue-500" />
                  Escolha de Cores
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use paletas de cores limitadas e harmoniosas para criar pixel art mais coesa e visualmente atraente.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner"> 
                <h3 className="font-semibold flex items-center mb-2">
                  <Zap className="h-4 w-4 mr-2 text-purple-500" />
                  Animações Simples
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adicione pequenas animações para dar vida aos seus pixels e aumentar o engajamento dos visitantes.
                </p>
              </div> 
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Target className="h-4 w-4 mr-2 text-green-500" />
                  Localização Estratégica
                </h3>
                <p className="text-sm text-muted-foreground">
                  Escolha localizações em áreas populares ou com significado histórico para aumentar a visibilidade.
                </p> 
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Compass className="h-4 w-4 mr-2" />
              Explorar Tutoriais de Pixel Art
            </Button> 
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}