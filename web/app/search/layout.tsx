import { Suspense } from 'react';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>{children}</Suspense>;
}
