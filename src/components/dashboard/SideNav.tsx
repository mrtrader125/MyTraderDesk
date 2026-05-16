'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

import {
  LayoutDashboard,
  LineChart,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  Users,
  Briefcase,
  BookOpen,
  Activity,
} from 'lucide-react'

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [intelOpen, setIntelOpen] = useState(true)

  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (pathname?.includes('/viewport')) return null
  if (pathname === '/onboarding') return null

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
     {
      name: 'My Desk',
      href: '/desk',
      icon: Briefcase,
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: BookOpen,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: Activity,
    },
  ]

  const intelItems = [
    {
      name: 'Markets',
      href: '/markets',
      icon: LineChart,
    },
    {
      name: 'Vault',
      href: '/vault',
      icon: Bookmark,
    },
    {
      name: 'Live Floor',
      href: '/floor',
      icon: Users,
    },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex ${
          isOpen ? 'w-56' : 'w-16'
        } transition-all duration-300 border-r border-neutral-900 bg-[#050505] flex-col h-screen shrink-0 z-50 shadow-[10px_0_30px_rgba(0,0,0,0.5)]`}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-900 overflow-hidden shrink-0 bg-[#0a0a0a]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>

          {isOpen && (
            <div className="relative h-14 ml-3 flex-1 flex items-center">
              <Image
                src="/logo.png"
                alt="My Trader Desk"
                fill
                className="object-contain object-left"
                priority
                unoptimized
              />
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
          {/* MAIN NAV ITEMS */}
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' &&
                  pathname?.startsWith(
                    item.href.split('/')[1]
                      ? `/${item.href.split('/')[1]}`
                      : item.href
                  ))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.href)}
                >
                  <div
                    className={`flex items-center w-full p-3 rounded-xl transition-all mb-2
                    ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner'
                        : 'text-neutral-500 border border-transparent hover:bg-[#111] hover:text-neutral-300'
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />

                    {isOpen && (
                      <span className="ml-3 font-black text-xs uppercase tracking-widest truncate">
                        {item.name}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

{/* INTEL SECTION */}
<div
  className="relative mt-2 group"
  onMouseEnter={() => !isOpen && setIntelOpen(true)}
  onMouseLeave={() => !isOpen && setIntelOpen(false)}
>
  {/* MAIN INTEL BUTTON */}
  <button
    onClick={() => isOpen && setIntelOpen(!intelOpen)}
    className={`flex items-center justify-between w-full p-3 rounded-xl transition-all
    ${
      pathname?.startsWith('/markets') ||
      pathname?.startsWith('/vault') ||
      pathname?.startsWith('/floor')
        ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
        : 'text-neutral-500 border border-transparent hover:bg-[#111] hover:text-neutral-300'
    }`}
  >
    <div className="flex items-center">
      <LineChart size={20} className="shrink-0" />

      {isOpen && (
        <span className="ml-3 font-black text-xs uppercase tracking-widest">
          Intel
        </span>
      )}
    </div>

    {isOpen && (
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${
          intelOpen ? 'rotate-90' : ''
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    )}
  </button>

  {/* OPEN SIDEBAR MODE */}
  {isOpen && intelOpen && (
    <div className="mt-1 ml-4 pl-3 border-l border-neutral-800 space-y-1">
      {intelItems.map((item) => {
        const isActive = pathname?.startsWith(item.href)

        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch={true}
            onMouseEnter={() => router.prefetch(item.href)}
          >
            <div
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all
              ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-[#111]'
              }`}
            >
              <item.icon size={15} />

              <span className="text-[10px] uppercase tracking-widest font-black">
                {item.name}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )}

  {/* COLLAPSED FLOATING MENU */}
  {!isOpen && intelOpen && (
    <div className="absolute left-16 top-0 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-2 z-[999] animate-in fade-in zoom-in-95 duration-150">
      <div className="mb-2 px-2 pt-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          Intel
        </span>
      </div>

      <div className="space-y-1">
        {intelItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => router.prefetch(item.href)}
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-neutral-400 hover:bg-[#111] hover:text-white'
                }`}
              >
                <item.icon size={16} />

                <span className="text-[11px] font-black uppercase tracking-widest">
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )}
</div>
          
          {/* ACCOUNT */}
          <div className="mt-6">
            <Link
              href="/account/profile"
              prefetch={true}
              onMouseEnter={() => router.prefetch('/account/profile')}
            >
              <div
                className={`flex items-center w-full p-3 rounded-xl transition-all
                ${
                  pathname?.startsWith('/account')
                    ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner'
                    : 'text-neutral-500 border border-transparent hover:bg-[#111] hover:text-neutral-300'
                }`}
              >
                <Settings size={20} className="shrink-0" />

                {isOpen && (
                  <span className="ml-3 font-black text-xs uppercase tracking-widest truncate">
                    Account
                  </span>
                )}
              </div>
            </Link>
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-neutral-900 bg-[#0a0a0a]">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full p-3 rounded-xl text-neutral-500 border border-transparent hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all"
          >
            <LogOut size={20} className="shrink-0" />

            {isOpen && (
              <span className="ml-3 font-black text-xs uppercase tracking-widest">
                Disconnect
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[65px] bg-[#050505]/95 backdrop-blur-xl border-t border-neutral-900 z-[100] flex items-center justify-start overflow-x-auto custom-scrollbar px-4 gap-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {[
          ...navItems,
          {
            name: 'Intel',
            href: '/markets',
            icon: LineChart,
          },
        ].map((item) => {
          const isActive =
            pathname === item.href ||
            pathname?.startsWith('/markets') ||
            pathname?.startsWith('/vault') ||
            pathname?.startsWith('/floor')

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onTouchStart={() => router.prefetch(item.href)}
              className="relative flex flex-col items-center justify-center min-w-[64px] shrink-0 h-full space-y-1.5 group"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              )}

              <item.icon
                size={20}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    : 'text-neutral-600 group-hover:text-neutral-400'
                }`}
              />

              <span
                className={`text-[8px] font-black uppercase tracking-widest transition-colors flex items-center gap-0.5 ${
                  isActive ? 'text-blue-400' : 'text-neutral-600'
                }`}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
