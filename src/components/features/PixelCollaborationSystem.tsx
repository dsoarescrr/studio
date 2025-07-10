'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Users, UserPlus, MessageSquare, Calendar, Clock, CheckCircle, 
  XCircle, AlertTriangle, Info, HelpCircle, Settings, Zap, 
  Award, Gift, Heart, Star, Crown, Gem, Sparkles, MapPin, 
  Palette, Brush, Edit, Eye, Share2, Lock, Unlock, Plus, 
  Minus, ArrowRight, ArrowLeft, ChevronRight, ChevronDown, 
  ChevronUp, Search, Filter, SortAsc, RefreshCw, Download, 
  Upload, Copy, Trash2, Save, Send, Image, FileImage, Link,
  Layers, Grid, Layout, Maximize2, Minimize2, Move, Target,
  PenTool, Eraser, Pipette, Crop, RotateCw, RotateCcw, FlipHorizontal,
  FlipVertical, Undo, Redo, Play, Pause, Square, Circle, Triangle,
  Hexagon, Type, BoldIcon, ItalicIcon, Underline, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, CheckSquare, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/lib/store';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
type ProjectStatus = 'active' | 'completed' | 'planning' | 'paused';
type ProjectVisibility = 'public' | 'private' | 'invite-only';
type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
type ActivityType = 'join' | 'leave' | 'edit' | 'comment' | 'milestone' | 'invite';
type ToolType = 'brush' | 'eraser' | 'pipette' | 'shape' | 'text' | 'select' | 'move';

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  dataAiHint?: string;
  role: MemberRole;
  joinedAt: Date;
  contributions: number;
  isOnline?: boolean;
}

interface ProjectActivity {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
    dataAiHint?: string;
  };
  timestamp: Date;
  details?: string;
  pixelCoordinates?: { x: number; y: number };
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  assignees: string[];
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    dataAiHint?: string;
  };
  timestamp: Date;
  likes: number;
  hasLiked?: boolean;
}

interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  owner: {
    id: string;
    name: string;
    avatar?: string;
    dataAiHint?: string;
  };
  members: ProjectMember[];
  activities: ProjectActivity[];
  milestones: ProjectMilestone[];
  comments: Comment[];
  pixelCount: number;
  completedPixels: number;
  tags: string[];
  coverImage?: string;
  dataAiHint?: string;
  region: string;
  coordinates: { x: number; y: number; width: number; height: number };
}

