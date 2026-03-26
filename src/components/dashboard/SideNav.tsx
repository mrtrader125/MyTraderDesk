'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image' // 🚨 NEW: Imported Image from next/image
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, LineChart, Bookmark, 
  Award, Settings, LogOut, Menu, Users 
} from 'lucide-react'

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname?.includes('/viewport')) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Markets', href: '/markets', icon: LineChart },
    { name: 'The Vault', href: '/vault', icon: Bookmark }, 
    { name: 'Live Floor', href: '/floor', icon: Users }, 
    { name: 'Account', href: '/account/profile', icon: Settings },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-neutral-800 bg-[#0a0a0a] flex flex-col h-screen shrink-0 z-50`}>
      
      {/* BRANDING & TOGGLE */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 justify-between overflow-hidden">
        {isOpen && (
          // 🚨 NEW: Image wrapper instead of text
          <div className="relative h-10 w-50 flex items-center">
            <Image 
              src="/logo.png" // 🚨 IMPORTANT: Change this to match your file name in the public folder
              alt="My Trader Desk"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors mx-auto shrink-0"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
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
