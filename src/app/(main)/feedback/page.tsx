'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/store";
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, ThumbsUp, ThumbsDown, Star, Lightbulb, 
  Bug, Zap, Award, Gift, Check, X, AlertTriangle, Info, 
  HelpCircle, Smile, Frown, Meh, Heart, Flag, Clock, Calendar,
  Users, Sparkles, Camera, Upload, Paperclip, Trash2, Save,
  RefreshCw, ArrowRight, ArrowLeft, Plus, Minus, Copy, Share2,
  Bookmark, Edit, Eye, Filter, Search, SortAsc, CheckSquare,
  XSquare, BarChart3, PieChart, LineChart, TrendingUp, Download,
  Printer, Mail, Phone, Globe, MapPin, User, Settings, Bell
} from "lucide-react";

// Types
type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'question' | 'praise' | 'other';
type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
type SatisfactionLevel = 1 | 2 | 3 | 4 | 5;

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  hasVoted: boolean;
  comments: FeedbackComment[];
  attachments?: string[];
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    dataAiHint?: string;
    role: string;
  };
  assignee?: {
    name: string;
    avatar?: string;
    dataAiHint?: string;
    role: string;
  };
}

interface FeedbackComment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    avatar?: string;
    dataAiHint?: string;
    role: string;
    isStaff?: boolean;
  };
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'checkbox';
  options?: string[];
  required: boolean;
}

// Mock Data
const mockFeedbackItems: FeedbackItem[] = [
  {
    id: '1',
    title: 'Melhorar a performance do mapa em dispositivos móveis',
    description: 'O mapa fica lento em smartphones mais antigos. Seria bom ter uma opção de "modo de baixa performance" para dispositivos com menos recursos.',
    category: 'improvement',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    votes: 42,
    hasVoted: true,
    tags: ['performance', 'mobile', 'mapa'],
    comments: [
      {
        id: 'c1',
        content: 'Estamos trabalhando nisso! Já implementamos algumas otimizações e estamos testando um novo modo de renderização para dispositivos de baixo desempenho.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        author: {
          name: 'DevTeam',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          role: 'Desenvolvedor',
          isStaff: true
        }
      },
      {
        id: 'c2',
        content: 'Ótimo! Mal posso esperar para ver as melhorias. Meu smartphone é um pouco antigo e realmente fica lento ao navegar pelo mapa.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        author: {
          name: 'PixelFan123',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          role: 'Utilizador'
        }
      }
    ],
    author: {
      name: 'MobileUser',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      role: 'Utilizador'
    },
    assignee: {
      name: 'DevTeam',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'staff avatar',
      role: 'Desenvolvedor'
    }
  },
  {
    id: '2',
    title: 'Adicionar opção para criar coleções temáticas de pixels',
    description: 'Seria interessante poder criar coleções temáticas onde podemos agrupar pixels relacionados, como "Monumentos Históricos" ou "Praias de Portugal".',
    category: 'feature',
    status: 'open',
    priority: 'low',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    votes: 78,
    hasVoted: false,
    tags: ['coleções', 'organização', 'feature'],
    comments: [
      {
        id: 'c3',
        content: 'Adorei esta ideia! Seria ótimo para organizar meus pixels por temas.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        author: {
          name: 'PixelCollector',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          role: 'Utilizador'
        }
      }
    ],
    author: {
      name: 'OrganizedUser',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      role: 'Utilizador'
    }
  },
  {
    id: '3',
    title: 'Bug: Não consigo comprar pixels em certas regiões',
    description: 'Quando tento comprar pixels na região do Algarve, recebo um erro "Transação falhou". Acontece apenas nessa região específica.',
    category: 'bug',
    status: 'resolved',
    priority: 'high',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    votes: 23,
    hasVoted: false,
    tags: ['bug', 'compra', 'algarve'],
    comments: [
      {
        id: 'c4',
        content: 'Conseguimos reproduzir o problema e identificamos um erro na validação de coordenadas para esta região. Estamos trabalhando na correção.',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        author: {
          name: 'TechSupport',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          role: 'Suporte Técnico',
          isStaff: true
        }
      },
      {
        id: 'c5',
        content: 'O problema foi resolvido na última atualização. Por favor, tente novamente e informe se o problema persistir.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        author: {
          name: 'TechSupport',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'staff avatar',
          role: 'Suporte Técnico',
          isStaff: true
        }
      }
    ],
    author: {
      name: 'AlgarveFan',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar',
      role: 'Utilizador'
    },
    assignee: {
      name: 'TechSupport',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'staff avatar',
      role: 'Suporte Técnico'
    }
  }
];

