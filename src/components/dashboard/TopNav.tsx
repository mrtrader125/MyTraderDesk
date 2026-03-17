'use client'

import { useState, useEffect } from 'react'
import { Search, LogOut, User } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Initial Load: Set mounted, fetch user, and grab initial search from URL
  useEffect(() => {
    setMounted(true)
    
    // Grab user for the profile dropdown
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()

    // Sync search bar with URL if they refresh the page
    const initialSearch = searchParams.get('search') || ''
    setSearchTerm(initialSearch)
  }, [searchParams])

  // 2. The Tracking Tracker: Silently logs searches after a 1.5s pause
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') return

    const delayDebounceFn = setTimeout(async () => {
      if (user) {
        supabase.from('activity_logs').insert([{
          user_id: user.id,
          action: 'SEARCH',
          search_query: searchTerm.trim()
        }]).then()
      }
    }, 1500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, user])
    
  // 3. UI Handler: Updates the input box and the URL instantly
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)

    const params = new URLSearchParams(searchParams?.toString() || '')
    if (val) {
      params.set('search', val)
    } else {
      params.delete('search')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname?.includes('/viewport')) return null

  // Hide search entirely on any /account pages
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
              placeholder="Search current view..."
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
                <button onClick={() => { router.push('/account/profile'); setShowDropdown(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
                  <User size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">Account Center</span>
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all border-t border-neutral-800 mt-2">
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
