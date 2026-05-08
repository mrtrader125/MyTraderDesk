// src/app/(users)/dashboard/hooks/useTradingWeekProgress.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { WeekProgressDay, LogRecord } from '../types';

export function useTradingWeekProgress(
  supabase: SupabaseClient,
  user: User | null,
  getBaseDateRef: React.MutableRefObject<() => Date>,
  adjustDbToBaseRef: React.MutableRefObject<(s: string) => Date>
) {
  const [weekProgress, setWeekProgress] = useState<WeekProgressDay[]>([]);
  const [tradesTakenToday, setTradesTakenToday] = useState(0);
  const [pendingReconciliationsCount, setPendingReconciliationsCount] = useState(0);
  const isFetchingRef = useRef(false);

  const syncLogsLightweight = useCallback(async () => {
    if (!user || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const safeFetchDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const { data: logsData } = await supabase
        .from('user_desk_logs')
        .select('created_at, execution_type, is_reconciled, outcome') 
        .eq('user_id', user.id)
        .gte('created_at', safeFetchDate);

      if (!logsData) return;

      const initNow = getBaseDateRef.current();
      const initDayOfWeek = initNow.getDay();
      const initDiffToMon = initNow.getDate() - initDayOfWeek + (initDayOfWeek === 0 ? -6 : 1);
      const startOfWeekBase = new Date(initNow.getTime());
      startOfWeekBase.setDate(initDiffToMon);
      startOfWeekBase.setHours(0, 0, 0, 0);

      const progress: WeekProgressDay[] = []; 
      const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']; 
      let todayTradeCount = 0;

      for (let i = 0; i < 5; i++) {
        const targetDate = new Date(startOfWeekBase); 
        targetDate.setDate(startOfWeekBase.getDate() + i);
        const dateString = targetDate.toDateString(); 
        const todayString = getBaseDateRef.current().toDateString();
        const dayLogs = logsData.filter((l: LogRecord) => adjustDbToBaseRef.current(l.created_at).toDateString() === dateString);

        let status: WeekProgressDay['status'] = 'pending'; 
        let isPast = false; 
        let isToday = false;

        if (dateString === todayString) {
          isToday = true; 
          todayTradeCount = dayLogs.length;
          if (dayLogs.length > 0) status = dayLogs.some((l: LogRecord) => l.execution_type === 'Imperfect') ? 'imperfect' : 'perfect'; 
          else status = 'current';
        } else if (targetDate.getTime() < getBaseDateRef.current().getTime() && dateString !== todayString) {
          isPast = true;
          if (dayLogs.length === 0) status = 'missed'; 
          else status = dayLogs.some((l: LogRecord) => l.execution_type === 'Imperfect') ? 'imperfect' : 'perfect';
        }
        progress.push({ day: daysFull[i], status, isPast, isToday });
      }
      
      setWeekProgress(progress); 
      setTradesTakenToday(todayTradeCount);
      const pending = logsData.filter((l: LogRecord) => !l.is_reconciled && l.outcome !== 'HOLD' && adjustDbToBaseRef.current(l.created_at).getTime() >= startOfWeekBase.getTime());
      setPendingReconciliationsCount(pending.length);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user, supabase, getBaseDateRef, adjustDbToBaseRef]);

  useEffect(() => {
    return () => { isFetchingRef.current = false; };
  }, []);

  return {
    weekProgress,
    tradesTakenToday,
    pendingReconciliationsCount,
    syncLogsLightweight
  };
}
