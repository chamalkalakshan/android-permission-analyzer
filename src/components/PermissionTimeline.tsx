import { getPermissionInfo, RISK_COLORS, type PermissionCategory, CATEGORY_COLORS } from '../data/permissions';

interface Props {
  permissions: string[];
}

// Groups permissions by category in a timeline-style display
export function PermissionTimeline({ permissions }: Props) {
  const byCategory: Partial<Record<PermissionCategory, string[]>> = {};
  permissions.forEach(p => {
    const info = getPermissionInfo(p);
    if (!byCategory[info.category]) byCategory[info.category] = [];
    byCategory[info.category]!.push(p);
  });

  const entries = Object.entries(byCategory) as [PermissionCategory, string[]][];
  entries.sort(([, a], [, b]) => {
    // Sort by most dangerous first
    const dangerCount = (perms: string[]) => perms.filter(p => getPermissionInfo(p).risk === 'dangerous').length;
    return dangerCount(b) - dangerCount(a);
  });

  return (
    <div className="space-y-4">
      {entries.map(([category, perms]) => {
        const catColor = CATEGORY_COLORS[category];
        const dangerCount = perms.filter(p => getPermissionInfo(p).risk === 'dangerous').length;
        return (
          <div key={category} className="relative pl-6">
            {/* Vertical line */}
            <div
              className="absolute left-2 top-4 bottom-0 w-0.5"
              style={{ backgroundColor: catColor + '40' }}
            />
            {/* Dot */}
            <div
              className="absolute left-0 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: catColor, backgroundColor: catColor + '20' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
            </div>

            <div className="bg-slate-800/50 border rounded-xl p-4 mb-2" style={{ borderColor: catColor + '30' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{category}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: catColor + 'AA' }}>
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {dangerCount > 0 && (
                  <span className="text-xs text-red-400 font-medium">{dangerCount} dangerous</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {perms.map(p => {
                  const info = getPermissionInfo(p);
                  return (
                    <span
                      key={p}
                      className="text-xs px-2 py-1 rounded-lg font-mono border"
                      style={{
                        color: RISK_COLORS[info.risk],
                        borderColor: RISK_COLORS[info.risk] + '40',
                        backgroundColor: RISK_COLORS[info.risk] + '10',
                      }}
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
