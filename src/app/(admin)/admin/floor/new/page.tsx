'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase' // 🚨 Fixed import to stop GoTrue warnings
import { Send, Activity, CheckCircle2 } from 'lucide-react'

export default function AdminFloorBroadcast() {
  const [asset, setAsset] = useState('')
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    // 1. Deactivate old polls
    await supabase.from('desk_polls').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Publish new poll
    const { error } = await supabase
      .from('desk_polls')
      .insert([{ asset: asset.toUpperCase(), question, is_active: true }])

    if (!error) {
      setStatus('success')
      setAsset('')
      setQuestion('')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      console.error("Transmission Error:", error)
      alert("Failed to broadcast. Ensure you ran the SQL RLS script.")
      setStatus('idle')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans text-white">
      <div className="flex items-center space-x-4 mb-10 border-b border-neutral-800 pb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
          <Activity className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Floor Broadcast</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-1">Push a new sentiment question to the Live Floor</p>
        </div>
      </div>

      <form onSubmit={handleLaunch} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Asset Symbol</label>
          <input 
            required
            type="text" 
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 uppercase"
            placeholder="e.g., DXY or EURUSD"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Transmission / Question</label>
          <textarea 
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500"
            placeholder="e.g., US Dollar Index is tapping weekly resistance. What is your bias?"
          />
        </div>
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center"
        >
          {status === 'loading' ? 'Transmitting...' : <><Send size={18} className="mr-2" /> Broadcast to Floor</>}
        </button>

        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center text-sm font-bold">
            <CheckCircle2 className="mr-3" size={20} /> Transmission sent to the community successfully!
          </div>
        )}
      </form>
    </div>
  )
}
