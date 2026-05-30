"use client";
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LogDiagnosticModal({ isOpen, onClose, onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    experience_level: 'Less than 6 months',
    core_friction: 'Overtrading',
    raw_log: '',
    required_infrastructure: 'Accountability partner',
    is_anonymous: true
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.raw_log.trim()) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from('trader_diagnostics').insert([formData]);
    setIsSubmitting(false);

    if (!error) {
      setFormData({ ...formData, raw_log: '' });
      onRefresh();
      onClose();
    } else {
      console.error("Supabase Error:", error);
      alert("Failed to post. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 p-4 flex justify-between items-center z-10">
          <h2 className="text-zinc-100 font-medium">Share Your Voice</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Experience */}
          <div>
            <label className="block text-zinc-400 text-sm mb-3">1. How long have you been trading?</label>
            <div className="flex flex-wrap gap-2">
              {['Less than 6 months', '6 months - 1 year', '1-2 years', '2-5 years', '5+ years'].map(exp => (
                <button 
                  key={exp} type="button" 
                  onClick={() => setFormData({...formData, experience_level: exp})}
                  className={`px-3 py-1.5 rounded border text-sm transition-colors ${formData.experience_level === exp ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'}`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* Friction */}
          <div>
            <label className="block text-zinc-400 text-sm mb-3">2. What is currently stopping you from becoming consistently profitable?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Overtrading', 'Revenge trading', 'Fear of taking trades', 'Lack of discipline', 'Risk management', 'Strategy hopping', 'FOMO', 'Emotional decision making', 'Lack of confidence', 'Inconsistent execution', 'Burnout'].map(friction => (
                <button 
                  key={friction} type="button" 
                  onClick={() => setFormData({...formData, core_friction: friction})}
                  className={`px-3 py-2 rounded border text-sm text-left transition-colors ${formData.core_friction === friction ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'}`}
                >
                  {friction}
                </button>
              ))}
            </div>
          </div>

          {/* Log */}
          <div>
            <label className="block text-zinc-400 text-sm mb-3">3. Describe your situation</label>
            <textarea 
              required
              value={formData.raw_log}
              onChange={(e) => setFormData({...formData, raw_log: e.target.value})}
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              placeholder="Tell us your story. What do you think is holding you back?"
            />
          </div>

          {/* Support */}
          <div>
            <label className="block text-zinc-400 text-sm mb-3">4. What support would help you most right now?</label>
            <select 
              value={formData.required_infrastructure}
              onChange={(e) => setFormData({...formData, required_infrastructure: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option>Accountability partner</option>
              <option>Mentor</option>
              <option>Trading community</option>
              <option>Psychology coaching</option>
              <option>Better strategy</option>
              <option>Risk management help</option>
              <option>Daily check-ins</option>
              <option>Trade reviews</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-between border-t border-zinc-800/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-zinc-100 accent-zinc-500" 
              />
              <span className="text-zinc-400 text-sm">Post Anonymously</span>
            </label>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-zinc-100 text-zinc-950 font-medium px-6 py-2 rounded hover:bg-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Share My Voice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
