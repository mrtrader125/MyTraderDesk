import { createClient } from '@supabase/supabase-js';

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
    return <div className="p-8 text-red-500 bg-[#0a0a0a] min-h-screen">System Error: Failed to load applicants.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 sm:p-12 font-sans text-zinc-100">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Applicant Dossiers</h1>
            <p className="text-zinc-400 mt-2">Review operational profiles for terminal access.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-md">
            <span className="text-zinc-500 text-sm mr-2">Total Candidates:</span> 
            <span className="font-medium">{applicants?.length || 0}</span>
          </div>
        </header>

        <div className="space-y-8">
          {applicants?.map((applicant) => (
            <div key={applicant.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
              
              {/* Profile Header */}
              <div className="bg-zinc-900 px-6 py-4 flex justify-between items-center border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">{applicant.full_name}</h2>
                  <p className="text-sm text-zinc-400 mt-1">{applicant.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest font-medium ${applicant.status === 'pending' ? 'bg-amber-900/30 text-amber-500 border border-amber-900/50' : 'bg-zinc-800 text-zinc-300'}`}>
                    {applicant.status}
                  </span>
                  <p className="text-xs text-zinc-500 mt-3">
                    {new Date(applicant.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Dossier Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                
                {/* Left Column: Operational */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Trading Experience</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.trading_experience}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Strategy Duration</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.strategy_duration}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Current Strategy</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.current_strategy}</p>
                  </div>
                </div>

                {/* Right Column: Diagnostics */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Profitability Blocker</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.profitability_blocker}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Psychological Hurdles</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.psychological_hurdles}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Target Objective</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/50 p-3 rounded border border-zinc-800/50">{applicant.target_objective}</p>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="bg-zinc-900 px-6 py-4 border-t border-zinc-800 flex justify-end gap-4">
                <button className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors px-4 py-2">Reject Candidate</button>
                <button className="text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors px-6 py-2 rounded">Approve Access</button>
              </div>

            </div>
          ))}

          {applicants?.length === 0 && (
            <div className="text-center py-16 border border-zinc-800 border-dashed rounded-lg">
              <p className="text-zinc-500">No applications received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}