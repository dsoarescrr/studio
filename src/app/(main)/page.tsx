// src/app/(main)/page.tsx
'use client';

import React from 'react';
import PixelGrid from '@/components/pixel-grid/PixelGrid';
import MapSidebar from '@/components/layout/MapSidebar';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <SidebarProvider>
      <div className="relative h-full w-full flex">
        <MapSidebar />
        <div className="flex-1 h-full">
          <PixelGrid />
        </div>
        <PerformanceMonitor />
      </div>
    </SidebarProvider>
  );
}
