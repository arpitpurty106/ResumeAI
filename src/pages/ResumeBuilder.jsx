import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  Save,
  Eye,
  PenLine,
  FileText,
} from 'lucide-react';

import PersonalInfoForm from '../components/resume/PersonalInfoForm.jsx';
import SummaryForm from '../components/resume/SummaryForm.jsx';
import ExperienceForm from '../components/resume/ExperienceForm.jsx';
import EducationForm from '../components/resume/EducationForm.jsx';
import SkillsForm from '../components/resume/SkillsForm.jsx';
import ProjectsForm from '../components/resume/ProjectsForm.jsx';
import CertificationsForm from '../components/resume/CertificationsForm.jsx';
import AchievementsForm from '../components/resume/AchievementsForm.jsx';
import ExtraSectionsForm from '../components/resume/ExtraSectionsForm.jsx';
import ResumePreview from '../components/resume/ResumePreview.jsx';

import { useToast } from '../components/ui/Toast.jsx';
import { resumeToPlainText } from '../utils/resumeUtils.js';
import * as aiService from '../services/aiService.js';
import { isAiConfigured } from '../services/aiService.js';

export default function ResumeBuilder({ resumeStore }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    resumes,
    createResume,
    updateResume,
    getResume,
  } = resumeStore;

  const [activeResumeId, setActiveResumeId] = useState(id || null);
  const [mobileView, setMobileView] = useState('edit');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeSuggestions, setOptimizeSuggestions] = useState(null);

  useEffect(() => {
    if (id) {
      setActiveResumeId(id);
      return;
    }

    if (searchParams.get('new') === '1') {
      const created = createResume();

      setActiveResumeId(created.id);

      navigate(`/builder/${created.id}`, {
        replace: true,
      });

      return;
    }

    if (resumes.length > 0) {
      setActiveResumeId(resumes[0].id);

      navigate(`/builder/${resumes[0].id}`, {
        replace: true,
      });
    } else {
      const created = createResume();

      setActiveResumeId(created.id);

      navigate(`/builder/${created.id}`, {
        replace: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = useMemo(
    () => (activeResumeId ? getResume(activeResumeId) : null),
    [activeResumeId, resumes, getResume]
  );

  if (!resume) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="animate-spin text-brand-500"
          size={28}
        />
      </div>
    );
  }

  const patch = (fields) => {
    updateResume(resume.id, (currentResume) => ({
      ...currentResume,
      ...fields,
    }));
  };

  const patchField = (key, value) => {
    patch({
      [key]: value,
    });
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);

      const plainText = resumeToPlainText(resume);

      const result = await aiService.optimizeResume(plainText);

      setOptimizeSuggestions(
        result.text.split('\n').filter(Boolean)
      );

      if (result.warning) {
        toast.info(result.warning);
      }
    } catch (error) {
      toast.error(
        error?.message || 'Could not optimize the resume.'
      );
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 lg:px-6 xl:px-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

        <div className="min-w-0 flex-1">

          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-400">

            <span className="inline-flex items-center gap-1.5">
              <FileText
                size={13}
                className="text-brand-400"
              />
              Resume Builder
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-ink-400 sm:block" />

            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <Save size={12} />
              Auto-saved
            </span>

          </div>

          <input
            className="block w-full truncate border-none bg-transparent p-0 text-xl font-bold text-ink-900 outline-none focus:ring-0 sm:text-2xl"
            value={resume.name}
            onChange={(e) =>
              patchField('name', e.target.value)
            }
            aria-label="Resume name"
          />

          <div className="mt-2 flex max-w-xl items-center gap-2">

            <span className="shrink-0 text-xs text-ink-400">
              Target role
            </span>

            <input
              className="min-w-0 flex-1 border-x-0 border-t-0 border-b border-dashed border-ink-300 bg-transparent px-1 py-1 text-sm text-ink-700 outline-none transition focus:border-brand-400 focus:ring-0"
              placeholder="e.g. Software Engineer"
              value={resume.targetRole}
              onChange={(e) =>
                patchField(
                  'targetRole',
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <button
          type="button"
          className="btn-primary self-start xl:self-auto"
          onClick={handleOptimize}
          disabled={optimizing}
        >
          {optimizing ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Sparkles size={15} />
          )}

          Optimize Resume with AI
        </button>

      </div>


      {/* =====================================================
          DEMO AI NOTICE
      ====================================================== */}

      {!isAiConfigured() && (
        <div className="mb-5 rounded-xl border border-amber-800/30 bg-amber-950/20 px-4 py-3 text-sm leading-relaxed text-amber-300">

          Running in local demo mode. AI actions currently use
          rule-based local rewriting.

          {' '}

          Add{' '}

          <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
            VITE_GEMINI_API_KEY
          </code>

          {' '}to enable live AI generation.

        </div>
      )}


      {/* =====================================================
          AI SUGGESTIONS
      ====================================================== */}

      {optimizeSuggestions && (
        <div className="card mb-5 border-brand-300/40 p-4">

          <div className="mb-3 flex items-center justify-between gap-3">

            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Sparkles
                size={14}
                className="text-brand-400"
              />
              AI Optimization Suggestions
            </p>

            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() =>
                setOptimizeSuggestions(null)
              }
            >
              Dismiss
            </button>

          </div>

          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">
            {optimizeSuggestions.map(
              (suggestion, index) => (
                <li key={index}>
                  {suggestion}
                </li>
              )
            )}
          </ul>

        </div>
      )}


      {/* =====================================================
          MOBILE EDIT / PREVIEW
      ====================================================== */}

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-ink-300 bg-ink-100 p-1.5 lg:hidden">

        <button
          type="button"
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            mobileView === 'edit'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-ink-500 hover:bg-ink-200 hover:text-ink-800'
          }`}
          onClick={() =>
            setMobileView('edit')
          }
        >
          <PenLine size={15} />
          Edit
        </button>

        <button
          type="button"
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            mobileView === 'preview'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-ink-500 hover:bg-ink-200 hover:text-ink-800'
          }`}
          onClick={() =>
            setMobileView('preview')
          }
        >
          <Eye size={15} />
          Preview
        </button>

      </div>


      {/* =====================================================
          MAIN BUILDER
      ====================================================== */}

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)]">

        {/* ===========================
            EDITOR
        ============================ */}

        <div
          className={`min-w-0 ${
            mobileView === 'preview'
              ? 'hidden lg:block'
              : ''
          }`}
        >

          <div className="mb-3 px-1">

            <h2 className="text-sm font-semibold text-ink-900">
              Resume Details
            </h2>

            <p className="mt-0.5 text-xs text-ink-400">
              Edit your information. The preview updates automatically.
            </p>

          </div>

          <div className="space-y-4">

            <PersonalInfoForm
              data={resume.personalInfo}
              onChange={(value) =>
                patchField(
                  'personalInfo',
                  value
                )
              }
            />

            <SummaryForm
              resume={resume}
              onChange={(value) =>
                patchField(
                  'summary',
                  value
                )
              }
            />

            <ExperienceForm
              items={resume.experience}
              onChange={(value) =>
                patchField(
                  'experience',
                  value
                )
              }
            />

            <EducationForm
              items={resume.education}
              onChange={(value) =>
                patchField(
                  'education',
                  value
                )
              }
            />

            <SkillsForm
              skills={resume.skills}
              onChange={(value) =>
                patchField(
                  'skills',
                  value
                )
              }
              resumeContext={resume}
            />

            <ProjectsForm
              items={resume.projects}
              onChange={(value) =>
                patchField(
                  'projects',
                  value
                )
              }
            />

            <CertificationsForm
              items={resume.certifications}
              onChange={(value) =>
                patchField(
                  'certifications',
                  value
                )
              }
            />

            <AchievementsForm
              items={resume.achievements}
              onChange={(value) =>
                patchField(
                  'achievements',
                  value
                )
              }
            />

            <ExtraSectionsForm
              resume={resume}
              onChangeField={patchField}
            />

          </div>

        </div>


        {/* ===========================
            LIVE PREVIEW
        ============================ */}

        <div
          className={`min-w-0 ${
            mobileView === 'edit'
              ? 'hidden lg:block'
              : ''
          }`}
        >

          <div className="lg:sticky lg:top-4">

            <ResumePreview
              resume={resume}
              onFormattingChange={(value) =>
                patchField(
                  'formatting',
                  value
                )
              }
              onTemplateChange={(value) =>
                patchField(
                  'template',
                  value
                )
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
}