import { Metadata } from 'next'
import ApplicantViewer from './ApplicantViewer'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Applications | MyTraderDesk',
}

export default function AdminApplicationsPage() {
  return (
    <div className="h-[calc(100vh-70px)] bg-black font-sans text-zinc-100 flex flex-col p-4 md:p-6">
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
        <header className="flex justify-between items-end border-b border-zinc-800 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Applicant Dossiers</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mt-2">Review operational profiles for terminal access</p>
          </div>
        </header>

        {/* 🚨 SWR Client Component handles the loading now */}
        <ApplicantViewer />
      </div>
    </div>
  )
}
