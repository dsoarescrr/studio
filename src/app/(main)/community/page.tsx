
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
  Users, MessageSquare, Heart, Share2, Bookmark, Flag, ThumbsUp, 
  Image as ImageIcon, Link as LinkIcon, Smile, Send, Calendar, MapPin, 
  TrendingUp, Award, Star, Clock, Filter, Search, Plus, Edit, MoreHorizontal,
  Trash2, Eye, Bell, Settings, Zap, Sparkles, Trophy, Gift, Megaphone, Globe,
  Flame, Target, Crown, Gem, Activity, PieChart, BarChart3, LineChart, RefreshCw,
  Lightbulb, HelpCircle, Info, AlertTriangle, CheckCircle, XCircle, User, UserPlus,
  UserMinus, Lock, Unlock, Tag, Hash, Palette, Camera, Video, Music, FileText, Mic, Compass
} from "lucide-react";
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';
import { Progress } from '@/components/ui/progress';

// Types
interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    level: number;
    isVerified: boolean;
    isPremium: boolean;
  };
  content: string;
  imageUrl?: string;
  dataAiHint?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  location?: string;
  pixelCoordinates?: { x: number; y: number };
  type: 'text' | 'image' | 'pixel' | 'achievement' | 'event' | 'poll';
  achievementData?: {
    name: string;
    icon: React.ReactNode;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  };
  eventData?: {
    title: string;
    date: Date;
    location: string;
    participants: number;
  };
  pollData?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    endsAt: Date;
  };
  commentList?: Comment[];
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    level: number;
    isVerified: boolean;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  dataAiHint?: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
  };
  participants: number;
  isParticipating: boolean;
  tags: string[];
  type: 'online' | 'in-person' | 'hybrid';
}

interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  dataAiHint?: string;
  memberCount: number;
  isJoined: boolean;
  tags: string[];
  privacy: 'public' | 'private' | 'invite-only';
  activity: 'high' | 'medium' | 'low';
  createdAt: Date;
}

