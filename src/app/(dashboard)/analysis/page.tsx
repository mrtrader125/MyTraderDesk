'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Crown, ChevronRight, Clock, Shield, Info, X, Activity } from 'lucide-react'

const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

export default function ViewportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('free')
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
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
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

  // --- INDIVIDUAL SETUP ACCESS LOGIC ---
  const getSetupAccess = (setup: any) => {
    if (!setup) return { hasAccess: false, requiredTier: 'PRO', hoursLeft: 0, countdownText: '' }

    const isCore = CORE_ASSETS.includes(asset || '')
    const lowerTf = (setup.timeframe || '').toLowerCase().replace(/\s+/g, '') 
    const isScalp = lowerTf.includes('5m') || lowerTf.includes('15m')
    const isFastDelay = isScalp || lowerTf.includes('1h') || lowerTf.includes('h1')

    const createdTime = new Date(setup.created_at).getTime()
    const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60)
    const requiredDelayHours = isFastDelay ? 24 : 168
    const isTimeUnlocked = ageInHours >= requiredDelayHours
    const requiredTier = (!isCore || isScalp) ? 'PRO' : 'ESSENTIAL'

    let hasAccess = false
    if (userPlan === 'pro') hasAccess = true
    else if (userPlan === 'essential' && requiredTier === 'ESSENTIAL') hasAccess = true
    else if (isTimeUnlocked) hasAccess = true

    const hoursLeft = Math.max(0, requiredDelayHours - ageInHours)
    const daysLeft = Math.floor(hoursLeft / 24)
    const remainingHours = Math.floor(hoursLeft % 24)
    const remainingMins = Math.floor((hoursLeft * 60) % 60)
    const countdownText = daysLeft > 0 ? `${daysLeft}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`

    return { hasAccess, requiredTier, hoursLeft, countdownText }
  }

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
      <Activity className="animate-pulse text-blue-500" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Connecting...</span>
    </div>
  )

  if (!currentSetup) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">No data found for {asset}</div>

  const access = getSetupAccess(currentSetup)

  return (
    <div className="fixed inset-0 bg-[#050505] flex overflow-hidden text-white select-none touch-none font-sans">
        
       {/* --- LAYER 1: BOTTOM CANVAS (PHYSICS ENGINE) --- */}
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-center p-24 md:p-40 ${access.hasAccess ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
         onWheel={access.hasAccess ? handleWheel : undefined}
         onMouseDown={access.hasAccess ? handleMouseDown : undefined}
         onMouseMove={access.hasAccess ? handleMouseMove : undefined}
         onMouseUp={access.hasAccess ? handleMouseUp : undefined}
         onMouseLeave={access.hasAccess ? handleMouseUp : undefined}
       >
         <img 
           src={currentSetup.image_url} 
           alt={asset || "Trading Analysis"}
           draggable={false}
           className="w-full h-full object-contain pointer-events-none"
           style={{ 
             transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
             transition: isDragging ? 'none' : 'transform 0.1s ease-out',
             filter: access.hasAccess ? 'none' : 'blur(12px) grayscale(60%) opacity(40%)'
           }} 
         />
       </div>

       {/* --- LAYER 2: PAYWALL OVERLAY (ONLY SHOWS OVER CANVAS, NOT MENUS) --- */}
       {!access.hasAccess && (
         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
           <div className="max-w-md w-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden pointer-events-auto">
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${access.requiredTier === 'PRO' ? 'bg-brand-primary/20' : 'bg-blue-600/20'}`}></div>
             
             <div className="w-16 h-16 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                <Lock size={24} className={access.requiredTier === 'PRO' ? 'text-brand-primary' : 'text-blue-500'} />
             </div>

             <h2 className="text-xl font-black text-white tracking-tight uppercase mb-2 relative z-10">Clearance Required</h2>
             <p className="text-[12px] font-medium text-neutral-400 mb-6 relative z-10 leading-relaxed">
               The <span className="text-white font-bold">{currentSetup.timeframe}</span> setup for <span className="text-white font-bold">{asset}</span> is restricted. It will unlock for your tier in:
             </p>

             <div className="flex items-center justify-center space-x-2 bg-black border border-neutral-800 rounded-xl py-3 mb-8 relative z-10">
               <Clock size={16} className="text-neutral-500" />
               <span className="text-lg font-black text-white tracking-widest">{access.countdownText}</span>
             </div>

             <div className="relative z-10 pt-6 border-t border-neutral-800">
               <button 
                 onClick={() => router.push('/settings/billing')}
                 className={`w-full py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-colors ${access.requiredTier === 'PRO' ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
               >
                 {access.requiredTier === 'PRO' ? <Crown size={14} /> : <Shield size={14} />}
                 <span>Upgrade to {access.requiredTier}</span>
               </button>
             </div>
           </div>
         </div>
       )}

       {/* --- LAYER 3: TOP UI (MENUS & OVERLAYS) --- */}
       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         
         {/* TOP HEADER */}
         <div className="absolute top-6 left-6 flex items-start space-x-4 pointer-events-none z-50">
           <button 
             onClick={() => router.push('/analysis')} 
             className="w-12 h-12 bg-[#0a0a0a] border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors pointer-events-auto"
           >
             <ArrowLeft size={18} />
           </button>
           
           <div className="bg-[#0a0a0a] border border-neutral-800 px-5 py-3 rounded-xl flex items-center space-x-4 shadow-xl pointer-events-auto">
             <span className="text-xl font-black uppercase tracking-tighter">{asset}</span>
             <span className="px-2 py-0.5 bg-white/5 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded border border-white/10">{currentSetup.timeframe}</span>
             
             {access.hasAccess && (
               <>
                 <div className="w-px h-6 bg-neutral-800"></div>
                 <button 
                   onClick={() => setShowInfo(!showInfo)} 
                   className={`transition-colors p-1.5 rounded-lg ${showInfo ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                 >
                   {showInfo ? <X size={16} /> : <Info size={16} />}
                 </button>
               </>
             )}
           </div>

           {/* INFO PANEL */}
           {showInfo && access.hasAccess && (
             <div className="absolute top-16 left-16 w-[320px] max-h-[60vh] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4">
               <h3 className="text-sm font-black text-white mb-3 uppercase tracking-wider">
                 {currentSetup.title || 'Analysis Notes'}
               </h3>
               <p className="text-[12px] font-medium text-neutral-400 leading-relaxed whitespace-pre-wrap">
                 {currentSetup.content || 'No additional notes provided.'}
               </p>
               <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                 <Clock size={12} />
                 <span>Published {new Date(currentSetup.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           )}
         </div>

         {/* LEFT TIMEFRAME MENU */}
         <div className="absolute left-0 top-24 bottom-0 w-16 hover:w-48 bg-transparent hover:bg-[#050505]/95 border-r border-transparent hover:border-neutral-800 transition-all duration-300 flex flex-col pt-4 group pointer-events-auto z-40">
           <div className="opacity-0 group-hover:opacity-100 px-6 pb-4 text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] transition-opacity whitespace-nowrap">Timeframes</div>
           <div className="flex-1 overflow-y-auto px-3 space-y-2 scrollbar-hide">
             {timeframes.map(t => {
               // Quick check if this specific timeframe has a lock on it for the user
               const latestForTf = allHistory.find(h => h.timeframe === t)
               const tfAccess = getSetupAccess(latestForTf)

               return (
                 <button 
                   key={t}
                   onClick={() => { setSelectedTf(t); setActiveIndex(0); setScale(1); setPos({x:0, y:0}) }}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap overflow-hidden
                     ${selectedTf === t ? 'bg-white text-black opacity-100' : 'text-neutral-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
                 >
                   <span>{t}</span>
                   {!tfAccess.hasAccess && <Lock size={12} className={selectedTf === t ? 'text-black' : 'text-neutral-600'} />}
                 </button>
               )
             })}
           </div>
         </div>

         {/* RIGHT HISTORY MENU */}
         <div className="absolute right-0 top-24 bottom-0 w-16 hover:w-56 bg-transparent hover:bg-[#050505]/95 border-l border-transparent hover:border-neutral-800 transition-all duration-300 flex flex-col pt-4 group pointer-events-auto z-40">
           <div className="opacity-0 group-hover:opacity-100 px-6 pb-4 text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] transition-opacity whitespace-nowrap">History</div>
           <div className="flex-1 overflow-y-auto px-3 space-y-2 scrollbar-hide">
             {filteredHistory.map((item, idx) => {
               const historyAccess = getSetupAccess(item)

               return (
                 <button 
                   key={item.id}
                   onClick={() => { setActiveIndex(idx); setScale(1); setPos({x:0, y:0}) }}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden
                     ${activeIndex === idx ? 'bg-[#0a0a0a] border border-neutral-700 text-white opacity-100' : 'bg-transparent text-neutral-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
                 >
                   <div className="flex flex-col items-start">
                     <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</span>
                     <span className="text-[9px] font-bold text-neutral-600 mt-0.5">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   {!historyAccess.hasAccess && <Lock size={12} className="text-neutral-600 shrink-0 ml-2" />}
                 </button>
               )
             })}
           </div>
         </div>

       </div>
    </div>
  )
}
