'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Eye, Activity, Clock, Zap, Target, Shield, Radio, X, ZoomIn, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

// --- TYPES ---
interface Post {
  id: string
  ticker: string
  timeframe: string
  thesis: string
  image_url: string | null
  created_at: string
}

interface Squawk {
  id: string
  message: string
  tag: string | null
  created_at: string
}

interface PollResult {
  aligned: number
  counter: number
  sitting_out: number
  totalVotes: number
}

// --- LIGHTBOX SUB-COMPONENT ---
function ChartLightbox({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIn = e.deltaY < 0
    const newScale = zoomIn ? Math.min(scale + 0.15, 5) : Math.max(scale - 0.15, 1)
    if (newScale === 1) setPosition({ x: 0, y: 0 })
    setScale(newScale)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleDoubleClick = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />
      
      <div className="absolute top-6 right-6 flex gap-3 z-50">
        <button onClick={handleDoubleClick} className="p-3 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-blue-400 transition-colors border border-neutral-800 shadow-2xl" title="Reset Zoom">
          <RefreshCw size={20} />
        </button>
        <button onClick={onClose} className="p-3 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-red-400 transition-colors border border-neutral-800 shadow-2xl">
          <X size={20} />
        </button>
      </div>

      <div 
        className="relative w-[95vw] h-[90vh] flex items-center justify-center overflow-hidden rounded-xl border border-neutral-800/50 shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#050505] p-2"
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={handleDoubleClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="relative w-full h-full flex items-center justify-center" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}>
          <Image src={imageUrl} alt="Expanded Chart" fill className="object-contain pointer-events-none" unoptimized />
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-neutral-900/80 backdrop-blur-md rounded-full border border-neutral-800 flex items-center gap-3 shadow-2xl">
        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest flex items-center">
          <span className="text-blue-400 mx-2">{Math.round(scale * 100)}% Zoom</span> |
          <span className="mx-2">Scroll to Zoom</span> |
          <span className="mx-2">Drag to Pan</span> |
          <span className="mx-2">Double Click to Reset</span>
        </p>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function LiveFloorPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const [posts, setPosts] = useState<Post[]>([])
  const [squawks, setSquawks] = useState<Squawk[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [pollResults, setPollResults] = useState<Record<string, PollResult>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const floorEndRef = useRef<HTMLDivElement>(null)
  const squawkEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInitialData()
    const cleanup = setupRealtime() 
    return () => cleanup()
  }, [])

  useEffect(() => { floorEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [posts])
  useEffect(() => { squawkEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [squawks])

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const [postsRes, squawksRes] = await Promise.all([
        supabase.from('terminal_posts').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('live_squawk').select('*').order('created_at', { ascending: false }).limit(30)
      ])

      if (postsRes.data) setPosts(postsRes.data.reverse())
      if (squawksRes.data) setSquawks(squawksRes.data.reverse())

      if (user && postsRes.data && postsRes.data.length > 0) {
        const postIds = postsRes.data.map(p => p.id)
        const { data: votesData } = await supabase.from('user_votes').select('post_id, vote_type').eq('user_id', user.id).in('post_id', postIds)
        
        if (votesData) {
          const voteMap = votesData.reduce((acc, v) => ({ ...acc, [v.post_id]: v.vote_type }), {})
          setUserVotes(voteMap)
          const votedPostIds = Object.keys(voteMap)
          if (votedPostIds.length > 0) fetchPollResults(votedPostIds)
        }
      }
    } catch (error) {
      console.error('Error fetching floor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    const channel = supabase.channel('public:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => [...c, p.new as Squawk]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => [...c, p.new as Post]))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_votes' }, (p) => {
        setPollResults((prev) => { fetchPollResults([p.new.post_id]); return prev })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const fetchPollResults = async (postIds: string[]) => {
    const { data } = await supabase.from('user_votes').select('post_id, vote_type').in('post_id', postIds)
    if (!data) return

    const newResults = postIds.reduce((acc, id) => {
      const postVotes = data.filter(v => v.post_id === id)
      const total = postVotes.length || 1 
      acc[id] = {
        aligned: Math.round((postVotes.filter(v => v.vote_type === 'aligned').length / total) * 100),
        counter: Math.round((postVotes.filter(v => v.vote_type === 'counter').length / total) * 100),
        sitting_out: Math.round((postVotes.filter(v => v.vote_type === 'sitting_out').length / total) * 100),
        totalVotes: postVotes.length
      }
      return acc
    }, {} as Record<string, PollResult>)

    setPollResults(prev => ({ ...prev, ...newResults }))
  }

  const handleVote = async (postId: string, voteType: 'aligned' | 'counter' | 'sitting_out') => {
    if (!userId) return
    setUserVotes(prev => ({ ...prev, [postId]: voteType }))
    const { error } = await supabase.from('user_votes').insert({ post_id: postId, user_id: userId, vote_type: voteType })
    if (!error) fetchPollResults([postId])
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-[#050505] flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
        <Activity className="w-8 h-8 text-blue-500 mb-4 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 animate-pulse">Connecting to Terminal...</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#050505] text-neutral-200 p-4 md:p-5 flex flex-col overflow-hidden relative h-[calc(100vh-65px)]">
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 overflow-hidden h-full">
          
          {/* LEFT PANE: LIVE FLOOR */}
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl border border-neutral-800 flex flex-col h-full shadow-2xl overflow-hidden relative">
            <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20"><Activity className="text-blue-500 w-5 h-5" /></div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Floor</h3>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Structural Analysis</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[#050505]">
              {posts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <Target className="w-10 h-10 text-neutral-600 mb-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Awaiting Setups</h3>
                </div>
              ) : (
                posts.map((post) => {
                  const hasVoted = !!userVotes[post.id]
                  const results = pollResults[post.id]

                  return (
                    <div key={post.id} className="bg-[#0a0a0a] rounded-xl border border-neutral-800 overflow-hidden shadow-lg transition-all duration-300">
                      <div className="px-5 py-3 border-b border-neutral-900 flex justify-between items-center bg-[#0d0d0d]">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">{post.ticker}</span>
                          <span className="text-[9px] font-black text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md uppercase tracking-widest">{post.timeframe}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={10} className="text-neutral-600" />
                          {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex flex-col xl:flex-row p-5 gap-6">
                        <div className="w-full xl:w-[60%] flex flex-col gap-4">
                          {post.image_url && (
                            <div className="relative w-full aspect-video rounded-xl border border-neutral-800 bg-[#000] overflow-hidden group cursor-zoom-in" onClick={() => setExpandedImage(post.image_url!)}>
                              <Image src={post.image_url} alt={`${post.ticker} Setup`} fill className="object-contain transition-transform duration-500 group-hover:scale-[1.02]" unoptimized />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10"><ZoomIn size={14} className="text-blue-400" /> Expand Chart</span>
                              </div>
                            </div>
                          )}
                          <div className="pl-4 border-l-2 border-blue-500/50">
                            <p className="text-neutral-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">{post.thesis}</p>
                          </div>
                        </div>

                        <div className="w-full xl:w-[40%] flex flex-col">
                          <div className="h-full bg-[#050505] rounded-xl border border-neutral-900 p-5 flex flex-col justify-center shadow-inner">
                            {!hasVoted ? (
                              <div className="animate-in fade-in duration-300 space-y-3">
                                <p className="text-[9px] text-center text-neutral-500 font-black uppercase tracking-widest mb-4">Establish Bias</p>
                                <div className="flex flex-col gap-3">
                                  <button onClick={() => handleVote(post.id, 'aligned')} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 group"><span className="text-[10px] font-black text-neutral-400 group-hover:text-blue-400 uppercase tracking-widest">Aligned</span><TrendingUp className="text-neutral-600 group-hover:text-blue-500" size={16} /></button>
                                  <button onClick={() => handleVote(post.id, 'counter')} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-red-500/50 hover:bg-red-500/5 group"><span className="text-[10px] font-black text-neutral-400 group-hover:text-red-400 uppercase tracking-widest">Counter</span><TrendingDown className="text-neutral-600 group-hover:text-red-500" size={16} /></button>
                                  <button onClick={() => handleVote(post.id, 'sitting_out')} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#111] border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-800 group"><span className="text-[10px] font-black text-neutral-500 group-hover:text-neutral-300 uppercase tracking-widest">Sitting Out</span><Eye className="text-neutral-600 group-hover:text-neutral-300" size={16} /></button>
                                </div>
                              </div>
                            ) : results ? (
                              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex flex-col gap-1.5 border-b border-neutral-800 pb-4 mb-2">
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{results.totalVotes} Traders Voted</span>
                                  <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Your Bias: <span className={userVotes[post.id] === 'aligned' ? 'text-blue-400' : userVotes[post.id] === 'counter' ? 'text-red-400' : 'text-neutral-300'}>{userVotes[post.id].replace('_', ' ')}</span></div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Aligned</span><span className="text-[11px] font-black text-white">{results.aligned}%</span></div>
                                    <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden border border-neutral-800"><div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${results.aligned}%` }} /></div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black text-red-400 tracking-widest uppercase">Counter</span><span className="text-[11px] font-black text-white">{results.counter}%</span></div>
                                    <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden border border-neutral-800"><div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${results.counter}%` }} /></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center py-4"><Activity className="w-5 h-5 animate-spin text-neutral-700" /></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={floorEndRef} className="h-1" />
            </div>
          </div>

          {/* RIGHT PANE: LIVE SQUAWK */}
          <div className="lg:col-span-1 bg-[#0a0a0a] rounded-xl border border-neutral-800 flex flex-col h-full shadow-2xl overflow-hidden relative">
            <div className="px-5 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20"><Radio className="text-amber-500 w-4 h-4 animate-pulse" /></div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Squawk</h3>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Rapid Comms</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[#050505]">
              {squawks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Zap className="w-6 h-6 text-neutral-600 mb-3" />
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">No recent updates</p>
                </div>
              ) : (
                squawks.map((squawk, index) => (
                  <div key={squawk.id} className="relative pl-5 border-l border-neutral-800 hover:border-amber-500/50 transition-colors group animate-in fade-in slide-in-from-bottom-2">
                    <div className={`absolute -left-[4px] top-1.5 w-1.5 h-1.5 rounded-full ${index === squawks.length - 1 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-neutral-700'}`} />
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">{new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {squawk.tag && <span className="text-[8px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded font-black uppercase tracking-widest">{squawk.tag}</span>}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-medium whitespace-pre-wrap">{squawk.message}</p>
                  </div>
                ))
              )}
              <div ref={squawkEndRef} className="h-1" />
            </div>
            
            <div className="p-3 border-t border-neutral-900 bg-[#0d0d0d] shrink-0 text-center shadow-md">
               <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center justify-center gap-1.5"><Shield size={10}/> Official Admin Feed</p>
            </div>
          </div>

        </div>
      </div>

      {expandedImage && <ChartLightbox imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />}
    </div>
  )
}
