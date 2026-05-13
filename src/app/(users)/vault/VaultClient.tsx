'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { Bookmark, Lock, Clock, TrendingUp, TrendingDown, Minus, Trash2, FolderOpen, Edit3, X, FileText } from 'lucide-react'
import { getSetupAccess } from '@/lib/access'
import { ASSET_CATEGORIES, PLAN_CONFIG } from '@/lib/platformConfig'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'ALL', label: 'All', req: 'free' },
  ...Object.keys(ASSET_CATEGORIES).map(category => {
    let requiredTier = 'pro';
    if (PLAN_CONFIG.free?.allowedCategories?.includes(category)) requiredTier = 'free';
    return { id: category, label: category.charAt(0) + category.slice(1).toLowerCase(), req: requiredTier }
  })
]

// 🚨 SWR FETCHER: Grabs the Vault data securely on the client
export const fetchVaultData = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const userId = session.user.id
  const [
    { data: profile },
    { data: vaultData }
  ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', userId).single(),
    supabase.from('user_vault')
      .select(`id, note, created_at, analysis_id, analyses (*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  ])

  let formattedItems: any[] = []
  if (vaultData) {
    formattedItems = vaultData.map((item: any) => ({
      ...item.analyses, 
      vault_id: item.id, 
      saved_note: item.note, 
      saved_at: item.created_at
    }))
  }

  return {
    userId,
    profile,
    vaultItems: formattedItems
  }
}

export default function VaultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [isProUser, setIsProUser] = useState<boolean>(true)
  const [vaultItems, setVaultItems] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<string>('free')
  
  const [activeTab, setActiveTab] = useState('ALL')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  // 🚀 SWR MAGIC: Fetches data instantly.
  // dedupingInterval: 500 means it always fetches fresh data when you navigate from the dashboard.
  const { data, mutate, isLoading } = useSWR('vault_data', fetchVaultData, {
    revalidateOnFocus: true,
    dedupingInterval: 500 
  })

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  // 🚨 SYNC SWR DATA TO LOCAL STATE FOR OPTIMISTIC UI
  useEffect(() => {
    if (data) {
      const isPro = data.profile?.plan === 'pro' || data.profile?.plan === 'premium';
      setIsProUser(isPro);
      setUserPlan(data.profile?.plan?.toLowerCase() || 'free');
      
      if (isPro) {
        setVaultItems(data.vaultItems || []);
      } else {
        setVaultItems([]);
      }
    }
  }, [data])

  // 🚨 NEUTRAL SKELETON: Renders instantly to prevent lag/flashing
  if (isLoading || !data) {
    return (
      <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden relative">
        <div className="flex flex-col items-center mb-10 mt-1">
          <div className="h-[38px] w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="max-w-[100rem] mx-auto space-y-10">
          <section>
            <div className="flex items-center mb-4">
               <div className="h-2 w-16 bg-neutral-800 rounded animate-pulse"></div>
               <div className="ml-4 h-px flex-1 bg-neutral-800"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col min-h-[180px] animate-pulse">
                  <div className="h-28 w-full bg-neutral-900 border-b border-neutral-800/50 shrink-0"></div>
                  <div className="p-4 pr-5 flex flex-col flex-1 justify-between relative">
                    <div className="absolute top-0 right-0 inset-y-0 w-1 bg-neutral-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-1/2 bg-neutral-800 rounded"></div>
                      <div className="h-2 w-3/4 bg-neutral-900 rounded mt-2"></div>
                      <div className="h-2 w-1/2 bg-neutral-900 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-neutral-800/80 mt-3">
                      <div className="h-2 w-16 bg-neutral-900 rounded"></div>
                      <div className="h-2 w-10 bg-neutral-900 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  // 🚨 OPTIMISTIC UI DELETION
  const removeFromVault = async (e: React.MouseEvent, vaultIdToRemove: string) => {
    e.preventDefault() 
    e.stopPropagation()
    
    // 1. Instantly remove from screen
    setVaultItems(prev => prev.filter(item => item.vault_id !== vaultIdToRemove))
    
    // 2. Sync to DB & update SWR cache in background
    if (data.userId && isProUser) {
      await supabase.from('user_vault').delete().eq('id', vaultIdToRemove)
      mutate() 
    }
  }

  const handleOpenNote = (e: React.MouseEvent, vaultId: string, currentNote: string) => {
    if (!isProUser) return;
    e.preventDefault()
    e.stopPropagation()
    setTempNote(currentNote || '')
    setEditingNoteId(vaultId)
  }

  // 🚨 OPTIMISTIC UI NOTES SAVE
  const handleSaveNote = async () => {
    if (!editingNoteId || !data.userId || !isProUser) return
    
    // 1. Instantly update UI
    setVaultItems(prev => prev.map(item => item.vault_id === editingNoteId ? { ...item, saved_note: tempNote } : item))
    setEditingNoteId(null)

    // 2. Sync to DB
    await supabase.from('user_vault').update({ note: tempNote }).eq('id', editingNoteId)
    mutate()
  }

  const filteredItems = vaultItems.filter(item => {
    const matchesTab = activeTab === 'ALL' ? true : (item.category || 'FOREX').toUpperCase() === activeTab
    const matchesSearch = (item.asset_symbol || '').toLowerCase().includes(searchQuery)
    return matchesTab && matchesSearch
  })

  const grouped = { today: [] as any[], yesterday: [] as any[], thisWeek: [] as any[], older: [] as any[] }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const thisWeek = new Date(today); thisWeek.setDate(thisWeek.getDate() - 7)

  filteredItems.forEach(setup => {
    const d = new Date(setup.saved_at).getTime()
    if (d >= today.getTime()) grouped.today.push(setup)
    else if (d >= yesterday.getTime()) grouped.yesterday.push(setup)
    else if (d >= thisWeek.getTime()) grouped.thisWeek.push(setup)
    else grouped.older.push(setup)
  })

  const VaultCard = ({ setup }: { setup: any }) => {
    const { hasAccess, requiredTier } = isProUser ? getSetupAccess(setup, userPlan) : { hasAccess: false, requiredTier: 'pro' };
    const isBull = setup.bias?.toUpperCase() === 'BULLISH'
    const isBear = setup.bias?.toUpperCase() === 'BEARISH'
    const hasNote = setup.saved_note && setup.saved_note.trim() !== ''

    const status = (setup.status || 'WAITING').toUpperCase()
    let statusLine = "bg-neutral-800 group-hover:bg-neutral-600"
    if (status === 'ACTIVE') statusLine = "bg-emerald-500/40 group-hover:bg-emerald-400 group-hover:shadow-[-4px_0_12px_rgba(16,185,129,0.5)]"
    else if (status === 'WAITING') statusLine = "bg-amber-500/40 group-hover:bg-amber-400 group-hover:shadow-[-4px_0_12px_rgba(245,158,11,0.5)]"
    else if (status === 'INVALID') statusLine = "bg-red-600/70 group-hover:bg-red-500 group-hover:shadow-[-4px_0_15px_rgba(239,68,68,0.8)]"

    return (
      <Link 
        href={isProUser ? `/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}&from=vault` : '#'}
        className={`bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 min-h-[180px] shadow-sm relative block ${!isProUser ? 'opacity-80 cursor-default' : 'hover:border-neutral-600 hover:bg-white/[0.02]'}`}
        onClick={(e) => {
           if (!isProUser) e.preventDefault();
        }}
      >
        <div className="h-28 w-full bg-black relative overflow-hidden border-b border-neutral-800/50 shrink-0">
          <img 
            src={setup.image_url} 
            alt="Setup" 
            draggable={false}
            className={`w-full h-full object-cover transition-all duration-500 ${hasAccess ? 'opacity-50 group-hover:opacity-100 group-hover:scale-105' : 'opacity-10 blur-md grayscale'}`} 
          />
          
          {!hasAccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
              <Lock size={16} className="text-blue-500 mb-1.5" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/30 shadow-lg">{requiredTier}</span>
            </div>
          )}

          {hasAccess && (
            <div className="absolute top-2 left-2 bg-[#0a0a0a]/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10">{setup.timeframe || '-'}</div>
          )}

          {isProUser && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-20">
              <button onClick={(e) => handleOpenNote(e, setup.vault_id, setup.saved_note)} className="p-1.5 bg-amber-500/80 backdrop-blur-md text-white rounded-md hover:bg-amber-500 transition-colors shadow-lg"><Edit3 size={12} /></button>
              <button onClick={(e) => removeFromVault(e, setup.vault_id)} className="p-1.5 bg-red-500/80 backdrop-blur-md text-white rounded-md hover:bg-red-500 transition-colors shadow-lg"><Trash2 size={12} /></button>
            </div>
          )}
        </div>

        <div className="relative p-4 pr-5 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
          <div className={`absolute top-0 right-0 inset-y-0 w-1 md:w-1.5 transition-all duration-500 z-30 ${statusLine}`} />

          <div className="z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white tracking-tight leading-none">{setup.asset_symbol}</h3>
                <div className="text-neutral-500 group-hover:text-white transition-colors flex items-center">
                  {isBull ? <TrendingUp size={16} strokeWidth={2.5} /> : isBear ? <TrendingDown size={16} strokeWidth={2.5} /> : <Minus size={16} strokeWidth={2.5} />}
                </div>
              </div>
              {hasNote && <FileText size={12} className="text-amber-500 shrink-0 ml-2" />}
            </div>
            
            {hasNote ? (
              <p className="text-[10px] font-medium text-amber-500/80 line-clamp-2 leading-snug mt-1.5 italic">"{setup.saved_note}"</p>
            ) : (
              <p className={`text-[10px] font-bold line-clamp-1 leading-snug mt-1.5 transition-colors ${hasAccess ? 'text-neutral-500' : 'text-neutral-600'}`}>{hasAccess ? (setup.title || 'No notes added.') : 'Access restricted.'}</p>
            )}
          </div>
          
          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-neutral-600 pt-3 border-t border-neutral-800/80 mt-3 z-10">
            <span className="flex items-center"><Clock size={10} className="mr-1" /> {new Date(setup.saved_at).toLocaleDateString()}</span>
            <span className="text-amber-500 flex items-center"><Bookmark size={10} className="fill-amber-500 mr-1" /> Vault</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-6 md:p-8 font-sans overflow-x-hidden relative">
      
      {!isProUser && (
        <div className="absolute top-4 right-4 z-50 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">
          Sandbox Mode <Lock size={12} className="stroke-[3]" />
        </div>
      )}

      <div className="flex flex-col items-center mb-8 mt-1">
        
        {/* UNRESTRICTED CATEGORY TABS */}
        <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-xl border border-neutral-800">
          {CATEGORIES.map((cat) => {
            const active = activeTab === cat.id
            return (
              <button 
                key={cat.id} 
                onClick={() => setActiveTab(cat.id)}
                className={`relative flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black shadow-sm scale-100' : 'text-neutral-500 hover:text-white'}`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {vaultItems.length === 0 ? (
        <div className="w-full max-w-xl mx-auto mt-6 border border-dashed border-neutral-800 rounded-3xl p-12 flex flex-col items-center text-center bg-[#0a0a0a]">
          {!isProUser ? (
             <>
               <Lock size={40} className="text-amber-500/40 mb-4 stroke-1" />
               <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Vault Locked</h3>
               <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed mb-6 max-w-[280px]">Upgrade to Professional to permanently save, organize, and annotate your favorite setups.</p>
               <Link href="/account/subscription" className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-colors shadow-lg">Upgrade Now</Link>
             </>
          ) : (
             <>
               <FolderOpen size={40} className="text-neutral-700 mb-4" />
               <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Vault is Empty</h3>
               <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-relaxed mb-6">No saved analysis yet, start bookmarking to build your vault.</p>
               <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-colors">Go to Dashboard</Link>
             </>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center">
          <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">{searchQuery ? `No saved setups matching "${searchQuery}"` : "No saved setups in this category."}</span>
        </div>
      ) : (
        <div className="space-y-10 max-w-[100rem] mx-auto">
          {grouped.today.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center">Today <div className="ml-4 h-px flex-1 bg-neutral-800"></div></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {grouped.today.map(setup => <VaultCard key={setup.vault_id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.yesterday.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center">Yesterday <div className="ml-4 h-px flex-1 bg-neutral-800"></div></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {grouped.yesterday.map(setup => <VaultCard key={setup.vault_id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.thisWeek.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 flex items-center">This Week <div className="ml-4 h-px flex-1 bg-neutral-800/50"></div></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {grouped.thisWeek.map(setup => <VaultCard key={setup.vault_id} setup={setup} />)}
              </div>
            </section>
          )}

          {grouped.older.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center">Older Records <div className="ml-4 h-px flex-1 bg-neutral-800/30"></div></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {grouped.older.map(setup => <VaultCard key={setup.vault_id} setup={setup} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* NOTES MODAL */}
      {editingNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <button onClick={() => setEditingNoteId(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
            <div className="flex items-center mb-6">
              <Edit3 size={18} className="text-amber-500 mr-2" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Setup Notes</h3>
            </div>
            <textarea 
              value={tempNote} 
              onChange={(e) => setTempNote(e.target.value)} 
              placeholder="Add your analysis notes..." 
              className="w-full h-32 bg-black border border-neutral-800 rounded-xl p-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none mb-6 font-medium" 
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditingNoteId(null)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSaveNote} className="px-6 py-2.5 bg-amber-500 text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">Save Note</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
