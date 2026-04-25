'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    trading_experience: '',
    current_strategy: '',
    strategy_duration: '',
    profitability_blocker: '',
    psychological_hurdles: '',
    target_objective: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('applicants').insert([formData]);

    if (error) {
      alert('Error submitting application. Please try again.');
      console.error(error);
    } else {
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Application Received</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your operational profile has been submitted for review. If you meet the criteria for our founding cohort, we will contact you via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-6 sm:px-12 font-sans text-zinc-100">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <header className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Terminal Access Application</h1>
          <p className="mt-2 text-zinc-400">Complete the operational diagnostic below to apply for the founding cohort.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Identity */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">1. Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                <input required type="text" name="full_name" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                <input required type="email" name="email" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Section 2: Operational History */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">2. Operational History</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">How long have you been actively trading?</label>
              <input required type="text" name="trading_experience" placeholder="e.g., 3 years" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Describe your current trading strategy in detail.</label>
              <textarea required name="current_strategy" rows={4} placeholder="Timeframes, setups, indicators, session focus..." onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">How long have you been consistently executing this specific strategy?</label>
              <input required type="text" name="strategy_duration" placeholder="e.g., 6 months" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
            </div>
          </div>

          {/* Section 3: Diagnostics */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">3. Diagnostics</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">What is the primary reason you are not consistently profitable yet?</label>
              <textarea required name="profitability_blocker" rows={3} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">What are the biggest psychological roadblocks you face during live execution?</label>
              <textarea required name="psychological_hurdles" rows={3} placeholder="e.g., FOMO, moving stops, overtrading..." onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">What specific tools or changes are you looking for to bridge the gap?</label>
              <textarea required name="target_objective" rows={3} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
            </div>
          </div>

          <div className="pt-4">
            <button disabled={isSubmitting} type="submit" className="w-full bg-zinc-100 text-zinc-900 font-semibold text-sm rounded-md py-4 hover:bg-white transition-colors disabled:opacity-50">
              {isSubmitting ? 'Transmitting Data...' : 'Submit Application'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}