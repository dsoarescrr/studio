'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { 
  HelpCircle, Search, Book, FileText, MessageSquare, Video, 
  ChevronRight, ExternalLink, ThumbsUp, ThumbsDown, Mail, 
  Phone, Globe, Clock, Calendar, Users, Star, Info, 
  AlertTriangle, CheckCircle, ArrowRight, Lightbulb, 
  BookOpen, Compass, Map, Zap, Award, Gift, Download, 
  Share2, Copy, Send, Play, Pause, Sparkles, Bookmark, Coins, TrendingUp, ShoppingCart, Trophy, RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { achievementsData, type Achievement, type AchievementCategory, type AchievementRarity } from '@/data/achievements-data';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Component for the Grid icon since it's not in lucide-react by default
const Grid = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

// Component for the User icon since it's not in lucide-react by default
const User = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Palette = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="10.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.648 0-.926-.746-1.648-1.648-1.648-.926 0-1.648-.746-1.648-1.648 0-.926.746-1.648 1.648-1.648.926 0 1.648-.746 1.648-1.648 0-.926-.746-1.648-1.648-1.648.926 0 1.648-.746 1.648-1.648 0-.926-.746-1.648-1.648-1.648.926 0 1.648-.746 1.648-1.648C13.648 2.746 12.926 2 12 2z" />
  </svg>
);

