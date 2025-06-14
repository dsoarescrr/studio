
import UserProfileHeader from '@/components/layout/UserProfileHeader';
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MinimapPanel from '@/components/panels/MinimapPanel';

export default function HomePage() {
  return (
    <div className="relative flex-1 w-full h-full">
      <UserProfileHeader />
      <PixelGrid />
      <MinimapPanel />
      {/* Other floating panels can be added here */}
    </div>
  );
}
