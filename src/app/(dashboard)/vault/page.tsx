'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bookmark, Lock, Clock, Shield, Crown, TrendingUp, TrendingDown, Minus, Trash2, Activity, FolderOpen } from 'lucide-react'

const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD']

export default function VaultPage() {
  const router = useRouter()
  const [vaultItems, setVaultItems] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVaultData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
          if (profile?.plan) setUserPlan(profile.plan.toLowerCase())
        }

        const saved = localStorage.getItem('analysis_watchlist')
        if (saved) {
          const parsed = JSON.parse(saved)
          const validIds = parsed.map((item: any) => item.id).filter(Boolean)

          if (validIds.length > 0) {
            const { data, error } = await supabase.from('analyses').select('*').in('id', validIds)

            if (!error && data) {
              const sortedData = validIds.map((id: string) => data.find(d => d.id === id)).filter(Boolean)
              setVaultItems(sortedData)
            }
          }
        }
      } catch (err) {
        console.error("Vault Load Error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadVaultData()
  }, [])

  const removeFromVault = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation()
    const updatedItems = vaultItems.filter(item => item.id !== idToRemove)
    setVaultItems(updatedItems)

    const saved = localStorage.getItem('analysis_watchlist')
    if (saved) {
      const parsed = JSON.parse(saved)
      const updatedStorage = parsed.filter((item: any) => item.id !== idToRemove)
      localStorage.setItem('analysis_watchlist', JSON.stringify(updatedStorage))
    }
  }

  const getSetupAccess = (setup: any) => {
    if (!setup) return { hasAccess: false, requiredTier: 'PRO' }

    const isCore = CORE_ASSETS.includes(setup.asset_symbol || '')
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

    return { hasAccess, requiredTier }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-amber-500" size={32} />
        <span className="text-[10px] font-black tracking-widest uppercase text-neutral-500">Unlocking Vault...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-800">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
            <Bookmark size={24} className="fill-amber-500 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">The <span className="text-amber-500">Vault</span></h1>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Personalized Intelligence Watchlist</p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Saved Targets</span>
          <span className="text-2xl font-black text-white tracking-tighter">{vaultItems.length}</span>
        </div>
      </div>

      {vaultItems.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto mt-20 border border-dashed border-neutral-800 rounded-3xl p-16 flex flex-col items-center text-center bg-[#0a0a0a]">
          <FolderOpen size={48} className="text-neutral-700 mb-6" />
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Vault is Empty</h3>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed max-w-sm mb-8">
            You haven't pinned any active setups yet. Bookmark setups from the dashboard or market feed to monitor them here.
          </p>
          <button onClick={() => router.push('/dashboard')} className="px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors">
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {vaultItems.map((setup) => {
            const { hasAccess, requiredTier } = getSetupAccess(setup)
            const isBull = setup.bias?.toUpperCase() === 'BULLISH'
            const isBear = setup.bias?.toUpperCase() === 'BEARISH'

            return (
              <div 
                key={setup.id}
                // NEW URL ARGUMENT HERE: &tf=${setup.timeframe}
                onClick={() => router.push(`/analysis/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}`)}
                className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all duration-300 min-h-[240px]"
              >
                <div className="h-36 w-full bg-black relative overflow-hidden border-b border-neutral-800/50">
                  <img src={setup.image_url} alt="Setup" className={`w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-50 group-hover:opacity-100 group-hover:scale-105' : 'opacity-10 blur-md grayscale'}`} />
                  
                  {!hasAccess && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                      <Lock size={20} className={requiredTier === 'PRO' ? 'text-brand-primary mb-2' : 'text-blue-500 mb-2'} />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest bg-white/10 px-3 py-1 rounded-md border border-white/10 shadow-lg">
                        {requiredTier} REQUIRED
                      </span>
                    </div>
                  )}

                  {hasAccess && (
                    <div className="absolute top-3 left-3 bg-[#0a0a0a]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                      {setup.timeframe || '-'}
                    </div>
                  )}
                  
                  <button onClick={(e) => removeFromVault(e, setup.id)} className="absolute top-3 right-3 p-2 bg-red-500/80 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-300 shadow-lg transform translate-y-2 group-hover:translate-y-0" title="Remove from Vault">
                    <Trash2 size={14} />
                  </button>

                  <div className={`absolute bottom-3 right-3 p-1.5 rounded-lg backdrop-blur-md border shadow-lg ${isBull ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : isBear ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'}`}>
                    {isBull ? <TrendingUp size={14} /> : isBear ? <TrendingDown size={14} /> : <Minus size={14} />}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">{setup.asset_symbol}</h3>
                    <p className={`text-[11px] font-bold line-clamp-2 leading-snug mt-1.5 transition-colors ${hasAccess ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-600'}`}>
                      {hasAccess ? (setup.title || 'Live intelligence analysis') : 'Clearance restricted pending upgrade or time delay.'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-neutral-500 pt-3 border-t border-neutral-800/80">
                    <span className="flex items-center"><Clock size={10} className="mr-1.5" /> {new Date(setup.created_at).toLocaleDateString()}</span>
                    <span className="text-amber-500 flex items-center"><Bookmark size={10} className="fill-amber-500 mr-1" /> Pinned</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
