'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Activity, Zap, Shield, Loader2, Target, FolderSearch, X, PlusCircle, Edit2, Trash2, Save, Settings2, Radio } from 'lucide-react'
import Image from 'next/image'

export default function AdminFloorControl() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // --- PORTAL MOUNT STATE ---
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState<'deploy' | 'manage'>('deploy')

  // --- FORM STATE ---
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [thesis, setThesis] = useState('')
  const [tier, setTier] = useState('pro') // 🚨 Default to Pro
  const [isPostingFloor, setIsPostingFloor] = useState(false)
  
  // --- SENTIMENT ENGINE STATE ---
  const [overrideSentiment, setOverrideSentiment] = useState(false)
  const [adminAlignPct, setAdminAlignPct] = useState(75)

  // --- IMAGE & MODAL STATE ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null) 

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [recentImages, setRecentImages] = useState<{url: string, ticker: string, timeframe: string}[]>([])
  const [modalPreview, setModalPreview] = useState<{url: string, ticker: string, timeframe: string} | null>(null)

  // --- SQUAWK/COMMS STATE ---
  const [commsMessage, setCommsMessage] = useState('')
  const [commsTag, setCommsTag] = useState('')
  const [isPostingComms, setIsPostingComms] = useState(false)

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

  // 🚨 REBUILT STRICT EDIT & DELETE HANDLERS
  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this Live Floor post permanently?')) return
    try {
      const { error } = await supabase.from('terminal_posts').delete().eq('id', id)
      if (error) throw error;
      setActivePosts(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      console.error("Delete Error Details:", error)
      if (error.message.includes("Failed to fetch")) {
        alert("Network Blocked: Your browser or ad-blocker blocked the delete request. Turn off shields for this site.")
      } else {
        alert(`Database Error: ${error.message}`)
      }
    }
  }

  const handleDeleteSquawk = async (id: string) => {
    if (!confirm('Delete this Global Comms message permanently?')) return
    try {
      const { error } = await supabase.from('live_squawk').delete().eq('id', id)
      if (error) throw error;
      setActiveSquawks(prev => prev.filter(s => s.id !== id))
    } catch (error: any) {
      console.error("Delete Error Details:", error)
      if (error.message.includes("Failed to fetch")) {
        alert("Network Blocked: Your browser or ad-blocker blocked the delete request. Turn off shields for this site.")
      } else {
        alert(`Database Error: ${error.message}`)
      }
    }
  }

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const { error } = await supabase.from('terminal_posts').update({
        ticker: editingPost.ticker.toUpperCase(),
        timeframe: editingPost.timeframe,
        thesis: editingPost.thesis,
        tier_access: editingPost.tier_access,
        admin_align_pct: editingPost.overrideSentiment ? editingPost.admin_align_pct : null
      }).eq('id', editingPost.id)
      
      if (error) throw error;
      setEditingPost(null)
      fetchActiveFloorData()
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateSquawk = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const { error } = await supabase.from('live_squawk').update({
        message: editingSquawk.message,
        tag: editingSquawk.tag
      }).eq('id', editingSquawk.id)
      
      if (error) throw error;
      setEditingSquawk(null)
      fetchActiveFloorData()
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
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

  const handleFloorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker || !thesis) return alert('Ticker and Thesis are required.')
    setIsPostingFloor(true)

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

      const { error: dbError } = await supabase.from('terminal_posts').insert({
        ticker: ticker.toUpperCase(),
        timeframe,
        thesis,
        image_url: finalImageUrl,
        tier_access: tier,
        admin_align_pct: overrideSentiment ? adminAlignPct : null
      })
      
      if (dbError) throw new Error(`Database Error: ${dbError.message}`)

      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          timeframe,
          thesis,
          image_url: finalImageUrl,
          tier_access: tier
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to broadcast to Telegram")
      }

      setTicker(''); setThesis(''); setImageFile(null); setLibraryImageUrl(null); setImagePreview(null); setModalPreview(null);
      setOverrideSentiment(false); setAdminAlignPct(75);
      
      if (activeTab === 'manage') fetchActiveFloorData(); 
      alert('🚀 Post Deployed to Live Floor & Telegram successfully!')
      
    } catch (error: any) { 
      alert(`Failed to post: ${error.message}`) 
    } 
    finally { 
      setIsPostingFloor(false) 
    }
  }

  const handleCommsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commsMessage) return
    setIsPostingComms(true)
    try {
      const { error } = await supabase.from('live_squawk').insert({ message: commsMessage, tag: commsTag || null })
      if (error) throw error
      setCommsMessage(''); setCommsTag('');
    } catch (error: any) { alert(`Failed: ${error.message}`) } 
    finally { setIsPostingComms(false) }
  }

  return (
    <div className="w-full bg-[#050505] text-neutral-200 p-4 md:p-6 lg:p-8 flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* HEADER WITH TABS */}
        <div className="mb-6 md:mb-8 pb-5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight uppercase italic">
              <Shield className="text-blue-500 w-7 h-7 not-italic" /> Sentinel Command
            </h1>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Live Floor Execution & Comm Link</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-[#0a0a0a] rounded-xl border border-white/[0.05] p-1.5 shadow-inner">
              <button 
                onClick={() => setActiveTab('deploy')} 
                className={`flex items-center justify-center gap-2 w-28 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'deploy' ? 'bg-white text-black shadow-sm scale-[1.02]' : 'text-neutral-500 hover:text-white'}`}
              >
                <Zap size={14} /> Deploy
              </button>
              <button 
                onClick={() => setActiveTab('manage')} 
                className={`flex items-center justify-center gap-2 w-28 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'manage' ? 'bg-white text-black shadow-sm scale-[1.02]' : 'text-neutral-500 hover:text-white'}`}
              >
                <Settings2 size={14} /> Manage
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              System Live
            </div>
          </div>
        </div>

        {/* --- DEPLOY MODE --- */}
        {activeTab === 'deploy' && (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 min-h-0 overflow-hidden h-full animate-in fade-in duration-500">
            
            {/* LEFT: DEPLOY TO LIVE FLOOR */}
            <div className="xl:col-span-2 bg-[#0a0a0a] rounded-3xl border border-white/[0.05] p-6 lg:p-8 shadow-2xl flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-8 border-b border-white/[0.05] pb-5">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Activity className="text-blue-500 w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Deploy to Live Floor</h2>
              </div>

              <form onSubmit={handleFloorSubmit} className="space-y-8 flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Target Ticker</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BTCUSD" 
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:border-blue-500 outline-none transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-neutral-600 shadow-inner"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Timeframe</label>
                    <select 
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:border-blue-500 outline-none transition-all appearance-none shadow-inner cursor-pointer"
                    >
                      <option value="15M">15M</option>
                      <option value="1H">1H</option>
                      <option value="4H">4H</option>
                      <option value="1D">1D</option>
                      <option value="1W">1W</option>
                      {!['15M', '1H', '4H', '1D', '1W'].includes(timeframe) && <option value={timeframe}>{timeframe}</option>}
                    </select>
                  </div>
                  
                  {/* 🚨 TIER ACCESS CONTROLS 🚨 */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Floor Access Tier</label>
                    <div className="flex bg-[#111] rounded-xl border border-white/[0.05] p-1.5 shadow-inner">
                      <button type="button" onClick={() => setTier('free')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tier === 'free' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' : 'text-neutral-500 hover:text-white'}`}>Free Preview</button>
                      <button type="button" onClick={() => setTier('pro')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tier === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-neutral-500 hover:text-white'}`}>Pro Exclusive</button>
                    </div>
                  </div>
                  
                  {/* 🔥 SENTIMENT ENGINE CONTROLLER */}
                  <div className="sm:col-span-2 lg:col-span-4 bg-[#111] border border-white/[0.05] rounded-2xl p-6 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-1.5">Global Sentiment Engine</h3>
                        <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Control the live alignment percentage target shown to users</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setOverrideSentiment(!overrideSentiment)} 
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shrink-0 border ${overrideSentiment ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'bg-[#0a0a0a] border-white/[0.05] text-neutral-500 hover:text-white'}`}
                      >
                        {overrideSentiment ? 'Override Active' : 'Randomized'}
                      </button>
                    </div>
                    
                    {overrideSentiment && (
                      <div className="mt-8 animate-in fade-in duration-300 bg-[#050505] p-4 rounded-xl border border-white/[0.02]">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                          <span className="text-emerald-400">Align: {adminAlignPct}%</span>
                          <span className="text-amber-500">Counter: {100 - adminAlignPct}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={adminAlignPct} 
                          onChange={(e) => setAdminAlignPct(Number(e.target.value))} 
                          className="w-full h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-blue-500" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Visual Evidence (Optional)</label>
                    <button type="button" onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-all border border-blue-500/20">
                      <FolderSearch size={14} /> Master Playbook
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-white/[0.05] hover:border-white/[0.15] rounded-2xl p-6 md:p-8 text-center transition-colors relative bg-[#111] shadow-inner">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {imagePreview ? (
                      <div className="relative w-full h-[250px] rounded-xl overflow-hidden border border-white/[0.05] bg-[#050505]">
                        <Image src={imagePreview} alt="Preview" fill className="object-contain p-2" unoptimized />
                        <div className="absolute inset-0 bg-[#050505]/80 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm">
                          <span className="text-white font-black text-[11px] uppercase tracking-widest">Click to replace evidence</span>
                          {libraryImageUrl && <span className="text-blue-400 text-[9px] font-black mt-3 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">Linked from Master Playbook</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-14 h-14 rounded-full bg-[#0a0a0a] border border-white/[0.05] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <ImageIcon className="text-neutral-500 w-6 h-6" />
                        </div>
                        <p className="text-white font-black text-[11px] uppercase tracking-widest mb-1.5">Upload Target Chart</p>
                        <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">or browse master playbook above</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Analytical Thesis</label>
                  <textarea value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder="Detail your complete structural analysis..." className="w-full flex-1 min-h-[160px] bg-[#111] border border-white/[0.05] rounded-2xl px-5 py-4 text-sm text-neutral-200 focus:border-blue-500 outline-none transition-all custom-scrollbar resize-none placeholder:text-neutral-600 shadow-inner leading-relaxed" required />
                </div>

                <button type="submit" disabled={isPostingFloor} className="w-full py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  {isPostingFloor ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isPostingFloor ? 'Transmitting...' : 'Broadcast to Floor & Telegram'}
                </button>
              </form>
            </div>

            {/* RIGHT: SEND TO GLOBAL COMMS */}
            <div className="xl:col-span-1 bg-[#0a0a0a] rounded-3xl border border-white/[0.05] p-6 lg:p-8 shadow-2xl flex flex-col h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-8 border-b border-white/[0.05] pb-5">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Radio className="text-amber-500 w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Global Comms</h2>
              </div>
              <form onSubmit={handleCommsSubmit} className="space-y-6 flex-1 flex flex-col">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Transmission Tag</label>
                  <select value={commsTag} onChange={(e) => setCommsTag(e.target.value)} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all appearance-none shadow-inner cursor-pointer">
                    <option value="">Standard Update</option>
                    <option value="Execution">Live Execution</option>
                    <option value="Alert">Critical Alert</option>
                    <option value="News">Macro News</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Message Body</label>
                  <textarea value={commsMessage} onChange={(e) => setCommsMessage(e.target.value)} placeholder="Quick desk update..." className="w-full flex-1 bg-[#111] border border-white/[0.05] rounded-2xl px-5 py-4 text-sm text-neutral-200 focus:border-amber-500 outline-none transition-all custom-scrollbar resize-none placeholder:text-neutral-600 shadow-inner leading-relaxed" required />
                </div>
                <button type="submit" disabled={isPostingComms} className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  {isPostingComms ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isPostingComms ? 'Sending...' : 'Transmit to Feed'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MANAGE MODE --- */}
        {activeTab === 'manage' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-0 overflow-hidden h-full animate-in fade-in duration-500">
            
            {/* MANAGE LIVE FLOOR POSTS */}
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/[0.05] p-6 lg:p-8 flex flex-col h-full shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 mb-6 shrink-0 border-b border-white/[0.05] pb-5">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Activity className="text-blue-500 w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Floor Posts</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 pb-6">
                {activePosts.map(post => (
                  <div key={post.id} className="bg-[#111] border border-white/[0.04] rounded-2xl p-5 flex items-start justify-between group hover:border-white/[0.1] transition-all shadow-sm">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-3.5">
                        <span className="bg-[#050505] border border-white/[0.05] text-white font-mono px-3 py-1.5 rounded-lg text-sm font-black tracking-tight">{post.ticker}</span>
                        <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest bg-black px-2 py-1 rounded border border-white/[0.05]">{post.timeframe}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${post.tier_access === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {post.tier_access}
                        </span>
                        {post.admin_align_pct !== null && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ml-auto">Override: {post.admin_align_pct}%</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{post.thesis}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingPost({
                        ...post, 
                        overrideSentiment: post.admin_align_pct !== null,
                        admin_align_pct: post.admin_align_pct || 75
                      })} className="p-2.5 bg-[#050505] border border-white/[0.05] text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeletePost(post.id)} className="p-2.5 bg-[#050505] border border-white/[0.05] text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MANAGE GLOBAL COMMS */}
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/[0.05] p-6 lg:p-8 flex flex-col h-full shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 mb-6 shrink-0 border-b border-white/[0.05] pb-5">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Radio className="text-amber-500 w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Comms</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 pb-6">
                {activeSquawks.map(squawk => (
                  <div key={squawk.id} className="bg-[#111] border border-white/[0.04] rounded-2xl p-5 flex items-start justify-between group hover:border-white/[0.1] transition-all shadow-sm">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-3.5">
                        {squawk.tag && <span className="bg-[#050505] border border-white/[0.05] text-neutral-300 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{squawk.tag}</span>}
                        <span className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest">{new Date(squawk.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">{squawk.message}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingSquawk(squawk)} className="p-2.5 bg-[#050505] border border-white/[0.05] text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteSquawk(squawk.id)} className="p-2.5 bg-[#050505] border border-white/[0.05] text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* EDIT LIVE FLOOR POST MODAL                 */}
      {/* ========================================= */}
      {mounted && editingPost && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setEditingPost(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 lg:p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/[0.05] pb-5">
              <Edit2 size={20} className="text-blue-500"/> Edit Floor Post
            </h3>
            <form onSubmit={handleUpdatePost} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Ticker</label>
                  <input type="text" value={editingPost.ticker} onChange={(e) => setEditingPost({...editingPost, ticker: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:border-blue-500 outline-none uppercase shadow-inner" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Timeframe</label>
                  <input type="text" value={editingPost.timeframe} onChange={(e) => setEditingPost({...editingPost, timeframe: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-mono text-white focus:border-blue-500 outline-none uppercase shadow-inner" required />
                </div>
              </div>

              {/* TIER TOGGLE FOR EDIT */}
              <div>
                 <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Tier Access</label>
                 <div className="flex bg-[#111] rounded-xl border border-white/[0.05] p-1.5 shadow-inner">
                   <button type="button" onClick={() => setEditingPost({...editingPost, tier_access: 'free'})} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${editingPost.tier_access === 'free' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' : 'text-neutral-500 hover:text-white'}`}>Free</button>
                   <button type="button" onClick={() => setEditingPost({...editingPost, tier_access: 'pro'})} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${editingPost.tier_access === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-neutral-500 hover:text-white'}`}>Pro</button>
                 </div>
              </div>

              {/* EDIT MODAL SENTIMENT CONTROLLER */}
              <div className="bg-[#111] border border-white/[0.05] rounded-2xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Sentiment Override</span>
                  <button 
                    type="button" 
                    onClick={() => setEditingPost({...editingPost, overrideSentiment: !editingPost.overrideSentiment})} 
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border ${editingPost.overrideSentiment ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-[#050505] border-white/[0.05] text-neutral-500'}`}
                  >
                    {editingPost.overrideSentiment ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {editingPost.overrideSentiment && (
                  <div className="animate-in fade-in duration-300 pt-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                      <span className="text-emerald-400">Align: {editingPost.admin_align_pct}%</span>
                      <span className="text-amber-500">Counter: {100 - editingPost.admin_align_pct}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={editingPost.admin_align_pct} 
                      onChange={(e) => setEditingPost({...editingPost, admin_align_pct: Number(e.target.value)})} 
                      className="w-full h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer accent-blue-500" 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Analytical Thesis</label>
                <textarea value={editingPost.thesis} onChange={(e) => setEditingPost({...editingPost, thesis: e.target.value})} className="w-full h-32 bg-[#111] border border-white/[0.05] rounded-2xl px-5 py-4 text-sm text-neutral-200 focus:border-blue-500 outline-none custom-scrollbar resize-none shadow-inner leading-relaxed" required />
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] border border-white/[0.05] hover:bg-[#151515] hover:text-white rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Save Data
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================= */}
      {/* EDIT GLOBAL COMMS MESSAGE MODAL           */}
      {/* ========================================= */}
      {mounted && editingSquawk && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setEditingSquawk(null)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 lg:p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/[0.05] pb-5">
              <Edit2 size={20} className="text-amber-500"/> Edit Comms
            </h3>
            <form onSubmit={handleUpdateSquawk} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Transmission Tag</label>
                <input type="text" value={editingSquawk.tag || ''} onChange={(e) => setEditingSquawk({...editingSquawk, tag: e.target.value})} className="w-full bg-[#111] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:border-amber-500 outline-none uppercase shadow-inner" placeholder="Leave blank for none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2.5">Message Body</label>
                <textarea value={editingSquawk.message} onChange={(e) => setEditingSquawk({...editingSquawk, message: e.target.value})} className="w-full h-40 bg-[#111] border border-white/[0.05] rounded-2xl px-5 py-4 text-sm text-neutral-200 focus:border-amber-500 outline-none custom-scrollbar resize-none shadow-inner leading-relaxed" required />
              </div>
              <div className="flex gap-4 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={() => setEditingSquawk(null)} className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-[#111] border border-white/[0.05] hover:bg-[#151515] hover:text-white rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Save Comms
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================= */}
      {/* LIBRARY MODAL                             */}
      {/* ========================================= */}
      {mounted && isLibraryOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" onClick={() => setIsLibraryOpen(false)}></div>
          <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0a0a0a] rounded-3xl border border-white/[0.05] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-white/[0.05] bg-[#0c0c0c] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <FolderSearch className="text-blue-500 w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Master Playbook Library</h2>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2.5 bg-[#111] hover:bg-[#151515] border border-white/[0.05] rounded-xl transition-colors text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              <div className="w-full md:w-1/2 lg:w-3/5 p-8 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/[0.05] bg-[#050505]">
                {recentImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
                    <ImageIcon className="w-16 h-16 text-neutral-600 mb-4 stroke-1" />
                    <p className="text-[11px] text-neutral-400 font-black uppercase tracking-widest">No previous analysis found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                    {recentImages.map((item, i) => (
                      <div key={i} onClick={() => setModalPreview(item)} className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all ${modalPreview?.url === item.url ? 'border-2 border-blue-500 scale-[0.98] shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border border-white/[0.05] hover:border-white/[0.2] hover:scale-105 shadow-sm'}`}>
                        <Image src={item.url} alt="Library Item" fill className="object-cover" unoptimized />
                        <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black font-mono text-white uppercase tracking-widest border border-white/[0.1] flex items-center gap-2 shadow-lg">
                          <span>{item.ticker}</span><span className="text-neutral-500">|</span><span className="text-blue-400">{item.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 lg:w-2/5 p-8 bg-[#0c0c0c] flex flex-col shadow-[-20px_0_30px_rgba(0,0,0,0.5)] z-10">
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-6">Selected Preview</h3>
                {modalPreview ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="relative w-full flex-1 rounded-3xl overflow-hidden border border-white/[0.05] bg-[#050505] min-h-[250px] shadow-inner">
                      <Image src={modalPreview.url} alt="Large Preview" fill className="object-contain p-4" unoptimized />
                      <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-black font-mono text-white uppercase tracking-widest border border-white/[0.1] flex items-center gap-2 shadow-2xl">
                        <span>{modalPreview.ticker}</span><span className="text-neutral-500">|</span><span className="text-blue-400">{modalPreview.timeframe}</span>
                      </div>
                    </div>
                    <button onClick={handleAttachFromLibrary} className="w-full py-4 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                      <PlusCircle size={18} /> Attach To Broadcast
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl bg-[#111]">
                    <Target className="w-12 h-12 text-neutral-600 mb-5 stroke-1" />
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-8 text-center leading-relaxed">
                      Select an analysis from the grid to preview.<br/><br/>Attaching it will automatically fill your ticker and timeframe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
