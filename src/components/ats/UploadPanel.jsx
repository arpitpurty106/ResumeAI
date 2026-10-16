import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, ScanSearch, Loader2 } from 'lucide-react';
import { parseResumeFile } from '../../services/parserService.js';

export default function UploadPanel({ resumeText, setResumeText, jdText, setJdText, onScan, scanning, resumeOptions, selectedResumeId, onSelectResume }) {
  const fileRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [fileWarning, setFileWarning] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setFileWarning(null);
    const { text, warning } = await parseResumeFile(file);
    setParsing(false);
    if (warning) setFileWarning(warning);
    if (text) setResumeText(text);
  };

  return (
    <div className="space-y-5">
      {resumeOptions?.length > 0 && (
        <div className="card p-4">
          <label className="label">Or load a saved resume</label>
          <select
            className="input"
            value={selectedResumeId || ''}
            onChange={(e) => onSelectResume(e.target.value)}
          >
            <option value="">— Select a saved resume —</option>
            {resumeOptions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}

      <div className="card p-5">
        <h3 className="section-title mb-3">Upload Resume</h3>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-ink-200 rounded-xl py-8 flex flex-col items-center gap-2 text-ink-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          {parsing ? <Loader2 className="animate-spin" size={26} /> : <UploadCloud size={26} />}
          <span className="text-sm font-medium">{parsing ? 'Reading file…' : 'Click to upload a PDF or TXT resume'}</span>
          <span className="text-xs">Word (.docx) files aren't supported for direct parsing — paste text instead</span>
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={handleFile} />
        {fileName && !fileWarning && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><FileText size={12} /> Loaded "{fileName}" successfully.</p>
        )}
        {fileWarning && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2 flex items-start gap-1.5">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {fileWarning}
          </p>
        )}
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-2">Or Paste Resume Text</h3>
        <textarea
          className="textarea min-h-[180px]"
          placeholder="Paste your full resume text here…"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>

      <div className="card p-5">
        <h3 className="section-title mb-1">Job Description (optional)</h3>
        <p className="text-xs text-ink-400 mb-2">Add a job description to get keyword matching and tailored recommendations.</p>
        <textarea
          className="textarea min-h-[160px]"
          placeholder="Paste the target job description here…"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
      </div>

      <button className="btn-primary w-full py-3" onClick={onScan} disabled={scanning || !resumeText.trim()}>
        {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
        {scanning ? 'Analyzing…' : 'Scan Resume'}
      </button>
    </div>
  );
}
