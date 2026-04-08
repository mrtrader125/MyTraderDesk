import { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'

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
    title: `${article.title} | The Playbook`,
    description: `Read the latest ${article.category} trading strategies from the Sentinel Vortex trading desk.`,
    openGraph: {
      title: article.title,
      description: `Read the latest ${article.category} trading strategies.`,
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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-black uppercase">Article Not Found</h1>
        <Link href="/playbook" className="text-blue-500 mt-4 font-bold text-sm uppercase">Return to Playbook</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/playbook" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} className="mr-2" /> Back to Playbook
        </Link>

        {/* Article Header */}
        <div className="mb-12 pb-10 border-b border-neutral-900">
          <div className="flex gap-4 mb-6">
            <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
              <Tag size={12} className="mr-2" /> {article.category}
            </span>
            <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              <Calendar size={12} className="mr-2" /> {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Article Content - whitespace-pre-wrap preserves your line breaks from the admin text area */}
        <div className="prose prose-invert prose-lg max-w-none text-neutral-300 whitespace-pre-wrap font-medium leading-relaxed">
          {article.content}
        </div>

        {/* End of Article Conversion Trap */}
        <div className="mt-20 p-10 bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
           <h3 className="text-2xl font-black uppercase tracking-tight mb-4 relative z-10">Ready to execute?</h3>
           <p className="text-neutral-400 text-sm font-medium max-w-md mx-auto mb-8 relative z-10">
             You know the theory. Now see how we apply it in real-time to today's markets.
           </p>
           <Link href="/signup" className="relative z-10 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform inline-block">
             Enter the Trading Floor
           </Link>
        </div>

      </div>
    </div>
  )
}