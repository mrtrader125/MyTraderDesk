// src/app/(users)/dashboard/DashboardGrid.tsx

'use client';

import React, { memo } from 'react';
import { LocalClockWidget } from './LocalClockWidget';
import { SessionClockWidget } from './SessionClockWidget';
import { DashboardGridProps } from './types';
import { GridWidget } from './GridWidget';

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

      <GridWidget
        widget={widgets.local}
        isPro={isPro}
        isDragging={draggingId === 'local'}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleDropOnGrid={handleDropOnGrid}
        handleResizePointerDown={handleResizePointerDown}
      >
        <LocalClockWidget 
          fontIdx={widgets.local.fontIdx} 
          isPro={isPro} 
          onToggleFont={handleToggleLocalFont} 
        />
      </GridWidget>

      <GridWidget
        widget={widgets.session}
        isPro={isPro}
        isSessionOverlap={isSessionOverlap}
        isDragging={draggingId === 'session'}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleDropOnGrid={handleDropOnGrid}
        handleResizePointerDown={handleResizePointerDown}
      >
        <SessionClockWidget 
          fontIdx={widgets.session.fontIdx} 
          timeOffsetRef={timeOffsetRef} 
          isPro={isPro} 
          onToggleFont={handleToggleSessionFont} 
          onOverlapChange={setIsSessionOverlap} 
        />
      </GridWidget>

    </div>
  );
});
DashboardGrid.displayName = 'DashboardGrid';
