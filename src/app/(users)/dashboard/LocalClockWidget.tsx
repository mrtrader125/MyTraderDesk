// src/app/(users)/dashboard/LocalClockWidget.tsx

'use client';

import React, { useState, useEffect, memo } from 'react';
import { Clock, Type } from 'lucide-react';
import { ClockWidgetProps, FONT_STYLES } from './types';

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

export const LocalClockWidget = memo(({ fontIdx, isPro, onToggleFont }: ClockWidgetProps) => {
  const [timeStr, setTimeStr] = useState('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();

    let timer: NodeJS.Timeout | null = null;
    const startTimer = () => { if (!document.hidden && !timer) timer = setInterval(updateTime, 1000); };
    const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };
    const handleVisibility = () => { if (document.hidden) stopTimer(); else { updateTime(); startTimer(); } };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { stopTimer(); document.removeEventListener('visibilitychange', handleVisibility); };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10">
        <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
          <Clock size={10} className="opacity-50"/> Local Time
        </div>
        {isPro && (
          <button onPointerDown={(e) => e.stopPropagation()} onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={onToggleFont} className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded touch-none" title="Cycle Typography">
            <Type size={12} />
          </button>
        )}
      </div>
      <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-0 pointer-events-none" style={{ containerType: 'size' as React.CSSProperties['containerType'] }}>
        {mounted ? formatTime(timeStr, fontIdx) : formatTime('--:--:--', fontIdx)}
      </div>
    </>
  );
});
LocalClockWidget.displayName = 'LocalClockWidget';
