'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, DollarSign, Activity, TrendingUp, Shield, Crown, Zap, BarChart2, Target, Search, AlertTriangle } from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/platformConfig'

export default function AdminDashboard() {
  const [data, setData] = useState<any>({
    loading: true,
    revenue: { monthly: 0, yearly: 0 },
    paidUsers: 0,
    totalUsers: 0,
    signups: { today: 0, yesterday: 0, week: 0 },
    setups: { today: 0, yesterday: 0, week: 0, older: 0, total: 0 },
    plans: { free: 0, essential: 0, pro: 0, premium: 0 },
    topSearches: [],
    recentActivity: []
  })

  useEffect(() => {
    async function fetchGodModeStats() {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1)
      const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - 7)
      const startOfMonth = new Date(startOfToday); startOfMonth.setDate(startOfMonth.getDate() - 30)

      try {
        const { data: profiles } = await supabase.from('profiles').select('id, created_at, plan, billing_cycle, full_name')
        const { data: analyses } = await supabase.from('analyses').select('created_at').gte('created_at', startOfMonth.toISOString())
        
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (profiles && analyses) {
          let monthlyRev = 0
          let yearlyRev = 0
          let paidUsers = 0
          const signups = { today: 0, yesterday: 0, week: 0 }
          const plans = { free: 0, essential: 0, pro: 0, premium: 0 }
          const profileMap: Record<string, string> = {}

          profiles.forEach(p => {
            profileMap[p.id] = p.full_name || 'Unknown Operator'
            const joinedAt = new Date(p.created_at).getTime()
            const plan = (p.plan || 'free').toLowerCase()
            const cycle = (p.billing_cycle || 'monthly').toLowerCase()
            
            if (joinedAt >= startOfToday.getTime()) signups.today++
            else if (joinedAt >= startOfYesterday.getTime()) signups.yesterday++
            if (joinedAt >= startOfWeek.getTime()) signups.week++

            // Dynamic Revenue Calculation based on platformConfig
            if (plan === 'essential') { 
              plans.essential++; paidUsers++;
              monthlyRev += cycle === 'yearly' ? (PLAN_CONFIG.essential.priceYearly / 12) : PLAN_CONFIG.essential.priceMonthly;
              yearlyRev += cycle === 'yearly' ? PLAN_CONFIG.essential.priceYearly : (PLAN_CONFIG.essential.priceMonthly * 12);
            }
            else if (plan === 'pro') { 
              plans.pro++; paidUsers++;
              monthlyRev += cycle === 'yearly' ? (PLAN_CONFIG.pro.priceYearly / 12) : PLAN_CONFIG.pro.priceMonthly;
              yearlyRev += cycle === 'yearly' ? PLAN_CONFIG.pro.priceYearly : (PLAN_CONFIG.pro.priceMonthly * 12);
            }
            else if (plan === 'premium') { 
              plans.premium++; paidUsers++;
              monthlyRev += cycle === 'yearly' ? (PLAN_CONFIG.premium.priceYearly / 12) : PLAN_CONFIG.premium.priceMonthly;
              yearlyRev += cycle === 'yearly' ? PLAN_CONFIG.premium.priceYearly : (PLAN_CONFIG.premium.priceMonthly * 12);
            }
            else { plans.free++ }
          })

          const setups = { today: 0, yesterday: 0, week: 0, older: 0, total: analyses.length }
          analyses.forEach(a => {
            const postedAt = new Date(a.created_at).getTime()
            if (postedAt >= startOfToday.getTime()) setups.today++
            else if (postedAt >= startOfYesterday.getTime()) setups.yesterday++
            else if (postedAt >= startOfWeek.getTime()) setups.week++
            else setups.older++
          })

          const searchCounts: Record<string, number> = {}
          const activityFeed: any[] = []

          if (logs) {
            logs.forEach(log => {
              activityFeed.push({
                id: log.id,
                user: profileMap[log.user_id] || 'Unknown',
                action: log.action,
                target: log.search_query || log.asset_symbol || log.timeframe || '',
                time: new Date(log.created_at)
              })
              if (log.action === 'SEARCH' && log.search_query) {
                const term = log.search_query.toUpperCase()
                searchCounts[term] = (searchCounts[term] || 0) + 1
              }
            })
          }

          const topSearches = Object.entries(searchCounts)
            .map(([term, count]) => ({ term, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          setData({ 
            loading: false, 
            revenue: { monthly: monthlyRev, yearly: yearlyRev }, 
            paidUsers, totalUsers: profiles.length, signups, setups, plans,
            topSearches, recentActivity: activityFeed
          })
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err)
      }
    }

    fetchGodModeStats()
    const interval = setInterval(fetchGodModeStats, 30000)
    return () => clearInterval(interval)
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
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Network <span className="text-brand-primary">Telemetry</span></h2>
        <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Real-time Financials & Output Metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="p-2.5 bg-[#050505] border border-neutral-800 rounded-xl w-fit mb-4 text-emerald-500"><DollarSign size={18} /></div>
            <div className="mb-4">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Monthly MRR</div>
              <div className="text-3xl font-black text-white tracking-tighter">${data.revenue.monthly.toFixed(2)}<span className="text-xs text-neutral-600 font-bold tracking-normal">/mo</span></div>
            </div>
            <div className="pt-3 border-t border-neutral-800/50">
              <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Yearly ARR</div>
              <div className="text-lg font-black text-emerald-500 tracking-tighter">${data.revenue.yearly.toFixed(2)}<span className="text-[10px] text-emerald-500/50 font-bold tracking-normal">/yr</span></div>
            </div>
          </div>
        </div>

        <StatCard label="Total Operators" value={data.totalUsers} subValue={`${data.paidUsers} Paid Seats`} icon={Users} color="text-white" />
        <StatCard label="New Signups (Today)" value={data.signups.today} subValue={`${data.signups.week} This Week`} icon={TrendingUp} color="text-brand-primary" />
        <StatCard label="Active Deployments" value={data.setups.total} subValue="Last 30 Days" icon={Target} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center"><Activity size={16} className="mr-2 text-brand-primary" /> Intelligence Output</h3>
          <div className="space-y-3">
            <TimeRow label="Deployed Today" count={data.setups.today} highlight={true} />
            <TimeRow label="Deployed Yesterday" count={data.setups.yesterday} />
            <TimeRow label="Earlier This Week" count={data.setups.week} />
            <TimeRow label="Older (7-30 Days)" count={data.setups.older} dim={true} />
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center"><BarChart2 size={16} className="mr-2 text-blue-500" /> Clearance Distribution</h3>
          
          {/* UPDATED DISTRIBUTION BAR */}
          <div className="w-full h-3 rounded-full flex overflow-hidden bg-neutral-900 mb-6 border border-neutral-800">
            <div style={{ width: `${(data.plans.premium / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-amber-500 transition-all duration-1000"></div>
            <div style={{ width: `${(data.plans.pro / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-brand-primary transition-all duration-1000"></div>
            <div style={{ width: `${(data.plans.essential / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-blue-500 transition-all duration-1000"></div>
            <div style={{ width: `${(data.plans.free / (data.totalUsers || 1)) * 100}%` }} className="h-full bg-neutral-700 transition-all duration-1000"></div>
          </div>
          
          <div className="space-y-3 flex-1">
            <PlanRow label="Gold Premium" count={data.plans.premium} icon={Crown} color="text-amber-500" />
            <PlanRow label="Pro Tier" count={data.plans.pro} icon={Crown} color="text-brand-primary" />
            <PlanRow label="Essential Tier" count={data.plans.essential} icon={Shield} color="text-blue-500" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter italic mb-4 mt-4">Active <span className="text-brand-primary">Surveillance</span></h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center"><Search size={16} className="mr-2 text-white" /> Trending Assets</h3>
            {data.topSearches.length > 0 ? (
              <div className="space-y-4">
                {data.topSearches.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-white tracking-widest">{item.term}</span>
                      <span className="text-[10px] font-black text-neutral-500">{item.count} hits</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000 rounded-full" style={{ width: `${(item.count / data.topSearches[0].count) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-6 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">No recent search data</div>}
          </div>

          <div className="lg:col-span-2 bg-[#0a0a0a] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center"><Activity size={16} className="mr-2 text-blue-500" /> Operator Stream</h3>
              <div className="flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span></div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 space-y-2 scrollbar-hide">
              {data.recentActivity.length > 0 ? (
                data.recentActivity.map((log: any) => {
                  let actionColor = "text-neutral-500"; let actionText = log.action; let Icon = Activity;
                  if (log.action === 'SEARCH') { actionColor = "text-white"; actionText = "Searched for"; Icon = Search }
                  if (log.action === 'VIEW_CHART') { actionColor = "text-blue-500"; actionText = "Viewed Setup"; Icon = Target }
                  if (log.action === 'PAYWALL_BUMP') { actionColor = "text-red-500"; actionText = "Hit Paywall on"; Icon = AlertTriangle }
                  if (log.action === 'FILTER_CLICK') { actionColor = "text-neutral-400"; actionText = "Filtered by"; Icon = BarChart2 }
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-[#050505] border border-neutral-800/50">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`p-1.5 rounded-lg bg-neutral-900 ${actionColor}`}><Icon size={12} /></div>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-[10px] font-black text-white truncate">{log.user}</span>
                          <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest truncate">{actionText} <span className={actionColor}>{log.target}</span></span>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold text-neutral-600 shrink-0">{log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )
                })
              ) : <div className="text-center py-10 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Awaiting Network Activity...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, subValue, color, icon: Icon }: any) {
  return (
    <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-neutral-600 transition-all duration-500 flex flex-col justify-between">
      <div className="relative z-10">
        <div className={`p-2.5 bg-[#050505] border border-neutral-800 rounded-xl w-fit mb-4 ${color}`}><Icon size={18} /></div>
        <div className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
      </div>
      <div className="pt-3 mt-4 border-t border-neutral-800/50"><div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{subValue}</div></div>
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
