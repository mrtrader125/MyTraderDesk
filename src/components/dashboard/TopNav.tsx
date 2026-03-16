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

  // Initialization & Auth Check
  useEffect(() => {
    setMounted(true)
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Live Database Search Suggestions
  useEffect(() => {
    if (search.length > 0) {
      const fetchSuggestions = async () => {
        const { data } = await supabase.from('analyses').select('asset_symbol')
        if (data) {
          // Remove duplicates and filter based on input
          const unique = Array.from(new Set(data.map(d => d.asset_symbol).filter(Boolean)))
          setSuggestions(unique.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 5))
        }
      }
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [search])

  const handleSelect = (symbol: string) => {
    // Save to local watchlist history
    const saved = localStorage.getItem('analysis_watchlist')
    const history = saved ? JSON.parse(saved) : []
    const updated = Array.from(new Set([symbol, ...history]))
    localStorage.setItem('analysis_watchlist', JSON.stringify(updated))
    
    setSearch('')
    // Update this route if your viewport path changed in the new dashboard design!
    router.push(`/analysis/viewport?asset=${symbol}`) 
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Hide TopNav on viewport pages to maximize chart space
  if (pathname?.includes('/viewport')) return null

  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <header className="h-16 border-b border-neutral-800 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
      
      {/* LEFT/CENTER: Search Bar with Suggestions */}
      <div className="flex-1 max-w-md relative">
        {mounted && (
          <>
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-full focus-within:border-neutral-600 transition-colors">
              <Search size={16} className="text-neutral-500 mr-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instruments (e.g., XAUUSD)..."
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-neutral-500"
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSelect(s)} 
                    className="w-full px-5 py-3 text-left text-xs font-bold text-neutral-400 hover:bg-neutral-800 hover:text-white flex justify-between items-center transition-colors"
                  >
                    {s} <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center space-x-4 ml-4 relative">
        
        {/* Preserved your custom Notification Bell component */}
        {mounted && <NotificationBell />}

        <div className="relative">
          {/* Profile Avatar Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors text-white font-black text-xs uppercase"
          >
            {mounted ? userInitial : '?'}
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && mounted && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                
                <div className="px-4 py-3 border-b border-neutral-800 mb-2">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Operator</p>
                  <p className="text-xs font-bold text-white truncate mt-1">{user?.email || 'Authenticating...'}</p>
                </div>
                
                <button 
                  onClick={() => { router.push('/dashboard/account'); setShowDropdown(false); }} 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <User size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Account Settings</span>
                </button>
                
                <button 
                  onClick={handleSignOut} 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all border-t border-neutral-800 mt-2"
                >
                  <LogOut size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Disconnect</span>
                </button>
                
              </div>
            </>
          )}
        </div>
      </div>
      
    </header>
  )
}
