'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Lock, Clock, Shield, TrendingUp, TrendingDown, Minus, Target, Archive } from 'lucide-react'
import { PLAN_CONFIG, getAssetCategory } from '@/lib/platformConfig'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const getSetupAccess = (setup: any, userPlan: string) => {
  if (!setup) return { hasAccess: false, requiredTier: 'pro' };
  if (userPlan === 'pro' || userPlan === 'premium') return { hasAccess: true, requiredTier: 'free' };
  const category = getAssetCategory(setup.asset_symbol);
  const isAllowedCategory = PLAN_CONFIG.free.allowedCategories.includes(category);
  if (!isAllowedCategory) return { hasAccess: false, requiredTier: 'pro' };
  if (setup.tier_access === 'free') return { hasAccess: true, requiredTier: 'free' };
  const postTime = new Date(setup.created_at).getTime();
  const hoursSincePosted = (new Date().getTime() - postTime) / (1000 * 60 * 60);
  if (hoursSincePosted >= PLAN_CONFIG.free.delayHours) return { hasAccess: true, requiredTier: 'free' };
  return { hasAccess: false, requiredTier: 'pro' };
}

const getTfWeight = (tf: string) => {
  const cleanTf = (tf || '').trim().toLowerCase();
  if (['1m', '1min'].includes(cleanTf)) return 1;
  if (['5m', '5mins', '5min'].includes(cleanTf)) return 2;
  if (['15m', '15mins', '15min'].includes(cleanTf)) return 3;
  if (['30m', '30mins', '30min'].includes(cleanTf)) return 4;
  if (['1h', '1hr', 'h1'].includes(cleanTf)) return 5;
  if (['2h', '2hr', 'h2'].includes(cleanTf)) return 6;
  if (['4h', '4hr', 'h4'].includes(cleanTf)) return 7;
  if (['d', '1d', 'daily'].includes(cleanTf)) return 8;
  if (['w', '1w', 'weekly'].includes(cleanTf)) return 9;
  if (['m', '1mo', 'monthly'].includes(cleanTf)) return 10;
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

const generateDemoHistory = (assetSymbol: string) => {
  const now = Date.now();
  return [
    {
      id: `demo-hist-1`, asset_symbol: assetSymbol, timeframe: '4H', bias: 'BULLISH', status: 'ACTIVE',
      image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date(now - 100000).toISOString(), tier_access: 'pro', is_prime: true
    },
    {
      id: `demo-hist-2`, asset_symbol: assetSymbol, timeframe: '15M', bias: 'BEARISH', status: 'DONE',
      image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date(now - 86400000).toISOString(), tier_access: 'pro', is_prime: false
    }
  ];
};

// 🚀 SWR FETCHER
const fetchArchiveData = async ([key, asset]: string[]) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const [ { data: profile }, { data: history } ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', session.user.id).single(),
    supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
  ])

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';
  const safeHistory = history?.map((setup: any) => {
    if (isPro) return setup
    return { ...setup, notes: null, content: null }
  }) || []

  return { plan: profile?.plan?.toLowerCase() || 'demo', history: safeHistory, userId: session.user.id }
}

