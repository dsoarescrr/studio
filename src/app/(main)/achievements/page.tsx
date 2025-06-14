
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lock } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { id: 1, name: "Primeiro Pixel", description: "Comprou seu primeiro pixel!", icon: <Trophy className="h-6 w-6 text-primary" />, unlocked: true },
    { id: 2, name: "Explorador Nato", description: "Visitou 10 regiões diferentes.", icon: <Trophy className="h-6 w-6 text-primary" />, unlocked: true },
    { id: 3, name: "Mestre das Cores", description: "Usou 20 cores diferentes.", icon: <Lock className="h-6 w-6 text-muted-foreground" />, unlocked: false },
    { id: 4, name: "Pixel Magnata", description: "Possui 100 pixels.", icon: <Lock className="h-6 w-6 text-muted-foreground" />, unlocked: false },
    { id: 5, name: "Socialite Digital", description: "Participou de um evento da comunidade.", icon: <Lock className="h-6 w-6 text-muted-foreground" />, unlocked: false },
    { id: 6, name: "Colecionador Lendário", description: "Possui um pixel em cada região.", icon: <Lock className="h-6 w-6 text-muted-foreground" />, unlocked: false },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Suas Conquistas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">Veja todas as conquistas que você desbloqueou e as que ainda faltam para se tornar uma lenda do Pixel Universe!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(ach => (
              <Card key={ach.id} className={`border-2 ${ach.unlocked ? 'border-primary hover:border-primary/80' : 'border-border hover:border-muted-foreground/50'} transition-all duration-200 ease-in-out hover:shadow-md`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-lg font-headline ${ach.unlocked ? 'text-primary' : 'text-muted-foreground'}`}>{ach.name}</CardTitle>
                  {ach.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{ach.description}</p>
                  <p className={`mt-2 text-xs font-bold ${ach.unlocked ? 'text-green-400' : 'text-red-400'}`}>
                    {ach.unlocked ? "Desbloqueada" : "Bloqueada"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
