import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Info, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { PermissionInfo, RiskLevel } from '../data/permissions';
import { RISK_LABELS } from '../data/permissions';

const RISK_STYLES: Record<RiskLevel, { border: string; badge: string; icon: React.ReactNode }> = {
  dangerous: {
    border: 'border-red-500/40 hover:border-red-400',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
  },
  signature: {
    border: 'border-orange-500/40 hover:border-orange-400',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  },
  normal: {
    border: 'border-green-500/30 hover:border-green-400',
    badge: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <ShieldCheck className="w-4 h-4 text-green-400" />,
  },
  unknown: {
    border: 'border-slate-600 hover:border-slate-500',
    badge: 'bg-slate-700 text-slate-400 border-slate-600',
    icon: <Info className="w-4 h-4 text-slate-400" />,
  },
};

interface Props {
  info: PermissionInfo;
}

export function PermissionCard({ info }: Props) {
  const [expanded, setExpanded] = useState(false);
  const style = RISK_STYLES[info.risk];

  return (
    <div
      className={`bg-slate-800/60 border rounded-xl transition-all duration-200 cursor-pointer ${style.border}`}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-mono text-sm font-medium truncate">{info.shortName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${style.badge}`}>
              {RISK_LABELS[info.risk]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 flex-shrink-0">
              {info.category}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">{info.description}</p>
        </div>
        <div className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700/50 px-4 pb-4 pt-3 space-y-3" onClick={e => e.stopPropagation()}>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">What it accesses</p>
            <p className="text-sm text-slate-200">{info.dataAccess}</p>
          </div>
          {info.realWorldAbuse && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1">Real-world abuse</p>
              <p className="text-sm text-red-200">{info.realWorldAbuse}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 font-mono">{info.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
