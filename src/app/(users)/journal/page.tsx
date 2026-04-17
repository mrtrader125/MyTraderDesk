import JournalClient from './JournalClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal | Sentinel Vortex',
  description: 'Operator performance mirror and trade autopsy.',
}

export default function JournalPage() {
  return <JournalClient />
}
