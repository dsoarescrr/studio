'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CreditCard, Sparkles, Gift } from "lucide-react"; 
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function UserProfileHeader() {
  const user = {
    name: "PixelMasterPT",
    avatarUrl: "https://placehold.co/40x40.png",
    dataAiHint: "profile avatar",
    credits: 12500,
    specialCredits: 120,
    achievements: 5, 
    pixels: 42,
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

  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70 shadow-md animate-slide-in-up">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left: Avatar + Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 animate-fade-in">
          <div className="relative">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary shadow-sm animate-glow">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
              <AvatarFallback className="text-xs sm:text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background" />
          </div>
          <div>
            <p className="text-sm sm:text-md font-semibold font-headline text-foreground text-glow">{user.name}</p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-code">Online</span>
            </div>
          </div>
        </div>

        {/* Centered Logo with enhanced effects */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float">
          <div className="relative">
            <Image src="/logo.png" alt="Pixel Universe Logo" width={40} height={40} className="animate-glow" />
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Right: Stats with enhanced animations */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs animate-fade-in animation-delay-200">
          <div className={cn(
            "flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer",
            isAnimating && "animate-bounce-slow"
          )} title={formattedCredits ? `${formattedCredits} Créditos` : 'Créditos'}>
            <CreditCard className="h-4 w-4 mr-1.5 text-primary animate-pulse-slow" />
            {formattedCredits !== null ? (
              <span className="font-code text-gradient-gold font-bold">{formattedCredits}</span>
            ) : (
              <span className="font-code loading-dots">Carregando</span>
            )}
          </div>
          
          <div className={cn(
            "hidden sm:flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer",
            isAnimating && "animate-bounce-slow animation-delay-100"
          )} title={formattedSpecialCredits ? `${formattedSpecialCredits} Créditos Especiais` : 'Créditos Especiais'}>
            <Gift className="h-4 w-4 mr-1.5 text-accent animate-pulse-slow" />
            {formattedSpecialCredits !== null ? (
              <span className="font-code text-accent font-bold">{formattedSpecialCredits}</span>
            ) : (
              <span className="font-code loading-dots">Carregando</span>
            )}
          </div>
          
          <div className={cn(
            "hidden sm:flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer",
            isAnimating && "animate-bounce-slow animation-delay-200"
          )} title={`${user.achievements} Conquistas Únicas`}>
            <Award className="h-4 w-4 mr-1.5 text-yellow-400 animate-pulse-slow" />
            <span className="font-code text-yellow-400 font-bold">{user.achievements}</span>
          </div>
          
          <div className={cn(
            "flex items-center text-foreground transition-all duration-300 hover:scale-105 cursor-pointer",
            isAnimating && "animate-bounce-slow animation-delay-300"
          )} title={`${user.pixels} Pixels Adquiridos`}>
            <Sparkles className="h-4 w-4 mr-1.5 text-purple-400 animate-pulse-slow" />
            <span className="font-code text-purple-400 font-bold">{user.pixels}</span>
          </div>
        </div>
      </div>
    </div>
  );
}