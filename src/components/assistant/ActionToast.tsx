import { useEffect } from 'react';
import './assistant.css';

export interface ToastData {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

/** Aviso breve con acción opcional (p. ej. "Volver a la anterior"). Se anuncia a lectores de pantalla. */
export function ActionToast({ toast, onDone }: { toast: ToastData | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDone, toast.action ? 9000 : 4500);
    return () => window.clearTimeout(t);
  }, [toast, onDone]);

  return (
    <div className="ap-toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="ap-toast">
          <span>{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={() => { toast.action!.onClick(); onDone(); }}>{toast.action.label}</button>
          )}
        </div>
      )}
    </div>
  );
}
