
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
  BookImage
} from "lucide-react";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import EnhancedPixelPurchaseModal from '@/components/pixel-grid/EnhancedPixelPurchaseModal';
import { UserProfileSheet } from '@/components/user/UserProfileSheet';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { RequireAuth } from '@/components/auth/RequireAuth';
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
    followers?: number;
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
  comments?: number;
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
  culturalValue?: string;
  investmentRating?: number; // 1-5 stars
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
      followers: 342,
      verified: true,
      level: 25,
      totalSales: 156
    },
    description: 'Pixel raro na zona histórica de Lisboa com vista para o Tejo. Localização premium com alto potencial de valorização.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Alto valor cultural por estar localizado em zona histórica de Lisboa com vista para o Tejo.',
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
    investmentRating: 5,
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
      followers: 156,
      verified: false,
      level: 18,
      totalSales: 89
    },
    description: 'Pixel artístico na Ribeira do Porto, perfeito para colecionadores de arte digital.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural significativo por representar a histórica Ribeira do Porto, Patrimônio Mundial da UNESCO.',
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
    investmentRating: 4,
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
      followers: 78,
      verified: false,
      level: 12,
      totalSales: 23
    },
    description: 'Pixel universitário perto da UC, ideal para investimento a longo prazo.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural educacional por estar próximo à Universidade de Coimbra, uma das mais antigas da Europa.',
    tags: ['universidade', 'estudantes', 'cultura', 'investimento'],
    views: 432,
    likes: 23,
    watchers: 8,
    history: {
      totalSales: 0,
      priceHistory: []
    },
    investmentRating: 3,
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
      followers: 234,
      verified: true,
      level: 20,
      totalSales: 67
    },
    description: 'Pixel histórico no centro de Braga, próximo ao Santuário do Bom Jesus.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Alto valor cultural religioso por estar próximo ao Santuário do Bom Jesus, importante local de peregrinação.',
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
    investmentRating: 4,
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
      followers: 567,
      verified: true,
      level: 30,
      totalSales: 215
    },
    description: 'Pixel lendário com vista para as famosas falésias do Algarve. Localização única e exclusiva.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural e natural excepcional por representar as icônicas falésias do Algarve, um dos cartões postais de Portugal.',
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
    investmentRating: 5,
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
      followers: 89,
      verified: false,
      level: 15,
      totalSales: 42
    },
    description: 'Pixel no centro histórico de Évora, próximo ao Templo Romano. Excelente para amantes de história.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural histórico por estar próximo ao Templo Romano de Évora, um dos monumentos mais antigos de Portugal.',
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
    investmentRating: 4,
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
      followers: 321,
      verified: true,
      level: 22,
      totalSales: 78
    },
    description: 'Pixel épico com vista para o oceano Atlântico na ilha da Madeira. Perfeito para colecionadores.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural insular por representar a beleza natural da Madeira, com sua paisagem única e biodiversidade.',
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
    investmentRating: 5,
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
      followers: 145,
      verified: true,
      level: 19,
      totalSales: 56
    },
    description: 'Pixel raro localizado próximo às lagoas vulcânicas dos Açores. Uma verdadeira joia natural.',
    imageUrl: 'https://placehold.co/300x300.png',
    dataAiHint: 'pixel preview',
    culturalValue: 'Valor cultural e geológico por representar as famosas lagoas vulcânicas dos Açores, fenômeno natural único.',
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
    investmentRating: 4,
    features: ['Lagoas vulcânicas', 'Paisagem verde', 'Biodiversidade única', 'Termas naturais'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isHot: false,
    isFeatured: false
  }
];

// Mock user data for profile sheet
const mockUserData = {
  id: "user123", name: "Pixel Master", username: "@pixelmaster", avatarUrl: "https://placehold.co/100x100.png",
  dataAiHint: "user avatar", level: 25, xp: 2450, xpMax: 3000, credits: 12500, specialCredits: 120,
  bio: "Colecionador apaixonado de pixels raros e criador de arte digital no Pixel Universe.",
  pixelsOwned: 156, achievementsUnlocked: 23, unlockedAchievementIds: ["pixel_initiate", "color_master", "community_star"],
  rank: 12, location: "Lisboa, Portugal", socials: [], albums: [] };

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

const investmentRatingLabels = [
  { value: 1, label: 'Baixo Potencial', color: 'text-red-500' },
  { value: 2, label: 'Potencial Moderado', color: 'text-orange-500' },
  { value: 3, label: 'Bom Potencial', color: 'text-yellow-500' },
  { value: 4, label: 'Ótimo Potencial', color: 'text-green-500' },
  { value: 5, label: 'Excelente Potencial', color: 'text-blue-500' }
];


interface PixelMarketplaceProps {
  children: React.ReactNode;
  onSelectPixel: (pixelData: any) => void;
}

