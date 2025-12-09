'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ProgressHUD from './ProgressHUD';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';

const HIDDEN_PATHS = ['/', '/onboarding', '/login', '/signup', '/logout', '/dashboard', '/profile'];

export default function ProgressHUDWrapper() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const isVisible = useScrollVisibility({ threshold: 24 });

  useEffect(() => {
    const id = localStorage.getItem('demo_user_id');
    setUserId(id);
  }, []);

  const shouldHide = HIDDEN_PATHS.includes(pathname) || pathname.startsWith('/profile');

  if (shouldHide) {
    return null;
  }

  if (!userId) {
    return null;
  }

  return <ProgressHUD userId={userId} isVisible={isVisible} />;
}
