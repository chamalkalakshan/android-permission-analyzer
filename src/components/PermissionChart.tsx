import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getPermissionInfo, CATEGORY_COLORS, RISK_COLORS, type PermissionCategory } from '../data/permissions';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--s1)',
  border: '1px solid var(--s3)',
  borderRadius: 10,
  color: 'var(--t1)',
  fontSize: 13,
  padding: '8px 12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--s1)', border: '1px solid var(--s2)' }}>
      <p className="font-bold mb-0.5" style={{ color: 'var(--t1)' }}>{title}</p>
      {subtitle && <p className="text-xs mb-4" style={{ color: 'var(--t4)' }}>{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

export function PermissionChart({ permissions }: { permissions: string[] }) {
  const infos = permissions.map(getPermissionInfo);

  const riskCounts: Record<string, number> = { dangerous: 0, normal: 0, signature: 0, unknown: 0 };
  infos.forEach(i => riskCounts[i.risk]++);
  const riskData = Object.entries(riskCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: RISK_COLORS[name as keyof typeof RISK_COLORS],
    }));

  const catCounts: Partial<Record<PermissionCategory, number>> = {};
  infos.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const catData = Object.entries(catCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name as PermissionCategory] }));

  const dangerByCategory: Partial<Record<PermissionCategory, number>> = {};
  infos.filter(i => i.risk === 'dangerous').forEach(i => {
    dangerByCategory[i.category] = (dangerByCategory[i.category] || 0) + 1;
  });
  const radarData = Object.entries(dangerByCategory).slice(0, 7).map(([cat, count]) => ({ category: cat, count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <ChartCard title="Risk Distribution" subtitle="Permissions by risk level">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={3} strokeWidth={0}>
              {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
          {riskData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--t2)' }}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span>{d.name}</span>
              <span className="font-bold" style={{ color: 'var(--t1)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="By Category" subtitle="Permission count per category">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={catData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--s2)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--t3)', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              {catData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Danger Profile" subtitle="Dangerous permissions per category">
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--s2)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--t3)', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--t5)', fontSize: 8 }} axisLine={false} />
              <Radar dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-sm" style={{ color: 'var(--t4)' }}>
            No dangerous permissions found
          </div>
        )}
      </ChartCard>
    </div>
  );
}
