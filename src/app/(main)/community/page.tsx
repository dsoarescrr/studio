
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, CalendarCheck, Award } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Comunidade Pixel Universe</CardTitle>
          <CardDescription>Conecte-se com outros artistas de pixel, participe de discussões e colabore em projetos incríveis!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card-foreground/5 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary" /> Fóruns de Discussão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Participe de tópicos sobre técnicas, compartilhe suas criações, peça feedback e inspire-se.</p>
                <Button variant="outline" disabled>Acessar Fóruns (Em Breve)</Button>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center"><Users className="h-5 w-5 mr-2 text-accent" />Grupos de Colaboração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Crie ou junte-se a grupos para criar obras de arte pixeladas em conjunto no grande canvas de Portugal.</p>
                <Button variant="outline" disabled>Ver Grupos (Em Breve)</Button>
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="text-xl font-headline mb-3 flex items-center"><CalendarCheck className="h-6 w-6 mr-2 text-primary"/>Eventos da Comunidade</h3>
            <p className="text-sm text-muted-foreground mb-4">Fique por dentro dos últimos eventos, competições e desafios temáticos. Mostre seu talento e ganhe prêmios!</p>
            <Card className="border-primary border-2 shadow-lg hover:shadow-primary/30 transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-headline flex items-center text-primary"><Award className="h-5 w-5 mr-2"/>Pixel Art Challenge: Verão Tropical</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground font-code">Data: 15/07 - 30/07</p>
                    <p className="text-sm mt-1">Crie sua melhor arte pixel com o tema vibrante do verão tropical e concorra a pacotes de créditos e emblemas exclusivos!</p>
                    <Button variant="default" className="mt-3" disabled>Participar (Em Breve)</Button>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
