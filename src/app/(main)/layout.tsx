
import BottomNavBar from '@/components/layout/BottomNavBar';
import UserProfileHeader from '@/components/layout/UserProfileHeader'; // Added UserProfileHeader import

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full"> {/* Removed overflow-hidden */}
      <UserProfileHeader /> {/* Added UserProfileHeader here */}
      <main className="flex-1 flex flex-col pt-16 pb-[var(--bottom-nav-height)] overflow-y-auto"> {/* Added overflow-y-auto */}
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
