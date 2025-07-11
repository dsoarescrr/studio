
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User, Edit, Settings, Award, Coins, Gift, MapPin, Palette, BookImage, 
  Heart, Star, Crown, Gem, Trophy, Calendar, Clock, Eye, MessageSquare, 
  Share2, Bookmark, Flag, Plus, Trash2, Upload, Download, RefreshCw, Save,
  Twitter, Instagram, Github, Globe, Link as LinkIcon, Mail, Lock, Unlock,
  ShieldCheck, Key, LogOut, Zap, Lightbulb, HelpCircle, Info, AlertTriangle,
  CheckCircle, XCircle, Sparkles, TrendingUp, BarChart3, PieChart, LineChart,
  Users, Bell, FileText, Wallet, History, Package, Grid3X3, Layers, Image as ImageIcon,
  ShoppingCart, Search, Filter
} from "lucide-react";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';
import { achievementsData } from '@/data/achievements-data';
import { UserProfileDisplay } from '@/components/user/UserProfileDisplay';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Types
interface Pixel {
  id: string;
  coordinates: { x: number; y: number };
  region: string;
  color: string;
  imageUrl?: string;
  dataAiHint?: string;
  title?: string;
  description?: string;
  price: number;
  purchaseDate: Date;
  lastModified: Date;
  views: number;
  likes: number;
  isForSale: boolean;
  salePrice?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  tags: string[];
}

interface Album {
  id: string;
  name: string;
  description: string;
  coverPixelUrl: string;
  dataAiHint?: string;
  pixelCount: number;
  createdAt: Date;
  isPublic: boolean;
  views: number;
  likes: number;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'deposit' | 'withdrawal' | 'reward' | 'transfer';
  amount: number;
  description: string;
  date: Date;
  pixelId?: string;
  pixelCoordinates?: { x: number; y: number };
  status: 'completed' | 'pending' | 'failed';
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'purchase' | 'sale' | 'achievement' | 'system' | 'follow';
  message: string;
  date: Date;
  isRead: boolean;
  relatedUserId?: string;
  relatedUserName?: string;
  relatedUserAvatar?: string;
  dataAiHint?: string;
  pixelId?: string;
  pixelCoordinates?: { x: number; y: number };
}

interface SocialLink {
  platform: string;
  handle: string;
  icon: React.ReactNode;
  url: string;
}

// Mock Data
const mockPixels: Pixel[] = [
  {
    id: 'pixel1',
    coordinates: { x: 245, y: 156 },
    region: 'Lisboa',
    color: '#D4A757',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'pixel image',
    title: 'Pixel Premium em Lisboa',
    description: 'Um pixel raro localizado no centro histórico de Lisboa com vista para o Tejo.',
    price: 150,
    purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    views: 342,
    likes: 56,
    isForSale: false,
    rarity: 'rare',
    tags: ['lisboa', 'centro', 'histórico', 'tejo']
  },
  {
    id: 'pixel2',
    coordinates: { x: 123, y: 89 },
    region: 'Porto',
    color: '#7DF9FF',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'pixel image',
    title: 'Pixel Ribeira do Porto',
    description: 'Localizado na zona histórica da Ribeira do Porto, com vista para o rio Douro.',
    price: 120,
    purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    views: 256,
    likes: 42,
    isForSale: true,
    salePrice: 180,
    rarity: 'uncommon',
    tags: ['porto', 'ribeira', 'douro', 'histórico']
  },
  {
    id: 'pixel3',
    coordinates: { x: 345, y: 234 },
    region: 'Algarve',
    color: '#FF6B6B',
    title: 'Pixel Vista Praia',
    description: 'Um pixel com vista privilegiada para as praias do Algarve.',
    price: 200,
    purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    views: 189,
    likes: 37,
    isForSale: false,
    rarity: 'epic',
    tags: ['algarve', 'praia', 'mar', 'turismo']
  },
  {
    id: 'pixel4',
    coordinates: { x: 456, y: 321 },
    region: 'Madeira',
    color: '#4CAF50',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'pixel image',
    title: 'Pixel Floresta Laurissilva',
    description: 'Localizado na famosa floresta Laurissilva da Madeira, património mundial da UNESCO.',
    price: 250,
    purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 423,
    likes: 78,
    isForSale: true,
    salePrice: 350,
    rarity: 'legendary',
    tags: ['madeira', 'floresta', 'natureza', 'unesco']
  },
  {
    id: 'pixel5',
    coordinates: { x: 567, y: 432 },
    region: 'Coimbra',
    color: '#9C27B0',
    title: 'Pixel Universidade de Coimbra',
    description: 'Um pixel localizado na histórica Universidade de Coimbra.',
    price: 100,
    purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    views: 156,
    likes: 23,
    isForSale: false,
    rarity: 'common',
    tags: ['coimbra', 'universidade', 'educação', 'histórico']
  }
];

