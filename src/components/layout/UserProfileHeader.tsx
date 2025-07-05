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

  useEffect(() => {
    setFormattedCredits(user.credits.toLocaleString('pt-PT'));
    setFormattedSpecialCredits(user.specialCredits.toLocaleString('pt-PT'));
  }, [user.credits, user.specialCredits]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70 shadow-md">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left: Avatar + Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary shadow-sm">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
            <AvatarFallback className="text-xs sm:text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm sm:text-md font-semibold font-headline text-foreground">{user.name}</p>
          </div>
        </div>

        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Image src="/logo.png" alt="Pixel Universe Logo" width={40} height={40} />
        </div>

        {/* Right: Stats */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
          <div className="flex items-center text-foreground" title={formattedCredits ? `${formattedCredits} Créditos` : 'Créditos'}>
            <CreditCard className="h-4 w-4 mr-1.5 text-primary" />
            {formattedCredits !== null ? <span className="font-code">{formattedCredits}</span> : <span className="font-code">...</span>}
          </div>
           <div className="hidden sm:flex items-center text-foreground" title={formattedSpecialCredits ? `${formattedSpecialCredits} Créditos Especiais` : 'Créditos Especiais'}>
            <Gift className="h-4 w-4 mr-1.5 text-accent" />
            {formattedSpecialCredits !== null ? <span className="font-code">{formattedSpecialCredits}</span> : <span className="font-code">...</span>}
          </div>
          <div className="hidden sm:flex items-center text-foreground" title={`${user.achievements} Conquistas Únicas`}>
            <Award className="h-4 w-4 mr-1.5 text-yellow-400" />
            <span className="font-code">{user.achievements}</span>
          </div>
          <div className="flex items-center text-foreground" title={`${user.pixels} Pixels Adquiridos`}>
            <Sparkles className="h-4 w-4 mr-1.5 text-purple-400" /> {/* Sparkles icon remains for this stat */}
            <span className="font-code">{user.pixels}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
