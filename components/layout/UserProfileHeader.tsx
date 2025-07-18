

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from './NotificationCenter';
import { useUserStore } from '@/lib/store';
import SearchSystem from './SearchSystem';
import { 
  Award, CreditCard, Sparkles, Gift, Bell, Settings, Menu,
  User, Search, Plus, Crown, Star, LogOut, HelpCircle, MessageSquare,
  BarChart3, Users2, Palette, Coins, Home, ShoppingCart, Users as UsersIcon, 
  BarChart3 as AnalyticsIcon, Shield
} from "lucide-react"; 
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
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
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslation } from 'react-i18next';
import HelpCenter from '@/components/features/HelpCenter';
import TwoFactorAuth from '@/components/security/TwoFactorAuth';
import FeedbackSystem from '@/components/features/FeedbackSystem';
import { useAuth } from '@/lib/auth-context';
import { UserMenu } from '@/components/auth/UserMenu';

const navLinks = [
  { href: "/", label: "Universo", icon: Home, color: "text-blue-500", description: "Explorar o mapa" },
  { href: "/marketplace", label: "Market", icon: ShoppingCart, color: "text-green-500", badge: 5, description: "Comprar píxeis" },
  { href: "/pixels", label: "Galeria", icon: Palette, color: "text-purple-500", badge: 12, description: "Ver píxeis" },
  { href: "/member", label: "Perfil", icon: UsersIcon, color: "text-orange-500", description: "Seu perfil" },
  { href: "/ranking", label: "Ranking", icon: AnalyticsIcon, color: "text-amber-500", badge: 2, description: "Classificações" },
  { href: "/community", label: "Comunidade", icon: Users2, color: "text-pink-500", badge: 3, description: "Interagir com a comunidade" },
  { href: "/settings", label: "Ajustes", icon: Settings, color: "text-gray-500", description: "Configurações" },
  { href: "/achievements", label: "Conquistas", icon: Award, color: "text-yellow-500", description: "Suas conquistas" },
];

export default function UserProfileHeader() {
  const { 
    credits, 
    specialCredits, 
    level, 
    xp, 
    xpMax, 
    pixels, 
    achievements, 
    notifications, 
    isPremium, 
    isVerified,
    clearNotifications
  } = useUserStore();
  
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [formattedCredits, setFormattedCredits] = useState<string | null>(null);
  const [formattedSpecialCredits, setFormattedSpecialCredits] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Combine store data with mock data for a complete user object
  const userData = {
    name: "PixelMasterPT",
    avatarUrl: 'https://placehold.co/40x40.png',
    dataAiHint: 'profile avatar',
    level,
    xp,
    xpMax,
    credits,
    specialCredits,
    pixels,
    achievements,
    notifications,
    isPremium,
    isVerified,
  };


  useEffect(() => {
    setFormattedCredits(credits.toLocaleString('pt-PT'));
    setFormattedSpecialCredits(specialCredits.toLocaleString('pt-PT'));
  }, [credits, specialCredits]);

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

  const xpPercentage = (xp / xpMax) * 100;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500",
      isScrolled 
          ? "border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/10" 
          : "border-transparent bg-background/70 backdrop-blur-md"
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
                      <AvatarImage src={userData.avatarUrl} alt={userData.name} data-ai-hint={userData.dataAiHint} />
                      <AvatarFallback className="font-headline text-3xl">{userData.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                      <Badge className="h-6 w-6 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                        {userData.level}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <SheetTitle className="text-left text-xl font-headline text-gradient-gold">
                      {userData.name}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground font-code">@{userData.name.toLowerCase()}</div>
                      {userData.isPremium && <Crown className="h-3 w-3 text-amber-400" />}
                      {userData.isVerified && <Star className="h-3 w-3 text-blue-400" />}
                    </div>
                  </div>
                </div>
                
                {/* XP Progress */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs">
                    <span>Progresso XP</span>
                    <span className="font-code">{userData.xp}/{userData.xpMax}</span>
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
                    <p className="text-sm font-bold text-green-500">{userData.achievements}</p>
                    <p className="text-xs text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-center shadow-inner">
                    <Sparkles className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-purple-500">{userData.pixels}</p>
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
                  <Link href="/settings">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Definições
                    </Button>
                  </Link>
                  <HelpCenter>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Ajuda & Suporte
                    </Button>
                  </HelpCenter>
                  <Link href="/security">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Segurança
                    </Button>
                  </Link>
                  <Link href="/premium">
                    <Button variant="default" className="w-full justify-start bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90">
                      <Crown className="h-4 w-4 mr-2" />
                      Tornar-se Premium
                    </Button>
                  </Link>
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

        {/* Enhanced Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <SearchSystem>
            <div className="relative w-full cursor-pointer group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="w-full h-9 pl-10 pr-4 bg-background/50 border border-border/60 rounded-full text-sm flex items-center text-muted-foreground group-hover:border-primary/50 group-hover:bg-background/80 transition-all">
                Pesquisar pixels, utilizadores...
              </div>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

          {/* Language Switcher */}
          <LanguageSwitcher variant="ghost" size="icon" showText={false} />

          {/* Quick Add */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hidden sm:flex hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><NotificationCenter>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => clearNotifications()} 
              className="h-8 w-8 relative hover:bg-primary/10 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              </span>
              )}
            </Button>
          </NotificationCenter></motion.div>

          {/* Credits (Mobile Compact) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className={cn(
              "flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-primary/10 rounded-full px-2 py-1 group",
              isAnimating && "animate-bounce-slow"
            )} title={formattedCredits ? `${formattedCredits} Créditos` : 'Créditos'}>
              <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary group-hover:text-primary/80 transition-colors animate-pulse" style={{ animationDuration: '3s' }} />
              {formattedCredits !== null ? (
                <span className="font-code text-xs sm:text-sm text-primary font-bold group-hover:text-primary/80 transition-colors">
                  {typeof window !== 'undefined' && window.innerWidth < 640 ? `${Math.floor(credits / 1000)}K` : formattedCredits}
                </span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
            
            <div className={cn(
              "hidden sm:flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer bg-accent/10 rounded-full px-2 py-1 group",
              isAnimating && "animate-bounce-slow animation-delay-100"
            )} title={formattedSpecialCredits ? `${formattedSpecialCredits} Créditos Especiais` : 'Créditos Especiais'}>
              <Gift className="h-4 w-4 mr-1 text-accent group-hover:text-accent/80 transition-colors animate-pulse" style={{ animationDuration: '4s' }} />
              {formattedSpecialCredits !== null ? (
                <span className="font-code text-sm text-accent font-bold group-hover:text-accent/80 transition-colors">{formattedSpecialCredits}</span>
              ) : (
                <span className="font-code text-xs loading-dots">...</span>
              )}
            </div>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
