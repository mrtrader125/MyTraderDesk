'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, LogOut, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NotificationBell from '@/components/notifications/NotificationBell'
import Image from 'next/image'
import Link from 'next/link'

function TopNavContent({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State for the dashboard toggle
  const [dashboardView, setDashboardView] = useState<'general' | 'personal'>('general')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSearchTerm('')
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: '' }))
  }, [pathname])

  useEffect(() => {
    if (!searchTerm || !user?.id) return
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

  // Handle Dashboard Toggle Change
  const handleViewSwitch = (view: 'general' | 'personal') => {
    setDashboardView(view)
    window.dispatchEvent(new CustomEvent('switchDashboardView', { detail: view }))
  }

  // 🚨 THE VISUAL LOCKS
  if (pathname?.includes('/viewport')) return null
  if (pathname === '/onboarding') return null
  
  const isAccountPage = pathname?.startsWith('/account')
  const isDashboard = pathname === '/dashboard'
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <header className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-between px-3 md:px-6 shrink-0 z-40 sticky top-0">
      
      {/* LEFT SECTION: Logo & Workspace Toggle */}
      <div className="flex items-center h-full">
        {!isAccountPage && (
          <div className="md:hidden flex items-center mr-6 shrink-0">
            <Link href="/dashboard" className="relative h-14 w-28 flex items-center block">
              <Image src="/logo.png" alt="My Trader Desk" fill className="object-contain object-left" priority unoptimized />
            </Link>
          </div>
        )}

        {/* DASHBOARD VIEW TOGGLE (Clean, technical text links) */}
        {mounted && isDashboard && (
          <div className="hidden lg:flex items-center gap-6 h-full">
            <button
              onClick={() => handleViewSwitch('general')}
              className={`text-[11px] font-black uppercase tracking-widest transition-all duration-200 h-full flex items-center border-b-2 ${
                dashboardView === 'general' 
                  ? 'text-white border-white' 
                  : 'text-neutral-600 hover:text-neutral-400 border-transparent'
              }`}
            >
              General
            </button>

            <button
              onClick={() => handleViewSwitch('personal')}
              className={`text-[11px] font-black uppercase tracking-widest transition-all duration-200 h-full flex items-center border-b-2 ${
                dashboardView === 'personal' 
                  ? 'text-blue-400 border-blue-500' 
                  : 'text-neutral-600 hover:text-neutral-400 border-transparent'
              }`}
            >
              Personal
            </button>
          </div>
        )}
      </div>

      {/* CENTER SECTION: Empty for breathing room */}
      <div className="flex-1"></div>

      {/* RIGHT SECTION: Utilities & Profile */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        
        {/* COMPACT SEARCH BAR */}
        {mounted && !isAccountPage && (
          <div className="hidden sm:flex items-center bg-transparent border border-neutral-800/60 rounded flex-row px-2.5 py-1.5 w-48 lg:w-56 focus-within:border-neutral-600 transition-colors group">
            <Search size={13} className="text-neutral-600 mr-2 shrink-0 group-focus-within:text-neutral-300 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-neutral-700"
            />
            {/* Keyboard shortcut hint for premium feel */}
            <div className="hidden lg:flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 ml-2 shrink-0">
              <span className="text-[9px] font-mono font-medium text-neutral-500 tracking-tighter">⌘K</span>
            </div>
          </div>
        )}

        {/* ICONS & PROFILE */}
        <div className="flex items-center gap-3 relative">
          {mounted && <NotificationBell />}

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-pointer hover:border-neutral-600 hover:text-white transition-all text-neutral-400 font-black text-[10px] md:text-xs uppercase"
            >
              {mounted ? userInitial : '?'}
            </button>

            {showDropdown && mounted && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-neutral-900/50 mb-1">
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Operator</p>
                    <p className="text-xs font-bold text-neutral-200 truncate mt-0.5">{user?.email || '...'}</p>
                  </div>
                  <button 
                    onClick={() => { router.push('/account/profile'); setShowDropdown(false); }} 
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <User size={14} /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Account Center</span>
                  </button>
                  <button 
                    onClick={handleSignOut} 
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all border-t border-neutral-900 mt-1 text-left"
                  >
                    <LogOut size={14} /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Disconnect</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function TopNav({ user }: { user: any }) {
  return (
    <Suspense fallback={<div className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a] shrink-0 z-40 sticky top-0"></div>}>
      <TopNavContent user={user} />
    </Suspense>
  )
}
