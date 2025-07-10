'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Palette, Sun, Moon, Monitor, Sparkles, Eye, RotateCcw, Download, Upload, Share2, Paintbrush, Contrast, Copyright as Brightness, IterationCw as Saturation, Zap, Star, Crown, Gem, Heart, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  isPremium?: boolean;
  isPopular?: boolean;
  category: 'default' | 'gaming' | 'nature' | 'cosmic' | 'retro' | 'minimal';
}

const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Dourado Clássico',
    description: 'O tema padrão do Pixel Universe',
    colors: {
      primary: '#D4A757',
      accent: '#7DF9FF',
      background: '#0A0A0A',
      foreground: '#F5F5F5'
    },
    category: 'default',
    isPopular: true
  },
  {
    id: 'ocean',
    name: 'Oceano Profundo',
    description: 'Inspirado nas profundezas do oceano',
    colors: {
      primary: '#0EA5E9',
      accent: '#06B6D4',
      background: '#0C1426',
      foreground: '#E2E8F0'
    },
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Floresta Mística',
    description: 'Verde natural e relaxante',
    colors: {
      primary: '#22C55E',
      accent: '#84CC16',
      background: '#0F1419',
      foreground: '#F0FDF4'
    },
    category: 'nature',
    isPremium: true
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    description: 'Cores quentes do entardecer',
    colors: {
      primary: '#F97316',
      accent: '#EAB308',
      background: '#1C1917',
      foreground: '#FEF7ED'
    },
    category: 'nature',
    isPopular: true
  },
  {
    id: 'cosmic',
    name: 'Galáxia Violeta',
    description: 'Mistério do espaço sideral',
    colors: {
      primary: '#8B5CF6',
      accent: '#EC4899',
      background: '#0F0A1A',
      foreground: '#F3E8FF'
    },
    category: 'cosmic',
    isPremium: true
  },
  {
    id: 'neon',
    name: 'Neon Cyberpunk',
    description: 'Futuro distópico em neon',
    colors: {
      primary: '#FF0080',
      accent: '#00FFFF',
      background: '#000000',
      foreground: '#FFFFFF'
    },
    category: 'gaming',
    isPremium: true
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    description: 'Nostalgia dos anos 80',
    colors: {
      primary: '#FF6B9D',
      accent: '#45B7D1',
      background: '#1A0B2E',
      foreground: '#FFF5F8'
    },
    category: 'retro',
    isPopular: true
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Simplicidade elegante',
    colors: {
      primary: '#6B7280',
      accent: '#9CA3AF',
      background: '#FAFAFA',
      foreground: '#111827'
    },
    category: 'minimal'
  }
];

