'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface PixelAnalyticsProps {
  children: React.ReactNode;
}

export default function PixelAnalytics({ children }: PixelAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análise de Píxeis
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tendências de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Preço Médio</span>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>45.50€ (+2.3%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Volume (24h)</span>
                <span className="font-semibold">12,345€</span>
              </div>
               <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Região Mais Ativa</span>
                <span className="font-semibold">Lisboa</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}