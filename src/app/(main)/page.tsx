
// Removed UserProfileHeader from here as it's now in MainLayout
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MinimapPanel from '@/components/panels/MinimapPanel';
// import StatisticsPanel from '@/components/panels/StatisticsPanel'; // Removed StatisticsPanel import
// import ActivityFeedPanel from '@/components/panels/ActivityFeedPanel'; // ActivityFeedPanel was already removed

export default function HomePage() {
  return (
    <div className="relative flex-1 w-full h-full overflow-hidden"> {/* Added overflow-hidden */}
      {/* UserProfileHeader is now in MainLayout.tsx */}
      <PixelGrid />
      <MinimapPanel />
      {/* <ActivityFeedPanel /> */} {/* ActivityFeedPanel instance was already removed */}
      {/* <StatisticsPanel /> */} {/* Removed StatisticsPanel instance */}
      {/* Other floating panels can be added here */}
    </div>
  );
}

