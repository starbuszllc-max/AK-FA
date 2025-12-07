'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, TrendingUp, Zap, Medal, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  akorfaScore: number;
  totalXp: number;
  level: number;
  currentStreak: number;
}

const tabs = [
  { id: 'xp', label: 'XP', icon: Zap },
  { id: 'score', label: 'Score', icon: TrendingUp },
  { id: 'streak', label: 'Streak', icon: Flame },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState('xp');
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') : null);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  async function fetchLeaderboard(type: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&limit=50`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    }
    setLoading(false);
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          See how you stack up against the community
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-xl border transition-all ${getRankBg(entry.rank)} ${
                entry.id === userId ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 text-center">
                  {getRankIcon(entry.rank) || (
                    <span className={`text-xl font-bold ${
                      entry.rank <= 10 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                    }`}>
                      {entry.rank}
                    </span>
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {(entry.fullName || entry.username || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {entry.fullName || entry.username}
                    {entry.id === userId && (
                      <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Level {entry.level || 1}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {activeTab === 'xp' && `${entry.totalXp || 0} XP`}
                    {activeTab === 'score' && `${entry.akorfaScore.toFixed(1)}`}
                    {activeTab === 'streak' && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-5 h-5 text-orange-500" />
                        {entry.currentStreak || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No users on the leaderboard yet. Be the first!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
