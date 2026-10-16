import React from 'react';
import { GraduationCap, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import { createEducationEntry, reorderArray } from '../../utils/resumeUtils.js';

export default function EducationForm({ items = [], onChange }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createEducationEntry()]);
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    onChange(reorderArray(items, index, target));
  };

  return (
    <SectionCard
      title="Education"
      description="Degrees, institutions, and coursework"
      icon={GraduationCap}
      actions={<button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={14} /> Add</button>}
    >
      {items.length === 0 && <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">No education added yet.</p>}
      <div className="space-y-4">
        {items.map((ed, index) => (
          <div key={ed.id} className="rounded-lg border border-ink-200 p-4 space-y-3 bg-ink-50/40">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Degree</label>
                <input className="input" value={ed.degree} placeholder="B.S. in Computer Science" onChange={(e) => update(ed.id, { degree: e.target.value })} />
              </div>
              <div>
                <label className="label">Institution</label>
                <input className="input" value={ed.institution} placeholder="University Name" onChange={(e) => update(ed.id, { institution: e.target.value })} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" value={ed.location} placeholder="Austin, TX" onChange={(e) => update(ed.id, { location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Start Year</label>
                  <input className="input" value={ed.startYear} placeholder="2019" onChange={(e) => update(ed.id, { startYear: e.target.value })} />
                </div>
                <div>
                  <label className="label">End Year</label>
                  <input className="input" value={ed.endYear} placeholder="2023" onChange={(e) => update(ed.id, { endYear: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">GPA (optional)</label>
                <input className="input" value={ed.gpa} placeholder="3.7" onChange={(e) => update(ed.id, { gpa: e.target.value })} />
              </div>
              <div>
                <label className="label">Relevant Coursework (optional)</label>
                <input className="input" value={ed.coursework} placeholder="Data Structures, Algorithms" onChange={(e) => update(ed.id, { coursework: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-1">
              <button type="button" className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp size={15} /></button>
              <button type="button" className="p-1.5 rounded hover:bg-ink-100 text-ink-400" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><ChevronDown size={15} /></button>
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(ed.id)} aria-label="Delete education"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
