'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, Users, CalendarCheck, Award, ThumbsUp, MessageCircle, Edit2, Send, 
  Share2, UserCircle, Hash, Smile, Flag, MapPin as MapPinIcon, MessageSquareText, 
  LayoutGrid, MessagesSquare as ChatIcon, NotebookText, Search, Filter, SortAsc,
  TrendingUp, Heart, Bookmark, Eye, Star, Flame, Crown, Gem, CheckCircle2,
  Image as ImageIcon, Video, Music, FileText, Link as LinkIcon, Plus, Settings,
  Bell, Globe, Lock, Users2, Zap, Activity, Calendar, Clock, Target, Gift,
  PieChart, BarChart3, LineChart, Sparkles, Trophy, Medal, Coins, Download, Shield, ExternalLink
} from "lucide-react";
import { cn } from '@/lib/utils';
import { UserProfileSheet } from '@/components/user/UserProfileSheet';
import type { UserProfileData } from '@/components/user/UserProfileDisplay'; 
import { achievementsData } from '@/data/achievements-data';
import { useToast } from '@/hooks/use-toast';

// Enhanced types with more features
type CommentUser = { 
  id: string; 
  name: string; 
  avatarUrl?: string; 
  dataAiHint?: string; 
  level?: number;
  isVerified?: boolean;
  isPremium?: boolean;
};

type PostUser = { 
  id: string; 
  name: string; 
  avatarUrl?: string; 
  dataAiHint?: string; 
  level?: number;
  isVerified?: boolean;
  isPremium?: boolean;
  followers?: number;
};

type Comment = {
  id: string;
  user: CommentUser;
  text: string;
  timestamp: Date;
  likes: number;
  replies?: Comment[];
  isEdited?: boolean;
};

type Post = {
  id: string;
  user: PostUser;
  timestamp: Date;
  content: string;
  imageUrl?: string;
  imageAiHint?: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: Comment[];
  tags?: string[];
  location?: string;
  isPromoted?: boolean;
  isPinned?: boolean;
  category?: 'general' | 'showcase' | 'tutorial' | 'event' | 'question';
};

type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  dataAiHint?: string;
  status?: 'online' | 'away' | 'offline';
  role?: 'admin' | 'moderator' | 'member';
};

type ChatMessage = {
  id: string;
  roomId: string;
  user: ChatUser;
  text: string;
  timestamp: Date;
  likes: number;
  type?: 'message' | 'system' | 'announcement';
  replyTo?: string;
};

type ChatRoom = {
  id: string;
  name: string;
  type: 'global' | 'zone' | 'district' | 'private';
  icon: React.ReactNode;
  memberCount?: number;
  isPrivate?: boolean;
  description?: string;
};

type ForumTopic = {
  id: string;
  title: string;
  author: PostUser;
  category: string;
  replies: number;
  views: number;
  lastActivity: Date;
  isPinned?: boolean;
  isLocked?: boolean;
  tags: string[];
};

type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  type: 'contest' | 'collaboration' | 'workshop' | 'meetup';
  status: 'upcoming' | 'active' | 'ended';
  rewards?: string[];
};

