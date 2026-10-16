import React, { useState } from 'react';
import { Wrench, X } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import AiButton from '../ui/AiButton.jsx';
import { useToast } from '../ui/Toast.jsx';
import * as aiService from '../../services/aiService.js';

const CATEGORIES = [
  { key: 'technical', label: 'Technical Skills', placeholder: 'e.g. JavaScript, SQL' },
  { key: 'soft', label: 'Soft Skills', placeholder: 'e.g. Communication, Leadership' },
  { key: 'tools', label: 'Tools', placeholder: 'e.g. Figma, Docker' },
  { key: 'languages', label: 'Languages', placeholder: 'e.g. English, Spanish' },
];

export default function SkillsForm({ skills, onChange, resumeContext }) {
  const toast = useToast();

  const addSkill = (category, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if ((skills[category] || []).some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange({ ...skills, [category]: [...(skills[category] || []), trimmed] });
  };
  const removeSkill = (category, skill) => {
    onChange({ ...skills, [category]: skills[category].filter((s) => s !== skill) });
  };

  const handleSuggest = async () => {
    const existing = [
      ...(skills.technical || []), ...(skills.tools || []),
    ];
    const result = await aiService.suggestSkills({
      existingSkills: existing,
      roleHint: resumeContext?.targetRole || resumeContext?.personalInfo?.title || '',
      experienceText: (resumeContext?.experience || []).map((e) => e.bullets.join(' ')).join(' '),
    });
    if (result.warning) toast.info(result.warning);
    if (result.skills.length === 0) {
      toast.info('No new skill suggestions found — try adding more detail to your experience first.');
      return;
    }
    onChange({ ...skills, technical: [...new Set([...(skills.technical || []), ...result.skills])] });
    toast.success(`Added ${result.skills.length} suggested skill(s) to Technical Skills. Remove any that don't apply.`);
  };

  return (
    <SectionCard title="Skills" description="Technical, soft, tools, and languages" icon={Wrench}>
      <div className="space-y-4">
        {CATEGORIES.map((cat) => (
          <TagInput
            key={cat.key}
            label={cat.label}
            placeholder={cat.placeholder}
            values={skills[cat.key] || []}
            onAdd={(v) => addSkill(cat.key, v)}
            onRemove={(v) => removeSkill(cat.key, v)}
          />
        ))}
      </div>
      <AiButton label="Suggest Relevant Skills" onRun={handleSuggest} />
      <p className="text-xs text-ink-400">
        AI only suggests skills reasonably implied by your experience — always remove anything you don't actually have.
      </p>
    </SectionCard>
  );
}

function TagInput({ label, placeholder, values, onAdd, onRemove }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    onAdd(draft);
    setDraft('');
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="badge-blue">
            {v}
            <button type="button" onClick={() => onRemove(v)} aria-label={`Remove ${v}`}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        placeholder={`${placeholder} (press Enter to add)`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={() => draft && commit()}
      />
    </div>
  );
}
