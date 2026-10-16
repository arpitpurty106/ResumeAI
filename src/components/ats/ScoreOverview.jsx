import React from 'react';
import ScoreRing from '../ui/ScoreRing.jsx';
import CategoryBar from '../ui/CategoryBar.jsx';

const CATEGORY_LABELS = {
  contact: 'Contact Information',
  completeness: 'Section Completeness',
  keywordMatch: 'Keyword Match',
  skillsMatch: 'Skills Match',
  experienceRelevance: 'Experience Relevance',
  formatting: 'Formatting',
  actionVerbs: 'Action Verbs',
  readability: 'Readability',
  quantifiable: 'Quantifiable Achievements',
};

export default function ScoreOverview({ report }) {
  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={report.totalScore} size={140} label="ATS Score" />
        <div className="flex-1 w-full space-y-3">
          {Object.entries(report.categoryScores).map(([key, points]) => (
            <CategoryBar
              key={key}
              label={CATEGORY_LABELS[key] || key}
              percent={report.categoryPercents[key]}
              points={points}
              maxPoints={report.weights[key]}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-400 mt-5 pt-4 border-t border-ink-100">
        This score reflects a deterministic, rule-based local analysis of structure, keywords, and formatting.
        Real ATS platforms vary by vendor and company — a high score improves your odds but is not a guarantee of an interview.
      </p>
    </div>
  );
}
