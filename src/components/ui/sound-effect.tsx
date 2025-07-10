'use client';

import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/lib/store';

interface SoundEffectProps {
  src: string;
  play: boolean;
  volume?: number;
  loop?: boolean;
  onEnd?: () => void;
}

export function SoundEffect({ 
  src, 
  play, 
  volume = 0.5, 
  loop = false, 
  onEnd 
}: SoundEffectProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { soundEffects } = useSettingsStore();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      
      if (onEnd) {
        audioRef.current.addEventListener('ended', onEnd);
      }
    }

    return () => {
      if (audioRef.current && onEnd) {
        audioRef.current.removeEventListener('ended', onEnd);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, volume, loop, onEnd]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (play && soundEffects) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error('Error playing sound:', err));
    } else {
      audioRef.current.pause();
    }
  }, [play, soundEffects]);

  return null;
}

// Predefined sound effects
export const SOUND_EFFECTS = {
  PURCHASE: '/sounds/purchase.mp3',
  ACHIEVEMENT: '/sounds/achievement.mp3',
  NOTIFICATION: '/sounds/notification.mp3',
  CLICK: '/sounds/click.mp3',
  ERROR: '/sounds/error.mp3',
  SUCCESS: '/sounds/success.mp3',
};