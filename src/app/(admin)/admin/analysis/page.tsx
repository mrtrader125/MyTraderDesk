'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Trash2, Clock, Loader2, Plus, Activity, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminAnalysisManager() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase.from('analyses').select('*').order('created_at', { ascending: false })
    if (data) setAnalyses(data)
    setLoading(false)
  }

  async function deleteAnalysis(item: any) {
    const confirmDelete = confirm(`PERMANENTLY WIPE ${item.asset_symbol} ANALYSIS?`)
    if (!confirmDelete) return

    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase
        .from('analyses')
        .delete()
        .eq('id', item.id)

      if (dbError) throw dbError

      // 2. Try to delete from Storage (if URL exists)
      if (item.image_url) {
        const filePath = item.image_url.split('/').pop()
        await supabase.storage
          .from('analysis-images')
          .remove([filePath])
      }

      // 3. Update UI
      setAnalyses(analyses.filter(a => a.id !== item.id))
      alert("Intelligence Wiped Successfully.")
      
    } catch (err: any) {
      console.error(err)
      alert("Error during deletion: " + err.message)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Intelligence <span className="text-red-600">Manager</span></h2>
          <p className="text-neutral-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Registry // {analyses.length} Active Nodes</p>
        </div>
        <Link href="/admin/analysis/new" className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20">
          + Deploy New
        </Link>
      </div>

      <div className="bg-[#0a0a0f] border border-card-border transition-colors duration-700 rounded-[40px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 border-b border-card-border transition-colors duration-700 bg-white/[0.01]">
              <th className="px-10 py-6">Instrument</th>
              <th className="px-10 py-6">TF</th>
              <th className="px-10 py-6">Bias</th>
              <th className="px-10 py-6">Headline</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin text-red-600 mx-auto" /></td></tr>
            ) : analyses.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-neutral-700 font-black uppercase tracking-widest text-xs italic">No Intelligence Records Found</td></tr>
            ) : analyses.map((item) => (
              <tr key={item.id} className="hover:bg-red-600/[0.02] transition-colors group">
                <td className="px-10 py-8 font-black text-white text-xl italic uppercase tracking-tighter">{item.asset_symbol}</td>
                <td className="px-10 py-8"><span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[10px] font-black text-neutral-400">{item.timeframe}</span></td>
                <td className="px-10 py-8">
                  <span className={`text-[10px] font-black px-4 py-2 rounded-lg border ${item.bias === 'BULLISH' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                    {item.bias}
                  </span>
                </td>
                <td className="px-10 py-8 text-neutral-400 font-bold text-sm uppercase truncate max-w-[200px]">{item.title}</td>
                <td className="px-10 py-8 text-right">
                  <button 
                    onClick={() => deleteAnalysis(item)}
                    className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

