'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { motion } from 'framer-motion';
import {
  Crown, Check, X, CreditCard, Calendar, Gift, Sparkles, Zap, Award, 
  Star, Shield, Clock, Gem, Heart, Users, Coins, Percent, Palette, 
  Lightbulb, Rocket, Layers, Bookmark, Repeat, AlertTriangle, Info, 
  HelpCircle, ArrowRight, ChevronRight, ChevronDown, ChevronUp, 
  CheckCircle, XCircle, Lock, Unlock, RefreshCw, Download, Upload, 
  Share2, MessageSquare, Bell, Settings, User, LogIn, UserPlus, 
  MapPin, Image, FileText, BarChart3, PieChart, LineChart, TrendingUp
} from 'lucide-react';

// Types
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  description: string;
  features: string[];
  highlightedFeatures: string[];
  isPopular?: boolean;
  discount?: number;
  badge?: string;
  cta: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'billing' | 'features' | 'technical';
}

// Pricing data
const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Básico',
    price: 0,
    billingPeriod: 'monthly',
    description: 'Para utilizadores casuais que querem explorar o Pixel Universe.',
    features: [
      'Acesso ao mapa interativo',
      'Compra de pixels individuais',
      'Personalização básica de pixels',
      'Participação em projetos comunitários',
      'Acesso a conquistas básicas',
      'Suporte por email'
    ],
    highlightedFeatures: [],
    cta: 'Começar Gratuitamente',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    billingPeriod: 'monthly',
    description: 'Para entusiastas que querem maximizar a sua experiência.',
    features: [
      'Tudo do plano Básico',
      'Taxa de marketplace reduzida (5% vs 7%)',
      'Pixels destacados no mapa',
      'Badge Premium exclusivo',
      'Efeitos visuais no nome',
      'Descontos em compras em massa (até 15%)',
      'Acesso a pixels de raridade especial',
      'Prioridade em leilões',
      'Notificações em tempo real',
      'Estatísticas avançadas',
      'Suporte prioritário',
      '100 créditos especiais mensais',
      'Acesso antecipado a novas funcionalidades'
    ],
    highlightedFeatures: [
      'Taxa de marketplace reduzida (5% vs 7%)',
      'Pixels destacados no mapa',
      'Descontos em compras em massa (até 15%)',
      '100 créditos especiais mensais'
    ],
    isPopular: true,
    badge: 'Mais Popular',
    cta: 'Tornar-se Premium',
  },
  {
    id: 'premium-yearly',
    name: 'Premium Anual',
    price: 99.99,
    billingPeriod: 'yearly',
    description: 'Poupe 16% com o plano anual e receba bónus exclusivos.',
    features: [
      'Tudo do plano Premium Mensal',
      'Poupe 16% no valor anual',
      'Bónus de 500 créditos especiais',
      'Pixel exclusivo de colecionador',
      'Acesso a eventos VIP',
      'Suporte prioritário 24/7',
      'Personalização avançada de perfil',
      'Análise de mercado premium'
    ],
    highlightedFeatures: [
      'Poupe 16% no valor anual',
      'Bónus de 500 créditos especiais',
      'Pixel exclusivo de colecionador'
    ],
    discount: 16,
    badge: 'Melhor Valor',
    cta: 'Subscrever Anual',
  }
];

