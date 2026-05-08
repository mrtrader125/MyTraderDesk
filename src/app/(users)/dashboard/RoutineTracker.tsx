// src/app/(users)/dashboard/RoutineTracker.tsx

'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Crosshair, BookOpen, Activity, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { RoutineTrackerProps } from './types';

export const RoutineTracker = memo(({ 
  isPro, vaultSetupCount, isVaultLocked, isPrepWindow, pushesToday, pastDays, tradesTakenToday, isWeekendNow, pendingReconciliationsCount 
}: RoutineTrackerProps) => {
  return (
    <div className="order-1 lg:order-2 w-full lg:w-[40%] bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-5 flex flex-col shadow-sm min-h-0 shrink-0 relative">
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <Link href="/desk" className="flex flex-col items-center p-1.5 rounded-lg bg-zinc-950 border border-zinc-800/50 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-sm" title="Go to Desk [D]">
          <span className="text-[8px] font-mono tracking-widest leading-none mb-0.5">[D]</span>
          <Crosshair size={12}/>
        </Link>
        <Link href="/journal" className="flex flex-col items-center p-1.5 rounded-lg bg-zinc-950 border border-zinc-800/50 text-zinc-500 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-sm" title="Go to Journal [J]">
          <span className="text-[8px] font-mono tracking-widest leading-none mb-0.5">[J]</span>
          <BookOpen size={12}/>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-4 pb-3 shrink-0 pt-1">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-blue-500" /> Operator Pipeline
        </h3>
      </div>

      <div className="flex flex-col overflow-y-visible lg:overflow-y-auto custom-scrollbar flex-1 pr-2 pl-1 relative">
        <div className="absolute left-[13px] top-2 bottom-6 w-px bg-zinc-800/60 z-0" />

        <div className={`flex items-start gap-4 relative z-10 mb-6 ${isVaultLocked && isPro ? 'opacity-60' : ''}`}>
          <div className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 bg-[#0a0a0a] ${vaultSetupCount > 0 ? 'border-emerald-500 text-emerald-400' : isVaultLocked ? 'border-red-500/50 text-red-500/50' : 'border-zinc-700 text-transparent'}`}>
            {vaultSetupCount > 0 ? <CheckCircle2 size={12} /> : isVaultLocked && isPro ? <Lock size={10} /> : null}
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold tracking-wide ${vaultSetupCount > 0 ? 'text-zinc-500' : 'text-zinc-200'}`}>Weekly Macro Prep</span>
            <span className={`text-[9px] font-medium uppercase tracking-widest mt-0.5 ${isVaultLocked && isPro ? 'text-red-400' : 'text-zinc-500'}`}>
              {isVaultLocked && isPro ? (!isPrepWindow ? 'Locked Until Weekend' : 'Locked: Complete Wind-up First') : 'Sunday Filter (Max 15-20)'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4 relative z-10 mb-6">
          <div className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 bg-[#0a0a0a] ${pushesToday > 0 && pushesToday <= 5 ? 'border-emerald-500 text-emerald-400' : pushesToday > 5 ? 'border-red-500 text-red-400' : 'border-blue-500/50 text-transparent'}`}>
            {pushesToday > 0 && pushesToday <= 5 ? <CheckCircle2 size={12} /> : pushesToday > 5 ? <AlertTriangle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold tracking-wide ${pushesToday > 0 && pushesToday <= 5 ? 'text-zinc-500' : 'text-zinc-200'}`}>Daily Sniper Routine</span>
            {pushesToday > 5 ? (
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5">RULE BREAK: Max 5 Allowed</span>
            ) : (
              <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Staged: {pushesToday}/5 Pairs</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 relative z-10 mb-6">
          <div className="flex flex-col items-center mt-0.5 shrink-0 bg-[#0a0a0a] py-1">
            {pastDays.map((day, i) => (
                <div key={day.day} className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${day.status === 'perfect' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : day.status === 'imperfect' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-zinc-800'}`} title={day.day} />
                  {i < pastDays.length - 1 && <div className={`w-px h-3 ${day.status === 'imperfect' ? 'bg-red-500/50' : 'bg-zinc-700'}`} />}
                </div>
            ))}
          </div>
          <div className="flex flex-col flex-1 mt-0.5">
            <span className="text-xs font-bold tracking-wide text-zinc-200 flex items-center justify-between">
              Live Execution
              <div className="flex gap-1 items-center pr-2">
                  <div className={`h-1.5 w-6 rounded-sm ${tradesTakenToday >= 1 ? 'bg-zinc-800' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`} />
                  <div className={`h-1.5 w-6 rounded-sm ${tradesTakenToday >= 2 ? 'bg-zinc-800' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`} />
              </div>
            </span>
            {tradesTakenToday >= 2 ? (
              <span className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1.5 px-2 py-1 bg-red-500/10 rounded border border-red-500/20 inline-block w-fit">HARD STOP ACTIVE: CLOSE TERMINAL</span>
            ) : (
              <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Pre-Outcome Mentality Log</span>
            )}
          </div>
        </div>

        <div className={`flex items-start gap-4 relative z-10 ${!isWeekendNow ? 'opacity-40 grayscale' : ''}`}>
          <div className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 bg-[#0a0a0a] ${isWeekendNow && pendingReconciliationsCount === 0 && tradesTakenToday > 0 ? 'border-emerald-500 text-emerald-400' : 'border-zinc-700 text-transparent'}`}>
            {isWeekendNow && pendingReconciliationsCount === 0 && tradesTakenToday > 0 && <CheckCircle2 size={12} />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide text-zinc-200">Weekend Settlement</span>
            <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              {pendingReconciliationsCount > 0 ? `${pendingReconciliationsCount} Trades Pending Math Log` : 'Post-Outcome Math Locked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
RoutineTracker.displayName = 'RoutineTracker';
