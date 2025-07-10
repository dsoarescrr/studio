'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Users2, Plus, Calendar, Clock, Target, Brush, Layers, Palette, 
  MessageSquare, Share2, UserPlus, Settings, Trash2, Edit, Eye, 
  EyeOff, Lock, Unlock, Star, Award, Zap, ArrowRight, Check, 
  X, RefreshCw, Save, FileText, Upload, Download, Map, MapPin,
  Sparkles, Crown, Gem, Heart, Activity, BarChart3, TrendingUp,
  AlertTriangle, Info, HelpCircle, Lightbulb, Megaphone, Coins
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
  };
  members: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
    role: 'admin' | 'editor' | 'viewer';
  }[];
  pixelCount: number;
  region: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'planning';
  isPublic: boolean;
  tags: string[];
  coverImage?: string;
  dataAiHint?: string;
  isFeatured?: boolean;
  isJoined?: boolean;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar: string;
    dataAiHint?: string;
  };
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bandeira de Portugal Gigante',
    description: 'Projeto colaborativo para criar uma bandeira de Portugal gigante usando pixels no mapa. Precisamos de ajuda para completar as bordas e detalhes!',
    creator: {
      id: 'user1',
      name: 'PixelMasterPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user1',
        name: 'PixelMasterPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'admin'
      },
      {
        id: 'user2',
        name: 'ArtistaPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor'
      },
      {
        id: 'user3',
        name: 'ColorWizard',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor'
      },
      {
        id: 'user4',
        name: 'PixelCollector',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'viewer'
      },
      {
        id: 'user5',
        name: 'DesignerPRO',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor'
      }
    ],
    pixelCount: 250,
    region: 'Lisboa',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    progress: 65,
    status: 'active',
    isPublic: true,
    tags: ['bandeira', 'portugal', 'nacional', 'arte'],
    coverImage: 'https://placehold.co/400x200.png',
    dataAiHint: 'project cover',
    isFeatured: true,
    isJoined: true
  },
  {
    id: '2',
    name: 'Mapa Turístico do Porto',
    description: 'Criação de um mapa turístico interativo da cidade do Porto, destacando pontos turísticos através de pixels coloridos.',
    creator: {
      id: 'user3',
      name: 'ColorWizard',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user3',
        name: 'ColorWizard',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'admin'
      },
      {
        id: 'user6',
        name: 'TravelGuide',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor'
      }
    ],
    pixelCount: 120,
    region: 'Porto',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 30,
    status: 'active',
    isPublic: true,
    tags: ['porto', 'turismo', 'mapa', 'interativo'],
    isFeatured: false,
    isJoined: false
  },
  {
    id: '3',
    name: 'Pixel Art Histórica',
    description: 'Recriação de monumentos históricos portugueses em pixel art. Atualmente trabalhando no Mosteiro dos Jerónimos.',
    creator: {
      id: 'user2',
      name: 'ArtistaPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    members: [
      {
        id: 'user2',
        name: 'ArtistaPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'admin'
      },
      {
        id: 'user1',
        name: 'PixelMasterPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'editor'
      },
      {
        id: 'user7',
        name: 'HistoryBuff',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar',
        role: 'viewer'
      }
    ],
    pixelCount: 180,
    region: 'Lisboa',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    progress: 80,
    status: 'active',
    isPublic: true,
    tags: ['história', 'monumentos', 'arte', 'património'],
    coverImage: 'https://placehold.co/400x200.png',
    dataAiHint: 'project cover',
    isFeatured: true,
    isJoined: false
  }
];

