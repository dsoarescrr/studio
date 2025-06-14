
import BottomNavBar from '@/components/layout/BottomNavBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col pb-[var(--bottom-nav-height)]"> {/* Add padding for bottom nav */}
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
