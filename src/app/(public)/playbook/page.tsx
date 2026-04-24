import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowUpRight, BookOpen, Clock, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'; 

export default async function PlaybookPage() {
  // Fetch articles in chronological order (Oldest first)
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-400 font-sans selection:bg-white selection:text-black">
      
      {/* 1. HERO & ABOUT SECTION */}
      <div className="max-w-6xl mx-auto pt-32 pb-16 px-6 lg:px-8">
        <div className="bg-[#0A0A0A] border border-neutral-800/60 rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
          
          <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight mb-6 relative z-10">
            The Playbook
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 relative z-10">
            A centralized environment for systematic execution. We strip away the noise of discretionary trading and replace it with hard-coded protocols and objective data.
          </p>

          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-neutral-800/60 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-neutral-500" />
                <h2 className="text-white font-medium">The Objective</h2>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500">
                To build professional operators. We do not focus on isolated wins; we focus on the structural integrity of the execution process over a large sample size.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-neutral-500" />
                <h2 className="text-white font-medium">The Archive</h2>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500">
                This repository documents the exact mechanics, risk models, and psychological frameworks required to survive and scale in the markets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE JOURNEY (Timeline UI) */}
      <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-white text-2xl font-semibold tracking-tight">The Evolution</h2>
          <p className="text-neutral-500 mt-2">The path from discretionary guessing to systematic execution.</p>
        </div>

        <div className="relative border-l border-neutral-800 ml-3 space-y-12 pb-8">
          {/* Timeline Item 1 */}
          <div className="relative pl-8">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-neutral-800 rounded-full border-2 border-[#050505]"></div>
            <h3 className="text-white text-lg font-medium mb-2">The Discretionary Trap</h3>
            <p className="text-neutral-500 leading-relaxed text-sm max-w-xl">
              Like most, I started by chasing patterns and trading based on "conviction." I learned the hard way that conviction is just an emotional mask for gambling. When the setups failed, the account suffered.
            </p>
          </div>
          
          {/* Timeline Item 2 */}
          <div className="relative pl-8">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
            <h3 className="text-white text-lg font-medium mb-2">Defining the Protocol</h3>
            <p className="text-neutral-500 leading-relaxed text-sm max-w-xl">
              I spent months auditing every failure until a pattern emerged: I wasn't losing to the market; I was losing to my own lack of rules. This realization birthed the strict constraints of My Trader Desk.
            </p>
          </div>
        </div>
      </div>

      {/* 3. THE PROTOCOLS (Modern Card Grid) */}
      <div className="max-w-6xl mx-auto py-16 px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-white text-2xl font-semibold tracking-tight">Operational Protocols</h2>
          <span className="text-xs font-medium text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full">
            {articles?.length || 0} Documents
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error || !articles?.length ? (
            <div className="col-span-full py-12 text-center bg-[#0A0A0A] rounded-2xl border border-neutral-800/60">
              <p className="text-neutral-500 text-sm">No protocols found in the database.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="group flex flex-col justify-between bg-[#0A0A0A] border border-neutral-800/60 rounded-2xl p-6 hover:bg-[#0F0F0F] hover:border-neutral-700 transition-all duration-300 min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <ArrowUpRight size={18} className="text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium text-white tracking-tight leading-snug group-hover:text-neutral-200">
                    {article.title}
                  </h3>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <Clock size={12} />
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 4. FOOTER */}
      <footer className="max-w-6xl mx-auto py-12 px-6 lg:px-8 mt-12 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs font-medium text-neutral-600">
          © 2026 My Trader Desk
        </p>
        <Link href="/signup" className="text-xs font-medium text-white hover:text-neutral-300 transition-colors flex items-center gap-2">
          Join the floor <ArrowUpRight size={14} />
        </Link>
      </footer>

    </div>
  )
}
