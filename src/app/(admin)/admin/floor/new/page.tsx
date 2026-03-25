'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Shield, Target, Zap, Edit3, Trash2, X, Save, Clock, Activity } from 'lucide-react'

export default function ManageFloorPage() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const [activeTab, setActiveTab] = useState<'terminal' | 'squawk'>('terminal')
  const [loading, setLoading] = useState(true)

  // --- DATA STATE ---
  const [terminalPosts, setTerminalPosts] = useState<any[]>([])
  const [squawks, setSquawks] = useState<any[]>([])

  // --- EDIT STATE ---
  const [editingTerminal, setEditingTerminal] = useState<any | null>(null)
  const [editingSquawk, setEditingSquawk] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [supabase])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch recent terminal posts
      const { data: postsData } = await supabase
        .from('terminal_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (postsData) setTerminalPosts(postsData)

      // Fetch recent squawks
      const { data: squawkData } = await supabase
        .from('live_squawk')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (squawkData) setSquawks(squawkData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // DELETE HANDLERS
  // ==========================================
  const handleDeleteTerminal = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this terminal setup?')) return
    
    try {
      const { error } = await supabase.from('terminal_posts').delete().eq('id', id)
      if (error) throw error
      setTerminalPosts(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      alert(`Error deleting post: ${error.message}`)
    }
  }

  const handleDeleteSquawk = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this squawk alert?')) return
    
    try {
      const { error } = await supabase.from('live_squawk').delete().eq('id', id)
      if (error) throw error
      setSquawks(prev => prev.filter(s => s.id !== id))
    } catch (error: any) {
      alert(`Error deleting squawk: ${error.message}`)
    }
  }

  // ==========================================
  // UPDATE HANDLERS
  // ==========================================
  const handleUpdateTerminal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTerminal) return
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('terminal_posts')
        .update({
          ticker: editingTerminal.ticker.toUpperCase(),
          timeframe: editingTerminal.timeframe,
          thesis: editingTerminal.thesis,
          tier_access: editingTerminal.tier_access
        })
        .eq('id', editingTerminal.id)

      if (error) throw error
      
      // Update local state so UI reflects instantly
      setTerminalPosts(prev => prev.map(p => p.id === editingTerminal.id ? editingTerminal : p))
      setEditingTerminal(null)
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateSquawk = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSquawk) return
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('live_squawk')
        .update({
          tag: editingSquawk.tag,
          message: editingSquawk.message
        })
        .eq('id', editingSquawk.id)

      if (error) throw error
      
      // Update local state
      setSquawks(prev => prev.map(s => s.id === editingSquawk.id ? editingSquawk : s))
      setEditingSquawk(null)
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-6 font-sans relative">
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="mb-6 pb-4 border-b border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight uppercase">
              <Shield className="text-blue-500 w-5 h-5" /> Sentinel Command
            </h1>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">
              Active Floor Management
            </p>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex bg-[#111] border border-neutral-800 rounded-lg p-1 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'terminal' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
            >
              <Target size={14} /> Terminal Posts
            </button>
            <button 
              onClick={() => setActiveTab('squawk')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'squawk' ? 'bg-amber-500 text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
            >
              <Zap size={14} /> Live Squawks
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Activity className="w-8 h-8 text-neutral-600 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Loading Floor Data...</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-2xl overflow-hidden">
            
            {/* ========================================== */}
            {/* TERMINAL POSTS TABLE                       */}
            {/* ========================================== */}
            {activeTab === 'terminal' && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d0d0d] border-b border-neutral-900">
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest w-[120px]">Time</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest w-[100px]">Asset</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest min-w-[300px]">Thesis Snippet</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest w-[100px]">Tier</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {terminalPosts.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-xs text-neutral-600 font-bold uppercase tracking-widest">No Terminal Posts Active</td></tr>
                    )}
                    {terminalPosts.map(post => (
                      <tr key={post.id} className="hover:bg-[#111] transition-colors group">
                        <td className="px-4 py-3 text-[10px] text-neutral-500 font-bold tracking-widest">
                          {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-400 tracking-widest">{post.ticker}</span>
                            <span className="text-[8px] text-neutral-500 bg-neutral-900 px-1 py-0.5 rounded uppercase">{post.timeframe}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-300 truncate max-w-[300px]">
                          {post.thesis}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded ${post.tier_access === 'pro' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-400'}`}>
                            {post.tier_access}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingTerminal(post)} className="p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteTerminal(post.id)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ========================================== */}
            {/* LIVE SQUAWKS TABLE                         */}
            {/* ========================================== */}
            {activeTab === 'squawk' && (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d0d0d] border-b border-neutral-900">
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest w-[120px]">Time</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest w-[150px]">Tag</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest min-w-[300px]">Message</th>
                      <th className="px-4 py-3 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {squawks.length === 0 && (
                      <tr><td colSpan={4} className="py-8 text-center text-xs text-neutral-600 font-bold uppercase tracking-widest">No Squawks Active</td></tr>
                    )}
                    {squawks.map(squawk => (
                      <tr key={squawk.id} className="hover:bg-[#111] transition-colors group">
                        <td className="px-4 py-3 text-[10px] text-neutral-500 font-bold tracking-widest">
                          {new Date(squawk.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          {squawk.tag ? (
                            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded uppercase tracking-widest">
                              {squawk.tag}
                            </span>
                          ) : (
                            <span className="text-[9px] text-neutral-600 uppercase tracking-widest">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-300">
                          {squawk.message}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingSquawk(squawk)} className="p-1.5 text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteSquawk(squawk.id)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* TERMINAL EDIT MODAL                        */}
      {/* ========================================== */}
      {editingTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingTerminal(null)}></div>
          <div className="relative w-full max-w-xl bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Target className="text-blue-500 w-4 h-4" /> Edit Terminal Post
              </h2>
              <button onClick={() => setEditingTerminal(null)} className="text-neutral-500 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateTerminal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Ticker</label>
                  <input 
                    type="text" 
                    value={editingTerminal.ticker}
                    onChange={(e) => setEditingTerminal({...editingTerminal, ticker: e.target.value})}
                    className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Timeframe</label>
                  <input 
                    type="text" 
                    value={editingTerminal.timeframe}
                    onChange={(e) => setEditingTerminal({...editingTerminal, timeframe: e.target.value})}
                    className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Execution Thesis (Text Only)</label>
                <textarea 
                  value={editingTerminal.thesis}
                  onChange={(e) => setEditingTerminal({...editingTerminal, thesis: e.target.value})}
                  className="w-full h-32 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none custom-scrollbar resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Access Tier</label>
                <select 
                  value={editingTerminal.tier_access}
                  onChange={(e) => setEditingTerminal({...editingTerminal, tier_access: e.target.value})}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option value="essential">Essential</option>
                  <option value="pro">Pro Only</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 mt-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SQUAWK EDIT MODAL                          */}
      {/* ========================================== */}
      {editingSquawk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingSquawk(null)}></div>
          <div className="relative w-full max-w-xl bg-[#0a0a0a] rounded-xl border border-neutral-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Zap className="text-amber-500 w-4 h-4" /> Edit Live Squawk
              </h2>
              <button onClick={() => setEditingSquawk(null)} className="text-neutral-500 hover:text-white"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleUpdateSquawk} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Category Tag</label>
                <input 
                  type="text" 
                  value={editingSquawk.tag || ''}
                  onChange={(e) => setEditingSquawk({...editingSquawk, tag: e.target.value})}
                  className="w-full bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                  placeholder="Leave blank for no tag"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Message</label>
                <textarea 
                  value={editingSquawk.message}
                  onChange={(e) => setEditingSquawk({...editingSquawk, message: e.target.value})}
                  className="w-full h-32 bg-[#111] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none custom-scrollbar resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 mt-4 bg-amber-500 text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Squawk'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
