// src/app/(users)/dashboard/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Setup } from '../types';

export function useKeyboardShortcuts(
  todaySetups: Setup[],
  activeTodayId: string | null,
  setActiveTodayId: React.Dispatch<React.SetStateAction<string | null>>,
  isMobileNotesOpen: boolean,
  setIsMobileNotesOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTodayFocusExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT';

      if (e.code === 'Escape') {
        e.preventDefault();
        if (isInput) target.blur();
        setIsFullScreen(false);
        setIsMobileNotesOpen(false);
        return; 
      }

      if (isInput || isMobileNotesOpen) return;

      if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsTodayFocusExpanded(prev => !prev);
      }
      if (e.code === 'KeyJ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push('/journal');
      }
      if (e.code === 'KeyD' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push('/desk');
      }

      if (todaySetups.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault(); 
        const currentIndex = todaySetups.findIndex(s => s.id === activeTodayId);
        if (currentIndex === -1) return;
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + todaySetups.length) % todaySetups.length 
          : (currentIndex + 1) % todaySetups.length;
        setActiveTodayId(todaySetups[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todaySetups, activeTodayId, router, isMobileNotesOpen, setActiveTodayId, setIsFullScreen, setIsMobileNotesOpen, setIsTodayFocusExpanded]);
}
