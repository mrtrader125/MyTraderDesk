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
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Transmission Lost</h1>
        <p className="text-neutral-500 text-sm mb-6">This chatter module could not be found or was deleted by an admin.</p>
        <Link href="/floor" className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center">
          <ArrowLeft size={14} className="mr-2" /> Return to Floor
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
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <Link href="/floor" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} className="mr-2" /> Back to Live Floor
        </Link>

        {/* Main Topic (Original Post) */}
        <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-neutral-800 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
              {discussion.asset}
            </span>
            <div className={`flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
              ${discussion.bias === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                discussion.bias === 'BEARISH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
              {discussion.bias === 'BULLISH' ? <TrendingUp size={12} className="mr-2" /> : 
               discussion.bias === 'BEARISH' ? <TrendingDown size={12} className="mr-2" /> : 
               <Minus size={12} className="mr-2" />}
              {discussion.bias}
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-relaxed text-neutral-200 relative z-10">
            {discussion.topic}
          </h1>
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mt-6 relative z-10">
            System Transmission • {new Date(discussion.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Comment Thread */}
        <div className="space-y-4 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-6">Operator Notes</h3>
          
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-5 flex space-x-4">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                  <User size={14} className="text-neutral-500" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Desk Operator</span>
                    <span className="text-[9px] font-bold text-neutral-600">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed font-medium whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center border border-dashed border-neutral-800 rounded-2xl">
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest">No structural notes added yet.</p>
            </div>
          )}
        </div>

        {/* Reply Input Box */}
        <CommentBox discussionId={discussion.id} userId={user.id} isFreeUser={isFreeUser} />

      </div>
    </div>
  )
}