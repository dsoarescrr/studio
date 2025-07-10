import { useUserStore } from '@/lib/store';
import { act } from '@testing-library/react';

// Reset the module registry before each test
beforeEach(() => {
  jest.resetModules();
});

describe('UserStore', () => {
  it('should initialize with default values', () => {
    const { credits, specialCredits, level, xp, xpMax, pixels, achievements, notifications } = useUserStore.getState();
    
    expect(credits).toBe(12500);
    expect(specialCredits).toBe(120);
    expect(level).toBe(8);
    expect(xp).toBe(2450);
    expect(xpMax).toBe(3000);
    expect(pixels).toBe(42);
    expect(achievements).toBe(5);
    expect(notifications).toBe(3);
  });
  
  it('should add credits correctly', () => {
    act(() => {
      useUserStore.getState().addCredits(500);
    });
    
    expect(useUserStore.getState().credits).toBe(13000);
  });
  
  it('should remove credits correctly', () => {
    act(() => {
      useUserStore.getState().removeCredits(500);
    });
    
    expect(useUserStore.getState().credits).toBe(12000);
  });
  
  it('should not allow negative credits', () => {
    act(() => {
      useUserStore.getState().removeCredits(20000);
    });
    
    expect(useUserStore.getState().credits).toBe(0);
  });
  
  it('should add XP and level up when threshold is reached', () => {
    const initialState = useUserStore.getState();
    const xpNeeded = initialState.xpMax - initialState.xp;
    
    act(() => {
      useUserStore.getState().addXp(xpNeeded + 100);
    });
    
    const newState = useUserStore.getState();
    expect(newState.level).toBe(initialState.level + 1);
    expect(newState.xp).toBe(100);
    expect(newState.xpMax).toBeGreaterThan(initialState.xpMax);
  });
  
  it('should add and clear notifications', () => {
    act(() => {
      useUserStore.getState().addNotification();
    });
    
    expect(useUserStore.getState().notifications).toBe(4);
    
    act(() => {
      useUserStore.getState().clearNotifications();
    });
    
    expect(useUserStore.getState().notifications).toBe(0);
  });
  
  it('should add and remove pixels', () => {
    act(() => {
      useUserStore.getState().addPixel();
    });
    
    expect(useUserStore.getState().pixels).toBe(43);
    
    act(() => {
      useUserStore.getState().removePixel();
    });
    
    expect(useUserStore.getState().pixels).toBe(42);
  });
  
  it('should not allow negative pixels', () => {
    act(() => {
      for (let i = 0; i < 100; i++) {
        useUserStore.getState().removePixel();
      }
    });
    
    expect(useUserStore.getState().pixels).toBe(0);
  });
  
  it('should unlock achievements', () => {
    act(() => {
      useUserStore.getState().unlockAchievement();
    });
    
    expect(useUserStore.getState().achievements).toBe(6);
  });
});