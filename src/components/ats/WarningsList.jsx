import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WarningsList({ warnings }) {
  return (
    <div className="card p-5 space-y-5">
      <h3 className="section-title">Recommendations</h3>

      {warnings.high.length > 0 && (
        <Group title="High Priority" icon={AlertOctagon} colorClass="text-red-600" bgClass="bg-red-50" items={warnings.high} />
      )}
      {warnings.medium.length > 0 && (
        <Group title="Medium Priority" icon={AlertTriangle} colorClass="text-amber-600" bgClass="bg-amber-50" items={warnings.medium} />
      )}
      {warnings.good.length > 0 && (
        <Group title="Good" icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-emerald-50" items={warnings.good} />
      )}

      {warnings.high.length === 0 && warnings.medium.length === 0 && (
        <p className="text-sm text-ink-500">No major issues detected. Nice work!</p>
      )}
    </div>
  );
}

function Group({ title, icon: Icon, colorClass, bgClass, items }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5 ${colorClass}`}>
        <Icon size={13} /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`text-sm text-ink-700 rounded-lg px-3 py-2 ${bgClass}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
