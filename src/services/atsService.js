import { analyzeResume, tokenize, extractKeywordFrequency } from '../utils/scoring.js';

const TOOL_TECH_HINTS = [
  'react','angular','vue','node.js','node','express','django','flask','spring','sql','nosql','mongodb',
  'postgresql','mysql','redis','aws','azure','gcp','docker','kubernetes','git','github','gitlab','jira',
  'figma','tableau','power bi','salesforce','sap','terraform','ansible','jenkins','webpack','vite',
  'typescript','javascript','python','java','c++','c#','go','rust','swift','kotlin','graphql','rest api',
];

const SOFT_SKILL_HINTS = [
  'communication','leadership','teamwork','collaboration','problem solving','critical thinking',
  'time management','adaptability','creativity','attention to detail','organization','mentoring',
  'conflict resolution','decision making','emotional intelligence','negotiation',
];

const EDU_HINTS = [
  "bachelor's degree", "master's degree", 'phd', 'b.sc', 'm.sc', 'mba', 'associate degree',
  'computer science', 'engineering degree', 'high school diploma',
];

const TITLE_HINTS = [
  'engineer','developer','manager','analyst','designer','architect','consultant','specialist',
  'coordinator','director','lead','scientist','administrator','intern','associate',
];

function findHintsInText(text, hints) {
  const lower = (text || '').toLowerCase();
  return hints.filter((hint) => lower.includes(hint));
}

/**
 * Extracts a structured breakdown of a job description into categorized
 * keyword buckets: required skills, preferred skills, tools/technologies,
 * job titles, domain keywords, soft skills, and education requirements.
 */
export function extractJobDescriptionKeywords(jdText) {
  if (!jdText || !jdText.trim()) {
    return {
      requiredSkills: [], preferredSkills: [], tools: [], jobTitles: [],
      domainKeywords: [], softSkills: [], education: [],
    };
  }

  const lower = jdText.toLowerCase();
  const tools = findHintsInText(jdText, TOOL_TECH_HINTS);
  const softSkills = findHintsInText(jdText, SOFT_SKILL_HINTS);
  const education = findHintsInText(jdText, EDU_HINTS);
  const jobTitles = findHintsInText(jdText, TITLE_HINTS);

  // Split "required" vs "preferred/nice to have" sections heuristically.
  const requiredIdx = Math.max(lower.indexOf('required'), lower.indexOf('requirements'), lower.indexOf('must have'));
  const preferredIdx = Math.max(lower.indexOf('preferred'), lower.indexOf('nice to have'), lower.indexOf('bonus'));

  let requiredSlice = jdText;
  let preferredSlice = '';
  if (preferredIdx > -1) {
    preferredSlice = jdText.slice(preferredIdx);
    requiredSlice = jdText.slice(0, preferredIdx);
  } else if (requiredIdx > -1) {
    requiredSlice = jdText.slice(requiredIdx);
  }

  const requiredTools = findHintsInText(requiredSlice, TOOL_TECH_HINTS);
  const preferredTools = preferredSlice
    ? findHintsInText(preferredSlice, TOOL_TECH_HINTS).filter((t) => !requiredTools.includes(t))
    : [];

  const generalKeywords = extractKeywordFrequency(jdText, 25)
    .map((k) => k.word)
    .filter((w) => !tools.includes(w) && !softSkills.includes(w));

  return {
    requiredSkills: requiredTools.length ? requiredTools : tools,
    preferredSkills: preferredTools,
    tools,
    jobTitles: [...new Set(jobTitles)],
    domainKeywords: generalKeywords.slice(0, 15),
    softSkills: [...new Set(softSkills)],
    education: [...new Set(education)],
  };
}

/**
 * Compares resume text against extracted job-description keywords.
 * Never suggests adding a skill the user doesn't have — only flags what's
 * missing, framed as "consider adding X if you have experience with it."
 */
export function matchResumeToJobDescription(resumeText, jdText) {
  const jdKeywords = extractJobDescriptionKeywords(jdText);
  const resumeWords = new Set(tokenize(resumeText));
  const resumeLower = (resumeText || '').toLowerCase();

  function classify(list) {
    const matched = [];
    const missing = [];
    const partial = [];
    list.forEach((term) => {
      const termWords = term.split(/\s+/);
      if (resumeLower.includes(term)) {
        matched.push(term);
      } else if (termWords.some((w) => resumeWords.has(w))) {
        partial.push(term);
      } else {
        missing.push(term);
      }
    });
    return { matched, missing, partial };
  }

  const allTerms = [
    ...jdKeywords.requiredSkills,
    ...jdKeywords.preferredSkills,
    ...jdKeywords.tools,
    ...jdKeywords.softSkills,
    ...jdKeywords.domainKeywords,
  ];
  const uniqueTerms = [...new Set(allTerms)];
  const { matched, missing, partial } = classify(uniqueTerms);

  const recommendations = missing.slice(0, 8).map(
    (term) => `Consider adding "${term}" to your resume if you have experience with it.`
  );

  return {
    jdKeywords,
    matched,
    missing,
    partial,
    recommendations,
    matchPercent: uniqueTerms.length ? Math.round((matched.length / uniqueTerms.length) * 100) : null,
  };
}

/**
 * Full ATS scan combining the deterministic scoring engine with
 * job-description matching (when a JD is provided).
 */
export function runAtsScan({ resumeText, jdText = '', resumeSkillsList = [] }) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is empty. Please paste your resume text or upload a file.');
  }
  const scoreReport = analyzeResume({ resumeText, jdText, resumeSkillsList });
  const jdMatch = jdText && jdText.trim() ? matchResumeToJobDescription(resumeText, jdText) : null;

  return {
    ...scoreReport,
    jdMatch,
  };
}
