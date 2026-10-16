// Registry of the single recommended ATS-friendly resume template.
// The application intentionally uses a clean, no-photo, single-column
// reverse-chronological layout for broad recruiter and ATS compatibility.

export const TEMPLATES = [
  {
    id: 'classic-ats',
    name: 'Classic ATS — Recommended',
    description:
      'Professional single-column, no-photo resume format with clear sections and ATS-friendly structure.',
    columns: 1,
    accent: false,
    recommended: true,
  },
];

export function getTemplateById(id) {
  return (
    TEMPLATES.find(
      (template) => template.id === id
    ) || TEMPLATES[0]
  );
}

export const FONT_OPTIONS = [
  {
    id: 'Inter',
    label: 'Inter (Sans)',
    family:
      "'Inter', ui-sans-serif, system-ui, sans-serif",
  },
  {
    id: 'Georgia',
    label: 'Georgia (Serif)',
    family:
      "Georgia, 'Times New Roman', serif",
  },
  {
    id: 'SourceSerif',
    label: 'Source Serif (Serif)',
    family:
      "'Source Serif Pro', Georgia, serif",
  },
  {
    id: 'Arial',
    label: 'Arial (Sans)',
    family:
      'Arial, Helvetica, sans-serif',
  },
];

export const FONT_SIZE_MAP = {
  sm: 12.5,
  md: 13.5,
  lg: 15,
};

export const LINE_SPACING_MAP = {
  tight: 1.25,
  normal: 1.45,
  relaxed: 1.7,
};

export const MARGIN_MAP = {
  narrow: '0.4in',
  normal: '0.6in',
  wide: '0.9in',
};