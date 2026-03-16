'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Star, Zap, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0, free: 0, pro: 0, premium: 0, loading: true
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function getRealStats() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan_type')

        if (error) {
          setErrorMsg(error.message)
          setStats(prev => ({ ...prev, loading: false }))
          return
        }

        if (data) {
          const total = data.length
          const free = data.filter(u => !u.plan_type || u.plan_type === 'free').length
          const pro = data.filter(u => u.plan_type === 'pro').length
          const premium = data.filter(u => u.plan_type === 'premium').length
          setStats({ total, free, pro, premium, loading: false })
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Unknown Connection Error')
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    getRealStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Synchronizing Core Database...</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Command <span className="text-red-600">Center</span></h2>
        <p className="text-neutral-500 mt-2 font-medium italic">Live Metrics // My Trader Desk</p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
          <AlertCircle size={16} />
          Error: {errorMsg} (Did you add the 'plan_type' column to SQL?)
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Operators" value={stats.total} color="text-white" icon={Users} />
        <StatCard label="Free Tier" value={stats.free} color="text-neutral-500" icon={Zap} />
        <StatCard label="Pro Members" value={stats.pro} color="text-blue-500" icon={Zap} />
        <StatCard label="Premium Elite" value={stats.premium} color="text-red-500" icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 p-8 rounded-[32px]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <ShieldCheck size={16} className="mr-2 text-red-600" /> Database Status
          </h3>
          <div className="flex items-center justify-between py-3 border-b border-card-border transition-colors duration-700">
            <div className="text-xs text-neutral-400 font-medium italic uppercase">Supabase Status</div>
            <div className="text-[10px] font-black text-green-500 uppercase px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">Online</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-app-bg transition-colors duration-700 border border-card-border transition-colors duration-700 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
      <div className="relative z-10">
        <Icon size={24} className={`${color} mb-4`} />
        <div className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-4xl font-black text-white tracking-tighter">{value.toLocaleString()}</div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all"></div>
    </div>
  )
}

