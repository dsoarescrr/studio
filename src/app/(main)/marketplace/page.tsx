
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ShoppingCart, TrendingUp, Star, MapPin, Clock, Filter, Search,
  Eye, Heart, Share2, Gavel, Zap, Crown, Gem, Award, AlertTriangle,
  DollarSign, Calendar, Users, BarChart3, ArrowUpDown, SortAsc,
  Flame, Package, Sparkles, ChevronDown, ChevronUp, ExternalLink,
  Bookmark, MessageSquare, Flag, Gift, Coins, Timer, Target, Bell, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function MarketplacePage() {
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
                  <ShoppingCart className="h-8 w-8 mr-3 animate-glow" />
                  Marketplace de Píxeis
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Compre, venda e negoceie píxeis únicos no maior marketplace de Portugal
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Package className="h-4 w-4 mr-2" />
                  Vender Pixel
                </Button>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Criar Pedido
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Coming Soon Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Listings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Píxeis em Destaque
              </CardTitle>
              <CardDescription>
                Os píxeis mais populares e exclusivos do momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:shadow-md">
                    <div className="aspect-square relative">
                      <img 
                        src={`https://placehold.co/300x300/D4A757/ffffff?text=Pixel+${i}`} 
                        alt={`Pixel ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                      {i % 2 === 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium text-sm">Pixel Premium #{i}</h3>
                        <Badge variant="outline" className={i % 2 === 0 ? "text-purple-400" : "text-blue-400"}>
                          {i % 2 === 0 ? "Épico" : "Raro"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>({Math.floor(Math.random() * 1000)}, {Math.floor(Math.random() * 1000)})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {Math.floor(Math.random() * 1000)}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {Math.floor(Math.random() * 100)}
                          </span>
                        </div>
                        <span className="font-bold text-primary">{(Math.random() * 100 + 50).toFixed(2)}€</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                Ver Mais Destaques
              </Button>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Estatísticas do Mercado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Píxeis Listados</span>
                  <span className="font-bold">2,573</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Preço Médio</span>
                  <span className="font-bold text-primary">42.35€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volume (24h)</span>
                  <span className="font-bold text-green-500">12,450€</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tendências por Região</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Lisboa</span>
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12%
                      </span>
                    </div>
                    <Progress value={75} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Porto</span>
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8%
                      </span>
                    </div>
                    <Progress value={60} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Algarve</span>
                      <span className="text-red-500 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -3%
                      </span>
                    </div>
                    <Progress value={45} className="h-1.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Raridade em Destaque</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-2 bg-purple-500/10 border-purple-500/30">
                    <div className="text-center">
                      <p className="text-xs text-purple-400">Épico</p>
                      <p className="font-bold text-purple-500">+18%</p>
                    </div>
                  </Card>
                  <Card className="p-2 bg-amber-500/10 border-amber-500/30">
                    <div className="text-center">
                      <p className="text-xs text-amber-400">Lendário</p>
                      <p className="font-bold text-amber-500">+24%</p>
                    </div>
                  </Card>
                </div>
              </div>

              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Explorar Marketplace
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Transações Recentes
              </CardTitle>
              <CardDescription>
                Últimas atividades no marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        {i % 3 === 0 ? (
                          <Gavel className="h-5 w-5 text-primary" />
                        ) : i % 3 === 1 ? (
                          <ShoppingCart className="h-5 w-5 text-green-500" />
                        ) : (
                          <Send className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {i % 3 === 0 ? "Leilão Finalizado" : i % 3 === 1 ? "Compra Direta" : "Oferta Aceite"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Pixel ({Math.floor(Math.random() * 1000)}, {Math.floor(Math.random() * 1000)})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{(Math.random() * 100 + 20).toFixed(2)}€</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 60)}m atrás
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