// FAQ data
const faqs: FAQ[] = [
  {
    question: 'O que é o Pixel Universe Premium?',
    answer: 'O Pixel Universe Premium é uma subscrição que oferece vantagens exclusivas, como taxas reduzidas no marketplace, pixels destacados, descontos em compras em massa, créditos especiais mensais e muito mais. É ideal para utilizadores que querem maximizar a sua experiência na plataforma.',
    category: 'general'
  },
  {
    question: 'Quanto custa o Premium?',
    answer: 'O plano Premium custa 9,99€ por mês ou 99,99€ por ano (poupando 16%). Ambos os planos oferecem os mesmos benefícios base, mas o plano anual inclui bónus adicionais como 500 créditos especiais e um pixel exclusivo de colecionador.',
    category: 'billing'
  },
  {
    question: 'Posso cancelar a minha subscrição a qualquer momento?',
    answer: 'Sim, pode cancelar a sua subscrição Premium a qualquer momento. Continuará a ter acesso aos benefícios Premium até ao final do período de faturação atual. Não fazemos reembolsos para períodos parciais.',
    category: 'billing'
  },
  {
    question: 'O que são créditos especiais e como posso usá-los?',
    answer: 'Créditos especiais são uma moeda premium que pode ser usada para comprar pixels raros, aplicar efeitos especiais, participar em leilões exclusivos e desbloquear funcionalidades avançadas. Os subscritores Premium recebem 100 créditos especiais por mês, e os subscritores anuais recebem um bónus de 500 créditos.',
    category: 'features'
  },
  {
    question: 'Como funciona a taxa reduzida no marketplace?',
    answer: 'Utilizadores normais pagam uma taxa de 7% em cada venda no marketplace. Com o Premium, esta taxa é reduzida para apenas 5%, permitindo-lhe maximizar os seus lucros em cada transação.',
    category: 'features'
  },
  {
    question: 'O que são pixels destacados?',
    answer: 'Pixels destacados têm maior visibilidade no mapa, com efeitos visuais especiais e prioridade nos resultados de pesquisa. Isto aumenta significativamente a probabilidade de os seus pixels serem vistos e comprados por outros utilizadores.',
    category: 'features'
  },
  {
    question: 'Como funcionam os descontos em compras em massa?',
    answer: 'Os subscritores Premium recebem descontos progressivos ao comprar múltiplos pixels numa única transação: 5% para 5-10 pixels, 10% para 11-20 pixels, e 15% para mais de 20 pixels. Estes descontos são aplicados automaticamente no checkout.',
    category: 'features'
  },
  {
    question: 'Posso mudar entre planos mensais e anuais?',
    answer: 'Sim, pode mudar entre planos a qualquer momento. Se mudar de mensal para anual, será cobrado o valor anual completo. Se mudar de anual para mensal, a alteração entrará em vigor após o término do seu período anual atual.',
    category: 'billing'
  },
  {
    question: 'O que acontece aos meus benefícios Premium se cancelar?',
    answer: 'Se cancelar a sua subscrição Premium, manterá todos os pixels, créditos e itens adquiridos. No entanto, perderá acesso a funcionalidades exclusivas como pixels destacados, taxas reduzidas e descontos em massa. Os seus créditos especiais permanecerão na sua conta, mas não receberá mais créditos mensais.',
    category: 'billing'
  },
  {
    question: 'Existe um período experimental?',
    answer: 'Sim, oferecemos um período experimental de 7 dias para novos subscritores Premium. Durante este período, pode experimentar todos os benefícios Premium e cancelar sem qualquer custo se não estiver satisfeito.',
    category: 'general'
  },
  {
    question: 'Como funcionam os pixels de raridade especial?',
    answer: 'Os pixels de raridade especial são localizações premium no mapa com características únicas, maior visibilidade e potencial de valorização. Normalmente, estes pixels só estão disponíveis em leilões ou eventos especiais, mas os subscritores Premium têm acesso exclusivo a comprar diretamente alguns destes pixels.',
    category: 'features'
  },
  {
    question: 'O que é a prioridade em leilões?',
    answer: 'Com a prioridade em leilões, as suas ofertas são destacadas e, em caso de empate, têm precedência sobre ofertas de utilizadores não-Premium. Também recebe notificações antecipadas sobre leilões futuros e acesso a leilões exclusivos para membros Premium.',
    category: 'features'
  }
];

