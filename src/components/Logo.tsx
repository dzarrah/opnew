
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md' }) => {
  const sizes = {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-12'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizes[size]} relative flex items-center justify-center bg-primary rounded-lg shadow-md shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-300 shrink-0`}>
        {/* Abstract Woven Pattern Icon */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="size-5 text-[#111718]" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M4 8h16" />
          <path d="M4 16h16" />
          <path d="M8 4v16" />
          <path d="M16 4v16" />
        </svg>
        {/* Needle/Thread detail */}
        <div className="absolute -bottom-1 -left-1 size-2.5 bg-white dark:bg-[#101f22] rounded-full border-2 border-primary"></div>
      </div>
      <div className="flex flex-col -gap-1">
        <h1 className="text-gray-900 dark:text-white text-xl font-black leading-none tracking-tighter uppercase">
          OP<span className="text-primary">Textile</span>
        </h1>
        <p className="text-[9px] font-bold text-gray-400 dark:text-[#5a7075] uppercase tracking-[0.25em]">
          Textile in Bandung
        </p>
      </div>
    </div>
  );
};

export default Logo;
