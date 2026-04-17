// src/app/(users)/desk/DeskClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  Plus, X, UploadCloud, Crosshair, 
  Target, ArrowRight, ArrowLeft, Eye, Bold, List,
  Image as ImageIcon, Trash2, Menu, Activity, AlertTriangle, CheckCircle, Save, ChevronUp, ChevronDown, Camera
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLAYBOOKS = ["Liquidity Sweep", "Trend Continuation", "Range Play", "Breakout / Retest", "News Catalyst"]

type DraftSetup = {
  id: string;
  imageSource: string | null;
  file: File | null;
  instrument: string;
  direction: 'LONG' | 'SHORT' | '';
  playbook: string;
  notes: string;
}

function SetupUploadModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (setups: any[]) => void }) {
  const [drafts, setDrafts] = useState<DraftSetup[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [linkInput, setLinkInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const extractInstrument = (text: string) => {
    const match = text.toUpperCase().match(/[A-Z0-9]{4,8}/)
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
        direction: '',
        playbook: '',
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
      direction: '',
      playbook: '',
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
    const validDrafts = drafts.filter(d => d.instrument.trim() !== '' && d.direction !== '' && d.playbook !== '')
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden h-[90vh] lg:h-[80vh] min-h-[500px]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={16} className="text-purple-500" /> Vault Upload
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" disabled={isUploading}>
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          <div className="w-full lg:w-[200px] border-b lg:border-b-0 lg:border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col shrink-0">
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
            
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scrollbar p-2 flex flex-row lg:flex-col gap-2 text-white">
              {drafts.map((draft, idx) => (
                <div 
                  key={draft.id} onClick={() => setActiveIndex(idx)}
                  className={`min-w-[150px] lg:min-w-0 p-2 rounded border cursor-pointer flex items-center gap-2 transition-all ${activeIndex === idx ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}
                >
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                    {draft.imageSource ? <img src={draft.imageSource} className="w-full h-full object-cover opacity-80" /> : <ImageIcon size={12} className="m-auto mt-2 text-zinc-600"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{draft.instrument || 'UNKNOWN'}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{draft.direction ? `${draft.direction} • ${draft.playbook}` : 'Incomplete'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDraft(idx); }} className="text-zinc-600 hover:text-red-400 p-1" disabled={isUploading}><X size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 overflow-y-auto custom-scrollbar">
            {drafts.length > 0 && drafts[activeIndex] ? (
              <div className="p-4 lg:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full text-white">
                <div className="w-full aspect-[16/9] bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {drafts[activeIndex].imageSource ? <img src={drafts[activeIndex].imageSource!} alt="Preview" className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-10 h-10 text-zinc-700" />}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Instrument Ticker</label>
                    <input 
                      type="text" value={drafts[activeIndex].instrument}
                      onChange={(e) => updateActiveDraft('instrument', e.target.value.toUpperCase())}
                      placeholder="e.g. GBPUSD" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Macro Bias</label>
                    <div className="flex gap-2">
                      <button onClick={() => updateActiveDraft('direction', 'LONG')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${drafts[activeIndex].direction === 'LONG' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black border-zinc-800 text-zinc-500'}`}>LONG</button>
                      <button onClick={() => updateActiveDraft('direction', 'SHORT')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${drafts[activeIndex].direction === 'SHORT' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black border-zinc-800 text-zinc-500'}`}>SHORT</button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Playbook Strategy</label>
                  <select value={drafts[activeIndex].playbook} onChange={(e) => updateActiveDraft('playbook', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500" disabled={isUploading}>
                    <option value="" disabled>Select Core Setup...</option>
                    {PLAYBOOKS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2 flex-1 mt-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Structural Thesis</label>
                  <textarea 
                    value={drafts[activeIndex].notes}
                    onChange={(e) => updateActiveDraft('notes', e.target.value)}
                    placeholder="Log structural bias, liquidity sweeps, or entry triggers..."
                    className="w-full min-h-[100px] flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                    disabled={isUploading}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-6">
                <UploadCloud size={40} className="mb-4 opacity-50" />
                <p className="text-sm font-medium text-center">Add images or links to start bulk uploading.</p>
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
              disabled={drafts.length === 0 || drafts.some(d => d.instrument.trim() === '' || !d.direction || !d.playbook) || isUploading}
              className="px-6 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isUploading ? 'Saving...' : 'Save to Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RichNotesEditor({ activeSetup, onUpdate }: { activeSetup: any, onUpdate: (id: string, notes: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: activeSetup?.notes || '',
    editorProps: {
      attributes: {
        class: 'flex-1 w-full bg-transparent border-none focus:outline-none text-xs text-zinc-300 leading-relaxed font-medium custom-scrollbar overflow-y-auto min-h-0',
      },
    },
    onUpdate: ({ editor }) => {
      if (activeSetup) {
        onUpdate(activeSetup.id, editor.getHTML())
      }
    },
  })

  useEffect(() => {
    if (editor && activeSetup && editor.getHTML() !== activeSetup.notes) {
      editor.commands.setContent(activeSetup.notes || '')
    }
  }, [activeSetup?.id, editor])

  if (!activeSetup) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No active notes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden tiptap-wrapper">
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-800/60 shrink-0">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} 
          title="Bold Text"
        >
          <Bold size={14} />
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleBulletList().run()} 
          className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`} 
          title="Bullet Points"
        >
          <List size={14} />
        </button>
        <span className="ml-auto text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">Notes Editor</span>
      </div>
      <EditorContent editor={editor} className="flex-1 flex flex-col min-h-0 overflow-hidden" />
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-wrapper .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .tiptap-wrapper .ProseMirror li { margin-bottom: 0.25rem; }
        .tiptap-wrapper .ProseMirror b, .tiptap-wrapper .ProseMirror strong { color: #f4f4f5; font-weight: 800; }
        .tiptap-wrapper .ProseMirror p.is-editor-empty:first-child::before { content: "Type structural notes here..."; color: #52525b; float: left; height: 0; pointer-events: none; }
      `}} />
    </div>
  )
}

function ReconciliationItem({ trade, onSave, user }: { trade: any, onSave: (id: string, outcome: string, rr: string, afterImageUrl: string, missingReason?: string) => void, user: any }) {
  const [outcome, setOutcome] = useState(''); 
  const [rr, setRr] = useState('');
  const [missingReason, setMissingReason] = useState('')
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsUploading(true)
    let finalUrl = ''
    if (afterImageFile && user) {
      const fileExt = afterImageFile.name.split('.').pop()
      const fileName = `${trade.id}_after.${fileExt}`
      const { data, error } = await supabase.storage.from('user-desk-images').upload(`${user.id}/reconciliations/${fileName}`, afterImageFile)
      if (data) {
        const { data: publicUrlData } = supabase.storage.from('user-desk-images').getPublicUrl(`${user.id}/reconciliations/${fileName}`)
        finalUrl = publicUrlData.publicUrl
      }
    }
    await onSave(trade.id, outcome, rr, finalUrl, missingReason)
    setIsUploading(false)
  }

  const needsReason = trade.execution === 'Imperfect' && !trade.reason

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm shrink-0">
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-black text-white">{trade.symbol}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${trade.direction === 'LONG' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>{trade.direction}</span>
          <span className="text-[10px] text-zinc-400 font-medium">• {trade.playbook}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 hidden sm:block">{trade.day}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${trade.execution === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{trade.execution}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {needsReason && (
          <select value={missingReason} onChange={e => setMissingReason(e.target.value)} className="flex-1 sm:flex-none sm:w-32 bg-black border border-red-500/50 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-300 outline-none uppercase">
            <option value="">Log Catalyst...</option>
            <option value="FOMO">FOMO</option>
            <option value="Revenge">Revenge</option>
            <option value="Boredom">Boredom</option>
          </select>
        )}
        
        <select value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full sm:w-28 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-bold text-zinc-300 outline-none uppercase focus:border-blue-500">
          <option value="">Outcome</option>
          <option value="TP">Hit TP</option>
          <option value="SL">Hit SL</option>
          <option value="BE">Break Even</option>
        </select>
        
        <div className="relative w-full sm:w-24">
          <input type="number" value={rr} onChange={e => setRr(e.target.value)} placeholder="0.0" className="w-full bg-black border border-zinc-800 rounded-lg pl-8 pr-2 py-2 text-[10px] font-bold text-zinc-300 outline-none focus:border-blue-500" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-500 uppercase">RR</span>
        </div>

        <button onClick={() => fileRef.current?.click()} className={`flex flex-1 sm:flex-none items-center justify-center px-4 py-2 border border-dashed rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${afterImageFile ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:border-blue-500'}`}>
          <Camera size={14} className="mr-2"/> {afterImageFile ? 'Chart Attached' : 'After Chart'}
        </button>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => setAfterImageFile(e.target.files?.[0] || null)} />

        <button disabled={!outcome || !rr || !afterImageFile || (needsReason && !missingReason) || isUploading} onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:bg-zinc-800 rounded-lg transition-colors ml-auto">
          {isUploading ? 'Saving...' : 'Reconcile'}
        </button>
      </div>
    </div>
  )
}

