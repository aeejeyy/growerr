'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { clearState } from '../../lib/journey/storage';

export default function ClearData() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          if (window.confirm('Delete your saved Growerr journey from this browser? This cannot be undone.')) {
            clearState();
            setDone(true);
          }
        }}
      >
        <Trash2 size={16} aria-hidden="true" /> Delete my saved journey
      </button>
      <p className="text-sm text-ink-muted" role="status">{done ? 'Deleted from this browser.' : ''}</p>
    </div>
  );
}
