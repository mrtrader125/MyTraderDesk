'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Activity, Zap, Shield, Loader2, Target } from 'lucide-react'
import Image from 'next/image'

export default function AdminFloorControl() {
  // Lock the Supabase client specifically to your Admin session
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const [ticker, setTicker] = useState('')
  const [timeframe, setTimeframe] = useState('1D')
  const [thesis, setThesis] = useState('')
  const [tier, setTier] = useState('essential')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPostingTerminal, setIsPostingTerminal] = useState(false)

  // --- SQUAWK STATE ---
  const [squawkMessage, setSquawkMessage] = useState('')
  const [squawkTag, setSquawkTag] = useState('')
  const [isPostingSquawk, setIsPostingSquawk] = useState(false)

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Submit Terminal Post
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker || !thesis) return alert('Ticker and Thesis are required.')
    setIsPostingTerminal(true)

    try {
      let imageUrl = null

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
        
        imageUrl = publicUrlData.publicUrl
      }

      const { error } = await supabase.from('terminal_posts').insert({
        ticker: ticker.toUpperCase(),
        timeframe,
        thesis,
        image_url: imageUrl,
        tier_access: tier
      })

      if (error) throw error

      setTicker('')
      setThesis('')
      setImageFile(null)
      setImagePreview(null)
      alert('Terminal Post pushed to the Live Floor successfully.')

    } catch (error: any) {
      console.error('Error posting to terminal:', error)
      alert(`Failed to post: ${error.message}`)
    } finally {
      setIsPostingTerminal(false)
    }
  }

  // Submit Live Squawk
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
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
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

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Chart Image</label>
                <div className="border border-dashed border-neutral-700 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors relative bg-[#111]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-neutral-800">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs tracking-widest uppercase">Click to Replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <ImageIcon className="text-neutral-600 w-6 h-6 mb-2" />
                      <p className="text-neutral-400 font-bold text-xs tracking-wide">Drop TradingView Screenshot</p>
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
    </div>
  )
}
