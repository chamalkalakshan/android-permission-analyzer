import { getPermissionInfo, RISK_COLORS, type PermissionCategory, CATEGORY_COLORS } from '../data/permissions';

export function PermissionTimeline({ permissions }: { permissions: string[] }) {
  const byCategory: Partial<Record<PermissionCategory, string[]>> = {};
  permissions.forEach(p => {
    const info = getPermissionInfo(p);
    if (!byCategory[info.category]) byCategory[info.category] = [];
    byCategory[info.category]!.push(p);
  });

  const entries = (Object.entries(byCategory) as [PermissionCategory, string[]][])
    .sort(([, a], [, b]) => {
      const danger = (arr: string[]) => arr.filter(p => getPermissionInfo(p).risk === 'dangerous').length;
      return danger(b) - danger(a);
    });

  return (
    <div className="space-y-3 pl-2">
      {entries.map(([category, perms], idx) => {
        const color = CATEGORY_COLORS[category];
        const danger = perms.filter(p => getPermissionInfo(p).risk === 'dangerous').length;
        const isLast = idx === entries.length - 1;

        return (
          <div key={category} className="relative pl-6">
            {/* Vertical connector */}
            {!isLast && (
              <div className="absolute left-[7px] top-5 bottom-0 w-px" style={{ background: '#27272a' }} />
            )}
            {/* Dot */}
            <div
              className="absolute left-0 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: color, background: '#09090b' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            </div>

            <div className="rounded-xl p-4 mb-1" style={{ background: '#18181b', border: '1px solid #27272a' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{category}</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color, background: `${color}18` }}
                  >
                    {perms.length}
                  </span>
                </div>
                {danger > 0 && (
                  <span className="text-xs font-medium" style={{ color: '#ef4444' }}>{danger} dangerous</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {perms.map(p => {
                  const info = getPermissionInfo(p);
                  const rc = RISK_COLORS[info.risk];
                  return (
                    <span
                      key={p}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-lg"
                      style={{ color: rc, background: `${rc}12`, border: `1px solid ${rc}25` }}
                    >
                      {info.shortName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
