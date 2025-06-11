import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Comunidade Pixel Universe</CardTitle>
          <CardDescription>Conecte-se com outros artistas de pixel, participe de discussões e colabore em projetos!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card-foreground/5">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary" /> Fóruns de Discussão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Participe de tópicos sobre técnicas, ideias e eventos da comunidade.</p>
                <Button variant="outline">Acessar Fóruns (Em Breve)</Button>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center"><Users className="h-5 w-5 mr-2 text-accent" />Grupos de Colaboração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Crie ou junte-se a grupos para criar obras de arte em conjunto.</p>
                <Button variant="outline">Ver Grupos (Em Breve)</Button>
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="text-xl font-headline mb-3">Eventos da Comunidade</h3>
            <p className="text-sm text-muted-foreground mb-4">Fique por dentro dos últimos eventos, competições e desafios.</p>
            <Card className="border-primary border-2">
                <CardContent className="p-4">
                    <h4 className="font-semibold text-primary">Pixel Art Challenge: Verão Tropical</h4>
                    <p className="text-xs text-muted-foreground">Data: 15/07 - 30/07</p>
                    <p className="text-sm mt-1">Crie sua melhor arte pixel com tema de verão e concorra a prêmios!</p>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
