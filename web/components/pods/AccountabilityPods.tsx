'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  UserPlus,
  LogOut,
  Crown,
  ChevronRight,
  X,
  Check,
  Loader2,
  Target
} from 'lucide-react';

interface PodMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

interface Pod {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  maxMembers: number;
  focusLayer: string | null;
  isPublic: boolean;
  createdAt: string;
  memberCount: number;
  members: PodMember[];
  isMember: boolean;
}

interface AccountabilityPodsProps {
  userId: string;
}

const layerColors: Record<string, { bg: string; text: string }> = {
  environment: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  bio: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  internal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  cultural: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  social: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  conscious: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  existential: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' }
};

const layerOptions = [
  { value: '', label: 'Any Focus' },
  { value: 'environment', label: 'Environment' },
  { value: 'bio', label: 'Biological' },
  { value: 'internal', label: 'Internal' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'social', label: 'Social' },
  { value: 'conscious', label: 'Conscious' },
  { value: 'existential', label: 'Existential' }
];

export default function AccountabilityPods({ userId }: AccountabilityPodsProps) {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [newPod, setNewPod] = useState({
    name: '',
    description: '',
    focusLayer: '',
    maxMembers: 5
  });

  useEffect(() => {
    fetchPods();
  }, [userId]);

  async function fetchPods() {
    try {
      const res = await fetch(`/api/pods?userId=${userId}`);
      const data = await res.json();
      setPods(data.pods || []);
    } catch (err) {
      console.error('Failed to fetch pods:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePod() {
    if (!newPod.name.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newPod.name,
          description: newPod.description || null,
          focusLayer: newPod.focusLayer || null,
          maxMembers: newPod.maxMembers
        })
      });

      if (res.ok) {
        await fetchPods();
        setShowCreateModal(false);
        setNewPod({
          name: '',
          description: '',
          focusLayer: '',
          maxMembers: 5
        });
      }
    } catch (err) {
      console.error('Failed to create pod:', err);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinPod(podId: string) {
    setActionLoading(podId);
    try {
      const res = await fetch('/api/pods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podId,
          userId,
          action: 'join'
        })
      });

      if (res.ok) {
        await fetchPods();
      }
    } catch (err) {
      console.error('Failed to join pod:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeavePod(podId: string) {
    setActionLoading(podId);
    try {
      const res = await fetch('/api/pods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podId,
          userId,
          action: 'leave'
        })
      });

      if (res.ok) {
        await fetchPods();
      }
    } catch (err) {
      console.error('Failed to leave pod:', err);
    } finally {
      setActionLoading(null);
    }
  }

  const myPods = pods.filter(p => p.isMember);
  const availablePods = pods.filter(p => !p.isMember && p.memberCount < p.maxMembers);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Accountability Pods</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Accountability Pods</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {myPods.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Your Pods</h4>
            <div className="space-y-3">
              {myPods.map((pod) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-100 dark:border-pink-800/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {pod.name}
                        </h4>
                        {pod.focusLayer && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${layerColors[pod.focusLayer]?.bg || 'bg-gray-100'} ${layerColors[pod.focusLayer]?.text || 'text-gray-600'}`}>
                            {pod.focusLayer}
                          </span>
                        )}
                      </div>
                      {pod.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {pod.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                          {pod.members.slice(0, 4).map((member) => (
                            <div
                              key={member.id}
                              className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-medium"
                              title={member.user?.fullName || member.user?.username}
                            >
                              {member.role === 'leader' && (
                                <Crown className="w-3 h-3" />
                              )}
                              {member.role !== 'leader' && (
                                member.user?.username?.[0]?.toUpperCase() || '?'
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {pod.memberCount}/{pod.maxMembers} members
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLeavePod(pod.id)}
                      disabled={actionLoading === pod.id || pod.createdBy === userId}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={pod.createdBy === userId ? "You can't leave your own pod" : "Leave pod"}
                    >
                      {actionLoading === pod.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {availablePods.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Available Pods</h4>
            <div className="space-y-3">
              {availablePods.map((pod) => (
                <motion.div
                  key={pod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {pod.name}
                        </h4>
                        {pod.focusLayer && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${layerColors[pod.focusLayer]?.bg || 'bg-gray-100'} ${layerColors[pod.focusLayer]?.text || 'text-gray-600'}`}>
                            {pod.focusLayer}
                          </span>
                        )}
                      </div>
                      {pod.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {pod.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {pod.memberCount}/{pod.maxMembers} members
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinPod(pod.id)}
                      disabled={actionLoading === pod.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === pod.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Join
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {myPods.length === 0 && availablePods.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              No pods available yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-pink-600 dark:text-pink-400 text-sm font-medium hover:underline"
            >
              Create the first pod
            </button>
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
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Create Accountability Pod</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pod Name
                  </label>
                  <input
                    type="text"
                    value={newPod.name}
                    onChange={(e) => setNewPod(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Mindfulness Crew"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newPod.description}
                    onChange={(e) => setNewPod(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this pod about?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Focus Layer
                  </label>
                  <select
                    value={newPod.focusLayer}
                    onChange={(e) => setNewPod(prev => ({ ...prev, focusLayer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {layerOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Members
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNewPod(prev => ({ ...prev, maxMembers: num }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          newPod.maxMembers === num
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {num} people
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePod}
                  disabled={creating || !newPod.name.trim()}
                  className="flex-1 py-2 px-4 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Pod'
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
