// ============================================================================
// ResumeAI — Deterministic ATS Scoring Engine
// ----------------------------------------------------------------------------
// This is a fully rule-based, local, deterministic scoring system.
// No randomness is used anywhere. The same input always produces the same
// score. Total possible score = 100, split across weighted categories:
//
//   Contact Information ............ 10
//   Section Completeness ........... 10
//   Keyword Match (vs. JD) ......... 25
//   Skills Match (vs. JD) .......... 15
//   Experience Relevance ........... 15
//   Formatting ...................... 10
//   Action Verbs ..................... 5
//   Readability ...................... 5
//   Quantifiable Achievements ........ 5
//   ---------------------------------------
//   TOTAL ........................... 100
//
// When no job description is supplied, Keyword Match and Skills Match are
// instead scored against a generic, resume-agnostic heuristic (keyword
// density / diversity and presence of a dedicated skills section), so the
// weights stay meaningful without penalizing users who only want a general
// health check.
// ============================================================================

export const SCORE_WEIGHTS = {
  contact: 10,
  completeness: 10,
  keywordMatch: 25,
  skillsMatch: 15,
  experienceRelevance: 15,
  formatting: 10,
  actionVerbs: 5,
  readability: 5,
  quantifiable: 5,
};

export const WEAK_PHRASES = [
  { phrase: 'responsible for', suggestion: 'Lead with an action verb, e.g. "Managed", "Owned", "Directed"' },
  { phrase: 'worked on', suggestion: 'Be specific: "Built", "Developed", "Engineered"' },
  { phrase: 'helped with', suggestion: 'Clarify your role: "Contributed to", "Co-led", "Supported delivery of"' },
  { phrase: 'assisted with', suggestion: 'Use a direct action verb describing your contribution' },
  { phrase: 'involved in', suggestion: 'State what you actually did, not just involvement' },
  { phrase: 'various tasks', suggestion: 'List the specific tasks or the most impactful ones' },
  { phrase: 'duties included', suggestion: 'Rewrite as achievement-oriented bullets, not a duty list' },
  { phrase: 'in charge of', suggestion: 'Use "Led", "Managed", or "Directed"' },
  { phrase: 'hard worker', suggestion: 'Show hard work through results and metrics instead' },
  { phrase: 'team player', suggestion: 'Demonstrate collaboration with a concrete example instead' },
];

export const STRONG_ACTION_VERBS = [
  'achieved','accelerated','architected','automated','built','launched','led','managed','designed',
  'developed','delivered','engineered','improved','increased','reduced','decreased','optimized',
  'implemented','streamlined','spearheaded','orchestrated','negotiated','mentored','coordinated',
  'created','established','executed','generated','drove','scaled','resolved','analyzed','directed',
  'transformed','pioneered','initiated','restructured','strengthened','modernized','migrated',
];

const SECTION_ALIASES = {
  summary: ['summary', 'professional summary', 'profile', 'objective', 'about'],
  experience: ['experience', 'work experience', 'employment history', 'professional experience'],
  education: ['education', 'academic background'],
  skills: ['skills', 'technical skills', 'core competencies'],
  projects: ['projects', 'personal projects', 'academic projects'],
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?){2,4}\d{3,4}/;
const LINKEDIN_REGEX = /linkedin\.com\/[a-zA-Z0-9\-_/]+/i;
const GITHUB_REGEX = /github\.com\/[a-zA-Z0-9\-_/]+/i;
const URL_REGEX = /https?:\/\/[^\s)]+/gi;
const DATE_REGEX = /\b(19|20)\d{2}\b/g;
const METRIC_REGEX = /(\d+(\.\d+)?\s?(%|percent|x|k|K|M|million|billion|hours?|days?|weeks?|months?|years?|users?|customers?|clients?))/g;
const NUMBER_REGEX = /\b\d+(\.\d+)?\b/g;

const STOPWORDS = new Set(
  ('a an the and or but if then else for to of in on at by with from as is are was were be been being ' +
    'this that these those it its it\'s we you your our their his her they them i me my mine will would ' +
    'can could should shall may might must have has had do does did not no nor so than too very just ' +
    'about into over under again further once here there when where why how all any both each few more ' +
    'most other some such only own same').split(' ')
);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w.length > 1 && !STOPWORDS.has(w));
}

