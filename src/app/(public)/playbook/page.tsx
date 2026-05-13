import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowUpRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'; 

export const metadata: Metadata = {
  title: 'The Playbook | MyTraderDesk',
}

export default async function PlaybookPage() {
  // Fetch articles in chronological order
  const { data: articles, error } = await supabase
    .from('playbook')
    .select('title, slug, category, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-neutral-400 font-sans selection:bg-white selection:text-black flex flex-col">
      
      {/* Changed pt-32 to pt-16 to remove the massive top space */}
      <main className="flex-grow max-w-6xl mx-auto w-full pt-16 pb-16 px-6 lg:px-8">
        
        {/* Minimal Header */}
        <div className="mb-12 flex items-end justify-between">
          <h1 className="text-white text-4xl md:text-5xl font-semibold tracking-tight">
            The Playbook
          </h1>
          <span className="text-xs font-medium text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full hidden sm:block">
            {articles?.length || 0} Protocols
          </span>
        </div>

        {/* Clean Protocol Grid */}
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
                  <h2 className="text-lg font-medium text-white tracking-tight leading-snug group-hover:text-neutral-200">
                    {article.title}
                  </h2>
                </div>
                
                <div className="mt-8 flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <Clock size={12} />
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="w-full max-w-6xl mx-auto py-8 px-6 lg:px-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs font-medium text-neutral-600">
          © {new Date().getFullYear()} My Trader Desk
        </p>
        <Link href="/signup" className="text-xs font-medium text-white hover:text-neutral-300 transition-colors flex items-center gap-2">
          Join the floor <ArrowUpRight size={14} />
        </Link>
      </footer>

    </div>
  )
}
