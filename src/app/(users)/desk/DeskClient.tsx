'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, X, UploadCloud, Crosshair, 
  Target, ArrowRight, ArrowLeft, Eye, Bold, List,
  Image as ImageIcon, Trash2, Menu, Activity, AlertTriangle, CheckCircle, Save
} from 'lucide-react'

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
    await onSave(drafts.filter(d => d.instrument.trim() !== ''))
    setIsUploading(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      setDrafts([]); setActiveIndex(0); setLinkInput('');
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2"><UploadCloud size={16} className="text-blue-500" /> Bulk Upload Weekly Setups</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" disabled={isUploading}><X size={18} /></button>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-[200px] border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col shrink-0">
            <div className="p-3 border-b border-zinc-800/50 flex flex-col gap-2 shrink-0">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded transition-colors flex items-center justify-center gap-1.5" disabled={isUploading}><Plus size={14} /> Add Images</button>
              <div className="flex gap-1">
                <input type="text" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="Paste URL..." className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] text-zinc-300 outline-none focus:border-blue-500" disabled={isUploading}/>
                <button onClick={handleAddLink} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 rounded transition-colors" disabled={isUploading}><Plus size={12}/></button>
              </div>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
              {drafts.map((draft, idx) => (
                <div key={draft.id} onClick={() => setActiveIndex(idx)} className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition-all ${activeIndex === idx ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-zinc-800/50'}`}>
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                    {draft.imageSource ? <img src={draft.imageSource} className="w-full h-full object-cover" /> : <ImageIcon size={12} className="m-auto mt-2 text-zinc-600"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{draft.instrument || '...'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDraft(idx); }} className="text-zinc-600 hover:text-red-400 p-1" disabled={isUploading}><X size={12}/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 overflow-y-auto custom-scrollbar">
            {drafts.length > 0 ? (
              <div className="p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
                <div className="w-full aspect-[16/9] bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center justify-center">
                  {drafts[activeIndex].imageSource ? <img src={drafts[activeIndex].imageSource!} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-10 h-10 text-zinc-700" />}
                </div>
                <input type="text" value={drafts[activeIndex].instrument} onChange={(e) => updateActiveDraft('instrument', e.target.value.toUpperCase())} placeholder="Ticker (e.g. EURUSD)" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none uppercase font-bold" disabled={isUploading} />
                <textarea value={drafts[activeIndex].notes} onChange={(e) => updateActiveDraft('notes', e.target.value)} placeholder="Structural notes..." className="w-full min-h-[120px] bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none resize-none" disabled={isUploading} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600"><UploadCloud size={40} className="mb-4 opacity-50" /><p className="text-sm font-medium">Add images or links to start.</p></div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center">
          <span className="text-xs font-medium text-zinc-500">{drafts.length} setups staged</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-xs font-bold uppercase text-zinc-400 hover:text-white" disabled={isUploading}>Cancel</button>
            <button onClick={handleSaveAll} disabled={drafts.length === 0 || isUploading} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase disabled:opacity-50">
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
    if (editorRef.current && activeSetup) onUpdate(activeSetup.id, editorRef.current.innerHTML);
  };

  const handleCommand = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    handleInput();
    editorRef.current?.focus();
  };

  if (!activeSetup) return <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No active notes</div>;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-800/60 shrink-0">
        <button onClick={() => handleCommand('bold')} className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"><Bold size={14} /></button>
        <button onClick={() => handleCommand('insertUnorderedList')} className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"><List size={14} /></button>
        <span className="ml-auto text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">Editor</span>
      </div>
      <div ref={editorRef} contentEditable onBlur={handleInput} className="flex-1 w-full bg-transparent border-none focus:outline-none text-xs text-zinc-300 leading-relaxed font-medium overflow-y-auto custom-scrollbar" />
      <style dangerouslySetInnerHTML={{__html: `
        div[contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; }
        div[contenteditable] b { color: #f4f4f5; font-weight: 800; }
        div[contenteditable]:empty:before { content: "Type notes here..."; color: #52525b; pointer-events: none; display: block; }
      `}} />
    </div>
  )
}

// --- MAIN DESK COMPONENT ---
export default function DeskClient() {
  const supabase = createClientComponentClient()
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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (setupsData) setSetups(setupsData.map(d => ({ id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url, isToday: d.is_today, addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null })))
        
        const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', user.id).eq('is_reconciled', false).order('created_at', { ascending: false })
        if (logsData) {
          setPendingReconciliation(logsData.map(d => ({ id: d.id, day: new Date(d.created_at).toLocaleDateString('en-US', { weekday: 'short' }), symbol: d.symbol, execution: d.execution_type, reason: d.reason, rr: d.rr, outcome: d.outcome })))
          const todayStr = new Date().toDateString()
          setTradesTakenToday(logsData.filter(d => new Date(d.created_at).toDateString() === todayStr).length)
        }
      }
    }
    initData()
  }, [])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null)

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) setActiveTodayId(todaySetups[0].id)
    else if (todaySetups.length === 0) { setActiveTodayId(null); setLogPair(''); }
  }, [todaySetups.length, activeTodayId])

  // Debounced Auto-save
  useEffect(() => {
    const activeSetup = setups.find(s => s.id === activeTodayId)
    if (activeSetup && user) {
      const timeoutId = setTimeout(() => { supabase.from('user_desk_setups').update({ notes: activeSetup.notes }).eq('id', activeSetup.id).then() }, 1500)
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
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday, addedToTodayAt: null } : s))
    await supabase.from('user_desk_setups').update({ is_today: !setup.isToday, added_to_today_at: null }).eq('id', id)
  }

  const deleteSetup = async (id: string) => {
    if (!user) return
    const setupToDelete = setups.find(s => s.id === id)
    if (setupToDelete?.imageUrl?.includes('user-desk-images')) {
      const fileName = setupToDelete.imageUrl.split('/').pop()
      if (fileName) await supabase.storage.from('user-desk-images').remove([`${user.id}/${fileName}`])
    }
    setSetups(prev => prev.filter(s => s.id !== id))
    await supabase.from('user_desk_setups').delete().eq('id', id)
  }

  const handleBulkUpload = async (draftsToSave: any[]) => {
    if (!user) return
    const newRows = []
    for (const d of draftsToSave) {
      let url = d.imageSource
      if (d.file) {
        const fileName = `${Math.random()}.${d.file.name.split('.').pop()}`
        const { data } = await supabase.storage.from('user-desk-images').upload(`${user.id}/${fileName}`, d.file)
        if (data) url = supabase.storage.from('user-desk-images').getPublicUrl(`${user.id}/${fileName}`).data.publicUrl
      }
      newRows.push({ user_id: user.id, symbol: d.instrument, notes: d.notes, image_url: url, is_today: false })
    }
    const { data: inserted } = await supabase.from('user_desk_setups').insert(newRows).select()
    if (inserted) setSetups(prev => [...inserted.map(d => ({ id: d.id, symbol: d.symbol, notes: d.notes, imageUrl: d.image_url, isToday: false, addedToTodayAt: null })), ...prev])
  }

  const handleUpdateNotes = (id: string, newNotes: string) => setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: newNotes } : s));

  const handleLockEntry = async () => {
    if (tradesTakenToday < 2 && logPair && logExecution && user) {
      const { data } = await supabase.from('user_desk_logs').insert([{ user_id: user.id, symbol: logPair, execution_type: logExecution, reason: logReason || null }]).select()
      if (data?.[0]) {
        setTradesTakenToday(prev => prev + 1)
        setPendingReconciliation(prev => [{ id: data[0].id, day: new Date().toLocaleDateString('en-US', { weekday: 'short' }), symbol: logPair, execution: logExecution, reason: logReason, rr: '', outcome: '' }, ...prev])
        setLogPair(''); setLogExecution(null); setLogReason('');
      }
    }
  }

  const handleSaveReconciliation = async (id: string, outcome: string, rr: string) => {
    if (!user) return
    setPendingReconciliation(prev => prev.filter(p => p.id !== id))
    await supabase.from('user_desk_logs').update({ is_reconciled: true, outcome: outcome, rr: parseFloat(rr) }).eq('id', id)
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  const isAlreadyLogged = pendingReconciliation.some(t => t.symbol === logPair)

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 transition-all relative overflow-hidden">
        <div className="h-1/2 flex flex-col border-b border-zinc-800/60 bg-[#080808]">
          <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-[#050505]">
            <div className="flex items-center gap-4"><h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><Crosshair size={14} className="text-blue-500" /> Today's Focus</h2><span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">{todaySetups.length} Pairs Locked</span></div>
            <button onClick={() => setIsVaultOpen(!isVaultOpen)} className="text-zinc-400 hover:text-white"><Menu size={16} /></button>
          </div>
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="w-48 shrink-0 border-r border-zinc-800/60 flex flex-col p-2 gap-1.5 overflow-y-auto custom-scrollbar">
              {todaySetups.map(s => (
                <div key={s.id} onClick={() => setActiveTodayId(s.id)} className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer group ${activeTodayId === s.id ? 'bg-zinc-800 border-zinc-600 shadow-sm' : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900'}`}>
                  <span className={`text-sm font-bold tracking-wider ${activeTodayId === s.id ? 'text-white' : 'text-zinc-400'}`}>{s.symbol}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={(e) => { e.stopPropagation(); setLogPair(s.symbol); }} className="p-1 hover:text-emerald-400"><Target size={12} /></button>{s.addedToTodayAt && (Date.now() - s.addedToTodayAt < 3600000) && <button onClick={(e) => { e.stopPropagation(); toggleTodayStatus(s.id); }} className="p-1 hover:text-red-400"><ArrowLeft size={12} /></button>}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-[#030303] relative border-r border-zinc-800/60 overflow-hidden flex items-center justify-center">
              {activeSetup?.imageUrl ? <img src={activeSetup.imageUrl} className="max-w-full max-h-full object-contain p-4 shadow-2xl" /> : <span className="text-[10px] font-bold uppercase text-zinc-600">Select a pair</span>}
            </div>
            <div className="w-80 shrink-0 p-3 bg-[#030303]"><div className="h-full bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-3 shadow-sm flex flex-col min-h-0"><RichNotesEditor activeSetup={activeSetup} onUpdate={handleUpdateNotes} /></div></div>
          </div>
        </div>
        <div className="h-1/2 flex flex-col bg-[#050505]">
          <div className="h-10 border-b border-zinc-800/60 flex items-center px-4 bg-[#0a0a0a]"><h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Operator's Audit</h2></div>
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 border-r border-zinc-800/60 p-6 flex flex-col items-center justify-center bg-[#030303] relative">
              <div className="w-full max-w-sm flex flex-col gap-4">
                <div className="flex justify-between items-end mb-2"><h3 className="text-sm font-bold text-zinc-200">Log Execution Reality</h3><span className={`text-xs font-bold px-2 py-1 rounded bg-zinc-900 border ${tradesTakenToday >= 2 ? 'border-red-500 text-red-400' : 'border-zinc-700 text-zinc-400'}`}>{tradesTakenToday}/2 TRADES</span></div>
                {!logPair ? <div className="h-[46px] border border-dashed border-zinc-800 rounded-lg flex items-center justify-center bg-zinc-950/50"><span className="text-[10px] font-bold uppercase text-zinc-500">Stage a pair</span></div> : <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3"><span className="text-sm font-black text-white">{logPair}</span><button onClick={() => { setLogPair(''); setLogExecution(null); }} className="text-zinc-500 hover:text-red-400"><X size={14}/></button></div>}
                <div className="flex gap-3">
                  <button disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged} onClick={() => setLogExecution('Perfect')} className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#0a0a0a] border-zinc-800 text-zinc-400 disabled:opacity-30'}`}><CheckCircle size={20} /><span className="text-[10px] font-bold uppercase">Perfect</span></button>
                  <button disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged} onClick={() => setLogExecution('Imperfect')} className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-[#0a0a0a] border-zinc-800 text-zinc-400 disabled:opacity-30'}`}><AlertTriangle size={20} /><span className="text-[10px] font-bold uppercase">Imperfect</span></button>
                </div>
                {logExecution === 'Imperfect' && <select value={logReason} onChange={(e) => setLogReason(e.target.value)} className="w-full bg-[#0a0a0a] border border-red-500/30 rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none uppercase"><option value="" disabled>Select Catalyst</option><option value="FOMO">FOMO</option><option value="Revenge">Revenge</option><option value="Boredom">Boredom</option></select>}
                <button disabled={!logPair || !logExecution || isAlreadyLogged} onClick={handleLockEntry} className={`w-full py-3 rounded-lg text-xs font-bold uppercase transition-all ${isAlreadyLogged ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-800'}`}>{isAlreadyLogged ? 'Already Logged' : 'Lock Entry'}</button>
              </div>
            </div>
            <div className="flex-[1.2] p-6 overflow-y-auto custom-scrollbar bg-[#050505]">
              <span className="text-[10px] font-bold uppercase text-zinc-500 mb-6 block tracking-widest">Weekend Reconciliation</span>
              <div className="flex flex-col gap-3">
                {pendingReconciliation.map(trade => {
                  const [outcome, setOutcome] = useState(''); const [rr, setRr] = useState('');
                  return (
                    <div key={trade.id} className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col gap-1 w-1/3"><div className="flex items-center gap-2"><span className="text-xs font-bold text-zinc-400">{trade.day}</span><span className="text-sm font-bold text-zinc-200">{trade.symbol}</span></div><span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded w-fit ${trade.execution === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{trade.execution}</span></div>
                      <div className="flex items-center gap-3 shrink-0"><select value={outcome} onChange={e => setOutcome(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-xs font-bold text-zinc-300 w-28 uppercase"><option value="">Outcome</option><option value="TP">Hit TP</option><option value="SL">Hit SL</option><option value="BE">Break Even</option></select><div className="relative w-24"><input type="number" value={rr} onChange={e => setRr(e.target.value)} placeholder="0.0" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-2 py-2 text-xs font-bold text-zinc-300"/><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-500">RR</span></div><button disabled={!outcome || !rr} onClick={() => handleSaveReconciliation(trade.id, outcome, rr)} className="p-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white rounded-lg transition-all disabled:opacity-30"><Save size={14} /></button></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`h-full bg-[#080808] border-l border-zinc-800/60 flex flex-col transition-all overflow-hidden shrink-0 ${isVaultOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}`}>
        <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-[#0a0a0a] shrink-0"><h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><UploadCloud size={14} className="text-zinc-400" /> Weekly Vault</h2></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 gap-2 flex flex-col">
          {weeklySetups.map(s => (
            <div key={s.id} className="p-2.5 border border-zinc-800/50 bg-[#0a0a0a] rounded-lg flex justify-between items-center group">
              <div className="flex flex-col min-w-0 pr-2"><span className="text-xs font-bold text-zinc-200 truncate">{s.symbol}</span><span className="text-[9px] font-bold text-zinc-600 uppercase truncate">{s.notes ? 'Notes added' : 'No notes'}</span></div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setPreviewSetup(s)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors"><Eye size={12} /></button><button onClick={() => deleteSetup(s.id)} className="p-1.5 hover:text-red-400"><Trash2 size={12} /></button><button onClick={() => setConfirmPushId(s.id)} className="text-[9px] font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700 hover:bg-blue-600 px-2 py-1 rounded transition-all">Push <ArrowRight size={10} /></button></div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-zinc-800/60 bg-[#0a0a0a] shrink-0"><button onClick={() => setIsUploadModalOpen(true)} className="w-full py-2.5 border border-dashed border-zinc-700 bg-[#050505] rounded-lg text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-all"><Plus size={14} /> Add Weekly Setups</button></div>
      </div>
      {confirmPushId && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full"><h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Confirm Push</h3><p className="text-xs text-zinc-400 mb-6 leading-relaxed">Lock this setup into Today's Focus? Removal is only allowed for the first 60 minutes.</p><div className="flex gap-3"><button onClick={() => setConfirmPushId(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase">Cancel</button><button onClick={handleConfirmPush} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase">Push</button></div></div></div>}
      {previewSetup && <div onClick={() => setPreviewSetup(null)} className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"><div onClick={e => e.stopPropagation()} className="max-w-5xl w-full h-[80vh] bg-[#050505] border border-zinc-800/60 rounded-xl shadow-2xl flex overflow-hidden cursor-default"><div className="flex-[2] bg-[#030303] border-r border-zinc-800/60 flex items-center justify-center">{previewSetup.imageUrl ? <img src={previewSetup.imageUrl} className="max-w-full max-h-full object-contain p-4" /> : <span className="text-[10px] font-bold uppercase text-zinc-600">No image</span>}</div><div className="flex-1 flex flex-col overflow-hidden"><div className="p-4 border-b border-zinc-800/60 flex items-center justify-between bg-[#0a0a0a] shrink-0"><span className="text-sm font-bold text-white">{previewSetup.symbol} Setup</span><button onClick={() => setPreviewSetup(null)} className="text-zinc-500 hover:text-white"><X size={16} /></button></div><div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-xs text-zinc-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewSetup.notes || 'No notes.' }} /></div></div></div>}
      <SetupUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSave={handleBulkUpload} />
    </div>
  )
}
