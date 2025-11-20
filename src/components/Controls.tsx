import { useId } from 'react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import type { DomainRange } from '../lib/domain';
import { RefreshCcw } from 'lucide-react';

export type ControlsProps = {
  harmonics: number;
  onHarmonicsChange: (value: number) => void;
  smoothness: number;
  onSmoothnessChange: (value: number) => void;
  domain: DomainRange;
  onDomainChange: (range: DomainRange) => void;
  penOnly: boolean;
  onPenToggle: (checked: boolean) => void;
  onClear: () => void;
};

export function Controls({
  harmonics,
  onHarmonicsChange,
  smoothness,
  onSmoothnessChange,
  domain,
  onDomainChange,
  penOnly,
  onPenToggle,
  onClear,
}: ControlsProps) {
  const domainStartId = useId();
  const domainEndId = useId();
  const penSwitchId = useId();

  return (
    <section className="glass-card space-y-6 rounded-3xl border border-white/5 p-6" aria-label="Controls">
      <header>
        <h2 className="font-display text-xl text-white">Controls</h2>
        <p className="text-sm text-muted">Adjust harmonics, smoothing, and the active domain while staying in the same viewport as your drawing.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={domainStartId} className="text-xs uppercase tracking-wide text-muted">
          Domain start (a)
          <Input
            id={domainStartId}
            type="number"
            inputMode="decimal"
            value={domain.a}
            onChange={(event) => onDomainChange({ ...domain, a: Number(event.target.value) })}
            className="mt-1"
          />
        </label>
        <label htmlFor={domainEndId} className="text-xs uppercase tracking-wide text-muted">
          Domain end (b)
          <Input
            id={domainEndId}
            type="number"
            inputMode="decimal"
            value={domain.b}
            onChange={(event) => onDomainChange({ ...domain, b: Number(event.target.value) })}
            className="mt-1"
          />
        </label>
      </div>

      <Slider
        label="Harmonics"
        min={1}
        max={50}
        value={harmonics}
        onValueChange={onHarmonicsChange}
      />
      <Slider
        label="Smoothing"
        min={1}
        max={15}
        value={smoothness}
        onValueChange={onSmoothnessChange}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Switch checked={penOnly} onCheckedChange={onPenToggle} label="Pen-only input" id={penSwitchId} />
        <Button variant="ghost" size="sm" onClick={onClear} aria-label="Clear canvas">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

    </section>
  );
}
