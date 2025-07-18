// src/components/auth/RequireAuth.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, UserPlus } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return fallback || (
      <Card className="p-6 text-center">
        <CardContent className="pt-6 pb-4 px-0">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Autenticação Necessária</h3>
          <p className="text-muted-foreground mb-6">
            Precisa de iniciar sessão para aceder a esta funcionalidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <AuthModal defaultTab="login">
              <Button>
                Iniciar Sessão
              </Button>
            </AuthModal>
            <AuthModal defaultTab="register">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </AuthModal>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return <>{children}</>;
}