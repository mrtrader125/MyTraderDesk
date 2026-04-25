import { createClient } from '@supabase/supabase-js';
import ApplicantViewer from './ApplicantViewer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const revalidate = 0; 

export default async function AdminApplicationsPage() {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen p-8 text-red-500 bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold">System Error</p>
          <p className="text-sm mt-2">Failed to load applicants: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#050505] font-sans text-zinc-100 flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
        
        <header className="flex justify-between items-end border-b border-zinc-800 pb-6 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Applicant Dossiers</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mt-2">Review operational profiles for terminal access</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded flex items-center">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mr-3">Queue Size</span> 
            <span className="font-mono text-blue-500">{applicants?.length || 0}</span>
          </div>
        </header>

        {/* Render the interactive client component and pass the data */}
        <ApplicantViewer applicants={applicants || []} />
        
      </div>
    </div>
  );
}
