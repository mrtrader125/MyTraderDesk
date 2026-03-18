'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Tag, 
  Trash2,
  Maximize2
} from 'lucide-react'

function AdminViewportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setupId = searchParams.get('id')

  const [setup, setSetup] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!setupId) {
      router.push('/admin/analysis')
      return
    }

    async function fetchSetup() {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', setupId)
        .single()
      
      if (!error && data) {
        setSetup(data)
      } else {
        router.push('/admin/analysis')
      }
      setLoading(false)
    }

    fetchSetup()
  }, [setupId, router])

  const handleDelete = async () => {
    const confirmed = window.confirm(`Permanently delete this setup for ${setup?.asset_symbol}?`)
    if (!confirmed) return

    await supabase.from('analyses').delete().eq('id', setupId)
    router.push('/admin/analysis')
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
        <span className="font-black uppercase tracking-[0.3em] text-neutral-500 text-[10px]">Decrypting Intelligence...</span>
      </div>
    )
  }

  if (!setup) return null

  const isBull = setup.bias?.toUpperCase() === 'BULLISH'
  const isBear = setup.bias?.toUpperCase() === 'BEARISH'

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => router.push('/admin/analysis')} 
        className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" /> Return to Arsenal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* MAIN CHART VIEW */}
        <div className="lg:col-span-3 bg-[#0a0a0a] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
              {setup.asset_symbol}
            </span>
            <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
              {setup.timeframe}
            </span>
          </div>

          <div className="relative flex-1 min-h-[60vh] bg-[#050505] flex items-center justify-center p-4">
            <img 
              src={setup.image_url} 
              alt={setup.asset_symbol} 
              className="w-full h-full object-contain rounded-xl"
              style={{ imageRendering: 'high-quality' }}
            />
          </div>
          
          <div className="p-4 border-t border-neutral-800 bg-[#0a0a0a] flex items-center justify-between">
            <div className="flex items-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              <Clock size={12} className="mr-2" /> Deployed: {new Date(setup.created_at).toLocaleString()}
            </div>
            <button 
              onClick={() => window.open(setup.image_url, '_blank')}
              className="flex items-center text-[9px] font-black text-neutral-400 hover:text-white uppercase tracking-widest transition-colors"
            >
              <Maximize2 size={12} className="mr-1.5" /> Full Resolution
            </button>
          </div>
        </div>

        {/* TACTICAL SIDE PANEL */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
              <Activity size={14} className="mr-2" /> Target Metadata
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">Directional Bias</span>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${isBull ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isBear ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-neutral-800 border-neutral-700 text-white'}`}>
                  {isBull ? <TrendingUp size={12} className="mr-1.5" /> : isBear ? <TrendingDown size={12} className="mr-1.5" /> : <Minus size={12} className="mr-1.5" />}
                  {setup.bias || 'NEUTRAL'}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">Clearance Category</span>
                <div className="flex items-center text-sm font-black text-white">
                  <Tag size={12} className="mr-1.5 text-brand-primary" /> {setup.category}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl flex-1">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Tactical Notes</h3>
            <div className="bg-[#050505] border border-neutral-800/50 rounded-xl p-4 min-h-[150px]">
              {setup.title && <h4 className="text-sm font-black text-white mb-2">{setup.title}</h4>}
              <p className="text-[11px] font-medium text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {setup.content || "No intelligence notes attached to this deployment."}
              </p>
            </div>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full flex items-center justify-center py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg"
          >
            <Trash2 size={14} className="mr-2" /> Revoke Deployment
          </button>

        </div>
      </div>
    </div>
  )
}

export default function AdminViewportPage() {
  return (
    <Suspense fallback={
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="animate-pulse text-brand-primary" size={40} />
      </div>
    }>
      <AdminViewportContent />
    </Suspense>
  )
}