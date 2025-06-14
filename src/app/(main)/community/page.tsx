
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  CalendarCheck, 
  Award, 
  ThumbsUp, 
  MessageCircle, 
  Edit2, 
  Send, 
  Share2, 
  UserCircle,
  Hash,
  Smile,
  Flag,
  MapPin as MapPinIcon,
  MessageSquareText,
  LayoutGrid, 
  MessagesSquare as ChatIcon, 
  NotebookText 
} from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserProfileSheet } from '@/components/user/UserProfileSheet';
import type { UserProfileData } from '@/components/user/UserProfileDisplay'; 
import { achievementsData } from '@/data/achievements-data'; // Corrected import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type CommentUser = { id: string; name: string; avatarUrl?: string; dataAiHint?: string };
type PostUser = { id: string; name: string; avatarUrl?: string; dataAiHint?: string };

type Comment = {
  id: string;
  user: CommentUser;
  text: string;
  timestamp: Date;
  likes: number;
};

type Post = {
  id: string;
  user: PostUser;
  timestamp: Date;
  content: string;
  imageUrl?: string;
  imageAiHint?: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: Comment[];
};

type ChatUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  dataAiHint?: string;
};

type ChatMessage = {
  id: string;
  roomId: string;
  user: ChatUser;
  text: string;
  timestamp: Date;
  likes: number;
};

type ChatRoom = {
  id: string;
  name: string;
  type: 'global' | 'zone' | 'district';
  icon: React.ReactNode;
};

