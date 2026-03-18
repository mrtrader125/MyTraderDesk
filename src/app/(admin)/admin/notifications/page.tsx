'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// 👇 FIX: Added Clock and Radio to the verified imports
import { Radio, Send, Activity, Trash2, BellRing, AlertTriangle, Info, Zap, Globe, Clock } from 'lucide-react'

export default function BroadcastArrayPage() {
  const [loading, setLoading] = useState(true)
  const [transmitting, setTransmitting] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // Composer State
  const [type, setType] = useState<'BROADCAST' | 'ALERT'>('BROADCAST')
  const [urgency, setUrgency] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetTier, setTargetTier] = useState<string>('ALL')

  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (!error && data) setHistory(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTransmit = async () => {
    if (!title || !message) return alert("Title and Message are required.")
    
    setTransmitting(true)
    try {
      const { error } = await supabase.from('notifications').insert([{
        type,
        urgency,
        title,
        message,
        target_tier: targetTier,
        status: 'ACTIVE'
      }])

      if (error) throw error

      setTitle('')
      setMessage('')
      fetchHistory()
    } catch (err) {
      console.error(err)
      alert("Transmission failed. Check if the 'notifications' table matches the new schema.")
    } finally {
      setTransmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Initializing Broadcast Array...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          Broadcast <span className="text-brand-primary">Array</span>
        </h2>
        <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Transmit global network alerts and dashboard broadcasts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center relative z-10">
              <Radio size={16} className="mr-2 text-brand-primary" /> Transmission Composer
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Transmission Type</label>
                  <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors appearance-none">
                    <option value="BROADCAST">Dashboard Broadcast</option>
                    <option value="ALERT">Notification Bell</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Urgency Level</label>
                  <select value={urgency} onChange={(e: any) => setUrgency(e.target.value)} className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors appearance-none">
                    <option value="INFO">Info (Blue)</option>
                    <option value="WARNING">Warning (Amber)</option>
                    <option value="CRITICAL">Critical (Red)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800/50">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Target Network Tier</label>
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'FREE', 'ESSENTIAL', 'PRO', 'PREMIUM'].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTargetTier(tier)}
                      className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${targetTier === tier ? 'bg-white text-black border-white shadow-md' : 'bg-[#050505] text-neutral-500 border-neutral-800 hover:border-neutral-600'}`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-neutral-800/50">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Headline</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Transmission Subject" className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm font-black text-white outline-none focus:border-brand-primary/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Message Payload</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message data..." className="w-full h-24 bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-medium text-white outline-none focus:border-brand-primary/50 transition-colors resize-none" />
                </div>
              </div>

              <button onClick={handleTransmit} disabled={transmitting || !title || !message} className="w-full py-4 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-all shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {transmitting ? <Activity className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                {transmitting ? 'Transmitting...' : 'Execute Transmission'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#050505] border border-neutral-800 border-dashed rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-6 flex items-center justify-center"><Globe size={14} className="mr-2 text-neutral-600" /> Live Operator Preview</h3>
            <div className="flex items-center justify-center min-h-[150px]">
              {type === 'BROADCAST' ? (
                <div className={`w-full p-4 rounded-xl relative overflow-hidden border ${urgency === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20' : urgency === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                  <div className={`absolute top-0 right-0 w-16 h-16 blur-xl rounded-full ${urgency === 'CRITICAL' ? 'bg-red-500/20' : urgency === 'WARNING' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 relative z-10 ${urgency === 'CRITICAL' ? 'text-red-400' : urgency === 'WARNING' ? 'text-amber-400' : 'text-blue-400'}`}>{title || 'System Broadcast'}</span>
                  <p className={`text-xs leading-relaxed font-medium relative z-10 ${urgency === 'CRITICAL' ? 'text-red-100' : urgency === 'WARNING' ? 'text-amber-100' : 'text-blue-100'}`}>{message || 'Transmission payload.'}</p>
                </div>
              ) : (
                <div className="w-full max-w-sm bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${urgency === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : urgency === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {urgency === 'CRITICAL' ? <AlertTriangle size={14} /> : urgency === 'WARNING' ? <Zap size={14} /> : <Info size={14} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white mb-1">{title || 'Alert Subject'}</h4>
                      <p className="text-[10px] text-neutral-400 leading-relaxed font-medium line-clamp-2">{message || 'Alert description.'}</p>
                      <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mt-2 block">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] p-6 shadow-xl flex flex-col h-[400px]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center shrink-0"><Clock size={16} className="mr-2 text-neutral-500" /> Transmission History</h3>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pr-2">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <BellRing className="mx-auto text-neutral-700 mb-3" size={24} />
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No previous history.</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="bg-[#050505] border border-neutral-800 rounded-xl p-4 flex items-start justify-between group">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.type === 'BROADCAST' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-neutral-800 text-neutral-400'}`}>{item.type}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-neutral-700 text-neutral-500`}>{item.target_tier}</span>
                      </div>
                      <span className="text-xs font-black text-white truncate block mb-1">{item.title}</span>
                      <p className="text-[10px] text-neutral-500 font-medium truncate">{item.message}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
