// src/app/(users)/desk/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DeskClient from './DeskClient'

export default async function MyDeskPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Enforce Pro Tier Access
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    redirect('/account/billing') // Or wherever your upgrade page is
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-light tracking-tight text-white">My Desk</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Your isolated environment for logging and organizing personal market setups.
          </p>
        </header>
        
        <DeskClient userId={user.id} />
      </div>
    </main>
  )
}