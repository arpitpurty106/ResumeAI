import React from 'react';

export default function ScoreRing({ score = 0, size = 128, strokeWidth = 10, label = 'ATS Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  let color = '#ef4444';
  if (clamped >= 80) color = '#10b981';
  else if (clamped >= 60) color = '#f59e0b';
  else if (clamped >= 40) color = '#f97316';

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${clamped} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef0f3" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="50%" y="47%" textAnchor="middle" fontSize={size * 0.26} fontWeight="700" fill="#161a24">
          {clamped}
        </text>
        <text x="50%" y="65%" textAnchor="middle" fontSize={size * 0.09} fill="#657186">
          / 100
        </text>
      </svg>
      <p className="text-sm font-medium text-ink-600 mt-1">{label}</p>
    </div>
  );
}
