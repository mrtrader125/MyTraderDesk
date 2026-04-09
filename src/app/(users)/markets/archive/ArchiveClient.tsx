'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Clock, Shield, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { PLAN_CONFIG, getAssetCategory } from '@/lib/platformConfig'
import { supabase } from '@/lib/supabase'

// 🚨 INLINED ACCESS LOGIC: Strictly enforces Free (7-day delay / category locks) vs Pro (Instant)
const getSetupAccess = (setup: any, userPlan: string) => {
  if (!setup) return { hasAccess: false, requiredTier: 'pro' };
  if (userPlan === 'pro') return { hasAccess: true, requiredTier: 'free' };

  const category = getAssetCategory(setup.asset_symbol);
  const isAllowedCategory = PLAN_CONFIG.free.allowedCategories.includes(category);

  // 1. Check if the asset category is allowed for Free users
  if (!isAllowedCategory) {
    return { hasAccess: false, requiredTier: 'pro' };
  }

  // 2. Check if the admin explicitly made this setup free
  if (setup.tier_access === 'free') return { hasAccess: true, requiredTier: 'free' };

  // 3. Calculate 7-day delay
  const postTime = new Date(setup.created_at).getTime();
  const currentTime = new Date().getTime();
  const hoursSincePosted = (currentTime - postTime) / (1000 * 60 * 60);

  if (hoursSincePosted >= PLAN_CONFIG.free.delayHours) {
    return { hasAccess: true, requiredTier: 'free' };
  } else {
    return { hasAccess: false, requiredTier: 'pro' };
  }
}

