// src/app/(users)/dashboard/FullScreenChartOverlay.tsx

'use client';

import React, { memo } from 'react';
import { FullScreenChartOverlayProps } from './types';

export const FullScreenChartOverlay = memo(({ imageUrl, isFullScreen, isPeeking, onClose }: FullScreenChartOverlayProps) => {
  if (!isPeeking && !isFullScreen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150 ${isFullScreen ? 'cursor-pointer' : 'pointer-events-none'}`} 
      onClick={() => { if (isFullScreen) onClose(); }}
    >
      <img 
        src={imageUrl} 
        alt="Peek" 
        fetchPriority="high" 
        decoding="async" 
        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transform-gpu" 
      />
    </div>
  );
});
FullScreenChartOverlay.displayName = 'FullScreenChartOverlay';
