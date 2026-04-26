import { createClient } from '@/lib/supabaseServer'
import LiveFloorClient from './LiveFloorClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function LiveFloorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, username')
    .eq('id', user.id)
    .single()

  const isProUser = profile?.plan === 'pro'

  // STRICT SEQUENTIAL GATING: Halt and return empty arrays if the tier check fails
  if (!isProUser) {
    return <LiveFloorClient initialPosts={[]} initialSquawks={[]} userId={user.id} userPlan={profile?.plan || 'demo'} username={profile?.username} /> 
  }

  const [
    { data: postsRes },
    { data: squawksRes }
  ] = await Promise.all([
    supabase.from('terminal_posts').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('live_squawk').select('*').order('created_at', { ascending: false }).limit(50)
  ])

  return (
    <LiveFloorClient 
      initialPosts={postsRes ? [...postsRes].reverse() : []}
      initialSquawks={squawksRes ? [...squawksRes].reverse() : []}
      userId={user.id}
      userPlan={profile.plan}
      username={profile.username}
    />
  )
}
