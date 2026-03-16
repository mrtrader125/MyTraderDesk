'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Star, Clock, MoreVertical, Trash2, CheckCircle2 } from 'lucide-react'

export default function AdminAnalysesPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyses()
  }, [])

  async function fetchAnalyses() {
    const { data } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })
    if (data) setAnalyses(data)
    setLoading(false)
  }

  const setFeatured = async (id: string, days: number) => {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + days)

    const { error } = await supabase
      .from('analyses')
      .update({ is_featured: true, featured_until: expirationDate.toISOString() })
      .eq('id', id)

    if (!error) {
      alert(`Setup featured for ${days} days.`)
      fetchAnalyses()
    }
    setActiveDropdown(null)
  }

  const removeFeatured = async (id: string) => {
    const { error } = await supabase
      .from('analyses')
      .update({ is_featured: false, featured_until: null })
      .eq('id', id)

    if (!error) fetchAnalyses()
    setActiveDropdown(null)
  }

  const filteredAnalyses = analyses.filter(a => 
    a.asset_symbol.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="h-[80vh] flex items-center justify-center text-blue-500 text-[10px] font-medium tracking-[0.4em] uppercase animate-pulse">Loading_Intelligence_Database...</div>

  return (
    <div className="max-w-[1400px] mx-auto p-6 md:p-12 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border transition-colors duration-700 pb-8">
        <div>
          <h1 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic mb-2">Admin_Control</h1>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Intelligence Manager</h2>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset symbol..." 
            className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      <div className="bg-card-bg transition-colors duration-700 border border-card-border transition-colors duration-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-card-border transition-colors duration-700">
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Setup preview</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Asset & Timeframe</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Feature Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredAnalyses.map((item) => {
                const isFeatured = item.is_featured && new Date(item.featured_until) > new Date()
                
                return (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 w-32">
                    <div className="w-20 h-14 bg-black border border-white/10 rounded-lg overflow-hidden shrink-0">
                       <img src={item.image_url} className="w-full h-full object-cover opacity-70" />
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-[15px] font-semibold text-white tracking-tight">{item.asset_symbol}</p>
                    <div className="flex items-center space-x-2 mt-1 text-neutral-500">
                      <Clock size={12} />
                      <span className="text-[11px] font-medium">{item.timeframe}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    {isFeatured ? (
                      <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Star size={12} className="fill-amber-500" />
                        <span>Featured until {new Date(item.featured_until).toLocaleDateString()}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 bg-white/[0.05] text-neutral-400 border border-white/10 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        <span>Standard</span>
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                      className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === item.id && (
                      <div className="absolute right-8 top-12 w-48 bg-[#13141b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-2 text-[9px] font-black text-neutral-500 uppercase tracking-widest border-b border-card-border transition-colors duration-700 mb-1">Set Featured Duration</div>
                        <button onClick={() => setFeatured(item.id, 1)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 hover:text-white transition-colors">1 Day</button>
                        <button onClick={() => setFeatured(item.id, 3)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 hover:text-white transition-colors">3 Days</button>
                        <button onClick={() => setFeatured(item.id, 7)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/5 hover:text-white transition-colors">7 Days</button>
                        {isFeatured && (
                           <button onClick={() => removeFeatured(item.id)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors border-t border-card-border transition-colors duration-700 mt-1">Remove Featured Status</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

