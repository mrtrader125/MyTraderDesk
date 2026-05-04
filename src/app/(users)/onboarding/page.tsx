import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage(props: { searchParams: Promise<{ preview?: string }> }) {
  // 1. Await cookies and searchParams (Required in Next.js 15)
  const cookieStore = await cookies()
  const searchParams = await props.searchParams
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } 
          catch (error) {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('protocol_established')
    .eq('id', user.id)
    .single()

  // 2. Read the preview flag from the URL
  const isPreviewMode = searchParams?.preview === 'true'

  // 3. 🚨 THE SERVER BOUNCER: Only kick them to the dashboard if they are NOT in preview mode
  if (profile?.protocol_established && !isPreviewMode) {
    redirect('/dashboard')
  }

  // 4. Render the Client UI
  return <OnboardingClient userId={user.id} />
}
