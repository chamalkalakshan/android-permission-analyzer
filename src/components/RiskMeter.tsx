interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskMeter({ score, size = 'md' }: Props) {
  const v = Math.min(Math.max(score, 0), 100);

  const { label, color, gradient } =
    v >= 70 ? { label: 'High Risk',      color: '#ef4444', gradient: 'linear-gradient(90deg,#22c55e,#eab308,#f97316,#ef4444)' } :
    v >= 40 ? { label: 'Moderate Risk',  color: '#f97316', gradient: 'linear-gradient(90deg,#22c55e,#eab308,#f97316)' } :
    v >= 15 ? { label: 'Low-Moderate',   color: '#eab308', gradient: 'linear-gradient(90deg,#22c55e,#eab308)' } :
              { label: 'Low Risk',       color: '#22c55e', gradient: 'linear-gradient(90deg,#22c55e,#4ade80)' };

  const h = size === 'lg' ? 14 : size === 'sm' ? 6 : 10;
  const fs = size === 'lg' ? '0.9rem' : size === 'sm' ? '0.7rem' : '0.8rem';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: h, borderRadius: h, background: 'var(--s2)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${v}%`,
          borderRadius: h,
          background: gradient,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: fs, fontWeight: 700, color }}>{label}</span>
        <span style={{ fontSize: fs, color: 'var(--t2)' }}>
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>{v}</span>
          <span style={{ color: 'var(--t4)' }}>/100</span>
        </span>
      </div>
    </div>
  );
}
