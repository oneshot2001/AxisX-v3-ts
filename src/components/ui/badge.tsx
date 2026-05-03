import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-ink-muted',
        secondary: 'bg-surface-2 text-ink-muted',
        outline: 'border border-hairline bg-transparent text-ink-muted',
        destructive: 'bg-danger/8 text-danger',
        success: 'bg-success/8 text-success',
        warning: 'bg-warning/10 text-warning',
        cloud: 'bg-cloud/8 text-cloud',
        legacy: 'bg-axis-yellow-soft text-axis-yellow-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { badgeVariants };
