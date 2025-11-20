import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  label?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Slider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  label,
  className,
  ...props
}: SliderProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label ? (
        <div className="flex justify-between text-xs text-muted">
          <span>{label}</span>
          <span aria-live="polite">{value}</span>
        </div>
      ) : null}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-muted)]"
        style={{ accentColor: 'var(--accent-color)' }}
        onChange={(event) => onValueChange(Number(event.target.value))}
      />
    </div>
  );
}
