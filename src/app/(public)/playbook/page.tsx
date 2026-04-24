import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Terminal, ShieldCheck, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600;

export default async function PlaybookPage() {
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans pt-32 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section: Better Spacing & Hierarchy */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-neutral-800"></div>
            <span className="text-neutral-500 uppercase tracking-[0.4em] text-[9px] font-black">
              Institutional Knowledge Base
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-8">
            The <span className="text-neutral-600 font-light italic">Playbook</span>
          </h1>
          <p className="text-neutral-500 text-base md:text-lg max-w-2xl leading-relaxed">
            Standardized execution protocols for the Sentinel Vortex trading desk. 
            Designed for systematic operators, not discretionary speculators.
          </p>
        </div>

        {/* Feature Banner: High Contrast Separation */}
        <div className="mb-20 p-1 bg-gradient-to-r from-neutral-800 to-transparent rounded-lg">
          <div className="bg-[#0A0A0A] p-8 md:p-10 rounded-lg flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 shadow-2xl">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white tracking-tight">Active Trading Floor</h3>
                <p className="text-neutral-500 text-sm mt-1 max-w-md leading-relaxed">
                  Theory is useless without live application. Join 150 founding members on the digital floor.
                </p>
              </div>
            </div>
            <Link href="/signup" className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-neutral-200 transition-all w-full md:w-auto text-center shrink-0 shadow-xl">
              Apply for Access
            </Link>
          </div>
        </div>

        {/* Article Grid: Real Borders & Card Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error || !articles?.length ? (
            <div className="col-span-full py-32 text-center border border-dashed border-neutral-900 rounded-lg">
              <p className="text-neutral-600 font-medium uppercase tracking-widest text-[10px]">
                Syncing Protocol Database...
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="group relative bg-[#0A0A0A] border border-neutral-900 p-8 rounded-lg hover:border-neutral-700 transition-all flex flex-col justify-between min-h-[300px] hover:-translate-y-1"
              >
                {/* Subtle Card Accent */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={16} className="text-neutral-500" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest bg-black border border-neutral-800 px-3 py-1.5 rounded-sm">
                      {article.category}
                    </span>
                    <Clock size={12} className="text-neutral-700" />
                  </div>
                  
                  <h2 className="text-xl font-medium text-white leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h2>
                </div>
                
                <div className="mt-12 pt-6 border-t border-neutral-900/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-black tracking-widest text-neutral-700">Revision</span>
                    <span className="text-[10px] font-medium text-neutral-500">
                      {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <BookOpen size={16} className="text-neutral-800 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer Hardware Status */}
        <div className="mt-32 pt-10 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-800 text-[9px] uppercase font-black tracking-[0.3em]">
            Sentinel Vortex // SV-CORE-PRTC-2026
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-neutral-700 text-[10px] uppercase font-black tracking-widest">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
               Terminal: Online
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
