'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Lock, Crown, Clock, Shield, Info, X, Activity, Bookmark, Pin, Star, Target, ZoomIn, ZoomOut, Menu, CheckCircle2, XCircle, Ban, Archive } from 'lucide-react'
import { PLAN_CONFIG, getAssetCategory } from '@/lib/platformConfig'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const getSetupAccess = (setup: any, userPlan: string) => {
  if (!setup) return { hasAccess: false, countdownText: '', isCategoryLocked: false };
  if (userPlan === 'pro' || userPlan === 'premium') return { hasAccess: true, countdownText: '', isCategoryLocked: false };
  const category = getAssetCategory(setup.asset_symbol);
  const isAllowedCategory = PLAN_CONFIG.free.allowedCategories.includes(category);
  if (!isAllowedCategory) return { hasAccess: false, countdownText: '', isCategoryLocked: true };
  if (setup.tier_access === 'free') return { hasAccess: true, countdownText: '', isCategoryLocked: false };
  const postTime = new Date(setup.created_at).getTime();
  const hoursSincePosted = (new Date().getTime() - postTime) / (1000 * 60 * 60);
  if (hoursSincePosted >= PLAN_CONFIG.free.delayHours) return { hasAccess: true, countdownText: '', isCategoryLocked: false };
  const hoursLeft = PLAN_CONFIG.free.delayHours - hoursSincePosted;
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainderHours = Math.floor(hoursLeft % 24);
  const countdownText = daysLeft > 0 ? `${daysLeft}d ${remainderHours}h` : `${remainderHours}h`;
  return { hasAccess: false, countdownText, isCategoryLocked: false };
}

const getTfWeight = (tf: string) => {
  const cleanTf = (tf || '').trim().toLowerCase();
  if (cleanTf === '1m' || cleanTf === '1min') return 1;
  if (cleanTf === '5m' || cleanTf === '5mins' || cleanTf === '5min') return 2;
  if (cleanTf === '15m' || cleanTf === '15mins' || cleanTf === '15min') return 3;
  if (cleanTf === '30m' || cleanTf === '30mins' || cleanTf === '30min') return 4;
  if (cleanTf === '1h' || cleanTf === '1hr' || cleanTf === 'h1') return 5;
  if (cleanTf === '2h' || cleanTf === '2hr' || cleanTf === 'h2') return 6;
  if (cleanTf === '4h' || cleanTf === '4hr' || cleanTf === 'h4') return 7;
  if (cleanTf === 'd' || cleanTf === '1d' || cleanTf === 'daily') return 8;
  if (cleanTf === 'w' || cleanTf === '1w' || cleanTf === 'weekly') return 9;
  if (cleanTf === 'm' || cleanTf === '1mo' || cleanTf === 'monthly') return 10;
  return 99; 
}

const BeforeAfterSlider = ({ before, after }: { before: string, after: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    let clientX = 0
    if ('touches' in e) clientX = e.touches[0].clientX
    else clientX = (e as React.MouseEvent).clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }
  return (
    <div className="relative overflow-hidden w-full h-[75%] md:max-w-full md:max-h-full aspect-video bg-[#000000] cursor-ew-resize touch-none select-none group shadow-2xl rounded-sm" onMouseMove={handleMove} onTouchMove={handleMove}>
      <img src={after} alt="After Analysis" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      <div className="absolute bottom-4 right-4 bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-3 py-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest rounded-sm z-0 shadow-lg">After</div>
      <div className="absolute inset-0 w-full h-full z-10 border-r border-blue-500/50 pointer-events-none" style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
        <img src={before} alt="Before Analysis" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        <div className="absolute bottom-4 left-4 bg-black/80 border border-neutral-700 backdrop-blur-md px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-widest rounded-sm shadow-lg">Before</div>
      </div>
      <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,1)]" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#000000] border border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.8)] group-hover:scale-110 transition-transform">
          <div className="flex gap-1.5"><div className="w-0.5 h-3 bg-blue-500 rounded-full"></div><div className="w-0.5 h-3 bg-blue-500 rounded-full"></div></div>
        </div>
      </div>
    </div>
  )
}

// 🚀 SWR FETCHER
const fetchViewportData = async ([key, asset]: string[]) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const [ { data: profile }, { data: vaultData }, { data: history } ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', session.user.id).single(),
    supabase.from('user_vault').select('analysis_id').eq('user_id', session.user.id),
    supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
  ])

  const formattedWatchlist = vaultData ? vaultData.map((v: any) => ({ id: v.analysis_id })) : []
  return { plan: profile?.plan?.toLowerCase() || 'free', history: history || [], watchlist: formattedWatchlist, userId: session.user.id }
}

