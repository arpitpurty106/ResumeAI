import React from 'react';
import { AlignLeft } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import AiButton from '../ui/AiButton.jsx';
import { useToast } from '../ui/Toast.jsx';
import * as aiService from '../../services/aiService.js';

export default function SummaryForm({ resume, onChange }) {
  const toast = useToast();
  const summary = resume.summary || '';

  const applyResult = (result) => {
    onChange(result.text);
    if (result.warning) toast.info(result.warning);
  };

  const topSkills = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.tools || []),
  ].slice(0, 5);

  return (
    <SectionCard title="Professional Summary" description="A 2-3 sentence overview of who you are" icon={AlignLeft}>
      <textarea
        className="textarea min-h-[120px]"
        placeholder="Write a brief professional summary, or use AI to generate one from your other resume details."
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Professional summary"
      />
      <div className="flex flex-wrap gap-2">
        <AiButton
          label="Generate Summary"
          onRun={async () => applyResult(await aiService.generateSummary({
            title: resume.personalInfo?.title, targetRole: resume.targetRole, topSkills,
          }))}
        />
        <AiButton
          label="Improve Summary"
          onRun={async () => applyResult(await aiService.improveSummary(summary))}
        />
        <AiButton
          label="Make More Professional"
          onRun={async () => applyResult(await aiService.makeSummaryMoreProfessional(summary))}
        />
        <AiButton
          label="Make More Concise"
          onRun={async () => applyResult(await aiService.makeSummaryMoreConcise(summary))}
        />
      </div>
    </SectionCard>
  );
}
