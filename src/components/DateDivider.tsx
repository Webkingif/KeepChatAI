import React from 'react';

interface DateDividerProps {
  label: string;
}

export const DateDivider: React.FC<DateDividerProps> = ({ label }) => {
  return (
    <div className="flex justify-center w-full my-3.5 select-none sticky top-2 z-10 pointer-events-none">
      <div className="pointer-events-auto px-3.5 py-1 rounded-lg bg-white/95 dark:bg-[#182229]/95 text-[#54656f] dark:text-[#8696a0] text-[11.5px] font-medium tracking-wider uppercase shadow-2xs border border-slate-200/60 dark:border-black/30 backdrop-blur-xs transition-colors">
        {label}
      </div>
    </div>
  );
};
