import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { Users, TrendingUp, TrendingDown, Minus, MessageSquare, Lock, Activity, ShieldAlert } from 'lucide-react'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Live Desk Sentiment | MyTraderDesk',
  description: 'See real-time crowdsourced market sentiment, bias polling, and structured confluence from the MyTraderDesk trading floor.',
}

export default async function PublicCommunityPage() {
  const supabase = await createClient()

  // 1. Fetch Real Poll
  const { data: activePoll } = await supabase
    .from('desk_polls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 2. Fetch Real Poll Votes
  let initialVotes = { bullish: 0, bearish: 0, neutral: 0, total: 0 }
  if (activePoll) {
    const { data: allVotes } = await supabase.from('desk_votes').select('bias').eq('poll_id', activePoll.id)
    if (allVotes) {
      initialVotes.bullish = allVotes.filter(v => v.bias === 'BULLISH').length
      initialVotes.bearish = allVotes.filter(v => v.bias === 'BEARISH').length
      initialVotes.neutral = allVotes.filter(v => v.bias === 'NEUTRAL').length
      initialVotes.total = allVotes.length
    }
  }

  // 3. Fetch Real Chatter History (New!)
  const { data: recentDiscussions } = await supabase
    .from('desk_discussions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const getPct = (count: number) => initialVotes.total === 0 ? 0 : Math.round((count / initialVotes.total) * 100)

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Floor</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            Crowdsourced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sentiment</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Don't trade in a vacuum. Validate your market bias against the collective intelligence of the MyTraderDesk community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activePoll ? (
              <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center">
                    <Activity size={12} className="mr-2" /> Active Desk Poll
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {initialVotes.total} Operators Voted
                  </span>
                </div>

                <h2 className="text-2xl font-black leading-tight mb-2 relative z-10">{activePoll.asset} Sentiment</h2>
                <p className="text-neutral-400 text-sm font-medium mb-10 relative z-10">{activePoll.question}</p>

                <div className="relative z-10 mb-8">
                  <div className="space-y-4 filter blur-[8px] opacity-40 select-none pointer-events-none">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-emerald-500">Bullish</span><span>{getPct(initialVotes.bullish)}%</span></div>
                      <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${getPct(initialVotes.bullish)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-red-500">Bearish</span><span>{getPct(initialVotes.bearish)}%</span></div>
                      <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${getPct(initialVotes.bearish)}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-neutral-500">Neutral</span><span>{getPct(initialVotes.neutral)}%</span></div>
                      <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-neutral-600" style={{ width: `${getPct(initialVotes.neutral)}%` }}></div></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                      <Lock size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sentiment Locked</h3>
                    <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto mb-6">
                      Create a free account to cast your vote and reveal the desk's bias for {activePoll.asset}.
                    </p>
                    <Link href="/signup" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                      Unlock Poll Results
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-10 text-center">
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Waiting for the next desk transmission...</p>
              </div>
            )}

            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 flex items-start space-x-4">
              <ShieldAlert className="text-neutral-600 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Rules of the Floor</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  This is a professional environment. Comments must include structural confluence, liquidity targets, or fundamental catalysts. "To the moon" or unbacked signals will result in an immediate floor ban.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center">
              <MessageSquare size={14} className="mr-2" /> Recent Desk Activity
            </h3>
            
            {/* DYNAMIC CHATTER FEED */}
            <div className="space-y-4">
              {recentDiscussions && recentDiscussions.length > 0 ? (
                recentDiscussions.map((disc) => (
                  <div key={disc.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-2 py-1 rounded uppercase tracking-widest">
                        {disc.asset}
                      </span>
                      {disc.bias === 'BULLISH' ? <TrendingUp size={14} className="text-emerald-500" /> : 
                       disc.bias === 'BEARISH' ? <TrendingDown size={14} className="text-red-500" /> : 
                       <Minus size={14} className="text-neutral-500" />}
                    </div>
                    <p className="text-sm font-bold text-neutral-300 mb-4 group-hover:text-white transition-colors">
                      {disc.topic}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      <span className="flex items-center"><Users size={12} className="mr-1.5" /> Operators discussing</span>
                      <span className="text-blue-500 group-hover:text-blue-400">View</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-center">
                   <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest">No recent chatter found.</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-b from-[#111] to-[#050505] border border-blue-500/20 rounded-2xl p-6 text-center mt-6">
              <h4 className="text-white font-black uppercase tracking-tight text-lg mb-2">Want to speak up?</h4>
              <p className="text-xs text-neutral-400 mb-6">Essential & Pro members get full voting and commenting rights on the floor.</p>
              <Link href="/signup" className="w-full block py-3 bg-[#111] border border-neutral-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all">
                Join the Desk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
