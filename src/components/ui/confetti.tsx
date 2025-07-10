'use client';

import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
  particleCount?: number;
  recycle?: boolean;
  gravity?: number;
}

export function Confetti({
  active,
  duration = 3000,
  onComplete, 
  colors = ['#D4A757', '#7DF9FF', '#FF6B6B', '#4CAF50', '#9C27B0', '#FFD700', '#FF1493'],
  particleCount = 300,
  recycle = false,
  gravity = 0.15
}: ConfettiProps) {
  const [isActive, setIsActive] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (active && !isActive) {
      setIsActive(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsActive(false);
          onComplete?.();
        }, duration); 
        
        return () => clearTimeout(timer);
      }
    } else if (!active && isActive) {
      setIsActive(false);
    }
  }, [active, isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={recycle || duration === 0}
      numberOfPieces={particleCount}
      colors={colors}
      gravity={gravity}
      tweenDuration={duration} 
      className="fixed inset-0 z-[100] pointer-events-none will-change-transform"
      confettiSource={{
        x: width / 2,
        y: height / 3,
        w: 0,
        h: 0
      }}
    />
  );
}
