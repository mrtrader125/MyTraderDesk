'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Settings, CalendarDays, Bookmark, LineChart, 
  Activity, Crosshair, PenTool, ClipboardCheck, ShieldAlert 
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
    directional_bias: '',   // NEW: For the bias question
    risk_management: '',    // NEW: For the stop loss/target question
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
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Page Header */}
        <header className="border-b border-zinc-800 pb-6 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight">Terminal Access Application</h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            We strictly curate our user base to intermediate operators who are ready to implement rigid, systemic control. Review the operational protocol below, then complete the diagnostic to apply.
          </p>
        </header>

        {/* How The System Works Section */}
        <section className="space-y-8">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-center">How The System Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <Settings className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">1. Day One Setup</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The moment you register, you are guided step-by-step to build your specific daily routine and mechanical trading system.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <CalendarDays className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">2. The Sunday Prep</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every Sunday, we release the weekly direction and hard invalidation levels for the highest-probability Forex, Commodity, and Crypto pairs.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <Bookmark className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">3. The Vault</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You filter the noise. Pick the specific pairs you are actively trading and save them to your Vault for daily tracking.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <LineChart className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">4. Daily Chart Updates</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We update the primary pairs daily on the 4H chart. When a setup looks highly probable, we drop down to the lower timeframes for precise entry zones.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <Activity className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">5. Live Floor Validation</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clean entries are posted to the Live Floor. Members vote "Aligned" or "Counter." If our bias matches your strategy, execute. If it clashes, reduce risk or sit out.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <Crosshair className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">6. Mechanical Execution</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No random adjustments. Define Entry, Stop Loss, Take Profit, and one alert for Break-Even. Once placed, touch nothing until a target or alert is hit.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <PenTool className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">7. Pre-Outcome Journaling</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log emotions and grade the trade as "Perfect" or "Imperfect" the second the order is placed, completely detached from the outcome.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <ClipboardCheck className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">8. The Saturday Review</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Wind down every Saturday by reviewing logged trades. Use your execution data to identify mistakes and refine your plan for the upcoming week.
              </p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-3">
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-100">9. Active Mentorship</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our floor mentor monitors your profile. If you break your rules or drift from your routine, you are directly assisted to get back on track.
              </p>
            </div>

          </div>
        </section>

        <div className="w-full h-px bg-zinc-800"></div>

        {/* Application Form */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Operator Diagnostic Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Identity */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Identity</h3>
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
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Operational History</h3>
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

            {/* Section 3: System Mechanics */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">System Mechanics</h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-300">How does your strategy determine market direction?</label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input required type="radio" name="directional_bias" value="Strict Bias System" onChange={handleChange} className="form-radio mt-0.5 text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-zinc-500 focus:ring-offset-zinc-950" />
                    <span className="text-sm text-zinc-400">My system provides a strict directional bias before I look for entries.</span>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input required type="radio" name="directional_bias" value="Real-time / Gut Feeling" onChange={handleChange} className="form-radio mt-0.5 text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-zinc-500 focus:ring-offset-zinc-950" />
                    <span className="text-sm text-zinc-400">I decide the direction based on real-time price movement and gut feeling.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-sm font-medium text-zinc-300">When do you define your stop-loss, targets, and breakeven levels?</label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input required type="radio" name="risk_management" value="Pre-defined Levels" onChange={handleChange} className="form-radio mt-0.5 text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-zinc-500 focus:ring-offset-zinc-950" />
                    <span className="text-sm text-zinc-400">Levels are strictly calculated and defined before I enter the trade.</span>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input required type="radio" name="risk_management" value="Manual Management" onChange={handleChange} className="form-radio mt-0.5 text-zinc-100 bg-zinc-950 border-zinc-800 focus:ring-zinc-500 focus:ring-offset-zinc-950" />
                    <span className="text-sm text-zinc-400">I manage my exits manually while the trade is running.</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Diagnostics */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-3">Diagnostics</h3>
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
    </div>
  );
}
