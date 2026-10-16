import React from 'react';
import { User } from 'lucide-react';
import SectionCard from './SectionCard.jsx';

const FIELDS = [
  {
    key: 'fullName',
    label: 'Full Name',
    placeholder: 'Jordan Avery',
    type: 'text',
  },

  {
    key: 'title',
    label: 'Professional Title',
    placeholder: 'Software Engineer',
    type: 'text',
  },

  {
    key: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
  },

  {
    key: 'phone',
    label: 'Phone',
    placeholder: '(555) 123-4567',
    type: 'tel',
  },

  {
    key: 'location',
    label: 'Location',
    placeholder: 'Austin, TX',
    type: 'text',
  },

  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder:
      'linkedin.com/in/username',
    type: 'text',
  },

  {
    key: 'github',
    label: 'GitHub',
    placeholder:
      'github.com/username',
    type: 'text',
  },

  {
    key: 'portfolio',
    label: 'Portfolio',
    placeholder: 'yourname.dev',
    type: 'text',
  },
];

export default function PersonalInfoForm({
  data,
  onChange,
}) {
  const handleField = (
    key,
    value
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  return (
    <SectionCard
      title="Personal Information"
      description="How employers will reach you"
      icon={User}
    >

      <div className="grid sm:grid-cols-2 gap-4">

        {FIELDS.map((field) => (
          <div
            key={field.key}
          >

            <label
              className="label"
              htmlFor={`pi-${field.key}`}
            >
              {field.label}
            </label>


            <input
              id={`pi-${field.key}`}
              className="input"
              type={field.type}
              placeholder={
                field.placeholder
              }
              value={
                data[field.key] || ''
              }
              onChange={(event) =>
                handleField(
                  field.key,
                  event.target.value
                )
              }
            />

          </div>
        ))}

      </div>


      {/* Photo-free notice */}

      <div className="rounded-xl border border-ink-300 bg-ink-50 px-3.5 py-3">

        <p className="text-xs font-medium text-ink-700">
          Photo-free professional format
        </p>

        <p className="text-xs text-ink-500 mt-1 leading-relaxed">
          This resume builder uses a
          no-photo format designed for
          broad ATS and recruiter
          compatibility.
        </p>

      </div>

    </SectionCard>
  );
}