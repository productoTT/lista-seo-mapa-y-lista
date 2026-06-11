import { formatPrice } from '../../data/mockProperties';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function RangeSlider({ min, max, value, onChange }: RangeSliderProps) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatPrice(value[0])}</span>
        <span>{formatPrice(value[1])}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1 bg-gray-200 rounded" />
        <div
          className="absolute h-1 bg-blue-500 rounded"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />
        <input
          type="range" min={min} max={max} step={5000000}
          value={value[0]}
          onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 5000000), value[1]])}
          className="absolute w-full appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: value[0] > max - (max - min) / 10 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={5000000}
          value={value[1]}
          onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 5000000)])}
          className="absolute w-full appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}