const mockAlbums: Album[] = [
  {
    id: 'album1',
    name: 'Coleção Lisboa',
    description: 'Minha coleção de pixels na região de Lisboa.',
    coverPixelUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'album cover',
    pixelCount: 12,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    isPublic: true,
    views: 245,
    likes: 42
  },
  {
    id: 'album2',
    name: 'Pixels Históricos',
    description: 'Coleção de pixels em locais históricos de Portugal.',
    coverPixelUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'album cover',
    pixelCount: 8,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    isPublic: true,
    views: 189,
    likes: 35
  },
  {
    id: 'album3',
    name: 'Investimentos Premium',
    description: 'Pixels raros e épicos com alto potencial de valorização.',
    coverPixelUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'album cover',
    pixelCount: 5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isPublic: false,
    views: 56,
    likes: 12
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 'trans1',
    type: 'purchase',
    amount: -150,
    description: 'Compra de pixel em Lisboa (245, 156)',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    pixelId: 'pixel1',
    pixelCoordinates: { x: 245, y: 156 },
    status: 'completed'
  },
  {
    id: 'trans2',
    type: 'purchase',
    amount: -120,
    description: 'Compra de pixel no Porto (123, 89)',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    pixelId: 'pixel2',
    pixelCoordinates: { x: 123, y: 89 },
    status: 'completed'
  },
  {
    id: 'trans3',
    type: 'sale',
    amount: 180,
    description: 'Venda de pixel em Braga',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: 'trans4',
    type: 'deposit',
    amount: 500,
    description: 'Depósito de créditos',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: 'trans5',
    type: 'reward',
    amount: 50,
    description: 'Recompensa por conquista "Mestre das Cores"',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: 'trans6',
    type: 'withdrawal',
    amount: -200,
    description: 'Levantamento de créditos',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'pending'
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'like',
    message: 'ArtLover curtiu o seu pixel em Lisboa',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    relatedUserId: 'user1',
    relatedUserName: 'ArtLover',
    relatedUserAvatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar',
    pixelId: 'pixel1',
    pixelCoordinates: { x: 245, y: 156 }
  },
  {
    id: 'notif2',
    type: 'comment',
    message: 'PixelCollector comentou no seu pixel no Porto',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: false,
    relatedUserId: 'user2',
    relatedUserName: 'PixelCollector',
    relatedUserAvatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar',
    pixelId: 'pixel2',
    pixelCoordinates: { x: 123, y: 89 }
  },
  {
    id: 'notif3',
    type: 'achievement',
    message: 'Parabéns! Você desbloqueou a conquista "Explorador de Territórios"',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: true
  },
  {
    id: 'notif4',
    type: 'system',
    message: 'Bem-vindo ao novo painel de perfil do Pixel Universe!',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true
  },
  {
    id: 'notif5',
    type: 'follow',
    message: 'PixelMaster começou a seguir você',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: false,
    relatedUserId: 'user3',
    relatedUserName: 'PixelMaster',
    relatedUserAvatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar'
  }
];

const mockSocialLinks: SocialLink[] = [
  {
    platform: 'Twitter',
    handle: '@PixelMasterPT',
    icon: <Twitter className="h-4 w-4 text-blue-400" />,
    url: 'https://twitter.com/PixelMasterPT'
  },
  {
    platform: 'Instagram',
    handle: '@pixel_master_pt',
    icon: <Instagram className="h-4 w-4 text-pink-500" />,
    url: 'https://instagram.com/pixel_master_pt'
  },
  {
    platform: 'Github',
    handle: 'pixelmasterpt',
    icon: <Github className="h-4 w-4 text-gray-500" />,
    url: 'https://github.com/pixelmasterpt'
  }
];

