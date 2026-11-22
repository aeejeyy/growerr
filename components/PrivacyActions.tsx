'use client';

import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { STORAGE_KEY } from '../lib/onboarding';

export default function PrivacyActions() {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');

  function clearAnswers() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setMessage('Your onboarding answers were removed from this browser.');
    } catch {
      setMessage('This browser blocked access to local storage, so there was nothing to remove.');
    }
    setConfirm(false);
  }

  return (
    <div className="privacy-actions">
      <div>
        <h3>Clear your answers</h3>
        <p>Remove the onboarding answers saved by Growerr in this browser. This cannot be undone.</p>
      </div>
      <button type="button" className="button danger-outline" onClick={() => setConfirm(true)}>
        Delete my answers
      </button>
      <p role="status" className="status">{message}</p>
      {confirm && (
        <ConfirmDialog
          title="Delete your answers?"
          description="This removes your Growerr onboarding answers from this browser. Groww never received them, so there is no copy on a server."
          confirmLabel="Delete answers"
          onCancel={() => setConfirm(false)}
          onConfirm={clearAnswers}
        />
      )}
    </div>
  );
}
