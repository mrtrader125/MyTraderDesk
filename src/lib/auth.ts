import { createSupabaseServerClient } from './supabaseServer'

export async function isAdmin(){

  const supabase = createSupabaseServerClient()

  const { data:{ user } } = await supabase.auth.getUser()

  if(!user){
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'

}