// Enhanced initial data
const initialPosts: Post[] = [
  {
    id: 'post1',
    user: { 
      id: 'user1', 
      name: 'PixelExplorerPT', 
      avatarUrl: 'https://placehold.co/48x48.png', 
      dataAiHint: 'profile avatar',
      level: 15,
      isVerified: true,
      isPremium: true,
      followers: 1247
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), 
    content: 'Acabei de descobrir uma nova área escondida no mapa de Portugal! 🗺️ Alguém já encontrou o "Vale Dourado dos Pixels Perdidos"? Fica perto da Serra da Estrela, mas precisei de usar uma combinação de cores específica para revelar a entrada. Tutorial completo no meu perfil! #PixelHunting #Portugal #Discovery',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'pixel art landscape',
    likes: 342,
    commentsCount: 28,
    shares: 15,
    comments: [
      { 
        id: 'c1', 
        user: { 
          id: 'user2', 
          name: 'ArteDigitalPT', 
          avatarUrl: 'https://placehold.co/40x40.png', 
          dataAiHint: 'gaming avatar',
          level: 12,
          isVerified: false,
          isPremium: true
        }, 
        text: 'Uau, que descoberta incrível! Vou tentar encontrar logo! Podes partilhar as coordenadas exatas?', 
        timestamp: new Date(Date.now() - 1000 * 60 * 25), 
        likes: 23,
        replies: []
      },
      { 
        id: 'c2', 
        user: { 
          id: 'user3', 
          name: 'PixelMaster', 
          avatarUrl: 'https://placehold.co/40x40.png', 
          dataAiHint: 'retro avatar',
          level: 18,
          isVerified: true,
          isPremium: false
        }, 
        text: 'Fantástico trabalho! Isto parece ser uma das áreas secretas que os developers mencionaram. Já conseguiste mapear toda a zona?', 
        timestamp: new Date(Date.now() - 1000 * 60 * 20), 
        likes: 31
      },
    ],
    tags: ['discovery', 'portugal', 'hidden'],
    location: 'Serra da Estrela',
    category: 'showcase',
    isPinned: true
  },
  {
    id: 'post2',
    user: { 
      id: 'user4', 
      name: 'RainhaDasCores', 
      avatarUrl: 'https://placehold.co/48x48.png', 
      dataAiHint: 'colorful avatar',
      level: 14,
      isVerified: false,
      isPremium: true,
      followers: 892
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    content: '🎨 Estou a organizar um evento de construção colaborativa no próximo sábado! O tema é "Monumentos de Portugal em Pixel Art". Quem quer participar e ajudar a construir o Mosteiro dos Jerónimos pixelizado? Precisamos de artistas para todas as secções! Prémios incríveis para os participantes! 🏆',
    likes: 156,
    commentsCount: 42,
    shares: 28,
    comments: [],
    tags: ['event', 'collaboration', 'monuments'],
    category: 'event',
    isPromoted: true
  },
];

const currentUser: UserProfileData = { 
  id: 'currentUser',
  name: 'UtilizadorAtual',
  username: '@EuMesmo',
  avatarUrl: 'https://placehold.co/40x40.png',
  dataAiHint: 'current user avatar',
  level: 8,
  xp: 2400,
  xpMax: 3000,
  credits: 1500,
  specialCredits: 45,
  bio: 'Artista pixel apaixonado por criar mundos digitais únicos.',
  pixelsOwned: 23,
  achievementsUnlocked: 6,
  unlockedAchievementIds: ['pixel_initiate', 'color_master'],
  rank: 156,
  location: 'Porto, Portugal',
  socials: [],
  albums: []
};

const mockUserProfiles: Record<string, UserProfileData> = {
  'user1': { 
    id: 'user1', name: 'PixelExplorerPT', username: '@PixelExplorerPT', 
    avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'explorer avatar', 
    level: 15, xp: 4500, xpMax: 5000, credits: 25000, specialCredits: 250, 
    bio: 'Explorador de mundos pixelizados e descobridor de segredos.', 
    pixelsOwned: 89, achievementsUnlocked: 12, unlockedAchievementIds: ['pixel_initiate', 'territory_pioneer'], 
    rank: 8, location: 'Serra da Estrela, Portugal', socials: [], albums: [] 
  },
  'user2': { 
    id: 'user2', name: 'ArteDigitalPT', username: '@ArteDigitalPT', 
    avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'digital artist avatar', 
    level: 12, xp: 3200, xpMax: 4000, credits: 18000, specialCredits: 180, 
    bio: 'Artista digital apaixonada por cores vibrantes e designs únicos.', 
    pixelsOwned: 67, achievementsUnlocked: 8, unlockedAchievementIds: ['pixel_artisan', 'color_master'], 
    rank: 23, location: 'Lisboa, Portugal', socials: [], albums: [] 
  },
  'currentUser': currentUser
};

const initialChatRooms: ChatRoom[] = [
  { 
    id: 'global', 
    name: 'Global', 
    type: 'global', 
    icon: <Users className="h-4 w-4 mr-2" />, 
    memberCount: 1247,
    description: 'Chat principal da comunidade'
  },
  { 
    id: 'zona-norte', 
    name: 'Zona Norte', 
    type: 'zone', 
    icon: <MapPinIcon className="h-4 w-4 mr-2" />, 
    memberCount: 342,
    description: 'Discussões sobre a região Norte'
  },
  { 
    id: 'distrito-lisboa', 
    name: 'Distrito Lisboa', 
    type: 'district', 
    icon: <MapPinIcon className="h-4 w-4 mr-2 text-accent" />, 
    memberCount: 523,
    description: 'Chat dos pixeleiros de Lisboa'
  },
  { 
    id: 'artists-lounge', 
    name: 'Artists Lounge', 
    type: 'private', 
    icon: <Star className="h-4 w-4 mr-2 text-purple-500" />, 
    memberCount: 89,
    isPrivate: true,
    description: 'Espaço exclusivo para artistas verificados'
  },
];

const initialChatMessages: ChatMessage[] = [
  { 
    id: 'cm1', 
    roomId: 'global', 
    user: { 
      id: 'u1', 
      name: 'PixelChatter', 
      avatarUrl: 'https://placehold.co/40x40.png', 
      dataAiHint:'user avatar',
      status: 'online',
      role: 'member'
    }, 
    text: 'Olá pessoal! Alguém quer colaborar num projeto de pixel art sobre o Porto? 🏙️', 
    timestamp: new Date(Date.now() - 1000 * 60 * 10), 
    likes: 8,
    type: 'message'
  },
  { 
    id: 'cm2', 
    roomId: 'global', 
    user: { 
      id: 'u2', 
      name: 'AdminBot', 
      avatarUrl: 'https://placehold.co/40x40.png', 
      dataAiHint:'bot avatar',
      status: 'online',
      role: 'admin'
    }, 
    text: '🎉 Bem-vindos ao Pixel Universe! Lembrem-se de seguir as regras da comunidade e ser cordiais uns com os outros.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 9), 
    likes: 23,
    type: 'announcement'
  },
];

const forumTopics: ForumTopic[] = [
  {
    id: 'topic1',
    title: 'Guia Completo: Como Começar no Pixel Universe',
    author: mockUserProfiles['user1'] as PostUser,
    category: 'Tutoriais',
    replies: 45,
    views: 1234,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    isPinned: true,
    tags: ['tutorial', 'beginner', 'guide']
  },
  {
    id: 'topic2',
    title: 'Partilhem as vossas criações de Março!',
    author: mockUserProfiles['user2'] as PostUser,
    category: 'Showcase',
    replies: 89,
    views: 2156,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    tags: ['showcase', 'art', 'monthly']
  },
];

const communityEvents: CommunityEvent[] = [
  {
    id: 'event1',
    title: 'Concurso de Pixel Art: Paisagens Portuguesas',
    description: 'Crie a melhor representação de uma paisagem portuguesa em pixel art!',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9),
    participants: 67,
    maxParticipants: 100,
    type: 'contest',
    status: 'upcoming',
    rewards: ['1000 Créditos', 'Badge Exclusivo', 'Destaque no Perfil']
  },
  {
    id: 'event2',
    title: 'Workshop: Técnicas Avançadas de Pixel Art',
    description: 'Aprenda técnicas profissionais com artistas experientes.',
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60 * 3),
    participants: 23,
    maxParticipants: 30,
    type: 'workshop',
    status: 'upcoming',
    rewards: ['Certificado', 'Acesso a Ferramentas Premium']
  },
];

