'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Script from 'next/script'
import { Lock, Smartphone, Loader2, Target, TrendingUp, TrendingDown, Minus, Activity, Clock, X, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// ==========================================
// 1. MOBILE VIEWPORT COMPONENT (Sliding Modal)
// ==========================================
function MobileViewport({ setup, onClose }: { setup: any, onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showThesis, setShowThesis] = useState(false)

  // Mobile Touch Refs
  const touchMode = useRef<'none' | 'pan' | 'pinch'>('none')
  const pinchStartDist = useRef(0)
  const initialScale = useRef(1)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchMode.current = 'pinch'
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDist.current = Math.hypot(dx, dy)
      initialScale.current = scale
    } else if (e.touches.length === 1) {
      touchMode.current = 'pan'
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pos.x, y: e.touches[0].clientY - pos.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchMode.current === 'pinch' && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = Math.min(Math.max(0.5, initialScale.current * (dist / pinchStartDist.current)), 5)
      setScale(newScale)
    } else if (touchMode.current === 'pan' && e.touches.length === 1 && isDragging) {
      setPos({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    touchMode.current = 'none'
    setIsDragging(false)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* TOP HEADER */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-white font-black uppercase tracking-widest text-sm leading-tight">{setup.asset_symbol}</span>
            <span className="text-blue-400 font-bold text-[10px] tracking-widest uppercase leading-tight">{setup.timeframe}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${setup.status === 'ACTIVE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          {setup.status}
        </div>
      </div>

      {/* CHART AREA */}
      <div 
        className="flex-1 relative overflow-hidden bg-black touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <img 
          src={setup.image_url} 
          alt="Analysis" 
          className="absolute inset-0 w-full h-full object-contain"
          style={{ 
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: isDragging || touchMode.current === 'pinch' ? 'none' : 'transform 0.1s ease-out'
          }}
          draggable={false}
        />
      </div>

      {/* BOTTOM THESIS DRAWER */}
      <div className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl transition-transform duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${showThesis ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'}`}>
        <div 
          className="h-[4.5rem] flex items-center justify-between px-6 cursor-pointer"
          onClick={() => setShowThesis(!showThesis)}
        >
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Desk Thesis</span>
          <div className="w-10 h-1 rounded-full bg-white/20" />
          <Clock size={16} className="text-neutral-500" />
        </div>
        <div className="px-6 pb-8 pt-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {setup.content || "No additional thesis provided for this structural level."}
          </p>
        </div>
      </div>

    </div>
  )
}


// ==========================================
// 2. MAIN MINI APP PAGE
// ==========================================
export default function MiniAppPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'not_linked' | 'not_pro' | 'error'>('loading')
  const [userData, setUserData] = useState<any>(null)
  
  // App State
  const [setups, setSetups] = useState<any[]>([])
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [selectedSetup, setSelectedSetup] = useState<any | null>(null)

  // 1. Initialize Telegram & Auth
  useEffect(() => {
    const initMiniApp = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        tg.ready()
        tg.expand()
        tg.setHeaderColor('#050505')
        tg.setBackgroundColor('#050505')

        const tgUser = tg.initDataUnsafe?.user
        if (!tgUser || !tgUser.id) {
          setStatus('error')
          return
        }

        try {
          const res = await fetch('/api/telegram/miniapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: tgUser.id })
          })
          const data = await res.json()

          if (data.authorized) {
            setUserData(data.user)
            setStatus('authorized')
            fetchSetups()
          } else {
            setStatus(data.reason)
          }
        } catch (err) {
          setStatus('error')
        }
      } else {
        setStatus('error')
      }
    }

    const timer = setTimeout(initMiniApp, 100)
    return () => clearTimeout(timer)
  }, [])

  // 2. Load Seen IDs from Browser Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sentinel_seen_setups')
      if (stored) setSeenIds(JSON.parse(stored))
    }
  }, [])

  // 3. Fetch Live Data
  const fetchSetups = async () => {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .in('status', ['ACTIVE', 'WAITING'])
      .order('created_at', { ascending: false })
      .limit(50)

    if (data && !error) setSetups(data)
  }

  // 4. Open Setup & Mark as Seen
  const handleOpenSetup = (setup: any) => {
    if (!seenIds.includes(setup.id)) {
      const newSeen = [...seenIds, setup.id]
      setSeenIds(newSeen)
      localStorage.setItem('sentinel_seen_setups', JSON.stringify(newSeen))
    }
    setSelectedSetup(setup)
  }

  // --- FORMATTING HELPERS ---
  const getTimeAgo = (dateStr: string) => {
    const hours = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getBiasUI = (bias: string) => {
    const b = (bias || '').toUpperCase()
    if (b === 'BULLISH') return <span className="flex items-center text-emerald-400 gap-1"><TrendingUp size={12}/> Bullish</span>
    if (b === 'BEARISH') return <span className="flex items-center text-red-400 gap-1"><TrendingDown size={12}/> Bearish</span>
    return <span className="flex items-center text-neutral-500 gap-1"><Minus size={12}/> Neutral</span>
  }

  // --- RENDER ERROR/LOADING STATES ---
  if (status === 'loading') {
    return (
      <div className="w-full h-[100dvh] bg-[#050505] flex flex-col items-center justify-center">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <Loader2 className="w-8 h-8 text-[#2AABEE] animate-spin mb-4" />
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest animate-pulse">Decrypting Identity...</p>
      </div>
    )
  }

  if (status === 'not_linked' || status === 'not_pro' || status === 'error') {
    const isProErr = status === 'not_pro'
    return (
      <div className="w-full h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        {isProErr ? <Lock className="w-12 h-12 text-amber-500/80 mb-4 stroke-1" /> : <Smartphone className="w-12 h-12 text-neutral-600 mb-4 stroke-1" />}
        <h2 className="text-xl font-bold text-white mb-2">{isProErr ? 'Pro Access Required' : 'Access Denied'}</h2>
        <p className="text-sm text-neutral-400">
          {isProErr 
            ? 'The mobile terminal is strictly reserved for Professional members. Upgrade your account on the web to unlock.' 
            : 'Please log in to mytraderdesk.com on your web browser and connect your Telegram account in Settings.'}
        </p>
      </div>
    )
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="w-full min-h-[100dvh] bg-[#030303] text-white flex flex-col pb-6">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Target className="text-blue-500 w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-wider uppercase text-white leading-tight">Live Terminal</span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-tight">Sentinel Vortex</span>
          </div>
        </div>
        <div className="text-[10px] font-black px-2.5 py-1.5 bg-[#111] border border-white/5 text-neutral-300 rounded-lg tracking-wider uppercase">
          {userData?.username}
        </div>
      </div>

      {/* FEED */}
      <div className="flex-1 px-4 pt-6 space-y-4">
        {setups.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 opacity-40">
            <Activity className="w-10 h-10 mb-3 stroke-1" />
            <p className="text-xs font-bold uppercase tracking-widest">No active setups.</p>
          </div>
        ) : (
          setups.map(setup => {
            const isUnseen = !seenIds.includes(setup.id)
            const isActive = setup.status === 'ACTIVE'

            return (
              <button 
                key={setup.id}
                onClick={() => handleOpenSetup(setup)}
                className="w-full text-left bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between transition-transform active:scale-95 relative overflow-hidden"
              >
                {/* Unseen Glowing Dot */}
                {isUnseen && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}

                <div className="flex items-center gap-4 pl-2">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border ${isActive ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">{isActive ? 'LIVE' : 'WAIT'}</span>
                    <span className={`text-xs font-black uppercase ${isActive ? 'text-blue-400' : 'text-amber-500'}`}>{setup.timeframe}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-wider text-white mb-1">{setup.asset_symbol}</span>
                    <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      {getBiasUI(setup.bias)}
                      <span className="text-neutral-700">•</span>
                      <span className="text-neutral-500">{getTimeAgo(setup.created_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* FULLSCREEN OVERLAY MODAL */}
      {selectedSetup && (
        <MobileViewport setup={selectedSetup} onClose={() => setSelectedSetup(null)} />
      )}

    </div>
  )
}
