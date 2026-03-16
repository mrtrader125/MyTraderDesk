import { supabase } from './supabase'

export async function getUserPermissions(){

  const { data } = await supabase.auth.getUser()

  const userId = data.user?.id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return profile
}
