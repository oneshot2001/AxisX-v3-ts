/**
 * Input — shadcn-style text input primitive.
 *
 * Hairline border, rounded-md, focus ring tinted with axis-yellow.
 * Tabular-friendly height (h-9) and 14px text for form clarity.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-hairline bg-surface px-3 py-1',
        'text-[14px] leading-tight text-ink placeholder:text-ink-faint',
        'shadow-[inset_0_0_0_0_transparent] transition-colors',
        'focus-visible:outline-none focus-visible:border-axis-yellow/60 focus-visible:ring-2 focus-visible:ring-axis-yellow/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-[14px] file:font-medium',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
