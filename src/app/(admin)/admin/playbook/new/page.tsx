'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Send, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

// Initialize client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminPlaybookPublish() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Strategy')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Auto-generate a clean SEO slug when the title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const { error } = await supabase
      .from('playbook')
      .insert([{ title, slug, category, content }])

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('success')
      setTitle('')
      setSlug('')
      setContent('')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-10 border-b border-neutral-800 pb-6">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
            <FileText className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Publish Playbook Article</h1>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-1">Push evergreen content to the live site</p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Article Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={handleTitleChange}
                className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., How to spot retail liquidity traps"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">URL Slug (Auto-generated)</label>
              <input 
                required
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#000000] border border-neutral-800 rounded-xl px-4 py-3 text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="Strategy">Strategy</option>
              <option value="Sentiment">Sentiment</option>
              <option value="Market Structure">Market Structure</option>
              <option value="Psychology">Psychology</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Article Body</label>
            <textarea 
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
              placeholder="Write your article here..."
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {status === 'loading' ? 'Publishing...' : <><Send size={18} className="mr-2" /> Publish to Playbook</>}
          </button>

          {status === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center text-sm font-bold">
              <CheckCircle2 className="mr-3" size={20} /> Article published successfully!
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center text-sm font-bold">
              <AlertCircle className="mr-3" size={20} /> Error publishing article. Check console.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
