'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Clock, CheckSquare, Square, Target, Loader2, ArrowLeft, Trash2, ListPlus, Edit2, X, Rocket, Server } from 'lucide-react'

export default function AdminQueueManager() {
  const router = useRouter()
  const [queuedSetups, setQueuedSetups] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeploying, setIsDeploying] = useState(false)
  const [loading, setLoading] = useState(true)

  // 🌍 SUPABASE CLOCK STATE
  const [releaseHour, setReleaseHour] = useState<string>('08')
  const [releaseMinute, setReleaseMinute] = useState<string>('00')
  const [releaseAmPm, setReleaseAmPm] = useState<string>('AM')
  const [isSaved, setIsSaved] = useState(false)

  // 🕒 MODAL STATE FOR TIME EDITOR
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  const [tempHour, setTempHour] = useState('08')
  const [tempMinute, setTempMinute] = useState('00')
  const [tempAmPm, setTempAmPm] = useState('AM')

  const dailyReleaseTime = `${releaseHour}:${releaseMinute} ${releaseAmPm}`

  useEffect(() => {
    fetchGlobalSettings()
    fetchQueue()
  }, [])

  // 🚨 1. FETCH TIME FROM SUPABASE (Backend Source of Truth)
  const fetchGlobalSettings = async () => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('global_release_time')
      .eq('id', 1)
      .single()

    if (data && data.global_release_time) {
      const match = data.global_release_time.match(/(\d{2}):(\d{2})\s(AM|PM)/)
      if (match) {
        setReleaseHour(match[1])
        setReleaseMinute(match[2])
        setReleaseAmPm(match[3])
      }
    }
  }

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

  // --- TIME EDITOR LOGIC ---
  const openTimeEditor = () => {
    setTempHour(releaseHour)
    setTempMinute(releaseMinute)
    setTempAmPm(releaseAmPm)
    setIsTimeModalOpen(true)
  }

  // 🚨 2. SAVE TIME DIRECTLY TO SUPABASE
  const saveTimeEditor = async () => {
    let finalH = parseInt(tempHour) || 12
    let finalM = parseInt(tempMinute) || 0
    if (finalH > 12) finalH = 12
    if (finalH < 1) finalH = 12
    if (finalM > 59) finalM = 59
    if (finalM < 0) finalM = 0

    const formattedH = finalH.toString().padStart(2, '0')
    const formattedM = finalM.toString().padStart(2, '0')
    const newTime = `${formattedH}:${formattedM} ${tempAmPm}`

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({ global_release_time: newTime })
        .eq('id', 1)

      if (error) throw error

      setReleaseHour(formattedH)
      setReleaseMinute(formattedM)
      setReleaseAmPm(tempAmPm)
      
      setIsTimeModalOpen(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err: any) {
      alert(`Failed to save schedule: ${err.message}`)
    }
  }

  const handleWheel = (e: React.WheelEvent, type: 'hour' | 'minute') => {
    e.preventDefault()
    const dir = e.deltaY > 0 ? -1 : 1 

    if (type === 'hour') {
      let next = (parseInt(tempHour) || 12) + dir
      if (next > 12) next = 1
      if (next < 1) next = 12
      setTempHour(next.toString().padStart(2, '0'))
    } else {
      let next = (parseInt(tempMinute) || 0) + dir
      if (next > 59) next = 0
      if (next < 0) next = 59
      setTempMinute(next.toString().padStart(2, '0'))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hour' | 'minute') => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val.length > 2) return
    if (type === 'hour') setTempHour(val)
    if (type === 'minute') setTempMinute(val)
  }

  const handleTimeBlur = (type: 'hour' | 'minute') => {
    if (type === 'hour') {
      let val = parseInt(tempHour)
      if (isNaN(val) || val < 1) val = 12
      if (val > 12) val = 12
      setTempHour(val.toString().padStart(2, '0'))
    } else {
      let val = parseInt(tempMinute)
      if (isNaN(val)) val = 0
      if (val > 59) val = 59
      setTempMinute(val.toString().padStart(2, '0'))
    }
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

  // 🚀 FORCE DROP (WITH AUTO-ARCHIVE AND TELEGRAM BROADCAST)
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

      // 🚨 AUTO-ARCHIVE LOGIC: Clean the floor before dropping new setups manually
      for (const item of liveItems) {
        await supabase
          .from('analyses')
          .update({ status: 'ARCHIVED' })
          .eq('asset_symbol', item.asset_symbol)
          .eq('timeframe', item.timeframe)
          .in('status', ['WAITING', 'ACTIVE']);
      }

      const { error: insertError } = await supabase.from('analyses').insert(liveItems)
      if (insertError) throw insertError

      const { error: deleteError } = await supabase.from('queued_analyses').delete().in('id', idsArray)
      if (deleteError) throw deleteError

      // 🚨 TRIGGER MANUAL TELEGRAM BROADCAST
      fetch('/api/admin/broadcast', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      }).catch(console.error);

      fetchQueue()
      setSelectedIds(new Set())
      alert("Analysis released! Telegram community notified.")
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
          
          {/* Active Auto-Drop Editor Card */}
          <div className="flex items-center justify-between w-full sm:w-auto bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-3 mr-6">
              <span className="text-xs text-zinc-400 font-medium flex items-center">
                <Clock size={14} className="mr-1.5" /> Auto-Drop
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-mono text-zinc-200 tracking-wide">{releaseHour}:{releaseMinute}</span>
                <span className="text-xs font-medium text-amber-500/80">{releaseAmPm}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSaved && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mr-2 animate-pulse">Saved</span>}
              <button 
                onClick={openTimeEditor}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 bg-zinc-800/50 hover:bg-zinc-700/50 rounded"
                title="Edit Time"
              >
                <Edit2 size={14} />
              </button>
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
                          <Server size={14} className="opacity-50" />
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

      {/* 🕒 TIME EDITOR MODAL */}
      {isTimeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 ring-1 ring-zinc-800/50 rounded-2xl p-6 w-full max-w-[300px] shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-zinc-200">Schedule Time</h3>
              <button onClick={() => setIsTimeModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"><X size={16} /></button>
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={tempHour}
                  onChange={(e) => handleTimeChange(e, 'hour')}
                  onWheel={(e) => handleWheel(e, 'hour')}
                  onBlur={() => handleTimeBlur('hour')}
                  className="w-16 bg-zinc-900 ring-1 ring-zinc-800/50 rounded-xl text-center text-2xl font-mono text-zinc-200 py-3 outline-none focus:ring-zinc-700 transition-all select-all"
                />
                
                <span className="text-zinc-600 text-xl font-mono pb-1">:</span>
                
                <input 
                  type="text"
                  value={tempMinute}
                  onChange={(e) => handleTimeChange(e, 'minute')}
                  onWheel={(e) => handleWheel(e, 'minute')}
                  onBlur={() => handleTimeBlur('minute')}
                  className="w-16 bg-zinc-900 ring-1 ring-zinc-800/50 rounded-xl text-center text-2xl font-mono text-zinc-200 py-3 outline-none focus:ring-zinc-700 transition-all select-all"
                />

                <button 
                  onClick={() => setTempAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
                  className="w-14 bg-transparent hover:bg-zinc-800/50 rounded-xl text-center text-sm font-medium text-zinc-400 py-4 ml-1 transition-all select-none ring-1 ring-transparent hover:ring-zinc-800/50"
                >
                  {tempAmPm}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-4">Scroll or type to edit.</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsTimeModalOpen(false)}
                className="flex-1 py-2.5 bg-transparent text-zinc-400 text-xs font-medium hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={saveTimeEditor}
                className="flex-1 py-2.5 bg-zinc-100 text-zinc-900 text-xs font-semibold rounded-lg hover:bg-white transition-colors"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
