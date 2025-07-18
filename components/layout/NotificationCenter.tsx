'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, X, Check, Star, MessageSquare, ShoppingCart, Trophy, Users, MapPin, Palette, Gift, AlertTriangle, Info, Heart, Share2, Crown, Zap, Clock, Filter, SquaresUnite as MarkAsUnread, Settings, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { VirtualizedList } from '@/components/ui/virtualized-list';
import { useTranslation } from 'react-i18next';

type NotificationType = 
  | 'achievement' 
  | 'pixel_purchase' 
  | 'pixel_like' 
  | 'comment' 
  | 'follow' 
  | 'mention' 
  | 'system' 
  | 'event' 
  | 'marketplace'
  | 'community';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  avatar?: string;
  dataAiHint?: string;
  metadata?: {
    pixelCoords?: { x: number; y: number };
    achievementId?: string;
    userId?: string;
    amount?: number;
  };
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  achievement: <Trophy className="h-4 w-4 text-yellow-500" />,
  pixel_purchase: <ShoppingCart className="h-4 w-4 text-green-500" />,
  pixel_like: <Heart className="h-4 w-4 text-red-500" />,
  comment: <MessageSquare className="h-4 w-4 text-blue-500" />,
  follow: <Users className="h-4 w-4 text-purple-500" />,
  mention: <Star className="h-4 w-4 text-orange-500" />,
  system: <Info className="h-4 w-4 text-gray-500" />,
  event: <Zap className="h-4 w-4 text-cyan-500" />,
  marketplace: <MapPin className="h-4 w-4 text-indigo-500" />,
  community: <Users className="h-4 w-4 text-pink-500" />,
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'Nova Conquista Desbloqueada!',
    message: 'Parabéns! Desbloqueaste "Mestre das Cores" - Nível 2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    isImportant: true,
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'achievement notification',
    metadata: { achievementId: 'color_master' }
  },
  {
    id: '2',
    type: 'pixel_like',
    title: 'Pixel Apreciado',
    message: 'PixelArtist123 gostou do teu pixel em Lisboa (245, 156)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
    isImportant: false,
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar',
    metadata: { pixelCoords: { x: 245, y: 156 }, userId: 'PixelArtist123' }
  },
  {
    id: '3',
    type: 'comment',
    title: 'Novo Comentário',
    message: 'ColorMaster comentou no teu álbum "Paisagens de Portugal"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
    isImportant: false,
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'user avatar',
    metadata: { userId: 'ColorMaster' }
  },
  {
    id: '4',
    type: 'system',
    title: 'Manutenção Programada',
    message: 'O sistema estará em manutenção amanhã das 02:00 às 04:00',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    isImportant: true,
    metadata: {}
  },
  {
    id: '5',
    type: 'marketplace',
    title: 'Pixel Vendido!',
    message: 'O teu pixel em Porto foi vendido por 150 créditos',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    isImportant: false,
    metadata: { amount: 150, pixelCoords: { x: 123, y: 89 } }
  }
];

interface NotificationCenterProps {
  children: React.ReactNode;
}

export default function NotificationCenter({ children }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'important':
        return notification.isImportant;
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Notificações Marcadas",
      description: "Todas as notificações foram marcadas como lidas.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notificação Removida",
      description: "A notificação foi removida com sucesso.",
    });
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora mesmo';
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['pixel_like', 'comment', 'follow'][Math.floor(Math.random() * 3)] as NotificationType,
          title: 'Nova Atividade',
          message: 'Tens nova atividade no Pixel Universe!',
          timestamp: new Date(),
          isRead: false,
          isImportant: Math.random() > 0.8,
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'notification avatar',
          metadata: {}
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500 flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {importantCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          )}
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full max-w-md p-0 sm:max-w-md" side="right">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t('notifications.title')}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} {t('notifications.new')}
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                <Check className="h-4 w-4 mr-1" />
                {t('notifications.markAll')}
              </Button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            {[
              { key: 'all', label: t('notifications.all'), count: notifications.length },
              { key: 'unread', label: t('notifications.unread'), count: unreadCount },
              { key: 'important', label: t('notifications.important'), count: importantCount }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(key as any)}
                className="text-xs flex-1"
              >
                {label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                    {count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-140px)]">
          <div className="p-2">
            {filteredNotifications.length === 0 ? (
              <Card className="m-2 p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  {filter === 'all' ? t('notifications.empty.all') : 
                   filter === 'unread' ? t('notifications.empty.unread') : 
                   t('notifications.empty.important')}
                </p>
              </Card>
            ) : (
              <VirtualizedList
                items={filteredNotifications}
                itemSize={120}
                height={Math.min(filteredNotifications.length * 120, 500)}
                width="100%"
                className="pr-2"
                renderItem={(notification) => (
                  <div className="py-1">
                    <Card
                      key={notification.id}
                      className={cn(
                        "transition-all duration-200 hover:shadow-md cursor-pointer",
                        !notification.isRead && "border-primary/50 bg-primary/5",
                        notification.isImportant && "border-orange-500/50 bg-orange-500/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {notification.avatar ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={notification.avatar} 
                                  alt="Notification" 
                                  data-ai-hint={notification.dataAiHint}
                                />
                                <AvatarFallback>
                                  {notificationIcons[notification.type]}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {notificationIcons[notification.type]}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "text-sm font-medium leading-tight",
                                  !notification.isRead && "font-semibold"
                                )}>
                                  {notification.title}
                                  {notification.isImportant && (
                                    <Star className="inline h-3 w-3 ml-1 text-orange-500 fill-current" />
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {getTimeAgo(notification.timestamp)}
                                  </span>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}