'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Calendar, ShieldCheck, 
  BarChart2, AlertCircle, Clock 
} from 'lucide-react'
import Link from 'next/link'

export default function AnalysisDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error:', error)
        router.push('/dashboard')
      } else {
        setAnalysis(data)
      }
      setLoading(false)
    }
    fetchDetail()
  }, [id, router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-neutral-500 italic font-medium">
      Authenticating Intelligence...
    </div>
  )

  if (!analysis) return null

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 px-4 lg:px-0">
        <Link href="/dashboard" className="flex items-center space-x-2 text-neutral-500 hover:text-white transition group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium tracking-tight">Return to Floor</span>
        </Link>
        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em] border ${
          analysis.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-400/10 text-blue-400 border-blue-400/20'
        }`}>
          {analysis.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 lg:px-0">
        
        {/* LEFT: THE CHART */}
        <div className="lg:col-span-8">
          <div className="bg-[#141418] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
            {analysis.image_url ? (
              <img src={analysis.image_url} alt="Market Analysis" className="w-full h-auto object-contain bg-black/40" />
            ) : (
              <div className="h-[450px] flex flex-col items-center justify-center text-neutral-800">
                <BarChart2 size={64} className="mb-4 opacity-5" />
                <p className="font-medium">Technical Visual Unavailable</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-5 bg-[#1a1a1f] border border-neutral-800 rounded-xl flex items-start space-x-4">
            <div className="p-2 bg-blue-400/10 rounded-lg">
                <AlertCircle className="text-blue-400" size={20} />
            </div>
            <div>
                <h4 className="text-white text-sm font-bold mb-1 uppercase tracking-tight">Floor Protocol</h4>
                <p className="text-xs text-neutral-500 leading-relaxed italic">
                  This thesis is strictly for educational purposes and reflects the current My Trader Desk market bias.
                </p>
            </div>
          </div>
        </div>

        {/* RIGHT: THE THESIS */}
        <div className="lg:col-span-4">
          <div className="bg-[#1a1a1f] border border-neutral-800/60 rounded-2xl p-8 shadow-xl sticky top-8">
            <div className="mb-8 pb-8 border-b border-neutral-800/50">
              <div className="flex items-center space-x-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span>{analysis.asset_symbol} // Intelligence</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight leading-[1.1] mb-4">{analysis.title}</h1>
              <div className="flex items-center text-neutral-500 text-xs font-medium">
                <Clock size={14} className="mr-2" />
                <span>Posted {new Date(analysis.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4">Analytic Breakdown</h4>
                <div className="text-neutral-300 text-[15px] leading-relaxed whitespace-pre-wrap font-light">
                  {analysis.content}
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-800/50">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-neutral-800/50">
                   <div className="flex items-center space-x-3 text-white text-sm font-bold">
                      <ShieldCheck className="text-blue-500" size={18} />
                      <span className="tracking-tight uppercase">Risk Check Verified</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

