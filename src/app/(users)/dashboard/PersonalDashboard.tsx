'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Activity, Lock, X, AlertTriangle, Type,
  ChevronLeft, ChevronRight, BookOpen, Maximize, Info, Terminal
} from 'lucide-react'

// --- DUMMY DATA FOR DEMO TIER ---
const DEMO_SETUPS = [
  {
    id: 'demo-1', symbol: 'BTCUSD', direction: 'LONG', playbook: 'Liquidity Sweep',
    notes: '<p><b>Macro:</b> Bullish market structure. Price swept Asian session lows.</p><p><b>Trigger:</b> Waiting for 15m CHoCH.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    isToday: true
  },
  {
    id: 'demo-2', symbol: 'EURUSD', direction: 'SHORT', playbook: 'Trend Continuation',
    notes: '<p>Standard premium supply mitigation. DXY is strong.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    isToday: true
  }
];

const DEMO_LOGS = [
  {
    id: 'log-1', symbol: 'GBPUSD', direction: 'SHORT', reason: '[Perfect Risk Management]',
    execution_type: 'Perfect', outcome: 'TP', rr: 2.5
  }
];

const fontStyles = [
  "font-mono font-black tracking-tighter text-zinc-100",   
  "font-sans font-extrabold tracking-tight text-white",    
  "font-serif font-light tracking-wide text-zinc-300",     
  "font-sans font-thin tracking-widest text-zinc-400"      
]

type Widget = { id: string, x: number, y: number, w: number, h: number, fontIdx: number }
const LAYOUT_STORAGE_KEY = 'operator_desk_playground_layout_v4'

// 🚨 GLOBAL SUPABASE CLIENT
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const sanitizeLayout = (data: any) => {
  if (!data || !data.local || !data.session) return null;
  return {
    local: { 
      id: 'local', 
      x: data.local.x ?? 0, 
      y: data.local.y ?? 0, 
      w: data.local.w ?? 3, 
      h: data.local.h ?? 3, 
      fontIdx: data.local.fontIdx ?? 0 
    },
    session: { 
      id: 'session', 
      x: data.session.x ?? 0, 
      y: data.session.y ?? 3, 
      w: data.session.w ?? 3, 
      h: data.session.h ?? 3, 
      fontIdx: data.session.fontIdx ?? 0 
    }
  }
}

// Helper for institutional ticker display
const formatTicker = (symbol: string) => {
  const cleanSymbol = (symbol || '').toUpperCase().trim()
  const isStandardPair = cleanSymbol.length === 6
  if (isStandardPair) {
    return <><span className="text-white">{cleanSymbol.substring(0,3)}</span><span className="text-neutral-500">{cleanSymbol.substring(3,6)}</span></>
  }
  return <span className="text-white">{cleanSymbol}</span>
}

