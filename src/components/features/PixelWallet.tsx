
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Wallet, Coins, Gift, CreditCard, ArrowUpRight, ArrowDownLeft, 
  Clock, Calendar, BarChart3, PieChart, LineChart, TrendingUp, 
  TrendingDown, DollarSign, Plus, Minus, Copy, Share2, QrCode, 
  ShoppingCart, Award, Star, Users, Zap, AlertTriangle, CheckCircle, 
  HelpCircle, Settings, Lock, Unlock, Eye, EyeOff, RefreshCw, Download,
  Upload, Filter, Search, SortAsc, Info, Bell, Shield, Key, Send, 
  Sparkles, Gem, Crown, Heart, MapPin, Tag, Package, PackageOpen, ArrowLeft
} from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
type TransactionType = 'purchase' | 'sale' | 'reward' | 'gift' | 'subscription' | 'deposit' | 'withdrawal' | 'refund' | 'fee';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing';
type CreditType = 'regular' | 'special';
type SubscriptionTier = 'basic' | 'premium' | 'ultimate';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  creditType: CreditType;
  description: string;
  date: Date;
  status: TransactionStatus;
  relatedUser?: {
    id: string;
    name: string;
    avatar?: string;
    dataAiHint?: string;
  };
  pixelCoordinates?: { x: number; y: number };
  region?: string;
}

interface Subscription {
  tier: SubscriptionTier;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  price: number;
  benefits: string[];
  isActive: boolean;
}

interface CreditPackage {
  id: string;
  name: string;
  amount: number;
  price: number;
  type: CreditType;
  discount?: number;
  isPopular?: boolean;
  isLimited?: boolean;
}

// Mock Data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    amount: -150,
    creditType: 'regular',
    description: 'Compra de Pixel em Lisboa',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    pixelCoordinates: { x: 245, y: 156 },
    region: 'Lisboa'
  },
  {
    id: '2',
    type: 'reward',
    amount: 25,
    creditType: 'regular',
    description: 'Recompensa por Conquista: Mestre das Cores',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '3',
    type: 'sale',
    amount: 200,
    creditType: 'regular',
    description: 'Venda de Pixel no Porto',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    relatedUser: {
      id: 'user123',
      name: 'PixelCollector',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    pixelCoordinates: { x: 123, y: 89 },
    region: 'Porto'
  },
  {
    id: '4',
    type: 'gift',
    amount: 50,
    creditType: 'special',
    description: 'Presente de Boas-Vindas',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '5',
    type: 'deposit',
    amount: 1000,
    creditType: 'regular',
    description: 'Compra de Pacote de Créditos: Pacote Ouro',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '6',
    type: 'subscription',
    amount: -500,
    creditType: 'regular',
    description: 'Assinatura Premium (Mensal)',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'completed'
  }
];

const mockSubscription: Subscription = {
  tier: 'premium',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  autoRenew: true,
  price: 500,
  benefits: [
    'Acesso a pixels exclusivos',
    'Desconto de 15% em todas as compras',
    'Recompensas diárias aumentadas',
    'Efeitos visuais premium',
    'Suporte prioritário',
    'Acesso antecipado a novas funcionalidades'
  ],
  isActive: true
};

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Pacote Básico',
    amount: 500,
    price: 4.99,
    type: 'regular'
  },
  {
    id: 'standard',
    name: 'Pacote Padrão',
    amount: 1200,
    price: 9.99,
    type: 'regular',
    isPopular: true
  },
  {
    id: 'premium',
    name: 'Pacote Premium',
    amount: 2500,
    price: 19.99,
    type: 'regular',
    discount: 15
  },
  {
    id: 'ultimate',
    name: 'Pacote Ultimate',
    amount: 6000,
    price: 39.99,
    type: 'regular',
    discount: 25
  },
  {
    id: 'special-small',
    name: 'Especiais Básico',
    amount: 50,
    price: 4.99,
    type: 'special'
  },
  {
    id: 'special-medium',
    name: 'Especiais Plus',
    amount: 120,
    price: 9.99,
    type: 'special',
    isPopular: true
  },
  {
    id: 'special-large',
    name: 'Especiais Premium',
    amount: 300,
    price: 19.99,
    type: 'special',
    discount: 10
  },
  {
    id: 'limited-edition',
    name: 'Edição Limitada',
    amount: 1000,
    price: 29.99,
    type: 'special',
    discount: 20,
    isLimited: true
  }
];

