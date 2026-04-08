import { createClient } from '@/lib/supabaseServer'
import ArchiveClient from './ArchiveClient'
import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default async function ArchivePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const asset = typeof resolvedParams.asset === 'string' ? resolvedParams.asset : null;

  if (!asset) {
    redirect('/markets')
  }

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const [
    { data: profile },
    { data: history }
  ] = await Promise.all([
    user ? supabase.from('profiles').select('plan').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase.from('analyses').select('*').eq('asset_symbol', asset).order('created_at', { ascending: false })
  ])

  return (
    <ArchiveClient 
      asset={asset}
      initialHistory={history || []}
      userPlan={profile?.plan?.toLowerCase() || 'free'}
    />
  )
}
