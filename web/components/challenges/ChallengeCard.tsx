'use client';
import React, { useState } from 'react';
import { Trophy, Users, Calendar, CheckCircle, Play, Loader2 } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  layer: string;
  duration_days?: number;
  durationDays?: number;
  points_reward?: number;
  pointsReward?: number;
  participant_count?: number;
  participantCount?: number;
  starts_at?: string;
  startsAt?: string;
  ends_at?: string;
  endsAt?: string;
  creator?: {
    username: string | null;
    avatar_url?: string | null;
    avatarUrl?: string | null;
  } | null;
}

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string | null;
  isJoined: boolean;
  onJoin?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
}

const layerColors: Record<string, { bg: string; text: string; border: string }> = {
  environment: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200' },
  bio: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200' },
  internal: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200' },
  cultural: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200' },
  social: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200' },
  conscious: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200' },
  existential: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200' }
};

export default function ChallengeCard({ challenge, currentUserId, isJoined, onJoin, onComplete }: ChallengeCardProps) {
  const [joining, setJoining] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [completed, setCompleted] = useState(false);

  const durationDays = challenge.durationDays || challenge.duration_days || 7;
  const pointsReward = challenge.pointsReward || challenge.points_reward || 50;
  const participantCount = challenge.participantCount || challenge.participant_count || 0;
  const endsAt = challenge.endsAt || challenge.ends_at;

  const handleJoin = async () => {
    if (!currentUserId || joined) return;
    
    setJoining(true);
    try {
      const resp = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          userId: currentUserId,
          action: 'join'
        })
      });
      
      if (resp.ok) {
        setJoined(true);
        onJoin?.(challenge.id);
      } else {
        const data = await resp.json();
        console.error('Failed to join:', data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleComplete = async () => {
    if (!currentUserId || !joined || completed) return;
    
    setCompleting(true);
    try {
      const resp = await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          userId: currentUserId,
          action: 'complete'
        })
      });
      
      if (resp.ok) {
        setCompleted(true);
        onComplete?.(challenge.id);
      } else {
        const data = await resp.json();
        console.error('Failed to complete:', data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const daysRemaining = () => {
    if (!endsAt) return null;
    const end = new Date(endsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const remaining = daysRemaining();
  const layerStyle = layerColors[challenge.layer?.toLowerCase()] || layerColors.social;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${layerStyle.bg} ${layerStyle.text}`}>
              {challenge.layer}
            </span>
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Trophy className="w-3 h-3" />
              +{pointsReward} pts
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{challenge.title}</h3>
        </div>
        <div className="text-2xl">🎯</div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {participantCount} joined
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {durationDays} days
          </span>
        </div>
        {remaining !== null && (
          <span className={remaining <= 2 ? 'text-red-500 font-medium' : ''}>
            {remaining}d left
          </span>
        )}
      </div>

      {challenge.creator?.username && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          Created by @{challenge.creator.username}
        </div>
      )}

      {currentUserId ? (
        completed ? (
          <div className="w-full py-2 px-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed!
          </div>
        ) : joined ? (
          <button 
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {completing ? 'Completing...' : 'Mark Complete'}
          </button>
        ) : (
          <button 
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {joining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {joining ? 'Joining...' : 'Join Challenge'}
          </button>
        )
      ) : (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
          Sign in to join challenges
        </div>
      )}
    </div>
  );
}
