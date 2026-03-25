'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Eye, Activity, Clock, Zap, Target, Shield, Radio } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LiveFloorPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [squawks, setSquawks] = useState<any[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [pollResults, setPollResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
    setupRealtimeSquawk()
  }, [])

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: postsData } = await supabase
        .from('terminal_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (postsData) setPosts(postsData)

      const { data: squawkData } = await supabase
        .from('live_squawk')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)
      
      if (squawkData) setSquawks(squawkData)

      if (user && postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id)
        const { data: votesData } = await supabase
          .from('user_votes')
          .select('post_id, vote_type')
          .eq('user_id', user.id)
          .in('post_id', postIds)

        if (votesData) {
          const voteMap: Record<string, string> = {}
          votesData.forEach(v => { voteMap[v.post_id] = v.vote_type })
          setUserVotes(voteMap)

          const votedPostIds = Object.keys(voteMap)
          if (votedPostIds.length > 0) {
            fetchPollResults(votedPostIds)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching floor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSquawk = () => {
    const channel = supabase
      .channel('public:live_squawk')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (payload) => {
        setSquawks((current) => [payload.new, ...current])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  const fetchPollResults = async (postIds: string[]) => {
    const { data } = await supabase
      .from('user_votes')
      .select('post_id, vote_type')
      .in('post_id', postIds)

    if (data) {
      const results: Record<string, any> = {}
      postIds.forEach(id => {
        const postVotes = data.filter(v => v.post_id === id)
        const total = postVotes.length || 1 
        results[id] = {
          aligned: Math.round((postVotes.filter(v => v.vote_type === 'aligned').length / total) * 100),
          counter: Math.round((postVotes.filter(v => v.vote_type === 'counter').length / total) * 100),
          sitting_out: Math.round((postVotes.filter(v => v.vote_type === 'sitting_out').length / total) * 100),
          totalVotes: postVotes.length
        }
      })
      setPollResults(prev => ({ ...prev, ...results }))
    }
  }

  const handleVote = async (postId: string, voteType: 'aligned' | 'counter' | 'sitting_out') => {
    if (!userId) return

    setUserVotes(prev => ({ ...prev, [postId]: voteType }))

    const { error } = await supabase
      .from('user_votes')
      .insert({ post_id: postId, user_id: userId, vote_type: voteType })

    if (!error) {
      fetchPollResults([postId])
    }
  }

  // --- PREMIUM LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_50%)]"></div>
        <Activity className="w-12 h-12 text-blue-500 mb-6 animate-pulse relative z-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 relative z-10 animate-pulse">
          Initializing Terminal...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800/60 pb-8 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Execution Terminal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-3 italic">
              The Live Floor
            </h1>
            <p className="text-neutral-500 mt-3 text-xs font-bold uppercase tracking-[0.2em]">
              Institutional Intelligence & Market Sentiment
            </p>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 px-5 py-2.5 rounded-xl backdrop-blur-sm shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Market Open</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          
          {/* --- LEFT COLUMN: TERMINAL FEED --- */}
          <div className="lg:col-span-2 space-y-8">
            {posts.length === 0 ? (
              // PREMIUM EMPTY STATE
              <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-16 rounded-3xl border border-neutral-800/50 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 mb-6">
                  <Target className="w-8 h-8 text-blue-500/50" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white mb-3">Awaiting Transmissions</h3>
                <p className="text-neutral-500 text-sm font-medium tracking-wide max-w-sm leading-relaxed">
                  The desk is currently analyzing markets. Initial structural setups will appear here shortly.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const hasVoted = !!userVotes[post.id]
                const results = pollResults[post.id]

                return (
                  <div key={post.id} className="bg-gradient-to-br from-[#0c0c0c] to-[#050505] rounded-3xl border border-neutral-800/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.8)] transition-all duration-300 hover:border-neutral-700">
                    
                    {/* Post Header */}
                    <div className="p-6 border-b border-neutral-900 flex flex-wrap justify-between items-center gap-4 bg-[#0a0a0a]">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] rounded-lg border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                          {post.ticker}
                        </span>
                        <span className="text-[10px] font-black text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                          {post.timeframe}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={12} className="text-neutral-600" />
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chart Image */}
                    {post.image_url && (
                      <div className="relative w-full h-[300px] sm:h-[450px] border-b border-neutral-900 bg-[#000]">
                        <Image 
                          src={post.image_url} 
                          alt={`${post.ticker} Setup`} 
                          fill
                          className="object-contain"
                          unoptimized // Remove if using Next.js image optimization
                        />
                      </div>
                    )}

                    {/* Thesis */}
                    <div className="p-8 bg-[#050505]">
                      <div className="border-l-2 border-blue-500/50 pl-5 py-1 mb-2">
                        <p className="text-neutral-300 leading-loose text-sm font-medium">
                          {post.thesis}
                        </p>
                      </div>
                    </div>

                    {/* Voting Module */}
                    <div className="p-8 bg-[#080808] border-t border-neutral-900">
                      {!hasVoted ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-[10px] text-center text-neutral-500 font-black uppercase tracking-[0.2em] mb-6">
                            Establish Your Bias to Reveal Desk Data
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => handleVote(post.id, 'aligned')} className="relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-neutral-800 hover:border-blue-500/50 transition-all group shadow-lg">
                              <TrendingUp className="text-neutral-600 group-hover:text-blue-500 mb-3 transition-colors duration-300" size={24} />
                              <span className="text-[10px] font-black text-neutral-500 group-hover:text-blue-400 uppercase tracking-widest transition-colors duration-300">Aligned</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'counter')} className="relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-neutral-800 hover:border-red-500/50 transition-all group shadow-lg">
                              <TrendingDown className="text-neutral-600 group-hover:text-red-500 mb-3 transition-colors duration-300" size={24} />
                              <span className="text-[10px] font-black text-neutral-500 group-hover:text-red-400 uppercase tracking-widest transition-colors duration-300">Counter</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'sitting_out')} className="relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-neutral-800 hover:border-neutral-500 transition-all group shadow-lg">
                              <Eye className="text-neutral-600 group-hover:text-neutral-300 mb-3 transition-colors duration-300" size={24} />
                              <span className="text-[10px] font-black text-neutral-500 group-hover:text-neutral-300 uppercase tracking-widest transition-colors duration-300">Sitting Out</span>
                            </button>
                          </div>
                        </div>
                      ) : results ? (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                          <div className="flex justify-between items-end mb-4 border-b border-neutral-800/50 pb-4">
                            <div>
                              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] block mb-1">Confluence Matrix</span>
                              <span className="text-xs font-bold text-white uppercase tracking-wider">{results.totalVotes} Operators Voted</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                              Your Bias: <span className={userVotes[post.id] === 'aligned' ? 'text-blue-400' : userVotes[post.id] === 'counter' ? 'text-red-400' : 'text-neutral-300'}>{userVotes[post.id].replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          {/* Aligned Bar */}
                          <div className="relative h-12 bg-[#000] rounded-xl overflow-hidden flex items-center px-5 border border-neutral-900">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600/20 to-blue-500/40 transition-all duration-1000 ease-out" style={{ width: `${results.aligned}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-[3px] border-blue-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.8)]" style={{ left: `${results.aligned}%` }}></div>
                            <span className="relative z-10 text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase flex items-center gap-3">
                              Aligned
                            </span>
                            <span className="relative z-10 ml-auto text-sm font-black text-white">{results.aligned}%</span>
                          </div>

                          {/* Counter Bar */}
                          <div className="relative h-12 bg-[#000] rounded-xl overflow-hidden flex items-center px-5 border border-neutral-900">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600/20 to-red-500/40 transition-all duration-1000 ease-out" style={{ width: `${results.counter}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-[3px] border-red-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(239,68,68,0.8)]" style={{ left: `${results.counter}%` }}></div>
                            <span className="relative z-10 text-[10px] font-black text-red-400 tracking-[0.2em] uppercase flex items-center gap-3">
                              Counter
                            </span>
                            <span className="relative z-10 ml-auto text-sm font-black text-white">{results.counter}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-8">
                          <Activity className="w-6 h-6 animate-spin text-neutral-700" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* --- RIGHT COLUMN: LIVE SQUAWK --- */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-[#0c0c0c] to-[#050505] rounded-3xl border border-neutral-800/60 sticky top-28 overflow-hidden flex flex-col h-[700px] shadow-[0_8px_30px_rgb(0,0,0,0.8)]">
              
              <div className="p-6 border-b border-neutral-900 bg-[#0a0a0a] flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <Radio className="text-amber-500 w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Live Squawk</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
                {squawks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <Zap className="w-8 h-8 text-neutral-600 mb-4" />
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] text-center">Radar is quiet.<br/>Awaiting broadcasts.</p>
                  </div>
                ) : (
                  squawks.map((squawk, index) => (
                    <div key={squawk.id} className="relative pl-6 border-l border-neutral-800/80 hover:border-amber-500/30 transition-colors group">
                      {/* Pulse dot for the newest item */}
                      <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${index === 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-neutral-700'}`}></div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase">
                          {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {squawk.tag && (
                          <span className="text-[9px] px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-md font-black uppercase tracking-widest group-hover:border-amber-500/20 transition-colors">
                            {squawk.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                        {squawk.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-5 border-t border-neutral-900 bg-[#050505] shrink-0 text-center">
                 <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                   <Shield size={12}/> Encrypted Admin Feed
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
