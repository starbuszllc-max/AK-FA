'use client';

interface LayeredBookmarkIconProps {
  isActive?: boolean;
  className?: string;
}

export default function LayeredBookmarkIcon({ isActive = false, className = '' }: LayeredBookmarkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} layered-bookmark-icon`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isActive ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        transition: 'all 0.2s cubic-bezier(0.05, 0, 0, 1)',
        ...(isActive && {
          boxShadow: '0 0 0 4px rgba(250, 204, 21, 0.15)'
        })
      }}
    >
      {/* Bottom layer: Black stroke outline (2px) */}
      <path
        d="M5 2h14a1 1 0 011 1v19l-8-5-8 5V3a1 1 0 011-1z"
        stroke="black"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Middle layer: White fill background */}
      <path
        d="M5 2h14a1 1 0 011 1v19l-8-5-8 5V3a1 1 0 011-1z"
        fill="white"
        opacity={0.95}
      />
      
      {/* Top layer: Colored fill */}
      <path
        d="M5 2h14a1 1 0 011 1v19l-8-5-8 5V3a1 1 0 011-1z"
        fill={isActive ? '#FACC15' : '#FBBF24'}
        opacity={isActive ? 1 : 0.7}
        style={{
          transition: 'fill 0.2s cubic-bezier(0.05, 0, 0, 1), opacity 0.2s cubic-bezier(0.05, 0, 0, 1)'
        }}
      />
    </svg>
  );
}
