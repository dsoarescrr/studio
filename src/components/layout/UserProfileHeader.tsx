'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, CreditCard, Sparkles, Gift, Bell, Settings, Menu, 
  User, Search, Plus, Zap, Crown, Star
} from "lucide-react"; 
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function UserProfileHeader() {
  const user = {
    name: "PixelMasterPT",
    avatarUrl: "https://placehold.co/40x40.png",
    dataAiHint: "profile avatar",
    credits: 12500,
    specialCredits: 120,
    achievements: 5, 
    pixels: 42,
    level: 8,
    xp: 2450,
    xpMax: 3000,
    notifications: 3,
    isPremium: true,
    isVerified: true,
  };

  const [formattedCredits, setFormattedCredits] = useState<string | null>(null);
  const [formattedSpecialCredits, setFormattedSpecialCredits] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setFormattedCredits(user.credits.toLocaleString('pt-PT'));
    setFormattedSpecialCredits(user.specialCredits.toLocaleString('pt-PT'));
  }, [user.credits, user.specialCredits]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const xpPercentage = (user.xp / user.xpMax) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-lg">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      
      <div className="container relative flex h-14 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        {/* Left: Logo + Menu (Mobile) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                    <AvatarFallback className="text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-left text-lg font-headline text-gradient-gold">
                      {user.name}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Nível {user.level}</Badge>
                      {user.isPremium && <Crown className="h-3 w-3 text-amber-400" />}
                      {user.isVerified && <Star className="h-3 w-3 text-blue-400" />}
                    </div>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="p-4 space-y-4">
                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progresso XP</span>
                    <span className="font-code">{user.xp}/{user.xpMax}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg text-center">
                    <CreditCard className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-primary">{formattedCredits || '...'}</p>
                    <p className="text-xs text-muted-foreground">Créditos</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg text-center">
                    <Gift className="h-5 w-5 text-accent mx-auto mb-1" />
                    <p className="text-sm font-bold text-accent">{formattedSpecialCredits || '...'}</p>
                    <p className="text-xs text-muted-foreground">Especiais</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center">
                    <Award className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-green-500">{user.achievements}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-center">
                    <Sparkles className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-purple-500">{user.pixels}</p>
                    <p className="text-xs text-muted-foreground">Pixels</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Ver Perfil Completo
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Definições
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Comprar Créditos
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image src="/logo.png" alt="Pixel Universe" width={32} height={32} className="animate-glow" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <span className="hidden sm:block font-headline text-lg font-bold text-gradient-gold">
              Pixel Universe
            </span>
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar pixels, utilizadores..."
              className="w-full h-9 pl-10 pr-4 bg-background/50 border border-border/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Right: User Info + Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Quick Add */}
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            {user.notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500 flex items-center justify-center animate-pulse">
                {user.notifications}
              </Badge>
            )}
          </Button>

          {/* Credits (Mobile Compact) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className={cn(
              "flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-primary/10 rounded-full px-2 py-1",
              isAnimating && "animate-bounce-slow"
            )} title={formattedCredits ? `${formattedCredits} Créditos` : 'Créditos'}>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
              {formattedCredits !== null ? (
                <span className="font-code text-xs sm:text-sm text-primary font-bold">
                  {window.innerWidth < 640 ? `${Math.floor(user.credits / 1000)}K` : formattedCredits}
                </span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
            
            <div className={cn(
              "hidden sm:flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-accent/10 rounded-full px-2 py-1",
              isAnimating && "animate-bounce-slow animation-delay-100"
            )} title={formattedSpecialCredits ? `${formattedSpecialCredits} Créditos Especiais` : 'Créditos Especiais'}>
              <Gift className="h-4 w-4 mr-1 text-accent" />
              {formattedSpecialCredits !== null ? (
                <span className="font-code text-sm text-accent font-bold">{formattedSpecialCredits}</span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8 border-2 border-primary/50 hover:border-primary transition-colors">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                  <AvatarFallback className="text-xs font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Nível {user.level}</Badge>
                    {user.isPremium && (
                      <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Award className="mr-2 h-4 w-4" />
                <span>Conquistas</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Comprar Créditos</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Definições</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}