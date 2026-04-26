'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Calendar, 
  Archive, 
  BarChart3, 
  CheckSquare, 
  Crosshair, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';

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

  const systemSteps = [
    {
      title: "The Sunday Prep",
      desc: "Every Sunday, we release the weekly direction and hard invalidation levels for the highest-probability Forex, Commodity, and Crypto pairs.",
      icon: Calendar
    },
    {
      title: "The Vault",
      desc: "You filter the noise. Pick the specific pairs you are actively trading and save them to your Vault for daily tracking.",
      icon: Archive
    },
    {
      title: "Daily Chart Updates",
      desc: "We update the primary pairs daily on the 4H chart. When a setup looks highly probable, we drop down to the lower timeframes for precise entry zones.",
      icon: BarChart3
    },
    {
      title: "Live Floor Validation",
      desc: "Clean entries are posted to the Live Floor. Members vote 'Aligned' or 'Counter.' If our bias matches your strategy, execute with confidence. If it clashes, reduce your risk or sit it out.",
      icon: CheckSquare
    },
    {
      title: "Mechanical Execution",
      desc: "No random adjustments or screen-watching. You define your Entry, Stop Loss, Take Profit, and set a single alert to move to Break-Even. Once placed, you touch nothing.",
      icon: Crosshair
    },
    {
      title: "Pre-Outcome Journaling",
      desc: "You log your emotions and grade the trade as 'Perfect' or 'Imperfect' the exact second the order is placed. This detaches your journal from the hype of a win or frustration of a loss.",
      icon: BookOpen
    },
    {
      title: "Strict Accountability",
      desc: "You set a daily routine based on your strategy. Our floor mentor actively monitors your logs. Break your rules, and you are directly reminded to get back on track.",
      icon: ShieldCheck
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans text-zinc-100">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center space-y-4 shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-100 uppercase tracking-widest">Application Received</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your operational profile has been submitted. We review all applications strictly. If you meet the criteria for our founding cohort, we will contact you via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-6 sm:px-12 font-sans text-zinc-100 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 md:mb-20 text-center md:text-left border-b border-zinc-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Terminal Access Application</h1>
          <p className="mt-3 text-zinc-400 max-w-2xl text-sm leading-relaxed">
            MyTraderDesk is not a signal group. It is an execution environment designed to eliminate emotional leakage and force strict, mechanical discipline.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: How the System Works */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">How The System Works</h2>
              
              <div className="relative border-l border-zinc-800/80 ml-3 space-y-10">
                {systemSteps.map((step, index) => (
                  <div key={index} className="relative pl-8">
                    {/* Timeline Node */}
                    <div className="absolute -left-[17px] top-1 bg-[#0a0a0a] p-1 rounded-full border border-zinc-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                      <step.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200 mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 sm:p-8 rounded-xl shadow-2xl h-fit sticky top-10">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">Operational Diagnostic</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Identity */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input required type="text" name="full_name" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input required type="email" name="email" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Section 2: Operational History */}
              <div className="space-y-5 border-t border-zinc-800/50 pt-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Years Actively Trading</label>
                  <input required type="text" name="trading_experience" placeholder="e.g., 3 years" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Current Strategy Definition</label>
                  <textarea required name="current_strategy" rows={3} placeholder="Timeframes, setups, indicators, session focus..." onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Strategy Mileage (Duration)</label>
                  <input required type="text" name="strategy_duration" placeholder="e.g., 6 months" onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all" />
                </div>
              </div>

              {/* Section 3: Diagnostics */}
              <div className="space-y-5 border-t border-zinc-800/50 pt-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Primary Profitability Blocker</label>
                  <textarea required name="profitability_blocker" rows={2} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Psychological Hurdles</label>
                  <textarea required name="psychological_hurdles" rows={2} placeholder="e.g., FOMO, moving stops, overtrading..." onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Target Objective</label>
                  <textarea required name="target_objective" rows={2} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 p-3 text-sm leading-relaxed focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-y" />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <button disabled={isSubmitting} type="submit" className="w-full bg-zinc-100 text-zinc-900 font-bold uppercase tracking-widest text-xs rounded-md py-4 hover:bg-white transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Transmitting Data...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
