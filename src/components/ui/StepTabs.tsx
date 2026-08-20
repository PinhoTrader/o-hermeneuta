import React from 'react';

interface StepTabsProps {
  steps: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function StepTabs({ steps, activeIndex, onSelect }: StepTabsProps) {
  return (
    <div className="hidden md:flex gap-1 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = idx < activeIndex;
        return (
          <button
            key={step}
            onClick={() => onSelect(idx)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[80px] ${
              isActive
                ? 'bg-brand-primary text-white shadow-md scale-105'
                : isCompleted
                ? 'text-brand-primary bg-brand-primary/10'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-tight">{step}</span>
          </button>
        );
      })}
    </div>
  );
}
