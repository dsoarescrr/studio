
// src/components/user/UserProfileSheet.tsx
'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription, // Added for potential use
} from "@/components/ui/sheet";
import { UserProfileDisplay, type UserProfileData } from './UserProfileDisplay';
import type { Achievement } from '@/data/achievements-data'; // Corrected import
import { ScrollArea } from '../ui/scroll-area';

interface UserProfileSheetProps {
  children: React.ReactNode;
  userData: UserProfileData;
  achievementsData: Achievement[]; // Keep this prop as it's passed down
}

export function UserProfileSheet({ children, userData, achievementsData }: UserProfileSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full max-w-md p-0 sm:max-w-md" side="right">
        <ScrollArea className="h-full">
          <UserProfileDisplay userData={userData} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
