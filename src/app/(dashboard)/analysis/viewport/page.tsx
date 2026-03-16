'use client'
import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Crown, ChevronRight, Clock, Shield, Info, X } from 'lucide-react'

// System Configuration
const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']
const PLAN_LEVELS: Record<string, number> = { 'FREE': 0, 'ESSENTIAL': 1, 'PRO': 2 }

function ViewportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState(true)

  // Viewport Engine States
  const [selectedTf, setSelectedTf] = useState<string>('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  
  // Physics States
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!asset) return router.push('/analysis')

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toUpperCase())
      }

      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('asset_symbol', asset)
        .order('created_at', { ascending: false })
        
      if (data && data.length > 0) {
        setAllHistory(data)
        setSelectedTf(data[0].timeframe)
      }
      setLoading(false)
    }
    loadData()
  }, [asset, router])

  const timeframes = useMemo(() => Array.from(new Set(allHistory.map(a => a.timeframe))), [allHistory])
  const filteredHistory = useMemo(() => allHistory.filter(a => a.timeframe === selectedTf), [allHistory, selectedTf])
  const currentSetup = filteredHistory[activeIndex]

  // Physics Handlers
  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.0015
    const newScale = Math.min(Math.max(0.4, scale - e.deltaY * zoomSensitivity), 5)
    setScale(newScale)
  }
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => setIsDragging(false)

  if (loading) return <div className="h-screen bg-app-bg transition-colors duration-700 flex items-center justify-center text-neutral-500 text-[11px] font-medium tracking-widest uppercase relative z-50">Initializing Terminal...</div>
  if (!currentSetup) return <div className="h-screen bg-app-bg transition-colors duration-700 flex items-center justify-center text-white relative z-50">No data found for {asset}</div>

  // --- BULLETPROOF RULES ENGINE ---
  const isCore = CORE_ASSETS.includes(asset || '')
  const tf = currentSetup.timeframe || ''
  const lowerTf = tf.toLowerCase().replace(/\s+/g, '') 
  const isScalp = lowerTf.includes('5m') || lowerTf.includes('15m')
  const isFastDelay = isScalp || lowerTf.includes('1h') || lowerTf.includes('h1')

  const createdTime = new Date(currentSetup.created_at).getTime()
  const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60)

  const requiredDelayHours = isFastDelay ? 24 : 168
  const isTimeUnlocked = ageInHours >= requiredDelayHours
  const requiredTier = (!isCore || isScalp) ? 'PRO' : 'ESSENTIAL'

  let hasAccess = false
  if (userPlan === 'PRO') hasAccess = true
  else if (userPlan === 'ESSENTIAL' && requiredTier === 'ESSENTIAL') hasAccess = true
  else if (isTimeUnlocked) hasAccess = true

  const hoursLeft = Math.max(0, requiredDelayHours - ageInHours)
  const daysLeft = Math.floor(hoursLeft / 24)
  const remainingHours = Math.floor(hoursLeft % 24)
  const remainingMins = Math.floor((hoursLeft * 60) % 60)
  const countdownText = daysLeft > 0 ? `${daysLeft}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`

  return (
    <div className="fixed inset-0 bg-app-bg transition-colors duration-700 flex overflow-hidden text-white select-none touch-none">
       
       {/* --- LAYER 1: BOTTOM CANVAS (PHYSICS ENGINE) --- */}
       {/* Added p-24 md:p-36 to force the image to be much smaller initially */}
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-center p-24 md:p-40 ${hasAccess ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
         onWheel={hasAccess ? handleWheel : undefined}
         onMouseDown={hasAccess ? handleMouseDown : undefined}
         onMouseMove={hasAccess ? handleMouseMove : undefined}
         onMouseUp={hasAccess ? handleMouseUp : undefined}
         onMouseLeave={hasAccess ? handleMouseUp : undefined}
       >
         <img 
           src={currentSetup.image_url} 
           alt={asset || "Trading Analysis"}
           draggable={false}
           className="w-full h-full object-contain pointer-events-none"
           style={{ 
             transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
             transition: isDragging ? 'none' : 'transform 0.1s ease-out',
             filter: hasAccess ? 'none' : 'blur(15px) grayscale(50%) opacity(30%)'
           }} 
         />
       </div>

       {/* --- LAYER 2: TOP UI (MENUS & OVERLAYS) --- */}
       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         
         {/* TOP HEADER */}
         <div className="absolute top-6 left-6 flex flex-col items-start space-y-2 pointer-events-none z-50">
           <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/analysis')} 
                className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-3 shadow-xl pointer-events-auto">
                <span className="text-lg font-semibold">{asset}</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-500/20">{currentSetup.timeframe}</span>
                
                {hasAccess && (
                  <>
                    <div className="w-px h-4 bg-white/10"></div>
                    <button 
                      onClick={() => setShowInfo(!showInfo)} 
                      className={`transition-colors p-1 rounded-md ${showInfo ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {showInfo ? <X size={16} /> : <Info size={16} />}
                    </button>
                  </>
                )}
              </div>
           </div>

           {/* INFO PANEL */}
           {showInfo && hasAccess && (
             <div className="ml-14 w-[320px] max-h-[60vh] overflow-y-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4">
               <h3 className="text-sm font-semibold text-white mb-3 tracking-tight">
                 {currentSetup.title || 'Analysis Notes'}
               </h3>
               <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                 {currentSetup.content || 'No additional notes provided.'}
               </p>
               <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2 text-[10px] font-medium text-neutral-500">
                 <Clock size={12} />
                 <span>Published {new Date(currentSetup.created_at).toLocaleString()}</span>
               </div>
             </div>
           )}
         </div>

         {/* LEFT TIMEFRAME MENU - MOVED DOWN (top-24) TO PREVENT BUTTON OVERLAP */}
         <div className="absolute left-0 top-24 bottom-0 w-12 md:w-16 hover:w-48 bg-black/0 hover:bg-app-bg transition-colors duration-700/95 border-r border-transparent hover:border-card-border transition-colors duration-700 transition-all duration-300 flex flex-col pt-4 group pointer-events-auto z-40">
           <div className="opacity-0 group-hover:opacity-100 px-6 pb-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest transition-opacity whitespace-nowrap">Timeframes</div>
           <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
             {timeframes.map(t => (
               <button 
                 key={t}
                 onClick={() => { setSelectedTf(t); setActiveIndex(0); setScale(1); setPos({x:0, y:0}) }}
                 className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap overflow-hidden ${selectedTf === t ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 opacity-100' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
               >
                 {t}
               </button>
             ))}
           </div>
         </div>

         {/* RIGHT HISTORY MENU - MOVED DOWN (top-24) */}
         <div className="absolute right-0 top-24 bottom-0 w-12 md:w-16 hover:w-56 bg-black/0 hover:bg-app-bg transition-colors duration-700/95 border-l border-transparent hover:border-card-border transition-colors duration-700 transition-all duration-300 flex flex-col pt-4 group pointer-events-auto z-40">
           <div className="opacity-0 group-hover:opacity-100 px-6 pb-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest transition-opacity whitespace-nowrap">History</div>
           <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
             {filteredHistory.map((item, idx) => (
               <button 
                 key={item.id}
                 onClick={() => { setActiveIndex(idx); setScale(1); setPos({x:0, y:0}) }}
                 className={`w-full text-left px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${activeIndex === idx ? 'bg-white/10 text-white border border-white/20 opacity-100' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
               >
                 <div className="text-[11px] font-medium">{new Date(item.created_at).toLocaleDateString()}</div>
                 <div className="text-[9px] text-neutral-600 mt-0.5">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
               </button>
             ))}
           </div>
         </div>

         {/* PAYWALL MODAL */}
         {!hasAccess && (
           <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto">
             <div className="max-w-md w-full bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
                
                <div className="w-16 h-16 bg-neutral-900 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                   <Lock size={24} className="text-neutral-400" />
                </div>

                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2 relative z-10">Intelligence Locked</h2>
                <p className="text-[13px] text-neutral-400 mb-6 relative z-10 leading-relaxed">
                  This live <span className="text-white font-medium">{tf}</span> setup for <span className="text-white font-medium">{asset}</span> is restricted. It will become publicly available for free analysis review in:
                </p>

                <div className="flex items-center justify-center space-x-2 bg-white/[0.02] border border-white/[0.05] rounded-lg py-3 mb-8 relative z-10">
                  <Clock size={16} className="text-neutral-500" />
                  <span className="text-lg font-mono font-bold text-white tracking-widest">{countdownText}</span>
                </div>

                <div className="relative z-10 pt-6 border-t border-card-border transition-colors duration-700">
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Or bypass timer instantly</p>
                  <button 
                    onClick={() => router.push('/settings/billing')}
                    className={`w-full py-3.5 font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors ${requiredTier === 'PRO' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                  >
                    {requiredTier === 'PRO' ? <Crown size={16} /> : <Shield size={16} />}
                    <span>Upgrade to Trader {requiredTier}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
             </div>
           </div>
         )}
         
       </div>
       
       <style jsx>{`
         .scrollbar-hide::-webkit-scrollbar { display: none; }
       `}</style>
    </div>
  )
}

export default function ViewportPage() {
  return <Suspense fallback={<div className="h-screen bg-app-bg transition-colors duration-700"></div>}><ViewportContent /></Suspense>
}