// FAQ Data
const faqCategories = [
  {
    id: 'getting-started',
    name: 'Primeiros Passos',
    icon: <Compass className="h-4 w-4" />,
    questions: [
      {
        question: 'Como começar a usar o Pixel Universe?',
        answer: 'Para começar, explore o mapa interativo de Portugal, identifique pixels que deseja adquirir, e use seus créditos para comprá-los. Após a compra, você pode personalizar seus pixels com cores, imagens e descrições. Participe da comunidade interagindo com outros usuários e desbloqueie conquistas para ganhar recompensas.'
      },
      {
        question: 'Como navegar pelo mapa?',
        answer: 'Use os controles de zoom (+ e -) para aproximar ou afastar. Clique e arraste para mover o mapa. Clique em um pixel para ver seus detalhes e, se disponível, comprá-lo. Você também pode usar o botão de reset para voltar à visão padrão do mapa.'
      },
      {
        question: 'Como comprar meu primeiro pixel?',
        answer: 'Navegue pelo mapa até encontrar um pixel disponível (não comprado por outro usuário). Clique nele para abrir o modal de detalhes e clique no botão "Comprar". Escolha seu método de pagamento (créditos regulares ou especiais) e confirme a compra. Após a compra, você pode personalizar seu pixel.'
      }
    ]
  },
  {
    id: 'general',
    name: 'Geral',
    icon: <Info className="h-4 w-4" />,
    questions: [
      {
        question: 'O que é o Pixel Universe?',
        answer: 'O Pixel Universe é uma plataforma interativa que permite aos utilizadores comprar, personalizar e colecionar pixels num mapa digital de Portugal. Cada pixel é único e pode ser personalizado com cores, imagens e descrições.'
      },
      {
        question: 'Como posso começar a utilizar o Pixel Universe?',
        answer: 'Para começar, basta registar-se na plataforma, explorar o mapa interativo e escolher os pixels que deseja adquirir. Após a compra, pode personalizar os seus pixels e partilhá-los com a comunidade.'
      },
      {
        question: 'O que são créditos e como posso obtê-los?',
        answer: 'Créditos são a moeda virtual do Pixel Universe, utilizados para comprar pixels e recursos. Pode obter créditos através de compras na plataforma, participação em eventos, desbloqueio de conquistas ou interações diárias com a aplicação.'
      },
      {
        question: 'O que são créditos especiais?',
        answer: 'Créditos especiais são uma moeda premium que permite adquirir pixels raros, efeitos exclusivos e recursos limitados. Podem ser obtidos através de compras, eventos especiais ou como recompensa por conquistas de alto nível.'
      },
      {
        question: 'Como funciona o sistema de níveis?',
        answer: 'Ao interagir com a plataforma, você ganha XP (pontos de experiência). Ao acumular XP suficiente, você sobe de nível. Níveis mais altos desbloqueiam recursos exclusivos, aumentam seus limites de compra e melhoram sua reputação na comunidade.'
      },
      {
        question: 'O que são conquistas?',
        answer: 'Conquistas são recompensas por atingir certos objetivos na plataforma. Elas variam desde ações simples como comprar seu primeiro pixel até feitos mais complexos como possuir pixels em todas as regiões de Portugal. Cada conquista concede XP e créditos como recompensa.'
      }
    ]
  },
  {
    id: 'pixels',
    name: 'Pixels',
    icon: <Grid className="h-4 w-4" />,
    questions: [
      {
        question: 'Como posso comprar um pixel?',
        answer: 'Para comprar um pixel, navegue pelo mapa interativo, selecione um pixel disponível e clique nele. Será apresentada uma janela com informações sobre o pixel e a opção de compra. Confirme a transação utilizando os seus créditos.'
      },
      {
        question: 'Posso personalizar os meus pixels?',
        answer: 'Sim! Após adquirir um pixel, pode personalizá-lo alterando a cor, adicionando uma imagem miniatura, definindo um título, descrição e tags. Pixels de raridade superior permitem personalizações mais avançadas.'
      },
      {
        question: 'O que são as diferentes raridades de pixels?',
        answer: 'Os pixels têm diferentes níveis de raridade: Comum, Incomum, Raro, Épico e Lendário. A raridade afeta o preço, as opções de personalização disponíveis e o potencial de valorização do pixel.'
      },
      {
        question: 'Posso vender ou trocar os meus pixels?',
        answer: 'Sim, o Pixel Universe inclui um marketplace onde pode colocar os seus pixels à venda por um preço fixo, em leilão ou aceitar ofertas de outros utilizadores. Também é possível realizar trocas diretas com outros colecionadores.'
      },
      {
        question: 'O que são pixels raros?',
        answer: 'Pixels raros são aqueles com características especiais, como localização em pontos históricos, culturais ou turísticos importantes. Eles são classificados em diferentes níveis de raridade: Comum, Incomum, Raro, Épico e Lendário. Quanto mais raro, maior seu valor e potencial de valorização.'
      },
      {
        question: 'Como proteger meus pixels?',
        answer: 'Você pode ativar a proteção de pixel nas configurações de personalização. Pixels protegidos não podem ser alterados sem sua autorização, mesmo que sejam vendidos. Também oferecemos seguro de pixel como opção adicional para garantir compensação em caso de problemas.'
      },
      {
        question: 'Como aumentar o valor dos meus pixels?',
        answer: 'Para aumentar o valor dos seus pixels, personalize-os com cores atraentes, imagens e descrições detalhadas. Adicione efeitos especiais como animação ou interatividade. Pixels em localizações populares ou que formam coleções temáticas tendem a valorizar mais. Promova seus pixels na comunidade e mantenha-os ativos.'
      }
    ]
  },
  {
    id: 'account',
    name: 'Conta',
    icon: <User className="h-4 w-4" />,
    questions: [
      {
        question: 'Como posso alterar a minha password?',
        answer: 'Para alterar a sua password, aceda às Definições da sua conta, selecione a secção "Segurança" e clique em "Alterar Password". Será necessário introduzir a password atual e a nova password.'
      },
      {
        question: 'Como posso recuperar a minha conta?',
        answer: 'Se esqueceu a sua password, utilize a opção "Esqueci a password" na página de login. Será enviado um email com instruções para redefinir a sua password. Se não tiver acesso ao email, contacte o suporte.'
      },
      {
        question: 'Posso ter múltiplas contas?',
        answer: 'Não recomendamos a criação de múltiplas contas, pois isso pode violar os nossos Termos de Serviço. Cada utilizador deve ter apenas uma conta associada à sua identidade.'
      },
      {
        question: 'Como personalizar meu perfil?',
        answer: 'Acesse as configurações do seu perfil para alterar sua foto, adicionar uma bio, definir sua localização e conectar suas redes sociais. Você também pode organizar seus pixels em álbuns temáticos para melhor visualização e compartilhamento.'
      },
      {
        question: 'Como ganhar mais créditos?',
        answer: 'Você pode ganhar créditos de várias formas: comprando-os diretamente, completando conquistas, participando de eventos e promoções, recebendo presentes de outros usuários, vendendo seus pixels no marketplace, ou mantendo uma sequência diária de login na plataforma.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Técnico',
    icon: <Zap className="h-4 w-4" />,
    questions: [
      {
        question: 'A aplicação funciona em todos os dispositivos?',
        answer: 'O Pixel Universe foi otimizado para funcionar em smartphones, tablets e computadores. Recomendamos a utilização de navegadores modernos como Chrome, Firefox, Safari ou Edge para a melhor experiência.'
      },
      {
        question: 'Posso utilizar o Pixel Universe offline?',
        answer: 'Algumas funcionalidades básicas estão disponíveis offline, mas a maioria das interações, como compra e venda de pixels, requer uma conexão à internet. Os dados são sincronizados automaticamente quando a conexão é restabelecida.'
      },
      {
        question: 'Como posso melhorar o desempenho da aplicação?',
        answer: 'Se notar problemas de desempenho, pode ativar o "Modo de Desempenho" nas definições. Isto reduzirá alguns efeitos visuais e animações para melhorar a velocidade em dispositivos menos potentes.'
      },
      {
        question: 'Como funciona o sistema de IA para descrição de pixels?',
        answer: 'Nossa IA analisa a localização do pixel, o contexto histórico e cultural da região, e gera uma descrição personalizada. Para usar, selecione um pixel, clique em "Editar" e depois em "Gerar com IA" ao lado do campo de descrição. A IA criará um texto único baseado nas características daquele local específico.'
      },
      {
        question: 'O Pixel Universe funciona em todos os navegadores?',
        answer: 'O Pixel Universe é otimizado para navegadores modernos como Chrome, Firefox, Safari e Edge. Recomendamos manter seu navegador atualizado para a melhor experiência. Alguns recursos avançados como efeitos 3D e animações complexas podem ter limitações em navegadores mais antigos.'
      }
    ]
  },
  {
    id: 'community',
    name: 'Comunidade',
    icon: <Users className="h-4 w-4" />,
    questions: [
      {
        question: 'Como posso participar em projetos colaborativos?',
        answer: 'Para participar em projetos colaborativos, aceda à secção "Comunidade" e explore os projetos ativos. Pode juntar-se a projetos existentes ou criar o seu próprio projeto e convidar outros utilizadores.'
      },
      {
        question: 'Existem eventos na comunidade?',
        answer: 'Sim, organizamos regularmente eventos temáticos, concursos de pixel art, desafios comunitários e leilões especiais. Fique atento às notificações e à secção de Eventos para não perder as próximas oportunidades.'
      },
      {
        question: 'Como criar um projeto colaborativo?',
        answer: 'Para iniciar um projeto colaborativo, acesse a seção "Comunidade" e clique em "Novo Projeto". Defina um tema, área do mapa e regras de participação. Você pode convidar outros usuários diretamente ou deixar o projeto aberto para qualquer interessado. Projetos colaborativos permitem que múltiplos usuários trabalhem juntos em uma área conectada do mapa.'
      },
      {
        question: 'Como destacar meus pixels na Galeria?',
        answer: 'Para aumentar a visibilidade dos seus pixels na Galeria, personalize-os com cores vibrantes, adicione descrições detalhadas e tags relevantes. Você também pode promover seus pixels pagando uma taxa em créditos para destacá-los nas seções "Em Destaque" ou "Populares". Pixels com mais interações (visualizações, curtidas, comentários) também ganham destaque naturalmente.'
      }
    ]
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: <ShoppingCart className="h-4 w-4" />,
    questions: [
      {
        question: 'Como vender meus pixels?',
        answer: 'Para vender um pixel, acesse-o no mapa ou em seu perfil, clique em "Editar" e depois em "Colocar à Venda". Defina um preço fixo ou opte por um leilão. Você também pode escolher aceitar ofertas. Após configurar os detalhes da venda, seu pixel ficará disponível no Marketplace para outros usuários.'
      },
      {
        question: 'Como funciona o sistema de leilões?',
        answer: 'No sistema de leilões, você define um preço inicial e uma duração (1 a 7 dias). Os usuários interessados fazem lances, e o maior lance ao final do período vence. Há um incremento mínimo entre lances (5% do valor atual). Você pode definir um "Preço de Compra Imediata" opcional que, se pago, encerra o leilão automaticamente.'
      },
      {
        question: 'Quais são as taxas do Marketplace?',
        answer: 'O Marketplace cobra uma taxa de 5% sobre o valor de cada venda concluída. Usuários Premium têm taxa reduzida para 3%. Promoções e destaques têm custos adicionais que variam de 10 a 100 créditos, dependendo da visibilidade desejada e duração do destaque.'
      },
      {
        question: 'Como promover meus pixels no Marketplace?',
        answer: 'Para promover seus pixels, acesse o Marketplace, selecione seu pixel e clique em "Promover". Escolha entre diferentes níveis de promoção, desde destaque básico até posição premium no topo da página. Cada nível tem um custo em créditos e duração específicos. Pixels promovidos recebem um badge especial e são mostrados em seções de destaque.'
      }
    ]
  }
];

// Tutorial Data
const tutorials = [
  {
    id: 'pixel-universe-basics',
    title: 'Fundamentos do Pixel Universe',
    description: 'Aprenda a navegar, explorar e interagir com o mapa interativo de Portugal',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'tutorial thumbnail',
    duration: '5 min',
    difficulty: 'Iniciante',
    steps: [
      { title: 'Navegação no Mapa', content: 'Aprenda a usar os controles de zoom, arrastar o mapa e localizar regiões específicas.' },
      { title: 'Entendendo a Interface', content: 'Conheça os elementos da interface: barra de navegação, painel lateral, controles de mapa e menu de ações rápidas.' },
      { title: 'Sistema de Coordenadas', content: 'Como funciona o sistema de coordenadas e como localizar pixels específicos.' },
      { title: 'Visualização de Pixels', content: 'Como visualizar detalhes de pixels, incluindo proprietário, preço e características.' },
      { title: 'Filtros e Pesquisa', content: 'Utilizando filtros para encontrar pixels por região, raridade ou status.' }
    ]
  },
  {
    id: 'buying-first-pixel',
    title: 'Comprando Seu Primeiro Pixel',
    description: 'Guia completo para adquirir e personalizar seu primeiro pixel',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'tutorial thumbnail',
    duration: '7 min',
    difficulty: 'Iniciante',
    steps: [
      { title: 'Encontrando Pixels Disponíveis', content: 'Como identificar pixels que estão disponíveis para compra no mapa.' },
      { title: 'Entendendo o Valor', content: 'Fatores que influenciam o preço dos pixels: localização, raridade e características especiais.' },
      { title: 'Processo de Compra', content: 'Passo a passo do processo de compra, desde a seleção até a confirmação.' },
      { title: 'Métodos de Pagamento', content: 'Utilizando créditos regulares, créditos especiais e opções de parcelamento.' },
      { title: 'Personalização Inicial', content: 'Primeiros passos para personalizar seu pixel recém-adquirido.' },
      { title: 'Proteção e Segurança', content: 'Como proteger seu investimento com recursos de segurança e seguro de pixel.' }
    ]
  },
  {
    id: 'pixel-art',
    title: 'Criação de Pixel Art',
    description: 'Técnicas avançadas para criar pixel art impressionante',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'tutorial thumbnail',
    duration: '12 min',
    difficulty: 'Intermédio',
    steps: [
      { title: 'Fundamentos de Design', content: 'Princípios básicos de design e teoria das cores para pixel art.' },
      { title: 'Ferramentas de Edição Avançadas', content: 'Dominando o editor de pixels com ferramentas de desenho, camadas e efeitos.' },
      { title: 'Técnicas de Sombreamento', content: 'Criando profundidade e dimensão com técnicas de sombreamento e iluminação.' },
      { title: 'Animações e Efeitos', content: 'Adicionando movimento e interatividade aos seus pixels.' },
      { title: 'Otimização de Imagens', content: 'Como criar imagens de 1x1 pixel que representem seu conceito artístico.' },
      { title: 'Integração com IA', content: 'Utilizando a IA para gerar descrições e melhorar suas criações.' }
    ]
  },
  {
    id: 'marketplace-mastery',
    title: 'Dominando o Marketplace',
    description: 'Estratégias para comprar, vender e negociar pixels com sucesso',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'tutorial thumbnail',
    duration: '10 min',
    difficulty: 'Avançado',
    steps: [
      { title: 'Análise de Mercado', content: 'Como interpretar tendências e valorizar corretamente os pixels.' },
      { title: 'Estratégias de Compra', content: 'Identificar oportunidades e pixels com potencial de valorização.' },
      { title: 'Técnicas de Venda', content: 'Maximizar o valor dos seus pixels no marketplace.' },
      { title: 'Leilões e Ofertas', content: 'Participar em leilões e negociar ofertas com outros utilizadores.' },
      { title: 'Coleções Temáticas', content: 'Criar e promover coleções temáticas para aumentar o valor.' }
    ]
  },
  {
    id: 'community-engagement',
    title: 'Engajamento Comunitário',
    description: 'Como participar ativamente e se destacar na comunidade Pixel Universe',
    thumbnail: 'https://placehold.co/300x200.png',
    dataAiHint: 'tutorial thumbnail',
    duration: '8 min',
    difficulty: 'Intermediário',
    steps: [
      { title: 'Projetos Colaborativos', content: 'Como participar e criar projetos em grupo para criar arte coletiva.' },
      { title: 'Eventos e Competições', content: 'Participando de eventos sazonais e competições temáticas.' },
      { title: 'Interação Social', content: 'Comentários, curtidas e compartilhamentos para aumentar sua visibilidade.' },
      { title: 'Criação de Álbuns', content: 'Organizando e compartilhando coleções temáticas de pixels.' },
      { title: 'Construindo Reputação', content: 'Como se tornar um membro respeitado e influente na comunidade.' }
    ]
  }
];

// Support Team Data
const supportTeam = [
  {
    name: 'Ana Oliveira',
    role: 'Suporte Técnico',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'support team member',
    specialties: ['Problemas Técnicos', 'Recuperação de Conta', 'Bugs'],
    availability: 'Seg-Sex, 9h-18h',
    languages: ['Português', 'Inglês']
  },
  {
    name: 'Miguel Santos',
    role: 'Especialista em Pixels',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'support team member',
    specialties: ['Marketplace', 'Transações', 'Personalização'],
    availability: 'Seg-Sex, 10h-19h',
    languages: ['Português', 'Espanhol']
  },
  {
    name: 'Sofia Pereira',
    role: 'Gestora de Comunidade',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'support team member',
    specialties: ['Eventos', 'Projetos Colaborativos', 'Conquistas'],
    availability: 'Ter-Sáb, 11h-20h',
    languages: ['Português', 'Inglês', 'Francês']
  },
  {
    name: 'João Ferreira',
    role: 'Especialista em Marketplace',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'support team member',
    specialties: ['Avaliação de Pixels', 'Leilões', 'Estratégias de Mercado'],
    availability: 'Seg-Sex, 12h-21h',
    languages: ['Português', 'Inglês', 'Italiano']
  }
];

// Resources Data
const resources = [
  {
    title: 'Guia Completo do Pixel Universe',
    description: 'Manual detalhado com todas as funcionalidades e dicas',
    icon: <Book className="h-5 w-5 text-primary" />,
    type: 'PDF',
    size: '2.4 MB',
    url: '#'
  },
  {
    title: 'Melhores Práticas de Pixel Art',
    description: 'Técnicas e exemplos para criar pixel art impressionante',
    icon: <Palette className="h-5 w-5 text-purple-500" />,
    type: 'PDF',
    size: '1.8 MB',
    url: '#'
  },
  {
    title: 'Guia de Conquistas',
    description: 'Lista completa de todas as conquistas e como desbloqueá-las',
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    type: 'PDF',
    size: '3.2 MB',
    url: '#'
  },
  {
    title: 'Estratégias de Investimento em Pixels',
    description: 'Análise de mercado e dicas para maximizar retornos',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    type: 'PDF',
    size: '1.2 MB',
    url: '#'
  },
  {
    title: 'Vídeos Tutoriais',
    description: 'Série de vídeos explicativos sobre todas as funcionalidades',
    icon: <Video className="h-5 w-5 text-red-500" />,
    type: 'Playlist',
    size: '15 vídeos',
    url: '#'
  },
  {
    title: 'Webinars de Pixel Art',
    description: 'Sessões ao vivo com artistas profissionais de pixel art',
    icon: <Video className="h-5 w-5 text-purple-500" />,
    type: 'Playlist',
    size: '10 vídeos',
    url: '#'
  }
];

interface HelpCenterProps {
    children: React.ReactNode;
}
  

export default function HelpCenter({ children }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [activeFaqCategory, setActiveFaqCategory] = useState('general');
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const filteredTutorials = tutorials.filter(tutorial => 
    tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutorial.steps.some(step => 
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      step.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleContactSupport = () => {
    toast({
      title: "Mensagem Enviada",
      description: "A sua mensagem foi enviada com sucesso. Responderemos em breve.",
    });
  };

  const handleDownloadResource = (resourceTitle: string) => {
    toast({
      title: "Download Iniciado",
      description: `O download de "${resourceTitle}" começou.`,
    });
  };

  const handleBookmarkTutorial = (tutorialId: string) => {
    toast({
      title: "Tutorial Guardado",
      description: "Este tutorial foi adicionado aos seus favoritos.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <DialogTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <HelpCircle className="h-8 w-8 mr-3 animate-glow" />
                  Centro de Ajuda
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  Encontre respostas, tutoriais e suporte para todas as suas dúvidas sobre o Pixel Universe
                </DialogDescription>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar ajuda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-80 bg-background/70 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(95vh-130px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-12 bg-card/50 backdrop-blur-sm shadow-md m-4">
                    <TabsTrigger value="faq" className="font-headline">
                    <Book className="h-4 w-4 mr-2"/>
                    FAQ
                    </TabsTrigger>
                    <TabsTrigger value="tutorials" className="font-headline">
                    <Video className="h-4 w-4 mr-2"/>
                    Tutoriais
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="font-headline">
                    <MessageSquare className="h-4 w-4 mr-2"/>
                    Contacto
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="font-headline">
                    <FileText className="h-4 w-4 mr-2"/>
                    Recursos
                    </TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        {/* FAQ Tab */}
                        <TabsContent value="faq" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Categories Sidebar */}
                            <Card className="lg:col-span-1 h-fit">
                                <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                    Categorias
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                <div className="space-y-1">
                                    {faqCategories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={activeFaqCategory === category.id ? "default" : "ghost"}
                                        className="w-full justify-start text-left"
                                        onClick={() => setActiveFaqCategory(category.id)}
                                    >
                                        {category.icon}
                                        <span className="ml-2">{category.name}</span>
                                        <Badge className="ml-auto">{category.questions.length}</Badge>
                                    </Button>
                                    ))}
                                </div>
                                </CardContent>
                            </Card>

                            {/* FAQ Content */}
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                <CardTitle className="text-xl flex items-center">
                                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                                    Perguntas Frequentes
                                    <Badge variant="outline" className="ml-2">
                                    {filteredFaqs.find(c => c.id === activeFaqCategory)?.questions.length || 0} perguntas
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Respostas para as dúvidas mais comuns sobre {filteredFaqs.find(c => c.id === activeFaqCategory)?.name.toLowerCase() || 'o Pixel Universe'}
                                </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <ScrollArea className="h-[60vh]">
                                    <Accordion type="single" collapsible className="w-full">
                                    {filteredFaqs.find(c => c.id === activeFaqCategory)?.questions.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                                        <AccordionTrigger className="hover:bg-muted/30 px-4 py-4 rounded-lg text-left">
                                            <div className="flex items-start">
                                            <span className="font-medium">{faq.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="bg-muted/20 p-4 rounded-lg">
                                            <p className="text-muted-foreground">{faq.answer}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                                    Útil
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                                    Não Útil
                                                </Button>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8">
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Partilhar
                                                </Button>
                                            </div>
                                            </div>
                                        </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                    </Accordion>
                                    
                                    {filteredFaqs.find(c => c.id === activeFaqCategory)?.questions.length === 0 && (
                                    <div className="text-center py-12">
                                        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Nenhuma pergunta encontrada para esta categoria.</p>
                                        <Button variant="outline" className="mt-4">
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Enviar Nova Pergunta
                                        </Button>
                                    </div>
                                    )}
                                </ScrollArea>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between">
                                <p className="text-sm text-muted-foreground">Não encontrou a sua resposta?</p>
                                <Button variant="outline" onClick={() => setActiveTab('contact')}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contactar Suporte
                                </Button>
                                </CardFooter>
                            </Card>
                            </div>
                        </TabsContent>

                        {/* Tutorials Tab */}
                        <TabsContent value="tutorials" className="mt-0 space-y-6">
                            {activeTutorial ? (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <Button variant="ghost" onClick={() => setActiveTutorial(null)} className="mb-2">
                                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                                    Voltar aos Tutoriais
                                    </Button>
                                    <CardTitle className="text-xl">
                                    {tutorials.find(t => t.id === activeTutorial)?.title}
                                    </CardTitle>
                                    <CardDescription>
                                    {tutorials.find(t => t.id === activeTutorial)?.description}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {tutorials.find(t => t.id === activeTutorial)?.duration}
                                    </Badge>
                                    <Badge variant="outline">
                                    {tutorials.find(t => t.id === activeTutorial)?.difficulty}
                                    </Badge>
                                </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-6">
                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Button size="lg" className="rounded-full w-16 h-16 flex items-center justify-center">
                                        <Play className="h-8 w-8" />
                                        </Button>
                                    </div>
                                    <img 
                                        src={tutorials.find(t => t.id === activeTutorial)?.thumbnail} 
                                        alt={tutorials.find(t => t.id === activeTutorial)?.title}
                                        className="w-full h-full object-cover"
                                        data-ai-hint={tutorials.find(t => t.id === activeTutorial)?.dataAiHint}
                                    />
                                    </div>
                                    
                                    <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Passos do Tutorial</h3>
                                    <div className="space-y-4">
                                        {tutorials.find(t => t.id === activeTutorial)?.steps.map((step, index) => (
                                        <Card key={index} className="bg-muted/20 hover:bg-muted/30 transition-colors">
                                            <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                                {index + 1}
                                                </div>
                                                <div>
                                                <h4 className="font-medium">{step.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
                                                </div>
                                            </div>
                                            </CardContent>
                                        </Card>
                                        ))}
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => handleBookmarkTutorial(activeTutorial)}>
                                        <Bookmark className="h-4 w-4 mr-2" />
                                        Guardar
                                        </Button>
                                        <Button variant="outline">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Partilhar
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center">
                                        <Button variant="ghost" size="sm">
                                            <ThumbsUp className="h-4 w-4 mr-1" />
                                            Útil
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <ThumbsDown className="h-4 w-4 mr-1" />
                                            Não Útil
                                        </Button>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTutorials.map((tutorial) => (
                                <motion.div whileHover={{ scale: 1.02 }} key={tutorial.id}>
                                    <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50" onClick={() => setActiveTutorial(tutorial.id)}>
                                    <div className="relative aspect-video">
                                        <img 
                                        src={tutorial.thumbnail} 
                                        alt={tutorial.title}
                                        className="w-full h-full object-cover rounded-t-lg"
                                        data-ai-hint={tutorial.dataAiHint}
                                        />
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                        <Badge className="bg-black/70 text-white">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {tutorial.duration}
                                        </Badge>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                        <Badge variant="outline" className="bg-black/70 text-white border-none">
                                            {tutorial.difficulty}
                                        </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="flex-1 p-4">
                                        <h3 className="text-lg font-semibold">{tutorial.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tutorial.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                            {tutorial.steps.length} passos
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="text-xs">
                                            <Play className="h-3 w-3 mr-1" />
                                            Ver Tutorial
                                        </Button>
                                        </div>
                                    </CardContent>
                                    </Card>
                                </motion.div>
                                ))}
                                
                                {filteredTutorials.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Nenhum tutorial encontrado para a sua pesquisa.</p>
                                    <Button variant="outline" className="mt-4">
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Limpar Pesquisa
                                    </Button>
                                </div>
                                )}
                            </div>
                            )}
                        </TabsContent>

                        {/* Contact Tab */}
                        <TabsContent value="contact" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Contact Form */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                <CardTitle className="text-xl flex items-center">
                                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                                    Contactar Suporte
                                </CardTitle>
                                <CardDescription>
                                    Envie-nos a sua questão e responderemos o mais rapidamente possível
                                </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome</Label>
                                        <Input id="name" placeholder="O seu nome" />
                                        <p className="text-xs text-muted-foreground">Nome completo para identificação</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="O seu email" />
                                        <p className="text-xs text-muted-foreground">Email para resposta e acompanhamento</p>
                                    </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                    <Label htmlFor="subject">Assunto</Label>
                                    <Select>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Selecione um assunto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="technical">Problema Técnico</SelectItem>
                                        <SelectItem value="account">Questão de Conta</SelectItem>
                                        <SelectItem value="billing">Pagamentos</SelectItem>
                                        <SelectItem value="feature">Sugestão de Funcionalidade</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem</Label>
                                    <Input id="message" placeholder="Descreva a sua questão em detalhe..." />
                                    <p className="text-xs text-muted-foreground">Forneça o máximo de detalhes possível para ajudarmos melhor</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                    <Label htmlFor="attachments">Anexos (opcional)</Label>
                                    <Input id="attachments" type="file" multiple />
                                    <p className="text-xs text-muted-foreground">Máximo 3 ficheiros, 5MB cada</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-4">
                                    <Checkbox id="priority" />
                                    <Label htmlFor="priority" className="text-sm">Marcar como urgente</Label>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                    <Checkbox id="copy" defaultChecked />
                                    <Label htmlFor="copy" className="text-sm">Receber cópia por email</Label>
                                    </div>
                                    
                                    <Button className="w-full" onClick={handleContactSupport}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar Mensagem
                                    </Button>
                                </form>
                                </CardContent>
                            </Card>

                            {/* Support Team */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-primary" />
                                    Equipa de Suporte
                                </CardTitle>
                                <CardDescription>
                                    Conheça os especialistas prontos para ajudar
                                </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {supportTeam.map((member, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-medium">{member.name}</h4>
                                        <p className="text-sm text-muted-foreground">{member.role}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                        {member.specialties.map((specialty, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                            {specialty}
                                            </Badge>
                                        ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {member.availability}
                                        </p>
                                    </div>
                                    </div>
                                ))}
                                
                                <Separator />
                                
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Outras Formas de Contacto</h4>
                                    <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full justify-start text-sm" asChild>
                                      <a href="mailto:suporte@pixeluniverse.pt">
                                        <Mail className="h-4 w-4 mr-2 text-blue-500" />
                                        <span>suporte@pixeluniverse.pt</span>
                                      </a>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full justify-start text-sm" asChild>
                                      <a href="tel:+351210123456">
                                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                                        <span>+351 210 123 456</span>
                                      </a>
                                    </Button>
                                    <div className="flex items-center text-sm p-2">
                                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                        <span>Seg-Sex, 9h-20h</span>
                                    </div>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                            </div>
                        </TabsContent>
                        {/* Resources Tab */}
                        <TabsContent value="resources" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Downloads */}
                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Download className="h-5 w-5 mr-2 text-primary" />
                                    Downloads
                                </CardTitle>
                                <CardDescription>
                                    Guias e recursos para download
                                </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <ScrollArea className="h-[40vh]">
                                    <div className="space-y-3">
                                    {resources.map((resource, index) => (
                                        <Card key={index} className="bg-muted/20 hover:bg-muted/30 transition-colors">
                                        <CardContent className="p-4 hover:shadow-md transition-all">
                                            <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                {resource.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{resource.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {resource.type} • {resource.size}
                                                </Badge>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleDownloadResource(resource.title)}
                                                >
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Download
                                                </Button>
                                                </div>
                                            </div>
                                            </div>
                                        </CardContent>
                                        </Card>
                                    ))}
                                    </div>
                                </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Glossary */}
                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                    Glossário
                                </CardTitle>
                                <CardDescription>
                                    Termos e conceitos do Pixel Universe
                                </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <ScrollArea className="h-[40vh]">
                                    <div className="space-y-3">
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Pixel</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Unidade básica do mapa digital que pode ser comprada, personalizada e colecionada.</p>
                                        <Badge variant="outline" className="mt-2 text-xs">Elemento Fundamental</Badge>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Créditos</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Moeda virtual utilizada para comprar pixels e recursos na plataforma.</p>
                                        <Badge variant="outline" className="mt-2 text-xs">Moeda Principal</Badge>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Créditos Especiais</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Moeda premium para adquirir pixels raros e recursos exclusivos.</p>
                                        <Badge variant="outline" className="mt-2 text-xs">Moeda Premium</Badge>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Raridade</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Classificação que determina o valor e exclusividade de um pixel (Comum, Incomum, Raro, Épico, Lendário).</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          <Badge variant="outline" className="text-xs text-gray-400">Comum</Badge>
                                          <Badge variant="outline" className="text-xs text-green-400">Incomum</Badge>
                                          <Badge variant="outline" className="text-xs text-blue-400">Raro</Badge>
                                          <Badge variant="outline" className="text-xs text-purple-400">Épico</Badge>
                                          <Badge variant="outline" className="text-xs text-amber-400">Lendário</Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Marketplace</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Sistema de compra, venda e troca de pixels entre utilizadores.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Projeto Colaborativo</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Iniciativa onde múltiplos utilizadores trabalham juntos para criar arte em pixels contíguos.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Conquista</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Recompensa por atingir determinados objetivos na plataforma, oferecendo XP e créditos.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Pixel Art</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Forma de arte digital onde imagens são criadas ao nível do pixel, utilizando precisão e limitação de cores para criar estilo visual distinto.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Álbum</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Coleção organizada de pixels com tema ou propósito comum, criada por um usuário para exibição e compartilhamento.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Leilão</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Sistema de venda onde múltiplos usuários podem dar lances em um pixel, com o maior lance vencendo após o período determinado.</p>
                                    </div>
                                    <div className="p-3 border-b border-border/50">
                                        <h4 className="font-medium">Pixel Interativo</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Pixel com funcionalidades especiais que respondem a interações do usuário, como cliques ou passagem do mouse.</p>
                                    </div>
                                    </div>
                                </ScrollArea>
                                </CardContent>
                            </Card>
                            </div>
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}