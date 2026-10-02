import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/** Native modal: traps focus, makes the workspace inert and restores the opener. */
export default function AdminDialog({ open, title, children, actions, onCancel, busy = false }: {
  open: boolean; title: string; children: React.ReactNode; actions: React.ReactNode;
  onCancel: () => void; busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [open]);
  return <dialog ref={ref} className="workspace-dialog" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <div className="workspace-section-heading"><h2 id={titleId}>{title}</h2>
      <button type="button" className="workspace-icon-button" aria-label="Dialoog sluiten" disabled={busy} onClick={onCancel}><X size={17} /></button>
    </div>
    <div className="workspace-dialog-content">{children}</div>
    <div className="workspace-dialog-actions">{actions}</div>
  </dialog>;
}
