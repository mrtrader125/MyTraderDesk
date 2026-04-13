'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Activity, Clock, Target, Radio, X, ZoomIn, Lock, MessageSquare, PanelRightClose, PanelRightOpen, Brain, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight, Image as ImageIcon, Megaphone, Send, Edit3 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PostInteraction = {
  taken: boolean;
  rulesFollowed: boolean | null;
  vote: 'align' | 'counter' | null;
  note: string;
}

// 🚨 NEW: Lightweight Telegram Markdown to Web HTML Parser
const formatTelegramText = (text: string) => {
  if (!text) return '';
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#2AABEE] hover:text-blue-400 hover:underline underline-offset-2">$1</a>');
  
  return formatted;
}

export default function LiveFloorClient({ 
  initialPosts, 
  initialSquawks, 
  userId, 
  userPlan,
  username 
}: any) {
  const [posts, setPosts] = useState<any[]>(initialPosts || [])
  const [squawks, setSquawks] = useState<any[]>(initialSquawks || [])
  
  // UI States
  const [isCommsOpen, setIsCommsOpen] = useState(true)
  const [activeFloorTab, setActiveFloorTab] = useState<'feed' | 'reflection'>('feed')
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // 🚨 NOTIFICATION STATE
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Ref to track comms state inside the Supabase listener without causing re-renders
  const isCommsOpenRef = useRef(isCommsOpen)
  useEffect(() => {
    isCommsOpenRef.current = isCommsOpen
  }, [isCommsOpen])

  // Real Database State
  const [interactions, setInteractions] = useState<Record<string, PostInteraction>>({})
  
  const [currentTime, setCurrentTime] = useState<number | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null) 
  const [tempNote, setTempNote] = useState<string>('') 

  const squawkEndRef = useRef<HTMLDivElement>(null)
  const floorEndRef = useRef<HTMLDivElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // 1. FETCH USER'S SAVED DATA ON LOAD
  useEffect(() => {
    const fetchUserInteractions = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from('user_post_interactions').select('*').eq('user_id', userId)

      if (data && !error) {
        const dbInteractions: Record<string, PostInteraction> = {}
        data.forEach(item => {
          dbInteractions[item.post_id] = {
            taken: item.taken,
            rulesFollowed: item.rules_followed,
            vote: item.vote,
            note: item.note || ''
          }
        })
        setInteractions(dbInteractions)
      }
    }
    fetchUserInteractions()
  }, [userId])

  useEffect(() => {
    setCurrentTime(Date.now())
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // 🚨 FIXED: ONLY AUTO-SCROLL IF THE PANEL IS ACTUALLY OPEN
  // This prevents the browser from ripping the layout sideways to view an off-screen hidden element
  useEffect(() => { 
    if (isCommsOpen) {
      squawkEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
    }
  }, [squawks, isCommsOpen])
  
  useEffect(() => { floorEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [posts, activeFloorTab])

  // SUPABASE LIVE SYNC
  useEffect(() => {
    const channel = supabase.channel('public:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (p) => {
        setSquawks((c) => [...c, p.new])
        // If comms are closed when message arrives, increment badge
        if (!isCommsOpenRef.current) {
          setUnreadCount((prev) => prev + 1)
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => c.filter(s => s.id !== p.old.id)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => [...c, p.new]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => c.filter(post => post.id !== p.old.id)))
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    if (editingNoteId && noteInputRef.current) {
      noteInputRef.current.focus()
      noteInputRef.current.setSelectionRange(noteInputRef.current.value.length, noteInputRef.current.value.length)
    }
  }, [editingNoteId])

  const isProUser = userPlan === 'pro' || userPlan === 'premium'

  const handleInteractionUpdate = async (postId: string, updates: Partial<PostInteraction>) => {
    if (!userId) return;

    setInteractions(prev => {
      const existing = prev[postId] || { taken: false, rulesFollowed: null, vote: null, note: '' }
      let newRulesFollowed = updates.rulesFollowed !== undefined ? updates.rulesFollowed : existing.rulesFollowed;
      if (updates.taken === false) newRulesFollowed = null; 
      
      const updatedState = { ...existing, ...updates, rulesFollowed: newRulesFollowed }
      
      supabase.from('user_post_interactions').upsert({
        user_id: userId,
        post_id: postId,
        taken: updatedState.taken,
        rules_followed: updatedState.rulesFollowed,
        vote: updatedState.vote,
        note: updatedState.note,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, post_id' }).then(({ error }) => {
        if (error) console.error("Database save failed:", error)
      })

      return { ...prev, [postId]: updatedState }
    })
  }

  const getVoteStats = (post: any, userVote: 'align' | 'counter' | null) => {
    if (currentTime === null) return 50;

    let realAligns = 1 + (userVote === 'align' ? 1 : 0);
    let realCounters = 1 + (userVote === 'counter' ? 1 : 0);

    if (post.admin_align_pct !== null && post.admin_align_pct !== undefined) {
      const FAKE_POOL_SIZE = 450;
      const targetFakeAligns = FAKE_POOL_SIZE * (post.admin_align_pct / 100);
      const targetFakeCounters = FAKE_POOL_SIZE * ((100 - post.admin_align_pct) / 100);

      const postTime = new Date(post.created_at).getTime();
      const elapsedMinutes = Math.max(0, (currentTime - postTime) / 60000);

      let progress = Math.min(elapsedMinutes / 120, 1);
      progress = Math.floor(progress * 12) / 12;

      const noise = (String(post.id).charCodeAt(0) % 10) / 100;
      if (progress > 0 && progress < 1) {
        progress = Math.min(progress + noise, 1);
      }

      realAligns += Math.floor(targetFakeAligns * progress);
      realCounters += Math.floor(targetFakeCounters * progress);
    }

    const total = realAligns + realCounters;
    return Math.round((realAligns / total) * 100);
  }

  const floorSetups = posts.filter(post => post.image_url && post.image_url.trim() !== '')
  const takenTrades = floorSetups.filter(p => interactions[p.id]?.taken)
  const rulesFollowedCount = takenTrades.filter(p => interactions[p.id]?.rulesFollowed === true).length
  const ruleBreaksCount = takenTrades.filter(p => interactions[p.id]?.rulesFollowed === false).length

  const handleOpenNoteEditor = (postId: string, currentNote: string) => {
    setTempNote(currentNote || '')
    setEditingNoteId(postId)
  }

  const handleSaveNote = () => {
    if (editingNoteId) {
      handleInteractionUpdate(editingNoteId, { note: tempNote.trim() })
      setEditingNoteId(null)
    }
  }

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveNote()
    }
    if (e.key === 'Escape') setEditingNoteId(null)
  }

  const toggleComms = () => {
    setIsCommsOpen(!isCommsOpen);
    if (!isCommsOpen) {
      // We are opening it, reset badge
      setUnreadCount(0);
    }
  }

  if (!isProUser) {
    return (
      <div className="w-full h-[calc(100dvh-65px)] bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0a0a0a] border border-white/[0.04] rounded-3xl p-8 md:p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Live Floor Locked</h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-8">
            The Live Floor is strictly reserved for Professional members. Upgrade to get real-time setups, direct desk updates, and global sentiment voting.
          </p>
          <a 
            href="/account/subscription" 
            className="block w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            Upgrade to Professional
          </a>
          <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-6">
            Instant Activation
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* FULLSCREEN IMAGE MODAL */}
      {expandedImage && (
        <div className="fixed inset-0 z-[99999] bg-[#000000]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setExpandedImage(null)}>
          <div className="relative w-full max-w-7xl aspect-[16/9] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <Image src={expandedImage} alt="Expanded Chart" fill className="object-contain" unoptimized />
            <button className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black rounded-full text-neutral-400 hover:text-white transition-all ring-1 ring-white/10 backdrop-blur-md">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-[#030303] text-neutral-200 p-4 md:p-6 flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
        <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
          <div className="flex-1 flex gap-6 lg:gap-8 min-h-0 overflow-hidden h-full">
            
            {/* LEFT PANE: NATIVE PAGE STYLE */}
            <div className="flex flex-col h-full overflow-hidden relative transition-all duration-500 ease-in-out flex-1">
              
              {/* PAGE-STYLE TABS */}
              <div className="flex items-end justify-between border-b border-white/[0.04] shrink-0 z-10 mb-4">
                <div className="flex gap-8 px-2">
                  <button 
                    onClick={() => setActiveFloorTab('feed')}
                    className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all duration-300 ${
                      activeFloorTab === 'feed' ? 'border-b-2 border-white text-white' : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Activity size={16} className={`transition-colors duration-300 ${activeFloorTab === 'feed' ? 'text-blue-400' : ''}`} /> Live Floor
                  </button>
                  <button 
                    onClick={() => setActiveFloorTab('reflection')}
                    className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all duration-300 ${
                      activeFloorTab === 'reflection' ? 'border-b-2 border-white text-white' : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Brain size={16} className={`transition-colors duration-300 ${activeFloorTab === 'reflection' ? 'text-emerald-400' : ''}`} /> Reflection
                  </button>
                </div>

                {/* 🚨 UPDATED TOGGLE BUTTON WITH NOTIFICATION BADGE */}
                <button 
                  onClick={toggleComms}
                  className="hidden lg:flex relative items-center justify-center text-neutral-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.06] w-9 h-9 rounded-lg mb-3 border border-white/[0.04]"
                  title={isCommsOpen ? "Collapse Telegram Feed" : "Expand Telegram Feed"}
                >
                  {isCommsOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                  
                  {!isCommsOpen && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#2AABEE] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center border border-[#030303] animate-in zoom-in shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: DESK FEED */}
              {activeFloorTab === 'feed' && (
                <div key="tab-feed" className="flex-1 overflow-y-auto pb-8 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out px-1">
                  {posts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                      <Target className="w-12 h-12 text-neutral-600 mb-4 stroke-1" />
                      <h3 className="text-sm font-medium tracking-wide text-neutral-400">Awaiting Transmissions</h3>
                    </div>
                  ) : (
                    <div className="space-y-8 max-w-[1000px] mx-auto mt-8">
                      {posts.map((post) => {
                        const isLocked = post.tier_access === 'pro' && !isProUser
                        const isSetup = post.image_url && post.image_url.trim() !== ''
                        const pInt = interactions[post.id] || { taken: false, rulesFollowed: null, vote: null, note: '' }
                        
                        const alignPercent = getVoteStats(post, pInt.vote)

                        // --- TEXT ONLY BROADCAST ---
                        if (!isSetup) {
                          return (
                            <div key={post.id} className="group bg-[#0a0a0a] rounded-2xl border border-white/[0.03] p-6 flex flex-col gap-3 transition-all hover:border-white/[0.06] animate-in slide-in-from-bottom-4 fade-in duration-500 shadow-sm">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Megaphone size={14} className="text-blue-400" />
                                  </div>
                                  <span className="text-xs font-bold text-neutral-200 tracking-wide uppercase">Desk Update</span>
                                  {post.ticker && post.ticker !== 'UNKNOWN' && (
                                    <span className="px-2 py-0.5 bg-white/[0.03] text-neutral-400 text-[10px] font-bold tracking-wider uppercase rounded border border-white/[0.05]">
                                      {post.ticker}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-neutral-500 font-medium">
                                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p 
                                className="text-sm text-neutral-400 font-medium whitespace-pre-wrap leading-relaxed pl-11"
                                dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }}
                              />
                            </div>
                          )
                        }

                        // --- FULL SETUP ---
                        return (
                          <div key={post.id} className="bg-[#0a0a0a] rounded-2xl border border-white/[0.03] overflow-hidden transition-all hover:border-white/[0.06] shadow-sm flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-500">
                            
                            {isLocked ? (
                              <div className="p-16 flex flex-col items-center justify-center text-center bg-gradient-to-b from-transparent to-amber-900/10">
                                <Lock className="w-8 h-8 text-amber-500/80 mb-4 stroke-1" />
                                <h4 className="text-base font-semibold text-white mb-2">Premium Setup</h4>
                                <p className="text-sm text-neutral-400 mb-6 max-w-sm">This analysis is locked for Essential members. Upgrade to view full chart and levels.</p>
                                <button className="px-6 py-2.5 bg-amber-500/10 text-amber-500 text-sm font-semibold rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-all">
                                  Upgrade Access
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <div className="flex flex-col lg:flex-row border-b border-white/[0.02]">
                                  
                                  {/* IMAGE */}
                                  <div 
                                    className="relative w-full lg:w-[480px] shrink-0 aspect-[16/10] bg-[#000000] cursor-pointer group border-r border-white/[0.02]" 
                                    onClick={() => setExpandedImage(post.image_url)}
                                  >
                                    <Image src={post.image_url} alt="Setup" fill className="object-contain p-2" unoptimized />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                                        <ZoomIn className="text-white w-5 h-5" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* ACTIONS PANEL */}
                                  <div className="flex-1 flex flex-col p-6 lg:p-8">
                                    
                                    <div className="flex justify-between items-start mb-8">
                                      <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 text-blue-400 text-[11px] font-bold tracking-wider uppercase rounded bg-blue-500/10 border border-blue-500/20">
                                          {post.ticker}
                                        </span>
                                        <span className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">
                                          {post.timeframe}
                                        </span>
                                      </div>
                                      <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                                        <Clock size={12} className="opacity-70" /> {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mb-8">
                                      <button 
                                        onClick={() => handleInteractionUpdate(post.id, { taken: !pInt.taken })}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                                          pInt.taken 
                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                                            : 'bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:text-white border-white/[0.05]'
                                        }`}
                                      >
                                        <Target size={14} className={`${pInt.taken ? 'opacity-100' : 'opacity-70'}`} /> {pInt.taken ? 'Trade Taken' : 'Take Trade'}
                                      </button>

                                      {pInt.taken && (
                                        <div className="flex items-center gap-2 pl-3 border-l border-white/[0.05] animate-in fade-in slide-in-from-left-4 duration-300">
                                          <button 
                                            onClick={() => handleInteractionUpdate(post.id, { rulesFollowed: pInt.rulesFollowed === true ? null : true })}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
                                              pInt.rulesFollowed === true 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                                : 'text-neutral-500 hover:bg-white/[0.02] hover:text-emerald-400 border-transparent hover:border-white/[0.05]'
                                            }`}
                                          >
                                            <ShieldCheck size={14} /> Kept Rules
                                          </button>
                                          <button 
                                            onClick={() => handleInteractionUpdate(post.id, { rulesFollowed: pInt.rulesFollowed === false ? null : false })}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
                                              pInt.rulesFollowed === false 
                                                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                                : 'text-neutral-500 hover:bg-white/[0.02] hover:text-red-400 border-transparent hover:border-white/[0.05]'
                                            }`}
                                          >
                                            <ShieldAlert size={14} /> Broke Rules
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 mb-auto">
                                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sentiment</span>
                                      <div className="flex items-center bg-[#050505] p-1 rounded-xl border border-white/[0.04]">
                                        <button 
                                          onClick={() => handleInteractionUpdate(post.id, { vote: pInt.vote === 'align' ? null : 'align' })}
                                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                                            pInt.vote === 'align' ? 'bg-emerald-500/10 text-emerald-400' : 'text-neutral-500 hover:text-emerald-400 hover:bg-white/[0.04]'
                                          }`}
                                          title="Align with setup"
                                        >
                                          <ArrowUpRight size={16} />
                                        </button>
                                        
                                        <div className="flex flex-col items-center px-4 min-w-[60px]">
                                          <span className={`text-sm font-bold transition-colors ${alignPercent >= 50 ? 'text-emerald-400' : 'text-amber-500'}`}>
                                            {alignPercent}%
                                          </span>
                                        </div>

                                        <button 
                                          onClick={() => handleInteractionUpdate(post.id, { vote: pInt.vote === 'counter' ? null : 'counter' })}
                                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                                            pInt.vote === 'counter' ? 'bg-amber-500/10 text-amber-500' : 'text-neutral-500 hover:text-amber-500 hover:bg-white/[0.04]'
                                          }`}
                                          title="Counter this setup"
                                        >
                                          <ArrowDownRight size={16} />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/[0.03]">
                                      {editingNoteId === post.id ? (
                                        <div className="animate-in fade-in duration-300">
                                          <textarea 
                                            ref={noteInputRef}
                                            value={tempNote}
                                            onChange={(e) => setTempNote(e.target.value)}
                                            onBlur={handleSaveNote}
                                            onKeyDown={handleNoteKeyDown}
                                            placeholder="Write your personal reflection here..."
                                            className="w-full bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none resize-none min-h-[60px] leading-relaxed"
                                          />
                                          <div className="flex justify-end mt-2">
                                            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Press Enter to save</span>
                                          </div>
                                        </div>
                                      ) : pInt.note ? (
                                        <div 
                                          onClick={() => handleOpenNoteEditor(post.id, pInt.note)}
                                          className="group/note cursor-text"
                                        >
                                          <p className="text-sm text-neutral-400 group-hover/note:text-neutral-300 transition-colors whitespace-pre-wrap leading-relaxed">
                                            {pInt.note}
                                          </p>
                                        </div>
                                      ) : (
                                        <span 
                                          onClick={() => handleOpenNoteEditor(post.id, '')}
                                          className="text-xs font-bold text-neutral-600 hover:text-neutral-400 cursor-pointer transition-colors select-none uppercase tracking-wide flex items-center gap-2"
                                        >
                                          <Edit3 size={14}/> Add personal note
                                        </span>
                                      )}
                                    </div>

                                  </div>
                                </div>

                                <div className="px-6 lg:px-8 py-6 bg-[#050505]">
                                  <p 
                                    className="text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <div ref={floorEndRef} className="h-1" />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REFLECTION DASHBOARD */}
              {activeFloorTab === 'reflection' && (
                <div key="tab-reflection" className="flex-1 overflow-y-auto pt-4 pb-8 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out px-1">
                  <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT HALF: STATS */}
                    <div className="w-full lg:w-[40%] flex flex-col gap-6 animate-in slide-in-from-left-8 fade-in duration-500">
                      <div className="flex bg-[#0a0a0a] rounded-lg border border-white/[0.03] p-1">
                        {['today', 'week', 'month', 'all'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setTimeFilter(t as any)}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${
                              timeFilter === t ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.03] p-8 shadow-sm flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-white mb-8 flex items-center gap-2">
                          <Brain className="text-emerald-400 w-4 h-4" /> Reflection Metrics
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                          <div className="flex items-center justify-between pb-4 border-b border-white/[0.02]">
                            <span className="text-sm font-medium text-neutral-400">Setups Executed</span>
                            <span className="text-xl font-bold text-white">{takenTrades.length}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pb-4 border-b border-white/[0.02]">
                            <span className="text-sm font-medium text-neutral-400">Rules Followed</span>
                            <span className="text-xl font-bold text-emerald-400">{rulesFollowedCount}</span>
                          </div>

                          <div className="flex items-center justify-between pb-4 border-b border-white/[0.02]">
                            <span className="text-sm font-medium text-neutral-400">Rules Broken</span>
                            <span className="text-xl font-bold text-red-400">{ruleBreaksCount}</span>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/[0.03]">
                          <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-3">
                            <span>Discipline Score</span>
                            <span className={rulesFollowedCount >= ruleBreaksCount ? 'text-emerald-400' : 'text-red-400'}>
                              {takenTrades.length > 0 ? Math.round((rulesFollowedCount / takenTrades.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${takenTrades.length > 0 ? (rulesFollowedCount / takenTrades.length) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT HALF: LOG */}
                    <div className="w-full lg:w-[60%] flex flex-col h-full min-h-[400px] animate-in slide-in-from-bottom-8 fade-in duration-500 delay-100">
                      <h3 className="text-sm font-semibold text-neutral-300 mb-4 px-1">Trade Log</h3>
                      
                      <div className="flex-1 bg-[#0a0a0a] rounded-2xl border border-white/[0.03] overflow-hidden flex flex-col shadow-sm">
                        <div className="overflow-y-auto p-4 custom-scrollbar flex-1">
                          {takenTrades.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 p-8">
                              <Target className="w-10 h-10 text-neutral-600 mb-3 stroke-1" />
                              <p className="text-sm font-medium text-neutral-400 text-center">
                                No trades logged yet.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {takenTrades.map(post => {
                                const pInt = interactions[post.id]
                                return (
                                  <div key={post.id} className="bg-[#050505] rounded-xl p-5 flex flex-col gap-3 group border border-white/[0.02] hover:border-white/[0.05] transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold tracking-wider uppercase text-neutral-200">
                                          {post.ticker}
                                        </span>
                                        <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                                          {post.timeframe}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {pInt.rulesFollowed === true && <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-1.5"><ShieldCheck size={14}/> Kept Rules</span>}
                                        {pInt.rulesFollowed === false && <span className="text-[10px] font-bold tracking-widest uppercase text-red-400 flex items-center gap-1.5"><ShieldAlert size={14}/> Broke Rules</span>}
                                        
                                        {post.image_url && (
                                          <button onClick={() => setExpandedImage(post.image_url)} className="p-1.5 text-neutral-500 hover:text-white bg-white/[0.02] hover:bg-white/[0.08] rounded-md transition-colors ml-2">
                                            <ImageIcon size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pl-3 border-l border-white/[0.05]">
                                      {pInt.vote && (
                                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${pInt.vote === 'align' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                          {pInt.vote === 'align' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {pInt.vote === 'align' ? 'Aligned' : 'Countered'} Setup
                                        </span>
                                      )}
                                      {pInt.note ? (
                                        <p className="text-sm text-neutral-400 italic mt-1 leading-relaxed">{pInt.note}</p>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANE: TELEGRAM BROADCAST MIRROR */}
            <div className={`hidden lg:block relative shrink-0 transition-[width,opacity] duration-500 ease-in-out ${isCommsOpen ? 'w-[340px] xl:w-[400px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
              
              <div className={`absolute top-0 right-0 w-[340px] xl:w-[400px] h-full bg-[#080808] rounded-2xl border border-white/[0.03] flex flex-col shadow-2xl transition-transform duration-500 ease-out origin-right ${isCommsOpen ? 'translate-x-0' : 'translate-x-[150%]'}`}>
                
                {/* TELEGRAM BRANDED HEADER */}
                <div className="px-5 py-5 border-b border-[#2AABEE]/10 bg-[#2AABEE]/[0.02] flex items-center justify-between shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2AABEE]/10 flex items-center justify-center border border-[#2AABEE]/20">
                      <Send className="text-[#2AABEE] w-4 h-4 -ml-0.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2AABEE]">Sentinel Broadcast</h3>
                      <p className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">Live Telegram Channel</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#2AABEE] animate-pulse shadow-[0_0_8px_#2AABEE]" />
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar w-full bg-[#050505] rounded-b-2xl">
                  {squawks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                      <Send className="w-8 h-8 text-neutral-600 mb-3 stroke-1" />
                      <p className="text-xs font-medium text-neutral-500">Awaiting Channel Broadcasts</p>
                    </div>
                  ) : (
                    squawks.map((squawk) => {
                      const isMe = squawk.author_username === username
                      
                      return (
                        <div key={squawk.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                          
                          <div className={`px-4 py-3.5 rounded-2xl max-w-[92%] text-[13px] font-medium leading-relaxed shadow-sm ${
                            isMe 
                              ? 'bg-gradient-to-br from-[#2AABEE] to-[#1E88E5] text-white rounded-tr-sm shadow-md' 
                              : 'bg-[#111] text-neutral-300 rounded-tl-sm border border-white/[0.03]'
                          }`}>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold tracking-wider ${isMe ? 'text-blue-100' : 'text-[#2AABEE]'}`}>
                                {isMe ? 'You' : squawk.author_username || 'Sentinel Admin'}
                              </span>
                              <span className={`text-[9px] font-medium ${isMe ? 'text-blue-100/70' : 'text-neutral-600'}`}>
                                {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {squawk.media_url && (
                              <div 
                                className="mb-3 relative rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => setExpandedImage(squawk.media_url)}
                              >
                                <Image src={squawk.media_url} width={300} height={200} alt="Attached media" className="object-cover w-full h-auto max-h-[250px] group-hover:opacity-90 transition-opacity" unoptimized />
                              </div>
                            )}
                            
                            {squawk.message && (
                              <span 
                                className="whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: formatTelegramText(squawk.message) }} 
                              />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={squawkEndRef} className="h-1" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
