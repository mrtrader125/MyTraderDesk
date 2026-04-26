'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { 
  BookOpen, Activity, AlertTriangle, CheckCircle, 
  TrendingUp, Crosshair, ImageIcon, Target, Maximize2, Lock
} from 'lucide-react'

// --- DUMMY DATA FOR DEMO TIER ---
const DEMO_LOGS = [
  {
    id: 'demo-log-1', created_at: new Date(Date.now() - 86400000).toISOString(), symbol: 'BTCUSD', direction: 'LONG',
    playbook: 'Liquidity Sweep', execution_type: 'Perfect', reason: '[Extreme Patience]', outcome: 'TP', rr: 2.5,
    after_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    setup_id: 'demo-1', user_desk_setups: { image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80', notes: '<p><b>Macro:</b> Bullish market structure. Price swept Asian session lows.</p>' }
  },
  {
    id: 'demo-log-2', created_at: new Date(Date.now() - 172800000).toISOString(), symbol: 'EURUSD', direction: 'SHORT',
    playbook: 'Trend Continuation', execution_type: 'Imperfect', reason: '[FOMO / Rushed Entry]', outcome: 'SL', rr: -1.0,
    after_image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    setup_id: 'demo-2', user_desk_setups: { image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80', notes: '<p>Standard premium supply mitigation. DXY is strong.</p>' }
  },
  {
    id: 'demo-log-3', created_at: new Date(Date.now() - 259200000).toISOString(), symbol: 'GBPUSD', direction: 'SHORT',
    playbook: 'News Catalyst', execution_type: 'Perfect', reason: '[Followed Plan]', outcome: 'TP', rr: 1.8,
    after_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    setup_id: 'demo-3', user_desk_setups: { image_url: null, notes: '<p>News driven momentum play.</p>' }
  },
  {
    id: 'demo-log-4', created_at: new Date(Date.now() - 345600000).toISOString(), symbol: 'XAUUSD', direction: 'LONG',
    playbook: 'Range Play', execution_type: 'Imperfect', reason: '[Revenge Trading]', outcome: 'SL', rr: -1.0,
    after_image_url: null,
    setup_id: 'demo-4', user_desk_setups: { image_url: null, notes: '<p>Gold ranging between 2300 and 2350.</p>' }
  },
  {
    id: 'demo-log-5', created_at: new Date(Date.now() - 432000000).toISOString(), symbol: 'NAS100', direction: 'LONG',
    playbook: 'Breakout / Retest', execution_type: 'Perfect', reason: '[A+ Setup]', outcome: 'TP', rr: 3.2,
    after_image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    setup_id: 'demo-5', user_desk_setups: { image_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80', notes: '<p>Clear structural break and retest.</p>' }
  }
];

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
  outcome: 'TP' | 'SL' | 'BE' | 'HOLD'
  rr: number
  after_image_url: string | null
  setup_id: string | null
  user_desk_setups?: {
    image_url: string | null
    notes: string | null
  } | null
}

export default function JournalClient() {
  const [isPro, setIsPro] = useState<boolean>(true)
  const [logs, setLogs] = useState<TradeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MONTH' | 'WEEK'>('ALL')
  const [viewMode, setViewMode] = useState<'BEFORE' | 'AFTER'>('BEFORE')
  
  // 🚨 TRADING PREFERENCES STATE
  const [terminology, setTerminology] = useState<'LONG_SHORT' | 'BUY_SELL'>('LONG_SHORT')

  const displayDirection = (dir: string | null | undefined) => {
    if (!dir) return 'N/A';
    if (terminology === 'BUY_SELL') return dir === 'LONG' ? 'BUY' : 'SELL';
    return dir;
  }

  useEffect(() => {
    const fetchJournalData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // Load Terminology Preference
      if (session.user.user_metadata?.trade_terminology) {
        setTerminology(session.user.user_metadata.trade_terminology)
      }

      // 🚨 TIER CHECK
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single();
      const isProUser = profile?.plan === 'pro' || profile?.plan === 'premium';
      setIsPro(isProUser);

      // 🚨 MOCK DATA INJECTION FOR DEMO USERS
      if (!isProUser) {
        // Apply local time filtering to the mock data to simulate real behavior
        let filteredDemo = [...DEMO_LOGS];
        if (timeFilter === 'WEEK') {
          const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          filteredDemo = filteredDemo.filter(l => new Date(l.created_at) >= sevenDaysAgo);
        }
        
        setLogs(filteredDemo as any);
        if (filteredDemo.length > 0) setActiveTradeId(filteredDemo[0].id);
        setIsLoading(false);
        return;
      }

      // Pulling from both tables simultaneously using the setup_id foreign key
      let query = supabase
        .from('user_desk_logs')
        .select('*, user_desk_setups(image_url, notes)')
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
        setLogs(data as any)
        if (data.length > 0) setActiveTradeId(data[0].id)
      }
      setIsLoading(false)
    }

    fetchJournalData()
  }, [timeFilter])

  // Reset view mode to "Before" whenever a new trade is selected
  useEffect(() => {
    setViewMode('BEFORE')
  }, [activeTradeId])

  // --- DERIVED METRICS ---
  const stats = useMemo(() => {
    if (logs.length === 0) return null

    const settledTrades = logs.filter(l => l.outcome !== 'HOLD')
    const totalTrades = settledTrades.length
    const wins = settledTrades.filter(l => l.outcome === 'TP').length
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0.0"
    
    const netRR = settledTrades.reduce((sum, l) => sum + (l.rr || 0), 0)
    
    const perfectTrades = settledTrades.filter(l => l.execution_type === 'Perfect')
    const perfectRate = totalTrades > 0 ? ((perfectTrades.length / totalTrades) * 100).toFixed(1) : "0.0"

    const imperfectTrades = settledTrades.filter(l => l.execution_type === 'Imperfect')
    const imperfectRR = imperfectTrades.reduce((sum, l) => sum + (l.rr || 0), 0)

    const reasons = imperfectTrades.map(l => l.reason).filter(Boolean) as string[]
    const leakCounts = reasons.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc }, {} as Record<string, number>)
    const topLeak = Object.keys(leakCounts).length > 0 ? Object.keys(leakCounts).reduce((a, b) => leakCounts[a] > leakCounts[b] ? a : b) : 'None'

    let runningRR = 0
    const chartData = [...settledTrades].reverse().map((log, index) => {
      runningRR += (log.rr || 0)
      return {
        name: `T${index + 1}`,
        rr: log.rr,
        cumulative: parseFloat(runningRR.toFixed(2)),
        symbol: log.symbol
      }
    })

    return { totalTrades, winRate, netRR, perfectRate, imperfectRR, topLeak, chartData }
  }, [logs])

  const activeTrade = logs.find(l => l.id === activeTradeId)

  if (isLoading) {
    return <div className="flex h-[calc(100vh-70px)] items-center justify-center bg-[#030303]"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans p-2 gap-2 overflow-hidden">
      
      {/* LEFT PANE: Analytics & Blotter */}
      <div className="flex-[2] flex flex-col min-w-0 min-h-0 gap-2 relative">
        
        {!isPro && (
          <div className="absolute top-2 right-2 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">
            Sandbox Mode <Lock size={12} className="stroke-[3]" />
          </div>
        )}

        {/* HEADER & METRICS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shrink-0">
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Performance Mirror
            </h2>
            <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded p-0.5">
              {['WEEK', 'MONTH', 'ALL'].map(t => (
                <button 
                  key={t} onClick={() => setTimeFilter(t as any)}
                  className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded transition-colors ${timeFilter === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {!stats ? (
            <div className="p-6 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No reconciled data available</div>
          ) : (
            <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-black border border-zinc-800/80 rounded-lg p-2.5 flex flex-col shadow-inner">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Net Yield</span>
                <div className="flex items-end gap-1.5">
                  <span className={`text-xl font-black tracking-tighter ${stats.netRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stats.netRR > 0 ? '+' : ''}{stats.netRR.toFixed(2)}R
                  </span>
                </div>
              </div>
              
              <div className="bg-black border border-zinc-800/80 rounded-lg p-2.5 flex flex-col shadow-inner">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Strike Rate</span>
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-black tracking-tighter text-white">{stats.winRate}%</span>
                  <span className="text-[9px] font-bold text-zinc-500 mb-1 uppercase">/{stats.totalTrades}</span>
                </div>
              </div>

              <div className="bg-black border border-zinc-800/80 rounded-lg p-2.5 flex flex-col shadow-inner">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Discipline Index</span>
                <div className="flex items-end gap-1.5">
                  <span className="text-xl font-black tracking-tighter text-blue-400">{stats.perfectRate}%</span>
                  <span className="text-[9px] font-bold text-zinc-500 mb-1 uppercase">Perfect</span>
                </div>
              </div>

              <div className="bg-black border border-zinc-800/80 rounded-lg p-2.5 flex flex-col shadow-inner border-l-2 border-l-red-500/30">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Primary Leak</span>
                <div className="flex flex-col justify-center flex-1">
                  <span className="text-xs font-black tracking-wider text-red-400 uppercase truncate" title={stats.topLeak}>{stats.topLeak}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Cost: {stats.imperfectRR.toFixed(2)}R</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHART SECTION */}
        {stats && stats.chartData.length > 0 && (
          <div className="h-32 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0 relative shadow-2xl">
            <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5">
              <TrendingUp size={10} className="text-zinc-500" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Cumulative RR</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}
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
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center px-4 shrink-0">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-purple-500" /> Trade Blotter
            </h2>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-1">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur z-10 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Asset</th>
                  <th className="px-3 py-2 font-medium">Playbook</th>
                  <th className="px-3 py-2 font-medium text-center">Execution</th>
                  <th className="px-3 py-2 font-medium text-right">Result</th>
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
                      <td className="px-3 py-2.5 text-zinc-400 font-mono text-[9px]">{date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-200">{log.symbol}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${log.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {displayDirection(log.direction)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400 text-[9px] uppercase font-bold tracking-wider">{log.playbook || 'N/A'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${log.execution_type === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.execution_type === 'Perfect' ? <CheckCircle size={9}/> : <AlertTriangle size={9}/>}
                          {log.execution_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-black border border-zinc-800 ${isWin ? 'text-emerald-400' : log.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{log.outcome}</span>
                          <span className={`font-mono font-bold ${isWin ? 'text-emerald-400' : log.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                            {isWin ? '+' : ''}{log.rr.toFixed(2)}R
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600 text-[10px] uppercase tracking-widest font-bold">No entries found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Trade Deep Dive */}
      <div className="flex-1 lg:flex-[1.2] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl min-h-[500px] lg:min-h-0 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-600/50 to-transparent z-10"></div>
        
        {activeTrade ? (
          <>
            {/* Compressed Action Bar */}
            <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-4 shrink-0">
              <h2 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-zinc-400" /> Autopsy
              </h2>
              <span className="text-[9px] font-mono text-zinc-500">ID: {activeTrade.id.split('-')[0]}</span>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Compressed Autopsy Header */}
              <div className="p-3 border-b border-zinc-800/50 bg-[#050505] flex flex-col gap-2 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-black text-white tracking-wider">
                      {activeTrade.symbol}
                    </h1>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-widest ${activeTrade.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                      {displayDirection(activeTrade.direction)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest px-1">{activeTrade.playbook || 'No Playbook'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${activeTrade.execution_type === 'Perfect' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {activeTrade.execution_type === 'Perfect' ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                      {activeTrade.execution_type}
                    </span>
                    <span className={`text-sm font-mono font-black ${activeTrade.rr > 0 ? 'text-emerald-400' : activeTrade.rr < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {activeTrade.rr > 0 ? '+' : ''}{activeTrade.rr.toFixed(2)}R
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Review & Notes Area */}
              <div className="flex-1 flex flex-col p-3 gap-3 min-h-0 bg-[#030303]">
                
                {/* Before/After Toggle & Zoomable Image Area */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded p-1 shadow-inner">
                    <button 
                      onClick={() => setViewMode('BEFORE')} 
                      className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded transition-all ${viewMode === 'BEFORE' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Intent (Before)
                    </button>
                    <button 
                      onClick={() => setViewMode('AFTER')} 
                      className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded transition-all ${viewMode === 'AFTER' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Reality (After)
                    </button>
                  </div>
                  <span className="text-[9px] text-zinc-600 uppercase font-bold flex items-center gap-1"><Maximize2 size={10}/> Scroll to Zoom</span>
                </div>
                
                {/* Dynamic Image Display with Pan & Zoom */}
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden relative shadow-inner min-h-0 flex items-center justify-center group">
                  <TransformWrapper
                    key={`${activeTrade.id}-${viewMode}`}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={8}
                    wheel={{ step: 0.1 }}
                  >
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {viewMode === 'BEFORE' ? (
                        activeTrade.user_desk_setups?.image_url ? (
                          <img src={activeTrade.user_desk_setups.image_url} alt="Intent Chart" className="max-w-full max-h-full object-contain p-2 cursor-grab active:cursor-grabbing" />
                        ) : (
                          <div className="flex flex-col items-center text-zinc-700"><ImageIcon size={24} className="mb-2 opacity-30" /><span className="text-[9px] font-bold uppercase tracking-widest">No Intent Chart</span></div>
                        )
                      ) : (
                        activeTrade.after_image_url ? (
                          <img src={activeTrade.after_image_url} alt="Reality Chart" className="max-w-full max-h-full object-contain p-2 cursor-grab active:cursor-grabbing" />
                        ) : (
                          <div className="flex flex-col items-center text-zinc-700"><ImageIcon size={24} className="mb-2 opacity-30" /><span className="text-[9px] font-bold uppercase tracking-widest">No Reality Chart</span></div>
                        )
                      )}
                    </TransformComponent>
                  </TransformWrapper>
                </div>

                {/* Dynamic Notes Display */}
                <div className="h-32 sm:h-40 bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 overflow-y-auto custom-scrollbar shrink-0 shadow-inner">
                  <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800/50 pb-1">
                    {viewMode === 'BEFORE' ? 'Structural Thesis' : 'Execution Catalysts'}
                  </h3>
                  
                  {viewMode === 'BEFORE' ? (
                    <div 
                      className="text-xs text-zinc-300 leading-relaxed font-medium tiptap-render"
                      dangerouslySetInnerHTML={{ __html: activeTrade.user_desk_setups?.notes || '<p class="text-zinc-600 italic">No thesis notes logged prior to entry.</p>' }} 
                    />
                  ) : (
                    <div className="text-xs text-zinc-300 leading-relaxed font-medium">
                      {activeTrade.reason ? (
                        <div className="flex flex-wrap gap-2">
                          {activeTrade.reason.split('\n').map((cat, idx) => (
                            cat.trim() ? (
                              <span key={idx} className={`px-2 py-1 rounded bg-black border font-bold uppercase text-[10px] ${activeTrade.execution_type === 'Perfect' ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'}`}>
                                {cat.replace(/[\[\]]/g, '')}
                              </span>
                            ) : null
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-600 italic">No execution catalysts logged.</span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-8 text-center">
            <Target size={32} className="mb-3 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select a trade to view autopsy</span>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-render ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; } 
        .tiptap-render li { margin-bottom: 0.25rem; } 
        .tiptap-render b, .tiptap-render strong { color: #f4f4f5; font-weight: 800; } 
      `}} />
    </div>
  )
}
