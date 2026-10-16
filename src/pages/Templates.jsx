import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  FileText,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { TEMPLATES } from '../data/templates.js';
import ResumeDocument from '../components/templates/ResumeTemplates.jsx';
import { getSampleResume } from '../data/sampleResume.js';
import { useToast } from '../components/ui/Toast.jsx';


/* ============================================================
   TEMPLATE PREVIEW
   ============================================================ */

function TemplatePreview({ resume }) {
  return (
    <div className="template-preview-shell">

      <div className="template-preview-toolbar">

        <div className="flex items-center gap-2">
          <div className="template-preview-dot" />
          <span>Live Preview</span>
        </div>

        <span className="template-preview-format">
          A4 • ATS Ready
        </span>

      </div>


      <div className="template-preview-stage">

        <div className="template-paper-wrapper">

          <div className="template-paper">

            <ResumeDocument
              resume={resume}
            />

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   FEATURE ITEM
   ============================================================ */

function FeatureItem({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">

      <div className="template-feature-icon">
        <Icon size={15} strokeWidth={2} />
      </div>

      <div className="min-w-0">

        <p className="text-sm font-semibold text-ink-900">
          {title}
        </p>

        <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function Templates({
  resumeStore,
}) {
  const {
    resumes = [],
    updateResume,
  } = resumeStore;

  const navigate = useNavigate();
  const toast = useToast();

  const sampleResume = useMemo(
    () => getSampleResume(),
    []
  );

  const [selectedResumeId, setSelectedResumeId] =
    useState(resumes[0]?.id || '');


  /* ----------------------------------------------------------
     Selected resume
     ---------------------------------------------------------- */

  const selectedResume = resumes.find(
    (resume) =>
      resume.id === selectedResumeId
  );


  /* ----------------------------------------------------------
     Preview resume
     ---------------------------------------------------------- */

  const previewResume = useMemo(() => {

    const source =
      selectedResume || sampleResume;

    return {
      ...source,

      template: 'classic-ats',

      /*
       * Legacy photo data is deliberately removed from the
       * preview so an old saved resume can never bring the
       * passport photo back.
       */

      personalInfo: {
        ...(source.personalInfo || {}),
        photo: '',
      },
    };

  }, [
    selectedResume,
    sampleResume,
  ]);


  /* ----------------------------------------------------------
     Apply template
     ---------------------------------------------------------- */

  const handleApply = () => {

    if (!selectedResume) {

      toast.info(
        'Create or select a resume first.'
      );

      navigate('/builder?new=1');

      return;
    }


    updateResume(
      selectedResume.id,
      (resume) => ({
        ...resume,

        template:
          'classic-ats',

        personalInfo: {
          ...(resume.personalInfo || {}),
          photo: '',
        },
      })
    );


    toast.success(
      'Classic ATS template applied successfully.'
    );
  };


  /* ----------------------------------------------------------
     Template state
     ---------------------------------------------------------- */

  const isActive =
    selectedResume?.template ===
      'classic-ats' ||
    !selectedResume?.template;


  return (
    <div className="templates-page">


      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="templates-header">

        <div className="templates-heading">

          <div className="templates-eyebrow">

            <span className="templates-eyebrow-icon">
              <Sparkles
                size={13}
                strokeWidth={2.2}
              />
            </span>

            <span>
              PROFESSIONAL RESUME DESIGN
            </span>

          </div>


          <h1>
            Build a resume that
            <span>
              gets noticed.
            </span>
          </h1>


          <p>
            One carefully designed ATS-friendly
            template, built around the format
            recruiters are already familiar with.
          </p>

        </div>


        {/* ====================================================
            RESUME SELECTOR
            ==================================================== */}

        {resumes.length > 0 && (

          <div className="template-resume-selector">

            <label htmlFor="resume-template-selector">
              Apply template to
            </label>

            <div className="template-select-wrapper">

              <FileText
                size={16}
                className="template-select-icon"
              />

              <select
                id="resume-template-selector"
                value={selectedResumeId}
                onChange={(event) =>
                  setSelectedResumeId(
                    event.target.value
                  )
                }
              >

                {resumes.map(
                  (resume) => (
                    <option
                      key={resume.id}
                      value={resume.id}
                    >
                      {resume.name ||
                        'Untitled Resume'}
                    </option>
                  )
                )}

              </select>

              <ChevronDown
                size={16}
                className="template-select-chevron"
              />

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          MAIN TEMPLATE CARD
          ====================================================== */}

      <section className="professional-template-card">


        {/* ====================================================
            LEFT — PREVIEW
            ==================================================== */}

        <div className="professional-preview-column">

          <div className="preview-column-header">

            <div>

              <div className="preview-label">

                <LayoutTemplate
                  size={14}
                  strokeWidth={2}
                />

                Template preview

              </div>

              <p>
                See exactly how your resume
                will be structured.
              </p>

            </div>


            <div className="preview-status">

              <span className="preview-status-dot" />

              ATS Optimized

            </div>

          </div>


          <TemplatePreview
            resume={previewResume}
          />

        </div>


        {/* ====================================================
            RIGHT — INFORMATION
            ==================================================== */}

        <aside className="professional-info-column">


          {/* Badge */}

          <div className="recommended-badge">

            <Star
              size={14}
              fill="currentColor"
            />

            <span>
              RECOMMENDED
            </span>

          </div>


          {/* Title */}

          <h2>
            Classic ATS
          </h2>


          <p className="template-description">

            A polished, recruiter-friendly
            resume layout that keeps the focus
            on your experience, skills and
            achievements.

          </p>


          {/* ==================================================
              MAIN BENEFIT
              ================================================== */}

          <div className="template-highlight">

            <div className="template-highlight-icon">

              <Zap
                size={18}
                fill="currentColor"
              />

            </div>

            <div>

              <strong>
                Designed for ATS compatibility
              </strong>

              <span>
                Clean structure and standard
                headings make your information
                easy for applicant tracking
                systems to understand.
              </span>

            </div>

          </div>


          {/* ==================================================
              FEATURES
              ================================================== */}

          <div className="template-features">

            <FeatureItem
              icon={LayoutTemplate}
              title="Single-column layout"
              description="Simple reading flow for recruiters and ATS software."
            />

            <FeatureItem
              icon={ShieldCheck}
              title="No photo or graphics"
              description="Keeps attention on your qualifications instead of decorative elements."
            />

            <FeatureItem
              icon={FileText}
              title="Recruiter-standard sections"
              description="Clear sections for summary, experience, education, skills and projects."
            />

            <FeatureItem
              icon={Zap}
              title="Achievement focused"
              description="Provides space for measurable results instead of generic descriptions."
            />

          </div>


          {/* ==================================================
              DIVIDER
              ================================================== */}

          <div className="template-divider" />


          {/* ==================================================
              ACTION
              ================================================== */}

          <div className="template-action">

            <button
              type="button"
              onClick={handleApply}
              disabled={isActive && Boolean(selectedResume)}
              className={
                isActive && selectedResume
                  ? 'template-apply-button template-apply-button-active'
                  : 'template-apply-button'
              }
            >

              {isActive && selectedResume ? (

                <>
                  <Check
                    size={17}
                    strokeWidth={2.5}
                  />

                  Currently Applied

                </>

              ) : (

                <>
                  Use This Template

                  <span className="template-button-arrow">
                    →
                  </span>
                </>

              )}

            </button>


            <p className="template-action-note">

              Your existing resume information
              stays unchanged.

            </p>

          </div>


          {/* ==================================================
              FOOTER NOTE
              ================================================== */}

          <div className="template-compatibility">

            <ShieldCheck
              size={15}
            />

            <span>
              Conservative, ATS-friendly formatting
              suitable for most professional
              applications.
            </span>

          </div>

        </aside>

      </section>


      {/* ======================================================
          BOTTOM TRUST ROW
          ====================================================== */}

      <div className="template-trust-row">

        <div>
          <Check size={15} />
          No passport photo
        </div>

        <div>
          <Check size={15} />
          No unnecessary graphics
        </div>

        <div>
          <Check size={15} />
          Single-column structure
        </div>

        <div>
          <Check size={15} />
          Recruiter-friendly hierarchy
        </div>

      </div>


      {/* ======================================================
          PAGE-SPECIFIC STYLES
          ====================================================== */}

      <style>{`

        /* ====================================================
           PAGE
           ==================================================== */

        .templates-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 34px 34px 56px;
        }


        /* ====================================================
           HEADER
           ==================================================== */

        .templates-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 28px;
        }


        .templates-heading {
          max-width: 760px;
        }


        .templates-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;

          color: #9b7aff;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.16em;
        }


        .templates-eyebrow-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          width: 25px;
          height: 25px;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              rgba(139, 92, 246, 0.24),
              rgba(99, 102, 241, 0.12)
            );

          border:
            1px solid
            rgba(139, 92, 246, 0.28);
        }


        .templates-heading h1 {
          margin: 0;

          color: #f8fafc;

          font-size: clamp(30px, 3vw, 43px);
          line-height: 1.06;
          font-weight: 800;

          letter-spacing: -0.045em;
        }


        .templates-heading h1 span {
          display: block;

          background:
            linear-gradient(
              90deg,
              #ffffff 0%,
              #bda7ff 45%,
              #8b5cf6 100%
            );

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;
        }


        .templates-heading p {
          margin: 13px 0 0;

          max-width: 670px;

          color: #8791a5;

          font-size: 14px;
          line-height: 1.7;
        }


        /* ====================================================
           SELECTOR
           ==================================================== */

        .template-resume-selector {
          min-width: 255px;
        }


        .template-resume-selector label {
          display: block;

          margin-bottom: 7px;

          color: #8c96aa;

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 0.1em;
        }


        .template-select-wrapper {
          position: relative;
        }


        .template-select-wrapper select {
          width: 100%;
          height: 45px;

          appearance: none;

          padding:
            0 42px 0 39px;

          border:
            1px solid
            rgba(148, 163, 184, 0.18);

          border-radius: 13px;

          outline: none;

          background:
            rgba(15, 18, 26, 0.92);

          color: #f1f5f9;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition:
            border-color 160ms ease,
            box-shadow 160ms ease;
        }


        .template-select-wrapper select:hover {
          border-color:
            rgba(139, 92, 246, 0.45);
        }


        .template-select-wrapper select:focus {
          border-color:
            rgba(139, 92, 246, 0.7);

          box-shadow:
            0 0 0 3px
            rgba(139, 92, 246, 0.1);
        }


        .template-select-icon {
          position: absolute;

          left: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #9b7aff;

          pointer-events: none;
        }


        .template-select-chevron {
          position: absolute;

          right: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          color: #7b8497;

          pointer-events: none;
        }


        /* ====================================================
           MAIN CARD
           ==================================================== */

        .professional-template-card {
          position: relative;

          display: grid;

          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(350px, 0.82fr);

          overflow: hidden;

          border:
            1px solid
            rgba(148, 163, 184, 0.15);

          border-radius: 24px;

          background:
            linear-gradient(
              145deg,
              rgba(16, 19, 28, 0.98),
              rgba(9, 11, 17, 0.99)
            );

          box-shadow:
            0 28px 80px
            rgba(0, 0, 0, 0.38),

            inset 0 1px 0
            rgba(255, 255, 255, 0.035);
        }


        .professional-template-card::before {
          content: '';

          position: absolute;

          width: 420px;
          height: 420px;

          left: -180px;
          top: -230px;

          border-radius: 999px;

          background:
            rgba(124, 58, 237, 0.12);

          filter: blur(80px);

          pointer-events: none;
        }


        /* ====================================================
           LEFT PREVIEW COLUMN
           ==================================================== */

        .professional-preview-column {
          min-width: 0;

          padding: 27px;

          border-right:
            1px solid
            rgba(148, 163, 184, 0.12);
        }


        .preview-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;

          margin-bottom: 17px;
        }


        .preview-label {
          display: flex;
          align-items: center;
          gap: 8px;

          color: #e5e7eb;

          font-size: 13px;
          font-weight: 700;
        }


        .preview-label svg {
          color: #a78bfa;
        }


        .preview-column-header p {
          margin: 4px 0 0;

          color: #697386;

          font-size: 11px;
        }


        .preview-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 7px 10px;

          border:
            1px solid
            rgba(16, 185, 129, 0.2);

          border-radius: 999px;

          background:
            rgba(16, 185, 129, 0.07);

          color: #7ce2bd;

          font-size: 10px;
          font-weight: 700;

          white-space: nowrap;
        }


        .preview-status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #34d399;

          box-shadow:
            0 0 9px
            rgba(52, 211, 153, 0.7);
        }


        /* ====================================================
           PREVIEW SHELL
           ==================================================== */

        .template-preview-shell {
          overflow: hidden;

          border:
            1px solid
            rgba(148, 163, 184, 0.13);

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #0d1119,
              #090c12
            );

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, 0.28);
        }


        .template-preview-toolbar {
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 13px;

          border-bottom:
            1px solid
            rgba(148, 163, 184, 0.1);

          color: #788397;

          font-size: 10px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 0.08em;
        }


        .template-preview-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #8b5cf6;

          box-shadow:
            0 0 10px
            rgba(139, 92, 246, 0.7);
        }


        .template-preview-format {
          color: #555f72;

          font-size: 9px;
        }


        /* ====================================================
           PREVIEW STAGE
           ==================================================== */

        .template-preview-stage {
          position: relative;

          display: flex;
          justify-content: center;
          align-items: flex-start;

          width: 100%;

          min-height: 655px;

          padding:
            26px 18px 30px;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 50% 15%,
              rgba(139, 92, 246, 0.08),
              transparent 42%
            );
        }


        /*
         * IMPORTANT:
         *
         * We no longer use translateX(-50%) together with a
         * scaled fixed-width paper.
         *
         * That was the reason the previous preview was
         * cutting the left side of the resume.
         */

        .template-paper-wrapper {
          position: relative;

          width: 100%;
          max-width: 640px;

          display: flex;
          justify-content: center;

          overflow: visible;
        }


        .template-paper {
          width: 8.5in;

          min-height: 11in;

          flex-shrink: 0;

          padding: 0;

          background: #ffffff;

          color: #111827;

          border-radius: 4px;

          box-shadow:
            0 30px 55px
            rgba(0, 0, 0, 0.42),

            0 4px 12px
            rgba(0, 0, 0, 0.2);

          transform:
            scale(0.72);

          transform-origin:
            top center;

          margin-bottom:
            -300px;
        }


        /*
         * The actual resume remains A4 sized.
         * The wrapper only scales the visual preview.
         */

        .template-paper > * {
          width: 8.5in;
          min-height: 11in;
        }


        /* ====================================================
           RIGHT INFORMATION COLUMN
           ==================================================== */

        .professional-info-column {
          position: relative;

          display: flex;
          flex-direction: column;

          padding: 38px 32px 30px;
        }


        .recommended-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          width: fit-content;

          padding: 6px 10px;

          border:
            1px solid
            rgba(167, 139, 250, 0.25);

          border-radius: 999px;

          background:
            rgba(139, 92, 246, 0.09);

          color: #b9a2ff;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }


        .professional-info-column h2 {
          margin: 18px 0 0;

          color: #f8fafc;

          font-size: 31px;
          line-height: 1.05;
          font-weight: 800;

          letter-spacing: -0.035em;
        }


        .template-description {
          margin: 13px 0 0;

          color: #8791a5;

          font-size: 13px;
          line-height: 1.75;
        }


        /* ====================================================
           HIGHLIGHT
           ==================================================== */

        .template-highlight {
          display: flex;
          gap: 12px;

          margin-top: 24px;
          padding: 14px;

          border:
            1px solid
            rgba(139, 92, 246, 0.18);

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(139, 92, 246, 0.1),
              rgba(139, 92, 246, 0.035)
            );
        }


        .template-highlight-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          flex-shrink: 0;

          border-radius: 10px;

          background:
            rgba(139, 92, 246, 0.14);

          color: #b79cff;
        }


        .template-highlight strong {
          display: block;

          color: #e9e7ff;

          font-size: 12px;
          line-height: 1.4;
        }


        .template-highlight span {
          display: block;

          margin-top: 4px;

          color: #7f899d;

          font-size: 11px;
          line-height: 1.55;
        }


        /* ====================================================
           FEATURES
           ==================================================== */

        .template-features {
          display: flex;
          flex-direction: column;
          gap: 17px;

          margin-top: 24px;
        }


        .template-feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 30px;
          height: 30px;

          flex-shrink: 0;

          border:
            1px solid
            rgba(148, 163, 184, 0.12);

          border-radius: 9px;

          background:
            rgba(255, 255, 255, 0.025);

          color: #9ca3af;
        }


        /* ====================================================
           DIVIDER
           ==================================================== */

        .template-divider {
          width: 100%;
          height: 1px;

          margin: 25px 0;

          background:
            rgba(148, 163, 184, 0.1);
        }


        /* ====================================================
           BUTTON
           ==================================================== */

        .template-apply-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;

          width: 100%;
          height: 48px;

          border: 0;
          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #8b5cf6,
              #6d45e8
            );

          color: #ffffff;

          font-size: 13px;
          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 12px 26px
            rgba(109, 69, 232, 0.22);

          transition:
            transform 160ms ease,
            box-shadow 160ms ease,
            filter 160ms ease;
        }


        .template-apply-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          filter:
            brightness(1.07);

          box-shadow:
            0 16px 32px
            rgba(109, 69, 232, 0.3);
        }


        .template-apply-button:active:not(:disabled) {
          transform:
            translateY(0);
        }


        .template-apply-button:disabled {
          cursor: default;
        }


        .template-apply-button-active {
          background:
            rgba(16, 185, 129, 0.08);

          border:
            1px solid
            rgba(16, 185, 129, 0.2);

          color: #72ddb9;

          box-shadow: none;
        }


        .template-button-arrow {
          font-size: 17px;

          transition:
            transform 160ms ease;
        }


        .template-apply-button:hover
        .template-button-arrow {
          transform:
            translateX(3px);
        }


        .template-action-note {
          margin: 9px 0 0;

          color: #596274;

          text-align: center;

          font-size: 10px;
        }


        /* ====================================================
           COMPATIBILITY
           ==================================================== */

        .template-compatibility {
          display: flex;
          gap: 8px;

          margin-top: auto;
          padding-top: 23px;

          color: #626c7f;

          font-size: 10px;
          line-height: 1.55;
        }


        .template-compatibility svg {
          flex-shrink: 0;

          margin-top: 1px;

          color: #34d399;
        }


        /* ====================================================
           TRUST ROW
           ==================================================== */

        .template-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 28px;

          margin-top: 18px;

          color: #697386;

          font-size: 11px;
        }


        .template-trust-row div {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }


        .template-trust-row svg {
          color: #34d399;
        }


        /* ====================================================
           RESPONSIVE
           ==================================================== */

        @media (max-width: 1150px) {

          .professional-template-card {
            grid-template-columns:
              minmax(0, 1.35fr)
              minmax(310px, 0.8fr);
          }

          .template-paper {
            transform:
              scale(0.62);

            margin-bottom:
              -390px;
          }

          .template-preview-stage {
            min-height: 570px;
          }

        }


        @media (max-width: 900px) {

          .templates-page {
            padding:
              26px 20px 45px;
          }


          .templates-header {
            align-items: flex-start;

            flex-direction: column;
          }


          .template-resume-selector {
            width: 100%;
            max-width: 360px;
          }


          .professional-template-card {
            grid-template-columns:
              1fr;
          }


          .professional-preview-column {
            border-right: 0;

            border-bottom:
              1px solid
              rgba(148, 163, 184, 0.12);
          }


          .professional-info-column {
            padding:
              30px 26px;
          }


          .template-paper {
            transform:
              scale(0.68);

            margin-bottom:
              -330px;
          }

        }


        @media (max-width: 620px) {

          .templates-page {
            padding:
              22px 13px 38px;
          }


          .templates-heading h1 {
            font-size: 30px;
          }


          .professional-preview-column {
            padding: 16px;
          }


          .preview-column-header {
            align-items: flex-start;
          }


          .preview-status {
            display: none;
          }


          .template-preview-stage {
            min-height: 455px;

            padding:
              18px 6px 20px;
          }


          .template-paper {
            transform:
              scale(0.51);

            margin-bottom:
              -520px;
          }


          .professional-info-column {
            padding:
              27px 20px;
          }


          .template-trust-row {
            justify-content:
              flex-start;

            padding:
              0 4px;
          }

        }

      `}</style>

    </div>
  );
}