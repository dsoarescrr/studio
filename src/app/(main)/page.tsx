
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import MapSidebar from '@/components/layout/MapSidebar';

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapSidebar />
        <SidebarInset>
          <PixelGrid />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
