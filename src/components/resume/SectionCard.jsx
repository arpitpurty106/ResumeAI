import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SectionCard({ title, description, icon: Icon, defaultOpen = true, actions, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-brand-600" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="section-title truncate">{title}</h3>
            {description && <p className="text-xs text-ink-400 truncate">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
          <ChevronDown size={16} className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} onClick={() => setOpen((o) => !o)} />
        </div>
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4 border-t border-ink-100">{children}</div>}
    </div>
  );
}
