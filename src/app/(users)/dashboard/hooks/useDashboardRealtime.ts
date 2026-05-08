// src/app/(users)/dashboard/hooks/useDashboardRealtime.ts

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Setup, DEMO_SETUPS } from '../types';

export function useDashboardRealtime(
  supabase: SupabaseClient,
  user: User | null,
  isPro: boolean,
  getBaseDateRef: React.MutableRefObject<() => Date>,
  adjustDbToBaseRef: React.MutableRefObject<(s: string) => Date>,
  getBaseDateString: (timestamp: number) => string,
  syncLogsLightweight: () => Promise<void>
) {
  const [setups, setSetups] = useState<Setup[]>([]);
  const [vaultSetupCount, setVaultSetupCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const syncDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  const todaySetups = useMemo(() => setups.filter(s => s.isToday), [setups]);
  const pushesToday = useMemo(() => setups.filter(s => s.addedToTodayAt && getBaseDateString(s.addedToTodayAt) === getBaseDateRef.current().toDateString()).length, [setups, getBaseDateString, getBaseDateRef]);

  const loadDashboardData = useCallback(async (activeUser: User, isUserPro: boolean) => {
    if (!isUserPro) {
      setSetups(DEMO_SETUPS);
      setVaultSetupCount(2);
      setIsLoading(false);
      return;
    }

    const { data: setupsData } = await supabase
      .from('user_desk_setups')
      .select('*')
      .eq('user_id', activeUser.id)
      .order('added_to_today_at', { ascending: false });

    if (setupsData) {
      const todayStr = getBaseDateRef.current().toDateString();
      const expiredSetups = setupsData.filter((s: Record<string, any>) => s.is_today && s.added_to_today_at && adjustDbToBaseRef.current(s.added_to_today_at).toDateString() !== todayStr);
      if (expiredSetups.length > 0) {
        const expiredIds = expiredSetups.map((s: Record<string, any>) => s.id);
        await supabase.from('user_desk_setups').update({ is_today: false, added_to_today_at: null }).in('id', expiredIds);
        expiredSetups.forEach((s: Record<string, any>) => { s.is_today = false; s.added_to_today_at = null; });
      }
    }

    const parsedSetups: Setup[] = setupsData ? setupsData.map((d: Record<string, any>) => ({ 
      id: d.id, symbol: d.symbol, direction: d.direction, playbook: d.playbook, notes: d.notes, 
      imageUrl: d.image_url, isToday: d.is_today, addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null 
    })) : [];
    
    setSetups(parsedSetups); 
    setVaultSetupCount(parsedSetups.length);
    setIsLoading(false);
  }, [supabase, getBaseDateRef, adjustDbToBaseRef]);

  useEffect(() => {
    if (!user || !isPro) return;

    const safeSyncLogs = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      try { await syncLogsLightweight(); } finally { isSyncingRef.current = false; }
    };

    const channel = supabase.channel(`dashboard-sync-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_desk_setups', filter: `user_id=eq.${user.id}` }, (payload) => {
          setSetups((prevSetups) => {
            let updatedSetups = [...prevSetups];
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            if (eventType === 'INSERT') {
              const newSetup: Setup = { id: newRecord.id, symbol: newRecord.symbol, direction: newRecord.direction, playbook: newRecord.playbook, notes: newRecord.notes, imageUrl: newRecord.image_url, isToday: newRecord.is_today, addedToTodayAt: newRecord.added_to_today_at ? new Date(newRecord.added_to_today_at).getTime() : null };
              if (!updatedSetups.some(s => s.id === newSetup.id)) updatedSetups.push(newSetup);
            } else if (eventType === 'UPDATE') {
              updatedSetups = updatedSetups.map(setup => setup.id === newRecord.id ? { ...setup, symbol: newRecord.symbol, direction: newRecord.direction, playbook: newRecord.playbook, notes: newRecord.notes, imageUrl: newRecord.image_url, isToday: newRecord.is_today, addedToTodayAt: newRecord.added_to_today_at ? new Date(newRecord.added_to_today_at).getTime() : null } : setup );
            } else if (eventType === 'DELETE') {
              updatedSetups = updatedSetups.filter(setup => setup.id !== oldRecord.id);
            }
            
            updatedSetups = [...updatedSetups].sort((a, b) => (b.addedToTodayAt || 0) - (a.addedToTodayAt || 0));
            setVaultSetupCount(updatedSetups.length);
            return updatedSetups;
          });
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_desk_logs', filter: `user_id=eq.${user.id}` }, () => {
          if (syncDebounceTimer.current) clearTimeout(syncDebounceTimer.current);
          syncDebounceTimer.current = setTimeout(() => { safeSyncLogs(); }, 1000);
        }
      ).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      if (syncDebounceTimer.current) clearTimeout(syncDebounceTimer.current);
    };
  }, [user, isPro, supabase, syncLogsLightweight]);

  return { setups, todaySetups, pushesToday, vaultSetupCount, isLoading, loadDashboardData, setSetups, setVaultSetupCount };
}