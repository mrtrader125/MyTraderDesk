import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Activity, Terminal, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Playbook | Institutional Trading Protocols',
  description: 'Access the standardized execution protocols and market mechanics used by the Sentinel Vortex desk.',
}

export default async function PlaybookPage() {
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans pt-32 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Institutional Header */}
        <div className="mb-20 border-l border-neutral-800 pl-8">
          <div className="flex items-center gap-2 mb-4 text-neutral-500 uppercase tracking-[0.3em] text-[10px] font-black">
            <Terminal size={12} />
            <span>Operational Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tighter text-white mb-6">
            The <span className="text-neutral-500 font-light">Playbook</span>
          </h1>
          <p className="text-neutral-500 text-base md:text-lg max-w-xl leading-relaxed font-normal">
            A centralized repository of market mechanics, risk protocols, and execution strategies. These are not suggestions; they are the standardized operating procedures of the desk.
          </p>
        </div>

        {/* Operational Notice (Replacement for the "Trap") */}
        <div className="mb-16 p-8 bg-[#0A0A0A] border border-neutral-900 rounded-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white tracking-tight">Active Execution Floor</h3>
              <p className="text-neutral-500 text-sm mt-1 max-w-md">
                Theoretical knowledge is a liability without execution. Access the live digital floor to observe these protocols in real-time market conditions.
              </p>
            </div>
          </div>
          <Link href="/signup" className="px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-neutral-200 transition-colors w-full md:w-auto text-center">
            Enter Live Floor
          </Link>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-900 border border-neutral-900 overflow-hidden">
          {error || !articles?.length ? (
            <div className="col-span-full py-32 text-center bg-[#050505]">
              <Activity className="mx-auto text-neutral-800 mb-4 animate-pulse" size={32} />
              <p className="text-neutral-600 font-medium uppercase tracking-widest text-[10px]">
                Syncing Database... No Protocols Found
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="bg-[#050505] p-8 hover:bg-[#080808] transition-all group flex flex-col justify-between min-h-[280px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-sm">
                      {article.category}
                    </span>
                    <BookOpen size={14} className="text-neutral-700 group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-xl font-medium text-white leading-snug tracking-tight group-hover:translate-x-1 transition-transform">
                    {article.title}
                  </h2>
                </div>
                
                <div className="mt-12 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-700 font-medium">Updated</span>
                    <span className="text-neutral-500">{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className="flex items-center group-hover:text-white transition-colors gap-2">
                    Open File <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer Technical Note */}
        <div className="mt-20 pt-10 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-neutral-700 text-[10px] uppercase font-black tracking-widest">
            © 2026 Sentinel Vortex // All Protocols Encrypted
          </p>
          <div className="flex gap-6">
             <div className="flex items-center gap-2 text-neutral-700 text-[10px] uppercase font-black tracking-widest">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               System Status: Online
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
