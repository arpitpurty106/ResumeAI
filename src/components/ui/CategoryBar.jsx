import React from 'react';

export default function CategoryBar({ label, percent = 0, points, maxPoints }) {
  const clamped = Math.max(0, Math.min(100, percent));
  let color = 'bg-red-500';
  if (clamped >= 80) color = 'bg-emerald-500';
  else if (clamped >= 60) color = 'bg-amber-500';
  else if (clamped >= 40) color = 'bg-orange-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-ink-700">{label}</span>
        <span className="text-xs font-medium text-ink-500">
          {points !== undefined ? `${points}/${maxPoints}` : `${clamped}%`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
