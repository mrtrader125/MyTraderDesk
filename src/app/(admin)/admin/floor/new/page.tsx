'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Activity, CheckCircle2, MessageSquare, Trash2, Edit2, X } from 'lucide-react'

export default function AdminFloorBroadcast() {
  // --- POLL STATE ---
  const [pollAsset, setPollAsset] = useState('')
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollStatus, setPollStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [editingPollId, setEditingPollId] = useState<string | null>(null)
  const [activePoll, setActivePoll] = useState<any>(null)

  // --- CHATTER STATE ---
  const [chatAsset, setChatAsset] = useState('')
  const [chatTopic, setChatTopic] = useState('')
  const [chatBias, setChatBias] = useState('NEUTRAL')
  const [chatStatus, setChatStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [recentChats, setRecentChats] = useState<any[]>([])

  // --- FETCH EXISTING DATA ---
  const fetchData = async () => {
    // Get Active Poll
    const { data: pollData } = await supabase.from('desk_polls').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).single()
    setActivePoll(pollData || null)

    // Get Recent Chatter
    const { data: chatData } = await supabase.from('desk_discussions').select('*').order('created_at', { ascending: false }).limit(5)
    setRecentChats(chatData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ==========================================
  // 1. POLL HANDLERS
  // ==========================================
  const handlePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPollStatus('loading')

    if (editingPollId) {
      // UPDATE EXISTING
      const { error } = await supabase.from('desk_polls').update({ asset: pollAsset.toUpperCase(), question: pollQuestion }).eq('id', editingPollId)
      if (!error) resetPollForm()
      else alert("Failed to update poll.")
    } else {
      // CREATE NEW
      await supabase.from('desk_polls').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      const { error } = await supabase.from('desk_polls').insert([{ asset: pollAsset.toUpperCase(), question: pollQuestion, is_active: true }])
      if (!error) resetPollForm()
      else alert("Failed to broadcast poll.")
    }
  }

  const handleDeletePoll = async (id: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return
    await supabase.from('desk_polls').delete().eq('id', id)
    fetchData()
  }

  const handleEditPoll = (poll: any) => {
    setEditingPollId(poll.id)
    setPollAsset(poll.asset)
    setPollQuestion(poll.question)
  }

  const resetPollForm = () => {
    setPollStatus('success')
    setPollAsset('')
    setPollQuestion('')
    setEditingPollId(null)
    fetchData()
    setTimeout(() => setPollStatus('idle'), 3000)
  }

  // ==========================================
  // 2. CHATTER HANDLERS
  // ==========================================
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChatStatus('loading')

    if (editingChatId) {
      // UPDATE EXISTING
      const { error } = await supabase.from('desk_discussions').update({ asset: chatAsset.toUpperCase(), topic: chatTopic, bias: chatBias }).eq('id', editingChatId)
      if (!error) resetChatForm()
      else alert("Failed to update chatter.")
    } else {
      // CREATE NEW
      const { error } = await supabase.from('desk_discussions').insert([{ asset: chatAsset.toUpperCase(), topic: chatTopic, bias: chatBias }])
      if (!error) resetChatForm()
      else alert("Failed to post chatter.")
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return
    await supabase.from('desk_discussions').delete().eq('id', id)
    fetchData()
  }

  const handleEditChat = (chat: any) => {
    setEditingChatId(chat.id)
    setChatAsset(chat.asset)
    setChatTopic(chat.topic)
    setChatBias(chat.bias)
  }

  const resetChatForm = () => {
    setChatStatus('success')
    setChatAsset('')
    setChatTopic('')
    setChatBias('NEUTRAL')
    setEditingChatId(null)
    fetchData()
    setTimeout(() => setChatStatus('idle'), 3000)
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
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-1">Control, edit, and moderate the live community feeds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT: DAILY POLL MANAGEMENT --- */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase flex items-center tracking-tight">
                <Activity size={18} className="mr-3 text-blue-500" /> 1. Daily Bias Poll
              </h2>
              {editingPollId && (
                <button onClick={resetPollForm} className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center hover:text-red-400">
                  <X size={14} className="mr-1" /> Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handlePollSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Asset Symbol</label>
                <input required type="text" value={pollAsset} onChange={(e) => setPollAsset(e.target.value)} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 uppercase" placeholder="e.g., DXY" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Poll Question</label>
                <textarea required value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} rows={3} className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500" placeholder="e.g., What is your bias?" />
              </div>
              <button type="submit" disabled={pollStatus === 'loading'} className={`w-full py-4 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-colors flex items-center justify-center ${editingPollId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                {pollStatus === 'loading' ? 'Processing...' : <><Send size={18} className="mr-2" /> {editingPollId ? 'Update Poll' : 'Launch New Poll'}</>}
              </button>
              {pollStatus === 'success' && <div className="text-emerald-500 text-xs font-bold flex items-center justify-center"><CheckCircle2 className="mr-2" size={14} /> Success</div>}
            </form>
          </div>

          {/* Active Poll Display */}
          {activePoll && (
            <div className="bg-[#111] border border-blue-500/20 rounded-2xl p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">Currently Active Poll</h3>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black bg-white/10 px-2 py-1 rounded uppercase">{activePoll.asset}</span>
                  <p className="text-sm text-neutral-300 mt-2 font-medium">{activePoll.question}</p>
                </div>
                <div className="flex space-x-2 shrink-0 ml-4">
                  <button onClick={() => handleEditPoll(activePoll)} className="p-2 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-500 rounded-lg transition-colors text-neutral-400"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeletePoll(activePoll.id)} className="p-2 bg-neutral-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-neutral-400"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT: CHATTER FEED MANAGEMENT --- */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase flex items-center tracking-tight">
                <MessageSquare size={18} className="mr-3 text-emerald-500" /> 2. Post Floor Chatter
              </h2>
              {editingChatId && (
                <button onClick={resetChatForm} className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center hover:text-red-400">
                  <X size={14} className="mr-1" /> Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="space-y-5">
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
              <button type="submit" disabled={chatStatus === 'loading'} className={`w-full py-4 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-colors flex items-center justify-center ${editingChatId ? 'bg-amber-500 hover:bg-amber-400' : 'bg-white hover:bg-neutral-200'}`}>
                {chatStatus === 'loading' ? 'Processing...' : <><Send size={18} className="mr-2" /> {editingChatId ? 'Update Chatter' : 'Push to History'}</>}
              </button>
              {chatStatus === 'success' && <div className="text-emerald-500 text-xs font-bold flex items-center justify-center"><CheckCircle2 className="mr-2" size={14} /> Success</div>}
            </form>
          </div>

          {/* Recent Chatter List */}
          <div className="bg-[#111] border border-neutral-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4">Manage Recent Feed</h3>
            {recentChats.map((chat) => (
              <div key={chat.id} className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <div className="overflow-hidden pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[9px] font-black uppercase bg-white/10 px-1.5 py-0.5 rounded text-white">{chat.asset}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${chat.bias === 'BULLISH' ? 'text-emerald-500' : chat.bias === 'BEARISH' ? 'text-red-500' : 'text-neutral-500'}`}>{chat.bias}</span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate">{chat.topic}</p>
                </div>
                <div className="flex space-x-1 shrink-0">
                  <button onClick={() => handleEditChat(chat)} className="p-2 hover:bg-amber-500/20 hover:text-amber-500 rounded-lg transition-colors text-neutral-500"><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteChat(chat.id)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-neutral-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {recentChats.length === 0 && <p className="text-xs text-neutral-600 text-center py-4">No recent chatter found.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
