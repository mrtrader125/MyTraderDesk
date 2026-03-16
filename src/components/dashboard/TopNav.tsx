'use client'
import { useState, useEffect } from 'react'
import { Search, ChevronRight, LogOut, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false) // HYDRATION SAFETY
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const isAnalysisPage = pathname === '/analysis'

  useEffect(() => {
    setMounted(true) // Signals that browser has taken over
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    if (search.length > 0 && isAnalysisPage) {
      const fetchSuggestions = async () => {
        const { data } = await supabase.from('analyses').select('asset_symbol')
        if (data) {
          const unique = Array.from(new Set(data.map(d => d.asset_symbol)))
          setSuggestions(unique.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 5))
        }
      }
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [search, isAnalysisPage])

  const handleSelect = (symbol: string) => {
    const saved = localStorage.getItem('analysis_watchlist')
    const history = saved ? JSON.parse(saved) : []
    const updated = Array.from(new Set([symbol, ...history]))
    localStorage.setItem('analysis_watchlist', JSON.stringify(updated))
    setSearch('')
    router.push(`/analysis/viewport?asset=${symbol}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname?.includes('/viewport')) return null

  const pageTitle = pathname?.split('/').filter(Boolean).pop() || 'Dashboard'
  const displayTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <div className="h-16 border-b border-card-border bg-app-bg transition-colors duration-700 flex items-center justify-between px-8 sticky top-0 z-[110]">
      {/* LEFT: Page Title */}
      <div className="w-1/4">
        <h1 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] italic" suppressHydrationWarning>
          {mounted ? displayTitle : 'SYSTEM'}
        </h1>
      </div>

      {/* CENTER: Search */}
      <div className="flex-1 max-w-xl px-4 relative">
        {mounted && isAnalysisPage && (
          <>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-brand-primary transition-colors" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH INSTRUMENT..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-12 pr-4 text-[11px] font-bold text-white placeholder:text-neutral-700 focus:outline-none focus:border-brand-primary/40 transition-all"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-4 right-4 mt-2 bg-card-bg border border-card-border rounded-xl shadow-2xl overflow-hidden">
                {suggestions.map(s => (
                  <button key={s} onClick={() => handleSelect(s)} className="w-full px-5 py-3 text-left text-[10px] font-bold text-neutral-400 hover:bg-brand-primary/20 hover:text-brand-primary flex justify-between items-center transition-colors">
                    {s} <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Actions */}
      <div className="w-1/4 flex items-center justify-end space-x-6 relative">
        {mounted && <NotificationBell />}

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-9 w-9 rounded-full bg-brand-gradient border border-white/10 flex items-center justify-center cursor-pointer hover:scale-105 transition-all text-white font-black text-xs uppercase shadow-brand-glow"
          >
            {mounted ? userInitial : '?'}
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-card-bg border border-card-border rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-card-border mb-2">
                  <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Active Account</p>
                  <p className="text-xs font-bold text-white truncate mt-1">{user?.email}</p>
                </div>
                <button onClick={() => { router.push('/profile'); setShowDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                  <User size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Settings</span>
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all border-t border-card-border mt-2">
                  <LogOut size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
