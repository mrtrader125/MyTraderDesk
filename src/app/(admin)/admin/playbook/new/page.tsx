'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Send, FileText, AlertCircle, CheckCircle2, Plus, ChevronRight, Save } from 'lucide-react'

// Initialize client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Playbook = {
  id: string
  title: string
  slug: string
  category: string
  content: string
}

export default function AdminPlaybookTerminal() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Strategy')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Fetch existing articles on load
  useEffect(() => {
    fetchPlaybooks()
  }, [])

  const fetchPlaybooks = async () => {
    const { data, error } = await supabase
      .from('playbook')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPlaybooks(data)
  }

  // Load an existing article into the editor
  const handleSelectArticle = (article: Playbook) => {
    setSelectedId(article.id)
    setTitle(article.title)
    setSlug(article.slug)
    setCategory(article.category)
    setContent(article.content)
    setStatus('idle')
  }

  // Clear the editor for a new article
  const handleCreateNew = () => {
    setSelectedId(null)
    setTitle('')
    setSlug('')
    setCategory('Strategy')
    setContent('')
    setStatus('idle')
  }

  // Auto-generate a clean SEO slug only if it's a new article
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!selectedId) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    let dbError;

    if (selectedId) {
      // Update existing
      const { error } = await supabase
        .from('playbook')
        .update({ title, slug, category, content })
        .eq('id', selectedId)
      dbError = error
    } else {
      // Insert new
      const { error } = await supabase
        .from('playbook')
        .insert([{ title, slug, category, content }])
      dbError = error
    }

    if (dbError) {
      console.error(dbError)
      setStatus('error')
    } else {
      setStatus('success')
      fetchPlaybooks() // Refresh the sidebar list
      
      // If it was a new article, clear the form. If updating, keep it loaded.
      if (!selectedId) {
        handleCreateNew()
      }
      
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Sidebar List (Left Side) */}
      <aside className="w-72 bg-[#0A0A0A] border-r border-neutral-900 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-neutral-900">
          <button 
            onClick={handleCreateNew}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase tracking-widest text-[10px] rounded-sm transition-colors flex items-center justify-center border border-neutral-800"
          >
            <Plus size={14} className="mr-2" /> New Protocol
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-4 px-2">Published Data</p>
          {playbooks.map((article) => (
            <button
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className={`w-full text-left p-3 rounded-sm transition-colors flex items-center justify-between group ${
                selectedId === article.id 
                  ? 'bg-neutral-800 border-l-2 border-white' 
                  : 'hover:bg-neutral-900/50 border-l-2 border-transparent'
              }`}
            >
              <div className="truncate pr-4">
                <p className={`text-xs font-semibold truncate ${selectedId === article.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`}>
                  {article.title}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mt-1">
                  {article.category}
                </p>
              </div>
              <ChevronRight size={14} className={selectedId === article.id ? 'text-white' : 'text-neutral-700'} />
            </button>
          ))}
        </div>
      </aside>

      {/* Main Editor (Right Side) */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-10 border-b border-neutral-900/50 pb-6">
            <div className="w-12 h-12 bg-neutral-900 rounded-sm flex items-center justify-center border border-neutral-800">
              <FileText className="text-neutral-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {selectedId ? 'Edit Protocol' : 'Publish New Protocol'}
              </h1>
              <p className="text-neutral-500 font-medium text-sm mt-1">
                {selectedId ? 'Updating database record.' : 'Pushing evergreen content to the live terminal.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Protocol Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-[#0A0A0A] border border-neutral-800/50 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-neutral-600 focus:bg-[#111] transition-colors"
                  placeholder="e.g., Identifying the Trap"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">URL Slug (System)</label>
                <input 
                  required
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-[#050505] border border-neutral-900 rounded-sm px-4 py-3 text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Category Tag</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-neutral-800/50 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-neutral-600 focus:bg-[#111] transition-colors appearance-none"
              >
                <option value="Strategy">Strategy</option>
                <option value="Sentiment">Sentiment</option>
                <option value="Market Structure">Market Structure</option>
                <option value="Psychology">Psychology</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex justify-between">
                <span>Markdown Body</span>
                <span className="text-neutral-700">Supports ## Headers and * Lists</span>
              </label>
              <textarea 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full bg-[#0A0A0A] border border-neutral-800/50 rounded-sm px-4 py-4 text-neutral-300 focus:outline-none focus:border-neutral-600 focus:bg-[#111] transition-colors leading-relaxed font-mono text-sm"
                placeholder="## Enter the logic here..."
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-sm hover:bg-neutral-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                'Executing...'
              ) : (
                <>
                  {selectedId ? <Save size={16} className="mr-2" /> : <Send size={16} className="mr-2" />} 
                  {selectedId ? 'Update Record' : 'Deploy to Terminal'}
                </>
              )}
            </button>

            {status === 'success' && (
              <div className="bg-[#0A0A0A] border-l-2 border-white text-white p-4 rounded-sm flex items-center text-sm font-medium">
                <CheckCircle2 className="mr-3 text-neutral-400" size={18} /> 
                {selectedId ? 'Record updated successfully.' : 'Protocol deployed successfully.'}
              </div>
            )}
            {status === 'error' && (
              <div className="bg-[#0A0A0A] border-l-2 border-red-500 text-neutral-300 p-4 rounded-sm flex items-center text-sm font-medium">
                <AlertCircle className="mr-3 text-red-500" size={18} /> Database execution failed. Check console.
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
