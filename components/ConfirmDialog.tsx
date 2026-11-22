'use client';
import { useEffect, useRef } from 'react';
export default function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (dialog && !dialog.open) dialog.showModal(); return () => { if (dialog?.open) dialog.close(); }; }, []);
  return <dialog ref={ref} className="dialog" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={onCancel}>
    <h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div className="actions right"><button className="button secondary" autoFocus onClick={onCancel}>Cancel</button><button className="button danger" onClick={onConfirm}>{confirmLabel}</button></div>
  </dialog>;
}
