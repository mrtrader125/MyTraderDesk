import { createClient } from '@/lib/supabaseServer'
import ArchiveClient from './ArchiveClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const asset = typeof resolvedParams.asset === 'string' ? resolvedParams.asset : null;
  
  if (!asset) {
    redirect('/markets')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: profile },
    { data: history }
  ] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', user.id).single(),
    supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
  ])

  // PAYLOAD SCRUBBING: Prevent data leaks in historical view
  const isPro = profile?.plan === 'pro'
  const safeHistory = history?.map((setup: any) => {
    if (isPro) return setup
    return {
      ...setup,
      notes: null,
      content: null
    }
  }) || []

  return (
    <ArchiveClient 
      asset={asset} 
      initialHistory={safeHistory} 
      userPlan={profile?.plan?.toLowerCase() || 'demo'} 
      userId={user.id}
    />
  )
}
