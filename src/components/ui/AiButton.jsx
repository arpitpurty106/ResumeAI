import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AiButton({ label, onRun, className = '' }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onRun();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`btn-secondary btn-sm !text-brand-700 !border-brand-200 hover:!bg-brand-50 ${className}`}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
      {label}
    </button>
  );
}
