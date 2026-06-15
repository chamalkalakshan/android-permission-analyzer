import { useState, useMemo } from 'react';
import {
  ShieldAlert, BarChart2, List,
  Download, RotateCcw, Package, Search, GitBranch,
  Shield, Cpu, Activity, AlertOctagon,
} from 'lucide-react';
import type { ParsedManifest } from '../utils/apkParser';
import { getPermissionInfo, type RiskLevel, type PermissionCategory, CATEGORY_COLORS } from '../data/permissions';
import { detectSuspiciousPatterns } from '../data/suspiciousPatterns';
import { PermissionCard } from './PermissionCard';
import { PermissionChart } from './PermissionChart';
import { SuspiciousPanel } from './SuspiciousPanel';
import { PermissionTimeline } from './PermissionTimeline';
import { RiskMeter } from './RiskMeter';
import { generatePdfReport } from '../utils/pdfGenerator';

type Tab = 'overview' | 'permissions' | 'suspicious' | 'timeline' | 'components';

interface Props {
  manifest: ParsedManifest;
  fileName: string;
  onReset: () => void;
}

export function Dashboard({ manifest, fileName, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<PermissionCategory | 'all'>('all');

  const patterns = useMemo(() => detectSuspiciousPatterns(manifest.permissions), [manifest.permissions]);
  const allInfos = useMemo(() => manifest.permissions.map(getPermissionInfo), [manifest.permissions]);

  const filtered = useMemo(() => allInfos.filter(info => {
    const matchSearch = !search || info.shortName.toLowerCase().includes(search.toLowerCase()) || info.description.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'all' || info.risk === riskFilter;
    const matchCat = categoryFilter === 'all' || info.category === categoryFilter;
    return matchSearch && matchRisk && matchCat;
  }), [allInfos, search, riskFilter, categoryFilter]);

  const dangerous = allInfos.filter(i => i.risk === 'dangerous').length;
  const critical = patterns.filter(p => p.severity === 'critical').length;

  const riskScore = Math.min(
    critical * 30 + patterns.filter(p => p.severity === 'high').length * 15 + patterns.filter(p => p.severity === 'medium').length * 5,
    100
  );

  const riskLabel = riskScore >= 70 ? 'HIGH RISK' : riskScore >= 40 ? 'MODERATE' : riskScore >= 15 ? 'LOW-MOD' : 'LOW RISK';
  const riskLabelColor = riskScore >= 70 ? 'text-rose-400 bg-rose-500/15 border-rose-500/25' : riskScore >= 40 ? 'text-orange-400 bg-orange-500/15 border-orange-500/25' : 'text-green-400 bg-green-500/15 border-green-500/25';

  const categories = [...new Set(allInfos.map(i => i.category))];

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'permissions', label: 'Permissions', icon: <List className="w-3.5 h-3.5" />, badge: manifest.permissions.length },
    { id: 'suspicious', label: 'Suspicious', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: patterns.length },
    { id: 'timeline', label: 'Timeline', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'components', label: 'Components', icon: <Package className="w-3.5 h-3.5" /> },
  ];

  const statCards = [
    {
      label: 'Total Permissions',
      value: manifest.permissions.length,
      sub: `${categories.length} categories`,
      icon: <Shield className="w-5 h-5" />,
      color: '#818cf8',
      bar: 'from-indigo-500/20 to-violet-500/10',
    },
    {
      label: 'Dangerous',
      value: dangerous,
      sub: `${Math.round((dangerous / (manifest.permissions.length || 1)) * 100)}% of total`,
      icon: <AlertOctagon className="w-5 h-5" />,
      color: '#f43f5e',
      bar: 'from-rose-500/20 to-rose-500/5',
    },
    {
      label: 'Suspicious Patterns',
      value: patterns.length,
      sub: critical > 0 ? `${critical} critical` : 'None critical',
      icon: <Activity className="w-5 h-5" />,
      color: patterns.length > 0 ? '#fb923c' : '#4ade80',
      bar: patterns.length > 0 ? 'from-orange-500/20 to-orange-500/5' : 'from-green-500/20 to-green-500/5',
    },
    {
      label: 'Risk Score',
      value: riskScore,
      sub: riskLabel,
      icon: <Cpu className="w-5 h-5" />,
      color: riskScore >= 70 ? '#f43f5e' : riskScore >= 40 ? '#fb923c' : '#4ade80',
      bar: riskScore >= 70 ? 'from-rose-500/20 to-rose-500/5' : riskScore >= 40 ? 'from-orange-500/20 to-orange-500/5' : 'from-green-500/20 to-green-500/5',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate leading-none">{manifest.appName !== 'Unknown' ? manifest.appName : manifest.packageName}</p>
              <p className="text-slate-600 text-[11px] truncate mt-0.5">{fileName}</p>
            </div>
            <span className={`hidden sm:inline text-[10px] font-black px-2.5 py-1 rounded-lg border tracking-wider flex-shrink-0 ${riskLabelColor}`}>
              {riskLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePdfReport(manifest, patterns, fileName)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <Download className="w-3.5 h-3.5" /> PDF Report
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/8 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div
              key={s.label}
              className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${s.bar} border border-white/8 rounded-2xl p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-500 text-xs font-medium">{s.label}</p>
                <span style={{ color: s.color }} className="opacity-60">{s.icon}</span>
              </div>
              <p className="text-3xl font-black text-white leading-none mb-1">{s.value}</p>
              <p className="text-xs font-medium" style={{ color: s.color }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Risk meter */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-sm">Overall Risk Assessment</p>
            <span className="text-slate-500 text-xs">{manifest.permissions.length} permissions analyzed</span>
          </div>
          <RiskMeter score={riskScore} size="md" />
        </div>

        {/* App info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Package', value: manifest.packageName },
            { label: 'Version', value: `${manifest.versionName} (${manifest.versionCode})` },
            { label: 'Min SDK', value: `API ${manifest.minSdkVersion}` },
            { label: 'Target SDK', value: `API ${manifest.targetSdkVersion}` },
          ].map(i => (
            <div key={i.label} className="bg-white/[0.025] border border-white/6 rounded-xl px-4 py-3">
              <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mb-1">{i.label}</p>
              <p className="text-sm text-white font-semibold truncate">{i.value}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/8 rounded-2xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                tab === t.id
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? 'bg-white/20' : 'bg-white/5'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && <PermissionChart permissions={manifest.permissions} />}

        {tab === 'permissions' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="Search permissions…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                />
              </div>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
                className="bg-white/[0.03] border border-white/8 rounded-full px-4 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-indigo-500/50 appearance-none"
              >
                <option value="all">All risks</option>
                <option value="dangerous">Dangerous</option>
                <option value="normal">Normal</option>
                <option value="signature">Signature</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat as PermissionCategory)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    categoryFilter === cat
                      ? 'border-white/20 bg-white/10 text-white font-semibold'
                      : 'border-white/6 text-slate-500 hover:border-white/12 hover:text-slate-300'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat as PermissionCategory] }} />
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-slate-600 text-xs">{filtered.length} of {manifest.permissions.length} permissions shown</p>

            <div className="space-y-2">
              {filtered.map(info => <PermissionCard key={info.name} info={info} />)}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No permissions match your filters</p>
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
              { label: 'Activities', items: manifest.activities, color: '#818cf8', desc: 'UI screens & entry points' },
              { label: 'Services', items: manifest.services, color: '#fb923c', desc: 'Background operations' },
              { label: 'Broadcast Receivers', items: manifest.receivers, color: '#c084fc', desc: 'System event listeners' },
              { label: 'Content Providers', items: manifest.providers, color: '#22d3ee', desc: 'Data sharing interfaces' },
            ].map(section => (
              <div key={section.label} className="backdrop-blur-xl bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">{section.label}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{section.desc}</p>
                  </div>
                  <span
                    className="text-3xl font-black"
                    style={{ color: section.color }}
                  >
                    {section.items.length}
                  </span>
                </div>
                {section.items.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {section.items.map((item, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2">
                        <span className="text-slate-400 text-xs font-mono">{item.split('.').slice(-2).join('.')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-700 text-sm">None declared</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 mt-12 py-6 text-center">
        <p className="text-slate-700 text-xs">Android Permission Analyzer · All analysis runs locally in your browser</p>
      </div>
    </div>
  );
}
