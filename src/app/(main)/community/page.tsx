'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, MessageSquare, Heart, Share2, Eye, TrendingUp, Calendar, Clock,
  Plus, Search, Filter, Star, Crown, Zap, Gift, Award, Sparkles,
  ImageIcon, Video, Music, FileText, MapPin, Palette,
  ThumbsUp, MessageCircle, Bookmark, MoreHorizontal, Send, Smile,
  Camera, Mic, Paperclip, Hash, AtSign, Globe, Lock, UserPlus,
  Bell, Settings, Flag, Edit3, Trash2, Pin, Archive,
  Shield, ExternalLink, Trophy, Flame, Target, Coins, ChevronDown,
  ChevronUp, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw,
  Download, Upload, Copy, Link as LinkIcon, CheckCircle2, AlertCircle,
  Info, HelpCircle, Lightbulb, Megaphone, Coffee, Gamepad2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PostType = 'text' | 'image' | 'video' | 'pixel_showcase' | 'achievement' | 'poll' | 'event' | 'tutorial' | 'question';
type PostCategory = 'general' | 'showcase' | 'help' | 'events' | 'trading' | 'feedback' | 'tutorials' | 'news';

interface CommunityPost {
  id: string;
  type: PostType;
  category: PostCategory;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    dataAiHint?: string;
    level: number;
    badges: string[];
    isVerified: boolean;
    isPremium: boolean;
    reputation: number;
  };
  content: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    dataAiHint?: string;
    pixelCoords?: { x: number; y: number };
    achievementId?: string;
    poll?: {
      question: string;
      options: { text: string; votes: number; voters: string[] }[];
      totalVotes: number;
      endsAt: Date;
      allowMultiple: boolean;
    };
    event?: {
      title: string;
      description: string;
      startDate: Date;
      endDate: Date;
      location?: string;
      maxParticipants?: number;
      participants: string[];
      requirements?: string[];
    };
    tutorial?: {
      title: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      estimatedTime: string;
      steps: { title: string; description: string; imageUrl?: string }[];
      tools: string[];
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    saves: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isSaved: boolean;
    likedBy: string[];
  };
  metadata: {
    createdAt: Date;
    editedAt?: Date;
    isPinned: boolean;
    isHot: boolean;
    isFeatured: boolean;
    isSponsored: boolean;
    tags: string[];
    location?: string;
    language: string;
  };
  comments?: CommunityComment[];
}

