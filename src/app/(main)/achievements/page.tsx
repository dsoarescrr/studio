'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, Lock, Award, Edit3, Users, Eye, Map, Compass, Puzzle, Activity, 
  CheckCheck, ShieldCheck, Share2, Trophy, Search, Filter, SortAsc, Star, 
  Flame, Target, Crown, Sparkles, TrendingUp, Calendar, Clock, Gift, Zap,
  BarChart3, PieChart, LineChart, Medal, Gem, Heart, ThumbsUp, MessageSquare,
  BookImage, Palette, MapPin, Globe, Rocket, Settings, Bell, Download, Coins
} from "lucide-react";
import { achievementsData, type Achievement, type AchievementCategory, type AchievementRarity } from '@/data/achievements-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { toast } = useToast();

  const handleShareAchievement = (achievementName: string) => {
    toast({
      title: "Conquista Partilhada!",
      description: `Partilhaste a conquista "${achievementName}" nas redes sociais.`,
    });
  };

  const handleClaimReward = (achievementId: string, tier: number) => {
    toast({
      title: "Recompensa Reclamada!",
      description: `Recebeste XP e créditos pela conquista desbloqueada.`,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
        {/* Enhanced Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <Trophy className="h-8 w-8 mr-3 animate-glow" />
                  Quadro de Conquistas
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Desbloqueie conquistas épicas, ganhe XP e créditos para dominar o Pixel Universe!
                </CardDescription>
              </div>
              
              {/* Progress Overview */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-primary">{userProgress.unlockedAchievements}</p>
                  <p className="text-xs text-muted-foreground">Desbloqueadas</p>
                </Card>
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-accent">{userProgress.completionPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Completo</p>
                </Card>
                <Card className="bg-background/50 p-4 text-center min-w-[120px]">
                  <p className="text-2xl font-bold text-green-500">{userProgress.streakDays}</p>
                  <p className="text-xs text-muted-foreground">Dias Seguidos</p>
                </Card>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-card/50 backdrop-blur-sm">
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
            {/* Enhanced Filters */}
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
                  <div className="flex flex-wrap gap-2">
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
                  </div>

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
                <Card className="text-center p-8 bg-card/50">
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
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 animate-shimmer" 
                             style={{ backgroundSize: '200% 100%' }} />
                      )}
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            `p-3 rounded-xl transition-all duration-300`,
                            allTiersUnlocked ? 'bg-green-400/20 text-green-400 animate-glow' : `${currentRarityStyle.bgClass} ${currentRarityStyle.textClass}`,
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
                                allTiersUnlocked ? 'text-green-400' : currentRarityStyle.textClass
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
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completo!
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
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
                                      variant="ghost" 
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
                              `h-3 transition-all duration-500`, 
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
                                  Escalão {tier.level}
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
                            <Badge variant="secondary" className="mt-2 text-xs animate-bounce">
                              Próximo Objetivo
                            </Badge>
                          )}
                          
                          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-primary" />
                                <span className="font-code text-primary">+{tier.xpReward} XP</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Coins className="h-3 w-3 text-accent" />
                                <span className="font-code text-accent">+{tier.creditsReward}</span>
                              </span>
                            </div>
                            {tier.isUnlocked && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimReward(ach.id, tier.level);
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
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4 text-center">
                  A classificação global estará disponível em breve.
                </p>
                <Button variant="outline" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Ver Classificação Completa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
