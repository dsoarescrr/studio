
'use client';

import React from 'react';
import { UserProfileDisplay, type UserProfileData } from '@/components/user/UserProfileDisplay';
import { achievementsData } from '@/data/achievements-data';
import { Twitter, Instagram, Github } from "lucide-react";

// Mock data for the user profile page
const mockUserData: UserProfileData = {
  id: 'user_pixel_master_pt',
  name: 'PixelMasterPT',
  username: '@pixelmaster_pt',
  avatarUrl: 'https://placehold.co/128x128.png',
  dataAiHint: 'profile avatar',
  level: 8,
  xp: 2450,
  xpMax: 3000,
  credits: 12500,
  specialCredits: 120,
  bio: 'Explorador do universo digital, pixel a pixel. A transformar o mapa de Portugal numa obra de arte colaborativa.',
  pixelsOwned: 42,
  achievementsUnlocked: 5,
  unlockedAchievementIds: [
    'pixel_initiate',
    'pixel_artisan',
    'color_master',
    'community_voice',
    'time_virtuoso',
  ],
  rank: 1, // Top 1
  location: 'Lisboa, Portugal',
  socials: [
    { platform: 'Twitter', handle: '@pixelmaster_pt', icon: <Twitter />, url: 'https://twitter.com' },
    { platform: 'Instagram', handle: 'pixel.master.pt', icon: <Instagram />, url: 'https://instagram.com' },
    { platform: 'GitHub', handle: 'PixelMasterPT', icon: <Github />, url: 'https://github.com' },
  ],
  albums: [
    {
      id: 'album1',
      name: 'Paisagens de Portugal',
      description: 'As mais belas paisagens portuguesas em pixel art.',
      coverPixelUrl: 'https://placehold.co/64x64.png',
      dataAiHint: 'album cover landscape',
      pixelCount: 18,
    },
    {
      id: 'album2',
      name: 'Monumentos Históricos',
      description: 'Uma viagem pixelizada pela história de Portugal.',
      coverPixelUrl: 'https://placehold.co/64x64.png',
      dataAiHint: 'album cover monuments',
      pixelCount: 12,
    },
  ],
};

export default function MemberPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-background via-card/50 to-background">
      <UserProfileDisplay userData={mockUserData} />
    </div>
  );
}
