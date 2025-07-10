'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SoundEffect, SOUND_EFFECTS } from '@/components/ui/sound-effect';
import { Confetti } from '@/components/ui/confetti'; 
import { cn } from '@/lib/utils';

interface AchievementPopupProps {
  show: boolean;
  achievement: {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    creditsReward: number;
    icon?: React.ReactNode;
  };
  onClose: () => void;
}

const rarityColors = {
  common: 'bg-gray-500/20 text-gray-400 border-gray-400/50',
  uncommon: 'bg-green-500/30 text-green-400 border-green-400/60',
  rare: 'bg-blue-500/30 text-blue-400 border-blue-400/60',
  epic: 'bg-purple-500/30 text-purple-400 border-purple-400/60',
  legendary: 'bg-amber-500/30 text-amber-400 border-amber-400/60',
};

export function AchievementPopup({ show, achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); 

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setShowConfetti(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => { 
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500); // Wait for exit animation
  };

  return (
    <>
      <SoundEffect 
        src={SOUND_EFFECTS.ACHIEVEMENT} 
        play={show} volume={0.7}
      />
      
      <Confetti 
        active={showConfetti} 
        duration={3000} 
        onComplete={() => setShowConfetti(false)}
        particleCount={300}
      />
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0, scale: [0.9, 1.05, 1] }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <Card className={cn(
              "border-2 shadow-2xl overflow-hidden animate-float",
              achievement.rarity === 'legendary' && "legendary-glow-strong",
              achievement.rarity === 'epic' && "epic-shadow" 
            )}>
              <CardContent className="p-0">
                <div className={cn(
                  "p-4 text-center relative overflow-hidden",
                  rarityColors[achievement.rarity]
                )}>
                  {/* Animated background for legendary achievements */}
                  {achievement.rarity === 'legendary' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30 animate-shimmer" 
                         style={{ backgroundSize: '200% 100%' }} />
                  )}
                  
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2 h-6 w-6 text-foreground/70 hover:text-foreground"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex flex-col items-center relative z-10">
                    <div className="mb-2">
                      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="p-3 rounded-full bg-background/20 animate-pulse">
                        {achievement.icon || <Trophy className="h-12 w-12" />}
                      </motion.div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold animated-gradient-text">Conquista Desbloqueada!</h3>
                      <p className="text-lg font-semibold text-glow">{achievement.name}</p>
                      <p className="text-sm max-w-xs mx-auto">{achievement.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge className="bg-primary text-primary-foreground">+{achievement.xpReward} XP</Badge>
                      <Badge className="bg-accent text-accent-foreground">+{achievement.creditsReward} Créditos</Badge>
                    </div>
                    
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="mt-4 flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-5 w-5 mx-0.5",
                            "transition-all duration-300",
                            i < ['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(achievement.rarity) + 1
                              ? "text-yellow-400 fill-current animate-pulse" 
                              : "text-gray-400"
                          )} 
                        />
                      ))} 
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
