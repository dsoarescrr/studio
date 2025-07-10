'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Award, Gem, MapPin as MapPinIcon, Coins, Gift, Trophy, BookImage, FolderPlus, 
  Link as LinkIcon, Twitter, Instagram, Github, UserCircle, Edit3, Save, X,
  Eye, Heart, MessageSquare, Share2, Calendar, Clock, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Star, Crown, Sparkles, Zap, Target, Palette,
  Settings, Bell, Shield, Download, Upload, Camera, Plus, ChevronRight,
  LineChart, Globe, Users, DollarSign, Flame, History, Package, Grid3X3, ShoppingCart,
  Filter, SortAsc
} from "lucide-react";
import { achievementsData } from '@/data/achievements-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Enhanced user data with more complete profile information
const mockUserData = {
  id: 'user_pixel_master_pt',
  name: 'PixelMasterPT',
  username: '@pixelmaster_pt',
  avatarUrl: 'https://placehold.co/128x128.png',
  dataAiHint: 'profile avatar',
  level: 8,
  xp: 2450,
  xpMax: 3000,
  credits: 12500,
  specialCredits: 120,
  bio: 'Explorador do universo digital, pixel a pixel. A transformar o mapa de Portugal numa obra de arte colaborativa 🎨✨',
  pixelsOwned: 42,
  achievementsUnlocked: 5,
  unlockedAchievementIds: [
    'pixel_initiate',
    'pixel_artisan', 
    'color_master',
    'community_voice',
    'time_virtuoso',
  ],
  rank: 1,
  location: 'Lisboa, Portugal',
  joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
  socials: [
    { platform: 'Twitter', handle: '@pixelmaster_pt', icon: <Twitter />, url: 'https://twitter.com' },
    { platform: 'Instagram', handle: 'pixel.master.pt', icon: <Instagram />, url: 'https://instagram.com' },
    { platform: 'GitHub', handle: 'PixelMasterPT', icon: <Github />, url: 'https://github.com' },
  ],
  albums: [
    {
      id: 'album1',
      name: 'Paisagens de Portugal',
      description: 'As mais belas paisagens portuguesas em pixel art.',
      coverPixelUrl: 'https://placehold.co/64x64.png',
      dataAiHint: 'album cover landscape',
      pixelCount: 18,
      likes: 156,
      views: 2340,
    },
    {
      id: 'album2',
      name: 'Monumentos Históricos',
      description: 'Uma viagem pixelizada pela história de Portugal.',
      coverPixelUrl: 'https://placehold.co/64x64.png',
      dataAiHint: 'album cover monuments',
      pixelCount: 12,
      likes: 89,
      views: 1250,
    },
  ],
  statistics: {
    totalSpent: 8450,
    totalEarned: 3200,
    favoriteRegion: 'Lisboa',
    mostUsedColor: '#D4A757',
    pixelsThisMonth: 12,
    rankingChange: 2,
    streakDays: 15,
    totalLogin: 89,
  },
  recentActivity: [
    { type: 'pixel_purchase', description: 'Comprou pixel em Lisboa', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), value: 150 },
    { type: 'achievement', description: 'Desbloqueou "Mestre das Cores"', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { type: 'pixel_edit', description: 'Editou pixel (245, 156)', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { type: 'social', description: 'Recebeu 23 novos gostos', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  ],
  preferences: {
    theme: 'dark',
    language: 'pt-PT',
    notifications: true,
    newsletter: true,
    publicProfile: true,
  },
  isPremium: true,
  isVerified: true,
};

// Activity type icons
const activityIcons = {
  pixel_purchase: <ShoppingCart className="h-4 w-4 text-green-500" />,
  achievement: <Trophy className="h-4 w-4 text-yellow-500" />,
  pixel_edit: <Edit3 className="h-4 w-4 text-blue-500" />,
  social: <Heart className="h-4 w-4 text-red-500" />,
  login: <UserCircle className="h-4 w-4 text-purple-500" />,
  sale: <DollarSign className="h-4 w-4 text-green-600" />,
};

export default function MemberPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(mockUserData.bio);
  const [editedLocation, setEditedLocation] = useState(mockUserData.location);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Perfil Atualizado",
      description: "As alterações ao seu perfil foram guardadas com sucesso.",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-card/50 to-background">
      <div className="container mx-auto py-6 px-4 space-y-6 mb-20 max-w-6xl">
        {/* Enhanced Profile Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar Section */}
              <div className="relative">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-primary shadow-xl group-hover:border-accent transition-colors duration-300">
                    <AvatarImage src={mockUserData.avatarUrl} alt={mockUserData.name} data-ai-hint={mockUserData.dataAiHint} />
                    <AvatarFallback className="text-4xl font-headline">
                      {mockUserData.name.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Badges */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                  {mockUserData.isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {mockUserData.isVerified && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                
                {/* Rank Badge */}
                {mockUserData.rank > 0 && (
                  <Badge className="absolute -bottom-2 -left-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg px-3 py-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    Top {mockUserData.rank}
                  </Badge>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h1 className="text-3xl font-headline font-bold text-gradient-gold">
                      {mockUserData.name}
                    </h1>
                    <p className="text-sm text-muted-foreground font-code">{mockUserData.username}</p>
                  </div>
                  
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="self-center md:self-start"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <div className="flex gap-2 self-center md:self-start">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleSaveProfile}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedBio(mockUserData.bio);
                          setEditedLocation(mockUserData.location);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Location & Bio */}
                <div className="space-y-2">
                  {!isEditing ? (
                    <>
                      {mockUserData.location && (
                        <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 mr-1 text-primary" />
                          <span>{mockUserData.location}</span>
                        </div>
                      )}
                      <p className="text-sm text-foreground italic">
                        "{mockUserData.bio}"
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="location" className="text-xs">Localização</Label>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2 text-primary" />
                          <Input 
                            id="location" 
                            value={editedLocation} 
                            onChange={(e) => setEditedLocation(e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bio" className="text-xs">Biografia</Label>
                        <Textarea 
                          id="bio" 
                          value={editedBio} 
                          onChange={(e) => setEditedBio(e.target.value)}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{mockUserData.pixelsOwned}</p>
                    <p className="text-xs text-muted-foreground">Píxeis</p>
                  </div>
                  <div className="text-center p-2 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-accent">{mockUserData.achievementsUnlocked}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-500">{mockUserData.statistics.streakDays}</p>
                    <p className="text-xs text-muted-foreground">Dias Seguidos</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Nível {mockUserData.level}</span>
                <span className="font-code">{mockUserData.xp}/{mockUserData.xpMax} XP</span>
              </div>
              <Progress 
                value={(mockUserData.xp / mockUserData.xpMax) * 100} 
                className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Próximo nível: {mockUserData.xpMax - mockUserData.xp} XP</span>
                <span>Bónus: +10% créditos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-12 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="font-headline">
              <UserCircle className="h-4 w-4 mr-2"/>
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="pixels" className="font-headline">
              <Grid3X3 className="h-4 w-4 mr-2"/>
              Meus Píxeis
            </TabsTrigger>
            <TabsTrigger value="achievements" className="font-headline">
              <Trophy className="h-4 w-4 mr-2"/>
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="statistics" className="font-headline">
              <BarChart3 className="h-4 w-4 mr-2"/>
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-headline">
              <Settings className="h-4 w-4 mr-2"/>
              Definições
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wallet Card */}
              <Card className="md:col-span-2 card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Coins className="h-5 w-5 mr-2" />
                    Carteira Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Créditos</p>
                          <p className="text-2xl font-bold text-primary">
                            {mockUserData.credits.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <Coins className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Ganhos: +{mockUserData.statistics.totalEarned.toLocaleString('pt-PT')}</span>
                        <span>Gastos: -{mockUserData.statistics.totalSpent.toLocaleString('pt-PT')}</span>
                      </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Especiais</p>
                          <p className="text-2xl font-bold text-accent">
                            {mockUserData.specialCredits.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <Gift className="h-8 w-8 text-accent" />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Expira em: 30 dias</span>
                        <span>Bónus: +10%</span>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Créditos
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {mockUserData.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                          <div className="p-2 rounded-full bg-muted/50">
                            {activityIcons[activity.type as keyof typeof activityIcons]}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                              {activity.value && ` • ${activity.value} créditos`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Albums Section */}
            <Card className="card-hover-glow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-primary">
                  <BookImage className="h-5 w-5 mr-2" />
                  Álbuns de Píxeis
                </CardTitle>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Novo Álbum
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockUserData.albums.map((album) => (
                    <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative bg-muted">
                        <img 
                          src={album.coverPixelUrl} 
                          alt={album.name}
                          className="w-full h-full object-cover"
                          data-ai-hint={album.dataAiHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                          <h3 className="text-white font-semibold">{album.name}</h3>
                          <p className="text-white/80 text-xs">{album.pixelCount} píxeis</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {album.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {album.likes}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Create New Album Card */}
                  <Card className="border-dashed border-2 flex items-center justify-center aspect-[4/3] hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center p-6">
                      <FolderPlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Criar Novo Álbum</p>
                      <p className="text-xs text-muted-foreground mt-1">Organize os seus píxeis</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockUserData.socials.map((social) => (
                    <Button key={social.platform} variant="outline" className="justify-start" asChild>
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        {React.cloneElement(social.icon as React.ReactElement, { className: "h-4 w-4 mr-2" })}
                        <span className="font-medium">{social.platform}:</span>
                        <span className="ml-2 text-muted-foreground truncate">{social.handle}</span>
                      </a>
                    </Button>
                  ))}
                  
                  {isEditing && (
                    <Button variant="outline" className="border-dashed">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Rede
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pixels Tab */}
          <TabsContent value="pixels" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="flex items-center text-primary">
                    <Grid3X3 className="h-5 w-5 mr-2" />
                    Meus Píxeis ({mockUserData.pixelsOwned})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <SortAsc className="h-4 w-4 mr-2" />
                      Ordenar
                    </Button>
                    <Button className="bg-gradient-to-r from-primary to-accent">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar Píxel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden hover:shadow-lg transition-all hover:scale-105">
                      <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-accent/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold">({Math.floor(Math.random() * 1000)}, {Math.floor(Math.random() * 1000)})</div>
                            <div className="text-xs text-muted-foreground">Lisboa</div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className={cn(
                            i % 5 === 0 ? "text-orange-500 border-orange-500/50 bg-orange-500/10" :
                            i % 5 === 1 ? "text-purple-500 border-purple-500/50 bg-purple-500/10" :
                            i % 5 === 2 ? "text-blue-500 border-blue-500/50 bg-blue-500/10" :
                            i % 5 === 3 ? "text-green-500 border-green-500/50 bg-green-500/10" :
                            "text-gray-500 border-gray-500/50 bg-gray-500/10"
                          )}>
                            {i % 5 === 0 ? "Lendário" :
                             i % 5 === 1 ? "Épico" :
                             i % 5 === 2 ? "Raro" :
                             i % 5 === 3 ? "Incomum" :
                             "Comum"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-sm">Pixel #{i+1}</h3>
                            <p className="text-xs text-muted-foreground">Adquirido: {new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT')}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Pixel Card */}
                  <Card className="border-dashed border-2 flex items-center justify-center aspect-square hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center p-6">
                      <Plus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Comprar Novo</p>
                      <p className="text-xs text-muted-foreground mt-1">Adicionar à coleção</p>
                    </div>
                  </Card>
                </div>
                
                <Button variant="outline" className="w-full mt-6">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Píxeis
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Trophy className="h-5 w-5 mr-2" />
                  Conquistas Desbloqueadas ({mockUserData.achievementsUnlocked}/{achievementsData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress 
                    value={(mockUserData.achievementsUnlocked / achievementsData.length) * 100} 
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievementsData
                      .filter(ach => mockUserData.unlockedAchievementIds.includes(ach.id))
                      .map((achievement) => {
                        const unlockedTiers = achievement.tiers.filter(t => t.isUnlocked).length;
                        const totalTiers = achievement.tiers.length;
                        const progressPercentage = (unlockedTiers / totalTiers) * 100;
                        
                        return (
                          <Card key={achievement.id} className={cn(
                            "border-2 transition-all duration-300 hover:shadow-xl",
                            achievement.rarity === 'legendary' ? "border-amber-400/60 bg-amber-500/5" :
                            achievement.rarity === 'epic' ? "border-purple-500/60 bg-purple-500/5" :
                            achievement.rarity === 'rare' ? "border-blue-500/60 bg-blue-500/5" :
                            achievement.rarity === 'uncommon' ? "border-green-500/60 bg-green-500/5" :
                            "border-gray-500/60 bg-gray-500/5"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "p-3 rounded-xl",
                                  achievement.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500" :
                                  achievement.rarity === 'epic' ? "bg-purple-500/20 text-purple-500" :
                                  achievement.rarity === 'rare' ? "bg-blue-500/20 text-blue-500" :
                                  achievement.rarity === 'uncommon' ? "bg-green-500/20 text-green-500" :
                                  "bg-gray-500/20 text-gray-500"
                                )}>
                                  {React.cloneElement(achievement.icon as React.ReactElement, { className: "h-8 w-8" })}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{achievement.name}</h3>
                                    <Badge className={cn(
                                      "text-xs",
                                      achievement.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500 border-amber-500/50" :
                                      achievement.rarity === 'epic' ? "bg-purple-500/20 text-purple-500 border-purple-500/50" :
                                      achievement.rarity === 'rare' ? "bg-blue-500/20 text-blue-500 border-blue-500/50" :
                                      achievement.rarity === 'uncommon' ? "bg-green-500/20 text-green-500 border-green-500/50" :
                                      "bg-gray-500/20 text-gray-500 border-gray-500/50"
                                    )}>
                                      {achievement.rarity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{achievement.overallDescription}</p>
                                  
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progresso</span>
                                      <span>{unlockedTiers}/{totalTiers} Níveis</span>
                                    </div>
                                    <Progress value={progressPercentage} className="h-2" />
                                  </div>
                                  
                                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <Zap className="h-3 w-3 text-primary" />
                                      <span>+{achievement.tiers.reduce((sum, tier) => sum + (tier.isUnlocked ? tier.xpReward : 0), 0)} XP</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Coins className="h-3 w-3 text-accent" />
                                      <span>+{achievement.tiers.reduce((sum, tier) => sum + (tier.isUnlocked ? tier.creditsReward : 0), 0)} créditos</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Trophy className="h-4 w-4 mr-2" />
                    Ver Todas as Conquistas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Stats */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Estatísticas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Gasto</p>
                      <p className="text-xl font-bold text-primary">{mockUserData.statistics.totalSpent.toLocaleString('pt-PT')}€</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Ganho</p>
                      <p className="text-xl font-bold text-green-500">{mockUserData.statistics.totalEarned.toLocaleString('pt-PT')}€</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Região Favorita</p>
                      <p className="text-xl font-bold text-blue-500">{mockUserData.statistics.favoriteRegion}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Cor Mais Usada</p>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: mockUserData.statistics.mostUsedColor }} />
                        <p className="text-lg font-bold font-code">{mockUserData.statistics.mostUsedColor}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Píxeis Este Mês</span>
                      <span className="font-semibold">{mockUserData.statistics.pixelsThisMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mudança no Ranking</span>
                      <span className="font-semibold text-green-500 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{mockUserData.statistics.rankingChange}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dias Seguidos</span>
                      <span className="font-semibold text-orange-500 flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        {mockUserData.statistics.streakDays}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total de Logins</span>
                      <span className="font-semibold">{mockUserData.statistics.totalLogin}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <LineChart className="h-5 w-5 mr-2" />
                    Atividade ao Longo do Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <LineChart className="h-10 w-10 mx-auto mb-2" />
                      <p>Gráfico de atividade ao longo do tempo</p>
                      <p className="text-xs mt-1">Mostrando dados dos últimos 30 dias</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      7 Dias
                    </Button>
                    <Button variant="default" size="sm" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      30 Dias
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      1 Ano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements Progress */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Trophy className="h-5 w-5 mr-2" />
                  Progresso de Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Conquistas Desbloqueadas</p>
                      <p className="text-sm text-muted-foreground">Progresso total</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{mockUserData.achievementsUnlocked}/{achievementsData.length}</p>
                      <p className="text-sm text-muted-foreground">{Math.round((mockUserData.achievementsUnlocked / achievementsData.length) * 100)}%</p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(mockUserData.achievementsUnlocked / achievementsData.length) * 100} 
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                    {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => {
                      const count = mockUserData.unlockedAchievementIds.filter(id => 
                        achievementsData.find(a => a.id === id)?.rarity === rarity
                      ).length;
                      const total = achievementsData.filter(a => a.rarity === rarity).length;
                      
                      return (
                        <Card key={rarity} className={cn(
                          "p-2",
                          rarity === 'legendary' ? "bg-amber-500/10 border-amber-500/30" :
                          rarity === 'epic' ? "bg-purple-500/10 border-purple-500/30" :
                          rarity === 'rare' ? "bg-blue-500/10 border-blue-500/30" :
                          rarity === 'uncommon' ? "bg-green-500/10 border-green-500/30" :
                          "bg-gray-500/10 border-gray-500/30"
                        )}>
                          <p className={cn(
                            "font-medium text-sm capitalize",
                            rarity === 'legendary' ? "text-amber-500" :
                            rarity === 'epic' ? "text-purple-500" :
                            rarity === 'rare' ? "text-blue-500" :
                            rarity === 'uncommon' ? "text-green-500" :
                            "text-gray-500"
                          )}>
                            {rarity}
                          </p>
                          <p className="text-xs">
                            {count}/{total}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Settings className="h-5 w-5 mr-2" />
                  Preferências da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Notificações</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-purchases" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span>Compras e Vendas</span>
                      </Label>
                      <Switch id="notify-purchases" defaultChecked={mockUserData.preferences.notifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-achievements" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span>Conquistas</span>
                      </Label>
                      <Switch id="notify-achievements" defaultChecked={mockUserData.preferences.notifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-social" className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span>Interações Sociais</span>
                      </Label>
                      <Switch id="notify-social" defaultChecked={mockUserData.preferences.notifications} />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Privacidade</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="public-profile" className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Perfil Público</span>
                      </Label>
                      <Switch id="public-profile" defaultChecked={mockUserData.preferences.publicProfile} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-activity" className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span>Mostrar Atividade</span>
                      </Label>
                      <Switch id="show-activity" defaultChecked={true} />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Conta</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                      </Button>
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Segurança
                      </Button>
                    </div>
                    <Button variant="destructive" className="w-full">
                      Terminar Sessão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