// Mock Data
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'PixelMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 25,
      isVerified: true,
      isPremium: true
    },
    content: 'Acabei de adquirir este incrível pixel no centro de Lisboa! A vista para o Tejo é espetacular. Quem mais tem pixels nesta zona?',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'pixel image',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 42,
    comments: 8,
    shares: 5,
    bookmarks: 12,
    isLiked: false,
    isBookmarked: false,
    tags: ['Lisboa', 'PixelArt', 'Tejo'],
    location: 'Lisboa, Portugal',
    pixelCoordinates: { x: 245, y: 156 },
    type: 'pixel',
    commentList: [
      {
        id: 'comment1',
        author: {
          id: 'user2',
          name: 'ArtLover',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          level: 18,
          isVerified: false
        },
        content: 'Incrível localização! Eu tenho um pixel a apenas 3 quadrados de distância. Temos que organizar um evento por lá!',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 5,
        isLiked: true
      },
      {
        id: 'comment2',
        author: {
          id: 'user3',
          name: 'DigitalNomad',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          level: 12,
          isVerified: false
        },
        content: 'Quanto pagaste por esse pixel? Estou pensando em investir nessa região também!',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    author: {
      id: 'user4',
      name: 'AchievementHunter',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 30,
      isVerified: true,
      isPremium: false
    },
    content: 'Finalmente desbloqueei a conquista "Mestre das Cores"! Foram semanas usando diferentes combinações de cores nos meus pixels.',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 78,
    comments: 15,
    shares: 8,
    bookmarks: 5,
    isLiked: true,
    isBookmarked: false,
    tags: ['Conquistas', 'MestreDasCores'],
    type: 'achievement',
    achievementData: {
      name: 'Mestre das Cores',
      icon: <Palette className="h-6 w-6" />,
      rarity: 'epic'
    }
  },
  {
    id: '3',
    author: {
      id: 'user5',
      name: 'EventOrganizer',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 22,
      isVerified: true,
      isPremium: true
    },
    content: 'Estamos organizando o primeiro encontro presencial de membros do Pixel Universe em Lisboa! Venha conhecer outros entusiastas e trocar experiências sobre o universo dos pixels.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 120,
    comments: 32,
    shares: 45,
    bookmarks: 67,
    isLiked: false,
    isBookmarked: true,
    tags: ['Evento', 'Encontro', 'Lisboa'],
    location: 'Lisboa, Portugal',
    type: 'event',
    eventData: {
      title: 'Encontro Pixel Universe Lisboa',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Parque das Nações, Lisboa',
      participants: 48
    }
  },
  {
    id: '4',
    author: {
      id: 'user6',
      name: 'PixelPollster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 15,
      isVerified: false,
      isPremium: false
    },
    content: 'Qual região de Portugal você acha que tem os pixels mais valiosos atualmente?',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    likes: 35,
    comments: 12,
    shares: 3,
    bookmarks: 2,
    isLiked: false,
    isBookmarked: false,
    tags: ['Enquete', 'Investimento', 'Regiões'],
    type: 'poll',
    pollData: {
      question: 'Qual região tem os pixels mais valiosos?',
      options: [
        { text: 'Lisboa', votes: 156 },
        { text: 'Porto', votes: 98 },
        { text: 'Algarve', votes: 142 },
        { text: 'Madeira', votes: 87 },
        { text: 'Outra', votes: 23 }
      ],
      totalVotes: 506,
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '5',
    author: {
      id: 'user7',
      name: 'CreativeArtist',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 28,
      isVerified: true,
      isPremium: true
    },
    content: 'Acabei de terminar meu projeto de pixel art representando o Mosteiro dos Jerónimos! Levou 3 semanas para comprar e colorir todos os pixels necessários.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'pixel art image',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    likes: 215,
    comments: 47,
    shares: 89,
    bookmarks: 112,
    isLiked: true,
    isBookmarked: true,
    tags: ['PixelArt', 'Jerónimos', 'Arte', 'Projeto'],
    location: 'Lisboa, Portugal',
    type: 'image'
  }
];

const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Pixel Universe Summit 2025',
    description: 'A maior conferência de pixel art e colecionismo digital de Portugal. Palestras, workshops e networking com os maiores especialistas do setor.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: 'Centro de Congressos de Lisboa',
    imageUrl: 'https://placehold.co/600x300.png',
    dataAiHint: 'event banner',
    organizer: {
      id: 'org1',
      name: 'Pixel Universe Team',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'organizer avatar'
    },
    participants: 342,
    isParticipating: false,
    tags: ['Conferência', 'Networking', 'Workshops'],
    type: 'in-person'
  },
  {
    id: 'event2',
    title: 'Workshop: Criando Valor com Pixels',
    description: 'Aprenda estratégias avançadas para maximizar o valor dos seus pixels e criar coleções temáticas de alto impacto.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: 'Online (Zoom)',
    organizer: {
      id: 'org2',
      name: 'PixelInvestor',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'organizer avatar'
    },
    participants: 156,
    isParticipating: true,
    tags: ['Workshop', 'Investimento', 'Estratégia'],
    type: 'online'
  },
  {
    id: 'event3',
    title: 'Encontro Regional: Porto Pixel',
    description: 'Encontro presencial dos entusiastas de Pixel Universe na região do Porto. Traga seu laptop para sessões colaborativas!',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    location: 'Café Majestic, Porto',
    imageUrl: 'https://placehold.co/600x300.png',
    dataAiHint: 'event location',
    organizer: {
      id: 'org3',
      name: 'PortoPixelGroup',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'organizer avatar'
    },
    participants: 28,
    isParticipating: false,
    tags: ['Encontro', 'Porto', 'Networking'],
    type: 'in-person'
  },
  {
    id: 'event4',
    title: 'Competição: Pixel Art Challenge',
    description: 'Mostre seu talento nesta competição mensal de pixel art. Tema deste mês: "Tradições Portuguesas".',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Online',
    organizer: {
      id: 'org4',
      name: 'ArtistGuild',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'organizer avatar'
    },
    participants: 89,
    isParticipating: true,
    tags: ['Competição', 'Arte', 'Prêmios'],
    type: 'online'
  }
];

