'use client';

import { useState, useEffect } from 'react';
import { Award, Star, Lock, Sparkles, Trophy, Flame, Heart, MessageCircle, Zap, Pencil, Book, Feather, Target, Compass, Crown, ClipboardCheck } from 'lucide-react';

interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  layer: string | null;
  earnedAt: string;
}

interface LockedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  layer: string | null;
  requirementType: string;
  requirementValue: number;
}

interface BadgeShowcaseProps {
  userId: string;
  compact?: boolean;
  className?: string;
}

const BADGE_ICONS: Record<string, any> = {
  'pencil': Pencil,
  'book': Book,
  'feather': Feather,
  'message-circle': MessageCircle,
  'messages': MessageCircle,
  'trophy': Trophy,
  'award': Award,
  'clipboard-check': ClipboardCheck,
  'compass': Compass,
  'target': Target,
  'zap': Zap,
  'crown': Crown,
  'flame': Flame,
  'heart': Heart,
  'star': Star,
  'sparkles': Sparkles,
};

export default function BadgeShowcase({ userId, compact = false, className = '' }: BadgeShowcaseProps) {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [lockedBadges, setLockedBadges] = useState<LockedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEarned, setSelectedEarned] = useState<EarnedBadge | null>(null);
  const [selectedLocked, setSelectedLocked] = useState<LockedBadge | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const res = await fetch(`/api/badges?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setEarnedBadges(data.earned || []);
        setLockedBadges(data.locked || []);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBadges = earnedBadges.length + lockedBadges.length;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderEarnedBadge = (badge: EarnedBadge) => {
    const IconComponent = BADGE_ICONS[badge.icon] || Award;

    return (
      <button
        key={badge.id}
        onClick={() => setSelectedEarned(badge)}
        className="relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all hover:scale-105 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400 shadow-md"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        {!compact && (
          <span className="mt-1 text-[10px] font-medium truncate w-full text-center text-purple-600 dark:text-purple-400">
            {badge.name}
          </span>
        )}
      </button>
    );
  };

  const renderLockedBadge = (badge: LockedBadge) => {
    const IconComponent = BADGE_ICONS[badge.icon] || Award;

    return (
      <button
        key={badge.id}
        onClick={() => setSelectedLocked(badge)}
        className="relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all hover:scale-105 bg-gray-100 dark:bg-slate-700/50 border-2 border-dashed border-gray-300 dark:border-slate-600 opacity-60"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
          <Lock className="w-3 h-3 text-gray-400" />
        </div>
        {!compact && (
          <span className="mt-1 text-[10px] font-medium truncate w-full text-center text-gray-400">
            {badge.name}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Badges & Achievements</h3>
            <p className="text-white/80 text-sm">{earnedBadges.length} of {totalBadges} unlocked</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Earned
            </h4>
            <div className={`grid ${compact ? 'grid-cols-6' : 'grid-cols-4'} gap-2`}>
              {earnedBadges.map(renderEarnedBadge)}
            </div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Locked
            </h4>
            <div className={`grid ${compact ? 'grid-cols-6' : 'grid-cols-4'} gap-2`}>
              {lockedBadges.slice(0, compact ? 6 : 8).map(renderLockedBadge)}
            </div>
            {lockedBadges.length > (compact ? 6 : 8) && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                +{lockedBadges.length - (compact ? 6 : 8)} more badges to unlock
              </p>
            )}
          </div>
        )}

        {totalBadges === 0 && (
          <div className="text-center py-6">
            <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Start engaging to earn your first badge!
            </p>
          </div>
        )}
      </div>

      {selectedEarned && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEarned(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                {(() => {
                  const Icon = BADGE_ICONS[selectedEarned.icon] || Award;
                  return <Icon className="w-10 h-10 text-white" />;
                })()}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {selectedEarned.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {selectedEarned.description}
              </p>

              <p className="text-xs text-green-600 dark:text-green-400">
                Earned on {new Date(selectedEarned.earnedAt).toLocaleDateString()}
              </p>

              <button
                onClick={() => setSelectedEarned(null)}
                className="mt-4 px-6 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLocked && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLocked(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const Icon = BADGE_ICONS[selectedLocked.icon] || Award;
                  return <Icon className="w-10 h-10 text-gray-400" />;
                })()}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {selectedLocked.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {selectedLocked.description}
              </p>

              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requirement</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {selectedLocked.requirementType.replace(/_/g, ' ')}: {selectedLocked.requirementValue}
                </p>
              </div>

              <button
                onClick={() => setSelectedLocked(null)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
