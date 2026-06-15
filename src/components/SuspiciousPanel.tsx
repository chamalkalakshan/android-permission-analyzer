import { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import type { SuspiciousPattern } from '../data/suspiciousPatterns';

const SEV = {
  critical: { bar: '#ef4444', color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'CRITICAL' },
  high:     { bar: '#f97316', color: '#fb923c', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', label: 'HIGH' },
  medium:   { bar: '#eab308', color: '#facc15', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.2)',  label: 'MEDIUM' },
};

function PatternCard({ p }: { p: SuspiciousPattern }) {
  const [open, setOpen] = useState(false);
  const s = SEV[p.severity];

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-colors duration-150"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
      onClick={() => setOpen(v => !v)}
    >
      <div className="flex items-center gap-0">
        <div className="w-1 self-stretch flex-shrink-0 rounded-l-xl" style={{ background: s.bar }} />
        <div className="flex items-center gap-3 px-4 py-3.5 flex-1 min-w-0">
          <span
            className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ background: s.bar, color: '#fff' }}
          >
            {s.label}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">{p.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: s.color, opacity: 0.75 }}>{p.description}</p>
          </div>
          <ChevronDown
            className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            style={{ color: '#52525b', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </div>
      </div>

      {open && (
        <div
          className="px-5 pb-4 pt-3 space-y-3"
          style={{ borderTop: `1px solid ${s.border}`, background: 'rgba(0,0,0,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{p.description}</p>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>
              Triggered by
            </p>
            <div className="flex flex-wrap gap-2">
              {p.permissions.map(perm => (
                <span
                  key={perm}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg"
                  style={{ color: s.color, background: `${s.bar}18`, border: `1px solid ${s.bar}35` }}
                >
                  {perm.split('.').pop()}
                </span>
              ))}
            </div>
          </div>
          <div
            className="rounded-xl p-3.5"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#818cf8' }}>
              Recommendation
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#c7d2fe' }}>{p.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuspiciousPanel({ patterns }: { patterns: SuspiciousPattern[] }) {
  if (patterns.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <div
          className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)' }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: '#4ade80' }} />
        </div>
        <p className="font-bold text-lg" style={{ color: '#4ade80' }}>No Suspicious Patterns Detected</p>
        <p className="text-sm mt-1" style={{ color: '#52525b' }}>Permission combinations look reasonable.</p>
      </div>
    );
  }

  const counts = { critical: 0, high: 0, medium: 0 };
  patterns.forEach(p => counts[p.severity]++);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-1">
        {counts.critical > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
            style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
            {counts.critical} Critical
          </span>
        )}
        {counts.high > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
            style={{ color: '#fb923c', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
            {counts.high} High
          </span>
        )}
        {counts.medium > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5"
            style={{ color: '#facc15', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
            {counts.medium} Medium
          </span>
        )}
      </div>
      {patterns.map(p => <PatternCard key={p.id} p={p} />)}
    </div>
  );
}
