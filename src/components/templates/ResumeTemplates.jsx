import React from 'react';

import { formatDateRange } from '../../utils/resumeUtils.js';

import {
  FONT_OPTIONS,
  FONT_SIZE_MAP,
  LINE_SPACING_MAP,
  MARGIN_MAP,
} from '../../data/templates.js';


/* =============================================================
   FORMATTING
============================================================= */

function useFormattingStyle(
  formatting
) {
  const font =
    FONT_OPTIONS.find(
      (item) =>
        item.id === formatting?.font
    ) || FONT_OPTIONS[0];

  return {
    fontFamily: font.family,

    fontSize: `${
      FONT_SIZE_MAP[
        formatting?.fontSize || 'md'
      ]
    }px`,

    lineHeight:
      LINE_SPACING_MAP[
        formatting?.lineSpacing ||
          'normal'
      ],

    padding:
      MARGIN_MAP[
        formatting?.margins ||
          'normal'
      ],
  };
}


/* =============================================================
   CONTACT INFORMATION
============================================================= */

function ContactLine({
  p,
  separator = '  |  ',
}) {
  const parts = [
    p.email,
    p.phone,
    p.location,
    p.linkedin,
    p.github,
    p.portfolio,
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return (
    <p className="text-[0.92em] text-gray-600">
      {parts.join(separator)}
    </p>
  );
}


/* =============================================================
   BULLET LIST
============================================================= */

function BulletList({
  bullets,
}) {
  const list = (
    bullets || []
  ).filter(Boolean);

  if (!list.length) {
    return null;
  }

  return (
    <ul className="list-disc pl-5 space-y-0.5 mt-1">
      {list.map(
        (bullet, index) => (
          <li key={index}>
            {bullet}
          </li>
        )
      )}
    </ul>
  );
}


/* =============================================================
   EXPERIENCE
============================================================= */

function ExperienceBlock({
  experience,
  headingClass,
}) {
  if (!experience?.length) {
    return null;
  }

  return (
    <Section
      title="Experience"
      headingClass={headingClass}
    >
      {experience.map(
        (exp) => (
          <div
            key={exp.id}
            className="mb-3 last:mb-0"
          >

            <div className="flex justify-between gap-2 flex-wrap">

              <p className="font-semibold text-gray-900">
                {exp.jobTitle}

                {exp.company
                  ? `, ${exp.company}`
                  : ''}
              </p>

              <p className="text-[0.9em] text-gray-500 shrink-0">
                {formatDateRange(
                  exp.startDate,
                  exp.endDate,
                  exp.current
                )}
              </p>

            </div>


            {exp.location && (
              <p className="text-[0.88em] text-gray-500">
                {exp.location}
              </p>
            )}


            <BulletList
              bullets={
                exp.bullets
              }
            />

          </div>
        )
      )}
    </Section>
  );
}


/* =============================================================
   EDUCATION
============================================================= */

function EducationBlock({
  education,
  headingClass,
}) {
  if (!education?.length) {
    return null;
  }

  return (
    <Section
      title="Education"
      headingClass={headingClass}
    >

      {education.map(
        (educationItem) => (
          <div
            key={
              educationItem.id
            }
            className="mb-2 last:mb-0"
          >

            <div className="flex justify-between gap-2 flex-wrap">

              <p className="font-semibold text-gray-900">

                {
                  educationItem.degree
                }

                {
                  educationItem
                    .institution
                    ? `, ${educationItem.institution}`
                    : ''
                }

              </p>


              <p className="text-[0.9em] text-gray-500 shrink-0">

                {
                  educationItem.startYear
                }

                {
                  educationItem.endYear
                    ? `–${educationItem.endYear}`
                    : ''
                }

              </p>

            </div>


            {(
              educationItem.location ||
              educationItem.gpa
            ) && (

              <p className="text-[0.88em] text-gray-500">

                {[
                  educationItem.location,

                  educationItem.gpa
                    ? `GPA: ${educationItem.gpa}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}

              </p>

            )}


            {educationItem.coursework && (

              <p className="text-[0.88em] text-gray-600">

                Relevant coursework:{' '}

                {
                  educationItem.coursework
                }

              </p>

            )}

          </div>
        )
      )}

    </Section>
  );
}


/* =============================================================
   PROJECTS
============================================================= */

function ProjectsBlock({
  projects,
  headingClass,
}) {
  if (!projects?.length) {
    return null;
  }

  return (
    <Section
      title="Projects"
      headingClass={headingClass}
    >

      {projects.map(
        (project) => (
          <div
            key={project.id}
            className="mb-2.5 last:mb-0"
          >

            <p className="font-semibold text-gray-900">

              {project.name}

              {project.technologies
                ? ` — ${project.technologies}`
                : ''}

            </p>


            {project.description && (
              <p className="text-[0.92em]">
                {project.description}
              </p>
            )}


            {(
              project.url ||
              project.githubUrl
            ) && (

              <p className="text-[0.85em] text-gray-500">

                {[
                  project.url,
                  project.githubUrl,
                ]
                  .filter(Boolean)
                  .join(' · ')}

              </p>

            )}

          </div>
        )
      )}

    </Section>
  );
}


/* =============================================================
   SKILLS
============================================================= */

function SkillsBlock({
  skills,
  headingClass,
}) {
  const groups = [
    [
      'Technical',
      skills?.technical,
    ],
    [
      'Tools',
      skills?.tools,
    ],
    [
      'Soft Skills',
      skills?.soft,
    ],
    [
      'Languages',
      skills?.languages,
    ],
  ].filter(
    ([, list]) =>
      list &&
      list.length
  );

  if (!groups.length) {
    return null;
  }

  return (
    <Section
      title="Skills"
      headingClass={headingClass}
    >

      {groups.map(
        ([label, list]) => (
          <p
            key={label}
            className="text-[0.92em] mb-1 last:mb-0"
          >

            <span className="font-semibold">
              {label}:{' '}
            </span>

            {list.join(', ')}

          </p>
        )
      )}

    </Section>
  );
}


/* =============================================================
   CERTIFICATIONS
============================================================= */

function CertificationsBlock({
  items,
  headingClass,
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <Section
      title="Certifications"
      headingClass={headingClass}
    >

      {items.map(
        (certification) => (
          <p
            key={
              certification.id
            }
            className="text-[0.92em] mb-1 last:mb-0"
          >

            <span className="font-semibold">
              {
                certification.name
              }
            </span>

            {certification.issuer
              ? ` — ${certification.issuer}`
              : ''}

            {certification.date
              ? ` (${certification.date})`
              : ''}

          </p>
        )
      )}

    </Section>
  );
}


/* =============================================================
   ACHIEVEMENTS
============================================================= */

function AchievementsBlock({
  items,
  headingClass,
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <Section
      title="Achievements"
      headingClass={headingClass}
    >

      {items.map(
        (achievement) => (
          <p
            key={
              achievement.id
            }
            className="text-[0.92em] mb-1 last:mb-0"
          >

            <span className="font-semibold">
              {
                achievement.title
              }
            </span>

            {achievement.description
              ? `: ${achievement.description}`
              : ''}

          </p>
        )
      )}

    </Section>
  );
}


/* =============================================================
   GENERIC LIST
============================================================= */

function GenericListBlock({
  title,
  items,
  headingClass,
  render,
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <Section
      title={title}
      headingClass={headingClass}
    >

      {items.map(
        (item) => (
          <p
            key={item.id}
            className="text-[0.92em] mb-1 last:mb-0"
          >
            {render(item)}
          </p>
        )
      )}

    </Section>
  );
}


/* =============================================================
   INTERESTS
============================================================= */

function InterestsBlock({
  items,
  headingClass,
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <Section
      title="Interests"
      headingClass={headingClass}
    >
      <p className="text-[0.92em]">
        {items.join(', ')}
      </p>
    </Section>
  );
}


/* =============================================================
   SECTION
============================================================= */

function Section({
  title,
  children,
  headingClass,
}) {
  return (
    <div className="mb-3.5 last:mb-0">

      <h2
        className={
          headingClass ||
          'text-[0.95em] font-bold uppercase tracking-wide mb-1.5 pb-1 border-b'
        }
        style={{
          borderColor:
            '#d1d5db',

          color:
            '#111827',
        }}
      >
        {title}
      </h2>

      {children}

    </div>
  );
}


/* =============================================================
   COMMON BLOCKS
============================================================= */

function commonBlocks(
  resume,
  headingClass
) {
  return {

    experience: (
      <ExperienceBlock
        experience={
          resume.experience
        }
        headingClass={
          headingClass
        }
      />
    ),

    education: (
      <EducationBlock
        education={
          resume.education
        }
        headingClass={
          headingClass
        }
      />
    ),

    projects: (
      <ProjectsBlock
        projects={
          resume.projects
        }
        headingClass={
          headingClass
        }
      />
    ),

    skills: (
      <SkillsBlock
        skills={
          resume.skills
        }
        headingClass={
          headingClass
        }
      />
    ),

    certifications: (
      <CertificationsBlock
        items={
          resume.certifications
        }
        headingClass={
          headingClass
        }
      />
    ),

    achievements: (
      <AchievementsBlock
        items={
          resume.achievements
        }
        headingClass={
          headingClass
        }
      />
    ),

    publications: (
      <GenericListBlock
        title="Publications"
        items={
          resume.publications
        }
        headingClass={
          headingClass
        }
        render={(item) => (
          <>
            <span className="font-semibold">
              {item.title}
            </span>

            {item.publisher
              ? ` — ${item.publisher}`
              : ''}

            {item.date
              ? ` (${item.date})`
              : ''}
          </>
        )}
      />
    ),

    volunteer: (
      <GenericListBlock
        title="Volunteer Experience"
        items={
          resume.volunteer
        }
        headingClass={
          headingClass
        }
        render={(item) => (
          <>
            <span className="font-semibold">
              {item.title}
            </span>

            {item.organization
              ? ` — ${item.organization}`
              : ''}

            {item.description
              ? `: ${item.description}`
              : ''}
          </>
        )}
      />
    ),

    leadership: (
      <GenericListBlock
        title="Leadership"
        items={
          resume.leadership
        }
        headingClass={
          headingClass
        }
        render={(item) => (
          <>
            <span className="font-semibold">
              {item.title}
            </span>

            {item.organization
              ? ` — ${item.organization}`
              : ''}

            {item.description
              ? `: ${item.description}`
              : ''}
          </>
        )}
      />
    ),

    extracurricular: (
      <GenericListBlock
        title="Extracurricular Activities"
        items={
          resume.extracurricular
        }
        headingClass={
          headingClass
        }
        render={(item) => (
          <>
            <span className="font-semibold">
              {item.title}
            </span>

            {item.organization
              ? ` — ${item.organization}`
              : ''}

            {item.description
              ? `: ${item.description}`
              : ''}
          </>
        )}
      />
    ),

    interests: (
      <InterestsBlock
        items={
          resume.interests
        }
        headingClass={
          headingClass
        }
      />
    ),
  };
}


/* =============================================================
   CLASSIC ATS — PROFESSIONAL TEMPLATE
============================================================= */

function ClassicATS({
  resume,
}) {
  const style =
    useFormattingStyle(
      resume.formatting
    );

  const p =
    resume.personalInfo ||
    {};

  const headingClass =
    'text-[0.95em] font-bold uppercase tracking-wide mb-1.5 pb-1 border-b border-gray-300';

  const blocks =
    commonBlocks(
      resume,
      headingClass
    );

  return (
    <div
      style={{
        ...style,

        boxSizing: 'border-box',
        width: '8.5in',
        minHeight: '11in',
        backgroundColor: '#ffffff',
        color: '#111827',
        overflow: 'hidden',
      }}
      className="resume-document"
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="text-center mb-4 pb-3 border-b border-gray-300">

        <h1 className="text-2xl font-bold tracking-tight">

          {p.fullName ||
            'Your Name'}

        </h1>


        {p.title && (
          <p className="text-[1.05em] text-gray-600 mt-0.5">
            {p.title}
          </p>
        )}


        <ContactLine p={p} />

      </header>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {resume.summary && (
        <Section
          title="Summary"
          headingClass={
            headingClass
          }
        >

          <p className="text-[0.95em]">
            {resume.summary}
          </p>

        </Section>
      )}


      {/* =====================================================
          RESUME SECTIONS
      ===================================================== */}

      {blocks.experience}

      {blocks.education}

      {blocks.skills}

      {blocks.projects}

      {blocks.certifications}

      {blocks.achievements}

      {blocks.publications}

      {blocks.volunteer}

      {blocks.leadership}

      {blocks.extracurricular}

      {blocks.interests}

    </div>
  );
}


/* =============================================================
   EXPORT
============================================================= */

export default function ResumeDocument({
  resume,
}) {
  return (
    <ClassicATS
      resume={resume}
    />
  );
}