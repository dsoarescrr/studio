'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from './NotificationCenter';
import SearchSystem from './SearchSystem';
import { 
  Award, CreditCard, Sparkles, Gift, Bell, Settings, Menu, 
  User, Search, Plus, Zap, Crown, Star, LogOut, HelpCircle, MessageSquare,
  BarChart3, Users2, Palette, Coins, Home, ShoppingCart, Users as UsersIcon, BarChart3 as AnalyticsIcon
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
import Link from "next/link";
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: "/", label: "Universo", icon: Home, color: "text-blue-500", description: "Explorar o mapa" },
  { href: "/marketplace", label: "Market", icon: ShoppingCart, color: "text-green-500", badge: 5, description: "Comprar píxeis" },
  { href: "/pixels", label: "Galeria", icon: Palette, color: "text-purple-500", badge: 12, description: "Ver píxeis" },
  { href: "/member", label: "Perfil", icon: UsersIcon, color: "text-orange-500", description: "Seu perfil" },
  { href: "/ranking", label: "Ranking", icon: AnalyticsIcon, color: "text-amber-500", badge: 2, description: "Classificações" },
];

export default function UserProfileHeader() {
  const pathname = usePathname();
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
  const [isScrolled, setIsScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const xpPercentage = (user.xp / user.xpMax) * 100;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500",
      isScrolled 
        ? "border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5" 
        : "border-transparent bg-background/80 backdrop-blur-md"
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      
      <div className="container relative flex h-14 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        {/* Left: Logo + Menu (Mobile) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 sm:hidden hover:bg-primary/10 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 border-b bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                      <AvatarFallback className="text-lg font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <Badge className="h-6 w-6 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                        {user.level}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <SheetTitle className="text-left text-xl font-headline text-gradient-gold">
                      {user.name}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground font-code">@{user.name.toLowerCase()}</div>
                      {user.isPremium && <Crown className="h-3 w-3 text-amber-400" />}
                      {user.isVerified && <Star className="h-3 w-3 text-blue-400" />}
                    </div>
                  </div>
                </div>
                
                {/* XP Progress */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span>Progresso XP</span>
                    <span className="font-code">{user.xp}/{user.xpMax}</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500 animate-pulse"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </div>
              </SheetHeader>
              
              <div className="p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg text-center shadow-inner">
                    <Coins className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-primary">{formattedCredits || '...'}</p>
                    <p className="text-xs text-muted-foreground">Créditos</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg text-center shadow-inner">
                    <Gift className="h-5 w-5 text-accent mx-auto mb-1" />
                    <p className="text-sm font-bold text-accent">{formattedSpecialCredits || '...'}</p>
                    <p className="text-xs text-muted-foreground">Especiais</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center shadow-inner">
                    <Award className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-green-500">{user.achievements}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-center shadow-inner">
                    <Sparkles className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-purple-500">{user.pixels}</p>
                    <p className="text-xs text-muted-foreground">Pixels</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link href={link.href} key={link.href}>
                      <Button 
                        variant={pathname === link.href ? "default" : "ghost"} 
                        className="w-full justify-start text-sm h-10 transition-all duration-300"
                      >
                        {React.cloneElement(link.icon as React.ReactElement, { 
                          className: cn("h-4 w-4 mr-3", pathname === link.href ? link.color : "text-muted-foreground") 
                        })}
                        {link.label}
                        {link.badge && (
                          <Badge className="ml-auto bg-red-500 text-white">{link.badge}</Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="space-y-1 pt-4 border-t border-border/50">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Definições
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Ajuda & Suporte
                  </Button>
                  <Button variant="destructive" className="w-full justify-start mt-4" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminar Sessão
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
              <Image 
                src="/logo.png" 
                alt="Pixel Universe" 
                width={32} 
                height={32} 
                className="relative z-10 transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
            <span className="hidden sm:block font-headline text-lg font-bold text-gradient-gold transition-all duration-300 group-hover:scale-105">
              Pixel Universe
            </span>
          </Link>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <SearchSystem>
            <div className="relative w-full cursor-pointer group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-full h-9 pl-10 pr-4 bg-background/50 border border-border/60 rounded-full text-sm flex items-center text-muted-foreground group-hover:border-primary/50 group-hover:bg-background/80 transition-all">
                Pesquisar pixels, utilizadores...
              </div>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
              </div>
            </div>
          </SearchSystem>
        </div>

        {/* Right: User Info + Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Search */}
          <SearchSystem>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:hidden hover:bg-primary/10 transition-colors"
            >
              <Search className="h-4 w-4" />
            </Button>
          </SearchSystem>

          {/* Quick Add */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hidden sm:flex hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <NotificationCenter>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 relative hover:bg-primary/10 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[10px] text-white font-bold">
                  {user.notifications}
                </span>
              </span>
            </Button>
          </NotificationCenter>

          {/* Credits (Mobile Compact) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className={cn(
              "flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-primary/10 rounded-full px-2 py-1 group",
              isAnimating && "animate-bounce-slow"
            )} title={formattedCredits ? `${formattedCredits} Créditos` : 'Créditos'}>
              <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary group-hover:text-primary/80 transition-colors" />
              {formattedCredits !== null ? (
                <span className="font-code text-xs sm:text-sm text-primary font-bold group-hover:text-primary/80 transition-colors">
                  {typeof window !== 'undefined' && window.innerWidth < 640 ? `${Math.floor(user.credits / 1000)}K` : formattedCredits}
                </span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
            
            <div className={cn(
              "hidden sm:flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-accent/10 rounded-full px-2 py-1 group",
              isAnimating && "animate-bounce-slow animation-delay-100"
            )} title={formattedSpecialCredits ? `${formattedSpecialCredits} Créditos Especiais` : 'Créditos Especiais'}>
              <Gift className="h-4 w-4 mr-1 text-accent group-hover:text-accent/80 transition-colors" />
              {formattedSpecialCredits !== null ? (
                <span className="font-code text-sm text-accent font-bold group-hover:text-accent/80 transition-colors">{formattedSpecialCredits}</span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full p-0 hover:bg-primary/10 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-primary/50 hover:border-primary transition-colors">
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                    <AvatarFallback className="text-xs font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 mt-1 p-2 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl" 
              align="end" 
              forceMount
            >
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                  <AvatarFallback className="text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">Nível {user.level}</Badge>
                    {user.isPremium && (
                      <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-muted/20 rounded-lg">
                <div className="flex justify-between text-xs mb-1">
                  <span>XP: {user.xp}/{user.xpMax}</span>
                  <span>{Math.round(xpPercentage)}%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
              
              <DropdownMenuSeparator className="my-2" />
              
              <Link href="/member">
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <span>Perfil Completo</span>
                </DropdownMenuItem>
              </Link>
              
              <Link href="/achievements">
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>Conquistas</span>
                  <Badge className="ml-auto bg-red-500 text-white text-xs">2</Badge>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                <CreditCard className="mr-2 h-4 w-4 text-green-500" />
                <span>Carteira</span>
                <span className="ml-auto text-xs text-muted-foreground">{formattedCredits}</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                <HelpCircle className="mr-2 h-4 w-4 text-blue-500" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                <span>Feedback</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Definições</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-red-500/10 transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Terminar Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
