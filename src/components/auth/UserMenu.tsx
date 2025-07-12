// src/components/auth/UserMenu.tsx
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './AuthModal';
import { useUserStore } from '@/lib/store';
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
  User,
  LogOut,
  Settings,
  Award,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Crown,
  Star,
  Coins,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { user, logOut } = useAuth();
  const { 
    credits, 
    specialCredits, 
    level, 
    xp, 
    xpMax, 
    achievements, 
    notifications, 
    isPremium, 
    isVerified,
    clearNotifications
  } = useUserStore();
  const { toast } = useToast();
  
  const xpPercentage = (xp / xpMax) * 100;
  
  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  if (!user) {
    return (
      <AuthModal>
        <Button variant="default" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>Entrar</span>
        </Button>
      </AuthModal>
    );
  }
  
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-8 w-8 rounded-full p-0 hover:bg-primary/10 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-primary/50 hover:border-primary transition-colors">
                <AvatarImage 
                  src={user.photoURL || `https://placehold.co/40x40.png?text=${user.displayName?.charAt(0) || 'U'}`} 
                  alt={user.displayName || 'User'} 
                  className="hover:scale-110 transition-transform duration-300" 
                />
                <AvatarFallback className="text-xs font-headline">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
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
              <AvatarImage 
                src={user.photoURL || `https://placehold.co/40x40.png?text=${user.displayName?.charAt(0) || 'U'}`} 
                alt={user.displayName || 'User'} 
              />
              <AvatarFallback className="text-sm font-headline">
                {user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {user.displayName || 'Utilizador'}
              </p>
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">Nível {level}</Badge>
                {isPremium && (
                  <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
          
          <div className="mt-2 p-2 bg-muted/20 rounded-lg">
            <div className="flex justify-between text-xs mb-1">
              <span>XP: {xp}/{xpMax}</span>
              <span>{Math.round(xpPercentage)}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
          
          <DropdownMenuSeparator className="my-2" />
          
          <Link href="/member">
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors hover:scale-[1.02]">
              <User className="mr-2 h-4 w-4 text-primary" />
              <span>Perfil Completo</span>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/achievements">
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Award className="mr-2 h-4 w-4 text-yellow-500 animate-pulse" style={{ animationDuration: '3s' }} />
              <span>Conquistas</span>
              <Badge className="ml-auto bg-red-500 text-white text-xs">{achievements}</Badge>
            </DropdownMenuItem>
          </Link>
          
          <Link href="/premium">
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Crown className="mr-2 h-4 w-4 text-amber-500 animate-pulse" style={{ animationDuration: '3s' }} />
              <span>Tornar-se Premium</span>
              {isPremium && (
                <Badge className="ml-auto bg-green-500 text-white text-xs">Ativo</Badge>
              )}
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
            <CreditCard className="mr-2 h-4 w-4 text-green-500" />
            <span>Carteira Digital</span>
            <span className="ml-auto text-xs text-muted-foreground">{credits.toLocaleString('pt-PT')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-2" />
          
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 transition-colors">
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              <span>Preferências</span>
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuSeparator className="my-2" />
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Terminar Sessão</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
