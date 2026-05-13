'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, Search, Filter, AlertTriangle, Target, BarChart2, ShieldAlert, Database, ArrowDownToLine, Eye, TrendingUp, Users } from 'lucide-react'

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Analytics State
  const [insights, setInsights] = useState({
    topSearches: [] as any[],
    topViews: [] as any[],
    tierViews: { free: [] as any[], essential: [] as any[], pro: [] as any[], premium: [] as any[] }
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('ALL')

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: activityLogs, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000)

        if (logsError) console.error("Logs Fetch Error:", logsError)

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, plan')

        if (profilesError) console.error("Profiles Fetch Error:", profilesError)

        if (activityLogs) {
          const profileMap: Record<string, any> = {}
          if (profiles) {
            profiles.forEach(p => { profileMap[p.id] = p })
          }

          // Tracking objects for Insights
          const searches: Record<string, number> = {}
          const views: Record<string, number> = {}
          const tierData: Record<string, Record<string, number>> = { free: {}, essential: {}, pro: {}, premium: {} }

          const enrichedLogs = activityLogs.map(log => {
            const userName = profileMap[log.user_id]?.full_name || 'Unknown User'
            const userPlan = (profileMap[log.user_id]?.plan || 'free').toLowerCase()
            const target = log.search_query || log.asset_symbol || log.timeframe || 'SYSTEM'

            // Aggregate Data for Insights
            if (log.action === 'SEARCH' && target !== 'SYSTEM') {
              const term = target.toUpperCase()
              searches[term] = (searches[term] || 0) + 1
            }
            if (log.action === 'VIEW_CHART' && target !== 'SYSTEM') {
              const asset = target.toUpperCase()
              views[asset] = (views[asset] || 0) + 1
              if (tierData[userPlan]) {
                tierData[userPlan][asset] = (tierData[userPlan][asset] || 0) + 1
              }
            }

            return { ...log, user_name: userName, user_plan: userPlan, target }
          })

          // Sort and slice top 5 for insights
          const sortObj = (obj: Record<string, number>) => Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5)

          setInsights({
            topSearches: sortObj(searches),
            topViews: sortObj(views),
            tierViews: {
              free: sortObj(tierData.free),
              essential: sortObj(tierData.essential),
              pro: sortObj(tierData.pro),
              premium: sortObj(tierData.premium)
            }
          })

          setLogs(enrichedLogs)
        }
      } catch (err) {
        console.error("Log Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  // Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesAction = actionFilter === 'ALL' ? true : log.action === actionFilter

    return matchesSearch && matchesAction
  })

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No data available to export.")
      return
    }

    const headers = ["Timestamp (UTC)", "User Name", "User ID", "Plan", "Action", "Target"]
    const csvRows = filteredLogs.map(log => [
      new Date(log.created_at).toISOString(),
      `"${log.user_name}"`, 
      log.user_id,
      log.user_plan.toUpperCase(),
      log.action,
      `"${log.target}"` 
    ])

    const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `platform_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const ACTION_TYPES = [
    { id: 'ALL', label: 'All Activity', icon: Database, color: 'text-white border-neutral-700 bg-neutral-800' },
    { id: 'SEARCH', label: 'Searches', icon: Search, color: 'text-white border-white/20 bg-white/5' },
    { id: 'VIEW_CHART', label: 'Chart Views', icon: Target, color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
    { id: 'PAYWALL_BUMP', label: 'Paywall Hits', icon: AlertTriangle, color: 'text-red-500 border-red-500/30 bg-red-500/10' },
    { id: 'FILTER_CLICK', label: 'Category Filters', icon: BarChart2, color: 'text-neutral-400 border-neutral-700 bg-neutral-900' }
  ]

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-amber-500'
      case 'pro': return 'bg-brand-primary'
      case 'essential': return 'bg-blue-500'
      default: return 'bg-neutral-700'
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Loading Activity Logs...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            System <span className="text-brand-primary">Logs</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Master record of all platform activity and engagement</p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="flex items-center px-6 py-3 bg-[#000000] border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-neutral-600 hover:bg-white/5 transition-colors shrink-0"
        >
          <ArrowDownToLine size={14} className="mr-2" /> Export to CSV
        </button>
      </div>

      {/* 🚨 NEW: ANALYTICS INSIGHTS DASHBOARD 🚨 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Overall Views */}
        <div className="bg-[#000000] border border-neutral-800 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center border-b border-neutral-800 pb-3">
            <Eye size={14} className="mr-2 text-blue-500" /> Most Viewed Charts (Overall)
          </h3>
          <div className="space-y-3">
            {insights.topViews.length > 0 ? insights.topViews.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-black p-3 rounded-xl border border-neutral-800/50">
                <span className="text-xs font-black text-white">{item.name}</span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded-lg">{item.count} views</span>
              </div>
            )) : <div className="text-[10px] text-neutral-600 text-center py-4">No data yet.</div>}
          </div>
        </div>

        {/* Top Overall Searches */}
        <div className="bg-[#000000] border border-neutral-800 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center border-b border-neutral-800 pb-3">
            <Search size={14} className="mr-2 text-brand-primary" /> Top Searched Assets
          </h3>
          <div className="space-y-3">
            {insights.topSearches.length > 0 ? insights.topSearches.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-black p-3 rounded-xl border border-neutral-800/50">
                <span className="text-xs font-black text-white">{item.name}</span>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded-lg">{item.count} searches</span>
              </div>
            )) : <div className="text-[10px] text-neutral-600 text-center py-4">No data yet.</div>}
          </div>
        </div>

        {/* Top Views by Tier */}
        <div className="bg-[#000000] border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center border-b border-neutral-800 pb-3">
            <Users size={14} className="mr-2 text-emerald-500" /> Most Viewed by Plan
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-brand-primary mr-2"></div><span className="text-[10px] font-bold text-neutral-400 uppercase">Pro</span></div>
              <span className="text-xs font-black text-white">{insights.tierViews.pro[0]?.name || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div><span className="text-[10px] font-bold text-neutral-400 uppercase">Essential</span></div>
              <span className="text-xs font-black text-white">{insights.tierViews.essential[0]?.name || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-neutral-600 mr-2"></div><span className="text-[10px] font-bold text-neutral-400 uppercase">Free</span></div>
              <span className="text-xs font-black text-white">{insights.tierViews.free[0]?.name || 'N/A'}</span>
            </div>

          </div>
        </div>

      </div>

      {/* CONTROLS (Search & Filter) */}
      <div className="bg-[#000000] border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col lg:flex-row gap-6 mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by user name, ID, or asset (e.g., GOLD)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-neutral-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <div className="hidden lg:flex items-center mr-2 text-neutral-600">
            <Filter size={16} />
          </div>
          {ACTION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActionFilter(type.id)}
              className={`flex items-center px-4 py-3.5 rounded-xl border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                ${actionFilter === type.id ? type.color : 'bg-black border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
            >
              <type.icon size={12} className="mr-2" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE MATRIX TABLE */}
      <div className="bg-[#000000] border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-black border-b border-neutral-800 shadow-sm">
              <tr>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-48">Timestamp (UTC)</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">User Profile</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Action</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <ShieldAlert className="mx-auto text-neutral-700 mb-4" size={32} />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No activity matches your parameters.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const style = ACTION_TYPES.find(t => t.id === log.action) || ACTION_TYPES[0]
                  
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      <td className="p-5">
                        <div className="font-mono text-[10px] text-neutral-400 group-hover:text-white transition-colors">
                          <span className="block">{new Date(log.created_at).toLocaleDateString()}</span>
                          <span className="text-neutral-600 group-hover:text-neutral-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-1.5 h-6 rounded-full ${getPlanColor(log.user_plan)}`}></div>
                          <div>
                            <p className="text-xs font-black text-white">{log.user_name}</p>
                            <p className="text-[8px] font-bold text-neutral-600 font-mono mt-0.5 uppercase">ID: {log.user_id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${style.color}`}>
                          <style.icon size={10} className="mr-1.5" />
                          {style.label}
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="text-xs font-black text-white tracking-widest uppercase">
                          {log.target}
                        </span>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-black border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Showing {filteredLogs.length} Records</span>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div> Live Sync Active
          </span>
        </div>
      </div>

    </div>
  )
}
