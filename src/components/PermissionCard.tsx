import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PermissionInfo, RiskLevel } from '../data/permissions';
import { RISK_LABELS } from '../data/permissions';

const RISK: Record<RiskLevel, { bar: string; badge: string; badgeBg: string }> = {
  dangerous: { bar: '#ef4444', badge: '#fca5a5', badgeBg: 'rgba(239,68,68,0.12)' },
  signature: { bar: '#f97316', badge: '#fdba74', badgeBg: 'rgba(249,115,22,0.12)' },
  normal:    { bar: '#22c55e', badge: '#86efac', badgeBg: 'rgba(34,197,94,0.12)'  },
  unknown:   { bar: '#52525b', badge: '#a1a1aa', badgeBg: 'rgba(82,82,91,0.2)'   },
};

export function PermissionCard({ info }: { info: PermissionInfo }) {
  const [open, setOpen] = useState(false);
  const r = RISK[info.risk];

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-colors duration-150"
      style={{ background: 'var(--s1)', border: '1px solid var(--s2)' }}
      onClick={() => setOpen(v => !v)}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--s3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--s2)')}
    >
      <div className="flex items-center gap-0 pl-0">
        {/* Left risk bar */}
        <div className="w-1 self-stretch flex-shrink-0 rounded-l-xl" style={{ background: r.bar }} />

        <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate" style={{ color: 'var(--t1)' }}>{info.shortName}</span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ color: r.badge, background: r.badgeBg }}
              >
                {RISK_LABELS[info.risk]}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ color: 'var(--t3)', background: 'var(--s2)' }}
              >
                {info.category}
              </span>
            </div>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t4)' }}>{info.description}</p>
          </div>
          <ChevronDown
            className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            style={{ color: 'var(--t5)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </div>

      {open && (
        <div
          className="px-5 pb-4 pt-3 space-y-3"
          style={{ borderTop: '1px solid var(--s2)', background: 'var(--bg)' }}
          onClick={e => e.stopPropagation()}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--t4)' }}>
              What it can access
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>{info.dataAccess}</p>
          </div>
          {info.realWorldAbuse && (
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#f87171' }}>
                Real-world abuse
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#fca5a5' }}>{info.realWorldAbuse}</p>
            </div>
          )}
          <p className="text-[10px] font-mono" style={{ color: 'var(--t5)' }}>{info.name}</p>
        </div>
      )}
    </div>
  );
}
