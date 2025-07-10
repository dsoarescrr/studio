'use client';

import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/lib/store';

interface SoundEffectProps {
  src: string;
  play: boolean;
  volume?: number;
  loop?: boolean;
  onEnd?: () => void;
  rate?: number;
}

export function SoundEffect({ 
  src, 
  play, 
  volume = 0.5, 
  loop = false, 
  onEnd,
  rate = 1.0
}: SoundEffectProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { soundEffects } = useSettingsStore();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      
      // Set playback rate if supported
      if ('playbackRate' in audioRef.current) {
        audioRef.current.playbackRate = rate;
      }
      
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
      const playPromise = audioRef.current.play();
      
      // Handle play promise to avoid uncaught promise errors
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing sound:', err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [play, soundEffects, rate]);

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
  HOVER: '/sounds/click.mp3', // Reusing click sound for hover
};