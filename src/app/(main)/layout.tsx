
import BottomNavBar from '@/components/layout/BottomNavBar';
import UserProfileHeader from '@/components/layout/UserProfileHeader'; 

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full"> {/* Removed overflow-hidden from here */}
      <UserProfileHeader /> 
      <main className="flex-1 flex flex-col pt-16 pb-[var(--bottom-nav-height)] overflow-y-auto"> {/* overflow-y-auto allows individual page scroll */}
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
