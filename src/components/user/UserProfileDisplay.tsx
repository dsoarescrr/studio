
// src/components/user/UserProfileDisplay.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Award, Gem, MapPin as MapPinIcon, Coins, Gift, Trophy, BookImage, FolderPlus, Link as LinkIcon, 
  Twitter, Instagram, Github, UserCircle
} from "lucide-react";
import type { Achievement } from '@/data/achievements-data'; // Corrected import
import { achievementsData } from '@/data/achievements-data'; // Corrected import

interface SocialLink {
  platform: string;
  handle: string;
  icon: React.ReactNode;
  url: string;
}

interface Album {
  id: string;
  name: string;
  description: string;
  coverPixelUrl: string;
  dataAiHint?: string;
  pixelCount: number;
}

export interface UserProfileData {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  dataAiHint?: string;
  level: number;
  xp: number;
  xpMax: number;
  credits: number;
  specialCredits: number;
  bio: string;
  pixelsOwned: number;
  achievementsUnlocked: number;
  unlockedAchievementIds: string[];
  rank: number;
  primaryColor?: string; // Optional: for future theming
  location?: string;
  socials: SocialLink[];
  albums: Album[];
}

interface UserProfileDisplayProps {
  userData: UserProfileData;
  // achievementsData is imported globally now
}

