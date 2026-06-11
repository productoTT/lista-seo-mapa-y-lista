import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SnackbarProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Snackbar({ message, visible, onHide }: SnackbarProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, message, onHide]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease',
        zIndex: 9999,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-2.5 bg-tt-ink text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold whitespace-nowrap">
        <CheckCircle2 size={16} style={{ color: '#37FFDB' }} />
        {message}
      </div>
    </div>
  );
}