export function extractKeywordFrequency(text, topN = 40) {
  const freq = new Map();
  tokenize(text).forEach((word) => freq.set(word, (freq.get(word) || 0) + 1));
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

function detectSections(text) {
  const lower = text.toLowerCase();
  const found = {};
  Object.entries(SECTION_ALIASES).forEach(([key, aliases]) => {
    found[key] = aliases.some((alias) => lower.includes(alias));
  });
  return found;
}

function scoreContact(text) {
  let score = 0;
  const details = [];
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  const hasLinkedIn = LINKEDIN_REGEX.test(text);
  const hasLocationHint = /\b[A-Z][a-z]+,\s?[A-Z]{2}\b/.test(text) || /\b(remote|on-site|hybrid)\b/i.test(text);

  if (hasEmail) { score += 4; details.push({ label: 'Email detected', ok: true }); }
  else details.push({ label: 'Email missing', ok: false });

  if (hasPhone) { score += 3; details.push({ label: 'Phone number detected', ok: true }); }
  else details.push({ label: 'Phone number missing', ok: false });

  if (hasLinkedIn) { score += 2; details.push({ label: 'LinkedIn profile detected', ok: true }); }
  else details.push({ label: 'LinkedIn profile not found', ok: false });

  if (hasLocationHint) { score += 1; details.push({ label: 'Location detected', ok: true }); }
  else details.push({ label: 'Location not clearly detected', ok: false });

  return { score: clamp(score, 0, SCORE_WEIGHTS.contact), details, hasEmail, hasPhone, hasLinkedIn };
}

function scoreCompleteness(text) {
  const sections = detectSections(text);
  const keys = Object.keys(sections);
  const foundCount = keys.filter((k) => sections[k]).length;
  const score = Math.round((foundCount / keys.length) * SCORE_WEIGHTS.completeness);
  const details = keys.map((k) => ({ label: `${k[0].toUpperCase() + k.slice(1)} section`, ok: sections[k] }));
  return { score, details, sections };
}

function scoreKeywordMatch(resumeText, jdText) {
  if (!jdText || !jdText.trim()) {
    // No JD: score based on keyword diversity/density as a general proxy.
    const freq = extractKeywordFrequency(resumeText, 100);
    const uniqueRatio = freq.length ? clamp(freq.length / 60, 0, 1) : 0;
    const score = Math.round(uniqueRatio * SCORE_WEIGHTS.keywordMatch);
    return { score, matched: [], missing: [], partial: [], mode: 'generic' };
  }
  const resumeWords = new Set(tokenize(resumeText));
  const jdFreq = extractKeywordFrequency(jdText, 60);
  const matched = [];
  const missing = [];
  jdFreq.forEach(({ word, count }) => {
    if (resumeWords.has(word)) matched.push(word);
    else missing.push(word);
  });
  const total = jdFreq.length || 1;
  const ratio = matched.length / total;
  const score = Math.round(ratio * SCORE_WEIGHTS.keywordMatch);
  return { score, matched, missing, ratio, mode: 'jd' };
}

const SKILL_HINTS = [
  'javascript','typescript','python','java','c++','c#','react','angular','vue','node','node.js','express',
  'django','flask','spring','sql','nosql','mongodb','postgresql','mysql','redis','aws','azure','gcp',
  'docker','kubernetes','ci/cd','git','github','gitlab','rest','graphql','api','html','css','tailwind',
  'sass','figma','agile','scrum','jira','linux','bash','terraform','ansible','microservices','testing',
  'jest','cypress','selenium','machine learning','tensorflow','pytorch','pandas','numpy','excel','tableau',
  'power bi','salesforce','sap','communication','leadership','teamwork','problem solving','project management',
];

function extractSkillsFromText(text) {
  const lower = (text || '').toLowerCase();
  return SKILL_HINTS.filter((skill) => lower.includes(skill));
}

function scoreSkillsMatch(resumeText, jdText, resumeSkillsList) {
  const resumeSkills = new Set([
    ...(resumeSkillsList || []).map((s) => s.toLowerCase()),
    ...extractSkillsFromText(resumeText),
  ]);

  if (!jdText || !jdText.trim()) {
    const score = clamp(Math.round((resumeSkills.size / 12) * SCORE_WEIGHTS.skillsMatch), 0, SCORE_WEIGHTS.skillsMatch);
    return { score, matched: [...resumeSkills], missing: [], mode: 'generic' };
  }

  const jdSkills = new Set(extractSkillsFromText(jdText));
  if (jdSkills.size === 0) {
    return { score: Math.round(SCORE_WEIGHTS.skillsMatch * 0.6), matched: [...resumeSkills], missing: [], mode: 'no-skills-in-jd' };
  }
  const matched = [...jdSkills].filter((s) => resumeSkills.has(s));
  const missing = [...jdSkills].filter((s) => !resumeSkills.has(s));
  const ratio = matched.length / jdSkills.size;
  const score = Math.round(ratio * SCORE_WEIGHTS.skillsMatch);
  return { score, matched, missing, ratio, mode: 'jd' };
}

function scoreExperienceRelevance(resumeText, jdText, hasExperienceSection) {
  let score = 0;
  const details = [];
  if (hasExperienceSection) { score += 5; details.push({ label: 'Experience section present', ok: true }); }
  else details.push({ label: 'Experience section missing', ok: false });

  const dateMatches = resumeText.match(DATE_REGEX) || [];
  if (dateMatches.length >= 2) { score += 3; details.push({ label: 'Employment dates detected', ok: true }); }
  else details.push({ label: 'Employment dates unclear or missing', ok: false });

  if (jdText && jdText.trim()) {
    const jdTitleWords = new Set(tokenize(jdText).slice(0, 30));
    const resumeWords = new Set(tokenize(resumeText));
    const overlap = [...jdTitleWords].filter((w) => resumeWords.has(w)).length;
    const ratio = clamp(overlap / Math.max(jdTitleWords.size, 1), 0, 1);
    const jdScore = Math.round(ratio * 7);
    score += jdScore;
    details.push({ label: 'Experience aligns with job description context', ok: ratio > 0.3 });
  } else {
    score += 4; // neutral baseline without JD
  }

  return { score: clamp(score, 0, SCORE_WEIGHTS.experienceRelevance), details };
}

function scoreFormatting(text) {
  let score = SCORE_WEIGHTS.formatting;
  const issues = [];
  const lines = text.split('\n').filter((l) => l.trim());

  const longLines = lines.filter((l) => l.length > 220);
  if (longLines.length > 0) { score -= 2; issues.push('Some paragraphs are excessively long — break into shorter bullets.'); }

  const bulletLines = lines.filter((l) => /^[-•*]/.test(l.trim()));
  const veryLongBullets = bulletLines.filter((l) => l.length > 200);
  if (veryLongBullets.length > 0) { score -= 2; issues.push('Some bullet points are too long for quick scanning.'); }

  if (text.length < 400) { score -= 3; issues.push('Resume content looks very short — may be missing detail.'); }
  if (text.length > 9000) { score -= 2; issues.push('Resume content is very long — consider tightening to 1-2 pages.'); }

  const urls = text.match(URL_REGEX) || [];
  if (urls.length > 6) { score -= 1; issues.push('Many raw links detected — ensure they render as clean text, not just icons.'); }

  const tabCount = (text.match(/\t/g) || []).length;
  if (tabCount > 20) { score -= 1; issues.push('Heavy use of tabs/columns detected — some ATS parsers struggle with complex layouts.'); }

  return { score: clamp(score, 0, SCORE_WEIGHTS.formatting), issues };
}

function scoreActionVerbs(text) {
  const bulletLines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[-•*]/.test(l))
    .map((l) => l.replace(/^[-•*]\s*/, ''));

  if (bulletLines.length === 0) {
    return { score: Math.round(SCORE_WEIGHTS.actionVerbs * 0.4), strongCount: 0, weakCount: 0, total: 0 };
  }

  let strongCount = 0;
  let weakCount = 0;
  bulletLines.forEach((line) => {
    const firstWord = tokenize(line)[0] || '';
    if (STRONG_ACTION_VERBS.includes(firstWord)) strongCount += 1;
    WEAK_PHRASES.forEach(({ phrase }) => {
      if (line.toLowerCase().includes(phrase)) weakCount += 1;
    });
  });

  const ratio = clamp(strongCount / bulletLines.length, 0, 1);
  const penalty = clamp(weakCount * 0.05, 0, 0.5);
  const score = Math.round(clamp(ratio - penalty, 0, 1) * SCORE_WEIGHTS.actionVerbs);
  return { score, strongCount, weakCount, total: bulletLines.length };
}

