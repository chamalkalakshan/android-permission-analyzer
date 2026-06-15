interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskMeter({ score, size = 'md' }: Props) {
  const clamped = Math.min(Math.max(score, 0), 100);

  const label =
    clamped >= 70 ? 'High Risk' :
    clamped >= 40 ? 'Moderate Risk' :
    clamped >= 15 ? 'Low-Moderate' :
    'Low Risk';

  const labelColor =
    clamped >= 70 ? '#f43f5e' :
    clamped >= 40 ? '#fb923c' :
    clamped >= 15 ? '#facc15' :
    '#4ade80';

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="w-full">
      <div className={`relative w-full ${heights[size]} rounded-full overflow-hidden bg-white/5`}>
        {/* Gradient track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: clamped >= 70
              ? 'linear-gradient(90deg, #4ade80, #facc15, #fb923c, #f43f5e)'
              : clamped >= 40
              ? 'linear-gradient(90deg, #4ade80, #facc15, #fb923c)'
              : clamped >= 15
              ? 'linear-gradient(90deg, #4ade80, #facc15)'
              : 'linear-gradient(90deg, #4ade80, #86efac)',
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className={`${textSizes[size]} font-bold`} style={{ color: labelColor }}>{label}</span>
        <span className={`${textSizes[size]} font-black text-slate-300`}>{clamped}<span className="text-slate-600 font-normal">/100</span></span>
      </div>
    </div>
  );
}
