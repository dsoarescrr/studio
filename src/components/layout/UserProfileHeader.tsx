
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CreditCard, Sparkles, Gift } from "lucide-react"; 
import React, { useState, useEffect } from 'react';

const PixelStarLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 15 15" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className || "h-8 w-8"} // Default size, can be overridden
    shapeRendering="crispEdges" // Ensures pixelated look when scaled
  >
    {/* Orange/Accent shadow pixels first (drawn below yellow) */}
    <rect x="8" y="1" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="9" y="2" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="10" y="2" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="11" y="3" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="12" y="3" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="13" y="4" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="14" y="5" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="13" y="6" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="12" y="7" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="11" y="8" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="5" y="9" width="1" height="1" fill="hsl(var(--accent))" /> {/* Arm/Leg Shadows */}
    <rect x="11" y="9" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="4" y="10" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="12" y="10" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="3" y="11" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="13" y="11" width="1" height="1" fill="hsl(var(--accent))" />
    {/* Bottom Shadows */}
    <rect x="7" y="12" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="6" y="12" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="8" y="12" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="5" y="13" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="9" y="13" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="4" y="14" width="1" height="1" fill="hsl(var(--accent))" />
    <rect x="10" y="14" width="1" height="1" fill="hsl(var(--accent))" />

    {/* Yellow/Primary main body pixels */}
    <rect x="7" y="0" width="1" height="1" fill="hsl(var(--primary))" />
    <rect x="6" y="1" width="3" height="1" fill="hsl(var(--primary))" /> {/* Covers orange shadow at (7,1) if any */}
    <rect x="5" y="2" width="5" height="1" fill="hsl(var(--primary))" />
    <rect x="2" y="3" width="11" height="1" fill="hsl(var(--primary))" />
    <rect x="1" y="4" width="13" height="1" fill="hsl(var(--primary))" />
    {/* Row 5 (with eyes) */}
    <rect x="0" y="5" width="5" height="1" fill="hsl(var(--primary))" />
    <rect x="5" y="5" width="1" height="1" fill="hsl(var(--background))" /> {/* Eye 1 */}
    <rect x="6" y="5" width="3" height="1" fill="hsl(var(--primary))" />
    <rect x="9" y="5" width="1" height="1" fill="hsl(var(--background))" /> {/* Eye 2 */}
    <rect x="10" y="5" width="5" height="1" fill="hsl(var(--primary))" />
    {/* End Row 5 */}
    <rect x="1" y="6" width="13" height="1" fill="hsl(var(--primary))" />
    <rect x="2" y="7" width="11" height="1" fill="hsl(var(--primary))" />
    <rect x="3" y="8" width="9" height="1" fill="hsl(var(--primary))" />
    {/* Arms */}
    <rect x="4" y="9" width="1" height="1" fill="hsl(var(--primary))" />
    <rect x="10" y="9" width="1" height="1" fill="hsl(var(--primary))" />
    {/* Legs */}
    <rect x="3" y="10" width="1" height="1" fill="hsl(var(--primary))" />
    <rect x="11" y="10" width="1" height="1" fill="hsl(var(--primary))" />
    {/* Feet */}
    <rect x="2" y="11" width="1" height="1" fill="hsl(var(--primary))" />
    <rect x="12" y="11" width="1" height="1" fill="hsl(var(--primary))" />
  </svg>
);


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
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left: Avatar + Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
            <AvatarFallback className="text-xs sm:text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm sm:text-md font-semibold font-headline text-foreground">{user.name}</p>
          </div>
        </div>

        {/* Centered Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <PixelStarLogo className="h-10 w-10" />
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
