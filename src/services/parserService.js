// Browser-compatible resume file parsing.
// PDF text is extracted locally using pdfjs-dist (no server round-trip).
// DOCX is not supported in a pure frontend build without a heavy dependency;
// we detect it and clearly ask the user to paste the text instead, rather
// than silently failing or crashing.

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const SUPPORTED_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  TXT: 'text/plain',
};

export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += `${pageText}\n`;
  }
  return fullText.trim();
}

export async function extractTextFromTxt(file) {
  return await file.text();
}

/**
 * Parses an uploaded resume file into plain text.
 * Returns { text, warning } — never throws; on failure, `text` is empty
 * and `warning` explains what happened so the UI can ask the user to
 * paste their resume manually instead.
 */
export async function parseResumeFile(file) {
  if (!file) return { text: '', warning: 'No file selected.' };

  try {
    if (file.type === SUPPORTED_TYPES.PDF || file.name.toLowerCase().endsWith('.pdf')) {
      const text = await extractTextFromPdf(file);
      if (!text || text.length < 20) {
        return {
          text: '',
          warning:
            'We could not extract readable text from this PDF (it may be a scanned image). Please paste your resume text manually below.',
        };
      }
      return { text, warning: null };
    }

    if (
      file.type === SUPPORTED_TYPES.DOCX ||
      file.type === SUPPORTED_TYPES.DOC ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc')
    ) {
      return {
        text: '',
        warning:
          'Word (.doc/.docx) files can\'t be parsed directly in the browser. Please open the file, copy the text, and paste it below — or export it to PDF and upload that instead.',
      };
    }

    if (file.type === SUPPORTED_TYPES.TXT || file.name.toLowerCase().endsWith('.txt')) {
      const text = await extractTextFromTxt(file);
      return { text, warning: null };
    }

    return {
      text: '',
      warning: 'Unsupported file type. Please upload a PDF or paste your resume text manually.',
    };
  } catch (err) {
    console.warn('[parserService] Failed to parse file', err);
    return {
      text: '',
      warning: 'We ran into a problem reading this file. Please paste your resume text manually below.',
    };
  }
}
