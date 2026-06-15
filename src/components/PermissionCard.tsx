import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PermissionInfo, RiskLevel } from '../data/permissions';
import { RISK_LABELS } from '../data/permissions';

const RISK_CONFIG: Record<RiskLevel, { bar: string; badge: string; badgeText: string; glow: string }> = {
  dangerous: {
    bar: '#f43f5e',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    badgeText: 'text-rose-400',
    glow: 'hover:shadow-rose-500/10',
  },
  signature: {
    bar: '#fb923c',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    badgeText: 'text-orange-400',
    glow: 'hover:shadow-orange-500/10',
  },
  normal: {
    bar: '#4ade80',
    badge: 'bg-green-500/15 text-green-400 border-green-500/25',
    badgeText: 'text-green-400',
    glow: 'hover:shadow-green-500/10',
  },
  unknown: {
    bar: '#475569',
    badge: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
    badgeText: 'text-slate-400',
    glow: '',
  },
};

interface Props {
  info: PermissionInfo;
}

export function PermissionCard({ info }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RISK_CONFIG[info.risk];

  return (
    <div
      className={`group relative bg-white/[0.03] backdrop-blur-sm border border-white/8 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-white/[0.05] hover:border-white/15 hover:shadow-lg ${cfg.glow}`}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Left risk bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200" style={{ backgroundColor: cfg.bar }} />

      <div className="flex items-center gap-3 px-5 py-3.5 pl-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-white font-bold text-sm tracking-tight truncate">{info.shortName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${cfg.badge}`}>
              {RISK_LABELS[info.risk]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-400 flex-shrink-0">
              {info.category}
            </span>
          </div>
          <p className="text-slate-500 text-xs leading-snug truncate">{info.description}</p>
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
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">What it can access</p>
            <p className="text-sm text-slate-300 leading-relaxed">{info.dataAccess}</p>
          </div>
          {info.realWorldAbuse && (
            <div className="bg-rose-500/8 border border-rose-500/15 rounded-xl p-3">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">Real-world abuse</p>
              <p className="text-sm text-rose-200/80 leading-relaxed">{info.realWorldAbuse}</p>
            </div>
          )}
          <p className="text-[10px] text-slate-600 font-mono pt-1">{info.name}</p>
        </div>
      )}
    </div>
  );
}
