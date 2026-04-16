'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, X, UploadCloud, Link as LinkIcon, Crosshair, 
  CheckCircle2, Clock, Activity, Target, ArrowRight, ArrowLeft,
  Globe2, BarChart2, Image as ImageIcon, Trash2, Menu
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

// --- MAIN DASHBOARD COMPONENT ---
export default function PersonalDashboard() {
  // Layout State
  const [isVaultOpen, setIsVaultOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Data State
  const [time, setTime] = useState<Date | null>(null) 
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--', tz: 'UTC' })
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  // Workspace State
  const [setups, setSetups] = useState<any[]>([
    { id: '1', symbol: 'GBPJPY', notes: 'Macro structure shows clear sweep of weekly high. Waiting for 1H displacement and fair value gap tap to enter short.\n\n• Target is the 4H unmitigated demand zone below.\n• Invalidation is a candle close above 192.500.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder1.png', isToday: true },
    { id: '2', symbol: 'XAUUSD', notes: 'Gold respecting daily trendline. CPI data coming up, playing it safe until NY session volume steps in. Look for sweep of Asian session lows.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder2.png', isToday: true },
    { id: '3', symbol: 'GBPCAD', notes: 'Consolidating in a tight 4H range. Needs to break structure before committing capital.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder3.png', isToday: false },
    { id: '4', symbol: 'EURUSD', notes: 'Bullish order flow intact. Limit order set at the 1.08500 discount zone.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder4.png', isToday: false }
  ])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  
  const [activeTodayId, setActiveTodayId] = useState<string | null>(todaySetups.length > 0 ? todaySetups[0].id : null)

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
    }
  }, [todaySetups.length, activeTodayId])

  const [routine, setRoutine] = useState([
    { id: 1, label: 'Sunday Macro Prep', completed: true },
    { id: 2, label: 'Daily Filtering', completed: false },
    { id: 3, label: 'Weekly Wind-up', completed: false }
  ])

  // Real-time Clock & Session
  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      const utcHour = now.getUTCHours();
      let sName = 'Interbank';
      let tz = 'UTC';

      if (utcHour >= 13 && utcHour < 22) { sName = 'New York'; tz = 'America/New_York'; }
      else if (utcHour >= 8 && utcHour < 17) { sName = 'London'; tz = 'Europe/London'; }
      else if (utcHour >= 0 && utcHour < 9) { sName = 'Tokyo'; tz = 'Asia/Tokyo'; }
      else { sName = 'Sydney'; tz = 'Australia/Sydney'; }

      setSessionInfo({
        name: sName,
        localTime: now.toLocaleTimeString('en-US', { timeZone: tz, hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tz: tz
      });

    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Actions
  const toggleRoutine = (id: number) => {
    setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const toggleTodayStatus = (id: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday } : s))
  }

  const deleteSetup = (id: string) => {
    setSetups(prev => prev.filter(s => s.id !== id))
  }

  const handleBulkUpload = (newSetups: any[]) => {
    setSetups(prev => [...newSetups, ...prev])
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  return (
    <div className="flex h-screen w-full bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      {/* 🔴 LEFT/MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative pt-2">
        
        {/* TOP ROW: METRICS & ROUTINE */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col md:flex-row gap-4 min-h-0 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col gap-4 w-full md:w-64 shrink-0">
            {/* Metric: Local Time */}
            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm h-24 shrink-0">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Clock size={12}/> Local Time
              </span>
              <span className="text-lg font-mono text-zinc-100 tracking-wide">
                {mounted && time ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
              </span>
            </div>
            
            {/* Metric: Active Session */}
            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm h-24 shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest mb-1 flex items-center gap-1 relative z-10">
                <Globe2 size={12}/> {sessionInfo.name} Session
              </span>
              <span className="text-lg font-mono text-white tracking-tight leading-tight relative z-10">
                {sessionInfo.localTime}
              </span>
            </div>
          </div>

          {/* Metric: Routine Checklist & Vault Toggle */}
          <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg p-4 flex flex-col shadow-sm min-h-0">
            <div className="flex justify-between items-center mb-3 border-b border-zinc-800/50 pb-2 shrink-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500/70" /> Execution Routine
              </h3>
              <button 
                onClick={() => setIsVaultOpen(!isVaultOpen)} 
                className="text-zinc-500 hover:text-white transition-colors"
                title="Toggle Weekly Vault"
              >
                <Menu size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2.5 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {routine.map(item => (
                <div key={item.id} onClick={() => toggleRoutine(item.id)} className="flex items-center gap-3 cursor-pointer group py-1">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent group-hover:border-zinc-500'}`}>
                    <CheckCircle2 size={10} />
                  </div>
                  <span className={`text-xs font-semibold tracking-wide transition-all ${item.completed ? 'text-zinc-600 line-through' : 'text-zinc-300 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: 50% HEIGHT TODAY WORKSPACE */}
        <div className="h-1/2 min-h-0 flex flex-col border-t border-zinc-800/60 bg-[#080808]">
          
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
                    onClick={() => setActiveTodayId(setup.id)}
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
                <div className="absolute inset-0 p-2 flex items-center justify-center">
                   <img src={activeSetup.imageUrl} alt={`${activeSetup.symbol} Chart`} className="w-full h-full object-contain rounded-lg border border-zinc-800/50 shadow-2xl" />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-700">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Select a pair to view</span>
                </div>
              )}
            </div>

            {/* PANE 3: Notes Simple Box */}
            <div className="w-64 sm:w-72 shrink-0 flex flex-col min-h-0 p-3 pl-0 bg-[#030303]">
              <div className="flex-1 bg-[#0a0a0a] border border-zinc-800/60 rounded-lg overflow-y-auto custom-scrollbar p-4 shadow-sm">
                {activeSetup ? (
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {activeSetup.notes || <span className="italic text-zinc-600">No notes provided...</span>}
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-10">
                    No active notes
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🔴 RIGHT WORKSPACE: COLLAPSIBLE VAULT */}
      <div 
        className={`h-full bg-[#080808] border-l border-zinc-800/60 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isVaultOpen ? 'w-[280px] lg:w-[300px] xl:w-[320px] opacity-100' : 'w-0 opacity-0 border-l-0'
        }`}
      >
        <div className="h-12 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]">
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
