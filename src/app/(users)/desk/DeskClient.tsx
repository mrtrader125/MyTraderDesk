'use client'

import { useState, useEffect, useRef } from 'react'
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

  const handleSaveAll = () => {
    const validDrafts = drafts.filter(d => d.instrument.trim() !== '')
    const formattedSetups = validDrafts.map(d => ({
      id: d.id,
      symbol: d.instrument.toUpperCase(),
      notes: d.notes,
      imageUrl: d.imageSource,
      isToday: false
    }))
    onSave(formattedSetups)
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
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-[200px] border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col shrink-0">
            <div className="p-3 border-b border-zinc-800/50 flex flex-col gap-2 shrink-0">
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> Add Images
              </button>
              <div className="flex gap-1">
                <input 
                  type="text" 
                  value={linkInput} 
                  onChange={(e) => setLinkInput(e.target.value)} 
                  placeholder="Paste URL..." 
                  className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] text-zinc-300 outline-none focus:border-blue-500"
                />
                <button onClick={handleAddLink} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 rounded transition-colors"><Plus size={12}/></button>
              </div>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
              {drafts.map((draft, idx) => (
                <div 
                  key={draft.id} 
                  onClick={() => setActiveIndex(idx)}
                  className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition-all ${activeIndex === idx ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}
                >
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                    {draft.imageSource ? <img src={draft.imageSource} className="w-full h-full object-cover opacity-80" /> : <ImageIcon size={12} className="m-auto mt-2 text-zinc-600"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{draft.instrument || 'UNKNOWN'}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{draft.notes ? 'Notes added' : 'No notes'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeDraft(idx); }} className="text-zinc-600 hover:text-red-400 p-1"><X size={12}/></button>
                </div>
              ))}
              {drafts.length === 0 && (
                <div className="text-center p-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-4">
                  No drafts added
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 overflow-y-auto custom-scrollbar">
            {drafts.length > 0 && drafts[activeIndex] ? (
              <div className="p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
                <div className="w-full aspect-[16/9] bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {drafts[activeIndex].imageSource ? (
                    <img src={drafts[activeIndex].imageSource!} alt="Preview" className="w-full h-full object-contain p-2" />
                  ) : <ImageIcon className="w-10 h-10 text-zinc-700" />}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Instrument Ticker</label>
                  <input 
                    type="text" 
                    value={drafts[activeIndex].instrument}
                    onChange={(e) => updateActiveDraft('instrument', e.target.value.toUpperCase())}
                    placeholder="e.g. GBPUSD"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Structural Thesis</label>
                  <textarea 
                    value={drafts[activeIndex].notes}
                    onChange={(e) => updateActiveDraft('notes', e.target.value)}
                    placeholder="Log structural bias, liquidity sweeps, or entry triggers..."
                    className="w-full min-h-[120px] flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
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
          <span className="text-xs font-medium text-zinc-500">
            {drafts.length} {drafts.length === 1 ? 'setup' : 'setups'} staged
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
            <button 
              onClick={handleSaveAll}
              disabled={drafts.length === 0 || drafts.some(d => d.instrument.trim() === '')}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Save All to Vault
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

  // Sync content only when the active setup ID changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = activeSetup?.notes || '';
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
      {/* Sleek Formatting Toolbar */}
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-800/60 shrink-0">
        <button onClick={() => handleCommand('bold')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Bold Text">
          <Bold size={14} />
        </button>
        <button onClick={() => handleCommand('insertUnorderedList')} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors" title="Bullet Points">
          <List size={14} />
        </button>
        <span className="ml-auto text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1">Notes Editor</span>
      </div>

      {/* ContentEditable Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 w-full bg-transparent border-none focus:outline-none text-xs text-zinc-300 leading-relaxed font-medium custom-scrollbar overflow-y-auto"
        style={{ outline: 'none' }}
      />
      
      {/* CSS injection to make bullets render beautifully in contentEditable */}
      <style dangerouslySetInnerHTML={{__html: `
        div[contenteditable] ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        div[contenteditable] li { margin-bottom: 0.25rem; }
        div[contenteditable] b { color: #f4f4f5; font-weight: 800; }
        div[contenteditable]:empty:before { content: "Type notes, levels, or invalidation here..."; color: #52525b; pointer-events: none; display: block; }
      `}} />
    </div>
  )
}

// --- MAIN DESK COMPONENT ---
export default function DeskClient() {
  const [isVaultOpen, setIsVaultOpen] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [confirmPushId, setConfirmPushId] = useState<string | null>(null)
  
  // Weekly Lightbox State
  const [previewSetup, setPreviewSetup] = useState<any | null>(null)
  
  const [setups, setSetups] = useState<any[]>([
    { id: '1', symbol: 'GBPJPY', notes: 'Macro structure shows clear sweep of weekly high.<br/><br/><ul><li>Waiting for 1H displacement and fair value gap tap to enter short.</li><li><b>Target:</b> 4H unmitigated demand zone below.</li></ul>', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder1.png', isToday: true, addedToTodayAt: Date.now() },
    { id: '2', symbol: 'XAUUSD', notes: 'Gold respecting daily trendline.<br/><br/><ul><li>CPI data coming up, playing it safe until NY session volume steps in.</li></ul>', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder2.png', isToday: true, addedToTodayAt: Date.now() },
    { id: '3', symbol: 'GBPCAD', notes: 'Consolidating in a tight 4H range. Needs to break structure before committing capital.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder3.png', isToday: false }
  ])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  const [activeTodayId, setActiveTodayId] = useState<string | null>(todaySetups.length > 0 ? todaySetups[0].id : null)

  // --- JOURNAL STATE ---
  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [logPair, setLogPair] = useState<string>('') 
  const [logExecution, setLogExecution] = useState<'Perfect' | 'Imperfect' | null>(null)
  const [logReason, setLogReason] = useState('')

  // Starts Empty
  const [pendingReconciliation, setPendingReconciliation] = useState<any[]>([])

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
      if(logPair) setLogPair('') 
    }
  }, [todaySetups.length, activeTodayId])

  const handleConfirmPush = () => {
    if(confirmPushId) {
      setSetups(prev => prev.map(s => s.id === confirmPushId ? { ...s, isToday: true, addedToTodayAt: Date.now() } : s))
      setConfirmPushId(null)
    }
  }

  const toggleTodayStatus = (id: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday, addedToTodayAt: undefined } : s))
  }

  const deleteSetup = (id: string) => {
    setSetups(prev => prev.filter(s => s.id !== id))
  }

  const handleBulkUpload = (newSetups: any[]) => {
    setSetups(prev => [...newSetups, ...prev])
  }

  const handleUpdateNotes = (id: string, newNotes: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: newNotes } : s))
  }

  const handleLockEntry = () => {
    if (tradesTakenToday < 2 && logPair && logExecution) {
      setTradesTakenToday(prev => prev + 1);
      setPendingReconciliation(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
          symbol: logPair,
          execution: logExecution,
          reason: logReason || null
        },
        ...prev
      ]);
      setLogPair('');
      setLogExecution(null);
      setLogReason('');
    }
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)
  
  // 🚨 Security Check: Is the selected pair already logged in the queue?
  const isAlreadyLogged = pendingReconciliation.some(t => t.symbol === logPair);

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      {/* 🔴 LEFT/MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 relative">

        {/* 🟢 MAIN SPLIT CONTAINER - EXACT 50/50 LOCK */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* =========================================
              TOP 50%: TODAY's FOCUS
          ========================================= */}
          <div className="h-1/2 shrink-0 flex flex-col min-h-0 border-b border-zinc-800/60 bg-[#080808]">
            
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#050505]">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Crosshair size={14} className="text-blue-500" /> Today's Focus
                </h2>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {todaySetups.length} Pairs Locked
                </span>
              </div>
              
              <button 
                onClick={() => setIsVaultOpen(!isVaultOpen)} 
                className="text-zinc-500 hover:text-white transition-colors p-1"
                title="Toggle Weekly Vault"
              >
                <Menu size={16} />
              </button>
            </div>

            <div className="flex-1 flex flex-row min-h-0 min-w-0 overflow-hidden">
              {/* PANE 1: List */}
              <div className="w-48 sm:w-56 shrink-0 border-r border-zinc-800/60 flex flex-col bg-[#080808] overflow-y-auto custom-scrollbar p-2 gap-1.5 min-h-0">
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
                        onClick={() => { setActiveTodayId(setup.id); }}
                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer group shrink-0 ${
                          activeTodayId === setup.id 
                            ? 'bg-zinc-800 border-zinc-600 shadow-sm' 
                            : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {setup.symbol}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* STAGE EXECUTION BUTTON */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setLogPair(setup.symbol); }}
                            className="p-1 rounded hover:bg-emerald-500/20 text-zinc-600 hover:text-emerald-400 transition-colors"
                            title="Stage for Execution"
                          >
                            <Target size={12} />
                          </button>
                          {/* CONDITIONAL REMOVE BUTTON */}
                          {canRemove && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }}
                              className="p-1 rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"
                              title="Push back to Vault (Available for 1 Hour)"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* PANE 2: Chart */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#030303] relative border-r border-zinc-800/60">
                {activeSetup ? (
                  <div className="absolute inset-0 p-3 flex items-center justify-center">
                     <img src={activeSetup.imageUrl} alt={`${activeSetup.symbol} Chart`} className="w-full h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl bg-[#0a0a0a]" />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-700 min-h-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair to view</span>
                  </div>
                )}
              </div>

              {/* PANE 3: Rich Editable Notes Box */}
              <div className="w-64 sm:w-80 shrink-0 flex flex-col min-h-0 min-w-0 p-3 bg-[#030303]">
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-3 shadow-sm flex flex-col min-h-0">
                  <RichNotesEditor 
                    activeSetup={activeSetup} 
                    onUpdate={handleUpdateNotes} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              BOTTOM 50%: OPERATOR'S AUDIT / JOURNAL
          ========================================= */}
          <div className="h-1/2 shrink-0 flex flex-col min-h-0 bg-[#050505]">
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Operator's Audit
              </h2>
            </div>

            <div className="flex-1 flex flex-row min-h-0 min-w-0 overflow-hidden">
              
              {/* LEFT: QUICK CAPTURE */}
              <div className="flex-1 border-r border-zinc-800/60 p-4 sm:p-6 flex flex-col relative bg-[#030303] overflow-y-auto custom-scrollbar min-h-0 min-w-0">
                <div className="w-full max-w-sm flex flex-col gap-4 m-auto shrink-0">
                  
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-zinc-200">Log Execution Reality</h3>
                    <span className={`text-xs font-bold tracking-widest px-2 py-1 rounded bg-zinc-900 border ${tradesTakenToday >= 2 ? 'border-red-500 text-red-400' : 'border-zinc-700 text-zinc-400'}`}>
                      {tradesTakenToday}/2 TRADES
                    </span>
                  </div>

                  {!logPair ? (
                    <div className="h-[46px] border border-dashed border-zinc-800 rounded-lg flex items-center justify-center bg-zinc-950/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stage a pair from Today's Focus</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 shadow-inner">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Target Acquired</span>
                      <span className="text-sm font-black text-white tracking-wider">{logPair}</span>
                      <button onClick={() => { setLogPair(''); setLogExecution(null); setLogReason(''); }} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X size={14}/>
                      </button>
                    </div>
                  )}

                  {/* BIG EXECUTION BUTTONS */}
                  <div className="flex gap-3">
                    <button 
                      disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged}
                      onClick={() => setLogExecution('Perfect')}
                      className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${!logPair || isAlreadyLogged ? 'opacity-50 cursor-not-allowed' : ''} ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                    >
                      <CheckCircle size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Perfect<br/>Execution</span>
                    </button>
                    <button 
                      disabled={!logPair || tradesTakenToday >= 2 || isAlreadyLogged}
                      onClick={() => setLogExecution('Imperfect')}
                      className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${!logPair || isAlreadyLogged ? 'opacity-50 cursor-not-allowed' : ''} ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                    >
                      <AlertTriangle size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">Imperfect<br/>Execution</span>
                    </button>
                  </div>

                  {/* CATALYST (Optional) */}
                  {logExecution === 'Imperfect' && !isAlreadyLogged && (
                    <select 
                      value={logReason}
                      onChange={(e) => setLogReason(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-red-500/30 rounded-lg px-3 py-2.5 text-xs font-bold text-zinc-300 outline-none uppercase"
                    >
                      <option value="" disabled>Select Catalyst (Optional)</option>
                      <option value="FOMO">FOMO / Rushed Entry</option>
                      <option value="Revenge">Revenge Trading</option>
                      <option value="Boredom">Boredom / Forced Setup</option>
                      <option value="Ignored Plan">Ignored Trading Plan</option>
                    </select>
                  )}

                  {/* DYNAMIC BUTTON TEXT */}
                  <button 
                    disabled={!logPair || !logExecution || tradesTakenToday >= 2 || isAlreadyLogged}
                    onClick={handleLockEntry}
                    className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                      isAlreadyLogged 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600'
                    }`}
                  >
                    {isAlreadyLogged ? 'Setup Already Logged Today' : 'Lock Entry Without Outcome'}
                  </button>
                </div>
              </div>

              {/* RIGHT: END OF WEEK RECONCILER */}
              <div className="flex-[1.2] p-4 sm:p-6 overflow-y-auto custom-scrollbar relative bg-[#050505] min-h-0 min-w-0">
                <div className="mb-6 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekend Reconciliation Queue</span>
                </div>

                <div className="flex flex-col gap-3">
                  {pendingReconciliation.length === 0 ? (
                    <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800/50 rounded-xl mx-4 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest">No pending setups to reconcile</span>
                    </div>
                  ) : (
                    pendingReconciliation.map((trade) => (
                      <div key={trade.id} className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between shadow-sm shrink-0">
                        
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
                          <select className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-[10px] sm:text-xs font-bold text-zinc-300 outline-none uppercase w-24 sm:w-28">
                            <option value="">Outcome</option>
                            <option value="TP">Hit TP</option>
                            <option value="SL">Hit SL</option>
                            <option value="BE">Break Even</option>
                          </select>
                          
                          <div className="relative w-20 sm:w-24">
                            <input 
                              type="number" 
                              placeholder="0.0"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 sm:pl-8 pr-2 py-2 text-[10px] sm:text-xs font-bold text-zinc-300 outline-none placeholder:text-zinc-600"
                            />
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RR</span>
                          </div>

                          <button className="p-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white rounded-lg transition-colors" title="Save Reconciled Data">
                            <Save size={14} />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>

      {/* 🔴 RIGHT WORKSPACE: COLLAPSIBLE VAULT */}
      <div 
        className={`h-full bg-[#080808] border-l border-zinc-800/60 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isVaultOpen ? 'w-[280px] lg:w-[300px] xl:w-[320px] opacity-100' : 'w-0 opacity-0 border-l-0'
        }`}
      >
        <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={14} className="text-zinc-400" /> Weekly Vault
          </h2>
        </div>
        
        {/* Instrument List */}
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0">
          {weeklySetups.length === 0 ? (
            <div className="text-center p-6 text-zinc-600">
              <span className="text-[10px] font-bold uppercase tracking-widest">Vault is empty</span>
            </div>
          ) : (
            weeklySetups.map((setup) => (
              <div 
                key={`weekly-${setup.id}`}
                className="w-full py-2.5 px-3 border border-zinc-800/50 bg-[#0a0a0a] rounded-lg flex justify-between items-center group shadow-sm hover:border-zinc-600 transition-colors shrink-0"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-zinc-200 tracking-wide group-hover:text-white transition-colors truncate">{setup.symbol}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate">{setup.notes ? 'Notes Logged' : 'No Notes'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 🚨 VIEW FULL SETUP BUTTON */}
                  <button 
                    onClick={() => setPreviewSetup(setup)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                    title="View Setup Details"
                  >
                    <Eye size={12} />
                  </button>
                  <button 
                    onClick={() => deleteSetup(setup.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button 
                    onClick={() => setConfirmPushId(setup.id)}
                    className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest bg-zinc-900 border border-zinc-700 hover:bg-blue-600 hover:border-blue-500 px-2 py-1 rounded transition-all flex items-center gap-1"
                  >
                    Push <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Button at the bottom */}
        <div className="p-3 border-t border-zinc-800/60 bg-[#0a0a0a] shrink-0">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-1.5 border border-dashed border-zinc-700 bg-[#050505] rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all shadow-sm"
          >
            <Plus size={14} /> Add Weekly Setups
          </button>
        </div>
      </div>

      {/* CONFIRM PUSH MODAL */}
      {confirmPushId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Confirm Setup Push</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-medium">Are you sure you want to push this setup to Today's Focus? To enforce discipline, <strong className="text-zinc-200">it can only be removed within the first 60 minutes</strong> of adding it.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPushId(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-zinc-300 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={handleConfirmPush} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors">Push to Today</button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VAULT PREVIEW MODAL */}
      {previewSetup && (
        <div 
          onClick={() => setPreviewSetup(null)} 
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="max-w-5xl w-full max-h-full bg-[#050505] border border-zinc-800/60 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden cursor-default animate-in zoom-in-95 duration-200"
          >
            {/* Chart (Left) */}
            <div className="flex-[2] bg-[#030303] border-b md:border-b-0 md:border-r border-zinc-800/60 relative p-2 md:p-4 min-h-[300px] flex items-center justify-center">
               <img src={previewSetup.imageUrl} alt={previewSetup.symbol} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-[#0a0a0a] border border-zinc-800/50" />
            </div>
            
            {/* Notes & Details (Right) */}
            <div className="flex-1 flex flex-col max-h-[300px] md:max-h-none overflow-hidden">
               <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between bg-[#0a0a0a] shrink-0">
                  <span className="text-sm font-bold text-white tracking-widest">{previewSetup.symbol} Setup</span>
                  <button onClick={() => setPreviewSetup(null)} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
               </div>
               <div 
                  className="p-5 overflow-y-auto custom-scrollbar flex-1 text-xs text-zinc-300 font-medium leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: previewSetup.notes || '<p class="text-zinc-600 italic">No notes logged.</p>' }}
               />
               <style dangerouslySetInnerHTML={{__html: `
                  .custom-scrollbar ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
                  .custom-scrollbar li { margin-bottom: 0.25rem; }
               `}} />
            </div>
          </div>
        </div>
      )}

      {/* RENDER UPLOAD MODAL */}
      <SetupUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSave={handleBulkUpload}
      />
      
    </div>
  )
}
