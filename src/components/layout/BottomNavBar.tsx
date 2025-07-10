'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Trophy, BarChartHorizontalBig, Users, Plus, Zap } from 'lucide-react';
import { ShoppingCart, Palette, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PixelMarketplace from '@/components/features/PixelMarketplace';
import ThemeCustomizer from '@/components/features/ThemeCustomizer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { href: "/", label: "Universo", icon: Home, color: "text-blue-500" },
  { href: "/achievements", label: "Conquistas", icon: Trophy, color: "text-yellow-500" },
  { href: "/ranking", label: "Ranking", icon: BarChartHorizontalBig, color: "text-green-500" },
  { href: "/community", label: "Comunidade", icon: Users, color: "text-purple-500" },
  { href: "/member", label: "Perfil", icon: User, color: "text-pink-500" },
];

// Enhanced height for better touch targets on mobile
const BOTTOM_NAV_HEIGHT = '72px';

export default function BottomNavBar() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const currentIndex = navLinks.findIndex(link => link.href === pathname);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [pathname]);

  // Auto-hide on scroll (optional)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <style jsx global>{`
        :root {
          --bottom-nav-height: ${BOTTOM_NAV_HEIGHT};
        }
      `}</style>
      
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: BOTTOM_NAV_HEIGHT }}
      >
        {/* Enhanced background with blur and gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/90 backdrop-blur-xl border-t border-border/60 shadow-2xl" />
        
        {/* Animated top border */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ease-out shadow-lg"
          style={{
            left: `${(activeIndex / navLinks.length) * 100}%`,
            width: `${100 / navLinks.length}%`
          }}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
              style={{
                left: `${15 + i * 12}%`,
                top: '25%',
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        <div className="container relative mx-auto flex h-full items-center justify-around max-w-screen-md px-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium rounded-xl w-1/5 h-14 transition-all duration-300 relative group overflow-hidden",
                  "hover:bg-muted/50 active:scale-95",
                  isActive 
                    ? "text-primary transform scale-110 bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                )}
                onClick={() => setActiveIndex(index)}
              >
                {/* Background glow for active item */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/10 to-transparent rounded-xl animate-pulse" />
                )}
                
                {/* Icon container with enhanced effects */}
                <div className="relative mb-1">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300 relative z-10",
                    isActive 
                      ? "bg-primary/20 shadow-lg" 
                      : "group-hover:bg-muted/30"
                  )}>
                    <link.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive 
                        ? `${link.color} animate-glow drop-shadow-lg` 
                        : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  </div>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-xl transition-opacity duration-300 -z-10",
                    isActive 
                      ? "bg-primary/30 opacity-100 animate-pulse" 
                      : "bg-primary/20 opacity-0 group-hover:opacity-100"
                  )} style={{ transform: 'scale(1.2)' }} />
                </div>
                
                {/* Label with enhanced styling */}
                <span className={cn(
                  "transition-all duration-300 font-code text-xs leading-tight text-center px-1",
                  isActive && "text-gradient-gold font-bold drop-shadow-sm"
                )}>
                  {link.label}
                </span>
                
                {/* Ripple effect on touch */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-primary/30 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
                </div>

                {/* Notification badges for specific pages */}
                {link.href === '/achievements' && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-500 flex items-center justify-center animate-bounce">
                    2
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Action Button (Floating) */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl border-4 border-background transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Plus className="h-6 w-6 text-primary-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-56 mb-2">
              <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <PixelMarketplace>
                <DropdownMenuItem className="cursor-pointer">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Marketplace
                </DropdownMenuItem>
              </PixelMarketplace>
              <ThemeCustomizer>
                <DropdownMenuItem className="cursor-pointer">
                  <Palette className="h-4 w-4 mr-2" />
                  Personalizar Tema
                </DropdownMenuItem>
              </ThemeCustomizer>
              <DropdownMenuItem>
                <Zap className="h-4 w-4 mr-2" />
                Comprar Créditos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Gift className="h-4 w-4 mr-2" />
                Eventos Especiais
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}