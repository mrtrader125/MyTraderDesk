'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🚨 SWR FETCHER
const fetchApplicants = async () => {
  const { data, error } = await supabase.from('applicants').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export default function ApplicantViewer() {
  // 🚨 SWR CACHING
  const { data: applicants, isLoading, mutate } = useSWR('admin_applicants', fetchApplicants, { dedupingInterval: 30000 });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select first applicant when data loads
  useEffect(() => {
    if (applicants && applicants.length > 0 && !selectedId) {
      setSelectedId(applicants[0].id);
    }
  }, [applicants, selectedId]);

  if (isLoading || !applicants) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border border-zinc-800 border-dashed rounded-lg bg-[#000000] min-h-[400px]">
        <Loader2 className="animate-spin text-zinc-500 mb-4" size={32} />
        <p className="text-zinc-500 text-sm tracking-widest uppercase">Syncing Queue...</p>
      </div>
    );
  }

  const selectedApplicant = applicants.find((a: any) => a.id === selectedId);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedApplicant) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          email: selectedApplicant.email,
          name: selectedApplicant.full_name,
          action: action
        })
      });

      if (!response.ok) throw new Error('Failed to process action');
      
      // Update cache instantly
      mutate(applicants.map((app: any) => 
        app.id === selectedApplicant.id ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' } : app
      ), false);

    } catch (error: any) {
      alert(`System Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border border-zinc-800 border-dashed rounded-lg bg-[#000000] min-h-[400px]">
        <p className="text-zinc-500 text-sm tracking-widest uppercase">No applications in queue.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] border border-zinc-800 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px] shadow-2xl font-sans">
      
      {/* Left Pane: Applicant List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/30 flex flex-col max-h-[400px] md:max-h-[800px] overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0 flex justify-between items-center">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Applicant Queue</h3>
          <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{applicants.length} Total</span>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {applicants.map((applicant: any) => (
            <button
              key={applicant.id}
              onClick={() => setSelectedId(applicant.id)}
              className={`w-full text-left p-4 border-b border-zinc-800/50 transition-all hover:bg-zinc-800/30 ${
                selectedId === applicant.id ? 'bg-zinc-800/50 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-zinc-100 text-sm truncate pr-2">{applicant.full_name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0 mt-0.5">
                  {new Date(applicant.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-zinc-500 truncate pr-2">{applicant.email}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-widest font-bold ${
                  applicant.status === 'pending' ? 'bg-amber-900/30 text-amber-500' : 
                  applicant.status === 'approved' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-red-900/30 text-red-500'
                }`}>
                  {applicant.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Detailed Dossier */}
      <div className="w-full md:w-2/3 bg-[#000000] flex flex-col max-h-[800px] overflow-y-auto custom-scrollbar">
        {selectedApplicant ? (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Dossier Header */}
            <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-900/20 shrink-0 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">{selectedApplicant.full_name}</h2>
                <p className="text-sm text-zinc-400 mt-1">{selectedApplicant.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-1">Applied: {new Date(selectedApplicant.created_at).toLocaleDateString()}</p>
                <p className="text-[10px] font-mono text-zinc-600">ID: {selectedApplicant.id.split('-')[0]}</p>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-8 space-y-10 shrink-0">
              {/* Operational Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800/50 pb-2">Operational Profile</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Trading Experience</h4>
                    <p className="text-zinc-200 text-sm font-medium">{selectedApplicant.trading_experience}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Strategy Duration</h4>
                    <p className="text-zinc-200 text-sm font-medium">{selectedApplicant.strategy_duration}</p>
                  </div>
                </div>
                
                {/* System Mechanics */}
                {(selectedApplicant.directional_bias || selectedApplicant.risk_management) && (
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div>
                      <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Directional Bias</h4>
                      <p className="text-zinc-200 text-sm font-medium">{selectedApplicant.directional_bias || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Risk Management</h4>
                      <p className="text-zinc-200 text-sm font-medium">{selectedApplicant.risk_management || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Current Strategy</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-md border border-zinc-800/50">
                    {selectedApplicant.current_strategy}
                  </p>
                </div>
              </div>

              {/* Diagnostics Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800/50 pb-2">Diagnostics & Psychology</h3>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Profitability Blocker</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-md border border-zinc-800/50">
                    {selectedApplicant.profitability_blocker}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Psychological Hurdles</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-md border border-zinc-800/50">
                    {selectedApplicant.psychological_hurdles}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Target Objective</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-4 rounded-md border border-zinc-800/50">
                    {selectedApplicant.target_objective}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Actions Footer */}
            <div className="mt-auto px-8 py-5 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4 shrink-0">
              {selectedApplicant.status !== 'pending' ? (
                <div className={`text-xs font-bold uppercase tracking-widest py-2 ${selectedApplicant.status === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                  Status: {selectedApplicant.status}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => handleAction('reject')}
                    disabled={isProcessing}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction('approve')}
                    disabled={isProcessing}
                    className="text-xs font-bold bg-zinc-100 text-zinc-900 hover:bg-white uppercase tracking-widest px-6 py-2 rounded transition-colors shadow-lg disabled:opacity-50 min-w-[160px] flex items-center justify-center"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Approve Access'}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Select an operator</p>
          </div>
        )}
      </div>
    </div>
  );
}
