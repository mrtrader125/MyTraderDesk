import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'
import ThemeWrapper from '@/components/dashboard/ThemeWrapper'
import PresenceHeartbeat from '@/components/dashboard/PresenceHeartbeat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. AWAIT the cookies (Next.js 15+ requirement)
  const cookieStore = await cookies()

  // 2. Create a secure server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Safe to ignore in Server Components
          }
        },
      },
    }
  )

  // 3. THE VAULT DOOR: Check for a valid user cryptographically
  const { data: { user } } = await supabase.auth.getUser()

  // 4. If they have no valid key, abort and redirect to login
  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  // 5. If they pass, render the premium terminal UI with Real-time Presence
  return (
    <ThemeWrapper>
      {/* HEARTBEAT: Invisible component that tracks "Active Now" status */}
      <PresenceHeartbeat user={user} />

      {/* Background Depth Blooms */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full transition-colors duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full transition-colors duration-1000" />
      </div>

      <div className="flex h-screen w-full relative z-10">
        {/* SIDEBAR NAVIGATION */}
        <SideNav />

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
          <TopNav />
          
          <main className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </ThemeWrapper>
  )
}