export default function ViewportClient() {
  const router = useRouter()
  const searchParams = useSearchParams() 
  const asset = searchParams.get('asset')
  const tfParam = searchParams.get('tf')
  const fromParam = searchParams.get('from')

  useEffect(() => {
    if (!asset) router.push('/markets')
  }, [asset, router])

  const { data, isLoading } = useSWR(asset ? ['viewport_data', asset] : null, fetchViewportData, { dedupingInterval: 60000 })

  const [watchlist, setWatchlist] = useState<any[]>([])
  const [selectedTf, setSelectedTf] = useState<string>('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isPinching, setIsPinching] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const touchMode = useRef<'none' | 'pan' | 'pinch' | 'swipe-zoom'>('none')
  const pinchStartDist = useRef(0)
  const initialScale = useRef(1)
  const lastTouchTime = useRef(0)
  const swipeZoomStartY = useRef(0)
  const hasMovedSinceTap = useRef(false)

  let backPath = '/markets'
  if (fromParam === 'dashboard') backPath = '/dashboard'
  else if (fromParam === 'vault') backPath = '/vault'
  else if (fromParam === 'archive') backPath = `/markets/archive?asset=${asset}`

  useEffect(() => {
    if (data?.watchlist) setWatchlist(data.watchlist)
  }, [data])

  const allHistory = data?.history || []
  const userPlan = data?.plan || 'free'
  const userId = data?.userId

  const timeframes = useMemo(() => {
    const uniqueTfs = Array.from(new Set(allHistory.map(a => a.timeframe)))
    return uniqueTfs.sort((a, b) => getTfWeight(a) - getTfWeight(b))
  }, [allHistory])
  
  const filteredHistory = useMemo(() => allHistory.filter(a => a.timeframe === selectedTf), [allHistory, selectedTf])
  const currentSetup = filteredHistory[activeIndex]

  useEffect(() => {
    if (allHistory && allHistory.length > 0) {
      let targetTf = allHistory[0].timeframe;
      let targetIndex = 0;
      let targetSetup = allHistory[0];

      const requestedId = searchParams.get('id');

      if (requestedId) {
        const exactSetup = allHistory.find(d => d.id === requestedId);
        if (exactSetup) {
          targetTf = exactSetup.timeframe;
          targetSetup = exactSetup;
          const historyForTf = allHistory.filter(a => a.timeframe === targetTf);
          targetIndex = historyForTf.findIndex(a => a.id === requestedId);
          if (targetIndex === -1) targetIndex = 0;
        }
      } 
      else if (tfParam) {
        const requestedTfExists = allHistory.some(d => d.timeframe === tfParam);
        if (requestedTfExists) {
          targetTf = tfParam;
          targetSetup = allHistory.find(d => d.timeframe === targetTf);
        }
      }

      setSelectedTf(targetTf);
      setActiveIndex(targetIndex);

      if (userId && targetSetup) {
         const accessCheck = getSetupAccess(targetSetup, userPlan);
         if (!accessCheck.hasAccess) {
           supabase.from('activity_logs').insert([{ user_id: userId, action: 'PAYWALL_BUMP', asset_symbol: asset, timeframe: targetTf }]).then();
         }
      }
    }
  }, [allHistory, tfParam, userId, userPlan, asset, searchParams])

  useEffect(() => {
    if (allHistory && allHistory.length > 0) {
      allHistory.forEach(setup => {
        if (setup.image_url) { const img = new window.Image(); img.src = setup.image_url; }
        if (setup.after_image_url) { const imgAfter = new window.Image(); imgAfter.src = setup.after_image_url; }
      })
    }
  }, [allHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault(); 
        setActiveIndex(prev => {
          let nextIndex = prev;
          if (e.shiftKey) nextIndex = prev > 0 ? prev - 1 : filteredHistory.length - 1;
          else nextIndex = prev < filteredHistory.length - 1 ? prev + 1 : 0;
          if (nextIndex !== prev) {
            const targetSetup = filteredHistory[nextIndex];
            const accessCheck = getSetupAccess(targetSetup, userPlan);
            if (accessCheck.hasAccess) { setScale(1); setPos({ x: 0, y: 0 }); return nextIndex; }
          }
          return prev;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredHistory, userPlan]);

  const toggleBookmark = async (e: React.MouseEvent, setup: any) => {
    e.stopPropagation() 
    if (!setup || !userId) return
    const exists = watchlist.find(item => item.id === setup.id)
    let updated = [...watchlist]
    if (exists) {
      updated = updated.filter(item => item.id !== setup.id)
      setWatchlist(updated)
      await supabase.from('user_vault').delete().match({ user_id: userId, analysis_id: setup.id })
    } else {
      updated.unshift({ id: setup.id, symbol: setup.asset_symbol, timeframe: setup.timeframe }) 
      setWatchlist(updated)
      await supabase.from('user_vault').insert([{ user_id: userId, analysis_id: setup.id }])
    }
  }

  const handleWheel = (e: React.WheelEvent) => { if (currentSetup?.after_image_url) return; const zoomSensitivity = 0.0015; setScale(Math.min(Math.max(0.4, scale - e.deltaY * zoomSensitivity), 5)); }
  const handleMouseDown = (e: React.MouseEvent) => { if (currentSetup?.after_image_url) return; setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }); }
  const handleMouseMove = (e: React.MouseEvent) => { if (currentSetup?.after_image_url) return; if (isDragging) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }
  const handleMouseUp = () => setIsDragging(false)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentSetup?.after_image_url) return;
    if (e.touches.length === 2) {
      touchMode.current = 'pinch'
      setIsPinching(true)
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDist.current = Math.hypot(dx, dy)
      initialScale.current = scale
    } 
    else if (e.touches.length === 1) {
      const now = Date.now()
      hasMovedSinceTap.current = false
      if (now - lastTouchTime.current < 300) {
        touchMode.current = 'swipe-zoom'
        swipeZoomStartY.current = e.touches[0].clientY
        initialScale.current = scale
        setIsPinching(true) 
      } else {
        touchMode.current = 'pan'
        setIsDragging(true)
        setDragStart({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y })
      }
      lastTouchTime.current = now
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (currentSetup?.after_image_url) return;
    hasMovedSinceTap.current = true
    if (touchMode.current === 'pinch' && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.min(Math.max(0.4, initialScale.current * (dist / pinchStartDist.current)), 5)
      setScale(newScale)
    } 
    else if (touchMode.current === 'swipe-zoom' && e.touches.length === 1) {
      const deltaY = e.touches[0].clientY - swipeZoomStartY.current
      const zoomSensitivity = 0.005
      const newScale = Math.min(Math.max(0.4, initialScale.current + (deltaY * zoomSensitivity)), 5)
      setScale(newScale)
    } 
    else if (touchMode.current === 'pan' && e.touches.length === 1 && isDragging) {
      setPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
    }
  }

  const handleTouchEnd = () => {
    if (touchMode.current === 'swipe-zoom' && !hasMovedSinceTap.current) {
      if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }) } else { setScale(2.5) }
    }
    touchMode.current = 'none'
    setIsDragging(false)
    setIsPinching(false)
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.3, 5))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.3, 0.4))

  // 🚨 INSTANT SKELETON
  if (isLoading || !data) {
    return <div className="h-[100dvh] bg-[#000000] flex flex-col items-center justify-center text-white"><Activity size={32} className="text-neutral-700 animate-spin"/></div>
  }

  if (!currentSetup) return <div className="h-[100dvh] bg-[#000000] flex flex-col items-center justify-center text-white"><Star size={32} className="text-neutral-700 mb-4"/><span className="text-neutral-500 text-xs font-black uppercase tracking-widest">No data found for {asset}</span><button onClick={() => router.push(backPath)} className="mt-6 px-6 py-2 bg-[#111] hover:bg-white/5 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Go Back</button></div>

  const access = getSetupAccess(currentSetup, userPlan)
  const isCurrentBookmarked = watchlist.some(w => w.id === currentSetup.id)

  const status = (currentSetup.status || 'WAITING').toUpperCase()
  let statusStyle = "text-neutral-400 bg-neutral-900 border-neutral-700"
  let StatusIcon = Clock 

  if (status === 'ACTIVE') {
    statusStyle = "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
    StatusIcon = Activity
  } else if (status === 'WAITING') {
    statusStyle = "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
    StatusIcon = Clock
  } else if (status === 'DONE') {
    statusStyle = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
    StatusIcon = CheckCircle2
  } else if (status === 'INVALID') {
    statusStyle = "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
    StatusIcon = XCircle
  } else if (status === 'CANCELED') {
    statusStyle = "text-neutral-400 bg-neutral-700/30 border-neutral-500/50 shadow-[0_0_10px_rgba(163,163,163,0.1)]"
    StatusIcon = Ban
  } else if (status === 'ARCHIVED') {
    statusStyle = "text-neutral-500 bg-neutral-800/30 border-neutral-700/50 shadow-[0_0_10px_rgba(115,115,115,0.1)]"
    StatusIcon = Archive
  }

  return (
    <div className="fixed inset-0 bg-[#000000] flex overflow-hidden text-white select-none touch-none font-sans" style={{ height: '100dvh' }}>
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-center md:pl-16 md:pr-20 md:pt-20 md:pb-10 overflow-hidden ${access.hasAccess && !currentSetup.after_image_url ? (isDragging || isPinching ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
         onWheel={access.hasAccess ? handleWheel : undefined}
         onMouseDown={access.hasAccess ? handleMouseDown : undefined}
         onMouseMove={access.hasAccess ? handleMouseMove : undefined}
         onMouseUp={access.hasAccess ? handleMouseUp : undefined}
         onMouseLeave={access.hasAccess ? handleMouseUp : undefined}
         onTouchStart={access.hasAccess ? handleTouchStart : undefined}
         onTouchMove={access.hasAccess ? handleTouchMove : undefined}
         onTouchEnd={access.hasAccess ? handleTouchEnd : undefined}
         onTouchCancel={access.hasAccess ? handleTouchEnd : undefined}
       >
         {access.hasAccess ? (
           currentSetup.after_image_url && currentSetup.image_url ? (
             <div className="w-[95%] h-[75%] md:w-full md:h-full max-w-6xl flex items-center justify-center pointer-events-auto">
               <BeforeAfterSlider before={currentSetup.image_url} after={currentSetup.after_image_url} />
             </div>
           ) : (
             <img 
               src={currentSetup.image_url} 
               alt={asset || "Trading Analysis"}
               draggable={false}
               className="w-[95%] h-[75%] md:max-w-full md:max-h-full object-contain pointer-events-none"
               style={{ 
                 transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                 transition: (isDragging || isPinching) ? 'none' : 'transform 0.15s ease-out'
               }}
             />
           )
         ) : (
           <div className="w-[90%] md:w-full max-w-4xl aspect-video bg-[#000000] border border-neutral-800/50 rounded-3xl shadow-2xl" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }} />
         )}
       </div>

       {!access.hasAccess && (
         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
           <div className="w-full max-w-sm bg-[#000000]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden pointer-events-auto">
             <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none bg-blue-600/20"></div>
             <div className="w-12 h-12 md:w-14 md:h-14 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 relative z-10 shadow-lg">
                <Lock size={20} className="text-blue-500" />
             </div>
             <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase mb-2 relative z-10">Clearance Required</h2>
             
             {access.isCategoryLocked ? (
               <p className="text-[10px] md:text-[11px] font-medium text-neutral-400 mb-6 relative z-10 leading-relaxed">
                 The <span className="text-white font-bold">{currentSetup.timeframe}</span> setup for <span className="text-white font-bold">{asset}</span> belongs to a restricted asset class.
               </p>
             ) : (
               <>
                 <p className="text-[10px] md:text-[11px] font-medium text-neutral-400 mb-6 relative z-10 leading-relaxed">
                   The <span className="text-white font-bold">{currentSetup.timeframe}</span> setup for <span className="text-white font-bold">{asset}</span> is restricted. It will unlock for the Free tier in:
                 </p>
                 <div className="flex items-center justify-center space-x-2 bg-black border border-neutral-800 rounded-xl py-3 mb-5 md:mb-6 relative z-10">
                   <Clock size={14} className="text-neutral-500" />
                   <span className="text-xs md:text-sm font-black text-white tracking-widest">{access.countdownText}</span>
                 </div>
                 <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-5 md:mb-6 relative z-10">(You can still view older history via the history panel)</p>
               </>
             )}

             <div className="relative z-10 pt-5 border-t border-neutral-800">
               <button onClick={() => router.push('/account/subscription')} className="w-full py-3 md:py-3.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                 <Crown size={14} />
                 <span>Upgrade to Professional</span>
               </button>
             </div>
           </div>
         </div>
       )}

       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         <div className="absolute top-4 md:top-5 left-4 md:left-5 right-4 md:right-auto flex items-start justify-between md:justify-start pointer-events-none z-50">
           <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto">
             <button onClick={() => router.push(backPath)} className="w-10 h-10 md:w-12 md:h-12 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors shadow-lg shrink-0">
               <ArrowLeft size={16} />
             </button>            
             
             <div className="h-10 md:h-12 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 px-3 md:px-4 rounded-xl flex items-center space-x-2 md:space-x-3 shadow-lg shrink-0">
               <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">{asset}</span>
               <div className="w-px h-4 bg-neutral-800"></div>
               <div className={`flex items-center px-2 py-1 md:py-1.5 rounded-md border backdrop-blur-md ${statusStyle}`}>
                 <StatusIcon size={12} className="mr-1.5" />
                 <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">{status === 'ARCHIVED' ? 'OLD SETUP' : status}</span>
               </div>
               
               {(currentSetup.is_featured || currentSetup.is_prime) && <div className="w-px h-4 bg-neutral-800 hidden md:block"></div>}
               {currentSetup.is_featured && (
                 <>
                   <div className="hidden md:flex items-center px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]"><Star size={10} className="mr-1.5 fill-amber-500" /><span className="text-[9px] font-black uppercase tracking-widest">Featured</span></div>
                   <Star size={14} className="md:hidden text-amber-500 ml-1 fill-amber-500" />
                 </>
               )}
               {currentSetup.is_prime && (
                 <>
                   <div className="hidden md:flex items-center px-2 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]"><Target size={10} className="mr-1.5" /><span className="text-[9px] font-black uppercase tracking-widest">Prime</span></div>
                   <Target size={14} className="md:hidden text-blue-400 ml-1" />
                 </>
               )}
               <div className="w-px h-4 bg-neutral-800"></div>
               <button onClick={(e) => toggleBookmark(e, currentSetup)} className="text-neutral-500 hover:text-white transition-colors p-1"><Bookmark size={14} className={isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''} /></button>
               {access.hasAccess && (
                 <><div className="w-px h-4 bg-neutral-800"></div><button onClick={() => setShowInfo(true)} className="transition-colors w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"><Info size={16} /></button></>
               )}
             </div>
           </div>

           <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden w-10 h-10 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-lg pointer-events-auto shrink-0"><Menu size={16} /></button>
         </div>

         {showInfo && access.hasAccess && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
             <div className="w-full max-w-sm max-h-[70vh] flex flex-col bg-[#000000] border border-neutral-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
               <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0">
                 <h3 className="text-xs font-black text-white uppercase tracking-wider">{currentSetup.title || 'Analysis Notes'}</h3>
                 <button onClick={() => setShowInfo(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={16} /></button>
               </div>
               <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                 <p className="text-[11px] md:text-xs font-medium text-neutral-300 leading-relaxed whitespace-pre-wrap">{currentSetup.content || 'No additional thesis provided for this structural level.'}</p>
               </div>
               <div className="px-5 py-3 border-t border-neutral-900 bg-[#0d0d0d] flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500 shrink-0">
                 <Clock size={10} /><span>{new Date(currentSetup.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           </div>
         )}

         <div className="absolute bottom-6 md:bottom-auto md:top-5 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 p-1.5 rounded-xl md:rounded-2xl shadow-2xl pointer-events-auto z-40 flex items-center overflow-x-auto scrollbar-hide">
            {timeframes.map(t => {
              const isSelected = selectedTf === t
              return (
                <button key={t} onClick={async () => { setSelectedTf(t); setActiveIndex(0); setScale(1); setPos({x:0, y:0}); if (userId) supabase.from('activity_logs').insert([{ user_id: userId, action: 'VIEW_CHART', asset_symbol: asset, timeframe: t }]).then() }}
                  className={`flex items-center justify-center min-w-[48px] md:min-w-[60px] px-3 md:px-4 py-2 md:py-1.5 rounded-lg md:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${isSelected ? 'bg-white text-black shadow-md scale-105' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                >
                  {t}
                </button>
              )
            })}
         </div>

         {access.hasAccess && !currentSetup.after_image_url && (
           <div className="md:hidden absolute bottom-24 right-4 flex flex-col space-y-2 pointer-events-auto z-40">
             <button onClick={zoomIn} className="w-10 h-10 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white shadow-xl active:scale-95 transition-all"><ZoomIn size={16}/></button>
             <button onClick={zoomOut} className="w-10 h-10 bg-[#000000]/90 backdrop-blur-md border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white shadow-xl active:scale-95 transition-all"><ZoomOut size={16}/></button>
           </div>
         )}

         <div className={`absolute right-0 top-0 bottom-0 z-50 flex flex-col shadow-2xl transition-all duration-300 border-l border-neutral-800 pointer-events-auto ${isMobileSidebarOpen ? 'translate-x-0 w-64 bg-[#000000]/95 backdrop-blur-xl' : 'translate-x-full md:translate-x-0 w-64 md:w-12 md:hover:w-64 bg-[#000000]/95 md:bg-[#000000]/80 md:backdrop-blur-md group/sidebar'} ${isSidebarPinned ? 'md:w-64 md:bg-[#000000]/95' : ''}`}>
           <div className={`h-14 md:h-16 flex items-center border-b border-neutral-800 transition-all px-4 ${isSidebarPinned ? 'justify-between' : 'justify-between md:justify-center md:group-hover/sidebar:justify-between'}`}>
             <div className="flex items-center">
               <Clock size={14} className="text-neutral-400 shrink-0" />
               <span className={`text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap transition-all duration-300 ml-2 ${isSidebarPinned ? 'md:opacity-100 md:w-auto' : 'md:opacity-0 md:w-0 md:overflow-hidden md:group-hover/sidebar:w-auto md:group-hover/sidebar:opacity-100'}`}>Setup History</span>
             </div>
             <button onClick={() => setIsSidebarPinned(!isSidebarPinned)} className={`hidden md:block text-neutral-500 hover:text-white transition-colors ${isSidebarPinned ? 'block' : 'hidden group-hover/sidebar:block'}`}>{isSidebarPinned ? <X size={14} /> : <Pin size={14} />}</button>
             <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white p-1"><X size={18} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-1.5">
             {filteredHistory.map((item, idx) => {
               const historyAccess = getSetupAccess(item, userPlan)
               const isActive = activeIndex === idx
               const isItemBookmarked = watchlist.some(w => w.id === item.id)
               const itemStatus = (item.status || 'WAITING').toUpperCase()

               let activeBg = 'bg-white/10 border border-white/5'
               let dotClass = isActive ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-neutral-700'
               if (itemStatus === 'ACTIVE') { activeBg = 'bg-blue-500/10 border border-blue-500/20'; dotClass = isActive ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-blue-500/40'; }
               else if (itemStatus === 'WAITING') { activeBg = 'bg-amber-500/10 border border-amber-500/20'; dotClass = isActive ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-amber-500/40'; }
               else if (itemStatus === 'DONE') { activeBg = 'bg-emerald-500/10 border border-emerald-500/20'; dotClass = isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-500/40'; }

               return (
                 <button 
                   key={item.id}
                   onClick={() => { if(historyAccess.hasAccess) { setActiveIndex(idx); setScale(1); setPos({x:0, y:0}); if(window.innerWidth < 768) setIsMobileSidebarOpen(false); } }}
                   className={`w-full flex items-center h-12 md:h-10 rounded-xl md:rounded-lg transition-all relative px-3 ${isSidebarPinned ? 'md:justify-start' : 'md:justify-center md:group-hover/sidebar:justify-start'} ${isActive ? activeBg : 'hover:bg-white/5 border border-transparent'} ${!historyAccess.hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
                 >
                   <div className={`${isSidebarPinned ? 'md:hidden' : 'hidden md:block md:group-hover/sidebar:hidden shrink-0'}`}><div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} /></div>
                   <div className={`items-center justify-between w-full min-w-0 flex ${isSidebarPinned ? 'md:flex' : 'md:hidden md:group-hover/sidebar:flex'}`}>
                     <div className="flex flex-col items-start min-w-0 pr-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : 'text-neutral-400'}`}>{new Date(item.created_at).toLocaleDateString()}</span>
                       <span className="text-[8px] font-bold text-neutral-500">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center space-x-2 shrink-0">
                       {item.is_featured && <Star size={12} className="text-amber-500 fill-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />}
                       {item.is_prime && <Target size={12} className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" />}
                       {isItemBookmarked && <Bookmark size={12} className="fill-amber-500 text-amber-500" />}
                       {!historyAccess.hasAccess && <Lock size={12} className="text-neutral-500" />}
                     </div>
                   </div>
                 </button>
               )
             })}
           </div>
         </div>
       </div>
    </div>
  )
}
