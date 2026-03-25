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
    setupRealtime()
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

  // --- FULL REALTIME LISTENER ---
  const setupRealtime = () => {
    const channel = supabase
      .channel('public:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (payload) => {
        setSquawks((current) => [payload.new, ...current])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'terminal_posts' }, (payload) => {
        setPosts((current) => [payload.new, ...current])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_votes' }, (payload) => {
        setPollResults((prev) => {
          fetchPollResults([payload.new.post_id])
          return prev
        })
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
    const { error } = await supabase.from('user_votes').insert({ post_id: postId, user_id: userId, vote_type: voteType })
    if (!error) fetchPollResults([postId])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-blue-500 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 animate-pulse">
          Connecting to Terminal...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- COMPACT PROFESSIONAL HEADER --- */}
        <div className="mb-6 pb-4 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <Activity className="text-blue-500 w-5 h-5" /> The Desk
            </h1>
            <span className="hidden sm:inline-block w-[1px] h-4 bg-neutral-800"></span>
            <p className="hidden sm:block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Live Structural Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Market Open
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* --- LEFT COLUMN: TERMINAL FEED --- */}
          <div className="lg:col-span-2 space-y-5">
            {posts.length === 0 ? (
              <div className="bg-[#0a0a0a] p-12 rounded-xl border border-neutral-800 flex flex-col items-center justify-center text-center shadow-2xl">
                <Target className="w-10 h-10 text-neutral-700 mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Awaiting Transmissions</h3>
                <p className="text-neutral-500 text-xs font-bold tracking-wide">
                  Initial structural setups will appear here shortly.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const hasVoted = !!userVotes[post.id]
                const results = pollResults[post.id]

                return (
                  <div key={post.id} className="bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden shadow-2xl transition-all duration-300">
                    
                    {/* Post Header */}
                    <div className="px-5 py-4 border-b border-neutral-900 flex justify-between items-center bg-[#0d0d0d]">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
                          {post.ticker}
                        </span>
                        <span className="text-[9px] font-black text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md uppercase tracking-widest">
                          {post.timeframe}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} className="text-neutral-600" />
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chart Image */}
                    {post.image_url && (
                      <div className="relative w-full h-[300px] md:h-[400px] border-b border-neutral-900 bg-[#111]">
                        <Image 
                          src={post.image_url} 
                          alt={`${post.ticker} Setup`} 
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Thesis */}
                    <div className="p-5 bg-[#0a0a0a]">
                      <div className="border-l-2 border-blue-500 pl-4 py-0.5">
                        <p className="text-neutral-300 text-sm leading-relaxed font-medium">
                          {post.thesis}
                        </p>
                      </div>
                    </div>

                    {/* Voting Module */}
                    <div className="p-5 bg-[#050505] border-t border-neutral-900">
                      {!hasVoted ? (
                        <div className="animate-in fade-in duration-300">
                          <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mb-3">
                            Establish Bias to Reveal Data
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleVote(post.id, 'aligned')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                              <TrendingUp className="text-neutral-600 group-hover:text-blue-500 transition-colors" size={16} />
                              <span className="text-[10px] font-black text-neutral-400 group-hover:text-blue-400 uppercase tracking-widest">Aligned</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'counter')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
                              <TrendingDown className="text-neutral-600 group-hover:text-red-500 transition-colors" size={16} />
                              <span className="text-[10px] font-black text-neutral-400 group-hover:text-red-400 uppercase tracking-widest">Counter</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'sitting_out')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800 transition-all group">
                              <Eye className="text-neutral-600 group-hover:text-neutral-300 transition-colors" size={16} />
                              <span className="text-[10px] font-black text-neutral-500 group-hover:text-neutral-300 uppercase tracking-widest">Sitting Out</span>
                            </button>
                          </div>
                        </div>
                      ) : results ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{results.totalVotes} Operators Voted</span>
                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                              Your Bias: <span className={userVotes[post.id] === 'aligned' ? 'text-blue-400' : userVotes[post.id] === 'counter' ? 'text-red-400' : 'text-neutral-300'}>{userVotes[post.id].replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          {/* Aligned Bar */}
                          <div className="relative h-10 bg-[#111] rounded-lg overflow-hidden flex items-center px-4 border border-neutral-800">
                            <div className="absolute top-0 left-0 h-full bg-blue-600/20 transition-all duration-1000 ease-out" style={{ width: `${results.aligned}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-2 border-blue-500 transition-all duration-1000 ease-out" style={{ left: `${results.aligned}%` }}></div>
                            <span className="relative z-10 text-[10px] font-black text-blue-400 tracking-widest uppercase flex items-center gap-2">
                              Aligned
                            </span>
                            <span className="relative z-10 ml-auto text-xs font-black text-white">{results.aligned}%</span>
                          </div>

                          {/* Counter Bar */}
                          <div className="relative h-10 bg-[#111] rounded-lg overflow-hidden flex items-center px-4 border border-neutral-800">
                            <div className="absolute top-0 left-0 h-full bg-red-600/20 transition-all duration-1000 ease-out" style={{ width: `${results.counter}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-2 border-red-500 transition-all duration-1000 ease-out" style={{ left: `${results.counter}%` }}></div>
                            <span className="relative z-10 text-[10px] font-black text-red-400 tracking-widest uppercase flex items-center gap-2">
                              Counter
                            </span>
                            <span className="relative z-10 ml-auto text-xs font-black text-white">{results.counter}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-4">
                          <Activity className="w-5 h-5 animate-spin text-neutral-700" />
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
            <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 sticky top-6 overflow-hidden flex flex-col h-[calc(100vh-100px)] shadow-2xl">
              
              <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center gap-2 shrink-0">
                <Radio className="text-amber-500 w-4 h-4 animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Squawk</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar relative">
                {squawks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <Zap className="w-6 h-6 text-neutral-600 mb-3" />
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">Radar is quiet</p>
                  </div>
                ) : (
                  squawks.map((squawk, index) => (
                    <div key={squawk.id} className="relative pl-5 border-l border-neutral-800 hover:border-amber-500/50 transition-colors group">
                      <div className={`absolute -left-[4px] top-1.5 w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-amber-500' : 'bg-neutral-700'}`}></div>
                      
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">
                          {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {squawk.tag && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded font-black uppercase tracking-widest">
                            {squawk.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                        {squawk.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 border-t border-neutral-900 bg-[#050505] shrink-0 text-center">
                 <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                   <Shield size={10}/> Encrypted Connection
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
