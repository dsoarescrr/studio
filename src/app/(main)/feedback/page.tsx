'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import {
  MessageSquare, Send, ThumbsUp, ThumbsDown, Star, Heart, Award, Gift, 
  Zap, Lightbulb, Smile, Frown, Meh, CheckCircle, XCircle, AlertTriangle,
  Info, HelpCircle, Search, Filter, SortAsc, ArrowUp, ArrowDown, Plus,
  Minus, Edit, Trash2, Flag, Share2, Copy, Calendar, Clock, User, Users,
  Settings, Bell, Shield, Lock, Unlock, Eye, EyeOff, Download, Upload,
  RefreshCw, Save, FileText, Mail, Phone, Globe, ExternalLink, ChevronRight,
  ChevronDown, ChevronUp, BarChart3, PieChart, LineChart, TrendingUp, 
  TrendingDown, Activity, Target, Sparkles, Flame, Crown, Gem, Coins
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'suggestion' | 'bug' | 'question' | 'praise';
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  votes: number;
  userVote: 'up' | 'down' | null;
  author: {
    id: string;
    name: string;
    avatar?: string;
    dataAiHint?: string;
    level: number;
    isVerified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comments: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      dataAiHint?: string;
      isStaff: boolean;
    };
    content: string;
    createdAt: Date;
    likes: number;
    userLiked: boolean;
  }[];
  tags: string[];
  attachments?: string[];
  isPublic: boolean;
  isAnonymous: boolean;
  isHighlighted?: boolean;
  staffResponse?: {
    content: string;
    author: string;
    createdAt: Date;
  };
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planned' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCompletion?: Date;
  votes: number;
  tags: string[];
  relatedFeedback?: string[];
}

