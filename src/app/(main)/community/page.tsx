
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
import { 
  Users, MessageSquare, Heart, Share2, Eye, TrendingUp, Calendar, Clock,
  Plus, Search, Filter, Star, Crown, Zap, Gift, Award, Sparkles,
  ImageIcon, Video, Music, FileText, MapPin, Palette,
  ThumbsUp, MessageCircle, Bookmark, MoreHorizontal, Send, Smile,
  Camera, Mic, Paperclip, Hash, AtSign, Globe, Lock, UserPlus,
  Bell, Settings, Flag, Edit3, Trash2, Pin, Archive,
  Shield, ExternalLink, Trophy
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
import { Progress } from '@/components/ui/progress';

type PostType = 'text' | 'image' | 'video' | 'pixel_showcase' | 'achievement' | 'poll';
type PostCategory = 'general' | 'showcase' | 'help' | 'events' | 'trading' | 'feedback';

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
      options: { text: string; votes: number }[];
      totalVotes: number;
      endsAt: Date;
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  metadata: {
    createdAt: Date;
    editedAt?: Date;
    isPinned: boolean;
    isHot: boolean;
    tags: string[];
    location?: string;
  };
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'contest' | 'challenge' | 'meetup' | 'workshop' | 'tournament';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  rewards: string[];
  imageUrl?: string;
  dataAiHint?: string;
  isActive: boolean;
  isFeatured: boolean;
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
      badges: ['verified', 'artist'],
      isVerified: true,
      isPremium: true
    },
    content: {
      text: 'Acabei de criar esta obra-prima em Lisboa! O que acham? 🎨',
      imageUrl: 'https://placehold.co/400x300.png',
      dataAiHint: 'pixel art showcase',
      pixelCoords: { x: 245, y: 156 }
    },
    engagement: {
      likes: 127,
      comments: 23,
      shares: 8,
      views: 1247,
      isLiked: false,
      isBookmarked: true
    },
    metadata: {
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isPinned: false,
      isHot: true,
      tags: ['arte', 'lisboa', 'paisagem'],
      location: 'Lisboa'
    }
  },
  {
    id: '2',
    type: 'achievement',
    category: 'general',
    author: {
      id: 'user2',
      name: 'ColorQueen',
      username: '@colorqueen',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 12,
      badges: ['collector'],
      isVerified: false,
      isPremium: true
    },
    content: {
      text: 'Finalmente desbloqueei "Mestre das Cores"! 🌈 Foi uma jornada incrível!',
      achievementId: 'color_master'
    },
    engagement: {
      likes: 89,
      comments: 15,
      shares: 3,
      views: 567,
      isLiked: true,
      isBookmarked: false
    },
    metadata: {
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isPinned: false,
      isHot: false,
      tags: ['conquista', 'cores'],
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
      badges: ['moderator', 'verified'],
      isVerified: true,
      isPremium: true
    },
    content: {
      text: 'Que tipo de evento gostariam de ver mais na comunidade?',
      poll: {
        question: 'Próximo evento da comunidade:',
        options: [
          { text: 'Concurso de Arte Pixel', votes: 45 },
          { text: 'Torneio de Colecionadores', votes: 32 },
          { text: 'Workshop de Técnicas', votes: 28 },
          { text: 'Meetup Virtual', votes: 15 }
        ],
        totalVotes: 120,
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    },
    engagement: {
      likes: 67,
      comments: 34,
      shares: 12,
      views: 890,
      isLiked: false,
      isBookmarked: false
    },
    metadata: {
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isPinned: true,
      isHot: false,
      tags: ['enquete', 'eventos', 'comunidade'],
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
    rewards: ['5000 Créditos', 'Badge Exclusivo', 'Destaque na Homepage'],
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'contest banner',
    isActive: true,
    isFeatured: true
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
    rewards: ['Certificado', 'Acesso a Ferramentas Premium'],
    isActive: true,
    isFeatured: false
  }
];

const categoryFilters = [
  { key: 'all', label: 'Tudo', icon: <Globe className="h-4 w-4" /> },
  { key: 'showcase', label: 'Showcase', icon: <Star className="h-4 w-4" /> },
  { key: 'help', label: 'Ajuda', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'events', label: 'Eventos', icon: <Calendar className="h-4 w-4" /> },
  { key: 'trading', label: 'Trading', icon: <TrendingUp className="h-4 w-4" /> },
  { key: 'feedback', label: 'Feedback', icon: <MessageCircle className="h-4 w-4" /> }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [events, setEvents] = useState<CommunityEvent[]>(mockEvents);
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('text');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { toast } = useToast();

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = !searchQuery || 
      post.content.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
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

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      type: newPostType,
      category: 'general',
      author: {
        id: 'current_user',
        name: 'Você',
        username: '@voce',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'current user avatar',
        level: 8,
        badges: [],
        isVerified: false,
        isPremium: false
      },
      content: {
        text: newPostContent
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false
      },
      metadata: {
        createdAt: new Date(),
        isPinned: false,
        isHot: false,
        tags: []
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
      verified: <Star className="h-3 w-3 text-blue-500" />,
      artist: <Palette className="h-3 w-3 text-purple-500" />,
      collector: <Award className="h-3 w-3 text-green-500" />,
      moderator: <Crown className="h-3 w-3 text-red-500" />
    };
    return icons[badge as keyof typeof icons];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
        {/* Header */}
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
                <Badge variant="secondary" className="text-sm">
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
            {/* Filters */}
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/70 focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map(filter => (
                      <Button
                        key={filter.key}
                        variant={activeCategory === filter.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(filter.key as any)}
                        className="font-code transition-all duration-200 hover:scale-105"
                      >
                        {filter.icon}
                        <span className="ml-2">{filter.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="card-hover-glow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border-2 border-border">
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
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{post.author.name}</h4>
                            <span className="text-xs text-muted-foreground">{post.author.username}</span>
                            <Badge variant="outline" className="text-xs">
                              Nível {post.author.level}
                            </Badge>
                            {post.author.badges.map(badge => (
                              <div key={badge} title={badge}>
                                {getBadgeIcon(badge)}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{getTimeAgo(post.metadata.createdAt)}</span>
                            {post.metadata.location && (
                              <>
                                <span>•</span>
                                <MapPin className="h-3 w-3" />
                                <span>{post.metadata.location}</span>
                              </>
                            )}
                            {post.metadata.isPinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="h-3 w-3 mr-1" />
                                Fixado
                              </Badge>
                            )}
                            {post.metadata.isHot && (
                              <Badge className="text-xs bg-red-500 hover:bg-red-500">
                                <Zap className="h-3 w-3 mr-1" />
                                Hot
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
                          <DropdownMenuItem>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Guardar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Partilhar
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
                    <div className="space-y-3">
                      {post.content.text && (
                        <p className="text-foreground leading-relaxed">{post.content.text}</p>
                      )}
                      
                      {post.content.imageUrl && (
                        <div className="rounded-lg overflow-hidden border border-border">
                          <img 
                            src={post.content.imageUrl} 
                            alt="Post content"
                            data-ai-hint={post.content.dataAiHint}
                            className="w-full h-auto max-h-96 object-cover"
                          />
                        </div>
                      )}
                      
                      {post.content.pixelCoords && (
                        <Card className="bg-primary/10 border-primary/30">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">
                                Pixel ({post.content.pixelCoords.x}, {post.content.pixelCoords.y})
                              </span>
                              <Button variant="outline" size="sm" className="ml-auto">
                                Ver no Mapa
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {post.content.poll && (
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3">{post.content.poll.question}</h4>
                            <div className="space-y-2">
                              {post.content.poll.options.map((option, index) => {
                                const percentage = (option.votes / post.content.poll!.totalVotes) * 100;
                                return (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{option.text}</span>
                                      <span className="text-muted-foreground">{option.votes} votos</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
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
                          <Bookmark className={cn(
                            "h-4 w-4",
                            post.engagement.isBookmarked && "fill-current"
                          )} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className={cn(
                  "card-hover-glow",
                  event.isFeatured && "border-primary/50 bg-primary/5"
                )}>
                  <CardHeader>
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
                           event.type === 'meetup' ? 'Encontro' : 'Desafio'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
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
                      
                      <Button className="w-full" disabled={!event.isActive}>
                        {event.isActive ? 'Participar' : 'Evento Terminado'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4 text-center">
                  O ranking da comunidade estará disponível em breve.
                </p>
                <Button variant="outline" disabled>
                  Ver Ranking Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
