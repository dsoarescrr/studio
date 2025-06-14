
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, MapPin, CreditCard, Sparkles } from "lucide-react";

export default function UserProfileHeader() {
  const user = {
    name: "PixelMaster",
    avatarUrl: "https://placehold.co/40x40.png",
    credits: 1250,
    achievements: 15,
    pixels: 42,
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-xl p-3 shadow-lg bg-card/85 backdrop-blur-md rounded-xl flex items-center justify-between space-x-3 sm:space-x-4">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary">
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
          <AvatarFallback className="text-xs sm:text-sm">{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs sm:text-sm font-semibold font-headline text-foreground">{user.name}</p>
          {/* <p className="text-xs text-green-400 font-code">Online</p> */}
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-foreground">
        <div className="flex items-center" title={`${user.credits} Créditos`}>
          <CreditCard className="h-4 w-4 mr-1 text-primary" />
          <span className="font-code">{user.credits.toLocaleString()}</span>
        </div>
        <div className="flex items-center" title={`${user.achievements} Conquistas`}>
          <Award className="h-4 w-4 mr-1 text-accent" />
          <span className="font-code">{user.achievements}</span>
        </div>
        <div className="flex items-center" title={`${user.pixels} Pixels`}>
          <Sparkles className="h-4 w-4 mr-1 text-purple-400" /> {/* Changed from MapPin to Sparkles for variety */}
          <span className="font-code">{user.pixels}</span>
        </div>
      </div>
    </div>
  );
}
