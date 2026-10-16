import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage.js';
import { createBlankResume, cloneResume } from '../utils/resumeUtils.js';
import { getSampleResume } from '../data/sampleResume.js';

let hasSeeded = false;

export function useResumeList() {
  const [resumes, setResumes] = useState(() => storage.getResumes());

  useEffect(() => {
    // Seed with one fictional sample resume on very first launch only.
    if (!hasSeeded && resumes.length === 0) {
      hasSeeded = true;
      const sample = getSampleResume();
      const seeded = [sample];
      setResumes(seeded);
      storage.setResumes(seeded);
    }
  }, [resumes.length]);

  const persist = useCallback((next) => {
    setResumes(next);
    storage.setResumes(next);
  }, []);

  const createResume = useCallback(
    (overrides = {}) => {
      const resume = createBlankResume(overrides);
      persist([resume, ...resumes]);
      return resume;
    },
    [resumes, persist]
  );

  const updateResume = useCallback(
    (id, updater) => {
      const next = resumes.map((r) =>
        r.id === id
          ? { ...(typeof updater === 'function' ? updater(r) : { ...r, ...updater }), updatedAt: new Date().toISOString() }
          : r
      );
      persist(next);
    },
    [resumes, persist]
  );

  const deleteResume = useCallback(
    (id) => {
      persist(resumes.filter((r) => r.id !== id));
    },
    [resumes, persist]
  );

  const duplicateResume = useCallback(
    (id) => {
      const target = resumes.find((r) => r.id === id);
      if (!target) return null;
      const copy = cloneResume(target);
      persist([copy, ...resumes]);
      return copy;
    },
    [resumes, persist]
  );

  const getResume = useCallback((id) => resumes.find((r) => r.id === id) || null, [resumes]);

  return { resumes, createResume, updateResume, deleteResume, duplicateResume, getResume, setResumes: persist };
}
