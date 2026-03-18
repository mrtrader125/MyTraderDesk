'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Activity, TrendingUp, TrendingDown, Clock, Search, ExternalLink, Image as ImageIcon } from 'lucide-react'

export default function AnalysisArsenalPage() {
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
    const confirmed = window.confirm(`Are you sure you want to permanently delete the setup for ${symbol}? This will also remove it from users' Vaults.`)
    if (!confirmed) return

    setSetups(prev => prev.filter(s => s.id !== id)) // Optimistic update
    await supabase.from('analyses').delete().eq('id', id)
  }

  const filteredSetups = setups.filter(s => 
    s.asset_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Loading Arsenal...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Intelligence <span className="text-brand-primary">Arsenal</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Manage active deployments and market setups</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => router.push('/admin/analysis/new')}
            className="flex items-center px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-colors shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] shrink-0"
          >
            <Plus size={16} className="mr-2" /> Deploy Setup
          </button>
        </div>
      </div>

      {/* ARSENAL GRID */}
      {filteredSetups.length === 0 ? (
        <div className="w-full bg-[#0a0a0a] border border-dashed border-neutral-800 rounded-3xl p-16 flex flex-col items-center text-center">
          <ImageIcon size={48} className="text-neutral-700 mb-6" />
          <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">No Intelligence Found</h3>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Your arsenal is empty or no assets match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSetups.map((setup) => {
            const isBull = setup.bias?.toUpperCase() === 'BULLISH'
            const isBear = setup.bias?.toUpperCase() === 'BEARISH'

            return (
              <div key={setup.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl overflow-hidden group hover:border-neutral-600 transition-colors shadow-lg flex flex-col">
                
               {/* Image Preview - HIGH QUALITY */}
                <div className="h-48 w-full bg-black relative overflow-hidden border-b border-neutral-800/50">
                  {setup.image_url ? (
                    <>
                      <img 
                        src={setup.image_url} 
                        alt={setup.asset_symbol} 
                        className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" 
                        style={{ imageRendering: 'high-quality' }}
                      />
                      {/* Sleek Gradient Overlay for Text Readability instead of dimming the whole image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent opacity-80 pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-800"><ImageIcon size={40} /></div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-[#0a0a0a]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                      {setup.category}
                    </span>
                    <span className="bg-[#0a0a0a]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                      {setup.timeframe}
                    </span>
                  </div>

                  <div className={`absolute bottom-3 right-3 p-1.5 rounded-lg backdrop-blur-md border shadow-lg ${isBull ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : isBear ? 'bg-red-500/20 border-red-500/30 text-red-500' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'}`}>
                    {isBull ? <TrendingUp size={16} /> : isBear ? <TrendingDown size={16} /> : <Minus size={16} />}
                  </div>
                </div>

                {/* Details & Controls */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter">{setup.asset_symbol}</h3>
                      <div className="flex items-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                        <Clock size={10} className="mr-1.5" /> 
                        {new Date(setup.created_at).toLocaleDateString()} at {new Date(setup.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-medium text-neutral-400 line-clamp-2 leading-relaxed flex-1 mb-5">
                    {setup.title || setup.content || "No tactical notes provided."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                    <button 
                      onClick={() => window.open(`/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}`, '_blank')}
                      className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center hover:text-white transition-colors"
                    >
                      <ExternalLink size={12} className="mr-1.5" /> View Live
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(setup.id, setup.asset_symbol)}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-lg transition-all"
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
      )}
    </div>
  )
}
