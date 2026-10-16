import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Copy, Trash2, ScanSearch, Download, FileText, Clock, Target } from 'lucide-react';
import ResumeDocument from '../components/templates/ResumeTemplates.jsx';
import { getTemplateById } from '../data/templates.js';
import { exportElementToPdf } from '../services/pdfService.js';
import { useToast } from '../components/ui/Toast.jsx';

export default function MyResumes({ resumeStore }) {
  const { resumes, createResume, deleteResume, duplicateResume } = resumeStore;
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const hiddenRefs = useRef({});

  const handleCreate = () => {
    const created = createResume();
    navigate(`/builder/${created.id}`);
  };

  const handleDuplicate = (id) => {
    const copy = duplicateResume(id);
    if (copy) toast.success('Resume duplicated.');
  };

  const handleDelete = (id) => {
    deleteResume(id);
    setConfirmDeleteId(null);
    toast.success('Resume deleted.');
  };

  const handleDownload = async (resume) => {
    const node = hiddenRefs.current[resume.id];
    const filename = `${(resume.personalInfo?.fullName || resume.name).replace(/\s+/g, '_')}.pdf`;
    const result = await exportElementToPdf(node, filename);
    if (result.success) toast.success('PDF downloaded.');
    else toast.error(result.error);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">My Resumes</h1>
          <p className="text-sm text-ink-500">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved locally on this device</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}><Plus size={16} /> Create New Resume</button>
      </div>

      {resumes.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="mx-auto text-ink-300 mb-3" />
          <p className="font-medium text-ink-700 mb-1">No resumes yet</p>
          <p className="text-sm text-ink-500 mb-4">Create your first resume to get started.</p>
          <button className="btn-primary inline-flex" onClick={handleCreate}><Plus size={16} /> Create New Resume</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const template = getTemplateById(resume.template);
            return (
              <div key={resume.id} className="card p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-800 truncate">{resume.name}</p>
                    <p className="text-xs text-ink-400">{template.name}</p>
                  </div>
                  {typeof resume.atsScore === 'number' && (
                    <span className={`badge shrink-0 ${resume.atsScore >= 80 ? 'badge-green' : resume.atsScore >= 60 ? 'badge-amber' : 'badge-red'}`}>
                      {resume.atsScore}/100
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-ink-500 mb-3">
                  <p className="flex items-center gap-1.5"><Clock size={12} /> Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  {resume.targetRole && <p className="flex items-center gap-1.5"><Target size={12} /> {resume.targetRole}</p>}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-ink-100">
                  <Link to={`/builder/${resume.id}`} className="btn-secondary btn-sm justify-center">Edit</Link>
                  <Link to={`/ats-scanner/${resume.id}`} className="btn-secondary btn-sm justify-center"><ScanSearch size={13} /> Scan</Link>
                  <button className="btn-secondary btn-sm justify-center" onClick={() => handleDuplicate(resume.id)}><Copy size={13} /> Duplicate</button>
                  <button className="btn-secondary btn-sm justify-center" onClick={() => handleDownload(resume)}><Download size={13} /> PDF</button>
                </div>
                <button
                  className="btn-danger btn-sm justify-center mt-2 w-full"
                  onClick={() => setConfirmDeleteId(resume.id)}
                >
                  <Trash2 size={13} /> Delete
                </button>

                {/* Hidden full-size render used only for PDF export */}
                <div className="fixed -left-[9999px] top-0" aria-hidden="true">
                  <div ref={(el) => (hiddenRefs.current[resume.id] = el)} style={{ width: '8.5in' }} className="bg-white">
                    <ResumeDocument resume={resume} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="font-semibold text-ink-800 mb-2">Delete this resume?</h3>
            <p className="text-sm text-ink-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
