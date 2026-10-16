import React from 'react';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';
import SectionCard from './SectionCard.jsx';
import AiButton from '../ui/AiButton.jsx';
import { useToast } from '../ui/Toast.jsx';
import { createProjectEntry } from '../../utils/resumeUtils.js';
import * as aiService from '../../services/aiService.js';

export default function ProjectsForm({ items = [], onChange }) {
  const toast = useToast();
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, createProjectEntry()]);

  const applyAi = async (proj, fn, args) => {
    const result = await fn(args);
    update(proj.id, { description: result.text });
    if (result.warning) toast.info(result.warning);
  };

  return (
    <SectionCard
      title="Projects"
      description="Personal, academic, or professional projects"
      icon={FolderGit2}
      actions={<button type="button" className="btn-ghost btn-sm" onClick={add}><Plus size={14} /> Add</button>}
    >
      {items.length === 0 && <p className="text-sm text-ink-400 bg-ink-50 rounded-lg px-3 py-4 text-center">No projects added yet.</p>}
      <div className="space-y-4">
        {items.map((proj) => (
          <div key={proj.id} className="rounded-lg border border-ink-200 p-4 space-y-3 bg-ink-50/40">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Project Name</label>
                <input className="input" value={proj.name} placeholder="TaskFlow" onChange={(e) => update(proj.id, { name: e.target.value })} />
              </div>
              <div>
                <label className="label">Technologies</label>
                <input className="input" value={proj.technologies} placeholder="React, Node.js" onChange={(e) => update(proj.id, { technologies: e.target.value })} />
              </div>
              <div>
                <label className="label">Project URL (optional)</label>
                <input className="input" value={proj.url} placeholder="myproject.com" onChange={(e) => update(proj.id, { url: e.target.value })} />
              </div>
              <div>
                <label className="label">GitHub URL (optional)</label>
                <input className="input" value={proj.githubUrl} placeholder="github.com/you/project" onChange={(e) => update(proj.id, { githubUrl: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="textarea" value={proj.description} placeholder="What the project does and your role in it" onChange={(e) => update(proj.id, { description: e.target.value })} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <AiButton label="Improve Description" onRun={() => applyAi(proj, aiService.improveProjectDescription, proj.description)} />
                <AiButton
                  label="Generate Description"
                  onRun={() => applyAi(proj, aiService.generateProjectDescription, { name: proj.name, technologies: proj.technologies, roughNotes: proj.description })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => remove(proj.id)} aria-label="Delete project"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
