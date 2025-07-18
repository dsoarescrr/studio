
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Users as UsersIcon, Plus, Coins, Palette, Bell, Search as SearchIcon, Users2, BarChart3 as AnalyticsIcon, Settings, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/layout/NotificationCenter';
import { useUserStore } from '@/lib/store';
import SearchSystem from '@/components/layout/SearchSystem';
import EnhancedPixelPurchaseModal from '@/components/pixel-grid/EnhancedPixelPurchaseModal';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTranslation } from 'react-i18next';
import { StripeProvider } from '@/components/payment/StripePaymentProvider';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { UserPlus, LogIn, Crown } from 'lucide-react';
import '@/lib/i18n';
import type { Achievement } from '@/data/achievements-data';

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

const BOTTOM_NAV_HEIGHT = '80px';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { notifications, credits, specialCredits, addCredits } = useUserStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedPixelForPurchase, setSelectedPixelForPurchase] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [scaleX, setScaleX] = useState(0.8);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [playHoverSound, setPlayHoverSound] = useState(false);
  const { user } = useAuth();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Pulse animation for nav items
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * navLinks.length);
      setPulseIndex(randomIndex);
      setTimeout(() => setPulseIndex(null), 2000);
    }, 10000);
    return () => clearInterval(interval);
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

  const handleNavHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setPlayHoverSound(true);
      setTimeout(() => setPlayHoverSound(false), 100);
    }, 50);
  };

  return (
    <StripeProvider>
    <>
      <SoundEffect src={SOUND_EFFECTS.HOVER} play={playHoverSound} onEnd={() => setPlayHoverSound(false)} volume={0.2} rate={1.5} />
      <style jsx global>{`
        :root {
          --bottom-nav-height: ${BOTTOM_NAV_HEIGHT};
        }
      `}</style>
      
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full opacity-0",
          "safe-bottom"
        )}
        style={{ height: BOTTOM_NAV_HEIGHT }}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-2xl" />
        <div className="absolute inset-0 border-t border-primary/20 shadow-2xl shadow-primary/10" />

        {/* Enhanced Animated Indicator */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out shadow-lg shadow-primary/50"
          style={{
            left: `${(activeIndex / navLinks.length) * 100}%`,
            width: `${100 / navLinks.length}%`,
            transform: `scaleX(${scaleX})`,
          }}
        />

        {/* Enhanced Floating Particles */}
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
            const isActive = pathname === link.href || pulseIndex === index;
            return (
              <Link 
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium rounded-2xl w-1/5 h-16 transition-all duration-300 relative group overflow-hidden",
                  "hover:bg-primary/10 active:scale-95 transform-gpu",
                  isActive
                    ? "text-primary scale-110 bg-primary/15 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                )}
                onClick={() => {
                  setActiveIndex(index);
                  // Small reward for navigation
                  if (Math.random() > 0.9) {
                    addCredits(1);
                  }
                }}
                onMouseEnter={handleNavHover}
              >
                {/* Active Background */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-primary/15 to-transparent rounded-2xl animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-2xl animate-shimmer" 
                         style={{ backgroundSize: '200% 100%' }} />
                  </>
                )}
                
                {/* Icon Container */}
                <div className="relative mb-1 z-10">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={cn( 
                    "p-2.5 rounded-2xl transition-all duration-500 relative overflow-hidden",
                    isActive
                      ? "bg-primary/20 shadow-lg shadow-primary/30 ring-1 ring-primary/30"
                      : "group-hover:bg-muted/40 group-hover:scale-110 hover:rotate-3"
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
                  </motion.div>
                  
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
                <motion.span animate={isActive ? { y: [0, -2, 0] } : {}} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className={cn( 
                  "transition-all duration-500 font-medium text-xs leading-tight text-center px-1 z-10",
                  isActive && "text-gradient-gold font-bold drop-shadow-sm scale-105 animate-pulse"
                )}>
                  {link.label}
                </motion.span>
                
                {/* Notification Badge */}
                {link.badge && notifications > 0 && link.href === "/member" && ( 
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center justify-center animate-bounce shadow-lg">
                    <span className="animate-pulse">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                    </Badge>
                  </motion.div>
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
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: -8, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }} className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon" 
                className="h-16 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 shadow-2xl shadow-primary/40 border-4 border-background transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden group"
                onMouseEnter={handleNavHover}
              >
                {/* Rotating Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-spin rounded-full opacity-30" 
                     style={{ animationDuration: '10s' }} />
                
                {/* Enhanced Pulse Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                
                <Plus className="h-8 w-8 text-primary-foreground relative z-10 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-125" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-64 mb-4 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-xl">
              <DropdownMenuLabel className="text-center font-headline text-primary">
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>🚀</motion.span> Ações Rápidas
              </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                
                {!user && (
                  <>
                    <AuthModal defaultTab="login">
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                        <div className="flex items-center w-full"> 
                          <div className="p-2 rounded-lg bg-blue-500/20 mr-3 group-hover:scale-110 transition-transform">
                            <LogIn className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">Iniciar Sessão</div>
                            <div className="text-xs text-muted-foreground">Aceda à sua conta</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </AuthModal>
                    
                    <AuthModal defaultTab="register">
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                        <div className="flex items-center w-full"> 
                          <div className="p-2 rounded-lg bg-green-500/20 mr-3 group-hover:scale-110 transition-transform">
                            <UserPlus className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Criar Conta</div>
                            <div className="text-xs text-muted-foreground">Registe-se para comprar pixels</div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </AuthModal>
                    
                    <DropdownMenuSeparator className="bg-primary/10" />
                  </>
                )}
              
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full"> 
                    <div className="p-2 rounded-lg bg-purple-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Palette className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium">{t('pixel.editor')}</div>
                      <div className="text-xs text-muted-foreground">{t('pixel.editor.desc')}</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              
              <NotificationCenter>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer hover:bg-primary/10 transition-colors group">
                  <div className="flex items-center w-full"> 
                    <div className="p-2 rounded-lg bg-blue-500/20 mr-3 group-hover:scale-110 transition-transform">
                      <Bell className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Centro de Notificações</div>
                      <div className="text-xs text-muted-foreground">
                        {notifications > 0 ? `${notifications} novas notificações` : 'Sem notificações'}
                      </div>
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
        </motion.div>

        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-30">
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        </div>
      </nav>
      
      {selectedPixelForPurchase && (
        <EnhancedPixelPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          pixelData={selectedPixelForPurchase}
          userCredits={credits}
          userSpecialCredits={specialCredits}
          onPurchase={handlePurchase}
        />
      )}
    </>
    </StripeProvider>
  );
}
