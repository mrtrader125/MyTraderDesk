import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChevronRight } from 'lucide-react'

// Force fresh data on every load
export const dynamic = 'force-dynamic'; 

export const metadata: Metadata = {
  title: 'Protocol Archive | MyTraderDesk',
}

export default async function PlaybookPage() {
  // We change 'ascending' to true to show oldest first
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-400 font-sans antialiased selection:bg-white selection:text-black">
      
      <div className="w-full max-w-5xl mx-auto pt-32 pb-20 px-8">
        {/* Header */}
        <div className="border-l border-neutral-800 pl-8 mb-20">
          <h1 className="text-white text-4xl font-semibold tracking-tight uppercase mb-2">
            Archive
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">
            Systematic Roadmap // Step-by-Step
          </p>
        </div>

        {/* 2-Column List Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          {error || !articles?.length ? (
            <div className="col-span-full py-20 border border-dashed border-neutral-900 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">Database empty.</span>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/playbook/${article.slug}`} 
                className="group flex flex-col justify-between border-b border-neutral-900 pb-10 hover:border-white transition-colors"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest border border-neutral-800 px-2 py-1 group-hover:text-white group-hover:border-neutral-700 transition-colors">
                      {article.category}
                    </span>
                    <ChevronRight size={14} className="text-neutral-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h2 className="text-xl font-medium text-white tracking-tight leading-snug group-hover:text-neutral-300 transition-colors">
                    {article.title}
                  </h2>
                </div>
                
                <div className="mt-8 flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-neutral-700">
                  <span className="text-neutral-500">Record #{articles.indexOf(article) + 1}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-900"></span>
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-40 pt-8 border-t border-neutral-900 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-800">
          <span>Sequential Archive // End of File</span>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>System Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
