
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Trophy, BarChartHorizontalBig, Users } from 'lucide-react'; // Changed BarChart3 to BarChartHorizontalBig
import { cn } from '@/lib/utils';

const navLinks = [
  { href: "/", label: "Universo", icon: Home },
  { href: "/member", label: "Perfil", icon: User },
  { href: "/achievements", label: "Conquistas", icon: Trophy },
  { href: "/ranking", label: "Estatísticas", icon: BarChartHorizontalBig }, // Changed label and icon
  { href: "/community", label: "Comunidade", icon: Users },
];

// Define CSS variable for height, to be used in layout for padding
const BOTTOM_NAV_HEIGHT = '64px'; // Adjust as needed

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <>
      <style jsx global>{`
        :root {
          --bottom-nav-height: ${BOTTOM_NAV_HEIGHT};
        }
      `}</style>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 shadow-t-lg"
        style={{ height: BOTTOM_NAV_HEIGHT }}
      >
        <div className="container mx-auto flex h-full items-center justify-around max-w-screen-md px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium p-2 rounded-md w-1/5",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground transition-colors"
                )}
              >
                <link.icon className={cn("h-5 w-5 mb-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
