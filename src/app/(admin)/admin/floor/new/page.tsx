'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Send, Image as ImageIcon, Activity, Zap, Shield, Loader2, Target } from 'lucide-react'
import Image from 'next/image'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminFloorControl() {
  // --- TERMINAL POST STATE ---
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

      // Upload image to Supabase Storage if one was selected
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

      // Insert the post data into the database
      const { error } = await supabase.from('terminal_posts').insert({
        ticker: ticker.toUpperCase(),
        timeframe,
        thesis,
        image_url: imageUrl,
        tier_access: tier
      })

      if (error) throw error

      // Reset Form on Success
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

      // Reset Squawk Input
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
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-neutral-900 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Shield className="text-blue-500 w-8 h-8" /> Desk Command Center
            </h1>
            <p className="text-neutral-500 mt-2 font-bold uppercase tracking-widest text-xs">
              Push data directly to the user terminal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: TERMINAL POST BUILDER (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#0a0a0a] rounded-3xl border border-neutral-800 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-emerald-500 w-6 h-6" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Deploy Terminal Setup</h2>
            </div>

            <form onSubmit={handleTerminalSubmit} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Ticker</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $XAUUSD" 
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors uppercase"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Timeframe</label>
                  <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="15M">15M</option>
                    <option value="1H">1H</option>
                    <option value="4H">4H</option>
                    <option value="1D">1D</option>
                    <option value="1W">1W</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Access Tier</label>
                  <div className="flex bg-[#111] rounded-xl border border-neutral-800 p-1">
                    <button type="button" onClick={() => setTier('essential')} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${tier === 'essential' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}>Essential</button>
                    <button type="button" onClick={() => setTier('pro')} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${tier === 'pro' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Pro Only</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Chart Image</label>
                <div className="border-2 border-dashed border-neutral-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-colors relative bg-[#050505]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-neutral-800">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-sm tracking-widest uppercase">Click to Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ImageIcon className="text-neutral-600 w-10 h-10 mb-3" />
                      <p className="text-neutral-400 font-bold tracking-wide">Upload TradingView Screenshot</p>
                      <p className="text-neutral-600 text-xs mt-1 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Execution Thesis</label>
                <textarea 
                  rows={4}
                  placeholder="Explain the structure, liquidity sweeps, and your entry logic..."
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors custom-scrollbar"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isPostingTerminal}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPostingTerminal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                {isPostingTerminal ? 'Deploying to Floor...' : 'Push to Terminal'}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE SQUAWK TRANSMITTER */}
          <div className="lg:col-span-1 bg-[#0a0a0a] rounded-3xl border border-neutral-800 p-8 shadow-2xl flex flex-col h-fit sticky top-10">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-amber-500 w-6 h-6" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Live Squawk</h2>
            </div>

            <form onSubmit={handleSquawkSubmit} className="space-y-6 flex-1 flex flex-col">
              
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Category Tag (Optional)</label>
                <select 
                  value={squawkTag}
                  onChange={(e) => setSquawkTag(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                >
                  <option value="">No Tag</option>
                  <option value="Update">Update</option>
                  <option value="Alert">Alert</option>
                  <option value="Execution">Execution</option>
                  <option value="News">Macro News</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Broadcast Message</label>
                <textarea 
                  rows={6}
                  placeholder="Rapid market updates..."
                  value={squawkMessage}
                  onChange={(e) => setSquawkMessage(e.target.value)}
                  className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors custom-scrollbar resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isPostingSquawk}
                className="w-full py-4 bg-[#111] text-amber-500 border border-amber-500/30 font-black uppercase tracking-widest rounded-xl hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPostingSquawk ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {isPostingSquawk ? 'Transmitting...' : 'Transmit Alert'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
