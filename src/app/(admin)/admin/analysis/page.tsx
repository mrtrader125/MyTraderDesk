'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Trash2, Edit2, Activity, TrendingUp, TrendingDown, 
  Clock, Search, ExternalLink, Image as ImageIcon, Minus, 
  Target, CheckCircle2, XCircle, LayoutList, Star, 
  UploadCloud, Loader2, Ban, Shield, SplitSquareHorizontal
} from 'lucide-react'

export default function AdminAnalysisPage() {
  const router = useRouter()
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null)
  
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('before')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; actionText: string;
    actionType: 'danger' | 'prime' | 'featured'; showFileUpload?: boolean;
    onConfirm: (file: File | null) => Promise<void>;
  }>({
    isOpen: false, title: '', message: '', actionText: '', actionType: 'prime', onConfirm: async () => {}
  })

  // ==========================================
  // DATA FETCHING & LOGIC
  // ==========================================
  
  useEffect(() => {
    fetchSetups()
  }, [])

  async function fetchSetups() {
    const { data, error } = await supabase
      .from('analyses') 
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setSetups(data)
      if (data.length > 0) setSelectedSetupId(data[0].id)
    }
    setLoading(false)
  }

  const handleDelete = (id: string, symbol: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Setup',
      message: `Permanently delete the setup for ${symbol}?`,
      actionText: 'Delete',
      actionType: 'danger',
      onConfirm: async () => {
        setSetups(prev => prev.filter(s => s.id !== id)) 
        if (selectedSetupId === id) setSelectedSetupId(null)
        await supabase.from('analyses').delete().eq('id', id)
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const toggleFeaturedStatus = (id: string, symbol: string, currentStatus: boolean) => {
    if (currentStatus) {
      setConfirmModal({
        isOpen: true,
        title: 'Remove Feature',
        message: `Remove ${symbol} from the public landing page?`,
        actionText: 'Remove',
        actionType: 'danger',
        onConfirm: async () => {
          setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: false } : s));
          await supabase.from('analyses').update({ is_featured: false }).eq('id', id);
          setConfirmModal(prev => ({ ...prev, isOpen: false }))
        }
      })
    } else {
      setSelectedFile(null)
      setConfirmModal({
        isOpen: true,
        title: 'Feature Setup',
        message: `Show ${symbol} on the public homepage. To enable the Before/After slider, upload the Result image below.`,
        actionText: 'Confirm',
        actionType: 'featured',
        showFileUpload: true,
        onConfirm: async (file: File | null) => {
          setIsUploading(true)
          let afterUrl: string | null = null

          try {
            if (file) {
              const fileExt = file.name.split('.').pop()
              const fileName = `after_${id}_${Date.now()}.${fileExt}`
              
              const { error: uploadError } = await supabase.storage.from('analyses').upload(fileName, file, { cacheControl: '3600', upsert: false })
              if (uploadError) throw uploadError

              const { data: publicUrlData } = supabase.storage.from('analyses').getPublicUrl(fileName)
              afterUrl = publicUrlData.publicUrl
            }

            const { error: dbError } = await supabase.from('analyses').update({ is_featured: true, after_image_url: afterUrl }).eq('id', id)
            if (dbError) throw dbError

            setSetups(prev => prev.map(s => s.id === id ? { ...s, is_featured: true, after_image_url: afterUrl } : s))
            setPreviewMode(afterUrl ? 'after' : 'before')
            
          } catch (err) {
            console.error("Upload failed:", err)
            alert("Failed to upload image or update database.")
          } finally {
            setIsUploading(false)
            setConfirmModal(prev => ({ ...prev, isOpen: false }))
          }
        }
      })
    }
  }

  const togglePrimeStatus = (id: string, symbol: string, currentStatus: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Remove Prime' : 'Mark as Prime',
      message: currentStatus 
        ? `Remove the Prime badge from ${symbol}?` 
        : `Mark ${symbol} as a Prime setup?`,
      actionText: currentStatus ? 'Remove' : 'Confirm',
      actionType: currentStatus ? 'danger' : 'prime',
      showFileUpload: false,
      onConfirm: async () => {
        setSetups(prev => prev.map(s => s.id === id ? { ...s, is_prime: !currentStatus } : s));
        await supabase.from('analyses').update({ is_prime: !currentStatus }).eq('id', id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const updateSetupStatus = async (id: string, newStatus: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    const { error } = await supabase.from('analyses').update({ status: newStatus }).eq('id', id)
    if (error) {
      alert("Failed to update status.");
      fetchSetups()
    }
  }

  const updateTierAccess = async (id: string, newTier: string) => {
    setSetups(prev => prev.map(s => s.id === id ? { ...s, tier_access: newTier } : s))
    const { error } = await supabase.from('analyses').update({ tier_access: newTier }).eq('id', id)
    if (error) {
      alert("Failed to update tier.");
      fetchSetups()
    }
  }

  const filteredSetups = setups.filter(s => 
    (s.asset_symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSetup = setups.find(s => s.id === selectedSetupId)

  useEffect(() => { setPreviewMode('before') }, [selectedSetupId])


  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-zinc-950">
        <Activity className="animate-pulse text-zinc-500" size={28} />
        <span className="text-sm font-medium text-zinc-500">Loading Environment...</span>
      </div>
    )
  }

  // ==========================================
  // RENDER: MAIN LAYOUT
  // ==========================================

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] max-w-[1600px] mx-auto p-4 md:p-6 bg-zinc-950 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col justify-between gap-4 mb-6 shrink-0 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            Market Setups
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Manage and review your active analyses.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => router.push('/admin/analysis/queue')}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 rounded-lg"
          >
            <Clock size={16} className="mr-2" /> Staging Queue
          </button>
          <button 
            onClick={() => router.push('/admin/analysis/new')}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-white transition-all bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Draft Setup
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-6 min-h-0 overflow-hidden lg:flex-row">
        
        {/* --- LEFT COLUMN: SETUP LIST --- */}
        <div className="flex flex-col shrink-0 w-full lg:w-1/3 xl:w-1/4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-4 border-b border-zinc-800/50 shrink-0">
            <div className="relative">
              <Search className="absolute text-zinc-500 -translate-y-1/2 left-3 top-1/2" size={16} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-9 pr-4 text-sm text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-1">
              {filteredSetups.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-zinc-500">
                  <LayoutList size={24} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">No setups found</span>
                </div>
              ) : (
                filteredSetups.map((setup) => {
                  const isSelected = selectedSetupId === setup.id
                  const status = (setup.status || 'WAITING').toLowerCase()
                  
                  let statusColor = "bg-zinc-800 text-zinc-400"
                  if (status === 'active') statusColor = "bg-blue-500/10 text-blue-400"
                  if (status === 'waiting') statusColor = "bg-amber-500/10 text-amber-400"
                  if (status === 'done') statusColor = "bg-emerald-500/10 text-emerald-400"
                  if (status === 'invalid') statusColor = "bg-red-500/10 text-red-400"

                  return (
                    <div 
                      key={setup.id}
                      onClick={() => setSelectedSetupId(setup.id)}
                      className={`flex flex-col p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-zinc-800/80 shadow-sm' : 'hover:bg-zinc-800/40 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                            {setup.asset_symbol}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-800/50">
                            {setup.timeframe}
                          </span>
                        </div>
                        <div className={`text-xs font-medium px-2 py-0.5 rounded-md capitalize ${statusColor}`}>
                          {status}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 shrink-0">
                          {setup.tier_access === 'free' && <Shield size={14} className="text-emerald-500/80" />}
                          {setup.is_featured && <Star size={14} className="text-amber-500/80 fill-amber-500/20" />}
                          {setup.is_prime && <Target size={14} className="text-blue-500/80" />}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {new Date(setup.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: VIEWPORT & CONTROLS --- */}
        <div className="flex flex-col flex-1 min-w-0 bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden relative">
          {selectedSetup ? (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
              
              {/* TOP SPLIT: IMAGE (Left) & CONTROLS (Right) */}
              <div className="flex flex-col xl:flex-row border-b border-zinc-800/50 min-h-[400px]">
                
                {/* 1. Left Side: Stable Image Viewer */}
                <div className="flex-1 relative bg-zinc-950 min-h-[350px] xl:border-r border-zinc-800/50 group overflow-hidden flex items-center justify-center">
                  
                  {selectedSetup.after_image_url && (
                    <div className="absolute z-20 flex p-1 overflow-hidden border rounded-lg top-4 left-4 bg-zinc-900/90 backdrop-blur border-zinc-700/50">
                      <button 
                        onClick={() => setPreviewMode('before')}
                        className={`px-4 py-1.5 text-xs font-medium transition-colors rounded-md ${previewMode === 'before' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Before
                      </button>
                      <button 
                        onClick={() => setPreviewMode('after')}
                        className={`px-4 py-1.5 text-xs font-medium transition-colors rounded-md ${previewMode === 'after' ? 'bg-zinc-700 text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'}`}
                      >
                        After
                      </button>
                    </div>
                  )}

                  {selectedSetup.image_url ? (
                    <img 
                      src={previewMode === 'before' ? selectedSetup.image_url : selectedSetup.after_image_url} 
                      alt="Chart Setup" 
                      className="object-contain w-full h-full p-6 transition-opacity duration-300" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-sm">No chart uploaded</span>
                    </div>
                  )}
                  
                  <div className="absolute z-20 flex gap-2 top-4 right-4">
                    <button 
                      onClick={() => window.open(previewMode === 'before' ? selectedSetup.image_url : selectedSetup.after_image_url, '_blank')} 
                      className="p-2 transition-colors rounded-lg bg-zinc-900/80 backdrop-blur border border-zinc-700/50 text-zinc-400 hover:text-zinc-100" 
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. Right Side: Control Column */}
                <div className="w-full xl:w-[360px] shrink-0 flex flex-col bg-zinc-900/20">
                  
                  {/* Header & Actions */}
                  <div className="p-6 border-b border-zinc-800/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-100 mb-1">
                          {selectedSetup.asset_symbol}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs font-medium">
                            {selectedSetup.timeframe}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded text-xs font-medium capitalize">
                            {selectedSetup.bias?.toLowerCase() === 'bullish' ? <TrendingUp size={12} className="text-emerald-400"/> : selectedSetup.bias?.toLowerCase() === 'bearish' ? <TrendingDown size={12} className="text-red-400"/> : <Minus size={12} className="text-zinc-500" />}
                            {selectedSetup.bias || 'Neutral'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => router.push(`/admin/analysis/${selectedSetup.id}/edit`)} className="p-2 transition-colors rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => handleDelete(selectedSetup.id, selectedSetup.asset_symbol)} className="p-2 transition-colors rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Toggles Column */}
                  <div className="flex flex-col flex-1 p-6 gap-6">
                    
                    {/* Tier Access */}
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Content Tier</h4>
                      <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800/50">
                        <button onClick={() => updateTierAccess(selectedSetup.id, 'free')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedSetup.tier_access === 'free' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Free</button>
                        <button onClick={() => updateTierAccess(selectedSetup.id, 'pro')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedSetup.tier_access !== 'free' ? 'bg-zinc-800 text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Pro</button>
                      </div>
                    </div>

                    {/* Prime Badge */}
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Priority Alert</h4>
                      <button
                        onClick={() => togglePrimeStatus(selectedSetup.id, selectedSetup.asset_symbol, selectedSetup.is_prime)}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          selectedSetup.is_prime
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                      >
                        <Target size={16} className={selectedSetup.is_prime ? "text-blue-400" : "text-zinc-500"}/>
                        {selectedSetup.is_prime ? 'Prime Active' : 'Set as Prime'}
                      </button>
                    </div>

                    {/* Featured Status */}
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Public Display</h4>
                      <button
                        onClick={() => toggleFeaturedStatus(selectedSetup.id, selectedSetup.asset_symbol, selectedSetup.is_featured)}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          selectedSetup.is_featured
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                      >
                        {selectedSetup.after_image_url ? <SplitSquareHorizontal size={16} className="text-emerald-400"/> : <Star size={16} className={selectedSetup.is_featured ? "text-amber-400" : "text-zinc-500"}/>}
                        {selectedSetup.is_featured ? 'Featured on Home' : 'Push to Homepage'}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* BOTTOM SPLIT: NOTES & STATUS */}
              <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-8">
                
                {/* Notes Section */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Analytical Thesis</h4>
                  <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800/50 min-h-[120px]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                      {selectedSetup.content || (!selectedSetup.title?.includes('[SCHEDULED') && selectedSetup.title) || <span className="italic text-zinc-600">No notes provided for this setup.</span>}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="w-full xl:w-[360px] shrink-0">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Set Live Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['WAITING', 'ACTIVE', 'DONE', 'INVALID', 'CANCELED'].map((statusOption) => {
                      const isActive = (selectedSetup.status || 'WAITING').toUpperCase() === statusOption;
                      
                      let activeClasses = "bg-zinc-700 text-white"; // default fallback
                      if (statusOption === 'WAITING') activeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                      if (statusOption === 'ACTIVE') activeClasses = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                      if (statusOption === 'DONE') activeClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                      if (statusOption === 'INVALID') activeClasses = "bg-red-500/10 text-red-400 border-red-500/30";
                      if (statusOption === 'CANCELED') activeClasses = "bg-zinc-800 text-zinc-300 border-zinc-600";

                      return (
                        <button 
                          key={statusOption}
                          onClick={() => updateSetupStatus(selectedSetup.id, statusOption)} 
                          className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                            isActive 
                              ? activeClasses 
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800/50 hover:bg-zinc-900 hover:text-zinc-300'
                          }`}
                        >
                          {statusOption.toLowerCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-zinc-500">
              <Target size={40} className="mb-3 opacity-20" />
              <p className="text-base font-medium text-zinc-400">No Setup Selected</p>
              <p className="text-sm mt-1">Select an item from the sidebar to review.</p>
            </div>
          )}
        </div>

      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col relative overflow-hidden">
            
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">{confirmModal.title}</h3>
            <p className="text-sm text-zinc-400 mb-6">{confirmModal.message}</p>
            
            {confirmModal.showFileUpload && (
              <div className="mb-6">
                <label className={`flex flex-col items-center justify-center w-full h-28 border border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'}`}>
                  {selectedFile ? (
                     <div className="z-10 px-4 text-center">
                       <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                       <span className="block text-xs font-medium truncate text-emerald-400 max-w-[200px]">{selectedFile.name}</span>
                     </div>
                  ) : (
                     <div className="z-10 px-4 text-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
                       <UploadCloud className="w-6 h-6 mx-auto mb-2" />
                       <span className="block text-sm font-medium">Upload Result Chart</span>
                       <span className="text-xs block mt-1 opacity-70">Optional Slider</span>
                     </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={isUploading} />
                </label>
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => { setConfirmModal(prev => ({ ...prev, isOpen: false })); setSelectedFile(null); }} 
                disabled={isUploading}
                className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => confirmModal.onConfirm(selectedFile)} 
                disabled={isUploading}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center ${
                  confirmModal.actionType === 'danger' 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : confirmModal.actionType === 'prime'
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmModal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
