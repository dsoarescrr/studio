'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUserStore, useSettingsStore } from '@/lib/store';
import { 
  CheckCircle2, Lock, Award, Edit3, Users, Eye, Map, Compass, Puzzle, Activity, 
  CheckCheck, ShieldCheck, Share2, Trophy, Search, Filter, SortAsc, Star, 
  Flame, Target, Crown, Sparkles, TrendingUp, Calendar, Clock, Gift, Zap,
  BarChart3, PieChart, LineChart, Medal, Gem, Heart, ThumbsUp, MessageSquare,
  BookImage, Palette, MapPin, Globe, Rocket, Settings, Bell, Download, Coins,
  Lightbulb, Megaphone
} from "lucide-react";
import { achievementsData, type Achievement, type AchievementCategory, type AchievementRarity } from '@/data/achievements-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';

type FilterValue = AchievementCategory | 'all' | 'completed' | 'locked';
type SortValue = 'name' | 'rarity' | 'progress' | 'recent';

const filterCategories: { label: string; value: FilterValue; icon: React.ReactNode; color: string }[] = [
  { label: "Todas", value: 'all', icon: <Eye className="h-4 w-4" />, color: "text-foreground" },
  { label: "Completas", value: 'completed', icon: <CheckCheck className="h-4 w-4" />, color: "text-green-500" },
  { label: "Bloqueadas", value: 'locked', icon: <Lock className="h-4 w-4" />, color: "text-muted-foreground" },
  { label: "Píxeis", value: 'pixel', icon: <Edit3 className="h-4 w-4" />, color: "text-primary" },
  { label: "Comunidade", value: 'community', icon: <Users className="h-4 w-4" />, color: "text-blue-500" },
  { label: "Exploração", value: 'exploration', icon: <Compass className="h-4 w-4" />, color: "text-green-500" },
  { label: "Coleção", value: 'collection', icon: <Puzzle className="h-4 w-4" />, color: "text-purple-500" },
  { label: "Social", value: 'social', icon: <Activity className="h-4 w-4" />, color: "text-orange-500" },
  { label: "Moderação", value: 'moderation', icon: <ShieldCheck className="h-4 w-4" />, color: "text-red-500" },
];

