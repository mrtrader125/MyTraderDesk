// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Activity, Lock, X, AlertTriangle
} from 'lucide-react'

// Initialize the Next.js SSR Browser Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PersonalDashboard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--' })
  
  // --- REAL SUPABASE DATABASE STATE ---
  const [todaySetups, setTodaySetups] = useState<any[]>([])
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null)

  const [weekProgress, setWeekProgress] = useState<any[]>([])

  const [routineStatus, setRoutineStatus] = useState({
    sundayPrep: false,
    dailyFiltered: false,
    execution: 'pending' as 'perfect' | 'imperfect' | 'pending',
    weekendWindup: false,
    isWeekend: false
  })

  // Set Local Time and Session
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now)
      
      const utcHour = now.getUTCHours()
      let sName = 'Interbank'
      let tz = 'UTC'

      if (utcHour >= 13 && utcHour < 22) { sName = 'New York'; tz = 'America/New_York' }
      else if (utcHour >= 8 && utcHour < 17) { sName = 'London'; tz = 'Europe/London' }
      else if (utcHour >= 0 && utcHour < 9) { sName = 'Tokyo'; tz = 'Asia/Tokyo' }
      else { sName = 'Sydney'; tz = 'Australia/Sydney' }

      setSessionInfo({
        name: sName,
        localTime: now.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Supabase Data & Calculate Rhythm
  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setIsLoading(false)
        return
      }
      const user = session.user

      // 1. Fetch All Setups
      const { data: setupsData } = await supabase
        .from('user_desk_setups')
        .select('*')
        .eq('user_id', user.id)
        .order('added_to_today_at', { ascending: false })

      const activeSetups = setupsData?.filter(s => s.is_today) || []
      const vaultSetups = setupsData?.filter(s => !s.is_today) || []

      setTodaySetups(activeSetups.map(d => ({
        id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url
      })))

      // 2. Determine Week Boundaries
      const now = new Date()
      const dayOfWeek = now.getDay() 
      const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const startOfWeek = new Date(now.setDate(diffToMonday))
      startOfWeek.setHours(0, 0, 0, 0)

      // 3. Fetch Logs (Executions) for the current week
      const { data: logsData } = await supabase
        .from('user_desk_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfWeek.toISOString())

      // 4. Calculate Chronological Tracker Status
      const progress = []
      const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      let currentExecutionStatus: 'perfect' | 'imperfect' | 'pending' = 'pending'

      for (let i = 0; i < 5; i++) {
        const targetDate = new Date(startOfWeek)
        targetDate.setDate(startOfWeek.getDate() + i)
        const dateString = targetDate.toDateString()
        const todayString = new Date().toDateString()

        const dayLogs = logsData?.filter(l => new Date(l.created_at).toDateString() === dateString) || []

        let status = 'pending'
        let isPast = false
        let isToday = false
        
        if (dateString === todayString) {
          isToday = true
          if (dayLogs.length > 0) {
            const hasImperfect = dayLogs.some(l => l.execution_type === 'Imperfect')
            status = hasImperfect ? 'imperfect' : 'perfect'
            currentExecutionStatus = status
          } else {
            status = 'current'
          }
        } else if (targetDate < new Date()) {
          isPast = true
          if (dayLogs.length === 0) {
            status = 'missed'
          } else {
            status = dayLogs.some(l => l.execution_type === 'Imperfect') ? 'imperfect' : 'perfect'
          }
        }

        progress.push({ day: daysFull[i], status, isPast, isToday })
      }
      setWeekProgress(progress)

      // 5. Compute Overall Routine Status
      const isWeekendNow = new Date().getDay() === 5 || new Date().getDay() === 6 
      const pendingReconciliations = logsData?.filter(l => !l.is_reconciled) || []

      setRoutineStatus({
        sundayPrep: vaultSetups.length > 0, 
        dailyFiltered: activeSetups.length >= 2, 
        execution: currentExecutionStatus,
        weekendWindup: logsData && logsData.length > 0 && pendingReconciliations.length === 0, 
        isWeekend: isWeekendNow
      })

      setIsLoading(false)
    }

    fetchDashboardData()
  }, [])

  // Auto-select first active setup
  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
    }
  }, [todaySetups, activeTodayId])

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  const todayName = weekProgress.find(d => d.isToday)?.day || 'Today'
  const pastDays = weekProgress.filter(d => d.isPast)

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
              <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-5 flex flex-col shadow-sm min-h-0">
                
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800/50 pb-3 shrink-0">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-500" /> Automated Rhythm Tracker
                  </h3>
                </div>

                {/* Chronological Checklist */}
                <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  
                  {/* 1. Sunday Prep */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${routineStatus.sundayPrep ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent'}`}>
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold tracking-wide ${routineStatus.sundayPrep ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>Weekly Macro Prep</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Past Days Log (Inline Boxes) */}
                  {pastDays.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-7">
                      {pastDays.map(day => (
                        <div key={day.day} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/20 border border-zinc-700/30 rounded backdrop-blur-sm">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{day.day}</span>
                          {day.status === 'perfect' && <CheckCircle2 size={10} className="text-emerald-500" />}
                          {day.status === 'imperfect' && <AlertTriangle size={10} className="text-amber-500" />}
                          {day.status === 'missed' && <X size={10} className="text-red-500" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Today Filter & Execution */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${routineStatus.dailyFiltered ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-blue-500/10 border-blue-500/50 text-transparent'}`}>
                        {routineStatus.dailyFiltered ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold tracking-wide text-zinc-200`}>
                          Today Filtering <span className="text-blue-400/80 ml-1">[{todayName}]</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between ml-7 border-l-2 border-zinc-800/50 pl-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                        routineStatus.execution === 'perfect' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 
                        routineStatus.execution === 'imperfect' ? 'bg-red-500/20 border-red-500 text-red-400' : 
                        'bg-zinc-950 border-zinc-700 text-transparent'
                      }`}>
                        {routineStatus.execution === 'perfect' ? <CheckCircle2 size={10} /> : routineStatus.execution === 'imperfect' ? <AlertTriangle size={8} /> : null}
                      </div>
                      <span className="text-xs font-bold tracking-wide text-zinc-400">Execution Grading</span>
                    </div>
                    {routineStatus.execution !== 'pending' && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${routineStatus.execution === 'perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {routineStatus.execution}
                      </span>
                    )}
                  </div>

                  {/* 4. Weekend Journaling */}
                  <div className={`flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50 ${!routineStatus.isWeekend ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-sm border bg-zinc-950 border-zinc-700 flex items-center justify-center">
                        {!routineStatus.isWeekend ? <Lock size={10} className="text-zinc-500" /> : routineStatus.weekendWindup && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-wide text-zinc-400">Weekend Wind-up</span>
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
                      <div 
                        className="w-full h-full overflow-y-auto custom-scrollbar text-xs text-zinc-300 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-zinc-600 italic">No notes logged.</p>' }} 
                      />
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
        )}
      </div>
    </div>
  )
}
