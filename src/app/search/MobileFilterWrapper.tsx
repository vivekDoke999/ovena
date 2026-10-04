'use client';

import { useState } from 'react';

export function MobileFilterWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 font-bold flex justify-between items-center"
      >
        <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        {children}
      </div>
    </>
  );
}
