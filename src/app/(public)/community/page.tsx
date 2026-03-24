import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer' // 🚨 Use server client
import { Users, TrendingUp, TrendingDown, Minus, MessageSquare, Lock, Activity, ShieldAlert } from 'lucide-react'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Live Desk Sentiment | MyTraderDesk',
  description: 'See real-time crowdsourced market sentiment, bias polling, and structured confluence from the MyTraderDesk trading floor.',
}

// MOCK DATA for discussions
const RECENT_DISCUSSIONS = [
  { asset: 'XAUUSD', topic: 'Liquidity sweep at 2040 validated?', comments: 12, bias: 'BULLISH' },
  { asset: 'EURUSD', topic: 'ECB rate decision structural impact', comments: 8, bias: 'BEARISH' },
  { asset: 'BTCUSD', topic: 'Weekend CME gap narrative', comments: 24, bias: 'NEUTRAL' }
]

export default async function PublicCommunityPage() {
  const supabase = await createClient()

  // 🚨 NEW: Fetch the REAL active poll from Supabase
  const { data: activePoll } = await supabase
    .from('desk_polls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 🚨 NEW: Fetch real vote counts for the teaser percentages
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

  // Helper for percentages
  const getPct = (count: number) => initialVotes.total === 0 ? 0 : Math.round((count / initialVotes.total) * 100)

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header... (Keep same as your current file) */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activePoll ? (
              <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                {/* Header info... */}
                <h2 className="text-2xl font-black leading-tight mb-2 relative z-10">{activePoll.asset} Sentiment</h2>
                <p className="text-neutral-400 text-sm font-medium mb-10 relative z-10">{activePoll.question}</p>

                <div className="relative z-10 mb-8">
                  {/* REAL DATA used in the blurred progress bars */}
                  <div className="space-y-4 filter blur-[8px] opacity-40 select-none pointer-events-none">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-emerald-500">Bullish</span><span>{getPct(initialVotes.bullish)}%</span></div>
                      <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${getPct(initialVotes.bullish)}%` }}></div></div>
                    </div>
                    {/* ... (Repeat for Bearish and Neutral) */}
                  </div>

                  {/* Lock Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Lock size={24} className="text-white mb-4" />
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sentiment Locked</h3>
                    <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto mb-6">
                      Create an account to cast your vote and reveal the desk's bias for {activePoll.asset}.
                    </p>
                    <Link href="/signup" className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl">
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
            
            {/* Rules... (Keep same) */}
          </div>

          {/* Right Column... (Keep same) */}
        </div>
      </div>
    </div>
  )
}
