
import React from 'react'; // Added React import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock, Award, Star, Sparkles, Palette, MapPin, Zap, ShieldCheck, Crown } from "lucide-react";

type AchievementTier = {
  level: number;
  description: string;
  xpReward: number;
  creditsReward: number;
  isUnlocked: boolean;
};

type Achievement = {
  id: string;
  name: string;
  overallDescription: string;
  icon: React.ReactNode;
  tiers: AchievementTier[];
};

const achievementsData: Achievement[] = [
  {
    id: "pixel_initiate",
    name: "Iniciado dos Pixels",
    overallDescription: "Comece sua jornada no Pixel Universe adquirindo pixels.",
    icon: <MapPin className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Comprou seu primeiro pixel", xpReward: 50, creditsReward: 10, isUnlocked: true },
      { level: 2, description: "Comprou 10 pixels", xpReward: 100, creditsReward: 25, isUnlocked: true },
      { level: 3, description: "Comprou 50 pixels", xpReward: 250, creditsReward: 75, isUnlocked: false },
    ],
  },
  {
    id: "color_enthusiast",
    name: "Entusiasta das Cores",
    overallDescription: "Mostre sua criatividade usando uma variedade de cores.",
    icon: <Palette className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Usou 5 cores diferentes", xpReward: 30, creditsReward: 5, isUnlocked: true },
      { level: 2, description: "Usou 15 cores diferentes", xpReward: 70, creditsReward: 15, isUnlocked: false },
      { level: 3, description: "Usou 30 cores diferentes", xpReward: 150, creditsReward: 40, isUnlocked: false },
    ],
  },
  {
    id: "regional_explorer",
    name: "Explorador Regional",
    overallDescription: "Aventure-se e visite diferentes regiões do mapa.",
    icon: <Zap className="h-7 w-7" />, 
    tiers: [
      { level: 1, description: "Visitou 3 regiões diferentes", xpReward: 60, creditsReward: 15, isUnlocked: true },
      { level: 2, description: "Visitou 7 regiões diferentes", xpReward: 120, creditsReward: 35, isUnlocked: false },
      { level: 3, description: "Visitou todas as regiões principais", xpReward: 300, creditsReward: 100, isUnlocked: false },
    ],
  },
  {
    id: "pixel_tycoon",
    name: "Magnata dos Pixels",
    overallDescription: "Acumule uma vasta coleção de pixels.",
    icon: <Crown className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Possui 100 pixels", xpReward: 200, creditsReward: 50, isUnlocked: false },
      { level: 2, description: "Possui 500 pixels", xpReward: 500, creditsReward: 150, isUnlocked: false },
      { level: 3, description: "Possui 1000 pixels", xpReward: 1000, creditsReward: 300, isUnlocked: false },
    ],
  },
  {
    id: "community_star",
    name: "Estrela da Comunidade",
    overallDescription: "Envolva-se e seja reconhecido pela comunidade.",
    icon: <Star className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Recebeu 10 gostos em publicações", xpReward: 40, creditsReward: 10, isUnlocked: true },
      { level: 2, description: "Recebeu 50 gostos em publicações", xpReward: 90, creditsReward: 25, isUnlocked: false },
      { level: 3, description: "Participou ativamente num evento comunitário", xpReward: 180, creditsReward: 60, isUnlocked: false },
    ],
  },
  {
    id: "legendary_collector",
    name: "Colecionador Lendário",
    overallDescription: "Obtenha os pixels mais raros e cobiçados.",
    icon: <Sparkles className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Possui um pixel 'Featured'", xpReward: 150, creditsReward: 50, isUnlocked: false },
      { level: 2, description: "Completou um conjunto de pixels temático", xpReward: 350, creditsReward: 120, isUnlocked: false },
    ],
  },
   {
    id: "master_guardian",
    name: "Guardião Mestre",
    overallDescription: "Proteja e mantenha a ordem no universo dos pixels.",
    icon: <ShieldCheck className="h-7 w-7" />,
    tiers: [
      { level: 1, description: "Reportou uma infração validada", xpReward: 70, creditsReward: 20, isUnlocked: false },
      { level: 2, description: "Ajudou a resolver uma disputa comunitária", xpReward: 150, creditsReward: 50, isUnlocked: false },
    ],
  },
];

export default function AchievementsPage() {
  return (
    <div className="container mx-auto py-8 px-4 mb-16">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Award className="h-8 w-8 mr-3" />
            Quadro de Conquistas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Desbloqueie conquistas, ganhe XP e créditos para subir de nível e mostrar seu domínio no Pixel Universe!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {achievementsData.map(ach => {
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
                        {React.cloneElement(ach.icon, { className: `h-7 w-7` })}
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
                    <div key={tier.level} className={`p-3 rounded-md border ${tier.isUnlocked ? 'bg-background/70 border-primary/50' : 'bg-muted/30 border-border'}`}>
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