export default function DeskClient() {
  const [user, setUser] = useState<any>(null)
  
  const [isVaultOpen, setIsVaultOpen] = useState(false)
  const [isAuditOpen, setIsAuditOpen] = useState(false)
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [confirmPushId, setConfirmPushId] = useState<string | null>(null)
  const [previewSetup, setPreviewSetup] = useState<any | null>(null)
  
  const [setups, setSetups] = useState<any[]>([])
  const [pendingReconciliation, setPendingReconciliation] = useState<any[]>([])

  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [logPair, setLogPair] = useState<string>('') 
  const [logDirection, setLogDirection] = useState<'LONG' | 'SHORT' | null>(null)
  const [logPlaybook, setLogPlaybook] = useState('')
  const [logExecution, setLogExecution] = useState<'Perfect' | 'Imperfect' | null>(null)
  const [logReason, setLogReason] = useState('')

  useEffect(() => {
    const handleResize = () => setIsVaultOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      
      if (user) {
        setUser(user)
        const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (setupsData) {
          setSetups(setupsData.map(d => ({
            id: d.id, symbol: d.symbol, direction: d.direction, playbook: d.playbook, notes: d.notes, imageUrl: d.image_url, isToday: d.is_today, addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null
          })))
        }
        const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', user.id).eq('is_reconciled', false).order('created_at', { ascending: false })
        if (logsData) {
          setPendingReconciliation(logsData.map(d => ({
            id: d.id, day: new Date(d.created_at).toLocaleDateString('en-US', { weekday: 'short' }), symbol: d.symbol, direction: d.direction, playbook: d.playbook, execution: d.execution_type, reason: d.reason, rr: d.rr, outcome: d.outcome
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
        const match = setupToDelete.imageUrl.match(/user-desk-images\/(.+)$/);
        if (match && match[1]) {
            await supabase.storage.from('user-desk-images').remove([match[1]]);
        }
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

      newSetups.push({ user_id: user.id, symbol: draft.instrument, direction: draft.direction, playbook: draft.playbook, notes: draft.notes, image_url: finalImageUrl, is_today: false })
    }

    const { data: insertedData, error: dbError } = await supabase.from('user_desk_setups').insert(newSetups).select()
    
    if (dbError) {
      console.error("Database Insert Error:", dbError)
      alert(`Database Save Failed:\n${dbError.message}`)
    } else if (insertedData) {
      const formatted = insertedData.map(d => ({ id: d.id, symbol: d.symbol, direction: d.direction, playbook: d.playbook, notes: d.notes, imageUrl: d.image_url, isToday: false, addedToTodayAt: null }))
      setSetups(prev => [...formatted, ...prev])
    }
  }

  const handleUpdateNotes = (id: string, newNotes: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: newNotes } : s))
  }

  const handleLockEntry = async () => {
    if (tradesTakenToday < 2 && logPair && logDirection && logPlaybook && logExecution && user) {
      const newLog = { user_id: user.id, symbol: logPair, direction: logDirection, playbook: logPlaybook, execution_type: logExecution, reason: logReason || null }
      const { data } = await supabase.from('user_desk_logs').insert([newLog]).select()
      if (data && data[0]) {
        setTradesTakenToday(prev => prev + 1);
        setPendingReconciliation(prev => [{ id: data[0].id, day: new Date(data[0].created_at).toLocaleDateString('en-US', { weekday: 'short' }), symbol: data[0].symbol, direction: data[0].direction, playbook: data[0].playbook, execution: data[0].execution_type, reason: data[0].reason, rr: '', outcome: '' }, ...prev]);
      }
      setLogPair(''); setLogDirection(null); setLogPlaybook(''); setLogExecution(null); setLogReason('');
      setIsAuditOpen(false); 
    }
  }

  const handleSaveReconciliation = async (id: string, outcome: string, rr: string, afterUrl: string, missingReason?: string) => {
    if (!user) return
    const updateData: any = { is_reconciled: true, outcome, rr: parseFloat(rr), after_image_url: afterUrl }
    if (missingReason) updateData.reason = missingReason
    setPendingReconciliation(prev => prev.filter(p => p.id !== id))
    await supabase.from('user_desk_logs').update(updateData).eq('id', id)
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  const isAlreadyLogged = pendingReconciliation.some(t => t.symbol === logPair);

  return (
    <div className="relative flex flex-col lg:flex-row h-auto min-h-[calc(100vh-70px)] lg:h-[calc(100vh-70px)] w-full bg-black text-zinc-300 font-sans p-2 gap-2 overflow-y-auto lg:overflow-hidden">
      
      {isVaultOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" 
          onClick={() => setIsVaultOpen(false)} 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2 relative">
        <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative min-h-0 shrink-0 lg:h-[calc(50%-4px)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600/50 to-transparent"></div>
          
          <div className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-blue-500" /> Today's Focus
              </h2>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-black border border-zinc-800 px-2 py-0.5 rounded shadow-inner">
                {todaySetups.length} Pairs Locked
              </span>
            </div>
            <button 
              onClick={() => setIsVaultOpen(!isVaultOpen)} 
              className="text-zinc-400 hover:text-white transition-colors p-1.5 bg-black border border-zinc-800 rounded-md shadow-sm" 
              title="Toggle Weekly Vault"
            >
              <Menu size={14} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden">
            <div className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-row lg:flex-col bg-zinc-950/50 overflow-x-auto lg:overflow-y-auto custom-scrollbar p-3 gap-2 min-h-0 text-white">
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
                      className={`min-w-[140px] lg:min-w-0 p-3 rounded-lg border flex flex-col cursor-pointer transition-all group shrink-0 ${
                        activeTodayId === setup.id 
                          ? 'bg-zinc-800 border-zinc-600 shadow-md' 
                          : 'bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {setup.symbol}
                        </span>
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setLogPair(setup.symbol);
                              setLogDirection(setup.direction);
                              setLogPlaybook(setup.playbook); 
                              setIsAuditOpen(true); 
                            }} 
                            className="p-1 rounded hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 transition-colors" 
                            title="Stage Execution"
                          >
                            <Target size={12} />
                          </button>
                          {canRemove && (
                            <button onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }} className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors" title="Remove (1hr limit)">
                              <ArrowLeft size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${setup.direction === 'LONG' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : setup.direction === 'SHORT' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>{setup.direction || 'N/A'}</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase truncate">{setup.playbook || 'No Playbook'}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="w-full h-[250px] sm:h-[300px] lg:h-auto lg:flex-1 flex flex-col min-w-0 min-h-0 bg-black relative shadow-inner">
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

            <div className="w-full lg:w-80 shrink-0 flex flex-col min-h-[250px] lg:min-h-0 p-4 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950/50">
              <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 shadow-inner flex flex-col min-h-0">
                <RichNotesEditor activeSetup={activeSetup} onUpdate={handleUpdateNotes} />
              </div>
            </div>
          </div>
        </div>
        
        <div className={`flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative transition-all duration-300 shrink-0 ${isAuditOpen ? 'h-auto lg:h-[calc(50%-4px)]' : 'h-12'}`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-600/50 to-transparent"></div>
          
          <div 
            onClick={() => setIsAuditOpen(!isAuditOpen)}
            className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0 cursor-pointer hover:bg-zinc-800/40 transition-colors"
          >
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> Operator's Audit
            </h2>
            <button className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              {pendingReconciliation.length > 0 && !isAuditOpen && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-black border border-zinc-800 px-2 py-0.5 rounded">
                  {pendingReconciliation.length} Pending
                </span>
              )}
              {isAuditOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          <div className={`flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden transition-opacity duration-200 ${isAuditOpen ? 'opacity-100 delay-100' : 'opacity-0 hidden lg:flex'}`}>
            
            <div className="w-full lg:flex-[1.2] border-b lg:border-b-0 lg:border-r border-zinc-800 p-4 lg:p-6 flex flex-col items-center justify-center relative bg-zinc-950/50">
              <div className="w-full max-w-sm flex flex-col gap-3 m-auto shrink-0 text-white">
                <div className="flex justify-between items-end">
                  <h3 className="text-[13px] font-bold text-zinc-200">Log Execution Reality</h3>
                  <span className={`text-[9px] font-bold tracking-widest px-2 py-1 rounded bg-black border shadow-inner ${tradesTakenToday >= 2 ? 'border-red-500/50 text-red-400' : 'border-zinc-800 text-zinc-400'}`}>
                    {tradesTakenToday}/2 TRADES
                  </span>
                </div>

                {!logPair ? (
                  <div className="py-2.5 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center bg-black">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Stage a pair from Today's Focus</span>
                  </div>
                ) : (
                  <div className="bg-black border border-zinc-700 rounded-xl p-4 shadow-inner flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[16px] font-black text-white tracking-wider">{logPair}</span>
                      <button onClick={() => { setLogPair(''); setLogDirection(null); setLogPlaybook(''); setLogExecution(null); setLogReason(''); }} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X size={14}/>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setLogDirection('LONG')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${logDirection === 'LONG' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Long</button>
                      <button onClick={() => setLogDirection('SHORT')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${logDirection === 'SHORT' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Short</button>
                    </div>

                    <select value={logPlaybook} onChange={(e) => setLogPlaybook(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-bold text-zinc-300 outline-none uppercase focus:border-blue-500">
                      <option value="" disabled>Select Playbook...</option>
                      {PLAYBOOKS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button onClick={() => setLogExecution('Perfect')} className={`py-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}>
                        <CheckCircle size={16} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Perfect</span>
                      </button>
                      <button onClick={() => setLogExecution('Imperfect')} className={`py-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}>
                        <AlertTriangle size={16} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Imperfect</span>
                      </button>
                    </div>

                    {logExecution === 'Imperfect' && !isAlreadyLogged && (
                      <select 
                        value={logReason}
                        onChange={(e) => setLogReason(e.target.value)}
                        className="w-full bg-zinc-900 border border-red-500/30 rounded-lg px-3 py-2 text-[10px] font-bold text-zinc-300 outline-none uppercase focus:border-red-500/80 transition-colors mt-1"
                      >
                        <option value="" disabled>Catalyst (Can skip to Weekend)</option>
                        <option value="FOMO">FOMO / Rushed Entry</option>
                        <option value="Revenge">Revenge Trading</option>
                        <option value="Boredom">Boredom / Forced Setup</option>
                        <option value="Ignored Plan">Ignored Trading Plan</option>
                      </select>
                    )}

                    <button 
                      disabled={!logDirection || !logPlaybook || !logExecution || tradesTakenToday >= 2 || isAlreadyLogged}
                      onClick={handleLockEntry}
                      className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors mt-2 ${
                        isAlreadyLogged 
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:shadow-none'
                      }`}
                    >
                      {isAlreadyLogged ? 'Already Logged Today' : 'Lock Entry'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:flex-[1.5] p-4 lg:p-6 h-[300px] lg:h-auto overflow-y-auto custom-scrollbar bg-black shadow-inner min-h-0 min-w-0 text-white relative">
              <div className="mb-3 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekend Reconciliation Queue</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {pendingReconciliation.length === 0 ? (
                  <div className="text-center py-10 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl mx-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No pending setups</span>
                  </div>
                ) : (
                  pendingReconciliation.map((trade) => (
                    <ReconciliationItem key={trade.id} trade={trade} user={user} onSave={handleSaveReconciliation} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`fixed lg:static top-0 right-0 bottom-0 z-[50] lg:z-auto h-[100dvh] lg:h-full bg-zinc-950 border-l border-zinc-800 lg:rounded-xl shadow-2xl transition-transform lg:transition-all duration-300 flex flex-col overflow-hidden shrink-0 ${isVaultOpen ? 'translate-x-0 w-[85%] sm:w-[320px] lg:w-[340px] lg:opacity-100' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:border-none'}`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/50 to-transparent"></div>
        
        <div className="h-14 lg:h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0 text-white">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={14} className="text-purple-400" /> Weekly Vault
          </h2>
          <button onClick={() => setIsVaultOpen(false)} className="lg:hidden text-zinc-500 hover:text-white p-1">
            <X size={18} />
          </button>
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
                <div className="flex items-center gap-1.5 shrink-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
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
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 shrink-0 pb-8 lg:pb-4">
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="w-full py-3 px-4 flex items-center justify-center gap-2 border border-dashed border-zinc-700 bg-black rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all shadow-inner hover:shadow-none"
          >
            <Plus size={14} /> Add Weekly Setups
          </button>
        </div>
      </div>

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
            
            <div className="flex-[2.5] bg-black border-b md:border-b-0 md:border-r border-zinc-800 p-4 sm:p-6 flex items-center justify-center relative shadow-inner min-h-[300px]">
              {previewSetup.imageUrl ? (
                <img src={previewSetup.imageUrl} alt={previewSetup.symbol} className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No Image Data</span>
              )}
            </div>
            
            <div className="flex-1 flex flex-col min-w-0 md:min-w-[300px] overflow-hidden bg-zinc-950">
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
