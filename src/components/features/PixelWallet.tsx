'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  History, BarChart3, PieChart, Calendar, Filter, Search, QrCode,
  Smartphone, Landmark, Building, CreditCard as CreditCardIcon, Banknote,
  Receipt, FileText, AlertCircle, CheckCircle, XCircle, HelpCircle, Settings,
  Lock, Unlock, Eye, EyeOff, Copy, ExternalLink, Share2, Percent, Tag, Ticket,
  Gift as GiftIcon, Sparkles, Flame, ArrowRight, Check, X, Info, Bell, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/store';

type TransactionType = 'purchase' | 'sale' | 'transfer' | 'reward' | 'refund' | 'deposit' | 'withdrawal' | 'subscription' | 'gift' | 'fee';
type CurrencyType = 'credits' | 'special_credits' | 'real_money';
type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'mobile_payment' | 'gift_card';
type SubscriptionTier = 'basic' | 'premium' | 'pro' | 'enterprise';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed' | 'processing' | 'cancelled';
  relatedPixel?: { x: number; y: number; region?: string };
  fee?: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  metadata?: {
    pixelId?: string;
    userId?: string;
    subscriptionId?: string;
    invoiceId?: string;
    giftId?: string;
  };
}

interface WalletBalance {
  credits: number;
  specialCredits: number;
  totalSpent: number;
  totalEarned: number;
  pendingTransactions: number;
  subscriptionTier: SubscriptionTier;
  subscriptionEnds?: Date;
  autoRenew: boolean;
  discountPoints: number;
  referralCredits: number;
  lastDeposit?: Date;
}

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'other';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  name: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountLast4: string;
  isDefault: boolean;
  name: string;
}

interface DiscountCode {
  id: string;
  code: string;
  discount: number;
  expiryDate: Date;
  isUsed: boolean;
  isExpired: boolean;
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  expiryDate: Date;
  isUsed: boolean;
  isExpired: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  discount?: number;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    amount: -150,
    currency: 'credits',
    description: 'Compra de pixel (245, 156) em Lisboa',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed',
    relatedPixel: { x: 245, y: 156, region: 'Lisboa' }
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
    fee: 25,
    paymentMethod: 'paypal',
    reference: 'PAY-123456789'
  },
  {
    id: '4',
    type: 'sale',
    amount: 200,
    currency: 'credits',
    description: 'Venda de pixel (123, 89) em Porto',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    relatedPixel: { x: 123, y: 89, region: 'Porto' }
  },
  {
    id: '5',
    type: 'transfer',
    amount: -25,
    currency: 'special_credits',
    description: 'Transferência para @PixelFriend',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '6',
    type: 'subscription',
    amount: -250,
    currency: 'credits',
    description: 'Renovação de assinatura Premium',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'completed',
    metadata: {
      subscriptionId: 'sub_123456',
      invoiceId: 'inv_123456'
    }
  },
  {
    id: '7',
    type: 'gift',
    amount: 100,
    currency: 'special_credits',
    description: 'Presente de @PixelMaster',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'completed',
    metadata: {
      userId: 'user_123456',
      giftId: 'gift_123456'
    }
  },
  {
    id: '8',
    type: 'fee',
    amount: -5,
    currency: 'credits',
    description: 'Taxa de transação',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '9',
    type: 'withdrawal',
    amount: -500,
    currency: 'credits',
    description: 'Levantamento para PayPal',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    status: 'completed',
    fee: 25,
    paymentMethod: 'paypal',
    reference: 'WD-123456789'
  },
  {
    id: '10',
    type: 'refund',
    amount: 75,
    currency: 'credits',
    description: 'Reembolso de compra cancelada',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'REF-123456789'
  }
];

const mockBalance: WalletBalance = {
  credits: 12500,
  specialCredits: 120,
  totalSpent: 3450,
  totalEarned: 15950,
  pendingTransactions: 1,
  subscriptionTier: 'premium',
  subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  autoRenew: true,
  discountPoints: 250,
  referralCredits: 100,
  lastDeposit: new Date(Date.now() - 24 * 60 * 60 * 1000)
};

const mockPaymentCards: PaymentCard[] = [
  {
    id: 'card1',
    type: 'visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2025',
    isDefault: true,
    name: 'Cartão Principal'
  },
  {
    id: 'card2',
    type: 'mastercard',
    last4: '5678',
    expiryMonth: '09',
    expiryYear: '2026',
    isDefault: false,
    name: 'Cartão Secundário'
  }
];

const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank1',
    bankName: 'Millennium BCP',
    accountLast4: '1234',
    isDefault: true,
    name: 'Conta Principal'
  }
];

const mockDiscountCodes: DiscountCode[] = [
  {
    id: 'disc1',
    code: 'PIXEL25',
    discount: 25,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    isUsed: false,
    isExpired: false
  },
  {
    id: 'disc2',
    code: 'WELCOME10',
    discount: 10,
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isUsed: false,
    isExpired: true
  }
];

const mockGiftCards: GiftCard[] = [
  {
    id: 'gift1',
    code: 'GIFT-1234-5678',
    amount: 50,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isUsed: false,
    isExpired: false
  }
];

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan1',
    name: 'Básico',
    tier: 'basic',
    price: 0,
    period: 'monthly',
    features: [
      'Acesso básico ao mapa',
      'Compra de pixels',
      'Personalização básica'
    ]
  },
  {
    id: 'plan2',
    name: 'Premium',
    tier: 'premium',
    price: 250,
    period: 'monthly',
    features: [
      'Tudo do plano Básico',
      'Efeitos especiais para pixels',
      'Desconto de 10% em compras',
      'Acesso a estatísticas avançadas',
      'Suporte prioritário'
    ],
    isPopular: true
  },
  {
    id: 'plan3',
    name: 'Pro',
    tier: 'pro',
    price: 500,
    period: 'monthly',
    features: [
      'Tudo do plano Premium',
      'Pixels animados',
      'Desconto de 20% em compras',
      'Acesso a regiões exclusivas',
      'Suporte VIP 24/7',
      'Emblema exclusivo no perfil'
    ]
  },
  {
    id: 'plan4',
    name: 'Premium Anual',
    tier: 'premium',
    price: 2500,
    period: 'yearly',
    features: [
      'Todos os benefícios do Premium',
      '2 meses grátis',
      'Bônus de 500 créditos'
    ],
    discount: 17
  },
  {
    id: 'plan5',
    name: 'Pro Anual',
    tier: 'pro',
    price: 5000,
    period: 'yearly',
    features: [
      'Todos os benefícios do Pro',
      '2 meses grátis',
      'Bônus de 1000 créditos',
      'Acesso antecipado a novos recursos'
    ],
    discount: 17
  }
];

