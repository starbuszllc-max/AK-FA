'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const hideFooterPaths = ['/', '/live'];
  const shouldHideFooter = hideFooterPaths.includes(pathname);

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="w-full py-2 text-center text-xs text-gray-400 dark:text-gray-600">
      &copy; {currentYear} Akorfa
    </footer>
  );
}
