'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet, CreditCard, Gift, Plus, Minus, ArrowUpRight, ArrowDownLeft,
  TrendingUp, TrendingDown, Clock, Star, Zap, Crown, Coins, DollarSign,
  ShoppingCart, Award, Gem, Package, RefreshCw, Download, Upload,
  History, BarChart3, PieChart, Calendar, Filter, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type TransactionType = 'purchase' | 'sale' | 'transfer' | 'reward' | 'refund' | 'deposit' | 'withdrawal';
type CurrencyType = 'credits' | 'special_credits' | 'real_money';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  relatedPixel?: { x: number; y: number };
  fee?: number;
}

interface WalletBalance {
  credits: number;
  specialCredits: number;
  totalSpent: number;
  totalEarned: number;
  pendingTransactions: number;
}

interface PixelWalletProps {
  children: React.ReactNode;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    amount: -150,
    currency: 'credits',
    description: 'Compra de pixel (245, 156) em Lisboa',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    relatedPixel: { x: 245, y: 156 }
  },
  {
    id: '2',
    type: 'reward',
    amount: 50,
    currency: 'credits',
    description: 'Recompensa por conquista "Primeiro Pixel"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '3',
    type: 'deposit',
    amount: 1000,
    currency: 'credits',
    description: 'Depósito via PayPal',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'completed',
    fee: 25
  },
  {
    id: '4',
    type: 'sale',
    amount: 200,
    currency: 'credits',
    description: 'Venda de pixel (123, 89) em Porto',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    relatedPixel: { x: 123, y: 89 }
  },
  {
    id: '5',
    type: 'transfer',
    amount: -25,
    currency: 'special_credits',
    description: 'Transferência para @PixelFriend',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'pending'
  }
];

const mockBalance: WalletBalance = {
  credits: 12500,
  specialCredits: 120,
  totalSpent: 3450,
  totalEarned: 1250,
  pendingTransactions: 1
};

