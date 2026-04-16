// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Activity, Lock, X, AlertTriangle
} from 'lucide-react'

export default function PersonalDashboard() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--' })
  
  // --- MOCK DATABASE STATE (All strictly read-only for display) ---
  const [todaySetups] = useState([
    { 
      id: '1', 
      symbol: 'GBPJPY', 
      notes: 'Macro structure shows clear sweep of weekly high.\nWaiting for 1H displacement and fair value gap tap to enter short.\n\nTarget is the 4H unmitigated demand zone below.', 
      imageUrl: 'https://s3.tradingview.com/snapshots/placeholder1.png' 
    },
    { 
      id: '2', 
      symbol: 'XAUUSD', 
      notes: 'Gold respecting daily trendline.\nCPI data coming up, playing it safe until NY session volume steps in.', 
      imageUrl: 'https://s3.tradingview.com/snapshots/placeholder2.png' 
    }
  ])

  const [activeTodayId, setActiveTodayId] = useState<string | null>(todaySetups.length > 0 ? todaySetups[0].id : null)

  // Operating Rhythm Tracker Data (Calculated from Desk Page inputs)
  const [weekProgress] = useState([
    { day: 'M', status: 'perfect' },   // Green tick
    { day: 'T', status: 'missed' },    // Red cross
    { day: 'W', status: 'imperfect' }, // Yellow warning
    { day: 'T', status: 'current' },   // Active day
    { day: 'F', status: 'pending' },   // Future
  ])

  // Mocked automated status flags based on user's desk activity
  const routineStatus = {
    sundayPrep: true,       // True if Vault was updated before Monday
    dailyFiltered: true,    // True if pairs are in Today's Focus
    execution: 'pending',   // 'perfect', 'imperfect', or 'pending'
    weekendWindup: false,   // True if trades reconciled on Fri/Sat
    isWeekend: false        // Unlocks the windup step
  }

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      const utcHour = now.getUTCHours();
      let sName = 'Interbank';
      let tz = 'UTC';

      if (utcHour >= 13 && utcHour < 22) { sName = 'New York'; tz = 'America/New_York'; }
      else if (utcHour >= 8 && utcHour < 17) { sName = 'London'; tz = 'Europe/London'; }
      else if (utcHour >= 0 && utcHour < 9) { sName = 'Tokyo'; tz = 'Asia/Tokyo'; }
      else { sName = 'Sydney'; tz = 'Australia/Sydney'; }

      setSessionInfo({
        name: sName,
        localTime: now.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  const renderDayStatus = (status: string) => {
    switch (status) {
      case 'perfect': return <CheckCircle2 size={12} className="text-emerald-500" />;
      case 'missed': return <X size={12} className="text-red-500" />;
      case 'imperfect': return <AlertTriangle size={10} className="text-amber-500" />;
      case 'current': return <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />;
      default: return null;
    }
  }

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* 🟢 TOP ROW: METRICS & OPERATING RHYTHM */}
          <div className="h-1/2 shrink-0 p-3 sm:p-4 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
            
            <div className="flex flex-col gap-4 w-full md:w-64 shrink-0 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Local Time */}
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm h-24 shrink-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock size={12}/> Local Time
                </span>
                <span className="text-lg font-mono text-zinc-100 tracking-wide">
                  {mounted && time ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                </span>
              </div>
              
              {/* Active Session */}
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm h-24 shrink-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest mb-1 flex items-center gap-1 relative z-10">
                  <Globe2 size={12}/> Active Session: {sessionInfo.name}
                </span>
                <span className="text-lg font-mono text-white tracking-tight leading-tight relative z-10">
                  {sessionInfo.localTime}
                </span>
              </div>
            </div>

            {/* Operating Rhythm (STRICTLY READ-ONLY) */}
            <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-4 flex flex-col shadow-sm min-h-0">
              
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800/50 pb-3 shrink-0">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-500" /> Automated Rhythm Tracker
                </h3>
                
                {/* M-F Tracker */}
                <div className="flex gap-1.5">
                  {weekProgress.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                        day.status === 'current' ? 'border-blue-500/50 bg-blue-500/10' : 
                        day.status !== 'pending' ? 'border-zinc-800 bg-zinc-900/50' : 
                        'border-zinc-800/30 bg-transparent text-zinc-700'
                      }`}>
                        {day.status === 'pending' ? <span className="text-[9px] font-bold">{day.day}</span> : renderDayStatus(day.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Checklist */}
              <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                
                {/* 1. Sunday Prep */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${routineStatus.sundayPrep ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent'}`}>
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold tracking-wide ${routineStatus.sundayPrep ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>Weekly Macro Prep</span>
                      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Vault Updated Before Mon</span>
                    </div>
                  </div>
                </div>

                {/* 2. Daily Filter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${routineStatus.dailyFiltered ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent'}`}>
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold tracking-wide ${routineStatus.dailyFiltered ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>Daily Filtering</span>
                      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">2-4 Pairs Locked Today</span>
                    </div>
                  </div>
                </div>

                {/* 3. Execution Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                      routineStatus.execution === 'perfect' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 
                      routineStatus.execution === 'imperfect' ? 'bg-red-500/20 border-red-500 text-red-400' : 
                      'bg-zinc-950 border-zinc-700 text-transparent'
                    }`}>
                      {routineStatus.execution === 'perfect' ? <CheckCircle2 size={12} /> : routineStatus.execution === 'imperfect' ? <AlertTriangle size={10} /> : null}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-wide text-zinc-200">Execution Grading</span>
                      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Max 2 Trades Logged</span>
                    </div>
                  </div>
                  {routineStatus.execution !== 'pending' && (
                     <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${routineStatus.execution === 'perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                       {routineStatus.execution}
                     </span>
                  )}
                </div>

                {/* 4. Weekend Journaling */}
                <div className={`flex items-center justify-between mt-2 pt-3 border-t border-zinc-800/50 ${!routineStatus.isWeekend ? 'opacity-40 grayscale' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-sm border bg-zinc-950 border-zinc-700 flex items-center justify-center">
                      {!routineStatus.isWeekend ? <Lock size={10} className="text-zinc-500" /> : routineStatus.weekendWindup && <CheckCircle2 size={12} className="text-emerald-500" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-wide text-zinc-400">Weekend Wind-up</span>
                      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">All trades reconciled</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 🟢 BOTTOM ROW: TODAY WORKSPACE (READ-ONLY) */}
          <div className="h-1/2 shrink-0 flex flex-col border-t border-zinc-800/60 bg-[#080808] min-h-0">
            
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#050505]">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-blue-500" /> Today's Focus (Read Only)
              </h2>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                {todaySetups.length} Pairs Locked
              </span>
            </div>

            <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
              
              {/* PANE 1: List */}
              <div className="w-48 sm:w-56 shrink-0 border-r border-zinc-800/60 flex flex-col bg-[#080808] overflow-y-auto custom-scrollbar p-2 gap-1.5">
                {todaySetups.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center p-4">
                    <Target size={20} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Pairs Active</span>
                  </div>
                ) : (
                  todaySetups.map(setup => (
                    <div 
                      key={`today-${setup.id}`}
                      onClick={() => setActiveTodayId(setup.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer group ${
                        activeTodayId === setup.id 
                          ? 'bg-zinc-800 border-zinc-600 shadow-sm' 
                          : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {setup.symbol}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* PANE 2: Chart */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#030303] relative border-r border-zinc-800/60">
                {activeSetup ? (
                  <div className="absolute inset-0 p-3 flex items-center justify-center">
                    <img src={activeSetup.imageUrl} alt={`${activeSetup.symbol} Chart`} className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl" />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair to view</span>
                  </div>
                )}
              </div>

              {/* PANE 3: Notes Box */}
              <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 p-3 bg-[#030303]">
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 shadow-sm flex flex-col min-h-0">
                  {activeSetup ? (
                    <div className="w-full h-full overflow-y-auto custom-scrollbar">
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {activeSetup.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center">
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No active notes</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
