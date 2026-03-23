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
  Radio 
} from 'lucide-react'

export default function AdminAnalysisPage() {
  const router = useRouter()
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleDelete = async (id: string, symbol: string) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete the setup for ${symbol}?`)
    if (!confirmed) return

    setSetups(prev => prev.filter(s => s.id !== id)) 
    await supabase.from('analyses').delete().eq('id', id)
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

        return (
          <div key={setup.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden group hover:border-neutral-600 transition-colors shadow-lg flex flex-col">
            
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

              <div className="flex items-center gap-2 mt-auto">
                <button 
                  onClick={() => router.push(`/admin/analysis/viewport?id=${setup.id}`)}
                  className="flex-1 py-2 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-primary hover:text-black transition-colors flex items-center justify-center"
                >
                  <ExternalLink size={10} className="mr-1.5" /> Inspect
                </button>
                
                <button 
                  onClick={() => router.push(`/admin/analysis/${setup.id}/edit`)}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 bg-neutral-900 border border-neutral-800 rounded-lg transition-all"
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
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
    </div>
  )
}
