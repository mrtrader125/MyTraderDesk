import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FileText, ChevronRight, BarChart3, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Protocol Archive | MyTraderDesk',
  description: 'Technical execution standards and systematic trading protocols.',
}

export default async function PlaybookPage() {
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 font-sans antialiased">
      {/* Top Utility Bar */}
      <div className="border-b border-neutral-900 bg-[#080808] px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-neutral-900 border border-neutral-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Live</span>
          </div>
          <span className="text-neutral-700 text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
            Terminal // Playbook Archive
          </span>
        </div>
        <div className="text-neutral-600 text-[10px] font-medium uppercase tracking-widest">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12">
        
        {/* Simplified Header: No Fluff */}
        <div className="mb-12 border-l-2 border-neutral-800 pl-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase mb-2">
            Protocol Archive
          </h1>
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
            Standardized execution logic and risk parameters.
          </p>
        </div>

        {/* High-Density Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900 shadow-2xl">
          {error || !articles?.length ? (
            <div className="col-span-full py-32 text-center bg-[#050505] border border-neutral-900">
              <span className="text-neutral-700 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Establishing Database Connection...
              </span>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="group bg-[#080808] p-6 hover:bg-[#0c0c0c] transition-colors flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <FileText size={12} className="text-neutral-600 group-hover:text-white transition-colors" />
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                        {article.category}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-neutral-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-lg font-bold text-white leading-tight tracking-tight group-hover:text-neutral-200">
                    {article.title}
                  </h2>
                </div>
                
                <div className="mt-8 flex items-end justify-between border-t border-neutral-900/50 pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black uppercase text-neutral-700 tracking-widest">Modified</span>
                    <div className="flex items-center gap-1 text-neutral-500 font-medium text-[10px]">
                      <Clock size={10} />
                      {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-neutral-900"></div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-black uppercase text-neutral-700 tracking-widest">Status</span>
                    <span className="text-[10px] font-bold text-emerald-900/80 uppercase">Verified</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Bottom Data Summary */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-700 border-t border-neutral-900 pt-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Coverage: Multi-Asset</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest">Total Protocols: {articles?.length || 0}</span>
            </div>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]">
            SYSTEM_MTD_VER_01.26
          </p>
        </div>
      </div>
    </div>
  )
}
