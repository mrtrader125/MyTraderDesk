'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { UploadCloud, Activity, Rocket, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ASSET_CATEGORIES, getAssetCategory } from '@/lib/platformConfig'

export default function DeploySetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    asset_symbol: '',
    category: 'FOREX',
    timeframe: '1H',
    bias: 'NEUTRAL',
    title: '',
    content: ''
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
    }
  }

  // AUTO-CATEGORIZE MAGIC
  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const symbol = e.target.value.toUpperCase();
    const detectedCategory = getAssetCategory(symbol);
    setFormData(prev => ({ ...prev, asset_symbol: symbol, category: detectedCategory }));
  }

  const handleDeploy = async () => {
    if (!file || !formData.asset_symbol) {
      alert("Asset Symbol and Chart Image are strictly required for deployment.")
      return
    }

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('analysis-images').getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('analyses').insert([{
        asset_symbol: formData.asset_symbol.toUpperCase(),
        category: formData.category,
        timeframe: formData.timeframe,
        bias: formData.bias,
        title: formData.title,
        content: formData.content,
        image_url: publicUrl
      }])

      if (dbError) throw dbError
      router.push('/admin/analysis')
    } catch (err) {
      console.error("Deployment Error:", err)
      alert("Failed to deploy intelligence. Check console for details.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={() => router.push('/admin/analysis')} className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
        <ArrowLeft size={14} className="mr-2" /> Back to Arsenal
      </button>

      <div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Deploy <span className="text-brand-primary">Intelligence</span></h2>
        <p className="text-[11px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">Transmit new tactical setups to the operator network</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Asset Target</label>
                <input 
                  type="text" 
                  value={formData.asset_symbol}
                  onChange={handleSymbolChange}
                  placeholder="e.g. XAUUSD"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-sm font-black text-white outline-none focus:border-brand-primary/50 transition-colors uppercase placeholder:normal-case placeholder:font-medium placeholder:text-neutral-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {Object.keys(ASSET_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category.charAt(0) + category.slice(1).toLowerCase()}</option>
                  ))}
                  {/* Additional Premium Tiers */}
                  <option value="FUNDAMENTAL">Fundamental</option>
                  <option value="SENTIMENTAL">Sentimental</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Timeframe</label>
                <input 
                  type="text" 
                  value={formData.timeframe}
                  onChange={(e) => setFormData({...formData, timeframe: e.target.value.toUpperCase()})}
                  placeholder="e.g. 4H, 15M"
                  className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-brand-primary/50 transition-colors uppercase"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-neutral-800/50">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Directional Bias</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFormData({...formData, bias: 'BULLISH'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.bias === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#050505] border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                  <TrendingUp size={16} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Bullish</span>
                </button>
                <button onClick={() => setFormData({...formData, bias: 'NEUTRAL'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.bias === 'NEUTRAL' ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-[#050505] border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                  <Minus size={16} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Neutral</span>
                </button>
                <button onClick={() => setFormData({...formData, bias: 'BEARISH'})} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${formData.bias === 'BEARISH' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-[#050505] border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}>
                  <TrendingDown size={16} className="mb-1" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Bearish</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/50">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Tactical Notes (Optional)</label>
              <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Detail the setup logic, entry triggers, or invalidation levels..." className="w-full h-24 bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-medium text-white outline-none focus:border-brand-primary/50 transition-colors resize-none" />
            </div>
          </div>

          <div className="flex flex-col h-full">
            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-2 block">Chart Image Capture</label>
            <div className="flex-1 min-h-[300px] relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className={`absolute inset-0 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${previewUrl ? 'border-brand-primary/50 bg-[#050505]' : 'border-neutral-800 bg-[#050505] hover:border-neutral-600 hover:bg-neutral-900/50'}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2 rounded-[1.5rem]" style={{ imageRendering: 'high-quality' }} />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800 shadow-inner">
                      <UploadCloud size={24} className="text-brand-primary" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Upload Intel</h4>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                      Drag and drop your TradingView screenshot here, or click to browse.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end">
          <button onClick={handleDeploy} disabled={loading || !file || !formData.asset_symbol} className="flex items-center px-10 py-4 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-all shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.4)] disabled:opacity-50 disabled:cursor-not-allowed group">
            {loading ? <Activity className="animate-spin mr-3" size={18} /> : <Rocket className="mr-3 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={18} />}
            {loading ? 'Transmitting Data...' : 'Deploy to Network'}
          </button>
        </div>
      </div>
    </div>
  )
}
