
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShoppingCart, TrendingUp, Star, MapPin, Clock, Filter, Search,
  Eye, Heart, Share2, Gavel, Zap, Crown, Gem, Award, AlertTriangle,
  DollarSign, Calendar, Users, BarChart3, ArrowUpDown, SortAsc,
  Flame, Package, Sparkles, ChevronDown, ChevronUp, ExternalLink,
  Bookmark, MessageSquare, Flag, Gift, Coins, Timer, Target, Palette,
  Wallet, History, RefreshCw, Bell, Settings, HelpCircle, Info, Plus,
  ArrowUp, ArrowDown, TrendingDown, Layers, Map, Globe, Compass, Maximize2, Activity,
  BookImage, Handshake, List
} from "lucide-react";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import EnhancedPixelPurchaseModal from '@/components/pixel-grid/EnhancedPixelPurchaseModal';
import { Confetti } from '@/components/ui/confetti';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
type ListingType = 'fixed' | 'auction' | 'offer';
type SortOption = 'price_asc' | 'price_desc' | 'rarity' | 'recent' | 'ending_soon' | 'popular' | 'featured';
type FilterCategory = 'all' | 'featured' | 'auction' | 'fixed' | 'offer' | 'rare' | 'region';

interface PixelListing {
  id: string;
  coordinates: { x: number; y: number };
  region: string;
  price: number;
  type: ListingType;
  rarity: PixelRarity;
  seller: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    rating: number;
    verified: boolean;
    level: number;
    totalSales: number;
  };
  description?: string;
  imageUrl?: string;
  dataAiHint?: string;
  tags: string[];
  views: number;
  likes: number;
  watchers: number;
  bids?: {
    count: number;
    highest: number;
    endTime: Date;
    bidders: string[];
  };
  history: {
    previousPrice?: number;
    lastSold?: Date;
    totalSales: number;
    priceHistory: { price: number; date: Date }[];
  };
  features: string[];
  createdAt: Date;
  isHot?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  discount?: number;
  originalPrice?: number;
}

