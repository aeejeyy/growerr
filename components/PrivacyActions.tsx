'use client';

import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { JOURNEY_STORAGE_KEY } from '../lib/constants';

export default function PrivacyActions() {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');

  function clearJourney() {
    try {
      window.localStorage.removeItem(JOURNEY_STORAGE_KEY);
      setMessage('Your Growerr journey was removed from this browser.');
    } catch {
      setMessage('This browser blocked access to local storage, so there was nothing to remove.');
    }
    setConfirm(false);
  }

  return (
    <div className="privacy-actions">
      <div>
        <h3>Clear your journey</h3>
        <p>Remove the profile, progress, conversation and summary saved by Growerr in this browser. This cannot be undone.</p>
      </div>
      <button type="button" className="button danger-outline" onClick={() => setConfirm(true)}>
        Delete my journey
      </button>
      <p role="status" className="status">{message}</p>
      {confirm && (
        <ConfirmDialog
          title="Delete your journey?"
          description="This removes your Growerr journey from this browser. Groww never received it, so there is no copy on a server."
          confirmLabel="Delete journey"
          onCancel={() => setConfirm(false)}
          onConfirm={clearJourney}
        />
      )}
    </div>
  );
}
