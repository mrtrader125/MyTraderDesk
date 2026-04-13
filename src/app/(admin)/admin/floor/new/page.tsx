'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Activity, Clock, Target, X, ZoomIn, PanelRightClose, PanelRightOpen, Image as ImageIcon, Megaphone, Send, Edit2, Trash2, Shield, FolderSearch, Loader2, Save, PlusCircle, Power, PowerOff, Bell, BellOff } from 'lucide-react'

// Lightweight Telegram Markdown to Web HTML Parser
const formatTelegramText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#2AABEE] hover:text-blue-400 hover:underline underline-offset-2">$1</a>');
}

export default function AdminFloorControl() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const [mounted, setMounted] = useState(false)
  
  // --- UI STATES (WITH PERSISTENCE) ---
  const [isCommsOpen, setIsCommsOpen] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [notifyTelegram, setNotifyTelegram] = useState(false) 
  const [unreadCount, setUnreadCount] = useState(0)

  // Load sidebar state on mount
  useEffect(() => {
    setMounted(true)
    const storedState = localStorage.getItem('adminCommsOpen')
    if (storedState !== null) setIsCommsOpen(storedState === 'true')
  }, [])

  const isCommsOpenRef = useRef(isCommsOpen)
  useEffect(() => { isCommsOpenRef.current = isCommsOpen }, [isCommsOpen])

  const toggleComms = () => {
    setIsCommsOpen(prev => {
      const newState = !prev;
      localStorage.setItem('adminCommsOpen', String(newState));
      if (newState) setUnreadCount(0);
      return newState;
    });
  }

  // --- REAL-TIME DATA STATES ---
  const [posts, setPosts] = useState<any[]>([])
  const [squawks, setSquawks] = useState<any[]>([])

  const squawkEndRef = useRef<HTMLDivElement>(null)
  const floorEndRef = useRef<HTMLDivElement>(null)

  // --- ADMIN INPUT: LEFT (LIVE FLOOR) ---
  const [thesis, setThesis] = useState('')
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [tier, setTier] = useState('pro') 
  const [overrideSentiment, setOverrideSentiment] = useState(false)
  const [adminAlignPct, setAdminAlignPct] = useState(75)
  const [isPostingFloor, setIsPostingFloor] = useState(false)
  const [isTogglingSession, setIsTogglingSession] = useState(false)

  // --- ADMIN INPUT: IMAGE HANDLING ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) 

  // --- ADMIN INPUT: RIGHT (TELEGRAM) ---
  const [commsMessage, setCommsMessage] = useState('')
  const [commsTag, setCommsTag] = useState('')
  const [isPostingComms, setIsPostingComms] = useState(false)

  // --- MANAGEMENT / DRAFTS ---
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [editingSquawk, setEditingSquawk] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [recentImages, setRecentImages] = useState<{url: string, ticker: string, timeframe: string}[]>([])
  const [modalPreview, setModalPreview] = useState<{url: string, ticker: string, timeframe: string} | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: initialPosts } = await supabase.from('terminal_posts').select('*').order('created_at', { ascending: false }).limit(20)
      if (initialPosts) setPosts(initialPosts.reverse())

      const { data: initialSquawks } = await supabase.from('live_squawk').select('*').order('created_at', { ascending: false }).limit(30)
      if (initialSquawks) setSquawks(initialSquawks.reverse())
    }

    fetchInitialData()

    const channel = supabase.channel('admin:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (p) => {
        setSquawks((c) => [...c, p.new])
        if (!isCommsOpenRef.current) setUnreadCount((prev) => prev + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => c.map(s => s.id === p.new.id ? p.new : s)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => c.filter(s => s.id !== p.old.id)))
      
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => [...c, p.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => c.map(post => post.id === p.new.id ? p.new : post)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => c.filter(post => post.id !== p.old.id)))
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => { 
    if (isCommsOpen) squawkEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [squawks, isCommsOpen])
  
  useEffect(() => { floorEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [posts])

  useEffect(() => {
    const fetchMasterAnalysisImages = async () => {
      const { data, error } = await supabase.from('analyses').select('asset_symbol, timeframe, image_url').not('image_url', 'is', null).order('created_at', { ascending: false }).limit(40) 
      if (!error && data) {
        const unique = new Map()
        data.forEach(item => {
          let extractedUrl = item.image_url
          if (Array.isArray(item.image_url)) extractedUrl = item.image_url[0]
          else if (typeof item.image_url === 'string' && item.image_url.startsWith('[')) {
            try { extractedUrl = JSON.parse(item.image_url)[0] } catch (err) { extractedUrl = item.image_url }
          }
          if (extractedUrl && typeof extractedUrl === 'string' && !unique.has(extractedUrl)) {
            unique.set(extractedUrl, { ticker: item.asset_symbol || 'UNKNOWN', timeframe: item.timeframe || '1D' })
          }
        })
        setRecentImages(Array.from(unique, ([url, data]) => ({ url, ticker: data.ticker, timeframe: data.timeframe })))
      }
    }
    if (isLibraryOpen) fetchMasterAnalysisImages()
  }, [supabase, isLibraryOpen])

  // --- ACTIONS ---
  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this Live Floor post permanently?')) return
    await supabase.from('terminal_posts').delete().eq('id', id)
  }

  const handleDeleteSquawk = async (id: string) => {
    if (!confirm('Delete this Telegram message permanently?')) return
    await supabase.from('live_squawk').delete().eq('id', id)
  }

  const handleUpdatePost = async () => {
    if (!editingPost) return
    setIsUpdating(true)
    await supabase.from('terminal_posts').update({
      ticker: editingPost.ticker.toUpperCase(),
      timeframe: editingPost.timeframe,
      thesis: editingPost.thesis,
      tier_access: editingPost.tier_access,
      admin_align_pct: editingPost.overrideSentiment ? editingPost.admin_align_pct : null
    }).eq('id', editingPost.id)
    setIsUpdating(false)
    setEditingPost(null)
  }

  const handleUpdateSquawk = async () => {
    if (!editingSquawk) return
    setIsUpdating(true)
    await supabase.from('live_squawk').update({ message: editingSquawk.message, tag: editingSquawk.tag }).eq('id', editingSquawk.id)
    setIsUpdating(false)
    setEditingSquawk(null)
  }

  const handleAttachFromLibrary = () => {
    if (modalPreview) {
      setLibraryImageUrl(modalPreview.url); setImageFile(null); setImagePreview(modalPreview.url) 
      let cleanTicker = modalPreview.ticker.trim()
      const tfRegex = /\s+(15M|1H|4H|1D|1W|DAILY|WEEKLY|15m|1h|4h|1d|1w)$/i
      if (tfRegex.test(cleanTicker)) cleanTicker = cleanTicker.replace(tfRegex, '').trim()
      if (cleanTicker && cleanTicker !== 'UNKNOWN' && !ticker) setTicker(cleanTicker.toUpperCase())
      
      if (modalPreview.timeframe) {
        let safeTf = modalPreview.timeframe.toString().toUpperCase().trim()
        if (['D', 'DAILY'].includes(safeTf)) safeTf = '1D'
        if (['W', 'WEEKLY'].includes(safeTf)) safeTf = '1W'
        if (['H', '1 HOUR'].includes(safeTf)) safeTf = '1H'
        if (safeTf === '4 HOUR') safeTf = '4H'
        if (safeTf === '15') safeTf = '15M'
        setTimeframe(safeTf)
      }
      setIsLibraryOpen(false) 
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file); setLibraryImageUrl(null); setImagePreview(URL.createObjectURL(file))
    }
  }

  const clearSetupState = () => {
    setImageFile(null); setLibraryImageUrl(null); setImagePreview(null); setTicker('');
  }

  // --- SUBMISSIONS ---

  const handleFloorSubmit = async () => {
    if (!thesis.trim()) return alert('Message body is required.')
    if (imagePreview && !ticker.trim()) return alert('Ticker is required when attaching a setup chart.')

    setIsPostingFloor(true)
    try {
      let finalImageUrl = null
      if (imageFile) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${imageFile.name.split('.').pop()}`
        await supabase.storage.from('analysis-images').upload(fileName, imageFile)
        finalImageUrl = supabase.storage.from('analysis-images').getPublicUrl(fileName).data.publicUrl
      } else if (libraryImageUrl) {
        finalImageUrl = libraryImageUrl
      }

      const payload = {
        ticker: (ticker || 'UPDATE').toUpperCase(),
        timeframe: imagePreview ? timeframe : 'NOW',
        thesis,
        image_url: finalImageUrl,
        tier_access: imagePreview ? tier : 'free', 
        admin_align_pct: (imagePreview && overrideSentiment) ? adminAlignPct : null
      }

      // 1. Insert into floor
      await supabase.from('terminal_posts').insert(payload)
      
      // 2. Alert Telegram ONLY if toggle is on (Manual Setup Drop)
      if (notifyTelegram) {
        await fetch('/api/admin/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'manual' }) 
        })
      }

      setThesis(''); clearSetupState(); setOverrideSentiment(false); setAdminAlignPct(75);
    } catch (error: any) { alert(`Failed to post: ${error.message}`) } 
    finally { setIsPostingFloor(false) }
  }

  // 🚨 TELEGRAM OPEN/CLOSE ALERT BUTTONS
  const handleSessionToggle = async (action: 'open' | 'close') => {
    const messageText = action === 'open' 
      ? `🟢 **LIVE DESK ACTIVE**\n\nThe trading floor is now open for the session. Monitoring active setups and market flow.`
      : `🔴 **SESSION WRAP**\n\nThe trading desk is now closed. Risk management active on open positions.`;

    setIsTogglingSession(true)
    try {
      await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'custom', 
          message: messageText, 
          tag: 'Alert' 
        })
      })
    } catch(err) { console.error(err) }
    finally { setIsTogglingSession(false) }
  }

  // 🚨 TELEGRAM INPUT BOX SUBMISSION
  const handleCommsSubmit = async () => {
    if (!commsMessage.trim()) return
    setIsPostingComms(true)
    try {
      await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'custom', 
          message: commsMessage, 
          tag: commsTag || 'Broadcast' 
        })
      })
      setCommsMessage('')
      setCommsTag('')
    } catch(err) { console.error(err) }
    finally { setIsPostingComms(false) }
  }

  return (
    <>
      {/* FULLSCREEN IMAGE MODAL */}
      {expandedImage && (
        <div className="fixed inset-0 z-[99999] bg-[#000000]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setExpandedImage(null)}>
          <div className="relative w-full max-w-7xl aspect-[16/9] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <Image src={expandedImage} alt="Expanded Chart" fill className="object-contain" unoptimized />
            <button className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black rounded-full text-neutral-400 hover:text-white transition-all ring-1 ring-white/10 backdrop-blur-md">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 🚨 TIGHTENED LAYOUT SHELL (REMOVED OVERFLOW-HIDDEN TO PREVENT BADGE CLIPPING) */}
      <div className="w-full bg-[#030303] text-neutral-200 p-2 md:p-3 flex flex-col relative" style={{ height: 'calc(100dvh - 65px)' }}>
        <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
          
          <div className="flex-1 flex min-h-0 h-full gap-4 lg:gap-6">
            
            {/* ==================================================== */}
            {/* LEFT PANE: LIVE FLOOR FEED & CHAT INPUT              */}
            {/* ==================================================== */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative transition-all duration-500 ease-in-out bg-[#080808] border border-white/[0.04] rounded-2xl shadow-xl flex">
              
              {/* INTEGRATED HEADER (ROUNDED TOP ONLY) */}
              <div className="px-4 py-3 border-b border-white/[0.04] bg-[#0a0a0a] flex items-center justify-between shrink-0 z-10 rounded-t-2xl">
                
                {/* Left Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Activity size={16} className="text-blue-400" /> Floor Terminal
                  </div>
                  <div className="flex items-center gap-2 pl-4 border-l border-white/[0.1]">
                    <button onClick={() => handleSessionToggle('open')} disabled={isTogglingSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-colors disabled:opacity-50">
                      <Power size={12}/> Open Desk
                    </button>
                    <button onClick={() => handleSessionToggle('close')} disabled={isTogglingSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 transition-colors disabled:opacity-50">
                      <PowerOff size={12}/> Wrap Desk
                    </button>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
                  </div>
                  
                  <button 
                    onClick={toggleComms}
                    className="flex relative items-center justify-center text-neutral-400 hover:text-white transition-colors bg-[#111] hover:bg-[#1a1a1a] w-8 h-8 rounded-lg border border-white/[0.04] shadow-sm"
                    title={isCommsOpen ? "Collapse Telegram Feed" : "Expand Telegram Feed"}
                  >
                    {isCommsOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                    {/* Notification Badge now has space to breathe! */}
                    {!isCommsOpen && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#2AABEE] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border border-[#030303] animate-in zoom-in shadow-md z-20">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* FLOOR FEED (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#030303]">
                {posts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Target className="w-12 h-12 text-neutral-600 mb-4 stroke-1" />
                    <h3 className="text-sm font-medium tracking-wide text-neutral-400">Awaiting Transmissions</h3>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-[900px] mx-auto pb-2">
                    {posts.map((post) => {
                      const isSetup = post.image_url && post.image_url.trim() !== ''
                      const isEditing = editingPost?.id === post.id;

                      if (isEditing) {
                        return (
                          <div key={post.id} className="bg-[#0f0f0f] rounded-2xl border border-blue-500/50 p-6 shadow-[0_0_30px_rgba(37,99,235,0.1)] relative animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.05] text-blue-400 text-xs font-bold uppercase tracking-widest">
                              <Edit2 size={16}/> Editing Active Floor Post
                            </div>
                            
                            <div className="flex flex-wrap gap-4 mb-5">
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1.5 block">Ticker</label>
                                <input type="text" value={editingPost.ticker} onChange={(e) => setEditingPost({...editingPost, ticker: e.target.value.toUpperCase()})} className="w-full bg-[#050505] border border-white/[0.05] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500" required />
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1.5 block">Timeframe</label>
                                <select value={editingPost.timeframe || '1D'} onChange={(e) => setEditingPost({...editingPost, timeframe: e.target.value})} className="w-full bg-[#050505] border border-white/[0.05] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500 appearance-none">
                                  <option value="15M">15M</option><option value="1H">1H</option><option value="4H">4H</option><option value="1D">1D</option><option value="1W">1W</option>
                                  <option value="NOW">NOW</option>
                                </select>
                              </div>
                              <div className="flex-1 min-w-[120px]">
                                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1.5 block">Access Tier</label>
                                <select value={editingPost.tier_access} onChange={e=>setEditingPost({...editingPost, tier_access: e.target.value})} className="w-full bg-[#050505] border border-white/[0.05] rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-blue-500 appearance-none">
                                  <option value="free">Free Preview</option><option value="pro">Pro Exclusive</option>
                                </select>
                              </div>
                              <div className="bg-[#050505] p-2 rounded-xl border border-white/[0.05] flex-1 min-w-[160px]">
                                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest flex justify-between items-center w-full px-1">
                                  Force Sentiment <input type="checkbox" checked={editingPost.overrideSentiment} onChange={()=>setEditingPost({...editingPost, overrideSentiment: !editingPost.overrideSentiment})} className="accent-blue-500 w-3 h-3" />
                                </label>
                                {editingPost.overrideSentiment && (
                                   <input type="range" min="0" max="100" value={editingPost.admin_align_pct} onChange={e=>setEditingPost({...editingPost, admin_align_pct: Number(e.target.value)})} className="w-full mt-2 h-1 bg-white/[0.2] rounded-full appearance-none accent-blue-500" />
                                )}
                              </div>
                            </div>
                            
                            <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1.5 block">Thesis / Breakdown</label>
                            <textarea value={editingPost.thesis} onChange={(e) => setEditingPost({...editingPost, thesis: e.target.value})} className="w-full h-24 bg-[#050505] border border-white/[0.05] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500 custom-scrollbar resize-none leading-relaxed" required />
                            
                            <div className="flex justify-end gap-3 mt-4">
                              <button onClick={() => setEditingPost(null)} className="px-5 py-2 text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-[#1a1a1a] border border-white/[0.05] rounded-xl transition-all">Cancel</button>
                              <button onClick={handleUpdatePost} disabled={isUpdating} className="px-5 py-2 text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50">
                                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                              </button>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={post.id} className="relative group/post animate-in fade-in duration-300">
                          
                          {/* FLOATING ACTION BUTTONS */}
                          <div className="absolute -top-3 -right-3 z-20 flex items-center gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity bg-[#111] p-1.5 rounded-xl border border-white/[0.1] shadow-2xl">
                            <button onClick={() => setEditingPost({...post, overrideSentiment: post.admin_align_pct !== null, admin_align_pct: post.admin_align_pct || 75})} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"><Edit2 size={12} /></button>
                            <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={12} /></button>
                          </div>

                          {/* TEXT ONLY BROADCAST */}
                          {!isSetup ? (
                            <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.03] p-5 flex flex-col gap-3 shadow-sm group-hover/post:border-white/[0.08] transition-colors">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Megaphone size={12} className="text-blue-400" />
                                  </div>
                                  <span className="text-[11px] font-bold text-neutral-200 tracking-wide uppercase">Desk Update</span>
                                  {post.ticker && post.ticker !== 'UNKNOWN' && post.ticker !== 'SYSTEM' && post.ticker !== 'UPDATE' && (
                                    <span className="px-2 py-0.5 bg-white/[0.03] text-neutral-400 text-[9px] font-bold tracking-wider uppercase rounded border border-white/[0.05]">
                                      {post.ticker}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-500 font-medium">
                                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[13px] text-neutral-400 font-medium whitespace-pre-wrap leading-relaxed pl-10" dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }} />
                            </div>
                          ) : (
                            /* FULL SETUP POST */
                            <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.03] overflow-hidden shadow-sm flex flex-col group-hover/post:border-white/[0.08] transition-colors">
                              <div className="flex flex-col lg:flex-row border-b border-white/[0.02]">
                                
                                <div className="relative w-full lg:w-[400px] shrink-0 aspect-[16/10] bg-[#000000] cursor-pointer group/img border-r border-white/[0.02]" onClick={() => setExpandedImage(post.image_url)}>
                                  <Image src={post.image_url} alt="Setup" fill className="object-contain p-1.5" unoptimized />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                                      <ZoomIn className="text-white w-4 h-4" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 flex flex-col p-5 lg:p-6">
                                  <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2.5">
                                      <span className="px-2 py-1 text-blue-400 text-[10px] font-bold tracking-wider uppercase rounded bg-blue-500/10 border border-blue-500/20">{post.ticker}</span>
                                      <span className="text-neutral-400 text-[10px] font-semibold tracking-wider uppercase">{post.timeframe}</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-500 font-medium flex items-center gap-1.5"><Clock size={10} className="opacity-70" /> {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>

                                  <div className="flex flex-col gap-3 mt-auto">
                                    <div className="flex items-center gap-3 bg-[#050505] px-3 py-2 rounded-xl border border-white/[0.02]">
                                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest w-20">Access</span>
                                      <span className={`px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded border ${post.tier_access === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                        {post.tier_access === 'pro' ? 'Pro Exclusive' : 'Free Preview'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-[#050505] px-3 py-2 rounded-xl border border-white/[0.02]">
                                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest w-20">Sentiment</span>
                                      {post.admin_align_pct !== null ? (
                                        <span className="px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded border bg-amber-500/10 text-amber-500 border-amber-500/20">
                                          Forced: {post.admin_align_pct}% Align
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded border bg-neutral-500/10 text-neutral-400 border-neutral-500/20">Organic Active</span>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              </div>

                              <div className="px-5 lg:px-6 py-5 bg-[#050505]">
                                <p className="text-[13px] text-neutral-400 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }} />
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

              {/* ADMIN CHAT INPUT BAR (COMPACT & ANCHORED) */}
              <div className="shrink-0 bg-[#0a0a0a] border-t border-white/[0.04] p-3 flex flex-col relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-b-2xl">
                
                {/* COMPACT SETUP THUMBNAIL BAR */}
                {imagePreview && (
                  <div className="mb-3 p-3 bg-[#111] rounded-xl border border-blue-500/20 animate-in slide-in-from-bottom-2 duration-300 shadow-inner flex flex-wrap gap-4 items-center relative pr-8">
                    <button onClick={clearSetupState} className="absolute top-2 right-2 text-neutral-500 hover:text-white bg-black/50 p-1 rounded-full"><X size={12}/></button>
                    
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/[0.1] bg-black shrink-0">
                       <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                    
                    <div className="flex flex-1 gap-3 items-center overflow-x-auto custom-scrollbar pb-1">
                      <div className="w-24 shrink-0">
                        <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Ticker</label>
                        <input type="text" value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="BTCUSD" className="w-full bg-[#050505] border border-white/[0.05] rounded-md px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-blue-500" />
                      </div>
                      <div className="w-24 shrink-0">
                        <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Timeframe</label>
                        <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] rounded-md px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-blue-500 appearance-none">
                          <option value="15M">15M</option><option value="1H">1H</option><option value="4H">4H</option><option value="1D">1D</option><option value="1W">1W</option>
                        </select>
                      </div>
                      <div className="w-28 shrink-0">
                        <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Access</label>
                        <select value={tier} onChange={e=>setTier(e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-blue-500 appearance-none">
                          <option value="pro">Pro Exclusive</option><option value="free">Free Preview</option>
                        </select>
                      </div>
                      <div className="bg-[#050505] px-3 py-1.5 rounded-md border border-white/[0.05] flex-1 min-w-[140px] max-w-[200px] shrink-0">
                        <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest flex justify-between items-center w-full mb-1 cursor-pointer">
                          Force Sentiment <input type="checkbox" checked={overrideSentiment} onChange={()=>setOverrideSentiment(!overrideSentiment)} className="accent-blue-500 w-3 h-3" />
                        </label>
                        {overrideSentiment && (
                           <input type="range" min="0" max="100" value={adminAlignPct} onChange={e=>setAdminAlignPct(Number(e.target.value))} className="w-full h-1 bg-white/[0.1] rounded-full appearance-none accent-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* MAIN CHAT INPUT */}
                <div className="flex items-end gap-2.5 max-w-[1000px] w-full mx-auto relative">
                  <div className="flex bg-[#111] rounded-xl border border-white/[0.05] p-1 shrink-0 shadow-inner">
                    <label className="p-2.5 text-neutral-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg cursor-pointer transition-colors" title="Upload Image">
                       <ImageIcon size={18} />
                       <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <button onClick={() => setIsLibraryOpen(true)} className="p-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors" title="Open Master Playbook">
                      <FolderSearch size={18} />
                    </button>
                  </div>
                  
                  <textarea 
                    value={thesis} 
                    onChange={e => setThesis(e.target.value)} 
                    placeholder={imagePreview ? "Detail setup thesis..." : "Send desk update (Silent by default)..."}
                    className="flex-1 max-h-32 min-h-[44px] bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-neutral-600 outline-none focus:border-blue-500 custom-scrollbar resize-none leading-relaxed shadow-inner pr-24"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFloorSubmit(); } }}
                  />

                  {/* 🚨 NOTIFICATION TOGGLE */}
                  <div className="absolute right-[56px] bottom-2.5">
                    <button 
                      type="button"
                      onClick={() => setNotifyTelegram(!notifyTelegram)}
                      className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${notifyTelegram ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-neutral-500 hover:text-white'}`}
                      title={notifyTelegram ? "Will alert Telegram channel" : "Silent drop (Floor only)"}
                    >
                      {notifyTelegram ? <Bell size={14}/> : <BellOff size={14}/>}
                    </button>
                  </div>

                  <button onClick={handleFloorSubmit} disabled={isPostingFloor || (!thesis.trim() && !imagePreview)} className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    {isPostingFloor ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT PANE: TELEGRAM BROADCAST MIRROR                */}
            {/* ==================================================== */}
            
            {/* RIGID SIDEBAR SLIDE TRANSITION */}
            <div className={`hidden lg:block h-full shrink-0 transition-[width,margin,opacity] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isCommsOpen ? 'w-[320px] xl:w-[360px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
            }`}>
              
              <div className="w-[320px] xl:w-[360px] h-full bg-[#080808] rounded-2xl border border-white/[0.04] shadow-2xl flex flex-col relative overflow-hidden">
                
                {/* HEADER */}
                <div className="px-4 py-4 border-b border-[#2AABEE]/20 bg-[#2AABEE]/[0.03] flex items-center justify-between shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#2AABEE]/10 flex items-center justify-center border border-[#2AABEE]/30">
                      <Send className="text-[#2AABEE] w-3.5 h-3.5 -ml-0.5" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-[#2AABEE]">Sentinel Comms</h3>
                      <p className="text-[9px] text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">Live Telegram Mirror</p>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2AABEE] animate-pulse shadow-[0_0_8px_#2AABEE]" />
                </div>

                {/* SQUAWK FEED (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-[#050505]">
                  {squawks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                      <Send className="w-6 h-6 text-neutral-600 mb-2 stroke-1" />
                      <p className="text-[11px] font-medium text-neutral-500">Awaiting Channel Broadcasts</p>
                    </div>
                  ) : (
                    squawks.map((squawk) => {
                      const isEditing = editingSquawk?.id === squawk.id;

                      // --- INLINE EDIT MODE FOR SQUAWKS ---
                      if (isEditing) {
                        return (
                          <div key={squawk.id} className="w-full bg-[#0f0f0f] rounded-2xl border border-amber-500/50 p-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.05] text-amber-500 text-[9px] font-bold uppercase tracking-widest">
                              <Edit2 size={12}/> Editing Broadcast
                            </div>
                            <textarea value={editingSquawk.message} onChange={(e) => setEditingSquawk({...editingSquawk, message: e.target.value})} className="w-full h-20 bg-[#050505] border border-white/[0.05] rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-amber-500 custom-scrollbar resize-none leading-relaxed" required />
                            <div className="flex justify-end gap-2 mt-3">
                              <button onClick={() => setEditingSquawk(null)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-[#1a1a1a] rounded-lg border border-white/[0.05]">Cancel</button>
                              <button onClick={handleUpdateSquawk} disabled={isUpdating} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-black bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center justify-center gap-1.5">
                                {isUpdating ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                              </button>
                            </div>
                          </div>
                        )
                      }

                      // --- NORMAL DISPLAY MODE FOR SQUAWKS ---
                      return (
                        <div key={squawk.id} className="flex flex-col items-end relative group/squawk animate-in fade-in duration-300">
                          <div className="absolute top-1/2 -translate-y-1/2 -left-12 opacity-0 group-hover/squawk:opacity-100 transition-opacity flex gap-1 bg-[#111] p-1 rounded-xl border border-white/[0.1] shadow-xl">
                            <button onClick={() => setEditingSquawk(squawk)} className="p-1.5 text-amber-500 hover:bg-amber-500/20 rounded-md transition-colors"><Edit2 size={10} /></button>
                            <button onClick={() => handleDeleteSquawk(squawk.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={10} /></button>
                          </div>

                          <div className="px-3 py-2.5 rounded-2xl w-full max-w-[94%] text-[12px] font-medium leading-relaxed shadow-sm bg-gradient-to-br from-[#2AABEE] to-[#1E88E5] text-white rounded-tr-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[9px] font-bold tracking-wider text-blue-100">Sentinel Admin</span>
                              <span className="text-[8px] font-medium text-blue-100/70 ml-auto">{new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            {squawk.media_url && (
                              <div className="mb-2 relative rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-white/10" onClick={() => setExpandedImage(squawk.media_url)}>
                                <Image src={squawk.media_url} width={300} height={200} alt="Media" className="object-cover w-full h-auto max-h-[200px] group-hover:opacity-90 transition-opacity" unoptimized />
                              </div>
                            )}
                            
                            {squawk.message && (
                              <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTelegramText(squawk.message) }} />
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={squawkEndRef} className="h-1" />
                </div>

                {/* SQUAWK INPUT BAR */}
                <div className="p-3 bg-[#0a0a0a] border-t border-white/[0.04] shrink-0 rounded-b-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
                  <div className="flex items-end gap-2">
                    <textarea 
                      value={commsMessage} 
                      onChange={e => setCommsMessage(e.target.value)} 
                      placeholder="Broadcast to TG..."
                      className="flex-1 max-h-24 min-h-[40px] bg-[#111] border border-white/[0.05] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-neutral-600 outline-none focus:border-[#2AABEE] custom-scrollbar resize-none shadow-inner"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommsSubmit(); } }}
                    />
                    <button onClick={handleCommsSubmit} disabled={isPostingComms || !commsMessage.trim()} className="p-2.5 bg-[#2AABEE]/10 text-[#2AABEE] rounded-xl hover:bg-[#2AABEE] hover:text-white disabled:opacity-50 transition-all shrink-0 shadow-[0_0_15px_rgba(42,171,238,0.2)]">
                      {isPostingComms ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* FULLSCREEN MASTER PLAYBOOK LIBRARY MODAL  */}
      {/* ========================================= */}
      {mounted && isLibraryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-sm" onClick={() => setIsLibraryOpen(false)}></div>
          <div className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-white/[0.05] bg-[#0c0c0c] flex justify-between items-center shrink-0">
               <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><FolderSearch className="text-blue-500 w-5 h-5"/> Master Playbook</h2>
               <button onClick={() => setIsLibraryOpen(false)} className="p-2 bg-[#111] hover:bg-[#1a1a1a] border border-white/[0.05] rounded-xl text-neutral-400 transition-colors"><X size={20}/></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
               <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar border-r border-white/[0.05] bg-[#050505]">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                     {recentImages.map((item, i) => (
                        <div key={i} onClick={() => setModalPreview(item)} className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border transition-all ${modalPreview?.url === item.url ? 'border-blue-500 scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-white/[0.05] hover:border-white/[0.2] hover:scale-105 shadow-sm'}`}>
                           <Image src={item.url} alt="Library" fill className="object-cover" unoptimized />
                           <div className="absolute top-2.5 left-2.5 bg-black/80 px-2.5 py-1 rounded-md text-[9px] font-black text-white uppercase tracking-widest border border-white/[0.1] shadow-lg">{item.ticker} | {item.timeframe}</div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-full md:w-2/5 p-8 bg-[#0c0c0c] flex flex-col">
                  {modalPreview ? (
                    <>
                     <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-white/[0.05] bg-[#050505] min-h-[200px] mb-6 shadow-inner">
                        <Image src={modalPreview.url} alt="Preview" fill className="object-contain" unoptimized />
                     </div>
                     <button onClick={handleAttachFromLibrary} className="w-full py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"><PlusCircle size={18}/> Attach to Input</button>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl bg-[#111]"><Target className="w-10 h-10 text-neutral-600 mb-4 stroke-1"/><p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center px-6 leading-relaxed">Select analysis to preview<br/><br/>Attaching it will automatically fill your ticker and timeframe.</p></div>
                  )}
               </div>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  )
}
