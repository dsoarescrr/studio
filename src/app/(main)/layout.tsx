
import BottomNavBar from '@/components/layout/BottomNavBar';
import UserProfileHeader from '@/components/layout/UserProfileHeader'; // Added UserProfileHeader import

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden"> {/* Changed min-h-screen to h-full */}
      <UserProfileHeader /> {/* Added UserProfileHeader here */}
      <main className="flex-1 flex flex-col pt-16 pb-[var(--bottom-nav-height)]"> {/* Added pt-16 for UserProfileHeader */}
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
