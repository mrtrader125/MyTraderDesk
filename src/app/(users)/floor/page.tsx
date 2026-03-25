'use client'

import { useEffect, useState, useRef } from 'react'
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
  
  // Ref for WhatsApp-style auto-scrolling
  const squawkEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInitialData()
    setupRealtime()
  }, [])

  // Auto-scroll to bottom whenever a new squawk arrives
  useEffect(() => {
    if (squawkEndRef.current) {
      squawkEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [squawks])

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

      // Fetch the last 50 messages, but display them oldest->newest (WhatsApp style)
      const { data: squawkData } = await supabase
        .from('live_squawk')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (squawkData) {
        // Reverse the array so the oldest is at the top, and newest is at the bottom
        setSquawks(squawkData.reverse())
      }

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

  const setupRealtime = () => {
    const channel = supabase
      .channel('public:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (payload) => {
        // APPEND to the bottom of the array (WhatsApp style)
        setSquawks((current) => [...current, payload.new])
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
        <Activity className="w-6 h-6 text-blue-500 mb-3 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 animate-pulse">
          Loading Live Floor...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-6 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- COMPACT HEADER --- */}
        <div className="mb-4 pb-3 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <Activity className="text-blue-500 w-4 h-4" /> Live Floor
            </h1>
            <span className="hidden sm:inline-block w-[1px] h-3 bg-neutral-800"></span>
            <p className="hidden sm:block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Market Analysis & Setups
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Market Open
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* --- LEFT COLUMN: COMPACT SETUPS DASHBOARD --- */}
          <div className="lg:col-span-2 space-y-4">
            {posts.length === 0 ? (
              <div className="bg-[#0a0a0a] p-8 rounded-xl border border-neutral-800 flex flex-col items-center justify-center text-center shadow-xl">
                <Target className="w-8 h-8 text-neutral-700 mb-3" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-1">Awaiting Setups</h3>
                <p className="text-neutral-500 text-[10px] font-bold tracking-wide">
                  Today's market analysis will appear here shortly.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const hasVoted = !!userVotes[post.id]
                const results = pollResults[post.id]

                return (
                  <div key={post.id} className="bg-[#080808] rounded-xl border border-neutral-800 overflow-hidden shadow-xl transition-all duration-300">
                    
                    {/* Compact Post Header */}
                    <div className="px-4 py-2.5 border-b border-neutral-900 flex justify-between items-center bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded border border-blue-500/20">
                          {post.ticker}
                        </span>
                        <span className="text-[9px] font-black text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded uppercase tracking-widest">
                          {post.timeframe}
                        </span>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} className="text-neutral-600" />
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* SIDE-BY-SIDE LAYOUT: Image (Left) & Voting (Right) */}
                    <div className="flex flex-col md:flex-row p-4 gap-5">
                      
                      {/* Left Side: Scaled Down Image & Thesis (60% Width) */}
                      <div className="w-full md:w-[60%] flex flex-col gap-3 shrink-0">
                        {post.image_url && (
                          <div className="relative w-full aspect-video rounded-lg border border-neutral-800 bg-[#000] overflow-hidden">
                            <Image 
                              src={post.image_url} 
                              alt={`${post.ticker} Setup`} 
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="pl-3 border-l-2 border-blue-500/50">
                          <p className="text-neutral-300 text-xs leading-relaxed font-medium">
                            {post.thesis}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Stacked Voting Terminal (40% Width) */}
                      <div className="w-full md:w-[40%] flex flex-col">
                        <div className="h-full bg-[#0d0d0d] rounded-lg border border-neutral-900 p-4 flex flex-col justify-center">
                          {!hasVoted ? (
                            <div className="animate-in fade-in duration-300 space-y-3">
                              <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest text-center border-b border-neutral-800 pb-2 mb-3">
                                Establish Bias
                              </p>
                              <div className="flex flex-col gap-2">
                                <button onClick={() => handleVote(post.id, 'aligned')} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-[#111] border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                                  <span className="text-[10px] font-black text-neutral-400 group-hover:text-blue-400 uppercase tracking-widest">Aligned</span>
                                  <TrendingUp className="text-neutral-600 group-hover:text-blue-500 transition-colors" size={14} />
                                </button>
                                <button onClick={() => handleVote(post.id, 'counter')} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-[#111] border border-neutral-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
                                  <span className="text-[10px] font-black text-neutral-400 group-hover:text-red-400 uppercase tracking-widest">Counter</span>
                                  <TrendingDown className="text-neutral-600 group-hover:text-red-500 transition-colors" size={14} />
                                </button>
                                <button onClick={() => handleVote(post.id, 'sitting_out')} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-[#111] border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800 transition-all group">
                                  <span className="text-[10px] font-black text-neutral-500 group-hover:text-neutral-300 uppercase tracking-widest">Sitting Out</span>
                                  <Eye className="text-neutral-600 group-hover:text-neutral-300 transition-colors" size={14} />
                                </button>
                              </div>
                            </div>
                          ) : results ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                              <div className="flex flex-col gap-1 border-b border-neutral-800 pb-3 mb-1">
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">{results.totalVotes} Operators Voted</span>
                                <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                                  Your Bias: <span className={userVotes[post.id] === 'aligned' ? 'text-blue-400' : userVotes[post.id] === 'counter' ? 'text-red-400' : 'text-neutral-300'}>{userVotes[post.id].replace('_', ' ')}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Aligned Bar */}
                                <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase">Aligned</span>
                                    <span className="text-[10px] font-black text-white">{results.aligned}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${results.aligned}%` }}></div>
                                  </div>
                                </div>

                                {/* Counter Bar */}
                                <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[9px] font-black text-red-400 tracking-widest uppercase">Counter</span>
                                    <span className="text-[10px] font-black text-white">{results.counter}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${results.counter}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center py-4">
                              <Activity className="w-4 h-4 animate-spin text-neutral-700" />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* --- RIGHT COLUMN: WHATSAPP-STYLE LIVE SQUAWK --- */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 sticky top-4 overflow-hidden flex flex-col h-[calc(100vh-80px)] shadow-xl">
              
              <div className="px-4 py-3 border-b border-neutral-900 bg-[#0d0d0d] flex items-center gap-2 shrink-0 z-10">
                <Radio className="text-amber-500 w-3.5 h-3.5 animate-pulse" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Live Squawk</h3>
              </div>

              {/* Chat Container (Scrolls automatically) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar relative">
                {squawks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <Zap className="w-5 h-5 text-neutral-600 mb-2" />
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest text-center">No recent updates</p>
                  </div>
                ) : (
                  squawks.map((squawk, index) => {
                    const isNewest = index === squawks.length - 1; // Highlight the absolute newest message
                    return (
                      <div key={squawk.id} className={`relative pl-4 border-l ${isNewest ? 'border-amber-500/50 bg-amber-500/5 py-2 pr-2 rounded-r-lg' : 'border-neutral-800'} transition-all`}>
                        <div className={`absolute -left-[3px] top-2.5 w-1.5 h-1.5 rounded-full ${isNewest ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-neutral-700'}`}></div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] text-neutral-500 font-black tracking-widest uppercase">
                            {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {squawk.tag && (
                            <span className="text-[7px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded font-black uppercase tracking-widest">
                              {squawk.tag}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] leading-relaxed font-medium ${isNewest ? 'text-white' : 'text-neutral-400'}`}>
                          {squawk.message}
                        </p>
                      </div>
                    )
                  })
                )}
                {/* Auto-scroll target */}
                <div ref={squawkEndRef} />
              </div>
              
              <div className="p-2.5 border-t border-neutral-900 bg-[#050505] shrink-0 text-center z-10">
                 <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                   <Shield size={9}/> Official Admin Feed
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
