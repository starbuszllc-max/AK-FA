'use client';

interface LayeredHeartIconProps {
  isActive?: boolean;
  className?: string;
}

export default function LayeredHeartIcon({ isActive = false, className = '' }: LayeredHeartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} layered-heart-icon`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isActive ? 'drop-shadow(0 2px 6px rgba(255,0,0,0.4))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        transition: 'all 0.2s cubic-bezier(0.05, 0, 0, 1)'
      }}
    >
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? '#FF0000' : 'none'}
        style={{
          transition: 'fill 0.2s cubic-bezier(0.05, 0, 0, 1)'
        }}
      />
    </svg>
  );
}