const subscriptionTiers = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    benefits: [
      'Acesso a todas as funcionalidades básicas',
      'Compra e venda de pixels',
      'Personalização básica de pixels',
      'Participação em projetos colaborativos'
    ],
    cta: 'Plano Atual',
    isPopular: false,
    isDisabled: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 500,
    period: 'mensal',
    benefits: [
      'Acesso a pixels exclusivos',
      'Desconto de 15% em todas as compras',
      'Recompensas diárias aumentadas',
      'Efeitos visuais premium',
      'Suporte prioritário',
      'Acesso antecipado a novas funcionalidades'
    ],
    cta: 'Plano Atual',
    isPopular: true,
    isDisabled: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 1000,
    period: 'mensal',
    benefits: [
      'Todos os benefícios Premium',
      'Desconto de 25% em todas as compras',
      'Créditos especiais mensais (50)',
      'Pixels animados exclusivos',
      'Acesso a eventos VIP',
      'Emblema Ultimate exclusivo',
      'Suporte VIP 24/7'
    ],
    cta: 'Fazer Upgrade',
    isPopular: false,
    isDisabled: false
  }
];

// Helper Components
const TransactionIcon = ({ type }: { type: TransactionType }) => {
  switch (type) {
    case 'purchase':
      return <ShoppingCart className="h-4 w-4 text-red-500" />;
    case 'sale':
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    case 'reward':
      return <Award className="h-4 w-4 text-yellow-500" />;
    case 'gift':
      return <Gift className="h-4 w-4 text-purple-500" />;
    case 'subscription':
      return <Crown className="h-4 w-4 text-blue-500" />;
    case 'deposit':
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    case 'withdrawal':
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    case 'refund':
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case 'fee':
      return <Minus className="h-4 w-4 text-gray-500" />;
    default:
      return <Coins className="h-4 w-4 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Concluído</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">Pendente</Badge>;
    case 'processing':
      return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Processando</Badge>;
    case 'failed':
      return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10">Falhou</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

interface PixelWalletProps {
  children: React.ReactNode;
}

export default function PixelWallet({ children }: PixelWalletProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [subscription, setSubscription] = useState<Subscription>(mockSubscription);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType | 'all'>('all');
  const [creditTypeFilter, setCreditTypeFilter] = useState<CreditType | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount'>('newest');
  const [showQRCode, setShowQRCode] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);
  const { toast } = useToast();
  const { credits, specialCredits, addCredits, removeCredits, addSpecialCredits, removeSpecialCredits } = useUserStore();

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = transactionTypeFilter === 'all' || transaction.type === transactionTypeFilter;
    const matchesCreditType = creditTypeFilter === 'all' || transaction.creditType === creditTypeFilter;
    
    let matchesDate = true;
    const now = new Date();
    if (dateRangeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchesDate = transaction.date >= today;
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = transaction.date >= weekAgo;
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = transaction.date >= monthAgo;
    }
    
    return matchesSearch && matchesType && matchesCreditType && matchesDate;
  }).sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return b.date.getTime() - a.date.getTime();
      case 'oldest':
        return a.date.getTime() - b.date.getTime();
      case 'amount':
        return Math.abs(b.amount) - Math.abs(a.amount);
      default:
        return 0;
    }
  });

  const handleBuyCredits = () => {
    if (!selectedPackage) return;
    
    setIsProcessingPurchase(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessingPurchase(false);
      
      // Add credits to user account
      if (selectedPackage.type === 'regular') {
        addCredits(selectedPackage.amount);
      } else {
        addSpecialCredits(selectedPackage.amount);
      }
      
      // Add transaction to history
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: selectedPackage.amount,
        creditType: selectedPackage.type,
        description: `Compra de Pacote de Créditos: ${selectedPackage.name}`,
        date: new Date(),
        status: 'completed'
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Show success message
      setShowConfetti(true);
      setPlaySuccessSound(true);
      
      toast({
        title: "Compra Bem-Sucedida",
        description: `${selectedPackage.amount} créditos ${selectedPackage.type === 'special' ? 'especiais' : ''} foram adicionados à sua conta.`,
      });
      
      setSelectedPackage(null);
    }, 2000);
  };

  const handleTransferCredits = () => {
    if (!transferAmount || !transferRecipient) return;
    
    const amount = parseInt(transferAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor Inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > credits) {
      toast({
        title: "Saldo Insuficiente",
        description: "Você não tem créditos suficientes para esta transferência.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate API call
    setIsProcessingPurchase(true);
    
    setTimeout(() => {
      setIsProcessingPurchase(false);
      
      // Remove credits from user account
      removeCredits(amount);
      
      // Add transaction to history
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: -amount,
        creditType: 'regular',
        description: `Transferência para ${transferRecipient}`,
        date: new Date(),
        status: 'completed',
        relatedUser: {
          id: 'recipient123',
          name: transferRecipient,
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        }
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Show success message
      toast({
        title: "Transferência Concluída",
        description: `${amount} créditos foram transferidos para ${transferRecipient}.`,
      });
      
      setTransferAmount('');
      setTransferRecipient('');
      setShowTransferConfirmation(false);
    }, 2000);
  };

  const handleCancelSubscription = () => {
    setSubscription({
      ...subscription,
      autoRenew: false
    });
    
    toast({
      title: "Assinatura Atualizada",
      description: "A renovação automática foi desativada. Sua assinatura expirará na data de término.",
    });
  };

  const handleUpgradeSubscription = () => {
    setSubscription({
      ...subscription,
      tier: 'ultimate',
      price: 1000,
      benefits: [
        'Todos os benefícios Premium',
        'Desconto de 25% em todas as compras',
        'Créditos especiais mensais (50)',
        'Pixels animados exclusivos',
        'Acesso a eventos VIP',
        'Emblema Ultimate exclusivo',
        'Suporte VIP 24/7'
      ]
    });
    
    // Remove credits for the upgrade
    removeCredits(500); // Difference between Premium and Ultimate
    
    // Add transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'subscription',
      amount: -500,
      creditType: 'regular',
      description: 'Upgrade para Assinatura Ultimate',
      date: new Date(),
      status: 'completed'
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    toast({
      title: "Upgrade Concluído",
      description: "Sua assinatura foi atualizada para Ultimate com sucesso!",
    });
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate statistics
  const totalSpent = transactions
    .filter(t => t.amount < 0 && t.creditType === 'regular')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalEarned = transactions
    .filter(t => t.amount > 0 && t.creditType === 'regular')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpecialSpent = transactions
    .filter(t => t.amount < 0 && t.creditType === 'special')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalSpecialEarned = transactions
    .filter(t => t.amount > 0 && t.creditType === 'special')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0">
        <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
        <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
        
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <DialogTitle className="font-headline text-2xl text-gradient-gold flex items-center">
                  <Wallet className="h-6 w-6 mr-3 animate-glow" />
                  Carteira Digital
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  Gerencie seus créditos, transações e assinaturas
                </DialogDescription>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Créditos</p>
                  <p className="text-xl font-bold text-primary">{credits.toLocaleString('pt-PT')}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Especiais</p>
                  <p className="text-xl font-bold text-accent">{specialCredits.toLocaleString('pt-PT')}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(95vh-80px)]">
          <TabsList className="px-6 pt-4 bg-transparent justify-start border-b rounded-none gap-2">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary/10">
              <Clock className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="buy" className="data-[state=active]:bg-primary/10">
              <Plus className="h-4 w-4 mr-2" />
              Comprar Créditos
            </TabsTrigger>
            <TabsTrigger value="transfer" className="data-[state=active]:bg-primary/10">
              <Send className="h-4 w-4 mr-2" />
              Transferir
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-primary/10">
              <Crown className="h-4 w-4 mr-2" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-primary/20 rounded-full">
                            <Coins className="h-6 w-6 text-primary" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-muted-foreground">Saldo de Créditos</p>
                            <p className="text-3xl font-bold text-primary">{credits.toLocaleString('pt-PT')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('buy')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ganhos Totais</span>
                          <span className="font-medium text-green-500">+{totalEarned.toLocaleString('pt-PT')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Gastos Totais</span>
                          <span className="font-medium text-red-500">-{totalSpent.toLocaleString('pt-PT')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-accent/20 rounded-full">
                            <Gift className="h-6 w-6 text-accent" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-muted-foreground">Créditos Especiais</p>
                            <p className="text-3xl font-bold text-accent">{specialCredits.toLocaleString('pt-PT')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('buy')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Comprar
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ganhos Totais</span>
                          <span className="font-medium text-green-500">+{totalSpecialEarned.toLocaleString('pt-PT')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Gastos Totais</span>
                          <span className="font-medium text-red-500">-{totalSpecialSpent.toLocaleString('pt-PT')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Status */}
                {subscription.isActive && (
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-3 bg-yellow-500/20 rounded-full">
                            <Crown className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="font-medium">Assinatura {subscription.tier === 'premium' ? 'Premium' : subscription.tier === 'ultimate' ? 'Ultimate' : 'Básica'}</p>
                              <Badge className="ml-2 bg-green-500">Ativa</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Válida até {formatDate(subscription.endDate)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('subscription')}>
                          <Settings className="h-4 w-4 mr-2" />
                          Gerenciar
                        </Button>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Próxima Cobrança</span>
                          <span className="font-medium">{formatDate(subscription.endDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor</span>
                          <span className="font-medium">{subscription.price} créditos</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Período Restante</span>
                            <span className="font-medium">
                              {Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                            </span>
                          </div>
                          <Progress 
                            value={100 - (Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 30) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handleCancelSubscription} disabled={!subscription.autoRenew}>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Renovação
                        </Button>
                        {subscription.tier !== 'ultimate' && (
                          <Button onClick={handleUpgradeSubscription}>
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Fazer Upgrade
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Transações Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              <TransactionIcon type={transaction.type} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </p>
                            <StatusBadge status={transaction.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('transactions')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todas as Transações
                    </Button>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Estatísticas da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-muted/20 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total de Transações</p>
                        <p className="text-2xl font-bold">{transactions.length}</p>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Recebido</p>
                        <p className="text-2xl font-bold text-green-500">+{(totalEarned + totalSpecialEarned).toLocaleString('pt-PT')}</p>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Gasto</p>
                        <p className="text-2xl font-bold text-red-500">-{(totalSpent + totalSpecialSpent).toLocaleString('pt-PT')}</p>
                      </div>
                    </div>
                    
                    <div className="h-40 bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {/* Simulated chart with animated bars */}
                      <div className="absolute inset-0 flex items-end px-4 pb-4">
                        {Array.from({ length: 12 }).map((_, index) => {
                          const height = 20 + Math.random() * 60; // Random height between 20% and 80%
                          return (
                            <motion.div 
                              key={index} 
                              className="flex-1 mx-px bg-primary/30 hover:bg-primary/60 transition-all rounded-t-sm"
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          );
                        })}
                      </div>
                      <div className="text-center text-muted-foreground z-10">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">Atividade da Carteira (Últimos 12 meses)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="mt-0 space-y-6">
                {/* Filters */}
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar transações..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={transactionTypeFilter} onValueChange={(value: any) => setTransactionTypeFilter(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="purchase">Compras</SelectItem>
                            <SelectItem value="sale">Vendas</SelectItem>
                            <SelectItem value="reward">Recompensas</SelectItem>
                            <SelectItem value="gift">Presentes</SelectItem>
                            <SelectItem value="subscription">Assinaturas</SelectItem>
                            <SelectItem value="deposit">Depósitos</SelectItem>
                            <SelectItem value="withdrawal">Saques</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={creditTypeFilter} onValueChange={(value: any) => setCreditTypeFilter(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Créditos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="regular">Regulares</SelectItem>
                            <SelectItem value="special">Especiais</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={dateRangeFilter} onValueChange={(value: any) => setDateRangeFilter(value)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todo o Período</SelectItem>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="week">Última Semana</SelectItem>
                            <SelectItem value="month">Último Mês</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Histórico de Transações
                    </CardTitle>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger className="w-[160px]">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mais Recentes</SelectItem>
                        <SelectItem value="oldest">Mais Antigos</SelectItem>
                        <SelectItem value="amount">Valor (Maior Primeiro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    {filteredTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {filteredTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <TransactionIcon type={transaction.type} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{formatDate(transaction.date)}</span>
                                  {transaction.relatedUser && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center">
                                        <Avatar className="h-4 w-4 mr-1">
                                          <AvatarImage src={transaction.relatedUser.avatar} alt={transaction.relatedUser.name} data-ai-hint={transaction.relatedUser.dataAiHint} />
                                          <AvatarFallback>{transaction.relatedUser.name.substring(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <span>{transaction.relatedUser.name}</span>
                                      </div>
                                    </>
                                  )}
                                  {transaction.pixelCoordinates && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>({transaction.pixelCoordinates.x}, {transaction.pixelCoordinates.y})</span>
                                      </div>
                                    </>
                                  )}
                                  {transaction.region && (
                                    <>
                                      <span>•</span>
                                      <span>{transaction.region}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                {transaction.creditType === 'special' && <Sparkles className="h-3 w-3 ml-1 inline" />}
                              </p>
                              <StatusBadge status={transaction.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-primary" />
                      Análise de Transações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Distribuição por Tipo</h3>
                        <div className="h-40 bg-muted/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {/* Simulated pie chart */}
                          <div className="w-32 h-32 rounded-full border-8 border-primary/50 relative">
                            <div className="absolute inset-0 border-8 border-transparent border-t-accent/70 rounded-full transform rotate-45"></div>
                            <div className="absolute inset-0 border-8 border-transparent border-r-green-500/70 rounded-full transform rotate-180"></div>
                            <div className="absolute inset-0 border-8 border-transparent border-b-red-500/70 rounded-full transform rotate-[270deg]"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Fluxo de Créditos</h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Créditos Ganhos</span>
                              <span className="font-medium text-green-500">+{totalEarned.toLocaleString('pt-PT')}</span>
                            </div>
                            <Progress value={(totalEarned / (totalEarned + totalSpent)) * 100} className="h-2" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Créditos Gastos</span>
                              <span className="font-medium text-red-500">-{totalSpent.toLocaleString('pt-PT')}</span>
                            </div>
                            <Progress value={(totalSpent / (totalEarned + totalSpent)) * 100} className="h-2 [&>div]:bg-red-500" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Especiais Ganhos</span>
                              <span className="font-medium text-accent">+{totalSpecialEarned.toLocaleString('pt-PT')}</span>
                            </div>
                            <Progress value={(totalSpecialEarned / (totalSpecialEarned + totalSpecialSpent)) * 100} className="h-2 [&>div]:bg-accent" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Especiais Gastos</span>
                              <span className="font-medium text-purple-500">-{totalSpecialSpent.toLocaleString('pt-PT')}</span>
                            </div>
                            <Progress value={(totalSpecialSpent / (totalSpecialEarned + totalSpecialSpent)) * 100} className="h-2 [&>div]:bg-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Buy Credits Tab */}
              <TabsContent value="buy" className="mt-0 space-y-6">
                {selectedPackage ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setSelectedPackage(null)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar
                        </Button>
                        {selectedPackage.isPopular && (
                          <Badge className="bg-yellow-500">Mais Popular</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mt-4">
                        Comprar {selectedPackage.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedPackage.type === 'regular' ? 'Créditos Regulares' : 'Créditos Especiais'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary flex items-center justify-center">
                            {selectedPackage.discount ? (
                              <>
                                <span className="text-lg line-through text-muted-foreground mr-2">
                                  €{formatCurrency(selectedPackage.price * (1 + selectedPackage.discount / 100))}
                                </span>
                                <span>€{formatCurrency(selectedPackage.price)}</span>
                              </>
                            ) : (
                              <span>€{formatCurrency(selectedPackage.price)}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-center mt-2">
                            <div className="p-3 bg-primary/10 rounded-full">
                              {selectedPackage.type === 'regular' ? (
                                <Coins className="h-8 w-8 text-primary" />
                              ) : (
                                <Gift className="h-8 w-8 text-accent" />
                              )}
                            </div>
                            <p className="text-2xl font-bold ml-3">
                              {selectedPackage.amount.toLocaleString('pt-PT')} 
                              <span className="text-sm text-muted-foreground ml-1">
                                {selectedPackage.type === 'regular' ? 'créditos' : 'créditos especiais'}
                              </span>
                            </p>
                          </div>
                          {selectedPackage.discount && (
                            <Badge className="mt-2 bg-green-500">
                              Economize {selectedPackage.discount}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Método de Pagamento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button variant="outline" className="justify-start h-auto py-3">
                            <CreditCard className="h-5 w-5 mr-3" />
                            <div className="text-left">
                              <p className="font-medium">Cartão de Crédito</p>
                              <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3">
                            <img src="https://placehold.co/20x20.png" alt="PayPal" className="mr-3" />
                            <div className="text-left">
                              <p className="font-medium">PayPal</p>
                              <p className="text-xs text-muted-foreground">Pagamento rápido e seguro</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3">
                            <img src="https://placehold.co/20x20.png" alt="MB Way" className="mr-3" />
                            <div className="text-left">
                              <p className="font-medium">MB Way</p>
                              <p className="text-xs text-muted-foreground">Pagamento móvel</p>
                            </div>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3">
                            <img src="https://placehold.co/20x20.png" alt="Multibanco" className="mr-3" />
                            <div className="text-left">
                              <p className="font-medium">Multibanco</p>
                              <p className="text-xs text-muted-foreground">Referência para pagamento</p>
                            </div>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium flex items-center mb-2">
                          <Info className="h-4 w-4 mr-2 text-primary" />
                          Informações Importantes
                        </h3>
                        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                          <li>Os créditos serão adicionados instantaneamente à sua conta após o pagamento</li>
                          <li>Todas as transações são seguras e criptografadas</li>
                          <li>Em caso de problemas, contacte o nosso suporte</li>
                          <li>Os créditos não são reembolsáveis</li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleBuyCredits} 
                        disabled={isProcessingPurchase}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        {isProcessingPurchase ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Comprar por €{formatCurrency(selectedPackage.price)}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Regular Credits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Coins className="h-5 w-5 mr-2 text-primary" />
                          Pacotes de Créditos
                        </CardTitle>
                        <CardDescription>
                          Compre créditos para adquirir e personalizar pixels
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {creditPackages.filter(pkg => pkg.type === 'regular').map((pkg) => (
                            <motion.div whileHover={{ scale: 1.03 }} key={pkg.id}>
                              <Card 
                                className={cn(
                                  "cursor-pointer hover:shadow-lg transition-all duration-300",
                                  pkg.isPopular && "border-primary bg-primary/5"
                                )}
                                onClick={() => setSelectedPackage(pkg)}
                              >
                                <CardContent className="p-4 text-center">
                                  {pkg.isPopular && (
                                    <Badge className="mb-2 bg-primary">Mais Popular</Badge>
                                  )}
                                  {pkg.discount && (
                                    <Badge className="mb-2 bg-green-500">-{pkg.discount}%</Badge>
                                  )}
                                  <div className="p-3 bg-primary/10 rounded-full mx-auto w-fit">
                                    <Coins className="h-6 w-6 text-primary" />
                                  </div>
                                  <h3 className="font-medium mt-3">{pkg.name}</h3>
                                  <p className="text-2xl font-bold mt-1">{pkg.amount.toLocaleString('pt-PT')}</p>
                                  <p className="text-sm text-muted-foreground">créditos</p>
                                  <div className="mt-3">
                                    {pkg.discount ? (
                                      <div>
                                        <span className="text-sm line-through text-muted-foreground">
                                          €{formatCurrency(pkg.price * (1 + pkg.discount / 100))}
                                        </span>
                                        <p className="text-lg font-bold text-primary">
                                          €{formatCurrency(pkg.price)}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-lg font-bold text-primary">
                                        €{formatCurrency(pkg.price)}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    className="w-full mt-3 bg-gradient-to-r from-primary to-primary/80"
                                    onClick={() => setSelectedPackage(pkg)}
                                  >
                                    Comprar
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Special Credits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Gift className="h-5 w-5 mr-2 text-accent" />
                          Créditos Especiais
                        </CardTitle>
                        <CardDescription>
                          Créditos premium para itens exclusivos e recursos avançados
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {creditPackages.filter(pkg => pkg.type === 'special').map((pkg) => (
                            <motion.div whileHover={{ scale: 1.03 }} key={pkg.id}>
                              <Card 
                                className={cn(
                                  "cursor-pointer hover:shadow-lg transition-all duration-300",
                                  pkg.isPopular && "border-accent bg-accent/5",
                                  pkg.isLimited && "border-yellow-500 bg-yellow-500/5"
                                )}
                                onClick={() => setSelectedPackage(pkg)}
                              >
                                <CardContent className="p-4 text-center">
                                  {pkg.isPopular && (
                                    <Badge className="mb-2 bg-accent">Mais Popular</Badge>
                                  )}
                                  {pkg.isLimited && (
                                    <Badge className="mb-2 bg-yellow-500">Edição Limitada</Badge>
                                  )}
                                  {pkg.discount && (
                                    <Badge className="mb-2 bg-green-500">-{pkg.discount}%</Badge>
                                  )}
                                  <div className="p-3 bg-accent/10 rounded-full mx-auto w-fit">
                                    <Gift className="h-6 w-6 text-accent" />
                                  </div>
                                  <h3 className="font-medium mt-3">{pkg.name}</h3>
                                  <p className="text-2xl font-bold mt-1">{pkg.amount.toLocaleString('pt-PT')}</p>
                                  <p className="text-sm text-muted-foreground">créditos especiais</p>
                                  <div className="mt-3">
                                    {pkg.discount ? (
                                      <div>
                                        <span className="text-sm line-through text-muted-foreground">
                                          €{formatCurrency(pkg.price * (1 + pkg.discount / 100))}
                                        </span>
                                        <p className="text-lg font-bold text-accent">
                                          €{formatCurrency(pkg.price)}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-lg font-bold text-accent">
                                        €{formatCurrency(pkg.price)}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    className="w-full mt-3 bg-gradient-to-r from-accent to-accent/80"
                                    onClick={() => setSelectedPackage(pkg)}
                                  >
                                    Comprar
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-primary" />
                          Métodos de Pagamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-xs text-muted-foreground mt-1">Visa, Mastercard, Amex</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <img src="https://placehold.co/40x40.png" alt="PayPal" className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">PayPal</p>
                            <p className="text-xs text-muted-foreground mt-1">Pagamento rápido</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <img src="https://placehold.co/40x40.png" alt="MB Way" className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">MB Way</p>
                            <p className="text-xs text-muted-foreground mt-1">Pagamento móvel</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <img src="https://placehold.co/40x40.png" alt="Multibanco" className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">Multibanco</p>
                            <p className="text-xs text-muted-foreground mt-1">Referência bancária</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Transfer Tab */}
              <TabsContent value="transfer" className="mt-0 space-y-6">
                {showTransferConfirmation ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setShowTransferConfirmation(false)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar
                        </Button>
                      </div>
                      <CardTitle className="text-xl mt-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                        Confirmar Transferência
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-sm text-yellow-500">
                          Você está prestes a transferir créditos para outro utilizador. Esta ação não pode ser desfeita.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-muted-foreground">Destinatário:</span>
                          <span className="font-medium">{transferRecipient}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-bold text-primary">{parseInt(transferAmount).toLocaleString('pt-PT')} créditos</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-muted-foreground">Taxa:</span>
                          <span className="font-medium">0 créditos</span>
                        </div>
                        <div className="flex justify-between p-3 bg-primary/10 rounded-lg">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-primary">{parseInt(transferAmount).toLocaleString('pt-PT')} créditos</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="transfer-note">Nota (opcional)</Label>
                        <Textarea id="transfer-note" placeholder="Adicione uma mensagem para o destinatário..." />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" onClick={() => setShowTransferConfirmation(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleTransferCredits} 
                        disabled={isProcessingPurchase}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        {isProcessingPurchase ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Confirmar Transferência
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : showQRCode ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={() => setShowQRCode(false)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar
                        </Button>
                      </div>
                      <CardTitle className="text-xl mt-4 flex items-center">
                        <QrCode className="h-5 w-5 mr-2 text-primary" />
                        Receber Créditos
                      </CardTitle>
                      <CardDescription>
                        Compartilhe este código QR para receber créditos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg">
                          <QrCode className="h-48 w-48 text-black" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Seu ID de Carteira</Label>
                        <div className="flex">
                          <Input value="wallet_12345678" readOnly className="rounded-r-none" />
                          <Button variant="outline" className="rounded-l-none" onClick={() => {
                            navigator.clipboard.writeText('wallet_12345678');
                            toast({
                              title: "Copiado!",
                              description: "ID da carteira copiado para a área de transferência.",
                            });
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Compartilhe este ID com outros utilizadores para receber créditos
                        </p>
                      </div>
                      
                      <div className="flex justify-center gap-2">
                        <Button variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Send Credits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Send className="h-5 w-5 mr-2 text-primary" />
                          Enviar Créditos
                        </CardTitle>
                        <CardDescription>
                          Transfira créditos para outros utilizadores
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipient">Destinatário</Label>
                          <Input 
                            id="recipient" 
                            placeholder="Nome de utilizador ou ID" 
                            value={transferRecipient}
                            onChange={(e) => setTransferRecipient(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Quantidade</Label>
                          <Input 
                            id="amount" 
                            type="number" 
                            placeholder="Quantidade de créditos" 
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Saldo disponível: {credits.toLocaleString('pt-PT')} créditos
                          </p>
                        </div>
                        
                        <Button 
                          className="w-full"
                          disabled={!transferAmount || !transferRecipient || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > credits}
                          onClick={() => setShowTransferConfirmation(true)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Continuar
                        </Button>
                        
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <h4 className="text-sm font-medium flex items-center mb-2">
                            <Info className="h-4 w-4 mr-2 text-primary" />
                            Informações
                          </h4>
                          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                            <li>As transferências são instantâneas e não podem ser canceladas</li>
                            <li>Não é cobrada nenhuma taxa por transferências</li>
                            <li>Verifique cuidadosamente o nome do destinatário</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Receive Credits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <QrCode className="h-5 w-5 mr-2 text-primary" />
                          Receber Créditos
                        </CardTitle>
                        <CardDescription>
                          Gere um código QR para receber créditos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-center">
                          <Button 
                            size="lg" 
                            className="h-auto py-8 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                            onClick={() => setShowQRCode(true)}
                          >
                            <QrCode className="h-12 w-12 mb-2" />
                            <div className="flex flex-col">
                              <span>Gerar Código QR</span>
                              <span className="text-xs opacity-80">Toque para gerar</span>
                            </div>
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label>Seu ID de Carteira</Label>
                          <div className="flex">
                            <Input value="wallet_12345678" readOnly className="rounded-r-none" />
                            <Button variant="outline" className="rounded-l-none" onClick={() => {
                              navigator.clipboard.writeText('wallet_12345678');
                              toast({
                                title: "Copiado!",
                                description: "ID da carteira copiado para a área de transferência.",
                              });
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Compartilhe este ID com outros utilizadores para receber créditos
                          </p>
                        </div>
                        
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <h4 className="text-sm font-medium flex items-center mb-2">
                            <Shield className="h-4 w-4 mr-2 text-green-500" />
                            Segurança
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Compartilhar seu ID de carteira é seguro e só permite que outros utilizadores enviem créditos para você. Nunca compartilhe sua senha ou informações de login.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Transfers */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-primary" />
                          Transferências Recentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {transactions
                            .filter(t => t.type === 'withdrawal' || (t.type === 'deposit' && t.relatedUser))
                            .slice(0, 5)
                            .map((transaction) => (
                              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {transaction.amount > 0 ? (
                                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{transaction.description}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                  </p>
                                  <StatusBadge status={transaction.status} />
                                </div>
                              </div>
                            ))}
                          
                          {transactions.filter(t => t.type === 'withdrawal' || (t.type === 'deposit' && t.relatedUser)).length === 0 && (
                            <div className="text-center py-6">
                              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Nenhuma transferência encontrada.</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="mt-0 space-y-6">
                {/* Current Subscription */}
                {subscription.isActive && (
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-3 bg-yellow-500/20 rounded-full">
                            <Crown className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="font-medium">Assinatura {subscription.tier === 'premium' ? 'Premium' : subscription.tier === 'ultimate' ? 'Ultimate' : 'Básica'}</p>
                              <Badge className="ml-2 bg-green-500">Ativa</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Válida até {formatDate(subscription.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Renovação Automática</p>
                          <div className="flex items-center justify-end mt-1">
                            <Switch checked={subscription.autoRenew} onCheckedChange={(checked) => {
                              setSubscription({
                                ...subscription,
                                autoRenew: checked
                              });
                            }} />
                            <span className="ml-2 text-sm">{subscription.autoRenew ? 'Ativada' : 'Desativada'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Próxima Cobrança</span>
                          <span className="font-medium">{formatDate(subscription.endDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor</span>
                          <span className="font-medium">{subscription.price} créditos</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Período Restante</span>
                            <span className="font-medium">
                              {Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                            </span>
                          </div>
                          <Progress 
                            value={100 - (Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 30) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handleCancelSubscription} disabled={!subscription.autoRenew}>
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Renovação
                        </Button>
                        {subscription.tier !== 'ultimate' && (
                          <Button onClick={handleUpgradeSubscription}>
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Fazer Upgrade
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subscription Tiers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-primary" />
                      Planos de Assinatura
                    </CardTitle>
                    <CardDescription>
                      Escolha o plano que melhor se adapta às suas necessidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {subscriptionTiers.map((tier) => (
                        <motion.div whileHover={{ scale: tier.isDisabled ? 1 : 1.03 }} key={tier.id}>
                          <Card 
                            className={cn(
                              "h-full",
                              tier.isPopular && "border-primary bg-primary/5",
                              tier.isDisabled && "opacity-70"
                            )}
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{tier.name}</CardTitle>
                                  {tier.price > 0 ? (
                                    <CardDescription>
                                      <span className="text-lg font-bold">{tier.price}</span> créditos/{tier.period}
                                    </CardDescription>
                                  ) : (
                                    <CardDescription>Gratuito</CardDescription>
                                  )}
                                </div>
                                {tier.isPopular && (
                                  <Badge className="bg-primary">Popular</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                {tier.benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                className={cn(
                                  "w-full",
                                  tier.id === 'basic' && "bg-muted hover:bg-muted",
                                  tier.id === 'premium' && "bg-primary hover:bg-primary/90",
                                  tier.id === 'ultimate' && "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                                )}
                                disabled={tier.isDisabled}
                                onClick={tier.id === 'ultimate' ? handleUpgradeSubscription : undefined}
                              >
                                {tier.cta}
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Benefits */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                      Benefícios da Assinatura
                    </CardTitle>
                    <CardDescription>
                      Vantagens exclusivas para assinantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Gem className="h-4 w-4 mr-2 text-blue-500" />
                          Pixels Exclusivos
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Acesso a pixels raros e exclusivos disponíveis apenas para assinantes.
                        </p>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Coins className="h-4 w-4 mr-2 text-green-500" />
                          Descontos em Compras
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Economize até 25% em todas as compras de créditos e pixels.
                        </p>
                      </div>
                      <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                        <h3 className="font-semibold flex items-center mb-2">
                          <Gift className="h-4 w-4 mr-2 text-purple-500" />
                          Recompensas Diárias
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Receba créditos e itens especiais diariamente apenas por fazer login.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Info className="h-4 w-4 mr-2" />
                      Saiba Mais Sobre os Benefícios
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