// Utility function to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Utility function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}m`;
};

export default function MemberPage() {
  const [pixels, setPixels] = useState<Pixel[]>(mockPixels);
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [showPixelDetail, setShowPixelDetail] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [newAlbumIsPublic, setNewAlbumIsPublic] = useState(true);
  const [profileBio, setProfileBio] = useState('Colecionador de pixels raros e entusiasta de arte digital');
  const [profileLocation, setProfileLocation] = useState('Lisboa, Portugal');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(mockSocialLinks);
  const [isLoading, setIsLoading] = useState(true);
  const [playHoverSound, setPlayHoverSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    credits, 
    specialCredits, 
    level, 
    xp, 
    xpMax, 
    pixels: pixelCount, 
    achievements: achievementCount, 
    addCredits, 
    addXp 
  } = useUserStore();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    
    const newAlbum: Album = {
      id: `album-${Date.now()}`,
      name: newAlbumName,
      description: newAlbumDescription,
      coverPixelUrl: 'https://placehold.co/100x100.png',
      dataAiHint: 'album cover',
      pixelCount: 0,
      createdAt: new Date(),
      isPublic: newAlbumIsPublic,
      views: 0,
      likes: 0
    };
    
    setAlbums([newAlbum, ...albums]);
    setNewAlbumName('');
    setNewAlbumDescription('');
    setShowCreateAlbum(false);
    
    setPlaySuccessSound(true);
    setShowConfetti(true);
    
    toast({
      title: "Álbum Criado",
      description: "O seu novo álbum foi criado com sucesso!",
    });
    
    // Reward for engagement
    addCredits(10);
    addXp(20);
  };

  const handleUpdateProfile = () => {
    setShowEditProfile(false);
    
    toast({
      title: "Perfil Atualizado",
      description: "As suas informações de perfil foram atualizadas com sucesso!",
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    
    toast({
      title: "Notificações Lidas",
      description: "Todas as notificações foram marcadas como lidas.",
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    
    toast({
      title: "Notificação Removida",
      description: "A notificação foi removida com sucesso.",
    });
  };

  const handleTogglePixelForSale = (pixelId: string, isForSale: boolean, price?: number) => {
    setPixels(prev => prev.map(pixel => {
      if (pixel.id === pixelId) {
        return {
          ...pixel,
          isForSale,
          salePrice: price
        };
      }
      return pixel;
    }));
    
    toast({
      title: isForSale ? "Pixel à Venda" : "Pixel Removido da Venda",
      description: isForSale 
        ? `O seu pixel foi colocado à venda por ${price}€.` 
        : "O seu pixel foi removido da venda.",
    });
  };

  const handleDeleteAlbum = (albumId: string) => {
    setAlbums(prev => prev.filter(album => album.id !== albumId));
    
    toast({
      title: "Álbum Removido",
      description: "O álbum foi removido com sucesso.",
    });
  };

  // Prepare user data for UserProfileDisplay component
  const userData = {
    id: 'current-user',
    name: 'PixelMasterPT',
    username: '@pixelmasterpt',
    avatarUrl: 'https://placehold.co/40x40.png',
    dataAiHint: 'profile avatar',
    level,
    xp,
    xpMax,
    credits,
    specialCredits,
    bio: profileBio,
    pixelsOwned: pixelCount,
    achievementsUnlocked: achievementCount,
    unlockedAchievementIds: ['pixel_initiate', 'pixel_artisan', 'color_master', 'territory_pioneer', 'community_voice', 'time_virtuoso', 'pixel_universe_pioneer', 'community_star'],
    rank: 156,
    location: profileLocation,
    socials: socialLinks,
    albums: albums
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.HOVER} play={playHoverSound} onEnd={() => setPlayHoverSound(false)} volume={0.2} />
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
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
                  <User className="h-8 w-8 mr-3 animate-glow" />
                  Meu Perfil
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Gerencie seus pixels, álbuns, conquistas e muito mais
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="button-hover-lift"
                  onClick={() => setShowEditProfile(true)}
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 button-hover-lift"
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Overview */}
          <div className="space-y-6">
            <UserProfileDisplay userData={userData} />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12 bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="overview" className="font-headline">
                  <BarChart3 className="h-4 w-4 mr-2"/>
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="pixels" className="font-headline">
                  <Grid3X3 className="h-4 w-4 mr-2"/>
                  Meus Pixels
                </TabsTrigger>
                <TabsTrigger value="albums" className="font-headline">
                  <BookImage className="h-4 w-4 mr-2"/>
                  Álbuns
                </TabsTrigger>
                <TabsTrigger value="activity" className="font-headline">
                  <History className="h-4 w-4 mr-2"/>
                  Atividade
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Grid3X3 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Pixels</p>
                            <p className="text-2xl font-bold">{pixelCount}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                          +3 esta semana
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Conquistas</p>
                            <p className="text-2xl font-bold">{achievementCount}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                          +1 esta semana
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Créditos</p>
                            <p className="text-2xl font-bold">{credits.toLocaleString('pt-PT')}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                          +250 esta semana
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <Gift className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Especiais</p>
                            <p className="text-2xl font-bold">{specialCredits}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                          +15 esta semana
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activity */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <History className="h-5 w-5 mr-2 text-primary" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {transactions.slice(0, 3).map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              transaction.type === 'purchase' ? "bg-red-500/10 text-red-500" :
                              transaction.type === 'sale' ? "bg-green-500/10 text-green-500" :
                              transaction.type === 'deposit' ? "bg-blue-500/10 text-blue-500" :
                              transaction.type === 'withdrawal' ? "bg-orange-500/10 text-orange-500" :
                              "bg-purple-500/10 text-purple-500"
                            )}>
                              {transaction.type === 'purchase' ? <ShoppingCart className="h-4 w-4" /> :
                               transaction.type === 'sale' ? <TrendingUp className="h-4 w-4" /> :
                               transaction.type === 'deposit' ? <Download className="h-4 w-4" /> :
                               transaction.type === 'withdrawal' ? <Upload className="h-4 w-4" /> :
                               <Gift className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-semibold",
                              transaction.amount >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {transaction.amount >= 0 ? '+' : ''}{transaction.amount}€
                            </p>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                              {transaction.status === 'completed' ? 'Concluído' : 
                               transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('activity')}>
                        <History className="h-4 w-4 mr-2" />
                        Ver Todo o Histórico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Featured Pixels */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Pixels em Destaque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pixels.filter(pixel => pixel.rarity === 'legendary' || pixel.rarity === 'epic').slice(0, 3).map(pixel => (
                        <Card 
                          key={pixel.id} 
                          className={cn(
                            "cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2",
                            pixel.rarity === 'legendary' ? "border-amber-400/60 bg-amber-500/10" :
                            pixel.rarity === 'epic' ? "border-purple-500/60 bg-purple-500/10" :
                            pixel.rarity === 'rare' ? "border-blue-500/60 bg-blue-500/10" :
                            pixel.rarity === 'uncommon' ? "border-green-500/60 bg-green-500/10" :
                            "border-gray-500/60 bg-gray-500/10"
                          )}
                          onClick={() => {
                            setSelectedPixel(pixel);
                            setShowPixelDetail(true);
                          }}
                        >
                          <div className="p-3">
                            <div className="aspect-square rounded-md overflow-hidden mb-3">
                              {pixel.imageUrl ? (
                                <img 
                                  src={pixel.imageUrl} 
                                  alt={pixel.title || `Pixel em ${pixel.region}`}
                                  className="w-full h-full object-cover"
                                  data-ai-hint={pixel.dataAiHint}
                                />
                              ) : (
                                <div 
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ backgroundColor: pixel.color }}
                                >
                                  <MapPin className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium text-sm line-clamp-1">{pixel.title || `Pixel em ${pixel.region}`}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>({pixel.coordinates.x}, {pixel.coordinates.y})</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                pixel.rarity === 'legendary' ? "text-amber-400 border-amber-400/50" :
                                pixel.rarity === 'epic' ? "text-purple-500 border-purple-500/50" :
                                pixel.rarity === 'rare' ? "text-blue-500 border-blue-500/50" :
                                pixel.rarity === 'uncommon' ? "text-green-500 border-green-500/50" :
                                "text-gray-500 border-gray-500/50"
                              )}>
                                {pixel.rarity === 'legendary' ? "Lendário" :
                                 pixel.rarity === 'epic' ? "Épico" :
                                 pixel.rarity === 'rare' ? "Raro" :
                                 pixel.rarity === 'uncommon' ? "Incomum" :
                                 "Comum"}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  {pixel.views}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Heart className="h-3 w-3" />
                                  {pixel.likes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('pixels')}>
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Ver Todos os Pixels
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Recent Notifications */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-primary" />
                        Notificações Recentes
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleMarkAllNotificationsAsRead}
                        className="text-xs h-8"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar como Lidas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map(notification => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-3 rounded-lg flex items-start gap-3",
                            notification.isRead ? "bg-muted/20" : "bg-primary/5 border border-primary/20"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-full shrink-0",
                            notification.type === 'like' ? "bg-red-500/10 text-red-500" :
                            notification.type === 'comment' ? "bg-blue-500/10 text-blue-500" :
                            notification.type === 'achievement' ? "bg-yellow-500/10 text-yellow-500" :
                            notification.type === 'system' ? "bg-gray-500/10 text-gray-500" :
                            "bg-green-500/10 text-green-500"
                          )}>
                            {notification.type === 'like' ? <Heart className="h-4 w-4" /> :
                             notification.type === 'comment' ? <MessageSquare className="h-4 w-4" /> :
                             notification.type === 'achievement' ? <Award className="h-4 w-4" /> :
                             notification.type === 'system' ? <Info className="h-4 w-4" /> :
                             <User className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.date)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('activity')}>
                        <Bell className="h-4 w-4 mr-2" />
                        Ver Todas as Notificações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pixels Tab */}
              <TabsContent value="pixels" className="space-y-6 mt-6">
                {/* Filters */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar pixels..."
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filtrar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os Pixels</SelectItem>
                            <SelectItem value="for_sale">À Venda</SelectItem>
                            <SelectItem value="not_for_sale">Não à Venda</SelectItem>
                            <SelectItem value="rare">Raros & Acima</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" className="hidden sm:flex">
                          <Plus className="h-4 w-4 mr-2" />
                          Comprar Pixels
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pixels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pixels.map(pixel => (
                    <Card 
                      key={pixel.id} 
                      className={cn(
                        "cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2",
                        pixel.rarity === 'legendary' ? "border-amber-400/60 bg-amber-500/5" :
                        pixel.rarity === 'epic' ? "border-purple-500/60 bg-purple-500/5" :
                        pixel.rarity === 'rare' ? "border-blue-500/60 bg-blue-500/5" :
                        pixel.rarity === 'uncommon' ? "border-green-500/60 bg-green-500/5" :
                        "border-gray-500/60 bg-gray-500/5"
                      )}
                      onClick={() => {
                        setSelectedPixel(pixel);
                        setShowPixelDetail(true);
                      }}
                    >
                      <div className="p-3">
                        <div className="aspect-square rounded-md overflow-hidden mb-3">
                          {pixel.imageUrl ? (
                            <img 
                              src={pixel.imageUrl} 
                              alt={pixel.title || `Pixel em ${pixel.region}`}
                              className="w-full h-full object-cover"
                              data-ai-hint={pixel.dataAiHint}
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: pixel.color }}
                            >
                              <MapPin className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-sm line-clamp-1">{pixel.title || `Pixel em ${pixel.region}`}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>({pixel.coordinates.x}, {pixel.coordinates.y})</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            pixel.rarity === 'legendary' ? "text-amber-400 border-amber-400/50" :
                            pixel.rarity === 'epic' ? "text-purple-500 border-purple-500/50" :
                            pixel.rarity === 'rare' ? "text-blue-500 border-blue-500/50" :
                            pixel.rarity === 'uncommon' ? "text-green-500 border-green-500/50" :
                            "text-gray-500 border-gray-500/50"
                          )}>
                            {pixel.rarity === 'legendary' ? "Lendário" :
                             pixel.rarity === 'epic' ? "Épico" :
                             pixel.rarity === 'rare' ? "Raro" :
                             pixel.rarity === 'uncommon' ? "Incomum" :
                             "Comum"}
                          </Badge>
                          {pixel.isForSale ? (
                            <Badge className="text-xs bg-green-500">
                              {pixel.salePrice}€
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Não à venda
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>Comprado: {formatDate(pixel.purchaseDate)}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {pixel.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {pixel.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Albums Tab */}
              <TabsContent value="albums" className="space-y-6 mt-6">
                {/* Create Album Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Meus Álbuns</h2>
                  <Button 
                    onClick={() => setShowCreateAlbum(true)}
                    className="button-hover-lift"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Álbum
                  </Button>
                </div>
                
                {/* Albums Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {albums.map(album => (
                    <Card 
                      key={album.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
                    >
                      <div className="p-3">
                        <div className="aspect-square rounded-md overflow-hidden mb-3">
                          <img 
                            src={album.coverPixelUrl} 
                            alt={album.name}
                            className="w-full h-full object-cover"
                            data-ai-hint={album.dataAiHint}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm line-clamp-1">{album.name}</h3>
                          <Badge variant={album.isPublic ? "default" : "outline"} className="text-xs">
                            {album.isPublic ? "Público" : "Privado"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{album.description}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{album.pixelCount} pixels</span>
                          <span>Criado: {formatDate(album.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {album.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {album.likes}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAlbum(album.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6 mt-6">
                {/* Activity Tabs */}
                <Tabs defaultValue="transactions">
                  <TabsList className="grid w-full grid-cols-2 h-10">
                    <TabsTrigger value="transactions">
                      <Wallet className="h-4 w-4 mr-2" />
                      Transações
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      Notificações
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Transactions */}
                  <TabsContent value="transactions" className="mt-4">
                    <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <History className="h-5 w-5 mr-2 text-primary" />
                          Histórico de Transações
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {transactions.map(transaction => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-full",
                                  transaction.type === 'purchase' ? "bg-red-500/10 text-red-500" :
                                  transaction.type === 'sale' ? "bg-green-500/10 text-green-500" :
                                  transaction.type === 'deposit' ? "bg-blue-500/10 text-blue-500" :
                                  transaction.type === 'withdrawal' ? "bg-orange-500/10 text-orange-500" :
                                  "bg-purple-500/10 text-purple-500"
                                )}>
                                  {transaction.type === 'purchase' ? <ShoppingCart className="h-4 w-4" /> :
                                   transaction.type === 'sale' ? <TrendingUp className="h-4 w-4" /> :
                                   transaction.type === 'deposit' ? <Download className="h-4 w-4" /> :
                                   transaction.type === 'withdrawal' ? <Upload className="h-4 w-4" /> :
                                   <Gift className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{transaction.description}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn(
                                  "font-semibold",
                                  transaction.amount >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount}€
                                </p>
                                <Badge variant={transaction.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                  {transaction.status === 'completed' ? 'Concluído' : 
                                   transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Notifications */}
                  <TabsContent value="notifications" className="mt-4">
                    <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <Bell className="h-5 w-5 mr-2 text-primary" />
                            Notificações
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleMarkAllNotificationsAsRead}
                            className="text-xs h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar como Lidas
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={cn(
                                "p-3 rounded-lg flex items-start gap-3",
                                notification.isRead ? "bg-muted/20" : "bg-primary/5 border border-primary/20"
                              )}
                            >
                              {notification.relatedUserAvatar ? (
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage 
                                    src={notification.relatedUserAvatar} 
                                    alt={notification.relatedUserName || "User"}
                                    data-ai-hint={notification.dataAiHint}
                                  />
                                  <AvatarFallback>
                                    {notification.relatedUserName ? notification.relatedUserName.substring(0, 2).toUpperCase() : "U"}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className={cn(
                                  "p-2 rounded-full shrink-0",
                                  notification.type === 'like' ? "bg-red-500/10 text-red-500" :
                                  notification.type === 'comment' ? "bg-blue-500/10 text-blue-500" :
                                  notification.type === 'achievement' ? "bg-yellow-500/10 text-yellow-500" :
                                  notification.type === 'system' ? "bg-gray-500/10 text-gray-500" :
                                  "bg-green-500/10 text-green-500"
                                )}>
                                  {notification.type === 'like' ? <Heart className="h-4 w-4" /> :
                                   notification.type === 'comment' ? <MessageSquare className="h-4 w-4" /> :
                                   notification.type === 'achievement' ? <Award className="h-4 w-4" /> :
                                   notification.type === 'system' ? <Info className="h-4 w-4" /> :
                                   <User className="h-4 w-4" />}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.date)}</p>
                                {notification.pixelCoordinates && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    ({notification.pixelCoordinates.x}, {notification.pixelCoordinates.y})
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Pixel Detail Modal */}
      <Dialog open={showPixelDetail} onOpenChange={setShowPixelDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-headline">Detalhes do Pixel</DialogTitle>
          </DialogHeader>
          
          {selectedPixel && (
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Pixel Header */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/30">
                      {selectedPixel.imageUrl ? (
                        <img 
                          src={selectedPixel.imageUrl} 
                          alt={selectedPixel.title || `Pixel em ${selectedPixel.region}`}
                          className="w-full h-full object-cover"
                          data-ai-hint={selectedPixel.dataAiHint}
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: selectedPixel.color }}
                        >
                          <MapPin className="h-16 w-16 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedPixel.title || `Pixel em ${selectedPixel.region}`}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Coordenadas: ({selectedPixel.coordinates.x}, {selectedPixel.coordinates.y})</span>
                        <span>•</span>
                        <span>{selectedPixel.region}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn(
                        "text-sm",
                        selectedPixel.rarity === 'legendary' ? "bg-amber-500" :
                        selectedPixel.rarity === 'epic' ? "bg-purple-500" :
                        selectedPixel.rarity === 'rare' ? "bg-blue-500" :
                        selectedPixel.rarity === 'uncommon' ? "bg-green-500" :
                        "bg-gray-500"
                      )}>
                        {selectedPixel.rarity === 'legendary' ? "Lendário" :
                         selectedPixel.rarity === 'epic' ? "Épico" :
                         selectedPixel.rarity === 'rare' ? "Raro" :
                         selectedPixel.rarity === 'uncommon' ? "Incomum" :
                         "Comum"}
                      </Badge>
                      
                      {selectedPixel.isForSale ? (
                        <Badge className="bg-green-500 text-sm">
                          À Venda: {selectedPixel.salePrice}€
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-sm">
                          Não à Venda
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm">{selectedPixel.description || "Sem descrição disponível."}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {selectedPixel.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Data de Compra</p>
                        <p className="font-medium">{formatDate(selectedPixel.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Preço de Compra</p>
                        <p className="font-medium">{selectedPixel.price}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Visualizações</p>
                        <p className="font-medium">{selectedPixel.views}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Curtidas</p>
                        <p className="font-medium">{selectedPixel.likes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Pixel Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button className="flex-1 sm:flex-none">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Pixel
                  </Button>
                  
                  {selectedPixel.isForSale ? (
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none"
                      onClick={() => handleTogglePixelForSale(selectedPixel.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Remover da Venda
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none"
                      onClick={() => handleTogglePixelForSale(selectedPixel.id, true, Math.round(selectedPixel.price * 1.5))}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Colocar à Venda
                    </Button>
                  )}
                  
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <BookImage className="h-4 w-4 mr-2" />
                    Adicionar a Álbum
                  </Button>
                  
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partilhar
                  </Button>
                </div>
                
                <Separator />
                
                {/* Pixel Stats */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-muted/20">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-2">Valorização</h4>
                        <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                          <LineChart className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-muted-foreground">Valor Atual Estimado</span>
                          <span className="font-semibold text-green-500">{Math.round(selectedPixel.price * 1.2)}€</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/20">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-2">Popularidade</h4>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Visualizações</span>
                              <span>{selectedPixel.views}</span>
                            </div>
                            <Progress value={(selectedPixel.views / 1000) * 100} className="h-1.5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Curtidas</span>
                              <span>{selectedPixel.likes}</span>
                            </div>
                            <Progress value={(selectedPixel.likes / 100) * 100} className="h-1.5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Raridade</span>
                              <span>{selectedPixel.rarity === 'legendary' ? "Lendário" :
                                     selectedPixel.rarity === 'epic' ? "Épico" :
                                     selectedPixel.rarity === 'rare' ? "Raro" :
                                     selectedPixel.rarity === 'uncommon' ? "Incomum" :
                                     "Comum"}</span>
                            </div>
                            <Progress 
                              value={
                                selectedPixel.rarity === 'legendary' ? 100 :
                                selectedPixel.rarity === 'epic' ? 80 :
                                selectedPixel.rarity === 'rare' ? 60 :
                                selectedPixel.rarity === 'uncommon' ? 40 :
                                20
                              } 
                              className="h-1.5" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                {/* Similar Pixels */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pixels Similares</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {pixels.filter(p => p.id !== selectedPixel.id && p.region === selectedPixel.region).slice(0, 3).map(pixel => (
                      <Card 
                        key={pixel.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPixel(pixel);
                        }}
                      >
                        <div className="p-2">
                          <div className="aspect-square rounded-md overflow-hidden mb-2">
                            {pixel.imageUrl ? (
                              <img 
                                src={pixel.imageUrl} 
                                alt={pixel.title || `Pixel em ${pixel.region}`}
                                className="w-full h-full object-cover"
                                data-ai-hint={pixel.dataAiHint}
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: pixel.color }}
                              >
                                <MapPin className="h-6 w-6 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-xs line-clamp-1">{pixel.title || `Pixel em ${pixel.region}`}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              ({pixel.coordinates.x}, {pixel.coordinates.y})
                            </Badge>
                            <Badge className={cn(
                              "text-xs",
                              pixel.rarity === 'legendary' ? "bg-amber-500" :
                              pixel.rarity === 'epic' ? "bg-purple-500" :
                              pixel.rarity === 'rare' ? "bg-blue-500" :
                              pixel.rarity === 'uncommon' ? "bg-green-500" :
                              "bg-gray-500"
                            )}>
                              {pixel.rarity === 'legendary' ? "Lendário" :
                               pixel.rarity === 'epic' ? "Épico" :
                               pixel.rarity === 'rare' ? "Raro" :
                               pixel.rarity === 'uncommon' ? "Incomum" :
                               "Comum"}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setShowPixelDetail(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Profile Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-headline">Editar Perfil</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-primary/30">
                  <AvatarImage src="https://placehold.co/96x96.png" alt="PixelMasterPT" data-ai-hint="user avatar" />
                  <AvatarFallback>PM</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="mt-3">
                  <Upload className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
              
              <Separator />
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="username-edit">Nome de Utilizador</Label>
                  <Input id="username-edit" value="PixelMasterPT" disabled />
                  <p className="text-xs text-muted-foreground">O nome de utilizador não pode ser alterado</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-edit">Email</Label>
                  <Input id="email-edit" value="pixelmaster@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio-edit">Biografia</Label>
                  <Textarea 
                    id="bio-edit"
                    value={profileBio} 
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Fale um pouco sobre você..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location-edit">Localização</Label>
                  <Input 
                    id="location-edit"
                    value={profileLocation} 
                    onChange={(e) => setProfileLocation(e.target.value)}
                    placeholder="Cidade, País"
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Redes Sociais</h3>
                
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {link.icon}
                      </div>
                      <Input 
                        value={link.handle} 
                        placeholder={`Seu perfil ${link.platform}`}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Rede Social
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacidade</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Perfil Público</p>
                      <p className="text-xs text-muted-foreground">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mostrar Pixels</p>
                      <p className="text-xs text-muted-foreground">Exibir seus pixels no seu perfil público</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mostrar Estatísticas</p>
                      <p className="text-xs text-muted-foreground">Exibir suas estatísticas no seu perfil público</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setShowEditProfile(false)} className="mr-2">
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Album Modal */}
      <Dialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline">Criar Novo Álbum</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="album-name">Nome do Álbum</Label>
              <Input 
                id="album-name"
                value={newAlbumName} 
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="Ex: Coleção Lisboa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="album-description">Descrição</Label>
              <Textarea 
                id="album-description"
                value={newAlbumDescription} 
                onChange={(e) => setNewAlbumDescription(e.target.value)}
                placeholder="Descreva o seu álbum..."
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Álbum Público</p>
                <p className="text-xs text-muted-foreground">Permitir que outros usuários vejam este álbum</p>
              </div>
              <Switch checked={newAlbumIsPublic} onCheckedChange={setNewAlbumIsPublic} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAlbum(false)} className="mr-2">
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateAlbum}
              disabled={!newAlbumName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Álbum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
