interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskMeter({ score, size = 'md' }: Props) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const segments = 10;
  const filled = Math.round((clamped / 100) * segments);

  const color =
    clamped >= 70 ? '#ef4444' :
    clamped >= 40 ? '#f97316' :
    clamped >= 20 ? '#eab308' :
    '#22c55e';

  const label =
    clamped >= 70 ? 'High Risk' :
    clamped >= 40 ? 'Moderate' :
    clamped >= 20 ? 'Low-Moderate' :
    'Low Risk';

  const sizeMap = {
    sm: { bar: 'h-1.5', text: 'text-xs', gap: 'gap-0.5' },
    md: { bar: 'h-2.5', text: 'text-sm', gap: 'gap-1' },
    lg: { bar: 'h-4', text: 'text-base', gap: 'gap-1.5' },
  };
  const s = sizeMap[size];

  return (
    <div className="w-full">
      <div className={`flex ${s.gap}`}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full ${s.bar} transition-all duration-500`}
            style={{ backgroundColor: i < filled ? color : '#334155' }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className={`${s.text} font-bold`} style={{ color }}>{label}</span>
        <span className={`${s.text} text-slate-400`}>{clamped}/100</span>
      </div>
    </div>
  );
}
