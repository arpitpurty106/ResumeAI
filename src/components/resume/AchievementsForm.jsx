import React from 'react';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import { createAchievementEntry } from '../../utils/resumeUtils.js';

export default function AchievementsForm({ items = [], onChange }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createAchievementEntry()]);

  return (
    <SectionCard
      title="Achievements"
      description="Awards, honors, and notable accomplishments"
      icon={Trophy}
      actions={<button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={14} /> Add</button>}
      defaultOpen={items.length > 0}
    >
      {items.length === 0 && <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">No achievements added yet.</p>}
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-lg border border-ink-200 p-4 space-y-2 bg-ink-50/40">
            <div>
              <label className="label">Achievement Title</label>
              <input className="input" value={a.title} placeholder="Hackathon Winner — HackTX 2022" onChange={(e) => update(a.id, { title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea min-h-[60px]" value={a.description} placeholder="Brief context and impact" onChange={(e) => update(a.id, { description: e.target.value })} />
            </div>
            <div className="flex justify-end">
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(a.id)} aria-label="Delete achievement"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
