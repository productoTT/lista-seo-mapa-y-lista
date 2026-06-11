import type { BadgeType } from '../../types/property';

const config: Record<BadgeType, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-emerald-500 text-white' },
  price_drop: { label: 'Bajó precio', className: 'bg-amber-500 text-white' },
  opportunity: { label: 'Oportunidad', className: 'bg-violet-600 text-white' },
};

export function Badge({ type }: { type: BadgeType }) {
  const { label, className } = config[type];
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
