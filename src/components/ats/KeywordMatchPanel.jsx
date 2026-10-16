import React from 'react';
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react';

export default function KeywordMatchPanel({ jdMatch }) {
  if (!jdMatch) {
    return (
      <div className="card p-5">
        <h3 className="section-title mb-2">Job Description Matching</h3>
        <p className="text-sm text-ink-500">Paste a job description in the scan form to see matched, missing, and partial keywords here.</p>
      </div>
    );
  }

  const { jdKeywords, matched, missing, partial, recommendations, matchPercent } = jdMatch;

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="section-title">Job Description Matching</h3>
        {matchPercent !== null && <span className="badge-blue">{matchPercent}% match</span>}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <KeywordGroup title="Matched" icon={CheckCircle2} colorClass="text-emerald-600" words={matched} />
        <KeywordGroup title="Partial Matches" icon={CircleDashed} colorClass="text-amber-600" words={partial} />
        <KeywordGroup title="Missing" icon={XCircle} colorClass="text-red-600" words={missing} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-ink-100">
        <CategoryTags label="Required Skills / Tools" words={jdKeywords.requiredSkills} />
        <CategoryTags label="Preferred Skills" words={jdKeywords.preferredSkills} />
        <CategoryTags label="Job Titles Mentioned" words={jdKeywords.jobTitles} />
        <CategoryTags label="Soft Skills" words={jdKeywords.softSkills} />
        <CategoryTags label="Education Mentioned" words={jdKeywords.education} />
        <CategoryTags label="Domain Keywords" words={jdKeywords.domainKeywords} />
      </div>

      {recommendations.length > 0 && (
        <div className="pt-2 border-t border-ink-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Recommendations</p>
          <ul className="space-y-1.5">
            {recommendations.map((r, i) => (
              <li key={i} className="text-sm text-ink-700 bg-ink-50 rounded-lg px-3 py-2">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function KeywordGroup({ title, icon: Icon, colorClass, words }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1 ${colorClass}`}>
        <Icon size={13} /> {title} ({words.length})
      </p>
      <div className="flex flex-wrap gap-1">
        {words.length === 0 && <span className="text-xs text-ink-300">None</span>}
        {words.slice(0, 20).map((w) => <span key={w} className="badge-gray text-[11px]">{w}</span>)}
      </div>
    </div>
  );
}

function CategoryTags({ label, words }) {
  if (!words || words.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-ink-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {words.map((w) => <span key={w} className="badge-blue text-[11px]">{w}</span>)}
      </div>
    </div>
  );
}
