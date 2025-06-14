
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Camera, CreditCard, Gem, MapPin, Palette, Settings, Sparkles, Star, Trophy, Upload, User as UserIcon, Edit3, Gift, Coins } from "lucide-react";

export default function MemberPage() {
  const user = {
    name: "Pedro Silva",
    username: "@PixelMasterPT",
    avatarUrl: "https://placehold.co/128x128.png",
    dataAiHint: "profile avatar",
    level: 8,
    xp: 2450,
    xpMax: 3000,
    credits: 12500, 
    specialCredits: 120, 
    bio: "Artista digital e explorador apaixonado por pixel art. Criando universos pixelizados, um quadrado de cada vez! 🇵🇹",
    pixelsOwned: 42,
    achievementsUnlocked: 5, 
    rank: 1, 
    primaryColor: "#FFD700", 
  };

  const nextLevelXp = user.xpMax - user.xp;

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center mb-4"> {/* Reduced bottom margin as UserProfileHeader now global */}
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm shadow-xl border-primary/20">
        <CardHeader className="items-center text-center pt-6 pb-2 relative">
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHint} />
                  <AvatarFallback className="font-headline text-3xl">{user.name.substring(0, 1)}{user.username.substring(1,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge variant="default" className="absolute -top-1 -left-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground border-2 border-card shadow-md">
                  {user.rank === 1 && <Award className="h-3 w-3 mr-1" />}
                  {user.rank > 1 && <Gem className="h-3 w-3 mr-1" />}
                  {user.rank > 0 ? `Top ${user.rank}` : `Nível ${user.level}`}
                </Badge>
                 <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full border-2 border-card bg-muted hover:bg-accent shadow-md">
                  <Camera className="h-4 w-4 text-foreground" />
                </Button>
              </div>

              <div className="mt-4">
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center justify-center">
                  {user.name}
                  {user.rank === 1 && <Award className="h-5 w-5 text-yellow-400 ml-2" title="Melhor Classificado" />}
                  <Palette className="h-5 w-5 text-pink-400 ml-1.5" title="Artista Verificado" />
                  <Sparkles className="h-5 w-5 text-purple-400 ml-1.5" title="Membro Ativo" />
                </h1>
                <p className="text-sm text-muted-foreground font-code">{user.username}</p>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="secondary" className="font-code text-xs py-1">Nível {user.level}</Badge>
              </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="space-y-5">
            
            <Card className="w-full bg-background/50 p-4 text-center rounded-lg shadow">
              <CardDescription className="text-sm text-foreground italic">
                &quot;{user.bio}&quot;
              </CardDescription>
            </Card>

            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-semibold">Progresso de Nível</span>
                <span className="font-code">{user.xp.toLocaleString('pt-PT')} / {user.xpMax.toLocaleString('pt-PT')} XP</span>
              </div>
              <Progress value={(user.xp / user.xpMax) * 100} className="h-3 [&>div]:bg-primary shadow-inner" />
              <p className="text-xs text-muted-foreground text-right font-code">Faltam {nextLevelXp.toLocaleString('pt-PT')} XP para o próximo nível</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-background/50 p-3 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-primary/20 transition-shadow aspect-square">
                    <Coins className="h-7 w-7 text-primary mb-1.5" />
                    <p className="text-2xl font-bold font-code text-foreground">{user.credits.toLocaleString('pt-PT')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Créditos Totais</p>
                </Card>
                <Card className="bg-background/50 p-3 flex flex-col items-center justify-center text-center rounded-lg shadow hover:shadow-accent/20 transition-shadow aspect-square">
                    <Gift className="h-7 w-7 text-accent mb-1.5" />
                    <p className="text-2xl font-bold font-code text-foreground">{user.specialCredits.toLocaleString('pt-PT')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Créditos Especiais</p>
                </Card>
            </div>


            <div className="grid grid-cols-2 gap-4 w-full">
              <Card className="bg-background/50 p-4 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-primary/20 transition-shadow">
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <p className="text-3xl font-bold font-code text-foreground">{user.pixelsOwned}</p>
                <p className="text-xs text-muted-foreground">Pixels Adquiridos</p>
              </Card>
              <Card className="bg-accent/20 p-4 flex flex-col items-center justify-center text-center aspect-square rounded-lg shadow hover:shadow-accent/30 transition-shadow border-accent">
                <Trophy className="h-8 w-8 text-accent-foreground mb-2" />
                <p className="text-3xl font-bold font-code text-accent-foreground">{user.achievementsUnlocked}</p>
                <p className="text-xs text-accent-foreground/80">Conquistas Únicas</p>
              </Card>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full hover:bg-primary/10 transition-colors">
                Ver Galeria de Pixels <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="secondary" className="w-full hover:bg-secondary/70 transition-colors">
                Editar Perfil <Edit3 className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="absolute top-2 right-2 flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors" title="Comprar Créditos">
                  <CreditCard className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors" title="Configurações">
                  <Settings className="h-4 w-4" />
                </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
