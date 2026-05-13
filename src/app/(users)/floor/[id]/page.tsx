import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, User } from 'lucide-react'
import CommentBox from '@/components/community/CommentBox'

export default async function DiscussionThreadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // 1. Auth & Plan Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
  const isFreeUser = (profile?.plan?.toLowerCase() || 'free') === 'free'

  // 2. Fetch the specific Discussion Topic
  const { data: discussion } = await supabase
    .from('desk_discussions')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!discussion) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-semibold mb-3">Transmission Lost</h1>
        <p className="text-neutral-500 text-sm mb-6 max-w-sm">This chatter module could not be found or was deleted by an admin.</p>
        <Link href="/floor" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center">
          <ArrowLeft size={16} className="mr-2" /> Return to Floor
        </Link>
      </div>
    )
  }

  // 3. Fetch all comments for this discussion
  const { data: comments } = await supabase
    .from('desk_comments')
    .select('*')
    .eq('discussion_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <Link href="/floor" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to Live Floor
        </Link>

        {/* Main Topic (Original Post) */}
        <div className="bg-[#0c0c0c] ring-1 ring-white/[0.04] rounded-2xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.02] blur-[60px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
            <span className="bg-white/[0.03] ring-1 ring-white/[0.05] px-3 py-1 rounded-md text-xs font-semibold text-neutral-200 tracking-wide uppercase">
              {discussion.asset}
            </span>
            <div className={`flex items-center px-3 py-1 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors
              ${discussion.bias === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 
                discussion.bias === 'BEARISH' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20' : 
                'bg-white/[0.03] text-neutral-400 ring-1 ring-white/[0.05]'}`}>
              {discussion.bias === 'BULLISH' ? <TrendingUp size={14} className="mr-1.5" /> : 
               discussion.bias === 'BEARISH' ? <TrendingDown size={14} className="mr-1.5" /> : 
               <Minus size={14} className="mr-1.5" />}
              {discussion.bias}
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-semibold leading-relaxed text-neutral-100 relative z-10">
            {discussion.topic}
          </h1>
          
          <div className="flex items-center gap-2 mt-8 relative z-10">
            <span className="text-xs font-medium text-neutral-500">System Transmission</span>
            <span className="text-neutral-700">•</span>
            <span className="text-xs font-medium text-neutral-500">{new Date(discussion.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Comment Thread */}
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-semibold text-neutral-300 mb-6 px-1">Operator Notes</h3>
          
          {comments && comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[#0a0a0a] ring-1 ring-white/[0.02] hover:ring-white/[0.05] transition-all rounded-xl p-5 flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center shrink-0 ring-1 ring-white/[0.05]">
                    <User size={14} className="text-neutral-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-neutral-200">Desk Operator</span>
                      <span className="text-[10px] font-medium text-neutral-600">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center ring-1 ring-white/[0.02] bg-white/[0.01] rounded-2xl">
              <p className="text-sm font-medium text-neutral-500">No structural notes added yet.</p>
            </div>
          )}
        </div>

        {/* Reply Input Box */}
        {/* Note: Ensure CommentBox is also updated to match this minimal styling inside its own component file */}
        <CommentBox discussionId={discussion.id} userId={user.id} isFreeUser={isFreeUser} />

      </div>
    </div>
  )
}
