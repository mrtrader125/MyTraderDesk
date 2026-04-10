'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Clock, Shield, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { PLAN_CONFIG, getAssetCategory } from '@/lib/platformConfig'

// 🚨 INLINED ACCESS LOGIC
const getSetupAccess = (setup: any, userPlan: string) => {
  if (!setup) return { hasAccess: false, requiredTier: 'pro' };
  if (userPlan === 'pro') return { hasAccess: true, requiredTier: 'free' };

  const category = getAssetCategory(setup.asset_symbol);
  const isAllowedCategory = PLAN_CONFIG.free.allowedCategories.includes(category);

  if (!isAllowedCategory) return { hasAccess: false, requiredTier: 'pro' };
  if (setup.tier_access === 'free') return { hasAccess: true, requiredTier: 'free' };

  const postTime = new Date(setup.created_at).getTime();
  const currentTime = new Date().getTime();
  const hoursSincePosted = (currentTime - postTime) / (1000 * 60 * 60);

  if (hoursSincePosted >= PLAN_CONFIG.free.delayHours) {
    return { hasAccess: true, requiredTier: 'free' };
  } else {
    return { hasAccess: false, requiredTier: 'pro' };
  }
}

// --- SORTING WEIGHT LOGIC ---
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

const getStatusWeight = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 1;
  if (s === 'WAITING') return 2;
  if (s === 'DONE') return 3;
  if (s === 'INVALID') return 4;
  if (s === 'CANCELED') return 5;
  if (s === 'ARCHIVED') return 6;
  return 99;
}

export default function ArchiveClient({ asset, initialHistory, userPlan, userId }: { asset: string, initialHistory: any[], userPlan: string, userId?: string }) {
  const router = useRouter()
  
  // --- GROUPING & SORTING LOGIC ---
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)
  const yesterdayDate = new Date(todayDate); yesterdayDate.setDate(yesterdayDate.getDate() - 1)

  const grouped = { today: [] as any[], yesterday: [] as any[], older: [] as any[] }

  initialHistory.forEach(setup => {
    const setupDate = new Date(setup.created_at); setupDate.setHours(0, 0, 0, 0)
    if (setupDate.getTime() === todayDate.getTime()) grouped.today.push(setup)
    else if (setupDate.getTime() === yesterdayDate.getTime()) grouped.yesterday.push(setup)
    else grouped.older.push(setup)
  })

  const sortSetups = (a: any, b: any, compareDays: boolean = false) => {
    if (compareDays) {
      const dayA = new Date(a.created_at); dayA.setHours(0,0,0,0);
      const dayB = new Date(b.created_at); dayB.setHours(0,0,0,0);
      if (dayB.getTime() !== dayA.getTime()) return dayB.getTime() - dayA.getTime();
    }
    const statusA = getStatusWeight(a.status);
    const statusB = getStatusWeight(b.status);
    if (statusA !== statusB) return statusA - statusB;

    const tfA = getTfWeight(a.timeframe);
    const tfB = getTfWeight(b.timeframe);
    if (tfA !== tfB) return tfA - tfB;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  grouped.today.sort((a, b) => sortSetups(a, b, false));
  grouped.yesterday.sort((a, b) => sortSetups(a, b, false));
  grouped.older.sort((a, b) => sortSetups(a, b, true));

  const ArchiveCard = ({ setup }: { setup: any }) => {
    const dateObj = new Date(setup.created_at)
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const displayText = setup.title || setup.content || `${asset} Setup`
    
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    const isPrime = setup.is_prime === true;
    
    const { hasAccess, requiredTier } = getSetupAccess(setup, userPlan)

    const status = (setup.status || 'WAITING').toUpperCase()
    let statusLine = "bg-neutral-800 group-hover:bg-neutral-600"
    
    if (status === 'ACTIVE') statusLine = "bg-blue-500/50 group-hover:bg-blue-400 group-hover:shadow-[-3px_0_10px_rgba(59,130,246,0.5)]"
    else if (status === 'WAITING') statusLine = "bg-amber-500/50 group-hover:bg-amber-400 group-hover:shadow-[-3px_0_10px_rgba(245,158,11,0.5)]"
    else if (status === 'DONE') statusLine = "bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[-3px_0_10px_rgba(16,185,129,0.5)]"
    else if (status === 'INVALID') statusLine = "bg-red-500/50 group-hover:bg-red-400 group-hover:shadow-[-3px_0_10px_rgba(239,68,68,0.5)]"
    else if (status === 'CANCELED') statusLine = "bg-neutral-600/50 group-hover:bg-neutral-400 group-hover:shadow-[-3px_0_10px_rgba(163,163,163,0.5)]"
    else if (status === 'ARCHIVED') statusLine = "bg-neutral-700/50 group-hover:bg-neutral-500 group-hover:shadow-[-3px_0_10px_rgba(115,115,115,0.5)]"

    const isFaded = status === 'CANCELED' || status === 'ARCHIVED'

    const handleCardClick = () => {
      // 🚨 FIX: Now passing the exact setup ID to the Viewport
      const tfQuery = setup.timeframe ? `&tf=${encodeURIComponent(setup.timeframe)}` : '';
      const idQuery = setup.id ? `&id=${setup.id}` : '';
      router.push(`/markets/viewport?asset=${asset}${tfQuery}${idQuery}&from=archive`);
    };

    return (
      <div 
        onClick={handleCardClick}
        className={`bg-[#0a0a0a] border rounded-xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative min-h-[180px] md:min-h-[200px]
          ${isPrime ? 'border-blue-500/30 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'border-neutral-800 hover:border-neutral-600 shadow-sm'}
          ${isFaded ? 'opacity-60 hover:opacity-100' : ''}
        `}
      >
        {/* IMAGE AREA */}
        <div className="h-24 md:h-28 w-full bg-[#050505] relative overflow-hidden border-b border-neutral-800/50 shrink-0">
          <img 
            src={setup.image_url} 
            alt={`${asset} Chart`} 
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
        <div className="relative p-3 md:p-4 flex flex-col flex-1 justify-between z-10">
          <div className={`absolute top-0 right-0 inset-y-0 w-1 transition-all duration-500 z-30 ${statusLine}`} />
          
          <div className="flex justify-between items-start mb-2 pr-2">
            <div className="flex flex-col gap-1.5">
              <h3 className={`text-[13px] md:text-sm font-black uppercase tracking-wider transition-colors ${hasAccess ? 'text-neutral-200 group-hover:text-white' : 'text-neutral-600'}`}>
                {asset}
              </h3>
              
              <div className="flex items-center gap-1.5">
                {hasAccess && (
                  <span className="bg-[#111] px-1.5 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest border border-white/5 shadow-inner">
                    {setup.timeframe || '-'}
                  </span>
                )}
                {hasAccess && (
                  <span className="flex items-center justify-center bg-[#111] w-5 h-5 rounded border border-white/5 shadow-inner">
                    {isBull ? <TrendingUp size={10} className="text-emerald-400" /> : isBear ? <TrendingDown size={10} className="text-red-400" /> : <Minus size={10} className="text-neutral-500" />}
                  </span>
                )}
                {isPrime && (
                  <div className="flex items-center justify-center w-5 h-5 rounded border bg-blue-500/10 border-blue-500/20 shadow-sm" title="Prime Setup">
                    <Target size={10} className="text-blue-400" />
                  </div>
                )}
              </div>
            </div>
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