const mockListings: PixelListing[] = [
  {
    id: '1',
    coordinates: { x: 245, y: 156 },
    region: 'Lisboa',
    price: 250,
    originalPrice: 300,
    discount: 17,
    type: 'auction',
    rarity: 'epic',
    seller: {
      id: 'seller1',
      name: 'PixelCollector',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.8,
      verified: true,
      level: 25,
      totalSales: 156
    },
    description: 'Pixel raro na zona histórica de Lisboa com vista para o Tejo. Localização premium com alto potencial de valorização.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['histórico', 'vista-rio', 'centro', 'premium'],
    views: 1247,
    likes: 89,
    watchers: 23,
    bids: {
      count: 12,
      highest: 280,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      bidders: ['user1', 'user2', 'user3']
    },
    history: {
      previousPrice: 180,
      lastSold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalSales: 3,
      priceHistory: [
        { price: 150, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        { price: 180, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        { price: 220, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Vista panorâmica', 'Zona turística', 'Transporte público', 'Património UNESCO'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isHot: true,
    isFeatured: true,
    isSponsored: true
  },
  {
    id: '2',
    coordinates: { x: 123, y: 89 },
    region: 'Porto',
    price: 150,
    type: 'fixed',
    rarity: 'rare',
    seller: {
      id: 'seller2',
      name: 'ArtMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.6,
      verified: false,
      level: 18,
      totalSales: 89
    },
    description: 'Pixel artístico na Ribeira do Porto, perfeito para colecionadores de arte digital.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['ribeira', 'arte', 'património', 'cultural'],
    views: 856,
    likes: 67,
    watchers: 15,
    history: {
      totalSales: 1,
      priceHistory: [
        { price: 120, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Património UNESCO', 'Zona artística', 'Rio Douro'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isHot: false,
    isFeatured: false
  },
  {
    id: '3',
    coordinates: { x: 67, y: 234 },
    region: 'Coimbra',
    price: 75,
    type: 'offer',
    rarity: 'uncommon',
    seller: {
      id: 'seller3',
      name: 'StudentPixel',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.2,
      verified: false,
      level: 12,
      totalSales: 23
    },
    description: 'Pixel universitário perto da UC, ideal para investimento a longo prazo.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['universidade', 'estudantes', 'cultura', 'investimento'],
    views: 432,
    likes: 23,
    watchers: 8,
    history: {
      totalSales: 0,
      priceHistory: []
    },
    features: ['Zona universitária', 'Vida noturna', 'Biblioteca Joanina'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    coordinates: { x: 345, y: 123 },
    region: 'Braga',
    price: 95,
    type: 'auction',
    rarity: 'rare',
    seller: {
      id: 'seller4',
      name: 'BragaExplorer',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.7,
      verified: true,
      level: 20,
      totalSales: 67
    },
    description: 'Pixel histórico no centro de Braga, próximo ao Santuário do Bom Jesus.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['histórico', 'religioso', 'turismo', 'centro'],
    views: 623,
    likes: 45,
    watchers: 12,
    bids: {
      count: 8,
      highest: 110,
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
      bidders: ['user4', 'user5']
    },
    history: {
      totalSales: 2,
      priceHistory: [
        { price: 80, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Santuário', 'Centro histórico', 'Arquitetura barroca'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isHot: true
  },
  {
    id: '5',
    coordinates: { x: 512, y: 345 },
    region: 'Algarve',
    price: 320,
    type: 'fixed',
    rarity: 'legendary',
    seller: {
      id: 'seller5',
      name: 'BeachLover',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.9,
      verified: true,
      level: 30,
      totalSales: 215
    },
    description: 'Pixel lendário com vista para as famosas falésias do Algarve. Localização única e exclusiva.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['praia', 'falésias', 'turismo', 'exclusivo', 'vista-mar'],
    views: 2345,
    likes: 178,
    watchers: 45,
    history: {
      previousPrice: 280,
      lastSold: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      totalSales: 2,
      priceHistory: [
        { price: 250, date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
        { price: 280, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Vista para o mar', 'Zona turística premium', 'Acesso a praias', 'Pôr-do-sol espetacular'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isHot: true,
    isFeatured: true
  },
  {
    id: '6',
    coordinates: { x: 423, y: 178 },
    region: 'Évora',
    price: 110,
    type: 'fixed',
    rarity: 'uncommon',
    seller: {
      id: 'seller6',
      name: 'HistoryBuff',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.3,
      verified: false,
      level: 15,
      totalSales: 42
    },
    description: 'Pixel no centro histórico de Évora, próximo ao Templo Romano. Excelente para amantes de história.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['histórico', 'património', 'romano', 'cultura'],
    views: 532,
    likes: 37,
    watchers: 9,
    history: {
      totalSales: 1,
      priceHistory: [
        { price: 95, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Centro histórico', 'Património UNESCO', 'Arquitetura romana'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    coordinates: { x: 289, y: 456 },
    region: 'Madeira',
    price: 180,
    originalPrice: 220,
    discount: 18,
    type: 'auction',
    rarity: 'epic',
    seller: {
      id: 'seller7',
      name: 'IslandDreamer',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.7,
      verified: true,
      level: 22,
      totalSales: 78
    },
    description: 'Pixel épico com vista para o oceano Atlântico na ilha da Madeira. Perfeito para colecionadores.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['ilha', 'oceano', 'natureza', 'montanha', 'exclusivo'],
    views: 1123,
    likes: 98,
    watchers: 27,
    bids: {
      count: 15,
      highest: 195,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
      bidders: ['user7', 'user8', 'user9', 'user10']
    },
    history: {
      previousPrice: 150,
      lastSold: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      totalSales: 2,
      priceHistory: [
        { price: 120, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        { price: 150, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Vista para o oceano', 'Clima tropical', 'Biodiversidade única', 'Levadas próximas'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    isHot: true,
    isFeatured: true
  },
  {
    id: '8',
    coordinates: { x: 567, y: 234 },
    region: 'Açores',
    price: 140,
    type: 'offer',
    rarity: 'rare',
    seller: {
      id: 'seller8',
      name: 'VolcanoExplorer',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.5,
      verified: true,
      level: 19,
      totalSales: 56
    },
    description: 'Pixel raro localizado próximo às lagoas vulcânicas dos Açores. Uma verdadeira joia natural.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    tags: ['vulcão', 'lagoa', 'natureza', 'ilha', 'verde'],
    views: 876,
    likes: 76,
    watchers: 18,
    history: {
      totalSales: 1,
      priceHistory: [
        { price: 125, date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000) }
      ]
    },
    features: ['Lagoas vulcânicas', 'Paisagem verde', 'Biodiversidade única', 'Termas naturais'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isHot: false,
    isFeatured: false
  }
];

const rarityColors: Record<PixelRarity, string> = {
  common: 'text-gray-500 border-gray-500 bg-gray-500/10',
  uncommon: 'text-green-500 border-green-500 bg-green-500/10',
  rare: 'text-blue-500 border-blue-500 bg-blue-500/10',
  epic: 'text-purple-500 border-purple-500 bg-purple-500/10',
  legendary: 'text-orange-500 border-orange-500 bg-orange-500/10',
  unique: 'text-pink-500 border-pink-500 bg-pink-500/10'
};

const rarityLabels: Record<PixelRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  unique: 'Único'
};

const regionOptions = [
  { value: 'all', label: 'Todas as Regiões' },
  { value: 'Lisboa', label: 'Lisboa' },
  { value: 'Porto', label: 'Porto' },
  { value: 'Coimbra', label: 'Coimbra' },
  { value: 'Braga', label: 'Braga' },
  { value: 'Algarve', label: 'Algarve' },
  { value: 'Évora', label: 'Évora' },
  { value: 'Madeira', label: 'Madeira' },
  { value: 'Açores', label: 'Açores' }
];

const priceRanges = [
  { value: 'all', label: 'Qualquer Preço' },
  { value: '0-50', label: 'Até 50€' },
  { value: '50-100', label: 'De 50€ a 100€' },
  { value: '100-200', label: 'De 100€ a 200€' },
  { value: '200-500', label: 'De 200€ a 500€' },
  { value: '500+', label: 'Acima de 500€' }
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<PixelListing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<PixelListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<PixelRarity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<any>(null);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [playHoverSound, setPlayHoverSound] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playPurchaseSound, setPlayPurchaseSound] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addCredits, removeCredits } = useUserStore();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = listings.filter(listing => {
      const matchesSearch = !searchQuery || 
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        listing.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRarity = selectedRarity === 'all' || listing.rarity === selectedRarity;
      const matchesType = selectedType === 'all' || listing.type === selectedType;
      const matchesRegion = selectedRegion === 'all' || listing.region === selectedRegion;
      
      // Handle price range filtering
      let matchesPrice = true;
      if (selectedPriceRange !== 'all') {
        const [min, max] = selectedPriceRange.split('-').map(Number);
        if (max) {
          matchesPrice = listing.price >= min && listing.price <= max;
        } else {
          // For "500+" case
          matchesPrice = listing.price >= min;
        }
      }
      
      // Handle tab filtering
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'featured' && listing.isFeatured) ||
        (activeTab === 'auction' && listing.type === 'auction') ||
        (activeTab === 'fixed' && listing.type === 'fixed') ||
        (activeTab === 'offer' && listing.type === 'offer') ||
        (activeTab === 'rare' && (listing.rarity === 'rare' || listing.rarity === 'epic' || listing.rarity === 'legendary' || listing.rarity === 'unique')) ||
        (activeTab === 'region' && selectedRegion !== 'all' && listing.region === selectedRegion);
      
      return matchesSearch && matchesRarity && matchesType && matchesRegion && matchesPrice && matchesTab;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, unique: 6 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'ending_soon':
          if (a.type === 'auction' && b.type === 'auction' && a.bids && b.bids) {
            return a.bids.endTime.getTime() - b.bids.endTime.getTime();
          }
          return 0;
        case 'popular':
          return (b.views + b.likes + b.watchers) - (a.views + a.likes + a.watchers);
        case 'featured':
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;
          return (b.views + b.likes) - (a.views + a.likes);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedRarity, selectedType, selectedRegion, selectedPriceRange, sortBy, activeTab]);

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Terminado";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleWatchListing = (listingId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setListings(prev => prev.map(listing => 
      listing.id === listingId 
        ? { ...listing, watchers: listing.watchers + 1 }
        : listing
    ));
    
    toast({
      title: "Adicionado à Lista de Observação",
      description: "Será notificado sobre atualizações neste pixel.",
    });
  };

  const handleLikeListing = (listingId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setListings(prev => prev.map(listing => 
      listing.id === listingId 
        ? { ...listing, likes: listing.likes + 1 }
        : listing
    ));
    
    toast({
      title: "Pixel Curtido!",
      description: "O seu gosto foi registado com sucesso.",
    });
  };

  const handleShareListing = (listingId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toast({
      title: "Link Copiado",
      description: "Link do pixel copiado para a área de transferência.",
    });
  };

  const handleListingClick = (listing: PixelListing) => {
    const pixelData = {
      x: listing.coordinates.x,
      y: listing.coordinates.y,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      owner: listing.seller.name,
      price: listing.price,
      lastSold: listing.history.lastSold || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      views: listing.views,
      likes: listing.likes,
      rarity: rarityLabels[listing.rarity] as any,
      region: listing.region,
      isProtected: Math.random() > 0.8,
      history: listing.history.priceHistory.map(h => ({
        owner: listing.seller.name,
        date: h.date,
        price: h.price,
        action: 'purchase' as const
      })),
      features: listing.features,
      description: listing.description,
      tags: listing.tags,
      gpsCoords: { lat: 38.7223 + Math.random() * 0.1, lon: -9.1393 + Math.random() * 0.1 }
    };
    
    setSelectedPixel(pixelData);
    setShowPixelModal(true);
  };

  const handlePurchase = async (pixelData: any, paymentMethod: string, customizations: any) => {
    setPlayPurchaseSound(true);
    setShowConfetti(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update user credits
    removeCredits(pixelData.price);
    
    // Add some XP and bonus credits for the purchase
    addCredits(Math.floor(pixelData.price * 0.05)); // 5% cashback
    
    toast({
      title: "Compra Bem-Sucedida!",
      description: `Parabéns! O pixel (${pixelData.x}, ${pixelData.y}) é seu.`,
    });
    
    return true;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRarity('all');
    setSelectedType('all');
    setSelectedRegion('all');
    setSelectedPriceRange('all');
    setSortBy('featured');
    setActiveTab('all');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.HOVER} play={playHoverSound} onEnd={() => setPlayHoverSound(false)} volume={0.2} />
      <SoundEffect src={SOUND_EFFECTS.PURCHASE} play={playPurchaseSound} onEnd={() => setPlayPurchaseSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
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
                  Marketplace de Píxeis
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Descubra, compre e venda píxeis únicos no maior marketplace de Portugal
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="button-hover-lift"
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Meus Anúncios
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 button-hover-lift"
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vender Pixel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Píxeis à Venda</p>
                    <p className="text-2xl font-bold">2.573K</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12.3%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Leilões Ativos</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +8.7%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preço Médio</p>
                    <p className="text-2xl font-bold">42,35€</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +5.4%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Volume (24h)</p>
                    <p className="text-2xl font-bold">89.2K€</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +18.9%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por localização, vendedor, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/70 focus:border-primary"
                />
              </div>

              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FilterCategory)}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-12 bg-background/50">
                  <TabsTrigger value="all" className="text-xs">
                    <Globe className="h-4 w-4 mr-1" />
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="featured" className="text-xs">
                    <Star className="h-4 w-4 mr-1" />
                    Destaque
                  </TabsTrigger>
                  <TabsTrigger value="auction" className="text-xs">
                    <Gavel className="h-4 w-4 mr-1" />
                    Leilões
                  </TabsTrigger>
                  <TabsTrigger value="fixed" className="text-xs">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Preço Fixo
                  </TabsTrigger>
                  <TabsTrigger value="offer" className="text-xs">
                    <Handshake className="h-4 w-4 mr-1" />
                    Ofertas
                  </TabsTrigger>
                  <TabsTrigger value="rare" className="text-xs">
                    <Gem className="h-4 w-4 mr-1" />
                    Raros
                  </TabsTrigger>
                  <TabsTrigger value="region" className="text-xs">
                    <Map className="h-4 w-4 mr-1" />
                    Por Região
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Em Destaque</SelectItem>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="price_asc">Preço: Menor</SelectItem>
                      <SelectItem value="price_desc">Preço: Maior</SelectItem>
                      <SelectItem value="rarity">Raridade</SelectItem>
                      <SelectItem value="ending_soon">A Terminar</SelectItem>
                      <SelectItem value="popular">Mais Populares</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full sm:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-muted-foreground">
                    {filteredListings.length} píxeis encontrados
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-9 w-9"
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-9 w-9"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="p-4 border rounded-lg bg-muted/20 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo de Venda</label>
                      <Select value={selectedType} onValueChange={(value: ListingType | 'all') => setSelectedType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="fixed">Preço Fixo</SelectItem>
                          <SelectItem value="auction">Leilão</SelectItem>
                          <SelectItem value="offer">Aceita Ofertas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Raridade</label>
                      <Select value={selectedRarity} onValueChange={(value: PixelRarity | 'all') => setSelectedRarity(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {Object.entries(rarityLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Região</label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {regionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
                      <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="mr-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>
                      Aplicar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="h-[400px] bg-muted/50">
                <div className="h-48 bg-muted/70 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted/70 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted/70 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-muted/70 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted/70 rounded w-1/3"></div>
                    <div className="h-6 bg-muted/70 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Listings */}
            {filteredListings.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pixel encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os seus filtros ou pesquisar por outros termos
                </p>
                <Button onClick={clearFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </Card>
            ) : (
              <div className={cn(
                "gap-6",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "space-y-4"
              )}>
                {filteredListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-xl cursor-pointer group overflow-hidden",
                      listing.isFeatured && "border-primary/50 bg-primary/5 shadow-lg shadow-primary/20",
                      listing.isSponsored && "ring-2 ring-accent/50",
                      viewMode === 'list' && "flex flex-row"
                    )}
                    onClick={() => handleListingClick(listing)}
                    onMouseEnter={() => setPlayHoverSound(true)}
                  >
                    {/* Sponsored Tag */}
                    {listing.isSponsored && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge className="bg-accent text-accent-foreground text-xs px-2 py-1">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Patrocinado
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
                      )}>
                        {listing.imageUrl && (
                          <img 
                            src={listing.imageUrl} 
                            alt={`Pixel em ${listing.region}`}
                            data-ai-hint={listing.dataAiHint}
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
                                  onClick={(e) => handleLikeListing(listing.id, e)}
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
                                  onClick={(e) => handleWatchListing(listing.id, e)}
                                >
                                  <Bookmark className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Observar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => handleShareListing(listing.id, e)}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Partilhar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {listing.isHot && (
                            <Badge className="text-xs bg-red-500 hover:bg-red-500">
                              <Flame className="h-3 w-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                          {listing.isFeatured && (
                            <Badge className="text-xs bg-yellow-500 hover:bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              Destaque
                            </Badge>
                          )}
                          {listing.discount && (
                            <Badge className="text-xs bg-green-500 hover:bg-green-500">
                              -{listing.discount}%
                            </Badge>
                          )}
                        </div>

                        {/* Auction Timer */}
                        {listing.type === 'auction' && listing.bids && (
                          <div className="absolute bottom-2 right-2">
                            <Badge variant="destructive" className="text-xs">
                              <Timer className="h-3 w-3 mr-1" />
                              {getTimeRemaining(listing.bids.endTime)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn(
                        "p-4 flex-1",
                        viewMode === 'list' && "flex flex-col justify-between"
                      )}>
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                ({listing.coordinates.x}, {listing.coordinates.y})
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {listing.region}
                              </Badge>
                            </div>
                            
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", rarityColors[listing.rarity])}
                            >
                              {rarityLabels[listing.rarity]}
                            </Badge>
                          </div>
                          
                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {listing.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {listing.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {listing.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{listing.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Owner */}
                        <div className="flex items-center gap-2 mt-3 mb-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={listing.seller.avatar} 
                              alt={listing.seller.name}
                              data-ai-hint={listing.seller.dataAiHint}
                            />
                            <AvatarFallback className="text-xs">
                              {listing.seller.name.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium truncate">{listing.seller.name}</span>
                              {listing.seller.verified && (
                                <Star className="h-3 w-3 text-blue-500 fill-current" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                Nv.{listing.seller.level}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>⭐ {listing.seller.rating}</span>
                              <span>•</span>
                              <span>{listing.seller.totalSales} vendas</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(listing.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatNumber(listing.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-3 w-3" />
                              {formatNumber(listing.watchers)}
                            </span>
                          </div>
                          
                          {listing.type === 'auction' && listing.bids && (
                            <span className="text-orange-500 font-medium">
                              {listing.bids.count} licitações
                            </span>
                          )}
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              {listing.discount && listing.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through mr-2">
                                  {listing.originalPrice}€
                                </span>
                              )}
                              <span className="text-lg font-bold text-primary">
                                {listing.price}€
                              </span>
                              {listing.type === 'auction' && listing.bids && (
                                <div className="text-xs text-muted-foreground">
                                  Licitação atual: {listing.bids.highest}€
                                </div>
                              )}
                            </div>
                            
                            {listing.history.priceHistory.length > 0 && (
                              <div className="text-right">
                                <div className="text-xs text-green-500 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  +{Math.round(((listing.price - listing.history.priceHistory[0].price) / listing.history.priceHistory[0].price) * 100)}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  vs. primeira venda
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {listing.type === 'fixed' && (
                              <Button 
                                size="sm" 
                                className="flex-1 button-hover-lift"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleListingClick(listing);
                                }}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Comprar
                              </Button>
                            )}
                            
                            {listing.type === 'auction' && (
                              <Button 
                                size="sm" 
                                className="flex-1 button-hover-lift"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleListingClick(listing);
                                }}
                              >
                                <Gavel className="h-4 w-4 mr-1" />
                                Licitar
                              </Button>
                            )}
                            
                            {listing.type === 'offer' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 button-hover-lift"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleListingClick(listing);
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Oferecer
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="px-2 button-hover-lift"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWatchListing(listing.id, e);
                              }}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Featured Collections */}
        <Card className="shadow-lg bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <CardTitle className="font-headline text-xl text-gradient-gold flex items-center">
              <BookImage className="h-6 w-6 mr-2" />
              Coleções em Destaque
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Explore coleções temáticas curadas pela comunidade
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Palette className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Arte Portuguesa</h3>
                    <p className="text-xs text-muted-foreground">45 píxeis • 12 artistas</p>
                    <Badge variant="outline" className="mt-1 text-xs">Trending</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Compass className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Maravilhas Naturais</h3>
                    <p className="text-xs text-muted-foreground">32 píxeis • 8 regiões</p>
                    <Badge variant="outline" className="mt-1 text-xs">Popular</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Crown className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pixels Lendários</h3>
                    <p className="text-xs text-muted-foreground">18 píxeis • Edição limitada</p>
                    <Badge variant="outline" className="mt-1 text-xs">Exclusivo</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Market Insights */}
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <BarChart3 className="h-5 w-5 mr-2" />
              Insights de Mercado
            </CardTitle>
            <CardDescription>
              Tendências e análises para investidores inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Regiões em Alta</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Algarve</span>
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +24%
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Lisboa</span>
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +18%
                      </span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Madeira</span>
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +15%
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Raridades Mais Procuradas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span>Lendário</span>
                    </div>
                    <span className="font-semibold">+45% procura</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span>Épico</span>
                    </div>
                    <span className="font-semibold">+32% procura</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span>Raro</span>
                    </div>
                    <span className="font-semibold">+18% procura</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Help Section */}
        <Card className="bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <HelpCircle className="h-5 w-5 mr-2" />
              Precisa de Ajuda?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <span>Guia do Marketplace</span>
                <p className="text-xs text-muted-foreground">Aprenda a comprar e vender</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <span>Suporte ao Cliente</span>
                <p className="text-xs text-muted-foreground">Tire suas dúvidas</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <span>Reportar Problema</span>
                <p className="text-xs text-muted-foreground">Ajude-nos a melhorar</p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EnhancedPixelPurchaseModal
        isOpen={showPixelModal}
        onClose={() => setShowPixelModal(false)}
        pixelData={selectedPixel}
        userCredits={12500}
        userSpecialCredits={120}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
