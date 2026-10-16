// ============================================================================
// ResumeAI — AI Service
// ----------------------------------------------------------------------------
// Single isolated entry point for all AI-assisted writing features.
// Uses the Google Gemini API when VITE_GEMINI_API_KEY is configured.
// Falls back to deterministic, rule-based local text generation when no key
// is present or when the API call fails — the app never crashes and never
// blocks the user from getting *some* useful output.
//
// HARD RULE: the AI must never invent facts (job titles, companies, degrees,
// certifications, metrics, technologies, years of experience). All prompts
// instruct the model accordingly, and local fallbacks only ever rephrase or
// restructure content the user already supplied.
// ============================================================================

import { STRONG_ACTION_VERBS } from '../utils/scoring.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export function isAiConfigured() {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10);
}

const SYSTEM_PREAMBLE = `You are a professional resume writer and technical recruiter with 15 years of experience helping candidates pass Applicant Tracking Systems (ATS) and impress human recruiters.

STRICT RULES YOU MUST FOLLOW:
- Never invent or fabricate facts: do not add job titles, companies, degrees, certifications, achievements, metrics, technologies, or years of experience that the user did not provide.
- Only rephrase, restructure, and strengthen what the user actually gave you.
- If a metric or number is not present in the user's input, do NOT invent one — write the bullet without a fabricated number.
- Use strong action verbs. Avoid "Responsible for", "Worked on", "Helped with", "Assisted with", vague filler, and excessive buzzwords.
- Prefer the structure: Action + Task + Method/Technology + Result (only include a result/metric if the user supplied one).
- Keep output concise and ATS-friendly (plain text, no markdown symbols, no emojis).
- Return ONLY the requested content with no preamble, no explanation, and no quotation marks around it.`;

