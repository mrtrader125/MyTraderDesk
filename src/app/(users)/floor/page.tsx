import { createClient } from '@/lib/supabaseServer'
import LiveFloorClient from './LiveFloorClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function LiveFloorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, username')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium'

  // If Demo: Let them see the page, but give them ZERO real data.
  if (!isPro) {
    return (
      <LiveFloorClient 
        initialPosts={[]}    // Scrubbed
        initialSquawks={[]}  // Scrubbed
        userId={user.id}
        userPlan="demo"
        username={profile?.username}
      />
    )
  }

  // If Pro: Fetch and send the real data.
  const [ { data: postsRes }, { data: squawksRes } ] = await Promise.all([
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
