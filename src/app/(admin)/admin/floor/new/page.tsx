'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Activity, Zap, Shield, Loader2, Target, FolderSearch, X, PlusCircle } from 'lucide-react'
import Image from 'next/image'

export default function AdminFloorControl() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // --- FORM STATE ---
  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [thesis, setThesis] = useState('')
  const [tier, setTier] = useState('essential')
  const [isPostingTerminal, setIsPostingTerminal] = useState(false)

  // --- IMAGE & MODAL STATE ---
  const [imageFile, setImageFile] = useState<File | null>(null) // For new uploads
  const [libraryImageUrl, setLibraryImageUrl] = useState<string | null>(null) // For reused charts
  const [imagePreview, setImagePreview] = useState<string | null>(null) // For displaying in the form

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [recentImages, setRecentImages] = useState<string[]>([])
  const [modalPreviewImg, setModalPreviewImg] = useState<string | null>(null)

  // --- SQUAWK STATE ---
  const [squawkMessage, setSquawkMessage] = useState('')
  const [squawkTag, setSquawkTag] = useState('')
  const [isPostingSquawk, setIsPostingSquawk] = useState(false)

  // 1. Fetch library images silently in the background
  useEffect(() => {
    const fetchRecentImages = async () => {
      const { data } = await supabase
        .from('terminal_posts')
        .select('image_url')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30) // Bumped up limit since it's a modal now

      if (data) {
        // Filter out duplicates
        const uniqueImages = Array.from(new Set(data.map(post => post.image_url)))
        setRecentImages(uniqueImages)
      }
    }
    fetchRecentImages()
  }, [supabase])

  // 2. Handle dragging/dropping a NEW file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setLibraryImageUrl(null) // Wipe out any library selection
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // 3. Handle attaching an EXISTING image from the Modal
  const handleAttachFromLibrary = () => {
    if (modalPreviewImg) {
      setLibraryImageUrl(modalPreviewImg)
      setImageFile(null) // Wipe out any pending file uploads
      setImagePreview(modalPreviewImg) // Show it in the main form
      setIsLibraryOpen(false) // Close the modal
    }
  }

  // 4. Submit the Post
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker || !thesis) return alert('Ticker and Thesis are required.')
    setIsPostingTerminal(true)

    try {
      let finalImageUrl = null

      // If they uploaded a new file, push to bucket
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('analysis-images') 
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(fileName)
        
        finalImageUrl = publicUrlData.publicUrl
      } 
      // Else if they picked from library, just reuse the URL
      else if (libraryImageUrl) {
        finalImageUrl = libraryImageUrl
      }

      // Write to database
      const { error } = await supabase.from('terminal_posts').insert({
        ticker: ticker.toUpperCase(),
        timeframe,
        thesis,
        image_url: finalImageUrl,
        tier_access: tier
      })

      if (error) throw error

      // Reset form on success
      setTicker('')
      setThesis('')
      setImageFile(null)
      setLibraryImageUrl(null)
      setImagePreview(null)
      setModalPreviewImg(null)
      alert('Terminal Post pushed to the Live Floor successfully.')

    } catch (error: any) {
      console.error('Error posting to terminal:', error)
      alert(`Failed to post: ${error.message}`)
    } finally {
      setIsPostingTerminal(false)
    }
  }

  // Submit Squawk
  const handleSquawkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!squawkMessage) return
    setIsPostingSquawk(true)

    try {
      const { error } = await supabase.from('live_squawk').insert({
        message: squawkMessage,
        tag: squawkTag || null
      })

      if (error) throw error
      setSquawkMessage('')
      setSquawkTag('')
    } catch (error: any) {
      console.error('Error sending squawk:', error)
      alert(`Failed to send squawk: ${error.message}`)
    } finally {
      setIsPostingSquawk(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-6 font-sans relative">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* COMPACT PROFESSIONAL HEADER */}
        <div className="mb-6 pb-4 border-b border-neutral-900 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight uppercase">
            <Shield className="text-blue-500 w-5 h-5" /> Sentinel Command
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            System Active
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* LEFT: TERMINAL POST BUILDER */}
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 shadow-2xl flex flex-col">
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

              {/* UPLOAD / LIBRARY UI */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Chart Image</label>
                  {/* THE LIBRARY BUTTON */}
                  <button 
                    type="button" 
                    onClick={() => setIsLibraryOpen(true)} 
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-[#111] hover:bg-blue-500/10 hover:text-blue-400 text-neutral-400 border border-neutral-800 hover:border-blue-500/30 px-3 py-1.5 rounded transition-all"
                  >
                    <FolderSearch size={12} /> Browse Library
                  </button>
                </div>

                <div className="border border-dashed border-neutral-700 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors relative bg-[#111]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-[180px] rounded-md overflow-hidden border border-neutral-800 bg-black">
                      <Image src={imagePreview} alt="Preview" fill className="object-contain" unoptimized />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs tracking-widest uppercase">Click to Replace Upload</span>
                        {libraryImageUrl && <span className="text-blue-400 text-[9px] mt-2 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">Attached from Library</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImageIcon className="text-neutral-600 w-8 h-8 mb-3" />
                      <p className="text-neutral-400 font-bold text-sm tracking-wide mb-1">Upload New Screenshot</p>
                      <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">or browse library above</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Execution Thesis</label>
                <textarea 
                  placeholder="Structure, liquidity sweeps, and entry logic..."
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  className="w-full flex-1 min-h-[120px] bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all custom-scrollbar resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isPostingTerminal}
                className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {isPostingTerminal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isPostingTerminal ? 'Deploying...' : 'Push to Terminal'}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE SQUAWK TRANSMITTER */}
          <div className="lg:col-span-1 bg-[#0a0a0a] rounded-xl border border-neutral-800 p-6 shadow-2xl flex flex-col h-[calc(100vh-120px)] sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-amber-500 w-4 h-4" />
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Live Squawk</h2>
            </div>

            <form onSubmit={handleSquawkSubmit} className="space-y-5 flex-1 flex flex-col">
              
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Category Tag</label>
                <select 
                  value={squawkTag}
                  onChange={(e) => setSquawkTag(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all appearance-none"
                >
                  <option value="">Standard Broadcast</option>
                  <option value="Update">Trade Update</option>
                  <option value="Alert">Critical Alert</option>
                  <option value="Execution">Live Execution</option>
                  <option value="News">Macro News</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea 
                  placeholder="Rapid market updates..."
                  value={squawkMessage}
                  onChange={(e) => setSquawkMessage(e.target.value)}
                  className="w-full flex-1 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all custom-scrollbar resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isPostingSquawk}
                className="w-full py-3 bg-[#111] text-amber-500 border border-amber-500/30 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-black active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPostingSquawk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isPostingSquawk ? 'Transmitting...' : 'Transmit Alert'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ========================================= */}
      {/* FULL-SCREEN MEDIA LIBRARY MODAL             */}
      {/* ========================================= */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setIsLibraryOpen(false)} 
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0a0a0a] rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FolderSearch className="text-blue-500 w-5 h-5" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Media Library</h2>
              </div>
              <button 
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Split-Pane Body */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              
              {/* Left Side: Thumbnail Grid */}
              <div className="w-full md:w-1/2 lg:w-3/5 p-6 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-neutral-900 bg-[#050505]">
                {recentImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <ImageIcon className="w-10 h-10 text-neutral-700 mb-3" />
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">No previous analysis found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentImages.map((imgUrl, i) => (
                      <div 
                        key={i} 
                        onClick={() => setModalPreviewImg(imgUrl)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${modalPreviewImg === imgUrl ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[0.98]' : 'border-neutral-800 hover:border-neutral-600 hover:scale-105'}`}
                      >
                        <Image src={imgUrl} alt="Library Item" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Big Preview & Action Button */}
              <div className="w-full md:w-1/2 lg:w-2/5 p-6 bg-[#0a0a0a] flex flex-col">
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Selected Preview</h3>
                
                {modalPreviewImg ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-neutral-800 bg-black min-h-[200px]">
                      <Image src={modalPreviewImg} alt="Large Preview" fill className="object-contain" unoptimized />
                    </div>
                    
                    <button 
                      onClick={handleAttachFromLibrary}
                      className="w-full py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      <PlusCircle size={18} /> Add To Setup
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-xl bg-[#080808]">
                    <Target className="w-8 h-8 text-neutral-700 mb-3" />
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-8 text-center">
                      Select an image from the grid to preview and attach it
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
