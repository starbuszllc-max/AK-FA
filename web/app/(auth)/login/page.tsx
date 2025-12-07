'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('demo_user_id');
    if (userId) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome Back
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Continue your self-discovery journey with Akorfa. If you&apos;re new here, start with onboarding.
      </p>
      <div className="space-y-4">
        <Link
          href="/onboarding"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
        >
          Start Journey
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already started? Your progress is saved in your browser.
        </p>
      </div>
    </div>
  );
}
