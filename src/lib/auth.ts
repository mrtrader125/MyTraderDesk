import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

export async function getAuthenticatedUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=Unauthorized')
  }

  return { supabase, user }
}

export async function getUserProfile() {
  const { supabase, user } = await getAuthenticatedUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan, role')
    .eq('id', user.id)
    .single()

  return {
    supabase,
    user,
    profile,
  }
}