export default function ArchiveClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const asset = searchParams.get('asset')

  useEffect(() => {
    if (!asset) router.push('/markets')
  }, [asset, router])

  // 🚀 SWR CACHE
  const { data, isLoading } = useSWR(asset ? ['archive_data', asset] : null, fetchArchiveData, { dedupingInterval: 60000 })

  if (isLoading || !data) {
    return (
      <div className="w-full bg-transparent p-4 md:p-8 flex flex-col h-[calc(100dvh-65px)]">
        <div className="max-w-[90rem] mx-auto w-full flex flex-col min-h-0">
          <div className="shrink-0 w-64 mb-8 h-8 bg-[#0a0a0a] rounded-md animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-white/[0.02] rounded-xl h-[160px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isProUser = data.plan === 'pro' || data.plan === 'premium'
  const history = isProUser ? data.history : generateDemoHistory(asset!)
  
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)
  const yesterdayDate = new Date(todayDate); yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const grouped = { today: [] as any[], yesterday: [] as any[], older: [] as any[] }

  history.forEach(setup => {
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
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    const isPrime = setup.is_prime === true;
    
    const { hasAccess, requiredTier } = getSetupAccess(setup, data.plan)
    const status = (setup.status || 'WAITING').toUpperCase()
    
    let statusColor = "text-neutral-500"
    if (status === 'ACTIVE') statusColor = "text-blue-400"
    else if (status === 'WAITING') statusColor = "text-amber-500/80"
    else if (status === 'DONE') statusColor = "text-emerald-500/80"
    else if (status === 'INVALID') statusColor = "text-red-500/80"

    const isFaded = status === 'CANCELED' || status === 'ARCHIVED'

    const handleCardClick = () => {
      if (!isProUser) return;
      const tfQuery = setup.timeframe ? `&tf=${encodeURIComponent(setup.timeframe)}` : '';
      const idQuery = setup.id ? `&id=${setup.id}` : '';
      router.push(`/markets/viewport?asset=${asset}${tfQuery}${idQuery}&from=archive`);
    };

    return (
      <div 
        onClick={handleCardClick}
        className={`bg-[#0a0a0a] border rounded-xl overflow-hidden flex flex-col transition-all duration-200 relative min-h-[160px]
          ${!isProUser ? 'opacity-50 grayscale cursor-not-allowed' : 'group cursor-pointer hover:bg-[#0c0c0c] hover:border-white/[0.15]'}
          ${isPrime && isProUser ? 'border-blue-500/30' : 'border-white/[0.04]'}
          ${isFaded ? 'opacity-60 hover:opacity-100' : ''}
        `}
      >
        <div className="h-20 w-full bg-black relative overflow-hidden border-b border-white/[0.05] shrink-0">
          <img 
            src={setup.image_url} 
            alt={`${asset} Chart`} 
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hasAccess ? 'opacity-40 group-hover:opacity-80' : 'opacity-10 blur-sm'} ${status === 'ARCHIVED' ? 'grayscale-[80%]' : ''}`} 
          />
          
          {/* Top minimal status indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${statusColor} bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm`}>
              {status}
            </span>
          </div>

          {!hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
              <Lock size={12} className="text-neutral-500 mb-1" />
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1 justify-between z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {hasAccess && <span className="text-[11px] font-mono text-white tracking-widest">{setup.timeframe || '-'}</span>}
              {hasAccess && (
                <span className="flex items-center justify-center">
                  {isBull ? <TrendingUp size={12} className="text-emerald-400" /> : isBear ? <TrendingDown size={12} className="text-red-400" /> : <Minus size={12} className="text-neutral-500" />}
                </span>
              )}
              {isPrime && <Target size={12} className="text-blue-500" title="Prime Setup" />}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-600 uppercase mt-auto pt-2 border-t border-white/[0.02]">
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-transparent font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0 p-4 md:p-8">
        
        {/* Sleek Minimalist Header */}
        <div className="shrink-0 w-full mb-6 relative border-b border-white/[0.05] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/markets" className="text-neutral-500 hover:text-white transition-colors duration-200">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight">{asset}</h1>
              <span className="text-[10px] md:text-xs font-medium text-neutral-500 tracking-widest uppercase">Archive</span>
            </div>
          </div>
          
          {!isProUser && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-md border border-white/[0.05] text-neutral-500">
              <Lock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Read-Only</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-10">
          <div className="space-y-8 md:space-y-10 relative z-20">
            
            {grouped.today.length > 0 && (
              <section className="animate-in fade-in duration-500">
                <h2 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-3">
                  Today <div className="h-px flex-1 bg-white/[0.05]"></div>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {grouped.today.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
                </div>
              </section>
            )}
            
            {grouped.yesterday.length > 0 && (
              <section className="animate-in fade-in duration-500 delay-100">
                <h2 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-3">
                  Yesterday <div className="h-px flex-1 bg-white/[0.05]"></div>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {grouped.yesterday.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
                </div>
              </section>
            )}
            
            {grouped.older.length > 0 && (
              <section className="animate-in fade-in duration-500 delay-200">
                <h2 className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest mb-3 flex items-center gap-3">
                  Older Records <div className="h-px flex-1 bg-white/[0.02]"></div>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 transition-opacity">
                  {grouped.older.map(setup => <ArchiveCard key={setup.id} setup={setup} />)}
                </div>
              </section>
            )}
            
            {history.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center opacity-40">
                <Archive size={24} className="text-neutral-600 mb-3" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">No historical records</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
