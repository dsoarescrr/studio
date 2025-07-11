
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
  Sparkles, Gem, Crown, Heart, MapPin, Tag, Package, PackageOpen, ArrowLeft,
  X
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

              <TabsContent value="transactions" className="mt-0">
                 {/* This content is a placeholder as the full implementation is in a separate component */}
                 <p>Histórico de transações irá aparecer aqui.</p>
              </TabsContent>
              <TabsContent value="buy" className="mt-0">
                 {/* This content is a placeholder as the full implementation is in a separate component */}
                 <p>Opções de compra de créditos irão aparecer aqui.</p>
              </TabsContent>
              <TabsContent value="transfer" className="mt-0">
                 {/* This content is a placeholder as the full implementation is in a separate component */}
                 <p>Funcionalidade de transferência de créditos irá aparecer aqui.</p>
              </TabsContent>
              <TabsContent value="subscription" className="mt-0">
                 {/* This content is a placeholder as the full implementation is in a separate component */}
                 <p>Detalhes da assinatura irão aparecer aqui.</p>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