// Pixel pricing data
const pixelRarityPricing = [
  { rarity: 'Comum', basePrice: 1, specialCredits: 10, description: 'Pixels básicos em áreas comuns do mapa' },
  { rarity: 'Incomum', basePrice: 2.5, specialCredits: 25, description: 'Pixels em áreas de interesse moderado' },
  { rarity: 'Raro', basePrice: 5, specialCredits: 50, description: 'Pixels em localizações populares ou históricas' },
  { rarity: 'Épico', basePrice: 10, specialCredits: 100, description: 'Pixels em pontos turísticos ou centros urbanos' },
  { rarity: 'Lendário', basePrice: 25, specialCredits: 250, description: 'Pixels em localizações icónicas ou monumentos' },
  { rarity: 'Mítico', basePrice: 50, specialCredits: 500, description: 'Pixels extremamente raros em locais únicos (limitados)' },
];

// Premium benefits data
const premiumBenefits = [
  {
    title: 'Taxa de Marketplace Reduzida',
    description: 'Apenas 5% de taxa nas vendas vs 7% para utilizadores normais',
    icon: <Percent className="h-8 w-8 text-green-500" />,
    category: 'financial'
  },
  {
    title: 'Pixels Destacados',
    description: 'Seus pixels brilham no mapa com efeitos visuais exclusivos',
    icon: <Sparkles className="h-8 w-8 text-yellow-500" />,
    category: 'visibility'
  },
  {
    title: 'Descontos em Compras em Massa',
    description: 'Até 15% de desconto ao comprar múltiplos pixels',
    icon: <Coins className="h-8 w-8 text-blue-500" />,
    category: 'financial'
  },
  {
    title: 'Créditos Especiais Mensais',
    description: '100 créditos especiais todos os meses',
    icon: <Gift className="h-8 w-8 text-purple-500" />,
    category: 'rewards'
  },
  {
    title: 'Acesso a Pixels Raros',
    description: 'Compre pixels de raridade especial antes de todos',
    icon: <Gem className="h-8 w-8 text-pink-500" />,
    category: 'exclusive'
  },
  {
    title: 'Prioridade em Leilões',
    description: 'Suas ofertas têm precedência em caso de empate',
    icon: <Award className="h-8 w-8 text-amber-500" />,
    category: 'exclusive'
  },
  {
    title: 'Badge Premium',
    description: 'Mostre seu status com um badge exclusivo no perfil',
    icon: <Crown className="h-8 w-8 text-yellow-500" />,
    category: 'cosmetic'
  },
  {
    title: 'Efeitos no Nome',
    description: 'Personalize seu nome com efeitos visuais únicos',
    icon: <Palette className="h-8 w-8 text-indigo-500" />,
    category: 'cosmetic'
  },
  {
    title: 'Estatísticas Avançadas',
    description: 'Acesso a dados detalhados sobre seus pixels e o mercado',
    icon: <BarChart3 className="h-8 w-8 text-cyan-500" />,
    category: 'tools'
  },
  {
    title: 'Notificações em Tempo Real',
    description: 'Seja alertado instantaneamente sobre atividades relevantes',
    icon: <Bell className="h-8 w-8 text-red-500" />,
    category: 'tools'
  },
  {
    title: 'Suporte Prioritário',
    description: 'Atendimento rápido e personalizado para suas dúvidas',
    icon: <MessageSquare className="h-8 w-8 text-green-500" />,
    category: 'support'
  },
  {
    title: 'Acesso Antecipado',
    description: 'Seja o primeiro a experimentar novas funcionalidades',
    icon: <Rocket className="h-8 w-8 text-orange-500" />,
    category: 'exclusive'
  }
];

