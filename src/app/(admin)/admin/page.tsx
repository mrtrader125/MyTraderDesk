'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, DollarSign, Activity, TrendingUp, Loader2, BarChart2, CheckCircle2 } from 'lucide-react'

// Accurate Sentinel Vortex Pricing (Split by cycle)
const PRICING = {
  essential: { monthly: 4.99, yearly: 49.99 },
  pro: { monthly: 9.99, yearly: 99.99 }
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>({
    loading: true,
    revenue: { monthly: 0, yearly: 0 },
    paidUsers: 0,
    signups: { today: 0, yesterday: 0, week: 0 },
    setups: { today: 0, yesterday: 0, week: 0, older: 0 },
    plans: { free: 0, essential: 0, pro: 0 }
  })

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Time Setup
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1)
      const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - 7)
      const startOfMonth = new Date(startOfToday); startOfMonth.setDate(startOfMonth.getDate() - 30)

      // 2. Fetch Profiles (Users) - Must include billing_cycle
      const { data: profiles } = await supabase.from('profiles').select('created_at, plan, billing_cycle')
      
      // 3. Fetch Analyses (Setups) from ONLY the last 30 days
      const { data: analyses } = await supabase
        .from('analyses')
        .select('created_at')
        .gte('created_at', startOfMonth.toISOString())

      if (profiles && analyses) {
        // --- PROCESS USERS & REVENUE ---
        let monthlyRev = 0
        let yearlyRev = 0
        let paidUsers = 0
        const signups = { today: 0, yesterday: 0, week: 0 }
        const plans = { free: 0, essential: 0, pro: 0 }

        profiles.forEach(p => {
          const joinedAt = new Date(p.created_at).getTime()
          const plan = (p.plan || 'free').toLowerCase()
          const cycle = (p.billing_cycle || 'monthly').toLowerCase()
          
          // Growth Metrics
          if (joinedAt >= startOfToday.getTime()) signups.today++
          else if (joinedAt >= startOfYesterday.getTime()) signups.yesterday++
          if (joinedAt >= startOfWeek.getTime()) signups.week++

          // Revenue & Plan Metrics
          if (plan === 'essential') { 
            plans.essential++
            paidUsers++
            if (cycle === 'yearly') yearlyRev += PRICING.essential.yearly
            else monthlyRev += PRICING.essential.monthly
          }
          else if (plan === 'pro') { 
            plans.pro++
            paidUsers++
            if (cycle === 'yearly') yearlyRev += PRICING.pro.yearly
            else monthlyRev += PRICING.pro.monthly
          }
          else { 
            plans.free++ 
          }
        })

        // --- PROCESS SETUPS (Content Health) ---
        const setups = { today: 0, yesterday: 0, week: 0, older: 0 }
        
        analyses.forEach(a => {
          const postedAt = new Date(a.created_at).getTime()
          if (postedAt >= startOfToday.getTime()) setups.today++
          else if (postedAt >= startOfYesterday.getTime()) setups.yesterday++
          else if (postedAt >= startOfWeek.getTime()) setups.week++
          else setups.older++
        })

        setData({ 
          loading: false, 
          revenue: { monthly: monthlyRev, yearly: yearlyRev }, 
          paidUsers, signups, setups, plans 
        })
      }
    }

    fetchDashboardData()
  }, [])

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-xs">Aggregating Financials...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-10">
      
      {/* HEADER */}
      <div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Command <span className="text-red-600">Center</span>
        </h2>
        <p className="text-neutral-500 mt-2 font-medium italic">High-Level Financials & Output Metrics</p>
      </div>

      {/* TOP ROW: REVENUE & GROWTH KPI'S */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        <RevenueCard monthly={data.revenue.monthly} yearly={data.revenue.yearly} />
        <StatCard label="Active Paid Users" value={data.paidUsers} icon={Users} color="text-brand-primary" />
        <StatCard label="Signups Today" value={data.signups.today} icon={TrendingUp} color="text-white" />
        <StatCard label="Signups This Week" value={data.signups.week} icon={Activity} color="text-neutral-400" />
      </div>

      {/* BOTTOM ROW: SPLIT INTELLIGENCE & PLAN DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Content Health (30-Day Window) */}
        <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <Activity size={16} className="mr-2 text-red-600" /> Intelligence Output (Last 30 Days)
          </h3>
          
          <div className="space-y-4">
            <TimeRow label="Deployed Today" count={data.setups.today} highlight={true} />
            <TimeRow label="Deployed Yesterday" count={data.setups.yesterday} />
            <TimeRow label="Earlier This Week" count={data.setups.week} />
            <TimeRow label="Older (7-30 Days)" count={data.setups.older} dim={true} />
          </div>
        </div>

        {/* RIGHT: Plan Distribution */}
        <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <BarChart2 size={16} className="mr-2 text-brand-primary" /> Plan Distribution
          </h3>
          
          <div className="space-y-4">
            <PlanRow label="Pro Tier" count={data.plans.pro} color="text-brand-primary" />
            <PlanRow label="Essential Tier" count={data.plans.essential} color="text-blue-500" />
            <PlanRow label="Free Tier" count={data.plans.free} color="text-neutral-500" />
          </div>

          <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between">
            <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Total Database Size</span>
            <span className="text-xl font-black text-white">{data.plans.free + data.paidUsers}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function RevenueCard({ monthly, yearly }: { monthly: number, yearly: number }) {
  return (
    <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between">
      <div className="relative z-10">
        <DollarSign size={24} className="text-emerald-500 mb-5" />
        
        <div className="mb-5">
          <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Monthly Subs</div>
          <div className="text-3xl font-black text-white tracking-tighter">
            ${monthly.toFixed(2)}<span className="text-sm text-neutral-600 font-bold tracking-normal">/mo</span>
          </div>
        </div>

        <div className="pt-4 border-t border-card-border">
          <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Yearly Subs</div>
          <div className="text-xl font-black text-emerald-400 tracking-tighter">
            ${yearly.toFixed(2)}<span className="text-xs text-emerald-500/50 font-bold tracking-normal">/yr</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-600/5 rounded-full blur-3xl group-hover:bg-emerald-600/10 transition-all"></div>
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-app-bg border border-card-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-500 flex flex-col">
      <div className="relative z-10">
        <Icon size={24} className={`${color} mb-5`} />
        <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-4xl font-black text-white tracking-tighter">{value}</div>
      </div>
    </div>
  )
}

function TimeRow({ label, count, highlight = false, dim = false }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${highlight ? 'bg-red-500/5 border-red-500/20 text-white' : dim ? 'bg-transparent border-transparent text-neutral-600' : 'bg-white/[0.02] border-white/5 text-neutral-400'}`}>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className={`text-lg font-black ${highlight ? 'text-red-500' : ''}`}>{count} Setups</span>
    </div>
  )
}

function PlanRow({ label, count, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center space-x-3">
        <CheckCircle2 size={16} className={color} />
        <span className="text-xs font-bold uppercase tracking-widest text-white">{label}</span>
      </div>
      <span className="text-sm font-black text-white">{count} Users</span>
    </div>
  )
}
