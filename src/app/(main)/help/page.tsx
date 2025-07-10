'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  HelpCircle, Search, Book, MessageSquare, FileText, Video, ArrowRight,
  CheckCircle, XCircle, AlertTriangle, Info, Mail, Phone, Globe, Send,
  ThumbsUp, ThumbsDown, Clock, Calendar, User, Users, Star, Heart, Eye,
  Bookmark, Share2, Download, Printer, Copy, ExternalLink, ChevronRight,
  Play, Pause, Lightbulb, Zap, Award, Gift, Settings, Bell, Shield, Lock,
  Unlock, Key, FileCheck, FilePlus, FileQuestion, Headphones, Mic, Video as VideoIcon
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPopular?: boolean;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  dataAiHint?: string;
  type: 'article' | 'video' | 'tutorial';
  duration?: string;
  author?: string;
  date: Date;
  url: string;
  views: number;
  likes: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  responses: {
    id: string;
    author: 'user' | 'support';
    authorName: string;
    authorAvatar?: string;
    dataAiHint?: string;
    message: string;
    timestamp: Date;
    attachments?: string[];
  }[];
}

// Mock data
const faqItems: FaqItem[] = [
  {
    id: 'faq1',
    question: 'O que é o Pixel Universe?',
    answer: 'O Pixel Universe é uma plataforma colaborativa que permite aos usuários comprar, personalizar e interagir com pixels em um mapa interativo de Portugal. Cada pixel representa uma localização real no mapa, permitindo que você deixe sua marca digital no território português.',
    category: 'geral',
    tags: ['introdução', 'conceito', 'plataforma'],
    isPopular: true
  },
  {
    id: 'faq2',
    question: 'Como compro um pixel?',
    answer: 'Para comprar um pixel, navegue pelo mapa até encontrar uma localização disponível. Clique no pixel desejado e selecione a opção "Comprar". Você poderá personalizar seu pixel com cores, imagens e descrições antes de finalizar a compra usando seus créditos.',
    category: 'compras',
    tags: ['compra', 'pixels', 'transação'],
    isPopular: true
  },
  {
    id: 'faq3',
    question: 'Quanto custa um pixel?',
    answer: 'O preço dos pixels varia de acordo com a localização, raridade e popularidade da região. Pixels em áreas urbanas como Lisboa e Porto tendem a ser mais caros, enquanto regiões menos populares oferecem preços mais acessíveis. Os preços começam em 10 créditos e podem chegar a centenas de créditos para localizações premium.',
    category: 'compras',
    tags: ['preço', 'valor', 'créditos'],
    isPopular: true
  },
  {
    id: 'faq4',
    question: 'Como obtenho créditos?',
    answer: 'Você pode obter créditos de várias maneiras: comprando-os diretamente na plataforma, recebendo como recompensa por conquistas e participação ativa, através de promoções especiais, ou vendendo seus próprios pixels para outros usuários.',
    category: 'créditos',
    tags: ['créditos', 'pagamento', 'recompensas'],
    isPopular: false
  },
  {
    id: 'faq5',
    question: 'Posso personalizar meu pixel?',
    answer: 'Sim! Após adquirir um pixel, você pode personalizá-lo alterando sua cor, adicionando uma imagem miniatura, incluindo uma descrição e até mesmo vinculando-o a um URL externo. Pixels premium permitem efeitos especiais como animações e interatividade.',
    category: 'personalização',
    tags: ['personalização', 'customização', 'design'],
    isPopular: false
  },
  {
    id: 'faq6',
    question: 'O que são projetos colaborativos?',
    answer: 'Projetos colaborativos permitem que vários usuários trabalhem juntos para criar arte pixel em grande escala no mapa. Você pode criar seu próprio projeto ou participar de projetos existentes, contribuindo com seus pixels para formar imagens maiores, como bandeiras, monumentos ou arte criativa.',
    category: 'colaboração',
    tags: ['colaboração', 'projetos', 'comunidade'],
    isPopular: false
  },
  {
    id: 'faq7',
    question: 'Como funcionam as conquistas?',
    answer: 'As conquistas são recompensas por atingir certos marcos na plataforma. Elas podem incluir comprar seu primeiro pixel, personalizar um número específico de pixels, participar de projetos colaborativos, ou ser ativo na comunidade. Cada conquista desbloqueada concede XP e créditos como recompensa.',
    category: 'gamificação',
    tags: ['conquistas', 'recompensas', 'gamificação'],
    isPopular: false
  },
  {
    id: 'faq8',
    question: 'Posso vender meus pixels?',
    answer: 'Sim, você pode colocar seus pixels à venda no marketplace. Defina o preço desejado e outros usuários poderão comprá-los. Você receberá créditos pela venda, menos uma pequena taxa de transação. Pixels em localizações populares ou com designs únicos geralmente têm maior valor de revenda.',
    category: 'marketplace',
    tags: ['venda', 'marketplace', 'negociação'],
    isPopular: true
  },
  {
    id: 'faq9',
    question: 'O que são créditos especiais?',
    answer: 'Créditos especiais são uma moeda premium que pode ser usada para comprar itens exclusivos, efeitos raros para pixels, ou participar de leilões de pixels legendários. Eles são obtidos principalmente através de compras diretas, eventos especiais ou como recompensa por assinaturas premium.',
    category: 'créditos',
    tags: ['créditos especiais', 'premium', 'exclusivo'],
    isPopular: false
  },
  {
    id: 'faq10',
    question: 'Como funciona a assinatura premium?',
    answer: 'A assinatura premium oferece vantagens como descontos em compras de pixels, acesso a efeitos especiais exclusivos, estatísticas avançadas de mercado, suporte prioritário e um emblema especial no seu perfil. Existem planos mensais e anuais com diferentes níveis de benefícios.',
    category: 'assinatura',
    tags: ['premium', 'assinatura', 'benefícios'],
    isPopular: false
  }
];

