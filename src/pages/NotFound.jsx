import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="text-center">
        <FileQuestion size={40} className="mx-auto text-ink-300 mb-3" />
        <h1 className="text-xl font-semibold text-ink-800 mb-1">Page not found</h1>
        <p className="text-sm text-ink-500 mb-4">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  );
}
