import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[#e2ded6] bg-[#f6f4f1] text-neutral-900',
        secondary:
          'border-[#e2ded6] bg-white text-neutral-900 shadow-2xs',
        outline:
          'border-[#dcd8cf] text-neutral-800 bg-transparent',
        solid:
          'border-black bg-black text-white font-bold',
        warning:
          'border-[#ea4242] bg-[#ea4242] text-white font-bold shadow-xs',
        danger:
          'border-[#ea4242] bg-[#ea4242] text-white font-bold shadow-xs',
        muted:
          'border-[#e2ded6] bg-[#ece8e1] text-neutral-600',
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