const sortOptions: { label: string; value: SortValue; icon: React.ReactNode }[] = [
  { label: "Nome", value: 'name', icon: <SortAsc className="h-4 w-4" /> },
  { label: "Raridade", value: 'rarity', icon: <Star className="h-4 w-4" /> },
  { label: "Progresso", value: 'progress', icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Recentes", value: 'recent', icon: <Clock className="h-4 w-4" /> },
];

const rarityStyles: Record<AchievementRarity, { 
  borderClass: string; 
  badgeClass: string; 
  textClass: string; 
  label: string; 
  bgClass: string;
  glowClass: string;
}> = {
  common: { 
    borderClass: 'border-slate-400/60 hover:border-slate-400', 
    badgeClass: 'bg-slate-600 text-slate-200 border-slate-500', 
    textClass: 'text-slate-400', 
    label: 'Comum',
    bgClass: 'bg-slate-500/10',
    glowClass: 'hover:shadow-slate-400/20'
  },
  uncommon: { 
    borderClass: 'border-green-500/60 hover:border-green-500', 
    badgeClass: 'bg-green-700 text-green-200 border-green-600', 
    textClass: 'text-green-400', 
    label: 'Incomum',
    bgClass: 'bg-green-500/10',
    glowClass: 'hover:shadow-green-400/20'
  },
  rare: { 
    borderClass: 'border-blue-500/60 hover:border-blue-500', 
    badgeClass: 'bg-blue-700 text-blue-200 border-blue-600', 
    textClass: 'text-blue-400', 
    label: 'Rara',
    bgClass: 'bg-blue-500/10',
    glowClass: 'hover:shadow-blue-400/20'
  },
  epic: { 
    borderClass: 'border-purple-500/60 hover:border-purple-500', 
    badgeClass: 'bg-purple-700 text-purple-200 border-purple-600', 
    textClass: 'text-purple-400', 
    label: 'Épica',
    bgClass: 'bg-purple-500/10',
    glowClass: 'hover:shadow-purple-400/20'
  },
  legendary: { 
    borderClass: 'border-amber-400/60 hover:border-amber-400', 
    badgeClass: 'bg-amber-600 text-amber-100 border-amber-500', 
    textClass: 'text-amber-300', 
    label: 'Lendária',
    bgClass: 'bg-amber-500/10',
    glowClass: 'hover:shadow-amber-400/30'
  },
};

// Enhanced user progress data
const userProgress = {
  totalAchievements: achievementsData.length,
  unlockedAchievements: 8,
  totalXP: 2450,
  totalCredits: 850,
  completionPercentage: 35,
  recentUnlocks: [
    { id: 'color_master', unlockedAt: '2024-03-15T10:30:00Z', tier: 2 },
    { id: 'community_star', unlockedAt: '2024-03-14T15:45:00Z', tier: 1 },
    { id: 'time_virtuoso', unlockedAt: '2024-03-13T09:20:00Z', tier: 3 },
  ],
  streakDays: 12,
  nextMilestone: { target: 10, current: 8, reward: '500 XP + Badge Especial' }
};

export default function AchievementsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [sortBy, setSortBy] = useState<SortValue>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const { addCredits, addXp, unlockAchievement, achievements } = useUserStore();
  const { soundEffects } = useSettingsStore();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [playRewardSound, setPlayRewardSound] = useState(false);
  const [recentlyClaimedIds, setRecentlyClaimedIds] = useState<string[]>([]);

  const handleShareAchievement = (achievementName: string) => {
    toast({
      title: "Conquista Partilhada!",
      description: `Partilhaste a conquista "${achievementName}" nas redes sociais.`,
    });
  };

  const handleClaimReward = (id: string, tier: number) => {
    if (recentlyClaimedIds.includes(`${id}-${tier}`)) {
      toast({
        title: "Já Reclamado",
        description: "Esta recompensa já foi reclamada.",
        variant: "destructive"
      });
      return;
    }
    
    setShowConfetti(true);
    setPlayRewardSound(true);
    setRecentlyClaimedIds(prev => [...prev, `${id}-${tier}`]);
    
    toast({
      title: "Conquista Desbloqueada!",
      description: "Você desbloqueou a conquista 'Personalizador de Perfil'!",
    });
    
    // Reward the user
    addCredits(25);
    addXp(50);
    unlockAchievement();
  };

  // Filter and sort achievements
  const filteredAchievements = achievementsData
    .filter(ach => {
      // Search filter
      if (searchQuery && !ach.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !ach.overallDescription.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (activeFilter === 'all') return true;
      if (activeFilter === 'completed') return ach.tiers.some(t => t.isUnlocked);
      if (activeFilter === 'locked') return !ach.tiers.some(t => t.isUnlocked);
      return ach.category === activeFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'progress':
          const aProgress = a.tiers.filter(t => t.isUnlocked).length / a.tiers.length;
          const bProgress = b.tiers.filter(t => t.isUnlocked).length / b.tiers.length;
          return bProgress - aProgress;
        case 'recent':
          // Mock recent sorting - in real app would use unlock timestamps
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-colors duration-300">
      <SoundEffect 
        src={SOUND_EFFECTS.ACHIEVEMENT} 
        play={playRewardSound} 
        onEnd={() => setPlayRewardSound(false)} 
      />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
        {/* Enhanced Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center relative">
                  <Trophy className="h-8 w-8 mr-3 animate-glow" />
                  Quadro de Conquistas
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Desbloqueie conquistas épicas, ganhe XP e créditos para dominar o Pixel Universe!
                </CardDescription>
              </div>
              
              {/* Enhanced Progress Overview */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-primary">{userProgress.unlockedAchievements}</p>
                  <p className="text-xs text-muted-foreground">Desbloqueadas</p>
                </Card>
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-accent">{userProgress.completionPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Progresso</p>
                </Card>
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-green-500">{userProgress.streakDays}</p>
                  <p className="text-xs text-muted-foreground">Sequência</p>
                </Card>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-card/50 backdrop-blur-sm shadow-md">
            <TabsTrigger value="achievements" className="font-headline">
              <Trophy className="h-4 w-4 mr-2"/>
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="progress" className="font-headline">
              <BarChart3 className="h-4 w-4 mr-2"/>
              Progresso
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-headline">
              <Medal className="h-4 w-4 mr-2"/>
              Classificação
            </TabsTrigger>
          </TabsList>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Enhanced Filters with Animation */}
            <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar conquistas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/70 focus:border-primary"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <motion.div className="flex flex-wrap gap-2" layout>
                    {filterCategories.map(filter => (
                      <Button
                        key={filter.value}
                        variant={activeFilter === filter.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter(filter.value)}
                        className={cn(
                          "font-code transition-all duration-200 hover:scale-105",
                          activeFilter === filter.value ? 'shadow-lg' : ''
                        )}
                      >
                        <span className={filter.color}>{filter.icon}</span>
                        <span className="ml-2">{filter.label}</span>
                      </Button>
                    ))}
                  </motion.div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Ordenar por:</span>
                    {sortOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setSortBy(option.value)}
                        className="font-code text-xs"
                      >
                        {option.icon}
                        <span className="ml-1">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <div className="space-y-6">
              {filteredAchievements.length === 0 && (
                <Card className="text-center p-8 bg-card/50 animate-fade-in">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <CardDescription>Nenhuma conquista encontrada para este filtro.</CardDescription>
                </Card>
              )}

              {filteredAchievements.map(ach => {
                const totalTiers = ach.tiers.length;
                const unlockedTiers = ach.tiers.filter(t => t.isUnlocked).length;
                const progressPercentage = totalTiers > 0 ? (unlockedTiers / totalTiers) * 100 : 0;
                const nextTier = ach.tiers.find(t => !t.isUnlocked);
                const allTiersUnlocked = unlockedTiers === totalTiers;
                const currentRarityStyle = rarityStyles[ach.rarity];

                return (
                  <Card 
                    key={ach.id} 
                    className={cn(
                      `border-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl cursor-pointer`,
                      allTiersUnlocked ? 'bg-gradient-to-br from-green-500/10 to-green-400/5' : 'bg-card/70 backdrop-blur-sm',
                      currentRarityStyle.borderClass,
                      currentRarityStyle.glowClass,
                      allTiersUnlocked ? 'hover:shadow-green-400/30' : `hover:shadow-primary/20`,
                      'hover:scale-[1.02] hover:-translate-y-1'
                    )}
                    onClick={() => setSelectedAchievement(ach)}
                  >
                    <CardHeader className="pb-3 relative overflow-hidden">
                      {/* Animated background for legendary achievements */}
                      {ach.rarity === 'legendary' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-shimmer" 
                             style={{ backgroundSize: '200% 100%' }} />
                      )}
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            `p-3 rounded-xl transition-all duration-300`,
                            allTiersUnlocked ? 'bg-green-400/30 text-green-400 animate-glow' : `${currentRarityStyle.bgClass} ${currentRarityStyle.textClass}`,
                            'hover:scale-110'
                          )}>
                            {React.cloneElement(ach.icon as React.ReactElement, { 
                              className: `h-8 w-8 transition-transform duration-300` 
                            })}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className={cn(
                                `text-xl font-headline transition-colors duration-300`, 
                                allTiersUnlocked ? 'text-green-400 font-bold' : currentRarityStyle.textClass
                              )}>
                                {ach.name}
                              </CardTitle>
                              <Badge className={cn(
                                'text-xs py-1 px-2 border transition-all duration-300 hover:scale-105', 
                                currentRarityStyle.badgeClass
                              )}>
                                {currentRarityStyle.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{ach.overallDescription}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {allTiersUnlocked && (
                            <Badge className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-xs animate-pulse">
                              <CheckCircle2 className="h-3 w-3 mr-1 animate-pulse" />
                              Completo!
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShareAchievement(ach.name);
                                    }}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Partilhar conquista</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {allTiersUnlocked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground hover:text-accent transition-all duration-200 hover:scale-110"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClaimReward(ach.id, unlockedTiers);
                                      }}
                                    >
                                      <Gift className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reclamar recompensa</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {totalTiers > 1 && (
                        <div className="mt-4 relative z-10">
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span className="font-medium">Progresso</span>
                            <span className="font-code">{unlockedTiers}/{totalTiers} Escalões</span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className={cn(
                              `h-3 transition-all duration-500 rounded-full`, 
                              allTiersUnlocked ? '[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-500' : `[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent`
                            )} 
                          />
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-3 pt-0">
                      {ach.tiers.map(tier => (
                        <div key={tier.level} className={cn(
                          `p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02]`, 
                          tier.isUnlocked 
                            ? `bg-gradient-to-r from-background/80 to-background/60 ${currentRarityStyle.borderClass.replace('hover:border-', 'border-').replace('/60', '/40')} shadow-md` 
                            : 'bg-muted/30 border-border hover:bg-muted/40'
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {tier.isUnlocked ? (
                                <CheckCircle2 className="h-5 w-5 mr-3 text-green-400 animate-pulse" />
                              ) : (
                                <Lock className="h-5 w-5 mr-3 text-muted-foreground" />
                              )}
                              <div>
                                <h4 className={cn(
                                  `font-semibold text-sm`, 
                                  tier.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                  Nível {tier.level}
                                </h4>
                                <p className={cn(
                                  `text-sm mt-1`, 
                                  tier.isUnlocked ? 'text-foreground/80' : 'text-muted-foreground'
                                )}>
                                  {tier.description}
                                </p>
                              </div>
                            </div>
                            {tier.isUnlocked && (
                              <Badge variant="outline" className="text-green-400 border-green-400/70 text-xs animate-pulse">
                                Desbloqueado
                              </Badge>
                            )}
                          </div>
                          
                          {!tier.isUnlocked && nextTier && tier.level === nextTier.level && (
                            <Badge variant="secondary" className="mt-2 text-xs animate-pulse">
                              Próximo Objetivo
                            </Badge>
                          )}
                          
                          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-primary animate-pulse" />
                                <span className="font-code text-primary">+{tier.xpReward} XP</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="h-3 w-3 text-accent animate-pulse" />
                                <span className="font-code text-accent">+{tier.creditsReward}</span>
                              </span>
                            </div>
                            {tier.isUnlocked && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs hover:bg-primary/10 hover:scale-105 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimReward(`${ach.id}-${tier.level}`, tier.level);
                                }}
                              >
                                <Gift className="h-3 w-3 mr-1" />
                                Reclamar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="pt-0 pb-4 px-6">
                      {ach.rarity === 'legendary' && (
                        <Badge variant="outline" className="w-full justify-center py-2 text-amber-400 border-amber-400/50 bg-amber-400/10">
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Conquista Lendária - Extremamente Rara!
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <PieChart className="h-5 w-5 mr-2" />
                    Progresso Geral
                  </CardTitle>
                  <CardDescription>
                    Acompanhe o seu progresso em todas as conquistas disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {userProgress.completionPercentage}%
                    </div>
                    <p className="text-muted-foreground">Conquistas Completas</p>
                  </div>
                  
                  <Progress value={userProgress.completionPercentage} className="h-4" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-500">{userProgress.unlockedAchievements}</p>
                      <p className="text-sm text-muted-foreground">Desbloqueadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">{userProgress.totalAchievements - userProgress.unlockedAchievements}</p>
                      <p className="text-sm text-muted-foreground">Restantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Unlocks */}
              <Card className="card-hover-glow">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Clock className="h-5 w-5 mr-2" />
                    Desbloqueios Recentes
                  </CardTitle>
                  <CardDescription>
                    Suas conquistas mais recentes e recompensas obtidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {userProgress.recentUnlocks.map((unlock, index) => {
                        const achievement = achievementsData.find(a => a.id === unlock.id);
                        if (!achievement) return null;
                        
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                              {React.cloneElement(achievement.icon as React.ReactElement, { className: "h-5 w-5" })}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Escalão {unlock.tier} • {new Date(unlock.unlockedAt).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Novo
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Milestone Progress */}
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Target className="h-5 w-5 mr-2" />
                  Próximo Marco
                </CardTitle>
                <CardDescription>
                  Objetivos especiais para desbloquear recompensas exclusivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">10 Conquistas Desbloqueadas</span>
                    <span className="text-sm text-muted-foreground">
                      {userProgress.nextMilestone.current}/{userProgress.nextMilestone.target}
                    </span>
                  </div>
                  
                  <Progress 
                    value={(userProgress.nextMilestone.current / userProgress.nextMilestone.target) * 100} 
                    className="h-3"
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recompensa:</span>
                    <span className="font-medium text-accent">{userProgress.nextMilestone.reward}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="card-hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Medal className="h-5 w-5 mr-2" />
                  Classificação Global
                </CardTitle>
                <CardDescription>
                  Veja como se compara com outros exploradores de pixels!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <Trophy className="h-16 w-16 text-amber-400 mb-4 animate-pulse" />
                    <p className="text-muted-foreground mb-4 text-center">
                      A classificação global estará disponível em breve.
                    </p>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Ver Classificação Completa
                    </Button>
                  </div>
                  
                  <div className="space-y-4 border-t border-border/50 pt-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Dicas para Subir na Classificação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="font-medium">Seja Ativo Diariamente</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mantenha uma sequência de logins diários para ganhar bônus de XP.
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Compass className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Explore Novas Regiões</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Visite e interaja com diferentes regiões do mapa.
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Participe da Comunidade</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Interaja com outros usuários e participe de eventos.
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-red-500" />
                          <span className="font-medium">Foque nas Conquistas Raras</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Conquistas de maior raridade dão mais pontos na classificação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Achievement Tips Section */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Dicas para Conquistadores
            </CardTitle>
            <CardDescription>
              Estratégias para desbloquear mais conquistas e maximizar suas recompensas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Compass className="h-4 w-4 mr-2 text-blue-500" />
                  Exploração Estratégica
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visite diferentes regiões do mapa diariamente e interaja com pixels variados para desbloquear conquistas de exploração.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Palette className="h-4 w-4 mr-2 text-purple-500" />
                  Diversidade de Cores
                </h3>
                <p className="text-sm text-muted-foreground">
                  Experimente usar uma ampla variedade de cores em seus pixels para desbloquear conquistas relacionadas à criatividade.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                <h3 className="font-semibold flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  Engajamento Social
                </h3>
                <p className="text-sm text-muted-foreground">
                  Participe ativamente da comunidade, comente em publicações e participe de eventos para desbloquear conquistas sociais.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <Megaphone className="h-4 w-4 mr-2" />
              Compartilhar Minhas Conquistas
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}