// Mock data
const feedbackItems: FeedbackItem[] = [
  {
    id: 'f1',
    type: 'suggestion',
    title: 'Adicionar modo noturno para o mapa',
    description: 'Seria ótimo ter um modo noturno para o mapa, com cores mais escuras para uso noturno e redução da fadiga visual.',
    category: 'interface',
    status: 'planned',
    votes: 156,
    userVote: 'up',
    author: {
      id: 'user1',
      name: 'PixelMasterPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 25,
      isVerified: true
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: 'c1',
        author: {
          id: 'user2',
          name: 'ColorWizard',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          isStaff: false
        },
        content: 'Concordo totalmente! Uso muito o site à noite e isso ajudaria muito.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        likes: 12,
        userLiked: true
      },
      {
        id: 'c2',
        author: {
          id: 'staff1',
          name: 'Ana (Equipe)',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          isStaff: true
        },
        content: 'Obrigada pela sugestão! Estamos planejando implementar isso no próximo trimestre.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        likes: 5,
        userLiked: false
      }
    ],
    tags: ['interface', 'acessibilidade', 'mapa'],
    isPublic: true,
    isAnonymous: false,
    isHighlighted: true,
    staffResponse: {
      content: 'Esta funcionalidade está planejada para o próximo trimestre. Agradecemos a sugestão!',
      author: 'Ana (Equipe)',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: 'f2',
    type: 'bug',
    title: 'Erro ao tentar comprar pixels em certas regiões',
    description: 'Quando tento comprar pixels na região do Algarve, recebo um erro "Transação não pode ser completada". Isso acontece consistentemente há dois dias.',
    category: 'compras',
    status: 'in_progress',
    votes: 87,
    userVote: 'up',
    author: {
      id: 'user3',
      name: 'BeachLover',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 18,
      isVerified: false
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: 'c3',
        author: {
          id: 'staff2',
          name: 'Pedro (Suporte)',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          isStaff: true
        },
        content: 'Obrigado por reportar! Identificamos o problema e estamos trabalhando na correção. Deve ser resolvido nas próximas 48 horas.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        likes: 8,
        userLiked: true
      }
    ],
    tags: ['bug', 'compras', 'algarve'],
    isPublic: true,
    isAnonymous: false,
    staffResponse: {
      content: 'Identificamos o problema e estamos trabalhando na correção. Deve ser resolvido nas próximas 48 horas.',
      author: 'Pedro (Suporte)',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: 'f3',
    type: 'suggestion',
    title: 'Adicionar opção de pixels animados',
    description: 'Seria incrível poder adicionar animações simples aos pixels, como brilho, pulsar ou mudar de cor. Isso tornaria o mapa mais dinâmico e interativo.',
    category: 'funcionalidades',
    status: 'under_review',
    votes: 245,
    userVote: null,
    author: {
      id: 'user4',
      name: 'ArtistaPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 32,
      isVerified: true
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: 'c4',
        author: {
          id: 'user5',
          name: 'DesignerPRO',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          isStaff: false
        },
        content: 'Isso seria revolucionário! Imagina poder criar arte pixel realmente interativa.',
        createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        likes: 34,
        userLiked: false
      },
      {
        id: 'c5',
        author: {
          id: 'staff3',
          name: 'Miguel (Produto)',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          isStaff: true
        },
        content: 'Adoramos esta ideia! Estamos avaliando a viabilidade técnica e o impacto no desempenho do mapa. Manteremos vocês atualizados.',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        likes: 22,
        userLiked: true
      }
    ],
    tags: ['animação', 'interatividade', 'personalização'],
    isPublic: true,
    isAnonymous: false,
    isHighlighted: true
  },
  {
    id: 'f4',
    type: 'praise',
    title: 'Excelente sistema de conquistas!',
    description: 'Quero parabenizar a equipe pelo incrível sistema de conquistas. É muito motivador e me faz querer explorar mais a plataforma. As recompensas são generosas e as notificações são bem implementadas.',
    category: 'gamificação',
    status: 'completed',
    votes: 78,
    userVote: 'up',
    author: {
      id: 'user6',
      name: 'GameMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 15,
      isVerified: false
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: 'c6',
        author: {
          id: 'staff4',
          name: 'Sofia (Comunidade)',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          isStaff: true
        },
        content: 'Muito obrigada pelo feedback positivo! Ficamos felizes que esteja gostando do sistema de conquistas. Continuaremos adicionando novas conquistas regularmente.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        likes: 15,
        userLiked: true
      }
    ],
    tags: ['conquistas', 'gamificação', 'elogio'],
    isPublic: true,
    isAnonymous: false
  },
  {
    id: 'f5',
    type: 'question',
    title: 'Como transferir créditos para amigos?',
    description: 'Gostaria de saber se é possível transferir créditos para amigos e, se sim, como fazer isso. Não encontrei esta opção no menu da carteira.',
    category: 'créditos',
    status: 'completed',
    votes: 32,
    userVote: null,
    author: {
      id: 'user7',
      name: 'PixelFriend',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      level: 8,
      isVerified: false
    },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: 'c7',
        author: {
          id: 'staff5',
          name: 'Carlos (Suporte)',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          isStaff: true
        },
        content: 'Olá! Sim, é possível transferir créditos. Na carteira digital, clique no botão "Transferir" no canto superior direito. Você precisará do nome de usuário do destinatário. Há uma taxa de 2% para transferências.',
        createdAt: new Date(Date.now() - 11.5 * 24 * 60 * 60 * 1000),
        likes: 10,
        userLiked: false
      },
      {
        id: 'c8',
        author: {
          id: 'user7',
          name: 'PixelFriend',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          isStaff: false
        },
        content: 'Muito obrigado pela resposta rápida! Consegui encontrar a opção e já fiz a transferência.',
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        likes: 3,
        userLiked: false
      }
    ],
    tags: ['créditos', 'transferência', 'carteira'],
    isPublic: true,
    isAnonymous: false,
    staffResponse: {
      content: 'Sim, é possível transferir créditos. Na carteira digital, clique no botão "Transferir" no canto superior direito. Você precisará do nome de usuário do destinatário. Há uma taxa de 2% para transferências.',
      author: 'Carlos (Suporte)',
      createdAt: new Date(Date.now() - 11.5 * 24 * 60 * 60 * 1000)
    }
  }
];

