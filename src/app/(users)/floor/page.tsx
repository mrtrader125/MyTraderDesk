import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { Users, TrendingUp, TrendingDown, Minus, MessageSquare, Lock, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react'

// MOCK DATA
const ACTIVE_POLL = {
  asset: 'DXY',
  question: 'US Dollar Index is tapping the daily bearish breaker block. What is your fundamental and technical bias for the week?',
  votes: { bullish: 68, bearish: 22, neutral: 10 },
  totalVotes: 142,
}

const RECENT_DISCUSSIONS = [
  { asset: 'XAUUSD', topic: 'Liquidity sweep at 2040 validated?', comments: 12, bias: 'BULLISH' },
  { asset: 'EURUSD', topic: 'ECB rate decision structural impact', comments: 8, bias: 'BEARISH' },
  { asset: 'BTCUSD', topic: 'Weekend CME gap narrative', comments: 24, bias: 'NEUTRAL' }
]

export default async function PrivateLiveFloorPage() {
  const supabase = await createClient()
  
  // 1. Secure Authentication Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch User's Subscription Tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const userPlan = profile?.subscription_tier?.toLowerCase() || 'free'
  const isFreeUser = userPlan === 'free'

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-b border-neutral-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Live Floor</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
              Desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sentiment</span>
            </h1>
          </div>
          
          {/* Status Badge */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3 flex items-center space-x-3 shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFreeUser ? 'bg-neutral-800 text-neutral-500' : 'bg-brand-primary/20 text-brand-primary'}`}>
              {isFreeUser ? <Lock size={16} /> : <CheckCircle2 size={16} />}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Access Level</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                {isFreeUser ? 'Read-Only (Free)' : `${userPlan} Operator`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: The Active Poll */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Activity size={12} className="mr-2" /> Daily Bias Poll
                </span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  {ACTIVE_POLL.totalVotes} Votes Cast
                </span>
              </div>

              <h2 className="text-2xl font-black leading-tight mb-2">{ACTIVE_POLL.asset} Sentiment</h2>
              <p className="text-neutral-400 text-sm font-medium mb-8">{ACTIVE_POLL.question}</p>

              {/* DYNAMIC UI: Changes based on subscription */}
              {isFreeUser ? (
                <div className="relative">
                  {/* Blurred Voting Area */}
                  <div className="space-y-3 filter blur-sm opacity-50 pointer-events-none select-none">
                     <button className="w-full py-4 rounded-xl border border-neutral-800 bg-[#0a0a0a] flex justify-between px-6 items-center"><span className="font-black text-emerald-500">BULLISH</span><span>68%</span></button>
                     <button className="w-full py-4 rounded-xl border border-neutral-800 bg-[#0a0a0a] flex justify-between px-6 items-center"><span className="font-black text-red-500">BEARISH</span><span>22%</span></button>
                     <button className="w-full py-4 rounded-xl border border-neutral-800 bg-[#0a0a0a] flex justify-between px-6 items-center"><span className="font-black text-neutral-500">NEUTRAL</span><span>10%</span></button>
                  </div>
                  
                  {/* Hard Paywall Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl border border-white/5 p-6 text-center">
                    <Lock size={24} className="text-neutral-400 mb-3" />
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Voting is Locked</h3>
                    <p className="text-xs text-neutral-400 font-medium mb-4 max-w-[250px]">
                      Only Essential and Pro operators can cast votes and view the real-time sentiment results.
                    </p>
                    <Link href="/account/profile" className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                      Upgrade Access
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Interactive Voting Area for Paid Users */}
                  <button className="w-full py-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex justify-between px-6 items-center group">
                    <span className="font-black text-emerald-500 uppercase tracking-widest text-sm flex items-center"><TrendingUp size={16} className="mr-3" /> Bullish</span>
                    <span className="font-bold text-neutral-400 group-hover:text-emerald-500 transition-colors">Vote</span>
                  </button>
                  <button className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors flex justify-between px-6 items-center group">
                    <span className="font-black text-red-500 uppercase tracking-widest text-sm flex items-center"><TrendingDown size={16} className="mr-3" /> Bearish</span>
                    <span className="font-bold text-neutral-400 group-hover:text-red-500 transition-colors">Vote</span>
                  </button>
                  <button className="w-full py-4 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition-colors flex justify-between px-6 items-center group">
                    <span className="font-black text-neutral-400 uppercase tracking-widest text-sm flex items-center"><Minus size={16} className="mr-3" /> Neutral</span>
                    <span className="font-bold text-neutral-500 group-hover:text-neutral-300 transition-colors">Vote</span>
                  </button>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 flex items-start space-x-4">
              <ShieldAlert className="text-neutral-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1.5">Rules of the Floor</h3>
                <p className="text-[10px] text-neutral-500 leading-relaxed font-bold uppercase tracking-wide">
                  Comments must include structural confluence or liquidity targets. Unbacked hype will result in an immediate ban.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Recent Discussions */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center">
              <MessageSquare size={14} className="mr-2" /> Recent Floor Chatter
            </h3>
            
            <div className="space-y-3">
              {RECENT_DISCUSSIONS.map((disc, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-white bg-white/5 border border-white/10 px-2 py-1 rounded uppercase tracking-widest">
                      {disc.asset}
                    </span>
                    {disc.bias === 'BULLISH' ? <TrendingUp size={14} className="text-emerald-500" /> : 
                     disc.bias === 'BEARISH' ? <TrendingDown size={14} className="text-red-500" /> : 
                     <Minus size={14} className="text-neutral-500" />}
                  </div>
                  <p className="text-xs font-bold text-neutral-300 mb-4 group-hover:text-white transition-colors leading-relaxed">
                    {disc.topic}
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-600">
                    <span className="flex items-center"><Users size={12} className="mr-1.5" /> {disc.comments} Operators</span>
                    <span className="text-blue-500 group-hover:text-blue-400 cursor-pointer">Read Notes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
