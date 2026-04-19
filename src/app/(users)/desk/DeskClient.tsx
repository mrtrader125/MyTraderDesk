'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Papa from 'papaparse'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { 
  Plus, X, UploadCloud, Crosshair, Target, ArrowRight, ArrowLeft, Eye, Bold, List,
  Image as ImageIcon, Trash2, Menu, Activity, AlertTriangle, CheckCircle, CheckCircle2, Save, ChevronUp, ChevronDown, Link as LinkIcon, DownloadCloud, Check, Maximize, Clipboard, Settings, Info, BookOpen, Lock, Copy
} from 'lucide-react'

// 🚨 CONSTANTS MUST BE AT THE TOP
const PLAYBOOKS = ["Liquidity Sweep", "Trend Continuation", "Range Play", "Breakout / Retest", "News Catalyst"]
const DEFAULT_PERFECT_CATALYSTS = ["Followed Plan", "Extreme Patience", "A+ Setup", "Perfect Risk Management"]
const DEFAULT_IMPERFECT_CATALYSTS = ["FOMO / Rushed Entry", "Revenge Trading", "Boredom / Forced Setup", "Ignored Trading Plan"]

// 🚨 GLOBAL SUPABASE CLIENT (Fixes "Multiple GoTrueClient instances" warning)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type DraftSetup = {
  id: string;
  imageSource: string | null;
  file: File | null;
  instrument: string;
  direction: 'LONG' | 'SHORT' | '';
  playbook: string;
  notes: string;
}