const mockTasks: Task[] = [
  {
    id: 't1',
    projectId: '1',
    title: 'Completar o escudo central',
    description: 'Adicionar detalhes ao escudo central da bandeira portuguesa',
    assignee: {
      id: 'user2',
      name: 'ArtistaPT',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 't2',
    projectId: '1',
    title: 'Definir bordas verdes',
    description: 'Completar as bordas verdes da bandeira',
    assignee: {
      id: 'user3',
      name: 'ColorWizard',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 't3',
    projectId: '1',
    title: 'Adicionar detalhes à esfera armilar',
    description: 'Trabalhar nos detalhes finos da esfera armilar no centro da bandeira',
    status: 'todo',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 't4',
    projectId: '1',
    title: 'Revisar proporções gerais',
    description: 'Verificar se as proporções da bandeira estão de acordo com as especificações oficiais',
    assignee: {
      id: 'user5',
      name: 'DesignerPRO',
      avatar: 'https://placehold.co/40x40.png',
      dataAiHint: 'user avatar'
    },
    status: 'review',
    priority: 'medium',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  }
];

interface PixelCollaborationSystemProps {
  children: React.ReactNode;
}

export default function PixelCollaborationSystem({ children }: PixelCollaborationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState<'explore' | 'my-projects' | 'create'>('explore');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectView, setProjectView] = useState<'overview' | 'tasks' | 'members' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Project['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'progress'>('recent');
  const [showConfetti, setShowConfetti] = useState(false);
  const [playSuccessSound, setPlaySuccessSound] = useState(false);
  const { toast } = useToast();

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    region: 'Lisboa',
    isPublic: true,
    tags: '',
    deadline: ''
  });

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: ''
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'popular':
        return b.members.length - a.members.length;
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  const projectTasks = tasks.filter(task => 
    selectedProject && task.projectId === selectedProject.id
  );

  const handleCreateProject = () => {
    const newProjectObj: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      creator: {
        id: 'user1',
        name: 'PixelMasterPT',
        avatar: 'https://placehold.co/40x40.png',
        dataAiHint: 'user avatar'
      },
      members: [
        {
          id: 'user1',
          name: 'PixelMasterPT',
          avatar: 'https://placehold.co/40x40.png',
          dataAiHint: 'user avatar',
          role: 'admin'
        }
      ],
      pixelCount: 0,
      region: newProject.region,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: newProject.deadline ? new Date(newProject.deadline) : undefined,
      progress: 0,
      status: 'planning',
      isPublic: newProject.isPublic,
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isJoined: true
    };
    
    setProjects(prev => [newProjectObj, ...prev]);
    setSelectedProject(newProjectObj);
    setProjectView('overview');
    setActiveTab('my-projects');
    
    setNewProject({
      name: '',
      description: '',
      region: 'Lisboa',
      isPublic: true,
      tags: '',
      deadline: ''
    });
    
    setShowConfetti(true);
    setPlaySuccessSound(true);
    
    toast({
      title: "Projeto Criado!",
      description: "Seu novo projeto colaborativo foi criado com sucesso.",
    });
  };

  const handleCreateTask = () => {
    if (!selectedProject) return;
    
    const newTaskObj: Task = {
      id: `t${Date.now()}`,
      projectId: selectedProject.id,
      title: newTask.title,
      description: newTask.description,
      assignee: newTask.assigneeId ? selectedProject.members.find(m => m.id === newTask.assigneeId) : undefined,
      status: 'todo',
      priority: newTask.priority as Task['priority'],
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
    };
    
    setTasks(prev => [newTaskObj, ...prev]);
    
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: ''
    });
    
    toast({
      title: "Tarefa Adicionada",
      description: "Nova tarefa adicionada ao projeto.",
    });
  };

  const handleJoinProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            isJoined: true,
            members: [...project.members, {
              id: 'user1',
              name: 'PixelMasterPT',
              avatar: 'https://placehold.co/40x40.png',
              dataAiHint: 'user avatar',
              role: 'viewer'
            }]
          }
        : project
    ));
    
    setPlaySuccessSound(true);
    
    toast({
      title: "Projeto Ingressado!",
      description: "Você agora é membro deste projeto colaborativo.",
    });
  };

  const handleLeaveProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            isJoined: false,
            members: project.members.filter(member => member.id !== 'user1')
          }
        : project
    ));
    
    toast({
      title: "Projeto Abandonado",
      description: "Você saiu deste projeto colaborativo.",
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date() : undefined
          }
        : task
    ));
    
    if (newStatus === 'completed') {
      setPlaySuccessSound(true);
      
      toast({
        title: "Tarefa Concluída!",
        description: "Parabéns por completar esta tarefa.",
      });
    } else {
      toast({
        title: "Status Atualizado",
        description: `Tarefa movida para ${
          newStatus === 'todo' ? 'A Fazer' : 
          newStatus === 'in_progress' ? 'Em Progresso' : 
          newStatus === 'review' ? 'Em Revisão' : 'Concluído'
        }`,
      });
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'paused': return 'text-orange-500 bg-orange-500/10';
      case 'planning': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getTaskPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-muted-foreground bg-muted/20 border-muted/30';
    }
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'text-muted-foreground bg-muted/20';
      case 'in_progress': return 'text-blue-500 bg-blue-500/10';
      case 'review': return 'text-orange-500 bg-orange-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d atrás`;
    } else if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else {
      return `${diffMinutes}m atrás`;
    }
  };

  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <SoundEffect src={SOUND_EFFECTS.SUCCESS} play={playSuccessSound} onEnd={() => setPlaySuccessSound(false)} />
      <Confetti active={showConfetti} duration={3000} onComplete={() => setShowConfetti(false)} />
      
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-primary" />
                Projetos Colaborativos
                {selectedProject && (
                  <>
                    <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />
                    <span>{selectedProject.name}</span>
                  </>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProject 
                  ? 'Gerencie e colabore em projetos de pixel art com outros usuários'
                  : 'Crie ou participe de projetos colaborativos de pixel art'}
              </p>
            </div>
            
            {selectedProject && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedProject(null);
                  setActiveTab('explore');
                }}
              >
                Voltar aos Projetos
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(95vh-80px)]">
          {!selectedProject ? (
            <>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="explore">Explorar</TabsTrigger>
                    <TabsTrigger value="my-projects">Meus Projetos</TabsTrigger>
                    <TabsTrigger value="create">Criar Novo</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 max-h-[calc(95vh-160px)]">
                  <div className="p-4">
                    <TabsContent value="explore" className="mt-0 space-y-4">
                      {/* Search and Filters */}
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
                          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                            <SelectTrigger className="w-32">
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
                          
                          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recent">Recentes</SelectItem>
                              <SelectItem value="popular">Populares</SelectItem>
                              <SelectItem value="progress">Progresso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Featured Projects */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-500" />
                          Projetos em Destaque
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredProjects
                            .filter(project => project.isFeatured)
                            .map(project => (
                              <motion.div whileHover={{ scale: 1.02 }} key={project.id}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden" onClick={() => setSelectedProject(project)}>
                                  {project.coverImage && (
                                    <div className="relative h-32 w-full overflow-hidden">
                                      <img 
                                        src={project.coverImage} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        data-ai-hint={project.dataAiHint}
                                      />
                                      <div className="absolute top-2 right-2">
                                        <Badge className="bg-yellow-500 text-white">
                                          <Star className="h-3 w-3 mr-1" />
                                          Destaque
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-semibold">{project.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                                      </div>
                                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                                        {project.status === 'active' ? 'Ativo' : 
                                         project.status === 'completed' ? 'Concluído' : 
                                         project.status === 'paused' ? 'Pausado' : 'Planejamento'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progresso</span>
                                        <span className="font-medium">{project.progress}%</span>
                                      </div>
                                      <Progress value={project.progress} className="h-1.5" />
                                    </div>
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                      <div className="flex -space-x-2">
                                        {project.members.slice(0, 3).map(member => (
                                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                            <AvatarFallback className="text-[10px]">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {project.members.length > 3 && (
                                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                            +{project.members.length - 3}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{project.region}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 flex flex-wrap gap-1">
                                      {project.tags.slice(0, 3).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          #{tag}
                                        </Badge>
                                      ))}
                                      {project.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{project.tags.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                      <div className="text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Atualizado {formatTimeAgo(project.updatedAt)}
                                      </div>
                                      
                                      {project.isJoined ? (
                                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                          <Check className="h-3 w-3 mr-1" />
                                          Participando
                                        </Badge>
                                      ) : (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-xs h-7 px-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoinProject(project.id);
                                          }}
                                        >
                                          <UserPlus className="h-3 w-3 mr-1" />
                                          Participar
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* All Projects */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Users2 className="h-5 w-5 mr-2 text-primary" />
                          Todos os Projetos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredProjects
                            .filter(project => !project.isFeatured)
                            .map(project => (
                              <motion.div whileHover={{ scale: 1.02 }} key={project.id}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-semibold">{project.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                                      </div>
                                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                                        {project.status === 'active' ? 'Ativo' : 
                                         project.status === 'completed' ? 'Concluído' : 
                                         project.status === 'paused' ? 'Pausado' : 'Planejamento'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progresso</span>
                                        <span className="font-medium">{project.progress}%</span>
                                      </div>
                                      <Progress value={project.progress} className="h-1.5" />
                                    </div>
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                      <div className="flex -space-x-2">
                                        {project.members.slice(0, 3).map(member => (
                                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                            <AvatarFallback className="text-[10px]">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {project.members.length > 3 && (
                                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                            +{project.members.length - 3}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>{project.region}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                      <div className="text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Atualizado {formatTimeAgo(project.updatedAt)}
                                      </div>
                                      
                                      {project.isJoined ? (
                                        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                                          <Check className="h-3 w-3 mr-1" />
                                          Participando
                                        </Badge>
                                      ) : (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-xs h-7 px-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoinProject(project.id);
                                          }}
                                        >
                                          <UserPlus className="h-3 w-3 mr-1" />
                                          Participar
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="my-projects" className="mt-0 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Users2 className="h-5 w-5 mr-2 text-primary" />
                          Meus Projetos
                        </h3>
                        <Button size="sm" onClick={() => setActiveTab('create')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Projeto
                        </Button>
                      </div>

                      {filteredProjects
                        .filter(project => project.isJoined)
                        .length === 0 ? (
                        <Card className="p-8 text-center">
                          <Users2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                          <p className="text-muted-foreground mb-4">
                            Você ainda não participa de nenhum projeto colaborativo
                          </p>
                          <Button onClick={() => setActiveTab('explore')}>
                            Explorar Projetos
                          </Button>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredProjects
                            .filter(project => project.isJoined)
                            .map(project => (
                              <motion.div whileHover={{ scale: 1.02 }} key={project.id}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className="font-semibold">{project.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                                      </div>
                                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                                        {project.status === 'active' ? 'Ativo' : 
                                         project.status === 'completed' ? 'Concluído' : 
                                         project.status === 'paused' ? 'Pausado' : 'Planejamento'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Progresso</span>
                                        <span className="font-medium">{project.progress}%</span>
                                      </div>
                                      <Progress value={project.progress} className="h-1.5" />
                                    </div>
                                    
                                    {project.deadline && (
                                      <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Prazo
                                        </span>
                                        <Badge variant="outline" className={cn(
                                          "text-xs",
                                          getDaysRemaining(project.deadline)! < 0 
                                            ? "text-red-500 border-red-500/30" 
                                            : getDaysRemaining(project.deadline)! < 7
                                              ? "text-orange-500 border-orange-500/30"
                                              : "text-green-500 border-green-500/30"
                                        )}>
                                          {getDaysRemaining(project.deadline)! < 0 
                                            ? `Atrasado ${Math.abs(getDaysRemaining(project.deadline)!)}d` 
                                            : `${getDaysRemaining(project.deadline)}d restantes`}
                                        </Badge>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                      <div className="flex -space-x-2">
                                        {project.members.slice(0, 3).map(member => (
                                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                            <AvatarFallback className="text-[10px]">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {project.members.length > 3 && (
                                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                            +{project.members.length - 3}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Target className="h-3 w-3" />
                                        <span>{project.pixelCount} pixels</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                      <div className="text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Atualizado {formatTimeAgo(project.updatedAt)}
                                      </div>
                                      
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-xs h-7 px-2 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleLeaveProject(project.id);
                                        }}
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Sair
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="create" className="mt-0 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Plus className="h-5 w-5 mr-2 text-primary" />
                        Criar Novo Projeto
                      </h3>

                      <Card>
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-name">Nome do Projeto</Label>
                            <Input 
                              id="project-name" 
                              placeholder="Ex: Bandeira de Portugal Gigante" 
                              value={newProject.name}
                              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="project-description">Descrição</Label>
                            <Textarea 
                              id="project-description" 
                              placeholder="Descreva o objetivo do projeto e o que você pretende criar..." 
                              rows={3}
                              value={newProject.description}
                              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="project-region">Região</Label>
                              <Select 
                                value={newProject.region}
                                onValueChange={(value) => setNewProject(prev => ({ ...prev, region: value }))}
                              >
                                <SelectTrigger id="project-region">
                                  <SelectValue placeholder="Selecione a região" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Lisboa">Lisboa</SelectItem>
                                  <SelectItem value="Porto">Porto</SelectItem>
                                  <SelectItem value="Coimbra">Coimbra</SelectItem>
                                  <SelectItem value="Braga">Braga</SelectItem>
                                  <SelectItem value="Faro">Faro</SelectItem>
                                  <SelectItem value="Madeira">Madeira</SelectItem>
                                  <SelectItem value="Açores">Açores</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="project-deadline">Prazo (opcional)</Label>
                              <Input 
                                id="project-deadline" 
                                type="date" 
                                value={newProject.deadline}
                                onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="project-tags">Tags (separadas por vírgula)</Label>
                            <Input 
                              id="project-tags" 
                              placeholder="Ex: arte, bandeira, portugal, colaborativo" 
                              value={newProject.tags}
                              onChange={(e) => setNewProject(prev => ({ ...prev, tags: e.target.value }))}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="project-public" 
                              checked={newProject.isPublic}
                              onCheckedChange={(checked) => setNewProject(prev => ({ ...prev, isPublic: checked }))}
                            />
                            <Label htmlFor="project-public">Projeto Público</Label>
                          </div>
                          
                          <div className="pt-2">
                            <Button 
                              className="w-full" 
                              onClick={handleCreateProject}
                              disabled={!newProject.name || !newProject.description}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Projeto
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </>
          ) : (
            <>
              <Tabs value={projectView} onValueChange={(value) => setProjectView(value as any)} className="flex-1">
                <div className="border-b px-4 py-2">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                    <TabsTrigger value="members">Membros</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 max-h-[calc(95vh-160px)]">
                  <div className="p-4">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Project Header */}
                      <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {selectedProject.coverImage ? (
                              <div className="w-full md:w-1/3">
                                <img 
                                  src={selectedProject.coverImage} 
                                  alt={selectedProject.name} 
                                  className="w-full h-40 object-cover rounded-lg border border-border"
                                  data-ai-hint={selectedProject.dataAiHint}
                                />
                              </div>
                            ) : (
                              <div className="w-full md:w-1/3 h-40 bg-muted/30 rounded-lg border border-border flex items-center justify-center">
                                <Layers className="h-12 w-12 text-muted-foreground opacity-50" />
                              </div>
                            )}
                            
                            <div className="flex-1 space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                                  <Badge className={cn("text-xs", getStatusColor(selectedProject.status))}>
                                    {selectedProject.status === 'active' ? 'Ativo' : 
                                     selectedProject.status === 'completed' ? 'Concluído' : 
                                     selectedProject.status === 'paused' ? 'Pausado' : 'Planejamento'}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">{selectedProject.description}</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {selectedProject.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users2 className="h-4 w-4 text-blue-500" />
                                  <span>{selectedProject.members.length} membros</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-500" />
                                  <span>{selectedProject.pixelCount} pixels</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-red-500" />
                                  <span>{selectedProject.region}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-purple-500" />
                                  <span>Criado em {formatDate(selectedProject.createdAt)}</span>
                                </div>
                              </div>
                              
                              {selectedProject.deadline && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-orange-500" />
                                  <span>Prazo: {formatDate(selectedProject.deadline)}</span>
                                  <Badge className={cn(
                                    "text-xs",
                                    getDaysRemaining(selectedProject.deadline)! < 0 
                                      ? "bg-red-500 text-white" 
                                      : getDaysRemaining(selectedProject.deadline)! < 7
                                        ? "bg-orange-500 text-white"
                                        : "bg-green-500 text-white"
                                  )}>
                                    {getDaysRemaining(selectedProject.deadline)! < 0 
                                      ? `Atrasado ${Math.abs(getDaysRemaining(selectedProject.deadline)!)}d` 
                                      : `${getDaysRemaining(selectedProject.deadline)}d restantes`}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Progress Overview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary" />
                            Progresso do Projeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Progresso Geral</span>
                              <span className="text-sm font-bold">{selectedProject.progress}%</span>
                            </div>
                            <Progress value={selectedProject.progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-500">
                                  {projectTasks.filter(task => task.status === 'completed').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Tarefas Concluídas</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-500">
                                  {projectTasks.filter(task => task.status === 'in_progress').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Tarefas em Progresso</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/20">
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-orange-500">
                                  {projectTasks.filter(task => task.status === 'todo').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Tarefas Pendentes</div>
                              </CardContent>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Activity */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-primary" />
                            Atividade Recente
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm"><span className="font-medium">ColorWizard</span> completou a tarefa <span className="font-medium">Definir bordas verdes</span></p>
                                <p className="text-xs text-muted-foreground">2 horas atrás</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm"><span className="font-medium">ArtistaPT</span> começou a trabalhar na tarefa <span className="font-medium">Completar o escudo central</span></p>
                                <p className="text-xs text-muted-foreground">5 horas atrás</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm"><span className="font-medium">DesignerPRO</span> adicionou 15 novos pixels ao projeto</p>
                                <p className="text-xs text-muted-foreground">1 dia atrás</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="tasks" className="mt-0 space-y-6">
                      {/* Task Management */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Target className="h-5 w-5 mr-2 text-primary" />
                          Tarefas do Projeto
                        </h3>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Tarefa
                        </Button>
                      </div>

                      {/* Task Creation Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Criar Nova Tarefa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="task-title">Título da Tarefa</Label>
                            <Input 
                              id="task-title" 
                              placeholder="Ex: Completar o escudo central" 
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="task-description">Descrição (opcional)</Label>
                            <Textarea 
                              id="task-description" 
                              placeholder="Descreva os detalhes da tarefa..." 
                              rows={2}
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="task-priority">Prioridade</Label>
                              <Select 
                                value={newTask.priority}
                                onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                              >
                                <SelectTrigger id="task-priority">
                                  <SelectValue placeholder="Selecione a prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Baixa</SelectItem>
                                  <SelectItem value="medium">Média</SelectItem>
                                  <SelectItem value="high">Alta</SelectItem>
                                  <SelectItem value="urgent">Urgente</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="task-due-date">Data de Entrega (opcional)</Label>
                              <Input 
                                id="task-due-date" 
                                type="date" 
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="task-assignee">Responsável (opcional)</Label>
                            <Select 
                              value={newTask.assigneeId}
                              onValueChange={(value) => setNewTask(prev => ({ ...prev, assigneeId: value }))}
                            >
                              <SelectTrigger id="task-assignee">
                                <SelectValue placeholder="Selecione um membro" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Não atribuído</SelectItem>
                                {selectedProject.members.map(member => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button 
                            onClick={handleCreateTask}
                            disabled={!newTask.title}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Tarefa
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Task Lists */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* To Do */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <Target className="h-4 w-4 mr-2" />
                              A Fazer
                              <Badge className="ml-2 bg-muted text-muted-foreground">
                                {projectTasks.filter(task => task.status === 'todo').length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {projectTasks
                              .filter(task => task.status === 'todo')
                              .map(task => (
                                <motion.div whileHover={{ scale: 1.02 }} key={task.id}>
                                  <Card className="p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-sm font-medium">{task.title}</h4>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                        )}
                                      </div>
                                      <Badge className={cn("text-xs", getTaskPriorityColor(task.priority))}>
                                        {task.priority === 'urgent' ? 'Urgente' : 
                                         task.priority === 'high' ? 'Alta' : 
                                         task.priority === 'medium' ? 'Média' : 'Baixa'}
                                      </Badge>
                                    </div>
                                    
                                    {task.assignee && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint={task.assignee.dataAiHint} />
                                          <AvatarFallback className="text-[8px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{task.assignee.name}</span>
                                      </div>
                                    )}
                                    
                                    {task.dueDate && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className={cn(
                                          getDaysRemaining(task.dueDate)! < 0 
                                            ? "text-red-500" 
                                            : getDaysRemaining(task.dueDate)! < 3
                                              ? "text-orange-500"
                                              : "text-muted-foreground"
                                        )}>
                                          {formatDate(task.dueDate)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Iniciar
                                      </Button>
                                    </div>
                                  </Card>
                                </motion.div>
                              ))}
                              
                            {projectTasks.filter(task => task.status === 'todo').length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhuma tarefa pendente
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* In Progress */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <Play className="h-4 w-4 mr-2 text-blue-500" />
                              Em Progresso
                              <Badge className="ml-2 bg-blue-500 text-white">
                                {projectTasks.filter(task => task.status === 'in_progress').length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {projectTasks
                              .filter(task => task.status === 'in_progress')
                              .map(task => (
                                <motion.div whileHover={{ scale: 1.02 }} key={task.id}>
                                  <Card className="p-3 hover:shadow-md transition-shadow border-blue-500/30">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-sm font-medium">{task.title}</h4>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                        )}
                                      </div>
                                      <Badge className={cn("text-xs", getTaskPriorityColor(task.priority))}>
                                        {task.priority === 'urgent' ? 'Urgente' : 
                                         task.priority === 'high' ? 'Alta' : 
                                         task.priority === 'medium' ? 'Média' : 'Baixa'}
                                      </Badge>
                                    </div>
                                    
                                    {task.assignee && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint={task.assignee.dataAiHint} />
                                          <AvatarFallback className="text-[8px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{task.assignee.name}</span>
                                      </div>
                                    )}
                                    
                                    {task.dueDate && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className={cn(
                                          getDaysRemaining(task.dueDate)! < 0 
                                            ? "text-red-500" 
                                            : getDaysRemaining(task.dueDate)! < 3
                                              ? "text-orange-500"
                                              : "text-muted-foreground"
                                        )}>
                                          {formatDate(task.dueDate)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 pt-2 border-t border-border/50 flex justify-end gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'todo')}
                                      >
                                        <ArrowLeft className="h-3 w-3 mr-1" />
                                        Voltar
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'review')}
                                      >
                                        <CheckSquare className="h-3 w-3 mr-1" />
                                        Revisar
                                      </Button>
                                    </div>
                                  </Card>
                                </motion.div>
                              ))}
                              
                            {projectTasks.filter(task => task.status === 'in_progress').length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhuma tarefa em progresso
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Review */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <CheckSquare className="h-4 w-4 mr-2 text-orange-500" />
                              Em Revisão
                              <Badge className="ml-2 bg-orange-500 text-white">
                                {projectTasks.filter(task => task.status === 'review').length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {projectTasks
                              .filter(task => task.status === 'review')
                              .map(task => (
                                <motion.div whileHover={{ scale: 1.02 }} key={task.id}>
                                  <Card className="p-3 hover:shadow-md transition-shadow border-orange-500/30">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-sm font-medium">{task.title}</h4>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                        )}
                                      </div>
                                      <Badge className={cn("text-xs", getTaskPriorityColor(task.priority))}>
                                        {task.priority === 'urgent' ? 'Urgente' : 
                                         task.priority === 'high' ? 'Alta' : 
                                         task.priority === 'medium' ? 'Média' : 'Baixa'}
                                      </Badge>
                                    </div>
                                    
                                    {task.assignee && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint={task.assignee.dataAiHint} />
                                          <AvatarFallback className="text-[8px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{task.assignee.name}</span>
                                      </div>
                                    )}
                                    
                                    {task.dueDate && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className={cn(
                                          getDaysRemaining(task.dueDate)! < 0 
                                            ? "text-red-500" 
                                            : getDaysRemaining(task.dueDate)! < 3
                                              ? "text-orange-500"
                                              : "text-muted-foreground"
                                        )}>
                                          {formatDate(task.dueDate)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 pt-2 border-t border-border/50 flex justify-end gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                      >
                                        <ArrowLeft className="h-3 w-3 mr-1" />
                                        Voltar
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        Aprovar
                                      </Button>
                                    </div>
                                  </Card>
                                </motion.div>
                              ))}
                              
                            {projectTasks.filter(task => task.status === 'review').length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhuma tarefa em revisão
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Completed */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center">
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Concluídas
                              <Badge className="ml-2 bg-green-500 text-white">
                                {projectTasks.filter(task => task.status === 'completed').length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {projectTasks
                              .filter(task => task.status === 'completed')
                              .map(task => (
                                <motion.div whileHover={{ scale: 1.02 }} key={task.id}>
                                  <Card className="p-3 hover:shadow-md transition-shadow border-green-500/30">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-sm font-medium">{task.title}</h4>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                        )}
                                      </div>
                                      <Badge className={cn("text-xs", getTaskPriorityColor(task.priority))}>
                                        {task.priority === 'urgent' ? 'Urgente' : 
                                         task.priority === 'high' ? 'Alta' : 
                                         task.priority === 'medium' ? 'Média' : 'Baixa'}
                                      </Badge>
                                    </div>
                                    
                                    {task.assignee && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} data-ai-hint={task.assignee.dataAiHint} />
                                          <AvatarFallback className="text-[8px]">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">{task.assignee.name}</span>
                                      </div>
                                    )}
                                    
                                    {task.completedAt && (
                                      <div className="mt-2 flex items-center gap-2 text-xs">
                                        <Clock className="h-3 w-3 text-green-500" />
                                        <span className="text-green-500">Concluído em {formatDate(task.completedAt)}</span>
                                      </div>
                                    )}
                                    
                                    <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-xs h-7 px-2"
                                        onClick={() => handleUpdateTaskStatus(task.id, 'review')}
                                      >
                                        <ArrowLeft className="h-3 w-3 mr-1" />
                                        Reabrir
                                      </Button>
                                    </div>
                                  </Card>
                                </motion.div>
                              ))}
                              
                            {projectTasks.filter(task => task.status === 'completed').length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhuma tarefa concluída
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="members" className="mt-0 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Users2 className="h-5 w-5 mr-2 text-primary" />
                          Membros do Projeto
                        </h3>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Convidar
                        </Button>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Administradores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedProject.members
                              .filter(member => member.role === 'admin')
                              .map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">Administrador</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-primary text-primary-foreground">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Editores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedProject.members
                              .filter(member => member.role === 'editor')
                              .map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">Editor</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-blue-500 text-white">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Editor
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Visualizadores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedProject.members
                              .filter(member => member.role === 'viewer')
                              .map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">Visualizador</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-gray-500 text-white">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Visualizador
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0 space-y-6">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Configurações do Projeto
                      </h3>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="settings-name">Nome do Projeto</Label>
                            <Input id="settings-name" defaultValue={selectedProject.name} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="settings-description">Descrição</Label>
                            <Textarea id="settings-description" defaultValue={selectedProject.description} rows={3} />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="settings-region">Região</Label>
                              <Select defaultValue={selectedProject.region}>
                                <SelectTrigger id="settings-region">
                                  <SelectValue placeholder="Selecione a região" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Lisboa">Lisboa</SelectItem>
                                  <SelectItem value="Porto">Porto</SelectItem>
                                  <SelectItem value="Coimbra">Coimbra</SelectItem>
                                  <SelectItem value="Braga">Braga</SelectItem>
                                  <SelectItem value="Faro">Faro</SelectItem>
                                  <SelectItem value="Madeira">Madeira</SelectItem>
                                  <SelectItem value="Açores">Açores</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="settings-deadline">Prazo</Label>
                              <Input 
                                id="settings-deadline" 
                                type="date" 
                                defaultValue={selectedProject.deadline?.toISOString().split('T')[0]} 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="settings-tags">Tags (separadas por vírgula)</Label>
                            <Input id="settings-tags" defaultValue={selectedProject.tags.join(', ')} />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="settings-cover">Imagem de Capa</Label>
                            <div className="flex items-center gap-2">
                              <Input id="settings-cover" type="file" />
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Enviar
                              </Button>
                            </div>
                          </div>
                          
                          <Button className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Privacidade e Permissões</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Projeto Público</Label>
                              <p className="text-xs text-muted-foreground">Qualquer um pode ver este projeto</p>
                            </div>
                            <Switch defaultChecked={selectedProject.isPublic} />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Permitir Solicitações</Label>
                              <p className="text-xs text-muted-foreground">Usuários podem solicitar para participar</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Edição Restrita</Label>
                              <p className="text-xs text-muted-foreground">Apenas editores podem modificar pixels</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <Separator />
                          
                          <div className="pt-2">
                            <Button variant="destructive" className="w-full">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Projeto
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}