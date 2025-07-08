
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentIndex = navLinks.findIndex(link => link.href === pathname);
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [pathname]);

  return (
    <>
      <style jsx global>{`
        :root {
          --bottom-nav-height: ${BOTTOM_NAV_HEIGHT};
        }
      `}</style>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border/60 shadow-t-lg animate-slide-in-up"
        style={{ height: BOTTOM_NAV_HEIGHT }}
      >
        {/* Animated background indicator */}
        <div 
          className="absolute top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ease-out"
          style={{
            left: `${(activeIndex / navLinks.length) * 100}%`,
            width: `${100 / navLinks.length}%`
          }}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: '20%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto flex h-full items-center justify-around max-w-screen-md px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium p-2 rounded-md w-1/5 transition-all duration-300 relative group",
                  isActive 
                    ? "text-primary transform scale-110" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                )}
                onClick={() => setActiveIndex(index)}
              >
                {/* Icon with enhanced effects */}
                <div className="relative">
                  <link.icon className={cn(
                    "h-5 w-5 mb-0.5 transition-all duration-300",
                    isActive 
                      ? "text-primary animate-glow" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping" />
                  )}
                  
                  {/* Hover glow effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-full transition-opacity duration-300",
                    isActive 
                      ? "bg-primary/20 opacity-100" 
                      : "bg-primary/10 opacity-0 group-hover:opacity-100"
                  )} style={{ transform: 'scale(1.5)' }} />
                </div>
                
                {/* Label with gradient effect */}
                <span className={cn(
                  "transition-all duration-300 font-code",
                  isActive && "text-gradient-gold font-bold"
                )}>
                  {link.label}
                </span>
                
                {/* Ripple effect on click */}
                <div className="absolute inset-0 rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-md" />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
