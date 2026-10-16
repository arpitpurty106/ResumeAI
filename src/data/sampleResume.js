import {
  createBlankResume,
} from '../utils/resumeUtils.js';

/*
 * Fictional sample resume used by the template gallery.
 *
 * This sample deliberately contains NO profile photo because
 * the application uses a professional, ATS-friendly,
 * photo-free resume format.
 */

export function getSampleResume() {
  const base =
    createBlankResume({
      name:
        'Sample — Software Engineer',
    });

  return {
    ...base,

    targetRole:
      'Software Engineer',

    personalInfo: {
      fullName:
        'Jordan Avery',

      title:
        'Software Engineer',

      email:
        'jordan.avery@example.com',

      phone:
        '(555) 123-4567',

      location:
        'Austin, TX',

      linkedin:
        'linkedin.com/in/jordanavery',

      github:
        'github.com/jordanavery',

      portfolio:
        'jordanavery.dev',
    },

    summary:
      'Software Engineer with 2 years of experience building web applications using React, Node.js, and PostgreSQL. Reduced page load times by 35% on a high-traffic internal dashboard and shipped features used by over 10,000 daily active users. Comfortable working across the stack and collaborating in agile teams.',

    experience: [
      {
        id: 'exp-1',

        jobTitle:
          'Software Engineer',

        company:
          'BrightPath Technologies',

        location:
          'Austin, TX',

        startDate:
          'Jun 2023',

        endDate:
          '',

        current:
          true,

        bullets: [
          'Developed and shipped 12+ customer-facing features in a React and TypeScript codebase serving 10,000+ daily active users.',

          'Reduced average dashboard load time by 35% by optimizing API queries and implementing client-side caching.',

          'Built a REST API in Node.js and Express that handles over 50,000 requests per day with 99.9% uptime.',

          'Collaborated with product and design in two-week agile sprints, participating in code reviews and sprint planning.',
        ],
      },

      {
        id: 'exp-2',

        jobTitle:
          'Software Engineering Intern',

        company:
          'Northline Data Co.',

        location:
          'Remote',

        startDate:
          'May 2022',

        endDate:
          'Aug 2022',

        current:
          false,

        bullets: [
          'Built an internal tool in Python that automated a manual data-cleaning process, saving the analytics team roughly 6 hours per week.',

          'Wrote unit tests with pytest that increased code coverage on the ingestion module from 40% to 85%.',

          'Presented project results to a team of 8 engineers and product managers at the end-of-internship demo day.',
        ],
      },
    ],

    education: [
      {
        id: 'edu-1',

        degree:
          'B.S. in Computer Science',

        institution:
          'University of Texas at Austin',

        location:
          'Austin, TX',

        startYear:
          '2019',

        endYear:
          '2023',

        gpa:
          '3.7',

        coursework:
          'Data Structures, Algorithms, Databases, Operating Systems, Web Development',
      },
    ],

    skills: {
      technical: [
        'JavaScript',
        'TypeScript',
        'Python',
        'SQL',
        'HTML/CSS',
      ],

      tools: [
        'React',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Docker',
        'Git',
        'AWS',
      ],

      soft: [
        'Communication',
        'Problem Solving',
        'Collaboration',
        'Time Management',
      ],

      languages: [
        'English (Native)',
        'Spanish (Conversational)',
      ],
    },

    projects: [
      {
        id: 'proj-1',

        name:
          'TaskFlow — Team Task Manager',

        description:
          'Full-stack task management app with real-time updates, built with React, Node.js, and Socket.io. Supports team boards, due-date reminders, and role-based permissions.',

        technologies:
          'React, Node.js, Socket.io, PostgreSQL',

        url:
          'taskflow-demo.example.com',

        githubUrl:
          'github.com/jordanavery/taskflow',
      },

      {
        id: 'proj-2',

        name:
          'Weather Insights CLI',

        description:
          'Command-line tool that fetches and visualizes weather trends using a public API, with caching to minimize API calls.',

        technologies:
          'Python, Click, Matplotlib',

        url:
          '',

        githubUrl:
          'github.com/jordanavery/weather-insights-cli',
      },
    ],

    certifications: [
      {
        id: 'cert-1',

        name:
          'AWS Certified Cloud Practitioner',

        issuer:
          'Amazon Web Services',

        date:
          '2023',

        credentialUrl:
          'aws.amazon.com/verification',
      },
    ],

    achievements: [
      {
        id: 'ach-1',

        title:
          'Hackathon Winner — HackTX 2022',

        description:
          'Led a team of 4 to build an accessibility-focused browser extension, winning 1st place out of 60 teams.',
      },
    ],

    publications: [],

    volunteer: [
      {
        id: 'vol-1',

        title:
          'Coding Mentor',

        organization:
          'CodeTogether Austin',

        date:
          '2022 — Present',

        description:
          'Mentor high school students in weekly web development workshops.',
      },
    ],

    leadership: [],

    extracurricular: [],

    interests: [
      'Rock climbing',
      'Chess',
      'Open-source contribution',
    ],

    template:
      'classic-ats',
  };
}