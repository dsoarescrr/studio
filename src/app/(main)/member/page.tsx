import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Área de Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bem-vindo à sua área de membro. Aqui você poderá gerenciar seus pixels, conquistas e perfil.</p>
          <p className="mt-4 font-code text-muted-foreground">Funcionalidades futuras incluem: edição de perfil, lista de pixels comprados, histórico de transações, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}
