'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Activity, CheckCircle2, MessageSquare } from 'lucide-react'

export default function AdminFloorBroadcast() {
  // --- POLL STATE ---
  const [pollAsset, setPollAsset] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollStatus, setPollStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  // --- CHATTER STATE ---
  const [chatAsset, setChatAsset] = useState('')
  const [chatTopic, setChatTopic] = useState('')
  const [chatBias, setChatBias] = useState('NEUTRAL')
  const [chatStatus, setChatStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  // 1. PUBLISH POLL (Left Column)
  const handlePollLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setPollStatus('loading')

    // Deactivate old polls
    await supabase.from('desk_polls').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')

    const { error } = await supabase.from('desk_polls').insert([{ asset: pollAsset.toUpperCase(), question: pollQuestion, is_active: true }])

    if (!error) {
      setPollStatus('success')
      setPollAsset('')
      setPollQuestion('')
      setTimeout(() => setPollStatus('idle'), 3000)
    } else {
      console.error(error)
      alert("Failed to broadcast poll.")
      setPollStatus('idle')
    }
  }

  // 2. PUBLISH CHATTER (Right Column History)
  const handleChatLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setChatStatus('loading')

    const { error } = await supabase.from('desk_discussions').insert([{ 
      asset: chatAsset.toUpperCase(), 
      topic: chatTopic, 
      bias: chatBias 
    }])

    if (!error) {
      setChatStatus('success')
      setChatAsset('')
      setChatTopic('')
      setChatBias('NEUTRAL')
      setTimeout(() => setChatStatus('idle'), 3000)
    } else {
      console.error(error)
      alert("Failed to post chatter.")
      setChatStatus('idle')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans text-white">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-10 border-b border-neutral-800 pb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
          <Activity className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Floor Management</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-1">Control the daily poll and continuous chatter feed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT: DAILY POLL FORM --- */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl">
          <h2 className="text-lg font-black uppercase mb-6 flex items-center tracking-tight">
            <Activity size={18} className="mr-3 text-blue-500" /> 1. Daily Bias Poll
          </h2>
          <form onSubmit={handlePollLaunch} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Asset Symbol</label>
              <input required type="text" value={pollAsset} onChange={(e) => setPollAsset(e.target.value)} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 uppercase" placeholder="e.g., DXY" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Poll Question</label>
              <textarea required value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} rows={3} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" placeholder="e.g., What is your bias?" />
            </div>
            <button type="submit" disabled={pollStatus === 'loading'} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-colors flex items-center justify-center">
              {pollStatus === 'loading' ? 'Transmitting...' : <><Send size={18} className="mr-2" /> Launch New Poll</>}
            </button>
            {pollStatus === 'success' && <div className="text-emerald-500 text-xs font-bold flex items-center justify-center"><CheckCircle2 className="mr-2" size={14} /> Poll Active</div>}
          </form>
        </div>

        {/* --- RIGHT: CHATTER FEED FORM --- */}
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl">
          <h2 className="text-lg font-black uppercase mb-6 flex items-center tracking-tight">
            <MessageSquare size={18} className="mr-3 text-emerald-500" /> 2. Post Floor Chatter
          </h2>
          <form onSubmit={handleChatLaunch} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Asset Symbol</label>
                <input required type="text" value={chatAsset} onChange={(e) => setChatAsset(e.target.value)} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 uppercase" placeholder="e.g., XAUUSD" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your Bias</label>
                <select value={chatBias} onChange={(e) => setChatBias(e.target.value)} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 text-sm font-bold">
                  <option value="BULLISH">Bullish</option>
                  <option value="BEARISH">Bearish</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Discussion Topic / Note</label>
              <textarea required value={chatTopic} onChange={(e) => setChatTopic(e.target.value)} rows={3} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500" placeholder="e.g., Liquidity sweep validated at 2040..." />
            </div>
            <button type="submit" disabled={chatStatus === 'loading'} className="w-full py-4 bg-white text-black hover:bg-neutral-200 font-black uppercase tracking-widest text-sm rounded-xl transition-colors flex items-center justify-center">
              {chatStatus === 'loading' ? 'Posting...' : <><Send size={18} className="mr-2" /> Push to History</>}
            </button>
            {chatStatus === 'success' && <div className="text-emerald-500 text-xs font-bold flex items-center justify-center"><CheckCircle2 className="mr-2" size={14} /> Added to Chatter Feed</div>}
          </form>
        </div>

      </div>
    </div>
  )
}
