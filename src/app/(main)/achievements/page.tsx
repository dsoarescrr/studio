import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function AchievementsPage() {
  const achievements = [
    { id: 1, name: "Primeiro Pixel", description: "Comprou seu primeiro pixel!", icon: <Trophy className="h-6 w-6 text-primary" />, unlocked: true },
    { id: 2, name: "Explorador Nato", description: "Visitou 10 regiões diferentes.", icon: <Trophy className="h-6 w-6 text-primary" />, unlocked: true },
    { id: 3, name: "Mestre das Cores", description: "Usou 20 cores diferentes.", icon: <Trophy className="h-6 w-6 text-muted-foreground" />, unlocked: false },
    { id: 4, name: "Pixel Magnata", description: "Possui 100 pixels.", icon: <Trophy className="h-6 w-6 text-muted-foreground" />, unlocked: false },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Suas Conquistas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Veja todas as conquistas que você desbloqueou e as que ainda faltam!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(ach => (
              <Card key={ach.id} className={`border-2 ${ach.unlocked ? 'border-primary' : 'border-border'}`}>
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
