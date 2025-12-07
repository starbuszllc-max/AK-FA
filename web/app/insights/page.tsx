'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Target, Calendar, ChevronRight, RefreshCw, Lightbulb, Flame } from 'lucide-react';

interface DailyInsight {
  id: string;
  title: string;
  content: string;
  focusLayer: string;
  actionItems: string[];
  isRead: boolean;
  createdAt: string;
}

interface TrendData {
  date: string;
  score: number;
  layer: string;
}

const layerColors: Record<string, string> = {
  environment: 'bg-green-500',
  biological: 'bg-blue-500',
  internal: 'bg-purple-500',
  cultural: 'bg-orange-500',
  social: 'bg-pink-500',
  conscious: 'bg-indigo-500',
  existential: 'bg-red-500',
};

const layerIcons: Record<string, string> = {
  environment: '🌍',
  biological: '🧬',
  internal: '🧠',
  cultural: '🎭',
  social: '👥',
  conscious: '✨',
  existential: '🌌',
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayInsight, setTodayInsight] = useState<DailyInsight | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('demo_user_id');
    setUserId(uid);
    if (uid) {
      fetchInsights(uid);
      fetchTrends(uid);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchInsights(uid: string) {
    try {
      const res = await fetch(`/api/insights?user_id=${uid}`);
      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
        const today = new Date().toISOString().split('T')[0];
        const todaysInsight = data.insights.find((i: DailyInsight) => 
          i.createdAt.startsWith(today)
        );
        setTodayInsight(todaysInsight || null);
      }
      if (data.streak) setStreak(data.streak);
    } catch (err) {
      console.error('Fetch insights error:', err);
    }
    setLoading(false);
  }

  async function fetchTrends(uid: string) {
    try {
      const res = await fetch(`/api/insights/trends?user_id=${uid}`);
      const data = await res.json();
      if (data.trends) setTrends(data.trends);
    } catch (err) {
      console.error('Fetch trends error:', err);
    }
  }

  async function generateInsight() {
    if (!userId) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.insight) {
        setTodayInsight(data.insight);
        setInsights([data.insight, ...insights]);
      }
    } catch (err) {
      console.error('Generate insight error:', err);
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Sparkles className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Personalized Daily Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Get AI-powered insights tailored to your growth journey. Complete onboarding to unlock this feature.
        </p>
        <a
          href="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
        >
          Get Started
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered guidance for your growth journey
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
            <Flame className="w-5 h-5" />
            <span className="font-bold">{streak} day streak</span>
          </div>
        )}
      </div>

      {todayInsight ? (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-80">Today&apos;s Insight</div>
              <div className="font-semibold">{todayInsight.title}</div>
            </div>
          </div>
          <p className="text-lg mb-6 opacity-90">{todayInsight.content}</p>
          {todayInsight.actionItems?.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Action Items
              </div>
              <ul className="space-y-2">
                {todayInsight.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center mb-8 border border-gray-200 dark:border-slate-700">
          <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Generate Today&apos;s Insight
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get personalized guidance based on your progress and goals
          </p>
          <button
            onClick={generateInsight}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Insight
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Score Trends</h3>
          </div>
          {trends.length > 0 ? (
            <div className="h-40 flex items-end gap-1">
              {trends.slice(-14).map((t, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t transition-all hover:bg-indigo-300 dark:hover:bg-indigo-700"
                  style={{ height: `${(t.score / 100) * 100}%` }}
                  title={`${t.date}: ${t.score}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Complete assessments to see your trends
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div key={insight.id} className="flex items-center gap-3 text-sm">
                <div className={`w-8 h-8 rounded-full ${layerColors[insight.focusLayer] || 'bg-gray-400'} flex items-center justify-center text-white`}>
                  {layerIcons[insight.focusLayer] || '📊'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {insight.title}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(insight.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No insights yet. Generate your first one above!
              </p>
            )}
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Past Insights</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${layerColors[insight.focusLayer] || 'bg-gray-400'} flex items-center justify-center text-xl flex-shrink-0`}>
                    {layerIcons[insight.focusLayer] || '📊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {insight.content}
                    </p>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
