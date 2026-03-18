'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, DollarSign, Activity, TrendingUp, Shield, Crown, Zap, BarChart2, Target } from 'lucide-react'

// Accurate Pricing (Split by cycle)
const PRICING = {
  essential: { monthly: 4.99, yearly: 49.99 },
  pro: { monthly: 9.99, yearly: 99.99 }
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>({
    loading: true,
    revenue: { monthly: 0, yearly: 0 },
    paidUsers: 0,
    totalUsers: 0,
    signups: { today: 0, yesterday: 0, week: 0 },
    setups: { today: 0, yesterday: 0, week: 0, older: 0, total: 0 },
    plans: { free: 0, essential: 0, pro: 0 }
  })

  useEffect(() => {
    async function fetchGodModeStats() {
      // 1. Time Boundaries
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1)
      const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - 7)
      const startOfMonth = new Date(startOfToday); startOfMonth.setDate(startOfMonth.getDate() - 30)

      try {
        // 2. Fetch Profiles (Users)
        const { data: profiles } = await supabase.from('profiles').select('created_at, plan, billing_cycle')
        
        // 3. Fetch Analyses (Setups) from the last 30 days
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
          const setups = { today: 0, yesterday: 0, week: 0, older: 0, total: analyses.length }
          
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
            paidUsers, 
            totalUsers: profiles.length,
            signups, 
            setups, 
            plans 
          })
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err)
      }
    }

    fetchGodModeStats()
  }, [])

  if (data.loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Aggregating Telemetry...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          Network <span className="text-brand-primary">Telemetry</span>
        </h2>
        <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Real-time Financials & Output Metrics</p>
      </div>

      {/* TOP ROW: REVENUE & GROWTH KPI'S */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        
        {/* REVENUE CARD */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="p-2.5 bg-[#050505] border border-neutral-800 rounded-xl w-fit mb-4 text-emerald-500">
              <DollarSign size={18} />
            </div>
            
            <div className="mb-4">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Monthly MRR</div>
              <div className="text-3xl font-black text-white tracking-tighter">
                ${data.revenue.monthly.toFixed(2)}<span className="text-xs text-neutral-600 font-bold tracking-normal">/mo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/50">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Yearly ARR</div>
              <div className="text-lg font-black text-emerald-500 tracking-tighter">
                ${data.revenue.yearly.toFixed(2)}<span className="text-[10px] text-emerald-500/50 font-bold tracking-normal">/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <StatCard label="Total Operators" value={data.totalUsers} subValue={`${data.paidUsers} Paid Seats`} icon={Users} color="text-white" />
        <StatCard label="New Signups (Today)" value={data.signups.today} subValue={`${data.signups.week} This Week`} icon={TrendingUp} color="text-brand-primary" />
        <StatCard label="Active Deployments" value={data.setups.total} subValue="Last 30 Days" icon={Target} color="text-blue-500" />
      </div>

      {/* BOTTOM ROW: SPLIT INTELLIGENCE & PLAN DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Content Health (30-Day Window) */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <Activity size={16} className="mr-2 text-brand-primary" /> Intelligence Output
          </h3>
          
          <div className="space-y-3">
            <TimeRow label="Deployed Today" count={data.setups.today} highlight={true} />
            <TimeRow label="Deployed Yesterday" count={data.setups.yesterday} />
            <TimeRow label="Earlier This Week" count={data.setups.week} />
            <TimeRow label="Older (7-30 Days)" count={data.setups.older} dim={true} />
          </div>
        </div>

        {/* RIGHT: Plan Distribution */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <BarChart2 size={16} className="mr-2 text-blue-500" /> Clearance Distribution
          </h3>
          
          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full flex overflow-hidden bg-neutral-900 mb-6 border border-neutral-800">
            <div style={{ width: `${(data.plans.pro / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-brand-primary transition-all duration-1000"></div>
            <div style={{ width: `${(data.plans.essential / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-blue-500 transition-all duration-1000"></div>
            <div style={{ width: `${(data.plans.free / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-neutral-700 transition-all duration-1000"></div>
          </div>

          <div className="space-y-3 flex-1">
            <PlanRow label="Pro Tier" count={data.plans.pro} icon={Crown} color="text-brand-primary" />
            <PlanRow label="Essential Tier" count={data.plans.essential} icon={Shield} color="text-blue-500" />
            <PlanRow label="Free Tier" count={data.plans.free} icon={Zap} color="text-neutral-500" />
          </div>
        </div>

      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, subValue, color, icon: Icon }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-neutral-600 transition-all duration-500 flex flex-col justify-between">
      <div className="relative z-10">
        <div className={`p-2.5 bg-[#050505] border border-neutral-800 rounded-xl w-fit mb-4 ${color}`}>
          <Icon size={18} />
        </div>
        <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
      </div>
      <div className="pt-3 mt-4 border-t border-neutral-800/50">
        <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{subValue}</div>
      </div>
    </div>
  )
}

function TimeRow({ label, count, highlight = false, dim = false }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${highlight ? 'bg-brand-primary/5 border-brand-primary/20 text-white' : dim ? 'bg-[#050505] border-neutral-900 text-neutral-600' : 'bg-[#050505] border-neutral-800 text-neutral-400'}`}>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black ${highlight ? 'text-brand-primary' : ''}`}>{count} <span className="text-[9px] text-neutral-600">SETUPS</span></span>
    </div>
  )
}

function PlanRow({ label, count, color, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#050505] border border-neutral-800">
      <div className="flex items-center space-x-3">
        <Icon size={14} className={color} />
        <span className="text-[10px] font-black uppercase tracking-widest text-white">{label}</span>
      </div>
      <span className="text-sm font-black text-white">{count} <span className="text-[9px] text-neutral-600 uppercase">Users</span></span>
    </div>
  )
}
