'use client';

import { useState } from 'react';
import { Plus, X, Trophy, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LAYERS = [
  { id: 'environment', label: 'Environment', color: 'emerald' },
  { id: 'bio', label: 'Biological', color: 'rose' },
  { id: 'internal', label: 'Internal', color: 'purple' },
  { id: 'cultural', label: 'Cultural', color: 'amber' },
  { id: 'social', label: 'Social', color: 'blue' },
  { id: 'conscious', label: 'Conscious', color: 'indigo' },
  { id: 'existential', label: 'Existential', color: 'violet' },
];

const DURATIONS = [
  { days: 3, label: '3 Days' },
  { days: 7, label: '1 Week' },
  { days: 14, label: '2 Weeks' },
  { days: 30, label: '1 Month' },
];

interface ChallengeCreatorProps {
  userId: string;
  onCreated?: () => void;
}

export default function ChallengeCreator({ userId, onCreated }: ChallengeCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [layer, setLayer] = useState('social');
  const [durationDays, setDurationDays] = useState(7);
  const [pointsReward, setPointsReward] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: title.trim(),
          description: description.trim(),
          layer,
          duration_days: durationDays,
          points_reward: pointsReward
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create challenge');
        return;
      }
      
      setTitle('');
      setDescription('');
      setLayer('social');
      setDurationDays(7);
      setPointsReward(50);
      setIsOpen(false);
      onCreated?.();
    } catch (err) {
      setError('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Challenge
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-500" />
                  Create a Challenge
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., 7-Day Gratitude Journal"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the challenge and what participants should do..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">{description.length}/500</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Focus Layer
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {LAYERS.map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLayer(l.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          layer === l.id
                            ? `bg-${l.color}-500 text-white`
                            : `bg-${l.color}-100 dark:bg-${l.color}-900/30 text-${l.color}-700 dark:text-${l.color}-300 hover:bg-${l.color}-200`
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DURATIONS.map(d => (
                        <button
                          key={d.days}
                          type="button"
                          onClick={() => setDurationDays(d.days)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            durationDays === d.days
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      Reward (pts)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[25, 50, 75, 100].map(pts => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setPointsReward(pts)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            pointsReward === pts
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {pts} pts
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !description.trim()}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {loading ? 'Creating...' : 'Create Challenge'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
