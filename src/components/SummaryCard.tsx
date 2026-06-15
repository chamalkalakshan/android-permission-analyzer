import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  color?: 'red' | 'orange' | 'green' | 'indigo' | 'slate';
}

const COLOR_MAP = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', value: 'text-red-400', icon: 'text-red-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', value: 'text-orange-400', icon: 'text-orange-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', value: 'text-green-400', icon: 'text-green-400' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', value: 'text-indigo-400', icon: 'text-indigo-400' },
  slate: { bg: 'bg-slate-800', border: 'border-slate-700', value: 'text-slate-200', icon: 'text-slate-400' },
};

export function SummaryCard({ title, value, subtitle, trend, trendText, color = 'slate' }: Props) {
  const c = COLOR_MAP[color];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={`border rounded-xl p-4 ${c.bg} ${c.border}`}>
      <p className="text-slate-400 text-xs mb-1">{title}</p>
      <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      {trendText && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${c.icon}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{trendText}</span>
        </div>
      )}
    </div>
  );
}
