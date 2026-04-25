'use client';

import { useState } from 'react';

// Define the type based on your Supabase schema
type Applicant = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  trading_experience: string;
  current_strategy: string;
  strategy_duration: string;
  profitability_blocker: string;
  psychological_hurdles: string;
  target_objective: string;
  status: string;
};

export default function ApplicantViewer({ applicants }: { applicants: Applicant[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    applicants.length > 0 ? applicants[0].id : null
  );

  const selectedApplicant = applicants.find((a) => a.id === selectedId);

  if (applicants.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border border-zinc-800 border-dashed rounded-lg bg-[#0a0a0a] min-h-[400px]">
        <p className="text-zinc-500 text-sm tracking-widest uppercase">No applications in queue.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px] shadow-2xl">
      
      {/* Left Pane: Applicant List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/30 flex flex-col max-h-[400px] md:max-h-[800px] overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Applicant Queue</h3>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {applicants.map((applicant) => (
            <button
              key={applicant.id}
              onClick={() => setSelectedId(applicant.id)}
              className={`w-full text-left p-4 border-b border-zinc-800/50 transition-all hover:bg-zinc-800/30 ${
                selectedId === applicant.id 
                  ? 'bg-zinc-800/50 border-l-2 border-l-blue-500' 
                  : 'border-l-2 border-l-transparent'
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
                  applicant.status === 'pending' ? 'bg-amber-900/30 text-amber-500' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {applicant.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Detailed Dossier */}
      <div className="w-full md:w-2/3 bg-[#0a0a0a] flex flex-col max-h-[800px] overflow-y-auto scrollbar-hide">
        {selectedApplicant ? (
          <div className="flex flex-col h-full">
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
              <button className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest px-4 py-2 transition-colors">
                Reject
              </button>
              <button className="text-xs font-bold bg-zinc-100 text-zinc-900 hover:bg-white uppercase tracking-widest px-6 py-2 rounded transition-colors shadow-lg">
                Approve Access
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-zinc-600 text-sm">Select an operator from the queue to review their dossier.</p>
          </div>
        )}
      </div>

    </div>
  );
}
