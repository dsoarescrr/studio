'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Add event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 5000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline && !showReconnected) return null;
  
  return (
    <AnimatePresence>
      {(!isOnline || showReconnected) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4"
        >
          <Alert 
            variant={isOnline ? "default" : "destructive"}
            className={`max-w-md ${isOnline ? 'bg-green-500/90 text-white' : 'bg-destructive/90 text-destructive-foreground'}`}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <AlertTitle>
              {isOnline ? 'Conexão Restaurada' : 'Sem Conexão'}
            </AlertTitle>
            <AlertDescription>
              {isOnline 
                ? 'Você está online novamente. Todas as funcionalidades foram restauradas.'
                : 'Você está offline. Algumas funcionalidades podem não estar disponíveis.'}
            </AlertDescription>
            {!isOnline && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-background/20 hover:bg-background/40 border-destructive-foreground/20"
                onClick={() => window.location.reload()}
              >
                Tentar Reconectar
              </Button>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
