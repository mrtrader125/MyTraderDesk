import { useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function OperatorCard({ id, experience_level, core_friction, raw_log, required_infrastructure, relates_count }) {
  const [localRelates, setLocalRelates] = useState(relates_count || 0);
  const [hasRelated, setHasRelated] = useState(false);

  const handleRelate = async () => {
    if (hasRelated) return;
    setLocalRelates(prev => prev + 1);
    setHasRelated(true);

    const { data } = await supabase.from('trader_diagnostics').select('relates_count').eq('id', id).single();
    if (data) {
      await supabase.from('trader_diagnostics').update({ relates_count: data.relates_count + 1 }).eq('id', id);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-zinc-100 font-mono text-sm">Operator #{id.split('-')[0]}</h3>
          <p className="text-zinc-500 text-xs mt-1">Experience: {experience_level}</p>
        </div>
        <span className="bg-red-950/50 text-red-400 border border-red-900/50 px-2 py-1 rounded text-xs font-mono uppercase tracking-wider">
          [{core_friction}]
        </span>
      </div>
      
      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
        {raw_log}
      </div>
      
      <div className="flex justify-between items-end mt-2 pt-4 border-t border-zinc-800/50">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Targeting Infrastructure</p>
          <p className="text-zinc-200 text-sm font-medium">{required_infrastructure}</p>
        </div>
        <button 
          onClick={handleRelate}
          disabled={hasRelated}
          className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded border transition-colors ${
            hasRelated 
            ? 'text-red-400 bg-red-950/20 border-red-900/50' 
            : 'text-zinc-400 bg-zinc-950 border-zinc-800 hover:text-red-400 hover:border-red-900/50'
          }`}
        >
          <Heart size={14} className={hasRelated ? "fill-red-400" : ""} />
          I Relate ({localRelates})
        </button>
      </div>
    </div>
  );
}