const initialPosts: Post[] = [
  {
    id: 'post1',
    user: { id: 'user1', name: 'PixelExplorerPT', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'profile avatar' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), 
    content: 'Acabei de descobrir uma nova área escondida no mapa de Portugal! Alguém já encontrou o "Vale Dourado dos Pixels Perdidos"? Fica perto da Serra da Estrela, mas precisei de usar uma combinação de cores específica para revelar a entrada. 🤯',
    imageUrl: 'https://placehold.co/600x400.png',
    imageAiHint: 'pixel art landscape',
    likes: 125,
    commentsCount: 18,
    shares: 7,
    comments: [
      { id: 'c1', user: { id: 'user2', name: 'ArteDigitalPT', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint: 'gaming avatar' }, text: 'Uau, que descoberta! Vou tentar encontrar logo!', timestamp: new Date(Date.now() - 1000 * 60 * 25), likes: 15 },
      { id: 'c2', user: { id: 'user3', name: 'PixelMaster', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint: 'retro avatar' }, text: 'Partilha as coordenadas exatas se puderes! Parece incrível.', timestamp: new Date(Date.now() - 1000 * 60 * 20), likes: 22 },
    ]
  },
  {
    id: 'post2',
    user: { id: 'user4', name: 'RainhaDasCores', avatarUrl: 'https://placehold.co/48x48.png', dataAiHint: 'colorful avatar' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    content: 'Estou a organizar um evento de construção colaborativa no próximo sábado! O tema é "Monumentos de Portugal em Pixel Art". Quem quer participar e ajudar a construir o Mosteiro dos Jerónimos pixelizado? Precisamos de artistas para todas as secções!',
    likes: 88,
    commentsCount: 29,
    shares: 15,
    comments: []
  },
];

const currentUser: UserProfileData = { 
  id: 'currentUser',
  name: 'UtilizadorAtual',
  username: '@EuMesmo',
  avatarUrl: 'https://placehold.co/40x40.png',
  dataAiHint: 'current user avatar',
  level: 5,
  xp: 1200,
  xpMax: 1500,
  credits: 500,
  specialCredits: 20,
  bio: 'Apenas um utilizador de teste.',
  pixelsOwned: 10,
  achievementsUnlocked: 2,
  unlockedAchievementIds: ['pixel_initiate'],
  rank: 0,
  location: 'Internet',
  socials: [],
  albums: []
};

const mockUserProfiles: Record<string, UserProfileData> = {
  'user1': { id: 'user1', name: 'PixelExplorerPT', username: '@PixelExplorerPT', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'explorer avatar', level: 10, xp: 3000, xpMax: 3500, credits: 10000, specialCredits: 100, bio: 'Explorador de mundos pixelizados.', pixelsOwned: 50, achievementsUnlocked: 5, unlockedAchievementIds: ['pixel_initiate', 'territory_pioneer'], rank: 15, location: 'Porto, Portugal', socials: [], albums: [] },
  'user2': { id: 'user2', name: 'ArteDigitalPT', username: '@ArteDigitalPT', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'digital artist avatar', level: 8, xp: 2000, xpMax: 2500, credits: 7500, specialCredits: 70, bio: 'Artista digital apaixonada por cores.', pixelsOwned: 30, achievementsUnlocked: 3, unlockedAchievementIds: ['pixel_artisan', 'color_master'], rank: 22, location: 'Lisboa, Portugal', socials: [], albums: [] },
  'user3': { id: 'user3', name: 'PixelMaster', username: '@PixelMaster', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'master avatar', level: 12, xp: 4000, xpMax: 4500, credits: 15000, specialCredits: 150, bio: 'Mestre dos pixels, construtor de universos.', pixelsOwned: 100, achievementsUnlocked: 7, unlockedAchievementIds: ['pixel_tycoon', 'legendary_collector'], rank: 5, location: 'Braga, Portugal', socials: [], albums: [] },
  'user4': { id: 'user4', name: 'RainhaDasCores', username: '@RainhaDasCores', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'queen avatar', level: 9, xp: 2800, xpMax: 3000, credits: 9000, specialCredits: 90, bio: 'A rainha das paletas de cores.', pixelsOwned: 40, achievementsUnlocked: 4, unlockedAchievementIds: ['color_master', 'community_star'], rank: 18, location: 'Faro, Portugal', socials: [], albums: [] },
  'u1': { id: 'u1', name: 'PixelChatter', username: '@PixelChatter', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'chat avatar', level: 3, xp: 300, xpMax: 500, credits: 200, specialCredits: 5, bio: 'Adoro conversar sobre pixels!', pixelsOwned: 2, achievementsUnlocked: 1, unlockedAchievementIds: [], rank: 101, location: 'Online', socials: [], albums: [] },
  'u2': { id: 'u2', name: 'AdminBot', username: '@AdminBot', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'bot avatar', level: 99, xp: 0, xpMax: 0, credits: 0, specialCredits: 0, bio: 'Eu sou um bot.', pixelsOwned: 0, achievementsUnlocked: 0, unlockedAchievementIds: [], rank: 0, location: 'Servidor', socials: [], albums: [] },
  'u3': { id: 'u3', name: 'NortenhoPixel', username: '@NortenhoPixel', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'northern user', level: 6, xp: 1500, xpMax: 2000, credits: 1200, specialCredits: 30, bio: 'Do Norte com amor e pixels.', pixelsOwned: 15, achievementsUnlocked: 2, unlockedAchievementIds: [], rank: 50, location: 'Viana do Castelo', socials: [], albums: [] },
  'u4': { id: 'u4', name: 'AlfacinhaPixel', username: '@AlfacinhaPixel', avatarUrl: 'https://placehold.co/128x128.png', dataAiHint: 'lisbon user', level: 7, xp: 1800, xpMax: 2200, credits: 2000, specialCredits: 40, bio: 'Lisboa em cada pixel.', pixelsOwned: 25, achievementsUnlocked: 3, unlockedAchievementIds: [], rank: 40, location: 'Lisboa Capital', socials: [], albums: [] },
  'currentUser': currentUser // Add current user to mock profiles for easy lookup
};

const initialChatRooms: ChatRoom[] = [
  { id: 'global', name: 'Global', type: 'global', icon: <Users className="h-4 w-4 mr-2" /> },
  { id: 'zona-norte', name: 'Zona Norte', type: 'zone', icon: <MapPinIcon className="h-4 w-4 mr-2" /> },
  { id: 'distrito-lisboa', name: 'Distrito Lisboa', type: 'district', icon: <MapPinIcon className="h-4 w-4 mr-2 text-accent" /> },
];

const initialChatMessages: ChatMessage[] = [
  { id: 'cm1', roomId: 'global', user: { id: 'u1', name: 'PixelChatter', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint:'user avatar' }, text: 'Olá a todos no chat global!', timestamp: new Date(Date.now() - 1000 * 60 * 10), likes: 5 },
  { id: 'cm2', roomId: 'global', user: { id: 'u2', name: 'AdminBot', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint:'bot avatar' }, text: 'Bem-vindos ao Pixel Universe! Lembrem-se de ser cordiais.', timestamp: new Date(Date.now() - 1000 * 60 * 9), likes: 12 },
  { id: 'cm3', roomId: 'zona-norte', user: { id: 'u3', name: 'NortenhoPixel', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint:'northern user' }, text: 'Alguém da Zona Norte por aqui?', timestamp: new Date(Date.now() - 1000 * 60 * 5), likes: 3 },
  { id: 'cm4', roomId: 'distrito-lisboa', user: { id: 'u4', name: 'AlfacinhaPixel', avatarUrl: 'https://placehold.co/40x40.png', dataAiHint:'lisbon user' }, text: 'Ideias para um pixel art de Lisboa?', timestamp: new Date(Date.now() - 1000 * 60 * 2), likes: 7 },
];


const FormattedTimestamp: React.FC<{ timestamp: Date; className?: string }> = ({ timestamp, className }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const seconds = Math.round((now.getTime() - timestamp.getTime()) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (seconds < 5) setTimeAgo(`agora`);
      else if (seconds < 60) setTimeAgo(`${seconds}s`);
      else if (minutes < 60) setTimeAgo(`${minutes}m`);
      else if (hours < 24) setTimeAgo(`${hours}h`);
      else setTimeAgo(`${days}d`);
    };
    update();
    const intervalId = setInterval(update, 5000);
    return () => clearInterval(intervalId);
  }, [timestamp]);

  if (!timeAgo) return null;
  return <span className={cn("text-xs text-muted-foreground font-code", className)} title={timestamp.toLocaleString()}>{timeAgo}</span>;
};


