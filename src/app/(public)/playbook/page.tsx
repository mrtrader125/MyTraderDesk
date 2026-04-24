import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'; 

export default async function PlaybookPage() {
  // Fetch articles in chronological order (Oldest first)
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 font-sans antialiased selection:bg-white selection:text-black">
      
      {/* 1. BRAND SECTION (What is My Trader Desk) */}
      <div className="max-w-5xl mx-auto pt-32 pb-24 px-8 border-b border-neutral-900">
        <h1 className="text-white text-5xl font-bold tracking-tight mb-8">
          The Playbook
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">About the Desk</h2>
            <p className="text-neutral-500 leading-relaxed text-lg">
              My Trader Desk is a centralized environment for systematic execution. 
              We strip away the noise of discretionary trading and replace it with 
              hard-coded protocols and objective data.
            </p>
          </div>
          <div>
            <h2 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4">The Objective</h2>
            <p className="text-neutral-500 leading-relaxed text-lg">
              Our goal is to build professional traders who operate like machines. 
              We don't focus on "wins"; we focus on the integrity of the execution process.
            </p>
          </div>
        </div>
      </div>

      {/* 2. JOURNEY SECTION (How you got here) */}
      <div className="max-w-5xl mx-auto py-24 px-8 border-b border-neutral-900">
        <h2 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-12">The Evolution</h2>
        <div className="space-y-12">
          {/* Milestone 1 */}
          <div className="flex gap-8 group">
            <span className="text-neutral-800 font-bold text-4xl tabular-nums group-hover:text-neutral-600 transition-colors">01</span>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">The Discretionary Trap</h3>
              <p className="text-neutral-500 max-w-2xl leading-relaxed">
                Like most, I started by chasing patterns and trading based on "conviction." 
                I learned the hard way that conviction is just an emotional mask for gambling.
              </p>
            </div>
          </div>
          {/* Milestone 2 */}
          <div className="flex gap-8 group">
            <span className="text-neutral-800 font-bold text-4xl tabular-nums group-hover:text-neutral-600 transition-colors">02</span>
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Defining the Protocol</h3>
              <p className="text-neutral-500 max-w-2xl leading-relaxed">
                I spent months auditing every failure until a pattern emerged: 
                I wasn't losing to the market; I was losing to my own lack of rules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THE ARTICLES (Oldest to Newest) */}
      <div className="max-w-5xl mx-auto py-24 px-8">
        <h2 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-12">Operational Protocols</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {error || !articles?.length ? (
            <p className="text-neutral-700 uppercase font-black text-[10px]">Updating Archive...</p>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="group block border-b border-neutral-900 pb-10 hover:border-white transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest border border-neutral-800 px-3 py-1.5 group-hover:text-white group-hover:border-neutral-700 transition-colors">
                    {article.category}
                  </span>
                  <ChevronRight size={16} className="text-neutral-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-2xl font-medium text-white tracking-tight leading-tight group-hover:text-neutral-300 transition-colors">
                  {article.title}
                </h3>
                <p className="mt-4 text-neutral-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <span>Manual Entry</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-800"></span>
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 4. CLEAN FOOTER */}
      <footer className="max-w-5xl mx-auto py-20 px-8 border-t border-neutral-900 flex justify-between items-center">
        <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest">
          © 2026 My Trader Desk
        </p>
        <Link href="/signup" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-neutral-400 transition-colors">
          Join the floor <ArrowRight size={14} />
        </Link>
      </footer>

    </div>
  )
}
