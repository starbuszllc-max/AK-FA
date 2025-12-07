'use client';

import React, { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/assessments');
        const data = await res.json();
        setAssessments(data.assessments || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setAssessments([]);
      }
      setLoading(false);
    })();
  }, []);

  function downloadCSV() {
    if (assessments.length === 0) return;
    const rows = assessments.map((a) => ({
      id: a.id,
      user_id: a.userId,
      overall_score: a.overallScore,
      created_at: a.createdAt,
      layer_scores: JSON.stringify(a.layerScores)
    }));
    const csv = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map((r) => Object.values(r).map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessments (Admin)</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          onClick={downloadCSV}
          disabled={loading || assessments.length === 0}
        >
          <FileDown className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No assessments found.
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => (
            <div key={a.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(a.createdAt).toLocaleString()}
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                Score: {Number(a.overallScore).toFixed(1)}
              </div>
              <pre className="text-xs mt-2 bg-gray-50 dark:bg-slate-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(a.layerScores, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
