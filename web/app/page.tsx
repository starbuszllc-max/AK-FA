'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Users, BarChart3, Target, TrendingUp, Layers } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('demo_user_id');
    setIsLoggedIn(!!userId);
    setLoading(false);
  }, []);

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Self-Assessment',
      description: 'Explore your 7 layers of being — from environment to existential purpose.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Stability Metrics',
      description: 'Calculate your system stability using our proprietary formula.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Growth Tracking',
      description: 'Monitor your Akorfa score and watch your personal development over time.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Feed',
      description: 'Share insights and connect with others on their growth journey.'
    }
  ];

  const layers = [
    { name: 'Environment', color: 'bg-emerald-500' },
    { name: 'Biological', color: 'bg-blue-500' },
    { name: 'Internal', color: 'bg-violet-500' },
    { name: 'Cultural', color: 'bg-amber-500' },
    { name: 'Social', color: 'bg-pink-500' },
    { name: 'Conscious', color: 'bg-indigo-500' },
    { name: 'Existential', color: 'bg-orange-500' }
  ];

  return (
    <main className="-mt-4 md:-mt-6 -mx-3 sm:-mx-4 lg:-mx-6">
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-900 text-white py-10 md:py-14 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Discover Your Human Stack
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-5 md:mb-6 max-w-xl mx-auto">
            Akorfa helps you understand, measure, and grow across all 7 layers of your being.
          </p>
          {loading ? (
            <div className="h-10"></div>
          ) : isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/dashboard"
                className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/assessments"
                className="inline-block bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                Take Assessment
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/onboarding"
                className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login"
                className="inline-block bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 md:py-12 px-4 md:px-6 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">The 7 Layers of Being</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm md:text-base max-w-xl mx-auto">
            Our assessment framework explores every dimension of your human experience.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {layers.map((layer, index) => (
              <div 
                key={index}
                className={`${layer.color} text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-sm`}
              >
                {layer.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 px-4 md:px-6 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 md:mb-8 text-gray-900 dark:text-white">How Akorfa Works</h2>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-slate-700 p-4 md:p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-2">{feature.icon}</div>
                <h3 className="text-base md:text-lg font-semibold mb-1 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 px-4 md:px-6 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">Stability Formula</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-5 text-sm md:text-base max-w-xl mx-auto">
            Our proprietary equation measures your system stability across all layers.
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 md:p-6 rounded-xl text-center">
            <div className="font-mono text-lg sm:text-xl md:text-2xl text-indigo-700 dark:text-indigo-300 mb-2 overflow-x-auto">
              S = R × (L + G) / (|L - G| + C - (A × n))
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
              Where S = Stability, R = Resilience, L = Losses, G = Gains, C = Constants, A = Adjustments, n = iterations
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12 px-4 md:px-6 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready to Begin Your Journey?</h2>
          <p className="text-indigo-100 mb-5 text-sm md:text-base">
            Join thousands of others exploring their human potential.
          </p>
          {!loading && !isLoggedIn && (
            <Link 
              href="/onboarding"
              className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Create Free Account
            </Link>
          )}
          {!loading && isLoggedIn && (
            <Link 
              href="/assessments"
              className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2.5 text-sm md:text-base rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Start Your Assessment
            </Link>
          )}
        </div>
      </section>

      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-lg">Akorfa</span>
          </div>
          <p className="text-xs md:text-sm mb-4">Human Stack Platform for Self-Discovery</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-5 text-xs md:text-sm">
            <Link href="/assessments" className="hover:text-white transition-colors">Assessments</Link>
            <Link href="/challenges" className="hover:text-white transition-colors">Challenges</Link>
            <Link href="/insights" className="hover:text-white transition-colors">Insights</Link>
            <Link href="/groups" className="hover:text-white transition-colors">Communities</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
