// Safe localStorage wrapper — never throws, degrades gracefully.

const RESUMES_KEY = 'resumeai.resumes.v1';
const SETTINGS_KEY = 'resumeai.settings.v1';
const SCANS_KEY = 'resumeai.scans.v1';

function safeGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Failed to read "${key}"`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] Failed to write "${key}"`, err);
    return false;
  }
}

export const storage = {
  getResumes: () => safeGet(RESUMES_KEY, []),
  setResumes: (resumes) => safeSet(RESUMES_KEY, resumes),

  getSettings: () =>
    safeGet(SETTINGS_KEY, {
      defaultTemplate: 'classic-ats',
      defaultFont: 'Inter',
      theme: 'light',
    }),
  setSettings: (settings) => safeSet(SETTINGS_KEY, settings),

  getScans: () => safeGet(SCANS_KEY, []),
  setScans: (scans) => safeSet(SCANS_KEY, scans),

  clearAll: () => {
    try {
      window.localStorage.removeItem(RESUMES_KEY);
      window.localStorage.removeItem(SETTINGS_KEY);
      window.localStorage.removeItem(SCANS_KEY);
      return true;
    } catch (err) {
      console.warn('[storage] Failed to clear data', err);
      return false;
    }
  },

  isAvailable: () => {
    try {
      const testKey = '__resumeai_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