interface PixelWalletProps {
  children: React.ReactNode;
}

export default function PixelWallet({ children }: PixelWalletProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [balance, setBalance] = useState<WalletBalance>(mockBalance);
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [playErrorSound, setPlayErrorSound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<string | null>(null);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const { toast } = useToast();
  const { addCredits, removeCredits, addSpecialCredits, removeSpecialCredits } = useUserStore();

  // New card form state
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    saveCard: true
  });

  // New bank account form state
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    iban: '',
    swift: ''
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()));
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
      withdrawal: <ArrowUpRight className="h-4 w-4 text-red-600" />,
      subscription: <Crown className="h-4 w-4 text-amber-500" />,
      gift: <Gift className="h-4 w-4 text-pink-500" />,
      fee: <Percent className="h-4 w-4 text-gray-500" />
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
      withdrawal: 'Levantamento',
      subscription: 'Assinatura',
      gift: 'Presente',
      fee: 'Taxa'
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons = {
      credit_card: <CreditCard className="h-4 w-4 text-blue-500" />,
      paypal: <CreditCard className="h-4 w-4 text-indigo-500" />,
      bank_transfer: <Building className="h-4 w-4 text-green-500" />,
      crypto: <Coins className="h-4 w-4 text-orange-500" />,
      mobile_payment: <Smartphone className="h-4 w-4 text-purple-500" />,
      gift_card: <Gift className="h-4 w-4 text-pink-500" />
    };
    return icons[method];
  };

  const getCardTypeIcon = (type: PaymentCard['type']) => {
    const icons = {
      visa: <CreditCardIcon className="h-4 w-4 text-blue-600" />,
      mastercard: <CreditCardIcon className="h-4 w-4 text-red-600" />,
      amex: <CreditCardIcon className="h-4 w-4 text-purple-600" />,
      other: <CreditCardIcon className="h-4 w-4 text-gray-600" />
    };
    return icons[type];
  };

  const getSubscriptionTierIcon = (tier: SubscriptionTier) => {
    const icons = {
      basic: <Award className="h-4 w-4 text-gray-500" />,
      premium: <Crown className="h-4 w-4 text-amber-500" />,
      pro: <Gem className="h-4 w-4 text-purple-500" />,
      enterprise: <Building className="h-4 w-4 text-blue-500" />
    };
    return icons[tier];
  };

  const getSubscriptionTierLabel = (tier: SubscriptionTier) => {
    const labels = {
      basic: 'Básico',
      premium: 'Premium',
      pro: 'Pro',
      enterprise: 'Enterprise'
    };
    return labels[tier];
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'deposit',
          amount: amount,
          currency: 'credits',
          description: `Depósito via ${
            selectedPaymentMethod === 'credit_card' ? 'Cartão de Crédito' :
            selectedPaymentMethod === 'paypal' ? 'PayPal' :
            selectedPaymentMethod === 'bank_transfer' ? 'Transferência Bancária' :
            selectedPaymentMethod === 'crypto' ? 'Criptomoeda' :
            selectedPaymentMethod === 'mobile_payment' ? 'Pagamento Móvel' : 'Cartão Presente'
          }`,
          timestamp: new Date(),
          status: 'completed',
          paymentMethod: selectedPaymentMethod,
          reference: `DEP-${Date.now().toString().substring(0, 8)}`
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        setBalance(prev => ({ 
          ...prev, 
          credits: prev.credits + amount,
          totalEarned: prev.totalEarned + amount,
          lastDeposit: new Date()
        }));
        
        addCredits(amount);
        
        setDepositAmount('');
        setIsProcessing(false);
        setShowConfetti(true);
        setPlaySuccessSound(true);
        
        toast({
          title: "Depósito Concluído",
          description: `${amount} créditos foram adicionados à sua carteira.`,
        });
        
        setActiveTab('overview');
      }, 2000);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= balance.credits) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'withdrawal',
          amount: -amount,
          currency: 'credits',
          description: `Levantamento para ${
            selectedPaymentMethod === 'credit_card' ? 'Cartão de Crédito' :
            selectedPaymentMethod === 'paypal' ? 'PayPal' :
            selectedPaymentMethod === 'bank_transfer' ? 'Transferência Bancária' :
            selectedPaymentMethod === 'crypto' ? 'Criptomoeda' :
            selectedPaymentMethod === 'mobile_payment' ? 'Pagamento Móvel' : 'Cartão Presente'
          }`,
          timestamp: new Date(),
          status: 'processing',
          paymentMethod: selectedPaymentMethod,
          reference: `WD-${Date.now().toString().substring(0, 8)}`
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        setBalance(prev => ({ 
          ...prev, 
          credits: prev.credits - amount,
          pendingTransactions: prev.pendingTransactions + 1
        }));
        
        removeCredits(amount);
        
        setWithdrawAmount('');
        setIsProcessing(false);
        
        toast({
          title: "Levantamento Iniciado",
          description: `Seu levantamento de ${amount} créditos está sendo processado.`,
        });
        
        setActiveTab('overview');
      }, 2000);
    } else if (amount > balance.credits) {
      setPlayErrorSound(true);
      toast({
        title: "Saldo Insuficiente",
        description: "Você não tem créditos suficientes para este levantamento.",
        variant: "destructive"
      });
    }
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (amount > 0 && amount <= balance.credits && transferRecipient) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'transfer',
          amount: -amount,
          currency: 'credits',
          description: `Transferência para @${transferRecipient}`,
          timestamp: new Date(),
          status: 'completed',
          reference: `TR-${Date.now().toString().substring(0, 8)}`
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        setBalance(prev => ({ 
          ...prev, 
          credits: prev.credits - amount
        }));
        
        removeCredits(amount);
        
        setTransferAmount('');
        setTransferRecipient('');
        setIsProcessing(false);
        setShowTransferForm(false);
        
        toast({
          title: "Transferência Concluída",
          description: `${amount} créditos foram transferidos para @${transferRecipient}.`,
        });
      }, 2000);
    } else if (amount > balance.credits) {
      setPlayErrorSound(true);
      toast({
        title: "Saldo Insuficiente",
        description: "Você não tem créditos suficientes para esta transferência.",
        variant: "destructive"
      });
    } else if (!transferRecipient) {
      setPlayErrorSound(true);
      toast({
        title: "Destinatário Inválido",
        description: "Por favor, informe um destinatário válido.",
        variant: "destructive"
      });
    }
  };

  const handleAddCard = () => {
    if (
      newCard.cardNumber.length >= 16 && 
      newCard.cardName && 
      newCard.expiryMonth && 
      newCard.expiryYear && 
      newCard.cvv
    ) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        const cardType = 
          newCard.cardNumber.startsWith('4') ? 'visa' : 
          newCard.cardNumber.startsWith('5') ? 'mastercard' : 
          newCard.cardNumber.startsWith('3') ? 'amex' : 'other';
        
        const newCardObj: PaymentCard = {
          id: `card${Date.now()}`,
          type: cardType,
          last4: newCard.cardNumber.slice(-4),
          expiryMonth: newCard.expiryMonth,
          expiryYear: newCard.expiryYear,
          isDefault: false,
          name: newCard.cardName
        };
        
        // Reset form
        setNewCard({
          cardNumber: '',
          cardName: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          saveCard: true
        });
        
        setIsProcessing(false);
        setShowAddCard(false);
        
        toast({
          title: "Cartão Adicionado",
          description: "Seu cartão foi adicionado com sucesso.",
        });
      }, 1500);
    } else {
      setPlayErrorSound(true);
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos do cartão corretamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddBank = () => {
    if (
      newBank.bankName && 
      newBank.accountNumber && 
      newBank.accountHolder && 
      newBank.iban
    ) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        const newBankObj: BankAccount = {
          id: `bank${Date.now()}`,
          bankName: newBank.bankName,
          accountLast4: newBank.accountNumber.slice(-4),
          isDefault: false,
          name: newBank.accountHolder
        };
        
        // Reset form
        setNewBank({
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          iban: '',
          swift: ''
        });
        
        setIsProcessing(false);
        setShowAddBank(false);
        
        toast({
          title: "Conta Bancária Adicionada",
          description: "Sua conta bancária foi adicionada com sucesso.",
        });
      }, 1500);
    } else {
      setPlayErrorSound(true);
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos da conta bancária corretamente.",
        variant: "destructive"
      });
    }
  };

  const handleApplyDiscountCode = () => {
    if (discountCode) {
      const foundCode = mockDiscountCodes.find(
        code => code.code.toLowerCase() === discountCode.toLowerCase() && !code.isUsed && !code.isExpired
      );
      
      if (foundCode) {
        setPlaySuccessSound(true);
        toast({
          title: "Código Aplicado!",
          description: `Desconto de ${foundCode.discount}% aplicado à sua próxima compra.`,
        });
        setDiscountCode('');
        setShowDiscountForm(false);
      } else {
        setPlayErrorSound(true);
        toast({
          title: "Código Inválido",
          description: "Este código não existe, já foi usado ou está expirado.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRedeemGiftCard = () => {
    if (giftCardCode) {
      const foundCard = mockGiftCards.find(
        card => card.code.toLowerCase() === giftCardCode.toLowerCase() && !card.isUsed && !card.isExpired
      );
      
      if (foundCard) {
        setIsProcessing(true);
        
        // Simulate API call
        setTimeout(() => {
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'deposit',
            amount: foundCard.amount,
            currency: 'credits',
            description: `Resgate de Cartão Presente ${foundCard.code}`,
            timestamp: new Date(),
            status: 'completed',
            paymentMethod: 'gift_card',
            reference: `GC-${Date.now().toString().substring(0, 8)}`
          };
          
          setTransactions(prev => [newTransaction, ...prev]);
          setBalance(prev => ({ 
            ...prev, 
            credits: prev.credits + foundCard.amount,
            totalEarned: prev.totalEarned + foundCard.amount
          }));
          
          addCredits(foundCard.amount);
          
          setGiftCardCode('');
          setIsProcessing(false);
          setShowGiftCardForm(false);
          setShowConfetti(true);
          setPlaySuccessSound(true);
          
          toast({
            title: "Cartão Resgatado!",
            description: `${foundCard.amount} créditos foram adicionados à sua carteira.`,
          });
        }, 1500);
      } else {
        setPlayErrorSound(true);
        toast({
          title: "Código Inválido",
          description: "Este cartão presente não existe, já foi usado ou está expirado.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubscribe = () => {
    if (selectedSubscriptionPlan) {
      const plan = mockSubscriptionPlans.find(p => p.id === selectedSubscriptionPlan);
      
      if (plan) {
        if (balance.credits >= plan.price) {
          setIsProcessing(true);
          
          // Simulate API call
          setTimeout(() => {
            const newTransaction: Transaction = {
              id: Date.now().toString(),
              type: 'subscription',
              amount: -plan.price,
              currency: 'credits',
              description: `Assinatura ${plan.name} (${plan.period === 'monthly' ? 'Mensal' : 'Anual'})`,
              timestamp: new Date(),
              status: 'completed',
              reference: `SUB-${Date.now().toString().substring(0, 8)}`,
              metadata: {
                subscriptionId: `sub_${Date.now().toString().substring(0, 8)}`,
                invoiceId: `inv_${Date.now().toString().substring(0, 8)}`
              }
            };
            
            setTransactions(prev => [newTransaction, ...prev]);
            setBalance(prev => ({ 
              ...prev, 
              credits: prev.credits - plan.price,
              subscriptionTier: plan.tier,
              subscriptionEnds: new Date(Date.now() + (plan.period === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
              autoRenew: true
            }));
            
            removeCredits(plan.price);
            
            setIsProcessing(false);
            setShowConfetti(true);
            setPlaySuccessSound(true);
            
            toast({
              title: "Assinatura Ativada!",
              description: `Sua assinatura ${plan.name} foi ativada com sucesso.`,
            });
            
            setActiveTab('overview');
          }, 2000);
        } else {
          setPlayErrorSound(true);
          toast({
            title: "Saldo Insuficiente",
            description: `Você precisa de ${plan.price} créditos para esta assinatura.`,
            variant: "destructive"
          });
        }
      }
    }
  };

  const formatAmount = (amount: number, currency: CurrencyType) => {
    const prefix = amount >= 0 ? '+' : '';
    const symbol = currency === 'real_money' ? '€' : '';
    return `${amount >= 0 ? prefix : ''}${amount}${symbol}`;
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
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffMinutes}m atrás`;
    }
  };

  const getDaysRemaining = (date?: Date) => {
    if (!date) return null;
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <SoundEffect src={SOUND_EFFECTS.ERROR} play={playErrorSound} onEnd={() => setPlayErrorSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Carteira Digital
                {balance.pendingTransactions > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {balance.pendingTransactions} pendente{balance.pendingTransactions > 1 ? 's' : ''}
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie seus créditos, transações e métodos de pagamento
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTransferForm(true)}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Transferir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('deposit')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Depositar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('withdraw')}
              >
                <Minus className="h-4 w-4 mr-2" />
                Levantar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(95vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="deposit">Depositar</TabsTrigger>
                <TabsTrigger value="withdraw">Levantar</TabsTrigger>
                <TabsTrigger value="payment">Pagamentos</TabsTrigger>
                <TabsTrigger value="subscription">Assinatura</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(95vh-160px)]">
              <div className="p-4">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  {/* Balance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
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
                          {balance.lastDeposit && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Último depósito: {formatTimeAgo(balance.lastDeposit)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
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
                          <p className="text-xs text-muted-foreground mt-2">
                            Créditos especiais para itens exclusivos
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 hover:shadow-lg transition-shadow">
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
                          <p className="text-xs text-muted-foreground mt-2">
                            Créditos ganhos desde o início
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 hover:shadow-lg transition-shadow">
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
                          <p className="text-xs text-muted-foreground mt-2">
                            Créditos gastos desde o início
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Subscription Status */}
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-amber-500/20 rounded-full">
                            <Crown className="h-6 w-6 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center">
                              Plano {getSubscriptionTierLabel(balance.subscriptionTier)}
                              <Badge className="ml-2 bg-amber-500 text-white">Ativo</Badge>
                            </h3>
                            {balance.subscriptionEnds && (
                              <p className="text-sm text-muted-foreground">
                                Ativo até {formatDate(balance.subscriptionEnds)} ({getDaysRemaining(balance.subscriptionEnds)} dias restantes)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Renovação Automática</span>
                            <Switch checked={balance.autoRenew} />
                          </div>
                          <Button variant="outline" onClick={() => setActiveTab('subscription')}>
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
                            <p className="text-2xl font-bold">{getSpendingTrend().current.toLocaleString('pt-PT')}</p>
                            <p className="text-sm text-muted-foreground">créditos gastos</p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 text-sm",
                            getSpendingTrend().change > 0 ? "text-red-500" : "text-green-500"
                          )}>
                            {getSpendingTrend().change > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {Math.abs(getSpendingTrend().change).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Compras</span>
                            <span className="font-medium">
                              {transactions
                                .filter(t => t.type === 'purchase' && t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                .toLocaleString('pt-PT')}
                            </span>
                          </div>
                          <Progress 
                            value={70} 
                            className="h-1.5" 
                          />
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Assinaturas</span>
                            <span className="font-medium">
                              {transactions
                                .filter(t => t.type === 'subscription' && t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                .toLocaleString('pt-PT')}
                            </span>
                          </div>
                          <Progress 
                            value={20} 
                            className="h-1.5" 
                          />
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Taxas</span>
                            <span className="font-medium">
                              {transactions
                                .filter(t => t.type === 'fee' && t.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                .toLocaleString('pt-PT')}
                            </span>
                          </div>
                          <Progress 
                            value={10} 
                            className="h-1.5" 
                          />
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
                        <div className="space-y-3">
                          {transactions.slice(0, 3).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-muted/20 rounded-md transition-colors">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <div>
                                  <span className="text-sm">{getTransactionLabel(transaction.type)}</span>
                                  <p className="text-xs text-muted-foreground">{formatTimeAgo(transaction.timestamp)}</p>
                                </div>
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
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => setActiveTab('transactions')}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Ver Todas as Transações
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                          onClick={() => setShowGiftCardForm(true)}
                        >
                          <GiftIcon className="h-6 w-6 text-pink-500" />
                          <span>Resgatar Cartão</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                          onClick={() => setShowDiscountForm(true)}
                        >
                          <Tag className="h-6 w-6 text-green-500" />
                          <span>Aplicar Cupom</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                          onClick={() => setActiveTab('payment')}
                        >
                          <CreditCardIcon className="h-6 w-6 text-blue-500" />
                          <span>Métodos de Pagamento</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                          onClick={() => setActiveTab('subscription')}
                        >
                          <Crown className="h-6 w-6 text-amber-500" />
                          <span>Gerenciar Assinatura</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rewards and Referrals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Award className="h-4 w-4 mr-2 text-yellow-500" />
                          Pontos de Desconto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-yellow-500">{balance.discountPoints}</p>
                            <p className="text-xs text-muted-foreground">pontos acumulados</p>
                          </div>
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                            5% de desconto disponível
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progresso para 10%</span>
                            <span className="font-medium">{balance.discountPoints}/500</span>
                          </div>
                          <Progress value={(balance.discountPoints / 500) * 100} className="h-1.5" />
                        </div>
                        
                        <Button variant="outline" className="w-full mt-4">
                          <Tag className="h-4 w-4 mr-2" />
                          Resgatar Desconto
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Programa de Indicação
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-500">{balance.referralCredits}</p>
                            <p className="text-xs text-muted-foreground">créditos de indicação</p>
                          </div>
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                            2 amigos indicados
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                          <p className="text-sm">Indique amigos e ganhe 50 créditos por cada novo usuário!</p>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Input value="https://pixeluniverse.pt/ref/12345" readOnly />
                          <Button variant="outline" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
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
                        
                        <div className="flex gap-2">
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
                              <SelectItem value="subscription">Assinaturas</SelectItem>
                              <SelectItem value="gift">Presentes</SelectItem>
                              <SelectItem value="refund">Reembolsos</SelectItem>
                              <SelectItem value="fee">Taxas</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transaction Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        Resumo de Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-muted/20 rounded-lg text-center">
                          <p className="text-lg font-bold text-primary">
                            {transactions.length}
                          </p>
                          <p className="text-xs text-muted-foreground">Total de Transações</p>
                        </div>
                        
                        <div className="p-3 bg-muted/20 rounded-lg text-center">
                          <p className="text-lg font-bold text-green-500">
                            {transactions.filter(t => t.amount > 0).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Entradas</p>
                        </div>
                        
                        <div className="p-3 bg-muted/20 rounded-lg text-center">
                          <p className="text-lg font-bold text-red-500">
                            {transactions.filter(t => t.amount < 0).length}
                          </p>
                          <p className="text-xs text-muted-foreground">Saídas</p>
                        </div>
                        
                        <div className="p-3 bg-muted/20 rounded-lg text-center">
                          <p className="text-lg font-bold text-orange-500">
                            {transactions.filter(t => t.status === 'pending' || t.status === 'processing').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                        </div>
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
                        {filteredTransactions.length === 0 ? (
                          <div className="p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">
                              Nenhuma transação encontrada com os filtros atuais.
                            </p>
                          </div>
                        ) : (
                          filteredTransactions.map((transaction) => (
                            <motion.div whileHover={{ scale: 1.01 }} key={transaction.id}>
                              <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-full",
                                      transaction.amount >= 0 
                                        ? "bg-green-500/20" 
                                        : "bg-red-500/20"
                                    )}>
                                      {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{transaction.description}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatDate(transaction.timestamp)}</span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(transaction.timestamp)}</span>
                                        {transaction.reference && (
                                          <>
                                            <span>•</span>
                                            <span>Ref: {transaction.reference}</span>
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
                                      variant={
                                        transaction.status === 'completed' ? 'default' : 
                                        transaction.status === 'pending' || transaction.status === 'processing' ? 'secondary' : 
                                        'destructive'
                                      }
                                      className="text-xs mt-1"
                                    >
                                      {transaction.status === 'completed' ? 'Concluído' :
                                       transaction.status === 'pending' ? 'Pendente' :
                                       transaction.status === 'processing' ? 'Processando' :
                                       transaction.status === 'cancelled' ? 'Cancelado' : 'Falhou'}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {transaction.relatedPixel && (
                                  <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>
                                        Coordenadas: ({transaction.relatedPixel.x}, {transaction.relatedPixel.y})
                                        {transaction.relatedPixel.region && ` • ${transaction.relatedPixel.region}`}
                                      </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Ver Pixel
                                    </Button>
                                  </div>
                                )}
                                
                                {transaction.fee && (
                                  <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Percent className="h-3 w-3" />
                                      <span>Taxa: {transaction.fee} créditos</span>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deposit" className="space-y-6 mt-0">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-primary" />
                    Depositar Créditos
                  </h3>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Quantidade</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="deposit-amount"
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0"
                            className="text-lg"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => setDepositAmount('100')}
                          >
                            100
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setDepositAmount('500')}
                          >
                            500
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setDepositAmount('1000')}
                          >
                            1000
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Método de Pagamento</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { id: 'credit_card', label: 'Cartão de Crédito', icon: <CreditCardIcon className="h-5 w-5" /> },
                            { id: 'paypal', label: 'PayPal', icon: <CreditCardIcon className="h-5 w-5" /> },
                            { id: 'bank_transfer', label: 'Transferência', icon: <Building className="h-5 w-5" /> },
                            { id: 'crypto', label: 'Criptomoeda', icon: <Coins className="h-5 w-5" /> },
                            { id: 'mobile_payment', label: 'MB Way', icon: <Smartphone className="h-5 w-5" /> },
                            { id: 'gift_card', label: 'Cartão Presente', icon: <GiftIcon className="h-5 w-5" /> }
                          ].map(method => (
                            <Button
                              key={method.id}
                              variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                              className="h-auto py-3 flex flex-col items-center justify-center gap-2"
                              onClick={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                            >
                              {method.icon}
                              <span className="text-xs">{method.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {selectedPaymentMethod === 'credit_card' && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <Label>Cartões Salvos</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAddCard(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Novo Cartão
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {mockPaymentCards.map(card => (
                              <div 
                                key={card.id} 
                                className={cn(
                                  "p-3 border rounded-lg flex items-center justify-between cursor-pointer",
                                  card.isDefault ? "bg-muted/20 border-primary/30" : "hover:bg-muted/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {getCardTypeIcon(card.type)}
                                  <div>
                                    <p className="font-medium">{card.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      •••• {card.last4} | {card.expiryMonth}/{card.expiryYear}
                                    </p>
                                  </div>
                                </div>
                                {card.isDefault && (
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedPaymentMethod === 'bank_transfer' && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <Label>Contas Bancárias</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAddBank(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Nova Conta
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {mockBankAccounts.map(account => (
                              <div 
                                key={account.id} 
                                className={cn(
                                  "p-3 border rounded-lg flex items-center justify-between cursor-pointer",
                                  account.isDefault ? "bg-muted/20 border-primary/30" : "hover:bg-muted/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Building className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="font-medium">{account.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {account.bankName} •••• {account.accountLast4}
                                    </p>
                                  </div>
                                </div>
                                {account.isDefault && (
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedPaymentMethod === 'crypto' && (
                        <div className="space-y-4 pt-2">
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <QrCode className="h-24 w-24 mx-auto mb-4" />
                            <p className="text-sm mb-2">Envie criptomoedas para o endereço abaixo:</p>
                            <div className="flex items-center justify-center gap-2">
                              <code className="bg-muted p-2 rounded text-xs">0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t</code>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <p className="text-xs text-muted-foreground">
                                Após enviar criptomoedas, pode levar até 30 minutos para os créditos serem adicionados à sua carteira.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
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
                        disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Depositar
                          </>
                        )}
                      </Button>
                      
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Os depósitos são processados instantaneamente para a maioria dos métodos de pagamento. Transferências bancárias podem levar até 2 dias úteis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add Card Form */}
                  {showAddCard && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Adicionar Novo Cartão
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Número do Cartão</Label>
                          <Input 
                            id="card-number" 
                            placeholder="1234 5678 9012 3456" 
                            value={newCard.cardNumber}
                            onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="card-name">Nome no Cartão</Label>
                          <Input 
                            id="card-name" 
                            placeholder="NOME COMPLETO" 
                            value={newCard.cardName}
                            onChange={(e) => setNewCard(prev => ({ ...prev, cardName: e.target.value }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry-month">Mês</Label>
                            <Select 
                              value={newCard.expiryMonth}
                              onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryMonth: value }))}
                            >
                              <SelectTrigger id="expiry-month">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const month = (i + 1).toString().padStart(2, '0');
                                  return (
                                    <SelectItem key={month} value={month}>
                                      {month}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expiry-year">Ano</Label>
                            <Select 
                              value={newCard.expiryYear}
                              onValueChange={(value) => setNewCard(prev => ({ ...prev, expiryYear: value }))}
                            >
                              <SelectTrigger id="expiry-year">
                                <SelectValue placeholder="AA" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const year = (new Date().getFullYear() + i).toString();
                                  return (
                                    <SelectItem key={year} value={year}>
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input 
                              id="cvv" 
                              placeholder="123" 
                              value={newCard.cvv}
                              onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="save-card" 
                            checked={newCard.saveCard}
                            onCheckedChange={(checked) => setNewCard(prev => ({ ...prev, saveCard: checked }))}
                          />
                          <Label htmlFor="save-card">Salvar cartão para futuras compras</Label>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setShowAddCard(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={handleAddCard}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Cartão
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Add Bank Account Form */}
                  {showAddBank && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Adicionar Conta Bancária
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank-name">Nome do Banco</Label>
                          <Input 
                            id="bank-name" 
                            placeholder="Ex: Millennium BCP" 
                            value={newBank.bankName}
                            onChange={(e) => setNewBank(prev => ({ ...prev, bankName: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="account-holder">Titular da Conta</Label>
                          <Input 
                            id="account-holder" 
                            placeholder="NOME COMPLETO" 
                            value={newBank.accountHolder}
                            onChange={(e) => setNewBank(prev => ({ ...prev, accountHolder: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="account-number">Número da Conta</Label>
                          <Input 
                            id="account-number" 
                            placeholder="12345678901234" 
                            value={newBank.accountNumber}
                            onChange={(e) => setNewBank(prev => ({ ...prev, accountNumber: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="iban">IBAN</Label>
                          <Input 
                            id="iban" 
                            placeholder="PT50 1234 5678 9012 3456 7890 1" 
                            value={newBank.iban}
                            onChange={(e) => setNewBank(prev => ({ ...prev, iban: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="swift">SWIFT/BIC (opcional)</Label>
                          <Input 
                            id="swift" 
                            placeholder="ABCDEFGHXXX" 
                            value={newBank.swift}
                            onChange={(e) => setNewBank(prev => ({ ...prev, swift: e.target.value }))}
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setShowAddBank(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={handleAddBank}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Conta
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-6 mt-0">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Minus className="h-5 w-5 mr-2 text-primary" />
                    Levantar Créditos
                  </h3>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Quantidade</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="withdraw-amount"
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0"
                            className="text-lg"
                            max={balance.credits}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => setWithdrawAmount('100')}
                          >
                            100
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setWithdrawAmount('500')}
                          >
                            500
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setWithdrawAmount(balance.credits.toString())}
                          >
                            Máx
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Máximo: {balance.credits.toLocaleString('pt-PT')} créditos
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Método de Levantamento</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { id: 'paypal', label: 'PayPal', icon: <CreditCardIcon className="h-5 w-5" /> },
                            { id: 'bank_transfer', label: 'Transferência', icon: <Building className="h-5 w-5" /> },
                            { id: 'crypto', label: 'Criptomoeda', icon: <Coins className="h-5 w-5" /> }
                          ].map(method => (
                            <Button
                              key={method.id}
                              variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                              className="h-auto py-3 flex flex-col items-center justify-center gap-2"
                              onClick={() => setSelectedPaymentMethod(method.id as PaymentMethod)}
                            >
                              {method.icon}
                              <span className="text-xs">{method.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {selectedPaymentMethod === 'paypal' && (
                        <div className="space-y-2">
                          <Label htmlFor="paypal-email">Email do PayPal</Label>
                          <Input id="paypal-email" placeholder="seu.email@exemplo.com" />
                        </div>
                      )}
                      
                      {selectedPaymentMethod === 'bank_transfer' && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <Label>Contas Bancárias</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowAddBank(true)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Nova Conta
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {mockBankAccounts.map(account => (
                              <div 
                                key={account.id} 
                                className={cn(
                                  "p-3 border rounded-lg flex items-center justify-between cursor-pointer",
                                  account.isDefault ? "bg-muted/20 border-primary/30" : "hover:bg-muted/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Building className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="font-medium">{account.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {account.bankName} •••• {account.accountLast4}
                                    </p>
                                  </div>
                                </div>
                                {account.isDefault && (
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Padrão
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedPaymentMethod === 'crypto' && (
                        <div className="space-y-2">
                          <Label htmlFor="crypto-address">Endereço da Carteira</Label>
                          <Input id="crypto-address" placeholder="0x1234..." />
                          <p className="text-xs text-muted-foreground">
                            Certifique-se de que o endereço está correto. Transações em blockchain são irreversíveis.
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de levantamento (5%):</span>
                          <span>{withdrawAmount ? (parseFloat(withdrawAmount) * 0.05).toFixed(2) : '0'} créditos</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total a receber:</span>
                          <span>€{withdrawAmount ? (parseFloat(withdrawAmount) * 0.95 * 0.01).toFixed(2) : '0.00'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Taxa de conversão: 1 crédito = €0.01
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance.credits || isProcessing}
                        variant="outline"
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Levantar
                          </>
                        )}
                      </Button>
                      
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Os levantamentos são processados em até 3 dias úteis. O valor mínimo para levantamento é de 100 créditos.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Withdrawal History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Histórico de Levantamentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transactions
                          .filter(t => t.type === 'withdrawal')
                          .slice(0, 3)
                          .map(transaction => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-red-500/20">
                                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-red-500">{formatAmount(transaction.amount, transaction.currency)}</p>
                                <Badge 
                                  variant={
                                    transaction.status === 'completed' ? 'default' : 
                                    transaction.status === 'pending' || transaction.status === 'processing' ? 'secondary' : 
                                    'destructive'
                                  }
                                  className="text-xs mt-1"
                                >
                                  {transaction.status === 'completed' ? 'Concluído' :
                                   transaction.status === 'pending' ? 'Pendente' :
                                   transaction.status === 'processing' ? 'Processando' :
                                   transaction.status === 'cancelled' ? 'Cancelado' : 'Falhou'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          
                        {transactions.filter(t => t.type === 'withdrawal').length === 0 && (
                          <div className="p-4 text-center text-muted-foreground">
                            Nenhum levantamento encontrado
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6 mt-0">
                  <h3 className="text-lg font-semibold flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
                    Métodos de Pagamento
                  </h3>

                  {/* Payment Cards */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Cartões de Crédito/Débito
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddCard(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Cartão
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockPaymentCards.map(card => (
                          <div key={card.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getCardTypeIcon(card.type)}
                                <div>
                                  <p className="font-medium">{card.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    •••• {card.last4} | Expira em {card.expiryMonth}/{card.expiryYear}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {card.isDefault ? (
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Padrão
                                  </Badge>
                                ) : (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    Definir como Padrão
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {mockPaymentCards.length === 0 && (
                          <div className="p-8 text-center">
                            <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-4">
                              Nenhum cartão adicionado
                            </p>
                            <Button onClick={() => setShowAddCard(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Cartão
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Accounts */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Contas Bancárias
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddBank(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Conta
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockBankAccounts.map(account => (
                          <div key={account.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="font-medium">{account.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {account.bankName} •••• {account.accountLast4}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {account.isDefault ? (
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    Padrão
                                  </Badge>
                                ) : (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    Definir como Padrão
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {mockBankAccounts.length === 0 && (
                          <div className="p-8 text-center">
                            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-4">
                              Nenhuma conta bancária adicionada
                            </p>
                            <Button onClick={() => setShowAddBank(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Conta
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discount Codes */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Cupons de Desconto
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDiscountForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Aplicar Cupom
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockDiscountCodes
                          .filter(code => !code.isExpired && !code.isUsed)
                          .map(code => (
                            <div key={code.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Tag className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="font-medium">{code.code}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {code.discount}% de desconto • Válido até {formatDate(code.expiryDate)}
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-500 text-white">
                                  Ativo
                                </Badge>
                              </div>
                            </div>
                          ))}
                        
                        {mockDiscountCodes.filter(code => !code.isExpired && !code.isUsed).length === 0 && (
                          <div className="p-4 text-center text-muted-foreground">
                            Nenhum cupom de desconto ativo
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gift Cards */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <GiftIcon className="h-4 w-4 mr-2" />
                          Cartões Presente
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowGiftCardForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Resgatar Cartão
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockGiftCards
                          .filter(card => !card.isExpired && !card.isUsed)
                          .map(card => (
                            <div key={card.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <GiftIcon className="h-4 w-4 text-pink-500" />
                                  <div>
                                    <p className="font-medium">{card.code}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {card.amount} créditos • Válido até {formatDate(card.expiryDate)}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                  Resgatar
                                </Button>
                              </div>
                            </div>
                          ))}
                        
                        {mockGiftCards.filter(card => !card.isExpired && !card.isUsed).length === 0 && (
                          <div className="p-4 text-center text-muted-foreground">
                            Nenhum cartão presente disponível
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discount Code Form */}
                  {showDiscountForm && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Aplicar Cupom de Desconto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-code">Código do Cupom</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="discount-code" 
                              placeholder="Ex: PIXEL25" 
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <Button 
                              onClick={handleApplyDiscountCode}
                              disabled={!discountCode}
                            >
                              Aplicar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              Os cupons de desconto são aplicados automaticamente na sua próxima compra. Alguns cupons podem ter restrições de uso.
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowDiscountForm(false)}
                        >
                          Cancelar
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gift Card Form */}
                  {showGiftCardForm && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <GiftIcon className="h-4 w-4 mr-2" />
                          Resgatar Cartão Presente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gift-card-code">Código do Cartão</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="gift-card-code" 
                              placeholder="Ex: GIFT-1234-5678" 
                              value={giftCardCode}
                              onChange={(e) => setGiftCardCode(e.target.value)}
                            />
                            <Button 
                              onClick={handleRedeemGiftCard}
                              disabled={!giftCardCode || isProcessing}
                            >
                              {isProcessing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                'Resgatar'
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              Os créditos do cartão presente serão adicionados imediatamente à sua carteira após o resgate.
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowGiftCardForm(false)}
                        >
                          Cancelar
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="subscription" className="space-y-6 mt-0">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-primary" />
                    Gerenciar Assinatura
                  </h3>

                  {/* Current Subscription */}
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-amber-500/20 rounded-full">
                            {getSubscriptionTierIcon(balance.subscriptionTier)}
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center">
                              Plano {getSubscriptionTierLabel(balance.subscriptionTier)}
                              <Badge className="ml-2 bg-amber-500 text-white">Ativo</Badge>
                            </h3>
                            {balance.subscriptionEnds && (
                              <p className="text-sm text-muted-foreground">
                                Ativo até {formatDate(balance.subscriptionEnds)} ({getDaysRemaining(balance.subscriptionEnds)} dias restantes)
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Renovação Automática</span>
                            <Switch checked={balance.autoRenew} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Benefícios Incluídos:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Desconto de 10% em compras</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Efeitos especiais para pixels</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Acesso a estatísticas avançadas</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Suporte prioritário</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Crown className="h-4 w-4 mr-2" />
                          Fazer Upgrade
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                          <X className="h-4 w-4 mr-2" />
                          Cancelar Assinatura
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Plans */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Planos Disponíveis:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mockSubscriptionPlans.map(plan => (
                        <motion.div whileHover={{ scale: 1.03 }} key={plan.id}>
                          <Card className={cn(
                            "hover:shadow-lg transition-shadow relative overflow-hidden",
                            plan.isPopular && "border-primary/50 bg-primary/5",
                            selectedSubscriptionPlan === plan.id && "ring-2 ring-primary"
                          )}>
                            {plan.isPopular && (
                              <div className="absolute top-0 right-0">
                                <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                                  Popular
                                </Badge>
                              </div>
                            )}
                            
                            {plan.discount && (
                              <div className="absolute top-0 left-0">
                                <Badge className="rounded-none rounded-br-lg bg-green-500 text-white">
                                  -{plan.discount}%
                                </Badge>
                              </div>
                            )}
                            
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2">
                                {getSubscriptionTierIcon(plan.tier)}
                                {plan.name}
                              </CardTitle>
                              <CardDescription>
                                {plan.period === 'monthly' ? 'Mensal' : 'Anual'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-6">
                              <div className="mb-4">
                                <p className="text-3xl font-bold text-primary">
                                  {plan.price === 0 ? 'Grátis' : `${plan.price} créditos`}
                                </p>
                                {plan.period === 'yearly' && (
                                  <p className="text-xs text-muted-foreground">
                                    Equivalente a {Math.round(plan.price / 12)} créditos por mês
                                  </p>
                                )}
                              </div>
                              
                              <div className="space-y-2 mb-6">
                                {plan.features.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <Button 
                                className={cn(
                                  "w-full",
                                  plan.tier === balance.subscriptionTier && "bg-green-500 hover:bg-green-600"
                                )}
                                disabled={plan.tier === balance.subscriptionTier}
                                onClick={() => setSelectedSubscriptionPlan(plan.id)}
                              >
                                {plan.tier === balance.subscriptionTier ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Plano Atual
                                  </>
                                ) : (
                                  <>
                                    <Crown className="h-4 w-4 mr-2" />
                                    Selecionar
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Plan Confirmation */}
                  {selectedSubscriptionPlan && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center">
                          <Crown className="h-4 w-4 mr-2 text-amber-500" />
                          Confirmar Assinatura
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const plan = mockSubscriptionPlans.find(p => p.id === selectedSubscriptionPlan);
                          if (!plan) return null;
                          
                          return (
                            <>
                              <div className="p-4 bg-muted/20 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getSubscriptionTierIcon(plan.tier)}
                                    <span className="font-medium">{plan.name}</span>
                                  </div>
                                  <Badge variant="outline" className="text-primary border-primary/30">
                                    {plan.period === 'monthly' ? 'Mensal' : 'Anual'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Preço:</span>
                                  <span className="font-bold">{plan.price} créditos</span>
                                </div>
                                {plan.discount && (
                                  <div className="flex items-center justify-between text-sm text-green-500">
                                    <span>Desconto:</span>
                                    <span>{plan.discount}%</span>
                                  </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex items-center justify-between font-medium">
                                  <span>Total a pagar:</span>
                                  <span>{plan.price} créditos</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Saldo atual:</span>
                                  <span>{balance.credits.toLocaleString('pt-PT')} créditos</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Saldo após assinatura:</span>
                                  <span>{(balance.credits - plan.price).toLocaleString('pt-PT')} créditos</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch id="auto-renew" defaultChecked />
                                <Label htmlFor="auto-renew">Renovar automaticamente</Label>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => setSelectedSubscriptionPlan(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  className="flex-1"
                                  onClick={handleSubscribe}
                                  disabled={isProcessing || balance.credits < plan.price}
                                >
                                  {isProcessing ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Processando...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Confirmar Assinatura
                                    </>
                                  )}
                                </Button>
                              </div>
                              
                              {balance.credits < plan.price && (
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                      Saldo insuficiente. Você precisa de mais {plan.price - balance.credits} créditos para esta assinatura.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Transfer Form Dialog */}
        {showTransferForm && (
          <Dialog open={showTransferForm} onOpenChange={setShowTransferForm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                  Transferir Créditos
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">Quantidade</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    max={balance.credits}
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo: {balance.credits.toLocaleString('pt-PT')} créditos
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transfer-recipient">Destinatário</Label>
                  <Input
                    id="transfer-recipient"
                    placeholder="@username"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                  />
                </div>
                
                <div className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      As transferências são instantâneas e não podem ser revertidas. Certifique-se de que o nome de usuário está correto.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTransferForm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleTransfer}
                  disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > balance.credits || !transferRecipient || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Transferir
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}