export default function PremiumSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'benefits' | 'pricing' | 'faq'>('plans');
  const [faqCategory, setFaqCategory] = useState<'all' | 'general' | 'billing' | 'features' | 'technical'>('all');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { addCredits, addSpecialCredits } = useUserStore();

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Autenticação Necessária",
        description: "Por favor, inicie sessão ou crie uma conta para subscrever o Premium.",
        variant: "destructive"
      });
      return;
    }
    
    if (paymentMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvc)) {
      toast({
        title: "Informação em Falta",
        description: "Por favor, preencha todos os dados do cartão.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfetti(true);
      setPlaySuccessSound(true);
      
      // Add bonus credits
      if (billingPeriod === 'yearly') {
        addSpecialCredits(500);
      } else {
        addSpecialCredits(100);
      }
      
      toast({
        title: "Subscrição Ativada!",
        description: `Bem-vindo ao Pixel Universe Premium! A sua subscrição ${billingPeriod === 'yearly' ? 'anual' : 'mensal'} está ativa.`,
      });
      
      // Reset form
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvc('');
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  const getActivePlan = () => {
    if (billingPeriod === 'yearly') {
      return pricingPlans.find(plan => plan.id === 'premium-yearly') || pricingPlans[0];
    }
    return pricingPlans.find(plan => plan.id === selectedPlan) || pricingPlans[0];
  };

  const filteredFaqs = faqs.filter(faq => 
    faqCategory === 'all' || faq.category === faqCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto py-6 px-4 space-y-8 mb-20 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 text-sm">
              <Crown className="h-4 w-4 mr-2" />
              Pixel Universe Premium
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-gradient-gold-animated"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Eleve a Sua Experiência
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Desbloqueie todo o potencial do Pixel Universe com benefícios exclusivos, 
            taxas reduzidas e acesso a pixels raros.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white shadow-lg shadow-primary/20 button-hover-lift-glow"
              onClick={() => setActiveTab('plans')}
            >
              <Crown className="h-5 w-5 mr-2" />
              Ver Planos Premium
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/50 hover:bg-primary/10 button-hover-lift"
              onClick={() => setActiveTab('benefits')}
            >
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Explorar Benefícios
            </Button>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-14 bg-card/50 backdrop-blur-sm shadow-md">
            <TabsTrigger value="plans" className="font-headline text-base">
              <Crown className="h-5 w-5 mr-2"/>
              Planos
            </TabsTrigger>
            <TabsTrigger value="benefits" className="font-headline text-base">
              <Gift className="h-5 w-5 mr-2"/>
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="pricing" className="font-headline text-base">
              <Coins className="h-5 w-5 mr-2"/>
              Preços de Pixels
            </TabsTrigger>
            <TabsTrigger value="faq" className="font-headline text-base">
              <HelpCircle className="h-5 w-5 mr-2"/>
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-8">
            {/* Billing Toggle */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`}>Mensal</span>
                  <div className="relative">
                    <Switch
                      checked={billingPeriod === 'yearly'}
                      onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
                      className="data-[state=checked]:bg-green-500"
                    />
                    {billingPeriod === 'yearly' && (
                      <Badge className="absolute -top-8 -right-12 bg-green-500 text-white animate-bounce">
                        Poupe 16%
                      </Badge>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-primary' : 'text-muted-foreground'}`}>Anual</span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans
                .filter(plan => 
                  (billingPeriod === 'monthly' && plan.billingPeriod === 'monthly') || 
                  (billingPeriod === 'yearly' && plan.billingPeriod === 'yearly') ||
                  plan.id === 'free'
                )
                .map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      plan.isPopular ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10' : ''
                    } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* Popular Badge */}
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-primary text-primary-foreground py-1 px-4 rounded-bl-lg font-medium text-sm shadow-md">
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {plan.discount && (
                      <div className="absolute top-0 left-0">
                        <div className="bg-green-500 text-white py-1 px-4 rounded-br-lg font-medium text-sm shadow-md">
                          Poupe {plan.discount}%
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className={`pb-4 ${plan.isPopular ? 'bg-primary/10' : ''}`}>
                      <CardTitle className="text-2xl font-headline flex items-center">
                        {plan.id === 'free' ? (
                          <User className="h-6 w-6 mr-2 text-muted-foreground" />
                        ) : (
                          <Crown className="h-6 w-6 mr-2 text-primary animate-pulse" />
                        )}
                        {plan.name}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      
                      <div className="mt-4 flex items-end">
                        <span className="text-4xl font-bold">
                          {plan.price === 0 ? 'Grátis' : `${plan.price.toFixed(2)}€`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground ml-2 mb-1">
                            /{plan.billingPeriod === 'monthly' ? 'mês' : 'ano'}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-2 mt-1">
                              <Check className={`h-4 w-4 ${
                                plan.highlightedFeatures.includes(feature) 
                                  ? 'text-green-500' 
                                  : 'text-muted-foreground'
                              }`} />
                            </div>
                            <span className={`text-sm ${
                              plan.highlightedFeatures.includes(feature)
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground'
                            }`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="pt-4 pb-6">
                      {plan.id === 'free' ? (
                        <Button variant="outline" className="w-full">
                          {plan.cta}
                        </Button>
                      ) : (
                        user ? (
                          <Button 
                            className={`w-full ${plan.isPopular ? 'bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90' : ''}`}
                            onClick={() => {
                              setSelectedPlan(plan.id);
                              window.scrollTo({ top: document.getElementById('checkout-section')?.offsetTop || 0, behavior: 'smooth' });
                            }}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            {plan.cta}
                          </Button>
                        ) : (
                          <AuthModal>
                            <Button className={`w-full ${plan.isPopular ? 'bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90' : ''}`}>
                              <LogIn className="h-4 w-4 mr-2" />
                              Entrar para Subscrever
                            </Button>
                          </AuthModal>
                        )
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>

            {/* Checkout Section */}
            {user && (
              <div id="checkout-section" className="pt-8">
                <Card className="max-w-3xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-6 w-6 mr-2 text-primary" />
                      Finalizar Subscrição
                    </CardTitle>
                    <CardDescription>
                      Complete os detalhes abaixo para ativar o seu plano {getActivePlan().name}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Resumo do Pedido</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Plano</span>
                          <span className="font-medium">{getActivePlan().name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Período</span>
                          <span className="font-medium">{billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preço</span>
                          <span className="font-medium">{getActivePlan().price.toFixed(2)}€/{billingPeriod === 'monthly' ? 'mês' : 'ano'}</span>
                        </div>
                        {getActivePlan().discount && (
                          <div className="flex justify-between text-green-500">
                            <span>Desconto</span>
                            <span className="font-medium">{getActivePlan().discount}%</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{getActivePlan().price.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Método de Pagamento</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <CreditCard className="h-8 w-8 mb-2 text-blue-500" />
                            <h4 className="font-medium">Cartão</h4>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setPaymentMethod('paypal')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <svg className="h-8 w-8 mb-2 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.393 4.643h-2.19c-.524 0-.967.382-1.05.9l-1.12 7.106c-.068.437.259.834.633.834h4.607c.524 0 .968-.382 1.05-.9l.526-3.343c.068-.438.511-.82 1.036-.82h.655c4.299 0 7.665-1.747 8.647-6.797.364-1.87.196-3.038-.753-3.336z"/>
                            </svg>
                            <h4 className="font-medium">PayPal</h4>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={`cursor-pointer transition-all hover:shadow-md ${paymentMethod === 'crypto' ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => setPaymentMethod('crypto')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <svg className="h-8 w-8 mb-2 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
                            </svg>
                            <h4 className="font-medium">Crypto</h4>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Payment Details */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Número do Cartão</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="card-name">Nome no Cartão</Label>
                          <Input
                            id="card-name"
                            placeholder="NOME COMPLETO"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="card-expiry">Data de Validade</Label>
                            <Input
                              id="card-expiry"
                              placeholder="MM/AA"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                              maxLength={5}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="card-cvc">CVC</Label>
                            <Input
                              id="card-cvc"
                              placeholder="123"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod === 'paypal' && (
                      <div className="text-center p-6">
                        <svg className="h-12 w-12 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.393 4.643h-2.19c-.524 0-.967.382-1.05.9l-1.12 7.106c-.068.437.259.834.633.834h4.607c.524 0 .968-.382 1.05-.9l.526-3.343c.068-.438.511-.82 1.036-.82h.655c4.299 0 7.665-1.747 8.647-6.797.364-1.87.196-3.038-.753-3.336z"/>
                        </svg>
                        <p className="text-muted-foreground mb-4">
                          Clique no botão abaixo para continuar para o PayPal e completar o seu pagamento.
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Continuar para PayPal
                        </Button>
                      </div>
                    )}
                    
                    {paymentMethod === 'crypto' && (
                      <div className="text-center p-6">
                        <svg className="h-12 w-12 mx-auto mb-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
                        </svg>
                        <p className="text-muted-foreground mb-4">
                          Aceite pagamentos em Bitcoin, Ethereum e outras criptomoedas.
                        </p>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                          Pagar com Crypto
                        </Button>
                      </div>
                    )}
                    
                    {/* Auto-renew Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-renew"
                        checked={autoRenew}
                        onCheckedChange={setAutoRenew}
                      />
                      <Label htmlFor="auto-renew" className="text-sm">
                        Renovar automaticamente a minha subscrição
                      </Label>
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Ao clicar em "Subscrever", autoriza o Pixel Universe a cobrar o valor de {getActivePlan().price.toFixed(2)}€ 
                        {billingPeriod === 'monthly' ? ' mensalmente' : ' anualmente'} 
                        {autoRenew ? ' até que cancele' : ' por um período'}. Pode cancelar a qualquer momento nas definições da sua conta.
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancelar</Button>
                    <Button 
                      onClick={handleSubscribe}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          A processar...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Subscrever {getActivePlan().name}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumBenefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-full bg-primary/10 mb-4">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Testimonials */}
            <div className="py-8">
              <h2 className="text-3xl font-bold text-center mb-8 font-headline text-gradient-gold">O Que Dizem os Nossos Utilizadores Premium</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                      </div>
                      <p className="italic mb-4">"Os descontos em compras em massa e a taxa reduzida no marketplace já pagaram a minha subscrição várias vezes. Melhor investimento que fiz no Pixel Universe!"</p>
                      <div>
                        <p className="font-semibold">Maria S.</p>
                        <p className="text-sm text-muted-foreground">Membro Premium há 6 meses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                      </div>
                      <p className="italic mb-4">"O acesso a pixels raros deu-me uma vantagem incrível. Consegui adquirir localizações premium antes de todos e já valorizaram mais de 300%!"</p>
                      <div>
                        <p className="font-semibold">João P.</p>
                        <p className="text-sm text-muted-foreground">Membro Premium há 1 ano</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                        <Star className="h-6 w-6 text-yellow-500 inline-block" />
                      </div>
                      <p className="italic mb-4">"Os créditos especiais mensais e os efeitos visuais exclusivos tornaram a minha experiência muito mais divertida. Vale cada cêntimo!"</p>
                      <div>
                        <p className="font-semibold">Ana R.</p>
                        <p className="text-sm text-muted-foreground">Membro Premium há 3 meses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* CTA */}
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 font-headline">Pronto para Elevar a Sua Experiência?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Junte-se a milhares de utilizadores que já desbloquearam todo o potencial do Pixel Universe com a subscrição Premium.
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white shadow-lg shadow-primary/20 button-hover-lift-glow"
                  onClick={() => setActiveTab('plans')}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Tornar-se Premium Agora
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-6 w-6 mr-2 text-primary" />
                    Preços de Pixels por Raridade
                  </CardTitle>
                  <CardDescription>
                    Cada pixel tem um preço base que varia de acordo com a sua raridade e localização no mapa.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Raridade</th>
                          <th className="text-left py-3 px-4">Preço Base (€)</th>
                          <th className="text-left py-3 px-4">Créditos Especiais</th>
                          <th className="text-left py-3 px-4">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pixelRarityPricing.map((pricing, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {pricing.rarity === 'Comum' && <Star className="h-4 w-4 mr-2 text-gray-400" />}
                                {pricing.rarity === 'Incomum' && <Star className="h-4 w-4 mr-2 text-green-400" />}
                                {pricing.rarity === 'Raro' && <Star className="h-4 w-4 mr-2 text-blue-400" />}
                                {pricing.rarity === 'Épico' && <Star className="h-4 w-4 mr-2 text-purple-400" />}
                                {pricing.rarity === 'Lendário' && <Star className="h-4 w-4 mr-2 text-orange-400" />}
                                {pricing.rarity === 'Mítico' && <Star className="h-4 w-4 mr-2 text-red-400" />}
                                {pricing.rarity}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{pricing.basePrice.toFixed(2)}€</td>
                            <td className="py-3 px-4">{pricing.specialCredits}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{pricing.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Percent className="h-6 w-6 mr-2 text-primary" />
                      Taxas de Marketplace
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-muted/20 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          <User className="h-5 w-5 mr-2 text-muted-foreground" />
                          Utilizadores Normais
                        </h3>
                        <div className="text-4xl font-bold text-red-500 mb-2">7%</div>
                        <p className="text-muted-foreground">
                          Taxa aplicada a cada venda no marketplace para utilizadores sem subscrição Premium.
                        </p>
                      </div>
                      
                      <div className="p-6 bg-primary/10 rounded-lg border border-primary/30">
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          <Crown className="h-5 w-5 mr-2 text-primary" />
                          Utilizadores Premium
                        </h3>
                        <div className="text-4xl font-bold text-green-500 mb-2">5%</div>
                        <p className="text-muted-foreground">
                          Taxa reduzida para membros Premium, permitindo maiores lucros em cada transação.
                        </p>
                        <Badge className="mt-2 bg-green-500 text-white">Poupe 2% em cada venda</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="h-6 w-6 mr-2 text-primary" />
                      Descontos em Compras em Massa (Premium)
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">5-10 pixels</h4>
                          <p className="text-sm text-muted-foreground">Compra de pequenos grupos</p>
                        </div>
                        <Badge className="bg-green-500 text-white">5% de desconto</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">11-20 pixels</h4>
                          <p className="text-sm text-muted-foreground">Compra de grupos médios</p>
                        </div>
                        <Badge className="bg-green-500 text-white">10% de desconto</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">21+ pixels</h4>
                          <p className="text-sm text-muted-foreground">Compra de grandes grupos</p>
                        </div>
                        <Badge className="bg-green-500 text-white">15% de desconto</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="font-medium">Exemplo:</span> Um utilizador Premium que compre 25 pixels comuns (1€ cada) pagaria 21,25€ em vez de 25€, poupando 3,75€ com o desconto de 15%.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              {/* FAQ Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={faqCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaqCategory('all')}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Todas
                </Button>
                <Button
                  variant={faqCategory === 'general' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaqCategory('general')}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Gerais
                </Button>
                <Button
                  variant={faqCategory === 'billing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaqCategory('billing')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Faturação
                </Button>
                <Button
                  variant={faqCategory === 'features' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaqCategory('features')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Funcionalidades
                </Button>
                <Button
                  variant={faqCategory === 'technical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFaqCategory('technical')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Técnicas
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-6 w-6 mr-2 text-primary" />
                    Perguntas Frequentes
                  </CardTitle>
                  <CardDescription>
                    Encontre respostas para as perguntas mais comuns sobre o Pixel Universe Premium.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center">
                            {faq.category === 'general' && <Info className="h-4 w-4 mr-2 text-blue-500" />}
                            {faq.category === 'billing' && <CreditCard className="h-4 w-4 mr-2 text-green-500" />}
                            {faq.category === 'features' && <Zap className="h-4 w-4 mr-2 text-purple-500" />}
                            {faq.category === 'technical' && <Settings className="h-4 w-4 mr-2 text-orange-500" />}
                            {faq.question}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              {/* Still Have Questions */}
              <Card className="mt-8 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 font-headline">Ainda Tem Dúvidas?</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Não encontrou a resposta que procurava? A nossa equipa de suporte está pronta para ajudar.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" className="bg-background/50">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar Suporte
                    </Button>
                    <Button variant="outline" className="bg-background/50">
                      <FileText className="h-4 w-4 mr-2" />
                      Consultar Documentação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}