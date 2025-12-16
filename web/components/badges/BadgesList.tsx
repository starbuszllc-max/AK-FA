'use client';

import { useEffect, useState } from 'react';
import { BadgeCard } from './BadgeCard';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  layer: string | null;
  earnedAt?: string;
}

interface BadgesData {
  earned: Badge[];
  locked: Badge[];
  newlyEarned: Badge[];
}

interface BadgesListProps {
  userId: string;
}

export function BadgesList({ userId }: BadgesListProps) {
  const [data, setData] = useState<BadgesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewBadge, setShowNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch(`/api/badges?userId=${userId}`);
        const badgesData = await res.json();
        setData(badgesData);
        
        if (badgesData.newlyEarned && badgesData.newlyEarned.length > 0) {
          setShowNewBadge(badgesData.newlyEarned[0]);
          setTimeout(() => setShowNewBadge(null), 5000);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-500 text-sm">Unable to load badges</p>;
  }

  return (
    <div className="space-y-4">
      {showNewBadge && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center animate-bounce pointer-events-auto">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">Badge Earned!</h3>
            <p className="text-green-600 font-semibold mt-2">{showNewBadge.name}</p>
            <p className="text-gray-500 text-sm mt-1">{showNewBadge.description}</p>
          </div>
        </div>
      )}

      {data.earned.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Earned Badges ({data.earned.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {data.earned.map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                description={badge.description}
                icon={badge.icon}
                earnedAt={badge.earnedAt}
              />
            ))}
          </div>
        </div>
      )}

      {data.locked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Locked Badges ({data.locked.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {data.locked.map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                description={badge.description}
                icon={badge.icon}
                locked
              />
            ))}
          </div>
        </div>
      )}

      {data.earned.length === 0 && data.locked.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No badges available yet</p>
      )}
    </div>
  );
}
