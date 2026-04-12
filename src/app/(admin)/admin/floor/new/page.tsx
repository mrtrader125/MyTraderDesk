'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Shield, Loader2, Target, FolderSearch, X, PlusCircle, Edit2, Trash2, Save, Activity, Radio, Megaphone, ZoomIn, Clock, PanelRightClose, PanelRightOpen } from 'lucide-react'
import Image from 'next/image'

// Telegram Markdown Formatter (Matching Client)
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
  useEffect(() => setMounted(true), [])

  // --- UI STATE ---
  const [isCommsOpen, setIsCommsOpen] = useState(true)

  // --- REAL-TIME FEED STATE ---
  const [posts, setPosts] = useState<any[]>([])
  const [squawks, setSquawks] = useState<any[]>([])
  
  const floorEndRef = useRef<HTMLDivElement>(null)
  const squawkEndRef = useRef<HTMLDivElement>(null)

  // --- CHAT INPUT STATE (LEFT: DESK/SETUPS) ---
  const [thesis, setThesis] = useState('')
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [tier, setTier] = useState('pro') 
  const [overrideSentiment, setOverrideSentiment] = useState(false)
  const [adminAlignPct, setAdminAlignPct] = useState(75)
  const [isPostingFloor, setIsPostingFloor] = useState(false)

  // --- IMAGE STATE ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) 
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // --- CHAT INPUT STATE (RIGHT: TELEGRAM) ---
  const [commsMessage, setCommsMessage] = useState('')
  const [commsTag, setCommsTag] = useState('')
  const [isPostingComms, setIsPostingComms] = useState(false)

  // --- MODALS / MANAGEMENT ---
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [editingSquawk, setEditingSquawk] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [recentImages, setRecentImages] = useState<{url: string, ticker: string, timeframe: string}[]>([])
  const [modalPreview, setModalPreview] = useState<{url: string, ticker: string, timeframe: string} | null>(null)

  // 1. Initial Fetch & Real-time Subscription
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: initialPosts } = await supabase.from('terminal_posts').select('*').order('created_at', { ascending: false }).limit(20)
      if (initialPosts) setPosts(initialPosts.reverse())

      const { data: initialSquawks } = await supabase.from('live_squawk').select('*').order('created_at', { ascending: false }).limit(30)
      if (initialSquawks) setSquawks(initialSquawks.reverse())
    }

    fetchInitialData()

    const channel = supabase.channel('admin:desk_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => [...c, p.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => c.map(s => s.id === p.new.id ? p.new : s)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'live_squawk' }, (p) => setSquawks((c) => c.filter(s => s.id !== p.old.id)))
      
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => [...c, p.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => c.map(post => post.id === p.new.id ? p.new : post)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'terminal_posts' }, (p) => setPosts((c) => c.filter(post => post.id !== p.old.id)))
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Scroll to bottom on new messages
  useEffect(() => { squawkEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [squawks])
  useEffect(() => { floorEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [posts])

  // Master Analysis Fetch for Library
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
    if (!confirm('Delete this Global Comms message permanently?')) return
    await supabase.from('live_squawk').delete().eq('id', id)
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const handleUpdateSquawk = async (e: React.FormEvent) => {
    e.preventDefault()
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

  // Submit Main Floor Post
  const handleFloorSubmit = async () => {
    if (!thesis) return alert('Message body is required.')
    
    // If an image is attached, we treat it as a SETUP and require ticker.
    if (imagePreview && !ticker) return alert('Ticker is required when attaching a setup chart.')

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
        ticker: (ticker || 'UNKNOWN').toUpperCase(),
        timeframe: imagePreview ? timeframe : null,
        thesis,
        image_url: finalImageUrl,
        tier_access: imagePreview ? tier : 'free', // Text broadcasts are usually free
        admin_align_pct: (imagePreview && overrideSentiment) ? adminAlignPct : null
      }

      await supabase.from('terminal_posts').insert(payload)
      
      // Auto-broadcast to Telegram
      await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Telegram broadcast failed", err))

      // Clear Form
      setThesis(''); clearSetupState(); setOverrideSentiment(false); setAdminAlignPct(75);
    } catch (error: any) { alert(`Failed to post: ${error.message}`) } 
    finally { setIsPostingFloor(false) }
  }

  const handleCommsSubmit = async () => {
    if (!commsMessage) return
    setIsPostingComms(true)
    await supabase.from('live_squawk').insert({ message: commsMessage, tag: commsTag || null })
    setCommsMessage(''); setCommsTag('');
    setIsPostingComms(false)
  }

  return (
    <>
      {/* FULLSCREEN IMAGE MODAL */}
      {expandedImage && (
        <div className="fixed inset-0 z-[99999] bg-[#000000]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExpandedImage(null)}>
          <div className="relative w-full max-w-7xl aspect-[16/9] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl animate-in zoom-in-95">
            <Image src={expandedImage} alt="Expanded Chart" fill className="object-contain" unoptimized />
            <button className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black rounded-full text-neutral-400 hover:text-white transition-all ring-1 ring-white/10">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-[#030303] text-neutral-200 p-4 md:p-6 flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
        <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0 relative z-10">
          
          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.04] shrink-0">
            <h1 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight italic uppercase">
              <Shield className="text-emerald-500 w-5 h-5 not-italic" /> Admin Floor Control
            </h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCommsOpen(!isCommsOpen)}
                className="hidden lg:flex items-center justify-center text-neutral-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.06] w-9 h-9 rounded-lg border border-white/[0.04]"
                title={isCommsOpen ? "Collapse Telegram Feed" : "Expand Telegram Feed"}
              >
                {isCommsOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Live Sync Active
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-6 lg:gap-8 min-h-0 overflow-hidden h-full">
            
            {/* LEFT PANE: LIVE FLOOR FEED & CHAT INPUT */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <div className="flex items-center gap-2 pb-4 text-sm font-semibold text-white border-b-2 border-white mb-2 shrink-0 w-fit">
                <Activity size={16} className="text-blue-400" /> Live Floor (Setups & Updates)
              </div>

              {/* FEED AREA */}
              <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar px-1 flex flex-col gap-6 pt-4">
                {posts.map((post) => {
                  const isSetup = post.image_url && post.image_url.trim() !== ''
                  return (
                    <div key={post.id} className="relative group/post animate-in slide-in-from-bottom-2 fade-in duration-300">
                      
                      {/* ADMIN INLINE CONTROLS */}
                      <div className="absolute -top-3 -right-3 z-20 flex items-center gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity bg-[#111] p-1 rounded-lg border border-white/[0.1] shadow-xl">
                        <button onClick={() => setEditingPost({...post, overrideSentiment: post.admin_align_pct !== null, admin_align_pct: post.admin_align_pct || 75})} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={14} /></button>
                      </div>

                      {/* TEXT UPDATE STYLE */}
                      {!isSetup ? (
                        <div className="group bg-[#0a0a0a] rounded-2xl border border-white/[0.03] p-6 flex flex-col gap-3 shadow-sm hover:border-white/[0.1] transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Megaphone size={14} className="text-blue-400" /></div>
                              <span className="text-xs font-bold text-neutral-200 tracking-wide uppercase">Desk Update</span>
                              {post.ticker && post.ticker !== 'UNKNOWN' && (
                                <span className="px-2 py-0.5 bg-white/[0.03] text-neutral-400 text-[10px] font-bold tracking-wider uppercase rounded border border-white/[0.05]">{post.ticker}</span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-neutral-400 font-medium whitespace-pre-wrap leading-relaxed pl-11" dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }} />
                        </div>
                      ) : (
                        /* FULL SETUP STYLE */
                        <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.03] overflow-hidden flex flex-col shadow-sm hover:border-white/[0.1] transition-colors">
                          <div className="flex flex-col lg:flex-row border-b border-white/[0.02]">
                            <div className="relative w-full lg:w-[480px] shrink-0 aspect-[16/10] bg-[#000000] cursor-pointer group border-r border-white/[0.02]" onClick={() => setExpandedImage(post.image_url)}>
                              <Image src={post.image_url} alt="Setup" fill className="object-contain p-2" unoptimized />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"><ZoomIn className="text-white w-6 h-6" /></div>
                            </div>
                            <div className="flex-1 flex flex-col p-6 lg:p-8">
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                  <span className="px-2.5 py-1 text-blue-400 text-[11px] font-bold tracking-wider uppercase rounded bg-blue-500/10 border border-blue-500/20">{post.ticker}</span>
                                  <span className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">{post.timeframe}</span>
                                  <span className={`px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase rounded border ${post.tier_access === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>{post.tier_access}</span>
                                </div>
                                <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5"><Clock size={12} className="opacity-70" /> {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              {post.admin_align_pct !== null && (
                                <div className="mt-auto inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
                                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Admin Sentiment Forced: {post.admin_align_pct}% Align</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="px-6 lg:px-8 py-6 bg-[#050505]">
                            <p className="text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formatTelegramText(post.thesis) }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={floorEndRef} className="h-2" />
              </div>

              {/* CHAT INPUT BAR (LEFT) */}
              <div className="shrink-0 bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-3 flex flex-col shadow-2xl relative mt-2">
                
                {/* EXPANDED SETUP STATE */}
                {imagePreview && (
                  <div className="mb-3 p-4 bg-[#111] rounded-xl border border-white/[0.05] animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/[0.05]">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} className="text-blue-400"/> Chart Attached</h4>
                      <button onClick={clearSetupState} className="text-neutral-500 hover:text-white"><X size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-white/[0.1] bg-black">
                         <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                      </div>
                      
                      {/* Config Column 1 */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Ticker</label>
                          <input type="text" value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="BTCUSD" className="w-full bg-[#050505] border border-white/[0.05] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Timeframe</label>
                          <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500 appearance-none">
                            <option value="15M">15M</option><option value="1H">1H</option><option value="4H">4H</option><option value="1D">1D</option><option value="1W">1W</option>
                          </select>
                        </div>
                      </div>

                      {/* Config Column 2 */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Tier Access</label>
                          <select value={tier} onChange={e=>setTier(e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-blue-500 appearance-none">
                            <option value="pro">Pro Exclusive</option><option value="free">Free Preview</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1 flex justify-between items-center">
                            Sentiment Override
                            <input type="checkbox" checked={overrideSentiment} onChange={()=>setOverrideSentiment(!overrideSentiment)} className="accent-blue-500" />
                          </label>
                          {overrideSentiment && (
                             <input type="range" min="0" max="100" value={adminAlignPct} onChange={e=>setAdminAlignPct(Number(e.target.value))} className="w-full mt-2 h-1 bg-white/[0.1] rounded-full appearance-none accent-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MAIN CHAT BAR */}
                <div className="flex items-end gap-3">
                  <div className="flex bg-[#111] rounded-xl border border-white/[0.05] p-1 shrink-0">
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
                    placeholder={imagePreview ? "Detail your setup thesis..." : "Send a quick desk update (supports Telegram Markdown)..."}
                    className="flex-1 max-h-40 min-h-[48px] bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-blue-500 custom-scrollbar resize-none leading-relaxed"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFloorSubmit(); } }}
                  />

                  <button onClick={handleFloorSubmit} disabled={isPostingFloor || (!thesis.trim() && !imagePreview)} className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all shrink-0">
                    {isPostingFloor ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>


            {/* RIGHT PANE: TELEGRAM SQUAWK MIRROR */}
            <div className={`hidden lg:block relative shrink-0 transition-[width,opacity] duration-500 ease-in-out ${isCommsOpen ? 'w-[340px] xl:w-[400px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
              <div className={`absolute top-0 right-0 w-[340px] xl:w-[400px] h-full flex flex-col bg-[#080808] rounded-2xl border border-white/[0.03] shadow-2xl transition-transform duration-500 ease-out origin-right ${isCommsOpen ? 'translate-x-0' : 'translate-x-[150%]'}`}>
                
                {/* Telegram Header */}
                <div className="px-5 py-4 border-b border-[#2AABEE]/10 bg-[#2AABEE]/[0.02] flex items-center justify-between shrink-0 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2AABEE]/10 flex items-center justify-center"><Send className="text-[#2AABEE] w-4 h-4 -ml-0.5" /></div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2AABEE]">Sentinel Comms</h3>
                      <p className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">Live Telegram Mirror</p>
                    </div>
                  </div>
                </div>

                {/* Telegram Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#050505]">
                  {squawks.map((squawk) => (
                     <div key={squawk.id} className="flex flex-col items-end relative group/squawk animate-in fade-in slide-in-from-bottom-2">
                       {/* ADMIN INLINE CONTROLS */}
                       <div className="absolute top-1/2 -translate-y-1/2 -left-16 opacity-0 group-hover/squawk:opacity-100 transition-opacity flex gap-1 bg-[#111] p-1 rounded-lg border border-white/[0.1] shadow-lg">
                          <button onClick={() => setEditingSquawk(squawk)} className="p-1.5 text-amber-500 hover:bg-amber-500/20 rounded-md transition-colors"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteSquawk(squawk.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 size={12} /></button>
                       </div>

                       <div className="px-4 py-3 rounded-2xl max-w-[92%] text-[13px] font-medium leading-relaxed bg-gradient-to-br from-[#2AABEE] to-[#1E88E5] text-white rounded-tr-sm shadow-md">
                         <div className="flex items-center gap-2 mb-1.5">
                           {squawk.tag && <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{squawk.tag}</span>}
                           <span className="text-[10px] font-bold tracking-wider text-blue-100 ml-auto">You</span>
                           <span className="text-[9px] font-medium text-blue-100/70">{new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTelegramText(squawk.message) }} />
                       </div>
                     </div>
                  ))}
                  <div ref={squawkEndRef} className="h-2" />
                </div>

                {/* Chat Input Bar (Right) */}
                <div className="p-3 bg-[#0a0a0a] border-t border-white/[0.05] rounded-b-2xl shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                     <select value={commsTag} onChange={e=>setCommsTag(e.target.value)} className="bg-[#111] text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-white/[0.05] rounded-md px-2 py-1 outline-none">
                       <option value="">No Tag</option>
                       <option value="Execution">Live Execution</option>
                       <option value="Alert">Critical Alert</option>
                       <option value="News">Macro News</option>
                     </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea 
                      value={commsMessage} 
                      onChange={e => setCommsMessage(e.target.value)} 
                      placeholder="Broadcast to Telegram..."
                      className="flex-1 max-h-32 min-h-[44px] bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-[#2AABEE] custom-scrollbar resize-none"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommsSubmit(); } }}
                    />
                    <button onClick={handleCommsSubmit} disabled={isPostingComms || !commsMessage.trim()} className="p-3 bg-[#2AABEE]/10 text-[#2AABEE] rounded-xl hover:bg-[#2AABEE] hover:text-white disabled:opacity-50 transition-all shrink-0">
                      {isPostingComms ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODALS (EDIT & LIBRARY)                   */}
      {/* ========================================= */}
      
      {/* EDIT DESK POST MODAL */}
      {mounted && editingPost && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setEditingPost(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/[0.05] pb-4"><Edit2 size={16} className="text-blue-500"/> Edit Terminal Post</h3>
            <form onSubmit={handleUpdatePost} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Ticker</label><input type="text" value={editingPost.ticker} onChange={(e) => setEditingPost({...editingPost, ticker: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-mono text-white outline-none" required /></div>
                <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Timeframe</label><input type="text" value={editingPost.timeframe || ''} onChange={(e) => setEditingPost({...editingPost, timeframe: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-mono text-white outline-none" /></div>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1"><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Tier</label><select value={editingPost.tier_access} onChange={e=>setEditingPost({...editingPost, tier_access: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white outline-none"><option value="free">Free</option><option value="pro">Pro</option></select></div>
              </div>
              <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Thesis</label><textarea value={editingPost.thesis} onChange={(e) => setEditingPost({...editingPost, thesis: e.target.value})} className="w-full h-32 bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white outline-none custom-scrollbar resize-none" required /></div>
              <div className="flex gap-3 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-[#151515] rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2">{isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Data</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* EDIT TELEGRAM SQUAWK MODAL */}
      {mounted && editingSquawk && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setEditingSquawk(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-2xl p-8 animate-in zoom-in-95">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/[0.05] pb-4"><Edit2 size={16} className="text-amber-500"/> Edit Comms</h3>
            <form onSubmit={handleUpdateSquawk} className="space-y-5">
              <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Tag</label><input type="text" value={editingSquawk.tag || ''} onChange={(e) => setEditingSquawk({...editingSquawk, tag: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" /></div>
              <div><label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Message</label><textarea value={editingSquawk.message} onChange={(e) => setEditingSquawk({...editingSquawk, message: e.target.value})} className="w-full h-32 bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white outline-none custom-scrollbar resize-none" required /></div>
              <div className="flex gap-3 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={() => setEditingSquawk(null)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-[#151515] rounded-xl">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-black bg-amber-500 hover:bg-amber-400 rounded-xl flex items-center justify-center gap-2">{isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* MASTER PLAYBOOK LIBRARY MODAL */}
      {mounted && isLibraryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setIsLibraryOpen(false)}></div>
          <div className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-white/[0.05] bg-[#0c0c0c] flex justify-between items-center shrink-0">
               <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><FolderSearch className="text-blue-500 w-5 h-5"/> Master Playbook</h2>
               <button onClick={() => setIsLibraryOpen(false)} className="p-2 bg-[#111] hover:bg-[#151515] rounded-lg text-neutral-400"><X size={20}/></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
               <div className="w-full md:w-3/5 p-6 overflow-y-auto custom-scrollbar border-r border-white/[0.05] bg-[#050505]">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                     {recentImages.map((item, i) => (
                        <div key={i} onClick={() => setModalPreview(item)} className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border ${modalPreview?.url === item.url ? 'border-blue-500 scale-[0.98]' : 'border-white/[0.05] hover:border-white/[0.2]'}`}>
                           <Image src={item.url} alt="Library" fill className="object-cover" unoptimized />
                           <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded-md text-[9px] font-bold text-white uppercase">{item.ticker} | {item.timeframe}</div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-full md:w-2/5 p-8 bg-[#0c0c0c] flex flex-col">
                  {modalPreview ? (
                    <>
                     <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-white/[0.05] bg-[#050505] min-h-[200px] mb-6">
                        <Image src={modalPreview.url} alt="Preview" fill className="object-contain" unoptimized />
                     </div>
                     <button onClick={handleAttachFromLibrary} className="w-full py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 flex justify-center items-center gap-2"><PlusCircle size={18}/> Attach to Input</button>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl"><Target className="w-10 h-10 text-neutral-600 mb-4"/><p className="text-[10px] text-neutral-500 font-bold uppercase text-center px-6">Select analysis to preview</p></div>
                  )}
               </div>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  )
}
