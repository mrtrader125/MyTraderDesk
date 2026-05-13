'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { 
  Crosshair, CheckCircle2, Clock, 
  Target, Globe2, Activity, Lock, X, AlertTriangle, Type,
  ChevronLeft, ChevronRight, BookOpen, Maximize, Info
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
  
  const pastDays = weekProgress.filter(d => d.isPast || d.isToday)

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

  // 🚨 THE FIX: Read from Local Storage First (0ms speed), then sync from Supabase if empty
  useEffect(() => {
    const loadLayout = async () => {
      // 1. FASTEST: Read from the user's device memory first
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout)
          const sanitized = sanitizeLayout(parsed)
          if (sanitized) {
            setWidgets(sanitized)
            setLayoutLoaded(true)
            return // Exit instantly! The layout is loaded in 0ms.
          }
        } catch (e) {}
      }

      // 2. FALLBACK: Read from Supabase (Only happens if they login on a new device)
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

  // 🚨 THE FIX: Instant save to device, quiet backup to cloud
  useEffect(() => {
    if (!layoutLoaded) return;
    
    // Instantly save to local storage (immune to unmounting)
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(widgets))

    // Backup to cloud in background
    if (!isPro) return;
    const timeoutId = setTimeout(async () => {
      try {
        await supabase.auth.updateUser({ data: { desk_layout: widgets } })
      } catch (e) {}
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
    
    // INJECT MOCK DATA FOR DEMO USERS
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
      id: d.id, 
      symbol: d.symbol, 
      direction: d.direction, 
      playbook: d.playbook, 
      notes: d.notes, 
      imageUrl: d.image_url, 
      isToday: d.is_today, 
      addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', session.user.id)
        .single();

      const isProUser = profile?.plan === 'pro' || profile?.plan === 'premium';
      setIsPro(isProUser);

      if (session.user.user_metadata?.desk_timezone) {
        setUserTimezone(session.user.user_metadata.desk_timezone)
      }

      if (session.user.user_metadata?.trade_terminology) {
        setTerminology(session.user.user_metadata.trade_terminology)
      }

      await loadDashboardData(session.user, isProUser)
    }

    init()
  }, [loadDashboardData])

  useEffect(() => {
    if (!user || !isPro) return;

    const channel = supabase.channel('dashboard-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_desk_setups', filter: `user_id=eq.${user.id}` },
        () => loadDashboardData(user, true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_desk_logs', filter: `user_id=eq.${user.id}` },
        () => loadDashboardData(user, true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user, loadDashboardData, isPro]);

  useEffect(() => {
    const checkMidnightWipe = setInterval(() => {
      const todayStr = getBaseDate().toDateString();
      const hasStaleSetups = setups.some(s => s.isToday && s.addedToTodayAt && getBaseDateString(s.addedToTodayAt) !== todayStr);
      
      if (hasStaleSetups) {
        window.location.reload();
      }
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
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') {
          target.blur();
        }
        setIsFullScreen(false);
        setIsMobileNotesOpen(false);
        return; 
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') return;
      if (isMobileNotesOpen) return;

      if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsTodayFocusExpanded(prev => !prev);
      }

      if (e.code === 'KeyJ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push('/journal');
      }

      if (e.code === 'KeyD' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push('/desk');
      }

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


  const handlePeekStart = () => {
    if (chartScale !== 1) return; 
    peekTimer.current = setTimeout(() => setIsPeeking(true), 400);
  };

  const handlePeekEnd = () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    setIsPeeking(false);
  };

  const checkOverlap = (rect1: Omit<Widget, 'id' | 'fontIdx'>, rect2: Omit<Widget, 'id' | 'fontIdx'>) => {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    )
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

    requestAnimationFrame(() => {
      setDraggingId(id)
    })
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null)
  }

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
    setWidgets(prev => ({
      ...prev,
      [id]: { ...prev[id], fontIdx: (prev[id].fontIdx + 1) % fontStyles.length }
    }))
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


  return (
    <div className="flex h-full w-full bg-[#030303] text-zinc-300 font-sans overflow-y-auto lg:overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        {isLoading || !layoutLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* --- TOP SECTION --- */}
            <div className="flex flex-col lg:flex-row h-full lg:h-1/2 shrink-0 p-3 sm:p-4 gap-4 min-h-0 overflow-y-auto lg:overflow-hidden relative">
              
              {!isPro && (
                <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">
                  Sandbox Mode <Lock size={12} className="stroke-[3]" />
                </div>
              )}

              {/* --- WIDGET GRID --- */}
              <div 
                ref={gridRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnGrid}
                className="order-2 lg:order-1 w-full lg:w-[60%] shrink-0 min-h-[300px] lg:min-h-0 grid grid-cols-7 grid-rows-7 gap-1.5 relative bg-[#0a0a0a] rounded-xl border border-zinc-800/20 p-2"
              >
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={`slot-${i}`} className="w-full h-full rounded border border-dashed border-zinc-800/10 pointer-events-none" />
                ))}

                {/* Local Time Widget */}
                <div 
                  draggable={isPro} 
                  onDragStart={(e) => handleDragStart(e, 'local')}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnGrid}
                  className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md group overflow-hidden transition-all duration-200 z-10 ${draggingId === 'local' ? 'opacity-40 ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  style={{
                    gridColumn: `${widgets.local.x + 1} / span ${widgets.local.w}`,
                    gridRow: `${widgets.local.y + 1} / span ${widgets.local.h}`,
                    width: '100%', 
                    height: '100%'
                  }}
                >
                  <div className="flex items-center justify-between w-full shrink-0 pt-3 px-4 z-10">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 select-none pointer-events-none">
                      <Clock size={10} className="opacity-50"/> Local Time
                    </div>
                    {isPro && (
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={(e) => toggleFont(e, 'local')}
                        className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
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
                      <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
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
                  className={`absolute bg-[#0a0a0a] border border-zinc-800/50 hover:border-zinc-700 rounded-lg flex flex-col shadow-md group overflow-hidden transition-all duration-200 z-10 ${sessionInfo.isOverlap ? 'border-b-[3px] border-b-blue-500/50 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)]' : ''} ${draggingId === 'session' ? 'opacity-40 ring-2 ring-blue-500/50 scale-[1.02] shadow-2xl z-50' : ''} ${isPro ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
                            className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 rounded"
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
                      <div className="w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-zinc-500 rounded-[1px] pointer-events-none" />
                    </div>
                  )}
                </div>

              </div>

              {/* --- ROUTINE TRACKER --- */}
              <div className="order-1 lg:order-2 w-full lg:w-[40%] bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-5 flex flex-col shadow-sm min-h-0 shrink-0 relative">
                    
                {/* Quick Nav Hints */}
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
                      
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-[13px] top-2 bottom-6 w-px bg-zinc-800/60 z-0" />

                  {/* Phase 1: Macro Prep */}
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

                  {/* Phase 2: Today Filtering */}
                  <div className="flex items-start gap-4 relative z-10 mb-6">
                    <div className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 bg-[#0a0a0a] ${
                      pushesToday > 0 && pushesToday <= 5 ? 'border-emerald-500 text-emerald-400' : 
                      pushesToday > 5 ? 'border-red-500 text-red-400' :
                      'border-blue-500/50 text-transparent'
                    }`}>
                      {pushesToday > 0 && pushesToday <= 5 ? <CheckCircle2 size={12} /> : 
                        pushesToday > 5 ? <AlertTriangle size={10} /> :
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold tracking-wide ${pushesToday > 0 && pushesToday <= 5 ? 'text-zinc-500' : 'text-zinc-200'}`}>
                        Daily Sniper Routine
                      </span>
                      {pushesToday > 5 ? (
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest mt-0.5">RULE BREAK: Max 5 Allowed</span>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Staged: {pushesToday}/5 Pairs</span>
                      )}
                    </div>
                  </div>

                  {/* Phase 3 & 4: Discipline Chain & Hard Stop */}
                  <div className="flex items-start gap-4 relative z-10 mb-6">
                    <div className="flex flex-col items-center mt-0.5 shrink-0 bg-[#0a0a0a] py-1">
                      {pastDays.map((day, i) => (
                          <div key={day.day} className="flex flex-col items-center">
                            <div 
                              className={`w-2.5 h-2.5 rounded-full ${
                                day.status === 'perfect' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                                day.status === 'imperfect' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                                'bg-zinc-800'
                              }`} 
                              title={day.day} 
                            />
                            {i < pastDays.length - 1 && (
                              <div className={`w-px h-3 ${day.status === 'imperfect' ? 'bg-red-500/50' : 'bg-zinc-700'}`} />
                            )}
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
                        <span className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1.5 px-2 py-1 bg-red-500/10 rounded border border-red-500/20 inline-block w-fit">
                          HARD STOP ACTIVE: CLOSE TERMINAL
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Pre-Outcome Mentality Log</span>
                      )}
                    </div>
                  </div>

                  {/* Phase 5: Weekend Windup */}
                  <div className={`flex items-start gap-4 relative z-10 ${!isWeekendNow ? 'opacity-40 grayscale' : ''}`}>
                    <div className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 bg-[#0a0a0a] ${
                      isWeekendNow && pendingReconciliationsCount === 0 && tradesTakenToday > 0 ? 'border-emerald-500 text-emerald-400' : 'border-zinc-700 text-transparent'
                    }`}>
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
            </div>

            {/* --- BOTTOM SECTION: ACTIVE FOCUS --- */}
            <div className={`hidden lg:flex shrink-0 flex-col border-t border-zinc-800/60 bg-[#080808] min-h-0 transition-all duration-300 ease-in-out ${isTodayFocusExpanded ? 'w-full h-1/2' : 'w-48 xl:w-56 border-r border-zinc-800/60 h-1/2'}`}>
                  
              <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-[#0a0a0a]">
                <div className="flex items-center gap-2 min-w-0">
                  <Crosshair size={14} className="text-blue-500 shrink-0" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest truncate">
                    {isTodayFocusExpanded ? "Active Focus" : "Focus"} 
                    {isTodayFocusExpanded && <span className="font-mono text-[9px] text-zinc-500 ml-1.5 opacity-70">[A]</span>}
                  </h2>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {isTodayFocusExpanded && (
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
                      {todaySetups.length} Pairs Locked
                    </span>
                  )}
                  <button 
                    onClick={() => setIsTodayFocusExpanded(!isTodayFocusExpanded)}
                    className="text-zinc-500 hover:text-white transition-colors p-1"
                    title={isTodayFocusExpanded ? "Collapse Focus Workspace [A]" : "Expand Focus Workspace [A]"}
                  >
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
                    todaySetups.map(setup => {
                      return (
                        <div 
                          key={`today-${setup.id}`}
                          onClick={() => setActiveTodayId(setup.id)}
                          className={`p-3 rounded-lg border flex flex-col cursor-pointer transition-all group ${
                            activeTodayId === setup.id 
                              ? 'bg-zinc-800 border-zinc-600 shadow-sm' 
                              : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                              {setup.symbol}
                            </span>
                            {activeTodayId === setup.id && (
                              <button onClick={(e) => { e.stopPropagation(); setIsMobileNotesOpen(true); }} className="lg:hidden p-1 rounded hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" title="View Notes">
                                <Info size={14} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${setup.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : setup.direction === 'SHORT' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>
                              {displayDirection(setup.direction)}
                            </span>
                            {setup.playbook && <span className="text-[9px] text-zinc-500 font-bold uppercase truncate">{setup.playbook}</span>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className={`flex flex-row min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${isTodayFocusExpanded ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
                      
                  <div 
                    className="flex-1 flex flex-col min-w-0 bg-[#030303] relative border-r border-zinc-800/60 group overflow-hidden"
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
                          onTransformed={(ref) => setChartScale(ref.state.scale)}
                          ref={transformRef}
                        >
                          <TransformComponent wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                              src={activeSetup.imageUrl} 
                              alt={`${activeSetup.symbol} Chart`}
                              loading="eager"
                              decoding="async" 
                              className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto" 
                              draggable={false} 
                            />
                          </TransformComponent>
                        </TransformWrapper>

                        {chartScale !== 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }}
                            className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100"
                            title="View Full Screen"
                          >
                            <Maximize size={16} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-zinc-700 min-h-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Select a pair to view</span>
                      </div>
                    )}
                  </div>

                  <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 p-3 bg-[#030303]">
                    <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 shadow-sm flex flex-col min-h-0">
                      {activeSetup ? (
                        <div 
                          className="w-full h-full overflow-y-auto custom-scrollbar text-xs text-zinc-300 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-zinc-600 italic">No notes logged.</p>' }} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-center">
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest whitespace-nowrap">No active notes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚨 Mobile Notes Overlay */}
      {isMobileNotesOpen && activeSetup && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setIsMobileNotesOpen(false)}>
          <div className="w-full h-[50vh] bg-zinc-950 border-t border-zinc-800 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-900/40 rounded-t-2xl">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-blue-500" />{activeSetup.symbol} Thesis</h3>
              <button onClick={() => setIsMobileNotesOpen(false)} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-sm text-zinc-300 leading-relaxed font-medium">
                <div dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-zinc-600 italic">No notes logged.</p>' }} />
            </div>
          </div>
        </div>
      )}

      {/* 🚨 Full Screen Chart Overlays */}
      {(isPeeking || isFullScreen) && activeSetup?.imageUrl && (
        <div 
          className={`fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150 ${isFullScreen ? 'cursor-pointer' : 'pointer-events-none'}`}
          onClick={() => { if (isFullScreen) setIsFullScreen(false); }}
        >
          <img src={activeSetup.imageUrl} alt="Peek" loading="eager" decoding="async" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}
