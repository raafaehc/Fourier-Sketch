import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'sm';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary:
        'bg-[var(--accent-color)] text-black hover:bg-[var(--accent-hover-color)] shadow-[0_10px_30px_rgba(0,0,0,0.18)]',
      ghost:
        'bg-[var(--surface-muted)] text-white hover:bg-[var(--surface-muted-hover)] shadow-[0_6px_20px_rgba(0,0,0,0.15)]',
    } as const;
    const sizes = {
      md: 'px-4 py-2 text-sm',
      sm: 'px-3 py-1.5 text-xs',
    } as const;
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
