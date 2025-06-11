import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

export default function RankingPage() {
  const rankingData = [
    { rank: 1, user: "PixelGod", pixels: 5032, score: 125000, avatar: "https://placehold.co/40x40.png?text=PG" },
    { rank: 2, user: "ArtMaster", pixels: 4500, score: 110000, avatar: "https://placehold.co/40x40.png?text=AM" },
    { rank: 3, user: "ColorQueen", pixels: 3800, score: 95000, avatar: "https://placehold.co/40x40.png?text=CQ" },
    { rank: 4, user: "PixelPioneer", pixels: 3200, score: 80000, avatar: "https://placehold.co/40x40.png?text=PP" },
    { rank: 5, user: "GridGuardian", pixels: 2800, score: 70000, avatar: "https://placehold.co/40x40.png?text=GG" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Ranking de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Confira os usuários mais ativos e com mais pixels no universo!</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] font-code">Rank</TableHead>
                <TableHead className="font-code">Usuário</TableHead>
                <TableHead className="text-right font-code">Pixels</TableHead>
                <TableHead className="text-right font-code">Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankingData.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-semibold">
                    {entry.rank === 1 && <Medal className="inline h-5 w-5 mr-1 text-yellow-400" />}
                    {entry.rank === 2 && <Medal className="inline h-5 w-5 mr-1 text-gray-400" />}
                    {entry.rank === 3 && <Medal className="inline h-5 w-5 mr-1 text-orange-400" />}
                    #{entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={entry.avatar} alt={entry.user} data-ai-hint="avatar user" />
                        <AvatarFallback>{entry.user.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {entry.user}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-code">{entry.pixels.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-code">{entry.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
