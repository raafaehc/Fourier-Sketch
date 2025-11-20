import { memo } from 'react';

export type CoefTableProps = {
  title: string;
  values: number[];
};

export const CoefTable = memo(({ title, values }: CoefTableProps) => {
  return (
    <div className="glass-card rounded-3xl border border-white/5 p-4">
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span className="font-medium text-white">{title}</span>
        <span aria-live="polite">Top {values.length} terms</span>
      </div>
      <div className="max-h-56 overflow-auto text-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted">
              <th className="py-1">k</th>
              <th className="py-1">value</th>
            </tr>
          </thead>
          <tbody>
            {values.map((value, index) => (
              <tr key={index} className="border-t border-white/5 text-white">
                <td className="py-1">{index + 1}</td>
                <td className="py-1">{value.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

CoefTable.displayName = 'CoefTable';