const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'Pixel Collectors Portugal',
    description: 'Grupo oficial para colecionadores de pixels em Portugal. Compartilhe suas coleções, dicas de investimento e participe de eventos exclusivos.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'group logo',
    memberCount: 1245,
    isJoined: true,
    tags: ['Colecionadores', 'Investimento', 'Portugal'],
    privacy: 'public',
    activity: 'high',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'group2',
    name: 'Pixel Artists Guild',
    description: 'Comunidade de artistas digitais especializados em pixel art. Compartilhe seu trabalho, receba feedback e aprenda novas técnicas.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'group logo',
    memberCount: 876,
    isJoined: false,
    tags: ['Arte', 'Criatividade', 'Tutoriais'],
    privacy: 'public',
    activity: 'high',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'group3',
    name: 'Lisboa Pixel Community',
    description: 'Grupo regional para entusiastas de pixels em Lisboa e arredores. Organizamos encontros mensais e projetos colaborativos.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'group logo',
    memberCount: 342,
    isJoined: true,
    tags: ['Lisboa', 'Encontros', 'Regional'],
    privacy: 'public',
    activity: 'medium',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'group4',
    name: 'Pixel Investors Club',
    description: 'Grupo exclusivo para investidores sérios no mercado de pixels. Análises de mercado, oportunidades premium e networking de alto nível.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'group logo',
    memberCount: 156,
    isJoined: false,
    tags: ['Investimento', 'Premium', 'Análise'],
    privacy: 'invite-only',
    activity: 'medium',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'group5',
    name: 'Pixel Universe Beginners',
    description: 'Grupo de apoio para novos usuários do Pixel Universe. Tire dúvidas, aprenda o básico e faça suas primeiras aquisições com confiança.',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'group logo',
    memberCount: 523,
    isJoined: false,
    tags: ['Iniciantes', 'Tutoriais', 'Suporte'],
    privacy: 'public',
    activity: 'high',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  }
];

