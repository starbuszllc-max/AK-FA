import React from 'react';

export function Card({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return <div className={`rounded-xl border ${className}`}>{children}</div>;
}

export default Card;
