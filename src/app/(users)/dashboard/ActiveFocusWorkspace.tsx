// src/app/(users)/dashboard/ActiveFocusWorkspace.tsx

'use client';

import React, { memo, useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Crosshair, Target, ChevronLeft, ChevronRight, Maximize, Info } from 'lucide-react';
import { ActiveFocusWorkspaceProps, Setup } from './types';

export const ActiveFocusWorkspace = memo(({ 
  isTodayFocusExpanded, setIsTodayFocusExpanded, todaySetups, activeSetup, activeTodayId, setActiveTodayId, 
  setIsMobileNotesOpen, displayDirection, handlePeekStart, handlePeekEnd, chartScale, setChartScale, 
  transformRef, setIsFullScreen 
}: ActiveFocusWorkspaceProps) => {

  const [sanitizedNotes, setSanitizedNotes] = useState('<p class="text-zinc-600 italic">Loading notes...</p>');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!activeSetup?.notes) {
      setSanitizedNotes('<p class="text-zinc-600 italic">No notes logged.</p>');
      return;
    }
    
    import('dompurify').then((DOMPurify) => {
      if (isMounted) {
        setSanitizedNotes(DOMPurify.default.sanitize(activeSetup.notes!, { USE_PROFILES: { html: true } }));
      }
    }).catch(() => {
      if (isMounted) setSanitizedNotes('<p class="text-red-500 italic">Failed to load notes safely.</p>');
    });

    return () => { isMounted = false; };
  }, [activeSetup?.notes]);

  const onTransformed = (ref: any) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setChartScale(ref.state.scale));
  };

  return (
    <div className={`hidden lg:flex shrink-0 flex-col border-t border-zinc-800/60 bg-[#080808] min-h-0 transition-all duration-300 ease-in-out ${isTodayFocusExpanded ? 'w-full h-1/2' : 'w-48 xl:w-56 border-r border-zinc-800/60 h-1/2'}`}>
      <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-[#050505]">
        <div className="flex items-center gap-2 min-w-0">
          <Crosshair size={14} className="text-blue-500 shrink-0" />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest truncate">
            {isTodayFocusExpanded ? "Active Focus" : "Focus"} 
            {isTodayFocusExpanded && <span className="font-mono text-[9px] text-zinc-500 ml-1.5 opacity-70">[A]</span>}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {isTodayFocusExpanded && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">{todaySetups.length} Pairs Locked</span>}
          <button onClick={() => setIsTodayFocusExpanded(prev => !prev)} className="text-zinc-500 hover:text-white transition-colors p-1" title={isTodayFocusExpanded ? "Collapse Focus Workspace [A]" : "Expand Focus Workspace [A]"}>
            {isTodayFocusExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        <div className={`shrink-0 flex flex-col bg-[#080808] overflow-y-auto custom-scrollbar p-2 gap-1.5 ${isTodayFocusExpanded ? 'w-48 xl:w-56 border-r border-zinc-800/60' : 'w-full'}`}>
          {todaySetups.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center p-4">
              <Target size={20} className="mb-2 opacity-50" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Pairs Active</span>
            </div>
          ) : (
            todaySetups.map((setup: Setup) => (
              <div key={`today-${setup.id}`} onClick={() => setActiveTodayId(setup.id)} className={`p-3 rounded-lg border flex flex-col cursor-pointer transition-all group ${activeTodayId === setup.id ? 'bg-zinc-800 border-zinc-600 shadow-sm' : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{setup.symbol}</span>
                  {activeTodayId === setup.id && (
                    <button onClick={(e) => { e.stopPropagation(); setIsMobileNotesOpen(true); }} className="lg:hidden p-1 rounded hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="View Notes"><Info size={14} /></button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${setup.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : setup.direction === 'SHORT' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>
                    {displayDirection(setup.direction)}
                  </span>
                  {setup.playbook && <span className="text-[9px] text-zinc-500 font-bold uppercase truncate">{setup.playbook}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`flex flex-row min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isTodayFocusExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
          <div 
            className="flex-1 flex flex-col min-w-0 bg-[#030303] relative border-r border-zinc-800/60 group overflow-hidden"
            onMouseDown={handlePeekStart} onMouseUp={handlePeekEnd} onMouseLeave={handlePeekEnd}
            onTouchStart={handlePeekStart} onTouchEnd={handlePeekEnd}
          >
            {activeSetup?.imageUrl ? (
              <>
                <TransformWrapper
                  key={activeSetup.id}
                  initialScale={1} minScale={0.5} maxScale={10} centerOnInit={true}
                  wheel={{ step: 0.1 }} doubleClick={{ mode: 'reset' }} panning={{ disabled: false }}
                  onTransformed={onTransformed}
                  ref={transformRef}
                >
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={activeSetup.imageUrl} 
                      alt={`${activeSetup.symbol} Chart`}
                      loading="lazy"
                      decoding="async" 
                      className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto transform-gpu will-change-transform" 
                      draggable={false} 
                    />
                  </TransformComponent>
                </TransformWrapper>
                {chartScale !== 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }} className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100" title="View Full Screen">
                    <Maximize size={16} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-700 min-h-0"><span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Select a pair to view</span></div>
            )}
          </div>
          <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 p-3 bg-[#030303]">
            <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 shadow-sm flex flex-col min-h-0">
              <div className="w-full h-full overflow-y-auto custom-scrollbar text-xs text-zinc-300 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ActiveFocusWorkspace.displayName = 'ActiveFocusWorkspace';
