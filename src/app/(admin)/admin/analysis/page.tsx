'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Trash2, Edit2, Activity, TrendingUp, TrendingDown, 
  Clock, Search, ExternalLink, Image as ImageIcon, Minus, 
  Target, CheckCircle2, XCircle, AlertCircle, LayoutList
} from 'lucide-react'

export default function AdminAnalysisPage() {
  const router = useRouter()
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null)
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; actionText: string;
    actionType: 'danger' | 'prime'; onConfirm: () => void;
  }>({
    isOpen: false, title: '', message: '', actionText: '', actionType: 'prime', onConfirm: () => {}
  })

  useEffect(() => {
    fetchSetups()
  }, [])

  async function fetchSetups() {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setSetups(data)
      if (data.length > 0) setSelectedSetupId(data[0].id) // Auto-select the first item
    }
    setLoading(false)
  }

  const handleDelete = (id: string, symbol: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Setup',
      message: `Are you sure you want to permanently delete the setup for ${symbol}?`,
      actionText: 'Delete Asset',
      actionType: 'danger',
      onConfirm: async () => {
        setSetups(prev => prev.filter(s => s.id !== id)) 
        if (selectedSetupId === id) setSelectedSetupId(null)
        await supabase.from('analyses').delete().eq('id', id)
      }
    })
  }

  const togglePrimeStatus = (id: string, symbol: string, currentStatus: boolean) => {
    const action = currentStatus ? "remove" : "mark";
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Remove Prime' : 'Mark as Prime',
      message: `Are you sure you want to ${action} ${symbol} as a Prime setup?`,
      actionText: currentStatus ? 'Remove Prime' : 'Confirm Prime',
      actionType: 'prime',
      onConfirm: async () => {
        setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: !currentStatus } : s));
        const { error } = await supabase.from('analyses').update({ is_featured: !currentStatus }).eq('id', id);
        if (error) {
          setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: currentStatus } : s));
          alert("Failed to update status.");
        }
      }
    })
  }

  // 🚨 NEW: Rapid Status Updater
  const updateSetupStatus = async (id: string, newStatus: string) => {
    // Optimistic UI Update
    setSetups(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    
    // DB Update
    const { error } = await supabase.from('analyses').update({ status: newStatus }).eq('id', id)
    if (error) {
      alert("Failed to update status. Please make sure you added the 'status' column to your Supabase table.")
      fetchSetups() // revert on fail
    }
  }

  const filteredSetups = setups.filter(s => 
    (s.asset_symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSetup = setups.find(s => s.id === selectedSetupId)

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-blue-500" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Loading Setups...</span>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-500 relative flex flex-col h-[calc(100vh-100px)]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Market <span className="text-blue-500">Setups</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Rapid review & status management</p>
        </div>

        <button 
          onClick={() => router.push('/admin/analysis/new')}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-colors shadow-lg shrink-0"
        >
          <Plus size={14} className="mr-2" /> Publish Setup
        </button>
      </div>

      {/* SPLIT SCREEN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: INBOX LIST */}
        <div className="w-full lg:w-1/3 bg-[#0a0a0a] border border-neutral-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl shrink-0">
          <div className="p-4 border-b border-neutral-800 bg-[#0d0d0d]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#050505] border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-white placeholder:text-neutral-600 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredSetups.length === 0 ? (
              <div className="text-center py-10 text-neutral-600 flex flex-col items-center">
                <LayoutList size={24} className="mb-2 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">No setups found</span>
              </div>
            ) : (
              filteredSetups.map((setup) => {
                const isSelected = selectedSetupId === setup.id
                const status = (setup.status || 'WAITING').toUpperCase()
                
                let statusColor = "text-neutral-500 bg-neutral-900"
                if (status === 'ACTIVE') statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                if (status === 'WAITING') statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20"
                if (status === 'INVALID') statusColor = "text-red-500 bg-red-500/10 border-red-500/20"

                return (
                  <div 
                    key={setup.id}
                    onClick={() => setSelectedSetupId(setup.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-blue-400' : 'text-white'}`}>{setup.asset_symbol}</span>
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{setup.timeframe}</span>
                      </div>
                      <div className="text-[9px] text-neutral-600 font-medium">
                        {new Date(setup.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${statusColor}`}>
                      {status}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: VIEWPORT & CONTROLS */}
        <div className="w-full lg:w-2/3 bg-[#0a0a0a] border border-neutral-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
          {selectedSetup ? (
            <>
              {/* TOP: Image Viewer */}
              <div className="h-[45%] lg:h-[55%] w-full bg-black relative border-b border-neutral-800/50 flex items-center justify-center overflow-hidden group">
                {selectedSetup.image_url ? (
                  <img src={selectedSetup.image_url} alt="Chart" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="text-neutral-800 w-16 h-16" />
                )}
                
                {/* Image overlay actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => window.open(selectedSetup.image_url, '_blank')} className="bg-black/80 backdrop-blur text-white p-2 rounded-lg hover:bg-blue-600 transition-colors" title="Full Screen">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* BOTTOM: Details & Status Controls */}
              <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-1">{selectedSetup.asset_symbol}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-black uppercase tracking-widest">{selectedSetup.timeframe}</span>
                      <span className="px-2 py-0.5 bg-[#111] text-neutral-400 border border-neutral-800 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        {selectedSetup.bias?.toUpperCase() === 'BULLISH' ? <TrendingUp size={10} className="text-emerald-500"/> : selectedSetup.bias?.toUpperCase() === 'BEARISH' ? <TrendingDown size={10} className="text-red-500"/> : <Minus size={10} />}
                        {selectedSetup.bias || 'NEUTRAL'}
                      </span>
                    </div>
                  </div>
                  
                  {/* EDIT & DELETE */}
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/admin/analysis/${selectedSetup.id}/edit`)} className="p-2 bg-[#111] text-neutral-400 hover:text-white rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(selectedSetup.id, selectedSetup.asset_symbol)} className="p-2 bg-[#111] text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-neutral-800 hover:border-red-500/50 transition-all"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-medium text-neutral-300 leading-relaxed whitespace-pre-wrap bg-[#111] p-4 rounded-xl border border-neutral-800/50">
                    {selectedSetup.content || selectedSetup.title || "No analysis notes provided."}
                  </p>
                </div>

                {/* 🚨 THE STATUS CONTROLS 🚨 */}
                <div className="mt-auto">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Set Live Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    
                    <button 
                      onClick={() => updateSetupStatus(selectedSetup.id, 'ACTIVE')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        (selectedSetup.status || '').toUpperCase() === 'ACTIVE' 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                          : 'bg-[#111] border-neutral-800 text-neutral-500 hover:border-emerald-500/30 hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 size={20} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </button>

                    <button 
                      onClick={() => updateSetupStatus(selectedSetup.id, 'WAITING')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        (selectedSetup.status || 'WAITING').toUpperCase() === 'WAITING' 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                          : 'bg-[#111] border-neutral-800 text-neutral-500 hover:border-amber-500/30 hover:text-amber-400'
                      }`}
                    >
                      <Clock size={20} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Waiting</span>
                    </button>

                    <button 
                      onClick={() => updateSetupStatus(selectedSetup.id, 'INVALID')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        (selectedSetup.status || '').toUpperCase() === 'INVALID' 
                          ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                          : 'bg-[#111] border-neutral-800 text-neutral-500 hover:border-red-500/30 hover:text-red-400'
                      }`}
                    >
                      <XCircle size={20} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Invalid</span>
                    </button>

                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 p-8 text-center">
              <Target size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest mb-2 text-neutral-400">No Setup Selected</p>
              <p className="text-[10px] uppercase tracking-widest">Select a setup from the list on the left to review and manage its status.</p>
            </div>
          )}
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col">
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{confirmModal.title}</h3>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3 mt-auto">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className={`flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${confirmModal.actionType === 'danger' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black'}`}>
                {confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
