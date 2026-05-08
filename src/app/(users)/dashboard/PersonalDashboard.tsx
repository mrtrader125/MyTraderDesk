// src/app/(users)/dashboard/PersonalDashboard.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Lock, X, BookOpen } from 'lucide-react';
import { User } from '@supabase/supabase-js';

// Types
import { Setup } from './types';

// Components
import { DashboardGrid } from './DashboardGrid';
import { RoutineTracker } from './RoutineTracker';
import { ActiveFocusWorkspace } from './ActiveFocusWorkspace';
import { FullScreenChartOverlay } from './FullScreenChartOverlay';

// Hooks
import { useWidgetGrid } from './hooks/useWidgetGrid';
import { useTradingWeekProgress } from './hooks/useTradingWeekProgress';
import { useDashboardRealtime } from './hooks/useDashboardRealtime';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMidnightReset } from './hooks/useMidnightReset';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PersonalDashboard({ userId }: { userId?: string }) {
  const [isPro, setIsPro] = useState<boolean>(true); 
  const [user, setUser] = useState<User | null>(null);
  
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null);
  const [isTodayFocusExpanded, setIsTodayFocusExpanded] = useState(true);
  const [isMobileNotesOpen, setIsMobileNotesOpen] = useState(false);
  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT');
  const [isSessionOverlap, setIsSessionOverlap] = useState(false);
  const [mobileSanitizedNotes, setMobileSanitizedNotes] = useState('<p>Loading...</p>');

  const [isPeeking, setIsPeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chartScale, setChartScale] = useState(1);
  
  const peekTimer = useRef<NodeJS.Timeout | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const [timeOffset, setTimeOffset] = useState(0);
  const [userTimezone, setUserTimezone] = useState(typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');

  const getTrueUTC = useCallback(() => new Date(Date.now() + timeOffset), [timeOffset]);
  const getBaseDate = useCallback(() => new Date(getTrueUTC().toLocaleString('en-US', { timeZone: userTimezone })), [getTrueUTC, userTimezone]);
  const adjustDbToBase = useCallback((utcString: string) => new Date(new Date(utcString).toLocaleString('en-US', { timeZone: userTimezone })), [userTimezone]);
  const getBaseDateString = useCallback((timestamp: number) => new Date(new Date(timestamp).toLocaleString('en-US', { timeZone: userTimezone })).toDateString(), [userTimezone]);

  const getBaseDateRef = useRef<() => Date>(getBaseDate);
  const adjustDbToBaseRef = useRef<(s: string) => Date>(adjustDbToBase);

  useEffect(() => {
    getBaseDateRef.current = getBaseDate;
    adjustDbToBaseRef.current = adjustDbToBase;
  }, [getBaseDate, adjustDbToBase]);

  // Hook Executions
  const { 
    widgets, draggingId, gridRef, layoutLoaded, handleDragStart, handleDragEnd, handleDropOnGrid, handleResizePointerDown, handleToggleLocalFont, handleToggleSessionFont 
  } = useWidgetGrid(isPro, supabase);

  const { 
    weekProgress, tradesTakenToday, pendingReconciliationsCount, syncLogsLightweight 
  } = useTradingWeekProgress(supabase, user, getBaseDateRef, adjustDbToBaseRef);

  const { 
    setups, todaySetups, pushesToday, vaultSetupCount, isLoading, loadDashboardData 
  } = useDashboardRealtime(supabase, user, isPro, getBaseDateRef, adjustDbToBaseRef, getBaseDateString, syncLogsLightweight);

  const activeSetup = useMemo(() => todaySetups.find((s: Setup) => s.id === activeTodayId), [todaySetups, activeTodayId]);
  const pastDays = useMemo(() => weekProgress.filter((d) => d.isPast || d.isToday), [weekProgress]);
  
  const { isPrepWindow, isWeekendNow, isVaultLocked } = useMemo(() => {
    const now = getBaseDate();
    const isWeekend = now.getDay() === 6 || now.getDay() === 0;
    const isPrep = isWeekend || (now.getDay() === 1 && (now.getHours() < 5 || (now.getHours() === 5 && now.getMinutes() < 30)));
    return { isWeekendNow: isWeekend, isPrepWindow: isPrep, isVaultLocked: !isPrep || (isPrep && pendingReconciliationsCount > 0) };
  }, [getBaseDate, pendingReconciliationsCount]);

  useKeyboardShortcuts(todaySetups, activeTodayId, setActiveTodayId, isMobileNotesOpen, setIsMobileNotesOpen, setIsTodayFocusExpanded, setIsFullScreen);
  useMidnightReset(setups, getBaseDate, getBaseDateString);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { cache: 'no-store' });
        if (!res.ok) throw new Error('API Blocked');
        const data = await res.json();
        const offset = new Date(data.dateTime + "Z").getTime() - Date.now();
        setTimeOffset(offset);
      } catch (error) { setTimeOffset(0); }
    };
    fetchTime();
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUser(session.user);

      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
      const isProUser = profile?.plan === 'pro' || profile?.plan === 'premium';
      setIsPro(isProUser);

      if (session.user.user_metadata?.desk_timezone) setUserTimezone(session.user.user_metadata.desk_timezone);
      if (session.user.user_metadata?.trade_terminology) setTerminology(session.user.user_metadata.trade_terminology);

      await loadDashboardData(session.user, isProUser);
    };
    init();
  }, [loadDashboardData]);

  useEffect(() => {
    let isMounted = true;
    if (isMobileNotesOpen && activeSetup?.notes) {
      import('dompurify').then((DOMPurify) => {
        if (isMounted) setMobileSanitizedNotes(DOMPurify.default.sanitize(activeSetup.notes!, { USE_PROFILES: { html: true } }));
      });
    }
    return () => { isMounted = false; };
  }, [isMobileNotesOpen, activeSetup?.notes]);

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find((s: Setup) => s.id === activeTodayId))) setActiveTodayId(todaySetups[0].id);
    else if (todaySetups.length === 0) setActiveTodayId(null);
  }, [todaySetups, activeTodayId]);

  useEffect(() => {
    if (activeTodayId && transformRef.current) { transformRef.current.resetTransform(); setChartScale(1); }
  }, [activeTodayId]);

  const displayDirection = useCallback((dir: string | null | undefined) => {
    if (!dir) return 'N/A';
    if (terminology === 'BUY_SELL') return dir === 'LONG' ? 'BUY' : 'SELL';
    return dir;
  }, [terminology]);

  const handlePeekStart = useCallback(() => { if (chartScale !== 1) return; peekTimer.current = setTimeout(() => setIsPeeking(true), 400); }, [chartScale]);
  const handlePeekEnd = useCallback(() => { if (peekTimer.current) clearTimeout(peekTimer.current); setIsPeeking(false); }, []);

  const timeOffsetRefProp = useRef(timeOffset);
  useEffect(() => { timeOffsetRefProp.current = timeOffset; }, [timeOffset]);

  const handleCloseFullScreen = useCallback(() => setIsFullScreen(false), []);

  return (
    <div className="flex h-full w-full bg-[#030303] text-zinc-300 font-sans overflow-y-auto lg:overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        {isLoading || !layoutLoaded ? (
          <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-full lg:h-1/2 shrink-0 p-3 sm:p-4 gap-4 min-h-0 overflow-y-auto lg:overflow-hidden relative">
              {!isPro && <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">Sandbox Mode <Lock size={12} className="stroke-[3]" /></div>}

              <DashboardGrid 
                widgets={widgets} 
                isPro={isPro} 
                isSessionOverlap={isSessionOverlap} 
                draggingId={draggingId} 
                gridRef={gridRef} 
                timeOffsetRef={timeOffsetRefProp}
                handleDragStart={handleDragStart} 
                handleDragEnd={handleDragEnd} 
                handleDropOnGrid={handleDropOnGrid} 
                handleResizePointerDown={handleResizePointerDown} 
                handleToggleLocalFont={handleToggleLocalFont} 
                handleToggleSessionFont={handleToggleSessionFont} 
                setIsSessionOverlap={setIsSessionOverlap}
              />

              <RoutineTracker 
                isPro={isPro} 
                vaultSetupCount={vaultSetupCount} 
                isVaultLocked={isVaultLocked} 
                isPrepWindow={isPrepWindow} 
                pushesToday={pushesToday} 
                pastDays={pastDays} 
                tradesTakenToday={tradesTakenToday} 
                isWeekendNow={isWeekendNow} 
                pendingReconciliationsCount={pendingReconciliationsCount}
              />
            </div>

            <ActiveFocusWorkspace 
              isTodayFocusExpanded={isTodayFocusExpanded} 
              setIsTodayFocusExpanded={setIsTodayFocusExpanded} 
              todaySetups={todaySetups} 
              activeSetup={activeSetup} 
              activeTodayId={activeTodayId} 
              setActiveTodayId={setActiveTodayId} 
              setIsMobileNotesOpen={setIsMobileNotesOpen} 
              displayDirection={displayDirection} 
              handlePeekStart={handlePeekStart} 
              handlePeekEnd={handlePeekEnd} 
              chartScale={chartScale} 
              setChartScale={setChartScale} 
              transformRef={transformRef} 
              setIsFullScreen={setIsFullScreen}
            />
          </div>
        )}
      </div>

      {isMobileNotesOpen && activeSetup && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setIsMobileNotesOpen(false)}>
          <div className="w-full h-[50vh] bg-zinc-950 border-t border-zinc-800 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-900/40 rounded-t-2xl">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-blue-500" />{activeSetup.symbol}</h3>
              <button onClick={() => setIsMobileNotesOpen(false)} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-sm text-zinc-300 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: mobileSanitizedNotes }} />
          </div>
        </div>
      )}

      <FullScreenChartOverlay
        imageUrl={activeSetup?.imageUrl || ''}
        isFullScreen={isFullScreen}
        isPeeking={isPeeking}
        onClose={handleCloseFullScreen}
      />
    </div>
  );
}
