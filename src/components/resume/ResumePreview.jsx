import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Download,
  Printer,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';

import ResumeDocument from '../templates/ResumeTemplates.jsx';

import {
  TEMPLATES,
  FONT_OPTIONS,
} from '../../data/templates.js';

import {
  exportElementToPdf,
  printResume,
} from '../../services/pdfService.js';

import { useToast } from '../ui/Toast.jsx';


/*
  8.5in × 11in at 96 CSS pixels per inch.
  The actual resume stays this size.
  Only the visual preview is scaled.
*/
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

const MIN_SCALE = 0.35;
const MAX_SCALE = 1;


export default function ResumePreview({
  resume,
  onFormattingChange,
  onTemplateChange,
}) {
  const printRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [exporting, setExporting] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [scale, setScale] = useState(0.7);
  const [autoFit, setAutoFit] = useState(true);

  const toast = useToast();

  const formatting = resume.formatting || {};


  /* =====================================================
     FIT THE 8.5in RESUME INSIDE AVAILABLE PREVIEW WIDTH
  ====================================================== */

  const calculateFitScale = useCallback(() => {
    const container = previewContainerRef.current;

    if (!container) {
      return;
    }

    /*
      We leave some space around the paper so it never
      touches or crosses the preview container.
    */
    const horizontalPadding = 32;

    const availableWidth = Math.max(
      280,
      container.clientWidth - horizontalPadding
    );

    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(
        MIN_SCALE,
        availableWidth / PAGE_WIDTH
      )
    );

    setScale(nextScale);
  }, []);


  useEffect(() => {
    if (!autoFit) {
      return undefined;
    }

    calculateFitScale();

    const element = previewContainerRef.current;

    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateFitScale();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoFit, calculateFitScale]);


  /* =====================================================
     PDF DOWNLOAD
  ====================================================== */

  
