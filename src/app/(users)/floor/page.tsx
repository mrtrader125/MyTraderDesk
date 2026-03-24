'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabaseServer' // Adjust path if needed
import { TrendingUp, TrendingDown, Eye, Activity, Clock, Zap, Target, Shield } from 'lucide-react'

// You'll likely want to use the browser client here since it's a 'use client' component
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LiveFloorPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [squawks, setSquawks] = useState<any[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}) // Track what the current user voted
  const [pollResults, setPollResults] = useState<Record<string, any>>({}) // Track the percentages
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchInitialData()
    setupRealtimeSquawk()
  }, [])

  const fetchInitialData = async () => {
    try {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      // 2. Fetch Terminal Posts
      const { data: postsData } = await supabase
        .from('terminal_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (postsData) setPosts(postsData)

      // 3. Fetch Live Squawk
      const { data: squawkData } = await supabase
        .from('live_squawk')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15)
      
      if (squawkData) setSquawks(squawkData)

      // 4. If user exists, fetch their previous votes to show the results
      if (user && postsData) {
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

          // Fetch aggregate results ONLY for posts the user has voted on
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

  // Realtime listener for the right-side Squawk feed
  const setupRealtimeSquawk = () => {
    const channel = supabase
      .channel('public:live_squawk')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (payload) => {
        setSquawks((current) => [payload.new, ...current])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  // Calculate percentages for posts the user has unlocked
  const fetchPollResults = async (postIds: string[]) => {
    // In a production app, this should be a Supabase RPC (Stored Procedure) 
    // to calculate counts efficiently on the server. For now, we fetch raw votes.
    const { data } = await supabase
      .from('user_votes')
      .select('post_id, vote_type')
      .in('post_id', postIds)

    if (data) {
      const results: Record<string, any> = {}
      postIds.forEach(id => {
        const postVotes = data.filter(v => v.post_id === id)
        const total = postVotes.length || 1 // prevent divide by zero
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

    // Optimistic UI update
    setUserVotes(prev => ({ ...prev, [postId]: voteType }))

    // Insert into DB
    const { error } = await supabase
      .from('user_votes')
      .insert({ post_id: postId, user_id: userId, vote_type: voteType })

    if (!error) {
      // Fetch the new aggregate results to reveal the bars to the user
      fetchPollResults([postId])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Activity className="w-10 h-10 animate-pulse text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 flex items-center justify-between border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="text-blue-500" /> The Live Floor
            </h1>
            <p className="text-neutral-500 mt-2 text-sm font-medium uppercase tracking-widest">
              Institutional Intelligence & Execution Terminal
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Market Open</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: THE TERMINAL FEED */}
          <div className="lg:col-span-2 space-y-8">
            {posts.length === 0 ? (
              <div className="bg-[#0a0a0a] p-12 rounded-3xl border border-neutral-800 text-center">
                <Target className="w-12 h-12 mx-auto text-neutral-700 mb-4" />
                <p className="text-neutral-400 font-bold tracking-wide">Awaiting initial setups from the Desk.</p>
              </div>
            ) : (
              posts.map((post) => {
                const hasVoted = !!userVotes[post.id]
                const results = pollResults[post.id]

                return (
                  <div key={post.id} className="bg-[#0a0a0a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-[#0d0d0d]">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                          {post.ticker}
                        </span>
                        <span className="text-xs font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md">
                          {post.timeframe}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chart Image */}
                    {post.image_url && (
                      <div className="relative w-full h-[400px] border-b border-neutral-900 bg-[#111]">
                        <Image 
                          src={post.image_url} 
                          alt={`${post.ticker} Setup`} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Thesis */}
                    <div className="p-6">
                      <p className="text-neutral-300 leading-relaxed text-sm">
                        {post.thesis}
                      </p>
                    </div>

                    {/* BLIND VOTING MODULE */}
                    <div className="p-6 bg-[#050505] border-t border-neutral-900">
                      {!hasVoted ? (
                        <div>
                          <p className="text-xs text-center text-neutral-500 font-bold uppercase tracking-widest mb-4">
                            Establish Your Bias to Reveal Data
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleVote(post.id, 'aligned')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 transition-colors group">
                              <TrendingUp className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Aligned</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'counter')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-colors group">
                              <TrendingDown className="text-red-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Counter</span>
                            </button>
                            <button onClick={() => handleVote(post.id, 'sitting_out')} className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:bg-neutral-800 transition-colors group">
                              <Eye className="text-neutral-400 mb-2 group-hover:scale-110 transition-transform" size={20} />
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Sitting Out</span>
                            </button>
                          </div>
                        </div>
                      ) : results ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Community Confluence</span>
                            <span className="text-[10px] font-bold text-neutral-600 uppercase">{results.totalVotes} Operators Voted</span>
                          </div>
                          
                          {/* Aligned Bar */}
                          <div className="relative h-10 bg-neutral-900 rounded-xl overflow-hidden flex items-center px-4">
                            <div className="absolute top-0 left-0 h-full bg-blue-500/20 transition-all duration-1000" style={{ width: `${results.aligned}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-2 border-blue-500 transition-all duration-1000" style={{ left: `${results.aligned}%` }}></div>
                            <span className="relative z-10 text-xs font-black text-blue-400 tracking-widest uppercase flex items-center gap-2">
                              {userVotes[post.id] === 'aligned' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>} Aligned
                            </span>
                            <span className="relative z-10 ml-auto text-sm font-black text-white">{results.aligned}%</span>
                          </div>

                          {/* Counter Bar */}
                          <div className="relative h-10 bg-neutral-900 rounded-xl overflow-hidden flex items-center px-4">
                            <div className="absolute top-0 left-0 h-full bg-red-500/20 transition-all duration-1000" style={{ width: `${results.counter}%` }}></div>
                            <div className="absolute top-0 left-0 h-full border-l-2 border-red-500 transition-all duration-1000" style={{ left: `${results.counter}%` }}></div>
                            <span className="relative z-10 text-xs font-black text-red-400 tracking-widest uppercase flex items-center gap-2">
                              {userVotes[post.id] === 'counter' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>} Counter
                            </span>
                            <span className="relative z-10 ml-auto text-sm font-black text-white">{results.counter}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-4">
                          <Activity className="w-5 h-5 animate-pulse text-neutral-600" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* RIGHT COLUMN: LIVE SQUAWK */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a] rounded-3xl border border-neutral-800 sticky top-28 overflow-hidden flex flex-col h-[700px]">
              
              <div className="p-5 border-b border-neutral-900 bg-[#0d0d0d] flex items-center gap-3 shrink-0">
                <Zap className="text-amber-500 w-5 h-5" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Squawk</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {squawks.length === 0 ? (
                  <p className="text-xs text-neutral-600 font-bold uppercase text-center mt-10">Radar is quiet.</p>
                ) : (
                  squawks.map((squawk) => (
                    <div key={squawk.id} className="relative pl-4 border-l-2 border-neutral-800 hover:border-neutral-600 transition-colors">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-neutral-700"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
                          {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {squawk.tag && (
                          <span className="text-[9px] px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-black uppercase tracking-widest">
                            {squawk.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {squawk.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-neutral-900 bg-[#050505] shrink-0 text-center">
                 <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Shield size={12}/> Admin Feed Secured
                 </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
