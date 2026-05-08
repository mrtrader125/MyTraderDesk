'use client'

import React, { memo } from 'react';
import { LocalClockWidget, SessionClockWidget } from './LiveClockWidgets';
import { DashboardGridProps } from './types';

export const DashboardGrid = memo(({ 
  widgets, isPro, isSessionOverlap, draggingId, gridRef, timeOffsetRef,
  handleDragStart, handleDragEnd, handleDropOnGrid, handleResizePointerDown, 
  handleToggleLocalFont, handleToggleSessionFont, setIsSessionOverlap
}: DashboardGridProps) => {
  return (
    <div 
      ref={gridRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOnGrid}
      className="order-2 lg:order-1 w-full lg:w-[60%] shrink-0 min-h-[300px] lg:min-h-0 grid grid-cols-7 grid-rows-7 gap-1.5 relative bg-[#050505] rounded-xl border border-zinc-800/20 p-2"
    >
      {Array.from({ length: 49 }).map((_, i) => (
        <div key={`slot-${i}`} className="w-full h-full rounded border border-dashed border-zinc-800/10 pointer-events-none" />
      ))}

      <div 
        draggable={isPro} 
        onDragStart={(e) => handleDragStart(e, 'local')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnGrid}
        className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md group overflow-hidden transition-all duration-200 z-10 ${draggingId === 'local' ? 'opacity-40 ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ gridColumn: `${widgets.local.x + 1} / span ${widgets.local.w}`, gridRow: `${widgets.local.y + 1} / span ${widgets.local.h}`, width: '100%', height: '100%' }}
      >
        <LocalClockWidget fontIdx={widgets.local.fontIdx} isPro={isPro} onToggleFont={handleToggleLocalFont} />
        {isPro && (
          <div 
            draggable={false}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerDown={(e) => handleResizePointerDown(e, 'local')}
            className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
          >
            <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
          </div>
        )}
      </div>

      <div 
        draggable={isPro} 
        onDragStart={(e) => handleDragStart(e, 'session')}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnGrid}
        className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md group overflow-hidden transition-all duration-200 z-10 ${isSessionOverlap ? 'border-b-[3px] border-b-blue-500/50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]' : ''} ${draggingId === 'session' ? 'opacity-40 ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ gridColumn: `${widgets.session.x + 1} / span ${widgets.session.w}`, gridRow: `${widgets.session.y + 1} / span ${widgets.session.h}`, width: '100%', height: '100%' }}
      >
        <SessionClockWidget fontIdx={widgets.session.fontIdx} timeOffsetRef={timeOffsetRef} isPro={isPro} onToggleFont={handleToggleSessionFont} onOverlapChange={setIsSessionOverlap} />
        {isPro && (
          <div 
            draggable={false}
            onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerDown={(e) => handleResizePointerDown(e, 'session')}
            className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
          >
            <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
});
DashboardGrid.displayName = 'DashboardGrid';
