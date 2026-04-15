// src/app/(users)/desk/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DeskClient from './DeskClient'

export default async function MyDeskPage() {
  // 1. Next.js 15+ requires awaiting cookies()
  const cookieStore = await cookies()
  
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
          } catch {
            // Ignore in server components
          }
        },
      },
    }
  )

  // 2. Authenticate the User
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // 3. Verify 'pro' plan using your existing profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    // Kick free users to the billing/upgrade page
    redirect('/account/billing')
  }

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-10 lg:ml-64 md:ml-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto mt-16 md:mt-0">
        <header className="mb-8 border-b border-neutral-900 pb-6">
          <h1 className="text-3xl font-light tracking-tight text-white">My Desk</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Your isolated, pro-tier environment for logging and organizing personal market setups.
          </p>
        </header>
        
        {/* Pass the authenticated user ID to the client component */}
        <DeskClient userId={user.id} />
      </div>
    </main>
  )
}
