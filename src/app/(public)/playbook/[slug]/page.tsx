import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, Tag, TerminalSquare, ChevronRight, Menu } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export const revalidate = 3600; // Cache for 1 hour

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

  if (!article) return { title: 'Article Not Found | MyTraderDesk' }

  return {
    title: `${article.title} | Sentinel Vortex Playbook`,
    description: `Read the latest ${article.category} trading protocols and systems.`,
    openGraph: {
      title: article.title,
      description: `Read the latest ${article.category} trading protocols.`,
      type: 'article',
    }
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

  // Fetch ALL articles for the sidebar index
  const { data: allArticles } = await supabase
    .from('playbook')
    .select('id, title, slug, category')
    .order('created_at', { ascending: false })

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <TerminalSquare size={32} className="text-neutral-700 mb-4" />
        <h1 className="text-xl font-medium tracking-tight">Protocol Not Found</h1>
        <Link href="/playbook" className="text-neutral-500 hover:text-white mt-4 text-xs font-black uppercase tracking-widest transition-colors">
          Return to Playbook Index
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-neutral-200 font-sans">
      
      {/* Desktop Sidebar (Left 25% approx) */}
      <aside className="hidden lg:flex w-72 bg-[#0A0A0A] border-r border-neutral-900/80 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-neutral-900/80">
          <Link href="/playbook" className="flex items-center text-white hover:text-neutral-300 transition-colors">
            <TerminalSquare size={18} className="mr-3 text-neutral-500" />
            <span className="font-semibold tracking-tight text-sm">Playbook Index</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-4 px-2 mt-2">Available Protocols</p>
          
          {allArticles?.map((item) => {
            const isActive = item.slug === resolvedParams.slug;
            return (
              <Link
                key={item.id}
                href={`/playbook/${item.slug}`}
                className={`w-full text-left p-3 rounded-sm transition-colors flex items-center justify-between group ${
                  isActive 
                    ? 'bg-neutral-800 border-l-2 border-white' 
                    : 'hover:bg-neutral-900/50 border-l-2 border-transparent'
                }`}
              >
                <div className="truncate pr-4">
                  <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                    {item.title}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mt-1">
                    {item.category}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} className="text-white" />}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Reading Area (Right 75%) */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden p-4 border-b border-neutral-900 flex items-center justify-between bg-[#0A0A0A] sticky top-0 z-20">
           <Link href="/playbook" className="flex items-center text-xs font-black uppercase tracking-widest text-neutral-400">
             <Menu size={16} className="mr-2" /> Index
           </Link>
           <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Sentinel Vortex</span>
        </div>

        <div className="p-8 md:p-16 lg:p-20 max-w-4xl mx-auto w-full">
          {/* Article Header */}
          <header className="mb-12 pb-10 border-b border-neutral-900/50">
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-sm">
                <Tag size={12} className="mr-2 text-neutral-500" /> {article.category}
              </span>
              <span className="flex items-center text-[10px] font-medium uppercase tracking-widest text-neutral-500">
                <Calendar size={12} className="mr-2" /> 
                {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
              {article.title}
            </h1>
          </header>

          {/* Article Content */}
          <article className="prose prose-invert prose-neutral max-w-none 
            prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-white
            prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:font-normal
            prose-a:text-white prose-a:underline-offset-4 hover:prose-a:text-neutral-300
            prose-strong:text-white prose-strong:font-semibold
            prose-li:text-neutral-400 marker:text-neutral-600">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Systematic Conversion CTA */}
          <div className="mt-24 p-10 bg-[#0A0A0A] border border-neutral-800/50 rounded-lg text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full"></div>
             
             <h3 className="text-xl font-medium tracking-tight text-white mb-3 relative z-10">
               Ready to deploy the Operator's Protocol?
             </h3>
             
             <p className="text-neutral-500 text-sm font-normal max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
               Stop relying on discretion. Lock in your daily edges, track your discipline index, and execute flawlessly within a systematic environment. 
             </p>
             
             <Link href="/signup" className="relative z-10 px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-neutral-200 transition-colors inline-block">
               Apply for Founding Membership (150 Limit)
             </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
