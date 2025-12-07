'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, Plus, TrendingUp, TrendingDown } from 'lucide-react';

interface Assessment {
  id: string;
  userId: string;
  layerScores: Record<string, number>;
  overallScore: number;
  insights: string | null;
  createdAt: string;
}

const layerNames = ['environment', 'biological', 'internal', 'cultural', 'social', 'conscious', 'existential'];
const layerDisplayNames: Record<string, string> = {
  environment: 'Environment',
  biological: 'Biological',
  internal: 'Internal',
  cultural: 'Cultural',
  social: 'Social',
  conscious: 'Conscious',
  existential: 'Existential'
};
const layerColors: Record<string, string> = {
  environment: 'bg-emerald-500',
  biological: 'bg-blue-500',
  internal: 'bg-violet-500',
  cultural: 'bg-amber-500',
  social: 'bg-pink-500',
  conscious: 'bg-purple-500',
  existential: 'bg-orange-500'
};

export default function AssessmentHistoryPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  async function fetchAssessments() {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('demo_user_id');

      if (!userId) {
        router.push('/onboarding');
        return;
      }

      const res = await fetch('/api/assessments');
      const data = await res.json();

      if (data.assessments) {
        const userAssessments = data.assessments.filter(
          (a: Assessment) => a.userId === userId
        );
        setAssessments(userAssessments);
        if (userAssessments.length > 0) {
          setSelectedAssessment(userAssessments[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }

  function calculateTrend(layer: string): { value: number; isPositive: boolean } | null {
    if (assessments.length < 2) return null;
    
    const latest = assessments[0]?.layerScores?.[layer] || 0;
    const previous = assessments[1]?.layerScores?.[layer] || 0;
    
    if (previous === 0) return null;
    
    const change = ((latest - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading assessment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAssessments}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Assessment History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your growth across all 7 layers over time</p>
        </div>
        <Link
          href="/assessments"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No assessments yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Take your first assessment to start tracking your progress</p>
          <Link
            href="/assessments"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Take Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Past Assessments</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {assessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => setSelectedAssessment(assessment)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-600'
                        : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-white">
                        Score: {Number(assessment.overallScore).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAssessment && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Assessment Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(selectedAssessment.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {Number(selectedAssessment.overallScore).toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Layer Scores</h4>
                  {layerNames.map((layer) => {
                    const score = selectedAssessment.layerScores?.[layer] || 0;
                    const trend = calculateTrend(layer);
                    const percentage = (Number(score) / 10) * 100;
                    return (
                      <div key={layer} className="flex items-center gap-4">
                        <div className="w-28 text-sm text-gray-600 dark:text-gray-400">{layerDisplayNames[layer]}</div>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${layerColors[layer]} rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-right">
                          <span className="font-medium text-gray-800 dark:text-white">{Number(score).toFixed(1)}</span>
                          <span className="text-gray-400">/10</span>
                        </div>
                        {trend && (
                          <div className={`w-20 text-right text-sm flex items-center justify-end gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {trend.value}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedAssessment.insights && (
                  <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Insights</h4>
                    <p className="text-indigo-700 dark:text-indigo-200 text-sm">{selectedAssessment.insights}</p>
                  </div>
                )}
              </div>
            )}

            {assessments.length >= 2 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Progress Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {layerNames.slice(0, 4).map((layer) => {
                    const trend = calculateTrend(layer);
                    const latest = assessments[0]?.layerScores?.[layer] || 0;
                    return (
                      <div key={layer} className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{layerDisplayNames[layer]}</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">{Number(latest).toFixed(1)}</p>
                        {trend && (
                          <p className={`text-sm flex items-center justify-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend.value}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
