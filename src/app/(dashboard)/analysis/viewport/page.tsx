'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Crown, Clock, Shield, Info, X, Activity } from 'lucide-react'

const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

export default function ViewportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)

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

  // Individual Setup Access Logic
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
        
       {/* --- LAYER 1: BOTTOM CANVAS (Moved to Left) --- */}
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-start pl-6 md:pl-16 pr-20 pt-20 pb-10 ${access.hasAccess ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
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
           className="max-w-full max-h-full object-contain pointer-events-none origin-left"
           style={{ 
             transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
             transition: isDragging ? 'none' : 'transform 0.1s ease-out',
             filter: access.hasAccess ? 'none' : 'blur(12px) grayscale(60%) opacity(40%)'
           }} 
         />
       </div>

       {/* --- LAYER 2: PAYWALL OVERLAY --- */}
       {!access.hasAccess && (
         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
           <div className="max-w-sm w-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden pointer-events-auto">
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${access.requiredTier === 'PRO' ? 'bg-brand-primary/20' : 'bg-blue-600/20'}`}></div>
             
             <div className="w-14 h-14 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                <Lock size={20} className={access.requiredTier === 'PRO' ? 'text-brand-primary' : 'text-blue-500'} />
             </div>

             <h2 className="text-lg font-black text-white tracking-tight uppercase mb-2 relative z-10">Clearance Required</h2>
             <p className="text-[11px] font-medium text-neutral-400 mb-6 relative z-10 leading-relaxed">
               The <span className="text-white font-bold">{currentSetup.timeframe}</span> setup for <span className="text-white font-bold">{asset}</span> is restricted. It will unlock for your tier in:
             </p>

             <div className="flex items-center justify-center space-x-2 bg-black border border-neutral-800 rounded-xl py-3 mb-8 relative z-10">
               <Clock size={14} className="text-neutral-500" />
               <span className="text-sm font-black text-white tracking-widest">{access.countdownText}</span>
             </div>

             <div className="relative z-10 pt-5 border-t border-neutral-800">
               <button 
                 onClick={() => router.push('/settings/billing')}
                 className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-colors ${access.requiredTier === 'PRO' ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
               >
                 {access.requiredTier === 'PRO' ? <Crown size={14} /> : <Shield size={14} />}
                 <span>Upgrade to {access.requiredTier}</span>
               </button>
             </div>
           </div>
         </div>
       )}

       {/* --- LAYER 3: TOP UI (COMPACT HEADER) --- */}
       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         
         {/* Top Navigation Bar */}
         <div className="absolute top-5 left-5 flex items-start space-x-3 pointer-events-none z-50">
           <button 
             onClick={() => router.push('/analysis')} 
             className="w-10 h-10 bg-[#0a0a0a] border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors pointer-events-auto shadow-lg shrink-0"
           >
             <ArrowLeft size={16} />
           </button>
           
           <div className="h-10 bg-[#0a0a0a] border border-neutral-800 px-4 rounded-xl flex items-center space-x-3 shadow-lg pointer-events-auto">
             <span className="text-sm font-black uppercase tracking-widest text-white">{asset}</span>
             
             <div className="w-px h-4 bg-neutral-800"></div>
             
             {/* Timeframes (Horizontal) */}
             <div className="flex items-center space-x-1">
               {timeframes.map(t => {
                 const latestForTf = allHistory.find(h => h.timeframe === t)
                 const tfAccess = getSetupAccess(latestForTf)
                 const isSelected = selectedTf === t

                 return (
                   <button 
                     key={t}
                     onClick={() => { if(tfAccess.hasAccess) { setSelectedTf(t); setActiveIndex(0); setScale(1); setPos({x:0, y:0}) } }}
                     className={`flex items-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors
                       ${isSelected ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}
                       ${!tfAccess.hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     {t}
                     {!tfAccess.hasAccess && <Lock size={10} className={`ml-1 ${isSelected ? 'text-black' : 'text-neutral-600'}`} />}
                   </button>
                 )
               })}
             </div>

             {/* Info Button */}
             {access.hasAccess && (
               <>
                 <div className="w-px h-4 bg-neutral-800"></div>
                 <button 
                   onClick={() => setShowInfo(!showInfo)} 
                   className={`transition-colors text-neutral-400 hover:text-white ${showInfo ? 'text-white' : ''}`}
                 >
                   <Info size={14} />
                 </button>
               </>
             )}
           </div>

           {/* Info Dropdown */}
           {showInfo && access.hasAccess && (
             <div className="absolute top-12 left-14 w-[300px] max-h-[60vh] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4">
               <h3 className="text-xs font-black text-white mb-2 uppercase tracking-wider">
                 {currentSetup.title || 'Analysis Notes'}
               </h3>
               <p className="text-[11px] font-medium text-neutral-400 leading-relaxed whitespace-pre-wrap">
                 {currentSetup.content || 'No additional notes provided.'}
               </p>
               <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                 <Clock size={10} />
                 <span>{new Date(currentSetup.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           )}
         </div>

         {/* RIGHT HISTORY MENU (Flawless Collapsed State) */}
         <div className="absolute right-0 top-0 bottom-0 w-12 hover:w-56 bg-[#0a0a0a]/80 backdrop-blur-md border-l border-neutral-800 transition-all duration-300 group/sidebar pointer-events-auto z-40 flex flex-col shadow-2xl">
           
           {/* Sidebar Header */}
           <div className="h-14 flex items-center justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-5 border-b border-neutral-800 transition-all">
             <Clock size={14} className="text-neutral-500 shrink-0" />
             <span className="opacity-0 w-0 overflow-hidden group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2 transition-all duration-300 text-[10px] font-black text-neutral-300 uppercase tracking-widest whitespace-nowrap">
               History
             </span>
           </div>
           
           {/* History List */}
           <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-1">
             {filteredHistory.map((item, idx) => {
               const historyAccess = getSetupAccess(item)
               const isActive = activeIndex === idx

               return (
                 <button 
                   key={item.id}
                   onClick={() => { if(historyAccess.hasAccess) { setActiveIndex(idx); setScale(1); setPos({x:0, y:0}) } }}
                   className={`w-full flex items-center h-10 rounded-lg transition-all relative justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-3
                     ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                     ${!historyAccess.hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
                 >
                   {/* Collapsed Dot */}
                   <div className="block group-hover/sidebar:hidden shrink-0">
                     <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-neutral-700'}`} />
                   </div>
                   
                   {/* Expanded Details */}
                   <div className="hidden group-hover/sidebar:flex items-center justify-between w-full min-w-0">
                     <div className="flex flex-col items-start min-w-0 pr-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                         {new Date(item.created_at).toLocaleDateString()}
                       </span>
                       <span className="text-[8px] font-bold text-neutral-600">
                         {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                     {!historyAccess.hasAccess && <Lock size={10} className="text-neutral-500 shrink-0" />}
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