const handleDownload = async () => {
  const preview = printRef.current;
  const originalZoom = preview?.style.zoom;

  try {
    if (!preview) {
      throw new Error('Resume preview was not found.');
    }

    setExporting(true);

    // Export at the original document size for better PDF output.
    preview.style.zoom = '1';

    // Allow the browser to finish rendering the original page size.
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    const filename = `${
      (
        resume.personalInfo?.fullName ||
        resume.name ||
        'resume'
      ).replace(/\s+/g, '_')
    }.pdf`;

    const result = await exportElementToPdf(
      preview,
      filename
    );

    if (result.success) {
      toast.success('PDF downloaded successfully.');
    } else {
      toast.error(
        result.error || 'Could not export the PDF.'
      );
    }
  } catch (error) {
    toast.error(
      error?.message || 'Could not export the PDF.'
    );
  } finally {
    // Restore the live preview's zoom even if exporting fails.
    if (preview) {
      preview.style.zoom = originalZoom || '';
    }

    setExporting(false);
  }
};



  /* =====================================================
     ZOOM
  ====================================================== */

  const handleZoomIn = () => {
    setAutoFit(false);

    setScale((current) =>
      Math.min(
        MAX_SCALE,
        Number((current + 0.08).toFixed(2))
      )
    );
  };


  const handleZoomOut = () => {
    setAutoFit(false);

    setScale((current) =>
      Math.max(
        MIN_SCALE,
        Number((current - 0.08).toFixed(2))
      )
    );
  };


  const handleFit = () => {
    setAutoFit(true);

    requestAnimationFrame(() => {
      calculateFitScale();
    });
  };


  return (
    <div className="min-w-0">

      {/* =================================================
          PREVIEW HEADER
      ================================================== */}

      <div className="card overflow-hidden">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-300/70 px-3 py-3 sm:px-4">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

              </span>

              <h2 className="text-sm font-semibold text-ink-900">
                Live Preview
              </h2>

            </div>

            <p className="mt-0.5 hidden text-xs text-ink-400 sm:block">
              Your resume updates instantly as you edit.
            </p>

          </div>


          {/* =============================================
              TOOLBAR
          ============================================== */}

          <div className="flex flex-wrap items-center justify-end gap-1.5">

            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={handleZoomOut}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut size={15} />
            </button>


            <button
              type="button"
              className="min-w-[52px] rounded-lg px-2 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-200 hover:text-ink-900"
              onClick={handleFit}
              title="Fit resume to available width"
            >
              {Math.round(scale * 100)}%
            </button>


            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={handleZoomIn}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn size={15} />
            </button>


            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={handleFit}
              title="Fit to width"
              aria-label="Fit to width"
            >
              <Maximize2 size={15} />
            </button>


            <div className="mx-1 hidden h-6 w-px bg-ink-300 sm:block" />


            <button
              type="button"
              className={`btn-ghost btn-sm ${
                showFormatting
                  ? 'bg-ink-200 text-brand-400'
                  : ''
              }`}
              onClick={() =>
                setShowFormatting(
                  (current) => !current
                )
              }
              title="Formatting options"
            >
              <SlidersHorizontal size={15} />

              <span className="hidden xl:inline">
                Format
              </span>
            </button>


            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={printResume}
            >
              <Printer size={14} />

              <span className="hidden xl:inline">
                Print
              </span>
            </button>


            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={handleDownload}
              disabled={exporting}
            >

              {exporting ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Download size={14} />
              )}

              <span className="hidden sm:inline">
                Download PDF
              </span>

              <span className="sm:hidden">
                PDF
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            FORMATTING
        ================================================== */}

        {showFormatting && (
          <div className="border-b border-ink-300/70 bg-ink-50/30 p-3 sm:p-4">

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

              <Field label="Template">

                <select
                  className="input"
                  value={resume.template}
                  onChange={(e) =>
                    onTemplateChange(
                      e.target.value
                    )
                  }
                >

                  {TEMPLATES.map((template) => (
                    <option
                      key={template.id}
                      value={template.id}
                    >
                      {template.name}
                    </option>
                  ))}

                </select>

              </Field>


              <Field label="Font">

                <select
                  className="input"
                  value={
                    formatting.font ||
                    FONT_OPTIONS[0]?.id ||
                    ''
                  }
                  onChange={(e) =>
                    onFormattingChange({
                      ...formatting,
                      font: e.target.value,
                    })
                  }
                >

                  {FONT_OPTIONS.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                    >
                      {option.label}
                    </option>
                  ))}

                </select>

              </Field>


              <Field label="Font Size">

                <select
                  className="input"
                  value={
                    formatting.fontSize ||
                    'md'
                  }
                  onChange={(e) =>
                    onFormattingChange({
                      ...formatting,
                      fontSize:
                        e.target.value,
                    })
                  }
                >

                  <option value="sm">
                    Small
                  </option>

                  <option value="md">
                    Medium
                  </option>

                  <option value="lg">
                    Large
                  </option>

                </select>

              </Field>


              <Field label="Line Spacing">

                <select
                  className="input"
                  value={
                    formatting.lineSpacing ||
                    'normal'
                  }
                  onChange={(e) =>
                    onFormattingChange({
                      ...formatting,
                      lineSpacing:
                        e.target.value,
                    })
                  }
                >

                  <option value="tight">
                    Tight
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="relaxed">
                    Relaxed
                  </option>

                </select>

              </Field>


              <Field label="Margins">

                <select
                  className="input"
                  value={
                    formatting.margins ||
                    'normal'
                  }
                  onChange={(e) =>
                    onFormattingChange({
                      ...formatting,
                      margins:
                        e.target.value,
                    })
                  }
                >

                  <option value="narrow">
                    Narrow
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="wide">
                    Wide
                  </option>

                </select>

              </Field>


              <Field label="Accent Color">

                <input
                  type="color"
                  className="input h-[42px] cursor-pointer p-1.5"
                  value={
                    formatting.accentColor ||
                    '#8b5cf6'
                  }
                  onChange={(e) =>
                    onFormattingChange({
                      ...formatting,
                      accentColor:
                        e.target.value,
                    })
                  }
                />

              </Field>

            </div>

          </div>
        )}


        {/* =================================================
            PDF PREVIEW AREA
        ================================================== */}

        <div
          ref={previewContainerRef}
          className="relative min-w-0 overflow-auto bg-ink-200/40 p-3 sm:p-4 lg:max-h-[calc(100vh-11rem)] lg:min-h-[650px] lg:p-5"
        >

          {/*
            This wrapper has the SCALED dimensions.

            Because of this, the browser layout knows exactly
            how much room the scaled resume needs.

            That is what prevents the 816px resume from
            overflowing the right side.
          */}

          <div
            className="relative mx-auto"
            style={{
              width: `${PAGE_WIDTH * scale}px`,
              minHeight: `${PAGE_HEIGHT * scale}px`,
            }}
          >

            {/*
              This element remains the REAL Letter size.

              It is scaled visually for the UI, but PDF export
              still receives the original 816px-wide document.
            */}

            <div
              id="resume-print-area"
              ref={printRef}
              className="relative overflow-hidden bg-white shadow-panel"
              style={{
                width: `${PAGE_WIDTH}px`,
                minHeight: `${PAGE_HEIGHT}px`,
                zoom: scale,
                transform: 'none',
                transformOrigin: 'top left',
              }}
            >

              <ResumeDocument resume={resume} />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function Field({
  label,
  children,
}) {
  return (
    <div className="min-w-0">

      <label className="label">
        {label}
      </label>

      {children}

    </div>
  );
}