interface ThemeSettings {
  preset: string;
  customColors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  effects: {
    animations: boolean;
    particles: boolean;
    glow: boolean;
    blur: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: number;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  advanced: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

const defaultSettings: ThemeSettings = {
  preset: 'default',
  customColors: {
    primary: '#D4A757',
    accent: '#7DF9FF',
    background: '#0A0A0A',
    foreground: '#F5F5F5'
  },
  effects: {
    animations: true,
    particles: true,
    glow: true,
    blur: true
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 100,
    colorBlindMode: 'none'
  },
  advanced: {
    brightness: 100,
    contrast: 100,
    saturation: 100
  }
};

interface ThemeCustomizerProps {
  children: React.ReactNode;
}

export default function ThemeCustomizer({ children }: ThemeCustomizerProps) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'effects' | 'accessibility'>('presets');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('pixel-universe-theme');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }
  }, []);

  // Save settings
  const saveSettings = (newSettings: ThemeSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pixel-universe-theme', JSON.stringify(newSettings));
    applyTheme(newSettings);
  };

  // Apply theme to CSS variables
  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    const colors = themeSettings.customColors;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHsl(colors.primary));
    root.style.setProperty('--accent', hexToHsl(colors.accent));
    root.style.setProperty('--background', hexToHsl(colors.background));
    root.style.setProperty('--foreground', hexToHsl(colors.foreground));
    
    // Apply advanced settings
    root.style.setProperty('--theme-brightness', `${themeSettings.advanced.brightness}%`);
    root.style.setProperty('--theme-contrast', `${themeSettings.advanced.contrast}%`);
    root.style.setProperty('--theme-saturation', `${themeSettings.advanced.saturation}%`);
    
    // Apply accessibility settings
    if (themeSettings.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    root.style.setProperty('--font-size-scale', `${themeSettings.accessibility.fontSize}%`);
  };

  const selectPreset = (preset: ThemePreset) => {
    const newSettings = {
      ...settings,
      preset: preset.id,
      customColors: preset.colors
    };
    saveSettings(newSettings);
    
    toast({
      title: "Tema Aplicado",
      description: `Tema "${preset.name}" foi aplicado com sucesso.`,
    });
  };

  const updateCustomColor = (colorKey: keyof ThemeSettings['customColors'], value: string) => {
    const newSettings = {
      ...settings,
      preset: 'custom',
      customColors: {
        ...settings.customColors,
        [colorKey]: value
      }
    };
    saveSettings(newSettings);
  };

  const toggleEffect = (effectKey: keyof ThemeSettings['effects']) => {
    const newSettings = {
      ...settings,
      effects: {
        ...settings.effects,
        [effectKey]: !settings.effects[effectKey]
      }
    };
    saveSettings(newSettings);
  };

  const updateAccessibility = (key: keyof ThemeSettings['accessibility'], value: any) => {
    const newSettings = {
      ...settings,
      accessibility: {
        ...settings.accessibility,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const updateAdvanced = (key: keyof ThemeSettings['advanced'], value: number) => {
    const newSettings = {
      ...settings,
      advanced: {
        ...settings.advanced,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const resetToDefault = () => {
    saveSettings(defaultSettings);
    toast({
      title: "Tema Restaurado",
      description: "Todas as configurações foram restauradas para o padrão.",
    });
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pixel-universe-theme.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Tema Exportado",
      description: "O seu tema personalizado foi exportado com sucesso.",
    });
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveSettings(imported);
        toast({
          title: "Tema Importado",
          description: "O tema foi importado e aplicado com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro na Importação",
          description: "Ficheiro de tema inválido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const getCategoryIcon = (category: ThemePreset['category']) => {
    const icons = {
      default: <Star className="h-4 w-4" />,
      gaming: <Zap className="h-4 w-4" />,
      nature: <Heart className="h-4 w-4" />,
      cosmic: <Sparkles className="h-4 w-4" />,
      retro: <Crown className="h-4 w-4" />,
      minimal: <Gem className="h-4 w-4" />
    };
    return icons[category];
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md p-0 sm:max-w-md" side="right">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Personalizar Tema
          </SheetTitle>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-3">
            {[
              { key: 'presets', label: 'Temas', icon: <Palette className="h-4 w-4" /> },
              { key: 'custom', label: 'Cores', icon: <Paintbrush className="h-4 w-4" /> },
              { key: 'effects', label: 'Efeitos', icon: <Sparkles className="h-4 w-4" /> },
              { key: 'accessibility', label: 'Acesso', icon: <Eye className="h-4 w-4" /> }
            ].map(({ key, label, icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key as any)}
                className="flex-1 text-xs"
              >
                {icon}
                <span className="ml-1 hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
          <div className="p-4">
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Temas Predefinidos</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={resetToDefault}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={exportTheme}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <label htmlFor="import-theme" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input
                          id="import-theme"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={importTheme}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {themePresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        settings.preset === preset.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => selectPreset(preset)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {Object.values(preset.colors).map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{preset.name}</h4>
                              {getCategoryIcon(preset.category)}
                              {preset.isPremium && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                              {preset.isPopular && (
                                <Badge variant="secondary" className="text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                          
                          {settings.preset === preset.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Cores Personalizadas</h3>
                  <div className="space-y-4">
                    {Object.entries(settings.customColors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-sm capitalize">{key}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateCustomColor(key as any, e.target.value)}
                            className="w-10 h-10 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateCustomColor(key as any, e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded bg-background"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-3">Ajustes Avançados</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Brilho</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.advanced.brightness}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.advanced.brightness]}
                        onValueChange={([value]) => updateAdvanced('brightness', value)}
                        min={50}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Contraste</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.advanced.contrast}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.advanced.contrast]}
                        onValueChange={([value]) => updateAdvanced('contrast', value)}
                        min={50}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Saturação</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.advanced.saturation}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.advanced.saturation]}
                        onValueChange={([value]) => updateAdvanced('saturation', value)}
                        min={0}
                        max={200}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Efeitos Visuais</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.effects).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm capitalize">
                          {key === 'animations' ? 'Animações' :
                           key === 'particles' ? 'Partículas' :
                           key === 'glow' ? 'Brilho' :
                           key === 'blur' ? 'Desfoque' : key}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {key === 'animations' ? 'Ativar animações suaves' :
                           key === 'particles' ? 'Efeitos de partículas' :
                           key === 'glow' ? 'Efeitos de brilho' :
                           key === 'blur' ? 'Desfoque de fundo' : ''}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={() => toggleEffect(key as any)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Acessibilidade</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Alto Contraste</Label>
                        <p className="text-xs text-muted-foreground">
                          Aumentar contraste para melhor visibilidade
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.highContrast}
                        onCheckedChange={(checked) => updateAccessibility('highContrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Reduzir Movimento</Label>
                        <p className="text-xs text-muted-foreground">
                          Desativar animações para sensibilidade ao movimento
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.reducedMotion}
                        onCheckedChange={(checked) => updateAccessibility('reducedMotion', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Tamanho da Fonte</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.accessibility.fontSize}%
                        </span>
                      </div>
                      <Slider
                        value={[settings.accessibility.fontSize]}
                        onValueChange={([value]) => updateAccessibility('fontSize', value)}
                        min={75}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
