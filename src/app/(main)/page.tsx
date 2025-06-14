
// Removed UserProfileHeader from here as it's now in MainLayout
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MinimapPanel from '@/components/panels/MinimapPanel';
import StatisticsPanel from '@/components/panels/StatisticsPanel'; // Added back StatisticsPanel
// import ActivityFeedPanel from '@/components/panels/ActivityFeedPanel'; // Removed ActivityFeedPanel import

export default function HomePage() {
  return (
    <div className="relative flex-1 w-full h-full">
      {/* UserProfileHeader is now in MainLayout.tsx */}
      <PixelGrid />
      <MinimapPanel />
      {/* <ActivityFeedPanel /> */} {/* Removed ActivityFeedPanel instance */}
      <StatisticsPanel /> {/* Added StatisticsPanel back */}
      {/* Other floating panels can be added here */}
    </div>
  );
}
