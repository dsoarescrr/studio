// src/app/(main)/page.tsx
'use client';

import React from 'react';
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MapSidebar from '@/components/layout/MapSidebar';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';

export default function HomePage() {
  return (
    <div className="relative h-full w-full flex">
      <MapSidebar />
      <div className="flex-1 h-full">
        <PixelGrid />
      </div>
      <PerformanceMonitor />
    </div>
  );
}