export default function ArchiveClient({ asset, initialHistory, userPlan, userId }: { asset: string, initialHistory: any[], userPlan: string, userId?: string }) {
  const router = useRouter()
  
  // 🚨 NEW: Unseen Tracker State
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSeenSetups = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('user_seen_setups')
        .select('analysis_id')
        .eq('user_id', userId);
      
      if (data) {
        setSeenIds(new Set(data.map(d => d.analysis_id)));
      }
    };
    fetchSeenSetups();
  }, [userId]);
  
  // --- GROUPING LOGIC ---
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const grouped = { today: [] as any[], yesterday: [] as any[], older: [] as any[] }

  initialHistory.forEach(setup => {
    const setupDate = new Date(setup.created_at); setupDate.setHours(0, 0, 0, 0)
    if (setupDate.getTime() === today.getTime()) grouped.today.push(setup)
    else if (setupDate.getTime() === yesterday.getTime()) grouped.yesterday.push(setup)
    else grouped.older.push(setup)
  })

  const ArchiveCard = ({ setup }: { setup: any }) => {
    const dateObj = new Date(setup.created_at)
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const displayText = setup.title || setup.content || `${asset} Setup`
    
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    
    const isPrime = setup.is_prime === true;
    
    // Evaluate access using our new strict logic
    const { hasAccess, requiredTier } = getSetupAccess(setup, userPlan)

    const status = (setup.status || 'WAITING').toUpperCase()
    let statusLine = "bg-neutral-800 group-hover:bg-neutral-600"
    
    if (status === 'ACTIVE') statusLine = "bg-blue-500/50 group-hover:bg-blue-400 group-hover:shadow-[-3px_0_10px_rgba(59,130,246,0.5)]"
    else if (status === 'WAITING') statusLine = "bg-amber-500/50 group-hover:bg-amber-400 group-hover:shadow-[-3px_0_10px_rgba(245,158,11,0.5)]"
    else if (status === 'DONE') statusLine = "bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[-3px_0_10px_rgba(16,185,129,0.5)]"
    else if (status === 'INVALID') statusLine = "bg-red-500/50 group-hover:bg-red-400 group-hover:shadow-[-3px_0_10px_rgba(239,68,68,0.5)]"
    else if (status === 'CANCELED') statusLine = "bg-neutral-600/50 group-hover:bg-neutral-400 group-hover:shadow-[-3px_0_10px_rgba(163,163,163,0.5)]"
    else if (status === 'ARCHIVED') statusLine = "bg-neutral-700/50 group-hover:bg-neutral-500 group-hover:shadow-[-3px_0_10px_rgba(115,115,115,0.5)]"

    // Fade out both canceled and archived setups so active setups pop out more
    const isFaded = status === 'CANCELED' || status === 'ARCHIVED'

    // 🚨 NEW: Unseen Logic (Must be < 7 days old and not in seen database)
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isOlderThanAWeek = new Date(setup.created_at).getTime() < Date.now() - SEVEN_DAYS_MS;
    const isUnseen = !seenIds.has(setup.id) && !isOlderThanAWeek;

    const handleCardClick = () => {
      // 1. Instantly remove glow via optimistic UI update
      if (isUnseen && userId) {
        setSeenIds(prev => {
          const next = new Set(prev);
          next.add(setup.id);
          return next;
        });

        // 2. Save read receipt in background
        supabase.from('user_seen_setups').insert({
          user_id: userId,
          analysis_id: setup.id
        }).then(({ error }) => {
          if (error && error.code !== '23505') console.error("Failed to mark setup as seen:", error);
        });
      }

      // 3. Route to Viewport
      router.push(`/markets/viewport?asset=${asset}&from=archive`);
    };

    return (
      <div 
        onClick={handleCardClick}
        className={`bg-[#0a0a0a] border rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative min-h-[180px] md:min-h-[200px]
          ${isUnseen ? 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}
          ${isPrime && !isUnseen ? 'border-blue-500/30 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : ''}
          ${!isPrime && !isUnseen ? 'border-neutral-800 hover:border-neutral-600 shadow-sm' : ''}
          ${isFaded ? 'opacity-60 hover:opacity-100' : ''}
        `}
      >
        {/* TOP IMAGE AREA - Cleaned of all badges */}
        <div className="h-24 md:h-28 w-full bg-[#050505] relative overflow-hidden border-b border-neutral-800/50 shrink-0">
          <img 
            src={setup.image_url} 
            alt={displayText} 
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-50 group-hover:opacity-100' : 'opacity-10 blur-md grayscale'} ${status === 'ARCHIVED' ? 'grayscale-[50%]' : ''}`} 
          />
          
          {!hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <Lock size={14} className="text-blue-500 mb-1" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                {requiredTier}
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM CONTENT AREA */}
        <div className="relative p-3 md:p-4 pr-4 md:pr-5 flex flex-col flex-1 justify-between z-10">
          <div className={`absolute top-0 right-0 inset-y-0 w-1 transition-all duration-500 z-30 ${statusLine}`} />
          
          <div className="flex flex-col items-start mb-2 w-full pr-2">
            
            {/* 🚨 NEW: Tags Row (Timeframe, Bias, Prime, New) */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {hasAccess && (
                <span className="bg-[#111] px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest border border-white/5">
                  {setup.timeframe || '-'}
                </span>
              )}

              {hasAccess && (
                <span className="flex items-center gap-1 px-1 text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                  {isBull ? <TrendingUp size={10} className="text-emerald-400" /> : isBear ? <TrendingDown size={10} className="text-red-400" /> : <Minus size={10} />}
                  {setup.bias || 'Neutral'}
                </span>
              )}

              {isPrime && (
                <div className="flex items-center px-1.5 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-sm">
                  <Target size={8} className="mr-1" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Prime</span>
                </div>
              )}

              {hasAccess && isUnseen && (
                <div className="flex items-center px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <span className="relative flex h-1.5 w-1.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">New</span>
                </div>
              )}
            </div>

            {/* TITLE */}
            <h3 className={`text-[11px] md:text-xs font-bold line-clamp-2 leading-tight transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-600'}`}>
              {hasAccess ? displayText : 'Analysis Locked.'}
            </h3>
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-neutral-500 pt-2.5 border-t border-neutral-800/50 mt-auto pr-1">
            <span className="flex items-center"><Clock size={8} className="mr-1.5" /> {formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#050505] font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="w-full border-b border-neutral-900 bg-[#0a0a0a]/95 backdrop-blur-md z-20 shadow-sm shrink-0">
        <div className="max-w-[90rem] mx-auto flex items-center space-x-3 p-3 md:p-5">
          
          <Link 
            href="/markets"
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#111] border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-neutral-600 transition-all shrink-0 shadow-sm"
          >
            <ArrowLeft size={14} />
          </Link>
          
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">{asset} <span className="text-blue-500">Archive</span></h1>
            <p className="text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] leading-none">Historical Records</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505] p-3 md:p-5 lg:p-6">
        <div className="max-w-[90rem] mx-auto space-y-8 md:space-y-10 pb-20 md:pb-6">
          
          {grouped.today.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">
                Published Today <div className="ml-3 h-px flex-1 bg-neutral-800"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {grouped.today.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.yesterday.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <h2 className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                Yesterday <div className="ml-3 h-px flex-1 bg-neutral-800"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {grouped.yesterday.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.older.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                Older Setups <div className="ml-3 h-px flex-1 bg-neutral-800/50"></div>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 transition-opacity">
                {grouped.older.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
              </div>
            </section>
          )}

          {initialHistory.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center opacity-50">
              <Shield size={28} className="text-neutral-700 mb-3" />
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">No Historical Data Found</span>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
