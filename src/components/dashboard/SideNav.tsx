'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, LineChart, Bookmark, 
  Settings, LogOut, Menu, Users, Briefcase,
  BookOpen, Activity 
} from 'lucide-react'

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname?.includes('/viewport')) return null;
  if (pathname === '/onboarding') return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Journal', href: '/journal', icon: BookOpen },     
    { name: 'Analytics', href: '/analytics', icon: Activity }, 
    { name: 'My Desk', href: '/desk', icon: Briefcase }, 
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
    <>
      <aside className={`hidden md:flex ${isOpen ? 'w-56' : 'w-16'} transition-all duration-300 border-r border-neutral-900 bg-[#050505] flex-col h-screen shrink-0 z-50`}>
        
        <div className="h-16 flex items-center px-4 border-b border-neutral-900 justify-between overflow-hidden shrink-0 bg-[#0a0a0a]">
          {isOpen && (
            <div className="relative h-14 w-30 flex items-center">
              <Image 
                src="/logo.png" 
                alt="My Trader Desk"
                fill
                className="object-contain object-left"
                unoptimized
              />
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors mx-auto shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href))
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center w-full p-3 rounded-xl transition-all mb-2
                  ${isActive ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner' : 'text-neutral-500 border border-transparent hover:bg-[#111] hover:text-neutral-300'}`}>
                  <item.icon size={20} className="shrink-0" />
                  {isOpen && (
                    <>
                      <span className="ml-3 font-black text-xs uppercase tracking-widest truncate">{item.name}</span>
                      {/* @ts-ignore */}
                      {item.isPro && (
                        <span className="ml-auto text-[8px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                          PRO
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-neutral-900 bg-[#0a0a0a]">
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full p-3 rounded-xl text-neutral-500 border border-transparent hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all"
          >
            <LogOut size={20} className="shrink-0" />
            {isOpen && <span className="ml-3 font-black text-xs uppercase tracking-widest">Disconnect</span>}
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[65px] bg-[#050505]/95 border-t border-neutral-900 z-[100] flex items-center justify-start overflow-x-auto custom-scrollbar px-4 gap-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href))
          
          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center min-w-[64px] shrink-0 h-full space-y-1.5 group">
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              )}
              
              <item.icon 
                size={20} 
                className={`transition-all duration-300 ${isActive ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-neutral-600 group-hover:text-neutral-400'}`} 
              />
              <span className={`text-[8px] font-black uppercase tracking-widest transition-colors flex items-center gap-0.5 ${isActive ? 'text-blue-400' : 'text-neutral-600'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}