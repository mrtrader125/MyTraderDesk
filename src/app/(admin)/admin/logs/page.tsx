'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, Search, Filter, AlertTriangle, Target, BarChart2, ShieldAlert, Database, ArrowDownToLine } from 'lucide-react'

export default function GlobalAuditLedger() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('ALL')

  useEffect(() => {
    async function fetchLedger() {
      try {
        // 1. Fetch Logs
        const { data: activityLogs, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500)

        if (logsError) console.error("Logs Fetch Error (Check RLS):", logsError)

        // 2. Fetch Profiles (might fail due to RLS, but we won't let it crash the page)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, plan')

        if (profilesError) console.error("Profiles Fetch Error (Check RLS):", profilesError)

        // 3. Map the data together (Even if profiles failed, activityLogs will still render)
        if (activityLogs) {
          const profileMap: Record<string, any> = {}
          if (profiles) {
            profiles.forEach(p => { profileMap[p.id] = p })
          }

          const enrichedLogs = activityLogs.map(log => ({
            ...log,
            user_name: profileMap[log.user_id]?.full_name || 'Unknown Operator',
            user_plan: profileMap[log.user_id]?.plan || 'free',
            target: log.search_query || log.asset_symbol || log.timeframe || 'SYSTEM'
          }))

          setLogs(enrichedLogs)
        }
      } catch (err) {
        console.error("Ledger Decryption Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLedger()
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

  // Action Type Configurations for styling
  const ACTION_TYPES = [
    { id: 'ALL', label: 'All Activity', icon: Database, color: 'text-white border-neutral-700 bg-neutral-800' },
    { id: 'SEARCH', label: 'Asset Searches', icon: Search, color: 'text-white border-white/20 bg-white/5' },
    { id: 'VIEW_CHART', label: 'Intel Viewed', icon: Target, color: 'text-blue-500 border-blue-500/30 bg-blue-500/10' },
    { id: 'PAYWALL_BUMP', label: 'Paywall Hits', icon: AlertTriangle, color: 'text-red-500 border-red-500/30 bg-red-500/10' },
    { id: 'FILTER_CLICK', label: 'Category Filters', icon: BarChart2, color: 'text-neutral-400 border-neutral-700 bg-neutral-900' }
  ]

  // Plan Color Helper
  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
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
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Decrypting Global Ledger...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Global Audit <span className="text-brand-primary">Ledger</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Master record of all network activity and operator telemetry</p>
        </div>

        <button className="flex items-center px-6 py-3 bg-[#0a0a0a] border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-neutral-600 transition-colors shrink-0">
          <ArrowDownToLine size={14} className="mr-2" /> Export to CSV
        </button>
      </div>

      {/* CONTROLS (Search & Filter) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col lg:flex-row gap-6">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by operator name, ID, or asset (e.g., GOLD)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        {/* Action Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <div className="hidden lg:flex items-center mr-2 text-neutral-600">
            <Filter size={16} />
          </div>
          {ACTION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setActionFilter(type.id)}
              className={`flex items-center px-4 py-3.5 rounded-xl border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                ${actionFilter === type.id ? type.color : 'bg-[#050505] border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
            >
              <type.icon size={12} className="mr-2" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE MATRIX TABLE */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-[#050505] border-b border-neutral-800 shadow-sm">
              <tr>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest w-48">Timestamp (UTC)</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Operator Identity</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Action Triggered</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payload / Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <ShieldAlert className="mx-auto text-neutral-700 mb-4" size={32} />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No telemetry matches your parameters.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const style = ACTION_TYPES.find(t => t.id === log.action) || ACTION_TYPES[0]
                  
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      
                      {/* Timestamp */}
                      <td className="p-5">
                        <div className="font-mono text-[10px] text-neutral-400 group-hover:text-white transition-colors">
                          <span className="block">{new Date(log.created_at).toLocaleDateString()}</span>
                          <span className="text-neutral-600 group-hover:text-neutral-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </td>

                      {/* Operator */}
                      <td className="p-5">
                        <div className="flex items-center space-x-3">
                          <div className={`w-1.5 h-6 rounded-full ${getPlanColor(log.user_plan)}`}></div>
                          <div>
                            <p className="text-xs font-black text-white">{log.user_name}</p>
                            <p className="text-[8px] font-bold text-neutral-600 font-mono mt-0.5 uppercase">ID: {log.user_id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-5">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${style.color}`}>
                          <style.icon size={10} className="mr-1.5" />
                          {style.label}
                        </div>
                      </td>

                      {/* Payload */}
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
        
        {/* Footer */}
        <div className="p-4 bg-[#050505] border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Showing {filteredLogs.length} Records</span>
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div> Ledger Synced
          </span>
        </div>
      </div>

    </div>
  )
}
