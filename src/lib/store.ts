import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  credits: number;
  specialCredits: number;
  level: number;
  xp: number;
  xpMax: number;
  pixels: number;
  achievements: number;
  notifications: number;
  isPremium: boolean;
  isVerified: boolean;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;
  addSpecialCredits: (amount: number) => void;
  removeSpecialCredits: (amount: number) => void;
  addXp: (amount: number) => void;
  addPixel: () => void;
  removePixel: () => void;
  unlockAchievement: () => void;
  addNotification: () => void;
  clearNotifications: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      credits: 12500,
      specialCredits: 120,
      level: 8,
      xp: 2450,
      xpMax: 3000,
      pixels: 42,
      achievements: 5,
      notifications: 3,
      isPremium: true,
      isVerified: true,
      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      removeCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
      addSpecialCredits: (amount) => set((state) => ({ specialCredits: state.specialCredits + amount })),
      removeSpecialCredits: (amount) => set((state) => ({ specialCredits: Math.max(0, state.specialCredits - amount) })),
      addXp: (amount) => {
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newXpMax = state.xpMax;
          
          // Level up logic
          while (newXp >= newXpMax) {
            newXp -= newXpMax;
            newLevel++;
            newXpMax = Math.floor(newXpMax * 1.2); // 20% increase per level
          }
          
          return {
            xp: newXp,
            level: newLevel,
            xpMax: newXpMax
          };
        });
      },
      addPixel: () => set((state) => ({ pixels: state.pixels + 1 })),
      removePixel: () => set((state) => ({ pixels: Math.max(0, state.pixels - 1) })),
      unlockAchievement: () => set((state) => ({ achievements: state.achievements + 1 })),
      addNotification: () => set((state) => ({ notifications: state.notifications + 1 })),
      clearNotifications: () => set({ notifications: 0 }),
    }),
    {
      name: 'pixel-universe-user-storage',
    }
  )
);

interface PixelState {
  soldPixels: Array<{
    x: number;
    y: number;
    color: string;
    ownerId?: string;
    title?: string;
    pixelImageUrl?: string;
  }>;
  addSoldPixel: (pixel: { x: number; y: number; color: string; ownerId?: string; title?: string; pixelImageUrl?: string }) => void;
  updatePixelColor: (x: number, y: number, color: string) => void;
}

export const usePixelStore = create<PixelState>()(
  persist(
    (set) => ({
      soldPixels: [
        { x: 579, y: 358, color: 'hsl(var(--accent))', title: 'Pixel especial LIS', ownerId: 'user123' },
        { x: 640, y: 260, color: 'magenta', title: 'Pixel especial POR', ownerId: 'currentUserPixelMaster', pixelImageUrl: 'https://placehold.co/1x1.png' },
        { x: 706, y: 962, color: 'cyan', title: 'Pixel especial FAR', ownerId: 'user456' },
      ],
      addSoldPixel: (pixel) => set((state) => ({ 
        soldPixels: [...state.soldPixels, pixel] 
      })),
      updatePixelColor: (x, y, color) => set((state) => ({
        soldPixels: state.soldPixels.map(pixel => 
          pixel.x === x && pixel.y === y 
            ? { ...pixel, color } 
            : pixel
        )
      })),
    }),
    {
      name: 'pixel-universe-pixel-storage',
    }
  )
);

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  animations: boolean;
  notifications: boolean;
  soundEffects: boolean;
  highQualityRendering: boolean;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  toggleAnimations: () => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  toggleHighQualityRendering: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      animations: true,
      notifications: true,
      soundEffects: true,
      highQualityRendering: true,
      setTheme: (theme) => set({ theme }),
      toggleAnimations: () => set((state) => ({ animations: !state.animations })),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
      toggleSoundEffects: () => set((state) => ({ soundEffects: !state.soundEffects })),
      toggleHighQualityRendering: () => set((state) => ({ highQualityRendering: !state.highQualityRendering })),
    }),
    {
      name: 'pixel-universe-settings-storage',
    }
  )
);