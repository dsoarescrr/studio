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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Auctions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                Leilões Ativos
              </CardTitle>
              <CardDescription>
                Leilões em andamento para píxeis exclusivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:shadow-md">
                    <div className="aspect-square relative">
                      <img 
                        src={`https://placehold.co/300x300/${i % 2 === 0 ? 'D4A757' : '7DF9FF'}/ffffff?text=Leilão+${i}`} 
                        alt={`Leilão ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        <Timer className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m
                      </Badge>
                      <Badge className="absolute top-2 right-2" variant="outline">
                        {i % 2 === 0 ? "Épico" : "Lendário"}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium text-sm">Pixel Exclusivo #{i}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 20) + 5} lances
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>({Math.floor(Math.random() * 1000)}, {Math.floor(Math.random() * 1000)})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Lance atual:</span>
                        <span className="font-bold text-primary">{(Math.random() * 200 + 100).toFixed(2)}€</span>
                      </div>
                      <Button size="sm" className="w-full mt-2">Licitar</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos os Leilões
              </Button>
            </CardContent>
          </Card>

          {/* Auction Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Estatísticas de Leilões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Leilões Ativos</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Leilões Finalizados (24h)</span>
                  <span className="font-bold">18</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volume Total</span>
                  <span className="font-bold text-primary">8,450€</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Leilões a Terminar</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Pixel Raro #{i}</p>
                          <p className="text-xs text-muted-foreground">
                            {i === 1 ? "30m restantes" : i === 2 ? "1h 15m restantes" : "2h 45m restantes"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-primary">
                          {(Math.random() * 100 + 50).toFixed(2)}€
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button className="w-full">
                <Gavel className="h-4 w-4 mr-2" />
                Criar Novo Leilão
              </Button>
            </CardContent>
          </Card>

          {/* Featured Auction */}
          <Card className="md:col-span-3 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Leilão em Destaque
              </CardTitle>
              <CardDescription>
                Oportunidade única para adquirir um pixel lendário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <img 
                    src="https://placehold.co/400x400/D4A757/ffffff?text=Pixel+Lendário" 
                    alt="Pixel Lendário"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <Badge className="self-start mb-2 bg-amber-500">
                      <Crown className="h-3 w-3 mr-1" />
                      Lendário
                    </Badge>
                    <h3 className="text-white font-bold text-lg">Pixel Histórico de Lisboa</h3>
                    <p className="text-white/80 text-sm">Coordenadas: (345, 678)</p>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Leilão Especial</h3>
                      <p className="text-muted-foreground">Um dos píxeis mais raros já disponibilizados</p>
                    </div>
                    <Badge className="self-start sm:self-auto bg-red-500 text-white px-3 py-1.5 text-sm">
                      <Timer className="h-4 w-4 mr-2" />
                      Termina em 4h 23m
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-background/50">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Lance Inicial:</span>
                            <span>250.00€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Lance Atual:</span>
                            <span className="font-bold text-primary">375.50€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Próximo Lance Mínimo:</span>
                            <span>385.00€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total de Lances:</span>
                            <span>12</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-background/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Características Especiais</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Vista para o Tejo</Badge>
                            <Badge variant="outline">Centro Histórico</Badge>
                            <Badge variant="outline">Zona Turística</Badge>
                            <Badge variant="outline">Monumento</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este pixel inclui efeitos visuais e sonoros exclusivos
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
                      <Gavel className="h-4 w-4 mr-2" />
                      Fazer Lance (385.00€)
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}