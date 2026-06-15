import { ShieldAlert, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { SuspiciousPattern } from '../data/suspiciousPatterns';

const SEV = {
  critical: {
    bar: '#f43f5e',
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    glow: 'shadow-rose-500/15',
    badge: 'bg-rose-500 text-white',
    text: 'text-rose-400',
    label: 'CRITICAL',
  },
  high: {
    bar: '#fb923c',
    bg: 'bg-orange-500/8',
    border: 'border-orange-500/20',
    glow: 'shadow-orange-500/10',
    badge: 'bg-orange-500 text-white',
    text: 'text-orange-400',
    label: 'HIGH',
  },
  medium: {
    bar: '#facc15',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/15',
    glow: '',
    badge: 'bg-yellow-400 text-black',
    text: 'text-yellow-400',
    label: 'MEDIUM',
  },
};

function PatternCard({ pattern }: { pattern: SuspiciousPattern }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEV[pattern.severity];

  return (
    <div
      className={`relative border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${s.bg} ${s.border} ${pattern.severity === 'critical' ? `shadow-lg ${s.glow}` : ''} hover:border-opacity-50`}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Left severity bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: s.bar }} />

      <div className="flex items-center gap-4 px-5 py-4 pl-6">
        <div className="flex-shrink-0">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-widest ${s.badge}`}>
            {s.label}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-snug">{pattern.title}</p>
          <p className={`text-xs mt-0.5 line-clamp-1 ${s.text} opacity-80`}>{pattern.description}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      {expanded && (
        <div
          className="border-t border-white/5 px-6 pb-4 pt-3 space-y-3 bg-white/[0.02]"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-sm text-slate-300 leading-relaxed">{pattern.description}</p>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Triggered by</p>
            <div className="flex flex-wrap gap-2">
              {pattern.permissions.map(p => (
                <span
                  key={p}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg border"
                  style={{ color: s.bar, borderColor: s.bar + '30', backgroundColor: s.bar + '10' }}
                >
                  {p.split('.').pop()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Recommendation</p>
            <p className="text-sm text-slate-200 leading-relaxed">{pattern.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  patterns: SuspiciousPattern[];
}

export function SuspiciousPanel({ patterns }: Props) {
  const counts = {
    critical: patterns.filter(p => p.severity === 'critical').length,
    high: patterns.filter(p => p.severity === 'high').length,
    medium: patterns.filter(p => p.severity === 'medium').length,
  };

  if (patterns.length === 0) {
    return (
      <div className="bg-green-500/8 border border-green-500/20 rounded-3xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-green-400 font-bold text-lg">No Suspicious Patterns Detected</p>
        <p className="text-slate-500 text-sm mt-1">Permission combinations look reasonable for this app.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 pb-2">
        {counts.critical > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {counts.critical} Critical
          </span>
        )}
        {counts.high > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {counts.high} High
          </span>
        )}
        {counts.medium > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            {counts.medium} Medium
          </span>
        )}
      </div>

      {patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
    </div>
  );
}
