'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Repeat, 
  Plus, 
  Play, 
  Trash2, 
  Clock, 
  Target,
  ChevronRight,
  X,
  Check,
  Loader2
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  layer: string;
  pointsReward: number;
}

interface RoutineChallenge {
  id: string;
  routineId: string;
  challengeId: string;
  order: number;
}

interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetLayers: string[];
  frequency: string;
  isActive: boolean;
  lastCompletedAt: string | null;
  createdAt: string;
  challenges: RoutineChallenge[];
}

interface SavedRoutinesProps {
  userId: string;
  availableChallenges?: Challenge[];
}

const layerColors: Record<string, string> = {
  environment: 'bg-emerald-500',
  bio: 'bg-rose-500',
  internal: 'bg-purple-500',
  cultural: 'bg-amber-500',
  social: 'bg-blue-500',
  conscious: 'bg-indigo-500',
  existential: 'bg-violet-500'
};

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  custom: 'Custom'
};

export default function SavedRoutines({ userId, availableChallenges = [] }: SavedRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    selectedChallenges: [] as string[]
  });

  useEffect(() => {
    fetchRoutines();
  }, [userId]);

  async function fetchRoutines() {
    try {
      const res = await fetch(`/api/routines?userId=${userId}`);
      const data = await res.json();
      setRoutines(data.routines || []);
    } catch (err) {
      console.error('Failed to fetch routines:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoutine() {
    if (!newRoutine.name.trim()) return;
    
    setCreating(true);
    try {
      const targetLayers = [...new Set(
        availableChallenges
          .filter(c => newRoutine.selectedChallenges.includes(c.id))
          .map(c => c.layer.toLowerCase())
      )];

      const res = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newRoutine.name,
          description: newRoutine.description || null,
          challengeIds: newRoutine.selectedChallenges,
          targetLayers,
          frequency: newRoutine.frequency
        })
      });

      if (res.ok) {
        await fetchRoutines();
        setShowCreateModal(false);
        setNewRoutine({
          name: '',
          description: '',
          frequency: 'daily',
          selectedChallenges: []
        });
      }
    } catch (err) {
      console.error('Failed to create routine:', err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteRoutine(routineId: string) {
    setDeleting(routineId);
    try {
      const res = await fetch(`/api/routines?routineId=${routineId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setRoutines(prev => prev.filter(r => r.id !== routineId));
      }
    } catch (err) {
      console.error('Failed to delete routine:', err);
    } finally {
      setDeleting(null);
    }
  }

  function toggleChallengeSelection(challengeId: string) {
    setNewRoutine(prev => ({
      ...prev,
      selectedChallenges: prev.selectedChallenges.includes(challengeId)
        ? prev.selectedChallenges.filter(id => id !== challengeId)
        : [...prev.selectedChallenges, challengeId]
    }));
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Saved Routines</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Saved Routines</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Repeat className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              No routines saved yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
            >
              Create your first routine
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {routine.name}
                    </h4>
                    {routine.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {routine.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {frequencyLabels[routine.frequency] || routine.frequency}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Target className="w-3 h-3" />
                        {routine.challenges?.length || 0} challenges
                      </span>
                    </div>
                    {routine.targetLayers && routine.targetLayers.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {routine.targetLayers.map((layer) => (
                          <span
                            key={layer}
                            className={`w-2 h-2 rounded-full ${layerColors[layer] || 'bg-gray-400'}`}
                            title={layer}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Start routine"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      disabled={deleting === routine.id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete routine"
                    >
                      {deleting === routine.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Create Routine</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={newRoutine.name}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Growth Routine"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this routine for?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'custom'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setNewRoutine(prev => ({ ...prev, frequency: freq }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          newRoutine.frequency === freq
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {frequencyLabels[freq]}
                      </button>
                    ))}
                  </div>
                </div>

                {availableChallenges.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Challenges
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableChallenges.map((challenge) => (
                        <button
                          key={challenge.id}
                          onClick={() => toggleChallengeSelection(challenge.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            newRoutine.selectedChallenges.includes(challenge.id)
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${layerColors[challenge.layer.toLowerCase()] || 'bg-gray-400'}`} />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {challenge.title}
                            </span>
                          </div>
                          {newRoutine.selectedChallenges.includes(challenge.id) && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoutine}
                  disabled={creating || !newRoutine.name.trim()}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Routine'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
