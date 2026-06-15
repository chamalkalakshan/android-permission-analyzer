import { ShieldAlert, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SuspiciousPattern } from '../data/suspiciousPatterns';

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    badge: 'bg-red-500 text-white',
    icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
    label: 'CRITICAL',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    badge: 'bg-orange-500 text-white',
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    label: 'HIGH',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-500 text-black',
    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    label: 'MEDIUM',
  },
};

function PatternCard({ pattern }: { pattern: SuspiciousPattern }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[pattern.severity];

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${cfg.bg} ${cfg.border}`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-shrink-0">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
            <span className="text-white font-semibold">{pattern.title}</span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{pattern.description}</p>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700/50 p-4 space-y-3">
          <p className="text-slate-200 text-sm">{pattern.description}</p>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Triggered by</p>
            <div className="flex flex-wrap gap-2">
              {pattern.permissions.map(p => (
                <span key={p} className="text-xs font-mono bg-slate-900 border border-slate-600 text-slate-300 px-2 py-1 rounded-lg">
                  {p.split('.').pop()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Recommendation</p>
            <p className="text-sm text-slate-200">{pattern.recommendation}</p>
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
  const critical = patterns.filter(p => p.severity === 'critical').length;
  const high = patterns.filter(p => p.severity === 'high').length;
  const medium = patterns.filter(p => p.severity === 'medium').length;

  if (patterns.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <p className="text-green-400 font-semibold text-lg">No Suspicious Patterns Detected</p>
        <p className="text-slate-400 text-sm mt-1">This app's permission combinations look reasonable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-2">
        {critical > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-400 text-sm font-medium">{critical} Critical</span>
          </div>
        )}
        {high > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-orange-400 text-sm font-medium">{high} High</span>
          </div>
        )}
        {medium > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-yellow-400 text-sm font-medium">{medium} Medium</span>
          </div>
        )}
      </div>

      {patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
    </div>
  );
}
