import { createClient } from '@/lib/supabaseServer'
import MarketsClient from './MarketsClient'

export const runtime = 'edge'

export default async function MarketsPage() {
  const supabase = await createClient()
  
  // Fetch user data and market data at the exact same time
  const { data: { user } } = await supabase.auth.getUser()
  const [
    { data: profile },
    { data: analyses }
  ] = await Promise.all([
    user ? supabase.from('profiles').select('plan').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase.from('analyses').select('*').order('created_at', { ascending: false })
  ])

  // 🚨 OPTIMIZATION: Do the heavy grouping math on the server
  let groupedArray: any[] = []
  if (analyses) {
    const grouped = analyses.reduce((acc: any, curr: any) => {
      if (!acc[curr.asset_symbol]) {
        acc[curr.asset_symbol] = {
          symbol: curr.asset_symbol,
          category: (curr.category || 'FOREX').toUpperCase(),
          latestSetupId: curr.id,
          isPrime: curr.is_prime || false,
          lastUpdated: curr.created_at,
          count: 0,
          activeCount: 0,
          waitingCount: 0,
          doneCount: 0,
          timeframes: []
        }
      }
      
      acc[curr.asset_symbol].count += 1
      
      const status = (curr.status || 'WAITING').toUpperCase()
      if (status === 'ACTIVE') acc[curr.asset_symbol].activeCount += 1
      else if (status === 'WAITING') acc[curr.asset_symbol].waitingCount += 1
      else if (status === 'DONE') acc[curr.asset_symbol].doneCount += 1

      if (!acc[curr.asset_symbol].timeframes.includes(curr.timeframe)) {
        acc[curr.asset_symbol].timeframes.push(curr.timeframe)
      }
      
      if (curr.is_prime) acc[curr.asset_symbol].isPrime = true;
      
      return acc
    }, {})
    
    groupedArray = Object.values(grouped)
  }

  return (
    <MarketsClient 
      initialPlan={profile?.plan?.toLowerCase()} 
      initialGroupedAnalyses={groupedArray} 
    />
  )
}
