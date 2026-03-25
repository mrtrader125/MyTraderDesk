'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Activity, Zap, Shield, Loader2, Target, FolderSearch, X, PlusCircle, Edit2, Trash2, Save, LayoutDashboard, Settings2 } from 'lucide-react'
import Image from 'next/image'

export default function AdminFloorControl() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState<'deploy' | 'manage'>('deploy')

  // --- FORM STATE ---
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [thesis, setThesis] = useState('')
  const [tier, setTier] = useState('essential')
  const [isPostingTerminal, setIsPostingTerminal] = useState(false)

  // --- IMAGE & MODAL STATE ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) 

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [recentImages, setRecentImages] = useState<{url: string, ticker: string, timeframe: string}[]>([])
  const [modalPreview, setModalPreview] = useState<{url: string, ticker: string, timeframe: string} | null>(null)

  // --- SQUAWK STATE ---
  const [squawkMessage, setSquawkMessage] = useState('')
  const [squawkTag, setSquawkTag] = useState('')
  const [isPostingSquawk, setIsPostingSquawk] = useState(false)

  // --- MANAGEMENT STATE ---
  const [activePosts, setActivePosts] = useState<any[]>([])
  const [activeSquawks, setActiveSquawks] = useState<any[]>([])
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [editingSquawk, setEditingSquawk] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch Master Analysis for Deploy Mode
  useEffect(() => {
    const fetchMasterAnalysisImages = async () => {
      const { data, error } = await supabase
        .from('analyses') 
        .select('asset_symbol, timeframe, image_url')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(40) 

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

  // Fetch Active Items for Manage Mode
  useEffect(() => {
    if (activeTab === 'manage') fetchActiveFloorData()
  }, [activeTab])

  const fetchActiveFloorData = async () => {
    const { data: posts } = await supabase.from('terminal_posts').select('*').order('created_at', { ascending: false }).limit(20)
    if (posts) setActivePosts(posts)

    const { data: squawks } = await supabase.from('live_squawk').select('*').order('created_at', { ascending: false }).limit(30)
    if (squawks) setActiveSquawks(squawks)
  }

  // --- EDIT & DELETE HANDLERS ---
  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this Terminal Setup permanently?')) return
    await supabase.from('terminal_posts').delete().eq('id', id)
    setActivePosts(prev => prev.filter(p => p.id !== id))
  }

  const handleDeleteSquawk = async (id: string) => {
    if (!confirm('Delete this Squawk permanently?')) return
    await supabase.from('live_squawk').delete().eq('id', id)
    setActiveSquawks(prev => prev.filter(s => s.id !== id))
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const { error } = await supabase.from('terminal_posts').update({
      ticker: editingPost.ticker.toUpperCase(),
      timeframe: editingPost.timeframe,
      thesis: editingPost.thesis,
      tier_access: editingPost.tier_access
    }).eq('id', editingPost.id)
    
    setIsUpdating(false)
    if (!error) {
      setEditingPost(null)
      fetchActiveFloorData()
    } else alert(`Update failed: ${error.message}`)
  }

  const handleUpdateSquawk = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const { error } = await supabase.from('live_squawk').update({
      message: editingSquawk.message,
      tag: editingSquawk.tag
    }).eq('id', editingSquawk.id)
    
    setIsUpdating(false)
    if (!error) {
      setEditingSquawk(null)
      fetchActiveFloorData()
    } else alert(`Update failed: ${error.message}`)
  }

  // --- DEPLOY HANDLERS ---
  const handleAttachFromLibrary = () => {
    if (modalPreview) {
      setLibraryImageUrl(modalPreview.url)
      setImageFile(null) 
      setImagePreview(modalPreview.url) 
      
      let cleanTicker = modalPreview.ticker.trim()
      const tfRegex = /\s+(15M|1H|4H|1D|1W|DAILY|WEEKLY|15m|1h|4h|1d|1w)$/i
      if (tfRegex.test(cleanTicker)) cleanTicker = cleanTicker.replace(tfRegex, '').trim()
      if (cleanTicker && cleanTicker !== 'UNKNOWN' && !ticker) setTicker(cleanTicker.toUpperCase())
      
      if (modalPreview.timeframe) {
        let safeTf = modalPreview.timeframe.toString().toUpperCase().trim()
        if (safeTf === 'D' || safeTf === 'DAILY') safeTf = '1D'
        if (safeTf === 'W' || safeTf === 'WEEKLY') safeTf = '1W'
        if (safeTf === 'H' || safeTf === '1 HOUR') safeTf = '1H'
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
      setImageFile(file)
      setLibraryImageUrl(null) 
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker || !thesis) return alert('Ticker and Thesis are required.')
    setIsPostingTerminal(true)

    try {
      let finalImageUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: publicUrlData } = supabase.storage.from('analysis-images').getPublicUrl(fileName)
        finalImageUrl = publicUrlData.publicUrl
      } else if (libraryImageUrl) {
        finalImageUrl = libraryImageUrl
      }

      const { error } = await supabase.from('terminal_posts').insert({
        ticker: ticker.toUpperCase(), timeframe, thesis, image_url: finalImageUrl, tier_access: tier
      })
      if (error) throw error

      setTicker(''); setThesis(''); setImageFile(null); setLibraryImageUrl(null); setImagePreview(null); setModalPreview(null);
      alert('Terminal Post pushed successfully.')
    } catch (error: any) { alert(`Failed to post: ${error.message}`) } 
    finally { setIsPostingTerminal(false) }
  }

  const handleSquawkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!squawkMessage) return
    setIsPostingSquawk(true)
    try {
      const { error } = await supabase.from('live_squawk').insert({ message: squawkMessage, tag: squawkTag || null })
      if (error) throw error
      setSquawkMessage(''); setSquawkTag('');
    } catch (error: any) { alert(`Failed: ${error.message}`) } 
    finally { setIsPostingSquawk(false) }
  }

  return (
    <div className="w-full bg-[#050505] text-neutral-200 p-4 md:p-5 flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* HEADER WITH TABS */}
        <div className="mb-5 pb-4 border-b border-neutral-900 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight uppercase">
            <Shield className="text-blue-500 w-5 h-5" /> Sentinel Command
          </h1>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-[#111] rounded-lg border border-neutral-800 p-1">
              <button 
                onClick={() => setActiveTab('deploy')} 
                className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'deploy' ? 'bg-blue-600 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
              >
                <Zap size={12} /> Deploy
              </button>
              <button 
                onClick={() => setActiveTab('manage')} 
                className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'manage' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
              >
                <Settings2 size={12} /> Manage
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        {/* --- DEPLOY MODE --- */}
        {activeTab === 'deploy' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0 overflow-hidden h-full animate-in fade-in duration-300">
            {/* LEFT: TERMINAL BUILDER */}
            <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 shadow-2xl flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-6">
                <Target className="text-emerald-500 w-4 h-4" />
                <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Deploy Terminal Setup</h2>
              </div>

              <form onSubmit={handleTerminalSubmit} className="space-y-5 flex-1 flex flex-col">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Ticker</label>
                    <input 
                      type="text" 
                      placeholder="$XAUUSD" 
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all uppercase placeholder:normal-case"
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Timeframe</label>
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="15M">15M</option>
                      <option value="1H">1H</option>
                      <option value="4H">4H</option>
                      <option value="1D">1D</option>
                      <option value="1W">1W</option>
                      {!['15M', '1H', '4H', '1D', '1W'].includes(timeframe) && <option value={timeframe}>{timeframe}</option>}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Access Tier</label>
                    <div className="flex bg-[#111] rounded-lg border border-neutral-800 p-1">
                      <button type="button" onClick={() => setTier('essential')} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${tier === 'essential' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-white'}`}>Essential</button>
                      <button type="button" onClick={() => setTier('pro')} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${tier === 'pro' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Pro Only</button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Chart Image</label>
                    <button type="button" onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-[#111] hover:bg-blue-500/10 hover:text-blue-400 text-neutral-400 border border-neutral-800 hover:border-blue-500/30 px-3 py-1.5 rounded transition-all">
                      <FolderSearch size={12} /> Master Analysis
                    </button>
                  </div>

                  <div className="border border-dashed border-neutral-700 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors relative bg-[#111]">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {imagePreview ? (
                      <div className="relative w-full h-[180px] rounded-md overflow-hidden border border-neutral-800 bg-black">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-xs tracking-widest uppercase">Click to Replace Upload</span>
                          {libraryImageUrl && <span className="text-blue-400 text-[9px] mt-2 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">Linked from Playbook</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <ImageIcon className="text-neutral-600 w-8 h-8 mb-3" />
                        <p className="text-neutral-400 font-bold text-sm tracking-wide mb-1">Upload New Screenshot</p>
                        <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">or browse master analysis above</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Execution Thesis</label>
                  <textarea value={thesis} onChange={(e) => setThesis(e.target.value)} className="w-full flex-1 min-h-[120px] bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all custom-scrollbar resize-none" required />
                </div>

                <button type="submit" disabled={isPostingTerminal} className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed mt-auto">
                  {isPostingTerminal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  {isPostingTerminal ? 'Deploying...' : 'Push to Terminal'}
                </button>
              </form>
            </div>

            {/* RIGHT: LIVE SQUAWK */}
            <div className="lg:col-span-1 bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 shadow-2xl flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="text-amber-500 w-4 h-4" />
                <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Live Squawk</h2>
              </div>
              <form onSubmit={handleSquawkSubmit} className="space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Category Tag</label>
                  <select value={squawkTag} onChange={(e) => setSquawkTag(e.target.value)} className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all appearance-none">
                    <option value="">Standard Broadcast</option>
                    <option value="Update">Trade Update</option>
                    <option value="Alert">Critical Alert</option>
                    <option value="Execution">Live Execution</option>
                    <option value="News">Macro News</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Message</label>
                  <textarea value={squawkMessage} onChange={(e) => setSquawkMessage(e.target.value)} className="w-full flex-1 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all custom-scrollbar resize-none" required />
                </div>
                <button type="submit" disabled={isPostingSquawk} className="w-full py-3 bg-[#111] text-amber-500 border border-amber-500/30 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-black active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPostingSquawk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isPostingSquawk ? 'Transmitting...' : 'Transmit Alert'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MANAGE MODE --- */}
        {activeTab === 'manage' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0 overflow-hidden h-full animate-in fade-in duration-300">
            
            {/* MANAGE TERMINAL POSTS */}
            <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 flex flex-col h-full shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <Target className="text-blue-500 w-4 h-4" />
                <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Active Terminal Setups</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {activePosts.map(post => (
                  <div key={post.id} className="bg-[#111] border border-neutral-800 rounded-lg p-4 flex items-start justify-between group hover:border-neutral-600 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest">{post.ticker}</span>
                        <span className="text-neutral-500 text-[10px] font-bold">{post.timeframe}</span>
                        <span className="text-neutral-600 text-[9px] uppercase tracking-widest ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{post.thesis}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingPost(post)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MANAGE SQUAWKS */}
            <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 flex flex-col h-full shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6 shrink-0">
                <Zap className="text-amber-500 w-4 h-4" />
                <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Active Squawks</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {activeSquawks.map(squawk => (
                  <div key={squawk.id} className="bg-[#111] border border-neutral-800 rounded-lg p-4 flex items-start justify-between group hover:border-neutral-600 transition-colors">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        {squawk.tag && <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 text-[8px] font-black uppercase tracking-widest rounded">{squawk.tag}</span>}
                        <span className="text-neutral-600 text-[9px] uppercase tracking-widest">{new Date(squawk.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-neutral-300 line-clamp-2">{squawk.message}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingSquawk(squawk)} className="p-1.5 bg-amber-500/10 text-amber-500 rounded hover:bg-amber-500 hover:text-black transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteSquawk(squawk.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* EDIT POST MODAL                             */}
      {/* ========================================= */}
      {editingPost && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingPost(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2"><Edit2 size={16} className="text-blue-500"/> Edit Terminal Setup</h3>
            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Ticker</label>
                  <input type="text" value={editingPost.ticker} onChange={(e) => setEditingPost({...editingPost, ticker: e.target.value})} className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Timeframe</label>
                  <input type="text" value={editingPost.timeframe} onChange={(e) => setEditingPost({...editingPost, timeframe: e.target.value})} className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Thesis</label>
                <textarea value={editingPost.thesis} onChange={(e) => setEditingPost({...editingPost, thesis: e.target.value})} className="w-full h-32 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none custom-scrollbar resize-none" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-neutral-800 rounded-lg transition-all">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-black bg-blue-500 hover:bg-blue-400 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* EDIT SQUAWK MODAL                           */}
      {/* ========================================= */}
      {editingSquawk && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingSquawk(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2"><Edit2 size={16} className="text-amber-500"/> Edit Squawk</h3>
            <form onSubmit={handleUpdateSquawk} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Tag</label>
                <input type="text" value={editingSquawk.tag || ''} onChange={(e) => setEditingSquawk({...editingSquawk, tag: e.target.value})} className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none" placeholder="Leave blank for none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea value={editingSquawk.message} onChange={(e) => setEditingSquawk({...editingSquawk, message: e.target.value})} className="w-full h-32 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none custom-scrollbar resize-none" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingSquawk(null)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-neutral-400 bg-[#111] hover:bg-neutral-800 rounded-lg transition-all">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* LIBRARY MODAL (Unchanged)                   */}
      {/* ========================================= */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLibraryOpen(false)}></div>
          <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0a0a0a] rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FolderSearch className="text-blue-500 w-5 h-5" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Master Analysis Library</h2>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              <div className="w-full md:w-1/2 lg:w-3/5 p-6 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-neutral-900 bg-[#050505]">
                {recentImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <ImageIcon className="w-10 h-10 text-neutral-700 mb-3" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">No previous analysis found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentImages.map((item, i) => (
                      <div key={i} onClick={() => setModalPreview(item)} className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${modalPreview?.url === item.url ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[0.98]' : 'border-neutral-800 hover:border-neutral-600 hover:scale-105'}`}>
                        <Image src={item.url} alt="Library Item" fill className="object-cover" unoptimized />
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-1.5 shadow-lg">
                          <span>{item.ticker}</span><span className="text-neutral-500">|</span><span className="text-blue-400">{item.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-2/5 p-6 bg-[#0a0a0a] flex flex-col">
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Selected Preview</h3>
                {modalPreview ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-neutral-800 bg-black min-h-[200px]">
                      <Image src={modalPreview.url} alt="Large Preview" fill className="object-contain" unoptimized />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-white uppercase tracking-widest border border-white/20 flex items-center gap-2 shadow-xl">
                        <span>{modalPreview.ticker}</span><span className="text-neutral-500">|</span><span className="text-blue-400">{modalPreview.timeframe}</span>
                      </div>
                    </div>
                    <button onClick={handleAttachFromLibrary} className="w-full py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <PlusCircle size={18} /> Attach To Broadcast
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl bg-[#080808]">
                    <Target className="w-8 h-8 text-neutral-700 mb-3" />
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-8 text-center leading-relaxed">
                      Select an analysis from the grid to preview.<br/>Attaching it will automatically fill your ticker and timeframe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
