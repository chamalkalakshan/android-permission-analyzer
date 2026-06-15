import { useState, useMemo } from 'react';
import {
  ShieldAlert, BarChart2, List, Download, RotateCcw,
  Package, Search, GitBranch, Shield,
} from 'lucide-react';
import type { ParsedManifest } from '../utils/apkParser';
import { getPermissionInfo, type RiskLevel, type PermissionCategory, CATEGORY_COLORS } from '../data/permissions';
import { detectSuspiciousPatterns } from '../data/suspiciousPatterns';
import { PermissionCard } from './PermissionCard';
import { PermissionChart } from './PermissionChart';
import { SuspiciousPanel } from './SuspiciousPanel';
import { PermissionTimeline } from './PermissionTimeline';
import { RiskMeter } from './RiskMeter';
import { ThemeToggle } from './ThemeToggle';
import { generatePdfReport } from '../utils/pdfGenerator';

type Tab = 'overview' | 'permissions' | 'suspicious' | 'timeline' | 'components';

const CARD = { background: 'var(--s1)', border: '1px solid var(--s2)' };

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl p-5" style={CARD}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--t4)' }}>{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--t5)' }}>{sub}</p>}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={CARD}>
      <p className="text-[10px] font-medium uppercase tracking-widest mb-0.5" style={{ color: 'var(--t4)' }}>{label}</p>
      <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{value}</p>
    </div>
  );
}