export default function PixelMarketplace({ children, onSelectPixel }: PixelMarketplaceProps) {
  const [listings, setListings] = useState<PixelListing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<PixelListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<PixelRarity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [playHoverSound, setPlayHoverSound] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInvestmentInfo, setShowInvestmentInfo] = useState(false);
  const [playPurchaseSound, setPlayPurchaseSound] = useState(false);
  const { user } = useAuth();
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
    
    onSelectPixel(pixelData);
    setIsOpen(false);
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
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>

        <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Marketplace de Píxeis
                  <Badge variant="secondary" className="text-xs"> 
                    {filteredListings.length} resultados
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Descubra, compre e venda píxeis únicos no maior marketplace de Portugal
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? 'Lista' : 'Grelha'}
                </Button> 
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />} 
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-[calc(95vh-80px)]">
            {/* Search and Quick Filters */}
            <div className="p-4 border-b bg-muted/30"> 
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por localização, vendedor, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10" 
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
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
                  
                  {(searchQuery || selectedRarity !== 'all' || selectedType !== 'all' || selectedRegion !== 'all') && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && ( 
              <div className="p-4 border-b bg-muted/20">
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
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Lisboa">Lisboa</SelectItem>
                        <SelectItem value="Porto">Porto</SelectItem>
                        <SelectItem value="Coimbra">Coimbra</SelectItem>
                        <SelectItem value="Braga">Braga</SelectItem>
                        <SelectItem value="Faro">Faro</SelectItem>
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
              </div>
            )}

            {/* Listings */}
            <ScrollArea className="flex-1"> 
              <div className="p-4">
                {filteredListings.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum pixel encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os seus filtros ou pesquisar por outros termos
                    </p> 
                    <Button onClick={clearFilters}>Limpar Filtros</Button>
                  </Card>
                ) : (
                  <div className={cn(
                    "gap-4",
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                      : "space-y-4" 
                  )}>
                    {filteredListings.map((listing) => (
                      <Card
                        key={listing.id}
                        className={cn(
                          "transition-all duration-200 hover:shadow-lg cursor-pointer group",
                          listing.isFeatured && "border-primary/50 bg-primary/5",
                          listing.isSponsored && "ring-2 ring-accent/50", 
                          viewMode === 'list' && "flex flex-row"
                        )}
                        onClick={() => handleListingClick(listing)}
                      >
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
                          {listing.imageUrl && (
                            <div className={cn(
                              "relative overflow-hidden",
                              viewMode === 'grid' ? "aspect-square" : "w-32 h-32 flex-shrink-0"
                            )}>
                              <img 
                                src={listing.imageUrl} 
                                alt="Pixel preview"
                                data-ai-hint={listing.dataAiHint} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeListing(listing.id, e);
                                  }}
                                >
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWatchListing(listing.id, e);
                                  }}
                                >
                                  <Bookmark className="h-4 w-4" /> 
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareListing(listing.id, e);
                                  }}
                                > 
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>

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

                              {listing.type === 'auction' && listing.bids && (
                                <div className="absolute bottom-2 right-2">
                                  <Badge variant="destructive" className="text-xs"> 
                                    <Timer className="h-3 w-3 mr-1" />
                                    {getTimeRemaining(listing.bids.endTime)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={cn(
                            "p-4 flex-1",
                            viewMode === 'list' && "flex flex-col justify-between"
                          )}>
                            <div className="space-y-2">
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

                              {listing.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {listing.description}
                                </p>
                              )}
                              
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
                            
                            {/* Investment Rating */}
                            {listing.investmentRating && (
                              <div className="mt-2 flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Potencial de Investimento:</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < listing.investmentRating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-3 mb-3">
                              <UserProfileSheet 
                                userData={{...mockUserData, name: listing.seller.name, avatarUrl: listing.seller.avatar}} 
                                achievementsData={[]}
                              >
                                <div className="cursor-pointer hover:scale-110 transition-transform">
                                  <Avatar className="h-6 w-6 border border-primary/30">
                                    <AvatarImage src={listing.seller.avatar} alt={listing.seller.name} data-ai-hint={listing.seller.dataAiHint} />
                                    <AvatarFallback className="text-xs">{listing.seller.name.substring(0, 1)}</AvatarFallback>
                                  </Avatar>
                                </div>
                              </UserProfileSheet>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <UserProfileSheet 
                                    userData={{...mockUserData, name: listing.seller.name, avatarUrl: listing.seller.avatar}} 
                                    achievementsData={[]}
                                  >
                                    <span className="text-xs font-medium truncate hover:text-primary transition-colors cursor-pointer">{listing.seller.name}</span>
                                  </UserProfileSheet>
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
                                    className="flex-1"
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
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (user) {
                                        handleListingClick(listing);
                                      } else {
                                        toast({
                                          title: "Autenticação Necessária",
                                          description: "Precisa de iniciar sessão para licitar em leilões.",
                                        });
                                      }
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
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (user) {
                                        handleListingClick(listing);
                                      } else {
                                        toast({
                                          title: "Autenticação Necessária",
                                          description: "Precisa de iniciar sessão para fazer ofertas.",
                                        });
                                      }
                                    }}
                                  > 
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Oferecer
                                  </Button>
                                )}
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost"  
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (user) {
                                      handleListingClick(listing);
                                    } else {
                                      toast({
                                        title: "Autenticação Necessária",
                                        description: "Precisa de iniciar sessão para comprar pixels.",
                                      });
                                    }
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
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
