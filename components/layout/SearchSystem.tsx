'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search, MapPin, User, Trophy, BookImage, Hash, Filter, Clock,
  TrendingUp, Star, Compass, Palette, Users, Globe, X, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type SearchResultType = 'user' | 'pixel' | 'album' | 'achievement' | 'region' | 'hashtag';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  dataAiHint?: string;
  metadata?: {
    coordinates?: { x: number; y: number };
    region?: string;
    price?: number;
    owner?: string;
    level?: number;
    pixelCount?: number;
    followers?: number;
    rarity?: string;
    tags?: string[];
  };
  relevanceScore?: number;
}

interface SearchFilter {
  type: SearchResultType | 'all';
  label: string;
  icon: React.ReactNode;
  count?: number;
}

const searchFilters: SearchFilter[] = [
  { type: 'all', label: 'Tudo', icon: <Search className="h-4 w-4" /> },
  { type: 'user', label: 'Utilizadores', icon: <User className="h-4 w-4" /> },
  { type: 'pixel', label: 'Píxeis', icon: <MapPin className="h-4 w-4" /> },
  { type: 'album', label: 'Álbuns', icon: <BookImage className="h-4 w-4" /> },
  { type: 'achievement', label: 'Conquistas', icon: <Trophy className="h-4 w-4" /> },
  { type: 'region', label: 'Regiões', icon: <Globe className="h-4 w-4" /> },
  { type: 'hashtag', label: 'Tags', icon: <Hash className="h-4 w-4" /> },
];

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'user',
    title: 'PixelMaster123',
    subtitle: 'Pedro Silva',
    description: 'Artista digital especializado em paisagens portuguesas',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar',
    metadata: { level: 15, followers: 1234, pixelCount: 456 },
    relevanceScore: 95
  },
  {
    id: '2',
    type: 'pixel',
    title: 'Pixel Premium em Lisboa',
    subtitle: 'Coordenadas: (245, 156)',
    description: 'Pixel raro na zona histórica de Lisboa',
    metadata: { 
      coordinates: { x: 245, y: 156 }, 
      region: 'Lisboa', 
      price: 150, 
      owner: 'PixelCollector',
      rarity: 'Épico'
    },
    relevanceScore: 88
  },
  {
    id: '3',
    type: 'album',
    title: 'Paisagens de Portugal',
    subtitle: 'Por ColorMaster',
    description: 'Coleção de 45 píxeis representando as mais belas paisagens portuguesas',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'album cover',
    metadata: { pixelCount: 45, tags: ['paisagem', 'portugal', 'natureza'] },
    relevanceScore: 82
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Mestre das Cores',
    subtitle: 'Conquista Rara',
    description: 'Use 30 cores diferentes nos seus píxeis',
    metadata: { rarity: 'Rara' },
    relevanceScore: 75
  },
  {
    id: '5',
    type: 'region',
    title: 'Lisboa',
    subtitle: 'Região Capital',
    description: '2.847 píxeis ativos • Preço médio: 52€',
    metadata: { pixelCount: 2847 },
    relevanceScore: 70
  },
  {
    id: '6',
    type: 'hashtag',
    title: '#paisagem',
    subtitle: '1.2K píxeis',
    description: 'Tag popular para paisagens naturais',
    metadata: { pixelCount: 1200 },
    relevanceScore: 65
  }
];

const recentSearches = [
  'PixelMaster123',
  'Lisboa pixels',
  'paisagens portugal',
  '#arte',
  'conquistas raras'
];

const trendingSearches = [
  'pixels premium',
  'álbuns populares',
  'novos utilizadores',
  '#pixel-art',
  'regiões em alta'
];

interface SearchSystemProps {
  children: React.ReactNode;
}

