import { useState, useMemo } from 'react';
import {
  ShieldAlert, FileText, BarChart2, List,
  Download, RotateCcw, Package, Search, Filter,
} from 'lucide-react';
import type { ParsedManifest } from '../utils/apkParser';
import { getPermissionInfo, RISK_COLORS, type RiskLevel, type PermissionCategory, CATEGORY_COLORS } from '../data/permissions';
import { detectSuspiciousPatterns } from '../data/suspiciousPatterns';
import { PermissionCard } from './PermissionCard';
import { PermissionChart } from './PermissionChart';
import { SuspiciousPanel } from './SuspiciousPanel';
import { generatePdfReport } from '../utils/pdfGenerator';

type Tab = 'overview' | 'permissions' | 'suspicious' | 'components';

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

  const filtered = useMemo(() => {
    return allInfos.filter(info => {
      const matchSearch = !search || info.shortName.toLowerCase().includes(search.toLowerCase()) || info.description.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'all' || info.risk === riskFilter;
      const matchCat = categoryFilter === 'all' || info.category === categoryFilter;
      return matchSearch && matchRisk && matchCat;
    });
  }, [allInfos, search, riskFilter, categoryFilter]);

  const dangerous = allInfos.filter(i => i.risk === 'dangerous').length;
  const critical = patterns.filter(p => p.severity === 'critical').length;

  const riskScore = Math.min(
    critical * 30 + patterns.filter(p => p.severity === 'high').length * 15 + patterns.filter(p => p.severity === 'medium').length * 5,
    100
  );

  const riskLabel = riskScore >= 60 ? 'High Risk' : riskScore >= 30 ? 'Moderate Risk' : 'Low Risk';
  const riskColor = riskScore >= 60 ? 'text-red-400' : riskScore >= 30 ? 'text-orange-400' : 'text-green-400';
  const riskBarColor = riskScore >= 60 ? 'bg-red-500' : riskScore >= 30 ? 'bg-orange-500' : 'bg-green-500';

  const categories = [...new Set(allInfos.map(i => i.category))];

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <List className="w-4 h-4" />, badge: manifest.permissions.length },
    { id: 'suspicious', label: 'Suspicious', icon: <ShieldAlert className="w-4 h-4" />, badge: patterns.length },
    { id: 'components', label: 'Components', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{manifest.appName}</p>
              <p className="text-slate-400 text-xs truncate">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generatePdfReport(manifest, patterns, fileName)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF Report
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Permissions', value: manifest.permissions.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Dangerous', value: dangerous, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'Suspicious Patterns', value: patterns.length, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Risk Score', value: `${riskScore}/100`, color: riskColor, bg: 'bg-slate-800 border-slate-700' },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Risk score bar */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-medium">Overall Risk Assessment</span>
            <span className={`text-sm font-bold ${riskColor}`}>{riskLabel}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all duration-700 ${riskBarColor}`} style={{ width: `${riskScore}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Low</span><span>Moderate</span><span>High</span>
          </div>
        </div>

        {/* App info strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Package', value: manifest.packageName },
            { label: 'Version', value: `${manifest.versionName} (${manifest.versionCode})` },
            { label: 'Min SDK', value: manifest.minSdkVersion },
            { label: 'Target SDK', value: manifest.targetSdkVersion },
          ].map(i => (
            <div key={i.label} className="bg-slate-800/40 border border-slate-700 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500">{i.label}</p>
              <p className="text-sm text-white font-medium truncate">{i.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-slate-700'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <PermissionChart permissions={manifest.permissions} />
        )}

        {tab === 'permissions' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search permissions…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={riskFilter}
                    onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="all">All risks</option>
                    <option value="dangerous">Dangerous</option>
                    <option value="normal">Normal</option>
                    <option value="signature">Signature</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as PermissionCategory | 'all')}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="all">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Category color legend */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat as PermissionCategory)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${categoryFilter === cat ? 'border-white/30 bg-white/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat as PermissionCategory] }} />
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-slate-500 text-xs">{filtered.length} of {manifest.permissions.length} permissions</p>

            <div className="space-y-2">
              {filtered.map(info => <PermissionCard key={info.name} info={info} />)}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No permissions match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'suspicious' && (
          <SuspiciousPanel patterns={patterns} />
        )}

        {tab === 'components' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'Activities', items: manifest.activities, color: 'indigo', desc: 'UI screens and entry points' },
              { label: 'Services', items: manifest.services, color: 'orange', desc: 'Background operations' },
              { label: 'Broadcast Receivers', items: manifest.receivers, color: 'purple', desc: 'System event listeners' },
              { label: 'Content Providers', items: manifest.providers, color: 'cyan', desc: 'Data sharing interfaces' },
            ].map(section => (
              <div key={section.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{section.label}</h3>
                    <p className="text-slate-400 text-xs">{section.desc}</p>
                  </div>
                  <span className="text-2xl font-bold text-slate-400">{section.items.length}</span>
                </div>
                {section.items.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {section.items.map((item, i) => (
                      <div key={i} className="bg-slate-900/60 rounded-lg px-3 py-1.5">
                        <span className="text-slate-300 text-xs font-mono">{item.split('.').slice(-2).join('.')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">None declared</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-12 py-6 text-center">
        <p className="text-slate-600 text-sm">Android Permission Analyzer — all analysis runs locally in your browser</p>
      </div>
    </div>
  );
}
