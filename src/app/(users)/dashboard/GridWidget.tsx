// src/app/(users)/dashboard/GridWidget.tsx

'use client';

import React, { memo } from 'react';
import { GridWidgetProps } from './types';

export const GridWidget = memo(({
  widget,
  isPro,
  isSessionOverlap = false,
  isDragging,
  handleDragStart,
  handleDragEnd,
  handleDropOnGrid,
  handleResizePointerDown,
  children
}: GridWidgetProps) => {
  return (
    <div 
      draggable={isPro} 
      onDragStart={(e) => handleDragStart(e, widget.id)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOnGrid}
      className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md group overflow-hidden transition-all duration-200 z-10 
        ${isSessionOverlap ? 'border-b-[3px] border-b-blue-500/50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]' : ''} 
        ${isDragging ? 'opacity-40 ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} 
        ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`
      }
      style={{ 
        gridColumn: `${widget.x + 1} / span ${widget.w}`, 
        gridRow: `${widget.y + 1} / span ${widget.h}`, 
        width: '100%', 
        height: '100%' 
      }}
    >
      {children}
      {isPro && (
        <div 
          draggable={false}
          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onPointerDown={(e) => handleResizePointerDown(e, widget.id)}
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
        >
          <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
        </div>
      )}
    </div>
  );
});
GridWidget.displayName = 'GridWidget';
