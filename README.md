# ResumeAI — AI Resume Builder & ATS Scanner

A production-quality, single-page web application for building professional, ATS-friendly resumes with AI-assisted writing, and for scanning resumes against a deterministic, rule-based ATS analyzer — with or without a target job description.

Everything runs entirely in the browser. There is no backend and no database: your data lives in your browser's `localStorage`, and AI calls (when configured) go straight from the browser to the Google Gemini API.

---

## Features

### Resume Builder
- Two-column desktop layout (form editor + live preview), stacked on mobile
- Full section set: Personal Info, Summary, Experience, Education, Skills (technical/soft/tools/languages), Projects, Certifications, Achievements, Publications, and optional Volunteer/Leadership/Extracurricular/Interests
- Add / delete / reorder for repeatable sections (experience, education)
- Six ATS-friendly templates: Classic ATS, Modern ATS, Executive, Tech, Compact, Professional Two-Column — switching templates never loses your data
- Live formatting controls: font, font size, line spacing, margins, accent color
- One-click **Download PDF** (matches the selected template) and browser **Print**
- Auto-saves to `localStorage` on every change

### AI Writing Assistance
- "Improve with AI" actions throughout: Generate/Improve/Make More Professional/Make More Concise for the summary; Improve/Action-Oriented/Add Impact/ATS-Friendly for each experience bullet; Improve/Generate for project descriptions; Suggest Relevant Skills; and a full **Optimize Resume with AI** pass
- Strict no-fabrication policy: the AI is instructed (and the local fallback is designed) to **never invent** job titles, companies, degrees, certifications, metrics, technologies, or years of experience — it only rephrases and strengthens what you actually entered
- Works fully offline/without a key: every AI action has a deterministic local fallback (rule-based rewriting, action-verb substitution, weak-phrase stripping) so the app is never blocked or broken by a missing or failing API key

