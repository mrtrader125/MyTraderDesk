import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import SideNav from '@/components/dashboard/SideNav'
import TopNav from '@/components/dashboard/TopNav'
import ThemeWrapper from '@/components/dashboard/ThemeWrapper'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. AWAIT the cookies (Next.js 15+ strict requirement)
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
          // Server Components cannot set cookies, but Supabase requires this function to exist.
          // We wrap it in a try/catch so it fails silently, leaving the actual cookie setting to our proxy.ts Bouncer.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {}
        },
      },
    }
  )

  // 3. THE VAULT DOOR: Check for a valid user cryptographically
  const { data: { user } } = await supabase.auth.getUser()

  // 4. If they have no valid key, abort the render and kick them out
  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  // 5. If they pass, render the premium terminal UI
  return (
    <ThemeWrapper>
      {/* Background Depth Blooms - Now completely dynamic based on tier */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full transition-colors duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full transition-colors duration-1000" />
      </div>

      <SideNav />

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide md:scrollbar-default">
          {children}
        </main>
      </div>
    </ThemeWrapper>
  )
}
