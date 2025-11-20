import { cn } from '../../lib/utils';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  id: string;
};

export function Switch({ checked, onCheckedChange, label, id }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          checked ? 'bg-accent/80' : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
    </div>
  );
}
