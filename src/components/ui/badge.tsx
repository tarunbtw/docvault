import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono font-medium tracking-wide uppercase transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-neutral-700 bg-neutral-900 text-neutral-200',
        secondary:
          'border-neutral-800 bg-neutral-950 text-neutral-400',
        outline:
          'border-neutral-700 text-neutral-300',
        solid:
          'border-white bg-white text-neutral-950 font-semibold',
        warning:
          'border-neutral-500 bg-neutral-900 text-neutral-100 font-semibold',
        muted:
          'border-neutral-800 bg-neutral-900/50 text-neutral-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