const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    question: 'Como você avalia sua experiência geral com o Pixel Universe?',
    type: 'rating',
    required: true
  },
  {
    id: 'q2',
    question: 'Quais recursos você mais utiliza?',
    type: 'checkbox',
    options: ['Mapa Interativo', 'Marketplace', 'Personalização de Pixels', 'Projetos Colaborativos', 'Conquistas', 'Comunidade'],
    required: true
  },
  {
    id: 'q3',
    question: 'O que você acha da interface do usuário?',
    type: 'rating',
    required: true
  },
  {
    id: 'q4',
    question: 'Quais recursos você gostaria de ver adicionados?',
    type: 'text',
    required: false
  },
  {
    id: 'q5',
    question: 'Como você descobriu o Pixel Universe?',
    type: 'multiple_choice',
    options: ['Redes Sociais', 'Amigos', 'Pesquisa na Internet', 'Publicidade', 'Outro'],
    required: true
  }
];

// Helper Components
const CategoryIcon = ({ category }: { category: FeedbackCategory }) => {
  switch (category) {
    case 'bug':
      return <Bug className="h-4 w-4 text-red-500" />;
    case 'feature':
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    case 'improvement':
      return <Zap className="h-4 w-4 text-blue-500" />;
    case 'question':
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    case 'praise':
      return <Heart className="h-4 w-4 text-pink-500" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: FeedbackStatus }) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Aberto</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">Em Progresso</Badge>;
    case 'resolved':
      return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Resolvido</Badge>;
    case 'closed':
      return <Badge variant="outline" className="text-gray-500 border-gray-500/50 bg-gray-500/10">Fechado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const PriorityBadge = ({ priority }: { priority: FeedbackPriority }) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Baixa</Badge>;
    case 'medium':
      return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Média</Badge>;
    case 'high':
      return <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10">Alta</Badge>;
    case 'critical':
      return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10">Crítica</Badge>;
    default:
      return <Badge variant="outline">Desconhecida</Badge>;
  }
};

