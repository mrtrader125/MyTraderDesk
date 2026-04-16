// src/app/(users)/dashboard/PersonalDashboard.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, UploadCloud, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'

// --- UPLOAD MODAL COMPONENT ---
function SetupUploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file')
  const [instrument, setInstrument] = useState('')
  const [notes, setNotes] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simple regex to find 6 consecutive letters (e.g., GBPJPY, XAUUSD)
  const extractInstrument = (text: string) => {
    const match = text.toUpperCase().match(/[A-Z]{6}/)
    if (match) setInstrument(match[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      extractInstrument(file.name)
    }
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setLinkUrl(url)
    extractInstrument(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#080808] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/50 bg-[#0a0a0a]">
          <h2 className="text-lg font-medium text-neutral-200 tracking-wide">Upload Setup</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-[#050505] rounded-md border border-neutral-900">
            <button 
              onClick={() => setActiveTab('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'file' ? 'bg-[#111] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <ImageIcon className="w-4 h-4" /> Local Image
            </button>
            <button 
              onClick={() => setActiveTab('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded transition-colors ${activeTab === 'link' ? 'bg-[#111] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <LinkIcon className="w-4 h-4" /> TradingView Link
            </button>
          </div>

          {/* Upload Area / Link Input */}
          {activeTab === 'file' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-neutral-800 rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-600 hover:bg-[#0a0a0a] transition-all"
            >
              <UploadCloud className="w-8 h-8 text-neutral-600" />
              <span className="text-sm text-neutral-400 font-medium">
                {fileName ? fileName : 'Click to browse or drag image here'}
              </span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Image URL</label>
              <input 
                type="text" 
                value={linkUrl}
                onChange={handleLinkChange}
                placeholder="Paste TradingView image link..."
                className="w-full bg-[#050505] border border-neutral-800 rounded px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-900/50 transition-colors"
              />
            </div>
          )}

          {/* Extracted Instrument & Notes */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Instrument</label>
              <input 
                type="text" 
                value={instrument}
                onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                placeholder="e.g. GBPUSD"
                className="w-full bg-[#050505] border border-neutral-800 rounded px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-900/50 transition-colors uppercase"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Setup Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add structural bias, liquidity notes, or execution plan..."
                className="w-full h-28 bg-[#050505] border border-neutral-800 rounded px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-900/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-800/50 bg-[#0a0a0a] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              // Handle save logic here
              onClose()
            }}
            className="px-6 py-2 rounded bg-neutral-100 text-black text-sm font-semibold hover:bg-white transition-colors"
          >
            Save Setup
          </button>
        </div>
        
      </div>
    </div>
  )
}

// --- MAIN DASHBOARD COMPONENT ---
export default function PersonalDashboard() {
  const weeklyPrepInstruments = ['GBPJPY', 'GBPCAD', 'CADJPY', 'XAUUSD', 'EURUSD']
  const todayInstruments = ['GBPCAD', 'XAUUSD'] 

  const [time, setTime] = useState(new Date())
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 font-sans flex relative">
      
      {/* MAIN LEFT & CENTER AREA */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        
        {/* TOP HALF: Info Cards & Routine */}
        <div className="flex gap-6 h-64">
          
          <div className="flex flex-col gap-4 w-1/3 min-w-[250px]">
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col items-center justify-center p-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Local Time</span>
              <span className="text-xl font-medium text-neutral-200">
                {time.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col items-center justify-center p-4">
              <span className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Active Session</span>
              <span className="text-lg font-medium text-neutral-200">New York</span>
              <span className="text-sm text-neutral-400 mt-1">08:30:00</span>
            </div>
          </div>

          <div className="flex-[2] bg-[#0a0a0a] border border-neutral-800 rounded-lg p-6 flex flex-col">
            <h3 className="text-sm text-neutral-500 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
              Operator Routine
            </h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-400" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Sunday Prep</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-400" defaultChecked />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Daily Prep</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-400" />
                <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">Weekend Wind-up</span>
              </label>
            </div>
          </div>
          
        </div>

        {/* BOTTOM HALF: Today's Selected Instruments */}
        <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg p-6 flex flex-col min-h-[300px]">
          <h2 className="text-sm text-neutral-500 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
            Today
          </h2>
          <div className="flex flex-col gap-3">
            {todayInstruments.map((instrument) => (
              <div 
                key={`today-${instrument}`}
                className="p-4 border border-neutral-800 rounded bg-[#0d0d0d] flex items-center justify-between"
              >
                <span className="font-semibold text-neutral-200 tracking-wide">{instrument}</span>
                <span className="text-xs text-neutral-500">Active Setup</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Weekly Prep */}
      <div className="w-72 border-l border-neutral-800 bg-[#080808] p-6 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-6">
          <h2 className="text-sm text-neutral-500 uppercase tracking-wider text-center w-full relative">
            Weekly Prep
            {/* ADD SETUP BUTTON */}
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 rounded transition-all"
              title="Add Setup"
            >
              <Plus className="w-4 h-4" />
            </button>
          </h2>
        </div>
        
        <div className="flex flex-col gap-3">
          {weeklyPrepInstruments.map((instrument) => (
            <button 
              key={`weekly-${instrument}`}
              className="w-full py-3 px-4 border border-neutral-800 bg-[#0a0a0a] rounded text-sm font-medium text-neutral-300 hover:bg-[#111] hover:border-neutral-600 hover:text-white transition-all text-left flex justify-between items-center"
            >
              <span className="tracking-wide">{instrument}</span>
              <span className="text-xs text-neutral-600">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* RENDER MODAL */}
      <SetupUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
    </div>
  )
}
