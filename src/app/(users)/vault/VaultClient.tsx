'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { createBrowserClient } from '@supabase/ssr'
import { Bookmark, Lock, Clock, TrendingUp, TrendingDown, Minus, Trash2, FolderOpen, Edit3, X, FileText } from 'lucide-react'
import { getSetupAccess } from '@/lib/access'
import { ASSET_CATEGORIES, PLAN_CONFIG } from '@/lib/platformConfig'

interface VaultItem {
  vault_id: string;
  saved_note: string;
  saved_at: string;
  asset_symbol: string;
  category: string;
  timeframe: string;
  bias: string;
  status: string;
  image_url: string;
  title?: string;
}

interface VaultData {
  userId: string;
  profile: { plan: string } | null;
  vaultItems: VaultItem[];
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
  { id: 'ALL', label: 'All Vault', req: 'free' },
  ...Object.keys(ASSET_CATEGORIES).map(category => {
    let requiredTier = 'pro';
    if (PLAN_CONFIG.free?.allowedCategories?.includes(category)) requiredTier = 'free';
    return { id: category, label: category.charAt(0) + category.slice(1).toLowerCase(), req: requiredTier }
  })
]

export const fetchVaultData = async (): Promise<VaultData | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const userId = session.user.id
  const [ { data: profile }, { data: vaultData } ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', userId).single(),
    supabase.from('user_vault')
      .select(`id, note, created_at, analysis_id, analyses (*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  ])

  let formattedItems: VaultItem[] = []
  if (vaultData) {
    formattedItems = vaultData.map((item: any) => ({
      ...item.analyses, 
      vault_id: item.id, 
      saved_note: item.note, 
      saved_at: item.created_at
    }))
  }

  return { userId, profile, vaultItems: formattedItems }
}

const VaultCard = ({ 
  setup, 
  isProUser, 
  userPlan, 
  onOpenNote, 
  onRemove 
}: { 
  setup: VaultItem; 
  isProUser: boolean; 
  userPlan: string;
  onOpenNote: (e: React.MouseEvent, id: string, note: string) => void;
  onRemove: (e: React.MouseEvent, id: string) => void;
}) => {
  const { hasAccess, requiredTier } = isProUser ? getSetupAccess(setup, userPlan) : { hasAccess: false, requiredTier: 'pro' };
  const isBull = setup.bias?.toUpperCase() === 'BULLISH'
  const isBear = setup.bias?.toUpperCase() === 'BEARISH'
  const hasNote = setup.saved_note && setup.saved_note.trim() !== ''

  const status = (setup.status || 'WAITING').toUpperCase()
  let statusLine = "bg-neutral-800"
  if (status === 'ACTIVE') statusLine = "bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
  else if (status === 'WAITING') statusLine = "bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
  
  // Ticker formatting to match Markets page
  const cleanSymbol = (setup.asset_symbol || '').toUpperCase().trim()
  const isStandardPair = cleanSymbol.length === 6

  return (
    <Link 
      href={isProUser ? `/markets/viewport?asset=${setup.asset_symbol}&tf=${setup.timeframe}&from=vault` : '#'}
      className={`bg-[#0a0a0a] border border-white/[0.04] rounded-xl overflow-hidden flex flex-col group transition-all duration-200 min-h-[180px] relative block 
        ${!isProUser ? 'opacity-60 grayscale cursor-default' : 'hover:border-white/[0.15] hover:bg-[#0c0c0c]'}`}
      onClick={(e) => { if (!isProUser) e.preventDefault(); }}
    >
      {/* Top Image Section */}
      <div className="h-28 w-full bg-[#050505] relative overflow-hidden border-b border-white/[0.02] shrink-0">
        <img 
          src={setup.image_url} 
          alt="Setup" 
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-500 ${hasAccess ? 'opacity-60 group-hover:opacity-100 group-hover:scale-105' : 'opacity-10 blur-md grayscale'}`} 
        />
        
        {!hasAccess && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm z-10">
            <Lock size={14} className="text-neutral-500 mb-1.5" />
            <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-white/[0.05] border border-white/[0.1] px-2 py-0.5 rounded shadow-sm">{requiredTier}</span>
          </div>
        )}

        {hasAccess && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white tracking-wide border border-white/[0.05]">{setup.timeframe || '-'}</div>
        )}

        {isProUser && (
          <div className="absolute top-2 right-2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <button onClick={(e) => onOpenNote(e, setup.vault_id, setup.saved_note)} className="p-1.5 bg-black/60 backdrop-blur-md text-neutral-300 rounded hover:text-white hover:bg-black border border-white/[0.05] transition-colors"><Edit3 size={12} /></button>
            <button onClick={(e) => onRemove(e, setup.vault_id)} className="p-1.5 bg-black/60 backdrop-blur-md text-neutral-300 rounded hover:text-red-400 hover:bg-black border border-white/[0.05] transition-colors"><Trash2 size={12} /></button>
          </div>
        )}
      </div>

      {/* Bottom Data Section */}
      <div className="relative p-4 flex flex-col flex-1 justify-between">
        <div className={`absolute top-0 right-0 inset-y-0 w-1 transition-all duration-300 z-30 ${statusLine}`} />

        <div className="z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg md:text-xl font-mono text-white tracking-tight flex items-baseline gap-1">
                 {isStandardPair ? (
                   <><span>{cleanSymbol.substring(0,3)}</span><span className="text-neutral-500 text-sm">{cleanSymbol.substring(3,6)}</span></>
                 ) : (
                   cleanSymbol
                 )}
              </h3>
            </div>
            {hasNote && <FileText size={12} className="text-neutral-500 shrink-0 ml-2" />}
          </div>
          
          {hasNote ? (
            <p className="text-[10px] font-sans text-neutral-400 line-clamp-2 leading-snug mt-1">"{setup.saved_note}"</p>
          ) : (
            <p className={`text-[10px] font-sans line-clamp-1 leading-snug mt-1 ${hasAccess ? 'text-neutral-600' : 'text-neutral-700'}`}>{hasAccess ? (setup.title || 'No notes added.') : 'Access restricted.'}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center text-[9px] font-medium uppercase tracking-widest text-neutral-500 pt-3 mt-3 z-10 border-t border-white/[0.02]">
          <span className="flex items-center"><Clock size={10} className="mr-1" /> {new Date(setup.saved_at).toLocaleDateString()}</span>
          <span className="text-neutral-400 flex items-center"><Bookmark size={10} className="mr-1" /> Vault</span>
        </div>
      </div>
    </Link>
  )
}

