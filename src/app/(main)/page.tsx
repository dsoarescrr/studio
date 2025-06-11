import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MinimapPanel from '@/components/panels/MinimapPanel';
import ActivityFeedPanel from '@/components/panels/ActivityFeedPanel';
import StatisticsPanel from '@/components/panels/StatisticsPanel';

export default function HomePage() {
  return (
    <div className="relative flex-1 w-full h-full">
      <PixelGrid />
      <MinimapPanel />
      <ActivityFeedPanel />
      <StatisticsPanel />
      {/* Other floating panels can be added here */}
    </div>
  );
}
