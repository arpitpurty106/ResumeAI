import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { useResumeList } from './hooks/useResume.js';

import Dashboard from './pages/Dashboard.jsx';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import MyResumes from './pages/MyResumes.jsx';
import ATSScanner from './pages/ATSScanner.jsx';
import Templates from './pages/Templates.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const resumeStore = useResumeList();

  return (
    <ToastProvider>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard resumeStore={resumeStore} />} />
            <Route path="/builder" element={<ResumeBuilder resumeStore={resumeStore} />} />
            <Route path="/builder/:id" element={<ResumeBuilder resumeStore={resumeStore} />} />
            <Route path="/my-resumes" element={<MyResumes resumeStore={resumeStore} />} />
            <Route path="/ats-scanner" element={<ATSScanner resumeStore={resumeStore} />} />
            <Route path="/ats-scanner/:id" element={<ATSScanner resumeStore={resumeStore} />} />
            <Route path="/templates" element={<Templates resumeStore={resumeStore} />} />
            <Route path="/settings" element={<Settings resumeStore={resumeStore} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </ToastProvider>
  );
}
