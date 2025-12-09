'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ProgressHUD from './ProgressHUD';

const HIDDEN_PATHS = ['/', '/onboarding', '/login', '/signup', '/logout'];

export default function ProgressHUDWrapper() {
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const id = localStorage.getItem('demo_user_id');
    setUserId(id);
  }, []);

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  if (!userId) {
    return null;
  }

  return <ProgressHUD userId={userId} />;
}