const SatisfactionRating = ({ value, onChange }: { value: SatisfactionLevel | null; onChange: (value: SatisfactionLevel) => void }) => {
  const ratings = [
    { value: 1, icon: <Frown className="h-6 w-6" />, label: 'Muito Insatisfeito' },
    { value: 2, icon: <Meh className="h-6 w-6" />, label: 'Insatisfeito' },
    { value: 3, icon: <Meh className="h-6 w-6" />, label: 'Neutro' },
    { value: 4, icon: <Smile className="h-6 w-6" />, label: 'Satisfeito' },
    { value: 5, icon: <Smile className="h-6 w-6" />, label: 'Muito Satisfeito' }
  ];

  return (
    <div className="flex justify-between items-center">
      {ratings.map((rating) => (
        <Button
          key={rating.value}
          variant="outline"
          className={`flex flex-col items-center p-3 h-auto ${value === rating.value ? 'bg-primary/20 border-primary' : ''}`}
          onClick={() => onChange(rating.value as SatisfactionLevel)}
        >
          <div className={`text-2xl ${value === rating.value ? 'text-primary' : 'text-muted-foreground'}`}>
            {rating.icon}
          </div>
          <span className="text-xs mt-1">{rating.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('improvement');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockFeedbackItems);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'date' | 'status'>('votes');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { toast } = useToast();
  const { addCredits, addXp } = useUserStore();

  // Filter feedback items
  const filteredFeedbackItems = feedbackItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'votes':
        return b.votes - a.votes;
      case 'date':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'status':
        const statusOrder = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  const handleSubmitFeedback = () => {
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha o título e a descrição do feedback.",
        variant: "destructive"
      });
      return;
    }

    // Create new feedback item
    const newFeedback: FeedbackItem = {
      id: Date.now().toString(),
      title: feedbackTitle,
      description: feedbackDescription,
      category: feedbackCategory,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 1,
      hasVoted: true,
      comments: [],
      tags: feedbackDescription.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [],
      author: {
        name: 'Você',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'Utilizador'
      }
    };

    setFeedbackItems(prev => [newFeedback, ...prev]);
    setFeedbackTitle('');
    setFeedbackDescription('');
    setAttachments([]);
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Reward user
    addCredits(25);
    addXp(10);
    
    toast({
      title: "Feedback Enviado",
      description: "Obrigado pelo seu feedback! Recebeu 25 créditos como recompensa.",
    });
  };

  const handleVote = (id: string) => {
    setFeedbackItems(prev => prev.map(item => {
      if (item.id === id) {
        const newVotes = item.hasVoted ? item.votes - 1 : item.votes + 1;
        return { ...item, votes: newVotes, hasVoted: !item.hasVoted };
      }
      return item;
    }));
  };

  const handleAddComment = () => {
    if (!selectedFeedback || !newComment.trim()) return;

    const updatedFeedback = {
      ...selectedFeedback,
      comments: [
        ...selectedFeedback.comments,
        {
          id: Date.now().toString(),
          content: newComment,
          createdAt: new Date(),
          author: {
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar',
            role: 'Utilizador'
          }
        }
      ],
      updatedAt: new Date()
    };

    setFeedbackItems(prev => prev.map(item => 
      item.id === selectedFeedback.id ? updatedFeedback : item
    ));
    setSelectedFeedback(updatedFeedback);
    setNewComment('');
    
    // Reward user
    addCredits(5);
    addXp(2);
    
    toast({
      title: "Comentário Adicionado",
      description: "O seu comentário foi adicionado com sucesso. Recebeu 5 créditos.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...fileArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitSurvey = () => {
    // Check required questions
    const unansweredRequired = surveyQuestions
      .filter(q => q.required)
      .some(q => !surveyAnswers[q.id]);
    
    if (unansweredRequired) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, responda todas as perguntas obrigatórias.",
        variant: "destructive"
      });
      return;
    }
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Reward user
    addCredits(50);
    addXp(25);
    
    toast({
      title: "Pesquisa Enviada",
      description: "Obrigado por participar! Recebeu 50 créditos como recompensa.",
    });
    
    // Reset form
    setSurveyAnswers({});
    setSatisfaction(null);
  };

  const handleSurveyAnswer = (questionId: string, answer: any) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
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
                  Ajude-nos a melhorar o Pixel Universe partilhando as suas ideias, reportando problemas ou respondendo a pesquisas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-12 bg-card/50 backdrop-blur-sm shadow-md">
            <TabsTrigger value="submit" className="font-headline">
              <Send className="h-4 w-4 mr-2"/>
              Enviar Feedback
            </TabsTrigger>
            <TabsTrigger value="browse" className="font-headline">
              <MessageSquare className="h-4 w-4 mr-2"/>
              Feedback da Comunidade
            </TabsTrigger>
            <TabsTrigger value="survey" className="font-headline">
              <ClipboardList className="h-4 w-4 mr-2"/>
              Pesquisas
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="font-headline">
              <Map className="h-4 w-4 mr-2"/>
              Roadmap
            </TabsTrigger>
          </TabsList>

          {/* Submit Feedback Tab */}
          <TabsContent value="submit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feedback Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Send className="h-5 w-5 mr-2 text-primary" />
                    Enviar Novo Feedback
                  </CardTitle>
                  <CardDescription>
                    Partilhe as suas ideias, reporte problemas ou sugira melhorias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-title">Título</Label>
                    <Input 
                      id="feedback-title" 
                      placeholder="Resumo do seu feedback em poucas palavras" 
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feedback-category">Categoria</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <Button
                        variant={feedbackCategory === 'bug' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('bug')}
                      >
                        <Bug className="h-4 w-4 mr-2 text-red-500" />
                        Bug
                      </Button>
                      <Button
                        variant={feedbackCategory === 'feature' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('feature')}
                      >
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        Nova Funcionalidade
                      </Button>
                      <Button
                        variant={feedbackCategory === 'improvement' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('improvement')}
                      >
                        <Zap className="h-4 w-4 mr-2 text-blue-500" />
                        Melhoria
                      </Button>
                      <Button
                        variant={feedbackCategory === 'question' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('question')}
                      >
                        <HelpCircle className="h-4 w-4 mr-2 text-purple-500" />
                        Questão
                      </Button>
                      <Button
                        variant={feedbackCategory === 'praise' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('praise')}
                      >
                        <Heart className="h-4 w-4 mr-2 text-pink-500" />
                        Elogio
                      </Button>
                      <Button
                        variant={feedbackCategory === 'other' ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setFeedbackCategory('other')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        Outro
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feedback-description">Descrição Detalhada</Label>
                    <Textarea 
                      id="feedback-description" 
                      placeholder="Descreva em detalhe o seu feedback, incluindo passos para reproduzir bugs ou exemplos de uso para novas funcionalidades. Use #tags para categorizar (ex: #mapa #mobile)." 
                      rows={8}
                      value={feedbackDescription}
                      onChange={(e) => setFeedbackDescription(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dica: Use #tags no seu texto para categorizar o feedback (ex: #mapa #mobile #desempenho)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feedback-attachments">Anexos (opcional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                      <Input
                        id="feedback-attachments"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Label htmlFor="feedback-attachments" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Arraste ficheiros ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Suporta imagens, vídeos e documentos até 10MB
                        </p>
                      </Label>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <p className="text-sm font-medium">Ficheiros Anexados:</p>
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {(file.size / 1024).toFixed(0)} KB
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="feedback-anonymous" />
                    <Label htmlFor="feedback-anonymous" className="text-sm">
                      Enviar anonimamente (não receberá créditos de recompensa)
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" onClick={() => {
                    setFeedbackTitle('');
                    setFeedbackDescription('');
                    setAttachments([]);
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button onClick={handleSubmitFeedback}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Feedback
                  </Button>
                </CardFooter>
              </Card>

              {/* Tips and Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    Dicas para Feedback Eficaz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Seja Específico
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Forneça detalhes concretos sobre o que está a reportar ou a sugerir.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Inclua Passos para Reproduzir
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Para bugs, liste os passos exatos para reproduzir o problema.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Adicione Capturas de Ecrã
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Imagens ou vídeos ajudam a entender melhor o problema ou sugestão.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Use #Tags
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Inclua #tags na sua descrição para categorizar o feedback.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Gift className="h-4 w-4 mr-2 text-primary" />
                      Recompensas por Feedback
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Enviar Feedback</span>
                        <span className="font-medium text-primary">25 créditos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comentar em Feedback</span>
                        <span className="font-medium text-primary">5 créditos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Feedback Implementado</span>
                        <span className="font-medium text-primary">100 créditos</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participar em Pesquisa</span>
                        <span className="font-medium text-primary">50 créditos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Info className="h-4 w-4 mr-2 text-primary" />
                      Processo de Feedback
                    </h3>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Envio do feedback pela comunidade</li>
                      <li>Revisão pela equipe do Pixel Universe</li>
                      <li>Priorização baseada em votos e viabilidade</li>
                      <li>Implementação das melhorias selecionadas</li>
                      <li>Notificação aos utilizadores que contribuíram</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Browse Feedback Tab */}
          <TabsContent value="browse" className="space-y-6">
            {selectedFeedback ? (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setSelectedFeedback(null)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedFeedback.status} />
                      <PriorityBadge priority={selectedFeedback.priority} />
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4 flex items-center gap-2">
                    <CategoryIcon category={selectedFeedback.category} />
                    {selectedFeedback.title}
                  </CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedFeedback.author.avatar} alt={selectedFeedback.author.name} data-ai-hint={selectedFeedback.author.dataAiHint} />
                        <AvatarFallback>{selectedFeedback.author.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {selectedFeedback.author.name} • {formatDate(selectedFeedback.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedFeedback.hasVoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(selectedFeedback.id)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{selectedFeedback.votes}</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <p className="whitespace-pre-line">{selectedFeedback.description}</p>
                      <div className="flex flex-wrap gap-1 mt-4">
                        {selectedFeedback.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Status Updates */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-primary" />
                        Status do Feedback
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Recebido</p>
                            <p className="text-xs text-muted-foreground">{formatDate(selectedFeedback.createdAt)}</p>
                          </div>
                        </div>
                        
                        {selectedFeedback.status !== 'open' && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Em Análise</p>
                              <p className="text-xs text-muted-foreground">{formatDate(new Date(selectedFeedback.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000))}</p>
                            </div>
                          </div>
                        )}
                        
                        {(selectedFeedback.status === 'in_progress' || selectedFeedback.status === 'resolved' || selectedFeedback.status === 'closed') && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Zap className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Em Desenvolvimento</p>
                              <p className="text-xs text-muted-foreground">{formatDate(new Date(selectedFeedback.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000))}</p>
                            </div>
                          </div>
                        )}
                        
                        {(selectedFeedback.status === 'resolved' || selectedFeedback.status === 'closed') && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Implementado</p>
                              <p className="text-xs text-muted-foreground">{formatDate(selectedFeedback.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Comments */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                        Comentários ({selectedFeedback.comments.length})
                      </h3>
                      
                      {selectedFeedback.comments.length > 0 ? (
                        <div className="space-y-4">
                          {selectedFeedback.comments.map((comment) => (
                            <div key={comment.id} className={`p-4 rounded-lg ${comment.author.isStaff ? 'bg-primary/10 border border-primary/20' : 'bg-muted/20'}`}>
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} data-ai-hint={comment.author.dataAiHint} />
                                  <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{comment.author.name}</span>
                                    {comment.author.isStaff && (
                                      <Badge className="text-xs bg-primary text-primary-foreground">Equipa</Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-muted/20 rounded-lg">
                          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Ainda não há comentários.</p>
                          <p className="text-xs text-muted-foreground mt-1">Seja o primeiro a comentar!</p>
                        </div>
                      )}
                      
                      {/* Add Comment */}
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <Label htmlFor="new-comment">Adicionar Comentário</Label>
                        <Textarea 
                          id="new-comment" 
                          placeholder="Escreva o seu comentário..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Filters */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar feedback..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="resolved">Resolvido</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="feature">Funcionalidade</SelectItem>
                            <SelectItem value="improvement">Melhoria</SelectItem>
                            <SelectItem value="question">Questão</SelectItem>
                            <SelectItem value="praise">Elogio</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Ordenar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="votes">Mais Votados</SelectItem>
                            <SelectItem value="date">Mais Recentes</SelectItem>
                            <SelectItem value="status">Por Status</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback List */}
                <div className="space-y-4">
                  {filteredFeedbackItems.length > 0 ? (
                    filteredFeedbackItems.map((item) => (
                      <motion.div whileHover={{ scale: 1.01 }} key={item.id}>
                        <Card 
                          className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                            item.status === 'resolved' ? 'border-green-500/30 bg-green-500/5' : 
                            item.status === 'in_progress' ? 'border-yellow-500/30 bg-yellow-500/5' : ''
                          }`}
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Button
                                variant={item.hasVoted ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(item.id);
                                }}
                                className="flex flex-col items-center h-auto py-2 px-3"
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-xs mt-1">{item.votes}</span>
                              </Button>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium flex items-center gap-2">
                                      <CategoryIcon category={item.category} />
                                      {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={item.status} />
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(item.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {item.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                      <MessageSquare className="h-3 w-3" />
                                      {item.comments.length}
                                    </Badge>
                                    {item.assignee && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Avatar className="h-6 w-6">
                                              <AvatarImage src={item.assignee.avatar} alt={item.assignee.name} data-ai-hint={item.assignee.dataAiHint} />
                                              <AvatarFallback>{item.assignee.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Atribuído a: {item.assignee.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum feedback encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Tente ajustar os seus filtros ou pesquisar por outros termos
                      </p>
                      <Button onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}>
                        Limpar Filtros
                      </Button>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Survey Tab */}
          <TabsContent value="survey" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  Pesquisa de Satisfação
                </CardTitle>
                <CardDescription>
                  Ajude-nos a melhorar o Pixel Universe respondendo a algumas perguntas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Como você avalia sua experiência geral com o Pixel Universe?</Label>
                  <SatisfactionRating value={satisfaction} onChange={setSatisfaction} />
                </div>
                
                <Separator />
                
                {surveyQuestions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-base flex items-start gap-1">
                      {question.question}
                      {question.required && <span className="text-red-500">*</span>}
                    </Label>
                    
                    {question.type === 'rating' && (
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={surveyAnswers[question.id] === value ? 'default' : 'outline'}
                            className="h-10 w-10"
                            onClick={() => handleSurveyAnswer(question.id, value)}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'text' && (
                      <Textarea
                        placeholder="Sua resposta..."
                        value={surveyAnswers[question.id] || ''}
                        onChange={(e) => handleSurveyAnswer(question.id, e.target.value)}
                      />
                    )}
                    
                    {question.type === 'multiple_choice' && question.options && (
                      <RadioGroup
                        value={surveyAnswers[question.id] || ''}
                        onValueChange={(value) => handleSurveyAnswer(question.id, value)}
                      >
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                    
                    {question.type === 'checkbox' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-${option}`}
                              checked={(surveyAnswers[question.id] || []).includes(option)}
                              onCheckedChange={(checked) => {
                                const currentAnswers = surveyAnswers[question.id] || [];
                                if (checked) {
                                  handleSurveyAnswer(question.id, [...currentAnswers, option]);
                                } else {
                                  handleSurveyAnswer(
                                    question.id,
                                    currentAnswers.filter((item: string) => item !== option)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Button onClick={handleSubmitSurvey} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Respostas
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Ao enviar, você receberá 50 créditos como agradecimento pela sua participação.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Other Available Surveys */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                  Outras Pesquisas Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pesquisa sobre Projetos Colaborativos</h3>
                      <Badge>Nova</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajude-nos a melhorar a experiência de colaboração no Pixel Universe.
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">5 min</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Participar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pesquisa de Usabilidade Mobile</h3>
                      <Badge variant="outline">Recompensa: 75 créditos</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compartilhe sua experiência com a versão mobile do Pixel Universe.
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">8 min</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Participar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors opacity-70">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Pesquisa sobre o Marketplace</h3>
                      <Badge variant="outline" className="text-muted-foreground">Concluída</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você já participou desta pesquisa. Obrigado pela sua contribuição!
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500">Recompensa recebida: 50 créditos</span>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Concluída
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Planned */}
              <Card>
                <CardHeader className="bg-blue-500/10 border-b border-blue-500/20">
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                    Planeado
                    <Badge className="ml-2 bg-blue-500 text-white">8</Badge>
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades aprovadas e em planeamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="p-4 space-y-3">
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Sistema de Leilões para Pixels</h3>
                            <Badge variant="outline" className="text-xs">Q2 2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Implementação de um sistema de leilões para pixels raros e especiais.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">124</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                              Prioridade Média
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Modo Noturno Automático</h3>
                            <Badge variant="outline" className="text-xs">Q1 2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Alternar automaticamente entre modos claro e escuro com base na hora do dia.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">87</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500/50 bg-green-500/10">
                              Prioridade Baixa
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Integração com Redes Sociais</h3>
                            <Badge variant="outline" className="text-xs">Q1 2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Compartilhamento direto de pixels e conquistas nas redes sociais.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">92</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/50 bg-orange-500/10">
                              Prioridade Alta
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* In Progress */}
              <Card>
                <CardHeader className="bg-yellow-500/10 border-b border-yellow-500/20">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Em Desenvolvimento
                    <Badge className="ml-2 bg-yellow-500 text-white">5</Badge>
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades atualmente em desenvolvimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="p-4 space-y-3">
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Melhorias de Performance Mobile</h3>
                            <Badge variant="outline" className="text-xs">90% Concluído</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Otimizações para melhorar a performance em dispositivos móveis.
                          </p>
                          <Progress value={90} className="h-2 mt-3" />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">156</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/50 bg-orange-500/10">
                              Prioridade Alta
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Sistema de Coleções Temáticas</h3>
                            <Badge variant="outline" className="text-xs">60% Concluído</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Criação e gerenciamento de coleções temáticas de pixels.
                          </p>
                          <Progress value={60} className="h-2 mt-3" />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">78</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50 bg-yellow-500/10">
                              Prioridade Média
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Editor de Pixel Art Avançado</h3>
                            <Badge variant="outline" className="text-xs">40% Concluído</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ferramentas avançadas para criação e edição de pixel art.
                          </p>
                          <Progress value={40} className="h-2 mt-3" />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">112</span>
                            </div>
                            <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/50 bg-orange-500/10">
                              Prioridade Alta
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recently Completed */}
              <Card>
                <CardHeader className="bg-green-500/10 border-b border-green-500/20">
                  <CardTitle className="text-lg flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-green-500" />
                    Recentemente Concluído
                    <Badge className="ml-2 bg-green-500 text-white">6</Badge>
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades implementadas recentemente
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="p-4 space-y-3">
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Sistema de Conquistas</h3>
                            <Badge variant="outline" className="text-xs">Lançado: 15/03/2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Sistema completo de conquistas com recompensas e níveis.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">203</span>
                            </div>
                            <Badge className="text-xs bg-green-500 text-white">
                              Concluído
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Marketplace de Pixels</h3>
                            <Badge variant="outline" className="text-xs">Lançado: 28/02/2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Sistema de compra e venda de pixels entre utilizadores.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">187</span>
                            </div>
                            <Badge className="text-xs bg-green-500 text-white">
                              Concluído
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">Personalização de Perfil</h3>
                            <Badge variant="outline" className="text-xs">Lançado: 10/02/2025</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Opções avançadas de personalização de perfil de utilizador.
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">145</span>
                            </div>
                            <Badge className="text-xs bg-green-500 text-white">
                              Concluído
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            {/* Roadmap Overview */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Visão Geral do Roadmap
                </CardTitle>
                <CardDescription>
                  Plano de desenvolvimento do Pixel Universe para os próximos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                      <h3 className="font-semibold flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        Q1 2025
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>• Modo Noturno Automático</p>
                        <p>• Integração com Redes Sociais</p>
                        <p>• Melhorias de Performance</p>
                      </div>
                      <Badge className="mt-3 bg-blue-500">Em Progresso</Badge>
                    </div>
                    
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                      <h3 className="font-semibold flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                        Q2 2025
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>• Sistema de Leilões</p>
                        <p>• Coleções Temáticas</p>
                        <p>• Editor de Pixel Art Avançado</p>
                      </div>
                      <Badge className="mt-3 bg-yellow-500">Planeado</Badge>
                    </div>
                    
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                      <h3 className="font-semibold flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                        Q3 2025
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>• Realidade Aumentada</p>
                        <p>• Eventos Sazonais</p>
                        <p>• Animações de Pixel</p>
                      </div>
                      <Badge className="mt-3 bg-purple-500">Futuro</Badge>
                    </div>
                    
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner text-center">
                      <h3 className="font-semibold flex items-center justify-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                        Q4 2025
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>• Metaverso Pixel</p>
                        <p>• Marketplace Internacional</p>
                        <p>• IA Generativa para Pixels</p>
                      </div>
                      <Badge className="mt-3 bg-green-500">Visão</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download do Roadmap Completo
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

// Component for the ClipboardList icon since it's not in lucide-react by default
const ClipboardList = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <path d="M12 11h4"></path>
    <path d="M12 16h4"></path>
    <path d="M8 11h.01"></path>
    <path d="M8 16h.01"></path>
  </svg>
);