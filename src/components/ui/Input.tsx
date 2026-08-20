import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fieldClassName =
  'w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all';
const labelClassName = 'text-xs font-bold uppercase tracking-widest text-slate-400 px-1';
const errorClassName = 'text-xs text-red-500 bg-red-50 p-2 rounded-lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className={labelClassName}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={cn(fieldClassName, className)} {...props} />
        {error && <p className={errorClassName}>{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

type SelectOption = string | { value: string; label: string };

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={selectId} className={labelClassName}>
            {label}
          </label>
        )}
        <select ref={ref} id={selectId} className={cn(fieldClassName, className)} {...props}>
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        {error && <p className={errorClassName}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
