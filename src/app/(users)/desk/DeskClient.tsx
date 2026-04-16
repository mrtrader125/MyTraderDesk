'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, X, UploadCloud, Link as LinkIcon, Crosshair, 
  Target, ArrowRight, ArrowLeft,
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

// --- MAIN DESK COMPONENT ---
export default function DeskClient() {
  const [isVaultOpen, setIsVaultOpen] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  const [setups, setSetups] = useState<any[]>([
    { id: '1', symbol: 'GBPJPY', notes: 'Macro structure shows clear sweep of weekly high.\nWaiting for 1H displacement and fair value gap tap to enter short.\n\nTarget is the 4H unmitigated demand zone below.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder1.png', isToday: true },
    { id: '2', symbol: 'XAUUSD', notes: 'Gold respecting daily trendline.\nCPI data coming up, playing it safe until NY session volume steps in.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder2.png', isToday: true },
    { id: '3', symbol: 'GBPCAD', notes: 'Consolidating in a tight 4H range. Needs to break structure before committing capital.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder3.png', isToday: false }
  ])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  const [activeTodayId, setActiveTodayId] = useState<string | null>(todaySetups.length > 0 ? todaySetups[0].id : null)

  // --- JOURNAL STATE ---
  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [logPair, setLogPair] = useState(todaySetups.length > 0 ? todaySetups[0].symbol : '')
  const [logExecution, setLogExecution] = useState<'Perfect' | 'Imperfect' | null>(null)
  const [logReason, setLogReason] = useState('')

  // Mock pending trades for Weekend Review
  const [pendingReconciliation, setPendingReconciliation] = useState([
    { id: 't1', day: 'Mon', symbol: 'EURUSD', execution: 'Perfect', reason: null },
    { id: 't2', day: 'Wed', symbol: 'GBPJPY', execution: 'Imperfect', reason: 'Revenge Trading' },
  ])

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
      setLogPair(todaySetups[0].symbol)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
      setLogPair('')
    }
  }, [todaySetups.length, activeTodayId])

  const toggleTodayStatus = (id: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday } : s))
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

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  return (
    <div className="flex h-[calc(100vh-70px)] w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      {/* 🔴 LEFT/MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">

        {/* 🟢 SLEEK TOP BAR */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/60 bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-2">Operator's Desk</span>
          </div>
          <button 
            onClick={() => setIsVaultOpen(!isVaultOpen)} 
            className="text-zinc-400 hover:text-white transition-colors bg-zinc-950 border border-zinc-800/60 p-2 rounded-lg"
            title="Toggle Weekly Vault"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* 🟢 MAIN SPLIT CONTAINER */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* =========================================
              TOP 50%: TODAY's FOCUS
          ========================================= */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-800/60 bg-[#080808]">
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#050505]">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Crosshair size={14} className="text-blue-500" /> Today's Focus
              </h2>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                {todaySetups.length} Pairs Locked
              </span>
            </div>

            <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
              {/* PANE 1: List */}
              <div className="w-48 sm:w-56 shrink-0 border-r border-zinc-800/60 flex flex-col bg-[#080808] overflow-y-auto custom-scrollbar p-2 gap-1.5">
                {todaySetups.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center p-4">
                    <Target size={20} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Pairs Selected</span>
                  </div>
                ) : (
                  todaySetups.map(setup => (
                    <div 
                      key={`today-${setup.id}`}
                      onClick={() => { setActiveTodayId(setup.id); setLogPair(setup.symbol); }}
                      className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer group ${
                        activeTodayId === setup.id 
                          ? 'bg-zinc-800 border-zinc-600 shadow-sm' 
                          : 'bg-[#0a0a0a] border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {setup.symbol}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }}
                        className="p-1 rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Push back to Vault"
                      >
                        <ArrowLeft size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* PANE 2: Chart */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#030303] relative border-r border-zinc-800/60">
                {activeSetup ? (
                  <div className="absolute inset-0 p-3 flex items-center justify-center">
                     <img src={activeSetup.imageUrl} alt={`${activeSetup.symbol} Chart`} className="w-full h-full object-contain rounded-xl border border-zinc-800/50 shadow-2xl bg-[#0a0a0a]" />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-700">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair to view</span>
                  </div>
                )}
              </div>

              {/* PANE 3: Editable Notes Box */}
              <div className="w-64 sm:w-72 shrink-0 flex flex-col min-h-0 p-3 bg-[#030303]">
                <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 shadow-sm flex flex-col min-h-0">
                  {activeSetup ? (
                    <textarea 
                      value={activeSetup.notes}
                      onChange={(e) => handleUpdateNotes(activeSetup.id, e.target.value)}
                      placeholder="Type notes, levels, or invalidation here..."
                      className="w-full h-full bg-transparent border-none focus:outline-none resize-none text-xs text-zinc-300 leading-relaxed font-medium custom-scrollbar"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center">
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No active notes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              BOTTOM 50%: OPERATOR'S AUDIT / JOURNAL
          ========================================= */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
            <div className="h-10 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Operator's Audit
              </h2>
            </div>

            <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
              
              {/* LEFT: QUICK CAPTURE (ACTIVE SESSION) */}
              <div className="flex-1 border-r border-zinc-800/60 p-6 flex flex-col items-center justify-center relative bg-[#030303]">
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Active Session Capture</span>
                </div>
                
                <div className="w-full max-w-sm flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-bold text-zinc-200">Log Execution Reality</h3>
                    <span className={`text-xs font-bold tracking-widest px-2 py-1 rounded bg-zinc-900 border ${tradesTakenToday >= 2 ? 'border-red-500 text-red-400' : 'border-zinc-700 text-zinc-400'}`}>
                      {tradesTakenToday}/2 TRADES
                    </span>
                  </div>

                  <select 
                    value={logPair}
                    onChange={(e) => setLogPair(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800/60 rounded-lg px-3 py-3 text-sm font-bold text-zinc-200 outline-none uppercase"
                  >
                    <option value="" disabled>Select Instrument</option>
                    {todaySetups.map(s => <option key={s.id} value={s.symbol}>{s.symbol}</option>)}
                  </select>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setLogExecution('Perfect')}
                      className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                    >
                      <CheckCircle size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Perfect Execution</span>
                    </button>
                    <button 
                      onClick={() => setLogExecution('Imperfect')}
                      className={`flex-1 py-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}
                    >
                      <AlertTriangle size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Imperfect Execution</span>
                    </button>
                  </div>

                  {logExecution === 'Imperfect' && (
                    <select 
                      value={logReason}
                      onChange={(e) => setLogReason(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-red-500/30 rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none uppercase"
                    >
                      <option value="" disabled>Select Catalyst</option>
                      <option value="FOMO">FOMO / Rushed Entry</option>
                      <option value="Revenge">Revenge Trading</option>
                      <option value="Boredom">Boredom / Forced Setup</option>
                      <option value="Ignored Plan">Ignored Trading Plan</option>
                    </select>
                  )}

                  <button 
                    disabled={!logPair || !logExecution || (logExecution === 'Imperfect' && !logReason) || tradesTakenToday >= 2}
                    onClick={() => {
                      if (tradesTakenToday < 2) setTradesTakenToday(prev => prev + 1);
                      setLogExecution(null); setLogReason('');
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Lock Entry Without Outcome
                  </button>
                </div>
              </div>

              {/* RIGHT: END OF WEEK RECONCILER */}
              <div className="flex-[1.2] p-6 overflow-y-auto custom-scrollbar relative bg-[#050505]">
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weekend Reconciliation Queue</span>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  {pendingReconciliation.length === 0 ? (
                    <div className="text-center py-10 text-zinc-600">
                      <span className="text-[10px] font-bold uppercase tracking-widest">No pending setups to reconcile</span>
                    </div>
                  ) : (
                    pendingReconciliation.map((trade) => (
                      <div key={trade.id} className="bg-[#0a0a0a] border border-zinc-800/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        
                        <div className="flex flex-col gap-1 w-1/3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400">{trade.day}</span>
                            <span className="text-sm font-bold text-zinc-200">{trade.symbol}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${trade.execution === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                              {trade.execution}
                            </span>
                            {trade.reason && <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">• {trade.reason}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-2/3 justify-end">
                          <select className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none uppercase w-28">
                            <option value="">Outcome</option>
                            <option value="TP">Hit TP</option>
                            <option value="SL">Hit SL</option>
                            <option value="BE">Break Even</option>
                          </select>
                          
                          <div className="relative w-24">
                            <input 
                              type="number" 
                              placeholder="0.0"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-zinc-300 outline-none placeholder:text-zinc-600"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">RR</span>
                          </div>

                          <button className="p-2 bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white rounded-lg transition-colors" title="Save Reconciled Data">
                            <Save size={16} />
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
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar p-3">
          {weeklySetups.length === 0 ? (
            <div className="text-center p-6 text-zinc-600">
              <span className="text-[10px] font-bold uppercase tracking-widest">Vault is empty</span>
            </div>
          ) : (
            weeklySetups.map((setup) => (
              <div 
                key={`weekly-${setup.id}`}
                className="w-full py-2.5 px-3 border border-zinc-800/50 bg-[#0a0a0a] rounded-lg flex justify-between items-center group shadow-sm hover:border-zinc-600 transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-zinc-200 tracking-wide group-hover:text-white transition-colors truncate">{setup.symbol}</span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate">{setup.notes ? 'Notes Logged' : 'No Notes'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => deleteSetup(setup.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button 
                    onClick={() => toggleTodayStatus(setup.id)}
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

      {/* RENDER MODAL */}
      <SetupUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSave={handleBulkUpload}
      />
      
    </div>
  )
}
