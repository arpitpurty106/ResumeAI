import React from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import { createCertificationEntry } from '../../utils/resumeUtils.js';

export default function CertificationsForm({ items = [], onChange }) {
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createCertificationEntry()]);

  return (
    <SectionCard
      title="Certifications"
      description="Professional certifications and licenses"
      icon={Award}
      actions={<button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={14} /> Add</button>}
      defaultOpen={items.length > 0}
    >
      {items.length === 0 && <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">No certifications added yet.</p>}
      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-ink-200 p-4 grid sm:grid-cols-2 gap-3 bg-ink-50/40">
            <div>
              <label className="label">Certification</label>
              <input className="input" value={c.name} placeholder="AWS Certified Cloud Practitioner" onChange={(e) => update(c.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="label">Issuer</label>
              <input className="input" value={c.issuer} placeholder="Amazon Web Services" onChange={(e) => update(c.id, { issuer: e.target.value })} />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" value={c.date} placeholder="2023" onChange={(e) => update(c.id, { date: e.target.value })} />
            </div>
            <div>
              <label className="label">Credential URL (optional)</label>
              <input className="input" value={c.credentialUrl} placeholder="credential link" onChange={(e) => update(c.id, { credentialUrl: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(c.id)} aria-label="Delete certification"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
