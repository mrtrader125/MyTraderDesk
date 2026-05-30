import { Activity } from 'lucide-react';

export default function InsightsWidget({ voices = [] }) {
  const total = voices.length;
  
  const getPercentage = (friction) => {
    if (total === 0) return '0%';
    const count = voices.filter(v => v.core_friction === friction).length;
    return `${Math.round((count / total) * 100)}%`;
  };

  const stats = [
    { label: 'Discipline', value: getPercentage('Lack of discipline') },
    { label: 'Overtrading', value: getPercentage('Overtrading') },
    { label: 'FOMO', value: getPercentage('FOMO') },
    { label: 'Consistency', value: getPercentage('Inconsistent execution') },
  ];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-zinc-400" />
          <h2 className="text-zinc-200 text-sm font-medium uppercase tracking-wider">Most Common Challenges</h2>
        </div>
        <span className="text-zinc-500 text-xs font-mono">Total Posts: {total}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-zinc-800/50 rounded p-3">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1 truncate">{stat.label}</p>
            <p className="text-zinc-100 font-mono text-lg">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