export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');

  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>(initialChatRooms[0].id);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [newChatMessage, setNewChatMessage] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: `post${Date.now()}`,
      user: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl, dataAiHint: currentUser.dataAiHint },
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

  const handleSendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedChatRoomId) return;
    const message: ChatMessage = {
      id: `cm${Date.now()}`,
      roomId: selectedChatRoomId,
      user: { id: currentUser.id, name: currentUser.name, avatarUrl: currentUser.avatarUrl, dataAiHint: currentUser.dataAiHint },
      text: newChatMessage,
      timestamp: new Date(),
      likes: 0,
    };
    setChatMessages(prev => [...prev, message]);
    setNewChatMessage('');
  };

  const handleLikeChatMessage = (messageId: string) => {
    setChatMessages(msgs => msgs.map(msg => msg.id === messageId ? { ...msg, likes: msg.likes + 1} : msg));
  };

  const displayedChatMessages = chatMessages.filter(msg => msg.roomId === selectedChatRoomId);
  const selectedChatRoom = initialChatRooms.find(room => room.id === selectedChatRoomId);
  
  const uniqueUsersInRoom = new Set(displayedChatMessages.map(msg => msg.user.id)).size;


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

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="feed" className="font-headline">
            <LayoutGrid className="h-4 w-4 mr-2"/>Feed
            </TabsTrigger>
          <TabsTrigger value="chat" className="font-headline">
            <ChatIcon className="h-4 w-4 mr-2"/>Chat
            </TabsTrigger>
          <TabsTrigger value="forums" className="font-headline">
            <NotebookText className="h-4 w-4 mr-2"/>Fóruns
            </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <Card className="shadow-lg bg-card/80 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center">
                <Edit2 className="h-5 w-5 mr-2 text-accent" /> Criar Nova Publicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                  <Avatar className="h-10 w-10 border-2 border-primary mt-1 cursor-pointer">
                    <AvatarImage src={currentUser.avatarUrl} alt="Seu Avatar" data-ai-hint={currentUser.dataAiHint} />
                    <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                  </Avatar>
                </UserProfileSheet>
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

          <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2 text-primary" /> Feed da Comunidade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {posts.map((post) => (
                <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card/70 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                        <UserProfileSheet userData={mockUserProfiles[post.user.id] || {...post.user, ...currentUser, id: post.user.id, name: post.user.name, avatarUrl: post.user.avatarUrl}} achievementsData={achievementsData}>
                            <Avatar className="h-11 w-11 border-2 border-secondary cursor-pointer">
                                <AvatarImage src={post.user.avatarUrl} alt={post.user.name} data-ai-hint={post.user.dataAiHint} />
                                <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </UserProfileSheet>
                        <div>
                            <UserProfileSheet userData={mockUserProfiles[post.user.id] || {...post.user, ...currentUser, id: post.user.id, name: post.user.name, avatarUrl: post.user.avatarUrl}} achievementsData={achievementsData}>
                                <p className="font-semibold text-primary text-md hover:underline cursor-pointer">{post.user.name}</p>
                            </UserProfileSheet>
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
                    
                    {post.comments.length > 0 && (
                    <div className="px-4 pb-3 pt-1">
                        <Separator className="mb-2 bg-border/30"/>
                        <h4 className="text-xs font-headline text-muted-foreground mb-1.5">Comentários:</h4>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                        {post.comments.slice(0, 2).map(comment => ( 
                            <div key={comment.id} className="flex items-start space-x-2 text-xs bg-background/30 p-1.5 rounded-md">
                            <UserProfileSheet userData={mockUserProfiles[comment.user.id] || {...comment.user, ...currentUser, id: comment.user.id, name: comment.user.name, avatarUrl: comment.user.avatarUrl}} achievementsData={achievementsData}>
                                <Avatar className="h-6 w-6 border border-border cursor-pointer">
                                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint={comment.user.dataAiHint}/>
                                    <AvatarFallback className="text-[10px]">{comment.user.name.substring(0,1)}</AvatarFallback>
                                </Avatar>
                            </UserProfileSheet>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <UserProfileSheet userData={mockUserProfiles[comment.user.id] || {...comment.user, ...currentUser, id: comment.user.id, name: comment.user.name, avatarUrl: comment.user.avatarUrl}} achievementsData={achievementsData}>
                                        <span className="font-semibold text-accent text-[11px] hover:underline cursor-pointer">{comment.user.name}</span>
                                    </UserProfileSheet>
                                <FormattedTimestamp timestamp={comment.timestamp} className="text-[10px]"/>
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
                             <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                                <Avatar className="h-7 w-7 border border-border cursor-pointer">
                                    <AvatarImage src={currentUser.avatarUrl} alt="Seu Avatar" data-ai-hint={currentUser.dataAiHint} />
                                    <AvatarFallback className="text-[10px]"><UserCircle className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            </UserProfileSheet>
                            <Input 
                                placeholder="Adicionar um comentário..." 
                                className="h-8 text-xs bg-background/50 focus:border-primary rounded-full px-3 flex-1"
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
           <Card className="shadow-xl bg-card/85 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <MessageSquareText className="h-6 w-6 mr-2 text-primary" /> Salas de Chat
              </CardTitle>
              <CardDescription>Converse em tempo real com outros membros da comunidade.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 md:p-0">
              <div className="flex flex-col md:flex-row min-h-[500px] max-h-[70vh] border-t md:border-t-0 border-border">
                <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-border p-3 bg-background/30">
                  <h3 className="text-sm font-semibold mb-3 font-code text-muted-foreground px-1">CANAIS</h3>
                  <div className="space-y-1">
                    {initialChatRooms.map(room => (
                      <Button
                        key={room.id}
                        variant={selectedChatRoomId === room.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedChatRoomId(room.id)}
                      >
                        {React.cloneElement(room.icon as React.ReactElement, { className: cn("h-4 w-4 mr-2", selectedChatRoomId === room.id ? 'text-secondary-foreground' : 'text-muted-foreground') })}
                        {room.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col bg-background/10">
                  {selectedChatRoom && (
                    <CardHeader className="py-3 px-4 border-b border-border bg-card/50">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center">
                            {React.cloneElement(selectedChatRoom.icon as React.ReactElement, {className: "h-5 w-5 mr-2 text-primary"})}
                            <CardTitle className="text-lg font-headline">{selectedChatRoom.name}</CardTitle>
                         </div>
                         <Badge variant="outline" className="font-code text-xs">{uniqueUsersInRoom} online</Badge>
                      </div>
                    </CardHeader>
                  )}
                  <ScrollArea className="flex-1 p-4 space-y-4">
                    {displayedChatMessages.map(msg => (
                      <div key={msg.id} className="flex items-start space-x-3 group py-1.5">
                        <UserProfileSheet userData={mockUserProfiles[msg.user.id] || {...msg.user, ...currentUser, id: msg.user.id, name: msg.user.name, avatarUrl: msg.user.avatarUrl}} achievementsData={achievementsData}>
                            <Avatar className="h-9 w-9 border border-border cursor-pointer">
                            <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} data-ai-hint={msg.user.dataAiHint} />
                            <AvatarFallback>{msg.user.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                        </UserProfileSheet>
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-2">
                            <UserProfileSheet userData={mockUserProfiles[msg.user.id] || {...msg.user, ...currentUser, id: msg.user.id, name: msg.user.name, avatarUrl: msg.user.avatarUrl}} achievementsData={achievementsData}>
                                <p className="text-sm font-semibold text-primary hover:underline cursor-pointer">{msg.user.name}</p>
                            </UserProfileSheet>
                            <FormattedTimestamp timestamp={msg.timestamp} className="text-[10px]" />
                          </div>
                          <p className="text-sm text-foreground/90">{msg.text}</p>
                        </div>
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleLikeChatMessage(msg.id)}>
                                <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                            </Button>
                            {msg.likes > 0 && <span className="text-xs font-code text-muted-foreground mr-1">{msg.likes}</span>}
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Flag className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                    {displayedChatMessages.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-10">Ainda não há mensagens nesta sala. Sê o primeiro!</p>
                    )}
                  </ScrollArea>
                  <div className="p-3 border-t border-border bg-card/50">
                    <div className="flex items-center space-x-2">
                        <UserProfileSheet userData={mockUserProfiles[currentUser.id] || currentUser} achievementsData={achievementsData}>
                            <Avatar className="h-9 w-9 border border-border cursor-pointer">
                                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint={currentUser.dataAiHint}/>
                                <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                        </UserProfileSheet>
                      <Input 
                        placeholder={`Mensagem em #${selectedChatRoom?.name || 'chat'}...`}
                        value={newChatMessage}
                        onChange={e => setNewChatMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChatMessage())}
                        className="flex-1 bg-background/70 focus:border-primary h-10 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Smile className="h-5 w-5" />
                      </Button>
                      <Button onClick={handleSendChatMessage} disabled={!newChatMessage.trim()} className="bg-primary hover:bg-primary/90 h-10">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forums">
            <Card className="bg-card-foreground/5 hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center"><MessageSquare className="h-5 w-5 mr-2 text-primary" /> Fóruns de Discussão</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Participe de tópicos sobre técnicas, compartilhe suas criações, peça feedback e inspire-se.</p>
                    <Button variant="outline" disabled>Aceder aos Fóruns (Em Breve)</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
