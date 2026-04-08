'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Clock, CheckSquare, Square, Target, Loader2, ArrowLeft, Trash2, ListPlus, Rocket, Server } from 'lucide-react'

export default function AdminQueueManager() {
  const router = useRouter()
  const [queuedSetups, setQueuedSetups] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeploying, setIsDeploying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('queued_analyses') 
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setQueuedSetups(data)
      setSelectedIds(new Set(data.map(s => s.id)))
    }
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === queuedSetups.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(queuedSetups.map(s => s.id)))
  }

  const deleteFromQueue = async (id: string) => {
    if (!window.confirm("Permanently delete this setup from the queue?")) return
    await supabase.from('queued_analyses').delete().eq('id', id)
    setQueuedSetups(prev => prev.filter(s => s.id !== id))
    const newSelected = new Set(selectedIds)
    newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  // 🚀 MANUAL FORCE DROP (Overrides Vercel Cron)
  const handlePushLive = async () => {
    if (selectedIds.size === 0) return alert("Select at least one setup to push live.")
    
    const confirmDeploy = window.confirm(`Transfer ${selectedIds.size} setups to the LIVE Analysis table?`)
    if (!confirmDeploy) return

    setIsDeploying(true)
    try {
      const idsArray = Array.from(selectedIds)
      
      const { data: itemsToMove, error: fetchError } = await supabase
        .from('queued_analyses')
        .select('*')
        .in('id', idsArray)

      if (fetchError || !itemsToMove) throw fetchError

      const liveItems = itemsToMove.map(item => ({
        asset_symbol: item.asset_symbol,
        category: item.category,
        timeframe: item.timeframe,
        bias: item.bias,
        title: item.title,
        content: item.content,
        tier_access: item.tier_access,
        is_featured: item.is_featured,
        image_url: item.image_url,
        status: 'ACTIVE' 
      }))

      const { error: insertError } = await supabase.from('analyses').insert(liveItems)
      if (insertError) throw insertError

      const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray)
      if (deleteError) throw deleteError

      fetchQueue()
      setSelectedIds(new Set())
    } catch (err: any) {
      alert(`Transfer failed: ${err.message}`)
    } finally {
      setIsDeploying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-zinc-950">
        <Clock className="animate-pulse text-zinc-500" size={28} />
        <span className="text-sm font-medium text-zinc-500">Loading Staging Environment...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] max-w-[1600px] mx-auto p-4 md:p-6 bg-zinc-950 animate-in fade-in duration-500">
      
      <button onClick={() => router.push('/admin/analysis')} className="flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors mb-6 w-fit">
        <ArrowLeft size={14} className="mr-1.5" /> Back to Inbox
      </button>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2 mb-1">
            Dark Pool Queue
          </h2>
          <p className="text-sm text-zinc-400">
            {queuedSetups.length} {queuedSetups.length === 1 ? 'setup' : 'setups'} staging for automated deployment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          {/* Static Backend Status Display (Replaces old clunky time editor) */}
          <div className="flex items-center justify-between w-full sm:w-auto bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-2.5">
            <span className="text-xs text-zinc-400 font-medium mr-4 flex items-center">
              <Server size={14} className="mr-2" /> Backend Status
            </span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide">
                Vercel Active
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handlePushLive}
            disabled={isDeploying || selectedIds.size === 0}
            className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isDeploying ? <Loader2 size={16} className="animate-spin mr-2" /> : <Rocket size={16} className="mr-2" />}
            {isDeploying ? 'Deploying...' : `Force Drop (${selectedIds.size})`}
          </button>
        </div>
      </div>

      {/* --- FLAT LIST VIEW --- */}
      <div className="flex flex-col flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden relative shadow-sm">
        
        <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between select-none">
          <button onClick={toggleSelectAll} className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
            {selectedIds.size === queuedSetups.length && queuedSetups.length > 0 ? <CheckSquare size={16} className="text-zinc-300" /> : <Square size={16} />}
            Select All
          </button>
          <span className="text-xs text-zinc-500 font-medium">Status: Staging</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            {queuedSetups.length === 0 ? (
              <div className="flex flex-col items-center py-16 opacity-50">
                <ListPlus size={32} className="text-zinc-500 mb-3 stroke-1" />
                <p className="text-sm font-medium text-zinc-400">The dark pool is currently empty.</p>
              </div>
            ) : (
              queuedSetups.map(setup => {
                const isSelected = selectedIds.has(setup.id)
                
                return (
                  <div 
                    key={setup.id} 
                    className={`px-4 py-3.5 flex items-center gap-4 rounded-lg transition-colors ${isSelected ? 'bg-zinc-800/80 shadow-sm' : 'hover:bg-zinc-800/40'}`}
                  >
                    <div className="shrink-0 cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors" onClick={() => toggleSelect(setup.id)}>
                      {isSelected ? <CheckSquare size={16} className="text-zinc-200" /> : <Square size={16} />}
                    </div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0 cursor-pointer" onClick={() => toggleSelect(setup.id)}>
                      <div className="flex items-center gap-4 truncate">
                        <div className="flex items-baseline gap-2.5 shrink-0 min-w-[100px]">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>{setup.asset_symbol}</span>
                          <span className="text-xs font-medium text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-800/50">{setup.timeframe}</span>
                        </div>
                        <span className="text-sm text-zinc-500 truncate max-w-md hidden md:block">
                          {setup.content || setup.title || <span className="italic opacity-50">No notes attached</span>}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 shrink-0">
                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                          <Clock size={14} className="opacity-50" />
                          Pending Backend Drop
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteFromQueue(setup.id); }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete from Queue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
