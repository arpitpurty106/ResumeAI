
import React, { useState } from 'react';
import { Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { storage } from '../utils/storage.js';
import { TEMPLATES, FONT_OPTIONS } from '../data/templates.js';
import { isAiConfigured } from '../services/aiService.js';
import { useToast } from '../components/ui/Toast.jsx';

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [confirmClear, setConfirmClear] = useState(false);

  const save = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    storage.setSettings(next);
  };

  const handleClearData = () => {
    storage.clearAll();
    setConfirmClear(false);
    toast.success('Local data cleared. Reloading...');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-ink-900 mb-1">
        Settings
      </h1>

      <p className="text-sm text-ink-500 mb-6">
        No account required — everything is stored locally in this browser.
      </p>

      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="section-title mb-4">Defaults</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Template</label>
              <select
                className="input"
                value={settings.defaultTemplate}
                onChange={(e) =>
                  save({ defaultTemplate: e.target.value })
                }
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Default Font</label>
              <select
                className="input"
                value={settings.defaultFont}
                onChange={(e) =>
                  save({ defaultFont: e.target.value })
                }
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-3">AI Provider Status</h2>

          {isAiConfigured() ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2.5 text-sm">
              <CheckCircle2 size={16} />
              Gemini API key detected — AI features use live generation.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5 text-sm">
              <XCircle size={16} />
              No API key configured — AI features use local rule-based
              fallback. Add{' '}
              <code className="font-mono">VITE_GEMINI_API_KEY</code> to your{' '}
              <code className="font-mono">.env</code> file to enable live AI
              generation.
            </div>
          )}
        </div>

        <div className="card p-5 border-red-200">
          <h2 className="section-title mb-1 text-red-700">
            Danger Zone
          </h2>

          <p className="text-sm text-ink-500 mb-3">
            Permanently delete all resumes, scans, and settings stored in
            this browser.
          </p>

          {!confirmClear ? (
            <button
              className="btn-danger"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={15} />
              Clear Local Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-600">
                Are you sure? This cannot be undone.
              </span>

              <button
                className="btn-danger"
                onClick={handleClearData}
              >
                Yes, delete everything
              </button>

              <button
                className="btn-secondary"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
