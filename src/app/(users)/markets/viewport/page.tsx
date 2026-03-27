'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Crown, Clock, Shield, Info, X, Activity, Bookmark, Pin, Target, ZoomIn, ZoomOut, Menu } from 'lucide-react'
import { getSetupAccess } from '@/lib/access'

const getTfWeight = (tf: string) => {
  const cleanTf = tf.trim().toLowerCase();
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

function ViewportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  const tfParam = searchParams.get('tf')
  const fromParam = searchParams.get('from')

  const [allHistory, setAllHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<any[]>([])

  const [selectedTf, setSelectedTf] = useState<string>('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  
  // Sidebar State (Desktop Pin vs Mobile Drawer)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // Pan & Zoom Engine State
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  let backPath = '/markets'
  if (fromParam === 'dashboard') backPath = '/dashboard'
  else if (fromParam === 'vault') backPath = '/vault'
  else if (fromParam === 'archive') backPath = `/markets/archive?asset=${asset}`

  useEffect(() => {
    if (!asset) return router.push(backPath)

    async function loadData() {
      let currentPlan = 'free' 
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) {
          currentPlan = profile.plan.toLowerCase()
          setUserPlan(currentPlan)
        }

        const { data: vaultData } = await supabase.from('user_vault').select('analysis_id').eq('user_id', user.id)
        if (vaultData) setWatchlist(vaultData.map((v: any) => ({ id: v.analysis_id })))
      }

      const { data } = await supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
        
      if (data && data.length > 0) {
        setAllHistory(data)
        const requestedTfExists = tfParam && data.some(d => d.timeframe === tfParam)
        
        let targetTf = data[0].timeframe
        if (requestedTfExists) targetTf = tfParam!
        setSelectedTf(targetTf)

        if (user) {
           const targetSetup = data.find(d => d.timeframe === targetTf)
           const accessCheck = getSetupAccess(targetSetup, currentPlan)
           if (!accessCheck.hasAccess) {
             supabase.from('activity_logs').insert([{ user_id: user.id, action: 'PAYWALL_BUMP', asset_symbol: asset, timeframe: targetTf }]).then()
           }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [asset, tfParam, router, backPath])

  const timeframes = useMemo(() => {
    const uniqueTfs = Array.from(new Set(allHistory.map(a => a.timeframe)))
    return uniqueTfs.sort((a, b) => getTfWeight(a) - getTfWeight(b))
  }, [allHistory])
  
  const filteredHistory = useMemo(() => allHistory.filter(a => a.timeframe === selectedTf), [allHistory, selectedTf])
  const currentSetup = filteredHistory[activeIndex]

  const toggleBookmark = async (e: React.MouseEvent, setup: any) => {
    e.stopPropagation() 
    if (!setup) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const exists = watchlist.find(item => item.id === setup.id)
    let updated = [...watchlist]
    if (exists) {
      updated = updated.filter(item => item.id !== setup.id)
      setWatchlist(updated)
      await supabase.from('user_vault').delete().match({ user_id: user.id, analysis_id: setup.id })
    } else {
      updated.unshift({ id: setup.id, symbol: setup.asset_symbol, timeframe: setup.timeframe }) 
      setWatchlist(updated)
      await supabase.from('user_vault').insert([{ user_id: user.id, analysis_id: setup.id }])
    }
  }

  // --- NATIVE PAN & ZOOM ENGINE ---
  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.0015
    setScale(Math.min(Math.max(0.4, scale - e.deltaY * zoomSensitivity), 5))
  }
  
  // Desktop Mouse Drag
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }) }
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }
  const handleMouseUp = () => setIsDragging(false)
  
  // Mobile Touch Drag
  const handleTouchStart = (e: React.TouchEvent) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y }) }
  const handleTouchMove = (e: React.TouchEvent) => { if (isDragging) setPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }) }
  const handleTouchEnd = () => setIsDragging(false)

  // Mobile Button Zoom
  const zoomIn = () => setScale(prev => Math.min(prev + 0.3, 5))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.3, 0.4))

  if (loading) return (
    <div className="fixed inset-0 bg-[#050505] flex overflow-hidden text-white" style={{ height: '100dvh' }}>
      <div className="absolute top-4 md:top-5 left-4 md:left-5 flex space-x-2 md:space-x-3 z-50 animate-pulse">
        <div className="w-10 h-10 bg-[#0a0a0a] border border-neutral-800 rounded-xl"></div>
        <div className="h-10 w-40 md:w-48 bg-[#0a0a0a] border border-neutral-800 rounded-xl"></div>
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <Activity className="animate-pulse text-blue-500 w-8 h-8" />
      </div>
    </div>
  )

  if (!currentSetup) return <div className="h-[100dvh] bg-[#050505] flex flex-col items-center justify-center text-white"><Target size={32} className="text-neutral-700 mb-4"/><span className="text-neutral-500 text-xs font-black uppercase tracking-widest">No data found for {asset}</span><button onClick={() => router.push(backPath)} className="mt-6 px-6 py-2 bg-[#111] hover:bg-white/5 border border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Go Back</button></div>

  const access = getSetupAccess(currentSetup, userPlan)
  const isCurrentBookmarked = watchlist.some(w => w.id === currentSetup.id)

  return (
    // 🚨 STRICT MOBILE VIEWPORT LOCK (100dvh prevents browser bar bouncing)
    <div className="fixed inset-0 bg-[#050505] flex overflow-hidden text-white select-none touch-none font-sans" style={{ height: '100dvh' }}>
       
       {/* --- MAIN CHART STAGE --- */}
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-center md:pl-16 md:pr-20 md:pt-20 md:pb-10 overflow-hidden ${access.hasAccess ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
         onWheel={access.hasAccess ? handleWheel : undefined}
         onMouseDown={access.hasAccess ? handleMouseDown : undefined}
         onMouseMove={access.hasAccess ? handleMouseMove : undefined}
         onMouseUp={access.hasAccess ? handleMouseUp : undefined}
         onMouseLeave={access.hasAccess ? handleMouseUp : undefined}
         onTouchStart={access.hasAccess ? handleTouchStart : undefined}
         onTouchMove={access.hasAccess ? handleTouchMove : undefined}
         onTouchEnd={access.hasAccess ? handleTouchEnd : undefined}
       >
         {access.hasAccess ? (
           <img 
             src={currentSetup.image_url} 
             alt={asset || "Trading Analysis"}
             draggable={false}
             className="w-[95%] h-[75%] md:max-w-full md:max-h-full object-contain pointer-events-none"
             style={{ 
               transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
               transition: isDragging ? 'none' : 'transform 0.1s ease-out',
               imageRendering: 'high-quality'
             }} 
           />
         ) : (
           <div className="w-[90%] md:w-full max-w-4xl aspect-video bg-[#0a0a0a] border border-neutral-800/50 rounded-3xl shadow-2xl" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }} />
         )}
       </div>

       {/* --- PAYWALL MODAL --- */}
       {!access.hasAccess && (
         <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-4">
           <div className="w-full max-w-sm bg-[#0a0a0a]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden pointer-events-auto">
             <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${access.requiredTier === 'pro' ? 'bg-brand-primary/20' : 'bg-blue-600/20'}`}></div>
             <div className="w-12 h-12 md:w-14 md:h-14 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-5 md:mb-6 relative z-10 shadow-lg">
                <Lock size={20} className={access.requiredTier === 'pro' ? 'text-brand-primary' : 'text-blue-500'} />
             </div>
             <h2 className="text-base md:text-lg font-black text-white tracking-tight uppercase mb-2 relative z-10">Clearance Required</h2>
             <p className="text-[10px] md:text-[11px] font-medium text-neutral-400 mb-6 relative z-10 leading-relaxed">
               The <span className="text-white font-bold">{currentSetup.timeframe}</span> setup for <span className="text-white font-bold">{asset}</span> is restricted. It will unlock for your tier in:
             </p>
             <div className="flex items-center justify-center space-x-2 bg-black border border-neutral-800 rounded-xl py-3 mb-5 md:mb-6 relative z-10">
               <Clock size={14} className="text-neutral-500" />
               <span className="text-xs md:text-sm font-black text-white tracking-widest">{access.countdownText}</span>
             </div>
             <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-5 md:mb-6 relative z-10">(You can still view older history via the history panel)</p>
             <div className="relative z-10 pt-5 border-t border-neutral-800">
               <button onClick={() => router.push('/account/subscription')} className={`w-full py-3 md:py-3.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg ${access.requiredTier === 'pro' ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}>
                 {access.requiredTier === 'pro' ? <Crown size={14} /> : <Shield size={14} />}
                 <span>Upgrade to {access.requiredTier.toUpperCase()}</span>
               </button>
             </div>
           </div>
         </div>
       )}

       {/* --- ON-SCREEN UI OVERLAYS --- */}
       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         
         {/* TOP CONTROL BAR */}
         <div className="absolute top-4 md:top-5 left-4 md:left-5 right-4 md:right-auto flex items-start justify-between md:justify-start pointer-events-none z-50">
           
           <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto">
             <button 
               onClick={() => router.push(backPath)} 
               className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors shadow-lg shrink-0"
             >
               <ArrowLeft size={16} />
             </button>            
             
             <div className="h-10 md:h-12 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 px-3 md:px-4 rounded-xl flex items-center space-x-2 md:space-x-3 shadow-lg shrink-0">
               <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white">{asset}</span>
               
               {currentSetup.is_featured && (
                 <>
                   <div className="w-px h-4 bg-neutral-800"></div>
                   <div className="hidden md:flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                     <Target size={12} className="mr-1.5" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Prime</span>
                   </div>
                   {/* Compact prime badge for mobile header */}
                   <Target size={14} className="md:hidden text-amber-500" />
                 </>
               )}

               <div className="w-px h-4 bg-neutral-800"></div>
               <button onClick={(e) => toggleBookmark(e, currentSetup)} className="text-neutral-500 hover:text-white transition-colors p-1">
                  <Bookmark size={14} className={isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                </button>
               
               {access.hasAccess && (
                 <>
                   <div className="w-px h-4 bg-neutral-800"></div>
                   <button onClick={() => setShowInfo(true)} className="transition-colors w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10">
                     <Info size={16} />
                   </button>
                 </>
               )}
             </div>
           </div>

           {/* Mobile History Toggle */}
           <button 
             onClick={() => setIsMobileSidebarOpen(true)}
             className="md:hidden w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-lg pointer-events-auto shrink-0"
           >
             <Menu size={16} />
           </button>
         </div>

         {/* CENTERED INFO MODAL (Overrides desktop absolute positioning) */}
         {showInfo && access.hasAccess && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
             <div className="w-full max-w-sm max-h-[70vh] flex flex-col bg-[#0a0a0a] border border-neutral-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
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

         {/* TIMEFRAME SELECTOR (Bottom on Mobile, Top Center on Desktop) */}
         <div className="absolute bottom-6 md:bottom-auto md:top-5 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 p-1.5 rounded-xl md:rounded-2xl shadow-2xl pointer-events-auto z-40 flex items-center overflow-x-auto scrollbar-hide">
            {timeframes.map(t => {
              const isSelected = selectedTf === t
              return (
                <button 
                  key={t}
                  onClick={async () => { 
                    setSelectedTf(t); setActiveIndex(0); setScale(1); setPos({x:0, y:0});
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) supabase.from('activity_logs').insert([{ user_id: user.id, action: 'VIEW_CHART', asset_symbol: asset, timeframe: t }]).then() 
                  }}
                  className={`flex items-center justify-center min-w-[48px] md:min-w-[60px] px-3 md:px-4 py-2 md:py-1.5 rounded-lg md:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0
                    ${isSelected ? 'bg-white text-black shadow-md scale-105' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                >
                  {t}
                </button>
              )
            })}
         </div>

         {/* MOBILE ZOOM CONTROLS (Bottom Right, above timeframes) */}
         {access.hasAccess && (
           <div className="md:hidden absolute bottom-24 right-4 flex flex-col space-y-2 pointer-events-auto z-40">
             <button onClick={zoomIn} className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white shadow-xl active:scale-95 transition-all"><ZoomIn size={16}/></button>
             <button onClick={zoomOut} className="w-10 h-10 bg-[#0a0a0a]/90 backdrop-blur-md border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white shadow-xl active:scale-95 transition-all"><ZoomOut size={16}/></button>
           </div>
         )}

         {/* HISTORY SIDEBAR (Desktop Hover-Panel OR Mobile Slide-Drawer) */}
         <div className={`
           absolute right-0 top-0 bottom-0 z-50 flex flex-col shadow-2xl transition-all duration-300 border-l border-neutral-800 pointer-events-auto
           ${isMobileSidebarOpen ? 'translate-x-0 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl' : 'translate-x-full md:translate-x-0 w-64 md:w-12 md:hover:w-64 bg-[#0a0a0a]/95 md:bg-[#0a0a0a]/80 md:backdrop-blur-md group/sidebar'}
           ${isSidebarPinned ? 'md:w-64 md:bg-[#0a0a0a]/95' : ''}
         `}>
           <div className={`h-14 md:h-16 flex items-center border-b border-neutral-800 transition-all px-4 ${isSidebarPinned ? 'justify-between' : 'justify-between md:justify-center md:group-hover/sidebar:justify-between'}`}>
             <div className="flex items-center">
               <Clock size={14} className="text-neutral-400 shrink-0" />
               <span className={`text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap transition-all duration-300 ml-2 ${isSidebarPinned ? 'md:opacity-100 md:w-auto' : 'md:opacity-0 md:w-0 md:overflow-hidden md:group-hover/sidebar:w-auto md:group-hover/sidebar:opacity-100'}`}>Setup History</span>
             </div>
             
             {/* Desktop Pin Toggle */}
             <button onClick={() => setIsSidebarPinned(!isSidebarPinned)} className={`hidden md:block text-neutral-500 hover:text-white transition-colors ${isSidebarPinned ? 'block' : 'hidden group-hover/sidebar:block'}`}>
               {isSidebarPinned ? <X size={14} /> : <Pin size={14} />}
             </button>
             
             {/* Mobile Close Button */}
             <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white p-1">
               <X size={18} />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-1.5">
             {filteredHistory.map((item, idx) => {
               const historyAccess = getSetupAccess(item, userPlan)
               const isActive = activeIndex === idx
               const isItemBookmarked = watchlist.some(w => w.id === item.id)

               return (
                 <button 
                   key={item.id}
                   onClick={() => { 
                     if(historyAccess.hasAccess) { 
                       setActiveIndex(idx); setScale(1); setPos({x:0, y:0}); 
                       if(window.innerWidth < 768) setIsMobileSidebarOpen(false); // Auto-close on mobile selection
                     } 
                   }}
                   className={`w-full flex items-center h-12 md:h-10 rounded-xl md:rounded-lg transition-all relative px-3 
                     ${isSidebarPinned ? 'md:justify-start' : 'md:justify-center md:group-hover/sidebar:justify-start'} 
                     ${isActive ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'} 
                     ${!historyAccess.hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
                 >
                   <div className={`${isSidebarPinned ? 'md:hidden' : 'hidden md:block md:group-hover/sidebar:hidden shrink-0'}`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-neutral-700'}`} />
                   </div>
                   
                   <div className={`items-center justify-between w-full min-w-0 flex ${isSidebarPinned ? 'md:flex' : 'md:hidden md:group-hover/sidebar:flex'}`}>
                     <div className="flex flex-col items-start min-w-0 pr-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : 'text-neutral-400'}`}>{new Date(item.created_at).toLocaleDateString()}</span>
                       <span className="text-[8px] font-bold text-neutral-500">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center space-x-2 shrink-0">
                       {item.is_featured && <Target size={12} className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />}
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

export default function ViewportPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-[#050505] flex items-center justify-center"><Activity className="animate-pulse text-blue-500" size={32} /></div>}>
      <ViewportContent />
    </Suspense>
  )
}
