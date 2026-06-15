import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getPermissionInfo, CATEGORY_COLORS, RISK_COLORS, type PermissionCategory } from '../data/permissions';

interface Props {
  permissions: string[];
}

export function PermissionChart({ permissions }: Props) {
  const infos = permissions.map(getPermissionInfo);

  // Risk distribution
  const riskCounts: Record<string, number> = { dangerous: 0, normal: 0, signature: 0, unknown: 0 };
  infos.forEach(i => riskCounts[i.risk]++);
  const riskData = Object.entries(riskCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: RISK_COLORS[name as keyof typeof RISK_COLORS] }));

  // Category distribution
  const catCounts: Partial<Record<PermissionCategory, number>> = {};
  infos.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const catData = Object.entries(catCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name as PermissionCategory] }));

  // Radar: risk profile per category
  const dangerousCats = infos.filter(i => i.risk === 'dangerous');
  const radarCats = [...new Set(dangerousCats.map(i => i.category))].slice(0, 8);
  const radarData = radarCats.map(cat => ({
    category: cat,
    count: dangerousCats.filter(i => i.category === cat).length,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color }}>{payload[0].value} permission{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Risk Donut */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-1">Risk Distribution</h3>
        <p className="text-slate-400 text-xs mb-4">Permissions grouped by risk level</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
              {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {riskData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}: <span className="font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Bar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 md:col-span-1 xl:col-span-1">
        <h3 className="text-white font-semibold mb-1">By Category</h3>
        <p className="text-slate-400 text-xs mb-4">Number of permissions per category</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={catData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar: Danger profile */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-1">Danger Profile</h3>
        <p className="text-slate-400 text-xs mb-4">Dangerous permission count per category</p>
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="Dangerous" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
            <p className="text-sm">No dangerous permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