export default function PersonalDashboard({ userId }: { userId?: string }) {
  const router = useRouter()
  
  const [isPro, setIsPro] = useState<boolean>(true); 
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [layoutLoaded, setLayoutLoaded] = useState(false)
  
  const [setups, setSetups] = useState<any[]>([])
  const [vaultSetupCount, setVaultSetupCount] = useState(0)
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null)
  
  const [weekProgress, setWeekProgress] = useState<any[]>([])
  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [pendingReconciliationsCount, setPendingReconciliationsCount] = useState(0)
  
  const [isTodayFocusExpanded, setIsTodayFocusExpanded] = useState(true)
  const [isMobileNotesOpen, setIsMobileNotesOpen] = useState(false)

  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT')

  const displayDirection = useCallback((dir: string | null | undefined) => {
    if (!dir) return 'N/A';
    if (terminology === 'BUY_SELL') return dir === 'LONG' ? 'BUY' : 'SELL';
    return dir;
  }, [terminology])

  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ 
    name: 'Determining...', 
    localTime: '--:--:--',
    isOverlap: false 
  })

  const [widgets, setWidgets] = useState<{local: Widget, session: Widget}>({
    local: { id: 'local', x: 0, y: 0, w: 3, h: 3, fontIdx: 0 },
    session: { id: 'session', x: 0, y: 3, w: 3, h: 3, fontIdx: 0 }
  })
  
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const [isPeeking, setIsPeeking] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [chartScale, setChartScale] = useState(1)
  const peekTimer = useRef<NodeJS.Timeout | null>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)

  // 🚨 ROBUST TIME ENGINE 
  const [timeOffset, setTimeOffset] = useState(0);
  const timeOffsetRef = useRef(0);
  
  const [userTimezone, setUserTimezone] = useState(
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  );

  const getTrueUTC = useCallback(() => new Date(Date.now() + timeOffset), [timeOffset]);
  
  const getBaseDate = useCallback(() => {
    const utc = getTrueUTC();
    return new Date(utc.toLocaleString('en-US', { timeZone: userTimezone }));
  }, [getTrueUTC, userTimezone]);

  const adjustDbToBase = useCallback((utcString: string) => {
    return new Date(new Date(utcString).toLocaleString('en-US', { timeZone: userTimezone }));
  }, [userTimezone]);
  
  const getBaseDateString = useCallback((timestamp: number) => {
    return new Date(new Date(timestamp).toLocaleString('en-US', { timeZone: userTimezone })).toDateString();
  }, [userTimezone]);

  const todaySetups = setups.filter(s => s.isToday)
  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  const pushesToday = setups.filter(s => s.addedToTodayAt && getBaseDateString(s.addedToTodayAt) === getBaseDate().toDateString()).length;
  
  const now = getBaseDate()
  const dayOfWeek = now.getDay() 
  const isWeekendNow = dayOfWeek === 6 || dayOfWeek === 0 
  const isPrepWindow = isWeekendNow || (dayOfWeek === 1 && (now.getHours() < 5 || (now.getHours() === 5 && now.getMinutes() < 30)));
  const isVaultLocked = !isPrepWindow || (isPrepWindow && pendingReconciliationsCount > 0);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { cache: 'no-store' });
        if (!res.ok) throw new Error('API Blocked');
        const data = await res.json();
        const trueUTC = new Date(data.dateTime + "Z").getTime();
        const offset = trueUTC - Date.now();
        setTimeOffset(offset);
        timeOffsetRef.current = offset;
      } catch (error) {
        setTimeOffset(0); 
        timeOffsetRef.current = 0;
      }
    };
    fetchTime();
  }, []);

  // LOAD LAYOUT
  useEffect(() => {
    const loadLayout = async () => {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout)
          const sanitized = sanitizeLayout(parsed)
          if (sanitized) {
            setWidgets(sanitized)
            setLayoutLoaded(true)
            return 
          }
        } catch (e) {}
      }

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.desk_layout) {
          const sanitized = sanitizeLayout(user.user_metadata.desk_layout)
          if (sanitized) {
            setWidgets(sanitized)
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(sanitized))
          }
        }
      } catch (e) {}

      setLayoutLoaded(true)
    }
    loadLayout()
  }, [])

  // SAVE LAYOUT
  useEffect(() => {
    if (!layoutLoaded) return;
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(widgets))

    if (!isPro) return;
    const timeoutId = setTimeout(async () => {
      try { await supabase.auth.updateUser({ data: { desk_layout: widgets } }) } catch (e) {}
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [widgets, layoutLoaded, isPro])

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      const currentLocal = new Date();
      setTime(currentLocal);
      
      const trueUTC = new Date(Date.now() + timeOffsetRef.current);
      const utcHour = trueUTC.getUTCHours();
      
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
        localTime: trueUTC.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isOverlap
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = useCallback(async (activeUser: any, isUserPro: boolean) => {
    
    if (!isUserPro) {
        const demoNow = Date.now();
        setSetups(DEMO_SETUPS.map(s => ({ ...s, addedToTodayAt: s.isToday ? demoNow - 100000 : null, createdAt: demoNow })));
        setVaultSetupCount(2);

        const progress = []
        const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        for (let i = 0; i < 5; i++) {
           progress.push({ day: daysFull[i], status: i < 2 ? 'perfect' : i === 2 ? 'current' : 'pending', isPast: i < 2, isToday: i === 2 })
        }
        setWeekProgress(progress)
        setTradesTakenToday(1)
        setPendingReconciliationsCount(0)
        setIsLoading(false)
        return;
    }

    const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', activeUser.id).order('added_to_today_at', { ascending: false })
    
    if (setupsData) {
      const todayStr = getBaseDate().toDateString();
      const expiredSetups = setupsData.filter(s => s.is_today && s.added_to_today_at && adjustDbToBase(s.added_to_today_at).toDateString() !== todayStr);
      
      if (expiredSetups.length > 0) {
        const expiredIds = expiredSetups.map(s => s.id);
        await supabase.from('user_desk_setups').update({ is_today: false, added_to_today_at: null }).in('id', expiredIds);
        expiredSetups.forEach(s => { s.is_today = false; s.added_to_today_at = null; });
      }
    }

    const parsedSetups = setupsData ? setupsData.map(d => ({ 
      id: d.id, symbol: d.symbol, direction: d.direction, playbook: d.playbook, notes: d.notes, imageUrl: d.image_url, 
      isToday: d.is_today, addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null
    })) : [];
    
    setSetups(parsedSetups);
    setVaultSetupCount(parsedSetups.length)

    const safeFetchDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', activeUser.id).gte('created_at', safeFetchDate)

    const initNow = getBaseDate();
    const initDayOfWeek = initNow.getDay();
    const initDiffToMon = initNow.getDate() - initDayOfWeek + (initDayOfWeek === 0 ? -6 : 1);
    const startOfWeekBase = new Date(initNow.getTime());
    startOfWeekBase.setDate(initDiffToMon);
    startOfWeekBase.setHours(0, 0, 0, 0);

    const progress = []
    const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    let todayTradeCount = 0;

    for (let i = 0; i < 5; i++) {
      const targetDate = new Date(startOfWeekBase)
      targetDate.setDate(startOfWeekBase.getDate() + i)
      const dateString = targetDate.toDateString()
      const todayString = getBaseDate().toDateString()
      
      const dayLogs = logsData?.filter(l => adjustDbToBase(l.created_at).toDateString() === dateString) || []

      let status = 'pending'
      let isPast = false
      let isToday = false
      
      if (dateString === todayString) {
        isToday = true
        todayTradeCount = dayLogs.length
        if (dayLogs.length > 0) {
          const hasImperfect = dayLogs.some(l => l.execution_type === 'Imperfect')
          status = hasImperfect ? 'imperfect' : 'perfect'
        } else {
          status = 'current'
        }
      } else if (targetDate.getTime() < getBaseDate().getTime() && dateString !== todayString) {
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
    setTradesTakenToday(todayTradeCount)

    const pendingReconciliations = logsData?.filter(l => !l.is_reconciled && l.outcome !== 'HOLD' && adjustDbToBase(l.created_at).getTime() >= startOfWeekBase.getTime()) || []
    setPendingReconciliationsCount(pendingReconciliations.length)

    setIsLoading(false)
  }, [getBaseDate, adjustDbToBase]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setIsLoading(false)
        return
      }
      setUser(session.user)

      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
      const isProUser = profile?.plan === 'pro' || profile?.plan === 'premium';
      setIsPro(isProUser);

      if (session.user.user_metadata?.desk_timezone) setUserTimezone(session.user.user_metadata.desk_timezone)
      if (session.user.user_metadata?.trade_terminology) setTerminology(session.user.user_metadata.trade_terminology)

      await loadDashboardData(session.user, isProUser)
    }
    init()
  }, [loadDashboardData])

  useEffect(() => {
    if (!user || !isPro) return;
    const channel = supabase.channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_desk_setups', filter: `user_id=eq.${user.id}` }, () => loadDashboardData(user, true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_desk_logs', filter: `user_id=eq.${user.id}` }, () => loadDashboardData(user, true))
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [user, loadDashboardData, isPro]);

  useEffect(() => {
    const checkMidnightWipe = setInterval(() => {
      const todayStr = getBaseDate().toDateString();
      const hasStaleSetups = setups.some(s => s.isToday && s.addedToTodayAt && getBaseDateString(s.addedToTodayAt) !== todayStr);
      if (hasStaleSetups) window.location.reload();
    }, 60000); 
    return () => clearInterval(checkMidnightWipe);
  }, [setups, getBaseDate, getBaseDateString]);

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
    }
  }, [todaySetups, activeTodayId])

  useEffect(() => {
    if (activeTodayId && transformRef.current) {
      transformRef.current.resetTransform();
      setChartScale(1);
    }
  }, [activeTodayId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (e.code === 'Escape') {
        e.preventDefault();
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') { target.blur(); }
        setIsFullScreen(false); setIsMobileNotesOpen(false);
        return; 
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') return;
      if (isMobileNotesOpen) return;

      if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setIsTodayFocusExpanded(prev => !prev); }
      if (e.code === 'KeyJ' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); router.push('/journal'); }
      if (e.code === 'KeyD' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); router.push('/desk'); }

      if (todaySetups.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault(); 
        const currentIndex = todaySetups.findIndex(s => s.id === activeTodayId);
        if (currentIndex === -1) return;
        if (e.shiftKey) {
          const prevIndex = (currentIndex - 1 + todaySetups.length) % todaySetups.length;
          setActiveTodayId(todaySetups[prevIndex].id);
        } else {
          const nextIndex = (currentIndex + 1) % todaySetups.length;
          setActiveTodayId(todaySetups[nextIndex].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todaySetups, activeTodayId, router, isMobileNotesOpen]);

  const handlePeekStart = () => { if (chartScale !== 1) return; peekTimer.current = setTimeout(() => setIsPeeking(true), 400); };
  const handlePeekEnd = () => { if (peekTimer.current) clearTimeout(peekTimer.current); setIsPeeking(false); };

  const checkOverlap = (rect1: Omit<Widget, 'id' | 'fontIdx'>, rect2: Omit<Widget, 'id' | 'fontIdx'>) => {
    return ( rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y )
  }

  const handleDragStart = (e: React.DragEvent, id: 'local' | 'session') => {
    if (!isPro) return;
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('widgetId', id)
    
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const cellW = rect.width / widgets[id].w
    const cellH = rect.height / widgets[id].h
    
    const offsetX = Math.floor((e.clientX - rect.left) / cellW)
    const offsetY = Math.floor((e.clientY - rect.top) / cellH)
    
    e.dataTransfer.setData('offsetX', offsetX.toString())
    e.dataTransfer.setData('offsetY', offsetY.toString())

    requestAnimationFrame(() => setDraggingId(id))
  }

  const handleDragEnd = (e: React.DragEvent) => setDraggingId(null)

  const handleDropOnGrid = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
      const safeX = Math.max(0, Math.min(finalX, 7 - w))
      const safeY = Math.max(0, Math.min(finalY, 7 - h))

      const proposedWidget = { ...prev[id], x: safeX, y: safeY }
      const otherId = id === 'local' ? 'session' : 'local'

      if (checkOverlap(proposedWidget, prev[otherId])) return prev; 
      return { ...prev, [id]: proposedWidget }
    })
  }

  const handleResizePointerDown = (e: React.PointerEvent, id: 'local' | 'session') => {
    if (!isPro) return;
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
        if (checkOverlap(proposedWidget, prev[otherId])) return prev; 
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
    if (!isPro) return;
    e.stopPropagation()
    setWidgets(prev => ({ ...prev, [id]: { ...prev[id], fontIdx: (prev[id].fontIdx + 1) % fontStyles.length } }))
  }

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

  // 🚨 TELEMETRY LOGIC
  const getDotForDay = (day: any) => {
    if (day.isToday) return pushesToday > 0 ? <span className="text-blue-400">●</span> : <span className="text-neutral-600 animate-pulse">○</span>;
    if (day.isPast) return (day.status === 'perfect' || day.status === 'imperfect') ? <span className="text-emerald-400">●</span> : <span className="text-red-500">○</span>;
    return <span className="text-neutral-600">·</span>;
  }

  const isKillZone = sessionInfo.name !== 'Interbank';

  return (
    <div className="flex h-[100dvh] w-full bg-[#000000] text-zinc-300 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative p-2 md:p-4 gap-2 md:gap-4 max-w-[100rem] mx-auto">
        {isLoading || !layoutLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 🚨 THE HORIZONTAL SYSTEM TELEMETRY BAR */}
            <div className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-sm p-3 shrink-0 flex items-center justify-between shadow-sm overflow-hidden z-20">
              <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar w-full">
                
                {/* 1. WEEKLY PREP */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><Terminal size={10} className="text-neutral-600" /> Macro Prep</span>
                  {vaultSetupCount > 0 ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">[ SECURED ]</span>
                  ) : isPrepWindow ? (
                    <span className="text-[10px] font-mono text-amber-500 font-bold animate-pulse">[ PENDING ]</span>
                  ) : (
                    <span className="text-[10px] font-mono text-red-500 font-bold">[ MISSING ]</span>
                  )}
                </div>

                <div className="w-px h-4 bg-white/[0.08] shrink-0"></div>

                {/* 2. DAILY FOCUS ARRAY */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><Crosshair size={10} className="text-neutral-600" /> Focus Array</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                    {weekProgress.length > 0 && (
                      <>
                        <span title={`Monday: ${weekProgress[0].status}`}>M:{getDotForDay(weekProgress[0])}</span>
                        <span title={`Tuesday: ${weekProgress[1].status}`}>T:{getDotForDay(weekProgress[1])}</span>
                        <span title={`Wednesday: ${weekProgress[2].status}`}>W:{getDotForDay(weekProgress[2])}</span>
                        <span title={`Thursday: ${weekProgress[3].status}`}>T:{getDotForDay(weekProgress[3])}</span>
                        <span title={`Friday: ${weekProgress[4].status}`}>F:{getDotForDay(weekProgress[4])}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-px h-4 bg-white/[0.08] shrink-0"></div>

                {/* 3. EXECUTION WINDOW (KILL ZONE) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><Activity size={10} className="text-neutral-600" /> Exec Window</span>
                  {isKillZone ? (
                    <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                      [ ZONE: {sessionInfo.name.toUpperCase()} ]
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-600 font-bold">[ OUT OF SESSION ]</span>
                  )}
                </div>

                <div className="w-px h-4 bg-white/[0.08] shrink-0"></div>

                {/* 4. SETTLEMENT QUEUE */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={10} className="text-neutral-600" /> Settlement</span>
                  {pendingReconciliationsCount === 0 ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">[ QUEUE CLEAR ]</span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-500 font-bold">[ {pendingReconciliationsCount} PENDING ]</span>
                  )}
                </div>

              </div>
            </div>

            {/* --- WORKSPACE BELOW TELEMETRY --- */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden gap-2 md:gap-4">

              {/* TOP SECTION: WIDGET GRID (Now Full Width) */}
              <div className="flex-1 min-h-[300px] shrink-0 relative">
                {!isPro && (
                  <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-sm flex items-center gap-1.5">
                    Sandbox Mode <Lock size={12} className="stroke-[3]" />
                  </div>
                )}

                <div 
                  ref={gridRef}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnGrid}
                  className="w-full h-full grid grid-cols-7 grid-rows-7 gap-1.5 relative bg-[#050505] rounded-sm border border-white/[0.04] p-2 shadow-inner"
                >
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={`slot-${i}`} className="w-full h-full rounded border border-dashed border-white/[0.02] pointer-events-none" />
                  ))}

                  {/* Local Time Widget */}
                  <div 
                    draggable={isPro} 
                    onDragStart={(e) => handleDragStart(e, 'local')}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnGrid}
                    className={`absolute bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.15] rounded-sm flex flex-col shadow-sm group overflow-hidden transition-all duration-200 z-10 ${draggingId === 'local' ? 'opacity-40 ring-1 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={{
                      gridColumn: `${widgets.local.x + 1} / span ${widgets.local.w}`,
                      gridRow: `${widgets.local.y + 1} / span ${widgets.local.h}`,
                      width: '100%', 
                      height: '100%'
                    }}
                  >
                    <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10">
                      <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
                        <Clock size={10} className="opacity-50"/> Local Time
                      </div>
                      {isPro && (
                        <button 
                          onPointerDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={(e) => toggleFont(e, 'local')}
                          className="text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-white/[0.05] hover:bg-white/[0.1] rounded-sm border border-white/[0.04]"
                          title="Cycle Typography"
                        >
                          <Type size={12} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-0 pointer-events-none" style={{ containerType: 'size' }}>
                      {mounted && time 
                        ? formatTime(time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }), widgets.local.fontIdx) 
                        : formatTime('--:--:--', widgets.local.fontIdx)}
                    </div>

                    {isPro && (
                      <div 
                        draggable={false}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onPointerDown={(e) => handleResizePointerDown(e, 'local')}
                        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
                      >
                        <div className="w-2.5 h-2.5 border-r border-b border-neutral-500 pointer-events-none" />
                      </div>
                    )}
                  </div>

                  {/* Session Widget */}
                  <div 
                    draggable={isPro} 
                    onDragStart={(e) => handleDragStart(e, 'session')}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnGrid}
                    className={`absolute bg-[#0a0a0a] border border-white/[0.08] hover:border-white/[0.15] rounded-sm flex flex-col shadow-sm group overflow-hidden transition-all duration-200 z-10 ${sessionInfo.isOverlap ? 'border-b-[2px] border-b-blue-500/50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]' : ''} ${draggingId === 'session' ? 'opacity-40 ring-1 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={{
                      gridColumn: `${widgets.session.x + 1} / span ${widgets.session.w}`,
                      gridRow: `${widgets.session.y + 1} / span ${widgets.session.h}`,
                      width: '100%', 
                      height: '100%'
                    }}
                  >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
                    
                    <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10 relative">
                          <div className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
                            <Globe2 size={10} className="text-blue-500/80"/> {sessionInfo.name} Session
                          </div>
                          {isPro && (
                            <button 
                              onPointerDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onClick={(e) => toggleFont(e, 'session')}
                              className="text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-white/[0.05] hover:bg-white/[0.1] rounded-sm border border-white/[0.04]"
                              title="Cycle Typography"
                            >
                              <Type size={12} />
                            </button>
                          )}
                    </div>

                    <div className="flex-1 w-full flex justify-center items-center px-4 pb-2 min-h-0 overflow-hidden relative z-10 pointer-events-none" style={{ containerType: 'size' }}>
                          {formatTime(sessionInfo.localTime, widgets.session.fontIdx)}
                    </div>
                        
                    {sessionInfo.isOverlap && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
                    )}

                    {isPro && (
                      <div 
                        draggable={false}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onPointerDown={(e) => handleResizePointerDown(e, 'session')}
                        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-2.5 touch-none"
                      >
                        <div className="w-2.5 h-2.5 border-r border-b border-neutral-500 pointer-events-none" />
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* BOTTOM SECTION: ACTIVE FOCUS (Maintained sleek aesthetic) */}
              <div className={`flex shrink-0 flex-col border border-white/[0.08] bg-[#0a0a0a] min-h-0 transition-all duration-300 ease-in-out shadow-2xl rounded-sm ${isTodayFocusExpanded ? 'w-full h-1/2' : 'w-48 xl:w-56 h-1/2'}`}>
                  
                <div className="h-10 border-b border-white/[0.08] flex items-center justify-between px-3 sm:px-4 shrink-0 bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Crosshair size={14} className="text-white opacity-70 shrink-0" />
                    <h2 className="text-[11px] font-bold text-white uppercase tracking-widest truncate">
                      {isTodayFocusExpanded ? "Active Focus" : "Focus"} 
                      {isTodayFocusExpanded && <span className="font-mono text-[9px] text-neutral-600 ml-1.5 opacity-70">[A]</span>}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {isTodayFocusExpanded && (
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:block bg-white/[0.03] px-2 py-0.5 rounded-sm border border-white/[0.04]">
                        {todaySetups.length} Pairs Locked
                      </span>
                    )}
                    <button 
                      onClick={() => setIsTodayFocusExpanded(!isTodayFocusExpanded)}
                      className="text-neutral-500 hover:text-white transition-colors p-1"
                      title={isTodayFocusExpanded ? "Collapse Focus Workspace [A]" : "Expand Focus Workspace [A]"}
                    >
                      {isTodayFocusExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
                      
                  <div className={`shrink-0 flex flex-col bg-[#050505] overflow-y-auto custom-scrollbar p-2 gap-1.5 ${isTodayFocusExpanded ? 'w-48 xl:w-56 border-r border-white/[0.08]' : 'w-full'}`}>
                    {todaySetups.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-center p-4">
                        <Target size={20} className="mb-2 opacity-50 stroke-1" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">No Pairs Active</span>
                      </div>
                    ) : (
                      todaySetups.map(setup => {
                        return (
                          <div 
                            key={`today-${setup.id}`}
                            onClick={() => setActiveTodayId(setup.id)}
                            className={`p-3 rounded-sm border flex flex-col cursor-pointer transition-all group shadow-sm ${
                              activeTodayId === setup.id 
                                ? 'bg-[#181818] border-white/[0.2]' 
                                : 'bg-[#0a0a0a] border-white/[0.04] hover:bg-[#121212] hover:border-white/[0.1]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[13px] font-mono font-bold tracking-tight ${activeTodayId === setup.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                                {formatTicker(setup.symbol)}
                              </span>
                              {activeTodayId === setup.id && (
                                <button onClick={(e) => { e.stopPropagation(); setIsMobileNotesOpen(true); }} className="lg:hidden p-1 rounded hover:bg-white/[0.1] text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title="View Notes">
                                  <Info size={14} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${setup.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : setup.direction === 'SHORT' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/[0.04] text-neutral-500 bg-white/[0.02]'}`}>
                                {displayDirection(setup.direction)}
                              </span>
                              {setup.playbook && <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase truncate">{setup.playbook}</span>}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className={`flex flex-row min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isTodayFocusExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
                        
                    <div 
                      className="flex-1 flex flex-col min-w-0 bg-[#000000] relative border-r border-white/[0.08] group overflow-hidden shadow-inner"
                      onMouseDown={handlePeekStart}
                      onMouseUp={handlePeekEnd}
                      onMouseLeave={handlePeekEnd}
                      onTouchStart={handlePeekStart}
                      onTouchEnd={handlePeekEnd}
                    >
                      {activeSetup?.imageUrl ? (
                        <>
                          <TransformWrapper
                            key={activeSetup.id}
                            initialScale={1}
                            minScale={0.5}
                            maxScale={10}
                            centerOnInit={true}
                            wheel={{ step: 0.1 }}
                            doubleClick={{ mode: 'reset' }}
                            panning={{ disabled: false }}
                            pinch={{ step: 5 }}
                            onTransformed={(ref) => setChartScale(ref.state.scale)}
                            ref={transformRef}
                          >
                            <TransformComponent wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                src={activeSetup.imageUrl} 
                                alt={`${activeSetup.symbol} Chart`}
                                loading="eager"
                                decoding="async" 
                                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing pointer-events-auto" 
                                draggable={false} 
                              />
                            </TransformComponent>
                          </TransformWrapper>

                          {chartScale !== 1 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }}
                              className="absolute bottom-4 right-4 z-10 p-2.5 bg-[#0a0a0a]/80 hover:bg-[#0a0a0a] text-white rounded-sm transition-all backdrop-blur-md border border-white/[0.1] shadow-xl opacity-0 group-hover:opacity-100"
                              title="View Full Screen"
                            >
                              <Maximize size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-600 min-h-0">
                          <span className="text-[10px] font-mono uppercase tracking-widest whitespace-nowrap">Select a pair to view</span>
                        </div>
                      )}
                    </div>

                    <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 p-3 bg-[#050505]">
                      <div className="flex-1 bg-[#121212] border border-white/[0.08] rounded-sm p-4 shadow-sm flex flex-col min-h-0">
                        {activeSetup ? (
                          <div 
                            className="w-full h-full overflow-y-auto custom-scrollbar text-[11px] text-neutral-300 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-neutral-600 italic">No notes logged.</p>' }} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-center">
                            <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest whitespace-nowrap">No active notes</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* 🚨 Mobile Notes Overlay */}
      {isMobileNotesOpen && activeSetup && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-[#000000]/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setIsMobileNotesOpen(false)}>
          <div className="w-full h-[50vh] bg-[#0a0a0a] border-t border-white/[0.08] rounded-t-sm shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/[0.08] flex justify-between items-center bg-[#0a0a0a] rounded-t-sm">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-white opacity-70" />{formatTicker(activeSetup.symbol)} Thesis</h3>
              <button onClick={() => setIsMobileNotesOpen(false)} className="text-neutral-500 hover:text-white p-1"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-[11px] text-neutral-300 leading-relaxed font-sans bg-[#050505]">
                <div dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-neutral-600 italic">No notes logged.</p>' }} />
            </div>
          </div>
        </div>
      )}

      {/* 🚨 Full Screen Chart Overlays */}
      {(isPeeking || isFullScreen) && activeSetup?.imageUrl && (
        <div 
          className={`fixed inset-0 z-[9999] bg-[#000000]/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150 ${isFullScreen ? 'cursor-pointer' : 'pointer-events-none'}`}
          onClick={() => { if (isFullScreen) setIsFullScreen(false); }}
        >
          <img src={activeSetup.imageUrl} alt="Peek" loading="eager" decoding="async" className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" />
        </div>
      )}
    </div>
  )
}
