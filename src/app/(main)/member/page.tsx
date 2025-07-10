
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from '@/components/ui/switch'; 
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUpRight, Award, Camera, CreditCard, Gem, MapPin, Settings, User as UserIcon, 
  Edit3, Gift, Coins, Globe, Link as LinkIcon, Twitter, Instagram, Github, BookImage, 
  FolderPlus, Trophy, Bell, Shield, Palette, Calendar, TrendingUp, Users, Heart,
  Share2, Download, Upload, Eye, Star, Zap, Target, Crown, Sparkles, Activity,
  BarChart3, PieChart, LineChart, Clock, Flame, CheckCircle2, Lock, Plus,
  MessageSquare, ThumbsUp, Bookmark, Filter, Search, SortAsc, Grid3X3,
  Image as ImageIcon, Video, Music, FileText, ExternalLink, Copy, QrCode
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from 'react';
import { achievementsData, type Achievement } from '@/data/achievements-data'; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

// Enhanced user data with more comprehensive information
const enhancedUser = {
  name: "Pedro Silva",
  username: "@PixelMasterPT",
  avatarUrl: "https://placehold.co/128x128.png",
  dataAiHint: "profile avatar",
  level: 12,
  xp: 8450,
  xpMax: 10000,
  credits: 125000, 
  specialCredits: 1200, 
  bio: "Artista digital e explorador apaixonado por pixel art. Criando universos pixelizados, um quadrado de cada vez! 🇵🇹 | Membro desde 2024",
  pixelsOwned: 342,
  achievementsUnlocked: 15, 
  unlockedAchievementIds: ['pixel_initiate', 'color_master', 'community_star', 'time_virtuoso', 'album_curator'], 
  rank: 3, 
  primaryColor: "#FFD700",
  location: "Lisboa, Portugal",
  joinDate: "Janeiro 2024",
  lastActive: "Agora mesmo",
  totalPlayTime: "156h 23m",
  favoriteRegion: "Lisboa",
  pixelStreak: 23,
  totalLikes: 1247,
  totalShares: 89,
  followers: 234,
  following: 156,
  profileViews: 5678,
  isVerified: true,
  isPremium: true,
  privacySettings: {
    showActivity: true,
    showStats: true,
    allowMessages: true,
    showLocation: true
  },
  socials: [
    { platform: "Twitter", handle: "@PixelMasterPT", icon: <Twitter className="h-4 w-4" />, url: "#", verified: true },
    { platform: "Instagram", handle: "pixel.master.pt", icon: <Instagram className="h-4 w-4" />, url: "#", verified: false },
    { platform: "Github", handle: "PedroSilvaDev", icon: <Github className="h-4 w-4" />, url: "#", verified: true },
  ],
  albums: [
    { id: 'album1', name: 'Paisagens Pixelizadas', description: 'As minhas melhores paisagens de Portugal.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'pixel landscape', pixelCount: 45, likes: 234, isPublic: true, createdAt: '2024-01-15' },
    { id: 'album2', name: 'Retratos Retro', description: 'Personagens e retratos em estilo retro.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'pixel portrait', pixelCount: 28, likes: 156, isPublic: true, createdAt: '2024-02-03' },
    { id: 'album3', name: 'Abstrações Cósmicas', description: 'Explorando o cosmos em pixels.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'abstract space', pixelCount: 67, likes: 389, isPublic: false, createdAt: '2024-02-20' },
    { id: 'album4', name: 'Monumentos Portugueses', description: 'Recriações de monumentos icónicos.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'monuments', pixelCount: 23, likes: 445, isPublic: true, createdAt: '2024-03-01' },
  ],
  recentActivity: [
    { type: 'pixel_purchase', description: 'Comprou 3 pixels em Lisboa', timestamp: '2 min atrás', icon: <MapPin className="h-4 w-4" /> },
    { type: 'achievement', description: 'Desbloqueou "Mestre das Cores"', timestamp: '1h atrás', icon: <Trophy className="h-4 w-4" /> },
    { type: 'album_update', description: 'Adicionou 5 pixels ao álbum "Paisagens"', timestamp: '3h atrás', icon: <BookImage className="h-4 w-4" /> },
    { type: 'social', description: 'Recebeu 12 likes numa publicação', timestamp: '5h atrás', icon: <Heart className="h-4 w-4" /> },
  ],
  stats: {
    weeklyPixels: [12, 8, 15, 22, 18, 25, 19],
    monthlyCredits: [2500, 3200, 2800, 4100, 3600, 5200, 4800],
    regionDistribution: [
      { region: 'Lisboa', pixels: 89, percentage: 26 },
      { region: 'Porto', pixels: 67, percentage: 20 },
      { region: 'Coimbra', pixels: 45, percentage: 13 },
      { region: 'Braga', pixels: 34, percentage: 10 },
      { region: 'Outros', pixels: 107, percentage: 31 }
    ]
  }
};

export default function MemberPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editForm, setEditForm] = useState({
    bio: enhancedUser.bio,
    location: enhancedUser.location,
    privacySettings: enhancedUser.privacySettings,
    socialLinks: enhancedUser.socials.map(social => ({ ...social }))
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialHandle, setNewSocialHandle] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [showAddSocial, setShowAddSocial] = useState(false);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const nextLevelXp = enhancedUser.xpMax - enhancedUser.xp;
  const xpPercentage = (enhancedUser.xp / enhancedUser.xpMax) * 100;

  const displayedAchievements = enhancedUser.unlockedAchievementIds
    .map(id => achievementsData.find(ach => ach.id === id))
    .filter(ach => ach !== undefined) as Achievement[];

  const handleSaveProfile = () => {
    // Simulate API call
    setTimeout(() => {
      // Auto-resize textarea
      if (bioTextareaRef.current) {
        bioTextareaRef.current.style.height = 'auto';
        bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
      }
      
      toast({
        title: "Perfil Atualizado",
        description: "As suas alterações foram guardadas com sucesso.",
      });
      setIsEditing(false);
    }, 1000);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copiado",
      description: "O link do seu perfil foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 mb-16 max-w-4xl">
        {/* Header Section with Enhanced Design */}
        <Card className="relative overflow-hidden shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          
          <CardHeader className="relative pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl ring-4 ring-primary/20 transition-all duration-300 group-hover:scale-105">
                  <AvatarImage src={enhancedUser.avatarUrl} alt={enhancedUser.name} data-ai-hint={enhancedUser.dataAiHint} />
                  <AvatarFallback className="font-headline text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {enhancedUser.name.substring(0, 1)}{enhancedUser.username.substring(1,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicators */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                  {enhancedUser.isVerified && (
                    <Badge className="bg-blue-500 hover:bg-blue-500/90 text-xs px-1.5 py-0.5">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {enhancedUser.isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs px-1.5 py-0.5">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {enhancedUser.rank <= 10 && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xs px-1.5 py-0.5">
                      <Trophy className="h-3 w-3 mr-1" />
                      Top {enhancedUser.rank}
                    </Badge>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-card bg-muted hover:bg-accent shadow-lg transition-all duration-200 hover:scale-110"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h1 className="text-3xl font-headline font-bold text-gradient-gold flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    {enhancedUser.name}
                    {displayedAchievements.slice(0, 3).map(ach => (
                      <TooltipProvider key={ach.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="animate-bounce-slow">
                              {React.cloneElement(ach.icon as React.ReactElement, { className: "h-6 w-6 text-primary" })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>{ach.name}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </h1>
                  <p className="text-lg text-muted-foreground font-code">{enhancedUser.username}</p>
                </div>

                {/* Stats Row */}
                <div className="flex justify-center sm:justify-start gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-lg text-primary">{enhancedUser.followers}</p>
                    <p className="text-muted-foreground">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-primary">{enhancedUser.following}</p>
                    <p className="text-muted-foreground">A seguir</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-primary">{enhancedUser.profileViews}</p>
                    <p className="text-muted-foreground">Visualizações</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center sm:justify-start gap-2 flex-wrap">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-primary hover:bg-primary/90 button-hover-lift"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Guardar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="button-hover-lift"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-primary/90 button-hover-lift"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleShareProfile} className="button-hover-lift">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partilhar
                  </Button>
                  <Button variant="outline" className="button-hover-lift">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm py-2 -mx-4 px-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="font-headline text-xs sm:text-sm py-2">
                <UserIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="font-headline text-xs sm:text-sm py-2">
                <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Estatísticas</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="albums" className="font-headline text-xs sm:text-sm py-2">
                <BookImage className="h-4 w-4 mr-1 sm:mr-2" />
                Álbuns
              </TabsTrigger>
              <TabsTrigger value="activity" className="font-headline text-xs sm:text-sm py-2">
                <Activity className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Atividade</span>
                <span className="sm:hidden">Ativ.</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="font-headline text-xs sm:text-sm py-2">
                <Users className="h-4 w-4 mr-1 sm:mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-headline text-xs sm:text-sm py-2">
                <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Definições</span>
                <span className="sm:hidden">Def.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Bio Section */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Biografia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">Biografia</Label>
                      <Textarea
                        ref={bioTextareaRef}
                        value={editForm.bio}
                        onChange={(e) => {
                          setEditForm({...editForm, bio: e.target.value});
                          // Auto-resize textarea
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        className="min-h-[100px] resize-none"
                        placeholder="Conte-nos sobre si..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {editForm.bio.length}/500 caracteres
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground leading-relaxed">{enhancedUser.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="card-hover-glow bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">{enhancedUser.pixelsOwned}</p>
                  <p className="text-sm text-muted-foreground">Pixels Owned</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover-glow bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent">{enhancedUser.achievementsUnlocked}</p>
                  <p className="text-sm text-muted-foreground">Conquistas</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover-glow bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <Flame className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-500">{enhancedUser.pixelStreak}</p>
                  <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover-glow bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-500">{enhancedUser.totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </CardContent>
              </Card>
            </div>

            {/* Level Progress */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-primary">
                    <Zap className="h-5 w-5 mr-2" />
                    Progresso de Nível
                  </span>
                  <Badge variant="secondary" className="font-code">Nível {enhancedUser.level}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">XP Atual</span>
                  <span className="font-code text-primary">{enhancedUser.xp.toLocaleString('pt-PT')} / {enhancedUser.xpMax.toLocaleString('pt-PT')}</span>
                </div>
                <Progress value={xpPercentage} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent animate-glow" />
                <p className="text-sm text-muted-foreground text-center">
                  Faltam <span className="text-accent font-bold">{nextLevelXp.toLocaleString('pt-PT')} XP</span> para o próximo nível
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <LineChart className="h-5 w-5 mr-2" />
                    Atividade Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enhancedUser.stats.weeklyPixels.map((pixels, index) => {
                      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      const maxPixels = Math.max(...enhancedUser.stats.weeklyPixels);
                      const percentage = (pixels / maxPixels) * 100;
                      
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm font-code w-8">{days[index]}</span>
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold w-8 text-right">{pixels}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Region Distribution */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição por Região
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {enhancedUser.stats.regionDistribution.map((region, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{region.region}</span>
                          <span className="font-code text-primary">{region.pixels} ({region.percentage}%)</span>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="card-hover-glow text-center">
                <CardContent className="p-4">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xl font-bold">{enhancedUser.totalPlayTime}</p>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover-glow text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-xl font-bold">{enhancedUser.favoriteRegion}</p>
                  <p className="text-sm text-muted-foreground">Região Favorita</p>
                </CardContent>
              </Card>
              
              <Card className="card-hover-glow text-center">
                <CardContent className="p-4">
                  <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xl font-bold">{enhancedUser.joinDate}</p>
                  <p className="text-sm text-muted-foreground">Membro desde</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-headline text-primary">Meus Álbuns</h3>
              <Button className="bg-primary hover:bg-primary/90 button-hover-lift">
                <FolderPlus className="h-4 w-4 mr-2" />
                Novo Álbum
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enhancedUser.albums.map(album => (
                <Card key={album.id} className="card-hover-glow group overflow-hidden">
                  <div className="relative">
                    <Image 
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="location-input"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="A sua localização"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      A sua localização será visível para outros utilizadores
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{album.likes}</span>
                        </div>
                        <Badge variant={album.isPublic ? "default" : "secondary"} className="text-xs">
                          {album.isPublic ? <Eye className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                          {album.isPublic ? 'Público' : 'Privado'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{album.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{album.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-code text-primary">{album.pixelCount} pixels</span>
                      <span className="text-muted-foreground">{album.createdAt}</span>
                    </div>
                  </CardContent>
                  <CardContent className="p-4 pt-0">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Activity className="h-5 w-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {enhancedUser.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-primary">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Redes Sociais
                  </CardTitle>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowAddSocial(!showAddSocial)}
                    >
                      {showAddSocial ? 'Cancelar' : 'Adicionar Rede'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Social Form */}
                {isEditing && showAddSocial && (
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3 mb-4">
                    <h4 className="font-medium text-sm">Adicionar Nova Rede Social</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Plataforma</Label>
                        <Select 
                          value={newSocialPlatform} 
                          onValueChange={setNewSocialPlatform}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Github">Github</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Nome de Utilizador</Label>
                        <Input 
                          value={newSocialHandle} 
                          onChange={(e) => setNewSocialHandle(e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">URL</Label>
                        <Input 
                          value={newSocialUrl} 
                          onChange={(e) => setNewSocialUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          // Add new social
                          if (newSocialPlatform && newSocialHandle && newSocialUrl) {
                            const newSocial = {
                              platform: newSocialPlatform,
                              handle: newSocialHandle,
                              url: newSocialUrl,
                              verified: false,
                              icon: <Twitter className="h-4 w-4" /> // Default icon
                            };
                            
                            setEditForm(prev => ({
                              ...prev,
                              socialLinks: [...prev.socialLinks, newSocial]
                            }));
                            
                            // Reset form
                            setNewSocialPlatform('');
                            setNewSocialHandle('');
                            setNewSocialUrl('');
                            setShowAddSocial(false);
                            
                            toast({
                              title: "Rede Social Adicionada",
                              description: "A rede social foi adicionada ao seu perfil."
                            });
                          }
                        }}
                        disabled={!newSocialPlatform || !newSocialHandle || !newSocialUrl}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Social Links List */}
                {(isEditing ? editForm.socialLinks : enhancedUser.socials).length > 0 ? (
                  <div className="space-y-3">
                    {(isEditing ? editForm.socialLinks : enhancedUser.socials).map((social, index) => (
                      <div key={social.platform + index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {social.icon}
                          <div>
                            <p className="font-semibold">{social.platform}</p>
                            <p className="text-sm text-muted-foreground font-code">{social.handle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {social.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {isEditing ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                              onClick={() => {
                                setEditForm(prev => ({
                                  ...prev,
                                  socialLinks: prev.socialLinks.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" asChild>
                              <a href={social.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/20 rounded-lg">
                    <LinkIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium mb-1">Nenhuma rede social adicionada</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conecte suas redes sociais para aumentar sua visibilidade
                    </p>
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Rede Social
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Shield className="h-5 w-5 mr-2" />
                  Definições de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-activity">Mostrar Atividade</Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros vejam a sua atividade recente</p>
                  </div>
                  <Switch 
                    id="show-activity" 
                    checked={editForm.privacySettings.showActivity}
                    onCheckedChange={(checked) => setEditForm({
                      ...editForm, 
                      privacySettings: {...editForm.privacySettings, showActivity: checked}
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-stats">Mostrar Estatísticas</Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros vejam as suas estatísticas</p>
                  </div>
                  <Switch 
                    id="show-stats" 
                    checked={editForm.privacySettings.showStats}
                    onCheckedChange={(checked) => setEditForm({
                      ...editForm, 
                      privacySettings: {...editForm.privacySettings, showStats: checked}
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-messages">Permitir Mensagens</Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros utilizadores lhe enviem mensagens</p>
                  </div>
                  <Switch 
                    id="allow-messages" 
                    checked={editForm.privacySettings.allowMessages}
                    onCheckedChange={(checked) => setEditForm({
                      ...editForm, 
                      privacySettings: {...editForm.privacySettings, allowMessages: checked}
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-location">Mostrar Localização</Label>
                    <p className="text-sm text-muted-foreground">Mostrar a sua localização no perfil</p>
                  </div>
                  <Switch 
                    id="show-location" 
                    checked={editForm.privacySettings.showLocation}
                    onCheckedChange={(checked) => setEditForm({
                      ...editForm, 
                      privacySettings: {...editForm.privacySettings, showLocation: checked}
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Palette className="h-5 w-5 mr-2" />
                  Personalização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location-input">Localização</Label>
                  <Input
                    id="location-input"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder="A sua localização"
                    className="mt-2"
                  />
                </div>
                
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Tema da Interface</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="border border-primary rounded-lg p-2 flex items-center justify-center flex-col cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary mb-1"></div>
                        <span className="text-xs">Dourado</span>
                      </div>
                      <div className="border border-border rounded-lg p-2 flex items-center justify-center flex-col cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-500 mb-1"></div>
                        <span className="text-xs">Azul</span>
                      </div>
                      <div className="border border-border rounded-lg p-2 flex items-center justify-center flex-col cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-green-500 mb-1"></div>
                        <span className="text-xs">Verde</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90">
                    <Settings className="h-4 w-4 mr-2" />
                    Guardar Definições
                  </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
