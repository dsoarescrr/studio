// src/app/page.tsx
'use client';

import React, { useEffect } from 'react';
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MapSidebar from '@/components/layout/MapSidebar';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import UserProfileHeader from '@/components/layout/UserProfileHeader';
import BottomNavBar from '@/components/layout/BottomNavBar';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Show welcome message for new visitors
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('pixel-universe-welcome-seen');
    if (!hasSeenWelcome && !user) {
      // Set welcome seen flag
      localStorage.setItem('pixel-universe-welcome-seen', 'true');
    }
  }, [user]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <UserProfileHeader />
      <main className="flex-1 flex overflow-hidden pt-14 pb-[var(--bottom-nav-height)]">
        <SidebarProvider>
          <div className="relative h-full w-full flex">
            <MapSidebar />
            <div className="flex-1 h-full relative">
              <PixelGrid />
              
              {/* Welcome overlay for non-authenticated users */}
              {!user && (
                <div className="absolute bottom-24 right-6 z-30 max-w-sm">
                  <div className="bg-card/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-primary/30 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Bem-vindo ao Pixel Universe!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore o mapa livremente. Para comprar pixels e desbloquear todas as funcionalidades, crie uma conta ou inicie sessão.
                    </p>
                    <div className="flex gap-2">
                      <AuthModal defaultTab="login">
                        <Button variant="outline" size="sm" className="flex-1">
                          <LogIn className="h-4 w-4 mr-2" />
                          Entrar
                        </Button>
                      </AuthModal>
                      <AuthModal defaultTab="register">
                        <Button size="sm" className="flex-1">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Registar
                        </Button>
                      </AuthModal>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <PerformanceMonitor />
          </div>
        </SidebarProvider>
      </main>
      <BottomNavBar />
    </div>
  );
}
