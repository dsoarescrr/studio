
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import { 
  Settings, Moon, Sun, Monitor, Volume2, VolumeX, Bell, Eye, 
  Paintbrush, Zap, Shield, Key, LogOut, Download, Upload, 
  RefreshCw, Smartphone, Laptop, Globe, Languages, Sparkles, 
  Contrast, Palette, Save, Check, AlertTriangle, Lock, User, 
  Mail, BellRing, CreditCard, HelpCircle, FileText, MessageSquare,
  Gift, Coins, ShoppingCart, Trophy, Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore, useUserStore } from "@/lib/store";
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { toast } = useToast();
  const { 
    theme, 
    animations, 
    notifications, 
    soundEffects, 
    highQualityRendering,
    setTheme,
    toggleAnimations,
    toggleNotifications,
    toggleSoundEffects,
    toggleHighQualityRendering
  } = useSettingsStore();
  
  const { credits, specialCredits } = useUserStore();
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [language, setLanguage] = useState('pt-PT');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [playTestSound, setPlayTestSound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSaveSound, setPlaySaveSound] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowConfetti(true);
      setPlaySaveSound(true);
      toast({
        title: "Definições Guardadas",
        description: "As suas preferências foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  const handleResetSettings = () => {
    setPlayTestSound(true);
    // Reset to defaults
    setTheme('dark');
    setFontSize(100);
    setContrast(100);
    setBrightness(100);
    setLanguage('pt-PT');
    
    toast({
      title: "Definições Restauradas",
      description: "As definições foram restauradas para os valores padrão.",
    });
  };

  const handleExportSettings = () => {
    setPlayTestSound(true);
    const settings = {
      theme,
      animations,
      notifications,
      soundEffects,
      highQualityRendering,
      fontSize,
      contrast,
      brightness,
      language
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-universe-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Definições Exportadas",
      description: "As suas definições foram exportadas com sucesso.",
    });
  };

  const handleChangePassword = () => {
    setPlaySaveSound(true);
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As novas passwords não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova password deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password Alterada",
      description: "A sua password foi alterada com sucesso.",
    });
    
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <SoundEffect 
        src={SOUND_EFFECTS.SUCCESS} 
        play={playSaveSound} 
        onEnd={() => setPlaySaveSound(false)} 
      />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      <SoundEffect 
        src={SOUND_EFFECTS.CLICK} 
        play={playTestSound} 
        onEnd={() => setPlayTestSound(false)} 
      />
      
      <div className="container mx-auto py-6 px-4 mb-16 space-y-6 max-w-6xl">
        {/* Header */}
        <Card className="shadow-2xl bg-gradient-to-br from-card via-card/95 to-primary/10 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <CardHeader className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-3xl text-gradient-gold flex items-center">
                  <Settings className="h-8 w-8 mr-3 animate-glow" />
                  Definições
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Personalize a sua experiência no Pixel Universe
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleResetSettings}
                  className="bg-background/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <Tabs 
                orientation="vertical" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
                  <TabsTrigger 
                    value="appearance" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Paintbrush className="h-4 w-4 mr-3 text-blue-500" />
                    Aparência
                  </TabsTrigger>
                  <TabsTrigger 
                    value="accessibility" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Eye className="h-4 w-4 mr-3 text-green-500" />
                    Acessibilidade
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Bell className="h-4 w-4 mr-3 text-red-500" />
                    Notificações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Conta
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Shield className="h-4 w-4 mr-3 text-purple-500" />
                    Segurança
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Zap className="h-4 w-4 mr-3 text-yellow-500" />
                    Desempenho
                  </TabsTrigger>
                  <TabsTrigger 
                    value="language" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <Globe className="h-4 w-4 mr-3 text-cyan-500" />
                    Idioma
                  </TabsTrigger>
                  <TabsTrigger 
                    value="help" 
                    className="w-full justify-start text-left px-3 py-2 h-auto"
                  >
                    <HelpCircle className="h-4 w-4 mr-3 text-orange-500" />
                    Ajuda
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Coins className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Créditos</span>
                  </div>
                  <span className="font-medium text-primary">{credits.toLocaleString('pt-PT')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 mr-2 text-accent" />
                    <span className="text-sm">Especiais</span>
                  </div>
                  <span className="font-medium text-accent">{specialCredits.toLocaleString('pt-PT')}</span>
                </div>
                
                <Button variant="destructive" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <ScrollArea className="h-[70vh]">
                <Tabs value={activeTab}>
                  <TabsContent value="appearance" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tema</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            theme === 'light' && "border-primary bg-primary/5"
                          )}
                          onClick={() => setTheme('light')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Sun className="h-8 w-8 mb-2 text-orange-400" />
                            <h4 className="font-medium">Claro</h4>
                            <p className="text-xs text-muted-foreground">Tema luminoso</p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            theme === 'dark' && "border-primary bg-primary/5"
                          )}
                          onClick={() => setTheme('dark')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Moon className="h-8 w-8 mb-2 text-blue-400" />
                            <h4 className="font-medium">Escuro</h4>
                            <p className="text-xs text-muted-foreground">Tema noturno</p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            theme === 'system' && "border-primary bg-primary/5"
                          )}
                          onClick={() => setTheme('system')}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Monitor className="h-8 w-8 mb-2 text-purple-400" />
                            <h4 className="font-medium">Sistema</h4>
                            <p className="text-xs text-muted-foreground">Segue o tema do sistema</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Cores</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="p-4 cursor-pointer hover:shadow-md border-primary/50">
                            <div className="h-12 rounded-md bg-gradient-to-r from-[#D4A757] to-[#7DF9FF] mb-2"></div>
                            <p className="text-sm font-medium">Padrão</p>
                            <p className="text-xs text-muted-foreground">Dourado & Azul</p>
                          </Card>
                          
                          <Card className="p-4 cursor-pointer hover:shadow-md">
                            <div className="h-12 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 mb-2"></div>
                            <p className="text-sm font-medium">Neon</p>
                            <p className="text-xs text-muted-foreground">Roxo & Rosa</p>
                          </Card>
                          
                          <Card className="p-4 cursor-pointer hover:shadow-md">
                            <div className="h-12 rounded-md bg-gradient-to-r from-green-500 to-blue-500 mb-2"></div>
                            <p className="text-sm font-medium">Natureza</p>
                            <p className="text-xs text-muted-foreground">Verde & Azul</p>
                          </Card>
                          
                          <Card className="p-4 cursor-pointer hover:shadow-md">
                            <div className="h-12 rounded-md bg-gradient-to-r from-red-500 to-orange-500 mb-2"></div>
                            <p className="text-sm font-medium">Fogo</p>
                            <p className="text-xs text-muted-foreground">Vermelho & Laranja</p>
                          </Card>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex-1">
                            <Palette className="h-4 w-4 mr-2" />
                            Personalizar Cores
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Temas Premium
                            <Badge className="ml-2 bg-amber-500">PRO</Badge>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Efeitos Visuais</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Animações</Label>
                            <p className="text-sm text-muted-foreground">Ativar animações na interface</p>
                          </div>
                          <Switch checked={animations} onCheckedChange={toggleAnimations} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Efeitos de Partículas</Label>
                            <p className="text-sm text-muted-foreground">Mostrar efeitos de partículas</p>
                          </div>
                          <Switch checked={animations} onCheckedChange={toggleAnimations} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Efeitos de Brilho</Label>
                            <p className="text-sm text-muted-foreground">Mostrar efeitos de brilho</p>
                          </div>
                          <Switch checked={animations} onCheckedChange={toggleAnimations} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="accessibility" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tamanho do Texto</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Escala de Fonte</Label>
                            <span className="text-sm font-medium">{fontSize}%</span>
                          </div>
                          <Slider
                            value={[fontSize]}
                            onValueChange={(value) => setFontSize(value[0])}
                            min={75}
                            max={150}
                            step={5}
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Pequeno</span>
                            <span>Normal</span>
                            <span>Grande</span>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <p className={`text-base transition-all`} style={{ fontSize: `${fontSize}%` }}>
                            Exemplo de texto com o tamanho selecionado.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contraste e Brilho</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Contraste</Label>
                            <span className="text-sm font-medium">{contrast}%</span>
                          </div>
                          <Slider
                            value={[contrast]}
                            onValueChange={(value) => setContrast(value[0])}
                            min={50}
                            max={150}
                            step={5}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Brilho</Label>
                            <span className="text-sm font-medium">{brightness}%</span>
                          </div>
                          <Slider
                            value={[brightness]}
                            onValueChange={(value) => setBrightness(value[0])}
                            min={50}
                            max={150}
                            step={5}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Movimento Reduzido</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Reduzir Movimento</Label>
                            <p className="text-sm text-muted-foreground">Reduzir ou eliminar animações</p>
                          </div>
                          <Switch checked={!animations} onCheckedChange={() => toggleAnimations()} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Reduzir Transparência</Label>
                            <p className="text-sm text-muted-foreground">Reduzir efeitos de transparência</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Preferências de Notificações</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Notificações</Label>
                            <p className="text-sm text-muted-foreground">Ativar notificações</p>
                          </div>
                          <Switch checked={notifications} onCheckedChange={toggleNotifications} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Sons de Notificação</Label>
                            <p className="text-sm text-muted-foreground">Reproduzir sons ao receber notificações</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setPlayTestSound(true)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Switch checked={soundEffects} onCheckedChange={toggleSoundEffects} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tipos de Notificação</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-green-500" />
                            <div>
                              <Label className="text-base">Compras e Vendas</Label>
                              <p className="text-sm text-muted-foreground">Notificações de transações</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <div>
                              <Label className="text-base">Conquistas</Label>
                              <p className="text-sm text-muted-foreground">Notificações de conquistas desbloqueadas</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            <div>
                              <Label className="text-base">Comentários</Label>
                              <p className="text-sm text-muted-foreground">Notificações de comentários</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BellRing className="h-5 w-5 text-red-500" />
                            <div>
                              <Label className="text-base">Eventos</Label>
                              <p className="text-sm text-muted-foreground">Notificações de eventos especiais</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="account" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Informações da Conta</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Nome de Utilizador</Label>
                          <Input 
                            id="username" 
                            value="PixelMasterPT" 
                            disabled 
                          />
                          <p className="text-xs text-muted-foreground">O nome de utilizador não pode ser alterado</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Subscrição</h3>
                      <Card className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <Crown className="h-5 w-5 text-amber-500 mr-2" />
                                Plano Premium
                              </h4>
                              <p className="text-sm text-muted-foreground">Ativo até 15/12/2025</p>
                            </div>
                            <Badge className="bg-amber-500">Ativo</Badge>
                          </div>
                          
                          <div className="mt-4">
                            <Button variant="outline" className="w-full">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Gerir Subscrição
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Dados da Conta</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Dados
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Dados
                        </Button>
                      </div>
                      
                      <div className="mt-4">
                        <Button variant="destructive" className="w-full">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Eliminar Conta
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Alterar Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Password Atual</Label>
                          <Input 
                            id="current-password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nova Password</Label>
                          <Input 
                            id="new-password" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nova Password</Label>
                          <Input 
                            id="confirm-password" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                          />
                        </div>
                        
                        <Button 
                          onClick={handleChangePassword}
                          disabled={!password || !newPassword || !confirmPassword}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Alterar Password
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Autenticação de Dois Fatores</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <Lock className="h-5 w-5 text-green-500 mr-2" />
                                Autenticação de Dois Fatores
                              </h4>
                              <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                            </div>
                            <Button variant="outline">Configurar</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sessões Ativas</h3>
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Laptop className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Chrome - Windows</p>
                                <p className="text-xs text-muted-foreground">Lisboa, Portugal • Agora</p>
                              </div>
                            </div>
                            <Badge className="bg-green-500">Atual</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="font-medium">App - Android</p>
                                <p className="text-xs text-muted-foreground">Porto, Portugal • 2 horas atrás</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Terminar</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Desempenho</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Renderização de Alta Qualidade</Label>
                            <p className="text-sm text-muted-foreground">Melhor qualidade visual (requer mais recursos)</p>
                          </div>
                          <Switch checked={highQualityRendering} onCheckedChange={toggleHighQualityRendering} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Efeitos Sonoros</Label>
                            <p className="text-sm text-muted-foreground">Reproduzir sons na interface</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setPlayTestSound(true)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Switch checked={soundEffects} onCheckedChange={toggleSoundEffects} />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">Carregar Imagens em Baixa Resolução</Label>
                            <p className="text-sm text-muted-foreground">Reduzir qualidade das imagens para melhor desempenho</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Cache e Armazenamento</h3>
                      <div className="space-y-4">
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Cache de Dados</h4>
                                <p className="text-sm text-muted-foreground">24.5 MB em uso</p>
                              </div>
                              <Button variant="outline" size="sm">Limpar</Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Dados Offline</h4>
                                <p className="text-sm text-muted-foreground">12.8 MB em uso</p>
                              </div>
                              <Button variant="outline" size="sm">Limpar</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="language" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Idioma da Interface</h3>
                      <div className="space-y-4">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                            <SelectItem value="fr-FR">Français</SelectItem>
                            <SelectItem value="de-DE">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Card className="bg-muted/30">
                          <CardContent className="p-4">
                            <p className="text-sm">
                              Esta definição altera o idioma da interface do utilizador. Alguns conteúdos gerados pelos utilizadores podem continuar a aparecer no idioma original.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Formato de Data e Hora</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Formato de Data</Label>
                          <Select defaultValue="dd/MM/yyyy">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                              <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                              <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Formato de Hora</Label>
                          <Select defaultValue="HH:mm">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HH:mm">24 horas (14:30)</SelectItem>
                              <SelectItem value="hh:mm a">12 horas (2:30 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="help" className="space-y-6 mt-0">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ajuda e Suporte</h3>
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-6 w-6 text-primary" />
                              <div>
                                <h4 className="font-semibold">Documentação</h4>
                                <p className="text-sm text-muted-foreground">Guias e tutoriais para o Pixel Universe</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                              Abrir Documentação
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="h-6 w-6 text-blue-500" />
                              <div>
                                <h4 className="font-semibold">Contactar Suporte</h4>
                                <p className="text-sm text-muted-foreground">Obtenha ajuda da nossa equipa de suporte</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                              Contactar Suporte
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-6 w-6 text-green-500" />
                              <div>
                                <h4 className="font-semibold">Perguntas Frequentes</h4>
                                <p className="text-sm text-muted-foreground">Respostas para as perguntas mais comuns</p>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                              Ver FAQ
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sobre</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <Image 
                                src="/logo.png" 
                                alt="Pixel Universe" 
                                width={64} 
                                height={64} 
                              />
                            </div>
                            <h4 className="font-semibold text-lg">Pixel Universe</h4>
                            <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
                            <p className="text-xs text-muted-foreground mt-2">© 2025 Pixel Universe. Todos os direitos reservados.</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Definições
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
