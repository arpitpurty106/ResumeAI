import React from 'react';
import { Briefcase, Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import AiButton from '../ui/AiButton.jsx';
import { useToast } from '../ui/Toast.jsx';
import { createExperienceEntry, reorderArray } from '../../utils/resumeUtils.js';
import * as aiService from '../../services/aiService.js';

export default function ExperienceForm({ items = [], onChange }) {
  const toast = useToast();

  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createExperienceEntry()]);
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    onChange(reorderArray(items, index, target));
  };

  const updateBullet = (expId, bulletIdx, value) => {
    const exp = items.find((e) => e.id === expId);
    const bullets = [...exp.bullets];
    bullets[bulletIdx] = value;
    update(expId, { bullets });
  };
  const addBullet = (expId) => {
    const exp = items.find((e) => e.id === expId);
    update(expId, { bullets: [...exp.bullets, ''] });
  };
  const removeBullet = (expId, bulletIdx) => {
    const exp = items.find((e) => e.id === expId);
    update(expId, { bullets: exp.bullets.filter((_, i) => i !== bulletIdx) });
  };

  const runBulletAi = async (fn, expId, bulletIdx, text) => {
    const result = await fn(text);
    updateBullet(expId, bulletIdx, result.text);
    if (result.warning) toast.info(result.warning);
  };

  return (
    <SectionCard
      title="Work Experience"
      description="Your professional history, most recent first"
      icon={Briefcase}
      actions={<button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={14} /> Add</button>}
    >
      {items.length === 0 && <EmptyHint text="No experience added yet. Click Add to create your first entry." />}
      <div className="space-y-5">
        {items.map((exp, index) => (
          <div key={exp.id} className="rounded-lg border border-ink-200 p-4 space-y-3 bg-ink-50/40">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 text-ink-300 pt-2">
                <GripVertical size={14} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="label">Job Title</label>
                  <input className="input" value={exp.jobTitle} placeholder="Software Engineer" onChange={(e) => update(exp.id, { jobTitle: e.target.value })} />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={exp.company} placeholder="Acme Corp" onChange={(e) => update(exp.id, { company: e.target.value })} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={exp.location} placeholder="Austin, TX" onChange={(e) => update(exp.id, { location: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="label">Start Date</label>
                    <input className="input" value={exp.startDate} placeholder="Jun 2023" onChange={(e) => update(exp.id, { startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      className="input"
                      value={exp.current ? 'Present' : exp.endDate}
                      disabled={exp.current}
                      placeholder="Aug 2024"
                      onChange={(e) => update(exp.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <button type="button" className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => move(index, -1)} aria-label="Move up" disabled={index === 0}>
                  <ChevronUp size={15} />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => move(index, 1)} aria-label="Move down" disabled={index === items.length - 1}>
                  <ChevronDown size={15} />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(exp.id)} aria-label="Delete experience">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={exp.current} onChange={(e) => update(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} />
              I currently work here
            </label>

            <div>
              <label className="label">Description / Bullet Points</label>
              <div className="space-y-2">
                {exp.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="space-y-1.5">
                    <div className="flex gap-2 items-start">
                      <textarea
                        className="textarea min-h-[52px] flex-1"
                        value={bullet}
                        placeholder="Describe what you did, the tools you used, and the outcome"
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                      />
                      <button type="button" className="p-2 rounded hover:bg-red-50 text-red-500 shrink-0" onClick={() => removeBullet(exp.id, bIdx)} aria-label="Remove bullet">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-0.5">
                      <AiButton label="Improve Bullet" onRun={() => runBulletAi(aiService.improveBullet, exp.id, bIdx, bullet)} />
                      <AiButton label="Action-Oriented" onRun={() => runBulletAi(aiService.makeActionOriented, exp.id, bIdx, bullet)} />
                      <AiButton label="Add Impact" onRun={() => runBulletAi(aiService.addQuantifiableImpact, exp.id, bIdx, bullet)} />
                      <AiButton label="ATS-Friendly" onRun={() => runBulletAi(aiService.makeAtsFriendly, exp.id, bIdx, bullet)} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-ghost btn-sm mt-2" onClick={() => addBullet(exp.id)}>
                <Plus size={13} /> Add bullet
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function EmptyHint({ text }) {
  return <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">{text}</p>;
}