// --- MT5 SYNC MODAL ---
function MT5SyncModal({ isOpen, onClose, file, pendingLogs, onConfirm }: { isOpen: boolean, onClose: () => void, file: File | null, pendingLogs: any[], onConfirm: (matches: any[]) => void }) {
  const [offsetHours, setOffsetHours] = useState(0)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isParsing, setIsParsing] = useState(false)

  useEffect(() => {
    if (file && isOpen) {
      setIsParsing(true)
      const processMatrix = (rows: string[][]) => {
        if (rows.length < 2) return setIsParsing(false)
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
            const str = rows[i].join(' ').toLowerCase();
            if ((str.includes('symbol') || str.includes('item')) && str.includes('profit') && str.includes('time')) {
                headerIdx = i;
                break;
            }
        }
        if (headerIdx === -1) return setIsParsing(false);

        const headers = rows[headerIdx].map(h => h?.toLowerCase() || '')
        const idx = {
          symbol: headers.findIndex(h => h.includes('symbol') || h.includes('item')),
          profit: headers.findIndex(h => h === 'profit'),
          time: headers.findIndex(h => h.includes('time')),
          ticket: headers.findIndex(h => h.includes('position') || h.includes('ticket') || h.includes('order')),
          type: headers.findIndex(h => h.includes('type')),
          sl: headers.findIndex(h => h.includes('s / l') || h.includes('sl')),
          price: headers.findIndex(h => h === 'price')
        }

        const dataRows = rows.slice(headerIdx + 1)
        const validRows = dataRows.filter(r => r[idx.symbol] && r[idx.profit])
        const positions: Record<string, any> = {}
        
        validRows.forEach(row => {
          const ticket = row[idx.ticket] || Math.random().toString()
          if (!positions[ticket]) {
            positions[ticket] = {
              ticket, 
              symbol: String(row[idx.symbol]).replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
              time: row[idx.time], 
              type: String(row[idx.type] || '').toLowerCase(),
              profit: 0, 
              sl: parseFloat(row[idx.sl]) || 0, 
              entryPrice: parseFloat(row[idx.price]) || 0
            }
          }
          const cleanProfit = String(row[idx.profit]).replace(/[^0-9.-]/g, '')
          positions[ticket].profit += parseFloat(cleanProfit) || 0
        })
        setParsedData(Object.values(positions))
        setIsParsing(false)
      }

      if (file.name.endsWith('.csv')) {
        Papa.parse(file, { header: false, skipEmptyLines: true, complete: (results) => processMatrix(results.data as string[][]) })
      } else if (file.name.endsWith('.htm') || file.name.endsWith('.html')) {
        file.text().then(text => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const rows = Array.from(doc.querySelectorAll('tr')).map(tr => Array.from(tr.querySelectorAll('td, th')).map(td => (td as HTMLElement).innerText.trim()));
            processMatrix(rows);
        }).catch(() => setIsParsing(false))
      } else {
        setIsParsing(false)
      }
    }
  }, [file, isOpen])

  const matches = useMemo(() => {
    return pendingLogs.map(log => {
      const logTime = new Date(log.created_at).getTime()
      let bestMatch = null
      let smallestDiff = Infinity
      
      parsedData.forEach(pos => {
        if (pos.symbol.includes(log.symbol) || log.symbol.includes(pos.symbol)) {
          const mt5Time = new Date(pos.time.replace(/\./g, '/')).getTime() - (offsetHours * 3600000)
          const diff = Math.abs(logTime - mt5Time)
          
          if (diff < 14400000 && diff < smallestDiff) { 
            smallestDiff = diff
            let outcome = pos.profit > 0 ? 'TP' : (pos.profit < 0 ? 'SL' : 'BE')
            let rr = 0
            if (pos.sl > 0 && pos.entryPrice > 0) {
              rr = outcome === 'TP' ? 2.0 : (outcome === 'SL' ? -1.0 : 0)
            }
            bestMatch = { ...pos, outcome, rr, adjustedTime: mt5Time }
          }
        }
      })
      return { log, match: bestMatch }
    })
  }, [parsedData, offsetHours, pendingLogs])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col h-[80vh]">
        
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <DownloadCloud size={16} className="text-blue-500" /> 
            MT5 Data Staging
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18}/>
          </button>
        </div>
        
        <div className="p-4 border-b border-zinc-800 bg-black flex items-center justify-between sm:justify-start gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Broker Timezone Offset
            </span>
            <span className="text-[9px] text-zinc-600 hidden sm:block">
              Adjust to align MT5 time with your local time.
            </span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <button onClick={() => setOffsetHours(p => p - 1)} className="px-3 py-1 hover:bg-zinc-800 rounded text-zinc-300 font-mono">-</button>
            <span className="font-mono text-sm font-bold w-8 text-center text-white">
              {offsetHours > 0 ? `+${offsetHours}` : offsetHours}
            </span>
            <button onClick={() => setOffsetHours(p => p + 1)} className="px-3 py-1 hover:bg-zinc-800 rounded text-zinc-300 font-mono">+</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black">
          {isParsing ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm uppercase tracking-widest font-bold">
              Parsing MT5 History...
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((m, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  
                  <div className="flex-1 w-full flex flex-col p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest mb-1">
                      Logged Reality
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{m.log.symbol}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${m.log.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {m.log.direction}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      {new Date(m.log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <ArrowRight size={16} className="text-zinc-600 hidden sm:block rotate-90 sm:rotate-0" />
                  
                  <div className={`flex-1 w-full flex flex-col p-3 rounded-lg border ${m.match ? 'bg-blue-500/5 border-blue-500/30' : 'bg-zinc-900/30 border-dashed border-zinc-800'}`}>
                    <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest mb-1">
                      MT5 Broker Data
                    </span>
                    {m.match ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-white">{m.match.symbol}</span>
                          <span className={`text-xs font-mono font-bold ${m.match.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${m.match.profit.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1">
                          Ticket: {m.match.ticket} • Auto: {m.match.outcome}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-zinc-600 mt-1">No Match Found</span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button 
            onClick={() => { onConfirm(matches); onClose(); }} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
          >
            <Check size={14} /> Sync Matches
          </button>
        </div>
      </div>
    </div>
  )
}

// --- SETUP UPLOAD MODAL ---
function SetupUploadModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (setups: any[]) => void }) {
  const [drafts, setDrafts] = useState<DraftSetup[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [linkInput, setLinkInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [isPeeking, setIsPeeking] = useState(false)
  const peekTimer = useRef<NodeJS.Timeout | null>(null)

  const extractInstrument = (text: string) => { 
    const match = text.toUpperCase().match(/[A-Z0-9]{4,8}/); 
    return match ? match[0] : '' 
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        const newDrafts = files.map(file => ({ 
          id: Math.random().toString(36).substr(2, 9), 
          imageSource: URL.createObjectURL(file), 
          file, 
          instrument: extractInstrument(file.name), 
          direction: '' as '', 
          playbook: '', 
          notes: '' 
        }));
        setDrafts(prev => [...prev, ...newDrafts]);
        if (drafts.length === 0) setActiveIndex(0);
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isOpen, drafts.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      const newDrafts: DraftSetup[] = imageFiles.map(file => ({ 
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLinkInput(text);
    } catch (err) {
      alert('Clipboard access blocked. Please use Ctrl+V to paste.');
    }
  };

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
    setDrafts(prev => prev.filter((_, i) => i !== index)); 
    if (activeIndex >= index && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    } 
  }

  const handleSaveAll = async () => {
    setIsUploading(true)
    const validDrafts = drafts.filter(d => d.instrument.trim() !== '' && d.direction !== '')
    await onSave(validDrafts)
    setIsUploading(false)
    onClose()
  }

  const handlePeekStart = () => { peekTimer.current = setTimeout(() => setIsPeeking(true), 400); };
  const handlePeekEnd = () => { if (peekTimer.current) clearTimeout(peekTimer.current); setIsPeeking(false); };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && drafts.length === 0 && !linkInput) {
      onClose();
    }
  };

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden h-[90vh] lg:h-[80vh] min-h-[500px] relative" onClick={e => e.stopPropagation()}>
          
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-purple-500/10 border-4 border-purple-500/50 border-dashed rounded-xl flex items-center justify-center pointer-events-none backdrop-blur-sm m-2">
              <div className="bg-black/90 px-8 py-6 rounded-2xl flex flex-col items-center shadow-2xl">
                <UploadCloud size={48} className="text-purple-500 mb-3 animate-bounce" />
                <p className="text-white font-black text-xl tracking-widest uppercase">Drop Images to Stage</p>
              </div>
            </div>
          )}

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
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded transition-colors flex items-center justify-center gap-1.5" 
                  disabled={isUploading}
                >
                  <Plus size={14} /> Add Images
                </button>
                
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={linkInput} 
                    onChange={(e) => setLinkInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    placeholder="Paste URL..." 
                    className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] text-zinc-300 outline-none focus:border-purple-500 transition-colors" 
                    disabled={isUploading} 
                  />
                  <button 
                    onClick={handlePasteClick} 
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-2 rounded transition-colors" 
                    disabled={isUploading} 
                    title="Paste Text"
                  >
                    <Clipboard size={12}/>
                  </button>
                  <button 
                    onClick={handleAddLink} 
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 rounded transition-colors" 
                    disabled={isUploading} 
                    title="Add"
                  >
                    <Plus size={12}/>
                  </button>
                </div>
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scrollbar p-2 flex flex-row lg:flex-col gap-2 text-white">
                {drafts.map((draft, idx) => (
                  <div 
                    key={draft.id} 
                    onClick={() => setActiveIndex(idx)} 
                    className={`min-w-[150px] lg:min-w-0 p-2 rounded border cursor-pointer flex items-center gap-2 transition-all ${activeIndex === idx ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-950 border-zinc-800/50 hover:bg-zinc-900'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {draft.instrument || 'UNKNOWN'}
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate">
                        {draft.direction ? `${draft.direction}` : 'Incomplete'}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeDraft(idx); }} 
                      className="text-zinc-600 hover:text-red-400 p-1" 
                      disabled={isUploading}
                    >
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 overflow-y-auto custom-scrollbar">
              {drafts.length > 0 && drafts[activeIndex] ? (
                <div className="p-4 lg:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full text-white">
                  
                  <div 
                    className="w-full aspect-[16/9] bg-[#0a0a0a] border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center mb-2 relative"
                    onMouseDown={handlePeekStart} 
                    onMouseUp={handlePeekEnd} 
                    onMouseLeave={handlePeekEnd} 
                    onTouchStart={handlePeekStart} 
                    onTouchEnd={handlePeekEnd}
                  >
                    {drafts[activeIndex].imageSource ? (
                      <img 
                        src={drafts[activeIndex].imageSource!} 
                        alt="Preview" 
                        loading="eager" 
                        decoding="async"
                        className="w-full h-full object-contain p-2 cursor-pointer" 
                        draggable={false} 
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-zinc-700" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        Instrument Ticker
                      </label>
                      <input 
                        type="text" 
                        value={drafts[activeIndex].instrument} 
                        onChange={(e) => updateActiveDraft('instrument', e.target.value.toUpperCase())} 
                        placeholder="e.g. GBPUSD" 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500 transition-colors uppercase font-bold" 
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        Macro Bias
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateActiveDraft('direction', 'LONG')} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${drafts[activeIndex].direction === 'LONG' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black border-zinc-800 text-zinc-500'}`}
                        >
                          LONG
                        </button>
                        <button 
                          onClick={() => updateActiveDraft('direction', 'SHORT')} 
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${drafts[activeIndex].direction === 'SHORT' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black border-zinc-800 text-zinc-500'}`}
                        >
                          SHORT
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Playbook & Catalysts
                    </label>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentNotes = drafts[activeIndex].notes;
                          updateActiveDraft('notes', currentNotes ? `${currentNotes}\n[${e.target.value}]` : `[${e.target.value}]`);
                          e.target.value = "";
                        }
                      }} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500" 
                      disabled={isUploading}
                    >
                      <option value="">Insert Tag...</option>
                      <optgroup label="Playbooks">
                        {PLAYBOOKS.map(p => <option key={p} value={p}>{p}</option>)}
                      </optgroup>
                      <optgroup label="Catalysts">
                        {CATALYSTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-1 mt-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Structural Thesis
                    </label>
                    <textarea 
                      value={drafts[activeIndex].notes} 
                      onChange={(e) => updateActiveDraft('notes', e.target.value)} 
                      placeholder="Log structural bias, liquidity sweeps, or entry triggers..." 
                      className="w-full min-h-[100px] flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500 transition-colors resize-none custom-scrollbar" 
                      disabled={isUploading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-6">
                  <UploadCloud size={40} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium text-center">
                    Drag & Drop images anywhere<br/>
                    <span className="text-[10px] opacity-70">or use Ctrl+V to paste a screenshot</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center shrink-0">
            <span className="text-xs font-medium text-zinc-500">
              {drafts.length} {drafts.length === 1 ? 'setup' : 'setups'} staged
            </span>
            <button 
              onClick={handleSaveAll} 
              disabled={drafts.length === 0 || drafts.some(d => d.instrument.trim() === '' || !d.direction) || isUploading} 
              className="px-6 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isUploading ? 'Saving...' : 'Save to Vault'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 🚨 Peek Overlay for Upload Modal */}
      {isPeeking && drafts.length > 0 && drafts[activeIndex]?.imageSource && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-8 pointer-events-none animate-in fade-in duration-150">
          <img 
            src={drafts[activeIndex].imageSource!} 
            alt="Peek" 
            loading="eager" 
            decoding="async"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}
    </>
  )
}

// --- RICH TEXT EDITOR ---
function RichNotesEditor({ activeSetup, onUpdate }: { activeSetup: any, onUpdate: (id: string, notes: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: activeSetup?.notes || '',
    editorProps: { 
      attributes: { 
        class: 'flex-1 w-full bg-transparent border-none focus:outline-none text-xs text-zinc-300 leading-relaxed font-medium custom-scrollbar overflow-y-auto min-h-0' 
      } 
    },
    onUpdate: ({ editor }) => { 
      if (activeSetup) onUpdate(activeSetup.id, editor.getHTML()) 
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
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          No active notes
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden tiptap-wrapper">
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-zinc-800/60 shrink-0">
        <button 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
        >
          <Bold size={14} />
        </button>
        <button 
          onClick={() => editor?.chain().focus().toggleBulletList().run()} 
          className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
        >
          <List size={14} />
        </button>
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

// --- RECONCILIATION ITEM ---
function ReconciliationItem({ trade, onSave, onSplit, user }: { trade: any, onSave: (id: string, outcome: string, rr: string, afterImageUrl: string, afterFile?: File | null) => void, onSplit: (id: string) => void, user: any }) {
  const [outcome, setOutcome] = useState(trade.outcome || '')
  const [rr, setRr] = useState(trade.rr ? trade.rr.toString() : '')
  
  const [afterInput, setAfterInput] = useState('') 
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [afterPreview, setAfterPreview] = useState<string | null>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [showHoldConfirm, setShowHoldConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { 
    setOutcome(trade.outcome || ''); 
    setRr(trade.rr ? trade.rr.toString() : ''); 
  }, [trade.outcome, trade.rr])

  useEffect(() => {
    setShowHoldConfirm(false);
  }, [outcome])

  const handleWheel = (e: React.WheelEvent<HTMLSelectElement>) => {
    const outcomes = ['', 'TP', 'SL', 'BE', 'HOLD'];
    const dir = e.deltaY > 0 ? 1 : -1;
    let next = outcomes.indexOf(outcome) + dir;
    if (next >= outcomes.length) next = outcomes.length - 1;
    if (next < 0) next = 0;
    setOutcome(outcomes[next]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAfterFile(e.target.files[0]);
      setAfterPreview(URL.createObjectURL(e.target.files[0]));
    }
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType(item.types.find(t => t.startsWith('image/'))!);
          const file = new File([blob], "pasted-image.png", { type: blob.type });
          setAfterFile(file);
          setAfterPreview(URL.createObjectURL(blob));
          return;
        }
      }
      const text = await navigator.clipboard.readText();
      if (text) setAfterInput(text);
    } catch (err) {
      const text = await navigator.clipboard.readText().catch(()=>'');
      if (text) setAfterInput(text);
    }
  }

  const executeSave = async () => { 
    setIsSaving(true); 
    await onSave(trade.id, outcome, rr, afterInput, afterFile); 
    setIsSaving(false); 
    setShowHoldConfirm(false);
  }
  
  const isMt5Synced = trade.outcome && trade.rr !== undefined

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm shrink-0 hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-black text-white">{trade.symbol}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${trade.direction === 'LONG' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {trade.direction}
          </span>
          {trade.reason && (
            <span className="text-[10px] text-zinc-400 font-medium">• {trade.reason.replace(/\n/g, ', ')}</span>
          )}
          {isMt5Synced && (
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
              <DownloadCloud size={10}/> MT5 Synced
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 hidden sm:block">{trade.day}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${trade.execution === 'Perfect' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trade.execution}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={outcome} 
          onChange={e => setOutcome(e.target.value)} 
          onWheel={handleWheel}
          className={`w-full sm:w-28 bg-black border ${isMt5Synced ? 'border-blue-500/30 text-blue-300' : 'border-zinc-800 text-zinc-300'} rounded-lg px-3 py-2 text-[10px] font-bold outline-none uppercase focus:border-blue-500 cursor-ns-resize`}
          title="Scroll to change"
        >
          <option value="">Outcome</option>
          <option value="TP">Hit TP</option>
          <option value="SL">Hit SL</option>
          <option value="BE">Break Even</option>
          <option value="HOLD">Hold (Carry)</option>
        </select>
        
        {/* 🚨 This hides the RR and Image inputs if the HOLD warning is active */}
        {!showHoldConfirm && (
          <>
            <div className="relative w-full sm:w-24 shrink-0">
              <input 
                type="number" 
                value={rr} 
                onChange={e => setRr(e.target.value)} 
                placeholder="0.0" 
                className={`w-full bg-black border ${isMt5Synced ? 'border-blue-500/30 text-blue-300' : 'border-zinc-800 text-zinc-300'} rounded-lg pl-8 pr-2 py-2 text-[10px] font-bold outline-none focus:border-blue-500`} 
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-500 uppercase">RR</span>
            </div>

            <div className="relative flex-1 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 pr-2 focus-within:border-blue-500 transition-all min-w-0">
               {afterPreview ? (
                 <div className="flex-1 flex items-center gap-2 pl-2 overflow-hidden">
                   <img 
                     src={afterPreview} 
                     loading="eager" 
                     decoding="async"
                     className="h-6 w-6 object-cover rounded border border-zinc-700 shrink-0" 
                   />
                   <span className="text-[10px] font-bold text-zinc-400 truncate tracking-widest uppercase">Image Attached</span>
                   <button 
                     onClick={() => { setAfterFile(null); setAfterPreview(null); }} 
                     className="ml-auto text-zinc-500 hover:text-red-400 p-1"
                   >
                     <X size={12}/>
                   </button>
                 </div>
               ) : (
                 <>
                   <LinkIcon size={12} className="text-zinc-500 ml-2 shrink-0" />
                   <input 
                     type="text" 
                     value={afterInput} 
                     onChange={e => setAfterInput(e.target.value)} 
                     placeholder="TV URL or Paste Image..." 
                     className="w-full bg-transparent border-none text-[10px] font-bold text-zinc-300 outline-none placeholder:text-zinc-600 px-2" 
                   />
                   <button 
                     onClick={handlePaste} 
                     className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors shrink-0" 
                     title="Paste URL or Image"
                   >
                     <Clipboard size={12}/>
                   </button>
                   <button 
                     onClick={() => fileInputRef.current?.click()} 
                     className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors shrink-0" 
                     title="Upload Image"
                   >
                     <ImageIcon size={12}/>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                 </>
               )}
            </div>
          </>
        )}

        {/* 🚨 The Settle / Confirmation Buttons */}
        {showHoldConfirm ? (
          <div className="flex items-center justify-end gap-3 flex-1 animate-in fade-in zoom-in-95 duration-200 min-w-0">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-right leading-tight mr-2 hidden sm:block">
              Are you actually holding<br/>or avoiding a loss?
            </span>
            <button onClick={() => setShowHoldConfirm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shrink-0">Cancel</button>
            <button onClick={executeSave} disabled={isSaving} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)] shrink-0">
              {isSaving ? '...' : 'Confirm'}
            </button>
          </div>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button 
              disabled={!outcome || (outcome !== 'HOLD' && !rr) || isSaving} 
              onClick={() => outcome === 'HOLD' ? setShowHoldConfirm(true) : executeSave()} 
              className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:bg-zinc-800 rounded-lg transition-colors shrink-0"
            >
              {isSaving ? 'Saving...' : outcome === 'HOLD' ? 'Carry Over' : 'Settle Trade'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// --- SETTINGS MODAL ---
function CatalystSettingsModal({ isOpen, onClose, perfect, setPerfect, imperfect, setImperfect }: any) {
  const [newPerfect, setNewPerfect] = useState('')
  const [newImperfect, setNewImperfect] = useState('')

  if (!isOpen) return null

  const addPerfect = () => {
    if (newPerfect.trim() && !perfect.includes(newPerfect.trim())) {
      setPerfect([...perfect, newPerfect.trim()]);
      setNewPerfect('');
    }
  }
  
  const addImperfect = () => {
    if (newImperfect.trim() && !imperfect.includes(newImperfect.trim())) {
      setImperfect([...imperfect, newImperfect.trim()]);
      setNewImperfect('');
    }
  }

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Settings size={16} className="text-zinc-400" /> Catalyst Settings
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          <div>
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 border-b border-emerald-500/20 pb-1">
              Perfect Execution Catalysts
            </h3>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={newPerfect} 
                onChange={e => setNewPerfect(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addPerfect()} 
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-emerald-500 transition-colors" 
                placeholder="Add new catalyst..." 
              />
              <button onClick={addPerfect} className="px-3 bg-emerald-600 hover:bg-emerald-500 rounded text-white transition-colors">
                <Plus size={14}/>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {perfect.map((c: string) => (
                <span key={c} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1.5">
                  {c} 
                  <X size={10} className="cursor-pointer hover:text-white transition-colors" onClick={() => setPerfect(perfect.filter((item: string) => item !== c))}/>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 border-b border-red-500/20 pb-1">
              Imperfect Execution Catalysts
            </h3>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                value={newImperfect} 
                onChange={e => setNewImperfect(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addImperfect()} 
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-red-500 transition-colors" 
                placeholder="Add new catalyst..." 
              />
              <button onClick={addImperfect} className="px-3 bg-red-600 hover:bg-red-500 rounded text-white transition-colors">
                <Plus size={14}/>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {imperfect.map((c: string) => (
                <span key={c} className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded flex items-center gap-1.5">
                  {c} 
                  <X size={10} className="cursor-pointer hover:text-white transition-colors" onClick={() => setImperfect(imperfect.filter((item: string) => item !== c))}/>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- MAIN DESK CLIENT ---
export default function DeskClient() {
  
  // 🚨 1. ALL USESTATE HOOKS FIRST
  const [user, setUser] = useState<any>(null)
  const [setups, setSetups] = useState<any[]>([])
  const [pendingReconciliation, setPendingReconciliation] = useState<any[]>([])
  const [tradesTakenToday, setTradesTakenToday] = useState(0)
  const [executedSymbols, setExecutedSymbols] = useState<string[]>([])
  const [previewSetup, setPreviewSetup] = useState<any>(null);

  const [isVaultOpen, setIsVaultOpen] = useState(false)
  const [isAuditOpen, setIsAuditOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCatalystSettingsOpen, setIsCatalystSettingsOpen] = useState(false)
  const [confirmPushId, setConfirmPushId] = useState<string | null>(null)
  
  const [perfectCatalysts, setPerfectCatalysts] = useState<string[]>(DEFAULT_PERFECT_CATALYSTS)
  const [imperfectCatalysts, setImperfectCatalysts] = useState<string[]>(DEFAULT_IMPERFECT_CATALYSTS)

  const [logPair, setLogPair] = useState<string>('') 
  const [logDirection, setLogDirection] = useState<'LONG' | 'SHORT' | null>(null)
  const [logCatalystText, setLogCatalystText] = useState('')
  const [logExecution, setLogExecution] = useState<'Perfect' | 'Imperfect' | null>(null)

  const [isMT5ModalOpen, setIsMT5ModalOpen] = useState(false)
  const [mt5File, setMt5File] = useState<File | null>(null)
  const mt5InputRef = useRef<HTMLInputElement>(null)

  const [isPeeking, setIsPeeking] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [chartScale, setChartScale] = useState(1)
  const peekTimer = useRef<NodeJS.Timeout | null>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)

  const [isMobileNotesOpen, setIsMobileNotesOpen] = useState(false)
  const [timeOffset, setTimeOffset] = useState(0);
  const [weeklyDebrief, setWeeklyDebrief] = useState('');
  const [activeTodayId, setActiveTodayId] = useState<string | null>(null)

  // 🚨 2. DERIVED STATES AND CALLBACKS
  const getSecureTime = useCallback(() => new Date(Date.now() + timeOffset), [timeOffset]);

  const now = getSecureTime();
  const dayOfWeek = now.getDay();
  const isWeekendNow = dayOfWeek === 6 || dayOfWeek === 0;
  
  // Safe Date Math - creates a fresh date object without mutating `now`
  const startOfCurrentWeek = new Date(now.getTime());
  const diffToMonday = startOfCurrentWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfCurrentWeek.setDate(diffToMonday);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const debriefKey = `desk_weekly_debrief_${startOfCurrentWeek.getTime()}`;

  const todaySetups = setups.filter(s => s.isToday);
  const activeSetup = todaySetups.find(s => s.id === activeTodayId);
  const pushesToday = setups.filter(s => s.addedToTodayAt && new Date(s.addedToTodayAt).toDateString() === now.toDateString()).length;
  const canPushMore = pushesToday < 5;

  const weeklySetups = [...setups].sort((a, b) => {
    const aExec = executedSymbols.includes(a.symbol);
    const bExec = executedSymbols.includes(b.symbol);
    if (aExec && !bExec) return 1; 
    if (!aExec && bExec) return -1;
    return 0;
  });

  const currentWeekPending = pendingReconciliation.filter(t => new Date(t.created_at).getTime() >= startOfCurrentWeek.getTime() && t.outcome !== 'HOLD');
  const heldOverPending = pendingReconciliation.filter(t => new Date(t.created_at).getTime() < startOfCurrentWeek.getTime() || t.outcome === 'HOLD');

  const isPrepWindow = isWeekendNow || (dayOfWeek === 1 && (now.getHours() < 5 || (now.getHours() === 5 && now.getMinutes() < 30)));
  const isVaultLocked = !isPrepWindow || (isPrepWindow && currentWeekPending.length > 0);
  const isAlreadyLogged = pendingReconciliation.some(t => t.symbol === logPair) || executedSymbols.includes(logPair);
  const activeCatalystList = logExecution === 'Perfect' ? perfectCatalysts : logExecution === 'Imperfect' ? imperfectCatalysts : [];


  // 🚨 3. ALL USEEFFECTS
  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Swapped to a stronger, unblocked API
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata', { cache: 'no-store' });
        if (!res.ok) throw new Error('API Blocked');
        const data = await res.json();
        // TimeAPI uses 'dateTime' instead of 'datetime'
        const realTime = new Date(data.dateTime).getTime();
        setTimeOffset(realTime - Date.now());
      } catch (error) {
        setTimeOffset(0); // Silently falls back if connection drops
      }
    };
    fetchTime();
  }, []);

  useEffect(() => {
    setWeeklyDebrief(localStorage.getItem(debriefKey) || ''); 
  }, [debriefKey]);

  useEffect(() => {
    const handleResize = () => setIsVaultOpen(window.innerWidth >= 1024);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const vault = localStorage.getItem('desk_vault_open')
    const audit = localStorage.getItem('desk_audit_open')
    if (vault) setIsVaultOpen(vault === 'true')
    if (audit) setIsAuditOpen(audit === 'true')
  }, [])

  useEffect(() => { localStorage.setItem('desk_vault_open', String(isVaultOpen)) }, [isVaultOpen])
  useEffect(() => { localStorage.setItem('desk_audit_open', String(isAuditOpen)) }, [isAuditOpen])

  useEffect(() => {
    const syncCatalysts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            desk_perfect_catalysts: perfectCatalysts,
            desk_imperfect_catalysts: imperfectCatalysts
          }
        })
      }
    }
    const timeoutId = setTimeout(syncCatalysts, 2000)
    return () => clearTimeout(timeoutId)
  }, [perfectCatalysts, imperfectCatalysts])

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return;
      
      setUser(user)

      if (user.user_metadata?.desk_perfect_catalysts) {
        setPerfectCatalysts(user.user_metadata.desk_perfect_catalysts);
      } else {
        const savedPerfect = localStorage.getItem('desk_perfect_catalysts');
        if (savedPerfect) setPerfectCatalysts(JSON.parse(savedPerfect));
      }
      
      if (user.user_metadata?.desk_imperfect_catalysts) {
        setImperfectCatalysts(user.user_metadata.desk_imperfect_catalysts);
      } else {
        const savedImperfect = localStorage.getItem('desk_imperfect_catalysts');
        if (savedImperfect) setImperfectCatalysts(JSON.parse(savedImperfect));
      }

      const { data: logsData } = await supabase.from('user_desk_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      
      if (logsData) {
        setPendingReconciliation(logsData.filter(d => !d.is_reconciled || d.outcome === 'HOLD').map(d => ({ 
          id: d.id, 
          day: new Date(d.created_at).toLocaleDateString('en-US', { weekday: 'short' }), 
          symbol: d.symbol, 
          direction: d.direction, 
          reason: d.reason,
          execution: d.execution_type, 
          rr: d.rr, 
          outcome: d.outcome, 
          created_at: d.created_at 
        })))
        
        const todayStr = getSecureTime().toDateString()
        setTradesTakenToday(logsData.filter(d => new Date(d.created_at).toDateString() === todayStr).length)

        // Safe time math again
        const initNow = getSecureTime();
        const initDayOfWeek = initNow.getDay();
        const initDiffToMon = initNow.getDate() - initDayOfWeek + (initDayOfWeek === 0 ? -6 : 1);
        const initStartOfWeek = new Date(initNow.getTime());
        initStartOfWeek.setDate(initDiffToMon);
        initStartOfWeek.setHours(0, 0, 0, 0);
        
        const executedThisWeek = logsData
          .filter(l => new Date(l.created_at).getTime() >= initStartOfWeek.getTime())
          .map(l => l.symbol)
        
        setExecutedSymbols(executedThisWeek)
      }

      const { data: setupsData } = await supabase.from('user_desk_setups').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      
      if (setupsData) {
        const todayStr = getSecureTime().toDateString();
        const expiredSetups = setupsData.filter(s => s.is_today && s.added_to_today_at && new Date(s.added_to_today_at).toDateString() !== todayStr);
        
        if (expiredSetups.length > 0) {
          const expiredIds = expiredSetups.map(s => s.id);
          await supabase.from('user_desk_setups').update({ is_today: false, added_to_today_at: null }).in('id', expiredIds);
          expiredSetups.forEach(s => { s.is_today = false; s.added_to_today_at = null; });
        }

        setSetups(setupsData.map(d => ({ 
          id: d.id, 
          symbol: d.symbol, 
          direction: d.direction, 
          playbook: d.playbook, 
          notes: d.notes, 
          imageUrl: d.image_url, 
          isToday: d.is_today, 
          addedToTodayAt: d.added_to_today_at ? new Date(d.added_to_today_at).getTime() : null 
        })))
      }
    }
    initData()
  }, [getSecureTime])

  useEffect(() => {
    const checkMidnightWipe = setInterval(() => {
      const todayStr = getSecureTime().toDateString();
      const hasStaleSetups = setups.some(s => s.isToday && s.addedToTodayAt && new Date(s.addedToTodayAt).toDateString() !== todayStr);
      
      if (hasStaleSetups) {
        window.location.reload();
      }
    }, 60000); 
    
    return () => clearInterval(checkMidnightWipe);
  }, [setups, getSecureTime]);

  useEffect(() => {
    if (todaySetups.length > 0 && (!activeTodayId || !todaySetups.find(s => s.id === activeTodayId))) {
      setActiveTodayId(todaySetups[0].id)
    } else if (todaySetups.length === 0) { 
      setActiveTodayId(null); 
      if(logPair) setLogPair(''); 
    }
  }, [todaySetups.length, activeTodayId])

  const handleLockEntry = useCallback(async () => {
    if (tradesTakenToday < 2 && logPair && logDirection && logExecution && user) {
      const newLog = { 
        user_id: user.id, 
        symbol: logPair, 
        direction: logDirection, 
        reason: logCatalystText || null, 
        execution_type: logExecution
      }
      const { data } = await supabase.from('user_desk_logs').insert([newLog]).select()
      if (data && data[0]) {
        setTradesTakenToday(prev => prev + 1);
        setPendingReconciliation(prev => [{ 
          id: data[0].id, 
          day: new Date(data[0].created_at).toLocaleDateString('en-US', { weekday: 'short' }), 
          symbol: data[0].symbol, 
          direction: data[0].direction, 
          reason: data[0].reason, 
          execution: data[0].execution_type, 
          rr: '', 
          outcome: '', 
          created_at: data[0].created_at 
        }, ...prev]);
        
        setExecutedSymbols(prev => [...prev, data[0].symbol]);
      }
      setLogPair(''); 
      setLogDirection(null); 
      setLogCatalystText(''); 
      setLogExecution(null); 
      setIsAuditOpen(false); 
    }
  }, [tradesTakenToday, logPair, logDirection, logCatalystText, logExecution, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (e.code === 'Escape') {
        e.preventDefault();
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') {
          target.blur();
        }
        setIsFullScreen(false); 
        setConfirmPushId(null); 
        setIsUploadModalOpen(false); 
        setIsMT5ModalOpen(false); 
        setIsVaultOpen(false); 
        setIsAuditOpen(false);
        setIsCatalystSettingsOpen(false);
        setIsMobileNotesOpen(false);
        setPreviewSetup(null);
        return; 
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT') return;
      if (isCatalystSettingsOpen || isMobileNotesOpen || previewSetup) return;

      if (e.code === 'KeyV' && e.altKey) { 
        e.preventDefault(); 
        if (!isVaultLocked) setIsUploadModalOpen(true); 
        return; 
      }

      if (e.code === 'KeyV' && !e.ctrlKey && !e.metaKey && !e.altKey) { 
        e.preventDefault(); 
        setIsVaultOpen(prev => !prev); 
      }

      if (e.code === 'KeyA' && !e.ctrlKey && !e.metaKey && !e.altKey) { 
        e.preventDefault(); 
        setIsAuditOpen(prev => !prev); 
      }

      if (logPair && !isAlreadyLogged && tradesTakenToday < 2) {
        if (e.code === 'Digit1' || e.code === 'Numpad1') { 
          e.preventDefault(); 
          setLogExecution('Perfect'); 
        }
        if (e.code === 'Digit2' || e.code === 'Numpad2') { 
          e.preventDefault(); 
          setLogExecution('Imperfect'); 
        }
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          if (logDirection && logExecution) { 
            e.preventDefault(); 
            handleLockEntry();
          }
        }
      }

      if (todaySetups.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault(); 
        const currentIndex = todaySetups.findIndex(s => s.id === activeTodayId);
        if (currentIndex === -1) return;
        if (e.shiftKey) {
          const prevIndex = (currentIndex - 1 + todaySetups.length) % todaySetups.length;
          setActiveTodayId(todaySetups[prevIndex].id);
        } else {
          const nextIndex = (currentIndex + 1) % todaySetups.length;
          setActiveTodayId(todaySetups[nextIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todaySetups, activeTodayId, logPair, logDirection, logCatalystText, logExecution, isAlreadyLogged, tradesTakenToday, isCatalystSettingsOpen, isMobileNotesOpen, isVaultLocked, handleLockEntry, previewSetup]);

  useEffect(() => {
    if (activeSetup && user) {
      const timeoutId = setTimeout(() => supabase.from('user_desk_setups').update({ notes: activeSetup.notes }).eq('id', activeSetup.id).then(), 1500)
      return () => clearTimeout(timeoutId)
    }
  }, [setups, activeTodayId, user])


  // 🚨 4. EVENT HANDLERS
  const handleDebriefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWeeklyDebrief(e.target.value);
    localStorage.setItem(debriefKey, e.target.value);
  };

  const handleConfirmPush = async () => {
    if(confirmPushId && user) {
      const nowPush = getSecureTime()
      setSetups(prev => prev.map(s => s.id === confirmPushId ? { ...s, isToday: true, addedToTodayAt: nowPush.getTime() } : s))
      setConfirmPushId(null)
      await supabase.from('user_desk_setups').update({ is_today: true, added_to_today_at: nowPush.toISOString() }).eq('id', confirmPushId)
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
        if (match && match[1]) await supabase.storage.from('user-desk-images').remove([match[1]]);
    }
    setSetups(prev => prev.filter(s => s.id !== id))
    await supabase.from('user_desk_setups').delete().eq('id', id)
  }

  const handleBulkUpload = async (draftsToSave: any[]) => {
    if (!user) return alert("Authentication Error: No active user session found.")
    const newSetups = []
    for (const draft of draftsToSave) {
      let finalImageUrl = draft.imageSource
      if (draft.file) {
        const { data } = await supabase.storage.from('user-desk-images').upload(`${user.id}/${Math.random()}.${draft.file.name.split('.').pop()}`, draft.file)
        if (data) finalImageUrl = supabase.storage.from('user-desk-images').getPublicUrl(data.path).data.publicUrl
      } else if (finalImageUrl && finalImageUrl.startsWith('blob:')) finalImageUrl = null 
      
      newSetups.push({ 
        user_id: user.id, 
        symbol: draft.instrument, 
        direction: draft.direction, 
        playbook: draft.playbook, 
        notes: draft.notes, 
        image_url: finalImageUrl, 
        is_today: false 
      })
    }
    const { data } = await supabase.from('user_desk_setups').insert(newSetups).select()
    if (data) {
      setSetups(prev => [...data.map(d => ({ 
        id: d.id, 
        symbol: d.symbol, 
        direction: d.direction, 
        playbook: d.playbook, 
        notes: d.notes, 
        imageUrl: d.image_url, 
        isToday: false, 
        addedToTodayAt: null 
      })), ...prev])
    }
  }

  // --- FIX: REPLACEMENT START ---
  const handleSaveReconciliation = async (id: string, outcome: string, rr: string, afterUrl: string, afterFile?: File | null) => {
    if (!user) return
    
    let finalUrl = afterUrl;
    if (afterFile) {
      const { data } = await supabase.storage.from('user-desk-images').upload(`${user.id}/after_${Math.random()}.${afterFile.name.split('.').pop()}`, afterFile)
      if (data) {
        finalUrl = supabase.storage.from('user-desk-images').getPublicUrl(data.path).data.publicUrl
      }
    }

    const isReconciled = outcome !== 'HOLD';
    const updateData: any = { is_reconciled: isReconciled, outcome, rr: parseFloat(rr) || null, after_image_url: finalUrl || null }
    
    if (isReconciled) {
      setPendingReconciliation(prev => prev.filter(p => p.id !== id))
    } else {
      setPendingReconciliation(prev => prev.map(p => p.id === id ? { ...p, outcome: 'HOLD' } : p))
    }

    await supabase.from('user_desk_logs').update(updateData).eq('id', id)
  }
  // --- FIX: REPLACEMENT END ---

  const handleMT5Drop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    if (e.dataTransfer.files && e.dataTransfer.files[0]) { 
      setMt5File(e.dataTransfer.files[0]); 
      setIsMT5ModalOpen(true); 
    } 
  }
  
  const handleMT5Select = (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files && e.target.files[0]) { 
      setMt5File(e.target.files[0]); 
      setIsMT5ModalOpen(true); 
    } 
    if (mt5InputRef.current) mt5InputRef.current.value = '' 
  }

  const handleMT5Confirm = (matches: any[]) => {
    setPendingReconciliation(prev => prev.map(log => {
      const matchObj = matches.find(m => m.log.id === log.id)?.match
      if (matchObj) return { ...log, outcome: matchObj.outcome, rr: matchObj.rr }
      return log
    }))
    matches.forEach(async m => {
      if (m.match) {
        await supabase.from('user_desk_logs').update({ 
          mt5_position_id: m.match.ticket, 
          outcome: m.match.outcome, 
          rr: m.match.rr 
        }).eq('id', m.log.id)
      }
    })
  }

  const handlePeekStart = () => {
    if (chartScale !== 1) return; 
    peekTimer.current = setTimeout(() => setIsPeeking(true), 400);
  };

  const handlePeekEnd = () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    setIsPeeking(false);
  };

  return (
    <>
      <div className="relative flex flex-col lg:flex-row h-[100dvh] lg:min-h-[calc(100vh-70px)] lg:h-[calc(100vh-70px)] w-full bg-black text-zinc-300 font-sans p-2 gap-2 overflow-y-auto lg:overflow-hidden">
        
        {isVaultOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" onClick={() => setIsVaultOpen(false)} />
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2 relative">
          
          <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative min-h-0 shrink-0 h-full lg:h-[calc(50%-4px)]">
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
                className="hidden lg:block text-zinc-400 hover:text-white p-1.5 bg-black border border-zinc-800 rounded-md shadow-sm"
              >
                <Menu size={14} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden">
              
              <div className="order-2 lg:order-1 w-full lg:w-56 shrink-0 flex-1 lg:flex-none border-t lg:border-t-0 lg:border-r border-zinc-800 flex flex-col bg-zinc-950/50 overflow-y-auto custom-scrollbar p-3 gap-2 min-h-0 text-white">
                {todaySetups.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-center p-4">
                    <Target size={20} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Pairs Selected</span>
                  </div>
                ) : (
                  todaySetups.map(setup => {
                    const canRemove = setup.addedToTodayAt && (Date.now() - setup.addedToTodayAt < 3600000);
                    const isExecuted = executedSymbols.includes(setup.symbol);
                    return (
                      <div 
                        key={`today-${setup.id}`} 
                        onClick={() => setActiveTodayId(setup.id)} 
                        className={`p-3 rounded-lg border flex flex-col cursor-pointer transition-all group shrink-0 ${activeTodayId === setup.id ? 'bg-zinc-800 border-zinc-600 shadow-md' : 'bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-bold tracking-wider ${activeTodayId === setup.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                            {setup.symbol}
                          </span>
                          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTodayId === setup.id && (
                              <button onClick={(e) => { e.stopPropagation(); setIsMobileNotesOpen(true); }} className="lg:hidden p-1 rounded hover:bg-blue-500/20 text-zinc-400 hover:text-blue-400" title="View Notes">
                                <Info size={14} />
                              </button>
                            )}
                            {!isExecuted && (
                              <button onClick={(e) => { e.stopPropagation(); setLogPair(setup.symbol); setLogDirection(setup.direction); setIsAuditOpen(true); }} className="hidden lg:block p-1 rounded hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400" title="Stage Execution">
                                <Target size={12} />
                              </button>
                            )}
                            {canRemove && (
                              <button onClick={(e) => { e.stopPropagation(); toggleTodayStatus(setup.id); }} className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400" title="Remove (1hr limit)">
                                <ArrowLeft size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${setup.direction === 'LONG' ? 'bg-emerald-500/30 text-emerald-400 bg-emerald-500/10' : setup.direction === 'SHORT' ? 'bg-red-500/30 text-red-400 bg-red-500/10' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}>
                            {setup.direction || 'N/A'}
                          </span>
                          {isExecuted && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase truncate">Executed</span>}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div 
                className="order-1 lg:order-2 w-full flex-[1.5] lg:h-auto lg:flex-1 flex flex-col min-w-0 min-h-0 bg-black relative shadow-inner overflow-hidden group"
                onMouseDown={handlePeekStart} onMouseUp={handlePeekEnd} onMouseLeave={handlePeekEnd} onTouchStart={handlePeekStart} onTouchEnd={handlePeekEnd}
              >
                {activeSetup?.imageUrl ? (
                  <>
                    <TransformWrapper
                      key={activeSetup.id}
                      initialScale={1}
                      minScale={0.5}
                      maxScale={10}
                      centerOnInit={true}
                      wheel={{ step: 0.1 }}
                      doubleClick={{ mode: 'reset' }}
                      panning={{ disabled: false }}
                      pinch={{ step: 5 }}
                      onTransformed={(ref) => setChartScale(ref.state.scale)}
                      ref={transformRef}
                    >
                      <TransformComponent wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={activeSetup.imageUrl} 
                          alt={activeSetup.symbol} 
                          loading="eager" 
                          decoding="async" 
                          className="max-w-full max-h-full object-contain rounded-xl border border-zinc-800/60 shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto" 
                          draggable={false} 
                        />
                      </TransformComponent>
                    </TransformWrapper>
                    {chartScale !== 1 && (
                      <button onClick={(e) => { e.stopPropagation(); setIsFullScreen(true); }} className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-lg transition-all backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100" title="View Full Screen"><Maximize size={16} /></button>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-700 min-h-0"><span className="text-[10px] font-bold uppercase tracking-widest">Select a pair</span></div>
                )}
              </div>

              <div className="hidden lg:flex order-3 w-full lg:w-80 shrink-0 flex-col min-h-[250px] lg:min-h-0 p-4 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950/50">
                <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-4 shadow-inner flex flex-col min-h-0">
                  <RichNotesEditor activeSetup={activeSetup} onUpdate={(id, n) => setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: n } : s))} />
                </div>
              </div>
            </div>
          </div>
          
          <div className={`hidden lg:flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative transition-all duration-300 shrink-0 ${isAuditOpen ? 'h-auto lg:h-[calc(50%-4px)]' : 'h-12'}`}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-600/50 to-transparent"></div>
            <div onClick={() => setIsAuditOpen(!isAuditOpen)} className="h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0 cursor-pointer hover:bg-zinc-800/40">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Action Logs <span className="text-[10px] text-zinc-600 font-mono ml-1 opacity-70">[A]</span>
              </h2>
              <button className="text-zinc-500 hover:text-white flex items-center gap-2">
                {pendingReconciliation.length > 0 && !isAuditOpen && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-black border border-zinc-800 px-2 py-0.5 rounded">{pendingReconciliation.length} Pending</span>
                )}
                {isAuditOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            <div className={`flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden transition-opacity duration-200 ${isAuditOpen ? 'opacity-100 delay-100' : 'opacity-0 hidden lg:flex'}`}>
              
              <div className="w-full lg:flex-[1.2] border-b lg:border-b-0 lg:border-r border-zinc-800 p-4 lg:p-6 flex flex-col items-center justify-center relative bg-zinc-950/50">
                <div className="w-full max-w-sm flex flex-col gap-3 m-auto shrink-0 text-white">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold text-zinc-200">Log Execution Reality</h3>
                      <button onClick={() => setIsCatalystSettingsOpen(true)} className="text-zinc-500 hover:text-white transition-colors" title="Edit Custom Catalysts"><Settings size={12} /></button>
                    </div>
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
                        <button onClick={() => { setLogPair(''); setLogDirection(null); setLogCatalystText(''); setLogExecution(null); }} className="text-zinc-500 hover:text-red-400 transition-colors"><X size={14}/></button>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-[1.5] flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button onClick={() => setLogDirection('LONG')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${logDirection === 'LONG' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Long</button>
                            <button onClick={() => setLogDirection('SHORT')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all border ${logDirection === 'SHORT' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Short</button>
                          </div>
                          <div className="flex flex-col gap-2 mt-1">
                            <button onClick={() => setLogExecution('Perfect')} className={`py-2 px-3 border rounded-lg flex items-center justify-between transition-all ${logExecution === 'Perfect' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}><span className="font-mono text-[10px] opacity-60">[1]</span><span className="text-[9px] font-bold uppercase tracking-widest">Perfect</span><CheckCircle size={13} /></button>
                            <button onClick={() => setLogExecution('Imperfect')} className={`py-2 px-3 border rounded-lg flex items-center justify-between transition-all ${logExecution === 'Imperfect' ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-400'}`}><span className="font-mono text-[10px] opacity-60">[2]</span><span className="text-[9px] font-bold uppercase tracking-widest">Imperfect</span><AlertTriangle size={13} /></button>
                          </div>
                        </div>
                        <div className="flex-[2] flex flex-col gap-2">
                          <select value="" onChange={(e) => { if (e.target.value) setLogCatalystText(prev => prev ? `${prev}\n[${e.target.value}]` : `[${e.target.value}]`); }} disabled={!logExecution} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-bold text-zinc-300 outline-none uppercase focus:border-blue-500 transition-colors">
                            <option value="" disabled>{logExecution ? "Add Tag..." : "Select Execution..."}</option>
                            {activeCatalystList.map((c: string) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <textarea value={logCatalystText} onChange={(e) => setLogCatalystText(e.target.value)} placeholder="Select tags above or type manually..." className="w-full flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-bold text-zinc-300 outline-none resize-none custom-scrollbar focus:border-blue-500 transition-colors" />
                        </div>
                      </div>

                      <button disabled={!logDirection || !logExecution || tradesTakenToday >= 2 || isAlreadyLogged} onClick={handleLockEntry} className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors mt-2 flex items-center justify-center gap-2 ${isAlreadyLogged ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border disabled:border-zinc-800 disabled:shadow-none'}`}>
                        {isAlreadyLogged ? 'Already Logged Today' : <>Lock Entry <span className="font-mono text-[9px] opacity-70">[ENTER]</span></>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:flex-[1.5] p-4 lg:p-6 h-[300px] lg:h-auto overflow-y-auto custom-scrollbar bg-black shadow-inner min-h-0 min-w-0 text-white relative">
                
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Post-Trade Settlement Queue</span>
                      {currentWeekPending.length > 0 && (
                        <div onDragOver={e => e.preventDefault()} onDrop={handleMT5Drop} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 border-dashed rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer" onClick={() => mt5InputRef.current?.click()}><DownloadCloud size={14} className="text-blue-500" /><span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Sync MT5 Report</span><input type="file" ref={mt5InputRef} accept=".csv, .htm, .html" className="hidden" onChange={handleMT5Select} /></div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {currentWeekPending.length === 0 && isWeekendNow ? (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                           <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Week Cleared</h3>
                           <textarea value={weeklyDebrief} onChange={handleDebriefChange} placeholder="Log your main behavioral takeaways for the week..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none resize-none min-h-[80px] custom-scrollbar focus:border-emerald-500 transition-colors" />
                           <p className="text-[9px] text-zinc-500 font-bold uppercase">Vault is unlocked for next week's prep.</p>
                        </div>
                      ) : currentWeekPending.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl mx-2"><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">No pending setups this week</span></div>
                      ) : (
                        currentWeekPending.map((trade) => <ReconciliationItem key={trade.id} trade={trade} user={user} onSave={handleSaveReconciliation} />)
                      )}
                    </div>
                  </div>

                  {heldOverPending.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800/50 mt-2">
                      <div className="flex items-center gap-2 mb-4 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Legacy / Carried Over</span>
                      </div>
                      <div className="flex flex-col gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
                        {heldOverPending.map((trade) => <ReconciliationItem key={trade.id} trade={trade} user={user} onSave={handleSaveReconciliation} />)}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <div className={`hidden lg:flex fixed lg:static top-0 right-0 bottom-0 z-[50] lg:z-auto h-[100dvh] lg:h-full bg-zinc-950 border-l border-zinc-800 lg:rounded-xl shadow-2xl transition-transform lg:transition-all duration-300 flex-col overflow-hidden shrink-0 ${isVaultOpen ? 'translate-x-0 w-[85%] sm:w-[320px] lg:w-[340px] lg:opacity-100' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:border-none'}`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/50 to-transparent"></div>
          <div className="h-14 lg:h-12 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between px-5 shrink-0 text-white">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><UploadCloud size={14} className="text-purple-400" /> Weekly Vault <span className="text-[10px] text-zinc-600 font-mono ml-1 opacity-70">[V]</span></h2>
            <button onClick={() => setIsVaultOpen(false)} className="lg:hidden text-zinc-500 hover:text-white p-1"><X size={18} /></button>
          </div>
          
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar p-3 text-white">
            {weeklySetups.length === 0 ? (
              <div className="text-center p-6 text-zinc-600"><span className="text-[10px] font-bold uppercase tracking-widest">Vault is empty</span></div>
            ) : (
              weeklySetups.map((setup) => {
                const isExecuted = executedSymbols.includes(setup.symbol);
                const isPushedToToday = setup.isToday;

                return (
                  <div key={`weekly-${setup.id}`} className="w-full p-3 border border-zinc-800/80 bg-black rounded-lg flex flex-col justify-between group hover:border-zinc-600 transition-colors shrink-0 shadow-sm gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[13px] font-bold tracking-wide text-zinc-300 group-hover:text-white transition-colors truncate">{setup.symbol}</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest truncate">{setup.notes ? 'Notes Logged' : 'No Notes'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewSetup(setup)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white" title="View Details"><Eye size={14} /></button>
                        
                        {/* 🚨 Deletion Bug Fix: Hide trash can if executed */}
                        {!isExecuted && (
                           <button onClick={() => deleteSetup(setup.id)} className="p-1.5 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400"><Trash2 size={14} /></button>
                        )}
                        
                        {!isPushedToToday && !isExecuted && (
                          <button 
                            onClick={() => {
                              if (!canPushMore) alert("Daily Sniper Limit Reached: You have already pushed 5 pairs today.");
                              else setConfirmPushId(setup.id);
                            }} 
                            className="text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest bg-zinc-900 border border-zinc-700 hover:bg-blue-600 px-2.5 py-1.5 rounded flex items-center gap-1 shadow-sm"
                          >
                            Push <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      {isExecuted && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 tracking-widest w-fit">Executed</span>}
                      {isPushedToToday && !isExecuted && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 tracking-widest w-fit">Active Today</span>}
                    </div>

                  </div>
                )
              })
            )}
          </div>
          
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 shrink-0 pb-8 lg:pb-4">
            <button 
              onClick={() => {
                if (isVaultLocked) {
                  alert(!isPrepWindow ? "Vault is locked. Weekly prep is only allowed from Saturday to Monday 5:30 AM." : "You must settle all trades in the Post-Trade Settlement Queue before prepping for the new week.");
                  return;
                }
                setIsUploadModalOpen(true);
              }} 
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 border border-dashed rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner hover:shadow-none ${
                isVaultLocked 
                  ? 'bg-zinc-900 border-red-500/30 text-red-500/50 cursor-not-allowed' 
                  : 'bg-black border-zinc-700 text-zinc-400 hover:text-white hover:border-blue-500/50'
              }`}
            >
              {isVaultLocked ? (
                <><Lock size={14} /> {!isPrepWindow ? 'Locked Until Weekend' : 'Settle Trades to Unlock'}</>
              ) : (
                <><Plus size={14} /> Add Weekly Setups <span className="font-mono opacity-70 ml-1">[ALT+V]</span></>
              )}
            </button>
          </div>
        </div>

        <MT5SyncModal isOpen={isMT5ModalOpen} onClose={() => { setIsMT5ModalOpen(false); setMt5File(null); }} file={mt5File} pendingLogs={pendingReconciliation} onConfirm={handleMT5Confirm} />
        <SetupUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSave={handleBulkUpload} />
        
        {confirmPushId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Confirm Push</h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Lock this setup into Today's Focus? Removal is only allowed for the first 60 minutes.</p>
              <div className="flex gap-3"><button onClick={() => setConfirmPushId(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase hover:bg-zinc-800">Cancel</button><button onClick={handleConfirmPush} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase shadow-md hover:bg-blue-500">Push to Today</button></div>
            </div>
          </div>
        )}

        <CatalystSettingsModal isOpen={isCatalystSettingsOpen} onClose={() => setIsCatalystSettingsOpen(false)} perfect={perfectCatalysts} setPerfect={setPerfectCatalysts} imperfect={imperfectCatalysts} setImperfect={setImperfectCatalysts} />

        {isMobileNotesOpen && activeSetup && (
          <div className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200" onClick={() => setIsMobileNotesOpen(false)}>
            <div className="w-full h-[50vh] bg-zinc-950 border-t border-zinc-800 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-900/40 rounded-t-2xl">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-blue-500" />{activeSetup.symbol} Thesis</h3>
                <button onClick={() => setIsMobileNotesOpen(false)} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 text-sm text-zinc-300 leading-relaxed font-medium">
                 <div dangerouslySetInnerHTML={{ __html: activeSetup.notes || '<p class="text-zinc-600 italic">No notes logged.</p>' }} />
              </div>
            </div>
          </div>
        )}

        {/* 🚨 PREVIEW MODAL (Fully wired up with eager loading) */}
        {previewSetup && (
          <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150" onClick={() => setPreviewSetup(null)}>
            <div className="absolute top-4 right-4 z-10"><button onClick={() => setPreviewSetup(null)} className="p-2 bg-black/50 text-white rounded-full hover:bg-zinc-800 transition-colors"><X size={20}/></button></div>
            <img src={previewSetup.imageUrl} alt="Preview" loading="eager" decoding="async" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {(isPeeking || isFullScreen) && activeSetup?.imageUrl && (
          <div className={`fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150 ${isFullScreen ? 'cursor-pointer' : 'pointer-events-none'}`} onClick={() => { if (isFullScreen) setIsFullScreen(false); }}>
            <img src={activeSetup.imageUrl} alt="Peek" loading="eager" decoding="async" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
          </div>
        )}
      </div>
    </>
  )
}
