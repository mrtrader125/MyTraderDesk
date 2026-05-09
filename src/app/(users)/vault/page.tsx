import { Metadata } from 'next'
import VaultClient from './VaultClient'

export const metadata: Metadata = {
  title: 'The Vault | MyTraderDesk',
}

// 🚨 NO SUPABASE QUERIES ON THE SERVER
// This makes the page 100% static, so the click response is 0ms.
export default function VaultPage() {
  return <VaultClient />
}
