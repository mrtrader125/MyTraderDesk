'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  UploadCloud, Activity, Rocket, ArrowLeft, TrendingUp, TrendingDown, Minus,
  CheckCircle2, Shield
} from 'lucide-react'
import { ASSET_CATEGORIES, getAssetCategory } from '@/lib/platformConfig'

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', 'D', 'W', 'M']

export default function PublishSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    asset_symbol: '',
    category: 'FOREX',
    timeframe: '1H',
    bias: 'NEUTRAL',
    status: 'WAITING', // <-- Capturing initial status
    content: ''
  })

  // 🧠 SMART FILENAME PARSER ENGINE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))

      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "")

      const tfMappings = [
        { regex: /\b(?:5\s*MIN(?:UTE)?S?|5m)\b/i, std: '5m' },
        { regex: /\b(?:15\s*MIN(?:UTE)?S?|15m)\b/i, std: '15m' },
        { regex: /\b(?:30\s*MIN(?:UTE)?S?|30m)\b/i, std: '30m' },
        { regex: /\b(?:1\s*MIN(?:UTE)?S?|1m)\b/i, std: '1m' },
        { regex: /\b(?:1\s*H(?:R|OUR)?S?|1h)\b/i, std: '1H' },
        { regex: /\b(?:4\s*H(?:R|OUR)?S?|4h)\b/i, std: '4H' },
        { regex: /\b(?:DAILY|DAY|1D)\b/i, std: 'D' },
        { regex: /\b(?:WEEKLY|WEEK|1W)\b/i, std: 'W' },
        { regex: /\b(?:MONTHLY|MONTH|1M)\b/i, std: 'M' },
        { regex: /\b(?:D)\b/i, std: 'D' },
        { regex: /\b(?:W)\b/i, std: 'W' },
        { regex: /\b(?:M)\b/, std: 'M' }
      ]

      let detectedTf = formData.timeframe
      let stringWithoutTf = nameWithoutExt

      for (const mapping of tfMappings) {
        if (mapping.regex.test(nameWithoutExt)) {
          detectedTf = mapping.std
          stringWithoutTf = nameWithoutExt.replace(mapping.regex, '')
          break
        }
      }

      const tickerMatch = stringWithoutTf.toUpperCase().match(/[A-Z0-9]{2,10}/)
      let detectedTicker = formData.asset_symbol
      let detectedCategory = formData.category

      if (tickerMatch) {
        detectedTicker = tickerMatch[0]
        detectedCategory = getAssetCategory(detectedTicker)
      }

      setFormData(prev => ({
        ...prev,
        asset_symbol: detectedTicker || prev.asset_symbol,
        timeframe: detectedTf,
        category: detectedCategory
      }))
    }
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const symbol = e.target.value.toUpperCase();
    const detectedCategory = getAssetCategory(symbol);
    setFormData(prev => ({ ...prev, asset_symbol: symbol, category: detectedCategory }));
  }

  const handlePublish = async () => {
    if (!file || !formData.asset_symbol) {
      alert("Asset Symbol and Chart Image are strictly required.")
      return
    }

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('analysis-images').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('analysis-images').getPublicUrl(fileName)

      // 🚨 Ensure `status` column exists in `queued_analyses` table to persist this value
      const { error: dbError } = await supabase.from('queued_analyses').insert([{
        asset_symbol: formData.asset_symbol.toUpperCase(),
        category: formData.category,
        timeframe: formData.timeframe,
        bias: formData.bias,
        status: formData.status, // <-- Pushing status to database to survive the queue transfer
        content: formData.content,
        tier_access: 'pro', // Defaulting securely to Pro
        image_url: publicUrl
      }])

      if (dbError) throw dbError
      
      setShowSuccess(true)
    } catch (err) {
      console.error("Publishing Error:", err)
      alert("Failed to queue setup. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      asset_symbol: '',
      category: 'FOREX',
      timeframe: '1H',
      bias: 'NEUTRAL',
      status: 'WAITING',
      content: ''
    })
    setFile(null)
    setPreviewUrl(null)
    setShowSuccess(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] max-w-[1200px] mx-auto p-4 md:p-6 bg-zinc-950 animate-in fade-in duration-500 overflow-hidden">
      
      <div className="shrink-0 mb-4">
        <button onClick={() => router.push('/admin/analysis')} className="flex items-center text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Inbox
        </button>
        <h2 className="text-2xl font-semibold text-zinc-100">Draft Setup</h2>
        <p className="text-sm text-zinc-400 mt-1">Configure and upload your analysis to the staging queue.</p>
      </div>

      <div className="flex-1 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col min-h-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-1 min-h-0">
          
          {/* LEFT COLUMN: FORM */}
          <div className="space-y-6 flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-2">
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Asset Symbol</label>
                <input 
                  type="text" 
                  value={formData.asset_symbol}
                  onChange={handleSymbolChange}
                  placeholder="e.g. XAUUSD"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm font-medium text-zinc-100 outline-none focus:border-zinc-600 transition-colors uppercase placeholder:normal-case placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm font-medium text-zinc-100 outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer"
                >
                  {Object.keys(ASSET_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category.charAt(0) + category.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 shrink-0">
              <label className="text-sm font-medium text-zinc-400">Timeframe</label>
              <select 
                value={formData.timeframe}
                onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-3 text-sm font-medium text-zinc-100 outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-800/50 shrink-0">
              <label className="text-sm font-medium text-zinc-400">Directional Bias</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setFormData({...formData, bias: 'BULLISH'})} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${formData.bias === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900 hover:text-emerald-400'}`}>
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Bullish</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, bias: 'NEUTRAL'})} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${formData.bias === 'NEUTRAL' ? 'bg-zinc-800 border-zinc-600 text-zinc-100' : 'bg-zinc-950 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}>
                  <Minus size={16} />
                  <span className="text-sm font-medium">Neutral</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, bias: 'BEARISH'})} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all ${formData.bias === 'BEARISH' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-950 border-zinc-800/50 text-zinc-500 hover:bg-zinc-900 hover:text-red-400'}`}>
                  <TrendingDown size={16} />
                  <span className="text-sm font-medium">Bearish</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800/50 shrink-0">
              <label className="text-sm font-medium text-zinc-400 block">Initial Live Status</label>
              <div className="flex flex-wrap gap-2">
                {['WAITING', 'ACTIVE', 'DONE', 'INVALID', 'CANCELED'].map((statusOption) => {
                  const isActive = formData.status === statusOption;
                  
                  let activeClasses = "bg-zinc-700 text-white"; 
                  if (statusOption === 'WAITING') activeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                  if (statusOption === 'ACTIVE') activeClasses = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                  if (statusOption === 'DONE') activeClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  if (statusOption === 'INVALID') activeClasses = "bg-red-500/10 text-red-400 border-red-500/30";
                  if (statusOption === 'CANCELED') activeClasses = "bg-zinc-800 text-zinc-300 border-zinc-600";

                  return (
                    <button 
                      key={statusOption}
                      type="button"
                      onClick={() => setFormData({...formData, status: statusOption})} 
                      className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all border flex-1 ${
                        isActive 
                          ? activeClasses 
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800/50 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      {statusOption.toLowerCase()}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-800/50 flex-1 flex flex-col min-h-[120px]">
              <label className="text-sm font-medium text-zinc-400 shrink-0">Analysis Notes</label>
              <textarea 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                placeholder="Setup logic, entry triggers..." 
                className="w-full flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors resize-none placeholder:text-zinc-600 leading-relaxed custom-scrollbar" 
              />
            </div>
            
          </div>

          {/* RIGHT COLUMN: IMAGE UPLOAD & SUBMIT */}
          <div className="flex flex-col h-full min-h-[400px]">
            <label className="text-sm font-medium text-zinc-400 mb-2 block shrink-0">Chart Image Capture</label>
            <div className="flex-1 w-full relative group min-h-0">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className={`absolute inset-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${previewUrl ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-800 bg-zinc-950 group-hover:border-zinc-600 group-hover:bg-zinc-900/80'}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2 rounded-2xl" />
                ) : (
                  <div className="text-center p-6 flex flex-col items-center">
                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 transition-transform">
                      <UploadCloud size={24} className="text-zinc-400" />
                    </div>
                    <h4 className="text-sm font-medium text-zinc-200 mb-2">Upload Chart Screenshot</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px]">
                      Drag and drop here. We will auto-detect the ticker and timeframe from the filename.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end shrink-0">
              <button 
                onClick={handlePublish} 
                disabled={loading || !file || !formData.asset_symbol} 
                className="w-full flex justify-center items-center px-6 py-3.5 bg-blue-600 text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <Activity className="animate-spin mr-2" size={18} /> : <Rocket className="mr-2" size={18} />}
                {loading ? 'Sending...' : 'Send to Staging Queue'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Saved to Queue</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Analysis for <strong className="text-emerald-400">{formData.asset_symbol || 'the asset'}</strong> has been drafted to the staging table.
            </p>
            <div className="w-full flex gap-3">
              <button 
                onClick={() => router.push('/admin/analysis/queue')} 
                className="flex-1 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Go To Queue
              </button>
              <button 
                onClick={resetForm} 
                className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
              >
                Upload Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
