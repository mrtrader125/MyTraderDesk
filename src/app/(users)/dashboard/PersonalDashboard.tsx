// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Activity, Lock, X, AlertTriangle, Type
} from 'lucide-react'

// Initialize the Next.js SSR Browser Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Widget = { id: string, x: number, y: number, w: number, h: number, fontIdx: number }

const LAYOUT_STORAGE_KEY = 'operator_desk_playground_layout_v4'

export default function PersonalDashboard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [layoutLoaded, setLayoutLoaded] = useState(false)
  
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

  // --- TIME & SESSION STATE ---
  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ 
    name: 'Determining...', 
    localTime: '--:--:--',
    isOverlap: false 
  })

  // --- PLAYGROUND STATE (7x7 Grid) ---
  const [widgets, setWidgets] = useState<{local: Widget, session: Widget}>({
    local: { id: 'local', x: 0, y: 0, w: 3, h: 3, fontIdx: 0 },
    session: { id: 'session', x: 0, y: 3, w: 3, h: 3, fontIdx: 0 }
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)
  
  // THE MISSING LINE:
  const gridRef = useRef<HTMLDivElement>(null)

  const fontStyles = [
    "font-mono font-black tracking-tighter text-zinc-100",   // Strong 1: Terminal
    "font-sans font-extrabold tracking-tight text-white",    // Strong 2: Modern Heavy
    "font-serif font-light tracking-wide text-zinc-300",     // Minimal 1: Editorial
    "font-sans font-thin tracking-widest text-zinc-400"      // Minimal 2: Ultra Clean
  ]

  // Load Saved Layout
  useEffect(() => {
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        if (parsed.local && parsed.session) setWidgets(parsed)
      } catch (e) {
        console.error("Failed to load playground layout", e)
      }
    }
    setLayoutLoaded(true)
  }, [])

  // Save Layout Changes
  useEffect(() => {
    if (layoutLoaded) {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(widgets))
    }
  }, [widgets, layoutLoaded])

  // Set Local Time and Overlap Session Logic
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now)
      
      const utcHour = now.getUTCHours()
      
      const isSydney = utcHour >= 22 || utcHour < 7
      const isTokyo = utcHour >= 0 && utcHour < 9
      const isLondon = utcHour >= 8 && utcHour < 17
      const isNY = utcHour >= 13 && utcHour < 22

      const activeCount = [isSydney, isTokyo, isLondon, isNY].filter(Boolean).length
      const isOverlap = activeCount > 1

      let sName = 'Interbank'
      let tz = 'UTC'

      if (isNY) { sName = 'New York'; tz = 'America/New_York' }
      else if (isLondon) { sName = 'London'; tz = 'Europe/London' }
      else if (isTokyo) { sName = 'Tokyo'; tz = 'Asia/Tokyo' }
      else if (isSydney) { sName = 'Sydney'; tz = 'Australia/Sydney' }

      setSessionInfo({
        name: sName,
        localTime: now.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isOverlap
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

      const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', user.id).order('added_to_today_at', { ascending: false })
      const activeSetups = setupsData?.filter(s => s.is_today) || []
      const vaultSetups = setupsData?.filter(s => !s.is_today) || []

      setTodaySetups(activeSetups.map(d => ({ id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url })))

      const now = new Date()
      const dayOfWeek = now.getDay() 
      const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const startOfWeek = new Date(now.setDate(diffToMonday))
      startOfWeek.setHours(0, 0, 0, 0)

      const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', user.id).gte('created_at', startOfWeek.toISOString())

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

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) setActiveTodayId(todaySetups[0].id)
    else if (todaySetups.length === 0) setActiveTodayId(null)
  }, [todaySetups, activeTodayId])

  // --- COLLISION ENGINE ---
  const checkOverlap = (rect1: Omit<Widget, 'id' | 'fontIdx'>, rect2: Omit<Widget, 'id' | 'fontIdx'>) => {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    )
  }

  // --- FLAWLESS PLAYGROUND DRAG & RESIZE LOGIC (7x7 GRID) ---

  const handleDragStart = (e: React.DragEvent, id: 'local' | 'session') => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('widgetId', id)
    setDraggingId(id)
    
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const cellW = rect.width / widgets[id].w
    const cellH = rect.height / widgets[id].h
    
    const offsetX = Math.floor((e.clientX - rect.left) / cellW)
    const offsetY = Math.floor((e.clientY - rect.top) / cellH)
    
    e.dataTransfer.setData('offsetX', offsetX.toString())
    e.dataTransfer.setData('offsetY', offsetY.toString())

    setTimeout(() => { target.style.opacity = '0.4' }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null)
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
  }

  const handleDropOnGrid = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggingId(null)
    
    const id = e.dataTransfer.getData('widgetId') as 'local' | 'session'
    if (!id || !widgets[id] || !gridRef.current) return

    const offsetX = parseInt(e.dataTransfer.getData('offsetX') || '0')
    const offsetY = parseInt(e.dataTransfer.getData('offsetY') || '0')

    const gridRect = gridRef.current.getBoundingClientRect()
    const cellW = gridRect.width / 7
    const cellH = gridRect.height / 7
    const dropCellX = Math.floor((e.clientX - gridRect.left) / cellW)
    const dropCellY = Math.floor((e.clientY - gridRect.top) / cellH)

    setWidgets(prev => {
      const w = prev[id].w
      const h = prev[id].h
      
      const finalX = dropCellX - offsetX
      const finalY = dropCellY - offsetY

      // Boundaries
      const safeX = Math.max(0, Math.min(finalX, 7 - w))
      const safeY = Math.max(0, Math.min(finalY, 7 - h))

      const proposedWidget = { ...prev[id], x: safeX, y: safeY }
      const otherId = id === 'local' ? 'session' : 'local'

      // COLLISION CHECK
      if (checkOverlap(proposedWidget, prev[otherId])) {
        return prev; 
      }

      return { ...prev, [id]: proposedWidget }
    })
  }

  const handleResizePointerDown = (e: React.PointerEvent, id: 'local' | 'session') => {
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId) 

    const startX = e.clientX
    const startY = e.clientY
    const startWidget = { ...widgets[id] }
    
    if (!gridRef.current) return
    const { width, height } = gridRef.current.getBoundingClientRect()
    const cellW = width / 7
    const cellH = height / 7

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      const deltaW = Math.round(dx / cellW)
      const deltaH = Math.round(dy / cellH)

      const newW = Math.max(1, Math.min(7 - startWidget.x, startWidget.w + deltaW))
      const newH = Math.max(1, Math.min(7 - startWidget.y, startWidget.h + deltaH))

      setWidgets(prev => {
        const proposedWidget = { ...prev[id], w: newW, h: newH }
        const otherId = id === 'local' ? 'session' : 'local'

        // COLLISION CHECK
        if (checkOverlap(proposedWidget, prev[otherId])) {
          return prev; 
        }

        return { ...prev, [id]: proposedWidget }
      })
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId)
      target.removeEventListener('pointermove', onPointerMove)
      target.removeEventListener('pointerup', onPointerUp)
    }

    target.addEventListener('pointermove', onPointerMove)
    target.addEventListener('pointerup', onPointerUp)
  }

  const toggleFont = (e: React.MouseEvent, id: 'local' | 'session') => {
    e.stopPropagation()
    setWidgets(prev => ({
      ...prev,
      [id]: { ...prev[id], fontIdx: (prev[id].fontIdx + 1) % fontStyles.length }
    }))
  }

  // --- RENDER HELPERS ---
  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  const todayName = weekProgress.find(d => d.isToday)?.day || 'Today'
  const pastDays = weekProgress.filter(d => d.isPast)

  const formatTime = (timeStr: string, fontIdx: number) => {
    if (!timeStr) return '--:--:--'
    const [timeStrOnly, period] = timeStr.split(' ')
    const parts = timeStrOnly?.split(':') || []
    
    return (
      <div 
        className={`flex items-baseline justify-center ${fontStyles[fontIdx]} select-none whitespace-nowrap tabular-nums leading-none`}
        style={{ fontSize: 'min(13cqi, 40cqb)' }}
      >
        {parts.map((p, i) => (
          <span key={i} className="flex items-baseline">
            <span>{p}</span>
            {i < 2 && <span className="opacity-20 font-sans font-light mx-[0.1em] text-[0.8em] relative -top-[0.05em]">:</span>}
          </span>
        ))}
        {period && <span className="ml-[0.2em] opacity-40 font-sans tracking-widest font-bold text-[0.3em] uppercase">{period}</span>}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        {isLoading || !layoutLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* 🟢 TOP ROW: 60% PLAYGROUND | 40% ROUTINE */}
            <div className="h-1/2 shrink-0 p-3 sm:p-4 flex gap-4 min-h-0 overflow-hidden">
              
              {/* 60% Workspace Playground (7x7 Grid) */}
              <div 
                ref={gridRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnGrid}
                className="w-[60%] shrink-0 min-h-0 grid grid-cols-7 grid-rows-7 gap-1.5 relative bg-[#050505] rounded-xl border border-zinc-800/20 p-2"
              >
                {/* Background Grid Lines */}
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={`slot-${i}`} className="w-full h-full rounded border border-dashed border-zinc-800/10 pointer-events-none" />
                ))}

                {/* Local Time Widget */}
                <div 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, 'local')}
                  onDragEnd={handleDragEnd}
                  className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md cursor-grab active:cursor-grabbing group overflow-hidden transition-all duration-200 z-10 ${draggingId === 'local' ? 'pointer-events-none' : ''}`}
                  style={{
                    gridColumn: `${widgets.local.x + 1} / span ${widgets.local.w}`,
                    gridRow: `${widgets.local.y + 1} / span ${widgets.local.h}`,
                    width: '100%', 
                    height: '100%'
                  }}
                >
                  <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
                      <Clock size={10} className="opacity-50"/> Local Time
                    </div>
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => toggleFont(e, 'local')}
                      className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
                      title="Cycle Typography"
                    >
                      <Type size={12} />
                    </button>
                  </div>
                  
                  <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-0 pointer-events-none" style={{ containerType: 'size' }}>
                    {mounted && time 
                      ? formatTime(time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }), widgets.local.fontIdx) 
                      : formatTime('--:--:--', widgets.local.fontIdx)}
                  </div>

                  <div 
                    draggable={false}
                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onPointerDown={(e) => handleResizePointerDown(e, 'local')}
                    className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
                  >
                    <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
                  </div>
                </div>

                {/* Active Session Widget */}
                <div 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, 'session')}
                  onDragEnd={handleDragEnd}
                  className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md cursor-grab active:cursor-grabbing group overflow-hidden transition-all duration-200 z-10 ${sessionInfo.isOverlap ? 'border-b-[3px] border-b-blue-500/50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]' : ''} ${draggingId === 'session' ? 'pointer-events-none' : ''}`}
                  style={{
                    gridColumn: `${widgets.session.x + 1} / span ${widgets.session.w}`,
                    gridRow: `${widgets.session.y + 1} / span ${widgets.session.h}`,
                    width: '100%', 
                    height: '100%'
                  }}
                >
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
                  
                  <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10 relative">
                    <div className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest flex items-center gap-1.5 select-none">
                      <Globe2 size={10} className="text-blue-500/80"/> {sessionInfo.name} Session
                    </div>
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => toggleFont(e, 'session')}
                      className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
                      title="Cycle Typography"
                    >
                      <Type size={12} />
                    </button>
                  </div>

                  <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-10 pointer-events-none" style={{ containerType: 'size' }}>
                    {formatTime(sessionInfo.localTime, widgets.session.fontIdx)}
                  </div>
                  
                  {sessionInfo.isOverlap && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
                  )}

                  <div 
                    draggable={false}
                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onPointerDown={(e) => handleResizePointerDown(e, 'session')}
                    className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
                  >
                    <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* 40% Routine Tracker (STRICTLY READ-ONLY) */}
              <div className="w-[40%] bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-5 flex flex-col shadow-sm min-h-0 shrink-0">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-800/50 pb-3 shrink-0">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={14} className="text-blue-500" /> Routine Tracker
                  </h3>
                </div>

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
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{day.day.substring(0,3)}</span>
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
                      <Target size={20