// Mock Data
const mockProjects: CollaborationProject[] = [
  {
    id: '1',
    title: 'Mural de Lisboa',
    description: 'Um projeto colaborativo para criar um mural digital representando os principais pontos turísticos de Lisboa.',
    status: 'active',
    visibility: 'public',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    owner: {
      id: 'user1',
      name: 'PixelMaster',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user1',
        name: 'PixelMaster',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'owner',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        contributions: 156,
        isOnline: true
      },
      {
        id: 'user2',
        name: 'ArtistaPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'admin',
        joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        contributions: 98,
        isOnline: false
      },
      {
        id: 'user3',
        name: 'ColorMaster',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor',
        joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        contributions: 72,
        isOnline: true
      },
      {
        id: 'user4',
        name: 'DesignerPro',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor',
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        contributions: 45,
        isOnline: false
      }
    ],
    activities: [
      {
        id: 'a1',
        type: 'edit',
        user: {
          id: 'user3',
          name: 'ColorMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'Editou a seção do Castelo de São Jorge',
        pixelCoordinates: { x: 245, y: 156 }
      },
      {
        id: 'a2',
        type: 'comment',
        user: {
          id: 'user2',
          name: 'ArtistaPT',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        details: 'Comentou sobre as cores utilizadas na Torre de Belém'
      },
      {
        id: 'a3',
        type: 'milestone',
        user: {
          id: 'user1',
          name: 'PixelMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        details: 'Concluiu o marco "Esboço Inicial Completo"'
      }
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Esboço Inicial',
        description: 'Criar o esboço básico do mural com os principais pontos turísticos',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        assignees: ['user1', 'user2']
      },
      {
        id: 'm2',
        title: 'Coloração Base',
        description: 'Aplicar as cores base em todos os elementos do mural',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        assignees: ['user3', 'user4']
      },
      {
        id: 'm3',
        title: 'Detalhes e Acabamentos',
        description: 'Adicionar detalhes, sombras e acabamentos finais',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        assignees: ['user1', 'user2', 'user3', 'user4']
      }
    ],
    comments: [
      {
        id: 'c1',
        content: 'Estou adorando como o projeto está ficando! As cores da Torre de Belém estão incríveis.',
        user: {
          id: 'user2',
          name: 'ArtistaPT',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 3,
        hasLiked: true
      },
      {
        id: 'c2',
        content: 'Obrigado! Estou pensando em adicionar mais detalhes ao Castelo de São Jorge. O que acham?',
        user: {
          id: 'user3',
          name: 'ColorMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 2,
        hasLiked: false
      },
      {
        id: 'c3',
        content: 'Ótima ideia! Podemos usar tons mais escuros para dar profundidade às muralhas.',
        user: {
          id: 'user1',
          name: 'PixelMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likes: 1,
        hasLiked: false
      }
    ],
    pixelCount: 500,
    completedPixels: 325,
    tags: ['lisboa', 'turismo', 'monumentos', 'colaborativo'],
    coverImage: 'https://placehold.co/300x200.png',
    dataAiHint: 'project cover',
    region: 'Lisboa',
    coordinates: { x: 240, y: 150, width: 20, height: 15 }
  },
  {
    id: '2',
    title: 'Porto Vínico',
    description: 'Projeto colaborativo para retratar as vinhas e caves do vinho do Porto na região do Douro.',
    status: 'planning',
    visibility: 'invite-only',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    owner: {
      id: 'user5',
      name: 'DouroArtist',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user5',
        name: 'DouroArtist',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'owner',
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        contributions: 45,
        isOnline: false
      },
      {
        id: 'user1',
        name: 'PixelMaster',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor',
        joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        contributions: 12,
        isOnline: true
      }
    ],
    activities: [
      {
        id: 'a4',
        type: 'join',
        user: {
          id: 'user1',
          name: 'PixelMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        details: 'Juntou-se ao projeto'
      },
      {
        id: 'a5',
        type: 'comment',
        user: {
          id: 'user5',
          name: 'DouroArtist',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        details: 'Comentou sobre o plano inicial'
      }
    ],
    milestones: [
      {
        id: 'm4',
        title: 'Planejamento Completo',
        description: 'Definir o escopo, estilo e divisão de tarefas',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        assignees: ['user5', 'user1']
      }
    ],
    comments: [
      {
        id: 'c4',
        content: 'Estou pensando em focar nas vinhas em terraços do Douro como elemento central. O que acham?',
        user: {
          id: 'user5',
          name: 'DouroArtist',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        likes: 1,
        hasLiked: true
      },
      {
        id: 'c5',
        content: 'Excelente ideia! Podemos usar tons de verde e marrom para representar as vinhas, com o rio Douro em azul vibrante como contraste.',
        user: {
          id: 'user1',
          name: 'PixelMaster',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        likes: 1,
        hasLiked: false
      }
    ],
    pixelCount: 300,
    completedPixels: 0,
    tags: ['porto', 'vinho', 'douro', 'vinhas'],
    coverImage: 'https://placehold.co/300x200.png',
    dataAiHint: 'project cover',
    region: 'Porto',
    coordinates: { x: 120, y: 85, width: 15, height: 10 }
  },
  {
    id: '3',
    title: 'Algarve Costeiro',
    description: 'Representação colaborativa das praias e falésias do Algarve em pixel art.',
    status: 'completed',
    visibility: 'public',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    owner: {
      id: 'user6',
      name: 'BeachArtist',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user6',
        name: 'BeachArtist',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'owner',
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        contributions: 210,
        isOnline: false
      },
      {
        id: 'user7',
        name: 'OceanLover',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'admin',
        joinedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        contributions: 185,
        isOnline: false
      },
      {
        id: 'user8',
        name: 'SunsetPixel',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor',
        joinedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        contributions: 150,
        isOnline: true
      }
    ],
    activities: [
      {
        id: 'a6',
        type: 'milestone',
        user: {
          id: 'user6',
          name: 'BeachArtist',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        details: 'Concluiu o projeto "Algarve Costeiro"'
      }
    ],
    milestones: [
      {
        id: 'm5',
        title: 'Projeto Completo',
        description: 'Finalização de todos os elementos do projeto',
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        isCompleted: true,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        assignees: ['user6', 'user7', 'user8']
      }
    ],
    comments: [
      {
        id: 'c6',
        content: 'Projeto concluído com sucesso! Obrigado a todos pela colaboração incrível.',
        user: {
          id: 'user6',
          name: 'BeachArtist',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar'
        },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        likes: 5,
        hasLiked: false
      }
    ],
    pixelCount: 400,
    completedPixels: 400,
    tags: ['algarve', 'praias', 'falésias', 'mar'],
    coverImage: 'https://placehold.co/300x200.png',
    dataAiHint: 'project cover',
    region: 'Algarve',
    coordinates: { x: 345, y: 450, width: 18, height: 12 }
  }
];

// Helper Components
const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Ativo</Badge>;
    case 'completed':
      return <Badge className="bg-blue-500">Concluído</Badge>;
    case 'planning':
      return <Badge className="bg-yellow-500">Planejamento</Badge>;
    case 'paused':
      return <Badge className="bg-gray-500">Pausado</Badge>;
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

const VisibilityBadge = ({ visibility }: { visibility: ProjectVisibility }) => {
  switch (visibility) {
    case 'public':
      return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Público</Badge>;
    case 'private':
      return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10">Privado</Badge>;
    case 'invite-only':
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10">Apenas Convite</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const RoleBadge = ({ role }: { role: MemberRole }) => {
  switch (role) {
    case 'owner':
      return <Badge className="bg-amber-500">Proprietário</Badge>;
    case 'admin':
      return <Badge className="bg-purple-500">Administrador</Badge>;
    case 'editor':
      return <Badge className="bg-blue-500">Editor</Badge>;
    case 'viewer':
      return <Badge className="bg-gray-500">Visualizador</Badge>;
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case 'join':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'leave':
      return <X className="h-4 w-4 text-red-500" />;
    case 'edit':
      return <Edit className="h-4 w-4 text-blue-500" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'milestone':
      return <CheckCircle className="h-4 w-4 text-yellow-500" />;
    case 'invite':
      return <Mail className="h-4 w-4 text-orange-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

interface PixelCollaborationSystemProps {
  children: React.ReactNode;
}

export default function PixelCollaborationSystem({ children }: PixelCollaborationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<CollaborationProject[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);
  const [projectTab, setProjectTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'progress'>('recent');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#D4A757');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectRegion, setNewProjectRegion] = useState('');
  const [newProjectVisibility, setNewProjectVisibility] = useState<ProjectVisibility>('public');
  const { toast } = useToast();
  const { addCredits, addXp } = useUserStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'popular':
        return b.members.length - a.members.length;
      case 'progress':
        return (b.completedPixels / b.pixelCount) - (a.completedPixels / a.pixelCount);
      default:
        return 0;
    }
  });

  useEffect(() => {
    if (selectedProject && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a simple pixel art representation
        const pixelSize = 10;
        const colors = ['#D4A757', '#7DF9FF', '#FF6B6B', '#4CAF50', '#9C27B0'];
        
        for (let y = 0; y < canvas.height / pixelSize; y++) {
          for (let x = 0; x < canvas.width / pixelSize; x++) {
            if (Math.random() > 0.7) {
              ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
              ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      }
    }
  }, [selectedProject]);

  const handleAddComment = () => {
    if (!selectedProject || !newComment.trim()) return;
    
    const updatedProject = {
      ...selectedProject,
      comments: [
        {
          id: Date.now().toString(),
          content: newComment,
          user: {
            id: 'currentUser',
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar'
          },
          timestamp: new Date(),
          likes: 0,
          hasLiked: false
        },
        ...selectedProject.comments
      ],
      activities: [
        {
          id: Date.now().toString(),
          type: 'comment',
          user: {
            id: 'currentUser',
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar'
          },
          timestamp: new Date(),
          details: 'Adicionou um comentário'
        },
        ...selectedProject.activities
      ]
    };
    
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    setNewComment('');
    
    // Reward user
    addCredits(5);
    addXp(2);
    
    toast({
      title: "Comentário Adicionado",
      description: "Seu comentário foi adicionado com sucesso. Recebeu 5 créditos.",
    });
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedProject) return;
    
    const updatedComments = selectedProject.comments.map(comment => {
      if (comment.id === commentId) {
        const newLikes = comment.hasLiked ? comment.likes - 1 : comment.likes + 1;
        return { ...comment, likes: newLikes, hasLiked: !comment.hasLiked };
      }
      return comment;
    });
    
    const updatedProject = {
      ...selectedProject,
      comments: updatedComments
    };
    
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const handleCompleteMilestone = (milestoneId: string) => {
    if (!selectedProject) return;
    
    const updatedMilestones = selectedProject.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return { 
          ...milestone, 
          isCompleted: true,
          completedAt: new Date()
        };
      }
      return milestone;
    });
    
    const updatedProject = {
      ...selectedProject,
      milestones: updatedMilestones,
      activities: [
        {
          id: Date.now().toString(),
          type: 'milestone',
          user: {
            id: 'currentUser',
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar'
          },
          timestamp: new Date(),
          details: `Concluiu o marco "${selectedProject.milestones.find(m => m.id === milestoneId)?.title}"`
        },
        ...selectedProject.activities
      ]
    };
    
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Reward user
    addCredits(50);
    addXp(25);
    
    toast({
      title: "Marco Concluído!",
      description: "Parabéns! Você concluiu um marco importante e recebeu 50 créditos.",
    });
  };

  const handleJoinProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Check if user is already a member
    if (project.members.some(m => m.id === 'currentUser')) {
      toast({
        title: "Já é Membro",
        description: "Você já é membro deste projeto.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedProject = {
      ...project,
      members: [
        ...project.members,
        {
          id: 'currentUser',
          name: 'Você',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          role: 'editor',
          joinedAt: new Date(),
          contributions: 0,
          isOnline: true
        }
      ],
      activities: [
        {
          id: Date.now().toString(),
          type: 'join',
          user: {
            id: 'currentUser',
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar'
          },
          timestamp: new Date(),
          details: 'Juntou-se ao projeto'
        },
        ...project.activities
      ]
    };
    
    setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Reward user
    addCredits(10);
    addXp(5);
    
    toast({
      title: "Projeto Ingressado",
      description: "Você agora é membro do projeto. Recebeu 10 créditos.",
    });
  };

  const handleCreateProject = () => {
    if (!newProjectTitle.trim() || !newProjectDescription.trim() || !newProjectRegion.trim()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const newProject: CollaborationProject = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDescription,
      status: 'planning',
      visibility: newProjectVisibility,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: 'currentUser',
        name: 'Você',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar'
      },
      members: [
        {
          id: 'currentUser',
          name: 'Você',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          role: 'owner',
          joinedAt: new Date(),
          contributions: 0,
          isOnline: true
        }
      ],
      activities: [
        {
          id: Date.now().toString(),
          type: 'join',
          user: {
            id: 'currentUser',
            name: 'Você',
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'user avatar'
          },
          timestamp: new Date(),
          details: 'Criou o projeto'
        }
      ],
      milestones: [],
      comments: [],
      pixelCount: 200,
      completedPixels: 0,
      tags: newProjectDescription.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [],
      coverImage: 'https://placehold.co/300x200.png',
      dataAiHint: 'project cover',
      region: newProjectRegion,
      coordinates: { x: 100, y: 100, width: 10, height: 10 }
    };
    
    setProjects([newProject, ...projects]);
    
    // Reset form
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectRegion('');
    setNewProjectVisibility('public');
    setShowCreateProject(false);
    
    // Show success message
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    // Reward user
    addCredits(100);
    addXp(50);
    
    toast({
      title: "Projeto Criado",
      description: "Seu novo projeto foi criado com sucesso! Recebeu 100 créditos.",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
    } else if (diffHour > 0) {
      return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`;
    } else if (diffMin > 0) {
      return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
    } else {
      return 'Agora mesmo';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
        <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
        
        <DialogHeader className="p-6 border-b bg-gradient-to-br from-card via-card/95 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-shimmer" 
               style={{ backgroundSize: '200% 200%' }} />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <DialogTitle className="font-headline text-2xl text-gradient-gold flex items-center">
                  <Users className="h-6 w-6 mr-3 animate-glow" />
                  Projetos Colaborativos
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-2">
                  Crie e participe de projetos de pixel art em colaboração com outros artistas
                </DialogDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => {
                    setSelectedProject(null);
                    setShowCreateProject(true);
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {showCreateProject ? (
          <div className="flex flex-col h-[calc(95vh-80px)]">
            <div className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setShowCreateProject(false)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                  <CardTitle className="text-xl mt-4">
                    Criar Novo Projeto Colaborativo
                  </CardTitle>
                  <CardDescription>
                    Defina os detalhes do seu novo projeto de pixel art colaborativo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-title">Título do Projeto <span className="text-red-500">*</span></Label>
                      <Input 
                        id="project-title" 
                        placeholder="Ex: Mural de Lisboa" 
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Descrição <span className="text-red-500">*</span></Label>
                      <Textarea 
                        id="project-description" 
                        placeholder="Descreva o seu projeto em detalhes. Use #tags para categorizar (ex: #lisboa #turismo)" 
                        rows={4}
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Dica: Use #tags no seu texto para categorizar o projeto (ex: #lisboa #turismo)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project-region">Região <span className="text-red-500">*</span></Label>
                      <Select value={newProjectRegion} onValueChange={setNewProjectRegion}>
                        <SelectTrigger id="project-region">
                          <SelectValue placeholder="Selecione uma região" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lisboa">Lisboa</SelectItem>
                          <SelectItem value="Porto">Porto</SelectItem>
                          <SelectItem value="Algarve">Algarve</SelectItem>
                          <SelectItem value="Coimbra">Coimbra</SelectItem>
                          <SelectItem value="Braga">Braga</SelectItem>
                          <SelectItem value="Madeira">Madeira</SelectItem>
                          <SelectItem value="Açores">Açores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project-visibility">Visibilidade</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                          type="button"
                          variant={newProjectVisibility === 'public' ? 'default' : 'outline'}
                          className="justify-start h-auto py-3"
                          onClick={() => setNewProjectVisibility('public')}
                        >
                          <div className="p-2 rounded-full bg-green-500/20 mr-3">
                            <Globe className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Público</p>
                            <p className="text-xs text-muted-foreground">Visível para todos</p>
                          </div>
                        </Button>
                        
                        <Button
                          type="button"
                          variant={newProjectVisibility === 'private' ? 'default' : 'outline'}
                          className="justify-start h-auto py-3"
                          onClick={() => setNewProjectVisibility('private')}
                        >
                          <div className="p-2 rounded-full bg-red-500/20 mr-3">
                            <Lock className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Privado</p>
                            <p className="text-xs text-muted-foreground">Apenas membros</p>
                          </div>
                        </Button>
                        
                        <Button
                          type="button"
                          variant={newProjectVisibility === 'invite-only' ? 'default' : 'outline'}
                          className="justify-start h-auto py-3"
                          onClick={() => setNewProjectVisibility('invite-only')}
                        >
                          <div className="p-2 rounded-full bg-yellow-500/20 mr-3">
                            <UserPlus className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">Apenas Convite</p>
                            <p className="text-xs text-muted-foreground">Por convite</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project-cover">Imagem de Capa (opcional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                        <Input
                          id="project-cover"
                          type="file"
                          className="hidden"
                        />
                        <Label htmlFor="project-cover" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Arraste uma imagem ou clique para selecionar
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG ou GIF até 2MB
                          </p>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Configurações Adicionais</Label>
                      <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Definir Data de Conclusão</span>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Notificações de Atividade</span>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Aprovação para Novos Membros</span>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    Dicas para Projetos Colaborativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                      <h3 className="font-semibold flex items-center mb-2">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        Defina Objetivos Claros
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Estabeleça metas claras e divida o projeto em marcos alcançáveis para manter todos alinhados.
                      </p>
                    </div>
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                      <h3 className="font-semibold flex items-center mb-2">
                        <Users className="h-4 w-4 mr-2 text-green-500" />
                        Comunique-se Regularmente
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Mantenha uma comunicação aberta com todos os membros do projeto através de comentários e atualizações.
                      </p>
                    </div>
                    <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                      <h3 className="font-semibold flex items-center mb-2">
                        <Palette className="h-4 w-4 mr-2 text-purple-500" />
                        Estabeleça um Estilo Consistente
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Defina uma paleta de cores e estilo visual consistente para garantir um resultado final harmonioso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : selectedProject ? (
          <div className="flex flex-col h-[calc(95vh-80px)]">
            <div className="border-b">
              <div className="p-4 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Projetos
                </Button>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedProject.status} />
                  <VisibilityBadge visibility={selectedProject.visibility} />
                </div>
              </div>
              
              <div className="px-6 pb-4">
                <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedProject.region}</span>
                  <span>•</span>
                  <span>({selectedProject.coordinates.x}, {selectedProject.coordinates.y})</span>
                  <span>•</span>
                  <span>Atualizado {formatTimeAgo(selectedProject.updatedAt)}</span>
                </div>
              </div>
              
              <Tabs value={projectTab} onValueChange={setProjectTab}>
                <TabsList className="px-6 bg-transparent justify-start border-b rounded-none gap-2">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                    <Eye className="h-4 w-4 mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="canvas" className="data-[state=active]:bg-primary/10">
                    <Palette className="h-4 w-4 mr-2" />
                    Canvas
                  </TabsTrigger>
                  <TabsTrigger value="members" className="data-[state=active]:bg-primary/10">
                    <Users className="h-4 w-4 mr-2" />
                    Membros
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-primary/10">
                    <Activity className="h-4 w-4 mr-2" />
                    Atividade
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Info className="h-5 w-5 mr-2 text-primary" />
                            Sobre o Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-line">{selectedProject.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {selectedProject.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Membros</span>
                              </div>
                              <span className="font-medium">{selectedProject.members.length}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Criado em</span>
                              </div>
                              <span className="font-medium">{formatDate(selectedProject.createdAt)}</span>
                            </div>
                            
                            {selectedProject.dueDate && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Data de Conclusão</span>
                                </div>
                                <span className="font-medium">{formatDate(selectedProject.dueDate)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Região</span>
                              </div>
                              <span className="font-medium">{selectedProject.region}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Progress */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary" />
                            Progresso do Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progresso Geral</span>
                                <span className="font-medium">{Math.round((selectedProject.completedPixels / selectedProject.pixelCount) * 100)}%</span>
                              </div>
                              <Progress value={(selectedProject.completedPixels / selectedProject.pixelCount) * 100} className="h-2" />
                            </div>
                            
                            <div className="p-4 bg-muted/20 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">Estatísticas</h3>
                                <Badge variant="outline" className="text-xs">
                                  {selectedProject.completedPixels}/{selectedProject.pixelCount} pixels
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                  <p className="text-2xl font-bold text-primary">{selectedProject.members.length}</p>
                                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-green-500">{selectedProject.completedPixels}</p>
                                  <p className="text-xs text-muted-foreground">Pixels Concluídos</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-blue-500">{selectedProject.comments.length}</p>
                                  <p className="text-xs text-muted-foreground">Comentários</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-yellow-500">
                                    {selectedProject.milestones.filter(m => m.isCompleted).length}/{selectedProject.milestones.length}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Marcos Concluídos</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Milestones */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Flag className="h-5 w-5 mr-2 text-primary" />
                            Marcos do Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedProject.milestones.length > 0 ? (
                              selectedProject.milestones.map((milestone) => (
                                <div 
                                  key={milestone.id} 
                                  className={cn(
                                    "p-4 rounded-lg border",
                                    milestone.isCompleted 
                                      ? "bg-green-500/10 border-green-500/30" 
                                      : "bg-muted/20 border-border"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className={cn(
                                        "p-2 rounded-full",
                                        milestone.isCompleted 
                                          ? "bg-green-500/20" 
                                          : "bg-muted/30"
                                      )}>
                                        {milestone.isCompleted ? (
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <Clock className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div>
                                        <h3 className="font-medium">{milestone.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                                        
                                        <div className="flex items-center gap-3 mt-3">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                              {milestone.isCompleted 
                                                ? `Concluído em ${formatDate(milestone.completedAt!)}` 
                                                : `Prazo: ${formatDate(milestone.dueDate)}`}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                              {milestone.assignees.length} responsáveis
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {!milestone.isCompleted && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleCompleteMilestone(milestone.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Concluir
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6">
                                <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Nenhum marco definido para este projeto.</p>
                                <Button variant="outline" className="mt-4">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Marco
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Project Preview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-primary" />
                            Prévia do Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                            {selectedProject.coverImage ? (
                              <img 
                                src={selectedProject.coverImage} 
                                alt={selectedProject.title}
                                className="w-full h-full object-cover"
                                data-ai-hint={selectedProject.dataAiHint}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Image className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            
                            <div className="absolute bottom-2 right-2">
                              <Button size="sm" variant="secondary" className="h-8">
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Ampliar
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartilhar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Team Members */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary" />
                            Equipe
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedProject.members.slice(0, 5).map((member) => (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar>
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                      <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    {member.isOnline && (
                                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <div className="flex items-center gap-2">
                                      <RoleBadge role={member.role} />
                                      <span className="text-xs text-muted-foreground">{member.contributions} contribuições</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {selectedProject.members.length > 5 && (
                              <Button variant="ghost" className="w-full text-xs">
                                Ver todos os {selectedProject.members.length} membros
                              </Button>
                            )}
                            
                            <Button variant="outline" className="w-full mt-2">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Convidar Membros
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Recent Activity */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary" />
                            Atividade Recente
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedProject.activities.slice(0, 5).map((activity) => (
                              <div key={activity.id} className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-muted/30">
                                  <ActivityIcon type={activity.type} />
                                </div>
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">{activity.user.name}</span> {activity.details}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTimeAgo(activity.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {selectedProject.activities.length > 5 && (
                              <Button variant="ghost" className="w-full text-xs" onClick={() => setProjectTab('activity')}>
                                Ver toda a atividade
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Comentários
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" alt="Você" data-ai-hint="user avatar" />
                            <AvatarFallback>VC</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea 
                              placeholder="Adicione um comentário ao projeto..." 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                                <Send className="h-4 w-4 mr-2" />
                                Comentar
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {selectedProject.comments.length > 0 ? (
                          <div className="space-y-4">
                            {selectedProject.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar>
                                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} data-ai-hint={comment.user.dataAiHint} />
                                  <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.timestamp)}</span>
                                  </div>
                                  <p className="mt-1">{comment.content}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 text-xs"
                                      onClick={() => handleLikeComment(comment.id)}
                                    >
                                      <Heart className={cn(
                                        "h-4 w-4 mr-1",
                                        comment.hasLiked ? "fill-red-500 text-red-500" : ""
                                      )} />
                                      {comment.likes}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Responder
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="canvas" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Canvas */}
                    <div className="lg:col-span-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Palette className="h-5 w-5 mr-2 text-primary" />
                            Canvas do Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Undo className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Redo className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="border-2 border-border rounded-lg overflow-hidden">
                              <canvas 
                                ref={canvasRef} 
                                width={600} 
                                height={400} 
                                className="w-full h-full"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Coordenadas: ({selectedProject.coordinates.x}, {selectedProject.coordinates.y})
                              </span>
                              <span className="text-muted-foreground">
                                Dimensões: {selectedProject.coordinates.width}x{selectedProject.coordinates.height} pixels
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Tools */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Brush className="h-5 w-5 mr-2 text-primary" />
                            Ferramentas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2">
                              <Button 
                                variant={selectedTool === 'brush' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('brush')}
                              >
                                <Brush className="h-4 w-4 mb-1" />
                                <span className="text-xs">Pincel</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'eraser' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('eraser')}
                              >
                                <Eraser className="h-4 w-4 mb-1" />
                                <span className="text-xs">Borracha</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'pipette' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('pipette')}
                              >
                                <Pipette className="h-4 w-4 mb-1" />
                                <span className="text-xs">Conta-gotas</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'shape' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('shape')}
                              >
                                <Square className="h-4 w-4 mb-1" />
                                <span className="text-xs">Formas</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'text' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('text')}
                              >
                                <Type className="h-4 w-4 mb-1" />
                                <span className="text-xs">Texto</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'select' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('select')}
                              >
                                <Target className="h-4 w-4 mb-1" />
                                <span className="text-xs">Selecionar</span>
                              </Button>
                              <Button 
                                variant={selectedTool === 'move' ? 'default' : 'outline'} 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                                onClick={() => setSelectedTool('move')}
                              >
                                <Move className="h-4 w-4 mb-1" />
                                <span className="text-xs">Mover</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex flex-col items-center h-auto py-2 px-1"
                              >
                                <MoreHorizontal className="h-4 w-4 mb-1" />
                                <span className="text-xs">Mais</span>
                              </Button>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-xs">Cor</Label>
                                <div className="flex gap-2">
                                  <div className="w-8 h-8 rounded-md border border-border overflow-hidden">
                                    <input 
                                      type="color" 
                                      value={brushColor} 
                                      onChange={(e) => setBrushColor(e.target.value)} 
                                      className="w-10 h-10 transform -translate-x-1 -translate-y-1 cursor-pointer"
                                    />
                                  </div>
                                  <div className="flex-1 grid grid-cols-6 gap-1">
                                    {['#D4A757', '#7DF9FF', '#FF6B6B', '#4CAF50', '#9C27B0', '#2196F3', '#FF9800', '#795548', '#607D8B', '#E91E63', '#FFEB3B', '#000000'].map((color) => (
                                      <div 
                                        key={color} 
                                        className={cn(
                                          "w-full aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform",
                                          brushColor === color && "ring-2 ring-primary"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setBrushColor(color)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Tamanho do Pincel</Label>
                                  <span className="text-xs font-code">{brushSize}px</span>
                                </div>
                                <Slider
                                  value={[brushSize]}
                                  onValueChange={(value) => setBrushSize(value[0])}
                                  min={1}
                                  max={20}
                                  step={1}
                                />
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="space-y-2">
                              <Label className="text-xs">Camadas</Label>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm">Camada 1</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Lock className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Camada 2 (Ativa)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Unlock className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full text-xs">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Nova Camada
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary" />
                            Colaboradores Ativos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedProject.members.filter(m => m.isOnline).map((member) => (
                              <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar>
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                      <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">Editando agora</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            {selectedProject.members.filter(m => m.isOnline).length === 0 && (
                              <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground">Nenhum colaborador ativo no momento.</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg flex items-center">
                          <Users className="h-5 w-5 mr-2 text-primary" />
                          Membros do Projeto
                        </CardTitle>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Convidar Membros
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProject.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                  <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                {member.isOnline && (
                                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <div className="flex items-center gap-2">
                                  <RoleBadge role={member.role} />
                                  <span className="text-xs text-muted-foreground">
                                    Entrou em {formatDate(member.joinedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-medium">{member.contributions}</p>
                                <p className="text-xs text-muted-foreground">contribuições</p>
                              </div>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        Top Contribuidores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProject.members
                          .sort((a, b) => b.contributions - a.contributions)
                          .slice(0, 3)
                          .map((member, index) => (
                            <div key={member.id} className="flex items-center gap-3">
                              <div className="w-6 text-center">
                                {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                                {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                                {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                              </div>
                              <Avatar>
                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{member.name}</p>
                                <div className="flex items-center gap-2">
                                  <RoleBadge role={member.role} />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{member.contributions}</p>
                                <p className="text-xs text-muted-foreground">contribuições</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                        Dicas para Colaboração Eficaz
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                            Comunique-se Claramente
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Mantenha uma comunicação clara sobre suas intenções e alterações no projeto.
                          </p>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <Layers className="h-4 w-4 mr-2 text-purple-500" />
                            Use Camadas Corretamente
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Organize seu trabalho em camadas para facilitar a edição e colaboração.
                          </p>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-2 text-green-500" />
                            Respeite os Prazos
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Cumpra os prazos estabelecidos para os marcos do projeto.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        Histórico de Atividades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedProject.activities.reduce((acc: any, activity) => {
                          const date = new Date(activity.timestamp).toLocaleDateString('pt-PT');
                          if (!acc[date]) {
                            acc[date] = [];
                          }
                          acc[date].push(activity);
                          return acc;
                        }, {}).map((activities: any, date: string) => (
                          <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-medium">{date}</h3>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                            
                            <div className="space-y-4 ml-4 border-l-2 border-border pl-4">
                              {activities.map((activity: any) => (
                                <div key={activity.id} className="flex items-start gap-3 relative">
                                  <div className="absolute -left-6 w-2 h-2 rounded-full bg-primary" />
                                  <div className="p-2 rounded-full bg-muted/30">
                                    <ActivityIcon type={activity.type} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{activity.user.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(activity.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-sm mt-1">{activity.details}</p>
                                    {activity.pixelCoordinates && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>Coordenadas: ({activity.pixelCoordinates.x}, {activity.pixelCoordinates.y})</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-primary" />
                        Estatísticas de Atividade
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-muted/20 rounded-lg text-center">
                          <Edit className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedProject.activities.filter(a => a.type === 'edit').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Edições</p>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-lg text-center">
                          <MessageSquare className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedProject.activities.filter(a => a.type === 'comment').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Comentários</p>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-lg text-center">
                          <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedProject.activities.filter(a => a.type === 'milestone').length}
                          </p>
                          <p className="text-xs text-muted-foreground">Marcos Concluídos</p>
                        </div>
                      </div>
                      
                      <div className="h-60 bg-muted/20 rounded-lg flex items-center justify-center relative">
                        {/* Placeholder for activity chart */}
                        <div className="text-center text-muted-foreground">
                          <BarChart className="h-12 w-12 mx-auto mb-2" />
                          <p>Gráfico de Atividade</p>
                          <p className="text-sm mt-2">Visualização de atividade ao longo do tempo</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Configurações do Projeto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="project-title">Título do Projeto</Label>
                          <Input id="project-title" defaultValue={selectedProject.title} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-description">Descrição</Label>
                          <Textarea id="project-description" defaultValue={selectedProject.description} rows={4} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-visibility">Visibilidade</Label>
                          <Select defaultValue={selectedProject.visibility}>
                            <SelectTrigger id="project-visibility">
                              <SelectValue placeholder="Selecione a visibilidade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Público</SelectItem>
                              <SelectItem value="private">Privado</SelectItem>
                              <SelectItem value="invite-only">Apenas Convite</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-status">Status</Label>
                          <Select defaultValue={selectedProject.status}>
                            <SelectTrigger id="project-status">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">Planejamento</SelectItem>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="paused">Pausado</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-tags">Tags</Label>
                          <Input id="project-tags" defaultValue={selectedProject.tags.join(', ')} />
                          <p className="text-xs text-muted-foreground">
                            Separe as tags com vírgulas (ex: lisboa, turismo, monumentos)
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label>Permissões</Label>
                          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Edit className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Quem pode editar</span>
                              </div>
                              <Select defaultValue="editors">
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="owners">Apenas Proprietários</SelectItem>
                                  <SelectItem value="admins">Administradores</SelectItem>
                                  <SelectItem value="editors">Editores</SelectItem>
                                  <SelectItem value="all">Todos os Membros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Quem pode convidar</span>
                              </div>
                              <Select defaultValue="admins">
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="owners">Apenas Proprietários</SelectItem>
                                  <SelectItem value="admins">Administradores</SelectItem>
                                  <SelectItem value="all">Todos os Membros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Quem pode ver</span>
                              </div>
                              <Select defaultValue="all">
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="members">Apenas Membros</SelectItem>
                                  <SelectItem value="all">Todos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <Label>Ações Avançadas</Label>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                              <Download className="h-4 w-4 mr-2" />
                              Exportar Projeto
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar Projeto
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Arquivar Projeto
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline">
                        Cancelar
                      </Button>
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(95vh-80px)]">
            <TabsList className="px-6 pt-4 bg-transparent justify-start border-b rounded-none gap-2">
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary/10">
                <Grid className="h-4 w-4 mr-2" />
                Projetos
              </TabsTrigger>
              <TabsTrigger value="discover" className="data-[state=active]:bg-primary/10">
                <Compass className="h-4 w-4 mr-2" />
                Descobrir
              </TabsTrigger>
              <TabsTrigger value="my-projects" className="data-[state=active]:bg-primary/10">
                <User className="h-4 w-4 mr-2" />
                Meus Projetos
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="data-[state=active]:bg-primary/10">
                <BookOpen className="h-4 w-4 mr-2" />
                Tutoriais
              </TabsTrigger>
            </TabsList>
            
            <div className="px-6 py-4 border-b">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar projetos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="planning">Planejamento</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="paused">Pausados</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[130px]">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Mais Recentes</SelectItem>
                      <SelectItem value="popular">Mais Populares</SelectItem>
                      <SelectItem value="progress">Maior Progresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="projects" className="mt-0 space-y-6">
                  {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <motion.div whileHover={{ scale: 1.02 }} key={project.id}>
                          <Card 
                            className="cursor-pointer hover:shadow-lg transition-all duration-300"
                            onClick={() => setSelectedProject(project)}
                          >
                            <div className="aspect-video relative overflow-hidden">
                              {project.coverImage ? (
                                <img 
                                  src={project.coverImage} 
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  data-ai-hint={project.dataAiHint}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Image className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              
                              <div className="absolute top-2 right-2 flex gap-1">
                                <StatusBadge status={project.status} />
                              </div>
                              
                              <div className="absolute bottom-2 left-2">
                                <VisibilityBadge visibility={project.visibility} />
                              </div>
                            </div>
                            
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                              
                              <div className="flex items-center gap-2 mt-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={project.owner.avatar} alt={project.owner.name} data-ai-hint={project.owner.dataAiHint} />
                                  <AvatarFallback>{project.owner.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {project.owner.name} e {project.members.length - 1} outros
                                </span>
                              </div>
                              
                              <div className="mt-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progresso</span>
                                  <span>{Math.round((project.completedPixels / project.pixelCount) * 100)}%</span>
                                </div>
                                <Progress value={(project.completedPixels / project.pixelCount) * 100} className="h-1.5" />
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {project.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {project.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{project.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{project.region}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-between">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoinProject(project.id);
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Participar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProject(project);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detalhes
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Tente ajustar os seus filtros ou pesquisar por outros termos
                      </p>
                      <Button onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}>
                        Limpar Filtros
                      </Button>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="discover" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-primary" />
                        Projetos em Destaque
                      </CardTitle>
                      <CardDescription>
                        Projetos colaborativos populares para você explorar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {projects.slice(0, 3).map((project) => (
                          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedProject(project)}>
                            <div className="aspect-video relative overflow-hidden">
                              {project.coverImage ? (
                                <img 
                                  src={project.coverImage} 
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  data-ai-hint={project.dataAiHint}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Image className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              
                              <div className="absolute top-2 right-2">
                                <StatusBadge status={project.status} />
                              </div>
                            </div>
                            
                            <CardContent className="p-3">
                              <h3 className="font-medium text-sm">{project.title}</h3>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{project.members.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{project.region}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-primary" />
                          Projetos por Região
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['Lisboa', 'Porto', 'Algarve', 'Coimbra', 'Braga'].map((region) => {
                            const count = projects.filter(p => p.region === region).length;
                            return (
                              <div key={region} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{region}</span>
                                  <span className="font-medium">{count} projetos</span>
                                </div>
                                <Progress value={(count / projects.length) * 100} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Users className="h-5 w-5 mr-2 text-primary" />
                          Artistas em Destaque
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['PixelMaster', 'ArtistaPT', 'ColorMaster', 'BeachArtist', 'DouroArtist'].map((artist, index) => (
                            <div key={artist} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="https://placehold.co/40x40.png" alt={artist} data-ai-hint="user avatar" />
                                  <AvatarFallback>{artist.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{artist}</p>
                                  <p className="text-xs text-muted-foreground">{5 - index} projetos ativos</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Perfil
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Eventos Colaborativos
                      </CardTitle>
                      <CardDescription>
                        Participe de eventos especiais de criação colaborativa
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Calendar className="h-5 w-5 text-yellow-500" />
                              </div>
                              <div>
                                <h3 className="font-medium">Maratona de Pixel Art</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  48 horas de criação colaborativa com prêmios para os melhores projetos.
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>15-17 Abril, 2025</span>
                                </div>
                                <Button variant="outline" size="sm" className="mt-3 w-full">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Inscrever-se
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Users className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="font-medium">Workshop Colaborativo</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Aprenda técnicas avançadas de colaboração em pixel art com especialistas.
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>22 Março, 2025</span>
                                </div>
                                <Button variant="outline" size="sm" className="mt-3 w-full">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Inscrever-se
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="my-projects" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Meus Projetos
                      </CardTitle>
                      <CardDescription>
                        Projetos que você criou ou participa
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projects.filter(p => p.members.some(m => m.id === 'user1')).length > 0 ? (
                        <div className="space-y-4">
                          {projects.filter(p => p.members.some(m => m.id === 'user1')).map((project) => (
                            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedProject(project)}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    {project.coverImage ? (
                                      <img 
                                        src={project.coverImage} 
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                        data-ai-hint={project.dataAiHint}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Image className="h-8 w-8 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="font-medium">{project.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                                      </div>
                                      <StatusBadge status={project.status} />
                                    </div>
                                    
                                    <div className="mt-3 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Progresso</span>
                                        <span>{Math.round((project.completedPixels / project.pixelCount) * 100)}%</span>
                                      </div>
                                      <Progress value={(project.completedPixels / project.pixelCount) * 100} className="h-1.5" />
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                          {project.members.slice(0, 3).map((member) => (
                                            <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                              <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                          ))}
                                          {project.members.length > 3 && (
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                              +{project.members.length - 3}
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{project.members.length} membros</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Atualizado {formatTimeAgo(project.updatedAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                          <p className="text-muted-foreground mb-4">
                            Você ainda não participa de nenhum projeto colaborativo
                          </p>
                          <Button onClick={() => setShowCreateProject(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Novo Projeto
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        Minhas Contribuições
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <Edit className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">156</p>
                            <p className="text-xs text-muted-foreground">Edições</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <MessageSquare className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">42</p>
                            <p className="text-xs text-muted-foreground">Comentários</p>
                          </div>
                          <div className="p-4 bg-muted/20 rounded-lg text-center">
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold">8</p>
                            <p className="text-xs text-muted-foreground">Marcos Concluídos</p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <h3 className="font-medium mb-3">Estatísticas de Contribuição</h3>
                          <div className="h-40 bg-muted/30 rounded-lg flex items-center justify-center">
                            {/* Placeholder for contribution chart */}
                            <div className="text-center text-muted-foreground">
                              <BarChart className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">Gráfico de Contribuições</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Conquistas de Colaboração</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Você desbloqueou 3 de 10 conquistas relacionadas a projetos colaborativos.
                              </p>
                              <Button variant="outline" size="sm" className="mt-3">
                                <Award className="h-4 w-4 mr-2" />
                                Ver Conquistas
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tutorials" className="mt-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        Tutoriais de Colaboração
                      </CardTitle>
                      <CardDescription>
                        Aprenda a colaborar efetivamente em projetos de pixel art
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="cursor-pointer hover:shadow-md transition-all">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src="https://placehold.co/300x200.png" 
                              alt="Tutorial de Colaboração Básica"
                              className="w-full h-full object-cover"
                              data-ai-hint="tutorial thumbnail"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-primary">Básico</Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-medium">Introdução à Colaboração</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              Aprenda os fundamentos da colaboração em projetos de pixel art.
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">5 min</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-2" />
                                Assistir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-md transition-all">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src="https://placehold.co/300x200.png" 
                              alt="Tutorial de Ferramentas Colaborativas"
                              className="w-full h-full object-cover"
                              data-ai-hint="tutorial thumbnail"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-yellow-500">Intermediário</Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-medium">Ferramentas Colaborativas</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              Domine as ferramentas de edição colaborativa para trabalhar em equipe.
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">12 min</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-2" />
                                Assistir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="cursor-pointer hover:shadow-md transition-all">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src="https://placehold.co/300x200.png" 
                              alt="Tutorial de Gestão de Projetos"
                              className="w-full h-full object-cover"
                              data-ai-hint="tutorial thumbnail"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-red-500">Avançado</Badge>
                            </div>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-medium">Gestão de Projetos Colaborativos</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              Aprenda a gerenciar projetos complexos com múltiplos colaboradores.
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">20 min</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4 mr-2" />
                                Assistir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Button variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Ver Todos os Tutoriais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                        Melhores Práticas de Colaboração
                      </CardTitle>
                      <CardDescription>
                        Dicas para colaborar efetivamente em projetos de pixel art
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                            Comunicação Clara
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Mantenha uma comunicação clara e frequente com todos os membros do projeto.
                          </p>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <Layers className="h-4 w-4 mr-2 text-purple-500" />
                            Organização em Camadas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Use camadas para organizar o trabalho e facilitar a colaboração simultânea.
                          </p>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg shadow-inner">
                          <h3 className="font-semibold flex items-center mb-2">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Definição de Marcos
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Estabeleça marcos claros para acompanhar o progresso do projeto.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t border-primary/10 pt-4">
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Guia Completo
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component for the Grid icon since it's not in lucide-react by default
const Grid = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

// Component for the User icon since it's not in lucide-react by default
const User = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Component for the BookOpen icon since it's not in lucide-react by default
const BookOpen = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

// Component for the ArrowLeft icon since it's not in lucide-react by default
const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

// Component for the Activity icon since it's not in lucide-react by default
const Activity = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

// Component for the BarChart icon since it's not in lucide-react by default
const BarChart = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

// Component for the Mail icon since it's not in lucide-react by default
const Mail = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

// Component for the Globe icon since it's not in lucide-react by default
const Globe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

// Component for the MoreHorizontal icon since it's not in lucide-react by default
const MoreHorizontal = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

// Component for the MoreVertical icon since it's not in lucide-react by default
const MoreVertical = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

// Component for the Image icon since it's not in lucide-react by default
const Image = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

// Component for the Pipette icon since it's not in lucide-react by default
const Pipette = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 22l3-3"></path>
    <path d="M18 2l4 4"></path>
    <path d="M5 19l15-15"></path>
    <path d="M19 9l-4-4"></path>
    <path d="M9 19l-4-4"></path>
  </svg>
);

// Component for the Flag icon since it's not in lucide-react by default
const Flag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
);