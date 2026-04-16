// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Image as ImageIcon
} from 'lucide-react'

export default function PersonalDashboard() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--' })
  
  // Static, read-only setup data for the day
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

  const [routine, setRoutine] = useState([
    { id: 1, label: 'Sunday Macro Prep', completed: true },
    { id: 2, label: 'Daily Filtering', completed: false },
    { id: 3, label: 'Weekly Wind-up', completed: false }
  ])

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

  const toggleRoutine = (id: number) => {
    setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      {/* 🔴 FULL WIDTH WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">

        {/* Inner Content Wrapper: Strictly split 50% Top, 50% Bottom */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

          {/* 🟢 TOP ROW: COMPACT METRICS & ROUTINE (STRICTLY 50% HEIGHT) */}
          <div className="h-1/2 shrink-0 p-3 sm:p-4 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
            
            <div className="flex flex-col gap-4 w-full md:w-64 shrink-0 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Metric 1: Local Time */}
              <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm h-24 shrink-0">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock size={12}/> Local Time
                </span>
                <span className="text-lg font-mono text-zinc-100 tracking-wide">
                  {mounted && time ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                </span>
              </div>
              
              {/* Metric 2: Active Session */}
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

            {/* Metric 3: Routine Checklist */}
            <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-4 flex flex-col shadow-sm min-h-0">
              <div className="flex justify-between items-center mb-2 border-b border-zinc-800/50 pb-2 shrink-0">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500/70" /> Execution Routine
                </h3>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {routine.map(item => (
                  <div key={item.id} onClick={() => toggleRoutine(item.id)} className="flex items-center gap-3 cursor-pointer group py-1.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent group-hover:border-zinc-500'}`}>
                      <CheckCircle2 size={12} />
                    </div>
                    <span className={`text-xs font-medium tracking-wide transition-all ${item.completed ? 'text-zinc-600 line-through' : 'text-zinc-300 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 🟢 BOTTOM ROW: TODAY WORKSPACE (READ-ONLY) */}
          <div className="h-1/2 shrink-0 flex flex-col border-t border-zinc-800/60 bg-[#080808] min-h-0">
            
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#050505]">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-blue-500" /> Today's Focus
              </h2>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                {todaySetups.length} Pairs Locked
              </span>
            </div>

            <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
              
              {/* PANE 1: List (Read-Only Selection) */}
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

              {/* PANE 2: Chart (Read-Only) */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#030303] relative border-r border-zinc-800/60">
                {activeSetup ? (
                  <div className="absolute inset-0 p-2 flex items-center justify-center">
                    <img src={activeSetup.imageUrl} alt={`${activeSetup.symbol} Chart`} className="w-full h-full object-contain rounded-lg border border-zinc-800/50 shadow-2xl" />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair to view</span>
                  </div>
                )}
              </div>

              {/* PANE 3: Notes Box (Read-Only) */}
              <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 p-3 bg-[#030303]">
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-4 shadow-sm flex flex-col min-h-0">
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