export default function SearchSystem({ children }: SearchSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simulate search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);
    
    const searchTimeout = setTimeout(() => {
      // Simulate API search
      const filteredResults = mockSearchResults
        .filter(result => {
          const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                              result.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
                              result.description?.toLowerCase().includes(query.toLowerCase());
          
          const matchesFilter = activeFilter === 'all' || result.type === activeFilter;
          
          return matchesQuery && matchesFilter;
        })
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      setResults(filteredResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, activeFilter]);

  // Update filter counts
  const filtersWithCounts = searchFilters.map(filter => ({
    ...filter,
    count: filter.type === 'all' 
      ? results.length 
      : results.filter(r => r.type === filter.type).length
  }));

  const handleResultClick = (result: SearchResult) => {
    toast({
      title: "Resultado Selecionado",
      description: `Navegando para: ${result.title}`,
    });
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResultType) => {
    const iconMap = {
      user: <User className="h-4 w-4" />,
      pixel: <MapPin className="h-4 w-4" />,
      album: <BookImage className="h-4 w-4" />,
      achievement: <Trophy className="h-4 w-4" />,
      region: <Globe className="h-4 w-4" />,
      hashtag: <Hash className="h-4 w-4" />
    };
    return iconMap[type];
  };

  const getResultBadgeColor = (type: SearchResultType) => {
    const colorMap = {
      user: 'bg-blue-500',
      pixel: 'bg-green-500',
      album: 'bg-purple-500',
      achievement: 'bg-yellow-500',
      region: 'bg-indigo-500',
      hashtag: 'bg-pink-500'
    };
    return colorMap[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="sr-only">Pesquisar no Pixel Universe</DialogTitle>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Pesquisar utilizadores, píxeis, álbuns..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {filtersWithCounts.map((filter) => (
              <Button
                key={filter.type}
                variant={activeFilter === filter.type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.type)}
                className="flex-shrink-0 text-xs"
              >
                {filter.icon}
                <span className="ml-1">{filter.label}</span>
                {filter.count !== undefined && filter.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4 pt-2">
            {showSuggestions && !query ? (
              <div className="space-y-6">
                {/* Recent Searches */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pesquisas Recentes
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleRecentSearch(search)}
                      >
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{search}</span>
                        <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Trending Searches */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tendências
                  </h3>
                  <div className="space-y-2">
                    {trendingSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleRecentSearch(search)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
                        <span>{search}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Popular
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : results.length === 0 && query ? (
                  <Card className="p-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Nenhum resultado encontrado para "{query}"
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tenta pesquisar por utilizadores, píxeis, álbuns ou regiões
                    </p>
                  </Card>
                ) : (
                  results.map((result) => (
                    <Card
                      key={result.id}
                      className="transition-all duration-200 hover:shadow-md cursor-pointer hover:border-primary/50"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {result.avatar ? (
                              <Avatar className="h-10 w-10">
                                <AvatarImage 
                                  src={result.avatar} 
                                  alt={result.title}
                                  data-ai-hint={result.dataAiHint}
                                />
                                <AvatarFallback>
                                  {getResultIcon(result.type)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center text-white",
                                getResultBadgeColor(result.type)
                              )}>
                                {getResultIcon(result.type)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm leading-tight">
                                  {result.title}
                                </h4>
                                {result.subtitle && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {result.subtitle}
                                  </p>
                                )}
                                {result.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {result.description}
                                  </p>
                                )}
                                
                                {/* Metadata */}
                                {result.metadata && (
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {result.metadata.level && (
                                      <Badge variant="outline" className="text-xs">
                                        Nível {result.metadata.level}
                                      </Badge>
                                    )}
                                    {result.metadata.price && (
                                      <Badge variant="outline" className="text-xs">
                                        {result.metadata.price}€
                                      </Badge>
                                    )}
                                    {result.metadata.pixelCount && (
                                      <Badge variant="outline" className="text-xs">
                                        {result.metadata.pixelCount} píxeis
                                      </Badge>
                                    )}
                                    {result.metadata.rarity && (
                                      <Badge variant="outline" className="text-xs">
                                        {result.metadata.rarity}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <Badge 
                                variant="secondary" 
                                className="text-xs flex-shrink-0"
                              >
                                {searchFilters.find(f => f.type === result.type)?.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}