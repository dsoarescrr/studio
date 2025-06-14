// src/data/achievements-data.tsx
import type { ReactNode } from 'react';
import {
  MapPin, Edit3, Palette, Compass, Map, Crown, BookImage, MessageSquare,
  Share2, Megaphone, Star, Sparkles, ShieldCheck, Hourglass, Rocket, Users, Eye, CheckCheck, Puzzle, Activity, Award as TrophyIcon // Renamed Award to TrophyIcon to avoid conflict
} from "lucide-react";

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementTier = {
  level: number;
  description: string;
  xpReward: number;
  creditsReward: number;
  isUnlocked: boolean;
};

export type AchievementCategory = 'pixel' | 'community' | 'exploration' | 'collection' | 'moderation' | 'social';

export type Achievement = {
  id: string;
  name: string;
  overallDescription: string;
  icon: ReactNode;
  category: AchievementCategory;
  rarity: AchievementRarity; // Added rarity
  tiers: AchievementTier[];
};

export const achievementsData: Achievement[] = [
  {
    id: "pixel_initiate",
    name: "Iniciado dos Píxeis",
    overallDescription: "Comece a sua jornada no Pixel Universe adquirindo píxeis.",
    icon: <MapPin className="h-7 w-7" />,
    category: 'pixel',
    rarity: 'common',
    tiers: [
      { level: 1, description: "Comprou o seu primeiro píxel", xpReward: 50, creditsReward: 10, isUnlocked: true },
      { level: 2, description: "Comprou 10 píxeis", xpReward: 100, creditsReward: 25, isUnlocked: true },
      { level: 3, description: "Comprou 50 píxeis", xpReward: 250, creditsReward: 75, isUnlocked: false },
      { level: 4, description: "Comprou 100 píxeis", xpReward: 500, creditsReward: 150, isUnlocked: false },
    ],
  },
  {
    id: "pixel_artisan",
    name: "Artesão de Píxeis",
    overallDescription: "Aperfeiçoe a sua arte editando os seus píxeis.",
    icon: <Edit3 className="h-7 w-7" />,
    category: 'pixel',
    rarity: 'common',
    tiers: [
      { level: 1, description: "Editou a cor de 1 píxel", xpReward: 20, creditsReward: 5, isUnlocked: true },
      { level: 2, description: "Editou a cor de 10 píxeis", xpReward: 60, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Editou a cor de 50 píxeis", xpReward: 150, creditsReward: 40, isUnlocked: false },
      { level: 4, description: "Realizou 100 edições de cor", xpReward: 300, creditsReward: 100, isUnlocked: false },
    ],
  },
  {
    id: "color_master",
    name: "Mestre das Cores",
    overallDescription: "Mostre a sua criatividade usando uma vasta gama de cores.",
    icon: <Palette className="h-7 w-7" />,
    category: 'pixel',
    rarity: 'uncommon',
    tiers: [
      { level: 1, description: "Usou 5 cores diferentes", xpReward: 30, creditsReward: 5, isUnlocked: true },
      { level: 2, description: "Usou 15 cores diferentes", xpReward: 70, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Usou 30 cores diferentes", xpReward: 150, creditsReward: 40, isUnlocked: false },
      { level: 4, description: "Usou 50 cores diferentes (Paleta de Mestre)", xpReward: 300, creditsReward: 100, isUnlocked: false },
    ],
  },
  {
    id: "territory_pioneer",
    name: "Desbravador de Territórios",
    overallDescription: "Aventure-se e interaja com diferentes regiões do mapa.",
    icon: <Compass className="h-7 w-7" />,
    category: 'exploration',
    rarity: 'uncommon',
    tiers: [
      { level: 1, description: "Visitou 3 regiões diferentes", xpReward: 60, creditsReward: 15, isUnlocked: true },
      { level: 2, description: "Interagiu com píxeis em 3 regiões", xpReward: 120, creditsReward: 35, isUnlocked: false },
      { level: 3, description: "Visitou 7 regiões diferentes", xpReward: 200, creditsReward: 60, isUnlocked: false },
      { level: 4, description: "Interagiu com píxeis em todas as regiões principais", xpReward: 400, creditsReward: 120, isUnlocked: false },
    ],
  },
  {
    id: "pixel_cartographer",
    name: "Cartógrafo Pixelizado",
    overallDescription: "Deixe a sua marca possuindo territórios pixelizados por todo o mapa de Portugal.",
    icon: <Map className="h-7 w-7" />,
    category: 'exploration',
    rarity: 'rare',
    tiers: [
      { level: 1, description: "Explorador Regional - Possui píxeis em pelo menos 2 regiões distintas.", xpReward: 75, creditsReward: 20, isUnlocked: false },
      { level: 2, description: "Conhecedor Territorial - Possui píxeis em pelo menos 3 regiões distintas.", xpReward: 150, creditsReward: 45, isUnlocked: false },
      { level: 3, description: "Dominador Continental - Possui píxeis em 5 regiões continentais distintas.", xpReward: 300, creditsReward: 100, isUnlocked: false },
      { level: 4, description: "Mestre do Atlas - Possui píxeis em todas as regiões principais (continente e ilhas).", xpReward: 600, creditsReward: 200, isUnlocked: false },
    ],
  },
  {
    id: "pixel_tycoon",
    name: "Magnata dos Píxeis",
    overallDescription: "Acumule uma vasta coleção de píxeis e demonstre o seu império.",
    icon: <Crown className="h-7 w-7" />,
    category: 'collection',
    rarity: 'epic',
    tiers: [
      { level: 1, description: "Possui 100 píxeis", xpReward: 200, creditsReward: 50, isUnlocked: false },
      { level: 2, description: "Possui 500 píxeis", xpReward: 500, creditsReward: 150, isUnlocked: false },
      { level: 3, description: "Possui 1000 píxeis", xpReward: 1000, creditsReward: 300, isUnlocked: false },
      { level: 4, description: "Possui 2500 píxeis (Lenda dos Píxeis)", xpReward: 2500, creditsReward: 750, isUnlocked: false },
    ],
  },
  {
    id: "album_curator",
    name: "Curador de Álbuns",
    overallDescription: "Organize as suas obras-primas pixelizadas em álbuns temáticos.",
    icon: <BookImage className="h-7 w-7" />,
    category: 'collection',
    rarity: 'uncommon',
    tiers: [
      { level: 1, description: "Primeiro Álbum Criado", xpReward: 40, creditsReward: 10, isUnlocked: false },
      { level: 2, description: "Colecionador Organizado (3 álbuns)", xpReward: 100, creditsReward: 25, isUnlocked: false },
      { level: 3, description: "Mestre Arquivista (5 álbuns)", xpReward: 200, creditsReward: 60, isUnlocked: false },
    ],
  },
  {
    id: "community_voice",
    name: "Voz da Comunidade",
    overallDescription: "Partilhe as suas opiniões e interaja nas publicações.",
    icon: <MessageSquare className="h-7 w-7" />,
    category: 'community',
    rarity: 'common',
    tiers: [
      { level: 1, description: "Fez o seu primeiro comentário", xpReward: 15, creditsReward: 5, isUnlocked: true },
      { level: 2, description: "Fez 10 comentários construtivos", xpReward: 50, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Fez 50 comentários", xpReward: 120, creditsReward: 30, isUnlocked: false },
      { level: 4, description: "Recebeu 20 'gostos' nos seus comentários", xpReward: 200, creditsReward: 50, isUnlocked: false },
    ],
  },
   {
    id: "pixel_ambassador",
    name: "Embaixador dos Píxeis",
    overallDescription: "Traga os seus amigos para o Pixel Universe e expanda a nossa comunidade.",
    icon: <Users className="h-7 w-7" />, // Changed from Share2 to Users
    category: 'community',
    rarity: 'rare',
    tiers: [
      { level: 1, description: "Convidou 1 amigo que se registou", xpReward: 50, creditsReward: 10, isUnlocked: false },
      { level: 2, description: "Convidou 5 amigos que se registaram", xpReward: 150, creditsReward: 30, isUnlocked: false },
      { level: 3, description: "Convidou 10 amigos (Catalisador Comunitário)", xpReward: 300, creditsReward: 75, isUnlocked: false },
    ],
  },
  {
    id: "social_sharer",
    name: "Arauto das Redes",
    overallDescription: "Partilhe as suas criações e conquistas do Pixel Universe com o mundo!",
    icon: <Megaphone className="h-7 w-7" />,
    category: 'social', // Changed category
    rarity: 'uncommon',
    tiers: [
      { level: 1, description: "Partilhou o Pixel Universe 1 vez numa rede social", xpReward: 25, creditsReward: 5, isUnlocked: false },
      { level: 2, description: "Partilhou o Pixel Universe 5 vezes", xpReward: 70, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Partilhou o Pixel Universe 10 vezes (Mestre da Partilha)", xpReward: 150, creditsReward: 40, isUnlocked: false },
    ],
  },
  {
    id: "community_star",
    name: "Estrela da Comunidade",
    overallDescription: "Envolva-se, publique e seja reconhecido pela comunidade.",
    icon: <Star className="h-7 w-7" />,
    category: 'community',
    rarity: 'rare',
    tiers: [
      { level: 1, description: "Recebeu 10 'gostos' em publicações", xpReward: 40, creditsReward: 10, isUnlocked: true },
      { level: 2, description: "Recebeu 50 'gostos' em publicações", xpReward: 90, creditsReward: 25, isUnlocked: false },
      { level: 3, description: "Participou ativamente num evento comunitário", xpReward: 180, creditsReward: 60, isUnlocked: false },
      { level: 4, description: "Teve uma publicação com mais de 100 'gostos'", xpReward: 350, creditsReward: 100, isUnlocked: false },
    ],
  },
  {
    id: "legendary_collector",
    name: "Colecionador Lendário",
    overallDescription: "Obtenha os píxeis mais raros e cobiçados do universo.",
    icon: <Sparkles className="h-7 w-7" />,
    category: 'collection',
    rarity: 'epic',
    tiers: [
      { level: 1, description: "Possui um píxel 'Featured'", xpReward: 150, creditsReward: 50, isUnlocked: false },
      { level: 2, description: "Completou um conjunto de píxeis temático", xpReward: 350, creditsReward: 120, isUnlocked: false },
      { level: 3, description: "Possui 3 píxeis 'Featured' diferentes", xpReward: 700, creditsReward: 250, isUnlocked: false },
    ],
  },
   {
    id: "master_guardian",
    name: "Guardião Mestre",
    overallDescription: "Proteja e mantenha a ordem no universo dos píxeis.",
    icon: <ShieldCheck className="h-7 w-7" />,
    category: 'moderation',
    rarity: 'rare',
    tiers: [
      { level: 1, description: "Reportou uma infração validada", xpReward: 70, creditsReward: 20, isUnlocked: false },
      { level: 2, description: "Ajudou a resolver uma disputa comunitária", xpReward: 150, creditsReward: 50, isUnlocked: false },
      { level: 3, description: "Reportou 5 infrações validadas", xpReward: 300, creditsReward: 100, isUnlocked: false },
    ],
  },
  {
    id: "time_virtuoso",
    name: "Virtuoso do Tempo Pixel",
    overallDescription: "Dedique o seu tempo ao Pixel Universe e seja recompensado.",
    icon: <Hourglass className="h-7 w-7" />,
    category: 'social',
    rarity: 'uncommon',
    tiers: [
      { level: 1, description: "Viajante Temporal: 1 hora online", xpReward: 30, creditsReward: 5, isUnlocked: true },
      { level: 2, description: "Explorador Cronometrado: 5 horas online", xpReward: 75, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Mestre das Horas: 24 horas online", xpReward: 200, creditsReward: 50, isUnlocked: false },
      { level: 4, description: "Lenda do Éter: 100 horas online", xpReward: 500, creditsReward: 150, isUnlocked: false },
    ],
  },
  {
    id: "pixel_universe_pioneer",
    name: "Pioneiro do Pixel Universe",
    overallDescription: "Por estar entre os primeiros a explorar este universo.",
    icon: <Rocket className="h-7 w-7" />,
    category: 'exploration',
    rarity: 'epic',
    tiers: [
      { level: 1, description: "Juntou-se durante a fase Beta", xpReward: 100, creditsReward: 50, isUnlocked: true },
    ],
  },
  {
    id: "universe_conqueror",
    name: "Universo Conquistado",
    overallDescription: "Atingiu o auge do domínio no Pixel Universe.",
    icon: <TrophyIcon className="h-7 w-7 text-amber-400" />, // Using Award as TrophyIcon
    category: 'collection',
    rarity: 'legendary',
    tiers: [
      { level: 1, description: "Alcançou o nível máximo de jogador", xpReward: 1000, creditsReward: 500, isUnlocked: false },
      { level: 2, description: "Possui 5 píxeis Lendários", xpReward: 2000, creditsReward: 1000, isUnlocked: false },
      { level: 3, description: "Completou 90% de todas as outras conquistas", xpReward: 5000, creditsReward: 2500, isUnlocked: false },
    ],
  },
];
