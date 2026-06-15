import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { getPermissionInfo, CATEGORY_COLORS, RISK_COLORS, type PermissionCategory } from '../data/permissions';

interface Props {
  permissions: string[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm shadow-2xl backdrop-blur-xl">
      <p className="font-bold text-white mb-0.5">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.color }} className="font-semibold">
        {payload[0].value} permission{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export function PermissionChart({ permissions }: Props) {
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
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name as PermissionCategory] }));

  const dangerousCats = infos.filter(i => i.risk === 'dangerous');
  const radarCats = [...new Set(dangerousCats.map(i => i.category))].slice(0, 8);
  const radarData = radarCats.map(cat => ({
    category: cat,
    count: dangerousCats.filter(i => i.category === cat).length,
  }));

  const cardCls = 'backdrop-blur-xl bg-white/[0.03] border border-white/8 rounded-2xl p-5';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* Risk Donut */}
      <div className={cardCls}>
        <p className="text-white font-bold text-sm mb-0.5">Risk Distribution</p>
        <p className="text-slate-500 text-xs mb-4">Permissions by risk level</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={riskData}
              cx="50%" cy="46%"
              innerRadius={65} outerRadius={95}
              dataKey="value"
              paddingAngle={4}
              strokeWidth={0}
            >
              {riskData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
          {riskData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-slate-500">{d.name}</span>
              <span className="font-black text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Bar */}
      <div className={cardCls}>
        <p className="text-white font-bold text-sm mb-0.5">By Category</p>
        <p className="text-slate-500 text-xs mb-4">Permission count per category</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={catData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#475569', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Danger Radar */}
      <div className={cardCls}>
        <p className="text-white font-bold text-sm mb-0.5">Danger Profile</p>
        <p className="text-slate-500 text-xs mb-4">Dangerous permissions by category</p>
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff08" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#334155', fontSize: 8 }} axisLine={false} />
              <Radar
                name="Dangerous"
                dataKey="count"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-green-400 font-semibold text-sm">No dangerous permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