export function Dashboard({ manifest, fileName, onReset }: { manifest: ParsedManifest; fileName: string; onReset: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [catFilter, setCatFilter] = useState<PermissionCategory | 'all'>('all');

  const patterns = useMemo(() => detectSuspiciousPatterns(manifest.permissions), [manifest.permissions]);
  const allInfos = useMemo(() => manifest.permissions.map(getPermissionInfo), [manifest.permissions]);

  const filtered = useMemo(() => allInfos.filter(info => {
    const s = search.toLowerCase();
    return (!s || info.shortName.toLowerCase().includes(s) || info.description.toLowerCase().includes(s))
      && (riskFilter === 'all' || info.risk === riskFilter)
      && (catFilter === 'all' || info.category === catFilter);
  }), [allInfos, search, riskFilter, catFilter]);

  const dangerous = allInfos.filter(i => i.risk === 'dangerous').length;
  const critical = patterns.filter(p => p.severity === 'critical').length;
  const riskScore = Math.min(critical * 30 + patterns.filter(p => p.severity === 'high').length * 15 + patterns.filter(p => p.severity === 'medium').length * 5, 100);

  const riskBadge = riskScore >= 70
    ? { label: 'HIGH RISK', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
    : riskScore >= 40
    ? { label: 'MODERATE', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' }
    : riskScore >= 15
    ? { label: 'LOW-MOD', color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)' }
    : { label: 'LOW RISK', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' };

  const categories = [...new Set(allInfos.map(i => i.category))];

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',     label: 'Overview',     icon: <BarChart2  className="w-4 h-4" /> },
    { id: 'permissions',  label: 'Permissions',  icon: <List       className="w-4 h-4" />, badge: manifest.permissions.length },
    { id: 'suspicious',   label: 'Suspicious',   icon: <ShieldAlert className="w-4 h-4" />, badge: patterns.length },
    { id: 'timeline',     label: 'Timeline',     icon: <GitBranch  className="w-4 h-4" /> },
    { id: 'components',   label: 'Components',   icon: <Package    className="w-4 h-4" /> },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: 'rgba(9,9,11,0.85)', borderBottom: '1px solid var(--s2)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-none truncate" style={{ color: 'var(--t1)' }}>{manifest.packageName}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--t4)' }}>{fileName}</p>
            </div>
            <span
              className="hidden sm:inline text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ color: riskBadge.color, background: riskBadge.bg, border: `1px solid ${riskBadge.border}` }}
            >
              {riskBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePdfReport(manifest, patterns, fileName)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <ThemeToggle />
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--s3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--s3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--s2)')}
            >
              <RotateCcw className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Permissions" value={manifest.permissions.length}
            sub={`${categories.length} categories`} color="#818cf8" />
          <StatCard label="Dangerous" value={dangerous}
            sub={`${Math.round((dangerous / (manifest.permissions.length || 1)) * 100)}% of total`}
            color={dangerous > 0 ? '#ef4444' : '#22c55e'} />
          <StatCard label="Suspicious Patterns" value={patterns.length}
            sub={critical > 0 ? `${critical} critical` : patterns.length === 0 ? 'All clear' : 'None critical'}
            color={patterns.length > 0 ? '#f97316' : '#22c55e'} />
          <StatCard label="Risk Score" value={riskScore}
            sub={riskBadge.label.toLowerCase()} color={riskBadge.color} />
        </div>

        {/* Risk meter */}
        <div className="rounded-2xl p-5" style={CARD}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--t1)' }}>Risk Assessment</p>
          <RiskMeter score={riskScore} size="md" />
        </div>

        {/* App meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoPill label="Package" value={manifest.packageName} />
          <InfoPill label="Version" value={`${manifest.versionName} (${manifest.versionCode})`} />
          <InfoPill label="Min SDK" value={manifest.minSdkVersion} />
          <InfoPill label="Target SDK" value={manifest.targetSdkVersion} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--s1)', border: '1px solid var(--s2)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150"
              style={tab === t.id
                ? { background: '#6366f1', color: '#fff' }
                : { color: 'var(--t3)' }
              }
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--t2)'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--t3)'; }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className="rounded-full text-[10px] px-1.5 py-0.5 font-bold"
                  style={tab === t.id ? { background: 'rgba(255,255,255,0.2)' } : { background: 'var(--s2)', color: 'var(--t3)' }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}

        {tab === 'overview' && <PermissionChart permissions={manifest.permissions} />}

        {tab === 'permissions' && (
          <div className="space-y-4">
            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--t4)' }} />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: 'var(--s1)', border: '1px solid var(--s2)', color: 'var(--t1)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--s2)')}
                />
              </div>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
                className="rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'var(--s1)', border: '1px solid var(--s2)', color: 'var(--t2)', minWidth: 130 }}
              >
                <option value="all">All risk levels</option>
                <option value="dangerous">Dangerous</option>
                <option value="normal">Normal</option>
                <option value="signature">Signature</option>
                <option value="unknown">Unknown</option>
              </select>
              <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value as PermissionCategory | 'all')}
                className="rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: 'var(--s1)', border: '1px solid var(--s2)', color: 'var(--t2)', minWidth: 140 }}
              >
                <option value="all">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Category color chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(catFilter === cat ? 'all' : cat as PermissionCategory)}
                  className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 transition-all font-medium"
                  style={catFilter === cat
                    ? { background: 'var(--s2)', color: 'var(--t1)', border: '1px solid var(--t4)' }
                    : { background: 'var(--s1)', color: 'var(--t3)', border: '1px solid var(--s2)' }
                  }
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[cat as PermissionCategory] }} />
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-xs" style={{ color: 'var(--t4)' }}>
              {filtered.length} of {manifest.permissions.length} permissions
            </p>

            <div className="space-y-2">
              {filtered.map(info => <PermissionCard key={info.name} info={info} />)}
              {filtered.length === 0 && (
                <div className="rounded-2xl p-12 text-center" style={CARD}>
                  <Search className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--t5)' }} />
                  <p style={{ color: 'var(--t4)' }}>No permissions match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'suspicious' && <SuspiciousPanel patterns={patterns} />}

        {tab === 'timeline' && <PermissionTimeline permissions={manifest.permissions} />}

        {tab === 'components' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Activities',          items: manifest.activities,  color: '#818cf8', desc: 'UI screens & entry points' },
              { label: 'Services',            items: manifest.services,    color: '#fb923c', desc: 'Background operations' },
              { label: 'Broadcast Receivers', items: manifest.receivers,   color: '#c084fc', desc: 'System event listeners' },
              { label: 'Content Providers',   items: manifest.providers,   color: '#22d3ee', desc: 'Data sharing interfaces' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5" style={CARD}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold" style={{ color: 'var(--t1)' }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t4)' }}>{s.desc}</p>
                  </div>
                  <span className="text-3xl font-black" style={{ color: s.color }}>{s.items.length}</span>
                </div>
                {s.items.length > 0 ? (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {s.items.map((item, i) => (
                      <div key={i} className="rounded-lg px-3 py-2" style={{ background: 'var(--bg)' }}>
                        <span className="text-xs font-mono" style={{ color: 'var(--t2)' }}>
                          {item.split('.').slice(-2).join('.')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--t5)' }}>None declared</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-8 mt-6" style={{ borderTop: '1px solid var(--s1)' }}>
        <p className="text-xs" style={{ color: 'var(--s2)' }}>
          Android Permission Analyzer - all analysis runs locally in your browser
        </p>
      </footer>
    </div>
  );
}