const guideItems: GuideItem[] = [
  {
    id: 'guide1',
    title: 'Guia de Introdução ao Pixel Universe',
    description: 'Aprenda os conceitos básicos e comece sua jornada no universo de pixels.',
    category: 'iniciante',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'article',
    author: 'Equipe Pixel',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    url: '/guides/introduction',
    views: 12450,
    likes: 876
  },
  {
    id: 'guide2',
    title: 'Como Comprar Seu Primeiro Pixel',
    description: 'Tutorial passo a passo para navegar pelo mapa e adquirir seu primeiro pixel.',
    category: 'compras',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'tutorial',
    duration: '5 min',
    author: 'PixelMaster',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    url: '/guides/buying-first-pixel',
    views: 8930,
    likes: 654
  },
  {
    id: 'guide3',
    title: 'Técnicas Avançadas de Personalização',
    description: 'Descubra como criar pixels impressionantes com técnicas avançadas de design.',
    category: 'personalização',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'video',
    duration: '12 min',
    author: 'ArtistaPT',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    url: '/guides/advanced-customization',
    views: 5670,
    likes: 432
  },
  {
    id: 'guide4',
    title: 'Estratégias de Investimento em Pixels',
    description: 'Aprenda a identificar pixels com potencial de valorização e maximizar seus retornos.',
    category: 'investimento',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'article',
    author: 'PixelInvestor',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    url: '/guides/investment-strategies',
    views: 7890,
    likes: 567
  },
  {
    id: 'guide5',
    title: 'Criando Projetos Colaborativos de Sucesso',
    description: 'Dicas para organizar e gerenciar projetos colaborativos com outros usuários.',
    category: 'colaboração',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'tutorial',
    duration: '8 min',
    author: 'TeamLeader',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    url: '/guides/collaborative-projects',
    views: 4560,
    likes: 345
  },
  {
    id: 'guide6',
    title: 'Dominando o Marketplace',
    description: 'Guia completo sobre como comprar, vender e negociar pixels no marketplace.',
    category: 'marketplace',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'guide thumbnail',
    type: 'video',
    duration: '15 min',
    author: 'MarketGuru',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    url: '/guides/marketplace-mastery',
    views: 6780,
    likes: 521
  }
];

