import { Sparkles } from 'lucide-react';
import type { CommercialStatus } from '../../types/property';

interface CommercialBadgeProps {
  status: CommercialStatus;
  compact?: boolean;
}

export function CommercialBadge({ status, compact }: CommercialBadgeProps) {
  if (status === 'organic') return null;

  const cfg = {
    featured: { label: 'Destacado', bg: '#FFF3E8', color: '#C2410C', border: '#FED7AA' },
    sponsored: { label: 'Patrocinado', bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
    ai_recommended: { label: 'IA', bg: '#E8FFFB', color: '#0E7490', border: '#A5F3FC' },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold rounded px-1.5 py-0.5 border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border, fontSize: compact ? 10 : 11 }}
    >
      {status === 'ai_recommended' && <Sparkles size={10} />}
      {status === 'ai_recommended' ? 'Recomendado IA' : cfg.label}
    </span>
  );
}
