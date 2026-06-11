import { Home } from 'lucide-react';

interface TocTocLogoProps {
  onClick?: () => void;
  inverted?: boolean;
}

export function TocTocLogo({ onClick, inverted }: TocTocLogoProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 shrink-0"
      style={{ background: 'none', border: 'none', padding: 0, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: inverted ? '#37FFDB' : '#3200C1' }}
      >
        <Home size={14} style={{ color: inverted ? '#3200C1' : '#fff' }} />
      </div>
      <span
        className="font-extrabold text-lg tracking-tight"
        style={{ color: inverted ? '#fff' : '#3200C1', letterSpacing: '-0.02em' }}
      >
        toc<span style={{ color: inverted ? '#37FFDB' : '#24018A' }}>·</span>toc
      </span>
    </button>
  );
}
