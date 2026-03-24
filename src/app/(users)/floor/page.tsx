import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { Activity, ShieldAlert, CheckCircle2, Lock, MessageSquare, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import LivePollWidget from '@/components/community/LivePollWidget' 

export default async function PrivateLiveFloorPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const userPlan = profile?.plan?.toLowerCase() || 'free'
  const isFreeUser = userPlan === 'free'

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
  let userVote = null

  if (activePoll) {
    const { data: allVotes } = await supabase.from('desk_votes').select('bias, user_id').eq('poll_id', activePoll.id)
    if (allVotes) {
      initialVotes.bullish = allVotes.filter(v => v.bias === 'BULLISH').length
      initialVotes.bearish = allVotes.filter(v => v.bias === 'BEARISH').length
      initialVotes.neutral = allVotes.filter(v => v.bias === 'NEUTRAL').length
      initialVotes.total = allVotes.length
      
      const myVoteRecord = allVotes.find(v => v.user_id === user.id)
      if (myVoteRecord) userVote = myVoteRecord.bias
    }
  }

  // 3. Fetch Real Chatter History (New!)
  const { data: recentDiscussions } = await supabase
    .from('desk_discussions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 border-b border-neutral-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Live Floor</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Desk Sentiment</h1>
          </div>
          
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
          <div className="lg:col-span-2 space-y-6">
            {activePoll ? (
              <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center">
                    <Activity size={12} className="mr-2" /> Daily Bias Poll
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {initialVotes.total} Votes Cast
                  </span>
                </div>

                <h2 className="text-2xl font-black leading-tight mb-2 relative z-10">{activePoll.asset} Sentiment</h2>
                <p className="text-neutral-400 text-sm font-medium mb-8 relative z-10">{activePoll.question}</p>

                <LivePollWidget 
                  poll={activePoll} 
                  initialVotes={initialVotes} 
                  userPlan={userPlan} 
                  userVote={userVote} 
                  userId={user.id} 
                />
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-10 text-center">
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">No active polls. Waiting for admin transmission.</p>
              </div>
            )}

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

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center">
              <MessageSquare size={14} className="mr-2" /> Recent Floor Chatter
            </h3>

            {/* DYNAMIC CHATTER FEED */}
            <div className="space-y-3">
              {recentDiscussions && recentDiscussions.length > 0 ? (
                recentDiscussions.map((disc) => (
                  <div key={disc.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors group">
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
                      <span className="flex items-center"><Users size={12} className="mr-1.5" /> Operators discussing</span>
                      <span className="text-blue-500 group-hover:text-blue-400 cursor-pointer">Read Notes</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-center">
                   <p className="text-xs text-neutral-600 font-bold uppercase tracking-widest">No recent chatter found.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
