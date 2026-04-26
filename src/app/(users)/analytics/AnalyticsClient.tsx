'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts'
import { Activity, Target, TrendingUp, Calendar, ArrowRight, Crosshair, Lock } from 'lucide-react'

// --- DUMMY DATA FOR DEMO TIER ---
const DEMO_LOGS = [
  { id: '1', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), symbol: 'BTCUSD', playbook: 'Liquidity Sweep', execution_type: 'Perfect', outcome: 'TP', rr: 2.5 },
  { id: '2', created_at: new Date(Date.now() - 28 * 86400000).toISOString(), symbol: 'EURUSD', playbook: 'Trend Continuation', execution_type: 'Imperfect', outcome: 'SL', rr: -1.0 },
  { id: '3', created_at: new Date(Date.now() - 25 * 86400000).toISOString(), symbol: 'GBPUSD', playbook: 'News Catalyst', execution_type: 'Perfect', outcome: 'TP', rr: 1.8 },
  { id: '4', created_at: new Date(Date.now() - 20 * 86400000).toISOString(), symbol: 'XAUUSD', playbook: 'Range Play', execution_type: 'Imperfect', outcome: 'SL', rr: -1.0 },
  { id: '5', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), symbol: 'NAS100', playbook: 'Breakout / Retest', execution_type: 'Perfect', outcome: 'TP', rr: 3.2 },
  { id: '6', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), symbol: 'BTCUSD', playbook: 'Liquidity Sweep', execution_type: 'Perfect', outcome: 'BE', rr: 0 },
  { id: '7', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), symbol: 'EURUSD', playbook: 'Trend Continuation', execution_type: 'Perfect', outcome: 'TP', rr: 1.5 },
  { id: '8', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), symbol: 'XAUUSD', playbook: 'Liquidity Sweep', execution_type: 'Imperfect', outcome: 'SL', rr: -1.0 }
];

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type TradeLog = {
  id: string
  created_at: string
  symbol: string
  playbook: string | null
  execution_type: 'Perfect' | 'Imperfect'
  outcome: 'TP' | 'SL' | 'BE' | 'HOLD'
  rr: number | null
}