export function UserProfileDisplay({ userData }: UserProfileDisplayProps) {
  const nextLevelXp = userData.xpMax > 0 ? userData.xpMax - userData.xp : 0;
  const xpPercentage = userData.xpMax > 0 ? (userData.xp / userData.xpMax) * 100 : 0;

  const displayedAchievements = userData.unlockedAchievementIds
    .map(id => achievementsData.find(ach => ach.id === id))
    .filter(ach => ach !== undefined) as Achievement[];

  return (
    <div className="container mx-auto py-6 px-4 flex flex-col items-center">
      <CardHeader className="items-center text-center pt-6 pb-2 relative w-full max-w-md">
        <div className="relative">
          <Avatar className="h-28 w-28 border-4 border-primary shadow-lg">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint={userData.dataAiHint} />
            <AvatarFallback className="font-headline text-3xl">
              {userData.name ? userData.name.substring(0, 1) : ''}
              {userData.username ? userData.username.substring(1,2).toUpperCase() : ''}
            </AvatarFallback>
          </Avatar>
          {userData.rank > 0 && (
             <Badge variant="default" className="absolute -top-1 -left-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground border-2 border-card shadow-md">
                {userData.rank === 1 && <Award className="h-3 w-3 mr-1" />}
                {userData.rank > 1 && <Gem className="h-3 w-3 mr-1" />}
                Top {userData.rank}
             </Badge>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-headline font-bold text-foreground flex items-center justify-center flex-wrap">
            <span>{userData.name}</span>
            {userData.rank === 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Award className="h-5 w-5 text-yellow-400 ml-2 cursor-default" />
                  </TooltipTrigger>
                  <TooltipContent><p>Melhor Classificado (Top {userData.rank})</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {displayedAchievements.slice(0, 3).map(ach => ( 
              <TooltipProvider key={ach.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="ml-1.5 cursor-default"> 
                      {React.cloneElement(ach.icon as React.ReactElement, { className: "h-5 w-5 text-primary"})}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p>{ach.name}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </h1>
          <p className="text-sm text-muted-foreground font-code">{userData.username}</p>
          {userData.location && (
            <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
              <MapPinIcon className="h-3 w-3 mr-1 text-accent" />
              <span>{userData.location}</span>
            </div>
          )}
        </div>
        <Badge variant="secondary" className="font-code text-xs py-1 mt-2">Nível {userData.level}</Badge>
      </CardHeader>
      
      <CardContent className="w-full max-w-md p-4 pt-2 space-y-4">
        <Card className="w-full bg-background/50 p-3 text-center rounded-lg shadow">
          <CardDescription className="text-sm text-foreground italic">
            &quot;{userData.bio || 'Nenhuma bio disponível.'}&quot;
          </CardDescription>
        </Card>

        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Progresso de Nível</span>
            <span className="font-code">{userData.xp.toLocaleString('pt-PT')} / {userData.xpMax.toLocaleString('pt-PT')} XP</span>
          </div>
          <Progress value={xpPercentage} className="h-2.5 [&>div]:bg-primary shadow-inner" />
          <p className="text-xs text-muted-foreground text-right font-code">
            {nextLevelXp > 0 ? `Faltam ${nextLevelXp.toLocaleString('pt-PT')} XP para o próximo nível` : 'Nível Máximo!'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <Card className="bg-background/50 p-2.5 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-primary/20 transition-shadow aspect-square">
                <Coins className="h-6 w-6 text-primary mb-1" />
                <p className="text-xl font-bold font-code text-foreground">{userData.credits.toLocaleString('pt-PT')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Créditos</p>
            </Card>
            <Card className="bg-background/50 p-2.5 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-accent/20 transition-shadow aspect-square">
                <Gift className="h-6 w-6 text-accent mb-1" />
                <p className="text-xl font-bold font-code text-foreground">{userData.specialCredits.toLocaleString('pt-PT')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Especiais</p>
            </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Card className="bg-background/50 p-3 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-primary/20 transition-shadow">
            <MapPinIcon className="h-7 w-7 text-primary mb-1.5" />
            <p className="text-2xl font-bold font-code text-foreground">{userData.pixelsOwned}</p>
            <p className="text-xs text-muted-foreground">Pixels</p>
          </Card>
          <Card className="bg-accent/20 p-3 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-accent/30 transition-shadow border-accent">
            <Trophy className="h-7 w-7 text-accent-foreground mb-1.5" />
            <p className="text-2xl font-bold font-code text-accent-foreground">{userData.achievementsUnlocked}</p>
            <p className="text-xs text-accent-foreground/80">Conquistas</p>
          </Card>
        </div>
        
        <Card className="bg-background/50 p-3 rounded-lg shadow">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-[0.9rem] font-headline flex items-center text-primary">
                    <BookImage className="h-4 w-4 mr-1.5" />
                    Álbuns de Píxeis
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 max-h-40 overflow-y-auto">
                {userData.albums && userData.albums.length > 0 ? (
                    userData.albums.map(album => (
                        <div key={album.id} className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md border border-border hover:border-primary/30 transition-colors">
                            <Image src={album.coverPixelUrl} alt={album.name} width={32} height={32} className="rounded-sm border border-border" data-ai-hint={album.dataAiHint || 'album cover'} />
                            <div className="flex-1">
                                <h4 className="text-xs font-semibold text-foreground">{album.name}</h4>
                                <p className="text-[0.7rem] text-muted-foreground font-code">{album.pixelCount} pixels</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[0.7rem] h-6 px-2">Ver</Button>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground p-1">Nenhum álbum criado.</p>
                )}
            </CardContent>
             {/* Placeholder for "Criar Novo Álbum" if this sheet is for the current user, might need different logic */}
        </Card>

        {userData.socials && userData.socials.length > 0 && (
            <Card className="bg-background/50 p-3 rounded-lg shadow">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-[0.9rem] font-headline flex items-center text-primary">
                        <LinkIcon className="h-4 w-4 mr-1.5" />
                        Redes Sociais
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1.5">
                    {userData.socials.map(social => (
                        <Button key={social.platform} variant="outline" className="w-full justify-start text-xs h-8 hover:bg-muted/70" asChild>
                            <a href={social.url} target="_blank" rel="noopener noreferrer">
                                {React.cloneElement(social.icon as React.ReactElement, {className: "h-3.5 w-3.5"})}
                                <span className="ml-2 font-semibold">{social.platform}:</span>
                                <span className="ml-1.5 text-muted-foreground font-code">{social.handle}</span>
                            </a>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        )}
      </CardContent>
    </div>
  );
}
