
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Award, Camera, CreditCard, Gem, MapPin, Settings, User as UserIcon, Edit3, Gift, Coins, Globe, Link as LinkIcon, Twitter, Instagram, Github, BookImage, FolderPlus, Trophy } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { achievementsData, type Achievement } from '@/data/achievements-data'; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; 
import { cn } from "@/lib/utils";

export default function MemberPage() {
  const user = {
    name: "Pedro Silva",
    username: "@PixelMasterPT",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "profile avatar",
    level: 8,
    xp: 2450,
    xpMax: 3000,
    credits: 12500, 
    specialCredits: 120, 
    bio: "Artista digital e explorador apaixonado por pixel art. Criando universos pixelizados, um quadrado de cada vez! 🇵🇹",
    pixelsOwned: 42,
    achievementsUnlocked: 5, 
    unlockedAchievementIds: ['pixel_initiate', 'color_master', 'community_star', 'time_virtuoso', 'album_curator'], 
    rank: 1, 
    primaryColor: "#FFD700",
    location: "Lisboa, Portugal",
    socials: [
      { platform: "Twitter", handle: "@PixelMasterPT", icon: <Twitter className="h-4 w-4" />, url: "#" },
      { platform: "Instagram", handle: "pixel.master.pt", icon: <Instagram className="h-4 w-4" />, url: "#" },
      { platform: "Github", handle: "PedroSilvaDev", icon: <Github className="h-4 w-4" />, url: "#" },
    ],
    albums: [
      { id: 'album1', name: 'Paisagens Pixelizadas', description: 'As minhas melhores paisagens.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'pixel landscape', pixelCount: 15 },
      { id: 'album2', name: 'Retratos Retro', description: 'Personagens e retratos.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'pixel portrait', pixelCount: 8 },
      { id: 'album3', name: 'Abstrações Cósmicas', description: 'Explorando o cosmos em pixels.', coverPixelUrl: 'https://placehold.co/100x100.png', dataAiHint: 'abstract space', pixelCount: 22 },
    ]
  };

  const nextLevelXp = user.xpMax - user.xp;
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [particleStyles, setParticleStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const styles = Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }));
    setParticleStyles(styles);

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const displayedAchievements = user.unlockedAchievementIds
    .map(id => achievementsData.find(ach => ach.id === id))
    .filter(ach => ach !== undefined) as Achievement[];

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center mb-16 animate-fade-in">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={style}
          />
        ))}
      </div>

      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm shadow-xl border-primary/20 card-hover-glow animate-scale-in">
        <CardHeader className="items-center text-center pt-6 pb-2 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
                 style={{ backgroundSize: '200% 200%' }} />
            
            <div className="relative">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary shadow-lg animate-glow">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                    <AvatarFallback className="font-headline text-3xl">{user.name.substring(0, 1)}{user.username.substring(1,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  {/* Animated ring around avatar */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 rounded-full border border-accent/20 animate-pulse" style={{ animationDuration: '2s' }} />
                </div>
                
                <Badge variant="default" className={cn(
                  "absolute -top-1 -left-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground border-2 border-card shadow-md transition-all duration-300",
                  animationPhase === 0 && "animate-bounce-slow",
                  animationPhase === 1 && "animate-pulse-slow",
                  animationPhase === 2 && "animate-glow",
                  animationPhase === 3 && "scale-110"
                )}>
                  {user.rank === 1 && <Award className="h-3 w-3 mr-1 animate-pulse" />}
                  {user.rank > 1 && <Gem className="h-3 w-3 mr-1 animate-pulse" />}
                  {user.rank > 0 ? `Top ${user.rank}` : `Nível ${user.level}`}
                </Badge>
                
                <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full border-2 border-card bg-muted hover:bg-accent shadow-md button-hover-lift">
                  <Camera className="h-4 w-4 text-foreground" />
                </Button>
            </div>

              <div className="mt-4">
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center justify-center flex-wrap animate-fade-in animation-delay-200">
                  <span className="text-gradient-gold">{user.name}</span>
                  {user.rank === 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Award className="h-5 w-5 text-yellow-400 ml-2 cursor-default animate-glow" />
                        </TooltipTrigger>
                        <TooltipContent><p>Melhor Classificado (Top {user.rank})</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {displayedAchievements.slice(0, 3).map(ach => ( 
                    <TooltipProvider key={ach.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-1.5 cursor-default animate-bounce-slow"> 
                            {React.cloneElement(ach.icon as React.ReactElement, { className: "h-5 w-5 text-primary animate-glow"})}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent><p>{ach.name}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </h1>
                <p className="text-sm text-muted-foreground font-code animate-fade-in animation-delay-300">{user.username}</p>
                <div className="flex items-center justify-center text-sm text-muted-foreground mt-1.5 animate-fade-in animation-delay-400">
                  <MapPin className="h-4 w-4 mr-1.5 text-accent animate-pulse-slow" />
                  <span>{user.location}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-2 animate-fade-in animation-delay-500">
                <Badge variant="secondary" className="font-code text-xs py-1 animate-glow">Nível {user.level}</Badge>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-code">Online</span>
                </div>
              </div>
        </CardHeader>
        <CardContent className="p-6 pt-4 animate-fade-in animation-delay-600">
          <div className="space-y-6">
            
            <Card className="w-full bg-background/50 p-4 text-center rounded-lg shadow card-hover-glow animate-scale-in animation-delay-700">
              <CardDescription className="text-sm text-foreground italic">
                &quot;{user.bio}&quot;
              </CardDescription>
            </Card>

            <div className="w-full space-y-1 animate-fade-in animation-delay-800">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-semibold">Progresso de Nível</span>
                <span className="font-code text-primary">{user.xp.toLocaleString('pt-PT')} / {user.xpMax.toLocaleString('pt-PT')} XP</span>
              </div>
              <Progress value={(user.xp / user.xpMax) * 100} className="h-3 [&>div]:bg-primary shadow-inner animate-glow" />
              <p className="text-xs text-muted-foreground text-right font-code">
                Faltam <span className="text-accent font-bold">{nextLevelXp.toLocaleString('pt-PT')} XP</span> para o próximo nível
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 animate-fade-in animation-delay-900">
                <Card className="bg-background/50 p-3 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-primary/20 transition-shadow aspect-square card-hover-glow button-hover-lift">
                    <Coins className="h-7 w-7 text-primary mb-1.5 animate-bounce-slow" />
                    <p className="text-2xl font-bold font-code text-foreground text-gradient-gold">{user.credits.toLocaleString('pt-PT')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Créditos Totais</p>
                </Card>
                <Card className="bg-background/50 p-3 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-accent/20 transition-shadow aspect-square card-hover-glow button-hover-lift">
                    <Gift className="h-7 w-7 text-accent mb-1.5 animate-bounce-slow animation-delay-100" />
                    <p className="text-2xl font-bold font-code text-accent">{user.specialCredits.toLocaleString('pt-PT')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Créditos Especiais</p>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full animate-fade-in animation-delay-1000">
              <Card className="bg-background/50 p-4 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-primary/20 transition-shadow card-hover-glow button-hover-lift">
                <MapPin className="h-8 w-8 text-primary mb-2 animate-pulse-slow" />
                <p className="text-3xl font-bold font-code text-foreground text-gradient-gold">{user.pixelsOwned}</p>
                <p className="text-xs text-muted-foreground">Pixels Adquiridos</p>
              </Card>
              <Card className="bg-accent/20 p-4 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-accent/30 transition-shadow border-accent card-hover-glow button-hover-lift">
                <Trophy className="h-8 w-8 text-accent-foreground mb-2 animate-glow" />
                <p className="text-3xl font-bold font-code text-accent-foreground">{user.achievementsUnlocked}</p>
                <p className="text-xs text-accent-foreground/80">Conquistas Únicas</p>
              </Card>
            </div>
            
            <Card className="bg-background/50 p-4 rounded-lg shadow card-hover-glow animate-fade-in animation-delay-1100">
                <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-md font-headline flex items-center text-primary">
                        <BookImage className="h-4 w-4 mr-2 animate-pulse-slow" />
                        Meus Álbuns
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                    {user.albums.length > 0 ? (
                        user.albums.map(album => (
                            <div key={album.id} className="flex items-center space-x-3 p-2.5 bg-muted/30 rounded-md border border-border hover:border-primary/30 transition-colors card-hover-glow button-hover-lift">
                                <Image src={album.coverPixelUrl} alt={album.name} width={40} height={40} className="rounded-sm border border-border" data-ai-hint={album.dataAiHint} />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-foreground">{album.name}</h4>
                                    <p className="text-xs text-muted-foreground font-code">{album.pixelCount} pixels</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs h-7 button-hover-lift">Ver</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground p-2">Ainda não criou nenhum álbum.</p>
                    )}
                    <Button variant="outline" className="w-full mt-3 hover:bg-primary/10 transition-colors button-hover-lift button-neon-glow">
                        <FolderPlus className="h-4 w-4 mr-2" /> Criar Novo Álbum
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-background/50 p-4 rounded-lg shadow card-hover-glow animate-fade-in animation-delay-1200">
                <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-md font-headline flex items-center text-primary">
                        <LinkIcon className="h-4 w-4 mr-2 animate-pulse-slow" />
                        Redes Sociais
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                    {user.socials.map(social => (
                        <Button key={social.platform} variant="outline" className="w-full justify-start text-sm hover:bg-muted/70 button-hover-lift button-neon-glow" asChild>
                            <a href={social.url} target="_blank" rel="noopener noreferrer">
                                {social.icon}
                                <span className="ml-2 font-semibold">{social.platform}:</span>
                                <span className="ml-1.5 text-muted-foreground font-code">{social.handle}</span>
                            </a>
                        </Button>
                    ))}
                    {user.socials.length === 0 && (
                        <p className="text-xs text-muted-foreground">Nenhuma rede social conectada.</p>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex flex-col space-y-2 pt-2 animate-fade-in animation-delay-1300">
              <Button variant="outline" className="w-full hover:bg-primary/10 transition-colors button-hover-lift button-neon-glow">
                Ver Galeria de Pixels <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
               <Button variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground button-hover-lift button-neon-glow">
                Definir Localização no Mapa <Globe className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="secondary" className="w-full hover:bg-secondary/70 transition-colors button-hover-lift button-neon-glow">
                Editar Perfil <Edit3 className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="absolute top-2 right-2 flex space-x-1 animate-fade-in animation-delay-1400">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors button-hover-lift animate-glow" title="Comprar Créditos">
                  <CreditCard className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors button-hover-lift animate-glow animation-delay-100" title="Configurações">
                  <Settings className="h-4 w-4" />
                </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