### ATS Scanner
- Upload a PDF resume (parsed client-side with `pdfjs-dist`), upload a `.txt` file, paste resume text directly, or load one of your saved resumes
- Optionally paste a target job description for keyword matching
- Transparent, deterministic **0–100 ATS score** broken into 9 weighted categories (see [How ATS Scoring Works](#how-ats-scoring-works))
- Job description matching: Matched / Partial / Missing keywords, plus categorized JD breakdown (required skills, preferred skills, tools, job titles, domain keywords, soft skills, education)
- Weak-phrase detection ("responsible for", "worked on", "helped with", etc.) with rewrite suggestions
- Prioritized warnings grouped as High Priority / Medium / Good
- Recommendations never suggest a skill you don't have — only ever "Consider adding X if you have experience with it."

### My Resumes
- Card grid of all saved resumes with template, last-updated date, ATS score (if scanned), and target role
- Edit, Duplicate, Delete (with confirmation), Download PDF, and jump straight into an ATS Scan

### Dashboard
- Hero with primary CTAs (Create Resume, Scan Resume)
- Stat cards: Resumes Created, Average ATS Score, Applications Tracked, Last Updated Resume — with clean empty states
- Feature overview grid and a call-to-action banner

### Settings
- Default template / font / theme
- AI provider status (shows clearly whether a Gemini key is configured)
- Clear Local Data (with confirmation) — no account or login required anywhere in the app

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Routing | react-router-dom (HashRouter, so it works from a static file server with no server-side routing) |
| Persistence | Browser `localStorage` (no backend/database) |
| AI | Google Gemini API (`gemini-1.5-flash`), called directly from the browser, isolated in `src/services/aiService.js` |
| PDF export | `html2pdf.js` (html2canvas + jsPDF under the hood) |
| Resume file parsing | `pdfjs-dist` (client-side PDF text extraction) |
| IDs | `uuid` |

No traditional backend or database is used anywhere in this project.

---

## Architecture

```
src/
  components/
    layout/          Layout.jsx — sidebar nav, mobile topbar
    dashboard/        (dashboard-specific pieces live inline in pages/Dashboard.jsx)
    resume/           One form component per resume section (PersonalInfoForm, SummaryForm,
                       ExperienceForm, EducationForm, SkillsForm, ProjectsForm,
                       CertificationsForm, AchievementsForm, ExtraSectionsForm),
                       plus SectionCard (collapsible wrapper) and ResumePreview
    ats/              UploadPanel, ScoreOverview, KeywordMatchPanel, WarningsList
    templates/        ResumeTemplates.jsx — all 6 resume template renderers
    ui/                AiButton, Toast, ErrorBoundary, ScoreRing, CategoryBar
  pages/
    Dashboard.jsx, ResumeBuilder.jsx, MyResumes.jsx, ATSScanner.jsx,
    Templates.jsx, Settings.jsx, NotFound.jsx
  services/
    aiService.js       All AI calls + local fallback generators (isolated, reusable)
    atsService.js       Job-description keyword extraction + matching
    pdfService.js       PDF export / print
    parserService.js    Client-side PDF/TXT text extraction
  utils/
    resumeUtils.js      Resume data-model factories, cloning, plain-text flattening
    scoring.js          The deterministic ATS scoring engine (see below)
    storage.js           Safe localStorage wrapper (never throws)
  data/
    templates.js         Template registry + formatting option constants
    sampleResume.js       One fictional sample resume shown on first launch
  hooks/
    useResume.js          Resume list CRUD + persistence
    useLocalStorage.js     Generic localStorage-backed state hook
  App.jsx, main.jsx, index.css
```

---

## How ATS Scoring Works

Scoring is implemented entirely in `src/utils/scoring.js` and is **fully deterministic and rule-based** — the same resume text always produces the same score. There is no randomness anywhere in the scoring path.

The 100-point total is split across nine weighted categories:

| Category | Points | What it checks |
|---|---|---|
| Contact Information | 10 | Email, phone, LinkedIn, location detected via regex |
| Section Completeness | 10 | Summary / Experience / Education / Skills / Projects sections detected by heading aliases |
| Keyword Match | 25 | Overlap between resume text and job-description keyword frequency (or general keyword diversity if no JD is supplied) |
| Skills Match | 15 | Overlap between resume skills and a curated skill/tool dictionary, matched against the JD when provided |
| Experience Relevance | 15 | Presence of an experience section, employment dates, and contextual overlap with the JD |
| Formatting | 10 | Penalizes excessively long paragraphs/bullets, very short or very long resumes, heavy tab/column usage |
| Action Verbs | 5 | Ratio of bullets starting with a strong action verb vs. weak filler phrases |
| Readability | 5 | Average sentence/bullet length (ideal: 8–20 words) |
| Quantifiable Achievements | 5 | Presence of numbers, percentages, and scale indicators |

When no job description is supplied, Keyword Match and Skills Match fall back to general keyword-diversity heuristics instead of penalizing the user for not having a JD to match against.

The same engine also powers:
- **Weak phrase detection** ("responsible for", "worked on", "helped with", "assisted with", "involved in", "various tasks", "duties included", "in charge of", "hard worker", "team player") with a suggested rewrite for each
- **Repeated-word detection** for wording variety
- **Warnings** grouped into High Priority / Medium / Good, generated from the same underlying category results

Job-description matching (`src/services/atsService.js`) separately extracts a job description into Required Skills, Preferred Skills, Tools/Technologies, Job Titles, Domain Keywords, Soft Skills, and Education Requirements, then classifies every term as Matched / Partial / Missing against the resume. Recommendations are always phrased as *"Consider adding X if you have experience with it"* — the app never tells you to add a skill outright, since it has no way to know whether you actually have it.

**Important:** ATS compatibility is directional guidance, not a guarantee. Real-world ATS platforms vary significantly between vendors and companies. A high score improves your odds of getting past automated filtering — it does not guarantee an interview or a job offer. The app states this directly in the sidebar and at the bottom of every scan.

---

## AI Features & the No-Fabrication Rule

All AI logic is isolated in `src/services/aiService.js`. When `VITE_GEMINI_API_KEY` is set, requests go to the Gemini API with a system preamble that explicitly instructs the model to:

- Never invent job titles, companies, degrees, certifications, achievements, metrics, technologies, or years of experience
- Only rephrase, restructure, and strengthen what the user already provided
- Never fabricate a number or percentage that wasn't supplied
- Avoid weak phrases ("Responsible for", "Worked on", "Helped with", etc.) and excessive buzzwords
- Prefer the structure **Action + Task + Method/Technology + Result** (result/metric only if the user supplied one)

**When no API key is configured (or a request fails), every AI action falls back to a local, deterministic, rule-based rewriter** that only ever reshapes the user's own text (stripping weak openers, substituting a contextually-appropriate strong verb, trimming filler words). The app never crashes, never blocks the user, and never fabricates content in either mode. A visible banner in the Resume Builder tells you which mode is active.

---

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and optionally add a Gemini API key:

```bash
cp .env.example .env
```

```
VITE_GEMINI_API_KEY=your_key_here
```

Get a free key at https://aistudio.google.com/app/apikey. **The app works fully without this key** — AI actions simply use the local rule-based fallback described above, and the ATS Scanner always works locally regardless of whether a key is set.

Never commit your real `.env` file — it's already excluded via `.gitignore`.

## Running Locally

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Building for Production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deployment

Since this is a fully static, backend-free app, `dist/` can be deployed to any static host: Vercel, Netlify, GitHub Pages, Cloudflare Pages, or a plain S3/CDN bucket. The app uses `HashRouter`, so client-side routes (`/#/builder`, `/#/ats-scanner`, etc.) work correctly even on hosts with no server-side rewrite rules configured. If you'd rather use clean URLs on a host that supports SPA rewrites, you can switch `HashRouter` to `BrowserRouter` in `src/main.jsx` and configure your host's rewrite rule to serve `index.html` for all paths.

---

## Limitations

- **DOCX parsing is not supported client-side.** Parsing `.docx` in a pure frontend build would require a heavy dependency; instead the app detects `.docx`/`.doc` uploads and clearly asks the user to paste the resume text (or export to PDF first) rather than silently failing.
- **Scanned/image-only PDFs** have no extractable text layer, so text extraction will fail; the app detects this and prompts for manual paste instead of crashing.
- **The ATS score is a local heuristic**, not a simulation of any specific commercial ATS product (Workday, Taleo, Greenhouse, etc.). Real systems vary and this is explicitly communicated in the UI.
- **AI features depend on the Gemini API when a key is configured**; API outages or rate limits trigger the local fallback automatically, with a toast notification explaining what happened.
- **All data is local to one browser.** There's no sync across devices/browsers since there's no backend by design — clearing browser storage will remove all saved resumes.
- **PDF export fidelity** depends on `html2canvas` rendering of the live DOM; extremely long resumes may need manual page-break checks in the exported PDF.

## Future Improvements

- Optional DOCX parsing via a WASM-based library if a heavier bundle size becomes acceptable
- Multi-resume ATS comparison view
- Export/import a resume as JSON for backup or transfer between browsers
- Cover letter generator using the same AI service and no-fabrication guardrails
- Optional cloud sync backend for cross-device access (would require adding a real backend, which is intentionally out of scope for this project)

---

## Honest Language Policy

This app never claims "100% ATS guaranteed," "guaranteed interview," or "guaranteed job." ATS compatibility improves your odds of getting past automated screening — it is not a guarantee of any outcome. The most reliable resume is one that is clear, relevant, truthful, keyword-aligned where genuinely applicable, easy to read, and appropriately formatted.