const trendingTopics = [
  { tag: 'PixelArt', posts: 1245 },
  { tag: 'Lisboa', posts: 876 },
  { tag: 'Investimento', posts: 654 },
  { tag: 'Algarve', posts: 543 },
  { tag: 'PixelChallenge', posts: 432 }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [playHoverSound, setPlayHoverSound] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addCredits, addXp } = useUserStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        id: 'currentUser',
        name: 'PixelMasterPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        level: 8,
        isVerified: true,
        isPremium: true
      },
      content: newPostContent,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      isLiked: false,
      isBookmarked: false,
      tags: extractHashtags(newPostContent),
      type: 'text'
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    
    // Reward user for engagement
    addCredits(5);
    addXp(10);
    
    setPlaySuccessSound(true);
    
    toast({
      title: "Publicação Criada",
      description: "A sua publicação foi criada com sucesso!",
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked;
        return {
          ...post,
          likes: newIsLiked ? post.likes + 1 : post.likes - 1,
          isLiked: newIsLiked
        };
      }
      return post;
    }));
    
    // Small reward for engagement
    if (Math.random() > 0.7) {
      addCredits(1);
      addXp(2);
    }
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsBookmarked = !post.isBookmarked;
        return {
          ...post,
          bookmarks: newIsBookmarked ? post.bookmarks + 1 : post.bookmarks - 1,
          isBookmarked: newIsBookmarked
        };
      }
      return post;
    }));
    
    toast({
      title: "Publicação Guardada",
      description: "Adicionada aos seus favoritos.",
    });
  };

  const handleSharePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          shares: post.shares + 1
        };
      }
      return post;
    }));
    
    toast({
      title: "Publicação Partilhada",
      description: "Link copiado para a área de transferência.",
    });
    
    // Reward for sharing
    addCredits(3);
    addXp(5);
  };

  const handleCommentSubmit = () => {
    if (!selectedPost || !newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        id: 'currentUser',
        name: 'PixelMasterPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        level: 8,
        isVerified: true
      },
      content: newComment,
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    };
    
    setPosts(prev => prev.map(post => {
      if (post.id === selectedPost.id) {
        const updatedCommentList = [...(post.commentList || []), newCommentObj];
        return {
          ...post,
          comments: post.comments + 1,
          commentList: updatedCommentList
        };
      }
      return post;
    }));
    
    setNewComment('');
    
    // Update selected post
    setSelectedPost(prev => {
      if (!prev) return null;
      const updatedCommentList = [...(prev.commentList || []), newCommentObj];
      return {
        ...prev,
        comments: prev.comments + 1,
        commentList: updatedCommentList
      };
    });
    
    // Reward for engagement
    addCredits(2);
    addXp(5);
    
    toast({
      title: "Comentário Adicionado",
      description: "O seu comentário foi publicado com sucesso.",
    });
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newIsJoined = !group.isJoined;
        return {
          ...group,
          memberCount: newIsJoined ? group.memberCount + 1 : group.memberCount - 1,
          isJoined: newIsJoined
        };
      }
      return group;
    }));
    
    setPlaySuccessSound(true);
    setShowConfetti(true);
    
    toast({
      title: "Grupo Adicionado",
      description: "Você agora é membro deste grupo!",
    });
    
    // Reward for joining
    addCredits(10);
    addXp(20);
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const newIsParticipating = !event.isParticipating;
        return {
          ...event,
          participants: newIsParticipating ? event.participants + 1 : event.participants - 1,
          isParticipating: newIsParticipating
        };
      }
      return event;
    }));
    
    setPlaySuccessSound(true);
    
    toast({
      title: "Evento Adicionado",
      description: "Você confirmou participação neste evento!",
    });
    
    // Reward for participation
    addCredits(15);
    addXp(25);
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.type === 'poll' && post.pollData) {
        const updatedOptions = [...post.pollData.options];
        updatedOptions[optionIndex].votes += 1;
        
        return {
          ...post,
          pollData: {
            ...post.pollData,
            options: updatedOptions,
            totalVotes: post.pollData.totalVotes + 1
          }
        };
      }
      return post;
    }));
    
    toast({
      title: "Voto Registrado",
      description: "Obrigado por participar da enquete!",
    });
    
    // Small reward for participation
    addCredits(2);
    addXp(5);
  };

  // Utility function to extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  // Format date to relative time, only on client
  const formatRelativeTime = (date: Date): string => {
    if (!isClient) return '...';
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

  // Format date for events, only on client
  const formatEventDate = (date: Date): string => {
    if (!isClient) return '...';
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                  <Users className="h-8 w-8 mr-3 animate-glow" />
                  Comunidade Pixel Universe
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Conecte-se com outros entusiastas, compartilhe suas criações e participe de eventos exclusivos
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="button-hover-lift"
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 button-hover-lift"
                  onMouseEnter={() => setPlayHoverSound(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-4 border-primary/30">
                    <AvatarImage src="https://placehold.co/80x80.png" alt="PixelMasterPT" data-ai-hint="user avatar" />
                    <AvatarFallback>PM</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-semibold text-lg">PixelMasterPT</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">Nível 8</Badge>
                    {true && <Crown className="h-4 w-4 text-amber-400" />}
                    {true && <Star className="h-4 w-4 text-blue-400 ml-1" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Colecionador de pixels raros e entusiasta de arte digital</p>
                  
                  <div className="grid grid-cols-3 gap-2 w-full mt-4">
                    <div className="text-center">
                      <p className="font-semibold">42</p>
                      <p className="text-xs text-muted-foreground">Pixels</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">156</p>
                      <p className="text-xs text-muted-foreground">Seguidores</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">89</p>
                      <p className="text-xs text-muted-foreground">Seguindo</p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* My Groups */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Meus Grupos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {groups.filter(group => group.isJoined).slice(0, 3).map(group => (
                    <div key={group.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                      {group.imageUrl ? (
                        <img 
                          src={group.imageUrl} 
                          alt={group.name} 
                          className="w-10 h-10 rounded-lg object-cover"
                          data-ai-hint={group.dataAiHint}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.memberCount} membros</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        group.activity === 'high' ? "text-green-500" : 
                        group.activity === 'medium' ? "text-amber-500" : 
                        "text-blue-500"
                      )}>
                        {group.activity === 'high' ? "Ativo" : 
                         group.activity === 'medium' ? "Médio" : 
                         "Baixo"}
                      </Badge>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Ver Todos os Grupos
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Upcoming Events */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {events.filter(event => new Date(event.date) > new Date()).slice(0, 2).map(event => (
                    <div key={event.id} className="p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-xs">
                          {event.participants} participantes
                        </Badge>
                        <Button 
                          variant={event.isParticipating ? "outline" : "default"} 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => handleJoinEvent(event.id)}
                        >
                          {event.isParticipating ? "Confirmado" : "Participar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Todos os Eventos
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Trending Topics */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Tópicos em Alta
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">#{topic.tag}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {topic.posts} posts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-12 bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="feed" className="font-headline">
                  <Activity className="h-4 w-4 mr-2"/>
                  Feed
                </TabsTrigger>
                <TabsTrigger value="groups" className="font-headline">
                  <Users className="h-4 w-4 mr-2"/>
                  Grupos
                </TabsTrigger>
                <TabsTrigger value="events" className="font-headline">
                  <Calendar className="h-4 w-4 mr-2"/>
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="discover" className="font-headline">
                  <Compass className="h-4 w-4 mr-2"/>
                  Descobrir
                </TabsTrigger>
              </TabsList>
              
              {/* Feed Tab */}
              <TabsContent value="feed" className="space-y-6 mt-6">
                {/* Create Post */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="PixelMasterPT" data-ai-hint="user avatar" />
                        <AvatarFallback>PM</AvatarFallback>
                      </Avatar>
                      <Textarea 
                        placeholder="O que está a acontecer no seu universo de pixels?" 
                        className="flex-1 resize-none"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Imagem
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          Localização
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Smile className="h-4 w-4 mr-2" />
                          Emoji
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={handlePostSubmit}
                        disabled={!newPostContent.trim()}
                        className="button-hover-lift"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Posts */}
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-md">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted/70"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-muted/70 rounded w-1/3"></div>
                              <div className="h-3 bg-muted/70 rounded w-1/4"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted/70 rounded w-full"></div>
                            <div className="h-4 bg-muted/70 rounded w-full"></div>
                            <div className="h-4 bg-muted/70 rounded w-2/3"></div>
                          </div>
                          <div className="h-40 bg-muted/70 rounded"></div>
                          <div className="flex justify-between">
                            <div className="h-8 bg-muted/70 rounded w-1/4"></div>
                            <div className="h-8 bg-muted/70 rounded w-1/4"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <Card 
                        key={post.id} 
                        className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <CardContent className="p-6 space-y-4">
                          {/* Post Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage 
                                  src={post.author.avatar} 
                                  alt={post.author.name}
                                  data-ai-hint={post.author.dataAiHint}
                                />
                                <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  <h4 className="font-medium">{post.author.name}</h4>
                                  {post.author.isVerified && (
                                    <Star className="h-4 w-4 text-blue-500 fill-current" />
                                  )}
                                  {post.author.isPremium && (
                                    <Crown className="h-4 w-4 text-amber-400" />
                                  )}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span>Nível {post.author.level}</span>
                                  <span className="mx-1">•</span>
                                  <span>{formatRelativeTime(post.createdAt)}</span>
                                  {post.location && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <MapPin className="h-3 w-3 mr-1" />
                                      <span>{post.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Post Content */}
                          <div>
                            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                            
                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Achievement Card */}
                          {post.type === 'achievement' && post.achievementData && (
                            <Card className={cn(
                              "border-2 p-4 flex items-center gap-4",
                              post.achievementData.rarity === 'common' ? "border-slate-400/60 bg-slate-500/10" :
                              post.achievementData.rarity === 'uncommon' ? "border-green-500/60 bg-green-500/10" :
                              post.achievementData.rarity === 'rare' ? "border-blue-500/60 bg-blue-500/10" :
                              post.achievementData.rarity === 'epic' ? "border-purple-500/60 bg-purple-500/10" :
                              "border-amber-400/60 bg-amber-500/10"
                            )}>
                              <div className={cn(
                                "p-3 rounded-xl",
                                post.achievementData.rarity === 'common' ? "bg-slate-500/20 text-slate-400" :
                                post.achievementData.rarity === 'uncommon' ? "bg-green-500/20 text-green-400" :
                                post.achievementData.rarity === 'rare' ? "bg-blue-500/20 text-blue-400" :
                                post.achievementData.rarity === 'epic' ? "bg-purple-500/20 text-purple-400" :
                                "bg-amber-500/20 text-amber-400"
                              )}>
                                {post.achievementData.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold">{post.achievementData.name}</h4>
                                <p className="text-xs text-muted-foreground">Conquista Desbloqueada</p>
                                <Badge className={cn(
                                  "mt-1 text-xs",
                                  post.achievementData.rarity === 'common' ? "bg-slate-500" :
                                  post.achievementData.rarity === 'uncommon' ? "bg-green-500" :
                                  post.achievementData.rarity === 'rare' ? "bg-blue-500" :
                                  post.achievementData.rarity === 'epic' ? "bg-purple-500" :
                                  "bg-amber-500"
                                )}>
                                  {post.achievementData.rarity === 'common' ? "Comum" :
                                   post.achievementData.rarity === 'uncommon' ? "Incomum" :
                                   post.achievementData.rarity === 'rare' ? "Rara" :
                                   post.achievementData.rarity === 'epic' ? "Épica" :
                                   "Lendária"}
                                </Badge>
                              </div>
                            </Card>
                          )}
                          
                          {/* Event Card */}
                          {post.type === 'event' && post.eventData && (
                            <Card className="border p-4">
                              <h4 className="font-semibold flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-primary" />
                                {post.eventData.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatEventDate(post.eventData.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{post.eventData.location}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {post.eventData.participants} participantes
                                </Badge>
                                <Button size="sm" className="text-xs h-8">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Participar
                                </Button>
                              </div>
                            </Card>
                          )}
                          
                          {/* Poll */}
                          {post.type === 'poll' && post.pollData && (
                            <Card className="border p-4">
                              <h4 className="font-semibold">{post.pollData.question}</h4>
                              <div className="space-y-2 mt-3">
                                {post.pollData.options.map((option, index) => {
                                  const percentage = Math.round((option.votes / post.pollData.totalVotes) * 100) || 0;
                                  return (
                                    <div key={index} className="space-y-1">
                                      <div 
                                        className="p-2 border rounded-md flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => handleVotePoll(post.id, index)}
                                      >
                                        <span>{option.text}</span>
                                        <span className="text-sm font-medium">{percentage}%</span>
                                      </div>
                                      <Progress value={percentage} className="h-1" />
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <span>{post.pollData.totalVotes} votos</span>
                                <span>Termina em {formatRelativeTime(post.pollData.endsAt)}</span>
                              </div>
                            </Card>
                          )}
                          
                          {/* Image */}
                          {post.imageUrl && (
                            <div className="relative rounded-lg overflow-hidden">
                              <img 
                                src={post.imageUrl} 
                                alt="Post content" 
                                className="w-full object-cover rounded-lg"
                                data-ai-hint={post.dataAiHint}
                              />
                              {post.pixelCoordinates && (
                                <Badge className="absolute bottom-2 right-2 bg-background/80 text-foreground backdrop-blur-sm">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  ({post.pixelCoordinates.x}, {post.pixelCoordinates.y})
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Post Stats */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {post.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                                {post.shares}
                              </span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-4 w-4" />
                              {post.bookmarks}
                            </span>
                          </div>
                          
                          <Separator />
                          
                          {/* Post Actions */}
                          <div className="flex items-center justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "flex-1",
                                post.isLiked && "text-red-500"
                              )}
                              onClick={() => handleLikePost(post.id)}
                              onMouseEnter={() => setPlayHoverSound(true)}
                            >
                              <Heart className={cn(
                                "h-4 w-4 mr-2",
                                post.isLiked && "fill-current"
                              )} />
                              Curtir
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowPostDetail(true);
                              }}
                              onMouseEnter={() => setPlayHoverSound(true)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comentar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleSharePost(post.id)}
                              onMouseEnter={() => setPlayHoverSound(true)}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Partilhar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "flex-1",
                                post.isBookmarked && "text-primary"
                              )}
                              onClick={() => handleBookmarkPost(post.id)}
                              onMouseEnter={() => setPlayHoverSound(true)}
                            >
                              <Bookmark className={cn(
                                "h-4 w-4 mr-2",
                                post.isBookmarked && "fill-current"
                              )} />
                              Guardar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Groups Tab */}
              <TabsContent value="groups" className="space-y-6 mt-6">
                {/* Search and Filter */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar grupos..."
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
                            <SelectItem value="all">Todos os Grupos</SelectItem>
                            <SelectItem value="joined">Meus Grupos</SelectItem>
                            <SelectItem value="public">Públicos</SelectItem>
                            <SelectItem value="private">Privados</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" className="hidden sm:flex">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Grupo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map(group => (
                    <Card 
                      key={group.id} 
                      className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {group.imageUrl ? (
                            <img 
                              src={group.imageUrl} 
                              alt={group.name} 
                              className="w-16 h-16 rounded-lg object-cover"
                              data-ai-hint={group.dataAiHint}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">{group.name}</h3>
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                group.privacy === 'public' ? "text-green-500" :
                                group.privacy === 'private' ? "text-blue-500" :
                                "text-amber-500"
                              )}>
                                {group.privacy === 'public' ? "Público" :
                                 group.privacy === 'private' ? "Privado" :
                                 "Convite"}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {group.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{group.memberCount} membros</span>
                                <span>•</span>
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  group.activity === 'high' ? "text-green-500" : 
                                  group.activity === 'medium' ? "text-amber-500" : 
                                  "text-blue-500"
                                )}>
                                  {group.activity === 'high' ? "Muito ativo" : 
                                   group.activity === 'medium' ? "Ativo" : 
                                   "Pouco ativo"}
                                </Badge>
                              </div>
                              
                              <Button 
                                variant={group.isJoined ? "outline" : "default"} 
                                size="sm" 
                                className="text-xs h-8"
                                onClick={() => handleJoinGroup(group.id)}
                              >
                                {group.isJoined ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Membro
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Juntar-se
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Carregar Mais Grupos
                </Button>
              </TabsContent>
              
              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6 mt-6">
                {/* Search and Filter */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar eventos..."
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
                            <SelectItem value="all">Todos os Eventos</SelectItem>
                            <SelectItem value="participating">Confirmados</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="in-person">Presenciais</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" className="hidden sm:flex">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Evento
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Events List */}
                <div className="space-y-4">
                  {events.map(event => (
                    <Card 
                      key={event.id} 
                      className="bg-card/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {event.imageUrl && (
                          <div className="md:w-1/3">
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="w-full h-full object-cover md:h-48"
                              data-ai-hint={event.dataAiHint}
                            />
                          </div>
                        )}
                        
                        <div className={cn(
                          "p-6 flex-1",
                          !event.imageUrl && "md:w-full"
                        )}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatEventDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Badge variant={event.type === 'online' ? "outline" : "default"} className="text-xs">
                              {event.type === 'online' ? "Online" : 
                               event.type === 'in-person' ? "Presencial" : 
                               "Híbrido"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage 
                                src={event.organizer.avatar} 
                                alt={event.organizer.name}
                                data-ai-hint={event.organizer.dataAiHint}
                              />
                              <AvatarFallback>{event.organizer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">Organizado por <span className="font-medium">{event.organizer.name}</span></span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {event.participants} participantes
                              </Badge>
                              {event.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button 
                              variant={event.isParticipating ? "outline" : "default"} 
                              size="sm"
                              onClick={() => handleJoinEvent(event.id)}
                              className="button-hover-lift"
                            >
                              {event.isParticipating ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirmado
                                </>
                              ) : (
                                <>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Participar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Carregar Mais Eventos
                </Button>
              </TabsContent>
              
              {/* Discover Tab */}
              <TabsContent value="discover" className="space-y-6 mt-6">
                {/* Featured Content */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                      Conteúdo em Destaque
                    </CardTitle>
                    <CardDescription>
                      Descubra o melhor da comunidade Pixel Universe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-lg bg-muted/50 mb-3 overflow-hidden">
                            <img 
                              src="https://placehold.co/300x300.png" 
                              alt="Featured content" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold">Projeto Colaborativo: Mapa de Portugal em Pixel Art</h3>
                          <p className="text-xs text-muted-foreground mt-1">Um projeto comunitário para recriar o mapa de Portugal em pixel art detalhada.</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            156 colaboradores
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-lg bg-muted/50 mb-3 overflow-hidden">
                            <img 
                              src="https://placehold.co/300x300.png" 
                              alt="Featured content" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold">Guia: Investindo em Pixels Raros</h3>
                          <p className="text-xs text-muted-foreground mt-1">Aprenda estratégias avançadas para identificar e investir em pixels com alto potencial de valorização.</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            2.3K visualizações
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-card/50 hover:bg-card/70 transition-colors cursor-pointer hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-lg bg-muted/50 mb-3 overflow-hidden">
                            <img 
                              src="https://placehold.co/300x300.png" 
                              alt="Featured content" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold">Entrevista: Conheça o Maior Colecionador de Pixels</h3>
                          <p className="text-xs text-muted-foreground mt-1">Entrevista exclusiva com PixelKing, dono da maior coleção de pixels raros de Portugal.</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Publicado ontem
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Community Challenges */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Trophy className="h-5 w-5 mr-2" />
                      Desafios da Comunidade
                    </CardTitle>
                    <CardDescription>
                      Participe dos desafios e ganhe recompensas exclusivas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card className="border border-primary/30 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/20 text-primary">
                              <Palette className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">Desafio de Pixel Art: Tradições Portuguesas</h3>
                              <p className="text-sm text-muted-foreground mt-1">Crie uma obra de pixel art representando uma tradição portuguesa. Os melhores trabalhos serão destacados e premiados.</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Termina em 5 dias</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Gift className="h-3 w-3 mr-1" />
                                    500 créditos
                                  </Badge>
                                  <Button size="sm" className="text-xs h-8">
                                    Participar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                              <Users className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">Desafio de Recrutamento: Traga Novos Membros</h3>
                              <p className="text-sm text-muted-foreground mt-1">Convide amigos para o Pixel Universe e ganhe recompensas exclusivas para cada novo membro que se juntar através do seu link.</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>124 participantes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Gift className="h-3 w-3 mr-1" />
                                    100 créditos/convite
                                  </Badge>
                                  <Button size="sm" className="text-xs h-8">
                                    Participar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Community Stats */}
                <Card className="bg-card/80 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Estatísticas da Comunidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-muted/20">
                        <CardContent className="p-4 text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-2xl font-bold">12,547</p>
                          <p className="text-xs text-muted-foreground">Membros Ativos</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20">
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-2xl font-bold">45,892</p>
                          <p className="text-xs text-muted-foreground">Publicações</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20">
                        <CardContent className="p-4 text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold">156</p>
                          <p className="text-xs text-muted-foreground">Eventos Ativos</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Post Detail Modal */}
      <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-headline">Detalhes da Publicação</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={selectedPost.author.avatar} 
                        alt={selectedPost.author.name}
                        data-ai-hint={selectedPost.author.dataAiHint}
                      />
                      <AvatarFallback>{selectedPost.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium">{selectedPost.author.name}</h4>
                        {selectedPost.author.isVerified && (
                          <Star className="h-4 w-4 text-blue-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Nível {selectedPost.author.level}</span>
                        <span className="mx-1">•</span>
                        <span>{formatRelativeTime(selectedPost.createdAt)}</span>
                        {selectedPost.location && (
                          <>
                            <span className="mx-1">•</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{selectedPost.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="mb-6">
                    <p className="text-sm whitespace-pre-wrap">{selectedPost.content}</p>
                    
                    {/* Tags */}
                    {selectedPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {selectedPost.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Image */}
                    {selectedPost.imageUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <img 
                          src={selectedPost.imageUrl} 
                          alt="Post content" 
                          className="w-full object-cover rounded-lg"
                          data-ai-hint={selectedPost.dataAiHint}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {selectedPost.likes} curtidas
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {selectedPost.shares} partilhas
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      {selectedPost.bookmarks} guardados
                    </span>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  {/* Post Actions */}
                  <div className="flex items-center justify-between mb-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        selectedPost.isLiked && "text-red-500"
                      )}
                      onClick={() => handleLikePost(selectedPost.id)}
                    >
                      <Heart className={cn(
                        "h-4 w-4 mr-2",
                        selectedPost.isLiked && "fill-current"
                      )} />
                      Curtir
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSharePost(selectedPost.id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Partilhar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        selectedPost.isBookmarked && "text-primary"
                      )}
                      onClick={() => handleBookmarkPost(selectedPost.id)}
                    >
                      <Bookmark className={cn(
                        "h-4 w-4 mr-2",
                        selectedPost.isBookmarked && "fill-current"
                      )} />
                      Guardar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Reportar
                    </Button>
                  </div>
                  
                  {/* Comments Section */}
                  <div>
                    <h3 className="font-semibold mb-4">Comentários ({selectedPost.comments})</h3>
                    
                    {/* Comment List */}
                    <div className="space-y-4 mb-6">
                      {selectedPost.commentList && selectedPost.commentList.length > 0 ? (
                        selectedPost.commentList.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={comment.author.avatar} 
                                alt={comment.author.name}
                                data-ai-hint={comment.author.dataAiHint}
                              />
                              <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted/30 p-3 rounded-lg">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-sm">{comment.author.name}</span>
                                  {comment.author.isVerified && (
                                    <Star className="h-3 w-3 text-blue-500 fill-current" />
                                  )}
                                  <Badge variant="outline" className="text-xs ml-1">Nv.{comment.author.level}</Badge>
                                </div>
                                <p className="text-sm mt-1">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>{formatRelativeTime(comment.createdAt)}</span>
                                <button className="hover:text-foreground transition-colors">
                                  Responder
                                </button>
                                <button 
                                  className={cn(
                                    "flex items-center gap-1 hover:text-foreground transition-colors",
                                    comment.isLiked && "text-red-500"
                                  )}
                                >
                                  <Heart className={cn(
                                    "h-3 w-3",
                                    comment.isLiked && "fill-current"
                                  )} />
                                  <span>{comment.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-muted-foreground">Seja o primeiro a comentar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              {/* Comment Input */}
              <div className="p-4 border-t bg-card/80 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="PixelMasterPT" data-ai-hint="user avatar" />
                    <AvatarFallback>PM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea 
                      placeholder="Escreva um comentário..." 
                      className="resize-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