async function callGemini(prompt, { temperature = 0.4, maxOutputTokens = 400 } = {}) {
  if (!isAiConfigured()) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PREAMBLE}\n\n${prompt}` }],
          },
        ],
        generationConfig: { temperature, maxOutputTokens },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`GEMINI_HTTP_${res.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    if (!text.trim()) throw new Error('GEMINI_EMPTY_RESPONSE');
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Wraps an AI call with graceful fallback. `fallbackFn` is always a pure,
 * local, deterministic function that only reshapes user-supplied content.
 */
async function withFallback(aiCall, fallbackFn, fallbackArgs) {
  if (!isAiConfigured()) {
    return { text: fallbackFn(...fallbackArgs), source: 'local', warning: null };
  }
  try {
    const text = await aiCall();
    return { text, source: 'ai', warning: null };
  } catch (err) {
    console.warn('[aiService] Falling back to local generation:', err.message);
    return {
      text: fallbackFn(...fallbackArgs),
      source: 'local',
      warning:
        'AI service is unavailable right now, so we used a local rule-based rewrite instead. Your content was not lost.',
    };
  }
}

// ---------------------------------------------------------------------------
// Local (offline) fallback generators — deterministic, fact-preserving.
// ---------------------------------------------------------------------------

function localImproveBullet(bulletText) {
  let text = (bulletText || '').trim();
  if (!text) return 'Describe a specific task, tool used, and outcome achieved.';

  const weakStarts = [
    [/^responsible for\s*/i, ''], [/^worked on\s*/i, ''], [/^helped with\s*/i, ''],
    [/^assisted with\s*/i, ''], [/^involved in\s*/i, ''], [/^in charge of\s*/i, ''],
    [/^duties included\s*/i, ''],
  ];
  weakStarts.forEach(([pattern, replacement]) => { text = text.replace(pattern, replacement); });

  const firstWord = text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  const alreadyStrong = STRONG_ACTION_VERBS.includes(firstWord);

  if (!alreadyStrong && text.length > 0) {
    const verb = pickActionVerb(text);
    text = `${verb} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }

  text = text.replace(/\.$/, '');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

function pickActionVerb(text) {
  const lower = text.toLowerCase();
  if (/(built|develop|creat|implement|code|program)/.test(lower)) return 'Developed';
  if (/(design)/.test(lower)) return 'Designed';
  if (/(manag|oversaw|supervis)/.test(lower)) return 'Managed';
  if (/(lead|led|leadership)/.test(lower)) return 'Led';
  if (/(improv|optimi|enhanc)/.test(lower)) return 'Improved';
  if (/(analy)/.test(lower)) return 'Analyzed';
  if (/(test|qa|quality)/.test(lower)) return 'Tested';
  if (/(present|communicat)/.test(lower)) return 'Presented';
  if (/(coordinat|organiz)/.test(lower)) return 'Coordinated';
  if (/(automat)/.test(lower)) return 'Automated';
  return 'Executed';
}

function localMakeActionOriented(bulletText) {
  return localImproveBullet(bulletText);
}

function localAddQuantifiablePlaceholder(bulletText) {
  const improved = localImproveBullet(bulletText);
  if (/\d/.test(improved)) return improved;
  return `${improved} [add a metric here if available, e.g. "by 20%" or "for 500+ users"]`;
}

function localMakeAtsFriendly(bulletText) {
  let text = localImproveBullet(bulletText);
  text = text.replace(/&/g, 'and').replace(/\s{2,}/g, ' ');
  return text;
}

function localGenerateSummary({ title, yearsHint, topSkills = [], targetRole }) {
  const roleText = targetRole || title || 'professional';
  const skillsText = topSkills.length ? ` skilled in ${topSkills.slice(0, 4).join(', ')}` : '';
  const experienceText = yearsHint ? `${yearsHint} ` : '';
  return `${experienceText}${roleText}${skillsText}. Focused on delivering high-quality results through strong technical ability, clear communication, and attention to detail. Seeking to bring proven skills and a collaborative approach to a new team.`.trim();
}

function localImproveSummary(summaryText) {
  let text = (summaryText || '').trim();
  if (!text) return localGenerateSummary({});
  text = text.replace(/^I am\s+/i, '').replace(/^I'm\s+/i, '');
  text = text.replace(/\bvery\s+/gi, '').replace(/\breally\s+/gi, '');
  if (!/^[A-Z]/.test(text)) text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

function localMakeConcise(text) {
  const sentences = (text || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  const trimmed = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.7)));
  return trimmed.join(' ').trim();
}

function localMakeMoreProfessional(text) {
  let result = (text || '').trim();
  const replacements = [
    [/\bawesome\b/gi, 'excellent'], [/\bstuff\b/gi, 'work'], [/\bthings\b/gi, 'responsibilities'],
    [/\bgot\b/gi, 'obtained'], [/\bkinda\b/gi, 'relatively'], [/\ba lot of\b/gi, 'extensive'],
  ];
  replacements.forEach(([pattern, replacement]) => { result = result.replace(pattern, replacement); });
  return result;
}

function localSuggestSkills(existingSkills = [], roleHint = '') {
  const lower = roleHint.toLowerCase();
  const pool = {
    frontend: ['React', 'TypeScript', 'CSS', 'Accessibility', 'Webpack', 'Vite'],
    backend: ['Node.js', 'REST APIs', 'SQL', 'Docker', 'System Design', 'Microservices'],
    data: ['Python', 'SQL', 'Pandas', 'Data Visualization', 'Statistics', 'ETL'],
    default: ['Git', 'Agile/Scrum', 'Problem Solving', 'Communication', 'Testing', 'Documentation'],
  };
  let bucket = pool.default;
  if (/front|react|ui|ux/.test(lower)) bucket = pool.frontend;
  else if (/back|api|server|node|java|python/.test(lower)) bucket = pool.backend;
  else if (/data|analy|scien/.test(lower)) bucket = pool.data;

  const existingLower = existingSkills.map((s) => s.toLowerCase());
  return bucket.filter((s) => !existingLower.includes(s.toLowerCase()));
}

function localImproveProjectDescription(description) {
  return localImproveBullet(description);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateSummary({ title, targetRole, topSkills, yearsHint }) {
  const prompt = `Write a 2-3 sentence professional resume summary for a candidate.
Title: ${title || 'Not specified'}
Target role: ${targetRole || 'Not specified'}
Top skills the candidate actually has: ${(topSkills || []).join(', ') || 'Not specified'}
Years of experience hint (only use if provided, do not invent a number): ${yearsHint || 'Not specified'}
Do not invent skills, job titles, or experience not listed above.`;
  return withFallback(
    () => callGemini(prompt),
    localGenerateSummary,
    [{ title, yearsHint, topSkills, targetRole }]
  );
}

export async function improveSummary(summaryText) {
  const prompt = `Improve this resume professional summary. Keep all facts the same, just improve clarity, tone, and impact. Return only the improved summary.\n\nOriginal summary:\n"""${summaryText}"""`;
  return withFallback(() => callGemini(prompt), localImproveSummary, [summaryText]);
}

export async function makeSummaryMoreProfessional(summaryText) {
  const prompt = `Rewrite this resume summary to sound more professional and polished, without changing any facts or adding new claims. Return only the rewritten summary.\n\n"""${summaryText}"""`;
  return withFallback(() => callGemini(prompt), localMakeMoreProfessional, [summaryText]);
}

export async function makeSummaryMoreConcise(summaryText) {
  const prompt = `Make this resume summary more concise (max 2 sentences) while keeping all facts. Return only the result.\n\n"""${summaryText}"""`;
  return withFallback(() => callGemini(prompt), localMakeConcise, [summaryText]);
}

export async function improveBullet(bulletText) {
  const prompt = `Rewrite this single resume bullet point to be a strong, concise, ATS-friendly bullet using the structure Action + Task + Method/Technology + Result. Only include a metric if one already appears in the original text — do not invent numbers. Return only the rewritten bullet, no leading dash.\n\nOriginal bullet:\n"""${bulletText}"""`;
  return withFallback(() => callGemini(prompt), localImproveBullet, [bulletText]);
}

export async function makeActionOriented(bulletText) {
  const prompt = `Rewrite this resume bullet to start with a strong action verb and be more achievement-oriented. Do not invent facts or numbers. Return only the rewritten bullet.\n\n"""${bulletText}"""`;
  return withFallback(() => callGemini(prompt), localMakeActionOriented, [bulletText]);
}

export async function addQuantifiableImpact(bulletText) {
  const prompt = `This resume bullet may be missing a measurable result. If the text already implies a metric, phrase it clearly. If there is truly no metric available, insert a bracketed placeholder like [add a metric if available] rather than inventing a number. Do not fabricate any statistic. Return only the bullet.\n\n"""${bulletText}"""`;
  return withFallback(() => callGemini(prompt), localAddQuantifiablePlaceholder, [bulletText]);
}

export async function makeAtsFriendly(bulletText) {
  const prompt = `Rewrite this resume bullet to be maximally ATS-friendly: plain text, no special characters, clear keywords, no invented facts. Return only the bullet.\n\n"""${bulletText}"""`;
  return withFallback(() => callGemini(prompt), localMakeAtsFriendly, [bulletText]);
}

export async function improveProjectDescription(description) {
  const prompt = `Rewrite this project description for a resume to be concise, technical, and impact-focused. Do not invent technologies or outcomes not mentioned. Return only the description.\n\n"""${description}"""`;
  return withFallback(() => callGemini(prompt), localImproveProjectDescription, [description]);
}

export async function generateProjectDescription({ name, technologies, roughNotes }) {
  const prompt = `Write a concise 1-2 sentence professional resume project description.
Project name: ${name || 'Not specified'}
Technologies actually used: ${technologies || 'Not specified'}
Rough notes from the candidate: ${roughNotes || 'Not specified'}
Do not invent technologies, features, or results not mentioned above.`;
  return withFallback(
    () => callGemini(prompt),
    () => `${name || 'This project'} built using ${technologies || 'the listed technologies'}. ${roughNotes || ''}`.trim(),
    []
  );
}

export async function suggestSkills({ existingSkills = [], roleHint = '', experienceText = '' }) {
  const prompt = `Based on this candidate's role/target role "${roleHint}" and their described experience below, suggest up to 6 relevant skills they likely have but have not yet listed. Only suggest skills that are reasonably implied by their actual experience text — do not suggest unrelated or advanced skills with no supporting evidence. Return a comma-separated list only, no explanation.
Existing skills: ${existingSkills.join(', ') || 'None listed'}
Experience text:
"""${experienceText}"""`;
  const result = await withFallback(
    () => callGemini(prompt),
    () => localSuggestSkills(existingSkills, roleHint).join(', '),
    []
  );
  const skills = result.text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s && s.length < 40 && !existingSkills.map((e) => e.toLowerCase()).includes(s.toLowerCase()));
  return { ...result, skills: [...new Set(skills)].slice(0, 6) };
}

export async function optimizeResume(resumePlainText) {
  const prompt = `Review this resume and provide a short, prioritized list (max 6 bullet points) of the most impactful improvements the candidate should make. Do not invent any facts. Focus on structure, clarity, ATS-friendliness, and impact. Return each suggestion on its own line, no numbering.\n\n"""${resumePlainText}"""`;
  return withFallback(
    () => callGemini(prompt, { maxOutputTokens: 500 }),
    () =>
      [
        'Add measurable outcomes (numbers, percentages, or scale) to your experience bullets where possible.',
        'Make sure every bullet starts with a strong action verb rather than "Responsible for" or "Worked on".',
        'Keep your professional summary to 2-3 sentences focused on your strongest, most relevant skills.',
        'Ensure your Skills section lists specific technologies and tools relevant to your target role.',
        'Double-check contact information (email, phone, LinkedIn) is complete and easy to find.',
        'Keep formatting simple: consistent dates, clear section headers, and no text embedded in images.',
      ].join('\n'),
    []
  );
}