function scoreReadability(text) {
  const sentences = text.split(/[.!?\n]/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length === 0) return { score: 0, avgLength: 0 };
  const avgLength = sentences.reduce((sum, s) => sum + tokenize(s).length, 0) / sentences.length;
  // Ideal average bullet/sentence length: 8-20 words.
  let score;
  if (avgLength >= 8 && avgLength <= 20) score = SCORE_WEIGHTS.readability;
  else if (avgLength < 8) score = Math.round(SCORE_WEIGHTS.readability * 0.7);
  else score = clamp(Math.round(SCORE_WEIGHTS.readability - (avgLength - 20) * 0.3), 1, SCORE_WEIGHTS.readability);
  return { score: clamp(score, 0, SCORE_WEIGHTS.readability), avgLength: Math.round(avgLength * 10) / 10 };
}

function scoreQuantifiable(text) {
  const metrics = text.match(METRIC_REGEX) || [];
  const numbers = text.match(NUMBER_REGEX) || [];
  const count = metrics.length || numbers.length;
  let score = 0;
  if (count >= 5) score = SCORE_WEIGHTS.quantifiable;
  else if (count >= 3) score = Math.round(SCORE_WEIGHTS.quantifiable * 0.75);
  else if (count >= 1) score = Math.round(SCORE_WEIGHTS.quantifiable * 0.45);
  return { score, count };
}

