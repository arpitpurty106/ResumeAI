// Browser-based PDF export. Renders the live resume preview DOM node to a
// PDF that preserves the selected template's layout as closely as possible.

export async function exportElementToPdf(element, filename = 'resume.pdf') {
  if (!element) {
    throw new Error('Nothing to export — the resume preview was not found.');
  }
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return { success: true, error: null };
  } catch (err) {
    console.error('[pdfService] PDF export failed', err);
    return { success: false, error: 'We could not generate the PDF. Please try again, or use your browser\'s Print > Save as PDF as a fallback.' };
  }
}

export function printResume() {
  window.print();
}
