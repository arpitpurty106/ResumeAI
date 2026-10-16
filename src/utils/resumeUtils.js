import { v4 as uuidv4 } from 'uuid';

// Canonical, extensible resume data model.
export function createBlankResume(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: 'Untitled Resume',
    targetRole: '',
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      photo: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
      languages: [],
    },
    projects: [],
    certifications: [],
    achievements: [],
    publications: [],
    volunteer: [],
    leadership: [],
    extracurricular: [],
    interests: [],
    template: 'classic-ats',
    formatting: {
      font: 'Inter',
      fontSize: 'md', // sm | md | lg
      lineSpacing: 'normal', // tight | normal | relaxed
      margins: 'normal', // narrow | normal | wide
      accentColor: '#4361ee',
    },
    createdAt: now,
    updatedAt: now,
    atsScore: null,
    lastScan: null,
    ...overrides,
  };
}

export function createExperienceEntry() {
  return {
    id: uuidv4(),
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [''],
  };
}

export function createEducationEntry() {
  return {
    id: uuidv4(),
    degree: '',
    institution: '',
    location: '',
    startYear: '',
    endYear: '',
    gpa: '',
    coursework: '',
  };
}

export function createProjectEntry() {
  return {
    id: uuidv4(),
    name: '',
    description: '',
    technologies: '',
    url: '',
    githubUrl: '',
  };
}

export function createCertificationEntry() {
  return {
    id: uuidv4(),
    name: '',
    issuer: '',
    date: '',
    credentialUrl: '',
  };
}

export function createAchievementEntry() {
  return { id: uuidv4(), title: '', description: '' };
}

export function createPublicationEntry() {
  return { id: uuidv4(), title: '', publisher: '', date: '', url: '' };
}

export function createSimpleEntry() {
  return { id: uuidv4(), title: '', organization: '', date: '', description: '' };
}

export function reorderArray(array, fromIndex, toIndex) {
  const copy = [...array];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function formatDateRange(start, end, current) {
  const s = start || '';
  const e = current ? 'Present' : end || '';
  if (!s && !e) return '';
  return [s, e].filter(Boolean).join(' — ');
}

export function isResumeEmpty(resume) {
  if (!resume) return true;
  const { personalInfo, summary, experience, education, skills, projects } = resume;
  const hasSkills =
    skills &&
    (skills.technical?.length || skills.soft?.length || skills.tools?.length || skills.languages?.length);
  return (
    !personalInfo?.fullName &&
    !summary &&
    (!experience || experience.length === 0) &&
    (!education || education.length === 0) &&
    !hasSkills &&
    (!projects || projects.length === 0)
  );
}

export function getResumeCompleteness(resume) {
  const checks = [
    !!resume.personalInfo?.fullName,
    !!resume.personalInfo?.email,
    !!resume.personalInfo?.phone,
    !!resume.summary && resume.summary.length > 20,
    resume.experience?.length > 0,
    resume.education?.length > 0,
    (resume.skills?.technical?.length || 0) + (resume.skills?.tools?.length || 0) > 0,
    resume.projects?.length > 0,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function cloneResume(resume, nameSuffix = ' (Copy)') {
  const now = new Date().toISOString();
  return {
    ...JSON.parse(JSON.stringify(resume)),
    id: uuidv4(),
    name: `${resume.name}${nameSuffix}`,
    createdAt: now,
    updatedAt: now,
  };
}

// Flattens a resume object into plain text — used for ATS analysis and AI context.
export function resumeToPlainText(resume) {
  const lines = [];
  const p = resume.personalInfo || {};
  lines.push([p.fullName, p.title].filter(Boolean).join(' — '));
  lines.push([p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean).join(' | '));
  if (resume.summary) lines.push('\nSUMMARY\n' + resume.summary);

  if (resume.experience?.length) {
    lines.push('\nEXPERIENCE');
    resume.experience.forEach((exp) => {
      lines.push(`${exp.jobTitle} — ${exp.company} (${exp.location}) ${formatDateRange(exp.startDate, exp.endDate, exp.current)}`);
      (exp.bullets || []).forEach((b) => b && lines.push(`- ${b}`));
    });
  }

  if (resume.education?.length) {
    lines.push('\nEDUCATION');
    resume.education.forEach((ed) => {
      lines.push(`${ed.degree} — ${ed.institution} (${ed.startYear}-${ed.endYear}) ${ed.gpa ? 'GPA: ' + ed.gpa : ''}`);
      if (ed.coursework) lines.push(`Coursework: ${ed.coursework}`);
    });
  }

  const skills = resume.skills || {};
  const allSkills = [
    ...(skills.technical || []),
    ...(skills.tools || []),
    ...(skills.soft || []),
    ...(skills.languages || []),
  ];
  if (allSkills.length) lines.push('\nSKILLS\n' + allSkills.join(', '));

  if (resume.projects?.length) {
    lines.push('\nPROJECTS');
    resume.projects.forEach((pr) => {
      lines.push(`${pr.name} (${pr.technologies})`);
      if (pr.description) lines.push(pr.description);
    });
  }

  if (resume.certifications?.length) {
    lines.push('\nCERTIFICATIONS');
    resume.certifications.forEach((c) => lines.push(`${c.name} — ${c.issuer} (${c.date})`));
  }

  if (resume.achievements?.length) {
    lines.push('\nACHIEVEMENTS');
    resume.achievements.forEach((a) => lines.push(`${a.title}: ${a.description}`));
  }

  if (resume.publications?.length) {
    lines.push('\nPUBLICATIONS');
    resume.publications.forEach((pub) => lines.push(`${pub.title} — ${pub.publisher} (${pub.date})`));
  }

  ['volunteer', 'leadership', 'extracurricular'].forEach((key) => {
    if (resume[key]?.length) {
      lines.push(`\n${key.toUpperCase()}`);
      resume[key].forEach((item) => lines.push(`${item.title} — ${item.organization}: ${item.description}`));
    }
  });

  if (resume.interests?.length) lines.push('\nINTERESTS\n' + resume.interests.join(', '));

  return lines.filter((l) => l !== undefined).join('\n');
}