export default function PixelWallet({ children }: PixelWalletProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [balance, setBalance] = useState<WalletBalance>(mockBalance);
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTransactionIcon = (type: TransactionType) => {
    const icons = {
      purchase: <ShoppingCart className="h-4 w-4 text-red-500" />,
      sale: <TrendingUp className="h-4 w-4 text-green-500" />,
      transfer: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
      reward: <Award className="h-4 w-4 text-yellow-500" />,
      refund: <RefreshCw className="h-4 w-4 text-purple-500" />,
      deposit: <ArrowDownLeft className="h-4 w-4 text-green-600" />,
      withdrawal: <ArrowUpRight className="h-4 w-4 text-red-600" />
    };
    return icons[type];
  };

  const getTransactionLabel = (type: TransactionType) => {
    const labels = {
      purchase: 'Compra',
      sale: 'Venda',
      transfer: 'Transferência',
      reward: 'Recompensa',
      refund: 'Reembolso',
      deposit: 'Depósito',
      withdrawal: 'Levantamento'
    };
    return labels[type];
  };

  const getCurrencyIcon = (currency: CurrencyType) => {
    const icons = {
      credits: <Coins className="h-4 w-4 text-primary" />,
      special_credits: <Gift className="h-4 w-4 text-accent" />,
      real_money: <DollarSign className="h-4 w-4 text-green-500" />
    };
    return icons[currency];
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: amount,
        currency: 'credits',
        description: `Depósito de ${amount} créditos`,
        timestamp: new Date(),
        status: 'pending'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => ({ ...prev, pendingTransactions: prev.pendingTransactions + 1 }));
      setDepositAmount('');
      
      toast({
        title: "Depósito Iniciado",
        description: `Depósito de ${amount} créditos está a ser processado.`,
      });
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance.credits) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: -amount,
        currency: 'credits',
        description: `Levantamento de ${amount} créditos`,
        timestamp: new Date(),
        status: 'pending'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => ({ 
        ...prev, 
        pendingTransactions: prev.pendingTransactions + 1,
        credits: prev.credits - amount
      }));
      setWithdrawAmount('');
      
      toast({
        title: "Levantamento Iniciado",
        description: `Levantamento de ${amount} créditos está a ser processado.`,
      });
    }
  };

  const formatAmount = (amount: number, currency: CurrencyType) => {
    const prefix = amount >= 0 ? '+' : '';
    const symbol = currency === 'real_money' ? '€' : '';
    return `${prefix}${amount}${symbol}`;
  };

  const getSpendingTrend = () => {
    const recentSpending = transactions
      .filter(t => t.amount < 0 && t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const previousSpending = transactions
      .filter(t => t.amount < 0 && 
        t.timestamp > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
        t.timestamp <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const change = previousSpending > 0 ? ((recentSpending - previousSpending) / previousSpending) * 100 : 0;
    return { current: recentSpending, change };
  };

  const spendingTrend = getSpendingTrend();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Carteira Pixel Universe
            {balance.pendingTransactions > 0 && (
              <Badge variant="secondary" className="text-xs">
                {balance.pendingTransactions} pendente{balance.pendingTransactions > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-4 py-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="deposit">Depositar</TabsTrigger>
              <TabsTrigger value="analytics">Análise</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 max-h-[calc(90vh-160px)]">
            <div className="p-4">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Créditos</p>
                          <p className="text-2xl font-bold text-primary">
                            {balance.credits.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <Coins className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Especiais</p>
                          <p className="text-2xl font-bold text-accent">
                            {balance.specialCredits.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <Gift className="h-8 w-8 text-accent" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Ganho</p>
                          <p className="text-2xl font-bold text-green-500">
                            {balance.totalEarned.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Gasto</p>
                          <p className="text-2xl font-bold text-red-500">
                            {balance.totalSpent.toLocaleString('pt-PT')}
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Gastos Esta Semana
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{spendingTrend.current}</p>
                          <p className="text-sm text-muted-foreground">créditos gastos</p>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          spendingTrend.change > 0 ? "text-red-500" : "text-green-500"
                        )}>
                          {spendingTrend.change > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(spendingTrend.change).toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Transações Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {transactions.slice(0, 3).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="text-sm">{getTransactionLabel(transaction.type)}</span>
                            </div>
                            <span className={cn(
                              "text-sm font-medium",
                              transaction.amount >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {formatAmount(transaction.amount, transaction.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4 mt-0">
                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Pesquisar transações..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Select value={filterType} onValueChange={(value: TransactionType | 'all') => setFilterType(value)}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="purchase">Compras</SelectItem>
                          <SelectItem value="sale">Vendas</SelectItem>
                          <SelectItem value="transfer">Transferências</SelectItem>
                          <SelectItem value="reward">Recompensas</SelectItem>
                          <SelectItem value="deposit">Depósitos</SelectItem>
                          <SelectItem value="withdrawal">Levantamentos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      Histórico de Transações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{transaction.timestamp.toLocaleDateString('pt-PT')}</span>
                                <span>•</span>
                                <span>{transaction.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                                {transaction.relatedPixel && (
                                  <>
                                    <span>•</span>
                                    <span>({transaction.relatedPixel.x}, {transaction.relatedPixel.y})</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {getCurrencyIcon(transaction.currency)}
                              <span className={cn(
                                "font-semibold",
                                transaction.amount >= 0 ? "text-green-500" : "text-red-500"
                              )}>
                                {formatAmount(transaction.amount, transaction.currency)}
                              </span>
                            </div>
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 
                                      transaction.status === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs mt-1"
                            >
                              {transaction.status === 'completed' ? 'Concluído' :
                               transaction.status === 'pending' ? 'Pendente' : 'Falhado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deposit" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deposit */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Plus className="h-4 w-4 mr-2 text-green-500" />
                        Depositar Créditos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div>
                        <Label className="text-sm">Quantidade</Label>
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de processamento (2.5%):</span>
                          <span>{depositAmount ? (parseFloat(depositAmount) * 0.025).toFixed(2) : '0'} créditos</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total a receber:</span>
                          <span>{depositAmount ? (parseFloat(depositAmount) * 0.975).toFixed(0) : '0'} créditos</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleDeposit}
                        disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Depositar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Withdraw */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Minus className="h-4 w-4 mr-2 text-red-500" />
                        Levantar Créditos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <div>
                        <Label className="text-sm">Quantidade</Label>
                        <Input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0"
                          max={balance.credits}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Máximo: {balance.credits.toLocaleString('pt-PT')} créditos
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de levantamento (5%):</span>
                          <span>{withdrawAmount ? (parseFloat(withdrawAmount) * 0.05).toFixed(2) : '0'} créditos</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total a receber:</span>
                          <span>€{withdrawAmount ? (parseFloat(withdrawAmount) * 0.95 * 0.01).toFixed(2) : '0.00'}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance.credits}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Levantar
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Methods */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Métodos de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">PayPal</p>
                          <p className="text-xs text-muted-foreground">Instantâneo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CreditCard className="h-6 w-6 text-purple-500" />
                        <div>
                          <p className="font-medium text-sm">Stripe</p>
                          <p className="text-xs text-muted-foreground">Cartão de crédito</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                        <Coins className="h-6 w-6 text-orange-500" />
                        <div>
                          <p className="font-medium text-sm">Crypto</p>
                          <p className="text-xs text-muted-foreground">Em breve</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Spending by Category */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        Gastos por Categoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm">Compra de Píxeis</span>
                          </div>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="text-sm">Transferências</span>
                          </div>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm">Taxas</span>
                          </div>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monthly Trend */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tendência Mensal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {['Janeiro', 'Fevereiro', 'Março'].map((month, index) => (
                          <div key={month} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{month}</span>
                              <span>{(1200 - index * 200).toLocaleString('pt-PT')} créditos</span>
                            </div>
                            <Progress value={100 - index * 20} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Insights da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Gasto Médio</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gasta em média 150 créditos por pixel comprado
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Melhor Investimento</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Píxeis em Lisboa têm maior valorização
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
