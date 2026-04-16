'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Plus, X, UploadCloud, Crosshair, 
  Target, ArrowRight, ArrowLeft, Eye, Bold, List,
  Image as ImageIcon, Trash2, Menu, Activity, AlertTriangle, CheckCircle, Save
} from 'lucide-react'

// Initialize the Next.js SSR Browser Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// --- BULK UPLOAD MODAL COMPONENT ---
type DraftSetup = {
  id: string;
  imageSource: string | null;
  file: File | null;
  instrument: string;
  notes: string;
}

function SetupUploadModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (setups: any[]) => void }) {
  const [drafts, setDrafts] = useState<DraftSetup[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [linkInput, setLinkInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const extractInstrument = (text: string) => {
    const match = text.toUpperCase().match(/[A-Z]{6}/)
    return match ? match[0] : ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newDrafts: DraftSetup[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        imageSource: URL.createObjectURL(file),
        file,
        instrument: extractInstrument(file.name),
        notes: ''
      }))
      setDrafts(prev => [...prev, ...newDrafts])
      if (drafts.length === 0) setActiveIndex(0)
    }
  }

  const handleAddLink = () => {
    if (!linkInput) return
    const newDraft: DraftSetup = {
      id: Math.random().toString(36).substr(2, 9),
      imageSource: linkInput,
      file: null,
      instrument: extractInstrument(linkInput),
      notes: ''
    }
    setDrafts(prev => [...prev, newDraft])
    setLinkInput('')
    if (drafts.length === 0) setActiveIndex(0)
  }

  const updateActiveDraft = (field: keyof DraftSetup, value: string) => {
    setDrafts(prev => prev.map((d, i) => i === activeIndex ? { ...d, [field]: value } : d))
  }

  const removeDraft = (index: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== index))
    if (activeIndex >= index && activeIndex > 0) setActiveIndex(activeIndex - 1)
  }

  const handleSaveAll = async () => {
    setIsUploading(true)
    const validDrafts = drafts.filter(d => d.instrument.trim() !== '')
    await onSave(validDrafts)
    setIsUploading(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setDrafts([])
        setActiveIndex(0)
        setLinkInput('')
      }, 200)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden h-[80vh] min-h-[500px]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={16} className="text-blue-500" /> Bulk Upload Weekly Setups
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" disabled={isUploading}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-[200px] border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col shrink-0">
            <div className="p-3 border-b border-zinc-800/50 flex flex-col gap-2 shrink-0">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded transition-colors flex items-center justify-center gap-1.5" disabled={isUploading}>
                <Plus size={14} /> Add Images
              </button>
              <div className="flex gap-1">
                <input 
                  type="text" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} 
                  placeholder="Paste URL..." className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] text-zinc-300 outline-none focus:border-blue-500"
                  disabled={isUploading}
                />
                <button onClick={handleAddLink} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 rounded transition-colors" disabled={isUploading}><Plus size={12}/></button>
              </div>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2 text-white">
              {drafts.map((draft, idx) => (
                <div 
                  key={draft.id} onClick={() => setActiveIndex(idx)}
                  className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition-all ${activeIndex === idx ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}
                >
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                    {draft.imageSource ? <img src={draft.imageSource} className="w-full h-full object-cover opacity-80" /> : <ImageIcon size={12} className="m-auto mt-2 text-zinc-600"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{draft.instrument || 'UNKNOWN'}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{draft.notes ? 'Notes added' : 'No notes'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDraft(idx); }} className="text-zinc-600 hover:text-red-400 p-1" disabled={isUploading}><X size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 overflow-y-auto custom-scrollbar">
            {drafts.length > 0 && drafts[activeIndex] ? (
              <div className="p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full text-white">
                <div className="w-full aspect-[16/9] bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {drafts[activeIndex].imageSource ? <img src={drafts[activeIndex].imageSource!} alt="Preview" className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-10 h-10 text-zinc-700" />}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Instrument Ticker</label>
                  <input 
                    type="text" value={drafts[activeIndex].instrument}
                    onChange={(e) => updateActiveDraft('instrument', e.target.value.toUpperCase())}
                    placeholder="e.g. GBPUSD" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                    disabled={isUploading}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Structural Thesis</label>
                  <textarea 
                    value={drafts[activeIndex].notes}
                    onChange={(e) => updateActiveDraft('notes', e.target.value)}
                    placeholder="Log structural bias..." className="w-full min-h-[120px] flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                    disabled={isUploading}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                <UploadCloud size={40} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Add images or links to start bulk uploading.</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center shrink-0">
          <span className="text-xs font-medium text-zinc-500">{drafts.length} {drafts.length === 1 ? 'setup' : 'setups'} staged</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" disabled={isUploading}>Cancel</button>
            <button 
              onClick={handleSaveAll}
              disabled={drafts.length === 0 || drafts.some(d => d.instrument.trim() === '') || isUploading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isUploading ? 'Saving...' : 'Save All to Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- PROFESSIONAL RICH TEXT EDITOR ---
function RichNotesEditor({ activeSetup, onUpdate }: { activeSetup: any, onUpdate: (id: string, notes: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && activeSetup) {
      if (editorRef.current.innerHTML !== activeSetup.notes) {
        editorRef.current.innerHTML = activeSetup.notes || '';
      }
    }
  }, [activeSetup?.id]);

  const handleInput = () => {
    if (editorRef.current && activeSetup) {
      onUpdate(activeSetup.id, editorRef.current.innerHTML);
    }
  };

  const handleCommand = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    handleInput();
    editorRef.current?.focus();
  };

  if (!activeSetup) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No active notes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-800/60 shrink-0">
        <button onClick={() => handleCommand('bold')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Bold Text"><Bold size={14} /></button>
        <button onClick={() => handleCommand('insertUnorderedList')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Bullet Points"><List size={14} /></button>
        <span className="ml-auto text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">Notes Editor</span>
      </div>
      <div 
        ref={editorRef} contentEditable onBlur={handleInput}
        className="flex-1 w-full bg-transparent border-none focus:outline-none text-xs text-zinc-300 leading-relaxed font-medium custom-scrollbar overflow-y-auto"
        style={{ outline: 'none' }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        div[contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        div[contenteditable] li { margin-bottom: 0.25rem; }
        div[contenteditable] b { color: #f4f4f5; font-weight: 800; }
        div[contenteditable]:empty:before { content: "Type notes here..."; color: #52525b; pointer-events: none; display: block; }
      `}} />
    </div>
  )
}

// 🚨 EXTRACTED ITEM: Ensures `useState` runs perfectly.
function ReconciliationItem({ trade, onSave }: { trade: any, onSave: (id: string, outcome: string, rr: string) => void }) {
  const [outcome, setOutcome] = useState(''); 
  const [rr, setRr] = useState('');

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm shrink-0 hover:border-zinc-700 transition-colors">
      <div className="flex flex-col gap-1 w-1/3 min-w-0 pr-2">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-bold text-zinc-400">{trade.day}</span>
          <span className="text-sm font-bold text-zinc-200">{trade.symbol}</span>
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${trade.execution === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trade.execution}
          </span>
          {trade.reason && <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate">• {trade.reason}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <select value={outcome} onChange={e => setOutcome(e.target.value)} className="bg-black border border-zinc-800 rounded-lg px-2 py-2 text-[10px] sm:text-xs font-bold text-zinc-300 outline-none uppercase w-24 sm:w-28 focus:border-blue-500 transition-colors">
          <option value="">Outcome</option>
          <option value="TP">Hit TP</option>
          <option value="SL">Hit SL</option>
          <option value="BE">Break Even</option>
        </select>
        
        <div className="relative w-20 sm:w-24">
          <input 
            type="number" 
            value={rr} 
            onChange={e => setRr(e.target.value)} 
            placeholder="0.0" 
            className="w-full bg-black border border-zinc-800 rounded-lg pl-7 sm:pl-8 pr-2 py-2 text-[10px] sm:text-xs font-bold text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-blue-500 transition-colors"
          />
          <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RR</span>
        </div>

        <button 
          disabled={!outcome || !rr} 
          onClick={() => onSave(trade.id, outcome, rr)} 
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg transition-colors shadow-sm"
          title="Save Reconciled Data"
        >
          <Save size={14} />
        </button>
      </div>
    </div>
  )
}

// --- MAIN DESK COMPONENT ---
export default function DeskClient() {
  const [user, setUser] = useState<any>(null)
  const [isVaultOpen, setIsVaultOpen] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [confirmPushId, setConfirmPushId] = useState<string | null>(null)
  const [previewSetup, setPreviewSetup] = useState<any | null>(null)
  
  const [setups, setSetups] = useState<any[]>([])
  const [pendingReconciliation, setPendingReconciliation] = useState<any[]>([])

  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [logPair, setLogPair] = useState<string>('') 
  const [logExecution, setLogExecution] = useState<'Perfect' | 'Imperfect' | null>(null)
  const [logReason, setLogReason] = useState('')

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      
      if (user) {
        setUser(user)
        const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (setupsData) {
          setSetups(setupsData.map(d => ({
            id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url, isToday: d.is_today, addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null
          })))
        }
        const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', user.id).eq('is_reconciled', false).order('created_at', { ascending: false })
        if (logsData) {
          setPendingReconciliation(logsData.map(d => ({
            id: d.id, day: new Date(d.created_at).toLocaleDateString('en-US', { weekday: 'short' }), symbol: d.symbol, execution: d.execution_type, reason: d.reason, rr: d.rr, outcome: d.outcome
          })))
          const today = new Date().toDateString()
          const todaysLogs = logsData.filter(d => new Date(d.created_at).toDateString() === today)
          setTradesTakenToday(todaysLogs.length)
        }
      }
    }
    initData()
  }, [])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null)

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
      if(logPair) setLogPair('') 
    }
  }, [todaySetups.length, activeTodayId])

  useEffect(() => {
    const activeSetup = setups.find(s => s.id === activeTodayId)
    if (activeSetup && user) {
      const timeoutId = setTimeout(() => {
        supabase.from('user_desk_setups').update({ notes: activeSetup.notes }).eq('id', activeSetup.id).then()
      }, 1500)
      return () => clearTimeout(timeoutId)
    }
  }, [setups, activeTodayId, user])

  const handleConfirmPush = async () => {
    if(confirmPushId && user) {
      const now = new Date()
      setSetups(prev => prev.map(s => s.id === confirmPushId ? { ...s, isToday: true, addedToTodayAt: now.getTime() } : s))
      setConfirmPushId(null)
      await supabase.from('user_desk_setups').update({ is_today: true, added_to_today_at: now.toISOString() }).eq('id', confirmPushId)
    }
  }

  const toggleTodayStatus = async (id: string) => {
    if (!user) return
    const setup = setups.find(s => s.id === id)
    if (!setup) return
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday, addedToTodayAt: null } : s))
    await supabase.from('user_desk_setups').update({ is_today: !setup.isToday, added_to_today_at: null }).eq('id', id)
  }

  const deleteSetup = async (id: string) => {
    if (!user) return
    const setupToDelete = setups.find(s => s.id === id);
    if (setupToDelete && setupToDelete.imageUrl && setupToDelete.imageUrl.includes('supabase')) {
        const urlParts = setupToDelete.imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) await supabase.storage.from('user-desk-images').remove([`${user.id}/${fileName}`])
    }
    setSetups(prev => prev.filter(s => s.id !== id))
    await supabase.from('user_desk_setups').delete().eq('id', id)
  }

  const handleBulkUpload = async (draftsToSave: any[]) => {
    if (!user) {
      alert("Authentication Error: No active user session found. Please make sure you are logged in to Supabase.")
      return
    }
    const newSetups = []
    
    for (const draft of draftsToSave) {
      let finalImageUrl = draft.imageSource
      
      if (draft.file) {
        const fileExt = draft.file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data, error } = await supabase.storage.from('user-desk-images').upload(`${user.id}/${fileName}`, draft.file)
        
        if (error) {
          console.error("Supabase Storage Error:", error)
          alert(`Failed to upload ${draft.instrument} image:\n${error.message}`)
          return 
        }
        
        if (data) {
          const { data: publicUrlData } = supabase.storage.from('user-desk-images').getPublicUrl(`${user.id}/${fileName}`)
          finalImageUrl = publicUrlData.publicUrl
        }
      } else if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
         finalImageUrl = null 
      }

      newSetups.push({ user_id: user.id, symbol: draft.instrument, notes: draft.notes, image_url: finalImageUrl, is_today: false })
    }

    const { data: insertedData, error: dbError } = await supabase.from('user_desk_setups').insert(newSetups).select()
    
    if (dbError) {
      console.error("Database Insert Error:", dbError)
      alert(`Database Save Failed:\n${dbError.message}`)
    } else if (insertedData) {
      const formatted = insertedData.map(d => ({ id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url, isToday: false, addedToTodayAt: null }))
      setSetups(prev => [...formatted, ...prev])
    }
  }

  const handleUpdateNotes = (id: string, newNotes: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: newNotes } : s))
  }

  const handleLockEntry = async () => {
    if (tradesTakenToday < 2 && logPair && logExecution && user) {
      const newLog = { user_id: user.id, symbol: logPair, execution_type: logExecution, reason: logReason || null }
      const { data } = await supabase.from('user_desk_logs').insert([newLog]).select()
      if (data && data[0]) {
        setTradesTakenToday(prev => prev + 1);
        setPendingReconciliation(prev => [{ id: data[0].id, day: new Date(data[0].created_at).toLocaleDateString('en-US', { weekday: 'short' }), symbol: data[0].symbol, execution: data[0].execution_type, reason: data[0].reason, rr: '', outcome: '' }, ...prev]);
      }
      setLogPair(''); setLogExecution(null); setLogReason('');
    }
  }

  const handleSaveReconciliation = async (id: string, outcome: string, rr: string) => {
    if (!user) return
    setPendingReconciliation(prev => prev.filter(p => p.id !== id))
    await supabase.from('user_desk_logs').update({ is_reconciled: true, outcome: outcome || null, rr: rr ? parseFloat(rr) : null }).eq('id', id)
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  const isAlreadyLogged = pendingReconciliation.some(t => t.symbol === logPair);

  // 🚨 NEW STRUCTURAL LAYOUT 🚨
  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-black text-zinc-300 font-sans p-2 gap-2 overflow-hidden">
      
      {/* LEFT/MAIN WORKSPACE: Split into Top & Bottom Cards */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2">
        
        {/* =========================================
            TOP 50%: TODAY's FOCUS CARD
        ========================================= */}
        <div className="flex-[1.2] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative min-h-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/50 to-transparent"></div>
          
          {/* Header */}
          <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-blue-500" /> Today's Focus
              </h2>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-black border border-zinc-800 px-2 py-0.5 rounded shadow-inner">
                {todaySetups.length} Pairs Locked
              </span>
            </div>
            {/* Vault Toggle Button */}
            <button 
              onClick={() => setIsVaultOpen(!isVaultOpen)} 
              className="text-zinc-400 hover:text-white transition-colors p-1.5 bg-black border border-zinc-800 rounded-md shadow-sm" 
              title="Toggle Weekly Vault"
            >
              <Menu size={14} />
            </button>
          </div>

          <div className="flex-1 flex flex-row min-h-0 min-w-0 overflow-hidden">
            {/* Pane 1: List Container */}
            <div className="w-56 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950/50 overflow-y-auto custom-scrollbar p-3 gap-2 min-h-0 text-white">
              {todaySetups.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-center p-4">
                  <Target size={20} className="mb-2 opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">No Pairs Selected</span>
                </div>
              ) : (
                todaySetups.map(setup => {
                  const canRemove = setup.addedToTodayAt && (Date.now() - setup.addedToTodayAt < 3600000);
                  return (
                    <div 
                      key={`today-${setup.id}`} 
                      onClick={() => setActiveTodayId(setup.id)} 
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer group shrink-0 ${
                        activeTodayId === setup.id 
                          ? 'bg-zinc-800 border-zinc-600 shadow-md' 
                          : 'bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {setup.symbol}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setLogPair(setup.symbol); }} className="p-1.5 rounded hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 transition-colors" title="Stage Execution">
                          <Target size={14} />
                        </button>
                        {canRemove && (
                          <button onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }} className="p-1.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors" title="Remove (1hr limit)">
                            <ArrowLeft size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pane 2: Chart Container */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black relative shadow-inner">
              {activeSetup?.imageUrl ? (
                <div className="absolute inset-0 p-4 flex items-center justify-center">
                  <img src={activeSetup.imageUrl} alt={activeSetup.symbol} className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/60 shadow-2xl bg-zinc-950" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-700 min-h-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair</span>
                </div>
              )}
            </div>

            {/* Pane 3: Notes Container */}
            <div className="w-80 shrink-0 flex flex-col min-h-0 min-w-0 p-4 border-l border-zinc-800 bg-zinc-950/50">
              <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 shadow-inner flex flex-col min-h-0">
                <RichNotesEditor activeSetup={activeSetup} onUpdate={handleUpdateNotes} />
              </div>
            </div>
          </div>
        </div>
        
        {/* =========================================
            BOTTOM 50%: OPERATOR'S AUDIT CARD
        ========================================= */}
        <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative min-h-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-600/50 to-transparent"></div>
          
          {/* Header */}
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> Operator's Audit
            </h2>
          </div>

          <div className="flex-1 flex flex-row min-h-0 min-w-0 overflow-hidden">
            
            {/* Capture Panel */}
            <div className="flex-1 border-r border-zinc-800 p-6 flex flex-col items-center justify-center relative bg-zinc-950/50">
              <div className="w-full max-w-sm flex flex-col gap-4 m-auto shrink-0 text-white">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-sm font-bold text-zinc-200">Log Execution Reality</h3>
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-black border shadow-inner ${tradesTakenToday >= 2 ? 'border-red-500/50 text-red-400' : 'border-zinc-800 text-zinc-400'}`}>
                    {tradesTakenToday}/2 TRADES
                  </span>
                </div>

                {!logPair ? (
                  <div className="h-12 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center bg-black">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Stage a pair from Today's Focus</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-black border border-zinc-700 rounded-lg px-4 py-3 shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Target Acquired</span>
                    <span className="text-sm font-black text-white tracking-wider">{logPair}</span>
                    <button onClick={() => { setLogPair(''); setLogExecution(null); setLogReason(''); }} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-1">
                  <button 
                    disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged}
                    onClick={() => setLogExecution('Perfect')}
                    className={`flex-1 py-5 border rounded-xl flex flex-col items-center gap-2.5 transition-all ${!logPair || isAlreadyLogged ? 'opacity-50' : ''} ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-black border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                  >
                    <CheckCircle size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Perfect<br/>Execution</span>
                  </button>
                  <button 
                    disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged}
                    onClick={() => setLogExecution('Imperfect')}
                    className={`flex-1 py-5 border rounded-xl flex flex-col items-center gap-2.5 transition-all ${!logPair || isAlreadyLogged ? 'opacity-50' : ''} ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-black border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                  >
                    <AlertTriangle size={22} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Imperfect<br/>Execution</span>
                  </button>
                </div>

                {logExecution === 'Imperfect' && !isAlreadyLogged && (
                  <select 
                    value={logReason}
                    onChange={(e) => setLogReason(e.target.value)}
                    className="w-full bg-black border border-red-500/30 rounded-lg px-4 py-3 text-xs font-bold text-zinc-300 outline-none uppercase focus:border-red-500/80 transition-colors shadow-inner mt-1"
                  >
                    <option value="" disabled>Select Catalyst (Optional)</option>
                    <option value="FOMO">FOMO / Rushed Entry</option>
                    <option value="Revenge">Revenge Trading</option>
                    <option value="Boredom">Boredom / Forced Setup</option>
                    <option value="Ignored Plan">Ignored Trading Plan</option>
                  </select>
                )}

                <button 
                  disabled={!logPair || !logExecution || tradesTakenToday >= 2 || isAlreadyLogged}
                  onClick={handleLockEntry}
                  className={`w-full py-3.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors mt-2 ${
                    isAlreadyLogged 
                      ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:shadow-none'
                  }`}
                >
                  {isAlreadyLogged ? 'Already Logged Today' : 'Lock Entry Without Outcome'}
                </button>
              </div>
            </div>

            {/* Queue Panel */}
            <div className="flex-[1.2] p-6 overflow-y-auto custom-scrollbar bg-black shadow-inner min-h-0 min-w-0 text-white relative">
              <div className="mb-6 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekend Reconciliation Queue</span>
              </div>

              <div className="flex flex-col gap-3">
                {pendingReconciliation.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl mx-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No pending setups</span>
                  </div>
                ) : (
                  pendingReconciliation.map((trade) => (
                    <ReconciliationItem key={trade.id} trade={trade} onSave={handleSaveReconciliation} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* =========================================
          RIGHT WORKSPACE: WEEKLY VAULT CARD
      ========================================= */}
      <div className={`h-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl relative transition-all duration-300 flex flex-col overflow-hidden shrink-0 ${isVaultOpen ? 'w-[280px] lg:w-[340px] opacity-100' : 'w-0 opacity-0 border-none'}`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/50 to-transparent"></div>
        
        <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0 text-white">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={14} className="text-purple-400" /> Weekly Vault
          </h2>
        </div>
        
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar p-3 text-white">
          {weeklySetups.length === 0 ? (
            <div className="text-center p-6 text-zinc-600">
              <span className="text-[10px] font-bold uppercase tracking-widest">Vault is empty</span>
            </div>
          ) : (
            weeklySetups.map((setup) => (
              <div 
                key={`weekly-${setup.id}`} 
                className="w-full p-3 border border-zinc-800/80 bg-black rounded-lg flex justify-between items-center group hover:border-zinc-600 transition-colors shrink-0 shadow-sm"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[13px] font-bold tracking-wide text-zinc-300 group-hover:text-white transition-colors truncate">{setup.symbol}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate">{setup.notes ? 'Notes Logged' : 'No Notes'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewSetup(setup)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white" title="View Details">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => deleteSetup(setup.id)} className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setConfirmPushId(setup.id)} className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest bg-zinc-900 border border-zinc-700 hover:bg-blue-600 px-2.5 py-1.5 rounded flex items-center gap-1 shadow-sm">
                    Push <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 shrink-0">
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="w-full py-3 px-4 flex items-center justify-center gap-2 border border-dashed border-zinc-700 bg-black rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all shadow-inner hover:shadow-none"
          >
            <Plus size={14} /> Add Weekly Setups
          </button>
        </div>
      </div>

      {/* =========================================
          MODALS
      ========================================= */}
      {confirmPushId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Confirm Push</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Lock this setup into Today's Focus? Removal is only allowed for the first 60 minutes.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPushId(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase hover:bg-zinc-800">Cancel</button>
              <button onClick={handleConfirmPush} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase shadow-md hover:bg-blue-500">Push to Today</button>
            </div>
          </div>
        </div>
      )}

      {previewSetup && (
        <div onClick={() => setPreviewSetup(null)} className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out">
          <div onClick={e => e.stopPropagation()} className="max-w-6xl w-full h-full max-h-[800px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden cursor-default">
            
            <div className="flex-[2.5] bg-black border-r border-zinc-800 p-4 sm:p-6 flex items-center justify-center relative shadow-inner">
              {previewSetup.imageUrl ? (
                <img src={previewSetup.imageUrl} alt={previewSetup.symbol} className="w-full h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No Image Data</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col min-w-[300px] overflow-hidden bg-zinc-950">
              <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
                <span className="text-base font-black text-white tracking-widest">{previewSetup.symbol} Setup</span>
                <button onClick={() => setPreviewSetup(null)} className="text-zinc-500 hover:text-white p-1 bg-black border border-zinc-800 rounded shadow-sm">
                  <X size={16} />
                </button>
              </div>
              <div 
                className="p-6 overflow-y-auto custom-scrollbar flex-1 text-[13px] text-zinc-300 font-medium leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: previewSetup.notes || '<p class="text-zinc-600 italic">No notes logged for this setup.</p>' }} 
              />
            </div>
          </div>
        </div>
      )}

      <SetupUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSave={handleBulkUpload} />
    </div>
  )
}
