import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AppHeader() {
  const navLinks = [
    { href: "/", label: "Universo Pixel" },
    { href: "/member", label: "Área de Membro" },
    { href: "/achievements", label: "Conquistas" },
    { href: "/ranking", label: "Ranking" },
    { href: "/community", label: "Comunidade" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left Section: Desktop Navigation */}
        <div className="flex flex-1 items-center justify-start">
          <nav className="hidden md:flex gap-4">
            {navLinks.slice(0, 3).map(link => ( // Show fewer links on desktop header for space
              <Button key={link.label} variant="ghost" asChild>
                <Link href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Center Section: Logo */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold">Pixel Universe</span>
          </Link>
        </div>

        {/* Right Section: User Status & Mobile Menu Trigger */}
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          <UserStatus />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
              <SheetHeader className="mb-4">
                <SheetTitle className="font-headline text-primary">Navegação</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function UserStatus() {
  // Placeholder data
  const userName = "PixelMaster";
  const credits = 1250;
  const achievementsCount = 15;
  const rank = "#42";

  return (
    <div className="flex items-center gap-3 border-l border-border/40 pl-4 md:border-none md:pl-0"> {/* Adjusted border for cleaner look with new layout */}
       <div className="text-right hidden sm:block">
          <p className="text-xs font-code text-primary">{userName}</p>
          <p className="text-xs text-muted-foreground">Créditos: {credits}</p>
        </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/100x100.png" alt={userName} data-ai-hint="abstract avatar" />
              <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none font-headline">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {credits} créditos
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Conquistas: {achievementsCount}</DropdownMenuItem>
          <DropdownMenuItem>Ranking: {rank}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
       <span className="relative flex h-3 w-3 ml-[-15px] mt-[-15px] self-start"> {/* This notification dot might need slight repositioning based on UserStatus layout changes */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
    </div>
  );
}
