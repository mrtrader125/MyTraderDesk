'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock, Crown, Clock, Shield, Info, X, Activity, Bookmark, Pin } from 'lucide-react'

const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

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

export default function ViewportPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const asset = searchParams.get('asset')
  const tfParam = searchParams.get('tf')
  
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<any[]>([])

  const [selectedTf, setSelectedTf] = useState<string>('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!asset) return router.push('/markets')

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (profile?.plan) setUserPlan(profile.plan.toLowerCase())

        const { data: vaultData } = await supabase
          .from('user_vault')
          .select('analysis_id')
          .eq('user_id', user.id)

        if (vaultData) {
          const liveWatchlist = vaultData.map((v: any) => ({ id: v.analysis_id }))
          setWatchlist(liveWatchlist)
        }
      }

      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('asset_symbol', asset)
        .order('created_at', { ascending: false })
        
      if (data && data.length > 0) {
        setAllHistory(data)
        const requestedTfExists = tfParam && data.some(d => d.timeframe === tfParam)
        
        let targetTf = data[0].timeframe
        if (requestedTfExists) {
          targetTf = tfParam!
        }
        setSelectedTf(targetTf)

        if (user) {
           const targetSetup = data.find(d => d.timeframe === targetTf)
           const accessCheck = getSetupAccess(targetSetup)
           
           if (!accessCheck.hasAccess) {
             supabase.from('activity_logs').insert([{
               user_id: user.id,
               action: 'PAYWALL_BUMP',
               asset_symbol: asset,
               timeframe: targetTf
             }]).then()
           }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [asset, tfParam, router])

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

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.0015
    setScale(Math.min(Math.max(0.4, scale - e.deltaY * zoomSensitivity), 5))
  }
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }) }
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }
  const handleMouseUp = () => setIsDragging(false)

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
  const isCurrentBookmarked = watchlist.some(w => w.id === currentSetup.id)

  return (
    <div className="fixed inset-0 bg-[#050505] flex overflow-hidden text-white select-none touch-none font-sans">
       <div 
         className={`absolute inset-0 z-10 flex items-center justify-start pl-6 md:pl-16 pr-20 pt-20 pb-10 ${access.hasAccess ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
         onWheel={access.hasAccess ? handleWheel : undefined}
         onMouseDown={access.hasAccess ? handleMouseDown : undefined}
         onMouseMove={access.hasAccess ? handleMouseMove : undefined}
         onMouseUp={access.hasAccess ? handleMouseUp : undefined}
         onMouseLeave={access.hasAccess ? handleMouseUp : undefined}
       >
         {access.hasAccess ? (
           <img 
             src={currentSetup.image_url} 
             alt={asset || "Trading Analysis"}
             draggable={false}
             className="max-w-full max-h-full object-contain pointer-events-none origin-left"
             style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }} 
           />
         ) : (
           <div className="w-full max-w-4xl aspect-video bg-[#0a0a0a] border border-neutral-800/50 rounded-[2rem] shadow-2xl" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }} />
         )}
       </div>

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
             <div className="flex items-center justify-center space-x-2 bg-black border border-neutral-800 rounded-xl py-3 mb-6 relative z-10">
               <Clock size={14} className="text-neutral-500" />
               <span className="text-sm font-black text-white tracking-widest">{access.countdownText}</span>
             </div>
             <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-6 relative z-10">(You can still view older history via the right sidebar)</p>
             <div className="relative z-10 pt-5 border-t border-neutral-800">
               <button onClick={() => router.push('/account/subscription')} className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center space-x-2 transition-colors ${access.requiredTier === 'PRO' ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                 {access.requiredTier === 'PRO' ? <Crown size={14} /> : <Shield size={14} />}
                 <span>Upgrade to {access.requiredTier}</span>
               </button>
             </div>
           </div>
         </div>
       )}

       <div className="absolute inset-0 z-50 pointer-events-none flex flex-col">
         <div className="absolute top-5 left-5 flex items-start space-x-3 pointer-events-none z-50">
           <button onClick={() => router.push('/markets')} className="w-10 h-10 bg-[#0a0a0a] border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors pointer-events-auto shadow-lg shrink-0"><ArrowLeft size={16} /></button>
           <div className="h-10 bg-[#0a0a0a] border border-neutral-800 px-4 rounded-xl flex items-center space-x-3 shadow-lg pointer-events-auto">
             <span className="text-sm font-black uppercase tracking-widest text-white">{asset}</span>
             <div className="w-px h-4 bg-neutral-800"></div>
             <button onClick={(e) => toggleBookmark(e, currentSetup)} className="text-neutral-500 hover:text-white transition-colors">
                <Bookmark size={14} className={isCurrentBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
              </button>
             {access.hasAccess && (
               <>
                 <div className="w-px h-4 bg-neutral-800"></div>
                 <button onClick={() => setShowInfo(!showInfo)} className={`transition-colors w-6 h-6 flex items-center justify-center rounded-md ${showInfo ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}>
                   {showInfo ? <X size={14} /> : <Info size={14} />}
                 </button>
               </>
             )}
           </div>
           {showInfo && access.hasAccess && (
             <div className="absolute top-12 left-14 w-[300px] max-h-[60vh] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-5 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4">
               <h3 className="text-xs font-black text-white mb-2 uppercase tracking-wider">{currentSetup.title || 'Analysis Notes'}</h3>
               <p className="text-[11px] font-medium text-neutral-400 leading-relaxed whitespace-pre-wrap">{currentSetup.content || 'No additional notes provided.'}</p>
               <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                 <Clock size={10} /><span>{new Date(currentSetup.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           )}
         </div>

         <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-neutral-800 p-1.5 rounded-xl shadow-lg pointer-events-auto z-50 flex items-center space-x-1">
            {timeframes.map(t => {
              const isSelected = selectedTf === t
              return (
                <button 
                  key={t}
                  onClick={async () => { 
                    setSelectedTf(t); 
                    setActiveIndex(0); 
                    setScale(1); 
                    setPos({x:0, y:0});

                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                      supabase.from('activity_logs').insert([{
                        user_id: user.id,
                        action: 'VIEW_CHART',
                        asset_symbol: asset,
                        timeframe: t
                      }]).then() 
                    }
                  }}
                  className={`flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors
                    ${isSelected ? 'bg-white text-black' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                >
                  {t}
                </button>
              )
            })}
         </div>

         <div className={`absolute right-0 top-0 bottom-0 z-40 flex flex-col shadow-2xl transition-all duration-300 border-l border-neutral-800 pointer-events-auto ${isSidebarPinned ? 'w-56 bg-[#0a0a0a]/95' : 'w-12 hover:w-56 bg-[#0a0a0a]/80 backdrop-blur-md group/sidebar'}`}>
           <div className={`h-14 flex items-center border-b border-neutral-800 transition-all ${isSidebarPinned ? 'justify-between px-4' : 'justify-center group-hover/sidebar:justify-between group-hover/sidebar:px-4'}`}>
             <div className="flex items-center">
               <Clock size={14} className="text-neutral-500 shrink-0" />
               <span className={`text-[10px] font-black text-neutral-300 uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${isSidebarPinned ? 'opacity-100 w-auto ml-2' : 'opacity-0 w-0 overflow-hidden group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 group-hover/sidebar:ml-2'}`}>History</span>
             </div>
             <button onClick={() => setIsSidebarPinned(!isSidebarPinned)} className={`text-neutral-500 hover:text-white transition-colors ${isSidebarPinned ? 'block' : 'hidden group-hover/sidebar:block'}`} title={isSidebarPinned ? "Close Panel" : "Pin Panel"}>
               {isSidebarPinned ? <X size={14} /> : <Pin size={14} />}
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-1">
             {filteredHistory.map((item, idx) => {
               const historyAccess = getSetupAccess(item)
               const isActive = activeIndex === idx
               const isItemBookmarked = watchlist.some(w => w.id === item.id)

               return (
                 <button 
                   key={item.id}
                   onClick={() => { if(historyAccess.hasAccess) { setActiveIndex(idx); setScale(1); setPos({x:0, y:0}) } }}
                   className={`w-full flex items-center h-10 rounded-lg transition-all relative ${isSidebarPinned ? 'justify-start px-3' : 'justify-center group-hover/sidebar:justify-start group-hover/sidebar:px-3'} ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} ${!historyAccess.hasAccess ? 'cursor-not-allowed opacity-60' : ''}`}
                 >
                   <div className={`${isSidebarPinned ? 'hidden' : 'block group-hover/sidebar:hidden shrink-0'}`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_5px_#fff]' : 'bg-neutral-700'}`} />
                   </div>
                   <div className={`items-center justify-between w-full min-w-0 ${isSidebarPinned ? 'flex' : 'hidden group-hover/sidebar:flex'}`}>
                     <div className="flex flex-col items-start min-w-0 pr-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-white' : 'text-neutral-400'}`}>{new Date(item.created_at).toLocaleDateString()}</span>
                       <span className="text-[8px] font-bold text-neutral-600">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div className="flex items-center space-x-1.5 shrink-0">
                       {isItemBookmarked && <Bookmark size={10} className="fill-amber-500 text-amber-500" />}
                       {!historyAccess.hasAccess && <Lock size={10} className="text-neutral-500" />}
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
