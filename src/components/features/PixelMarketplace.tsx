'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShoppingCart, TrendingUp, Star, MapPin, Clock, Filter, Search,
  Eye, Heart, Share2, Gavel, Zap, Crown, Gem, Award, AlertTriangle,
  DollarSign, Calendar, Users, BarChart3, ArrowUpDown, SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PixelRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
type ListingType = 'fixed' | 'auction' | 'offer';
type SortOption = 'price_asc' | 'price_desc' | 'rarity' | 'recent' | 'ending_soon' | 'popular';

interface PixelListing {
  id: string;
  coordinates: { x: number; y: number };
  region: string;
  price: number;
  type: ListingType;
  rarity: PixelRarity;
  seller: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    rating: number;
    verified: boolean;
  };
  description?: string;
  imageUrl?: string;
  dataAiHint?: string;
  tags: string[];
  views: number;
  likes: number;
  bids?: {
    count: number;
    highest: number;
    endTime: Date;
  };
  history: {
    previousPrice?: number;
    lastSold?: Date;
    totalSales: number;
  };
  features: string[];
  createdAt: Date;
  isHot?: boolean;
  isFeatured?: boolean;
}

const mockListings: PixelListing[] = [
  {
    id: '1',
    coordinates: { x: 245, y: 156 },
    region: 'Lisboa',
    price: 250,
    type: 'auction',
    rarity: 'epic',
    seller: {
      id: 'seller1',
      name: 'PixelCollector',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.8,
      verified: true
    },
    description: 'Pixel raro na zona histórica de Lisboa com vista para o Tejo',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'pixel preview',
    tags: ['histórico', 'vista-rio', 'centro'],
    views: 1247,
    likes: 89,
    bids: {
      count: 12,
      highest: 280,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
    },
    history: {
      previousPrice: 180,
      lastSold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalSales: 3
    },
    features: ['Vista panorâmica', 'Zona turística', 'Transporte público'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isHot: true,
    isFeatured: true
  },
  {
    id: '2',
    coordinates: { x: 123, y: 89 },
    region: 'Porto',
    price: 150,
    type: 'fixed',
    rarity: 'rare',
    seller: {
      id: 'seller2',
      name: 'ArtMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.6,
      verified: false
    },
    description: 'Pixel artístico na Ribeira do Porto',
    imageUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'pixel preview',
    tags: ['ribeira', 'arte', 'património'],
    views: 856,
    likes: 67,
    history: {
      totalSales: 1
    },
    features: ['Património UNESCO', 'Zona artística'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    coordinates: { x: 67, y: 234 },
    region: 'Coimbra',
    price: 75,
    type: 'offer',
    rarity: 'uncommon',
    seller: {
      id: 'seller3',
      name: 'StudentPixel',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'seller avatar',
      rating: 4.2,
      verified: false
    },
    description: 'Pixel universitário perto da UC',
    tags: ['universidade', 'estudantes', 'cultura'],
    views: 432,
    likes: 23,
    history: {
      totalSales: 0
    },
    features: ['Zona universitária', 'Vida noturna'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

const rarityColors: Record<PixelRarity, string> = {
  common: 'text-gray-500 border-gray-500',
  uncommon: 'text-green-500 border-green-500',
  rare: 'text-blue-500 border-blue-500',
  epic: 'text-purple-500 border-purple-500',
  legendary: 'text-orange-500 border-orange-500',
  unique: 'text-pink-500 border-pink-500'
};

const rarityLabels: Record<PixelRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  unique: 'Único'
};

interface PixelMarketplaceProps {
  children: React.ReactNode;
}

export default function PixelMarketplace({ children }: PixelMarketplaceProps) {
  const [listings, setListings] = useState<PixelListing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<PixelListing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<PixelRarity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Filter and sort listings
  useEffect(() => {
    let filtered = listings.filter(listing => {
      const matchesSearch = !searchQuery || 
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        listing.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRarity = selectedRarity === 'all' || listing.rarity === selectedRarity;
      const matchesType = selectedType === 'all' || listing.type === selectedType;
      const matchesRegion = selectedRegion === 'all' || listing.region === selectedRegion;
      const matchesPrice = listing.price >= priceRange.min && listing.price <= priceRange.max;
      
      return matchesSearch && matchesRarity && matchesType && matchesRegion && matchesPrice;
    });

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, unique: 6 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'ending_soon':
          if (a.type === 'auction' && b.type === 'auction' && a.bids && b.bids) {
            return a.bids.endTime.getTime() - b.bids.endTime.getTime();
          }
          return 0;
        case 'popular':
          return (b.views + b.likes) - (a.views + a.likes);
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedRarity, selectedType, selectedRegion, sortBy, priceRange]);

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleBid = (listingId: string, amount: number) => {
    toast({
      title: "Licitação Enviada",
      description: `A sua licitação de ${amount}€ foi enviada com sucesso.`,
    });
  };

  const handleBuyNow = (listingId: string) => {
    toast({
      title: "Compra Realizada",
      description: "O pixel foi adicionado à sua coleção!",
    });
  };

  const handleMakeOffer = (listingId: string, amount: number) => {
    toast({
      title: "Oferta Enviada",
      description: `A sua oferta de ${amount}€ foi enviada ao vendedor.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Marketplace de Píxeis
            <Badge variant="secondary" className="text-xs">
              {filteredListings.length} resultados
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 border-r bg-muted/30 p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-3">Pesquisar</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar píxeis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-sm mb-3">Ordenar por</h3>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="price_asc">Preço: Menor para Maior</SelectItem>
                  <SelectItem value="price_desc">Preço: Maior para Menor</SelectItem>
                  <SelectItem value="rarity">Raridade</SelectItem>
                  <SelectItem value="ending_soon">A Terminar</SelectItem>
                  <SelectItem value="popular">Mais Populares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-sm mb-3">Tipo de Venda</h3>
              <Select value={selectedType} onValueChange={(value: ListingType | 'all') => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="fixed">Preço Fixo</SelectItem>
                  <SelectItem value="auction">Leilão</SelectItem>
                  <SelectItem value="offer">Aceita Ofertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-3">Raridade</h3>
              <Select value={selectedRarity} onValueChange={(value: PixelRarity | 'all') => setSelectedRarity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(rarityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-3">Região</h3>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Lisboa">Lisboa</SelectItem>
                  <SelectItem value="Porto">Porto</SelectItem>
                  <SelectItem value="Coimbra">Coimbra</SelectItem>
                  <SelectItem value="Braga">Braga</SelectItem>
                  <SelectItem value="Faro">Faro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-3">Faixa de Preço</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-4">
                {filteredListings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Nenhum pixel encontrado com os filtros selecionados
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredListings.map((listing) => (
                      <Card
                        key={listing.id}
                        className={cn(
                          "transition-all duration-200 hover:shadow-lg cursor-pointer",
                          listing.isFeatured && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                ({listing.coordinates.x}, {listing.coordinates.y})
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {listing.region}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {listing.isHot && (
                                <Badge className="text-xs bg-red-500 hover:bg-red-500">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                              {listing.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs w-fit", rarityColors[listing.rarity])}
                          >
                            {rarityLabels[listing.rarity]}
                          </Badge>
                        </CardHeader>

                        <CardContent className="p-3 pt-0">
                          {listing.imageUrl && (
                            <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                              <img 
                                src={listing.imageUrl} 
                                alt="Pixel preview"
                                data-ai-hint={listing.dataAiHint}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {listing.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {listing.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {listing.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {listing.likes}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage 
                                    src={listing.seller.avatar} 
                                    alt={listing.seller.name}
                                    data-ai-hint={listing.seller.dataAiHint}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {listing.seller.name.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{listing.seller.name}</span>
                                {listing.seller.verified && (
                                  <Star className="h-3 w-3 text-blue-500 fill-current" />
                                )}
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                  {listing.price}€
                                </span>
                                
                                {listing.type === 'auction' && listing.bids && (
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                      {listing.bids.count} licitações
                                    </p>
                                    <p className="text-xs text-orange-500">
                                      Termina em {getTimeRemaining(listing.bids.endTime)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {listing.type === 'fixed' && (
                                  <Button 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleBuyNow(listing.id)}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Comprar
                                  </Button>
                                )}
                                
                                {listing.type === 'auction' && (
                                  <Button 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleBid(listing.id, listing.price + 10)}
                                  >
                                    <Gavel className="h-4 w-4 mr-1" />
                                    Licitar
                                  </Button>
                                )}
                                
                                {listing.type === 'offer' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handleMakeOffer(listing.id, listing.price - 10)}
                                  >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Oferecer
                                  </Button>
                                )}
                                
                                <Button size="sm" variant="ghost" className="px-2">
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="px-2">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}