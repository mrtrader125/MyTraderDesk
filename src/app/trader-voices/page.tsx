"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import InsightsWidget from '../../components/trader-voices/InsightsWidget';
import OperatorCard from '../../components/trader-voices/OperatorCard';
import LogDiagnosticModal from '../../components/trader-voices/LogDiagnosticModal';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function TraderVoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVoices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('trader_diagnostics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setVoices(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 mb-2">Trader Voices</h1>
            <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
              Share what's holding you back, what support you need, and learn from traders facing similar challenges.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-md font-medium text-sm hover:bg-white transition-colors whitespace-nowrap"
          >
            Share Your Voice
          </button>
        </div>

        {/* Global Stats */}
        <InsightsWidget voices={voices} />

        {/* Navigation Tabs */}
        <div className="flex gap-6 border-b border-zinc-800 mb-6">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'explore' ? 'text-zinc-100 border-b-2 border-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Explore Voices
          </button>
          <button 
            onClick={() => setActiveTab('success')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'success' ? 'text-zinc-100 border-b-2 border-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Success Stories
          </button>
        </div>

        {/* Feed Section */}
        {activeTab === 'explore' && (
          isLoading ? (
            <div className="flex justify-center py-20 text-zinc-500">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-20 border border-zinc-800 border-dashed rounded-lg">
              <p className="text-zinc-500">No stories yet. Be the first to share your voice.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <OperatorCard key={voice.id} {...voice} />
              ))}
            </div>
          )
        )}

        {activeTab === 'success' && (
          <div className="text-center py-20 border border-zinc-800 border-dashed rounded-lg">
            <p className="text-zinc-500">Success stories are coming soon.</p>
          </div>
        )}

        {/* Modal Entry Point */}
        <LogDiagnosticModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchVoices}
        />
        
      </div>
    </div>
  );
}
