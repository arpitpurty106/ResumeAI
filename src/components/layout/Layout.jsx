import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Files, ScanSearch, LayoutTemplate, Settings as SettingsIcon,
  Menu, X, Sparkles, Plus,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/builder', label: 'Resume Builder', icon: FileText },
  { to: '/my-resumes', label: 'My Resumes', icon: Files },
  { to: '/ats-scanner', label: 'ATS Scanner', icon: ScanSearch },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page-shell min-h-screen flex bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-white/10 bg-ink-100/90 backdrop-blur-xl">
        <SidebarContent onNavigate={() => {}} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="relative z-50 w-72 max-w-[80%] bg-ink-100 h-full shadow-panel animate-fadeIn border-r border-white/10">
            <button
              className="absolute right-3 top-3 p-2 rounded-lg hover:bg-ink-100"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-100/90 backdrop-blur-xl px-4 py-3">
          <button
            className="p-2 rounded-lg hover:bg-ink-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 font-semibold text-ink-900">
            <Sparkles size={18} className="text-brand-500" />
            ResumeAI
          </div>
          <NavLink to="/builder" className="btn-primary btn-sm" aria-label="Create new resume">
            <Plus size={14} />
          </NavLink>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full py-5">
      <div className="px-5 mb-7 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-ink-900 leading-tight tracking-tight">Resume<span className="text-brand-400">AI</span></p>
          <p className="text-[11px] text-ink-400 leading-tight">Resume Builder &amp; ATS Scanner</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive ? 'bg-brand-50 text-brand-800 border border-brand-300/30 shadow-sm' : 'text-ink-600 hover:bg-ink-200/80 hover:text-ink-900'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 mt-4">
        <NavLink to="/builder?new=1" onClick={onNavigate} className="btn-primary w-full">
          <Plus size={16} />
          Create New Resume
        </NavLink>
      </div>

      <div className="px-5 mt-6 text-[11px] text-ink-400 leading-relaxed">
        ATS results are directional guidance, not a guarantee of interviews or job offers.
      </div>
    </div>
  );
}
