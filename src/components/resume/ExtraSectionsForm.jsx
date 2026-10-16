import React, { useState } from 'react';
import { Layers, Plus, Trash2, X } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import { createPublicationEntry, createSimpleEntry } from '../../utils/resumeUtils.js';

const SIMPLE_SECTIONS = [
  { key: 'volunteer', label: 'Volunteer Experience' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'extracurricular', label: 'Extracurricular Activities' },
];

export default function ExtraSectionsForm({ resume, onChangeField }) {
  return (
    <SectionCard title="Extra Sections" description="Optional: publications, volunteer, leadership, languages, interests" icon={Layers} defaultOpen={false}>
      <PublicationsBlock items={resume.publications || []} onChange={(v) => onChangeField('publications', v)} />
      {SIMPLE_SECTIONS.map((s) => (
        <SimpleBlock
          key={s.key}
          label={s.label}
          items={resume[s.key] || []}
          onChange={(v) => onChangeField(s.key, v)}
        />
      ))}
      <InterestsBlock items={resume.interests || []} onChange={(v) => onChangeField('interests', v)} />
    </SectionCard>
  );
}

function PublicationsBlock({ items, onChange }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createPublicationEntry()]);

  return (
    <div className="border-t border-ink-100 pt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink-700">Publications / Research</p>
        <button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={13} /> Add</button>
      </div>
      <div className="space-y-3">
        {items.map((pub) => (
          <div key={pub.id} className="rounded-lg border border-ink-200 p-3 grid sm:grid-cols-2 gap-2 bg-ink-50/40">
            <input className="input" placeholder="Title" value={pub.title} onChange={(e) => update(pub.id, { title: e.target.value })} />
            <input className="input" placeholder="Publisher / Journal" value={pub.publisher} onChange={(e) => update(pub.id, { publisher: e.target.value })} />
            <input className="input" placeholder="Date" value={pub.date} onChange={(e) => update(pub.id, { date: e.target.value })} />
            <input className="input" placeholder="URL (optional)" value={pub.url} onChange={(e) => update(pub.id, { url: e.target.value })} />
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(pub.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBlock({ label, items, onChange }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createSimpleEntry()]);

  return (
    <div className="border-t border-ink-100 pt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink-700">{label}</p>
        <button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={13} /> Add</button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-ink-200 p-3 space-y-2 bg-ink-50/40">
            <div className="grid sm:grid-cols-2 gap-2">
              <input className="input" placeholder="Title / Role" value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} />
              <input className="input" placeholder="Organization" value={item.organization} onChange={(e) => update(item.id, { organization: e.target.value })} />
              <input className="input" placeholder="Date" value={item.date} onChange={(e) => update(item.id, { date: e.target.value })} />
            </div>
            <textarea className="textarea min-h-[50px]" placeholder="Description" value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} />
            <div className="flex justify-end">
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterestsBlock({ items, onChange }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setDraft('');
  };
  return (
    <div className="border-t border-ink-100 pt-4">
      <p className="text-sm font-medium text-ink-700 mb-2">Interests</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((v) => (
          <span key={v} className="badge-gray">
            {v}
            <button type="button" onClick={() => onChange(items.filter((i) => i !== v))} aria-label={`Remove ${v}`}><X size={12} /></button>
          </span>
        ))}
      </div>
      <input
        className="input"
        placeholder="e.g. Chess (press Enter to add)"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        onBlur={add}
      />
    </div>
  );
}
