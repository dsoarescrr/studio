'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gavel, Clock, TrendingUp, Star, MapPin, Filter, Search,
  Eye, Heart, Share2, Zap, Crown, Gem, Award, AlertTriangle,
  DollarSign, Calendar, Users, BarChart3, ArrowUpDown, SortAsc,
  Flame, Package, Sparkles, ChevronDown, ChevronUp, ExternalLink,
  Bookmark, MessageSquare, Flag, Gift, Coins, Timer, Target, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AuctionsPage() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-7xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <Gavel className="h-8 w-8 mr-3 animate-glow" />
                  Leilões de Píxeis
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Participe em leilões emocionantes pelos píxeis mais cobiçados do universo
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Gavel className="h-4 w-4 mr-2" />
                  Criar Leilão
                </Button>
                <Button variant="outline">
                  <Timer className="h-4 w-4 mr-2" />
                  Meus Leilões
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Coming Soon Content */}
        <Card className="p-12 text-center">
          <Gavel className="h-24 w-24 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-headline font-bold text-primary mb-4">
            Sistema de Leilões em Desenvolvimento
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Estamos a criar um sistema de leilões revolucionário que permitirá licitações 
            em tempo real pelos píxeis mais raros e valiosos do Pixel Universe.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <Timer className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Leilões em Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Licitações ao vivo com atualizações instantâneas e notificações
              </p>
            </Card>
            
            <Card className="p-6 bg-accent/5 border-accent/20">
              <Crown className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Píxeis Exclusivos</h3>
              <p className="text-sm text-muted-foreground">
                Acesso a píxeis únicos e edições limitadas apenas através de leilões
              </p>
            </Card>
            
            <Card className="p-6 bg-green-500/5 border-green-500/20">
              <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sistema de Reputação</h3>
              <p className="text-sm text-muted-foreground">
                Classificações e histórico para licitadores e vendedores
              </p>
            </Card>
          </div>
          
          <Button className="mt-8" onClick={() => toast({
            title: "Notificação Ativada",
            description: "Será notificado quando os leilões estiverem disponíveis!"
          })}>
            <Bell className="h-4 w-4 mr-2" />
            Notificar-me Quando Estiver Pronto
          </Button>
        </Card>
      </div>
    </div>
  );
}