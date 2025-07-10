'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users2, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PixelCollaborationSystemProps {
  children: React.ReactNode;
}

export default function PixelCollaborationSystem({ children }: PixelCollaborationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            Projetos Colaborativos
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Card>
             <CardHeader>
              <CardTitle className="text-sm">Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Bandeira de Portugal Gigante</p>
                            <div className="flex -space-x-2 mt-1">
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src="https://placehold.co/24x24" />
                                    <AvatarFallback>P1</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src="https://placehold.co/24x24" />
                                    <AvatarFallback>P2</AvatarFallback>
                                </Avatar>
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                    +5
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Juntar-se</Button>
                    </div>
                     <Button className="w-full mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Novo Projeto
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}