const roadmapItems: RoadmapItem[] = [
  {
    id: 'r1',
    title: 'Modo Noturno para o Mapa',
    description: 'Implementação de um tema escuro para o mapa, reduzindo a fadiga visual durante o uso noturno.',
    category: 'interface',
    status: 'planned',
    priority: 'medium',
    estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    votes: 156,
    tags: ['interface', 'acessibilidade', 'mapa'],
    relatedFeedback: ['f1']
  },
  {
    id: 'r2',
    title: 'Pixels Animados',
    description: 'Adição de suporte para pixels com animações simples como brilho, pulsar e mudança de cores.',
    category: 'funcionalidades',
    status: 'in_progress',
    priority: 'high',
    estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    votes: 245,
    tags: ['animação', 'interatividade', 'personalização'],
    relatedFeedback: ['f3']
  },
  {
    id: 'r3',
    title: 'Sistema de Clãs/Grupos',
    description: 'Criação de grupos colaborativos para trabalhar em projetos de pixel art em equipe.',
    category: 'colaboração',
    status: 'planned',
    priority: 'high',
    estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    votes: 189,
    tags: ['colaboração', 'social', 'grupos']
  },
  {
    id: 'r4',
    title: 'Editor de Pixel Art Integrado',
    description: 'Ferramentas avançadas de desenho diretamente na plataforma para criar pixel art detalhada.',
    category: 'criação',
    status: 'planned',
    priority: 'medium',
    estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    votes: 210,
    tags: ['editor', 'criação', 'ferramentas']
  },
  {
    id: 'r5',
    title: 'Sistema de Eventos Temporários',
    description: 'Eventos sazonais com pixels especiais, desafios comunitários e recompensas exclusivas.',
    category: 'eventos',
    status: 'in_progress',
    priority: 'medium',
    estimatedCompletion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    votes: 178,
    tags: ['eventos', 'sazonal', 'recompensas']
  },
  {
    id: 'r6',
    title: 'Aplicativo Mobile Nativo',
    description: 'Aplicativo dedicado para iOS e Android com suporte a notificações push e recursos offline.',
    category: 'plataforma',
    status: 'planned',
    priority: 'high',
    estimatedCompletion: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    votes: 267,
    tags: ['mobile', 'app', 'offline']
  },
  {
    id: 'r7',
    title: 'Melhorias no Marketplace',
    description: 'Adição de leilões, ofertas, histórico de preços e análise de mercado avançada.',
    category: 'marketplace',
    status: 'in_progress',
    priority: 'high',
    estimatedCompletion: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    votes: 198,
    tags: ['marketplace', 'economia', 'leilões']
  },
  {
    id: 'r8',
    title: 'Integração com Redes Sociais',
    description: 'Compartilhamento automático de conquistas e compras em redes sociais populares.',
    category: 'social',
    status: 'completed',
    priority: 'medium',
    votes: 145,
    tags: ['social', 'compartilhamento', 'integração']
  }
];

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'comments'>('votes');
  const [newFeedback, setNewFeedback] = useState({
    type: 'suggestion',
    title: '',
    description: '',
    category: 'geral',
    isPublic: true,
    isAnonymous: false,
    tags: ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { addCredits, addXp } = useUserStore();
  const { toast } = useToast();

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesType = activeTab === 'browse' || (
      activeTab === 'suggestions' ? item.type === 'suggestion' :
      activeTab === 'bugs' ? item.type === 'bug' :
      activeTab === 'questions' ? item.type === 'question' :
      activeTab === 'praise' ? item.type === 'praise' : true
    );
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'comments':
        return b.comments.length - a.comments.length;
      default:
        return 0;
    }
  });

  const filteredRoadmap = roadmapItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitFeedback = () => {
    if (newFeedback.title && newFeedback.description) {
      // In a real app, this would send the feedback to the server
      setShowConfetti(true);
      setPlaySuccessSound(true);
      
      // Reward the user for providing feedback
      addCredits(50);
      addXp(25);
      
      toast({
        title: "Feedback Enviado!",
        description: "Obrigado por compartilhar sua opinião. Você recebeu 50 créditos como recompensa!",
      });
      
      // Reset form
      setNewFeedback({
        type: 'suggestion',
        title: '',
        description: '',
        category: 'geral',
        isPublic: true,
        isAnonymous: false,
        tags: ''
      });
      
      // Switch to browse tab to see all feedback
      setActiveTab('browse');
    } else {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha o título e a descrição do feedback.",
        variant: "destructive"
      });
    }
  };

  const handleVote = (feedbackId: string, voteType: 'up' | 'down') => {
    // In a real app, this would send the vote to the server
    setPlaySuccessSound(true);
    
    toast({
      title: voteType === 'up' ? "Voto Positivo Registrado" : "Voto Negativo Registrado",
      description: "Obrigado por votar neste feedback.",
    });
  };

  const handleSubmitComment = () => {
    if (selectedFeedback && commentText) {
      // In a real app, this would send the comment to the server
      setPlaySuccessSound(true);
      
      toast({
        title: "Comentário Enviado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
      
      // Reset form
      setCommentText('');
    }
  };

  const getTypeIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'bug': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'question': return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case 'praise': return <Heart className="h-4 w-4 text-pink-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'suggestion': return 'Sugestão';
      case 'bug': return 'Bug';
      case 'question': return 'Pergunta';
      case 'praise': return 'Elogio';
      default: return type;
    }
  };

  const getStatusColor = (status: FeedbackItem['status'] | RoadmapItem['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-500/10';
      case 'under_review': return 'text-blue-500 bg-blue-500/10';
      case 'planned': return 'text-purple-500 bg-purple-500/10';
      case 'in_progress': return 'text-orange-500 bg-orange-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'declined': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getStatusLabel = (status: FeedbackItem['status'] | RoadmapItem['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'under_review': return 'Em Análise';
      case 'planned': return 'Planejado';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'declined': return 'Recusado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: RoadmapItem['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-blue-500 bg-blue-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getPriorityLabel = (priority: RoadmapItem['priority']) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return priority;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffMinutes}m atrás`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <MessageSquare className="h-8 w-8 mr-3 animate-glow" />
                  Feedback e Sugestões
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Compartilhe suas ideias, reporte problemas e ajude a moldar o futuro do Pixel Universe
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('roadmap')}
                  className="bg-background/50"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Ver Roadmap
                </Button>
                <Button 
                  onClick={() => setActiveTab('submit')}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Feedback
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <Tabs 
                orientation="vertical" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                  <TabsTrigger 
                    value="submit" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    Enviar Feedback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="browse" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Search className="h-4 w-4 mr-3" />
                    Explorar Feedback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="suggestions" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Lightbulb className="h-4 w-4 mr-3 text-yellow-500" />
                    Sugestões
                    <Badge className="ml-auto">{feedbackItems.filter(item => item.type === 'suggestion').length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bugs" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                    Bugs
                    <Badge className="ml-auto">{feedbackItems.filter(item => item.type === 'bug').length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="questions" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <HelpCircle className="h-4 w-4 mr-3 text-blue-500" />
                    Perguntas
                    <Badge className="ml-auto">{feedbackItems.filter(item => item.type === 'question').length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="praise" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Heart className="h-4 w-4 mr-3 text-pink-500" />
                    Elogios
                    <Badge className="ml-auto">{feedbackItems.filter(item => item.type === 'praise').length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="roadmap" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Target className="h-4 w-4 mr-3 text-green-500" />
                    Roadmap
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Filtrar por Status</h3>
                  <div className="space-y-1">
                    <Button 
                      variant={selectedStatus === 'all' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('all')}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Todos os Status
                    </Button>
                    <Button 
                      variant={selectedStatus === 'pending' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('pending')}
                    >
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      Pendente
                    </Button>
                    <Button 
                      variant={selectedStatus === 'under_review' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('under_review')}
                    >
                      <Search className="h-4 w-4 mr-2 text-blue-500" />
                      Em Análise
                    </Button>
                    <Button 
                      variant={selectedStatus === 'planned' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('planned')}
                    >
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      Planejado
                    </Button>
                    <Button 
                      variant={selectedStatus === 'in_progress' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('in_progress')}
                    >
                      <Activity className="h-4 w-4 mr-2 text-orange-500" />
                      Em Progresso
                    </Button>
                    <Button 
                      variant={selectedStatus === 'completed' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus('completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Concluído
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-medium flex items-center mb-2">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    Recompensas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ganhe créditos e XP ao contribuir com feedback valioso!
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Enviar feedback</span>
                      <span className="font-medium text-primary">+50 créditos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reportar bug</span>
                      <span className="font-medium text-primary">+75 créditos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Feedback implementado</span>
                      <span className="font-medium text-primary">+200 créditos</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <ScrollArea className="h-[70vh]">
                <TabsContent value="submit" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Enviar Novo Feedback</h3>
                    
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo de Feedback</Label>
                          <RadioGroup 
                            value={newFeedback.type}
                            onValueChange={(value) => setNewFeedback(prev => ({ ...prev, type: value as FeedbackItem['type'] }))}
                            className="grid grid-cols-2 md:grid-cols-4 gap-2"
                          >
                            <div>
                              <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                              <Label
                                htmlFor="suggestion"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Lightbulb className="h-6 w-6 mb-2 text-yellow-500" />
                                Sugestão
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                              <Label
                                htmlFor="bug"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <AlertTriangle className="h-6 w-6 mb-2 text-red-500" />
                                Bug
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="question" id="question" className="peer sr-only" />
                              <Label
                                htmlFor="question"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <HelpCircle className="h-6 w-6 mb-2 text-blue-500" />
                                Pergunta
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="praise" id="praise" className="peer sr-only" />
                              <Label
                                htmlFor="praise"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Heart className="h-6 w-6 mb-2 text-pink-500" />
                                Elogio
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="feedback-title">Título</Label>
                          <Input 
                            id="feedback-title" 
                            placeholder="Um título claro e conciso para o seu feedback" 
                            value={newFeedback.title}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="feedback-description">Descrição</Label>
                          <Textarea 
                            id="feedback-description" 
                            placeholder="Descreva seu feedback em detalhes. Quanto mais informações, melhor poderemos entender e implementar sua sugestão ou resolver seu problema." 
                            rows={5}
                            value={newFeedback.description}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="feedback-category">Categoria</Label>
                            <Select 
                              value={newFeedback.category}
                              onValueChange={(value) => setNewFeedback(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger id="feedback-category">
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="geral">Geral</SelectItem>
                                <SelectItem value="interface">Interface</SelectItem>
                                <SelectItem value="funcionalidades">Funcionalidades</SelectItem>
                                <SelectItem value="compras">Compras e Vendas</SelectItem>
                                <SelectItem value="créditos">Créditos e Pagamentos</SelectItem>
                                <SelectItem value="personalização">Personalização</SelectItem>
                                <SelectItem value="colaboração">Projetos Colaborativos</SelectItem>
                                <SelectItem value="gamificação">Gamificação</SelectItem>
                                <SelectItem value="marketplace">Marketplace</SelectItem>
                                <SelectItem value="desempenho">Desempenho</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="feedback-tags">Tags (separadas por vírgula)</Label>
                            <Input 
                              id="feedback-tags" 
                              placeholder="Ex: mapa, interface, pixels" 
                              value={newFeedback.tags}
                              onChange={(e) => setNewFeedback(prev => ({ ...prev, tags: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="feedback-attachment">Anexos (opcional)</Label>
                          <Input id="feedback-attachment" type="file" />
                          <p className="text-xs text-muted-foreground">
                            Formatos aceitos: JPG, PNG, GIF, PDF. Tamanho máximo: 5MB.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="feedback-public" 
                              checked={newFeedback.isPublic}
                              onCheckedChange={(checked) => setNewFeedback(prev => ({ ...prev, isPublic: checked }))}
                            />
                            <Label htmlFor="feedback-public">Tornar público</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="feedback-anonymous" 
                              checked={newFeedback.isAnonymous}
                              onCheckedChange={(checked) => setNewFeedback(prev => ({ ...prev, isAnonymous: checked }))}
                            />
                            <Label htmlFor="feedback-anonymous">Enviar anonimamente</Label>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            className="w-full"
                            onClick={handleSubmitFeedback}
                            disabled={!newFeedback.title || !newFeedback.description}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Feedback
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium flex items-center mb-2">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Dicas para um Bom Feedback
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Seja específico e forneça detalhes concretos</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Explique o problema ou sugestão de forma clara</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Se possível, inclua capturas de tela ou exemplos</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Sugira soluções ou alternativas, se aplicável</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value={selectedFeedback ? 'feedback-detail' : 'browse'} className="space-y-6 mt-0">
                  {selectedFeedback ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          {getTypeIcon(selectedFeedback.type)}
                          <span className="ml-2">{selectedFeedback.title}</span>
                        </h3>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedFeedback(null)}
                        >
                          Voltar
                        </Button>
                      </div>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {selectedFeedback.author.avatar ? (
                                  <AvatarImage 
                                    src={selectedFeedback.author.avatar} 
                                    alt={selectedFeedback.author.name}
                                    data-ai-hint={selectedFeedback.author.dataAiHint}
                                  />
                                ) : null}
                                <AvatarFallback>{selectedFeedback.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{selectedFeedback.isAnonymous ? 'Anônimo' : selectedFeedback.author.name}</p>
                                  {!selectedFeedback.isAnonymous && selectedFeedback.author.isVerified && (
                                    <Star className="h-4 w-4 text-blue-500 fill-current" />
                                  )}
                                </div>
                                {!selectedFeedback.isAnonymous && (
                                  <p className="text-xs text-muted-foreground">Nível {selectedFeedback.author.level}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getStatusColor(selectedFeedback.status))}>
                                {getStatusLabel(selectedFeedback.status)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(selectedFeedback.type)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-muted/20 rounded-lg mb-4">
                            <p className="text-muted-foreground whitespace-pre-line">
                              {selectedFeedback.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {selectedFeedback.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(selectedFeedback.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {selectedFeedback.comments.length} comentário(s)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant={selectedFeedback.userVote === 'up' ? 'default' : 'ghost'} 
                                  size="sm" 
                                  className="h-7 px-2"
                                  onClick={() => handleVote(selectedFeedback.id, 'up')}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {selectedFeedback.votes}
                                </Button>
                                <Button 
                                  variant={selectedFeedback.userVote === 'down' ? 'default' : 'ghost'} 
                                  size="sm" 
                                  className="h-7 px-2"
                                  onClick={() => handleVote(selectedFeedback.id, 'down')}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {selectedFeedback.staffResponse && (
                            <div className="p-4 bg-primary/10 rounded-lg mb-4 border border-primary/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-4 w-4 text-primary" />
                                <p className="font-medium">Resposta da Equipe</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {selectedFeedback.staffResponse.content}
                              </p>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                <span>{selectedFeedback.staffResponse.author}</span>
                                <span>{formatTimeAgo(selectedFeedback.staffResponse.createdAt)}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <h4 className="font-medium">Comentários ({selectedFeedback.comments.length})</h4>
                            
                            {selectedFeedback.comments.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                Nenhum comentário ainda. Seja o primeiro a comentar!
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {selectedFeedback.comments.map(comment => (
                                  <div 
                                    key={comment.id} 
                                    className={cn(
                                      "p-4 rounded-lg",
                                      comment.author.isStaff ? "bg-primary/10 border border-primary/20" : "bg-muted/20"
                                    )}
                                  >
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-8 w-8">
                                        {comment.author.avatar ? (
                                          <AvatarImage 
                                            src={comment.author.avatar} 
                                            alt={comment.author.name}
                                            data-ai-hint={comment.author.dataAiHint}
                                          />
                                        ) : null}
                                        <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium">{comment.author.name}</p>
                                            {comment.author.isStaff && (
                                              <Badge className="text-xs bg-primary text-primary-foreground">
                                                Equipe
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</p>
                                        </div>
                                        <p className="text-sm mt-1">{comment.content}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Button 
                                            variant={comment.userLiked ? 'default' : 'ghost'} 
                                            size="sm" 
                                            className="h-6 px-2 text-xs"
                                          >
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            {comment.likes}
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 px-2 text-xs"
                                          >
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            Responder
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="space-y-3 pt-3">
                              <Textarea 
                                placeholder="Adicione um comentário..." 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                              />
                              <Button 
                                onClick={handleSubmitComment}
                                disabled={!commentText}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Comentar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {activeTab === 'browse' ? 'Explorar Feedback' :
                           activeTab === 'suggestions' ? 'Sugestões' :
                           activeTab === 'bugs' ? 'Bugs Reportados' :
                           activeTab === 'questions' ? 'Perguntas' :
                           activeTab === 'praise' ? 'Elogios' : 'Feedback'}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Pesquisar..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-60"
                            />
                          </div>
                          
                          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="votes">Mais Votados</SelectItem>
                              <SelectItem value="recent">Mais Recentes</SelectItem>
                              <SelectItem value="comments">Mais Comentados</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {filteredFeedback.length === 0 ? (
                        <Card className="p-8 text-center">
                          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Nenhum feedback encontrado</h3>
                          <p className="text-muted-foreground mb-4">
                            Não encontramos feedback correspondente aos filtros atuais
                          </p>
                          <Button onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setSelectedStatus('all');
                          }}>
                            Limpar Filtros
                          </Button>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {/* Highlighted Feedback */}
                          {activeTab === 'browse' && !searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium flex items-center mb-3">
                                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                                Feedback em Destaque
                              </h4>
                              <div className="space-y-3">
                                {feedbackItems
                                  .filter(item => item.isHighlighted)
                                  .map(item => (
                                    <motion.div whileHover={{ scale: 1.01 }} key={item.id}>
                                      <Card 
                                        className="hover:shadow-lg transition-shadow cursor-pointer border-primary/30 bg-primary/5"
                                        onClick={() => setSelectedFeedback(item)}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                              <div className="mt-1">
                                                {getTypeIcon(item.type)}
                                              </div>
                                              <div>
                                                <h4 className="font-medium">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                  {item.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                  {item.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                      #{tag}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                              <Badge className={cn("text-xs", getStatusColor(item.status))}>
                                                {getStatusLabel(item.status)}
                                              </Badge>
                                              <div className="flex items-center gap-1">
                                                <Button 
                                                  variant={item.userVote === 'up' ? 'default' : 'ghost'} 
                                                  size="sm" 
                                                  className="h-7 px-2"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVote(item.id, 'up');
                                                  }}
                                                >
                                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                                  {item.votes}
                                                </Button>
                                                <Button 
                                                  variant={item.userVote === 'down' ? 'default' : 'ghost'} 
                                                  size="sm" 
                                                  className="h-7 px-2"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVote(item.id, 'down');
                                                  }}
                                                >
                                                  <ThumbsDown className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(item.createdAt)}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {item.comments.length} comentário(s)
                                              </span>
                                            </div>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-7 px-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFeedback(item);
                                              }}
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                              Ver Detalhes
                                            </Button>
                                          </div>
                                          
                                          {item.staffResponse && (
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                              <div className="flex items-start gap-2">
                                                <Crown className="h-4 w-4 text-primary mt-0.5" />
                                                <div>
                                                  <p className="text-xs font-medium">Resposta da Equipe:</p>
                                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {item.staffResponse.content}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {/* All Feedback */}
                          <div className="space-y-3">
                            {filteredFeedback.map(item => (
                              <motion.div whileHover={{ scale: 1.01 }} key={item.id}>
                                <Card 
                                  className={cn(
                                    "hover:shadow-md transition-shadow cursor-pointer",
                                    item.isHighlighted && activeTab !== 'browse' && "border-primary/30 bg-primary/5"
                                  )}
                                  onClick={() => setSelectedFeedback(item)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                          {getTypeIcon(item.type)}
                                        </div>
                                        <div>
                                          <h4 className="font-medium">{item.title}</h4>
                                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {item.description}
                                          </p>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.map(tag => (
                                              <Badge key={tag} variant="secondary" className="text-xs">
                                                #{tag}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-2">
                                        <Badge className={cn("text-xs", getStatusColor(item.status))}>
                                          {getStatusLabel(item.status)}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                          <Button 
                                            variant={item.userVote === 'up' ? 'default' : 'ghost'} 
                                            size="sm" 
                                            className="h-7 px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVote(item.id, 'up');
                                            }}
                                          >
                                            <ThumbsUp className="h-3 w-3 mr-1" />
                                            {item.votes}
                                          </Button>
                                          <Button 
                                            variant={item.userVote === 'down' ? 'default' : 'ghost'} 
                                            size="sm" 
                                            className="h-7 px-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVote(item.id, 'down');
                                            }}
                                          >
                                            <ThumbsDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {formatDate(item.createdAt)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MessageSquare className="h-3 w-3" />
                                          {item.comments.length} comentário(s)
                                        </span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedFeedback(item);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                        Ver Detalhes
                                      </Button>
                                    </div>
                                    
                                    {item.staffResponse && (
                                      <div className="mt-3 pt-3 border-t border-border/50">
                                        <div className="flex items-start gap-2">
                                          <Crown className="h-4 w-4 text-primary mt-0.5" />
                                          <div>
                                            <p className="text-xs font-medium">Resposta da Equipe:</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                              {item.staffResponse.content}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="mt-0">
                  <TabsContent value="browse" className="mt-0" />
                </TabsContent>
                
                <TabsContent value="bugs" className="mt-0">
                  <TabsContent value="browse" className="mt-0" />
                </TabsContent>
                
                <TabsContent value="questions" className="mt-0">
                  <TabsContent value="browse" className="mt-0" />
                </TabsContent>
                
                <TabsContent value="praise" className="mt-0">
                  <TabsContent value="browse" className="mt-0" />
                </TabsContent>
                
                <TabsContent value="roadmap" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Roadmap do Pixel Universe</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Planned */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                            Planejado
                            <Badge className="ml-2 bg-purple-500 text-white">
                              {filteredRoadmap.filter(item => item.status === 'planned').length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                          {filteredRoadmap
                            .filter(item => item.status === 'planned')
                            .map(item => (
                              <motion.div whileHover={{ scale: 1.02 }} key={item.id}>
                                <Card className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                                        {getPriorityLabel(item.priority)}
                                      </Badge>
                                    </div>
                                    
                                    {item.estimatedCompletion && (
                                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Estimado para {formatDate(item.estimatedCompletion)}</span>
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          #{tag}
                                        </Badge>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{item.tags.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs">
                                      <span className="text-muted-foreground">Categoria: {item.category}</span>
                                      <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3 text-primary" />
                                        <span className="font-medium">{item.votes}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                            
                          {filteredRoadmap.filter(item => item.status === 'planned').length === 0 && (
                            <div className="p-4 text-center text-muted-foreground">
                              Nenhum item planejado encontrado
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* In Progress */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-orange-500" />
                            Em Progresso
                            <Badge className="ml-2 bg-orange-500 text-white">
                              {filteredRoadmap.filter(item => item.status === 'in_progress').length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                          {filteredRoadmap
                            .filter(item => item.status === 'in_progress')
                            .map(item => (
                              <motion.div whileHover={{ scale: 1.02 }} key={item.id}>
                                <Card className="hover:shadow-md transition-shadow border-orange-500/30 bg-orange-500/5">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                                        {getPriorityLabel(item.priority)}
                                      </Badge>
                                    </div>
                                    
                                    {item.estimatedCompletion && (
                                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Estimado para {formatDate(item.estimatedCompletion)}</span>
                                      </div>
                                    )}
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          #{tag}
                                        </Badge>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{item.tags.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs">
                                      <span className="text-muted-foreground">Categoria: {item.category}</span>
                                      <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3 text-primary" />
                                        <span className="font-medium">{item.votes}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                            
                          {filteredRoadmap.filter(item => item.status === 'in_progress').length === 0 && (
                            <div className="p-4 text-center text-muted-foreground">
                              Nenhum item em progresso encontrado
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Completed */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Concluído
                            <Badge className="ml-2 bg-green-500 text-white">
                              {filteredRoadmap.filter(item => item.status === 'completed').length}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                          {filteredRoadmap
                            .filter(item => item.status === 'completed')
                            .map(item => (
                              <motion.div whileHover={{ scale: 1.02 }} key={item.id}>
                                <Card className="hover:shadow-md transition-shadow border-green-500/30 bg-green-500/5">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                          {item.description}
                                        </p>
                                      </div>
                                      <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                                        {getPriorityLabel(item.priority)}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {item.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          #{tag}
                                        </Badge>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{item.tags.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs">
                                      <span className="text-muted-foreground">Categoria: {item.category}</span>
                                      <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3 text-primary" />
                                        <span className="font-medium">{item.votes}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                            
                          {filteredRoadmap.filter(item => item.status === 'completed').length === 0 && (
                            <div className="p-4 text-center text-muted-foreground">
                              Nenhum item concluído encontrado
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium flex items-center mb-3">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Sobre o Roadmap
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Este roadmap mostra os recursos e melhorias planejados para o Pixel Universe. Ele é atualizado regularmente com base no feedback da comunidade e nas prioridades de desenvolvimento.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-purple-500 text-white">Planejado</Badge>
                          <span className="text-muted-foreground">Recursos aprovados e agendados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-orange-500 text-white">Em Progresso</Badge>
                          <span className="text-muted-foreground">Atualmente em desenvolvimento</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-green-500 text-white">Concluído</Badge>
                          <span className="text-muted-foreground">Implementado e disponível</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Community Stats */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Estatísticas da Comunidade
            </CardTitle>
            <CardDescription>
              Veja como a comunidade está contribuindo para melhorar o Pixel Universe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-500">
                  {feedbackItems.filter(item => item.type === 'suggestion').length + 245}
                </p>
                <p className="text-sm text-muted-foreground">Sugestões Enviadas</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">
                  {feedbackItems.filter(item => item.type === 'bug').length + 128}
                </p>
                <p className="text-sm text-muted-foreground">Bugs Reportados</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-500">
                  {roadmapItems.filter(item => item.status === 'completed').length + 32}
                </p>
                <p className="text-sm text-muted-foreground">Recursos Implementados</p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-500">
                  {feedbackItems.reduce((sum, item) => sum + item.comments.length, 0) + 567}
                </p>
                <p className="text-sm text-muted-foreground">Comentários da Comunidade</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Target className="h-4 w-4 mr-2" />
              Ver Roadmap Completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}