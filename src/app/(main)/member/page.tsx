
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Camera, CreditCard, Gem, MapPin, Palette, Settings, Sparkles, Star, Trophy, Upload, User as UserIcon, Edit3 } from "lucide-react";

export default function MemberPage() {
  const user = {
    name: "Pedro Silva",
    username: "@PixelMasterPT",
    avatarUrl: "https://placehold.co/128x128.png",
    level: 8,
    rating: 4.8,
    xp: 2450,
    xpMax: 3000,
    bio: "Artista digital e explorador apaixonado por pixel art. Criando universos pixelizados, um quadrado de cada vez! 🇵🇹",
    pixelsOwned: 42,
    achievementsUnlocked: 15,
    rank: 1, 
    primaryColor: "#FFD700", 
    specialCredits: 100 
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-var(--bottom-nav-height)-1rem)] mb-[calc(var(--bottom-nav-height)+1rem)]">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            
            <div className="relative w-full flex flex-col items-center">
              <div className="absolute top-0 right-0 flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <CreditCard className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative mt-8 sm:mt-0">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                  <AvatarFallback className="font-headline text-2xl">{user.name.substring(0, 1)}{user.username.substring(1,2)}</AvatarFallback>
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

              <div className="text-center mt-4">
                <h1 className="text-2xl font-headline font-bold text-foreground flex items-center justify-center">
                  {user.name}
                  {user.rank === 1 && <Award className="h-5 w-5 text-yellow-400 ml-2" title="Top Rank" />}
                  <Palette className="h-5 w-5 text-pink-400 ml-1.5" title="Artista Verificado" />
                  <Sparkles className="h-5 w-5 text-purple-400 ml-1.5" title="Membro Ativo" />
                </h1>
                <p className="text-sm text-muted-foreground font-code">{user.username}</p>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="font-code text-xs">Nível {user.level}</Badge>
                <div className="flex items-center text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 mr-1 fill-amber-400" />
                  <span className="font-bold">{user.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <Card className="w-full bg-background/50 p-4 text-center rounded-lg shadow">
              <p className="text-sm text-foreground italic">
                &quot;{user.bio}&quot;
              </p>
            </Card>

            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso de Nível</span>
                <span className="font-code">{user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} XP</span>
              </div>
              <Progress value={(user.xp / user.xpMax) * 100} className="h-3 [&>div]:bg-primary shadow-inner" />
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
                <p className="text-xs text-accent-foreground/80">Conquistas Desbloqueadas</p>
              </Card>
            </div>
            
            <Button variant="outline" className="w-full hover:bg-primary/10 transition-colors">
              Ver Galeria de Pixels <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
             <Button variant="secondary" className="w-full hover:bg-secondary/70 transition-colors">
              Editar Perfil <Edit3 className="h-4 w-4 ml-2" />
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
