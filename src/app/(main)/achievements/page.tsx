
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lock, Award, Edit3, Users, Eye, Map, Compass, Puzzle, Activity, CheckCheck, ShieldCheck } from "lucide-react";
import { achievementsData, type Achievement, type AchievementCategory } from '@/data/achievements-data'; // Updated import

type FilterValue = AchievementCategory | 'all' | 'completed';

const filterCategories: { label: string; value: FilterValue; icon: React.ReactNode }[] = [
  { label: "Todas", value: 'all', icon: <Eye className="h-4 w-4 mr-2" /> },
  { label: "Completas", value: 'completed', icon: <CheckCheck className="h-4 w-4 mr-2" /> },
  { label: "Píxeis", value: 'pixel', icon: <Edit3 className="h-4 w-4 mr-2" /> },
  { label: "Comunidade", value: 'community', icon: <Users className="h-4 w-4 mr-2" /> },
  { label: "Exploração", value: 'exploration', icon: <Compass className="h-4 w-4 mr-2" /> },
  { label: "Coleção", value: 'collection', icon: <Puzzle className="h-4 w-4 mr-2" /> },
  { label: "Social", value: 'social', icon: <Activity className="h-4 w-4 mr-2" /> },
  { label: "Moderação", value: 'moderation', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
];

export default function AchievementsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  const filteredAchievements =
    activeFilter === 'all'
      ? achievementsData
      : activeFilter === 'completed'
        ? achievementsData
            .filter(ach => ach.tiers.some(t => t.isUnlocked))
            .sort((a, b) => {
              const aIsFullyUnlocked = a.tiers.every(t => t.isUnlocked);
              const bIsFullyUnlocked = b.tiers.every(t => t.isUnlocked);
              if (aIsFullyUnlocked && !bIsFullyUnlocked) return -1;
              if (!aIsFullyUnlocked && bIsFullyUnlocked) return 1;
              // Secondary sort: if both fully unlocked or both not, sort by name or id
              if (aIsFullyUnlocked === bIsFullyUnlocked) {
                return a.name.localeCompare(b.name);
              }
              return 0;
            })
        : achievementsData.filter(ach => ach.category === activeFilter);

  return (
    <div className="container mx-auto py-8 px-4 mb-16">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Award className="h-8 w-8 mr-3" />
            Quadro de Conquistas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Desbloqueie conquistas, ganhe XP e créditos para subir de nível e mostrar o seu domínio no Pixel Universe!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6 p-4 bg-background/50 rounded-lg shadow-sm">
            <h3 className="text-lg font-headline mb-3 text-primary">Filtrar por Categoria:</h3>
            <div className="flex flex-wrap gap-2">
              {filterCategories.map(filter => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className="font-code"
                >
                  {filter.icon}
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {filteredAchievements.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma conquista encontrada para este filtro.</p>
          )}

          {filteredAchievements.map(ach => {
            const totalTiers = ach.tiers.length;
            const unlockedTiers = ach.tiers.filter(t => t.isUnlocked).length;
            const progressPercentage = totalTiers > 0 ? (unlockedTiers / totalTiers) * 100 : 0;
            const nextTier = ach.tiers.find(t => !t.isUnlocked);
            const allTiersUnlocked = unlockedTiers === totalTiers;

            return (
              <Card key={ach.id} className={`border-2 ${allTiersUnlocked ? 'border-green-400/70 bg-green-400/5' : 'border-border hover:border-primary/40'} transition-all duration-200 ease-in-out shadow-md hover:shadow-primary/20`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg ${allTiersUnlocked ? 'bg-green-400/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                        {React.cloneElement(ach.icon as React.ReactElement, { className: `h-7 w-7` })}
                      </span>
                      <div>
                        <CardTitle className={`text-xl font-headline ${allTiersUnlocked ? 'text-green-400' : 'text-primary'}`}>{ach.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{ach.overallDescription}</p>
                      </div>
                    </div>
                     {allTiersUnlocked && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-500/90 text-xs">Completo!</Badge>
                      )}
                  </div>
                  {totalTiers > 1 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{unlockedTiers}/{totalTiers} Escalões</span>
                      </div>
                      <Progress value={progressPercentage} className={`h-2 ${allTiersUnlocked ? '[&>div]:bg-green-400' : '[&>div]:bg-primary'}`} />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {ach.tiers.map(tier => (
                    <div key={tier.level} className={`p-3 rounded-md border ${tier.isUnlocked ? 'bg-background/70 border-primary/50 shadow-primary/10' : 'bg-muted/30 border-border'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {tier.isUnlocked ? (
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                          ) : (
                            <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
                          )}
                          <h4 className={`font-semibold ${tier.isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Escalão {tier.level}: <span className="font-normal">{tier.description}</span>
                          </h4>
                        </div>
                        {tier.isUnlocked && <Badge variant="outline" className="text-green-400 border-green-400/70 text-xs">Desbloqueado</Badge>}
                      </div>
                      {!tier.isUnlocked && nextTier && tier.level === nextTier.level && (
                         <Badge variant="secondary" className="mt-1 text-xs">Próximo</Badge>
                      )}
                      <div className="mt-1.5 pl-7 text-xs">
                        <span className="font-code text-primary/90">XP: +{tier.xpReward}</span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <span className="font-code text-accent/90">Créditos: +{tier.creditsReward}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
