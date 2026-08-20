import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'solid', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === 'glass'
            ? 'glass-card'
            : 'bg-white rounded-3xl shadow-xl border border-slate-100',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