export default function VaultClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '')
  
  const [activeTab, setActiveTab] = useState('ALL')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  const { data, mutate, isLoading } = useSWR<VaultData | null>('vault_data', fetchVaultData, {
    revalidateOnFocus: true,
  })

  useEffect(() => {
    const handleSearch = (e: any) => setSearchQuery(e.detail?.toLowerCase() || '')
    window.addEventListener('globalSearch', handleSearch)
    return () => window.removeEventListener('globalSearch', handleSearch)
  }, [])

  const isProUser = data?.profile?.plan === 'pro' || data?.profile?.plan === 'premium'
  const userPlan = data?.profile?.plan?.toLowerCase() || 'free'
  const vaultItems = isProUser ? (data?.vaultItems || []) : []

  const removeFromVault = async (e: React.MouseEvent, vaultIdToRemove: string) => {
    e.preventDefault() 
    e.stopPropagation()
    if (!data) return;
    mutate({ ...data, vaultItems: data.vaultItems.filter(item => item.vault_id !== vaultIdToRemove) }, { revalidate: false })
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

  const handleSaveNote = async () => {
    if (!editingNoteId || !data?.userId || !isProUser) return
    mutate({
      ...data,
      vaultItems: data.vaultItems.map(item => item.vault_id === editingNoteId ? { ...item, saved_note: tempNote } : item)
    }, { revalidate: false })
    setEditingNoteId(null)
    await supabase.from('user_vault').update({ note: tempNote }).eq('id', editingNoteId)
    mutate()
  }

  const { filteredItems, grouped } = useMemo(() => {
    const filtered = vaultItems.filter(item => {
      const matchesTab = activeTab === 'ALL' ? true : (item.category || 'FOREX').toUpperCase() === activeTab
      const matchesSearch = (item.asset_symbol || '').toLowerCase().includes(searchQuery)
      return matchesTab && matchesSearch
    })

    const groups = { today: [] as VaultItem[], yesterday: [] as VaultItem[], thisWeek: [] as VaultItem[], older: [] as VaultItem[] }
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today); thisWeek.setDate(thisWeek.getDate() - 7)

    filtered.forEach(setup => {
      const d = new Date(setup.saved_at).getTime()
      if (d >= today.getTime()) groups.today.push(setup)
      else if (d >= yesterday.getTime()) groups.yesterday.push(setup)
      else if (d >= thisWeek.getTime()) groups.thisWeek.push(setup)
      else groups.older.push(setup)
    })

    return { filteredItems: filtered, grouped: groups }
  }, [vaultItems, activeTab, searchQuery])

  if (isLoading || !data) {
    return (
      <div className="w-full bg-transparent p-4 md:p-8 flex flex-col h-[calc(100dvh-65px)]">
        <div className="max-w-[90rem] mx-auto w-full flex flex-col min-h-0">
          <div className="shrink-0 w-64 mb-8 h-8 bg-[#0a0a0a] rounded-md animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#0a0a0a] border border-white/[0.02] rounded-xl h-[180px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-transparent p-4 md:p-8 font-sans flex flex-col overflow-hidden relative" style={{ height: 'calc(100dvh - 65px)' }}>
      <div className="max-w-[90rem] mx-auto w-full h-full flex flex-col min-h-0">
        
        {/* Sleek Minimalist Nav Pills (Matched to Markets) */}
        <div className="shrink-0 w-full mb-8 relative border-b border-white/[0.05] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {!isProUser && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] rounded-md border border-white/[0.05] text-neutral-500 shrink-0">
                <Lock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sandbox Mode</span>
              </div>
            )}
            
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat.id
              return (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveTab(cat.id)}
                  className={`relative flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap shrink-0
                    ${active ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-6 pr-1">
          {vaultItems.length === 0 ? (
            <div className="w-full max-w-xl mx-auto mt-12 border border-dashed border-white/[0.05] rounded-2xl p-12 flex flex-col items-center text-center bg-[#0a0a0a]/50">
              {!isProUser ? (
                 <>
                   <Lock size={32} className="text-neutral-500 mb-4 stroke-1" />
                   <h3 className="text-lg font-mono text-white tracking-tight mb-2">Vault Locked</h3>
                   <p className="text-[11px] font-sans text-neutral-500 leading-relaxed mb-6 max-w-[280px]">Upgrade to Professional to permanently save, organize, and annotate your favorite setups.</p>
                   <Link href="/account/subscription" className="px-5 py-2 bg-white text-black text-[11px] font-semibold rounded hover:bg-neutral-200 transition-colors">Upgrade Now</Link>
                 </>
              ) : (
                 <>
                   <FolderOpen size={32} className="text-neutral-500 mb-4 stroke-1" />
                   <h3 className="text-lg font-mono text-white tracking-tight mb-2">Vault is Empty</h3>
                   <p className="text-[11px] font-sans text-neutral-500 leading-relaxed mb-6">No saved analysis yet, start bookmarking to build your vault.</p>
                   <Link href="/dashboard" className="px-5 py-2 bg-white/[0.05] text-white border border-white/[0.1] text-[11px] font-semibold rounded hover:bg-white/[0.1] transition-colors">Go to Dashboard</Link>
                 </>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center">
              <span className="text-sm font-mono text-neutral-600">{searchQuery ? `No matches for "${searchQuery}"` : "No setups in this category."}</span>
            </div>
          ) : (
            <div className="space-y-12">
              {grouped.today.length > 0 && (
                <section className="animate-in fade-in duration-500">
                  <h2 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 flex items-center">Today <div className="ml-4 h-px flex-1 bg-white/[0.05]"></div></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {grouped.today.map(setup => <VaultCard key={setup.vault_id} setup={setup} isProUser={isProUser} userPlan={userPlan} onOpenNote={handleOpenNote} onRemove={removeFromVault} />)}
                  </div>
                </section>
              )}

              {grouped.yesterday.length > 0 && (
                <section className="animate-in fade-in duration-500 delay-75">
                  <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">Yesterday <div className="ml-4 h-px flex-1 bg-white/[0.05]"></div></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {grouped.yesterday.map(setup => <VaultCard key={setup.vault_id} setup={setup} isProUser={isProUser} userPlan={userPlan} onOpenNote={handleOpenNote} onRemove={removeFromVault} />)}
                  </div>
                </section>
              )}

              {grouped.thisWeek.length > 0 && (
                <section className="animate-in fade-in duration-500 delay-150">
                  <h2 className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-4 flex items-center">This Week <div className="ml-4 h-px flex-1 bg-white/[0.02]"></div></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {grouped.thisWeek.map(setup => <VaultCard key={setup.vault_id} setup={setup} isProUser={isProUser} userPlan={userPlan} onOpenNote={handleOpenNote} onRemove={removeFromVault} />)}
                  </div>
                </section>
              )}

              {grouped.older.length > 0 && (
                <section className="animate-in fade-in duration-500 delay-200">
                  <h2 className="text-[11px] font-bold text-neutral-700 uppercase tracking-widest mb-4 flex items-center">Older Records <div className="ml-4 h-px flex-1 bg-white/[0.02]"></div></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    {grouped.older.map(setup => <VaultCard key={setup.vault_id} setup={setup} isProUser={isProUser} userPlan={userPlan} onOpenNote={handleOpenNote} onRemove={removeFromVault} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NOTES MODAL */}
      {editingNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm p-6">
          <div className="bg-[#0a0a0a] border border-white/[0.1] rounded-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95">
            <button onClick={() => setEditingNoteId(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X size={18} /></button>
            <div className="flex items-center mb-6">
              <Edit3 size={16} className="text-white mr-2" />
              <h3 className="text-[11px] font-semibold text-white tracking-widest uppercase">Setup Notes</h3>
            </div>
            <textarea 
              value={tempNote} 
              onChange={(e) => setTempNote(e.target.value)} 
              placeholder="Add your analysis notes here..." 
              className="w-full h-32 bg-[#050505] border border-white/[0.05] rounded-md p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.2] transition-colors resize-none mb-6 font-sans" 
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 rounded text-[11px] font-semibold text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors">Cancel</button>
              <button onClick={handleSaveNote} className="px-5 py-2 bg-white text-black text-[11px] font-semibold rounded hover:bg-neutral-200 transition-colors">Save Note</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
