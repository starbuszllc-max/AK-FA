'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    localStorage.removeItem('demo_user_id');
    window.location.href = '/';
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <p className="text-gray-600 dark:text-gray-300">Signing out...</p>
    </div>
  );
}
