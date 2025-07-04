
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import MapSidebar from '@/components/layout/MapSidebar';

export default function HomePage() {
  return (
    <SidebarProvider>
      <MapSidebar />
      <SidebarInset>
        <PixelGrid />
      </SidebarInset>
    </SidebarProvider>
  );
}
