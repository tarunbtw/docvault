import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[#e5e2da] bg-[#f1eee8] text-neutral-800',
        secondary:
          'border-transparent bg-white text-neutral-700 shadow-2xs',
        outline:
          'border-[#dcd8cf] text-neutral-700 bg-transparent',
        solid:
          'border-black bg-black text-white font-medium',
        warning:
          'border-[#ea4242] bg-[#ea4242] text-white font-medium shadow-xs',
        danger:
          'border-red-200 bg-red-50 text-[#ea4242] font-medium',
        muted:
          'border-[#e8e5df] bg-neutral-100 text-neutral-500',
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
