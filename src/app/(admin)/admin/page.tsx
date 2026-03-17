'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Crown, Shield, Zap, Activity, Target, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    essentialUsers: 0,
    freeUsers: 0,
    totalSetups: 0,
    mrr: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGodModeStats() {
      try {
        // Fetch all profiles (Requires the SQL Admin Policy we discussed!)
        const { data: profiles } = await supabase.from('profiles').select('plan')
        
        // Fetch all active setups
        const { count: setupCount } = await supabase.from('analyses').select('*', { count: 'exact', head: true })

        if (profiles) {
          const pro = profiles.filter(p => p.plan === 'pro').length
          const essential = profiles.filter(p => p.plan === 'essential').length
          const free = profiles.filter(p => p.plan === 'free' || !p.plan).length
          
          // Estimate MRR based on monthly pricing (Adjust to match your exact numbers)
          const estimatedMRR = (pro * 9.99) + (essential * 4.99)

          setStats({
            totalUsers: profiles.length,
            proUsers: pro,
            essentialUsers: essential,
            freeUsers: free,
            totalSetups: setupCount || 0,
            mrr: estimatedMRR
          })
        }
      } catch (err) {
        console.error("Failed to load Admin Stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGodModeStats()
  }, [])

  if (loading) {
    return <div className="animate-pulse flex items-center text-brand-primary"><Activity size={24} className="mr-3" /> <span className="text-xs font-black uppercase tracking-widest">Aggregating Data...</span></div>
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-neutral-600 transition-colors shadow-sm">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-xl bg-[#050505] border border-neutral-800 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{value}</h3>
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">{title}</span>
        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider mt-3 block border-t border-neutral-800/50 pt-3">{subtitle}</span>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Network <span className="text-brand-primary">Overview</span></h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Real-time platform telemetry and revenue metrics.</p>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Operators" 
          value={stats.totalUsers} 
          subtitle="Registered accounts"
          icon={Users} 
          colorClass="text-white" 
        />
        <MetricCard 
          title="Estimated MRR" 
          value={`$${stats.mrr.toFixed(2)}`} 
          subtitle="Monthly Recurring Revenue"
          icon={DollarSign} 
          colorClass="text-emerald-500" 
        />
        <MetricCard 
          title="Pro Clearances" 
          value={stats.proUsers} 
          subtitle={`${((stats.proUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}% Conversion Rate`}
          icon={Crown} 
          colorClass="text-brand-primary" 
        />
        <MetricCard 
          title="Active Deployments" 
          value={stats.totalSetups} 
          subtitle="Intelligence assets in database"
          icon={Target} 
          colorClass="text-blue-500" 
        />
      </div>

      {/* PLAN BREAKDOWN BAR */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <TrendingUp className="mr-2 text-neutral-500" size={16} /> Tier Distribution
        </h3>
        
        <div className="w-full h-4 rounded-full flex overflow-hidden bg-neutral-900 mb-6">
          <div style={{ width: `${(stats.proUsers / (stats.totalUsers || 1)) * 100}%` }} className="h-full bg-brand-primary transition-all duration-1000"></div>
          <div style={{ width: `${(stats.essentialUsers / (stats.totalUsers || 1)) * 100}%` }} className="h-full bg-blue-500 transition-all duration-1000"></div>
          <div style={{ width: `${(stats.freeUsers / (stats.totalUsers || 1)) * 100}%` }} className="h-full bg-neutral-700 transition-all duration-1000"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4">
            <span className="text-xl font-black text-brand-primary block mb-1">{stats.proUsers}</span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Pro</span>
          </div>
          <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4">
            <span className="text-xl font-black text-blue-500 block mb-1">{stats.essentialUsers}</span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Essential</span>
          </div>
          <div className="bg-[#050505] border border-neutral-800 rounded-xl p-4">
            <span className="text-xl font-black text-white block mb-1">{stats.freeUsers}</span>
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Free</span>
          </div>
        </div>
      </div>

    </div>
  )
}
