// src/app/(users)/dashboard/SessionClockWidget.tsx

'use client';

import React, { useState, useEffect, memo } from 'react';
import { Globe2, Type } from 'lucide-react';
import { SessionClockWidgetProps, FONT_STYLES } from './types';

const formatTime = (timeStr: string, fontIdx: number) => {
  if (!timeStr) return <div />;
  const [timeStrOnly, period] = timeStr.split(' ');
  const parts = timeStrOnly?.split(':') || [];
  
  return (
    <div className={`flex items-baseline justify-center ${FONT_STYLES[fontIdx]} select-none whitespace-nowrap tabular-nums leading-none`} style={{ fontSize: 'min(13cqi, 40cqb)' }}>
      {parts.map((p, i) => (
        <span key={i} className="flex items-baseline">
          <span>{p}</span>
          {i < 2 && <span className="opacity-20 font-sans font-light mx-[0.1em] text-[0.8em] relative -top-[0.05em]">:</span>}
        </span>
      ))}
      {period && <span className="ml-[0.2em] opacity-40 font-sans tracking-widest font-bold text-[0.3em] uppercase">{period}</span>}
    </div>
  );
};

export const SessionClockWidget = memo(({ fontIdx, timeOffsetRef, isPro, onToggleFont, onOverlapChange }: SessionClockWidgetProps) => {
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--', isOverlap: false });

  useEffect(() => {
    let lastOverlap = false;
    let timer: NodeJS.Timeout | null = null;

    const updateSession = () => {
      const trueUTC = new Date(Date.now() + timeOffsetRef.current);
      const utcHour = trueUTC.getUTCHours();
      const isSydney = utcHour >= 22 || utcHour < 7;
      const isTokyo = utcHour >= 0 && utcHour < 9;
      const isLondon = utcHour >= 8 && utcHour < 17;
      const isNY = utcHour >= 13 && utcHour < 22;
      const isOverlap = [isSydney, isTokyo, isLondon, isNY].filter(Boolean).length > 1;

      if (isOverlap !== lastOverlap) { lastOverlap = isOverlap; onOverlapChange(isOverlap); }

      let sName = 'Interbank'; let tz = 'UTC';
      if (isNY) { sName = 'New York'; tz = 'America/New_York'; }
      else if (isLondon) { sName = 'London'; tz = 'Europe/London'; }
      else if (isTokyo) { sName = 'Tokyo'; tz = 'Asia/Tokyo'; }
      else if (isSydney) { sName = 'Sydney'; tz = 'Australia/Sydney'; }

      setSessionInfo({ name: sName, localTime: trueUTC.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }), isOverlap });
    };

    const startTimer = () => { if (!document.hidden && !timer) timer = setInterval(updateSession, 1000); };
    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
    const handleVisibility = () => { if (document.hidden) stopTimer(); else { updateSession(); startTimer(); } };

    updateSession(); startTimer();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { stopTimer(); document.removeEventListener('visibilitychange', handleVisibility); };
  }, [timeOffsetRef, onOverlapChange]);

  return (
    <>
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
      <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10 relative">
        <div className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
          <Globe2 size={10} className="text-blue-500/80"/> {sessionInfo.name} Session
        </div>
        {isPro && (
          <button onPointerDown={(e) => e.stopPropagation()} onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={onToggleFont} className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded touch-none" title="Cycle Typography">
            <Type size={12} />
          </button>
        )}
      </div>
      <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-10 pointer-events-none" style={{ containerType: 'size' as React.CSSProperties['containerType'] }}>
        {formatTime(sessionInfo.localTime, fontIdx)}
      </div>
      {sessionInfo.isOverlap && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />}
    </>
  );
});
SessionClockWidget.displayName = 'SessionClockWidget';
