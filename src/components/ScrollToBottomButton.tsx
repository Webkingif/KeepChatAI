import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onClick,
}) => {
  return (
    <div
      className={`absolute bottom-16 sm:bottom-20 right-4 sm:right-6 md:right-8 z-20 transition-all duration-200 ease-out ${
        visible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Scroll to bottom"
        title="Scroll to latest output"
        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#202c33] text-slate-600 dark:text-[#aebac1] hover:text-[#00a884] dark:hover:text-[#00a884] border border-slate-200 dark:border-[#2a3942] shadow-md hover:shadow-lg active:scale-95 transition-all focus:outline-hidden cursor-pointer group"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] group-hover:translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
