
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Camera, CreditCard, Gem, MapPin, Palette, Settings, Sparkles, Star, Trophy, Upload, User as UserIcon } from "lucide-react";

export default function MemberPage() {
  const user = {
    name: "Pedro Silva",
    username: "@PixelMaster",
    avatarUrl: "https://placehold.co/128x128.png",
    level: 8,
    rating: 4.8,
    xp: 2450,
    xpMax: 3000,
    bio: "Artista digital apaixonado por pixel art. Criando arte única no universo digital!",
    pixels: 42,
    achievements: 15,
    rank: 1, // Example: Gold medal for rank 1
    primaryColor: "#FFD700", // Example color for palette icon
    specialCredits: 100 // Example for sparkles icon
  };

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center min-h-[calc(100vh-var(--bottom-nav-height)-1rem)] mb-[var(--bottom-nav-height)]">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* User Info Header */}
            <div className="relative w-full flex flex-col items-center">
              <div className="absolute top-0 right-0 flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md">
                  <CreditCard className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md">
                  <Settings className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 rounded-md">
                  <Upload className="h-4 w-4 text-primary" />
                </Button>
              </div>

              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Badge variant="default" className="absolute -top-1 -left-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground border-2 border-card">
                  {user.rank === 1 && <Award className="h-3 w-3 mr-1" />}
                  {user.rank > 1 && <Gem className="h-3 w-3 mr-1" />}
                  {user.rank > 0 ? `Top ${user.rank}` : `Nível ${user.level}`}
                </Badge>
                 <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-card bg-muted hover:bg-accent">
                  <Camera className="h-4 w-4 text-foreground" />
                </Button>
              </div>

              <div className="text-center mt-4">
                <h1 className="text-2xl font-headline font-bold text-foreground flex items-center justify-center">
                  {user.name}
                  <Award className="h-5 w-5 text-yellow-400 ml-2" />
                  <Palette className="h-5 w-5 text-pink-400 ml-1.5" />
                  <Sparkles className="h-5 w-5 text-purple-400 ml-1.5" />
                </h1>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="font-code text-xs">Nível {user.level}</Badge>
                <div className="flex items-center text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 mr-1 fill-amber-400" />
                  <span>{user.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <Card className="w-full bg-background/50 p-4 text-center">
              <p className="text-sm text-foreground">
                {user.bio} <span role="img" aria-label="palette">🎨</span> <span role="img" aria-label="sparkles">✨</span>
              </p>
            </Card>

            {/* XP Progress Bar */}
            <div className="w-full space-y-1">
              <Progress value={(user.xp / user.xpMax) * 100} className="h-3 [&>div]:bg-primary" />
              <p className="text-xs text-muted-foreground text-right font-code">{user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} XP</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <Card className="bg-background/50 p-4 flex flex-col items-center justify-center text-center aspect-square">
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold font-code text-foreground">{user.pixels}</p>
                <p className="text-xs text-muted-foreground">Pixels</p>
                <p className="text-xs text-muted-foreground/70">propriedades</p>
              </Card>
              <Card className="bg-accent/30 p-4 flex flex-col items-center justify-center text-center aspect-square border-accent">
                <Trophy className="h-8 w-8 text-accent-foreground mb-2" />
                <p className="text-2xl font-bold font-code text-accent-foreground">{user.achievements}</p>
                <p className="text-xs text-accent-foreground/80">Conquistas</p>
                <p className="text-xs text-accent-foreground/70">desbloqueadas</p>
              </Card>
            </div>

             {/* Example additional buttons/links */}
            <Button variant="outline" className="w-full">
              Ver Galeria de Pixels <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
             <Button variant="secondary" className="w-full">
              Editar Perfil <UserIcon className="h-4 w-4 ml-2" />
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