function findRepeatedWords(text, minCount = 6) {
  const freq = extractKeywordFrequency(text, 200);
  return freq.filter((f) => f.count >= minCount).slice(0, 8);
}

function findWeakPhrases(text) {
  const lower = text.toLowerCase();
  return WEAK_PHRASES.filter(({ phrase }) => lower.includes(phrase));
}

/**
 * Main entry point: analyze resume text (optionally against a job description)
 * and return a full, deterministic, rule-based ATS report.
 */
export function analyzeResume({ resumeText, jdText = '', resumeSkillsList = [] }) {
  const text = resumeText || '';
  const sections = detectSections(text);

  const contact = scoreContact(text);
  const completeness = scoreCompleteness(text);
  const keyword = scoreKeywordMatch(text, jdText);
  const skills = scoreSkillsMatch(text, jdText, resumeSkillsList);
  const experience = scoreExperienceRelevance(text, jdText, sections.experience);
  const formatting = scoreFormatting(text);
  const actionVerbs = scoreActionVerbs(text);
  const readability = scoreReadability(text);
  const quantifiable = scoreQuantifiable(text);

  const categoryScores = {
    contact: contact.score,
    completeness: completeness.score,
    keywordMatch: keyword.score,
    skillsMatch: skills.score,
    experienceRelevance: experience.score,
    formatting: formatting.score,
    actionVerbs: actionVerbs.score,
    readability: readability.score,
    quantifiable: quantifiable.score,
  };

  const totalScore = clamp(
    Object.values(categoryScores).reduce((a, b) => a + b, 0),
    0,
    100
  );

  const repeatedWords = findRepeatedWords(text);
  const weakPhrases = findWeakPhrases(text);

  const warnings = buildWarnings({
    contact, completeness, keyword, skills, experience, formatting,
    actionVerbs, readability, quantifiable, weakPhrases, repeatedWords, jdText,
  });

  return {
    totalScore,
    categoryScores,
    categoryPercents: Object.fromEntries(
      Object.entries(categoryScores).map(([k, v]) => [k, Math.round((v / SCORE_WEIGHTS[k]) * 100)])
    ),
    weights: SCORE_WEIGHTS,
    details: { contact, completeness, keyword, skills, experience, formatting, actionVerbs, readability, quantifiable },
    weakPhrases,
    repeatedWords,
    warnings,
    hasJobDescription: !!(jdText && jdText.trim()),
    analyzedAt: new Date().toISOString(),
  };
}

function buildWarnings(ctx) {
  const high = [];
  const medium = [];
  const good = [];

  if (!ctx.completeness.sections.summary) high.push('Missing a professional summary section.');
  else good.push('Professional summary detected.');

  if (!ctx.contact.hasEmail || !ctx.contact.hasPhone) high.push('Contact information is incomplete (missing email or phone).');
  else good.push('Contact information detected.');

  if (ctx.jdText && ctx.keyword.missing?.length > 5) {
    high.push(`Job description contains ${ctx.keyword.missing.length} keywords not found in the resume.`);
  } else if (ctx.jdText) {
    good.push('Strong keyword alignment with the job description.');
  }

  if (ctx.quantifiable.count < 2) high.push('Experience bullets lack measurable impact (numbers, %, or scale).');
  else good.push('Resume includes quantifiable achievements.');

  if (ctx.actionVerbs.weakCount > 2) medium.push('Weak action verbs / passive phrasing detected in several bullets.');
  if (ctx.formatting.issues.length > 0) ctx.formatting.issues.forEach((i) => medium.push(i));
  if (!ctx.completeness.sections.skills) medium.push('Skills section could be more clearly labeled or targeted.');
  if (ctx.repeatedWords.length > 0) medium.push(`Some words are repeated frequently (${ctx.repeatedWords.slice(0, 3).map((r) => r.word).join(', ')}) — consider varying language.`);

  if (!ctx.completeness.sections.education) medium.push('Education section not clearly detected.');
  else good.push('Clear section structure detected.');

  if (ctx.experience.score >= ctx.experience.details.length) good.push('Experience section is well structured.');

  return { high, medium, good };
}
