
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, CreditCard, Sparkles, Gift } from "lucide-react"; // Added Gift icon

export default function UserProfileHeader() {
  // This data would typically come from a context or API call
  const user = {
    name: "PixelMasterPT",
    avatarUrl: "https://placehold.co/40x40.png",
    dataAiHint: "profile avatar",
    credits: 12500, // Updated to match MemberPage
    specialCredits: 120, // Added special credits
    achievements: 5, // Number of unique achievements with at least one tier unlocked
    pixels: 42,
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
            <AvatarFallback className="text-xs sm:text-sm font-headline">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm sm:text-md font-semibold font-headline text-foreground">{user.name}</p>
            {/* <p className="text-xs text-green-400 font-code">Online</p> */}
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
          <div className="flex items-center text-foreground" title={`${user.credits.toLocaleString()} Créditos`}>
            <CreditCard className="h-4 w-4 mr-1.5 text-primary" />
            <span className="font-code">{user.credits.toLocaleString()}</span>
          </div>
           <div className="hidden sm:flex items-center text-foreground" title={`${user.specialCredits.toLocaleString()} Créditos Especiais`}>
            <Gift className="h-4 w-4 mr-1.5 text-accent" />
            <span className="font-code">{user.specialCredits.toLocaleString()}</span>
          </div>
          <div className="hidden sm:flex items-center text-foreground" title={`${user.achievements} Conquistas Únicas`}>
            <Award className="h-4 w-4 mr-1.5 text-yellow-400" />
            <span className="font-code">{user.achievements}</span>
          </div>
          <div className="flex items-center text-foreground" title={`${user.pixels} Pixels Adquiridos`}>
            <Sparkles className="h-4 w-4 mr-1.5 text-purple-400" />
            <span className="font-code">{user.pixels}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
