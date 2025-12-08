'use client';

import { useState, useEffect } from 'react';
import VerticalVideoFeed from '@/components/feed/VerticalVideoFeed';
import CategoryTabs from '@/components/feed/CategoryTabs';

export default function LiveFeedPage() {
  const [category, setCategory] = useState('for-you');
  const [userLayerScores, setUserLayerScores] = useState<Record<string, number> | undefined>();

  useEffect(() => {
    const fetchUserAssessment = async () => {
      try {
        const userId = localStorage.getItem('demo_user_id');
        if (!userId) return;

        const res = await fetch(`/api/assessments?userId=${userId}`);
        const data = await res.json();
        
        if (data.assessments && data.assessments.length > 0) {
          const latestAssessment = data.assessments[0];
          setUserLayerScores(latestAssessment.layerScores);
        }
      } catch (error) {
        console.error('Failed to fetch user assessment:', error);
      }
    };

    fetchUserAssessment();
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      <CategoryTabs
        activeCategory={category}
        onCategoryChange={setCategory}
        variant="overlay"
      />
      <VerticalVideoFeed
        category={category}
        userLayerScores={userLayerScores}
      />
    </div>
  );
}
