'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { 
  BookOpen, Activity, AlertTriangle, CheckCircle, 
  TrendingUp, TrendingDown, Crosshair, Calendar, 
  Image as ImageIcon, Target, Filter, ChevronRight
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TradeLog = {
  id: string
  created_at: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  playbook: string
  execution_type: 'Perfect' | 'Imperfect'
  reason: string | null
  outcome: 'TP' | 'SL' | 'BE'
  rr: number
  after_image_url: string | null
}

export default function JournalClient() {
  const [logs, setLogs] = useState<TradeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MONTH' | 'WEEK'>('ALL')

  useEffect(() => {
    const fetchJournalData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      let query = supabase
        .from('user_desk_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_reconciled', true)
        .order('created_at', { ascending: false })

      if (timeFilter === 'MONTH') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        query = query.gte('created_at', thirtyDaysAgo.toISOString())
      } else if (timeFilter === 'WEEK') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        query = query.gte('created_at', sevenDaysAgo.toISOString())
      }

      const { data } = await query

      if (data) {
        setLogs(data)
        if (data.length > 0) setActiveTradeId(data[0].id)
      }
      setIsLoading(false)
    }

    fetchJournalData()
  }, [timeFilter])

  // --- DERIVED METRICS ---
  const stats = useMemo(() => {
    if (logs.length === 0) return null

    const totalTrades = logs.length
    const wins = logs.filter(l => l.outcome === 'TP').length
    const winRate = ((wins / totalTrades) * 100).toFixed(1)
    
    const netRR = logs.reduce((sum, l) => sum + (l.rr || 0), 0)
    
    const perfectTrades = logs.filter(l => l.execution_type === 'Perfect')
    const perfectRR = perfectTrades.reduce((sum, l) => sum + (l.rr || 0), 0)
    const perfectRate = ((perfectTrades.length / totalTrades) * 100).toFixed(1)

    const imperfectTrades = logs.filter(l => l.execution_type === 'Imperfect')
    const imperfectRR = imperfectTrades.reduce((sum, l) => sum + (l.rr || 0), 0)

    // Find the biggest behavioral leak
    const reasons = imperfectTrades.map(l => l.reason).filter(Boolean) as string[]
    const leakCounts = reasons.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc }, {} as Record<string, number>)
    const topLeak = Object.keys(leakCounts).length > 0 ? Object.keys(leakCounts).reduce((a, b) => leakCounts[a] > leakCounts[b] ? a : b) : 'None'

    // Chart Data (Reverse for chronological order)
    let runningRR = 0
    const chartData = [...logs].reverse().map((log, index) => {
      runningRR += (log.rr || 0)
      return {
        name: `T${index + 1}`,
        rr: log.rr,
        cumulative: parseFloat(runningRR.toFixed(2)),
        symbol: log.symbol
      }
    })

    return { totalTrades, winRate, netRR, perfectRate, perfectRR, imperfectRR, topLeak, chartData }
  }, [logs])

  const activeTrade = logs.find(l => l.id === activeTradeId)

  if (isLoading) {
    return <div className="flex h-[calc(100vh-70px)] items-center justify-center bg-black"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans p-2 gap-2 overflow-hidden">
      
      {/* LEFT PANE: Analytics & Blotter */}
      <div className="flex-[2] flex flex-col min-w-0 min-h-0 gap-2">
        
        {/* HEADER & METRICS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shrink-0">
          <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Performance Mirror
            </h2>
            <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg p-1">
              {['WEEK', 'MONTH', 'ALL'].map(t => (
                <button 
                  key={t} onClick={() => setTimeFilter(t as any)}
                  className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded transition-colors ${timeFilter === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {!stats ? (
            <div className="p-8 text-center text-zinc-600 text-sm font-bold uppercase tracking-widest">No reconciled data available</div>
          ) : (
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black border border-zinc-800/80 rounded-lg p-3 flex flex-col shadow-inner">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Net Yield</span>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-black tracking-tighter ${stats.netRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.netRR > 0 ? '+' : ''}{stats.netRR.toFixed(2)}R
                  </span>
                </div>
              </div>
              
              <div className="bg-black border border-zinc-800/80 rounded-lg p-3 flex flex-col shadow-inner">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Strike Rate</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black tracking-tighter text-white">{stats.winRate}%</span>
                  <span className="text-[10px] font-bold text-zinc-500 mb-1.5 uppercase">/{stats.totalTrades} Trades</span>
                </div>
              </div>

              <div className="bg-black border border-zinc-800/80 rounded-lg p-3 flex flex-col shadow-inner">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Discipline Index</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black tracking-tighter text-blue-400">{stats.perfectRate}%</span>
                  <span className="text-[10px] font-bold text-zinc-500 mb-1.5 uppercase">Perfect Ex.</span>
                </div>
              </div>

              <div className="bg-black border border-zinc-800/80 rounded-lg p-3 flex flex-col shadow-inner border-l-2 border-l-red-500/30">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Primary Leak</span>
                <div className="flex flex-col justify-center flex-1">
                  <span className="text-sm font-black tracking-wider text-red-400 uppercase">{stats.topLeak}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Cost: {stats.imperfectRR.toFixed(2)}R</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHART SECTION */}
        {stats && stats.chartData.length > 0 && (
          <div className="h-40 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0 relative shadow-2xl">
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <TrendingUp size={12} className="text-zinc-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Cumulative RR</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value}R`, 'Cumulative']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.symbol || label}
                />
                <ReferenceLine y={0} stroke="#27272a" strokeDasharray="3 3" />
                <Area type="step" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* TRADE BLOTTER */}
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center px-5 shrink-0">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-purple-500" /> Trade Blotter
            </h2>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-2">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Playbook</th>
                  <th className="px-4 py-3 font-medium text-center">Execution</th>
                  <th className="px-4 py-3 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {logs.map(log => {
                  const date = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const isWin = log.rr > 0
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setActiveTradeId(log.id)}
                      className={`cursor-pointer transition-colors ${activeTradeId === log.id ? 'bg-zinc-800/50' : 'hover:bg-zinc-900/50'}`}
                    >
                      <td className="px-4 py-3 text-zinc-400 font-mono text-[10px]">{date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-200">{log.symbol}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${log.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>{log.direction}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">{log.playbook}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded ${log.execution_type === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.execution_type === 'Perfect' ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                          {log.execution_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-black border border-zinc-800 ${isWin ? 'text-emerald-400' : log.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{log.outcome}</span>
                          <span className={`font-mono font-bold ${isWin ? 'text-emerald-400' : log.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                            {isWin ? '+' : ''}{log.rr.toFixed(2)}R
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-600 text-xs uppercase tracking-widest font-bold">No entries found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Trade Deep Dive */}
      <div className="flex-1 lg:flex-[1.2] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl min-h-[400px] lg:min-h-0 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-600/50 to-transparent z-10"></div>
        
        {activeTrade ? (
          <>
            {/* Action Bar */}
            <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-zinc-400" /> Trade Autopsy
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">ID: {activeTrade.id.split('-')[0]}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* Autopsy Header */}
              <div className="p-5 border-b border-zinc-800/50 bg-[#050505] flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-3">
                      {activeTrade.symbol}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border tracking-widest ${activeTrade.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {activeTrade.direction}
                      </span>
                    </h1>
                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{activeTrade.playbook}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xl font-mono font-black ${activeTrade.rr > 0 ? 'text-emerald-400' : activeTrade.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {activeTrade.rr > 0 ? '+' : ''}{activeTrade.rr.toFixed(2)}R
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{activeTrade.outcome} Outcome</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-black border border-zinc-800 rounded-lg p-3 flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Execution Quality</span>
                    <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${activeTrade.execution_type === 'Perfect' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {activeTrade.execution_type === 'Perfect' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                      {activeTrade.execution_type}
                    </span>
                  </div>
                  
                  {activeTrade.execution_type === 'Imperfect' && activeTrade.reason && (
                    <div className="bg-black border border-red-500/20 rounded-lg p-3 flex flex-col">
                      <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Error Catalyst</span>
                      <span className="text-xs font-bold text-red-400 uppercase">{activeTrade.reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Review */}
              <div className="flex-1 flex flex-col p-5 gap-4 min-h-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <ImageIcon size={12} /> Post-Trade Reality
                  </span>
                </div>
                
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden relative shadow-inner min-h-[250px] flex items-center justify-center">
                  {activeTrade.after_image_url ? (
                    <img 
                      src={activeTrade.after_image_url} 
                      alt="Post Trade Chart" 
                      className="absolute inset-0 w-full h-full object-contain p-2 hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700">
                      <ImageIcon size={32} className="mb-2 opacity-30" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Reality Chart Logged</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
            <Target size={40} className="mb-4 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Select a trade to view autopsy</span>
          </div>
        )}
      </div>

    </div>
  )
}