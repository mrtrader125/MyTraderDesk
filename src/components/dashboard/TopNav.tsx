'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Search, LogOut, User } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'

function TopNavContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const isInitialSync = useRef(true)

  useEffect(() => {
    setMounted(true)
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()

    const initialSearch = searchParams.get('search') || ''
    setSearchTerm(initialSearch)
  }, [])

  // Sync input box and broadcast instantly if URL changes via Sidebar navigation
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || ''
    setSearchTerm(currentUrlSearch)
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: currentUrlSearch }))
  }, [searchParams])

  // Debounced URL update and Supabase Logging
  useEffect(() => {
    if (isInitialSync.current) {
      isInitialSync.current = false
      return
    }

    const timer = setTimeout(() => {
      const currentUrlSearch = searchParams.get('search') || ''
      const newSearch = searchTerm.trim()

      if (newSearch !== currentUrlSearch) {
        const params = new URLSearchParams(searchParams.toString())
        if (newSearch === '') params.delete('search')
        else params.set('search', newSearch)
        
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })

        if (newSearch !== '' && user) {
          supabase.from('activity_logs').insert([{
            user_id: user.id,
            action: 'SEARCH',
            search_query: newSearch
          }]).then()
        }
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm, user, pathname, router, searchParams])

  // INSTANT SEARCH BROADCAST
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: val }))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname?.includes('/viewport')) return null
  
  const isAccountPage = pathname?.startsWith('/account')
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <header className="h-16 w-full border-b border-neutral-800 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
      
      <div className="flex-1 max-w-md relative">
        {mounted && !isAccountPage && (
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 w-full focus-within:border-neutral-600 transition-colors">
            <Search size={16} className="text-neutral-500 mr-3 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search assets (e.g. XAUUSD)..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-neutral-500"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 ml-4 relative">
        {mounted && <NotificationBell />}

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors text-white font-black text-xs uppercase"
          >
            {mounted ? userInitial : '?'}
          </button>

          {showDropdown && mounted && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-neutral-800 mb-2">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Operator</p>
                  <p className="text-xs font-bold text-white truncate mt-1">{user?.email || '...'}</p>
                </div>
                <button 
                  onClick={() => { router.push('/account/profile'); setShowDropdown(false); }} 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-left"
                >
                  <User size={16} /> 
                  <span className="text-[11px] font-black uppercase tracking-widest">Account Center</span>
                </button>
                <button 
                  onClick={handleSignOut} 
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all border-t border-neutral-800 mt-2 text-left"
                >
                  <LogOut size={16} /> 
                  <span className="text-[11px] font-black uppercase tracking-widest">Disconnect</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default function TopNav() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-neutral-800 bg-[#0a0a0a] shrink-0 z-40 sticky top-0"></div>}>
      <TopNavContent />
    </Suspense>
  )
}