export default function AnalyticsClient() {
  const [isPro, setIsPro] = useState<boolean>(true)
  const [logs, setLogs] = useState<TradeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<30 | 60 | 90>(30)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // 🚨 TIER CHECK
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
      const isProUser = profile?.plan === 'pro' || profile?.plan === 'premium';
      setIsPro(isProUser);

      // 🚨 MOCK DATA INJECTION FOR DEMO USERS
      if (!isProUser) {
        // Apply time filtering to the mock data to simulate real behavior
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - timeFilter);
        const filteredDemo = DEMO_LOGS.filter(l => new Date(l.created_at) >= targetDate);
        
        setLogs(filteredDemo as any);
        setIsLoading(false);
        return;
      }

      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - timeFilter)

      const { data } = await supabase
        .from('user_desk_logs')
        .select('id, created_at, symbol, playbook, execution_type, outcome, rr')
        .eq('user_id', session.user.id)
        .neq('outcome', 'HOLD')
        .gte('created_at', targetDate.toISOString())
        .order('created_at', { ascending: true })

      if (data) setLogs(data as TradeLog[])
      setIsLoading(false)
    }

    fetchAnalytics()
  }, [timeFilter])

  // --- DATA CRUNCHING ENGINE ---
  const stats = useMemo(() => {
    if (logs.length === 0) return null

    let cumulativeRR = 0
    const equityCurve = logs.map((log, index) => {
      cumulativeRR += (log.rr || 0)
      return {
        tradeNumber: `T${index + 1}`,
        date: new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rr: log.rr || 0,
        cumulative: parseFloat(cumulativeRR.toFixed(2)),
        execution: log.execution_type
      }
    })

    const playbookMap: Record<string, { total: number, wins: number, netRR: number, perfects: number }> = {}
    const dailyMap: Record<string, { perfect: number, imperfect: number }> = {}

    logs.forEach(log => {
      // Playbook Matrix Crunching
      const pb = log.playbook || 'Uncategorized'
      if (!playbookMap[pb]) playbookMap[pb] = { total: 0, wins: 0, netRR: 0, perfects: 0 }
      playbookMap[pb].total += 1
      if (log.outcome === 'TP') playbookMap[pb].wins += 1
      playbookMap[pb].netRR += (log.rr || 0)
      if (log.execution_type === 'Perfect') playbookMap[pb].perfects += 1

      // Daily Heatmap Crunching
      const dateStr = new Date(log.created_at).toDateString()
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { perfect: 0, imperfect: 0 }
      if (log.execution_type === 'Perfect') dailyMap[dateStr].perfect += 1
      else dailyMap[dateStr].imperfect += 1
    })

    const playbookArray = Object.entries(playbookMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        winRate: ((data.wins / data.total) * 100).toFixed(1),
        netRR: parseFloat(data.netRR.toFixed(2)),
        discipline: ((data.perfects / data.total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.netRR - a.netRR)

    const dailyArray = Object.entries(dailyMap).map(([date, counts]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: counts.imperfect > 0 ? 'imperfect' : 'perfect',
      total: counts.perfect + counts.imperfect
    }))

    return { equityCurve, playbookArray, dailyArray, finalRR: cumulativeRR }
  }, [logs])

  if (isLoading) {
    return <div className="flex h-[calc(100vh-70px)] items-center justify-center bg-[#030303]"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans p-2 gap-2 overflow-y-auto lg:overflow-hidden relative">
      
      {!isPro && (
        <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">
          Sandbox Mode <Lock size={12} className="stroke-[3]" />
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shrink-0">
        <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> Macro Analytics
          </h2>
          <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded p-0.5">
            {[30, 60, 90].map(t => (
              <button 
                key={t} onClick={() => setTimeFilter(t as any)}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-colors ${timeFilter === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 border border-zinc-800 rounded-xl">
          <Target size={32} className="mb-3 opacity-20 text-zinc-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No settled data in this timeframe</span>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-2 relative">
          
          {!isPro && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-40 flex items-center justify-center rounded-xl border border-white/[0.02] pointer-events-none">
               {/* Just a blurred overlay to show it's locked, but still visible */}
            </div>
          )}

          {/* LEFT: EQUITY CURVE & HEATMAP */}
          <div className="flex-[1.5] flex flex-col min-w-0 gap-2">
            
            {/* The Operator's Curve */}
            <div className="flex-[1.5] bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col relative">
              <div className="flex justify-between items-start mb-4 shrink-0">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={12} /> Cumulative Yield
                </h3>
                <span className={`text-xl font-black tracking-tighter ${stats.finalRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.finalRR > 0 ? '+' : ''}{stats.finalRR.toFixed(2)}R
                </span>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.equityCurve} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="tradeNumber" hide />
                    <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}R`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value}R`, 'Net Yield']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                    />
                    <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
                    <Area type="step" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Discipline Heatmap */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col min-h-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-4 shrink-0">
                <Calendar size={12} /> Execution Heatmap
              </h3>
              <div className="flex-1 flex flex-wrap content-start gap-1.5 overflow-y-auto custom-scrollbar">
                {stats.dailyArray.length === 0 ? (
                   <span className="text-xs text-zinc-600 font-bold uppercase w-full text-center mt-4">No trading days recorded</span>
                ) : (
                  stats.dailyArray.map((day, i) => (
                    <div 
                      key={i} 
                      title={`${day.date}: ${day.total} trades (${day.status})`}
                      className={`h-6 flex-1 min-w-[24px] max-w-[32px] rounded border ${
                        day.status === 'perfect' 
                          ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40' 
                          : 'bg-red-500/20 border-red-500/50 hover:bg-red-500/40'
                      } transition-colors cursor-help`}
                    />
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: PLAYBOOK MATRIX */}
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col min-h-0">
             <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center px-4 shrink-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Crosshair size={12} /> Playbook Matrix
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
              {stats.playbookArray.map(pb => (
                <div key={pb.name} className="bg-black border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white tracking-wide">{pb.name}</span>
                    <span className={`text-sm font-black font-mono ${pb.netRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pb.netRR > 0 ? '+' : ''}{pb.netRR}R
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Strike Rate</span>
                      <span className="text-xs font-bold text-zinc-300">{pb.winRate}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Discipline</span>
                      <span className="text-xs font-bold text-blue-400">{pb.discipline}%</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Frequency</span>
                      <span className="text-xs font-bold text-zinc-500">{pb.total} Trades</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {stats.playbookArray.length === 0 && (
                <span className="text-xs text-zinc-600 font-bold uppercase w-full text-center mt-8">No playbooks logged</span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
