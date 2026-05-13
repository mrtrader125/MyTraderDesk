import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Clock, Menu, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Force Next.js to skip the cache and fetch live data on every request
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params
  
  const { data: article } = await supabase
    .from('playbook')
    .select('title, category')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!article) return { title: 'Protocol Not Found | MyTraderDesk' }

  return {
    title: `${article.title} | MyTraderDesk Playbook`,
    description: `Read the latest ${article.category} protocols.`,
  }
}

export default async function PlaybookArticlePage({ params }: Props) {
  const resolvedParams = await params
  
  // Fetch the current article
  const { data: article, error } = await supabase
    .from('playbook')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  // Fetch ALL articles for the sidebar index (Oldest first to match the roadmap)
  const { data: allArticles } = await supabase
    .from('playbook')
    .select('id, title, slug, category')
    .order('created_at', { ascending: true })

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-xl font-medium tracking-tight mb-4">Protocol Not Found</h1>
        <Link href="/playbook" className="text-neutral-500 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors">
          Return to Archive
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-neutral-400 font-sans selection:bg-white selection:text-black">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#080808] border-r border-neutral-800/60 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-neutral-800/60">
          <Link href="/playbook" className="flex items-center text-neutral-400 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium tracking-tight text-sm">Back to Archive</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-4 px-3 mt-2">
            Sequential Roadmap
          </p>
          
          {allArticles?.map((item, index) => {
            const isActive = item.slug === resolvedParams.slug;
            return (
              <Link
                key={item.id}
                href={`/playbook/${item.slug}`}
                className={`w-full text-left py-2.5 px-3 rounded-xl transition-all duration-200 flex flex-col group ${
                  isActive 
                    ? 'bg-neutral-900/80' 
                    : 'hover:bg-neutral-900/40'
                }`}
              >
                <span className={`text-xs font-medium leading-snug mb-1 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                  {index + 1}. {item.title}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-600">
                  {item.category}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden p-4 border-b border-neutral-800/60 flex items-center justify-between bg-[#080808] sticky top-0 z-20">
           <Link href="/playbook" className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
             <Menu size={16} className="mr-2" /> Index
           </Link>
           <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">MyTraderDesk</span>
        </div>

        {/* 🚨 UPDATED WIDTH AND PADDING HERE 🚨 */}
        <div className="px-6 py-10 md:px-10 md:py-16 lg:px-12 lg:py-16 max-w-5xl mx-auto w-full">
          
          {/* Article Header */}
          <header className="mb-12 pb-8 border-b border-neutral-800/60">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-900 px-2.5 py-1 rounded-md">
                {article.category}
              </span>
              <span className="flex items-center text-xs font-medium text-neutral-600">
                <Clock size={12} className="mr-1.5" /> 
                {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
              {article.title}
            </h1>
          </header>

          {/* Article Content - Styled for maximum readability */}
          <article className="prose prose-invert prose-neutral max-w-none 
            prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-white prose-headings:mt-10
            prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:text-[15px]
            prose-a:text-white prose-a:underline-offset-4 hover:prose-a:text-neutral-300
            prose-strong:text-white prose-strong:font-medium
            prose-li:text-neutral-400 marker:text-neutral-700
            prose-blockquote:border-l-neutral-700 prose-blockquote:text-neutral-300 prose-blockquote:font-normal prose-blockquote:not-italic">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Clean Systematic CTA Box */}
          <div className="mt-24 p-8 md:p-10 bg-[#0A0A0A] border border-neutral-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
             <div>
               <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
                 Access the Live Execution Floor
               </h3>
               <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
                 Execute these protocols in real-time. Join the Sentinel Vortex desk. Founding membership is strictly limited to 150 active operators.
               </p>
             </div>
             
             <Link href="/signup" className="shrink-0 px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors text-center w-full md:w-auto">
               Apply for Membership
             </Link>
          </div>
          
        </div>
      </main>
    </div>
  )
}
