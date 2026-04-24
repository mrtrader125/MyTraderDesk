import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, Tag, TerminalSquare } from 'lucide-react'
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
  
  const { data: article, error } = await supabase
    .from('playbook')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single()

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
        <TerminalSquare size={32} className="text-neutral-700 mb-4" />
        <h1 className="text-xl font-medium tracking-tight">Protocol Not Found</h1>
        <Link href="/playbook" className="text-neutral-500 hover:text-white mt-4 text-xs font-black uppercase tracking-widest transition-colors">
          Return to Playbook
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans pt-24 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <Link href="/playbook" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-12">
          <ArrowLeft size={14} className="mr-2" /> Back to Playbook
        </Link>

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

        {/* Article Content - Rendered with ReactMarkdown and Tailwind Typography */}
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
    </div>
  )
}
