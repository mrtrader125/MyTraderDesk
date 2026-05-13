'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Lock } from 'lucide-react'
import Link from 'next/link'

type Props = {
  discussionId: string
  userId: string
  isFreeUser: boolean
}

export default function CommentBox({ discussionId, userId, isFreeUser }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isFreeUser) return
    
    setLoading(true)
    const { error } = await supabase.from('desk_comments').insert([{
      discussion_id: discussionId,
      user_id: userId,
      content: content.trim()
    }])

    if (!error) {
      setContent('')
      // Refresh the page to show the new comment
      window.location.reload()
    } else {
      alert("Failed to post comment.")
      setLoading(false)
    }
  }

  if (isFreeUser) {
    return (
      <div className="bg-[#000000] border border-neutral-800 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-50"></div>
        <Lock size={24} className="text-neutral-500 mx-auto mb-3 relative z-10" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 relative z-10">Transmission Locked</h3>
        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-4 relative z-10">
          Only Essential and Pro operators can transmit structural notes to the floor.
        </p>
        <Link href="/account/profile" className="inline-block px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform relative z-10">
          Upgrade Access
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handlePost} className="bg-[#000000] border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add your structural confluence or liquidity targets..."
        className="w-full bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-neutral-600 p-2"
        rows={3}
        required
      />
      <div className="flex justify-between items-center border-t border-neutral-800 pt-3">
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
          Be professional. No hype.
        </span>
        <button 
          type="submit" 
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center transition-colors"
        >
          {loading ? 'Posting...' : <><Send size={12} className="mr-2" /> Transmit</>}
        </button>
      </div>
    </form>
  )
}
