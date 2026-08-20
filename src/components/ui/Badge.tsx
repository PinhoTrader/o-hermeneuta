import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type BadgeTone = 'professor' | 'admin' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  professor: 'bg-blue-100 text-blue-600',
  admin: 'bg-red-100 text-red-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-600',
  neutral: 'bg-slate-100 text-slate-600',
};

export function Badge({ tone, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[9px] px-2 py-0.5 font-bold rounded-full uppercase tracking-wide',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
