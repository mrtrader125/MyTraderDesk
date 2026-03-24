'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, Minus, Lock } from 'lucide-react'
import Link from 'next/link'

type Props = {
  poll: any
  initialVotes: { bullish: number; bearish: number; neutral: number; total: number }
  userPlan: string
  userVote: string | null
  userId: string
}

export default function LivePollWidget({ poll, initialVotes, userPlan, userVote, userId }: Props) {
  const isFreeUser = userPlan === 'free' || userPlan === 'unauthenticated'
  const [votes, setVotes] = useState(initialVotes)
  const [myVote, setMyVote] = useState<string | null>(userVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL') => {
    if (isFreeUser || myVote || loading) return
    setLoading(true)

    setMyVote(bias)
    setVotes(prev => ({
      ...prev,
      [bias.toLowerCase()]: prev[bias.toLowerCase() as keyof typeof prev] + 1,
      total: prev.total + 1
    }))

    await supabase.from('desk_votes').insert([{
      poll_id: poll.id,
      user_id: userId,
      bias: bias
    }])
    
    setLoading(false)
  }

  const getPct = (count: number) => votes.total === 0 ? 0 : Math.round((count / votes.total) * 100)

  if (isFreeUser || myVote) {
    return (
      <div className="relative z-10">
        <div className={`space-y-4 ${isFreeUser ? 'filter blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
          <div>
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-emerald-500">Bullish</span><span>{getPct(votes.bullish)}%</span></div>
            <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${getPct(votes.bullish)}%` }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-red-500">Bearish</span><span>{getPct(votes.bearish)}%</span></div>
            <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${getPct(votes.bearish)}%` }}></div></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest"><span className="text-neutral-500">Neutral</span><span>{getPct(votes.neutral)}%</span></div>
            <div className="h-3 bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-neutral-600 transition-all duration-1000" style={{ width: `${getPct(votes.neutral)}%` }}></div></div>
          </div>
        </div>
        
        {isFreeUser && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl border border-white/5 p-6 text-center">
            <Lock size={24} className="text-neutral-400 mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Voting is Locked</h3>
            <p className="text-xs text-neutral-400 font-medium mb-4">Only Essential and Pro operators can cast votes and view the real-time sentiment results.</p>
            <Link href="/account/profile" className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.15)]">Upgrade Access</Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 relative z-10">
      <button onClick={() => handleVote('BULLISH')} disabled={loading} className="w-full py-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex justify-between px-6 items-center group">
        <span className="font-black text-emerald-500 uppercase tracking-widest text-sm flex items-center"><TrendingUp size={16} className="mr-3" /> Bullish</span>
        <span className="font-bold text-neutral-400 group-hover:text-emerald-500">Vote</span>
      </button>
      <button onClick={() => handleVote('BEARISH')} disabled={loading} className="w-full py-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors flex justify-between px-6 items-center group">
        <span className="font-black text-red-500 uppercase tracking-widest text-sm flex items-center"><TrendingDown size={16} className="mr-3" /> Bearish</span>
        <span className="font-bold text-neutral-400 group-hover:text-red-500">Vote</span>
      </button>
      <button onClick={() => handleVote('NEUTRAL')} disabled={loading} className="w-full py-4 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition-colors flex justify-between px-6 items-center group">
        <span className="font-black text-neutral-400 uppercase tracking-widest text-sm flex items-center"><Minus size={16} className="mr-3" /> Neutral</span>
        <span className="font-bold text-neutral-500 group-hover:text-neutral-300">Vote</span>
      </button>
    </div>
  )
}
