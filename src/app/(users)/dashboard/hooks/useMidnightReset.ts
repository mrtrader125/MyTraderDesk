// src/app/(users)/dashboard/hooks/useMidnightReset.ts

import { useEffect, useRef } from 'react';
import { Setup } from '../types';

export function useMidnightReset(
  setups: Setup[],
  getBaseDate: () => Date,
  getBaseDateString: (timestamp: number) => string
) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scheduleMidnightCheck = () => {
      const now = getBaseDate();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0); 
      const delay = nextMidnight.getTime() - now.getTime() + 1000;
      
      timeoutIdRef.current = setTimeout(() => {
        const todayStr = getBaseDate().toDateString();
        const hasStaleSetups = setups.some(s => s.isToday && s.addedToTodayAt && getBaseDateString(s.addedToTodayAt) !== todayStr);
        if (hasStaleSetups) {
          window.location.reload();
        } else {
          scheduleMidnightCheck();
        }
      }, delay);
    };

    scheduleMidnightCheck();

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [setups, getBaseDate, getBaseDateString]);
}