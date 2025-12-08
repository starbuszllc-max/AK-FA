'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Clock, CheckCircle, Gift, Zap, Camera, MessageSquare, Brain, Users } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  pointsReward: number;
  coinReward: number;
  mediaPrompt?: string;
  layer?: string;
  isCompleted?: boolean;
  expiresAt?: string;
}

const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  creative: <Camera className="w-5 h-5" />,
  social: <MessageSquare className="w-5 h-5" />,
  learning: <Brain className="w-5 h-5" />,
  community: <Users className="w-5 h-5" />
};

const CATEGORY_COLORS: { [key: string]: string } = {
  creative: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  social: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  learning: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  community: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
};

const DIFFICULTY_COLORS: { [key: string]: string } = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Morning Gratitude',
    description: 'Share 3 things you\'re grateful for today in a 10-second video.',
    category: 'creative',
    difficulty: 'easy',
    pointsReward: 15,
    coinReward: 2,
    mediaPrompt: 'Record a short video'
  },
  {
    id: '2',
    title: 'Community Spotlight',
    description: 'What\'s happening in your local community? Share an observation.',
    category: 'community',
    difficulty: 'easy',
    pointsReward: 20,
    coinReward: 3
  },
  {
    id: '3',
    title: 'Insight School Challenge',
    description: 'Explain one concept from Human Behavior OS in your own words.',
    category: 'learning',
    difficulty: 'medium',
    pointsReward: 30,
    coinReward: 5,
    layer: 'internal'
  },
  {
    id: '4',
    title: 'Connect & Support',
    description: 'Leave a thoughtful, helpful comment on someone\'s post.',
    category: 'social',
    difficulty: 'easy',
    pointsReward: 10,
    coinReward: 1
  }
];

export default function DailyChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('demo_user_id');
    setUserId(uid);
    fetchChallenges(uid);
  }, []);

  async function fetchChallenges(uid: string | null) {
    try {
      const url = uid ? `/api/daily-challenges?user_id=${uid}` : '/api/daily-challenges';
      const res = await fetch(url);
      const data = await res.json();
      if (data.challenges && data.challenges.length > 0) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
    setLoading(false);
  }

  async function completeChallenge(challengeId: string) {
    if (!userId || completingId) return;
    
    setCompletingId(challengeId);
    try {
      const res = await fetch('/api/daily-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId
        })
      });

      const data = await res.json();
      if (data.completion) {
        setChallenges(prev => prev.map(c => 
          c.id === challengeId ? { ...c, isCompleted: true } : c
        ));
        setToast({ 
          message: `Completed! +${data.rewards.points} XP, +${data.rewards.coins} coins`, 
          type: 'success' 
        });
        setTimeout(() => setToast(null), 3000);
      } else if (data.error) {
        setToast({ message: data.error, type: 'error' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
    setCompletingId(null);
  }

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalPoints = challenges.filter(c => c.isCompleted).reduce((sum, c) => sum + c.pointsReward, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {toast.message}
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
          <Flame className="w-4 h-4" />
          Daily Challenges
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Today's Challenges
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Complete challenges to earn XP, coins, and keep your streak going!
        </p>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Today's Progress</p>
            <p className="text-2xl font-bold">{completedCount}/{challenges.length} Completed</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Earned Today</p>
            <p className="text-2xl font-bold flex items-center gap-1 justify-end">
              <Zap className="w-5 h-5" />
              {totalPoints} XP
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(completedCount / challenges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 transition-all ${
              challenge.isCompleted ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${CATEGORY_COLORS[challenge.category] || 'bg-gray-100 text-gray-600'}`}>
                {CATEGORY_ICONS[challenge.category] || <Trophy className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {challenge.title}
                  </h3>
                  {challenge.isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    +{challenge.pointsReward} XP
                  </span>
                  {challenge.coinReward > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Gift className="w-3 h-3 text-amber-500" />
                      +{challenge.coinReward} coins
                    </span>
                  )}
                </div>
              </div>
              {!challenge.isCompleted && userId && (
                <button
                  onClick={() => completeChallenge(challenge.id)}
                  disabled={completingId === challenge.id}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {completingId === challenge.id ? 'Completing...' : 'Complete'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!userId && (
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Complete onboarding to participate in daily challenges and earn rewards!
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      )}
    </div>
  );
}
