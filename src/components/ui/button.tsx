import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-100 text-neutral-900 shadow hover:bg-neutral-200 active:bg-neutral-300',
        destructive:
          'bg-neutral-900 text-neutral-100 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500',
        outline:
          'border border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-500',
        secondary:
          'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700',
        ghost:
          'hover:bg-neutral-900 text-neutral-300 hover:text-white',
        link: 'text-neutral-300 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-sm px-3 text-[11px]',
        lg: 'h-11 rounded-sm px-6 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
