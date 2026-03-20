'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, LineChart, Bookmark, 
  Award, Settings, LogOut, Menu 
} from 'lucide-react'

export default function SideNav() {
  // 1. Starts collapsed by default (false instead of true)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // 2. Auto-collapses the sidebar whenever the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Do not render sidebar on full-screen chart pages
  if (pathname?.includes('/viewport')) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Markets', href: '/markets', icon: LineChart },
    { name: 'The Vault', href: '/vault', icon: Bookmark }, 
    { name: 'Account', href: '/account/profile', icon: Settings },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col h-screen shrink-0 z-50`}>
      
      {/* BRANDING & TOGGLE */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-800 justify-between overflow-hidden">
        {isOpen && (
          <span className="font-black tracking-tight text-lg uppercase flex items-center whitespace-nowrap">
            <span className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">MY
            </span> TRADER DESK
          </span>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors mx-auto shrink-0"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          // Check if active (handles sub-paths too)
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href))
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center w-full p-3 rounded-xl transition-colors mb-2
                ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon size={20} className="shrink-0" />
                {isOpen && <span className="ml-3 font-bold text-sm uppercase tracking-widest truncate">{item.name}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* DISCONNECT / LOGOUT */}
      <div className="p-4 border-t border-neutral-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center w-full p-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="ml-3 font-bold text-sm uppercase tracking-widest">Disconnect</span>}
        </button>
      </div>
      
    </aside>
  )
}
