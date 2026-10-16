import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, ScanSearch } from 'lucide-react';

import UploadPanel from '../components/ats/UploadPanel.jsx';
import ScoreOverview from '../components/ats/ScoreOverview.jsx';
import KeywordMatchPanel from '../components/ats/KeywordMatchPanel.jsx';
import WarningsList from '../components/ats/WarningsList.jsx';
import { runAtsScan } from '../services/atsService.js';
import { resumeToPlainText } from '../utils/resumeUtils.js';
import { storage } from '../utils/storage.js';
import { useToast } from '../components/ui/Toast.jsx';

/**
 * ATS Scanner page.
 *
 * Lets the user upload a PDF/TXT resume, paste resume text directly, or load
 * one of their saved resumes, then optionally paste a target job description.
 * Scanning always runs the fully local, deterministic rule-based analyzer in
 * src/utils/scoring.js — there is no network dependency and no randomness.
 */
export default function ATSScanner({ resumeStore }) {
  const { id } = useParams();
  const toast = useToast();
  const { resumes, getResume, updateResume } = resumeStore;

  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(id || '');
  const [scanning, setScanning] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const loadResumeIntoText = (resumeId) => {
    if (!resumeId) return;
    const resume = getResume(resumeId);
    if (resume) {
      setResumeText(resumeToPlainText(resume));
      setSelectedResumeId(resumeId);
    }
  };

  // Pre-fill from a saved resume if the page was opened via /ats-scanner/:id
  useEffect(() => {
    if (id) loadResumeIntoText(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleScan = () => {
    setError(null);
    if (!resumeText.trim()) {
      setError('Please upload a resume, paste your resume text, or select a saved resume before scanning.');
      return;
    }
    setScanning(true);
    // Deterministic local analysis — no async work needed, but we keep a
    // brief timeout so the UI can show its loading state for larger inputs.
    setTimeout(() => {
      try {
        const activeResume = selectedResumeId ? getResume(selectedResumeId) : null;
        const resumeSkillsList = activeResume
          ? [
              ...(activeResume.skills?.technical || []),
              ...(activeResume.skills?.tools || []),
              ...(activeResume.skills?.soft || []),
              ...(activeResume.skills?.languages || []),
            ]
          : [];

        const result = runAtsScan({ resumeText, jdText, resumeSkillsList });
        setReport(result);

        // Persist the score onto the saved resume (if one was selected) and
        // keep a lightweight scan history in localStorage.
        if (activeResume) {
          updateResume(activeResume.id, (r) => ({ ...r, atsScore: result.totalScore, lastScan: result.analyzedAt }));
        }
        const scans = storage.getScans();
        storage.setScans([
          {
            id: `scan-${Date.now()}`,
            resumeId: selectedResumeId || null,
            score: result.totalScore,
            hasJobDescription: result.hasJobDescription,
            scannedAt: result.analyzedAt,
          },
          ...scans,
        ].slice(0, 50));

        toast.success(`Scan complete — ATS score: ${result.totalScore}/100`);
      } catch (err) {
        console.error('[ATSScanner] scan failed', err);
        setError(err.message || 'Something went wrong while analyzing your resume. Please try again.');
      } finally {
        setScanning(false);
      }
    }, 250);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-900 flex items-center gap-2">
          <ScanSearch size={22} className="text-brand-500" /> ATS Scanner
        </h1>
        <p className="text-sm text-ink-500 mt-1 max-w-2xl">
          A fully local, rule-based ATS compatibility check — nothing is uploaded to a server. Add a job description
          for keyword matching, or scan on its own for a general resume health check.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        <UploadPanel
          resumeText={resumeText}
          setResumeText={(v) => { setResumeText(v); setSelectedResumeId(''); }}
          jdText={jdText}
          setJdText={setJdText}
          onScan={handleScan}
          scanning={scanning}
          resumeOptions={resumes}
          selectedResumeId={selectedResumeId}
          onSelectResume={loadResumeIntoText}
        />

        <div className="space-y-6">
          {error && (
            <div className="card p-4 border-red-200 bg-red-50 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {!report && !error && (
            <div className="card p-12 text-center">
              <ScanSearch size={36} className="mx-auto text-ink-300 mb-3" />
              <p className="font-medium text-ink-700 mb-1">No scan yet</p>
              <p className="text-sm text-ink-500 max-w-sm mx-auto">
                Upload or paste a resume on the left, then click "Scan Resume" to see your ATS score, keyword
                matching, and actionable recommendations.
              </p>
            </div>
          )}

          {report && (
            <>
              <ScoreOverview report={report} />
              <KeywordMatchPanel jdMatch={report.jdMatch} />
              <WarningsList warnings={report.warnings} />

              {(report.weakPhrases.length > 0 || report.repeatedWords.length > 0) && (
                <div className="card p-5 space-y-4">
                  <h3 className="section-title">Language &amp; Wording</h3>
                  {report.weakPhrases.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                        Weak phrases detected
                      </p>
                      <ul className="space-y-1.5">
                        {report.weakPhrases.map((wp) => (
                          <li key={wp.phrase} className="text-sm bg-amber-50 text-amber-800 rounded-lg px-3 py-2">
                            <span className="font-medium">&ldquo;{wp.phrase}&rdquo;</span> — {wp.suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.repeatedWords.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">
                        Frequently repeated words
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.repeatedWords.map((r) => (
                          <span key={r.word} className="badge-gray">{r.word} × {r.count}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-ink-400 text-center px-4">
                ATS compatibility is directional guidance, not a guarantee of an interview or job offer. ATS systems
                vary between companies and vendors — the best resume is clear, relevant, truthful, and easy to read.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