interface CommunityComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    isVerified: boolean;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isLiked: boolean;
  replies?: CommunityComment[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'contest' | 'challenge' | 'meetup' | 'workshop' | 'tournament' | 'exhibition';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  rewards: string[];
  imageUrl?: string;
  dataAiHint?: string;
  isActive: boolean;
  isFeatured: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  requirements?: string[];
  organizer: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    type: 'pixel_showcase',
    category: 'showcase',
    author: {
      id: 'user1',
      name: 'PixelMaster',
      username: '@pixelmaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 15,
      badges: ['verified', 'artist', 'premium'],
      isVerified: true,
      isPremium: true,
      reputation: 2450
    },
    content: {
      text: 'Acabei de criar esta obra-prima em Lisboa! Inspirado na arquitetura tradicional portuguesa. O que acham? 🎨✨',
      imageUrl: 'https://placehold.co/400x300.png',
      dataAiHint: 'pixel art showcase',
      pixelCoords: { x: 245, y: 156 }
    },
    engagement: {
      likes: 127,
      comments: 23,
      shares: 8,
      views: 1247,
      saves: 45,
      isLiked: false,
      isBookmarked: true,
      isSaved: false,
      likedBy: ['user2', 'user3', 'user4']
    },
    metadata: {
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPinned: false,
      isHot: true,
      isFeatured: true,
      isSponsored: false,
      tags: ['arte', 'lisboa', 'paisagem', 'arquitetura'],
      location: 'Lisboa',
      language: 'pt'
    },
    comments: [
      {
        id: 'c1',
        author: {
          id: 'user2',
          name: 'ArtLover',
          avatar: 'https://placehold.co/32x32.png',
          level: 8,
          isVerified: false
        },
        content: 'Incrível! A atenção aos detalhes é fantástica. Como conseguiste essa textura?',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 12,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    type: 'tutorial',
    category: 'tutorials',
    author: {
      id: 'user2',
      name: 'TechGuru',
      username: '@techguru',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 22,
      badges: ['verified', 'educator', 'expert'],
      isVerified: true,
      isPremium: true,
      reputation: 3890
    },
    content: {
      text: 'Tutorial completo: Como criar pixel art profissional no Pixel Universe',
      tutorial: {
        title: 'Pixel Art para Iniciantes',
        difficulty: 'beginner',
        estimatedTime: '30 minutos',
        steps: [
          {
            title: 'Escolha da Localização',
            description: 'Selecione uma área com boa visibilidade e potencial artístico'
          },
          {
            title: 'Planeamento da Composição',
            description: 'Esboce a sua ideia antes de começar a comprar pixels'
          },
          {
            title: 'Seleção de Cores',
            description: 'Use uma paleta harmoniosa e adequada ao tema'
          }
        ],
        tools: ['Editor de Cores', 'Ferramenta de Zoom', 'Histórico de Alterações']
      }
    },
    engagement: {
      likes: 89,
      comments: 15,
      shares: 34,
      views: 567,
      saves: 78,
      isLiked: true,
      isBookmarked: false,
      isSaved: true,
      likedBy: ['user1', 'user3']
    },
    metadata: {
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isPinned: true,
      isHot: false,
      isFeatured: true,
      isSponsored: false,
      tags: ['tutorial', 'iniciantes', 'pixel-art', 'guia'],
      language: 'pt'
    }
  },
  {
    id: '3',
    type: 'poll',
    category: 'feedback',
    author: {
      id: 'user3',
      name: 'CommunityMod',
      username: '@communitymod',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'moderator avatar',
      level: 20,
      badges: ['moderator', 'verified', 'community'],
      isVerified: true,
      isPremium: true,
      reputation: 4200
    },
    content: {
      text: 'Que tipo de evento gostariam de ver mais na comunidade? A vossa opinião é importante para nós! 🗳️',
      poll: {
        question: 'Próximo evento da comunidade:',
        options: [
          { text: 'Concurso de Arte Pixel', votes: 45, voters: ['user1', 'user2'] },
          { text: 'Torneio de Colecionadores', votes: 32, voters: ['user3'] },
          { text: 'Workshop de Técnicas Avançadas', votes: 28, voters: [] },
          { text: 'Meetup Virtual da Comunidade', votes: 15, voters: [] }
        ],
        totalVotes: 120,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        allowMultiple: false
      }
    },
    engagement: {
      likes: 67,
      comments: 34,
      shares: 12,
      views: 890,
      saves: 23,
      isLiked: false,
      isBookmarked: false,
      isSaved: false,
      likedBy: []
    },
    metadata: {
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isPinned: true,
      isHot: false,
      isFeatured: false,
      isSponsored: false,
      tags: ['enquete', 'eventos', 'comunidade', 'feedback'],
      language: 'pt'
    }
  },
  {
    id: '4',
    type: 'event',
    category: 'events',
    author: {
      id: 'user4',
      name: 'EventOrganizer',
      username: '@eventorg',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'organizer avatar',
      level: 18,
      badges: ['organizer', 'verified'],
      isVerified: true,
      isPremium: false,
      reputation: 1890
    },
    content: {
      text: '🎉 Grande Concurso de Pixel Art - Tema: "Portugal Histórico"',
      event: {
        title: 'Concurso Nacional de Pixel Art',
        description: 'Crie a mais impressionante representação de um monumento histórico português!',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        participants: ['user1', 'user2', 'user5'],
        requirements: ['Mínimo nível 5', 'Tema histórico português', 'Obra original']
      }
    },
    engagement: {
      likes: 156,
      comments: 67,
      shares: 89,
      views: 2340,
      saves: 234,
      isLiked: false,
      isBookmarked: true,
      isSaved: true,
      likedBy: []
    },
    metadata: {
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isPinned: false,
      isHot: true,
      isFeatured: true,
      isSponsored: true,
      tags: ['concurso', 'portugal', 'histórico', 'prémios'],
      language: 'pt'
    }
  }
];

const mockEvents: CommunityEvent[] = [
  {
    id: '1',
    title: 'Concurso de Arte Pixel - Paisagens de Portugal',
    description: 'Crie a mais bela paisagem portuguesa usando píxeis! Prémios incríveis aguardam os vencedores.',
    type: 'contest',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    participants: 156,
    maxParticipants: 500,
    rewards: ['5000 Créditos', 'Badge Exclusivo', 'Destaque na Homepage', 'NFT Comemorativo'],
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'contest banner',
    isActive: true,
    isFeatured: true,
    difficulty: 'intermediate',
    requirements: ['Nível mínimo 10', 'Tema paisagem portuguesa', 'Obra original'],
    organizer: {
      name: 'Pixel Universe Team',
      avatar: 'https://placehold.co/32x32.png',
      isVerified: true
    }
  },
  {
    id: '2',
    title: 'Workshop: Técnicas Avançadas de Pixel Art',
    description: 'Aprenda técnicas profissionais com artistas experientes da comunidade.',
    type: 'workshop',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    participants: 45,
    maxParticipants: 100,
    rewards: ['Certificado Digital', 'Acesso a Ferramentas Premium', 'Mentoria Personalizada'],
    isActive: true,
    isFeatured: false,
    difficulty: 'advanced',
    requirements: ['Nível mínimo 15', 'Portfolio com 5+ obras'],
    organizer: {
      name: 'PixelMaster',
      avatar: 'https://placehold.co/32x32.png',
      isVerified: true
    }
  }
];

const categoryFilters = [
  { key: 'all', label: 'Tudo', icon: <Globe className="h-4 w-4" />, color: 'text-foreground' },
  { key: 'showcase', label: 'Showcase', icon: <Star className="h-4 w-4" />, color: 'text-yellow-500' },
  { key: 'tutorials', label: 'Tutoriais', icon: <Lightbulb className="h-4 w-4" />, color: 'text-blue-500' },
  { key: 'help', label: 'Ajuda', icon: <HelpCircle className="h-4 w-4" />, color: 'text-green-500' },
  { key: 'events', label: 'Eventos', icon: <Calendar className="h-4 w-4" />, color: 'text-purple-500' },
  { key: 'trading', label: 'Trading', icon: <TrendingUp className="h-4 w-4" />, color: 'text-orange-500' },
  { key: 'feedback', label: 'Feedback', icon: <MessageCircle className="h-4 w-4" />, color: 'text-pink-500' },
  { key: 'news', label: 'Notícias', icon: <Megaphone className="h-4 w-4" />, color: 'text-red-500' }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('text');
  const [newPostCategory, setNewPostCategory] = useState<PostCategory>('general');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = !searchQuery || 
      post.content.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
               (a.engagement.likes + a.engagement.comments + a.engagement.shares);
      case 'trending':
        const aScore = (a.engagement.likes * 2 + a.engagement.comments * 3 + a.engagement.shares * 4) / 
                      Math.max(1, (Date.now() - a.metadata.createdAt.getTime()) / (1000 * 60 * 60));
        const bScore = (b.engagement.likes * 2 + b.engagement.comments * 3 + b.engagement.shares * 4) / 
                      Math.max(1, (Date.now() - b.metadata.createdAt.getTime()) / (1000 * 60 * 60));
        return bScore - aScore;
      default:
        return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime();
    }
  });

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              likes: post.engagement.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
              isLiked: !post.engagement.isLiked
            }
          }
        : post
    ));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              isBookmarked: !post.engagement.isBookmarked
            }
          }
        : post
    ));
  };

  const handleSavePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              saves: post.engagement.isSaved ? post.engagement.saves - 1 : post.engagement.saves + 1,
              isSaved: !post.engagement.isSaved
            }
          }
        : post
    ));
    
    toast({
      title: "Post Guardado",
      description: "O post foi adicionado aos seus guardados.",
    });
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.content.poll) {
        const newOptions = [...post.content.poll.options];
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          votes: newOptions[optionIndex].votes + 1,
          voters: [...newOptions[optionIndex].voters, 'current_user']
        };
        
        return {
          ...post,
          content: {
            ...post.content,
            poll: {
              ...post.content.poll,
              options: newOptions,
              totalVotes: post.content.poll.totalVotes + 1
            }
          }
        };
      }
      return post;
    }));
    
    toast({
      title: "Voto Registado",
      description: "O seu voto foi registado com sucesso.",
    });
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      type: newPostType,
      category: newPostCategory,
      author: {
        id: 'current_user',
        name: 'Você',
        username: '@voce',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'current user avatar',
        level: 8,
        badges: [],
        isVerified: false,
        isPremium: false,
        reputation: 150
      },
      content: {
        text: newPostContent
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        saves: 0,
        isLiked: false,
        isBookmarked: false,
        isSaved: false,
        likedBy: []
      },
      metadata: {
        createdAt: new Date(),
        isPinned: false,
        isHot: false,
        isFeatured: false,
        isSponsored: false,
        tags: [],
        language: 'pt'
      }
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowCreatePost(false);
    
    toast({
      title: "Post Criado",
      description: "O seu post foi publicado na comunidade!",
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora mesmo';
  };

  const getBadgeIcon = (badge: string) => {
    const icons = {
      verified: <CheckCircle2 className="h-3 w-3 text-blue-500" />,
      artist: <Palette className="h-3 w-3 text-purple-500" />,
      collector: <Award className="h-3 w-3 text-green-500" />,
      moderator: <Shield className="h-3 w-3 text-red-500" />,
      premium: <Crown className="h-3 w-3 text-amber-500" />,
      educator: <Lightbulb className="h-3 w-3 text-blue-600" />,
      expert: <Target className="h-3 w-3 text-orange-500" />,
      organizer: <Users className="h-3 w-3 text-purple-600" />,
      community: <Heart className="h-3 w-3 text-pink-500" />
    };
    return icons[badge as keyof typeof icons];
  };

  const getPostTypeIcon = (type: PostType) => {
    const icons = {
      text: <MessageSquare className="h-4 w-4" />,
      image: <ImageIcon className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      pixel_showcase: <Sparkles className="h-4 w-4" />,
      achievement: <Trophy className="h-4 w-4" />,
      poll: <BarChart3 className="h-4 w-4" />,
      event: <Calendar className="h-4 w-4" />,
      tutorial: <Lightbulb className="h-4 w-4" />,
      question: <HelpCircle className="h-4 w-4" />
    };
    return icons[type];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
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
                  Conecte-se, partilhe e descubra com outros exploradores de píxeis
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm animate-pulse">
                  <Users className="h-4 w-4 mr-1" />
                  2.4K membros online
                </Badge>
                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 button-hover-lift">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Tipo de Post</label>
                          <Select value={newPostType} onValueChange={(value: PostType) => setNewPostType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="image">Imagem</SelectItem>
                              <SelectItem value="pixel_showcase">Showcase de Pixel</SelectItem>
                              <SelectItem value="poll">Enquete</SelectItem>
                              <SelectItem value="question">Pergunta</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Categoria</label>
                          <Select value={newPostCategory} onValueChange={(value: PostCategory) => setNewPostCategory(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Geral</SelectItem>
                              <SelectItem value="showcase">Showcase</SelectItem>
                              <SelectItem value="help">Ajuda</SelectItem>
                              <SelectItem value="tutorials">Tutoriais</SelectItem>
                              <SelectItem value="events">Eventos</SelectItem>
                              <SelectItem value="trading">Trading</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Textarea
                        placeholder="Partilhe algo com a comunidade..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px]"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Hash className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="feed" className="font-headline">
              <MessageSquare className="h-4 w-4 mr-2"/>
              Feed
            </TabsTrigger>
            <TabsTrigger value="events" className="font-headline">
              <Calendar className="h-4 w-4 mr-2"/>
              Eventos
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-headline">
              <Trophy className="h-4 w-4 mr-2"/>
              Top Membros
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Enhanced Filters */}
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Search and Sort */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar posts, utilizadores, tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/70 focus:border-primary"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={(value: 'recent' | 'popular' | 'trending') => setSortBy(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Mais Recentes</SelectItem>
                          <SelectItem value="popular">Mais Populares</SelectItem>
                          <SelectItem value="trending">Em Tendência</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                        {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map(filter => (
                      <Button
                        key={filter.key}
                        variant={activeCategory === filter.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(filter.key as any)}
                        className="font-code transition-all duration-200 hover:scale-105"
                      >
                        <span className={filter.color}>{filter.icon}</span>
                        <span className="ml-2">{filter.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Tipo de Post</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos os tipos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="image">Imagem</SelectItem>
                              <SelectItem value="video">Vídeo</SelectItem>
                              <SelectItem value="poll">Enquete</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Período</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Qualquer altura" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">Hoje</SelectItem>
                              <SelectItem value="week">Esta semana</SelectItem>
                              <SelectItem value="month">Este mês</SelectItem>
                              <SelectItem value="year">Este ano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Autor</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Qualquer autor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="verified">Verificados</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="moderators">Moderadores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum post encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou seja o primeiro a publicar nesta categoria!
                  </p>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="card-hover-glow overflow-hidden">
                    {/* Post Header */}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-border">
                              <AvatarImage 
                                src={post.author.avatar} 
                                alt={post.author.name}
                                data-ai-hint={post.author.dataAiHint}
                              />
                              <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {post.author.isPremium && (
                              <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm">{post.author.name}</h4>
                              <span className="text-xs text-muted-foreground">{post.author.username}</span>
                              <Badge variant="outline" className="text-xs">
                                Nv.{post.author.level}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {post.author.reputation} rep
                              </Badge>
                              {post.author.badges.map(badge => (
                                <div key={badge} title={badge} className="animate-pulse">
                                  {getBadgeIcon(badge)}
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{getTimeAgo(post.metadata.createdAt)}</span>
                              {post.metadata.location && (
                                <>
                                  <span>•</span>
                                  <MapPin className="h-3 w-3" />
                                  <span>{post.metadata.location}</span>
                                </>
                              )}
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {getPostTypeIcon(post.type)}
                                <span className="capitalize">{post.type.replace('_', ' ')}</span>
                              </div>
                              {post.metadata.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Fixado
                                </Badge>
                              )}
                              {post.metadata.isHot && (
                                <Badge className="text-xs bg-red-500 hover:bg-red-500">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                              {post.metadata.isFeatured && (
                                <Badge className="text-xs bg-yellow-500 hover:bg-yellow-500">
                                  <Star className="h-3 w-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                              {post.metadata.isSponsored && (
                                <Badge className="text-xs bg-purple-500 hover:bg-purple-500">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Patrocinado
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSavePost(post.id)}>
                              <Bookmark className="h-4 w-4 mr-2" />
                              {post.engagement.isSaved ? 'Remover dos Guardados' : 'Guardar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Partilhar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Flag className="h-4 w-4 mr-2" />
                              Reportar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Post Content */}
                      <div className="space-y-4">
                        {post.content.text && (
                          <p className="text-foreground leading-relaxed">{post.content.text}</p>
                        )}
                        
                        {/* Image Content */}
                        {post.content.imageUrl && (
                          <div className="rounded-lg overflow-hidden border border-border group">
                            <img 
                              src={post.content.imageUrl} 
                              alt="Post content"
                              data-ai-hint={post.content.dataAiHint}
                              className="w-full h-auto max-h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        
                        {/* Pixel Showcase */}
                        {post.content.pixelCoords && (
                          <Card className="bg-primary/10 border-primary/30">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                  <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">Pixel Showcase</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Coordenadas: ({post.content.pixelCoords.x}, {post.content.pixelCoords.y})
                                  </p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ver no Mapa
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Tutorial Content */}
                        {post.content.tutorial && (
                          <Card className="bg-blue-500/10 border-blue-500/30">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold flex items-center">
                                    <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                                    {post.content.tutorial.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {post.content.tutorial.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {post.content.tutorial.estimatedTime}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {post.content.tutorial.steps.slice(0, 2).map((step, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-medium">{step.title}</h5>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {post.content.tutorial.steps.length > 2 && (
                                    <p className="text-xs text-blue-500">
                                      +{post.content.tutorial.steps.length - 2} mais passos...
                                    </p>
                                  )}
                                </div>
                                
                                <Button size="sm" className="w-full">
                                  Ver Tutorial Completo
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Poll Content */}
                        {post.content.poll && (
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3">{post.content.poll.question}</h4>
                              <div className="space-y-3">
                                {post.content.poll.options.map((option, index) => {
                                  const percentage = (option.votes / post.content.poll!.totalVotes) * 100;
                                  const hasVoted = option.voters.includes('current_user');
                                  
                                  return (
                                    <div key={index} className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>{option.text}</span>
                                        <span className="text-muted-foreground">{option.votes} votos</span>
                                      </div>
                                      <div className="relative">
                                        <div className="w-full bg-muted rounded-full h-3">
                                          <div 
                                            className={cn(
                                              "h-3 rounded-full transition-all duration-500",
                                              hasVoted ? "bg-green-500" : "bg-primary"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-0 top-0 h-3 opacity-0 hover:opacity-100 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleVotePoll(post.id, index);
                                          }}
                                          disabled={post.content.poll!.options.some(o => o.voters.includes('current_user'))}
                                        >
                                          Votar
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                                <span>{post.content.poll.totalVotes} votos totais</span>
                                <span>Termina em {getTimeAgo(post.content.poll.endsAt)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Event Content */}
                        {post.content.event && (
                          <Card className="bg-purple-500/10 border-purple-500/30">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{post.content.event.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {post.content.event.description}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">Data</p>
                                      <p className="text-xs text-muted-foreground">
                                        {post.content.event.startDate.toLocaleDateString('pt-PT')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">Participantes</p>
                                      <p className="text-xs text-muted-foreground">
                                        {post.content.event.participants.length}/{post.content.event.maxParticipants || '∞'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {post.content.event.requirements && (
                                  <div className="text-sm">
                                    <p className="font-medium">Requisitos:</p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                                      {post.content.event.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <Button size="sm" className="w-full">
                                  Participar no Evento
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Tags */}
                        {post.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.metadata.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      {/* Engagement */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className={cn(
                              "text-muted-foreground hover:text-red-500 transition-colors",
                              post.engagement.isLiked && "text-red-500"
                            )}
                          >
                            <Heart className={cn(
                              "h-4 w-4 mr-1",
                              post.engagement.isLiked && "fill-current"
                            )} />
                            {post.engagement.likes}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.engagement.comments}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                            <Share2 className="h-4 w-4 mr-1" />
                            {post.engagement.shares}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSavePost(post.id)}
                            className={cn(
                              "text-muted-foreground hover:text-purple-500 transition-colors",
                              post.engagement.isSaved && "text-purple-500"
                            )}
                          >
                            <Bookmark className={cn(
                              "h-4 w-4 mr-1",
                              post.engagement.isSaved && "fill-current"
                            )} />
                            {post.engagement.saves}
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.engagement.views}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookmarkPost(post.id)}
                            className={cn(
                              "text-muted-foreground hover:text-yellow-500 transition-colors",
                              post.engagement.isBookmarked && "text-yellow-500"
                            )}
                          >
                            <Star className={cn(
                              "h-4 w-4",
                              post.engagement.isBookmarked && "fill-current"
                            )} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <h5 className="text-sm font-medium mb-3">Comentários</h5>
                          <div className="space-y-3">
                            {post.comments.slice(0, 2).map(comment => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                                  <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/30 p-3 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                    <Badge variant="outline" className="text-xs">Nv.{comment.author.level}</Badge>
                                    {comment.author.isVerified && (
                                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span>{getTimeAgo(comment.createdAt)}</span>
                                    <Button variant="ghost" size="sm" className="h-5 px-1 text-xs">
                                      <Heart className={cn(
                                        "h-3 w-3 mr-1",
                                        comment.isLiked && "fill-current text-red-500"
                                      )} />
                                      {comment.likes}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-5 px-1 text-xs">
                                      Responder
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {post.comments.length > 2 && (
                              <Button variant="ghost" size="sm" className="w-full text-xs">
                                Ver todos os {post.comments.length} comentários
                              </Button>
                            )}
                            
                            <div className="flex gap-3 mt-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/32x32.png" alt="You" />
                                <AvatarFallback>YO</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 relative">
                                <Input 
                                  placeholder="Escreva um comentário..." 
                                  className="pr-10"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Featured Event */}
            {events.find(e => e.isFeatured) && (
              <Card className="border-primary/50 bg-primary/5 overflow-hidden">
                <div className="relative">
                  <img 
                    src={events.find(e => e.isFeatured)?.imageUrl || 'https://placehold.co/800x300.png'} 
                    alt="Featured event"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <Badge className="bg-primary text-primary-foreground mb-2">Evento em Destaque</Badge>
                      <h3 className="text-xl font-bold">{events.find(e => e.isFeatured)?.title}</h3>
                      <p className="text-sm text-white/80">{events.find(e => e.isFeatured)?.description}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Data</p>
                          <p className="text-xs text-muted-foreground">
                            {events.find(e => e.isFeatured)?.startDate.toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Participantes</p>
                          <p className="text-xs text-muted-foreground">
                            {events.find(e => e.isFeatured)?.participants}/{events.find(e => e.isFeatured)?.maxParticipants || '∞'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 md:flex-none">
                        <Calendar className="h-4 w-4 mr-2" />
                        Participar
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partilhar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className={cn(
                  "card-hover-glow overflow-hidden",
                  event.isFeatured && "border-primary/50 bg-primary/5"
                )}>
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          {event.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs mb-2">
                          {event.type === 'contest' ? 'Concurso' :
                           event.type === 'workshop' ? 'Workshop' :
                           event.type === 'tournament' ? 'Torneio' :
                           event.type === 'meetup' ? 'Encontro' :
                           event.type === 'exhibition' ? 'Exposição' : 'Desafio'}
                        </Badge>
                        {event.difficulty && (
                          <Badge variant="outline" className={cn(
                            "text-xs ml-2",
                            event.difficulty === 'beginner' ? "text-green-500" :
                            event.difficulty === 'intermediate' ? "text-yellow-500" : "text-red-500"
                          )}>
                            {event.difficulty === 'beginner' ? 'Iniciante' :
                             event.difficulty === 'intermediate' ? 'Intermédio' : 'Avançado'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                          <AvatarFallback>{event.organizer.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <p className="text-xs font-medium">{event.organizer.name}</p>
                          <p className="text-xs text-muted-foreground">Organizador</p>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    {event.imageUrl && (
                      <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          data-ai-hint={event.dataAiHint}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.startDate.toLocaleDateString('pt-PT')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.participants} participantes</span>
                        </div>
                      </div>
                      
                      {event.maxParticipants && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Participação</span>
                            <span>{event.participants}/{event.maxParticipants}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recompensas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {event.rewards.map((reward, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Gift className="h-3 w-3 mr-1" />
                              {reward}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {event.requirements && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Requisitos:</h4>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {event.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" disabled={!event.isActive}>
                          {event.isActive ? 'Participar' : 'Evento Terminado'}
                        </Button>
                        <Button variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="p-4 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quer organizar um evento?</h3>
              <p className="text-muted-foreground mb-4">
                Partilhe os seus conhecimentos ou crie um desafio para a comunidade
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Evento
              </Button>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Trophy className="h-5 w-5 mr-2" />
                  Top Membros da Comunidade
                </CardTitle>
                <CardDescription>
                  Os membros mais ativos e influentes da nossa comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reputation">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="reputation">Reputação</TabsTrigger>
                    <TabsTrigger value="pixels">Pixels</TabsTrigger>
                    <TabsTrigger value="contributions">Contribuições</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reputation">
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-border">
                              <AvatarImage src={`https://placehold.co/40x40.png?text=${index + 1}`} alt={`User ${index + 1}`} />
                              <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">PixelMaster{index + 1}</h4>
                                {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                                {index % 2 === 0 && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Nível {20 - index}</span>
                                <span>•</span>
                                <span>{150 - index * 10} pixels</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{5000 - index * 300}</p>
                              <p className="text-xs text-muted-foreground">pontos</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="pixels">
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-border">
                              <AvatarImage src={`https://placehold.co/40x40.png?text=${index + 1}`} alt={`User ${index + 1}`} />
                              <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">PixelCollector{index + 1}</h4>
                                {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Nível {18 - index}</span>
                                <span>•</span>
                                <span>{3000 - index * 200} reputação</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">{1000 - index * 50}</p>
                              <p className="text-xs text-muted-foreground">pixels</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="contributions">
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-border">
                              <AvatarImage src={`https://placehold.co/40x40.png?text=${index + 1}`} alt={`User ${index + 1}`} />
                              <AvatarFallback>{index + 1}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">CommunityHelper{index + 1}</h4>
                                {index < 3 && <Award className="h-4 w-4 text-purple-500" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Nível {22 - index}</span>
                                <span>•</span>
                                <span>{index % 3 === 0 ? 'Moderador' : 'Contribuidor'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-500">{500 - index * 30}</p>
                              <p className="text-xs text-muted-foreground">contribuições</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 text-center">
                  <h4 className="text-sm font-medium mb-2">A sua Classificação</h4>
                  <div className="flex items-center justify-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                      42
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src="https://placehold.co/40x40.png" alt="You" />
                      <AvatarFallback>YO</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Você</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Nível 8</span>
                        <span>•</span>
                        <span>42 pixels</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">1250</p>
                      <p className="text-xs text-muted-foreground">pontos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Award className="h-5 w-5 mr-2" />
                  Conquistas da Comunidade
                </CardTitle>
                <CardDescription>
                  Conquistas especiais desbloqueadas pela comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30">
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                      <h3 className="font-semibold">10.000 Pixels Vendidos</h3>
                      <Progress value={78} className="h-2 mt-2 mb-1" />
                      <p className="text-xs text-muted-foreground">78% completo</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                    <CardContent className="p-4 text-center">
                      <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-semibold">5.000 Membros</h3>
                      <Progress value={45} className="h-2 mt-2 mb-1" />
                      <p className="text-xs text-muted-foreground">45% completo</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h3 className="font-semibold">100.000 Interações</h3>
                      <Progress value={62} className="h-2 mt-2 mb-1" />
                      <p className="text-xs text-muted-foreground">62% completo</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}