import React from 'react';

export default function Logo({ size = 'w-9 h-9', showText = true, textClass = 'text-white font-bold text-xl font-display tracking-tight' }) {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className={`${size} rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-all duration-300 overflow-hidden`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hairstyle app theme logo: scissors merged with flowing hair curls */}
          <path
            d="M 8.5 13.5 C 6 13.5 5 15.5 5 17.5 C 5 19.5 6.5 20.5 8.5 20.5 C 10.5 20.5 11.5 18.5 12 13"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 15.5 13.5 C 18 13.5 19 15.5 19 17.5 C 19 19.5 17.5 20.5 15.5 20.5 C 13.5 20.5 12.5 18.5 12 13"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 12 13 C 10 10, 6.5 10.5 7 7 C 7.5 4.5 10.5 4.5 11 6"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 12 13 C 14 10, 17.5 10.5 17 7 C 16.5 4.5 13.5 4.5 13 6"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="13" r="1.5" fill="#fcd34d" />
        </svg>
      </div>
      {showText && <span className={textClass}>StyleSync</span>}
    </div>
  );
}
