
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Users as UsersIcon, Plus, Zap, Coins, Palette, Bell, Search as SearchIcon, Users2, BarChart3 as AnalyticsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/layout/NotificationCenter';
import SearchSystem from '@/components/layout/SearchSystem';
import PixelPurchaseModal from '@/components/pixel-grid/PixelPurchaseModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PixelAnalytics,
  PixelCollaborationSystem,
  PixelMarketplace,
  PixelWallet,
  ThemeCustomizer
} from '@/components/features';

const navLinks = [
  { href: "/", label: "Universo", icon: Home, color: "text-blue-500", description: "Explorar o mapa" },
  { href: "/marketplace", label: "Market", icon: ShoppingCart, color: "text-green-500", badge: 5, description: "Comprar píxeis" },
  { href: "/pixels", label: "Galeria", icon: Palette, color: "text-purple-500", badge: 12, description: "Ver píxeis" },
  { href: "/member", label: "Perfil", icon: UsersIcon, color: "text-orange-500", description: "Seu perfil" },
  { href: "/ranking", label: "Ranking", icon: AnalyticsIcon, color: "text-amber-500", badge: 2, description: "Classificações" },
];

const BOTTOM_NAV_HEIGHT = '80px';

export default function BottomNavBar() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedPixelForPurchase, setSelectedPixelForPurchase] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [scaleX, setScaleX] = useState(0.8);

  useEffect(() => {
    const currentIndex = navLinks.findIndex(link => link.href === pathname);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [pathname]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setScaleX(0.8 + Math.sin(Date.now() / 1000) * 0.1);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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

  const handleSelectPixel = (pixelData: any) => {
    setSelectedPixelForPurchase(pixelData);
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (pixelData: any, paymentMethod: string, customizations: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.1;
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --bottom-nav-height: ${BOTTOM_NAV_HEIGHT};
        }
      `}</style>
      
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full",
          "safe-bottom"
        )}
        style={{ height: BOTTOM_NAV_HEIGHT }}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-2xl" />
        <div className="absolute inset-0 border-t border-primary/20 shadow-2xl shadow-primary/10" />
        
        {/* Animated Indicator */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out shadow-lg shadow-primary/50"
          style={{
            left: `${(activeIndex / navLinks.length) * 100}%`,
            width: `${100 / navLinks.length}%`,
            transform: `scaleX(${scaleX})`,
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${10 + i * 8}%`,
                top: '20%',
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i * 0.3}s`,
                opacity: 0.3 + Math.sin(i) * 0.2,
              }}
            />
          ))}
        </div>
        
        <div className="container relative mx-auto flex h-full items-center justify-around max-w-screen-lg px-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium rounded-2xl w-1/5 h-16 transition-all duration-500 relative group overflow-hidden",
                  "hover:bg-primary/10 active:scale-95 transform-gpu",
                  isActive 
                    ? "text-primary scale-110 bg-primary/15 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                )}
                onClick={() => setActiveIndex(index)}
              >
                {/* Active Background */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-primary/15 to-transparent rounded-2xl animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-2xl animate-shimmer" 
                         style={{ backgroundSize: '200% 100%' }} />
                  </>
                )}
                
                {/* Icon Container */}
                <div className="relative mb-1 z-10">
                  <div className={cn(
                    "p-2.5 rounded-2xl transition-all duration-500 relative overflow-hidden",
                    isActive 
                      ? "bg-primary/20 shadow-lg shadow-primary/30 ring-1 ring-primary/30" 
                      : "group-hover:bg-muted/40 group-hover:scale-110"
                  )}>
                    <link.icon className={cn(
                      "h-6 w-6 transition-all duration-500 transform-gpu",
                      isActive 
                        ? `${link.color} drop-shadow-lg scale-110` 
                        : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                    )} />
                    
                    {/* Glow Effect for Active */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-sm animate-pulse" />
                    )}
                  </div>
                  
                  {/* Pulse Ring for Active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" 
                         style={{ animationDuration: '2s' }} />
                  )}
                  
                  {/* Hover Glow */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-300 -z-10 blur-lg",
                    isActive 
                      ? "bg-primary/30 opacity-100" 
                      : "bg-primary/20 opacity-0 group-hover:opacity-60 scale-125"
                  )} />
                </div>
                
                {/* Label with Enhanced Typography */}
                <span className={cn(
                  "transition-all duration-500 font-medium text-xs leading-tight text-center px-1 z-10",
                  isActive && "text-gradient-gold font-bold drop-shadow-sm scale-105"
                )}>
                  {link.label}
                </span>
                
                {/* Notification Badge */}
                {link.badge && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center animate-bounce shadow-lg">
                    {link.badge}
                  </Badge>
                )}

                {/* Interaction Ripple */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 transform scale-0 group-active:scale-100 transition-transform duration-300 rounded-2xl blur-sm" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Enhanced Floating Action Button */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 shadow-2xl shadow-primary/40 border-4 border-background transition-all duration-500 hover:scale-110 active:scale-95 relative overflow-hidden group"
              >
                {/* Rotating Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-spin rounded-full opacity-20" 
                     style={{ animationDuration: '8s' }} />
                
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full animate-ping opacity-30" />
                
                <Plus className="h-8 w-8 text-primary-foreground relative z-10 transition-transform duration-300 group-hover:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-64 mb-4 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl">
              <DropdownMenuLabel className="text-center font-headline text-primary">
                🚀 Ações Rápidas
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />
              
              <PixelMarketplace onSelectPixel={handleSelectPixel}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-purple-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Palette className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium">Editor de Píxeis</div>
                      <div className="text-xs text-muted-foreground">Criar e editar píxeis</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </PixelMarketplace>
              
              <PixelCollaborationSystem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-blue-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Users2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Projetos Colaborativos</div>
                      <div className="text-xs text-muted-foreground">Trabalhar em equipa</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </PixelCollaborationSystem>
              
              <PixelAnalytics>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-cyan-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <AnalyticsIcon className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <div className="font-medium">Análise de Mercado</div>
                      <div className="text-xs text-muted-foreground">Dados e insights</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </PixelAnalytics>

              <DropdownMenuSeparator className="bg-primary/10" />

              <ThemeCustomizer>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-pink-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Palette className="h-4 w-4 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-medium">Personalizar Tema</div>
                      <div className="text-xs text-muted-foreground">Customizar aparência</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </ThemeCustomizer>
              
              <PixelWallet>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-amber-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-medium">Carteira Digital</div>
                      <div className="text-xs text-muted-foreground">Gerir créditos</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </PixelWallet>
              
              <NotificationCenter>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-blue-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Bell className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Centro de Notificações</div>
                      <div className="text-xs text-muted-foreground">Alertas e atualizações</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </NotificationCenter>
              
              <SearchSystem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full">
                    <div className="p-2 rounded-lg bg-pink-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <SearchIcon className="h-4 w-4 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-medium">Pesquisa Avançada</div>
                      <div className="text-xs text-muted-foreground">Encontrar píxeis</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </SearchSystem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-30">
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        </div>
      </nav>
      
      <PixelPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        pixelData={selectedPixelForPurchase}
        userCredits={12500}
        userSpecialCredits={120}
        onPurchase={handlePurchase}
      />
    </>
  );
}
