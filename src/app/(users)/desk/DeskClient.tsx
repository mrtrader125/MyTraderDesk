// src/app/(users)/desk/DeskClient.tsx
"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'

// Adjust this interface if you added more columns to user_desk_analyses
interface DeskAnalysis {
  id: string
  asset_symbol: string
  timeframe: string
  bias: string
  image_url: string
  notes: string
  created_at: string
}

export default function DeskClient({ userId }: { userId: string }) {
  const [analyses, setAnalyses] = useState<DeskAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  // Form State
  const [symbol, setSymbol] = useState('')
  const [timeframe, setTimeframe] = useState('1H')
  const [bias, setBias] = useState('LONG')
  const [notes, setNotes] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('user_desk_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setAnalyses(data)
    setIsLoading(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !symbol) return

    setIsUploading(true)
    try {
      // 1. Upload Image to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('user-desk-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user-desk-images')
        .getPublicUrl(fileName)

      // 2. Save Record to Database
      const { error: dbError } = await supabase
        .from('user_desk_analyses')
        .insert({
          user_id: userId,
          asset_symbol: symbol.toUpperCase(),
          timeframe,
          bias,
          notes,
          image_url: publicUrl
        })

      if (dbError) throw dbError

      // 3. Reset Form & Refresh List
      setFile(null)
      setSymbol('')
      setNotes('')
      fetchAnalyses()
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload analysis. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this setup?")) return

    // Extract filepath from public URL to delete from storage
    const pathParts = imageUrl.split('/user-desk-images/')
    if (pathParts.length === 2) {
      await supabase.storage.from('user-desk-images').remove([pathParts[1]])
    }

    await supabase.from('user_desk_analyses').delete().eq('id', id)
    setAnalyses(analyses.filter(a => a.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Upload Form */}
      <div className="lg:col-span-1">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> New Setup
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Asset Symbol</label>
              <input 
                type="text" 
                placeholder="e.g. XAUUSD" 
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Timeframe</label>
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option>15m</option>
                  <option>1H</option>
                  <option>4H</option>
                  <option>Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bias</label>
                <select 
                  value={bias}
                  onChange={(e) => setBias(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option>LONG</option>
                  <option>SHORT</option>
                  <option>NEUTRAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Thesis / Notes</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Market structure shift, liquidity sweep..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Chart Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-400">
                    {file ? file.name : "Click to upload chart"}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Setup"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: The Desk Gallery */}
      <div className="lg:col-span-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-900/30 border border-slate-800/50 rounded-xl border-dashed">
            <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">Your desk is empty.</p>
            <p className="text-sm text-slate-500">Log your first setup to start building your database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
                <div className="relative h-48 bg-slate-950">
                  <img 
                    src={analysis.image_url} 
                    alt={analysis.asset_symbol} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded bg-slate-900/80 backdrop-blur ${
                      analysis.bias === 'LONG' ? 'text-emerald-400' : analysis.bias === 'SHORT' ? 'text-red-400' : 'text-slate-300'
                    }`}>
                      {analysis.bias}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">{analysis.asset_symbol}</h3>
                      <p className="text-xs text-slate-400">{analysis.timeframe} • {new Date(analysis.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(analysis.id, analysis.image_url)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {analysis.notes && (
                    <p className="text-sm text-slate-400 mt-3 line-clamp-2">{analysis.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}