'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Sparkles, 
  TrendingUp,
  Flame,
  Target,
  ChevronRight,
  X,
  Loader2,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface DigestStats {
  pointsEarned: number;
  postsCreated: number;
  activeChallenges: number;
  activitiesCompleted: number;
  streak: number;
}

interface Digest {
  id: string;
  userId: string;
  digestDate: string;
  title: string;
  summary: string;
  highlights: string[];
  stats: DigestStats;
  recommendations: string[];
  isRead: boolean;
  createdAt: string;
}

interface DailyDigestProps {
  userId: string;
}

export default function DailyDigest({ userId }: DailyDigestProps) {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchTodaysDigest();
  }, [userId]);

  async function fetchTodaysDigest() {
    try {
      const res = await fetch(`/api/digest?userId=${userId}`);
      const data = await res.json();
      
      const today = new Date().toISOString().split('T')[0];
      const todaysDigest = (data.digests || []).find(
        (d: Digest) => d.digestDate === today
      );
      
      if (todaysDigest) {
        setDigest(todaysDigest);
      }
    } catch (err) {
      console.error('Failed to fetch digest:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateDigest() {
    setGenerating(true);
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        const data = await res.json();
        setDigest(data.digest);
      }
    } catch (err) {
      console.error('Failed to generate digest:', err);
    } finally {
      setGenerating(false);
    }
  }

  async function markAsRead() {
    if (!digest || digest.isRead) return;
    
    try {
      await fetch('/api/digest', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digestId: digest.id, userId })
      });
      
      setDigest(prev => prev ? { ...prev, isRead: true } : null);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Daily Digest</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Daily Digest</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Get your AI-powered daily summary
          </p>
          <button
            onClick={generateDigest}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Digest
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const stats = digest.stats || {};

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setExpanded(true);
          markAsRead();
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Daily Digest</h3>
            {!digest.isRead && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(digest.digestDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
          {digest.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {stats.pointsEarned > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                +{stats.pointsEarned} pts
              </span>
            )}
            {stats.streak > 0 && (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {stats.streak} day streak
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-orange-500 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    <span className="font-medium">Daily Digest</span>
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white mt-2">{digest.title}</h2>
                <p className="text-green-100 text-sm mt-1">
                  {new Date(digest.digestDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.pointsEarned || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Points Earned</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.streak || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.activeChallenges || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Active Challenges</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <CheckCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.activitiesCompleted || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Activities</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {digest.summary}
                  </p>
                </div>

                {digest.highlights && digest.highlights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Highlights</h4>
                    <ul className="space-y-1">
                      {digest.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {digest.recommendations && digest.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {digest.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                          <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setExpanded(false)}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Got It!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
