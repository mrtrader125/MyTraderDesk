'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, X, UploadCloud, Link as LinkIcon, Crosshair, 
  CheckCircle2, Clock, Activity, Target, ArrowRight, 
  FileText, Globe2, BarChart2, ChevronRight, Minimize2, ArrowLeft
} from 'lucide-react'

// --- UPLOAD MODAL COMPONENT (Kept Sleek & Functional) ---
function SetupUploadModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (setup: any) => void }) {
  const [instrument, setInstrument] = useState('')
  const [notes, setNotes] = useState('')
  const [imageSource, setImageSource] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractInstrument = (text: string) => {
    const match = text.toUpperCase().match(/[A-Z]{6}/)
    if (match) setInstrument(match[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      extractInstrument(file.name)
      setImageSource(URL.createObjectURL(file))
    }
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    extractInstrument(url)
    if (url) setImageSource(url)
  }

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setInstrument('')
        setNotes('')
        setImageSource(null)
      }, 200)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            <UploadCloud size={16} className="text-blue-500" /> Log Weekly Setup
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="flex flex-col gap-4">
            <div 
              onClick={() => !imageSource && fileInputRef.current?.click()}
              className={`w-full h-48 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group ${
                imageSource ? 'border-solid border-zinc-700 bg-black' : 'border-dashed border-zinc-800 cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/50'
              }`}
            >
              {imageSource ? (
                <>
                  <img src={imageSource} alt="Setup preview" className="object-contain w-full h-full p-2" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImageSource(null); setInstrument(''); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg backdrop-blur-sm transition-colors border border-zinc-800 hover:border-red-500/50"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center flex flex-col items-center p-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 border border-zinc-800">
                    <UploadCloud size={20} className="text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-300 font-medium">Click to upload chart image</span>
                  <span className="text-xs text-zinc-600 mt-1">We will auto-detect the ticker</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            {!imageSource && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-zinc-600" />
                </div>
                <input 
                  type="text" 
                  onChange={handleLinkChange}
                  placeholder="TradingView Image URL..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Instrument</label>
              <input 
                type="text" 
                value={instrument}
                onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                placeholder="e.g. GBPUSD"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors uppercase font-bold tracking-wide placeholder:normal-case placeholder:text-zinc-600 placeholder:font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Structural Thesis</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log structural bias, liquidity sweeps, or entry triggers..."
                className="w-full h-28 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors resize-none placeholder:text-zinc-600 custom-scrollbar"
              />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-zinc-800/50 bg-zinc-900/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">Cancel</button>
          <button 
            onClick={() => { 
              onSave({ id: Date.now().toString(), symbol: instrument, notes, imageUrl: imageSource || 'https://s3.tradingview.com/snapshots/a/aK3bXyvO.png', isToday: false });
              onClose();
            }}
            disabled={!instrument}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold tracking-wide hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Save to Weekly Vault
          </button>
        </div>
      </div>
    </div>
  )
}

// --- MAIN DASHBOARD COMPONENT ---
export default function PersonalDashboard() {
  // 1. STATE & DATA
  const [time, setTime] = useState(new Date())
  const [sessionInfo, setSessionInfo] = useState({ name: 'Determining...', localTime: '--:--:--', tz: 'UTC' })
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  // Workspace State
  const [setups, setSetups] = useState<any[]>([
    { id: '1', symbol: 'GBPJPY', notes: 'Macro structure shows clear sweep of weekly high. Waiting for 1H displacement and fair value gap tap to enter short. Target is the 4H unmitigated demand zone below.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder1.png', isToday: true },
    { id: '2', symbol: 'XAUUSD', notes: 'Gold respecting daily trendline. CPI data coming up, playing it safe until NY session volume steps in. Look for sweep of Asian session lows.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder2.png', isToday: true },
    { id: '3', symbol: 'GBPCAD', notes: 'Consolidating in a tight 4H range. Needs to break structure before committing capital.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder3.png', isToday: false },
    { id: '4', symbol: 'EURUSD', notes: 'Bullish order flow intact. Limit order set at the 1.08500 discount zone.', imageUrl: 'https://s3.tradingview.com/snapshots/placeholder4.png', isToday: false }
  ])

  const todaySetups = setups.filter(s => s.isToday)
  const weeklySetups = setups.filter(s => !s.isToday)
  
  // Track the actively viewed instrument in the "Today" 3-pane layout
  const [activeTodayId, setActiveTodayId] = useState<string | null>(todaySetups.length > 0 ? todaySetups[0].id : null)

  // Ensure an active setup is always selected if available
  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) {
      setActiveTodayId(null)
    }
  }, [todaySetups.length, activeTodayId])

  const [routine, setRoutine] = useState([
    { id: 1, label: 'Sunday Macro Prep (The Vault)', completed: true },
    { id: 2, label: 'Daily Filtering (Select Today\'s Pairs)', completed: false },
    { id: 3, label: 'Weekly Wind-up (PnL & RR Review)', completed: false }
  ])

  // 2. REAL-TIME CLOCK & SESSION ENGINE
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      
      const utcHour = now.getUTCHours();
      let sName = 'Interbank';
      let tz = 'UTC';

      // Logic based on standard UTC market hours
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

  // 3. ACTIONS
  const toggleRoutine = (id: number) => {
    setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const toggleTodayStatus = (id: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, isToday: !s.isToday } : s))
  }

  const handleAddNewSetup = (newSetup: any) => {
    setSetups([newSetup, ...setups])
  }

  const activeSetup = todaySetups.find(s => s.id === activeTodayId)

  // ==========================================
  // RENDER LAYOUT
  // ==========================================
  return (
    <div className="flex flex-col h-screen max-w-[1800px] mx-auto bg-zinc-950 animate-in fade-in duration-500 overflow-hidden">
      
      {/* 🟢 TOP ROW: METRICS & ROUTINE (Fixed Height) */}
      <div className="shrink-0 p-4 md:p-6 border-b border-zinc-800/50 grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 bg-zinc-900/10">
        
        {/* Metric 1: Operator Local Time */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex flex-col items-center justify-center p-4 shadow-sm h-[110px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Clock size={14}/> Operator Local Time
          </span>
          <span className="text-2xl font-mono text-zinc-100 tracking-wide">
            {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        
        {/* Metric 2: Active Global Session */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex flex-col items-center justify-center p-4 shadow-sm h-[110px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-2 flex items-center gap-1.5 relative z-10">
            <Globe2 size={14}/> Active Session: {sessionInfo.name}
          </span>
          <span className="text-xl font-mono text-white tracking-tight leading-tight relative z-10">
            {sessionInfo.localTime}
          </span>
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1 relative z-10">
            {sessionInfo.tz}
          </span>
        </div>

        {/* Metric 3: Routine Checklist */}
        <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col shadow-sm h-[110px]">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 size={14} className="text-emerald-500/70" /> Execution Routine
          </h3>
          <div className="flex flex-col gap-2.5 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {routine.map(item => (
              <div key={item.id} onClick={() => toggleRoutine(item.id)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${item.completed ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-700 text-transparent group-hover:border-zinc-500'}`}>
                  <CheckCircle2 size={12} />
                </div>
                <span className={`text-xs font-semibold tracking-wide transition-all ${item.completed ? 'text-zinc-600 line-through' : 'text-zinc-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🟢 BOTTOM ROW: MAIN WORKSPACE (Takes remaining height) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* --- LEFT AREA: TODAY'S FOCUS (3-PANE LAYOUT) --- */}
        <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 bg-zinc-950 overflow-hidden">
          
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Crosshair size={16} className="text-blue-500" /> Today's Focus
            </h2>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              {todaySetups.length} Locked
            </span>
          </div>

          <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0 overflow-hidden">
            
            {/* PANE 1: Today's Instrument List */}
            <div className="w-full xl:w-[220px] shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {todaySetups.length === 0 ? (
                <div className="h-full border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 p-6 text-center">
                  <Target size={24} className="mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Pairs Selected</span>
                  <span className="text-[10px] mt-2">Filter from Weekly Prep →</span>
                </div>
              ) : (
                todaySetups.map(setup => (
                  <div 
                    key={`today-${setup.id}`}
                    onClick={() => setActiveTodayId(setup.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                      activeTodayId === setup.id 
                        ? 'bg-zinc-800 border-zinc-700 shadow-md' 
                        : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white text-base' : 'text-zinc-300 text-sm group-hover:text-white'}`}>
                        {setup.symbol}
                      </span>
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Active</span>
                    </div>
                    {/* Remove from Today button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from Today"
                    >
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* PANE 2: Visual Chart Viewer */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col min-h-[300px]">
              {activeSetup ? (
                <>
                  <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center shrink-0">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                      <BarChart2 size={14} className="text-blue-400"/> Technical Analysis
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{activeSetup.symbol}</span>
                  </div>
                  <div className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center p-2">
                    <img 
                      src={activeSetup.imageUrl} 
                      alt={`${activeSetup.symbol} Chart`} 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-600">
                  <span className="text-xs font-bold uppercase tracking-widest">Select an instrument to view chart</span>
                </div>
              )}
            </div>

            {/* PANE 3: Structural Notes Column */}
            <div className="w-full xl:w-[280px] shrink-0 bg-zinc-900/30 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
              <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/50 shrink-0">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                  <FileText size={14} className="text-emerald-400"/> Structural Notes
                </span>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                {activeSetup ? (
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {activeSetup.notes}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest text-center mt-10">
                    No active notes
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT AREA: WEEKLY PREP VAULT --- */}
        <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-800/50 bg-zinc-900/20 flex flex-col min-h-0">
          
          <div className="p-4 md:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-4 shrink-0">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <UploadCloud size={16} className="text-zinc-400" /> Weekly Vault
              </h2>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                Level 1
              </span>
            </div>
            
            {/* Instrument List */}
            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
              {weeklySetups.length === 0 ? (
                <div className="text-center p-6 text-zinc-600">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Vault is empty</span>
                </div>
              ) : (
                weeklySetups.map((setup) => (
                  <div 
                    key={`weekly-${setup.id}`}
                    className="w-full py-3.5 px-4 border border-zinc-800/60 bg-zinc-950 rounded-xl flex justify-between items-center group shadow-sm hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-300 tracking-wide group-hover:text-white transition-colors">{setup.symbol}</span>
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Saved</span>
                    </div>
                    {/* Push to Today Button */}
                    <button 
                      onClick={() => toggleTodayStatus(setup.id)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest bg-zinc-900 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      Push <ArrowRight size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Action Button at the bottom */}
            <div className="mt-auto pt-4 shrink-0 border-t border-zinc-800/50">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full py-3.5 px-4 flex items-center justify-center gap-2 border border-dashed border-zinc-700 bg-zinc-950 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all shadow-sm"
              >
                <Plus size={16} /> Add Weekly Setup
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RENDER MODAL */}
      <SetupUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSave={handleAddNewSetup}
      />
      
    </div>
  )
}