const supportTickets: SupportTicket[] = [
  {
    id: 'ticket1',
    subject: 'Problema com compra de pixel',
    message: 'Olá, tentei comprar um pixel em Lisboa mas a transação falhou e os créditos foram debitados da minha conta. Podem ajudar?',
    status: 'resolved',
    priority: 'high',
    category: 'pagamentos',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    responses: [
      {
        id: 'resp1',
        author: 'support',
        authorName: 'Carlos (Suporte)',
        authorAvatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'support avatar',
        message: 'Olá! Verificamos a sua conta e identificamos a transação falha. Os créditos já foram estornados para sua carteira. Por favor, tente novamente a compra.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'resp2',
        author: 'user',
        authorName: 'Você',
        message: 'Muito obrigado! Já consegui ver os créditos na minha conta e realizei a compra com sucesso.',
        timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'resp3',
        author: 'support',
        authorName: 'Carlos (Suporte)',
        authorAvatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'support avatar',
        message: 'Excelente! Fico feliz em saber que o problema foi resolvido. Se precisar de mais alguma coisa, estamos à disposição.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: 'ticket2',
    subject: 'Dúvida sobre projetos colaborativos',
    message: 'Como posso convidar amigos para participar do meu projeto colaborativo? Não estou encontrando esta opção.',
    status: 'open',
    priority: 'medium',
    category: 'funcionalidades',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    responses: []
  }
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'geral',
    priority: 'medium'
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { toast } = useToast();

  const filteredFaqs = faqItems.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredGuides = guideItems.filter(guide => {
    const matchesSearch = !searchQuery || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    if (newTicket.subject && newTicket.message) {
      // In a real app, this would send the ticket to the server
      setPlaySuccessSound(true);
      
      toast({
        title: "Ticket Enviado",
        description: "Seu ticket de suporte foi enviado com sucesso. Responderemos em breve.",
      });
      
      // Reset form
      setNewTicket({
        subject: '',
        message: '',
        category: 'geral',
        priority: 'medium'
      });
    } else {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha o assunto e a mensagem do ticket.",
        variant: "destructive"
      });
    }
  };

  const handleSendResponse = () => {
    if (selectedTicket && ticketResponse) {
      // In a real app, this would send the response to the server
      setPlaySuccessSound(true);
      
      toast({
        title: "Resposta Enviada",
        description: "Sua resposta foi enviada com sucesso.",
      });
      
      // Reset form
      setTicketResponse('');
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

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'text-blue-500 bg-blue-500/10';
      case 'in_progress': return 'text-orange-500 bg-orange-500/10';
      case 'resolved': return 'text-green-500 bg-green-500/10';
      case 'closed': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-muted-foreground bg-muted/20 border-muted/30';
    }
  };

  const getStatusLabel = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <HelpCircle className="h-8 w-8 mr-3 animate-glow" />
                  Centro de Ajuda
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Encontre respostas, tutoriais e suporte para todas as suas dúvidas
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar no centro de ajuda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/70 focus:border-primary"
                  />
                </div>
                <Button 
                  onClick={() => {
                    setActiveTab('contact');
                    setSelectedTicket(null);
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contatar Suporte
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
                    value="faq" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Perguntas Frequentes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="guides" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Book className="h-4 w-4 mr-3" />
                    Guias e Tutoriais
                  </TabsTrigger>
                  <TabsTrigger 
                    value="videos" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <VideoIcon className="h-4 w-4 mr-3" />
                    Vídeos Explicativos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contact" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Contato e Suporte
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Categorias</h3>
                  <div className="space-y-1">
                    <Button 
                      variant={selectedCategory === 'all' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('all')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Todas as Categorias
                    </Button>
                    <Button 
                      variant={selectedCategory === 'geral' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('geral')}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Informações Gerais
                    </Button>
                    <Button 
                      variant={selectedCategory === 'compras' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('compras')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Compras e Vendas
                    </Button>
                    <Button 
                      variant={selectedCategory === 'créditos' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('créditos')}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Créditos e Pagamentos
                    </Button>
                    <Button 
                      variant={selectedCategory === 'personalização' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('personalização')}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Personalização
                    </Button>
                    <Button 
                      variant={selectedCategory === 'colaboração' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('colaboração')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Projetos Colaborativos
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-medium flex items-center mb-2">
                    <Headphones className="h-4 w-4 mr-2 text-primary" />
                    Suporte Direto
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Precisa de ajuda imediata? Entre em contato com nossa equipe.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>suporte@pixeluniverse.pt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+351 123 456 789</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Seg-Sex, 9h-18h</span>
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
                <TabsContent value="faq" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Perguntas Frequentes</h3>
                    
                    {searchQuery && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {filteredFaqs.length} resultados para "{searchQuery}"
                        </p>
                      </div>
                    )}
                    
                    {filteredFaqs.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta encontrada</h3>
                        <p className="text-muted-foreground mb-4">
                          Não encontramos perguntas correspondentes à sua pesquisa
                        </p>
                        <Button onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}>
                          Limpar Filtros
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Popular Questions */}
                        {selectedCategory === 'all' && !searchQuery && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium flex items-center mb-3">
                              <Star className="h-4 w-4 mr-2 text-yellow-500" />
                              Perguntas Populares
                            </h4>
                            <div className="space-y-2">
                              {faqItems
                                .filter(faq => faq.isPopular)
                                .map(faq => (
                                  <motion.div whileHover={{ scale: 1.01 }} key={faq.id}>
                                    <Card className="hover:shadow-md transition-shadow">
                                      <CardContent className="p-4">
                                        <Accordion type="single" collapsible>
                                          <AccordionItem value={faq.id} className="border-none">
                                            <AccordionTrigger className="py-0 hover:no-underline">
                                              <div className="flex items-center text-left">
                                                <span className="font-medium">{faq.question}</span>
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-4 pb-2">
                                              <div className="text-muted-foreground">
                                                {faq.answer}
                                              </div>
                                              <div className="flex flex-wrap gap-1 mt-3">
                                                {faq.tags.map(tag => (
                                                  <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                  </Badge>
                                                ))}
                                              </div>
                                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                                <div>
                                                  Categoria: <span className="font-medium">{faq.category}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                  <Button variant="ghost" size="sm" className="h-7 px-2">
                                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                                    Útil
                                                  </Button>
                                                  <Button variant="ghost" size="sm" className="h-7 px-2">
                                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                                    Não Útil
                                                  </Button>
                                                </div>
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {/* All Questions */}
                        <div className="space-y-2">
                          {filteredFaqs.map(faq => (
                            <motion.div whileHover={{ scale: 1.01 }} key={faq.id}>
                              <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <Accordion type="single" collapsible>
                                    <AccordionItem value={faq.id} className="border-none">
                                      <AccordionTrigger className="py-0 hover:no-underline">
                                        <div className="flex items-center text-left">
                                          <span className="font-medium">{faq.question}</span>
                                          {faq.isPopular && (
                                            <Badge className="ml-2 bg-yellow-500 text-white">
                                              Popular
                                            </Badge>
                                          )}
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="pt-4 pb-2">
                                        <div className="text-muted-foreground">
                                          {faq.answer}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                          {faq.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                          <div>
                                            Categoria: <span className="font-medium">{faq.category}</span>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-7 px-2">
                                              <ThumbsUp className="h-3 w-3 mr-1" />
                                              Útil
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 px-2">
                                              <ThumbsDown className="h-3 w-3 mr-1" />
                                              Não Útil
                                            </Button>
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                      <h4 className="font-medium flex items-center mb-2">
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        Não encontrou o que procurava?
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Entre em contato com nossa equipe de suporte para obter ajuda personalizada.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setActiveTab('contact');
                          setSelectedTicket(null);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contatar Suporte
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="guides" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Guias e Tutoriais</h3>
                    
                    {searchQuery && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {filteredGuides.length} resultados para "{searchQuery}"
                        </p>
                      </div>
                    )}
                    
                    {filteredGuides.length === 0 ? (
                      <div className="p-8 text-center">
                        <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum guia encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                          Não encontramos guias correspondentes à sua pesquisa
                        </p>
                        <Button onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}>
                          Limpar Filtros
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGuides.map(guide => (
                          <motion.div whileHover={{ scale: 1.02 }} key={guide.id}>
                            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full">
                              {guide.thumbnail && (
                                <div className="relative h-40 w-full overflow-hidden">
                                  <img 
                                    src={guide.thumbnail} 
                                    alt={guide.title} 
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    data-ai-hint={guide.dataAiHint}
                                  />
                                  <div className="absolute top-2 right-2">
                                    <Badge className={cn(
                                      "text-xs",
                                      guide.type === 'article' ? "bg-blue-500" :
                                      guide.type === 'video' ? "bg-red-500" : "bg-green-500"
                                    )}>
                                      {guide.type === 'article' ? (
                                        <FileText className="h-3 w-3 mr-1" />
                                      ) : guide.type === 'video' ? (
                                        <VideoIcon className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Book className="h-3 w-3 mr-1" />
                                      )}
                                      {guide.type === 'article' ? 'Artigo' :
                                       guide.type === 'video' ? 'Vídeo' : 'Tutorial'}
                                    </Badge>
                                  </div>
                                  {guide.duration && (
                                    <div className="absolute bottom-2 right-2">
                                      <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {guide.duration}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )}
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-lg mb-1">{guide.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {guide.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    <span>{guide.author}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(guide.date)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {guide.views.toLocaleString('pt-PT')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {guide.likes.toLocaleString('pt-PT')}
                                    </span>
                                  </div>
                                  <Button size="sm" className="h-8">
                                    <ArrowRight className="h-4 w-4 mr-1" />
                                    Ler Mais
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="videos" className="space-y-6 mt-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vídeos Explicativos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Featured Video */}
                      <Card className="md:col-span-2 overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <VideoIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button size="icon" className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary">
                              <Play className="h-8 w-8 text-primary-foreground" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-lg mb-1">Tour Completo do Pixel Universe</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Conheça todas as funcionalidades da plataforma neste vídeo introdutório completo.
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                15:32
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                24.5K
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                12/01/2025
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-1" />
                                Compartilhar
                              </Button>
                              <Button size="sm">
                                <Play className="h-4 w-4 mr-1" />
                                Assistir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Video List */}
                      {guideItems
                        .filter(guide => guide.type === 'video')
                        .map(video => (
                          <motion.div whileHover={{ scale: 1.02 }} key={video.id}>
                            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full">
                              {video.thumbnail && (
                                <div className="relative h-40 w-full overflow-hidden">
                                  <img 
                                    src={video.thumbnail} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    data-ai-hint={video.dataAiHint}
                                  />
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Button size="icon" className="h-12 w-12 rounded-full bg-primary/90 hover:bg-primary">
                                      <Play className="h-6 w-6 text-primary-foreground" />
                                    </Button>
                                  </div>
                                  {video.duration && (
                                    <div className="absolute bottom-2 right-2">
                                      <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {video.duration}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              )}
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-lg mb-1">{video.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {video.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    <span>{video.author}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {video.views.toLocaleString('pt-PT')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {video.likes.toLocaleString('pt-PT')}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Todos os Vídeos
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-6 mt-0">
                  {selectedTicket ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                          Ticket #{selectedTicket.id.substring(6)}
                        </h3>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTicket(null)}
                        >
                          Voltar aos Tickets
                        </Button>
                      </div>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle>{selectedTicket.subject}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getStatusColor(selectedTicket.status))}>
                                {getStatusLabel(selectedTicket.status)}
                              </Badge>
                              <Badge className={cn("text-xs", getPriorityColor(selectedTicket.priority))}>
                                {getPriorityLabel(selectedTicket.priority)}
                              </Badge>
                            </div>
                          </div>
                          <CardDescription>
                            Aberto em {formatDate(selectedTicket.createdAt)} • Categoria: {selectedTicket.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">Você</p>
                                  <p className="text-xs text-muted-foreground">{formatTimeAgo(selectedTicket.createdAt)}</p>
                                </div>
                                <p className="text-sm mt-1">{selectedTicket.message}</p>
                              </div>
                            </div>
                          </div>
                          
                          {selectedTicket.responses.map(response => (
                            <div 
                              key={response.id} 
                              className={cn(
                                "p-4 rounded-lg",
                                response.author === 'support' ? "bg-primary/10" : "bg-muted/20"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  {response.author === 'support' && response.authorAvatar ? (
                                    <AvatarImage src={response.authorAvatar} alt={response.authorName} data-ai-hint={response.dataAiHint} />
                                  ) : null}
                                  <AvatarFallback>
                                    {response.authorName.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{response.authorName}</p>
                                    <p className="text-xs text-muted-foreground">{formatTimeAgo(response.timestamp)}</p>
                                  </div>
                                  <p className="text-sm mt-1">{response.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {selectedTicket.status !== 'closed' && (
                            <div className="space-y-3 pt-3">
                              <Textarea 
                                placeholder="Digite sua resposta..." 
                                value={ticketResponse}
                                onChange={(e) => setTicketResponse(e.target.value)}
                                rows={4}
                              />
                              <div className="flex justify-between">
                                <Button variant="outline">
                                  <Paperclip className="h-4 w-4 mr-2" />
                                  Anexar Arquivo
                                </Button>
                                <Button 
                                  onClick={handleSendResponse}
                                  disabled={!ticketResponse}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar Resposta
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {selectedTicket.status === 'closed' && (
                            <div className="p-4 bg-muted/20 rounded-lg text-center">
                              <p className="text-muted-foreground">Este ticket está fechado. Se precisar de mais ajuda, abra um novo ticket.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Contato e Suporte</h3>
                        
                        <Tabs defaultValue="tickets" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
                            <TabsTrigger value="new">Novo Ticket</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="tickets" className="space-y-4 mt-4">
                            {supportTickets.length === 0 ? (
                              <div className="p-8 text-center">
                                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">Nenhum ticket encontrado</h3>
                                <p className="text-muted-foreground mb-4">
                                  Você ainda não abriu nenhum ticket de suporte
                                </p>
                                <Button onClick={() => document.getElementById('new-tab')?.click()}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Criar Novo Ticket
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {supportTickets.map(ticket => (
                                  <motion.div whileHover={{ scale: 1.01 }} key={ticket.id}>
                                    <Card 
                                      className="hover:shadow-md transition-shadow cursor-pointer"
                                      onClick={() => setSelectedTicket(ticket)}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h4 className="font-medium">{ticket.subject}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                              {ticket.message}
                                            </p>
                                          </div>
                                          <div className="flex flex-col items-end gap-2">
                                            <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
                                              {getStatusLabel(ticket.status)}
                                            </Badge>
                                            <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                                              {getPriorityLabel(ticket.priority)}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                          <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3" />
                                              {formatDate(ticket.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <MessageSquare className="h-3 w-3" />
                                              {ticket.responses.length} resposta(s)
                                            </span>
                                          </div>
                                          <Button variant="ghost" size="sm" className="h-7 px-2">
                                            <ChevronRight className="h-4 w-4" />
                                            Ver Detalhes
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="new" className="space-y-4 mt-4" id="new-tab">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Novo Ticket de Suporte</CardTitle>
                                <CardDescription>
                                  Preencha o formulário abaixo para abrir um novo ticket de suporte
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="ticket-subject">Assunto</Label>
                                  <Input 
                                    id="ticket-subject" 
                                    placeholder="Ex: Problema com compra de pixel" 
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="ticket-message">Mensagem</Label>
                                  <Textarea 
                                    id="ticket-message" 
                                    placeholder="Descreva seu problema ou dúvida em detalhes..." 
                                    rows={5}
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="ticket-category">Categoria</Label>
                                    <Select 
                                      value={newTicket.category}
                                      onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                                    >
                                      <SelectTrigger id="ticket-category">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="geral">Geral</SelectItem>
                                        <SelectItem value="compras">Compras e Vendas</SelectItem>
                                        <SelectItem value="pagamentos">Pagamentos</SelectItem>
                                        <SelectItem value="funcionalidades">Funcionalidades</SelectItem>
                                        <SelectItem value="bugs">Bugs e Problemas</SelectItem>
                                        <SelectItem value="sugestões">Sugestões</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="ticket-priority">Prioridade</Label>
                                    <Select 
                                      value={newTicket.priority}
                                      onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as SupportTicket['priority'] }))}
                                    >
                                      <SelectTrigger id="ticket-priority">
                                        <SelectValue placeholder="Selecione a prioridade" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="medium">Média</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="ticket-attachment">Anexos (opcional)</Label>
                                  <Input id="ticket-attachment" type="file" />
                                  <p className="text-xs text-muted-foreground">
                                    Formatos aceitos: JPG, PNG, PDF, DOC, DOCX. Tamanho máximo: 5MB.
                                  </p>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <Button variant="outline">
                                  Cancelar
                                </Button>
                                <Button onClick={handleSubmitTicket}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar Ticket
                                </Button>
                              </CardFooter>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Headphones className="h-5 w-5 mr-2 text-primary" />
                            Outras Formas de Contato
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                <h4 className="font-medium">Email</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  suporte@pixeluniverse.pt
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Resposta em até 24 horas
                                </p>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <Phone className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <h4 className="font-medium">Telefone</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  +351 123 456 789
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Seg-Sex, 9h-18h
                                </p>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                                <h4 className="font-medium">Chat ao Vivo</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Disponível no site
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Todos os dias, 10h-22h
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Help Resources */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Recursos Adicionais
            </CardTitle>
            <CardDescription>
              Explore mais recursos para aproveitar ao máximo o Pixel Universe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Book className="h-4 w-4 mr-2 text-blue-500" />
                  Documentação Completa
                </h3>
                <p className="text-sm text-muted-foreground">
                  Acesse nossa documentação detalhada com informações técnicas e guias aprofundados.
                </p>
                <Button variant="outline" className="w-full mt-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar Documentação
                </Button>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Comunidade e Fórum
                </h3>
                <p className="text-sm text-muted-foreground">
                  Participe de discussões, compartilhe ideias e conecte-se com outros usuários.
                </p>
                <Button variant="outline" className="w-full mt-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visitar Comunidade
                </Button>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <VideoIcon className="h-4 w-4 mr-2 text-red-500" />
                  Canal do YouTube
                </h3>
                <p className="text-sm text-muted-foreground">
                  Assista a tutoriais em vídeo, demonstrações e novidades sobre a plataforma.
                </p>
                <Button variant="outline" className="w-full mt-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Canal
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Baixar Guia Completo (PDF)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}