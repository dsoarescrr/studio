'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gavel, Clock } from 'lucide-react';

interface PixelAuctionSystemProps {
  children: React.ReactNode;
}

export default function PixelAuctionSystem({ children }: PixelAuctionSystemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Sistema de Leilões
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leilão em Destaque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Pixel Raro em Faro</p>
                  <p className="text-xs text-muted-foreground">Coordenadas: (345, 821)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">150€</p>
                  <p className="text-xs text-muted-foreground">Última licitação</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-red-500">
                <Clock className="h-4 w-4" />
                <span>Termina em: 2h 15m</span>
              </div>
              <Button className="w-full mt-4">Licitar Agora</Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}