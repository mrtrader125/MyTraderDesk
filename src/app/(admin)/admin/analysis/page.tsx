'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, Trash2, Edit2, Activity, TrendingUp, TrendingDown, 
  Clock, Search, ExternalLink, Image as ImageIcon, Minus, 
  Target, CheckCircle2, LayoutList, Star, 
  UploadCloud, Loader2, Shield, SplitSquareHorizontal,
  Lock, Unlock, Save, FileText, X, Maximize2
} from 'lucide-react'

export default function AdminAnalysisPage() {
  const router = useRouter()
  const [setups, setSetups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [timeframeFilter, setTimeframeFilter] = useState('ALL')
  
  const [selectedSetupId, setSelectedSetupId] = useState<string | null>(null)
  
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('before')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Modals State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

  const [localNotes, setLocalNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

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

  const toggleLockStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setSetups(prev => prev.map(s => s.id === id ? { ...s, is_locked: newStatus } : s));
    const { error } = await supabase.from('analyses').update({ is_locked: newStatus }).eq('id', id);
    if (error) {
      alert("Failed to update access control.");
      fetchSetups();
    }
  }

  const saveNotes = async (id: string) => {
    setIsSavingNotes(true);
    const { error } = await supabase.from('analyses').update({ notes: localNotes }).eq('id', id);
    if (error) {
      alert("Failed to save notes.");
    } else {
      setSetups(prev => prev.map(s => s.id === id ? { ...s, notes: localNotes } : s));
      setIsNotesModalOpen(false); 
    }
    setIsSavingNotes(false);
  }

  // Filtering Logic
  const filteredSetups = setups.filter(s => {
    const matchesSearch = (s.asset_symbol || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTF = timeframeFilter === 'ALL' || (s.timeframe || '').toLowerCase() === timeframeFilter.toLowerCase();
    return matchesSearch && matchesTF;
  });

  // Date Grouping Logic
  const groupedSetups = (() => {
    const groups: { [key: string]: any[] } = { 'Today': [], 'Yesterday': [], 'This Week': [], 'Older': [] };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - (86400000 * 7);

    filteredSetups.forEach(setup => {
      const d = new Date(setup.created_at).getTime();
      if (d >= today) groups['Today'].push(setup);
      else if (d >= yesterday) groups['Yesterday'].push(setup);
      else if (d >= lastWeek) groups['This Week'].push(setup);
      else groups['Older'].push(setup);
    });
    return groups;
  })();

  const selectedSetup = setups.find(s => s.id === selectedSetupId)

  useEffect(() => { 
    setPreviewMode('before')
    if (selectedSetup) {
      setLocalNotes(selectedSetup.notes || '');
    }
  }, [selectedSetupId, selectedSetup?.notes])


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-zinc-950">
        <Activity className="animate-pulse text-zinc-500" size={28} />
        <span className="text-sm font-medium text-zinc-500">Loading Environment...</span>
      </div>
    )
  }

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
        
        {/* --- LEFT COLUMN: LIST --- */}
        <div className="flex flex-col shrink-0 w-full lg:w-[260px] xl:w-[300px] bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
          
          <div className="flex gap-2 p-4 border-b border-zinc-800/50 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute text-zinc-500 -translate-y-1/2 left-3 top-1/2" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-9 pr-2 text-xs text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-lg outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
              />
            </div>
            <select 
              value={timeframeFilter} 
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="w-[72px] shrink-0 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 outline-none focus:border-zinc-700 cursor-pointer"
            >
              <option value="ALL">All TF</option>
              <option value="M">M</option>
              <option value="W">W</option>
              <option value="D">D</option>
              <option value="4H">4H</option>
              <option value="1H">1H</option>
              <option value="15m">15m</option>
              <option value="5m">5m</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {filteredSetups.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-zinc-500">
                <LayoutList size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">No setups</span>
              </div>
            ) : (
              Object.entries(groupedSetups).map(([groupName, groupSetups]) => {
                if (groupSetups.length === 0) return null;
                return (
                  <div key={groupName} className="mb-5 last:mb-0">
                    <h4 className="px-2 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{groupName}</h4>
                    <div className="space-y-1">
                      {groupSetups.map((setup) => {
                        const isSelected = selectedSetupId === setup.id
                        const status = (setup.status || 'WAITING').toUpperCase()
                        
                        let statusColor = "bg-zinc-800 text-zinc-400"
                        if (status === 'ACTIVE') statusColor = "bg-blue-500/10 text-blue-400"
                        if (status === 'WAITING') statusColor = "bg-amber-500/10 text-amber-400"
                        if (status === 'DONE') statusColor = "bg-emerald-500/10 text-emerald-400"
                        if (status === 'INVALID') statusColor = "bg-red-500/10 text-red-400"
                        if (status === 'ARCHIVED') statusColor = "bg-zinc-800/50 text-zinc-500 border border-zinc-800"

                        const isLockedIcon = setup.is_locked !== false; 

                        return (
                          <div 
                            key={setup.id}
                            onClick={() => setSelectedSetupId(setup.id)}
                            className={`flex flex-col p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'bg-zinc-800/80 shadow-sm border border-zinc-700/50' : 'hover:bg-zinc-800/40 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                                  {setup.asset_symbol}
                                </span>
                                <span className="text-[10px] font-medium text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/50">
                                  {setup.timeframe}
                                </span>
                              </div>
                              <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${statusColor}`}>
                                {status}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 shrink-0">
                                {setup.tier_access === 'free' && <Shield size={12} className="text-emerald-500/80" />}
                                {setup.is_featured && <Star size={12} className="text-amber-500/80 fill-amber-500/20" />}
                                {setup.is_prime && <Target size={12} className="text-blue-500/80" />}
                                {!isLockedIcon && <Unlock size={12} className="text-emerald-400/80" />}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                {new Date(setup.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: FULL WIDTH DETAILS PANE --- */}
        <div className="flex flex-col flex-1 min-w-0 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/50">
          {selectedSetup ? (
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8 h-full">
              
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/50 pb-6 shrink-0">
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">{selectedSetup.asset_symbol}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-widest">
                      {selectedSetup.timeframe}
                    </span>
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                      {selectedSetup.bias?.toLowerCase() === 'bullish' ? <TrendingUp size={14} className="text-emerald-400"/> : selectedSetup.bias?.toLowerCase() === 'bearish' ? <TrendingDown size={14} className="text-red-400"/> : <Minus size={14} className="text-zinc-500" />}
                      {selectedSetup.bias || 'NEUTRAL'}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2 font-medium">
                      {new Date(selectedSetup.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => router.push(`/admin/analysis/${selectedSetup.id}/edit`)} className="p-2 transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white" title="Edit Setup">
                    <Edit2 size={16}/>
                  </button>
                  <button onClick={() => handleDelete(selectedSetup.id, selectedSetup.asset_symbol)} className="p-2 transition-colors rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400" title="Delete Setup">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>

              {/* Media & Notes Row */}
              <div className="flex flex-row items-center gap-4 sm:gap-6 shrink-0">
                
                {/* Fixed Thumbnail (Click to Open Lightbox) */}
                <div 
                  onClick={() => selectedSetup.image_url && setIsImageModalOpen(true)}
                  className="relative w-24 h-16 sm:w-36 sm:h-20 shrink-0 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden cursor-pointer group"
                >
                  {selectedSetup.image_url ? (
                    <>
                      <img 
                        src={previewMode === 'before' ? selectedSetup.image_url : selectedSetup.after_image_url} 
                        alt="Chart Thumbnail" 
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                         <Maximize2 size={20} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>

                {/* Notes Modal Trigger Button */}
                <button 
                  onClick={() => setIsNotesModalOpen(true)}
                  className="flex-1 h-16 sm:h-20 flex items-center justify-between p-3 sm:p-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-xl transition-all group text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform hidden xs:block">
                      <FileText size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5 sm:mb-1">Structural Notes</p>
                      <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1">
                        {selectedSetup.notes ? "Notes saved. Click to view or edit..." : "No notes added yet. Click to write..."}
                      </p>
                    </div>
                  </div>
                  <Edit2 size={16} className="text-zinc-600 group-hover:text-blue-400 hidden sm:block" />
                </button>
              </div>

              {/* Controls Dashboard */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6 mt-auto">
                 
                 {/* Full Text Status Row */}
                 <div className="mb-8">
                   <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Live Status</h4>
                   <div className="flex flex-wrap gap-2">
                     {['WAITING', 'ACTIVE', 'DONE', 'INVALID', 'CANCELED', 'ARCHIVED'].map((statusOption) => {
                       const isActive = (selectedSetup.status || 'WAITING').toUpperCase() === statusOption;
                       
                       let activeClasses = "bg-zinc-700 text-white"; 
                       if (statusOption === 'WAITING') activeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                       if (statusOption === 'ACTIVE') activeClasses = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                       if (statusOption === 'DONE') activeClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                       if (statusOption === 'INVALID') activeClasses = "bg-red-500/10 text-red-400 border-red-500/30";
                       if (statusOption === 'CANCELED') activeClasses = "bg-zinc-800 text-zinc-300 border-zinc-600";
                       if (statusOption === 'ARCHIVED') activeClasses = "bg-zinc-800/80 text-zinc-400 border-zinc-600";

                       return (
                         <button 
                           key={statusOption}
                           onClick={() => updateSetupStatus(selectedSetup.id, statusOption)} 
                           className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${
                             isActive 
                               ? activeClasses 
                               : 'bg-zinc-950 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800 hover:text-zinc-300'
                           }`}
                         >
                           {statusOption}
                         </button>
                       )
                     })}
                   </div>
                 </div>

                 {/* Settings Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   
                   <div>
                     <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Content Tier</h4>
                     <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800/50 h-[42px]">
                       <button onClick={() => updateTierAccess(selectedSetup.id, 'free')} className={`flex-1 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${selectedSetup.tier_access === 'free' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}>Free</button>
                       <button onClick={() => updateTierAccess(selectedSetup.id, 'pro')} className={`flex-1 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${selectedSetup.tier_access !== 'free' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}>Pro</button>
                     </div>
                   </div>

                   <div>
                     <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Public View</h4>
                     <button
                       onClick={() => toggleLockStatus(selectedSetup.id, selectedSetup.is_locked !== false)}
                       className={`w-full h-[42px] rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                         selectedSetup.is_locked !== false
                           ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                           : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                       }`}
                     >
                       {selectedSetup.is_locked !== false ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Public</>}
                     </button>
                   </div>

                   <div>
                     <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Priority Alert</h4>
                     <button
                       onClick={() => togglePrimeStatus(selectedSetup.id, selectedSetup.asset_symbol, selectedSetup.is_prime)}
                       className={`w-full h-[42px] rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                         selectedSetup.is_prime
                           ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                           : 'bg-zinc-950 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800'
                       }`}
                     >
                       <Target size={14} className={selectedSetup.is_prime ? "text-blue-400" : "text-zinc-500"}/>
                       {selectedSetup.is_prime ? 'Prime Active' : 'Set Prime'}
                     </button>
                   </div>

                   <div>
                     <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Featured</h4>
                     <button
                       onClick={() => toggleFeaturedStatus(selectedSetup.id, selectedSetup.asset_symbol, selectedSetup.is_featured)}
                       className={`w-full h-[42px] rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                         selectedSetup.is_featured
                           ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                           : 'bg-zinc-950 text-zinc-500 border-zinc-800/50 hover:bg-zinc-800'
                       }`}
                     >
                       {selectedSetup.after_image_url ? <SplitSquareHorizontal size={14} className="text-emerald-400"/> : <Star size={14} className={selectedSetup.is_featured ? "text-amber-400" : "text-zinc-500"}/>}
                       {selectedSetup.is_featured ? 'Featured' : 'Feature'}
                     </button>
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

      {/* --- IMAGE LIGHTBOX MODAL --- */}
      {isImageModalOpen && selectedSetup && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)} // Clicking background closes it
        >
          <button 
            onClick={() => setIsImageModalOpen(false)} 
            className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors shadow-2xl z-50"
          >
            <X size={24}/>
          </button>
          
          <img 
            src={previewMode === 'before' ? selectedSetup.image_url : selectedSetup.after_image_url} 
            alt="Full Preview" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-zoom-out relative z-40"
            onClick={(e) => {
              e.stopPropagation(); // Prevent background click from firing
              setIsImageModalOpen(false); // Clicking image also closes it
            }}
          />

          <div className="absolute bottom-6 flex gap-4 items-center z-50" onClick={(e) => e.stopPropagation()}>
            {selectedSetup.after_image_url && (
              <div className="flex p-1 border rounded-lg bg-zinc-900/90 backdrop-blur border-zinc-700/50 shadow-2xl">
                <button 
                  onClick={() => setPreviewMode('before')}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-widest transition-colors rounded-md ${previewMode === 'before' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Before
                </button>
                <button 
                  onClick={() => setPreviewMode('after')}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-widest transition-colors rounded-md ${previewMode === 'after' ? 'bg-zinc-700 text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'}`}
                >
                  After
                </button>
              </div>
            )}
            <button 
              onClick={() => window.open(previewMode === 'before' ? selectedSetup.image_url : selectedSetup.after_image_url, '_blank')} 
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white text-sm uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-2xl border border-zinc-800"
            >
              <ExternalLink size={18} /> Open HD
            </button>
          </div>
        </div>
      )}

      {/* --- NOTES EDITOR MODAL --- */}
      {isNotesModalOpen && selectedSetup && (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-500"/> Structural Notes: {selectedSetup.asset_symbol}
              </h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-4">
              <textarea 
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Enter detailed structural breakdown here... (e.g. Identifying liquidity grabs, order blocks, and directional bias.)"
                className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-800 min-h-[300px] text-sm text-zinc-300 resize-none focus:outline-none focus:border-blue-500/50 transition-colors custom-scrollbar leading-relaxed"
              />
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsNotesModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveNotes(selectedSetup.id)}
                disabled={isSavingNotes || localNotes === (selectedSetup.notes || '')}
                className="flex items-center justify-center min-w-[120px] px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
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