const FormattedTimestamp: React.FC<{ timestamp: Date; className?: string }> = ({ timestamp, className }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const seconds = Math.round((now.getTime() - timestamp.getTime()) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (seconds < 5) setTimeAgo(`agora`);
      else if (seconds < 60) setTimeAgo(`${seconds}s`);
      else if (minutes < 60) setTimeAgo(`${minutes}m`);
      else if (hours < 24) setTimeAgo(`${hours}h`);
      else setTimeAgo(`${days}d`);
    };
    update();
    const intervalId = setInterval(update, 5000);
    return () => clearInterval(intervalId);
  }, [timestamp]);

  if (!timeAgo) return null;
  return <span className={cn("text-xs text-muted-foreground font-code", className)} title={timestamp.toLocaleString()}>{timeAgo}</span>;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<Post['category']>('general');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>(initialChatRooms[0].id);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: `post${Date.now()}`,
      user: { 
        id: currentUser.id, 
        name: currentUser.name, 
        avatarUrl: currentUser.avatarUrl, 
        dataAiHint: currentUser.dataAiHint,
        level: currentUser.level,
        isVerified: false,
        isPremium: false
      },
      timestamp: new Date(),
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      comments: [],
      category: postCategory,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setNewPostContent('');
    toast({
      title: "Publicação Criada!",
      description: "A sua publicação foi partilhada com a comunidade.",
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    toast({
      title: "Gostaste da publicação!",
      description: "O autor foi notificado do teu like.",
    });
  };
  
  const handleSharePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setPosts(posts.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
      toast({
        title: "Publicação Partilhada!",
        description: `Partilhaste a publicação de ${post.user.name}.`,
      });
    }
  };

  const handleSendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedChatRoomId) return;
    const message: ChatMessage = {
      id: `cm${Date.now()}`,
      roomId: selectedChatRoomId,
      user: { 
        id: currentUser.id, 
        name: currentUser.name, 
        avatarUrl: currentUser.avatarUrl, 
        dataAiHint: currentUser.dataAiHint,
        status: 'online',
        role: 'member'
      },
      text: newChatMessage,
      timestamp: new Date(),
      likes: 0,
      type: 'message'
    };
    setChatMessages(prev => [...prev, message]);
    setNewChatMessage('');
  };

  const handleJoinEvent = (eventId: string) => {
    toast({
      title: "Inscrito no Evento!",
      description: "Receberás notificações sobre atualizações do evento.",
    });
  };

  const displayedChatMessages = chatMessages.filter(msg => msg.roomId === selectedChatRoomId);
  const selectedChatRoom = initialChatRooms.find(room => room.id === selectedChatRoomId);
  
  const filteredPosts = posts
    .filter(post => {
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !post.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterCategory !== 'all' && post.category !== filterCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.commentsCount + b.shares) - (a.likes + a.commentsCount + a.shares);
        case 'trending':
          // Mock trending algorithm
          return (b.likes * 2 + b.shares * 3) - (a.likes * 2 + a.shares * 3);
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 space-y-6 mb-20 max-w-6xl">
        {/* Enhanced Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <Users className="h-8 w-8 mr-3 animate-glow" />
                  Comunidade Pixel Universe
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Conecte-se, partilhe e colabore com artistas de todo o mundo!
                </CardDescription>
              </div>
              
              {/* Community Stats */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="bg-background/50 p-3 text-center min-w-[100px]">
                  <p className="text-xl font-bold text-primary">1.2K</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </Card>
                <Card className="bg-background/50 p-3 text-center min-w-[100px]">
                  <p className="text-xl font-bold text-accent">247</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </Card>
                <Card className="bg-background/50 p-3 text-center min-w-[100px]">
                  <p className="text-xl font-bold text-green-500">89</p>
                  <p className="text-xs text-muted-foreground">Eventos</p>
                </Card>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="feed" className="font-headline">
              <LayoutGrid className="h-4 w-4 mr-2"/>
              Feed
            </TabsTrigger>
            <TabsTrigger value="chat" className="font-headline">
              <ChatIcon className="h-4 w-4 mr-2"/>
              Chat
            </TabsTrigger>
            <TabsTrigger value="events" className="font-headline">
              <Calendar className="h-4 w-4 mr-2"/>
              Eventos
            </TabsTrigger>
            <TabsTrigger value="forums" className="font-headline">
              <NotebookText className="h-4 w-4 mr-2"/>
              Fóruns
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Create Post Section */}
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm card-hover-glow">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                  <Edit2 className="h-5 w-5 mr-2 text-accent" /> 
                  Criar Nova Publicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                    <Avatar className="h-12 w-12 border-2 border-primary cursor-pointer hover:scale-105 transition-transform">
                      <AvatarImage src={currentUser.avatarUrl} alt="Seu Avatar" data-ai-hint={currentUser.dataAiHint} />
                      <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                  </UserProfileSheet>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="No que está a pensar, artista? Partilhe as suas criações, ideias ou perguntas..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[100px] bg-background/70 focus:border-primary resize-none"
                      rows={4}
                    />
                    
                    {/* Post Options */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="category" className="text-sm">Categoria:</Label>
                        <select 
                          id="category"
                          value={postCategory} 
                          onChange={(e) => setPostCategory(e.target.value as Post['category'])}
                          className="text-sm bg-background border border-border rounded px-2 py-1"
                        >
                          <option value="general">Geral</option>
                          <option value="showcase">Showcase</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="event">Evento</option>
                          <option value="question">Pergunta</option>
                        </select>
                      </div>
                      
                      <Button variant="outline" size="sm" className="button-hover-lift">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Imagem
                      </Button>
                      <Button variant="outline" size="sm" className="button-hover-lift">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Público</span>
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={!newPostContent.trim()} 
                  className="bg-primary hover:bg-primary/90 button-hover-lift"
                >
                  <Send className="h-4 w-4 mr-2" /> 
                  Publicar
                </Button>
              </CardFooter>
            </Card>

            {/* Filters and Search */}
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar publicações..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/70 focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'recent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('recent')}
                      className="font-code"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Recentes
                    </Button>
                    <Button
                      variant={sortBy === 'popular' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('popular')}
                      className="font-code"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Populares
                    </Button>
                    <Button
                      variant={sortBy === 'trending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('trending')}
                      className="font-code"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-card/70 backdrop-blur-sm card-hover-glow">
                  {post.isPinned && (
                    <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 border-b border-border/50">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Publicação em Destaque</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserProfileSheet userData={mockUserProfiles[post.user.id] || {...post.user, ...currentUser, id: post.user.id, name: post.user.name, avatarUrl: post.user.avatarUrl}} achievementsData={achievementsData}>
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-secondary cursor-pointer hover:scale-105 transition-transform">
                              <AvatarImage src={post.user.avatarUrl} alt={post.user.name} data-ai-hint={post.user.dataAiHint} />
                              <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {post.user.isPremium && (
                              <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                            )}
                          </div>
                        </UserProfileSheet>
                        <div>
                          <div className="flex items-center gap-2">
                            <UserProfileSheet userData={mockUserProfiles[post.user.id] || {...post.user, ...currentUser, id: post.user.id, name: post.user.name, avatarUrl: post.user.avatarUrl}} achievementsData={achievementsData}>
                              <p className="font-semibold text-primary text-md hover:underline cursor-pointer">{post.user.name}</p>
                            </UserProfileSheet>
                            {post.user.isVerified && (
                              <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            )}
                            {post.user.level && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                Nv.{post.user.level}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FormattedTimestamp timestamp={post.timestamp} />
                            {post.location && (
                              <>
                                <span>•</span>
                                <MapPinIcon className="h-3 w-3" />
                                <span>{post.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-3">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border aspect-video">
                        <img src={post.imageUrl} alt="Conteúdo da publicação" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" data-ai-hint={post.imageAiHint} />
                      </div>
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <Separator className="bg-border/50" />
                  
                  <CardFooter className="py-3 px-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLikePost(post.id)} 
                          className="hover:text-red-500 transition-colors px-2 button-hover-lift"
                        >
                          <Heart className="h-4 w-4 mr-2" /> 
                          <span className="text-sm font-code">{post.likes > 0 ? post.likes : ''}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:text-blue-500 transition-colors px-2 button-hover-lift">
                          <MessageCircle className="h-4 w-4 mr-2" /> 
                          <span className="text-sm font-code">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSharePost(post.id)}
                          className="hover:text-green-500 transition-colors px-2 button-hover-lift"
                        >
                          <Share2 className="h-4 w-4 mr-2" /> 
                          <span className="text-sm font-code">{post.shares > 0 ? post.shares : ''}</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-500 transition-colors">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 transition-colors">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                  
                  {/* Comments Preview */}
                  {post.comments.length > 0 && (
                    <div className="px-4 pb-4 pt-2">
                      <Separator className="mb-3 bg-border/30"/>
                      <h4 className="text-sm font-headline text-muted-foreground mb-2">Comentários:</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {post.comments.slice(0, 3).map(comment => ( 
                          <div key={comment.id} className="flex items-start space-x-3 text-sm bg-background/30 p-3 rounded-lg">
                            <UserProfileSheet userData={mockUserProfiles[comment.user.id] || {...comment.user, ...currentUser, id: comment.user.id, name: comment.user.name, avatarUrl: comment.user.avatarUrl}} achievementsData={achievementsData}>
                              <Avatar className="h-8 w-8 border border-border cursor-pointer">
                                <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint={comment.user.dataAiHint}/>
                                <AvatarFallback className="text-xs">{comment.user.name.substring(0,1)}</AvatarFallback>
                              </Avatar>
                            </UserProfileSheet>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <UserProfileSheet userData={mockUserProfiles[comment.user.id] || {...comment.user, ...currentUser, id: comment.user.id, name: comment.user.name, avatarUrl: comment.user.avatarUrl}} achievementsData={achievementsData}>
                                    <span className="font-semibold text-accent text-sm hover:underline cursor-pointer">{comment.user.name}</span>
                                  </UserProfileSheet>
                                  {comment.user.level && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      Nv.{comment.user.level}
                                    </Badge>
                                  )}
                                </div>
                                <FormattedTimestamp timestamp={comment.timestamp} className="text-xs"/>
                              </div>
                              <p className="text-foreground/90 text-sm leading-relaxed">{comment.text}</p>
                              <div className="flex items-center mt-2 gap-3">
                                <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-red-500 transition-colors">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {comment.likes > 0 && <span>{comment.likes}</span>}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-blue-500 transition-colors">
                                  Responder
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {post.comments.length > 3 && (
                        <Button variant="link" size="sm" className="text-xs mt-2 text-primary p-0 h-auto">
                          Ver todos os {post.commentsCount} comentários
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  <div className="px-4 pb-4 pt-2">
                    <div className="flex items-center space-x-3">
                      <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                        <Avatar className="h-8 w-8 border border-border cursor-pointer">
                          <AvatarImage src={currentUser.avatarUrl} alt="Seu Avatar" data-ai-hint={currentUser.dataAiHint} />
                          <AvatarFallback className="text-xs"><UserCircle className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      </UserProfileSheet>
                      <Input 
                        placeholder="Adicionar um comentário..." 
                        className="h-9 text-sm bg-background/50 focus:border-primary rounded-full px-4 flex-1"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Send className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredPosts.length === 0 && (
                <Card className="text-center p-8 bg-card/50">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <CardDescription>
                    {searchQuery ? 'Nenhuma publicação encontrada para a sua pesquisa.' : 'Ainda não há publicações. Seja o primeiro a partilhar algo!'}
                  </CardDescription>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Enhanced Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="shadow-xl bg-card/85 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                  <MessageSquareText className="h-6 w-6 mr-2 text-primary" /> 
                  Salas de Chat
                </CardTitle>
                <CardDescription>Converse em tempo real com outros membros da comunidade.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row min-h-[600px] max-h-[70vh]">
                  {/* Chat Rooms Sidebar */}
                  <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border p-4 bg-background/30">
                    <h3 className="text-sm font-semibold mb-4 font-code text-muted-foreground px-2">CANAIS</h3>
                    <div className="space-y-2">
                      {initialChatRooms.map(room => (
                        <Button
                          key={room.id}
                          variant={selectedChatRoomId === room.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start text-sm p-3 h-auto"
                          onClick={() => setSelectedChatRoomId(room.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              {React.cloneElement(room.icon as React.ReactElement, { 
                                className: cn("h-4 w-4 mr-3", selectedChatRoomId === room.id ? 'text-secondary-foreground' : 'text-muted-foreground') 
                              })}
                              <div className="text-left">
                                <p className="font-medium">{room.name}</p>
                                {room.description && (
                                  <p className="text-xs text-muted-foreground">{room.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="text-xs mb-1">
                                {room.memberCount}
                              </Badge>
                              {room.isPrivate && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Messages Area */}
                  <div className="flex-1 flex flex-col bg-background/10">
                    {selectedChatRoom && (
                      <CardHeader className="py-4 px-6 border-b border-border bg-card/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {React.cloneElement(selectedChatRoom.icon as React.ReactElement, {className: "h-5 w-5 mr-3 text-primary"})}
                            <div>
                              <CardTitle className="text-lg font-headline">{selectedChatRoom.name}</CardTitle>
                              {selectedChatRoom.description && (
                                <p className="text-sm text-muted-foreground">{selectedChatRoom.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-code text-xs">
                              <Users2 className="h-3 w-3 mr-1" />
                              {selectedChatRoom.memberCount} membros
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    )}
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {displayedChatMessages.map(msg => (
                          <div key={msg.id} className={cn(
                            "flex items-start space-x-3 group py-2 px-3 rounded-lg transition-colors",
                            msg.type === 'announcement' ? 'bg-primary/10' : 'hover:bg-muted/30'
                          )}>
                            <UserProfileSheet userData={mockUserProfiles[msg.user.id] || {...msg.user, ...currentUser, id: msg.user.id, name: msg.user.name, avatarUrl: msg.user.avatarUrl}} achievementsData={achievementsData}>
                              <div className="relative">
                                <Avatar className="h-10 w-10 border border-border cursor-pointer">
                                  <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} data-ai-hint={msg.user.dataAiHint} />
                                  <AvatarFallback>{msg.user.name.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                                  msg.user.status === 'online' ? 'bg-green-400' : 
                                  msg.user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                                )} />
                              </div>
                            </UserProfileSheet>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <UserProfileSheet userData={mockUserProfiles[msg.user.id] || {...msg.user, ...currentUser, id: msg.user.id, name: msg.user.name, avatarUrl: msg.user.avatarUrl}} achievementsData={achievementsData}>
                                  <p className="text-sm font-semibold text-primary hover:underline cursor-pointer">{msg.user.name}</p>
                                </UserProfileSheet>
                                {msg.user.role === 'admin' && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                {msg.user.role === 'moderator' && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Mod
                                  </Badge>
                                )}
                                <FormattedTimestamp timestamp={msg.timestamp} className="text-xs" />
                              </div>
                              <p className="text-sm text-foreground/90 leading-relaxed">{msg.text}</p>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500">
                                <Heart className="h-3.5 w-3.5" />
                              </Button>
                              {msg.likes > 0 && <span className="text-xs font-code text-muted-foreground">{msg.likes}</span>}
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-blue-500">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500">
                                <Flag className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {displayedChatMessages.length === 0 && (
                          <div className="text-center py-12">
                            <MessageSquareText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Ainda não há mensagens nesta sala. Seja o primeiro!</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-border bg-card/50">
                      <div className="flex items-center space-x-3">
                        <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                          <Avatar className="h-10 w-10 border border-border cursor-pointer">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint={currentUser.dataAiHint}/>
                            <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                        </UserProfileSheet>
                        <Input 
                          placeholder={`Mensagem em #${selectedChatRoom?.name || 'chat'}...`}
                          value={newChatMessage}
                          onChange={e => setNewChatMessage(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChatMessage())}
                          className="flex-1 bg-background/70 focus:border-primary h-11 text-sm"
                        />
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <Plus className="h-5 w-5" />
                        </Button>
                        <Button 
                          onClick={handleSendChatMessage} 
                          disabled={!newChatMessage.trim()} 
                          className="bg-primary hover:bg-primary/90 h-11 px-6"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {communityEvents.map(event => (
                <Card key={event.id} className="card-hover-glow overflow-hidden">
                  <div className={cn(
                    "h-2",
                    event.type === 'contest' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    event.type === 'workshop' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    event.type === 'collaboration' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    'bg-gradient-to-r from-orange-500 to-red-500'
                  )} />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-headline">{event.title}</CardTitle>
                        <CardDescription className="mt-2">{event.description}</CardDescription>
                      </div>
                      <Badge 
                        variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}
                        className="capitalize"
                      >
                        {event.status === 'upcoming' ? 'Em Breve' : 
                         event.status === 'active' ? 'Ativo' : 'Terminado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Início</p>
                        <p className="font-medium">{event.startDate.toLocaleDateString('pt-PT')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fim</p>
                        <p className="font-medium">{event.endDate.toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participantes</span>
                        <span className="font-medium">
                          {event.participants}{event.maxParticipants && `/${event.maxParticipants}`}
                        </span>
                      </div>
                      {event.maxParticipants && (
                        <Progress value={(event.participants / event.maxParticipants) * 100} className="h-2" />
                      )}
                    </div>
                    
                    {event.rewards && event.rewards.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Recompensas:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.rewards.map((reward, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Gift className="h-3 w-3 mr-1" />
                              {reward}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={event.status === 'ended'}
                      className="w-full"
                    >
                      {event.status === 'ended' ? 'Evento Terminado' : 'Participar'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Forums Tab */}
          <TabsContent value="forums" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <NotebookText className="h-5 w-5 mr-2" />
                  Tópicos em Destaque
                </CardTitle>
                <CardDescription>
                  Discussões importantes e guias da comunidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumTopics.map(topic => (
                    <Card key={topic.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {topic.isPinned && <Trophy className="h-4 w-4 text-amber-500" />}
                            <h4 className="font-semibold hover:text-primary transition-colors">{topic.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>por {topic.author.name}</span>
                            <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                            <span>{topic.replies} respostas</span>
                            <span>{topic.views} visualizações</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <FormattedTimestamp timestamp={topic.lastActivity} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Todos os Fóruns (Em Breve)
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
