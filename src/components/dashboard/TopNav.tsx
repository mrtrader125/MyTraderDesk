'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, LogOut, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'
import Image from 'next/image' // 🚨 IMPORTED IMAGE
import Link from 'next/link'

function TopNavContent() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [])

  useEffect(() => {
    setSearchTerm('')
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: '' }))
  }, [pathname])

  useEffect(() => {
    if (!searchTerm || !user) return
    const timer = setTimeout(() => {
      supabase.from('activity_logs').insert([{
        user_id: user.id,
        action: 'SEARCH',
        search_query: searchTerm
      }]).then()
    }, 800)
    return () => clearTimeout(timer)
  }, [searchTerm, user])

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
    // 🚨 MODIFIED: Slightly shorter height on mobile (h-14), standard on desktop (md:h-16)
    <header className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-between px-3 md:px-6 shrink-0 z-40 sticky top-0 shadow-sm">
      
      {/* 🚨 NEW: MOBILE LOGO (Shows only on small screens) */}
      {!isAccountPage && (
        <div className="md:hidden flex items-center mr-3 shrink-0">
          <Link href="/dashboard" className="relative h-12 w-40 flex items-center block">
            <Image src="/logo.png" alt="My Trader Desk" fill className="object-contain object-left" priority unoptimized />
          </Link>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="flex-1 max-w-md relative">
        {mounted && !isAccountPage && (
          <div className="flex items-center bg-[#111] md:bg-neutral-900/50 border border-neutral-800 rounded-full px-3 md:px-4 py-1.5 md:py-2 w-full focus-within:border-blue-500/50 focus-within:bg-[#111] transition-all shadow-inner group">
            <Search size={14} className="text-neutral-500 mr-2 md:mr-3 shrink-0 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-xs md:text-sm w-full text-white placeholder-neutral-600"
            />
          </div>
        )}
      </div>

      {/* ICONS & PROFILE */}
      <div className="flex items-center space-x-3 md:space-x-4 ml-3 md:ml-4 relative shrink-0">
        {mounted && <NotificationBell />}

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all text-white font-black text-[10px] md:text-xs uppercase"
          >
            {mounted ? userInitial : '?'}
          </button>

          {showDropdown && mounted && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-neutral-900 mb-2 bg-[#050505]">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Account</p>
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
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all border-t border-neutral-900 mt-2 text-left"
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
    <Suspense fallback={<div className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a] shrink-0 z-40 sticky top-0"></div>}>
      <TopNavContent />
    </Suspense>
  )
}
