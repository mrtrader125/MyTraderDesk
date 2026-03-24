'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Trash2, 
  Edit2,
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Search, 
  ExternalLink, 
  Image as ImageIcon, 
  Minus, 
  Radio,
  Target
} from 'lucide-react'

export default function AdminAnalysisPage() {
  const router = useRouter()
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // NEW: State for the Custom Cinematic Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionText: string;
    actionType: 'danger' | 'prime';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionText: '',
    actionType: 'prime',
    onConfirm: () => {}
  })

  useEffect(() => {
    fetchSetups()
  }, [])

  async function fetchSetups() {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) setSetups(data)
    setLoading(false)
  }

  // UPDATED: Custom Delete Handler
  const handleDelete = (id: string, symbol: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Setup',
      message: `Are you sure you want to permanently delete the setup for ${symbol}? This action cannot be undone.`,
      actionText: 'Delete Asset',
      actionType: 'danger',
      onConfirm: async () => {
        setSetups(prev => prev.filter(s => s.id !== id)) 
        await supabase.from('analyses').delete().eq('id', id)
      }
    })
  }

  // UPDATED: Custom Prime Toggle Handler
  const togglePrimeStatus = (id: string, symbol: string, currentStatus: boolean) => {
    const action = currentStatus ? "remove" : "mark";
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Remove Prime Status' : 'Mark as Prime',
      message: `Are you sure you want to ${action} ${symbol} as a Prime setup?`,
      actionText: currentStatus ? 'Remove Prime' : 'Confirm Prime',
      actionType: 'prime',
      onConfirm: async () => {
        // Optimistically update UI
        setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: !currentStatus } : s));

        // Update Database
        const { error } = await supabase
          .from('analyses')
          .update({ is_featured: !currentStatus })
          .eq('id', id);

        if (error) {
          // Revert UI if it fails
          setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: currentStatus } : s));
          alert("Failed to update status. Please try again.");
        }
      }
    })
  }

  const filteredSetups = setups.filter(s => 
    (s.asset_symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // TIME-BASED GROUPING LOGIC
  const grouped = { today: [] as any[], yesterday: [] as any[], older: [] as any[] }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  filteredSetups.forEach(setup => {
    const d = new Date(setup.created_at).getTime()
    if (d >= today.getTime()) grouped.today.push(setup)
    else if (d >= yesterday.getTime()) grouped.yesterday.push(setup)
    else grouped.older.push(setup)
  })

  // REUSABLE GRID RENDERER FOR THE GROUPS
  const renderSetupGrid = (setupList: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {setupList.map((setup) => {
        const isBull = setup.bias?.toUpperCase() === 'BULLISH'
        const isBear = setup.bias?.toUpperCase() === 'BEARISH'
        const isPrime = setup.is_featured === true

        return (
          <div key={setup.id} className={`bg-[#0a0a0a] border rounded-3xl overflow-hidden group transition-all shadow-lg flex flex-col ${isPrime ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-neutral-800 hover:border-neutral-600'}`}>
            
            <div className="h-32 w-full bg-black relative overflow-hidden border-b border-neutral-800/50">
              {setup.image_url ? (
                <img 
                  src={setup.image_url} 
                  alt={setup.asset_symbol} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-800"><ImageIcon size={24} /></div>
              )}
              
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className="bg-[#0a0a0a]/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  {setup.category}
                </span>
                <span className="bg-[#0a0a0a]/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  {setup.timeframe}
                </span>
              </div>

              {/* Bias Pill */}
              <div className={`absolute bottom-2 right-2 p-1 rounded-md backdrop-blur-md border shadow-lg ${isBull ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : isBear ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'}`}>
                {isBull ? <TrendingUp size={12} /> : isBear ? <TrendingDown size={12} /> : <Minus size={12} />}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-black text-white tracking-tighter uppercase italic">{setup.asset_symbol}</h3>
                <div className="flex items-center text-[8px] font-bold text-neutral-500 uppercase tracking-widest">
                  <Clock size={8} className="mr-1" /> 
                  {new Date(setup.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              
              <p className="text-[10px] font-medium text-neutral-400 line-clamp-2 flex-1 mb-4">
                {setup.title || setup.content || "No analysis notes."}
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 mt-auto">
                
                {/* PRIME TOGGLE BUTTON */}
                <button 
                  onClick={() => togglePrimeStatus(setup.id, setup.asset_symbol, isPrime)}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center transition-all border
                    ${isPrime 
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500 hover:text-black' 
                      : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10'
                    }
                  `}
                  title={isPrime ? "Remove Prime Status" : "Mark as Prime"}
                >
                  <Target size={12} className="mr-1.5" /> 
                  {isPrime ? 'Unmark Prime' : 'Mark Prime'}
                </button>
                
                {/* Inspect Button */}
                <button 
                  onClick={() => router.push(`/admin/analysis/viewport?id=${setup.id}`)}
                  className="p-2 text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center"
                  title="Inspect Setup"
                >
                  <ExternalLink size={14} />
                </button>
                
                <button 
                  onClick={() => router.push(`/admin/analysis/${setup.id}/edit`)}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-700 bg-neutral-900 border border-neutral-800 rounded-lg transition-all"
                  title="Edit Setup"
                >
                  <Edit2 size={14} />
                </button>

                <button 
                  onClick={() => handleDelete(setup.id, setup.asset_symbol)}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-red-500 hover:border-red-500 bg-neutral-900 border border-neutral-800 rounded-lg transition-all"
                  title="Delete Setup"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Loading Setups...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Market <span className="text-brand-primary">Setups</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Manage published analysis</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0a0a] border border-neutral-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white placeholder:text-neutral-500 outline-none focus:border-brand-primary/50 transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => router.push('/admin/analysis/new')}
            className="flex items-center px-5 py-2.5 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-colors shadow-lg shrink-0"
          >
            <Plus size={14} className="mr-2" /> Publish Setup
          </button>
        </div>
      </div>

      {filteredSetups.length === 0 ? (
        <div className="w-full bg-[#0a0a0a] border border-dashed border-neutral-800 rounded-3xl p-16 flex flex-col items-center text-center">
          <Radio size={48} className="text-neutral-700 mb-6" />
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">No Setups Found</h3>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* TODAY SECTION */}
          {grouped.today.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">
                Published Today <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
              </h2>
              {renderSetupGrid(grouped.today)}
            </section>
          )}

          {/* YESTERDAY SECTION */}
          {grouped.yesterday.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                Yesterday <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
              </h2>
              {renderSetupGrid(grouped.yesterday)}
            </section>
          )}

          {/* OLDER SECTION */}
          {grouped.older.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                Older Setups <div className="ml-4 h-px flex-1 bg-neutral-800/30"></div>
              </h2>
              <div className="opacity-80 hover:opacity-100 transition-opacity">
                {renderSetupGrid(grouped.older)}
              </div>
            </section>
          )}

        </div>
      )}

      {/* NEW: THE CUSTOM CINEMATIC MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200 flex flex-col">
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{confirmModal.title}</h3>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                  confirmModal.actionType === 'danger'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                }`}
              >
                {confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
