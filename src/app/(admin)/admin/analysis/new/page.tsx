'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    asset_symbol: '',
    timeframe: 'D',
    bias: 'BULLISH',
    content: ''
  })

  const timeframes = ['M', 'W', 'D', '4hr', '1hr', '30mins', '15mins', '5mins']

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert("You must upload a chart image.")
    setLoading(true)

    try {
      // 1. Upload to Supabase Storage Bucket 'analysis-images'
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analysis-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get the Public URL for that image
      const { data: { publicUrl } } = supabase.storage
        .from('analysis-images')
        .getPublicUrl(fileName)

      // 3. Store the record in the 'analyses' database table
      const { error: dbError } = await supabase.from('analyses').insert([{
        asset_symbol: formData.asset_symbol.toUpperCase(),
        timeframe: formData.timeframe,
        bias: formData.bias,
        title: formData.title,
        content: formData.content,
        image_url: publicUrl,
        status: 'LIVE'
      }])

      if (dbError) throw dbError

      router.push('/admin/analysis')
      router.refresh()
    } catch (error: any) {
      console.error("Deployment Error:", error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link href="/admin/analysis" className="flex items-center text-neutral-500 hover:text-red-500 mb-8 font-black uppercase text-[10px] tracking-[0.3em] transition-colors">
        <ArrowLeft size={14} className="mr-2" /> Abort Deployment
      </Link>

      <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic mb-12">New <span className="text-red-600">Intelligence</span></h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SIDEBAR: METADATA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a0a0f] border border-card-border transition-colors duration-700 p-8 rounded-[40px] shadow-2xl">
            <div className="mb-8">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-3 block">Instrument</label>
              <input 
                required
                placeholder="XAUUSD"
                className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-white font-black uppercase text-xl focus:border-red-600/50 outline-none transition-all"
                value={formData.asset_symbol}
                onChange={e => setFormData({...formData, asset_symbol: e.target.value})}
              />
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-3 block">Timeframe Selection</label>
              <div className="grid grid-cols-4 gap-2">
                {timeframes.map(tf => (
                  <button 
                    key={tf} type="button"
                    onClick={() => setFormData({...formData, timeframe: tf})}
                    className={`py-3 text-[10px] font-black rounded-xl border transition-all ${formData.timeframe === tf ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-white/10 text-neutral-500 hover:text-white'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-3 block">Bias Direction</label>
              <div className="flex gap-2">
                {['BULLISH', 'BEARISH', 'NEUTRAL'].map(b => (
                  <button
                    key={b} type="button"
                    onClick={() => setFormData({...formData, bias: b})}
                    className={`flex-1 py-4 text-[10px] font-black rounded-xl border transition-all ${
                      formData.bias === b 
                        ? (b === 'BULLISH' ? 'bg-green-600 border-green-600 text-white' : b === 'BEARISH' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-white text-black') 
                        : 'bg-black border-white/10 text-neutral-500'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN: CONTENT & UPLOAD */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#0a0a0f] border border-card-border transition-colors duration-700 p-8 rounded-[40px] shadow-2xl">
             <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-4 block text-center">Drag & Drop Chart Intelligence</label>
             <div className="relative aspect-video bg-black border-2 border-dashed border-card-border transition-colors duration-700 rounded-3xl overflow-hidden group hover:border-red-600/30 transition-all">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-700">
                    <Upload size={48} strokeWidth={1} className="mb-4 group-hover:text-red-600 transition-colors" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Select Analysis Frame</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
             </div>

             <div className="mt-10 space-y-6">
               <input 
                required
                placeholder="The Main Thesis Headline..."
                className="w-full bg-black border-b border-white/10 py-6 text-3xl font-black text-white focus:border-red-600 outline-none transition-all placeholder:text-neutral-800 italic"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <textarea 
                rows={6}
                placeholder="Full technical justification and operational notes..."
                className="w-full bg-black border border-card-border transition-colors duration-700 rounded-2xl p-6 text-neutral-400 font-medium focus:border-red-600/30 outline-none transition-all italic"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
             </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 py-8 rounded-[30px] text-white font-black uppercase tracking-[0.5em] text-sm shadow-[0_20px_50px_rgba(220,38,38,0.2)] flex items-center justify-center disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mr-3" /> : <CheckCircle className="mr-3" size={20} />}
            {loading ? 'Transmitting Data...' : 'Confirm & Deploy to Desk'}
          </button>
        </div>
      </form>
    </div>
  )
}

