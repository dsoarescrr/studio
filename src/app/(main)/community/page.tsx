
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, CalendarCheck, Award, ThumbsUp, MessageCircle, Edit2, Send, Share2, UserCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';


type Comment = {
  id: string;
  user: { name: string; avatarUrl?: string; dataAiHint?: string };
  text: string;
  timestamp: Date;
  likes: number;
};

type Post = {
  id: string;
  user: { name: string; avatarUrl?: string; dataAiHint?: string };
  timestamp: Date;
  content: string;
  imageUrl?: string;
  imageAiHint?: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: Comment[];
};

const initialPosts: Post[] = [
  {
    id: 'post1',
    user: { name: 'PixelExplorerPT', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'profile avatar' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    content: 'Acabei de descobrir uma nova área escondida no mapa de Portugal! Alguém já encontrou o "Vale Dourado dos Pixels Perdidos"? Fica perto da Serra da Estrela, mas precisei de usar uma combinação de cores específica para revelar a entrada. 🤯',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'pixel art landscape',
    likes: 125,
    commentsCount: 18,
    shares: 7,
    comments: [
      { id: 'c1', user: { name: 'ArteDigitalPT', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint: 'gaming avatar' }, text: 'Uau, que descoberta! Vou tentar encontrar logo!', timestamp: new Date(Date.now() - 1000 * 60 * 25), likes: 15 },
      { id: 'c2', user: { name: 'PixelMaster', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint: 'retro avatar' }, text: 'Partilha as coordenadas exatas se puderes! Parece incrível.', timestamp: new Date(Date.now() - 1000 * 60 * 20), likes: 22 },
    ]
  },
  {
    id: 'post2',
    user: { name: 'RainhaDasCores', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'colorful avatar' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    content: 'Estou a organizar um evento de construção colaborativa no próximo sábado! O tema é "Monumentos de Portugal em Pixel Art". Quem quer participar e ajudar a construir o Mosteiro dos Jerónimos pixelizado? Precisamos de artistas para todas as secções!',
    likes: 88,
    commentsCount: 29,
    shares: 15,
    comments: []
  },
  {
    id: 'post3',
    user: { name: 'OldSchoolGamer', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'gamer avatar' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    content: 'Só para dizer que adoro a vibe retro desta plataforma. Faz-me lembrar os bons velhos tempos dos jogos de 8-bits. Continuem o bom trabalho, equipa! #PixelArt #RetroGaming',
    likes: 210,
    commentsCount: 35,
    shares: 2,
    comments: []
  },
];

const FormattedTimestamp: React.FC<{ timestamp: Date }> = ({ timestamp }) => {
  const [timeAgo, setTimeAgo] = useState('');

  React.useEffect(() => {
    const now = new Date();
    const seconds = Math.round((now.getTime() - timestamp.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) setTimeAgo(`${seconds}s atrás`);
    else if (minutes < 60) setTimeAgo(`${minutes}m atrás`);
    else if (hours < 24) setTimeAgo(`${hours}h atrás`);
    else setTimeAgo(`${days}d atrás`);
  }, [timestamp]);

  if (!timeAgo) return null;
  return <span className="text-xs text-muted-foreground font-code" title={timestamp.toLocaleString()}>{timeAgo}</span>;
};


export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: `post${Date.now()}`,
      user: { name: 'UtilizadorAtual', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'current user' }, // Placeholder
      timestamp: new Date(),
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      comments: [],
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setNewPostContent('');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };
  
  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c)
        };
      }
      return p;
    }));
  };


  return (
    <div className="container mx-auto py-8 px-4 space-y-8 mb-20">
      <Card className="shadow-xl bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Users className="h-7 w-7 mr-3 text-primary" /> Comunidade Pixel Universe
          </CardTitle>
          <CardDescription>Partilhe as suas criações, ideias e conecte-se com outros artistas!</CardDescription>
        </CardHeader>
      </Card>

      {/* Create Post Section */}
      <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center">
            <Edit2 className="h-5 w-5 mr-2 text-accent" /> Criar Nova Publicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary mt-1">
              <AvatarImage src="https://placehold.co/48x48.png" alt="Seu Avatar" data-ai-hint="current user avatar" />
              <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="No que está a pensar, artista?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="flex-1 min-h-[80px] bg-background/70 focus:border-primary"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button onClick={handleCreatePost} disabled={!newPostContent.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4 mr-2" /> Publicar
          </Button>
        </CardFooter>
      </Card>

      {/* Feed Section */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-11 w-11 border-2 border-secondary">
                  <AvatarImage src={post.user.avatarUrl} alt={post.user.name} data-ai-hint={post.user.dataAiHint} />
                  <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-primary text-md hover:underline cursor-pointer">{post.user.name}</p>
                  <FormattedTimestamp timestamp={post.timestamp} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border aspect-video">
                  <img src={post.imageUrl} alt="Conteúdo da publicação" className="w-full h-full object-cover" data-ai-hint={post.imageAiHint} />
                </div>
              )}
            </CardContent>
            <Separator className="bg-border/50" />
            <CardFooter className="py-2 px-4 flex justify-between items-center text-muted-foreground">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => handleLikePost(post.id)} className="hover:text-primary transition-colors px-2">
                  <ThumbsUp className="h-4 w-4 mr-1.5" /> 
                  <span className="text-xs font-code">{post.likes > 0 ? post.likes : ''}</span>
                </Button>
                <Button variant="ghost" size="sm" className="hover:text-primary transition-colors px-2">
                  <MessageCircle className="h-4 w-4 mr-1.5" /> 
                  <span className="text-xs font-code">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                </Button>
                <Button variant="ghost" size="sm" className="hover:text-primary transition-colors px-2">
                  <Share2 className="h-4 w-4 mr-1.5" /> 
                  <span className="text-xs font-code">{post.shares > 0 ? post.shares : ''}</span>
                </Button>
              </div>
            </CardFooter>
            
            {/* Comments Section (Simplified) */}
            {post.comments.length > 0 && (
              <div className="px-4 pb-3 pt-1">
                <Separator className="mb-2 bg-border/30"/>
                <h4 className="text-xs font-headline text-muted-foreground mb-1.5">Comentários:</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                  {post.comments.slice(0, 2).map(comment => ( // Show max 2 comments initially
                    <div key={comment.id} className="flex items-start space-x-2 text-xs bg-background/30 p-1.5 rounded-md">
                      <Avatar className="h-6 w-6 border border-border">
                        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint={comment.user.dataAiHint}/>
                        <AvatarFallback className="text-[10px]">{comment.user.name.substring(0,1)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-semibold text-accent text-[11px] hover:underline cursor-pointer">{comment.user.name}</span>
                           <FormattedTimestamp timestamp={comment.timestamp}/>
                        </div>
                        <p className="text-foreground/90 text-[11px]">{comment.text}</p>
                         <div className="flex items-center mt-0.5">
                            <Button variant="ghost" size="icon" onClick={() => handleLikeComment(post.id, comment.id)} className="h-5 w-5 hover:text-primary transition-colors group">
                                <ThumbsUp className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary" />
                            </Button>
                            {comment.likes > 0 && <span className="text-[10px] text-muted-foreground font-code ml-0.5">{comment.likes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {post.comments.length > 2 && (
                  <Button variant="link" size="sm" className="text-xs mt-1 text-primary p-0 h-auto">Ver todos os {post.commentsCount} comentários</Button>
                )}
              </div>
            )}
             <div className="px-4 pb-3 pt-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7 border border-border">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Seu Avatar" data-ai-hint="current user avatar" />
                        <AvatarFallback className="text-[10px]"><UserCircle /></AvatarFallback>
                    </Avatar>
                    <Input 
                        placeholder="Adicionar um comentário..." 
                        className="h-8 text-xs bg-background/50 focus:border-primary rounded-full px-3"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
                        <Send className="h-3.5 w-3.5"/>
                    </Button>
                </div>
            </div>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card className="text-center p-6 bg-card/50">
            <CardDescription>Ainda não há publicações. Seja o primeiro a partilhar algo!</CardDescription>
          </Card>
        )}
      </div>

      {/* Existing Sections - Could be refactored into separate components or layout improved later */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
        <h3 className="text-xl font-headline mb-3 flex items-center mt-8"><CalendarCheck className="h-6 w-6 mr-2 text-primary"/>Eventos da Comunidade</h3>
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
    </div>
  );
}

