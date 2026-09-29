import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-medium tracking-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white shadow-xs hover:bg-neutral-800 active:bg-neutral-900',
        destructive:
          'bg-[#ea4242] text-white shadow-xs hover:bg-[#d43838] active:bg-[#c22e2e]',
        outline:
          'border border-[#dcd8cf] bg-white text-neutral-800 hover:bg-[#f6f4f1] hover:border-[#b5b1a6]',
        secondary:
          'bg-[#f1eee8] text-neutral-900 hover:bg-[#e8e4dc] border border-transparent',
        ghost:
          'hover:bg-[#f1eee8] text-neutral-700 hover:text-black',
        link: 'text-black underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-full px-3 text-[11px]',
        lg: 'h-11 rounded-full px-6 text-sm',
        icon: 'h-8 w-8 rounded-full',
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
