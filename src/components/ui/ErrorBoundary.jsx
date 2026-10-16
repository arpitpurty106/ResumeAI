import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="card p-8 max-w-md text-center">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={32} />
            <h2 className="text-lg font-semibold text-ink-800 mb-1">Something went wrong</h2>
            <p className="text-sm text-ink-500 mb-4">
              An unexpected error occurred in this section. Your saved resumes are safe in local storage.
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
