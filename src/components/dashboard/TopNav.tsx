'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, LogOut, User, Globe } from 'lucide-react'
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
    <header className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-between px-3 md:px-6 shrink-0 z-40 sticky top-0 shadow-sm">
      
      {!isAccountPage && (
        <div className="md:hidden flex items-center mr-3 shrink-0">
          <Link href="/dashboard" className="relative h-14 w-32 flex items-center block">
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

      {/* DASHBOARD VIEW TOGGLE (Only visible on /dashboard) */}
      {mounted && isDashboard && (
        <div className="hidden lg:flex items-center bg-[#050505] border border-neutral-800 p-1 rounded-xl w-max shadow-inner ml-4 shrink-0">
          <button
            onClick={() => handleViewSwitch('general')}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
              dashboardView === 'general' ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            General
            {dashboardView === 'general' && (
              <div className="absolute inset-0 bg-neutral-800 rounded-lg -z-10 shadow-sm transition-all duration-300"></div>
            )}
          </button>

          <button
            onClick={() => handleViewSwitch('personal')}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 z-10 ${
              dashboardView === 'personal' ? 'text-blue-400' : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal
            {dashboardView === 'personal' && (
              <div className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-lg -z-10 shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all duration-300"></div>
            )}
          </button>
        </div>
      )}

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

export default function TopNav({ user }: { user: any }) {
  return (
    <Suspense fallback={<div className="h-14 md:h-16 w-full border-b border-neutral-900 bg-[#0a0a0a] shrink-0 z-40 sticky top-0"></div>}>
      <TopNavContent user={user} />
    </Suspense>
  )
}
